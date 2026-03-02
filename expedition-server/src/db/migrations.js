import { query } from './pool.js';

const TABLES = [
  // Expedition instances
  `CREATE TABLE IF NOT EXISTS expeditions (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL DEFAULT 'Expedition I',
    status          VARCHAR(20) NOT NULL DEFAULT 'registration',
    started_at      TIMESTAMPTZ,
    ended_at        TIMESTAMPTZ,
    scheduled_at    TIMESTAMPTZ NOT NULL,
    max_boss_reached INTEGER DEFAULT 0,
    current_wave    INTEGER DEFAULT 0,
    total_deaths    INTEGER DEFAULT 0,
    state_snapshot  JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Player registration
  `CREATE TABLE IF NOT EXISTS expedition_entries (
    id              SERIAL PRIMARY KEY,
    expedition_id   INTEGER REFERENCES expeditions(id) ON DELETE CASCADE,
    user_id         INTEGER,
    username        VARCHAR(20) NOT NULL,
    device_id       VARCHAR(64),
    character_ids   JSONB NOT NULL,
    character_data  JSONB NOT NULL,
    sr_item_id      VARCHAR(50),
    joined_at       TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(expedition_id, username)
  )`,

  // Character state (persistent across fights)
  `CREATE TABLE IF NOT EXISTS expedition_character_state (
    id              SERIAL PRIMARY KEY,
    expedition_id   INTEGER REFERENCES expeditions(id) ON DELETE CASCADE,
    username        VARCHAR(20) NOT NULL,
    hunter_id       VARCHAR(30) NOT NULL,
    hp              INTEGER NOT NULL,
    max_hp          INTEGER NOT NULL,
    mana            INTEGER NOT NULL,
    max_mana        INTEGER NOT NULL,
    alive           BOOLEAN DEFAULT TRUE,
    damage_dealt    BIGINT DEFAULT 0,
    healing_done    BIGINT DEFAULT 0,
    kills           INTEGER DEFAULT 0,
    deaths          INTEGER DEFAULT 0,
    UNIQUE(expedition_id, username, hunter_id)
  )`,

  // Loot drops
  `CREATE TABLE IF NOT EXISTS expedition_loot (
    id              SERIAL PRIMARY KEY,
    expedition_id   INTEGER REFERENCES expeditions(id) ON DELETE CASCADE,
    encounter_index INTEGER NOT NULL,
    item_id         VARCHAR(50) NOT NULL,
    item_name       VARCHAR(100),
    rarity          VARCHAR(20),
    binding         VARCHAR(10),
    winner_username VARCHAR(20),
    winner_roll     INTEGER,
    stolen          BOOLEAN DEFAULT FALSE,
    sr_winner       BOOLEAN DEFAULT FALSE,
    rolled_at       TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Roll details (for the roll animation)
  `CREATE TABLE IF NOT EXISTS expedition_loot_rolls (
    id              SERIAL PRIMARY KEY,
    loot_id         INTEGER REFERENCES expedition_loot(id) ON DELETE CASCADE,
    username        VARCHAR(20) NOT NULL,
    roll_value      INTEGER NOT NULL,
    had_sr          BOOLEAN DEFAULT FALSE
  )`,

  // Item definitions
  `CREATE TABLE IF NOT EXISTS expedition_items (
    id              VARCHAR(50) PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    type            VARCHAR(30) NOT NULL,
    slot            VARCHAR(20),
    rarity          VARCHAR(20) NOT NULL,
    binding         VARCHAR(10) NOT NULL DEFAULT 'tradeable',
    stats           JSONB,
    set_id          VARCHAR(50),
    description     TEXT,
    sprite_url      VARCHAR(256)
  )`,

  // Set definitions
  `CREATE TABLE IF NOT EXISTS expedition_sets (
    id              VARCHAR(50) PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    bonus_2pc       JSONB,
    bonus_4pc       JSONB
  )`,

  // Indexes
  `CREATE INDEX IF NOT EXISTS idx_exp_entries_expedition ON expedition_entries(expedition_id)`,
  `CREATE INDEX IF NOT EXISTS idx_exp_entries_username ON expedition_entries(username)`,
  `CREATE INDEX IF NOT EXISTS idx_exp_charstate_expedition ON expedition_character_state(expedition_id)`,
  `CREATE INDEX IF NOT EXISTS idx_exp_loot_expedition ON expedition_loot(expedition_id)`,
  `CREATE INDEX IF NOT EXISTS idx_expeditions_status ON expeditions(status)`,
];

export async function runMigrations() {
  console.log('[DB] Running migrations...');
  for (const sql of TABLES) {
    try {
      await query(sql);
    } catch (err) {
      console.error('[DB] Migration error:', err.message);
      throw err;
    }
  }
  console.log(`[DB] Migrations complete (${TABLES.length} statements)`);
}

// Run directly if called as script
if (process.argv[1] && process.argv[1].includes('migrations')) {
  runMigrations()
    .then(() => { console.log('[DB] Done.'); process.exit(0); })
    .catch(err => { console.error('[DB] Failed:', err); process.exit(1); });
}
