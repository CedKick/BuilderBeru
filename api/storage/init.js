import { query } from '../_db/neon.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
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

    await query(`
      CREATE INDEX IF NOT EXISTS idx_user_storage_device
      ON user_storage(device_id)
    `);

    return res.status(200).json({ success: true, message: 'Schema initialized' });
  } catch (err) {
    console.error('Init error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
