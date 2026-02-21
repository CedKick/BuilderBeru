import { BOSS as BOSS_CFG } from '../config.js';

let nextId = 1;

export class BossBase {
  constructor(name, stats, x, y) {
    this.id = `boss_${nextId++}`;
    this.name = name;
    this.x = x;
    this.y = y;
    this.radius = BOSS_CFG.RADIUS;
    this.rotation = Math.PI / 2; // Facing down initially

    // Stats
    this.maxHp = stats.hp;
    this.hp = stats.hp;
    this.atk = stats.atk;
    this.def = stats.def;
    this.spd = stats.spd;

    // State
    this.alive = true;
    this.enraged = false;
    this.shielded = false;
    this.shieldHp = 0;
    this.shieldMaxHp = 0;

    // Phase system
    this.phase = 1;
    this.phaseThresholds = []; // [{ hpPercent, phase, onEnter }]

    // Pattern system
    this.patterns = [];         // Available patterns for current phase
    this.currentPattern = null; // { pattern, timer, state }
    this.patternCooldown = 0;   // Global cooldown between patterns
    this.casting = null;        // { name, progress, duration } for UI

    // Rage buff (dispellable by healer)
    this.rageBuff = 0;          // 0-3 stacks
    this.rageBuffTimer = 0;     // Duration remaining
    this.speedStacks = 0;       // Permanent speed stacks (at 50/30/20% HP)
    this.playerCount = 1;       // Set by GameState for solo scaling

    // AI targeting
    this.targetId = null;
    this.moveTarget = null;     // { x, y } to move towards

    // Acceleration bursts
    this._burstTimer = 0;
    this._burstCooldown = 8;     // Time between possible bursts
    this._burstActive = false;
    this._burstDuration = 0;
    this._burstMaxDuration = 1.2; // 1.2s of speed boost
    this._burstSpeedMult = 2.5;  // 2.5x speed during burst

    // Movement AI: pause-based movement (not constant chase)
    this._moveState = 'idle';    // 'idle' | 'walking' | 'pausing' | 'leaping'
    this._moveTimer = 0;
    this._pauseDuration = 0;     // How long to pause
    this._walkDuration = 0;      // How long to walk towards target
    this._leapTarget = null;     // Target position for leap
    this._leapStartPos = null;   // Start position of leap
    this._leapTimer = 0;
    this._leapDuration = 0.4;    // Duration of leap animation
    this._aggroSwitchTimer = 0;  // Timer for random aggro switch
    this._aggroSwitchCooldown = 12; // Min seconds between random aggro switches

    // Internal timers
    this._autoAttackTimer = 0;
    this._autoAttackInterval = 2.0;
    this._phaseChecked = new Set();
  }

  update(dt, gameState) {
    if (!this.alive) return;

    // Speed multiplier (enrage + cumulative speed buffs)
    let spdMult = (this.enraged ? BOSS_CFG.ENRAGE_SPEED_MULT : 1.0) * (1 + (this.speedStacks || 0) * 0.10);

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
      // Trigger burst: chance increases with phase, and after cooldown
      if (this._burstTimer >= this._burstCooldown && this.phase >= 2) {
        const burstChance = 0.02 * this.phase; // 4% at phase 2, up to 12% at phase 6 per tick
        if (Math.random() < burstChance) {
          this._burstActive = true;
          this._burstDuration = 0;
          gameState.addEvent({ type: 'boss_message', text: '⚡ Manaya accélère !' });
        }
      }
    }

    // Tick per-pattern cooldowns
    for (const p of this.patterns) {
      if (p._cooldownTimer > 0) p._cooldownTimer -= dt * spdMult;
    }

    // Tick rage buff
    if (this.rageBuff > 0) {
      this.rageBuffTimer -= dt;
      if (this.rageBuffTimer <= 0) {
        this.rageBuff = 0;
        this.rageBuffTimer = 0;
      }
    }

    // Update target (highest aggro)
    const aggroTarget = gameState.getHighestAggroPlayer();
    if (aggroTarget) {
      this.targetId = aggroTarget.id;
    }

    // Random aggro switch to DPS (not continuous chase)
    this._aggroSwitchTimer += dt;
    if (this._aggroSwitchTimer >= this._aggroSwitchCooldown && !this.currentPattern && this.phase >= 2) {
      const switchChance = 0.01 * this.phase; // Higher chance in later phases
      if (Math.random() < switchChance) {
        this._tryRandomAggroSwitch(gameState);
        this._aggroSwitchTimer = 0;
      }
    }

    // Pattern cooldown
    if (this.patternCooldown > 0) {
      this.patternCooldown -= dt * spdMult;
    }

    // If executing a pattern, continue it
    if (this.currentPattern) {
      this._updatePattern(dt * spdMult, gameState);
      return;
    }

    // Check phase transitions
    this._checkPhases(gameState);

    // Try to start a new pattern
    if (this.patternCooldown <= 0) {
      const pattern = this._selectPattern(gameState);
      if (pattern) {
        this._startPattern(pattern, gameState);
        return;
      }
    }

