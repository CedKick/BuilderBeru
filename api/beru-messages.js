// api/beru-messages.js — Admin broadcast messages via Béru mascot
import { query } from './_db/neon.js';
import { extractUser } from './_utils/auth.js';

// ═══════════════════════════════════════════════════════════════
// INIT — Create admin_messages table
// ═══════════════════════════════════════════════════════════════

async function handleInit(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Only kly can init
  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  if (user.username.toLowerCase() !== 'kly') return res.status(403).json({ error: 'Forbidden: Admin only' });

  await query(`
    CREATE TABLE IF NOT EXISTS admin_messages (
      id SERIAL PRIMARY KEY,
      author VARCHAR(20) NOT NULL,
      message TEXT NOT NULL,
      mood VARCHAR(20) DEFAULT 'normal',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await query('CREATE INDEX IF NOT EXISTS idx_admin_messages_created ON admin_messages(created_at DESC)');

  return res.status(200).json({ success: true });
}

// ═══════════════════════════════════════════════════════════════
// SEND — Post new admin message (kly only)
// ═══════════════════════════════════════════════════════════════

async function handleSend(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Auth check
  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  if (user.username.toLowerCase() !== 'kly') return res.status(403).json({ error: 'Forbidden: Admin only' });

  // Validate body
  const { message, mood } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message required' });
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage.length === 0) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  if (trimmedMessage.length > 200) {
    return res.status(400).json({ error: 'Message too long (max 200 characters)' });
  }

  const validMoods = ['normal', 'excited', 'calm', 'happy', 'proud', 'confused'];
  const finalMood = (mood && validMoods.includes(mood)) ? mood : 'normal';

  // Rate limit: max 1 message per minute
  const recentCount = await query(
    `SELECT COUNT(*) as cnt FROM admin_messages
     WHERE author = $1 AND created_at > NOW() - INTERVAL '1 minute'`,
    [user.username]
  );

  if (parseInt(recentCount.rows[0]?.cnt, 10) >= 1) {
    return res.status(429).json({ error: 'Rate limit: 1 message per minute' });
  }

  // Insert message
  const result = await query(
    `INSERT INTO admin_messages (author, message, mood)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [user.username, trimmedMessage, finalMood]
  );

  return res.status(200).json({
    success: true,
    messageId: result.rows[0].id
  });
}

// ═══════════════════════════════════════════════════════════════
// RECENT — Get recent messages (last 7 days, public)
// ═══════════════════════════════════════════════════════════════

async function handleRecent(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const result = await query(
    `SELECT id, author, message, mood, created_at
     FROM admin_messages
     WHERE created_at > NOW() - INTERVAL '7 days'
     ORDER BY created_at DESC
     LIMIT 50`
  );

  return res.status(200).json({
    success: true,
    messages: result.rows.map(r => ({
      id: r.id,
      author: r.author,
      message: r.message,
      mood: r.mood,
      createdAt: r.created_at,
    })),
  });
}

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://builderberu.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query.action;

  try {
    switch (action) {
      case 'init':
        return await handleInit(req, res);
      case 'send':
        return await handleSend(req, res);
      case 'recent':
        return await handleRecent(req, res);
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err) {
    console.error('Beru messages error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}
