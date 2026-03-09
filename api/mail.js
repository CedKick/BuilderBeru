// api/mail.js — Player mail/inbox system with rewards
import { query } from './_db/neon.js';
import { extractUser } from './_utils/auth.js';

// ═══════════════════════════════════════════════════════════════
// AUTO-INIT — ensure player_mail table exists
// ═══════════════════════════════════════════════════════════════

const TABLE_SQL = `
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
`;

let tableChecked = false;
async function ensureTable() {
  if (tableChecked) return;
  await query(TABLE_SQL);
  await query('CREATE INDEX IF NOT EXISTS idx_mail_recipient ON player_mail(recipient_username, created_at DESC)');
  await query('CREATE INDEX IF NOT EXISTS idx_mail_created ON player_mail(created_at DESC)');
  await query('CREATE INDEX IF NOT EXISTS idx_mail_recipient_unread ON player_mail(recipient_username, read) WHERE read = false');
  tableChecked = true;
}

async function handleInit(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  await ensureTable();
  return res.status(200).json({ success: true });
}

// ═══════════════════════════════════════════════════════════════
// SEND — Send mail (admin only)
// ═══════════════════════════════════════════════════════════════

async function handleSend(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  await ensureTable();

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
    if (rewards.hunters && !Array.isArray(rewards.hunters)) {
      return res.status(400).json({ error: 'rewards.hunters must be array' });
    }
    if (rewards.hunters) {
      for (const h of rewards.hunters) {
        if (!h.id || typeof h.id !== 'string') {
          return res.status(400).json({ error: 'Each hunter must have a string id' });
        }
        if (h.stars !== undefined && (typeof h.stars !== 'number' || h.stars < 0)) {
          return res.status(400).json({ error: `Invalid stars for hunter ${h.id}` });
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
  await ensureTable();

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
  await ensureTable();

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

  // ── SERVER-SIDE REWARD APPLICATION ──
  // Apply rewards directly in DB so nothing depends on frontend/CloudStorage
  try {
    await applyRewardsServerSide(user.username, rewards);
  } catch (applyErr) {
    // Rollback: un-claim the mail so user can retry
    await query('UPDATE player_mail SET claimed = false WHERE id = $1', [mailId]);
    console.error('[mail/claim] Failed to apply rewards, rolled back claim:', applyErr);
    return res.status(500).json({ error: 'Failed to apply rewards, please retry' });
  }

  return res.status(200).json({
    success: true,
    rewards: rewards,
    appliedServerSide: true
  });
}

// ═══════════════════════════════════════════════════════════════
// SERVER-SIDE REWARD APPLICATION — applies all reward types to DB
// ═══════════════════════════════════════════════════════════════

const BOSS_WEAPON_MAP = {
  weapon_excalibur: 'excalibur', weapon_mjolnir: 'mjolnir', weapon_muramasa: 'muramasa',
  weapon_yggdrasil: 'yggdrasil', weapon_gungnir: 'gungnir', weapon_nidhogg: 'nidhogg',
  weapon_aegis: 'aegis_weapon', weapon_caladbolg: 'caladbolg', weapon_thyrsus: 'thyrsus', weapon_gram: 'gram',
  weapon_ragnarok: 'ragnarok', weapon_kusanagi: 'kusanagi', weapon_gae_bolg: 'gae_bolg',
  weapon_masamune: 'masamune', weapon_longinus: 'longinus', weapon_tyrfing: 'tyrfing',
  weapon_ea_staff: 'ea_staff', weapon_fragarach: 'fragarach', weapon_tacos_eternel: 'tacos_eternel',
  weapon_amenonuhoko: 'amenonuhoko',
};
const EXP_SLOT_MAP = { helm: 'casque', chest: 'plastron', gloves: 'gants', boots: 'bottes', necklace: 'collier', bracelet: 'bracelet', ring: 'anneau', earring: 'boucles' };
function mapRarity(r) {
  if (r === 'legendary') return 'legendaire';
  if (r === 'epic') return 'legendaire';
  if (r === 'uncommon' || r === 'common') return 'rare';
  return r;
}
const MAX_WEAPON_AWAKENING = 100;
const INVENTORY_MAX = 1500;

async function applyRewardsServerSide(username, rewards) {
  // Look up device_id
  const userResult = await query(
    'SELECT id, device_id FROM users WHERE LOWER(username) = LOWER($1)',
    [username]
  );
  if (userResult.rows.length === 0) {
    throw new Error(`User not found: ${username}`);
  }
  const deviceId = userResult.rows[0].device_id;

  // ── Load shadow_colosseum_data ──
  const dataRow = await query(
    'SELECT data FROM user_storage WHERE device_id = $1 AND storage_key = $2',
    [deviceId, 'shadow_colosseum_data']
  );
  let data = {};
  if (dataRow.rows.length > 0) {
    data = typeof dataRow.rows[0].data === 'string'
      ? JSON.parse(dataRow.rows[0].data) : dataRow.rows[0].data;
  }
  if (!data.weaponCollection || typeof data.weaponCollection !== 'object') data.weaponCollection = {};
  if (!data.hammers || typeof data.hammers !== 'object') data.hammers = {};
  if (!data.fragments || typeof data.fragments !== 'object') data.fragments = {};
  if (!Array.isArray(data.artifactInventory)) data.artifactInventory = [];

  let dataChanged = false;

  // ── Weapons (quantity → awakening or hammers) ──
  if (rewards.weapons && Array.isArray(rewards.weapons)) {
    for (const w of rewards.weapons) {
      const qty = w.quantity || 1;
      for (let i = 0; i < qty; i++) {
        if (data.weaponCollection[w.id] === undefined) {
          data.weaponCollection[w.id] = 0;
        } else if (data.weaponCollection[w.id] >= 10) {
          data.hammers.marteau_rouge = (data.hammers.marteau_rouge || 0) + 5;
        } else {
          data.weaponCollection[w.id] += 1;
        }
      }
    }
    dataChanged = true;
  }

  // ── Hammers ──
  if (rewards.hammers && typeof rewards.hammers === 'object') {
    for (const [type, amt] of Object.entries(rewards.hammers)) {
      data.hammers[type] = (data.hammers[type] || 0) + amt;
    }
    dataChanged = true;
  }

  // ── Fragments ──
  if (rewards.fragments && typeof rewards.fragments === 'object') {
    for (const [fragId, amt] of Object.entries(rewards.fragments)) {
      data.fragments[fragId] = (data.fragments[fragId] || 0) + amt;
    }
    dataChanged = true;
  }

  // ── Coins ──
  if (rewards.coins && typeof rewards.coins === 'number') {
    data.shadowCoins = (data.shadowCoins || 0) + rewards.coins;
    dataChanged = true;
  }

  // ── Expedition items (weapons → weaponCollection, armor → artifactInventory) ──
  if (rewards.expeditionItems && Array.isArray(rewards.expeditionItems)) {
    const timestamp = Date.now();
    let scrollCount = 0;

    for (const item of rewards.expeditionItems) {
      if (item.itemId === 'exp_ultimate_scroll') { scrollCount++; continue; }
      if (!['armor', 'weapon', 'set_piece', 'unique'].includes(item.type)) continue;

      if (item.type === 'weapon') {
        const wId = BOSS_WEAPON_MAP[item.itemId] || item.itemId;
        if (data.weaponCollection[wId] === undefined) {
          data.weaponCollection[wId] = 0;
        } else if (data.weaponCollection[wId] >= MAX_WEAPON_AWAKENING) {
          data.hammers.marteau_rouge = (data.hammers.marteau_rouge || 0) + 5;
        } else {
          data.weaponCollection[wId] += 1;
        }
        continue;
      }

      // Armor/set_piece → artifact
      const statEntries = Object.entries(item.stats || {});
      const mainStatEntry = statEntries[0] || ['atk_flat', 0];
      const subEntries = statEntries.slice(1);
      data.artifactInventory.push({
        uid: `exp_${timestamp}_${Math.random().toString(36).slice(2, 8)}`,
        set: item.setId || null,
        slot: item.slot ? (EXP_SLOT_MAP[item.slot] || item.slot) : 'casque',
        rarity: mapRarity(item.rarity),
        level: 0,
        mainStat: mainStatEntry[0],
        mainValue: mainStatEntry[1],
        subs: subEntries.map(([sid, value]) => ({ id: sid, value })),
        locked: false,
        source: 'expedition',
        expItemId: item.itemId,
        expItemName: item.itemName,
        expOriginalStats: item.stats,
      });
    }

    if (scrollCount > 0) {
      data.ultimateScrolls = (data.ultimateScrolls || 0) + scrollCount;
    }

    // Cap at 1500 — trim weakest non-locked
    if (data.artifactInventory.length > INVENTORY_MAX) {
      data.artifactInventory = data.artifactInventory
        .map((a, i) => ({
          a, i, locked: a.locked || a.highlighted,
          score: (typeof a.mainValue === 'number' ? a.mainValue : 0)
            + (Array.isArray(a.subs) ? a.subs.reduce((s, sub) => s + (sub.value || 0), 0) : 0)
            + ({ rare: 40, legendaire: 160, mythique: 320 }[a.rarity] || 0)
        }))
        .sort((a, b) => (a.locked ? 1 : 0) - (b.locked ? 1 : 0) || b.score - a.score)
        .slice(0, INVENTORY_MAX)
        .sort((a, b) => a.i - b.i)
        .map(x => x.a);
    }

    dataChanged = true;
  }

  // ── Save shadow_colosseum_data if changed ──
  if (dataChanged) {
    const jsonStr = JSON.stringify(data);
    const sizeBytes = Buffer.byteLength(jsonStr, 'utf8');
    if (dataRow.rows.length > 0) {
      await query(
        `UPDATE user_storage SET data = $1, size_bytes = $2, updated_at = NOW()
         WHERE device_id = $3 AND storage_key = $4`,
        [jsonStr, sizeBytes, deviceId, 'shadow_colosseum_data']
      );
    } else {
      await query(
        `INSERT INTO user_storage (device_id, storage_key, data, size_bytes, updated_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [deviceId, 'shadow_colosseum_data', jsonStr, sizeBytes]
      );
    }
  }

  // ── Hunters → shadow_colosseum_raid ──
  // ── Expedition currencies/essences → shadow_colosseum_raid ──
  const needsRaid = (rewards.hunters && Array.isArray(rewards.hunters) && rewards.hunters.length > 0)
    || rewards.expeditionCurrencies || rewards.expeditionEssences;

  if (needsRaid) {
    const raidRow = await query(
      'SELECT data FROM user_storage WHERE device_id = $1 AND storage_key = $2',
      [deviceId, 'shadow_colosseum_raid']
    );
    let raidData = {};
    if (raidRow.rows.length > 0) {
      raidData = typeof raidRow.rows[0].data === 'string'
        ? JSON.parse(raidRow.rows[0].data) : raidRow.rows[0].data;
    }

    // Hunters
    if (rewards.hunters && Array.isArray(rewards.hunters)) {
      if (!Array.isArray(raidData.hunterCollection)) raidData.hunterCollection = [];
      for (const h of rewards.hunters) {
        const existing = raidData.hunterCollection.find(c => c.id === h.id);
        if (existing) {
          existing.stars = (existing.stars || 0) + (h.stars || 0);
        } else {
          raidData.hunterCollection.push({ id: h.id, stars: h.stars || 0 });
        }
      }
    }

    // Expedition currencies
    if (rewards.expeditionCurrencies) {
      if (!raidData.expeditionCurrencies) raidData.expeditionCurrencies = { alkahest: 0, marteau_rouge: 0, contribution: 0 };
      const c = raidData.expeditionCurrencies;
      c.alkahest = (c.alkahest || 0) + (rewards.expeditionCurrencies.alkahest || 0);
      c.marteau_rouge = (c.marteau_rouge || 0) + (rewards.expeditionCurrencies.marteau_rouge || 0);
      c.contribution = (c.contribution || 0) + (rewards.expeditionCurrencies.contribution || 0);
    }

    // Expedition essences
    if (rewards.expeditionEssences) {
      if (!raidData.expeditionEssences) raidData.expeditionEssences = { guerre: 0, arcanique: 0, gardienne: 0 };
      const e = raidData.expeditionEssences;
      e.guerre = (e.guerre || 0) + (rewards.expeditionEssences.guerre || 0);
      e.arcanique = (e.arcanique || 0) + (rewards.expeditionEssences.arcanique || 0);
      e.gardienne = (e.gardienne || 0) + (rewards.expeditionEssences.gardienne || 0);
    }

    const raidJson = JSON.stringify(raidData);
    const raidSize = Buffer.byteLength(raidJson, 'utf8');
    if (raidRow.rows.length > 0) {
      await query(
        `UPDATE user_storage SET data = $1, size_bytes = $2, updated_at = NOW()
         WHERE device_id = $3 AND storage_key = $4`,
        [raidJson, raidSize, deviceId, 'shadow_colosseum_raid']
      );
    } else {
      await query(
        `INSERT INTO user_storage (device_id, storage_key, data, size_bytes, updated_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [deviceId, 'shadow_colosseum_raid', raidJson, raidSize]
      );
    }
  }

  console.log(`[mail/claim] Rewards applied server-side for ${username}`);
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
// DELETE-READ — Bulk delete all read messages (no unclaimed rewards)
// ═══════════════════════════════════════════════════════════════

async function handleDeleteRead(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await extractUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  // Soft-delete all read personal mail where rewards are null or already claimed
  const result = await query(
    `UPDATE player_mail
     SET expires_at = NOW()
     WHERE recipient_username = $1
       AND read = true
       AND (rewards IS NULL OR claimed = true)
       AND (expires_at IS NULL OR expires_at > NOW())
     RETURNING id`,
    [user.username]
  );

  return res.status(200).json({
    success: true,
    deletedCount: result.rows.length,
  });
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
      case 'delete-read':
        return await handleDeleteRead(req, res);
      case 'search-users':
        return await handleSearchUsers(req, res);
      case 'contact-support':
        return await handleContactSupport(req, res);
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err) {
    console.error('Mail API error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
}
