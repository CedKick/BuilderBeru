// ─── CombatInstance ───────────────────────────────────────
// Runs a single boss encounter in real-time (60 TPS).
// Fork of Manaya's GameLoop adapted for expedition.
// One CombatInstance per boss fight, created by ExpeditionEngine.

import { SERVER, BOSS as BOSS_CFG } from '../config.js';
import { GameState } from './GameState.js';
import { CombatEngine } from './CombatEngine.js';
import { PhysicsEngine } from './PhysicsEngine.js';
import { BotAI } from './BotAI.js';
import { ExpeditionBoss } from '../entities/ExpeditionBoss.js';
import { getBossDefinition } from '../data/bossDefinitions.js';

export class CombatInstance {
  constructor(hunters, bossIndex, hunterCount, onEnd) {
    // Boss
    const bossDef = getBossDefinition(bossIndex);
    const boss = new ExpeditionBoss(bossDef, hunterCount);

    // Game state
    this.state = new GameState(hunters, boss);
    this.combat = new CombatEngine(this.state);
    this.physics = new PhysicsEngine(this.state);

    this.bossIndex = bossIndex;
    this.bossName = bossDef.name;
    this.onEnd = onEnd;
    this.running = false;
    this.tick = 0;
    this._interval = null;
    this._lastTime = 0;
    this.inputQueue = [];

    // Bot AI for each hunter (all start as bots)
    this.botAIs = new Map();
    for (const hunter of hunters) {
      if (hunter.alive) {
        this.botAIs.set(hunter.id, new BotAI(hunter.id, hunter.class));
      }
    }

    // Position hunters in formation
    this._positionHunters(hunters, boss);

    // Stats
    this.startTime = 0;
    this.elapsed = 0;
  }

  _positionHunters(hunters, boss) {
    // Spread hunters around the arena based on their role
    // Tanks close to boss, DPS mid, healers/mages far
    const aliveHunters = hunters.filter(h => h.alive);

    // Group by role
    const tanks = aliveHunters.filter(h => h.class === 'tank');
    const melees = aliveHunters.filter(h => h.class === 'dps_cac' || h.class === 'berserker');
    const ranged = aliveHunters.filter(h => h.class === 'dps_range' || h.class === 'mage');
    const healers = aliveHunters.filter(h => h.class === 'healer');

    const bossX = boss.x;
    const bossY = boss.y;
    const arenaH = 1200;

    // Place each group in a semicircle around the boss
    const placeGroup = (group, baseAngle, radius, spread) => {
      const count = group.length;
      if (count === 0) return;
      const step = spread / Math.max(1, count - 1);
      const startAngle = baseAngle - spread / 2;
      for (let i = 0; i < count; i++) {
        const angle = startAngle + step * i;
        const h = group[i];
        h.x = bossX + Math.cos(angle) * radius;
        h.y = bossY + Math.sin(angle) * radius;
        // Add small jitter so they don't stack
        h.x += (Math.random() - 0.5) * 30;
        h.y += (Math.random() - 0.5) * 30;
        h.clampPosition();
      }
    };

    // Tanks: close front (facing boss from left side)
    placeGroup(tanks, Math.PI, 180, Math.PI * 0.5);
    // Melee DPS: wider spread around boss
    placeGroup(melees, Math.PI, 280, Math.PI * 1.0);
    // Healers: mid-far, spread wide
    placeGroup(healers, Math.PI, 400, Math.PI * 0.8);
    // Ranged: far back, full spread
    placeGroup(ranged, Math.PI, 500, Math.PI * 1.2);
  }

