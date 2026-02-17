import { query } from './db/neon.js';

const ELO_K = 32;
const MIN_RATING = 100;

function computeElo(atkRating, defRating, attackerWon) {
  const expected = 1 / (1 + Math.pow(10, (defRating - atkRating) / 400));
  const actual = attackerWon ? 1 : 0;
  return Math.round(ELO_K * (actual - expected));
}

// ─── Action handlers ─────────────────────────────────────

async function handleInit(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  await query(`
    CREATE TABLE IF NOT EXISTS pvp_defense_teams (
      id SERIAL PRIMARY KEY,
      device_id VARCHAR(64) NOT NULL UNIQUE,
      display_name VARCHAR(32) NOT NULL DEFAULT 'Joueur',
      team_data JSONB NOT NULL,
      power_score INTEGER NOT NULL DEFAULT 0,
      rating INTEGER NOT NULL DEFAULT 1000,
      wins INTEGER NOT NULL DEFAULT 0,
      losses INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_pvp_power ON pvp_defense_teams(power_score)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_pvp_rating ON pvp_defense_teams(rating)`);

  await query(`
    CREATE TABLE IF NOT EXISTS pvp_match_history (
      id SERIAL PRIMARY KEY,
      attacker_id VARCHAR(64) NOT NULL,
      defender_id VARCHAR(64) NOT NULL,
      attacker_won BOOLEAN NOT NULL,
      attacker_score INTEGER DEFAULT 0,
      defender_score INTEGER DEFAULT 0,
      duration INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_pvp_history_atk ON pvp_match_history(attacker_id)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_pvp_history_def ON pvp_match_history(defender_id)`);

  return res.status(200).json({ success: true });
}

async function handleRegisterDefense(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { deviceId, displayName, teamData, powerScore } = req.body;

  if (!deviceId || !teamData || powerScore === undefined || powerScore === null) {
    return res.status(400).json({ error: 'Missing deviceId, teamData, or powerScore' });
  }
  if (!deviceId.startsWith('dev_') || deviceId.length > 50) {
    return res.status(403).json({ error: 'Invalid deviceId' });
  }
  if (!Array.isArray(teamData) || teamData.length !== 6) {
    return res.status(400).json({ error: 'teamData must be array of 6 units' });
  }
  const name = (displayName || 'Joueur').slice(0, 20);

  const jsonStr = JSON.stringify(teamData);
  if (Buffer.byteLength(jsonStr, 'utf8') > 500 * 1024) {
    return res.status(413).json({ error: 'Team data too large' });
  }

  await query(
    `INSERT INTO pvp_defense_teams (device_id, display_name, team_data, power_score, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (device_id)
     DO UPDATE SET display_name = $2, team_data = $3, power_score = $4, updated_at = NOW()`,
    [deviceId, name, jsonStr, powerScore]
  );

  return res.status(200).json({ success: true });
}

async function handleFindOpponents(req, res) {
  const { deviceId, powerScore } = req.query;

  if (!deviceId || !powerScore) {
    return res.status(400).json({ error: 'Missing deviceId or powerScore' });
  }
  if (!deviceId.startsWith('dev_') || deviceId.length > 50) {
    return res.status(403).json({ error: 'Invalid deviceId' });
  }

  const ps = parseInt(powerScore, 10) || 0;

  let result = await query(
    `SELECT device_id, display_name, team_data, power_score, rating, wins, losses
     FROM pvp_defense_teams
     WHERE device_id != $1
     AND power_score BETWEEN $2 * 0.7 AND $2 * 1.3
     ORDER BY ABS(power_score - $2)
     LIMIT 5`,
    [deviceId, ps]
  );

  if (result.rows.length < 3) {
    result = await query(
      `SELECT device_id, display_name, team_data, power_score, rating, wins, losses
       FROM pvp_defense_teams
       WHERE device_id != $1
       ORDER BY ABS(power_score - $2)
       LIMIT 5`,
      [deviceId, ps]
    );
  }

  const opponents = result.rows.map(r => ({
    deviceId: r.device_id,
    displayName: r.display_name,
    teamData: r.team_data,
    powerScore: r.power_score,
    rating: r.rating,
    wins: r.wins,
    losses: r.losses,
  }));

  return res.status(200).json({ success: true, opponents });
}

