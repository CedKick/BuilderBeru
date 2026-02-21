import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SERVER } from './config.js';
import { WebSocketServer } from './network/WebSocketServer.js';
import { RoomManager } from './network/RoomManager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── HTTP Server ──
const server = http.createServer((req, res) => {
  // CORS headers
  const origin = req.headers.origin;
  if (SERVER.CORS_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check / status
  if (req.url === '/' || req.url === '/health') {
    const stats = roomManager.getStats();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      game: 'Manaya Raid',
      version: '0.1.0',
      uptime: Math.floor(process.uptime()),
      ...stats,
    }));
    return;
  }

  // Serve test client (supports query params like /test?user=xxx)
  const urlPath = req.url.split('?')[0];
  if (urlPath === '/test' || urlPath === '/test.html') {
    const htmlPath = path.join(__dirname, '..', 'public', 'test.html');
    fs.readFile(htmlPath, 'utf8', (err, html) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading test client');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    });
    return;
  }

  // Serve static files from public/ (images, assets)
  const MIME_TYPES = {
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp',
    '.ico': 'image/x-icon', '.css': 'text/css', '.js': 'application/javascript',
  };
  const ext = path.extname(req.url).toLowerCase();
  if (MIME_TYPES[ext]) {
    const filePath = path.join(__dirname, '..', 'public', path.basename(req.url));
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext], 'Cache-Control': 'public, max-age=86400' });
      res.end(data);
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

// ── Room Manager + WebSocket ──
const roomManager = new RoomManager(null);
const wsServer = new WebSocketServer(server, roomManager);
roomManager.setWsServer(wsServer);

// ── Start ──
server.listen(SERVER.PORT, () => {
  console.log('═══════════════════════════════════════');
  console.log('  🐉 Manaya Raid Server v0.1.0');
  console.log(`  🌐 HTTP:  http://localhost:${SERVER.PORT}`);
  console.log(`  🔌 WS:    ws://localhost:${SERVER.PORT}/ws`);
  console.log(`  🧪 Test:  http://localhost:${SERVER.PORT}/test`);
  console.log('═══════════════════════════════════════');
});

// ── Graceful Shutdown ──
process.on('SIGTERM', () => {
  console.log('[Server] Shutting down...');
  wsServer.shutdown();
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('[Server] Interrupted, shutting down...');
  wsServer.shutdown();
  server.close(() => process.exit(0));
});
