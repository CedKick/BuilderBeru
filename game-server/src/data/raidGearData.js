// ── Raid Gear System (TERA-inspired Tier System T0-T11) ──
// Each tier = base scaling level. Higher tier = better base stats.
// Artifacts have 1 main stat + 1-3 sub stats (random rolls).
// No set bonuses — pure stat sticks (separate from Colosseum artifact sets).

// ── Tier Definitions ──
export const GEAR_TIERS = {
  T0:  { level: 1,  label: 'Novice',       statMult: 1.0,  color: '#9ca3af', maxSubs: 2 },
  T1:  { level: 7,  label: 'Apprenti',     statMult: 1.15, color: '#a3e635', maxSubs: 2 },
  T2:  { level: 13, label: 'Vétéran',      statMult: 1.35, color: '#22d3ee', maxSubs: 2 },
  T3:  { level: 19, label: 'Expert',       statMult: 1.6,  color: '#60a5fa', maxSubs: 3 },
  T4:  { level: 22, label: 'Maître',       statMult: 1.9,  color: '#818cf8', maxSubs: 3 },
  T5:  { level: 29, label: 'Champion',     statMult: 2.3,  color: '#a78bfa', maxSubs: 3 },
  T6:  { level: 33, label: 'Héroïque',     statMult: 2.8,  color: '#c084fc', maxSubs: 3 },
  T7:  { level: 38, label: 'Légendaire',   statMult: 3.4,  color: '#f472b6', maxSubs: 4 },
  T8:  { level: 44, label: 'Mythique',     statMult: 4.2,  color: '#fb923c', maxSubs: 4 },
  T9:  { level: 49, label: 'Divin',        statMult: 5.2,  color: '#facc15', maxSubs: 4 },
  T10: { level: 53, label: 'Transcendant', statMult: 6.5,  color: '#f87171', maxSubs: 4 },
  T11: { level: 58, label: 'Absolu',       statMult: 8.0,  color: '#ef4444', maxSubs: 4 },
};

// ── 8 Artifact Slots ──
export const RAID_GEAR_SLOTS = [
  { id: 'helmet',   name: 'Casque',    icon: '🪖', mainStats: ['hp_flat', 'hp_pct'] },
  { id: 'chest',    name: 'Plastron',  icon: '🛡️', mainStats: ['atk_flat', 'def_flat'] },
  { id: 'gloves',   name: 'Gants',     icon: '🧤', mainStats: ['crit_rate', 'crit_dmg'] },
  { id: 'boots',    name: 'Bottes',    icon: '👢', mainStats: ['spd_flat', 'def_pct'] },
  { id: 'necklace', name: 'Collier',   icon: '📿', mainStats: ['hp_pct', 'atk_pct'] },
  { id: 'bracelet', name: 'Bracelet',  icon: '⌚', mainStats: ['atk_pct', 'def_pct'] },
  { id: 'ring',     name: 'Anneau',    icon: '💍', mainStats: ['crit_rate', 'res_flat'] },
  { id: 'earring',  name: 'Boucles',   icon: '✨', mainStats: ['hp_pct', 'atk_pct'] },
];

// ── Weapon Templates (base stats at T0, scaled by tier statMult) ──
const WEAPON_TEMPLATES = [
  { base: 'sword',  name: 'Épée',     atk: 30, bonusStat: 'crit_rate', bonusValue: 3,  icon: '⚔️' },
  { base: 'bow',    name: 'Arc',      atk: 25, bonusStat: 'spd_flat',  bonusValue: 5,  icon: '🏹' },
  { base: 'staff',  name: 'Bâton',    atk: 20, bonusStat: 'mana_flat', bonusValue: 30, icon: '🪄' },
  { base: 'shield', name: 'Bouclier', atk: 15, bonusStat: 'def_flat',  bonusValue: 20, icon: '🛡️' },
];

