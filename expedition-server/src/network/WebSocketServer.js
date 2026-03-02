import { WebSocketServer as WsServer } from 'ws';
import { SERVER } from '../config.js';

// ── WebSocket Server for Expedition Spectators ──
// Read-only: spectators receive state updates but never send game commands.

export class ExpeditionWSServer {
  constructor(httpServer) {
    this.wss = new WsServer({
      server: httpServer,
      path: SERVER.WS_PATH,
    });

    this.spectators = new Set();

    this.wss.on('connection', (ws, req) => {
      this.spectators.add(ws);
      console.log(`[WS] Spectator connected (${this.spectators.size} total)`);

      // Send current state immediately (late-join support)
      if (this.currentState) {
        this.send(ws, this.currentState);
      }

      ws.on('message', (raw) => {
        try {
          const msg = JSON.parse(raw);
          // Spectators can only subscribe/unsubscribe
          if (msg.type === 'ping') {
            this.send(ws, { type: 'pong' });
          }
        } catch (e) {
          // Ignore malformed messages
        }
      });

      ws.on('close', () => {
        this.spectators.delete(ws);
        console.log(`[WS] Spectator disconnected (${this.spectators.size} remaining)`);
      });

      ws.on('error', () => {
        this.spectators.delete(ws);
      });
    });

    // Latest state for late-join
    this.currentState = null;
  }

  // Broadcast a message to all connected spectators
  broadcast(message) {
    // Cache state messages for late joiners
    if (message.type === 'expedition_state') {
      this.currentState = message;
    }

    const data = JSON.stringify(message);
    for (const ws of this.spectators) {
      if (ws.readyState === 1) {  // OPEN
        ws.send(data);
      }
    }
  }

  send(ws, message) {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify(message));
    }
  }

  getSpectatorCount() {
    return this.spectators.size;
  }

  shutdown() {
    for (const ws of this.spectators) {
      ws.close();
    }
    this.wss.close();
  }
}
