import { query } from '../_db/neon.js';
import { extractUser } from '../_utils/auth.js';

const ALLOWED_KEYS = [
  'builderberu_users', 'shadow_colosseum_data', 'shadow_colosseum_raid',
  'beru_chibi_collection', 'beru_companions', 'beru_mascot_visible',
  'beruvianbeta_users', 'builderberu_shadow_coins', 'shadow_achievements',
  'builderberu_easter_eggs', 'builderberu_easter_progress',
  'lorestory_completed', 'hallofflame_cache', 'pvp_data',
];

const MAX_SIZE = 2 * 1024 * 1024; // 2MB max per key

// Anti-corruption thresholds
const CORRUPTION_RATIO = 0.3;   // new < 30% of existing → suspicious
const MIN_SIZE_CHECK = 200;      // only check if existing data > 200 bytes

// Keys that support smart merge on conflict
const MERGEABLE_KEYS = ['shadow_colosseum_data', 'shadow_colosseum_raid'];

// ═══════════════════════════════════════════════════════════════
// SMART MERGE — Additive merge for concurrent sessions
// Takes MAX of progression fields, UNION of collections
// ═══════════════════════════════════════════════════════════════

function mergeColoData(cloud, incoming) {
  const m = { ...cloud };

  // ─── Scalars: MAX ──────────────────────────────────────
  m.accountXp = Math.max(cloud.accountXp || 0, incoming.accountXp || 0);
  m.accountAllocations = Math.max(cloud.accountAllocations || 0, incoming.accountAllocations || 0);
  m.arc2ClickCount = Math.max(cloud.arc2ClickCount || 0, incoming.arc2ClickCount || 0);
  m.ragnarokKills = Math.max(cloud.ragnarokKills || 0, incoming.ragnarokKills || 0);
  m.zephyrKills = Math.max(cloud.zephyrKills || 0, incoming.zephyrKills || 0);
  m.monarchKills = Math.max(cloud.monarchKills || 0, incoming.monarchKills || 0);
  m.archDemonKills = Math.max(cloud.archDemonKills || 0, incoming.archDemonKills || 0);
  m.lootBoostMs = Math.max(cloud.lootBoostMs || 0, incoming.lootBoostMs || 0);
  m.alkahest = Math.max(cloud.alkahest || 0, incoming.alkahest || 0);

  // ─── rerollCounts: MAX per artifact uid ──────────────
  m.rerollCounts = mergeObjectsMax(cloud.rerollCounts, incoming.rerollCounts);

  // ─── Booleans: OR (true wins) ─────────────────────────
  m.arc2Unlocked = !!(cloud.arc2Unlocked || incoming.arc2Unlocked);
  m.grimoireWeiss = !!(cloud.grimoireWeiss || incoming.grimoireWeiss);

  // ─── Stats: MAX each ──────────────────────────────────
  const cStats = cloud.stats || {};
  const iStats = incoming.stats || {};
  m.stats = {
    battles: Math.max(cStats.battles || 0, iStats.battles || 0),
    wins: Math.max(cStats.wins || 0, iStats.wins || 0),
  };

  // ─── chibiLevels: merge per hunter, MAX level/stars/xp
  m.chibiLevels = mergeObjectsDeep(cloud.chibiLevels, incoming.chibiLevels, (cVal, iVal) => ({
    level: Math.max(cVal?.level || 0, iVal?.level || 0),
    xp: Math.max(cVal?.xp || 0, iVal?.xp || 0),
    stars: Math.max(cVal?.stars || 0, iVal?.stars || 0),
  }));

  // ─── statPoints: merge per hunter, MAX each stat
  m.statPoints = mergeObjectsDeep(cloud.statPoints, incoming.statPoints, (cVal, iVal) => {
    const result = {};
    for (const s of ['hp', 'atk', 'def', 'spd', 'crit', 'res', 'mana']) {
      result[s] = Math.max(cVal?.[s] || 0, iVal?.[s] || 0);
    }
    return result;
  });

  // ─── skillTree, talentTree, talentTree2: MAX each node ──
  m.skillTree = mergeNestedMax(cloud.skillTree, incoming.skillTree);
  m.talentTree = mergeNestedMax(cloud.talentTree, incoming.talentTree);
  m.talentTree2 = mergeNestedMax(cloud.talentTree2, incoming.talentTree2);
  m.talentSkills = mergeObjects(cloud.talentSkills, incoming.talentSkills);

  // ─── respecCount: MAX per hunter per tree
  m.respecCount = mergeNestedMax(cloud.respecCount, incoming.respecCount);

  // ─── weaponCollection: MAX count per weapon ───────────
  m.weaponCollection = mergeObjectsMax(cloud.weaponCollection, incoming.weaponCollection);

  // ─── weapons (equipped): keep incoming if set, else cloud
  m.weapons = mergeObjects(cloud.weapons, incoming.weapons);

  // ─── hammers, fragments: MAX each ─────────────────────
  m.hammers = mergeObjectsMax(cloud.hammers, incoming.hammers);
  m.fragments = mergeObjectsMax(cloud.fragments, incoming.fragments);

  // ─── accountBonuses: MAX each stat ────────────────────
  m.accountBonuses = mergeObjectsMax(cloud.accountBonuses, incoming.accountBonuses);

  // ─── stagesCleared: MAX stars per stage ───────────────
  m.stagesCleared = mergeObjectsDeep(cloud.stagesCleared, incoming.stagesCleared, (cVal, iVal) => ({
    maxStars: Math.max(cVal?.maxStars || 0, iVal?.maxStars || 0),
  }));
  m.arc2StagesCleared = mergeObjectsDeep(cloud.arc2StagesCleared, incoming.arc2StagesCleared, (cVal, iVal) => ({
    maxStars: Math.max(cVal?.maxStars || 0, iVal?.maxStars || 0),
  }));

  // ─── arc2StoriesWatched: OR per story ─────────────────
  m.arc2StoriesWatched = mergeObjects(cloud.arc2StoriesWatched, incoming.arc2StoriesWatched);

  // ─── arc2Team: prefer incoming (last active session)
  if (incoming.arc2Team) m.arc2Team = incoming.arc2Team;

  // ─── arc2StarsRecord: MAX per stage ───────────────────
  m.arc2StarsRecord = mergeObjectsMax(cloud.arc2StarsRecord, incoming.arc2StarsRecord);

  // ─── artifacts (equipped): deep merge per chibi per slot
  m.artifacts = mergeObjects(cloud.artifacts, incoming.artifacts);

  // ─── artifactInventory: union by unique id, deduplicate ─
  m.artifactInventory = mergeArtifactInventories(
    cloud.artifactInventory || [],
    incoming.artifactInventory || []
  );

  // ─── cooldowns: keep most recent (shorter remaining)
  m.cooldowns = incoming.cooldowns || cloud.cooldowns || {};

  // ─── Drop logs: concat + deduplicate by timestamp ─────
  m.ragnarokDropLog = mergeDropLogs(cloud.ragnarokDropLog, incoming.ragnarokDropLog);
  m.zephyrDropLog = mergeDropLogs(cloud.zephyrDropLog, incoming.zephyrDropLog);
  m.monarchDropLog = mergeDropLogs(cloud.monarchDropLog, incoming.monarchDropLog);
  m.archDemonDropLog = mergeDropLogs(cloud.archDemonDropLog, incoming.archDemonDropLog);

  return m;
}

