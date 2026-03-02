import { COMBAT } from '../config.js';

// ── AI Controller ──
// Controls all expedition characters automatically based on their role.
// Each tick, every alive character gets a decision: attack, use skill, heal, or move.

export class AIController {

  // ── Main decision: what should this character do? ──
  static decide(character, allies, enemies, boss, dt) {
    if (!character.alive) return null;

    // Update timers
    character.updateCooldowns(dt);
    character.updateBuffs(dt);
    character.attackTimer -= dt;

    // Passive mana regen (1 mana/sec for non-support, 3/sec for support)
    const manaRegen = character.hunterClass === 'support' ? 3 : 1;
    character.regenMana(manaRegen * dt);

    switch (character.role) {
      case 'frontline':       return AIController.decideFrontline(character, allies, enemies, boss);
      case 'frontline_dps':   return AIController.decideFrontlineDps(character, allies, enemies, boss);
      case 'backline_dps':    return AIController.decideBacklineDps(character, allies, enemies, boss);
      case 'backline_heal':   return AIController.decideBacklineHeal(character, allies, enemies, boss);
      default:                return AIController.decideFrontlineDps(character, allies, enemies, boss);
    }
  }

  // ═══════════════════════════════════════════════════════
  // FRONTLINE (tank-type): Go front, soak damage, use defensive skills
  // ═══════════════════════════════════════════════════════
  static decideFrontline(char, allies, enemies, boss) {
    const target = AIController.findClosestEnemy(char, enemies, boss);
    if (!target) return null;

    // Move toward enemy if not in melee range
    if (Math.abs(char.x - target.x) > COMBAT.MELEE_RANGE) {
      return { type: 'move', targetX: target.x - COMBAT.MELEE_RANGE * 0.8 };
    }

    // Use defensive buff skill if available and HP < 60%
    if (char.hp / char.maxHp < 0.6) {
      const defSkill = AIController.findSkillWithBuff(char, 'buffDef');
      if (defSkill) return { type: 'skill', skill: defSkill, target: char };
    }

    // Use offensive skill if available
    const offSkill = AIController.findBestOffensiveSkill(char);
    if (offSkill) return { type: 'skill', skill: offSkill, target };

    // Auto-attack
    if (char.attackTimer <= 0) {
      char.attackTimer = char.attackInterval;
      return { type: 'attack', target, power: char.skills[0]?.power || 100 };
    }

    return null;
  }

  // ═══════════════════════════════════════════════════════
  // FRONTLINE DPS: Go front, focus lowest HP enemy
  // ═══════════════════════════════════════════════════════
  static decideFrontlineDps(char, allies, enemies, boss) {
    // Target priority: boss if alive, else lowest HP enemy
    const target = boss?.alive ? boss : AIController.findLowestHpEnemy(enemies);
    if (!target) return null;

    // Move toward target
    if (Math.abs(char.x - target.x) > COMBAT.MELEE_RANGE) {
      return { type: 'move', targetX: target.x - COMBAT.MELEE_RANGE * 0.8 };
    }

    // Retreat slightly if HP very low and healers exist
    if (char.hp / char.maxHp < 0.2) {
      const hasHealer = allies.some(a => a.role === 'backline_heal' && a.alive);
      if (hasHealer) {
        return { type: 'move', targetX: char.x - 100 };
      }
    }

    // Use buff skill on self (like buffAtk)
    const buffSkill = AIController.findSkillWithBuff(char, 'buffAtk');
    if (buffSkill && char.buffs.every(b => b.type !== 'atk')) {
      return { type: 'skill', skill: buffSkill, target: char, selfBuff: true };
    }

    // Use strongest offensive skill
    const skill = AIController.findBestOffensiveSkill(char);
    if (skill) return { type: 'skill', skill, target };

    // Auto-attack
    if (char.attackTimer <= 0) {
      char.attackTimer = char.attackInterval;
      return { type: 'attack', target, power: char.skills[0]?.power || 100 };
    }

    return null;
  }

