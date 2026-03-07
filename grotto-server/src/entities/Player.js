import { COMBAT, XP, MAP } from '../config.js';
import { HUNTERS, getHunterSkills, getHunterStats, getHunterRole } from '../data/hunterData.js';

let playerIdCounter = 0;

export class Player {
  constructor(username, hunterId, level = 1) {
    this.id = `player_${++playerIdCounter}`;
    this.username = username;
    this.hunterId = hunterId;

    // Resolve hunter data
    const hunter = HUNTERS[hunterId];
    this.hunterName = hunter?.name || hunterId;
    this.className = getHunterRole(hunterId); // role for client rendering
    this.element = hunter?.element || 'shadow';

    // Level & XP
    this.level = level;
    this.xp = 0;
    this.totalXp = 0;

    // Compute stats from hunter data + level
    const stats = getHunterStats(hunterId, level);
    this.maxHp = stats?.maxHp || 500;
    this.hp = this.maxHp;
    this.atk = stats?.atk || 40;
    this.def = stats?.def || 20;
    this.spd = stats?.spd || 150;
    this.crit = stats?.crit || 10;
    this.res = stats?.res || 5;
    this.maxMana = stats?.maxMana || 100;
    this.mana = this.maxMana;

    // Position (pixels)
    this.x = 0;
    this.y = 0;

    // Movement input (from client)
    this.inputDx = 0;
    this.inputDy = 0;

    // State
    this.alive = true;
    this.respawnTimer = 0;

    // Combat
    this.attackTimer = 0;
    this.skillCooldowns = [0, 0, 0, 0];
    this.skills = getHunterSkills(hunterId) || [
      { name: 'Frappe', power: 100, range: 48, cd: 0 },
      { name: 'Combo', power: 180, range: 52, cd: 5 },
      { name: 'Charge', power: 150, range: 192, cd: 8, dash: true },
      { name: 'Tourbillon', power: 250, range: 64, cd: 15, aoe: true },
    ];
    this.targetId = null;
    this.attackingSkill = -1;

    // Buffs
    this.buffs = [];

    // Dodge
    this.dodgeCooldown = 0;    // seconds remaining
    this.dodgeTimer = 0;       // invulnerability remaining
    this.dodging = false;

    // Stats tracking
    this.damageDealt = 0;
    this.damageTaken = 0;
    this.healingDone = 0;
    this.kills = 0;
    this.deaths = 0;
  }

  // ── XP & Leveling ──────────────────────────────────────────

  xpToNextLevel() {
    return Math.floor(XP.BASE * Math.pow(this.level, XP.EXPONENT));
  }

  addXp(amount) {
    this.xp += amount;
    this.totalXp += amount;
    while (this.xp >= this.xpToNextLevel()) {
      this.xp -= this.xpToNextLevel();
      this.level++;
      this._onLevelUp();
    }
  }

  _onLevelUp() {
    const stats = getHunterStats(this.hunterId, this.level);
    if (stats) {
      this.maxHp = stats.maxHp;
      this.hp = this.maxHp; // Full heal on level up
      this.atk = stats.atk;
      this.def = stats.def;
      this.spd = stats.spd;
      this.crit = stats.crit;
      this.res = stats.res;
      this.maxMana = stats.maxMana;
      this.mana = this.maxMana;
    }
  }

  // ── Death & Respawn ────────────────────────────────────────

  die() {
    this.alive = false;
    this.deaths++;
    this.respawnTimer = 5 + Math.min(this.level, 10);

    const penalty = Math.floor(this.xpToNextLevel() * XP.DEATH_PENALTY);
    this.xp = Math.max(0, this.xp - penalty);
    return penalty;
  }

  updateRespawn(dt) {
    if (this.alive) return false;
    this.respawnTimer -= dt;
    if (this.respawnTimer <= 0) {
      this.alive = true;
      this.hp = Math.floor(this.maxHp * 0.5);
      this.mana = Math.floor(this.maxMana * 0.3);
      return true;
    }
    return false;
  }

  // ── Movement ───────────────────────────────────────────────

  updateMovement(dt, map) {
    if (!this.alive) return;
    if (this.inputDx === 0 && this.inputDy === 0) return;

    let dx = this.inputDx, dy = this.inputDy;
    if (dx !== 0 && dy !== 0) {
      const inv = 1 / Math.SQRT2;
      dx *= inv;
      dy *= inv;
    }

    const speed = this.getEffectiveSpeed() * (this.dodging ? 2.5 : 1);
    let nx = this.x + dx * speed * dt;
    let ny = this.y + dy * speed * dt;

    const r = 12;
    if (map.isWalkable(...Object.values(map.pixelToTile(nx - r, ny - r))) &&
        map.isWalkable(...Object.values(map.pixelToTile(nx + r, ny - r))) &&
        map.isWalkable(...Object.values(map.pixelToTile(nx - r, ny + r))) &&
        map.isWalkable(...Object.values(map.pixelToTile(nx + r, ny + r)))) {
      this.x = nx;
      this.y = ny;
    } else {
      if (map.isWalkable(...Object.values(map.pixelToTile(nx - r, this.y - r))) &&
          map.isWalkable(...Object.values(map.pixelToTile(nx + r, this.y - r))) &&
          map.isWalkable(...Object.values(map.pixelToTile(nx - r, this.y + r))) &&
          map.isWalkable(...Object.values(map.pixelToTile(nx + r, this.y + r)))) {
        this.x = nx;
      } else if (map.isWalkable(...Object.values(map.pixelToTile(this.x - r, ny - r))) &&
                 map.isWalkable(...Object.values(map.pixelToTile(this.x + r, ny - r))) &&
                 map.isWalkable(...Object.values(map.pixelToTile(this.x - r, ny + r))) &&
                 map.isWalkable(...Object.values(map.pixelToTile(this.x + r, ny + r)))) {
        this.y = ny;
      }
    }

    this.x = Math.max(MAP.TILE_SIZE, Math.min(this.x, (MAP.WIDTH - 1) * MAP.TILE_SIZE));
    this.y = Math.max(MAP.TILE_SIZE, Math.min(this.y, (MAP.HEIGHT - 1) * MAP.TILE_SIZE));
  }

