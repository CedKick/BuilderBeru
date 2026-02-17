import { query } from '../db/neon.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { deviceId, key, data } = req.body;

    if (!deviceId || !key || data === undefined) {
      return res.status(400).json({ error: 'Missing deviceId, key, or data' });
    }

    const jsonStr = JSON.stringify(data);
    const sizeBytes = Buffer.byteLength(jsonStr, 'utf8');

    await query(
      `INSERT INTO user_storage (device_id, storage_key, data, size_bytes, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (device_id, storage_key)
       DO UPDATE SET data = $3, size_bytes = $4, updated_at = NOW()`,
      [deviceId, key, jsonStr, sizeBytes]
    );

    return res.status(200).json({ success: true, size: sizeBytes });
  } catch (err) {
    console.error('Save error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
