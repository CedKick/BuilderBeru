// api/admin.js — Admin panel API for managing player data (Kly only)
import { query } from './_db/neon.js';
import { extractUser } from './_utils/auth.js';
import { unsuspendAccount, suspendAccount } from './_utils/anticheat.js';

const ADMIN_USERNAME = 'kly';

async function requireAdmin(req, res) {
  const user = await extractUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }
  if (user.username.toLowerCase() !== ADMIN_USERNAME) {
    res.status(403).json({ error: 'Forbidden: Admin only' });
    return null;
  }
  return user;
}

// ═══════════════════════════════════════════════════════════════
// LIST-USERS — List all registered users with storage summary
// ═══════════════════════════════════════════════════════════════

async function handleListUsers(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const q = (req.query.q || '').trim().toLowerCase();
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
  const offset = parseInt(req.query.offset, 10) || 0;

  let whereClause = '';
  const params = [limit, offset];

  if (q && q.length >= 1) {
    whereClause = 'WHERE u.username_lower LIKE $3';
    params.push(`%${q}%`);
  }

  const result = await query(`
    SELECT u.id, u.username, u.display_name, u.device_id, u.created_at, u.updated_at,
           COALESCE(SUM(s.size_bytes), 0) as total_storage
    FROM users u
    LEFT JOIN user_storage s ON s.device_id = u.device_id
    ${whereClause}
    GROUP BY u.id, u.username, u.display_name, u.device_id, u.created_at, u.updated_at
    ORDER BY u.updated_at DESC
    LIMIT $1 OFFSET $2
  `, params);

  const countResult = await query(`
    SELECT COUNT(*) as cnt FROM users ${whereClause ? 'WHERE username_lower LIKE $1' : ''}
  `, q ? [`%${q}%`] : []);

  return res.status(200).json({
    success: true,
    users: result.rows.map(r => ({
      id: r.id,
      username: r.username,
      displayName: r.display_name,
      deviceId: r.device_id,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      totalStorage: parseInt(r.total_storage, 10),
    })),
    total: parseInt(countResult.rows[0].cnt, 10),
  });
}

// ═══════════════════════════════════════════════════════════════
// GET-PLAYER — Load all data for a specific player
// ═══════════════════════════════════════════════════════════════

async function handleGetPlayer(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const username = req.query.username;
  if (!username) return res.status(400).json({ error: 'Missing username' });

  // Look up user
  const userResult = await query(
    'SELECT id, username, display_name, device_id, created_at, updated_at FROM users WHERE username_lower = $1',
    [username.toLowerCase()]
  );
  if (userResult.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  const user = userResult.rows[0];

  // Load all storage entries
  const storageResult = await query(
    'SELECT storage_key, data, size_bytes, updated_at FROM user_storage WHERE device_id = $1',
    [user.device_id]
  );

  const storage = {};
  for (const row of storageResult.rows) {
    storage[row.storage_key] = {
      data: row.data,
      sizeBytes: row.size_bytes,
      updatedAt: row.updated_at,
    };
  }

  return res.status(200).json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      deviceId: user.device_id,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    },
    storage,
  });
}

// ═══════════════════════════════════════════════════════════════
// UPDATE-PLAYER — Modify specific fields in a player's storage
// ═══════════════════════════════════════════════════════════════

