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
export const STAT_PER_POINT = { hp: 8, atk: 1.5, def: 1.5, spd: 1, crit: 0.8, res: 0.8, mana: 4 };
export const STAT_ORDER = ['hp', 'atk', 'def', 'spd', 'crit', 'res', 'mana'];
export const STAT_META = {
  hp:   { name: 'PV',   icon: '\u2764\uFE0F', color: 'text-green-400',   desc: 'Points de Vie' },
  atk:  { name: 'ATK',  icon: '\u2694\uFE0F', color: 'text-red-400',     desc: "Puissance d'attaque" },
  def:  { name: 'DEF',  icon: '\uD83D\uDEE1\uFE0F', color: 'text-blue-400', desc: 'Resistance physique' },
  spd:  { name: 'SPD',  icon: '\uD83D\uDCA8', color: 'text-emerald-400', desc: 'Vitesse' },
  crit: { name: 'CRIT', icon: '\uD83C\uDFAF', color: 'text-yellow-400', desc: 'Chance de coup critique' },
  res:  { name: 'RES',  icon: '\uD83D\uDEE1\uFE0F', color: 'text-cyan-400',    desc: 'Reduction des degats' },
  mana: { name: 'MANA', icon: '\uD83D\uDCA0', color: 'text-violet-400',  desc: 'Points de mana' },
};

// ─── Mana System ────────────────────────────────────────────
export const getBaseMana = (base) => Math.floor(50 + base.hp / 4 + (base.res || 0) * 2);
export const BASE_MANA_REGEN = 8;
export const getSkillManaCost = (skill) => {
  if (skill.manaCost !== undefined) return skill.manaCost;
  if (!skill.power || skill.cdMax === 0) return 0;
  return Math.floor(5 + skill.power / 15 + skill.cdMax * 3);
};
export const POINTS_PER_LEVEL = 2;
export const MAX_LEVEL = 140;