  getEffectiveSpeed() {
    let speed = this.spd;
    for (const b of this.buffs) {
      if (b.type === 'spd') speed *= (1 + b.value);
    }
    return speed;
  }

  // ── Combat ─────────────────────────────────────────────────

  updateCooldowns(dt) {
    this.attackTimer = Math.max(0, this.attackTimer - dt);
    this.dodgeCooldown = Math.max(0, this.dodgeCooldown - dt);
    if (this.dodgeTimer > 0) {
      this.dodgeTimer -= dt;
      if (this.dodgeTimer <= 0) {
        this.dodgeTimer = 0;
        this.dodging = false;
      }
    }
    for (let i = 0; i < this.skillCooldowns.length; i++) {
      this.skillCooldowns[i] = Math.max(0, this.skillCooldowns[i] - dt);
    }
    this.mana = Math.min(this.maxMana, this.mana + this.maxMana * 0.02 * dt);
    for (let i = this.buffs.length - 1; i >= 0; i--) {
      this.buffs[i].duration -= dt;
      if (this.buffs[i].duration <= 0) this.buffs.splice(i, 1);
    }
  }

  dodge() {
    if (!this.alive || this.dodgeCooldown > 0 || this.dodging) return false;
    this.dodging = true;
    this.dodgeTimer = 1.0;      // 1s invulnerability
    this.dodgeCooldown = 5.0;   // 5s cooldown
    return true;
  }

  canUseSkill(idx) {
    if (!this.alive) return false;
    if (idx < 0 || idx >= this.skills.length) return false;
    if (this.skillCooldowns[idx] > 0) return false;
    const manaCost = idx === 0 ? 0 : Math.floor(this.maxMana * 0.15);
    return this.mana >= manaCost;
  }

  useSkill(idx) {
    if (!this.canUseSkill(idx)) return null;
    const skill = this.skills[idx];
    this.skillCooldowns[idx] = skill.cd;
    if (idx > 0) {
      this.mana -= Math.floor(this.maxMana * 0.15);
    }
    this.attackTimer = COMBAT.PLAYER_ATTACK_INTERVAL;
    return skill;
  }

  takeDamage(amount) {
    if (!this.alive) return 0;
    if (this.dodging) return 0; // invulnerable during dodge
    const effectiveDef = this.getEffectiveDef();
    const dmgMult = COMBAT.DEF_CONSTANT / (COMBAT.DEF_CONSTANT + effectiveDef);
    const dmg = Math.floor(amount * dmgMult);
    this.hp = Math.max(0, this.hp - dmg);
    this.damageTaken += dmg;
    if (this.hp <= 0) {
      this.die();
    }
    return dmg;
  }

  heal(amount) {
    if (!this.alive) return 0;
    const healed = Math.min(this.maxHp - this.hp, Math.floor(amount));
    this.hp += healed;
    return healed;
  }

  getEffectiveDef() {
    let def = this.def;
    for (const b of this.buffs) {
      if (b.type === 'def') def += b.value;
    }
    return def;
  }

  getEffectiveAtk() {
    let atk = this.atk;
    for (const b of this.buffs) {
      if (b.type === 'atk') atk = Math.floor(atk * (1 + b.value));
    }
    return atk;
  }

  // ── Serialization ──────────────────────────────────────────

  serialize() {
    return {
      id: this.id,
      username: this.username,
      hunterId: this.hunterId,
      hunterName: this.hunterName,
      className: this.className,
      element: this.element,
      level: this.level,
      xp: this.xp,
      xpNext: this.xpToNextLevel(),
      hp: this.hp,
      maxHp: this.maxHp,
      mana: this.mana,
      maxMana: this.maxMana,
      atk: this.getEffectiveAtk(),
      def: this.getEffectiveDef(),
      x: Math.round(this.x),
      y: Math.round(this.y),
      alive: this.alive,
      respawnTimer: Math.ceil(this.respawnTimer),
      cooldowns: this.skillCooldowns.map(c => Math.ceil(c * 10) / 10),
      buffs: this.buffs.map(b => ({ type: b.type, duration: Math.ceil(b.duration) })),
      kills: this.kills,
      deaths: this.deaths,
      attackingSkill: this.attackingSkill,
      targetId: this.targetId,
      dodging: this.dodging,
      dodgeCd: Math.ceil(this.dodgeCooldown * 10) / 10,
    };
  }
}

export function resetPlayerIdCounter() { playerIdCounter = 0; }
