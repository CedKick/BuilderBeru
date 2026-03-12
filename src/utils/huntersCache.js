// src/utils/huntersCache.js — Load hunters from DB, sync with raidData.js
// Uses the public /api/hunters endpoint (no auth required).
// Calls refreshHuntersFromDb() which mutates HUNTERS in place.

import { HUNTERS, HUNTER_PASSIVE_EFFECTS, refreshHuntersFromDb, invalidateHuntersSync } from '../pages/ShadowColosseum/raidData.js';

/**
 * Load hunters from DB and sync into raidData.js HUNTERS object.
 * Returns the live HUNTERS reference (mutated in place by DB data).
 */
export async function loadDbHunters() {
  await refreshHuntersFromDb();
  return { hunters: HUNTERS, passives: HUNTER_PASSIVE_EFFECTS };
}

/**
 * Get cached hunters (synchronous). Returns current HUNTERS reference.
 * Triggers async DB sync in background if not yet loaded.
 */
export function getCachedHunters() {
  refreshHuntersFromDb().catch(() => {});
  return { hunters: HUNTERS, passives: HUNTER_PASSIVE_EFFECTS };
}

/**
 * Force refresh cache (after admin edit).
 */
export function invalidateHuntersCache() {
  invalidateHuntersSync();
  refreshHuntersFromDb().catch(() => {});
}
