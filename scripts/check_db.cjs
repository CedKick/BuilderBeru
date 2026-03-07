// Run on server: node check_db.cjs
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://builderberu:beru-local-2026-secure@localhost:5432/neondb' });

async function main() {
  const users = ['Kly', 'damon', 'shy', 'Bobby', 'GRRRRRRRRRRRRRR'];
  for (const username of users) {
    const ur = await pool.query("SELECT device_id FROM users WHERE LOWER(username) = LOWER($1)", [username]);
    if (ur.rows.length === 0) { console.log(username, ': NOT FOUND'); continue; }
    const did = ur.rows[0].device_id;
    const dr = await pool.query("SELECT data FROM user_storage WHERE device_id = $1 AND storage_key = 'shadow_colosseum_data'", [did]);
    if (dr.rows.length === 0) { console.log(username, ': NO SAVE DATA'); continue; }
    const data = typeof dr.rows[0].data === 'string' ? JSON.parse(dr.rows[0].data) : dr.rows[0].data;
    const wc = data.weaponCollection || {};
    const inv = data.artifactInventory || [];
    const expArts = inv.filter(a => a.source === 'expedition');
    const wSlot = inv.filter(a => a.slot === 'weapon');
    const expWk = Object.keys(wc).filter(k => k.indexOf('w_') !== 0);
    console.log(`${username}: weapons=${Object.keys(wc).length} (exp:${expWk.length} ${expWk.join(',')}) | arts=${inv.length} (exp:${expArts.length}, weapon-slot:${wSlot.length})`);
  }
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
