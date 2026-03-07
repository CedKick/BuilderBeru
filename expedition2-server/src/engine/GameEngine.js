// -- Expedition II: Ragnaros -- Game Engine --
// 20 TPS server-authoritative game loop

import { GAME } from '../config.js';
import { Player, CLASS_SKILLS } from '../entities/Player.js';
import { Boss } from '../entities/Boss.js';
import { getMapData } from '../data/mapData.js';

export class GameEngine {
  constructor(broadcast) {
    this.broadcast = broadcast;
    this.players = new Map();
    this.boss = null;
    this.status = 'lobby';
    this.tickInterval = null;
    this.lastTick = Date.now();
    this.tickCount = 0;

    this.projectiles = [];
    this.lasers = [];
    this.effects = [];
    this.traps = [];

    // DPS tracking
    this.dpsTracker = new Map(); // playerId -> totalDamage
    this.fightStart = 0;

    // Rage meter — builds when not taking damage, resets on hit
    this.rageMeter = new Map(); // playerId -> { rage: 0-100, lastHitTime }
    this.RAGE_GAIN_PER_SEC = 8;
    this.RAGE_MAX_MULT = 1.5;
  }

  addPlayer(id, username, playerClass) {
    const player = new Player(id, username, playerClass);
    this.players.set(id, player);
    return { type: 'map_data', data: getMapData() };
  }

  removePlayer(id) {
    this.players.delete(id);
    this.dpsTracker.delete(id);
    this.rageMeter.delete(id);
    if (this.players.size === 0 && this.status === 'fighting') {
      this.status = 'defeat';
      this.stop();
    }
  }

  handleInput(playerId, input) {
    const player = this.players.get(playerId);
    if (!player) return;
    switch (input.type) {
      case 'move':
        player.setInput(input.x || 0, input.y || 0);
        // Facing follows mouse aim (like Manaya)
        if (input.aimX != null) {
          player.facing = input.aimX >= player.x ? 'right' : 'left';
        }
        break;
      case 'basic':
        this.castSpell(player, 'basic', input.aimX, input.aimY);
        break;
      case 'secondary':
        this.castSpell(player, 'secondary', input.aimX, input.aimY);
        break;
      case 'secondary_stop':
        // Stop blocking
        player.blocking = false;
        break;
      case 'skillA':
        this.castSpell(player, 'skillA', input.aimX, input.aimY);
        break;
      case 'skillB':
        this.castSpell(player, 'skillB', input.aimX, input.aimY);
        break;
      case 'skillB_release':
        this.castSpell(player, 'skillB_release', input.aimX, input.aimY);
        break;
      case 'ultimate':
        this.castSpell(player, 'ultimate', input.aimX, input.aimY);
        break;
      case 'dash':
        this.castSpell(player, 'dash');
        break;
      // Legacy support
      case 'attack':
        this.castSpell(player, 'basic', input.aimX, input.aimY);
        break;
      case 'spell':
        if (input.spell === 'ulti') this.castSpell(player, 'ultimate', input.aimX, input.aimY);
        else if (input.spell === 'shield') this.castSpell(player, 'secondary', input.aimX, input.aimY);
        else this.castSpell(player, input.spell, input.aimX, input.aimY);
        break;
    }
  }

