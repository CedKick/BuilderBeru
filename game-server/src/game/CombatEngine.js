import { COMBAT, AGGRO, PLAYER, HUNTER as HUNTER_CFG } from '../config.js';
import { hunterStatsAtLevel, getHunterSummonSkill } from '../data/hunterData.js';

let nextProjectileId = 1;

export class CombatEngine {
  constructor(gameState) {
    this.gs = gameState;
  }

  // ── Player Actions ──

  basicAttack(player, angle) {
    if (player.cooldowns.basic > 0) return;
    if (player.dodging || player.casting) return;

    const skill = player.skills.basic;
    player.cooldowns.basic = skill.cooldown;
    if (skill.manaCost > 0 && !player.useMana(skill.manaCost)) return;

    player.aimAngle = angle;

    if (skill.hitbox === 'projectile') {
      this._fireProjectile(player, skill, angle);
    } else if (skill.hitbox === 'cone') {
      this._coneAttack(player, skill, angle);
    }
  }

  secondaryAction(player, angle) {
    if (player.cooldowns.secondary > 0) return;
    if (player.dodging || player.casting) return;

    const skill = player.skills.secondary;

    switch (skill.type) {
      case 'block':
        player.blocking = true;
        // Blocking is continuous - will be released by 'stop_secondary' input
        break;

      case 'heal_target':
        if (!player.useMana(skill.manaCost)) return;
        player.cooldowns.secondary = skill.cooldown;
        this._healNearestAlly(player, skill);
        break;

      case 'heal_zone':
        if (!player.useMana(skill.manaCost)) return;
        player.cooldowns.secondary = skill.cooldown;
        this._placeHealZone(player, skill, angle);
        break;

      default:
        // Attack-type secondary (charged shot, heavy strike, etc.)
        if (skill.manaCost > 0 && !player.useMana(skill.manaCost)) return;
        player.cooldowns.secondary = skill.cooldown;
        if (skill.hitbox === 'projectile') {
          this._fireProjectile(player, skill, angle);
        } else if (skill.hitbox === 'cone') {
          this._coneAttack(player, skill, angle);
        }
    }
  }

  stopSecondary(player) {
    player.blocking = false;
  }

  useSkill(player, skillSlot, angle) {
    if (player.dodging) return;

    const skillKey = skillSlot; // 'skillA', 'skillB', 'ultimate'
    if (player.cooldowns[skillKey] > 0) return;

    const skill = player.skills[skillKey];
    if (!skill) return;
    if (skill.manaCost > 0 && !player.useMana(skill.manaCost)) return;

    player.cooldowns[skillKey] = skill.cooldown;
    player.aimAngle = angle;

    switch (skill.type) {
      case 'taunt':
        this._taunt(player, skill);
        break;
      case 'party_shield':
        this._partyShield(player, skill);
        break;
      case 'invuln':
        this._invulnerable(player, skill);
        break;
      case 'heal_aoe':
        this._healAoe(player, skill);
        break;
      case 'cleanse':
        this._cleanse(player, skill);
        break;
      case 'resurrect':
        this._resurrect(player, skill);
        break;
      case 'aoe_self':
        this._aoeSelf(player, skill);
        break;
      case 'dash_attack':
        this._dashAttack(player, skill, angle);
        break;
      case 'single_target':
        this._singleTarget(player, skill, angle);
        break;
      case 'aoe_targeted':
        this._aoeTargeted(player, skill, angle);
        break;
      case 'trap':
        this._placeTrap(player, skill, angle);
        break;
      case 'channel':
        this._startChannel(player, skill, angle);
        break;
      default:
        // Generic attack skill
        if (skill.hitbox === 'projectile') {
          this._fireProjectile(player, skill, angle);
        } else if (skill.hitbox === 'cone') {
          this._coneAttack(player, skill, angle);
        }
    }
  }

  dodge(player, angle) {
    if (player.dodging || player.dodgeCooldown > 0) return;
    if (player.blocking) player.blocking = false;

    player.dodging = true;
    player.dodgeTimer = 0;
    player.dodgeCooldown = PLAYER.DODGE_COOLDOWN;
    player.dodgeDir = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
  }

