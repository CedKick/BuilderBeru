import { PLAYER, ARENA } from '../config.js';
import { CLASS_STATS, CLASS_SKILLS } from '../data/classStats.js';
import { buildPlayerStats } from '../data/playerStatsAdapter.js';

export class Player {
  constructor(id, username, playerClass, x, y, colosseumData = null) {
    this.id = id;
    this.username = username;
    this.class = playerClass;
    this.connected = true;

    // Position & movement
    this.x = x;
    this.y = y;
    this.radius = PLAYER.RADIUS;
    this.moveDir = { x: 0, y: 0 };
    this.aimAngle = 0;

    // Stats: use ShadowColosseum data if available, otherwise class defaults
    const stats = buildPlayerStats(playerClass, colosseumData);
    this.maxHp = stats.maxHp;
    this.hp = stats.hp;
    this.maxMana = stats.maxMana;
    this.mana = stats.mana;
    this.atk = stats.atk;
    this.def = stats.def;
    this.spd = stats.spd;
    this.crit = stats.crit;
    this.res = stats.res;
    this.aggroMult = stats.aggroMult;
    this.color = stats.color;

    // Main hunter (avatar) info
    this.mainHunter = stats.mainHunter || null;
    this.supportHunters = stats.hunters || [null, null, null];
    this.hunterLevels = stats.hunterLevels || {};
    this.hunterStars = stats.hunterStars || {};

    // Skills (copy from class definition)
    this.skills = { ...CLASS_SKILLS[playerClass] };

    // Cooldowns: skill -> remaining seconds
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
    this.casting = null;        // { skill, timer, angle }
    this.invulnerable = false;
    this.invulnTimer = 0;

    // Tank Endurance (only used by tank class)
    this.maxEndurance = playerClass === 'tank' ? 100 : 0;
    this.endurance = this.maxEndurance;

    // Buffs/Debuffs
    this.buffs = [];
    // Each buff: { type, stacks, dur, tickTimer, value, source }

    // Hunter summon cooldowns
    this.hunterCooldowns = [0, 0, 0];

    // Combat stats tracking
    this.stats = {
      damageDealt: 0,
      damageTaken: 0,
      healingDone: 0,
      deaths: 0,
    };
  }

  get speed() {
    // Base speed scaled by SPD stat
    let speed = PLAYER.BASE_SPEED * (this.spd / 180);
    if (this.blocking) speed *= this.skills.secondary.speedMult || 0.3;
    // Apply speed buffs/debuffs
    for (const b of this.buffs) {
      if (b.type === 'speed_up') speed *= (1 + b.value);
      if (b.type === 'speed_down') speed *= (1 - b.value);
    }
    return speed;
  }

  takeDamage(rawDamage, source) {
    if (!this.alive || this.invulnerable) return 0;
    if (this.dodging && this.dodgeTimer < PLAYER.DODGE_IFRAMES) return 0;

    let damage = rawDamage;

    // Block damage reduction (tank)
    if (this.blocking && this.skills.secondary?.type === 'block') {
      damage *= (1 - this.skills.secondary.damageReduction);
      // Tank endurance cost on hit while blocking (15-30 per hit)
      if (this.maxEndurance > 0) {
        const enduranceCost = 15 + Math.floor(Math.random() * 16); // 15-30
        this.endurance = Math.max(0, this.endurance - enduranceCost);
        if (this.endurance <= 0) {
          this.blocking = false; // Force unblock when out of endurance
        }
      }
    }

    // Defense reduction
    damage *= (100 / (100 + this.def));

    // Apply damage
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
    // Stack if same type
    const existing = this.buffs.find(b => b.type === buff.type);
    if (existing && buff.stackable) {
      existing.stacks = Math.min(existing.stacks + 1, buff.maxStacks || 99);
      existing.dur = buff.dur; // Refresh duration
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
  }

  clampPosition() {
    const wall = ARENA.WALL_THICKNESS + this.radius;
    this.x = Math.max(wall, Math.min(ARENA.WIDTH - wall, this.x));
    this.y = Math.max(wall, Math.min(ARENA.HEIGHT - wall, this.y));
  }
}