async function handleReportResult(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { deviceId, defenderId, attackerWon, attackerAliveCount, duration } = req.body;

  if (!deviceId || !defenderId || attackerWon === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!deviceId.startsWith('dev_') || deviceId.length > 50) {
    return res.status(403).json({ error: 'Invalid deviceId' });
  }

  const atkResult = await query(
    'SELECT rating FROM pvp_defense_teams WHERE device_id = $1',
    [deviceId]
  );
  const defResult = await query(
    'SELECT rating FROM pvp_defense_teams WHERE device_id = $1',
    [defenderId]
  );

  const atkRating = atkResult.rows[0]?.rating || 1000;
  const defRating = defResult.rows[0]?.rating || 1000;

  const change = computeElo(atkRating, defRating, attackerWon);

  const newAtkRating = Math.max(MIN_RATING, atkRating + change);
  const newDefRating = Math.max(MIN_RATING, defRating - change);

  if (atkResult.rows.length > 0) {
    await query(
      `UPDATE pvp_defense_teams SET rating = $2, wins = wins + $3, losses = losses + $4, updated_at = NOW()
       WHERE device_id = $1`,
      [deviceId, newAtkRating, attackerWon ? 1 : 0, attackerWon ? 0 : 1]
    );
  }

  if (defResult.rows.length > 0) {
    await query(
      `UPDATE pvp_defense_teams SET rating = $2, wins = wins + $3, losses = losses + $4, updated_at = NOW()
       WHERE device_id = $1`,
      [defenderId, newDefRating, attackerWon ? 0 : 1, attackerWon ? 1 : 0]
    );
  }

  await query(
    `INSERT INTO pvp_match_history (attacker_id, defender_id, attacker_won, attacker_score, defender_score, duration)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [deviceId, defenderId, attackerWon, attackerAliveCount || 0, attackerWon ? 0 : 6, duration || 0]
  );

  return res.status(200).json({
    success: true,
    newRating: newAtkRating,
    ratingChange: change,
  });
}

async function handleRankings(req, res) {
  const { deviceId, limit: rawLimit, offset: rawOffset } = req.query;
  const limit = Math.min(50, parseInt(rawLimit, 10) || 50);
  const offset = parseInt(rawOffset, 10) || 0;

  const result = await query(
    `SELECT device_id, display_name, power_score, rating, wins, losses
     FROM pvp_defense_teams
     ORDER BY rating DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const rankings = result.rows.map((r, i) => ({
    rank: offset + i + 1,
    deviceId: r.device_id,
    displayName: r.display_name,
    powerScore: r.power_score,
    rating: r.rating,
    wins: r.wins,
    losses: r.losses,
  }));

  let playerRank = null;
  if (deviceId) {
    const rankResult = await query(
      `SELECT COUNT(*) + 1 as rank FROM pvp_defense_teams
       WHERE rating > (SELECT COALESCE(rating, 0) FROM pvp_defense_teams WHERE device_id = $1)`,
      [deviceId]
    );
    if (rankResult.rows[0]) {
      playerRank = parseInt(rankResult.rows[0].rank, 10);
    }
  }

  const totalResult = await query('SELECT COUNT(*) as total FROM pvp_defense_teams');
  const total = parseInt(totalResult.rows[0]?.total, 10) || 0;

  return res.status(200).json({ success: true, rankings, total, playerRank });
}

// ─── Main router ─────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://builderberu.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query.action;

  try {
    switch (action) {
      case 'init':
        return await handleInit(req, res);
      case 'register-defense':
        return await handleRegisterDefense(req, res);
      case 'find-opponents':
        return await handleFindOpponents(req, res);
      case 'report-result':
        return await handleReportResult(req, res);
      case 'rankings':
        return await handleRankings(req, res);
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err) {
    console.error('PVP error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
