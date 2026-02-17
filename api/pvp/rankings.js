import { query } from '../db/neon.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://builderberu.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
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

    // Get player's own rank if deviceId provided
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
  } catch (err) {
    console.error('PVP rankings error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
