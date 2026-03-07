import { WebSocketServer } from 'ws';
import { SERVER } from '../config.js';
import { getHunterList } from '../data/hunterData.js';
import { getPlayerHunterLevel, savePlayerHunterProgress, getAllPlayerLevels } from '../data/playerSave.js';

export class GrottoWSServer {
  constructor(httpServer, instanceManager) {
    this.instanceManager = instanceManager;
    this.clients = new Map(); // ws -> { playerId, instanceId, username, hunterId }

    this.wss = new WebSocketServer({
      server: httpServer,
      path: SERVER.WS_PATH,
    });

    this.wss.on('connection', (ws, req) => this._onConnection(ws, req));

    // Broadcast loop — send state to all clients at BROADCAST_RATE
    this.broadcastInterval = setInterval(() => {
      this._broadcastAll();
    }, 1000 / SERVER.BROADCAST_RATE);

    // Auto-save every 30s
    this.saveInterval = setInterval(() => { this._saveAll(); }, 30000);

    console.log(`[WS] WebSocket server listening on ${SERVER.WS_PATH}`);
  }

  _onConnection(ws, req) {
    console.log(`[WS] New connection from ${req.socket.remoteAddress}`);
    let clientData = null;

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw);
        this._handleMessage(ws, msg, clientData, (data) => { clientData = data; });
      } catch (e) {
        console.error('[WS] Bad message:', e.message);
      }
    });

    ws.on('close', () => {
      if (clientData?.playerId) {
        // Save progress before removing
        this._savePlayer(clientData);
        this.instanceManager.removePlayer(clientData.playerId);
        this.clients.delete(ws);
        console.log(`[WS] Client disconnected (${clientData.playerId})`);
      }
    });

    ws.on('error', (err) => {
      console.error('[WS] Error:', err.message);
    });
  }

  _handleMessage(ws, msg, clientData, setClientData) {
    switch (msg.type) {
      case 'get_hunters': {
        // Also send player's saved levels if username provided
        const levels = msg.username ? getAllPlayerLevels(msg.username) : {};
        ws.send(JSON.stringify({ type: 'hunter_list', hunters: getHunterList(), levels }));
        break;
      }

      case 'join': {
        const { username, hunterId } = msg;
        if (!username || !hunterId) {
          ws.send(JSON.stringify({ type: 'error', msg: 'Missing username or hunterId' }));
          return;
        }

        // Load saved level for this hunter
        const saved = getPlayerHunterLevel(username, hunterId);

        const result = this.instanceManager.addPlayer(
          username,
          hunterId,
          saved.level
        );

        if (!result) {
          ws.send(JSON.stringify({ type: 'error', msg: 'Server full' }));
          return;
        }

        const { player, instance } = result;
        // Restore XP from save
        player.xp = saved.xp || 0;
        player.totalXp = saved.totalXp || 0;

        const data = { playerId: player.id, instanceId: instance.id, username, hunterId };
        setClientData(data);
        this.clients.set(ws, data);

        ws.send(JSON.stringify({
          type: 'joined',
          playerId: player.id,
          instanceId: instance.id,
          hunterId: player.hunterId,
          hunterName: player.hunterName,
          className: player.className,
          element: player.element,
          map: instance.map.serialize(),
          skills: player.skills,
        }));
        break;
      }

      case 'input': {
        if (!clientData?.playerId) return;
        const instance = this.instanceManager.getInstance(clientData.playerId);
        if (!instance) return;
        const player = instance.players.get(clientData.playerId);
        if (!player) return;

        if (msg.dx !== undefined) player.inputDx = Math.max(-1, Math.min(1, msg.dx));
        if (msg.dy !== undefined) player.inputDy = Math.max(-1, Math.min(1, msg.dy));
        if (msg.skill !== undefined && msg.skill >= 0 && msg.skill <= 3) {
          player.attackingSkill = msg.skill;
        }
        if (msg.target !== undefined) {
          player.targetId = msg.target;
        }
        if (msg.dodge) {
          player.dodge();
        }
        break;
      }

      case 'ping': {
        ws.send(JSON.stringify({ type: 'pong', t: msg.t }));
        break;
      }
    }
  }

  _savePlayer(clientData) {
    if (!clientData?.username || !clientData?.hunterId) return;
    const instance = this.instanceManager.getInstance(clientData.playerId);
    if (!instance) return;
    const player = instance.players.get(clientData.playerId);
    if (!player) return;
    savePlayerHunterProgress(clientData.username, clientData.hunterId, player.level, player.xp, player.totalXp);
  }

  _saveAll() {
    for (const [ws, data] of this.clients) {
      this._savePlayer(data);
    }
  }

  _broadcastAll() {
    for (const [ws, data] of this.clients) {
      if (ws.readyState !== ws.OPEN) continue;
      const instance = this.instanceManager.getInstance(data.playerId);
      if (!instance) continue;

      const state = instance.getState(data.playerId);
      if (!state) continue;

      ws.send(JSON.stringify({ type: 'state', ...state }));
    }
  }

  getPlayerCount() {
    return this.clients.size;
  }

  shutdown() {
    this._saveAll();
    clearInterval(this.broadcastInterval);
    clearInterval(this.saveInterval);
    this.wss.close();
  }
}
