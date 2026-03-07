const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://builderberu:beru-local-2026-secure@localhost:5432/neondb' });

const REAL_PLAYERS = new Set(['Kly', 'damon', 'shy', 'Bobby', 'GRRRRRRRRRRRRRR']);

const WEAPON_IDS = new Set([
  'excalibur','mjolnir','muramasa','yggdrasil','gungnir','nidhogg','aegis_weapon','caladbolg','thyrsus','gram',
  'exp_dagger_forest','exp_bow_forest','exp_sword_forest','exp_staff_forest','exp_mace_forest',
  'exp_sword_stone','exp_bow_stone','exp_spear_crystal','exp_wand_crystal','exp_hammer_stone',
  'exp_blade_shadow','exp_staff_shadow','exp_axe_abyss','exp_glaive_abyss','exp_orb_abyss','exp_scythe_abyss','exp_whip_abyss',
  'exp_katana_void','exp_grimoire_void','exp_halberd_void','exp_talisman_void','exp_claws_void','exp_lance_briseur'
]);

const BOSS_WEAPON_MAP = {
  weapon_excalibur: 'excalibur', weapon_mjolnir: 'mjolnir', weapon_muramasa: 'muramasa',
  weapon_yggdrasil: 'yggdrasil', weapon_gungnir: 'gungnir', weapon_nidhogg: 'nidhogg',
  weapon_aegis: 'aegis_weapon', weapon_caladbolg: 'caladbolg', weapon_thyrsus: 'thyrsus', weapon_gram: 'gram',
};

// ITEM_STATS from redistribute_all.cjs
const ITEM_STATS = {
  exp_forest_helm: true, exp_forest_chest: true, exp_forest_gloves: true, exp_forest_boots: true,
  exp_stone_helm: true, exp_stone_chest: true, exp_stone_gloves: true, exp_stone_boots: true,
  exp_shadow_helm: true, exp_shadow_chest: true, exp_shadow_gloves: true, exp_shadow_boots: true,
  exp_leaf_helm: true, exp_leaf_chest: true,
  exp_crystal_helm: true, exp_crystal_chest: true, exp_crystal_gloves: true, exp_crystal_boots: true,
  exp_abyss_helm: true, exp_abyss_chest: true, exp_abyss_gloves: true, exp_abyss_boots: true,
  exp_magma_helm: true, exp_magma_chest: true, exp_magma_gloves: true,
  exp_void_helm: true, exp_void_chest: true, exp_void_gloves: true, exp_void_boots: true,
  exp_eclipse_helm: true, exp_eclipse_chest: true,
};

async function main() {
  const r = await pool.query("SELECT winner_username, item_id, item_name, rarity FROM expedition_loot WHERE winner_username IS NOT NULL ORDER BY winner_username, id");

  const skipped = {};
  r.rows.forEach(row => {
    if (!REAL_PLAYERS.has(row.winner_username)) return;
    const id = row.item_id;

    // Skip scrolls/currencies/potions/mats
    if (id === 'exp_ultimate_scroll') return;
    if (id.startsWith('exp_potion_') || id.startsWith('exp_mat_') || id.startsWith('exp_elixir_') || id.startsWith('exp_skill_')) return;

    // Weapon? (mapped or direct)
    if (BOSS_WEAPON_MAP[id] || WEAPON_IDS.has(id)) return;

    // Known armor?
    if (ITEM_STATS[id]) return;

    // Set piece? (set_*_piece)
    if (id.startsWith('set_') && id.endsWith('_piece')) return;

    // This item was SKIPPED in redistribution
    if (!skipped[row.winner_username]) skipped[row.winner_username] = [];
    skipped[row.winner_username].push(id + ' → ' + row.item_name + ' (' + row.rarity + ')');
  });

  console.log('=== ITEMS SKIPPED IN REDISTRIBUTION ===');
  for (const [player, items] of Object.entries(skipped)) {
    console.log(player + ': ' + items.length + ' items skipped');
    items.forEach(i => console.log('  ' + i));
  }

  if (Object.keys(skipped).length === 0) {
    console.log('No items were skipped!');
  }

  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
