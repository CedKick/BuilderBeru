import { query } from '../_db/neon.js';
import { extractUser } from '../_utils/auth.js';

// Sub-stat pool (must match src/pages/ShadowColosseum/equipmentData.js exactly)
const SUB_STAT_POOL = [
  { id: 'hp_flat',          range: [225, 500] },
  { id: 'atk_flat',         range: [90, 200] },
  { id: 'def_flat',         range: [90, 200] },
  { id: 'spd_flat',         range: [1, 4] },
  { id: 'crit_rate',        range: [1, 4] },
  { id: 'crit_dmg',         range: [2, 6] },
  { id: 'res_flat',         range: [30, 50] },
  { id: 'hp_pct',           range: [2, 5] },
  { id: 'atk_pct',          range: [2, 5] },
  { id: 'def_pct',          range: [2, 5] },
  { id: 'int_flat',         range: [90, 200] },
  { id: 'int_pct',          range: [2, 5] },
  { id: 'fire_dmg_flat',    range: [90, 200] },
  { id: 'fire_dmg_pct',     range: [2, 5] },
  { id: 'water_dmg_flat',   range: [90, 200] },
  { id: 'water_dmg_pct',    range: [2, 5] },
  { id: 'shadow_dmg_flat',  range: [90, 200] },
  { id: 'shadow_dmg_pct',   range: [2, 5] },
  { id: 'light_dmg_flat',   range: [90, 200] },
  { id: 'light_dmg_pct',    range: [2, 5] },
  { id: 'earth_dmg_flat',   range: [90, 200] },
  { id: 'earth_dmg_pct',    range: [2, 5] },
];

const MAIN_STAT_BASE = {
  hp_flat: 225, hp_pct: 5, atk_flat: 90, atk_pct: 5,
  def_flat: 90, def_pct: 5, spd_flat: 3, crit_rate: 3, crit_dmg: 5, res_flat: 30,
  int_flat: 90, int_pct: 3,
  fire_dmg_flat: 90, fire_dmg_pct: 3, water_dmg_flat: 90, water_dmg_pct: 3,
  shadow_dmg_flat: 90, shadow_dmg_pct: 3, light_dmg_flat: 90, light_dmg_pct: 3,
  earth_dmg_flat: 90, earth_dmg_pct: 3,
};

// Slot-specific main stat pools (mirrors ARTIFACT_SLOTS in equipmentData.js)
const SLOT_MAIN_STATS = {
  casque:   ['hp_flat', 'hp_pct', 'int_flat', 'int_pct', 'atk_flat', 'atk_pct', 'def_flat', 'def_pct'],
  plastron: ['atk_flat', 'atk_pct', 'int_flat', 'int_pct'],
  gants:    ['crit_rate', 'crit_dmg'],
  bottes:   ['crit_dmg', 'crit_rate', 'spd_flat'],
  collier:  ['hp_pct', 'atk_pct', 'def_pct', 'int_pct', 'fire_dmg_pct', 'water_dmg_pct', 'shadow_dmg_pct', 'light_dmg_pct', 'earth_dmg_pct'],
  bracelet: ['atk_pct', 'def_pct', 'int_pct'],
  anneau:   ['crit_rate', 'crit_dmg', 'res_flat'],
  boucles:  ['hp_pct', 'atk_pct', 'def_pct', 'int_pct'],
};

// Fallback global pool (only used if slot is unknown)
const ENCHANT_MAIN_STAT_POOL = [
  'hp_flat', 'hp_pct', 'atk_flat', 'atk_pct',
  'crit_rate', 'crit_dmg', 'res_flat',
  'def_flat', 'def_pct', 'spd_flat',
  'int_flat', 'int_pct',
];

const RARITY_INITIAL_SUBS = { rare: 4, legendaire: 4, mythique: 4 };
const REROLL_LOCK_COSTS = [10, 22, 45, 70, 100]; // index = number of locked stats (0-4)
const EXPEDITION_BONUS = 1.3; // +30% stats for expedition items

