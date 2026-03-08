import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { SERVER } from './config.js';
import { ExpeditionEngine } from './engine/ExpeditionEngine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Real player inscription data (from DB) ──────────────
// 4 players with their actual expedition inscription stats
const PLAYER_DATA = [
  {
    username: 'Kly',
    hunters: [
      { hunterId: 'h_frieren', fullStats: { hp: 27631, atk: 6377, def: 1052, spd: 941.9, crit: 378.8, res: 298.3, mana: 47898 }, stars: 272, level: 140, weaponPassive: null },
      { hunterId: 'h_chae_in', fullStats: { hp: 30675, atk: 13525.4, def: 1274, spd: 1037.8, crit: 408.8, res: 304.3, mana: 6733 }, stars: 286, level: 140, weaponPassive: 'katana_z_fury' },
      { hunterId: 'h_meri', fullStats: { hp: 34597.3, atk: 5082, def: 2369, spd: 836.2, crit: 172.6, res: 416.2, mana: 31951 }, stars: 257, level: 140, weaponPassive: null },
      { hunterId: 'h_megumin', fullStats: { hp: 14189, atk: 3004, def: 664, spd: 649, crit: 313.2, res: 267.6, mana: 9449 }, stars: 154, level: 140, weaponPassive: 'katana_v_chaos' },
      { hunterId: 'h_lee_bora', fullStats: { hp: 17816, atk: 4899.9, def: 823, spd: 650.4, crit: 183.5, res: 246, mana: 24616 }, stars: 70, level: 140, weaponPassive: 'guldan_halo' },
      { hunterId: 'h_mayuri', fullStats: { hp: 20567.1, atk: 4415, def: 1058, spd: 610.3, crit: 124.5, res: 281.1, mana: 26869 }, stars: 73, level: 140, weaponPassive: null },
    ],
  },
  {
    username: 'Bobby',
    hunters: [
      { hunterId: 'h_meri', fullStats: { hp: 37324, atk: 9693.5, def: 1908.5, spd: 788, crit: 412, res: 500.5, mana: 8926 }, stars: 264, level: 140, weaponPassive: null },
      { hunterId: 'h_sian', fullStats: { hp: 15189, atk: 14267.5, def: 1098.5, spd: 1075, crit: 621.7, res: 238.7, mana: 3303 }, stars: 255, level: 140, weaponPassive: null },
      { hunterId: 'h_ilhwan', fullStats: { hp: 17315, atk: 15351.5, def: 1053.5, spd: 1048, crit: 679, res: 223.6, mana: 3295 }, stars: 254, level: 140, weaponPassive: null },
      { hunterId: 'h_son', fullStats: { hp: 20320, atk: 10252.5, def: 1704.5, spd: 449, crit: 422.3, res: 397.3, mana: 2357 }, stars: 131, level: 140, weaponPassive: null },
      { hunterId: 'h_isla', fullStats: { hp: 10126, atk: 7855.5, def: 997.5, spd: 525, crit: 251.6, res: 323.6, mana: 4928 }, stars: 149, level: 140, weaponPassive: null },
      { hunterId: 'h_megumin', fullStats: { hp: 4376, atk: 10288.5, def: 503.5, spd: 630, crit: 528, res: 353.8, mana: 11530 }, stars: 175, level: 140, weaponPassive: 'katana_v_chaos' },
    ],
  },
  {
    username: 'damon',
    hunters: [
      { hunterId: 'h_frieren', fullStats: { hp: 20433, atk: 10025, def: 1217, spd: 987, crit: 561.7, res: 505.2, mana: 8009 }, stars: 214, level: 140, weaponPassive: 'katana_z_fury' },
      { hunterId: 'h_meri', fullStats: { hp: 43501.6, atk: 5307, def: 2188, spd: 917.6, crit: 351.1, res: 564.7, mana: 14804 }, stars: 222, level: 140, weaponPassive: null },
      { hunterId: 'h_ilhwan', fullStats: { hp: 24210.3, atk: 12087.7, def: 1447, spd: 1244.2, crit: 630.3, res: 330.9, mana: 5743 }, stars: 218, level: 140, weaponPassive: null },
      { hunterId: 'h_isla', fullStats: { hp: 43937.8, atk: 4893, def: 1790, spd: 680.9, crit: 273.6, res: 443.7, mana: 6114 }, stars: 93, level: 140, weaponPassive: null },
      { hunterId: 'h_gojo', fullStats: { hp: 15692, atk: 6578, def: 1364, spd: 832.1, crit: 532.7, res: 391, mana: 21972 }, stars: 125, level: 140, weaponPassive: 'katana_v_chaos' },
      { hunterId: 'h_megumin', fullStats: { hp: 11816.7, atk: 9677.5, def: 969.7, spd: 817.5, crit: 504.6, res: 454.9, mana: 7710 }, stars: 160, level: 140, weaponPassive: 'sulfuras_fury' },
    ],
  },
  {
    username: 'shy',
    hunters: [
      { hunterId: 'h_sian', fullStats: { hp: 11878, atk: 12948.6, def: 670, spd: 1085.6, crit: 456.8, res: 258.7, mana: 3402 }, stars: 305, level: 140, weaponPassive: 'shadow_silence' },
      { hunterId: 'h_ilhwan', fullStats: { hp: 15864, atk: 12944.6, def: 666, spd: 1082.4, crit: 516.6, res: 232, mana: 3169 }, stars: 297, level: 140, weaponPassive: 'katana_z_fury' },
      { hunterId: 'h_son', fullStats: { hp: 17888, atk: 7891.2, def: 2191, spd: 357, crit: 134.2, res: 373.7, mana: 3992 }, stars: 132, level: 140, weaponPassive: 'katana_v_chaos' },
      { hunterId: 'h_isla', fullStats: { hp: 8117, atk: 8140.4, def: 931, spd: 618.4, crit: 86.9, res: 259.8, mana: 2847 }, stars: 91, level: 140, weaponPassive: 'guldan_halo' },
      { hunterId: 'h_megumin', fullStats: { hp: 7963, atk: 11299.4, def: 463, spd: 623, crit: 412.8, res: 291.4, mana: 6071 }, stars: 213, level: 140, weaponPassive: 'sulfuras_fury' },
      { hunterId: 'h_daijin', fullStats: { hp: 8258, atk: 10367.9, def: 533, spd: 696.5, crit: 384.9, res: 132.4, mana: 3216 }, stars: 106, level: 140, weaponPassive: null },
    ],
  },
];

