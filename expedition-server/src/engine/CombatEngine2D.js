import { COMBAT } from '../config.js';
import { AIController } from './AIController.js';
import { PassiveEngine } from './PassiveEngine.js';
import { Mob } from '../entities/Mob.js';
import { MOB_TEMPLATES } from '../data/mobTemplates.js';

// ── CombatEngine2D ──
// Handles a single combat encounter (mob wave or boss fight).
// Called by ExpeditionEngine for each tick during combat phase.
// Integrates PassiveEngine for set/weapon passive processing.

export class CombatEngine2D {
  constructor() {
    this.events = [];  // Events generated this tick (for spectator broadcast)
    this.passives = new PassiveEngine();
  }

  // Called once at the start of each combat encounter
  initCombat(characters) {
    this.passives.initCombat(characters);
    this.passives.setCharacters(characters);
  }

  // ═══════════════════════════════════════════════════════
  // Main tick: process one combat step (called at 4 TPS)
  // ═══════════════════════════════════════════════════════
  tick(characters, mobs, boss, dt) {
    this.events = [];

    const aliveChars = characters.filter(c => c.alive);
    const aliveMobs = mobs.filter(m => m.alive);

    if (aliveChars.length === 0) {
      return { status: 'wipe', events: this.events };
    }
    if (aliveMobs.length === 0 && (!boss || !boss.alive)) {
      return { status: 'victory', events: this.events };
    }

    // 0. Update buffs/debuffs for all entities
    for (const char of aliveChars) {
      char.updateBuffs(dt);
      char.updateDebuffs(dt);
      char.updateCooldowns(dt);
      if (char._bossAtkDebuffCd > 0) char._bossAtkDebuffCd -= dt;
    }
    for (const mob of aliveMobs) {
      if (mob.updateDebuffs) mob.updateDebuffs(dt);
    }
    if (boss?.alive && boss.updateDebuffs) boss.updateDebuffs(dt);

    // 1. Character AI decisions (stunned chars skip their turn)
    for (const char of aliveChars) {
      if (char.isStunned()) continue;
      const action = AIController.decide(char, aliveChars, aliveMobs, boss, dt);
      if (action) {
        // Silenced chars can't use skills
        if (action.type === 'skill' && char.isSilenced()) continue;
        this.executeAction(char, action, characters, mobs, boss);
      }
    }

    // 2. Mob AI (stunned mobs skip)
    for (const mob of aliveMobs) {
      if (mob.isStunned && mob.isStunned()) continue;
      this.tickMob(mob, aliveChars, dt);
    }

    // 3. Boss AI (stunned boss skips)
    if (boss?.alive) {
      if (!(boss.isStunned && boss.isStunned())) {
        this.tickBoss(boss, aliveChars, mobs, dt);
      }
    }

    // 4. Move characters toward their targets
    for (const char of aliveChars) {
      this.moveCharacter(char, dt);
    }

    // 5. Passive periodic effects (DoTs, regen, mega-heals)
    const allEnemies = [...mobs.filter(m => m.alive)];
    if (boss?.alive) allEnemies.push(boss);
    this.passives.tick(dt, aliveChars, allEnemies, this.events);

    // 6. Process bleed DoTs on all entities
    this.processBleedDots(dt, [...characters, ...mobs, ...(boss ? [boss] : [])]);

    // Check end conditions again after all actions
    const stillAlive = characters.filter(c => c.alive);
    const mobsLeft = mobs.filter(m => m.alive);
    if (stillAlive.length === 0) {
      return { status: 'wipe', events: this.events };
    }
    if (mobsLeft.length === 0 && (!boss || !boss.alive)) {
      return { status: 'victory', events: this.events };
    }

    return { status: 'ongoing', events: this.events };
  }

  // ═══════════════════════════════════════════════════════
  // Execute a character's AI action
  // ═══════════════════════════════════════════════════════
  executeAction(char, action, allies, enemies, boss) {
    switch (action.type) {
      case 'move':
        char.targetX = action.targetX;
        break;

      case 'attack':
        this.performAttack(char, action.target, action.power);
        break;

      case 'skill':
        this.performSkill(char, action, allies);
        break;
    }
  }

