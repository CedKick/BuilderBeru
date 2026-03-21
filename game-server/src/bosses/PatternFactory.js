// ── PatternFactory ──────────────────────────────────────
// Converts BossEditor declarative pattern definitions (JSON)
// into BossBase callback-style patterns (onStart/onExecute/onUpdate).
//
// Adapted from ExpeditionBoss._executePattern() — same pattern types,
// same physics, but using BossBase's callback lifecycle instead of
// a monolithic switch statement.

import { ARENA } from '../config.js';
import { Add } from '../entities/Add.js';

// ── Targeting helpers ──────────────────────────────────

function resolveTarget(boss, gs, targeting) {
  const players = gs.getAlivePlayers();
  if (players.length === 0) return null;

  switch (targeting) {
    case 'highest_aggro':
      return gs.getHighestAggroPlayer();
    case 'random':
      return players[Math.floor(Math.random() * players.length)];
    case 'nearest': {
      let best = null, bestDist = Infinity;
      for (const p of players) {
        const d = Math.hypot(p.x - boss.x, p.y - boss.y);
        if (d < bestDist) { bestDist = d; best = p; }
      }
      return best;
    }
    case 'farthest': {
      let best = null, bestDist = -1;
      for (const p of players) {
        const d = Math.hypot(p.x - boss.x, p.y - boss.y);
        if (d > bestDist) { bestDist = d; best = p; }
      }
      return best;
    }
    case 'lowest_hp_percent': {
      let best = null, bestPct = Infinity;
      for (const p of players) {
        const pct = p.hp / p.maxHp;
        if (pct < bestPct) { bestPct = pct; best = p; }
      }
      return best;
    }
    case 'highest_dps': {
      let best = null, bestDmg = -1;
      for (const p of players) {
        if ((p.stats?.damageDealt || 0) > bestDmg) {
          bestDmg = p.stats.damageDealt;
          best = p;
        }
      }
      return best;
    }
    default:
      return gs.getHighestAggroPlayer() || players[0];
  }
}

function faceTarget(boss, target) {
  if (target) {
    boss.rotation = Math.atan2(target.y - boss.y, target.x - boss.x);
  }
}

// ── Damage helper ──────────────────────────────────────

function computeRawDamage(boss, power) {
  const enrageMult = boss.enraged ? 2.0 : 1.0;
  const rageMult = boss.rageBuff >= 3 ? 3.0 : 1.0;
  return boss.atk * (power || 1.5) * enrageMult * rageMult;
}

function dealDamage(player, damage, isTrueDamage, boss, gs, skillName) {
  if (player.dodging) return;
  const actual = isTrueDamage
    ? player.takeTrueDamage(damage, boss)
    : player.takeDamage(damage, boss);
  if (actual > 0) {
    gs.addEvent({ type: 'damage', source: boss.id, target: player.id, amount: actual, skill: skillName });
  }
}

// ── Pattern builders ───────────────────────────────────

function buildCone(def) {
  const range = def.range || 250;
  const halfAngle = ((def.coneAngle || 90) * Math.PI / 180) / 2;

  return {
    onStart(boss, gs, data) {
      const target = resolveTarget(boss, gs, def.targeting);
      faceTarget(boss, target);
      data.angle = boss.rotation;
      gs.addAoeZone({
        id: `cone_${Date.now()}`, type: 'cone_telegraph',
        x: boss.x, y: boss.y, radius: range,
        angle: data.angle, coneAngle: halfAngle * 2,
        ttl: (def.telegraphTime || 1.5) + (def.castTime || 0.4),
        maxTtl: (def.telegraphTime || 1.5) + (def.castTime || 0.4),
        active: false, source: boss.id,
      });
    },
    onExecute(boss, gs, data) {
      const dmg = computeRawDamage(boss, def.power);
      for (const p of gs.getAlivePlayers()) {
        if (p.dodging) continue;
        const dx = p.x - boss.x, dy = p.y - boss.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > range + (p.radius || 20)) continue;
        const angle = Math.atan2(dy, dx);
        let diff = angle - data.angle;
        while (diff > Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;
        if (Math.abs(diff) <= halfAngle) {
          dealDamage(p, dmg, def.isTrueDamage, boss, gs, def.name);
        }
      }
    },
  };
}

