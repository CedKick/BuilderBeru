import { query } from '../_db/neon.js';
import { extractUser } from '../_utils/auth.js';
import { checkSuspension, getBeruSuspendMessage } from '../_utils/anticheat.js';
import { sendCompressed } from '../_utils/compress.js';

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (['https://builderberu.com', 'https://www.builderberu.com', 'http://localhost:5173'].includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, If-None-Match');
  res.setHeader('Access-Control-Expose-Headers', 'ETag');
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

      // ETag: based on updated_at timestamp — if client has same version, skip transfer
      const etag = `"${new Date(result.rows[0].updated_at).getTime()}"`;
      if (req.headers['if-none-match'] === etag) {
        return res.status(304).end(); // Zero bytes transferred
      }
      res.setHeader('ETag', etag);

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
      return sendCompressed(req, res, 200, resp);
    }

    // Load all keys for this device
    const result = await query(
      'SELECT storage_key, data, updated_at FROM user_storage WHERE device_id = $1',
      [deviceId]
    );

    const entries = {};
    // ETag for load-all: max updated_at across all keys
    let maxUpdated = 0;
    for (const row of result.rows) {
      entries[row.storage_key] = { data: row.data, updatedAt: row.updated_at };
      const ts = new Date(row.updated_at).getTime();
      if (ts > maxUpdated) maxUpdated = ts;
    }

    if (maxUpdated > 0) {
      const etag = `"all-${maxUpdated}"`;
      if (req.headers['if-none-match'] === etag) {
        return res.status(304).end();
      }
      res.setHeader('ETag', etag);
    }

    const resp = { success: true, entries };
    if (suspension) {
      resp.suspended = true;
      resp.suspendedReason = suspension.reason;
      resp.beruMessage = getBeruSuspendMessage();
    }
    return sendCompressed(req, res, 200, resp);
  } catch (err) {
    console.error('Load error:', err);
    return res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}
