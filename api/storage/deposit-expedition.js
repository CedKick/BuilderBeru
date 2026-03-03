import { query } from '../_db/neon.js';

// Server-to-server secret (expedition server → Vercel)
const GAME_SERVER_SECRET = process.env.GAME_SERVER_SECRET || 'manaya-raid-secret-key';

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

    const { deposits } = req.body;
    // deposits = [{ username, items: [{ itemId, itemName, rarity, binding, type, slot, stats, setId }] }]
    if (!Array.isArray(deposits) || deposits.length === 0) {
      return res.status(400).json({ error: 'Missing deposits array' });
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

      // Initialize expeditionInventory if missing
      if (!Array.isArray(data.expeditionInventory)) {
        data.expeditionInventory = [];
      }

      // Add each item with unique ID and timestamp
      const timestamp = Date.now();
      for (const item of items) {
        data.expeditionInventory.push({
          ...item,
          uid: `exp_${timestamp}_${Math.random().toString(36).slice(2, 8)}`,
          obtainedAt: timestamp,
          source: 'expedition',
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

      results.push({ username, status: 'ok', itemsAdded: items.length });
    }

    return res.status(200).json({ success: true, results });
  } catch (err) {
    console.error('[deposit-expedition] Error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
