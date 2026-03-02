import { LOOT } from '../config.js';
import { getLootTable } from '../data/lootTables.js';
import { getItemById } from '../data/expeditionItems.js';

// ── Loot Engine ──
// Handles drop rolling, SR priority, /100 rolls, and wipe steal penalties.

export class LootEngine {

  // ═══════════════════════════════════════════════════════
  // Roll drops from a loot table
  // Returns: [{ itemId, itemName, rarity, binding }]
  // ═══════════════════════════════════════════════════════
  static rollDrops(lootTableId) {
    const table = getLootTable(lootTableId);
    if (!table.length) return [];

    const drops = [];
    for (const entry of table) {
      const roll = Math.random() * 100;
      if (roll < entry.dropChance) {
        const item = getItemById(entry.itemId);
        if (item) {
          drops.push({
            itemId: item.id,
            itemName: item.name,
            rarity: item.rarity,
            binding: item.binding,
            type: item.type,
          });
        }
      }
    }
    return drops;
  }

  // ═══════════════════════════════════════════════════════
  // Distribute drops among players
  // srSelections: Map<username, itemId>
  // alivePlayers: [{ username }] — only alive players can roll
  // isWipe: boolean — enables steal mechanic
  // Returns: [LootResult]
  // ═══════════════════════════════════════════════════════
  static distributeLoot(drops, srSelections, alivePlayers, isWipe = false) {
    const results = [];

    for (const drop of drops) {
      // Check for wipe steal
      if (isWipe) {
        const stealChance = LOOT.WIPE_STEAL_CHANCE_MIN +
          Math.random() * (LOOT.WIPE_STEAL_CHANCE_MAX - LOOT.WIPE_STEAL_CHANCE_MIN);
        if (Math.random() < stealChance) {
          results.push({
            ...drop,
            stolen: true,
            winnerUsername: null,
            winnerRoll: null,
            srWinner: false,
            rolls: [],
          });
          continue;
        }
      }

      // Find SR holders for this item
      const srHolders = [];
      for (const [username, srItemId] of srSelections) {
        if (srItemId === drop.itemId && alivePlayers.some(p => p.username === username)) {
          srHolders.push(username);
        }
      }

      // Determine who rolls
      const rollers = srHolders.length > 0
        ? srHolders
        : alivePlayers.map(p => p.username);

      if (rollers.length === 0) {
        // No one to roll (shouldn't happen but safety)
        results.push({
          ...drop,
          stolen: false,
          winnerUsername: null,
          winnerRoll: null,
          srWinner: false,
          rolls: [],
        });
        continue;
      }

      // Roll /100 for each eligible player
      const rolls = rollers.map(username => ({
        username,
        rollValue: Math.floor(Math.random() * LOOT.ROLL_MAX) + 1,
        hadSr: srHolders.includes(username),
      }));

      // Sort by roll value descending
      rolls.sort((a, b) => b.rollValue - a.rollValue);

      const winner = rolls[0];

      results.push({
        ...drop,
        stolen: false,
        winnerUsername: winner.username,
        winnerRoll: winner.rollValue,
        srWinner: winner.hadSr,
        rolls,
      });
    }

    return results;
  }
}