  castSpell(player, spellId, aimX, aimY) {
    if (!player.alive) return;
    const now = Date.now();
    const result = player.castSpell(spellId, now);
    if (!result) return;

    let dx, dy;
    if (aimX != null && aimY != null) {
      dx = aimX - player.x;
      dy = aimY - player.y;
    } else if (this.boss) {
      dx = this.boss.x - player.x;
      dy = this.boss.y - player.y;
    } else {
      dx = 1; dy = 0;
    }
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const dirX = dx / dist;
    const dirY = dy / dist;

    // Update facing based on aim direction (like Manaya)
    if (aimX != null) {
      player.facing = dx >= 0 ? 'right' : 'left';
    }

    switch (result.type) {
      case 'cone': {
        const angle = Math.atan2(dirY, dirX);
        const halfCone = ((result.coneAngle || 70) * Math.PI / 180) / 2;
        let hitSomething = false;

        // Hit boss
        if (this.boss && this.boss.alive) {
          const bx = this.boss.x - player.x, by = this.boss.y - player.y;
          const bDist = Math.sqrt(bx * bx + by * by);
          if (bDist <= result.range + this.boss.radius) {
            const angleToBoss = Math.atan2(by, bx);
            let angleDiff = angleToBoss - angle;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            if (Math.abs(angleDiff) <= halfCone) {
              const rageMult = this.getRageMult(player.id);
              const comboMult = this.getComboMult(player.id, result.spell);
              const finalDmg = Math.floor(result.damage * rageMult * comboMult);
              this.boss.takeDamage(finalDmg, player.id, result.crit);
              this.trackDps(player.id, finalDmg);
              hitSomething = true;
            }
          }
        }

        // Hit adds
        if (this.boss) {
          for (const add of this.boss.adds) {
            if (!add.alive) continue;
            const ax = add.x - player.x, ay = add.y - player.y;
            const aDist = Math.sqrt(ax * ax + ay * ay);
            if (aDist > result.range + add.radius) continue;
            const angleToAdd = Math.atan2(ay, ax);
            let angleDiff = angleToAdd - angle;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            if (Math.abs(angleDiff) <= halfCone) {
              this.boss.damageAdd(add.id, result.damage, result.crit, player.id);
              this.trackDps(player.id, result.damage);
              hitSomething = true;
            }
          }
        }

        this.effects.push({
          type: 'cone_attack',
          x: player.x, y: player.y,
          angle, range: result.range, coneAngle: result.coneAngle,
          color: result.color, chargeLevel: result.chargeLevel,
          owner: player.id,
          endTime: now + 200,
        });
        break;
      }

      case 'projectile': {
        this.projectiles.push({
          x: player.x, y: player.y,
          vx: dirX * result.speed, vy: dirY * result.speed,
          damage: result.damage, radius: result.radius,
          owner: player.id, spell: result.spell,
          life: result.range / result.speed,
          color: result.color, crit: result.crit || false,
          piercing: result.piercing || false,
        });
        this.effects.push({
          type: 'cast', spell: result.spell,
          x: player.x, y: player.y, endTime: now + 300,
        });
        break;
      }

      case 'laser': {
        const angle = Math.atan2(dirY, dirX);
        if (this.boss && this.boss.alive) {
          const bDist = Math.sqrt((this.boss.x - player.x) ** 2 + (this.boss.y - player.y) ** 2);
          if (bDist < result.range + this.boss.radius) {
            const perpDist = Math.abs(
              Math.sin(angle) * (this.boss.x - player.x) -
              Math.cos(angle) * (this.boss.y - player.y)
            );
            if (perpDist < result.width / 2 + this.boss.radius) {
              const rageMult = this.getRageMult(player.id);
              const comboMult = this.getComboMult(player.id, result.spell);
              const finalDmg = Math.floor(result.damage * rageMult * comboMult);
              this.boss.takeDamage(finalDmg, player.id, result.crit);
              this.trackDps(player.id, finalDmg);
            }
          }
        }
        if (this.boss) {
          for (const add of this.boss.adds) {
            if (!add.alive) continue;
            const aDist = Math.sqrt((add.x - player.x) ** 2 + (add.y - player.y) ** 2);
            if (aDist > result.range) continue;
            const perpDist = Math.abs(
              Math.sin(angle) * (add.x - player.x) -
              Math.cos(angle) * (add.y - player.y)
            );
            if (perpDist < result.width / 2 + add.radius) {
              this.boss.damageAdd(add.id, result.damage, result.crit, player.id);
              this.trackDps(player.id, result.damage);
            }
          }
        }
        this.lasers.push({
          x: player.x, y: player.y, angle,
          width: result.width, range: result.range,
          endTime: now + result.duration,
          spell: result.spell, color: result.color,
        });
        break;
      }

      case 'block_start': {
        player.blocking = true;
        break;
      }

      case 'heal_zone': {
        // Place heal zone at aim point or player position
        const hx = aimX != null ? aimX : player.x;
        const hy = aimY != null ? aimY : player.y;
        const tickInterval = result.duration / result.ticks;
        this.effects.push({
          type: 'heal_zone',
          x: hx, y: hy,
          radius: result.radius,
          healPerTick: Math.floor(result.healAmount / result.ticks),
          owner: player.id,
          spell: result.spell,
          endTime: now + result.duration,
          lastTick: now,
          tickRate: tickInterval,
        });
        break;
      }

      case 'heal_aoe': {
        // Instant AoE heal around player
        for (const p of this.players.values()) {
          if (!p.alive) continue;
          const ddx = p.x - player.x, ddy = p.y - player.y;
          if (ddx * ddx + ddy * ddy < result.radius * result.radius) {
            const healed = p.heal(result.healAmount);
            if (healed > 0 && this.boss) {
              this.boss.addDamageEvent(p.x, p.y - 20, healed, 'heal');
            }
          }
        }
        this.effects.push({
          type: 'heal_burst',
          x: player.x, y: player.y,
          radius: result.radius, owner: player.id,
          endTime: now + 500,
        });
        break;
      }

      case 'buff_self': {
        this.effects.push({
          type: 'buff_aura',
          x: player.x, y: player.y,
          playerId: player.id,
          endTime: now + result.duration,
        });
        break;
      }

      case 'charge_start': {
        // Berserker starts charging — no effect needed, state is in Player
        break;
      }

      case 'taunt': {
        // Tank taunt — force boss aggro
        if (this.boss && this.boss.alive) {
          const aggro = this.boss.aggroMap.get(player.id) || 0;
          const maxAggro = Math.max(...this.boss.aggroMap.values(), 0);
          this.boss.aggroMap.set(player.id, maxAggro + 8000);
        }
        this.effects.push({
          type: 'taunt',
          x: player.x, y: player.y,
          radius: result.radius, owner: player.id,
          endTime: now + 800,
        });
        break;
      }

      case 'party_shield': {
        // Tank gives shield to all nearby allies
        const shieldHp = Math.floor(player.maxHp * result.shieldHpMult);
        for (const p of this.players.values()) {
          if (!p.alive) continue;
          const ddx = p.x - player.x, ddy = p.y - player.y;
          if (ddx * ddx + ddy * ddy < result.radius * result.radius) {
            p.shieldActive = true;
            p.shieldEnd = now + result.duration;
            p.shieldHp = shieldHp;
          }
        }
        this.effects.push({
          type: 'party_shield',
          x: player.x, y: player.y,
          radius: result.radius, owner: player.id,
          endTime: now + 800,
        });
        break;
      }

      case 'cleanse': {
        // Healer removes debuffs from nearby allies — for now just heals a bit
        for (const p of this.players.values()) {
          if (!p.alive) continue;
          const ddx = p.x - player.x, ddy = p.y - player.y;
          if (ddx * ddx + ddy * ddy < result.radius * result.radius) {
            p.heal(1000);
            if (this.boss) this.boss.addDamageEvent(p.x, p.y - 20, 1000, 'heal');
          }
        }
        this.effects.push({
          type: 'cleanse',
          x: player.x, y: player.y,
          radius: result.radius, owner: player.id,
          endTime: now + 500,
        });
        break;
      }

      case 'trap': {
        // Place trap at aim point
        const tx = aimX != null ? aimX : player.x;
        const ty = aimY != null ? aimY : player.y;
        this.traps.push({
          x: tx, y: ty,
          radius: result.radius,
          damage: result.damage,
          crit: result.crit,
          owner: player.id,
          endTime: now + result.duration,
          triggered: false,
        });
        this.effects.push({
          type: 'trap_placed',
          x: tx, y: ty,
          radius: result.radius, owner: player.id,
          endTime: now + result.duration,
        });
        break;
      }

      case 'dash_attack': {
        // Warrior dash — move player forward and hit everything in path
        const dashDist = result.dashDistance || 220;
        player.dashing = true;
        player.dashEnd = now + 250;
        player.invulnUntil = now + 300;
        player.dashVx = dirX * 1000;
        player.dashVy = dirY * 1000;

        // Damage boss if in path
        if (this.boss && this.boss.alive) {
          const bDist = Math.sqrt((this.boss.x - player.x) ** 2 + (this.boss.y - player.y) ** 2);
          if (bDist < dashDist + this.boss.radius) {
            const rageMult = this.getRageMult(player.id);
            const finalDmg = Math.floor(result.damage * rageMult);
            this.boss.takeDamage(finalDmg, player.id, result.crit);
            this.trackDps(player.id, finalDmg);
          }
        }
        this.effects.push({
          type: 'dash_trail', playerId: player.id,
          x: player.x, y: player.y,
          color: '#f59e0b',
          endTime: now + 400,
        });
        break;
      }

      case 'single_target': {
        // Warrior execution — massive single target hit
        if (this.boss && this.boss.alive) {
          const bDist = Math.sqrt((this.boss.x - player.x) ** 2 + (this.boss.y - player.y) ** 2);
          if (bDist <= (result.range || 110) + this.boss.radius) {
            let dmg = result.damage;
            // Bonus vs low HP
            if (result.bonusVsLowHp && this.boss.hp / this.boss.maxHp < 0.3) {
              dmg = Math.floor(dmg * (1 + result.bonusVsLowHp));
            }
            const rageMult = this.getRageMult(player.id);
            const finalDmg = Math.floor(dmg * rageMult);
            this.boss.takeDamage(finalDmg, player.id, result.crit);
            this.trackDps(player.id, finalDmg);
          }
        }
        this.effects.push({
          type: 'execution_slash',
          x: player.x, y: player.y,
          angle: Math.atan2(dirY, dirX),
          owner: player.id,
          endTime: now + 400,
        });
        break;
      }

      case 'channel_start': {
        // Archer barrage — channeling handled by Player.update + tick()
        this.effects.push({
          type: 'channel_aura',
          playerId: player.id,
          x: player.x, y: player.y,
          endTime: now + result.duration,
        });
        break;
      }

      case 'ice_aoe':
      case 'arrow_rain':
      case 'whirlwind':
      case 'ground_slam': {
        let targetX, targetY;
        if (result.type === 'whirlwind' || result.type === 'ground_slam') {
          targetX = player.x; targetY = player.y;
        } else {
          targetX = aimX != null ? aimX : (this.boss ? this.boss.x : player.x);
          targetY = aimY != null ? aimY : (this.boss ? this.boss.y : player.y);
        }
        this.effects.push({
          type: result.type,
          x: targetX, y: targetY,
          radius: result.radius,
          damage: result.damage,
          crit: result.crit,
          tickRate: result.tickRate,
          healPerTick: result.healPerTick || 0,
          owner: player.id,
          spell: result.spell,
          playerClass: result.playerClass,
          endTime: now + result.duration,
          lastTick: now,
        });
        break;
      }

      case 'fortify': {
        const shieldAmount = Math.floor(player.maxHp * 0.3);
        for (const p of this.players.values()) {
          if (!p.alive) continue;
          const ddx = p.x - player.x, ddy = p.y - player.y;
          if (ddx * ddx + ddy * ddy < result.radius * result.radius) {
            p.shieldActive = true;
            p.shieldEnd = now + result.duration;
            p.shieldHp = shieldAmount;
          }
        }
        // Invuln for tank
        player.invulnUntil = now + result.duration;
        // Massive aggro
        if (this.boss) {
          const maxAggro = Math.max(...this.boss.aggroMap.values(), 0);
          this.boss.aggroMap.set(player.id, maxAggro + 15000);
        }
        this.effects.push({
          type: 'fortify',
          x: player.x, y: player.y,
          radius: result.radius,
          owner: player.id,
          spell: result.spell,
          playerClass: result.playerClass,
          endTime: now + result.duration,
          lastTick: now,
        });
        break;
      }

      case 'buff': {
        this.effects.push({
          type: 'shield', playerId: player.id,
          endTime: now + result.duration,
        });
        break;
      }

      case 'dash': {
        this.effects.push({
          type: 'dash_trail', playerId: player.id,
          x: player.x, y: player.y,
          endTime: now + 400,
        });
        break;
      }
    }
  }

