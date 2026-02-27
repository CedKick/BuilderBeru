import { query } from '../_db/neon.js';
import { extractUser } from '../_utils/auth.js';
import { gunzipSync } from 'node:zlib';
import { sanitizeColoData } from '../_utils/validate.js';
import {
  computeCheatScore, checkSuspension, notifyAdmin,
  getBeruWarnMessage, getBeruSuspendMessage,
  WARN_SCORE, SUSPEND_SCORE,
} from '../_utils/anticheat.js';

// Keys where anti-cheat delta validation runs
const ANTICHEAT_KEYS = ['shadow_colosseum_data', 'shadow_colosseum_raid'];

const ALLOWED_KEYS = [
  'builderberu_users', 'shadow_colosseum_data', 'shadow_colosseum_raid',
  'beru_chibi_collection', 'beru_companions', 'beru_mascot_visible',
  'beruvianbeta_users', 'builderberu_shadow_coins', 'shadow_achievements',
  'builderberu_easter_eggs', 'builderberu_easter_progress',
  'lorestory_completed', 'hallofflame_cache', 'pvp_data',
];

const MAX_SIZE = 4 * 1024 * 1024; // 4MB max per key

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
  m.ultimateSkills = mergeObjects(cloud.ultimateSkills, incoming.ultimateSkills);

  // ─── respecCount: MAX per hunter per tree
  m.respecCount = mergeNestedMax(cloud.respecCount, incoming.respecCount);

  // ─── weaponCollection: MAX count per weapon ───────────
  m.weaponCollection = mergeObjectsMax(cloud.weaponCollection, incoming.weaponCollection);

  // ─── weapons (equipped): keep incoming if set, else cloud
  m.weapons = mergeObjects(cloud.weapons, incoming.weapons);

  // ─── hammers, fragments: MAX each ─────────────────────
  m.hammers = mergeObjectsMax(cloud.hammers, incoming.hammers);
  m.fragments = mergeObjectsMax(cloud.fragments, incoming.fragments);

  // ─── weaponEnchants: prefer incoming (last enchant session) ─
  m.weaponEnchants = mergeObjects(cloud.weaponEnchants, incoming.weaponEnchants);

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
  const origin = req.headers.origin;
  if (['https://builderberu.com', 'https://www.builderberu.com', 'http://localhost:5173'].includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await ensureTable();

    const { deviceId: bodyDeviceId, key, data: rawData, compressed, payload, clientTimestamp, clientVersion } = req.body;

    // Decompress gzipped payload if client sent compressed data
    let data = rawData;
    if (compressed === 'gzip' && payload) {
      try {
        const buf = Buffer.from(payload, 'base64');
        data = JSON.parse(gunzipSync(buf).toString());
      } catch (e) {
        console.error('[save] Decompression failed:', e.message);
        return res.status(400).json({ error: 'Decompression failed' });
      }
    }

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

    // Trim bloated fields server-side (drop logs, orphan rerollCounts)
    if (key === 'shadow_colosseum_data' && data && typeof data === 'object') {
      const MAX_LOG = 200;
      for (const logKey of ['ragnarokDropLog', 'zephyrDropLog', 'monarchDropLog', 'archDemonDropLog']) {
        if (Array.isArray(data[logKey]) && data[logKey].length > MAX_LOG) {
          data[logKey] = data[logKey].slice(-MAX_LOG);
        }
      }
      // Clean rerollCounts for artifacts that no longer exist
      if (data.rerollCounts && typeof data.rerollCounts === 'object') {
        const liveUids = new Set();
        if (Array.isArray(data.artifactInventory)) {
          for (const a of data.artifactInventory) { if (a?.uid) liveUids.add(a.uid); }
        }
        if (data.artifacts && typeof data.artifacts === 'object') {
          for (const slots of Object.values(data.artifacts)) {
            if (slots && typeof slots === 'object') {
              for (const a of Object.values(slots)) { if (a?.uid) liveUids.add(a.uid); }
            }
          }
        }
        const trimmed = {};
        for (const [uid, count] of Object.entries(data.rerollCounts)) {
          if (liveUids.has(uid)) trimmed[uid] = count;
        }
        data.rerollCounts = trimmed;
      }
    }

    let jsonStr = JSON.stringify(data);
    let sizeBytes = Buffer.byteLength(jsonStr, 'utf8');

    // Reject oversized payloads
    if (sizeBytes > MAX_SIZE) {
      return res.status(413).json({ error: 'Payload too large', max: MAX_SIZE });
    }

    // ─── CHECK 0: Suspension gate — suspended accounts cannot save game data ──
    if (ANTICHEAT_KEYS.includes(key)) {
      const suspension = await checkSuspension(deviceId);
      if (suspension) {
        return res.status(403).json({
          error: 'Account suspended',
          suspended: true,
          reason: suspension.reason,
          since: suspension.since,
          beruMessage: getBeruSuspendMessage(),
        });
      }
    }

    // ─── Fetch existing data for checks + potential merge ──
    const existing = await query(
      'SELECT data, size_bytes, updated_at FROM user_storage WHERE device_id = $1 AND storage_key = $2',
      [deviceId, key]
    );

    let merged = false;
    let finalData = data;
    let cheatWarning = null;

    if (existing.rows.length > 0) {
      const cloudSize = existing.rows[0].size_bytes || 0;
      const cloudUpdatedAt = new Date(existing.rows[0].updated_at).getTime();

      // CHECK 1: Size — refuse if new data is suspiciously small (empty/corrupt)
      // Skip for shadow_colosseum_raid: React sends partial data (hunterCollection/raidStats only),
      // CHECK 4 below will patch in gear fields from cloud.
      if (key !== 'shadow_colosseum_raid' && cloudSize > MIN_SIZE_CHECK && sizeBytes < cloudSize * CORRUPTION_RATIO) {
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

      // CHECK 6: Anti-cheat delta validation — compare RAW incoming vs cloud BEFORE merge
      // Query recent offline farm session to scale thresholds (prevents false positives)
      if (ANTICHEAT_KEYS.includes(key)) {
        let farmMinutes = 0;
        if (user) {
          try {
            const farmResult = await query(
              `SELECT last_farm_minutes FROM player_factions
               WHERE username = $1 AND last_farm_end_at > NOW() - INTERVAL '10 minutes'`,
              [user.username]
            );
            if (farmResult.rows.length > 0) {
              farmMinutes = farmResult.rows[0].last_farm_minutes || 0;
            }
          } catch { /* Fail open — don't block saves if faction query fails */ }
        }

        const cloudForAC = typeof existing.rows[0].data === 'string'
          ? JSON.parse(existing.rows[0].data)
          : existing.rows[0].data;

        const { score, flags } = computeCheatScore(cloudForAC, data, key, { farmMinutes });

        // No auto-suspension — admin reviews manually via Anti-Cheat tab
        // Just record the score in DB and warn the player via Béru
        if (score > 0) {
          // Persist cheat_score in DB for admin monitoring
          try {
            await query(
              `UPDATE users SET cheat_score = GREATEST(COALESCE(cheat_score, 0), $2) WHERE device_id = $1`,
              [deviceId, score]
            );
          } catch { /* non-blocking */ }

          if (score >= SUSPEND_SCORE) {
            // Notify admin (Discord + email) but do NOT block the save
            notifyAdmin(
              user?.username || deviceId,
              deviceId, score, flags
            ).catch(() => {});
            console.error(`[save] 🚨 HIGH CHEAT SCORE — ${deviceId}: score=${score}, flags=${flags.join(', ')} (NOT auto-suspended, admin review needed)`);
            cheatWarning = { score, beruMessage: getBeruSuspendMessage() };
          } else if (score >= WARN_SCORE) {
            cheatWarning = { score, beruMessage: getBeruWarnMessage() };
            console.warn(`[save] ⚠️ SUSPICIOUS — ${deviceId}: score=${score}, flags=${flags.join(', ')}`);
          }
        }
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

      // CHECK 3: Always protect server-deposited fields (alkahest, rerollCounts)
      // These can be written by game-server via deposit-alkahest API while client has stale data
      if (!merged && key === 'shadow_colosseum_data') {
        const cloudData = typeof existing.rows[0].data === 'string'
          ? JSON.parse(existing.rows[0].data)
          : existing.rows[0].data;

        let patched = false;
        // Alkahest: always keep MAX (server deposits must never be lost)
        const cloudAlk = cloudData.alkahest || 0;
        const incomingAlk = finalData.alkahest || 0;
        if (cloudAlk > incomingAlk) {
          finalData = { ...finalData, alkahest: cloudAlk };
          patched = true;
        }
        // AccountXp: always keep MAX (never lose levels on device change)
        const cloudXp = cloudData.accountXp || 0;
        const incomingXp = finalData.accountXp || 0;
        if (cloudXp > incomingXp) {
          finalData = { ...finalData, accountXp: cloudXp };
          patched = true;
        }
        // RerollCounts: always keep MAX per artifact (never lose reroll history)
        const cloudRC = cloudData.rerollCounts || {};
        const incomingRC = finalData.rerollCounts || {};
        const mergedRC = { ...incomingRC };
        for (const [uid, count] of Object.entries(cloudRC)) {
          mergedRC[uid] = Math.max(mergedRC[uid] || 0, count || 0);
        }
        if (Object.keys(cloudRC).length > 0) {
          finalData = { ...finalData, rerollCounts: mergedRC };
          patched = true;
        }

        if (patched) {
          jsonStr = JSON.stringify(finalData);
          sizeBytes = Buffer.byteLength(jsonStr, 'utf8');
          console.log(`[save] PATCHED server fields for ${deviceId}: alkahest=${finalData.alkahest}`);
        }
      }

      // CHECK 4: Protect server-deposited gear/profile fields for shadow_colosseum_raid
      // React only sends { hunterCollection, raidStats, ... } but game server deposits
      // inventory, equipped, feathers, manayaOwned, statPoints, raidProfile via deposit-raid API.
      // Without this, React's CloudStorage.save() would overwrite gear data.
      if (key === 'shadow_colosseum_raid') {
        const cloudData = typeof existing.rows[0].data === 'string'
          ? JSON.parse(existing.rows[0].data)
          : existing.rows[0].data;

        let patched = false;

        // Gear fields: always preserve from cloud (game server is source of truth)
        for (const field of ['inventory', 'equipped', 'raidProfile']) {
          if (cloudData[field] && !finalData[field]) {
            finalData[field] = cloudData[field];
            patched = true;
          }
        }

        // feathers: MAX (never lose forge currency)
        const cloudFeathers = cloudData.feathers || 0;
        const incomingFeathers = finalData.feathers || 0;
        if (cloudFeathers > incomingFeathers) {
          finalData.feathers = cloudFeathers;
          patched = true;
        }

        // manayaOwned: OR (true wins — never un-forge)
        const cOwn = cloudData.manayaOwned || {};
        const iOwn = finalData.manayaOwned || {};
        const mergedOwn = { ...iOwn };
        for (const [k, v] of Object.entries(cOwn)) {
          if (v) { mergedOwn[k] = true; patched = true; }
        }
        finalData.manayaOwned = mergedOwn;

        // statPoints: MAX per stat (both React and game can allocate)
        const cPts = cloudData.statPoints || {};
        const iPts = finalData.statPoints || {};
        const mergedPts = {};
        for (const s of ['hp', 'atk', 'def', 'spd', 'crit', 'res']) {
          const cVal = cPts[s] || 0;
          const iVal = iPts[s] || 0;
          mergedPts[s] = Math.max(cVal, iVal);
          if (cVal > iVal) patched = true;
        }
        finalData.statPoints = mergedPts;

        // hunterCollection: union by id, MAX stars
        const cColl = cloudData.hunterCollection || [];
        const iColl = finalData.hunterCollection || [];
        if (cColl.length > 0) {
          const collMap = new Map();
          for (const h of cColl) {
            const entry = typeof h === 'string' ? { id: h, stars: 0 } : h;
            collMap.set(entry.id, entry);
          }
          for (const h of iColl) {
            const entry = typeof h === 'string' ? { id: h, stars: 0 } : h;
            const existing = collMap.get(entry.id);
            if (existing) {
              existing.stars = Math.max(existing.stars || 0, entry.stars || 0);
            } else {
              collMap.set(entry.id, entry);
            }
          }
          finalData.hunterCollection = Array.from(collMap.values());
          patched = true;
        }

        if (patched) {
          jsonStr = JSON.stringify(finalData);
          sizeBytes = Buffer.byteLength(jsonStr, 'utf8');
          console.log(`[save] PATCHED raid gear fields for ${deviceId}`);
        }
      }

      // CHECK 5: Anti-cheat bounds validation + integrity stamp
      // Sanitizes values to valid ranges, stamps HMAC checksum
      // ALWAYS runs for shadow_colosseum_data (integrity stamp needed even if clean)
      if (key === 'shadow_colosseum_data') {
        const cloudForValidation = existing.rows.length > 0
          ? (typeof existing.rows[0].data === 'string'
            ? JSON.parse(existing.rows[0].data)
            : existing.rows[0].data)
          : null;

        const { data: sanitized, suspicious } = sanitizeColoData(
          finalData, cloudForValidation, deviceId
        );

        // Always apply (includes integrity stamp even if no violations)
        finalData = sanitized;
        jsonStr = JSON.stringify(finalData);
        sizeBytes = Buffer.byteLength(jsonStr, 'utf8');

        if (suspicious.length > 0) {
          console.warn(`[save] SANITIZED ${suspicious.length} values for ${deviceId}`);
        }
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

    const response = { success: true, size: sizeBytes, serverTimestamp, merged };
    if (cheatWarning) {
      response.cheatWarning = cheatWarning;
    }
    return res.status(200).json(response);
  } catch (err) {
    console.error('Save error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Erreur serveur' });
  }
}
