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

    // Passive mana regen (2 mana/sec for non-support, 8/sec for support)
    const baseManaRegen = character.hunterClass === 'support' ? 8 : 2;
    const bonusPct = character._manaRegenBonus || 0;  // from sets/weapons
    const manaRegen = baseManaRegen * (1 + bonusPct / 100);
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
    // Tanks always target boss (hold aggro), but if no boss, target closest add
    const target = AIController.pickSmartTarget(char, allies, enemies, boss, 'frontline');
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
  // FRONTLINE DPS: Go front, SMART targeting (adds > boss when adds exist)
  // ═══════════════════════════════════════════════════════
  static decideFrontlineDps(char, allies, enemies, boss) {
    const target = AIController.pickSmartTarget(char, allies, enemies, boss, 'frontline_dps');
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
  // BACKLINE DPS (mage): Stay at range, SMART targeting (adds priority for AoE value)
  // ═══════════════════════════════════════════════════════
  static decideBacklineDps(char, allies, enemies, boss) {
    const target = AIController.pickSmartTarget(char, allies, enemies, boss, 'backline_dps');
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

    // PRIORITY 1: Emergency heal (ally below 30% HP, proximity-weighted)
    const criticalAlly = AIController.findBestHealTarget(allies, char, 0.3, 0.3);
    if (criticalAlly) {
      const healSkill = AIController.findHealSkill(char);
      if (healSkill) return { type: 'skill', skill: healSkill, target: criticalAlly, isHeal: true };
    }

    // PRIORITY 2: Buff def on low HP ally (proximity-weighted)
    const injuredAlly = AIController.findBestHealTarget(allies, char, 0.6, 0.3);
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
  static assignFormation(characters, boss) {
    const alive = characters.filter(c => c.alive);
    if (!alive.length) return;

    // Group by role, then sort by username so same-player hunters are adjacent
    const groups = { frontline: [], frontline_dps: [], backline_dps: [], backline_heal: [] };
    for (const c of alive) {
      (groups[c.role] || groups.frontline_dps).push(c);
    }
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => (a.username || '').localeCompare(b.username || ''));
    }

    const jitter = COMBAT.LANE_Y_JITTER || 15;
    const laneY = COMBAT.LANE_Y || { frontline: 0, frontline_dps: -20, backline_dps: -50, backline_heal: -70 };

    // Arc formation centered around the boss
    const arcCenterX = boss?.alive
      ? boss.x - (COMBAT.ARC_CENTER_OFFSET || 250)
      : COMBAT.FRONTLINE_BASE_X;
    const halfAngle = ((COMBAT.ARC_SPREAD_ANGLE || 120) / 2) * (Math.PI / 180);

    function assignArcGroup(group, radius, baseY) {
      if (group.length === 0) return;
      const n = group.length;
      for (let i = 0; i < n; i++) {
        // Distribute evenly across arc from -halfAngle to +halfAngle
        const t = n === 1 ? 0.5 : i / (n - 1);
        const angle = -halfAngle + t * (2 * halfAngle);
        // angle=0 is straight toward boss (max X), flanks fan out left with lower X
        const arcX = arcCenterX + Math.cos(angle) * radius;
        const arcY = Math.sin(angle) * radius * 0.4 + baseY + (Math.random() * 2 - 1) * jitter;
        group[i].targetX = Math.floor(arcX);
        group[i].y = arcY;
      }
    }

    assignArcGroup(groups.frontline,     COMBAT.ARC_INNER_RADIUS || 100,      laneY.frontline);
    assignArcGroup(groups.frontline_dps, COMBAT.ARC_MIDDLE_RADIUS || 180,     laneY.frontline_dps);
    assignArcGroup(groups.backline_dps,  COMBAT.ARC_OUTER_DPS_RADIUS || 260,  laneY.backline_dps);
    assignArcGroup(groups.backline_heal, COMBAT.ARC_OUTER_HEAL_RADIUS || 340, laneY.backline_heal);

    // Set initial position if not yet positioned
    for (const c of alive) {
      if (c.x === 0) c.x = c.targetX;
    }
  }

  // ═══════════════════════════════════════════════════════
  // SMART TARGET SELECTION — adds priority when boss + adds coexist
  // ═══════════════════════════════════════════════════════
  //
  // Strategy:
  // - Tanks: ALWAYS target boss (hold aggro)
  // - Mages (backline_dps): ALWAYS target adds first (AoE efficiency)
  // - Frontline DPS: Split — some focus adds, rest focus boss
  //   Rule: enough DPS to kill adds, but don't let boss be untouched
  // - If no adds: everyone targets boss
  // - If boss is < 10% HP: everyone finishes boss (kill threshold)
  //
  static pickSmartTarget(char, allies, enemies, boss, role) {
    const aliveAdds = enemies.filter(e => e.alive);
    const bossAlive = boss?.alive;

    // No enemies at all
    if (aliveAdds.length === 0 && !bossAlive) return null;

    // No adds — just target boss (or nothing)
    if (aliveAdds.length === 0) return bossAlive ? boss : null;

    // No boss — just target adds
    if (!bossAlive) return AIController.findLowestHpEnemy(enemies);

    // Boss + adds coexist — SMART SPLIT

    // Boss near death (< 10% HP): everyone finishes boss
    if (boss.hp / boss.maxHp < 0.10) return boss;

    // Tanks: always on boss
    if (role === 'frontline') return boss;

    // Mages: always clear adds first (AoE efficiency)
    if (role === 'backline_dps') {
      return AIController.findClosestEnemy(char, aliveAdds, null) || boss;
    }

    // Frontline DPS: split based on add count
    // If many adds (>= 6): all frontline DPS help clear adds
    if (aliveAdds.length >= 6) {
      return AIController.findClosestEnemy(char, aliveAdds, null) || boss;
    }

    // Few adds (< 6): assign some DPS to adds based on char index parity
    // Characters with odd hash target adds, even target boss
    // This ensures a natural split without coordination
    const charHash = char.id.charCodeAt(0) + char.id.charCodeAt(char.id.length - 1);
    if (charHash % 3 === 0) {
      // This DPS focuses adds
      return AIController.findClosestEnemy(char, aliveAdds, null) || boss;
    }
    // Other DPS stays on boss
    return boss;
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

  // Proximity-weighted heal target: favors low HP AND nearby allies
  static findBestHealTarget(allies, healer, thresholdPercent, distWeight = 0.3) {
    let bestTarget = null;
    let bestScore = -Infinity;

    // Find max distance for normalization
    let maxDist = 1;
    for (const a of allies) {
      if (!a.alive) continue;
      const d = Math.sqrt((healer.x - a.x) ** 2 + (healer.y - a.y) ** 2);
      if (d > maxDist) maxDist = d;
    }

    for (const a of allies) {
      if (!a.alive) continue;
      const ratio = a.hp / a.maxHp;
      if (ratio >= thresholdPercent) continue;
      const dist = Math.sqrt((healer.x - a.x) ** 2 + (healer.y - a.y) ** 2);
      const distNorm = dist / maxDist; // 0=close, 1=far
      // Score: higher = should heal first (low HP + close distance)
      const score = (1 - ratio) * (1 - distWeight) + (1 - distNorm) * distWeight;
      if (score > bestScore) {
        bestScore = score;
        bestTarget = a;
      }
    }
    return bestTarget;
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
        const manaCost = Math.floor(char.maxMana * 0.12);  // 12% max mana (was 20%)
        if (char.mana >= manaCost) {
          return { ...s, index: i, manaCost, healPercent: s.healSelf };
        }
      }
    }
    return null;
  }
}
