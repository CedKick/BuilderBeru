import { SERVER, BOSS } from '../config.js';
import { GameState } from './GameState.js';
import { CombatEngine } from './CombatEngine.js';
import { PhysicsEngine } from './PhysicsEngine.js';

export class GameLoop {
  constructor(roomCode, players, difficulty, wsServer, simulation = false) {
    this.roomCode = roomCode;
    this.wsServer = wsServer;
    this.state = new GameState(players, difficulty, simulation);
    this.simulation = simulation;
    this.combat = new CombatEngine(this.state);
    this.physics = new PhysicsEngine(this.state);

    this.running = false;
    this.tick = 0;
    this.inputQueue = [];
    this.onEnd = null; // callback
    this._interval = null;
    this._lastTime = 0;
  }

  start() {
    this.running = true;
    this._lastTime = Date.now();
    this.tick = 0;

    // Broadcast initial state
    this._broadcastFullState();

    this._interval = setInterval(() => {
      if (!this.running) return;

      const now = Date.now();
      const dt = (now - this._lastTime) / 1000; // seconds
      this._lastTime = now;

      this._update(dt);
      this.tick++;

      // Broadcast state at reduced rate
      if (this.tick % SERVER.BROADCAST_INTERVAL === 0) {
        this._broadcastState();
      }

      // Flush events every tick (important for damage numbers!)
      this._flushEvents();
    }, SERVER.TICK_MS);

    console.log(`[GameLoop] Started for room ${this.roomCode}`);
  }

  stop() {
    this.running = false;
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
    console.log(`[GameLoop] Stopped for room ${this.roomCode}`);
  }

  queueInput(playerId, input) {
    this.inputQueue.push({ playerId, input, tick: this.tick });
  }

  handlePlayerDisconnect(playerId) {
    const player = this.state.getPlayer(playerId);
    if (player) {
      player.connected = false;
      player.alive = false;
      this._checkGameEnd();
    }
  }

  _update(dt) {
    const gs = this.state;

    // 1. Process all queued inputs
    this._processInputs();

    // 2. Update players (movement, cooldowns, buffs, dodge)
    for (const player of gs.players) {
      if (!player.alive) continue;
      this.physics.updatePlayer(player, dt);
      this.combat.updatePlayerCooldowns(player, dt);
      this.combat.updatePlayerBuffs(player, dt);
      this.combat.regenMana(player, dt);
    }

    // Simulation: keep players alive (god mode)
    if (this.simulation) {
      for (const player of gs.players) {
        if (!player.alive) {
          player.alive = true;
          player.hp = Math.max(1, player.hp);
        }
        if (player.hp <= 0) player.hp = Math.max(1, Math.floor(player.maxHp * 0.1));
      }
    }

    // 3. Update boss AI and patterns
    if (gs.boss.alive) {
      gs.boss.update(dt, gs);
    }

    // 3b. Update adds (minions)
    for (const add of gs.adds) {
      if (add.alive) add.update(dt, gs);
    }

    // 4. Update projectiles & AoE zones
    this.physics.updateProjectiles(gs, dt);
    this.physics.updateAoeZones(gs, dt);

    // 5. Check collisions (players vs boss attacks, player attacks vs boss)
    this.physics.checkCollisions(gs, this.combat, dt);

    // 6. Update timer
    gs.timer -= dt;
    if (gs.timer <= 0 && !this.simulation) {
      this._endGame({ victory: false, reason: 'timeout' });
      return;
    }

    // 7. Check enrage (permanent at <8% HP)
    if (!gs.boss.enraged && gs.boss.alive) {
      const hpPercent = (gs.boss.hp / gs.boss.maxHp) * 100;
      if (hpPercent <= BOSS.ENRAGE_HP_PERCENT) {
        gs.boss.enterEnrage();
        this._broadcastEvent({ type: 'boss_enrage' });
      }
    }

    // 8. Cleanup expired
    gs.cleanup();

    // 9. Check game end (skip in simulation)
    if (!this.simulation) this._checkGameEnd();
  }

  _processInputs() {
    for (const { playerId, input } of this.inputQueue) {
      const player = this.state.getPlayer(playerId);
      if (!player || !player.alive) continue;

      switch (input.type) {
        case 'move':
          player.moveDir = { x: input.x || 0, y: input.y || 0 };
          break;

        case 'stop':
          player.moveDir = { x: 0, y: 0 };
          break;

        case 'attack_basic':
          this.combat.basicAttack(player, input.angle);
          break;

        case 'attack_secondary':
          this.combat.secondaryAction(player, input.angle);
          break;

        case 'stop_secondary':
          this.combat.stopSecondary(player);
          break;

        case 'skill':
          this.combat.useSkill(player, input.skill, input.angle);
          break;

        case 'dodge':
          this.combat.dodge(player, input.angle);
          break;

        case 'summon':
          this.combat.summonHunter(player, input.slot);
          break;

        case 'aim':
          player.aimAngle = input.angle || 0;
          break;

        // Simulation-only commands
        case 'sim_set_boss_hp':
          if (this.simulation && this.state.boss.alive) {
            const pct = Math.max(1, Math.min(100, input.percent || 50));
            this.state.boss.hp = Math.floor(this.state.boss.maxHp * pct / 100);
            this._broadcastEvent({ type: 'boss_message', text: `[SIM] Boss HP set to ${pct}%` });
          }
          break;

        case 'sim_full_heal':
          if (this.simulation && player) {
            player.hp = player.maxHp;
            player.mana = player.maxMana;
            player.buffs = [];
          }
          break;

        case 'sim_kill_adds':
          if (this.simulation) {
            for (const add of this.state.adds) add.alive = false;
            this._broadcastEvent({ type: 'boss_message', text: '[SIM] Adds killed' });
          }
          break;

        case 'sim_spawn_adds':
          if (this.simulation && this.state.boss.alive) {
            this.state.boss._spawnAdds(this.state, input.adds || [{ type: 'minion' }]);
          }
          break;
      }
    }
    this.inputQueue = [];
  }

