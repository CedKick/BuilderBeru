// ── Forge Engine (Ragnaros) ──
// 1. Craft Ragnaros Set pieces (spend feathers)
// 2. Reroll artifact substats (spend alkahest)

import {
  RAGNAROS_SET_PIECES, RAGNAROS_FEATHER_COST,
  SUB_STAT_POOL, GEAR_TIERS,
} from './raidGearData.js';

// ══════════════════════════════════════════════
// FORGE: Craft Ragnaros Set T12 pieces
// ══════════════════════════════════════════════

/**
 * Craft a Ragnaros set piece
 * @param {string} slotId - 'weapon' | 'helmet' | 'chest' | etc.
 * @param {number} feathers - player's current feather count
 * @param {Object} inventory - player's current inventory { ragnarosSet: { weapon: bool, ... } }
 * @returns {{ success, piece, featherCost, error }}
 */
export function craftRagnarosSetPiece(slotId, feathers, inventory) {
  const piece = RAGNAROS_SET_PIECES[slotId];
  if (!piece) return { success: false, error: 'Invalid slot' };

  // Check if already owned
  if (inventory?.ragnarosSet?.[slotId]) {
    return { success: false, error: 'Already crafted' };
  }

  const cost = RAGNAROS_FEATHER_COST[slotId];
  if (!cost) return { success: false, error: 'Invalid slot cost' };

  if (feathers < cost) {
    return { success: false, error: `Need ${cost} feathers (have ${feathers})` };
  }

  return {
    success: true,
    piece: { ...piece },
    featherCost: cost,
    feathersRemaining: feathers - cost,
  };
}

/**
 * Get forge status: which pieces are craftable, costs, owned
 */
export function getForgeStatus(feathers, inventory) {
  const slots = Object.keys(RAGNAROS_SET_PIECES);
  const status = [];

  for (const slotId of slots) {
    const piece = RAGNAROS_SET_PIECES[slotId];
    const cost = RAGNAROS_FEATHER_COST[slotId];
    const owned = !!inventory?.ragnarosSet?.[slotId];
    const affordable = feathers >= cost;

    status.push({
      slotId,
      name: piece.name,
      cost,
      owned,
      affordable: !owned && affordable,
      piece: owned ? piece : null,
    });
  }

  const totalCost = Object.values(RAGNAROS_FEATHER_COST).reduce((a, b) => a + b, 0);
  const ownedCount = status.filter(s => s.owned).length;

  return { slots: status, feathers, totalCost, ownedCount, totalSlots: slots.length };
}

// ══════════════════════════════════════════════
// ALKAHEST: Reroll artifact substats
// ══════════════════════════════════════════════

// Reroll cost scales with tier
const REROLL_BASE_COST = 5;
const REROLL_TIER_MULT = {
  T0: 1, T1: 1, T2: 2, T3: 3, T4: 4, T5: 5,
  T6: 7, T7: 10, T8: 14, T9: 20, T10: 28, T11: 40,
};

/**
 * Get alkahest cost to reroll an artifact's substats
 */
export function getRerollCost(artifact) {
  if (!artifact?.tier) return 0;
  const mult = REROLL_TIER_MULT[artifact.tier] || 1;
  return REROLL_BASE_COST * mult;
}

/**
 * Reroll an artifact's substats (keeps main stat, re-randomizes subs)
 * @param {Object} artifact - the artifact to reroll
 * @param {number} alkahest - player's current alkahest count
 * @returns {{ success, artifact, alkahestCost, error }}
 */
export function rerollArtifactSubs(artifact, alkahest) {
  if (!artifact) return { success: false, error: 'No artifact' };
  if (artifact.isRagnarosSet) return { success: false, error: 'Cannot reroll set pieces' };

  const cost = getRerollCost(artifact);
  if (alkahest < cost) {
    return { success: false, error: `Need ${cost} alkahest (have ${alkahest})` };
  }

  const t = GEAR_TIERS[artifact.tier] || GEAR_TIERS.T0;
  const mainStatId = artifact.mainStat?.id;

  // Re-generate substats
  const numSubs = artifact.subs?.length || 1;
  const availableSubs = SUB_STAT_POOL.filter(s => s.id !== mainStatId);
  const newSubs = [];
  const usedIds = new Set();

  for (let i = 0; i < numSubs && availableSubs.length > 0; i++) {
    const pool = availableSubs.filter(s => !usedIds.has(s.id));
    if (pool.length === 0) break;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    usedIds.add(pick.id);
    const value = Math.round(
      (pick.range[0] + Math.random() * (pick.range[1] - pick.range[0])) * t.statMult
    );
    newSubs.push({ id: pick.id, label: pick.label, value });
  }

  const rerolledArtifact = {
    ...artifact,
    subs: newSubs,
    rerollCount: (artifact.rerollCount || 0) + 1,
  };

  return {
    success: true,
    artifact: rerolledArtifact,
    alkahestCost: cost,
    alkahestRemaining: alkahest - cost,
  };
}

/**
 * Lock a specific substat (costs extra alkahest, locked sub won't change on reroll)
 */
export function rerollWithLock(artifact, alkahest, lockIndex) {
  if (!artifact) return { success: false, error: 'No artifact' };
  if (artifact.isRagnarosSet) return { success: false, error: 'Cannot reroll set pieces' };
  if (lockIndex < 0 || lockIndex >= (artifact.subs?.length || 0)) {
    return { success: false, error: 'Invalid lock index' };
  }

  // Locking costs 50% more
  const baseCost = getRerollCost(artifact);
  const cost = Math.ceil(baseCost * 1.5);
  if (alkahest < cost) {
    return { success: false, error: `Need ${cost} alkahest (have ${alkahest})` };
  }

  const t = GEAR_TIERS[artifact.tier] || GEAR_TIERS.T0;
  const mainStatId = artifact.mainStat?.id;
  const lockedSub = artifact.subs[lockIndex];

  // Re-generate non-locked substats
  const numSubs = artifact.subs.length;
  const availableSubs = SUB_STAT_POOL.filter(s => s.id !== mainStatId && s.id !== lockedSub.id);
  const newSubs = [{ ...lockedSub }]; // keep locked sub at index 0
  const usedIds = new Set([lockedSub.id]);

  for (let i = 1; i < numSubs && availableSubs.length > 0; i++) {
    const pool = availableSubs.filter(s => !usedIds.has(s.id));
    if (pool.length === 0) break;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    usedIds.add(pick.id);
    const value = Math.round(
      (pick.range[0] + Math.random() * (pick.range[1] - pick.range[0])) * t.statMult
    );
    newSubs.push({ id: pick.id, label: pick.label, value });
  }

  const rerolledArtifact = {
    ...artifact,
    subs: newSubs,
    rerollCount: (artifact.rerollCount || 0) + 1,
  };

  return {
    success: true,
    artifact: rerolledArtifact,
    alkahestCost: cost,
    alkahestRemaining: alkahest - cost,
  };
}
