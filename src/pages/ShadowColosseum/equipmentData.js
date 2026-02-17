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
// RAID-EXCLUSIVE ARTIFACT SETS (drops from Raid Bosses only)
// ═══════════════════════════════════════════════════════════════

export const RAID_ARTIFACT_SETS = {
  sacrifice_martyr: {
    id: 'sacrifice_martyr', name: 'Sacrifice du Martyr', icon: '\uD83D\uDC9C', raid: true,
    color: 'text-pink-400', bg: 'bg-pink-500/15', border: 'border-pink-500/30',
    desc: 'Se sacrifier pour ses allies',
    bonus2: {}, bonus2Desc: 'ATK -30%, ATK allies +15%',
    bonus4: {}, bonus4Desc: 'Allie <30% PV \u2192 soigne 20% PV max (1x)',
    passive2: { trigger: 'always', type: 'martyrAura', selfAtkMult: -0.30, allyAtkBonus: 0.15 },
    passive4: { trigger: 'onAllyLow', type: 'martyrHeal', threshold: 0.30, healPct: 0.20, once: true },
  },
  fureur_desespoir: {
    id: 'fureur_desespoir', name: 'Fureur du Desespoir', icon: '\uD83E\uDE78', raid: true,
    color: 'text-rose-500', bg: 'bg-rose-500/15', border: 'border-rose-500/30',
    desc: 'Plus tu souffres, plus tu frappes',
    bonus2: {}, bonus2Desc: '+0.8% DMG par 1% PV manquant',
    bonus4: {}, bonus4Desc: '<25% PV: crits garantis + ignore 25% DEF',
    passive2: { trigger: 'beforeAttack', type: 'desperateFury', dmgPerMissingPct: 0.008 },
    passive4: { trigger: 'beforeAttack', type: 'lastStand', hpThreshold: 0.25, autoCrit: true, defIgnore: 0.25 },
  },
  chaines_destin: {
    id: 'chaines_destin', name: 'Chaines du Destin', icon: '\u26D3\uFE0F', raid: true,
    color: 'text-red-300', bg: 'bg-red-400/15', border: 'border-red-400/30',
    desc: 'Le destin lie tes coups a ta vie',
    bonus2: {}, bonus2Desc: '15% chance voler 12% DMG en PV',
    bonus4: {}, bonus4Desc: 'Soins +30%, 10% chance soin crit (x2)',
    passive2: { trigger: 'afterAttack', type: 'lifesteal', chance: 0.15, stealPct: 0.12 },
    passive4: { trigger: 'onHeal', type: 'healCrit', healBoostPct: 0.30, critChance: 0.10 },
  },
  echo_temporel: {
    id: 'echo_temporel', name: 'Echo Temporel', icon: '\u23F3', raid: true,
    color: 'text-teal-400', bg: 'bg-teal-500/15', border: 'border-teal-500/30',
    desc: 'Manipuler le temps a ton avantage',
    bonus2: {}, bonus2Desc: '20% chance -1 CD apres attaque',
    bonus4: {}, bonus4Desc: 'Tous les 3 tours, prochain sort = 0 mana',
    passive2: { trigger: 'afterAttack', type: 'echoCD', chance: 0.20 },
    passive4: { trigger: 'onTurnStart', type: 'echoFreeMana', interval: 3 },
  },
  aura_commandeur: {
    id: 'aura_commandeur', name: 'Aura du Commandeur', icon: '\uD83D\uDC51', raid: true,
    color: 'text-amber-300', bg: 'bg-amber-400/15', border: 'border-amber-400/30',
    desc: 'Un leader inspire ses troupes',
    bonus2: {}, bonus2Desc: '+10% DEF tous allies en raid',
    bonus4: {}, bonus4Desc: 'Debut combat: allies +20% CRIT 3 tours',
    passive2: { trigger: 'always', type: 'commanderDef', allyDefBonus: 0.10 },
    passive4: { trigger: 'onBattleStart', type: 'commanderCrit', allyCritBonus: 20, duration: 3 },
  },
  voile_ombre: {
    id: 'voile_ombre', name: "Voile de l'Ombre", icon: '\uD83C\uDF2B\uFE0F', raid: true,
    color: 'text-gray-300', bg: 'bg-gray-500/15', border: 'border-gray-500/30',
    desc: "Insaisissable comme l'ombre",
    bonus2: {}, bonus2Desc: '12% chance esquiver une attaque',
    bonus4: {}, bonus4Desc: 'Si esquive, contre-attaque a 80% power',
    passive2: { trigger: 'onHit', type: 'dodge', chance: 0.12 },
    passive4: { trigger: 'onDodge', type: 'counter', powerMult: 0.80 },
  },
  source_arcanique: {
    id: 'source_arcanique', name: 'Source Arcanique', icon: '\uD83D\uDD2E', raid: true,
    color: 'text-violet-400', bg: 'bg-violet-500/15', border: 'border-violet-500/30',
    desc: 'Une source infinie de pouvoir arcane',
    bonus2: { manaPercent: 30 }, bonus2Desc: 'Mana Max +30%',
    bonus4: { manaRegen: 50, manaCostReduce: 20 }, bonus4Desc: 'Regen Mana +50%, cout -20%',
    passive2: null, passive4: null,
  },
  flamme_interieure: {
    id: 'flamme_interieure', name: 'Flamme Interieure', icon: '\uD83D\uDD25', raid: true,
    color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30',
    desc: 'Chaque coup attise la flamme',
    bonus2: {}, bonus2Desc: '+3% DMG par attaque (max 10 stacks)',
    bonus4: {}, bonus4Desc: 'A 10 stacks: crit garanti +50% DMG',
    passive2: { trigger: 'afterAttack', type: 'innerFlameStack', dmgPerStack: 0.03, maxStacks: 10 },
    passive4: { trigger: 'beforeAttack', type: 'innerFlameRelease', stackThreshold: 10, bonusCritDmg: 0.50, autoCrit: true },
  },
};

