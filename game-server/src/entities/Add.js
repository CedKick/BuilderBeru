// ── Add (Minion) Entity ──
// Small enemies that spawn during boss fight phases

import { ARENA } from '../config.js';

let nextAddId = 1;

export class Add {
  constructor(type, x, y, stats) {
    this.id = `add_${nextAddId++}`;
    this.type = type; // 'minion', 'elite', 'caster'
    this.x = x;
    this.y = y;
    this.radius = type === 'elite' ? 25 : 18;

    // Stats
    this.maxHp = stats.hp;
    this.hp = stats.hp;
    this.atk = stats.atk;
    this.def = stats.def;
    this.spd = stats.spd || 120;

    // State
    this.alive = true;
    this.rotation = 0;
    this.targetId = null;

    // AI timers
    this._attackTimer = 0;
    this._attackInterval = type === 'elite' ? 2.5 : 3.0;
    this._retargetTimer = 0;

    // Visual
    this.color = type === 'elite' ? '#dc2626' : type === 'caster' ? '#7c3aed' : '#ef4444';
    this.name = type === 'elite' ? 'Gardien' : type === 'caster' ? 'Invocateur' : 'Servant';
  }

  update(dt, gameState) {
    if (!this.alive) return;

    const players = gameState.getAlivePlayers();
    if (players.length === 0) return;

    // Retarget periodically
    this._retargetTimer -= dt;
    if (this._retargetTimer <= 0 || !this.targetId) {
      this._retargetTimer = 3 + Math.random() * 2;
      // Target random player (weighted towards closest)
      let best = null, bestDist = Infinity;
      for (const p of players) {
        const dist = Math.hypot(p.x - this.x, p.y - this.y);
        if (dist < bestDist) { bestDist = dist; best = p; }
      }
      this.targetId = best ? best.id : null;
    }

    const target = gameState.getPlayer(this.targetId);
    if (!target || !target.alive) {
      this.targetId = null;
      return;
    }

    // Move towards target
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    this.rotation = Math.atan2(dy, dx);

    const attackRange = this.type === 'caster' ? 250 : 60;

    if (dist > attackRange) {
      const speed = this.spd * 0.6;
      this.x += (dx / dist) * speed * dt;
      this.y += (dy / dist) * speed * dt;
      // Clamp to arena
      this.x = Math.max(20, Math.min(ARENA.WIDTH - 20, this.x));
      this.y = Math.max(20, Math.min(ARENA.HEIGHT - 20, this.y));
    }

    // Auto-attack
    this._attackTimer -= dt;
    if (this._attackTimer <= 0 && dist < attackRange + 30) {
      this._attackTimer = this._attackInterval;
      const damage = this.atk * 0.8;
      const actual = target.takeDamage(damage, this);
      if (actual > 0) {
        gameState.addEvent({
          type: 'damage',
          source: this.id,
          target: target.id,
          amount: actual,
          skill: this.name,
        });
      }
    }
  }

  takeDamage(rawDamage) {
    if (!this.alive) return 0;
    let damage = rawDamage * (100 / (100 + this.def));
    damage = Math.max(1, Math.round(damage));
    this.hp -= damage;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
    return damage;
  }
}

// ── Add Templates ──
export const ADD_TEMPLATES = {
  minion: (difficulty = 1) => ({
    hp: Math.floor(40000 * difficulty),
    atk: Math.floor(150 * difficulty),
    def: 20,
    spd: 120,
  }),
  elite: (difficulty = 1) => ({
    hp: Math.floor(120000 * difficulty),
    atk: Math.floor(300 * difficulty),
    def: 50,
    spd: 100,
  }),
  caster: (difficulty = 1) => ({
    hp: Math.floor(30000 * difficulty),
    atk: Math.floor(200 * difficulty),
    def: 10,
    spd: 80,
  }),
};
