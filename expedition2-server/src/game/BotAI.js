// ── Expedition II: Ragnaros — Bot AI ──
// Generates inputs identical to real players, processed by GameEngine.handleInput()

import { GAME } from '../config.js';

const BOT_NAMES = [
  'Igris', 'Beru', 'Tusk', 'Iron', 'Bellion',
  'Greed', 'Jima', 'Tank', 'Esil', 'Fangs',
];

// 6 classes for Ragnaros (vs 5 in Manaya)
const COMP_PRIORITY = ['tank', 'healer', 'warrior', 'archer', 'berserker', 'mage'];

let botIdCounter = 0;

export function generateBotId() {
  return `bot_${++botIdCounter}`;
}

export function pickBotClasses(playerClass, count) {
  const needed = [];
  const hasClass = (cls) => cls === playerClass || needed.includes(cls);

  if (!hasClass('tank') && count > 0) needed.push('tank');
  if (!hasClass('healer') && needed.length < count) needed.push('healer');
  const dpsPool = ['warrior', 'berserker', 'archer', 'mage'].filter(c => c !== playerClass);
  while (needed.length < count) {
    needed.push(dpsPool[needed.length % dpsPool.length]);
  }
  return needed.slice(0, count);
}

export function pickBotName(usedNames) {
  for (const name of BOT_NAMES) {
    if (!usedNames.has(name)) return name;
  }
  return `Bot${Math.floor(Math.random() * 999)}`;
}

export class BotAI {
  constructor(playerId, playerClass) {
    this.playerId = playerId;
    this.playerClass = playerClass;
    this.thinkInterval = 150 + Math.random() * 100;
    this.lastThink = 0;
    this.blocking = false;
  }

  think(player, gs, dt) {
    if (!player || !player.alive) return [];

    this.lastThink += dt * 1000;
    if (this.lastThink < this.thinkInterval) return [];
    this.lastThink = 0;

    const inputs = [];
    const boss = gs.boss;
    if (!boss || !boss.alive) return [];

    const distToBoss = this._dist(player, boss);
    const angleToBoss = Math.atan2(boss.y - player.y, boss.x - player.x);

    // Dodge AoE telegraphs
    const dodgeInput = this._checkDodge(player, gs, boss, distToBoss);
    if (dodgeInput) {
      inputs.push(dodgeInput);
      return inputs;
    }

    switch (this.playerClass) {
      case 'tank': this._thinkTank(inputs, player, gs, boss, distToBoss, angleToBoss); break;
      case 'healer': this._thinkHealer(inputs, player, gs, boss, distToBoss, angleToBoss); break;
      case 'warrior': this._thinkWarrior(inputs, player, gs, boss, distToBoss, angleToBoss); break;
      case 'archer': this._thinkArcher(inputs, player, gs, boss, distToBoss, angleToBoss); break;
      case 'berserker': this._thinkBerserker(inputs, player, gs, boss, distToBoss, angleToBoss); break;
      case 'mage': this._thinkMage(inputs, player, gs, boss, distToBoss, angleToBoss); break;
    }

    return inputs;
  }

  _checkDodge(player, gs, boss, distToBoss) {
    if (player.dashing) return null;
    const now = Date.now();
    if (now < (player.cooldowns?.dash || 0)) return null;

    // Boss telegraph — dodge away
    if (boss.telegraph) {
      const t = boss.telegraph;
      if (t.type === 'hammer_slam' && t.data) {
        const d = this._dist(player, t.data);
        if (d < (t.data.radius || 200) + 40) {
          return { type: 'dash' };
        }
      }
      if (t.type === 'fire_breath' && t.data && distToBoss < (t.data.range || 300) + 40) {
        const angleDiff = this._angleDiff(
          Math.atan2(player.y - boss.y, player.x - boss.x),
          t.data.angle || 0
        );
        if (Math.abs(angleDiff) < (t.data.spread || Math.PI / 3)) {
          return { type: 'dash' };
        }
      }
      if (t.type === 'lava_eruption' && t.data?.targets) {
        for (const tg of t.data.targets) {
          if (this._dist(player, tg) < (t.data.radius || 70) + 30) {
            return { type: 'dash' };
          }
        }
      }
      if (t.type === 'fire_wave' && t.data) {
        return null; // Can't dodge fire wave, just keep moving
      }
      if (t.type === 'wrath_of_ragnaros') {
        // Run to nearest pillar
        return null; // Handled by movement
      }
    }

    // Boss pattern active — dodge if in damage zone
    if (boss.pattern === 'hammer_slam' && boss.patternData) {
      const d = this._dist(player, boss.patternData);
      if (d < (boss.patternData.radius || 200)) {
        return { type: 'dash' };
      }
    }

    return null;
  }