  summonHunter(player, slot) {
    if (slot < 0 || slot > 2) return;
    if (player.hunterCooldowns[slot] > 0) return;

    const hunterId = player.supportHunters[slot];
    if (!hunterId) return;

    const hunterSkill = getHunterSummonSkill(hunterId);
    if (!hunterSkill) return;

    const boss = this.gs.boss;
    if (!boss.alive) return;

    // Range check
    const dist = Math.hypot(boss.x - player.x, boss.y - player.y);
    if (dist > HUNTER_CFG.SUMMON_RANGE) {
      this.gs.addEvent({ type: 'summon_failed', player: player.id, reason: 'too_far' });
      return;
    }

    // Get hunter stats at level/stars
    const hunterLevel = player.hunterLevels[hunterId] || 30;
    const hunterStars = player.hunterStars[hunterId] || 0;
    const hStats = hunterStatsAtLevel(hunterId, hunterLevel, hunterStars);

    // Calculate damage: hunter ATK × (skill power / 100)
    let damage = hStats.atk * (hunterSkill.power / 100);

    // DEF reduction from boss
    damage *= COMBAT.DEF_FORMULA_CONSTANT / (COMBAT.DEF_FORMULA_CONSTANT + boss.def);

    // Crit check based on hunter crit stat
    let crit = false;
    if (Math.random() * 100 < hStats.crit) {
      crit = true;
      damage *= COMBAT.CRIT_MULTIPLIER;
    }

    // Variance
    damage *= COMBAT.VARIANCE_MIN + Math.random() * (COMBAT.VARIANCE_MAX - COMBAT.VARIANCE_MIN);
    damage = Math.max(1, Math.round(damage));

    const actual = boss.takeDamage(damage);
    player.stats.damageDealt += actual;
    this.gs.addAggro(player.id, actual * AGGRO.DAMAGE_TO_AGGRO * player.aggroMult);

    // Set cooldown
    player.hunterCooldowns[slot] = HUNTER_CFG.SUMMON_COOLDOWN_BASE + (hunterSkill.cdMax || 0) * HUNTER_CFG.SUMMON_COOLDOWN_PER_CD;

    this.gs.addEvent({
      type: 'hunter_summon',
      player: player.id,
      slot,
      hunterId,
      hunterName: hunterSkill.hunterName,
      skillName: hunterSkill.name,
      amount: actual,
      crit,
    });

    // Apply skill special effects
    if (hunterSkill.buffAtk) {
      player.addBuff({
        type: 'atk_up',
        value: hunterSkill.buffAtk / 100,
        dur: hunterSkill.buffDur || 2,
        source: hunterId,
      });
    }
    if (hunterSkill.healSelf) {
      const healed = player.heal(Math.floor(player.maxHp * hunterSkill.healSelf / 100));
      if (healed > 0) {
        player.stats.healingDone += healed;
        this.gs.addEvent({ type: 'heal', source: player.id, target: player.id, amount: healed });
      }
    }
  }

  // ── Damage Calculation ──

  calculateDamage(attacker, power, defender) {
    // Base damage
    let damage = attacker.atk * (power / 100);

    // Defense reduction
    damage *= COMBAT.DEF_FORMULA_CONSTANT / (COMBAT.DEF_FORMULA_CONSTANT + (defender.def || 0));

    // Crit check
    let crit = false;
    const critChance = Math.min(100, Math.max(0,
      attacker.crit - (defender.res || 0) * COMBAT.CRIT_RES_FACTOR
    ));
    if (Math.random() * 100 < critChance) {
      crit = true;
      damage *= COMBAT.CRIT_MULTIPLIER;
    }

    // Variance
    damage *= COMBAT.VARIANCE_MIN + Math.random() * (COMBAT.VARIANCE_MAX - COMBAT.VARIANCE_MIN);

    return { damage: Math.max(1, Math.round(damage)), crit };
  }

  // ── Skill Implementations ──

