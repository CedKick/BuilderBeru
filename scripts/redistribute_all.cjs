// Redistribute ALL expedition loot (weapons + armor) from expedition_loot table
// Run on server: cd /opt/manaya-raid && node redistribute_all.cjs

const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://builderberu:beru-local-2026-secure@localhost:5432/neondb' });

const WEAPON_IDS = new Set([
  'excalibur','mjolnir','muramasa','yggdrasil','gungnir','nidhogg','aegis_weapon','caladbolg','thyrsus','gram',
  'exp_dagger_forest','exp_bow_forest','exp_sword_forest','exp_staff_forest','exp_mace_forest',
  'exp_sword_stone','exp_bow_stone','exp_spear_crystal','exp_wand_crystal','exp_hammer_stone',
  'exp_blade_shadow','exp_staff_shadow','exp_axe_abyss','exp_glaive_abyss','exp_orb_abyss','exp_scythe_abyss','exp_whip_abyss',
  'exp_katana_void','exp_grimoire_void','exp_halberd_void','exp_talisman_void','exp_claws_void','exp_lance_briseur'
]);

// Boss weapons in expedition_loot use "weapon_X" prefix → map to "X" for weaponCollection
const BOSS_WEAPON_MAP = {
  weapon_excalibur: 'excalibur', weapon_mjolnir: 'mjolnir', weapon_muramasa: 'muramasa',
  weapon_yggdrasil: 'yggdrasil', weapon_gungnir: 'gungnir', weapon_nidhogg: 'nidhogg',
  weapon_aegis: 'aegis_weapon', weapon_caladbolg: 'caladbolg', weapon_thyrsus: 'thyrsus', weapon_gram: 'gram',
};

const REAL_PLAYERS = new Set(['Kly', 'damon', 'shy', 'Bobby', 'GRRRRRRRRRRRRRR']);
const MAX_WEAPON_AWAKENING = 100;
const INVENTORY_MAX = 1500;

// Slot mapping for armor conversion
const EXP_SLOT_MAP = { helm: 'casque', chest: 'plastron', gloves: 'gants', boots: 'bottes' };

// Rarity mapping
function mapRarity(r) {
  if (r === 'legendary') return 'legendaire';
  if (r === 'epic') return 'legendaire';
  if (r === 'uncommon' || r === 'common') return 'rare';
  return r;
}

