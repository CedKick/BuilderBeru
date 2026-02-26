// api/_utils/anticheat.js — Béru Anti-Cheat System
// Lightweight delta validation + automatic suspension + admin notification
// Zero external dependencies — uses Node.js fetch only

import { query } from '../_db/neon.js';

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════

const SECRET_WEAPONS = new Set([
  'w_sulfuras', 'w_raeshalare', 'w_katana_z', 'w_katana_v', 'w_guldan',
]);

// Score thresholds
export const WARN_SCORE = 30;      // Béru gets suspicious
export const SUSPEND_SCORE = 80;   // Account suspended

// Max deltas per save cycle (generous for legitimate play with 120s throttle)
const MAX_SECRET_WEAPON_DELTA = 1;    // 1/10,000 drop — 2 in 2 min = impossible
const MAX_NORMAL_WEAPON_DELTA = 5;    // Generous for normal drops
const MAX_NEW_WEAPONS_PER_SAVE = 8;   // Can't discover 8+ new weapons at once
const MAX_NEW_HUNTERS_PER_SAVE = 5;   // 5 rolls max per victory
const MAX_HUNTER_STAR_DELTA = 10;     // Very generous

// Notification (env vars — all optional)
const DISCORD_WEBHOOK = process.env.DISCORD_ANTICHEAT_WEBHOOK || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

// ═══════════════════════════════════════════════════════════════
// BÉRU MESSAGES
// ═══════════════════════════════════════════════════════════════

const BERU_WARN_MESSAGES = [
  "WOOOOH ATTENDS UNE SECONDE !! 🐜👀 Béru vient de voir des drops... SUSPECTS ! Tu joues normalement ou y'a un TRUC QUI CLOCHE ?! L'œil du Roi des Fourmis ne rate RIEN !",
  "HEIN ?! COMMENT t'as eu TOUT ÇA ?! 🐜🔍 Béru calcule... *agite ses antennes*... NON, les stats collent PAS ! Attention, Béru SURVEILLE de TRÈS près !",
  "OH OH OH ! Béru SENT L'ARNAQUE ! 🔥🐜 Ces drops sont plus louches qu'un marchand d'ombres dans la Zone de la Mort ! Tu joues avec le feu, petit chasseur...",
];

const BERU_SUSPEND_MESSAGE =
  "🚨 ALERTE ROUGE DANS LE COLISÉE !! 🚨\n\n" +
  "Béru a détecté de la TRICHE MASSIVE !!\n\n" +
  "Ton compte est SUSPENDU !\n\n" +
  "Tu pensais berner le GRAND BÉRU ?! Le Roi des Fourmis voit TOUT !\n" +
  "PERSONNE ne triche dans MON Colisée !\n\n" +
  "Si c'est une erreur, contacte un admin sur Discord...\n" +
  "mais l'œil de Béru ne ment JAMAIS ! 🐜⚔️🔥";

export function getBeruWarnMessage() {
  return BERU_WARN_MESSAGES[Math.floor(Math.random() * BERU_WARN_MESSAGES.length)];
}

export function getBeruSuspendMessage() {
  return BERU_SUSPEND_MESSAGE;
}

// ═══════════════════════════════════════════════════════════════
// CHEAT SCORE COMPUTATION — Pure logic, no DB queries
// ═══════════════════════════════════════════════════════════════