function buildAoeRing(def) {
  const inner = def.innerRadius || 0;
  const outer = def.outerRadius || 300;

  return {
    onStart(boss, gs) {
      gs.addAoeZone({
        id: `ring_${Date.now()}`, type: 'boss_ring',
        x: boss.x, y: boss.y, radius: outer, innerRadius: inner,
        ttl: (def.telegraphTime || 1.5) + (def.castTime || 0.4),
        maxTtl: (def.telegraphTime || 1.5) + (def.castTime || 0.4),
        active: false, source: boss.id,
      });
    },
    onExecute(boss, gs) {
      const dmg = computeRawDamage(boss, def.power);
      for (const p of gs.getAlivePlayers()) {
        if (p.dodging) continue;
        const dist = Math.hypot(p.x - boss.x, p.y - boss.y);
        if (dist >= inner && dist <= outer + (p.radius || 20)) {
          dealDamage(p, dmg, def.isTrueDamage, boss, gs, def.name);
        }
      }
      gs.addAoeZone({ x: boss.x, y: boss.y, radius: outer, type: 'boss_ring', ttl: 1.0 });
    },
  };
}

function buildDonut(def) {
  const safe = def.innerSafe || 150;
  const outer = def.outerRadius || 600;

  return {
    onStart(boss, gs) {
      gs.addAoeZone({
        id: `donut_${Date.now()}`, type: 'boss_donut',
        x: boss.x, y: boss.y, radius: outer, innerSafe: safe,
        ttl: (def.telegraphTime || 1.5) + (def.castTime || 0.4),
        maxTtl: (def.telegraphTime || 1.5) + (def.castTime || 0.4),
        active: false, source: boss.id,
      });
    },
    onExecute(boss, gs) {
      const dmg = computeRawDamage(boss, def.power);
      for (const p of gs.getAlivePlayers()) {
        if (p.dodging) continue;
        const dist = Math.hypot(p.x - boss.x, p.y - boss.y);
        if (dist > safe && dist <= outer + (p.radius || 20)) {
          dealDamage(p, dmg, true, boss, gs, def.name); // Donut = always true damage
        }
      }
      gs.addAoeZone({ x: boss.x, y: boss.y, radius: outer, type: 'boss_donut', innerSafe: safe, ttl: 1.5 });
    },
  };
}

