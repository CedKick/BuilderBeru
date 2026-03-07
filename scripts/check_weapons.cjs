const fs = require('fs');
const d = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const storageKeys = Object.keys(d.storage || {});
console.log('storage keys:', storageKeys);
const s = (d.storage || {}).shadow_colosseum_data || {};
const r = (d.storage || {}).shadow_colosseum_raid || {};
const wc = s.weaponCollection || {};
console.log('weaponCollection:', Object.keys(wc).length);
const expW = Object.keys(wc).filter(k => k.indexOf('w_') !== 0);
console.log('non-w_ weapons:', expW);
const inv = s.artifactInventory || [];
console.log('artifacts:', inv.length);
console.log('expedition arts:', inv.filter(a => a.source === 'expedition').length);
const wa = inv.filter(a => a.slot === 'weapon');
console.log('weapon-slot:', wa.length);
if (wa.length > 0) console.log('weapon samples:', JSON.stringify(wa.slice(0,2)));
const ea = inv.filter(a => a.source === 'expedition');
if (ea.length > 0) {
  const types = {};
  ea.forEach(a => { types[a.slot] = (types[a.slot]||0)+1; });
  console.log('expedition by slot:', types);
}
console.log('raid expInv:', (r.expeditionInventory || []).length);
