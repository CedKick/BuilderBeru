// ─── Hunter Entity ────────────────────────────────────────
// Fork of Manaya's Player.js adapted for expedition.
// Each Hunter is one of a player's 6 characters fighting in real-time combat.
// Non-controlled hunters are run by BotAI.

import { PLAYER, ARENA } from '../config.js';
import { CLASS_SKILLS } from '../data/classStats.js';
import { buildCombatStats, getCombatClass } from '../data/classMapping.js';
import { HUNTERS } from '../data/hunterData.js';

export class Hunter {
  constructor({ id, username, hunterId, hunterName, inscriptionStats, ownerPlayerId, slotIndex }) {
    this.id = id;                      // Unique ID (e.g., "kly_h_frieren")
    this.username = username;          // Display name
    this.hunterId = hunterId;          // e.g., "h_frieren"
    this.hunterName = hunterName;      // e.g., "Frieren"
    this.ownerPlayerId = ownerPlayerId;// Which player owns this hunter
    this.slotIndex = slotIndex;        // 0-5 (for 1-6 key switch)
    this.isControlled = false;         // True when player is actively controlling this hunter
    this.isBot = true;                 // Default: AI-controlled

    // Combat class (from hunter class → Manaya class mapping)
    this.class = getCombatClass(hunterId);
    this.element = HUNTERS[hunterId]?.element || 'shadow';
    this.connected = true;

    // Stats from inscription data + class multipliers
    const stats = buildCombatStats(hunterId, inscriptionStats);
    this.maxHp = stats.maxHp;
    this.hp = stats.hp;
    this.maxMana = stats.maxMana;
    this.useRage = stats.useRage;
    this.mana = stats.mana;
    this.atk = stats.atk;
    this.def = stats.def;
    this.spd = stats.spd;
    this.crit = stats.crit;
    this.res = stats.res;
    this.aggroMult = stats.aggroMult;
    this.color = stats.color;
    this.dmgBonus = 0;

    // Store base stats for reset between encounters
    this._baseStats = {
      maxHp: this.maxHp, atk: this.atk, def: this.def,
      spd: this.spd, crit: this.crit, res: this.res,
    };

    // Position & movement
    this.x = 0;
    this.y = 0;
    this.radius = PLAYER.RADIUS;
    this.moveDir = { x: 0, y: 0 };
    this.aimAngle = 0;

    // Skills (from Manaya class definition)
    this.skills = { ...CLASS_SKILLS[this.class] };

    // Cooldowns
    this.cooldowns = {
      basic: 0,
      secondary: 0,
      skillA: 0,
      skillB: 0,
      ultimate: 0,
    };

    // State
    this.alive = true;
    this.dodging = false;
    this.dodgeTimer = 0;
    this.dodgeCooldown = 0;
    this.dodgeDir = { x: 0, y: 0 };
    this.blocking = false;
    this.casting = null;
    this.charging = null;
    this.invulnerable = false;
    this.invulnTimer = 0;

    // Tank endurance
    this.maxEndurance = this.class === 'tank' ? 100 : 0;
    this.endurance = this.maxEndurance;

    // Buffs/Debuffs
    this.buffs = [];

    // Hunter summon cooldowns (unused in expedition — kept for compatibility)
    this.hunterCooldowns = [0, 0, 0];

    // Combo system (melee only)
    this.comboStep = 0;
    this.comboTimer = 0;
    this.comboActive = false;
    this.comboLocked = false;

    // Combat stats tracking
    this.stats = {
      damageDealt: 0,
      damageTaken: 0,
      healingDone: 0,
      deaths: 0,
    };
  }

  get speed() {
    let speed = PLAYER.BASE_SPEED * (this.spd / 180);
    if (this.blocking) speed *= this.skills.secondary?.speedMult || 0.3;
    for (const b of this.buffs) {
      if (b.type === 'speed_up') speed *= (1 + b.value);
      if (b.type === 'speed_down') speed *= (1 - b.value);
    }
    return speed;
  }