  _fireProjectile(player, skill, angle) {
    this.gs.addProjectile({
      id: `proj_${nextProjectileId++}`,
      type: 'player_projectile',
      owner: player.id,
      x: player.x + Math.cos(angle) * (player.radius + 5),
      y: player.y + Math.sin(angle) * (player.radius + 5),
      vx: Math.cos(angle) * skill.projSpeed,
      vy: Math.sin(angle) * skill.projSpeed,
      radius: skill.projRadius || 6,
      angle,
      power: skill.power,
      piercing: skill.piercing || false,
      isBasic: skill.isBasic || false,
      alive: true,
      ttl: 2.0, // Max lifetime
    });
  }

  _coneAttack(player, skill, angle) {
    const halfCone = ((skill.coneAngle || 90) * Math.PI / 180) / 2;

    // Hit boss
    const boss = this.gs.boss;
    if (boss.alive) {
      const dx = boss.x - player.x;
      const dy = boss.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= skill.range + boss.radius) {
        const angleToTarget = Math.atan2(dy, dx);
        let angleDiff = angleToTarget - angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        if (Math.abs(angleDiff) <= halfCone) {
          const { damage, crit } = this.calculateDamage(player, skill.power, boss);
          const actual = boss.takeDamage(damage);

          if (actual > 0) {
            player.stats.damageDealt += actual;
            const aggroAmount = actual * AGGRO.DAMAGE_TO_AGGRO * player.aggroMult;
            if (skill.aggroBonus) {
              this.gs.addAggro(player.id, aggroAmount + skill.aggroBonus * player.aggroMult);
            } else {
              this.gs.addAggro(player.id, aggroAmount);
            }

            // Mana on hit (basic attacks restore mana)
            if (skill.isBasic && PLAYER.MANA_ON_HIT > 0) {
              player.mana = Math.min(player.maxMana, player.mana + PLAYER.MANA_ON_HIT);
            }

            this.gs.addEvent({
              type: 'damage',
              source: player.id,
              target: boss.id,
              amount: actual,
              crit,
              skill: skill.name,
            });
          }
        }
      }
    }

    // Hit adds (cleave)
    for (const add of this.gs.getAliveAdds()) {
      const dx = add.x - player.x;
      const dy = add.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > skill.range + add.radius) continue;

