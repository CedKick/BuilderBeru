import { ARENA, PLAYER, AGGRO } from '../config.js';

export class PhysicsEngine {
  constructor(gameState) {
    this.gs = gameState;
  }

  updatePlayer(player, dt) {
    if (!player.alive) return;

    if (player.dodging) {
      // Dodge movement (fast, fixed direction)
      player.x += player.dodgeDir.x * PLAYER.DODGE_SPEED * dt;
      player.y += player.dodgeDir.y * PLAYER.DODGE_SPEED * dt;
    } else if (player.casting) {
      // Can't move while channeling
    } else {
      // Normal movement
      const dir = player.moveDir;
      if (dir.x !== 0 || dir.y !== 0) {
        // Normalize diagonal movement
        const len = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
        const nx = dir.x / len;
        const ny = dir.y / len;

        player.x += nx * player.speed * dt;
        player.y += ny * player.speed * dt;
      }
    }

    // Clamp to arena
    player.clampPosition();

    // Push away from boss (no overlapping)
    this._pushFromBoss(player);
  }

  _pushFromBoss(player) {
    const boss = this.gs.boss;
    if (!boss.alive) return;

    const dx = player.x - boss.x;
    const dy = player.y - boss.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = player.radius + boss.radius;

    if (dist < minDist && dist > 0) {
      const pushX = (dx / dist) * (minDist - dist);
      const pushY = (dy / dist) * (minDist - dist);
      player.x += pushX;
      player.y += pushY;
      player.clampPosition();
    }
  }

  updateProjectiles(gs, dt) {
    for (const proj of gs.projectiles) {
      if (!proj.alive) continue;

      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.ttl -= dt;

      // Out of arena
      if (proj.x < 0 || proj.x > ARENA.WIDTH || proj.y < 0 || proj.y > ARENA.HEIGHT) {
        proj.alive = false;
        continue;
      }

      // TTL expired
      if (proj.ttl <= 0) {
        proj.alive = false;
        continue;
      }

      // Check hit on boss (player projectile)
      if (proj.type === 'player_projectile' && gs.boss.alive) {
        const dist = Math.hypot(proj.x - gs.boss.x, proj.y - gs.boss.y);
        if (dist < proj.radius + gs.boss.radius) {
          const owner = gs.getPlayer(proj.owner);
          if (owner) {
            const { damage, crit } = this._calcProjectileDamage(owner, proj, gs.boss);
            const actual = gs.boss.takeDamage(damage);
            owner.stats.damageDealt += actual;
            gs.addAggro(owner.id, actual * 1.0 * owner.aggroMult);

            // Mana/Rage on hit for basic projectile attacks
            if (proj.isBasic) {
              const gain = owner.useRage ? 10 : PLAYER.MANA_ON_HIT;
              if (gain > 0) owner.mana = Math.min(owner.maxMana, owner.mana + gain);
            }

            gs.addEvent({
              type: 'damage',
              source: owner.id,
              target: gs.boss.id,
              amount: actual,
              crit,
              skill: 'Projectile',
            });
          }

          if (!proj.piercing) proj.alive = false;
        }
      }

      // Check hit on adds (player projectile)
      if (proj.type === 'player_projectile') {
        for (const add of gs.getAliveAdds()) {
          const dist = Math.hypot(proj.x - add.x, proj.y - add.y);
          if (dist < proj.radius + add.radius) {
            const owner = gs.getPlayer(proj.owner);
            if (owner) {
              const { damage, crit } = this._calcProjectileDamage(owner, proj, add);
              const actual = add.takeDamage(damage);
              owner.stats.damageDealt += actual;

              gs.addEvent({
                type: 'damage',
                source: owner.id,
                target: add.id,
                amount: actual,
                crit,
                skill: 'Projectile',
              });

              if (!add.alive) {
                gs.addEvent({ type: 'add_killed', addId: add.id, killer: owner.id });
              }
            }
            if (!proj.piercing) proj.alive = false;
            break;
          }
        }
      }

      // Check hit on players (boss projectile)
      if (proj.type === 'boss_projectile') {
        for (const player of gs.getAlivePlayers()) {
          const dist = Math.hypot(proj.x - player.x, proj.y - player.y);
          if (dist < proj.radius + player.radius) {
            const actual = player.takeDamage(proj.damage || 100, gs.boss);
            if (actual > 0) {
              gs.addEvent({
                type: 'damage',
                source: gs.boss.id,
                target: player.id,
                amount: actual,
                skill: 'Projectile',
              });
            }
            if (!proj.piercing) proj.alive = false;
            break;
          }
        }
      }
    }

    // Cleanup dead projectiles
    gs.projectiles = gs.projectiles.filter(p => p.alive);
  }

  _calcProjectileDamage(attacker, proj, defender) {
    let damage = attacker.atk * (proj.power / 100);
    damage *= 100 / (100 + (defender.def || 0));

    let crit = false;
    const critChance = Math.min(100, Math.max(0, attacker.crit - (defender.res || 0) * 0.5));
    if (Math.random() * 100 < critChance) {
      crit = true;
      damage *= 1.5;
    }

    damage *= 0.95 + Math.random() * 0.1;
    return { damage: Math.max(1, Math.round(damage)), crit };
  }

