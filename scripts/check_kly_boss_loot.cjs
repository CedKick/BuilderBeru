const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://builderberu:beru-local-2026-secure@localhost:5432/neondb' });

const BOSS_WEAPONS = ['excalibur','mjolnir','muramasa','yggdrasil','gungnir','nidhogg','aegis_weapon','caladbolg','thyrsus','gram'];

async function main() {
  // All loot for Kly
  const r = await pool.query("SELECT item_id, item_name, rarity FROM expedition_loot WHERE winner_username = 'Kly' ORDER BY id");
  console.log('Total loot rows for Kly:', r.rows.length);

  // Boss weapons specifically
  const bossLoot = r.rows.filter(row => BOSS_WEAPONS.includes(row.item_id));
  console.log('\nBoss weapons in expedition_loot:', bossLoot.length);
  bossLoot.forEach(row => console.log('  ' + row.item_id + ' (' + row.item_name + ', ' + row.rarity + ')'));

  // Check if mjolnir/thyrsus appear anywhere
  const mjolnir = r.rows.filter(row => row.item_id === 'mjolnir' || row.item_name.toLowerCase().includes('mjolnir'));
  const thyrsus = r.rows.filter(row => row.item_id === 'thyrsus' || row.item_name.toLowerCase().includes('thyrsus'));
  console.log('\nMjolnir matches:', mjolnir.length, mjolnir);
  console.log('Thyrsus matches:', thyrsus.length, thyrsus);

  // Check all unique item_ids
  const unique = [...new Set(r.rows.map(row => row.item_id))];
  console.log('\nAll unique item_ids for Kly:', unique.join(', '));

  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
