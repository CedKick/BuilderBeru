import { query } from '../_db/neon.js';
import { extractUser } from '../_utils/auth.js';

// Sub-stat pool (matches src/pages/ShadowColosseum/equipmentData.js)
const SUB_STAT_POOL = [
  { id: 'hp_flat',   range: [15, 40] },
  { id: 'atk_flat',  range: [2, 6] },
  { id: 'def_flat',  range: [2, 5] },
  { id: 'spd_flat',  range: [1, 4] },
  { id: 'crit_rate', range: [1, 4] },
  { id: 'crit_dmg',  range: [2, 6] },
  { id: 'res_flat',  range: [1, 3] },
  { id: 'hp_pct',    range: [2, 5] },
  { id: 'atk_pct',   range: [2, 5] },
  { id: 'def_pct',   range: [2, 5] },
];

const MAIN_STAT_BASE = {
  hp_flat: 50, hp_pct: 5, atk_flat: 5, atk_pct: 5,
  def_flat: 3, def_pct: 5, spd_flat: 3, crit_rate: 3, crit_dmg: 5, res_flat: 3,
};

const ENCHANT_MAIN_STAT_POOL = [
  'hp_flat', 'hp_pct', 'atk_flat', 'atk_pct',
  'crit_rate', 'crit_dmg', 'res_flat',
  'def_flat', 'def_pct', 'spd_flat',
];

const RARITY_INITIAL_SUBS = { rare: 1, legendaire: 2, mythique: 3 };
const REROLL_ALKAHEST_COST = 10;

function generateNewSubs(rarity, mainStatId) {
  const subCount = RARITY_INITIAL_SUBS[rarity] || 2;
  const available = SUB_STAT_POOL.filter(s => s.id !== mainStatId);
  const subs = [];
  const used = new Set();
  for (let i = 0; i < subCount; i++) {
    const candidates = available.filter(s => !used.has(s.id));
    if (candidates.length === 0) break;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    used.add(pick.id);
    const value = pick.range[0] + Math.floor(Math.random() * (pick.range[1] - pick.range[0] + 1));
    subs.push({ id: pick.id, value });
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

    const { artifactUid, fullReroll } = req.body;
    if (!artifactUid) return res.status(400).json({ error: 'Missing artifactUid' });

    // Read current data from Neon
    const existing = await query(
      'SELECT data FROM user_storage WHERE device_id = $1 AND storage_key = $2',
      [user.deviceId, 'shadow_colosseum_data']
    );
    if (!existing.rows.length) return res.status(404).json({ error: 'No data found' });

    const data = typeof existing.rows[0].data === 'string'
      ? JSON.parse(existing.rows[0].data) : existing.rows[0].data;

    // Validate alkahest balance
    const currentAlkahest = data.alkahest || 0;
    if (currentAlkahest < REROLL_ALKAHEST_COST) {
      return res.status(400).json({ error: 'Not enough alkahest', have: currentAlkahest, need: REROLL_ALKAHEST_COST });
    }

    // Find the artifact (inventory or equipped)
    let artifact = null;
    let location = null;

    const invIdx = (data.artifactInventory || []).findIndex(a => a?.uid === artifactUid);
    if (invIdx >= 0) {
      artifact = data.artifactInventory[invIdx];
      location = { type: 'inventory', index: invIdx };
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

    if (!artifact) return res.status(404).json({ error: 'Artifact not found' });
    if (artifact.locked) return res.status(400).json({ error: 'Artifact is locked' });

    // Full reroll: main stat + subs. Normal reroll: subs only.
    let newMainStat = artifact.mainStat;
    if (fullReroll) {
      const mainPool = ENCHANT_MAIN_STAT_POOL.filter(s => s !== artifact.mainStat);
      newMainStat = mainPool[Math.floor(Math.random() * mainPool.length)];
    }
    const newSubs = generateNewSubs(artifact.rarity, newMainStat);
    const newMainValue = MAIN_STAT_BASE[newMainStat] || artifact.mainValue;

    const rerolled = {
      ...artifact,
      level: 0,
      mainStat: newMainStat,
      mainValue: newMainValue,
      subs: newSubs,
      enchants: { main: 0, subs: {} },
    };

    // Deduct alkahest
    data.alkahest = currentAlkahest - REROLL_ALKAHEST_COST;

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

    return res.status(200).json({
      success: true,
      rerolledArtifact: rerolled,
      alkahestRemaining: data.alkahest,
      rerollCount: data.rerollCounts[artifactUid],
    });
  } catch (err) {
    console.error('[reroll] Error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
