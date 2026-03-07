/**
 * Extract dominant color palettes from DrawBeru model reference images.
 * Uses sharp to decode images and median-cut quantization to find 8 dominant colors.
 * Skips near-white (R>230,G>230,B>230) and near-black (R<25,G<25,B<25) pixels.
 */

const https = require('https');
const sharp = require('sharp');

const MODELS = {
  Mountains: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806323/pays1_color_li1nz4.png',
  Chrismas: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806336/pays2_orig_h4inrm.png',
  GutsDefault: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806366/berserk2_orig_a3nlvr.jpg',
  GutsSecond: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806349/berserk1_orig_u10357.jpg',
  Brunette: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806377/mang3_orig_h4vmdq.png',
  Shinjuku: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806428/mang5_orig_dznnxy.png',
  BikeSurbubTokyo: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806441/mang7_orig_nuff0y.png',
  Annapurna: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806440/mang6_orig_n4jetc.png',
  GreenPark: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806442/mang9_orig_y8th46.png',
  PeaceinAlpes: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806446/mang8_orig_xgrugz.png',
  MeetCat: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1765806447/mang10_orig_aiybao.png',
};

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function getPixels(url) {
  const buf = await downloadImage(url);
  // Resize to max 200px wide to speed up processing, extract raw RGB
  const { data, info } = await sharp(buf)
    .resize(200, 200, { fit: 'inside' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = [];
  for (let i = 0; i < data.length; i += 3) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    // Skip near-white and near-black
    if (r > 230 && g > 230 && b > 230) continue;
    if (r < 25 && g < 25 && b < 25) continue;
    pixels.push([r, g, b]);
  }
  return pixels;
}

// Median cut quantization
function medianCut(pixels, numColors) {
  if (pixels.length === 0) return [];

  function getRange(bucket) {
    let rMin = 255, rMax = 0, gMin = 255, gMax = 0, bMin = 255, bMax = 0;
    for (const [r, g, b] of bucket) {
      if (r < rMin) rMin = r; if (r > rMax) rMax = r;
      if (g < gMin) gMin = g; if (g > gMax) gMax = g;
      if (b < bMin) bMin = b; if (b > bMax) bMax = b;
    }
    return { rRange: rMax - rMin, gRange: gMax - gMin, bRange: bMax - bMin };
  }

  function splitBucket(bucket) {
    if (bucket.length <= 1) return [bucket];
    const { rRange, gRange, bRange } = getRange(bucket);
    let channel;
    if (rRange >= gRange && rRange >= bRange) channel = 0;
    else if (gRange >= rRange && gRange >= bRange) channel = 1;
    else channel = 2;

    bucket.sort((a, b) => a[channel] - b[channel]);
    const mid = Math.floor(bucket.length / 2);
    return [bucket.slice(0, mid), bucket.slice(mid)];
  }

  let buckets = [pixels];
  while (buckets.length < numColors) {
    // Find bucket with largest range to split
    let bestIdx = 0, bestRange = 0;
    for (let i = 0; i < buckets.length; i++) {
      if (buckets[i].length <= 1) continue;
      const { rRange, gRange, bRange } = getRange(buckets[i]);
      const maxRange = Math.max(rRange, gRange, bRange);
      if (maxRange > bestRange) {
        bestRange = maxRange;
        bestIdx = i;
      }
    }
    if (bestRange === 0) break;
    const [a, b] = splitBucket(buckets[bestIdx]);
    buckets.splice(bestIdx, 1, a, b);
  }

  // Average each bucket
  return buckets.map((bucket) => {
    if (bucket.length === 0) return null;
    let rSum = 0, gSum = 0, bSum = 0;
    for (const [r, g, b] of bucket) {
      rSum += r; gSum += g; bSum += b;
    }
    const n = bucket.length;
    return [Math.round(rSum / n), Math.round(gSum / n), Math.round(bSum / n)];
  }).filter(Boolean);
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

// Sort colors by hue for nicer palette ordering
function colorSortKey([r, g, b]) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  if (max !== min) {
    const d = max - min;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return h;
}

async function main() {
  const results = {};

  for (const [name, url] of Object.entries(MODELS)) {
    process.stderr.write(`Processing ${name}...`);
    try {
      const pixels = await getPixels(url);
      let colors = medianCut(pixels, 8);
      // Sort by hue
      colors.sort((a, b) => colorSortKey(a) - colorSortKey(b));
      results[name] = colors.map(([r, g, b]) => rgbToHex(r, g, b));
      process.stderr.write(` OK (${pixels.length} pixels)\n`);
    } catch (e) {
      process.stderr.write(` ERROR: ${e.message}\n`);
      results[name] = [];
    }
  }

  // Output as JS
  console.log('// Extracted palettes for DrawBeru models');
  console.log('const PALETTES = {');
  for (const [name, palette] of Object.entries(results)) {
    console.log(`  ${name}: [${palette.map(c => `'${c}'`).join(', ')}],`);
  }
  console.log('};');
}

main().catch(e => { console.error(e); process.exit(1); });
