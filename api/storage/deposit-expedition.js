import { query } from '../_db/neon.js';

// Server-to-server secret (expedition server → API)
const GAME_SERVER_SECRET = process.env.GAME_SERVER_SECRET || 'manaya-raid-secret-key';

const INVENTORY_MAX = 1500;
const EQUIP_TYPES = ['armor', 'weapon', 'set_piece', 'unique'];

// Boss weapons in expedition use "weapon_X" prefix → map to "X" for weaponCollection
const BOSS_WEAPON_MAP = {
  weapon_excalibur: 'excalibur', weapon_mjolnir: 'mjolnir', weapon_muramasa: 'muramasa',
  weapon_yggdrasil: 'yggdrasil', weapon_gungnir: 'gungnir', weapon_nidhogg: 'nidhogg',
  weapon_aegis: 'aegis_weapon', weapon_caladbolg: 'caladbolg', weapon_thyrsus: 'thyrsus', weapon_gram: 'gram',
  weapon_ragnarok: 'ragnarok', weapon_kusanagi: 'kusanagi', weapon_gae_bolg: 'gae_bolg',
  weapon_masamune: 'masamune', weapon_longinus: 'longinus', weapon_tyrfing: 'tyrfing',
  weapon_ea_staff: 'ea_staff', weapon_fragarach: 'fragarach', weapon_tacos_eternel: 'tacos_eternel',
  weapon_amenonuhoko: 'amenonuhoko',
};

// Slot mapping: expedition → colosseum format
const EXP_SLOT_MAP = { helm: 'casque', chest: 'plastron', gloves: 'gants', boots: 'bottes' };

// Rarity mapping: expedition → colosseum format
function mapRarity(r) {
  if (r === 'legendary') return 'legendaire';
  if (r === 'epic') return 'legendaire';
  if (r === 'uncommon' || r === 'common') return 'rare';
  return r; // mythique, rare pass through
}

// Rarity weights for artifact scoring
const RARITY_WEIGHT = { rare: 4, legendaire: 16, mythique: 32 };

// Score an artifact in colosseum format (mainValue + subs + rarity bonus)
function calcArtifactScore(art) {
  let score = 0;
  if (typeof art.mainValue === 'number') score += Math.abs(art.mainValue);
  if (Array.isArray(art.subs)) {
    for (const sub of art.subs) {
      if (typeof sub.value === 'number') score += Math.abs(sub.value);
    }
  }
  score += (RARITY_WEIGHT[art.rarity] || 0) * 10;
  return score;
}

// Convert expedition item → artifact format (same as equipExpItem in ShadowColosseum.jsx)
function convertToArtifact(item, timestamp) {
  const statEntries = Object.entries(item.stats || {});
  const mainStatEntry = statEntries[0] || ['atk_flat', 0];
  const subEntries = statEntries.slice(1);

  return {
    uid: `exp_${timestamp}_${Math.random().toString(36).slice(2, 8)}`,
    set: item.setId || null,
    slot: item.slot ? (EXP_SLOT_MAP[item.slot] || item.slot) : 'casque',
    rarity: mapRarity(item.rarity),
    level: 0,
    mainStat: mainStatEntry[0],
    mainValue: mainStatEntry[1],
    subs: subEntries.map(([sid, value]) => ({ id: sid, value })),
    locked: false,
    source: 'expedition',
    expItemId: item.itemId,
    expItemName: item.itemName,
    expOriginalStats: item.stats,
  };
}

