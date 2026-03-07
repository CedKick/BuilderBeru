// ── Player Entity (server-side) — Full Manaya-style class system ──

import { GAME } from '../config.js';
import { isInLava, resolveWallCollision } from '../data/mapData.js';

// ── CLASS STATS ──
const CLASSES = {
  archer: {
    label: 'Archer', hp: 40000, mana: 800, atk: 6000, speed: 250,
    critRate: 0.35, critDmg: 2.5, color: '#4ade80',
  },
  berserker: {
    label: 'Berserker', hp: 60000, mana: 600, atk: 7500, speed: 230,
    critRate: 0.30, critDmg: 2.2, color: '#ef4444',
  },
  warrior: {
    label: 'Warrior', hp: 55000, mana: 700, atk: 5500, speed: 220,
    critRate: 0.25, critDmg: 2.0, color: '#f59e0b', useRage: true,
  },
  tank: {
    label: 'Tank', hp: 80000, mana: 600, atk: 5000, speed: 190,
    critRate: 0.15, critDmg: 1.8, color: '#60a5fa',
  },
  healer: {
    label: 'Healer', hp: 45000, mana: 1200, atk: 3500, speed: 220,
    critRate: 0.20, critDmg: 1.8, color: '#a78bfa',
  },
  mage: {
    label: 'Mage', hp: 38000, mana: 1000, atk: 7000, speed: 210,
    critRate: 0.30, critDmg: 2.4, color: '#c084fc',
  },
};

