// ─── Expedition v2 Configuration ──────────────────────────
// Real-time 2D combat (Manaya engine) + expedition phase system

// ─── Server ───────────────────────────────────────────────
export const SERVER = {
  PORT: parseInt(process.env.PORT) || 3004,
  TICK_RATE: 60,              // 60 TPS real-time combat (same as Manaya)
  get TICK_MS() { return 1000 / this.TICK_RATE; },
  BROADCAST_RATE: 20,         // Client state updates per second
  get BROADCAST_INTERVAL() { return Math.round(this.TICK_RATE / this.BROADCAST_RATE); },
  SPECTATOR_RATE: 10,         // Spectator updates per second (lower bandwidth)
  HEARTBEAT_INTERVAL: 30000,  // 30s ping/pong
  WS_PATH: '/ws',
  CORS_ORIGINS: [
    'https://builderberu.com',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
};

// ─── Expedition Rules ─────────────────────────────────────
export const EXPEDITION = {
  MAX_PLAYERS: 5,               // 5 players per expedition
  HUNTERS_PER_PLAYER: 6,        // Each player controls 6 hunters
  MAX_HUNTERS: 30,              // 5 × 6 = 30 hunters total on field
  TOTAL_BOSSES: 5,              // 5 bosses in sequence
  MIN_PLAYERS_TO_START: 1,      // Dev=1, Prod=3
  STATE_SAVE_INTERVAL_SEC: 60,  // Snapshot to DB every 60s
  TIMEZONE: 'Europe/Paris',
  // Registration/launch schedule
  REGISTRATION_OPEN_HOUR: 12,
  REGISTRATION_OPEN_MINUTE: 0,
  LAUNCH_HOUR: 19,
  LAUNCH_MINUTE: 0,
  END_HOUR: 7,
  END_MINUTE: 0,
  MAX_DURATION_HOURS: 12,
};

// ─── Arena (per-encounter combat area) ───────────────────
export const ARENA = {
  WIDTH: 1600,
  HEIGHT: 1200,
  WALL_THICKNESS: 20,
};

// ─── Player/Hunter Physics ───────────────────────────────
export const PLAYER = {
  RADIUS: 22,
  BASE_SPEED: 145,              // px/s — same as Manaya game-server
  DODGE_SPEED: 420,             // px/s during dodge — same as Manaya
  DODGE_DURATION: 0.6,          // seconds
  DODGE_COOLDOWN: 6.0,          // seconds
  DODGE_IFRAMES: 1.0,           // 1s invincibility
  MANA_REGEN_RATE: 1.5,         // passive mana/s
  MANA_ON_HIT: 8,               // mana per basic attack hit
};

// ─── Boss Config ─────────────────────────────────────────
export const BOSS = {
  RADIUS: 75,
  ENRAGE_TIMER: 600,            // 10 min per boss (shorter than Manaya's 15)
  ENRAGE_HP_PERCENT: 5,         // Permanent enrage below 5%
  ENRAGE_SPEED_MULT: 2.0,
  ENRAGE_DMG_MULT: 2.0,
  // Boss HP scales with active hunter count
  // 30 hunters = 100%, fewer = proportionally less
  HUNTER_SCALE_BASE: 30,
};

// ─── Aggro ───────────────────────────────────────────────
export const AGGRO = {
  TANK_MULTIPLIER: 3.0,
  DAMAGE_TO_AGGRO: 1.0,
  HEAL_TO_AGGRO: 0.5,
  BLOCK_AGGRO_PER_SEC: 50,
  TAUNT_AGGRO: 5000,
  DECAY_RATE: 0,
};

// ─── Combat ──────────────────────────────────────────────
export const COMBAT = {
  DEF_FORMULA_CONSTANT: 100,    // dmg × (100 / (100 + DEF))
  CRIT_MULTIPLIER: 1.5,
  CRIT_RES_FACTOR: 0.5,         // crit% - (res × 0.5)
  VARIANCE_MIN: 0.95,
  VARIANCE_MAX: 1.05,
  POISON_TICK_INTERVAL: 2.0,
  POISON_BASE_DAMAGE: 15,
  POISON_DURATION: 20,
};

// ─── Hunter Summon (unused in expedition — hunters fight directly) ──
export const HUNTER = {
  SUMMON_RANGE: 600,
  SUMMON_COOLDOWN: 30,
};

// ─── Adds/Mobs ──────────────────────────────────────────
export const ADDS = {
  MAX_ADDS: 12,                 // More adds than Manaya (30 hunters can handle it)
  SPAWN_OFFSET: 200,
};

// ─── Campfire ────────────────────────────────────────────
export const CAMPFIRE = {
  DURATION_SEC: 30,             // 30s rest between bosses
  HP_REGEN_PERCENT: 50,         // 50% HP regen (generous — we want them to survive)
  MANA_REGEN_PERCENT: 100,      // Full mana reset
  REZ_HP_PERCENT: 50,           // Resurrected hunters come back at 50% HP
};

// ─── March ───────────────────────────────────────────────
export const MARCH = {
  DURATION_SEC: 10,             // 10s march between encounters
  SCROLL_SPEED: 100,            // px/sec rightward movement
};

// ─── Loot ────────────────────────────────────────────────
export const LOOT = {
  QUANTITY_MULTIPLIER: 5,
  WIPE_STEAL_CHANCE_MIN: 0.10,
  WIPE_STEAL_CHANCE_MAX: 0.40,
  ROLL_MAX: 100,
  SR_PICKS_MAX: 5,
  INVENTORY_MAX: 1500,
  EQUIP_TYPES: ['armor', 'weapon', 'set_piece'],
};

// ─── Stat Scaling: inscription stats → combat stats ──────
// Player inscription data has real stats (ATK 10000+, HP 20000+)
// These are already expedition-scaled — we use them as-is
// Boss HP/ATK must match this power level
export const STAT_SCALE = {
  hp: 1.0,     // Use inscription HP directly
  atk: 1.0,    // Use inscription ATK directly
  def: 1.0,
  spd: 1.0,
  crit: 1.0,
  res: 1.0,
};

// ─── Dynamic Difficulty Scaling (based on active hunters) ─
export const SCALING = {
  BASE_HUNTERS: 30,
  HP_FACTOR: 1.0,
  ATK_FACTOR: 0.3,
  DEF_FACTOR: 0.15,
  SPD_FACTOR: 0,
  LOOT_EXTRA_ROLLS_PER: 10,
  MOB_HP_FACTOR: 0.6,
};

// ─── Role mapping: hunter class → combat role ────────────
export const ROLE_MAP = {
  tank:     'frontline',
  fighter:  'frontline_dps',
  assassin: 'frontline_dps',
  mage:     'backline_dps',
  support:  'backline_heal',
};

// ─── Hunter class → Manaya combat class ──────────────────
// Maps expedition hunter classes to the 6 Manaya playable classes
// This determines which skills/combos they use in real-time combat
export const CLASS_MAP = {
  tank:     'tank',
  fighter:  'berserker',    // Fighters → berserker (melee DPS, charged attacks)
  assassin: 'dps_cac',      // Assassins → warrior (combo melee, rage)
  mage:     'mage',          // Mages → mage (ranged, projectiles, Zollstraak)
  support:  'healer',        // Supports → healer (heal zone, cleanse, rez)
};

// ─── Admin Gate ──────────────────────────────────────────
export const ADMIN = {
  ENABLED: false,
  ALLOWED_USERS: ['kly'],
  SECRET_KEY: 'kly',
};

// ─── Rarity colors ──────────────────────────────────────
export const RARITY = {
  common:    { color: '#9ca3af', label: 'Commun' },
  uncommon:  { color: '#22c55e', label: 'Peu commun' },
  rare:      { color: '#3b82f6', label: 'Rare' },
  epic:      { color: '#a855f7', label: 'Epique' },
  legendary: { color: '#eab308', label: 'Legendaire' },
  mythique:  { color: '#ef4444', label: 'Mythique' },
};