  _checkGameEnd() {
    const gs = this.state;

    if (!gs.boss.alive) {
      this._endGame({
        victory: true,
        reason: 'boss_killed',
        time: BOSS.ENRAGE_TIMER - gs.timer,
        stats: this._buildEndStats(),
      });
      return;
    }

    const anyAlive = gs.players.some(p => p.alive);
    if (!anyAlive) {
      this._endGame({
        victory: false,
        reason: 'party_wipe',
        stats: this._buildEndStats(),
      });
    }
  }

  _endGame(result) {
    this.stop();
    this._flushEvents();
    this._broadcastEvent({ type: 'game_end', result });
    if (this.onEnd) this.onEnd(result);
  }

  _buildEndStats() {
    return this.state.players.map(p => ({
      id: p.id,
      username: p.username,
      class: p.class,
      damageDealt: p.stats.damageDealt,
      damageTaken: p.stats.damageTaken,
      healingDone: p.stats.healingDone,
      deaths: p.stats.deaths,
    }));
  }

  // ── Flush queued events to all clients ──
  _flushEvents() {
    const gs = this.state;
    if (gs.events.length === 0) return;

    // Batch events into a single message for efficiency
    if (gs.events.length <= 3) {
      for (const event of gs.events) {
        this.wsServer.broadcast(this.roomCode, event);
      }
    } else {
      // Batch mode for many events
      this.wsServer.broadcast(this.roomCode, {
        type: 'events_batch',
        events: gs.events,
      });
    }
    gs.events = [];
  }

  _broadcastState() {
    const gs = this.state;

    const stateMsg = {
      type: 'state',
      tick: this.tick,
      timer: Math.max(0, Math.floor(gs.timer)),
      players: gs.players.map(p => ({
        id: p.id,
        x: Math.round(p.x),
        y: Math.round(p.y),
        hp: Math.round(p.hp),
        maxHp: p.maxHp,
        mana: Math.round(p.mana),
        maxMana: p.maxMana,
        alive: p.alive,
        class: p.class,
        username: p.username,
        dodging: p.dodging,
        blocking: p.blocking,
        invulnerable: p.invulnerable,
        aimAngle: p.aimAngle,
        buffs: p.buffs.map(b => ({ type: b.type, stacks: b.stacks, dur: +b.dur.toFixed(1) })),
        casting: p.casting ? { skill: p.casting.skill, timer: +p.casting.timer.toFixed(1) } : null,
        cooldowns: {
          basic: +p.cooldowns.basic.toFixed(1),
          secondary: +p.cooldowns.secondary.toFixed(1),
          skillA: +p.cooldowns.skillA.toFixed(1),
          skillB: +p.cooldowns.skillB.toFixed(1),
          ultimate: +p.cooldowns.ultimate.toFixed(1),
        },
        hunterCooldowns: p.hunterCooldowns.map(cd => +cd.toFixed(1)),
        supportHunters: p.supportHunters,
        mainHunter: p.mainHunter,
        dodgeCooldown: +p.dodgeCooldown.toFixed(1),
        stats: {
          damageDealt: Math.round(p.stats.damageDealt),
          damageTaken: Math.round(p.stats.damageTaken),
          healingDone: Math.round(p.stats.healingDone),
          deaths: p.stats.deaths,
        },
      })),
      boss: {
        x: Math.round(gs.boss.x),
        y: Math.round(gs.boss.y),
        hp: Math.round(gs.boss.hp),
        maxHp: gs.boss.maxHp,
        phase: gs.boss.phase,
        rotation: gs.boss.rotation,
        casting: gs.boss.casting,
        enraged: gs.boss.enraged,
        shielded: gs.boss.shielded,
        shieldHp: gs.boss.shieldHp,
        shieldMaxHp: gs.boss.shieldMaxHp,
        rageBuff: gs.boss.rageBuff,
        speedStacks: gs.boss.speedStacks,
      },
      simulation: gs.simulation,
      adds: gs.adds.filter(a => a.alive).map(a => ({
        id: a.id,
        type: a.type,
        x: Math.round(a.x),
        y: Math.round(a.y),
        hp: Math.round(a.hp),
        maxHp: a.maxHp,
        radius: a.radius,
        rotation: a.rotation,
        name: a.name,
        color: a.color,
      })),
      aggro: Object.fromEntries(gs.aggro),
      projectiles: gs.projectiles.map(p => ({
        id: p.id,
        type: p.type,
        x: Math.round(p.x),
        y: Math.round(p.y),
        radius: p.radius,
        angle: p.angle,
      })),
      aoeZones: gs.aoeZones.map(z => ({
        id: z.id,
        type: z.type,
        x: Math.round(z.x),
        y: Math.round(z.y),
        radius: z.radius,
        ttl: z.ttl.toFixed(1),
        maxTtl: z.maxTtl,
        active: z.active,
        angle: z.angle,
        lineWidth: z.lineWidth,
        innerRadius: z.innerRadius,
        coneAngle: z.coneAngle,
      })),
    };

    this.wsServer.broadcast(this.roomCode, stateMsg);
  }

  _broadcastFullState() {
    this._broadcastState();
  }

  _broadcastEvent(event) {
    this.wsServer.broadcast(this.roomCode, event);
  }
}
