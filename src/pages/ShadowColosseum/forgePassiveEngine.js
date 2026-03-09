// forgePassiveEngine.js
// Generic combat engine for community-forged weapon passives.
// Called from ARC I, ARC II, Raid SC, PvP — same hooks everywhere.
// Each passive template maps to concrete combat effects.

import { FORGE_PASSIVE_TEMPLATES } from '../../data/forgePassiveTemplates.js';

// ═══════════════════════════════════════════════════════════════
// INIT — Create state for all forge passives on a weapon
// ═══════════════════════════════════════════════════════════════

export function initForgeState(forgePassives) {
  if (!forgePassives?.length) return null;
  const entries = [];
  for (const p of forgePassives) {
    if (!p.id || p.id === 'none') continue;
    const t = FORGE_PASSIVE_TEMPLATES[p.id];
    if (!t) continue;
    const e = { id: p.id, params: p.params || {}, trigger: t.trigger };
    switch (p.id) {
      case 'innerFlameStack':    e.stacks = 0; break;
      case 'burnProc':           e.dots = []; break;  // array of {dmg, turnsLeft}
      case 'cursedBlade':        e.stacks = 0; break;
      case 'dragonSlayer':       e.hits = 0; e.aoeBonus = 0; break;
      case 'lifesteal':          break; // stateless proc
      case 'devoration':         e.stacks = 0; break;
      case 'celestialShield':    e.shieldHp = 0; e.broken = false; break;
      case 'powerAccumulation':  e.stacks = 0; e.bursting = false; e.burstTurns = 0; break;
      case 'deathLink':          e.hits = 0; break;
      case 'combatEcho':         e.stackTurns = []; break; // remaining turns per stack
      case 'sharedCurse':        e.applied = false; break;
      case 'dodgeCounter':       break;
      case 'ironGuard':          break;
      case 'defIgnore':          break;
      case 'guardianShield':     e.allyDied = false; break;
      case 'commanderAura':      break;
      case 'desperateFury':      break;
      case 'manaFlow':           break;
      case 'chainLightning':     break;
      case 'echoCD':             break;
      case 'healBoost':          e.shieldHp = 0; break;
      case 'cursedPact':         e.turnsLeft = -1; break; // -1 = permanent or not yet started
      case 'berserkerRage':      e.doubled = false; break;
      case 'voidSacrifice':      break;
    }
    entries.push(e);
  }
  return entries.length > 0 ? entries : null;
}

// ═══════════════════════════════════════════════════════════════
// ON BATTLE START — One-time effects at combat start
// ═══════════════════════════════════════════════════════════════

export function forgeOnBattleStart(fighter, forgeState, team, enemies, log) {
  if (!forgeState) return;
  for (const e of forgeState) {
    const p = e.params;
    switch (e.id) {
      // Celestial Shield: add shield = shieldPct% of maxHp
      case 'celestialShield': {
        const shieldAmt = Math.floor(fighter.maxHp * (p.shieldPct || 10) / 100);
        e.shieldHp = shieldAmt;
        fighter.shield = (fighter.shield || 0) + shieldAmt;
        log?.push({ msg: `${fighter.name} : Gardien Céleste ! Bouclier +${shieldAmt} PV`, type: 'player' });
        break;
      }
      // Shared Curse: debuff enemies
      case 'sharedCurse': {
        if (e.applied) break;
        e.applied = true;
        // Apply RES malus to self
        const resMalus = p.resMalus || 10;
        fighter.res = Math.max(0, fighter.res - resMalus);
        // Debuff enemies
        const stat = (p.debuffStat || 'ATK').toLowerCase();
        const debuffPct = (p.enemyDebuff || 5) / 100;
        const maxTargets = p.maxTargets || 1;
        const dur = p.durationTurns === 0 ? 999 : (p.durationTurns || 2);
        const targets = (enemies || []).filter(e => e?.alive).slice(0, maxTargets);
        for (const t of targets) {
          t.buffs = t.buffs || [];
          t.buffs.push({ type: stat, val: -debuffPct, turns: dur });
        }
        if (targets.length > 0) {
          log?.push({ msg: `${fighter.name} : Malédiction ! ${targets.length} cible(s) -${p.enemyDebuff}% ${p.debuffStat}`, type: 'player' });
        }
        break;
      }
      // Commander Aura: buff all allies permanently
      case 'commanderAura': {
        const stat = (p.stat || 'ATK').toLowerCase();
        const pct = (p.buffPct || 5) / 100;
        for (const ally of (team || [])) {
          if (!ally?.alive) continue;
          if (stat === 'atk' || stat === 'int') ally.atk = Math.floor(ally.atk * (1 + pct));
          else if (stat === 'def') ally.def = Math.floor(ally.def * (1 + pct));
          else if (stat === 'crit') ally.crit = Math.min(80, ally.crit + (p.buffPct || 5));
        }
        log?.push({ msg: `${fighter.name} : Aura du Commandeur ! Alliés +${p.buffPct}% ${p.stat}`, type: 'player' });
        break;
      }
    }
  }
  // Apply permanent 'always' stat modifications
  forgeApplyPermanentStats(fighter, forgeState);
}

