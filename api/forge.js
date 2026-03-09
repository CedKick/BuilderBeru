// api/forge.js — Community Weapon Forge ("La Forge du Monarque")
// Actions: create, list, my-weapons, weapon, delete, templates

import { query } from './_db/neon.js';
import { extractUser } from './_utils/auth.js';

// ── Shared constants (duplicated from forgePassiveTemplates.js for server) ────
const VALID_WEAPON_TYPES = ['blade', 'heavy', 'polearm', 'ranged', 'staff', 'scythe', 'shield'];
const VALID_ELEMENTS = ['fire', 'water', 'shadow', 'light', 'wind', 'earth', null];
const VALID_RARITIES = ['rare', 'legendaire', 'mythique'];
const RARITY_MAX_ATK = { rare: 120, legendaire: 200, mythique: 300 };
const OFFENSIVE_ELEMENTS = ['fire', 'shadow', 'light'];

const VALID_BONUS_STATS = [
  'crit_rate', 'crit_dmg', 'atk_pct', 'def_pct', 'hp_pct', 'int_pct', 'spd_flat',
  'res_flat', 'defPen', 'allDamage', 'fireDamage', 'waterDamage',
  'shadowDamage', 'lightDamage',
];

const VALID_PASSIVE_IDS = [
  'none',
  // Offensive (based on real passives)
  'innerFlameStack', 'burnProc', 'desperateFury', 'chainLightning',
  'dragonSlayer', 'defIgnore', 'cursedBlade',
  // Defensive
  'lifesteal', 'dodgeCounter', 'celestialShield', 'ironGuard', 'guardianShield',
  // Utility
  'devoration', 'commanderAura', 'manaFlow', 'echoCD', 'healBoost',
  // Drawback (negative stat + compensation)
  'cursedPact', 'berserkerRage', 'voidSacrifice', 'deathLink', 'sharedCurse',
  // Stackable advanced
  'powerAccumulation', 'combatEcho',
];

const VALID_AWAKENING_STATS = [
  'atk_pct', 'def_pct', 'hp_pct', 'int_pct', 'crit_rate', 'crit_dmg', 'spd_flat',
  'defPen', 'allDamage', 'fireDamage', 'waterDamage', 'shadowDamage', 'lightDamage',
];

const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 1 week
const MAX_NAME_LEN = 40;
const MAX_DESC_LEN = 200;
const MAX_WEAPONS_PER_USER = 20;

const BANNED_WORDS = ['admin', 'system', 'hack', 'cheat', 'exploit', 'nigga', 'nazi', 'hitler', 'porn', 'sex'];

// ── Table creation ───────────────────────────────────────
const TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS community_weapons (
    id SERIAL PRIMARY KEY,
    weapon_id VARCHAR(64) NOT NULL UNIQUE,
    creator_username VARCHAR(20) NOT NULL,
    creator_device_id VARCHAR(64) NOT NULL,
    name VARCHAR(40) NOT NULL,
    element VARCHAR(16),
    weapon_type VARCHAR(16) NOT NULL,
    rarity VARCHAR(16) NOT NULL DEFAULT 'legendaire',
    sprite_url TEXT,
    icon VARCHAR(8) DEFAULT '⚔️',
    desc_fr TEXT,
    atk INTEGER NOT NULL,
    bonus_stat VARCHAR(32),
    bonus_value NUMERIC(6,2) DEFAULT 0,
    scaling_stat VARCHAR(8),
    passive_template_id VARCHAR(64) DEFAULT 'none',
    passive_params JSONB DEFAULT '{}',
    power_score INTEGER NOT NULL,
    drop_rate NUMERIC(10,6) NOT NULL,
    awakening_passives JSONB DEFAULT '[]',
    status VARCHAR(16) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )
