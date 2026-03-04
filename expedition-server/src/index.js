import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SERVER, ADMIN, EXPEDITION } from './config.js';
import { ExpeditionEngine } from './engine/ExpeditionEngine.js';
import { ExpeditionWSServer } from './network/WebSocketServer.js';
import { HttpApi } from './network/HttpApi.js';
import { runMigrations } from './db/migrations.js';
import * as db from './db/queries.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Expedition Engine ──
let expeditionEngine = null;
let httpApi = null;

// ── HTTP Server ──
const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (SERVER.CORS_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
      game: 'Expedition I',
      version: '0.1.0',
      uptime: Math.floor(process.uptime()),
      spectators: wsServer ? wsServer.getSpectatorCount() : 0,
      expedition: expeditionEngine ? expeditionEngine.getStatus() : null,
    }));
    return;
  }

  // Serve spectator client (admin-gated)
  if (urlPath === '/spectator' || urlPath === '/spectator.html') {
    // Admin gate check
    const urlParams = new URL(req.url, 'http://localhost').searchParams;
    if (ADMIN.ENABLED && !ADMIN.ALLOWED_USERS.includes(urlParams.get('key'))) {
      res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<html><body style="background:#0a0a15;color:#888;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif"><h2>Access restricted</h2></body></html>');
      return;
    }

    const htmlPath = path.join(__dirname, '..', 'public', 'spectator.html');
    fs.readFile(htmlPath, 'utf8', (err, html) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading spectator client');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    });
    return;
  }

  // API routes
  if (urlPath.startsWith('/api/expedition/')) {
    if (httpApi) {
      const handled = await httpApi.handle(req, res);
      if (handled !== null) return;
    }
  }

  // Static files from public/
  const MIME_TYPES = {
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp',
    '.ico': 'image/x-icon', '.css': 'text/css', '.js': 'application/javascript',
  };
  const ext = path.extname(urlPath).toLowerCase();
  if (MIME_TYPES[ext]) {
    const filePath = path.join(__dirname, '..', 'public', path.basename(urlPath));
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext], 'Cache-Control': 'public, max-age=86400' });
      res.end(data);
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// ── WebSocket Server ──
let wsServer = null;

// ── Boot sequence ──
async function boot() {
  try {
    // 1. Run DB migrations
    if (process.env.DATABASE_URL) {
      console.log('[Boot] Connecting to database...');
      await runMigrations();
    } else {
      console.log('[Boot] No DATABASE_URL — running without database (dev mode)');
    }

    // 2. Start HTTP server
    server.listen(SERVER.PORT, () => {
      console.log('═══════════════════════════════════════════');
      console.log('  ⚔️  Expedition I Server v0.1.0');
      console.log(`  🌐 HTTP:      http://localhost:${SERVER.PORT}`);
      console.log(`  🔌 WS:        ws://localhost:${SERVER.PORT}${SERVER.WS_PATH}`);
      console.log(`  👁️  Spectator: http://localhost:${SERVER.PORT}/spectator`);
      console.log('═══════════════════════════════════════════');
    });

    // 3. Create WebSocket server
    wsServer = new ExpeditionWSServer(server);

    // 4. Create Expedition Engine (wired to WS broadcast)
    expeditionEngine = new ExpeditionEngine((msg) => wsServer.broadcast(msg));

    // 5. Create HTTP API
    httpApi = new HttpApi(expeditionEngine);

    // 6. Check for existing active expedition to resume
    if (process.env.DATABASE_URL) {
      const existing = await db.getCurrentExpedition();
      if (existing && existing.state_snapshot && existing.status !== 'registration') {
        console.log(`[Boot] Found active expedition #${existing.id} (${existing.status}), resuming...`);
        const snapshot = typeof existing.state_snapshot === 'string'
          ? JSON.parse(existing.state_snapshot)
          : existing.state_snapshot;
        await expeditionEngine.restore(existing.id, snapshot);
      } else if (existing) {
        console.log(`[Boot] Expedition #${existing.id} in registration phase, waiting...`);
      } else {
        console.log('[Boot] No active expedition. Create one via POST /api/expedition/create');
      }
    }

    // 7. Start daily scheduler (auto-registration at 12h05, auto-launch at 19h Paris)
    startDailyScheduler();

    console.log('[Boot] Ready!');
  } catch (err) {
    console.error('[Boot] Fatal error:', err);
    process.exit(1);
  }
}

// ── Daily scheduler: auto-registration at 12h05 + auto-launch at 19h Paris ──
let autoRegistrationFired = false;
let autoLaunchFired = false;

