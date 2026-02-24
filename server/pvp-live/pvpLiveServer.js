// pvpLiveServer.js — PVP Live 3v3 Turn-based Multiplayer Server
// Socket.IO server with /pvp-live namespace
// Deploy on DigitalOcean alongside Manaya Raid server

import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = process.env.PVP_LIVE_PORT || 3003;

const CORS_ORIGINS = [
  'https://builderberu.com',
  'http://localhost:5173',
  'http://localhost:3000',
];

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const DRAFT_SEQUENCE = [
  'p1_ban', 'p2_ban', 'p1_ban', 'p2_ban',
  'p1_pick', 'p2_pick', 'p2_pick', 'p1_pick', 'p1_pick', 'p2_pick',
];

const TIMERS = {
  draft: 90,     // 1min30
  equip: 120,    // 2min
  battle: 300,   // 5min
  turn: 30,      // 30s per turn
};

const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars

function generateRoomCode() {
  let code = '';
  for (let i = 0; i < 6; i++) code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  return code;
}

// ═══════════════════════════════════════════════════════════════
// ROOM STATE
// ═══════════════════════════════════════════════════════════════

const rooms = new Map();
const matchQueue = []; // for auto-matchmaking

function createRoom(hostSocket, hostName) {
  let code;
  do { code = generateRoomCode(); } while (rooms.has(code));

  const room = {
    code,
    phase: 'waiting', // waiting | draft | equip | battle | finished
    p1: { socketId: hostSocket.id, name: hostName, pool: [], picks: [], ready: false },
    p2: null,
    bans: { p1: [], p2: [] },
    draftStep: 0,
    draftPool: [],
    battleState: null,
    timers: { phase: 0, turn: 0 },
    timerInterval: null,
    createdAt: Date.now(),
  };

  rooms.set(code, room);
  hostSocket.join(code);
  return room;
}

function destroyRoom(code) {
  const room = rooms.get(code);
  if (!room) return;
  if (room.timerInterval) clearInterval(room.timerInterval);
  rooms.delete(code);
}

function getPlayerRole(room, socketId) {
  if (room.p1?.socketId === socketId) return 'p1';
  if (room.p2?.socketId === socketId) return 'p2';
  return null;
}

function getOpponentRole(role) {
  return role === 'p1' ? 'p2' : 'p1';
}

// ═══════════════════════════════════════════════════════════════
// TIMER MANAGEMENT
// ═══════════════════════════════════════════════════════════════

function startPhaseTimer(io, room, phase, duration, onExpire) {
  if (room.timerInterval) clearInterval(room.timerInterval);
  room.phase = phase;
  room.timers.phase = duration;

  room.timerInterval = setInterval(() => {
    room.timers.phase -= 1;
    io.to(room.code).emit('timer-tick', { phase, remaining: room.timers.phase });

    if (room.timers.phase <= 0) {
      clearInterval(room.timerInterval);
      room.timerInterval = null;
      onExpire();
    }
  }, 1000);
}

function startTurnTimer(io, room, onExpire) {
  room.timers.turn = TIMERS.turn;

  // Clear existing turn timer if any
  if (room._turnInterval) clearInterval(room._turnInterval);

  room._turnInterval = setInterval(() => {
    room.timers.turn -= 1;
    io.to(room.code).emit('turn-tick', { remaining: room.timers.turn });

    if (room.timers.turn <= 0) {
      clearInterval(room._turnInterval);
      room._turnInterval = null;
      onExpire();
    }
  }, 1000);
}

function clearTurnTimer(room) {
  if (room._turnInterval) {
    clearInterval(room._turnInterval);
    room._turnInterval = null;
  }
}

// ═══════════════════════════════════════════════════════════════
// DRAFT LOGIC
// ═══════════════════════════════════════════════════════════════

function startDraft(io, room) {
  // Merge both players' pools (intersection — only hunters both own)
  const p1Pool = new Set(room.p1.pool);
  const p2Pool = new Set(room.p2.pool);
  const sharedPool = [...p1Pool].filter(id => p2Pool.has(id));

  if (sharedPool.length < 10) {
    io.to(room.code).emit('error', { message: 'Pas assez de hunters en commun (min 10)' });
    destroyRoom(room.code);
    return;
  }

  room.draftPool = sharedPool;
  room.draftStep = 0;
  room.bans = { p1: [], p2: [] };
  room.p1.picks = [];
  room.p2.picks = [];

  io.to(room.code).emit('draft-start', {
    pool: room.draftPool,
    sequence: DRAFT_SEQUENCE,
  });

  startPhaseTimer(io, room, 'draft', TIMERS.draft, () => {
    // Auto-complete remaining draft steps with random
    autoCompleteDraft(io, room);
  });

  emitDraftState(io, room);
}