  // ── TANK ──
  _thinkTank(inputs, player, gs, boss, distToBoss, angleToBoss) {
    // Stay melee range
    if (distToBoss > 130) {
      inputs.push(this._moveToward(player, boss));
    } else if (distToBoss < 50) {
      inputs.push(this._moveAway(player, boss));
    } else {
      inputs.push({ type: 'move', x: 0, y: 0 });
    }

    // Taunt
    if (this._cdReady(player, 'skillA') && player.mana >= 40) {
      inputs.push({ type: 'skillA' });
    }

    // Party shield when allies low
    if (this._cdReady(player, 'skillB') && player.mana >= 70) {
      const lowAlly = gs.getAlivePlayers().find(p => p.id !== player.id && p.hp / p.maxHp < 0.5);
      if (lowAlly) inputs.push({ type: 'skillB' });
    }

    // Fortify when low HP
    if (this._cdReady(player, 'ultimate') && player.hp / player.maxHp < 0.3) {
      inputs.push({ type: 'ultimate' });
    }

    // Block when boss casting
    if (boss.telegraph && !this.blocking && player.mana >= 20) {
      inputs.push({ type: 'secondary' });
      this.blocking = true;
    } else if (this.blocking && !boss.telegraph) {
      inputs.push({ type: 'secondary_stop' });
      this.blocking = false;
    }

    // Basic attack
    if (!this.blocking && distToBoss < 120 && this._cdReady(player, 'basic')) {
      inputs.push({ type: 'basic' });
    }
  }

  // ── HEALER ──
  _thinkHealer(inputs, player, gs, boss, distToBoss, angleToBoss) {
    // Stay at range
    const idealDist = 320;
    if (distToBoss < idealDist - 60) {
      inputs.push(this._moveAway(player, boss));
    } else if (distToBoss > idealDist + 80) {
      inputs.push(this._moveToward(player, boss));
    } else {
      const strafeAngle = angleToBoss + Math.PI / 2;
      inputs.push({ type: 'move', x: Math.cos(strafeAngle), y: Math.sin(strafeAngle) });
    }

    const allies = gs.getAlivePlayers().filter(p => p.id !== player.id);
    const injured = allies.filter(p => p.hp / p.maxHp < 0.7);

    // Heal zone on most injured
    if (this._cdReady(player, 'secondary') && injured.length > 0 && player.mana >= 30) {
      inputs.push({ type: 'secondary' });
    }

    // AoE heal when multiple injured
    if (this._cdReady(player, 'skillA') && injured.length >= 2 && player.mana >= 55) {
      inputs.push({ type: 'skillA' });
    }

    // Cleanse
    if (this._cdReady(player, 'skillB') && player.mana >= 40) {
      // Use when boss enraged or allies debuffed
      if (boss.enraged) inputs.push({ type: 'skillB' });
    }

    // Ice AoE ultimate
    if (this._cdReady(player, 'ultimate') && player.mana >= 180 && injured.length >= 2) {
      inputs.push({ type: 'ultimate' });
    }

    // Basic attack when nothing to heal
    if (injured.length === 0 && this._cdReady(player, 'basic')) {
      inputs.push({ type: 'basic' });
    }
  }

  // ── WARRIOR ──
  _thinkWarrior(inputs, player, gs, boss, distToBoss, angleToBoss) {
    if (distToBoss > 110) {
      inputs.push(this._moveToward(player, boss));
    } else if (distToBoss < 40) {
      inputs.push(this._moveAway(player, boss));
    } else {
      inputs.push({ type: 'move', x: 0, y: 0 });
    }

    const rage = player.mana; // warrior uses rage

    // Execute below 50% boss HP
    if (this._cdReady(player, 'ultimate') && rage >= 80 && boss.hp / boss.maxHp < 0.5) {
      inputs.push({ type: 'ultimate' });
      return;
    }

    // Blade storm
    if (this._cdReady(player, 'skillA') && rage >= 40) {
      inputs.push({ type: 'skillA' });
    }

    // Dash attack gap close
    if (this._cdReady(player, 'skillB') && rage >= 25 && distToBoss > 100) {
      inputs.push({ type: 'skillB' });
      return;
    }

    // Heavy strike
    if (this._cdReady(player, 'secondary') && rage >= 15 && distToBoss < 100) {
      inputs.push({ type: 'secondary' });
    }

    // Basic combo
    if (distToBoss < 100 && this._cdReady(player, 'basic')) {
      inputs.push({ type: 'basic' });
    }
  }

  // ── ARCHER ──
  _thinkArcher(inputs, player, gs, boss, distToBoss, angleToBoss) {
    const idealDist = 420;
    if (distToBoss < idealDist - 80) {
      inputs.push(this._moveAway(player, boss));
    } else if (distToBoss > idealDist + 80) {
      inputs.push(this._moveToward(player, boss));
    } else {
      const strafeAngle = angleToBoss + Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1);
      inputs.push({ type: 'move', x: Math.cos(strafeAngle), y: Math.sin(strafeAngle) });
    }