function startDailyScheduler() {
  setInterval(async () => {
    try {
      if (!expeditionEngine) return;

      const now = new Date();
      const parisNow = new Date(now.toLocaleString('en-US', { timeZone: EXPEDITION.TIMEZONE }));
      const hour = parisNow.getHours();
      const minute = parisNow.getMinutes();

      // Reset flags daily (at midnight)
      if (hour === 0 && minute < 2) {
        autoRegistrationFired = false;
        autoLaunchFired = false;
      }

      // ── Auto-registration at 12h05 Paris ──
      // Opens a new expedition for registration if the previous one is done
      if (hour === EXPEDITION.REGISTRATION_OPEN_HOUR && minute >= EXPEDITION.REGISTRATION_OPEN_MINUTE && minute < EXPEDITION.REGISTRATION_OPEN_MINUTE + 2 && !autoRegistrationFired) {
        autoRegistrationFired = true;

        const existing = await db.getCurrentExpedition();

        // Only create new if no expedition or previous one is finished/wiped
        if (!existing || existing.status === 'finished' || existing.status === 'wiped') {
          // Reset engine if it was in finished/wiped state
          if (expeditionEngine.status !== 'idle') {
            expeditionEngine.reset();
          }

          // Mark old expedition as done if needed
          if (existing && (existing.status === 'finished' || existing.status === 'wiped')) {
            // Already finalized, just ensure it's closed
          }

          // Create fresh expedition for today
          const newExp = await db.createExpedition('Expedition I', new Date());
          await db.updateExpeditionStatus(newExp.id, 'registration');
          console.log(`[AutoReg] 12h05 Paris — Nouvelle expedition #${newExp.id} ouverte aux inscriptions!`);
        } else if (existing.status === 'registration') {
          console.log(`[AutoReg] Expedition #${existing.id} deja en inscription, OK`);
        } else {
          console.log(`[AutoReg] Expedition #${existing.id} still active (${existing.status}), skipping`);
        }
      }

      // ── Auto-launch at configured hour:minute Paris ──
      const launchMin = EXPEDITION.LAUNCH_MINUTE || 0;
      if (hour === EXPEDITION.LAUNCH_HOUR && minute >= launchMin && minute < launchMin + 2 && !autoLaunchFired) {
        autoLaunchFired = true;

        // Engine must be idle (waiting for a start command)
        if (expeditionEngine.status !== 'idle') {
          console.log(`[AutoLaunch] Engine not idle (${expeditionEngine.status}), skipping`);
          return;
        }

        const expedition = await db.getCurrentExpedition();
        if (!expedition || expedition.status !== 'registration') {
          console.log('[AutoLaunch] No expedition in registration at 19h, skipping');
          return;
        }

        const entries = await db.getEntries(expedition.id);
        if (entries.length < EXPEDITION.MIN_PLAYERS_TO_START) {
          console.log(`[AutoLaunch] Not enough players (${entries.length}/${EXPEDITION.MIN_PLAYERS_TO_START}), skipping`);
          return;
        }

        console.log(`[AutoLaunch] 19h Paris — Starting expedition #${expedition.id} with ${entries.length} players!`);
        await expeditionEngine.start(expedition.id, entries);
        console.log('[AutoLaunch] Expedition started!');
      }
    } catch (err) {
      console.error('[Scheduler] Error:', err.message);
    }
  }, 30_000); // Check every 30 seconds

  // Log schedule
  const now = new Date();
  const parisNow = new Date(now.toLocaleString('en-US', { timeZone: EXPEDITION.TIMEZONE }));
  const lMin = EXPEDITION.LAUNCH_MINUTE || 0;
  console.log(`[Scheduler] Active — inscriptions a ${EXPEDITION.REGISTRATION_OPEN_HOUR}h${String(EXPEDITION.REGISTRATION_OPEN_MINUTE).padStart(2,'0')}, lancement a ${EXPEDITION.LAUNCH_HOUR}h${lMin ? String(lMin).padStart(2,'0') : ''} (Paris)`);
  console.log(`[Scheduler] Heure Paris actuelle: ${parisNow.getHours()}h${String(parisNow.getMinutes()).padStart(2,'0')}`);
}

boot();

// ── Graceful Shutdown ──
function shutdown() {
  console.log('[Expedition] Shutting down...');
  const cleanup = async () => {
    try {
      if (expeditionEngine && expeditionEngine.expeditionId) {
        await expeditionEngine.saveState();
      }
    } catch (e) {
      console.error('[Shutdown] Save error:', e.message);
    }
    if (wsServer) wsServer.shutdown();
    server.close(() => process.exit(0));
    // Force exit after 5s
    setTimeout(() => process.exit(1), 5000);
  };
  cleanup();
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