  spawnBots() {
    const MAX_TOTAL = 10;
    const humanCount = [...this.players.values()].filter(p => !p.isBot).length;
    const botsNeeded = Math.max(0, MAX_TOTAL - humanCount);

    const botPool = [
      { name: 'Frieren', cls: 'mage', role: 'dps' },
      { name: 'Fern', cls: 'mage', role: 'dps' },
      { name: 'Himmel', cls: 'warrior', role: 'dps' },
      { name: 'Heiter', cls: 'healer', role: 'healer' },
      { name: 'Sein', cls: 'healer', role: 'healer' },
      { name: 'Eisen', cls: 'tank', role: 'tank' },
      { name: 'Stark', cls: 'berserker', role: 'dps' },
      { name: 'Denken', cls: 'archer', role: 'dps' },
      { name: 'Ubel', cls: 'berserker', role: 'dps' },
      { name: 'Flamme', cls: 'mage', role: 'dps' },
    ];

    for (let i = 0; i < botsNeeded; i++) {
      const id = `bot_${i}`;
      const def = botPool[i % botPool.length];
      const bot = new Player(id, def.name, def.cls);
      bot.isBot = true;
      bot.botRole = def.role;
      const angle = (i / botsNeeded) * Math.PI * 2 - Math.PI / 2;
      const dist = 450 + Math.random() * 100;
      bot.x = GAME.BOSS_SPAWN.x + Math.cos(angle) * dist;
      bot.y = GAME.BOSS_SPAWN.y + Math.sin(angle) * dist;
      this.players.set(id, bot);
    }
    console.log(`[GameEngine] Spawned ${botsNeeded} bots (${humanCount} humans, ${botsNeeded + humanCount} total)`);
  }

