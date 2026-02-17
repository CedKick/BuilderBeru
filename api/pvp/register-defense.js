import { query } from '../db/neon.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://builderberu.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { deviceId, displayName, teamData, powerScore } = req.body;

    if (!deviceId || !teamData || !powerScore) {
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
  } catch (err) {
    console.error('PVP register error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
