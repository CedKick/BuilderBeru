import { query } from '../_db/neon.js';

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (['https://builderberu.com', 'https://www.builderberu.com', 'http://localhost:5173'].includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'Missing username' });

  try {
    // Find user by username (case-insensitive)
    const userResult = await query(
      'SELECT device_id FROM users WHERE LOWER(username) = LOWER($1)',
      [username]
    );
    if (userResult.rows.length === 0) {
      return res.status(200).json({ success: false, error: 'user_not_found' });
    }

    const deviceId = userResult.rows[0].device_id;

    // Read shadow_colosseum_raid data
    const result = await query(
      'SELECT data FROM user_storage WHERE device_id = $1 AND storage_key = $2',
      [deviceId, 'shadow_colosseum_raid']
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ success: true, raidData: null });
    }

    const data = typeof result.rows[0].data === 'string'
      ? JSON.parse(result.rows[0].data) : result.rows[0].data;

    return res.status(200).json({ success: true, raidData: data });
  } catch (err) {
    console.error('[load-raid] Error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
