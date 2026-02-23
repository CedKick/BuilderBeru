import { query } from '../_db/neon.js';

// Tables that get heavy UPDATE traffic and need regular VACUUM
const VACUUM_TABLES = [
  'user_storage',
  'player_mail',
  'faction_buffs',
  'player_factions',
  'pvp_defense_teams',
  'pve_rankings',
  'pve_rankings_v2',
  'users',
  'faction_weekly',
  'pvp_match_history',
];

export default async function handler(req, res) {
  // Vercel cron sends GET requests with Authorization header
  // Also accept manual trigger with secret query param
  const authHeader = req.headers['authorization'];
  const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const isManual = req.query.secret === process.env.CRON_SECRET;

  if (!isVercelCron && !isManual) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const results = [];

  for (const table of VACUUM_TABLES) {
    try {
      // VACUUM (not FULL) — non-blocking, reclaims dead tuples without exclusive lock
      await query(`VACUUM ANALYZE ${table}`);
      results.push({ table, status: 'ok' });
    } catch (err) {
      results.push({ table, status: 'error', message: err.message });
    }
  }

  const successCount = results.filter(r => r.status === 'ok').length;

  return res.status(200).json({
    success: true,
    vacuumed: successCount,
    total: VACUUM_TABLES.length,
    results,
    timestamp: new Date().toISOString(),
  });
}
