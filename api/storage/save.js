import { query } from '../_db/neon.js';
import { extractUser } from '../_utils/auth.js';

const ALLOWED_KEYS = [
  'builderberu_users', 'shadow_colosseum_data', 'shadow_colosseum_raid',
  'beru_chibi_collection', 'beru_companions', 'beru_mascot_visible',
  'beruvianbeta_users', 'builderberu_shadow_coins', 'shadow_achievements',
  'builderberu_easter_eggs', 'builderberu_easter_progress',
  'lorestory_completed', 'hallofflame_cache', 'pvp_data',
];

const MAX_SIZE = 2 * 1024 * 1024; // 2MB max per key

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://builderberu.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { deviceId: bodyDeviceId, key, data } = req.body;

    // If auth token present, use the user's canonical deviceId
    let deviceId = bodyDeviceId;
    const user = await extractUser(req);
    if (user) {
      deviceId = user.deviceId;
    }

    if (!deviceId || !key || data === undefined) {
      return res.status(400).json({ error: 'Missing deviceId, key, or data' });
    }

    // Only allow known keys
    if (!ALLOWED_KEYS.includes(key)) {
      return res.status(403).json({ error: 'Key not allowed' });
    }

    // Validate deviceId format
    if (!deviceId.startsWith('dev_') || deviceId.length > 50) {
      return res.status(403).json({ error: 'Invalid deviceId' });
    }

    const jsonStr = JSON.stringify(data);
    const sizeBytes = Buffer.byteLength(jsonStr, 'utf8');

    // Reject oversized payloads
    if (sizeBytes > MAX_SIZE) {
      return res.status(413).json({ error: 'Payload too large', max: MAX_SIZE });
    }

    await query(
      `INSERT INTO user_storage (device_id, storage_key, data, size_bytes, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (device_id, storage_key)
       DO UPDATE SET data = $3, size_bytes = $4, updated_at = NOW()`,
      [deviceId, key, jsonStr, sizeBytes]
    );

    return res.status(200).json({ success: true, size: sizeBytes });
  } catch (err) {
    console.error('Save error:', err);
    return res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}
