import { BossBase } from './BossBase.js';
import { DIFFICULTY, COMBAT, BOSS as BOSS_CFG, ADDS, ARENA } from '../config.js';
import { Add, ADD_TEMPLATES } from '../entities/Add.js';

// ── Manaya Boss Definition ──
// Full Tera-inspired mechanics: Donut, Death Ball, Dive, Poison, Debuff Rotation, etc.

const MANAYA_BASE_STATS = {
  hp: 15000000,  // 15M HP = ~150 bars of 100K each
  atk: 450,
  def: 50,       // Low DEF so player damage feels impactful
  spd: 140,
};

export const MANAYA_HP_BARS = 150;

export class Manaya extends BossBase {
  constructor(difficulty, x, y) {
    const diff = DIFFICULTY[difficulty] || DIFFICULTY.NORMAL;
    const stats = {
      hp: Math.floor(MANAYA_BASE_STATS.hp * diff.hpMult),
      atk: Math.floor(MANAYA_BASE_STATS.atk * diff.dmgMult),
      def: MANAYA_BASE_STATS.def,
      spd: Math.floor(MANAYA_BASE_STATS.spd * diff.spdMult),
    };

    super('Manaya', stats, x, y);
    this.difficulty = difficulty;
    this.diffMult = diff;

    // ── Phase Thresholds ──
    this.phaseThresholds = [
      { hpPercent: 90, phase: 2, onEnter: (boss, gs) => this._onPhase2(gs) },
      { hpPercent: 75, phase: 3, onEnter: (boss, gs) => this._onPhase3(gs) },
      { hpPercent: 50, phase: 4, onEnter: (boss, gs) => this._onPhase4(gs) },
      { hpPercent: 30, phase: 5, onEnter: (boss, gs) => this._onPhase5(gs) },
      { hpPercent: 20, phase: 6, onEnter: (boss, gs) => this._onPhase6(gs) },
    ];

    // ── All Patterns ──
    this.patterns = [
      // Phase 1+ (100-90%)
      this._patternCone(),
      this._patternTailSweep(),
      this._patternClaw(),
      this._patternBreath(),

      // Phase 2+ (90-75%) — Donut + Poison
      this._patternDonut(),
      this._patternPoisonCircle(),

      // Phase 3+ (75-50%) — Death Ball + Dive + Waves
      this._patternDeathBall(),
      this._patternDive(),
      this._patternWaves(),

      // Phase 4+ (50-30%) — Laser + Double Circle
      this._patternLaser(),
      this._patternDoubleCircle(),

      // Special mechanics (condition-triggered)
      this._patternDebuffRotation(),
      this._patternShield(),
      this._patternRageBuff(),
    ];

    for (const p of this.patterns) {
      p._cooldownTimer = 0;
    }

    // Mechanic tracking
    this._shieldPhaseDone = false;
    this._debuffRotationCount = 0;
    this._debuffRotationTimer = 0;  // Counts up, triggers every ~90s
    this._lastDebuffHp = 100;
    this._speedStacksGiven = new Set();
  }

  // ──────────────────────────
  // Phase Transitions
  // ──────────────────────────

  _onPhase2(gs) {
    gs.addEvent({ type: 'boss_message', text: 'Manaya libère son énergie corrompue...' });
    this._debuffRotationTimer = 80;
    // Spawn 1 minion
    this._spawnAdds(gs, [{ type: 'minion' }]);
  }

  _onPhase3(gs) {
    gs.addEvent({ type: 'boss_message', text: 'Manaya entre dans une rage froide...' });
    // Spawn 2 minions
    this._spawnAdds(gs, [{ type: 'minion' }, { type: 'minion' }]);
  }

  _onPhase4(gs) {
    gs.addEvent({ type: 'boss_message', text: '⚡ Manaya gagne en vitesse !' });
    this.addSpeedStack();
    // Spawn 2 minions + 1 elite
    this._spawnAdds(gs, [{ type: 'minion' }, { type: 'minion' }, { type: 'elite' }]);
  }

  _onPhase5(gs) {
    gs.addEvent({ type: 'boss_message', text: '⚡⚡ Manaya devient plus rapide !' });
    this.addSpeedStack();
    // Spawn 1 elite + 1 caster
    this._spawnAdds(gs, [{ type: 'elite' }, { type: 'caster' }]);
  }

  _onPhase6(gs) {
    gs.addEvent({ type: 'boss_message', text: '⚡⚡⚡ Manaya est incontrôlable !' });
    this.addSpeedStack();
    // Spawn 3 minions + 1 elite
    this._spawnAdds(gs, [{ type: 'minion' }, { type: 'minion' }, { type: 'minion' }, { type: 'elite' }]);
  }

