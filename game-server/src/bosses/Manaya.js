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

      // Phase 3+ (75-50%) — Death Ball + Menacing Wave + Dive + Waves + Leap Slam
      this._patternDeathBall(),
      this._patternMenacingWave(),
      this._patternDive(),
      this._patternWaves(),
      this._patternLeapSlam(),

      // Phase 3+ (75-50%) — Triple Laser (Tera iconic)
      this._patternTripleLaser(),

      // Phase 4+ (50-30%) — Laser + Double Circle
      this._patternLaser(),
      this._patternDoubleCircle(),

      // Special mechanics (condition-triggered)
      this._patternTripleDebuff(),
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
            const actual = player.takeTrueDamage(999999, boss); // TRUE ONESHOT (bypasses block/def)
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
  // PATTERN: Menacing Wave (Tera — boss curls into ball, fire ring expands)
  // Boss charges energy → expanding fire wave → ticks = death
  // ──────────────────────────
  _patternMenacingWave() {
    return {
      name: 'Vague Dévastatrice',
      phase: 3, weight: 2, cooldown: 30, globalCooldown: 4.0,
      telegraphTime: 3.5, castTime: 0.3, recoveryTime: 2.0,

      onStart: (boss, gs, data) => {
        data.chargeElapsed = 0;
        data.chargeDuration = 3.5; // 3.5s to run away
        data.waveElapsed = 0;
        data.waveDuration = 2.0; // fire ring expands over 2s
        data.maxRadius = 450; // max fire ring radius
        data.phase = 'charge'; // charge → wave → done
        data.lastBeep = 0;

        // Boss curls up — send event for client visual + sound
        gs.addEvent({ type: 'boss_curl', bossId: boss.id });
        gs.addEvent({ type: 'boss_message', text: '🔥 Manaya se met en boule... ÉLOIGNEZ-VOUS !' });

        // Telegraph: pulsing red circle showing max danger zone
        gs.addAoeZone({
          id: `mwave_tel_${Date.now()}`, type: 'menacing_wave_telegraph',
          x: boss.x, y: boss.y, radius: data.maxRadius,
          ttl: data.chargeDuration + 0.5, maxTtl: data.chargeDuration + 0.5,
          active: false, source: boss.id,
        });
      },

      onExecute: (boss, gs, data) => {
        data.phase = 'wave';
        data.waveElapsed = 0;

        // Create the expanding fire wave zone
        data.waveZoneId = `mwave_${Date.now()}`;
        gs.addAoeZone({
          id: data.waveZoneId, type: 'fire_wave',
          x: boss.x, y: boss.y,
          radius: 30, // starts small
          maxRadius: data.maxRadius,
          ttl: data.waveDuration + 1.0, maxTtl: data.waveDuration + 1.0,
          active: true, source: boss.id,
          damagePerTick: boss.atk * 6.0, // Massive tick damage
          tickInterval: 0.15, _tickTimer: 0,
        });

        // Boss uncurls — explosion event
        gs.addEvent({ type: 'boss_uncurl', bossId: boss.id });
        gs.addEvent({ type: 'boss_message', text: '💥 VAGUE DE FEU !' });
      },

      onUpdate: (boss, gs, data, dt) => {
        if (data.phase === 'charge') {
          data.chargeElapsed += dt;

          // Escalating warning beeps — send events at increasing frequency
          const beepInterval = Math.max(0.15, 0.6 - (data.chargeElapsed / data.chargeDuration) * 0.5);
          data.lastBeep += dt;
          if (data.lastBeep >= beepInterval) {
            data.lastBeep = 0;
            const urgency = data.chargeElapsed / data.chargeDuration; // 0→1
            gs.addEvent({ type: 'warning_beep', urgency, bossId: boss.id });
          }

          // Telegraph follows boss position
          const telZone = gs.aoeZones.find(z => z.id && z.id.startsWith('mwave_tel_'));
          if (telZone) { telZone.x = boss.x; telZone.y = boss.y; }

          return false; // onExecute fires after telegraphTime
        }

        if (data.phase === 'wave') {
          data.waveElapsed += dt;
          const progress = Math.min(1, data.waveElapsed / data.waveDuration);

          // Expand the fire ring
          const zone = gs.aoeZones.find(z => z.id === data.waveZoneId);
          if (zone) {
            // Easing: fast start, slight slow at end
            const eased = 1 - Math.pow(1 - progress, 2);
            zone.radius = 30 + (data.maxRadius - 30) * eased;
            zone.x = boss.x;
            zone.y = boss.y;
          }

          return data.waveElapsed >= data.waveDuration + 0.5;
        }

        return true;
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
  // PATTERN: Triple Laser (Tera Manaya iconic)
  // 3 red beams at 120° intervals, slow rotation, near one-shot
  // ──────────────────────────
  _patternTripleLaser() {
    return {
      name: 'Trinité Écarlate',
      phase: 3, weight: 2, cooldown: 22, globalCooldown: 3.5,
      telegraphTime: 2.0, castTime: 0.5, recoveryTime: 1.5,

      onStart: (boss, gs, data) => {
        const target = gs.getHighestAggroPlayer();
        data.startAngle = target ? Math.atan2(target.y - boss.y, target.x - boss.x) : boss.rotation;
        data.rotDir = Math.random() > 0.5 ? 1 : -1;
        data.angle = data.startAngle;
        data.elapsed = 0;
        data.duration = 4.0; // 4 seconds of rotating lasers

        // Telegraph: 3 thin red lines showing where lasers will fire
        for (let i = 0; i < 3; i++) {
          const a = data.startAngle + (i * Math.PI * 2 / 3); // 120° apart
          gs.addAoeZone({
            id: `trilaser_tel_${Date.now()}_${i}`, type: 'laser_red_telegraph',
            x: boss.x, y: boss.y, radius: 700, angle: a, lineWidth: 20,
            ttl: 2.5, maxTtl: 2.5, active: false, source: boss.id,
          });
        }
        gs.addEvent({ type: 'boss_message', text: '🔴 Trinité Écarlate !' });
      },

      onExecute: (boss, gs, data) => {
        data.laserIds = [];
        for (let i = 0; i < 3; i++) {
          const a = data.angle + (i * Math.PI * 2 / 3);
          const zoneId = `trilaser_${Date.now()}_${i}`;
          data.laserIds.push(zoneId);
          gs.addAoeZone({
            id: zoneId, type: 'laser_red',
            x: boss.x, y: boss.y, radius: 700, angle: a, lineWidth: 50,
            ttl: data.duration + 0.5, maxTtl: data.duration + 0.5, active: true,
            source: boss.id, damagePerTick: boss.atk * 9.0, // Near one-shot
            tickInterval: 0.2, _tickTimer: 0,
          });
        }
      },

      onUpdate: (boss, gs, data, dt) => {
        data.elapsed += dt;
        data.angle += data.rotDir * (Math.PI / 4) * dt; // 45°/sec (slower than single laser)

        for (let i = 0; i < 3; i++) {
          const zone = gs.aoeZones.find(z => z.id === data.laserIds[i]);
          if (zone) {
            zone.angle = data.angle + (i * Math.PI * 2 / 3);
            zone.x = boss.x;
            zone.y = boss.y;
          }
        }

        return data.elapsed >= data.duration;
      },
    };
  }

  // ──────────────────────────
  // PATTERN: Triple Debuff Circles (Tera Manaya — concentric expanding AOEs)
  // 3 successive AOE phases:
  //   Phase 1: inner circle (0 → R1) → D1
  //   Phase 2: middle ring (R1 → R2) → D2
  //   Phase 3: outer ring (R2 → R3) → D3
  // Debuff replacement: D1 removes D2, D2 removes D3, D3 removes D1
  // Party check: all 3 debuffs must exist on at least 1 player each (group)
  //              Solo: must have exactly 1 debuff
  // ──────────────────────────
  _patternTripleDebuff() {
    // Circular replacement table: receiving Dx removes Dy
    const REPLACES = { D1: 'D2', D2: 'D3', D3: 'D1' };
    const DEBUFF_NAMES = { D1: 'Marque I', D2: 'Marque II', D3: 'Marque III' };
    const R1 = 150; // inner circle radius
    const R2 = 300; // middle ring outer
    const R3 = 480; // outer ring outer
    const PHASE_DELAY = 2.5; // seconds between each sub-phase
    const TELEGRAPH_PRE = 1.5; // telegraph shown before each detonation

    return {
      name: 'Trinité des Marques',
      phase: 2, weight: 0, cooldown: 30, globalCooldown: 5.0,
      telegraphTime: 1.0, castTime: 0.5, recoveryTime: 2.0,

      condition: (boss, gs) => {
        return boss._debuffRotationTimer >= 90 && boss.phase >= 2;
      },

      onStart: (boss, gs, data) => {
        boss._debuffRotationTimer = 0;
        boss._debuffRotationCount++;

        data.subPhase = 0; // 0=waiting, 1/2/3=circle phases, 4=check
        data.phaseTimer = 0;
        data.bossX = boss.x;
        data.bossY = boss.y;
        data.telegraphShown = [false, false, false];
        data.detonated = [false, false, false];

        // Show all 3 circles as outlines immediately
        gs.addAoeZone({
          id: `trideb_ring1_${Date.now()}`, type: 'debuff_ring_outline',
          x: boss.x, y: boss.y, radius: R1,
          ttl: PHASE_DELAY * 3 + 6, maxTtl: PHASE_DELAY * 3 + 6,
          active: false, source: boss.id, ringIndex: 1,
        });
        gs.addAoeZone({
          id: `trideb_ring2_${Date.now()}`, type: 'debuff_ring_outline',
          x: boss.x, y: boss.y, radius: R2, innerRadius: R1,
          ttl: PHASE_DELAY * 3 + 6, maxTtl: PHASE_DELAY * 3 + 6,
          active: false, source: boss.id, ringIndex: 2,
        });
        gs.addAoeZone({
          id: `trideb_ring3_${Date.now()}`, type: 'debuff_ring_outline',
          x: boss.x, y: boss.y, radius: R3, innerRadius: R2,
          ttl: PHASE_DELAY * 3 + 6, maxTtl: PHASE_DELAY * 3 + 6,
          active: false, source: boss.id, ringIndex: 3,
        });

        gs.addEvent({ type: 'boss_message', text: '⚪ TRINITÉ DES MARQUES — 3 vagues arrivent !' });
        gs.addEvent({ type: 'warning_beep', urgency: 0.3, bossId: boss.id });
      },

      onExecute: (boss, gs, data) => {
        data.subPhase = 1;
        data.phaseTimer = 0;
      },

      onUpdate: (boss, gs, data, dt) => {
        data.phaseTimer += dt;
        const bx = data.bossX;
        const by = data.bossY;

        // ─── Helper: apply debuff to a player ───
        const applyDebuff = (player, debuffType) => {
          if (!player._manayaDebuffs) player._manayaDebuffs = new Set();
          // Circular replacement: Dx removes Dy
          const removes = REPLACES[debuffType];
          if (removes && player._manayaDebuffs.has(removes)) {
            player._manayaDebuffs.delete(removes);
            gs.addEvent({ type: 'debuff_removed', target: player.id, debuff: removes });
          }
          player._manayaDebuffs.add(debuffType);
          gs.addEvent({ type: 'debuff_applied', target: player.id, debuff: debuffType, name: DEBUFF_NAMES[debuffType] });

          // Debuff tick damage: 3% HP / 5s (0 in solo)
          if (gs.playerCount > 1) {
            const buffType = `manaya_mark_${debuffType}`;
            const existing = (player.buffs || []).find(b => b.type === buffType);
            if (!existing) {
              player.addBuff({
                type: buffType,
                dur: 120, tickInterval: 5, damage: Math.round(player.maxHp * 0.03),
                stackable: false, source: 'manaya_tridebuff',
              });
            }
          }
          // Also remove buff of the replaced debuff
          if (gs.playerCount > 1) {
            const removedDebuff = REPLACES[debuffType]; // D1 removes D2's buff, etc.
            if (removedDebuff) player.removeBuff(`manaya_mark_${removedDebuff}`);
          }
        };

        // ─── Sub-phase logic ───
        for (let phase = 1; phase <= 3; phase++) {
          const phaseStart = (phase - 1) * PHASE_DELAY;
          const detonateAt = phaseStart + TELEGRAPH_PRE;

          // Show telegraph before detonation
          if (!data.telegraphShown[phase - 1] && data.phaseTimer >= phaseStart) {
            data.telegraphShown[phase - 1] = true;
            const innerR = phase === 1 ? 0 : (phase === 2 ? R1 : R2);
            const outerR = phase === 1 ? R1 : (phase === 2 ? R2 : R3);
            gs.addAoeZone({
              id: `trideb_tel_${Date.now()}_${phase}`, type: 'debuff_circle_telegraph',
              x: bx, y: by, radius: outerR, innerRadius: innerR,
              ttl: TELEGRAPH_PRE + 0.3, maxTtl: TELEGRAPH_PRE + 0.3,
              active: false, source: boss.id, debuffPhase: phase,
            });
            gs.addEvent({ type: 'warning_beep', urgency: 0.3 + phase * 0.2, bossId: boss.id });
            gs.addEvent({ type: 'boss_message', text: `⚪ Marque ${phase}/3 — ${phase === 1 ? 'INTÉRIEUR' : phase === 2 ? 'MILIEU' : 'EXTÉRIEUR'} !` });
          }

          // Detonate
          if (!data.detonated[phase - 1] && data.phaseTimer >= detonateAt) {
            data.detonated[phase - 1] = true;
            const debuffType = `D${phase}`;
            const innerR = phase === 1 ? 0 : (phase === 2 ? R1 : R2);
            const outerR = phase === 1 ? R1 : (phase === 2 ? R2 : R3);

            // Visual explosion
            gs.addAoeZone({
              id: `trideb_exp_${Date.now()}_${phase}`, type: 'debuff_circle_explosion',
              x: bx, y: by, radius: outerR, innerRadius: innerR,
              ttl: 0.6, maxTtl: 0.6, active: true, source: boss.id, debuffPhase: phase,
            });

            // Apply debuff to players in the zone
            for (const player of gs.getAlivePlayers()) {
              const dist = Math.hypot(player.x - bx, player.y - by);
              if (dist >= innerR && dist < outerR + player.radius) {
                applyDebuff(player, debuffType);
              }
            }
          }
        }

        // ─── Final check after all 3 phases ───
        const checkAt = 2 * PHASE_DELAY + TELEGRAPH_PRE + 2.0; // 2s after last detonation
        if (data.phaseTimer >= checkAt && !data.checked) {
          data.checked = true;
          const isSolo = gs.playerCount <= 1;
          const players = gs.getAlivePlayers();

          if (isSolo) {
            // Solo: must have exactly 1 debuff
            const p = players[0];
            const debuffs = p?._manayaDebuffs || new Set();
            if (debuffs.size !== 1) {
              gs.addEvent({ type: 'boss_message', text: '💀 ÉCHEC — Vous deviez avoir exactement 1 Marque !' });
              for (const pl of players) {
                pl.takeTrueDamage(Math.round(pl.maxHp * 0.8), boss);
                gs.addEvent({ type: 'damage', source: boss.id, target: pl.id, amount: Math.round(pl.maxHp * 0.8), skill: 'Trinité ÉCHOUÉE' });
              }
            } else {
              gs.addEvent({ type: 'boss_message', text: '✅ Trinité validée !' });
            }
          } else {
            // Group: all 3 debuffs must exist across the party
            const allDebuffs = new Set();
            for (const p of players) {
              if (p._manayaDebuffs) p._manayaDebuffs.forEach(d => allDebuffs.add(d));
            }
            const hasAll = allDebuffs.has('D1') && allDebuffs.has('D2') && allDebuffs.has('D3');
            if (!hasAll) {
              const missing = ['D1', 'D2', 'D3'].filter(d => !allDebuffs.has(d)).map(d => DEBUFF_NAMES[d]);
              gs.addEvent({ type: 'boss_message', text: `💀 WIPE — Il manque: ${missing.join(', ')} !` });
              for (const pl of players) {
                pl.takeTrueDamage(999999, boss);
                gs.addEvent({ type: 'damage', source: boss.id, target: pl.id, amount: 999999, skill: 'Trinité WIPE' });
              }
            } else {
              gs.addEvent({ type: 'boss_message', text: '✅ Trinité validée — Toutes les Marques sont présentes !' });
            }
          }

          // Clear debuffs after check
          for (const p of players) {
            if (p._manayaDebuffs) p._manayaDebuffs.clear();
          }
        }

        return data.phaseTimer >= checkAt + 0.5;
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
        data.outerInner = 180;    // Outer ring starts right at inner boundary (no gap)
        data.outerRadius = 550;   // Outer ring outer boundary (wider coverage)
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
            const actual = player.takeTrueDamage(999999, boss); // TRUE ONESHOT
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
              const actual = player.takeTrueDamage(999999, boss); // TRUE ONESHOT
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

  // ──────────────────────────
  // PATTERN: Leap Slam (levitate → charge → knockback)
  // Manaya rises up, leaps to highest aggro target, slams down
  // knocking all nearby players back
  // ──────────────────────────
  _patternLeapSlam() {
    return {
      name: 'Saut Dévastateur',
      phase: 3, weight: 3, cooldown: 18, globalCooldown: 3.0,
      telegraphTime: 1.5, castTime: 0, recoveryTime: 1.5,

      onStart: (boss, gs, data) => {
        // Target highest aggro alive player
        const aggroEntries = [...gs.aggro.entries()].sort((a, b) => b[1] - a[1]);
        const targetId = aggroEntries.find(([id]) => {
          const p = gs.players.find(pl => pl.id === id);
          return p && p.alive;
        })?.[0];
        data.target = gs.players.find(p => p.id === targetId) || gs.getAlivePlayers()[0];

        if (data.target) {
          data.targetPos = { x: data.target.x, y: data.target.y };
          data.startPos = { x: boss.x, y: boss.y };
          data.leaping = false;
          data.leapTime = 0;
          data.leapDuration = 0.5;
          data.riseTime = 0;
          data.rising = true;
          data.impactRadius = 200;
          data.knockbackForce = 350;

          gs.addEvent({ type: 'boss_message', text: '🦅 Manaya se soulève...' });

          // Big warning circle on target
          gs.addAoeZone({
            id: `leap_tel_${Date.now()}`, type: 'circle_telegraph',
            x: data.targetPos.x, y: data.targetPos.y, radius: data.impactRadius,
            ttl: 2.0, maxTtl: 2.0, active: false, source: boss.id,
          });
        }
      },

      onExecute: (boss, gs, data) => {
        if (!data.target) return;
        // Update target position to where they are NOW
        if (data.target.alive) {
          data.targetPos = { x: data.target.x, y: data.target.y };
        }
        data.rising = false;
        data.leaping = true;
        data.leapTime = 0;
        data.startPos = { x: boss.x, y: boss.y };
        // Boss becomes briefly invulnerable during leap
        boss._leapInvuln = true;
      },

      onUpdate: (boss, gs, data, dt) => {
        if (!data.target) return true;

        // Rising phase (slight upward drift effect via server — client can add visual)
        if (data.rising) {
          data.riseTime += dt;
          if (data.riseTime >= 0.5) {
            data.rising = false;
          }
          return false;
        }

        if (!data.leaping) return true;

        data.leapTime += dt;
        const t = Math.min(1, data.leapTime / data.leapDuration);

        // Lerp boss to target with arc
        boss.x = data.startPos.x + (data.targetPos.x - data.startPos.x) * t;
        boss.y = data.startPos.y + (data.targetPos.y - data.startPos.y) * t;

        // At impact
        if (t >= 1) {
          boss._leapInvuln = false;
          const soloMult = gs.playerCount <= 1 ? (BOSS_CFG.SOLO_MECHANIC_MULT || 0.4) : 1.0;

          for (const player of gs.getAlivePlayers()) {
            const dist = Math.hypot(player.x - boss.x, player.y - boss.y);
            if (dist < data.impactRadius + player.radius) {
              // Damage
              const dmg = boss.atk * 3.5 * soloMult;
              const actual = player.takeDamage(dmg, boss);
              if (actual > 0) {
                gs.addEvent({ type: 'damage', source: boss.id, target: player.id, amount: actual, skill: 'Saut Dévastateur' });
              }

              // Knockback: push player away from impact point
              const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
              const kbDist = data.knockbackForce * (1 - dist / (data.impactRadius + player.radius));
              player.x += Math.cos(angle) * kbDist;
              player.y += Math.sin(angle) * kbDist;
              player.clampPosition();
            }
          }

          // Impact explosion visual
          gs.addAoeZone({
            id: `leap_impact_${Date.now()}`, type: 'circle_explosion',
            x: boss.x, y: boss.y, radius: data.impactRadius,
            ttl: 0.4, maxTtl: 0.4, active: true, source: boss.id,
          });
          // Speed down debuff on hit players
          for (const player of gs.getAlivePlayers()) {
            const dist = Math.hypot(player.x - boss.x, player.y - boss.y);
            if (dist < data.impactRadius + player.radius + data.knockbackForce) {
              player.addBuff({ type: 'speed_down', dur: 2, value: 0.3, source: 'boss' });
            }
          }

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