async function handleUpdatePlayer(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const { username, storageKey, data } = req.body;
  if (!username || !storageKey || data === undefined) {
    return res.status(400).json({ error: 'Missing username, storageKey, or data' });
  }

  // Look up user device_id
  const userResult = await query(
    'SELECT device_id FROM users WHERE username_lower = $1',
    [username.toLowerCase()]
  );
  if (userResult.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  const deviceId = userResult.rows[0].device_id;
  const jsonStr = JSON.stringify(data);
  const sizeBytes = Buffer.byteLength(jsonStr, 'utf8');

  await query(
    `INSERT INTO user_storage (device_id, storage_key, data, size_bytes, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (device_id, storage_key)
     DO UPDATE SET data = $3, size_bytes = $4, updated_at = NOW()`,
    [deviceId, storageKey, jsonStr, sizeBytes]
  );

  return res.status(200).json({ success: true, sizeBytes });
}

// ═══════════════════════════════════════════════════════════════
// PATCH-PLAYER — Merge specific fields into existing storage data
// ═══════════════════════════════════════════════════════════════

async function handlePatchPlayer(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const { username, storageKey, patch } = req.body;
  if (!username || !storageKey || !patch || typeof patch !== 'object') {
    return res.status(400).json({ error: 'Missing username, storageKey, or patch object' });
  }

  // Look up user device_id
  const userResult = await query(
    'SELECT device_id FROM users WHERE username_lower = $1',
    [username.toLowerCase()]
  );
  if (userResult.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  const deviceId = userResult.rows[0].device_id;

  // Load existing data
  const existing = await query(
    'SELECT data FROM user_storage WHERE device_id = $1 AND storage_key = $2',
    [deviceId, storageKey]
  );

  let currentData = existing.rows.length > 0 ? existing.rows[0].data : {};
  if (typeof currentData === 'string') currentData = JSON.parse(currentData);

  // Deep merge patch into current data
  const merged = { ...currentData, ...patch };
  const jsonStr = JSON.stringify(merged);
  const sizeBytes = Buffer.byteLength(jsonStr, 'utf8');

  await query(
    `INSERT INTO user_storage (device_id, storage_key, data, size_bytes, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (device_id, storage_key)
     DO UPDATE SET data = $3, size_bytes = $4, updated_at = NOW()`,
    [deviceId, storageKey, jsonStr, sizeBytes]
  );

  return res.status(200).json({ success: true, sizeBytes, mergedKeys: Object.keys(patch) });
}

// ═══════════════════════════════════════════════════════════════
// UNSUSPEND — Lift an anti-cheat suspension (admin only)
// ═══════════════════════════════════════════════════════════════

async function handleUnsuspend(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Missing username' });

  const userResult = await query(
    'SELECT device_id, suspended, suspended_reason, cheat_score FROM users WHERE username_lower = $1',
    [username.toLowerCase()]
  );
  if (userResult.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { device_id, suspended, suspended_reason, cheat_score } = userResult.rows[0];

  if (!suspended) {
    return res.status(200).json({ success: true, message: 'User is not suspended' });
  }

  await unsuspendAccount(device_id);

  console.log(`[admin] ${admin.username} UNSUSPENDED ${username} (was: score=${cheat_score}, reason=${suspended_reason})`);

  return res.status(200).json({
    success: true,
    message: `${username} unsuspended successfully`,
    previousScore: cheat_score,
    previousReason: suspended_reason,
  });
}

// ═══════════════════════════════════════════════════════════════
// LIST-SUSPENDED — Show all currently suspended accounts
// ═══════════════════════════════════════════════════════════════

async function handleListSuspended(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const result = await query(`
    SELECT username, display_name, device_id, suspended_at, suspended_reason, cheat_score
    FROM users
    WHERE suspended = true
    ORDER BY suspended_at DESC
  `);

  return res.status(200).json({
    success: true,
    suspended: result.rows.map(r => ({
      username: r.username,
      displayName: r.display_name,
      deviceId: r.device_id,
      suspendedAt: r.suspended_at,
      reason: r.suspended_reason,
      cheatScore: r.cheat_score,
    })),
  });
}

// ═══════════════════════════════════════════════════════════════
// CHEAT-MONITOR — All players with cheat scores for monitoring
// ═══════════════════════════════════════════════════════════════

async function handleCheatMonitor(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const result = await query(`
    SELECT username, display_name, device_id, suspended, suspended_at,
           suspended_reason, cheat_score, updated_at
    FROM users
    WHERE cheat_score > 0 OR suspended = true
    ORDER BY
      suspended DESC,
      cheat_score DESC,
      updated_at DESC
  `);

  return res.status(200).json({
    success: true,
    players: result.rows.map(r => ({
      username: r.username,
      displayName: r.display_name,
      deviceId: r.device_id,
      suspended: r.suspended || false,
      suspendedAt: r.suspended_at,
      reason: r.suspended_reason,
      cheatScore: r.cheat_score || 0,
      lastActivity: r.updated_at,
    })),
  });
}

// ═══════════════════════════════════════════════════════════════
// MANUAL SUSPEND — Admin-initiated suspension
// ═══════════════════════════════════════════════════════════════

async function handleManualSuspend(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const { username, reason } = req.body;
  if (!username) return res.status(400).json({ error: 'Missing username' });

  const userResult = await query(
    'SELECT device_id, suspended FROM users WHERE username_lower = $1',
    [username.toLowerCase()]
  );
  if (userResult.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { device_id, suspended } = userResult.rows[0];
  if (suspended) {
    return res.status(200).json({ success: true, message: 'Already suspended' });
  }

  const banReason = reason || `Suspension manuelle par ${admin.username}`;
  await suspendAccount(device_id, banReason, 100, [`MANUAL: ${banReason}`]);

  console.log(`[admin] ${admin.username} MANUALLY SUSPENDED ${username} — reason: ${banReason}`);

  return res.status(200).json({
    success: true,
    message: `${username} suspended`,
  });
}

// ═══════════════════════════════════════════════════════════════
// RESET-SCORE — Clear cheat score without affecting suspension
// ═══════════════════════════════════════════════════════════════

async function handleResetScore(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Missing username' });

  const userResult = await query(
    'SELECT device_id, cheat_score FROM users WHERE username_lower = $1',
    [username.toLowerCase()]
  );
  if (userResult.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  const previousScore = userResult.rows[0].cheat_score || 0;
  await query(
    'UPDATE users SET cheat_score = 0 WHERE device_id = $1',
    [userResult.rows[0].device_id]
  );

  console.log(`[admin] ${admin.username} RESET SCORE for ${username} (was: ${previousScore})`);

  return res.status(200).json({
    success: true,
    message: `Score de ${username} remis a zero`,
    previousScore,
  });
}

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://builderberu.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query.action;

  try {
    switch (action) {
      case 'list-users':
        return await handleListUsers(req, res);
      case 'get-player':
        return await handleGetPlayer(req, res);
      case 'update-player':
        return await handleUpdatePlayer(req, res);
      case 'patch-player':
        return await handlePatchPlayer(req, res);
      case 'unsuspend':
        return await handleUnsuspend(req, res);
      case 'list-suspended':
        return await handleListSuspended(req, res);
      case 'cheat-monitor':
        return await handleCheatMonitor(req, res);
      case 'manual-suspend':
        return await handleManualSuspend(req, res);
      case 'reset-score':
        return await handleResetScore(req, res);
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err) {
    console.error('Admin API error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}