export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin;
  if (['https://builderberu.com', 'https://www.builderberu.com', 'http://localhost:5173', 'http://localhost:3001'].includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Server-Secret');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const secret = req.headers['x-server-secret'];
    if (secret !== GAME_SERVER_SECRET) {
      return res.status(403).json({ error: 'Invalid server secret' });
    }

    const { deposits, currencyDeposits } = req.body;

    // Currencies stay in shadow_colosseum_raid — no change
    if (Array.isArray(currencyDeposits) && currencyDeposits.length > 0) {
      return handleCurrencyDeposits(currencyDeposits, res);
    }

    if (!Array.isArray(deposits) || deposits.length === 0) {
      return res.status(400).json({ error: 'Missing deposits or currencyDeposits array' });
    }

    const results = [];
    for (const { username, items } of deposits) {
      if (!username || !Array.isArray(items) || items.length === 0) continue;

      const userResult = await query(
        'SELECT id, device_id FROM users WHERE LOWER(username) = LOWER($1)',
        [username]
      );
      if (userResult.rows.length === 0) {
        results.push({ username, status: 'user_not_found' });
        continue;
      }

      const deviceId = userResult.rows[0].device_id;

      // Read shadow_colosseum_data (main save — contains artifactInventory)
      const existing = await query(
        'SELECT data FROM user_storage WHERE device_id = $1 AND storage_key = $2',
        [deviceId, 'shadow_colosseum_data']
      );

      let data = {};
      if (existing.rows.length > 0) {
        data = typeof existing.rows[0].data === 'string'
          ? JSON.parse(existing.rows[0].data) : existing.rows[0].data;
      }

      if (!Array.isArray(data.artifactInventory)) {
        data.artifactInventory = [];
      }

      // Ensure weaponCollection exists
      if (!data.weaponCollection || typeof data.weaponCollection !== 'object') {
        data.weaponCollection = {};
      }

      const timestamp = Date.now();
      const itemResults = [];
      const MAX_WEAPON_AWAKENING = 100;

      for (const item of items) {
        const isEquip = EQUIP_TYPES.includes(item.type);
        if (!isEquip) {
          itemResults.push({ itemId: item.itemId, action: 'rejected', reason: 'not_equipment' });
          continue;
        }

        // ── WEAPONS → weaponCollection (same as regular weapons, with awakening)
        if (item.type === 'weapon') {
          const wId = BOSS_WEAPON_MAP[item.itemId] || item.itemId;
          const wc = data.weaponCollection;
          if (wc[wId] === undefined) {
            wc[wId] = 0; // First copy → A0
            itemResults.push({ itemId: wId, action: 'weapon_added', awakening: 0 });
          } else if (wc[wId] >= MAX_WEAPON_AWAKENING) {
            // Already max → convert to 5 red hammers
            if (!data.hammers) data.hammers = {};
            data.hammers.marteau_rouge = (data.hammers.marteau_rouge || 0) + 5;
            itemResults.push({ itemId: wId, action: 'weapon_max_hammers', hammers: 5 });
          } else {
            wc[wId] = wc[wId] + 1; // Duplicate → +1 awakening
            itemResults.push({ itemId: wId, action: 'weapon_awakened', awakening: wc[wId] });
          }
          continue;
        }

        // ── ARMOR/SET_PIECE → artifactInventory
        const artifact = convertToArtifact(item, timestamp);
        const inv = data.artifactInventory;

        // Inventory has space → just add
        if (inv.length < INVENTORY_MAX) {
          inv.push(artifact);
          itemResults.push({ itemId: item.itemId, action: 'added' });
          continue;
        }

        // Inventory FULL → find weakest non-locked artifact to replace
        const newScore = calcArtifactScore(artifact);
        let weakestIdx = -1;
        let weakestScore = Infinity;

        for (let i = 0; i < inv.length; i++) {
          if (inv[i].locked || inv[i].highlighted) continue;
          const s = calcArtifactScore(inv[i]);
          if (s < weakestScore) {
            weakestScore = s;
            weakestIdx = i;
          }
        }

        if (weakestIdx === -1) {
          itemResults.push({ itemId: item.itemId, action: 'rejected', reason: 'all_locked' });
          continue;
        }

        if (newScore <= weakestScore) {
          itemResults.push({ itemId: item.itemId, action: 'rejected', reason: 'weaker_than_existing' });
          continue;
        }

        inv[weakestIdx] = artifact;
        itemResults.push({ itemId: item.itemId, action: 'replaced', oldScore: weakestScore, newScore });
      }

      // Write back to shadow_colosseum_data
      const jsonStr = JSON.stringify(data);
      const sizeBytes = Buffer.byteLength(jsonStr, 'utf8');

      if (existing.rows.length > 0) {
        await query(
          `UPDATE user_storage SET data = $1, size_bytes = $2, updated_at = NOW()
           WHERE device_id = $3 AND storage_key = $4`,
          [jsonStr, sizeBytes, deviceId, 'shadow_colosseum_data']
        );
      } else {
        await query(
          `INSERT INTO user_storage (device_id, storage_key, data, size_bytes, updated_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [deviceId, 'shadow_colosseum_data', jsonStr, sizeBytes]
        );
      }

      const added = itemResults.filter(r => r.action === 'added').length;
      const replaced = itemResults.filter(r => r.action === 'replaced').length;
      const rejected = itemResults.filter(r => r.action === 'rejected').length;

      results.push({ username, status: 'ok', itemsAdded: added, itemsReplaced: replaced, itemsRejected: rejected, details: itemResults });
    }

    return res.status(200).json({ success: true, results });
  } catch (err) {
    console.error('[deposit-expedition] Error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Handle shared currency deposits (alkahest, marteau_rouge, contribution)
// These stay in shadow_colosseum_raid — no change
async function handleCurrencyDeposits(currencyDeposits, res) {
  try {
    const results = [];

    for (const { username, currencies } of currencyDeposits) {
      if (!username || !currencies) continue;

      const userResult = await query(
        'SELECT id, device_id FROM users WHERE LOWER(username) = LOWER($1)',
        [username]
      );
      if (userResult.rows.length === 0) {
        results.push({ username, status: 'user_not_found' });
        continue;
      }

      const deviceId = userResult.rows[0].device_id;

      const existing = await query(
        'SELECT data FROM user_storage WHERE device_id = $1 AND storage_key = $2',
        [deviceId, 'shadow_colosseum_raid']
      );

      let data = {};
      if (existing.rows.length > 0) {
        data = typeof existing.rows[0].data === 'string'
          ? JSON.parse(existing.rows[0].data) : existing.rows[0].data;
      }

      if (!data.expeditionCurrencies || typeof data.expeditionCurrencies !== 'object') {
        data.expeditionCurrencies = { alkahest: 0, marteau_rouge: 0, contribution: 0 };
      }

      const c = data.expeditionCurrencies;
      c.alkahest = (c.alkahest || 0) + (currencies.alkahest || 0);
      c.marteau_rouge = (c.marteau_rouge || 0) + (currencies.marteau_rouge || 0);
      c.contribution = (c.contribution || 0) + (currencies.contribution || 0);

      const jsonStr = JSON.stringify(data);
      const sizeBytes = Buffer.byteLength(jsonStr, 'utf8');

      if (existing.rows.length > 0) {
        await query(
          `UPDATE user_storage SET data = $1, size_bytes = $2, updated_at = NOW()
           WHERE device_id = $3 AND storage_key = $4`,
          [jsonStr, sizeBytes, deviceId, 'shadow_colosseum_raid']
        );
      } else {
        await query(
          `INSERT INTO user_storage (device_id, storage_key, data, size_bytes, updated_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [deviceId, 'shadow_colosseum_raid', jsonStr, sizeBytes]
        );
      }

      results.push({ username, status: 'ok', currencies: c });
    }

    return res.status(200).json({ success: true, results });
  } catch (err) {
    console.error('[deposit-expedition] Currency error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
