import { query } from '../_db/neon.js';
import { extractUser } from '../_utils/auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://builderberu.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Admin check — only admin users can access
  // Supports both Authorization header (fetch) and ?token= query param (browser URL)
  const ADMINS = ['CedKick', 'Kly'];
  const queryToken = req.query?.token;
  if (queryToken && !req.headers?.authorization) {
    req.headers = { ...req.headers, authorization: `Bearer ${queryToken}` };
  }
  const user = await extractUser(req);
  if (!user || !ADMINS.includes(user.username)) {
    return res.status(403).json({ error: 'Admin only' });
  }

  try {
    // 1. Table sizes (actual disk usage)
    const tableSizes = await query(`
      SELECT
        relname AS table_name,
        pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
        pg_total_relation_size(relid) AS total_bytes,
        pg_size_pretty(pg_relation_size(relid)) AS data_size,
        pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) AS index_toast_size,
        n_live_tup AS live_rows,
        n_dead_tup AS dead_rows
      FROM pg_stat_user_tables
      JOIN pg_class ON relname = pg_class.relname
      ORDER BY pg_total_relation_size(relid) DESC
      LIMIT 20
    `);

    // 2. Total DB size
    const dbSize = await query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) AS db_size,
             pg_database_size(current_database()) AS db_bytes
    `);

    // 3. user_storage breakdown by key
    const keyBreakdown = await query(`
      SELECT
        storage_key,
        COUNT(*) AS user_count,
        SUM(size_bytes) AS total_text_bytes,
        pg_size_pretty(SUM(size_bytes)) AS total_text_size,
        pg_size_pretty(AVG(size_bytes)::bigint) AS avg_per_user,
        pg_size_pretty(MAX(size_bytes)::bigint) AS max_per_user
      FROM user_storage
      GROUP BY storage_key
      ORDER BY SUM(size_bytes) DESC
    `);

    // 4. Unique devices count
    const deviceCount = await query(`
      SELECT COUNT(DISTINCT device_id) AS unique_devices FROM user_storage
    `);

    // 5. Top 10 biggest entries
    const biggestEntries = await query(`
      SELECT device_id, storage_key, size_bytes,
             pg_size_pretty(size_bytes) AS size_pretty,
             updated_at
      FROM user_storage
      ORDER BY size_bytes DESC
      LIMIT 10
    `);

    // 6. TOAST table size (JSONB large values are stored in TOAST)
    const toastSize = await query(`
      SELECT
        c.relname AS table_name,
        pg_size_pretty(pg_relation_size(c.reltoastrelid)) AS toast_size,
        pg_relation_size(c.reltoastrelid) AS toast_bytes
      FROM pg_class c
      WHERE c.reltoastrelid != 0
      AND c.relname IN ('user_storage', 'users', 'faction_buffs', 'pvp_battles', 'drop_logs', 'pve_rankings', 'beru_messages')
      ORDER BY pg_relation_size(c.reltoastrelid) DESC
    `);

    // 7. Dead tuple bloat estimate
    const bloatEstimate = await query(`
      SELECT
        relname,
        n_live_tup AS live_tuples,
        n_dead_tup AS dead_tuples,
        CASE WHEN n_live_tup > 0
          THEN ROUND(n_dead_tup::numeric / n_live_tup * 100, 1)
          ELSE 0
        END AS dead_pct
      FROM pg_stat_user_tables
      WHERE n_dead_tup > 0 OR n_live_tup > 0
      ORDER BY n_dead_tup DESC
    `);

    // 8. Client version tracking — who's on old vs new code
    const clientVersions = await query(`
      SELECT
        device_id,
        storage_key,
        client_version,
        pg_size_pretty(size_bytes) AS size_pretty,
        updated_at
      FROM user_storage
      WHERE storage_key = 'shadow_colosseum_data'
      ORDER BY updated_at DESC
    `);

    // 9. Version summary
    const versionSummary = await query(`
      SELECT
        COALESCE(client_version, 0) AS version,
        COUNT(*) AS player_count,
        CASE WHEN client_version IS NULL OR client_version < 2 THEN 'OLD (no debounce)'
             ELSE 'NEW (debounce 3s)' END AS status
      FROM user_storage
      WHERE storage_key = 'shadow_colosseum_data'
      GROUP BY client_version
      ORDER BY version
    `);

    return res.status(200).json({
      dbSize: dbSize.rows[0],
      tableSizes: tableSizes.rows,
      keyBreakdown: keyBreakdown.rows,
      uniqueDevices: deviceCount.rows[0].unique_devices,
      biggestEntries: biggestEntries.rows,
      toastSize: toastSize.rows,
      bloatEstimate: bloatEstimate.rows,
      clientVersions: clientVersions.rows,
      versionSummary: versionSummary.rows,
    });

  } catch (err) {
    console.error('Diagnostics error:', err);
    return res.status(500).json({ error: err.message });
  }
}
