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

    // Position (starts on the right side)
    this.x = COMBAT.WORLD_WIDTH - 200;

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

    // Target tracking
    this.targetId = null;

    // Visual
    this.radius = 50;
  }

  // ── Damage ──────────────────────────────────────────────

  takeDamage(amount) {
    if (!this.alive) return 0;
    const reduction = COMBAT.DEF_CONSTANT / (COMBAT.DEF_CONSTANT + this.def);
    const finalDamage = Math.floor(amount * reduction);
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
    this.atk = Math.floor(this.atk * 1.5);
    this.autoAttackInterval *= 0.6;
  }

  // ── Pattern System ──────────────────────────────────────

  update(dt) {
    if (!this.alive) return null;

    // Enrage timer
    this.enrageTimer -= dt;
    if (this.enrageTimer <= 0 && !this.enraged) {
      this.enrage();
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
      alive: this.alive,
      enraged: this.enraged,
      enrageTimer: Math.max(0, Math.floor(this.enrageTimer)),
      radius: this.radius,
      patternPhase: this.patternPhase,
      currentPatternName: this.currentPattern?.name || null,
      patternTimeLeft: this.patternPhase === 'telegraph' ? this.patternTimer : 0,
    };
  }
}
