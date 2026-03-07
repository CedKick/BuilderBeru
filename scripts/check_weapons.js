const fs = require('fs');
const d = JSON.parse(fs.readFileSync('/tmp/kly_data.json', 'utf8'));
const s = d.data?.shadow_colosseum_data;
const r = d.data?.shadow_colosseum_raid;

console.log('=== WEAPONS ===');
const wc = s?.weaponCollection || {};
console.log('weaponCollection count:', Object.keys(wc).length);
const expW = Object.keys(wc).filter(k => k.indexOf('w_') !== 0);
console.log('non-w_ weapons:', expW);

console.log('\n=== ARTIFACTS ===');
const inv = s?.artifactInventory || [];
console.log('artifactInventory total:', inv.length);
const ea = inv.filter(a => a.source === 'expedition');
console.log('expedition artifacts:', ea.length);
const wa = inv.filter(a => a.slot === 'weapon');
console.log('weapon-slot artifacts:', wa.length);
if (wa.length > 0) console.log('samples:', JSON.stringify(wa.slice(0, 3), null, 2));

console.log('\n=== RAID ===');
const ri = r?.expeditionInventory || [];
console.log('raid expeditionInventory:', ri.length);
if (ri.length > 0) {
  const types = {};
  ri.forEach(i => { types[i.type] = (types[i.type]||0)+1; });
  console.log('types:', types);
}
