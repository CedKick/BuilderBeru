import { ROOM, DIFFICULTY } from '../config.js';
import { GameLoop } from '../game/GameLoop.js';
import { generateBotId, pickBotClasses, pickBotName } from '../game/BotAI.js';
import { preloadCustomBoss } from '../bosses/BossFactory.js';

export class RoomManager {
  constructor(wsServer) {
    this.wsServer = wsServer;
    this.rooms = new Map(); // code -> Room
  }

  // Lazily set wsServer (circular dep with WebSocketServer)
  setWsServer(wsServer) {
    this.wsServer = wsServer;
  }

  createRoom(ws, client, msg) {
    if (client.roomCode) {
      this._send(ws, { type: 'error', message: 'Already in a room' });
      return;
    }

    const code = this._generateCode();
    const room = {
      code,
      host: client.id,
      difficulty: 'NORMAL',
      simulation: false, // Training mode (god mode)
      state: 'waiting', // waiting | countdown | playing | finished
      players: new Map(), // clientId -> PlayerSlot
      gameLoop: null,
      countdownTimer: null,
    };

    // Add host to room
    room.players.set(client.id, {
      id: client.id,
      username: client.username,
      class: null,
      ready: false,
    });

    this.rooms.set(code, room);
    client.roomCode = code;

    this._send(ws, {
      type: 'room_created',
      code,
      room: this._serializeRoom(room),
    });

    console.log(`[Room] Created ${code} by ${client.username}`);
  }

  joinRoom(ws, client, msg) {
    if (client.roomCode) {
      this._send(ws, { type: 'error', message: 'Already in a room' });
      return;
    }

    const code = (msg.code || '').toUpperCase();
    const room = this.rooms.get(code);

    if (!room) {
      this._send(ws, { type: 'error', message: 'Room not found' });
      return;
    }
    if (room.state !== 'waiting') {
      this._send(ws, { type: 'error', message: 'Game already in progress' });
      return;
    }
    if (room.players.size >= ROOM.MAX_PLAYERS) {
      this._send(ws, { type: 'error', message: 'Room is full' });
      return;
    }

    room.players.set(client.id, {
      id: client.id,
      username: client.username,
      class: null,
      ready: false,
    });

    client.roomCode = code;

    // Notify joiner
    this._send(ws, {
      type: 'room_joined',
      code,
      room: this._serializeRoom(room),
    });

    // Notify others
    this.wsServer.broadcast(code, {
      type: 'player_joined',
      player: { id: client.id, username: client.username },
      room: this._serializeRoom(room),
    });

    console.log(`[Room] ${client.username} joined ${code} (${room.players.size}/${ROOM.MAX_PLAYERS})`);
  }

  leaveRoom(ws, client) {
    const code = client.roomCode;
    if (!code) return;

    const room = this.rooms.get(code);
    if (!room) {
      client.roomCode = null;
      return;
    }

    room.players.delete(client.id);
    if (room.spectators) room.spectators.delete(ws);
    client.roomCode = null;

    // If game is running and player leaves, mark them as disconnected
    if (room.gameLoop) {
      room.gameLoop.handlePlayerDisconnect(client.id);
    }

    // Spectator rooms: destroy when no spectators left
    if (room.isSpectatorRoom) {
      const hasSpectators = room.spectators && room.spectators.size > 0;
      if (!hasSpectators) {
        if (room.gameLoop) room.gameLoop.stop();
        this.rooms.delete(room.code);
        console.log(`[Spectator] Room ${room.code} destroyed (no spectators)`);
        return;
      }
    }

    if (room.players.size === 0) {
      // Destroy empty room
      if (room.gameLoop) room.gameLoop.stop();
      if (room.countdownTimer) clearInterval(room.countdownTimer);
      this.rooms.delete(code);
      console.log(`[Room] ${code} destroyed (empty)`);
      return;
    }

    // Transfer host if needed
    if (room.host === client.id) {
      const newHost = room.players.keys().next().value;
      room.host = newHost;
      this.wsServer.broadcast(code, {
        type: 'new_host',
        hostId: newHost,
      });
    }

    this.wsServer.broadcast(code, {
      type: 'player_left',
      playerId: client.id,
      room: this._serializeRoom(room),
    });

    console.log(`[Room] ${client.username} left ${code}`);
  }