function emitDraftState(io, room) {
  const step = room.draftStep;
  const action = step < DRAFT_SEQUENCE.length ? DRAFT_SEQUENCE[step] : null;
  const currentPlayer = action?.startsWith('p1') ? 'p1' : action?.startsWith('p2') ? 'p2' : null;
  const actionType = action?.includes('ban') ? 'ban' : 'pick';

  io.to(room.code).emit('draft-update', {
    step: room.draftStep,
    bans: room.bans,
    picks: { p1: room.p1.picks, p2: room.p2.picks },
    pool: room.draftPool,
    currentPlayer,
    actionType,
    isDone: room.draftStep >= DRAFT_SEQUENCE.length,
  });
}

function processDraftAction(io, room, role, hunterId) {
  const step = room.draftStep;
  if (step >= DRAFT_SEQUENCE.length) return false;

  const action = DRAFT_SEQUENCE[step];
  const expectedRole = action.startsWith('p1') ? 'p1' : 'p2';
  if (role !== expectedRole) return false;

  // Validate hunter is in pool
  if (!room.draftPool.includes(hunterId)) return false;

  // Check not already banned/picked
  const allUsed = [...room.bans.p1, ...room.bans.p2, ...room.p1.picks, ...room.p2.picks];
  if (allUsed.includes(hunterId)) return false;

  if (action.includes('ban')) {
    room.bans[role].push(hunterId);
  } else {
    room[role].picks.push(hunterId);
  }

  // Remove from pool
  room.draftPool = room.draftPool.filter(id => id !== hunterId);
  room.draftStep += 1;

  emitDraftState(io, room);

  // Check if draft is complete
  if (room.draftStep >= DRAFT_SEQUENCE.length) {
    setTimeout(() => startEquipPhase(io, room), 1500);
  }

  return true;
}

function autoCompleteDraft(io, room) {
  while (room.draftStep < DRAFT_SEQUENCE.length) {
    const action = DRAFT_SEQUENCE[room.draftStep];
    const role = action.startsWith('p1') ? 'p1' : 'p2';
    const pick = room.draftPool[0]; // just pick first available
    if (!pick) break;

    if (action.includes('ban')) {
      room.bans[role].push(pick);
    } else {
      room[role].picks.push(pick);
    }
    room.draftPool = room.draftPool.filter(id => id !== pick);
    room.draftStep += 1;
  }

  emitDraftState(io, room);
  setTimeout(() => startEquipPhase(io, room), 1000);
}

// ═══════════════════════════════════════════════════════════════
// EQUIP PHASE
// ═══════════════════════════════════════════════════════════════

function startEquipPhase(io, room) {
  room.p1.ready = false;
  room.p2.ready = false;

  io.to(room.code).emit('equip-start', {
    p1Picks: room.p1.picks,
    p2Picks: room.p2.picks,
  });

  startPhaseTimer(io, room, 'equip', TIMERS.equip, () => {
    startBattlePhase(io, room);
  });
}

function playerEquipReady(io, room, role) {
  room[role].ready = true;
  io.to(room.code).emit('equip-player-ready', { role });

  if (room.p1.ready && room.p2.ready) {
    if (room.timerInterval) clearInterval(room.timerInterval);
    startBattlePhase(io, room);
  }
}

// ═══════════════════════════════════════════════════════════════
// BATTLE PHASE
// ═══════════════════════════════════════════════════════════════

function startBattlePhase(io, room) {
  // Battle state is computed client-side (both players build fighters locally)
  // Server only validates turn order and relays actions
  room.battleState = {
    currentTurn: 0,
    round: 1,
    turnOrder: [], // will be set by first client sync
    p1Alive: 3,
    p2Alive: 3,
    actions: [],
  };

  io.to(room.code).emit('battle-start', {
    p1Picks: room.p1.picks,
    p2Picks: room.p2.picks,
  });

  startPhaseTimer(io, room, 'battle', TIMERS.battle, () => {
    // Time's up — broadcast timeout, clients compare HP%
    io.to(room.code).emit('battle-timeout', {});
    endBattle(io, room, null); // null = clients decide locally
  });
}