  // ═══════════════════════════════════════════════════════
  // Damage Calculation (identical to Manaya raid)
  // ═══════════════════════════════════════════════════════
  calculateDamage(attackerAtk, power, defenderDef, armorPenPct = 0) {
    // Base damage
    const baseDmg = attackerAtk * (power / 100);

    // Apply armor penetration (reduces effective DEF)
    const effectiveDef = defenderDef * (1 - Math.min(armorPenPct, 100) / 100);

    // DEF reduction: CONSTANT / (CONSTANT + DEF)
    const defMult = COMBAT.DEF_CONSTANT / (COMBAT.DEF_CONSTANT + Math.max(0, effectiveDef));

    // Variance (0.95 - 1.05)
    const variance = COMBAT.VARIANCE_MIN + Math.random() * (COMBAT.VARIANCE_MAX - COMBAT.VARIANCE_MIN);

    return Math.floor(baseDmg * defMult * variance);
  }

  // Check if an attack crits
  checkCrit(critRate, targetRes, charId) {
    // Passives can force a crit
    if (this.passives.checkGuaranteedCrit(charId)) return true;
    const effectiveCrit = Math.max(0, Math.min(100, critRate - targetRes * 0.5));
    return Math.random() * 100 < effectiveCrit;
  }

  // ═══════════════════════════════════════════════════════
  // Character attacks enemy
  // ═══════════════════════════════════════════════════════
  performAttack(char, target, power) {
    if (!char.alive || !target.alive) return;

    // Get ATK multiplier from passives (Titan Fury stacks, etc.)
    const atkMult = this.passives.getAtkMultiplier(char.id);
    const atk = Math.floor(char.getOffensiveStat() * atkMult);

    // Calculate armor penetration from weapon effects + set bonuses
    let armorPen = this.getArmorPen(char) + (char._defPen || 0);

    // Execute on kill bonus: next hit ignores 30% DEF
    if (char._executeNextHit) {
      armorPen += char._executeNextHit.armorPen;
      if (char._executeNextHit.antiHealDuration) {
        target.addDebuff('anti_heal', 100, char._executeNextHit.antiHealDuration, char.id);
      }
      char._executeNextHit = null;
    }

    // Apply def_shred debuff on target
    const defShred = target.getDebuffValue ? target.getDebuffValue('def_shred') : 0;
    const effectiveDef = Math.max(0, (target.def || 0) * (1 - defShred / 100));

    let damage = this.calculateDamage(atk, power, effectiveDef, armorPen);

    // Void Vulnerable debuff (+25% dmg from all sources)
    if (this.passives.isVoidVulnerable(target.id)) {
      damage = Math.floor(damage * 1.25);
    }

    // Hemorrhage debuff (+25% dmg from all sources at 3 bleed stacks)
    if (target.debuffs) {
      const bleedDebuffs = target.debuffs.filter(d => d.type === 'bleed');
      const totalStacks = bleedDebuffs.reduce((sum, d) => sum + (d.stacks || 1), 0);
      // Check if any weapon effect has hemorrhage with matching stacks
      for (const eff of (char.weaponEffects || [])) {
        if (eff.type === 'hemorrhage' && totalStacks >= eff.stacks) {
          damage = Math.floor(damage * (1 + eff.dmgAmp / 100));
          break;
        }
      }
      // Bleed amp: if target has 2+ bleeds, bonus DMG
      for (const eff of (char.weaponEffects || [])) {
        if (eff.type === 'bleed_amp' && totalStacks >= eff.threshold) {
          damage = Math.floor(damage * (1 + eff.bonus / 100));
          break;
        }
      }
    }

    const isCrit = this.checkCrit(char.crit, target.res || 0, char.id);
    if (isCrit) {
      const critMult = COMBAT.CRIT_MULTIPLIER + (char._critDmgBonus || 0) / 100;
      damage = Math.floor(damage * critMult);
    }

    // Passive on-take-damage hook (damage reduction for target if it's a character)
    if (target.expeditionGear) {
      const { damageReduction } = this.passives.onTakeDamage(target, char, damage, isCrit, this.events);
      damage = Math.max(1, damage - damageReduction);
    }

    const actualDmg = target.takeDamage ? target.takeDamage(damage) : damage;
    char.stats.damageDealt += actualDmg;

    // Passive on-hit hook
    const { bonusDamage } = this.passives.onHit(char, target, actualDmg, isCrit, this.events);
    let totalBonus = bonusDamage;
    if (totalBonus > 0 && target.alive) {
      const bonusActual = target.takeDamage ? target.takeDamage(totalBonus) : totalBonus;
      char.stats.damageDealt += bonusActual;
    }

    // Weapon effects: on_hit (stun, bleed, anti-heal, silence, double strike)
    const weaponResult = this.processWeaponEffects(char, target, actualDmg, isCrit, 'on_hit');
    if (weaponResult.bonusDamage > 0 && target.alive) {
      const wpnBonus = target.takeDamage ? target.takeDamage(weaponResult.bonusDamage) : weaponResult.bonusDamage;
      char.stats.damageDealt += wpnBonus;
      totalBonus += wpnBonus;
    }

    // Weapon effects: on_crit
    if (isCrit) {
      this.processWeaponEffects(char, target, actualDmg, true, 'on_crit');
      this.passives.onCrit(char, target, actualDmg, this.events);
    }

    this.events.push({
      type: 'damage',
      source: char.id,
      target: target.id,
      amount: actualDmg + totalBonus,
      crit: isCrit,
    });

    if (!target.alive) {
      char.stats.kills++;
      this.passives.onKill(char, target, this.events);
      this.processWeaponEffects(char, target, actualDmg, isCrit, 'on_kill');
      this.events.push({ type: 'kill', killer: char.id, target: target.id, targetName: target.name });
    }
  }

