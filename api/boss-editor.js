// api/boss-editor.js — Custom Boss CRUD ("Forge un Boss")
// Actions: create, update, list, my-bosses, get, delete, init

import { query } from './_db/neon.js';
import { extractUser } from './_utils/auth.js';

// ── Validation constants ────────────────────────────────
const MAX_NAME_LEN = 50;
const MAX_DESC_LEN = 300;
const MAX_BOSSES_PER_USER = 5;
const MAX_CONFIG_SIZE = 512_000; // 500KB max for boss config JSON
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 1 week between creations

const BANNED_WORDS = ['admin', 'system', 'hack', 'cheat', 'exploit', 'nigga', 'nazi', 'hitler', 'porn', 'sex'];

// ── Table creation ──────────────────────────────────────
const TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS custom_bosses (
    id SERIAL PRIMARY KEY,
    boss_id VARCHAR(64) NOT NULL UNIQUE,
    creator_username VARCHAR(20) NOT NULL,
    creator_device_id VARCHAR(64) NOT NULL,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    config JSONB NOT NULL DEFAULT '{}',
    pattern_count INTEGER DEFAULT 0,
    phase_count INTEGER DEFAULT 0,
    status VARCHAR(16) DEFAULT 'draft',
    play_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )
`;

let tableChecked = false;
async function ensureTable() {
  if (tableChecked) return;
  await query(TABLE_SQL);
  await query('CREATE INDEX IF NOT EXISTS idx_cb_creator ON custom_bosses(creator_device_id)');
  await query('CREATE INDEX IF NOT EXISTS idx_cb_status ON custom_bosses(status)');
  await query('CREATE INDEX IF NOT EXISTS idx_cb_created ON custom_bosses(created_at DESC)');
  tableChecked = true;
}

// ── Validation helpers ──────────────────────────────────
function sanitizeName(name) {
  if (!name || typeof name !== 'string') return null;
  const trimmed = name.trim().slice(0, MAX_NAME_LEN);
  if (trimmed.length < 2) return null;
  const lower = trimmed.toLowerCase();
  if (BANNED_WORDS.some(w => lower.includes(w))) return null;
  return trimmed;
}

function validateConfig(config) {
  if (!config || typeof config !== 'object') return 'Config manquante';
  const json = JSON.stringify(config);
  if (json.length > MAX_CONFIG_SIZE) return `Config trop volumineuse (${(json.length / 1024).toFixed(0)}KB > 500KB)`;
  // Basic structure checks
  if (typeof config.hp !== 'number' || config.hp <= 0) return 'HP invalide';
  if (typeof config.atk !== 'number' || config.atk <= 0) return 'ATK invalide';
  if (!Array.isArray(config.phases) || config.phases.length === 0) return 'Au moins 1 phase requise';
  if (!Array.isArray(config.patterns)) return 'Patterns doit être un tableau';
  return null; // valid
}

// ── Handlers ────────────────────────────────────────────

async function handleCreate(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  await ensureTable();

  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { name, description, config } = req.body;

  // Validate name
  const cleanName = sanitizeName(name);
  if (!cleanName) return res.status(400).json({ error: 'Nom invalide (2-50 chars, pas de mots interdits)' });

  // Validate config
  const configError = validateConfig(config);
  if (configError) return res.status(400).json({ error: configError });

  // Check boss limit per user
  const countResult = await query(
    `SELECT COUNT(*) as cnt FROM custom_bosses WHERE creator_device_id = $1 AND status != 'deleted'`,
    [user.deviceId]
  );
  if (parseInt(countResult.rows[0].cnt) >= MAX_BOSSES_PER_USER) {
    return res.status(400).json({ error: `Maximum ${MAX_BOSSES_PER_USER} boss par joueur. Supprime un boss existant.` });
  }

  // Cooldown check
  const lastResult = await query(
    `SELECT created_at FROM custom_bosses WHERE creator_device_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [user.deviceId]
  );
  if (lastResult.rows.length > 0) {
    const lastTime = new Date(lastResult.rows[0].created_at).getTime();
    if (Date.now() - lastTime < COOLDOWN_MS) {
      const nextAt = new Date(lastTime + COOLDOWN_MS).toISOString();
      return res.status(429).json({ error: 'Cooldown actif — 1 boss par semaine', nextCreateAt: nextAt });
    }
  }

  const bossId = `boss_${user.username}_${Date.now().toString(36)}`;
  const desc = (description || '').slice(0, MAX_DESC_LEN);
  const patternCount = config.patterns?.length || 0;
  const phaseCount = config.phases?.length || 0;

  // Strip sprites from config (they'll be uploaded separately via CDN later)
  const cleanConfig = { ...config };
  if (cleanConfig.spriteUrl && cleanConfig.spriteUrl.startsWith('data:')) {
    cleanConfig.spriteUrl = null; // Don't store base64 in DB
  }
  if (cleanConfig.mapBg && cleanConfig.mapBg.startsWith('data:')) {
    cleanConfig.mapBg = null;
  }

  await query(
    `INSERT INTO custom_bosses (boss_id, creator_username, creator_device_id, name, description, config, pattern_count, phase_count, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'draft')`,
    [bossId, user.username, user.deviceId, cleanName, desc, JSON.stringify(cleanConfig), patternCount, phaseCount]
  );

  console.log(`[BossEditor] Created boss "${cleanName}" by ${user.username} (${bossId})`);
  return res.json({ success: true, bossId, name: cleanName });
}