const WEAPON_TIER_NAMES = {
  T0: ['Rouillé', 'Brisé', 'Usé', 'Fendu'],
  T1: ['d\'Apprenti', 'de Fer', 'Renforcé', 'Basique'],
  T2: ['de Vétéran', 'Trempé', 'Forgé', 'Solide'],
  T3: ['d\'Expert', 'Acéré', 'Enchanté', 'Blindé'],
  T4: ['de Maître', 'Légendaire', 'Runique', 'Sacré'],
  T5: ['de Champion', 'Céleste', 'Astral', 'Divin'],
};

// Legacy export for compatibility
export const RAID_WEAPONS = {
  w_sword_t0:  { name: 'Épée Rouillée',   tier: 'T0', atk: 30, bonusStat: 'crit_rate', bonusValue: 3,  icon: '⚔️', desc: 'Lame terne mais fiable' },
  w_bow_t0:    { name: 'Arc Brisé',        tier: 'T0', atk: 25, bonusStat: 'spd_flat',  bonusValue: 5,  icon: '🏹', desc: 'Un arc qui a connu des jours meilleurs' },
  w_staff_t0:  { name: 'Bâton Usé',        tier: 'T0', atk: 20, bonusStat: 'mana_flat', bonusValue: 30, icon: '🪄', desc: 'Canalise encore un peu de mana' },
  w_shield_t0: { name: 'Bouclier Fendu',   tier: 'T0', atk: 15, bonusStat: 'def_flat',  bonusValue: 20, icon: '🛡️', desc: 'Défense basique mais solide' },
};

// ── Main Stat Base Values ──
// Final main stat = base + (tierIndex * perTier), scaled by tier statMult
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

// ── Helper: tier index (T0=0, T1=1, ..., T11=11) ──
const TIER_KEYS = Object.keys(GEAR_TIERS);
function tierIndex(tier) { return TIER_KEYS.indexOf(tier); }

// ── Generate a random raid artifact ──
export function generateRaidArtifact(tier = 'T0', slotId = null) {
  const t = GEAR_TIERS[tier] || GEAR_TIERS.T0;
  const ti = tierIndex(tier);

  // Pick random slot if not specified
  const slot = slotId
    ? RAID_GEAR_SLOTS.find(s => s.id === slotId)
    : RAID_GEAR_SLOTS[Math.floor(Math.random() * RAID_GEAR_SLOTS.length)];

  // Main stat: random from slot's possible main stats
  const mainStatId = slot.mainStats[Math.floor(Math.random() * slot.mainStats.length)];
  const mainDef = MAIN_STAT_BASE[mainStatId];
  const mainValue = Math.round((mainDef.base + ti * mainDef.perTier) * t.statMult);

  // Sub stats: 1 to maxSubs, no duplicate with main
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
    tier,
    tierLabel: t.label,
    tierColor: t.color,
    slot: slot.id,
    slotName: slot.name,
    slotIcon: slot.icon,
    mainStat: { id: mainStatId, label: mainDef.label, value: mainValue },
    subs,
  };
}