function processBattleAction(io, room, role, action) {
  // action = { skillIdx, targetIdx, targetSide }
  // Server validates it's this player's turn, then broadcasts to opponent
  const bs = room.battleState;
  if (!bs) return false;

  // Determine whose turn it is based on turnOrder
  // For simplicity: server trusts clients for turn order but validates role
  const expectedRole = action.expectedRole;
  if (expectedRole && expectedRole !== role) return false;

  clearTurnTimer(room);

  // Record and broadcast
  bs.actions.push({ role, ...action, turn: bs.currentTurn, round: bs.round });
  const opponentRole = getOpponentRole(role);

  // Broadcast to opponent
  io.to(room.code).emit('battle-action', {
    from: role,
    ...action,
  });

  // Start next turn timer
  startTurnTimer(io, room, () => {
    // Turn timeout — auto-pass
    io.to(room.code).emit('battle-auto-pass', {
      role: getOpponentRole(role), // whoever's turn was next
    });
  });

  return true;
}

function processBattleSync(io, room, role, syncData) {
  // Client sends sync data (HP states, KOs) for validation
  // Server trusts client but broadcasts to ensure both sides agree
  const bs = room.battleState;
  if (!bs) return;

  if (syncData.turnOrder && bs.actions.length === 0) {
    bs.turnOrder = syncData.turnOrder;
  }

  bs.currentTurn = syncData.currentTurn || bs.currentTurn;
  bs.round = syncData.round || bs.round;

  // Broadcast sync to opponent
  const opponentRole = getOpponentRole(role);
  const opponentSocket = role === 'p1' ? room.p2?.socketId : room.p1?.socketId;
  if (opponentSocket) {
    io.to(opponentSocket).emit('battle-sync', { from: role, ...syncData });
  }
}

function processBattleEnd(io, room, role, result) {
  // Player reports battle ended
  endBattle(io, room, result.winner === role ? role : getOpponentRole(role));
}

function endBattle(io, room, winnerRole) {
  if (room.timerInterval) clearInterval(room.timerInterval);
  clearTurnTimer(room);
  room.phase = 'finished';

  io.to(room.code).emit('battle-end', {
    winner: winnerRole,
  });

  // Destroy room after 30s
  setTimeout(() => destroyRoom(room.code), 30000);
}

// ═══════════════════════════════════════════════════════════════
// MATCHMAKING
// ═══════════════════════════════════════════════════════════════

function addToMatchQueue(socket, name, pool) {
  // Remove if already in queue
  const idx = matchQueue.findIndex(q => q.socketId === socket.id);
  if (idx >= 0) matchQueue.splice(idx, 1);

  matchQueue.push({ socketId: socket.id, socket, name, pool, joinedAt: Date.now() });

  // Try to match
  if (matchQueue.length >= 2) {
    const p1Entry = matchQueue.shift();
    const p2Entry = matchQueue.shift();

    const room = createRoom(p1Entry.socket, p1Entry.name);
    room.p1.pool = p1Entry.pool;

    room.p2 = { socketId: p2Entry.socket.id, name: p2Entry.name, pool: p2Entry.pool, picks: [], ready: false };
    p2Entry.socket.join(room.code);

    io.to(room.code).emit('match-found', {
      code: room.code,
      p1: { name: room.p1.name },
      p2: { name: room.p2.name },
    });

    // Start draft after short delay
    setTimeout(() => startDraft(io, room), 2000);
  } else {
    socket.emit('queue-status', { position: matchQueue.length, waiting: true });
  }
}

function removeFromMatchQueue(socketId) {
  const idx = matchQueue.findIndex(q => q.socketId === socketId);
  if (idx >= 0) matchQueue.splice(idx, 1);
}

// ═══════════════════════════════════════════════════════════════
// HTTP SERVER + SOCKET.IO
// ═══════════════════════════════════════════════════════════════

const httpServer = createServer((req, res) => {
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'PVP Live Server',
      version: '0.1.0',
      uptime: Math.floor(process.uptime()),
      rooms: rooms.size,
      queue: matchQueue.length,
    }));
    return;
  }
  res.writeHead(404);
  res.end('Not found');
});

const io = new Server(httpServer, {
  path: '/pvp-live/socket.io',
  cors: {
    origin: CORS_ORIGINS,
    methods: ['GET', 'POST'],
  },
});

// ═══════════════════════════════════════════════════════════════
// SOCKET.IO (custom path: /pvp-live/socket.io)
// ═══════════════════════════════════════════════════════════════

