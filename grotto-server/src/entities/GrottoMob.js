import { COMBAT, SPAWN, MAP } from '../config.js';
import { scaleMobStats } from '../data/mobTypes.js';

let mobIdCounter = 0;

export class GrottoMob {
  constructor(template, level, spawnPos) {
    this.id = `mob_${++mobIdCounter}`;
    this.templateKey = template.key;
    this.name = template.name;
    this.level = level;
    this.zone = template.zone;

    // Scale stats by level
    const stats = scaleMobStats(template, level);
    this.maxHp = stats.maxHp;
    this.hp = this.maxHp;
    this.atk = stats.atk;
    this.def = stats.def;
    this.spd = template.spd || COMBAT.MOB_SPEED;
    this.range = stats.range;
    this.attackInterval = stats.attackInterval;
    this.xpReward = stats.xp;

    // Spawn position (pixels) — used for leashing
    this.spawnX = spawnPos.px;
    this.spawnY = spawnPos.py;
    this.x = spawnPos.px;
    this.y = spawnPos.py;

    // Behavior
    this.aggroRange = template.aggroRange || COMBAT.AGGRO_RANGE;
    this.elite = !!template.elite;
    this.caster = !!template.caster;
    this.boss = !!template.boss;
    this.poisonDmg = template.poisonDmg || 0;
    this.poisonDur = template.poisonDur || 0;

    // State
    this.alive = true;
    this.state = 'idle';       // idle | patrol | chase | attack | leash | dead
    this.targetPlayerId = null;
    this.attackTimer = Math.random() * 1.0;
    this.respawnTimer = 0;

    // Patrol
    this.patrolTargetX = this.x;
    this.patrolTargetY = this.y;
    this.patrolWaitTimer = 2 + Math.random() * 5;

    // Debuffs from players
    this.debuffs = [];

    // Threat table: playerId -> threat value
    this.threat = new Map();
  }

  // ── AI Tick ─────────────────────────────────────────────────

  update(dt, players, map) {
    if (!this.alive) {
      this.respawnTimer -= dt;
      return;
    }

    this.attackTimer = Math.max(0, this.attackTimer - dt);
    this._updateDebuffs(dt);

    switch (this.state) {
      case 'idle':
      case 'patrol':
        this._patrol(dt, players, map);
        break;
      case 'chase':
        this._chase(dt, players, map);
        break;
      case 'leash':
        this._leash(dt, map);
        break;
    }
  }

  _patrol(dt, players, map) {
    // Check for players in aggro range (with LOS)
    const target = this._findTarget(players, map);
    if (target) {
      this.state = 'chase';
      this.targetPlayerId = target.id;
      return;
    }

    // Patrol around spawn point
    this.patrolWaitTimer -= dt;
    if (this.patrolWaitTimer <= 0) {
      // Pick new patrol target near spawn
      const angle = Math.random() * Math.PI * 2;
      const dist = 32 + Math.random() * 96;
      this.patrolTargetX = this.spawnX + Math.cos(angle) * dist;
      this.patrolTargetY = this.spawnY + Math.sin(angle) * dist;
      this.patrolWaitTimer = 3 + Math.random() * 5;
    }

    this._moveToward(this.patrolTargetX, this.patrolTargetY, dt * 0.5, map);
  }

  _chase(dt, players, map) {
    const target = players.find(p => p.id === this.targetPlayerId && p.alive);
    if (!target) {
      // Target lost — find another or leash
      const newTarget = this._findTarget(players, map);
      if (newTarget) {
        this.targetPlayerId = newTarget.id;
        return;
      }
      this.state = 'leash';
      this.targetPlayerId = null;
      return;
    }

    // Check leash distance from spawn
    const distFromSpawn = this._dist(this.x, this.y, this.spawnX, this.spawnY);
    if (distFromSpawn > COMBAT.LEASH_RANGE) {
      this.state = 'leash';
      this.targetPlayerId = null;
      return;
    }

    // Check deaggro
    const distToTarget = this._dist(this.x, this.y, target.x, target.y);
    if (distToTarget > COMBAT.DEAGGRO_RANGE) {
      this.state = 'leash';
      this.targetPlayerId = null;
      return;
    }

    // In attack range? Stop moving and let GameLoop handle damage
    if (distToTarget <= this.range) {
      // Stay in place — _processMobAttack in GameLoop handles the actual damage
      return;
    }

    // Move toward target
    this._moveToward(target.x, target.y, dt, map);
  }