// ── Generate a random weapon drop (any tier) ──
export function generateRaidWeaponDrop(tier = 'T0') {
  const t = GEAR_TIERS[tier] || GEAR_TIERS.T0;
  const template = WEAPON_TEMPLATES[Math.floor(Math.random() * WEAPON_TEMPLATES.length)];
  const ti = tierIndex(tier);
  const suffixes = WEAPON_TIER_NAMES[tier] || WEAPON_TIER_NAMES.T0;
  const suffix = suffixes[WEAPON_TEMPLATES.indexOf(template)] || suffixes[0];

  return {
    id: `rw_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: template.name + ' ' + suffix,
    tier,
    tierLabel: t.label,
    tierColor: t.color,
    atk: Math.round(template.atk * t.statMult),
    bonusStat: template.bonusStat,
    bonusValue: Math.round(template.bonusValue * t.statMult),
    icon: template.icon,
  };
}

// ══════════════════════════════════════════════════════
// ── MANAYA SET (T12) — Legendary boss drop set ──
// Fixed stats, unique (no duplicates), crafted from Plumes de Manaya
// ══════════════════════════════════════════════════════

export const MANAYA_SET_COLOR = '#ff2d55';
export const MANAYA_SET_TIER = 'T12';

// Feather cost per slot
export const MANAYA_FEATHER_COST = {
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
// Total: 3+2+2+2+1+1+1+1+1 = 14 feathers for full set

// Fixed Manaya Set pieces (no RNG — stats are predetermined)
export const MANAYA_SET_PIECES = {
  weapon: {
    id: 'manaya_weapon', type: 'weapon', tier: 'T12', tierLabel: 'Manaya', tierColor: MANAYA_SET_COLOR,
    name: 'Griffe de Manaya', icon: '🩸', isManayaSet: true, slot: 'weapon',
    atk: 300, bonusStat: 'crit_dmg', bonusValue: 40,
  },
  helmet: {
    id: 'manaya_helmet', tier: 'T12', tierLabel: 'Manaya', tierColor: MANAYA_SET_COLOR,
    slot: 'helmet', slotName: 'Casque', slotIcon: '🪖', name: 'Diadème de Manaya', isManayaSet: true,
    mainStat: { id: 'hp_flat', label: 'HP', value: 3500 },
    subs: [{ id: 'def_flat', label: 'DEF', value: 120 }, { id: 'res_flat', label: 'RES', value: 50 }],
  },
  chest: {
    id: 'manaya_chest', tier: 'T12', tierLabel: 'Manaya', tierColor: MANAYA_SET_COLOR,
    slot: 'chest', slotName: 'Plastron', slotIcon: '🛡️', name: 'Plastron de Manaya', isManayaSet: true,
    mainStat: { id: 'atk_flat', label: 'ATK', value: 220 },
    subs: [{ id: 'def_flat', label: 'DEF', value: 100 }, { id: 'hp_flat', label: 'HP', value: 2000 }],
  },
  gloves: {
    id: 'manaya_gloves', tier: 'T12', tierLabel: 'Manaya', tierColor: MANAYA_SET_COLOR,
    slot: 'gloves', slotName: 'Gants', slotIcon: '🧤', name: 'Serres de Manaya', isManayaSet: true,
    mainStat: { id: 'crit_rate', label: 'CRIT', value: 35 },
    subs: [{ id: 'crit_dmg', label: 'CRIT DMG', value: 55 }, { id: 'atk_flat', label: 'ATK', value: 80 }],
  },
  boots: {
    id: 'manaya_boots', tier: 'T12', tierLabel: 'Manaya', tierColor: MANAYA_SET_COLOR,
    slot: 'boots', slotName: 'Bottes', slotIcon: '👢', name: 'Pas de Manaya', isManayaSet: true,
    mainStat: { id: 'spd_flat', label: 'SPD', value: 35 },
    subs: [{ id: 'def_flat', label: 'DEF', value: 60 }],
  },
  necklace: {
    id: 'manaya_necklace', tier: 'T12', tierLabel: 'Manaya', tierColor: MANAYA_SET_COLOR,
    slot: 'necklace', slotName: 'Collier', slotIcon: '📿', name: 'Pendentif de Manaya', isManayaSet: true,
    mainStat: { id: 'hp_pct', label: 'HP%', value: 30 },
    subs: [{ id: 'atk_pct', label: 'ATK%', value: 25 }],
  },
  bracelet: {
    id: 'manaya_bracelet', tier: 'T12', tierLabel: 'Manaya', tierColor: MANAYA_SET_COLOR,
    slot: 'bracelet', slotName: 'Bracelet', slotIcon: '⌚', name: 'Chaîne de Manaya', isManayaSet: true,
    mainStat: { id: 'atk_pct', label: 'ATK%', value: 28 },
    subs: [{ id: 'def_pct', label: 'DEF%', value: 18 }],
  },
  ring: {
    id: 'manaya_ring', tier: 'T12', tierLabel: 'Manaya', tierColor: MANAYA_SET_COLOR,
    slot: 'ring', slotName: 'Anneau', slotIcon: '💍', name: 'Sceau de Manaya', isManayaSet: true,
    mainStat: { id: 'crit_rate', label: 'CRIT', value: 25 },
    subs: [{ id: 'res_flat', label: 'RES', value: 40 }],
  },
  earring: {
    id: 'manaya_earring', tier: 'T12', tierLabel: 'Manaya', tierColor: MANAYA_SET_COLOR,
    slot: 'earring', slotName: 'Boucles', slotIcon: '✨', name: 'Larme de Manaya', isManayaSet: true,
    mainStat: { id: 'atk_pct', label: 'ATK%', value: 25 },
    subs: [{ id: 'hp_pct', label: 'HP%', value: 18 }, { id: 'mana_flat', label: 'Mana', value: 180 }],
  },
};

// Set Bonuses (cumulative)
export const MANAYA_SET_BONUSES = {
  2: { label: '2P: ATK +12%, DEF +12%', atk_pct: 12, def_pct: 12 },
  4: { label: '4P: CRIT +18%, CRIT DMG +30%', crit_rate: 18, crit_dmg: 30 },
  6: { label: '6P: HP +22%, Mana +250, DMG +15%', hp_pct: 22, mana_flat: 250, dmg_pct: 15 },
  8: { label: '8P: Chaque hit 3% chance de stun Manaya (annule pattern)', stunChance: 0.03 },
};

// Count equipped Manaya pieces
export function countManayaSetPieces(equippedGear) {
  if (!equippedGear) return 0;
  let count = 0;
  if (equippedGear.weapon?.isManayaSet) count++;
  for (const art of Object.values(equippedGear.artifacts || {})) {
    if (art?.isManayaSet) count++;
  }
  return count;
}

// Get active set bonuses as flat stat object
export function getManayaSetBonuses(pieceCount) {
  const bonuses = {
    atk_pct: 0, def_pct: 0, crit_rate: 0, crit_dmg: 0,
    hp_pct: 0, mana_flat: 0, dmg_pct: 0, stunChance: 0,
  };
  for (const [threshold, bonus] of Object.entries(MANAYA_SET_BONUSES)) {
    if (pieceCount >= parseInt(threshold)) {
      for (const [key, val] of Object.entries(bonus)) {
        if (key === 'label') continue;
        bonuses[key] = (bonuses[key] || 0) + val;
      }
    }
  }
  return bonuses;
}

// Feather drop rates by difficulty (percentage)
export const FEATHER_DROP_RATES = {
  NORMAL:         0.05,
  HARD:           0.2,
  NIGHTMARE:      0.5,
  NIGHTMARE_PLUS: 1.0,
  NIGHTMARE_2:    2.0,
  NIGHTMARE_3:    5.0,
};

// ── Compute total stat bonuses from equipped gear ──
// equippedGear: { weapon: weaponObj|null, artifacts: { helmet: artifactObj, chest: ... } }
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

  // Weapon
  const weapon = equippedGear.weapon;
  if (weapon) {
    bonuses.atk_flat += weapon.atk || 0;
    if (weapon.bonusStat && bonuses[weapon.bonusStat] !== undefined) {
      bonuses[weapon.bonusStat] += weapon.bonusValue || 0;
    }
  }

  // Artifacts (8 slots)
  const artifacts = equippedGear.artifacts || {};
  for (const slotId of Object.keys(artifacts)) {
    const art = artifacts[slotId];
    if (!art) continue;
    // Main stat
    if (art.mainStat && bonuses[art.mainStat.id] !== undefined) {
      bonuses[art.mainStat.id] += art.mainStat.value;
    }
    // Sub stats
    for (const sub of (art.subs || [])) {
      if (bonuses[sub.id] !== undefined) {
        bonuses[sub.id] += sub.value;
      }
    }
  }

  return bonuses;
}
