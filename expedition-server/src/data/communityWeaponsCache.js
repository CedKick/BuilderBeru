// expedition-server/src/data/communityWeaponsCache.js
// Caches community weapons from the PostgreSQL DB for loot rolling.
// Refreshes every 5 minutes to pick up new forge weapons without restart.

import pg from 'pg';
const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://builderberu:beru-local-2026-secure@localhost:5432/neondb';

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 2,
  idleTimeoutMillis: 30000,
});

let cache = [];
let lastFetch = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function refresh() {
  try {
    const result = await pool.query(
      `SELECT weapon_id, creator_username, name, element, weapon_type, rarity,
              atk, bonus_stat, bonus_value, scaling_stat,
              passive_template_id, passive_params, passives, power_score, drop_rate
       FROM community_weapons
       WHERE status = 'active'
       ORDER BY created_at DESC
       LIMIT 200`
    );
    cache = result.rows;
    lastFetch = Date.now();
    if (cache.length > 0) {
      console.log(`[CommunityWeapons] Loaded ${cache.length} community weapons`);
    }
  } catch (err) {
    console.error('[CommunityWeapons] Failed to refresh:', err.message);
    // Keep stale cache on error
  }
}

export function getCommunityWeapons() {
  // Async refresh in background if stale
  if (Date.now() - lastFetch > CACHE_TTL) {
    refresh().catch(() => {});
    // If first load, return empty — next tick will have data
    if (lastFetch === 0) return [];
  }
  return cache;
}

// Initial load
refresh().catch(() => {});
