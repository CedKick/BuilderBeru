import { SERVER, BOSS } from '../config.js';
import { GameState } from './GameState.js';
import { CombatEngine } from './CombatEngine.js';
import { PhysicsEngine } from './PhysicsEngine.js';
import { calculateXpReward } from '../data/playerProfile.js';
import { generateRaidArtifact, generateRaidWeaponDrop, FEATHER_DROP_RATES, calculateAlkahestReward, rollHunterDrops, rollSetUltimeDrops } from '../data/raidGearData.js';

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

    // 2. Update players (movement, cooldowns, buffs, dodge, combo)
    for (const player of gs.players) {
      if (!player.alive) continue;
      this.physics.updatePlayer(player, dt);
      this.combat.updateCombo(player, dt);
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

    // 7. Check enrage (permanent at <5% HP) — 5s freeze then Trinité
    if (!gs.boss.enraged && gs.boss.alive) {
      const hpPercent = (gs.boss.hp / gs.boss.maxHp) * 100;
      if (hpPercent <= BOSS.ENRAGE_HP_PERCENT) {
        gs.boss.enterEnrage();
        // Freeze boss for 5s before enrage attack
        gs.boss._enrageFreeze = 5.0;
        gs.boss._enrageFreezeTriggered = false;
        this._broadcastEvent({ type: 'boss_enrage' });
        this._broadcastEvent({ type: 'boss_message', text: '💀 MANAYA S\'ENRAGE — 5 secondes...' });
      }
    }
    // Enrage freeze countdown → force Trinité des Marques
    if (gs.boss._enrageFreeze > 0) {
      gs.boss._enrageFreeze -= dt;
      gs.boss._frozen = true; // Prevent pattern execution
      if (gs.boss._enrageFreeze <= 0 && !gs.boss._enrageFreezeTriggered) {
        gs.boss._enrageFreezeTriggered = true;
        gs.boss._frozen = false;
        gs.boss._debuffRotationTimer = 90; // Force Trinité
        this._broadcastEvent({ type: 'boss_message', text: '💀 TRINITÉ DE LA RAGE !' });
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
          // Legacy single click — still triggers combo start for melee
          if (player.skills.basic.hitbox === 'cone') {
            this.combat.startBasicAttack(player, input.angle);
          } else {
            this.combat.basicAttack(player, input.angle);
          }
          break;

        case 'start_basic':
          this.combat.startBasicAttack(player, input.angle);
          break;

        case 'stop_basic':
          this.combat.stopBasicAttack(player);
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
    const bossHpPercent = gs.boss.maxHp > 0 ? (gs.boss.hp / gs.boss.maxHp) * 100 : 0;

    if (!gs.boss.alive) {
      const loot = this._generateLootDrops(0, true);
      this._endGame({
        victory: true,
        reason: 'boss_killed',
        time: BOSS.ENRAGE_TIMER - gs.timer,
        stats: this._buildEndStats(),
        loot,
      });
      return;
    }

    const anyAlive = gs.players.some(p => p.alive);
    if (!anyAlive) {
      // Generate loot on loss too (alkahest if boss < 75% HP, no items)
      const loot = this._generateLootDrops(bossHpPercent, false);
      this._endGame({
        victory: false,
        reason: 'party_wipe',
        stats: this._buildEndStats(),
        loot,
      });
    }
  }

  _endGame(result) {
    this.stop();
    this._flushEvents();
    // game_end is broadcast by RoomManager._onGameEnd — don't double-send
    if (this.onEnd) this.onEnd(result);
  }

  _buildEndStats() {
    const gs = this.state;
    const elapsed = BOSS.ENRAGE_TIMER - gs.timer;
    const victory = !gs.boss.alive;
    const bossHpPercent = gs.boss.maxHp > 0 ? (gs.boss.hp / gs.boss.maxHp) * 100 : 0;
    const playerCount = gs.players.length;

    return gs.players.map(p => {
      const xpReward = this.simulation ? 0 : calculateXpReward({
        victory,
        difficulty: this.state.difficulty || 'NORMAL',
        bossHpPercent,
        damageDealt: p.stats.damageDealt,
        healingDone: p.stats.healingDone,
        deaths: p.stats.deaths,
        playerCount,
        elapsed,
      });

      return {
        id: p.id,
        username: p.username,
        class: p.class,
        damageDealt: p.stats.damageDealt,
        damageTaken: p.stats.damageTaken,
        healingDone: p.stats.healingDone,
        deaths: p.stats.deaths,
        xpReward,
      };
    });
  }

  // ── Generate loot drops for victory ──
  // Tier availability by difficulty + player count:
  //   NORMAL:         1-2p → T0       | 3+ → T0, T1
  //   HARD:           1-2p → T1, T2   | 3+ → T1-T3
  //   NIGHTMARE:      1-2p → T4, T5   | 3+ → T4-T5
  //   NIGHTMARE_PLUS: 1-2p → T6, T7   | 3+ → T6-T7
  //   NIGHTMARE_2:    1-2p → T8, T9   | 3+ → T8-T9
  //   NIGHTMARE_3:    1-2p → T10, T11 | 3+ → T10-T11
  _getAvailableTiers() {
    const difficulty = this.state.difficulty || 'NORMAL';
    const playerCount = this.state.players.length;
    const is3Plus = playerCount >= 3;

    switch (difficulty) {
      case 'HARD':           return is3Plus ? ['T1', 'T2', 'T3'] : ['T1', 'T2'];
      case 'NIGHTMARE':      return is3Plus ? ['T4', 'T5'] : ['T4', 'T5'];
      case 'NIGHTMARE_PLUS': return is3Plus ? ['T6', 'T7'] : ['T6', 'T7'];
      case 'NIGHTMARE_2':    return is3Plus ? ['T8', 'T9'] : ['T8', 'T9'];
      case 'NIGHTMARE_3':    return is3Plus ? ['T10', 'T11'] : ['T10', 'T11'];
      default:               return is3Plus ? ['T0', 'T1'] : ['T0']; // NORMAL
    }
  }

  _generateLootDrops(bossHpPercent = 0, victory = true) {
    const gs = this.state;
    const tiers = this._getAvailableTiers();
    const difficulty = gs.difficulty || 'NORMAL';
    const featherRate = FEATHER_DROP_RATES[difficulty] || 0.05;
    const playerCount = gs.players.length;

    // Each player gets their own loot roll
    return gs.players.map(p => {
      const items = [];
      let feathers = 0;
      let hunterDrops = [];
      let setUltimeDrop = null;

      // Items and feathers only on victory
      if (victory) {
        // 1-2 artifacts guaranteed — random tier from available pool
        const numArtifacts = 1 + (Math.random() < 0.4 ? 1 : 0);
        for (let i = 0; i < numArtifacts; i++) {
          const tier = tiers[Math.floor(Math.random() * tiers.length)];
          items.push(generateRaidArtifact(tier));
        }

        // 15% chance for a weapon drop
        if (Math.random() < 0.15) {
          const weapon = generateRaidWeaponDrop(tiers[0]);
          if (weapon) items.push({ ...weapon, type: 'weapon' });
        }

        // Plume de Manaya drop roll (very rare)
        if (Math.random() * 100 < featherRate) {
          feathers = 1;
        }

        // Hunter drops — 5 rolls × 1% each (universal, any hunter from the full pool)
        hunterDrops = rollHunterDrops();

        // Set Ultime — 5 rolls × 0.5% each (universal)
        const setUltimeDropsArr = rollSetUltimeDrops();
        setUltimeDrop = setUltimeDropsArr.length > 0 ? setUltimeDropsArr : null;
      }

      // Alkahest awarded even on loss (if boss was below 75% HP)
      const alkahest = this.simulation ? 0 : calculateAlkahestReward(
        bossHpPercent, difficulty, playerCount, victory
      );

      return { playerId: p.id, items, feathers, alkahest, hunterDrops, setUltimeDrops: setUltimeDrop || [] };
    });
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
        useRage: p.useRage || false,
        endurance: Math.round(p.endurance),
        maxEndurance: p.maxEndurance,
        alive: p.alive,
        class: p.class,
        username: p.username,
        dodging: p.dodging,
        blocking: p.blocking,
        invulnerable: p.invulnerable,
        aimAngle: p.aimAngle,
        buffs: p.buffs.map(b => ({ type: b.type, stacks: b.stacks, dur: +b.dur.toFixed(1) })),
        casting: p.casting ? { skill: p.casting.skill, timer: +p.casting.timer.toFixed(1) } : null,
        comboStep: p.comboStep || 0,
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
        skills: Object.fromEntries(
          Object.entries(p.skills).map(([k, s]) => [k, { name: s.name, manaCost: s.manaCost || 0, cooldown: s.cooldown || 0 }])
        ),
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
        bursting: gs.boss._burstActive || false,
        leaping: gs.boss._moveState === 'leaping',
        moveState: gs.boss._moveState || 'idle',
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
        ringIndex: z.ringIndex,
        debuffPhase: z.debuffPhase,
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
