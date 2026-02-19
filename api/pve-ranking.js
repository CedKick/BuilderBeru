import { query } from './_db/neon.js';
import { extractUser } from './_utils/auth.js';

// ─── Action handlers ─────────────────────────────────────

async function handleInit(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  await query(`
    CREATE TABLE IF NOT EXISTS pve_rankings (
      id SERIAL PRIMARY KEY,
      device_id VARCHAR(64) NOT NULL UNIQUE,
      display_name VARCHAR(32) NOT NULL DEFAULT 'Joueur',
      hunter_name VARCHAR(64) NOT NULL,
      hunter_element VARCHAR(16),
      hunter_emoji VARCHAR(8),
      best_ilevel INTEGER NOT NULL DEFAULT 0,
      hunter_data JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_pve_ilevel ON pve_rankings(best_ilevel DESC)`);

  return res.status(200).json({ success: true });
}

async function handleSubmit(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { displayName, hunterName, hunterElement, hunterEmoji, bestIlevel, hunterData } = req.body;

  if (!hunterName || !bestIlevel || bestIlevel <= 0 || !hunterData) {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }

  const name = (displayName || user.displayName || 'Joueur').slice(0, 20);
  const jsonStr = JSON.stringify(hunterData);

  if (Buffer.byteLength(jsonStr, 'utf8') > 200 * 1024) {
    return res.status(413).json({ error: 'Hunter data too large' });
  }

  await query(
    `INSERT INTO pve_rankings (device_id, display_name, hunter_name, hunter_element, hunter_emoji, best_ilevel, hunter_data, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     ON CONFLICT (device_id)
     DO UPDATE SET display_name = $2, hunter_name = $3, hunter_element = $4, hunter_emoji = $5, best_ilevel = $6, hunter_data = $7, updated_at = NOW()`,
    [user.deviceId, name, hunterName.slice(0, 64), (hunterElement || '').slice(0, 16), (hunterEmoji || '').slice(0, 8), Math.floor(bestIlevel), jsonStr]
  );

  return res.status(200).json({ success: true });
}

async function handleRankings(req, res) {
  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const result = await query(
    `SELECT id, display_name, hunter_name, hunter_element, hunter_emoji, best_ilevel, updated_at
     FROM pve_rankings
     ORDER BY best_ilevel DESC
     LIMIT 100`
  );

  const rankings = result.rows.map((r, i) => ({
    rank: i + 1,
    playerId: r.id,
    displayName: r.display_name,
    hunterName: r.hunter_name,
    hunterElement: r.hunter_element,
    hunterEmoji: r.hunter_emoji,
    bestIlevel: r.best_ilevel,
    updatedAt: r.updated_at,
  }));

  // Find the authenticated user's rank
  let playerRank = null;
  let myPlayerId = null;
  const myRow = await query(
    'SELECT id FROM pve_rankings WHERE device_id = $1',
    [user.deviceId]
  );
  if (myRow.rows.length > 0) {
    myPlayerId = myRow.rows[0].id;
    const rankResult = await query(
      `SELECT COUNT(*) + 1 as rank FROM pve_rankings
       WHERE best_ilevel > (SELECT COALESCE(best_ilevel, 0) FROM pve_rankings WHERE device_id = $1)`,
      [user.deviceId]
    );
    if (rankResult.rows[0]) {
      playerRank = parseInt(rankResult.rows[0].rank, 10);
    }
  }

  const totalResult = await query('SELECT COUNT(*) as total FROM pve_rankings');
  const total = parseInt(totalResult.rows[0]?.total, 10) || 0;

  return res.status(200).json({ success: true, rankings, total, playerRank, myPlayerId });
}

async function handlePlayerDetail(req, res) {
  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { playerId } = req.query;
  if (!playerId) return res.status(400).json({ error: 'Missing playerId' });

  const result = await query(
    `SELECT id, display_name, hunter_name, hunter_element, hunter_emoji, best_ilevel, hunter_data, updated_at
     FROM pve_rankings WHERE id = $1`,
    [parseInt(playerId, 10)]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Player not found' });
  }

  const r = result.rows[0];
  return res.status(200).json({
    success: true,
    player: {
      playerId: r.id,
      displayName: r.display_name,
      hunterName: r.hunter_name,
      hunterElement: r.hunter_element,
      hunterEmoji: r.hunter_emoji,
      bestIlevel: r.best_ilevel,
      hunterData: r.hunter_data,
      updatedAt: r.updated_at,
    },
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
    console.error('PVE Ranking error:', err);
    return res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}