  updateBotAI(bot, now, playersArray) {
    if (!bot.alive || !this.boss) return;

    const dx = this.boss.x - bot.x;
    const dy = this.boss.y - bot.y;
    const distToBoss = Math.sqrt(dx * dx + dy * dy);
    const isMelee = ['berserker', 'warrior', 'tank'].includes(bot.playerClass);
    const skills = CLASS_SKILLS[bot.playerClass];

    // Priority: target adds if they exist
    let targetAdd = null;
    if (this.boss.adds.length > 0 && bot.botRole === 'dps') {
      let nearest = Infinity;
      for (const a of this.boss.adds) {
        if (!a.alive) continue;
        const d = Math.sqrt((bot.x - a.x) ** 2 + (bot.y - a.y) ** 2);
        if (d < nearest) { nearest = d; targetAdd = a; }
      }
    }

    // Dodge dangerous patterns
    let dodging = false;
    const pattern = this.boss.activePattern;
    const telegraph = this.boss.telegraph;
    const dangerType = pattern || telegraph?.type;

    if (dangerType === 'hammer_slam' && distToBoss < 280) {
      bot.setInput(-dx / distToBoss, -dy / distToBoss);
      dodging = true;
    } else if (dangerType === 'fire_wave') {
      const pd = this.boss.patternData;
      if (pd && pd.currentRadius) {
        const botDist = Math.sqrt((bot.x - pd.x) ** 2 + (bot.y - pd.y) ** 2);
        if (Math.abs(botDist - pd.currentRadius) < 80) {
          const awayX = bot.x - pd.x, awayY = bot.y - pd.y;
          const ad = Math.sqrt(awayX * awayX + awayY * awayY) || 1;
          bot.setInput(awayX / ad, awayY / ad);
          dodging = true;
        }
      }
    } else if (dangerType === 'rotating_laser') {
      const pd = this.boss.patternData;
      if (pd && pd.currentAngle != null) {
        for (let b = 0; b < (pd.beamCount || 1); b++) {
          const beamAngle = pd.currentAngle + (b * Math.PI / (pd.beamCount || 1));
          const bx = bot.x - pd.x, by = bot.y - pd.y;
          const perpDist = Math.abs(Math.sin(beamAngle) * bx - Math.cos(beamAngle) * by);
          const dotProd = Math.cos(beamAngle) * bx + Math.sin(beamAngle) * by;
          if (perpDist < 80 && dotProd > 0) {
            const side = (Math.sin(beamAngle) * bx - Math.cos(beamAngle) * by) > 0 ? 1 : -1;
            bot.setInput(-Math.sin(beamAngle) * side, Math.cos(beamAngle) * side);
            dodging = true;
            break;
          }
        }
      }
    } else if (dangerType === 'wrath_of_ragnaros') {
      let nearestWall = null, nearestDist = Infinity;
      for (const w of [{ x: 425, y: 540 }, { x: 1575, y: 540 }, { x: 425, y: 1460 }, { x: 1575, y: 1460 }, { x: 275, y: 975 }, { x: 1725, y: 975 }]) {
        const d = Math.sqrt((bot.x - w.x) ** 2 + (bot.y - w.y) ** 2);
        if (d < nearestDist) { nearestDist = d; nearestWall = w; }
      }
      if (nearestWall && nearestDist > 60) {
        const wx = nearestWall.x - bot.x, wy = nearestWall.y - bot.y;
        const wd = Math.sqrt(wx * wx + wy * wy);
        bot.setInput(wx / wd, wy / wd);
        dodging = true;
      }
    } else if (dangerType === 'boss_charge') {
      const td = this.boss.telegraph?.data || this.boss.patternData;
      if (td && td.angle != null) {
        const bx = bot.x - (td.startX || this.boss.x), by = bot.y - (td.startY || this.boss.y);
        const perpDist = Math.abs(Math.sin(td.angle) * bx - Math.cos(td.angle) * by);
        const dotProd = Math.cos(td.angle) * bx + Math.sin(td.angle) * by;
        if (perpDist < 100 && dotProd > -50) {
          const side = (Math.sin(td.angle) * bx - Math.cos(td.angle) * by) > 0 ? 1 : -1;
          bot.setInput(-Math.sin(td.angle) * side, Math.cos(td.angle) * side);
          dodging = true;
        }
      }
    } else if (dangerType === 'meteor_rain') {
      const td = this.boss.telegraph?.data || this.boss.patternData;
      if (td?.meteors) {
        for (const m of td.meteors) {
          const md = Math.sqrt((bot.x - m.x) ** 2 + (bot.y - m.y) ** 2);
          if (md < m.radius + 30) {
            const awayX = bot.x - m.x, awayY = bot.y - m.y;
            const ad = Math.sqrt(awayX * awayX + awayY * awayY) || 1;
            bot.setInput(awayX / ad, awayY / ad);
            dodging = true;
            break;
          }
        }
      }
    }

    // Dodge lava tornados
    if (!dodging && this.boss.lavaTornados) {
      for (const t of this.boss.lavaTornados) {
        const td = Math.sqrt((bot.x - t.x) ** 2 + (bot.y - t.y) ** 2);
        if (td < t.radius + 60) {
          const awayX = bot.x - t.x, awayY = bot.y - t.y;
          const ad = Math.sqrt(awayX * awayX + awayY * awayY) || 1;
          bot.setInput(awayX / ad, awayY / ad);
          dodging = true;
          break;
        }
      }
    }

    // Dodge lava fissures
    if (!dodging && this.boss.lavaFissures) {
      for (const f of this.boss.lavaFissures) {
        const fd = Math.sqrt((bot.x - f.x) ** 2 + (bot.y - f.y) ** 2);
        if (fd < f.radius + 20) {
          const awayX = bot.x - f.x, awayY = bot.y - f.y;
          const ad = Math.sqrt(awayX * awayX + awayY * awayY) || 1;
          bot.setInput(awayX / ad, awayY / ad);
          dodging = true;
          break;
        }
      }
    }

    // Dodge mark
    if (!dodging && this.boss.mark) {
      const marked = playersArray.find(p => p.id === this.boss.mark.playerId && p.alive);
      if (marked && bot.id !== marked.id) {
        const md = Math.sqrt((bot.x - marked.x) ** 2 + (bot.y - marked.y) ** 2);
        if (md < this.boss.mark.radius + 40) {
          const awayX = bot.x - marked.x, awayY = bot.y - marked.y;
          const ad = Math.sqrt(awayX * awayX + awayY * awayY) || 1;
          bot.setInput(awayX / ad, awayY / ad);
          dodging = true;
        }
      }
    }

    // Dodge add explosions
    if (!dodging && this.boss.addExplosions) {
      for (const exp of this.boss.addExplosions) {
        if (exp.detonated) continue;
        const ed = Math.sqrt((bot.x - exp.x) ** 2 + (bot.y - exp.y) ** 2);
        if (ed < exp.radius + 30) {
          const awayX = bot.x - exp.x, awayY = bot.y - exp.y;
          const ad = Math.sqrt(awayX * awayX + awayY * awayY) || 1;
          bot.setInput(awayX / ad, awayY / ad);
          dodging = true;
          break;
        }
      }
    }

    // Soak circles
    if (!dodging && this.boss.soakCircles.length > 0 && bot.botRole === 'dps') {
      const botIdx = parseInt(bot.id.replace('bot_', ''));
      const unsoaked = this.boss.soakCircles.filter(c => !c.soaked);
      if (unsoaked.length > 0) {
        const assigned = unsoaked[botIdx % unsoaked.length];
        const sd = Math.sqrt((bot.x - assigned.x) ** 2 + (bot.y - assigned.y) ** 2);
        if (sd > 20) {
          const sx = assigned.x - bot.x, sy = assigned.y - bot.y;
          bot.setInput(sx / sd, sy / sd);
          dodging = true;
        }
      }
    }

    // Dash when dodging
    if (dodging && !bot.dashing && now > (bot.cooldowns.dash || 0) && bot.mana >= 50 && Math.random() < 0.3) {
      this.castSpell(bot, 'dash');
    }

    // ── CLASS-SPECIFIC BOT AI ──

    if (bot.botRole === 'healer') {
      // Healer: stay at range, heal allies, DPS when possible
      if (!dodging) {
        const idealDist = 450;
        if (distToBoss < idealDist - 50) bot.setInput(-dx / distToBoss, -dy / distToBoss);
        else if (distToBoss > idealDist + 80) bot.setInput(dx / distToBoss, dy / distToBoss);
        else bot.setInput(-dy / distToBoss * 0.3, dx / distToBoss * 0.3);
      }

      // Heal zone (RMB) on lowest ally
      let lowestAlly = null, lowestPct = 1;
      for (const p of playersArray) {
        if (!p.alive || p.id === bot.id) continue;
        const pct = p.hp / p.maxHp;
        if (pct < lowestPct) { lowestPct = pct; lowestAlly = p; }
      }
      if (lowestAlly && lowestPct < 0.7 && now > (bot.cooldowns.secondary || 0)) {
        this.castSpell(bot, 'secondary', lowestAlly.x, lowestAlly.y);
      }

      // AoE heal (A) when multiple allies low
      const lowAllies = playersArray.filter(p => p.alive && p.id !== bot.id && p.hp / p.maxHp < 0.6).length;
      if (lowAllies >= 2 && now > (bot.cooldowns.skillA || 0)) {
        this.castSpell(bot, 'skillA', bot.x, bot.y);
      }

      // Cleanse (E) occasionally
      if (now > (bot.cooldowns.skillB || 0) && Math.random() < 0.1) {
        this.castSpell(bot, 'skillB', bot.x, bot.y);
      }

      // Ultimate (R) — ice AoE
      if (this.boss.alive && now > (bot.cooldowns.ultimate || 0) && bot.mana >= 180 && Math.random() < 0.4) {
        this.castSpell(bot, 'ultimate', this.boss.x, this.boss.y);
      }

      // Basic attack
      if (now > (bot.cooldowns.basic || 0) && this.boss.alive && Math.random() > 0.2) {
        const spread = 80;
        this.castSpell(bot, 'basic', this.boss.x + (Math.random() - 0.5) * spread, this.boss.y + (Math.random() - 0.5) * spread);
      }

    } else if (bot.botRole === 'tank') {
      // Tank: stay close, taunt, block big hits, shield allies
      if (!dodging) {
        const idealDist = 90;
        if (distToBoss < idealDist - 20) bot.setInput(-dx / distToBoss, -dy / distToBoss);
        else if (distToBoss > idealDist + 30) bot.setInput(dx / distToBoss, dy / distToBoss);
        else bot.setInput(-dy / distToBoss * 0.3, dx / distToBoss * 0.3);
      }

      // Taunt (A) to grab aggro
      if (now > (bot.cooldowns.skillA || 0) && Math.random() < 0.5) {
        this.castSpell(bot, 'skillA');
      }

      // Party shield (E) when allies are in danger
      if (now > (bot.cooldowns.skillB || 0) && dangerType && Math.random() < 0.4) {
        this.castSpell(bot, 'skillB');
      }

      // Block (RMB) during dangerous attacks — toggle on/off
      if (dangerType && !bot.blocking && distToBoss < 300 && bot.mana > 100) {
        bot.blocking = true;
      } else if (!dangerType && bot.blocking) {
        bot.blocking = false;
      }

      // Fortify (R) during wrath/big attacks
      if (now > (bot.cooldowns.ultimate || 0) && bot.mana >= 120 && dangerType === 'wrath_of_ragnaros') {
        this.castSpell(bot, 'ultimate');
      }

      // Basic attack
      if (now > (bot.cooldowns.basic || 0) && this.boss.alive && distToBoss < 150) {
        this.castSpell(bot, 'basic', this.boss.x, this.boss.y);
      }

    } else {
      // DPS bots (archer, warrior, berserker)
      const atkTarget = targetAdd || (this.boss.alive ? this.boss : null);

      if (!dodging) {
        if (targetAdd) {
          const ax = targetAdd.x - bot.x, ay = targetAdd.y - bot.y;
          const ad = Math.sqrt(ax * ax + ay * ay);
          const meleeRange = isMelee ? 80 : 300;
          if (ad > meleeRange) bot.setInput(ax / ad, ay / ad);
          else bot.setInput(-ay / ad * 0.3, ax / ad * 0.3);
        } else {
          const idealDist = isMelee ? 100 : 450;
          const tolerance = isMelee ? 30 : 60;
          if (distToBoss < idealDist - tolerance) bot.setInput(-dx / distToBoss, -dy / distToBoss);
          else if (distToBoss > idealDist + tolerance) bot.setInput(dx / distToBoss, dy / distToBoss);
          else {
            const strafeDir = bot.id.includes('1') || bot.id.includes('3') ? 1 : -1;
            const strafeSpeed = isMelee ? 0.5 : 0.4;
            bot.setInput(-dy / distToBoss * strafeSpeed * strafeDir, dx / distToBoss * strafeSpeed * strafeDir);
          }
        }
      }

      // Basic attack (LMB)
      if (atkTarget && now > (bot.cooldowns.basic || 0)) {
        const tDist = Math.sqrt((atkTarget.x - bot.x) ** 2 + (atkTarget.y - bot.y) ** 2);
        if (isMelee ? tDist < 150 : true) {
          const spread = isMelee ? 30 : 80;
          if (Math.random() > (isMelee ? 0.15 : 0.25)) {
            this.castSpell(bot, 'basic', atkTarget.x + (Math.random() - 0.5) * spread, atkTarget.y + (Math.random() - 0.5) * spread);
          }
        }
      }

      // Class-specific skill usage
      if (atkTarget) {
        const tDist = Math.sqrt((atkTarget.x - bot.x) ** 2 + (atkTarget.y - bot.y) ** 2);

        // Secondary (RMB)
        if (now > (bot.cooldowns.secondary || 0) && Math.random() < 0.3) {
          if (bot.playerClass === 'berserker') {
            // Berserker block when danger
            if (dangerType && !bot.blocking && bot.mana > 50) bot.blocking = true;
            else if (!dangerType && bot.blocking) bot.blocking = false;
          } else {
            this.castSpell(bot, 'secondary', atkTarget.x, atkTarget.y);
          }
        }

        // Skill A
        if (now > (bot.cooldowns.skillA || 0) && Math.random() < 0.4) {
          if (bot.playerClass === 'berserker') {
            // Rage buff
            this.castSpell(bot, 'skillA');
          } else if (bot.playerClass === 'warrior') {
            // Blade storm — melee AoE
            if (tDist < 200) this.castSpell(bot, 'skillA', bot.x, bot.y);
          } else if (bot.playerClass === 'archer' || bot.playerClass === 'mage') {
            // Arrow rain / Explosion arcanique
            this.castSpell(bot, 'skillA', atkTarget.x, atkTarget.y);
          }
        }

        // Skill B
        if (now > (bot.cooldowns.skillB || 0) && Math.random() < 0.3) {
          if (bot.playerClass === 'berserker' && !bot.charging) {
            // Start charge, release after random time
            this.castSpell(bot, 'skillB');
            setTimeout(() => {
              if (bot.alive && bot.charging) {
                this.castSpell(bot, 'skillB_release', atkTarget.x || this.boss?.x, atkTarget.y || this.boss?.y);
              }
            }, 1500 + Math.random() * 2500);
          } else if (bot.playerClass === 'warrior') {
            // Dash attack
            if (tDist < 300) this.castSpell(bot, 'skillB', atkTarget.x, atkTarget.y);
          } else if (bot.playerClass === 'archer') {
            // Trap
            this.castSpell(bot, 'skillB', atkTarget.x, atkTarget.y);
          } else if (bot.playerClass === 'mage') {
            // Teleport (dash_attack)
            if (tDist < 400) this.castSpell(bot, 'skillB', atkTarget.x, atkTarget.y);
          }
        }

        // Ultimate (R)
        if (now > (bot.cooldowns.ultimate || 0) && bot.mana >= (skills?.ultimate?.manaCost || 100) && Math.random() < 0.5) {
          this.castSpell(bot, 'ultimate', atkTarget.x, atkTarget.y);
        }
      }
    }
  }

