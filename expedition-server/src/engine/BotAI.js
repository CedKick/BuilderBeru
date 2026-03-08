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

    // Unique angular offset so bots of same class spread around the boss
    let hash = 0;
    for (let i = 0; i < playerId.length; i++) hash = ((hash << 5) - hash + playerId.charCodeAt(i)) | 0;
    this.angleOffset = (Math.abs(hash) % 360) * (Math.PI / 180); // 0 to 2π
    this.strafeDir = hash % 2 === 0 ? 1 : -1; // clockwise or counter-clockwise
  }

  // Called every game tick — returns array of input objects to queue
  think(player, gs, dt) {
    if (!player || !player.alive) return [];

    // If currently channeling (e.g. resurrect), do NOT generate any inputs
    // Movement would cancel the channel
    if (player.casting) return [];

    let boss = gs.boss;
    // In mob wave mode (no boss), target nearest alive add
    if (!boss || !boss.alive) {
      const adds = gs.getAliveAdds();
      if (adds.length === 0) return [];
      let nearest = adds[0], nearestDist = Infinity;
      for (const a of adds) {
        const d = this._dist(player, a);
        if (d < nearestDist) { nearest = a; nearestDist = d; }
      }
      boss = nearest; // Treat nearest add as "boss" for AI targeting
    }

    const distToBoss = this._dist(player, boss);
    const angleToBoss = Math.atan2(boss.y - player.y, boss.x - player.x);

    // ── 0. MAJOR MECHANIC OVERRIDE — OS avoidance (faster check, ~50ms) ──
    this._mechanicTimer = (this._mechanicTimer || 0) + dt * 1000;
    if (this._mechanicTimer >= 50) {
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

    // ── Anneau Destructeur (Donut) — two phases ──
    // Phase 1: inner ring ~130-350px → safe if >355px (just outside ring, don't run TOO far)
    // Phase 2: outer ring 370-550 + laser <160 → safe zone 160-370px → aim for 260px
    // CRITICAL: Phase 1 safe distance must NOT exceed 370 or phase 2 outer ring kills you
    {
      const outerDonut = gs.aoeZones.find(z => (z.type === 'donut_telegraph' || z.type === 'donut_explosion') && (z.innerRadius || 0) > 300);
      const inPhase2 = !!outerDonut;
      const inPhase1 = !inPhase2 && (castName === 'Anneau Destructeur' || this._hasZoneType(gs, 'donut_safe') || this._hasZoneType(gs, 'donut_telegraph'));

      if (inPhase2) {
        // Safe zone: 160-370px → aim for ~260px (sprint back from phase 1 position)
        if (distToBoss < 170) {
          return [this._moveAway(player, boss)];
        } else if (distToBoss > 350) {
          // Emergency dodge toward boss if available (i-frames + big distance gain)
          if (!player.dodging && player.dodgeCooldown <= 0) {
            return [{ type: 'dodge', angle: angleToBoss }];
          }
          return [this._moveToward(player, boss)]; // RUSH back inside
        } else if (distToBoss > 300) {
          return [this._moveToward(player, boss)]; // Still moving in to be safe
        }
        return [{ type: 'stop' }];
      }
      if (inPhase1) {
        // Safe at >355px but do NOT go beyond 365px (phase 2 outer starts at 370)
        if (distToBoss < 360) {
          return [this._moveAway(player, boss)];
        }
        // Already safe — stop and WAIT (don't run further!)
        return [{ type: 'stop' }];
      }
    }

    // ── Sphère de Mort — run far away (>270px) ──
    if (castName === 'Sphère de Mort') {
      if (distToBoss < 280) {
        return [this._moveAway(player, boss)];
      }
      return [{ type: 'stop' }];
    }

    // ── Generic pattern handling based on boss.currentPattern ──
    if (boss.casting && boss.currentPattern) {
      const pat = boss.currentPattern.pattern;

      // Double donut (Anneau Destructeur) — phase 1: run away >360px, phase 2: run to 160-370px
      if (pat.type === 'double_donut') {
        // Check if phase 2 is active (outer ring zones exist)
        const outerDonut = gs.aoeZones.find(z => z.id?.startsWith('dbl_outer_') && (z.type === 'donut_telegraph' || z.type === 'donut_explosion'));
        if (outerDonut) {
          // Phase 2: safe zone is 160-370px. Aim for ~260px.
          if (distToBoss < 170) {
            return [this._moveAway(player, boss)];
          } else if (distToBoss > 350) {
            if (!player.dodging && player.dodgeCooldown <= 0) {
              return [{ type: 'dodge', angle: angleToBoss }];
            }
            return [this._moveToward(player, boss)];
          } else if (distToBoss > 300) {
            return [this._moveToward(player, boss)];
          }
          return [{ type: 'stop' }];
        }
        // Phase 1: safe <120px or >360px. Run away to >360px.
        if (distToBoss < 365) {
          return [this._moveAway(player, boss)];
        }
        return [{ type: 'stop' }];
      }

      // Simple donut — run to boss center (safe inside)
      if (pat.type === 'donut') {
        const safe = pat.innerSafe || 150;
        if (distToBoss > safe - 20) {
          return [this._moveToward(player, boss)];
        }
        return [{ type: 'stop' }];
      }
      // Generic large aoe_ring — run out of range
      if (pat.type === 'aoe_ring' && (pat.outerRadius || 300) >= 250) {
        const outer = pat.outerRadius || 300;
        if (distToBoss < outer + 50) {
          return [this._moveAway(player, boss)];
        }
        return [{ type: 'stop' }];
      }
      // Percent HP attack — critical, run to safety
      if (pat.type === 'percent_hp_attack') {
        const outer = pat.outerRadius || 400;
        const inner = pat.innerSafe || 0;
        if (inner > 0 && distToBoss < inner) return null; // Safe inside
        if (distToBoss < outer + 30) {
          if (inner > 0) return [this._moveToward(player, boss)];
          return [this._moveAway(player, boss)];
        }
        return [{ type: 'stop' }];
      }
    }

    // ── Double Impact — two phases ──
    // Phase 1: inner circle <180px → run away (>200px)
    // Phase 2: outer ring 180-550px → run BACK to boss (<170px)
    if (castName === 'Double Impact' || gs.aoeZones.some(z => z.id?.startsWith('dbl_'))) {
      const innerExploded = gs.aoeZones.some(z => z.id?.startsWith('dbl_inner_exp'));
      const outerActive = gs.aoeZones.some(z => z.id?.startsWith('dbl_outer_') && (z.type === 'donut_telegraph' || z.type === 'donut_explosion'));
      if (innerExploded && outerActive) {
        // Phase 2: get close to boss (<170px to be safe from outer ring)
        if (distToBoss > 160) {
          return [this._moveToward(player, boss)];
        }
        return [{ type: 'stop' }];
      }
      // Phase 1: run away from inner circle
      if (distToBoss < 200) {
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
  // Generic dodge system for expedition boss patterns.
  // Reacts to boss casting state + AoE zones, not just hardcoded attack names.
  _checkDodge(player, gs, boss, distToBoss) {
    if (player.dodging || player.dodgeCooldown > 0.5) return null;

    // ── 1. Active AoE zones threatening us ──
    for (const zone of gs.aoeZones) {
      // Skip non-damaging / visual-only zones
      if (zone.type.includes('telegraph') || zone.type.includes('outline') ||
          zone.type === 'donut_safe' || zone.type === 'poison_follow' ||
          zone.type === 'soak_circle' || zone.type === 'boss_heal_cast') continue;
      if (zone.type === 'poison_cloud') continue;

      const distToZone = this._dist(player, zone);
      const danger = zone.radius + 30;

      // Active damaging zone
      const isDangerous = zone.active && zone.ttl > 0.1;
      if (distToZone < danger && isDangerous) {
        const awayAngle = Math.atan2(player.y - zone.y, player.x - zone.x);
        return { type: 'dodge', angle: awayAngle };
      }

      // Boss donut about to resolve — dodge INTO safe zone if outside
      if (zone.type === 'boss_donut' && distToZone > (zone.innerSafe || 150) + 20) {
        const towardAngle = Math.atan2(zone.y - player.y, zone.x - player.x);
        return { type: 'dodge', angle: towardAngle };
      }
    }

    // Boss leaping at us
    if (boss._moveState === 'leaping' || boss.leaping) {
      if (distToBoss < 200) {
        const awayAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
        return { type: 'dodge', angle: awayAngle };
      }
    }

    // ── 2. Generic boss casting reaction ──
    // React to ANY boss pattern during telegraph/cast, based on pattern type
    if (boss.casting && boss.currentPattern) {
      const pat = boss.currentPattern.pattern;
      const castProgress = boss.casting.progress || 0;

      // Only react when telegraph is > 50% done (gives AI realistic reaction time)
      if (castProgress < 0.5) return null;

      switch (pat.type) {
        case 'cone_telegraph': {
          // Non-tanks dodge sideways if in the cone
          if (this.playerClass === 'tank') break;
          const range = pat.range || 250;
          if (distToBoss > range + 50) break; // Out of range, safe
          const playerAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
          const angleDiff = this._angleDiff(playerAngle, boss.rotation || 0);
          const halfCone = ((pat.coneAngle || 90) * Math.PI / 180) / 2;
          if (Math.abs(angleDiff) < halfCone + 0.2) {
            // In the cone — dodge perpendicular
            const sideAngle = (boss.rotation || 0) + Math.PI / 2 * (angleDiff > 0 ? 1 : -1);
            return { type: 'dodge', angle: sideAngle };
          }
          break;
        }
        case 'aoe_ring': {
          // Dodge away from boss if within outer radius
          const outer = pat.outerRadius || 300;
          if (distToBoss < outer + 40) {
            const awayAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
            return { type: 'dodge', angle: awayAngle };
          }
          break;
        }
        case 'donut': {
          // Dodge TOWARD boss to reach inner safe zone
          const safe = pat.innerSafe || 150;
          if (distToBoss > safe + 30) {
            const towardAngle = Math.atan2(boss.y - player.y, boss.x - player.x);
            return { type: 'dodge', angle: towardAngle };
          }
          break;
        }
        case 'double_donut': {
          // Phase 1: dodge AWAY if in ring (120-360px)
          if (distToBoss > 100 && distToBoss < 370) {
            const awayAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
            return { type: 'dodge', angle: awayAngle };
          }
          break;
        }
        case 'line_telegraph': {
          // Dodge perpendicular if in the line path
          const range = pat.range || 800;
          const halfW = (pat.lineWidth || 80) / 2;
          const dx = player.x - boss.x, dy = player.y - boss.y;
          const cos = Math.cos(boss.rotation || 0), sin = Math.sin(boss.rotation || 0);
          const along = dx * cos + dy * sin;
          const perp = -dx * sin + dy * cos;
          if (along >= -20 && along <= range + 20 && Math.abs(perp) < halfW + 40) {
            const sideAngle = (boss.rotation || 0) + Math.PI / 2 * (perp > 0 ? 1 : -1);
            return { type: 'dodge', angle: sideAngle };
          }
          break;
        }
        case 'targeted_aoe_multi': {
          // Can't predict exact target, but if close to boss during cast, dodge away
          if (distToBoss < (pat.aoeRadius || 100) + 80 && this.playerClass !== 'tank') {
            const awayAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
            return { type: 'dodge', angle: awayAngle };
          }
          break;
        }
        case 'fire_wave': {
          // Dodge away early — the wave expands from boss
          const maxR = pat.maxRadius || 500;
          if (distToBoss < maxR * 0.6) {
            const awayAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
            return { type: 'dodge', angle: awayAngle };
          }
          break;
        }
        case 'percent_hp_attack': {
          // CRITICAL — dodge at all costs (sets HP to X%)
          const outer = pat.outerRadius || 400;
          const inner = pat.innerSafe || 0;
          if (inner > 0 && distToBoss < inner) break; // Already in safe zone
          if (distToBoss < outer + 30) {
            if (inner > 0) {
              // Dodge toward safe inner zone
              const towardAngle = Math.atan2(boss.y - player.y, boss.x - player.x);
              return { type: 'dodge', angle: towardAngle };
            }
            // No safe zone — just dodge away and pray for i-frames
            const awayAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
            return { type: 'dodge', angle: awayAngle };
          }
          break;
        }
        case 'ultimate_wipe': {
          // Save dodge for i-frames right before cast resolves (> 80% telegraph)
          if (castProgress > 0.8) {
            const awayAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
            return { type: 'dodge', angle: awayAngle };
          }
          break;
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
    // Position: stay far back — each healer has a unique orbit angle to avoid stacking
    const idealDist = 420;
    const targetAngle = angleToBoss + Math.PI + this.angleOffset; // spread around opposite side of boss
    const targetX = boss.x + Math.cos(targetAngle) * idealDist;
    const targetY = boss.y + Math.sin(targetAngle) * idealDist;
    const distToTarget = Math.sqrt((player.x - targetX) ** 2 + (player.y - targetY) ** 2);

    if (distToTarget > 60) {
      const a = Math.atan2(targetY - player.y, targetX - player.x);
      inputs.push({ type: 'move', x: Math.cos(a), y: Math.sin(a) });
    } else {
      // Gentle strafe at orbit position
      const strafeAngle = angleToBoss + Math.PI / 2 * this.strafeDir;
      inputs.push({ type: 'move', x: Math.cos(strafeAngle) * 0.3, y: Math.sin(strafeAngle) * 0.3 });
    }

    // Find allies and assess situation
    const allies = gs.getAlivePlayers().filter(p => p.id !== player.id);
    const injured = allies.filter(p => p.hp / p.maxHp < 0.7).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp);
    const criticalAlly = injured.find(p => p.hp / p.maxHp < 0.35);

    // ── PRIORITY 1: Dispel boss rage buff (prevents x3 damage at 3 stacks) ──
    if (player.cooldowns.skillB <= 0 && player.mana >= 40 && boss.rageBuff >= 1) {
      inputs.push({ type: 'skill', skill: 'skillB', angle: angleToBoss });
      return;
    }

    // ── PRIORITY 2: Resurrect dead ally (channeled 4s — must stop moving first) ──
    if (player.cooldowns.ultimate <= 0 && player.mana >= 100) {
      const deadAlly = gs.players.find(p => p.id !== player.id && !p.alive && p.connected !== false);
      if (deadAlly) {
        const distToDead = this._dist(player, deadAlly);
        const angleToDeadAlly = Math.atan2(deadAlly.y - player.y, deadAlly.x - player.x);
        if (distToDead > 250) {
          inputs.length = 0;
          inputs.push(this._moveToward(player, deadAlly));
        } else {
          inputs.length = 0;
          inputs.push({ type: 'stop' });
          inputs.push({ type: 'skill', skill: 'ultimate', angle: angleToDeadAlly });
        }
        return;
      }
    }

    // ── PRIORITY 3: Emergency heal on critical ally (<35% HP) ──
    if (criticalAlly && player.cooldowns.secondary <= 0 && player.mana >= 40) {
      const angleToTarget = Math.atan2(criticalAlly.y - player.y, criticalAlly.x - player.x);
      inputs.push({ type: 'attack_secondary', angle: angleToTarget });
    }

    // ── AoE Heal (skillA) — when 2+ allies injured OR 1 ally critical ──
    if (player.cooldowns.skillA <= 0 && player.mana >= 60 && (injured.length >= 2 || criticalAlly)) {
      inputs.push({ type: 'skill', skill: 'skillA', angle: angleToBoss });
    }

    // ── Heal Zone (secondary) — place on most injured ally ──
    if (player.cooldowns.secondary <= 0 && injured.length > 0 && player.mana >= 40) {
      const target = injured[0];
      const angleToTarget = Math.atan2(target.y - player.y, target.x - player.x);
      inputs.push({ type: 'attack_secondary', angle: angleToTarget });
    }

    // ── Purification (skillB) — cleanse player debuffs + gives crit/speed buff ──
    if (player.cooldowns.skillB <= 0 && player.mana >= 40) {
      const debuffedAlly = allies.find(p => p.buffs.some(b =>
        b.type === 'poison' || b.type === 'speed_down' || b.type === 'weak' ||
        b.type.startsWith('manaya_mark_')
      ));
      if (debuffedAlly) {
        inputs.push({ type: 'skill', skill: 'skillB', angle: angleToBoss });
      }
    }

    // ── ALWAYS auto-attack for DPS + mana regen (manaOnHit: 25) ──
    if (player.cooldowns.basic <= 0 && distToBoss < 550) {
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
    // Position: far back — each archer orbits at a unique angle
    const idealDist = 480;
    const targetAngle = angleToBoss + Math.PI + this.angleOffset;
    const targetX = boss.x + Math.cos(targetAngle) * idealDist;
    const targetY = boss.y + Math.sin(targetAngle) * idealDist;
    const distToTarget = Math.sqrt((player.x - targetX) ** 2 + (player.y - targetY) ** 2);

    if (distToTarget > 60) {
      const a = Math.atan2(targetY - player.y, targetX - player.x);
      inputs.push({ type: 'move', x: Math.cos(a), y: Math.sin(a) });
    } else {
      const strafeAngle = angleToBoss + Math.PI / 2 * this.strafeDir;
      inputs.push({ type: 'move', x: Math.cos(strafeAngle) * 0.3, y: Math.sin(strafeAngle) * 0.3 });
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

    // Charged shot (secondary) — spam it hard for DPS
    if (player.cooldowns.secondary <= 0 && player.mana >= 25) {
      inputs.push({ type: 'attack_secondary', angle: angleToBoss });
    }

    // Basic ranged attack — always fire when in range
    if (player.cooldowns.basic <= 0) {
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
    // "Glitch": can spam auto-attack AND ultimate while charging E
    if (player.cooldowns.skillB <= 0 && distToBoss < 100) {
      if (!player.charging) {
        inputs.push({ type: 'charge_start', skill: 'skillB', angle: angleToBoss });
      } else {
        const chargeTime = player.charging ? (Date.now() - player.charging.startTime) / 1000 : 0;
        if (chargeTime >= 2.0 || this._nearbyDanger(player, gs)) {
          inputs.push({ type: 'charge_release', angle: angleToBoss });
        }
      }
      // NO return — fall through to auto-attack while charging
    }

    // Block (secondary) — when boss casts at us and NOT charging
    const isTarget = this._isBossTarget(player, gs);
    if (!player.charging && isTarget && boss.casting && !this.blocking && player.mana >= 20) {
      inputs.push({ type: 'attack_secondary', angle: angleToBoss });
      this.blocking = true;
    } else if (this.blocking && (!boss.casting || !isTarget)) {
      inputs.push({ type: 'stop_secondary' });
      this.blocking = false;
    }

    // Basic attack — spam even while charging E (the "glitch")
    if (!this.blocking && distToBoss < 100) {
      inputs.push({ type: 'start_basic', angle: angleToBoss });
    }

    // Ultimate while charging too — max DPS combo
    if (player.charging && player.cooldowns.ultimate <= 0 && player.mana >= 90 && distToBoss < 150) {
      inputs.push({ type: 'skill', skill: 'ultimate', angle: angleToBoss });
    }
  }

  // ── MAGE AI (Frieren) ──
  _thinkMage(inputs, player, gs, boss, distToBoss, angleToBoss) {
    // Position: mid-range for projectiles, dive for Onde Arcanique
    const wantsOnde = player.cooldowns.ultimate <= 0 && player.mana >= 60 && !this._nearbyDanger(player, gs);
    const idealDist = wantsOnde ? 140 : 350;

    // Each mage orbits at unique angle to spread out
    const targetAngle = angleToBoss + Math.PI + this.angleOffset;
    const targetX = boss.x + Math.cos(targetAngle) * idealDist;
    const targetY = boss.y + Math.sin(targetAngle) * idealDist;
    const distToTarget = Math.sqrt((player.x - targetX) ** 2 + (player.y - targetY) ** 2);

    if (distToTarget > 60) {
      const a = Math.atan2(targetY - player.y, targetX - player.x);
      inputs.push({ type: 'move', x: Math.cos(a), y: Math.sin(a) });
    } else {
      const strafeAngle = angleToBoss + Math.PI / 2 * this.strafeDir;
      inputs.push({ type: 'move', x: Math.cos(strafeAngle) * 0.3, y: Math.sin(strafeAngle) * 0.3 });
    }

    inputs.push({ type: 'aim', angle: angleToBoss });

    // Onde Arcanique (ultimate) — spammable AoE self, proximity bonus, 1s CD, 60 mana
    if (player.cooldowns.ultimate <= 0 && player.mana >= 60 && distToBoss < 220) {
      inputs.push({ type: 'skill', skill: 'ultimate', angle: angleToBoss });
    }

    // Zollstraak (skillA) — long range piercing laser, 5s CD, 60 mana
    if (player.cooldowns.skillA <= 0 && player.mana >= 60) {
      inputs.push({ type: 'skill', skill: 'skillA', angle: angleToBoss });
    }

    // Téléportation (skillB) — escape when in danger
    if (player.cooldowns.skillB <= 0 && player.mana >= 30 && this._nearbyDanger(player, gs)) {
      const escAngle = angleToBoss + Math.PI; // teleport away from boss
      inputs.push({ type: 'skill', skill: 'skillB', angle: escAngle });
    }

    // Orbe de feu (secondary) — piercing projectile
    if (player.cooldowns.secondary <= 0 && player.mana >= 35) {
      inputs.push({ type: 'attack_secondary', angle: angleToBoss });
    }

    // Basic ranged attack (Trait arcanique) — free, no mana
    if (player.cooldowns.basic <= 0 && distToBoss < 550) {
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