  _spawnAdds(gs, addDefs) {
    const diffMult = this.diffMult?.dmgMult || 1.0;
    const maxAdds = ADDS?.MAX_ADDS || 8;

    for (const def of addDefs) {
      if (gs.getAliveAdds().length >= maxAdds) break;

      const template = ADD_TEMPLATES[def.type](diffMult);
      // Spawn around boss in random positions
      const angle = Math.random() * Math.PI * 2;
      const dist = (ADDS?.SPAWN_OFFSET || 200) + Math.random() * 100;
      const sx = Math.max(40, Math.min(ARENA.WIDTH - 40, this.x + Math.cos(angle) * dist));
      const sy = Math.max(40, Math.min(ARENA.HEIGHT - 40, this.y + Math.sin(angle) * dist));

      const add = new Add(def.type, sx, sy, template);
      gs.addAdd(add);

      gs.addEvent({
        type: 'add_spawn',
        addId: add.id,
        addType: add.type,
        name: add.name,
        x: Math.round(sx),
        y: Math.round(sy),
      });
    }
  }

  // Override update to add debuff rotation timer
  update(dt, gameState) {
    // Tick debuff rotation timer
    if (this.phase >= 2 && this.alive) {
      this._debuffRotationTimer += dt;
    }
    super.update(dt, gameState);
  }

  // ──────────────────────────
  // PATTERN: Frontal Cone
  // ──────────────────────────
  _patternCone() {
    return {
      name: 'Souffle Frontal',
      phase: 1, weight: 3, cooldown: 4, globalCooldown: 1.5,
      telegraphTime: 0.8, castTime: 0.3, recoveryTime: 0.5,

      onStart: (boss, gs, data) => {
        const target = gs.getHighestAggroPlayer();
        data.angle = target ? Math.atan2(target.y - boss.y, target.x - boss.x) : boss.rotation;
        gs.addAoeZone({
          id: `cone_${Date.now()}`, type: 'cone_telegraph',
          x: boss.x, y: boss.y, radius: 220, angle: data.angle, coneAngle: Math.PI / 2,
          ttl: 1.1, maxTtl: 1.1, active: false, source: boss.id,
        });
      },

      onExecute: (boss, gs, data) => {
        const dmg = boss.atk * 2.0;
        for (const player of gs.getAlivePlayers()) {
          if (this._isInCone(boss, player, data.angle, 220, Math.PI / 2)) {
            const actual = player.takeDamage(dmg, boss);
            if (actual > 0) {
              gs.addEvent({ type: 'damage', source: boss.id, target: player.id, amount: actual, skill: 'Souffle Frontal' });
            }
          }
        }
      },
    };
  }

  // ──────────────────────────
  // PATTERN: Tail Sweep
  // ──────────────────────────
  _patternTailSweep() {
    return {
      name: 'Balayage de Queue',
      phase: 1, weight: 2, cooldown: 6, globalCooldown: 1.5,
      telegraphTime: 0.6, castTime: 0.2, recoveryTime: 0.4,

      onStart: (boss, gs, data) => {
        data.angle = boss.rotation + Math.PI;
        gs.addAoeZone({
          id: `tail_${Date.now()}`, type: 'cone_telegraph',
          x: boss.x, y: boss.y, radius: 200, angle: data.angle, coneAngle: Math.PI * 0.6,
          ttl: 0.8, maxTtl: 0.8, active: false, source: boss.id,
        });
      },

      onExecute: (boss, gs, data) => {
        const dmg = boss.atk * 2.5;
        for (const player of gs.getAlivePlayers()) {
          if (this._isInCone(boss, player, data.angle, 200, Math.PI * 0.6)) {
            const actual = player.takeDamage(dmg, boss);
            if (actual > 0) {
              gs.addEvent({ type: 'damage', source: boss.id, target: player.id, amount: actual, skill: 'Balayage de Queue' });
            }
          }
        }
      },
    };
  }

  // ──────────────────────────
  // PATTERN: Quick Claw
  // ──────────────────────────
  _patternClaw() {
    return {
      name: 'Griffe Rapide',
      phase: 1, weight: 4, cooldown: 2, globalCooldown: 0.8,
      telegraphTime: 0.3, castTime: 0.15, recoveryTime: 0.3,

      onExecute: (boss, gs) => {
        const target = gs.getHighestAggroPlayer();
        if (!target) return;
        const dist = Math.hypot(target.x - boss.x, target.y - boss.y);
        if (dist > 150) return;
        const dmg = boss.atk * 1.5;
        const actual = target.takeDamage(dmg, boss);
        if (actual > 0) {
          gs.addEvent({ type: 'damage', source: boss.id, target: target.id, amount: actual, skill: 'Griffe' });
        }
      },
    };
  }

