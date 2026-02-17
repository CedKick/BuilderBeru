import { query } from '../db/neon.js';

const ELO_K = 32;
const MIN_RATING = 100;

function computeElo(atkRating, defRating, attackerWon) {
  const expected = 1 / (1 + Math.pow(10, (defRating - atkRating) / 400));
  const actual = attackerWon ? 1 : 0;
  const change = Math.round(ELO_K * (actual - expected));
  return change;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://builderberu.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { deviceId, defenderId, attackerWon, attackerAliveCount, duration } = req.body;

    if (!deviceId || !defenderId || attackerWon === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!deviceId.startsWith('dev_') || deviceId.length > 50) {
      return res.status(403).json({ error: 'Invalid deviceId' });
    }

    // Get both ratings
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

    // Update attacker
    if (atkResult.rows.length > 0) {
      await query(
        `UPDATE pvp_defense_teams SET rating = $2, wins = wins + $3, losses = losses + $4, updated_at = NOW()
         WHERE device_id = $1`,
        [deviceId, newAtkRating, attackerWon ? 1 : 0, attackerWon ? 0 : 1]
      );
    }

    // Update defender
    if (defResult.rows.length > 0) {
      await query(
        `UPDATE pvp_defense_teams SET rating = $2, wins = wins + $3, losses = losses + $4, updated_at = NOW()
         WHERE device_id = $1`,
        [defenderId, newDefRating, attackerWon ? 0 : 1, attackerWon ? 1 : 0]
      );
    }

    // Record match history
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
  } catch (err) {
    console.error('PVP report error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