// All sets combined (for generation, bonuses, display)
export const ALL_ARTIFACT_SETS = { ...ARTIFACT_SETS, ...RAID_ARTIFACT_SETS };

// Get active passives from equipped artifacts
export function getActivePassives(equippedArtifacts) {
  if (!equippedArtifacts) return [];
  const setCounts = {};
  Object.values(equippedArtifacts).forEach(art => {
    if (!art) return;
    setCounts[art.set] = (setCounts[art.set] || 0) + 1;
  });
  const passives = [];
  Object.entries(setCounts).forEach(([setId, count]) => {
    const s = ALL_ARTIFACT_SETS[setId];
    if (!s) return;
    if (count >= 2 && s.passive2) passives.push({ ...s.passive2, setId, tier: 2 });
    if (count >= 4 && s.passive4) passives.push({ ...s.passive4, setId, tier: 4 });
  });
  return passives;
}

// Generate a raid-exclusive artifact
export function generateRaidArtifact(rarity) {
  const setKeys = Object.keys(RAID_ARTIFACT_SETS);
  const set = setKeys[Math.floor(Math.random() * setKeys.length)];
  const slot = SLOT_ORDER[Math.floor(Math.random() * SLOT_ORDER.length)];
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
    uid: `rart_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    set, slot, rarity,
    mainStat: mainStatId,
    mainValue: MAIN_STAT_VALUES[mainStatId].base,
    level: 0,
    subs,
    isRaid: true,
  };
}

// Generate a raid artifact for a specific tier (higher tiers = guaranteed raid-exclusive sets)
export function generateRaidArtifactFromTier(rarity, tier = 1) {
  // Tier 1 uses standard generateRaidArtifact
  if (tier <= 1) return generateRaidArtifact(rarity);
  // Tier 2+ always generates from raid-exclusive sets
  const setKeys = Object.keys(RAID_ARTIFACT_SETS);
  const set = setKeys[Math.floor(Math.random() * setKeys.length)];
  const slot = SLOT_ORDER[Math.floor(Math.random() * SLOT_ORDER.length)];
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
    // Higher tiers get slightly better sub-stat rolls
    const tierBonus = Math.min(tier - 1, 3);
    const value = pick.range[0] + tierBonus + Math.floor(Math.random() * (pick.range[1] - pick.range[0] + 1));
    subs.push({ id: pick.id, value });
  }

  return {
    uid: `rart_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    set, slot, rarity,
    mainStat: mainStatId,
    mainValue: MAIN_STAT_VALUES[mainStatId].base,
    level: 0,
    subs,
    isRaid: true,
    tier,
  };
}

