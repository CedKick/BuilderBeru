// BotAI.js — Smart bot AI for Manaya Raid
// Bots generate inputs identical to real players, injected into GameLoop.inputQueue

import { ARENA, PLAYER } from '../config.js';

const BOT_NAMES = [
  'Igris', 'Beru', 'Tusk', 'Iron', 'Bellion',
  'Greed', 'Jima', 'Tank', 'Esil', 'Fangs',
];

// Preferred class composition for bots (based on what the player picks)
const COMP_PRIORITY = ['tank', 'healer', 'dps_cac', 'dps_range', 'berserker', 'mage'];

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
  const dpsPool = ['dps_cac', 'berserker', 'dps_range', 'mage'].filter(c => c !== playerClass);
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

    const boss = gs.boss;
    if (!boss || !boss.alive) return [];

    const distToBoss = this._dist(player, boss);
    const angleToBoss = Math.atan2(boss.y - player.y, boss.x - player.x);

    // ── 0. MAJOR MECHANIC OVERRIDE — OS avoidance (faster check, ~80ms) ──
    this._mechanicTimer = (this._mechanicTimer || 0) + dt * 1000;
    if (this._mechanicTimer >= 80) {
      this._mechanicTimer = 0;
      const override = this._checkMajorMechanic(player, gs, boss, distToBoss, angleToBoss);
      if (override) return override;
    }

    this.lastThink += dt * 1000;
    if (this.lastThink < this.thinkInterval) return [];
    this.lastThink = 0;

    const inputs = [];

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
      case 'mage':
        this._thinkMage(inputs, player, gs, boss, distToBoss, angleToBoss);
        break;
    }

    return inputs;
  }

  // ── MAJOR MECHANIC OVERRIDE ──
  // Handles OS (one-shot) mechanics — runs at higher frequency than normal think
  // Returns input array if mechanic requires override, null otherwise
  _checkMajorMechanic(player, gs, boss, distToBoss, angleToBoss) {
    const castName = boss.casting?.name;

    // ── Trinité des Marques — position in assigned debuff zone ──
    const triCenter = this._getTrinitéCenter(gs);
    if (triCenter) {
      return this._handleTrinité(player, gs, boss, triCenter, angleToBoss);
    }

    // ── Anneau Destructeur (Donut) — run far away (>560px safe from all phases) ──
    if (castName === 'Anneau Destructeur' || this._hasZoneType(gs, 'donut_telegraph') || this._hasZoneType(gs, 'donut_safe')) {
      if (distToBoss < 560) {
        return [this._moveAway(player, boss)];
      }
      return [{ type: 'stop' }];
    }

    // ── Sphère de Mort — run far away (>310px) ──
    if (castName === 'Sphère de Mort') {
      if (distToBoss < 310) {
        return [this._moveAway(player, boss)];
      }
      return [{ type: 'stop' }];
    }

    // ── Double Impact — run far away (>560px safe from both phases) ──
    if (castName === 'Double Impact') {
      if (distToBoss < 560) {
        return [this._moveAway(player, boss)];
      }
      return [{ type: 'stop' }];
    }

    // ── Vague Dévastatrice (Menacing Wave) — run far away (>500px) ──
    if (castName === 'Vague Dévastatrice' || this._hasZoneType(gs, 'menacing_wave_telegraph')) {
      if (distToBoss < 500) {
        return [this._moveAway(player, boss)];
      }
      return [{ type: 'stop' }];
    }
    // Active fire_wave — outrun the expanding ring
    const fireWave = gs.aoeZones.find(z => z.type === 'fire_wave' && z.active);
    if (fireWave) {
      const distToWave = this._dist(player, fireWave);
      if (distToWave < fireWave.radius + 80) {
        return [this._moveAway(player, fireWave)];
      }
    }

    // ── Rotating Lasers — dodge perpendicular ──
    const laserInputs = this._checkLaserDodge(player, gs, boss);
    if (laserInputs) return laserInputs;

    // ── Plongeon Dévastateur / Saut Dévastateur — dodge away from impact zone ──
    if (castName === 'Plongeon Dévastateur' || castName === 'Saut Dévastateur') {
      for (const zone of gs.aoeZones) {
        if ((zone.type === 'dive_telegraph' || zone.type === 'circle_telegraph') && zone.source === boss.id) {
          const distToZone = this._dist(player, zone);
          if (distToZone < zone.radius + 100) {
            return [this._moveAway(player, zone)];
          }
        }
      }
    }

    // ── Souffle Corrompu (Breath) — non-tank move away if in cone ──
    if (castName === 'Souffle Corrompu' && this.playerClass !== 'tank') {
      if (distToBoss < 300) {
        const playerAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
        const angleDiff = this._angleDiff(playerAngle, boss.rotation || 0);
        if (Math.abs(angleDiff) < Math.PI * 0.4) {
          // In breath cone — dodge sideways
          const sideAngle = (boss.rotation || 0) + Math.PI / 2 * (angleDiff > 0 ? 1 : -1);
          return [{ type: 'move', x: Math.cos(sideAngle), y: Math.sin(sideAngle) }];
        }
      }
    }

    return null;
  }

  // ── TRINITÉ DES MARQUES HANDLING ──
  // Each bot moves to its assigned debuff zone to ensure all 3 marks are distributed
  _handleTrinité(player, gs, boss, triCenter, angleToBoss) {
    const isSolo = gs.playerCount <= 1;
    const zone = this._getTrinitéZone(this.playerClass, isSolo);
    // Target distances: zone 1 = 75px (inner), zone 2 = 225px (middle), zone 3 = 390px (outer)
    const targetDist = zone === 1 ? 75 : zone === 2 ? 225 : 390;
    const distToCenter = this._dist(player, triCenter);
    const diff = Math.abs(distToCenter - targetDist);

    const inputs = [];

    if (diff > 35) {
      // Move toward correct distance from Trinité center
      const angle = Math.atan2(player.y - triCenter.y, player.x - triCenter.x);
      if (distToCenter > targetDist + 35) {
        // Too far — move toward center
        inputs.push({ type: 'move', x: -Math.cos(angle), y: -Math.sin(angle) });
      } else if (distToCenter < targetDist - 35) {
        // Too close — move away from center
        inputs.push({ type: 'move', x: Math.cos(angle), y: Math.sin(angle) });
      }
    } else {
      inputs.push({ type: 'stop' });
    }

    // Healer can still heal while repositioning
    if (this.playerClass === 'healer') {
      const injured = gs.getAlivePlayers().filter(p => p.id !== player.id && p.hp / p.maxHp < 0.6);
      if (player.cooldowns.skillA <= 0 && injured.length >= 2 && player.mana >= 60) {
        inputs.push({ type: 'skill', skill: 'skillA', angle: angleToBoss });
      }
    }

    return inputs;
  }

  // Determine which Trinité zone a bot should stand in based on class
  // Zone 1 (inner 0-150px): tank    Zone 2 (mid 150-300px): melee DPS    Zone 3 (outer 300-480px): ranged/healer
  _getTrinitéZone(playerClass, isSolo) {
    if (isSolo) return 2; // Solo: stand in middle zone for exactly 1 debuff
    switch (playerClass) {
      case 'tank': return 1;
      case 'dps_cac': return 2;
      case 'berserker': return 2;
      case 'dps_range': return 3;
      case 'mage': return 3;
      case 'healer': return 3;
      default: return 2;
    }
  }

  // Find center of Trinité zones (boss position at cast time)
  _getTrinitéCenter(gs) {
    const outline = gs.aoeZones.find(z => z.type === 'debuff_ring_outline');
    if (outline) return { x: outline.x, y: outline.y };
    const tel = gs.aoeZones.find(z => z.type === 'debuff_circle_telegraph');
    if (tel) return { x: tel.x, y: tel.y };
    return null;
  }

  // Check if any AoE zone of a given type exists
  _hasZoneType(gs, type) {
    return gs.aoeZones.some(z => z.type === type);
  }

  // ── LASER DODGE ──
  // Dodge perpendicular when in the path of rotating lasers
  _checkLaserDodge(player, gs, boss) {
    for (const zone of gs.aoeZones) {
      if ((zone.type === 'laser' || zone.type === 'laser_red') && zone.active) {
        if (this._isInLaserPath(player, zone)) {
          // Dodge perpendicular to laser direction
          const perpAngle = zone.angle + Math.PI / 2;
          return [{ type: 'move', x: Math.cos(perpAngle), y: Math.sin(perpAngle) }];
        }
      }
    }
    return null;
  }

  // Check if player is in a laser beam's path
  _isInLaserPath(player, laserZone) {
    const dx = player.x - laserZone.x;
    const dy = player.y - laserZone.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > laserZone.radius) return false;
    // Perpendicular distance from laser line
    const laserDirX = Math.cos(laserZone.angle);
    const laserDirY = Math.sin(laserZone.angle);
    const perpDist = Math.abs(dx * laserDirY - dy * laserDirX);
    const halfWidth = (laserZone.lineWidth || 50) / 2 + 30; // Buffer
    return perpDist < halfWidth;
  }

  // ── DODGE LOGIC ──
  // Dodge roll (i-frames) for immediate threats — NOT for OS mechanics (those use movement)
  _checkDodge(player, gs, boss, distToBoss) {
    if (player.dodging || player.dodgeCooldown > 0.5) return null;

    // Check AoE zones that threaten us (skip harmless types)
    for (const zone of gs.aoeZones) {
      // Skip non-damaging zones
      if (zone.type.includes('telegraph') || zone.type.includes('outline') ||
          zone.type === 'donut_safe' || zone.type === 'poison_follow') continue;
      // Skip poison clouds — low damage, not worth dodge
      if (zone.type === 'poison_cloud') continue;

      const distToZone = this._dist(player, zone);
      const danger = zone.radius + 30;

      // Active explosion or zone about to hit
      const isDangerous = zone.active && zone.ttl > 0.1;
      if (distToZone < danger && isDangerous) {
        const awayAngle = Math.atan2(player.y - zone.y, player.x - zone.x);
        return { type: 'dodge', angle: awayAngle };
      }
    }

    // Boss leaping at us
    if (boss._moveState === 'leaping' || boss.leaping) {
      if (distToBoss < 200) {
        const awayAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
        return { type: 'dodge', angle: awayAngle };
      }
    }

    // Boss casting frontal cone — dodge sideways (non-tank only)
    if (boss.casting && this.playerClass !== 'tank' && distToBoss < 280) {
      const castName = boss.casting.name;
      // Only dodge for frontal attacks (not special mechanics)
      if (castName === 'Souffle Frontal' || castName === 'Griffe Rapide' || castName === 'Balayage de Queue') {
        const playerAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
        const angleDiff = this._angleDiff(playerAngle, boss.rotation || 0);
        if (Math.abs(angleDiff) < Math.PI / 2.5) {
          const sideAngle = (boss.rotation || 0) + Math.PI / 2 * (angleDiff > 0 ? 1 : -1);
          return { type: 'dodge', angle: sideAngle };
        }
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

    // Ultimate (Fortress) — when HP low, boss enraged, or boss about to slam
    const dangerousCast = boss.casting?.name === 'Saut Dévastateur' || boss.casting?.name === 'Plongeon Dévastateur';
    if (player.cooldowns.ultimate <= 0 && (player.hp / player.maxHp < 0.3 || boss.enraged || dangerousCast)) {
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

    // ── PRIORITY 1: Dispel boss rage buff (prevents ×3 damage at 3 stacks) ──
    if (player.cooldowns.skillB <= 0 && player.mana >= 40 && boss.rageBuff >= 1) {
      inputs.push({ type: 'skill', skill: 'skillB', angle: angleToBoss });
      return; // Dispel is top priority
    }

    // ── PRIORITY 2: Resurrect dead ally ──
    if (player.cooldowns.ultimate <= 0 && player.mana >= 100) {
      const deadAlly = gs.players.find(p => p.id !== player.id && !p.alive && p.connected !== false);
      if (deadAlly) {
        const distToDead = this._dist(player, deadAlly);
        const angleToDeadAlly = Math.atan2(deadAlly.y - player.y, deadAlly.x - player.x);
        if (distToDead > 300) {
          // Override movement to walk toward dead ally
          inputs.length = 0; // Clear movement we added above
          inputs.push(this._moveToward(player, deadAlly));
        } else {
          inputs.push({ type: 'skill', skill: 'ultimate', angle: angleToDeadAlly });
        }
        return; // Resurrect is second priority
      }
    }

    // ── PRIORITY 3: Emergency heal on critical ally (<35% HP) ──
    const criticalAlly = injured.find(p => p.hp / p.maxHp < 0.35);
    if (criticalAlly && player.cooldowns.secondary <= 0 && player.mana >= 40) {
      const angleToTarget = Math.atan2(criticalAlly.y - player.y, criticalAlly.x - player.x);
      inputs.push({ type: 'attack_secondary', angle: angleToTarget });
    }

    // ── AoE Heal (skillA) — when multiple allies injured ──
    if (player.cooldowns.skillA <= 0 && injured.length >= 2 && player.mana >= 60) {
      inputs.push({ type: 'skill', skill: 'skillA', angle: angleToBoss });
    }

    // ── Heal Zone (secondary) — place on most injured ally ──
    if (player.cooldowns.secondary <= 0 && injured.length > 0 && player.mana >= 40) {
      const target = injured[0];
      const angleToTarget = Math.atan2(target.y - player.y, target.x - player.x);
      inputs.push({ type: 'attack_secondary', angle: angleToTarget });
    }

    // ── Purification (skillB) — cleanse player debuffs ──
    if (player.cooldowns.skillB <= 0 && player.mana >= 40) {
      const debuffedAlly = allies.find(p => p.buffs.some(b =>
        b.type === 'poison' || b.type === 'speed_down' || b.type === 'weak' ||
        b.type.startsWith('manaya_mark_')
      ));
      if (debuffedAlly) {
        inputs.push({ type: 'skill', skill: 'skillB', angle: angleToBoss });
      }
    }

    // ── Basic attack when nothing to heal ──
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

  // ── MAGE AI ──
  _thinkMage(inputs, player, gs, boss, distToBoss, angleToBoss) {
    // Position: mid-range (300-450px)
    const idealDist = 380;
    if (distToBoss < idealDist - 60) {
      inputs.push(this._moveAway(player, boss));
    } else if (distToBoss > idealDist + 60) {
      inputs.push(this._moveToward(player, boss));
    } else {
      // Kite sideways
      const strafeAngle = angleToBoss + Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1);
      inputs.push({ type: 'move', x: Math.cos(strafeAngle), y: Math.sin(strafeAngle) });
    }

    inputs.push({ type: 'aim', angle: angleToBoss });

    // Cataclysme (ultimate) — channel when safe and have mana
    if (player.cooldowns.ultimate <= 0 && player.mana >= 200 && !this._nearbyDanger(player, gs)) {
      inputs.push({ type: 'skill', skill: 'ultimate', angle: angleToBoss });
      return;
    }

    // Explosion Arcanique (skillA) — targeted AoE on boss
    if (player.cooldowns.skillA <= 0 && player.mana >= 80) {
      inputs.push({ type: 'skill', skill: 'skillA', angle: angleToBoss });
    }

    // Téléportation (skillB) — escape when in danger
    if (player.cooldowns.skillB <= 0 && player.mana >= 40 && this._nearbyDanger(player, gs)) {
      const escAngle = angleToBoss + Math.PI; // teleport away from boss
      inputs.push({ type: 'skill', skill: 'skillB', angle: escAngle });
    }

    // Orbe de feu (secondary)
    if (player.cooldowns.secondary <= 0 && player.mana >= 30) {
      inputs.push({ type: 'attack_secondary', angle: angleToBoss });
    }

    // Basic ranged attack
    if (player.cooldowns.basic <= 0 && distToBoss < 500) {
      inputs.push({ type: 'attack_basic', angle: angleToBoss });
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
