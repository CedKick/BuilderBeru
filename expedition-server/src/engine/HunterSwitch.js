// ─── HunterSwitch ─────────────────────────────────────────
// Manages input routing for the 1-6 key hunter switch system.
// Each player controls 6 hunters, only 1 active at a time.
// Non-active hunters run BotAI.

export class HunterSwitch {
  constructor() {
    // Map: playerId → { hunters: [hunterId × 6], activeIndex: 0 }
    this.playerSlots = new Map();
  }

  // Register a player's 6 hunters
  registerPlayer(playerId, hunterIds) {
    this.playerSlots.set(playerId, {
      hunters: hunterIds,
      activeIndex: 0,  // Start controlling hunter 1
    });
  }

  // Switch to hunter at slot index (0-5)
  switchTo(playerId, slotIndex) {
    const slot = this.playerSlots.get(playerId);
    if (!slot) return null;
    if (slotIndex < 0 || slotIndex >= slot.hunters.length) return null;

    const prevHunterId = slot.hunters[slot.activeIndex];
    slot.activeIndex = slotIndex;
    const newHunterId = slot.hunters[slotIndex];

    return { prevHunterId, newHunterId };
  }

  // Get the currently controlled hunter ID for a player
  getActiveHunterId(playerId) {
    const slot = this.playerSlots.get(playerId);
    if (!slot) return null;
    return slot.hunters[slot.activeIndex];
  }

  // Get all hunter IDs for a player
  getHunterIds(playerId) {
    const slot = this.playerSlots.get(playerId);
    return slot ? slot.hunters : [];
  }

  // Check if a hunter is currently player-controlled
  isPlayerControlled(hunterId) {
    for (const [, slot] of this.playerSlots) {
      if (slot.hunters[slot.activeIndex] === hunterId) return true;
    }
    return false;
  }

  // Get which player owns a given hunter
  getOwnerPlayerId(hunterId) {
    for (const [playerId, slot] of this.playerSlots) {
      if (slot.hunters.includes(hunterId)) return playerId;
    }
    return null;
  }

  // Route input from player to their active hunter
  routeInput(playerId, input) {
    const activeId = this.getActiveHunterId(playerId);
    if (!activeId) return null;
    return { hunterId: activeId, input };
  }
}