// Daily raid constants
export const MAX_DAILY_RAIDS = 10;

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
  // Mana set bonuses
  manaPercent: 0, manaRegen: 0, manaCostReduce: 0,
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

  // Apply set bonuses (from all sets including raid)
  Object.entries(setCounts).forEach(([setId, count]) => {
    const setDef = ALL_ARTIFACT_SETS[setId];
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
    const s = ALL_ARTIFACT_SETS[setId];
    if (!s) return;
    if (count >= 2) active.push({ set: s, pieces: count, bonus: s.bonus2Desc, tier: 2, hasPassive: !!s.passive2 });
    if (count >= 4) active.push({ set: s, pieces: count, bonus: s.bonus4Desc, tier: 4, hasPassive: !!s.passive4 });
  });
  return active;
}

// ═══════════════════════════════════════════════════════════════
// WEAPONS
// ═══════════════════════════════════════════════════════════════

export const WEAPONS = {
  // Fire (5)
  w_lame_inferno:     { id: 'w_lame_inferno',     name: "Lame de l'Inferno",   rarity: 'mythique',   element: 'fire',   weaponType: 'blade',   atk: 25, bonusStat: 'crit_rate', bonusValue: 8,  icon: '\uD83D\uDDE1\uFE0F', desc: 'Forgee dans les flammes eternelles' },
  w_hache_volcanique: { id: 'w_hache_volcanique', name: 'Hache Volcanique',     rarity: 'legendaire', element: 'fire',   weaponType: 'heavy',   atk: 18, bonusStat: 'atk_pct',   bonusValue: 10, icon: '\uD83E\uDE93', desc: 'Lave solidifiee en acier' },
  w_arc_braise:       { id: 'w_arc_braise',       name: 'Arc de Braise',        rarity: 'legendaire', element: 'fire',   weaponType: 'ranged',  atk: 15, bonusStat: 'spd_flat',  bonusValue: 8,  icon: '\uD83C\uDFF9', desc: 'Fleches enflammees' },
  w_dague_pyrite:     { id: 'w_dague_pyrite',     name: 'Dague de Pyrite',      rarity: 'rare',       element: 'fire',   weaponType: 'blade',   atk: 10, bonusStat: 'crit_rate', bonusValue: 5,  icon: '\uD83D\uDDE1\uFE0F', desc: 'Lame incandescente' },
  w_marteau_forge:    { id: 'w_marteau_forge',    name: 'Marteau de la Forge',  rarity: 'rare',       element: 'fire',   weaponType: 'heavy',   atk: 12, bonusStat: 'def_pct',   bonusValue: 6,  icon: '\uD83D\uDD28', desc: 'Outil du forgeron ancestral' },

  // Water (5)
  w_trident_abyssal:  { id: 'w_trident_abyssal',  name: 'Trident Abyssal',     rarity: 'mythique',   element: 'water',  weaponType: 'polearm', atk: 22, bonusStat: 'atk_pct',   bonusValue: 12, icon: '\uD83D\uDD31', desc: 'Arme des profondeurs' },
  w_epee_glaciale:    { id: 'w_epee_glaciale',    name: 'Epee Glaciale',        rarity: 'legendaire', element: 'water',  weaponType: 'blade',   atk: 18, bonusStat: 'crit_dmg',  bonusValue: 12, icon: '\u2694\uFE0F', desc: 'Glace eternelle tranchante' },
  w_arc_tsunami:      { id: 'w_arc_tsunami',      name: 'Arc du Tsunami',       rarity: 'legendaire', element: 'water',  weaponType: 'ranged',  atk: 16, bonusStat: 'spd_flat',  bonusValue: 10, icon: '\uD83C\uDFF9', desc: 'Fleches de maree' },
  w_lance_corail:     { id: 'w_lance_corail',     name: 'Lance de Corail',      rarity: 'rare',       element: 'water',  weaponType: 'polearm', atk: 11, bonusStat: 'hp_pct',    bonusValue: 8,  icon: '\uD83D\uDDE1\uFE0F', desc: 'Durcie par les abysses' },
  w_baton_brume:      { id: 'w_baton_brume',      name: 'Baton de Brume',       rarity: 'rare',       element: 'water',  weaponType: 'ranged',  atk: 9,  bonusStat: 'res_flat',   bonusValue: 6,  icon: '\uD83E\uDE84', desc: 'Canalise les brumes marines' },

  // Shadow (5)
  w_faux_monarque:    { id: 'w_faux_monarque',    name: 'Faux du Monarque',     rarity: 'mythique',   element: 'shadow', weaponType: 'polearm', atk: 28, bonusStat: 'crit_dmg',  bonusValue: 15, icon: '\u2694\uFE0F', desc: "L'arme du Roi des Ombres" },
  w_katana_void:      { id: 'w_katana_void',      name: 'Katana du Void',       rarity: 'mythique',   element: 'shadow', weaponType: 'blade',   atk: 24, bonusStat: 'crit_rate', bonusValue: 10, icon: '\uD83D\uDDE1\uFE0F', desc: 'Tranche la realite' },
  w_griffe_nuit:      { id: 'w_griffe_nuit',      name: 'Griffe de la Nuit',    rarity: 'legendaire', element: 'shadow', weaponType: 'polearm', atk: 17, bonusStat: 'spd_flat',  bonusValue: 10, icon: '\uD83D\uDDE1\uFE0F', desc: "Rapide comme l'ombre" },
  w_masse_tenebres:   { id: 'w_masse_tenebres',   name: 'Masse des Tenebres',  rarity: 'legendaire', element: 'shadow', weaponType: 'heavy',   atk: 20, bonusStat: 'hp_pct',    bonusValue: 10, icon: '\uD83D\uDD28', desc: "Poids de l'obscurite" },
  w_dague_ombre:      { id: 'w_dague_ombre',      name: "Dague d'Ombre",        rarity: 'rare',       element: 'shadow', weaponType: 'blade',   atk: 10, bonusStat: 'atk_pct',   bonusValue: 6,  icon: '\uD83D\uDDE1\uFE0F', desc: 'Lame des assassins' },

  // Neutral (3)
  w_epee_ancienne:    { id: 'w_epee_ancienne',    name: 'Epee Ancienne',        rarity: 'legendaire', element: null,     weaponType: 'blade',   atk: 16, bonusStat: 'atk_pct',   bonusValue: 8,  icon: '\u2694\uFE0F', desc: "Arme d'une ere oubliee" },
  w_baguette_sage:    { id: 'w_baguette_sage',    name: 'Baguette du Sage',     rarity: 'rare',       element: null,     weaponType: 'ranged',  atk: 8,  bonusStat: 'crit_rate', bonusValue: 5,  icon: '\uD83E\uDE84', desc: 'Sagesse cristallisee' },
  w_bouclier_hero:    { id: 'w_bouclier_hero',    name: 'Bouclier du Heros',    rarity: 'rare',       element: null,     weaponType: 'shield',  atk: 6,  bonusStat: 'def_pct',   bonusValue: 10, icon: '\uD83D\uDEE1\uFE0F', desc: 'Protection legendaire' },

  // Secret — drop 1/30000 from Ragnarok
  w_sulfuras:         { id: 'w_sulfuras',         name: 'Masse de Sulfuras',    rarity: 'mythique',   element: 'fire',   weaponType: 'heavy',   atk: 250, bonusStat: 'atk_pct', bonusValue: 25, icon: '\uD83D\uDD28', desc: '???', secret: true, passive: 'sulfuras_fury', fireRes: 50 },
};

