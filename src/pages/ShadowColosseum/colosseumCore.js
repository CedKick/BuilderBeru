// colosseumCore.js — Shared constants & pure functions for Shadow Colosseum + Raid Mode

// ─── Sprites ─────────────────────────────────────────────────
export const SPRITES = {
  kaisel: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750768929/Kaisel_face_dm9394.png',
  tank: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604465/tank_face_n9kxrh.png',
  nyarthulu: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755505833/Nyarthulu_face_vawrrz.png',
  raven: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422541/Raven_face_xse2x9.png',
  lil_kaisel: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422081/lil_face_vyjvxz.png',
  pingsu: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755505263/Pingsu_face_tnilyr.png',
  okami: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422300/Okami_face_qfzt4j.png',
  alecto: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755423129/alecto_face_irsy6q.png',
  shadow_goblin: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771149665/ShadowGobelin_xi9cbs.png',
  corrupted_wolf: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771149665/CorruptedWolf_eytnug.png',
  stone_golem: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771150402/CobbleStone_de1rac.png',
  fallen_knight: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771150858/ChevalierDechu_ruqbx7.png',
  ancestral_spectre: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771151405/SpectreAncestral_vtqpbr.png',
  salamandre: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771151763/Salamandre_oyqyyi.png',
  griffon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771152055/Griffon_qwiklr.png',
  guardian: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771152576/GardiendesPortails_mthlve.png',
  chimera: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771153171/ChimereAbyssal_illdft.png',
  phoenix: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771153418/Ph%C3%A9nixNoir_cdwoso.png',
  titan: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771153898/TitanDesGlaces_mjtynl.png',
  monarch: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771154347/OmbreMineure_zwqbr3.png',
  wraith: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771160342/Wraith_qgs3bo.png',
  ifrit: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771160340/Ifrit_pl9t6q.png',
  wyvern: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771160338/Wyverne_dzrxk5.png',
  lich_king: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771160337/RoiLiche_xgu6ug.png',
  banshee: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771160335/Banshee_bnwnzn.png',
  dragon_rouge: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771160332/DragonRouge_fvwtzi.png',
  tempestaire: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771160334/Tempestaire_xx926x.png',
  colossus: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771160331/Colossus_xok08m.png',
  archdemon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771160758/Archdemon_hiem7r.png',
  ragnarok: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771161413/Ragnarok_liihbd.png',
  zephyr: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771528815/ZephyrUltime_xdxvjd.png',
};

