// ── Expedition II: Ragnaros — Server Entry Point ──

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { SERVER } from './config.js';
import { GameEngine } from './engine/GameEngine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── HTTP Server ──
const server = http.createServer((req, res) => {
  const origin = req.headers.origin;
  if (SERVER.CORS_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  const urlPath = req.url.split('?')[0];

  // Health
  if (urlPath === '/' || urlPath === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: 'ok',
      game: 'Expedition II — Ragnaros',
      version: '0.1.0',
      uptime: Math.floor(process.uptime()),
      ...engine.getStatus(),
    }));
  }

  // Serve game client
  if (urlPath === '/play' || urlPath === '/play.html') {
    const htmlPath = path.join(__dirname, '..', 'public', 'play.html');
    fs.readFile(htmlPath, 'utf8', (err, html) => {
      if (err) { res.writeHead(500); return res.end('Error loading client'); }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    });
    return;
  }

  // Static files
  const MIME = {
    '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif',
    '.svg': 'image/svg+xml', '.css': 'text/css', '.js': 'application/javascript',
    '.webp': 'image/webp',
  };
  const ext = path.extname(urlPath).toLowerCase();
  if (MIME[ext]) {
    const filePath = path.join(__dirname, '..', 'public', urlPath.replace(/^\/+/, ''));
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); return res.end('Not found'); }
      res.writeHead(200, { 'Content-Type': MIME[ext], 'Cache-Control': 'public, max-age=86400' });
      res.end(data);
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// ── WebSocket Server ──
const wss = new WebSocketServer({ server, path: SERVER.WS_PATH });

function broadcast(msg) {
  const data = JSON.stringify(msg);
  for (const ws of wss.clients) {
    if (ws.readyState === 1) ws.send(data);
  }
}

const engine = new GameEngine(broadcast);

let nextPlayerId = 1;

wss.on('connection', (ws) => {
  const playerId = `p${nextPlayerId++}`;
  let username = 'Player';
  let joined = false;

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);

      switch (msg.type) {
        case 'join': {
          username = msg.username || 'Player';
          const playerClass = msg.playerClass || 'archer';
          const mapData = engine.addPlayer(playerId, username, playerClass);
          joined = true;
          ws.send(JSON.stringify({ type: 'joined', playerId, ...mapData.data }));
          console.log(`[WS] ${username} joined as ${playerId}`);

          // Auto-start: reset to lobby if fight is over, then start
          if (engine.status !== 'fighting') {
            engine.status = 'lobby';
            setTimeout(() => {
              if (engine.status === 'lobby' && engine.players.size > 0) {
                engine.start();
              }
            }, 3000);
          }
          break;
        }

        case 'move':
        case 'basic':
        case 'secondary':
        case 'secondary_stop':
        case 'skillA':
        case 'skillB':
        case 'skillB_release':
        case 'ultimate':
        case 'dash':
        case 'attack':
        case 'spell': {
          if (joined) engine.handleInput(playerId, msg);
          break;
        }

        case 'restart': {
          // For testing — restart the fight
          if (engine.status !== 'fighting') {
            engine.status = 'lobby';
            engine.start();
          }
          break;
        }
      }
    } catch (e) {
      console.error('[WS] Parse error:', e.message);
    }
  });

  ws.on('close', () => {
    if (joined) {
      engine.removePlayer(playerId);
      console.log(`[WS] ${username} (${playerId}) disconnected`);
    }
  });
});

// ── Boot ──
server.listen(SERVER.PORT, () => {
  console.log('═══════════════════════════════════════════════');
  console.log('  🔥 Expedition II — Ragnaros  v0.1.0');
  console.log(`  🌐 Play:  http://localhost:${SERVER.PORT}/play`);
  console.log(`  🔌 WS:    ws://localhost:${SERVER.PORT}${SERVER.WS_PATH}`);
  console.log('═══════════════════════════════════════════════');
});

// ── Graceful shutdown ──
process.on('SIGTERM', () => { engine.stop(); server.close(() => process.exit(0)); });
process.on('SIGINT', () => { engine.stop(); server.close(() => process.exit(0)); });
