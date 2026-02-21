import { WebSocketServer as WSServer } from 'ws';
import { SERVER } from '../config.js';

export class WebSocketServer {
  constructor(server, roomManager) {
    this.roomManager = roomManager;
    this.clients = new Map(); // ws -> { id, username, roomCode }

    this.wss = new WSServer({
      server,
      path: '/ws',
    });

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
    }, SERVER.HEARTBEAT_INTERVAL);

    console.log('[WS] WebSocket server ready on path /ws');
  }

  _onConnection(ws, req) {
    ws._alive = true;
    ws.on('pong', () => { ws._alive = true; });

    // Parse auth from URL params: /ws?token=xxx&username=xxx
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    const username = url.searchParams.get('username') || 'Player';

    // TODO: Verify token with HMAC (same secret as builderberu auth)
    // For now, accept all connections in dev
    const clientId = this._generateId();

    const clientData = { id: clientId, username, roomCode: null, colosseumData: null };
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
      case 'select_difficulty':
        this.roomManager.selectDifficulty(ws, client, msg);
        break;
      case 'set_simulation':
        this.roomManager.setSimulation(ws, client, msg);
        break;
      case 'player_ready':
        this.roomManager.playerReady(ws, client);
        break;

      // ── Hunter Selection ──
      case 'select_hunters':
        this.roomManager.selectHunters(ws, client, msg);
        break;

      // ── Profile Sync (ShadowColosseum data) ──
      case 'sync_profile':
        client.colosseumData = msg.data || null;
        this._send(ws, { type: 'profile_synced', hasData: !!msg.data });
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

  // Send to all clients in a room
  broadcast(roomCode, data) {
    const json = JSON.stringify(data);
    for (const [ws, client] of this.clients) {
      if (client.roomCode === roomCode && ws.readyState === ws.OPEN) {
        ws.send(json);
      }
    }
  }

  // Send to a specific client by id
  sendToClient(clientId, data) {
    for (const [ws, client] of this.clients) {
      if (client.id === clientId && ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(data));
        return;
      }
    }
  }

  getWsByClientId(clientId) {
    for (const [ws, client] of this.clients) {
      if (client.id === clientId) return ws;
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
