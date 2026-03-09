// ─── Expedition Boss Entity (v2) ──────────────────────────
// Fork of Manaya's BossBase adapted for expedition.
// Each boss loads patterns from bossDefinitions.js.
// Uses same update loop, same pattern lifecycle, same physics.

import { BOSS as BOSS_CFG, ARENA } from '../config.js';

let nextId = 1;

export class ExpeditionBoss {
  constructor(definition, hunterCount = 30) {
    this.id = `boss_${nextId++}`;
    this.bossId = definition.id;
    this.name = definition.name;
    this.index = definition.index;

    // Scale HP based on hunter count (30 = 100%)
    const hpScale = Math.max(0.3, hunterCount / BOSS_CFG.HUNTER_SCALE_BASE);
    this.maxHp = Math.round(definition.hp * hpScale);
    this.hp = this.maxHp;
    this.atk = definition.atk;
    this.def = definition.def;
    this.spd = definition.spd;
    this.radius = definition.radius || BOSS_CFG.RADIUS;
    this.color = definition.color || '#ef4444';

    // Position: boss spawns at right side of arena
    this.x = ARENA.WIDTH * 0.75;
    this.y = ARENA.HEIGHT / 2;
    this.rotation = Math.PI; // Facing left (toward players)

    // State
    this.alive = true;
    this.enraged = false;
    this.shielded = false;
    this.shieldHp = 0;
    this.shieldMaxHp = 0;

    // Phase system
    this.phase = 0;
    this.phaseDefinitions = definition.phases || [];
    this._phaseChecked = new Set();
    this.invincible = false;
    this.invincibleTimer = 0;

    // Pattern system
    this.allPatterns = (definition.patterns || []).map(p => ({
      ...p,
      _cooldownTimer: 0,
    }));
    this.currentPattern = null;
    this.patternCooldown = 0;
    this.casting = null;

    // Rage buff (dispellable)
    this.rageBuff = 0;
    this.rageBuffTimer = 0;
    this.speedStacks = 0;

    // Boss buff system (visible, dispellable by healer cleanse)
    // Each buff: { id, name, type, value, duration, maxDuration, stacks, color }
    this.activeBuffs = [];

    // AI targeting
    this.targetId = null;
    this.moveTarget = null;

    // Movement AI
    this._moveState = 'idle';
    this._moveTimer = 0;
    this._pauseDuration = 0;
    this._walkDuration = 0;
    this._leapTarget = null;
    this._leapStartPos = null;
    this._leapTimer = 0;
    this._leapDuration = 0.4;
    this._aggroSwitchTimer = 0;
    this._aggroSwitchCooldown = 12;

    // Acceleration bursts
    this._burstTimer = 0;
    this._burstCooldown = 8;
    this._burstActive = false;
    this._burstDuration = 0;
    this._burstMaxDuration = 1.2;
    this._burstSpeedMult = 2.5;

    // Auto-attack
    const aa = definition.autoAttack || {};
    this._autoAttackTimer = 0;
    this._autoAttackInterval = aa.interval || 2.0;
    this._autoAttackPower = aa.power || 1.0;
    this._autoAttackRange = aa.range || 100;
    this._autoAttackHitbox = aa.hitbox || 'cone';
    this._autoAttackConeAngle = aa.coneAngle || 60;

    // Enrage timer
    this._enrageTimer = definition.enrageTimer || BOSS_CFG.ENRAGE_TIMER;
    this._enrageElapsed = 0;

    // Stunned state
    this._stunned = false;
    this._stunnedTimer = 0;
    this._burning = false;
    this._burnTimer = 0;

    // DPS check stagger (temporary def reduction)
    this._defDebuffTimer = 0;
    this._defDebuffMult = 1.0;

    // Manaya flag
    this.useManayaPatterns = !!definition.useManayaPatterns;

    // Center-anchor behavior (boss returns to center between attacks)
    this.anchorCenter = !!definition.anchorCenter;
    this._anchorX = ARENA.WIDTH / 2;
    this._anchorY = ARENA.HEIGHT / 2;

    // Sprite identifier
    this.spriteId = definition.sprite || null;
  }

  get hpPercent() {
    return (this.hp / this.maxHp) * 100;
  }

  get patterns() {
    return this.allPatterns.filter(p => p.phases.includes(this.phase));
  }

