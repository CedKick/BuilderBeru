import { query } from './_db/neon.js';
import { extractUser } from './_utils/auth.js';

// ─── Init: create v2 table ─────────────────────────────────

async function handleInit(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  await query(`
    CREATE TABLE IF NOT EXISTS pve_rankings_v2 (
      id SERIAL PRIMARY KEY,
      device_id VARCHAR(64) NOT NULL,
      display_name VARCHAR(32) NOT NULL DEFAULT 'Joueur',
      hunter_id VARCHAR(64) NOT NULL,
      hunter_name VARCHAR(64) NOT NULL,
      hunter_element VARCHAR(16),
      power_score INTEGER NOT NULL DEFAULT 0,
      total_ilevel INTEGER NOT NULL DEFAULT 0,
      hunter_data JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(device_id, hunter_id)
    )
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_pve_v2_power ON pve_rankings_v2(power_score DESC)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_pve_v2_hunter ON pve_rankings_v2(hunter_id)`);

  return res.status(200).json({ success: true });
}

// ─── Submit: batch upsert all lv140 hunters ─────────────────

async function handleSubmit(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { displayName, hunters } = req.body;
  if (!Array.isArray(hunters) || hunters.length === 0) {
    return res.status(400).json({ error: 'No hunters provided' });
  }
  if (hunters.length > 50) {
    return res.status(400).json({ error: 'Too many hunters (max 50)' });
  }

  const name = (displayName || user.displayName || 'Joueur').slice(0, 20);
  const validIds = [];

  for (const h of hunters) {
    if (!h.hunterId || !h.hunterName || !h.powerScore || h.powerScore <= 0 || !h.hunterData) continue;

    const jsonStr = JSON.stringify(h.hunterData);
    if (Buffer.byteLength(jsonStr, 'utf8') > 200 * 1024) continue;

    await query(
      `INSERT INTO pve_rankings_v2 (device_id, display_name, hunter_id, hunter_name, hunter_element, power_score, total_ilevel, hunter_data, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       ON CONFLICT (device_id, hunter_id)
       DO UPDATE SET display_name = $2, hunter_name = $4, hunter_element = $5, power_score = $6, total_ilevel = $7, hunter_data = $8, updated_at = NOW()`,
      [user.deviceId, name, h.hunterId.slice(0, 64), h.hunterName.slice(0, 64), (h.hunterElement || '').slice(0, 16), Math.floor(h.powerScore), Math.floor(h.totalIlevel || 0), jsonStr]
    );
    validIds.push(h.hunterId);
  }

  // Remove hunters that are no longer level 140
  if (validIds.length > 0) {
    const placeholders = validIds.map((_, i) => `$${i + 2}`).join(', ');
    await query(
      `DELETE FROM pve_rankings_v2 WHERE device_id = $1 AND hunter_id NOT IN (${placeholders})`,
      [user.deviceId, ...validIds]
    );
  } else {
    // No valid hunters = remove all
    await query('DELETE FROM pve_rankings_v2 WHERE device_id = $1', [user.deviceId]);
  }

  return res.status(200).json({ success: true, count: validIds.length });
}

// ─── Rankings: top 100 with optional hunter filter ──────────

async function handleRankings(req, res) {
  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { hunterId, page } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limit = 100;
  const offset = (pageNum - 1) * limit;

  let whereClause = '';
  const params = [];
  if (hunterId) {
    whereClause = 'WHERE hunter_id = $1';
    params.push(hunterId);
  }

  // Fetch rankings
  const result = await query(
    `SELECT id, device_id, display_name, hunter_id, hunter_name, hunter_element, power_score, total_ilevel, updated_at
     FROM pve_rankings_v2
     ${whereClause}
     ORDER BY power_score DESC
     LIMIT ${limit} OFFSET ${offset}`,
    params
  );

  // Compute global rank for each row
  const globalOffset = offset;
  const rankings = result.rows.map((r, i) => ({
    rank: globalOffset + i + 1,
    entryId: r.id,
    deviceId: r.device_id,
    displayName: r.display_name,
    hunterId: r.hunter_id,
    hunterName: r.hunter_name,
    hunterElement: r.hunter_element,
    powerScore: r.power_score,
    totalIlevel: r.total_ilevel,
    updatedAt: r.updated_at,
    isMe: r.device_id === user.deviceId,
  }));

  // Total count
  const totalResult = await query(
    `SELECT COUNT(*) as total FROM pve_rankings_v2 ${whereClause}`,
    params
  );
  const total = parseInt(totalResult.rows[0]?.total, 10) || 0;

  // Player's best entries
  const myEntries = await query(
    `SELECT hunter_id, hunter_name, hunter_element, power_score FROM pve_rankings_v2 WHERE device_id = $1 ORDER BY power_score DESC`,
    [user.deviceId]
  );
  const myHunters = myEntries.rows.map(r => ({
    hunterId: r.hunter_id,
    hunterName: r.hunter_name,
    hunterElement: r.hunter_element,
    powerScore: r.power_score,
  }));

  // Player's best rank (overall or filtered)
  let myBestRank = null;
  if (myHunters.length > 0) {
    const bestScore = hunterId
      ? myHunters.find(h => h.hunterId === hunterId)?.powerScore
      : myHunters[0]?.powerScore;
    if (bestScore != null) {
      const rankQ = hunterId
        ? await query(
            `SELECT COUNT(*) + 1 as rank FROM pve_rankings_v2 WHERE hunter_id = $1 AND power_score > $2`,
            [hunterId, bestScore]
          )
        : await query(
            `SELECT COUNT(*) + 1 as rank FROM pve_rankings_v2 WHERE power_score > $1`,
            [bestScore]
          );
      myBestRank = parseInt(rankQ.rows[0]?.rank, 10) || null;
    }
  }

  return res.status(200).json({ success: true, rankings, total, myHunters, myBestRank, page: pageNum });
}

// ─── Player detail: full hunter data ────────────────────────

async function handlePlayerDetail(req, res) {
  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  const result = await query(
    `SELECT id, display_name, hunter_id, hunter_name, hunter_element, power_score, total_ilevel, hunter_data, updated_at
     FROM pve_rankings_v2 WHERE id = $1`,
    [parseInt(id, 10)]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  const r = result.rows[0];
  return res.status(200).json({
    success: true,
    entry: {
      entryId: r.id,
      displayName: r.display_name,
      hunterId: r.hunter_id,
      hunterName: r.hunter_name,
      hunterElement: r.hunter_element,
      powerScore: r.power_score,
      totalIlevel: r.total_ilevel,
      hunterData: r.hunter_data,
      updatedAt: r.updated_at,
    },
  });
}

// ─── Hunter list: distinct hunters with counts ──────────────

async function handleHunterList(req, res) {
  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const result = await query(
    `SELECT hunter_id, hunter_name, hunter_element, COUNT(*) as player_count, MAX(power_score) as top_score
     FROM pve_rankings_v2
     GROUP BY hunter_id, hunter_name, hunter_element
     ORDER BY player_count DESC, top_score DESC`
  );

  const hunters = result.rows.map(r => ({
    hunterId: r.hunter_id,
    hunterName: r.hunter_name,
    hunterElement: r.hunter_element,
    playerCount: parseInt(r.player_count, 10),
    topScore: r.top_score,
  }));

  return res.status(200).json({ success: true, hunters });
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
      case 'hunter-list':
        return await handleHunterList(req, res);
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err) {
    console.error('PVE Ranking error:', err);
    return res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}
