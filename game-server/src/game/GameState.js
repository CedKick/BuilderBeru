import { ARENA, BOSS as BOSS_CFG, PLAYER } from '../config.js';
import { Player } from '../entities/Player.js';
import { createBoss } from '../bosses/BossFactory.js';

export class GameState {
  constructor(playerDefs, difficulty, simulation = false) {
    this.difficulty = difficulty;
    this.playerCount = playerDefs.length;
    this.timer = BOSS_CFG.ENRAGE_TIMER; // 10 min countdown
    this.simulation = simulation; // God mode - can't die

    // Spawn players in a semicircle at bottom of arena
    this.players = playerDefs.map((def, i) => {
      const angle = Math.PI + (Math.PI / (playerDefs.length + 1)) * (i + 1);
      const spawnX = ARENA.WIDTH / 2 + Math.cos(angle) * 300;
      const spawnY = ARENA.HEIGHT / 2 + 250 + Math.sin(angle) * 100;
      return new Player(def.id, def.username, def.class, spawnX, spawnY, def.colosseumData);
    });

    // Boss spawns center-top of arena
    this.boss = createBoss('manaya', difficulty, ARENA.WIDTH / 2, ARENA.HEIGHT / 2 - 150);

    // Scale boss HP by player count
    const scale = BOSS_CFG.PLAYER_SCALE[Math.min(this.playerCount, 5)] || 1.0;
    this.boss.maxHp = Math.floor(this.boss.maxHp * scale);
    this.boss.hp = this.boss.maxHp;
    this.boss.playerCount = this.playerCount;

    // Aggro table: playerId -> aggro value
    this.aggro = new Map();
    for (const p of this.players) {
      this.aggro.set(p.id, 0);
    }

    // Active projectiles and AoE zones
    this.projectiles = [];
    this.aoeZones = [];

    // Hunters (summoned by players)
    this.hunters = [];

    // Adds (minions spawned during fight)
    this.adds = [];

    // Event queue for broadcasting
    this.events = [];
  }

  getPlayer(id) {
    return this.players.find(p => p.id === id) || null;
  }

  getAlivePlayers() {
    return this.players.filter(p => p.alive);
  }

  getHighestAggroPlayer() {
    let highest = null;
    let maxAggro = -1;
    for (const player of this.getAlivePlayers()) {
      const aggro = this.aggro.get(player.id) || 0;
      if (aggro > maxAggro) {
        maxAggro = aggro;
        highest = player;
      }
    }
    return highest;
  }

  addAggro(playerId, amount) {
    const current = this.aggro.get(playerId) || 0;
    this.aggro.set(playerId, current + amount);
  }

  addProjectile(proj) {
    this.projectiles.push(proj);
  }

  addAoeZone(zone) {
    this.aoeZones.push(zone);
  }

  addEvent(event) {
    this.events.push(event);
  }

  addAdd(add) {
    this.adds.push(add);
  }

  getAliveAdds() {
    return this.adds.filter(a => a.alive);
  }

  // Remove expired projectiles and zones
  cleanup() {
    this.projectiles = this.projectiles.filter(p => p.alive);
    this.aoeZones = this.aoeZones.filter(z => z.ttl > 0);
    this.hunters = this.hunters.filter(h => h.alive);
    this.adds = this.adds.filter(a => a.alive);
  }
}
