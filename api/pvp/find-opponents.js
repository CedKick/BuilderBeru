import { query } from '../db/neon.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://builderberu.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { deviceId, powerScore } = req.query;

    if (!deviceId || !powerScore) {
      return res.status(400).json({ error: 'Missing deviceId or powerScore' });
    }
    if (!deviceId.startsWith('dev_') || deviceId.length > 50) {
      return res.status(403).json({ error: 'Invalid deviceId' });
    }

    const ps = parseInt(powerScore, 10) || 0;

    // Try to find 5 opponents close to the player's power score
    let result = await query(
      `SELECT device_id, display_name, team_data, power_score, rating, wins, losses
       FROM pvp_defense_teams
       WHERE device_id != $1
       AND power_score BETWEEN $2 * 0.7 AND $2 * 1.3
       ORDER BY ABS(power_score - $2)
       LIMIT 5`,
      [deviceId, ps]
    );

    // If not enough, broaden the search
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
  } catch (err) {
    console.error('PVP find error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
