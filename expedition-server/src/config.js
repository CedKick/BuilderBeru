// ─── Server ───────────────────────────────────────────────
export const SERVER = {
  PORT: parseInt(process.env.PORT) || 3004,
  TICK_RATE: 4,           // 4 TPS (250ms per tick)
  TICK_MS: 250,
  BROADCAST_RATE: 2,      // Spectator updates 2x/sec (every 2 ticks)
  WS_PATH: '/ws',
  CORS_ORIGINS: [
    'https://builderberu.com',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
};

// ─── Expedition Rules ─────────────────────────────────────
export const EXPEDITION = {
  MAX_PLAYERS: 30,
  HUNTERS_PER_PLAYER: 3,
  MAX_DURATION_HOURS: 24,
  LAUNCH_HOUR: 19,              // 19h daily
  REGISTRATION_OPEN_HOURS: 12,  // Opens 12h before launch
  MIN_PLAYERS_TO_START: 1,      // Dev=1, Prod=5
  TOTAL_BOSSES: 15,             // Phase 1: only 3 implemented
  STATE_SAVE_INTERVAL_SEC: 60,  // Snapshot to DB every 60s
};

// ─── 2D Combat ────────────────────────────────────────────
export const COMBAT = {
  WORLD_WIDTH: 3200,
  GROUND_Y: 500,

  // Damage formula (identical to Manaya raid)
  DEF_CONSTANT: 100,        // dmgMult = 100 / (100 + DEF)
  CRIT_MULTIPLIER: 1.5,
  VARIANCE_MIN: 0.95,
  VARIANCE_MAX: 1.05,

  // Ranges (pixels)
  MELEE_RANGE: 80,
  RANGED_RANGE: 400,
  HEALER_RANGE: 500,

  // Formation
  FORMATION_SPACING: 30,
  FRONTLINE_BASE_X: 600,    // Where frontliners start
  BACKLINE_OFFSET: -300,    // Backline is 300px behind frontline

  // Vertical lanes (Y) — visual depth separation by role
  LANE_Y: {
    frontline:      0,      // Tanks at center ground
    frontline_dps: -20,     // Fighters slightly above
    backline_dps:  -50,     // Mages further up
    backline_heal: -70,     // Healers at the very back
  },
  LANE_Y_JITTER: 15,        // +/- random Y per character within lane

  // Auto-attack intervals (seconds)
  MELEE_ATTACK_INTERVAL: 1.0,
  RANGED_ATTACK_INTERVAL: 1.5,
  HEAL_INTERVAL: 2.0,

  // Boss
  BOSS_AUTO_ATTACK_INTERVAL: 2.0,
  BOSS_PATTERN_COOLDOWN: 4.0,
  BOSS_TELEGRAPH_DEFAULT: 2.0,

  // Mob
  MOB_ATTACK_INTERVAL: 2.5,
  MOB_MOVE_SPEED: 60,       // px/sec
};

// ─── Campfire ─────────────────────────────────────────────
export const CAMPFIRE = {
  DURATION_SEC: 45,
  HP_REGEN_PERCENT: 20,
  MANA_REGEN_PERCENT: 50,
  HEALER_REZ_PER_COMBAT: 1,
  REZ_HP_PERCENT: 30,
};

// ─── March ────────────────────────────────────────────────
export const MARCH = {
  DURATION_SEC: 15,
  SCROLL_SPEED: 80,          // px/sec
};

// ─── Loot ─────────────────────────────────────────────────
export const LOOT = {
  WIPE_STEAL_CHANCE_MIN: 0.10,
  WIPE_STEAL_CHANCE_MAX: 0.40,
  ROLL_MAX: 100,
};

// ─── Stat Scaling: hunter base stats → expedition stats ───
export const STAT_SCALE = {
  hp: 8,
  atk: 1.5,
  def: 2.0,
  spd: 1.0,
  crit: 1.0,
  res: 1.0,
};

// ─── Role mapping: hunter class → AI role ─────────────────
export const ROLE_MAP = {
  tank:     'frontline',
  fighter:  'frontline_dps',
  assassin: 'frontline_dps',
  mage:     'backline_dps',
  support:  'backline_heal',
};

// ─── Admin Gate (temporary: restrict access during testing) ──
export const ADMIN = {
  ENABLED: true,               // Set to false to open to all
  ALLOWED_USERS: ['kly'],      // Usernames allowed during admin gate
  SECRET_KEY: 'kly',           // URL param ?key=kly to access spectator/API
};

// ─── Rarity colors (for display) ─────────────────────────
export const RARITY = {
  common:    { color: '#9ca3af', label: 'Commun' },
  uncommon:  { color: '#22c55e', label: 'Peu commun' },
  rare:      { color: '#3b82f6', label: 'Rare' },
  epic:      { color: '#a855f7', label: 'Epique' },
  legendary: { color: '#eab308', label: 'Legendaire' },
};