  // ═══════════════════════════════════════════════════════
  // Character uses a skill
  // ═══════════════════════════════════════════════════════
  performSkill(char, action, allies) {
    const { skill, target, isHeal, selfBuff } = action;
    if (!char.alive) return;

    // Passive on-skill-cast hook (free cast, double damage)
    const castResult = this.passives.onSkillCast(char, skill, this.events);

    // Consume mana (unless free cast from passive)
    if (skill.manaCost && !castResult.freeCast) {
      if (skill.consumeAllMana) {
        char.mana = 0;
      } else if (!char.useMana(skill.manaCost)) {
        return; // Not enough mana
      }
    }

    // Set cooldown
    if (skill.index !== undefined) {
      char.skills[skill.index].cooldown = skill.cdMax;
    }

    // Heal skill
    if (isHeal && target && skill.healPercent) {
      let baseHeal = Math.floor(target.maxHp * skill.healPercent / 100);

      // Anti-heal debuff reduces healing received
      const antiHealPct = target.getDebuffValue ? target.getDebuffValue('anti_heal') : 0;
      if (antiHealPct > 0) {
        baseHeal = Math.floor(baseHeal * Math.max(0, 1 - antiHealPct / 100));
      }

      const { bonusHeal, shieldAmount } = this.passives.onHeal(char, target, baseHeal, this.events);
      const totalHeal = baseHeal + bonusHeal;
      const actualHeal = target.heal(totalHeal);
      char.stats.healingDone += actualHeal;

      // Process splash heals from passive events
      for (const evt of this.events) {
        if (evt.type === 'passive_splash_heal' && evt.charId === char.id) {
          // Find 2 closest injured allies (excluding primary target)
          const injured = (allies || [])
            .filter(a => a.alive && a.id !== target.id && a.hp < a.maxHp)
            .sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))
            .slice(0, evt.count || 2);
          for (const ally of injured) {
            const splash = ally.heal(evt.amount);
            char.stats.healingDone += splash;
          }
        }
      }

