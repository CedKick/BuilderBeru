import { COMBAT } from '../config.js';

export class ExpeditionBoss {
  constructor(definition) {
    this.id = definition.id;
    this.name = definition.name;
    this.index = definition.index;  // Boss number (0-14)

    // Stats
    this.maxHp = definition.hp;
    this.hp = definition.hp;
    this.atk = definition.atk;
    this.def = definition.def;
    this.spd = definition.spd || 50;
    this.regenPct = definition.regenPct || 0;  // Passive HP regen (% maxHP per second)

    // Position (starts on the right side)
    this.x = COMBAT.WORLD_WIDTH - 200;
    this.y = 0;  // Boss at center ground

    // State
    this.alive = true;
    this.enraged = false;
    this.enrageTimer = definition.enrageTimer || 300;  // seconds
    this.enrageHpPercent = definition.enrageHpPercent || 20;

    // Auto-attack
    this.autoAttackTimer = 0;
    this.autoAttackInterval = COMBAT.BOSS_AUTO_ATTACK_INTERVAL;
    this.autoAttackPower = definition.autoAttackPower || 100;

    // Pattern system (simplified from BossBase)
    this.patterns = (definition.patterns || []).map(p => ({
      ...p,
      cooldownRemaining: 0,
    }));
    this.currentPattern = null;
    this.patternTimer = 0;
    this.patternPhase = null;   // 'telegraph' | 'execute' | null
    this.globalPatternCooldown = 0;

    // Phase system (boss 11+ advanced mechanics)
    this.phases = definition.phases || [];
    this.activePhaseIds = new Set();
    this.baseAtk = this.atk;
    this.baseSpd = this.spd;
    this.baseRegenPct = this.regenPct;
    this.baseAutoAttackInterval = COMBAT.BOSS_AUTO_ATTACK_INTERVAL;
    this.antiHealPct = 0;  // Active anti-heal aura from phases

    // Debuffs
    this.debuffs = [];

    // Target tracking
    this.targetId = null;

    // Visual
    this.radius = 50;
  }

  // ── Damage ──────────────────────────────────────────────

  takeDamage(amount) {
    if (!this.alive) return 0;
    // DEF is already applied in CombatEngine2D.calculateDamage() — do NOT apply again here
    const finalDamage = Math.floor(amount);
    this.hp = Math.max(0, this.hp - finalDamage);

    // Check enrage
    if (!this.enraged && this.enrageHpPercent > 0) {
      if (this.hp / this.maxHp * 100 <= this.enrageHpPercent) {
        this.enrage();
      }
    }

    if (this.hp <= 0) {
      this.alive = false;
    }
    return finalDamage;
  }

  enrage() {
    if (this.enraged) return;
    this.enraged = true;
    this.recalcPhaseStats();
  }

  // ── Phase System ──────────────────────────────────────

  updatePhases() {
    const hpPct = this.hp / this.maxHp * 100;
    let changed = false;

    for (const phase of this.phases) {
      if (this.activePhaseIds.has(phase.id)) continue;

      let triggered = false;
      if (phase.trigger === 'hp_below') triggered = hpPct <= phase.threshold;
      else if (phase.trigger === 'enrage') triggered = this.enraged;

      if (triggered) {
        this.activePhaseIds.add(phase.id);
        changed = true;
        // Add phase-specific patterns
        if (phase.patterns) {
          for (const p of phase.patterns) {
            this.patterns.push({ ...p, cooldownRemaining: 0 });
          }
        }
      }
    }

    if (changed) this.recalcPhaseStats();
  }

  recalcPhaseStats() {
    let atkMult = 1, spdMult = 1, regenMult = 1, antiHeal = 0;

    for (const phase of this.phases) {
      if (!this.activePhaseIds.has(phase.id)) continue;
      if (phase.atkMult) atkMult *= phase.atkMult;
      if (phase.spdMult) spdMult *= phase.spdMult;
      if (phase.regenMult) regenMult *= phase.regenMult;
      if (phase.antiHealPct) antiHeal = Math.max(antiHeal, phase.antiHealPct);
    }

    const enrageMult = this.enraged ? 1.5 : 1;
    this.atk = Math.floor(this.baseAtk * enrageMult * atkMult);
    this.spd = Math.floor(this.baseSpd * spdMult);
    this.regenPct = this.baseRegenPct * regenMult;
    this.antiHealPct = antiHeal;

    const enrageIntervalMult = this.enraged ? 0.6 : 1;
    this.autoAttackInterval = this.baseAutoAttackInterval * enrageIntervalMult / spdMult;
  }

  // ── Pattern System ──────────────────────────────────────

