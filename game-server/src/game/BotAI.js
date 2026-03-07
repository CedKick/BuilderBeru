// BotAI.js — Smart bot AI for Manaya Raid
// Bots generate inputs identical to real players, injected into GameLoop.inputQueue

import { ARENA, PLAYER } from '../config.js';

const BOT_NAMES = [
  'Igris', 'Beru', 'Tusk', 'Iron', 'Bellion',
  'Greed', 'Jima', 'Tank', 'Esil', 'Fangs',
];

// Preferred class composition for bots (based on what the player picks)
const COMP_PRIORITY = ['tank', 'healer', 'dps_cac', 'dps_range', 'berserker'];

let botIdCounter = 0;

export function generateBotId() {
  return `bot_${++botIdCounter}`;
}

export function pickBotClasses(playerClass, count) {
  // Ensure good composition: always 1 tank + 1 healer if possible, rest DPS
  const needed = [];
  const hasClass = (cls) => cls === playerClass || needed.includes(cls);

  // First priority: tank
  if (!hasClass('tank') && count > 0) needed.push('tank');
  // Second: healer
  if (!hasClass('healer') && needed.length < count) needed.push('healer');
  // Fill remaining with DPS variety
  const dpsPool = ['dps_cac', 'berserker', 'dps_range'].filter(c => c !== playerClass);
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

// ─── Bot AI Controller ───────────────────────────────────────────
// Runs inside GameLoop, generates inputs for bot players every think cycle

export class BotAI {
  constructor(playerId, playerClass) {
    this.playerId = playerId;
    this.playerClass = playerClass;
    this.thinkInterval = 150 + Math.random() * 100; // 150-250ms between decisions
    this.lastThink = 0;
    this.moveTarget = null;
    this.dodgeCooldownEstimate = 0;
    this.lastDodge = 0;
    this.lastSkillA = 0;
    this.lastSkillB = 0;
    this.lastUltimate = 0;
    this.lastSecondary = 0;
    this.blocking = false;
    this.channeling = false;
  }

  // Called every game tick — returns array of input objects to queue
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

    // ── 1. DODGE CHECK — highest priority ──
    const dodgeInput = this._checkDodge(player, gs, boss, distToBoss);
    if (dodgeInput) {
      inputs.push(dodgeInput);
      return inputs; // Dodge = abort everything else this tick
    }

    // ── 2. CLASS-SPECIFIC BEHAVIOR ──
    switch (this.playerClass) {
      case 'tank':
        this._thinkTank(inputs, player, gs, boss, distToBoss, angleToBoss);
        break;
      case 'healer':
        this._thinkHealer(inputs, player, gs, boss, distToBoss, angleToBoss);
        break;
      case 'dps_cac':
        this._thinkWarrior(inputs, player, gs, boss, distToBoss, angleToBoss);
        break;
      case 'dps_range':
        this._thinkArcher(inputs, player, gs, boss, distToBoss, angleToBoss);
        break;
      case 'berserker':
        this._thinkBerserker(inputs, player, gs, boss, distToBoss, angleToBoss);
        break;
    }

    return inputs;
  }

  // ── DODGE LOGIC ──
  // Dodge if: nearby AoE zone active, boss leaping at us, or Death Ball incoming
  _checkDodge(player, gs, boss, distToBoss) {
    if (player.dodging || player.dodgeCooldown > 0.5) return null;

    // Check AoE zones that threaten us
    for (const zone of gs.aoeZones) {
      const distToZone = this._dist(player, zone);
      const danger = zone.radius + 40; // Buffer

      // Dangerous zone types
      const isDangerous = zone.active || zone.ttl < 0.8;
      if (distToZone < danger && isDangerous) {
        // Dodge away from zone center
        const awayAngle = Math.atan2(player.y - zone.y, player.x - zone.x);
        return { type: 'dodge', angle: awayAngle };
      }

      // Donut (Anneau Destructeur) — need to be very close to boss (safe zone)
      if (zone.type === 'donut' && distToZone < zone.radius && zone.innerRadius) {
        const safeR = zone.innerRadius - 30;
        if (distToBoss > safeR) {
          // Dodge TOWARD boss to reach safe zone
          const toBossAngle = Math.atan2(boss.y - player.y, boss.x - player.x);
          return { type: 'dodge', angle: toBossAngle };
        }
      }
    }

    // Boss leaping at us
    if (boss._moveState === 'leaping' || boss.leaping) {
      if (distToBoss < 250) {
        const awayAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
        return { type: 'dodge', angle: awayAngle };
      }
    }

    // Boss casting frontal cone — check if we're in front
    if (boss.casting && distToBoss < 300) {
      const angleDiff = this._angleDiff(
        Math.atan2(player.y - boss.y, player.x - boss.x),
        boss.rotation || 0
      );
      if (Math.abs(angleDiff) < Math.PI / 3) {
        // We're in front of boss during cast — dodge sideways
        const sideAngle = (boss.rotation || 0) + Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1);
        return { type: 'dodge', angle: sideAngle };
      }
    }

    return null;
  }

  // ── TANK AI ──
  _thinkTank(inputs, player, gs, boss, distToBoss, angleToBoss) {
    // Position: stay close to boss (melee range ~80-120px)
    if (distToBoss > 130) {
      inputs.push(this._moveToward(player, boss));
    } else if (distToBoss < 50) {
      inputs.push(this._moveAway(player, boss));
    } else {
      inputs.push({ type: 'stop' });
    }

    // Always face boss
    inputs.push({ type: 'aim', angle: angleToBoss });

    // Taunt (skillA) — keep aggro
    if (player.cooldowns.skillA <= 0 && player.mana >= 30) {
      inputs.push({ type: 'skill', skill: 'skillA', angle: angleToBoss });
    }

    // Party Shield (skillB) — when party members are low HP
    if (player.cooldowns.skillB <= 0 && player.mana >= 50) {
      const lowHpAlly = gs.getAlivePlayers().find(p =>
        p.id !== player.id && p.hp / p.maxHp < 0.5
      );
      if (lowHpAlly) {
        inputs.push({ type: 'skill', skill: 'skillB', angle: angleToBoss });
      }
    }

    // Ultimate (Fortress) — when HP low or boss enraged
    if (player.cooldowns.ultimate <= 0 && (player.hp / player.maxHp < 0.3 || boss.enraged)) {
      inputs.push({ type: 'skill', skill: 'ultimate', angle: angleToBoss });
    }

    // Block (secondary) — when boss is casting and we're targeted
    const isTarget = this._isBossTarget(player, gs);
    if (isTarget && boss.casting && !this.blocking && player.mana >= 30) {
      inputs.push({ type: 'attack_secondary', angle: angleToBoss });
      this.blocking = true;
    } else if (this.blocking && (!boss.casting || !isTarget)) {
      inputs.push({ type: 'stop_secondary' });
      this.blocking = false;
    }

    // Basic attack when in range and not blocking
    if (!this.blocking && distToBoss < 120 && player.cooldowns.basic <= 0) {
      inputs.push({ type: 'start_basic', angle: angleToBoss });
    }
  }

  // ── HEALER AI ──
  _thinkHealer(inputs, player, gs, boss, distToBoss, angleToBoss) {
    // Position: stay at medium range (250-400px from boss)
    const idealDist = 320;
    if (distToBoss < idealDist - 60) {
      inputs.push(this._moveAway(player, boss));
    } else if (distToBoss > idealDist + 80) {
      inputs.push(this._moveToward(player, boss));
    } else {
      // Strafe around boss
      const strafeAngle = angleToBoss + Math.PI / 2;
      inputs.push({ type: 'move', x: Math.cos(strafeAngle), y: Math.sin(strafeAngle) });
    }

    // Find injured allies
    const allies = gs.getAlivePlayers().filter(p => p.id !== player.id);
    const injured = allies.filter(p => p.hp / p.maxHp < 0.7).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp);
    const criticalAlly = allies.find(p => p.hp / p.maxHp < 0.35);

    // Heal Zone (secondary) — place on most injured ally
    if (player.cooldowns.secondary <= 0 && injured.length > 0 && player.mana >= 40) {
      const target = injured[0];
      const angleToTarget = Math.atan2(target.y - player.y, target.x - player.x);
      inputs.push({ type: 'attack_secondary', angle: angleToTarget });
    }

    // AoE Heal (skillA) — when multiple allies injured
    if (player.cooldowns.skillA <= 0 && injured.length >= 2 && player.mana >= 60) {
      inputs.push({ type: 'skill', skill: 'skillA', angle: angleToBoss });
    }

    // Purification (skillB) — cleanse debuffs or boss rage buff
    if (player.cooldowns.skillB <= 0 && player.mana >= 40) {
      const debuffedAlly = allies.find(p => p.buffs.some(b =>
        b.type === 'poison' || b.type === 'speed_down' || b.type === 'weak'
      ));
      if (debuffedAlly || boss.rageBuff) {
        inputs.push({ type: 'skill', skill: 'skillB', angle: angleToBoss });
      }
    }

    // Resurrect (ultimate) — when ally dead
    if (player.cooldowns.ultimate <= 0 && player.mana >= 100) {
      const deadAlly = gs.players.find(p => p.id !== player.id && !p.alive && p.connected !== false);
      if (deadAlly) {
        const angleToDeadAlly = Math.atan2(deadAlly.y - player.y, deadAlly.x - player.x);
        // Move close to dead ally first
        if (this._dist(player, deadAlly) > 350) {
          inputs.push(this._moveToward(player, deadAlly));
        } else {
          inputs.push({ type: 'skill', skill: 'ultimate', angle: angleToDeadAlly });
        }
      }
    }

    // Basic attack when nothing to heal
    if (injured.length === 0 && player.cooldowns.basic <= 0) {
      inputs.push({ type: 'attack_basic', angle: angleToBoss });
    }
  }

  // ── WARRIOR (dps_cac) AI ──
  _thinkWarrior(inputs, player, gs, boss, distToBoss, angleToBoss) {
    // Position: melee range (60-100px)
    if (distToBoss > 110) {
      inputs.push(this._moveToward(player, boss));
    } else if (distToBoss < 40) {
      inputs.push(this._moveAway(player, boss));
    } else {
      inputs.push({ type: 'stop' });
    }

    inputs.push({ type: 'aim', angle: angleToBoss });

    const rage = player.mana; // Warrior uses rage (stored as mana)

    // Execute (ultimate) — use on boss below 50% HP for bonus damage
    if (player.cooldowns.ultimate <= 0 && rage >= 80 && boss.hp / boss.maxHp < 0.5) {
      inputs.push({ type: 'skill', skill: 'ultimate', angle: angleToBoss });
      return;
    }

    // Blade Storm (skillA) — good AoE, use when adds nearby or high rage
    if (player.cooldowns.skillA <= 0 && rage >= 40) {
      const nearbyAdds = gs.getAliveAdds().filter(a => this._dist(player, a) < 200);
      if (nearbyAdds.length > 0 || rage >= 80) {
        inputs.push({ type: 'skill', skill: 'skillA', angle: angleToBoss });
      }
    }

    // Dash Attack (skillB) — gap closer + damage
    if (player.cooldowns.skillB <= 0 && rage >= 25 && distToBoss > 100) {
      inputs.push({ type: 'skill', skill: 'skillB', angle: angleToBoss });
      return;
    }

    // Secondary (heavy strike) — weave between combos
    if (player.cooldowns.secondary <= 0 && rage >= 15 && distToBoss < 100) {
      inputs.push({ type: 'attack_secondary', angle: angleToBoss });
    }

    // Basic combo — always attack when in range
    if (distToBoss < 100) {
      inputs.push({ type: 'start_basic', angle: angleToBoss });
    }
  }

  // ── ARCHER (dps_range) AI ──
  _thinkArcher(inputs, player, gs, boss, distToBoss, angleToBoss) {
    // Position: long range (350-500px)
    const idealDist = 420;
    if (distToBoss < idealDist - 80) {
      inputs.push(this._moveAway(player, boss));
    } else if (distToBoss > idealDist + 80) {
      inputs.push(this._moveToward(player, boss));
    } else {
      // Kite sideways
      const strafeAngle = angleToBoss + Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1);
      inputs.push({ type: 'move', x: Math.cos(strafeAngle), y: Math.sin(strafeAngle) });
    }

    inputs.push({ type: 'aim', angle: angleToBoss });

    // Barrage (ultimate) — channel when safe and have mana
    if (player.cooldowns.ultimate <= 0 && player.mana >= 160 && !this._nearbyDanger(player, gs)) {
      inputs.push({ type: 'skill', skill: 'ultimate', angle: angleToBoss });
      return; // Don't move during channel
    }

    // Rain of Arrows (skillA) — targeted AoE on boss
    if (player.cooldowns.skillA <= 0 && player.mana >= 70) {
      inputs.push({ type: 'skill', skill: 'skillA', angle: angleToBoss });
    }

    // Explosive Trap (skillB) — place near boss
    if (player.cooldowns.skillB <= 0 && player.mana >= 50) {
      inputs.push({ type: 'skill', skill: 'skillB', angle: angleToBoss });
    }

    // Charged shot (secondary)
    if (player.cooldowns.secondary <= 0 && player.mana >= 25) {
      inputs.push({ type: 'attack_secondary', angle: angleToBoss });
    }

    // Basic ranged attack
    if (player.cooldowns.basic <= 0 && distToBoss < 550) {
      inputs.push({ type: 'attack_basic', angle: angleToBoss });
    }
  }

  // ── BERSERKER AI ──
  _thinkBerserker(inputs, player, gs, boss, distToBoss, angleToBoss) {
    // Position: melee (60-100px)
    if (distToBoss > 110) {
      inputs.push(this._moveToward(player, boss));
    } else if (distToBoss < 40) {
      inputs.push(this._moveAway(player, boss));
    } else {
      inputs.push({ type: 'stop' });
    }

    inputs.push({ type: 'aim', angle: angleToBoss });

    // Berserker Rage buff (skillA) — +80% ATK
    const hasRageBuff = player.buffs.some(b => b.type === 'atk_up');
    if (player.cooldowns.skillA <= 0 && !hasRageBuff) {
      inputs.push({ type: 'skill', skill: 'skillA', angle: angleToBoss });
    }

    // Whirlwind (ultimate) — big AoE channel
    if (player.cooldowns.ultimate <= 0 && player.mana >= 90 && distToBoss < 150 && !this._nearbyDanger(player, gs)) {
      inputs.push({ type: 'skill', skill: 'ultimate', angle: angleToBoss });
      return;
    }

    // Charged Attack (skillB) — hold and release
    if (player.cooldowns.skillB <= 0 && distToBoss < 100) {
      if (!player.charging) {
        inputs.push({ type: 'charge_start', skill: 'skillB', angle: angleToBoss });
      } else {
        // Release after ~2s charge (level 2-3)
        const chargeTime = player.charging ? (Date.now() - player.charging.startTime) / 1000 : 0;
        if (chargeTime >= 2.0 || this._nearbyDanger(player, gs)) {
          inputs.push({ type: 'charge_release', angle: angleToBoss });
        }
      }
      return;
    }

    // Block (secondary) — when boss casts at us
    const isTarget = this._isBossTarget(player, gs);
    if (isTarget && boss.casting && !this.blocking && player.mana >= 20) {
      inputs.push({ type: 'attack_secondary', angle: angleToBoss });
      this.blocking = true;
    } else if (this.blocking && (!boss.casting || !isTarget)) {
      inputs.push({ type: 'stop_secondary' });
      this.blocking = false;
    }

    // Basic attack
    if (!this.blocking && distToBoss < 100) {
      inputs.push({ type: 'start_basic', angle: angleToBoss });
    }
  }

  // ── UTILITY ──

  _dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  _angleDiff(a, b) {
    let d = a - b;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return d;
  }

  _moveToward(player, target) {
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return { type: 'move', x: dx / len, y: dy / len };
  }

  _moveAway(player, target) {
    const dx = player.x - target.x;
    const dy = player.y - target.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return { type: 'move', x: dx / len, y: dy / len };
  }

  _isBossTarget(player, gs) {
    const highest = gs.getHighestAggroPlayer();
    return highest && highest.id === player.id;
  }

  _nearbyDanger(player, gs) {
    for (const zone of gs.aoeZones) {
      const d = this._dist(player, zone);
      if (d < zone.radius + 60 && (zone.active || zone.ttl < 1.0)) {
        return true;
      }
    }
    return false;
  }

  // Keep bot inside arena bounds
  _clampPosition(player) {
    const margin = 40;
    if (player.x < margin) player.x = margin;
    if (player.x > ARENA.WIDTH - margin) player.x = ARENA.WIDTH - margin;
    if (player.y < margin) player.y = margin;
    if (player.y > ARENA.HEIGHT - margin) player.y = ARENA.HEIGHT - margin;
  }
}
