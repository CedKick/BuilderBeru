// src/utils/offlineFarm.js — Offline Auto-Farm Client Utility
// Manages farm state (localStorage), API calls, and reward calculation

import { isLoggedIn, authHeaders } from './auth';
import { cloudStorage } from './CloudStorage';

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const FARM_STATE_KEY = 'beru_offline_farm';
const BATTLES_PER_MINUTE = 15;

// Valid Tier 6 stages and their secret weapon drops
export const FARMABLE_STAGES = {
  archdemon: {
    name: 'Archdemon',
    weapon: 'w_guldan',
    weaponName: "Baton de Gul'dan",
    dropRate: 1 / 10000,
    lootBuff: 'loot_guldan',
  },
  ragnarok: {
    name: 'Ragnarok',
    weapon: 'w_sulfuras',
    weaponName: 'Masse de Sulfuras',
    dropRate: 1 / 10000,
    lootBuff: 'loot_sulfuras',
  },
  zephyr: {
    name: 'Zephyr Ultime',
    weapon: 'w_raeshalare',
    weaponName: "Arc Rae'shalare",
    dropRate: 1 / 5000,
    lootBuff: 'loot_raeshalare',
  },
  supreme_monarch: {
    name: 'Monarque Supreme',
    weapons: [
      { id: 'w_katana_z', name: 'Katana Z', dropRate: 1 / 50000, lootBuff: 'loot_katana_z' },
      { id: 'w_katana_v', name: 'Katana V', dropRate: 1 / 50000, lootBuff: 'loot_katana_v' },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// LOCAL STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════

export function getFarmState() {
  try {
    return JSON.parse(localStorage.getItem(FARM_STATE_KEY)) || null;
  } catch { return null; }
}

export function setFarmState(state) {
  if (state) {
    localStorage.setItem(FARM_STATE_KEY, JSON.stringify(state));
  } else {
    localStorage.removeItem(FARM_STATE_KEY);
  }
}

export function isFarming() {
  const state = getFarmState();
  return !!(state && state.active);
}

/** Get elapsed minutes since farm started (client-side estimate) */
export function getFarmElapsedMinutes() {
  const state = getFarmState();
  if (!state?.active || !state.clientStartedAt) return 0;
  return Math.floor((Date.now() - state.clientStartedAt) / 60000);
}

// ═══════════════════════════════════════════════════════════════
// API CALLS
// ═══════════════════════════════════════════════════════════════

export async function startFarm(stageId) {
  if (!isLoggedIn()) return { success: false, message: 'Not logged in' };

  const resp = await fetch('/api/factions?action=offline-farm-start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ stageId }),
  });
  const data = await resp.json();

  if (data.success) {
    setFarmState({
      active: true,
      stageId,
      startedAt: data.farmStartedAt || new Date().toISOString(),
      clientStartedAt: Date.now(),
    });
    window.dispatchEvent(new CustomEvent('beru-react', {
      detail: { type: 'farm-start' },
    }));
  }
  return data;
}

export async function stopFarm() {
  const state = getFarmState();
  if (!state?.active) return { success: false, message: 'No active farm', actualMinutes: 0, maxBattles: 0 };

  if (!isLoggedIn()) {
    setFarmState(null);
    return { success: false, message: 'Not logged in' };
  }

  try {
    const resp = await fetch('/api/factions?action=offline-farm-end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({}),
    });
    const data = await resp.json();

    // Always clear local state
    setFarmState(null);

    if (data.success) {
      window.dispatchEvent(new CustomEvent('beru-react', {
        detail: { type: 'farm-end' },
      }));
    }
    return data;
  } catch (e) {
    console.error('[offlineFarm] Stop failed:', e);
    setFarmState(null);
    return { success: false, message: 'Network error' };
  }
}

// ═══════════════════════════════════════════════════════════════
// REWARD CALCULATION — called ONCE when farm ends
// Uses server-validated maxBattles (cannot be inflated by client)
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate all farm rewards based on server-approved battle count.
 * @param {number} maxBattles - Server-validated battle count
 * @param {string} stageId - Tier 6 stage being farmed
 * @param {boolean} lootBoostActive - Whether x2 loot boost was active
 * @param {Object} factionBuffs - { loot_sulfuras: level, ... }
 * @returns {{ secretWeapons, hunterRollSuccesses, totalBattles, minutesFarmed }}
 */
export function calculateFarmRewards(maxBattles, stageId, lootBoostActive, factionBuffs) {
  const rewards = {
    secretWeapons: [],       // [{ id, name, count }]
    hunterRollSuccesses: 0,  // Total successful hunter rolls (resolved in ShadowColosseum)
    totalBattles: maxBattles,
    minutesFarmed: Math.floor(maxBattles / BATTLES_PER_MINUTE),
  };

  const stageInfo = FARMABLE_STAGES[stageId];
  if (!stageInfo || maxBattles <= 0) return rewards;

  const lootMult = lootBoostActive ? 2 : 1;

  const getFLM = (buffId) => {
    if (!factionBuffs || !factionBuffs[buffId]) return 1;
    return 1 + factionBuffs[buffId] * 0.05;
  };

  // ─── Secret Weapon Rolls ─────────────────────────────────
  if (stageInfo.weapons) {
    // supreme_monarch: 2 weapons (Katana Z + Katana V)
    for (let i = 0; i < maxBattles; i++) {
      for (const w of stageInfo.weapons) {
        if (Math.random() < w.dropRate * lootMult * getFLM(w.lootBuff)) {
          const existing = rewards.secretWeapons.find(sw => sw.id === w.id);
          if (existing) existing.count++;
          else rewards.secretWeapons.push({ id: w.id, name: w.name, count: 1 });
        }
      }
    }
  } else {
    // Single weapon stage (ragnarok, zephyr, archdemon)
    for (let i = 0; i < maxBattles; i++) {
      if (Math.random() < stageInfo.dropRate * lootMult * getFLM(stageInfo.lootBuff)) {
        const existing = rewards.secretWeapons.find(sw => sw.id === stageInfo.weapon);
        if (existing) existing.count++;
        else rewards.secretWeapons.push({ id: stageInfo.weapon, name: stageInfo.weaponName, count: 1 });
      }
    }
  }

  // ─── Hunter Rolls (5 rolls x 1% per battle) ──────────────
  for (let i = 0; i < maxBattles; i++) {
    for (let r = 0; r < 5; r++) {
      if (Math.random() < 0.01) rewards.hunterRollSuccesses++;
    }
  }

  return rewards;
}
