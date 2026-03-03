import { EXPEDITION, ADMIN, LOOT } from '../config.js';
import * as db from '../db/queries.js';
import { getSRableItems, EXPEDITION_ITEMS, getItemById } from '../data/expeditionItems.js';
import { HUNTERS } from '../data/hunterData.js';
import { LOOT_TABLES, getLootTable } from '../data/lootTables.js';
import { BOSS_DEFINITIONS } from '../data/bossDefinitions.js';
import { ALL_SETS } from '../data/expeditionSets.js';
import { EXPEDITION_WEAPONS } from '../data/expeditionWeapons.js';

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
        case '/api/expedition/boss-loot': return this.getBossLoot(req, res);
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
  // Body: { username, deviceId, characterIds: ["h_kanae", ...], characterData: { h_kanae: { level, stars } }, srItems?: ["item_id", ...] }
  async register(req, res) {
    const body = await this.readBody(req);
    if (!body) return this.badRequest(res, 'Invalid JSON body');

    const { username, deviceId, characterIds, characterData, srItems } = body;

    if (!username || !characterIds || !Array.isArray(characterIds) || characterIds.length === 0) {
      return this.badRequest(res, 'Missing username or characterIds');
    }

    if (characterIds.length > EXPEDITION.HUNTERS_PER_PLAYER) {
      return this.badRequest(res, `Limite de ${EXPEDITION.HUNTERS_PER_PLAYER} hunters par joueur atteinte`);
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

    // Check total character slots (30 max across all players)
    const totalChars = await db.getTotalCharacterCount(expedition.id);
    if (totalChars + characterIds.length > EXPEDITION.MAX_CHARACTERS) {
      const remaining = EXPEDITION.MAX_CHARACTERS - totalChars;
      return this.badRequest(res, remaining <= 0
        ? `Expedition complete (${EXPEDITION.MAX_CHARACTERS}/${EXPEDITION.MAX_CHARACTERS})`
        : `Plus que ${remaining} place(s) disponible(s) — tu as selectionne ${characterIds.length} hunters`
      );
    }

    // Validate SR items (max 5 picks, can repeat)
    const validatedSrItems = [];
    if (Array.isArray(srItems) && srItems.length > 0) {
      if (srItems.length > LOOT.SR_PICKS_MAX) {
        return this.badRequest(res, `Maximum ${LOOT.SR_PICKS_MAX} SR picks per player`);
      }
      // Build set of all SR-eligible itemIds from boss loot tables
      const srableIds = new Set();
      for (let b = 1; b <= 15; b++) {
        for (const entry of getLootTable(`boss_${b}`)) {
          if (entry.setId || entry.weaponId) {
            srableIds.add(entry.itemId);
          } else {
            const item = getItemById(entry.itemId);
            if (item && ['armor', 'weapon', 'skin', 'skill_scroll'].includes(item.type)) {
              srableIds.add(entry.itemId);
            }
          }
        }
      }
      for (const itemId of srItems) {
        if (!srableIds.has(itemId)) {
          return this.badRequest(res, `Invalid SR item: ${itemId}`);
        }
        validatedSrItems.push(itemId);
      }
    }

    const entry = await db.registerPlayer(
      expedition.id, username, deviceId || null,
      characterIds, characterData || {}, validatedSrItems
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

    const [entries, totalChars] = await Promise.all([
      db.getEntries(expedition.id),
      db.getTotalCharacterCount(expedition.id),
    ]);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      expeditionId: expedition.id,
      totalCharacters: totalChars,
      maxCharacters: EXPEDITION.MAX_CHARACTERS,
      entries: entries.map(e => ({
        username: e.username,
        characterIds: e.character_ids,
        srItems: e.sr_items || [],
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

  // GET /api/expedition/boss-loot
  // Returns all 15 boss loot tables with FULL codex data (stats, set bonuses, weapon passives)
  getBossLoot(req, res) {
    const bosses = BOSS_DEFINITIONS.map((boss, i) => {
      const bossNum = i + 1;
      const table = getLootTable(`boss_${bossNum}`);

      const loot = table.map(entry => {
        // Determine if this item is SR-eligible (gear/sets/weapons/skins/scrolls only)
        let srEligible = false;
        if (entry.setId || entry.weaponId) {
          srEligible = true;
        } else {
          const item = getItemById(entry.itemId);
          if (item && ['armor', 'weapon', 'skin', 'skill_scroll'].includes(item.type)) {
            srEligible = true;
          }
        }

        // Build enriched item data
        const result = {
          itemId: entry.itemId,
          name: entry.name || entry.itemId,
          rarity: entry.rarity || 'common',
          dropChance: entry.dropChance,
          setId: entry.setId || null,
          weaponId: entry.weaponId || null,
          srEligible,
        };

        // ── Enrich from EXPEDITION_ITEMS (armor, basic weapons, consumables, etc.)
        const itemData = getItemById(entry.itemId);
        if (itemData) {
          result.type = itemData.type;
          result.slot = itemData.slot;
          result.stats = itemData.stats || null;
          result.description = itemData.description || null;
          result.binding = itemData.binding || null;
          if (itemData.setId) result.itemSetId = itemData.setId;
        }

        // ── Enrich set pieces from expeditionSets
        if (entry.setId && ALL_SETS[entry.setId]) {
          const set = ALL_SETS[entry.setId];
          result.type = result.type || 'set_piece';
          result.binding = result.binding || set.binding;
          result.setInfo = {
            name: set.name,
            zone: set.zone,
            targetClass: set.targetClass,
            bonus2pc: set.bonus2pc,
            bonus4pc: set.bonus4pc,
          };
        }

        // ── Enrich weapons from expeditionWeapons
        if (entry.weaponId && EXPEDITION_WEAPONS[entry.weaponId]) {
          const wpn = EXPEDITION_WEAPONS[entry.weaponId];
          result.type = 'weapon';
          result.slot = 'weapon';
          result.binding = wpn.binding;
          result.weaponInfo = {
            atk: wpn.atk,
            element: wpn.element,
            weaponType: wpn.type,
            bonus: wpn.bonus,
            passive: wpn.passive,
          };
        }

        return result;
      });

      return {
        bossId: bossNum,
        name: boss.name,
        zone: bossNum <= 5 ? 'foret' : bossNum <= 10 ? 'abysses' : 'neant',
        loot,
      };
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, bosses }));
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
