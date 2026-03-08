import { COMBAT, AGGRO, PLAYER, HUNTER as HUNTER_CFG } from '../config.js';
import { HUNTERS } from '../data/hunterData.js';

// Stub: hunter summon not used in expedition (hunters fight directly)
function getHunterSummonSkill() { return null; }
function hunterStatsAtLevel() { return {}; }

let nextProjectileId = 1;

// ── Auto-attack Combo Constants ──
// 3-hit combo cycle for melee (cone) classes: Tank, DPS CAC
// Ranged classes (projectile) keep simple rapid fire
const COMBO = {
  // Step timings: attack animation duration
  ATK1_DURATION: 0.2,   // Attack 1 animation
  ATK2_DURATION: 0.2,   // Attack 2 animation
  ATK3_DURATION: 0.3,   // Attack 3 animation (slower, heavier)
  // Gap between attacks (from end of previous animation to start of next)
  GAP1: 0.2,            // Gap after ATK1 before ATK2 (total 0.4s from ATK1 start)
  GAP2: 0.6,            // Gap after ATK2 before ATK3 (total 0.8s from ATK2 start)
  RECOVERY: 0.5,        // Recovery after ATK3 before combo resets
  // Damage multipliers (applied to base skill power)
  ATK1_MULT: 1.00,      // 100% power
  ATK2_MULT: 1.20,      // 120% power
  ATK3_MULT: 1.25,      // 125% power
};

export class CombatEngine {
  constructor(gameState) {
    this.gs = gameState;
  }

  // ── Player Actions ──

  startBasicAttack(player, angle) {
    // Called when player presses/holds left click
    player.comboActive = true;
    player.aimAngle = angle;
    // If idle, start combo immediately
    if (player.comboStep === 0) {
      this._startComboStep(player, 1, angle);
    }
  }

  stopBasicAttack(player) {
    // Called when player releases left click
    player.comboActive = false;
  }

  // Legacy single-click basic attack (for ranged / projectile classes)
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

  // ── Combo System Update (called every tick) ──

  updateCombo(player, dt) {
    if (!player.alive) {
      player.comboStep = 0;
      player.comboTimer = 0;
      player.comboActive = false;
      return;
    }

    // Ranged classes (projectile hitbox) don't use combo — they use rapid fire
    if (player.skills.basic.hitbox === 'projectile') {
      if (player.comboActive && !player.dodging && !player.casting) {
        // Auto-fire basic attack while holding
        if (player.cooldowns.basic <= 0) {
          this.basicAttack(player, player.aimAngle);
        }
      }
      return;
    }

    // Melee combo system (cone hitbox — Tank, DPS CAC)
    if (player.comboStep === 0) return; // Idle, no combo in progress
    if (player.dodging || player.casting) {
      // Cancel combo on dodge/cast
      player.comboStep = 0;
      player.comboTimer = 0;
      player.comboLocked = false;
      return;
    }

    // Block cancels combo during gaps (not during attack animation)
    if (player.blocking && !player.comboLocked) {
      player.comboStep = 0;
      player.comboTimer = 0;
      return;
    }

    player.comboTimer += dt;

    switch (player.comboStep) {
      case 1: // ATK1 animation
        if (player.comboTimer >= COMBO.ATK1_DURATION) {
          player.comboLocked = false;
          player.comboStep = 2; // Enter gap1
          player.comboTimer = 0;
        }
        break;

      case 2: // Gap after ATK1
        if (player.comboTimer >= COMBO.GAP1) {
          if (player.comboActive && !player.blocking) {
            // Continue to ATK2
            this._startComboStep(player, 3, player.aimAngle);
          } else {
            // Combo dropped or block cancelled
            player.comboStep = 0;
            player.comboTimer = 0;
          }
        }
        break;

      case 3: // ATK2 animation
        if (player.comboTimer >= COMBO.ATK2_DURATION) {
          player.comboLocked = false;
          player.comboStep = 4; // Enter gap2
          player.comboTimer = 0;
        }
        break;

      case 4: // Gap after ATK2
        if (player.comboTimer >= COMBO.GAP2) {
          if (player.comboActive && !player.blocking) {
            // Continue to ATK3
            this._startComboStep(player, 5, player.aimAngle);
          } else {
            // Cancel block — combo resets, player can restart from ATK1
            player.comboStep = 0;
            player.comboTimer = 0;
          }
        }
        break;

      case 5: // ATK3 animation
        if (player.comboTimer >= COMBO.ATK3_DURATION) {
          player.comboLocked = false;
          player.comboStep = 6; // Enter recovery
          player.comboTimer = 0;
        }
        break;

      case 6: // Recovery after ATK3
        if (player.comboTimer >= COMBO.RECOVERY) {
          // Full combo completed, restart if still holding
          if (player.comboActive && !player.blocking) {
            this._startComboStep(player, 1, player.aimAngle);
          } else {
            player.comboStep = 0;
            player.comboTimer = 0;
          }
        }
        break;
    }
  }

