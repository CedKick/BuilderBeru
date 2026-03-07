const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://builderberu:beru-local-2026-secure@localhost:5432/neondb' });

const REAL_PLAYERS = new Set(['Kly', 'damon', 'shy', 'Bobby', 'GRRRRRRRRRRRRRR']);

// Everything the redistribute script handles
const KNOWN_PREFIXES = ['exp_forest_', 'exp_stone_', 'exp_shadow_', 'exp_leaf_', 'exp_crystal_', 'exp_abyss_', 'exp_magma_', 'exp_void_', 'exp_eclipse_'];
const SKIP_PREFIXES = ['exp_potion_', 'exp_mat_', 'exp_elixir_', 'exp_skill_'];

async function main() {
  const r = await pool.query("SELECT winner_username, item_id, item_name, rarity FROM expedition_loot WHERE winner_username IS NOT NULL ORDER BY winner_username, id");

  const skipped = {};
  r.rows.forEach(row => {
    if (!REAL_PLAYERS.has(row.winner_username)) return;
    const id = row.item_id;
    if (id === 'exp_ultimate_scroll') return;
    if (SKIP_PREFIXES.some(p => id.startsWith(p))) return;
    if (id.startsWith('weapon_')) return;
    if (id.startsWith('set_') && id.endsWith('_piece')) return;
    if (id.startsWith('unique_')) return;
    if (KNOWN_PREFIXES.some(p => id.startsWith(p))) return;
    // Weapons
    if (id.startsWith('exp_') && (id.includes('sword') || id.includes('bow') || id.includes('dagger') || id.includes('staff') || id.includes('mace') || id.includes('blade') || id.includes('axe') || id.includes('scythe') || id.includes('whip') || id.includes('katana') || id.includes('grimoire') || id.includes('halberd') || id.includes('talisman') || id.includes('claws') || id.includes('lance') || id.includes('hammer') || id.includes('spear') || id.includes('wand') || id.includes('orb') || id.includes('glaive'))) return;

    if (!skipped[row.winner_username]) skipped[row.winner_username] = [];
    skipped[row.winner_username].push(id + ' → ' + row.item_name + ' (' + row.rarity + ')');
  });

  if (Object.keys(skipped).length === 0) {
    console.log('All equipment items are handled! Remaining skips are consumables only.');
  } else {
    for (const [player, items] of Object.entries(skipped)) {
      console.log(player + ': ' + items.length + ' truly skipped');
      items.forEach(i => console.log('  ' + i));
    }
  }
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