function buildDoubleDonut(def) {
  return {
    onStart(boss, gs) {
      gs.addAoeZone({
        id: `dbl_inner_tel_${Date.now()}`, type: 'donut_telegraph',
        x: boss.x, y: boss.y, radius: 350, innerRadius: 130,
        ttl: (def.telegraphTime || 2.0) + (def.castTime || 0.5),
        active: false, source: boss.id,
      });
    },
    onExecute(boss, gs, data) {
      // Phase 1: inner ring 130-350px OS
      for (const p of gs.getAlivePlayers()) {
        if (p.dodging) continue;
        const dist = Math.hypot(p.x - boss.x, p.y - boss.y);
        if (dist > 120 && dist < 360) {
          dealDamage(p, 999999, true, boss, gs, 'Anneau Destructeur');
        }
      }
      gs.addAoeZone({ id: `dbl_inner_exp_${Date.now()}`, type: 'donut_explosion', x: boss.x, y: boss.y, radius: 350, innerRadius: 130, ttl: 0.5, active: true, source: boss.id });
      gs.addEvent({ type: 'boss_message', text: '⚠️ Deuxième anneau !' });
      // Phase 2 telegraph
      gs.addAoeZone({ id: `dbl_outer_tel_${Date.now()}`, type: 'donut_telegraph', x: boss.x, y: boss.y, radius: 550, innerRadius: 370, ttl: 1.5, active: false, source: boss.id });
      gs.addAoeZone({ id: `dbl_laser_tel_${Date.now()}`, type: 'circle_telegraph', x: boss.x, y: boss.y, radius: 160, ttl: 1.5, active: false, source: boss.id });
      // Schedule phase 2 detonation
      data._doubleDonutPhase2 = { timer: 1.2, bossX: boss.x, bossY: boss.y, bossId: boss.id };
    },
    onUpdate(boss, gs, data, dt) {
      if (!data._doubleDonutPhase2) return true;
      data._doubleDonutPhase2.timer -= dt;
      if (data._doubleDonutPhase2.timer > 0) return false;
      // Phase 2 detonation
      const { bossX, bossY, bossId } = data._doubleDonutPhase2;
      for (const p of gs.getAlivePlayers()) {
        if (p.dodging) continue;
        const dist = Math.hypot(p.x - bossX, p.y - bossY);
        if (dist >= 370 && dist < 550 + (p.radius || 20)) {
          dealDamage(p, 999999, true, boss, gs, 'Anneau Extérieur');
        }
        if (dist < 160 + (p.radius || 20)) {
          dealDamage(p, 999999, true, boss, gs, 'Laser Piège');
        }
      }
      gs.addAoeZone({ id: `dbl_outer_exp_${Date.now()}`, type: 'donut_explosion', x: bossX, y: bossY, radius: 550, innerRadius: 370, ttl: 0.5, active: true, source: bossId });
      data._doubleDonutPhase2 = null;
      return true;
    },
  };
}

function buildLine(def) {
  const range = def.range || 800;
  const halfW = (def.lineWidth || 80) / 2;

  return {
    onStart(boss, gs, data) {
      const target = resolveTarget(boss, gs, def.targeting);
      faceTarget(boss, target);
      data.angle = boss.rotation;
      gs.addAoeZone({
        id: `line_${Date.now()}`, type: 'line_telegraph',
        x: boss.x, y: boss.y, radius: range,
        angle: data.angle, lineWidth: halfW * 2,
        ttl: (def.telegraphTime || 1.5) + (def.castTime || 0.4),
        active: false, source: boss.id,
      });
    },
    onExecute(boss, gs, data) {
      const dmg = computeRawDamage(boss, def.power);
      const cos = Math.cos(data.angle), sin = Math.sin(data.angle);
      for (const p of gs.getAlivePlayers()) {
        if (p.dodging) continue;
        const dx = p.x - boss.x, dy = p.y - boss.y;
        const along = dx * cos + dy * sin;
        const perp = Math.abs(-dx * sin + dy * cos);
        if (along >= 0 && along <= range && perp <= halfW + (p.radius || 20)) {
          dealDamage(p, dmg, def.isTrueDamage, boss, gs, def.name);
        }
      }
    },
  };
}

function buildTargetedAoeMulti(def) {
  const count = def.targetCount || 3;
  const radius = def.aoeRadius || 100;

  return {
    onExecute(boss, gs) {
      const dmg = computeRawDamage(boss, def.power);
      const players = gs.getAlivePlayers();
      const targets = [...players].sort(() => Math.random() - 0.5).slice(0, count);
      for (const t of targets) {
        gs.addAoeZone({ x: t.x, y: t.y, radius, type: 'boss_targeted', ttl: 1.5 });
        for (const p of players) {
          if (p.dodging) continue;
          if (Math.hypot(p.x - t.x, p.y - t.y) <= radius + (p.radius || 20)) {
            dealDamage(p, dmg, def.isTrueDamage, boss, gs, def.name);
          }
        }
      }
    },
  };
}

function buildFireWave(def) {
  const maxRadius = def.maxRadius || 500;
  const duration = def.duration || 2.5;

  return {
    onExecute(boss, gs) {
      const dmg = computeRawDamage(boss, def.power) * 0.12;
      gs.addAoeZone({
        x: boss.x, y: boss.y, radius: 0,
        type: 'fire_wave', ttl: duration, active: true,
        damagePerTick: dmg, tickInterval: 0.15,
        _maxRadius: maxRadius, _expandRate: maxRadius / duration,
        color: def.waveColor || '#f97316',
      });
    },
  };
}

