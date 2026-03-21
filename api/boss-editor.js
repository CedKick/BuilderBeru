// api/boss-editor.js — Custom Boss CRUD ("Forge un Boss")
// Actions: create, update, list, my-bosses, get, delete, init, upload-sprite

import { query } from './_db/neon.js';
import { extractUser } from './_utils/auth.js';
import fs from 'fs';
import path from 'path';

let sharp;
try { sharp = (await import('sharp')).default; } catch { sharp = null; }

const CDN_DIR = '/opt/manaya-raid/public/cdn/bosses';
const CDN_URL = 'https://api.builderberu.com/cdn/bosses';

// ── Validation constants ────────────────────────────────
const MAX_NAME_LEN = 50;
const MAX_DESC_LEN = 300;
const MAX_BOSSES_PER_USER = 5;
const MAX_CONFIG_SIZE = 2_000_000; // 2MB max for boss config JSON
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 1 week between creations

// Admin accounts — no limits on creation/cooldown
const ADMIN_USERNAMES = ['kly', 'cedkick'];

const BANNED_WORDS = ['admin', 'system', 'hack', 'cheat', 'exploit', 'nigga', 'nazi', 'hitler', 'porn', 'sex'];

// Save base64 image to CDN, return public URL (or null if not base64)
function saveBase64Image(base64, bossId, suffix) {
  if (!base64 || !base64.startsWith('data:image/')) return null;
  const match = base64.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
  if (!match) return null;
  const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > 2_000_000) return null; // 2MB max per image
  const filename = `${bossId}_${suffix}.${ext}`;
  fs.mkdirSync(CDN_DIR, { recursive: true });
  fs.writeFileSync(path.join(CDN_DIR, filename), buffer);
  return `${CDN_URL}/${filename}`;
}

// Process config: replace base64 with CDN URLs
function processConfigImages(config, bossId) {
  const cleaned = { ...config };
  if (cleaned.spriteUrl?.startsWith('data:')) {
    const url = saveBase64Image(cleaned.spriteUrl, bossId, 'sprite');
    cleaned.spriteUrl = url || null;
  }
  if (cleaned.mapBg?.startsWith('data:')) {
    const url = saveBase64Image(cleaned.mapBg, bossId, 'map');
    cleaned.mapBg = url || null;
  }
  // Process multi-sprite structure
  if (cleaned.sprites) {
    for (const state of ['idle', 'atk']) {
      if (!cleaned.sprites[state]) continue;
      for (const dir of ['down', 'up', 'left', 'right']) {
        const val = cleaned.sprites[state][dir];
        if (val?.startsWith('data:')) {
          const url = saveBase64Image(val, bossId, `${state}_${dir}`);
          cleaned.sprites[state][dir] = url || null;
        }
      }
    }
    // Keep spriteUrl in sync with idle.down for rétrocompat
    if (cleaned.sprites.idle?.down && !cleaned.spriteUrl) {
      cleaned.spriteUrl = cleaned.sprites.idle.down;
    }
  }
  return cleaned;
}

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

  const isAdmin = ADMIN_USERNAMES.includes(user.username?.toLowerCase());

  // Check boss limit per user (admins bypass)
  if (!isAdmin) {
    const countResult = await query(
      `SELECT COUNT(*) as cnt FROM custom_bosses WHERE creator_device_id = $1 AND status != 'deleted'`,
      [user.deviceId]
    );
    if (parseInt(countResult.rows[0].cnt) >= MAX_BOSSES_PER_USER) {
      return res.status(400).json({ error: `Maximum ${MAX_BOSSES_PER_USER} boss par joueur. Supprime un boss existant.` });
    }

    // Cooldown check (admins bypass)
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
  }

  const bossId = `boss_${user.username}_${Date.now().toString(36)}`;
  const desc = (description || '').slice(0, MAX_DESC_LEN);
  const patternCount = config.patterns?.length || 0;
  const phaseCount = config.phases?.length || 0;

  // Upload sprites to CDN, replace base64 with URLs
  const cleanConfig = processConfigImages(config, bossId);

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
    const cleanConfig = processConfigImages(config, bossId);
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

