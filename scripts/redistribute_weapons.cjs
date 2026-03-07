// Redistribute expedition weapons from expedition_loot table into weaponCollection
// Run on server: cd /opt/manaya-raid && node redistribute_weapons.cjs

const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://builderberu:beru-local-2026-secure@localhost:5432/neondb' });

const WEAPON_IDS = new Set([
  'excalibur','mjolnir','muramasa','yggdrasil','gungnir','nidhogg','aegis_weapon','caladbolg','thyrsus','gram',
  'exp_dagger_forest','exp_bow_forest','exp_sword_forest','exp_staff_forest','exp_mace_forest',
  'exp_sword_stone','exp_bow_stone','exp_spear_crystal','exp_wand_crystal','exp_hammer_stone',
  'exp_blade_shadow','exp_staff_shadow','exp_axe_abyss','exp_glaive_abyss','exp_orb_abyss','exp_scythe_abyss','exp_whip_abyss',
  'exp_katana_void','exp_grimoire_void','exp_halberd_void','exp_talisman_void','exp_claws_void','exp_lance_briseur'
]);

// Only redistribute to real players (not test bots)
const REAL_PLAYERS = new Set(['Kly', 'damon', 'shy', 'Bobby', 'GRRRRRRRRRRRRRR']);
const MAX_WEAPON_AWAKENING = 100;

async function main() {
  // Get all won weapons from expedition_loot
  const loot = await pool.query(
    "SELECT winner_username, item_id FROM expedition_loot WHERE winner_username IS NOT NULL ORDER BY id"
  );

  // Group weapons by player
  const playerWeapons = {};
  loot.rows.forEach(row => {
    if (!WEAPON_IDS.has(row.item_id)) return;
    if (!REAL_PLAYERS.has(row.winner_username)) return;
    if (!playerWeapons[row.winner_username]) playerWeapons[row.winner_username] = [];
    playerWeapons[row.winner_username].push(row.item_id);
  });

  console.log('=== WEAPONS TO REDISTRIBUTE ===');
  Object.entries(playerWeapons).forEach(([u, ws]) => {
    const unique = [...new Set(ws)];
    console.log(`${u}: ${ws.length} total (${unique.length} unique)`);
  });

  // For each real player, inject into weaponCollection
  const results = [];
  for (const [username, weapons] of Object.entries(playerWeapons)) {
    const ur = await pool.query("SELECT device_id FROM users WHERE LOWER(username) = LOWER($1)", [username]);
    if (ur.rows.length === 0) { console.log(`  ${username}: USER NOT FOUND`); continue; }
    const did = ur.rows[0].device_id;

    const dr = await pool.query(
      "SELECT data FROM user_storage WHERE device_id = $1 AND storage_key = 'shadow_colosseum_data'", [did]
    );
    if (dr.rows.length === 0) { console.log(`  ${username}: NO SAVE DATA`); continue; }

    const data = typeof dr.rows[0].data === 'string' ? JSON.parse(dr.rows[0].data) : dr.rows[0].data;
    if (!data.weaponCollection || typeof data.weaponCollection !== 'object') data.weaponCollection = {};
    if (!data.hammers) data.hammers = {};

    const details = [];
    for (const wId of weapons) {
      if (data.weaponCollection[wId] === undefined) {
        data.weaponCollection[wId] = 0;
        details.push({ id: wId, action: 'added', aw: 0 });
      } else if (data.weaponCollection[wId] >= MAX_WEAPON_AWAKENING) {
        data.hammers.marteau_rouge = (data.hammers.marteau_rouge || 0) + 5;
        details.push({ id: wId, action: 'max→hammers' });
      } else {
        data.weaponCollection[wId] += 1;
        details.push({ id: wId, action: 'awakened', aw: data.weaponCollection[wId] });
      }
    }

    // Also remove any weapon artifacts from artifactInventory (cleanup from old migration)
    if (Array.isArray(data.artifactInventory)) {
      const before = data.artifactInventory.length;
      data.artifactInventory = data.artifactInventory.filter(a => a.slot !== 'weapon');
      const removed = before - data.artifactInventory.length;
      if (removed > 0) details.push({ action: 'cleaned_weapon_artifacts', removed });
    }

    // Write back
    const json = JSON.stringify(data);
    const size = Buffer.byteLength(json, 'utf8');
    await pool.query(
      "UPDATE user_storage SET data = $1, size_bytes = $2, updated_at = NOW() WHERE device_id = $3 AND storage_key = 'shadow_colosseum_data'",
      [json, size, did]
    );

    // Count unique expedition weapons
    const expWeapons = Object.keys(data.weaponCollection).filter(k => WEAPON_IDS.has(k));
    console.log(`  ${username}: OK — ${weapons.length} weapons added, ${expWeapons.length} unique exp weapons, total collection: ${Object.keys(data.weaponCollection).length}`);

    // Show awakening levels for expedition weapons
    const awDetails = expWeapons.map(w => `${w}:A${data.weaponCollection[w]}`);
    console.log(`    → ${awDetails.join(', ')}`);

    results.push({ username, added: weapons.length, details });
  }

  console.log('\n=== DONE ===');
  console.log(JSON.stringify(results.map(r => ({ u: r.username, added: r.added })), null, 2));
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
