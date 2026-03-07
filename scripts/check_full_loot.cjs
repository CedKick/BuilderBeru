const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://builderberu:beru-local-2026-secure@localhost:5432/neondb' });

const REAL_PLAYERS = new Set(['Kly', 'damon', 'shy', 'Bobby', 'GRRRRRRRRRRRRRR']);

async function main() {
  // All loot with winners for real players
  const all = await pool.query(
    "SELECT expedition_id, encounter_index, item_id, item_name, rarity, winner_username, stolen, sr_winner FROM expedition_loot ORDER BY expedition_id, encounter_index, id"
  );

  // Group by expedition
  const exps = {};
  all.rows.forEach(r => {
    const eid = r.expedition_id;
    if (!exps[eid]) exps[eid] = [];
    exps[eid].push(r);
  });

  console.log('=== TOUTES LES EXPEDITIONS ===\n');
  for (const [eid, items] of Object.entries(exps)) {
    const players = new Set(items.filter(i => i.winner_username).map(i => i.winner_username));
    const realPlayers = [...players].filter(p => REAL_PLAYERS.has(p));
    if (realPlayers.length === 0) continue; // skip test expeditions

    console.log(`--- Expedition #${eid} (${items.length} items, players: ${[...players].join(', ')}) ---`);

    // Count items per player
    const perPlayer = {};
    let noWinner = 0;
    items.forEach(i => {
      if (!i.winner_username) { noWinner++; return; }
      if (!perPlayer[i.winner_username]) perPlayer[i.winner_username] = { weapons: [], armor: [], other: [] };
      if (i.item_id && (i.item_id.includes('sword') || i.item_id.includes('bow') || i.item_id.includes('dagger') || i.item_id.includes('staff') || i.item_id.includes('mace') || i.item_id.includes('blade') || i.item_id.includes('axe') || i.item_id.includes('scythe') || i.item_id.includes('whip') || i.item_id.includes('katana') || i.item_id.includes('grimoire') || i.item_id.includes('halberd') || i.item_id.includes('talisman') || i.item_id.includes('claws') || i.item_id.includes('lance') || i.item_id.includes('hammer') || i.item_id.includes('spear') || i.item_id.includes('wand') || i.item_id.includes('orb') || i.item_id.includes('glaive') || i.item_id === 'excalibur' || i.item_id === 'mjolnir' || i.item_id === 'muramasa' || i.item_id === 'yggdrasil' || i.item_id === 'gungnir' || i.item_id === 'nidhogg' || i.item_id === 'aegis_weapon' || i.item_id === 'caladbolg' || i.item_id === 'thyrsus' || i.item_id === 'gram')) {
        perPlayer[i.winner_username].weapons.push(`${i.item_name} (${i.rarity})`);
      } else if (i.item_id && i.item_id.startsWith('exp_ultimate_scroll')) {
        perPlayer[i.winner_username].other.push(i.item_name);
      } else {
        perPlayer[i.winner_username].armor.push(`${i.item_name} (${i.rarity})`);
      }
    });

    for (const [player, loot] of Object.entries(perPlayer)) {
      if (!REAL_PLAYERS.has(player)) continue;
      console.log(`  ${player}: ${loot.weapons.length}W ${loot.armor.length}A ${loot.other.length}O`);
      if (loot.weapons.length > 0) console.log(`    Armes: ${loot.weapons.join(', ')}`);
    }
    if (noWinner > 0) console.log(`  (${noWinner} items sans gagnant)`);
    console.log('');
  }

  // Now check what's in DB vs what should be
  console.log('=== VERIFICATION DB ===\n');
  for (const username of REAL_PLAYERS) {
    const ur = await pool.query("SELECT device_id FROM users WHERE LOWER(username) = LOWER($1)", [username]);
    if (ur.rows.length === 0) continue;
    const did = ur.rows[0].device_id;
    const dr = await pool.query("SELECT data FROM user_storage WHERE device_id = $1 AND storage_key = 'shadow_colosseum_data'", [did]);
    if (dr.rows.length === 0) continue;
    const data = typeof dr.rows[0].data === 'string' ? JSON.parse(dr.rows[0].data) : dr.rows[0].data;

    // Expedition weapons in weaponCollection
    const wc = data.weaponCollection || {};
    const expWeapons = Object.entries(wc).filter(([k]) => !k.startsWith('w_'));

    // Expedition artifacts
    const inv = data.artifactInventory || [];
    const expArts = inv.filter(a => a.source === 'expedition');

    // Expected from loot table
    const expectedLoot = all.rows.filter(r => r.winner_username === username);
    const expectedWeapons = expectedLoot.filter(r => r.item_id && (r.item_id.includes('sword') || r.item_id.includes('bow') || r.item_id.includes('dagger') || r.item_id.includes('staff') || r.item_id.includes('mace') || r.item_id.includes('blade') || r.item_id.includes('axe') || r.item_id.includes('scythe') || r.item_id.includes('whip') || r.item_id.includes('katana') || r.item_id.includes('grimoire') || r.item_id.includes('halberd') || r.item_id.includes('talisman') || r.item_id.includes('claws') || r.item_id.includes('lance') || r.item_id.includes('hammer') || r.item_id.includes('spear') || r.item_id.includes('wand') || r.item_id.includes('orb') || r.item_id.includes('glaive') || r.item_id === 'excalibur' || r.item_id === 'mjolnir' || r.item_id === 'muramasa' || r.item_id === 'yggdrasil' || r.item_id === 'gungnir' || r.item_id === 'nidhogg' || r.item_id === 'aegis_weapon' || r.item_id === 'caladbolg' || r.item_id === 'thyrsus' || r.item_id === 'gram'));
    const expectedArmor = expectedLoot.filter(r => r.item_id && !r.item_id.startsWith('exp_ultimate') && !expectedWeapons.includes(r));

    console.log(`${username}:`);
    console.log(`  Loot table: ${expectedWeapons.length} weapons, ${expectedArmor.length} armor`);
    console.log(`  DB weapons: ${expWeapons.length} unique exp (${expWeapons.map(([k,v])=>k+':A'+v).join(', ')})`);
    console.log(`  DB exp artifacts: ${expArts.length}`);
    console.log('');
  }

  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