  _startComboStep(player, step, angle) {
    if (player.dodging || player.casting || !player.alive) return;

    const skill = player.skills.basic;
    let powerMult;
    let stepName;

    switch (step) {
      case 1:
        powerMult = COMBO.ATK1_MULT;
        stepName = `${skill.name} I`;
        break;
      case 3:
        powerMult = COMBO.ATK2_MULT;
        stepName = `${skill.name} II`;
        break;
      case 5:
        powerMult = COMBO.ATK3_MULT;
        stepName = `${skill.name} III`;
        break;
      default:
        return;
    }

    player.comboStep = step;
    player.comboTimer = 0;
    player.comboLocked = true; // Can't cancel during animation
    player.aimAngle = angle;

    // Execute the attack with modified power
    const modifiedSkill = { ...skill, power: Math.round(skill.power * powerMult), name: stepName };

    if (skill.hitbox === 'cone') {
      this._coneAttack(player, modifiedSkill, angle);
    } else if (skill.hitbox === 'projectile') {
      this._fireProjectile(player, modifiedSkill, angle);
    }
  }

  secondaryAction(player, angle) {
    if (player.cooldowns.secondary > 0) return;
    if (player.dodging || player.casting) return;

    const skill = player.skills.secondary;

    switch (skill.type) {
      case 'block':
        // Tank blocks with endurance, not mana
        if (player.maxEndurance > 0 && player.endurance <= 0) return; // No endurance
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

  // ── Berserker Charged Attack (hold/release) ──────────────────
  startCharge(player, skillSlot, angle) {
    if (player.dodging || !player.alive) return;
    if (player.charging) return; // Already charging

    const skillKey = skillSlot || 'skillB';
    if (player.cooldowns[skillKey] > 0) return;

    const skill = player.skills[skillKey];
    if (!skill || skill.type !== 'charged_attack') return;

    player.charging = {
      skill: skillKey,
      startTime: Date.now(),
      angle,
      maxChargeTime: skill.chargeTime || 4.0,
    };

    this.gs.addEvent({ type: 'charge_start', source: player.id });
  }

  releaseCharge(player, angle) {
    if (!player.charging) return;

    const skillKey = player.charging.skill;
    const skill = player.skills[skillKey];
    if (!skill) { player.charging = null; return; }

    // Calculate charge duration
    const chargeDuration = Math.min(
      (Date.now() - player.charging.startTime) / 1000,
      player.charging.maxChargeTime
    );

    // Determine charge level (0-3) based on duration
    const maxTime = skill.chargeTime || 4.0;
    const levels = skill.chargeLevels || 4;
    const chargeLevel = Math.min(levels - 1, Math.floor(chargeDuration / maxTime * levels));

    const power = skill.powerLevels?.[chargeLevel] ?? skill.powerBase ?? 200;
    const releaseAngle = angle ?? player.charging.angle;

    player.charging = null;
    player.cooldowns[skillKey] = skill.cooldown || 1.0;
    player.aimAngle = releaseAngle;

    // Fire the charged cone attack
    const chargedSkill = { ...skill, power };
    this._coneAttack(player, chargedSkill, releaseAngle);

    this.gs.addEvent({
      type: 'charge_release',
      source: player.id,
      chargeLevel,
      power,
    });
  }

  useSkill(player, skillSlot, angle) {
    if (player.dodging) return;

    const skillKey = skillSlot; // 'skillA', 'skillB', 'ultimate'
    if (player.cooldowns[skillKey] > 0) return;

    const skill = player.skills[skillKey];
    if (!skill) return;

    // Charged attack: handled via startCharge/releaseCharge, skip normal useSkill
    if (skill.type === 'charged_attack') {
      this.startCharge(player, skillSlot, angle);
      return;
    }

    // Channeled resurrect: defer mana/CD to channel completion
    const isChanneledRez = skill.type === 'resurrect' && skill.channelDuration > 0;

    if (!isChanneledRez) {
      if (skill.manaCost > 0 && !player.useMana(skill.manaCost)) return;
      player.cooldowns[skillKey] = skill.cooldown;
    } else {
      // Just check mana is enough, don't consume yet
      if (skill.manaCost > 0 && player.mana < skill.manaCost) return;
    }

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
      case 'whirlwind':
        // Berserker: AoE channel around player (360° cone)
        this._startChannel(player, { ...skill, coneAngle: 360 }, angle);
        break;
      case 'buff_self':
        // Berserker Rage: +ATK and +SPD for duration
        if (skill.atkBonus > 0) {
          player.addBuff({ type: 'atk_up', value: skill.atkBonus, dur: skill.duration, source: 'rage' });
        }
        if (skill.spdBonus > 0) {
          player.addBuff({ type: 'speed_up', value: skill.spdBonus, dur: skill.duration, source: 'rage' });
        }
        this.gs.addEvent({ type: 'buff', source: player.id, target: player.id, buffType: 'rage', duration: skill.duration });
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
    if (player.charging) player.charging = null; // Cancel charge on dodge

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
    if (!boss || !boss.alive) return;

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

    // Set cooldown (fixed 30s)
    player.hunterCooldowns[slot] = HUNTER_CFG.SUMMON_COOLDOWN;

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
    // Base damage — use getOffensiveStat() which handles INT/Mana scaling
    // Buffs are already applied inside getOffensiveStat()
    let effectiveAtk = attacker.getOffensiveStat
      ? attacker.getOffensiveStat()
      : attacker.atk;
    // Fallback buff application for entities without getOffensiveStat
    if (!attacker.getOffensiveStat) {
      for (const b of (attacker.buffs || [])) {
        if (b.type === 'atk_up') effectiveAtk *= (1 + b.value);
      }
    }
    let damage = effectiveAtk * (power / 100);

    // Defense reduction
    damage *= COMBAT.DEF_FORMULA_CONSTANT / (COMBAT.DEF_FORMULA_CONSTANT + (defender.def || 0));

    // Crit check (apply crit_up buffs)
    let crit = false;
    let critBonus = 0;
    for (const b of (attacker.buffs || [])) {
      if (b.type === 'crit_up') critBonus += b.value;
    }
    const critChance = Math.min(100, Math.max(0,
      attacker.crit + critBonus - (defender.res || 0) * COMBAT.CRIT_RES_FACTOR
    ));
    if (Math.random() * 100 < critChance) {
      crit = true;
      damage *= COMBAT.CRIT_MULTIPLIER;
    }

    // Backstab bonus: +80% damage when attacking from behind the boss
    if (defender.rotation !== undefined && attacker.x !== undefined) {
      const angleToAttacker = Math.atan2(attacker.y - defender.y, attacker.x - defender.x);
      let angleDiff = angleToAttacker - defender.rotation;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      if (Math.abs(angleDiff) > Math.PI * 0.6) { // ~108° behind = backstab
        damage *= 1.8;
      }
    }

    // Manaya Set 6pc: +15% all damage
    if (attacker.dmgBonus > 0) {
      damage *= (1 + attacker.dmgBonus);
    }

    // Variance
    damage *= COMBAT.VARIANCE_MIN + Math.random() * (COMBAT.VARIANCE_MAX - COMBAT.VARIANCE_MIN);

    return { damage: Math.max(1, Math.round(damage)), crit };
  }

  // ── Manaya Set 8pc: chance to stun boss and cancel pattern ──
  checkManayaSetStun(player) {
    if (!player.manayaSetBonuses?.stunChance) return;
    if (Math.random() >= player.manayaSetBonuses.stunChance) return;

    const boss = this.gs.boss;
    if (!boss || !boss.alive || boss._stunned) return;

    // Stun boss for 2 seconds — cancels current pattern
    boss._stunned = true;
    boss._stunnedTimer = 2.0;
    boss.cancelCurrentPattern();

    // Apply burn debuff to boss (cosmetic + small DoT)
    boss._burning = true;
    boss._burnTimer = 4.0;

    this.gs.addEvent({
      type: 'boss_message',
      text: '🩸 Set Manaya — Manaya est STUN ! Pattern annulé !',
    });
    this.gs.addEvent({
      type: 'manaya_set_stun',
      player: player.id,
    });
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
    if (boss && boss.alive) {
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

            // Manaya Set 8pc stun check
            this.checkManayaSetStun(player);

            // Mana/Rage on hit (basic attacks restore resource)
            if (skill.isBasic) {
              const baseGain = player.useRage ? (skill.rageGain || 10) : PLAYER.MANA_ON_HIT;
              const extraGain = skill.manaOnHit || 0;
              const gain = baseGain + extraGain;
              if (gain > 0) player.mana = Math.min(player.maxMana, player.mana + gain);
            }

            // Tank: +5 endurance on auto-attack hit
            if (skill.isBasic && player.maxEndurance > 0) {
              player.endurance = Math.min(player.maxEndurance, player.endurance + 5);
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
    if (this.gs.boss) this.gs.boss.targetId = player.id;

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
    // Emit visual burst event for the AoE heal circle
    this.gs.addEvent({
      type: 'heal_burst',
      x: player.x,
      y: player.y,
      radius: skill.range,
      source: player.id,
    });

    for (const ally of this.gs.getAlivePlayers()) {
      const dist = Math.hypot(ally.x - player.x, ally.y - player.y);
      if (dist <= skill.range) {
        const healAmt = skill.healPct ? Math.floor(ally.maxHp * skill.healPct) : (skill.healPower || 0);
        const healed = ally.heal(healAmt);
        player.stats.healingDone += healed;
        this.gs.addAggro(player.id, healed * AGGRO.HEAL_TO_AGGRO * player.aggroMult);

        this.gs.addEvent({
          type: 'heal',
          source: player.id,
          target: ally.id,
          amount: healed,
        });

        // Soin de Zone buff: +25% ATK for 10s
        if (skill.atkBuff) {
          ally.addBuff({ type: 'atk_up', value: skill.atkBuff, dur: skill.atkBuffDur || 10, source: 'heal_aoe' });
          this.gs.addEvent({ type: 'buff', source: player.id, target: ally.id, buffType: 'atk_up', duration: skill.atkBuffDur || 10 });
        }
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
      healPower: skill.healPower || 0,
      healPct: skill.healPct || 0,
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
    // Emit visual burst event for the cleanse circle
    this.gs.addEvent({
      type: 'cleanse_burst',
      x: player.x,
      y: player.y,
      radius: skill.range,
      source: player.id,
    });

    for (const ally of this.gs.getAlivePlayers()) {
      const dist = Math.hypot(ally.x - player.x, ally.y - player.y);
      if (dist <= skill.range) {
        ally.removeAllDebuffs();
        this.gs.addEvent({
          type: 'cleanse',
          source: player.id,
          target: ally.id,
        });

        // Purification buffs: +10% crit and +10% speed for 10s
        if (skill.critBuff) {
          ally.addBuff({ type: 'crit_up', value: skill.critBuff, dur: skill.buffDur || 10, source: 'cleanse' });
        }
        if (skill.spdBuff) {
          ally.addBuff({ type: 'speed_up', value: skill.spdBuff, dur: skill.buffDur || 10, source: 'cleanse' });
        }
      }
    }

    // Healer cleanse also dispels boss rage buff!
    if (skill.dispelsBossRage && this.gs.boss && this.gs.boss.alive && this.gs.boss.rageBuff > 0) {
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

    // Calculate actual mana cost (percentage-based or flat)
    const actualManaCost = skill.manaCostPercent
      ? Math.ceil(player.maxMana * skill.manaCostPercent)
      : (skill.manaCost || 0);

    // Check mana (for channeled, check is done here; consume on completion)
    if (actualManaCost > 0 && player.mana < actualManaCost) return;

    // Find nearest dead player in range (must be close!)
    let nearest = null;
    let nearestDist = Infinity;
    for (const dead of deadPlayers) {
      const dist = Math.hypot(dead.x - player.x, dead.y - player.y);
      if (dist < nearestDist && dist <= skill.range) {
        nearestDist = dist;
        nearest = dead;
      }
    }
    if (!nearest) return;

    // Channeled resurrect: 6s cast, player can't move/attack
    if (skill.channelDuration > 0) {
      player.casting = {
        skill: skill.name,
        type: 'resurrect',
        timer: 0,
        duration: skill.channelDuration,
        targetId: nearest.id,
        healPercent: skill.healPercent,
        manaCost: actualManaCost,
        cooldown: skill.cooldown,
        range: skill.range,
        hitsRemaining: 0,
        hitTimer: 0,
        hitInterval: 999,
        angle: Math.atan2(nearest.y - player.y, nearest.x - player.x),
      };
      this.gs.addEvent({
        type: 'resurrect_channel',
        source: player.id,
        target: nearest.id,
        targetName: nearest.hunterName || nearest.id,
        duration: skill.channelDuration,
      });
      return;
    }

    // Instant resurrect (fallback — should not happen with new config)
    if (actualManaCost > 0) player.useMana(actualManaCost);
    nearest.resurrect(skill.healPercent);
    this.gs.addEvent({
      type: 'resurrect',
      source: player.id,
      target: nearest.id,
    });
  }

  _aoeSelf(player, skill) {
    // Damage all enemies in radius around player
    const boss = this.gs.boss;
    if (!boss || !boss.alive) {
      // No boss — still damage adds in range
      for (const add of (this.gs.adds || [])) {
        if (!add.alive) continue;
        const addDist = Math.hypot(add.x - player.x, add.y - player.y);
        if (addDist <= skill.range + (add.radius || 20)) {
          const { damage, crit } = this.calculateDamage(player, skill.power, add);
          const actual = add.takeDamage(damage);
          player.stats.damageDealt += actual;
          this.gs.addEvent({ type: 'damage', source: player.id, target: add.id, amount: actual, crit, skill: skill.name });
          if (!add.alive) this.gs.addEvent({ type: 'add_killed', addId: add.id, killer: player.id });
        }
      }
      return;
    }

    // Visual burst for AoE self skills
    this.gs.addEvent({
      type: 'aoe_self_burst',
      x: player.x,
      y: player.y,
      radius: skill.range,
      source: player.id,
    });

    const dist = Math.hypot(boss.x - player.x, boss.y - player.y);
    if (dist <= skill.range + boss.radius) {
      // Proximity bonus: up to +50% more damage when very close
      let effectivePower = skill.power;
      if (skill.proximityBonus) {
        const proxFactor = 1 + 0.5 * Math.max(0, 1 - dist / skill.range);
        effectivePower = Math.floor(skill.power * proxFactor);
      }

      const { damage, crit } = this.calculateDamage(player, effectivePower, boss);
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

    // Also damage adds in range
    for (const add of (this.gs.adds || [])) {
      if (!add.alive) continue;
      const addDist = Math.hypot(add.x - player.x, add.y - player.y);
      if (addDist <= skill.range + (add.radius || 20)) {
        const { damage, crit } = this.calculateDamage(player, skill.power, add);
        const actual = add.takeDamage(damage);
        player.stats.damageDealt += actual;
        this.gs.addEvent({ type: 'damage', source: player.id, target: add.id, amount: actual, crit, skill: skill.name });
      }
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
    if (boss && boss.alive) {
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
    if (!boss || !boss.alive) return;

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
      if (boss && boss.alive) {
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

    // Channel finished (resurrect only checks timer, not hitsRemaining)
    const channelDone = c.type === 'resurrect'
      ? c.timer >= c.duration
      : (c.timer >= c.duration || c.hitsRemaining <= 0);
    if (channelDone) {
      // Resurrect channel: consume mana + apply CD + actually resurrect on completion
      if (c.type === 'resurrect' && c.targetId) {
        const target = this.gs.players.find(p => p.id === c.targetId);
        if (target && !target.alive) {
          // Now consume mana and apply cooldown
          player.useMana(c.manaCost || 0);
          player.cooldowns.ultimate = c.cooldown || 10;
          target.resurrect(c.healPercent);
          this.gs.addEvent({
            type: 'resurrect',
            source: player.id,
            target: target.id,
          });
        }
      }
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
    // DPS CAC uses rage: no passive regen, only gains from basic attacks
    if (player.useRage) return;
    const regen = PLAYER.MANA_REGEN_RATE + (player.res * 0.05);
    player.mana = Math.min(player.maxMana, player.mana + regen * dt);

    // Tank endurance system
    if (player.maxEndurance > 0) {
      if (player.blocking) {
        // Blocking drains 20 endurance per second
        player.endurance -= 20 * dt;
        if (player.endurance <= 0) {
          player.endurance = 0;
          player.blocking = false;
        }
        // Generate aggro while blocking
        this.gs.addAggro(player.id, AGGRO.BLOCK_AGGRO_PER_SEC * dt * player.aggroMult);
      } else {
        // Passive endurance regen: +1 per second
        player.endurance = Math.min(player.maxEndurance, player.endurance + 1 * dt);
      }
    } else if (player.blocking && player.skills.secondary?.type === 'block') {
      // Non-tank blocking (fallback, uses mana) — shouldn't happen currently
      const cost = (player.skills.secondary.manaCost || 5) * dt;
      player.mana -= cost;
      if (player.mana <= 0) {
        player.mana = 0;
        player.blocking = false;
      }
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