  // ═══════════════════════════════════════════════════════
  // BACKLINE DPS (mage): Stay at range, focus boss or AoE
  // ═══════════════════════════════════════════════════════
  static decideBacklineDps(char, allies, enemies, boss) {
    const target = boss?.alive ? boss : AIController.findLowestHpEnemy(enemies);
    if (!target) return null;

    const dist = Math.abs(char.x - target.x);

    // Maintain distance — stay at ranged range
    if (dist < COMBAT.MELEE_RANGE * 2) {
      // Too close, back off
      return { type: 'move', targetX: char.x - 120 };
    }
    if (dist > COMBAT.RANGED_RANGE) {
      // Too far, move closer
      return { type: 'move', targetX: target.x - COMBAT.RANGED_RANGE * 0.8 };
    }

    // Use debuff skill if target has no debuff
    const debuffSkill = AIController.findSkillWithDebuff(char);
    if (debuffSkill) return { type: 'skill', skill: debuffSkill, target };

    // Use strongest offensive skill
    const skill = AIController.findBestOffensiveSkill(char);
    if (skill) return { type: 'skill', skill, target };

    // Auto-attack at range
    if (char.attackTimer <= 0) {
      char.attackTimer = char.attackInterval;
      return { type: 'attack', target, power: char.skills[0]?.power || 100 };
    }

    return null;
  }

  // ═══════════════════════════════════════════════════════
  // BACKLINE HEAL (support): Stay far back, heal lowest ally
  // ═══════════════════════════════════════════════════════
  static decideBacklineHeal(char, allies, enemies, boss) {
    const nearestEnemy = AIController.findClosestEnemy(char, enemies, boss);

    // Stay far back — behind all allies
    if (nearestEnemy) {
      const safeX = AIController.getBacklinePosition(allies);
      if (char.x > safeX + 50) {
        return { type: 'move', targetX: safeX };
      }
    }

    // PRIORITY 1: Emergency heal (ally below 30% HP)
    const criticalAlly = AIController.findMostInjuredAlly(allies, 0.3);
    if (criticalAlly) {
      const healSkill = AIController.findHealSkill(char);
      if (healSkill) return { type: 'skill', skill: healSkill, target: criticalAlly, isHeal: true };
    }

    // PRIORITY 2: Buff def on low HP ally
    const injuredAlly = AIController.findMostInjuredAlly(allies, 0.6);
    if (injuredAlly) {
      const defBuff = AIController.findSkillWithBuff(char, 'buffDef');
      if (defBuff) return { type: 'skill', skill: defBuff, target: injuredAlly };
    }

    // PRIORITY 3: Heal anyone below 60%
    if (injuredAlly) {
      const healSkill = AIController.findHealSkill(char);
      if (healSkill) return { type: 'skill', skill: healSkill, target: injuredAlly, isHeal: true };
    }

    // PRIORITY 4: Contribute damage (low priority)
    const target = boss?.alive ? boss : AIController.findLowestHpEnemy(enemies);
    if (target && char.attackTimer <= 0) {
      const dist = Math.abs(char.x - target.x);
      if (dist <= COMBAT.HEALER_RANGE) {
        char.attackTimer = char.attackInterval;
        return { type: 'attack', target, power: char.skills[0]?.power || 60 };
      }
    }

    return null;
  }

  // ═══════════════════════════════════════════════════════
  // Formation Management
  // ═══════════════════════════════════════════════════════
  static assignFormation(characters) {
    const alive = characters.filter(c => c.alive);
    if (!alive.length) return;

    // Sort by role priority: frontline first, backline last
    const rolePriority = { frontline: 0, frontline_dps: 1, backline_dps: 2, backline_heal: 3 };
    alive.sort((a, b) => (rolePriority[a.role] || 1) - (rolePriority[b.role] || 1));

    // Assign initial X positions
    let x = COMBAT.FRONTLINE_BASE_X;
    for (const char of alive) {
      if (char.role === 'backline_dps' || char.role === 'backline_heal') {
        char.targetX = COMBAT.FRONTLINE_BASE_X + COMBAT.BACKLINE_OFFSET + (Math.random() * 60 - 30);
      } else {
        char.targetX = x;
        x += COMBAT.FORMATION_SPACING;
      }
      // Set initial position if not yet positioned
      if (char.x === 0) char.x = char.targetX;
    }
  }

