import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { SERVER, EXPEDITION } from './config.js';
import { ExpeditionEngine } from './engine/ExpeditionEngine.js';
import { HttpApi } from './network/HttpApi.js';
import * as db from './db/queries.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Real player inscription data from expedition #36 (2026-03-07) ──────────
const PLAYER_DATA = [
  {
    username: 'Kly',
    hunters: [
      { hunterId: 'h_frieren', fullStats: { hp: 24471, atk: 5866.6, def: 1070, spd: 923.7, crit: 396.6, res: 338.7, mana: 52301, manaRegen: 15, manaCostReduce: 20, waterDmgFlat: 4.5 }, stars: 286, level: 140, weaponId: 'w_katana_v', weaponPassive: 'katana_v_chaos', equippedSets: { pacte_ombres: 4, source_arcanique: 4 } },
      { hunterId: 'h_chae_in', fullStats: { hp: 30089, atk: 14523.8, def: 1213, spd: 1037.5, crit: 428.2, res: 269.6, mana: 5992, manaRegen: 15 }, stars: 303, level: 140, weaponId: 'tacos_eternel', weaponPassive: 'tacos_chaos', equippedSets: { rage_eternelle: 4, equilibre_supreme: 4 } },
      { hunterId: 'h_meri', fullStats: { hp: 32388.3, atk: 4631, def: 2218, spd: 903.5, crit: 188.7, res: 426.7, mana: 32858, manaRegen: 15 }, stars: 272, level: 140, weaponId: 'gae_bolg', weaponPassive: 'gae_bolg_pierce', equippedSets: { pacte_ombres: 4, aura_commandeur: 2, sacrifice_martyr: 2 } },
      { hunterId: 'h_megumin', fullStats: { hp: 14649, atk: 5175, def: 652, spd: 703.5, crit: 282.4, res: 243, mana: 34388, manaRegen: 15, manaCostReduce: 40 }, stars: 166, level: 140, weaponId: 'thyrsus', weaponPassive: null, equippedSets: { chaines_destin: 2, tempete_arcane: 2, resonance_arcanique: 4 } },
      { hunterId: 'h_lee_bora', fullStats: { hp: 18794, atk: 4711, def: 818, spd: 571.4, crit: 187.5, res: 223.1, mana: 31490, manaRegen: 15, manaCostReduce: 15 }, stars: 81, level: 140, weaponId: 'ea_staff', weaponPassive: 'ea_celestial', equippedSets: { pacte_ombres: 4, tempete_arcane: 2, esprit_transcendant: 2 } },
      { hunterId: 'h_mayuri', fullStats: { hp: 21248.1, atk: 4198, def: 926, spd: 605, crit: 123.8, res: 288.4, mana: 27751, manaRegen: 15, waterDmgFlat: 7.5 }, stars: 84, level: 140, weaponId: 'amenonuhoko', weaponPassive: 'amenonuhoko_divine', equippedSets: { pacte_ombres: 4, sacrifice_martyr: 2, esprit_transcendant: 2 } },
    ],
  },
  {
    username: 'Bobby',
    hunters: [
      { hunterId: 'h_meri', fullStats: { hp: 49260, atk: 5459, def: 1684, spd: 922.3, crit: 227.9, res: 544, mana: 34680, manaRegen: 15 }, stars: 280, level: 140, weaponId: 'amenonuhoko', weaponPassive: 'amenonuhoko_divine', equippedSets: { pacte_ombres: 4, benediction_celeste: 4 } },
      { hunterId: 'h_sian', fullStats: { hp: 24009, atk: 14030.9, def: 682, spd: 1054.4, crit: 437.8, res: 212.5, mana: 5806, manaRegen: 15 }, stars: 263, level: 140, weaponId: 'kusanagi', weaponPassive: 'kusanagi_shadow', equippedSets: { rage_eternelle: 4, fureur_desespoir: 1, ombre_souveraine: 3 } },
      { hunterId: 'h_ilhwan', fullStats: { hp: 27791, atk: 14917, def: 777, spd: 1104.3, crit: 564.1, res: 200.3, mana: 7494, manaRegen: 15 }, stars: 263, level: 140, weaponId: 'w_epee_monarque', weaponPassive: null, equippedSets: { ombre_souveraine: 4, infamie_chaotique: 4 } },
      { hunterId: 'h_son', fullStats: { hp: 29457, atk: 7753, def: 1503, spd: 474, crit: 324.3, res: 385.9, mana: 6594, manaRegen: 15 }, stars: 145, level: 140, weaponId: 'w_masse_tenebres', weaponPassive: null, equippedSets: { volonte_de_fer: 4, benediction_celeste: 4 } },
      { hunterId: 'h_isla', fullStats: { hp: 30751, atk: 5133, def: 994, spd: 642.9, crit: 264.1, res: 388.8, mana: 23139, manaRegen: 15 }, stars: 166, level: 140, weaponId: 'yggdrasil', weaponPassive: null, equippedSets: { pacte_ombres: 4, chaines_destin: 4 } },
      { hunterId: 'h_megumin', fullStats: { hp: 15851, atk: 6074, def: 279, spd: 647.2, crit: 408.5, res: 288.2, mana: 37719, manaRegen: 15, manaCostReduce: 40 }, stars: 189, level: 140, weaponId: 'w_katana_v', weaponPassive: 'katana_v_chaos', equippedSets: { tempete_arcane: 2, esprit_transcendant: 2, resonance_arcanique: 4 } },
    ],
  },
  {
    username: 'damon',
    hunters: [
      { hunterId: 'h_frieren', fullStats: { hp: 17442.7, atk: 9169, def: 1230, spd: 988, crit: 560.8, res: 510.2, mana: 12341, manaRegen: 15, fireDmgFlat: 6, waterDmgFlat: 10.6 }, stars: 224, level: 140, weaponId: 'w_katana_z', weaponPassive: 'katana_z_fury', equippedSets: { maree_eternelle: 1, fureur_desespoir: 1, ombre_souveraine: 1, sacrifice_martyr: 1, infamie_chaotique: 1, expertise_bestiale: 3 } },
      { hunterId: 'h_meri', fullStats: { hp: 43917.6, atk: 5393, def: 2258, spd: 952.6, crit: 357.1, res: 585.9, mana: 19616, manaRegen: 15, fireDmgFlat: 2, waterDmgFlat: 1 }, stars: 237, level: 140, weaponId: 'thyrsus', weaponPassive: null, equippedSets: { flamme_maudite: 1, volonte_de_fer: 2, expertise_bestiale: 1, benediction_celeste: 4 } },
      { hunterId: 'h_ilhwan', fullStats: { hp: 24834.3, atk: 12679.7, def: 1470, spd: 1275.2, crit: 628.7, res: 333.9, mana: 6401, manaRegen: 15, shadowDmgFlat: 7.2 }, stars: 230, level: 140, weaponId: 'w_epee_monarque', weaponPassive: null, equippedSets: { flamme_maudite: 1, volonte_de_fer: 1, infamie_chaotique: 4, expertise_bestiale: 2 } },
      { hunterId: 'h_isla', fullStats: { hp: 44779.8, atk: 4914, def: 1820, spd: 693.9, crit: 276.4, res: 450.1, mana: 6845, manaRegen: 15, shadowDmgFlat: 9.5 }, stars: 102, level: 140, weaponId: 'w_griffe_nuit', weaponPassive: null, equippedSets: { echo_temporel: 1, volonte_de_fer: 3, benediction_celeste: 4 } },
      { hunterId: 'h_gojo', fullStats: { hp: 16284, atk: 6698, def: 1402, spd: 867.1, crit: 552.7, res: 398.3, mana: 24571, manaRegen: 15, lightDmgFlat: 9.5 }, stars: 143, level: 140, weaponId: 'w_katana_v', weaponPassive: 'katana_v_chaos', equippedSets: { infamie_chaotique: 4, expertise_bestiale: 4 } },
      { hunterId: 'h_megumin', fullStats: { hp: 15685, atk: 6838, def: 893, spd: 867.1, crit: 526.5, res: 392.6, mana: 19906, manaRegen: 15, fireDmgFlat: 83.6 }, stars: 168, level: 140, weaponId: 'ea_staff', weaponPassive: 'ea_celestial', equippedSets: { flamme_maudite: 4, expertise_bestiale: 2 } },
    ],
  },
  {
    username: 'shy',
    hunters: [
      { hunterId: 'h_sian', fullStats: { hp: 11878, atk: 12948.6, def: 670, spd: 1085.6, crit: 456.8, res: 258.7, mana: 3402, manaRegen: 15, shadowDmgFlat: 10.7 }, stars: 305, level: 140, weaponPassive: 'shadow_silence' },
      { hunterId: 'h_ilhwan', fullStats: { hp: 15864, atk: 12944.6, def: 666, spd: 1082.4, crit: 516.6, res: 232, mana: 3169, manaRegen: 15, waterDmgFlat: 1 }, stars: 297, level: 140, weaponPassive: 'katana_z_fury' },
      { hunterId: 'h_son', fullStats: { hp: 17888, atk: 7891.2, def: 2191, spd: 357, crit: 134.2, res: 373.7, mana: 3992, manaRegen: 15 }, stars: 132, level: 140, weaponPassive: 'katana_v_chaos' },
      { hunterId: 'h_isla', fullStats: { hp: 8117, atk: 8140.4, def: 931, spd: 618.4, crit: 86.9, res: 259.8, mana: 2847, manaRegen: 15, lightDmgFlat: 1, shadowDmgFlat: 9 }, stars: 91, level: 140, weaponPassive: 'guldan_halo' },
      { hunterId: 'h_megumin', fullStats: { hp: 7963, atk: 11299.4, def: 463, spd: 623, crit: 412.8, res: 291.4, mana: 6071, manaRegen: 15, fireDmgFlat: 4 }, stars: 213, level: 140, weaponPassive: 'sulfuras_fury' },
      { hunterId: 'h_daijin', fullStats: { hp: 8258, atk: 10367.9, def: 533, spd: 696.5, crit: 384.9, res: 132.4, mana: 3216, manaRegen: 15, fireDmgFlat: 12, shadowDmgFlat: 6 }, stars: 106, level: 140, weaponPassive: null },
    ],
  },
];