  _leash(dt, map) {
    const distToSpawn = this._dist(this.x, this.y, this.spawnX, this.spawnY);
    if (distToSpawn < 16) {
      this.state = 'idle';
      this.hp = this.maxHp; // Full heal on leash reset
      return;
    }
    // Move back to spawn (faster)
    this._moveToward(this.spawnX, this.spawnY, dt * 1.5, map);
  }

  addThreat(playerId, amount) {
    this.threat.set(playerId, (this.threat.get(playerId) || 0) + amount);
  }

  _findTarget(players, map) {
    // Priority 1: highest threat player in aggro range (skip LOS for threat — already aggroed)
    if (this.threat.size > 0) {
      let bestPlayer = null, bestThreat = 0;
      for (const [pid, threat] of this.threat) {
        const p = players.find(pl => pl.id === pid && pl.alive);
        if (!p) { this.threat.delete(pid); continue; }
        const d = this._dist(this.x, this.y, p.x, p.y);
        if (d < this.aggroRange * 1.5 && threat > bestThreat) {
          bestThreat = threat;
          bestPlayer = p;
        }
      }
      if (bestPlayer) return bestPlayer;
    }

    // Priority 2: closest player in aggro range WITH line-of-sight
    let closest = null;
    let closestDist = Infinity;
    for (const p of players) {
      if (!p.alive) continue;
      const d = this._dist(this.x, this.y, p.x, p.y);
      if (d < this.aggroRange && d < closestDist) {
        if (map && !map.hasLineOfSight(this.x, this.y, p.x, p.y)) continue;
        closest = p;
        closestDist = d;
      }
    }
    return closest;
  }

  _moveToward(targetX, targetY, dt, map) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 2) return;

    const speed = this.spd * dt;
    const nx = this.x + (dx / dist) * Math.min(speed, dist);
    const ny = this.y + (dy / dist) * Math.min(speed, dist);

    // Simple collision: check if destination tile is walkable
    const { tx, ty } = map.pixelToTile(nx, ny);
    if (map.isWalkable(tx, ty)) {
      this.x = nx;
      this.y = ny;
    }
  }

  // ── Combat ─────────────────────────────────────────────────

  takeDamage(amount) {
    if (!this.alive) return 0;
    const dmgMult = COMBAT.DEF_CONSTANT / (COMBAT.DEF_CONSTANT + this.def);
    const dmg = Math.floor(amount * dmgMult);
    this.hp = Math.max(0, this.hp - dmg);
    if (this.hp <= 0) {
      this.alive = false;
      this.state = 'dead';
      this.respawnTimer = SPAWN.RESPAWN_TIME;
    }
    return dmg;
  }

  canAttack() {
    return this.alive && this.attackTimer <= 0;
  }

  // ── Respawn ────────────────────────────────────────────────

  shouldRespawn() {
    return !this.alive && this.respawnTimer <= 0;
  }

  respawn() {
    this.alive = true;
    this.hp = this.maxHp;
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.state = 'idle';
    this.targetPlayerId = null;
    this.debuffs = [];
    this.threat.clear();
    this.attackTimer = 1;
  }

  // ── Debuffs ────────────────────────────────────────────────

  addDebuff(type, value, duration) {
    const existing = this.debuffs.find(d => d.type === type);
    if (existing) {
      existing.value = Math.max(existing.value, value);
      existing.duration = Math.max(existing.duration, duration);
    } else {
      this.debuffs.push({ type, value, duration });
    }
  }

  _updateDebuffs(dt) {
    for (let i = this.debuffs.length - 1; i >= 0; i--) {
      this.debuffs[i].duration -= dt;
      if (this.debuffs[i].duration <= 0) this.debuffs.splice(i, 1);
    }
  }

  // ── Helpers ────────────────────────────────────────────────

  _dist(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      templateKey: this.templateKey,
      level: this.level,
      hp: this.hp,
      maxHp: this.maxHp,
      x: Math.round(this.x),
      y: Math.round(this.y),
      alive: this.alive,
      state: this.state,
      elite: this.elite,
      caster: this.caster,
      boss: this.boss,
      targetPlayerId: this.targetPlayerId,
    };
  }
}

export function resetMobIdCounter() { mobIdCounter = 0; }
