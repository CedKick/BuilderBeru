import { query } from './_db/neon.js';
import { extractUser } from './_utils/auth.js';

const ELO_K = 32;
const MIN_RATING = 100;
const MAX_ELO_DIFF = 400;     // Beyond this, no rating change
const MAX_DAILY_MATCHES = 25;
const MAX_SAME_OPP_PER_DAY = 3;
const MIN_REMATCH_HOURS = 1;

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

  // Require auth
  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { displayName, teamData, powerScore } = req.body;

  if (!teamData || powerScore === undefined || powerScore === null) {
    return res.status(400).json({ error: 'Missing teamData or powerScore' });
  }
  if (!Array.isArray(teamData) || teamData.length !== 6) {
    return res.status(400).json({ error: 'teamData must be array of 6 units' });
  }
  const name = (displayName || user.displayName || 'Joueur').slice(0, 20);

  const jsonStr = JSON.stringify(teamData);
  if (Buffer.byteLength(jsonStr, 'utf8') > 500 * 1024) {
    return res.status(413).json({ error: 'Team data too large' });
  }

  await query(
    `INSERT INTO pvp_defense_teams (device_id, display_name, team_data, power_score, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (device_id)
     DO UPDATE SET display_name = $2, team_data = $3, power_score = $4, updated_at = NOW()`,
    [user.deviceId, name, jsonStr, powerScore]
  );

  return res.status(200).json({ success: true });
}

async function handleFindOpponents(req, res) {
  // Require auth
  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { powerScore } = req.query;

  if (!powerScore) {
    return res.status(400).json({ error: 'Missing powerScore' });
  }

  const deviceId = user.deviceId;
  const ps = parseInt(powerScore, 10) || 0;

  // Get today's match counts per defender to exclude overplayed opponents
  const todayMatches = await query(
    `SELECT defender_id, COUNT(*) as cnt, MAX(created_at) as last_match
     FROM pvp_match_history
     WHERE attacker_id = $1 AND created_at > NOW() - INTERVAL '24 hours'
     GROUP BY defender_id`,
    [deviceId]
  );
  const matchMap = {};
  todayMatches.rows.forEach(r => {
    matchMap[r.defender_id] = { count: parseInt(r.cnt, 10), lastMatch: new Date(r.last_match) };
  });

  // Exclude opponents fought 3+ times today or fought less than 1h ago
  const excludeIds = Object.entries(matchMap)
    .filter(([, v]) => v.count >= MAX_SAME_OPP_PER_DAY || (Date.now() - v.lastMatch.getTime()) < MIN_REMATCH_HOURS * 3600 * 1000)
    .map(([id]) => id);

  // Also count total daily matches
  const dailyTotal = await query(
    `SELECT COUNT(*) as cnt FROM pvp_match_history
     WHERE attacker_id = $1 AND created_at > NOW() - INTERVAL '24 hours'`,
    [deviceId]
  );
  const dailyCount = parseInt(dailyTotal.rows[0]?.cnt, 10) || 0;
  const dailyRemaining = Math.max(0, MAX_DAILY_MATCHES - dailyCount);

  let result;
  const excludeClause = excludeIds.length > 0
    ? `AND device_id NOT IN (${excludeIds.map((_, i) => `$${i + 3}`).join(',')})`
    : '';
  const params = [deviceId, ps, ...excludeIds];

  result = await query(
    `SELECT id, display_name, team_data, power_score, rating, wins, losses
     FROM pvp_defense_teams
     WHERE device_id != $1
     AND power_score BETWEEN $2 * 0.7 AND $2 * 1.3
     ${excludeClause}
     ORDER BY ABS(power_score - $2)
     LIMIT 5`,
    params
  );

  if (result.rows.length < 3) {
    result = await query(
      `SELECT id, display_name, team_data, power_score, rating, wins, losses
       FROM pvp_defense_teams
       WHERE device_id != $1
       ${excludeClause}
       ORDER BY ABS(power_score - $2)
       LIMIT 5`,
      params
    );
  }

  // SECURITY: return SQL id as opponentId, NEVER expose device_id
  const opponents = result.rows.map(r => ({
    opponentId: r.id,
    displayName: r.display_name,
    teamData: r.team_data,
    powerScore: r.power_score,
    rating: r.rating,
    wins: r.wins,
    losses: r.losses,
    foughtToday: matchMap[r.device_id]?.count || 0,
  }));

  return res.status(200).json({ success: true, opponents, dailyRemaining });
}