// ─── Boot ─────────────────────────────────────────────────

const engine = new ExpeditionEngine();
const httpApi = new HttpApi(engine);

// ─── DB migration: add auto_register column if missing ───
import { query } from './db/pool.js';
query(`ALTER TABLE expedition_entries ADD COLUMN IF NOT EXISTS auto_register BOOLEAN DEFAULT FALSE`)
  .then(() => console.log('[Expedition v2] DB migration: auto_register column OK'))
  .catch(err => console.warn('[Expedition v2] DB migration skipped:', err.message));

// ─── Registration mode: create expedition in DB + auto-launch at 19h ───

async function ensureExpeditionExists() {
  const existing = await db.getCurrentExpedition();
  if (existing) {
    console.log(`[Expedition v2] Existing expedition #${existing.id} (status: ${existing.status})`);
    return existing;
  }
  const exp = await db.createExpedition('Expédition II', new Date());
  await db.updateExpeditionStatus(exp.id, 'registration');
  console.log(`[Expedition v2] Created new expedition #${exp.id} in registration mode`);

  // Auto-register: copy entries from previous expedition that had auto_register=true
  await copyAutoRegistrations(exp.id);

  return exp;
}

async function copyAutoRegistrations(newExpeditionId) {
  try {
    const prev = await db.getPreviousExpedition();
    if (!prev) return;
    const autoEntries = await db.getAutoRegisterEntries(prev.id);
    if (autoEntries.length === 0) return;
    for (const e of autoEntries) {
      await db.registerPlayer(
        newExpeditionId, e.username, e.device_id,
        e.character_ids, e.character_data, e.sr_items, true
      );
    }
    console.log(`[Expedition v2] Auto-registered ${autoEntries.length} players from expedition #${prev.id}`);
  } catch (err) {
    console.error('[Expedition v2] Auto-register copy failed:', err.message);
  }
}

