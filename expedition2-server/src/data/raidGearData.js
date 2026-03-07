// ── Raid Gear System (Ragnaros) — TERA-inspired Tier System T0-T11 ──
// Artifacts: 1 main stat + 1-4 sub stats (random rolls)
// Ragnaros Set: T12 legendary boss drop set (fixed stats)

// ── Tier Definitions ──
export const GEAR_TIERS = {
  T0:  { level: 1,  label: 'Novice',       statMult: 1.0,  color: '#9ca3af', maxSubs: 2 },
  T1:  { level: 7,  label: 'Apprenti',     statMult: 1.15, color: '#a3e635', maxSubs: 2 },
  T2:  { level: 13, label: 'Veteran',      statMult: 1.35, color: '#22d3ee', maxSubs: 2 },
  T3:  { level: 19, label: 'Expert',       statMult: 1.6,  color: '#60a5fa', maxSubs: 3 },
  T4:  { level: 22, label: 'Maitre',       statMult: 1.9,  color: '#818cf8', maxSubs: 3 },
  T5:  { level: 29, label: 'Champion',     statMult: 2.3,  color: '#a78bfa', maxSubs: 3 },
  T6:  { level: 33, label: 'Heroique',     statMult: 2.8,  color: '#c084fc', maxSubs: 3 },
  T7:  { level: 38, label: 'Legendaire',   statMult: 3.4,  color: '#f472b6', maxSubs: 4 },
  T8:  { level: 44, label: 'Mythique',     statMult: 4.2,  color: '#fb923c', maxSubs: 4 },
  T9:  { level: 49, label: 'Divin',        statMult: 5.2,  color: '#facc15', maxSubs: 4 },
  T10: { level: 53, label: 'Transcendant', statMult: 6.5,  color: '#f87171', maxSubs: 4 },
  T11: { level: 58, label: 'Absolu',       statMult: 8.0,  color: '#ef4444', maxSubs: 4 },
};

// ── 8 Artifact Slots ──
export const RAID_GEAR_SLOTS = [
  { id: 'helmet',   name: 'Casque',    icon: 'helm',    mainStats: ['hp_flat', 'hp_pct'] },
  { id: 'chest',    name: 'Plastron',  icon: 'chest',   mainStats: ['atk_flat', 'def_flat'] },
  { id: 'gloves',   name: 'Gants',     icon: 'gloves',  mainStats: ['crit_rate', 'crit_dmg'] },
  { id: 'boots',    name: 'Bottes',    icon: 'boots',   mainStats: ['spd_flat', 'def_pct'] },
  { id: 'necklace', name: 'Collier',   icon: 'neck',    mainStats: ['hp_pct', 'atk_pct'] },
  { id: 'bracelet', name: 'Bracelet',  icon: 'wrist',   mainStats: ['atk_pct', 'def_pct'] },
  { id: 'ring',     name: 'Anneau',    icon: 'ring',    mainStats: ['crit_rate', 'res_flat'] },
  { id: 'earring',  name: 'Boucles',   icon: 'earring', mainStats: ['hp_pct', 'atk_pct'] },
];

// ── Weapon Templates ──
const WEAPON_TEMPLATES = [
  { base: 'sword',    name: 'Epee',      atk: 30, bonusStat: 'crit_rate',  bonusValue: 3,  classes: ['warrior'] },
  { base: 'bow',      name: 'Arc',       atk: 25, bonusStat: 'spd_flat',   bonusValue: 5,  classes: ['archer'] },
  { base: 'staff',    name: 'Baton',     atk: 22, bonusStat: 'mana_flat',  bonusValue: 30, classes: ['mage', 'healer'] },
  { base: 'axe',      name: 'Hache',     atk: 35, bonusStat: 'crit_dmg',   bonusValue: 5,  classes: ['berserker'] },
  { base: 'shield',   name: 'Bouclier',  atk: 15, bonusStat: 'def_flat',   bonusValue: 20, classes: ['tank'] },
  { base: 'grimoire', name: 'Grimoire',  atk: 20, bonusStat: 'mana_flat',  bonusValue: 40, classes: ['mage'] },
];

