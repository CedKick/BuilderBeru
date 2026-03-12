// api/admin/hunter.js — Admin Hunter Editor (CRUD)
// Admin-only: manage hunter definitions stored in PostgreSQL.
// Progressive migration: raidData.js remains the fallback, DB is the source of truth when populated.

import { query } from '../_db/neon.js';
import { extractUser } from '../_utils/auth.js';

const ADMIN_USERNAME = 'kly';

// ── Validation constants ────────────────────────────────────
const VALID_ELEMENTS = ['fire', 'water', 'shadow', 'light'];
const VALID_CLASSES = ['assassin', 'fighter', 'mage', 'support', 'tank'];
const VALID_RARITIES = ['rare', 'legendaire', 'mythique'];
const VALID_PASSIVE_TYPES = [
  'permanent', 'lowHp', 'highHp', 'firstTurn', 'teamDef', 'teamAura',
  'aoeDmg', 'healBonus', 'buffBonus', 'vsBoss', 'vsDebuffed', 'vsLowHp',
  'stacking', 'critDmg', 'magicDmg', 'defIgnore', 'dotDmg', 'debuffBonus',
  'skillCd', 'chaotic', 'berserker',
];
const BASE_STAT_KEYS = ['hp', 'atk', 'def', 'spd', 'crit', 'res', 'mana'];
const MAX_NAME_LEN = 40;
const MAX_SKILLS = 5;

// ── Table creation ──────────────────────────────────────────
const TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS hunters_data (
    id SERIAL PRIMARY KEY,
    hunter_id VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(40) NOT NULL,
    element VARCHAR(16) NOT NULL,
    class VARCHAR(16) NOT NULL,
    rarity VARCHAR(16) NOT NULL DEFAULT 'legendaire',
    series VARCHAR(32),
    base_stats JSONB NOT NULL,
    growth_stats JSONB NOT NULL,
    skills JSONB NOT NULL DEFAULT '[]',
    passive_type VARCHAR(32),
    passive_params JSONB DEFAULT '{}',
    passive_desc TEXT,
    awakening_passives JSONB DEFAULT '{}',
    sprite_url TEXT,
    special BOOLEAN DEFAULT FALSE,
    status VARCHAR(16) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )
`;

let tableChecked = false;
async function ensureTable() {
  if (tableChecked) return;
  await query(TABLE_SQL);
  await query('CREATE INDEX IF NOT EXISTS idx_hd_element ON hunters_data(element)');
  await query('CREATE INDEX IF NOT EXISTS idx_hd_status ON hunters_data(status)');
  tableChecked = true;
}

// ── Auth helper ─────────────────────────────────────────────
async function requireAdmin(req, res) {
  const user = await extractUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }
  if (user.username.toLowerCase() !== ADMIN_USERNAME) {
    res.status(403).json({ error: 'Forbidden: Admin only' });
    return null;
  }
  return user;
}

// ── Validation ──────────────────────────────────────────────
function validateHunterData(data) {
  const errors = [];

  if (!data.hunter_id || typeof data.hunter_id !== 'string' || !/^h_[a-z0-9_]+$/.test(data.hunter_id)) {
    errors.push('hunter_id must match h_[a-z0-9_]+');
  }
  if (!data.name || data.name.length > MAX_NAME_LEN) {
    errors.push(`name required, max ${MAX_NAME_LEN} chars`);
  }
  if (!VALID_ELEMENTS.includes(data.element)) {
    errors.push(`element must be one of: ${VALID_ELEMENTS.join(', ')}`);
  }
  if (!VALID_CLASSES.includes(data.class)) {
    errors.push(`class must be one of: ${VALID_CLASSES.join(', ')}`);
  }
  if (!VALID_RARITIES.includes(data.rarity)) {
    errors.push(`rarity must be one of: ${VALID_RARITIES.join(', ')}`);
  }

  // Base stats
  if (!data.base_stats || typeof data.base_stats !== 'object') {
    errors.push('base_stats required (object with hp, atk, def, spd, crit, res, mana)');
  } else {
    for (const key of BASE_STAT_KEYS) {
      if (typeof data.base_stats[key] !== 'number' || data.base_stats[key] < 0) {
        errors.push(`base_stats.${key} must be a non-negative number`);
      }
    }
  }

  // Growth stats
  if (!data.growth_stats || typeof data.growth_stats !== 'object') {
    errors.push('growth_stats required (object with hp, atk, def, spd, crit, res, mana)');
  } else {
    for (const key of BASE_STAT_KEYS) {
      if (typeof data.growth_stats[key] !== 'number' || data.growth_stats[key] < 0) {
        errors.push(`growth_stats.${key} must be a non-negative number`);
      }
    }
  }

  // Skills
  if (!Array.isArray(data.skills) || data.skills.length === 0) {
    errors.push('skills must be a non-empty array');
  } else if (data.skills.length > MAX_SKILLS) {
    errors.push(`max ${MAX_SKILLS} skills`);
  } else {
    data.skills.forEach((s, i) => {
      if (!s.name) errors.push(`skills[${i}].name required`);
      if (typeof s.power !== 'number') errors.push(`skills[${i}].power must be a number`);
      if (typeof s.cdMax !== 'number') errors.push(`skills[${i}].cdMax must be a number`);
    });
  }

  // Passive
  if (data.passive_type && !VALID_PASSIVE_TYPES.includes(data.passive_type)) {
    errors.push(`passive_type must be one of: ${VALID_PASSIVE_TYPES.join(', ')}`);
  }

  return errors;
}

// ── CREATE ──────────────────────────────────────────────────
async function handleCreate(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const data = req.body;
  const errors = validateHunterData(data);
  if (errors.length > 0) return res.status(400).json({ error: 'Validation failed', details: errors });

  await ensureTable();

  // Check duplicate hunter_id
  const existing = await query('SELECT id FROM hunters_data WHERE hunter_id = $1', [data.hunter_id]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: `Hunter ${data.hunter_id} already exists. Use update instead.` });
  }

  const result = await query(`
    INSERT INTO hunters_data (
      hunter_id, name, element, class, rarity, series,
      base_stats, growth_stats, skills,
      passive_type, passive_params, passive_desc,
      awakening_passives, sprite_url, special
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
    RETURNING *
  `, [
    data.hunter_id, data.name, data.element, data.class, data.rarity,
    data.series || null,
    JSON.stringify(data.base_stats), JSON.stringify(data.growth_stats), JSON.stringify(data.skills),
    data.passive_type || null, JSON.stringify(data.passive_params || {}), data.passive_desc || null,
    JSON.stringify(data.awakening_passives || {}), data.sprite_url || null, data.special || false,
  ]);

  console.log(`[hunter-admin] Created hunter ${data.hunter_id} by ${admin.username}`);
  return res.status(201).json({ success: true, hunter: result.rows[0] });
}

// ── UPDATE ──────────────────────────────────────────────────
async function handleUpdate(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const data = req.body;
  if (!data.hunter_id) return res.status(400).json({ error: 'hunter_id required' });

  await ensureTable();

  const existing = await query('SELECT id FROM hunters_data WHERE hunter_id = $1', [data.hunter_id]);
  if (existing.rows.length === 0) {
    return res.status(404).json({ error: `Hunter ${data.hunter_id} not found` });
  }

  // Build dynamic SET clause — only update provided fields
  const updatable = {
    name: data.name,
    element: data.element,
    class: data.class,
    rarity: data.rarity,
    series: data.series,
    base_stats: data.base_stats ? JSON.stringify(data.base_stats) : undefined,
    growth_stats: data.growth_stats ? JSON.stringify(data.growth_stats) : undefined,
    skills: data.skills ? JSON.stringify(data.skills) : undefined,
    passive_type: data.passive_type,
    passive_params: data.passive_params ? JSON.stringify(data.passive_params) : undefined,
    passive_desc: data.passive_desc,
    awakening_passives: data.awakening_passives ? JSON.stringify(data.awakening_passives) : undefined,
    sprite_url: data.sprite_url,
    special: data.special,
  };

  const setClauses = [];
  const values = [];
  let paramIdx = 1;

  for (const [key, val] of Object.entries(updatable)) {
    if (val !== undefined) {
      setClauses.push(`${key} = $${paramIdx}`);
      values.push(val);
      paramIdx++;
    }
  }

  if (setClauses.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  setClauses.push(`updated_at = NOW()`);
  values.push(data.hunter_id);

  const result = await query(
    `UPDATE hunters_data SET ${setClauses.join(', ')} WHERE hunter_id = $${paramIdx} RETURNING *`,
    values
  );

  console.log(`[hunter-admin] Updated hunter ${data.hunter_id} by ${admin.username}`);
  return res.status(200).json({ success: true, hunter: result.rows[0] });
}

// ── DELETE (soft) ───────────────────────────────────────────
async function handleDelete(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const { hunter_id } = req.body;
  if (!hunter_id) return res.status(400).json({ error: 'hunter_id required' });

  await ensureTable();

  const result = await query(
    `UPDATE hunters_data SET status = 'disabled', updated_at = NOW() WHERE hunter_id = $1 AND status = 'active' RETURNING hunter_id`,
    [hunter_id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: `Hunter ${hunter_id} not found or already disabled` });
  }

  console.log(`[hunter-admin] Soft-deleted hunter ${hunter_id} by ${admin.username}`);
  return res.status(200).json({ success: true, deleted: hunter_id });
}

// ── LIST (public — all active hunters) ──────────────────────
async function handleList(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  await ensureTable();

  const result = await query(`
    SELECT hunter_id, name, element, class, rarity, series,
           base_stats, growth_stats, skills,
           passive_type, passive_params, passive_desc,
           awakening_passives, sprite_url, special,
           created_at, updated_at
    FROM hunters_data
    WHERE status = 'active'
    ORDER BY created_at ASC
  `);

  return res.status(200).json({
    success: true,
    count: result.rows.length,
    hunters: result.rows,
  });
}

// ── SEED — Import all hunters from raidData.js format ───────
async function handleSeed(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const { hunters, passives } = req.body;
  // hunters: { h_kanae: { name, element, ... }, ... }
  // passives: { h_kanae: { type, stats, ... }, ... }
  if (!hunters || typeof hunters !== 'object') {
    return res.status(400).json({ error: 'hunters object required (same format as HUNTERS from raidData.js)' });
  }

  await ensureTable();

  let created = 0;
  let skipped = 0;
  const errors = [];

  for (const [hunterId, h] of Object.entries(hunters)) {
    try {
      const passive = passives?.[hunterId] || {};
      const existing = await query('SELECT id FROM hunters_data WHERE hunter_id = $1', [hunterId]);
      if (existing.rows.length > 0) { skipped++; continue; }

      await query(`
        INSERT INTO hunters_data (
          hunter_id, name, element, class, rarity, series,
          base_stats, growth_stats, skills,
          passive_type, passive_params, passive_desc,
          sprite_url, special
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      `, [
        hunterId, h.name, h.element, h.class, h.rarity,
        h.series || null,
        JSON.stringify(h.base), JSON.stringify(h.growth), JSON.stringify(h.skills),
        passive.type || null,
        JSON.stringify(passive),
        h.passiveDesc || null,
        h.sprite || null, h.special || false,
      ]);
      created++;
    } catch (err) {
      errors.push(`${hunterId}: ${err.message}`);
    }
  }

  console.log(`[hunter-admin] Seed: ${created} created, ${skipped} skipped, ${errors.length} errors`);
  return res.status(200).json({ success: true, created, skipped, errors });
}

// ── Router ──────────────────────────────────────────────────
export default async function handler(req, res) {
  try {
    const action = req.query?.action || req.url?.split('action=')[1]?.split('&')[0];

    switch (action) {
      case 'create': return await handleCreate(req, res);
      case 'update': return await handleUpdate(req, res);
      case 'delete': return await handleDelete(req, res);
      case 'list':   return await handleList(req, res);
      case 'seed':   return await handleSeed(req, res);
      default:
        return res.status(400).json({
          error: 'Unknown action',
          valid: ['create', 'update', 'delete', 'list', 'seed'],
        });
    }
  } catch (err) {
    console.error('[hunter-admin] Error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}