  selectClass(ws, client, msg) {
    const room = this._getRoom(client);
    if (!room || room.state !== 'waiting') return;

    const validClasses = ['tank', 'healer', 'dps_cac', 'dps_range', 'berserker', 'mage'];
    if (!validClasses.includes(msg.class)) {
      this._send(ws, { type: 'error', message: 'Invalid class' });
      return;
    }

    const slot = room.players.get(client.id);
    if (slot) {
      slot.class = msg.class;
      slot.ready = false; // Reset ready when changing class

      this.wsServer.broadcast(room.code, {
        type: 'class_selected',
        playerId: client.id,
        class: msg.class,
        room: this._serializeRoom(room),
      });
    }
  }

  selectHunters(ws, client, msg) {
    const room = this._getRoom(client);
    if (!room || room.state !== 'waiting') return;

    const slot = room.players.get(client.id);
    if (!slot) return;

    slot.mainHunter = msg.mainHunter || null;
    slot.supportHunters = (msg.supportHunters || []).slice(0, 3);
    slot.hunterLevel = msg.hunterLevel || 30;
    slot.hunterStars = msg.hunterStars || 0;

    this.wsServer.broadcast(room.code, {
      type: 'hunters_selected',
      playerId: client.id,
      mainHunter: slot.mainHunter,
      supportHunters: slot.supportHunters,
      room: this._serializeRoom(room),
    });
  }

  selectDifficulty(ws, client, msg) {
    const room = this._getRoom(client);
    if (!room || room.state !== 'waiting') return;
    if (room.host !== client.id) {
      this._send(ws, { type: 'error', message: 'Only host can change difficulty' });
      return;
    }

    if (!DIFFICULTY[msg.difficulty]) {
      this._send(ws, { type: 'error', message: 'Invalid difficulty' });
      return;
    }

    room.difficulty = msg.difficulty;
    this.wsServer.broadcast(room.code, {
      type: 'difficulty_changed',
      difficulty: msg.difficulty,
      room: this._serializeRoom(room),
    });
  }

  selectBoss(ws, client, msg) {
    const room = this._getRoom(client);
    if (!room || room.state !== 'waiting') return;
    if (room.host !== client.id) {
      this._send(ws, { type: 'error', message: 'Only host can select boss' });
      return;
    }

    const bossId = msg.bossId || 'manaya';
    room.selectedBossId = bossId;
    this.wsServer.broadcast(room.code, {
      type: 'boss_selected',
      bossId,
      room: this._serializeRoom(room),
    });
    console.log(`[Room] ${room.code} boss selected: ${bossId}`);
  }

  setSimulation(ws, client, msg) {
    const room = this._getRoom(client);
    if (!room || room.state !== 'waiting') return;
    if (room.host !== client.id) {
      this._send(ws, { type: 'error', message: 'Only host can toggle simulation' });
      return;
    }

    room.simulation = !!msg.enabled;
    this.wsServer.broadcast(room.code, {
      type: 'simulation_changed',
      simulation: room.simulation,
      room: this._serializeRoom(room),
    });
  }

  playerReady(ws, client) {
    const room = this._getRoom(client);
    if (!room || room.state !== 'waiting') return;

    const slot = room.players.get(client.id);
    if (!slot) return;

    if (!slot.class) {
      this._send(ws, { type: 'error', message: 'Select a class first' });
      return;
    }

    slot.ready = !slot.ready;

    this.wsServer.broadcast(room.code, {
      type: 'ready_changed',
      playerId: client.id,
      ready: slot.ready,
      room: this._serializeRoom(room),
    });

    // Check if all players are ready
    this._checkAllReady(room);
  }

  handleInput(client, msg) {
    const room = this._getRoom(client);
    if (!room || room.state !== 'playing' || !room.gameLoop) return;

    room.gameLoop.queueInput(client.id, msg.input);
  }

