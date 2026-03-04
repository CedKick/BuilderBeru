import { LOOT } from '../config.js';
import { getLootTable } from '../data/lootTables.js';
import { getItemById } from '../data/expeditionItems.js';
import { getSetById } from '../data/expeditionSets.js';
import { getWeaponById } from '../data/expeditionWeapons.js';
import { getUniqueById } from '../data/expeditionUniques.js';
import { rollEssenceDrop } from '../data/essenceSystem.js';

// ── Loot Engine ──
// Handles drop rolling, SR priority, /100 rolls, wipe steal, and essence drops.

export class LootEngine {

  // ═══════════════════════════════════════════════════════
  // Generate boss loot by bossId (1-15)
  // Uses codex name/rarity as primary source, enriches with full stats from source files
  // Each loot rolls independently — can return 0 to N items (multi-drop)
  // Returns: [{ itemId, itemName, rarity, binding, type, slot, stats, dropChance, ... }]
  // ═══════════════════════════════════════════════════════
  static generateBossLoot(bossId) {
    if (bossId < 1 || bossId > 15) return [];

    // 1. Retrieve boss loot table from codex
    const table = getLootTable(`boss_${bossId}`);
    if (!table.length) return [];

    // 2. Roll each loot independently against dropChance
    //    Roll the entire table QUANTITY_MULTIPLIER times for more drops
    //    Endgame bosses (8+) get extra rolls for reinforced loot
    const drops = [];
    const baseRolls = LOOT.QUANTITY_MULTIPLIER || 1;
    const rolls = bossId >= 8 ? baseRolls + 1 : baseRolls;
    for (let r = 0; r < rolls; r++) {
      for (const entry of table) {
        const roll = Math.random() * 100;
        if (roll >= entry.dropChance) continue;

        // 3. Resolve full item data (codex name/rarity + source file stats)
        const drop = LootEngine._resolveDropEntry(entry);
        if (drop) drops.push(drop);
      }
    }

    return drops;
  }

  // ═══════════════════════════════════════════════════════
  // Resolve a single loot table entry into a complete drop object
  // Prioritizes codex name/rarity, enriches with stats from source files
  // ═══════════════════════════════════════════════════════
  static _resolveDropEntry(entry) {
    // Set piece — resolve from expeditionSets
    if (entry.setId) {
      const set = getSetById(entry.setId);
      if (!set) return null;
      return {
        itemId: entry.itemId,
        itemName: entry.name || `Piece: ${set.name}`,
        rarity: entry.rarity || set.rarity,
        binding: set.binding,
        type: 'set_piece',
        slot: null,
        stats: set.bonus2pc || {},
        setId: entry.setId,
        setName: set.name,
        dropChance: entry.dropChance,
      };
    }

    // Unique artifact — resolve from expeditionUniques
    if (entry.uniqueId) {
      const uniq = getUniqueById(entry.uniqueId);
      if (!uniq) return null;
      return {
        itemId: entry.itemId,
        itemName: entry.name || uniq.name,
        rarity: entry.rarity || uniq.rarity,
        binding: uniq.binding,
        type: 'unique',
        slot: uniq.slot,
        stats: uniq.stats || {},
        uniqueId: entry.uniqueId,
        dropChance: entry.dropChance,
      };
    }

    // Weapon — resolve from expeditionWeapons
    if (entry.weaponId) {
      const weapon = getWeaponById(entry.weaponId);
      if (!weapon) return null;
      return {
        itemId: entry.itemId,
        itemName: entry.name || weapon.name,
        rarity: entry.rarity || weapon.rarity,
        binding: weapon.binding,
        type: 'weapon',
        slot: 'weapon',
        stats: { atk_flat: weapon.atk, ...(weapon.bonus || {}) },
        weaponId: entry.weaponId,
        passive: weapon.passive || null,
        dropChance: entry.dropChance,
      };
    }

    // Regular item — resolve from expeditionItems
    const item = getItemById(entry.itemId);
    if (!item) return null;
    return {
      itemId: item.id,
      itemName: entry.name || item.name,
      rarity: entry.rarity || item.rarity,
      binding: item.binding,
      type: item.type,
      slot: item.slot || null,
      stats: item.stats || {},
      setId: item.setId || null,
      description: item.description || null,
      dropChance: entry.dropChance,
    };
  }