async function handlePublish(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  await ensureTable();

  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { bossId } = req.body;
  if (!bossId) return res.status(400).json({ error: 'bossId requis' });

  // Check ownership
  const existing = await query(
    `SELECT id, status, config FROM custom_bosses WHERE boss_id = $1 AND creator_device_id = $2 AND status != 'deleted'`,
    [bossId, user.deviceId]
  );
  if (existing.rows.length === 0) {
    return res.status(404).json({ error: 'Boss non trouvé ou pas le tien.' });
  }

  // Validate config has minimum requirements for publishing
  const config = existing.rows[0].config;
  if (!config?.patterns?.length) {
    return res.status(400).json({ error: 'Au moins 1 pattern requis pour publier.' });
  }

  const newStatus = existing.rows[0].status === 'published' ? 'draft' : 'published';
  await query(
    `UPDATE custom_bosses SET status = $1, updated_at = NOW() WHERE boss_id = $2`,
    [newStatus, bossId]
  );

  console.log(`[BossEditor] ${newStatus === 'published' ? 'Published' : 'Unpublished'} boss ${bossId} by ${user.username}`);
  return res.json({ success: true, bossId, status: newStatus });
}

// ── Sprite processing pipeline (sharp) ──────────────────
async function processSprite(inputBuffer) {
  if (!sharp) throw new Error('sharp not available');

  let img = sharp(inputBuffer, { failOnError: false });
  const meta = await img.metadata();

  // 1. Ensure RGBA
  img = img.ensureAlpha();

  // 2. Get raw pixels to remove black background (tolerance ±30)
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const pixels = Buffer.from(data);
  const threshold = 30;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
    if (r <= threshold && g <= threshold && b <= threshold) {
      pixels[i + 3] = 0; // Set alpha to 0 (transparent)
    }
  }

  // 3. Reconstruct image from modified pixels, auto-trim transparent edges
  img = sharp(pixels, { raw: { width: info.width, height: info.height, channels: 4 } });
  img = img.trim(); // Auto-crop transparent borders

  // 4. Resize to fit 256×256, centered, preserving aspect ratio
  img = img.resize(256, 256, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });

  // 5. Convert to WebP quality 85
  return img.webp({ quality: 85 }).toBuffer();
}

async function handleUploadSprite(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  if (!sharp) return res.status(500).json({ error: 'Image processing unavailable (sharp not installed)' });

  const { base64, state, dir } = req.body;
  if (!base64 || !base64.startsWith('data:image/')) {
    return res.status(400).json({ error: 'Image base64 requise' });
  }
  if (!['idle', 'atk'].includes(state) || !['down', 'up', 'left', 'right'].includes(dir)) {
    return res.status(400).json({ error: 'state (idle/atk) et dir (down/up/left/right) requis' });
  }

  try {
    // Decode base64
    const match = base64.match(/^data:image\/\w+;base64,(.+)$/);
    if (!match) return res.status(400).json({ error: 'Format base64 invalide' });
    const inputBuffer = Buffer.from(match[1], 'base64');
    if (inputBuffer.length > 2_000_000) return res.status(400).json({ error: 'Image trop lourde (max 2MB)' });

    // Process with sharp pipeline
    const processed = await processSprite(inputBuffer);

    // Save to CDN
    const filename = `${user.username}_${state}_${dir}_${Date.now().toString(36)}.webp`;
    fs.mkdirSync(CDN_DIR, { recursive: true });
    fs.writeFileSync(path.join(CDN_DIR, filename), processed);
    const url = `${CDN_URL}/${filename}`;

    console.log(`[BossEditor] Sprite processed: ${state}/${dir} by ${user.username} (${(inputBuffer.length/1024).toFixed(0)}KB → ${(processed.length/1024).toFixed(0)}KB)`);
    return res.json({ success: true, url, size: processed.length });
  } catch (err) {
    console.error('[BossEditor] Sprite processing error:', err);
    return res.status(500).json({ error: 'Erreur de traitement image' });
  }
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
      case 'publish':    return handlePublish(req, res);
      case 'delete':     return handleDelete(req, res);
      case 'upload-sprite': return handleUploadSprite(req, res);
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
