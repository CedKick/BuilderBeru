import { query } from '../_db/neon.js';
import { extractUser } from '../_utils/auth.js';
import { checkSuspension, getBeruSuspendMessage } from '../_utils/anticheat.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://builderberu.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Auto-create table if needed
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

    // Check suspension status (lightweight — single indexed SELECT)
    const suspension = await checkSuspension(deviceId);

    // Load one key or all keys for this device
    if (key) {
      const result = await query(
        'SELECT data, updated_at FROM user_storage WHERE device_id = $1 AND storage_key = $2',
        [deviceId, key]
      );
      if (result.rows.length === 0) {
        return res.status(200).json({ success: true, data: null });
      }
      const resp = {
        success: true,
        data: result.rows[0].data,
        updatedAt: result.rows[0].updated_at,
      };
      if (suspension) {
        resp.suspended = true;
        resp.suspendedReason = suspension.reason;
        resp.beruMessage = getBeruSuspendMessage();
      }
      return res.status(200).json(resp);
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

    const resp = { success: true, entries };
    if (suspension) {
      resp.suspended = true;
      resp.suspendedReason = suspension.reason;
      resp.beruMessage = getBeruSuspendMessage();
    }
    return res.status(200).json(resp);
  } catch (err) {
    console.error('Load error:', err);
    return res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}
