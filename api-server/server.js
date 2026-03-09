/**
 * BuilderBeru API Server — Express wrapper for Vercel serverless handlers.
 * Runs on DigitalOcean alongside existing game servers.
 * Port 3005 (nginx proxies /api/* here).
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';

// ─── Import all Vercel handlers (zero refactoring — same req/res interface) ───
import authHandler from '../api/auth.js';
import adminHandler from '../api/admin.js';
import mailHandler from '../api/mail.js';
import factionsHandler from '../api/factions.js';
import pvpHandler from '../api/pvp.js';
import pveRankingHandler from '../api/pve-ranking.js';
import raidRankingHandler from '../api/raid-ranking.js';
import raidProfileHandler from '../api/raid-profile.js';
import dropLogHandler from '../api/drop-log.js';
import beruMessagesHandler from '../api/beru-messages.js';
import forgeHandler from '../api/forge.js';

import storageInitHandler from '../api/storage/init.js';
import storageLoadHandler from '../api/storage/load.js';
import storageSaveHandler from '../api/storage/save.js';
import storageLoadRaidHandler from '../api/storage/load-raid.js';
import storageDepositRaidHandler from '../api/storage/deposit-raid.js';
import storageDepositAlkahestHandler from '../api/storage/deposit-alkahest.js';
import storageDepositExpeditionHandler from '../api/storage/deposit-expedition.js';
import storageForgeRougeHandler from '../api/storage/forge-rouge.js';
import storageRerollHandler from '../api/storage/reroll.js';
import storageDiagnosticsHandler from '../api/storage/diagnostics.js';

import vacuumHandler from '../api/cron/vacuum.js';
import backupHandler from '../api/cron/backup.js';
import backupListHandler from '../api/cron/backup-list.js';
import backupRestoreHandler from '../api/cron/backup-restore.js';

// Kaisel handlers — some are empty stubs, import only the ones that exist
const kaiselNoop = (req, res) => res.json({ success: true, message: 'Not implemented yet' });
let kaiselCollectNews = kaiselNoop;
let kaiselCollectStreams = kaiselNoop;
let kaiselCollectVideos = kaiselNoop;
let kaiselGetNews = kaiselNoop;
let kaiselGetStreams = kaiselNoop;
let kaiselGetVideos = kaiselNoop;
try { const m = await import('../api/kaisel/get-streams.js'); if (m.default) kaiselGetStreams = m.default; } catch {}
try { const m = await import('../api/kaisel/get-news.js'); if (m.default) kaiselGetNews = m.default; } catch {}
try { const m = await import('../api/kaisel/get-videos.js'); if (m.default) kaiselGetVideos = m.default; } catch {}

const app = express();
const PORT = process.env.PORT || 3005;

// ─── Middleware ───────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));

app.use(cors({
  origin: ['https://builderberu.com', 'https://www.builderberu.com', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'If-None-Match', 'X-Server-Secret'],
  exposedHeaders: ['ETag'],
}));

// ─── Routes — action-based handlers use app.all() ────────

// Auth (uses ?action= query param)
app.all('/api/auth', authHandler);

// Admin
app.all('/api/admin', adminHandler);

// Mail
app.all('/api/mail', mailHandler);

// Factions
app.all('/api/factions', factionsHandler);

// PVP
app.all('/api/pvp', pvpHandler);

// PVE Ranking
app.all('/api/pve-ranking', pveRankingHandler);

// Raid
app.all('/api/raid-ranking', raidRankingHandler);
app.all('/api/raid-profile', raidProfileHandler);

// Drop log
app.all('/api/drop-log', dropLogHandler);

// Beru messages
app.all('/api/beru-messages', beruMessagesHandler);

// Forge du Monarque (community weapons)
app.all('/api/forge', forgeHandler);

// Storage
app.post('/api/storage/init', storageInitHandler);
app.get('/api/storage/load', storageLoadHandler);
app.post('/api/storage/save', storageSaveHandler);
app.get('/api/storage/load-raid', storageLoadRaidHandler);
app.post('/api/storage/deposit-raid', storageDepositRaidHandler);
app.post('/api/storage/deposit-alkahest', storageDepositAlkahestHandler);
app.post('/api/storage/deposit-expedition', storageDepositExpeditionHandler);
app.post('/api/storage/forge-rouge', storageForgeRougeHandler);
app.post('/api/storage/reroll', storageRerollHandler);
app.get('/api/storage/diagnostics', storageDiagnosticsHandler);

// Cron
app.all('/api/cron/vacuum', vacuumHandler);
app.all('/api/cron/backup', backupHandler);
app.get('/api/cron/backup-list', backupListHandler);
app.post('/api/cron/backup-restore', backupRestoreHandler);

// Kaisel
app.post('/api/kaisel/collect-news', kaiselCollectNews);
app.post('/api/kaisel/collect-streams', kaiselCollectStreams);
app.post('/api/kaisel/collect-videos', kaiselCollectVideos);
app.get('/api/kaisel/get-news', kaiselGetNews);
app.get('/api/kaisel/get-streams', kaiselGetStreams);
app.get('/api/kaisel/get-videos', kaiselGetVideos);

// ─── Health check ────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'builderberu-api', port: PORT, uptime: process.uptime() });
});

// ─── Cron: VACUUM daily at 4 AM UTC ─────────────────────
cron.schedule('0 4 * * *', () => {
  console.log('[cron] Running daily VACUUM...');
  const fakeReq = { method: 'GET', headers: {}, query: {} };
  const fakeRes = {
    status: (code) => ({ json: (data) => console.log(`[cron] VACUUM done (${code}):`, data?.message || 'ok'), end: () => {} }),
    setHeader: () => {},
  };
  vacuumHandler(fakeReq, fakeRes);
});

// ─── Cron: BACKUP daily at 3 AM UTC (before vacuum) ─────
cron.schedule('0 3 * * *', () => {
  console.log('[cron] Running daily BACKUP...');
  const fakeReq = { method: 'GET', headers: { authorization: `Bearer ${process.env.CRON_SECRET}` }, query: {} };
  const fakeRes = {
    status: (code) => ({ json: (data) => console.log(`[cron] BACKUP done (${code}):`, JSON.stringify(data)), end: () => {} }),
    setHeader: () => {},
  };
  backupHandler(fakeReq, fakeRes);
});

// ─── Start ───────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[builderberu-api] Running on port ${PORT}`);
  console.log(`[builderberu-api] ${Object.keys(app._router?.stack || []).length} routes registered`);
});
