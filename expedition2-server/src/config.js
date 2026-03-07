// ── Expedition II: Ragnaros — Configuration ──

export const SERVER = {
  PORT: parseInt(process.env.PORT || '3007', 10),
  WS_PATH: '/ws',
  CORS_ORIGINS: [
    'http://localhost:5173',
    'http://localhost:3007',
    'https://builderberu.com',
    'https://www.builderberu.com',
  ],
};

// ── Game Constants ──
export const GAME = {
  TICK_RATE: 20,          // 20 TPS (50ms per tick)
  TICK_MS: 50,

  // Arena dimensions (logical units)
  ARENA_WIDTH: 2000,
  ARENA_HEIGHT: 2000,

  // Platform (walkable area) — large circular stone ring around central lava
  PLATFORM: {
    cx: 1000,
    cy: 1000,
    radiusX: 850,
    radiusY: 850,
  },

  // Ragnaros position — CENTER of arena in lava pool
  BOSS_SPAWN: { x: 1000, y: 1000 },

  // Player spawn zone (bottom of platform ring)
  PLAYER_SPAWN: { x: 1000, y: 1550 },

  // Movement
  PLAYER_SPEED: 220,
  PLAYER_RADIUS: 16,

  // Lava
  LAVA_DAMAGE: 150,
  LAVA_TICK_MS: 500,

  // Knockback
  KNOCKBACK_SPEED: 400,
  KNOCKBACK_DURATION: 300,

  // Boss — large and stationary
  BOSS_RADIUS: 100,
};

// ── Room / Lobby ──
export const ROOM = {
  MAX_PLAYERS: 6,
  MIN_PLAYERS: 1,      // 1 player (+ bots) can start
  CODE_LENGTH: 4,
  READY_COUNTDOWN: 5,  // seconds
};

// ── Walls / Pillars (collision rectangles) ──
export const WALLS = [
  // Pillars around the arena (for cover during wrath_of_ragnaros)
  { x: 400, y: 500, w: 50, h: 80, type: 'pillar' },
  { x: 1550, y: 500, w: 50, h: 80, type: 'pillar' },
  { x: 400, y: 1420, w: 50, h: 80, type: 'pillar' },
  { x: 1550, y: 1420, w: 50, h: 80, type: 'pillar' },
  // Side rocks
  { x: 250, y: 950, w: 50, h: 50, type: 'rock' },
  { x: 1700, y: 950, w: 50, h: 50, type: 'rock' },
];