    // Barrage ultimate
    if (this._cdReady(player, 'ultimate') && player.mana >= 160 && !boss.telegraph) {
      inputs.push({ type: 'ultimate' });
      return;
    }

    // Arrow rain
    if (this._cdReady(player, 'skillA') && player.mana >= 70) {
      inputs.push({ type: 'skillA' });
    }

    // Trap
    if (this._cdReady(player, 'skillB') && player.mana >= 50) {
      inputs.push({ type: 'skillB' });
    }

    // Charged shot
    if (this._cdReady(player, 'secondary') && player.mana >= 25) {
      inputs.push({ type: 'secondary' });
    }

    // Basic
    if (this._cdReady(player, 'basic') && distToBoss < 550) {
      inputs.push({ type: 'basic' });
    }
  }

  // ── BERSERKER ──
  _thinkBerserker(inputs, player, gs, boss, distToBoss, angleToBoss) {
    if (distToBoss > 110) {
      inputs.push(this._moveToward(player, boss));
    } else if (distToBoss < 40) {
      inputs.push(this._moveAway(player, boss));
    } else {
      inputs.push({ type: 'move', x: 0, y: 0 });
    }

    // Rage buff
    if (this._cdReady(player, 'skillA') && !(player.atkBuff > 0)) {
      inputs.push({ type: 'skillA' });
    }

    // Whirlwind ultimate
    if (this._cdReady(player, 'ultimate') && player.mana >= 90 && distToBoss < 150 && !boss.telegraph) {
      inputs.push({ type: 'ultimate' });
      return;
    }

    // Charged attack
    if (this._cdReady(player, 'skillB') && distToBoss < 100) {
      if (!player.charging) {
        inputs.push({ type: 'skillB' });
      } else {
        const chargeMs = Date.now() - player.chargeStart;
        if (chargeMs >= 2000 || boss.telegraph) {
          inputs.push({ type: 'skillB_release' });
        }
      }
      return;
    }

    // Block when boss casting
    if (boss.telegraph && !this.blocking && player.mana >= 20) {
      inputs.push({ type: 'secondary' });
      this.blocking = true;
    } else if (this.blocking && !boss.telegraph) {
      inputs.push({ type: 'secondary_stop' });
      this.blocking = false;
    }

    // Basic
    if (!this.blocking && distToBoss < 100 && this._cdReady(player, 'basic')) {
      inputs.push({ type: 'basic' });
    }
  }

  // ── MAGE ──
  _thinkMage(inputs, player, gs, boss, distToBoss, angleToBoss) {
    const idealDist = 380;
    if (distToBoss < idealDist - 80) {
      inputs.push(this._moveAway(player, boss));
    } else if (distToBoss > idealDist + 80) {
      inputs.push(this._moveToward(player, boss));
    } else {
      const strafeAngle = angleToBoss + Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1);
      inputs.push({ type: 'move', x: Math.cos(strafeAngle), y: Math.sin(strafeAngle) });
    }

    // Rayon destructeur (channel ultimate)
    if (this._cdReady(player, 'ultimate') && player.mana >= 200 && !boss.telegraph) {
      inputs.push({ type: 'ultimate' });
      return;
    }

    // Explosion arcanique (AoE)
    if (this._cdReady(player, 'skillA') && player.mana >= 80) {
      inputs.push({ type: 'skillA' });
    }

    // Teleport dash
    if (this._cdReady(player, 'skillB') && player.mana >= 30 && boss.telegraph && distToBoss < 200) {
      inputs.push({ type: 'skillB' });
    }

    // Fire orb secondary
    if (this._cdReady(player, 'secondary') && player.mana >= 35) {
      inputs.push({ type: 'secondary' });
    }

    // Basic
    if (this._cdReady(player, 'basic') && distToBoss < 500) {
      inputs.push({ type: 'basic' });
    }
  }

  // ── UTILITY ──
  _dist(a, b) {
    const dx = a.x - b.x, dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  _angleDiff(a, b) {
    let d = a - b;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return d;
  }

  _moveToward(player, target) {
    const dx = target.x - player.x, dy = target.y - player.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return { type: 'move', x: dx / len, y: dy / len };
  }

  _moveAway(player, target) {
    const dx = player.x - target.x, dy = player.y - target.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return { type: 'move', x: dx / len, y: dy / len };
  }

  _cdReady(player, skill) {
    if (!player.cooldowns) return true;
    const cd = player.cooldowns[skill];
    if (cd === undefined) return true;
    return cd <= 0 || Date.now() >= cd;
  }
}
