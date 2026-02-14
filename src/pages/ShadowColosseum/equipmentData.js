// equipmentData.js — Artifact sets, weapons, generation & computation
// Shadow Colosseum equipment system

// ═══════════════════════════════════════════════════════════════
// ARTIFACT SETS
// ═══════════════════════════════════════════════════════════════

export const ARTIFACT_SETS = {
  infamie_chaotique: {
    id: 'infamie_chaotique', name: 'Infamie Chaotique', icon: '\u2694\uFE0F',
    color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30',
    desc: 'ATK brute et degats critiques',
    bonus2: { atkPercent: 12 }, bonus2Desc: 'ATK +12%',
    bonus4: { critDamage: 25 }, bonus4Desc: 'CRIT DMG +25%',
  },
  volonte_de_fer: {
    id: 'volonte_de_fer', name: 'Volonte de Fer', icon: '\uD83D\uDEE1\uFE0F',
    color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30',
    desc: 'Defense et points de vie',
    bonus2: { defPercent: 15 }, bonus2Desc: 'DEF +15%',
    bonus4: { hpPercent: 20 }, bonus4Desc: 'PV +20%',
  },
  flamme_maudite: {
    id: 'flamme_maudite', name: 'Flamme Maudite', icon: '\uD83D\uDD25',
    color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30',
    desc: 'Affinite Feu et critiques',
    bonus2: { critRate: 8 }, bonus2Desc: 'CRIT +8%',
    bonus4: { fireDamage: 20 }, bonus4Desc: 'Degats Feu +20%',
  },
  maree_eternelle: {
    id: 'maree_eternelle', name: 'Maree Eternelle', icon: '\uD83C\uDF0A',
    color: 'text-cyan-400', bg: 'bg-cyan-500/15', border: 'border-cyan-500/30',
    desc: 'Affinite Eau et resistance',
    bonus2: { resFlat: 10 }, bonus2Desc: 'RES +10%',
    bonus4: { waterDamage: 20 }, bonus4Desc: 'Degats Eau +20%',
  },
  ombre_souveraine: {
    id: 'ombre_souveraine', name: 'Ombre Souveraine', icon: '\uD83C\uDF11',
    color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30',
    desc: 'Puissance des Ombres',
    bonus2: { atkPercent: 8 }, bonus2Desc: 'ATK +8%',
    bonus4: { shadowDamage: 25 }, bonus4Desc: 'Degats Ombre +25%',
  },
  benediction_celeste: {
    id: 'benediction_celeste', name: 'Benediction Celeste', icon: '\u2728',
    color: 'text-green-400', bg: 'bg-green-500/15', border: 'border-green-500/30',
    desc: 'Support et soins',
    bonus2: { hpPercent: 12 }, bonus2Desc: 'PV +12%',
    bonus4: { healBonus: 30 }, bonus4Desc: 'Soins +30%',
  },
  expertise_bestiale: {
    id: 'expertise_bestiale', name: 'Expertise Bestiale', icon: '\uD83D\uDC3E',
    color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30',
    desc: 'Polyvalence et vitesse',
    bonus2: { spdPercent: 10 }, bonus2Desc: 'SPD +10%',
    bonus4: { allDamage: 12 }, bonus4Desc: 'Tous Degats +12%',
  },
  eclat_angelique: {
    id: 'eclat_angelique', name: 'Eclat Angelique', icon: '\uD83D\uDC7C',
    color: 'text-yellow-300', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30',
    desc: 'Penetration et utilite',
    bonus2: { resFlat: 8 }, bonus2Desc: 'RES +8%',
    bonus4: { defPen: 15 }, bonus4Desc: 'DEF PEN +15%',
  },
};

// ═══════════════════════════════════════════════════════════════
// ARTIFACT SLOTS
// ═══════════════════════════════════════════════════════════════

