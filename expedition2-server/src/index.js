// ── Expedition II: Ragnaros — Server Entry Point ──

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SERVER } from './config.js';
import { RoomManager } from './network/RoomManager.js';
import { WebSocketServer } from './network/WebSocketServer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── HTTP Server ──
const roomManager = new RoomManager(null);

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
      version: '0.2.0',
      uptime: Math.floor(process.uptime()),
      ...roomManager.getStats(),
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
const wsServer = new WebSocketServer(server, roomManager);
roomManager.setWsServer(wsServer);

// ── Boot ──
server.listen(SERVER.PORT, () => {
  console.log('═══════════════════════════════════════════════');
  console.log('  RAGNAROS  v0.2.0 — Room-based Lobby');
  console.log(`  Play:  http://localhost:${SERVER.PORT}/play`);
  console.log(`  WS:    ws://localhost:${SERVER.PORT}/ws`);
  console.log('═══════════════════════════════════════════════');
});

// ── Graceful shutdown ──
process.on('SIGTERM', () => { wsServer.shutdown(); server.close(() => process.exit(0)); });
process.on('SIGINT', () => { wsServer.shutdown(); server.close(() => process.exit(0)); });