  update(dt, gameState) {
    if (!this.alive) return;

    // Stun
    if (this._stunned) {
      this._stunnedTimer -= dt;
      if (this._stunnedTimer <= 0) { this._stunned = false; }
      return;
    }

    // Invincibility countdown (phase transition)
    if (this.invincible) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer <= 0) {
        this.invincible = false;
        this.invincibleTimer = 0;
      }
    }

    // Burn DoT
    if (this._burning) {
      this._burnTimer -= dt;
      if (this._burnTimer <= 0) this._burning = false;
      const burnDmg = Math.floor(this.maxHp * 0.005 * dt);
      if (burnDmg > 0) this._applyDamage(burnDmg);
    }

    // Enrage timer
    this._enrageElapsed += dt;
    if (!this.enraged && this._enrageElapsed >= this._enrageTimer) {
      this.enraged = true;
      gameState.addEvent({ type: 'boss_message', text: `⚠️ ${this.name} entre en rage !` });
    }
    if (!this.enraged && this.hpPercent <= BOSS_CFG.ENRAGE_HP_PERCENT) {
      this.enraged = true;
    }

    // Speed multiplier (includes boss_spd_up buff stacks)
    const spdBuffStacks = this.getBuffStacks('boss_spd_up');
    let spdMult = (this.enraged ? BOSS_CFG.ENRAGE_SPEED_MULT : 1.0) * (1 + (this.speedStacks || 0) * 0.10) * (1 + spdBuffStacks * 0.20);

    // Acceleration bursts
    if (this._burstActive) {
      this._burstDuration += dt;
      if (this._burstDuration >= this._burstMaxDuration) {
        this._burstActive = false;
        this._burstTimer = 0;
      } else {
        spdMult *= this._burstSpeedMult;
      }
    } else if (!this.currentPattern) {
      this._burstTimer += dt;
      if (this._burstTimer >= this._burstCooldown && this.phase >= 1) {
        const burstChance = 0.02 * (this.phase + 1);
        if (Math.random() < burstChance) {
          this._burstActive = true;
          this._burstDuration = 0;
          gameState.addEvent({ type: 'boss_message', text: `⚡ ${this.name} accélère !` });
        }
      }
    }

    // Tick pattern cooldowns
    for (const p of this.allPatterns) {
      if (p._cooldownTimer > 0) p._cooldownTimer -= dt * spdMult;
    }

    // Rage buff tick
    if (this.rageBuff > 0) {
      this.rageBuffTimer -= dt;
      if (this.rageBuffTimer <= 0) { this.rageBuff = 0; this.rageBuffTimer = 0; }
    }

    // Tick active buffs
    this.updateBuffs(dt);

    // Self-buff: boss gives itself periodic buffs in later phases
    this._selfBuffTimer = (this._selfBuffTimer || 0) + dt;
    if (this._selfBuffTimer >= 15 && this.phase >= 1 && !this.currentPattern) {
      this._selfBuffTimer = 0;
      // Phase 1+: ATK buff (stacking, dispellable)
      if (Math.random() < 0.4 + this.phase * 0.15) {
        this.addBossBuff({
          id: 'boss_atk_up', name: 'Fureur', duration: 20, value: 0.15,
          maxStacks: 3, color: '#ef4444',
        });
        gameState.addEvent({ type: 'boss_message', text: `🔥 ${this.name} se renforce ! (Fureur x${this.getBuffStacks('boss_atk_up')})` });
      }
      // Phase 2+: Speed buff
      if (this.phase >= 2 && Math.random() < 0.3) {
        this.addBossBuff({
          id: 'boss_spd_up', name: 'Célérité', duration: 12, value: 0.20,
          maxStacks: 2, color: '#f59e0b',
        });
        gameState.addEvent({ type: 'boss_message', text: `⚡ ${this.name} accélère ! (Célérité x${this.getBuffStacks('boss_spd_up')})` });
      }
    }

    // DPS check stagger debuff
    if (this._defDebuffTimer > 0) {
      this._defDebuffTimer -= dt;
      if (this._defDebuffTimer <= 0) {
        this._defDebuffTimer = 0;
        this._defDebuffMult = 1.0;
      }
    }

    // Double donut phase 2 detonation
    if (this._doubleDonutPhase2) {
      this._doubleDonutPhase2.timer -= dt;
      if (this._doubleDonutPhase2.timer <= 0) {
        const { bossX, bossY, bossId } = this._doubleDonutPhase2;
        const hunters = gameState.getAliveHunters();
        for (const h of hunters) {
          if (h.dodging) continue;
          const dist = Math.hypot(h.x - bossX, h.y - bossY);
          // Outer ring OS: 370-550px
          if (dist >= 370 && dist < 550 + (h.radius || 18)) {
            const actual = h.takeTrueDamage(999999);
            if (actual > 0) gameState.addEvent({ type: 'damage', source: bossId, target: h.id, amount: actual, skill: 'Anneau Extérieur' });
          }
          // Laser trap OS: too close (<160px)
          if (dist < 160 + (h.radius || 18)) {
            const actual = h.takeTrueDamage(999999);
            if (actual > 0) gameState.addEvent({ type: 'damage', source: bossId, target: h.id, amount: actual, skill: 'Laser Piège' });
          }
        }
        // Visual explosions
        gameState.addAoeZone({ id: `dbl_outer_exp_${Date.now()}`, type: 'donut_explosion', x: bossX, y: bossY, radius: 550, innerRadius: 370, ttl: 0.5, active: true, source: bossId });
        gameState.addAoeZone({ id: `dbl_laser_exp_${Date.now()}`, type: 'circle_explosion', x: bossX, y: bossY, radius: 160, ttl: 0.5, active: true, source: bossId });
        this._doubleDonutPhase2 = null;
      }
    }

    // Phase check
    this._checkPhaseTransition(gameState);

    // Update targeting — taunt lock takes priority
    if (this.tauntTimer > 0) {
      this.tauntTimer -= dt;
      const taunter = this.tauntedBy ? gameState.getHunterById(this.tauntedBy) : null;
      if (!taunter || !taunter.alive) {
        this.tauntTimer = 0;
        this.tauntedBy = null;
      }
      // Keep targeting taunter, skip aggro/random switch
    } else {
      this.tauntedBy = null;
      // Normal aggro targeting
      const aggroTarget = gameState.getHighestAggroTarget();
      if (aggroTarget) this.targetId = aggroTarget.id;

      // Random aggro switch
      this._aggroSwitchTimer += dt;
      if (this._aggroSwitchTimer >= this._aggroSwitchCooldown && !this.currentPattern && this.phase >= 1) {
        const switchChance = 0.01 * (this.phase + 1);
        if (Math.random() < switchChance) {
          this._tryRandomAggroSwitch(gameState);
          this._aggroSwitchTimer = 0;
        }
      }
    }

    // Pattern execution
    if (this.currentPattern) {
      this._updatePattern(dt, gameState);
    } else {
      // Try to start a new pattern
      this.patternCooldown -= dt * spdMult;
      if (this.patternCooldown <= 0) {
        this._tryStartPattern(gameState);
      }
    }

    // Movement AI
    if (!this.currentPattern) {
      this._updateMovement(dt, gameState, spdMult);
    }

    // Auto-attack
    if (!this.currentPattern) {
      this._autoAttackTimer += dt * spdMult;
      if (this._autoAttackTimer >= this._autoAttackInterval) {
        this._autoAttackTimer = 0;
        this._doAutoAttack(gameState);
      }
    }

    // Clamp position
    this._clampPosition();
  }

  _checkPhaseTransition(gameState) {
    for (let i = this.phaseDefinitions.length - 1; i >= 0; i--) {
      const pd = this.phaseDefinitions[i];
      if (this._phaseChecked.has(i)) continue;
      if (this.hpPercent <= pd.hpPercent && i > this.phase) {
        this.phase = i;
        this._phaseChecked.add(i);
        gameState.addEvent({
          type: 'boss_phase',
          phase: i,
          label: pd.label,
          bossName: this.name,
        });
        // Invincibility during phase transition (3s)
        this.invincible = true;
        this.invincibleTimer = 3.0;
        // Speed stack on major phase changes
        if (i >= 2) this.speedStacks++;
        break;
      }
    }
  }

  _tryStartPattern(gameState) {
    const available = this.patterns.filter(p => p._cooldownTimer <= 0);
    if (available.length === 0) return;

    // Weighted random selection
    const totalWeight = available.reduce((sum, p) => sum + (p.weight || 1), 0);
    let roll = Math.random() * totalWeight;
    let selected = available[0];
    for (const p of available) {
      roll -= (p.weight || 1);
      if (roll <= 0) { selected = p; break; }
    }

    // Start pattern
    this.currentPattern = {
      pattern: selected,
      state: 'telegraph',
      timer: selected.telegraphTime || 1.0,
    };
    this.casting = { name: selected.name, progress: 0, duration: selected.telegraphTime || 1.0 };
    selected._cooldownTimer = selected.cooldown || 10;
    this.patternCooldown = 2.0; // Global CD after pattern

    gameState.addEvent({
      type: 'boss_pattern_start',
      patternId: selected.id,
      patternName: selected.name,
      bossName: this.name,
    });
  }

  _updatePattern(dt, gameState) {
    const cp = this.currentPattern;
    cp.timer -= dt;

    // Update casting UI
    if (this.casting) {
      const total = cp.pattern[cp.state + 'Time'] || 1;
      this.casting.progress = Math.max(0, 1 - cp.timer / total);
    }

    if (cp.timer <= 0) {
      switch (cp.state) {
        case 'telegraph':
          cp.state = 'cast';
          cp.timer = cp.pattern.castTime || 0.3;
          this._executePattern(cp.pattern, gameState);
          break;
        case 'cast':
          cp.state = 'recovery';
          cp.timer = cp.pattern.recoveryTime || 0.5;
          break;
        case 'recovery':
          this.currentPattern = null;
          this.casting = null;
          break;
      }
    }
  }

  _executePattern(pattern, gameState) {
    const atkBuffStacks = this.getBuffStacks('boss_atk_up');
    const rawDamage = this.atk * (pattern.power || 1.0) * (this.enraged ? BOSS_CFG.ENRAGE_DMG_MULT : 1.0) * (1 + this.rageBuff * 0.15) * (1 + atkBuffStacks * 0.15);
    const hunters = gameState.getAliveHunters();

    switch (pattern.type) {
      case 'cone_telegraph': {
        // Damage all hunters in a cone in front of boss
        const range = pattern.range || 250;
        const halfAngle = ((pattern.coneAngle || 90) * Math.PI / 180) / 2;
        for (const h of hunters) {
          const dx = h.x - this.x, dy = h.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > range + h.radius) continue;
          if (h.dodging) continue;
          const angle = Math.atan2(dy, dx);
          let diff = angle - this.rotation;
          while (diff > Math.PI) diff -= 2 * Math.PI;
          while (diff < -Math.PI) diff += 2 * Math.PI;
          if (Math.abs(diff) <= halfAngle) {
            const actual = pattern.isTrueDamage ? h.takeTrueDamage(rawDamage) : h.takeDamage(rawDamage);
            if (actual > 0) gameState.addEvent({ type: 'damage', source: this.id, target: h.id, amount: actual, skill: pattern.name });
          }
        }
        break;
      }

      case 'aoe_ring': {
        // Damage all hunters within outerRadius (optionally outside innerRadius)
        const inner = pattern.innerRadius || 0;
        const outer = pattern.outerRadius || 300;
        for (const h of hunters) {
          const dist = Math.hypot(h.x - this.x, h.y - this.y);
          if (h.dodging) continue;
          if (dist >= inner && dist <= outer + h.radius) {
            const actual = pattern.isTrueDamage ? h.takeTrueDamage(rawDamage) : h.takeDamage(rawDamage);
            if (actual > 0) {
              gameState.addEvent({ type: 'damage', source: this.id, target: h.id, amount: actual, skill: pattern.name });
              if (pattern.appliesDebuff) h.addBuff({ ...pattern.appliesDebuff, source: 'boss' });
            }
          }
        }
        // Visual AoE zone
        gameState.addAoeZone({ x: this.x, y: this.y, radius: outer, type: 'boss_ring', ttl: 1.0 });
        break;
      }

      case 'donut': {
        // Safe inside innerSafe, damage between innerSafe and outerRadius
        const safe = pattern.innerSafe || 150;
        const outer = pattern.outerRadius || 600;
        for (const h of hunters) {
          const dist = Math.hypot(h.x - this.x, h.y - this.y);
          if (h.dodging) continue;
          if (dist > safe && dist <= outer + h.radius) {
            const actual = pattern.isTrueDamage ? h.takeTrueDamage(rawDamage) : h.takeDamage(rawDamage);
            if (actual > 0) gameState.addEvent({ type: 'damage', source: this.id, target: h.id, amount: actual, skill: pattern.name });
          }
        }
        gameState.addAoeZone({ x: this.x, y: this.y, radius: outer, type: 'boss_donut', innerSafe: safe, ttl: 1.5 });
        break;
      }

      case 'double_donut': {
        // Faithful reproduction of Manaya's Anneau Destructeur (2-phase donut)
        // Phase 1: inner ring 130-350px OS → safe if <120px or >360px
        // Phase 2 (1.2s later): outer ring 370-550px OS + laser <160px OS
        // Safe zone phase 2: 160-370px
        const bossX = this.x, bossY = this.y;
        const bossId = this.id;

        // Phase 1: hit anyone in ring 130-350
        for (const h of hunters) {
          if (h.dodging) continue;
          const dist = Math.hypot(h.x - bossX, h.y - bossY);
          if (dist > 120 && dist < 360) {
            const actual = h.takeTrueDamage(999999);
            if (actual > 0) gameState.addEvent({ type: 'damage', source: bossId, target: h.id, amount: actual, skill: 'Anneau Destructeur' });
          }
        }
        // Phase 1 visual
        gameState.addAoeZone({
          id: `dbl_inner_exp_${Date.now()}`, type: 'donut_explosion',
          x: bossX, y: bossY, radius: 350, innerRadius: 130,
          ttl: 0.5, active: true, source: bossId,
        });
        gameState.addEvent({ type: 'boss_message', text: '⚠️ Deuxième anneau ! Ne restez pas près d\'elle !' });

        // Phase 2 telegraph
        gameState.addAoeZone({
          id: `dbl_outer_tel_${Date.now()}`, type: 'donut_telegraph',
          x: bossX, y: bossY, radius: 550, innerRadius: 370,
          ttl: 1.5, active: false, source: bossId,
        });
        gameState.addAoeZone({
          id: `dbl_laser_tel_${Date.now()}`, type: 'circle_telegraph',
          x: bossX, y: bossY, radius: 160,
          ttl: 1.5, active: false, source: bossId,
        });

        // Schedule phase 2 detonation after 1.2s
        this._doubleDonutPhase2 = {
          timer: 1.2,
          bossX, bossY, bossId,
        };
        break;
      }

      case 'line_telegraph': {
        // Line damage in front of boss
        const range = pattern.range || 800;
        const halfW = (pattern.lineWidth || 80) / 2;
        for (const h of hunters) {
          if (h.dodging) continue;
          const dx = h.x - this.x, dy = h.y - this.y;
          const cos = Math.cos(this.rotation), sin = Math.sin(this.rotation);
          const along = dx * cos + dy * sin;
          const perp = Math.abs(-dx * sin + dy * cos);
          if (along >= 0 && along <= range && perp <= halfW + h.radius) {
            const actual = pattern.isTrueDamage ? h.takeTrueDamage(rawDamage) : h.takeDamage(rawDamage);
            if (actual > 0) gameState.addEvent({ type: 'damage', source: this.id, target: h.id, amount: actual, skill: pattern.name });
          }
        }
        break;
      }

      case 'targeted_aoe_multi': {
        // Drop AoE circles on N random hunters
        const count = pattern.targetCount || 3;
        const radius = pattern.aoeRadius || 100;
        const targets = hunters.sort(() => Math.random() - 0.5).slice(0, count);
        for (const t of targets) {
          gameState.addAoeZone({ x: t.x, y: t.y, radius, type: 'boss_targeted', ttl: 1.5 });
          for (const h of hunters) {
            if (h.dodging) continue;
            if (Math.hypot(h.x - t.x, h.y - t.y) <= radius + h.radius) {
              const actual = pattern.isTrueDamage ? h.takeTrueDamage(rawDamage) : h.takeDamage(rawDamage);
              if (actual > 0) gameState.addEvent({ type: 'damage', source: this.id, target: h.id, amount: actual, skill: pattern.name });
            }
          }
        }
        break;
      }

      case 'aoe_full': {
        // Raid-wide damage to everyone
        for (const h of hunters) {
          if (h.dodging) continue;
          const actual = pattern.isTrueDamage ? h.takeTrueDamage(rawDamage) : h.takeDamage(rawDamage);
          if (actual > 0) gameState.addEvent({ type: 'damage', source: this.id, target: h.id, amount: actual, skill: pattern.name });
        }
        break;
      }

      case 'projectile_spread': {
        // Fire projectiles in spread pattern
        const count = pattern.projCount || 4;
        const speed = pattern.projSpeed || 200;
        const radius = pattern.projRadius || 8;
        const spread = (60 * Math.PI / 180); // 60 degree spread
        const startAngle = this.rotation - spread / 2;
        for (let i = 0; i < count; i++) {
          const angle = startAngle + (spread / Math.max(1, count - 1)) * i;
          gameState.addProjectile({
            id: `boss_proj_${Date.now()}_${i}`,
            x: this.x + Math.cos(angle) * (this.radius + 10),
            y: this.y + Math.sin(angle) * (this.radius + 10),
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius, speed,
            damage: rawDamage,
            isTrueDamage: pattern.isTrueDamage || false,
            type: 'boss_projectile',
            ownerId: this.id,
            ownerType: 'boss',
            color: this.color || '#fbbf24',
            alive: true,
            ttl: 5.0,
          });
        }
        break;
      }

      case 'persistent_aoe': {
        // Lingering damage zone
        const radius = pattern.aoeRadius || 150;
        const duration = pattern.duration || 8;
        const tick = pattern.tickInterval || 1.0;
        // Place at random hunter or boss position
        const target = hunters[Math.floor(Math.random() * hunters.length)];
        const zx = target ? target.x : this.x;
        const zy = target ? target.y : this.y;
        gameState.addAoeZone({
          x: zx, y: zy, radius, type: 'boss_persistent',
          ttl: duration, _tickTimer: 0, _tickInterval: tick,
          _damage: rawDamage, _isTrueDamage: pattern.isTrueDamage || false,
          _bossId: this.id,
        });
        break;
      }

      case 'targeted_debuff': {
        // Apply debuff to N random hunters
        const count = pattern.targetCount || 3;
        const targets = hunters.sort(() => Math.random() - 0.5).slice(0, count);
        for (const h of targets) {
          h.addBuff({
            type: pattern.debuffType || 'speed_down',
            value: pattern.debuffValue || 0.5,
            dur: pattern.debuffDuration || 4,
            source: 'boss',
          });
          // Small damage on application
          if (pattern.power > 0) {
            const dmg = rawDamage * 0.3;
            const actual = h.takeDamage(dmg);
            if (actual > 0) gameState.addEvent({ type: 'damage', source: this.id, target: h.id, amount: actual, skill: pattern.name });
          }
          gameState.addEvent({ type: 'debuff', source: this.id, target: h.id, debuff: pattern.debuffType, skill: pattern.name });
        }
        break;
      }

      case 'laser': {
        // Laser beam from boss in facing direction — creates a lingering damage zone
        const range = pattern.range || 800;
        const lineW = pattern.lineWidth || 60;
        const duration = pattern.duration || 2.0;
        const dmgPerTick = rawDamage * 0.15; // Light tick damage, not OS
        gameState.addAoeZone({
          x: this.x, y: this.y, radius: range,
          type: 'laser', angle: this.rotation, lineWidth: lineW,
          ttl: duration, active: true,
          damagePerTick: dmgPerTick, tickInterval: 0.2,
          color: pattern.laserColor || '#22c55e',
        });
        gameState.addEvent({ type: 'boss_message', text: `${this.name} lance ${pattern.name} !` });
        break;
      }

      case 'fire_wave': {
        // Expanding ring wave — hunters must dodge through it
        const maxRadius = pattern.maxRadius || 500;
        const duration = pattern.duration || 2.5;
        const dmgPerTick = rawDamage * 0.12;
        gameState.addAoeZone({
          x: this.x, y: this.y, radius: 0,
          type: 'fire_wave', ttl: duration, active: true,
          damagePerTick: dmgPerTick, tickInterval: 0.15,
          _maxRadius: maxRadius, _expandRate: maxRadius / duration,
          color: pattern.waveColor || '#22c55e',
        });
        break;
      }

      case 'dps_check': {
        // DPS check: measure team DPS over window. If below threshold, boss heals.
        // Uses gameState.combatTime and total damage dealt to calculate real-time DPS
        const allHunters = gameState.getAliveHunters();
        const totalDmgDealt = allHunters.reduce((s, h) => s + (h.damageDealt || 0), 0);
        const elapsed = gameState.combatTime || 1;
        const teamDps = totalDmgDealt / elapsed;
        const threshold = pattern.dpsThreshold || 3_000_000; // Required DPS
        const healPercent = pattern.healPercent || 5;

        gameState.addEvent({ type: 'boss_message', text: `${this.name} évalue la puissance de l'équipe...` });

        if (teamDps < threshold) {
          // DPS check FAILED — boss heals
          const healAmount = Math.floor(this.maxHp * healPercent / 100);
          this.hp = Math.min(this.maxHp, this.hp + healAmount);
          gameState.addEvent({
            type: 'boss_heal', source: this.id, amount: healAmount,
            text: `DPS insuffisant ! ${this.name} absorbe l'énergie des ombres et récupère ${Math.round(healPercent)}% HP !`,
          });
          // Also deal raid damage as punishment
          if (pattern.failPower) {
            const failDmg = this.atk * pattern.failPower;
            for (const h of allHunters) {
              if (h.dodging) continue;
              const actual = h.takeDamage(failDmg);
              if (actual > 0) gameState.addEvent({ type: 'damage', source: this.id, target: h.id, amount: actual, skill: pattern.name });
            }
          }
        } else {
          // DPS check PASSED — boss is staggered (takes extra damage briefly)
          gameState.addEvent({
            type: 'boss_message',
            text: `L'équipe résiste ! ${this.name} est ébranlé !`,
          });
          // Brief vulnerability: reduce boss def for a few seconds
          this._defDebuffTimer = pattern.staggerDuration || 5;
          this._defDebuffMult = pattern.staggerDefMult || 0.5;
        }
        break;
      }

      case 'percent_hp_attack': {
        // Sets all hit hunters to X% of their max HP (like Manaya's big attacks)
        // Dodgeable — if you dodge, you take 0. If not, you go to targetHpPercent.
        const targetPct = pattern.targetHpPercent || 15; // Sets HP to 15%
        const radius = pattern.outerRadius || 400;
        const inner = pattern.innerSafe || 0;
        let hitCount = 0;

        for (const h of hunters) {
          if (h.dodging) continue;
          const dist = Math.hypot(h.x - this.x, h.y - this.y);
          if (inner > 0 && dist < inner) continue; // Safe zone
          if (dist > radius + h.radius) continue;
          // Set HP to target percent (can't kill, minimum 1 HP)
          const targetHp = Math.max(1, Math.floor(h.maxHp * targetPct / 100));
          if (h.hp > targetHp) {
            const dmg = h.hp - targetHp;
            h.hp = targetHp;
            hitCount++;
            gameState.addEvent({ type: 'damage', source: this.id, target: h.id, amount: dmg, skill: pattern.name, percentHp: true });
          }
        }
        if (hitCount > 0) {
          gameState.addEvent({ type: 'boss_message', text: `${pattern.name} frappe ${hitCount} chasseurs à ${targetPct}% HP !` });
        }
        break;
      }

      case 'shadow_mark': {
        // Marks N random hunters — after delay, marked hunters explode dealing AoE to nearby allies
        // Forces spread mechanic
        const count = pattern.targetCount || 4;
        const explodeRadius = pattern.explodeRadius || 120;
        const targets = hunters.sort(() => Math.random() - 0.5).slice(0, count);
        for (const h of targets) {
          // Apply a visual debuff
          h.addBuff({ type: 'shadow_mark', value: 0, dur: pattern.markDuration || 3, source: 'boss' });
          gameState.addEvent({ type: 'debuff', source: this.id, target: h.id, debuff: 'shadow_mark', skill: pattern.name });
        }
        // Schedule explosion after mark duration (handled by persistent zone)
        for (const t of targets) {
          gameState.addAoeZone({
            x: t.x, y: t.y, radius: explodeRadius,
            type: 'boss_targeted', ttl: pattern.markDuration || 3,
            _followTarget: t.id, // Zone follows the marked hunter
            _detonateOnExpiry: true, _detonateDamage: rawDamage,
            _bossId: this.id, _isTrueDamage: pattern.isTrueDamage || false,
          });
        }
        break;
      }

      case 'soul_drain': {
        // Channels for duration, draining HP from all hunters and healing boss
        // Must be interrupted by dealing enough damage during channel
        const drainPct = pattern.drainPercent || 3; // % of hunter max HP per tick
        const duration = pattern.duration || 4;
        const tickInterval = pattern.tickInterval || 0.5;
        const healMult = pattern.healMultiplier || 2; // Boss heals more than it drains
        gameState.addAoeZone({
          x: this.x, y: this.y, radius: 800,
          type: 'boss_persistent', ttl: duration,
          _tickTimer: 0, _tickInterval: tickInterval,
          _isDrain: true, _drainPct: drainPct, _healMult: healMult,
          _bossId: this.id, _bossRef: this,
          color: '#7c3aed',
        });
        gameState.addEvent({ type: 'boss_message', text: `${this.name} draine l'essence vitale !` });
        break;
      }

      case 'soak_circles': {
        // Spawn circles that must be stood in by hunters. If unsoaked, raid takes % HP damage.
        const circleCount = pattern.circleCount || 3;
        const circleRadius = pattern.circleRadius || 80;
        const soakDur = pattern.soakDuration || 6;
        const failPct = pattern.failDamagePercent || 20;
        // Place circles at random positions spread across arena
        for (let i = 0; i < circleCount; i++) {
          const sx = ARENA.WIDTH * 0.2 + Math.random() * ARENA.WIDTH * 0.6;
          const sy = ARENA.HEIGHT * 0.2 + Math.random() * ARENA.HEIGHT * 0.6;
          gameState.addAoeZone({
            x: sx, y: sy, radius: circleRadius,
            type: 'soak_circle', ttl: soakDur, active: true,
            _soakRequired: true, _failDmgPct: failPct,
            _bossId: this.id, color: '#fbbf24',
          });
        }
        gameState.addEvent({ type: 'boss_message', text: `${this.name} ouvre des fissures ! Tenez-vous dedans !` });
        break;
      }

      case 'heal_cast': {
        // Boss channels a heal. Team must deal X damage during channel to interrupt.
        const healPct = pattern.healPercent || 8;
        const channelDur = pattern.channelDuration || 5;
        const dmgToInterrupt = pattern.damageToInterrupt || 5_000_000;
        // Track boss HP at start — if team deals enough, interrupt
        const startHp = this.hp;
        gameState.addAoeZone({
          x: this.x, y: this.y, radius: 300,
          type: 'boss_heal_cast', ttl: channelDur, active: true,
          _healPct: healPct, _dmgToInterrupt: dmgToInterrupt, _startHp: startHp,
          _bossId: this.id, _bossRef: this,
          color: '#22c55e',
        });
        gameState.addEvent({ type: 'boss_message', text: `${this.name} canalise une guérison ! Infligez ${Math.round(dmgToInterrupt / 1_000_000)}M dégâts pour l'interrompre !` });
        break;
      }

      case 'rotating_laser': {
        // Laser beam that rotates around the boss. Must be dodged continuously.
        const range = pattern.range || 800;
        const lineW = pattern.lineWidth || 60;
        const duration = pattern.duration || 5.0;
        const rotSpeed = pattern.rotationSpeed || 1.0; // radians/sec
        const dmgPerTick = rawDamage * 0.2;
        gameState.addAoeZone({
          x: this.x, y: this.y, radius: range,
          type: 'rotating_laser', angle: this.rotation, lineWidth: lineW,
          ttl: duration, active: true,
          damagePerTick: dmgPerTick, tickInterval: 0.15,
          _rotSpeed: rotSpeed, _bossRef: this,
          color: pattern.laserColor || '#ef4444',
        });
        gameState.addEvent({ type: 'boss_message', text: `${this.name} lance un laser rotatif !` });
        break;
      }

      case 'ultimate_wipe': {
        // Massive raid damage. Hunters must use defensive cooldowns to survive.
        // Deals huge damage to everyone (true damage if configured).
        const survivalThreshold = pattern.requiresSurvival || 10;
        for (const h of hunters) {
          if (h.dodging) continue;
          // Each hunter takes damage equal to (maxHp - survivalThreshold% buffer)
          // Effectively kills anyone without defensive cooldowns active
          const wipeDmg = Math.floor(h.maxHp * 0.85);
          const actual = pattern.isTrueDamage ? h.takeTrueDamage(wipeDmg) : h.takeDamage(wipeDmg);
          if (actual > 0) gameState.addEvent({ type: 'damage', source: this.id, target: h.id, amount: actual, skill: pattern.name });
        }
        gameState.addEvent({ type: 'boss_message', text: `💀 ${pattern.name}` });
        break;
      }
    }

    // Spawn adds if defined
    if (pattern.spawnsAdds) {
      const { type, count } = pattern.spawnsAdds;
      const bossRef = this;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i;
        const spawnX = this.x + Math.cos(angle) * 200;
        const spawnY = this.y + Math.sin(angle) * 200;

        // Fire elemental adds: explode if not killed in time + drain mana
        if (type === 'fire_elemental') {
          const add = {
            id: `add_${Date.now()}_${i}`,
            type, x: spawnX, y: spawnY,
            hp: Math.round(this.maxHp * 0.008), maxHp: Math.round(this.maxHp * 0.008),
            atk: Math.round(this.atk * 0.25), radius: 22, alive: true,
            spriteId: 'fire_elemental',
            color: '#f97316',
            _fuseTimer: 12.0,    // Explodes after 12 seconds if not killed
            _manaDrainCd: 0,     // Mana drain cooldown tracker
            _manaDrainInterval: 3.0, // Drain mana every 3s
            _manaDrainAmount: 50,    // Amount drained per tick
            update(dt, gs) {
              // Fuse countdown — explodes dealing massive AoE if not killed
              this._fuseTimer -= dt;
              if (this._fuseTimer <= 0) {
                // EXPLOSION — deals 25% max HP true damage to all hunters within 200px
                const explodeRadius = 200;
                for (const h of gs.getAliveHunters()) {
                  const d = Math.hypot(h.x - this.x, h.y - this.y);
                  if (d <= explodeRadius + h.radius) {
                    const explosionDmg = Math.floor(h.maxHp * 0.25);
                    h.takeTrueDamage(explosionDmg);
                    gs.addEvent({ type: 'damage', source: this.id, target: h.id, amount: explosionDmg, skill: 'Explosion Élémentaire' });
                  }
                }
                gs.addEvent({ type: 'boss_message', text: '💥 Un élémentaire de feu explose !' });
                gs.addAoeZone({ x: this.x, y: this.y, radius: explodeRadius, type: 'boss_ring', ttl: 0.5, color: '#f97316' });
                this.alive = false;
                this.hp = 0;
                return;
              }

              // Walk toward nearest hunter
              const target = gs.getAliveHunters().reduce((best, h) => {
                const d = Math.hypot(h.x - this.x, h.y - this.y);
                return !best || d < best.d ? { h, d } : best;
              }, null);
              if (target && target.d > 40) {
                const a = Math.atan2(target.h.y - this.y, target.h.x - this.x);
                this.x += Math.cos(a) * 35 * dt;
                this.y += Math.sin(a) * 35 * dt;
              } else if (target && target.d <= 40) {
                // Melee attack
                this._atkTimer = (this._atkTimer || 0) + dt;
                if (this._atkTimer >= 2.0) {
                  this._atkTimer = 0;
                  target.h.takeDamage(this.atk, this);
                }
              }

              // Mana drain — periodically drains nearby hunters' mana
              this._manaDrainCd -= dt;
              if (this._manaDrainCd <= 0) {
                this._manaDrainCd = this._manaDrainInterval;
                for (const h of gs.getAliveHunters()) {
                  const d = Math.hypot(h.x - this.x, h.y - this.y);
                  if (d <= 150 && h.mana !== undefined) {
                    h.mana = Math.max(0, h.mana - this._manaDrainAmount);
                    gs.addEvent({ type: 'debuff', source: this.id, target: h.id, debuff: 'mana_drain', skill: 'Drain de Mana' });
                  }
                }
              }
            },
            takeDamage(amount) {
              this.hp -= amount;
              if (this.hp <= 0) { this.hp = 0; this.alive = false; }
              return amount;
            },
          };
          gameState.addAdd(add);
        } else {
          // Default add types (minion, elite, etc.)
          const add = {
            id: `add_${Date.now()}_${i}`,
            type, x: spawnX, y: spawnY,
            hp: Math.round(this.maxHp * (type === 'elite' ? 0.02 : 0.01)),
            maxHp: Math.round(this.maxHp * (type === 'elite' ? 0.02 : 0.01)),
            atk: Math.round(this.atk * (type === 'elite' ? 0.5 : 0.3)),
            radius: type === 'elite' ? 25 : 20, alive: true,
            update(dt, gs) {
              const target = gs.getAliveHunters().reduce((best, h) => {
                const d = Math.hypot(h.x - this.x, h.y - this.y);
                return !best || d < best.d ? { h, d } : best;
              }, null);
              if (target && target.d > 40) {
                const a = Math.atan2(target.h.y - this.y, target.h.x - this.x);
                this.x += Math.cos(a) * 30 * dt;
                this.y += Math.sin(a) * 30 * dt;
              } else if (target && target.d <= 40) {
                this._atkTimer = (this._atkTimer || 0) + dt;
                if (this._atkTimer >= 2.0) {
                  this._atkTimer = 0;
                  target.h.takeDamage(this.atk, this);
                }
              }
            },
            takeDamage(amount) {
              this.hp -= amount;
              if (this.hp <= 0) { this.hp = 0; this.alive = false; }
              return amount;
            },
          };
          gameState.addAdd(add);
        }
      }
    }

    // Emit event for spectator
    gameState.addEvent({
      type: 'boss_pattern_execute',
      bossId: this.id,
      patternName: pattern.name,
      patternType: pattern.type,
    });
  }

  _doAutoAttack(gameState) {
    const target = gameState.getHunterById(this.targetId);
    if (!target || !target.alive) return;

    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > this._autoAttackRange + this.radius + target.radius) return;

    const rawDamage = this.atk * this._autoAttackPower * (this.enraged ? BOSS_CFG.ENRAGE_DMG_MULT : 1.0);
    const actual = target.takeDamage(rawDamage, this);
    if (actual > 0) {
      gameState.addAggro(target.id, actual * 0.1); // Small aggro from taking damage
      gameState.addEvent({
        type: 'damage',
        source: this.id,
        target: target.id,
        amount: actual,
        skill: 'auto',
      });
    }
  }

  _updateMovement(dt, gameState, spdMult) {
    const target = gameState.getHunterById(this.targetId);
    if (!target || !target.alive) return;

    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Face target
    this.rotation = Math.atan2(dy, dx);

    const moveSpeed = this.spd * spdMult * 0.8; // px/sec

    // Center-anchored bosses return to center between attacks
    if (this.anchorCenter) {
      const cdx = this._anchorX - this.x;
      const cdy = this._anchorY - this.y;
      const centerDist = Math.sqrt(cdx * cdx + cdy * cdy);

      switch (this._moveState) {
        case 'idle':
          // If far from center, walk back
          if (centerDist > 80) {
            this._moveState = 'returning';
            this._moveTimer = 0;
          } else if (dist > this._autoAttackRange * 0.8) {
            // Brief chase toward target before returning
            this._moveState = 'chasing';
            this._walkDuration = 1.5 + Math.random() * 1.5;
            this._moveTimer = 0;
          } else {
            this._moveState = 'pausing';
            this._pauseDuration = 0.5 + Math.random() * 1.5;
            this._moveTimer = 0;
          }
          break;

        case 'chasing':
          this._moveTimer += dt;
          if (this._moveTimer >= this._walkDuration || dist <= this._autoAttackRange * 0.6) {
            this._moveState = 'returning';
            this._moveTimer = 0;
          } else {
            const norm = dist > 0 ? 1 / dist : 0;
            this.x += dx * norm * moveSpeed * dt;
            this.y += dy * norm * moveSpeed * dt;
          }
          break;

        case 'returning':
          if (centerDist <= 30) {
            this._moveState = 'pausing';
            this._pauseDuration = 0.5 + Math.random() * 1.0;
            this._moveTimer = 0;
          } else {
            const norm = 1 / centerDist;
            this.x += cdx * norm * moveSpeed * 1.2 * dt;
            this.y += cdy * norm * moveSpeed * 1.2 * dt;
          }
          break;

        case 'pausing':
          this._moveTimer += dt;
          if (this._moveTimer >= this._pauseDuration) {
            this._moveState = 'idle';
            this._moveTimer = 0;
          }
          break;
      }
      return;
    }

    // Default movement for non-anchored bosses
    switch (this._moveState) {
      case 'idle':
        if (dist > this._autoAttackRange * 0.8) {
          this._moveState = 'walking';
          this._walkDuration = 1.0 + Math.random() * 2.0;
          this._moveTimer = 0;
        } else {
          this._moveState = 'pausing';
          this._pauseDuration = 0.5 + Math.random() * 1.5;
          this._moveTimer = 0;
        }
        break;

      case 'walking':
        this._moveTimer += dt;
        if (this._moveTimer >= this._walkDuration || dist <= this._autoAttackRange * 0.6) {
          this._moveState = 'pausing';
          this._pauseDuration = 0.3 + Math.random() * 1.0;
          this._moveTimer = 0;
        } else {
          const norm = dist > 0 ? 1 / dist : 0;
          this.x += dx * norm * moveSpeed * dt;
          this.y += dy * norm * moveSpeed * dt;
        }
        break;

      case 'pausing':
        this._moveTimer += dt;
        if (this._moveTimer >= this._pauseDuration) {
          this._moveState = dist > this._autoAttackRange ? 'walking' : 'idle';
          this._moveTimer = 0;
        }
        break;
    }
  }

  _tryRandomAggroSwitch(gameState) {
    const hunters = gameState.getAliveHunters();
    const nonTanks = hunters.filter(h => h.class !== 'tank' && h.id !== this.targetId);
    if (nonTanks.length === 0) return;
    const target = nonTanks[Math.floor(Math.random() * nonTanks.length)];
    this.targetId = target.id;
    gameState.addEvent({ type: 'boss_message', text: `${this.name} vise ${target.hunterName || target.username} !` });
  }

  takeDamage(rawDamage, source) {
    if (!this.alive) return 0;
    if (this.invincible) return 0;
    let damage = rawDamage;

    // Shield absorb
    if (this.shielded && this.shieldHp > 0) {
      if (damage <= this.shieldHp) {
        this.shieldHp -= damage;
        return 0;
      }
      damage -= this.shieldHp;
      this.shieldHp = 0;
      this.shielded = false;
    }

    // NO DEF here — CombatEngine.calculateDamage() already applies DEF reduction
    // BUT if staggered from DPS check, amplify incoming damage
    if (this._defDebuffTimer > 0 && this._defDebuffMult < 1.0) {
      damage = Math.round(damage / this._defDebuffMult); // e.g. 0.5 mult = 2x damage taken
    }
    damage = Math.max(1, Math.round(damage));
    this.hp -= damage;
    if (this.hp <= 0) { this.hp = 0; this.alive = false; }
    return damage;
  }

  _applyDamage(damage) {
    this.hp -= damage;
    if (this.hp <= 0) { this.hp = 0; this.alive = false; }
  }

  applyStun(duration) {
    if (this.currentPattern) return; // Cannot stun during pattern cast
    this._stunned = true;
    this._stunnedTimer = duration;
  }

  applyBurn(duration) {
    this._burning = true;
    this._burnTimer = duration;
  }

  // ── Boss Buff System ──
  addBossBuff(buff) {
    const existing = this.activeBuffs.find(b => b.id === buff.id);
    if (existing) {
      // Stack or refresh
      existing.stacks = Math.min((existing.stacks || 1) + 1, buff.maxStacks || 5);
      existing.duration = buff.duration;
      existing.value = buff.value;
    } else {
      this.activeBuffs.push({
        id: buff.id,
        name: buff.name,
        type: buff.type || 'buff',   // 'buff' (green) or 'debuff' (red on boss = from hunters)
        value: buff.value || 0,
        duration: buff.duration,
        maxDuration: buff.duration,
        stacks: 1,
        maxStacks: buff.maxStacks || 5,
        color: buff.color || '#22c55e',
      });
    }
  }

  updateBuffs(dt) {
    for (let i = this.activeBuffs.length - 1; i >= 0; i--) {
      this.activeBuffs[i].duration -= dt;
      if (this.activeBuffs[i].duration <= 0) {
        this.activeBuffs.splice(i, 1);
      }
    }
  }

  // Dispel one buff (healer cleanse removes strongest buff)
  dispelOneBuff() {
    if (this.activeBuffs.length === 0 && this.rageBuff <= 0) return null;

    // Priority: rageBuff first, then highest-stacked active buff
    if (this.rageBuff > 0) {
      const val = this.rageBuff;
      this.rageBuff = 0;
      this.rageBuffTimer = 0;
      return { name: 'Rage', value: val };
    }

    // Remove the buff with most stacks (most impactful)
    if (this.activeBuffs.length > 0) {
      this.activeBuffs.sort((a, b) => b.stacks - a.stacks);
      const removed = this.activeBuffs.shift();
      return removed;
    }
    return null;
  }

  // Legacy alias
  dispelRage() {
    if (this.rageBuff > 0) {
      const val = this.rageBuff;
      this.rageBuff = 0;
      this.rageBuffTimer = 0;
      return val;
    }
    return 0;
  }

  hasBuff(id) {
    return this.activeBuffs.some(b => b.id === id);
  }

  getBuffStacks(id) {
    const b = this.activeBuffs.find(b => b.id === id);
    return b ? b.stacks : 0;
  }

  _clampPosition() {
    const wall = ARENA.WALL_THICKNESS + this.radius;
    this.x = Math.max(wall, Math.min(ARENA.WIDTH - wall, this.x));
    this.y = Math.max(wall, Math.min(ARENA.HEIGHT - wall, this.y));
  }
}
