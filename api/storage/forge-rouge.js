import { query } from '../_db/neon.js';
import { extractUser } from '../_utils/auth.js';

// Minimal artifact generation data (mirrors equipmentData.js)
const SLOT_ORDER = ['casque', 'plastron', 'gants', 'bottes', 'collier', 'bracelet', 'anneau', 'boucles'];
const ARTIFACT_SLOTS = {
  casque:   { mainStats: ['hp_flat', 'hp_pct'] },
  plastron: { mainStats: ['atk_flat', 'atk_pct'] },
  gants:    { mainStats: ['crit_rate', 'crit_dmg'] },
  bottes:   { mainStats: ['spd_flat', 'def_pct'] },
  collier:  { mainStats: ['hp_pct', 'atk_pct'] },
  bracelet: { mainStats: ['atk_pct', 'def_pct'] },
  anneau:   { mainStats: ['crit_rate', 'crit_dmg', 'res_flat'] },
  boucles:  { mainStats: ['hp_pct', 'atk_pct', 'def_pct'] },
};
const MAIN_STAT_MAX = {
  hp_flat: 50, hp_pct: 5, atk_flat: 5, atk_pct: 5,
  def_pct: 5, spd_flat: 3, crit_rate: 3, crit_dmg: 5, res_flat: 3, def_flat: 3,
};
const SUB_STAT_POOL = [
  { id: 'hp_flat', min: 15, max: 40 }, { id: 'atk_flat', min: 2, max: 6 },
  { id: 'def_flat', min: 2, max: 5 }, { id: 'spd_flat', min: 1, max: 4 },
  { id: 'crit_rate', min: 1, max: 4 }, { id: 'crit_dmg', min: 2, max: 6 },
  { id: 'res_flat', min: 1, max: 3 }, { id: 'hp_pct', min: 2, max: 5 },
  { id: 'atk_pct', min: 2, max: 5 }, { id: 'def_pct', min: 2, max: 5 },
];

const ULTIME_SET_NAMES = {
  rage_eternelle: 'Rage Eternelle',
  gardien_celeste: 'Gardien Celeste',
  siphon_vital: 'Siphon Vital',
  tempete_arcane: 'Tempete Arcane',
  equilibre_supreme: 'Equilibre Supreme',
  pacte_ombres: 'Pacte des Ombres',
};

const ALKAHEST_COST = 100;    // red hammers
const ULTIME_COST = 1000;     // red hammers
const MAX_INVENTORY = 1500;

function generateUltimeArtifact(setId) {
  const slot = SLOT_ORDER[Math.floor(Math.random() * SLOT_ORDER.length)];
  const slotDef = ARTIFACT_SLOTS[slot];
  const mainStatId = slotDef.mainStats[Math.floor(Math.random() * slotDef.mainStats.length)];
  const subCount = 3; // mythique
  const available = SUB_STAT_POOL.filter(s => s.id !== mainStatId);
  const subs = [];
  const used = new Set();
  for (let i = 0; i < subCount; i++) {
    const pool = available.filter(s => !used.has(s.id));
    if (pool.length === 0) break;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    used.add(pick.id);
    subs.push({ id: pick.id, value: pick.min + Math.floor(Math.random() * (pick.max - pick.min + 1)) });
  }
  return {
    set: setId, slotId: slot, rarity: 'mythique',
    mainStat: mainStatId, mainValue: MAIN_STAT_MAX[mainStatId] || 0,
    subs, level: 0,
    uid: `ult_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  };
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (['https://builderberu.com', 'http://localhost:5173'].includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const user = await extractUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const { item } = req.body; // 'alkahest' or 'ultime'
    if (!['alkahest', 'ultime'].includes(item)) {
      return res.status(400).json({ error: 'Invalid item' });
    }

    const cost = item === 'alkahest' ? ALKAHEST_COST : ULTIME_COST;

    // Read colosseum data
    const existing = await query(
      'SELECT data FROM user_storage WHERE device_id = $1 AND storage_key = $2',
      [user.deviceId, 'shadow_colosseum_data']
    );
    if (!existing.rows.length) return res.status(404).json({ error: 'No colosseum data' });

    const data = typeof existing.rows[0].data === 'string'
      ? JSON.parse(existing.rows[0].data) : existing.rows[0].data;

    const redHammers = data.hammers?.marteau_rouge || 0;
    if (redHammers < cost) {
      return res.status(400).json({ error: 'Not enough red hammers', have: redHammers, need: cost });
    }

    // Deduct hammers
    if (!data.hammers) data.hammers = {};
    data.hammers.marteau_rouge = redHammers - cost;

    let result = {};

    if (item === 'alkahest') {
      data.alkahest = (data.alkahest || 0) + 1;
      result = { alkahest: data.alkahest };
    } else {
      // Generate random ultime artifact
      const setKeys = Object.keys(ULTIME_SET_NAMES);
      const randomSetId = setKeys[Math.floor(Math.random() * setKeys.length)];
      const artifact = generateUltimeArtifact(randomSetId);

      if (!data.artifactInventory) data.artifactInventory = [];
      data.artifactInventory.push(artifact);
      // Trim if over limit
      if (data.artifactInventory.length > MAX_INVENTORY) {
        data.artifactInventory = data.artifactInventory.slice(-MAX_INVENTORY);
      }

      result = {
        artifact,
        setName: ULTIME_SET_NAMES[randomSetId],
        setId: randomSetId,
        slot: artifact.slotId,
      };
    }

    // Save back
    const jsonStr = JSON.stringify(data);
    const sizeBytes = Buffer.byteLength(jsonStr, 'utf8');
    await query(
      `UPDATE user_storage SET data = $1, size_bytes = $2, updated_at = NOW()
       WHERE device_id = $3 AND storage_key = $4`,
      [jsonStr, sizeBytes, user.deviceId, 'shadow_colosseum_data']
    );

    return res.status(200).json({
      success: true,
      item,
      redHammersRemaining: data.hammers.marteau_rouge,
      ...result,
    });
  } catch (err) {
    console.error('[forge-rouge] Error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