const WEAPON_TIER_NAMES = {
  T0: ['Rouille', 'Brise', 'Use', 'Fendu', 'Abime', 'Terni'],
  T1: ["d'Apprenti", 'de Fer', 'Renforce', 'Basique', 'Simple', 'Commun'],
  T2: ['de Veteran', 'Trempe', 'Forge', 'Solide', 'Robuste', 'Epais'],
  T3: ["d'Expert", 'Acere', 'Enchante', 'Blinde', 'Grave', 'Scelle'],
  T4: ['de Maitre', 'Legendaire', 'Runique', 'Sacre', 'Beni', 'Divin'],
  T5: ['de Champion', 'Celeste', 'Astral', 'Divin', 'Radiant', 'Sublime'],
};

// ── Main Stat Base Values ──
export const MAIN_STAT_BASE = {
  hp_flat:   { base: 200,  perTier: 180, label: 'HP' },
  hp_pct:    { base: 3,    perTier: 2.5, label: 'HP%' },
  atk_flat:  { base: 15,   perTier: 12,  label: 'ATK' },
  atk_pct:   { base: 3,    perTier: 2.5, label: 'ATK%' },
  def_flat:  { base: 12,   perTier: 10,  label: 'DEF' },
  def_pct:   { base: 3,    perTier: 2.5, label: 'DEF%' },
  spd_flat:  { base: 3,    perTier: 2,   label: 'SPD' },
  crit_rate: { base: 2,    perTier: 1.5, label: 'CRIT' },
  crit_dmg:  { base: 4,    perTier: 3,   label: 'CRIT DMG' },
  res_flat:  { base: 3,    perTier: 2,   label: 'RES' },
  mana_flat: { base: 15,   perTier: 10,  label: 'Mana' },
};

// ── Sub Stat Pool ──
export const SUB_STAT_POOL = [
  { id: 'hp_flat',   label: 'HP',       range: [30, 80] },
  { id: 'atk_flat',  label: 'ATK',      range: [3, 8] },
  { id: 'def_flat',  label: 'DEF',      range: [3, 8] },
  { id: 'spd_flat',  label: 'SPD',      range: [1, 4] },
  { id: 'crit_rate', label: 'CRIT',     range: [1, 3] },
  { id: 'crit_dmg',  label: 'CRIT DMG', range: [2, 5] },
  { id: 'res_flat',  label: 'RES',      range: [1, 4] },
  { id: 'mana_flat', label: 'Mana',     range: [5, 15] },
];

// ── Helpers ──
const TIER_KEYS = Object.keys(GEAR_TIERS);
function tierIndex(tier) { return TIER_KEYS.indexOf(tier); }

// ── Generate a random artifact ──
export function generateRaidArtifact(tier = 'T0', slotId = null) {
  const t = GEAR_TIERS[tier] || GEAR_TIERS.T0;
  const ti = tierIndex(tier);

  const slot = slotId
    ? RAID_GEAR_SLOTS.find(s => s.id === slotId)
    : RAID_GEAR_SLOTS[Math.floor(Math.random() * RAID_GEAR_SLOTS.length)];

  const mainStatId = slot.mainStats[Math.floor(Math.random() * slot.mainStats.length)];
  const mainDef = MAIN_STAT_BASE[mainStatId];
  const mainValue = Math.round((mainDef.base + ti * mainDef.perTier) * t.statMult);

  const numSubs = 1 + Math.floor(Math.random() * t.maxSubs);
  const availableSubs = SUB_STAT_POOL.filter(s => s.id !== mainStatId);
  const subs = [];
  const usedIds = new Set();
  for (let i = 0; i < numSubs && availableSubs.length > 0; i++) {
    const pool = availableSubs.filter(s => !usedIds.has(s.id));
    if (pool.length === 0) break;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    usedIds.add(pick.id);
    const value = Math.round(
      (pick.range[0] + Math.random() * (pick.range[1] - pick.range[0])) * t.statMult
    );
    subs.push({ id: pick.id, label: pick.label, value });
  }

  return {
    id: `rg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    tier, tierLabel: t.label, tierColor: t.color,
    slot: slot.id, slotName: slot.name, slotIcon: slot.icon,
    mainStat: { id: mainStatId, label: mainDef.label, value: mainValue },
    subs,
  };
}

// ── Generate a random weapon ──
export function generateRaidWeaponDrop(tier = 'T0') {
  const t = GEAR_TIERS[tier] || GEAR_TIERS.T0;
  const template = WEAPON_TEMPLATES[Math.floor(Math.random() * WEAPON_TEMPLATES.length)];
  const ti = tierIndex(tier);
  const suffixes = WEAPON_TIER_NAMES[tier] || WEAPON_TIER_NAMES.T0;
  const idx = WEAPON_TEMPLATES.indexOf(template);
  const suffix = suffixes[idx % suffixes.length] || suffixes[0];

  return {
    id: `rw_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: template.name + ' ' + suffix,
    base: template.base,
    tier, tierLabel: t.label, tierColor: t.color,
    atk: Math.round(template.atk * t.statMult),
    bonusStat: template.bonusStat,
    bonusValue: Math.round(template.bonusValue * t.statMult),
    classes: template.classes,
  };
}

