// api/drop-log.js — Global legendary drop feed (POST submit + GET recent)
import { query } from './_db/neon.js';
import { extractUser } from './_utils/auth.js';

async function handleInit(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  await query(`
    CREATE TABLE IF NOT EXISTS legendary_drops (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      username VARCHAR(20) NOT NULL,
      item_type VARCHAR(16) NOT NULL,
      item_id VARCHAR(64) NOT NULL,
      item_name VARCHAR(64) NOT NULL,
      item_rarity VARCHAR(16),
      awakening INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await query('CREATE INDEX IF NOT EXISTS idx_drops_created ON legendary_drops(created_at DESC)');

  return res.status(200).json({ success: true });
}

async function handleSubmit(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { itemType, itemId, itemName, itemRarity, awakening } = req.body;

  if (!itemType || !itemId || !itemName) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // Rate-limit: max 10 drops per user per hour
  const recent = await query(
    `SELECT COUNT(*) as cnt FROM legendary_drops WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
    [user.userId]
  );
  if (parseInt(recent.rows[0]?.cnt, 10) >= 10) {
    return res.status(429).json({ error: 'Rate limit' });
  }

  await query(
    `INSERT INTO legendary_drops (user_id, username, item_type, item_id, item_name, item_rarity, awakening)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [user.userId, user.username.slice(0, 20), itemType.slice(0, 16), itemId.slice(0, 64), itemName.slice(0, 64), (itemRarity || '').slice(0, 16), awakening || 0]
  );

  return res.status(200).json({ success: true });
}

async function handleRecent(req, res) {
  const result = await query(
    `SELECT id, username, item_type, item_id, item_name, item_rarity, awakening, created_at
     FROM legendary_drops
     ORDER BY created_at DESC
     LIMIT 50`
  );

  return res.status(200).json({
    success: true,
    drops: result.rows.map(r => ({
      id: r.id,
      username: r.username,
      itemType: r.item_type,
      itemId: r.item_id,
      itemName: r.item_name,
      itemRarity: r.item_rarity,
      awakening: r.awakening,
      createdAt: r.created_at,
    })),
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://builderberu.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query.action;

  try {
    switch (action) {
      case 'init':
        return await handleInit(req, res);
      case 'submit':
        return await handleSubmit(req, res);
      case 'recent':
        return await handleRecent(req, res);
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err) {
    console.error('Drop log error:', err);
    return res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}