async function handleReportResult(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Require auth
  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { defenderId, attackerWon, attackerAliveCount, duration } = req.body;

  if (!defenderId || attackerWon === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const deviceId = user.deviceId;

  // Look up defender by SQL id (not device_id)
  const defLookup = await query(
    'SELECT device_id, rating FROM pvp_defense_teams WHERE id = $1',
    [parseInt(defenderId, 10)]
  );
  if (defLookup.rows.length === 0) {
    return res.status(404).json({ error: 'Defender not found' });
  }
  const defDeviceId = defLookup.rows[0].device_id;
  const defRating = defLookup.rows[0].rating;

  // ─── Anti-abuse checks ─────────────────────────────────
  // Check daily match limit
  const dailyTotal = await query(
    `SELECT COUNT(*) as cnt FROM pvp_match_history
     WHERE attacker_id = $1 AND created_at > NOW() - INTERVAL '24 hours'`,
    [deviceId]
  );
  if (parseInt(dailyTotal.rows[0]?.cnt, 10) >= MAX_DAILY_MATCHES) {
    return res.status(429).json({ error: 'Daily match limit reached (25/day)', limitReached: true });
  }

  // Check same opponent limit (3/day) and cooldown (1h)
  const oppHistory = await query(
    `SELECT COUNT(*) as cnt, MAX(created_at) as last_match
     FROM pvp_match_history
     WHERE attacker_id = $1 AND defender_id = $2 AND created_at > NOW() - INTERVAL '24 hours'`,
    [deviceId, defDeviceId]
  );
  const oppCount = parseInt(oppHistory.rows[0]?.cnt, 10) || 0;
  if (oppCount >= MAX_SAME_OPP_PER_DAY) {
    return res.status(429).json({ error: 'Max 3 fights per opponent per day', limitReached: true });
  }
  const lastMatch = oppHistory.rows[0]?.last_match ? new Date(oppHistory.rows[0].last_match) : null;
  if (lastMatch && (Date.now() - lastMatch.getTime()) < MIN_REMATCH_HOURS * 3600 * 1000) {
    return res.status(429).json({ error: '1h cooldown between rematches', limitReached: true });
  }

  // Get attacker rating
  const atkResult = await query(
    'SELECT rating FROM pvp_defense_teams WHERE device_id = $1',
    [deviceId]
  );

  const atkRating = atkResult.rows[0]?.rating || 1000;

  // Elo cap: if difference > 400, no rating change
  const eloDiff = Math.abs(atkRating - defRating);
  let change = 0;
  let capped = false;
  if (eloDiff > MAX_ELO_DIFF) {
    capped = true;
  } else {
    change = computeElo(atkRating, defRating, attackerWon);
  }

  const newAtkRating = Math.max(MIN_RATING, atkRating + change);
  const newDefRating = Math.max(MIN_RATING, defRating - change);

  if (atkResult.rows.length > 0) {
    await query(
      `UPDATE pvp_defense_teams SET rating = $2, wins = wins + $3, losses = losses + $4, updated_at = NOW()
       WHERE device_id = $1`,
      [deviceId, newAtkRating, attackerWon ? 1 : 0, attackerWon ? 0 : 1]
    );
  }

  if (defLookup.rows.length > 0) {
    await query(
      `UPDATE pvp_defense_teams SET rating = $2, wins = wins + $3, losses = losses + $4, updated_at = NOW()
       WHERE device_id = $1`,
      [defDeviceId, newDefRating, attackerWon ? 0 : 1, attackerWon ? 1 : 0]
    );
  }

  await query(
    `INSERT INTO pvp_match_history (attacker_id, defender_id, attacker_won, attacker_score, defender_score, duration)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [deviceId, defDeviceId, attackerWon, attackerAliveCount || 0, attackerWon ? 0 : 6, duration || 0]
  );

  return res.status(200).json({
    success: true,
    newRating: newAtkRating,
    ratingChange: change,
    capped,
  });
}

async function handleRankings(req, res) {
  // Require auth
  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { limit: rawLimit, offset: rawOffset } = req.query;
  const limit = Math.min(50, parseInt(rawLimit, 10) || 50);
  const offset = parseInt(rawOffset, 10) || 0;

  const result = await query(
    `SELECT id, display_name, power_score, rating, wins, losses
     FROM pvp_defense_teams
     ORDER BY rating DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  // SECURITY: return SQL id as playerId, NEVER expose device_id
  const rankings = result.rows.map((r, i) => ({
    rank: offset + i + 1,
    playerId: r.id,
    displayName: r.display_name,
    powerScore: r.power_score,
    rating: r.rating,
    wins: r.wins,
    losses: r.losses,
  }));

  // Look up the authenticated user's pvp row for "isMe" detection
  let playerRank = null;
  let myPlayerId = null;
  const myPvpRow = await query(
    'SELECT id FROM pvp_defense_teams WHERE device_id = $1',
    [user.deviceId]
  );
  if (myPvpRow.rows.length > 0) {
    myPlayerId = myPvpRow.rows[0].id;
    const rankResult = await query(
      `SELECT COUNT(*) + 1 as rank FROM pvp_defense_teams
       WHERE rating > (SELECT COALESCE(rating, 0) FROM pvp_defense_teams WHERE device_id = $1)`,
      [user.deviceId]
    );
    if (rankResult.rows[0]) {
      playerRank = parseInt(rankResult.rows[0].rank, 10);
    }
  }

  const totalResult = await query('SELECT COUNT(*) as total FROM pvp_defense_teams');
  const total = parseInt(totalResult.rows[0]?.total, 10) || 0;

  return res.status(200).json({ success: true, rankings, total, playerRank, myPlayerId });
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
    return res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}
