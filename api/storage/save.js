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

// Anti-corruption: refuse to overwrite cloud with much smaller data
const CORRUPTION_RATIO = 0.3;   // new < 30% of existing → suspicious
const MIN_SIZE_CHECK = 200;      // only check if existing data > 200 bytes

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://builderberu.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { deviceId: bodyDeviceId, key, data, clientTimestamp } = req.body;

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

    // ─── Server-side anti-corruption check ──────────────────
    // Fetch existing row to compare size + timestamp
    const existing = await query(
      'SELECT size_bytes, updated_at FROM user_storage WHERE device_id = $1 AND storage_key = $2',
      [deviceId, key]
    );

    if (existing.rows.length > 0) {
      const cloudSize = existing.rows[0].size_bytes || 0;
      const cloudUpdatedAt = new Date(existing.rows[0].updated_at).getTime();

      // CHECK 1: Size — refuse if new data is suspiciously small
      if (cloudSize > MIN_SIZE_CHECK && sizeBytes < cloudSize * CORRUPTION_RATIO) {
        console.warn(
          `[save] BLOCKED: ${key} for ${deviceId} — new ${sizeBytes}B vs cloud ${cloudSize}B (${(sizeBytes/cloudSize*100).toFixed(0)}%)`
        );
        return res.status(409).json({
          error: 'Data corruption protection',
          reason: `New data (${sizeBytes}B) is much smaller than cloud (${cloudSize}B). Save blocked to prevent data loss.`,
          cloudSize,
          newSize: sizeBytes,
        });
      }

      // CHECK 2: Timestamp — if client says "I last saw cloud at time X" and cloud is newer,
      // someone else wrote in between → warn but still allow if data is >= size
      if (clientTimestamp && cloudUpdatedAt > clientTimestamp) {
        // Cloud was updated AFTER the client's last known state
        // If new data is also smaller → likely stale tab, block it
        if (sizeBytes < cloudSize * 0.8) {
          console.warn(
            `[save] BLOCKED stale: ${key} for ${deviceId} — client ts ${clientTimestamp} < cloud ts ${cloudUpdatedAt}, size ${sizeBytes}B < ${cloudSize}B`
          );
          return res.status(409).json({
            error: 'Stale data rejected',
            reason: `Cloud was updated at ${new Date(cloudUpdatedAt).toISOString()} after your last sync. Your data is also smaller. Save blocked.`,
            cloudUpdatedAt,
            clientTimestamp,
          });
        }
        // If new data is bigger or similar size → allow (player progressed on both)
      }
    }

    // ─── Write ──────────────────────────────────────────────
    const result = await query(
      `INSERT INTO user_storage (device_id, storage_key, data, size_bytes, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (device_id, storage_key)
       DO UPDATE SET data = $3, size_bytes = $4, updated_at = NOW()
       RETURNING updated_at`,
      [deviceId, key, jsonStr, sizeBytes]
    );

    const serverTimestamp = new Date(result.rows[0].updated_at).getTime();

    return res.status(200).json({
      success: true,
      size: sizeBytes,
      serverTimestamp,
    });
  } catch (err) {
    console.error('Save error:', err);
    return res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}
