import { SERVER, COMBAT, XP, SPAWN, ZONES } from '../config.js';
import { GrottoMap } from '../world/GrottoMap.js';
import { GrottoMob, resetMobIdCounter } from '../entities/GrottoMob.js';
import { Player, resetPlayerIdCounter } from '../entities/Player.js';
import { MOB_TYPES, getMobTypesForZone } from '../data/mobTypes.js';

// One Instance = one copy of the grotto with its own map, mobs, players
export class GrottoInstance {
  constructor(id, broadcast) {
    this.id = id;
    this.broadcast = broadcast;   // (msg) => send to all players in this instance
    this.map = new GrottoMap(Date.now() + id * 1000);
    this.players = new Map();     // playerId -> Player
    this.mobs = new Map();        // mobId -> GrottoMob
    this.tickCount = 0;
    this.running = false;
    this.combatLog = [];          // recent events for broadcast

    // Spawn initial mobs
    this._spawnInitialMobs();
  }

  get playerCount() { return this.players.size; }

  // ── Player Management ──────────────────────────────────────

  addPlayer(username, hunterId, level) {
    const player = new Player(username, hunterId, level || 1);
    player.x = this.map.playerSpawn.px;
    player.y = this.map.playerSpawn.py;
    this.players.set(player.id, player);
    return player;
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
  }

  // ── Mob Spawning ───────────────────────────────────────────

