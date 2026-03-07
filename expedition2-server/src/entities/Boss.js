// -- Ragnaros Boss Entity (server-side) --
// Full mechanics: telegraphs, adds, charge, shield, mark, soak, heal cast, fissures, tornado

import { GAME } from '../config.js';

const PILLAR_CENTERS = [
  { x: 425, y: 540 }, { x: 1575, y: 540 },
  { x: 425, y: 1460 }, { x: 1575, y: 1460 },
  { x: 275, y: 975 }, { x: 1725, y: 975 },
];

const BOSS_QUOTES = {
  phase2: 'INSECTES ! VOUS OSEZ PENETRER DANS MON DOMAINE ?!',
  phase3: 'PAR LE FEU, SOYEZ PURIFIES !',
  enrage: 'TROP TARD ! LE FEU VOUS CONSUMERA TOUS !',
  hammer: 'GOUTER A SULFURAS !',
  wrath: 'VOUS NE POUVEZ PAS VOUS CACHER !',
  adds: 'SERVITEURS ! LEVEZ-VOUS !',
  fire_wave: 'QUE LE FEU DEVORE CE MONDE !',
  laser: 'BRULEZ !',
  meteor: 'LE CIEL VOUS TOMBE DESSUS !',
  charge: 'VOUS NE M\'ECHAPPEREZ PAS !',
  shield: 'VOUS NE PERCEREZ JAMAIS MA CARAPACE !',
  mark: 'TOI ! TU BRULERAS POUR LES AUTRES !',
  heal_cast: 'LA FLAMME ME GUERIT... VOUS NE POUVEZ RIEN FAIRE !',
  soak: 'QUE LA TERRE S\'OUVRE SOUS VOS PIEDS !',
  tornado: 'QUE LE TOURBILLON DE FEU VOUS DEVORE !',
  fissure: 'LE SOL SE FISSURE... VOTRE TERRAIN RETRECIT !',
};

export class Boss {
  constructor() {
    this.x = GAME.BOSS_SPAWN.x;
    this.y = GAME.BOSS_SPAWN.y;
    this.radius = GAME.BOSS_RADIUS;

    this.hp = 20_000_000;
    this.maxHp = 20_000_000;
    this.atk = 1200;
    this.alive = true;
    this.phase = 1;

    // Facing / aggro
    this.facingAngle = Math.PI / 2;
    this.aggroTarget = null;
    this.aggroMap = new Map();

    // Movement
    this.baseX = GAME.BOSS_SPAWN.x;
    this.baseY = GAME.BOSS_SPAWN.y;
    this.moveSpeed = 60;
    this.charging = false;
    this.chargeEnd = 0;

    // Enrage
    this.enraged = false;
    this.enrageTimer = 180_000;
    this.fightStart = 0;

    // Attack cooldowns
    this.lastAttack = 0;
    this.attackCooldown = 2200;

    // Pattern state
    this.activePattern = null;
    this.patternEnd = 0;
    this.patternData = null;

    // Telegraph
    this.telegraph = null;
    this.telegraphEnd = 0;
    this.pendingAttack = null;

    // Fire patches
    this.firePatches = [];

    // Submerge
    this.submerged = false;
    this.submergeEnd = 0;

    // Adds
    this.adds = [];
    this.addIdCounter = 0;
    this.addExplosions = []; // {x, y, radius, endTime, detonateTime, dmg}

    // Rotating laser
    this.laserAngle = 0;

    // Damage events
    this.damageEvents = [];
    this.dmgEventId = 0;

    // Quotes
    this.currentQuote = null;
    this.quoteEnd = 0;

    // === NEW MECHANICS ===

    // Shield phase — periodic DPS check
    this.shield = null; // { hp, maxHp, endTime }
    this.lastShieldTime = 0;
    this.shieldCooldown = 35_000; // every 35s

    // Heal cast — interruptible by damage
    this.healCast = null; // { startTime, duration, dmgRequired, dmgReceived, healAmount }

    // Player mark — explosion around marked player
    this.mark = null; // { playerId, endTime, radius }

    // Soak circles — must be stood in
    this.soakCircles = []; // { x, y, radius, endTime, soaked }

    // Lava fissures — permanent arena shrink
    this.lavaFissures = []; // { x, y, radius }
    this.lastFissureTime = 0;
    this.fissureCooldown = 45_000; // every 45s

    // Lava tornados — moving hazards
    this.lavaTornados = []; // { x, y, angle, speed, radius, endTime, lastDmgTick }
    this.lastTornadoTime = 0;
    this.tornadoCooldown = 25_000;
  }

  say(key) {
    this.currentQuote = BOSS_QUOTES[key] || key;
    this.quoteEnd = Date.now() + 3000;
  }

  addDamageEvent(x, y, amount, type = 'damage', extra = {}) {
    this.damageEvents.push({ x, y, amount, type, id: this.dmgEventId++, ...extra });
  }

  updateAggro(playerId, damage) {
    const cur = this.aggroMap.get(playerId) || 0;
    this.aggroMap.set(playerId, cur + damage);
  }

  getAggroTarget(players) {
    let maxAggro = 0, target = null;
    for (const [id, aggro] of this.aggroMap) {
      const p = players.find(pp => pp.id === id && pp.alive);
      if (p && aggro > maxAggro) { maxAggro = aggro; target = p; }
    }
    return target;
  }