  // ──────────────────────────
  // PATTERN: Breath (sustained frontal cone, multi-tick)
  // Wide cone, long range, deals damage over 2s with 4 ticks
  // ──────────────────────────
  _patternBreath() {
    return {
      name: 'Souffle Corrompu',
      phase: 1, weight: 2, cooldown: 8, globalCooldown: 2.0,
      telegraphTime: 1.2, castTime: 0, recoveryTime: 0.8,

      onStart: (boss, gs, data) => {
        const target = gs.getHighestAggroPlayer();
        data.angle = target ? Math.atan2(target.y - boss.y, target.x - boss.x) : boss.rotation;
        data.range = 280;
        data.coneAngle = Math.PI * 0.7; // ~126 degrees wide cone
        data.duration = 2.0;
        data.elapsed = 0;
        data.tickInterval = 0.5;
        data.tickTimer = 0;
        data.breathStarted = false;

        // Telegraph
        gs.addAoeZone({
          id: `breath_tel_${Date.now()}`, type: 'cone_telegraph',
          x: boss.x, y: boss.y, radius: data.range, angle: data.angle, coneAngle: data.coneAngle,
          ttl: 1.2, maxTtl: 1.2, active: false, source: boss.id,
        });
        gs.addEvent({ type: 'boss_message', text: '🔥 Souffle Corrompu !' });
      },

      onExecute: (boss, gs, data) => {
        data.breathStarted = true;
        data.elapsed = 0;
        data.tickTimer = 0;

        // Active breath zone (visual)
        data.breathZoneId = `breath_active_${Date.now()}`;
        gs.addAoeZone({
          id: data.breathZoneId, type: 'cone_telegraph',
          x: boss.x, y: boss.y, radius: data.range, angle: data.angle, coneAngle: data.coneAngle,
          ttl: data.duration + 0.5, maxTtl: data.duration + 0.5, active: true, source: boss.id,
        });
      },

      onUpdate: (boss, gs, data, dt) => {
        if (!data.breathStarted) return true;
        data.elapsed += dt;
        data.tickTimer += dt;

        // Update zone position to follow boss
        const zone = gs.aoeZones.find(z => z.id === data.breathZoneId);
        if (zone) {
          zone.x = boss.x;
          zone.y = boss.y;
          zone.angle = data.angle;
        }

        // Tick damage every 0.5s
        if (data.tickTimer >= data.tickInterval) {
          data.tickTimer -= data.tickInterval;

          for (const player of gs.getAlivePlayers()) {
            if (this._isInCone(boss, player, data.angle, data.range, data.coneAngle)) {
              const dmg = boss.atk * 2.0;
              const actual = player.takeDamage(dmg, boss);
              if (actual > 0) {
                gs.addEvent({ type: 'damage', source: boss.id, target: player.id, amount: actual, skill: 'Souffle Corrompu' });
              }
            }
          }
        }

        if (data.elapsed >= data.duration) {
          if (zone) zone.ttl = 0.2; // Fade out quickly
          return true; // Done
        }
        return false;
      },
    };
  }

