// ── Game Server Configuration ──

export const SERVER = {
  PORT: parseInt(process.env.PORT || '3001'),
  TICK_RATE: 60,                   // Server updates per second
  BROADCAST_RATE: 20,              // State broadcasts per second
  get TICK_MS() { return 1000 / this.TICK_RATE; },
  get BROADCAST_INTERVAL() { return Math.round(this.TICK_RATE / this.BROADCAST_RATE); },
  HEARTBEAT_INTERVAL: 30000,       // 30s ping/pong
  CORS_ORIGINS: [
    'https://builderberu.com',
    'http://localhost:5173',        // Vite dev
    'http://localhost:3000',
  ],
};

export const ROOM = {
  MIN_PLAYERS: 1,                  // Dev: 1, Prod: 3
  MAX_PLAYERS: 5,
  CODE_LENGTH: 6,
  READY_COUNTDOWN: 5,              // Seconds before fight starts
};

export const ARENA = {
  WIDTH: 1600,
  HEIGHT: 1200,
  WALL_THICKNESS: 20,
};

export const PLAYER = {
  RADIUS: 20,                      // Hitbox radius
  BASE_SPEED: 145,                 // Pixels per second (slower, more tactical)
  DODGE_SPEED: 420,                // Pixels per second during dodge
  DODGE_DURATION: 0.6,             // Seconds of dodge roll
  DODGE_COOLDOWN: 3.0,             // Seconds between dodges
  DODGE_IFRAMES: 1.0,              // 1 second of invincibility during dodge
  MANA_REGEN_RATE: 1.5,            // Passive mana per second
  MANA_ON_HIT: 8,                  // Mana restored per basic attack hit
};

export const BOSS = {
  RADIUS: 75,                      // Hitbox radius (x1.5 bigger)
  ENRAGE_TIMER: 900,               // 15 minutes in seconds
  ENRAGE_HP_PERCENT: 5,            // Permanent enrage below 5%
  ENRAGE_SPEED_MULT: 2.0,
  ENRAGE_DMG_MULT: 2.0,
  // Boss HP scales with player count: index = playerCount
  PLAYER_SCALE: [0, 0.12, 0.28, 0.65, 0.85, 1.0],
  SOLO_MECHANIC_MULT: 0.4,         // Mechanics do 40% in solo (no oneshot)
};

export const AGGRO = {
  TANK_MULTIPLIER: 3.0,            // Tank generates 3x aggro
  DAMAGE_TO_AGGRO: 1.0,            // 1 damage = 1 aggro
  HEAL_TO_AGGRO: 0.5,              // 1 heal = 0.5 aggro
  BLOCK_AGGRO_PER_SEC: 50,         // Aggro per second while blocking
  TAUNT_AGGRO: 5000,               // Flat aggro from taunt skill
  DECAY_RATE: 0,                   // No aggro decay (like Tera)
};

export const COMBAT = {
  DEF_FORMULA_CONSTANT: 100,       // 100 / (100 + DEF)
  CRIT_MULTIPLIER: 1.5,
  CRIT_RES_FACTOR: 0.5,            // crit - (res * 0.5)
  VARIANCE_MIN: 0.95,
  VARIANCE_MAX: 1.05,
  POISON_TICK_INTERVAL: 2.0,       // Seconds between poison ticks
  POISON_BASE_DAMAGE: 15,          // Base damage per stack per tick
  POISON_DURATION: 20,             // Seconds
};

export const HUNTER = {
  SUMMON_RANGE: 600,             // Max distance to hit boss with summon
  SUMMON_COOLDOWN: 30,           // Fixed 30s cooldown for all hunter summons
};

export const ADDS = {
  MAX_ADDS: 8,                       // Max adds alive at once
  SPAWN_OFFSET: 200,                 // Distance from boss to spawn adds
};

export const DIFFICULTY = {
  NORMAL:         { hpMult: 1.0,  dmgMult: 1.0,  spdMult: 1.0,  label: 'Normal' },
  HARD:           { hpMult: 2.0,  dmgMult: 1.5,  spdMult: 1.2,  label: 'Difficile' },
  NIGHTMARE:      { hpMult: 3.5,  dmgMult: 2.5,  spdMult: 1.5,  label: 'Cauchemar' },
  NIGHTMARE_PLUS: { hpMult: 5.0,  dmgMult: 3.5,  spdMult: 1.7,  label: 'Cauchemar+' },
  NIGHTMARE_2:    { hpMult: 8.0,  dmgMult: 5.0,  spdMult: 2.0,  label: 'Cauchemar++' },
  NIGHTMARE_3:    { hpMult: 12.0, dmgMult: 7.0,  spdMult: 2.3,  label: 'Cauchemar+++' },
};
