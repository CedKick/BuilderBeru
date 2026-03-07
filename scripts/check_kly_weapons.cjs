const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://builderberu:beru-local-2026-secure@localhost:5432/neondb' });

async function main() {
  const r = await pool.query("SELECT data FROM user_storage WHERE device_id=(SELECT device_id FROM users WHERE LOWER(username)=LOWER('Kly')) AND storage_key='shadow_colosseum_data'");
  const d = typeof r.rows[0].data === 'string' ? JSON.parse(r.rows[0].data) : r.rows[0].data;
  const wc = d.weaponCollection || {};
  const all = Object.entries(wc);
  console.log('Total weapons:', all.length);
  console.log('\nExpedition weapons (non w_ prefix):');
  all.filter(([k]) => k.indexOf('w_') !== 0).forEach(([k,v]) => console.log('  ' + k + ': A' + v));
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