function generateNewSubs(rarity, mainStatId, lockedSubs = [], expMult = 1) {
  const subCount = RARITY_INITIAL_SUBS[rarity] || 2;
  // Start with locked subs (preserved as-is)
  const subs = [...lockedSubs];
  const used = new Set(lockedSubs.map(s => s.id));
  used.add(mainStatId); // exclude main stat from sub pool
  const available = SUB_STAT_POOL.filter(s => !used.has(s.id));
  // Fill remaining slots with random subs
  for (let i = subs.length; i < subCount; i++) {
    const candidates = available.filter(s => !used.has(s.id));
    if (candidates.length === 0) break;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    used.add(pick.id);
    const value = Math.ceil((pick.range[0] + Math.floor(Math.random() * (pick.range[1] - pick.range[0] + 1))) * expMult);
    subs.push({ id: pick.id, value, baseValue: value });
  }
  return subs;
}

export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin;
  if (['https://builderberu.com', 'https://www.builderberu.com', 'http://localhost:5173'].includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const user = await extractUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const { artifactUid, fullReroll, lockedStats = [], clientAlkahest, clientLockedSubs = [], targetChibiId, targetSlotId } = req.body;
    if (!artifactUid) return res.status(400).json({ error: 'Missing artifactUid' });

    // Read current data from Neon (use FOR UPDATE to prevent race conditions)
    const existing = await query(
      `SELECT data FROM user_storage WHERE device_id = $1 AND storage_key = $2`,
      [user.deviceId, 'shadow_colosseum_data']
    );
    if (!existing.rows.length) return res.status(404).json({ error: 'No data found' });

    const data = typeof existing.rows[0].data === 'string'
      ? JSON.parse(existing.rows[0].data) : existing.rows[0].data;

    // Alkahest: use MAX of client value and DB value to prevent desync
    // (client buys alkahest with coins but cloud sync is debounced 30s+)
    if (typeof clientAlkahest === 'number' && clientAlkahest > (data.alkahest || 0)) {
      data.alkahest = clientAlkahest;
    }

    // Validate alkahest balance (cost scales with locked stat count)
    const lockCount = Math.min(lockedStats.length, REROLL_LOCK_COSTS.length - 1);
    const alkahestCost = REROLL_LOCK_COSTS[lockCount];
    const currentAlkahest = data.alkahest || 0;
    if (currentAlkahest < alkahestCost) {
      console.warn(`[reroll] Not enough alkahest for ${user.username}: have=${currentAlkahest}, need=${alkahestCost}, locks=${lockCount}`);
      return res.status(400).json({
        error: 'Not enough alkahest',
        errorCode: 'ALKAHEST_INSUFFICIENT',
        have: currentAlkahest,
        need: alkahestCost,
        lockCount,
      });
    }

    // Find the artifact. Priority order:
    // 1. If client provides targetChibiId/targetSlotId, go straight there (handles dup UIDs)
    // 2. Otherwise search EQUIPPED first, then inventory
    let artifact = null;
    let location = null;

    if (targetChibiId && targetSlotId && data.artifacts?.[targetChibiId]?.[targetSlotId]?.uid === artifactUid) {
      artifact = data.artifacts[targetChibiId][targetSlotId];
      location = { type: 'equipped', chibiId: targetChibiId, slotId: targetSlotId };
    }

    if (!artifact && data.artifacts) {
      for (const [chibiId, slots] of Object.entries(data.artifacts)) {
        for (const [slotId, art] of Object.entries(slots || {})) {
          if (art?.uid === artifactUid) {
            artifact = art;
            location = { type: 'equipped', chibiId, slotId };
            break;
          }
        }
        if (artifact) break;
      }
    }

    if (!artifact) {
      const invIdx = (data.artifactInventory || []).findIndex(a => a?.uid === artifactUid);
      if (invIdx >= 0) {
        artifact = data.artifactInventory[invIdx];
        location = { type: 'inventory', index: invIdx };
      }
    }

    if (!artifact) return res.status(404).json({ error: 'Artifact not found' });

    const lockedSet = new Set(lockedStats);
    const mainLocked = lockedSet.has('main');
    // Build clientSubs map for stale-cloud protection (client may have fresher leveled values)
    const clientSubsMap = new Map();
    for (const cs of clientLockedSubs) {
      if (cs && cs.id && typeof cs.value === 'number') clientSubsMap.set(cs.id, cs.value);
    }
    // For each locked sub on a FULL REROLL, reset value to baseValue (the original
    // level-0 roll value). Milestone bonuses applied during leveling (+5/+10/+15/+20)
    // mutate sub.value, but a full reroll resets level to 0 - so the bonus values are
    // no longer legitimate. We restore the base. Legacy artifacts without baseValue
    // get clamped to range[1] (best estimate of original roll).
    const lockedSubs = (artifact.subs || [])
      .filter(s => lockedSet.has(s.id))
      .map(s => {
        const clientVal = clientSubsMap.get(s.id);
        const freshSub = (typeof clientVal === 'number' && clientVal > (s.value || 0))
          ? { ...s, value: clientVal }
          : { ...s };
        if (fullReroll) {
          if (typeof freshSub.baseValue === 'number') {
            freshSub.value = freshSub.baseValue;
          } else {
            const subDef = SUB_STAT_POOL.find(p => p.id === freshSub.id);
            if (subDef) {
              const cap = Math.ceil(subDef.range[1] * (artifact.source === 'expedition' ? 1.3 : 1));
              if (freshSub.value > cap) freshSub.value = cap;
              freshSub.baseValue = freshSub.value;
            }
          }
        }
        return freshSub;
      });
    const oldEnchants = artifact.enchants || { main: 0, subs: {} };
    const expMult = artifact.source === 'expedition' ? EXPEDITION_BONUS : 1;

    // Full reroll: main stat + subs. Normal reroll: subs only.
    let newMainStat = artifact.mainStat;
    let newMainValue = artifact.mainValue;
    if (fullReroll && !mainLocked) {
      // Use slot-specific pool (artifact.slot or artifact.slotId or equipped slot)
      const slotId = artifact.slot || artifact.slotId || (location.type === 'equipped' ? location.slotId : null);
      const slotPool = (slotId && SLOT_MAIN_STATS[slotId]) || ENCHANT_MAIN_STAT_POOL;
      // Exclude current mainStat AND all locked sub IDs (no duplicates allowed)
      const lockedSubIds = new Set(lockedSubs.map(s => s.id));
      const mainPool = slotPool.filter(s => s !== artifact.mainStat && !lockedSubIds.has(s));
      if (mainPool.length > 0) {
        newMainStat = mainPool[Math.floor(Math.random() * mainPool.length)];
        newMainValue = Math.ceil((MAIN_STAT_BASE[newMainStat] || artifact.mainValue) * expMult);
      }
    }
    const newSubs = generateNewSubs(artifact.rarity, newMainStat, lockedSubs, expMult);

    // Build new enchants: keep enchant levels for locked stats, reset unlocked
    const newEnchants = { main: mainLocked ? (oldEnchants.main || 0) : 0, subs: {} };
    for (const s of newSubs) {
      newEnchants.subs[s.id] = lockedSet.has(s.id) ? (oldEnchants.subs?.[s.id] || 0) : 0;
    }

    // Rebuild statLocks: keep locks on stats that were locked, clear the rest
    const newStatLocks = { main: mainLocked, subs: {} };
    for (const s of lockedSubs) {
      newStatLocks.subs[s.id] = true;
    }

    const rerolled = {
      ...artifact,
      level: 0,
      locked: false,
      mainStat: newMainStat,
      mainValue: newMainValue,
      subs: newSubs,
      enchants: newEnchants,
      statLocks: newStatLocks,
    };

    // Deduct alkahest (lock-aware cost)
    data.alkahest = currentAlkahest - alkahestCost;

    // Track reroll count per artifact uid
    if (!data.rerollCounts) data.rerollCounts = {};
    data.rerollCounts[artifactUid] = (data.rerollCounts[artifactUid] || 0) + 1;

    // Apply rerolled artifact
    if (location.type === 'inventory') {
      data.artifactInventory[location.index] = rerolled;
    } else {
      data.artifacts[location.chibiId][location.slotId] = rerolled;
    }

    // Write back to Neon
    const jsonStr = JSON.stringify(data);
    const sizeBytes = Buffer.byteLength(jsonStr, 'utf8');
    await query(
      `UPDATE user_storage SET data = $1, size_bytes = $2, updated_at = NOW()
       WHERE device_id = $3 AND storage_key = $4`,
      [jsonStr, sizeBytes, user.deviceId, 'shadow_colosseum_data']
    );

    console.log(`[reroll] OK ${user.username}: artifact=${artifactUid}, locks=${lockCount}, alkahest=${currentAlkahest}->${data.alkahest}`);
    return res.status(200).json({
      success: true,
      rerolledArtifact: rerolled,
      alkahestRemaining: data.alkahest,
      rerollCount: data.rerollCounts[artifactUid],
    });
  } catch (err) {
    console.error('[reroll] Error:', err);
    return res.status(500).json({ error: 'Server error', errorCode: 'SERVER_ERROR' });
  }
}