async function handleUpdate(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  await ensureTable();

  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { bossId, name, description, config } = req.body;
  if (!bossId) return res.status(400).json({ error: 'bossId requis' });

  // Validate config if provided
  if (config) {
    const configError = validateConfig(config);
    if (configError) return res.status(400).json({ error: configError });
  }

  // Check ownership
  const existing = await query(
    `SELECT id, status FROM custom_bosses WHERE boss_id = $1 AND creator_device_id = $2 AND status != 'deleted'`,
    [bossId, user.deviceId]
  );
  if (existing.rows.length === 0) {
    return res.status(404).json({ error: 'Boss non trouvé ou pas le tien.' });
  }

  // Build update
  const sets = ['updated_at = NOW()'];
  const params = [];
  let paramIdx = 1;

  if (name) {
    const cleanName = sanitizeName(name);
    if (!cleanName) return res.status(400).json({ error: 'Nom invalide' });
    sets.push(`name = $${paramIdx++}`);
    params.push(cleanName);
  }
  if (description !== undefined) {
    sets.push(`description = $${paramIdx++}`);
    params.push((description || '').slice(0, MAX_DESC_LEN));
  }
  if (config) {
    const cleanConfig = { ...config };
    if (cleanConfig.spriteUrl && cleanConfig.spriteUrl.startsWith('data:')) cleanConfig.spriteUrl = null;
    if (cleanConfig.mapBg && cleanConfig.mapBg.startsWith('data:')) cleanConfig.mapBg = null;
    sets.push(`config = $${paramIdx++}`);
    params.push(JSON.stringify(cleanConfig));
    sets.push(`pattern_count = $${paramIdx++}`);
    params.push(config.patterns?.length || 0);
    sets.push(`phase_count = $${paramIdx++}`);
    params.push(config.phases?.length || 0);
  }

  params.push(bossId);
  params.push(user.deviceId);

  await query(
    `UPDATE custom_bosses SET ${sets.join(', ')} WHERE boss_id = $${paramIdx++} AND creator_device_id = $${paramIdx}`,
    params
  );

  console.log(`[BossEditor] Updated boss ${bossId} by ${user.username}`);
  return res.json({ success: true, bossId });
}

async function handleList(req, res) {
  await ensureTable();

  const limit = Math.min(parseInt(req.query?.limit) || 20, 50);
  const offset = parseInt(req.query?.offset) || 0;
  const status = req.query?.status || 'published';

  const result = await query(
    `SELECT boss_id, creator_username, name, description, pattern_count, phase_count, status, play_count, created_at, updated_at,
            config->'hp' as hp, config->'atk' as atk, config->'color' as color, config->'radius' as radius
     FROM custom_bosses
     WHERE status = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [status, limit, offset]
  );

  return res.json({ success: true, bosses: result.rows, count: result.rowCount });
}

async function handleMyBosses(req, res) {
  await ensureTable();

  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const result = await query(
    `SELECT boss_id, name, description, pattern_count, phase_count, status, play_count, created_at, updated_at
     FROM custom_bosses
     WHERE creator_device_id = $1 AND status != 'deleted'
     ORDER BY updated_at DESC`,
    [user.deviceId]
  );

  // Cooldown info
  let nextCreateAt = null;
  if (result.rows.length > 0) {
    const lastCreated = new Date(result.rows[0].created_at).getTime();
    const nextTime = lastCreated + COOLDOWN_MS;
    if (nextTime > Date.now()) nextCreateAt = new Date(nextTime).toISOString();
  }

  return res.json({ success: true, bosses: result.rows, nextCreateAt });
}

async function handleGet(req, res) {
  await ensureTable();

  const bossId = req.query?.bossId || req.query?.id;
  if (!bossId) return res.status(400).json({ error: 'bossId requis' });

  const result = await query(
    `SELECT boss_id, creator_username, name, description, config, pattern_count, phase_count, status, play_count, created_at, updated_at
     FROM custom_bosses
     WHERE boss_id = $1 AND status != 'deleted'`,
    [bossId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Boss non trouvé.' });
  }

  return res.json({ success: true, boss: result.rows[0] });
}

async function handleDelete(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  await ensureTable();

  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { bossId } = req.body;
  if (!bossId) return res.status(400).json({ error: 'bossId requis' });

  const result = await query(
    `UPDATE custom_bosses SET status = 'deleted', updated_at = NOW()
     WHERE boss_id = $1 AND creator_device_id = $2 AND status != 'deleted'
     RETURNING boss_id`,
    [bossId, user.deviceId]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Boss non trouvé ou pas le tien.' });
  }

  console.log(`[BossEditor] Deleted boss ${bossId} by ${user.username}`);
  return res.json({ success: true, deleted: bossId });
}

// ── Main router ─────────────────────────────────────────
export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin;
  if (['https://builderberu.com', 'https://www.builderberu.com', 'http://localhost:5173'].includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const action = req.query?.action || req.url?.split('action=')[1]?.split('&')[0];

    switch (action) {
      case 'create':     return handleCreate(req, res);
      case 'update':     return handleUpdate(req, res);
      case 'list':       return handleList(req, res);
      case 'my-bosses':  return handleMyBosses(req, res);
      case 'get':        return handleGet(req, res);
      case 'delete':     return handleDelete(req, res);
      case 'init':
        await ensureTable();
        return res.json({ success: true, message: 'custom_bosses table ready' });
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err) {
    console.error('[BossEditor] Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