  update(now, players) {
    if (!this.alive) return;
    if (this.fightStart === 0) this.fightStart = now;

    // Quote expiry
    if (this.currentQuote && now >= this.quoteEnd) this.currentQuote = null;

    // Enrage check
    if (!this.enraged && now - this.fightStart >= this.enrageTimer) {
      this.enraged = true;
      this.atk = Math.floor(this.atk * 2.5);
      this.attackCooldown = 800;
      this.say('enrage');
    }

    // Remove expired fire patches
    this.firePatches = this.firePatches.filter(p => now < p.endTime);

    // Fire patches damage
    for (const patch of this.firePatches) {
      if (!patch.lastTick || now - patch.lastTick >= 500) {
        patch.lastTick = now;
        for (const p of players) {
          if (!p.alive) continue;
          const dx = p.x - patch.x, dy = p.y - patch.y;
          if (dx * dx + dy * dy < patch.radius * patch.radius) {
            p.takeDamage(80, 'fire_patch');
            this.addDamageEvent(p.x, p.y - 20, 80, 'fire', { target: p.id });
          }
        }
      }
    }

    // Update adds
    this.updateAdds(now, players);

    // Update add explosions
    this.updateAddExplosions(now, players);

    // Update lava fissures damage
    this.updateFissures(now, players);

    // Update lava tornados
    this.updateTornados(now, players);

    // Update shield
    this.updateShield(now, players);

    // Update heal cast
    this.updateHealCast(now);

    // Update mark
    this.updateMark(now, players);

    // Update soak circles
    this.updateSoakCircles(now, players);

    // Submerge
    if (this.submerged) {
      if (now >= this.submergeEnd) {
        this.submerged = false;
        this.spawnAdds(now, this.phase >= 3 ? 4 : 2);
        this.say('adds');
      }
      return;
    }

    // Phase transitions
    const hpPct = this.hp / this.maxHp;
    if (hpPct <= 0.3 && this.phase < 3) {
      this.phase = 3;
      this.attackCooldown = 1400;
      this.submerged = true;
      this.submergeEnd = now + 4000;
      this.spawnAdds(now, 3);
      this.say('phase3');
      // Spawn fissures on phase change
      this.spawnFissure(now);
      this.spawnTornado(now);
    } else if (hpPct <= 0.6 && this.phase < 2) {
      this.phase = 2;
      this.attackCooldown = 1800;
      this.submerged = true;
      this.submergeEnd = now + 5000;
      this.spawnAdds(now, 2);
      this.say('phase2');
      this.spawnFissure(now);
    }

    // Periodic mechanics
    if (now - this.lastShieldTime >= this.shieldCooldown && !this.shield && this.phase >= 2) {
      this.activateShield(now);
    }
    if (now - this.lastFissureTime >= this.fissureCooldown && this.phase >= 2) {
      this.spawnFissure(now);
    }
    if (now - this.lastTornadoTime >= this.tornadoCooldown && this.phase >= 2) {
      this.spawnTornado(now);
    }

    // Face aggro target
    const aggroTarget = this.getAggroTarget(players);
    if (aggroTarget) {
      this.aggroTarget = aggroTarget.id;
      const dx = aggroTarget.x - this.x, dy = aggroTarget.y - this.y;
      const targetAngle = Math.atan2(dy, dx);
      let diff = targetAngle - this.facingAngle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.facingAngle += diff * 0.08;
    }

    // Boss movement
    if (this.activePattern === 'boss_charge') {
      // handled in updateActivePattern
    } else if (aggroTarget && !this.activePattern) {
      const dx = aggroTarget.x - this.x, dy = aggroTarget.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const distFromCenter = Math.sqrt((this.x - this.baseX) ** 2 + (this.y - this.baseY) ** 2);
      const moveMultiplier = this.enraged ? 0.12 : 0.06;
      if (dist > 250 && distFromCenter < 250) {
        this.x += (dx / dist) * this.moveSpeed * moveMultiplier;
        this.y += (dy / dist) * this.moveSpeed * moveMultiplier;
      } else if (distFromCenter > 200) {
        const cx = this.baseX - this.x, cy = this.baseY - this.y;
        const cd = Math.sqrt(cx * cx + cy * cy);
        this.x += (cx / cd) * this.moveSpeed * 0.08;
        this.y += (cy / cd) * this.moveSpeed * 0.08;
      }
    } else if (!this.activePattern) {
      const distFromCenter = Math.sqrt((this.x - this.baseX) ** 2 + (this.y - this.baseY) ** 2);
      if (distFromCenter > 200) {
        const cx = this.baseX - this.x, cy = this.baseY - this.y;
        const cd = Math.sqrt(cx * cx + cy * cy);
        this.x += (cx / cd) * this.moveSpeed * 0.08;
        this.y += (cy / cd) * this.moveSpeed * 0.08;
      }
    }

    // Telegraph -> attack
    if (this.telegraph && now >= this.telegraphEnd) {
      this.executeTelegraphedAttack(now, players);
      this.telegraph = null;
    }

    // Start new attack
    if (now - this.lastAttack >= this.attackCooldown && !this.activePattern && !this.telegraph && !this.healCast) {
      this.startAttack(now, players);
    }

    // Update active patterns
    this.updateActivePattern(now, players);

    // Pattern expiry
    if (this.activePattern && now >= this.patternEnd) {
      this.activePattern = null;
      this.patternData = null;
    }
  }

  // === SHIELD PHASE ===
  activateShield(now) {
    const shieldHp = this.phase >= 3 ? 3_000_000 : 2_000_000;
    this.shield = { hp: shieldHp, maxHp: shieldHp, endTime: now + 10_000 };
    this.lastShieldTime = now;
    this.say('shield');
  }

