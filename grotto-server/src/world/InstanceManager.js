import { INSTANCE, SERVER } from '../config.js';
import { GrottoInstance } from '../engine/GameLoop.js';

export class InstanceManager {
  constructor() {
    this.instances = new Map();    // instanceId -> GrottoInstance
    this.playerToInstance = new Map(); // playerId -> instanceId
    this.nextInstanceId = 1;
    this.tickInterval = null;
  }

  // Find an instance with room, or create a new one
  getOrCreateInstance() {
    // Find instance with available slots
    for (const [id, instance] of this.instances) {
      if (instance.playerCount < INSTANCE.MAX_PLAYERS) {
        return instance;
      }
    }

    // All full — create new instance
    if (this.instances.size >= INSTANCE.MAX_INSTANCES) {
      return null; // Server full
    }

    const id = this.nextInstanceId++;
    const instance = new GrottoInstance(id, () => {});
    this.instances.set(id, instance);
    console.log(`[InstanceManager] Created instance #${id} (total: ${this.instances.size})`);
    return instance;
  }

  addPlayer(username, hunterId, level) {
    const instance = this.getOrCreateInstance();
    if (!instance) return null;

    const player = instance.addPlayer(username, hunterId, level);
    this.playerToInstance.set(player.id, instance.id);
    console.log(`[InstanceManager] ${username} joined instance #${instance.id} (${instance.playerCount}/${INSTANCE.MAX_PLAYERS})`);
    return { player, instance };
  }

  removePlayer(playerId) {
    const instanceId = this.playerToInstance.get(playerId);
    if (!instanceId) return;

    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.removePlayer(playerId);
      console.log(`[InstanceManager] Player left instance #${instanceId} (${instance.playerCount}/${INSTANCE.MAX_PLAYERS})`);

      // Clean up empty instances (keep at least 1)
      if (instance.playerCount === 0 && this.instances.size > 1) {
        this.instances.delete(instanceId);
        console.log(`[InstanceManager] Removed empty instance #${instanceId}`);
      }
    }
    this.playerToInstance.delete(playerId);
  }

  getInstance(playerId) {
    const instanceId = this.playerToInstance.get(playerId);
    return instanceId ? this.instances.get(instanceId) : null;
  }

  // Start the global tick loop
  start() {
    if (this.tickInterval) return;
    const dt = SERVER.TICK_MS / 1000;
    this.tickInterval = setInterval(() => {
      for (const instance of this.instances.values()) {
        instance.tick(dt);
      }
    }, SERVER.TICK_MS);
    console.log(`[InstanceManager] Tick loop started (${SERVER.TICK_RATE} TPS)`);
  }

  stop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  getStatus() {
    return {
      instances: this.instances.size,
      totalPlayers: this.playerToInstance.size,
      details: [...this.instances.values()].map(i => ({
        id: i.id,
        players: i.playerCount,
        mobs: i.mobs.size,
      })),
    };
  }
}
