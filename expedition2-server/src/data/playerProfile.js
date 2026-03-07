// ── Player Profile & Leveling System (Ragnaros) ──
// XP from Ragnaros raids, 6 classes, slow curve

export function xpForLevel(level) {
  if (level <= 1) return 0;
  return Math.floor(500 * Math.pow(level, 1.5));
}

export function totalXpForLevel(level) {
  let total = 0;
  for (let i = 2; i <= level; i++) total += xpForLevel(i);
  return total;
}

export const MAX_LEVEL = 50;

// Base stats at level 1 per class (raid-scaled)
export const BASE_STATS = {
  tank:      { hp: 28000, mana: 400, atk: 300, def: 320, spd: 150, crit: 8,  res: 55 },
  healer:    { hp: 18000, mana: 800, atk: 180, def: 120, spd: 170, crit: 10, res: 60 },
  warrior:   { hp: 22000, mana: 100, atk: 800, def: 160, spd: 195, crit: 28, res: 20 },
  archer:    { hp: 15000, mana: 550, atk: 650, def: 90,  spd: 200, crit: 24, res: 18 },
  berserker: { hp: 24000, mana: 400, atk: 850, def: 140, spd: 210, crit: 26, res: 15 },
  mage:      { hp: 16000, mana: 700, atk: 720, def: 80,  spd: 185, crit: 22, res: 25 },
};

// Stats growth per level
export const STAT_GROWTH = {
  tank:      { hp: 450, mana: 5,  atk: 4,  def: 9,  spd: 0.4, crit: 0.1, res: 1.0 },
  healer:    { hp: 250, mana: 12, atk: 2,  def: 2,  spd: 0.3, crit: 0.1, res: 1.5 },
  warrior:   { hp: 320, mana: 0,  atk: 12, def: 3,  spd: 0.5, crit: 0.3, res: 0.2 },
  archer:    { hp: 200, mana: 8,  atk: 10, def: 1.5, spd: 0.4, crit: 0.25, res: 0.3 },
  berserker: { hp: 350, mana: 5,  atk: 13, def: 2,  spd: 0.5, crit: 0.25, res: 0.2 },
  mage:      { hp: 220, mana: 10, atk: 11, def: 1,  spd: 0.3, crit: 0.2, res: 0.4 },
};

export function getStatsAtLevel(className, level) {
  const base = BASE_STATS[className];
  const growth = STAT_GROWTH[className];
  if (!base || !growth) return base || {};

  const lvl = Math.max(1, Math.min(MAX_LEVEL, level)) - 1;
  return {
    hp:   Math.floor(base.hp + growth.hp * lvl),
    mana: Math.floor(base.mana + growth.mana * lvl),
    atk:  Math.floor(base.atk + growth.atk * lvl),
    def:  Math.floor(base.def + growth.def * lvl),
    spd:  Math.floor(base.spd + growth.spd * lvl),
    crit: Math.round((base.crit + growth.crit * lvl) * 10) / 10,
    res:  Math.round((base.res + growth.res * lvl) * 10) / 10,
  };
}

// XP reward calculation
export function calculateXpReward({ victory, difficulty, bossHpPercent, damageDealt, healingDone, deaths, playerCount, elapsed }) {
  let baseXp = 120;

  const diffMults = { NORMAL: 1.0, HARD: 2.0, NIGHTMARE: 4.0 };
  baseXp *= diffMults[difficulty] || 1.0;

  if (victory) {
    baseXp += 250;
    if (elapsed < 180) baseXp *= 2.0;
    else if (elapsed < 300) baseXp *= 1.5;
  } else {
    const bossProgress = Math.max(0, 100 - (bossHpPercent || 100));
    baseXp += bossProgress * 2.5;
    if (difficulty === 'NORMAL' && bossHpPercent > 75) return 0;
  }

  if (damageDealt > 0) baseXp += Math.min(120, Math.floor(damageDealt / 10000));
  if (healingDone > 0) baseXp += Math.min(90, Math.floor(healingDone / 5000));

  const deathPenalty = Math.max(0.5, 1 - deaths * 0.1);
  baseXp *= deathPenalty;

  if (playerCount <= 1) baseXp *= 0.6;

  return Math.max(10, Math.floor(baseXp));
}

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
      tank:      { gamesPlayed: 0, wins: 0 },
      healer:    { gamesPlayed: 0, wins: 0 },
      warrior:   { gamesPlayed: 0, wins: 0 },
      archer:    { gamesPlayed: 0, wins: 0 },
      berserker: { gamesPlayed: 0, wins: 0 },
      mage:      { gamesPlayed: 0, wins: 0 },
    },
    bestTime: null,
    createdAt: Date.now(),
  };
}