  // ──────────────────────────
  // PATTERN: Donut AoE → Outer Expansion + Laser if close
  // Phase 1: Orange ring (stay close or very far)
  // Phase 2: Larger outer ring (stay close or dodge back in) + laser punishes close range
  // ──────────────────────────
  _patternDonut() {
    return {
      name: 'Anneau Destructeur',
      phase: 2, weight: 3, cooldown: 12, globalCooldown: 2.5,
      telegraphTime: 1.5, castTime: 0.3, recoveryTime: 0.8,

      onStart: (boss, gs, data) => {
        data.innerSafe = 120;  // Safe if within 120px of boss
        data.ringInner = 130;  // Ring starts at 130
        data.ringOuter = 350;  // Ring ends at 350
        data.outerSafe = 360;  // Safe if beyond 360
        data.phase2 = false;   // Second ring not yet triggered
        data.phase2Timer = 0;
        data.phase2Done = false;
        // Inner safe zone telegraph (green)
        gs.addAoeZone({
          id: `donut_safe_${Date.now()}`, type: 'donut_safe',
          x: boss.x, y: boss.y, radius: data.innerSafe,
          ttl: 1.8, maxTtl: 1.8, active: false, source: boss.id,
        });
        // Danger ring telegraph
        gs.addAoeZone({
          id: `donut_ring_${Date.now()}`, type: 'donut_telegraph',
          x: boss.x, y: boss.y, radius: data.ringOuter, innerRadius: data.ringInner,
          ttl: 1.8, maxTtl: 1.8, active: false, source: boss.id,
        });
        gs.addEvent({ type: 'boss_message', text: '⚠️ Anneau Destructeur - Éloignez-vous !' });
      },

      onExecute: (boss, gs, data) => {
        const soloMult = gs.playerCount <= 1 ? (BOSS_CFG.SOLO_MECHANIC_MULT || 0.4) : 1.0;
        for (const player of gs.getAlivePlayers()) {
          const dist = Math.hypot(player.x - boss.x, player.y - boss.y);
          // Hit if in the ring zone (not inner safe, not outer safe)
          if (dist > data.innerSafe && dist < data.outerSafe) {
            const dmg = boss.atk * 5.0 * soloMult;
            const actual = player.takeDamage(dmg, boss);
            if (actual > 0) {
              gs.addEvent({ type: 'damage', source: boss.id, target: player.id, amount: actual, skill: 'Anneau Destructeur' });
            }
          }
        }
        // Visual explosion ring
        gs.addAoeZone({
          id: `donut_exp_${Date.now()}`, type: 'donut_explosion',
          x: boss.x, y: boss.y, radius: data.ringOuter, innerRadius: data.ringInner,
          ttl: 0.4, maxTtl: 0.4, active: true, source: boss.id,
        });
        // Trigger phase 2: outer ring + close-range laser
        data.phase2 = true;
        data.phase2Timer = 0;
        // Telegraph the outer ring (larger, further out)
        data.outerRingInner = 370;
        data.outerRingOuter = 550;
        gs.addAoeZone({
          id: `donut_outer_tel_${Date.now()}`, type: 'donut_telegraph',
          x: boss.x, y: boss.y, radius: data.outerRingOuter, innerRadius: data.outerRingInner,
          ttl: 1.5, maxTtl: 1.5, active: false, source: boss.id,
        });
        // Telegraph the inner laser danger zone (close = laser)
        gs.addAoeZone({
          id: `donut_laser_warn_${Date.now()}`, type: 'circle_telegraph',
          x: boss.x, y: boss.y, radius: 160,
          ttl: 1.5, maxTtl: 1.5, active: false, source: boss.id,
        });
        gs.addEvent({ type: 'boss_message', text: '⚠️ Deuxième anneau ! Ne restez pas près d\'elle !' });
      },

      onUpdate: (boss, gs, data, dt) => {
        if (!data.phase2) return true;
        data.phase2Timer += dt;

        // After 1.2s, outer ring detonates + laser on close targets
        if (data.phase2Timer >= 1.2 && !data.phase2Done) {
          data.phase2Done = true;
          const soloMult = gs.playerCount <= 1 ? (BOSS_CFG.SOLO_MECHANIC_MULT || 0.4) : 1.0;

          for (const player of gs.getAlivePlayers()) {
            const dist = Math.hypot(player.x - boss.x, player.y - boss.y);

            // Outer ring damage (370-550 range)
            if (dist >= data.outerRingInner && dist < data.outerRingOuter + player.radius) {
              const dmg = boss.atk * 5.0 * soloMult;
              const actual = player.takeDamage(dmg, boss);
              if (actual > 0) {
                gs.addEvent({ type: 'damage', source: boss.id, target: player.id, amount: actual, skill: 'Anneau Extérieur' });
              }
            }

            // Laser punishment for being too close (within 160px)
            if (dist < 160 + player.radius) {
              const dmg = boss.atk * 8.0 * soloMult;
              const actual = player.takeDamage(dmg, boss);
              if (actual > 0) {
                gs.addEvent({ type: 'damage', source: boss.id, target: player.id, amount: actual, skill: 'Laser Piège' });
              }
            }
          }

          // Visual explosions
          gs.addAoeZone({
            id: `donut_outer_exp_${Date.now()}`, type: 'donut_explosion',
            x: boss.x, y: boss.y, radius: data.outerRingOuter, innerRadius: data.outerRingInner,
            ttl: 0.4, maxTtl: 0.4, active: true, source: boss.id,
          });
          gs.addAoeZone({
            id: `donut_laser_exp_${Date.now()}`, type: 'circle_explosion',
            x: boss.x, y: boss.y, radius: 160,
            ttl: 0.4, maxTtl: 0.4, active: true, source: boss.id,
          });

          return true; // Done
        }

        return false; // Still waiting
      },
    };
  }

  // ──────────────────────────
  // PATTERN: Poison Circle (follows a player, then drops persistent cloud)
  // ──────────────────────────
  _patternPoisonCircle() {
    return {
      name: 'Cercle Empoisonné',
      phase: 2, weight: 2, cooldown: 10, globalCooldown: 2.0,
      telegraphTime: 0.5, castTime: 0, recoveryTime: 0.5,

      onStart: (boss, gs, data) => {
        // Pick random alive player
        const targets = gs.getAlivePlayers();
        data.target = targets[Math.floor(Math.random() * targets.length)];
        data.followTime = 3.0;
        data.elapsed = 0;
        data.zoneId = `pcirc_${Date.now()}`;
        if (data.target) {
          gs.addAoeZone({
            id: data.zoneId, type: 'poison_follow',
            x: data.target.x, y: data.target.y, radius: 100,
            ttl: 4.0, maxTtl: 4.0, active: false, source: boss.id,
          });
          gs.addEvent({ type: 'boss_message', text: '☠️ Cercle Poison sur ' + (data.target.username || data.target.id.substring(0, 5)) + ' !' });
        }
      },

      onExecute: (boss, gs, data) => {
        // Start following
      },

      onUpdate: (boss, gs, data, dt) => {
        data.elapsed += dt;
        const zone = gs.aoeZones.find(z => z.id === data.zoneId);
        if (zone && data.target && data.target.alive && data.elapsed < data.followTime) {
          // Follow the target
          zone.x = data.target.x;
          zone.y = data.target.y;
          return false;
        }

        // After followTime: drop persistent poison cloud
        if (zone) {
          // Remove following zone
          zone.ttl = 0;
        }

        // Place persistent poison cloud at last position
        const px = data.target?.alive ? data.target.x : boss.x;
        const py = data.target?.alive ? data.target.y : boss.y;
        gs.addAoeZone({
          id: `pcloud_${Date.now()}`, type: 'poison_cloud',
          x: px, y: py, radius: 110,
          ttl: 15.0, maxTtl: 15.0, active: true, source: boss.id,
          _poisonTick: 0, _poisonInterval: 2.0,
        });

        return true;
      },
    };
  }