function buildLaser(def) {
  const range = def.range || 900;
  const lineW = def.lineWidth || 60;
  const duration = def.duration || 2.5;

  return {
    onStart(boss, gs, data) {
      const target = resolveTarget(boss, gs, def.targeting);
      faceTarget(boss, target);
      data.angle = boss.rotation;
    },
    onExecute(boss, gs, data) {
      const dmg = computeRawDamage(boss, def.power) * 0.15;
      gs.addAoeZone({
        x: boss.x, y: boss.y, radius: range,
        type: 'laser', angle: data.angle, lineWidth: lineW,
        ttl: duration, active: true,
        damagePerTick: dmg, tickInterval: 0.2,
        color: def.laserColor || '#8b5cf6',
      });
      gs.addEvent({ type: 'boss_message', text: `${boss.name} lance ${def.name} !` });
    },
  };
}

function buildRotatingLaser(def) {
  const range = def.range || 800;
  const lineW = def.lineWidth || 60;
  const duration = def.duration || 5.0;
  const rotSpeed = def.rotationSpeed || 1.2;
  const dir = def.direction === 'ccw' ? -1 : 1;

  return {
    onExecute(boss, gs) {
      const dmg = computeRawDamage(boss, def.power) * 0.2;
      gs.addAoeZone({
        x: boss.x, y: boss.y, radius: range,
        type: 'rotating_laser', angle: boss.rotation, lineWidth: lineW,
        ttl: duration, active: true,
        damagePerTick: dmg, tickInterval: 0.15,
        _rotSpeed: rotSpeed * dir, _bossRef: boss,
        color: def.laserColor || '#ef4444',
      });
      gs.addEvent({ type: 'boss_message', text: `${boss.name} lance un laser rotatif !` });
    },
  };
}

function buildPersistentAoe(def) {
  const radius = def.aoeRadius || 150;
  const duration = def.duration || 8;
  const tick = def.tickInterval || 1.0;

  return {
    onExecute(boss, gs) {
      const dmg = computeRawDamage(boss, def.power);
      const players = gs.getAlivePlayers();
      const target = players[Math.floor(Math.random() * players.length)];
      const zx = target ? target.x : boss.x;
      const zy = target ? target.y : boss.y;
      gs.addAoeZone({
        x: zx, y: zy, radius, type: 'boss_persistent',
        ttl: duration, _tickTimer: 0, _tickInterval: tick,
        _damage: dmg, _isTrueDamage: def.isTrueDamage || false,
        _bossId: boss.id,
      });
    },
  };
}

function buildAoeFull(def) {
  const addType = def.spawnsAddsType || 'minion';
  const addCount = def.spawnsAddsCount || 3;

  return {
    onExecute(boss, gs) {
      // Raid-wide damage
      const dmg = computeRawDamage(boss, def.power);
      for (const p of gs.getAlivePlayers()) {
        if (p.dodging) continue;
        dealDamage(p, dmg, def.isTrueDamage, boss, gs, def.name);
      }
      // Spawn adds
      const maxAdds = 8;
      for (let i = 0; i < addCount; i++) {
        if (gs.getAliveAdds().length >= maxAdds) break;
        const angle = (Math.PI * 2 / addCount) * i;
        const spawnX = boss.x + Math.cos(angle) * 200;
        const spawnY = boss.y + Math.sin(angle) * 200;
        const addStats = {
          hp: Math.round(boss.maxHp * (addType === 'elite' ? 0.02 : 0.005)),
          atk: Math.round(boss.atk * (addType === 'elite' ? 0.5 : 0.3)),
          def: 10,
          spd: 120,
        };
        gs.addAdd(new Add(addType, spawnX, spawnY, addStats));
      }
      gs.addEvent({ type: 'boss_message', text: `${boss.name} invoque des serviteurs !` });
    },
  };
}