      this.events.push({
        type: 'heal',
        source: char.id,
        target: target.id,
        amount: actualHeal,
        skillName: skill.name,
        shield: shieldAmount > 0 ? shieldAmount : undefined,
      });
      return;
    }

    // Buff skills (buffAtk, buffDef)
    if (skill.buffAtk !== undefined && target) {
      const buffValue = Math.floor(target.atk * skill.buffAtk / 100);
      target.addBuff('atk', buffValue, skill.buffDur, char.id);
      this.events.push({
        type: 'buff',
        source: char.id,
        target: target.id,
        buffType: 'atk',
        value: skill.buffAtk,
        duration: skill.buffDur,
        skillName: skill.name,
      });
    }
    if (skill.buffDef !== undefined && target) {
      const buffValue = Math.floor((target.def || 0) * skill.buffDef / 100);
      target.addBuff('def', buffValue, skill.buffDur, char.id);
      this.events.push({
        type: 'buff',
        source: char.id,
        target: target.id,
        buffType: 'def',
        value: skill.buffDef,
        duration: skill.buffDur,
        skillName: skill.name,
      });
    }

    // Debuff on target enemy
    if (skill.debuffDef !== undefined && target && target.def !== undefined) {
      // Reduce target DEF
      const debuffValue = Math.floor(target.def * skill.debuffDef / 100);
      target.def = Math.max(0, target.def - debuffValue);
      this.events.push({
        type: 'debuff',
        source: char.id,
        target: target.id,
        debuffType: 'def',
        value: skill.debuffDef,
        skillName: skill.name,
      });
    }

    // Self damage (Kaneki, Guts)
    if (skill.selfDamage) {
      const selfDmg = Math.floor(char.maxHp * skill.selfDamage / 100);
      char.hp = Math.max(1, char.hp - selfDmg);
      this.events.push({ type: 'self_damage', source: char.id, amount: selfDmg });
    }

    // Offensive damage
    if (skill.power > 0 && target?.alive) {
      const atkMult = this.passives.getAtkMultiplier(char.id);
      const atk = Math.floor(char.getOffensiveStat() * atkMult);
      let skillPower = skill.power;

      // Nova Arcanique 4th spell = double damage
      if (castResult.doubleDamage) skillPower *= 2;

      const skillArmorPen = (char._defPen || 0) + (castResult.defIgnore ? castResult.defIgnore * 100 : 0);
      let damage = this.calculateDamage(atk, skillPower, target.def || 0, skillArmorPen);

      // Void Vulnerable
      if (this.passives.isVoidVulnerable(target.id)) {
        damage = Math.floor(damage * 1.25);
      }

      const isCrit = this.checkCrit(char.crit, target.res || 0, char.id);
      if (isCrit) {
        const critMult = COMBAT.CRIT_MULTIPLIER + (char._critDmgBonus || 0) / 100;
        damage = Math.floor(damage * critMult);
      }

      const actualDmg = target.takeDamage ? target.takeDamage(damage) : damage;
      char.stats.damageDealt += actualDmg;

      // Passive hooks
      const { bonusDamage } = this.passives.onHit(char, target, actualDmg, isCrit, this.events);
      if (bonusDamage > 0 && target.alive) {
        const bonusActual = target.takeDamage ? target.takeDamage(bonusDamage) : bonusDamage;
        char.stats.damageDealt += bonusActual;
      }
      if (isCrit) this.passives.onCrit(char, target, actualDmg, this.events);

      this.events.push({
        type: 'skill_damage',
        source: char.id,
        target: target.id,
        amount: actualDmg + bonusDamage,
        crit: isCrit,
        skillName: skill.name,
      });

      if (!target.alive) {
        char.stats.kills++;
        this.passives.onKill(char, target, this.events);
        this.events.push({ type: 'kill', killer: char.id, target: target.id, targetName: target.name });
      }
    }
  }

  // ═══════════════════════════════════════════════════════
  // Mob AI (simple: move toward nearest char, attack)
  // ═══════════════════════════════════════════════════════
  tickMob(mob, characters, dt) {
    if (!mob.alive) return;

    // Find target (nearest character, or retarget periodically)
    const target = this.findMobTarget(mob, characters);
    if (!target) return;
    mob.targetId = target.id;

    const dist = Math.abs(mob.x - target.x);

    // Move toward target
    if (dist > mob.range) {
      mob.moveToward(target.x, dt);
      return;
    }

    // Attack
    mob.attackTimer -= dt;
    if (mob.attackTimer <= 0) {
      mob.attackTimer = mob.attackInterval;
      const damage = this.calculateDamage(mob.atk, 100, 0);  // Raw damage, target applies own DEF

      // Check passive damage reduction on target
      const { damageReduction } = this.passives.onTakeDamage(target, mob, damage, false, this.events);
      const finalDmg = Math.max(1, damage - damageReduction);
      const actualDmg = target.takeDamage(finalDmg);

      this.events.push({
        type: 'mob_attack',
        source: mob.id,
        target: target.id,
        amount: actualDmg,
      });

      if (!target.alive) {
        // Check death prevention passives
        const deathResult = this.passives.onDeath(target, mob, this.events);
        if (deathResult.preventDeath) {
          target.alive = true;
          target.hp = Math.floor(target.maxHp * deathResult.rezHpPercent / 100);
          if (deathResult.bonusDef > 0) {
            target.addBuff('def', Math.floor(target.def * deathResult.bonusDef / 100), deathResult.bonusDefDuration, 'passive_rez');
          }
        } else {
          this.events.push({ type: 'death', characterId: target.id, killedBy: mob.id });
        }
      }
    }
  }

  findMobTarget(mob, characters) {
    // Casters target backline, others target nearest
    if (mob.caster) {
      // Target lowest HP character
      let target = null;
      let lowestHp = Infinity;
      for (const c of characters) {
        if (c.alive && c.hp < lowestHp) {
          lowestHp = c.hp;
          target = c;
        }
      }
      return target;
    }

    // Melee mobs: target nearest character (which will be frontliners)
    let nearest = null;
    let nearestDist = Infinity;
    for (const c of characters) {
      if (!c.alive) continue;
      const dist = Math.abs(mob.x - c.x);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = c;
      }
    }
    return nearest;
  }

  // ═══════════════════════════════════════════════════════
  // Boss AI
  // ═══════════════════════════════════════════════════════
  tickBoss(boss, characters, mobs, dt) {
    if (!boss.alive) return;

    // Passive HP regen (configured per boss in bossDefinitions.regenPct)
    if (boss.regenPct > 0 && boss.hp < boss.maxHp) {
      boss.hp = Math.min(boss.maxHp, boss.hp + Math.floor(boss.maxHp * boss.regenPct / 100 * dt));
    }

    // Apply boss anti-heal aura from active phases
    if (boss.antiHealPct > 0) {
      for (const c of characters) {
        if (c.alive) {
          c.addDebuff('anti_heal', boss.antiHealPct, 2, `boss_aura_${boss.id}`);
        }
      }
    }

    // Boss pattern system
    const patternResult = boss.update(dt);

    if (patternResult) {
      switch (patternResult.type) {
        case 'pattern_start':
          this.events.push({
            type: 'boss_pattern',
            name: patternResult.pattern.name,
            telegraphTime: patternResult.telegraphTime,
            patternType: patternResult.pattern.type,
          });
          break;

        case 'pattern_execute':
          this.executeBossPattern(boss, patternResult.pattern, characters, mobs);
          break;
      }
    }

    // Boss auto-attack (targets nearest character)
    if (boss.updateAutoAttack(dt)) {
      const target = this.findBossTarget(boss, characters);
      if (target) {
        const dist = Math.abs(boss.x - target.x);
        if (dist < COMBAT.MELEE_RANGE * 2) {
          const damage = this.calculateDamage(boss.getEffectiveAtk(), boss.autoAttackPower, 0);

          // Passive damage reduction
          const { damageReduction } = this.passives.onTakeDamage(target, boss, damage, false, this.events);
          const finalDmg = Math.max(1, damage - damageReduction);
          const actualDmg = target.takeDamage(finalDmg);

          this.events.push({
            type: 'boss_attack',
            source: boss.id,
            target: target.id,
            amount: actualDmg,
          });
          if (!target.alive) {
            const deathResult = this.passives.onDeath(target, boss, this.events);
            if (deathResult.preventDeath) {
              target.alive = true;
              target.hp = Math.floor(target.maxHp * deathResult.rezHpPercent / 100);
              if (deathResult.bonusDef > 0) {
                target.addBuff('def', Math.floor(target.def * deathResult.bonusDef / 100), deathResult.bonusDefDuration, 'passive_rez');
              }
            } else {
              this.events.push({ type: 'death', characterId: target.id, killedBy: boss.id });
            }
          }
        }
      }
    }

    // Boss movement: slowly approach nearest frontliner
    const moveTarget = this.findBossTarget(boss, characters);
    if (moveTarget) {
      boss.moveToward(moveTarget.x + COMBAT.MELEE_RANGE, dt);
    }
  }

  findBossTarget(boss, characters) {
    // Prefer frontliners (highest X position)
    let target = null;
    let highestX = -Infinity;
    for (const c of characters) {
      if (c.alive && c.x > highestX) {
        highestX = c.x;
        target = c;
      }
    }
    return target;
  }

  // ═══════════════════════════════════════════════════════
  // Execute boss pattern effects
  // ═══════════════════════════════════════════════════════
  executeBossPattern(boss, pattern, characters, mobs) {
    const aliveChars = characters.filter(c => c.alive);

    switch (pattern.type) {
      case 'frontal': {
        // Hits characters in front of boss (within range)
        for (const c of aliveChars) {
          const dist = Math.abs(boss.x - c.x);
          if (dist <= pattern.range && c.x >= boss.x - pattern.range) {
            const damage = this.calculateDamage(boss.getEffectiveAtk(), pattern.damage, 0);
            const { damageReduction } = this.passives.onTakeDamage(c, boss, damage, false, this.events);
            const actualDmg = c.takeDamage(Math.max(1, damage - damageReduction));
            this.events.push({ type: 'pattern_damage', source: boss.id, target: c.id, amount: actualDmg, pattern: pattern.name });
            if (!c.alive) {
              const dr = this.passives.onDeath(c, boss, this.events);
              if (dr.preventDeath) { c.alive = true; c.hp = Math.floor(c.maxHp * dr.rezHpPercent / 100); }
              else this.events.push({ type: 'death', characterId: c.id, killedBy: boss.id });
            }
          }
        }
        break;
      }

      case 'aoe_melee': {
        for (const c of aliveChars) {
          if (Math.abs(boss.x - c.x) <= pattern.range) {
            const damage = this.calculateDamage(boss.getEffectiveAtk(), pattern.damage, 0);
            const { damageReduction } = this.passives.onTakeDamage(c, boss, damage, false, this.events);
            const actualDmg = c.takeDamage(Math.max(1, damage - damageReduction));
            this.events.push({ type: 'pattern_damage', source: boss.id, target: c.id, amount: actualDmg, pattern: pattern.name });
            if (!c.alive) {
              const dr = this.passives.onDeath(c, boss, this.events);
              if (dr.preventDeath) { c.alive = true; c.hp = Math.floor(c.maxHp * dr.rezHpPercent / 100); }
              else this.events.push({ type: 'death', characterId: c.id, killedBy: boss.id });
            }
          }
        }
        break;
      }

      case 'aoe_ranged': {
        const sorted = [...aliveChars].sort((a, b) => a.x - b.x);
        const backlineCount = Math.max(1, Math.floor(sorted.length * 0.3));
        const targets = sorted.slice(0, backlineCount);
        for (const c of targets) {
          const damage = this.calculateDamage(boss.getEffectiveAtk(), pattern.damage, 0);
          const { damageReduction } = this.passives.onTakeDamage(c, boss, damage, false, this.events);
          const actualDmg = c.takeDamage(Math.max(1, damage - damageReduction));
          this.events.push({ type: 'pattern_damage', source: boss.id, target: c.id, amount: actualDmg, pattern: pattern.name });
          if (!c.alive) {
            const dr = this.passives.onDeath(c, boss, this.events);
            if (dr.preventDeath) { c.alive = true; c.hp = Math.floor(c.maxHp * dr.rezHpPercent / 100); }
            else this.events.push({ type: 'death', characterId: c.id, killedBy: boss.id });
          }
        }
        break;
      }

      case 'aoe_all': {
        for (const c of aliveChars) {
          const damage = this.calculateDamage(boss.getEffectiveAtk(), pattern.damage, 0);
          const { damageReduction } = this.passives.onTakeDamage(c, boss, damage, false, this.events);
          const actualDmg = c.takeDamage(Math.max(1, damage - damageReduction));
          this.events.push({ type: 'pattern_damage', source: boss.id, target: c.id, amount: actualDmg, pattern: pattern.name });
          if (!c.alive) {
            const dr = this.passives.onDeath(c, boss, this.events);
            if (dr.preventDeath) { c.alive = true; c.hp = Math.floor(c.maxHp * dr.rezHpPercent / 100); }
            else this.events.push({ type: 'death', characterId: c.id, killedBy: boss.id });
          }
        }
        // Boss heals if specified
        if (pattern.healPercent) {
          const healAmount = Math.floor(boss.maxHp * pattern.healPercent / 100);
          boss.hp = Math.min(boss.maxHp, boss.hp + healAmount);
          this.events.push({ type: 'boss_heal', amount: healAmount });
        }
        break;
      }

      case 'self_heal': {
        const healAmount = Math.floor(boss.maxHp * pattern.healPercent / 100);
        boss.hp = Math.min(boss.maxHp, boss.hp + healAmount);
        this.events.push({ type: 'boss_heal', amount: healAmount, pattern: pattern.name });
        break;
      }

      case 'summon': {
        const template = MOB_TEMPLATES[pattern.summon.template];
        if (template) {
          const newMobs = [];
          for (let i = 0; i < pattern.summon.count; i++) {
            const mob = new Mob(template, pattern.summon.difficultyMult, pattern.summon.template);
            mob.x = boss.x + 50 + i * 40;
            newMobs.push(mob);
          }
          mobs.push(...newMobs);
          this.events.push({
            type: 'summon',
            bossId: boss.id,
            pattern: pattern.name,
            count: pattern.summon.count,
            mobType: pattern.summon.template,
          });
        }
        break;
      }

      // ── New pattern types (boss 11+ mechanics) ──

      case 'anti_heal': {
        // Apply anti-heal debuff to all alive characters + optional damage
        for (const c of aliveChars) {
          c.addDebuff('anti_heal', pattern.antiHealPct || 50, pattern.duration || 10, `boss_${boss.id}_antiheal`);
        }
        if (pattern.damage > 0) {
          for (const c of aliveChars) {
            const damage = this.calculateDamage(boss.getEffectiveAtk(), pattern.damage, 0);
            const { damageReduction } = this.passives.onTakeDamage(c, boss, damage, false, this.events);
            const actualDmg = c.takeDamage(Math.max(1, damage - damageReduction));
            this.events.push({ type: 'pattern_damage', source: boss.id, target: c.id, amount: actualDmg, pattern: pattern.name });
            if (!c.alive) {
              const dr = this.passives.onDeath(c, boss, this.events);
              if (dr.preventDeath) { c.alive = true; c.hp = Math.floor(c.maxHp * dr.rezHpPercent / 100); }
              else this.events.push({ type: 'death', characterId: c.id, killedBy: boss.id });
            }
          }
        }
        this.events.push({ type: 'boss_anti_heal', source: boss.id, pattern: pattern.name, antiHealPct: pattern.antiHealPct, duration: pattern.duration });
        break;
      }

      case 'multi_hit': {
        // Hit N times on random alive characters
        const hits = pattern.hitCount || 3;
        for (let i = 0; i < hits; i++) {
          const alive = aliveChars.filter(c => c.alive);
          if (alive.length === 0) break;
          const target = alive[Math.floor(Math.random() * alive.length)];
          const damage = this.calculateDamage(boss.getEffectiveAtk(), pattern.damage, 0);
          const { damageReduction } = this.passives.onTakeDamage(target, boss, damage, false, this.events);
          const actualDmg = target.takeDamage(Math.max(1, damage - damageReduction));
          this.events.push({ type: 'pattern_damage', source: boss.id, target: target.id, amount: actualDmg, pattern: pattern.name, hit: i + 1 });
          if (!target.alive) {
            const dr = this.passives.onDeath(target, boss, this.events);
            if (dr.preventDeath) { target.alive = true; target.hp = Math.floor(target.maxHp * dr.rezHpPercent / 100); }
            else this.events.push({ type: 'death', characterId: target.id, killedBy: boss.id });
          }
        }
        break;
      }

      case 'execute': {
        // Massive damage on the character with lowest HP%
        const sorted = [...aliveChars].sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
        const target = sorted[0];
        if (target) {
          const damage = this.calculateDamage(boss.getEffectiveAtk(), pattern.damage, 0);
          const { damageReduction } = this.passives.onTakeDamage(target, boss, damage, false, this.events);
          const actualDmg = target.takeDamage(Math.max(1, damage - damageReduction));
          this.events.push({ type: 'pattern_damage', source: boss.id, target: target.id, amount: actualDmg, pattern: pattern.name, execute: true });
          if (!target.alive) {
            const dr = this.passives.onDeath(target, boss, this.events);
            if (dr.preventDeath) { target.alive = true; target.hp = Math.floor(target.maxHp * dr.rezHpPercent / 100); }
            else this.events.push({ type: 'death', characterId: target.id, killedBy: boss.id });
          }
        }
        break;
      }
    }
  }

  // ═══════════════════════════════════════════════════════
  // Weapon Effects Processing (regular weapons from expeditionItems)
  // ═══════════════════════════════════════════════════════
  processWeaponEffects(attacker, target, damage, isCrit, trigger) {
    const effects = attacker.weaponEffects;
    if (!effects || effects.length === 0) return { bonusDamage: 0 };
    let bonusDamage = 0;

    for (const eff of effects) {
      // Match trigger (effects without trigger are passive/always-on)
      if (eff.trigger && eff.trigger !== trigger) continue;

      switch (eff.type) {
        case 'stun':
          if (Math.random() * 100 < eff.chance && target.addDebuff) {
            target.addDebuff('stun', 0, eff.duration, attacker.id);
            this.events.push({ type: 'debuff_applied', source: attacker.id, target: target.id, debuffType: 'stun', duration: eff.duration });
          }
          break;

        case 'bleed':
          if (target.addDebuff) {
            target.addDebuff('bleed', eff.value, eff.duration, attacker.id, eff.maxStacks || 1);
            this.events.push({ type: 'debuff_applied', source: attacker.id, target: target.id, debuffType: 'bleed', value: eff.value });
          }
          break;

        case 'anti_heal':
          if (target.addDebuff) {
            const dur = (isCrit && eff.critDuration) ? eff.critDuration : eff.duration;
            target.addDebuff('anti_heal', eff.value, dur, attacker.id);
          }
          break;

        case 'silence':
          if (Math.random() * 100 < eff.chance && target.addDebuff) {
            target.addDebuff('silence', 0, eff.duration, attacker.id);
            this.events.push({ type: 'debuff_applied', source: attacker.id, target: target.id, debuffType: 'silence', duration: eff.duration });
          }
          break;

        case 'def_shred':
          if (target.addDebuff) {
            if (!eff.condition || (eff.condition === 'stunned' && target.isStunned && target.isStunned())) {
              target.addDebuff('def_shred', eff.value, eff.duration, attacker.id);
            }
          }
          break;

        case 'double_strike':
          if (Math.random() * 100 < eff.chance) {
            bonusDamage += Math.floor(damage * 0.7);
            this.events.push({ type: 'passive_proc', charId: attacker.id, passive: 'double_strike', message: 'Double frappe!' });
          }
          break;

        case 'atk_on_kill': {
          // Only process on kill trigger
          if (trigger !== 'on_kill') break;
          const stacks = attacker._weaponAtkStacks || 0;
          if (stacks < (eff.max || 999)) {
            attacker._weaponAtkStacks = stacks + eff.value;
            const bonus = Math.floor(attacker.atk * eff.value / 100);
            attacker.addBuff('atk', bonus, 999, 'weapon_atk_kill');
            this.events.push({ type: 'passive_proc', charId: attacker.id, passive: 'atk_on_kill', message: `ATK +${eff.value}%` });
          }
          break;
        }

        case 'execute_on_kill':
          if (trigger !== 'on_kill') break;
          attacker._executeNextHit = { armorPen: eff.armorPen, antiHealDuration: eff.antiHealDuration };
          this.events.push({ type: 'passive_proc', charId: attacker.id, passive: 'execute_ready', message: 'Prochain coup perce les armures!' });
          break;

        case 'cd_reset':
          if (trigger !== 'on_kill') break;
          let longestIdx = -1, longestCd = 0;
          for (let i = 0; i < attacker.skills.length; i++) {
            if (attacker.skills[i].cooldown > longestCd) {
              longestCd = attacker.skills[i].cooldown;
              longestIdx = i;
            }
          }
          if (longestIdx >= 0) attacker.skills[longestIdx].cooldown = 0;
          break;

        case 'boss_atk_debuff': {
          if (trigger !== 'on_hit') break;
          // Cooldown check per attacker
          const cdKey = '_bossAtkDebuffCd';
          if (!attacker[cdKey] || attacker[cdKey] <= 0) {
            if (target.addDebuff) {
              target.addDebuff('atk_shred', eff.value, eff.duration, attacker.id);
              attacker[cdKey] = eff.cooldown || 20;
              this.events.push({ type: 'debuff_applied', source: attacker.id, target: target.id, debuffType: 'atk_shred', value: eff.value, duration: eff.duration });
            }
          }
          break;
        }

        case 'hit_count_aoe': {
          if (trigger !== 'on_hit') break;
          attacker._hitCountAoe = (attacker._hitCountAoe || 0) + 1;
          if (attacker._hitCountAoe >= eff.hitCount) {
            attacker._hitCountAoe = 0;
            const aoeDmg = Math.floor(attacker.getOffensiveStat() * eff.power / 100);
            this.events.push({ type: 'passive_aoe', charId: attacker.id, passive: 'weapon_aoe', damage: aoeDmg, radius: eff.radius });
            // Apply atk_debuff and anti_heal to all enemies in radius (simplified: applied to target)
            for (const otherEff of effects) {
              if (otherEff.type === 'atk_debuff' && target.addDebuff) {
                target.addDebuff('atk_shred', otherEff.value, otherEff.duration, attacker.id);
              }
              if (otherEff.type === 'anti_heal' && target.addDebuff) {
                target.addDebuff('anti_heal', otherEff.value, otherEff.duration, attacker.id);
              }
            }
          }
          break;
        }
      }
    }

    return { bonusDamage };
  }

  // Get total armor penetration from weapon effects
  getArmorPen(char) {
    let pen = 0;
    for (const eff of (char.weaponEffects || [])) {
      if (eff.type === 'armor_pen') pen += eff.value;
    }
    return pen;
  }

  // Process bleed DoTs on all entities each tick
  processBleedDots(dt, entities) {
    for (const entity of entities) {
      if (!entity.alive || !entity.debuffs) continue;
      for (const d of entity.debuffs) {
        if (d.type === 'bleed') {
          const bleedDmg = Math.floor(entity.maxHp * d.value * (d.stacks || 1) / 100 * dt);
          if (bleedDmg > 0) {
            entity.hp = Math.max(0, entity.hp - bleedDmg);
            if (entity.hp <= 0 && entity.alive) {
              entity.alive = false;
              if (entity.stats) entity.stats.deaths = (entity.stats.deaths || 0) + 1;
              this.events.push({ type: 'bleed_kill', target: entity.id, targetName: entity.name });
            }
          }
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════════
  // Character movement (smooth slide toward targetX)
  // ═══════════════════════════════════════════════════════
  moveCharacter(char, dt) {
    if (!char.alive) return;
    const diff = char.targetX - char.x;
    if (Math.abs(diff) < 2) return;
    const speed = char.spd * 2;  // Movement speed
    const step = speed * dt;
    if (Math.abs(diff) <= step) {
      char.x = char.targetX;
    } else {
      char.x += Math.sign(diff) * step;
    }
    // Clamp to world bounds
    char.x = Math.max(20, Math.min(COMBAT.WORLD_WIDTH - 20, char.x));
  }
}
