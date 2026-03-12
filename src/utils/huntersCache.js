// src/utils/huntersCache.js — Load hunters from DB, merge with raidData.js fallback
// Progressive migration: DB hunters override raidData.js entries with same hunter_id.
// If DB is empty or unreachable, raidData.js is used as-is.

import { HUNTERS, HUNTER_PASSIVE_EFFECTS } from '../pages/ShadowColosseum/raidData.js';
import { API_URL } from './api.js';

let dbHunters = null;
let dbPassives = null;
let lastFetch = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch hunters from DB via API, merge into HUNTERS object.
 * Returns merged HUNTERS (DB overrides raidData.js).
 */
export async function loadDbHunters() {
  // Skip if recently fetched
  if (dbHunters && Date.now() - lastFetch < CACHE_TTL) {
    return { hunters: dbHunters, passives: dbPassives };
  }

  try {
    const res = await fetch(`${API_URL}/admin/hunter?action=list`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!data.success || !data.hunters || data.hunters.length === 0) {
      // DB empty — use raidData.js as-is
      dbHunters = { ...HUNTERS };
      dbPassives = { ...HUNTER_PASSIVE_EFFECTS };
      lastFetch = Date.now();
      return { hunters: dbHunters, passives: dbPassives };
    }

    // Start from raidData.js as base
    const merged = { ...HUNTERS };
    const mergedPassives = { ...HUNTER_PASSIVE_EFFECTS };

    for (const h of data.hunters) {
      merged[h.hunter_id] = {
        name: h.name,
        element: h.element,
        rarity: h.rarity,
        class: h.class,
        series: h.series || undefined,
        sprite: h.sprite_url || '',
        passiveDesc: h.passive_desc || '',
        base: h.base_stats,
        growth: h.growth_stats,
        skills: h.skills || [],
        special: h.special || false,
        _fromDb: true, // flag for debug
      };

      // Merge passive
      if (h.passive_type) {
        mergedPassives[h.hunter_id] = {
          type: h.passive_type,
          ...(h.passive_params || {}),
        };
      }
    }

    dbHunters = merged;
    dbPassives = mergedPassives;
    lastFetch = Date.now();
    console.log(`[huntersCache] Loaded ${data.hunters.length} hunters from DB, merged with ${Object.keys(HUNTERS).length} from raidData.js`);

    return { hunters: dbHunters, passives: dbPassives };
  } catch (err) {
    console.warn('[huntersCache] Failed to load from DB, using raidData.js fallback:', err.message);
    dbHunters = { ...HUNTERS };
    dbPassives = { ...HUNTER_PASSIVE_EFFECTS };
    lastFetch = Date.now();
    return { hunters: dbHunters, passives: dbPassives };
  }
}

/**
 * Get cached hunters (synchronous). Returns raidData.js if not yet loaded.
 */
export function getCachedHunters() {
  if (dbHunters) return { hunters: dbHunters, passives: dbPassives };
  // Trigger async load in background
  loadDbHunters().catch(() => {});
  return { hunters: HUNTERS, passives: HUNTER_PASSIVE_EFFECTS };
}

/**
 * Force refresh cache (after admin edit).
 */
export function invalidateHuntersCache() {
  lastFetch = 0;
  dbHunters = null;
  dbPassives = null;
}
