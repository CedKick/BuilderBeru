import { EXPEDITION, ADMIN } from '../config.js';
import * as db from '../db/queries.js';
import { getSRableItems, EXPEDITION_ITEMS } from '../data/expeditionItems.js';
import { HUNTERS } from '../data/hunterData.js';

// ── HTTP API for Expedition ──
// Handles registration, SR selection, status queries, and loot history.

export class HttpApi {
  constructor(expeditionEngine) {
    this.engine = expeditionEngine;
  }

  // Main router
  async handle(req, res) {
    const url = new URL(req.url, `http://localhost`);
    const path = url.pathname;

    // CORS
    const origin = req.headers.origin;
    if (['https://builderberu.com', 'http://localhost:5173', 'http://localhost:3000'].includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(200); res.end(); return;
    }

    // Admin gate check
    if (ADMIN.ENABLED) {
      const adminKey = url.searchParams.get('key');
      if (!ADMIN.ALLOWED_USERS.includes(adminKey)) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Access restricted' }));
        return;
      }
    }

    try {
      switch (path) {
        case '/api/expedition/current':  return await this.getCurrent(req, res);
        case '/api/expedition/register': return await this.register(req, res);
        case '/api/expedition/unregister': return await this.unregister(req, res);
        case '/api/expedition/entries':  return await this.getEntries(req, res);
        case '/api/expedition/items':    return this.getItems(req, res);
        case '/api/expedition/loot':     return await this.getLoot(req, res);
        case '/api/expedition/state':    return this.getState(req, res);
        // Admin: create/start expedition manually
        case '/api/expedition/create':   return await this.createExpedition(req, res);
        case '/api/expedition/force-start': return await this.forceStart(req, res);
        case '/api/expedition/reset': return await this.resetExpedition(req, res);
        default:
          return null;  // Not handled by API
      }
    } catch (err) {
      console.error('[API] Error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  // GET /api/expedition/current
  async getCurrent(req, res) {
    const expedition = await db.getCurrentExpedition();
    const engineStatus = this.engine.getStatus();

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      expedition: expedition || null,
      live: engineStatus,
    }));
  }

  // POST /api/expedition/register
  // Body: { username, deviceId, characterIds: ["h_kanae", ...], characterData: { h_kanae: { level, stars } }, srItemId? }
  async register(req, res) {
    const body = await this.readBody(req);
    if (!body) return this.badRequest(res, 'Invalid JSON body');

    const { username, deviceId, characterIds, characterData, srItemId } = body;

    if (!username || !characterIds || !Array.isArray(characterIds) || characterIds.length === 0) {
      return this.badRequest(res, 'Missing username or characterIds');
    }

    if (characterIds.length > EXPEDITION.HUNTERS_PER_PLAYER) {
      return this.badRequest(res, `Maximum ${EXPEDITION.HUNTERS_PER_PLAYER} characters per player`);
    }

    // Validate hunter IDs
    for (const id of characterIds) {
      if (!HUNTERS[id]) {
        return this.badRequest(res, `Unknown hunter: ${id}`);
      }
    }

    // Get current expedition
    const expedition = await db.getCurrentExpedition();
    if (!expedition) {
      return this.badRequest(res, 'No active expedition to register for');
    }

    if (expedition.status !== 'registration') {
      return this.badRequest(res, 'Registration is closed for this expedition');
    }

    // Check max players
    const count = await db.getEntryCount(expedition.id);
    if (count >= EXPEDITION.MAX_PLAYERS) {
      return this.badRequest(res, 'Expedition is full');
    }

    // Validate SR item
    if (srItemId) {
      const srableItems = getSRableItems();
      if (!srableItems.find(i => i.id === srItemId)) {
        return this.badRequest(res, `Invalid SR item: ${srItemId}`);
      }
    }

    const entry = await db.registerPlayer(
      expedition.id, username, deviceId || null,
      characterIds, characterData || {}, srItemId || null
    );

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, entry }));
  }

  // POST /api/expedition/unregister
  // Body: { username }
  async unregister(req, res) {
    const body = await this.readBody(req);
    if (!body?.username) return this.badRequest(res, 'Missing username');

    const expedition = await db.getCurrentExpedition();
    if (!expedition || expedition.status !== 'registration') {
      return this.badRequest(res, 'Cannot unregister: no active registration');
    }

    await db.unregisterPlayer(expedition.id, body.username);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
  }

  // GET /api/expedition/entries
  async getEntries(req, res) {
    const expedition = await db.getCurrentExpedition() || await db.getLatestExpedition();
    if (!expedition) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, entries: [] }));
      return;
    }

    const entries = await db.getEntries(expedition.id);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      expeditionId: expedition.id,
      entries: entries.map(e => ({
        username: e.username,
        characterIds: e.character_ids,
        srItemId: e.sr_item_id,
        joinedAt: e.joined_at,
      })),
    }));
  }

  // GET /api/expedition/items
  getItems(req, res) {
    const srableItems = getSRableItems();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      items: srableItems,
    }));
  }

  // GET /api/expedition/loot
  async getLoot(req, res) {
    const expedition = await db.getCurrentExpedition() || await db.getLatestExpedition();
    if (!expedition) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, loot: [] }));
      return;
    }

    const loot = await db.getLootHistory(expedition.id);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, loot }));
  }

  // GET /api/expedition/state (full current state for late joiners)
  getState(req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      ...this.engine.getStatus(),
    }));
  }

  // POST /api/expedition/create (admin)
  async createExpedition(req, res) {
    const body = await this.readBody(req);
    const name = body?.name || 'Expedition I';
    const scheduledAt = body?.scheduledAt ? new Date(body.scheduledAt) : new Date();

    const expedition = await db.createExpedition(name, scheduledAt);
    await db.updateExpeditionStatus(expedition.id, 'registration');

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, expedition }));
  }

  // POST /api/expedition/force-start (admin: start immediately)
  async forceStart(req, res) {
    const expedition = await db.getCurrentExpedition();
    if (!expedition) {
      return this.badRequest(res, 'No expedition to start');
    }

    if (this.engine.status !== 'idle') {
      return this.badRequest(res, 'Engine is already running');
    }

    const entries = await db.getEntries(expedition.id);
    if (entries.length === 0) {
      return this.badRequest(res, 'No players registered');
    }

    await this.engine.start(expedition.id, entries);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Expedition started!' }));
  }

  // POST /api/expedition/reset (admin: stop current and create new)
  async resetExpedition(req, res) {
    // Stop engine if running
    this.engine.reset();

    // Mark current expedition as wiped in DB
    const expedition = await db.getCurrentExpedition();
    if (expedition) {
      await db.updateExpeditionStatus(expedition.id, 'wiped', { endedAt: new Date() });
    }

    // Create a fresh expedition
    const newExp = await db.createExpedition('Expedition I', new Date());
    await db.updateExpeditionStatus(newExp.id, 'registration');

    console.log('[API] Expedition reset, new expedition:', newExp.id);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, expedition: newExp }));
  }

  // ── Helpers ─────────────────────────────────────────

  async readBody(req) {
    return new Promise((resolve) => {
      if (req.method !== 'POST') { resolve(null); return; }
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch { resolve(null); }
      });
    });
  }

  badRequest(res, message) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: message }));
  }
}