// ══════════════════════════════════════════════
// ── RAGNAROS SET (T12) — Legendary boss drop ──
// ══════════════════════════════════════════════

export const RAGNAROS_SET_COLOR = '#ff6b1a';
export const RAGNAROS_SET_TIER = 'T12';

export const RAGNAROS_FEATHER_COST = {
  weapon:   3,
  helmet:   2,
  chest:    2,
  gloves:   2,
  boots:    1,
  necklace: 1,
  bracelet: 1,
  ring:     1,
  earring:  1,
};

export const RAGNAROS_SET_PIECES = {
  weapon: {
    id: 'ragnaros_weapon', type: 'weapon', tier: 'T12', tierLabel: 'Ragnaros', tierColor: RAGNAROS_SET_COLOR,
    name: 'Marteau de Ragnaros', slot: 'weapon', isRagnarosSet: true,
    atk: 320, bonusStat: 'crit_dmg', bonusValue: 45,
  },
  helmet: {
    id: 'ragnaros_helmet', tier: 'T12', tierLabel: 'Ragnaros', tierColor: RAGNAROS_SET_COLOR,
    slot: 'helmet', slotName: 'Casque', name: 'Couronne de Flammes', isRagnarosSet: true,
    mainStat: { id: 'hp_flat', label: 'HP', value: 3800 },
    subs: [{ id: 'def_flat', label: 'DEF', value: 130 }, { id: 'res_flat', label: 'RES', value: 55 }],
  },
  chest: {
    id: 'ragnaros_chest', tier: 'T12', tierLabel: 'Ragnaros', tierColor: RAGNAROS_SET_COLOR,
    slot: 'chest', slotName: 'Plastron', name: 'Cuirasse du Seigneur du Feu', isRagnarosSet: true,
    mainStat: { id: 'atk_flat', label: 'ATK', value: 240 },
    subs: [{ id: 'def_flat', label: 'DEF', value: 110 }, { id: 'hp_flat', label: 'HP', value: 2200 }],
  },
  gloves: {
    id: 'ragnaros_gloves', tier: 'T12', tierLabel: 'Ragnaros', tierColor: RAGNAROS_SET_COLOR,
    slot: 'gloves', slotName: 'Gants', name: 'Poings de Magma', isRagnarosSet: true,
    mainStat: { id: 'crit_rate', label: 'CRIT', value: 38 },
    subs: [{ id: 'crit_dmg', label: 'CRIT DMG', value: 60 }, { id: 'atk_flat', label: 'ATK', value: 90 }],
  },
  boots: {
    id: 'ragnaros_boots', tier: 'T12', tierLabel: 'Ragnaros', tierColor: RAGNAROS_SET_COLOR,
    slot: 'boots', slotName: 'Bottes', name: 'Pas de Lave', isRagnarosSet: true,
    mainStat: { id: 'spd_flat', label: 'SPD', value: 38 },
    subs: [{ id: 'def_flat', label: 'DEF', value: 65 }],
  },
  necklace: {
    id: 'ragnaros_necklace', tier: 'T12', tierLabel: 'Ragnaros', tierColor: RAGNAROS_SET_COLOR,
    slot: 'necklace', slotName: 'Collier', name: 'Collier de Braise', isRagnarosSet: true,
    mainStat: { id: 'hp_pct', label: 'HP%', value: 32 },
    subs: [{ id: 'atk_pct', label: 'ATK%', value: 28 }],
  },
  bracelet: {
    id: 'ragnaros_bracelet', tier: 'T12', tierLabel: 'Ragnaros', tierColor: RAGNAROS_SET_COLOR,
    slot: 'bracelet', slotName: 'Bracelet', name: 'Bracelet Volcanique', isRagnarosSet: true,
    mainStat: { id: 'atk_pct', label: 'ATK%', value: 30 },
    subs: [{ id: 'def_pct', label: 'DEF%', value: 20 }],
  },
  ring: {
    id: 'ragnaros_ring', tier: 'T12', tierLabel: 'Ragnaros', tierColor: RAGNAROS_SET_COLOR,
    slot: 'ring', slotName: 'Anneau', name: 'Anneau de Feu Eternel', isRagnarosSet: true,
    mainStat: { id: 'crit_rate', label: 'CRIT', value: 28 },
    subs: [{ id: 'res_flat', label: 'RES', value: 45 }],
  },
  earring: {
    id: 'ragnaros_earring', tier: 'T12', tierLabel: 'Ragnaros', tierColor: RAGNAROS_SET_COLOR,
    slot: 'earring', slotName: 'Boucles', name: 'Larme de Magma', isRagnarosSet: true,
    mainStat: { id: 'atk_pct', label: 'ATK%', value: 28 },
    subs: [{ id: 'hp_pct', label: 'HP%', value: 20 }, { id: 'mana_flat', label: 'Mana', value: 200 }],
  },
};