// ─── Boot ─────────────────────────────────────────────────

const engine = new ExpeditionEngine();

// Auto-start bot expedition with real player data
console.log('\n[Expedition v2] Booting with real player data...');
const result = engine.startBotExpedition(PLAYER_DATA);
console.log('[Expedition v2] Start result:', result);

// ─── HTTP Server (status endpoint) ────────────────────────

const server = http.createServer((req, res) => {
  const origin = req.headers.origin;
  if (SERVER.CORS_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  if (req.url === '/api/expedition/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(engine.getExpeditionState()));
    return;
  }

  // Serve spectator page
  if (req.url === '/' || req.url === '/spectator' || req.url === '/spectator.html') {
    const htmlPath = path.join(__dirname, '..', 'public', 'spectator.html');
    try {
      const html = fs.readFileSync(htmlPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch {
      res.writeHead(500);
      res.end('Spectator page not found');
    }
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

// ─── WebSocket for spectator ──────────────────────────────

const wss = new WebSocketServer({ server, path: '/ws' });
const spectators = new Set();

wss.on('connection', (ws) => {
  spectators.add(ws);
  console.log(`[WS] Spectator connected (${spectators.size} total)`);

  // Send current state immediately
  const state = engine.getExpeditionState();
  ws.send(JSON.stringify({ type: 'expedition_state', data: state }));

  ws.on('close', () => {
    spectators.delete(ws);
    console.log(`[WS] Spectator disconnected (${spectators.size} total)`);
  });
});

// Broadcast combat state to spectators at 10 Hz
setInterval(() => {
  if (spectators.size === 0) return;
  const state = engine.getExpeditionState();
  const msg = JSON.stringify({ type: 'expedition_state', data: state });
  for (const ws of spectators) {
    if (ws.readyState === 1) ws.send(msg);
  }
}, 100);

// ─── Start server ─────────────────────────────────────────

server.listen(SERVER.PORT, () => {
  console.log(`[Expedition v2] Server running on port ${SERVER.PORT}`);
  console.log(`[Expedition v2] WS spectator: ws://localhost:${SERVER.PORT}/ws`);
  console.log(`[Expedition v2] Status: http://localhost:${SERVER.PORT}/api/expedition/status`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Expedition v2] Shutting down...');
  engine.destroy();
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  engine.destroy();
  server.close();
  process.exit(0);
});
