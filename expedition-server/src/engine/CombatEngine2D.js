import { COMBAT } from '../config.js';
import { AIController } from './AIController.js';
import { Mob } from '../entities/Mob.js';
import { MOB_TEMPLATES } from '../data/mobTemplates.js';

// ── CombatEngine2D ──
// Handles a single combat encounter (mob wave or boss fight).
// Called by ExpeditionEngine for each tick during combat phase.

export class CombatEngine2D {
  constructor() {
    this.events = [];  // Events generated this tick (for spectator broadcast)
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

    // 1. Character AI decisions
    for (const char of aliveChars) {
      const action = AIController.decide(char, aliveChars, aliveMobs, boss, dt);
      if (action) this.executeAction(char, action, characters, mobs, boss);
    }

    // 2. Mob AI
    for (const mob of aliveMobs) {
      this.tickMob(mob, aliveChars, dt);
    }

    // 3. Boss AI
    if (boss?.alive) {
      this.tickBoss(boss, aliveChars, mobs, dt);
    }

    // 4. Move characters toward their targets
    for (const char of aliveChars) {
      this.moveCharacter(char, dt);
    }

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
        this.performSkill(char, action);
        break;
    }
  }

  // ═══════════════════════════════════════════════════════
  // Damage Calculation (identical to Manaya raid)
  // ═══════════════════════════════════════════════════════
  calculateDamage(attackerAtk, power, defenderDef) {
    // Base damage
    const baseDmg = attackerAtk * (power / 100);

    // DEF reduction: CONSTANT / (CONSTANT + DEF)
    const defMult = COMBAT.DEF_CONSTANT / (COMBAT.DEF_CONSTANT + Math.max(0, defenderDef));

    // Variance (0.95 - 1.05)
    const variance = COMBAT.VARIANCE_MIN + Math.random() * (COMBAT.VARIANCE_MAX - COMBAT.VARIANCE_MIN);

    return Math.floor(baseDmg * defMult * variance);
  }

  // Check if an attack crits
  checkCrit(critRate, targetRes) {
    const effectiveCrit = Math.max(0, Math.min(100, critRate - targetRes * 0.5));
    return Math.random() * 100 < effectiveCrit;
  }

  // ═══════════════════════════════════════════════════════
  // Character attacks enemy
  // ═══════════════════════════════════════════════════════
  performAttack(char, target, power) {
    if (!char.alive || !target.alive) return;

    const atk = char.getEffectiveAtk();
    let damage = this.calculateDamage(atk, power, target.def);
    const isCrit = this.checkCrit(char.crit, target.res || 0);
    if (isCrit) damage = Math.floor(damage * COMBAT.CRIT_MULTIPLIER);

    const actualDmg = target.takeDamage ? target.takeDamage(damage) : damage;
    char.stats.damageDealt += actualDmg;

    this.events.push({
      type: 'damage',
      source: char.id,
      target: target.id,
      amount: actualDmg,
      crit: isCrit,
    });

    if (!target.alive) {
      char.stats.kills++;
      this.events.push({ type: 'kill', killer: char.id, target: target.id, targetName: target.name });
    }
  }

  // ═══════════════════════════════════════════════════════
  // Character uses a skill
  // ═══════════════════════════════════════════════════════
  performSkill(char, action) {
    const { skill, target, isHeal, selfBuff } = action;
    if (!char.alive) return;

    // Consume mana
    if (skill.manaCost) {
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
      const healAmount = Math.floor(target.maxHp * skill.healPercent / 100);
      const actualHeal = target.heal(healAmount);
      char.stats.healingDone += actualHeal;
      this.events.push({
        type: 'heal',
        source: char.id,
        target: target.id,
        amount: actualHeal,
        skillName: skill.name,
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
      const atk = char.getEffectiveAtk();
      let damage = this.calculateDamage(atk, skill.power, target.def || 0);
      const isCrit = this.checkCrit(char.crit, target.res || 0);
      if (isCrit) damage = Math.floor(damage * COMBAT.CRIT_MULTIPLIER);

      const actualDmg = target.takeDamage ? target.takeDamage(damage) : damage;
      char.stats.damageDealt += actualDmg;

      this.events.push({
        type: 'skill_damage',
        source: char.id,
        target: target.id,
        amount: actualDmg,
        crit: isCrit,
        skillName: skill.name,
      });

      if (!target.alive) {
        char.stats.kills++;
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
      const actualDmg = target.takeDamage(damage);

      this.events.push({
        type: 'mob_attack',
        source: mob.id,
        target: target.id,
        amount: actualDmg,
      });

      if (!target.alive) {
        this.events.push({ type: 'death', characterId: target.id, killedBy: mob.id });
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
          const damage = this.calculateDamage(boss.atk, boss.autoAttackPower, 0);
          const actualDmg = target.takeDamage(damage);
          this.events.push({
            type: 'boss_attack',
            source: boss.id,
            target: target.id,
            amount: actualDmg,
          });
          if (!target.alive) {
            this.events.push({ type: 'death', characterId: target.id, killedBy: boss.id });
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
            const damage = this.calculateDamage(boss.atk, pattern.damage, 0);
            const actualDmg = c.takeDamage(damage);
            this.events.push({ type: 'pattern_damage', source: boss.id, target: c.id, amount: actualDmg, pattern: pattern.name });
            if (!c.alive) this.events.push({ type: 'death', characterId: c.id, killedBy: boss.id });
          }
        }
        break;
      }

      case 'aoe_melee': {
        // Hits all characters near boss
        for (const c of aliveChars) {
          if (Math.abs(boss.x - c.x) <= pattern.range) {
            const damage = this.calculateDamage(boss.atk, pattern.damage, 0);
            const actualDmg = c.takeDamage(damage);
            this.events.push({ type: 'pattern_damage', source: boss.id, target: c.id, amount: actualDmg, pattern: pattern.name });
            if (!c.alive) this.events.push({ type: 'death', characterId: c.id, killedBy: boss.id });
          }
        }
        break;
      }

      case 'aoe_ranged': {
        // Targets backline characters (lowest X positions)
        const sorted = [...aliveChars].sort((a, b) => a.x - b.x);
        const backlineCount = Math.max(1, Math.floor(sorted.length * 0.3));
        const targets = sorted.slice(0, backlineCount);
        for (const c of targets) {
          const damage = this.calculateDamage(boss.atk, pattern.damage, 0);
          const actualDmg = c.takeDamage(damage);
          this.events.push({ type: 'pattern_damage', source: boss.id, target: c.id, amount: actualDmg, pattern: pattern.name });
          if (!c.alive) this.events.push({ type: 'death', characterId: c.id, killedBy: boss.id });
        }
        break;
      }

      case 'aoe_all': {
        // Hits everyone
        for (const c of aliveChars) {
          const damage = this.calculateDamage(boss.atk, pattern.damage, 0);
          const actualDmg = c.takeDamage(damage);
          this.events.push({ type: 'pattern_damage', source: boss.id, target: c.id, amount: actualDmg, pattern: pattern.name });
          if (!c.alive) this.events.push({ type: 'death', characterId: c.id, killedBy: boss.id });
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
            const mob = new Mob(template, pattern.summon.difficultyMult);
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