// ─── Account Level System ───────────────────────────────────
export const ACCOUNT_XP_FOR_LEVEL = (lvl) => 80 + lvl * 25;
export const ACCOUNT_BONUS_INTERVAL = 10;
export const ACCOUNT_BONUS_AMOUNT = 10;
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
  const adjBase = {
    hp: Math.floor(base.hp * eveilMult),
    atk: Math.floor(base.atk * eveilMult),
    def: Math.floor(base.def * eveilMult),
    spd: Math.floor(base.spd * eveilMult),
    crit: +(base.crit * eveilMult).toFixed(1),
    res: +(base.res * eveilMult).toFixed(1),
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

  const stats = statsAt(adjBase, growth, level, allocated, mergedTb);
  // Add flat equipment bonuses
  stats.hp += (equipBonuses.hp_flat || 0);
  stats.atk += (equipBonuses.atk_flat || 0);
  stats.def += (equipBonuses.def_flat || 0);
  stats.spd += (equipBonuses.spd_flat || 0);
  // Add global account bonuses (flat, applied to all characters)
  stats.hp += (globalBonuses.hp || 0) * STAT_PER_POINT.hp;
  stats.atk += (globalBonuses.atk || 0) * STAT_PER_POINT.atk;
  stats.def += (globalBonuses.def || 0) * STAT_PER_POINT.def;
  stats.spd += (globalBonuses.spd || 0) * STAT_PER_POINT.spd;
  stats.crit = +(stats.crit + (globalBonuses.crit || 0) * STAT_PER_POINT.crit).toFixed(1);
  stats.res = +(stats.res + (globalBonuses.res || 0) * STAT_PER_POINT.res).toFixed(1);
  // Mana (derived from base stats + allocated + equipment + account)
  const baseMana = getBaseMana(base);
  const manaFromAlloc = (allocated.mana || 0) * STAT_PER_POINT.mana;
  const manaFromAccount = (globalBonuses.mana || 0) * STAT_PER_POINT.mana;
  const manaPercent = 1 + (mergedTb.manaPercent || 0) / 100 + (equipBonuses.manaPercent || 0) / 100;
  stats.mana = Math.floor((baseMana + manaFromAlloc + manaFromAccount) * manaPercent);
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

export const computeAttack = (attacker, skill, defender, tb = {}) => {
  const res = { damage: 0, isCrit: false, healed: 0, buff: null, debuff: null, text: '' };
  let effAtk = getEffStat(attacker.atk, attacker.buffs, 'atk');
  const effDef = getEffStat(defender.def, defender.buffs || [], 'def');

  if (tb.hasBerserk && attacker.hp < attacker.maxHp * 0.3) {
    effAtk = Math.floor(effAtk * 1.4);
  }

  if (skill.power > 0) {
    const raw = effAtk * (skill.power / 100);
    let elemMult = getElementMult(attacker.element, defender.element);
    if (tb.hasTranscendance && elemMult > 1) elemMult = 1.6;
    if (elemMult > 1 && tb.elementalAdvantageBonus) elemMult += tb.elementalAdvantageBonus / 100;
    // DEF penetration from artifacts
    const defPenVal = tb.defPen || 0;
    const adjustedDef = Math.max(0, effDef * (1 - defPenVal / 100));
    const defFactor = 100 / (100 + Math.max(0, adjustedDef));
    const critChance = Math.min(80, attacker.crit || 0);
    res.isCrit = Math.random() * 100 < critChance;
    const critMult = res.isCrit ? 1.5 + (tb.critDamage || 0) / 100 : 1;
    const resFactor = Math.max(0.3, 1 - Math.min(70, defender.res || 0) / 100);
    const physMult = 1 + (tb.physicalDamage || 0) / 100;
    const elemDmgMult = 1 + (tb.elementalDamage || 0) / 100;
    const bossMult = defender.isBoss ? 1 + (tb.bossDamage || 0) / 100 : 1;
    // Element-specific damage from artifact sets
    let artElemMult = 1 + (tb.allDamage || 0) / 100;
    if (attacker.element === 'fire' && tb.fireDamage) artElemMult += tb.fireDamage / 100;
    if (attacker.element === 'water' && tb.waterDamage) artElemMult += tb.waterDamage / 100;
    if (attacker.element === 'shadow' && tb.shadowDamage) artElemMult += tb.shadowDamage / 100;
    const variance = 0.9 + Math.random() * 0.2;
    res.damage = Math.max(1, Math.floor(raw * elemMult * defFactor * resFactor * critMult * physMult * elemDmgMult * bossMult * artElemMult * variance));
  }
  const healBonusMult = 1 + (tb.healBonus || 0) / 100;
  if (skill.healSelf) res.healed = Math.floor(attacker.maxHp * skill.healSelf / 100 * healBonusMult);
  if (skill.buffAtk) res.buff = { stat: 'atk', value: skill.buffAtk / 100, turns: skill.buffDur || 3 };
  if (skill.buffDef) res.buff = { stat: 'def', value: skill.buffDef / 100, turns: skill.buffDur || 3 };
  if (skill.debuffDef) res.debuff = { stat: 'def', value: -(skill.debuffDef / 100), turns: skill.debuffDur || 2 };

  const parts = [];
  if (res.isCrit) parts.push('CRITIQUE !');
  parts.push(`${attacker.name} utilise ${skill.name} !`);
  if (res.damage > 0) parts.push(`-${res.damage} PV`);
  if (res.healed > 0) parts.push(`+${res.healed} soins`);
  if (res.buff) parts.push(`${res.buff.stat.toUpperCase()} +${Math.round(res.buff.value * 100)}%`);
  if (res.debuff) parts.push(`DEF ennemi ${Math.round(res.debuff.value * 100)}%`);
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

// ─── SPD to attack interval (for raid real-time) ─────────────
export const spdToInterval = (spd) => Math.max(500, Math.floor(3000 / (1 + spd / 50)));

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