  // ──────────────────────────
  // PATTERN: Death Ball (boss curls up → explosion)
  // ──────────────────────────
  _patternDeathBall() {
    return {
      name: 'Sphère de Mort',
      phase: 3, weight: 2, cooldown: 20, globalCooldown: 3.0,
      telegraphTime: 2.0, castTime: 0.5, recoveryTime: 1.5,

      onStart: (boss, gs) => {
        gs.addAoeZone({
          id: `deathball_${Date.now()}`, type: 'circle_telegraph',
          x: boss.x, y: boss.y, radius: 250,
          ttl: 2.5, maxTtl: 2.5, active: false, source: boss.id,
        });
        gs.addEvent({ type: 'boss_message', text: '💀 SPHÈRE DE MORT - Esquivez !' });
      },

      onExecute: (boss, gs) => {
        const soloMult = gs.playerCount <= 1 ? (BOSS_CFG.SOLO_MECHANIC_MULT || 0.4) : 1.0;
        // Massive explosion around boss
        for (const player of gs.getAlivePlayers()) {
          const dist = Math.hypot(player.x - boss.x, player.y - boss.y);
          if (dist < 250 + player.radius) {
            const dmg = 99999 * soloMult; // ONE SHOT
            const actual = player.takeDamage(dmg, boss);
            if (actual > 0) {
              gs.addEvent({ type: 'damage', source: boss.id, target: player.id, amount: actual, skill: 'Sphère de Mort' });
            }
            // Apply poison stacks
            player.addBuff({
              type: 'poison', stacks: 1, dur: COMBAT.POISON_DURATION,
              tickInterval: COMBAT.POISON_TICK_INTERVAL, damage: COMBAT.POISON_BASE_DAMAGE * 2,
              stackable: true, maxStacks: 10, source: 'manaya',
            });
          }
        }
        // Visual explosion
        gs.addAoeZone({
          id: `deathball_exp_${Date.now()}`, type: 'circle_explosion',
          x: boss.x, y: boss.y, radius: 250,
          ttl: 0.5, maxTtl: 0.5, active: true, source: boss.id,
        });
      },
    };
  }

  // ──────────────────────────
  // PATTERN: Dive (charge at player)
  // ──────────────────────────
  _patternDive() {
    return {
      name: 'Plongeon Dévastateur',
      phase: 3, weight: 2, cooldown: 15, globalCooldown: 2.5,
      telegraphTime: 1.5, castTime: 0, recoveryTime: 1.0,

      onStart: (boss, gs, data) => {
        // Mark a random player
        const targets = gs.getAlivePlayers();
        data.target = targets[Math.floor(Math.random() * targets.length)];
        if (data.target) {
          data.targetPos = { x: data.target.x, y: data.target.y };
          data.startPos = { x: boss.x, y: boss.y };
          data.diving = false;
          data.diveTime = 0;
          data.diveDuration = 0.4; // Very fast charge
          gs.addEvent({ type: 'boss_message', text: '🦅 Manaya cible ' + (data.target.username || data.target.id.substring(0, 5)) + ' !' });
          // Telegraph line from boss to target
          gs.addAoeZone({
            id: `dive_tel_${Date.now()}`, type: 'dive_telegraph',
            x: data.targetPos.x, y: data.targetPos.y, radius: 80,
            ttl: 1.5, maxTtl: 1.5, active: false, source: boss.id,
          });
        }
      },

      onExecute: (boss, gs, data) => {
        if (!data.target) return;
        // Update target pos to where they are NOW
        if (data.target.alive) {
          data.targetPos = { x: data.target.x, y: data.target.y };
        }
        data.diving = true;
        data.diveTime = 0;
      },

      onUpdate: (boss, gs, data, dt) => {
        if (!data.diving || !data.target) return true;
        data.diveTime += dt;
        const t = Math.min(1, data.diveTime / data.diveDuration);

        // Lerp boss position
        boss.x = data.startPos.x + (data.targetPos.x - data.startPos.x) * t;
        boss.y = data.startPos.y + (data.targetPos.y - data.startPos.y) * t;

        // At landing, deal damage
        if (t >= 1) {
          const soloMult = gs.playerCount <= 1 ? (BOSS_CFG.SOLO_MECHANIC_MULT || 0.4) : 1.0;
          for (const player of gs.getAlivePlayers()) {
            const dist = Math.hypot(player.x - boss.x, player.y - boss.y);
            if (dist < 100 + player.radius) {
              const dmg = boss.atk * 4.0 * soloMult;
              const actual = player.takeDamage(dmg, boss);
              if (actual > 0) {
                gs.addEvent({ type: 'damage', source: boss.id, target: player.id, amount: actual, skill: 'Plongeon' });
              }
            }
          }
          // Impact zone
          gs.addAoeZone({
            id: `dive_impact_${Date.now()}`, type: 'circle_explosion',
            x: boss.x, y: boss.y, radius: 100,
            ttl: 0.3, maxTtl: 0.3, active: true, source: boss.id,
          });
          return true;
        }
        return false;
      },
    };
  }

