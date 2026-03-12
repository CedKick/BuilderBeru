// game-server/src/data/huntersDbCache.js
// Caches hunter definitions from PostgreSQL for game server use.
// Refreshes every 5 minutes. Falls back to local hunterData.js if DB empty.

import pg from 'pg';
const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://builderberu:beru-local-2026-secure@localhost:5432/neondb';

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 2,
  idleTimeoutMillis: 30000,
});

let cache = [];
let cacheMap = {};
let lastFetch = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function refresh() {
  try {
    const result = await pool.query(
      `SELECT hunter_id, name, element, class, rarity, series,
              base_stats, growth_stats, skills,
              passive_type, passive_params, passive_desc,
              awakening_passives, sprite_url, special
       FROM hunters_data
       WHERE status = 'active'
       ORDER BY created_at ASC`
    );
    cache = result.rows;
    cacheMap = {};
    for (const h of cache) {
      cacheMap[h.hunter_id] = h;
    }
    lastFetch = Date.now();
    if (cache.length > 0) {
      console.log(`[HuntersDbCache] Loaded ${cache.length} hunters from DB`);
    }
  } catch (err) {
    console.error('[HuntersDbCache] Failed to refresh:', err.message);
    // Keep stale cache on error
  }
}

export function getDbHunters() {
  if (Date.now() - lastFetch > CACHE_TTL) {
    refresh().catch(() => {});
    if (lastFetch === 0) return [];
  }
  return cache;
}

export function getDbHunterById(hunterId) {
  if (Date.now() - lastFetch > CACHE_TTL) {
    refresh().catch(() => {});
  }
  return cacheMap[hunterId] || null;
}

// Initial load
refresh().catch(() => {});