ensureExpeditionExists().catch(err => console.error('[Expedition v2] DB init error:', err));

// Auto-launch check every 30s: if 19h Paris and expedition is in registration, start it
setInterval(async () => {
  try {
    if (engine.state !== 'idle') return; // Already running or no registration

    const expedition = await db.getCurrentExpedition();
    if (!expedition || expedition.status !== 'registration') return;

    const now = new Date();
    const paris = new Date(now.toLocaleString('en-US', { timeZone: EXPEDITION.TIMEZONE }));
    const h = paris.getHours();
    const m = paris.getMinutes();

    // Launch at 19h00 Paris (or later if server was down)
    if (h >= EXPEDITION.LAUNCH_HOUR) {
      const entries = await db.getEntries(expedition.id);
      if (entries.length === 0) {
        console.log('[Expedition v2] 19h reached but no players registered, waiting...');
        return;
      }
      console.log(`\n[Expedition v2] AUTO-LAUNCH at ${h}:${String(m).padStart(2,'0')} Paris — ${entries.length} players registered`);
      await engine.start(expedition.id, entries);
      await db.updateExpeditionStatus(expedition.id, 'running', { startedAt: new Date() });
    }
  } catch (err) {
    console.error('[Expedition v2] Auto-launch check error:', err);
  }
}, 30000);

