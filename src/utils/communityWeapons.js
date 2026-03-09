// src/utils/communityWeapons.js
// Fetches community weapons from API and merges them into the WEAPONS object
// so computeWeaponBonuses() and statsAtFull() work automatically.

import { API_URL } from './api.js';
import { WEAPONS, WEAPON_AWAKENING_PASSIVES } from '../pages/ShadowColosseum/equipmentData';

let loaded = false;
let cache = [];

export async function loadCommunityWeapons() {
  if (loaded) return cache;
  try {
    const resp = await fetch(`${API_URL}/forge?action=list`);
    const data = await resp.json();
    if (data.success && data.weapons?.length) {
      cache = data.weapons;
      for (const w of data.weapons) {
        // Only inject if not already in WEAPONS (don't overwrite hardcoded)
        if (!WEAPONS[w.weapon_id]) {
          WEAPONS[w.weapon_id] = {
            id: w.weapon_id,
            name: w.name,
            rarity: w.rarity,
            element: w.element || null,
            weaponType: w.weapon_type,
            atk: w.atk,
            bonusStat: w.bonus_stat || null,
            bonusValue: Number(w.bonus_value) || 0,
            scalingStat: w.scaling_stat || null,
            icon: w.icon || '⚔️',
            sprite: w.sprite_url || null,
            desc: w.desc_fr || '',
            community: true,
            creator: w.creator_username,
          };

          // Inject custom awakening passives (A1-A5)
          const awData = typeof w.awakening_passives === 'string'
            ? JSON.parse(w.awakening_passives) : (w.awakening_passives || []);
          if (awData.length > 0) {
            WEAPON_AWAKENING_PASSIVES[w.weapon_id] = awData.map(aw => ({
              desc: aw.desc || `+${aw.value}% ${aw.key}`,
              stats: { [aw.key]: aw.value },
            }));
          }
        }
      }
      loaded = true;
    }
  } catch (e) {
    // Non-blocking — community weapons just won't appear
  }
  return cache;
}

export function getCommunityWeaponsCache() {
  return cache;
}
