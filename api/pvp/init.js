import { query } from '../db/neon.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://builderberu.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
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
  } catch (err) {
    console.error('PVP init error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
