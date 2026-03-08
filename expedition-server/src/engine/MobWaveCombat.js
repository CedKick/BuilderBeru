// ─── MobWaveCombat ────────────────────────────────────────
// Runs a mob wave encounter (no boss). Hunters fight waves of mobs.
// Mobs spawn in sub-waves. Victory when all mobs dead.
// Uses same GameState/Physics/Combat as boss fights.

import { SERVER, ARENA } from '../config.js';
import { GameState } from './GameState.js';
import { CombatEngine } from './CombatEngine.js';
import { PhysicsEngine } from './PhysicsEngine.js';
import { BotAI } from './BotAI.js';

// Mob wave definitions per boss section
const WAVE_DEFS = {
  // Before Boss 1 — forest minions (3 types)
  0: {
    mobTypes: ['forest_sbire_1', 'forest_sbire_2', 'forest_sbire_3'],
    subWaves: [
      { delay: 0, count: 12 },      // Instant first batch
      { delay: 12, count: 10 },      // 12s later
      { delay: 24, count: 10 },      // 24s later
      { delay: 36, count: 8 },       // 36s later — final push
    ],
    mobHp: 800_000,
    mobAtk: 1500,
    mobDef: 50,
    mobSpd: 45,
    mobRadius: 18,
  },
  // Before Boss 2 — stone golems + minions
  1: {
    mobTypes: ['stone_golem', 'minion', 'stone_golem'],
    subWaves: [
      { delay: 0, count: 10 },
      { delay: 10, count: 12 },
      { delay: 22, count: 10 },
      { delay: 34, count: 10 },
    ],
    mobHp: 1_200_000,
    mobAtk: 2200,
    mobDef: 80,
    mobSpd: 38,
    mobRadius: 20,
  },
  // Before Boss 3+
  2: {
    mobTypes: ['minion', 'stone_golem', 'minion'],
    subWaves: [
      { delay: 0, count: 14 },
      { delay: 10, count: 12 },
      { delay: 20, count: 12 },
      { delay: 32, count: 10 },
    ],
    mobHp: 1_800_000,
    mobAtk: 3000,
    mobDef: 100,
    mobSpd: 40,
    mobRadius: 20,
  },
};

let nextMobId = 1;

export class MobWaveCombat {
  constructor(hunters, bossSection, hunterCount, onEnd) {
    // Use a null boss — GameState handles this
    this.state = new GameState(hunters, null);
    this.combat = new CombatEngine(this.state);
    this.physics = new PhysicsEngine(this.state);

    this.bossSection = bossSection;
    this.onEnd = onEnd;
    this.running = false;
    this.tick = 0;
    this._interval = null;
    this._lastTime = 0;
    this.inputQueue = [];
    this.elapsed = 0;
    this.startTime = 0;

    // Wave config
    const defKey = Math.min(bossSection, 2);
    this.waveDef = WAVE_DEFS[defKey];
    this._subWaveIdx = 0;
    this._allSpawned = false;

    // Bot AI
    this.botAIs = new Map();
    for (const hunter of hunters) {
      if (hunter.alive) {
        this.botAIs.set(hunter.id, new BotAI(hunter.id, hunter.class));
      }
    }

    // Position hunters on left side
    this._positionHunters(hunters);
  }

  _positionHunters(hunters) {
    const alive = hunters.filter(h => h.alive);
    const cols = 5, spacing = 60;
    const startX = 200, startY = ARENA.HEIGHT / 2 - ((Math.ceil(alive.length / cols) - 1) * spacing) / 2;

    for (let i = 0; i < alive.length; i++) {
      const col = i % cols, row = Math.floor(i / cols);
      alive[i].x = startX + col * 50 + (Math.random() - 0.5) * 20;
      alive[i].y = startY + row * spacing + (Math.random() - 0.5) * 20;
      alive[i].clampPosition();
    }
  }

