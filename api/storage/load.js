import { query } from '../db/neon.js';
import { extractUser } from '../utils/auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://builderberu.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    let { deviceId, key } = req.query;

    // If auth token present, use the user's canonical deviceId
    const user = await extractUser(req);
    if (user) {
      deviceId = user.deviceId;
    }

    if (!deviceId) {
      return res.status(400).json({ error: 'Missing deviceId' });
    }

    // Validate deviceId format
    if (!deviceId.startsWith('dev_') || deviceId.length > 50) {
      return res.status(403).json({ error: 'Invalid deviceId' });
    }

    // Load one key or all keys for this device
    if (key) {
      const result = await query(
        'SELECT data, updated_at FROM user_storage WHERE device_id = $1 AND storage_key = $2',
        [deviceId, key]
      );
      if (result.rows.length === 0) {
        return res.status(200).json({ success: true, data: null });
      }
      return res.status(200).json({
        success: true,
        data: result.rows[0].data,
        updatedAt: result.rows[0].updated_at,
      });
    }

    // Load all keys for this device
    const result = await query(
      'SELECT storage_key, data, updated_at FROM user_storage WHERE device_id = $1',
      [deviceId]
    );

    const entries = {};
    for (const row of result.rows) {
      entries[row.storage_key] = { data: row.data, updatedAt: row.updated_at };
    }

    return res.status(200).json({ success: true, entries });
  } catch (err) {
    console.error('Load error:', err);
    return res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}
