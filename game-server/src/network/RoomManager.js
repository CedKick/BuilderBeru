import { ROOM, DIFFICULTY } from '../config.js';
import { GameLoop } from '../game/GameLoop.js';

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
    client.roomCode = null;

    // If game is running and player leaves, mark them as disconnected
    if (room.gameLoop) {
      room.gameLoop.handlePlayerDisconnect(client.id);
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

    const validClasses = ['tank', 'healer', 'dps_cac', 'dps_range'];
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
        colosseumData: Object.keys(colosseumData).length > 0 ? colosseumData : null,
      };
    });

    room.gameLoop = new GameLoop(room.code, players, room.difficulty, this.wsServer, room.simulation);
    room.gameLoop.onEnd = (result) => this._onGameEnd(room, result);
    room.gameLoop.start();

    this.wsServer.broadcast(room.code, {
      type: 'game_start',
      players,
      difficulty: room.difficulty,
    });

    console.log(`[Room] ${room.code} game started! ${players.length} players, ${room.difficulty}`);
  }

  _onGameEnd(room, result) {
    room.state = 'finished';

    this.wsServer.broadcast(room.code, {
      type: 'game_end',
      result, // { victory: bool, time, stats per player }
    });

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
      state: room.state,
      players: [...room.players.values()].map(p => ({
        id: p.id,
        username: p.username,
        class: p.class,
        ready: p.ready,
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

  // Stats for monitoring
  getStats() {
    return {
      rooms: this.rooms.size,
      playing: [...this.rooms.values()].filter(r => r.state === 'playing').length,
      totalPlayers: [...this.rooms.values()].reduce((sum, r) => sum + r.players.size, 0),
    };
  }
}
