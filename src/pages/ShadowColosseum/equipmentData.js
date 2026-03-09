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

// All sets combined (for generation, bonuses, display) — ARC2 added below after its definition
export let ALL_ARTIFACT_SETS = { ...ARTIFACT_SETS, ...RAID_ARTIFACT_SETS };

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
    if (count >= 8 && s.passive8) passives.push({ ...s.passive8, setId, tier: 8 });
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
  casque:   { id: 'casque',   name: 'Casque',              icon: '\u26D1\uFE0F', mainStats: ['hp_flat', 'hp_pct', 'int_flat', 'int_pct', 'atk_flat', 'atk_pct', 'def_flat', 'def_pct'] },
  plastron: { id: 'plastron', name: 'Plastron',            icon: '\uD83E\uDDBA', mainStats: ['atk_flat', 'atk_pct', 'int_flat', 'int_pct'] },
  gants:    { id: 'gants',    name: 'Gants',               icon: '\uD83E\uDDE4', mainStats: ['crit_rate', 'crit_dmg'] },
  bottes:   { id: 'bottes',   name: 'Bottes',              icon: '\uD83D\uDC62', mainStats: ['crit_dmg', 'crit_rate', 'spd_flat'] },
  collier:  { id: 'collier',  name: 'Collier',             icon: '\uD83D\uDCFF', mainStats: ['hp_pct', 'atk_pct', 'def_pct', 'int_pct', 'fire_dmg_pct', 'water_dmg_pct', 'shadow_dmg_pct', 'light_dmg_pct', 'earth_dmg_pct'] },
  bracelet: { id: 'bracelet', name: 'Bracelet',            icon: '\u231A', mainStats: ['atk_pct', 'def_pct', 'int_pct'] },
  anneau:   { id: 'anneau',   name: 'Anneau',              icon: '\uD83D\uDC8D', mainStats: ['crit_rate', 'crit_dmg', 'res_flat'] },
  boucles:  { id: 'boucles',  name: "Boucles d'oreilles",  icon: '\u2728', mainStats: ['hp_pct', 'atk_pct', 'def_pct', 'int_pct'] },
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
  def_flat:  { name: 'DEF',       base: 3,   perLevel: 1.5, icon: '\uD83D\uDEE1\uFE0F' },
  int_flat:  { name: 'INT',       base: 3,   perLevel: 2,   icon: '\uD83E\uDDE0' },
  int_pct:   { name: 'INT%',      base: 3,   perLevel: 2,   icon: '\uD83E\uDDE0' },
  fire_dmg_flat:   { name: 'DMG Feu',      base: 3,  perLevel: 2,   icon: '\uD83D\uDD25' },
  fire_dmg_pct:    { name: 'DMG Feu%',     base: 3,  perLevel: 1.5, icon: '\uD83D\uDD25' },
  water_dmg_flat:  { name: 'DMG Eau',      base: 3,  perLevel: 2,   icon: '\uD83D\uDCA7' },
  water_dmg_pct:   { name: 'DMG Eau%',     base: 3,  perLevel: 1.5, icon: '\uD83D\uDCA7' },
  shadow_dmg_flat: { name: 'DMG Ombre',    base: 3,  perLevel: 2,   icon: '\uD83C\uDF11' },
  shadow_dmg_pct:  { name: 'DMG Ombre%',   base: 3,  perLevel: 1.5, icon: '\uD83C\uDF11' },
  light_dmg_flat:  { name: 'DMG Lumiere',  base: 3,  perLevel: 2,   icon: '\u2728' },
  light_dmg_pct:   { name: 'DMG Lumiere%', base: 3,  perLevel: 1.5, icon: '\u2728' },
  earth_dmg_flat:  { name: 'DMG Terre',    base: 3,  perLevel: 2,   icon: '\uD83E\uDEA8' },
  earth_dmg_pct:   { name: 'DMG Terre%',   base: 3,  perLevel: 1.5, icon: '\uD83E\uDEA8' },
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
  { id: 'int_flat',  name: 'INT',      range: [1, 4] },
  { id: 'int_pct',   name: 'INT%',     range: [2, 5] },
  { id: 'fire_dmg_flat',   name: 'DMG Feu',      range: [1, 3] },
  { id: 'fire_dmg_pct',    name: 'DMG Feu%',     range: [2, 5] },
  { id: 'water_dmg_flat',  name: 'DMG Eau',      range: [1, 3] },
  { id: 'water_dmg_pct',   name: 'DMG Eau%',     range: [2, 5] },
  { id: 'shadow_dmg_flat', name: 'DMG Ombre',    range: [1, 3] },
  { id: 'shadow_dmg_pct',  name: 'DMG Ombre%',   range: [2, 5] },
  { id: 'light_dmg_flat',  name: 'DMG Lumiere',  range: [1, 3] },
  { id: 'light_dmg_pct',   name: 'DMG Lumiere%', range: [2, 5] },
  { id: 'earth_dmg_flat',  name: 'DMG Terre',    range: [1, 3] },
  { id: 'earth_dmg_pct',   name: 'DMG Terre%',   range: [2, 5] },
];

export const RARITY_SUB_COUNT = {
  rare:       { initial: 4, max: 4 },
  legendaire: { initial: 4, max: 4 },
  mythique:   { initial: 4, max: 4 },
};

// ═══════════════════════════════════════════════════════════════
// HAMMERS (Enhancement consumables)
// ═══════════════════════════════════════════════════════════════

export const HAMMERS = {
  marteau_forge:   { id: 'marteau_forge',   name: 'Marteau de Forge',   icon: '\uD83D\uDD28', rarity: 'common',    maxLevel: 10, shopPrice: 100,  desc: 'Ameliore un artefact (Lv0-10)' },
  marteau_runique: { id: 'marteau_runique', name: 'Marteau Runique',    icon: '\uD83D\uDD2E', rarity: 'rare',      maxLevel: 15, shopPrice: 300,  desc: 'Ameliore un artefact (Lv0-15)' },
  marteau_celeste: { id: 'marteau_celeste', name: 'Marteau Celeste',    icon: '\u2728',       rarity: 'epic',      maxLevel: 20, shopPrice: 800,  desc: 'Ameliore un artefact (Lv0-20)' },
  marteau_rouge:   { id: 'marteau_rouge',   name: 'Marteau Rouge',      icon: '\uD83D\uDD34', rarity: 'legendary', desc: 'Monnaie echangeable contre des armes exclusives' },

  // ── Secret Weapon Fragments (10 needed to forge) ──
  fragment_sulfuras:   { id: 'fragment_sulfuras',   name: 'Fragment de Sulfuras',   icon: '\uD83D\uDD25', rarity: 'secret', desc: '10 fragments forgent la Masse de Sulfuras' },
  fragment_raeshalare: { id: 'fragment_raeshalare', name: "Fragment de Rae'shalare", icon: '\uD83C\uDF00', rarity: 'secret', desc: "10 fragments forgent l'Arc Rae'shalare" },
  fragment_katana_z:   { id: 'fragment_katana_z',   name: 'Fragment de Katana Z',   icon: '\u26A1',       rarity: 'secret', desc: '10 fragments forgent le Katana Z' },
  fragment_katana_v:   { id: 'fragment_katana_v',   name: 'Fragment de Katana V',   icon: '\uD83D\uDC9A', rarity: 'secret', desc: '10 fragments forgent le Katana V' },
  fragment_guldan:     { id: 'fragment_guldan',     name: "Fragment de Gul'dan",    icon: '\uD83C\uDF00', rarity: 'secret', desc: "10 fragments forgent le Baton de Gul'dan" },
};

export const HAMMER_ORDER = ['marteau_forge', 'marteau_runique', 'marteau_celeste'];

// Red hammer reward when dropping a weapon already at A10
export const RED_HAMMER_BY_RARITY = { rare: 1, legendaire: 2, mythique: 3 };
export const RED_HAMMER_ULTIME = 5;   // ultime or secret weapons give 5

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
export const MAX_ARTIFACT_INVENTORY = 1500;

// Expedition artifacts get +30% on all stat rolls (mainStat base/perLevel, sub ranges, enchant bonuses)
const EXPEDITION_BONUS = 1.3;

/** Trim artifact inventory to MAX_ARTIFACT_INVENTORY. Removes lowest-scored unlocked artifacts first. */
export function trimArtifactInventory(inventory) {
  if (!inventory || inventory.length <= MAX_ARTIFACT_INVENTORY) return inventory;
  // Score all artifacts (higher = better)
  const scored = inventory.map((art, i) => ({ art, i, score: scoreArtifact(art, 'dps'), protected: art.locked || art.highlighted }));
  // Sort: protected first, then by score descending
  scored.sort((a, b) => {
    if (a.protected && !b.protected) return -1;
    if (!a.protected && b.protected) return 1;
    return b.score - a.score;
  });
  // Keep top MAX_ARTIFACT_INVENTORY
  const kept = scored.slice(0, MAX_ARTIFACT_INVENTORY).map(s => s.art);
  const removed = scored.length - kept.length;
  if (removed > 0) console.log(`[Inventory] Auto-cleaned ${removed} low-score artifacts (limit: ${MAX_ARTIFACT_INVENTORY})`);
  return kept;
}

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
  const newLevel = artifact.level + 1;
  const expMult = artifact.source === 'expedition' ? EXPEDITION_BONUS : 1;

  // MainStat grows every level (base + perLevel * level)
  const mainDef = MAIN_STAT_VALUES[artifact.mainStat];
  const newMainValue = mainDef
    ? +((mainDef.base + mainDef.perLevel * newLevel) * expMult).toFixed(1)
    : artifact.mainValue; // safety: keep current value if mainStat ID unknown

  // Subs: deep copy, IDs never change
  const newSubs = artifact.subs.map(s => ({ ...s }));

  // Milestones +5, +10, +15, +20: random sub gets a bonus roll
  if (newLevel % 5 === 0 && newSubs.length > 0) {
    const idx = Math.floor(Math.random() * newSubs.length);
    const subDef = SUB_STAT_POOL.find(s => s.id === newSubs[idx].id);
    if (subDef) {
      const milestone = Math.floor(newLevel / 5); // 1, 2, 3, 4
      const bonusMult = 1 + (milestone - 1) * 0.25; // 1x, 1.25x, 1.5x, 1.75x
      const baseRoll = subDef.range[0] + Math.floor(Math.random() * (subDef.range[1] - subDef.range[0] + 1));
      const roll = Math.ceil(baseRoll * bonusMult * expMult);
      newSubs[idx] = { ...newSubs[idx], value: newSubs[idx].value + roll };
    }
  }

  return { ...artifact, level: newLevel, mainValue: newMainValue, subs: newSubs };
}

// ═══════════════════════════════════════════════════════════════
// ARTIFACT REROLL (Alkahest System)
// ═══════════════════════════════════════════════════════════════

export const REROLL_ALKAHEST_COST = 10;
export const REROLL_LOCK_COSTS = [10, 22, 45, 70, 100]; // index = number of locked stats (0-4)
export const REROLL_BASE_COIN_COST = 10000;

/** Coin cost for rerolling an artifact (linear: 10k + 10k per reroll). */
export function getRerollCoinCost(rerollCount) {
  return REROLL_BASE_COIN_COST + REROLL_BASE_COIN_COST * rerollCount;
}

/** Reroll all sub-stats on an artifact. Keeps set/slot/rarity/mainStat. Resets level to 0. */
export function rerollArtifact(artifact) {
  const expMult = artifact.source === 'expedition' ? EXPEDITION_BONUS : 1;
  const subCount = RARITY_SUB_COUNT[artifact.rarity].initial;
  const available = SUB_STAT_POOL.filter(s => s.id !== artifact.mainStat);
  const subs = [];
  const used = new Set();
  for (let i = 0; i < subCount; i++) {
    const cands = available.filter(s => !used.has(s.id));
    if (!cands.length) break;
    const pick = cands[Math.floor(Math.random() * cands.length)];
    used.add(pick.id);
    const baseVal = pick.range[0] + Math.floor(Math.random() * (pick.range[1] - pick.range[0] + 1));
    subs.push({ id: pick.id, value: Math.ceil(baseVal * expMult) });
  }
  const mainBase = MAIN_STAT_VALUES[artifact.mainStat].base;
  return { ...artifact, level: 0, mainValue: +(mainBase * expMult).toFixed(1), subs };
}

// ═══════════════════════════════════════════════════════════════
// ENCHANTMENT SYSTEM
// ═══════════════════════════════════════════════════════════════

export const ENCHANT_ALKAHEST_COST = 10;
const ENCHANT_PCT_RANGE = [0.10, 0.30]; // +10% to +30% for percentage stats
const ENCHANT_FLAT_RANGE = [0.10, 0.50]; // +10% to +50% for flat stats
const FLAT_STATS = new Set(['hp_flat', 'atk_flat', 'def_flat', 'spd_flat', 'res_flat', 'int_flat', 'fire_dmg_flat', 'water_dmg_flat', 'shadow_dmg_flat', 'light_dmg_flat', 'earth_dmg_flat']);

// Expanded main stat pool for re-rolling (no slot restriction)
export const ENCHANT_MAIN_STAT_POOL = [
  'hp_flat', 'hp_pct', 'atk_flat', 'atk_pct',
  'crit_rate', 'crit_dmg', 'res_flat',
  'def_flat', 'def_pct', 'spd_flat',
  'int_flat', 'int_pct',
  'fire_dmg_flat', 'fire_dmg_pct', 'water_dmg_flat', 'water_dmg_pct',
  'shadow_dmg_flat', 'shadow_dmg_pct', 'light_dmg_flat', 'light_dmg_pct',
  'earth_dmg_flat', 'earth_dmg_pct',
];

/** Roll enchant bonus for a stat value. Returns the bonus amount. */
function rollEnchantBonus(statId, baseValue) {
  const range = FLAT_STATS.has(statId) ? ENCHANT_FLAT_RANGE : ENCHANT_PCT_RANGE;
  const mult = range[0] + Math.random() * (range[1] - range[0]);
  return Math.round(baseValue * mult * 10) / 10; // 1 decimal
}

/**
 * Enchant a single stat on an artifact (main or sub).
 * statKey = 'main' for mainStat, or a sub.id like 'atk_pct'
 * Re-enchanting re-rolls (can go up or down).
 */
export function enchantArtifactStat(artifact, statKey) {
  const expMult = artifact.source === 'expedition' ? EXPEDITION_BONUS : 1;
  const enchants = { main: artifact.enchants?.main || 0, subs: { ...(artifact.enchants?.subs || {}) } };

  if (statKey === 'main') {
    const previousBonus = enchants.main || 0;
    const bonus = +(rollEnchantBonus(artifact.mainStat, artifact.mainValue) * expMult).toFixed(1);
    enchants.main = bonus;
    return { artifact: { ...artifact, enchants }, bonus, previousBonus };
  } else {
    const sub = artifact.subs.find(s => s.id === statKey);
    if (!sub) return { artifact, bonus: 0, previousBonus: 0 };
    const previousBonus = enchants.subs[statKey] || 0;
    const bonus = +(rollEnchantBonus(statKey, sub.value) * expMult).toFixed(1);
    enchants.subs[statKey] = bonus;
    return { artifact: { ...artifact, enchants }, bonus, previousBonus };
  }
}

/**
 * Re-roll the mainStat of a set artifact. Picks random from ENCHANT_MAIN_STAT_POOL.
 * Resets main enchant to 0. Keeps subs/enchants on subs.
 */
export function rerollArtifactMainStat(artifact) {
  const expMult = artifact.source === 'expedition' ? EXPEDITION_BONUS : 1;
  const pool = ENCHANT_MAIN_STAT_POOL.filter(s => s !== artifact.mainStat);
  const newMainStat = pool[Math.floor(Math.random() * pool.length)];
  const def = MAIN_STAT_VALUES[newMainStat];
  const newMainValue = +((def.base + def.perLevel * artifact.level) * expMult).toFixed(1);
  const enchants = { main: 0, subs: { ...(artifact.enchants?.subs || {}) } };
  return {
    artifact: { ...artifact, mainStat: newMainStat, mainValue: newMainValue, enchants },
    oldMainStat: artifact.mainStat,
    newMainStat,
  };
}

/**
 * Full reroll: main stat + all sub-stats + reset level + clear enchants.
 * No duplicates between main and subs.
 */
export function rerollArtifactFull(artifact, lockedStats = new Set()) {
  const expMult = artifact.source === 'expedition' ? EXPEDITION_BONUS : 1;
  // Main stat: keep if locked, otherwise reroll from slot-specific pool
  let newMainStat = artifact.mainStat;
  let newMainValue = artifact.mainValue;
  if (!lockedStats.has('main')) {
    const slotId = artifact.slot || artifact.slotId;
    const slotPool = (slotId && ARTIFACT_SLOTS[slotId]?.mainStats) || ENCHANT_MAIN_STAT_POOL;
    const lockedSubIds = new Set(artifact.subs.filter(s => lockedStats.has(s.id)).map(s => s.id));
    const mainPool = slotPool.filter(s => s !== artifact.mainStat && !lockedSubIds.has(s));
    if (mainPool.length > 0) {
      newMainStat = mainPool[Math.floor(Math.random() * mainPool.length)];
    }
    const def = MAIN_STAT_VALUES[newMainStat];
    newMainValue = def ? +(def.base * expMult).toFixed(1) : artifact.mainValue;
  }

  // Subs: keep locked ones, reroll the rest
  const lockedSubs = artifact.subs.filter(s => lockedStats.has(s.id));
  const subCount = RARITY_SUB_COUNT[artifact.rarity].initial;
  const rerollCount = subCount - lockedSubs.length;
  const usedIds = new Set([newMainStat, ...lockedSubs.map(s => s.id)]);
  const available = SUB_STAT_POOL.filter(s => !usedIds.has(s.id));
  const newRerolled = [];
  for (let i = 0; i < rerollCount; i++) {
    const cands = available.filter(s => !usedIds.has(s.id));
    if (!cands.length) break;
    const pick = cands[Math.floor(Math.random() * cands.length)];
    usedIds.add(pick.id);
    const baseVal = pick.range[0] + Math.floor(Math.random() * (pick.range[1] - pick.range[0] + 1));
    newRerolled.push({ id: pick.id, value: Math.ceil(baseVal * expMult) });
  }
  const subs = [...lockedSubs, ...newRerolled];

  // Enchants: preserve for locked stats, reset for rerolled ones
  const newEnchants = {
    main: lockedStats.has('main') ? (artifact.enchants?.main || 0) : 0,
    subs: {}
  };
  subs.forEach(sub => {
    newEnchants.subs[sub.id] = lockedStats.has(sub.id) ? (artifact.enchants?.subs?.[sub.id] || 0) : 0;
  });

  // Level always resets to 0, main value resets to base
  if (lockedStats.has('main')) {
    const def = MAIN_STAT_VALUES[newMainStat];
    newMainValue = def ? +(def.base * expMult).toFixed(1) : newMainValue;
  }

  // Preserve statLocks for locked stats, clear for rerolled ones
  const newStatLocks = { main: lockedStats.has('main'), subs: {} };
  for (const s of lockedSubs) {
    newStatLocks.subs[s.id] = true;
  }

  return {
    artifact: { ...artifact, level: 0, mainStat: newMainStat, mainValue: newMainValue, subs, enchants: newEnchants, statLocks: newStatLocks },
    oldMainStat: artifact.mainStat,
    newMainStat,
  };
}

