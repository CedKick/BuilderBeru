import { query } from '../_db/neon.js';

// Server-to-server secret (game server → Vercel)
const GAME_SERVER_SECRET = process.env.GAME_SERVER_SECRET || 'manaya-raid-secret-key';

export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin;
  if (['https://builderberu.com', 'http://localhost:5173', 'http://localhost:3001'].includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Server-Secret');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Validate server secret
    const secret = req.headers['x-server-secret'];
    if (secret !== GAME_SERVER_SECRET) {
      return res.status(403).json({ error: 'Invalid server secret' });
    }

    const { username, raidData } = req.body;
    if (!username || !raidData) {
      return res.status(400).json({ error: 'Missing username or raidData' });
    }

    // Find user by username (case-insensitive)
    const userResult = await query(
      'SELECT id, device_id FROM users WHERE LOWER(username) = LOWER($1)',
      [username]
    );
    if (userResult.rows.length === 0) {
      return res.status(200).json({ success: false, status: 'user_not_found' });
    }

    const deviceId = userResult.rows[0].device_id;

    // Read current shadow_colosseum_raid data
    const existing = await query(
      'SELECT data FROM user_storage WHERE device_id = $1 AND storage_key = $2',
      [deviceId, 'shadow_colosseum_raid']
    );

    let finalData = raidData;

    if (existing.rows.length > 0) {
      const cloud = typeof existing.rows[0].data === 'string'
        ? JSON.parse(existing.rows[0].data) : existing.rows[0].data;

      // Smart merge
      finalData = mergeRaidStorage(cloud, raidData);
    }

    // Write to Neon DB
    const jsonStr = JSON.stringify(finalData);
    const sizeBytes = Buffer.byteLength(jsonStr, 'utf8');

    await query(
      `INSERT INTO user_storage (device_id, storage_key, data, size_bytes, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (device_id, storage_key)
       DO UPDATE SET data = $3, size_bytes = $4, updated_at = NOW()`,
      [deviceId, 'shadow_colosseum_raid', jsonStr, sizeBytes]
    );

    return res.status(200).json({ success: true, status: 'ok' });
  } catch (err) {
    console.error('[deposit-raid] Error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

function mergeRaidStorage(cloud, incoming) {
  const m = { ...incoming };

  // feathers: MAX (never lose forge currency)
  m.feathers = Math.max(cloud.feathers || 0, incoming.feathers || 0);

  // manayaOwned: OR (true wins — never un-forge)
  const cOwn = cloud.manayaOwned || {};
  const iOwn = incoming.manayaOwned || {};
  m.manayaOwned = { ...iOwn };
  for (const [k, v] of Object.entries(cOwn)) {
    if (v) m.manayaOwned[k] = true;
  }

  // inventory: keep the longer one (anti-exploit, like artifactInventory)
  const cInv = cloud.inventory || [];
  const iInv = incoming.inventory || [];
  m.inventory = cInv.length > iInv.length ? cInv : iInv;

  // equipped: incoming wins (last active session)
  m.equipped = incoming.equipped || cloud.equipped || { weapon: null, artifacts: {} };

  // statPoints: MAX per stat
  const cPts = cloud.statPoints || {};
  const iPts = incoming.statPoints || {};
  m.statPoints = {};
  for (const s of ['hp', 'atk', 'def', 'spd', 'crit', 'res']) {
    m.statPoints[s] = Math.max(cPts[s] || 0, iPts[s] || 0);
  }

  return m;
}