// ─── HTTP Server ─────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  // Try HttpApi first (handles all /api/expedition/* routes)
  const apiResult = await httpApi.handle(req, res);
  if (apiResult !== null && apiResult !== undefined) return;
  // httpApi.handle returns null for unhandled routes

  // If res was already ended by httpApi, don't continue
  if (res.writableEnded) return;

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

  // Admin: skip to boss N (0-indexed)
  const skipMatch = req.url.match(/^\/api\/expedition\/skip-to-boss\/(\d+)$/);
  if (skipMatch) {
    const origin = req.headers.origin;
    if (SERVER.CORS_ORIGINS.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    const targetBoss = parseInt(skipMatch[1], 10);
    const ok = engine.skipToBoss(targetBoss);
    if (!ok) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Boss index must be 0-4' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, skippedTo: targetBoss }));
    return;
  }

  // Legacy status endpoint (used by spectator.html)
  if (req.url === '/api/expedition/status') {
    const origin = req.headers.origin;
    if (SERVER.CORS_ORIGINS.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(engine.getExpeditionState()));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

// ─── WebSocket for spectator ──────────────────────────────

const wss = new WebSocketServer({ server, path: '/ws' });
const spectators = new Set();

// Track which WS connections are controlling a player
const wsPlayers = new Map(); // ws -> playerId

wss.on('connection', (ws) => {
  spectators.add(ws);
  console.log(`[WS] Spectator connected (${spectators.size} total)`);

  // Send current state immediately
  const state = engine.getExpeditionState();
  ws.send(JSON.stringify({ type: 'expedition_state', data: state }));

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);

      // ── Take control of a hunter ──
      if (msg.type === 'take_control') {
        const hunterId = msg.hunterId;
        const playerId = engine.hunterSwitch.getOwnerPlayerId(hunterId);
        if (!playerId) return;

        wsPlayers.set(ws, playerId);

        const hunterIds = engine.hunterSwitch.getHunterIds(playerId);
        const slotIndex = hunterIds.indexOf(hunterId);
        if (slotIndex >= 0) {
          engine.handlePlayerInput(playerId, { type: 'switch_hunter', slotIndex });
        }

        ws.send(JSON.stringify({ type: 'control_ack', hunterId, playerId }));
        console.log(`[WS] Player took control of ${hunterId}`);
        return;
      }

      // ── Release control ──
      if (msg.type === 'release_control') {
        const playerId = wsPlayers.get(ws);
        if (playerId) {
          const activeId = engine.hunterSwitch.getActiveHunterId(playerId);
          if (activeId && engine.currentCombat) {
            engine.currentCombat.setHunterControl(activeId, false);
          }
          wsPlayers.delete(ws);
          ws.send(JSON.stringify({ type: 'control_released' }));
          console.log(`[WS] Player released control`);
        }
        return;
      }

      // ── Switch hunter (keys 1-6) ──
      if (msg.type === 'switch_hunter') {
        const playerId = wsPlayers.get(ws);
        if (playerId) {
          engine.handlePlayerInput(playerId, { type: 'switch_hunter', slotIndex: msg.slotIndex });
        }
        return;
      }

      // ── Game inputs (move, attack, skill, dodge) ──
      if (msg.type === 'input') {
        const playerId = wsPlayers.get(ws);
        if (!playerId) return;
        engine.handlePlayerInput(playerId, msg.input);
        return;
      }

    } catch (e) {
      // Ignore malformed messages
    }
  });

  ws.on('close', () => {
    const playerId = wsPlayers.get(ws);
    if (playerId) {
      const activeId = engine.hunterSwitch.getActiveHunterId(playerId);
      if (activeId && engine.currentCombat) {
        engine.currentCombat.setHunterControl(activeId, false);
      }
      wsPlayers.delete(ws);
      console.log(`[WS] Controller disconnected, released ${playerId}`);
    }
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
  console.log(`[Expedition v2] API: http://localhost:${SERVER.PORT}/api/expedition/*`);
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
