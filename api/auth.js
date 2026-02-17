// api/auth.js — Authentication serverless function (register, login, me)
// Pseudo + password, PBKDF2 hashing, HMAC-SHA256 tokens

import { query } from './db/neon.js';
import { hashPassword, verifyPassword, createToken, extractUser } from './utils/auth.js';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const MIN_PASSWORD_LEN = 6;

// ─── Init: create users table ─────────────────────────────

async function handleInit(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(20) NOT NULL UNIQUE,
      username_lower VARCHAR(20) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      device_id VARCHAR(64) NOT NULL,
      display_name VARCHAR(20),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await query('CREATE INDEX IF NOT EXISTS idx_users_device ON users(device_id)');
  await query('CREATE INDEX IF NOT EXISTS idx_users_username_lower ON users(username_lower)');

  return res.status(200).json({ success: true });
}

// ─── Register ─────────────────────────────────────────────

async function handleRegister(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password, deviceId } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Pseudo et mot de passe requis' });
  }
  if (!USERNAME_REGEX.test(username)) {
    return res.status(400).json({ error: 'Pseudo: 3-20 caracteres, lettres/chiffres/underscore uniquement' });
  }
  if (password.length < MIN_PASSWORD_LEN) {
    return res.status(400).json({ error: `Mot de passe: ${MIN_PASSWORD_LEN} caracteres minimum` });
  }
  if (!deviceId || !deviceId.startsWith('dev_') || deviceId.length > 50) {
    return res.status(400).json({ error: 'DeviceId invalide' });
  }

  // Check username uniqueness (case-insensitive)
  const existing = await query(
    'SELECT id FROM users WHERE username_lower = $1',
    [username.toLowerCase()]
  );
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'Ce pseudo est deja pris' });
  }

  const passwordHash = hashPassword(password);

  const result = await query(
    `INSERT INTO users (username, username_lower, password_hash, device_id, display_name)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [username, username.toLowerCase(), passwordHash, deviceId, username]
  );

  const userId = result.rows[0].id;
  const token = createToken(userId, username);

  return res.status(201).json({
    success: true,
    token,
    userId,
    username,
  });
}

// ─── Login ────────────────────────────────────────────────

async function handleLogin(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Pseudo et mot de passe requis' });
  }

  const result = await query(
    'SELECT id, username, password_hash, device_id FROM users WHERE username_lower = $1',
    [username.toLowerCase()]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'Pseudo ou mot de passe incorrect' });
  }

  const user = result.rows[0];

  if (!verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Pseudo ou mot de passe incorrect' });
  }

  // Update last login
  await query('UPDATE users SET updated_at = NOW() WHERE id = $1', [user.id]);

  const token = createToken(user.id, user.username);

  return res.status(200).json({
    success: true,
    token,
    userId: user.id,
    username: user.username,
    deviceId: user.device_id,
  });
}

// ─── Me (verify token) ───────────────────────────────────

async function handleMe(req, res) {
  const user = await extractUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Token invalide ou expire' });
  }

  return res.status(200).json({
    success: true,
    userId: user.userId,
    username: user.username,
    deviceId: user.deviceId,
  });
}

// ─── Main router ─────────────────────────────────────────

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
      case 'register':
        return await handleRegister(req, res);
      case 'login':
        return await handleLogin(req, res);
      case 'me':
        return await handleMe(req, res);
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}