// ── SKILL DEFINITIONS (from Manaya) ──
const CLASS_SKILLS = {
  archer: {
    basic: {
      name: 'Tir rapide', hitbox: 'projectile',
      dmgMult: 0.91, projSpeed: 800, projRange: 900, projRadius: 10,
      cd: 210, manaRegen: 12, animDur: 130,
      color: '#4ade80', critColor: '#ffd700',
    },
    secondary: {
      name: 'Tir charge', type: 'projectile', hitbox: 'projectile',
      dmgMult: 2.35, projSpeed: 900, projRange: 1000, projRadius: 14,
      cd: 1020, manaCost: 25, animDur: 170, piercing: true,
      color: '#ffd700', critColor: '#fff',
    },
    skillA: {
      name: 'Pluie de fleches', type: 'arrow_rain',
      dmgMult: 2.6, radius: 180, duration: 2000, tickRate: 260,
      cd: 7000, manaCost: 70,
    },
    skillB: {
      name: 'Piege explosif', type: 'trap',
      dmgMult: 3.9, radius: 90, duration: 12000,
      cd: 8500, manaCost: 50,
    },
    ultimate: {
      name: 'Barrage', type: 'channel',
      dmgMult: 1.3, hits: 12, interval: 215, range: 550, coneAngle: 35,
      cd: 35000, manaCost: 160,
    },
  },
  berserker: {
    basic: {
      name: 'Frappe brutale', hitbox: 'cone',
      dmgMult: 1.2, range: 100, coneAngle: 70,
      cd: 400, manaRegen: 20, animDur: 300,
      color: '#ef4444', critColor: '#ffd700',
    },
    secondary: {
      name: 'Garde', type: 'block',
      damageReduction: 0.50, manaCostPerSec: 6, speedMult: 0.4,
    },
    skillA: {
      name: 'Rage du Berserker', type: 'buff_self',
      atkBonus: 0.8, spdBonus: 0.2, duration: 10000,
      cd: 20000, manaCost: 0,
    },
    skillB: {
      name: 'Frappe chargee', type: 'charged_attack',
      dmgMults: [1.5, 3.0, 5.0, 8.0], // Level 0-3 damage multipliers
      range: 100, coneAngle: 60, chargeTime: 4000, // 4s max charge
      cd: 1000, manaCost: 0,
    },
    ultimate: {
      name: 'Tourbillon', type: 'whirlwind',
      dmgMult: 4, radius: 250, duration: 4000, tickRate: 500, hits: 8,
      cd: 30000, manaCost: 90,
    },
  },
  warrior: {
    basic: {
      name: 'Combo de lames', hitbox: 'cone',
      dmgMult: 1.3, range: 95, coneAngle: 65,
      cd: 300, rageGain: 18, animDur: 220,
      color: '#f59e0b', critColor: '#ffd700',
    },
    secondary: {
      name: 'Frappe lourde', type: 'cone_attack',
      dmgMult: 3.0, range: 95, coneAngle: 50,
      cd: 900, manaCost: 15, animDur: 260,
      color: '#f59e0b',
    },
    skillA: {
      name: 'Tempete de lames', type: 'aoe_self',
      dmgMult: 4.5, radius: 150,
      cd: 6000, manaCost: 40,
    },
    skillB: {
      name: 'Dash Offensif', type: 'dash_attack',
      dmgMult: 2.8, dashDistance: 240,
      cd: 4500, manaCost: 25,
    },
    ultimate: {
      name: 'Execution', type: 'single_target',
      dmgMult: 12, range: 120, bonusVsLowHp: 0.5,
      cd: 35000, manaCost: 80,
    },
  },
  tank: {
    basic: {
      name: 'Frappe de bouclier', hitbox: 'cone',
      dmgMult: 1.8, range: 85, coneAngle: 90,
      cd: 450, manaRegen: 18, animDur: 300,
      color: '#60a5fa', critColor: '#ffd700',
    },
    secondary: {
      name: 'Bloquer', type: 'block',
      damageReduction: 0.75, manaCostPerSec: 4, speedMult: 0.3,
    },
    skillA: {
      name: 'Provocation', type: 'taunt',
      radius: 300, cd: 10000, manaCost: 40,
    },
    skillB: {
      name: 'Bouclier Sacre', type: 'party_shield',
      radius: 250, shieldHpMult: 0.3, duration: 6000,
      cd: 18000, manaCost: 70,
    },
    ultimate: {
      name: 'Forteresse', type: 'fortify',
      radius: 300, duration: 5000,
      cd: 50000, manaCost: 120,
    },
  },
  healer: {
    basic: {
      name: 'Trait de lumiere', hitbox: 'projectile',
      dmgMult: 0.6, projSpeed: 600, projRange: 700, projRadius: 11,
      cd: 350, manaRegen: 10, animDur: 200,
      color: '#a78bfa', critColor: '#ffd700',
    },
    secondary: {
      name: 'Cercle de Soin', type: 'heal_zone',
      healPct: 0.10, radius: 100, duration: 4000, ticks: 5,
      cd: 2500, manaCost: 30,
    },
    skillA: {
      name: 'Soin de Zone', type: 'heal_aoe',
      healPct: 0.10, radius: 300,
      cd: 6000, manaCost: 55,
    },
    skillB: {
      name: 'Purification', type: 'cleanse',
      radius: 300, cd: 12000, manaCost: 40,
    },
    ultimate: {
      name: 'Resurrection', type: 'resurrect',
      radius: 200, channelDuration: 6000,
      cd: 45000, manaCost: 200,
    },
  },

  mage: {
    basic: {
      name: 'Trait arcanique', hitbox: 'projectile',
      dmgMult: 0.8, projSpeed: 700, projRange: 800, projRadius: 12,
      cd: 300, manaRegen: 15, animDur: 200,
      color: '#c084fc', critColor: '#ffd700',
    },
    secondary: {
      name: 'Orbe de feu', type: 'projectile', hitbox: 'projectile',
      dmgMult: 2.0, projSpeed: 600, projRange: 900, projRadius: 18,
      cd: 1500, manaCost: 35, animDur: 250, piercing: true,
      color: '#ff6b35', critColor: '#fff',
    },
    skillA: {
      name: 'Explosion arcanique', type: 'arrow_rain',
      dmgMult: 2.5, radius: 200, duration: 2500, tickRate: 400,
      cd: 9000, manaCost: 80,
    },
    skillB: {
      name: 'Teleportation', type: 'dash_attack',
      dmgMult: 1.5, dashDistance: 280,
      cd: 6000, manaCost: 30,
    },
    ultimate: {
      name: 'Rayon destructeur', type: 'channel',
      dmgMult: 1.5, hits: 10, interval: 300, range: 650, coneAngle: 25,
      cd: 35000, manaCost: 200,
    },
  },
};

export { CLASSES, CLASS_SKILLS };