  update(dt) {
    if (!this.alive) return null;

    // Enrage timer
    this.enrageTimer -= dt;
    if (this.enrageTimer <= 0 && !this.enraged) {
      this.enrage();
    }

    // Check phase triggers (data-driven mechanics for boss 11+)
    if (this.phases.length > 0) {
      this.updatePhases();
    }

    // Update pattern cooldowns
    for (const p of this.patterns) {
      if (p.cooldownRemaining > 0) p.cooldownRemaining -= dt;
    }
    this.globalPatternCooldown -= dt;

    // If currently executing a pattern
    if (this.currentPattern) {
      this.patternTimer -= dt;
      if (this.patternTimer <= 0) {
        if (this.patternPhase === 'telegraph') {
          // Transition to execute
          this.patternPhase = 'execute';
          this.patternTimer = 0;
          const result = { type: 'pattern_execute', pattern: this.currentPattern };
          this.currentPattern.cooldownRemaining = this.currentPattern.cooldown;
          this.globalPatternCooldown = COMBAT.BOSS_PATTERN_COOLDOWN;
          this.currentPattern = null;
          this.patternPhase = null;
          return result;
        }
      }
      return this.patternPhase === 'telegraph'
        ? { type: 'pattern_telegraph', pattern: this.currentPattern, timeLeft: this.patternTimer }
        : null;
    }

    // Try to start a new pattern
    if (this.globalPatternCooldown <= 0) {
      const available = this.patterns.filter(p => p.cooldownRemaining <= 0);
      if (available.length > 0) {
        // Weighted random selection
        const totalWeight = available.reduce((sum, p) => sum + (p.weight || 1), 0);
        let roll = Math.random() * totalWeight;
        let chosen = available[0];
        for (const p of available) {
          roll -= (p.weight || 1);
          if (roll <= 0) { chosen = p; break; }
        }

        this.currentPattern = chosen;
        this.patternPhase = 'telegraph';
        this.patternTimer = chosen.telegraphTime || COMBAT.BOSS_TELEGRAPH_DEFAULT;
        return { type: 'pattern_start', pattern: chosen, telegraphTime: this.patternTimer };
      }
    }

    return null;
  }

  // ── Auto-Attack ─────────────────────────────────────────

  updateAutoAttack(dt) {
    if (!this.alive) return false;
    this.autoAttackTimer -= dt;
    if (this.autoAttackTimer <= 0) {
      this.autoAttackTimer = this.autoAttackInterval;
      return true;
    }
    return false;
  }

  // ── Movement ────────────────────────────────────────────

  moveToward(targetX, dt) {
    if (!this.alive) return;
    const diff = targetX - this.x;
    const dir = Math.sign(diff);
    const step = this.spd * dt;
    if (Math.abs(diff) > step) {
      this.x += dir * step;
    }
  }

  // Stub: buff system
  addBuff() {}

  // ── Debuffs ──────────────────────────────────────────────

  addDebuff(type, value, duration, source, maxStacks = 1) {
    const existing = this.debuffs.find(d => d.type === type && d.source === source);
    if (existing) {
      if (maxStacks > 1 && existing.stacks < maxStacks) {
        existing.stacks++;
        existing.duration = Math.max(existing.duration, duration);
      } else {
        existing.duration = duration;
        existing.value = value;
      }
    } else {
      this.debuffs.push({ type, value, duration, source, stacks: 1, maxStacks });
    }
  }

  updateDebuffs(dt) {
    for (let i = this.debuffs.length - 1; i >= 0; i--) {
      this.debuffs[i].duration -= dt;
      if (this.debuffs[i].duration <= 0) this.debuffs.splice(i, 1);
    }
  }

  getDebuffValue(type) {
    let total = 0;
    for (const d of this.debuffs) {
      if (d.type === type) total += d.value * (d.stacks || 1);
    }
    return total;
  }

  isStunned() { return this.debuffs.some(d => d.type === 'stun' && d.duration > 0); }

  getEffectiveAtk() {
    const shred = this.getDebuffValue('atk_shred');
    const confusion = this.getDebuffValue('confusion');
    const reduction = Math.min(shred + confusion, 50); // cap total ATK reduction at -50%
    return Math.floor(this.atk * (1 - reduction / 100));
  }

  // ── Serialization ───────────────────────────────────────

  serialize() {
    return {
      id: this.id,
      name: this.name,
      index: this.index,
      hp: this.hp,
      maxHp: this.maxHp,
      atk: this.atk,
      def: this.def,
      x: this.x,
      y: this.y,
      alive: this.alive,
      enraged: this.enraged,
      enrageTimer: Math.max(0, Math.floor(this.enrageTimer)),
      radius: this.radius,
      patternPhase: this.patternPhase,
      currentPatternName: this.currentPattern?.name || null,
      patternTimeLeft: this.patternPhase === 'telegraph' ? this.patternTimer : 0,
      activePhases: [...this.activePhaseIds],
      antiHealPct: this.antiHealPct,
    };
  }
}
