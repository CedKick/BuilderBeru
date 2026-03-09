// src/utils/communityWeapons.js
// Fetches community weapons from API and merges them into the WEAPONS object
// so computeWeaponBonuses() and statsAtFull() work automatically.

import { API_URL } from './api.js';
import { WEAPONS, WEAPON_AWAKENING_PASSIVES } from '../pages/ShadowColosseum/equipmentData';
import { FORGE_PASSIVE_TEMPLATES, AWAKENING_STAT_OPTIONS, BONUS_STAT_OPTIONS } from '../data/forgePassiveTemplates.js';

// Awakening key → human-readable label
const AW_LABELS = Object.fromEntries(AWAKENING_STAT_OPTIONS.map(s => [s.key, s.label]));
// Also include bonus stat labels for any overlap
for (const s of BONUS_STAT_OPTIONS) { if (!AW_LABELS[s.key]) AW_LABELS[s.key] = s.label; }

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

          // Inject custom awakening passives (A1-A5) with human-readable labels
          const awData = typeof w.awakening_passives === 'string'
            ? JSON.parse(w.awakening_passives) : (w.awakening_passives || []);
          if (awData.length > 0) {
            WEAPON_AWAKENING_PASSIVES[w.weapon_id] = awData.map(aw => {
              const label = AW_LABELS[aw.key] || aw.key;
              const suffix = aw.key?.includes('flat') ? '' : '%';
              return {
                desc: `${label} +${aw.value}${suffix}`,
                stats: { [aw.key]: aw.value },
              };
            });
          }

          // Build passive description for display
          const passivesData = typeof w.passives === 'string'
            ? JSON.parse(w.passives) : (w.passives || []);
          const activePassives = passivesData.filter(p => p?.id && p.id !== 'none');
          if (activePassives.length > 0) {
            const passiveDescs = activePassives.map(p => {
              const t = FORGE_PASSIVE_TEMPLATES[p.id];
              if (!t) return null;
              let d = t.desc;
              for (const [k, v] of Object.entries(p.params || {})) {
                if (k === 'durationTurns' && (v === 0 || v === '0')) {
                  d = d.replace(/Dure \{durationTurns\} tours[^.]*\.?/, 'Effet permanent.');
                  d = d.replace(/pendant \{durationTurns\} tours/, 'en permanence');
                  d = d.replace(`{${k}}`, '∞');
                  continue;
                }
                d = d.replace(`{${k}}`, v);
              }
              return { name: t.name, desc: d, category: t.category };
            }).filter(Boolean);
            WEAPONS[w.weapon_id].passiveDescs = passiveDescs;
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