  _spawnInitialMobs() {
    for (let zIdx = 0; zIdx < ZONES.length; zIdx++) {
      const zone = ZONES[zIdx];
      const mobTypes = getMobTypesForZone(zone.id);
      if (mobTypes.length === 0) continue;

      const spawnPoints = this.map.spawnPoints[zIdx];
      if (!spawnPoints || spawnPoints.length === 0) continue;

      const count = SPAWN.MOBS_PER_ZONE;
      for (let i = 0; i < count; i++) {
        const template = mobTypes[Math.floor(Math.random() * mobTypes.length)];
        const level = zone.minLevel + Math.floor(Math.random() * (zone.maxLevel - zone.minLevel + 1));
        const pos = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];

        const mob = new GrottoMob(template, level, pos);
        this.mobs.set(mob.id, mob);
      }
    }
  }

  // ── Main Tick ──────────────────────────────────────────────

  tick(dt) {
    this.tickCount++;
    this.combatLog = [];

    // Update players
    for (const player of this.players.values()) {
      if (player.alive) {
        player.updateMovement(dt, this.map);
        player.updateCooldowns(dt);
      } else {
        if (player.updateRespawn(dt)) {
          // Player just respawned — teleport to entrance
          player.x = this.map.playerSpawn.px;
          player.y = this.map.playerSpawn.py;
          this.combatLog.push({
            type: 'respawn',
            playerId: player.id,
            username: player.username,
          });
        }
      }
    }

    const alivePlayers = [...this.players.values()].filter(p => p.alive);

    // Update mobs
    for (const mob of this.mobs.values()) {
      if (mob.alive) {
        mob.update(dt, alivePlayers, this.map);
        // Mob attacks
        this._processMobAttack(mob, dt);
      } else if (mob.shouldRespawn()) {
        mob.respawn();
      }
    }

    // Process player attacks
    for (const player of alivePlayers) {
      this._processPlayerAttack(player);
    }
  }

  // ── Mob → Player Combat ────────────────────────────────────

  _processMobAttack(mob, dt) {
    if (!mob.canAttack() || mob.state !== 'chase') return;

    const target = this.players.get(mob.targetPlayerId);
    if (!target?.alive) return;

    const dist = this._dist(mob.x, mob.y, target.x, target.y);
    if (dist > mob.range) return;
    if (!this.map.hasLineOfSight(mob.x, mob.y, target.x, target.y)) return;

    mob.attackTimer = mob.attackInterval;

    // Calculate damage
    const variance = COMBAT.VARIANCE_MIN + Math.random() * (COMBAT.VARIANCE_MAX - COMBAT.VARIANCE_MIN);
    const rawDmg = mob.atk * variance;
    const dmg = target.takeDamage(rawDmg);

    this.combatLog.push({
      type: 'mob_attack',
      mobId: mob.id,
      mobName: mob.name,
      targetId: target.id,
      targetName: target.username,
      damage: dmg,
    });

    // Apply poison if mob has it
    if (mob.poisonDmg > 0) {
      target.buffs.push({
        type: 'poison',
        value: mob.poisonDmg * (1 + 0.18 * (mob.level - 1)),
        duration: mob.poisonDur,
      });
    }

    // Player died
    if (!target.alive) {
      const xpLost = target.xp; // die() already subtracted
      this.combatLog.push({
        type: 'player_death',
        playerId: target.id,
        username: target.username,
        killedBy: mob.name,
        xpLost: Math.floor(target.xpToNextLevel() * XP.DEATH_PENALTY),
      });
    }
  }

  // ── Player → Mob Combat ────────────────────────────────────

  _processPlayerAttack(player) {
    if (player.attackingSkill < 0) return;
    if (player.attackTimer > 0) return;

    const skillIdx = player.attackingSkill;
    const skill = player.useSkill(skillIdx);
    if (!skill) return;

    // Self-buff skills
    if (skill.buffDef) {
      player.buffs.push({ type: 'def', value: skill.buffDef, duration: skill.dur });
      this.combatLog.push({ type: 'buff', playerId: player.id, buff: 'def', value: skill.buffDef, x: player.x, y: player.y, skillIdx });
      return;
    }
    if (skill.buffAtk) {
      player.buffs.push({ type: 'atk', value: skill.buffAtk, duration: skill.dur });
      if (skill.buffSpd) player.buffs.push({ type: 'spd', value: skill.buffSpd, duration: skill.dur });
      this.combatLog.push({ type: 'buff', playerId: player.id, buff: 'atk', value: skill.buffAtk, x: player.x, y: player.y, skillIdx });
      return;
    }

    // Heal skills
    if (skill.heal || skill.healAll) {
      this._processHeal(player, skill);
      return;
    }

    // Party shield
    if (skill.partyShield) {
      for (const ally of this.players.values()) {
        if (ally.alive) {
          ally.buffs.push({ type: 'def', value: Math.floor(ally.def * skill.partyShield), duration: skill.dur });
        }
      }
      this.combatLog.push({ type: 'party_buff', playerId: player.id, skill: skill.name, x: player.x, y: player.y, range: skill.range || 256, skillIdx });
      return;
    }

    // Taunt
    if (skill.taunt) {
      let taunted = 0;
      for (const mob of this.mobs.values()) {
        if (!mob.alive) continue;
        const d = this._dist(player.x, player.y, mob.x, mob.y);
        if (d <= skill.range) {
          mob.targetPlayerId = player.id;
          mob.state = 'chase';
          taunted++;
        }
      }
      this.combatLog.push({ type: 'taunt', playerId: player.id, count: taunted, x: player.x, y: player.y, range: skill.range, skillIdx });
      return;
    }

    // Damage skills
    const target = this._findMobTarget(player, skill);
    if (!target) return;

    // Dash to target if skill has dash
    if (skill.dash) {
      const dx = target.x - player.x;
      const dy = target.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        player.x = target.x - (dx / dist) * 40;
        player.y = target.y - (dy / dist) * 40;
      }
    }

    // AoE or single target
    const targets = skill.aoe ? this._findMobsInRange(player, skill.range) : [target];

    for (const mob of targets) {
      const atk = player.getEffectiveAtk();
      const isCrit = Math.random() * 100 < player.crit;
      const variance = COMBAT.VARIANCE_MIN + Math.random() * (COMBAT.VARIANCE_MAX - COMBAT.VARIANCE_MIN);
      const rawDmg = atk * (skill.power / 100) * variance * (isCrit ? COMBAT.CRIT_MULTIPLIER : 1);
      const hits = skill.hits || 1;
      let totalDmg = 0;

      for (let h = 0; h < hits; h++) {
        const dmg = mob.takeDamage(rawDmg / hits);
        totalDmg += dmg;
      }

      player.damageDealt += totalDmg;
      mob.addThreat(player.id, totalDmg);

      this.combatLog.push({
        type: 'player_attack',
        playerId: player.id,
        skill: skill.name,
        skillIdx,
        aoe: !!skill.aoe,
        dash: !!skill.dash,
        caster: !!skill.caster,
        range: skill.range,
        targetId: mob.id,
        targetName: mob.name,
        damage: totalDmg,
        crit: isCrit,
        px: player.x, py: player.y,
        tx: mob.x, ty: mob.y,
      });

      // Mob died
      if (!mob.alive) {
        this._onMobKill(player, mob);
      } else {
        // Always aggro on hit + switch to highest threat
        mob.state = 'chase';
        const currentThreat = mob.threat.get(mob.targetPlayerId) || 0;
        const attackerThreat = mob.threat.get(player.id) || 0;
        if (attackerThreat > currentThreat * 1.2 || !mob.targetPlayerId) {
          mob.targetPlayerId = player.id;
        }
      }
    }

    // Reset attack input
    player.attackingSkill = -1;
  }

  _processHeal(player, skill) {
    if (skill.healAll) {
      for (const ally of this.players.values()) {
        if (!ally.alive) continue;
        const healed = ally.heal(Math.floor(ally.maxHp * skill.healAll));
        player.healingDone += healed;
      }
      this.combatLog.push({ type: 'heal_all', playerId: player.id, skill: skill.name });
    } else if (skill.heal) {
      // Heal the lowest HP ally in range
      let lowestAlly = null;
      let lowestRatio = 1;
      for (const ally of this.players.values()) {
        if (!ally.alive) continue;
        const d = this._dist(player.x, player.y, ally.x, ally.y);
        if (d > skill.range) continue;
        const ratio = ally.hp / ally.maxHp;
        if (ratio < lowestRatio) {
          lowestRatio = ratio;
          lowestAlly = ally;
        }
      }
      if (lowestAlly) {
        const healed = lowestAlly.heal(Math.floor(lowestAlly.maxHp * skill.heal));
        player.healingDone += healed;
        this.combatLog.push({
          type: 'heal',
          playerId: player.id,
          targetId: lowestAlly.id,
          targetName: lowestAlly.username,
          amount: healed,
        });
      }
    }
  }

  _onMobKill(player, mob) {
    player.kills++;

    // XP scaled by level difference
    const levelDiff = player.level - mob.level;
    let xpMult = 1;
    if (levelDiff > 0) {
      xpMult = Math.max(XP.MIN_XP_RATIO, 1 - levelDiff / XP.LEVEL_DIFF_SCALE);
    } else if (levelDiff < 0) {
      xpMult = 1 + Math.abs(levelDiff) * 0.1; // Bonus XP for killing higher level mobs
    }

    const xpGained = Math.floor(mob.xpReward * xpMult);
    const oldLevel = player.level;
    player.addXp(xpGained);

    this.combatLog.push({
      type: 'mob_kill',
      playerId: player.id,
      username: player.username,
      mobName: mob.name,
      mobLevel: mob.level,
      xp: xpGained,
      levelUp: player.level > oldLevel ? player.level : null,
    });

    // Share XP with nearby allies (50% of base to each nearby player)
    for (const ally of this.players.values()) {
      if (ally.id === player.id || !ally.alive) continue;
      const d = this._dist(player.x, player.y, ally.x, ally.y);
      if (d < 320) { // 10 tiles
        const sharedXp = Math.floor(xpGained * 0.5);
        const oldLvl = ally.level;
        ally.addXp(sharedXp);
        if (ally.level > oldLvl) {
          this.combatLog.push({
            type: 'level_up',
            playerId: ally.id,
            username: ally.username,
            level: ally.level,
          });
        }
      }
    }
  }

  _findMobTarget(player, skill) {
    if (player.targetId) {
      const mob = this.mobs.get(player.targetId);
      if (mob?.alive) {
        const d = this._dist(player.x, player.y, mob.x, mob.y);
        if (d <= skill.range && this.map.hasLineOfSight(player.x, player.y, mob.x, mob.y)) return mob;
      }
    }
    // Auto-target closest mob in range with LOS
    return this._findClosestMob(player, skill.range);
  }

  _findClosestMob(player, range) {
    let closest = null;
    let closestDist = range;
    for (const mob of this.mobs.values()) {
      if (!mob.alive) continue;
      const d = this._dist(player.x, player.y, mob.x, mob.y);
      if (d < closestDist && this.map.hasLineOfSight(player.x, player.y, mob.x, mob.y)) {
        closestDist = d;
        closest = mob;
      }
    }
    return closest;
  }

  _findMobsInRange(player, range) {
    const result = [];
    for (const mob of this.mobs.values()) {
      if (!mob.alive) continue;
      const d = this._dist(player.x, player.y, mob.x, mob.y);
      if (d <= range) result.push(mob);
    }
    return result;
  }

  _dist(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  // ── State Snapshot (for broadcast) ─────────────────────────

  getState(forPlayerId) {
    const player = this.players.get(forPlayerId);
    if (!player) return null;

    // Only send entities within viewport range (optimization)
    const VIEW_RANGE = 640; // ~20 tiles
    const nearbyMobs = [];
    for (const mob of this.mobs.values()) {
      if (Math.abs(mob.x - player.x) < VIEW_RANGE && Math.abs(mob.y - player.y) < VIEW_RANGE) {
        nearbyMobs.push(mob.serialize());
      }
    }

    const nearbyPlayers = [];
    for (const p of this.players.values()) {
      if (p.id === forPlayerId) continue;
      if (Math.abs(p.x - player.x) < VIEW_RANGE && Math.abs(p.y - player.y) < VIEW_RANGE) {
        nearbyPlayers.push(p.serialize());
      }
    }

    return {
      self: player.serialize(),
      players: nearbyPlayers,
      mobs: nearbyMobs,
      events: this.combatLog.filter(e =>
        e.playerId === forPlayerId ||
        e.targetId === forPlayerId ||
        (e.type === 'mob_kill' && e.playerId === forPlayerId)
      ),
      tick: this.tickCount,
    };
  }
}