  _spawnMobs(count) {
    const def = this.waveDef;
    for (let i = 0; i < count; i++) {
      const typeIdx = Math.floor(Math.random() * def.mobTypes.length);
      const type = def.mobTypes[typeIdx];
      const id = `mob_${nextMobId++}`;

      // Spawn on right side, spread vertically
      const x = ARENA.WIDTH - 100 - Math.random() * 200;
      const y = 150 + Math.random() * (ARENA.HEIGHT - 300);

      const mob = {
        id, type, x, y,
        hp: def.mobHp, maxHp: def.mobHp,
        atk: def.mobAtk, def: def.mobDef,
        radius: def.mobRadius, alive: true,
        _atkTimer: 0,
        _targetId: null,
        _retargetTimer: 0,

        update(dt, gs) {
          if (!this.alive) return;

          // Retarget every 3-5 seconds
          this._retargetTimer -= dt;
          if (this._retargetTimer <= 0 || !this._targetId) {
            this._retargetTimer = 3 + Math.random() * 2;
            const hunters = gs.getAliveHunters();
            if (hunters.length > 0) {
              // Prefer nearby targets
              const sorted = hunters.map(h => ({ h, d: Math.hypot(h.x - this.x, h.y - this.y) }))
                .sort((a, b) => a.d - b.d);
              // Pick from top 5 closest (some randomness)
              const pick = sorted[Math.floor(Math.random() * Math.min(5, sorted.length))];
              this._targetId = pick.h.id;
            }
          }

          const target = gs.getHunterById(this._targetId);
          if (!target || !target.alive) {
            this._targetId = null;
            return;
          }

          const dx = target.x - this.x, dy = target.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 40) {
            // Move toward target
            const speed = def.mobSpd;
            this.x += (dx / dist) * speed * dt;
            this.y += (dy / dist) * speed * dt;
            // Clamp
            this.x = Math.max(this.radius, Math.min(ARENA.WIDTH - this.radius, this.x));
            this.y = Math.max(this.radius, Math.min(ARENA.HEIGHT - this.radius, this.y));
          } else {
            // Melee attack
            this._atkTimer += dt;
            if (this._atkTimer >= 2.5) {
              this._atkTimer = 0;
              const actual = target.takeDamage(this.atk);
              if (actual > 0) {
                gs.addEvent({
                  type: 'damage',
                  source: this.id,
                  target: target.id,
                  amount: actual,
                  skill: 'Melee',
                });
              }
            }
          }
        },

        takeDamage(amount) {
          const reduced = Math.max(1, Math.round(amount * (100 / (100 + (this.def || 0)))));
          this.hp = Math.max(0, this.hp - reduced);
          if (this.hp <= 0) { this.alive = false; }
          return reduced;
        },
      };

      this.state.addAdd(mob);
    }
  }

  start() {
    this.running = true;
    this._lastTime = Date.now();
    this.startTime = Date.now();
    this.tick = 0;
    this._subWaveIdx = 0;
    this._allSpawned = false;

    console.log(`[MobWave] Starting wave combat (section ${this.bossSection})`);

    // Spawn first sub-wave immediately
    this._checkSubWaves();

    this._interval = setInterval(() => {
      if (!this.running) return;
      const now = Date.now();
      const dt = Math.min((now - this._lastTime) / 1000, 0.1);
      this._lastTime = now;
      this._update(dt);
      this.tick++;
    }, SERVER.TICK_MS);
  }

  stop() {
    this.running = false;
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }

  _update(dt) {
    const gs = this.state;
    this.elapsed = (Date.now() - this.startTime) / 1000;

    // Check sub-wave spawns
    this._checkSubWaves();

    // Bot AI
    for (const [botId, botAI] of this.botAIs) {
      const hunter = gs.getHunterById(botId);
      if (!hunter || !hunter.alive) continue;
      const inputs = botAI.think(hunter, gs, dt);
      for (const input of inputs) {
        this.inputQueue.push({ hunterId: botId, input, tick: this.tick });
      }
    }

    // Process inputs
    this._processInputs();

    // Update hunters
    for (const hunter of gs.hunters) {
      if (!hunter.alive) continue;
      this.physics.updatePlayer(hunter, dt);
      this.combat.updateCombo(hunter, dt);
      this.combat.updatePlayerCooldowns(hunter, dt);
      this.combat.updatePlayerBuffs(hunter, dt);
      this.combat.regenMana(hunter, dt);
    }

    // Update mobs (as adds)
    for (const add of gs.adds) {
      if (!add.alive) continue;
      add.update(dt, gs);
    }

    // Update projectiles & AoE
    this.physics.updateProjectiles(gs, dt);
    this.physics.updateAoeZones(gs, dt);

    // Cleanup
    gs.cleanup();

    // Check end
    this._checkEnd();

    // Broadcast
    if (this.tick % SERVER.BROADCAST_INTERVAL === 0) {
      // Broadcast handled by ExpeditionEngine
    }
  }

  _checkSubWaves() {
    if (this._allSpawned) return;
    const subWaves = this.waveDef.subWaves;

    while (this._subWaveIdx < subWaves.length) {
      const sw = subWaves[this._subWaveIdx];
      if (this.elapsed >= sw.delay) {
        console.log(`[MobWave] Sub-wave ${this._subWaveIdx + 1}/${subWaves.length}: spawning ${sw.count} mobs`);
        this._spawnMobs(sw.count);
        this._subWaveIdx++;
      } else {
        break;
      }
    }

    if (this._subWaveIdx >= subWaves.length) {
      this._allSpawned = true;
    }
  }

  _checkEnd() {
    const gs = this.state;

    // Victory: all mobs dead and all waves spawned
    if (this._allSpawned && gs.getAliveAdds().length === 0) {
      this.stop();
      console.log(`[MobWave] CLEARED in ${this.elapsed.toFixed(1)}s`);
      if (this.onEnd) this.onEnd({ victory: true, time: this.elapsed });
      return;
    }

    // Wipe: all hunters dead
    if (gs.getAliveHunters().length === 0) {
      this.stop();
      console.log(`[MobWave] WIPE at ${this.elapsed.toFixed(1)}s`);
      if (this.onEnd) this.onEnd({ victory: false, time: this.elapsed });
      return;
    }
  }

  _processInputs() {
    while (this.inputQueue.length > 0) {
      const { hunterId, input } = this.inputQueue.shift();
      const hunter = this.state.getHunterById(hunterId);
      if (!hunter || !hunter.alive) continue;

      const type = this._normalizeInputType(input);
      const angle = input.angle || 0;

      switch (type) {
        case 'move':
          hunter.moveDir = { x: input.x || input.dx || 0, y: input.y || input.dy || 0 };
          break;
        case 'stop':
          hunter.moveDir = { x: 0, y: 0 };
          break;
        case 'aim':
          hunter.aimAngle = angle;
          break;
        case 'attack':
          this.combat.startBasicAttack(hunter, angle);
          break;
        case 'attack_stop':
          this.combat.stopBasicAttack(hunter);
          break;
        case 'secondary':
          this.combat.secondaryAction(hunter, angle);
          break;
        case 'secondary_stop':
          this.combat.stopSecondary(hunter);
          break;
        case 'skillA':
          this.combat.useSkill(hunter, 'skillA', angle);
          break;
        case 'skillB':
          if (hunter.skills?.skillB?.type === 'charged_attack') {
            this.combat.startCharge(hunter, 'skillB', angle);
          } else {
            this.combat.useSkill(hunter, 'skillB', angle);
          }
          break;
        case 'skillB_release':
          this.combat.releaseCharge(hunter, angle);
          break;
        case 'ultimate':
          this.combat.useSkill(hunter, 'ultimate', angle);
          break;
        case 'dodge':
          this.combat.dodge(hunter, angle);
          break;
      }
    }
  }

  _normalizeInputType(input) {
    switch (input.type) {
      case 'start_basic': case 'attack_basic': return 'attack';
      case 'attack_secondary': return 'secondary';
      case 'stop_secondary': return 'secondary_stop';
      case 'skill': return input.skill || 'skillA';
      case 'charge_start': return 'skillB';
      case 'charge_release': return 'skillB_release';
      default: return input.type;
    }
  }

  getSnapshot() {
    return this.state.getSnapshot();
  }

  getEvents() {
    const events = [...this.state.events];
    this.state.events = [];
    return events;
  }
}