// Set Bonuses (cumulative)
export const RAGNAROS_SET_BONUSES = {
  2: { label: '2P: ATK +15%, DEF +10%', atk_pct: 15, def_pct: 10 },
  4: { label: '4P: CRIT +20%, CRIT DMG +35%', crit_rate: 20, crit_dmg: 35 },
  6: { label: '6P: HP +25%, Mana +300, DMG +18%', hp_pct: 25, mana_flat: 300, dmg_pct: 18 },
  8: { label: '8P: Attaques de feu: 5% chance brulure (DOT 2% HP/s, 4s)', burnChance: 0.05, burnDmgPct: 0.02, burnDuration: 4 },
};

export function countRagnarosSetPieces(equippedGear) {
  if (!equippedGear) return 0;
  let count = 0;
  if (equippedGear.weapon?.isRagnarosSet) count++;
  for (const art of Object.values(equippedGear.artifacts || {})) {
    if (art?.isRagnarosSet) count++;
  }
  return count;
}

export function getRagnarosSetBonuses(pieceCount) {
  const bonuses = {
    atk_pct: 0, def_pct: 0, crit_rate: 0, crit_dmg: 0,
    hp_pct: 0, mana_flat: 0, dmg_pct: 0, burnChance: 0,
  };
  for (const [threshold, bonus] of Object.entries(RAGNAROS_SET_BONUSES)) {
    if (pieceCount >= parseInt(threshold)) {
      for (const [key, val] of Object.entries(bonus)) {
        if (key === 'label') continue;
        bonuses[key] = (bonuses[key] || 0) + val;
      }
    }
  }
  return bonuses;
}

// Feather drop rates
export const FEATHER_DROP_RATES = {
  NORMAL:    0.05,
  HARD:      0.2,
  NIGHTMARE: 0.5,
};

// ══════════════════════════════════════════════
// ALKAHEST REWARDS
// ══════════════════════════════════════════════

export const ALKAHEST_DIFFICULTY_MULT = {
  NORMAL: 1.0, HARD: 2.5, NIGHTMARE: 5.0,
};

export const ALKAHEST_PLAYER_MULT = { 1: 1.0, 2: 1.4, 3: 2.0, 4: 2.5, 5: 2.8, 6: 3.0 };