export const WEAPON_PRICES = { rare: 500, legendaire: 2000, mythique: 5000 };

// ═══════════════════════════════════════════════════════════════
// WEAPON AWAKENING SYSTEM (A0-A10)
// A0 = base, A1-A5 = unique passives, A6-A10 = +3% ATK/DEF/HP each
// ═══════════════════════════════════════════════════════════════

export const MAX_WEAPON_AWAKENING = 10;
const AW_PASSIVE_CAP = 5; // A1-A5 have unique passives
const AW_FLAT_BONUS = 3;  // A6-A10: +3% ATK, DEF, HP each

export const WEAPON_AWAKENING_PASSIVES = {
  // ── FIRE ──
  w_lame_inferno: [
    { desc: 'Degats Feu +8%', stats: { fireDamage: 8 } },
    { desc: 'CRIT +5%', stats: { crit_rate: 5 } },
    { desc: 'CRIT DMG +12%', stats: { crit_dmg: 12 } },
    { desc: 'ATK +8%', stats: { atk_pct: 8 } },
    { desc: 'Ignore 10% DEF', stats: { defPen: 10 } },
  ],
  w_hache_volcanique: [
    { desc: 'ATK +6%', stats: { atk_pct: 6 } },
    { desc: 'Degats Feu +6%', stats: { fireDamage: 6 } },
    { desc: 'PV +8%', stats: { hp_pct: 8 } },
    { desc: 'CRIT DMG +8%', stats: { crit_dmg: 8 } },
    { desc: 'DEF +6%', stats: { def_pct: 6 } },
  ],
  w_arc_braise: [
    { desc: 'SPD +4', stats: { spd_flat: 4 } },
    { desc: 'Degats Feu +5%', stats: { fireDamage: 5 } },
    { desc: 'CRIT +4%', stats: { crit_rate: 4 } },
    { desc: 'ATK +6%', stats: { atk_pct: 6 } },
    { desc: 'Tous Degats +5%', stats: { allDamage: 5 } },
  ],
  w_dague_pyrite: [
    { desc: 'CRIT +3%', stats: { crit_rate: 3 } },
    { desc: 'ATK +4%', stats: { atk_pct: 4 } },
    { desc: 'Degats Feu +4%', stats: { fireDamage: 4 } },
    { desc: 'SPD +3', stats: { spd_flat: 3 } },
    { desc: 'CRIT DMG +5%', stats: { crit_dmg: 5 } },
  ],
  w_marteau_forge: [
    { desc: 'DEF +4%', stats: { def_pct: 4 } },
    { desc: 'PV +5%', stats: { hp_pct: 5 } },
    { desc: 'Degats Feu +3%', stats: { fireDamage: 3 } },
    { desc: 'ATK +4%', stats: { atk_pct: 4 } },
    { desc: 'RES +3', stats: { res_flat: 3 } },
  ],
  // ── WATER ──
  w_trident_abyssal: [
    { desc: 'Degats Eau +10%', stats: { waterDamage: 10 } },
    { desc: 'ATK +8%', stats: { atk_pct: 8 } },
    { desc: 'CRIT DMG +10%', stats: { crit_dmg: 10 } },
    { desc: 'Ignore 8% DEF', stats: { defPen: 8 } },
    { desc: 'Tous Degats +8%', stats: { allDamage: 8 } },
  ],
  w_epee_glaciale: [
    { desc: 'CRIT DMG +8%', stats: { crit_dmg: 8 } },
    { desc: 'Degats Eau +6%', stats: { waterDamage: 6 } },
    { desc: 'ATK +6%', stats: { atk_pct: 6 } },
    { desc: 'CRIT +5%', stats: { crit_rate: 5 } },
    { desc: 'Ignore 6% DEF', stats: { defPen: 6 } },
  ],
  w_arc_tsunami: [
    { desc: 'SPD +5', stats: { spd_flat: 5 } },
    { desc: 'Degats Eau +5%', stats: { waterDamage: 5 } },
    { desc: 'ATK +6%', stats: { atk_pct: 6 } },
    { desc: 'CRIT +4%', stats: { crit_rate: 4 } },
    { desc: 'Tous Degats +5%', stats: { allDamage: 5 } },
  ],
  w_lance_corail: [
    { desc: 'PV +5%', stats: { hp_pct: 5 } },
    { desc: 'Degats Eau +4%', stats: { waterDamage: 4 } },
    { desc: 'DEF +4%', stats: { def_pct: 4 } },
    { desc: 'ATK +3%', stats: { atk_pct: 3 } },
    { desc: 'RES +3', stats: { res_flat: 3 } },
  ],
  w_baton_brume: [
    { desc: 'RES +3', stats: { res_flat: 3 } },
    { desc: 'Degats Eau +3%', stats: { waterDamage: 3 } },
    { desc: 'PV +4%', stats: { hp_pct: 4 } },
    { desc: 'DEF +3%', stats: { def_pct: 3 } },
    { desc: 'SPD +3', stats: { spd_flat: 3 } },
  ],
  // ── SHADOW ──
  w_faux_monarque: [
    { desc: 'Degats Ombre +10%', stats: { shadowDamage: 10 } },
    { desc: 'CRIT DMG +10%', stats: { crit_dmg: 10 } },
    { desc: 'ATK +10%', stats: { atk_pct: 10 } },
    { desc: 'Ignore 10% DEF', stats: { defPen: 10 } },
    { desc: 'Tous Degats +10%', stats: { allDamage: 10 } },
  ],
  w_katana_void: [
    { desc: 'CRIT +8%', stats: { crit_rate: 8 } },
    { desc: 'Degats Ombre +8%', stats: { shadowDamage: 8 } },
    { desc: 'CRIT DMG +12%', stats: { crit_dmg: 12 } },
    { desc: 'ATK +8%', stats: { atk_pct: 8 } },
    { desc: 'Ignore 8% DEF', stats: { defPen: 8 } },
  ],
  w_griffe_nuit: [
    { desc: 'SPD +5', stats: { spd_flat: 5 } },
    { desc: 'Degats Ombre +6%', stats: { shadowDamage: 6 } },
    { desc: 'CRIT +5%', stats: { crit_rate: 5 } },
    { desc: 'ATK +6%', stats: { atk_pct: 6 } },
    { desc: 'Tous Degats +5%', stats: { allDamage: 5 } },
  ],
  w_masse_tenebres: [
    { desc: 'PV +8%', stats: { hp_pct: 8 } },
    { desc: 'Degats Ombre +6%', stats: { shadowDamage: 6 } },
    { desc: 'DEF +6%', stats: { def_pct: 6 } },
    { desc: 'ATK +6%', stats: { atk_pct: 6 } },
    { desc: 'Tous Degats +5%', stats: { allDamage: 5 } },
  ],
  w_dague_ombre: [
    { desc: 'ATK +4%', stats: { atk_pct: 4 } },
    { desc: 'Degats Ombre +4%', stats: { shadowDamage: 4 } },
    { desc: 'CRIT +3%', stats: { crit_rate: 3 } },
    { desc: 'SPD +3', stats: { spd_flat: 3 } },
    { desc: 'CRIT DMG +5%', stats: { crit_dmg: 5 } },
  ],
  // ── NEUTRAL ──
  w_epee_ancienne: [
    { desc: 'ATK +6%', stats: { atk_pct: 6 } },
    { desc: 'Tous Degats +5%', stats: { allDamage: 5 } },
    { desc: 'CRIT +5%', stats: { crit_rate: 5 } },
    { desc: 'CRIT DMG +8%', stats: { crit_dmg: 8 } },
    { desc: 'DEF +5%', stats: { def_pct: 5 } },
  ],
  w_baguette_sage: [
    { desc: 'CRIT +3%', stats: { crit_rate: 3 } },
    { desc: 'Tous Degats +3%', stats: { allDamage: 3 } },
    { desc: 'ATK +3%', stats: { atk_pct: 3 } },
    { desc: 'SPD +3', stats: { spd_flat: 3 } },
    { desc: 'PV +4%', stats: { hp_pct: 4 } },
  ],
  w_bouclier_hero: [
    { desc: 'DEF +5%', stats: { def_pct: 5 } },
    { desc: 'PV +5%', stats: { hp_pct: 5 } },
    { desc: 'RES +3', stats: { res_flat: 3 } },
    { desc: 'ATK +3%', stats: { atk_pct: 3 } },
    { desc: 'Tous Degats +3%', stats: { allDamage: 3 } },
  ],
  // ── SECRET ──
  w_sulfuras: [
    { desc: 'Degats Feu +15%', stats: { fireDamage: 15 } },
    { desc: 'ATK +12%', stats: { atk_pct: 12 } },
    { desc: 'CRIT +10%', stats: { crit_rate: 10 } },
    { desc: 'CRIT DMG +20%', stats: { crit_dmg: 20 } },
    { desc: 'Ignore 15% DEF + Tous Degats +10%', stats: { defPen: 15, allDamage: 10 } },
  ],
};

