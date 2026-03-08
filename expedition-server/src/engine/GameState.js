// ─── Expedition GameState ─────────────────────────────────
// Manages all hunters (30), boss, projectiles, adds, aggro.
// Fork of Manaya's GameState adapted for expedition (hunters instead of players).

import { ARENA, BOSS as BOSS_CFG } from '../config.js';

export class GameState {
  constructor(hunters, boss) {
    // All 30 hunters on the field
    this.hunters = hunters;
    this.boss = boss;
    this.timer = boss ? (boss._enrageTimer || BOSS_CFG.ENRAGE_TIMER) : 999;

    // Aggro table: hunterId -> aggro value
    this.aggro = new Map();
    for (const h of hunters) {
      this.aggro.set(h.id, 0);
    }

    // Combat elapsed time (updated by CombatInstance)
    this.combatTime = 0;

    // Active projectiles and AoE zones
    this.projectiles = [];
    this.aoeZones = [];

    // Adds (minions spawned during fight)
    this.adds = [];

    // Event queue for broadcasting
    this.events = [];
  }

  // ── Hunter queries (same API as Manaya's player queries) ──

  getHunterById(id) {
    return this.hunters.find(h => h.id === id) || null;
  }

  // Alias for compatibility with Manaya engine code
  getPlayer(id) {
    return this.getHunterById(id);
  }

  get players() {
    return this.hunters;
  }

  getAliveHunters() {
    return this.hunters.filter(h => h.alive);
  }

  getAlivePlayers() {
    return this.getAliveHunters();
  }

  getHighestAggroTarget() {
    let highest = null;
    let maxAggro = -1;
    for (const h of this.getAliveHunters()) {
      const aggro = this.aggro.get(h.id) || 0;
      if (aggro > maxAggro) {
        maxAggro = aggro;
        highest = h;
      }
    }
    return highest;
  }

  // Alias for Manaya compatibility
  getHighestAggroPlayer() {
    return this.getHighestAggroTarget();
  }

  addAggro(hunterId, amount) {
    const current = this.aggro.get(hunterId) || 0;
    this.aggro.set(hunterId, current + amount);
  }

  // ── Projectiles / AoE / Events ──

  addProjectile(proj) {
    this.projectiles.push(proj);
  }

  addAoeZone(zone) {
    this.aoeZones.push(zone);
  }

  addEvent(event) {
    this.events.push(event);
  }

  addAdd(add) {
    this.adds.push(add);
  }

  getAliveAdds() {
    return this.adds.filter(a => a.alive);
  }

  cleanup() {
    this.projectiles = this.projectiles.filter(p => p.alive);
    this.aoeZones = this.aoeZones.filter(z => z.ttl > 0);
    this.adds = this.adds.filter(a => a.alive);
  }

  // ── State snapshot for broadcast ──

  getSnapshot() {
    return {
      timer: this.timer,
      boss: this.boss ? {
        id: this.boss.id,
        name: this.boss.name,
        x: Math.round(this.boss.x),
        y: Math.round(this.boss.y),
        hp: this.boss.hp,
        maxHp: this.boss.maxHp,
        rotation: this.boss.rotation,
        radius: this.boss.radius,
        color: this.boss.color,
        phase: this.boss.phase,
        enraged: this.boss.enraged,
        spriteId: this.boss.spriteId || null,
        casting: this.boss.casting,
        telegraph: this.boss.currentPattern && this.boss.currentPattern.state === 'telegraph' ? {
          type: this.boss.currentPattern.pattern.type,
          range: this.boss.currentPattern.pattern.range,
          coneAngle: this.boss.currentPattern.pattern.coneAngle,
          outerRadius: this.boss.currentPattern.pattern.outerRadius,
          innerSafe: this.boss.currentPattern.pattern.innerSafe,
          lineWidth: this.boss.currentPattern.pattern.lineWidth,
          innerRadius: this.boss.currentPattern.pattern.innerRadius,
          visualColor: this.boss.currentPattern.pattern.visualColor,
          maxRadius: this.boss.currentPattern.pattern.maxRadius,
          laserColor: this.boss.currentPattern.pattern.laserColor,
          waveColor: this.boss.currentPattern.pattern.waveColor,
          progress: this.boss.casting ? this.boss.casting.progress : 0,
        } : null,
      } : null,
      hunters: this.hunters.map(h => ({
        id: h.id,
        hunterId: h.hunterId,
        hunterName: h.hunterName,
        username: h.username,
        class: h.class,
        element: h.element,
        x: Math.round(h.x),
        y: Math.round(h.y),
        hp: h.hp,
        maxHp: h.maxHp,
        mana: Math.round(h.mana),
        maxMana: h.maxMana,
        alive: h.alive,
        color: h.color,
        radius: h.radius,
        dodging: h.dodging,
        blocking: h.blocking,
        casting: h.casting ? { skill: h.casting.skill } : null,
        isControlled: h.isControlled,
        ownerPlayerId: h.ownerPlayerId,
        damageDealt: h.stats.damageDealt,
        damageTaken: h.stats.damageTaken,
        healingDone: h.stats.healingDone,
        deaths: h.stats.deaths,
        atk: h.atk,
        def: h.def,
        spd: h.spd,
        crit: h.crit,
        res: h.res,
      })),
      adds: this.adds.filter(a => a.alive).map(a => ({
        id: a.id,
        x: Math.round(a.x),
        y: Math.round(a.y),
        hp: a.hp,
        maxHp: a.maxHp,
        radius: a.radius || 15,
        type: a.type,
      })),
      projectiles: this.projectiles.filter(p => p.alive).map(p => ({
        x: Math.round(p.x),
        y: Math.round(p.y),
        radius: p.radius,
        owner: p.ownerId,
        color: p.color,
        type: p.type,
      })),
      aoeZones: this.aoeZones.filter(z => z.ttl > 0).map(z => ({
        x: Math.round(z.x),
        y: Math.round(z.y),
        radius: Math.round(z.radius),
        type: z.type,
        ttl: z.ttl,
        // Extra fields for special zone types
        ...(z.angle != null && { angle: z.angle }),
        ...(z.lineWidth && { lineWidth: z.lineWidth }),
        ...(z.color && { color: z.color }),
        ...(z._maxRadius && { maxRadius: z._maxRadius }),
        ...(z.innerSafe && { innerSafe: z.innerSafe }),
      })),
    };
  }
}
