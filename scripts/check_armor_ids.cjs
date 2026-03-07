const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://builderberu:beru-local-2026-secure@localhost:5432/neondb' });

async function main() {
  // All unique non-weapon, non-scroll item_ids
  const r = await pool.query(`
    SELECT DISTINCT item_id, item_name, rarity
    FROM expedition_loot
    WHERE item_id NOT LIKE 'exp_ultimate%'
      AND item_id NOT LIKE 'weapon_%'
      AND item_id NOT LIKE 'exp_%_forest'
      AND item_id NOT LIKE 'exp_%_stone'
      AND item_id NOT LIKE 'exp_%_shadow'
      AND item_id NOT LIKE 'exp_%_abyss'
      AND item_id NOT LIKE 'exp_%_crystal'
      AND item_id NOT LIKE 'exp_%_void'
    ORDER BY item_id
  `);

  console.log('=== NON-STANDARD ITEM IDS (not exp_*, not weapon_*, not scroll) ===');
  r.rows.forEach(row => console.log('  ' + row.item_id + ' → ' + row.item_name + ' (' + row.rarity + ')'));

  // Also show ALL unique item_ids to get the full picture
  const all = await pool.query("SELECT DISTINCT item_id FROM expedition_loot ORDER BY item_id");
  console.log('\n=== ALL UNIQUE ITEM IDS (' + all.rows.length + ') ===');
  all.rows.forEach(row => console.log('  ' + row.item_id));

  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
