import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SERVER } from './config.js';
import { InstanceManager } from './world/InstanceManager.js';
import { GrottoWSServer } from './network/WSServer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Instance Manager ──
const instanceManager = new InstanceManager();

// ── HTTP Server ──
const server = http.createServer((req, res) => {
  // CORS
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

  const urlPath = req.url.split('?')[0];

  // Health check
  if (urlPath === '/' || urlPath === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      game: 'La Grotte',
      version: '0.1.0',
      uptime: Math.floor(process.uptime()),
      ...instanceManager.getStatus(),
    }));
    return;
  }

  // Serve grotto client
  if (urlPath === '/grotto' || urlPath === '/grotto.html' || urlPath === '/test') {
    const htmlPath = path.join(__dirname, '..', 'public', 'grotto.html');
    fs.readFile(htmlPath, 'utf8', (err, html) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading client');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache, no-store, must-revalidate' });
      res.end(html);
    });
    return;
  }

  // Static files
  const MIME = {
    '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif',
    '.svg': 'image/svg+xml', '.css': 'text/css', '.js': 'application/javascript',
  };
  const ext = path.extname(urlPath).toLowerCase();
  if (MIME[ext]) {
    const filePath = path.join(__dirname, '..', 'public', path.basename(urlPath));
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, { 'Content-Type': MIME[ext] });
      res.end(data);
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// ── Boot ──
function boot() {
  server.listen(SERVER.PORT, () => {
    console.log('============================================');
    console.log('  La Grotte - PvE Open World v0.1.0');
    console.log(`  HTTP:  http://localhost:${SERVER.PORT}`);
    console.log(`  WS:    ws://localhost:${SERVER.PORT}${SERVER.WS_PATH}`);
    console.log(`  Client: http://localhost:${SERVER.PORT}/grotto`);
    console.log('============================================');
  });

  // WebSocket server
  const wsServer = new GrottoWSServer(server, instanceManager);

  // Start game tick loop
  instanceManager.start();

  // Create first instance
  instanceManager.getOrCreateInstance();

  console.log('[Boot] Ready!');
}

boot();

// ── Graceful Shutdown ──
function shutdown() {
  console.log('[Grotto] Shutting down...');
  instanceManager.stop();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