  // ═══════════════════════════════════════════════════════
  // Helper: Target Selection
  // ═══════════════════════════════════════════════════════

  static findClosestEnemy(char, enemies, boss) {
    let closest = null;
    let closestDist = Infinity;
    const allEnemies = [...enemies.filter(e => e.alive)];
    if (boss?.alive) allEnemies.push(boss);
    for (const e of allEnemies) {
      const dist = Math.abs(char.x - e.x);
      if (dist < closestDist) {
        closestDist = dist;
        closest = e;
      }
    }
    return closest;
  }

  static findLowestHpEnemy(enemies) {
    let target = null;
    let lowestHp = Infinity;
    for (const e of enemies) {
      if (e.alive && e.hp < lowestHp) {
        lowestHp = e.hp;
        target = e;
      }
    }
    return target;
  }

  static findMostInjuredAlly(allies, thresholdPercent) {
    let target = null;
    let lowestRatio = 1.0;
    for (const a of allies) {
      if (!a.alive) continue;
      const ratio = a.hp / a.maxHp;
      if (ratio < thresholdPercent && ratio < lowestRatio) {
        lowestRatio = ratio;
        target = a;
      }
    }
    return target;
  }

  static getBacklinePosition(allies) {
    let minX = Infinity;
    for (const a of allies) {
      if (a.alive && a.x < minX) minX = a.x;
    }
    return Math.max(50, minX - 80);
  }

  // ═══════════════════════════════════════════════════════
  // Helper: Skill Selection
  // ═══════════════════════════════════════════════════════

  static findBestOffensiveSkill(char) {
    // Skip skill[0] (basic attack), check skills [1] and [2] for offensive use
    for (let i = char.skills.length - 1; i >= 1; i--) {
      const s = char.skills[i];
      if (s.cooldown <= 0 && s.power > 0) {
        // Check mana cost (rough: 20% of max mana per skill use)
        const manaCost = Math.floor(char.maxMana * 0.2);
        if (char.mana >= manaCost || s.consumeAllMana) {
          return { ...s, index: i, manaCost: s.consumeAllMana ? char.mana : manaCost };
        }
      }
    }
    return null;
  }

  static findSkillWithBuff(char, buffType) {
    for (let i = 1; i < char.skills.length; i++) {
      const s = char.skills[i];
      if (s.cooldown <= 0 && s[buffType] !== undefined) {
        const manaCost = Math.floor(char.maxMana * 0.15);
        if (char.mana >= manaCost) {
          return { ...s, index: i, manaCost };
        }
      }
    }
    return null;
  }

  static findSkillWithDebuff(char) {
    for (let i = 1; i < char.skills.length; i++) {
      const s = char.skills[i];
      if (s.cooldown <= 0 && (s.debuffDef !== undefined || s.debuffAtk !== undefined)) {
        const manaCost = Math.floor(char.maxMana * 0.15);
        if (char.mana >= manaCost) {
          return { ...s, index: i, manaCost };
        }
      }
    }
    return null;
  }

  static findHealSkill(char) {
    for (let i = 1; i < char.skills.length; i++) {
      const s = char.skills[i];
      if (s.cooldown <= 0 && s.healSelf !== undefined) {
        const manaCost = Math.floor(char.maxMana * 0.2);
        if (char.mana >= manaCost) {
          return { ...s, index: i, manaCost, healPercent: s.healSelf };
        }
      }
    }
    return null;
  }
}