// Item data for conversion (item_id → slot/stats/setId)
// We need to look up from expedition_items data
const ITEM_STATS = {
  // Forest armor
  exp_forest_helm: { slot: 'helm', stats: { hp_flat: 500, def_flat: 10 }, setId: 'set_forest' },
  exp_forest_chest: { slot: 'chest', stats: { hp_flat: 800, def_flat: 15 }, setId: 'set_forest' },
  exp_forest_gloves: { slot: 'gloves', stats: { atk_flat: 15, crit_rate: 3 }, setId: 'set_forest' },
  exp_forest_boots: { slot: 'boots', stats: { spd_flat: 8, def_flat: 10 }, setId: 'set_forest' },
  // Stone armor
  exp_stone_helm: { slot: 'helm', stats: { hp_flat: 800, def_flat: 20 }, setId: 'set_stone' },
  exp_stone_chest: { slot: 'chest', stats: { hp_flat: 1200, def_flat: 30 }, setId: 'set_stone' },
  exp_stone_gloves: { slot: 'gloves', stats: { def_flat: 20, res_flat: 5 }, setId: 'set_stone' },
  exp_stone_boots: { slot: 'boots', stats: { def_flat: 15, hp_flat: 600 }, setId: 'set_stone' },
  // Shadow armor
  exp_shadow_helm: { slot: 'helm', stats: { atk_flat: 25, crit_rate: 5 }, setId: 'set_shadow' },
  exp_shadow_chest: { slot: 'chest', stats: { atk_flat: 35, hp_flat: 500 }, setId: 'set_shadow' },
  exp_shadow_gloves: { slot: 'gloves', stats: { atk_flat: 30, crit_rate: 8 }, setId: 'set_shadow' },
  exp_shadow_boots: { slot: 'boots', stats: { spd_flat: 15, atk_flat: 20 }, setId: 'set_shadow' },
  // Leaf armor
  exp_leaf_helm: { slot: 'helm', stats: { hp_flat: 300, def_flat: 5 }, setId: null },
  exp_leaf_chest: { slot: 'chest', stats: { hp_flat: 450, def_flat: 8 }, setId: null },
  // Crystal armor
  exp_crystal_helm: { slot: 'helm', stats: { hp_flat: 650, atk_flat: 15, res_flat: 5 }, setId: null },
  exp_crystal_chest: { slot: 'chest', stats: { hp_flat: 1000, def_flat: 22 }, setId: null },
  exp_crystal_gloves: { slot: 'gloves', stats: { atk_flat: 20, crit_rate: 5, spd_flat: 3 }, setId: null },
  exp_crystal_boots: { slot: 'boots', stats: { spd_flat: 10, def_flat: 12 }, setId: null },
  // Abyss armor
  exp_abyss_helm: { slot: 'helm', stats: { hp_flat: 1000, def_flat: 28 }, setId: 'set_abyss' },
  exp_abyss_chest: { slot: 'chest', stats: { hp_flat: 1500, def_flat: 38 }, setId: 'set_abyss' },
  exp_abyss_gloves: { slot: 'gloves', stats: { atk_flat: 40, crit_rate: 8 }, setId: 'set_abyss' },
  exp_abyss_boots: { slot: 'boots', stats: { spd_flat: 14, def_flat: 22, hp_flat: 400 }, setId: 'set_abyss' },
  // Magma armor
  exp_magma_helm: { slot: 'helm', stats: { hp_flat: 1100, atk_flat: 20 }, setId: null },
  exp_magma_chest: { slot: 'chest', stats: { hp_flat: 1600, def_flat: 32 }, setId: null },
  exp_magma_gloves: { slot: 'gloves', stats: { atk_flat: 45, crit_rate: 6 }, setId: null },
  // Void armor
  exp_void_helm: { slot: 'helm', stats: { atk_flat: 45, crit_rate: 10, hp_flat: 500 }, setId: 'set_void' },
  exp_void_chest: { slot: 'chest', stats: { hp_flat: 2000, def_flat: 50, atk_flat: 20 }, setId: 'set_void' },
  exp_void_gloves: { slot: 'gloves', stats: { atk_flat: 55, crit_rate: 12 }, setId: 'set_void' },
  exp_void_boots: { slot: 'boots', stats: { spd_flat: 22, atk_flat: 30, def_flat: 15 }, setId: 'set_void' },
  // Eclipse armor
  exp_eclipse_helm: { slot: 'helm', stats: { atk_flat: 50, hp_flat: 800, crit_rate: 8 }, setId: null },
  exp_eclipse_chest: { slot: 'chest', stats: { hp_flat: 2200, def_flat: 55, res_flat: 10 }, setId: null },
};

// Set piece items (from expedition sets)
const SET_PIECE_STATS = {
  // Will be handled generically - set pieces have their setId in the item_id
};

function convertToArtifact(itemId, itemName, rarity) {
  const info = ITEM_STATS[itemId];
  if (!info) {
    // Try set piece: item_id like "set_xxx_piece" → generic stats
    if (itemId && itemId.startsWith('set_') && itemId.endsWith('_piece')) {
      const setId = itemId.replace('_piece', '');
      const stats = { atk_flat: 20, hp_flat: 500 };
      const statEntries = Object.entries(stats);
      return {
        uid: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        set: setId, slot: 'casque', rarity: mapRarity(rarity), level: 0,
        mainStat: statEntries[0][0], mainValue: statEntries[0][1],
        subs: statEntries.slice(1).map(([id, value]) => ({ id, value })),
        locked: false, source: 'expedition', expItemId: itemId, expItemName: itemName,
      };
    }
    return null; // Unknown item (scroll, currency, etc.)
  }

  const statEntries = Object.entries(info.stats);
  const mainStatEntry = statEntries[0] || ['atk_flat', 0];
  const subEntries = statEntries.slice(1);

  return {
    uid: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    set: info.setId || null,
    slot: info.slot ? (EXP_SLOT_MAP[info.slot] || info.slot) : 'casque',
    rarity: mapRarity(rarity),
    level: 0,
    mainStat: mainStatEntry[0], mainValue: mainStatEntry[1],
    subs: subEntries.map(([id, value]) => ({ id, value })),
    locked: false, source: 'expedition',
    expItemId: itemId, expItemName: itemName,
  };
}

function calcScore(art) {
  let s = 0;
  if (typeof art.mainValue === 'number') s += Math.abs(art.mainValue);
  if (Array.isArray(art.subs)) art.subs.forEach(sub => { if (typeof sub.value === 'number') s += Math.abs(sub.value); });
  s += ({ rare: 40, legendaire: 160, mythique: 320 }[art.rarity] || 0);
  return s;
}