function buildDpsCheck(def) {
  const threshold = (def.dpsThreshold || 4) * (def.dpsThresholdMult || 1_000_000);
  const healPct = def.healPercent || 5;
  const failPower = def.failPower || 1.5;
  const staggerDur = def.staggerDuration || 5;
  const staggerDefMult = def.staggerDefMult || 0.4;

  return {
    onExecute(boss, gs) {
      const players = gs.getAlivePlayers();
      const totalDmg = players.reduce((s, p) => s + (p.stats?.damageDealt || 0), 0);
      const elapsed = Math.max(1, gs.timer ? (900 - gs.timer) : 60); // rough elapsed
      const teamDps = totalDmg / elapsed;

      gs.addEvent({ type: 'boss_message', text: `${boss.name} évalue la puissance de l'équipe...` });

      if (teamDps < threshold) {
        // Failed
        const healAmount = Math.floor(boss.maxHp * healPct / 100);
        boss.hp = Math.min(boss.maxHp, boss.hp + healAmount);
        gs.addEvent({ type: 'boss_heal', source: boss.id, amount: healAmount, text: `DPS insuffisant ! ${boss.name} récupère ${healPct}% HP !` });
        const failDmg = boss.atk * failPower;
        for (const p of players) {
          dealDamage(p, failDmg, false, boss, gs, def.name);
        }
      } else {
        // Passed — stagger
        gs.addEvent({ type: 'boss_message', text: `L'équipe résiste ! ${boss.name} est ébranlé !` });
        boss._stunned = true;
        boss._stunnedTimer = staggerDur;
      }
    },
  };
}

function buildPercentHpAttack(def) {
  const targetPct = def.targetHpPercent || 10;
  const radius = def.outerRadius || 450;
  const inner = def.innerSafe || 0;

  return {
    onStart(boss, gs) {
      gs.addAoeZone({
        id: `pctHp_${Date.now()}`, type: 'boss_donut',
        x: boss.x, y: boss.y, radius, innerSafe: inner,
        ttl: (def.telegraphTime || 2.0) + (def.castTime || 0.5),
        active: false, source: boss.id,
      });
    },
    onExecute(boss, gs) {
      let hitCount = 0;
      for (const p of gs.getAlivePlayers()) {
        if (p.dodging) continue;
        const dist = Math.hypot(p.x - boss.x, p.y - boss.y);
        if (inner > 0 && dist < inner) continue;
        if (dist > radius + (p.radius || 20)) continue;
        const targetHp = Math.max(1, Math.floor(p.maxHp * targetPct / 100));
        if (p.hp > targetHp) {
          const dmg = p.hp - targetHp;
          p.hp = targetHp;
          hitCount++;
          gs.addEvent({ type: 'damage', source: boss.id, target: p.id, amount: dmg, skill: def.name, percentHp: true });
        }
      }
      if (hitCount > 0) {
        gs.addEvent({ type: 'boss_message', text: `${def.name} frappe ${hitCount} joueurs à ${targetPct}% HP !` });
      }
    },
  };
}

function buildSoulDrain(def) {
  const drainPct = def.drainPercent || 3;
  const duration = def.duration || 4;
  const tickInterval = def.tickInterval || 0.5;
  const healMult = def.healMultiplier || 2;

  return {
    onExecute(boss, gs) {
      gs.addAoeZone({
        x: boss.x, y: boss.y, radius: 800,
        type: 'boss_persistent', ttl: duration,
        _tickTimer: 0, _tickInterval: tickInterval,
        _isDrain: true, _drainPct: drainPct, _healMult: healMult,
        _bossId: boss.id, _bossRef: boss,
        color: '#7c3aed',
      });
      gs.addEvent({ type: 'boss_message', text: `${boss.name} draine l'essence vitale !` });
    },
  };
}