export function computeCheatScore(cloud, incoming, key, options = {}) {
  if (!cloud) return { score: 0, flags: [] };

  let score = 0;
  const flags = [];

  // Scale thresholds for offline farm sessions (server-validated farmMinutes)
  const farmMinutes = options.farmMinutes || 0;
  const farmBattles = farmMinutes * 15;
  const sMaxSecretWeapon = MAX_SECRET_WEAPON_DELTA + (farmBattles > 0 ? Math.ceil(farmBattles / 5000) : 0);
  const sMaxNormalWeapon = MAX_NORMAL_WEAPON_DELTA + (farmBattles > 0 ? Math.ceil(farmBattles / 100) : 0);
  const sMaxNewWeapons = MAX_NEW_WEAPONS_PER_SAVE + (farmBattles > 0 ? Math.ceil(farmBattles / 200) : 0);
  const sMaxNewHunters = MAX_NEW_HUNTERS_PER_SAVE + (farmBattles > 0 ? Math.ceil(farmBattles / 20) : 0);
  const sMaxHunterStars = MAX_HUNTER_STAR_DELTA + (farmBattles > 0 ? Math.ceil(farmBattles / 20) : 0);

  if (key === 'shadow_colosseum_data') {
    // ─── Weapon Collection Delta ────────────────────────
    const cWeapons = cloud.weaponCollection || {};
    const iWeapons = incoming.weaponCollection || {};

    let newWeaponCount = 0;
    for (const [wId, awk] of Object.entries(iWeapons)) {
      if (typeof awk !== 'number') continue;
      const cloudAwk = cWeapons[wId];
      const isNew = cloudAwk === undefined;
      const delta = (awk || 0) - (cloudAwk || 0);

      if (isNew) newWeaponCount++;
      if (delta <= 0) continue;

      if (SECRET_WEAPONS.has(wId)) {
        if (delta > sMaxSecretWeapon) {
          const pts = delta * 25;
          score += pts;
          flags.push(`SECRET ${wId}: +${delta} awakening (+${pts}pts)`);
        }
      } else if (delta > sMaxNormalWeapon) {
        const pts = delta * 5;
        score += pts;
        flags.push(`${wId}: +${delta} awakening (+${pts}pts)`);
      }
    }

    if (newWeaponCount > sMaxNewWeapons) {
      const pts = newWeaponCount * 10;
      score += pts;
      flags.push(`${newWeaponCount} new weapons in one save (+${pts}pts)`);
    }
  }

  if (key === 'shadow_colosseum_raid') {
    // ─── Hunter Collection Delta ────────────────────────
    const cColl = cloud.hunterCollection || [];
    const iColl = incoming.hunterCollection || [];

    const cloudMap = new Map();
    for (const h of cColl) {
      const entry = typeof h === 'string' ? { id: h, stars: 0 } : h;
      cloudMap.set(entry.id, entry.stars || 0);
    }

    let newHunters = 0;
    let totalStarGains = 0;
    for (const h of iColl) {
      const entry = typeof h === 'string' ? { id: h, stars: 0 } : h;
      const cloudStars = cloudMap.get(entry.id);
      if (cloudStars === undefined) {
        newHunters++;
      } else {
        const starDelta = (entry.stars || 0) - cloudStars;
        if (starDelta > 0) totalStarGains += starDelta;
      }
    }

    if (newHunters > sMaxNewHunters) {
      const pts = newHunters * 15;
      score += pts;
      flags.push(`${newHunters} new hunters in one save (+${pts}pts)`);
    }

    if (totalStarGains > sMaxHunterStars) {
      const pts = totalStarGains * 10;
      score += pts;
      flags.push(`+${totalStarGains} total hunter star gains (+${pts}pts)`);
    }
  }

  return { score, flags };
}

// ═══════════════════════════════════════════════════════════════
// SUSPENSION — DB operations (lightweight)
// ═══════════════════════════════════════════════════════════════

let _columnsReady = false;

async function ensureSuspensionColumns() {
  if (_columnsReady) return;
  try {
    await query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS suspended BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS suspended_reason TEXT,
        ADD COLUMN IF NOT EXISTS cheat_score INTEGER DEFAULT 0
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_users_device_id ON users(device_id)');
  } catch (e) {
    // Columns might already exist — safe to ignore
    if (!e.message?.includes('already exists')) {
      console.warn('[anticheat] Column migration warning:', e.message);
    }
  }
  _columnsReady = true;
}

/**
 * Check if a device is suspended. Returns null (not suspended) or { suspended, reason, since }.
 * Lightweight: single indexed SELECT.
 */
