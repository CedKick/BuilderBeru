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
// DB-OVERVIEW — Tables info (like Neon dashboard)
// ═══════════════════════════════════════════════════════════════

async function handleDbOverview(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  // Table sizes and row counts
  const tables = await query(`
    SELECT
      t.tablename as name,
      pg_total_relation_size(quote_ident(t.tablename)) as total_bytes,
      pg_relation_size(quote_ident(t.tablename)) as data_bytes,
      (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.tablename AND c.table_schema = 'public') as col_count
    FROM pg_tables t
    WHERE t.schemaname = 'public'
    ORDER BY pg_total_relation_size(quote_ident(t.tablename)) DESC
  `);

  // Row counts (separate query for each — fast enough for 20 tables)
  const tableData = [];
  for (const t of tables.rows) {
    const countResult = await query(`SELECT COUNT(*) as cnt FROM "${t.name}"`);
    tableData.push({
      name: t.name,
      rows: parseInt(countResult.rows[0].cnt, 10),
      totalBytes: parseInt(t.total_bytes, 10),
      dataBytes: parseInt(t.data_bytes, 10),
      columns: parseInt(t.col_count, 10),
    });
  }

  // DB total size
  const dbSize = await query(`SELECT pg_database_size(current_database()) as size`);

  return res.status(200).json({
    success: true,
    dbSizeBytes: parseInt(dbSize.rows[0].size, 10),
    tables: tableData,
  });
}

// ═══════════════════════════════════════════════════════════════
// EXPEDITION-DASHBOARD — Overview of all players' expedition data
// ═══════════════════════════════════════════════════════════════

async function handleExpeditionDashboard(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const result = await query(`
    SELECT u.username, u.display_name,
           s.data->'expeditionInventory' as inventory,
           s.data->'expeditionCurrencies' as currencies,
           s.data->'expeditionEssences' as essences,
           s.updated_at
    FROM users u
    JOIN user_storage s ON s.device_id = u.device_id AND s.storage_key = 'shadow_colosseum_raid'
    WHERE s.data ? 'expeditionInventory'
       OR s.data ? 'expeditionCurrencies'
       OR s.data ? 'expeditionEssences'
    ORDER BY u.username
  `);

  const players = result.rows.map(r => {
    const inv = r.inventory || [];
    const cur = r.currencies || {};
    const ess = r.essences || {};

    const rarityCount = {};
    const typeCount = {};
    for (const item of (Array.isArray(inv) ? inv : [])) {
      rarityCount[item.rarity] = (rarityCount[item.rarity] || 0) + 1;
      typeCount[item.type] = (typeCount[item.type] || 0) + 1;
    }

    return {
      username: r.username,
      displayName: r.display_name || r.username,
      itemCount: Array.isArray(inv) ? inv.length : 0,
      rarityCount,
      typeCount,
      currencies: {
        alkahest: cur.alkahest || 0,
        marteau_rouge: cur.marteau_rouge || 0,
        contribution: cur.contribution || 0,
      },
      essences: {
        guerre: ess.guerre || 0,
        arcanique: ess.arcanique || 0,
        gardienne: ess.gardienne || 0,
      },
      updatedAt: r.updated_at,
    };
  });

  return res.status(200).json({ success: true, players });
}

// ═══════════════════════════════════════════════════════════════
// TABLE-ROWS — Browse rows of any table (paginated)
// ═══════════════════════════════════════════════════════════════

async function handleTableRows(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const table = req.query.table;
  if (!table || !/^[a-z_]+$/.test(table)) {
    return res.status(400).json({ error: 'Invalid table name' });
  }

  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
  const offset = parseInt(req.query.offset, 10) || 0;

  // Get columns info
  const cols = await query(
    `SELECT column_name, data_type FROM information_schema.columns
     WHERE table_name = $1 AND table_schema = 'public' ORDER BY ordinal_position`,
    [table]
  );

  // Get rows (truncate large jsonb/text to 500 chars for display)
  const selectCols = cols.rows.map(c => {
    if (c.data_type === 'jsonb' || c.data_type === 'json' || c.data_type === 'text') {
      return `LEFT(CAST("${c.column_name}" AS TEXT), 500) as "${c.column_name}"`;
    }
    return `"${c.column_name}"`;
  }).join(', ');

  const rows = await query(
    `SELECT ${selectCols} FROM "${table}" ORDER BY 1 DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const countResult = await query(`SELECT COUNT(*) as cnt FROM "${table}"`);

  return res.status(200).json({
    success: true,
    table,
    columns: cols.rows.map(c => ({ name: c.column_name, type: c.data_type })),
    rows: rows.rows,
    totalRows: parseInt(countResult.rows[0].cnt, 10),
    limit,
    offset,
  });
}

// ═══════════════════════════════════════════════════════════════
// MIGRATE-EXPEDITION — One-shot: move expeditionInventory → artifactInventory
// ═══════════════════════════════════════════════════════════════

const EXP_SLOT_MAP = { helm: 'casque', chest: 'plastron', gloves: 'gants', boots: 'bottes' };

function mapExpRarity(r) {
  if (r === 'legendary') return 'legendaire';
  if (r === 'epic') return 'legendaire';
  if (r === 'uncommon' || r === 'common') return 'rare';
  return r;
}

function convertExpToArtifact(item) {
  const statEntries = Object.entries(item.stats || {});
  const mainStatEntry = statEntries[0] || ['atk_flat', 0];
  const subEntries = statEntries.slice(1);
  return {
    uid: item.uid || `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    set: item.setId || null,
    slot: item.slot ? (EXP_SLOT_MAP[item.slot] || item.slot) : 'casque',
    rarity: mapExpRarity(item.rarity),
    level: 0,
    mainStat: mainStatEntry[0],
    mainValue: mainStatEntry[1],
    subs: subEntries.map(([sid, value]) => ({ id: sid, value })),
    locked: item.locked || false,
    source: 'expedition',
    expItemId: item.itemId,
    expItemName: item.itemName,
    expOriginalStats: item.stats,
  };
}

