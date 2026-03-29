/**
 * Security middleware — Rate limiting, abuse monitoring, headers.
 * Drop-in pour server.js : import { securityMiddleware } from './security.js';
 */
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════

const IS_PROD = process.env.NODE_ENV === 'production';

// Seuils de rate limiting (par IP)
const LIMITS = {
  global:   { windowMs: 60_000, max: 120 },  // 120 req/min global
  auth:     { windowMs: 60_000, max: 8 },     // 8 tentatives login/register par min
  storage:  { windowMs: 60_000, max: 30 },    // 30 saves/loads par min
  admin:    { windowMs: 60_000, max: 20 },    // 20 req admin par min
  cron:     { windowMs: 60_000, max: 5 },     // 5 req cron par min
};

// ═══════════════════════════════════════════════════════════════
// ABUSE MONITOR — tracks suspicious patterns per IP
// ═══════════════════════════════════════════════════════════════

const abuseTracker = new Map(); // ip → { hits, blocked, firstSeen, lastSeen }
const ABUSE_WINDOW_MS = 5 * 60_000; // 5 min window
const ABUSE_THRESHOLD = 300;          // 300 req in 5 min = flagged
const BLOCK_THRESHOLD = 500;          // 500 req in 5 min = auto-blocked

// Clean up stale entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of abuseTracker) {
    if (now - data.lastSeen > ABUSE_WINDOW_MS * 2) {
      abuseTracker.delete(ip);
    }
  }
}, 10 * 60_000);

/**
 * Get real client IP (works behind Cloudflare/nginx).
 */
function getClientIp(req) {
  return req.headers['cf-connecting-ip']
    || req.headers['x-real-ip']
    || req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.ip;
}

/**
 * Abuse monitoring middleware.
 * Logs warnings + blocks repeat offenders.
 */
function abuseMonitor(req, res, next) {
  const ip = getClientIp(req);
  const now = Date.now();

  let data = abuseTracker.get(ip);
  if (!data || now - data.firstSeen > ABUSE_WINDOW_MS) {
    data = { hits: 0, blocked: 0, firstSeen: now, lastSeen: now, warned: false };
    abuseTracker.set(ip, data);
  }

  data.hits++;
  data.lastSeen = now;

  // Auto-block if way over threshold
  if (data.hits >= BLOCK_THRESHOLD) {
    data.blocked++;
    if (data.blocked === 1) {
      console.warn(`[SECURITY] 🚫 BLOCKED IP ${ip} — ${data.hits} requests in ${Math.round((now - data.firstSeen) / 1000)}s on ${req.path}`);
    }
    return res.status(429).json({ error: 'Too many requests. Try again later.' });
  }

  // Warn on suspicious activity
  if (data.hits >= ABUSE_THRESHOLD && !data.warned) {
    data.warned = true;
    console.warn(`[SECURITY] ⚠️ SUSPICIOUS IP ${ip} — ${data.hits} requests in ${Math.round((now - data.firstSeen) / 1000)}s — endpoint: ${req.method} ${req.path}`);
  }

  next();
}

// ═══════════════════════════════════════════════════════════════
// RATE LIMITERS
// ═══════════════════════════════════════════════════════════════

function createLimiter(config, name) {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    keyGenerator: getClientIp,
    handler: (req, res) => {
      console.warn(`[SECURITY] 🛑 RATE LIMITED [${name}] — IP: ${getClientIp(req)} — ${req.method} ${req.path}`);
      res.status(429).json({
        error: 'Trop de requêtes. Réessaie dans un instant.',
        retryAfter: Math.ceil(config.windowMs / 1000),
      });
    },
  });
}

const globalLimiter  = createLimiter(LIMITS.global, 'global');
const authLimiter    = createLimiter(LIMITS.auth, 'auth');
const storageLimiter = createLimiter(LIMITS.storage, 'storage');
const adminLimiter   = createLimiter(LIMITS.admin, 'admin');
const cronLimiter    = createLimiter(LIMITS.cron, 'cron');

// ═══════════════════════════════════════════════════════════════
// FAILED LOGIN TRACKER — anti brute-force
// ═══════════════════════════════════════════════════════════════

const failedLogins = new Map(); // ip → { count, firstFail }
const FAILED_LOGIN_WINDOW = 15 * 60_000; // 15 min
const FAILED_LOGIN_MAX = 10;              // 10 failures = locked

setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of failedLogins) {
    if (now - data.firstFail > FAILED_LOGIN_WINDOW * 2) {
      failedLogins.delete(ip);
    }
  }
}, 10 * 60_000);

/**
 * Track a failed login attempt. Returns true if IP should be blocked.
 */
export function trackFailedLogin(ip) {
  const now = Date.now();
  let data = failedLogins.get(ip);

  if (!data || now - data.firstFail > FAILED_LOGIN_WINDOW) {
    data = { count: 0, firstFail: now };
    failedLogins.set(ip, data);
  }

  data.count++;

  if (data.count >= FAILED_LOGIN_MAX) {
    console.warn(`[SECURITY] 🔒 BRUTE FORCE DETECTED — IP: ${ip} — ${data.count} failed logins in ${Math.round((now - data.firstFail) / 1000)}s`);
    return true;
  }
  return false;
}

/**
 * Clear failed logins for an IP (on successful login).
 */
export function clearFailedLogin(ip) {
  failedLogins.delete(ip);
}

// ═══════════════════════════════════════════════════════════════
// STATUS ENDPOINT — /api/security/status (admin only)
// ═══════════════════════════════════════════════════════════════

export function securityStatus(req, res) {
  const tracked = [];
  for (const [ip, data] of abuseTracker) {
    if (data.hits >= 50) {
      tracked.push({ ip, ...data });
    }
  }
  tracked.sort((a, b) => b.hits - a.hits);

  const blockedLogins = [];
  for (const [ip, data] of failedLogins) {
    if (data.count >= 3) {
      blockedLogins.push({ ip, ...data });
    }
  }

  res.json({
    abuseTracker: { totalTracked: abuseTracker.size, topOffenders: tracked.slice(0, 20) },
    failedLogins: { totalTracked: failedLogins.size, suspicious: blockedLogins },
  });
}

// ═══════════════════════════════════════════════════════════════
// EXPORT — single function to mount everything
// ═══════════════════════════════════════════════════════════════

export function securityMiddleware(app) {
  // 1. Security headers (helmet)
  app.use(helmet({
    contentSecurityPolicy: false,    // Let Cloudflare/nginx handle CSP
    crossOriginEmbedderPolicy: false, // Needed for CDN images
  }));

  // 2. Global abuse monitor (before rate limiters)
  app.use(abuseMonitor);

  // 3. Global rate limit
  app.use(globalLimiter);

  // 4. Per-endpoint rate limits
  app.use('/api/auth', authLimiter);
  app.use('/api/storage', storageLimiter);
  app.use('/api/admin', adminLimiter);
  app.use('/api/cron', cronLimiter);

  console.log('[security] Rate limiting + abuse monitoring + helmet active');
}

export { getClientIp };
