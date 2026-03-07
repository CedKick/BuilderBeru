const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://builderberu:beru-local-2026-secure@localhost:5432/neondb' });

const WEAPON_IDS = new Set([
  'excalibur','mjolnir','muramasa','yggdrasil','gungnir','nidhogg','aegis_weapon','caladbolg','thyrsus','gram',
  'exp_dagger_forest','exp_bow_forest','exp_sword_forest','exp_staff_forest','exp_mace_forest',
  'exp_sword_stone','exp_bow_stone','exp_spear_crystal','exp_wand_crystal','exp_hammer_stone',
  'exp_blade_shadow','exp_staff_shadow','exp_axe_abyss','exp_glaive_abyss','exp_orb_abyss','exp_scythe_abyss','exp_whip_abyss',
  'exp_katana_void','exp_grimoire_void','exp_halberd_void','exp_talisman_void','exp_claws_void','exp_lance_briseur'
]);

async function main() {
  // All won items
  const r = await pool.query(
    "SELECT winner_username, item_id, item_name, rarity FROM expedition_loot WHERE winner_username IS NOT NULL ORDER BY winner_username, id"
  );

  const counts = {};
  r.rows.forEach(row => {
    const u = row.winner_username;
    if (!counts[u]) counts[u] = { weapons: [], armor: [] };
    if (WEAPON_IDS.has(row.item_id)) {
      counts[u].weapons.push(row.item_id);
    } else {
      counts[u].armor.push(row.item_id);
    }
  });

  console.log('=== LOOT PAR JOUEUR ===');
  Object.entries(counts).forEach(([u, c]) => {
    console.log(`${u}: ${c.weapons.length} weapons, ${c.armor.length} armor`);
    if (c.weapons.length > 0) console.log('  weapons:', c.weapons.join(', '));
  });

  // Check total loot and expeditions
  const exp = await pool.query("SELECT DISTINCT expedition_id FROM expedition_loot ORDER BY expedition_id");
  console.log('\n=== EXPEDITIONS ===');
  console.log('Total expeditions with loot:', exp.rows.length);
  console.log('IDs:', exp.rows.map(r => r.expedition_id).join(', '));

  // Sample recent loot
  const recent = await pool.query("SELECT item_id, item_name, rarity, winner_username FROM expedition_loot ORDER BY id DESC LIMIT 10");
  console.log('\n=== 10 DERNIERS LOOTS ===');
  recent.rows.forEach(r => console.log(`  ${r.winner_username || 'NO WINNER'}: ${r.item_name} (${r.rarity}) [${r.item_id}]`));

  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