  addBots(ws, client, msg) {
    const room = this._getRoom(client);
    if (!room || room.state !== 'waiting') return;
    if (room.host !== client.id) {
      this._send(ws, { type: 'error', message: 'Only host can add bots' });
      return;
    }

    const count = Math.max(0, Math.min(4, parseInt(msg.count) || 0));

    // Remove existing bots first
    for (const [id, slot] of room.players) {
      if (slot.isBot) room.players.delete(id);
    }

    if (count === 0) {
      this.wsServer.broadcast(room.code, {
        type: 'bots_updated',
        room: this._serializeRoom(room),
      });
      return;
    }

    // Find player's class to pick good comp
    const hostSlot = room.players.get(client.id);
    const playerClass = hostSlot?.class || 'dps_cac';
    const botClasses = pickBotClasses(playerClass, count);
    const usedNames = new Set([...room.players.values()].map(p => p.username));

    for (let i = 0; i < count; i++) {
      const botId = generateBotId();
      const botName = pickBotName(usedNames);
      usedNames.add(botName);

      room.players.set(botId, {
        id: botId,
        username: botName,
        class: botClasses[i],
        ready: true,
        isBot: true,
      });
    }

    this.wsServer.broadcast(room.code, {
      type: 'bots_updated',
      room: this._serializeRoom(room),
    });

    console.log(`[Room] ${count} bots added to ${room.code} (classes: ${botClasses.join(', ')})`);
  }