export const ALKAHEST_HP_THRESHOLDS = [
  { maxHpPct: 0,  base: [30, 36] },
  { maxHpPct: 50, base: [15, 27] },
  { maxHpPct: 70, base: [9, 15]  },
  { maxHpPct: 75, base: [3, 6]   },
];

export function calculateAlkahestReward(bossHpPercent, difficulty, playerCount, victory) {
  if (bossHpPercent > 75) return 0;

  let baseRange = null;
  if (victory || bossHpPercent <= 0) {
    baseRange = ALKAHEST_HP_THRESHOLDS[0].base;
  } else {
    for (const threshold of ALKAHEST_HP_THRESHOLDS) {
      if (bossHpPercent <= threshold.maxHpPct) { baseRange = threshold.base; break; }
    }
  }
  if (!baseRange) return 0;

  const base = baseRange[0] + Math.floor(Math.random() * (baseRange[1] - baseRange[0] + 1));
  const diffMult = ALKAHEST_DIFFICULTY_MULT[difficulty] || 1.0;
  const playerMult = ALKAHEST_PLAYER_MULT[playerCount] || 1.0;
  const variance = 0.9 + Math.random() * 0.2;

  return Math.round(base * diffMult * playerMult * variance);
}

// ══════════════════════════════════════════════
// LOOT TABLES
// ══════════════════════════════════════════════

// Artifact drop: 1-3 artifacts on victory (tier based on difficulty)
export const ARTIFACT_DROP_TABLE = {
  NORMAL:    { count: [1, 2], tiers: ['T0', 'T1', 'T2'] },
  HARD:      { count: [1, 3], tiers: ['T2', 'T3', 'T4', 'T5'] },
  NIGHTMARE: { count: [2, 3], tiers: ['T5', 'T6', 'T7', 'T8'] },
};

// Weapon drop: 0-1 weapon on victory
export const WEAPON_DROP_CHANCE = {
  NORMAL: 0.15, HARD: 0.30, NIGHTMARE: 0.50,
};

export const WEAPON_DROP_TIERS = {
  NORMAL:    ['T0', 'T1', 'T2'],
  HARD:      ['T2', 'T3', 'T4'],
  NIGHTMARE: ['T5', 'T6', 'T7'],
};

// Set ultime: 5 rolls x 0.5%
export const SET_ULTIME_ROLL_COUNT = 5;
export const SET_ULTIME_DROP_CHANCE = 0.005;

export function rollSetUltimeDrops() {
  const drops = [];
  const slots = Object.keys(RAGNAROS_SET_PIECES);
  for (let i = 0; i < SET_ULTIME_ROLL_COUNT; i++) {
    if (Math.random() < SET_ULTIME_DROP_CHANCE) {
      const slot = slots[Math.floor(Math.random() * slots.length)];
      drops.push({ ...RAGNAROS_SET_PIECES[slot], isSetUltimeDrop: true });
    }
  }
  return drops;
}

// ── Compute total stat bonuses from equipped gear ──
export function computeRaidGearBonuses(equippedGear) {
  const bonuses = {
    hp_flat: 0, hp_pct: 0,
    atk_flat: 0, atk_pct: 0,
    def_flat: 0, def_pct: 0,
    spd_flat: 0,
    crit_rate: 0, crit_dmg: 0,
    res_flat: 0,
    mana_flat: 0,
  };

  if (!equippedGear) return bonuses;

  const weapon = equippedGear.weapon;
  if (weapon) {
    bonuses.atk_flat += weapon.atk || 0;
    if (weapon.bonusStat && bonuses[weapon.bonusStat] !== undefined) {
      bonuses[weapon.bonusStat] += weapon.bonusValue || 0;
    }
  }

  const artifacts = equippedGear.artifacts || {};
  for (const slotId of Object.keys(artifacts)) {
    const art = artifacts[slotId];
    if (!art) continue;
    if (art.mainStat && bonuses[art.mainStat.id] !== undefined) {
      bonuses[art.mainStat.id] += art.mainStat.value;
    }
    for (const sub of (art.subs || [])) {
      if (bonuses[sub.id] !== undefined) bonuses[sub.id] += sub.value;
    }
  }

  return bonuses;
}