  takeTrueDamage(rawDamage, source) {
    if (!this.alive || this.invulnerable) return 0;
    if (this.dodging && this.dodgeTimer < PLAYER.DODGE_IFRAMES) return 0;
    const damage = Math.max(1, Math.round(rawDamage));
    this.hp -= damage;
    this.stats.damageTaken += damage;
    if (this.hp <= 0) { this.hp = 0; this.alive = false; this.stats.deaths++; }
    return damage;
  }

  takeDamage(rawDamage, source) {
    if (!this.alive || this.invulnerable) return 0;
    if (this.dodging && this.dodgeTimer < PLAYER.DODGE_IFRAMES) return 0;

    let damage = rawDamage;

    // Block reduction
    if (this.blocking && this.skills.secondary?.type === 'block') {
      damage *= (1 - this.skills.secondary.damageReduction);
      if (this.maxEndurance > 0) {
        const cost = 15 + Math.floor(Math.random() * 16);
        this.endurance = Math.max(0, this.endurance - cost);
        if (this.endurance <= 0) this.blocking = false;
      }
    }

    // Defense reduction
    damage *= (100 / (100 + this.def));
    damage = Math.max(1, Math.round(damage));
    this.hp -= damage;
    this.stats.damageTaken += damage;

    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      this.stats.deaths++;
    }
    return damage;
  }

  heal(amount) {
    if (!this.alive) return 0;
    const actual = Math.min(amount, this.maxHp - this.hp);
    this.hp += actual;
    return actual;
  }

  useMana(cost) {
    if (this.mana < cost) return false;
    this.mana -= cost;
    return true;
  }

  addBuff(buff) {
    const existing = this.buffs.find(b => b.type === buff.type);
    if (existing && buff.stackable) {
      existing.stacks = Math.min(existing.stacks + 1, buff.maxStacks || 99);
      existing.dur = buff.dur;
    } else {
      this.buffs.push({
        type: buff.type,
        stacks: buff.stacks || 1,
        dur: buff.dur,
        maxDur: buff.dur,
        tickTimer: buff.tickInterval || 0,
        tickInterval: buff.tickInterval || 0,
        value: buff.value || 0,
        damage: buff.damage || 0,
        stackable: buff.stackable || false,
        maxStacks: buff.maxStacks || 99,
        source: buff.source || 'boss',
      });
    }
  }

  removeBuff(type) {
    this.buffs = this.buffs.filter(b => b.type !== type);
  }

  removeAllDebuffs() {
    this.buffs = this.buffs.filter(b =>
      !b.type.startsWith('debuff_') && b.type !== 'poison' && b.type !== 'speed_down'
    );
  }

  resurrect(hpPercent) {
    if (this.alive) return;
    this.alive = true;
    this.hp = Math.floor(this.maxHp * hpPercent);
    this.mana = Math.floor(this.maxMana * 0.3);
    this.buffs = [];
    this.dodging = false;
    this.blocking = false;
    this.casting = null;
    this.charging = null;
  }

  // Reset for new encounter (campfire → next boss)
  resetForEncounter() {
    // Restore base stats
    this.maxHp = this._baseStats.maxHp;
    this.atk = this._baseStats.atk;
    this.def = this._baseStats.def;
    this.spd = this._baseStats.spd;
    this.crit = this._baseStats.crit;
    this.res = this._baseStats.res;
    // Don't reset HP/mana — campfire handles that
    this.buffs = [];
    this.cooldowns = { basic: 0, secondary: 0, skillA: 0, skillB: 0, ultimate: 0 };
    this.dodging = false;
    this.dodgeCooldown = 0;
    this.blocking = false;
    this.casting = null;
    this.charging = null;
    this.invulnerable = false;
    this.invulnTimer = 0;
    this.comboStep = 0;
    this.comboTimer = 0;
    this.comboActive = false;
    this.comboLocked = false;
  }

  clampPosition() {
    const wall = ARENA.WALL_THICKNESS + this.radius;
    this.x = Math.max(wall, Math.min(ARENA.WIDTH - wall, this.x));
    this.y = Math.max(wall, Math.min(ARENA.HEIGHT - wall, this.y));
  }
}