export const ARTIFACT_SLOTS = {
  casque:   { id: 'casque',   name: 'Casque',              icon: '\u26D1\uFE0F', mainStats: ['hp_flat', 'hp_pct'] },
  plastron: { id: 'plastron', name: 'Plastron',            icon: '\uD83E\uDDBA', mainStats: ['atk_flat', 'atk_pct'] },
  gants:    { id: 'gants',    name: 'Gants',               icon: '\uD83E\uDDE4', mainStats: ['crit_rate', 'crit_dmg'] },
  bottes:   { id: 'bottes',   name: 'Bottes',              icon: '\uD83D\uDC62', mainStats: ['spd_flat', 'def_pct'] },
  collier:  { id: 'collier',  name: 'Collier',             icon: '\uD83D\uDCFF', mainStats: ['hp_pct', 'atk_pct'] },
  bracelet: { id: 'bracelet', name: 'Bracelet',            icon: '\u231A', mainStats: ['atk_pct', 'def_pct'] },
  anneau:   { id: 'anneau',   name: 'Anneau',              icon: '\uD83D\uDC8D', mainStats: ['crit_rate', 'crit_dmg', 'res_flat'] },
  boucles:  { id: 'boucles',  name: "Boucles d'oreilles",  icon: '\u2728', mainStats: ['hp_pct', 'atk_pct', 'def_pct'] },
};

export const SLOT_ORDER = ['casque', 'plastron', 'gants', 'bottes', 'collier', 'bracelet', 'anneau', 'boucles'];

// ═══════════════════════════════════════════════════════════════
// STAT DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export const MAIN_STAT_VALUES = {
  hp_flat:   { name: 'PV',        base: 50,  perLevel: 30,  icon: '\u2764\uFE0F' },
  hp_pct:    { name: 'PV%',       base: 5,   perLevel: 2.5, icon: '\u2764\uFE0F' },
  atk_flat:  { name: 'ATK',       base: 5,   perLevel: 3,   icon: '\u2694\uFE0F' },
  atk_pct:   { name: 'ATK%',      base: 5,   perLevel: 2.5, icon: '\u2694\uFE0F' },
  def_pct:   { name: 'DEF%',      base: 5,   perLevel: 2.5, icon: '\uD83D\uDEE1\uFE0F' },
  spd_flat:  { name: 'SPD',       base: 3,   perLevel: 1.5, icon: '\uD83D\uDCA8' },
  crit_rate: { name: 'CRIT%',     base: 3,   perLevel: 1.5, icon: '\uD83C\uDFAF' },
  crit_dmg:  { name: 'CRIT DMG%', base: 5,   perLevel: 3,   icon: '\uD83D\uDCA5' },
  res_flat:  { name: 'RES',       base: 3,   perLevel: 1.5, icon: '\uD83D\uDEE1\uFE0F' },
};

export const SUB_STAT_POOL = [
  { id: 'hp_flat',   name: 'PV',       range: [15, 40] },
  { id: 'atk_flat',  name: 'ATK',      range: [2, 6] },
  { id: 'def_flat',  name: 'DEF',      range: [2, 5] },
  { id: 'spd_flat',  name: 'SPD',      range: [1, 4] },
  { id: 'crit_rate', name: 'CRIT%',    range: [1, 4] },
  { id: 'crit_dmg',  name: 'CRIT DMG%', range: [2, 6] },
  { id: 'res_flat',  name: 'RES',      range: [1, 3] },
  { id: 'hp_pct',    name: 'PV%',      range: [2, 5] },
  { id: 'atk_pct',   name: 'ATK%',     range: [2, 5] },
  { id: 'def_pct',   name: 'DEF%',     range: [2, 5] },
];

export const RARITY_SUB_COUNT = {
  rare:       { initial: 1, max: 2 },
  legendaire: { initial: 2, max: 3 },
  mythique:   { initial: 3, max: 4 },
};

// ═══════════════════════════════════════════════════════════════
// HAMMERS (Enhancement consumables)
// ═══════════════════════════════════════════════════════════════

