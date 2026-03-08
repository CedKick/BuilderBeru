import { query } from '../_db/neon.js';

/**
 * Daily backup: snapshot all user_storage rows into user_storage_backups.
 * Keeps 30 days of history, purges older entries automatically.
 */
export default async function handler(req, res) {
  const authHeader = req.headers['authorization'];
  const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const isManual = req.query?.secret === process.env.CRON_SECRET;

  if (!isVercelCron && !isManual) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Ensure backup table exists
    await query(`
      CREATE TABLE IF NOT EXISTS user_storage_backups (
        id SERIAL PRIMARY KEY,
        backup_date DATE NOT NULL DEFAULT CURRENT_DATE,
        device_id TEXT NOT NULL,
        key TEXT NOT NULL,
        data JSONB,
        size_bytes INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Create index for fast purge queries
    await query(`
      CREATE INDEX IF NOT EXISTS idx_backup_date ON user_storage_backups (backup_date)
    `);
    await query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_backup_unique ON user_storage_backups (backup_date, device_id, key)
    `);

    // Snapshot: INSERT all current user_storage rows (skip if today already backed up via UPSERT)
    const insertResult = await query(`
      INSERT INTO user_storage_backups (backup_date, device_id, key, data, size_bytes)
      SELECT CURRENT_DATE, device_id, key, data, size_bytes
      FROM user_storage
      ON CONFLICT (backup_date, device_id, key) DO NOTHING
    `);

    // Purge backups older than 30 days
    const purgeResult = await query(`
      DELETE FROM user_storage_backups WHERE backup_date < CURRENT_DATE - INTERVAL '30 days'
    `);

    const backupCount = insertResult.rowCount || 0;
    const purgedCount = purgeResult.rowCount || 0;

    console.log(`[backup] Snapshot: ${backupCount} rows backed up, ${purgedCount} old rows purged`);

    return res.status(200).json({
      success: true,
      backed_up: backupCount,
      purged: purgedCount,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[backup] Failed:', err.message);
    return res.status(500).json({ error: 'Backup failed', message: err.message });
  }
}