  updateAoeZones(gs, dt) {
    for (const zone of gs.aoeZones) {
      zone.ttl -= dt;

      // Player-placed AoE with delayed detonation
      if (zone._detonateAt !== undefined && !zone._detonated) {
        zone._detonateAt -= dt;
        if (zone._detonateAt <= 0) {
          zone._detonated = true;
          zone.active = true;
          // Hit boss
          if (gs.boss.alive) {
            const dist = Math.hypot(gs.boss.x - zone.x, gs.boss.y - zone.y);
            if (dist < zone.radius + gs.boss.radius) {
              const owner = gs.getPlayer(zone.owner);
              if (owner) {
                const { damage, crit } = this._calcProjectileDamage(owner, zone, gs.boss);
                const actual = gs.boss.takeDamage(damage);
                owner.stats.damageDealt += actual;
                gs.addAggro(owner.id, actual * owner.aggroMult);

                gs.addEvent({
                  type: 'damage',
                  source: owner.id,
                  target: gs.boss.id,
                  amount: actual,
                  crit,
                  skill: 'AoE',
                });
              }
            }
          }
        }
      }

      // Traps
      if (zone.type === 'trap' && zone.active && !zone._triggered) {
        if (gs.boss.alive) {
          const dist = Math.hypot(gs.boss.x - zone.x, gs.boss.y - zone.y);
          if (dist < zone.radius + gs.boss.radius) {
            zone._triggered = true;
            zone.ttl = 0.3; // Brief explosion
            const owner = gs.getPlayer(zone.owner);
            if (owner) {
              const { damage, crit } = this._calcProjectileDamage(owner, zone, gs.boss);
              const actual = gs.boss.takeDamage(damage);
              owner.stats.damageDealt += actual;
              gs.addAggro(owner.id, actual * owner.aggroMult);

              gs.addEvent({
                type: 'damage',
                source: owner.id,
                target: gs.boss.id,
                amount: actual,
                crit,
                skill: 'Piège',
              });
            }
          }
        }
      }

      // Heal zone ticking (healer ground zone)
      if (zone.type === 'heal_zone' && zone.active) {
        zone._healTimer = (zone._healTimer || 0) + dt;
        if (zone._healTimer >= zone._healInterval) {
          zone._healTimer -= zone._healInterval;
          const owner = gs.getPlayer(zone.owner);

          for (const player of gs.getAlivePlayers()) {
            const dist = Math.hypot(player.x - zone.x, player.y - zone.y);
            if (dist < zone.radius + player.radius) {
              const healPerTick = Math.round(zone.healPower / zone.healTicks);
              const healed = player.heal(healPerTick);
              if (healed > 0 && owner) {
                owner.stats.healingDone += healed;
                gs.addAggro(owner.id, healed * AGGRO.HEAL_TO_AGGRO * (owner.aggroMult || 1));

                gs.addEvent({
                  type: 'heal',
                  source: owner.id,
                  target: player.id,
                  amount: healed,
                  skill: 'Cercle de Soin',
                });
              }
            }
          }
        }
      }

      // Laser tick damage on players (yellow single + red triple)
      if ((zone.type === 'laser' || zone.type === 'laser_red') && zone.active && zone.damagePerTick) {
        zone._tickTimer = (zone._tickTimer || 0) - dt;
        if (zone._tickTimer <= 0) {
          zone._tickTimer = zone.tickInterval || 0.2;

          for (const player of gs.getAlivePlayers()) {
            if (this._isInLaser(player, zone)) {
              const actual = player.takeDamage(zone.damagePerTick, gs.boss);
              if (actual > 0) {
                gs.addEvent({
                  type: 'damage',
                  source: gs.boss.id,
                  target: player.id,
                  amount: actual,
                  skill: 'Laser',
                });
              }
            }
          }
        }
      }

      // Fire wave — expanding circle tick damage (Menacing Wave)
      if (zone.type === 'fire_wave' && zone.active && zone.damagePerTick) {
        zone._tickTimer = (zone._tickTimer || 0) - dt;
        if (zone._tickTimer <= 0) {
          zone._tickTimer = zone.tickInterval || 0.15;

          for (const player of gs.getAlivePlayers()) {
            const dist = Math.hypot(player.x - zone.x, player.y - zone.y);
            if (dist < zone.radius + player.radius) {
              const actual = player.takeDamage(zone.damagePerTick, gs.boss);
              if (actual > 0) {
                gs.addEvent({
                  type: 'damage',
                  source: gs.boss.id,
                  target: player.id,
                  amount: actual,
                  skill: 'Vague de Feu',
                });
              }
            }
          }
        }
      }
    }

    // Cleanup expired zones
    gs.aoeZones = gs.aoeZones.filter(z => z.ttl > 0);
  }

  _isInLaser(player, zone) {
    // Check if player is within the laser line
    const laserEndX = zone.x + Math.cos(zone.angle) * zone.radius;
    const laserEndY = zone.y + Math.sin(zone.angle) * zone.radius;
    const halfWidth = (zone.lineWidth || 40) / 2;

    const dist = this._pointToLineDist(player.x, player.y, zone.x, zone.y, laserEndX, laserEndY);
    return dist < halfWidth + player.radius;
  }

  _pointToLineDist(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(px - x1, py - y1);

    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }

  checkCollisions(gs, combat, dt) {
    // Boss AoE zones that damage players on tick (poison clouds, etc.)
    for (const zone of gs.aoeZones) {
      // Poison cloud tick damage
      if (zone.type === 'poison_cloud' && zone.active) {
        zone._poisonTick = (zone._poisonTick || 0) - dt;
        if (zone._poisonTick <= 0) {
          zone._poisonTick = zone._poisonInterval || 2.0;
          for (const player of gs.getAlivePlayers()) {
            const dist = Math.hypot(player.x - zone.x, player.y - zone.y);
            if (dist < zone.radius + player.radius) {
              // Apply/refresh poison debuff (tick damage handled by CombatEngine.updatePlayerBuffs)
              player.addBuff({
                type: 'poison', stacks: 1, dur: 6,
                tickInterval: 2.0, damage: 300,
                stackable: true, maxStacks: 5, source: 'poison_cloud',
              });
            }
          }
        }
      }
    }
  }
}
