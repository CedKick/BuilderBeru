// ── Player Profile & Leveling System ──
// Slow leveling, XP from PVE Multi

// XP needed per level (cumulative, slow curve)
// Level 1→2: 500 XP, Level 49→50: ~50K XP
export function xpForLevel(level) {
  if (level <= 1) return 0;
  // Polynomial curve: 500 * level^1.5
  return Math.floor(500 * Math.pow(level, 1.5));
}

export function totalXpForLevel(level) {
  let total = 0;
  for (let i = 2; i <= level; i++) {
    total += xpForLevel(i);
  }
  return total;
}

export const MAX_LEVEL = 50;

// Base stats at level 1 per class
export const BASE_STATS = {
  tank:      { hp: 25000, mana: 400, atk: 350, def: 300, spd: 160, crit: 10, res: 50, int: 20 },
  healer:    { hp: 18000, mana: 800, atk: 200, def: 120, spd: 180, crit: 12, res: 60, int: 80 },
  dps_cac:   { hp: 20000, mana: 500, atk: 800, def: 120, spd: 200, crit: 30, res: 15, int: 15 },
  dps_range: { hp: 16000, mana: 550, atk: 700, def: 100, spd: 190, crit: 25, res: 20, int: 25 },
};

// Stats growth per level
export const STAT_GROWTH = {
  tank:      { hp: 400, mana: 5, atk: 5, def: 8, spd: 0.5, crit: 0.1, res: 1, int: 0.2 },
  healer:    { hp: 250, mana: 12, atk: 2, def: 2, spd: 0.3, crit: 0.1, res: 1.5, int: 2 },
  dps_cac:   { hp: 300, mana: 6, atk: 12, def: 2, spd: 0.5, crit: 0.3, res: 0.2, int: 0.2 },
  dps_range: { hp: 200, mana: 8, atk: 10, def: 1.5, spd: 0.4, crit: 0.2, res: 0.3, int: 0.3 },
};

// Get stats at a given level
export function getStatsAtLevel(className, level) {
  const base = BASE_STATS[className];
  const growth = STAT_GROWTH[className];
  if (!base || !growth) return base || {};

  const lvl = Math.max(1, Math.min(MAX_LEVEL, level)) - 1; // 0-indexed growth
  return {
    hp: Math.floor(base.hp + growth.hp * lvl),
    mana: Math.floor(base.mana + growth.mana * lvl),
    atk: Math.floor(base.atk + growth.atk * lvl),
    def: Math.floor(base.def + growth.def * lvl),
    spd: Math.floor(base.spd + growth.spd * lvl),
    crit: Math.round((base.crit + growth.crit * lvl) * 10) / 10,
    res: Math.round((base.res + growth.res * lvl) * 10) / 10,
    int: Math.round((base.int + growth.int * lvl) * 10) / 10,
  };
}

// XP reward calculation
export function calculateXpReward({ victory, difficulty, bossHpPercent, damageDealt, healingDone, deaths, playerCount, elapsed }) {
  let baseXp = 100;

  // Difficulty multiplier
  const diffMults = { NORMAL: 1.0, HARD: 2.0, NIGHTMARE: 4.0 };
  baseXp *= diffMults[difficulty] || 1.0;

  // Victory bonus
  if (victory) {
    baseXp += 200;
    // Speed bonus: under 5 min = +50%, under 3 min = +100%
    if (elapsed < 180) baseXp *= 2.0;
    else if (elapsed < 300) baseXp *= 1.5;
  } else {
    // Partial XP: based on how far boss was taken down
    const bossProgress = Math.max(0, 100 - (bossHpPercent || 100));
    baseXp += bossProgress * 2; // 2 XP per percent done

    // On EASY (NORMAL), no reward if boss > 75% HP
    if (difficulty === 'NORMAL' && bossHpPercent > 75) {
      return 0;
    }
  }

  // Performance bonus
  if (damageDealt > 0) baseXp += Math.min(100, Math.floor(damageDealt / 10000));
  if (healingDone > 0) baseXp += Math.min(80, Math.floor(healingDone / 5000));

  // Death penalty: -10% per death
  const deathPenalty = Math.max(0.5, 1 - deaths * 0.1);
  baseXp *= deathPenalty;

  // Solo training bonus (less XP solo)
  if (playerCount <= 1) baseXp *= 0.6;

  return Math.max(10, Math.floor(baseXp));
}

// Default empty profile
export function createDefaultProfile(username) {
  return {
    username,
    level: 1,
    xp: 0,
    totalXp: 0,
    gamesPlayed: 0,
    victories: 0,
    defeats: 0,
    favoriteClass: null,
    classStats: {
      tank: { gamesPlayed: 0, wins: 0 },
      healer: { gamesPlayed: 0, wins: 0 },
      dps_cac: { gamesPlayed: 0, wins: 0 },
      dps_range: { gamesPlayed: 0, wins: 0 },
    },
    bestTime: null, // seconds for fastest clear
    createdAt: Date.now(),
  };
}