function scoreArtifact(art) {
  let score = 0;
  if (typeof art.mainValue === 'number') score += Math.abs(art.mainValue);
  if (Array.isArray(art.subs)) for (const s of art.subs) if (typeof s.value === 'number') score += Math.abs(s.value);
  const w = { rare: 40, legendaire: 160, mythique: 320 };
  score += w[art.rarity] || 0;
  return score;
}

async function handleMigrateExpedition(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  // Find all users with expeditionInventory in shadow_colosseum_raid
  const raidRows = await query(`
    SELECT s.device_id, u.username, s.data as raid_data
    FROM user_storage s
    JOIN users u ON u.device_id = s.device_id
    WHERE s.storage_key = 'shadow_colosseum_raid'
      AND s.data ? 'expeditionInventory'
  `);

  const results = [];
  for (const row of raidRows.rows) {
    const raidData = typeof row.raid_data === 'string' ? JSON.parse(row.raid_data) : row.raid_data;
    const expInv = raidData.expeditionInventory;
    if (!Array.isArray(expInv) || expInv.length === 0) {
      results.push({ username: row.username, status: 'empty', migrated: 0 });
      continue;
    }

    // Filter to equippable items only (armor, weapon, set_piece)
    const equipItems = expInv.filter(i => ['armor', 'weapon', 'set_piece'].includes(i.type));
    if (equipItems.length === 0) {
      results.push({ username: row.username, status: 'no_equip', migrated: 0 });
      continue;
    }

    // Load shadow_colosseum_data
    const saveRow = await query(
      'SELECT data FROM user_storage WHERE device_id = $1 AND storage_key = $2',
      [row.device_id, 'shadow_colosseum_data']
    );

    let saveData = {};
    if (saveRow.rows.length > 0) {
      saveData = typeof saveRow.rows[0].data === 'string' ? JSON.parse(saveRow.rows[0].data) : saveRow.rows[0].data;
    }
    if (!Array.isArray(saveData.artifactInventory)) saveData.artifactInventory = [];

    // Convert and add
    const converted = equipItems.map(convertExpToArtifact);
    saveData.artifactInventory.push(...converted);

    // Cap at 1500 — remove weakest non-locked
    if (saveData.artifactInventory.length > 1500) {
      const scored = saveData.artifactInventory.map((art, idx) => ({ art, idx, score: scoreArtifact(art), locked: art.locked || art.highlighted }));
      scored.sort((a, b) => a.score - b.score);
      const toRemove = new Set();
      let excess = saveData.artifactInventory.length - 1500;
      for (const s of scored) {
        if (excess <= 0) break;
        if (!s.locked) { toRemove.add(s.idx); excess--; }
      }
      saveData.artifactInventory = saveData.artifactInventory.filter((_, i) => !toRemove.has(i));
    }

    // Write back saveData
    const saveJson = JSON.stringify(saveData);
    const saveSize = Buffer.byteLength(saveJson, 'utf8');
    if (saveRow.rows.length > 0) {
      await query(`UPDATE user_storage SET data = $1, size_bytes = $2, updated_at = NOW() WHERE device_id = $3 AND storage_key = 'shadow_colosseum_data'`,
        [saveJson, saveSize, row.device_id]);
    } else {
      await query(`INSERT INTO user_storage (device_id, storage_key, data, size_bytes, updated_at) VALUES ($1, 'shadow_colosseum_data', $2, $3, NOW())`,
        [row.device_id, saveJson, saveSize]);
    }

    // Clear expeditionInventory from raid data
    delete raidData.expeditionInventory;
    delete raidData.expeditionReplacementLog;
    const raidJson = JSON.stringify(raidData);
    const raidSize = Buffer.byteLength(raidJson, 'utf8');
    await query(`UPDATE user_storage SET data = $1, size_bytes = $2, updated_at = NOW() WHERE device_id = $3 AND storage_key = 'shadow_colosseum_raid'`,
      [raidJson, raidSize, row.device_id]);

    results.push({
      username: row.username,
      status: 'migrated',
      migrated: converted.length,
      finalInventorySize: saveData.artifactInventory.length,
    });
  }

  return res.status(200).json({ success: true, results });
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
      case 'expedition-dashboard':
        return await handleExpeditionDashboard(req, res);
      case 'db-overview':
        return await handleDbOverview(req, res);
      case 'table-rows':
        return await handleTableRows(req, res);
      case 'migrate-expedition':
        return await handleMigrateExpedition(req, res);
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err) {
    console.error('Admin API error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}