io.on('connection', (socket) => {
  console.log(`[PVP Live] Connected: ${socket.id}`);
  let currentRoom = null;

  // ─── LOBBY ─────────────────────────────────────────────────

  socket.on('create-room', ({ name, pool }) => {
    if (currentRoom) return socket.emit('error', { message: 'Deja dans une room' });
    const room = createRoom(socket, name || 'Joueur');
    room.p1.pool = pool || [];
    currentRoom = room.code;
    socket.emit('room-created', { code: room.code });
    console.log(`[PVP Live] Room ${room.code} created by ${name}`);
  });

  socket.on('join-room', ({ code, name, pool }) => {
    if (currentRoom) return socket.emit('error', { message: 'Deja dans une room' });
    const room = rooms.get(code?.toUpperCase());
    if (!room) return socket.emit('error', { message: 'Room introuvable' });
    if (room.p2) return socket.emit('error', { message: 'Room pleine' });
    if (room.phase !== 'waiting') return socket.emit('error', { message: 'Partie deja en cours' });

    room.p2 = { socketId: socket.id, name: name || 'Joueur 2', pool: pool || [], picks: [], ready: false };
    socket.join(code);
    currentRoom = code;

    io.to(code).emit('room-joined', {
      code,
      p1: { name: room.p1.name },
      p2: { name: room.p2.name },
    });

    console.log(`[PVP Live] ${name} joined room ${code}`);

    // Start draft after short delay
    setTimeout(() => startDraft(io, room), 2000);
  });

  socket.on('matchmake', ({ name, pool }) => {
    if (currentRoom) return socket.emit('error', { message: 'Deja dans une room' });
    addToMatchQueue(socket, name || 'Joueur', pool || []);
    console.log(`[PVP Live] ${name} joined matchmaking queue (${matchQueue.length} in queue)`);
  });

  socket.on('cancel-matchmake', () => {
    removeFromMatchQueue(socket.id);
    socket.emit('queue-status', { waiting: false });
  });

  // ─── DRAFT ─────────────────────────────────────────────────

  socket.on('draft-action', ({ hunterId }) => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room || room.phase !== 'draft') return;

    const role = getPlayerRole(room, socket.id);
    if (!role) return;

    const success = processDraftAction(io, room, role, hunterId);
    if (!success) {
      socket.emit('error', { message: 'Action invalide' });
    }
  });

  // ─── EQUIP ─────────────────────────────────────────────────

  socket.on('equip-ready', () => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room || room.phase !== 'equip') return;

    const role = getPlayerRole(room, socket.id);
    if (!role) return;

    playerEquipReady(io, room, role);
  });

  // ─── BATTLE ────────────────────────────────────────────────

  socket.on('battle-action', (action) => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room || room.phase !== 'battle') return;

    const role = getPlayerRole(room, socket.id);
    if (!role) return;

    processBattleAction(io, room, role, action);
  });

  socket.on('battle-sync', (syncData) => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room || room.phase !== 'battle') return;

    const role = getPlayerRole(room, socket.id);
    if (!role) return;

    processBattleSync(io, room, role, syncData);
  });

  socket.on('battle-end', (result) => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room) return;

    const role = getPlayerRole(room, socket.id);
    if (!role) return;

    processBattleEnd(io, room, role, result);
  });

  // ─── DISCONNECT ────────────────────────────────────────────

  socket.on('disconnect', () => {
    console.log(`[PVP Live] Disconnected: ${socket.id}`);

    // Remove from matchmaking queue
    removeFromMatchQueue(socket.id);

    // Handle room disconnect
    if (currentRoom) {
      const room = rooms.get(currentRoom);
      if (room) {
        const role = getPlayerRole(room, socket.id);
        if (role && room.phase !== 'finished' && room.phase !== 'waiting') {
          // Forfeit — opponent wins
          const winner = getOpponentRole(role);
          io.to(currentRoom).emit('opponent-left', { forfeitRole: role, winner });
          endBattle(io, room, winner);
        } else if (room.phase === 'waiting') {
          // Room was waiting, just destroy
          destroyRoom(currentRoom);
        }
      }
      currentRoom = null;
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════════════

httpServer.listen(PORT, () => {
  console.log('═══════════════════════════════════════');
  console.log('  ⚔️  PVP Live Server v0.1.0');
  console.log(`  🌐 HTTP:  http://localhost:${PORT}`);
  console.log(`  🔌 WS:    ws://localhost:${PORT}/pvp-live`);
  console.log(`  📊 Rooms: ${rooms.size}`);
  console.log('═══════════════════════════════════════');
});

process.on('SIGTERM', () => {
  console.log('[PVP Live] Shutting down...');
  rooms.forEach((_, code) => destroyRoom(code));
  httpServer.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('[PVP Live] Interrupted...');
  rooms.forEach((_, code) => destroyRoom(code));
  httpServer.close(() => process.exit(0));
});