  updateShield(now) {
    if (!this.shield) return;
    if (this.shield.hp <= 0) {
      // Shield broken! Boss stunned briefly
      this.shield = null;
      this.lastAttack = now; // reset attack timer (brief stun)
      return;
    }
    if (now >= this.shield.endTime) {
      // Shield not broken in time — boss heals 15%
      const healAmt = Math.floor(this.maxHp * 0.15);
      this.hp = Math.min(this.maxHp, this.hp + healAmt);
      this.addDamageEvent(this.x, this.y - 100, healAmt, 'boss_heal');
      this.shield = null;
    }
  }

  // === HEAL CAST ===
  startHealCast(now) {
    const healAmount = Math.floor(this.maxHp * 0.1);
    const dmgRequired = this.phase >= 3 ? 2_500_000 : 1_500_000;
    this.healCast = {
      startTime: now, duration: 5000,
      dmgRequired, dmgReceived: 0,
      healAmount,
    };
    this.say('heal_cast');
  }

  updateHealCast(now) {
    if (!this.healCast) return;
    const hc = this.healCast;
    if (hc.dmgReceived >= hc.dmgRequired) {
      // Interrupted!
      this.healCast = null;
      this.addDamageEvent(this.x, this.y - 80, 0, 'interrupt');
      return;
    }
    if (now >= hc.startTime + hc.duration) {
      // Cast completed — boss heals
      this.hp = Math.min(this.maxHp, this.hp + hc.healAmount);
      this.addDamageEvent(this.x, this.y - 100, hc.healAmount, 'boss_heal');
      this.healCast = null;
    }
  }

  // === PLAYER MARK ===
  applyMark(now, players) {
    const alivePlayers = players.filter(p => p.alive);
    if (alivePlayers.length === 0) return;
    const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
    this.mark = {
      playerId: target.id,
      endTime: now + 5000,
      radius: 120,
    };
    this.say('mark');
  }