/**
 * Enchant a weapon stat. statKey = 'atk' (base ATK) or 'bonus' (bonus stat).
 */
export function enchantWeaponStat(weaponId, statKey, weaponEnchants = {}) {
  const w = WEAPONS[weaponId];
  if (!w) return { enchants: weaponEnchants, bonus: 0, previousBonus: 0 };

  const enc = { ...(weaponEnchants[weaponId] || { atk: 0, bonus: 0 }) };
  let previousBonus, bonus;

  if (statKey === 'atk') {
    previousBonus = enc.atk || 0;
    bonus = rollEnchantBonus(w.scalingStat === 'int' ? 'int_flat' : 'atk_flat', w.atk);
    enc.atk = bonus;
  } else {
    previousBonus = enc.bonus || 0;
    bonus = rollEnchantBonus(w.bonusStat, w.bonusValue);
    enc.bonus = bonus;
  }

  return { enchants: { ...weaponEnchants, [weaponId]: enc }, bonus, previousBonus };
}

// ═══════════════════════════════════════════════════════════════
// ARTIFACT BONUS COMPUTATION
// ═══════════════════════════════════════════════════════════════

const EMPTY_BONUSES = () => ({
  hp_flat: 0, hp_pct: 0, atk_flat: 0, atk_pct: 0,
  def_flat: 0, def_pct: 0, spd_flat: 0, spd_pct: 0,
  int_flat: 0, int_pct: 0,
  fire_dmg_flat: 0, fire_dmg_pct: 0, water_dmg_flat: 0, water_dmg_pct: 0,
  shadow_dmg_flat: 0, shadow_dmg_pct: 0, light_dmg_flat: 0, light_dmg_pct: 0,
  earth_dmg_flat: 0, earth_dmg_pct: 0,
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
    // Main stat + enchant bonus
    const mainEnchant = art.enchants?.main || 0;
    if (b[art.mainStat] !== undefined) b[art.mainStat] += art.mainValue + mainEnchant;
    // Sub stats + enchant bonuses
    art.subs.forEach(sub => {
      const subEnchant = art.enchants?.subs?.[sub.id] || 0;
      if (b[sub.id] !== undefined) b[sub.id] += sub.value + subEnchant;
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
    if (count >= 8 && setDef.bonus8) Object.entries(setDef.bonus8).forEach(([k, v]) => { if (b[k] !== undefined) b[k] += v; });
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
    if (count >= 8 && s.bonus8Desc) active.push({ set: s, pieces: count, bonus: s.bonus8Desc, tier: 8, hasPassive: !!s.passive8 });
  });
  return active;
}

// ═══════════════════════════════════════════════════════════════
// WEAPONS
// ═══════════════════════════════════════════════════════════════

export const WEAPONS = {
  // Fire (5)
  w_lame_inferno:     { id: 'w_lame_inferno',     name: "Lame de l'Inferno",   rarity: 'mythique',   element: 'fire',   weaponType: 'blade',   atk: 33, bonusStat: 'crit_rate', bonusValue: 11,  icon: '\uD83D\uDDE1\uFE0F', desc: 'Forgee dans les flammes eternelles', sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771547980/lameInferno_xutq4p.png' },
  w_hache_volcanique: { id: 'w_hache_volcanique', name: 'Hache Volcanique',     rarity: 'legendaire', element: 'fire',   weaponType: 'heavy',   atk: 24, bonusStat: 'atk_pct',   bonusValue: 13, icon: '\uD83E\uDE93', desc: 'Lave solidifiee en acier', sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771547478/HacheVolcanique_ifjtal.png' },
  w_arc_braise:       { id: 'w_arc_braise',       name: 'Arc de Braise',        rarity: 'legendaire', element: 'fire',   weaponType: 'ranged',  atk: 20, bonusStat: 'spd_flat',  bonusValue: 11,  icon: '\uD83C\uDFF9', desc: 'Fleches enflammees', scalingStat: 'int' },
  w_dague_pyrite:     { id: 'w_dague_pyrite',     name: 'Dague de Pyrite',      rarity: 'rare',       element: 'fire',   weaponType: 'blade',   atk: 14, bonusStat: 'crit_rate', bonusValue: 7,  icon: '\uD83D\uDDE1\uFE0F', desc: 'Lame incandescente' },
  w_marteau_forge:    { id: 'w_marteau_forge',    name: 'Marteau de la Forge',  rarity: 'rare',       element: 'fire',   weaponType: 'heavy',   atk: 16, bonusStat: 'def_pct',   bonusValue: 8,  icon: '\uD83D\uDD28', desc: 'Outil du forgeron ancestral' },

  // Water (5)
  w_trident_abyssal:  { id: 'w_trident_abyssal',  name: 'Trident Abyssal',     rarity: 'mythique',   element: 'water',  weaponType: 'polearm', atk: 30, bonusStat: 'atk_pct',   bonusValue: 15, icon: '\uD83D\uDD31', desc: 'Arme des profondeurs', sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771548200/TridentAbyssal_sdvheh.png' },
  w_epee_glaciale:    { id: 'w_epee_glaciale',    name: 'Epee Glaciale',        rarity: 'legendaire', element: 'water',  weaponType: 'blade',   atk: 24, bonusStat: 'crit_dmg',  bonusValue: 15, icon: '\u2694\uFE0F', desc: 'Glace eternelle tranchante' },
  w_arc_tsunami:      { id: 'w_arc_tsunami',      name: 'Arc du Tsunami',       rarity: 'legendaire', element: 'water',  weaponType: 'ranged',  atk: 22, bonusStat: 'spd_flat',  bonusValue: 13, icon: '\uD83C\uDFF9', desc: 'Fleches de maree', scalingStat: 'int', sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771549492/ArcTsunami_c2u6zk.png' },
  w_lance_corail:     { id: 'w_lance_corail',     name: 'Lance de Corail',      rarity: 'rare',       element: 'water',  weaponType: 'polearm', atk: 15, bonusStat: 'hp_pct',    bonusValue: 10,  icon: '\uD83D\uDDE1\uFE0F', desc: 'Durcie par les abysses', scalingStat: 'int' },
  w_baton_brume:      { id: 'w_baton_brume',      name: 'Baton de Brume',       rarity: 'rare',       element: 'water',  weaponType: 'staff',   atk: 13, bonusStat: 'res_flat',   bonusValue: 8,  icon: '\uD83E\uDE84', desc: 'Canalise les brumes marines', scalingStat: 'int' },

  // Shadow (5)
  w_faux_monarque:    { id: 'w_faux_monarque',    name: 'Faux du Monarque',     rarity: 'mythique',   element: 'shadow', weaponType: 'scythe', atk: 38, bonusStat: 'crit_dmg',  bonusValue: 19, icon: '\u2694\uFE0F', desc: "L'arme du Roi des Ombres" },
  w_katana_void:      { id: 'w_katana_void',      name: 'Katana du Void',       rarity: 'mythique',   element: 'shadow', weaponType: 'blade',   atk: 32, bonusStat: 'crit_rate', bonusValue: 13, icon: '\uD83D\uDDE1\uFE0F', desc: 'Tranche la realite' },
  w_griffe_nuit:      { id: 'w_griffe_nuit',      name: 'Griffe de la Nuit',    rarity: 'legendaire', element: 'shadow', weaponType: 'polearm', atk: 23, bonusStat: 'spd_flat',  bonusValue: 13, icon: '\uD83D\uDDE1\uFE0F', desc: "Rapide comme l'ombre", scalingStat: 'int', sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771550258/GriffeNuit_uczxbi.png' },
  w_masse_tenebres:   { id: 'w_masse_tenebres',   name: 'Masse des Tenebres',  rarity: 'legendaire', element: 'shadow', weaponType: 'heavy',   atk: 26, bonusStat: 'hp_pct',    bonusValue: 13, icon: '\uD83D\uDD28', desc: "Poids de l'obscurite" },
  w_dague_ombre:      { id: 'w_dague_ombre',      name: "Dague d'Ombre",        rarity: 'rare',       element: 'shadow', weaponType: 'blade',   atk: 14, bonusStat: 'atk_pct',   bonusValue: 8,  icon: '\uD83D\uDDE1\uFE0F', desc: 'Lame des assassins' },

  // Neutral (3)
  w_epee_ancienne:    { id: 'w_epee_ancienne',    name: 'Epee Ancienne',        rarity: 'legendaire', element: null,     weaponType: 'blade',   atk: 22, bonusStat: 'atk_pct',   bonusValue: 11,  icon: '\u2694\uFE0F', desc: "Arme d'une ere oubliee", sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771548878/EpeeAncienne_wsdywo.png' },
  w_baguette_sage:    { id: 'w_baguette_sage',    name: 'Baguette du Sage',     rarity: 'rare',       element: null,     weaponType: 'staff',   atk: 12, bonusStat: 'crit_rate', bonusValue: 7,  icon: '\uD83E\uDE84', desc: 'Sagesse cristallisee', scalingStat: 'int' },
  w_bouclier_hero:    { id: 'w_bouclier_hero',    name: 'Bouclier du Heros',    rarity: 'rare',       element: null,     weaponType: 'shield',  atk: 9,  bonusStat: 'def_pct',   bonusValue: 12, icon: '\uD83D\uDEE1\uFE0F', desc: 'Protection legendaire' },

  // ── Ultime (10) — Raid Ultime exclusive drops ──
  w_lame_eternite:    { id: 'w_lame_eternite',    name: "Lame de l'Eternite",   rarity: 'mythique',   element: 'shadow', weaponType: 'blade',   atk: 95,  bonusStat: 'crit_rate', bonusValue: 18, icon: '\u2694\uFE0F', desc: 'Tranche a travers le temps', ultime: true },
  w_trident_abysses:  { id: 'w_trident_abysses',  name: 'Trident des Abysses',  rarity: 'mythique',   element: 'water',  weaponType: 'polearm', atk: 90,  bonusStat: 'atk_pct',   bonusValue: 21, icon: '\uD83D\uDD31', desc: 'Forge dans les abysses', ultime: true },
  w_arc_celeste:      { id: 'w_arc_celeste',      name: 'Arc Celeste',          rarity: 'mythique',   element: 'light',  weaponType: 'ranged',  atk: 80,  bonusStat: 'spd_flat',  bonusValue: 18, icon: '\uD83C\uDFF9', desc: 'Lumiere purificatrice', scalingStat: 'int', ultime: true, sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771547754/arcCeleste_i2ztc1.png' },
  w_hache_ragnarok:   { id: 'w_hache_ragnarok',   name: 'Hache de Ragnarok',    rarity: 'mythique',   element: 'fire',   weaponType: 'heavy',   atk: 108, bonusStat: 'crit_dmg',  bonusValue: 23, icon: '\uFA62', desc: 'Forgee dans le feu du chaos', ultime: true, sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771544509/HacheRagnarok_hj9z8e.png' },
  w_lance_tempete:    { id: 'w_lance_tempete',     name: 'Lance de la Tempete',  rarity: 'mythique',   element: 'wind',   weaponType: 'polearm', atk: 85,  bonusStat: 'spd_flat',  bonusValue: 15, icon: '\uD83C\uDF2A\uFE0F', desc: 'Invoque la foudre', scalingStat: 'int', ultime: true },
  w_katana_murasame:  { id: 'w_katana_murasame',  name: 'Murasame',             rarity: 'mythique',   element: 'shadow', weaponType: 'blade',   atk: 102, bonusStat: 'crit_rate', bonusValue: 15, icon: '\uD83D\uDDE1\uFE0F', desc: 'Katana maudit legendaire', ultime: true },
  w_marteau_titan:    { id: 'w_marteau_titan',     name: 'Marteau du Titan',     rarity: 'mythique',   element: 'earth',  weaponType: 'heavy',   atk: 115, bonusStat: 'def_pct',   bonusValue: 18, icon: '\uD83D\uDD28', desc: 'Ecrase les montagnes', ultime: true },
  w_dague_assassin:   { id: 'w_dague_assassin',    name: "Dague de l'Assassin",  rarity: 'mythique',   element: 'shadow', weaponType: 'blade',   atk: 75,  bonusStat: 'crit_dmg',  bonusValue: 25, icon: '\uD83D\uDDE1\uFE0F', desc: 'Un coup, une vie', ultime: true },
  w_baton_supreme:    { id: 'w_baton_supreme',     name: 'Baton Arcane Supreme', rarity: 'mythique',   element: null,     weaponType: 'staff',   atk: 70,  bonusStat: 'hp_pct',    bonusValue: 18, icon: '\uD83E\uDE84', desc: 'Pouvoir arcanique brut', scalingStat: 'int', ultime: true },
  w_epee_monarque:    { id: 'w_epee_monarque',     name: 'Epee du Monarque',     rarity: 'mythique',   element: 'shadow', weaponType: 'blade',   atk: 138, bonusStat: 'atk_pct',   bonusValue: 23, icon: '\u2694\uFE0F', desc: "L'arme du roi des ombres", ultime: true },

  // Secret — drop 1/10000 from Ragnarok
  w_sulfuras:         { id: 'w_sulfuras',         name: 'Masse de Sulfuras',    rarity: 'mythique',   element: 'fire',   weaponType: 'heavy',   atk: 250, bonusStat: 'atk_pct', bonusValue: 25, icon: '\uD83D\uDD28', sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771443640/WeaponSulfuras_efg3ca.png', desc: '???', secret: true, passive: 'sulfuras_fury', fireRes: 50, dropSource: 'Ragnarok', dropRate: '1/10,000' },
  // Secret — drop 1/5000 from Zephyr Ultime
  w_raeshalare:       { id: 'w_raeshalare',       name: "Rae'shalare, Murmure de la Mort", rarity: 'mythique', element: 'shadow', weaponType: 'ranged', atk: 200, bonusStat: 'crit_dmg', bonusValue: 25, icon: '\uD83C\uDFF9', sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771525011/arc_d4t23d.png', desc: 'Tire une fleche gemissante qui inflige des degats d\'Ombre et reduit les ennemis au silence', secret: true, passive: 'shadow_silence', darkRes: 50, dropSource: 'Zephyr Ultime', dropRate: '1/5,000' },
  // Secret — drop 1/50000 from Monarque Supreme
  w_katana_z:         { id: 'w_katana_z',         name: 'Katana Z',             rarity: 'mythique',   element: 'water', weaponType: 'blade',  atk: 260, bonusStat: 'spd_flat', bonusValue: 15, icon: '\u2694\uFE0F', sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771539184/KatanaZ_pgth96.png', desc: '+5% ATK permanent par coup. 50% contre-attaque (200% ATK).', secret: true, passive: 'katana_z_fury', darkRes: 40, dropSource: 'Monarque Supreme', dropRate: '1/50,000' },
  w_katana_v:         { id: 'w_katana_v',         name: 'Katana V',             rarity: 'mythique',   element: 'light', weaponType: 'blade',  atk: 120, bonusStat: 'int_pct', bonusValue: 25, icon: '\u2694\uFE0F', sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771539430/KatanaV_zv4oke.png', desc: 'Katana du chaos. Scale sur INT/Mana. Empoisonne, buff et protege.', secret: true, passive: 'katana_v_chaos', darkRes: 35, dropSource: 'Monarque Supreme', dropRate: '1/50,000' },
  // Secret — drop 1/80,000 from Archdemon (cumulative pity)
  w_guldan:            { id: 'w_guldan',            name: "Baton de Gul'dan",      rarity: 'mythique',   element: 'wind',  weaponType: 'staff',  atk: 180, bonusStat: 'spd_flat', bonusValue: 20, baseDef: 50, windRes: 10, icon: '\uD83E\uDE84', sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771638363/batonGuldan_vuu7ez.png', projectile: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771638364/projectileGuldan_ii184b.png', desc: "Baton maudit du demon Gul'dan. Un halo eternel protege et renforce son porteur.", secret: true, passive: 'guldan_halo', dropSource: 'Archdemon', dropRate: '1/80,000' },

  // ═══════════════════════════════════════════════════════════════
  // EXPEDITION BOSS WEAPONS (mythique — top tier, rival/surpass secrets)
  // ═══════════════════════════════════════════════════════════════
  excalibur:          { id: 'excalibur',          name: 'Excalibur',             rarity: 'mythique',   element: 'light',  weaponType: 'blade',   atk: 280, bonusStat: 'atk_pct',   bonusValue: 20, icon: '\u2694\uFE0F', desc: 'HP > 80%: degats +25%. Kill: auto-heal 3% max HP. Absorbe 1 coup mortel (CD 60s).', expedition: true },
  mjolnir:            { id: 'mjolnir',            name: 'Mjolnir',               rarity: 'mythique',   element: 'water',  weaponType: 'heavy',   atk: 270, bonusStat: 'def_pct',   bonusValue: 15, icon: '\uD83D\uDD28', desc: '30% chance chaine sur 2 ennemis. Stun 1s tous les 10 coups.', expedition: true },
  muramasa:           { id: 'muramasa',           name: 'Muramasa',              rarity: 'mythique',   element: 'shadow', weaponType: 'blade',   atk: 300, bonusStat: 'crit_dmg',  bonusValue: 30, icon: '\uD83D\uDDE1\uFE0F', desc: 'Chaque crit: +3% ATK (max 30%). Perd 1% HP/stack. 10 stacks: x3.', expedition: true },
  yggdrasil:          { id: 'yggdrasil',          name: 'Yggdrasil',             rarity: 'mythique',   element: 'light',  weaponType: 'staff',   atk: 220, bonusStat: 'hp_pct',    bonusValue: 30, icon: '\uD83E\uDE84', desc: 'Soins +35%. Overheals = bouclier. Soigne 2 allies proches (30%).', expedition: true, scalingStat: 'int' },
  gungnir:            { id: 'gungnir',            name: 'Gungnir',               rarity: 'mythique',   element: 'fire',   weaponType: 'polearm', atk: 265, bonusStat: 'spd_flat',  bonusValue: 18, icon: '\uD83D\uDDE1\uFE0F', desc: '1ere attaque x2. Tous les 15s: crit garanti. Perce backline.', expedition: true },
  nidhogg:            { id: 'nidhogg',            name: 'Nidhogg',               rarity: 'mythique',   element: 'shadow', weaponType: 'scythe',  atk: 255, bonusStat: 'hp_pct',    bonusValue: 15, icon: '\u2694\uFE0F', desc: 'Kill = +5% ATK +3% vol vie (max 5 stacks).', expedition: true },
  aegis_weapon:       { id: 'aegis_weapon',       name: 'Aegis',                 rarity: 'mythique',   element: 'light',  weaponType: 'shield',  atk: 150, bonusStat: 'def_pct',   bonusValue: 35, icon: '\uD83D\uDEE1\uFE0F', desc: 'Degats subis -25%. Allie meurt: +30% ATK +20% DEF. Aggro +50%.', expedition: true },
  caladbolg:          { id: 'caladbolg',          name: 'Caladbolg',             rarity: 'mythique',   element: 'fire',   weaponType: 'blade',   atk: 275, bonusStat: 'crit_rate', bonusValue: 15, icon: '\u2694\uFE0F', desc: 'Crits enflamment (3% HP/s, 5s). En feu: ATK +15-25%.', expedition: true },
  thyrsus:            { id: 'thyrsus',            name: 'Thyrsus',               rarity: 'mythique',   element: 'water',  weaponType: 'staff',   atk: 240, bonusStat: 'int_pct',   bonusValue: 20, icon: '\uD83E\uDE84', desc: '20% sort gratuit. Mana>80%: +20% degats. Mana<20%: regen x3.', expedition: true, scalingStat: 'int' },
  gram:               { id: 'gram',               name: 'Gram',                  rarity: 'mythique',   element: 'fire',   weaponType: 'heavy',   atk: 290, bonusStat: 'atk_pct',   bonusValue: 25, icon: '\uD83D\uDD28', desc: 'Tous les 5 coups: AoE 250%. Chaque ennemi: +10% prochain AoE.', expedition: true },

  // ═══════════════════════════════════════════════════════════════
  // EXPEDITION PHASE 2 WEAPONS (mythique — overcreep, boss 1-10)
  // ═══════════════════════════════════════════════════════════════
  ragnarok:           { id: 'ragnarok',           name: 'Ragnarök',                    rarity: 'mythique',   element: 'fire',   weaponType: 'heavy',   atk: 350, bonusStat: 'atk_pct',   bonusValue: 30, icon: '🔥', desc: 'Tous les 3 coups: AoE 400% feu (200px). Ennemis brules: -20% DEF. Kill: reset CD.', expedition: true, passive: 'ragnarok_fury' },
  kusanagi:           { id: 'kusanagi',           name: 'Kusanagi',                    rarity: 'mythique',   element: 'shadow', weaponType: 'blade',   atk: 360, bonusStat: 'crit_dmg',  bonusValue: 35, icon: '⚔️', desc: 'Crits: +5% ATK (max 50%). 10 stacks: coup x5. Ignore 20% DEF permanent.', expedition: true, passive: 'kusanagi_shadow' },
  gae_bolg:           { id: 'gae_bolg',           name: 'Gáe Bolg',                   rarity: 'mythique',   element: 'water',  weaponType: 'polearm', atk: 340, bonusStat: 'spd_flat',  bonusValue: 22, icon: '🔱', desc: 'Perce en ligne. 1ere attaque: x3. Tous les 3 tours: AoE 200%.', expedition: true, scalingStat: 'int', passive: 'gae_bolg_pierce' },
  masamune:           { id: 'masamune',           name: 'Masamune',                    rarity: 'mythique',   element: 'light',  weaponType: 'blade',   atk: 370, bonusStat: 'atk_pct',   bonusValue: 28, icon: '✨', desc: 'HP > 50%: +35% degats. Kill: heal 10% + bouclier 5%. Absorbe 2 coups mortels (CD 15T).', expedition: true, passive: 'masamune_blade' },
  longinus:           { id: 'longinus',           name: 'Lance de Longinus',           rarity: 'mythique',   element: 'light',  weaponType: 'polearm', atk: 390, bonusStat: 'crit_rate', bonusValue: 20, icon: '🌟', desc: 'Ignore 30% DEF. Crits: onde sacree 150%. Boss: +25% degats permanent.', expedition: true, scalingStat: 'int', passive: 'longinus_holy' },
  tyrfing:            { id: 'tyrfing',            name: 'Tyrfing',                     rarity: 'mythique',   element: 'shadow', weaponType: 'scythe',  atk: 355, bonusStat: 'hp_pct',    bonusValue: 20, icon: '💀', desc: 'Kill: +8% ATK +5% vol vie (10 stacks). HP < 30%: ATK x2 + invincible 1T (CD 20T).', expedition: true, scalingStat: 'int', passive: 'tyrfing_curse' },
  ea_staff:           { id: 'ea_staff',           name: 'Ea, Bâton des Cieux',         rarity: 'mythique',   element: 'fire',   weaponType: 'staff',   atk: 345, bonusStat: 'int_pct',   bonusValue: 30, icon: '🪄', desc: '30% coup double. HP > 70%: tous degats +40%.', expedition: true, scalingStat: 'int', passive: 'ea_celestial' },
  fragarach:          { id: 'fragarach',          name: 'Fragarach',                   rarity: 'mythique',   element: 'wind',   weaponType: 'blade',   atk: 365, bonusStat: 'atk_pct',   bonusValue: 25, icon: '🌪️', desc: '15% esquive + contre 300%. Tous les 5 coups: tornado 350%.', expedition: true, passive: 'fragarach_wind' },
  tacos_eternel:      { id: 'tacos_eternel',      name: 'Tacos Éternel de Rayan',      rarity: 'mythique',   element: 'fire',   weaponType: 'heavy',   atk: 400, bonusStat: 'atk_pct',   bonusValue: 35, icon: '🌮', desc: 'Chaque coup: -30% ATK ennemi. Kill: +10% tous stats (stack infini). 5 stacks: AoE kebab 500%.', expedition: true, passive: 'tacos_chaos' },
  amenonuhoko:        { id: 'amenonuhoko',        name: 'Ame-no-nuhoko',               rarity: 'mythique',   element: 'water',  weaponType: 'staff',   atk: 380, bonusStat: 'hp_pct',    bonusValue: 25, icon: '🌊', desc: 'Vol de vie 15%. Overheal = bouclier (30% HP max). Resurrecte 1x a 40% HP. +15% stats permanent.', expedition: true, scalingStat: 'int', passive: 'amenonuhoko_divine' },

  // ═══════════════════════════════════════════════════════════════
  // EXPEDITION LOOT WEAPONS — Foret (rare)
  // ═══════════════════════════════════════════════════════════════
  exp_dagger_forest:  { id: 'exp_dagger_forest',  name: 'Dague Sylvestre',       rarity: 'rare',       element: null,     weaponType: 'blade',   atk: 15, bonusStat: 'spd_flat',  bonusValue: 3,  icon: '\uD83D\uDDE1\uFE0F', desc: 'Dague rapide de la foret', expedition: true },
  exp_bow_forest:     { id: 'exp_bow_forest',     name: 'Arc de Lierre',         rarity: 'rare',       element: null,     weaponType: 'ranged',  atk: 22, bonusStat: 'crit_rate', bonusValue: 3,  icon: '\uD83C\uDFF9', desc: 'Arc tisse de lierre enchante', expedition: true },
  exp_sword_forest:   { id: 'exp_sword_forest',   name: 'Epee de Mousse',        rarity: 'rare',       element: null,     weaponType: 'blade',   atk: 30, bonusStat: 'atk_pct',   bonusValue: 3,  icon: '\u2694\uFE0F', desc: 'Lame recouverte de mousse ancienne', expedition: true },
  exp_staff_forest:   { id: 'exp_staff_forest',   name: 'Baton Ancien',          rarity: 'rare',       element: null,     weaponType: 'staff',   atk: 25, bonusStat: 'res_flat',  bonusValue: 8,  icon: '\uD83E\uDE84', desc: 'Baton impregne de sagesse sylvestre', expedition: true, scalingStat: 'int' },
  exp_mace_forest:    { id: 'exp_mace_forest',    name: 'Masse Noueuse',         rarity: 'rare',       element: null,     weaponType: 'heavy',   atk: 28, bonusStat: 'def_pct',   bonusValue: 5,  icon: '\uD83D\uDD28', desc: '5% chance stun 0.5s par attaque', expedition: true },

  // ── Expedition Loot — Pierre/Cristal (rare)
  exp_sword_stone:    { id: 'exp_sword_stone',    name: 'Lame de Granit',        rarity: 'rare',       element: null,     weaponType: 'blade',   atk: 50, bonusStat: 'def_pct',   bonusValue: 8,  icon: '\u2694\uFE0F', desc: 'Lame taillee dans le granit', expedition: true },
  exp_bow_stone:      { id: 'exp_bow_stone',      name: 'Arc Petrifie',          rarity: 'rare',       element: null,     weaponType: 'ranged',  atk: 45, bonusStat: 'crit_rate', bonusValue: 5,  icon: '\uD83C\uDFF9', desc: 'Arc petrifie par les ages', expedition: true },
  exp_spear_crystal:  { id: 'exp_spear_crystal',  name: 'Lance Cristalline',     rarity: 'rare',       element: null,     weaponType: 'polearm', atk: 48, bonusStat: 'spd_flat',  bonusValue: 6,  icon: '\uD83D\uDDE1\uFE0F', desc: 'Perce: ignore 5% DEF', expedition: true },
  exp_wand_crystal:   { id: 'exp_wand_crystal',   name: 'Baguette de Cristal',   rarity: 'rare',       element: null,     weaponType: 'staff',   atk: 40, bonusStat: 'res_flat',  bonusValue: 10, icon: '\uD83E\uDE84', desc: 'Soins +8%', expedition: true, scalingStat: 'int' },
  exp_hammer_stone:   { id: 'exp_hammer_stone',   name: 'Marteau de Roc',        rarity: 'rare',       element: null,     weaponType: 'heavy',   atk: 52, bonusStat: 'hp_pct',    bonusValue: 5,  icon: '\uD83D\uDD28', desc: '8% stun 1s. Stun: -10% DEF 3s.', expedition: true },

  // ── Expedition Loot — Ombre/Abysses (legendaire)
  exp_blade_shadow:   { id: 'exp_blade_shadow',   name: 'Lame du Neant',         rarity: 'legendaire', element: 'shadow', weaponType: 'blade',   atk: 80, bonusStat: 'crit_rate', bonusValue: 10, icon: '\uD83D\uDDE1\uFE0F', desc: 'Lame forgee dans le neant', expedition: true },
  exp_staff_shadow:   { id: 'exp_staff_shadow',   name: 'Sceptre des Tenebres',  rarity: 'legendaire', element: 'shadow', weaponType: 'staff',   atk: 70, bonusStat: 'res_flat',  bonusValue: 15, icon: '\uD83E\uDE84', desc: 'Sceptre des profondeurs', expedition: true, scalingStat: 'int' },
  exp_axe_abyss:      { id: 'exp_axe_abyss',      name: 'Hache des Profondeurs', rarity: 'legendaire', element: null,     weaponType: 'heavy',   atk: 75, bonusStat: 'hp_pct',    bonusValue: 8,  icon: '\uFA62', desc: 'Vol de vie +5%. Kill: +3% ATK (max +12%).', expedition: true },
  exp_glaive_abyss:   { id: 'exp_glaive_abyss',   name: 'Glaive des Abysses',    rarity: 'legendaire', element: null,     weaponType: 'blade',   atk: 68, bonusStat: 'crit_rate', bonusValue: 8,  icon: '\u2694\uFE0F', desc: 'Anti-heal -20% soins 4s. Crit: 6s.', expedition: true },
  exp_orb_abyss:      { id: 'exp_orb_abyss',      name: 'Orbe Abyssale',         rarity: 'legendaire', element: null,     weaponType: 'staff',   atk: 60, bonusStat: 'res_flat',  bonusValue: 12, icon: '\uD83E\uDE84', desc: 'Soins +12%. Overheals = bouclier 5% HP.', expedition: true, scalingStat: 'int' },
  exp_scythe_abyss:   { id: 'exp_scythe_abyss',   name: 'Faux des Damnes',       rarity: 'legendaire', element: null,     weaponType: 'scythe',  atk: 85, bonusStat: 'crit_rate', bonusValue: 6,  icon: '\u2694\uFE0F', desc: 'Kill: ignore 30% DEF + anti-heal 3s.', expedition: true },
  exp_whip_abyss:     { id: 'exp_whip_abyss',     name: 'Fouet Abyssal',         rarity: 'legendaire', element: null,     weaponType: 'polearm', atk: 62, bonusStat: 'spd_flat',  bonusValue: 10, icon: '\uD83D\uDDE1\uFE0F', desc: 'Touche 2 cibles. Bleed 1.5% HP/s 4s.', expedition: true },

  // ── Expedition Loot — Neant (legendaire+)
  exp_katana_void:    { id: 'exp_katana_void',    name: 'Katana du Neant',       rarity: 'legendaire', element: 'shadow', weaponType: 'blade',   atk: 95, bonusStat: 'crit_rate', bonusValue: 12, icon: '\uD83D\uDDE1\uFE0F', desc: 'Crit: bleed 0.8% HP/s (stack x3). 3 stacks = +10% DMG.', expedition: true },
  exp_grimoire_void:  { id: 'exp_grimoire_void',  name: 'Grimoire du Neant',     rarity: 'legendaire', element: 'shadow', weaponType: 'staff',   atk: 80, bonusStat: 'res_flat',  bonusValue: 20, icon: '\uD83E\uDE84', desc: '15% Silence 2s. Anti-heal -30%. Mana regen +15%.', expedition: true, scalingStat: 'int' },
  exp_halberd_void:   { id: 'exp_halberd_void',   name: 'Hallebarde du Vide',    rarity: 'legendaire', element: 'shadow', weaponType: 'heavy',   atk: 100, bonusStat: 'def_pct',  bonusValue: 10, icon: '\uFA62', desc: 'Chaque 3e coup: AoE 150%. -15% ATK 4s + anti-heal 2s.', expedition: true },
  exp_talisman_void:  { id: 'exp_talisman_void',  name: 'Talisman Sacre',        rarity: 'legendaire', element: null,     weaponType: 'staff',   atk: 70, bonusStat: 'hp_pct',    bonusValue: 12, icon: '\uD83E\uDE84', desc: 'Bouclier 8% HP (15s). Soins +20%. Allies: +5% DEF.', expedition: true, scalingStat: 'int' },
  exp_claws_void:     { id: 'exp_claws_void',     name: 'Griffes Spectrales',    rarity: 'legendaire', element: 'shadow', weaponType: 'blade',   atk: 88, bonusStat: 'spd_flat',  bonusValue: 15, icon: '\uD83D\uDDE1\uFE0F', desc: 'Double frappe 20%. Bleed on crit. Kill: reset CD.', expedition: true },
  exp_lance_briseur:  { id: 'exp_lance_briseur',  name: 'Lance Brise-Tyran',     rarity: 'legendaire', element: null,     weaponType: 'polearm', atk: 75, bonusStat: 'def_pct',   bonusValue: 12, icon: '\uD83D\uDDE1\uFE0F', desc: 'Boss ATK -30% 8s (CD 20s). Allies: +10% DEF. Tank ideal.', expedition: true },
};

export const WEAPON_PRICES = { rare: 500, legendaire: 2000, mythique: 5000 };

// ═══════════════════════════════════════════════════════════════
// WEAPON AWAKENING SYSTEM (A0-A100)
// A0 = base, A1-A5 = unique passives, A6-A10 = +3% ATK/DEF/HP each
// A11-A100 = +2% ATK/DEF/HP every 5 levels
// ═══════════════════════════════════════════════════════════════

export const MAX_WEAPON_AWAKENING = 100;
const AW_PASSIVE_CAP = 5; // A1-A5 have unique passives
const AW_FLAT_BONUS = 3;  // A6-A10: +3% ATK, DEF, HP each
const AW_EXTENDED_BONUS = 2; // A11+: +2% ATK/DEF/HP every 5 levels

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
    { desc: 'INT +6%', stats: { int_pct: 6 } },
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
    { desc: 'INT +6%', stats: { int_pct: 6 } },
    { desc: 'CRIT +4%', stats: { crit_rate: 4 } },
    { desc: 'Tous Degats +5%', stats: { allDamage: 5 } },
  ],
  w_lance_corail: [
    { desc: 'PV +5%', stats: { hp_pct: 5 } },
    { desc: 'Degats Eau +4%', stats: { waterDamage: 4 } },
    { desc: 'DEF +4%', stats: { def_pct: 4 } },
    { desc: 'INT +3%', stats: { int_pct: 3 } },
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
    { desc: 'INT +6%', stats: { int_pct: 6 } },
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
    { desc: 'INT +3%', stats: { int_pct: 3 } },
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
  // ── ULTIME ──
  w_lame_eternite: [
    { desc: 'Shadow DMG +12%', stats: { shadowDamage: 12 } },
    { desc: 'CRIT +8%', stats: { crit_rate: 8 } },
    { desc: 'CRIT DMG +15%', stats: { crit_dmg: 15 } },
    { desc: 'ATK +10%', stats: { atk_pct: 10 } },
    { desc: 'Ignore 12% DEF + Tous Degats +8%', stats: { defPen: 12, allDamage: 8 } },
  ],
  w_trident_abysses: [
    { desc: 'Water DMG +12%', stats: { waterDamage: 12 } },
    { desc: 'ATK +10%', stats: { atk_pct: 10 } },
    { desc: 'CRIT DMG +12%', stats: { crit_dmg: 12 } },
    { desc: 'Ignore 10% DEF', stats: { defPen: 10 } },
    { desc: 'Tous Degats +10%', stats: { allDamage: 10 } },
  ],
  w_arc_celeste: [
    { desc: 'SPD +6', stats: { spd_flat: 6 } },
    { desc: 'Tous Degats +8%', stats: { allDamage: 8 } },
    { desc: 'CRIT +6%', stats: { crit_rate: 6 } },
    { desc: 'INT +8%', stats: { int_pct: 8 } },
    { desc: 'CRIT DMG +12%', stats: { crit_dmg: 12 } },
  ],
  w_hache_ragnarok: [
    { desc: 'Fire DMG +12%', stats: { fireDamage: 12 } },
    { desc: 'CRIT DMG +15%', stats: { crit_dmg: 15 } },
    { desc: 'ATK +10%', stats: { atk_pct: 10 } },
    { desc: 'Ignore 10% DEF', stats: { defPen: 10 } },
    { desc: 'Tous Degats +10% + CRIT +5%', stats: { allDamage: 10, crit_rate: 5 } },
  ],
  w_lance_tempete: [
    { desc: 'SPD +6', stats: { spd_flat: 6 } },
    { desc: 'CRIT +6%', stats: { crit_rate: 6 } },
    { desc: 'INT +8%', stats: { int_pct: 8 } },
    { desc: 'Tous Degats +8%', stats: { allDamage: 8 } },
    { desc: 'Ignore 8% DEF + SPD +4', stats: { defPen: 8, spd_flat: 4 } },
  ],
  w_katana_murasame: [
    { desc: 'Shadow DMG +10%', stats: { shadowDamage: 10 } },
    { desc: 'CRIT +8%', stats: { crit_rate: 8 } },
    { desc: 'ATK +10%', stats: { atk_pct: 10 } },
    { desc: 'CRIT DMG +15%', stats: { crit_dmg: 15 } },
    { desc: 'Ignore 12% DEF + Tous Degats +8%', stats: { defPen: 12, allDamage: 8 } },
  ],
  w_marteau_titan: [
    { desc: 'DEF +10%', stats: { def_pct: 10 } },
    { desc: 'HP +10%', stats: { hp_pct: 10 } },
    { desc: 'ATK +10%', stats: { atk_pct: 10 } },
    { desc: 'Tous Degats +8%', stats: { allDamage: 8 } },
    { desc: 'Ignore 10% DEF + RES +5', stats: { defPen: 10, res_flat: 5 } },
  ],
  w_dague_assassin: [
    { desc: 'CRIT DMG +15%', stats: { crit_dmg: 15 } },
    { desc: 'CRIT +8%', stats: { crit_rate: 8 } },
    { desc: 'Shadow DMG +10%', stats: { shadowDamage: 10 } },
    { desc: 'ATK +8%', stats: { atk_pct: 8 } },
    { desc: 'Ignore 12% DEF + CRIT DMG +10%', stats: { defPen: 12, crit_dmg: 10 } },
  ],
  w_baton_supreme: [
    { desc: 'HP +8%', stats: { hp_pct: 8 } },
    { desc: 'Tous Degats +8%', stats: { allDamage: 8 } },
    { desc: 'DEF +6%', stats: { def_pct: 6 } },
    { desc: 'CRIT +6%', stats: { crit_rate: 6 } },
    { desc: 'INT +8% + RES +5', stats: { int_pct: 8, res_flat: 5 } },
  ],
  w_epee_monarque: [
    { desc: 'Shadow DMG +12%', stats: { shadowDamage: 12 } },
    { desc: 'ATK +12%', stats: { atk_pct: 12 } },
    { desc: 'CRIT +8%', stats: { crit_rate: 8 } },
    { desc: 'CRIT DMG +18%', stats: { crit_dmg: 18 } },
    { desc: 'Ignore 14% DEF + Tous Degats +10%', stats: { defPen: 14, allDamage: 10 } },
  ],
  w_sulfuras: [
    { desc: 'Degats Feu +15%', stats: { fireDamage: 15 } },
    { desc: 'ATK +12%', stats: { atk_pct: 12 } },
    { desc: 'CRIT +10%', stats: { crit_rate: 10 } },
    { desc: 'CRIT DMG +20%', stats: { crit_dmg: 20 } },
    { desc: 'Ignore 15% DEF + Tous Degats +10%', stats: { defPen: 15, allDamage: 10 } },
  ],
  w_raeshalare: [
    { desc: 'Degats Ombre +12%', stats: { shadowDamage: 12 } },
    { desc: 'CRIT DMG +15%', stats: { crit_dmg: 15 } },
    { desc: 'ATK +10%', stats: { atk_pct: 10 } },
    { desc: 'CRIT DMG +18%', stats: { crit_dmg: 18 } },
    { desc: 'Ignore 12% DEF + Tous Degats +10%', stats: { defPen: 12, allDamage: 10 } },
  ],
  w_katana_z: [
    { desc: 'ATK +15%', stats: { atk_pct: 15 } },
    { desc: 'SPD +10', stats: { spd_flat: 10 } },
    { desc: 'CRIT +12%', stats: { crit_rate: 12 } },
    { desc: 'Degats Eau +12%', stats: { waterDamage: 12 } },
    { desc: 'Ignore 15% DEF + Tous Degats +12%', stats: { defPen: 15, allDamage: 12 } },
  ],
  w_katana_v: [
    { desc: 'CRIT DMG +18%', stats: { crit_dmg: 18 } },
    { desc: 'INT +15%', stats: { int_pct: 15 } },
    { desc: 'CRIT +10%', stats: { crit_rate: 10 } },
    { desc: 'Degats Lumiere +12%', stats: { lightDamage: 12 } },
    { desc: 'INT +10% + Ignore 12% DEF + Tous Degats +10%', stats: { int_pct: 10, defPen: 12, allDamage: 10 } },
  ],
  w_guldan: [
    { desc: 'DEF +25%', stats: { def_pct: 25 } },
    { desc: 'SPD +35', stats: { spd_flat: 35 } },
    { desc: 'RES +18', stats: { res_flat: 18 } },
    { desc: 'Degats Vent +15%', stats: { windDamage: 15 } },
    { desc: 'Ignore 20% DEF + RES +15 + Tous Degats +5%', stats: { defPen: 20, res_flat: 15, allDamage: 5 } },
  ],

  // ═══════════════════════════════════════════════════════════════
  // EXPEDITION BOSS WEAPONS — A1-A5 passives (rival/surpass secrets)
  // ═══════════════════════════════════════════════════════════════
  excalibur: [
    { desc: 'Degats Lumiere +16%', stats: { lightDamage: 16 } },
    { desc: 'ATK +14%', stats: { atk_pct: 14 } },
    { desc: 'CRIT +12%', stats: { crit_rate: 12 } },
    { desc: 'CRIT DMG +22%', stats: { crit_dmg: 22 } },
    { desc: 'Ignore 16% DEF + Tous Degats +14%', stats: { defPen: 16, allDamage: 14 } },
  ],
  mjolnir: [
    { desc: 'Degats Eau +14%', stats: { waterDamage: 14 } },
    { desc: 'DEF +15%', stats: { def_pct: 15 } },
    { desc: 'PV +12%', stats: { hp_pct: 12 } },
    { desc: 'ATK +12%', stats: { atk_pct: 12 } },
    { desc: 'Ignore 12% DEF + Tous Degats +12%', stats: { defPen: 12, allDamage: 12 } },
  ],
  muramasa: [
    { desc: 'Degats Ombre +18%', stats: { shadowDamage: 18 } },
    { desc: 'CRIT DMG +22%', stats: { crit_dmg: 22 } },
    { desc: 'ATK +15%', stats: { atk_pct: 15 } },
    { desc: 'CRIT +14%', stats: { crit_rate: 14 } },
    { desc: 'Ignore 18% DEF + Tous Degats +14%', stats: { defPen: 18, allDamage: 14 } },
  ],
  yggdrasil: [
    { desc: 'Degats Lumiere +12%', stats: { lightDamage: 12 } },
    { desc: 'PV +14%', stats: { hp_pct: 14 } },
    { desc: 'DEF +12%', stats: { def_pct: 12 } },
    { desc: 'RES +14', stats: { res_flat: 14 } },
    { desc: 'PV +10% + Tous Degats +10%', stats: { hp_pct: 10, allDamage: 10 } },
  ],
  gungnir: [
    { desc: 'Degats Feu +15%', stats: { fireDamage: 15 } },
    { desc: 'SPD +14', stats: { spd_flat: 14 } },
    { desc: 'ATK +13%', stats: { atk_pct: 13 } },
    { desc: 'CRIT +11%', stats: { crit_rate: 11 } },
    { desc: 'Ignore 15% DEF + Tous Degats +12%', stats: { defPen: 15, allDamage: 12 } },
  ],
  nidhogg: [
    { desc: 'Degats Ombre +15%', stats: { shadowDamage: 15 } },
    { desc: 'ATK +13%', stats: { atk_pct: 13 } },
    { desc: 'CRIT +11%', stats: { crit_rate: 11 } },
    { desc: 'CRIT DMG +18%', stats: { crit_dmg: 18 } },
    { desc: 'Ignore 14% DEF + Tous Degats +12%', stats: { defPen: 14, allDamage: 12 } },
  ],
  aegis_weapon: [
    { desc: 'Degats Lumiere +10%', stats: { lightDamage: 10 } },
    { desc: 'DEF +20%', stats: { def_pct: 20 } },
    { desc: 'PV +16%', stats: { hp_pct: 16 } },
    { desc: 'RES +16', stats: { res_flat: 16 } },
    { desc: 'DEF +14% + PV +14%', stats: { def_pct: 14, hp_pct: 14 } },
  ],
  caladbolg: [
    { desc: 'Degats Feu +16%', stats: { fireDamage: 16 } },
    { desc: 'CRIT +13%', stats: { crit_rate: 13 } },
    { desc: 'ATK +13%', stats: { atk_pct: 13 } },
    { desc: 'CRIT DMG +20%', stats: { crit_dmg: 20 } },
    { desc: 'Ignore 15% DEF + Tous Degats +12%', stats: { defPen: 15, allDamage: 12 } },
  ],
  thyrsus: [
    { desc: 'Degats Eau +14%', stats: { waterDamage: 14 } },
    { desc: 'INT +14%', stats: { int_pct: 14 } },
    { desc: 'SPD +12', stats: { spd_flat: 12 } },
    { desc: 'RES +12', stats: { res_flat: 12 } },
    { desc: 'Ignore 12% DEF + Tous Degats +12%', stats: { defPen: 12, allDamage: 12 } },
  ],
  gram: [
    { desc: 'Degats Feu +18%', stats: { fireDamage: 18 } },
    { desc: 'ATK +16%', stats: { atk_pct: 16 } },
    { desc: 'CRIT DMG +22%', stats: { crit_dmg: 22 } },
    { desc: 'CRIT +12%', stats: { crit_rate: 12 } },
    { desc: 'Ignore 18% DEF + Tous Degats +15%', stats: { defPen: 18, allDamage: 15 } },
  ],

  // ═══════════════════════════════════════════════════════════════
  // EXPEDITION LOOT WEAPONS — A1-A5 passives
  // ═══════════════════════════════════════════════════════════════

  // Foret (rare tier — small passives)
  exp_dagger_forest: [
    { desc: 'SPD +3', stats: { spd_flat: 3 } },
    { desc: 'CRIT +2%', stats: { crit_rate: 2 } },
    { desc: 'ATK +3%', stats: { atk_pct: 3 } },
    { desc: 'CRIT DMG +5%', stats: { crit_dmg: 5 } },
    { desc: 'Ignore 3% DEF', stats: { defPen: 3 } },
  ],
  exp_bow_forest: [
    { desc: 'CRIT +3%', stats: { crit_rate: 3 } },
    { desc: 'ATK +3%', stats: { atk_pct: 3 } },
    { desc: 'SPD +3', stats: { spd_flat: 3 } },
    { desc: 'CRIT DMG +5%', stats: { crit_dmg: 5 } },
    { desc: 'Ignore 3% DEF', stats: { defPen: 3 } },
  ],
  exp_sword_forest: [
    { desc: 'ATK +3%', stats: { atk_pct: 3 } },
    { desc: 'CRIT +2%', stats: { crit_rate: 2 } },
    { desc: 'PV +3%', stats: { hp_pct: 3 } },
    { desc: 'DEF +3%', stats: { def_pct: 3 } },
    { desc: 'SPD +3', stats: { spd_flat: 3 } },
  ],
  exp_staff_forest: [
    { desc: 'RES +4', stats: { res_flat: 4 } },
    { desc: 'INT +3%', stats: { int_pct: 3 } },
    { desc: 'PV +3%', stats: { hp_pct: 3 } },
    { desc: 'DEF +3%', stats: { def_pct: 3 } },
    { desc: 'Tous Degats +3%', stats: { allDamage: 3 } },
  ],
  exp_mace_forest: [
    { desc: 'DEF +3%', stats: { def_pct: 3 } },
    { desc: 'PV +3%', stats: { hp_pct: 3 } },
    { desc: 'ATK +3%', stats: { atk_pct: 3 } },
    { desc: 'RES +3', stats: { res_flat: 3 } },
    { desc: 'SPD +3', stats: { spd_flat: 3 } },
  ],

  // Pierre/Cristal (rare tier — medium passives)
  exp_sword_stone: [
    { desc: 'ATK +4%', stats: { atk_pct: 4 } },
    { desc: 'DEF +4%', stats: { def_pct: 4 } },
    { desc: 'CRIT +3%', stats: { crit_rate: 3 } },
    { desc: 'PV +4%', stats: { hp_pct: 4 } },
    { desc: 'Ignore 3% DEF', stats: { defPen: 3 } },
  ],
  exp_bow_stone: [
    { desc: 'CRIT +4%', stats: { crit_rate: 4 } },
    { desc: 'ATK +4%', stats: { atk_pct: 4 } },
    { desc: 'SPD +4', stats: { spd_flat: 4 } },
    { desc: 'CRIT DMG +6%', stats: { crit_dmg: 6 } },
    { desc: 'Ignore 3% DEF', stats: { defPen: 3 } },
  ],
  exp_spear_crystal: [
    { desc: 'SPD +4', stats: { spd_flat: 4 } },
    { desc: 'ATK +4%', stats: { atk_pct: 4 } },
    { desc: 'CRIT +3%', stats: { crit_rate: 3 } },
    { desc: 'CRIT DMG +6%', stats: { crit_dmg: 6 } },
    { desc: 'Ignore 4% DEF', stats: { defPen: 4 } },
  ],
  exp_wand_crystal: [
    { desc: 'INT +4%', stats: { int_pct: 4 } },
    { desc: 'RES +5', stats: { res_flat: 5 } },
    { desc: 'PV +4%', stats: { hp_pct: 4 } },
    { desc: 'DEF +3%', stats: { def_pct: 3 } },
    { desc: 'Tous Degats +3%', stats: { allDamage: 3 } },
  ],
  exp_hammer_stone: [
    { desc: 'PV +4%', stats: { hp_pct: 4 } },
    { desc: 'DEF +4%', stats: { def_pct: 4 } },
    { desc: 'ATK +4%', stats: { atk_pct: 4 } },
    { desc: 'RES +4', stats: { res_flat: 4 } },
    { desc: 'Ignore 3% DEF', stats: { defPen: 3 } },
  ],

  // Ombre/Abysses (legendaire tier — solid passives)
  exp_blade_shadow: [
    { desc: 'Degats Ombre +8%', stats: { shadowDamage: 8 } },
    { desc: 'ATK +7%', stats: { atk_pct: 7 } },
    { desc: 'CRIT +6%', stats: { crit_rate: 6 } },
    { desc: 'CRIT DMG +12%', stats: { crit_dmg: 12 } },
    { desc: 'Ignore 6% DEF', stats: { defPen: 6 } },
  ],
  exp_staff_shadow: [
    { desc: 'Degats Ombre +8%', stats: { shadowDamage: 8 } },
    { desc: 'INT +7%', stats: { int_pct: 7 } },
    { desc: 'RES +8', stats: { res_flat: 8 } },
    { desc: 'PV +6%', stats: { hp_pct: 6 } },
    { desc: 'Tous Degats +6%', stats: { allDamage: 6 } },
  ],
  exp_axe_abyss: [
    { desc: 'ATK +7%', stats: { atk_pct: 7 } },
    { desc: 'PV +6%', stats: { hp_pct: 6 } },
    { desc: 'CRIT +5%', stats: { crit_rate: 5 } },
    { desc: 'CRIT DMG +10%', stats: { crit_dmg: 10 } },
    { desc: 'Ignore 5% DEF', stats: { defPen: 5 } },
  ],
  exp_glaive_abyss: [
    { desc: 'CRIT +6%', stats: { crit_rate: 6 } },
    { desc: 'ATK +6%', stats: { atk_pct: 6 } },
    { desc: 'SPD +6', stats: { spd_flat: 6 } },
    { desc: 'CRIT DMG +10%', stats: { crit_dmg: 10 } },
    { desc: 'Ignore 6% DEF', stats: { defPen: 6 } },
  ],
  exp_orb_abyss: [
    { desc: 'INT +7%', stats: { int_pct: 7 } },
    { desc: 'RES +8', stats: { res_flat: 8 } },
    { desc: 'PV +7%', stats: { hp_pct: 7 } },
    { desc: 'DEF +5%', stats: { def_pct: 5 } },
    { desc: 'Tous Degats +5%', stats: { allDamage: 5 } },
  ],
  exp_scythe_abyss: [
    { desc: 'ATK +7%', stats: { atk_pct: 7 } },
    { desc: 'CRIT +6%', stats: { crit_rate: 6 } },
    { desc: 'CRIT DMG +12%', stats: { crit_dmg: 12 } },
    { desc: 'SPD +5', stats: { spd_flat: 5 } },
    { desc: 'Ignore 6% DEF + Tous Degats +5%', stats: { defPen: 6, allDamage: 5 } },
  ],
  exp_whip_abyss: [
    { desc: 'SPD +6', stats: { spd_flat: 6 } },
    { desc: 'ATK +6%', stats: { atk_pct: 6 } },
    { desc: 'CRIT +5%', stats: { crit_rate: 5 } },
    { desc: 'PV +5%', stats: { hp_pct: 5 } },
    { desc: 'Ignore 5% DEF', stats: { defPen: 5 } },
  ],

  // Neant (legendaire+ tier — strong passives)
  exp_katana_void: [
    { desc: 'Degats Ombre +10%', stats: { shadowDamage: 10 } },
    { desc: 'CRIT +8%', stats: { crit_rate: 8 } },
    { desc: 'ATK +8%', stats: { atk_pct: 8 } },
    { desc: 'CRIT DMG +15%', stats: { crit_dmg: 15 } },
    { desc: 'Ignore 8% DEF + Tous Degats +8%', stats: { defPen: 8, allDamage: 8 } },
  ],
  exp_grimoire_void: [
    { desc: 'Degats Ombre +10%', stats: { shadowDamage: 10 } },
    { desc: 'INT +10%', stats: { int_pct: 10 } },
    { desc: 'RES +10', stats: { res_flat: 10 } },
    { desc: 'PV +8%', stats: { hp_pct: 8 } },
    { desc: 'Tous Degats +8%', stats: { allDamage: 8 } },
  ],
  exp_halberd_void: [
    { desc: 'ATK +8%', stats: { atk_pct: 8 } },
    { desc: 'DEF +8%', stats: { def_pct: 8 } },
    { desc: 'PV +8%', stats: { hp_pct: 8 } },
    { desc: 'CRIT DMG +14%', stats: { crit_dmg: 14 } },
    { desc: 'Ignore 8% DEF + Tous Degats +8%', stats: { defPen: 8, allDamage: 8 } },
  ],
  exp_talisman_void: [
    { desc: 'PV +10%', stats: { hp_pct: 10 } },
    { desc: 'INT +8%', stats: { int_pct: 8 } },
    { desc: 'DEF +8%', stats: { def_pct: 8 } },
    { desc: 'RES +10', stats: { res_flat: 10 } },
    { desc: 'Tous Degats +8% + PV +6%', stats: { allDamage: 8, hp_pct: 6 } },
  ],
  exp_claws_void: [
    { desc: 'Degats Ombre +10%', stats: { shadowDamage: 10 } },
    { desc: 'SPD +10', stats: { spd_flat: 10 } },
    { desc: 'CRIT +8%', stats: { crit_rate: 8 } },
    { desc: 'ATK +8%', stats: { atk_pct: 8 } },
    { desc: 'Ignore 8% DEF + Tous Degats +8%', stats: { defPen: 8, allDamage: 8 } },
  ],
  exp_lance_briseur: [
    { desc: 'DEF +10%', stats: { def_pct: 10 } },
    { desc: 'PV +10%', stats: { hp_pct: 10 } },
    { desc: 'ATK +6%', stats: { atk_pct: 6 } },
    { desc: 'RES +10', stats: { res_flat: 10 } },
    { desc: 'DEF +8% + PV +8%', stats: { def_pct: 8, hp_pct: 8 } },
  ],

  // ═══════════════════════════════════════════════════════════════
  // PHASE 2 WEAPONS — Overcreep awakening passives
  // ═══════════════════════════════════════════════════════════════
  ragnarok: [
    { desc: 'Degats Feu +18%', stats: { fireDamage: 18 } },
    { desc: 'ATK +16%', stats: { atk_pct: 16 } },
    { desc: 'CRIT +12%', stats: { crit_rate: 12 } },
    { desc: 'CRIT DMG +20%', stats: { crit_dmg: 20 } },
    { desc: 'Ignore 18% DEF + Tous Degats +16%', stats: { defPen: 18, allDamage: 16 } },
  ],
  kusanagi: [
    { desc: 'Degats Ombre +20%', stats: { shadowDamage: 20 } },
    { desc: 'CRIT DMG +25%', stats: { crit_dmg: 25 } },
    { desc: 'ATK +18%', stats: { atk_pct: 18 } },
    { desc: 'CRIT +14%', stats: { crit_rate: 14 } },
    { desc: 'Ignore 22% DEF + Ombre +12%', stats: { defPen: 22, shadowDamage: 12 } },
  ],
  gae_bolg: [
    { desc: 'Degats Eau +16%', stats: { waterDamage: 16 } },
    { desc: 'SPD +15', stats: { spd_flat: 15 } },
    { desc: 'INT +16%', stats: { int_pct: 16 } },
    { desc: 'CRIT +10%', stats: { crit_rate: 10 } },
    { desc: 'Ignore 16% DEF + Tous Degats +14%', stats: { defPen: 16, allDamage: 14 } },
  ],
  masamune: [
    { desc: 'Degats Lumiere +20%', stats: { lightDamage: 20 } },
    { desc: 'ATK +18%', stats: { atk_pct: 18 } },
    { desc: 'PV +15%', stats: { hp_pct: 15 } },
    { desc: 'CRIT DMG +22%', stats: { crit_dmg: 22 } },
    { desc: 'Ignore 20% DEF + Lumiere +14%', stats: { defPen: 20, lightDamage: 14 } },
  ],
  longinus: [
    { desc: 'Degats Lumiere +22%', stats: { lightDamage: 22 } },
    { desc: 'CRIT +16%', stats: { crit_rate: 16 } },
    { desc: 'INT +18%', stats: { int_pct: 18 } },
    { desc: 'CRIT DMG +24%', stats: { crit_dmg: 24 } },
    { desc: 'Ignore 25% DEF + Tous Degats +18%', stats: { defPen: 25, allDamage: 18 } },
  ],
  tyrfing: [
    { desc: 'Degats Ombre +18%', stats: { shadowDamage: 18 } },
    { desc: 'INT +18%', stats: { int_pct: 18 } },
    { desc: 'PV +18%', stats: { hp_pct: 18 } },
    { desc: 'CRIT +12%', stats: { crit_rate: 12 } },
    { desc: 'Ignore 20% DEF + Ombre +14%', stats: { defPen: 20, shadowDamage: 14 } },
  ],
  ea_staff: [
    { desc: 'Degats Feu +20%', stats: { fireDamage: 20 } },
    { desc: 'INT +18%', stats: { int_pct: 18 } },
    { desc: 'Tous Degats +14%', stats: { allDamage: 14 } },
    { desc: 'CRIT DMG +20%', stats: { crit_dmg: 20 } },
    { desc: 'Ignore 18% DEF + Feu +16%', stats: { defPen: 18, fireDamage: 16 } },
  ],
  fragarach: [
    { desc: 'Degats Vent +20%', stats: { windDamage: 20 } },
    { desc: 'ATK +16%', stats: { atk_pct: 16 } },
    { desc: 'SPD +12', stats: { spd_flat: 12 } },
    { desc: 'CRIT +14%', stats: { crit_rate: 14 } },
    { desc: 'Ignore 20% DEF + Vent +16%', stats: { defPen: 20, windDamage: 16 } },
  ],
  tacos_eternel: [
    { desc: 'Degats Feu +25%', stats: { fireDamage: 25 } },
    { desc: 'ATK +20%', stats: { atk_pct: 20 } },
    { desc: 'CRIT DMG +28%', stats: { crit_dmg: 28 } },
    { desc: 'CRIT +16%', stats: { crit_rate: 16 } },
    { desc: 'Ignore 28% DEF + Tous Degats +22%', stats: { defPen: 28, allDamage: 22 } },
  ],
  amenonuhoko: [
    { desc: 'Degats Eau +22%', stats: { waterDamage: 22 } },
    { desc: 'INT +20%', stats: { int_pct: 20 } },
    { desc: 'PV +20%', stats: { hp_pct: 20 } },
    { desc: 'Tous Degats +16%', stats: { allDamage: 16 } },
    { desc: 'Ignore 18% DEF + Eau +18%', stats: { defPen: 18, waterDamage: 18 } },
  ],
};

export function getWeaponAwakeningBonuses(weaponId, awakening = 0) {
  const b = { atk_pct: 0, def_pct: 0, hp_pct: 0, int_pct: 0, crit_rate: 0, crit_dmg: 0, spd_flat: 0, res_flat: 0, fireDamage: 0, waterDamage: 0, shadowDamage: 0, windDamage: 0, lightDamage: 0, allDamage: 0, defPen: 0 };
  if (!weaponId || awakening <= 0) return b;
  const passives = WEAPON_AWAKENING_PASSIVES[weaponId] || [];
  // A1-A5: unique passives
  for (let i = 0; i < Math.min(awakening, AW_PASSIVE_CAP); i++) {
    if (passives[i]?.stats) {
      Object.entries(passives[i].stats).forEach(([k, v]) => { if (b[k] !== undefined) b[k] += v; });
    }
  }
  // A6-A10: +3% ATK/DEF/HP/INT each
  const flatLevels = Math.max(0, Math.min(awakening, 10) - AW_PASSIVE_CAP);
  b.atk_pct += flatLevels * AW_FLAT_BONUS;
  b.def_pct += flatLevels * AW_FLAT_BONUS;
  b.hp_pct += flatLevels * AW_FLAT_BONUS;
  b.int_pct += flatLevels * AW_FLAT_BONUS;
  // A11-A100: +2% ATK/DEF/HP/INT every 5 levels
  if (awakening > 10) {
    const extTiers = Math.floor((awakening - 10) / 5);
    b.atk_pct += extTiers * AW_EXTENDED_BONUS;
    b.def_pct += extTiers * AW_EXTENDED_BONUS;
    b.hp_pct += extTiers * AW_EXTENDED_BONUS;
    b.int_pct += extTiers * AW_EXTENDED_BONUS;
  }
  return b;
}

export function computeWeaponBonuses(weaponId, awakening = 0, weaponEnchants = {}) {
  const b = { atk_flat: 0, atk_pct: 0, int_flat: 0, def_flat: 0, def_pct: 0, hp_pct: 0, int_pct: 0, spd_flat: 0, crit_rate: 0, crit_dmg: 0, res_flat: 0, fireDamage: 0, waterDamage: 0, shadowDamage: 0, windDamage: 0, lightDamage: 0, allDamage: 0, defPen: 0 };
  if (!weaponId) return b;
  const w = WEAPONS[weaponId];
  if (!w) return b;
  const enc = weaponEnchants?.[weaponId] || {};
  // Route weapon power to INT or ATK based on scalingStat
  const baseStat = w.scalingStat === 'int' ? 'int_flat' : 'atk_flat';
  b[baseStat] += w.atk + (enc.atk || 0);
  if (b[w.bonusStat] !== undefined) b[w.bonusStat] += w.bonusValue + (enc.bonus || 0);
  if (w.fireRes) b.res_flat += w.fireRes;
  if (w.darkRes) b.res_flat += w.darkRes;
  if (w.baseDef) b.def_flat += w.baseDef;
  if (w.windRes) b.res_flat += w.windRes;
  if (awakening > 0) {
    const awB = getWeaponAwakeningBonuses(weaponId, awakening);
    Object.entries(awB).forEach(([k, v]) => { if (b[k] !== undefined) b[k] += v; });
  }
  return b;
}

// Sulfuras stacking passive: +33% dmg per stack, 3 stacks max (+100%)
export const SULFURAS_STACK_PER_TURN = 1;
export const SULFURAS_STACK_MAX = 3;

// Katana Z passives
export const KATANA_Z_ATK_PER_HIT = 5;           // +5% ATK par coup
export const KATANA_Z_STACK_PERSIST_CHANCE = 0.5; // 50% chance de rester entre tours
export const KATANA_Z_COUNTER_CHANCE = 0.5;       // 50% contre-attaque quand touche
export const KATANA_Z_COUNTER_MULT = 2.0;         // 200% ATK du joueur

// Katana V passives (nerfed: was 3%/10stacks/30% → 1.5%/7stacks/18%)
export const KATANA_V_DOT_PCT = 0.015;            // 1.5% maxMana (INT) du joueur par stack par tour — was 3%
export const KATANA_V_DOT_MAX_STACKS = 7;         // max 7 stacks de DoT — was 10
export const KATANA_V_BUFF_CHANCE = 0.18;          // 18% chance de buff par coup — was 30%

// Baton de Gul'dan passives — Halo Eternelle (nerfed: was 50% stun → 5%, heal 10% → 4%, SPD 200% → 80%)
export const GULDAN_HEAL_PER_STACK = 0.02;         // +2% heal per stack (% of damage dealt) — was 10%
export const GULDAN_STUN_CHANCE = 0.05;            // 5% stun chance per stack end of turn — was 50%
export const GULDAN_DEF_PER_HIT = 0.01;            // +1% DEF per attack (permanent in fight) — was 2%
export const GULDAN_ATK_PER_HIT = 0.015;           // +1.5% ATK per hit (stackable)
export const GULDAN_SPD_CHANCE = 0.25;             // 25% chance to boost attack speed — was 50%
export const GULDAN_SPD_BOOST = 0.80;              // +80% SPD boost per stack — was 200%
export const GULDAN_SPD_MAX_STACKS = 3;            // max 3 SPD stacks

// ═══════════════════════════════════════════════════════════════
// EXPEDITION WEAPON PASSIVES — shared across all combat modes
// ═══════════════════════════════════════════════════════════════

// List of all expedition passive IDs for easy checking
export const EXPEDITION_PASSIVE_IDS = [
  'ragnarok_fury', 'kusanagi_shadow', 'gae_bolg_pierce', 'masamune_blade',
  'longinus_holy', 'tyrfing_curse', 'ea_celestial', 'fragarach_wind',
  'tacos_chaos', 'amenonuhoko_divine',
];

/** Initialize passiveState fields for an expedition weapon passive */
export function initExpPassive(passiveId) {
  switch (passiveId) {
    case 'ragnarok_fury':     return { ragnarokHits: 0 };
    case 'kusanagi_shadow':   return { kusanagiStacks: 0, kusanagiX5: false };
    case 'gae_bolg_pierce':   return { gaeBolgFirst: true, gaeBolgTurns: 0 };
    case 'masamune_blade':    return { masamuneSaves: 2, masamuneCD: 0, masamuneShield: 0 };
    case 'longinus_holy':     return {};
    case 'tyrfing_curse':     return { tyrfingStacks: 0, tyrfingLifesteal: 0, tyrfingInvCD: 0, tyrfingInvActive: false };
    case 'ea_celestial':      return { eaDoubleStrike: false };
    case 'fragarach_wind':    return { fragarachHits: 0 };
    case 'tacos_chaos':       return { tacosStacks: 0, tacosKills: 0 };
    case 'amenonuhoko_divine': return { amenoShield: 0, amenoRezUsed: false };
    default: return {};
  }
}

/**
 * Before-attack phase: modify atkMult and fighter stats.
 * Returns { atkMult, bonusDmg, defPenPct, log[], dodgeChance, doubleStrike }
 */
export function expPassiveBeforeAttack(ps, passiveId, fighter, enemy, isCrit, isBoss) {
  const r = { atkMult: 0, bonusDmg: 0, defPenPct: 0, log: [], dodgeChance: 0, doubleStrike: false };
  if (!passiveId) return r;
  switch (passiveId) {
    case 'ragnarok_fury':
      // Nothing before attack
      break;
    case 'kusanagi_shadow':
      // Permanent 20% DEF ignore + stacked ATK
      r.defPenPct += 0.20;
      if (ps.kusanagiStacks > 0) {
        r.atkMult += ps.kusanagiStacks * 0.05;
        r.log.push(`Kusanagi x${ps.kusanagiStacks} ! ATK +${ps.kusanagiStacks * 5}%`);
      }
      if (ps.kusanagiX5) {
        r.atkMult += 4.0; // x5 total (1 + 4)
        r.log.push('Kusanagi ULTIME ! Degats x5 !');
      }
      break;
    case 'gae_bolg_pierce':
      if (ps.gaeBolgFirst) {
        r.atkMult += 2.0; // x3 total
        r.log.push('Gae Bolg ! Premiere attaque x3 !');
      }
      break;
    case 'masamune_blade':
      if (fighter.hp > fighter.maxHp * 0.5) {
        r.atkMult += 0.35;
        r.log.push('Masamune : HP > 50%, DMG +35%');
      }
      break;
    case 'longinus_holy':
      r.defPenPct += 0.30;
      if (isBoss) {
        r.atkMult += 0.25;
        r.log.push('Longinus : +25% vs Boss !');
      }
      break;
    case 'tyrfing_curse':
      if (ps.tyrfingStacks > 0) {
        r.atkMult += ps.tyrfingStacks * 0.08;
        r.log.push(`Tyrfing x${ps.tyrfingStacks} ! ATK +${ps.tyrfingStacks * 8}%`);
      }
      if (fighter.hp < fighter.maxHp * 0.3 && ps.tyrfingInvCD <= 0) {
        r.atkMult += 1.0; // ATK x2
        r.log.push('Tyrfing RAGE ! HP < 30% → ATK x2 + Invincible !');
      }
      break;
    case 'ea_celestial':
      if (fighter.hp > fighter.maxHp * 0.7) {
        r.atkMult += 0.40;
        r.log.push('Ea Celeste : HP > 70%, DMG +40%');
      }
      if (Math.random() < 0.30) {
        r.doubleStrike = true;
        r.log.push('Ea : Coup double !');
      }
      break;
    case 'fragarach_wind':
      r.dodgeChance += 0.15;
      break;
    case 'tacos_chaos':
      if (ps.tacosStacks > 0) {
        r.atkMult += ps.tacosStacks * 0.10;
        r.log.push(`Tacos x${ps.tacosStacks} ! Tous stats +${ps.tacosStacks * 10}%`);
      }
      break;
    case 'amenonuhoko_divine':
      r.atkMult += 0.15; // permanent +15% stats
      break;
  }
  return r;
}

/**
 * After-attack phase: update state, apply post-hit effects.
 * Mutates ps in-place. Returns { log[], healAmount, bonusDmg, enemyDebuffs[], shield }
 */
export function expPassiveAfterAttack(ps, passiveId, fighter, enemy, damage, isCrit, killed) {
  const r = { log: [], healAmount: 0, bonusDmg: 0, enemyDebuffs: [], shield: 0 };
  if (!passiveId) return r;
  switch (passiveId) {
    case 'ragnarok_fury':
      ps.ragnarokHits++;
      if (killed) ps.ragnarokHits = 0;
      if (ps.ragnarokHits >= 3) {
        ps.ragnarokHits = 0;
        r.bonusDmg = Math.floor(fighter.atk * 4.0);
        r.enemyDebuffs.push({ type: 'def', val: -0.20, turns: 3 });
        r.log.push(`Ragnarok AoE ! +${r.bonusDmg} degats feu ! Ennemi: -20% DEF`);
      }
      break;
    case 'kusanagi_shadow':
      if (ps.kusanagiX5) ps.kusanagiX5 = false; // consume
      if (isCrit && ps.kusanagiStacks < 10) {
        ps.kusanagiStacks++;
        r.log.push(`Kusanagi crit ! Stack ${ps.kusanagiStacks}/10`);
        if (ps.kusanagiStacks >= 10) {
          ps.kusanagiX5 = true;
          ps.kusanagiStacks = 0;
          r.log.push('Kusanagi CHARGE ! Prochain coup x5 !');
        }
      }
      break;
    case 'gae_bolg_pierce':
      ps.gaeBolgFirst = false;
      ps.gaeBolgTurns++;
      if (ps.gaeBolgTurns >= 3) {
        ps.gaeBolgTurns = 0;
        r.bonusDmg = Math.floor(fighter.atk * 2.0);
        r.log.push(`Gae Bolg Dash ! +${r.bonusDmg} degats AoE !`);
      }
      break;
    case 'masamune_blade':
      if (ps.masamuneCD > 0) ps.masamuneCD--;
      if (killed) {
        r.healAmount = Math.floor(fighter.maxHp * 0.10);
        r.shield = Math.floor(fighter.maxHp * 0.05);
        ps.masamuneShield += r.shield;
        r.log.push(`Masamune Kill ! +${r.healAmount} PV, +${r.shield} bouclier`);
      }
      break;
    case 'longinus_holy':
      if (isCrit) {
        r.bonusDmg = Math.floor(fighter.atk * 1.5);
        r.log.push(`Longinus Onde Sacree ! +${r.bonusDmg} degats !`);
      }
      break;
    case 'tyrfing_curse':
      if (fighter.hp < fighter.maxHp * 0.3 && ps.tyrfingInvCD <= 0) {
        ps.tyrfingInvActive = true;
        ps.tyrfingInvCD = 20;
      }
      if (ps.tyrfingInvCD > 0) ps.tyrfingInvCD--;
      if (killed && ps.tyrfingStacks < 10) {
        ps.tyrfingStacks++;
        ps.tyrfingLifesteal = ps.tyrfingStacks * 5;
        r.log.push(`Tyrfing Kill ! Stack ${ps.tyrfingStacks}/10, Vol vie ${ps.tyrfingLifesteal}%`);
      }
      if (ps.tyrfingLifesteal > 0 && damage > 0) {
        r.healAmount = Math.floor(damage * ps.tyrfingLifesteal / 100);
        if (r.healAmount > 0) r.log.push(`Tyrfing Vol vie : +${r.healAmount} PV`);
      }
      break;
    case 'ea_celestial':
      // No post-attack state changes
      break;
    case 'fragarach_wind':
      ps.fragarachHits++;
      if (ps.fragarachHits >= 5) {
        ps.fragarachHits = 0;
        r.bonusDmg = Math.floor(fighter.atk * 3.5);
        r.log.push(`Fragarach Tornado ! +${r.bonusDmg} degats !`);
      }
      break;
    case 'tacos_chaos':
      r.enemyDebuffs.push({ type: 'atk', val: -0.30, turns: 2 });
      r.log.push('Tacos Confusion ! Ennemi: -30% ATK 2T');
      if (killed) {
        ps.tacosStacks++;
        ps.tacosKills++;
        r.log.push(`Tacos Kill ! +10% tous stats (x${ps.tacosStacks})`);
        if (ps.tacosKills % 5 === 0) {
          r.bonusDmg = Math.floor(fighter.atk * 5.0);
          r.log.push(`AoE KEBAB ! +${r.bonusDmg} degats massifs !`);
        }
      }
      break;
    case 'amenonuhoko_divine':
      if (damage > 0) {
        r.healAmount = Math.floor(damage * 0.15);
        const maxShield = Math.floor(fighter.maxHp * 0.30);
        const currentHP = fighter.hp + r.healAmount;
        if (currentHP > fighter.maxHp) {
          const overheal = currentHP - fighter.maxHp;
          r.healAmount -= overheal;
          ps.amenoShield = Math.min(maxShield, (ps.amenoShield || 0) + overheal);
          r.log.push(`Amenonuhoko : +${overheal} bouclier (${ps.amenoShield}/${maxShield})`);
        }
        if (r.healAmount > 0) r.log.push(`Amenonuhoko Vol vie : +${r.healAmount} PV`);
      }
      break;
  }
  return r;
}

/**
 * On-damage-taken phase: handle shields, dodge counter, lethal absorption.
 * Returns { reducedDmg, counterDmg, log[], absorbed }
 */
export function expPassiveOnDamageTaken(ps, passiveId, fighter, incomingDmg) {
  const r = { reducedDmg: incomingDmg, counterDmg: 0, log: [], absorbed: false };
  if (!passiveId) return r;
  switch (passiveId) {
    case 'masamune_blade':
      // Shield absorbs damage first
      if (ps.masamuneShield > 0) {
        const absorbed = Math.min(ps.masamuneShield, r.reducedDmg);
        ps.masamuneShield -= absorbed;
        r.reducedDmg -= absorbed;
        if (absorbed > 0) r.log.push(`Masamune Bouclier absorbe ${absorbed} degats`);
      }
      // Lethal blow absorption
      if (fighter.hp - r.reducedDmg <= 0 && ps.masamuneSaves > 0 && ps.masamuneCD <= 0) {
        r.reducedDmg = fighter.hp - 1; // survive with 1 HP
        ps.masamuneSaves--;
        ps.masamuneCD = 15;
        r.absorbed = true;
        r.log.push(`Masamune Immortel ! Coup mortel absorbe (${ps.masamuneSaves} restants)`);
      }
      break;
    case 'tyrfing_curse':
      if (ps.tyrfingInvActive) {
        r.reducedDmg = 0;
        ps.tyrfingInvActive = false;
        r.log.push('Tyrfing Invincible ! 0 degats ce tour !');
      }
      break;
    case 'fragarach_wind':
      // Dodge already handled via dodgeChance in beforeAttack
      // Counter on dodge: 300% damage
      if (Math.random() < 0.15) {
        r.reducedDmg = 0;
        r.counterDmg = Math.floor(fighter.atk * 3.0);
        r.log.push(`Fragarach Esquive + Contre-attaque ! ${r.counterDmg} degats !`);
      }
      break;
    case 'amenonuhoko_divine':
      // Shield absorbs damage
      if (ps.amenoShield > 0) {
        const absorbed = Math.min(ps.amenoShield, r.reducedDmg);
        ps.amenoShield -= absorbed;
        r.reducedDmg -= absorbed;
        if (absorbed > 0) r.log.push(`Amenonuhoko Bouclier : -${absorbed} degats`);
      }
      // Self-rez on lethal
      if (fighter.hp - r.reducedDmg <= 0 && !ps.amenoRezUsed) {
        r.reducedDmg = fighter.hp - Math.floor(fighter.maxHp * 0.40);
        if (r.reducedDmg < 0) r.reducedDmg = 0;
        ps.amenoRezUsed = true;
        r.absorbed = true;
        r.log.push('Amenonuhoko Resurrection ! Revient a 40% HP !');
      }
      break;
  }
  return r;
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

export const MAX_EVEIL_STARS = 1000; // Awakening up to A1000
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
  dropChance: { 1: 0.10, 2: 0.15, 3: 0.20, 4: 0.25, 5: 0.30, 6: 0 },
  fullClearGuaranteed: true,
  tierPool: {
    1: ['rare', 'legendaire'], 2: ['legendaire'],
    3: ['legendaire', 'mythique'], 4: ['mythique'], 5: ['mythique'], 6: ['mythique'],
  },
};

// Ultime mode: RC-scaled weapon drop (starts RC 3, chance grows with RC)
export function rollUltimeWeaponDrop(rc) {
  if (rc < 3) return null;
  // Base 2% at RC 3, +1% per RC, caps at 40%
  const chance = Math.min(0.40, 0.02 + (rc - 3) * 0.01);
  if (Math.random() > chance) return null;
  // 70% chance normal mythique, 30% chance ultime weapon
  const isUltime = Math.random() < Math.min(0.60, 0.05 + rc * 0.015);
  if (isUltime) {
    const ultWeapons = Object.values(WEAPONS).filter(w => w.ultime);
    return ultWeapons.length > 0 ? ultWeapons[Math.floor(Math.random() * ultWeapons.length)].id : null;
  }
  const mythiques = Object.values(WEAPONS).filter(w => !w.secret && !w.ultime && !w.expedition && w.rarity === 'mythique');
  return mythiques.length > 0 ? mythiques[Math.floor(Math.random() * mythiques.length)].id : null;
}

// Ultime mode: RC-scaled artifact drop
export function generateUltimeArtifact(rc) {
  // Always mythique in ultime
  const rarity = 'mythique';
  // 60% chance ultime set, 40% chance other sets
  const isUltime = Math.random() < Math.min(0.80, 0.20 + rc * 0.02);
  const setPool = isUltime ? Object.keys(ULTIME_ARTIFACT_SETS) : Object.keys(RAID_ARTIFACT_SETS);
  const set = setPool[Math.floor(Math.random() * setPool.length)];
  const slot = SLOT_ORDER[Math.floor(Math.random() * SLOT_ORDER.length)];
  const slotDef = ARTIFACT_SLOTS[slot];
  const mainStatId = slotDef.mainStats[Math.floor(Math.random() * slotDef.mainStats.length)];
  const subCount = RARITY_SUB_COUNT[rarity].initial;
  const availableSubs = SUB_STAT_POOL.filter(s => s.id !== mainStatId);
  const subs = [];
  const usedIds = new Set();
  for (let i = 0; i < subCount; i++) {
    const pool = availableSubs.filter(s => !usedIds.has(s.id));
    if (pool.length === 0) break;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    usedIds.add(pick.id);
    subs.push({ id: pick.id, value: pick.range[0] + Math.floor(Math.random() * (pick.range[1] - pick.range[0] + 1)) });
  }
  return { set, slot, rarity, mainStat: mainStatId, mainValue: MAIN_STAT_VALUES[mainStatId]?.max || 0, subs, level: 0, uid: `ult_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` };
}

// Generate a specific-set mythique artifact (used for secret drops like Pacte des Ombres)
export function generateSetArtifact(setId) {
  const rarity = 'mythique';
  const slot = SLOT_ORDER[Math.floor(Math.random() * SLOT_ORDER.length)];
  const slotDef = ARTIFACT_SLOTS[slot];
  const mainStatId = slotDef.mainStats[Math.floor(Math.random() * slotDef.mainStats.length)];
  const subCount = RARITY_SUB_COUNT[rarity].initial;
  const availableSubs = SUB_STAT_POOL.filter(s => s.id !== mainStatId);
  const subs = [];
  const usedIds = new Set();
  for (let i = 0; i < subCount; i++) {
    const pool = availableSubs.filter(s => !usedIds.has(s.id));
    if (pool.length === 0) break;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    usedIds.add(pick.id);
    subs.push({ id: pick.id, value: pick.range[0] + Math.floor(Math.random() * (pick.range[1] - pick.range[0] + 1)) });
  }
  return { set: setId, slot, rarity, mainStat: mainStatId, mainValue: MAIN_STAT_VALUES[mainStatId]?.max || 0, subs, level: 0, uid: `pact_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` };
}

export function rollWeaponDrop(stageTier, isBoss = false) {
  const baseChance = COLOSSEUM_WEAPON_DROP.dropChance[stageTier] || 0.03;
  const chance = isBoss ? baseChance * COLOSSEUM_WEAPON_DROP.bossMultiplier : baseChance;
  if (Math.random() > chance) return null;
  const rarityPool = COLOSSEUM_WEAPON_DROP.tierPool[stageTier] || ['rare'];
  const rarity = rarityPool[Math.floor(Math.random() * rarityPool.length)];
  const candidates = Object.values(WEAPONS).filter(w => !w.secret && !w.community && w.rarity === rarity);
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

// ═══════════════════════════════════════════════════════════════
// ARTIFACT SCORING — Role-based quality rating
// ═══════════════════════════════════════════════════════════════

export const ROLE_WEIGHTS = {
  dps:     { atk_pct: 3, atk_flat: 2, crit_dmg: 3, crit_rate: 2.5, spd_flat: 2, hp_pct: 0.5, hp_flat: 0.3, def_pct: 0.5, def_flat: 0.3, res_flat: 0.3, int_flat: 0.3, int_pct: 0.3 },
  mage:    { int_pct: 3, int_flat: 2.5, crit_dmg: 3, crit_rate: 2.5, spd_flat: 2, atk_pct: 0.5, atk_flat: 0.3, hp_pct: 0.5, hp_flat: 0.3, def_pct: 0.5, def_flat: 0.3, res_flat: 0.3 },
  support: { int_pct: 3, int_flat: 2.5, spd_flat: 3, hp_pct: 2, hp_flat: 1.5, def_pct: 1.5, def_flat: 1, res_flat: 1.5, crit_rate: 1, crit_dmg: 0.5, atk_pct: 0.3, atk_flat: 0.3 },
  tank:    { def_pct: 3, def_flat: 2.5, hp_pct: 3, hp_flat: 2, res_flat: 2, spd_flat: 1.5, atk_pct: 0.5, atk_flat: 0.5, crit_dmg: 0.5, crit_rate: 0.5, int_flat: 0.3, int_pct: 0.3 },
};

// Max possible weighted score for normalization (mythique +20, 4 max subs)
const MAX_RAW_SCORE = 220;

export function scoreArtifact(art, role = 'dps') {
  if (!art) return 0;
  const w = ROLE_WEIGHTS[role] || ROLE_WEIGHTS.dps;

  // Main stat contribution
  let raw = (art.mainValue || 0) * (w[art.mainStat] || 0.5) * 0.3;

  // Sub stats contribution
  (art.subs || []).forEach(sub => {
    raw += (sub.value || 0) * (w[sub.id] || 0.5);
  });

  // Rarity bonus
  const rarityMult = art.rarity === 'mythique' ? 1.3 : art.rarity === 'legendaire' ? 1.1 : 1.0;
  raw *= rarityMult;

  // Level bonus
  raw += (art.level || 0) * 2;

  // Normalize to 0-100
  return Math.min(100, Math.round((raw / MAX_RAW_SCORE) * 100));
}

export function scoreToGrade(score) {
  if (score >= 85) return { grade: 'S', color: 'text-red-400', bg: 'bg-red-500/20' };
  if (score >= 65) return { grade: 'A', color: 'text-orange-400', bg: 'bg-orange-500/20' };
  if (score >= 45) return { grade: 'B', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
  if (score >= 25) return { grade: 'C', color: 'text-green-400', bg: 'bg-green-500/20' };
  return { grade: 'D', color: 'text-gray-400', bg: 'bg-gray-500/20' };
}

export function scoreAllArtifacts(equippedArtifacts, role = 'dps') {
  if (!equippedArtifacts) return { scores: {}, avgScore: 0, avgGrade: scoreToGrade(0) };
  const scores = {};
  let total = 0;
  let count = 0;
  SLOT_ORDER.forEach(slotId => {
    const art = equippedArtifacts[slotId];
    if (art) {
      const s = scoreArtifact(art, role);
      scores[slotId] = s;
      total += s;
      count++;
    }
  });
  const avgScore = count > 0 ? Math.round(total / count) : 0;
  return { scores, avgScore, avgGrade: scoreToGrade(avgScore) };
}

export function rollRaidWeaponDrop(raidTier, isFullClear = false) {
  if (isFullClear && RAID_WEAPON_DROP.fullClearGuaranteed) {
    const rarityPool = RAID_WEAPON_DROP.tierPool[raidTier] || ['rare'];
    const rarity = rarityPool[Math.floor(Math.random() * rarityPool.length)];
    const candidates = Object.values(WEAPONS).filter(w => !w.secret && !w.community && w.rarity === rarity);
    return candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)].id : null;
  }
  const chance = RAID_WEAPON_DROP.dropChance[raidTier] || 0.10;
  if (Math.random() > chance) return null;
  const rarityPool = RAID_WEAPON_DROP.tierPool[raidTier] || ['rare'];
  const rarity = rarityPool[Math.floor(Math.random() * rarityPool.length)];
  const candidates = Object.values(WEAPONS).filter(w => !w.secret && !w.community && w.rarity === rarity);
  return candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)].id : null;
}

// ═══════════════════════════════════════════════════════════════
// ARC II ARTIFACT SETS (Nier Automata themed — stronger than standard)
// ═══════════════════════════════════════════════════════════════

export const ARC2_ARTIFACT_SETS = {
  // ── Toughness (4p) — Crit offensif simple ──
  toughness: {
    id: 'toughness', name: 'Toughness', icon: '\uD83E\uDDF1', arc2: true,
    color: 'text-yellow-300', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30',
    desc: 'Resistance et critiques devastatrices',
    bonus2: { critRate: 8 }, bonus2Desc: 'CRIT Rate +8%',
    bonus4: { critDamage: 32 }, bonus4Desc: 'CRIT DMG +32%',
    passive2: null, passive4: null,
  },

  // ── Burning Curse (8p) — Glass cannon : plus de degats, plus fragile ──
  burning_curse: {
    id: 'burning_curse', name: 'Burning Curse', icon: '\uD83D\uDD25', arc2: true,
    color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30',
    desc: 'Malediction brulante — plus de degats, plus de risques',
    bonus2: {}, bonus2Desc: '[Curse] Degats infliges +10%, Degats recus +20%. +0.1% DMG/tour (max 100x)',
    bonus4: {}, bonus4Desc: '[Enhanced Curse] Degats infliges +20%, Degats recus +20%. +0.1% DMG/tour. [Rescue] Heal 25% PV si < 25% (1x)',
    bonus8: {}, bonus8Desc: '[Burning Curse] Degats infliges +30%, Degats recus +20%. +0.2% DMG/tour (max 100x)',
    passive2: {
      trigger: 'onBattleStart', type: 'curse',
      damageDealt: 0.10, damageTaken: 0.20, stackPerTurn: 0.001, maxStacks: 100,
    },
    passive4: {
      trigger: 'onBattleStart', type: 'enhancedCurse',
      damageDealt: 0.20, damageTaken: 0.20, stackPerTurn: 0.001, maxStacks: 100,
      rescue: true, rescueThreshold: 0.25, rescueHeal: 0.25, rescueOnce: true,
    },
    passive8: {
      trigger: 'onBattleStart', type: 'burningCurse',
      damageDealt: 0.30, damageTaken: 0.20, stackPerTurn: 0.002, maxStacks: 100,
    },
  },

  // ── Burning Greed (8p) — Break + montee crit en equipe ──
  burning_greed: {
    id: 'burning_greed', name: 'Burning Greed', icon: '\uD83D\uDC8E', arc2: true,
    color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30',
    desc: "L'avidite brulante — brise les armures, renforce les critiques",
    bonus2: {}, bonus2Desc: '[Greed] Sur Break : CRIT Rate +1%/stack (max 10x, CD 2 tours)',
    bonus4: {}, bonus4Desc: '[Enhanced Greed] Sur Break : CRIT Rate +2%/stack (max 10x, CD 1 tour)',
    bonus8: { critRate: 15, critDamage: 30 },
    bonus8Desc: '[Burning Greed] Break +30% sur faiblesse. Equipe : CRIT Rate +15%, CRIT DMG +30%',
    passive2: {
      trigger: 'onBreakHit', type: 'greed',
      critPerStack: 1, maxStacks: 10, cooldown: 2,
    },
    passive4: {
      trigger: 'onBreakHit', type: 'enhancedGreed',
      critPerStack: 2, maxStacks: 10, cooldown: 1,
    },
    passive8: {
      trigger: 'always', type: 'burningGreed',
      breakBonus: 0.30, teamCritRate: 15, teamCritDamage: 30,
    },
  },

  // ── Iron Will (4p) — Tank / Ultimate devastateur ──
  iron_will: {
    id: 'iron_will', name: 'Iron Will', icon: '\u2694\uFE0F', arc2: true,
    color: 'text-blue-300', bg: 'bg-blue-500/15', border: 'border-blue-500/30',
    desc: 'Volonte de fer — defense imprenable et ultimate devastateur',
    bonus2: { defPercent: 8 }, bonus2Desc: 'DEF +8%',
    bonus4: {}, bonus4Desc: 'Ultimate : DEF +5% par utilisation (max 5x). Degats Ultimate +50%',
    passive2: null,
    passive4: {
      trigger: 'onUltimate', type: 'ironWill',
      defPerStack: 0.05, maxStacks: 5, ultDamageBonus: 0.50,
    },
  },

  // ── Chaotic Infamy (8p) — Basic Skill snowball + risk/reward ──
  chaotic_infamy: {
    id: 'chaotic_infamy', name: 'Chaotic Infamy', icon: '\uD83D\uDC79', arc2: true,
    color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30',
    desc: 'Infamie chaotique — montee en puissance du Basic Skill',
    bonus2: {}, bonus2Desc: '[Infamy] Par skill : Basic DMG +1.5%/stack (max 20x), Degats recus +1%/stack (max 20x)',
    bonus4: {}, bonus4Desc: '[Enhanced Infamy] Basic DMG +2.5%/stack (max 20x), Degats recus +1%/stack. Basic : MP +5% (CD 3 tours)',
    bonus8: {},
    bonus8Desc: '[Chaotic Infamy] En equipe : Degats +40%. A 10 stacks : Basic + Ultimate DMG +100%. Retire Degats recus. MP +5% sur Basic (CD 3 tours)',
    passive2: {
      trigger: 'onSkillUse', type: 'infamy',
      basicDmgPerStack: 0.015, damageTakenPerStack: 0.01, maxStacks: 20,
    },
    passive4: {
      trigger: 'onSkillUse', type: 'enhancedInfamy',
      basicDmgPerStack: 0.025, damageTakenPerStack: 0.01, maxStacks: 20,
      mpRecovery: 0.05, mpCooldown: 3,
    },
    passive8: {
      trigger: 'always', type: 'chaoticInfamy',
      teamDamage: 0.40, chaoticThreshold: 10,
      chaoticBonus: 1.00, removeDamageTaken: true,
      mpRecovery: 0.05, mpCooldown: 3,
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// ULTIME ARTIFACT SETS (5 sets — Raid Ultime exclusive)
// ═══════════════════════════════════════════════════════════════

export const ULTIME_ARTIFACT_SETS = {
  rage_eternelle: {
    id: 'rage_eternelle', name: 'Rage Eternelle', icon: '\uD83D\uDCA2', ultime: true,
    color: 'text-red-500', bg: 'bg-red-600/15', border: 'border-red-600/30',
    desc: 'Puissance brute qui grandit a chaque coup',
    bonus2: { atkPercent: 12 }, bonus2Desc: 'ATK +12%. Chaque attaque : ATK +1% (max 15 stacks)',
    bonus4: {}, bonus4Desc: 'A 15 stacks : CRIT garanti + DMG +40%. Ignore 15% DEF',
    passive2: { trigger: 'afterAttack', type: 'eternalRageStack', atkPerStack: 0.01, maxStacks: 15 },
    passive4: { trigger: 'beforeAttack', type: 'eternalRageRelease', stackThreshold: 15, autoCrit: true, bonusDmg: 0.40, defIgnore: 0.15 },
  },
  gardien_celeste: {
    id: 'gardien_celeste', name: 'Gardien Celeste', icon: '\uD83D\uDEE1\uFE0F', ultime: true,
    color: 'text-cyan-400', bg: 'bg-cyan-500/15', border: 'border-cyan-500/30',
    desc: 'Bouclier divin et protection absolue',
    bonus2: { defPercent: 15, hpPercent: 10 }, bonus2Desc: 'DEF +15%, HP +10%. Debut combat : Bouclier 20% HP max',
    bonus4: {}, bonus4Desc: 'Bouclier intact : +25% DMG. Bouclier brise : Heal 30% HP + DEF +20% (3 tours)',
    passive2: { trigger: 'onBattleStart', type: 'celestialShield', shieldPct: 0.20 },
    passive4: { trigger: 'onShieldBreak', type: 'celestialWrath', dmgWhileShield: 0.25, healOnBreak: 0.30, defBoost: 0.20, defDuration: 3 },
  },
  siphon_vital: {
    id: 'siphon_vital', name: 'Siphon Vital', icon: '\uD83E\uDE78', ultime: true,
    color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30',
    desc: 'Drain de vie supreme — chaque coup guerit',
    bonus2: {}, bonus2Desc: '25% chance voler 15% DMG en PV. Surcharge PV = bouclier (max 20%)',
    bonus4: {}, bonus4Desc: 'PV > 80% : DMG +30%. PV < 30% : Lifesteal 100% pendant 2 tours (CD 10 tours)',
    passive2: { trigger: 'afterAttack', type: 'vitalSiphon', chance: 0.25, stealPct: 0.15, overHealShield: 0.20 },
    passive4: { trigger: 'always', type: 'vitalSurge', highHpThreshold: 0.80, highHpDmg: 0.30, lowHpThreshold: 0.30, emergencySteal: 1.0, emergencyDuration: 2, emergencyCD: 10 },
  },
  tempete_arcane: {
    id: 'tempete_arcane', name: 'Tempete Arcane', icon: '\u26A1', ultime: true,
    color: 'text-violet-400', bg: 'bg-violet-600/15', border: 'border-violet-600/30',
    desc: 'Pouvoir arcane dechaine — skills surcharges',
    bonus2: { manaPercent: 40, manaCostReduce: 15 }, bonus2Desc: 'Mana Max +40%, Cout -15%. Skills : DMG +2% par 10% mana restant',
    bonus4: {}, bonus4Desc: 'Mana plein : Prochain skill x2 DMG (CD 5 tours). Regen Mana +80%',
    passive2: { trigger: 'beforeAttack', type: 'arcaneTempest', dmgPerMana10Pct: 0.02 },
    passive4: { trigger: 'onFullMana', type: 'arcaneOverload', dmgMult: 2.0, cooldown: 5, manaRegenBonus: 0.80 },
  },
  equilibre_supreme: {
    id: 'equilibre_supreme', name: 'Equilibre Supreme', icon: '\u2696\uFE0F', ultime: true,
    color: 'text-amber-300', bg: 'bg-amber-400/15', border: 'border-amber-400/30',
    desc: "L'equilibre parfait — toutes les stats harmonisees",
    bonus2: { atkPercent: 8, defPercent: 8, hpPercent: 8, critRate: 5, critDamage: 10 },
    bonus2Desc: 'ATK +8%, DEF +8%, HP +8%, CRIT +5%, CRIT DMG +10%',
    bonus4: {}, bonus4Desc: 'Adaptatif : la stat la plus basse recoit +25%. Tous les 5 tours : toutes stats +10% (3 tours)',
    passive2: null,
    passive4: { trigger: 'onBattleStart', type: 'supremeBalance', lowestStatBonus: 0.25, allStatsInterval: 5, allStatsBonus: 0.10, allStatsDuration: 3 },
  },
  pacte_ombres: {
    id: 'pacte_ombres', name: 'Pacte des Ombres', icon: '\uD83C\uDF11', ultime: true,
    color: 'text-purple-300', bg: 'bg-purple-800/20', border: 'border-purple-600/40',
    desc: 'Sacrifice personnel pour la puissance de ses allies',
    bonus2: {}, bonus2Desc: 'ATK -50% (soi-meme). ATK +150% pour les coequipiers (meme team)',
    bonus4: {}, bonus4Desc: 'Degats totaux +25% pour tout le raid (les 2 teams)',
    passive2: { trigger: 'onBattleStart', type: 'shadowPact', selfAtkMult: -0.50, allyAtkBoost: 1.50 },
    passive4: { trigger: 'always', type: 'shadowPactRaid', raidDmgBoost: 0.25 },
  },
  esprit_transcendant: {
    id: 'esprit_transcendant', name: 'Esprit Transcendant', icon: '\uD83E\uDDE0', ultime: true,
    color: 'text-indigo-400', bg: 'bg-indigo-600/15', border: 'border-indigo-600/30',
    desc: 'Intelligence pure dechainee — burst arcanique devastateur',
    bonus2: { manaPercent: 30, manaRegen: 25 }, bonus2Desc: 'INT +30% (Mana), Mana Regen +25%. Chaque skill : stack INT +2% (max 10)',
    bonus4: {}, bonus4Desc: 'A 10 stacks : prochain skill ignore 25% DEF + DMG x1.5. Reset stacks.',
    passive2: { trigger: 'afterAttack', type: 'transcendentStack', intPerStack: 0.02, maxStacks: 10 },
    passive4: { trigger: 'beforeAttack', type: 'transcendentRelease', stackThreshold: 10, defIgnore: 0.25, dmgMult: 1.5 },
  },
  resonance_arcanique: {
    id: 'resonance_arcanique', name: 'Resonance Arcanique', icon: '\uD83D\uDD2E', ultime: true,
    color: 'text-fuchsia-400', bg: 'bg-fuchsia-600/15', border: 'border-fuchsia-600/30',
    desc: 'Maitrise du mana — puissance soutenue et adaptative',
    bonus2: { manaPercent: 20, manaCostReduce: 25 }, bonus2Desc: 'INT +20% (Mana), Cout Mana -25%. Skills mana-scaling : +15% puissance',
    bonus4: {}, bonus4Desc: 'Mana > 60% : CRIT garanti. Mana < 30% : Regen x3 pendant 3 tours (CD 8)',
    passive2: { trigger: 'beforeAttack', type: 'arcaneResonance', manaScalingBonus: 0.15 },
    passive4: { trigger: 'always', type: 'arcaneAdaptive', highManaThreshold: 0.60, autoCrit: true, lowManaThreshold: 0.30, regenMult: 3, regenDuration: 3, cooldown: 8 },
  },
};

// ═══════════════════════════════════════════════════════════════
// EXPEDITION ARTIFACT SETS (25 sets — from Expedition raids)
// ═══════════════════════════════════════════════════════════════

export const EXPEDITION_ARTIFACT_SETS = {
  // ── BIG SETS (10) — Powerful class-specific passives ──
  fureur_titan: {
    id: 'fureur_titan', name: 'Fureur du Titan', icon: '\u2694\uFE0F', expedition: true,
    color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30',
    desc: 'Monte en puissance au fil du combat',
    bonus2: { atkPercent: 15 }, bonus2Desc: 'ATK +15%',
    bonus4: {}, bonus4Desc: 'Chaque attaque: ATK +2% (max 20 stacks). A 20 stacks: crits garantis 5s puis reset. Kill = +3 stacks.',
    passive2: null, passive4: { trigger: 'afterAttack', type: 'titanFury' },
  },
  lame_fantome: {
    id: 'lame_fantome', name: 'Lame Fantome', icon: '\uD83D\uDDE1\uFE0F', expedition: true,
    color: 'text-teal-400', bg: 'bg-teal-500/15', border: 'border-teal-500/30',
    desc: 'Burst DPS en chain-crit',
    bonus2: { critRate: 12 }, bonus2Desc: 'CRIT +12%',
    bonus4: {}, bonus4Desc: 'Apres crit: prochain coup ignore 40% DEF. 15% chance double frappe. Kill = reset CD skill le plus long.',
    passive2: null, passive4: { trigger: 'afterCrit', type: 'ghostBlade' },
  },
  aegis_gardien: {
    id: 'aegis_gardien', name: 'Aegis du Gardien', icon: '\uD83C\uDFF0', expedition: true,
    color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30',
    desc: 'Tank protecteur qui contribue aux degats',
    bonus2: { defPercent: 20 }, bonus2Desc: 'DEF +20%, Aggro +25%',
    bonus4: {}, bonus4Desc: 'Absorbe 15% degats allies (200px). Bouclier a 50% max HP: explose AoE 300% ATK (150px), -20% ATK ennemis 8s.',
    passive2: null, passive4: { trigger: 'always', type: 'guardianAegis' },
  },
  souffle_vital: {
    id: 'souffle_vital', name: 'Souffle Vital', icon: '\uD83D\uDC9A', expedition: true,
    color: 'text-green-400', bg: 'bg-green-500/15', border: 'border-green-500/30',
    desc: 'Survie massive, soins jamais gaspilles',
    bonus2: { healBonus: 25 }, bonus2Desc: 'Soins +25%',
    bonus4: {}, bonus4Desc: 'Overheals = bouclier (max 20% HP, 10s). Allie < 25% HP: heal auto 15% (CD 12s/allie). 15% chance soin crit x2.',
    passive2: null, passive4: { trigger: 'onHeal', type: 'vitalBreath' },
  },
  tempete_acier: {
    id: 'tempete_acier', name: "Tempete d'Acier", icon: '\u26A1', expedition: true,
    color: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30',
    desc: 'Snowball en vitesse sur les vagues',
    bonus2: { spdPercent: 15 }, bonus2Desc: 'SPD +15%',
    bonus4: {}, bonus4Desc: 'Chaque 5eme attaque: 200% degats, ignore 20% DEF. SPD +5%/kill (max +25%). A +25%: doubles frappes.',
    passive2: null, passive4: { trigger: 'afterAttack', type: 'steelStorm' },
  },
  voix_neant: {
    id: 'voix_neant', name: 'Voix du Neant', icon: '\uD83C\uDF0C', expedition: true,
    color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30',
    desc: 'Amplifie les degats de toute l\'equipe',
    bonus2: {}, bonus2Desc: 'Degats magiques +15%',
    bonus4: {}, bonus4Desc: 'Attaques: DoT 3% ATK/s 8s (stack x3). 3 stacks: ennemi +25% degats TOUTES sources. DoT kill: AoE 200% ATK.',
    passive2: null, passive4: { trigger: 'afterAttack', type: 'voidVoice' },
  },
  pacte_sang: {
    id: 'pacte_sang', name: 'Pacte de Sang', icon: '\uD83E\uDE78', expedition: true,
    color: 'text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-500/30',
    desc: 'High risk/high reward. HP bas = puissance',
    bonus2: {}, bonus2Desc: 'Vol de vie +10%',
    bonus4: {}, bonus4Desc: 'HP < 50%: ATK +30%, vol vie +20%. Kill: restore 10% HP. HP < 15%: annule coup mortel (CD 45s) + Frenzy ATK+50%+SPD+30% 8s.',
    passive2: { trigger: 'afterAttack', type: 'bloodPactSteal' }, passive4: { trigger: 'always', type: 'bloodPact' },
  },
  bastion_eternel: {
    id: 'bastion_eternel', name: 'Bastion Eternel', icon: '\uD83C\uDFDB\uFE0F', expedition: true,
    color: 'text-sky-400', bg: 'bg-sky-500/15', border: 'border-sky-500/30',
    desc: 'Tank immortel qui scale en defense',
    bonus2: { hpPercent: 25 }, bonus2Desc: 'HP +25%',
    bonus4: {}, bonus4Desc: 'Resurrection passive: 30% HP +50% DEF 10s (1x/combat). Allies 250px: bouclier 10% HP tank. DEF +1%/coup subi (max +20%).',
    passive2: null, passive4: { trigger: 'onDeath', type: 'eternalBastion' },
  },
  harmonie_celeste: {
    id: 'harmonie_celeste', name: 'Harmonie Celeste', icon: '\u2728', expedition: true,
    color: 'text-amber-300', bg: 'bg-amber-400/15', border: 'border-amber-400/30',
    desc: 'Support permanent, pas juste du heal reactif',
    bonus2: { manaRegen: 50 }, bonus2Desc: 'Mana regen +50%',
    bonus4: {}, bonus4Desc: 'Buffs +50% duree. Sort: allies 300px +5% ATK (stack x3=+15%, 8s). Tous les 30s: mega-heal 10% HP + cleanse.',
    passive2: null, passive4: { trigger: 'always', type: 'celestialHarmony' },
  },
  nova_arcanique: {
    id: 'nova_arcanique', name: 'Nova Arcanique', icon: '\uD83C\uDF00', expedition: true,
    color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/15', border: 'border-fuchsia-500/30',
    desc: 'Combo burst pour mages, timing de sorts',
    bonus2: { manaPercent: 30 }, bonus2Desc: 'Mana max +30%',
    bonus4: {}, bonus4Desc: 'Apres 3 sorts: 4eme fait x2 degats et 0 mana. Kill par sort: tous CD -2s. Mana > 80%: degats +15%.',
    passive2: null, passive4: { trigger: 'afterAttack', type: 'arcaneNova' },
  },
  // ── MEDIUM SETS — Foret (Boss 1-5) ──
  ecailles_drake: {
    id: 'ecailles_drake', name: 'Ecailles de Drake', icon: '\uD83D\uDC32', expedition: true,
    color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30',
    desc: 'Defense et resistance aux AoE',
    bonus2: { defPercent: 12 }, bonus2Desc: 'DEF +12%',
    bonus4: { hpPercent: 15 }, bonus4Desc: 'HP +15%, reduit degats AoE -15%',
    passive2: null, passive4: null,
  },
  crocs_loup: {
    id: 'crocs_loup', name: 'Crocs du Loup', icon: '\uD83D\uDC3A', expedition: true,
    color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30',
    desc: 'ATK et degats critiques',
    bonus2: { atkPercent: 10 }, bonus2Desc: 'ATK +10%',
    bonus4: { critRate: 6, critDamage: 12 }, bonus4Desc: 'CRIT +6%, CRIT DMG +12%',
    passive2: null, passive4: null,
  },
  plumes_phenix: {
    id: 'plumes_phenix', name: 'Plumes de Phenix', icon: '\uD83E\uDEB6', expedition: true,
    color: 'text-orange-300', bg: 'bg-orange-400/15', border: 'border-orange-400/30',
    desc: 'Regeneration quand HP bas',
    bonus2: {}, bonus2Desc: 'Soins recus +15%',
    bonus4: {}, bonus4Desc: 'HP < 40%: regen 2% HP/5s',
    passive2: null, passive4: { trigger: 'always', type: 'phoenixRegen' },
  },
  griffes_wyverne: {
    id: 'griffes_wyverne', name: 'Griffes de Wyverne', icon: '\uD83E\uDD85', expedition: true,
    color: 'text-lime-400', bg: 'bg-lime-500/15', border: 'border-lime-500/30',
    desc: 'Vitesse et double attaque',
    bonus2: { atkPercent: 8 }, bonus2Desc: 'ATK +8%',
    bonus4: { spdPercent: 8 }, bonus4Desc: 'SPD +8%, chance double attaque +5%',
    passive2: null, passive4: null,
  },
  ronce_vivante: {
    id: 'ronce_vivante', name: 'Ronce Vivante', icon: '\uD83C\uDF3F', expedition: true,
    color: 'text-green-500', bg: 'bg-green-600/15', border: 'border-green-600/30',
    desc: 'Reflete les degats subis',
    bonus2: { defPercent: 10 }, bonus2Desc: 'DEF +10%',
    bonus4: {}, bonus4Desc: 'Reflete 8% des degats subis',
    passive2: null, passive4: { trigger: 'onHit', type: 'thornReflect' },
  },
  // ── MEDIUM SETS — Abysses (Boss 6-10) ──
  souffle_glacial: {
    id: 'souffle_glacial', name: 'Souffle Glacial', icon: '\u2744\uFE0F', expedition: true,
    color: 'text-cyan-400', bg: 'bg-cyan-500/15', border: 'border-cyan-500/30',
    desc: 'Degats Eau et ralentissement',
    bonus2: {}, bonus2Desc: 'Degats Eau +12%',
    bonus4: {}, bonus4Desc: 'Attaques: -10% SPD ennemis 3s',
    passive2: null, passive4: { trigger: 'afterAttack', type: 'frostSlow' },
  },
  cendres_ardentes: {
    id: 'cendres_ardentes', name: 'Cendres Ardentes', icon: '\uD83D\uDD25', expedition: true,
    color: 'text-red-500', bg: 'bg-red-600/15', border: 'border-red-600/30',
    desc: 'Degats Feu et brulure',
    bonus2: {}, bonus2Desc: 'Degats Feu +12%',
    bonus4: {}, bonus4Desc: '10% chance brulure (3% HP/s, 4s)',
    passive2: null, passive4: { trigger: 'afterAttack', type: 'burnProc' },
  },
  murmure_ombre: {
    id: 'murmure_ombre', name: "Murmure d'Ombre", icon: '\uD83C\uDF11', expedition: true,
    color: 'text-gray-300', bg: 'bg-gray-500/15', border: 'border-gray-500/30',
    desc: 'Esquive et contre-attaque',
    bonus2: {}, bonus2Desc: 'Degats Ombre +12%',
    bonus4: {}, bonus4Desc: '8% esquive, si esquive: +30% prochain coup',
    passive2: null, passive4: { trigger: 'onDodge', type: 'shadowWhisper' },
  },
  lumiere_sacree: {
    id: 'lumiere_sacree', name: 'Lumiere Sacree', icon: '\u2600\uFE0F', expedition: true,
    color: 'text-yellow-300', bg: 'bg-yellow-400/15', border: 'border-yellow-400/30',
    desc: 'Soins et resistance',
    bonus2: { healBonus: 15 }, bonus2Desc: 'Soins +15%',
    bonus4: {}, bonus4Desc: 'RES +8%, soins touchent aussi 2eme allie le plus blesse pour 30%',
    passive2: null, passive4: { trigger: 'onHeal', type: 'sacredSplash' },
  },
  cuirasse_fer: {
    id: 'cuirasse_fer', name: 'Cuirasse de Fer', icon: '\uD83D\uDEE1\uFE0F', expedition: true,
    color: 'text-slate-400', bg: 'bg-slate-500/15', border: 'border-slate-500/30',
    desc: 'Anti-crit et debuff attaquant',
    bonus2: { defPercent: 15 }, bonus2Desc: 'DEF +15%',
    bonus4: {}, bonus4Desc: 'Reduit degats crits subis -25%, -5% ATK attaquant 3s',
    passive2: null, passive4: { trigger: 'onHit', type: 'ironGuard' },
  },
  // ── MEDIUM SETS — Neant (Boss 11-15) ──
  ailes_vent: {
    id: 'ailes_vent', name: 'Ailes du Vent', icon: '\uD83D\uDCA8', expedition: true,
    color: 'text-teal-300', bg: 'bg-teal-400/15', border: 'border-teal-400/30',
    desc: 'Vitesse et premier coup critique',
    bonus2: { spdPercent: 12 }, bonus2Desc: 'SPD +12%',
    bonus4: {}, bonus4Desc: 'Esquive +5%, 1ere attaque combat = crit garanti',
    passive2: null, passive4: { trigger: 'onBattleStart', type: 'windRush' },
  },
  sang_guerrier: {
    id: 'sang_guerrier', name: 'Sang du Guerrier', icon: '\uD83E\uDE78', expedition: true,
    color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30',
    desc: 'Vol de vie et scaling sur les kills',
    bonus2: { atkPercent: 12 }, bonus2Desc: 'ATK +12%',
    bonus4: {}, bonus4Desc: 'Vol vie +8%, kill: +3% ATK (max +15%, reset au boss)',
    passive2: null, passive4: { trigger: 'onKill', type: 'warriorBlood' },
  },
  totem_ancestral: {
    id: 'totem_ancestral', name: 'Totem Ancestral', icon: '\uD83C\uDFDB\uFE0F', expedition: true,
    color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30',
    desc: 'Aura defense et regen pour les allies',
    bonus2: { hpPercent: 15 }, bonus2Desc: 'HP +15%',
    bonus4: {}, bonus4Desc: 'Allies 200px: +5% DEF, +3% HP regen',
    passive2: null, passive4: { trigger: 'always', type: 'ancestralAura' },
  },
  brume_mystique: {
    id: 'brume_mystique', name: 'Brume Mystique', icon: '\uD83C\uDF2B\uFE0F', expedition: true,
    color: 'text-indigo-400', bg: 'bg-indigo-500/15', border: 'border-indigo-500/30',
    desc: 'Economie de mana et sorts gratuits',
    bonus2: { manaPercent: 20 }, bonus2Desc: 'Mana max +20%',
    bonus4: {}, bonus4Desc: 'Cout mana -10%, 10% chance sort gratuit',
    passive2: null, passive4: { trigger: 'beforeAttack', type: 'mysticMist' },
  },
  lien_meute: {
    id: 'lien_meute', name: 'Lien de Meute', icon: '\uD83D\uDC3A', expedition: true,
    color: 'text-cyan-300', bg: 'bg-cyan-400/15', border: 'border-cyan-400/30',
    desc: 'Synergie entre hunters du meme joueur',
    bonus2: { atkPercent: 5, defPercent: 5 }, bonus2Desc: 'ATK +5%, DEF +5%',
    bonus4: {}, bonus4Desc: 'Si 3 hunters du meme joueur en vie: ATK +10%, DEF +10%',
    passive2: null, passive4: { trigger: 'always', type: 'packBond' },
  },
  // ── SUPPORT SETS — Neant (Boss 8-15) ──
  sagesse_ancienne: {
    id: 'sagesse_ancienne', name: 'Sagesse Ancienne', icon: '\uD83D\uDCDA', expedition: true,
    color: 'text-violet-400', bg: 'bg-violet-500/15', border: 'border-violet-500/30',
    desc: 'INT scaling et ignore DEF pour mages/supports',
    bonus2: { intPercent: 20, manaRegen: 25 }, bonus2Desc: 'INT +20%, Mana regen +25%',
    bonus4: {}, bonus4Desc: 'Chaque skill: INT +3% (max 10 stacks). A 10 stacks: ignore 20% DEF + reset.',
    passive2: null, passive4: { trigger: 'onSkillCast', type: 'ancientWisdom' },
  },
  souffle_celeste: {
    id: 'souffle_celeste', name: 'Souffle Celeste', icon: '\uD83C\uDF2C\uFE0F', expedition: true,
    color: 'text-sky-300', bg: 'bg-sky-400/15', border: 'border-sky-400/30',
    desc: 'Boost SPD equipe et burst personnel',
    bonus2: { spdPercent: 15 }, bonus2Desc: 'SPD +15%',
    bonus4: {}, bonus4Desc: 'Debut combat: equipe +10% SPD 8s. Tous les 20s: self +30% SPD 3s.',
    passive2: null, passive4: { trigger: 'always', type: 'celestialSpeed' },
  },
  purification_sacree: {
    id: 'purification_sacree', name: 'Purification Sacree', icon: '\u2728', expedition: true,
    color: 'text-amber-300', bg: 'bg-amber-400/15', border: 'border-amber-400/30',
    desc: 'Cleanse debuffs et heal equipe',
    bonus2: { res: 15, hpPercent: 10 }, bonus2Desc: 'RES +15, HP +10%',
    bonus4: {}, bonus4Desc: 'Tous les 8s: cleanse 1 debuff par allie. Si cleanse: heal 5% HP.',
    passive2: null, passive4: { trigger: 'always', type: 'sacredPurify' },
  },
  brise_guerissante: {
    id: 'brise_guerissante', name: 'Brise Guerissante', icon: '\uD83C\uDF3F', expedition: true,
    color: 'text-emerald-300', bg: 'bg-emerald-400/15', border: 'border-emerald-400/30',
    desc: 'Soins renforcés sur allies en danger',
    bonus2: { healBonus: 25, spdPercent: 10 }, bonus2Desc: 'Soins +25%, SPD +10%',
    bonus4: {}, bonus4Desc: 'Soin sur allie <40% HP: +20% SPD 5s + bouclier 10% HP max soigneur.',
    passive2: null, passive4: { trigger: 'onHeal', type: 'healingBreeze' },
  },
};

// Zone armor sets (regular expedition armor items that share a zone setId)
export const EXPEDITION_ZONE_SETS = {
  set_forest: {
    id: 'set_forest', name: 'Armure Sylvestre', icon: '\uD83C\uDF3F', expedition: true,
    color: 'text-green-400', bg: 'bg-green-500/15', border: 'border-green-500/30',
    desc: 'Equipement de la Foret',
    bonus2: { defPercent: 8 }, bonus2Desc: 'DEF +8%',
    bonus4: { hpPercent: 12 }, bonus4Desc: 'HP +12%',
    passive2: null, passive4: null,
  },
  set_stone: {
    id: 'set_stone', name: 'Armure de Pierre', icon: '\uD83E\uDEA8', expedition: true,
    color: 'text-stone-400', bg: 'bg-stone-500/15', border: 'border-stone-500/30',
    desc: 'Equipement des Montagnes',
    bonus2: { defPercent: 12 }, bonus2Desc: 'DEF +12%',
    bonus4: { hpPercent: 15, res: 5 }, bonus4Desc: 'HP +15%, RES +5',
    passive2: null, passive4: null,
  },
  set_shadow: {
    id: 'set_shadow', name: "Armure d'Ombre", icon: '\uD83C\uDF11', expedition: true,
    color: 'text-violet-400', bg: 'bg-violet-500/15', border: 'border-violet-500/30',
    desc: "Equipement de l'Ombre",
    bonus2: { atkPercent: 12 }, bonus2Desc: 'ATK +12%',
    bonus4: { critRate: 6, critDamage: 8 }, bonus4Desc: 'CRIT +6%, CRIT DMG +8%',
    passive2: null, passive4: null,
  },
  set_abyss: {
    id: 'set_abyss', name: 'Armure des Abysses', icon: '\uD83C\uDF0A', expedition: true,
    color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30',
    desc: 'Equipement des Abysses',
    bonus2: { hpPercent: 15, defPercent: 10 }, bonus2Desc: 'HP +15%, DEF +10%',
    bonus4: {}, bonus4Desc: 'Degats AoE subis -12%',
    passive2: null, passive4: null,
  },
  set_void: {
    id: 'set_void', name: 'Armure du Neant', icon: '\uD83C\uDF0C', expedition: true,
    color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30',
    desc: 'Equipement du Neant',
    bonus2: { atkPercent: 15 }, bonus2Desc: 'ATK +15%',
    bonus4: { critRate: 8, critDamage: 12 }, bonus4Desc: 'CRIT +8%, CRIT DMG +12%',
    passive2: null, passive4: null,
  },
};

// Merge all sets into ALL_ARTIFACT_SETS (defined earlier as let)
ALL_ARTIFACT_SETS = { ...ALL_ARTIFACT_SETS, ...ARC2_ARTIFACT_SETS, ...ULTIME_ARTIFACT_SETS, ...EXPEDITION_ARTIFACT_SETS, ...EXPEDITION_ZONE_SETS };

// ═══════════════════════════════════════════════════════════════
// SET CATEGORY MAPPING
// ═══════════════════════════════════════════════════════════════

const _colKeys = new Set(Object.keys(ARTIFACT_SETS));
const _raidKeys = new Set(Object.keys(RAID_ARTIFACT_SETS));
const _arc2Keys = new Set(Object.keys(ARC2_ARTIFACT_SETS));
const _ultKeys = new Set(Object.keys(ULTIME_ARTIFACT_SETS));
const _expKeys = new Set([...Object.keys(EXPEDITION_ARTIFACT_SETS), ...Object.keys(EXPEDITION_ZONE_SETS)]);

export function getSetCategory(setId) {
  if (_colKeys.has(setId)) return 'colosseum';
  if (_raidKeys.has(setId)) return 'raid';
  if (_arc2Keys.has(setId)) return 'arc2';
  if (_ultKeys.has(setId)) return 'ultime';
  if (_expKeys.has(setId)) return 'expedition';
  return null;
}

export const SET_CATEGORIES = {
  colosseum: { label: 'Colosseum', color: 'text-gray-300', bg: 'bg-gray-500/15', border: 'border-gray-500/30' },
  raid: { label: 'Raid', color: 'text-pink-400', bg: 'bg-pink-500/15', border: 'border-pink-500/30' },
  arc2: { label: 'ARC II', color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30' },
  ultime: { label: 'Ultime', color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
  expedition: { label: 'Expedition', color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
};

export function generateArc2Artifact(rarity) {
  const setKeys = Object.keys(ARC2_ARTIFACT_SETS);
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
    // ARC II artifacts roll +30% better sub-stats
    const value = Math.floor((pick.range[0] + Math.random() * (pick.range[1] - pick.range[0] + 1)) * 1.3);
    subs.push({ id: pick.id, value });
  }

  return {
    uid: `art_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    set, slot, rarity, isArc2: true,
    mainStat: mainStatId,
    mainValue: MAIN_STAT_VALUES[mainStatId].base,
    level: 0,
    subs,
  };
}