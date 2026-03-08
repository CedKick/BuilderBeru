import { query } from '../_db/neon.js';
import { extractUser } from '../_utils/auth.js';

/**
 * Restore user_storage from a backup date.
 * POST /api/cron/backup-restore { date: "2026-03-07", deviceId?: "dev_xxx", key?: "shadow_colosseum_data" }
 * Admin only (CedKick).
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await extractUser(req);
  if (!user || user.username !== 'CedKick') {
    return res.status(403).json({ error: 'Admin only' });
  }

  const { date, deviceId, key } = req.body;
  if (!date) return res.status(400).json({ error: 'Missing date (YYYY-MM-DD)' });

  try {
    // Build WHERE clause
    let where = 'backup_date = $1';
    const params = [date];
    if (deviceId) { params.push(deviceId); where += ` AND device_id = $${params.length}`; }
    if (key) { params.push(key); where += ` AND key = $${params.length}`; }

    // Preview what will be restored
    const preview = await query(`SELECT device_id, key, size_bytes FROM user_storage_backups WHERE ${where}`, params);
    if (preview.rows.length === 0) {
      return res.status(404).json({ error: 'No backup found for this date/filter' });
    }

    // Restore: UPSERT from backup into user_storage
    const result = await query(`
      INSERT INTO user_storage (device_id, key, data, size_bytes, updated_at)
      SELECT device_id, key, data, size_bytes, NOW()
      FROM user_storage_backups
      WHERE ${where}
      ON CONFLICT (device_id, key) DO UPDATE SET
        data = EXCLUDED.data,
        size_bytes = EXCLUDED.size_bytes,
        updated_at = NOW()
    `, params);

    console.log(`[backup-restore] Restored ${result.rowCount} rows from ${date}`);

    return res.status(200).json({
      success: true,
      restored: result.rowCount,
      date,
      rows: preview.rows,
    });
  } catch (err) {
    console.error('[backup-restore] Failed:', err.message);
    return res.status(500).json({ error: 'Restore failed', message: err.message });
  }
}
