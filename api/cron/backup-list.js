import { query } from '../_db/neon.js';
import { extractUser } from '../_utils/auth.js';

/**
 * List available backups.
 * GET /api/cron/backup-list
 * Admin only (CedKick).
 */
export default async function handler(req, res) {
  const user = await extractUser(req);
  if (!user || user.username !== 'CedKick') {
    return res.status(403).json({ error: 'Admin only' });
  }

  try {
    const result = await query(`
      SELECT backup_date, COUNT(*) as row_count, SUM(size_bytes) as total_bytes
      FROM user_storage_backups
      GROUP BY backup_date
      ORDER BY backup_date DESC
      LIMIT 30
    `);

    return res.status(200).json({
      success: true,
      backups: result.rows.map(r => ({
        date: r.backup_date,
        rows: parseInt(r.row_count),
        size: `${(parseInt(r.total_bytes) / 1024 / 1024).toFixed(2)} MB`,
      })),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
