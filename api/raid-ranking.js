import { query } from './_db/neon.js';
import { extractUser } from './_utils/auth.js';

// ─── Init: create raid_ranking_ultime table ─────────────────

async function handleInit(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  await query(`
    CREATE TABLE IF NOT EXISTS raid_ranking_ultime (
      id SERIAL PRIMARY KEY,
      device_id VARCHAR(64) NOT NULL UNIQUE,
      display_name VARCHAR(32) NOT NULL DEFAULT 'Joueur',
      rc INTEGER NOT NULL,
      total_damage BIGINT NOT NULL,
      fighters TEXT NOT NULL,
      team_detail TEXT,
      duration INTEGER NOT NULL DEFAULT 180,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_raid_ultime_rc ON raid_ranking_ultime(rc DESC, total_damage DESC)`);

  return res.status(200).json({ success: true });
}

// ─── Submit: upsert only if better score ─────────────────

async function handleSubmit(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { displayName, rc, totalDamage, duration, fighters, teamDetail } = req.body;

  // Validation
  if (!rc || rc < 1) return res.status(400).json({ error: 'RC must be >= 1' });
  if (!Array.isArray(fighters) || fighters.length === 0 || fighters.length > 6) {
    return res.status(400).json({ error: 'Invalid fighters (1-6)' });
  }
  if (teamDetail && teamDetail.length > 5000) {
    return res.status(400).json({ error: 'teamDetail too large' });
  }

  const name = (displayName || user.displayName || 'Joueur').slice(0, 32);
  const fightersStr = JSON.stringify(fighters);
  const dmg = Math.floor(totalDamage || 0);
  const dur = Math.floor(duration || 180);

  // Upsert: only update if rc improved OR (same rc but more damage)
  await query(
    `INSERT INTO raid_ranking_ultime (device_id, display_name, rc, total_damage, fighters, team_detail, duration, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     ON CONFLICT (device_id)
     DO UPDATE SET display_name = $2, rc = $3, total_damage = $4, fighters = $5, team_detail = $6, duration = $7, updated_at = NOW()
     WHERE raid_ranking_ultime.rc < $3 OR (raid_ranking_ultime.rc = $3 AND raid_ranking_ultime.total_damage < $4)`,
    [user.deviceId, name, Math.floor(rc), dmg, fightersStr, teamDetail || null, dur]
  );

  return res.status(200).json({ success: true });
}

// ─── Rankings: top 50 (lightweight, no team_detail) ─────────

async function handleRankings(req, res) {
  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  // Top 50
  const result = await query(
    `SELECT id, device_id, display_name, rc, total_damage, fighters, duration, updated_at
     FROM raid_ranking_ultime
     ORDER BY rc DESC, total_damage DESC
     LIMIT 50`
  );

  const rankings = result.rows.map((r, i) => ({
    rank: i + 1,
    entryId: r.id,
    displayName: r.display_name,
    rc: r.rc,
    totalDamage: Number(r.total_damage),
    fighters: typeof r.fighters === 'string' ? JSON.parse(r.fighters) : r.fighters,
    duration: r.duration,
    isMe: r.device_id === user.deviceId,
  }));

  // Total count
  const totalResult = await query('SELECT COUNT(*) as total FROM raid_ranking_ultime');
  const total = parseInt(totalResult.rows[0]?.total, 10) || 0;

  // Player's rank if not in top 50
  let myRank = null;
  let myEntry = null;
  const inTop = rankings.find(r => r.isMe);
  if (!inTop) {
    const myRow = await query(
      'SELECT id, rc, total_damage, fighters, duration FROM raid_ranking_ultime WHERE device_id = $1',
      [user.deviceId]
    );
    if (myRow.rows.length > 0) {
      const m = myRow.rows[0];
      const rankQ = await query(
        'SELECT COUNT(*) + 1 as rank FROM raid_ranking_ultime WHERE rc > $1 OR (rc = $1 AND total_damage > $2)',
        [m.rc, m.total_damage]
      );
      myRank = parseInt(rankQ.rows[0]?.rank, 10) || null;
      myEntry = {
        entryId: m.id,
        rc: m.rc,
        totalDamage: Number(m.total_damage),
        fighters: typeof m.fighters === 'string' ? JSON.parse(m.fighters) : m.fighters,
        duration: m.duration,
      };
    }
  }

  return res.status(200).json({ success: true, rankings, total, myRank, myEntry });
}

// ─── Player detail: team_detail (gzip base64) ────────────────

async function handlePlayerDetail(req, res) {
  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  const result = await query(
    'SELECT id, display_name, team_detail FROM raid_ranking_ultime WHERE id = $1',
    [parseInt(id, 10)]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  const r = result.rows[0];
  return res.status(200).json({
    success: true,
    entryId: r.id,
    displayName: r.display_name,
    teamDetail: r.team_detail,
  });
}

// ─── Main router ─────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://builderberu.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query.action;

  try {
    switch (action) {
      case 'init':
        return await handleInit(req, res);
      case 'submit':
        return await handleSubmit(req, res);
      case 'rankings':
        return await handleRankings(req, res);
      case 'player-detail':
        return await handlePlayerDetail(req, res);
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err) {
    console.error('[raid-ranking] Error:', err);
    return res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}