  // ──────────────────────────
  // PATTERN: Waves (directional projectiles)
  // ──────────────────────────
  _patternWaves() {
    return {
      name: 'Vagues d\'Énergie',
      phase: 3, weight: 2, cooldown: 12, globalCooldown: 2.0,
      telegraphTime: 1.0, castTime: 0.3, recoveryTime: 0.5,

      onStart: (boss, gs, data) => {
        const target = gs.getHighestAggroPlayer();
        data.baseAngle = target ? Math.atan2(target.y - boss.y, target.x - boss.x) : boss.rotation;
        data.waveCount = 5 + Math.floor(boss.phase / 2); // More waves in later phases
        data.spread = Math.PI / 3; // 60 degree spread
        gs.addEvent({ type: 'boss_message', text: '🌊 Vagues d\'Énergie !' });
      },

      onExecute: (boss, gs, data) => {
        // Spawn wave projectiles in a spread
        for (let i = 0; i < data.waveCount; i++) {
          const offset = -data.spread / 2 + (data.spread / (data.waveCount - 1)) * i;
          const angle = data.baseAngle + offset;
          gs.addProjectile({
            id: `wave_${Date.now()}_${i}`,
            type: 'boss_projectile',
            owner: boss.id,
            x: boss.x + Math.cos(angle) * 60,
            y: boss.y + Math.sin(angle) * 60,
            vx: Math.cos(angle) * 350,
            vy: Math.sin(angle) * 350,
            radius: 15,
            angle,
            damage: boss.atk * 2.5,
            alive: true,
            ttl: 3.0,
          });
        }
      },
    };
  }

  // ──────────────────────────
  // PATTERN: Rotating Laser
  // ──────────────────────────
  _patternLaser() {
    return {
      name: 'Laser Dévastateur',
      phase: 4, weight: 2, cooldown: 18, globalCooldown: 3.0,
      telegraphTime: 1.5, castTime: 0.5, recoveryTime: 1.0,

      onStart: (boss, gs, data) => {
        const target = gs.getHighestAggroPlayer();
        data.startAngle = target ? Math.atan2(target.y - boss.y, target.x - boss.x) : boss.rotation;
        data.rotDir = Math.random() > 0.5 ? 1 : -1;
        data.angle = data.startAngle;
        data.elapsed = 0;
        data.duration = 3.5;

        gs.addAoeZone({
          id: `laser_tel_${Date.now()}`, type: 'laser_telegraph',
          x: boss.x, y: boss.y, radius: 800, angle: data.startAngle, lineWidth: 30,
          ttl: 2.0, maxTtl: 2.0, active: false, source: boss.id,
        });
        gs.addEvent({ type: 'boss_message', text: '⚠️ Laser Rotatif !' });
      },

      onExecute: (boss, gs, data) => {
        data.laserZoneId = `laser_${Date.now()}`;
        gs.addAoeZone({
          id: data.laserZoneId, type: 'laser',
          x: boss.x, y: boss.y, radius: 800, angle: data.angle, lineWidth: 60,
          ttl: data.duration + 0.5, maxTtl: data.duration + 0.5, active: true,
          source: boss.id, damagePerTick: boss.atk * 8.0, // Near one-shot per tick
          tickInterval: 0.2, _tickTimer: 0,
        });
      },

      onUpdate: (boss, gs, data, dt) => {
        data.elapsed += dt;
        data.angle += data.rotDir * (Math.PI / 2.5) * dt; // ~72 deg/sec

        const zone = gs.aoeZones.find(z => z.id === data.laserZoneId);
        if (zone) {
          zone.angle = data.angle;
          zone.x = boss.x;
          zone.y = boss.y;
        }

        return data.elapsed >= data.duration;
      },
    };
  }

