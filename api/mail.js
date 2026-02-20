// api/mail.js — Player mail/inbox system with rewards
import { query } from './_db/neon.js';
import { extractUser } from './_utils/auth.js';

// ═══════════════════════════════════════════════════════════════
// INIT — Create player_mail table
// ═══════════════════════════════════════════════════════════════

async function handleInit(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Only kly can init
  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  if (user.username.toLowerCase() !== 'kly') {
    return res.status(403).json({ error: 'Forbidden: Admin only' });
  }

  await query(`
    CREATE TABLE IF NOT EXISTS player_mail (
      id SERIAL PRIMARY KEY,
      recipient_username VARCHAR(20),
      sender VARCHAR(20) DEFAULT 'system',
      subject VARCHAR(100) NOT NULL,
      message TEXT NOT NULL,
      mail_type VARCHAR(20) NOT NULL DEFAULT 'system',
      rewards JSONB,
      claimed BOOLEAN DEFAULT FALSE,
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
    )
  `);

  await query('CREATE INDEX IF NOT EXISTS idx_mail_recipient ON player_mail(recipient_username, created_at DESC)');
  await query('CREATE INDEX IF NOT EXISTS idx_mail_created ON player_mail(created_at DESC)');
  await query('CREATE INDEX IF NOT EXISTS idx_mail_recipient_unread ON player_mail(recipient_username, read) WHERE read = false');

  return res.status(200).json({ success: true });
}

// ═══════════════════════════════════════════════════════════════
// SEND — Send mail (admin only)
// ═══════════════════════════════════════════════════════════════

async function handleSend(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Auth check
  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  if (user.username.toLowerCase() !== 'kly') {
    return res.status(403).json({ error: 'Forbidden: Admin only' });
  }

  const { recipientUsername, subject, message, mailType, rewards } = req.body;

  // Validation
  if (!subject || typeof subject !== 'string' || subject.length > 100) {
    return res.status(400).json({ error: 'Invalid subject (max 100 chars)' });
  }
  if (!message || typeof message !== 'string' || message.length > 2000) {
    return res.status(400).json({ error: 'Invalid message (max 2000 chars)' });
  }
  const validTypes = ['admin', 'system', 'update', 'reward', 'personal', 'faction', 'support'];
  if (!mailType || !validTypes.includes(mailType)) {
    return res.status(400).json({ error: 'Invalid mailType' });
  }

  // If specific recipient, verify user exists
  if (recipientUsername) {
    const userCheck = await query(
      'SELECT id FROM users WHERE username = $1',
      [recipientUsername]
    );
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Recipient not found' });
    }
  }

  // Validate rewards structure if present
  let rewardsJson = null;
  if (rewards) {
    if (rewards.weapons && !Array.isArray(rewards.weapons)) {
      return res.status(400).json({ error: 'rewards.weapons must be array' });
    }
    if (rewards.hammers && typeof rewards.hammers !== 'object') {
      return res.status(400).json({ error: 'rewards.hammers must be object' });
    }
    if (rewards.fragments && typeof rewards.fragments !== 'object') {
      return res.status(400).json({ error: 'rewards.fragments must be object' });
    }
    if (rewards.fragments) {
      const validFragments = ['fragment_sulfuras', 'fragment_raeshalare', 'fragment_katana_z', 'fragment_katana_v'];
      for (const key of Object.keys(rewards.fragments)) {
        if (!validFragments.includes(key)) {
          return res.status(400).json({ error: `Invalid fragment type: ${key}` });
        }
        if (typeof rewards.fragments[key] !== 'number' || rewards.fragments[key] < 1) {
          return res.status(400).json({ error: `Invalid fragment quantity for ${key}` });
        }
      }
    }
    if (rewards.coins !== undefined && typeof rewards.coins !== 'number') {
      return res.status(400).json({ error: 'rewards.coins must be number' });
    }
    rewardsJson = JSON.stringify(rewards);
  }

  // Insert mail
  const result = await query(
    `INSERT INTO player_mail (recipient_username, sender, subject, message, mail_type, rewards)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [recipientUsername, user.username, subject, message, mailType, rewardsJson]
  );

  return res.status(200).json({
    success: true,
    mailId: result.rows[0].id,
    broadcast: !recipientUsername
  });
}

// ═══════════════════════════════════════════════════════════════
// SELF-REWARD — Send reward to self (for forged weapons, etc.)
// ═══════════════════════════════════════════════════════════════

async function handleSelfReward(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Auth check (any logged-in user can send self-rewards)
  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { subject, message, mailType = 'reward', rewards } = req.body;

  // Validation
  if (!subject || typeof subject !== 'string' || subject.length > 100) {
    return res.status(400).json({ error: 'Invalid subject (max 100 chars)' });
  }
  if (!message || typeof message !== 'string' || message.length > 2000) {
    return res.status(400).json({ error: 'Invalid message (max 2000 chars)' });
  }
  if (!rewards) {
    return res.status(400).json({ error: 'Rewards required for self-reward' });
  }

  // Validate rewards structure
  if (rewards.weapons && !Array.isArray(rewards.weapons)) {
    return res.status(400).json({ error: 'rewards.weapons must be array' });
  }
  if (rewards.hammers && typeof rewards.hammers !== 'object') {
    return res.status(400).json({ error: 'rewards.hammers must be object' });
  }
  if (rewards.coins !== undefined && typeof rewards.coins !== 'number') {
    return res.status(400).json({ error: 'rewards.coins must be number' });
  }

  const rewardsJson = JSON.stringify(rewards);

  // Insert mail to self
  const result = await query(
    `INSERT INTO player_mail (recipient_username, sender, subject, message, mail_type, rewards)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [user.username, 'Forge Mystique', subject, message, mailType, rewardsJson]
  );

  return res.status(200).json({
    success: true,
    mailId: result.rows[0].id
  });
}

