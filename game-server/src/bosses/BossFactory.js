import { Manaya } from './Manaya.js';
import { CustomBoss } from './CustomBoss.js';

// ── Custom boss config cache (fetched from DB via API) ──
// Key: bossId, Value: { config, fetchedAt }
const _customBossCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 min cache

/**
 * Fetch a custom boss config from the API (boss-editor endpoint).
 * Returns null if not found or on error.
 */
async function fetchCustomBossConfig(bossId) {
  // Check cache first
  const cached = _customBossCache.get(bossId);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached.config;
  }

  try {
    const API_URL = process.env.VERCEL_API_URL || 'https://api.builderberu.com';
    const resp = await fetch(`${API_URL}/api/boss-editor?action=get&bossId=${encodeURIComponent(bossId)}`);
    const data = await resp.json();

    if (data.success && data.boss?.config) {
      const config = typeof data.boss.config === 'string' ? JSON.parse(data.boss.config) : data.boss.config;
      // Attach metadata
      config._bossId = bossId;
      config._creatorUsername = data.boss.creator_username;
      if (!config.name && data.boss.name) config.name = data.boss.name;

      _customBossCache.set(bossId, { config, fetchedAt: Date.now() });
      console.log(`[BossFactory] Fetched custom boss "${config.name}" (${bossId})`);
      return config;
    }

    console.warn(`[BossFactory] Custom boss not found: ${bossId}`);
    return null;
  } catch (err) {
    console.error(`[BossFactory] Error fetching custom boss ${bossId}:`, err.message);
    return null;
  }
}

/**
 * Create a boss instance by ID.
 * - 'manaya' → hardcoded Manaya class (untouched)
 * - 'boss_*'  → custom boss loaded from DB via API
 */
export function createBoss(bossId, difficulty, x, y) {
  // Hardcoded bosses — never touched
  switch (bossId) {
    case 'manaya':
      return new Manaya(difficulty, x, y);

    // Future hardcoded bosses:
    // case 'ragnaros':
    //   return new Ragnaros(difficulty, x, y);
  }

  // Custom boss — check if config was pre-loaded (sync path)
  const cached = _customBossCache.get(bossId);
  if (cached) {
    return new CustomBoss(cached.config, difficulty, x, y);
  }

  // Fallback: boss not in cache yet → return Manaya as safety net
  // (The async preload should have been called before game start)
  console.warn(`[BossFactory] Boss "${bossId}" not in cache, falling back to Manaya`);
  return new Manaya(difficulty, x, y);
}

/**
 * Pre-load a custom boss config before game start.
 * Call this during countdown so the config is cached when createBoss runs.
 */
export async function preloadCustomBoss(bossId) {
  if (bossId === 'manaya') return true;
  const config = await fetchCustomBossConfig(bossId);
  return config !== null;
}