// ═══════════════════════════════════════════════════════════════
// PERMANENT STATS — Applied once at start (always triggers)
// ═══════════════════════════════════════════════════════════════

function forgeApplyPermanentStats(fighter, forgeState) {
  if (!forgeState) return;
  for (const e of forgeState) {
    if (e.trigger !== 'always') continue;
    const p = e.params;
    switch (e.id) {
      // DEF penetration: stored for damage calc
      case 'defIgnore':
        fighter._forgeDefPen = (fighter._forgeDefPen || 0) + (p.penPct || 8);
        break;
      // Guardian Shield: permanent damage reduction
      case 'guardianShield':
        fighter._forgeDmgReduce = (fighter._forgeDmgReduce || 0) + (p.reducePct || 10);
        break;
      // Cursed Pact: stat sacrifice + boost
      case 'cursedPact': {
        const malus = (p.malusValue || 10) / 100;
        const bonus = (p.bonusValue || 5) / 100;
        const ms = (p.malusStat || 'RES').toUpperCase();
        const bs = (p.bonusStat || 'ATK').toUpperCase();
        if (ms === 'RES') fighter.res = Math.max(0, fighter.res * (1 - malus));
        else if (ms === 'DEF') fighter.def = Math.floor(fighter.def * (1 - malus));
        else if (ms === 'HP') { fighter.hp = Math.floor(fighter.hp * (1 - malus)); fighter.maxHp = fighter.hp; }
        else if (ms === 'SPD') fighter.spd = Math.floor(fighter.spd * (1 - malus));
        if (bs === 'ATK' || bs === 'INT') fighter.atk = Math.floor(fighter.atk * (1 + bonus));
        else if (bs === 'CRIT') fighter.crit = Math.min(80, fighter.crit + (p.bonusValue || 5));
        else if (bs === 'CRIT_DMG') fighter._forgeCritDmg = (fighter._forgeCritDmg || 0) + (p.bonusValue || 5);
        break;
      }
      // Berserker Rage: -RES, +stat
      case 'berserkerRage': {
        const malus = (p.resMalus || 10) / 100;
        const bonus = (p.atkBonus || 5) / 100;
        fighter.res = Math.max(0, fighter.res * (1 - malus));
        fighter.atk = Math.floor(fighter.atk * (1 + bonus));
        break;
      }
      // Void Sacrifice: -DEF, +CRIT
      case 'voidSacrifice': {
        const malus = (p.defMalus || 10) / 100;
        fighter.def = Math.floor(fighter.def * (1 - malus));
        fighter.crit = Math.min(80, fighter.crit + (p.critBonus || 5));
        fighter._forgeCritDmg = (fighter._forgeCritDmg || 0) + (p.critDmgBonus || 5);
        break;
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// BEFORE ATTACK — Modify fighter stats before damage calc
// Returns { atkMult, defPenPct } to apply
// ═══════════════════════════════════════════════════════════════

export function forgeBeforeAttack(fighter, forgeState, enemy, log) {
  if (!forgeState) return { atkMult: 1, defPenPct: 0 };
  let atkMult = 1;
  let defPenPct = fighter._forgeDefPen || 0;

  for (const e of forgeState) {
    const p = e.params;
    switch (e.id) {
      // Inner Flame: accumulated stacks → damage bonus
      case 'innerFlameStack':
        if (e.stacks > 0) atkMult *= (1 + e.stacks * (p.dmgPerStack || 1) / 100);
        break;
      // Desperate Fury: +dmg per %HP missing
      case 'desperateFury': {
        const hpPct = fighter.hp / fighter.maxHp;
        const missingPct = Math.max(0, 1 - hpPct) * 100;
        atkMult *= (1 + missingPct * (p.dmgPerPct || 0.3) / 100);
        break;
      }
      // Mana Flow: dmg bonus if mana > threshold
      case 'manaFlow': {
        const manaPct = (fighter.mana || 0) / (fighter.maxMana || 100) * 100;
        if (manaPct >= (p.manaThreshold || 80)) {
          atkMult *= (1 + (p.dmgBonus || 10) / 100);
        }
        break;
      }
      // Power Accumulation: stacks + burst mode
      case 'powerAccumulation':
        if (e.stacks > 0) atkMult *= (1 + e.stacks * (p.perStack || 1) / 100);
        if (e.bursting) atkMult *= (1 + (p.maxBonus || 10) / 100);
        break;
      // Berserker Rage: doubled bonus under HP threshold
      case 'berserkerRage': {
        const hpPct = fighter.hp / fighter.maxHp * 100;
        if (hpPct < (p.hpThreshold || 50)) {
          if (!e.doubled) {
            e.doubled = true;
            e.doubleTurns = p.durationTurns || 2;
          }
          if (e.doubled && e.doubleTurns > 0) {
            atkMult *= (1 + (p.atkBonus || 5) / 100); // second dose = doubled total
          }
        }
        break;
      }
      // Cursed Blade: accumulated stacks → stat bonus
      case 'cursedBlade':
        if (e.stacks > 0) atkMult *= (1 + e.stacks * (p.perCrit || 2) / 100);
        break;
      // Death Link: SPD bonus (applied as permanent at start is better, but ATK proc here)
      case 'deathLink':
        // The HP malus + SPD bonus are permanent (applied at start)
        break;
    }
  }

  return { atkMult, defPenPct };
}

// ═══════════════════════════════════════════════════════════════
// AFTER ATTACK — Post-damage procs and stacking
// ═══════════════════════════════════════════════════════════════

export function forgeAfterAttack(fighter, forgeState, enemy, dmg, isCrit, killed, team, log) {
  if (!forgeState) return { bonusDmg: 0 };
  let bonusDmg = 0;

  for (const e of forgeState) {
    const p = e.params;
    switch (e.id) {
      // Inner Flame: +1 stack
      case 'innerFlameStack': {
        const max = p.maxStacks || 5;
        if (e.stacks < max) {
          e.stacks++;
          if (e.stacks === max) log?.push({ msg: `${fighter.name} : Flamme Intérieure max ! +${max * (p.dmgPerStack || 1)}% dégâts`, type: 'player' });
        }
        break;
      }
      // Burn Proc: chance to apply DoT
      case 'burnProc': {
        if (Math.random() * 100 < (p.chance || 10)) {
          const dotDmg = Math.max(1, Math.floor(enemy.maxHp * (p.dotPct || 1) / 100));
          const dur = p.duration || 3;
          e.dots.push({ dmg: dotDmg, turns: dur });
          log?.push({ msg: `${fighter.name} : Cendres Ardentes ! ${enemy.name || 'Ennemi'} brûle (${dotDmg}/s, ${dur}s)`, type: 'player' });
        }
        // Apply existing DoTs
        if (e.dots.length > 0 && enemy.alive) {
          let totalDot = 0;
          e.dots = e.dots.filter(d => {
            totalDot += d.dmg;
            d.turns--;
            return d.turns > 0;
          });
          if (totalDot > 0) {
            enemy.hp = Math.max(0, enemy.hp - totalDot);
            if (enemy.hp <= 0) enemy.alive = false;
          }
        }
        break;
      }
      // Chain Lightning: chance for bonus damage
      case 'chainLightning': {
        if (Math.random() * 100 < (p.chance || 15)) {
          const chainDmg = Math.floor(dmg * (p.dmgPct || 30) / 100);
          const targets = p.targets || 1;
          bonusDmg += chainDmg * targets;
          log?.push({ msg: `${fighter.name} : Éclair en Chaîne ! ${targets} cible(s) +${chainDmg * targets} dégâts`, type: 'player' });
        }
        break;
      }
      // Dragon Slayer: AoE every N hits
      case 'dragonSlayer': {
        e.hits++;
        if (e.hits >= (p.hits || 5)) {
          e.hits = 0;
          const aoeDmg = Math.floor(fighter.atk * ((p.aoeMult || 150) + e.aoeBonus) / 100);
          bonusDmg += aoeDmg;
          e.aoeBonus += (p.stackBonus || 5);
          log?.push({ msg: `${fighter.name} : Pourfendeur AoE ! ${aoeDmg} dégâts (bonus +${e.aoeBonus}%)`, type: 'player' });
        }
        break;
      }
      // Lifesteal: chance to heal
      case 'lifesteal': {
        if (dmg > 0 && Math.random() * 100 < (p.chance || 15)) {
          const heal = Math.floor(dmg * (p.stealPct || 8) / 100);
          fighter.hp = Math.min(fighter.maxHp, fighter.hp + heal);
          log?.push({ msg: `${fighter.name} : Vol de vie +${heal} PV`, type: 'player' });
        }
        break;
      }
      // Echo CD: chance to reduce a random skill CD
      case 'echoCD': {
        if (Math.random() * 100 < (p.chance || 15)) {
          const skills = fighter.skills?.filter(s => s.cd > 0);
          if (skills?.length > 0) {
            const skill = skills[Math.floor(Math.random() * skills.length)];
            skill.cd = Math.max(0, skill.cd - (p.cdReduce || 1));
            log?.push({ msg: `${fighter.name} : Écho Temporel ! CD -${p.cdReduce || 1}`, type: 'player' });
          }
        }
        break;
      }
      // Power Accumulation: +1 stack, check burst
      case 'powerAccumulation': {
        const max = p.maxStacks || 5;
        if (e.stacks < max) e.stacks++;
        if (e.stacks >= max && !e.bursting) {
          e.bursting = true;
          e.burstTurns = p.burstTurns || 2;
          log?.push({ msg: `${fighter.name} : Accumulation MAX ! +${p.maxBonus || 10}% tous dégâts !`, type: 'player' });
        }
        if (e.bursting) {
          e.burstTurns--;
          if (e.burstTurns <= 0) { e.bursting = false; e.stacks = 0; }
        }
        // Decay
        // (decay happens when NOT attacking — skipped here, applied in turn end if needed)
        break;
      }
      // Death Link: count hits, proc bonus damage
      case 'deathLink': {
        e.hits++;
        if (e.hits >= (p.hitInterval || 3)) {
          e.hits = 0;
          const proc = Math.floor(fighter.atk * (p.procDmg || 50) / 100);
          bonusDmg += proc;
          log?.push({ msg: `${fighter.name} : Lien Mortel ! +${proc} dégâts bonus`, type: 'player' });
        }
        break;
      }
      // Cursed Blade: on CRIT only
      case 'cursedBlade': {
        if (isCrit && e.stacks < (p.maxStacks || 5)) {
          e.stacks++;
          const hpCost = Math.floor(fighter.maxHp * (p.hpCost || 1) / 100);
          fighter.hp = Math.max(1, fighter.hp - hpCost);
          const statLabel = p.statType || 'ATK';
          log?.push({ msg: `${fighter.name} : Lame Maudite x${e.stacks} ! +${e.stacks * (p.perCrit || 2)}% ${statLabel} (-${hpCost} PV)`, type: 'player' });
        }
        break;
      }
      // Devoration: on KILL only
      case 'devoration': {
        if (killed && e.stacks < (p.maxStacks || 3)) {
          e.stacks++;
          const stat = p.statType || 'ATK';
          const bonus = (p.perKill || 3) / 100;
          fighter.atk = Math.floor(fighter.atk * (1 + bonus));
          // Lifesteal stacking
          fighter._forgeLifestealPct = (fighter._forgeLifestealPct || 0) + (p.stealPerKill || 1);
          log?.push({ msg: `${fighter.name} : Dévoration x${e.stacks} ! +${p.perKill}% ${stat}, +${p.stealPerKill}% vol de vie`, type: 'player' });
        }
        // Apply devoration lifesteal
        if (dmg > 0 && (fighter._forgeLifestealPct || 0) > 0) {
          const heal = Math.floor(dmg * fighter._forgeLifestealPct / 100);
          fighter.hp = Math.min(fighter.maxHp, fighter.hp + heal);
        }
        break;
      }
      // Void Sacrifice: heal on kill
      case 'voidSacrifice': {
        if (killed) {
          const heal = Math.floor(fighter.maxHp * (p.healOnKill || 2) / 100);
          fighter.hp = Math.min(fighter.maxHp, fighter.hp + heal);
          log?.push({ msg: `${fighter.name} : Sacrifice du Vide ! +${heal} PV`, type: 'player' });
        }
        break;
      }
      // Berserker Rage: decay double duration
      case 'berserkerRage': {
        if (e.doubled && e.doubleTurns > 0) e.doubleTurns--;
        if (e.doubleTurns <= 0) e.doubled = false;
        break;
      }
    }
  }

  // Apply chain/bonus damage to enemy
  if (bonusDmg > 0 && enemy.alive) {
    enemy.hp = Math.max(0, enemy.hp - bonusDmg);
    if (enemy.hp <= 0) enemy.alive = false;
  }

  return { bonusDmg };
}

// ═══════════════════════════════════════════════════════════════
// ON DAMAGE TAKEN — Defensive procs
// Returns { reducedDmg, dodged, counterDmg }
// ═══════════════════════════════════════════════════════════════

export function forgeOnDamageTaken(fighter, forgeState, incomingDmg, attacker, isCrit, log) {
  if (!forgeState) return { reducedDmg: incomingDmg, dodged: false, counterDmg: 0 };
  let dmg = incomingDmg;
  let dodged = false;
  let counterDmg = 0;

  // Guardian Shield: flat % damage reduction
  const dmgReduce = fighter._forgeDmgReduce || 0;
  if (dmgReduce > 0) dmg = Math.floor(dmg * (1 - dmgReduce / 100));

  for (const e of forgeState) {
    const p = e.params;
    switch (e.id) {
      // Celestial Shield: absorb damage with shield
      case 'celestialShield': {
        if (e.shieldHp > 0) {
          const absorbed = Math.min(e.shieldHp, dmg);
          e.shieldHp -= absorbed;
          dmg -= absorbed;
          fighter.shield = Math.max(0, (fighter.shield || 0) - absorbed);
          if (e.shieldHp <= 0 && !e.broken) {
            e.broken = true;
            // Heal + DEF boost on break
            const heal = Math.floor(fighter.maxHp * (p.healPct || 10) / 100);
            fighter.hp = Math.min(fighter.maxHp, fighter.hp + heal);
            const defBoost = (p.defBoost || 10) / 100;
            fighter.def = Math.floor(fighter.def * (1 + defBoost));
            log?.push({ msg: `${fighter.name} : Bouclier brisé ! +${heal} PV, +${p.defBoost}% DEF`, type: 'player' });
          }
        }
        break;
      }
      // Dodge Counter: chance to dodge + counter
      case 'dodgeCounter': {
        if (!dodged && Math.random() * 100 < (p.dodgePct || 6)) {
          dodged = true;
          dmg = 0;
          counterDmg = Math.floor(fighter.atk * (p.counterPct || 60) / 100);
          log?.push({ msg: `${fighter.name} : Esquive ! Contre-attaque ${counterDmg} dégâts !`, type: 'player' });
        }
        break;
      }
      // Iron Guard: reduce crit damage + debuff attacker
      case 'ironGuard': {
        if (isCrit) {
          dmg = Math.floor(dmg * (1 - (p.critReduce || 15) / 100));
          if (attacker?.buffs) {
            attacker.buffs.push({ type: 'atk', val: -(p.atkDebuff || 3) / 100, turns: 3 });
          }
          log?.push({ msg: `${fighter.name} : Cuirasse de Fer ! Crit réduit, attaquant -${p.atkDebuff}% ATK`, type: 'player' });
        }
        break;
      }
      // Guardian Shield: ally death check (handled externally per turn)
      case 'guardianShield':
        break;
    }
  }

  return { reducedDmg: dmg, dodged, counterDmg };
}

// ═══════════════════════════════════════════════════════════════
// HELPER — Check if fighter has def pen from forge
// ═══════════════════════════════════════════════════════════════

export function getForgeDefPen(fighter) {
  return fighter._forgeDefPen || 0;
}

export function getForgeCritDmgBonus(fighter) {
  return fighter._forgeCritDmg || 0;
}

// ═══════════════════════════════════════════════════════════════
// HELPER — Apply Death Link permanent stats at fighter build time
// ═══════════════════════════════════════════════════════════════

export function forgeApplyPermanentOnBuild(fighter, forgePassives) {
  if (!forgePassives?.length) return;
  for (const p of forgePassives) {
    if (p.id === 'deathLink') {
      const hpMalus = (p.params?.hpMalus || 10) / 100;
      const spdBonus = p.params?.spdBonus || 5;
      fighter.hp = Math.floor(fighter.hp * (1 - hpMalus));
      fighter.maxHp = fighter.hp;
      fighter.spd += spdBonus;
    }
  }
}
