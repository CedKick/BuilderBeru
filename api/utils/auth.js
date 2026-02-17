// api/utils/auth.js — Shared auth utilities (PBKDF2 + HMAC-SHA256 tokens)
// Zero external dependencies — uses Node.js crypto only

import crypto from 'crypto';
import { query } from '../db/neon.js';

const AUTH_SECRET = process.env.AUTH_SECRET || 'dev-secret-change-in-production';
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEY_LEN = 64;
const PBKDF2_DIGEST = 'sha512';
const TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ─── Password hashing ─────────────────────────────────────

export function hashPassword(password) {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LEN, PBKDF2_DIGEST).toString('hex');
  return `${salt}:${PBKDF2_ITERATIONS}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, iterations, hash] = stored.split(':');
  const computed = crypto.pbkdf2Sync(password, salt, parseInt(iterations, 10), PBKDF2_KEY_LEN, PBKDF2_DIGEST).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computed, 'hex'));
}

// ─── Token (HMAC-SHA256, stateless) ───────────────────────

export function createToken(userId, username) {
  const expiresAt = Date.now() + TOKEN_EXPIRY_MS;
  const payload = Buffer.from(JSON.stringify({ uid: userId, usr: username, exp: expiresAt }))
    .toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;
  const expected = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');

  if (expected.length !== signature.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (Date.now() > data.exp) return null;
    return { userId: data.uid, username: data.usr, expiresAt: data.exp };
  } catch {
    return null;
  }
}

// ─── Request helper ───────────────────────────────────────

/**
 * Extract and verify user from Authorization header.
 * Returns { userId, username, deviceId } or null.
 */
export async function extractUser(req) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  const decoded = verifyToken(token);
  if (!decoded) return null;

  // Look up user's device_id from DB
  const result = await query(
    'SELECT device_id, display_name FROM users WHERE id = $1',
    [decoded.userId]
  );
  if (result.rows.length === 0) return null;

  return {
    userId: decoded.userId,
    username: decoded.username,
    deviceId: result.rows[0].device_id,
    displayName: result.rows[0].display_name || decoded.username,
  };
}