  // ═══════════════════════════════════════════════════════
  // Roll drops from any loot table (boss or mob wave) by tableId
  // Used internally by ExpeditionEngine for encounter.lootTableId
  // Returns: [{ itemId, itemName, rarity, binding, type, slot, stats, ... }]
  // ═══════════════════════════════════════════════════════
  static rollDrops(lootTableId) {
    const table = getLootTable(lootTableId);
    if (!table.length) return [];

    const drops = [];
    for (const entry of table) {
      const roll = Math.random() * 100;
      if (roll >= entry.dropChance) continue;

      const drop = LootEngine._resolveDropEntry(entry);
      if (drop) drops.push(drop);
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
    const mult = LOOT.QUANTITY_MULTIPLIER || 1;

    if (isBoss) {
      const drop = rollEssenceDrop(null, false, true);
      if (drop) essences[drop.type] += drop.amount * mult;
    }

    for (const mob of mobKills) {
      const drop = rollEssenceDrop(mob.templateKey, mob.elite || false, false);
      if (drop) essences[drop.type] += drop.amount * mult;
    }

    return essences;
  }

  // ═══════════════════════════════════════════════════════
  // Roll shared trash mob drops (currencies) — per mob killed
  // These are distributed equally to ALL alive players (no roll)
  // tier: 1-4 (scales with zone progression)
  // Returns: { alkahest: N, marteau_rouge: N, contribution: N }
  // ═══════════════════════════════════════════════════════
  static rollTrashDrops(mobKillCount, tier = 1) {
    const totals = { alkahest: 0, marteau_rouge: 0, contribution: 0 };

    // Drop chances (%) per mob, scale by tier
    const chances = {
      alkahest:       [5,  7,  8, 10][tier - 1] || 5,
      marteau_rouge:  [3,  4,  6,  8][tier - 1] || 3,
      contribution:   [15, 18, 20, 25][tier - 1] || 15,
    };

    // Amounts per successful drop, scale by tier
    const amounts = {
      alkahest:       [1, 1, 2, 2][tier - 1] || 1,
      marteau_rouge:  [1, 1, 1, 2][tier - 1] || 1,
      contribution:   [5, 8, 12, 18][tier - 1] || 5,
    };

    const mult = LOOT.QUANTITY_MULTIPLIER || 1;
    for (let i = 0; i < mobKillCount; i++) {
      for (const currency of ['alkahest', 'marteau_rouge', 'contribution']) {
        if (Math.random() * 100 < chances[currency]) {
          totals[currency] += amounts[currency] * mult;
        }
      }
    }

    return totals;
  }

  // ═══════════════════════════════════════════════════════
  // Distribute drops among players
  // srSelections: Map<username, itemId[]> — each player's SR picks (array)
  // alivePlayers: [{ username }] — only alive players can roll
  // isWipe: boolean — enables steal mechanic
  // Returns: [LootResult] with narrative reactions
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
            narrative: LootEngine._narrativeStolen(drop),
          });
          continue;
        }
      }

      // Find SR holders for this item (srSelections values are arrays)
      const srHolders = [];
      for (const [username, srItemIds] of srSelections) {
        const ids = Array.isArray(srItemIds) ? srItemIds : [srItemIds];
        if (ids.includes(drop.itemId) && alivePlayers.some(p => p.username === username)) {
          srHolders.push(username);
        }
      }

      // Determine who rolls
      const rollers = srHolders.length > 0
        ? srHolders
        : alivePlayers.map(p => p.username);

      if (rollers.length === 0) {
        results.push({
          ...drop,
          stolen: false,
          winnerUsername: null,
          winnerRoll: null,
          srWinner: false,
          rolls: [],
          narrative: null,
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
      const losers = rolls.slice(1);

      results.push({
        ...drop,
        stolen: false,
        winnerUsername: winner.username,
        winnerRoll: winner.rollValue,
        srWinner: winner.hadSr,
        rolls,
        narrative: LootEngine._narrativeWin(drop, winner, losers, srHolders),
      });
    }

    return results;
  }

  // ═══════════════════════════════════════════════════════
  // Narrative flavor text generation
  // ═══════════════════════════════════════════════════════

  static _narrativeStolen(drop) {
    const lines = [
      `Les monstres s'enfuient avec [${drop.itemName}]... Personne n'a pu le recuperer!`,
      `Un ennemi sournois a arrache [${drop.itemName}] des decombres!`,
      `[${drop.itemName}] disparait dans l'obscurite... Vole par les creatures!`,
      `"NON!" — Trop tard, [${drop.itemName}] est perdu a jamais.`,
    ];
    return { type: 'stolen', text: lines[Math.floor(Math.random() * lines.length)] };
  }

  static _narrativeWin(drop, winner, losers, srHolders) {
    const isHighRarity = ['legendary', 'mythique', 'epic'].includes(drop.rarity);
    const isLowRoll = winner.rollValue <= 15;
    const isHighRoll = winner.rollValue >= 90;
    const hadSr = winner.hadSr;
    const jealousLoser = losers.length > 0 ? losers[Math.floor(Math.random() * losers.length)] : null;
    const reactions = [];

    // Winner reaction
    if (isHighRarity && isHighRoll) {
      reactions.push({ username: winner.username, type: 'ecstatic', text: pick([
        `${winner.username} EXPLOSE DE JOIE! ${winner.rollValue}/100 sur [${drop.itemName}]!`,
        `"C'EST A MOI!" ${winner.username} brandit [${drop.itemName}] fièrement! (${winner.rollValue})`,
        `${winner.username} ne peut pas y croire... ${winner.rollValue} sur [${drop.itemName}]! LEGENDAIRE!`,
      ])});
    } else if (isHighRarity && isLowRoll) {
      reactions.push({ username: winner.username, type: 'lucky', text: pick([
        `${winner.username} vole [${drop.itemName}] avec un miserable ${winner.rollValue}... La chance du debutant!`,
        `"${winner.rollValue}?! Et ca passe?!" ${winner.username} ramasse [${drop.itemName}] en tremblant.`,
        `Roll de ${winner.rollValue} sur [${drop.itemName}]... ${winner.username} transpire mais c'est suffisant!`,
      ])});
    } else if (hadSr) {
      reactions.push({ username: winner.username, type: 'sr_win', text: pick([
        `La patience de ${winner.username} est recompensee! SR [${drop.itemName}] obtenu! (${winner.rollValue})`,
        `${winner.username} avait SR [${drop.itemName}] et roll ${winner.rollValue}! Strategie payante!`,
        `"Je l'avais reserve pour une bonne raison!" — ${winner.username} obtient [${drop.itemName}]`,
      ])});
    } else {
      reactions.push({ username: winner.username, type: 'win', text: pick([
        `${winner.username} remporte [${drop.itemName}] avec ${winner.rollValue}!`,
        `[${drop.itemName}] va a ${winner.username} (${winner.rollValue}/100)`,
      ])});
    }

    // Jealousy / loser reaction
    if (jealousLoser && isHighRarity) {
      const diff = winner.rollValue - jealousLoser.rollValue;
      if (diff <= 5) {
        reactions.push({ username: jealousLoser.username, type: 'salty', text: pick([
          `${jealousLoser.username} (${jealousLoser.rollValue}) rage silencieusement... ${diff} point${diff > 1 ? 's' : ''} de difference!`,
          `"SEULEMENT ${diff} de difference?!" ${jealousLoser.username} fixe [${drop.itemName}] avec douleur.`,
          `${jealousLoser.username} serre les poings. ${jealousLoser.rollValue} vs ${winner.rollValue}... Si proche!`,
        ])});
      } else if (jealousLoser.hadSr) {
        reactions.push({ username: jealousLoser.username, type: 'sr_lost', text: pick([
          `${jealousLoser.username} avait SR [${drop.itemName}] mais roll ${jealousLoser.rollValue}... Destin cruel!`,
          `"J'avais SR ca!" — ${jealousLoser.username} regarde [${drop.itemName}] s'envoler (${jealousLoser.rollValue})`,
        ])});
      } else {
        reactions.push({ username: jealousLoser.username, type: 'jealous', text: pick([
          `${jealousLoser.username} detourne le regard... "${winner.rollValue}? Pff, pas besoin de ce truc."`,
          `${jealousLoser.username} felicite ${winner.username}... mais on sent l'amertume.`,
        ])});
      }
    }

    // Group reaction for mythique drops
    if (drop.rarity === 'mythique') {
      reactions.push({ type: 'group', text: pick([
        `Le groupe entier retient son souffle... Un objet MYTHIQUE!`,
        `Tout le monde se rapproche pour voir [${drop.itemName}]... C'est magnifique!`,
        `Un silence religieux s'installe devant [${drop.itemName}]...`,
      ])});
    }

    return {
      type: isHighRarity ? 'epic_moment' : 'normal',
      winnerReaction: reactions[0]?.text || null,
      reactions,
    };
  }
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
