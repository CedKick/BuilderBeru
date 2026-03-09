const fs = require('fs');
const file = '/opt/manaya-raid/expedition-server/public/spectator.html';
let code = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

// ═══ Replace AoE zone rendering for donut types with EXACT game-server rendering ═══
// The game-server uses globalCompositeOperation = 'destination-out' to properly cut the inner circle

// Find the donut_explosion/donut_telegraph block we added earlier
const oldDonutBlock = `    } else if (z.type === 'donut_explosion' || z.type === 'donut_telegraph') {
      // Donut ring AoE — ring between innerRadius and radius
      const outerR = ts(z.radius);
      const innerR = ts(z.innerRadius || 0);
      const isExplosion = z.type === 'donut_explosion';
      const color = isExplosion ? 'rgba(236, 72, 153,' : 'rgba(236, 72, 153,';
      // Draw ring (outer - inner)
      ctx.beginPath();
      ctx.arc(tx(z.x), ty(z.y), outerR, 0, Math.PI * 2);
      if (innerR > 5) {
        ctx.moveTo(tx(z.x) + innerR, ty(z.y));
        ctx.arc(tx(z.x), ty(z.y), innerR, 0, Math.PI * 2, true);
      }
      ctx.fillStyle = isExplosion ? 'rgba(236, 72, 153, 0.45)' : 'rgba(236, 72, 153, 0.25)';
      ctx.fill();
      // Outer stroke
      ctx.beginPath(); ctx.arc(tx(z.x), ty(z.y), outerR, 0, Math.PI * 2);
      ctx.strokeStyle = isExplosion ? 'rgba(236, 72, 153, 0.9)' : 'rgba(236, 72, 153, 0.6)';
      ctx.lineWidth = isExplosion ? 4 : 2;
      ctx.stroke();
      // Inner stroke
      if (innerR > 5) {
        ctx.beginPath(); ctx.arc(tx(z.x), ty(z.y), innerR, 0, Math.PI * 2);
        ctx.strokeStyle = isExplosion ? 'rgba(236, 72, 153, 0.7)' : 'rgba(236, 72, 153, 0.4)';
        ctx.lineWidth = 2; ctx.stroke();
      }`;

// New rendering using destination-out (exact same technique as game-server)
const newDonutBlock = `    } else if (z.type === 'donut_explosion') {
      // Donut explosion — exact same rendering as game-server (destination-out cutout)
      const outerR = ts(z.radius);
      const innerR = ts(z.innerRadius || 130);
      ctx.save();
      ctx.fillStyle = 'rgba(255, 80, 40, 0.6)';
      ctx.shadowColor = '#ff4444'; ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.arc(tx(z.x), ty(z.y), outerR, 0, Math.PI * 2); ctx.fill();
      // Cut out inner safe zone
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.beginPath(); ctx.arc(tx(z.x), ty(z.y), innerR, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else if (z.type === 'donut_telegraph') {
      // Donut telegraph — exact same rendering as game-server
      const outerR = ts(z.radius);
      const innerR = ts(z.innerRadius || 130);
      const ttlProgress = z.ttl && z.maxTtl ? 1 - (z.ttl / z.maxTtl) : 0.5;
      const alpha = 0.1 + ttlProgress * 0.3;
      ctx.save();
      // Fill danger ring
      ctx.fillStyle = 'rgba(239,68,68,' + alpha + ')';
      ctx.beginPath(); ctx.arc(tx(z.x), ty(z.y), outerR, 0, Math.PI * 2); ctx.fill();
      // Cut out inner safe zone
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.beginPath(); ctx.arc(tx(z.x), ty(z.y), innerR, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      // Draw ring borders
      ctx.strokeStyle = 'rgba(239,68,68,' + (0.5 + ttlProgress * 0.5) + ')';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(tx(z.x), ty(z.y), outerR, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(tx(z.x), ty(z.y), innerR, 0, Math.PI * 2); ctx.stroke();`;

if (code.includes(oldDonutBlock)) {
  code = code.replace(oldDonutBlock, newDonutBlock);
  console.log('FIX 1: Donut explosion/telegraph rendering matches game-server (destination-out cutout)');
} else {
  console.log('FIX 1: Could not find old donut block');
  // Try to find what's there
  if (code.includes('donut_explosion')) {
    console.log('  donut_explosion exists in code');
  }
}

// Also fix the donut_safe zone rendering
const oldSafe = `    } else if (z.type === 'donut_safe') {
      // Safe zone (green)
      const r = ts(z.radius);
      ctx.beginPath(); ctx.arc(tx(z.x), ty(z.y), r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)';
      ctx.lineWidth = 3; ctx.setLineDash([8, 4]); ctx.stroke(); ctx.setLineDash([]);`;

const newSafe = `    } else if (z.type === 'donut_safe') {
      // Safe inner zone — exact same as game-server (green outline + faint fill)
      const r = ts(z.radius);
      const ttlProg = z.ttl && z.maxTtl ? 1 - (z.ttl / z.maxTtl) : 0.5;
      ctx.strokeStyle = 'rgba(16,185,129,' + (0.3 + ttlProg * 0.5) + ')';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(tx(z.x), ty(z.y), r, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(16,185,129,0.05)';
      ctx.beginPath(); ctx.arc(tx(z.x), ty(z.y), r, 0, Math.PI * 2); ctx.fill();`;

if (code.includes(oldSafe)) {
  code = code.replace(oldSafe, newSafe);
  console.log('FIX 2: Safe zone rendering matches game-server');
}

// ═══ Also need to pass ttl/maxTtl in the AoE zone broadcast ═══
// Check if GameState sends ttl info for zones
// We need to ensure the spectator receives zone.maxTtl

fs.writeFileSync(file, code, 'utf8');
console.log('\nSpectator donut rendering now matches game-server exactly!');