export function getWeaponAwakeningBonuses(weaponId, awakening = 0) {
  const b = { atk_pct: 0, def_pct: 0, hp_pct: 0, crit_rate: 0, crit_dmg: 0, spd_flat: 0, res_flat: 0, fireDamage: 0, waterDamage: 0, shadowDamage: 0, allDamage: 0, defPen: 0 };
  if (!weaponId || awakening <= 0) return b;
  const passives = WEAPON_AWAKENING_PASSIVES[weaponId] || [];
  for (let i = 0; i < Math.min(awakening, AW_PASSIVE_CAP); i++) {
    if (passives[i]?.stats) {
      Object.entries(passives[i].stats).forEach(([k, v]) => { if (b[k] !== undefined) b[k] += v; });
    }
  }
  const flatLevels = Math.max(0, awakening - AW_PASSIVE_CAP);
  b.atk_pct += flatLevels * AW_FLAT_BONUS;
  b.def_pct += flatLevels * AW_FLAT_BONUS;
  b.hp_pct += flatLevels * AW_FLAT_BONUS;
  return b;
}

export function computeWeaponBonuses(weaponId, awakening = 0) {
  const b = { atk_flat: 0, atk_pct: 0, def_pct: 0, hp_pct: 0, spd_flat: 0, crit_rate: 0, crit_dmg: 0, res_flat: 0, fireDamage: 0, waterDamage: 0, shadowDamage: 0, allDamage: 0, defPen: 0 };
  if (!weaponId) return b;
  const w = WEAPONS[weaponId];
  if (!w) return b;
  b.atk_flat += w.atk;
  if (b[w.bonusStat] !== undefined) b[w.bonusStat] += w.bonusValue;
  if (w.fireRes) b.res_flat += w.fireRes;
  if (awakening > 0) {
    const awB = getWeaponAwakeningBonuses(weaponId, awakening);
    Object.entries(awB).forEach(([k, v]) => { if (b[k] !== undefined) b[k] += v; });
  }
  return b;
}

