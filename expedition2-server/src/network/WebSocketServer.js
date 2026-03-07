// ── Expedition II: Ragnaros — WebSocket Server ──

import { WebSocketServer as WSServer } from 'ws';

export class WebSocketServer {
  constructor(server, roomManager) {
    this.roomManager = roomManager;
    this.clients = new Map(); // ws -> { id, username, roomCode }

    this.wss = new WSServer({ server, path: '/ws' });
    this.wss.on('connection', (ws, req) => this._onConnection(ws, req));

    // Heartbeat to detect dead connections
    this._heartbeatInterval = setInterval(() => {
      for (const ws of this.wss.clients) {
        if (ws._alive === false) {
          const client = this.clients.get(ws);
          if (client) this._onDisconnect(ws, client);
          return ws.terminate();
        }
        ws._alive = false;
        ws.ping();
      }
    }, 30000);

    console.log('[WS] WebSocket server ready on path /ws');
  }

  _onConnection(ws, req) {
    ws._alive = true;
    ws.on('pong', () => { ws._alive = true; });

    const url = new URL(req.url, `http://${req.headers.host}`);
    const username = url.searchParams.get('username') || 'Player';
    const clientId = this._generateId();

    const clientData = { id: clientId, username, roomCode: null };
    this.clients.set(ws, clientData);

    this._send(ws, { type: 'connected', id: clientId, username });
    console.log(`[WS] Client connected: ${username} (${clientId})`);

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw);
        this._onMessage(ws, clientData, msg);
      } catch (e) {
        this._send(ws, { type: 'error', message: 'Invalid JSON' });
      }
    });

    ws.on('close', () => this._onDisconnect(ws, clientData));
    ws.on('error', () => this._onDisconnect(ws, clientData));
  }

  _onMessage(ws, client, msg) {
    switch (msg.type) {
      // ── Lobby ──
      case 'create_room':
        this.roomManager.createRoom(ws, client, msg);
        break;
      case 'join_room':
        this.roomManager.joinRoom(ws, client, msg);
        break;
      case 'leave_room':
        this.roomManager.leaveRoom(ws, client);
        break;
      case 'list_rooms':
        this.roomManager.listRooms(ws);
        break;
      case 'select_class':
        this.roomManager.selectClass(ws, client, msg);
        break;
      case 'player_ready':
        this.roomManager.playerReady(ws, client);
        break;
      case 'add_bots':
        this.roomManager.addBots(ws, client, msg);
        break;
      case 'set_difficulty':
        this.roomManager.setDifficulty(ws, client, msg);
        break;
      case 'set_profile':
        this.roomManager.setProfile(ws, client, msg);
        break;

      // ── Forge & Alkahest ──
      case 'forge_status':
        this.roomManager.forgeStatus(ws, client, msg);
        break;
      case 'forge_craft':
        this.roomManager.forgeCraft(ws, client, msg);
        break;
      case 'reroll_artifact':
        this.roomManager.rerollArtifact(ws, client, msg);
        break;

      // ── In-Game Inputs ──
      case 'input':
        this.roomManager.handleInput(client, msg);
        break;

      default:
        this._send(ws, { type: 'error', message: `Unknown type: ${msg.type}` });
    }
  }

  _onDisconnect(ws, client) {
    if (client.roomCode) {
      this.roomManager.leaveRoom(ws, client);
    }
    this.clients.delete(ws);
    console.log(`[WS] Client disconnected: ${client.username} (${client.id})`);
  }

  _send(ws, data) {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  broadcast(roomCode, data) {
    const json = JSON.stringify(data);
    for (const [ws, client] of this.clients) {
      if (client.roomCode === roomCode && ws.readyState === ws.OPEN) {
        ws.send(json);
      }
    }
  }

  sendToClient(clientId, data) {
    for (const [ws, client] of this.clients) {
      if (client.id === clientId && ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(data));
        return;
      }
    }
  }

  getClientWs(clientId) {
    for (const [ws, client] of this.clients) {
      if (client.id === clientId && ws.readyState === ws.OPEN) return ws;
    }
    return null;
  }

  _generateId() {
    return Math.random().toString(36).substring(2, 10);
  }

  shutdown() {
    clearInterval(this._heartbeatInterval);
    this.wss.close();
  }
}