  // ──────────────────────────
  // PATTERN: Debuff Rotation (Tera mechanic)
  // 3 colored zones, each player assigned a color
  // ──────────────────────────
  _patternDebuffRotation() {
    return {
      name: 'Jugement de Manaya',
      phase: 2, weight: 0, cooldown: 30, globalCooldown: 5.0,
      telegraphTime: 4.0, castTime: 1.0, recoveryTime: 2.0,

      condition: (boss, gs) => {
        return boss._debuffRotationTimer >= 90 && boss.phase >= 2;
      },

      onStart: (boss, gs, data) => {
        boss._debuffRotationTimer = 0;
        boss._debuffRotationCount++;

        const colors = ['red', 'blue', 'green'];
        const players = gs.getAlivePlayers();
        data.markers = {};

        // Assign colors in rotation pattern
        for (let i = 0; i < players.length; i++) {
          const colorIdx = (i + boss._debuffRotationCount) % 3;
          data.markers[players[i].id] = colors[colorIdx];
          gs.addEvent({
            type: 'debuff_marker',
            target: players[i].id,
            color: colors[colorIdx],
          });
        }

        // Zone positions (triangle around boss)
        const zoneRadius = 160;
        const zoneDist = 250;
        data.zones = {
          red:   { x: boss.x + Math.cos(-Math.PI/2) * zoneDist, y: boss.y + Math.sin(-Math.PI/2) * zoneDist, radius: zoneRadius },
          blue:  { x: boss.x + Math.cos(Math.PI/6) * zoneDist,  y: boss.y + Math.sin(Math.PI/6) * zoneDist,  radius: zoneRadius },
          green: { x: boss.x + Math.cos(5*Math.PI/6) * zoneDist, y: boss.y + Math.sin(5*Math.PI/6) * zoneDist, radius: zoneRadius },
        };

        for (const [color, zone] of Object.entries(data.zones)) {
          gs.addAoeZone({
            id: `judge_${color}_${Date.now()}`, type: `judgment_zone_${color}`,
            x: zone.x, y: zone.y, radius: zone.radius,
            ttl: 5.0, maxTtl: 5.0, active: false, source: boss.id,
          });
        }

        gs.addEvent({
          type: 'boss_message',
          text: '⚠️ JUGEMENT - Allez dans votre zone colorée ! ⚠️',
        });
      },

      onExecute: (boss, gs, data) => {
        const soloMult = gs.playerCount <= 1 ? (BOSS_CFG.SOLO_MECHANIC_MULT || 0.4) : 1.0;

        for (const player of gs.getAlivePlayers()) {
          const marker = data.markers[player.id];
          if (!marker) continue;

          const correctZone = data.zones[marker];
          const dist = Math.hypot(player.x - correctZone.x, player.y - correctZone.y);

          if (dist > correctZone.radius) {
            // WRONG ZONE
            const dmg = player.maxHp * (soloMult < 1 ? 0.6 : 10); // Solo: 60% HP, Group: oneshot
            player.takeDamage(dmg, boss);
            gs.addEvent({
              type: 'damage', source: boss.id, target: player.id,
              amount: Math.round(dmg), skill: 'Jugement - MAUVAISE ZONE', oneshot: soloMult >= 1,
            });
          } else {
            // Correct zone
            const dmg = boss.atk * 0.5;
            const actual = player.takeDamage(dmg, boss);
            gs.addEvent({ type: 'damage', source: boss.id, target: player.id, amount: actual, skill: 'Jugement OK' });
          }
        }
      },
    };
  }

  // ──────────────────────────
  // PATTERN: Shield Phase (once at ~40% HP)
  // ──────────────────────────
  _patternShield() {
    return {
      name: 'Bouclier d\'Énergie',
      phase: 3, weight: 0, cooldown: 999, globalCooldown: 3.0,
      telegraphTime: 1.5, castTime: 0, recoveryTime: 1.0,

      condition: (boss) => {
        const hpPct = (boss.hp / boss.maxHp) * 100;
        return hpPct <= 40 && !this._shieldPhaseDone;
      },

      onStart: (boss, gs, data) => {
        this._shieldPhaseDone = true;
        data.shieldTimer = 15;
        gs.addEvent({ type: 'boss_message', text: '🛡️ BOUCLIER - Détruisez-le en 15s !' });
      },

      onExecute: (boss, gs, data) => {
        const shieldHp = boss.maxHp * 0.12;
        boss.activateShield(shieldHp);
        gs.addEvent({ type: 'shield_activated', shieldHp: boss.shieldHp });
      },

      onUpdate: (boss, gs, data, dt) => {
        data.shieldTimer -= dt;

        if (!boss.shielded) {
          gs.addEvent({ type: 'boss_message', text: 'Bouclier brisé !' });
          return true;
        }

        if (data.shieldTimer <= 0) {
          gs.addEvent({ type: 'boss_message', text: '💀 BOUCLIER NON BRISÉ - WIPE !' });
          const soloMult = gs.playerCount <= 1 ? (BOSS_CFG.SOLO_MECHANIC_MULT || 0.4) : 1.0;
          for (const player of gs.getAlivePlayers()) {
            player.takeDamage(player.maxHp * (soloMult < 1 ? 0.8 : 10), boss);
          }
          boss.shielded = false;
          boss.shieldHp = 0;
          return true;
        }

        if (Math.floor(data.shieldTimer) !== Math.floor(data.shieldTimer + dt)) {
          gs.addEvent({ type: 'shield_timer', remaining: Math.ceil(data.shieldTimer) });
        }

        return false;
      },
    };
  }