// Sulfuras stacking passive: +33% dmg per turn (max +100%)
export const SULFURAS_STACK_PER_TURN = 33;
export const SULFURAS_STACK_MAX = 100;

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

// ═══════════════════════════════════════════════════════════════
// WEAPON DROP TABLES (Colosseum stages + Raids)
// ═══════════════════════════════════════════════════════════════

export const COLOSSEUM_WEAPON_DROP = {
  dropChance: { 1: 0.03, 2: 0.05, 3: 0.07, 4: 0.07, 5: 0.10, 6: 0.10 },
  bossMultiplier: 1.5,
  tierPool: {
    1: ['rare'], 2: ['rare'],
    3: ['rare', 'legendaire'], 4: ['rare', 'legendaire'],
    5: ['legendaire', 'mythique'], 6: ['legendaire', 'mythique'],
  },
};

export const RAID_WEAPON_DROP = {
  dropChance: { 1: 0.10, 2: 0.15, 3: 0.20, 4: 0.25, 5: 0.30 },
  fullClearGuaranteed: true,
  tierPool: {
    1: ['rare', 'legendaire'], 2: ['legendaire'],
    3: ['legendaire', 'mythique'], 4: ['mythique'], 5: ['mythique'],
  },
};

export function rollWeaponDrop(stageTier, isBoss = false) {
  const baseChance = COLOSSEUM_WEAPON_DROP.dropChance[stageTier] || 0.03;
  const chance = isBoss ? baseChance * COLOSSEUM_WEAPON_DROP.bossMultiplier : baseChance;
  if (Math.random() > chance) return null;
  const rarityPool = COLOSSEUM_WEAPON_DROP.tierPool[stageTier] || ['rare'];
  const rarity = rarityPool[Math.floor(Math.random() * rarityPool.length)];
  const candidates = Object.values(WEAPONS).filter(w => !w.secret && w.rarity === rarity);
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)].id;
}