    // Movement AI: pause-based (not constant chase)
    const currentTarget = gameState.getPlayer(this.targetId) || aggroTarget;
    if (currentTarget && currentTarget.alive) {
      this._updateMovementAI(currentTarget, dt, spdMult, gameState);
      this._autoAttack(dt * spdMult, currentTarget, gameState);
    }
  }

  // ── Random Aggro Switch ──
  _tryRandomAggroSwitch(gameState) {
    const alivePlayers = gameState.getAlivePlayers();
    if (alivePlayers.length <= 1) return;

    // Filter to non-tank DPS players
    const dpsPlayers = alivePlayers.filter(p => p.class !== 'tank' && p.class !== 'healer');
    if (dpsPlayers.length === 0) return;

    // Pick random DPS
    const target = dpsPlayers[Math.floor(Math.random() * dpsPlayers.length)];

    // Leap to that player
    this._startLeap(target, gameState);
  }

  _startLeap(target, gameState) {
    this._moveState = 'leaping';
    this._leapTarget = { x: target.x, y: target.y };
    this._leapStartPos = { x: this.x, y: this.y };
    this._leapTimer = 0;
    this._leapDuration = 0.5;
    this.targetId = target.id;

    gameState.addEvent({
      type: 'boss_message',
      text: `Manaya cible ${target.username || target.id.substring(0, 5)} !`,
    });
  }

  // ── Pause-Based Movement AI ──
  _updateMovementAI(target, dt, spdMult, gameState) {
    // Handle leap (jump to DPS)
    if (this._moveState === 'leaping') {
      this._leapTimer += dt;
      const t = Math.min(1, this._leapTimer / this._leapDuration);

      // Ease-out interpolation
      const ease = 1 - Math.pow(1 - t, 2);
      this.x = this._leapStartPos.x + (this._leapTarget.x - this._leapStartPos.x) * ease;
      this.y = this._leapStartPos.y + (this._leapTarget.y - this._leapStartPos.y) * ease;

      // Face target
      this.rotation = Math.atan2(this._leapTarget.y - this.y, this._leapTarget.x - this.x);

      if (t >= 1) {
        // Land — pause after leap
        this._moveState = 'pausing';
        this._moveTimer = 0;
        this._pauseDuration = 1.0 + Math.random() * 1.5; // 1-2.5s pause after leap
      }
      return;
    }

    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Face the target
    this.rotation = Math.atan2(dy, dx);

    switch (this._moveState) {
      case 'idle':
        // Decide: walk or pause
        if (dist > 120) {
          // Too far, start walking
          this._moveState = 'walking';
          this._moveTimer = 0;
          this._walkDuration = 1.5 + Math.random() * 2.0; // Walk 1.5-3.5s
        } else {
          // Close enough, pause
          this._moveState = 'pausing';
          this._moveTimer = 0;
          this._pauseDuration = 0.8 + Math.random() * 1.5; // Pause 0.8-2.3s
        }
        break;

      case 'walking':
        this._moveTimer += dt;
        // Move towards target
        if (dist > 80) {
          const speed = (this.spd * 0.8) * spdMult;
          const moveX = (dx / dist) * speed * dt;
          const moveY = (dy / dist) * speed * dt;
          this.x += moveX;
          this.y += moveY;
        }
        // Stop walking after duration or if close enough
        if (this._moveTimer >= this._walkDuration || dist <= 80) {
          this._moveState = 'pausing';
          this._moveTimer = 0;
          this._pauseDuration = 0.6 + Math.random() * 1.2; // Pause 0.6-1.8s
        }
        break;

      case 'pausing':
        this._moveTimer += dt;
        if (this._moveTimer >= this._pauseDuration) {
          // If target is far, walk. If close, maybe pause again or idle.
          if (dist > 200) {
            this._moveState = 'walking';
            this._moveTimer = 0;
            this._walkDuration = 1.0 + Math.random() * 2.0;
          } else {
            this._moveState = 'idle';
            this._moveTimer = 0;
          }
        }
        break;

      default:
        this._moveState = 'idle';
        this._moveTimer = 0;
    }
  }

  takeDamage(rawDamage) {
    if (!this.alive) return 0;

    // Shield absorbs damage first
    if (this.shielded) {
      this.shieldHp -= rawDamage;
      if (this.shieldHp <= 0) {
        this.shielded = false;
        this.shieldHp = 0;
        const overflow = -this.shieldHp;
        return overflow > 0 ? this._applyDamage(overflow) : 0;
      }
      return 0; // All absorbed by shield
    }

    return this._applyDamage(rawDamage);
  }

  _applyDamage(damage) {
    const applied = Math.max(1, Math.round(damage));
    this.hp -= applied;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
    return applied;
  }

  enterEnrage() {
    this.enraged = true;
    this._autoAttackInterval *= 0.5; // Attack twice as fast
    console.log(`[Boss] ${this.name} is ENRAGED!`);
  }

  activateShield(shieldHp) {
    this.shielded = true;
    this.shieldHp = shieldHp;
    this.shieldMaxHp = shieldHp;
  }

  addRageStack() {
    this.rageBuff = Math.min(3, this.rageBuff + 1);
    this.rageBuffTimer = 30; // 30s duration per stack
    return this.rageBuff;
  }

  dispelRage() {
    const had = this.rageBuff;
    this.rageBuff = 0;
    this.rageBuffTimer = 0;
    return had;
  }

  addSpeedStack() {
    this.speedStacks++;
  }

  // ── Pattern System ──

  _selectPattern(gameState) {
    const available = this.patterns.filter(p => {
      if (p.phase && p.phase > this.phase) return false;
      if (p._cooldownTimer > 0) return false;
      if (p.condition && !p.condition(this, gameState)) return false;
      return true;
    });

    if (available.length === 0) return null;

    // Weighted random selection
    const totalWeight = available.reduce((sum, p) => sum + (p.weight || 1), 0);
    let roll = Math.random() * totalWeight;
    for (const p of available) {
      roll -= (p.weight || 1);
      if (roll <= 0) return p;
    }
    return available[available.length - 1];
  }

  _startPattern(pattern, gameState) {
    this.currentPattern = {
      pattern,
      timer: 0,
      state: 'telegraph', // telegraph → cast → execute → recovery
      data: {},
    };

    this.casting = {
      name: pattern.name,
      progress: 0,
      duration: (pattern.telegraphTime || 0) + (pattern.castTime || 0),
    };

    // Call pattern's onStart if exists
    if (pattern.onStart) {
      pattern.onStart(this, gameState, this.currentPattern.data);
    }
  }

  _updatePattern(dt, gameState) {
    const cp = this.currentPattern;
    if (!cp) return;

    const p = cp.pattern;
    cp.timer += dt;

    // Update casting progress for UI
    if (this.casting) {
      this.casting.progress = cp.timer;
    }

    switch (cp.state) {
      case 'telegraph':
        if (p.onTelegraph) p.onTelegraph(this, gameState, cp.data, dt);
        if (cp.timer >= (p.telegraphTime || 0)) {
          cp.state = 'cast';
          cp.timer = 0;
        }
        break;

      case 'cast':
        if (p.onCast) p.onCast(this, gameState, cp.data, dt);
        if (cp.timer >= (p.castTime || 0)) {
          cp.state = 'execute';
          cp.timer = 0;
          if (p.onExecute) p.onExecute(this, gameState, cp.data);
        }
        break;

      case 'execute':
        if (p.onUpdate) {
          const done = p.onUpdate(this, gameState, cp.data, dt);
          if (done) {
            cp.state = 'recovery';
            cp.timer = 0;
          }
        } else {
          cp.state = 'recovery';
          cp.timer = 0;
        }
        break;

      case 'recovery':
        if (cp.timer >= (p.recoveryTime || 0.5)) {
          // Pattern complete
          p._cooldownTimer = p.cooldown || 5;
          this.patternCooldown = p.globalCooldown || 1.5;
          this.currentPattern = null;
          this.casting = null;
        }
        break;
    }
  }

  _checkPhases(gameState) {
    const hpPercent = (this.hp / this.maxHp) * 100;

    for (const threshold of this.phaseThresholds) {
      if (hpPercent <= threshold.hpPercent && !this._phaseChecked.has(threshold.phase)) {
        this._phaseChecked.add(threshold.phase);
        this.phase = threshold.phase;
        if (threshold.onEnter) {
          threshold.onEnter(this, gameState);
        }
        gameState.addEvent({
          type: 'phase_change',
          phase: threshold.phase,
          bossHpPercent: hpPercent,
        });
        console.log(`[Boss] ${this.name} entered phase ${threshold.phase} (${hpPercent.toFixed(1)}% HP)`);
      }
    }
  }

  // ── Movement (legacy — now handled by _updateMovementAI) ──

  _moveTowards(target, dt, spdMult) {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    this.rotation = Math.atan2(dy, dx);
    const desiredRange = 80;
    if (dist > desiredRange) {
      const speed = (this.spd * 0.8) * spdMult;
      this.x += (dx / dist) * speed * dt;
      this.y += (dy / dist) * speed * dt;
    }
  }

  _autoAttack(dt, target, gameState) {
    this._autoAttackTimer -= dt;
    if (this._autoAttackTimer <= 0) {
      this._autoAttackTimer = this._autoAttackInterval;

      // Basic melee attack on aggro target
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 120) {
        const dmgMult = (this.enraged ? BOSS_CFG.ENRAGE_DMG_MULT : 1.0) * (this.rageBuff >= 3 ? 3.0 : 1.0);
        const damage = this.atk * 0.8 * dmgMult;
        const actual = target.takeDamage(damage, this);

        if (actual > 0) {
          gameState.addEvent({
            type: 'damage',
            source: this.id,
            target: target.id,
            amount: actual,
            skill: 'Auto Attack',
          });
        }
      }
    }
  }

  // tickPatternCooldowns is now handled inside update() with speed multiplier
}
