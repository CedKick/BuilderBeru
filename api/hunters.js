// api/hunters.js — Public read-only endpoint for hunter data
// No auth required — returns all active hunters from DB.
// Used by client-side raidData.js to sync HUNTERS with DB edits.

import { query } from './_db/neon.js';

const TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS hunters_data (
    id SERIAL PRIMARY KEY,
    hunter_id VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(40) NOT NULL,
    element VARCHAR(16) NOT NULL,
    class VARCHAR(16) NOT NULL,
    rarity VARCHAR(16) NOT NULL DEFAULT 'legendaire',
    series VARCHAR(32),
    base_stats JSONB NOT NULL,
    growth_stats JSONB NOT NULL,
    skills JSONB NOT NULL DEFAULT '[]',
    passive_type VARCHAR(32),
    passive_params JSONB DEFAULT '{}',
    passive_desc TEXT,
    awakening_passives JSONB DEFAULT '{}',
    sprite_url TEXT,
    special BOOLEAN DEFAULT FALSE,
    status VARCHAR(16) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )
`;

let tableChecked = false;
async function ensureTable() {
  if (tableChecked) return;
  await query(TABLE_SQL);
  tableChecked = true;
}

export default async function handler(req, res) {
  try {
    await ensureTable();

    const { rows } = await query(
      `SELECT hunter_id, name, element, class, rarity, series,
              base_stats, growth_stats, skills,
              passive_type, passive_params, passive_desc,
              awakening_passives, sprite_url, special
       FROM hunters_data WHERE status = 'active'
       ORDER BY rarity DESC, name ASC`
    );

    return res.json({ success: true, hunters: rows, count: rows.length });
  } catch (err) {
    console.error('[hunters] Error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