  _checkAllReady(room) {
    if (room.players.size < ROOM.MIN_PLAYERS) return;

    const allReady = [...room.players.values()].every(p => p.ready);
    if (!allReady) {
      // Cancel countdown if someone unreadied
      if (room.countdownTimer) {
        clearInterval(room.countdownTimer);
        room.countdownTimer = null;
        room.state = 'waiting';
        this.wsServer.broadcast(room.code, { type: 'countdown_cancelled' });
      }
      return;
    }

    // Start countdown
    room.state = 'countdown';
    let countdown = ROOM.READY_COUNTDOWN;

    // Pre-load custom boss config during countdown (async, non-blocking)
    const bossId = room.selectedBossId || 'manaya';
    if (bossId !== 'manaya') {
      preloadCustomBoss(bossId).catch(err => console.warn('[Room] Boss preload error:', err.message));
    }

    this.wsServer.broadcast(room.code, {
      type: 'countdown_start',
      seconds: countdown,
    });

    room.countdownTimer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(room.countdownTimer);
        room.countdownTimer = null;
        this._startGame(room);
      } else {
        this.wsServer.broadcast(room.code, {
          type: 'countdown_tick',
          seconds: countdown,
        });
      }
    }, 1000);
  }

  _startGame(room) {
    room.state = 'playing';

    // Build player defs with colosseum data + room hunter selections
    const players = [...room.players.values()].map(p => {
      // Start with synced colosseum data (from real ShadowColosseum client)
      const colosseumData = this._getClientColosseumData(p.id) || {};

      // Merge in room-level hunter selections (from lobby UI)
      if (p.mainHunter) colosseumData.mainHunter = p.mainHunter;
      if (p.supportHunters) colosseumData.equippedHunters = p.supportHunters;
      if (!colosseumData.hunterLevels) colosseumData.hunterLevels = {};
      if (!colosseumData.hunterStars) colosseumData.hunterStars = {};

      // Apply default level/stars from room selection to all hunters
      const defaultLevel = p.hunterLevel || 30;
      const defaultStars = p.hunterStars || 0;
      const allHunters = [p.mainHunter, ...(p.supportHunters || [])].filter(Boolean);
      for (const hId of allHunters) {
        if (!colosseumData.hunterLevels[hId]) colosseumData.hunterLevels[hId] = defaultLevel;
        if (!colosseumData.hunterStars[hId]) colosseumData.hunterStars[hId] = defaultStars;
      }

      return {
        id: p.id,
        username: p.username,
        class: p.class,
        isBot: p.isBot || false,
        colosseumData: Object.keys(colosseumData).length > 0 ? colosseumData : null,
      };
    });

    const bossId = room.selectedBossId || 'manaya';
    room.gameLoop = new GameLoop(room.code, players, room.difficulty, this.wsServer, room.simulation, bossId);
    room.gameLoop.onEnd = (result) => this._onGameEnd(room, result);
    room.gameLoop.start();

    this.wsServer.broadcast(room.code, {
      type: 'game_start',
      players,
      difficulty: room.difficulty,
      bossId,
    });

    console.log(`[Room] ${room.code} game started! ${players.length} players, ${room.difficulty}`);
  }

  _onGameEnd(room, result) {
    room.state = 'finished';

    this.wsServer.broadcast(room.code, {
      type: 'game_end',
      result, // { victory: bool, time, stats per player }
    });

    // Persist alkahest to Neon DB via Vercel API
    this._depositAlkahest(result);

    // Reset room after 10s for replay
    setTimeout(() => {
      if (!this.rooms.has(room.code)) return;
      room.state = 'waiting';
      room.gameLoop = null;
      for (const slot of room.players.values()) {
        slot.ready = false;
      }
      this.wsServer.broadcast(room.code, {
        type: 'room_reset',
        room: this._serializeRoom(room),
      });
    }, 10000);
  }

  async _depositAlkahest(result) {
    try {
      if (!result.loot || !result.stats) return;
      // Build username → alkahest map
      const deposits = [];
      for (const loot of result.loot) {
        if (!loot.alkahest || loot.alkahest <= 0) continue;
        const stat = result.stats.find(s => s.id === loot.playerId);
        if (!stat?.username) continue;
        deposits.push({ username: stat.username, alkahest: loot.alkahest });
      }
      if (deposits.length === 0) return;

      const API_URL = process.env.VERCEL_API_URL || 'https://builderberu.com';
      const SECRET = process.env.GAME_SERVER_SECRET || 'manaya-raid-secret-key';

      const resp = await fetch(`${API_URL}/api/storage/deposit-alkahest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Server-Secret': SECRET },
        body: JSON.stringify({ deposits }),
      });
      const data = await resp.json();
      if (data.success) {
        console.log(`[Alkahest] Deposited for ${deposits.length} players:`, data.results.map(r => `${r.username}: ${r.status}`).join(', '));
      } else {
        console.warn('[Alkahest] Deposit failed:', data.error);
      }
    } catch (err) {
      console.error('[Alkahest] Deposit error:', err.message);
    }
  }

  async depositRaidData(client, data) {
    try {
      if (!data || !client.username) return;
      const API_URL = process.env.VERCEL_API_URL || 'https://builderberu.com';
      const SECRET = process.env.GAME_SERVER_SECRET || 'manaya-raid-secret-key';

      const resp = await fetch(`${API_URL}/api/storage/deposit-raid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Server-Secret': SECRET },
        body: JSON.stringify({ username: client.username, raidData: data }),
      });
      const result = await resp.json();
      if (result.success) {
        console.log(`[RaidSync] Deposited for ${client.username}: ${result.status}`);
      } else {
        console.warn(`[RaidSync] Failed for ${client.username}:`, result.error || result.status);
      }
    } catch (err) {
      console.error('[RaidSync] Deposit error:', err.message);
    }
  }

  _getClientColosseumData(clientId) {
    // Look through WS clients to find this player's synced colosseum data
    for (const [, clientData] of this.wsServer.clients) {
      if (clientData.id === clientId) {
        return clientData.colosseumData || null;
      }
    }
    return null;
  }

  _getRoom(client) {
    if (!client.roomCode) return null;
    return this.rooms.get(client.roomCode) || null;
  }

  _serializeRoom(room) {
    return {
      code: room.code,
      host: room.host,
      difficulty: room.difficulty,
      simulation: room.simulation || false,
      selectedBossId: room.selectedBossId || 'manaya',
      state: room.state,
      players: [...room.players.values()].map(p => ({
        id: p.id,
        username: p.username,
        class: p.class,
        ready: p.ready,
        isBot: p.isBot || false,
        mainHunter: p.mainHunter || null,
        supportHunters: p.supportHunters || [],
      })),
    };
  }

  _generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No ambiguous I/O/0/1
    let code;
    do {
      code = '';
      for (let i = 0; i < ROOM.CODE_LENGTH; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
    } while (this.rooms.has(code));
    return code;
  }

  _send(ws, data) {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  listRooms(ws) {
    const rooms = [];
    for (const [code, room] of this.rooms) {
      rooms.push({
        code,
        host: [...room.players.values()].find(p => p.id === room.host)?.username || '???',
        difficulty: room.difficulty,
        state: room.state,
        playerCount: room.players.size,
        maxPlayers: ROOM.MAX_PLAYERS,
        players: [...room.players.values()].map(p => ({
          username: p.username,
          class: p.class,
          ready: p.ready,
        })),
      });
    }
    this._send(ws, { type: 'room_list', rooms });
  }

  // ── Spectator Mode: Bot-only auto-run rooms ──

  createSpectatorRoom(ws, client, msg) {
    if (client.roomCode) {
      this._send(ws, { type: 'error', message: 'Already in a room' });
      return;
    }

    const code = this._generateCode();
    const difficulty = msg.difficulty || 'NIGHTMARE';
    const totalRuns = Math.min(100, Math.max(1, parseInt(msg.runs) || 10));

    const room = {
      code,
      host: client.id,
      difficulty,
      simulation: false,
      state: 'waiting',
      players: new Map(),
      spectators: new Set(), // WS refs of spectators
      gameLoop: null,
      countdownTimer: null,
      // Spectator auto-run fields
      isSpectatorRoom: true,
      totalRuns,
      currentRun: 0,
      runHistory: [], // { run, victory, time, stats[] }
    };

    // Add 5 bots: tank, healer, + 3 DPS
    const botClasses = ['tank', 'healer', 'berserker', 'dps_range', 'mage'];
    const usedNames = new Set();
    for (let i = 0; i < 5; i++) {
      const botId = generateBotId();
      const botName = pickBotName(usedNames);
      usedNames.add(botName);
      room.players.set(botId, {
        id: botId,
        username: botName,
        class: botClasses[i],
        ready: true,
        isBot: true,
      });
    }

    this.rooms.set(code, room);

    // Spectator joins the room (receives broadcasts but has no player)
    client.roomCode = code;
    room.spectators.add(ws);

    this._send(ws, {
      type: 'spectator_room_created',
      code,
      room: this._serializeRoom(room),
      totalRuns,
      difficulty,
    });

    console.log(`[Spectator] Room ${code} created: ${totalRuns} runs, ${difficulty}`);

    // Auto-start first run after 2s
    setTimeout(() => this._startSpectatorRun(room), 2000);
  }

  spectateRoom(ws, client, msg) {
    const code = (msg.code || '').toUpperCase();
    const room = this.rooms.get(code);
    if (!room) {
      this._send(ws, { type: 'error', message: 'Room not found' });
      return;
    }

    client.roomCode = code;
    if (!room.spectators) room.spectators = new Set();
    room.spectators.add(ws);

    this._send(ws, {
      type: 'spectator_joined',
      code,
      room: this._serializeRoom(room),
      isSpectatorRoom: room.isSpectatorRoom || false,
      currentRun: room.currentRun || 0,
      totalRuns: room.totalRuns || 0,
      runHistory: room.runHistory || [],
    });

    console.log(`[Spectator] ${client.username} spectating ${code}`);
  }

  _startSpectatorRun(room) {
    if (!this.rooms.has(room.code)) return;
    if (room.currentRun >= room.totalRuns) {
      // All runs complete
      this.wsServer.broadcast(room.code, {
        type: 'spectator_complete',
        runHistory: room.runHistory,
      });
      console.log(`[Spectator] Room ${room.code} completed all ${room.totalRuns} runs`);
      // Keep room alive for 60s so spectator can review
      setTimeout(() => {
        if (this.rooms.has(room.code)) {
          this.rooms.delete(room.code);
          console.log(`[Spectator] Room ${room.code} cleaned up`);
        }
      }, 60000);
      return;
    }

    room.currentRun++;
    room.state = 'playing';

    const players = [...room.players.values()].map(p => ({
      id: p.id,
      username: p.username,
      class: p.class,
      isBot: true,
      colosseumData: null,
    }));

    const bossId = room.selectedBossId || 'manaya';
    room.gameLoop = new GameLoop(room.code, players, room.difficulty, this.wsServer, false, bossId);
    room.gameLoop.onEnd = (result) => this._onSpectatorGameEnd(room, result);
    room.gameLoop.start();

    this.wsServer.broadcast(room.code, {
      type: 'spectator_run_start',
      run: room.currentRun,
      totalRuns: room.totalRuns,
      difficulty: room.difficulty,
    });

    console.log(`[Spectator] Room ${room.code} run ${room.currentRun}/${room.totalRuns} started`);
  }

  _onSpectatorGameEnd(room, result) {
    room.state = 'finished';
    room.gameLoop = null;

    // Log run stats
    const runStats = {
      run: room.currentRun,
      victory: result.victory,
      reason: result.reason || 'unknown',
      time: result.time || 0,
      bossHpPercent: result.bossHpPercent,
      stats: (result.stats || []).map(s => ({
        username: s.username,
        class: s.class,
        damageDealt: s.damageDealt,
        healingDone: s.healingDone,
        damageTaken: s.damageTaken,
        deaths: s.deaths,
      })),
    };
    room.runHistory.push(runStats);

    // Broadcast game end + run summary
    this.wsServer.broadcast(room.code, {
      type: 'game_end',
      result,
    });

    this.wsServer.broadcast(room.code, {
      type: 'spectator_run_end',
      runStats,
      currentRun: room.currentRun,
      totalRuns: room.totalRuns,
      runHistory: room.runHistory,
    });

    const wins = room.runHistory.filter(r => r.victory).length;
    const losses = room.currentRun - wins;
    const winrate = room.currentRun > 0 ? Math.round(wins / room.currentRun * 100) : 0;
    console.log(`\n[Spectator] ═══ Run ${room.currentRun}/${room.totalRuns} — ${result.victory ? 'WIN ✓' : 'LOSS ✗'} (${wins}W/${losses}L — ${winrate}%) ═══`);
    console.log(`[Spectator] Reason: ${result.reason || 'unknown'} | Time: ${result.time ? result.time.toFixed(1) + 's' : 'N/A'} | Boss HP: ${result.bossHpPercent !== undefined ? result.bossHpPercent.toFixed(1) + '%' : 'dead'}`);
    for (const s of runStats.stats) {
      const dps = result.time > 0 ? Math.round(s.damageDealt / result.time) : 0;
      console.log(`  ${s.class.padEnd(10)} ${s.username.padEnd(8)} | DMG: ${Math.round(s.damageDealt).toLocaleString().padStart(9)} (${dps} DPS) | Heal: ${Math.round(s.healingDone).toLocaleString().padStart(7)} | Taken: ${Math.round(s.damageTaken).toLocaleString().padStart(7)} | Deaths: ${s.deaths}`);
    }

    // Auto-start next run after 5s
    setTimeout(() => {
      // Reset player IDs for new game loop
      const botClasses = [...room.players.values()].map(p => p.class);
      room.players.clear();
      const usedNames = new Set();
      for (let i = 0; i < botClasses.length; i++) {
        const botId = generateBotId();
        const botName = pickBotName(usedNames);
        usedNames.add(botName);
        room.players.set(botId, {
          id: botId,
          username: botName,
          class: botClasses[i],
          ready: true,
          isBot: true,
        });
      }
      this._startSpectatorRun(room);
    }, 5000);
  }

  // Stats for monitoring
  getStats() {
    return {
      rooms: this.rooms.size,
      playing: [...this.rooms.values()].filter(r => r.state === 'playing').length,
      totalPlayers: [...this.rooms.values()].reduce((sum, r) => sum + r.players.size, 0),
    };
  }
}