// ═══════════════════════════════════════════════════════════════
// iLEVEL SYSTEM — Power rating for items
// ═══════════════════════════════════════════════════════════════

const RARITY_BASE_ILVL = { rare: 10, legendaire: 30, mythique: 60 };

export function computeWeaponILevel(weaponId, awakening = 0) {
  const w = WEAPONS[weaponId];
  if (!w) return 0;
  const base = w.secret ? 100 : (RARITY_BASE_ILVL[w.rarity] || 10);
  return base + Math.floor(w.atk * 1.5) + w.bonusValue + awakening * 8;
}

export function computeArtifactILevel(art) {
  if (!art) return 0;
  const base = RARITY_BASE_ILVL[art.rarity] || 10;
  const levelBonus = (art.level || 0) * 3;
  const subScore = (art.subs || []).reduce((sum, s) => sum + Math.floor(s.value * 0.8), 0);
  return base + levelBonus + subScore;
}

export function computeEquipILevel(equippedArtifacts, weaponId, weaponAwakening = 0) {
  let total = 0;
  let count = 0;
  if (equippedArtifacts) {
    Object.values(equippedArtifacts).forEach(art => {
      if (art) { total += computeArtifactILevel(art); count++; }
    });
  }
  if (weaponId) { total += computeWeaponILevel(weaponId, weaponAwakening); count++; }
  return { total, avg: count > 0 ? Math.floor(total / count) : 0, count };
}

export function rollRaidWeaponDrop(raidTier, isFullClear = false) {
  if (isFullClear && RAID_WEAPON_DROP.fullClearGuaranteed) {
    const rarityPool = RAID_WEAPON_DROP.tierPool[raidTier] || ['rare'];
    const rarity = rarityPool[Math.floor(Math.random() * rarityPool.length)];
    const candidates = Object.values(WEAPONS).filter(w => !w.secret && w.rarity === rarity);
    return candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)].id : null;
  }
  const chance = RAID_WEAPON_DROP.dropChance[raidTier] || 0.10;
  if (Math.random() > chance) return null;
  const rarityPool = RAID_WEAPON_DROP.tierPool[raidTier] || ['rare'];
  const rarity = rarityPool[Math.floor(Math.random() * rarityPool.length)];
  const candidates = Object.values(WEAPONS).filter(w => !w.secret && w.rarity === rarity);
  return candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)].id : null;
}