// ═══════════════════════════════════════════════════════════════
// INBOX — Get user's mail (personal + broadcasts)
// ═══════════════════════════════════════════════════════════════

async function handleInbox(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { filter = 'all', limit = 50, offset = 0 } = req.query;
  const numLimit = Math.min(parseInt(limit, 10) || 50, 100);
  const numOffset = parseInt(offset, 10) || 0;

  let whereClause = `(recipient_username = $1 OR recipient_username IS NULL)`;
  const params = [user.username, numLimit, numOffset];

  if (filter === 'unread') {
    whereClause += ` AND read = false`;
  } else if (filter === 'rewards') {
    whereClause += ` AND rewards IS NOT NULL AND claimed = false`;
  }

  const result = await query(
    `SELECT id, recipient_username, sender, subject, message, mail_type,
            rewards, claimed, read, created_at, expires_at
     FROM player_mail
     WHERE ${whereClause} AND (expires_at IS NULL OR expires_at > NOW())
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    params
  );

  // Get unread count
  const unreadResult = await query(
    `SELECT COUNT(*) as cnt
     FROM player_mail
     WHERE (recipient_username = $1 OR recipient_username IS NULL)
       AND read = false
       AND (expires_at IS NULL OR expires_at > NOW())`,
    [user.username]
  );

  return res.status(200).json({
    success: true,
    mail: result.rows.map(row => ({
      id: row.id,
      recipientUsername: row.recipient_username,
      sender: row.sender,
      subject: row.subject,
      message: row.message,
      mailType: row.mail_type,
      rewards: row.rewards,
      claimed: row.claimed,
      read: row.read,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      isBroadcast: !row.recipient_username
    })),
    unreadCount: parseInt(unreadResult.rows[0].cnt, 10),
    total: result.rows.length,
    filter,
    limit: numLimit,
    offset: numOffset
  });
}

// ═══════════════════════════════════════════════════════════════
// CLAIM — Claim rewards from mail
// ═══════════════════════════════════════════════════════════════

async function handleClaim(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { mailId } = req.body;
  if (!mailId) return res.status(400).json({ error: 'Missing mailId' });

  // Atomic claim: SELECT + UPDATE in one query to prevent race condition
  const result = await query(
    `UPDATE player_mail
     SET claimed = true
     WHERE id = $1
       AND (recipient_username = $2 OR recipient_username IS NULL)
       AND claimed = false
       AND rewards IS NOT NULL
     RETURNING rewards`,
    [mailId, user.username]
  );

  if (result.rows.length === 0) {
    return res.status(400).json({ error: 'Mail not found, already claimed, or no rewards' });
  }

  const rewards = typeof result.rows[0].rewards === 'string'
    ? JSON.parse(result.rows[0].rewards)
    : result.rows[0].rewards;

  return res.status(200).json({
    success: true,
    rewards: rewards
  });
}

// ═══════════════════════════════════════════════════════════════
// MARK-READ — Mark mail as read
// ═══════════════════════════════════════════════════════════════

async function handleMarkRead(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { mailId } = req.body;
  if (!mailId) return res.status(400).json({ error: 'Missing mailId' });

  // Verify ownership and update
  const result = await query(
    `UPDATE player_mail
     SET read = true
     WHERE id = $1 AND (recipient_username = $2 OR recipient_username IS NULL)
     RETURNING id`,
    [mailId, user.username]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Mail not found' });
  }

  return res.status(200).json({ success: true });
}

// ═══════════════════════════════════════════════════════════════
// DELETE — Soft delete mail (personal only)
// ═══════════════════════════════════════════════════════════════

async function handleDelete(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { mailId } = req.body;
  if (!mailId) return res.status(400).json({ error: 'Missing mailId' });

  // Only allow deleting personal mail (not broadcasts)
  // Set expires_at to NOW() for soft delete
  const result = await query(
    `UPDATE player_mail
     SET expires_at = NOW()
     WHERE id = $1 AND recipient_username = $2
     RETURNING id`,
    [mailId, user.username]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Mail not found or cannot be deleted' });
  }

  return res.status(200).json({ success: true });
}

// ═══════════════════════════════════════════════════════════════
// CONTACT-SUPPORT — Players can send 1 message per day to admin
// ═══════════════════════════════════════════════════════════════

async function handleContactSupport(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { subject, message } = req.body;

  if (!subject || typeof subject !== 'string' || subject.trim().length === 0 || subject.length > 80) {
    return res.status(400).json({ error: 'Sujet requis (max 80 caracteres)' });
  }
  if (!message || typeof message !== 'string' || message.trim().length === 0 || message.length > 1000) {
    return res.status(400).json({ error: 'Message requis (max 1000 caracteres)' });
  }

  // Rate limit: 1 message per day per user
  const recentCheck = await query(
    `SELECT id FROM player_mail
     WHERE sender = $1 AND mail_type = 'support'
     AND created_at > NOW() - INTERVAL '24 hours'
     LIMIT 1`,
    [user.username]
  );

  if (recentCheck.rows.length > 0) {
    return res.status(429).json({ error: 'Vous avez deja envoye un message au support aujourd\'hui. Reessayez demain.' });
  }

  // Send mail to kly with [Bureau Des Plaintes] prefix
  const fullSubject = `[Bureau Des Plaintes] ${subject.trim()}`;

  await query(
    `INSERT INTO player_mail (recipient_username, sender, subject, message, mail_type)
     VALUES ($1, $2, $3, $4, $5)`,
    ['kly', user.username, fullSubject.slice(0, 100), message.trim(), 'support']
  );

  return res.status(200).json({ success: true });
}

// ═══════════════════════════════════════════════════════════════
// SEARCH-USERS — Search registered users (admin only)
// ═══════════════════════════════════════════════════════════════

async function handleSearchUsers(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  if (user.username.toLowerCase() !== 'kly') {
    return res.status(403).json({ error: 'Forbidden: Admin only' });
  }

  const q = (req.query.q || '').trim().toLowerCase();
  if (!q || q.length < 2) {
    return res.status(200).json({ success: true, users: [] });
  }

  const result = await query(
    `SELECT username, display_name FROM users WHERE username_lower LIKE $1 ORDER BY username_lower LIMIT 10`,
    [`%${q}%`]
  );

  return res.status(200).json({
    success: true,
    users: result.rows
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
      case 'self-reward':
        return await handleSelfReward(req, res);
      case 'inbox':
        return await handleInbox(req, res);
      case 'claim':
        return await handleClaim(req, res);
      case 'mark-read':
        return await handleMarkRead(req, res);
      case 'delete':
        return await handleDelete(req, res);
      case 'search-users':
        return await handleSearchUsers(req, res);
      case 'contact-support':
        return await handleContactSupport(req, res);
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err) {
    console.error('Mail API error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}