export class Player {
  constructor(id, username, playerClass = 'archer') {
    this.id = id;
    this.username = username;
    this.playerClass = CLASSES[playerClass] ? playerClass : 'archer';
    const cls = CLASSES[this.playerClass];

    // Position
    this.x = GAME.PLAYER_SPAWN.x + (Math.random() - 0.5) * 100;
    this.y = GAME.PLAYER_SPAWN.y + (Math.random() - 0.5) * 60;

    // Movement input
    this.inputX = 0;
    this.inputY = 0;
    this.facing = 'down';
    this.moving = false;

    // Stats from class
    this.hp = cls.hp;
    this.maxHp = cls.hp;
    this.maxMana = cls.mana;
    this.useRage = !!cls.useRage;
    this.mana = this.useRage ? 0 : cls.mana; // Rage starts at 0
    this.alive = true;
    this.speed = cls.speed;
    this.radius = GAME.PLAYER_RADIUS;
    this.atk = cls.atk;
    this.critRate = cls.critRate;
    this.critDmg = cls.critDmg;

    // AI bot flag
    this.isBot = false;
    this.botRole = 'dps';

    // Knockback state
    this.knockbackVx = 0;
    this.knockbackVy = 0;
    this.knockbackEnd = 0;

    // Lava damage tracking
    this.lastLavaTick = 0;

    // Invulnerability frames
    this.invulnUntil = 0;

    // Mana regen
    this.lastManaRegen = 0;

    // Spell cooldowns (timestamps) — 6 slots
    this.cooldowns = {
      basic: 0,       // LMB
      secondary: 0,   // RMB
      skillA: 0,      // A
      skillB: 0,      // E
      ultimate: 0,    // R
      dash: 0,        // Space
    };

    // Shield state
    this.shieldActive = false;
    this.shieldEnd = 0;
    this.shieldHp = 0;

    // Block state (tank/berserker RMB hold)
    this.blocking = false;

    // Buff state
    this.atkBuff = 0;    // +ATK multiplier
    this.spdBuff = 0;    // +SPD multiplier
    this.buffEnd = 0;

    // Charge state (berserker E)
    this.charging = false;
    this.chargeStart = 0;

    // Channel state (archer R barrage)
    this.channeling = false;
    this.channelData = null;

    // Dash state
    this.dashing = false;
    this.dashEnd = 0;
    this.dashVx = 0;
    this.dashVy = 0;

    // Combo tracker
    this.comboCount = 0;
    this.lastComboHit = 0;
    this.comboSpell = null;

    // Attack animation state
    this.attacking = false;
    this.attackEnd = 0;
  }

  getSpeed() {
    let spd = this.speed;
    if (this.blocking) {
      const skill = CLASS_SKILLS[this.playerClass]?.secondary;
      spd *= (skill?.speedMult || 0.4);
    }
    if (Date.now() < this.buffEnd && this.spdBuff > 0) {
      spd *= (1 + this.spdBuff);
    }
    return spd;
  }

  getAtk() {
    let atk = this.atk;
    if (Date.now() < this.buffEnd && this.atkBuff > 0) {
      atk *= (1 + this.atkBuff);
    }
    return atk;
  }