async function main() {
  // Get all won loot for real players
  const loot = await pool.query(
    "SELECT winner_username, item_id, item_name, rarity FROM expedition_loot WHERE winner_username IS NOT NULL ORDER BY id"
  );

  // Group by player
  const playerLoot = {};
  loot.rows.forEach(row => {
    if (!REAL_PLAYERS.has(row.winner_username)) return;
    if (!playerLoot[row.winner_username]) playerLoot[row.winner_username] = [];
    playerLoot[row.winner_username].push(row);
  });

  for (const [username, items] of Object.entries(playerLoot)) {
    const ur = await pool.query("SELECT device_id FROM users WHERE LOWER(username) = LOWER($1)", [username]);
    if (ur.rows.length === 0) { console.log(`${username}: NOT FOUND`); continue; }
    const did = ur.rows[0].device_id;
    const dr = await pool.query("SELECT data FROM user_storage WHERE device_id = $1 AND storage_key = 'shadow_colosseum_data'", [did]);
    if (dr.rows.length === 0) { console.log(`${username}: NO SAVE`); continue; }
    const data = typeof dr.rows[0].data === 'string' ? JSON.parse(dr.rows[0].data) : dr.rows[0].data;
    if (!data.weaponCollection || typeof data.weaponCollection !== 'object') data.weaponCollection = {};
    if (!data.hammers) data.hammers = {};
    if (!Array.isArray(data.artifactInventory)) data.artifactInventory = [];

    // First: remove ALL existing expedition artifacts (we'll re-add from loot table)
    const beforeArts = data.artifactInventory.length;
    data.artifactInventory = data.artifactInventory.filter(a => a.source !== 'expedition');
    const removedArts = beforeArts - data.artifactInventory.length;

    // Remove expedition weapons from weaponCollection (re-add from loot table)
    let removedWeapons = 0;
    for (const wId of Object.keys(data.weaponCollection)) {
      if (WEAPON_IDS.has(wId)) {
        delete data.weaponCollection[wId];
        removedWeapons++;
      }
    }

    // Now re-add everything from loot table
    let weaponsAdded = 0, armorAdded = 0, scrolls = 0, skipped = 0;

    for (const item of items) {
      // Skip scrolls and currencies
      if (item.item_id === 'exp_ultimate_scroll') { scrolls++; continue; }

      // Weapons → weaponCollection (handle both "weapon_X" boss IDs and "exp_X" loot IDs)
      const mappedId = BOSS_WEAPON_MAP[item.item_id] || (WEAPON_IDS.has(item.item_id) ? item.item_id : null);
      if (mappedId) {
        const wId = mappedId;
        if (data.weaponCollection[wId] === undefined) {
          data.weaponCollection[wId] = 0;
        } else if (data.weaponCollection[wId] >= MAX_WEAPON_AWAKENING) {
          data.hammers.marteau_rouge = (data.hammers.marteau_rouge || 0) + 5;
        } else {
          data.weaponCollection[wId] += 1;
        }
        weaponsAdded++;
        continue;
      }

      // Armor → artifactInventory
      const artifact = convertToArtifact(item.item_id, item.item_name, item.rarity);
      if (!artifact) { skipped++; continue; }

      if (data.artifactInventory.length < INVENTORY_MAX) {
        data.artifactInventory.push(artifact);
        armorAdded++;
      } else {
        // Full → replace weakest
        const newScore = calcScore(artifact);
        let weakIdx = -1, weakScore = Infinity;
        for (let i = 0; i < data.artifactInventory.length; i++) {
          if (data.artifactInventory[i].locked) continue;
          const s = calcScore(data.artifactInventory[i]);
          if (s < weakScore) { weakScore = s; weakIdx = i; }
        }
        if (weakIdx >= 0 && newScore > weakScore) {
          data.artifactInventory[weakIdx] = artifact;
          armorAdded++;
        } else {
          skipped++;
        }
      }
    }

    // Update scrolls
    if (scrolls > 0) data.ultimateScrolls = (data.ultimateScrolls || 0) + scrolls;

    // Write back
    const json = JSON.stringify(data);
    const size = Buffer.byteLength(json, 'utf8');
    await pool.query(
      "UPDATE user_storage SET data = $1, size_bytes = $2, updated_at = NOW() WHERE device_id = $3 AND storage_key = 'shadow_colosseum_data'",
      [json, size, did]
    );

    const expWeapons = Object.entries(data.weaponCollection).filter(([k]) => WEAPON_IDS.has(k));
    console.log(`${username}: cleaned ${removedArts}arts+${removedWeapons}wpn | added ${weaponsAdded}wpn ${armorAdded}armor ${scrolls}scrolls (skipped ${skipped})`);
    console.log(`  weapons: ${expWeapons.map(([k,v])=>k+':A'+v).join(', ')}`);
    console.log(`  inventory: ${data.artifactInventory.length} total`);
    console.log('');
  }

  console.log('DONE');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