// ─── Merge helpers ──────────────────────────────────────────

/** Merge two flat objects: incoming wins for each key, cloud fills gaps */
function mergeObjects(cloud, incoming) {
  if (!cloud && !incoming) return {};
  if (!cloud) return { ...incoming };
  if (!incoming) return { ...cloud };
  return { ...cloud, ...incoming };
}

/** Merge two flat objects with numeric values: MAX for each key */
function mergeObjectsMax(cloud, incoming) {
  const result = { ...(cloud || {}) };
  for (const [k, v] of Object.entries(incoming || {})) {
    result[k] = Math.max(result[k] || 0, v || 0);
  }
  return result;
}

/** Merge objects with sub-objects using a custom merge function */
function mergeObjectsDeep(cloud, incoming, mergeFn) {
  const cObj = cloud || {};
  const iObj = incoming || {};
  const allKeys = new Set([...Object.keys(cObj), ...Object.keys(iObj)]);
  const result = {};
  for (const k of allKeys) {
    if (cObj[k] && iObj[k]) {
      result[k] = mergeFn(cObj[k], iObj[k]);
    } else {
      result[k] = iObj[k] || cObj[k];
    }
  }
  return result;
}

/** Merge nested objects (2 levels deep) with MAX numeric values */
function mergeNestedMax(cloud, incoming) {
  const cObj = cloud || {};
  const iObj = incoming || {};
  const allKeys = new Set([...Object.keys(cObj), ...Object.keys(iObj)]);
  const result = {};
  for (const k of allKeys) {
    if (cObj[k] && iObj[k] && typeof cObj[k] === 'object' && typeof iObj[k] === 'object') {
      result[k] = mergeObjectsMax(cObj[k], iObj[k]);
    } else {
      result[k] = iObj[k] || cObj[k];
    }
  }
  return result;
}

/** Merge artifact inventories: keep the BIGGER inventory (no duplication exploit) */
function mergeArtifactInventories(cloudInv, incomingInv) {
  if (!cloudInv.length) return incomingInv;
  if (!incomingInv.length) return cloudInv;
  // Anti-exploit: take the longer inventory (the one with more progression)
  // This prevents double-farming via concurrent tabs
  return cloudInv.length >= incomingInv.length ? cloudInv : incomingInv;
}

/** Merge drop logs: keep the longer log (no concat to prevent exploit) */
function mergeDropLogs(cloudLog, incomingLog) {
  if (!cloudLog?.length && !incomingLog?.length) return [];
  if (!cloudLog?.length) return incomingLog;
  if (!incomingLog?.length) return cloudLog;
  return cloudLog.length >= incomingLog.length ? cloudLog : incomingLog;
}