  update(dt, now) {
    if (!this.alive) return;

    // Passive mana regen (warrior uses rage: no passive regen)
    if (!this.useRage && now - this.lastManaRegen >= 500) {
      this.lastManaRegen = now;
      this.mana = Math.min(this.maxMana, this.mana + 5);
    }

    // Shield expiry
    if (this.shieldActive && (now >= this.shieldEnd || this.shieldHp <= 0)) {
      this.shieldActive = false;
      this.shieldHp = 0;
    }

    // Buff expiry
    if (this.atkBuff > 0 && now >= this.buffEnd) {
      this.atkBuff = 0;
      this.spdBuff = 0;
    }

    // Block mana drain
    if (this.blocking) {
      const skill = CLASS_SKILLS[this.playerClass]?.secondary;
      if (skill?.type === 'block' && skill.manaCostPerSec > 0) {
        const cost = skill.manaCostPerSec * dt;
        this.mana -= cost;
        if (this.mana <= 0) {
          this.mana = 0;
          this.blocking = false;
        }
      }
    }

    // Attack animation expiry
    if (this.attacking && now >= this.attackEnd) {
      this.attacking = false;
    }

    // Dash expiry
    if (this.dashing && now >= this.dashEnd) {
      this.dashing = false;
      this.invulnUntil = 0;
    }

    // Channel update
    if (this.channeling && this.channelData) {
      const cd = this.channelData;
      if (now >= cd.nextTick && cd.hitsLeft > 0) {
        cd.nextTick = now + cd.interval;
        cd.hitsLeft--;
        cd.tickReady = true; // GameEngine reads this
      }
      if (cd.hitsLeft <= 0 || now >= cd.endTime) {
        this.channeling = false;
        this.channelData = null;
      }
    }

    // Combo decay (1.5s window)
    if (this.comboCount > 0 && now - this.lastComboHit > 1500) {
      this.comboCount = 0;
      this.comboSpell = null;
    }

    let vx = 0;
    let vy = 0;
    const currentSpeed = this.getSpeed();

    if (this.dashing) {
      vx = this.dashVx;
      vy = this.dashVy;
    } else if (now < this.knockbackEnd) {
      vx = this.knockbackVx;
      vy = this.knockbackVy;
    } else if (this.channeling) {
      // Can't move while channeling
      this.moving = false;
    } else {
      const len = Math.sqrt(this.inputX * this.inputX + this.inputY * this.inputY);
      if (len > 0.01) {
        vx = (this.inputX / len) * currentSpeed;
        vy = (this.inputY / len) * currentSpeed;
        this.moving = true;
        if (Math.abs(this.inputX) > Math.abs(this.inputY)) {
          this.facing = this.inputX > 0 ? 'right' : 'left';
        } else {
          this.facing = this.inputY > 0 ? 'down' : 'up';
        }
      } else {
        this.moving = false;
      }
    }

    let newX = this.x + vx * dt;
    let newY = this.y + vy * dt;
    const resolved = resolveWallCollision(newX, newY, this.radius);
    newX = resolved.x;
    newY = resolved.y;
    newX = Math.max(this.radius, Math.min(GAME.ARENA_WIDTH - this.radius, newX));
    newY = Math.max(this.radius, Math.min(GAME.ARENA_HEIGHT - this.radius, newY));
    this.x = newX;
    this.y = newY;

    // Lava damage
    if (isInLava(this.x, this.y)) {
      if (now - this.lastLavaTick >= GAME.LAVA_TICK_MS) {
        this.lastLavaTick = now;
        this.takeDamage(GAME.LAVA_DAMAGE, 'lava');
      }
    }
  }

  applyKnockback(fromX, fromY, speed, duration) {
    const dx = this.x - fromX;
    const dy = this.y - fromY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    this.knockbackVx = (dx / dist) * speed;
    this.knockbackVy = (dy / dist) * speed;
    this.knockbackEnd = Date.now() + duration;
  }

  takeDamage(amount, source = 'unknown') {
    if (!this.alive) return;
    if (Date.now() < this.invulnUntil) return;

    // Block damage reduction
    if (this.blocking) {
      const skill = CLASS_SKILLS[this.playerClass]?.secondary;
      if (skill?.type === 'block') {
        amount *= (1 - skill.damageReduction);
      }
    }

    if (this.shieldActive && this.shieldHp > 0) {
      const absorbed = Math.min(this.shieldHp, amount);
      this.shieldHp -= absorbed;
      amount -= absorbed;
      if (this.shieldHp <= 0) this.shieldActive = false;
      if (amount <= 0) return;
    }

    this.hp = Math.max(0, this.hp - amount);
    if (this.hp <= 0) this.alive = false;
  }

  heal(amount) {
    if (!this.alive) return 0;
    const before = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    return this.hp - before;
  }

  setInput(x, y) {
    this.inputX = x;
    this.inputY = y;
  }

