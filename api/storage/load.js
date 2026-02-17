import { query } from '../db/neon.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { deviceId, key } = req.query;

    if (!deviceId) {
      return res.status(400).json({ error: 'Missing deviceId' });
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
    return res.status(500).json({ success: false, error: err.message });
  }
}
