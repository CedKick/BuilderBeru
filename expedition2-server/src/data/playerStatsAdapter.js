// ── Player Stats Adapter (Ragnaros) ──
// Converts profile data + equipped gear into raid-ready player stats
// Used by GameEngine when adding players with saved progression

import { BASE_STATS, STAT_GROWTH, getStatsAtLevel } from './playerProfile.js';
import { computeRaidGearBonuses, countRagnarosSetPieces, getRagnarosSetBonuses } from './raidGearData.js';

// Scale profile stats to raid combat stats (profile uses lower numbers)
const RAID_SCALE = {
  hp: 2.0,    // profile hp ~28000 * 2 = 56000+ (matches Player.js CLASSES)
  atk: 7.0,   // profile atk ~800 * 7 = 5600+ (matches)
  def: 1.0,   // def used for damage reduction calc
  spd: 1.2,   // speed scaling
  mana: 1.5,  // mana scaling
};

// Class overlays: adjust profile stats toward class fantasy
const CLASS_OVERLAY = {
  tank:      { hpMult: 1.4, atkMult: 0.5, defMult: 2.0, spdMult: 0.85, manaMult: 0.8, critBase: 0.15, critDmg: 1.8, color: '#60a5fa' },
  healer:    { hpMult: 1.0, atkMult: 0.55, defMult: 1.0, spdMult: 1.0,  manaMult: 1.5, critBase: 0.20, critDmg: 1.8, color: '#a78bfa' },
  warrior:   { hpMult: 1.15, atkMult: 0.9, defMult: 1.2, spdMult: 1.0,  manaMult: 1.0, critBase: 0.25, critDmg: 2.0, color: '#f59e0b', useRage: true },
  archer:    { hpMult: 0.85, atkMult: 1.0, defMult: 0.8, spdMult: 1.15, manaMult: 1.0, critBase: 0.35, critDmg: 2.5, color: '#4ade80' },
  berserker: { hpMult: 1.25, atkMult: 1.2, defMult: 0.9, spdMult: 1.05, manaMult: 0.8, critBase: 0.30, critDmg: 2.2, color: '#ef4444' },
  mage:      { hpMult: 0.8, atkMult: 1.15, defMult: 0.7, spdMult: 0.95, manaMult: 1.3, critBase: 0.30, critDmg: 2.4, color: '#c084fc' },
};

function applyGearBonuses(stats, raidGear) {
  if (!raidGear) return stats;
  const b = computeRaidGearBonuses(raidGear);

  stats.hp += b.hp_flat;
  stats.maxHp += b.hp_flat;
  stats.atk += b.atk_flat;
  stats.def += b.def_flat;
  stats.speed += b.spd_flat;
  stats.critRate += b.crit_rate / 100; // convert from percentage to decimal
  stats.mana += b.mana_flat;
  stats.maxMana += b.mana_flat;

  // Percent bonuses
  if (b.hp_pct > 0) {
    const bonus = Math.floor(stats.maxHp * b.hp_pct / 100);
    stats.hp += bonus; stats.maxHp += bonus;
  }
  if (b.atk_pct > 0) stats.atk += Math.floor(stats.atk * b.atk_pct / 100);
  if (b.def_pct > 0) stats.def += Math.floor(stats.def * b.def_pct / 100);

  // Ragnaros set bonuses
  const setPieces = countRagnarosSetPieces(raidGear);
  if (setPieces >= 2) {
    const sb = getRagnarosSetBonuses(setPieces);
    if (sb.atk_pct > 0) stats.atk += Math.floor(stats.atk * sb.atk_pct / 100);
    if (sb.def_pct > 0) stats.def += Math.floor(stats.def * sb.def_pct / 100);
    if (sb.crit_rate > 0) stats.critRate += sb.crit_rate / 100;
    if (sb.crit_dmg > 0) stats.critDmg += sb.crit_dmg / 100;
    if (sb.hp_pct > 0) {
      const bonus = Math.floor(stats.maxHp * sb.hp_pct / 100);
      stats.hp += bonus; stats.maxHp += bonus;
    }
    if (sb.mana_flat > 0) { stats.mana += sb.mana_flat; stats.maxMana += sb.mana_flat; }
  }

  return stats;
}

/**
 * Build raid player stats from class + optional profile/gear data
 *
 * @param {string} playerClass - 'tank' | 'healer' | 'warrior' | 'archer' | 'berserker' | 'mage'
 * @param {Object|null} profileData - Player's saved profile data
 *   Expected shape: {
 *     level: number,
 *     raidGear: { weapon, artifacts: { helmet, chest, ... } },
 *   }
 * @returns {Object} Stats matching Player.js constructor expectations
 */
export function buildPlayerStats(playerClass, profileData) {
  const overlay = CLASS_OVERLAY[playerClass] || CLASS_OVERLAY.warrior;
  const level = profileData?.level || 1;

  // Get base stats at level
  const base = getStatsAtLevel(playerClass, level);

  // Apply raid scaling + class overlay
  const hp = Math.floor(base.hp * RAID_SCALE.hp * overlay.hpMult);
  const mana = Math.floor(base.mana * RAID_SCALE.mana * overlay.manaMult);

  const stats = {
    hp,
    maxHp: hp,
    mana,
    maxMana: mana,
    atk: Math.floor(base.atk * RAID_SCALE.atk * overlay.atkMult),
    def: Math.floor(base.def * RAID_SCALE.def * overlay.defMult),
    speed: Math.floor(base.spd * RAID_SCALE.spd * overlay.spdMult),
    critRate: overlay.critBase + (base.crit / 100),
    critDmg: overlay.critDmg,
    color: overlay.color,
    useRage: overlay.useRage || false,
  };

  // Apply gear
  return applyGearBonuses(stats, profileData?.raidGear);
}