// ─── Elements ────────────────────────────────────────────────
export const ELEMENTS = {
  shadow: { name: 'Ombre', color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/40', icon: '\uD83C\uDF11', beats: 'wind' },
  fire: { name: 'Feu', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/40', icon: '\uD83D\uDD25', beats: 'shadow' },
  wind: { name: 'Vent', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', icon: '\uD83D\uDCA8', beats: 'earth' },
  earth: { name: 'Terre', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40', icon: '\uD83E\uDEA8', beats: 'fire' },
  water: { name: 'Eau', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/40', icon: '\uD83D\uDCA7', beats: 'fire' },
  light: { name: 'Lumiere', color: 'text-yellow-300', bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', icon: '\u2728', beats: 'shadow' },
};

export const RARITY = {
  mythique: { stars: '\u2605\u2605\u2605', color: 'text-red-400', glow: 'drop-shadow(0 0 6px rgba(255,0,0,0.5))' },
  legendaire: { stars: '\u2605\u2605', color: 'text-orange-400', glow: 'drop-shadow(0 0 6px rgba(255,140,0,0.5))' },
  rare: { stars: '\u2605', color: 'text-blue-400', glow: 'drop-shadow(0 0 5px rgba(59,130,246,0.4))' },
};

// ─── Stat System ─────────────────────────────────────────────
export const STAT_PER_POINT = { hp: 16, atk: 1.5, def: 1.5, spd: 1, crit: 0.8, res: 0.8, mana: 1.5 };
export const STAT_ORDER = ['hp', 'atk', 'def', 'spd', 'crit', 'res', 'mana'];
export const STAT_META = {
  hp:   { name: 'PV',   icon: '\u2764\uFE0F', color: 'text-green-400',   desc: 'Points de Vie', detail: 'Determine la survie du combattant. +16 PV par point investi (le stat defensif le plus fiable — pas de rendements degressifs ni de cap). A 0 PV, le combattant est K.O.' },
  atk:  { name: 'ATK',  icon: '\u2694\uFE0F', color: 'text-red-400',     desc: "Puissance d'attaque", detail: 'Augmente les degats infliges. Formule : ATK x (Power du skill / 100). Multiplie par les bonus elementaires, crit, etc.' },
  def:  { name: 'DEF',  icon: '\uD83D\uDEE1\uFE0F', color: 'text-blue-400', desc: 'Resistance physique', detail: 'Reduit les degats recus. Formule : 100 / (100 + DEF). Ex: 100 DEF = -50% degats, 200 DEF = -66%.' },
  spd:  { name: 'SPD',  icon: '\uD83D\uDCA8', color: 'text-emerald-400', desc: 'Vitesse', detail: 'Determine l\'ordre des tours et les tours bonus. SPD >= 1.5x l\'ennemi le + rapide = +1 tour bonus. SPD >= 2x = +2 tours bonus (max). Augmente aussi la regen mana (+1 mana par 15 SPD).' },
  crit: { name: 'CRIT', icon: '\uD83C\uDFAF', color: 'text-yellow-400', desc: 'Chance de coup critique', detail: 'Chance en % d\'infliger un coup critique (x1.5 degats de base + bonus CRIT DMG). Rendements degressifs : 50→39%, 100→61%, 150→75%, 200→85%. La RES ennemie reduit le crit (aussi en degressif).' },
  res:  { name: 'RES',  icon: '\uD83D\uDEE1\uFE0F', color: 'text-cyan-400',    desc: 'Resistance elementaire + anti-crit', detail: 'Double usage avec rendements degressifs : (1) Reduit les degats recus (50→35%, 100→55%, cap 70%). (2) Reduit le crit rate ennemi (50→18%, 100→29%, 200→41%). Stacker au-dela de ~100 est moins efficace — diversifier avec HP/DEF.' },
  mana: { name: 'INT', icon: '\uD83E\uDDE0', color: 'text-violet-400',  desc: 'Intelligence', detail: 'Intelligence du combattant. Augmente le pool de Mana (+1.5 mana/pt). Les mages/supports utilisent Mana x2 comme puissance d\'attaque (au lieu d\'ATK). Skills mana-scaling : bonus avec rendements degressifs (racine carree). Soins : +1% par 10 Mana. Regen : 8/tick + SPD/15.' },
};

// ─── Mana System ────────────────────────────────────────────
// Mana: character-intrinsic base + growth, plus low-rate allocation (+0.1/pt)
// Fallback for old data without base.mana: 50 + HP/4 + RES*2
export const getBaseMana = (base) => base.mana || Math.floor(50 + base.hp / 4 + (base.res || 0) * 2);
export const BASE_MANA_REGEN = 5;
export const getSkillManaCost = (skill) => {
  if (skill.manaCost !== undefined) return skill.manaCost;
  if (skill.cdMax === 0) return 0; // Basic attacks always free
  // Heal skills: expensive mana cost based on heal %
  const healValue = (skill.healSelf || 0) + (skill.healAlly || 0);
  if (healValue > 0) return Math.floor(15 + healValue * 1.5 + skill.cdMax * 4);
  // Pure buff skills (no damage): moderate mana cost
  const buffValue = (skill.buffAtk || 0) + (skill.buffDef || 0) + (skill.buffSpd || 0)
                  + (skill.buffAllyAtk || 0) + (skill.buffAllyDef || 0);
  if (!skill.power && buffValue > 0) return Math.floor(10 + buffValue * 0.3 + skill.cdMax * 3);
  if (!skill.power) return 0;
  return Math.floor(5 + skill.power / 15 + skill.cdMax * 3);
};
// Mana-scaled power with diminishing returns (sqrt curve)
// Prevents quadratic Intel² explosion on manaScaling skills
// At mana=500,  scaling=7: bonus ≈ 592  → power ≈ 692%
// At mana=2000, scaling=7: bonus ≈ 1183 → power ≈ 1283%
// At mana=10000,scaling=7: bonus ≈ 2646 → power ≈ 2746%
export const getManaScaledPower = (currentMana, skill) => {
  if (!skill.manaScaling) return skill.power;
  const manaBonus = Math.floor(10 * Math.sqrt(currentMana * skill.manaScaling));
  return skill.power + manaBonus;
};
export const POINTS_PER_LEVEL = 2;
export const MAX_LEVEL = 140;

// ─── Account Level System ───────────────────────────────────
export const ACCOUNT_XP_FOR_LEVEL = (lvl) => {
  const base = 80 + lvl * 25;
  if (lvl <= 10000) return base;
  // Quadratic wall after 10k — gets exponentially harder
  const over = lvl - 10000;
  return base + Math.floor(over * over * 0.5);
};
export const ACCOUNT_BONUS_INTERVAL = 10; // kept for backward compat display
export const ACCOUNT_BONUS_AMOUNT = 10;

// Progressive allocation count: fewer allocations at high levels
// Lv 1-1000: every 10, Lv 1001-5000: every 15, Lv 5001-10000: every 25, Lv 10001+: every 30
export function accountAllocationsAtLevel(level) {
  if (level <= 1000) return Math.floor(level / 10);
  let allocs = 100; // lv 1-1000
  if (level <= 5000) return allocs + Math.floor((level - 1000) / 15);
  allocs += Math.floor(4000 / 15); // lv 1001-5000 = 266
  if (level <= 10000) return allocs + Math.floor((level - 5000) / 25);
  allocs += Math.floor(5000 / 25); // lv 5001-10000 = 200
  return allocs + Math.floor((level - 10000) / 30);
}

// Next level that grants an allocation (for display)
export function nextAllocationLevel(level) {
  if (level < 1000) return (Math.floor(level / 10) + 1) * 10;
  if (level < 5000) return 1000 + (Math.floor((level - 1000) / 15) + 1) * 15;
  if (level < 10000) return 5000 + (Math.floor((level - 5000) / 25) + 1) * 25;
  return 10000 + (Math.floor((level - 10000) / 30) + 1) * 30;
}
export function accountLevelFromXp(totalXp) {
  let lvl = 0, spent = 0;
  while (true) {
    const need = ACCOUNT_XP_FOR_LEVEL(lvl + 1);
    if (spent + need > totalXp) break;
    spent += need;
    lvl++;
  }
  return { level: lvl, xpInLevel: totalXp - spent, xpForNext: ACCOUNT_XP_FOR_LEVEL(lvl + 1) };
}

// ─── Skill Tree Constants ────────────────────────────────────
export const TIER_NAMES_SKILL = ['Eveil', 'Maitrise', 'Transcendance'];
export const TIER_COSTS = [1, 1, 2];
export const SP_INTERVAL = 5;

// ─── Shadow Chibis ───────────────────────────────────────────
export const CHIBIS = {
  kaisel: {
    name: 'Kaisel', rarity: 'mythique', element: 'wind',
    base: { hp: 160, atk: 42, def: 28, spd: 55, crit: 15, res: 5 },
    growth: { hp: 10, atk: 3, def: 1.8, spd: 3.2, crit: 0.3, res: 0.15 },
    skills: [
      { name: 'Griffes du Vent', power: 100, cdMax: 0, desc: 'Laceration aerienne' },
      { name: 'Plongeon Celeste', power: 180, cdMax: 2, desc: 'Attaque plongeante devastatrice' },
      { name: 'Tempete Draconique', power: 260, cdMax: 4, desc: 'Tempete de vent ultime' },
    ],
  },
  tank: {
    name: 'Tank', rarity: 'legendaire', element: 'earth',
    base: { hp: 250, atk: 25, def: 50, spd: 18, crit: 5, res: 15 },
    growth: { hp: 16, atk: 1.5, def: 3.5, spd: 0.8, crit: 0.1, res: 0.5 },
    skills: [
      { name: 'Coup de Bouclier', power: 90, cdMax: 0, desc: 'Frappe defensive' },
      { name: 'Forteresse', power: 0, cdMax: 3, desc: 'DEF +80% pendant 3 tours', buffDef: 80, buffDur: 3 },
      { name: 'Rempart Absolu', power: 0, cdMax: 4, desc: 'Recupere 40% PV max', healSelf: 40 },
    ],
  },
  nyarthulu: {
    name: 'Nyarthulu', rarity: 'legendaire', element: 'shadow',
    base: { hp: 200, atk: 38, def: 22, spd: 30, crit: 10, res: 6 },
    growth: { hp: 12, atk: 2.8, def: 1.5, spd: 1.8, crit: 0.25, res: 0.2 },
    skills: [
      { name: 'Tentacule', power: 100, cdMax: 0, desc: 'Frappe de tentacule' },
      { name: 'Maree Noire', power: 160, cdMax: 2, desc: 'Degats + DEF ennemi -30%', debuffDef: 30, debuffDur: 2 },
      { name: 'Abysse Eternel', power: 240, cdMax: 4, desc: 'Devastation abyssale' },
    ],
  },
  raven: {
    name: 'Shadow-Raven', rarity: 'rare', element: 'wind',
    base: { hp: 120, atk: 30, def: 18, spd: 45, crit: 12, res: 4 },
    growth: { hp: 8, atk: 2, def: 1.2, spd: 2.8, crit: 0.3, res: 0.1 },
    skills: [
      { name: "Bec d'Ombre", power: 95, cdMax: 0, desc: 'Coup de bec rapide' },
      { name: 'Vol Rasant', power: 155, cdMax: 2, desc: 'Attaque en rase-mottes' },
      { name: 'Tempete de Plumes', power: 210, cdMax: 3, desc: 'Pluie de plumes tranchantes' },
    ],
  },
  lil_kaisel: {
    name: "Lil' Kaisel", rarity: 'rare', element: 'wind',
    base: { hp: 110, atk: 25, def: 15, spd: 38, crit: 8, res: 5 },
    growth: { hp: 7, atk: 1.8, def: 1, spd: 2.5, crit: 0.2, res: 0.15 },
    skills: [
      { name: 'Mini Griffes', power: 90, cdMax: 0, desc: 'Petites griffes rapides' },
      { name: 'Petit Plongeon', power: 140, cdMax: 2, desc: 'Mini plongeon aerien' },
      { name: 'Cri Percant', power: 0, cdMax: 3, desc: 'ATK +60% pendant 3 tours', buffAtk: 60, buffDur: 3 },
    ],
  },
  pingsu: {
    name: 'Pingsu', rarity: 'rare', element: 'fire',
    base: { hp: 140, atk: 28, def: 20, spd: 22, crit: 7, res: 8 },
    growth: { hp: 9, atk: 2, def: 1.5, spd: 1.2, crit: 0.15, res: 0.25 },
    skills: [
      { name: 'Marteau Enflamme', power: 95, cdMax: 0, desc: "Frappe de forge ardente" },
      { name: 'Forge Ardente', power: 0, cdMax: 3, desc: 'ATK +50% pendant 3 tours', buffAtk: 50, buffDur: 3 },
      { name: 'Eruption', power: 220, cdMax: 4, desc: 'Explosion de lave' },
    ],
  },
  okami: {
    name: 'Okami', rarity: 'mythique', element: 'shadow',
    base: { hp: 140, atk: 50, def: 20, spd: 52, crit: 18, res: 3 },
    growth: { hp: 8, atk: 3.5, def: 1.2, spd: 3, crit: 0.4, res: 0.1 },
    skills: [
      { name: "Crocs d'Ombre", power: 110, cdMax: 0, desc: 'Morsure des tenebres' },
      { name: 'Charge Lupine', power: 190, cdMax: 2, desc: 'Charge sauvage' },
      { name: 'Hurlement du Monarque', power: 280, cdMax: 5, desc: 'Hurlement devastateur' },
    ],
  },
  alecto: {
    name: 'Alecto', rarity: 'mythique', element: 'fire',
    base: { hp: 180, atk: 44, def: 25, spd: 40, crit: 14, res: 7 },
    growth: { hp: 11, atk: 3, def: 1.8, spd: 2.5, crit: 0.3, res: 0.2 },
    skills: [
      { name: "Flamme d'Ombre", power: 100, cdMax: 0, desc: 'Feu des tenebres' },
      { name: 'Metamorphose', power: 0, cdMax: 3, desc: 'ATK +40% pendant 3 tours', buffAtk: 40, buffDur: 3 },
      { name: 'Phoenix Noir', power: 250, cdMax: 4, desc: 'Explosion phenix + soin 20%', healSelf: 20 },
    ],
  },
};

// ─── Helper Functions ────────────────────────────────────────

export const statsAt = (base, growth, level, allocated = {}, tb = {}) => {
  const raw = {
    hp: base.hp + growth.hp * (level - 1) + (allocated.hp || 0) * STAT_PER_POINT.hp,
    atk: base.atk + growth.atk * (level - 1) + (allocated.atk || 0) * STAT_PER_POINT.atk,
    def: base.def + growth.def * (level - 1) + (allocated.def || 0) * STAT_PER_POINT.def,
    spd: base.spd + growth.spd * (level - 1) + (allocated.spd || 0) * STAT_PER_POINT.spd,
    crit: base.crit + growth.crit * (level - 1) + (allocated.crit || 0) * STAT_PER_POINT.crit,
    res: base.res + growth.res * (level - 1) + (allocated.res || 0) * STAT_PER_POINT.res,
  };
  return {
    hp: Math.floor(raw.hp * (1 + (tb.hpPercent || 0) / 100)),
    atk: Math.floor(raw.atk * (1 + (tb.atkPercent || 0) / 100)),
    def: Math.floor(raw.def * (1 + (tb.defPercent || 0) / 100)),
    spd: Math.floor(raw.spd * (1 + (tb.spdPercent || 0) / 100)),
    crit: +(raw.crit + (tb.critRate || 0)).toFixed(1),
    res: +(raw.res + (tb.resFlat || 0)).toFixed(1),
  };
};

// statsAtFull — wraps statsAt with eveil stars + equipment bonuses + global account bonuses
export const statsAtFull = (base, growth, level, allocated = {}, tb = {}, equipBonuses = {}, eveilStars = 0, globalBonuses = {}) => {
  const eveilMult = 1 + eveilStars * 0.05;
  // allStats from Talent II adds a % to all base stats
  const allStatsMult = 1 + (tb.allStats || 0) / 100;
  const adjBase = {
    hp: Math.floor(base.hp * eveilMult * allStatsMult),
    atk: Math.floor(base.atk * eveilMult * allStatsMult),
    def: Math.floor(base.def * eveilMult * allStatsMult),
    spd: Math.floor(base.spd * eveilMult * allStatsMult),
    crit: +(base.crit * eveilMult * allStatsMult).toFixed(1),
    res: +(base.res * eveilMult * allStatsMult).toFixed(1),
  };
  // Merge equip % bonuses into tb (so statsAt applies them)
  const mergedTb = { ...tb };
  mergedTb.hpPercent = (mergedTb.hpPercent || 0) + (equipBonuses.hp_pct || 0) + (equipBonuses.hpPercent || 0);
  mergedTb.atkPercent = (mergedTb.atkPercent || 0) + (equipBonuses.atk_pct || 0) + (equipBonuses.atkPercent || 0);
  mergedTb.defPercent = (mergedTb.defPercent || 0) + (equipBonuses.def_pct || 0) + (equipBonuses.defPercent || 0);
  mergedTb.spdPercent = (mergedTb.spdPercent || 0) + (equipBonuses.spd_pct || 0) + (equipBonuses.spdPercent || 0);
  mergedTb.critRate = (mergedTb.critRate || 0) + (equipBonuses.crit_rate || 0) + (equipBonuses.critRate || 0);
  mergedTb.resFlat = (mergedTb.resFlat || 0) + (equipBonuses.res_flat || 0);
  mergedTb.critDamage = (mergedTb.critDamage || 0) + (equipBonuses.crit_dmg || 0) + (equipBonuses.critDamage || 0);
  // Pass through set damage bonuses
  mergedTb.fireDamage = (mergedTb.fireDamage || 0) + (equipBonuses.fireDamage || 0);
  mergedTb.waterDamage = (mergedTb.waterDamage || 0) + (equipBonuses.waterDamage || 0);
  mergedTb.shadowDamage = (mergedTb.shadowDamage || 0) + (equipBonuses.shadowDamage || 0);
  mergedTb.allDamage = (mergedTb.allDamage || 0) + (equipBonuses.allDamage || 0);
  mergedTb.defPen = (mergedTb.defPen || 0) + (equipBonuses.defPen || 0);
  mergedTb.healBonus = (mergedTb.healBonus || 0) + (equipBonuses.healBonus || 0);

  // Talent II: Shield weapon-type bonus — applied as extra DEF%/HP%
  if (tb.weaponDmg_shield_def) {
    const shieldDefBonus = tb.masterWeapons ? tb.weaponDmg_shield_def * 2 : tb.weaponDmg_shield_def;
    mergedTb.defPercent = (mergedTb.defPercent || 0) + shieldDefBonus;
  }
  if (tb.weaponDmg_shield_hp) {
    const shieldHpBonus = tb.masterWeapons ? tb.weaponDmg_shield_hp * 2 : tb.weaponDmg_shield_hp;
    mergedTb.hpPercent = (mergedTb.hpPercent || 0) + shieldHpBonus;
  }

  const stats = statsAt(adjBase, growth, level, allocated, mergedTb);
  // Add flat equipment bonuses
  stats.hp += (equipBonuses.hp_flat || 0);
  stats.atk += (equipBonuses.atk_flat || 0);
  stats.def += (equipBonuses.def_flat || 0) + (tb.defFlat || 0);
  stats.spd += (equipBonuses.spd_flat || 0);
  // Add global account bonuses (flat, applied to all characters)
  stats.hp += (globalBonuses.hp || 0) * STAT_PER_POINT.hp;
  stats.atk += (globalBonuses.atk || 0) * STAT_PER_POINT.atk;
  stats.def += (globalBonuses.def || 0) * STAT_PER_POINT.def;
  stats.spd += (globalBonuses.spd || 0) * STAT_PER_POINT.spd;
  stats.crit = +(stats.crit + (globalBonuses.crit || 0) * STAT_PER_POINT.crit).toFixed(1);
  stats.res = +(stats.res + (globalBonuses.res || 0) * STAT_PER_POINT.res).toFixed(1);
  // Mana — base intrinsic + growth + allocation (0.1/pt) + account bonus (0.1/pt)
  const baseMana = getBaseMana(base);
  const manaFromGrowth = Math.floor((growth.mana || 0) * (level - 1));
  const manaFromAlloc = (allocated.mana || 0) * STAT_PER_POINT.mana;
  const manaFromAccount = (globalBonuses.mana || 0) * STAT_PER_POINT.mana;
  const manaPercent = 1 + (mergedTb.manaPercent || 0) / 100 + (equipBonuses.manaPercent || 0) / 100;
  stats.mana = Math.floor((baseMana + manaFromGrowth + manaFromAlloc + manaFromAccount) * manaPercent);
  stats.manaRegen = BASE_MANA_REGEN + Math.floor(stats.spd / 15) + Math.floor(mergedTb.manaRegen || 0);
  stats.manaCostReduce = Math.min(50, (mergedTb.manaCostReduce || 0) + (equipBonuses.manaCostReduce || 0));
  return stats;
};

export const xpForLevel = (level) => level <= 30 ? level * 20 : 600 + (level - 30) * 35;

export const getElementMult = (atkElem, defElem) => {
  if (ELEMENTS[atkElem]?.beats === defElem) return 1.3;
  if (ELEMENTS[defElem]?.beats === atkElem) return 0.7;
  return 1.0;
};

export const getEffStat = (base, buffs, stat) => {
  const mult = buffs.filter(b => b.stat === stat).reduce((s, b) => s + b.value, 0);
  return Math.max(1, Math.floor(base * (1 + mult)));
};

// ─── Number Formatting (K / M / B / T) ─────────────────────
export const fmtNum = (n) => {
  if (n == null || isNaN(n)) return '0';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(1)}T`;
  if (abs >= 1e9)  return `${sign}${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6)  return `${sign}${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3)  return `${sign}${(abs / 1e3).toFixed(1)}K`;
  return `${sign}${Math.floor(abs)}`;
};

// ─── SPD-based Turn Order with Extra Turns ──────────────────
// If a combatant's SPD >= 1.5x the fastest opponent → +1 extra turn
// If a combatant's SPD >= 2.0x the fastest opponent → +2 extra turns (cap)
// Extra turns are interleaved at lower priority (0.65x and 0.35x SPD)
export const buildSpdTurnOrder = (rawEntries) => {
  const teamEntries = rawEntries.filter(e => e.type === 'team');
  const enemyEntries = rawEntries.filter(e => e.type === 'enemy');
  const maxEnemySpd = enemyEntries.length > 0 ? Math.max(...enemyEntries.map(e => e.spd)) : 0;
  const maxTeamSpd = teamEntries.length > 0 ? Math.max(...teamEntries.map(e => e.spd)) : 0;

  const result = [];
  rawEntries.forEach(entry => {
    const compareSpd = entry.type === 'team' ? maxEnemySpd : maxTeamSpd;
    const ratio = compareSpd > 0 ? entry.spd / compareSpd : 1;
    const extra = ratio >= 2.0 ? 2 : ratio >= 1.5 ? 1 : 0;
    result.push({ ...entry, isExtra: false });
    if (extra >= 1) result.push({ ...entry, isExtra: true, _prio: entry.spd * 0.65 });
    if (extra >= 2) result.push({ ...entry, isExtra: true, _prio: entry.spd * 0.35 });
  });

  result.sort((a, b) => {
    const pa = a.isExtra ? a._prio : a.spd;
    const pb = b.isExtra ? b._prio : b.spd;
    return pb - pa || (a.type === 'enemy' ? -1 : 1);
  });
  return result;
};

export const applySkillUpgrades = (skill, upgradeLevel) => {
  const s = { ...skill };
  if (upgradeLevel >= 1) {
    if (s.power > 0) s.power = Math.floor(s.power * 1.3);
    if (s.buffAtk) s.buffAtk = Math.floor(s.buffAtk * 1.25);
    if (s.buffDef) s.buffDef = Math.floor(s.buffDef * 1.25);
    if (s.healSelf) s.healSelf = Math.floor(s.healSelf * 1.25);
    if (s.debuffDef) s.debuffDef = Math.floor(s.debuffDef * 1.2);
  }
  if (upgradeLevel >= 2) {
    s.cdMax = Math.max(0, s.cdMax - 1);
  }
  if (upgradeLevel >= 3) {
    if (s.power > 0) s.power = Math.floor(s.power * 1.25);
    if (s.buffAtk) s.buffAtk = Math.floor(s.buffAtk * 1.3);
    if (s.buffDef) s.buffDef = Math.floor(s.buffDef * 1.3);
    if (s.healSelf) s.healSelf = Math.floor(s.healSelf * 1.3);
    if (s.debuffDef) s.debuffDef = Math.floor(s.debuffDef * 1.3);
  }
  return s;
};

export const getUpgradeDesc = (skill, tierIdx) => {
  if (tierIdx === 1) return 'Cooldown -1';
  if (skill.power > 0) return tierIdx === 0 ? 'DMG +30%' : 'DMG +25%';
  if (skill.healSelf) return tierIdx === 0 ? 'Soin +25%' : 'Soin +30%';
  if (skill.buffAtk || skill.buffDef) return tierIdx === 0 ? 'Buff +25%' : 'Buff +30%';
  if (skill.debuffDef) return tierIdx === 0 ? 'Debuff +20%' : 'Debuff +30%';
  return tierIdx === 0 ? 'Effet +25%' : 'Effet +30%';
};

// Diminishing returns: nearly linear at low values, flattens at high values
// k controls the inflection point — higher k = more linear before flattening
const softcap = (val, k) => k * Math.log(1 + val / k);

export const computeAttack = (attacker, skill, defender, tb = {}) => {
  const res = { damage: 0, isCrit: false, healed: 0, buff: null, debuff: null, text: '' };
  let effAtk = getEffStat(attacker.atk, attacker.buffs, 'atk');
  // Mages & Supports: Mana×2 as attack power (compensates for no ATK buff stacking)
  // Exception: manaScaling skills — only partial Intel bonus to avoid quadratic explosion
  if (attacker.isMage && attacker.maxMana) {
    if (skill.manaScaling) {
      effAtk = Math.floor(effAtk + attacker.maxMana * 0.2);
    } else {
      effAtk = Math.floor(attacker.maxMana * 2.0);
    }
  }
  let effDef = getEffStat(defender.def, defender.buffs || [], 'def');

  if (tb.hasBerserk && attacker.hp < attacker.maxHp * 0.3) {
    effAtk = Math.floor(effAtk * 1.4);
  }

  // Talent II: Bastion — +DEF/RES when HP < 50%
  if (tb.bastionDef && defender.hp < defender.maxHp * 0.5) {
    effDef = Math.floor(effDef * (1 + (tb.bastionDef || 0) / 100));
  }

  if (skill.power > 0) {
    const raw = effAtk * (skill.power / 100);
    let elemMult = getElementMult(attacker.element, defender.element);
    if (tb.hasTranscendance && elemMult > 1) elemMult = 1.6;
    if (elemMult > 1 && tb.elementalAdvantageBonus) elemMult += tb.elementalAdvantageBonus / 100;
    // DEF penetration from artifacts + talents
    const defPenVal = tb.defPen || 0;
    let adjustedDef = Math.max(0, effDef * (1 - defPenVal / 100));

    // Crit & RES: diminishing returns (logarithmic) to prevent stacking abuse
    // CRIT k=80: 50→39%, 100→61%, 150→75%, 200→85% (can't guarantee 100%)
    // RES anti-crit k=60 then *0.5: 50→18%, 100→29%, 200→41% (can't negate crits)
    const effCrit = softcap(attacker.crit || 0, 80);
    const critResist = softcap(defender.res || 0, 60) * 0.5;
    const critChance = Math.min(100, Math.max(0, effCrit - critResist));
    res.isCrit = Math.random() * 100 < critChance;

    // Talent II: Ange de la Mort — crits ignore 50% DEF
    if (res.isCrit && tb.critDefIgnore) {
      adjustedDef = adjustedDef * 0.5;
    }

    const defFactor = 100 / (100 + Math.max(0, adjustedDef));
    const critMult = res.isCrit ? 1.5 + (tb.critDamage || 0) / 100 : 1;

    // Defender RES + Bastion RES bonus — diminishing returns (k=50)
    // 50→35%, 100→55%, 150→69%, 200→70% cap (needs ~190 raw to hit cap)
    let defenderRes = defender.res || 0;
    if (tb.bastionRes && defender.hp < defender.maxHp * 0.5) {
      defenderRes += (tb.bastionRes || 0);
    }
    const effRes = softcap(defenderRes, 50);
    const resFactor = Math.max(0.3, 1 - Math.min(70, effRes) / 100);

    const physMult = 1 + (tb.physicalDamage || 0) / 100;
    const elemDmgMult = 1 + (tb.elementalDamage || 0) / 100;
    const bossMult = defender.isBoss ? 1 + (tb.bossDamage || 0) / 100 : 1;

    // Element-specific damage from artifact sets + talent II
    let artElemMult = 1 + (tb.allDamage || 0) / 100;
    const useConvergence = tb.convergenceAll;
    if (useConvergence) {
      // Convergence capstone: ALL element bonuses apply
      artElemMult += (tb.fireDamage || 0) / 100;
      artElemMult += (tb.waterDamage || 0) / 100;
      artElemMult += (tb.shadowDamage || 0) / 100;
      artElemMult += (tb.windDamage || 0) / 100;
      artElemMult += (tb.earthDamage || 0) / 100;
      artElemMult += (tb.lightDamage || 0) / 100;
    } else {
      // Only matching element
      if (attacker.element === 'fire')   artElemMult += (tb.fireDamage || 0) / 100;
      if (attacker.element === 'water')  artElemMult += (tb.waterDamage || 0) / 100;
      if (attacker.element === 'shadow') artElemMult += (tb.shadowDamage || 0) / 100;
      if (attacker.element === 'wind')   artElemMult += (tb.windDamage || 0) / 100;
      if (attacker.element === 'earth')  artElemMult += (tb.earthDamage || 0) / 100;
      if (attacker.element === 'light')  artElemMult += (tb.lightDamage || 0) / 100;
    }

    // Talent II: Weapon-type damage bonus
    let weaponTypeMult = 1;
    const wt = attacker.weaponType;
    if (wt && wt !== 'shield') {
      const wtKey = `weaponDmg_${wt}`;
      const wtBonus = tb[wtKey] || 0;
      weaponTypeMult += (tb.masterWeapons ? wtBonus * 2 : wtBonus) / 100;
    }
    // Shield special: handled as DEF/HP in stats, not as DMG mult

    // Talent II: Execution — +X% DMG to targets < 30% HP
    let executionMult = 1;
    if (tb.executionDmg && defender.hp < defender.maxHp * 0.3) {
      executionMult += (tb.executionDmg || 0) / 100;
    }

    const variance = 0.9 + Math.random() * 0.2;
    res.damage = Math.max(1, Math.floor(raw * elemMult * defFactor * resFactor * critMult * physMult * elemDmgMult * bossMult * artElemMult * weaponTypeMult * executionMult * variance));
  }
  const healBonusMult = 1 + (tb.healBonus || 0) / 100;
  // Mages/Supports: Intel boosts heals (+1% per 10 Intel)
  const intelHealMult = attacker.isMage && attacker.maxMana ? 1 + attacker.maxMana / 1000 : 1;
  if (skill.healSelf) res.healed = Math.floor(attacker.maxHp * skill.healSelf / 100 * healBonusMult * intelHealMult);
  if (skill.buffAtk) res.buff = { stat: 'atk', value: skill.buffAtk / 100, turns: skill.buffDur || 3 };
  if (skill.buffDef) res.buff = { stat: 'def', value: skill.buffDef / 100, turns: skill.buffDur || 3 };
  if (skill.debuffDef) res.debuff = { stat: 'def', value: -(skill.debuffDef / 100), turns: skill.debuffDur || 2 };
  // Shield team: caster's effective DEF × pct → applied to all allies by the mode
  if (skill.shieldTeamPctDef) {
    const effDef = getEffStat(attacker.def, attacker.buffs, 'def');
    res.shieldTeam = Math.floor(effDef * skill.shieldTeamPctDef);
  }

  const parts = [];
  if (res.isCrit) parts.push('CRITIQUE !');
  parts.push(`${attacker.name} utilise ${skill.name} !`);
  if (res.damage > 0) parts.push(`-${fmtNum(res.damage)} PV`);
  if (res.healed > 0) parts.push(`+${fmtNum(res.healed)} soins`);
  if (res.buff) parts.push(`${res.buff.stat.toUpperCase()} +${Math.round(res.buff.value * 100)}%`);
  if (res.debuff) parts.push(`DEF ennemi ${Math.round(res.debuff.value * 100)}%`);
  if (res.shieldTeam) parts.push(`🛡️ +${fmtNum(res.shieldTeam)} Shield equipe`);
  res.text = parts.join(' ');
  return res;
};

export const aiPickSkill = (entity) => {
  const avail = entity.skills.filter(s => s.cd === 0);
  if (entity.hp < entity.maxHp * 0.35) {
    const heal = avail.find(s => s.healSelf);
    if (heal) return heal;
  }
  if (entity.buffs.length === 0) {
    const buff = avail.find(s => s.buffAtk || s.buffDef);
    if (buff && Math.random() < 0.5) return buff;
  }
  const attacks = avail.filter(s => s.power > 0).sort((a, b) => b.power - a.power);
  if (attacks.length > 0 && Math.random() < 0.7) return attacks[0];
  return avail[Math.floor(Math.random() * avail.length)] || entity.skills[0];
};

// ─── Support AI — heals lowest HP ally if needed, else attacks ─
export const aiPickSkillSupport = (entity, allies) => {
  const avail = entity.skills.filter(s => s.cd === 0);
  const aliveAllies = allies.filter(a => a.alive && a.id !== entity.id && a.hp < a.maxHp);
  if (aliveAllies.length > 0) {
    const lowest = aliveAllies.sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];
    if (lowest.hp / lowest.maxHp < 0.75) {
      const healSkill = avail.find(s => s.healSelf || s.healAlly);
      if (healSkill) return { skill: healSkill, healTarget: lowest };
    }
  }
  return { skill: aiPickSkill(entity), healTarget: null };
};

// ─── Buff/Debuff Icons ───────────────────────────────────────
export const BUFF_ICONS = {
  atk:      { pos: '\u2694\uFE0F\u25B2', neg: '\u2694\uFE0F\u25BC', posColor: 'text-red-400', negColor: 'text-red-800' },
  def:      { pos: '\uD83D\uDEE1\uFE0F\u25B2', neg: '\uD83D\uDEE1\uFE0F\u25BC', posColor: 'text-blue-400', negColor: 'text-blue-800' },
  spd:      { pos: '\uD83D\uDCA8\u25B2', neg: '\uD83D\uDCA8\u25BC', posColor: 'text-green-400', negColor: 'text-green-800' },
  poison:   { icon: '\u2620\uFE0F', color: 'text-green-500' },
  antiHeal: { icon: '\uD83D\uDEAB', color: 'text-pink-500' },
};

// ─── Deterministic Damage Preview ────────────────────────────
export const computeDamagePreview = (attacker, skill, defender, tb = {}) => {
  if (!skill || skill.power <= 0) return null;
  let effAtk = getEffStat(attacker.atk, attacker.buffs, 'atk');
  let effDef = getEffStat(defender.def, defender.buffs || [], 'def');
  if (tb.hasBerserk && attacker.hp < attacker.maxHp * 0.3) effAtk = Math.floor(effAtk * 1.4);
  if (tb.bastionDef && defender.hp < defender.maxHp * 0.5) effDef = Math.floor(effDef * (1 + (tb.bastionDef || 0) / 100));

  const raw = effAtk * (skill.power / 100);
  let elemMult = getElementMult(attacker.element, defender.element);
  if (tb.hasTranscendance && elemMult > 1) elemMult = 1.6;
  if (elemMult > 1 && tb.elementalAdvantageBonus) elemMult += tb.elementalAdvantageBonus / 100;

  const defPenVal = tb.defPen || 0;
  const adjustedDef = Math.max(0, effDef * (1 - defPenVal / 100));
  const defFactor = 100 / (100 + Math.max(0, adjustedDef));
  let adjustedDefCrit = adjustedDef;
  if (tb.critDefIgnore) adjustedDefCrit *= 0.5;
  const defFactorCrit = 100 / (100 + Math.max(0, adjustedDefCrit));
  const critMult = 1.5 + (tb.critDamage || 0) / 100;

  let defenderRes = defender.res || 0;
  if (tb.bastionRes && defender.hp < defender.maxHp * 0.5) defenderRes += (tb.bastionRes || 0);
  const resFactor = Math.max(0.3, 1 - Math.min(70, defenderRes) / 100);

  const physMult = 1 + (tb.physicalDamage || 0) / 100;
  const elemDmgMult = 1 + (tb.elementalDamage || 0) / 100;
  const bossMult = defender.isBoss ? 1 + (tb.bossDamage || 0) / 100 : 1;
  let artElemMult = 1 + (tb.allDamage || 0) / 100;
  if (tb.convergenceAll) {
    artElemMult += (tb.fireDamage || 0) / 100 + (tb.waterDamage || 0) / 100 + (tb.shadowDamage || 0) / 100 + (tb.windDamage || 0) / 100 + (tb.earthDamage || 0) / 100 + (tb.lightDamage || 0) / 100;
  } else {
    const elemKey = attacker.element + 'Damage';
    artElemMult += (tb[elemKey] || 0) / 100;
  }
  let executionMult = 1;
  if (tb.executionDmg && defender.hp < defender.maxHp * 0.3) executionMult += (tb.executionDmg || 0) / 100;

  const baseDmg = raw * elemMult * defFactor * resFactor * physMult * elemDmgMult * bossMult * artElemMult * executionMult;
  const baseDmgCrit = raw * elemMult * defFactorCrit * resFactor * critMult * physMult * elemDmgMult * bossMult * artElemMult * executionMult;

  return {
    min: Math.max(1, Math.floor(baseDmg * 0.9)),
    max: Math.max(1, Math.floor(baseDmg * 1.1)),
    critMin: Math.max(1, Math.floor(baseDmgCrit * 0.9)),
    critMax: Math.max(1, Math.floor(baseDmgCrit * 1.1)),
    critChance: Math.min(100, Math.max(0, (attacker.crit || 0) - (defender.res || 0) * 0.5)),
    elementAdvantage: elemMult > 1,
  };
};

// ─── ARC II Smart Enemy AI ───────────────────────────────────
export const inferEnemyRole = (enemy) => {
  const hasHeal = enemy.skills.some(s => s.healAlly || s.healSelf);
  const hasBuff = enemy.skills.some(s => s.buffAllyAtk || s.buffAllyDef);
  const hasDebuff = enemy.skills.some(s => s.debuffAtk || s.debuffSpd || s.antiHeal || s.poison);
  if (hasHeal || hasBuff) return 'support';
  if (hasDebuff) return 'debuffer';
  return 'attacker';
};

export const aiPickSkillArc2 = (enemy, allEnemies, allPlayers) => {
  const avail = enemy.skills.filter(s => s.cd === 0);
  if (avail.length === 0) return { skill: enemy.skills[0], target: null, targetType: 'self' };

  const role = inferEnemyRole(enemy);
  const aliveAllies = allEnemies.filter(e => e.alive && e !== enemy);
  const alivePlayers = allPlayers.filter(f => f.alive);
  if (alivePlayers.length === 0) return { skill: avail[0], target: null, targetType: 'self' };

  // ═══ SUPPORT ═══
  if (role === 'support') {
    const lowestAlly = [...aliveAllies].sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];
    if (lowestAlly && lowestAlly.hp / lowestAlly.maxHp < 0.6) {
      const healSkill = avail.find(s => s.healAlly);
      if (healSkill) return { skill: healSkill, target: lowestAlly, targetType: 'ally' };
    }
    const boss = aliveAllies.find(e => e.isBoss || e.isMain);
    const buffTarget = boss || aliveAllies[0];
    if (buffTarget && !buffTarget.buffs.some(b => b.stat === 'atk' && b.value > 0)) {
      const buffSkill = avail.find(s => s.buffAllyAtk || s.buffAllyDef);
      if (buffSkill && Math.random() < 0.7) return { skill: buffSkill, target: buffTarget, targetType: 'ally' };
    }
  }

  // ═══ DEBUFFER ═══
  if (role === 'debuffer') {
    const antiHealSkill = avail.find(s => s.antiHeal);
    if (antiHealSkill) {
      const target = [...alivePlayers].sort((a, b) => b.hp - a.hp)[0];
      if (target && !target.buffs.some(b => b.type === 'antiHeal')) return { skill: antiHealSkill, target, targetType: 'player' };
    }
    const debuffAtkSkill = avail.find(s => s.debuffAtk);
    if (debuffAtkSkill) {
      const target = [...alivePlayers].sort((a, b) => b.atk - a.atk)[0];
      if (target && !target.buffs.some(b => b.stat === 'atk' && b.value < 0)) return { skill: debuffAtkSkill, target, targetType: 'player' };
    }
    const poisonSkill = avail.find(s => s.poison);
    if (poisonSkill) {
      const target = alivePlayers.find(p => !p.buffs.some(b => b.type === 'poison'));
      if (target) return { skill: poisonSkill, target, targetType: 'player' };
    }
    const debuffSpdSkill = avail.find(s => s.debuffSpd);
    if (debuffSpdSkill) {
      const target = [...alivePlayers].sort((a, b) => b.spd - a.spd)[0];
      if (target && !target.buffs.some(b => b.stat === 'spd' && b.value < 0)) return { skill: debuffSpdSkill, target, targetType: 'player' };
    }
  }

  // ═══ ATTACKER / fallback ═══
  if (enemy.hp < enemy.maxHp * 0.35) {
    const heal = avail.find(s => s.healSelf);
    if (heal) return { skill: heal, target: null, targetType: 'self' };
  }
  if (!enemy.buffs.some(b => b.value > 0)) {
    const buff = avail.find(s => s.buffAtk || s.buffDef || s.buffSpd);
    if (buff && Math.random() < 0.5) return { skill: buff, target: null, targetType: 'self' };
  }
  const attacks = avail.filter(s => s.power > 0).sort((a, b) => b.power - a.power);
  if (attacks.length > 0) {
    const skill = Math.random() < 0.7 ? attacks[0] : attacks[Math.floor(Math.random() * attacks.length)];
    const target = Math.random() < 0.6
      ? alivePlayers.reduce((a, c) => a.hp < c.hp ? a : c)
      : alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
    return { skill, target, targetType: 'player' };
  }
  const fallSkill = avail[0] || enemy.skills[0];
  return { skill: fallSkill, target: alivePlayers[0], targetType: 'player' };
};

// ─── SPD to attack interval (for raid real-time) ─────────────
export const spdToInterval = (spd) => Math.max(500, Math.floor(3000 / (1 + spd / 50)));

// ─── CD System for live modes (PvP/Raid) ─────────────────────
export const BASE_CD_MS = 3000; // 1 CD point = 3 seconds in live modes
// Intel CDR multiplier: cap 50% reduction (CD never below half)
export const getIntelCDR = (intel) => Math.max(0.50, 1 - (intel || 0) / 1000);

// ─── PVP Constants ───────────────────────────────────────────
// ─── Talent II Bonus Merge ────────────────────────────────────
// Merge Talent I + Talent II bonuses into a single object for statsAtFull / computeAttack
export function mergeTalentBonuses(tb1 = {}, tb2 = {}) {
  const merged = { ...tb1 };
  for (const [key, val] of Object.entries(tb2)) {
    if (typeof val === 'boolean') {
      merged[key] = merged[key] || val;
    } else if (typeof val === 'number') {
      merged[key] = (merged[key] || 0) + val;
    }
  }
  return merged;
}

export const PVP_DAMAGE_MULT = 0.15;  // Damage reduction in PVP (heals unaffected) — buffed from 0.12
export const PVP_HP_MULT = 5;         // All units get x5 HP in PVP (longer fights)
export const PVP_DEF_MULT = 1.6;      // DEF is 60% more effective in PVP
export const PVP_RES_MULT = 1.4;      // RES is 40% more effective in PVP
export const PVP_DMG_CAP = 0.08;      // Single hit can't exceed 8% of target maxHP (anti-OS)
export const PVP_DURATION_SEC = 120;   // 2 minutes max (fights last ~1 min now)
export const PVP_TICK_MS = 100;

// ═══════════════════════════════════════════════════════════════
// STAR DIFFICULTY SYSTEM
// ═══════════════════════════════════════════════════════════════

const STAR_SCALING = { hp: 0.25, atk: 0.18, def: 0.15, spd: 0.08, crit_flat: 1.2, res_flat: 1.0 };

export function getStarScaledStats(stage, stars) {
  if (!stars) return { hp: stage.hp, atk: stage.atk, def: stage.def, spd: stage.spd, crit: stage.crit, res: stage.res };
  return {
    hp:   Math.floor(stage.hp  * (1 + stars * STAR_SCALING.hp)),
    atk:  Math.floor(stage.atk * (1 + stars * STAR_SCALING.atk)),
    def:  Math.floor(stage.def * (1 + stars * STAR_SCALING.def)),
    spd:  Math.floor(stage.spd * (1 + stars * STAR_SCALING.spd)),
    crit: Math.min(90, +(stage.crit + stars * STAR_SCALING.crit_flat).toFixed(1)),
    res:  Math.min(80, +(stage.res  + stars * STAR_SCALING.res_flat).toFixed(1)),
  };
}

export function getStarRewardMult(stars) {
  if (!stars) return { xp: 1, coins: 1, accountXp: 1 };
  return { xp: 1 + stars * 0.20, coins: 1 + stars * 0.15, accountXp: 1 + stars * 0.10 };
}

export function getStarDropBonus(stars) {
  return { hammerPct: Math.min(40, stars * 4), hunterPct: Math.min(3, stars * 0.3) };
}

export function getGuaranteedArtifactRarity(stars) {
  if (stars >= 9) return 'mythique';
  if (stars >= 7) return 'legendaire';
  if (stars >= 5) return 'rare';
  return null;
}

export function calculatePowerScore(stats, isBoss = false) {
  const base = (stats.hp || 0) * 0.5 + (stats.atk || 0) * 8 + (stats.def || 0) * 3
    + (stats.spd || 0) * 2 + (stats.crit || 0) * 5 + (stats.res || 0) * 4;
  return Math.floor(base * (isBoss ? 1.2 : 1));
}

export function getDifficultyRating(playerPower, enemyPower) {
  const r = playerPower / enemyPower;
  if (r >= 1.5) return { label: 'Trivial',    color: 'text-gray-400',   icon: '\uD83D\uDE34' };
  if (r >= 1.2) return { label: 'Facile',     color: 'text-green-400',  icon: '\u2714' };
  if (r >= 0.9) return { label: 'Equilibre',  color: 'text-blue-400',   icon: '\u2694\uFE0F' };
  if (r >= 0.7) return { label: 'Difficile',  color: 'text-orange-400', icon: '\u26A0\uFE0F' };
  if (r >= 0.5) return { label: 'Extreme',    color: 'text-red-400',    icon: '\uD83D\uDC80' };
  return                { label: 'Impossible', color: 'text-red-600',    icon: '\u2620\uFE0F' };
}