  // ── Cast spell ──
  castSpell(spellId, now) {
    if (!this.alive) return null;
    if (this.channeling) return null; // Can't cast while channeling
    if (now < (this.cooldowns[spellId] || 0)) return null;

    const skills = CLASS_SKILLS[this.playerClass];
    if (!skills) return null;

    switch (spellId) {
      case 'basic': {
        const s = skills.basic;
        // Mana/Rage on hit
        if (s.manaRegen) this.mana = Math.min(this.maxMana, this.mana + s.manaRegen);
        if (s.rageGain) this.mana = Math.min(this.maxMana, this.mana + s.rageGain);
        this.cooldowns.basic = now + s.cd;
        this.attacking = true;
        this.attackEnd = now + s.animDur;
        const isCrit = Math.random() < this.critRate;
        const baseDmg = Math.floor(this.getAtk() * s.dmgMult);
        const damage = isCrit ? Math.floor(baseDmg * this.critDmg) : baseDmg;

        if (s.hitbox === 'cone') {
          return { type: 'cone', spell: 'basic', damage, crit: isCrit,
            range: s.range, coneAngle: s.coneAngle,
            color: isCrit ? s.critColor : s.color };
        }
        return { type: 'projectile', spell: 'basic', damage, crit: isCrit,
          range: s.projRange, speed: s.projSpeed, radius: s.projRadius,
          color: isCrit ? s.critColor : s.color };
      }

      case 'secondary': {
        const s = skills.secondary;
        if (!s) return null;

        if (s.type === 'block') {
          // Toggle handled by GameEngine (start/stop)
          return { type: 'block_start' };
        }
        if (s.type === 'heal_zone') {
          if (this.mana < s.manaCost) return null;
          this.mana -= s.manaCost;
          this.cooldowns.secondary = now + s.cd;
          return { type: 'heal_zone', spell: 'secondary',
            healAmount: s.healAmount, healPct: s.healPct,
            radius: s.radius, duration: s.duration, ticks: s.ticks };
        }
        // Projectile secondary (archer charged shot)
        if (s.hitbox === 'projectile') {
          if (s.manaCost && this.mana < s.manaCost) return null;
          if (s.manaCost) this.mana -= s.manaCost;
          this.cooldowns.secondary = now + s.cd;
          this.attacking = true;
          this.attackEnd = now + (s.animDur || 200);
          const isCrit = Math.random() < this.critRate;
          const baseDmg = Math.floor(this.getAtk() * s.dmgMult);
          const damage = isCrit ? Math.floor(baseDmg * this.critDmg) : baseDmg;
          return { type: 'projectile', spell: 'secondary', damage, crit: isCrit,
            range: s.projRange, speed: s.projSpeed, radius: s.projRadius,
            piercing: s.piercing, color: isCrit ? (s.critColor || '#fff') : s.color };
        }
        // Cone secondary (warrior heavy strike)
        if (s.type === 'cone_attack') {
          if (s.manaCost && this.mana < s.manaCost) return null;
          if (s.manaCost) this.mana -= s.manaCost;
          this.cooldowns.secondary = now + s.cd;
          this.attacking = true;
          this.attackEnd = now + (s.animDur || 300);
          const isCrit = Math.random() < this.critRate;
          const baseDmg = Math.floor(this.getAtk() * s.dmgMult);
          const damage = isCrit ? Math.floor(baseDmg * this.critDmg) : baseDmg;
          return { type: 'cone', spell: 'secondary', damage, crit: isCrit,
            range: s.range, coneAngle: s.coneAngle, color: s.color };
        }
        return null;
      }

      case 'skillA': {
        const s = skills.skillA;
        if (!s) return null;
        if (s.manaCost && this.mana < s.manaCost) return null;
        if (s.manaCost) this.mana -= s.manaCost;
        this.cooldowns.skillA = now + s.cd;

        if (s.type === 'buff_self') {
          this.atkBuff = s.atkBonus || 0;
          this.spdBuff = s.spdBonus || 0;
          this.buffEnd = now + s.duration;
          return { type: 'buff_self', spell: 'skillA', duration: s.duration,
            atkBonus: s.atkBonus, spdBonus: s.spdBonus };
        }
        if (s.type === 'arrow_rain') {
          const isCrit = Math.random() < this.critRate;
          const baseDmg = Math.floor(this.getAtk() * s.dmgMult);
          return { type: 'arrow_rain', spell: 'skillA',
            damage: isCrit ? Math.floor(baseDmg * this.critDmg) : baseDmg,
            crit: isCrit, radius: s.radius, duration: s.duration, tickRate: s.tickRate,
            playerClass: this.playerClass };
        }
        if (s.type === 'aoe_self') {
          const isCrit = Math.random() < this.critRate;
          const baseDmg = Math.floor(this.getAtk() * s.dmgMult);
          return { type: 'ground_slam', spell: 'skillA',
            damage: isCrit ? Math.floor(baseDmg * this.critDmg) : baseDmg,
            crit: isCrit, radius: s.radius, duration: 800, tickRate: 800,
            playerClass: this.playerClass };
        }
        if (s.type === 'taunt') {
          return { type: 'taunt', spell: 'skillA', radius: s.radius };
        }
        if (s.type === 'heal_aoe') {
          return { type: 'heal_aoe', spell: 'skillA',
            healAmount: s.healAmount, healPct: s.healPct, radius: s.radius };
        }
        return null;
      }

      case 'skillB': {
        const s = skills.skillB;
        if (!s) return null;
        if (s.manaCost && this.mana < s.manaCost) return null;

        if (s.type === 'charged_attack') {
          // Start charging — release handled separately
          if (this.charging) return null;
          this.charging = true;
          this.chargeStart = now;
          return { type: 'charge_start', spell: 'skillB' };
        }
        if (s.type === 'trap') {
          this.mana -= s.manaCost;
          this.cooldowns.skillB = now + s.cd;
          const isCrit = Math.random() < this.critRate;
          const baseDmg = Math.floor(this.getAtk() * s.dmgMult);
          return { type: 'trap', spell: 'skillB',
            damage: isCrit ? Math.floor(baseDmg * this.critDmg) : baseDmg,
            crit: isCrit, radius: s.radius, duration: s.duration };
        }
        if (s.type === 'dash_attack') {
          this.mana -= s.manaCost;
          this.cooldowns.skillB = now + s.cd;
          const isCrit = Math.random() < this.critRate;
          const baseDmg = Math.floor(this.getAtk() * s.dmgMult);
          return { type: 'dash_attack', spell: 'skillB',
            damage: isCrit ? Math.floor(baseDmg * this.critDmg) : baseDmg,
            crit: isCrit, dashDistance: s.dashDistance };
        }
        if (s.type === 'party_shield') {
          this.mana -= s.manaCost;
          this.cooldowns.skillB = now + s.cd;
          return { type: 'party_shield', spell: 'skillB',
            radius: s.radius, shieldHpMult: s.shieldHpMult, duration: s.duration };
        }
        if (s.type === 'cleanse') {
          this.mana -= s.manaCost;
          this.cooldowns.skillB = now + s.cd;
          return { type: 'cleanse', spell: 'skillB', radius: s.radius };
        }
        return null;
      }

      case 'skillB_release': {
        // Berserker charged attack release
        if (!this.charging) return null;
        const s = skills.skillB;
        if (!s || s.type !== 'charged_attack') { this.charging = false; return null; }

        const chargeMs = now - this.chargeStart;
        const maxCharge = s.chargeTime || 4000;
        const chargeLevel = Math.min(3, Math.floor((chargeMs / maxCharge) * 4));
        const chargePct = Math.min(1, chargeMs / maxCharge);

        this.charging = false;
        this.cooldowns.skillB = now + s.cd;
        this.attacking = true;
        this.attackEnd = now + 400;

        const dmgMult = s.dmgMults[chargeLevel];
        const isCrit = Math.random() < this.critRate;
        const baseDmg = Math.floor(this.getAtk() * dmgMult);
        const damage = isCrit ? Math.floor(baseDmg * this.critDmg) : baseDmg;

        return { type: 'cone', spell: 'skillB', damage, crit: isCrit,
          range: s.range, coneAngle: s.coneAngle,
          chargeLevel, chargePct,
          color: chargeLevel >= 3 ? '#ffd700' : chargeLevel >= 2 ? '#ff6600' : '#ef4444' };
      }

      case 'ultimate': {
        const s = skills.ultimate;
        if (!s) return null;
        if (s.manaCost && this.mana < s.manaCost) return null;
        if (s.manaCost) this.mana -= s.manaCost;
        this.cooldowns.ultimate = now + s.cd;
        this.attacking = true;
        this.attackEnd = now + 400;

        if (s.type === 'channel') {
          // Archer barrage — start channeling
          this.channeling = true;
          this.channelData = {
            hitsLeft: s.hits,
            interval: s.interval,
            nextTick: now + s.interval,
            endTime: now + s.hits * s.interval + 200,
            dmgMult: s.dmgMult,
            range: s.range,
            coneAngle: s.coneAngle,
            tickReady: false,
          };
          return { type: 'channel_start', spell: 'ultimate',
            duration: s.hits * s.interval, hits: s.hits };
        }

        const isCrit = Math.random() < this.critRate;
        const baseDmg = Math.floor(this.getAtk() * (s.dmgMult || 0));

        if (s.type === 'whirlwind') {
          return { type: 'whirlwind', spell: 'ultimate',
            damage: isCrit ? Math.floor(baseDmg * this.critDmg) : baseDmg,
            crit: isCrit, radius: s.radius, duration: s.duration,
            tickRate: s.tickRate, playerClass: this.playerClass };
        }
        if (s.type === 'fortify') {
          return { type: 'fortify', spell: 'ultimate',
            radius: s.radius, duration: s.duration, playerClass: this.playerClass };
        }
        if (s.type === 'ice_aoe') {
          return { type: 'ice_aoe', spell: 'ultimate',
            damage: isCrit ? Math.floor(baseDmg * this.critDmg) : baseDmg,
            crit: isCrit, radius: s.radius, duration: s.duration,
            tickRate: s.tickRate, healPerTick: s.healPerTick,
            playerClass: this.playerClass };
        }
        if (s.type === 'resurrect') {
          // Start channeling resurrect — 6s channel, cancel on move
          this.channeling = true;
          this.channelData = {
            type: 'resurrect',
            hitsLeft: 1, // single "tick" at the end
            interval: s.channelDuration,
            nextTick: now + s.channelDuration,
            endTime: now + s.channelDuration + 200,
            radius: s.radius,
            tickReady: false,
          };
          return { type: 'resurrect_start', spell: 'ultimate',
            duration: s.channelDuration, radius: s.radius };
        }
        if (s.type === 'single_target') {
          return { type: 'single_target', spell: 'ultimate',
            damage: isCrit ? Math.floor(baseDmg * this.critDmg) : baseDmg,
            crit: isCrit, range: s.range, bonusVsLowHp: s.bonusVsLowHp };
        }
        return null;
      }

      case 'dash': {
        if (this.mana < 50 && !this.useRage) return null;
        if (this.useRage && this.mana < 10) return null;
        if (this.dashing) return null;
        if (!this.useRage) this.mana -= 50; else this.mana -= 10;
        this.cooldowns.dash = now + 3000;
        this.dashing = true;
        this.dashEnd = now + 200;
        this.invulnUntil = now + 300;
        this.blocking = false;
        if (this.charging) { this.charging = false; }
        if (this.channeling) { this.channeling = false; this.channelData = null; }
        let dx = this.inputX, dy = this.inputY;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 0.01) {
          switch (this.facing) {
            case 'up': dx = 0; dy = -1; break;
            case 'down': dx = 0; dy = 1; break;
            case 'left': dx = -1; dy = 0; break;
            case 'right': dx = 1; dy = 0; break;
          }
        } else { dx /= len; dy /= len; }
        this.dashVx = dx * 900;
        this.dashVy = dy * 900;
        this.knockbackEnd = 0;
        return { type: 'dash', spell: 'dash', duration: 200 };
      }
    }
    return null;
  }

  toState() {
    const now = Date.now();
    return {
      id: this.id,
      username: this.username,
      playerClass: this.playerClass,
      x: Math.round(this.x),
      y: Math.round(this.y),
      facing: this.facing,
      moving: this.moving,
      attacking: this.attacking,
      hp: this.hp,
      maxHp: this.maxHp,
      mana: this.mana,
      maxMana: this.maxMana,
      alive: this.alive,
      inLava: isInLava(this.x, this.y),
      knockback: now < this.knockbackEnd,
      dashing: this.dashing,
      blocking: this.blocking,
      shieldActive: this.shieldActive,
      shieldHp: this.shieldHp,
      charging: this.charging,
      chargeLevel: this.charging ? Math.min(3, Math.floor(((now - this.chargeStart) / 4000) * 4)) : 0,
      chargePct: this.charging ? Math.min(1, (now - this.chargeStart) / 4000) : 0,
      channeling: this.channeling,
      buffActive: now < this.buffEnd && this.atkBuff > 0,
      comboCount: this.comboCount,
      cooldowns: {
        basic: Math.max(0, (this.cooldowns.basic || 0) - now),
        secondary: Math.max(0, (this.cooldowns.secondary || 0) - now),
        skillA: Math.max(0, (this.cooldowns.skillA || 0) - now),
        skillB: Math.max(0, (this.cooldowns.skillB || 0) - now),
        ultimate: Math.max(0, (this.cooldowns.ultimate || 0) - now),
        dash: Math.max(0, (this.cooldowns.dash || 0) - now),
      },
    };
  }
}
