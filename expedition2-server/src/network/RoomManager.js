// ── Expedition II: Ragnaros — Room Manager (lobby system) ──

import { ROOM } from '../config.js';
import { GameEngine } from '../engine/GameEngine.js';
import { generateBotId, pickBotClasses, pickBotName } from '../game/BotAI.js';
import { generatePlayerRewards } from '../data/lootEngine.js';
import { craftRagnarosSetPiece, getForgeStatus, rerollArtifactSubs, rerollWithLock } from '../data/forgeEngine.js';

const VALID_CLASSES = ['archer', 'berserker', 'warrior', 'tank', 'healer', 'mage'];

export class RoomManager {
  constructor(wsServer) {
    this.wsServer = wsServer;
    this.rooms = new Map(); // code -> Room

    // Auto-cleanup zombie rooms every 30s
    this._cleanupInterval = setInterval(() => this._cleanupZombieRooms(), 30000);
  }

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
      state: 'waiting', // waiting | countdown | playing | finished
      players: new Map(),
      engine: null,
      countdownTimer: null,
      createdAt: Date.now(),
    };

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

    this._send(ws, {
      type: 'room_joined',
      code,
      room: this._serializeRoom(room),
    });

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
    client.roomCode = null;

    if (room.engine) {
      room.engine.removePlayer(client.id);
    }

    if (room.players.size === 0 || this._allBots(room)) {
      if (room.engine) room.engine.stop();
      if (room.countdownTimer) clearInterval(room.countdownTimer);
      this.rooms.delete(code);
      console.log(`[Room] ${code} destroyed (empty)`);
      return;
    }

    // Transfer host
    if (room.host === client.id) {
      // Pick first non-bot player as host
      for (const [id, slot] of room.players) {
        if (!slot.isBot) {
          room.host = id;
          this.wsServer.broadcast(code, { type: 'new_host', hostId: id });
          break;
        }
      }
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

    if (!VALID_CLASSES.includes(msg.class)) {
      this._send(ws, { type: 'error', message: 'Invalid class' });
      return;
    }

    const slot = room.players.get(client.id);
    if (slot) {
      slot.class = msg.class;
      slot.ready = false;

      this.wsServer.broadcast(room.code, {
        type: 'class_selected',
        playerId: client.id,
        class: msg.class,
        room: this._serializeRoom(room),
      });
    }
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

    this._checkAllReady(room);
  }

  addBots(ws, client, msg) {
    const room = this._getRoom(client);
    if (!room || room.state !== 'waiting') return;
    if (room.host !== client.id) {
      this._send(ws, { type: 'error', message: 'Only host can add bots' });
      return;
    }

    const count = Math.max(0, Math.min(4, parseInt(msg.count) || 0));

    // Remove existing bots
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

    const hostSlot = room.players.get(client.id);
    const playerClass = hostSlot?.class || 'warrior';
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

  setDifficulty(ws, client, msg) {
    const room = this._getRoom(client);
    if (!room || room.state !== 'waiting') return;
    if (room.host !== client.id) {
      this._send(ws, { type: 'error', message: 'Only host can set difficulty' });
      return;
    }

    const valid = ['NORMAL', 'HARD', 'NIGHTMARE'];
    const diff = (msg.difficulty || '').toUpperCase();
    if (!valid.includes(diff)) return;

    room.difficulty = diff;
    this.wsServer.broadcast(room.code, {
      type: 'difficulty_changed',
      difficulty: diff,
      room: this._serializeRoom(room),
    });
  }

  setProfile(ws, client, msg) {
    const room = this._getRoom(client);
    if (!room || room.state !== 'waiting') return;

    const slot = room.players.get(client.id);
    if (!slot) return;

    slot.profileData = msg.profile || null;
    this._send(ws, { type: 'profile_set', success: true });
  }

  // ── Forge & Alkahest ──
  // These operate on the player's profile data (sent via set_profile)
  // Results are sent back to client which saves to localStorage/cloud

  forgeStatus(ws, client, msg) {
    const profile = msg.profile || {};
    const feathers = profile.feathers || 0;
    const inventory = profile.inventory || {};
    const status = getForgeStatus(feathers, inventory);
    this._send(ws, { type: 'forge_status', forge: status });
  }

  forgeCraft(ws, client, msg) {
    const profile = msg.profile || {};
    const slotId = msg.slotId;
    const feathers = profile.feathers || 0;
    const inventory = profile.inventory || {};

    const result = craftRagnarosSetPiece(slotId, feathers, inventory);
    this._send(ws, { type: 'forge_result', ...result });
  }

  rerollArtifact(ws, client, msg) {
    const profile = msg.profile || {};
    const artifact = msg.artifact;
    const alkahest = profile.alkahest || 0;
    const lockIndex = msg.lockIndex ?? -1;

    let result;
    if (lockIndex >= 0) {
      result = rerollWithLock(artifact, alkahest, lockIndex);
    } else {
      result = rerollArtifactSubs(artifact, alkahest);
    }
    this._send(ws, { type: 'reroll_result', ...result });
  }

  handleInput(client, msg) {
    const room = this._getRoom(client);
    if (!room || room.state !== 'playing' || !room.engine) return;
    room.engine.handleInput(client.id, msg.input);
  }

  _checkAllReady(room) {
    if (room.players.size < ROOM.MIN_PLAYERS) return;

    const allReady = [...room.players.values()].every(p => p.ready);
    if (!allReady) {
      if (room.countdownTimer) {
        clearInterval(room.countdownTimer);
        room.countdownTimer = null;
        room.state = 'waiting';
        this.wsServer.broadcast(room.code, { type: 'countdown_cancelled' });
      }
      return;
    }

    room.state = 'countdown';
    let countdown = ROOM.READY_COUNTDOWN;

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

    // Per-room broadcast function
    const roomBroadcast = (msg) => {
      this.wsServer.broadcast(room.code, msg);
    };

    const engine = new GameEngine(roomBroadcast);
    engine.skipAutoBot = true; // Room manages bots
    room.engine = engine;

    // Set difficulty
    engine.difficulty = room.difficulty || 'NORMAL';

    // Add all players to engine
    const playerDefs = [];
    for (const slot of room.players.values()) {
      engine.addPlayer(slot.id, slot.username, slot.class, slot.profileData || null);

      // Mark bot players — GameEngine has built-in bot AI
      if (slot.isBot) {
        const player = engine.players.get(slot.id);
        if (player) {
          player.isBot = true;
          player.botRole = this._getBotRole(slot.class);
        }
      }

      playerDefs.push({
        id: slot.id,
        username: slot.username,
        class: slot.class,
        isBot: slot.isBot || false,
      });
    }

    // Start the engine
    engine.start();

    // Detect game end
    const checkEnd = setInterval(() => {
      if (engine.status === 'victory' || engine.status === 'defeat') {
        clearInterval(checkEnd);
        this._onGameEnd(room, engine.status);
      }
    }, 500);
    room._checkEndInterval = checkEnd;

    this.wsServer.broadcast(room.code, {
      type: 'game_start',
      players: playerDefs,
    });

    console.log(`[Room] ${room.code} game started! ${playerDefs.length} players`);
  }

  _getBotRole(cls) {
    if (cls === 'tank') return 'tank';
    if (cls === 'healer') return 'healer';
    return 'dps';
  }

  _onGameEnd(room, result) {
    room.state = 'finished';
    if (room._checkEndInterval) clearInterval(room._checkEndInterval);

    const engine = room.engine;
    if (!engine) return;

    const victory = result === 'victory';
    const bossHpPercent = engine.getBossHpPercent();
    const elapsed = engine.getFightElapsed();
    const difficulty = engine.difficulty || 'NORMAL';
    const combatStats = engine.getPlayerCombatStats();

    // Count human players
    const humanPlayers = [...room.players.values()].filter(p => !p.isBot);
    const playerCount = humanPlayers.length;

    // Generate rewards for each human player
    const rewards = {};
    for (const slot of humanPlayers) {
      const stats = combatStats[slot.id] || { damageDealt: 0, healingDone: 0, deaths: 0 };
      const playerLevel = slot.profileData?.level || 1;

      rewards[slot.id] = generatePlayerRewards({
        victory,
        difficulty,
        bossHpPercent,
        damageDealt: stats.damageDealt,
        healingDone: stats.healingDone,
        deaths: stats.deaths,
        playerCount,
        elapsed,
        playerLevel,
        playerClass: slot.class,
      });
    }

    // Send rewards to each player individually
    for (const [playerId, reward] of Object.entries(rewards)) {
      const ws = this.wsServer.getClientWs(playerId);
      if (ws) {
        this._send(ws, {
          type: 'rewards',
          rewards: reward,
          combatStats: combatStats[playerId],
          dpsRanking: engine.getDpsRanking(),
        });
      }
    }

    // Broadcast end-of-fight summary to all
    this.wsServer.broadcast(room.code, {
      type: 'fight_summary',
      result,
      bossHpPercent,
      elapsed,
      difficulty,
      dpsRanking: engine.getDpsRanking(),
    });

    // Reset room after 15s (longer to review rewards)
    setTimeout(() => {
      if (!this.rooms.has(room.code)) return;
      room.state = 'waiting';
      if (room.engine) { room.engine.stop(); room.engine = null; }
      for (const slot of room.players.values()) {
        slot.ready = false;
      }
      this.wsServer.broadcast(room.code, {
        type: 'room_reset',
        room: this._serializeRoom(room),
      });
    }, 15000);
  }

  _allBots(room) {
    for (const slot of room.players.values()) {
      if (!slot.isBot) return false;
    }
    return true;
  }

  // Destroy rooms that have only bots or are stale (waiting >5min, playing >30min)
  _cleanupZombieRooms() {
    const now = Date.now();
    for (const [code, room] of this.rooms) {
      const age = now - (room.createdAt || 0);
      const onlyBots = this._allBots(room);
      const staleWaiting = room.state === 'waiting' && age > 5 * 60 * 1000;   // 5 min
      const staleGame = room.state === 'playing' && age > 30 * 60 * 1000;     // 30 min

      if (onlyBots || staleWaiting || staleGame) {
        if (room.engine) room.engine.stop();
        if (room.countdownTimer) clearInterval(room.countdownTimer);
        this.rooms.delete(code);
        console.log(`[Room] ${code} auto-cleaned (bots=${onlyBots}, state=${room.state}, age=${Math.floor(age/1000)}s)`);
      }
    }
  }

  _getRoom(client) {
    if (!client.roomCode) return null;
    return this.rooms.get(client.roomCode) || null;
  }

  _serializeRoom(room) {
    return {
      code: room.code,
      host: room.host,
      state: room.state,
      difficulty: room.difficulty || 'NORMAL',
      players: [...room.players.values()].map(p => ({
        id: p.id,
        username: p.username,
        class: p.class,
        ready: p.ready,
        isBot: p.isBot || false,
      })),
    };
  }

  _generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
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
        state: room.state,
        playerCount: room.players.size,
        maxPlayers: ROOM.MAX_PLAYERS,
        players: [...room.players.values()].map(p => ({
          username: p.username,
          class: p.class,
          ready: p.ready,
          isBot: p.isBot || false,
        })),
      });
    }
    this._send(ws, { type: 'room_list', rooms });
  }

  getStats() {
    return {
      rooms: this.rooms.size,
      playing: [...this.rooms.values()].filter(r => r.state === 'playing').length,
      totalPlayers: [...this.rooms.values()].reduce((sum, r) => sum + r.players.size, 0),
    };
  }
}
