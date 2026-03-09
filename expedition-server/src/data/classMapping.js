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
    aggroMult: 30.0,
    color: '#3b82f6',
  },
  healer: {
    hp: 1.8,
    atk: 0.3,       // Very low damage
    int: 0.35,       // INT from inscription mana — healers need solid INT for heal scaling
    def: 1.0,
    spd: 0.9,
    crit: 0.3,
    res: 1.5,
    mana: 1200,      // High mana for healing (combat pool)
    aggroMult: 0.7,
    color: '#10b981',
    usesInt: true,    // Offensive stat = INT instead of ATK
  },
  dps_cac: {  // Warrior (assassins) — high risk CAC, high reward but not OP
    hp: 1.2,
    atk: 0.85,      // Nerfed from 1.0 — CAC compensated by combo multipliers + proximity
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
    int: 0.50,       // INT from inscription mana — mages are the INT powerhouses
    def: 0.4,
    spd: 0.9,
    crit: 0.7,
    res: 0.5,
    mana: 1500,      // Highest mana pool (combat pool)
    aggroMult: 0.9,
    color: '#c084fc',
    usesInt: true,    // Offensive stat = INT instead of ATK
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

  // INT: for mages/supports, inscription "mana" IS their intelligence (magic power)
  // In the colosseum system, int_flat/int_pct bonuses are merged into the mana stat.
  // We use mana × intMult as base, but also consider ATK for hybrid builds (e.g. Gojo has high ATK, lower mana).
  const intMult = mults.int || 0;
  let finalInt = 0;
  if (intMult > 0) {
    const fromMana = inscriptionStats.mana ? Math.round(inscriptionStats.mana * intMult) : 0;
    const fromAtk = Math.round(inscriptionStats.atk * (intMult * 3));  // ATK fallback weighted higher
    finalInt = Math.max(fromMana, fromAtk);  // Take whichever is better
    console.log(`  [INT] ${hunterId} (${combatClass}): inscMana=${inscriptionStats.mana || 0}, inscAtk=${inscriptionStats.atk || 0}, intMult=${intMult}, fromMana=${fromMana}, fromAtk=${fromAtk} → INT=${finalInt}`);
  }

  return {
    maxHp: Math.round(inscriptionStats.hp * mults.hp),
    hp: Math.round(inscriptionStats.hp * mults.hp),
    atk: Math.round(inscriptionStats.atk * mults.atk),
    int: finalInt,  // 0 for non-INT classes
    def: Math.round(inscriptionStats.def * mults.def),
    spd: Math.round(inscriptionStats.spd * mults.spd),
    crit: Math.round(inscriptionStats.crit * mults.crit),
    res: Math.round(inscriptionStats.res * mults.res),
    maxMana: mults.mana,
    mana: mults.useRage ? 0 : mults.mana,
    useRage: !!mults.useRage,
    usesInt: !!mults.usesInt,
    aggroMult: mults.aggroMult,
    color: mults.color,
    combatClass,
  };
}
