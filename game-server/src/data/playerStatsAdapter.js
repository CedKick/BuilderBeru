// ── Player Stats Adapter ──
// Converts ShadowColosseum account data into raid-ready player stats
// Supports two modes:
//   1. Main hunter + class overlay (hunter provides base stats, class provides skills/role)
//   2. Class-only mode (fallback: uses class base stats directly)

import { CLASS_STATS } from './classStats.js';
import { HUNTERS, hunterStatsAtLevel } from './hunterData.js';
import { computeRaidGearBonuses } from './raidGearData.js';

// Class overlay: modifiers applied on top of hunter base stats
const CLASS_OVERLAY = {
  tank:      { hpMult: 1.4, atkMult: 0.7, defMult: 1.8, spdMult: 0.85, mana: 300, aggroMult: 3.0, color: '#3b82f6' },
  healer:    { hpMult: 1.0, atkMult: 0.6, defMult: 1.2, spdMult: 1.0,  mana: 600, aggroMult: 0.7, color: '#10b981' },
  dps_cac:   { hpMult: 1.1, atkMult: 1.3, defMult: 1.0, spdMult: 1.1,  mana: 100, aggroMult: 1.0, color: '#ef4444', useRage: true },
  dps_range: { hpMult: 0.95, atkMult: 1.1, defMult: 0.9, spdMult: 1.15, mana: 450, aggroMult: 1.0, color: '#f59e0b' },
};

// Scale hunter stats (designed for Colosseum turn-based) to raid real-time context
const RAID_SCALE = { hp: 5, atk: 1.0, def: 2.5, spd: 4, crit: 1, res: 1 };

// Stat bonus per allocated point (from Colosseum progression)
const STAT_PER_POINT = { hp: 8, atk: 1.5, def: 1.5, spd: 1, crit: 0.8, res: 0.8, mana: 4 };

/**
 * Build raid player stats from chosen class + optional hunter/colosseum data
 *
 * @param {string} playerClass - 'tank' | 'healer' | 'dps_cac' | 'dps_range'
 * @param {Object|null} colosseumData - Player's data (from WS sync or room selections)
 *   Expected shape: {
 *     mainHunter: string|null,       // Hunter ID (e.g. 'h_kanae')
 *     equippedHunters: [id,id,id],   // 3 support hunters
 *     hunterLevels: { [id]: number },
 *     hunterStars: { [id]: number },
 *     level: number,                  // Colosseum account level
 *     statPoints: { hp, atk, def, spd, crit, res },
 *   }
 * @returns {Object} Final stats for the Player entity
 */
// Apply raid gear bonuses to final stats (flat first, then percent)
function applyGearBonuses(stats, colosseumData) {
  const gear = colosseumData?.raidGear;
  if (!gear) return stats;
  const b = computeRaidGearBonuses(gear);

  stats.hp += b.hp_flat;
  stats.maxHp += b.hp_flat;
  stats.atk += b.atk_flat;
  stats.def += b.def_flat;
  stats.spd += b.spd_flat;
  stats.crit += b.crit_rate;
  stats.res += b.res_flat;
  stats.mana += b.mana_flat;
  stats.maxMana += b.mana_flat;

  // Percent bonuses
  if (b.hp_pct > 0)  { const bonus = Math.floor(stats.maxHp * b.hp_pct / 100); stats.hp += bonus; stats.maxHp += bonus; }
  if (b.atk_pct > 0) { stats.atk += Math.floor(stats.atk * b.atk_pct / 100); }
  if (b.def_pct > 0) { stats.def += Math.floor(stats.def * b.def_pct / 100); }

  return stats;
}

export function buildPlayerStats(playerClass, colosseumData) {
  const mainHunter = colosseumData?.mainHunter || null;
  const hunterLevel = colosseumData?.hunterLevels?.[mainHunter] || 30;
  const hunterStars = colosseumData?.hunterStars?.[mainHunter] || 0;

  // ── Mode 1: Main hunter + class overlay ──
  if (mainHunter && HUNTERS[mainHunter]) {
    const hStats = hunterStatsAtLevel(mainHunter, hunterLevel, hunterStars);
    const overlay = CLASS_OVERLAY[playerClass] || CLASS_OVERLAY.dps_cac;

    const hp = Math.floor(hStats.hp * RAID_SCALE.hp * overlay.hpMult);
    const mana = overlay.mana;

    return applyGearBonuses({
      hp,
      maxHp: hp,
      mana,
      maxMana: mana,
      atk: Math.floor(hStats.atk * RAID_SCALE.atk * overlay.atkMult),
      def: Math.floor(hStats.def * RAID_SCALE.def * overlay.defMult),
      spd: Math.floor(hStats.spd * RAID_SCALE.spd * overlay.spdMult),
      crit: hStats.crit,
      res: hStats.res,
      aggroMult: overlay.aggroMult,
      color: overlay.color,
      mainHunter,
      hunters: colosseumData?.equippedHunters || [null, null, null],
      hunterLevels: colosseumData?.hunterLevels || {},
      hunterStars: colosseumData?.hunterStars || {},
    }, colosseumData);
  }

  // ── Mode 2: Class defaults (no main hunter) ──
  const base = { ...CLASS_STATS[playerClass] };

  if (!colosseumData) {
    return {
      hp: base.hp,
      maxHp: base.hp,
      mana: base.mana,
      maxMana: base.mana,
      atk: base.atk,
      def: base.def,
      spd: base.spd,
      crit: base.crit,
      res: base.res,
      aggroMult: base.aggroMult,
      color: base.color,
      mainHunter: null,
      hunters: [null, null, null],
      hunterLevels: {},
      hunterStars: {},
    };
  }

  // ── Mode 3: Class defaults + Colosseum stat points (no main hunter) ──
  const level = colosseumData.level || 1;
  const levelMult = 1 + (level - 1) * 0.02;
  const pts = colosseumData.statPoints || {};

  const hp = Math.floor((base.hp + (pts.hp || 0) * STAT_PER_POINT.hp) * levelMult);
  const mana = Math.floor((base.mana + (pts.mana || 0) * STAT_PER_POINT.mana) * levelMult);

  return applyGearBonuses({
    hp,
    maxHp: hp,
    mana,
    maxMana: mana,
    atk: Math.floor((base.atk + (pts.atk || 0) * STAT_PER_POINT.atk) * levelMult),
    def: Math.floor((base.def + (pts.def || 0) * STAT_PER_POINT.def) * levelMult),
    spd: Math.floor((base.spd + (pts.spd || 0) * STAT_PER_POINT.spd) * levelMult),
    crit: Math.floor(base.crit + (pts.crit || 0) * STAT_PER_POINT.crit),
    res: Math.floor(base.res + (pts.res || 0) * STAT_PER_POINT.res),
    aggroMult: base.aggroMult,
    color: base.color,
    mainHunter: null,
    hunters: colosseumData.equippedHunters || [null, null, null],
    hunterLevels: colosseumData.hunterLevels || {},
    hunterStars: colosseumData.hunterStars || {},
  }, colosseumData);
}