export const HAMMERS = {
  marteau_forge:   { id: 'marteau_forge',   name: 'Marteau de Forge',   icon: '\uD83D\uDD28', rarity: 'common',    maxLevel: 10, shopPrice: 100,  desc: 'Ameliore un artefact (Lv0-10)' },
  marteau_runique: { id: 'marteau_runique', name: 'Marteau Runique',    icon: '\uD83D\uDD2E', rarity: 'rare',      maxLevel: 15, shopPrice: 300,  desc: 'Ameliore un artefact (Lv0-15)' },
  marteau_celeste: { id: 'marteau_celeste', name: 'Marteau Celeste',    icon: '\u2728',       rarity: 'epic',      maxLevel: 20, shopPrice: 800,  desc: 'Ameliore un artefact (Lv0-20)' },
};

export const HAMMER_ORDER = ['marteau_forge', 'marteau_runique', 'marteau_celeste'];

// Which hammer can be used at which level range
export const getRequiredHammer = (level) => {
  if (level < 10) return ['marteau_forge', 'marteau_runique', 'marteau_celeste'];
  if (level < 15) return ['marteau_runique', 'marteau_celeste'];
  return ['marteau_celeste'];
};

// Hammer drop table for stages
export const HAMMER_DROP_TABLE = {
  dropChance: { normal: 0.25, boss: 0.60 },
  tierPool: {
    1: [{ id: 'marteau_forge', weight: 1 }],
    2: [{ id: 'marteau_forge', weight: 3 }, { id: 'marteau_runique', weight: 1 }],
    3: [{ id: 'marteau_forge', weight: 2 }, { id: 'marteau_runique', weight: 2 }],
    4: [{ id: 'marteau_runique', weight: 3 }, { id: 'marteau_celeste', weight: 1 }],
    5: [{ id: 'marteau_runique', weight: 2 }, { id: 'marteau_celeste', weight: 2 }],
    6: [{ id: 'marteau_runique', weight: 1 }, { id: 'marteau_celeste', weight: 3 }],
  },
};

export function rollHammerDrop(tier, isBoss) {
  const chance = isBoss ? HAMMER_DROP_TABLE.dropChance.boss : HAMMER_DROP_TABLE.dropChance.normal;
  if (Math.random() > chance) return null;
  const pool = HAMMER_DROP_TABLE.tierPool[tier] || HAMMER_DROP_TABLE.tierPool[1];
  const totalWeight = pool.reduce((s, p) => s + p.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const entry of pool) {
    roll -= entry.weight;
    if (roll <= 0) return entry.id;
  }
  return pool[0].id;
}

// ═══════════════════════════════════════════════════════════════
// ARTIFACT GENERATION & ENHANCEMENT
// ═══════════════════════════════════════════════════════════════

export const MAX_ARTIFACT_LEVEL = 20;

// Coin cost per enhancement (in addition to hammer)
export const ENHANCE_COST = (level) => {
  if (level < 5) return 30;
  if (level < 10) return 60;
  if (level < 15) return 120;
  return 250;
};

export const FORGE_COSTS = { rare: 200, legendaire: 800, mythique: 3000 };
export const SELL_RATIO = 0.25;

