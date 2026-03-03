import { LOOT } from '../config.js';
import { getLootTable } from '../data/lootTables.js';
import { getItemById } from '../data/expeditionItems.js';
import { getSetById } from '../data/expeditionSets.js';
import { getWeaponById } from '../data/expeditionWeapons.js';
import { rollEssenceDrop } from '../data/essenceSystem.js';

// ── Loot Engine ──
// Handles drop rolling, SR priority, /100 rolls, wipe steal, and essence drops.

export class LootEngine {

  // ═══════════════════════════════════════════════════════
  // Roll drops from a loot table
  // Returns: [{ itemId, itemName, rarity, binding, type, slot, stats, setId?, weaponId? }]
  // ═══════════════════════════════════════════════════════
  static rollDrops(lootTableId) {
    const table = getLootTable(lootTableId);
    if (!table.length) return [];

    const drops = [];
    for (const entry of table) {
      const roll = Math.random() * 100;
      if (roll < entry.dropChance) {
        // Set piece drop — resolve from expeditionSets
        if (entry.setId) {
          const set = getSetById(entry.setId);
          if (set) {
            drops.push({
              itemId: entry.itemId,
              itemName: `Piece: ${set.name}`,
              rarity: set.rarity,
              binding: set.binding,
              type: 'set_piece',
              slot: null,
              stats: {},
              setId: entry.setId,
            });
          }
          continue;
        }

        // Weapon drop — resolve from expeditionWeapons
        if (entry.weaponId) {
          const weapon = getWeaponById(entry.weaponId);
          if (weapon) {
            drops.push({
              itemId: entry.itemId,
              itemName: weapon.name,
              rarity: weapon.rarity,
              binding: weapon.binding,
              type: 'weapon',
              slot: 'weapon',
              stats: { atk_flat: weapon.atk, ...(weapon.bonus || {}) },
              weaponId: entry.weaponId,
            });
          }
          continue;
        }

        // Regular item — resolve from expeditionItems
        const item = getItemById(entry.itemId);
        if (item) {
          drops.push({
            itemId: item.id,
            itemName: item.name,
            rarity: item.rarity,
            binding: item.binding,
            type: item.type,
            slot: item.slot || null,
            stats: item.stats || {},
            setId: item.setId || null,
          });
        }
      }
    }
    return drops;
  }

  // ═══════════════════════════════════════════════════════
  // Roll essence drops from killed mobs/boss
  // mobKills: [{ templateKey, elite }], isBoss: boolean
  // Returns: { guerre: N, arcanique: N, gardienne: N }
  // ═══════════════════════════════════════════════════════
  static rollEssenceDrops(mobKills, isBoss = false) {
    const essences = { guerre: 0, arcanique: 0, gardienne: 0 };

    if (isBoss) {
      const drop = rollEssenceDrop(null, false, true);
      if (drop) essences[drop.type] += drop.amount;
    }

    for (const mob of mobKills) {
      const drop = rollEssenceDrop(mob.templateKey, mob.elite || false, false);
      if (drop) essences[drop.type] += drop.amount;
    }

    return essences;
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