`;

let tableChecked = false;
async function ensureTable() {
  if (tableChecked) return;
  await query(TABLE_SQL);
  await query('CREATE INDEX IF NOT EXISTS idx_cw_creator ON community_weapons(creator_username)');
  await query('CREATE INDEX IF NOT EXISTS idx_cw_status ON community_weapons(status)');
  await query('CREATE INDEX IF NOT EXISTS idx_cw_power ON community_weapons(power_score DESC)');
  // Multi-passives column (added v2)
  await query(`ALTER TABLE community_weapons ADD COLUMN IF NOT EXISTS passives JSONB DEFAULT '[]'`);
  tableChecked = true;
}

// ── Multi-passive synergy tax ────────────────────────────
const MULTI_PASSIVE_TAX = [0, 0, 10, 25]; // [0, 1, 2, 3 passives]

// ── Power score calculation (server-side, authoritative) ─
function computeRarityServer(powerScore) {
  if (powerScore < 40) return 'rare';
  if (powerScore < 75) return 'legendaire';
  return 'mythique';
}

function computePowerScoreServer({ atk, element, bonusStat, bonusValue, passives, passiveId, passiveParams, awakeningPassives }) {
  let score = 0;
  score += Math.floor((atk || 0) / 10);
  if (OFFENSIVE_ELEMENTS.includes(element)) score += 5;
  else if (element) score += 2;

  // Bonus stat — simplified cost
  const STAT_COSTS = {
    crit_rate: 1.5, crit_dmg: 0.8, atk_pct: 1.0, def_pct: 0.6, hp_pct: 0.5, int_pct: 1.0,
    spd_flat: 0.8, res_flat: 0.4, defPen: 2.0, allDamage: 2.0,
    fireDamage: 1.0, waterDamage: 1.0, shadowDamage: 1.0, lightDamage: 1.0,
  };
  if (bonusStat && bonusValue) {
    score += Math.round((bonusValue || 0) * (STAT_COSTS[bonusStat] || 1));
  }

  // Passive costs (supports multi-passives array or legacy single)
  const PASSIVE_COSTS = {
    none: 0,
    innerFlameStack: 14, burnProc: 14, desperateFury: 16, chainLightning: 18,
    dragonSlayer: 18, defIgnore: 18, cursedBlade: 20,
    lifesteal: 14, dodgeCounter: 16, celestialShield: 16, ironGuard: 14, guardianShield: 18,
    devoration: 14, commanderAura: 18, manaFlow: 16, echoCD: 12, healBoost: 16,
    // Drawback passives (lower base cost because of negative stat tradeoff)
    cursedPact: 8, berserkerRage: 12, voidSacrifice: 10, deathLink: 10, sharedCurse: 14,
    // Stackable advanced
    powerAccumulation: 16, combatEcho: 14,
  };

  const passiveList = passives && Array.isArray(passives)
    ? passives.filter(p => p.id && p.id !== 'none')
    : (passiveId && passiveId !== 'none' ? [{ id: passiveId, params: passiveParams || {} }] : []);

  // Multi-passive synergy tax
  score += MULTI_PASSIVE_TAX[Math.min(passiveList.length, 3)] || 0;

  for (const p of passiveList) {
    score += PASSIVE_COSTS[p.id] || 15;
  }

  // Awakening A1-A5
  const AW_COSTS = {
    atk_pct: 1.0, def_pct: 0.6, hp_pct: 0.5, int_pct: 1.0, crit_rate: 1.5, crit_dmg: 0.8,
    spd_flat: 0.8, defPen: 2.0, allDamage: 2.0, fireDamage: 1.0,
    waterDamage: 1.0, shadowDamage: 1.0, lightDamage: 1.0,
  };
  if (awakeningPassives && Array.isArray(awakeningPassives)) {
    for (const aw of awakeningPassives) {
      if (aw?.key && aw?.value) {
        score += Math.round(aw.value * (AW_COSTS[aw.key] || 1));
      }
    }
  }

  return score;
}

function computeBaseDropRate(powerScore) {
  if (powerScore <= 20) return 12;
  if (powerScore <= 35) return 8;
  if (powerScore <= 50) return 5;
  if (powerScore <= 65) return 3;
  if (powerScore <= 80) return 2;
  if (powerScore <= 95) return 1;
  if (powerScore <= 110) return 0.5;
  if (powerScore <= 130) return 0.2;
  return 0.1;
}

function computeExpeditionBoss(powerScore) {
  if (powerScore < 30)  return { min: 1, max: 5 };
  if (powerScore < 50)  return { min: 2, max: 5 };
  if (powerScore < 70)  return { min: 3, max: 5 };
  if (powerScore < 85)  return { min: 4, max: 5 };
  return { min: 5, max: 5 };
}

// ── Slug generator ───────────────────────────────────────
function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 30);
}

// ── Handlers ─────────────────────────────────────────────

async function handleCreate(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  await ensureTable();

  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const {
    name, element, weaponType, spriteUrl, icon, descFr,
    atk, bonusStat, bonusValue, scalingStat,
    passives: rawPassives, passiveId, passiveParams, awakeningPassives,
  } = req.body;

  // ── Validation ──
  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > MAX_NAME_LEN) {
    return res.status(400).json({ error: `Nom requis (2-${MAX_NAME_LEN} caractères)` });
  }

  const nameLower = name.trim().toLowerCase();
  if (BANNED_WORDS.some(w => nameLower.includes(w))) {
    return res.status(400).json({ error: 'Nom interdit' });
  }

  if (!VALID_WEAPON_TYPES.includes(weaponType)) {
    return res.status(400).json({ error: 'Type d\'arme invalide' });
  }
  if (element !== null && element !== undefined && !VALID_ELEMENTS.includes(element)) {
    return res.status(400).json({ error: 'Élément invalide' });
  }

  // Rarity is computed server-side from power score — not from client
  const maxAtk = 300;
  const clampedAtk = Math.max(10, Math.min(maxAtk, Math.round(atk || 50)));

  if (bonusStat && !VALID_BONUS_STATS.includes(bonusStat)) {
    return res.status(400).json({ error: 'Stat secondaire invalide' });
  }

  // Element vs elemental damage stat validation
  const ELEMENTAL_STATS = { fire: 'fireDamage', water: 'waterDamage', shadow: 'shadowDamage', light: 'lightDamage' };
  const ELEMENTAL_STAT_KEYS = new Set(Object.values(ELEMENTAL_STATS));
  if (bonusStat && ELEMENTAL_STAT_KEYS.has(bonusStat)) {
    const allowedStat = ELEMENTAL_STATS[element];
    if (bonusStat !== allowedStat) {
      return res.status(400).json({ error: 'Stat élémentaire incompatible avec l\'élément choisi' });
    }
  }
  const clampedBonusValue = Math.max(0, Math.min(35, Math.round(bonusValue || 0)));

  // Validate passives array (max 3, no duplicates)
  const validPassives = [];
  const seenPassiveIds = new Set();
  const passivesToValidate = Array.isArray(rawPassives) ? rawPassives.slice(0, 3)
    : (passiveId && passiveId !== 'none' ? [{ id: passiveId, params: passiveParams || {} }] : []);

  for (const p of passivesToValidate) {
    if (!p?.id || p.id === 'none') continue;
    if (!VALID_PASSIVE_IDS.includes(p.id)) {
      return res.status(400).json({ error: `Passif invalide: ${p.id}` });
    }
    if (seenPassiveIds.has(p.id)) {
      return res.status(400).json({ error: `Passif en double: ${p.id}` });
    }
    seenPassiveIds.add(p.id);
    validPassives.push({ id: p.id, params: p.params || {} });
  }

  if (scalingStat && scalingStat !== 'int') {
    return res.status(400).json({ error: 'scalingStat invalide' });
  }

  // Validate awakening passives (max 5) + element filter
  const validAwakenings = [];
  if (awakeningPassives && Array.isArray(awakeningPassives)) {
    for (const aw of awakeningPassives.slice(0, 5)) {
      if (aw?.key && VALID_AWAKENING_STATS.includes(aw.key) && typeof aw.value === 'number') {
        // Block elemental awakening stats that don't match the element
        if (ELEMENTAL_STAT_KEYS.has(aw.key) && aw.key !== ELEMENTAL_STATS[element]) {
          continue; // skip invalid elemental stat silently
        }
        const maxVal = 25;
        validAwakenings.push({
          key: aw.key,
          value: Math.max(1, Math.min(maxVal, Math.round(aw.value))),
          desc: aw.desc || `+${Math.round(aw.value)}% ${aw.key}`,
        });
      }
    }
  }

  // ── Cooldown check ──
  const lastWeapon = await query(
    'SELECT created_at FROM community_weapons WHERE creator_device_id = $1 ORDER BY created_at DESC LIMIT 1',
    [user.device_id]
  );
  if (lastWeapon.rows.length > 0) {
    const lastTime = new Date(lastWeapon.rows[0].created_at).getTime();
    const elapsed = Date.now() - lastTime;
    if (elapsed < COOLDOWN_MS) {
      const remaining = Math.ceil((COOLDOWN_MS - elapsed) / (60 * 60 * 1000));
      return res.status(429).json({ error: `Cooldown actif. Prochaine forge dans ~${remaining}h.` });
    }
  }

  // ── Max weapons check ──
  const countResult = await query(
    'SELECT COUNT(*) as cnt FROM community_weapons WHERE creator_device_id = $1',
    [user.device_id]
  );
  if (parseInt(countResult.rows[0].cnt) >= MAX_WEAPONS_PER_USER) {
    return res.status(400).json({ error: `Maximum ${MAX_WEAPONS_PER_USER} armes par joueur.` });
  }

  // ── Compute power score, rarity & drop rate (server-authoritative) ──
  const powerScore = computePowerScoreServer({
    atk: clampedAtk, element: element || null,
    bonusStat, bonusValue: clampedBonusValue,
    passives: validPassives,
    awakeningPassives: validAwakenings,
  });
  const rarity = computeRarityServer(powerScore);
  const dropRate = computeBaseDropRate(powerScore);

  // ── Generate weapon ID ──
  const slug = slugify(name.trim());
  const weaponId = `cw_${slug}_${Date.now().toString(36)}`;

  // ── Desc sanitization ──
  const safeDesc = (descFr || '').slice(0, MAX_DESC_LEN).replace(/<[^>]*>/g, '');

  // ── Insert ──
  try {
    await query(
      `INSERT INTO community_weapons
        (weapon_id, creator_username, creator_device_id, name, element, weapon_type, rarity,
         sprite_url, icon, desc_fr, atk, bonus_stat, bonus_value, scaling_stat,
         passive_template_id, passive_params, power_score, drop_rate, awakening_passives, passives)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
      [
        weaponId, user.username, user.device_id,
        name.trim(), element || null, weaponType, rarity,
        spriteUrl || null, icon || '⚔️', safeDesc,
        clampedAtk, bonusStat || null, clampedBonusValue, scalingStat || null,
        validPassives[0]?.id || 'none', JSON.stringify(validPassives[0]?.params || {}),
        powerScore, dropRate, JSON.stringify(validAwakenings),
        JSON.stringify(validPassives),
      ]
    );
  } catch (e) {
    if (e.code === '23505') {
      return res.status(409).json({ error: 'Une arme avec un nom similaire existe déjà.' });
    }
    throw e;
  }

  return res.status(201).json({
    success: true,
    weapon: {
      weaponId, name: name.trim(), rarity, element, weaponType, atk: clampedAtk,
      powerScore, dropRate, creator: user.username,
    },
  });
}