  start() {
    if (this.status === 'fighting') return;
    for (const [id] of this.players) {
      if (id.startsWith('bot_')) this.players.delete(id);
    }

    this.boss = new Boss();
    this.status = 'fighting';
    this.lastTick = Date.now();
    this.tickCount = 0;
    this.projectiles = [];
    this.lasers = [];
    this.effects = [];
    this.traps = [];
    this.dpsTracker = new Map();
    this.fightStart = Date.now();

    this.spawnBots();

    for (const p of this.players.values()) {
      if (!p.isBot) {
        p.x = GAME.PLAYER_SPAWN.x + (Math.random() - 0.5) * 100;
        p.y = GAME.PLAYER_SPAWN.y + (Math.random() - 0.5) * 60;
      }
      p.hp = p.maxHp;
      p.mana = p.useRage ? 0 : p.maxMana;
      p.alive = true;
      p.shieldActive = false;
      p.blocking = false;
      p.charging = false;
      p.channeling = false;
      p.channelData = null;
    }

    this.broadcast({ type: 'fight_start', boss: this.boss.toState() });
    this.tickInterval = setInterval(() => this.tick(), GAME.TICK_MS);
    console.log(`[GameEngine] Fight started with ${this.players.size} players (${[...this.players.values()].filter(p => p.isBot).length} bots)`);
  }