      const angleToTarget = Math.atan2(dy, dx);
      let angleDiff = angleToTarget - angle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      if (Math.abs(angleDiff) <= halfCone) {
        const { damage, crit } = this.calculateDamage(player, skill.power, add);
        const actual = add.takeDamage(damage);
        if (actual > 0) {
          player.stats.damageDealt += actual;
          this.gs.addEvent({ type: 'damage', source: player.id, target: add.id, amount: actual, crit, skill: skill.name });
          if (!add.alive) this.gs.addEvent({ type: 'add_killed', addId: add.id, killer: player.id });
        }
      }
    }
  }

  _taunt(player, skill) {
    // Force boss to target this player
    this.gs.addAggro(player.id, AGGRO.TAUNT_AGGRO);
    this.gs.boss.targetId = player.id;

    this.gs.addEvent({
      type: 'skill_used',
      player: player.id,
      skill: skill.name,
      effect: 'taunt',
    });
  }

  _partyShield(player, skill) {
    for (const ally of this.gs.getAlivePlayers()) {
      const dist = Math.hypot(ally.x - player.x, ally.y - player.y);
      if (dist <= skill.range) {
        ally.addBuff({
          type: 'shield',
          stacks: 1,
          dur: skill.duration,
          value: skill.shieldHp,
        });
      }
    }

    this.gs.addEvent({
      type: 'skill_used',
      player: player.id,
      skill: skill.name,
      effect: 'party_shield',
    });
  }

  _invulnerable(player, skill) {
    player.invulnerable = true;
    player.invulnTimer = skill.duration;
    this.gs.addAggro(player.id, skill.aggroFlat || 0);

    this.gs.addEvent({
      type: 'skill_used',
      player: player.id,
      skill: skill.name,
      effect: 'invulnerable',
    });
  }

  _healNearestAlly(player, skill) {
    // Find nearest damaged ally (or self)
    let bestTarget = null;
    let bestDist = Infinity;

    for (const ally of this.gs.getAlivePlayers()) {
      if (ally.hp >= ally.maxHp) continue;
      const dist = Math.hypot(ally.x - player.x, ally.y - player.y);
      if (dist <= skill.range && dist < bestDist) {
        bestDist = dist;
        bestTarget = ally;
      }
    }

    if (!bestTarget) bestTarget = player; // Self-heal if no one else

    const healed = bestTarget.heal(skill.healPower);
    player.stats.healingDone += healed;

    // Healing generates aggro
    this.gs.addAggro(player.id, healed * AGGRO.HEAL_TO_AGGRO * player.aggroMult);

    this.gs.addEvent({
      type: 'heal',
      source: player.id,
      target: bestTarget.id,
      amount: healed,
      skill: skill.name,
    });
  }

  _healAoe(player, skill) {
    for (const ally of this.gs.getAlivePlayers()) {
      const dist = Math.hypot(ally.x - player.x, ally.y - player.y);
      if (dist <= skill.range) {
        const healed = ally.heal(skill.healPower);
        player.stats.healingDone += healed;
        this.gs.addAggro(player.id, healed * AGGRO.HEAL_TO_AGGRO * player.aggroMult);

        this.gs.addEvent({
          type: 'heal',
          source: player.id,
          target: ally.id,
          amount: healed,
        });
      }
    }
  }

  _placeHealZone(player, skill, angle) {
    const dist = Math.min(skill.range, 150);
    const targetX = player.x + Math.cos(angle) * dist;
    const targetY = player.y + Math.sin(angle) * dist;

    this.gs.addAoeZone({
      id: `healzone_${nextProjectileId++}`,
      type: 'heal_zone',
      x: targetX,
      y: targetY,
      radius: skill.zoneRadius || 80,
      ttl: skill.zoneDuration || 2.0,
      maxTtl: skill.zoneDuration || 2.0,
      active: true,
      source: player.id,
      owner: player.id,
      healPower: skill.healPower || 800,
      healTicks: skill.healTicks || 4,
      _healTimer: 0,
      _healInterval: (skill.zoneDuration || 2.0) / (skill.healTicks || 4),
    });

    this.gs.addEvent({
      type: 'skill_used',
      player: player.id,
      skill: skill.name,
      effect: 'heal_zone',
    });
  }

  _cleanse(player, skill) {
    for (const ally of this.gs.getAlivePlayers()) {
      const dist = Math.hypot(ally.x - player.x, ally.y - player.y);
      if (dist <= skill.range) {
        ally.removeAllDebuffs();
        this.gs.addEvent({
          type: 'cleanse',
          source: player.id,
          target: ally.id,
        });
      }
    }

    // Healer cleanse also dispels boss rage buff!
    if (skill.dispelsBossRage && this.gs.boss.alive && this.gs.boss.rageBuff > 0) {
      const had = this.gs.boss.dispelRage();
      if (had > 0) {
        this.gs.addEvent({
          type: 'boss_message',
          text: '✨ Rage de Manaya dissipée par ' + (player.username || player.id) + ' !',
        });
      }
    }
  }

  _resurrect(player, skill) {
    const deadPlayers = this.gs.players.filter(p => !p.alive);
    if (deadPlayers.length === 0) return;

    // Resurrect nearest dead player
    let nearest = null;
    let nearestDist = Infinity;
    for (const dead of deadPlayers) {
      const dist = Math.hypot(dead.x - player.x, dead.y - player.y);
      if (dist < nearestDist && dist <= skill.range) {
        nearestDist = dist;
        nearest = dead;
      }
    }

    if (nearest) {
      nearest.resurrect(skill.healPercent);
      this.gs.addEvent({
        type: 'resurrect',
        source: player.id,
        target: nearest.id,
      });
    }
  }

  _aoeSelf(player, skill) {
    // Damage all enemies in radius around player
    const boss = this.gs.boss;
    if (!boss.alive) return;

    const dist = Math.hypot(boss.x - player.x, boss.y - player.y);
    if (dist <= skill.range + boss.radius) {
      const { damage, crit } = this.calculateDamage(player, skill.power, boss);
      const actual = boss.takeDamage(damage);
      player.stats.damageDealt += actual;
      this.gs.addAggro(player.id, actual * AGGRO.DAMAGE_TO_AGGRO * player.aggroMult);

      this.gs.addEvent({
        type: 'damage',
        source: player.id,
        target: boss.id,
        amount: actual,
        crit,
        skill: skill.name,
      });
    }
  }

  _dashAttack(player, skill, angle) {
    // Dash player forward, damage everything in path
    const endX = player.x + Math.cos(angle) * skill.dashDistance;
    const endY = player.y + Math.sin(angle) * skill.dashDistance;

    // Move player instantly
    player.x = endX;
    player.y = endY;
    player.clampPosition();

    // Check boss hit along the line
    const boss = this.gs.boss;
    if (boss.alive) {
      // Simple: if boss center is within lineWidth of the dash line
      const dist = this._pointToLineDistance(boss.x, boss.y, player.x - Math.cos(angle) * skill.dashDistance, player.y - Math.sin(angle) * skill.dashDistance, player.x, player.y);
      if (dist < (skill.lineWidth / 2) + boss.radius) {
        const { damage, crit } = this.calculateDamage(player, skill.power, boss);
        const actual = boss.takeDamage(damage);
        player.stats.damageDealt += actual;
        this.gs.addAggro(player.id, actual * AGGRO.DAMAGE_TO_AGGRO * player.aggroMult);

        this.gs.addEvent({
          type: 'damage',
          source: player.id,
          target: boss.id,
          amount: actual,
          crit,
          skill: skill.name,
        });
      }
    }
  }

  _singleTarget(player, skill, angle) {
    const boss = this.gs.boss;
    if (!boss.alive) return;

    const dist = Math.hypot(boss.x - player.x, boss.y - player.y);
    if (dist > skill.range + boss.radius) return;

    let power = skill.power;
    // Execution bonus
    if (skill.bonusVsLowHp && (boss.hp / boss.maxHp) < 0.3) {
      power *= (1 + skill.bonusVsLowHp);
    }

    const { damage, crit } = this.calculateDamage(player, power, boss);
    const actual = boss.takeDamage(damage);
    player.stats.damageDealt += actual;
    this.gs.addAggro(player.id, actual * AGGRO.DAMAGE_TO_AGGRO * player.aggroMult);

    this.gs.addEvent({
      type: 'damage',
      source: player.id,
      target: boss.id,
      amount: actual,
      crit,
      skill: skill.name,
    });
  }

  _aoeTargeted(player, skill, angle) {
    // Delayed AoE at target position
    const targetX = player.x + Math.cos(angle) * Math.min(skill.range, 400);
    const targetY = player.y + Math.sin(angle) * Math.min(skill.range, 400);

    // Telegraph
    const zoneId = `aoe_player_${nextProjectileId++}`;
    this.gs.addAoeZone({
      id: zoneId,
      type: 'player_aoe_telegraph',
      x: targetX,
      y: targetY,
      radius: skill.aoeRadius,
      ttl: skill.delay + 0.3,
      maxTtl: skill.delay + 0.3,
      active: false,
      source: player.id,
      owner: player.id,
      power: skill.power,
      _detonateAt: skill.delay,
      _detonated: false,
    });
  }

  _placeTrap(player, skill, angle) {
    const targetX = player.x + Math.cos(angle) * Math.min(skill.range, 300);
    const targetY = player.y + Math.sin(angle) * Math.min(skill.range, 300);

    this.gs.addAoeZone({
      id: `trap_${nextProjectileId++}`,
      type: 'trap',
      x: targetX,
      y: targetY,
      radius: skill.trapRadius,
      ttl: skill.duration,
      maxTtl: skill.duration,
      active: true,
      source: player.id,
      owner: player.id,
      power: skill.power,
      _triggered: false,
    });
  }

  _startChannel(player, skill, angle) {
    player.casting = {
      skill: skill.name,
      angle,
      timer: 0,
      duration: skill.hits * skill.interval,
      hitsRemaining: skill.hits,
      hitInterval: skill.interval,
      hitTimer: 0,
      power: skill.power,
      range: skill.range,
      coneAngle: (skill.coneAngle || 30) * Math.PI / 180,
    };
  }

  // ── Update Systems ──

  updatePlayerCooldowns(player, dt) {
    for (const key of Object.keys(player.cooldowns)) {
      if (player.cooldowns[key] > 0) {
        player.cooldowns[key] = Math.max(0, player.cooldowns[key] - dt);
      }
    }

    // Dodge cooldown
    if (player.dodgeCooldown > 0) {
      player.dodgeCooldown = Math.max(0, player.dodgeCooldown - dt);
    }

    // Invuln timer
    if (player.invulnerable) {
      player.invulnTimer -= dt;
      if (player.invulnTimer <= 0) {
        player.invulnerable = false;
      }
    }

    // Dodge timer
    if (player.dodging) {
      player.dodgeTimer += dt;
      if (player.dodgeTimer >= PLAYER.DODGE_DURATION) {
        player.dodging = false;
      }
    }

    // Channel update
    if (player.casting) {
      this._updateChannel(player, dt);
    }

    // Hunter cooldowns
    for (let i = 0; i < 3; i++) {
      if (player.hunterCooldowns[i] > 0) {
        player.hunterCooldowns[i] = Math.max(0, player.hunterCooldowns[i] - dt);
      }
    }
  }

  _updateChannel(player, dt) {
    const c = player.casting;
    c.timer += dt;
    c.hitTimer += dt;

    // Fire hits at interval
    while (c.hitTimer >= c.hitInterval && c.hitsRemaining > 0) {
      c.hitTimer -= c.hitInterval;
      c.hitsRemaining--;

      // Hit boss if in cone
      const boss = this.gs.boss;
      if (boss.alive) {
        const dx = boss.x - player.x;
        const dy = boss.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= c.range + boss.radius) {
          const angleToTarget = Math.atan2(dy, dx);
          let angleDiff = angleToTarget - c.angle;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

          if (Math.abs(angleDiff) <= c.coneAngle / 2) {
            const { damage, crit } = this.calculateDamage(player, c.power, boss);
            const actual = boss.takeDamage(damage);
            player.stats.damageDealt += actual;
            this.gs.addAggro(player.id, actual * AGGRO.DAMAGE_TO_AGGRO * player.aggroMult);

            this.gs.addEvent({
              type: 'damage',
              source: player.id,
              target: boss.id,
              amount: actual,
              crit,
              skill: 'Barrage',
            });
          }
        }
      }
    }

    // Channel finished
    if (c.timer >= c.duration || c.hitsRemaining <= 0) {
      player.casting = null;
    }
  }

  updatePlayerBuffs(player, dt) {
    const expired = [];

    for (const buff of player.buffs) {
      buff.dur -= dt;

      // Tick damage (poison, etc.)
      if (buff.tickInterval > 0 && buff.damage > 0) {
        buff.tickTimer -= dt;
        if (buff.tickTimer <= 0) {
          buff.tickTimer = buff.tickInterval;
          // Poison: damage scales with stacks
          const tickDmg = buff.damage * buff.stacks;
          player.hp -= tickDmg;
          player.stats.damageTaken += tickDmg;

          this.gs.addEvent({
            type: 'dot_tick',
            target: player.id,
            amount: tickDmg,
            debuff: buff.type,
            stacks: buff.stacks,
          });

          if (player.hp <= 0) {
            player.hp = 0;
            player.alive = false;
            player.stats.deaths++;
          }
        }
      }

      if (buff.dur <= 0) expired.push(buff.type);
    }

    player.buffs = player.buffs.filter(b => b.dur > 0);
  }

  regenMana(player, dt) {
    if (!player.alive) return;
    const regen = PLAYER.MANA_REGEN_RATE + (player.res * 0.05);
    player.mana = Math.min(player.maxMana, player.mana + regen * dt);

    // Blocking costs mana
    if (player.blocking && player.skills.secondary?.type === 'block') {
      const cost = (player.skills.secondary.manaCost || 5) * dt;
      player.mana -= cost;
      if (player.mana <= 0) {
        player.mana = 0;
        player.blocking = false;
      }
      // Generate aggro while blocking
      this.gs.addAggro(player.id, AGGRO.BLOCK_AGGRO_PER_SEC * dt * player.aggroMult);
    }
  }

  // ── Utility ──

  _pointToLineDistance(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(px - x1, py - y1);

    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    const nearX = x1 + t * dx;
    const nearY = y1 + t * dy;
    return Math.hypot(px - nearX, py - nearY);
  }
}
