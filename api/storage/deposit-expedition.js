import { query } from '../_db/neon.js';

// Server-to-server secret (expedition server → Vercel)
const GAME_SERVER_SECRET = process.env.GAME_SERVER_SECRET || 'manaya-raid-secret-key';

// Inventory limits (mirrored from expedition-server config)
const INVENTORY_MAX = 200;
const EQUIP_TYPES = ['armor', 'weapon', 'set_piece'];

// Rarity weights for stat scoring (higher rarity = higher base value)
const RARITY_WEIGHT = { common: 1, uncommon: 2, rare: 4, epic: 8, legendary: 16, mythique: 32 };

// Calculate a simple power score for an equippable item
// Sums all numeric stat values + rarity bonus
function calcItemScore(item) {
  let score = 0;
  if (item.stats && typeof item.stats === 'object') {
    for (const val of Object.values(item.stats)) {
      if (typeof val === 'number') score += Math.abs(val);
    }
  }
  score += (RARITY_WEIGHT[item.rarity] || 0) * 10;
  return score;
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
    // Validate server secret
    const secret = req.headers['x-server-secret'];
    if (secret !== GAME_SERVER_SECRET) {
      return res.status(403).json({ error: 'Invalid server secret' });
    }

    const { deposits, currencyDeposits } = req.body;

    // Handle shared currency deposits (alkahest, marteau_rouge, contribution)
    // currencyDeposits = [{ username, currencies: { alkahest: N, marteau_rouge: N, contribution: N } }]
    if (Array.isArray(currencyDeposits) && currencyDeposits.length > 0) {
      return handleCurrencyDeposits(currencyDeposits, res);
    }

    // deposits = [{ username, items: [{ itemId, itemName, rarity, binding, type, slot, stats, setId }] }]
    if (!Array.isArray(deposits) || deposits.length === 0) {
      return res.status(400).json({ error: 'Missing deposits or currencyDeposits array' });
    }

    const results = [];
    for (const { username, items } of deposits) {
      if (!username || !Array.isArray(items) || items.length === 0) continue;

      // Find user by username (case-insensitive)
      const userResult = await query(
        'SELECT id, device_id FROM users WHERE LOWER(username) = LOWER($1)',
        [username]
      );
      if (userResult.rows.length === 0) {
        results.push({ username, status: 'user_not_found' });
        continue;
      }

      const deviceId = userResult.rows[0].device_id;

      // Read current shadow_colosseum_raid data
      const existing = await query(
        'SELECT data FROM user_storage WHERE device_id = $1 AND storage_key = $2',
        [deviceId, 'shadow_colosseum_raid']
      );

      let data = {};
      if (existing.rows.length > 0) {
        data = typeof existing.rows[0].data === 'string'
          ? JSON.parse(existing.rows[0].data) : existing.rows[0].data;
      }

      // Initialize expeditionInventory & replacementLog if missing
      if (!Array.isArray(data.expeditionInventory)) {
        data.expeditionInventory = [];
      }
      if (!Array.isArray(data.expeditionReplacementLog)) {
        data.expeditionReplacementLog = [];
      }

      const timestamp = Date.now();
      const itemResults = [];

      for (const item of items) {
        const inv = data.expeditionInventory;
        const isEquip = EQUIP_TYPES.includes(item.type);

        // ── Inventory has space → just add ──
        if (inv.length < INVENTORY_MAX) {
          inv.push({
            ...item,
            uid: `exp_${timestamp}_${Math.random().toString(36).slice(2, 8)}`,
            obtainedAt: timestamp,
            source: 'expedition',
            locked: false,
          });
          itemResults.push({ itemId: item.itemId, action: 'added' });
          continue;
        }

        // ── Inventory FULL ──

        if (!isEquip) {
          // Non-equipment: refuse (consumables, materials, currencies can't replace anything)
          itemResults.push({ itemId: item.itemId, action: 'rejected', reason: 'inventory_full' });
          continue;
        }

        // Equipment: find the weakest non-locked equipment to replace
        const newScore = calcItemScore(item);

        // Find all non-locked equipment in inventory, sorted by score ascending
        let weakestIdx = -1;
        let weakestScore = Infinity;

        for (let i = 0; i < inv.length; i++) {
          const existing = inv[i];
          if (existing.locked) continue;
          if (!EQUIP_TYPES.includes(existing.type)) continue;

          const existingScore = calcItemScore(existing);
          if (existingScore < weakestScore) {
            weakestScore = existingScore;
            weakestIdx = i;
          }
        }

        // No unlocked equipment found to replace
        if (weakestIdx === -1) {
          itemResults.push({ itemId: item.itemId, action: 'rejected', reason: 'all_locked' });
          continue;
        }

        // New item is weaker than the weakest → don't replace
        if (newScore <= weakestScore) {
          itemResults.push({ itemId: item.itemId, action: 'rejected', reason: 'weaker_than_existing' });
          continue;
        }

        // Replace: log what was replaced
        const replaced = inv[weakestIdx];
        data.expeditionReplacementLog.push({
          timestamp,
          replacedItem: { uid: replaced.uid, itemId: replaced.itemId, itemName: replaced.itemName, rarity: replaced.rarity, score: weakestScore },
          newItem: { itemId: item.itemId, itemName: item.itemName, rarity: item.rarity, score: newScore },
        });

        // Keep log trimmed (last 50 replacements)
        if (data.expeditionReplacementLog.length > 50) {
          data.expeditionReplacementLog = data.expeditionReplacementLog.slice(-50);
        }

        // Replace in-place
        inv[weakestIdx] = {
          ...item,
          uid: `exp_${timestamp}_${Math.random().toString(36).slice(2, 8)}`,
          obtainedAt: timestamp,
          source: 'expedition',
          locked: false,
        };

        itemResults.push({
          itemId: item.itemId,
          action: 'replaced',
          replacedItem: replaced.itemName,
          replacedRarity: replaced.rarity,
          oldScore: weakestScore,
          newScore,
        });
      }

      // Write back
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

      const added = itemResults.filter(r => r.action === 'added').length;
      const replaced = itemResults.filter(r => r.action === 'replaced').length;
      const rejected = itemResults.filter(r => r.action === 'rejected').length;

      results.push({
        username,
        status: 'ok',
        itemsAdded: added,
        itemsReplaced: replaced,
        itemsRejected: rejected,
        details: itemResults,
      });
    }

    return res.status(200).json({ success: true, results });
  } catch (err) {
    console.error('[deposit-expedition] Error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Handle shared currency deposits (alkahest, marteau_rouge, contribution)
// These are counters, not inventory items — no size limit, just increment
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

      // Initialize expeditionCurrencies if missing
      if (!data.expeditionCurrencies || typeof data.expeditionCurrencies !== 'object') {
        data.expeditionCurrencies = { alkahest: 0, marteau_rouge: 0, contribution: 0 };
      }

      // Increment counters
      const c = data.expeditionCurrencies;
      c.alkahest = (c.alkahest || 0) + (currencies.alkahest || 0);
      c.marteau_rouge = (c.marteau_rouge || 0) + (currencies.marteau_rouge || 0);
      c.contribution = (c.contribution || 0) + (currencies.contribution || 0);

      // Write back
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
