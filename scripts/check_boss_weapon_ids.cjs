const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://builderberu:beru-local-2026-secure@localhost:5432/neondb' });

async function main() {
  // Find all weapon_ prefixed items in expedition_loot
  const r = await pool.query("SELECT DISTINCT item_id, item_name, rarity, winner_username FROM expedition_loot WHERE item_id LIKE 'weapon_%' ORDER BY item_id");
  console.log('All weapon_ prefixed items in expedition_loot:');
  r.rows.forEach(row => console.log('  ' + row.item_id + ' → ' + row.item_name + ' (' + row.rarity + ') won by ' + row.winner_username));
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
