import { COMBAT } from '../config.js';

let mobIdCounter = 0;

export class Mob {
  constructor(template, difficultyMult = 1, templateKey = null) {
    this.id = `mob_${++mobIdCounter}`;
    this.name = template.name;
    this.type = template.type;        // 'basic' | 'elite' | 'caster'
    this.templateKey = templateKey;   // For sprite mapping in spectator

    // Stats scaled by difficulty
    this.maxHp = Math.floor(template.hp * difficultyMult);
    this.hp = this.maxHp;
    this.atk = Math.floor(template.atk * difficultyMult);
    this.def = template.def;
    this.spd = template.spd || COMBAT.MOB_MOVE_SPEED;
    this.range = template.range || COMBAT.MELEE_RANGE;

    // Position (2D)
    this.x = COMBAT.WORLD_WIDTH - 100 - Math.random() * 300;
    this.y = (Math.random() * 2 - 1) * 30;  // Random Y spread for mobs

    // State
    this.alive = true;
    this.targetId = null;

    // Attack timer
    this.attackTimer = Math.random() * 1.0;  // Stagger initial attacks
    this.attackInterval = template.attackInterval || COMBAT.MOB_ATTACK_INTERVAL;

    // Visual
    this.elite = !!template.elite;
    this.caster = !!template.caster;
    this.radius = this.elite ? 25 : 18;
  }

  takeDamage(amount) {
    if (!this.alive) return 0;
    const reduction = COMBAT.DEF_CONSTANT / (COMBAT.DEF_CONSTANT + this.def);
    const finalDamage = Math.floor(amount * reduction);
    this.hp = Math.max(0, this.hp - finalDamage);
    if (this.hp <= 0) {
      this.alive = false;
    }
    return finalDamage;
  }

  // Move toward target position
  moveToward(targetX, dt) {
    if (!this.alive) return;
    const diff = targetX - this.x;
    const dir = Math.sign(diff);
    const step = this.spd * dt;
    if (Math.abs(diff) > step) {
      this.x += dir * step;
    } else {
      this.x = targetX;
    }
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      hp: this.hp,
      maxHp: this.maxHp,
      atk: this.atk,
      x: this.x,
      y: this.y,
      alive: this.alive,
      elite: this.elite,
      caster: this.caster,
      radius: this.radius,
    };
  }
}

// Reset counter (for tests / new expedition)
export function resetMobIdCounter() {
  mobIdCounter = 0;
}