/** Simple merge for raid data */
function mergeRaidData(cloud, incoming) {
  if (!cloud) return incoming;
  if (!incoming) return cloud;
  // Raid data is simpler — just take the most progressed version
  const m = { ...cloud, ...incoming };
  // MAX for numeric progression fields if they exist
  for (const k of Object.keys(m)) {
    if (typeof cloud[k] === 'number' && typeof incoming[k] === 'number') {
      m[k] = Math.max(cloud[k], incoming[k]);
    }
  }
  return m;
}

// ═══════════════════════════════════════════════════════════════
// AUTO-INIT — ensure user_storage table exists
// ═══════════════════════════════════════════════════════════════

let tableChecked = false;
async function ensureTable() {
  if (tableChecked) return;
  await query(`
    CREATE TABLE IF NOT EXISTS user_storage (
      id SERIAL PRIMARY KEY,
      device_id VARCHAR(64) NOT NULL,
      storage_key VARCHAR(128) NOT NULL,
      data JSONB NOT NULL DEFAULT '{}',
      size_bytes INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(device_id, storage_key)
    )
  `);
  await query('CREATE INDEX IF NOT EXISTS idx_user_storage_device ON user_storage(device_id)');
  await query('ALTER TABLE user_storage ADD COLUMN IF NOT EXISTS client_version INTEGER');
  tableChecked = true;
}

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://builderberu.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await ensureTable();

    const { deviceId: bodyDeviceId, key, data, clientTimestamp, clientVersion } = req.body;

    // If auth token present, use the user's canonical deviceId
    let deviceId = bodyDeviceId;
    const user = await extractUser(req);
    if (user) {
      deviceId = user.deviceId;
    }

    if (!deviceId || !key || data === undefined) {
      return res.status(400).json({ error: 'Missing deviceId, key, or data' });
    }

    // Only allow known keys
    if (!ALLOWED_KEYS.includes(key)) {
      return res.status(403).json({ error: 'Key not allowed' });
    }

    // Validate deviceId format
    if (!deviceId.startsWith('dev_') || deviceId.length > 50) {
      return res.status(403).json({ error: 'Invalid deviceId' });
    }

    let jsonStr = JSON.stringify(data);
    let sizeBytes = Buffer.byteLength(jsonStr, 'utf8');

    // Reject oversized payloads
    if (sizeBytes > MAX_SIZE) {
      return res.status(413).json({ error: 'Payload too large', max: MAX_SIZE });
    }

    // ─── Fetch existing data for checks + potential merge ──
    const existing = await query(
      'SELECT data, size_bytes, updated_at FROM user_storage WHERE device_id = $1 AND storage_key = $2',
      [deviceId, key]
    );

    let merged = false;
    let finalData = data;

    if (existing.rows.length > 0) {
      const cloudSize = existing.rows[0].size_bytes || 0;
      const cloudUpdatedAt = new Date(existing.rows[0].updated_at).getTime();

      // CHECK 1: Size — refuse if new data is suspiciously small (empty/corrupt)
      if (cloudSize > MIN_SIZE_CHECK && sizeBytes < cloudSize * CORRUPTION_RATIO) {
        console.warn(
          `[save] BLOCKED: ${key} for ${deviceId} — new ${sizeBytes}B vs cloud ${cloudSize}B (${(sizeBytes/cloudSize*100).toFixed(0)}%)`
        );
        return res.status(409).json({
          error: 'Data corruption protection',
          reason: `New data (${sizeBytes}B) is much smaller than cloud (${cloudSize}B). Save blocked.`,
          cloudSize,
          newSize: sizeBytes,
        });
      }

      // CHECK 2: Concurrent write detection — cloud was updated after client's last sync
      if (clientTimestamp && cloudUpdatedAt > clientTimestamp && MERGEABLE_KEYS.includes(key)) {
        // Another session wrote since this client last loaded → MERGE instead of overwrite
        const cloudData = typeof existing.rows[0].data === 'string'
          ? JSON.parse(existing.rows[0].data)
          : existing.rows[0].data;

        if (key === 'shadow_colosseum_data') {
          finalData = mergeColoData(cloudData, data);
        } else if (key === 'shadow_colosseum_raid') {
          finalData = mergeRaidData(cloudData, data);
        }

        jsonStr = JSON.stringify(finalData);
        sizeBytes = Buffer.byteLength(jsonStr, 'utf8');
        merged = true;

        console.log(
          `[save] MERGED: ${key} for ${deviceId} — cloud ts ${cloudUpdatedAt} > client ts ${clientTimestamp}. Merged result: ${sizeBytes}B`
        );
      }
    }

    // ─── Write ──────────────────────────────────────────────
    const result = await query(
      `INSERT INTO user_storage (device_id, storage_key, data, size_bytes, client_version, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (device_id, storage_key)
       DO UPDATE SET data = $3, size_bytes = $4, client_version = $5, updated_at = NOW()
       RETURNING updated_at`,
      [deviceId, key, jsonStr, sizeBytes, clientVersion || null]
    );

    const serverTimestamp = new Date(result.rows[0].updated_at).getTime();

    return res.status(200).json({
      success: true,
      size: sizeBytes,
      serverTimestamp,
      merged,
    });
  } catch (err) {
    console.error('Save error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Erreur serveur' });
  }
}
