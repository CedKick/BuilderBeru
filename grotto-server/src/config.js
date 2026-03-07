// ─── Server ───────────────────────────────────────────────
export const SERVER = {
  PORT: parseInt(process.env.PORT) || 3006,
  TICK_RATE: 15,            // 15 TPS (~66ms per tick) — smooth real-time
  TICK_MS: 66,
  BROADCAST_RATE: 10,       // Send state to clients 10x/sec
  WS_PATH: '/ws',
  CORS_ORIGINS: [
    'https://builderberu.com',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
};

// ─── Map ──────────────────────────────────────────────────
export const MAP = {
  TILE_SIZE: 32,            // px per tile
  WIDTH: 200,               // tiles (200×32 = 6400px)
  HEIGHT: 150,              // tiles (150×32 = 4800px)
  // Cellular automata cave generation
  CAVE_FILL_CHANCE: 0.40,   // Initial wall fill probability (was 0.46 — more open)
  CAVE_ITERATIONS: 4,       // Smoothing passes (was 5)
  CAVE_BIRTH_LIMIT: 5,      // Become wall if >= N wall neighbors (was 4 — harder to become wall)
  CAVE_DEATH_LIMIT: 3,      // Stay wall if >= N wall neighbors
};

// ─── Instances ────────────────────────────────────────────
export const INSTANCE = {
  MAX_PLAYERS: 10,          // Max players per instance
  MAX_INSTANCES: 5,         // Hard cap on instances
};

// ─── Zones (level ranges within the grotto) ───────────────
export const ZONES = [
  { id: 'entrance',   name: 'Entree de la Grotte',  minLevel: 1,  maxLevel: 3,  color: '#4a6741' },
  { id: 'upper',      name: 'Cavernes Superieures',  minLevel: 4,  maxLevel: 8,  color: '#5a5a6a' },
  { id: 'deep',       name: 'Profondeurs Obscures',  minLevel: 9,  maxLevel: 14, color: '#3a2a4a' },
  { id: 'abyss',      name: 'Les Abysses',           minLevel: 15, maxLevel: 20, color: '#2a1020' },
];

// ─── Combat ───────────────────────────────────────────────
export const COMBAT = {
  // Damage formula: dmg = ATK * power/100 * 100/(100+DEF) * variance
  DEF_CONSTANT: 100,
  CRIT_MULTIPLIER: 1.5,
  VARIANCE_MIN: 0.95,
  VARIANCE_MAX: 1.05,

  // Ranges (pixels)
  MELEE_RANGE: 48,          // ~1.5 tiles
  RANGED_RANGE: 192,        // 6 tiles
  AGGRO_RANGE: 192,         // 6 tiles — mob starts chasing player
  DEAGGRO_RANGE: 512,       // 16 tiles — mob gives up chase (was 10, too short)
  LEASH_RANGE: 640,         // 20 tiles — mob resets to spawn (was 15)

  // Auto-attack intervals (seconds)
  PLAYER_ATTACK_INTERVAL: 0.8,
  MOB_ATTACK_INTERVAL: 1.5,

  // Movement speeds (pixels/sec)
  PLAYER_SPEED: 160,        // ~5 tiles/sec
  MOB_SPEED: 100,           // ~3 tiles/sec
  MOB_SPEED_FAST: 140,      // Fast mobs
};

// ─── XP & Leveling ───────────────────────────────────────
export const XP = {
  // XP needed for level N: BASE * N^EXPONENT
  BASE: 100,
  EXPONENT: 1.8,
  // XP from killing a mob: mobLevel * KILL_MULT (scaled by level diff)
  KILL_MULT: 25,
  // XP penalty on death: lose DEATH_PENALTY% of current level XP
  DEATH_PENALTY: 0.10,      // 10% of XP needed for current level
  // Level diff scaling: mobs too low give less XP
  MIN_XP_RATIO: 0.1,        // Min 10% XP if mob is way below player
  LEVEL_DIFF_SCALE: 5,      // XP halves every N levels below player
};

// ─── Mob Spawning ─────────────────────────────────────────
export const SPAWN = {
  MOBS_PER_ZONE: 40,        // Target mob count per zone
  RESPAWN_TIME: 300,         // 5 minutes before mob respawns
  SPAWN_RADIUS: 96,         // Min distance from players for spawn (3 tiles)
};
