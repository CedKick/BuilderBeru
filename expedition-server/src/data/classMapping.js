// ─── Hunter → Combat Class Mapping ───────────────────────
// Maps each hunter's base class to a Manaya combat class
// and defines stat multipliers for combat scaling.
//
// Combat classes: tank, healer, dps_cac (warrior), dps_range (archer), berserker, mage
// Each hunter gets one based on their expedition class (tank/fighter/assassin/mage/support)

import { CLASS_MAP } from '../config.js';
import { HUNTERS } from './hunterData.js';

// Stat multipliers per combat class
// These adjust inscription stats for real-time combat balance
// A tank needs way more HP relative to their inscription stats, etc.
export const CLASS_STAT_MULTS = {
  tank: {
    hp: 3.0,        // Tanks are beefy
    atk: 0.4,       // Low damage
    def: 2.5,
    spd: 0.8,       // Slow
    crit: 0.3,
    res: 2.0,
    mana: 400,       // Fixed mana pool
    aggroMult: 3.0,
    color: '#3b82f6',
  },
  healer: {
    hp: 1.8,
    atk: 0.3,       // Very low damage
    def: 1.0,
    spd: 0.9,
    crit: 0.3,
    res: 1.5,
    mana: 800,       // High mana for healing
    aggroMult: 0.7,
    color: '#10b981',
  },
  dps_cac: {  // Warrior (assassins)
    hp: 1.2,
    atk: 1.0,
    def: 0.8,
    spd: 1.2,       // Fast
    crit: 1.0,
    res: 0.5,
    mana: 100,       // RAGE (starts at 0, builds from attacks)
    aggroMult: 1.0,
    color: '#ef4444',
    useRage: true,
  },
  dps_range: {  // Archer
    hp: 0.8,
    atk: 0.7,
    def: 0.5,
    spd: 1.0,
    crit: 0.8,
    res: 0.4,
    mana: 500,
    aggroMult: 1.0,
    color: '#f59e0b',
  },
  berserker: {  // Fighters
    hp: 1.5,
    atk: 0.8,
    def: 0.7,
    spd: 1.1,
    crit: 0.8,
    res: 0.4,
    mana: 400,
    aggroMult: 1.1,
    color: '#dc2626',
  },
  mage: {
    hp: 0.9,
    atk: 0.6,       // Lower raw ATK but high skill power
    def: 0.4,
    spd: 0.9,
    crit: 0.7,
    res: 0.5,
    mana: 1000,      // Highest mana pool
    aggroMult: 0.9,
    color: '#c084fc',
  },
};

// Get combat class for a hunter
export function getCombatClass(hunterId) {
  const hunter = HUNTERS[hunterId];
  if (!hunter) return 'dps_cac'; // fallback
  return CLASS_MAP[hunter.class] || 'dps_cac';
}

// Build combat stats from inscription fullStats + combat class
export function buildCombatStats(hunterId, inscriptionStats) {
  const combatClass = getCombatClass(hunterId);
  const mults = CLASS_STAT_MULTS[combatClass];
  if (!mults) return inscriptionStats;

  return {
    maxHp: Math.round(inscriptionStats.hp * mults.hp),
    hp: Math.round(inscriptionStats.hp * mults.hp),
    atk: Math.round(inscriptionStats.atk * mults.atk),
    def: Math.round(inscriptionStats.def * mults.def),
    spd: Math.round(inscriptionStats.spd * mults.spd),
    crit: Math.round(inscriptionStats.crit * mults.crit),
    res: Math.round(inscriptionStats.res * mults.res),
    maxMana: mults.mana,
    mana: mults.useRage ? 0 : mults.mana,
    useRage: !!mults.useRage,
    aggroMult: mults.aggroMult,
    color: mults.color,
    combatClass,
  };
}