async function handleList(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  await ensureTable();

  const result = await query(
    `SELECT weapon_id, creator_username, name, element, weapon_type, rarity,
            sprite_url, icon, desc_fr, atk, bonus_stat, bonus_value, scaling_stat,
            passive_template_id, passive_params, power_score, drop_rate,
            awakening_passives, passives, created_at
     FROM community_weapons
     WHERE status = 'active'
     ORDER BY created_at DESC
     LIMIT 200`
  );

  return res.json({ success: true, weapons: result.rows });
}

async function handleMyWeapons(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  await ensureTable();

  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const result = await query(
    `SELECT weapon_id, name, element, weapon_type, rarity, sprite_url, icon, desc_fr,
            atk, bonus_stat, bonus_value, scaling_stat,
            passive_template_id, passive_params, power_score, drop_rate,
            awakening_passives, passives, created_at
     FROM community_weapons
     WHERE creator_device_id = $1 AND status = 'active'
     ORDER BY created_at DESC`,
    [user.device_id]
  );

  // Cooldown info
  let nextForgeAt = null;
  if (result.rows.length > 0) {
    const lastCreated = new Date(result.rows[0].created_at).getTime();
    const nextTime = lastCreated + COOLDOWN_MS;
    if (nextTime > Date.now()) nextForgeAt = new Date(nextTime).toISOString();
  }

  return res.json({ success: true, weapons: result.rows, nextForgeAt });
}

async function handleDelete(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  await ensureTable();

  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { weaponId } = req.body;
  if (!weaponId) return res.status(400).json({ error: 'weaponId requis' });

  const result = await query(
    `UPDATE community_weapons SET status = 'disabled', updated_at = NOW()
     WHERE weapon_id = $1 AND creator_device_id = $2 AND status = 'active'
     RETURNING weapon_id`,
    [weaponId, user.device_id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Arme non trouvée ou pas la tienne.' });
  }

  return res.json({ success: true, deleted: weaponId });
}

async function handleTemplates(req, res) {
  // Static list — no DB needed
  return res.json({ success: true, templates: VALID_PASSIVE_IDS });
}

// ── Main router ──────────────────────────────────────────
export default async function handler(req, res) {
  try {
    const action = req.query?.action || req.url?.split('action=')[1]?.split('&')[0];

    switch (action) {
      case 'create':      return handleCreate(req, res);
      case 'list':        return handleList(req, res);
      case 'my-weapons':  return handleMyWeapons(req, res);
      case 'delete':      return handleDelete(req, res);
      case 'templates':   return handleTemplates(req, res);
      case 'init':
        await ensureTable();
        return res.json({ success: true });
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err) {
    console.error('[Forge] Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
