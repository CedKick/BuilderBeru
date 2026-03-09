// ─── Expedition GameState ─────────────────────────────────
// Manages all hunters (30), boss, projectiles, adds, aggro.
// Fork of Manaya's GameState adapted for expedition (hunters instead of players).

import { ARENA, BOSS as BOSS_CFG } from '../config.js';
import { HUNTERS } from '../data/hunterData.js';

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
        shielded: this.boss.shielded || false,
        shieldHp: this.boss.shieldHp || 0,
        defDebuff: this.boss._defDebuffTimer > 0 ? { timer: Math.round(this.boss._defDebuffTimer * 10) / 10, mult: this.boss._defDebuffMult } : null,
        speedStacks: this.boss.speedStacks || 0,
        rageBuff: this.boss.rageBuff || 0,
        rageBuffTimer: Math.round((this.boss.rageBuffTimer || 0) * 10) / 10,
        stunned: this.boss._stunned || false,
        stunnedTimer: Math.round((this.boss._stunnedTimer || 0) * 10) / 10,
        burning: this.boss._burning || false,
        burnTimer: Math.round((this.boss._burnTimer || 0) * 10) / 10,
        burstActive: this.boss._burstActive || false,
        invincible: this.boss.invincible || false,
        invincibleTimer: Math.round((this.boss.invincibleTimer || 0) * 10) / 10,
        activeBuffs: (this.boss.activeBuffs || []).map(b => ({
          id: b.id, name: b.name, stacks: b.stacks, duration: Math.round(b.duration * 10) / 10, color: b.color,
        })),
        targetId: this.boss.targetId || null,
        tauntedBy: this.boss.tauntedBy || null,
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
        hp: Math.round(h.hp),
        maxHp: Math.round(h.maxHp),
        mana: Math.round(h.mana),
        maxMana: h.maxMana,
        alive: h.alive,
        color: h.color,
        radius: h.radius,
        dodging: h.dodging,
        dodgeCd: Math.round((h.dodgeCooldown || 0) * 10) / 10,
        blocking: h.blocking,
        casting: h.casting ? { skill: h.casting.skill, type: h.casting.type, progress: h.casting.duration > 0 ? h.casting.timer / h.casting.duration : 0, targetId: h.casting.targetId } : null,
        charging: h.charging ? {
          progress: Math.min(1, (Date.now() - h.charging.startTime) / 1000 / (h.charging.maxChargeTime || 4)),
          level: Math.min((h.skills?.[h.charging.skill]?.chargeLevels || 4) - 1,
            Math.floor(Math.min((Date.now() - h.charging.startTime) / 1000, h.charging.maxChargeTime || 4) / (h.charging.maxChargeTime || 4) * (h.skills?.[h.charging.skill]?.chargeLevels || 4))),
        } : null,
        comboStep: h.comboStep || 0,
        aimAngle: h.aimAngle != null ? Math.round(h.aimAngle * 100) / 100 : 0,
        isControlled: h.isControlled,
        ownerPlayerId: h.ownerPlayerId,
        damageDealt: h.stats.damageDealt,
        damageTaken: h.stats.damageTaken,
        healingDone: h.stats.healingDone,
        deaths: h.stats.deaths,
        atk: h.displayStats?.atk || h.atk,
        int: h.usesInt ? (h.displayStats?.int || h.int || 0) : 0,
        usesInt: h.usesInt || false,
        def: h.displayStats?.def || h.def,
        spd: h.displayStats?.spd || h.spd,
        crit: h.displayStats?.crit || h.crit,
        res: h.displayStats?.res || h.res,
        // Skills with cooldown state for HUD
        skills: h.skills ? {
          basic:     { name: h.skills.basic?.name,     cd: Math.round((h.cooldowns?.basic || 0) * 10) / 10, maxCd: h.skills.basic?.cooldown },
          secondary: { name: h.skills.secondary?.name,  cd: Math.round((h.cooldowns?.secondary || 0) * 10) / 10, maxCd: h.skills.secondary?.cooldown, type: h.skills.secondary?.type },
          skillA:    { name: h.skills.skillA?.name,     cd: Math.round((h.cooldowns?.skillA || 0) * 10) / 10, maxCd: h.skills.skillA?.cooldown },
          skillB:    { name: h.skills.skillB?.name,     cd: Math.round((h.cooldowns?.skillB || 0) * 10) / 10, maxCd: h.skills.skillB?.cooldown },
          ultimate:  { name: h.skills.ultimate?.name,   cd: Math.round((h.cooldowns?.ultimate || 0) * 10) / 10, maxCd: h.skills.ultimate?.cooldown },
        } : null,
        // Hunter-specific skills from hunterData (3 unique skills per hunter) + current CD
        hunterSkills: (h.hunterSkills || []).map((s, i) => ({
          name: s.name,
          power: s.power,
          cdMax: s.cdMax || 0,
          maxCd: s.maxCd || 0,
          cd: Math.round((h.hunterCds?.[i] || 0) * 10) / 10,
          buffAtk: s.buffAtk || 0,
          buffDef: s.buffDef || 0,
          healSelf: s.healSelf || 0,
          manaScaling: s.manaScaling || 0,
          selfDamage: s.selfDamage || 0,
        })),
        // Active buffs/debuffs
        activeBuffs: (h.buffs || []).map(b => ({
          type: b.type,
          stacks: b.stacks || 1,
          dur: Math.round((b.dur || 0) * 10) / 10,
          maxDur: b.maxDur || 0,
          value: b.value || 0,
          source: b.source || '',
        })),
        // Equipment info for detail panel
        equippedSets: h.expeditionGear?.sets || {},
        weaponId: h.scWeaponId || h.expeditionGear?.weaponId || null,
        weaponPassive: h.scWeaponPassive || null,
        inscriptionMana: h.inscriptionMana || 0,
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
        vx: Math.round(p.vx || 0),
        vy: Math.round(p.vy || 0),
        radius: p.radius,
        owner: p.owner || p.ownerId,
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