function buildShadowMark(def) {
  const count = def.targetCount || 4;
  const explodeRadius = def.explodeRadius || 130;
  const markDuration = def.markDuration || 3;

  return {
    onExecute(boss, gs) {
      const dmg = computeRawDamage(boss, def.power);
      const players = gs.getAlivePlayers();
      const targets = [...players].sort(() => Math.random() - 0.5).slice(0, count);
      for (const t of targets) {
        gs.addEvent({ type: 'debuff', source: boss.id, target: t.id, debuff: 'shadow_mark', skill: def.name });
        gs.addAoeZone({
          x: t.x, y: t.y, radius: explodeRadius,
          type: 'boss_targeted', ttl: markDuration,
          _followTarget: t.id,
          _detonateOnExpiry: true, _detonateDamage: dmg,
          _bossId: boss.id, _isTrueDamage: def.isTrueDamage || false,
        });
      }
    },
  };
}

// ── Main builder ───────────────────────────────────────

const BUILDERS = {
  cone_telegraph:      buildCone,
  aoe_ring:            buildAoeRing,
  donut:               buildDonut,
  double_donut:        buildDoubleDonut,
  line_telegraph:      buildLine,
  targeted_aoe_multi:  buildTargetedAoeMulti,
  fire_wave:           buildFireWave,
  laser:               buildLaser,
  rotating_laser:      buildRotatingLaser,
  persistent_aoe:      buildPersistentAoe,
  aoe_full:            buildAoeFull,
  dps_check:           buildDpsCheck,
  percent_hp_attack:   buildPercentHpAttack,
  soul_drain:          buildSoulDrain,
  shadow_mark:         buildShadowMark,
};

/**
 * Convert a BossEditor pattern definition (JSON) to a BossBase pattern (callbacks).
 * @param {Object} def - Pattern definition from BossEditor config
 * @returns {Object} BossBase-compatible pattern with onStart/onExecute/onUpdate callbacks
 */
export function buildPattern(def) {
  const builder = BUILDERS[def.type];
  if (!builder) {
    console.warn(`[PatternFactory] Unknown pattern type: ${def.type}, skipping`);
    return null;
  }

  const callbacks = builder(def);

  // Determine minimum phase (BossBase is 1-indexed, BossEditor phases array is 0-indexed)
  let minPhase = undefined;
  if (Array.isArray(def.phases) && def.phases.length > 0) {
    minPhase = Math.min(...def.phases) + 1;
  }

  // Store phases array for exact phase filtering (not just minPhase)
  const phases = Array.isArray(def.phases) && def.phases.length > 0
    ? def.phases.map(p => p + 1) // Convert 0-indexed (editor) → 1-indexed (engine)
    : undefined;

  return {
    name: def.name || def.type,
    type: def.type,
    phase: minPhase,
    phases,                                    // Exact phases array (1-indexed) for precise filtering
    _uid: def._uid || null,                    // Unique ID for chain references
    chainTo: def.chainTo || null,              // UID of pattern to chain after this one
    chainDelay: def.chainDelay || 0,           // Delay (seconds) before chained pattern starts
    weight: def.weight || 2,
    cooldown: def.cooldown || 10,
    globalCooldown: def.globalCooldown || 1.5,
    telegraphTime: def.telegraphTime || 1.5,
    castTime: def.castTime || 0.4,
    recoveryTime: def.recoveryTime || 1.0,
    _cooldownTimer: 0,
    // Callbacks
    onStart: callbacks.onStart || null,
    onTelegraph: callbacks.onTelegraph || null,
    onCast: callbacks.onCast || null,
    onExecute: callbacks.onExecute || null,
    onUpdate: callbacks.onUpdate || null,
  };
}

/**
 * Convert an array of BossEditor pattern definitions to BossBase patterns.
 * @param {Array} patternDefs - Array of pattern definitions from BossEditor config
 * @returns {Array} Array of BossBase-compatible patterns
 */
export function buildPatterns(patternDefs) {
  return (patternDefs || []).map(buildPattern).filter(Boolean);
}