  start() {
    this.running = true;
    this._lastTime = Date.now();
    this.startTime = Date.now();
    this.tick = 0;

    console.log(`[Combat] Boss ${this.bossIndex + 1}/5: ${this.bossName} (${(this.state.boss.maxHp / 1e6).toFixed(0)}M HP)`);
    console.log(`[Combat] Alive hunters: ${this.state.getAliveHunters().length}/${this.state.hunters.length}`);

    this._interval = setInterval(() => {
      if (!this.running) return;
      const now = Date.now();
      const dt = Math.min((now - this._lastTime) / 1000, 0.1); // Cap dt at 100ms
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

  queueInput(hunterId, input) {
    this.inputQueue.push({ hunterId, input, tick: this.tick });
  }

  // Switch a hunter between bot/player control
  setHunterControl(hunterId, isPlayerControlled) {
    const hunter = this.state.getHunterById(hunterId);
    if (!hunter) return;

    hunter.isControlled = isPlayerControlled;
    hunter.isBot = !isPlayerControlled;

    if (isPlayerControlled) {
      // Remove bot AI for this hunter
      this.botAIs.delete(hunterId);
    } else {
      // Re-add bot AI
      this.botAIs.set(hunterId, new BotAI(hunterId, hunter.class));
    }
  }

  _update(dt) {
    const gs = this.state;
    this.elapsed = (Date.now() - this.startTime) / 1000;
    gs.combatTime = this.elapsed;

    // Update enrage timer
    gs.timer -= dt;

    // 0. Bot AI — generate inputs for bot-controlled hunters
    for (const [botId, botAI] of this.botAIs) {
      const hunter = gs.getHunterById(botId);
      if (!hunter || !hunter.alive) continue;
      const inputs = botAI.think(hunter, gs, dt);
      for (const input of inputs) {
        this.inputQueue.push({ hunterId: botId, input, tick: this.tick });
      }
    }

    // 1. Process all queued inputs
    this._processInputs();

    // 2. Update hunters (movement, cooldowns, buffs, mana, combo)
    for (const hunter of gs.hunters) {
      if (!hunter.alive) continue;
      this.physics.updatePlayer(hunter, dt);
      this.combat.updateCombo(hunter, dt);
      this.combat.updatePlayerCooldowns(hunter, dt);
      this.combat.updatePlayerBuffs(hunter, dt);
      this.combat.regenMana(hunter, dt);
    }

    // 3. Update boss
    if (gs.boss && gs.boss.alive) {
      gs.boss.update(dt, gs);
    }

    // 4. Update adds
    for (const add of gs.adds) {
      if (!add.alive) continue;
      add.update(dt, gs);
    }

    // 5. Update projectiles and AoE zones
    this.physics.updateProjectiles(gs, dt);
    this.physics.updateAoeZones(gs, dt);

    // 6. Collision detection
    this.physics.checkCollisions(gs, this.combat, dt);

    // 7. Cleanup
    gs.cleanup();

    // 8. Periodic progress log (every 10s)
    if (this.tick > 0 && this.tick % (60 * 10) === 0) {
      const boss = gs.boss;
      const alive = gs.getAliveHunters().length;
      const totalDmg = gs.hunters.reduce((s, h) => s + h.stats.damageDealt, 0);
      const dps = this.elapsed > 0 ? Math.round(totalDmg / this.elapsed) : 0;
      console.log(`  [${this.elapsed.toFixed(0)}s] Boss HP: ${boss.hp.toLocaleString()}/${boss.maxHp.toLocaleString()} (${(boss.hp/boss.maxHp*100).toFixed(1)}%) | Alive: ${alive} | Team DPS: ${(dps/1000).toFixed(1)}K/s`);
    }

    // 9. Check end conditions
    this._checkCombatEnd();

    // 9. Broadcast (at reduced rate)
    if (this.tick % SERVER.BROADCAST_INTERVAL === 0) {
      this._broadcast();
    }
  }

  _processInputs() {
    const gs = this.state;
    while (this.inputQueue.length > 0) {
      const { hunterId, input } = this.inputQueue.shift();
      const hunter = gs.getHunterById(hunterId);
      if (!hunter || !hunter.alive) continue;

      // Normalize BotAI input format to engine format
      const type = this._normalizeInputType(input);
      const angle = input.angle || 0;

      switch (type) {
        case 'move':
          // BotAI sends { x, y }, player sends { dx, dy }
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
          if (hunter.skills.skillB?.type === 'charged_attack') {
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

  // Translate BotAI input types to engine input types
  _normalizeInputType(input) {
    switch (input.type) {
      // BotAI basic attack variants → 'attack'
      case 'start_basic':
      case 'attack_basic':
        return 'attack';
      // BotAI secondary variants → 'secondary'
      case 'attack_secondary':
        return 'secondary';
      case 'stop_secondary':
        return 'secondary_stop';
      // BotAI skill format: { type: 'skill', skill: 'skillA' } → 'skillA'
      case 'skill':
        return input.skill || 'skillA';
      // BotAI charge variants → skillB / skillB_release
      case 'charge_start':
        return 'skillB';
      case 'charge_release':
        return 'skillB_release';
      // Already correct format
      default:
        return input.type;
    }
  }

  _checkCombatEnd() {
    const gs = this.state;

    // Victory: boss dead
    if (gs.boss && !gs.boss.alive) {
      this.stop();
      const elapsed = (Date.now() - this.startTime) / 1000;
      console.log(`[Combat] VICTORY — ${this.bossName} defeated in ${elapsed.toFixed(1)}s`);
      this._logStats(true, elapsed);
      if (this.onEnd) this.onEnd({ victory: true, bossIndex: this.bossIndex, time: elapsed, stats: this._buildEndStats() });
      return;
    }

    // Wipe: all hunters dead
    const alive = gs.getAliveHunters();
    if (alive.length === 0) {
      this.stop();
      const elapsed = (Date.now() - this.startTime) / 1000;
      const bossHpPercent = gs.boss ? (gs.boss.hp / gs.boss.maxHp * 100) : 0;
      console.log(`[Combat] WIPE — ${this.bossName} at ${bossHpPercent.toFixed(1)}% HP (${elapsed.toFixed(1)}s)`);
      this._logStats(false, elapsed);
      if (this.onEnd) this.onEnd({ victory: false, bossIndex: this.bossIndex, time: elapsed, bossHpPercent, stats: this._buildEndStats() });
      return;
    }

    // Timeout (enrage timer)
    if (gs.timer <= 0 && !gs.boss.enraged) {
      gs.boss.enraged = true;
      gs.addEvent({ type: 'boss_message', text: `⚠️ ${this.bossName} est ENRAGÉ !` });
    }
  }

  _buildEndStats() {
    return this.state.hunters.map(h => ({
      id: h.id,
      hunterId: h.hunterId,
      hunterName: h.hunterName,
      username: h.username,
      class: h.class,
      damageDealt: h.stats.damageDealt,
      damageTaken: h.stats.damageTaken,
      healingDone: h.stats.healingDone,
      deaths: h.stats.deaths,
      alive: h.alive,
    }));
  }

  _logStats(victory, elapsed) {
    const stats = this._buildEndStats();
    const sorted = [...stats].sort((a, b) => b.damageDealt - a.damageDealt);

    console.log(`\n[Combat] ═══ ${this.bossName} — ${victory ? 'WIN' : 'WIPE'} (${elapsed.toFixed(1)}s) ═══`);
    for (const s of sorted.slice(0, 10)) {
      const dps = elapsed > 0 ? Math.round(s.damageDealt / elapsed) : 0;
      console.log(`  ${s.class.padEnd(10)} ${s.hunterName.padEnd(18)} | DMG: ${(s.damageDealt / 1e6).toFixed(1)}M (${(dps / 1000).toFixed(1)}K/s) | Deaths: ${s.deaths}`);
    }
    const totalDmg = stats.reduce((s, h) => s + h.damageDealt, 0);
    const totalHeal = stats.reduce((s, h) => s + h.healingDone, 0);
    const totalDeaths = stats.reduce((s, h) => s + h.deaths, 0);
    console.log(`  TOTAL DMG: ${(totalDmg / 1e6).toFixed(1)}M | HEAL: ${(totalHeal / 1e6).toFixed(1)}M | Deaths: ${totalDeaths}`);
  }

  _broadcast() {
    // Will be wired to WebSocket in ExpeditionEngine
    // For now, state snapshot is available via getSnapshot()
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