export function generateArtifact(rarity, slotId = null) {
  const setKeys = Object.keys(ARTIFACT_SETS);
  const set = setKeys[Math.floor(Math.random() * setKeys.length)];
  const slot = slotId || SLOT_ORDER[Math.floor(Math.random() * SLOT_ORDER.length)];
  const slotDef = ARTIFACT_SLOTS[slot];
  const mainStatId = slotDef.mainStats[Math.floor(Math.random() * slotDef.mainStats.length)];

  const subCount = RARITY_SUB_COUNT[rarity].initial;
  const availableSubs = SUB_STAT_POOL.filter(s => s.id !== mainStatId);
  const subs = [];
  const usedIds = new Set();
  for (let i = 0; i < subCount; i++) {
    const candidates = availableSubs.filter(s => !usedIds.has(s.id));
    if (candidates.length === 0) break;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    usedIds.add(pick.id);
    const value = pick.range[0] + Math.floor(Math.random() * (pick.range[1] - pick.range[0] + 1));
    subs.push({ id: pick.id, value });
  }

  return {
    uid: `art_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    set, slot, rarity,
    mainStat: mainStatId,
    mainValue: MAIN_STAT_VALUES[mainStatId].base,
    level: 0,
    subs,
  };
}

export function enhanceArtifact(artifact) {
  if (artifact.level >= MAX_ARTIFACT_LEVEL) return artifact;
  const enhanced = { ...artifact, level: artifact.level + 1, subs: artifact.subs.map(s => ({ ...s })) };
  const mainDef = MAIN_STAT_VALUES[enhanced.mainStat];
  enhanced.mainValue = +(mainDef.base + mainDef.perLevel * enhanced.level).toFixed(1);

  // At level 10: add new sub if room
  if (enhanced.level === 10) {
    const maxSubs = RARITY_SUB_COUNT[enhanced.rarity].max;
    if (enhanced.subs.length < maxSubs) {
      const usedIds = new Set([enhanced.mainStat, ...enhanced.subs.map(s => s.id)]);
      const candidates = SUB_STAT_POOL.filter(s => !usedIds.has(s.id));
      if (candidates.length > 0) {
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        const value = pick.range[0] + Math.floor(Math.random() * (pick.range[1] - pick.range[0] + 1));
        enhanced.subs.push({ id: pick.id, value });
      }
    }
  }

  // Every 5 levels: upgrade a random sub (+% boost)
  if (enhanced.level % 5 === 0 && enhanced.subs.length > 0) {
    const idx = Math.floor(Math.random() * enhanced.subs.length);
    const subDef = SUB_STAT_POOL.find(s => s.id === enhanced.subs[idx].id);
    if (subDef) {
      // Milestone bonus: bigger roll at higher milestones
      const milestone = Math.floor(enhanced.level / 5); // 1, 2, 3, 4
      const bonusMult = 1 + (milestone - 1) * 0.25; // 1x, 1.25x, 1.5x, 1.75x
      const baseRoll = subDef.range[0] + Math.floor(Math.random() * (subDef.range[1] - subDef.range[0] + 1));
      const roll = Math.ceil(baseRoll * bonusMult);
      enhanced.subs[idx] = { ...enhanced.subs[idx], value: enhanced.subs[idx].value + roll };
    }
  }

  return enhanced;
}

// ═══════════════════════════════════════════════════════════════
// ARTIFACT BONUS COMPUTATION
// ═══════════════════════════════════════════════════════════════

const EMPTY_BONUSES = () => ({
  hp_flat: 0, hp_pct: 0, atk_flat: 0, atk_pct: 0,
  def_flat: 0, def_pct: 0, spd_flat: 0, spd_pct: 0,
  crit_rate: 0, crit_dmg: 0, res_flat: 0,
  // Set bonuses (mapped to talent-bonus-compatible keys)
  atkPercent: 0, defPercent: 0, hpPercent: 0, spdPercent: 0,
  critRate: 0, critDamage: 0,
  fireDamage: 0, waterDamage: 0, shadowDamage: 0,
  allDamage: 0, healBonus: 0, defPen: 0,
});

export function computeArtifactBonuses(equippedArtifacts) {
  const b = EMPTY_BONUSES();
  if (!equippedArtifacts) return b;

  const setCounts = {};

  Object.values(equippedArtifacts).forEach(art => {
    if (!art) return;
    // Main stat
    if (b[art.mainStat] !== undefined) b[art.mainStat] += art.mainValue;
    // Sub stats
    art.subs.forEach(sub => {
      if (b[sub.id] !== undefined) b[sub.id] += sub.value;
    });
    // Count sets
    setCounts[art.set] = (setCounts[art.set] || 0) + 1;
  });

  // Apply set bonuses
  Object.entries(setCounts).forEach(([setId, count]) => {
    const setDef = ARTIFACT_SETS[setId];
    if (!setDef) return;
    if (count >= 2) Object.entries(setDef.bonus2).forEach(([k, v]) => { if (b[k] !== undefined) b[k] += v; });
    if (count >= 4) Object.entries(setDef.bonus4).forEach(([k, v]) => { if (b[k] !== undefined) b[k] += v; });
  });

  return b;
}

// Get active set info for display
export function getActiveSetBonuses(equippedArtifacts) {
  if (!equippedArtifacts) return [];
  const setCounts = {};
  Object.values(equippedArtifacts).forEach(art => {
    if (!art) return;
    setCounts[art.set] = (setCounts[art.set] || 0) + 1;
  });
  const active = [];
  Object.entries(setCounts).forEach(([setId, count]) => {
    const s = ARTIFACT_SETS[setId];
    if (!s) return;
    if (count >= 2) active.push({ set: s, pieces: count, bonus: s.bonus2Desc, tier: 2 });
    if (count >= 4) active.push({ set: s, pieces: count, bonus: s.bonus4Desc, tier: 4 });
  });
  return active;
}

// ═══════════════════════════════════════════════════════════════
// WEAPONS
// ═══════════════════════════════════════════════════════════════

export const WEAPONS = {
  // Fire (5)
  w_lame_inferno:     { id: 'w_lame_inferno',     name: "Lame de l'Inferno",   rarity: 'mythique',   element: 'fire',   atk: 25, bonusStat: 'crit_rate', bonusValue: 8,  icon: '\uD83D\uDDE1\uFE0F', desc: 'Forgee dans les flammes eternelles' },
  w_hache_volcanique: { id: 'w_hache_volcanique', name: 'Hache Volcanique',     rarity: 'legendaire', element: 'fire',   atk: 18, bonusStat: 'atk_pct',   bonusValue: 10, icon: '\uD83E\uDE93', desc: 'Lave solidifiee en acier' },
  w_arc_braise:       { id: 'w_arc_braise',       name: 'Arc de Braise',        rarity: 'legendaire', element: 'fire',   atk: 15, bonusStat: 'spd_flat',  bonusValue: 8,  icon: '\uD83C\uDFF9', desc: 'Fleches enflammees' },
  w_dague_pyrite:     { id: 'w_dague_pyrite',     name: 'Dague de Pyrite',      rarity: 'rare',       element: 'fire',   atk: 10, bonusStat: 'crit_rate', bonusValue: 5,  icon: '\uD83D\uDDE1\uFE0F', desc: 'Lame incandescente' },
  w_marteau_forge:    { id: 'w_marteau_forge',    name: 'Marteau de la Forge',  rarity: 'rare',       element: 'fire',   atk: 12, bonusStat: 'def_pct',   bonusValue: 6,  icon: '\uD83D\uDD28', desc: 'Outil du forgeron ancestral' },

  // Water (5)
  w_trident_abyssal:  { id: 'w_trident_abyssal',  name: 'Trident Abyssal',     rarity: 'mythique',   element: 'water',  atk: 22, bonusStat: 'atk_pct',   bonusValue: 12, icon: '\uD83D\uDD31', desc: 'Arme des profondeurs' },
  w_epee_glaciale:    { id: 'w_epee_glaciale',    name: 'Epee Glaciale',        rarity: 'legendaire', element: 'water',  atk: 18, bonusStat: 'crit_dmg',  bonusValue: 12, icon: '\u2694\uFE0F', desc: 'Glace eternelle tranchante' },
  w_arc_tsunami:      { id: 'w_arc_tsunami',      name: 'Arc du Tsunami',       rarity: 'legendaire', element: 'water',  atk: 16, bonusStat: 'spd_flat',  bonusValue: 10, icon: '\uD83C\uDFF9', desc: 'Fleches de maree' },
  w_lance_corail:     { id: 'w_lance_corail',     name: 'Lance de Corail',      rarity: 'rare',       element: 'water',  atk: 11, bonusStat: 'hp_pct',    bonusValue: 8,  icon: '\uD83D\uDDE1\uFE0F', desc: 'Durcie par les abysses' },
  w_baton_brume:      { id: 'w_baton_brume',      name: 'Baton de Brume',       rarity: 'rare',       element: 'water',  atk: 9,  bonusStat: 'res_flat',   bonusValue: 6,  icon: '\uD83E\uDE84', desc: 'Canalise les brumes marines' },

  // Shadow (5)
  w_faux_monarque:    { id: 'w_faux_monarque',    name: 'Faux du Monarque',     rarity: 'mythique',   element: 'shadow', atk: 28, bonusStat: 'crit_dmg',  bonusValue: 15, icon: '\u2694\uFE0F', desc: "L'arme du Roi des Ombres" },
  w_katana_void:      { id: 'w_katana_void',      name: 'Katana du Void',       rarity: 'mythique',   element: 'shadow', atk: 24, bonusStat: 'crit_rate', bonusValue: 10, icon: '\uD83D\uDDE1\uFE0F', desc: 'Tranche la realite' },
  w_griffe_nuit:      { id: 'w_griffe_nuit',      name: 'Griffe de la Nuit',    rarity: 'legendaire', element: 'shadow', atk: 17, bonusStat: 'spd_flat',  bonusValue: 10, icon: '\uD83D\uDDE1\uFE0F', desc: "Rapide comme l'ombre" },
  w_masse_tenebres:   { id: 'w_masse_tenebres',   name: 'Masse des Tenebres',  rarity: 'legendaire', element: 'shadow', atk: 20, bonusStat: 'hp_pct',    bonusValue: 10, icon: '\uD83D\uDD28', desc: "Poids de l'obscurite" },
  w_dague_ombre:      { id: 'w_dague_ombre',      name: "Dague d'Ombre",        rarity: 'rare',       element: 'shadow', atk: 10, bonusStat: 'atk_pct',   bonusValue: 6,  icon: '\uD83D\uDDE1\uFE0F', desc: 'Lame des assassins' },

  // Neutral (3)
  w_epee_ancienne:    { id: 'w_epee_ancienne',    name: 'Epee Ancienne',        rarity: 'legendaire', element: null,     atk: 16, bonusStat: 'atk_pct',   bonusValue: 8,  icon: '\u2694\uFE0F', desc: "Arme d'une ere oubliee" },
  w_baguette_sage:    { id: 'w_baguette_sage',    name: 'Baguette du Sage',     rarity: 'rare',       element: null,     atk: 8,  bonusStat: 'crit_rate', bonusValue: 5,  icon: '\uD83E\uDE84', desc: 'Sagesse cristallisee' },
  w_bouclier_hero:    { id: 'w_bouclier_hero',    name: 'Bouclier du Heros',    rarity: 'rare',       element: null,     atk: 6,  bonusStat: 'def_pct',   bonusValue: 10, icon: '\uD83D\uDEE1\uFE0F', desc: 'Protection legendaire' },
};

export const WEAPON_PRICES = { rare: 500, legendaire: 2000, mythique: 5000 };

export function computeWeaponBonuses(weaponId) {
  const b = { atk_flat: 0, atk_pct: 0, def_pct: 0, hp_pct: 0, spd_flat: 0, crit_rate: 0, crit_dmg: 0, res_flat: 0 };
  if (!weaponId) return b;
  const w = WEAPONS[weaponId];
  if (!w) return b;
  b.atk_flat += w.atk;
  if (b[w.bonusStat] !== undefined) b[w.bonusStat] += w.bonusValue;
  return b;
}

// ═══════════════════════════════════════════════════════════════
// MERGE EQUIPMENT BONUSES
// ═══════════════════════════════════════════════════════════════

export function mergeEquipBonuses(artifactBonuses, weaponBonuses) {
  const merged = { ...artifactBonuses };
  Object.entries(weaponBonuses).forEach(([key, val]) => {
    merged[key] = (merged[key] || 0) + val;
  });
  return merged;
}

// ═══════════════════════════════════════════════════════════════
// EVEIL (AWAKENING) CONSTANTS
// ═══════════════════════════════════════════════════════════════

export const MAX_EVEIL_STARS = 5;
export const EVEIL_STAT_BONUS_PER_STAR = 5; // +5% all base stats per star

// ═══════════════════════════════════════════════════════════════
// HUNTER DROP TABLE (Stage farming)
// ═══════════════════════════════════════════════════════════════

export const STAGE_HUNTER_DROP = {
  dropChance: { normal: 0.01, boss: 0.05 },
  tierPool: {
    1: ['rare'],
    2: ['rare'],
    3: ['rare', 'legendaire'],
    4: ['legendaire'],
    5: ['legendaire', 'mythique'],
    6: ['mythique'],
  },
};
