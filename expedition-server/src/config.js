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
  MAX_CHARACTERS: 30,       // Total hunters across all players (e.g. 5 players × 6 = 30)
  HUNTERS_PER_PLAYER: 6,
  MAX_DURATION_HOURS: 12,       // 19h -> 7h next day = 12h max
  LAUNCH_HOUR: 19,              // 19h Paris daily
  END_HOUR: 7,                  // 7h next day (hard stop after 12h)
  END_MINUTE: 0,
  REGISTRATION_OPEN_HOUR: 12,   // Opens at 12h05 (after end + cleanup)
  REGISTRATION_OPEN_MINUTE: 5,
  MIN_PLAYERS_TO_START: 1,      // Dev=1, Prod=3
  TOTAL_BOSSES: 15,             // V2: 15 bosses across 3 zones
  STATE_SAVE_INTERVAL_SEC: 60,  // Snapshot to DB every 60s
  TIMEZONE: 'Europe/Paris',
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

  // Formation (legacy linear — kept as fallback)
  FORMATION_SPACING: 55,
  FRONTLINE_BASE_X: 600,    // Where frontliners start (fallback if no boss)
  BACKLINE_OFFSET: -300,    // Backline is 300px behind frontline

  // Arc formation around boss
  ARC_CENTER_OFFSET: 250,   // Arc pivot = boss.x - this
  ARC_INNER_RADIUS: 100,    // Tanks (closest ring to boss)
  ARC_MIDDLE_RADIUS: 180,   // Fighters/Assassins
  ARC_OUTER_DPS_RADIUS: 260,// Mages
  ARC_OUTER_HEAL_RADIUS: 340,// Healers (furthest ring)
  ARC_SPREAD_ANGLE: 120,    // Total arc degrees (60° each side)

  // Vertical lanes (Y) — visual depth separation by role
  // Positive Y = closer to camera (lower on screen), Negative = further back (higher)
  LANE_Y: {
    frontline:      40,     // Tanks at front (closest to camera, lower on screen)
    frontline_dps:  15,     // Fighters/Assassins right behind tanks
    backline_dps:  -30,     // Mages in the back
    backline_heal: -65,     // Healers at the very back (highest on screen)
  },
  LANE_Y_JITTER: 20,        // +/- random Y per character within lane

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
  HP_REGEN_PERCENT: 30,       // 20 -> 30% HP regen at campfire
  MANA_REGEN_PERCENT: 80,     // 50 -> 80% mana regen at campfire
  HEALER_REZ_PER_COMBAT: 1,
  REZ_HP_PERCENT: 30,
};

// ─── Rest at Camp (anti-wipe reserve) ─────────────────────
export const REST_CAMP = {
  // Chance for a char to decide to rest (checked at campfire, per char)
  BASE_REST_CHANCE: 0.03,       // 3% base chance
  LOW_HP_REST_CHANCE: 0.15,     // 15% if HP < 30%
  DIED_RECENTLY_REST_CHANCE: 0.12, // 12% if died this combat
  MAX_RESTING_RATIO: 0.2,      // Max 20% of alive chars can rest at once
  // Stat bonuses while resting (applied when they rejoin after wipe recovery)
  REST_BONUS_HP: 0.15,         // +15% max HP
  REST_BONUS_ATK: 0.10,        // +10% ATK
  REST_BONUS_DEF: 0.15,        // +15% DEF
  // Wipe recovery: resting chars with healer can save the raid
  WIPE_RECOVERY_REZ_HP: 0.40,  // Rezzed chars get 40% HP
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
  SR_PICKS_MAX: 5,  // Each player can SR up to 5 items (can repeat for extra rolls)
  INVENTORY_MAX: 200,  // Max items in expeditionInventory per player
  EQUIP_TYPES: ['armor', 'weapon', 'set_piece'],  // Types considered "artifacts" (have stats, can auto-replace)
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
  ENABLED: false,              // Open to all (prod)
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