  stop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    this.broadcast({
      type: 'fight_end',
      result: this.status,
      boss: this.boss?.toState() || null,
    });
    console.log(`[GameEngine] Fight ended: ${this.status}`);
  }

  tick() {
    const now = Date.now();
    const dt = (now - this.lastTick) / 1000;
    this.lastTick = now;
    this.tickCount++;

    const playersArray = [...this.players.values()];

    // Update bot AI
    for (const p of playersArray) {
      if (p.isBot) this.updateBotAI(p, now, playersArray);
    }

    // Update rage meters
    for (const p of playersArray) {
      if (!p.alive) continue;
      let r = this.rageMeter.get(p.id);
      if (!r) { r = { rage: 0, lastHitTime: 0 }; this.rageMeter.set(p.id, r); }
      if (now - r.lastHitTime > 2000) {
        r.rage = Math.min(100, r.rage + this.RAGE_GAIN_PER_SEC * dt);
      }
    }

    // Update players
    for (const p of playersArray) {
      p.update(dt, now);

      // Process channel ticks (archer barrage)
      if (p.channeling && p.channelData && p.channelData.tickReady) {
        p.channelData.tickReady = false;
        // Fire a projectile in aim direction
        const target = this.boss && this.boss.alive ? this.boss : null;
        if (target) {
          const cdx = target.x - p.x + (Math.random() - 0.5) * 60;
          const cdy = target.y - p.y + (Math.random() - 0.5) * 60;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy) || 1;
          const isCrit = Math.random() < p.critRate;
          const baseDmg = Math.floor(p.getAtk() * p.channelData.dmgMult);
          const damage = isCrit ? Math.floor(baseDmg * p.critDmg) : baseDmg;
          this.projectiles.push({
            x: p.x, y: p.y,
            vx: (cdx / cdist) * 800, vy: (cdy / cdist) * 800,
            damage, radius: 10,
            owner: p.id, spell: 'ultimate',
            life: (p.channelData.range || 550) / 800,
            color: isCrit ? '#ffd700' : '#4ade80', crit: isCrit,
          });
        }
      }
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.life -= dt;
      let hit = false;

      if (this.boss && this.boss.alive) {
        const ddx = proj.x - this.boss.x, ddy = proj.y - this.boss.y;
        if (ddx * ddx + ddy * ddy < (proj.radius + this.boss.radius) ** 2) {
          const rageMult = this.getRageMult(proj.owner);
          const comboMult = this.getComboMult(proj.owner, proj.spell);
          const finalDmg = Math.floor(proj.damage * rageMult * comboMult);
          this.boss.takeDamage(finalDmg, proj.owner, proj.crit);
          this.trackDps(proj.owner, finalDmg);
          this.effects.push({ type: 'hit', x: proj.x, y: proj.y, spell: proj.spell, endTime: now + 200 });
          if (!proj.piercing) hit = true;
        }
      }

      if (!hit && this.boss) {
        for (const add of this.boss.adds) {
          if (!add.alive) continue;
          const ddx = proj.x - add.x, ddy = proj.y - add.y;
          if (ddx * ddx + ddy * ddy < (proj.radius + add.radius) ** 2) {
            this.boss.damageAdd(add.id, proj.damage, proj.crit, proj.owner);
            this.trackDps(proj.owner, proj.damage);
            this.effects.push({ type: 'hit', x: proj.x, y: proj.y, spell: proj.spell, endTime: now + 200 });
            if (!proj.piercing) hit = true;
            break;
          }
        }
      }

      if (hit || proj.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }

    // Clean expired lasers
    this.lasers = this.lasers.filter(l => now < l.endTime);

    // Process traps — trigger when boss/add walks over
    for (let i = this.traps.length - 1; i >= 0; i--) {
      const trap = this.traps[i];
      if (now >= trap.endTime) { this.traps.splice(i, 1); continue; }
      if (trap.triggered) continue;

      // Check boss
      if (this.boss && this.boss.alive) {
        const ddx = this.boss.x - trap.x, ddy = this.boss.y - trap.y;
        if (ddx * ddx + ddy * ddy < (trap.radius + this.boss.radius) ** 2) {
          trap.triggered = true;
          const rageMult = this.getRageMult(trap.owner);
          const finalDmg = Math.floor(trap.damage * rageMult);
          this.boss.takeDamage(finalDmg, trap.owner, trap.crit);
          this.trackDps(trap.owner, finalDmg);
          this.effects.push({ type: 'trap_explode', x: trap.x, y: trap.y, radius: trap.radius, endTime: now + 500 });
          this.traps.splice(i, 1);
          continue;
        }
      }
      // Check adds
      if (this.boss) {
        for (const add of this.boss.adds) {
          if (!add.alive) continue;
          const ddx = add.x - trap.x, ddy = add.y - trap.y;
          if (ddx * ddx + ddy * ddy < (trap.radius + add.radius) ** 2) {
            trap.triggered = true;
            this.boss.damageAdd(add.id, trap.damage, trap.crit, trap.owner);
            this.trackDps(trap.owner, trap.damage);
            this.effects.push({ type: 'trap_explode', x: trap.x, y: trap.y, radius: trap.radius, endTime: now + 500 });
            this.traps.splice(i, 1);
            break;
          }
        }
      }
    }

    // Process heal zones
    for (const e of this.effects) {
      if (e.type === 'heal_zone' && now - e.lastTick >= (e.tickRate || 500)) {
        e.lastTick = now;
        for (const p of playersArray) {
          if (!p.alive) continue;
          const ddx = p.x - e.x, ddy = p.y - e.y;
          if (ddx * ddx + ddy * ddy < (e.radius || 80) * (e.radius || 80)) {
            const healed = p.heal(e.healPerTick || 2000);
            if (healed > 0 && this.boss) this.boss.addDamageEvent(p.x, p.y - 20, healed, 'heal');
          }
        }
      }
    }

    // Process AOE zones
    const AOE_TYPES = ['ice_aoe', 'arrow_rain', 'whirlwind', 'ground_slam'];
    for (const e of this.effects) {
      if (AOE_TYPES.includes(e.type) && now - e.lastTick >= e.tickRate) {
        e.lastTick = now;
        if (this.boss && this.boss.alive) {
          const ddx = this.boss.x - e.x, ddy = this.boss.y - e.y;
          if (ddx * ddx + ddy * ddy < (e.radius + this.boss.radius) ** 2) {
            const rageMult = this.getRageMult(e.owner);
            const comboMult = this.getComboMult(e.owner, e.spell);
            const finalDmg = Math.floor(e.damage * rageMult * comboMult);
            this.boss.takeDamage(finalDmg, e.owner, e.crit);
            this.trackDps(e.owner, finalDmg);
          }
        }
        if (this.boss) {
          for (const add of this.boss.adds) {
            if (!add.alive) continue;
            const ddx = add.x - e.x, ddy = add.y - e.y;
            if (ddx * ddx + ddy * ddy < (e.radius + add.radius) ** 2) {
              this.boss.damageAdd(add.id, e.damage, e.crit, e.owner);
              this.trackDps(e.owner, e.damage);
            }
          }
        }
        if (e.healPerTick > 0) {
          for (const p of playersArray) {
            if (!p.alive) continue;
            const ddx = p.x - e.x, ddy = p.y - e.y;
            if (ddx * ddx + ddy * ddy < e.radius * e.radius) {
              const healed = p.heal(e.healPerTick);
              if (healed > 0 && this.boss) this.boss.addDamageEvent(p.x, p.y - 20, healed, 'heal');
            }
          }
        }
      }
    }

    // Clean expired effects
    this.effects = this.effects.filter(e => now < e.endTime);

    // Update boss
    if (this.boss && this.boss.alive) {
      this.boss.update(now, playersArray);
      for (const e of this.boss.damageEvents) {
        if (e.target && (e.type === 'boss_hit' || e.type === 'boss_crit' || e.type === 'fire' || e.type === 'add_hit')) {
          this.onPlayerHit(e.target);
        }
      }
    }

    // Check victory
    if (this.boss && !this.boss.alive) {
      this.status = 'victory';
      this.stop();
      return;
    }

    // Check defeat
    const alive = playersArray.filter(p => p.alive);
    if (alive.length === 0 && this.status === 'fighting') {
      this.status = 'defeat';
      this.stop();
      return;
    }

    // Broadcast state (10Hz)
    if (this.tickCount % 2 === 0) {
      this.broadcast({
        type: 'state',
        tick: this.tickCount,
        players: playersArray.map(p => p.toState()),
        boss: this.boss ? this.boss.toState() : null,
        projectiles: this.projectiles.map(p => ({
          x: Math.round(p.x), y: Math.round(p.y),
          spell: p.spell, radius: p.radius, color: p.color, owner: p.owner,
        })),
        lasers: this.lasers.map(l => ({
          x: Math.round(l.x), y: Math.round(l.y),
          angle: l.angle, width: l.width, range: l.range,
          spell: l.spell, color: l.color,
        })),
        effects: this.effects.map(e => ({
          type: e.type, x: e.x, y: e.y,
          radius: e.radius, spell: e.spell, playerId: e.playerId,
          owner: e.owner, color: e.color,
          angle: e.angle, range: e.range, coneAngle: e.coneAngle,
          chargeLevel: e.chargeLevel,
          endTime: e.endTime,
        })),
        traps: this.traps.map(t => ({
          x: Math.round(t.x), y: Math.round(t.y),
          radius: t.radius, owner: t.owner,
        })),
        dpsRanking: this.getDpsRanking(),
        aggroRanking: this.getAggroRanking(),
        fightTime: Math.floor((Date.now() - this.fightStart) / 1000),
        rageMeters: Object.fromEntries([...this.rageMeter].map(([id, r]) => [id, Math.floor(r.rage)])),
      });
    }
  }

  trackDps(playerId, damage) {
    if (!this.dpsTracker.has(playerId)) {
      this.dpsTracker.set(playerId, 0);
    }
    this.dpsTracker.set(playerId, this.dpsTracker.get(playerId) + damage);
  }

  getDpsRanking() {
    const elapsed = Math.max(1, (Date.now() - this.fightStart) / 1000);
    const ranking = [];
    for (const [id, total] of this.dpsTracker) {
      const player = this.players.get(id);
      if (!player) continue;
      ranking.push({
        id, name: player.username, isBot: player.isBot,
        total, dps: Math.floor(total / elapsed),
      });
    }
    ranking.sort((a, b) => b.total - a.total);
    return ranking.slice(0, 8);
  }

  getAggroRanking() {
    if (!this.boss) return [];
    const ranking = [];
    for (const [id, aggro] of this.boss.aggroMap) {
      const player = this.players.get(id);
      if (!player) continue;
      ranking.push({ id, name: player.username, isBot: player.isBot, aggro });
    }
    ranking.sort((a, b) => b.aggro - a.aggro);
    return ranking.slice(0, 8);
  }

  getComboMult(playerId, spell) {
    const player = this.players.get(playerId);
    if (!player) return 1;
    const now = Date.now();
    if (player.comboSpell && player.comboSpell !== spell && now - player.lastComboHit < 1500) {
      player.comboCount = Math.min(5, player.comboCount + 1);
    } else if (player.comboSpell === spell) {
      player.comboCount = 1;
    } else {
      player.comboCount = 1;
    }
    player.comboSpell = spell;
    player.lastComboHit = now;
    const bonuses = [1, 1, 1.1, 1.2, 1.3, 1.5];
    return bonuses[player.comboCount] || 1;
  }

  getRageMult(playerId) {
    const r = this.rageMeter.get(playerId);
    if (!r) return 1;
    return 1 + (r.rage / 100) * (this.RAGE_MAX_MULT - 1);
  }

  onPlayerHit(playerId) {
    const r = this.rageMeter.get(playerId);
    if (r) { r.rage = 0; r.lastHitTime = Date.now(); }
  }

  getStatus() {
    return {
      status: this.status,
      players: this.players.size,
      boss: this.boss ? { hp: this.boss.hp, maxHp: this.boss.maxHp, phase: this.boss.phase } : null,
    };
  }
}