  updateMark(now, players) {
    if (!this.mark) return;
    if (now >= this.mark.endTime) {
      // BOOM — AoE explosion around marked player
      const marked = players.find(p => p.id === this.mark.playerId);
      if (marked && marked.alive) {
        for (const p of players) {
          if (!p.alive) continue;
          const dx = p.x - marked.x, dy = p.y - marked.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < this.mark.radius) {
            // More damage the closer they are
            const dmgMult = p.id === marked.id ? 0.5 : 2.0; // marked player takes less, nearby take MORE
            const dmg = Math.floor(this.atk * dmgMult);
            p.takeDamage(dmg, 'mark_explosion');
            this.addDamageEvent(p.x, p.y - 20, dmg, 'boss_crit', { target: p.id });
          }
        }
        // Leave fire patch
        this.firePatches.push({ x: marked.x, y: marked.y, radius: 60, endTime: now + 8000 });
      }
      this.mark = null;
    }
  }

  // === SOAK CIRCLES ===
  spawnSoakCircles(now, players) {
    const count = this.phase >= 3 ? 3 : 2;
    this.soakCircles = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 250 + Math.random() * 150; // closer to boss so bots can reach in time
      this.soakCircles.push({
        x: this.x + Math.cos(angle) * dist,
        y: this.y + Math.sin(angle) * dist,
        radius: 70, // larger soak zone (was 50)
        endTime: now + 8000, // 8s to soak (was 6s)
        soaked: false,
      });
    }
    this.say('soak');
  }

  updateSoakCircles(now, players) {
    if (this.soakCircles.length === 0) return;
    const alivePlayers = players.filter(p => p.alive);

    for (const circle of this.soakCircles) {
      if (circle.soaked || now < circle.endTime) {
        // Check if someone is standing in it
        for (const p of alivePlayers) {
          const dx = p.x - circle.x, dy = p.y - circle.y;
          if (dx * dx + dy * dy < circle.radius * circle.radius) {
            circle.soaked = true;
            break;
          }
        }
      }
    }

    // Check expired circles
    const expired = this.soakCircles.filter(c => now >= c.endTime);
    for (const circle of expired) {
      if (!circle.soaked) {
        // Nobody soaked — raid-wide damage!
        for (const p of alivePlayers) {
          const dmg = Math.floor(this.atk * 1.5);
          p.takeDamage(dmg, 'soak_fail');
          this.addDamageEvent(p.x, p.y - 20, dmg, 'boss_hit', { target: p.id });
        }
      }
    }
    this.soakCircles = this.soakCircles.filter(c => now < c.endTime);
  }

  // === LAVA FISSURES ===
  spawnFissure(now) {
    this.lastFissureTime = now;
    const count = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 300 + Math.random() * 400;
      this.lavaFissures.push({
        x: this.baseX + Math.cos(angle) * dist,
        y: this.baseY + Math.sin(angle) * dist,
        radius: 50 + Math.random() * 30,
      });
    }
    if (this.lavaFissures.length > 1) this.say('fissure');
  }

  updateFissures(now, players) {
    for (const f of this.lavaFissures) {
      if (!f.lastTick || now - f.lastTick >= 600) {
        f.lastTick = now;
        for (const p of players) {
          if (!p.alive) continue;
          const dx = p.x - f.x, dy = p.y - f.y;
          if (dx * dx + dy * dy < f.radius * f.radius) {
            p.takeDamage(120, 'fissure');
            this.addDamageEvent(p.x, p.y - 20, 120, 'fire', { target: p.id });
          }
        }
      }
    }
  }

  // === LAVA TORNADOS ===
  spawnTornado(now) {
    this.lastTornadoTime = now;
    const angle = Math.random() * Math.PI * 2;
    const dist = 400 + Math.random() * 200;
    this.lavaTornados.push({
      x: this.baseX + Math.cos(angle) * dist,
      y: this.baseY + Math.sin(angle) * dist,
      angle: Math.random() * Math.PI * 2,
      speed: 80 + Math.random() * 40,
      radius: 45,
      endTime: now + 20_000,
      lastDmgTick: now,
      orbitAngle: angle,
      orbitRadius: dist,
      orbitSpeed: 0.3 + Math.random() * 0.2,
    });
    if (this.lavaTornados.length === 1) this.say('tornado');
  }

  updateTornados(now, players) {
    for (const t of this.lavaTornados) {
      // Move in orbit around boss center
      const elapsed = (now - (t.endTime - 20_000)) / 1000;
      t.orbitAngle += t.orbitSpeed * 0.05;
      t.x = this.baseX + Math.cos(t.orbitAngle) * t.orbitRadius;
      t.y = this.baseY + Math.sin(t.orbitAngle) * t.orbitRadius;

      // Damage players
      if (now - t.lastDmgTick >= 400) {
        t.lastDmgTick = now;
        for (const p of players) {
          if (!p.alive) continue;
          const dx = p.x - t.x, dy = p.y - t.y;
          if (dx * dx + dy * dy < t.radius * t.radius) {
            const dmg = Math.floor(this.atk * 1.2);
            p.takeDamage(dmg, 'tornado');
            p.applyKnockback(t.x, t.y, GAME.KNOCKBACK_SPEED * 1.5, GAME.KNOCKBACK_DURATION);
            this.addDamageEvent(p.x, p.y - 20, dmg, 'boss_hit', { target: p.id });
          }
        }
      }
    }
    this.lavaTornados = this.lavaTornados.filter(t => now < t.endTime);
  }

  // === ADD EXPLOSIONS ON DEATH ===
  updateAddExplosions(now, players) {
    for (const exp of this.addExplosions) {
      if (now >= exp.detonateTime && !exp.detonated) {
        exp.detonated = true;
        for (const p of players) {
          if (!p.alive) continue;
          const dx = p.x - exp.x, dy = p.y - exp.y;
          if (dx * dx + dy * dy < exp.radius * exp.radius) {
            p.takeDamage(exp.dmg, 'add_explosion');
            this.addDamageEvent(p.x, p.y - 20, exp.dmg, 'boss_hit', { target: p.id });
          }
        }
        this.firePatches.push({ x: exp.x, y: exp.y, radius: 50, endTime: now + 6000 });
      }
    }
    this.addExplosions = this.addExplosions.filter(e => now < e.endTime);
  }

  // =====================================

  startAttack(now, players) {
    this.lastAttack = now;
    const alivePlayers = players.filter(p => p.alive);
    if (alivePlayers.length === 0) return;

    const attacks = this.getAttackPool();
    const attack = attacks[Math.floor(Math.random() * attacks.length)];
    const telegraphDuration = this.getTelegraphDuration(attack);

    // Say something
    if (attack === 'wrath_of_ragnaros') this.say('wrath');
    else if (attack === 'hammer_slam' && Math.random() < 0.3) this.say('hammer');
    else if (attack === 'fire_wave') this.say('fire_wave');
    else if (attack === 'rotating_laser') this.say('laser');
    else if (attack === 'meteor_rain') this.say('meteor');
    else if (attack === 'boss_charge') this.say('charge');
    else if (attack === 'player_mark') this.say('mark');
    else if (attack === 'soak_circles') this.say('soak');

    // Special attacks that don't use telegraph system
    if (attack === 'player_mark') {
      this.applyMark(now, alivePlayers);
      return;
    }
    if (attack === 'soak_circles') {
      this.spawnSoakCircles(now, alivePlayers);
      return;
    }
    if (attack === 'heal_cast') {
      this.startHealCast(now);
      return;
    }

    if (telegraphDuration > 0) {
      this.telegraph = { type: attack, startTime: now };
      this.telegraphEnd = now + telegraphDuration;
      this.pendingAttack = attack;
      this.setupTelegraph(attack, now, alivePlayers);
    } else {
      this.performAttack(attack, now, players, alivePlayers);
    }
  }

  getTelegraphDuration(attack) {
    const base = {
      hammer_slam: 800,
      fire_breath: 1000,
      lava_eruption: 1200,
      meteor_rain: 1500,
      fire_wave: 2000,
      wrath_of_ragnaros: 2500,
      rotating_laser: 1500,
      magma_blast: 600,
      multi_fireball: 800,
      boss_charge: 1200,
    };
    return base[attack] || 0;
  }

  setupTelegraph(attack, now, alivePlayers) {
    switch (attack) {
      case 'hammer_slam':
        this.telegraph.data = { radius: 220, x: this.x, y: this.y };
        break;
      case 'fire_breath': {
        const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
        const angle = Math.atan2(target.y - this.y, target.x - this.x);
        this.telegraph.data = { angle, range: 400, spread: 0.6, x: this.x, y: this.y };
        break;
      }
      case 'lava_eruption': {
        const count = this.phase >= 3 ? 6 : this.phase >= 2 ? 4 : 3;
        const targets = [];
        for (let i = 0; i < Math.min(count, alivePlayers.length); i++) {
          const t = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
          targets.push({ x: t.x, y: t.y });
        }
        this.telegraph.data = { targets, radius: 70 };
        break;
      }
      case 'meteor_rain': {
        const meteors = [];
        const count = this.phase >= 3 ? 10 : 6;
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 200 + Math.random() * 500;
          meteors.push({ x: this.x + Math.cos(angle) * dist, y: this.y + Math.sin(angle) * dist, radius: 55 + Math.random() * 30, delay: i * 200 });
        }
        this.telegraph.data = { meteors };
        break;
      }
      case 'fire_wave':
        this.telegraph.data = { x: this.x, y: this.y, maxRadius: this.phase >= 3 ? 650 : 500 };
        break;
      case 'wrath_of_ragnaros':
        this.telegraph.data = { x: this.x, y: this.y };
        break;
      case 'rotating_laser': {
        const startAngle = this.facingAngle;
        this.telegraph.data = { startAngle, x: this.x, y: this.y, range: 700, beamCount: this.phase >= 3 ? 2 : 1 };
        break;
      }
      case 'magma_blast': {
        let furthest = alivePlayers[0], maxDist = 0;
        for (const p of alivePlayers) {
          const d = Math.sqrt((p.x - this.x) ** 2 + (p.y - this.y) ** 2);
          if (d > maxDist) { maxDist = d; furthest = p; }
        }
        this.telegraph.data = { targetX: furthest.x, targetY: furthest.y, x: this.x, y: this.y };
        break;
      }
      case 'multi_fireball': {
        const count = Math.min(this.phase >= 3 ? 5 : 3, alivePlayers.length);
        const targets = [];
        const shuffled = [...alivePlayers].sort(() => Math.random() - 0.5);
        for (let i = 0; i < count; i++) {
          targets.push({ x: shuffled[i].x, y: shuffled[i].y, id: shuffled[i].id });
        }
        this.telegraph.data = { targets, x: this.x, y: this.y };
        break;
      }
      case 'boss_charge': {
        const target = this.getAggroTarget(alivePlayers) || alivePlayers[0];
        const angle = Math.atan2(target.y - this.y, target.x - this.x);
        const chargeSpeed = this.phase >= 3 ? 800 : 600;
        const chargeDist = Math.sqrt((target.x - this.x) ** 2 + (target.y - this.y) ** 2) + 150;
        this.telegraph.data = {
          startX: this.x, startY: this.y, targetX: target.x, targetY: target.y,
          angle, chargeSpeed, chargeDist,
          endX: this.x + Math.cos(angle) * chargeDist, endY: this.y + Math.sin(angle) * chargeDist,
          width: 60,
        };
        break;
      }
    }
  }

  executeTelegraphedAttack(now, players) {
    const attack = this.pendingAttack;
    this.pendingAttack = null;
    const alivePlayers = players.filter(p => p.alive);
    if (alivePlayers.length === 0) return;
    this.performAttack(attack, now, players, alivePlayers);
  }

  performAttack(attack, now, players, alivePlayers) {
    switch (attack) {
      case 'hammer_slam': {
        this.activePattern = 'hammer_slam';
        this.patternEnd = now + 600;
        this.patternData = { radius: 220, x: this.x, y: this.y };
        for (const p of alivePlayers) {
          const dx = p.x - this.x, dy = p.y - this.y;
          if (dx * dx + dy * dy < 220 * 220) {
            const dmg = Math.floor(this.atk * 1.5);
            p.takeDamage(dmg, 'hammer_slam');
            p.applyKnockback(this.x, this.y, GAME.KNOCKBACK_SPEED * 1.3, GAME.KNOCKBACK_DURATION);
            this.addDamageEvent(p.x, p.y - 20, dmg, 'boss_hit', { target: p.id });
          }
        }
        break;
      }
      case 'fire_breath': {
        const td = this.telegraph?.data;
        const angle = td?.angle ?? this.facingAngle;
        this.activePattern = 'fire_breath';
        this.patternEnd = now + 1200;
        this.patternData = { angle, range: 400, spread: 0.6, x: this.x, y: this.y };
        for (const p of alivePlayers) {
          const dx = p.x - this.x, dy = p.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 400) continue;
          const pAngle = Math.atan2(dy, dx);
          let diff = Math.abs(pAngle - angle);
          if (diff > Math.PI) diff = 2 * Math.PI - diff;
          if (diff < 0.6) {
            const dmg = Math.floor(this.atk * 2);
            p.takeDamage(dmg, 'fire_breath');
            this.addDamageEvent(p.x, p.y - 20, dmg, 'boss_hit', { target: p.id });
          }
        }
        break;
      }
      case 'lava_eruption': {
        this.activePattern = 'lava_eruption';
        this.patternEnd = now + 1500;
        const td = this.telegraph?.data;
        const targets = td?.targets ?? [{ x: alivePlayers[0].x, y: alivePlayers[0].y }];
        for (const t of targets) {
          this.firePatches.push({ x: t.x, y: t.y, radius: 70, endTime: now + 10000 });
          for (const p of alivePlayers) {
            const dx = p.x - t.x, dy = p.y - t.y;
            if (dx * dx + dy * dy < 70 * 70) {
              const dmg = Math.floor(this.atk * 1.2);
              p.takeDamage(dmg, 'lava_eruption');
              this.addDamageEvent(p.x, p.y - 20, dmg, 'boss_hit', { target: p.id });
            }
          }
        }
        this.patternData = { targets };
        break;
      }
      case 'magma_blast': {
        const td = this.telegraph?.data;
        let target = alivePlayers[0];
        if (td) {
          let best = Infinity;
          for (const p of alivePlayers) {
            const d = (p.x - td.targetX) ** 2 + (p.y - td.targetY) ** 2;
            if (d < best) { best = d; target = p; }
          }
        }
        this.activePattern = 'magma_blast';
        this.patternEnd = now + 800;
        this.patternData = { targetX: target.x, targetY: target.y, x: this.x, y: this.y };
        const dmg = Math.floor(this.atk * 2.5);
        target.takeDamage(dmg, 'magma_blast');
        target.applyKnockback(this.x, this.y, GAME.KNOCKBACK_SPEED * 1.5, GAME.KNOCKBACK_DURATION * 1.5);
        this.addDamageEvent(target.x, target.y - 20, dmg, 'boss_crit', { target: target.id });
        break;
      }
      case 'multi_fireball': {
        this.activePattern = 'multi_fireball';
        this.patternEnd = now + 1200;
        const td = this.telegraph?.data;
        const targets = td?.targets ?? [{ x: alivePlayers[0].x, y: alivePlayers[0].y }];
        this.patternData = { targets, startTime: now, x: this.x, y: this.y };
        for (let i = 0; i < targets.length; i++) {
          const t = targets[i];
          setTimeout(() => {
            for (const p of players) {
              if (!p.alive) continue;
              const dx = p.x - t.x, dy = p.y - t.y;
              if (dx * dx + dy * dy < 50 * 50) {
                const dmg = Math.floor(this.atk * 1.5);
                p.takeDamage(dmg, 'fireball');
                this.addDamageEvent(p.x, p.y - 20, dmg, 'boss_hit', { target: p.id });
              }
            }
            this.firePatches.push({ x: t.x, y: t.y, radius: 40, endTime: Date.now() + 5000 });
          }, 300 + i * 150);
        }
        break;
      }
      case 'meteor_rain': {
        this.activePattern = 'meteor_rain';
        this.patternEnd = now + 3000;
        const td = this.telegraph?.data;
        const meteors = td?.meteors ?? [];
        this.patternData = { meteors, startTime: now };
        for (const m of meteors) {
          setTimeout(() => {
            for (const p of players) {
              if (!p.alive) continue;
              const dx = p.x - m.x, dy = p.y - m.y;
              if (dx * dx + dy * dy < m.radius * m.radius) {
                const dmg = Math.floor(this.atk * 1.8);
                p.takeDamage(dmg, 'meteor');
                this.addDamageEvent(p.x, p.y - 20, dmg, 'boss_hit', { target: p.id });
              }
            }
            this.firePatches.push({ x: m.x, y: m.y, radius: m.radius * 0.6, endTime: Date.now() + 6000 });
          }, m.delay + 400);
        }
        break;
      }
      case 'fire_wave': {
        this.activePattern = 'fire_wave';
        this.patternEnd = now + 2500;
        const maxR = this.phase >= 3 ? 650 : 500;
        this.patternData = { startTime: now, duration: 2000, maxRadius: maxR, x: this.x, y: this.y, lastDmgRadius: 0, currentRadius: 0 };
        break;
      }
      case 'rotating_laser': {
        this.activePattern = 'rotating_laser';
        const duration = this.phase >= 3 ? 5000 : 4000;
        this.patternEnd = now + duration;
        const td = this.telegraph?.data;
        const startAngle = td?.startAngle ?? this.facingAngle;
        const beamCount = td?.beamCount ?? (this.phase >= 3 ? 2 : 1);
        this.patternData = {
          startTime: now, startAngle, speed: this.phase >= 3 ? 1.2 : 0.9,
          range: 700, width: 40, beamCount, x: this.x, y: this.y,
          lastDmgTick: now, currentAngle: startAngle,
        };
        this.laserAngle = startAngle;
        break;
      }
      case 'boss_charge': {
        const td = this.telegraph?.data;
        if (!td) break;
        this.activePattern = 'boss_charge';
        const chargeDuration = Math.floor(td.chargeDist / td.chargeSpeed * 1000);
        this.patternEnd = now + chargeDuration + 500;
        this.patternData = {
          startTime: now, duration: chargeDuration,
          startX: this.x, startY: this.y,
          endX: td.endX, endY: td.endY,
          angle: td.angle, width: td.width,
          chargeSpeed: td.chargeSpeed,
          hitPlayers: {},
        };
        this.charging = true;
        this.chargeEnd = now + chargeDuration;
        break;
      }
      case 'wrath_of_ragnaros': {
        this.activePattern = 'wrath_of_ragnaros';
        this.patternEnd = now + 3000;
        this.patternData = { chargeStart: now, castTime: 2000 };
        setTimeout(() => {
          for (const p of players) {
            if (!p.alive) continue;
            let behindPillar = false;
            for (const w of PILLAR_CENTERS) {
              if (Math.sqrt((p.x - w.x) ** 2 + (p.y - w.y) ** 2) < 80) { behindPillar = true; break; }
            }
            if (!behindPillar) {
              const dmg = Math.floor(this.atk * 4);
              p.takeDamage(dmg, 'wrath_of_ragnaros');
              p.applyKnockback(this.x, this.y, GAME.KNOCKBACK_SPEED * 2, GAME.KNOCKBACK_DURATION);
              this.addDamageEvent(p.x, p.y - 20, dmg, 'boss_crit', { target: p.id });
            }
          }
        }, 2000);
        break;
      }
    }
  }

  updateActivePattern(now, players) {
    if (!this.activePattern || !this.patternData) return;

    if (this.activePattern === 'boss_charge') {
      const pd = this.patternData;
      const elapsed = now - pd.startTime;
      const progress = Math.min(1, elapsed / pd.duration);
      if (progress < 1) {
        this.x = pd.startX + (pd.endX - pd.startX) * progress;
        this.y = pd.startY + (pd.endY - pd.startY) * progress;
        this.facingAngle = pd.angle;
        for (const p of players) {
          if (!p.alive || pd.hitPlayers[p.id]) continue;
          const dx = p.x - this.x, dy = p.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < pd.width + 20) {
            pd.hitPlayers[p.id] = true;
            const dmg = Math.floor(this.atk * 2.5);
            p.takeDamage(dmg, 'boss_charge');
            p.applyKnockback(this.x, this.y, GAME.KNOCKBACK_SPEED * 2, GAME.KNOCKBACK_DURATION * 1.5);
            this.addDamageEvent(p.x, p.y - 20, dmg, 'boss_crit', { target: p.id });
          }
        }
        if (elapsed % 100 < 55) {
          this.firePatches.push({ x: this.x, y: this.y, radius: 35, endTime: now + 4000 });
        }
      } else {
        this.charging = false;
      }
    }

    if (this.activePattern === 'fire_wave') {
      const pd = this.patternData;
      const elapsed = now - pd.startTime;
      const progress = Math.min(elapsed / pd.duration, 1);
      const currentRadius = progress * pd.maxRadius;
      pd.currentRadius = currentRadius;
      const ringWidth = 50;
      for (const p of players) {
        if (!p.alive) continue;
        const dx = p.x - pd.x, dy = p.y - pd.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= currentRadius - ringWidth && dist <= currentRadius + ringWidth && dist > pd.lastDmgRadius - ringWidth) {
          let behindPillar = false;
          for (const w of PILLAR_CENTERS) {
            const pwDx = w.x - pd.x, pwDy = w.y - pd.y;
            const pillarDist = Math.sqrt(pwDx * pwDx + pwDy * pwDy);
            const ppDx = p.x - w.x, ppDy = p.y - w.y;
            const playerToPillar = Math.sqrt(ppDx * ppDx + ppDy * ppDy);
            if (playerToPillar < 70 && pillarDist < dist) { behindPillar = true; break; }
          }
          const dmgMult = behindPillar ? 0.3 : 1.0;
          const dmg = Math.floor(this.atk * 2.5 * dmgMult);
          p.takeDamage(dmg, 'fire_wave');
          if (!behindPillar) p.applyKnockback(pd.x, pd.y, GAME.KNOCKBACK_SPEED, GAME.KNOCKBACK_DURATION * 0.5);
          this.addDamageEvent(p.x, p.y - 20, dmg, behindPillar ? 'boss_hit' : 'boss_crit', { target: p.id });
        }
      }
      pd.lastDmgRadius = currentRadius;
    }

    if (this.activePattern === 'rotating_laser') {
      const pd = this.patternData;
      const elapsed = (now - pd.startTime) / 1000;
      const currentAngle = pd.startAngle + elapsed * pd.speed;
      this.laserAngle = currentAngle;
      pd.currentAngle = currentAngle;
      if (now - pd.lastDmgTick >= 200) {
        pd.lastDmgTick = now;
        for (let b = 0; b < pd.beamCount; b++) {
          const beamAngle = currentAngle + (b * Math.PI / pd.beamCount);
          for (const p of players) {
            if (!p.alive) continue;
            const dx = p.x - pd.x, dy = p.y - pd.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > pd.range || dist < 50) continue;
            const perpDist = Math.abs(Math.sin(beamAngle) * dx - Math.cos(beamAngle) * dy);
            const dotProduct = Math.cos(beamAngle) * dx + Math.sin(beamAngle) * dy;
            if (perpDist < pd.width / 2 + 16 && dotProduct > 0) {
              let blocked = false;
              for (const w of PILLAR_CENTERS) {
                const wx = w.x - pd.x, wy = w.y - pd.y;
                const wDist = Math.sqrt(wx * wx + wy * wy);
                const wPerp = Math.abs(Math.sin(beamAngle) * wx - Math.cos(beamAngle) * wy);
                const wDot = Math.cos(beamAngle) * wx + Math.sin(beamAngle) * wy;
                if (wPerp < 40 && wDot > 0 && wDist < dist) { blocked = true; break; }
              }
              if (!blocked) {
                const dmg = Math.floor(this.atk * 3);
                p.takeDamage(dmg, 'rotating_laser');
                this.addDamageEvent(p.x, p.y - 20, dmg, 'boss_crit', { target: p.id });
              }
            }
          }
        }
      }
    }
  }

  // -- Adds --
  spawnAdds(now, count) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 250 + Math.random() * 100;
      const isElite = i === 0 && this.phase >= 3;
      this.adds.push({
        id: `add_${this.addIdCounter++}`,
        x: this.x + Math.cos(angle) * dist,
        y: this.y + Math.sin(angle) * dist,
        hp: isElite ? 600000 : 250000,
        maxHp: isElite ? 600000 : 250000,
        atk: isElite ? 500 : 300,
        speed: isElite ? 100 : 130,
        radius: isElite ? 28 : 20,
        alive: true,
        target: null,
        lastAtk: now,
        atkCooldown: 2000 + Math.random() * 1000,
        type: isElite ? 'elite' : 'normal',
      });
    }
  }

  updateAdds(now, players) {
    const alivePlayers = players.filter(p => p.alive);
    if (alivePlayers.length === 0) return;
    for (const add of this.adds) {
      if (!add.alive) continue;
      if (!add.target || Math.random() < 0.01) {
        add.target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)].id;
      }
      const target = players.find(p => p.id === add.target && p.alive);
      if (!target) { add.target = alivePlayers[0].id; continue; }
      const dx = target.x - add.x, dy = target.y - add.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 50) {
        add.x += (dx / dist) * add.speed * 0.05;
        add.y += (dy / dist) * add.speed * 0.05;
      }
      if (dist < 60 && now - add.lastAtk >= add.atkCooldown) {
        add.lastAtk = now;
        target.takeDamage(add.atk, 'add_attack');
        this.addDamageEvent(target.x, target.y - 20, add.atk, 'add_hit', { target: target.id });
      }
    }
    // Check dead adds — schedule explosion
    for (const add of this.adds) {
      if (!add.alive && !add.exploded) {
        add.exploded = true;
        this.addExplosions.push({
          x: add.x, y: add.y, radius: 80,
          detonateTime: now + 2000, endTime: now + 2500,
          dmg: Math.floor(this.atk * 1.5), detonated: false,
        });
        this.addDamageEvent(add.x, add.y - 20, 0, 'add_explode_warn');
      }
    }
    this.adds = this.adds.filter(a => a.alive);
  }

  getAttackPool() {
    const base = (() => {
      switch (this.phase) {
        case 1: return ['hammer_slam', 'fire_breath', 'lava_eruption', 'magma_blast', 'multi_fireball', 'boss_charge'];
        case 2: return ['hammer_slam', 'fire_breath', 'lava_eruption', 'magma_blast', 'multi_fireball', 'meteor_rain', 'fire_wave', 'boss_charge', 'player_mark', 'soak_circles'];
        case 3: return ['hammer_slam', 'fire_breath', 'lava_eruption', 'magma_blast', 'multi_fireball', 'meteor_rain', 'fire_wave', 'rotating_laser', 'wrath_of_ragnaros', 'boss_charge', 'player_mark', 'soak_circles', 'heal_cast'];
        default: return ['hammer_slam'];
      }
    })();
    return base;
  }

  takeDamage(amount, attackerId = null, isCrit = false) {
    if (!this.alive) return;

    // Shield absorbs damage
    if (this.shield && this.shield.hp > 0) {
      const absorbed = Math.min(this.shield.hp, amount);
      this.shield.hp -= absorbed;
      amount -= absorbed;
      this.addDamageEvent(
        this.x + (Math.random() - 0.5) * 80, this.y - 80,
        absorbed, 'shield_hit', { owner: attackerId }
      );
      if (this.shield.hp <= 0) {
        this.shield = null;
        this.addDamageEvent(this.x, this.y - 100, 0, 'shield_break');
      }
      if (amount <= 0) {
        if (attackerId) this.updateAggro(attackerId, absorbed);
        return;
      }
    }

    // Heal cast — count damage for interrupt
    if (this.healCast) {
      this.healCast.dmgReceived += amount;
    }

    this.hp = Math.max(0, this.hp - amount);
    this.addDamageEvent(
      this.x + (Math.random() - 0.5) * 80,
      this.y - 80 + (Math.random() - 0.5) * 40,
      amount, isCrit ? 'player_crit' : 'player_hit',
      { owner: attackerId }
    );
    if (attackerId) this.updateAggro(attackerId, amount);
    if (this.hp <= 0) this.alive = false;
  }

  damageAdd(addId, amount, isCrit = false, attackerId = null) {
    const add = this.adds.find(a => a.id === addId);
    if (!add || !add.alive) return false;
    add.hp -= amount;
    this.addDamageEvent(
      add.x + (Math.random() - 0.5) * 20, add.y - 30,
      amount, isCrit ? 'player_crit' : 'player_hit',
      { owner: attackerId }
    );
    if (add.hp <= 0) { add.alive = false; return true; }
    return false;
  }

  toState() {
    const events = this.damageEvents.splice(0);
    return {
      x: Math.round(this.x), y: Math.round(this.y),
      hp: this.hp, maxHp: this.maxHp,
      phase: this.phase, alive: this.alive,
      submerged: this.submerged, enraged: this.enraged,
      facingAngle: this.facingAngle, aggroTarget: this.aggroTarget,
      quote: this.currentQuote,
      pattern: this.activePattern, patternData: this.patternData,
      telegraph: this.telegraph ? {
        type: this.telegraph.type, data: this.telegraph.data,
        progress: this.telegraphEnd > 0 ? Math.min(1, 1 - (this.telegraphEnd - Date.now()) / (this.telegraphEnd - this.telegraph.startTime)) : 1,
      } : null,
      firePatches: this.firePatches.map(p => ({ x: Math.round(p.x), y: Math.round(p.y), radius: p.radius })),
      adds: this.adds.filter(a => a.alive).map(a => ({
        id: a.id, x: Math.round(a.x), y: Math.round(a.y),
        hp: a.hp, maxHp: a.maxHp, radius: a.radius, type: a.type,
      })),
      damageEvents: events,
      // New mechanics state
      shield: this.shield ? { hp: this.shield.hp, maxHp: this.shield.maxHp, pct: this.shield.hp / this.shield.maxHp } : null,
      healCast: this.healCast ? {
        progress: Math.min(1, (Date.now() - this.healCast.startTime) / this.healCast.duration),
        interruptPct: Math.min(1, this.healCast.dmgReceived / this.healCast.dmgRequired),
      } : null,
      mark: this.mark ? {
        playerId: this.mark.playerId, radius: this.mark.radius,
        timeLeft: Math.max(0, this.mark.endTime - Date.now()),
      } : null,
      soakCircles: this.soakCircles.map(c => ({
        x: Math.round(c.x), y: Math.round(c.y), radius: c.radius,
        soaked: c.soaked, timeLeft: Math.max(0, c.endTime - Date.now()),
      })),
      lavaFissures: this.lavaFissures.map(f => ({ x: Math.round(f.x), y: Math.round(f.y), radius: f.radius })),
      lavaTornados: this.lavaTornados.map(t => ({ x: Math.round(t.x), y: Math.round(t.y), radius: t.radius })),
      addExplosions: this.addExplosions.filter(e => !e.detonated).map(e => ({
        x: Math.round(e.x), y: Math.round(e.y), radius: e.radius,
        timeLeft: Math.max(0, e.detonateTime - Date.now()),
      })),
    };
  }
}