  // ──────────────────────────
  // PATTERN: Rage Buff (dispellable by healer)
  // ──────────────────────────
  _patternRageBuff() {
    return {
      name: 'Invocation de Puissance',
      phase: 3, weight: 1, cooldown: 25, globalCooldown: 2.0,
      telegraphTime: 1.0, castTime: 0.5, recoveryTime: 0.5,

      condition: (boss) => {
        return boss.phase >= 3 && boss.rageBuff < 3;
      },

      onStart: (boss, gs) => {
        gs.addEvent({
          type: 'boss_message',
          text: '🔥 "Grands esprits, prêtez-moi votre pouvoir !" — Dispel rapidement !',
        });
      },

      onExecute: (boss, gs) => {
        const stacks = boss.addRageStack();
        gs.addEvent({
          type: 'boss_rage_stack',
          stacks,
          message: stacks >= 3 ? '💀 3 STACKS ! Dégâts ×3 pendant 30s !' : `Rage x${stacks}`,
        });
      },
    };
  }

  // ──────────────────────────
  // PATTERN: Double Circle AoE
  // Inner ring hits first, then outer ring hits second.
  // Safe: right at boss feet OR very far away.
  // ──────────────────────────
  _patternDoubleCircle() {
    return {
      name: 'Double Impact',
      phase: 4, weight: 2, cooldown: 16, globalCooldown: 2.5,
      telegraphTime: 1.5, castTime: 0, recoveryTime: 1.0,

      onStart: (boss, gs, data) => {
        data.innerRadius = 180;   // Inner circle radius
        data.outerInner = 200;    // Outer ring inner boundary
        data.outerRadius = 420;   // Outer ring outer boundary
        data.phase = 'telegraph';
        data.innerHit = false;
        data.outerHit = false;
        data.delay = 0;

        // Telegraph: inner circle (close to boss)
        gs.addAoeZone({
          id: `dbl_inner_tel_${Date.now()}`, type: 'circle_telegraph',
          x: boss.x, y: boss.y, radius: data.innerRadius,
          ttl: 2.0, maxTtl: 2.0, active: false, source: boss.id,
        });
        // Telegraph: outer ring (far from boss)
        gs.addAoeZone({
          id: `dbl_outer_tel_${Date.now()}`, type: 'donut_telegraph',
          x: boss.x, y: boss.y, radius: data.outerRadius, innerRadius: data.outerInner,
          ttl: 3.0, maxTtl: 3.0, active: false, source: boss.id,
        });

        gs.addEvent({ type: 'boss_message', text: '⚠️ DOUBLE IMPACT - Éloignez-vous puis rapprochez-vous !' });
      },

      onExecute: (boss, gs, data) => {
        // Inner circle hits FIRST
        const soloMult = gs.playerCount <= 1 ? (BOSS_CFG.SOLO_MECHANIC_MULT || 0.4) : 1.0;
        for (const player of gs.getAlivePlayers()) {
          const dist = Math.hypot(player.x - boss.x, player.y - boss.y);
          if (dist < data.innerRadius + player.radius) {
            const dmg = 99999 * soloMult; // ONE SHOT
            const actual = player.takeDamage(dmg, boss);
            if (actual > 0) {
              gs.addEvent({ type: 'damage', source: boss.id, target: player.id, amount: actual, skill: 'Double Impact (intérieur)' });
            }
          }
        }
        // Visual inner explosion
        gs.addAoeZone({
          id: `dbl_inner_exp_${Date.now()}`, type: 'circle_explosion',
          x: boss.x, y: boss.y, radius: data.innerRadius,
          ttl: 0.4, maxTtl: 0.4, active: true, source: boss.id,
        });
        data.innerHit = true;
        data.delay = 0;
      },

      onUpdate: (boss, gs, data, dt) => {
        if (!data.innerHit) return false;
        data.delay += dt;

        // After 1s delay, outer ring hits
        if (data.delay >= 1.0 && !data.outerHit) {
          data.outerHit = true;
          const soloMult = gs.playerCount <= 1 ? (BOSS_CFG.SOLO_MECHANIC_MULT || 0.4) : 1.0;
          for (const player of gs.getAlivePlayers()) {
            const dist = Math.hypot(player.x - boss.x, player.y - boss.y);
            // Hit if in outer ring (between outerInner and outerRadius)
            if (dist >= data.outerInner && dist < data.outerRadius + player.radius) {
              const dmg = 99999 * soloMult; // ONE SHOT
              const actual = player.takeDamage(dmg, boss);
              if (actual > 0) {
                gs.addEvent({ type: 'damage', source: boss.id, target: player.id, amount: actual, skill: 'Double Impact (extérieur)' });
              }
            }
          }
          // Visual outer explosion ring
          gs.addAoeZone({
            id: `dbl_outer_exp_${Date.now()}`, type: 'donut_explosion',
            x: boss.x, y: boss.y, radius: data.outerRadius, innerRadius: data.outerInner,
            ttl: 0.4, maxTtl: 0.4, active: true, source: boss.id,
          });
          return true;
        }
        return false;
      },
    };
  }

  // ── Utility ──

  _isInCone(boss, target, angle, range, coneAngle) {
    const dx = target.x - boss.x;
    const dy = target.y - boss.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > range + target.radius) return false;

    const angleToTarget = Math.atan2(dy, dx);
    let angleDiff = angleToTarget - angle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    return Math.abs(angleDiff) <= coneAngle / 2;
  }
}