export async function checkSuspension(deviceId) {
  await ensureSuspensionColumns();
  try {
    const result = await query(
      'SELECT suspended, suspended_reason, suspended_at FROM users WHERE device_id = $1',
      [deviceId]
    );
    if (result.rows.length === 0) return null;
    if (!result.rows[0].suspended) return null;
    return {
      suspended: true,
      reason: result.rows[0].suspended_reason || 'Comportement suspect détecté',
      since: result.rows[0].suspended_at,
    };
  } catch {
    return null; // Fail open — don't block legit users on DB errors
  }
}

/**
 * Suspend an account. Returns the username or null on failure.
 */
export async function suspendAccount(deviceId, reason, score, flags) {
  await ensureSuspensionColumns();
  try {
    const userResult = await query(
      'SELECT username FROM users WHERE device_id = $1',
      [deviceId]
    );
    const username = userResult.rows[0]?.username || 'anonymous';

    await query(
      `UPDATE users
       SET suspended = true, suspended_at = NOW(), suspended_reason = $2, cheat_score = $3
       WHERE device_id = $1`,
      [deviceId, reason, score]
    );

    console.error(`[ANTICHEAT] ⚠️ SUSPENDED ${username} (${deviceId}) — score: ${score}, flags: ${flags.join(', ')}`);

    // Fire-and-forget admin notification
    notifyAdmin(username, deviceId, score, flags).catch(() => {});

    return username;
  } catch (err) {
    console.error('[anticheat] Suspension failed:', err.message);
    return null;
  }
}

/**
 * Unsuspend an account (admin only).
 */
export async function unsuspendAccount(deviceId) {
  await ensureSuspensionColumns();
  await query(
    `UPDATE users
     SET suspended = false, suspended_at = NULL, suspended_reason = NULL, cheat_score = 0
     WHERE device_id = $1`,
    [deviceId]
  );
}

// ═══════════════════════════════════════════════════════════════
// ADMIN NOTIFICATION — Fire-and-forget, all optional
// ═══════════════════════════════════════════════════════════════

export async function notifyAdmin(username, deviceId, score, flags) {
  const timestamp = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
  const flagsList = flags.map(f => `• ${f}`).join('\n');

  // 1. Discord webhook (instant)
  if (DISCORD_WEBHOOK) {
    try {
      await fetch(DISCORD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content:
            `🚨 **ANTI-CHEAT: Compte suspendu**\n` +
            `**Joueur:** ${username}\n` +
            `**Score triche:** ${score}\n` +
            `**DeviceID:** \`${deviceId.slice(0, 20)}...\`\n` +
            `**Détails:**\n${flagsList}\n` +
            `**Date:** ${timestamp}\n` +
            `> *Utilisez /admin unsuspend pour lever la suspension*`,
        }),
      });
    } catch (e) {
      console.error('[anticheat] Discord notification failed:', e.message);
    }
  }

  // 2. Email via Resend API (no SDK needed)
  if (RESEND_API_KEY && ADMIN_EMAIL) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'BuilderBeru Anticheat <noreply@builderberu.com>',
          to: ADMIN_EMAIL,
          subject: `🚨 Triche: ${username} suspendu (score: ${score})`,
          html:
            `<h2>🚨 Anti-Cheat Alert</h2>` +
            `<p><b>Joueur:</b> ${username}</p>` +
            `<p><b>Score:</b> ${score}</p>` +
            `<p><b>DeviceID:</b> <code>${deviceId}</code></p>` +
            `<p><b>Flags:</b></p><ul>${flags.map(f => `<li>${f}</li>`).join('')}</ul>` +
            `<p><b>Date:</b> ${timestamp}</p>` +
            `<p><i>Connectez-vous au panel admin pour unsuspend.</i></p>`,
        }),
      });
    } catch (e) {
      console.error('[anticheat] Email notification failed:', e.message);
    }
  }

  // 3. Always log (visible in Vercel logs)
  console.error(`[ANTICHEAT-ALERT] Suspended ${username} | Score: ${score} | Flags: ${flagsList}`);
}
