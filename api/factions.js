// api/factions.js
// Backend API for faction system (Vox Cordis vs Replicant)

import { query } from './_db/neon.js';
import { extractUser } from './_utils/auth.js';

// ═══════════════════════════════════════════════════════════════
// FACTION CONSTANTS
// ═══════════════════════════════════════════════════════════════

export const FACTIONS = {
  vox_cordis: {
    id: 'vox_cordis',
    name: 'Vox Cordis',
    description: 'La voix du cœur - Faction dédiée à la solidarité et la protection',
    color: '#3b82f6', // blue-500
    icon: '💙',
  },
  replicant: {
    id: 'replicant',
    name: 'Replicant',
    description: 'Les réplicants - Faction dédiée à la puissance et la domination',
    color: '#dc2626', // red-600
    icon: '🔴',
  },
};

export const FACTION_BUFFS = {
  loot_sulfuras: { name: 'Loot Sulfuras', description: '+% drop rate Sulfuras', maxLevel: 10, costPerLevel: 100 },
  loot_raeshalare: { name: 'Loot Raeshalare', description: '+% drop rate Raeshalare', maxLevel: 10, costPerLevel: 100 },
  loot_katana_z: { name: 'Loot Katana Z', description: '+% drop rate Katana Z', maxLevel: 10, costPerLevel: 100 },
  loot_katana_v: { name: 'Loot Katana V', description: '+5% drop rate Katana V par niv', maxLevel: 10, costPerLevel: 100 },
  loot_guldan: { name: "Loot Gul'dan", description: "+5% drop rate Baton de Gul'dan par niv", maxLevel: 10, costPerLevel: 100 },
  stats_hp: { name: 'HP Bonus', description: '+1% HP par niveau', maxLevel: 20, costPerLevel: 150 },
  stats_atk: { name: 'ATK Bonus', description: '+1% ATK par niveau', maxLevel: 20, costPerLevel: 150 },
  stats_def: { name: 'DEF Bonus', description: '+1% DEF par niveau', maxLevel: 20, costPerLevel: 150 },
};

export const FACTION_CHANGE_COST = 5000; // Shadow Coins cost to change faction

// Valid Tier 6 stages for offline farm
const VALID_FARM_STAGES = new Set(['archdemon', 'ragnarok', 'zephyr', 'supreme_monarch']);
const MAX_FARM_MINUTES = 240; // 4h cap
const BATTLES_PER_MINUTE = 15;

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const getCurrentWeek = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneWeek);
};

// ═══════════════════════════════════════════════════════════════
// API HANDLER
// ═══════════════════════════════════════════════════════════════

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://builderberu.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query.action;

  try {
    switch (action) {
      case 'init': return await handleInit(req, res);
      case 'join': return await handleJoin(req, res);
      case 'status': return await handleStatus(req, res);
      case 'contribute': return await handleContribute(req, res);
      case 'upgrade-buff': return await handleUpgradeBuff(req, res);
      case 'shop-buy': return await handleShopBuy(req, res);
      case 'weekly-stats': return await handleWeeklyStats(req, res);
      case 'change-faction': return await handleChangeFaction(req, res);
      case 'activity-reward': return await handleActivityReward(req, res);
      case 'heartbeat': return await handleHeartbeat(req, res);
      case 'faction-members': return await handleFactionMembers(req, res);
      case 'offline-farm-start': return await handleOfflineFarmStart(req, res);
      case 'offline-farm-end': return await handleOfflineFarmEnd(req, res);
      default:
        return res.status(400).json({ success: false, message: 'Invalid action' });
    }
  } catch (error) {
    console.error('Faction API error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

// ─── INIT: Create tables ───────────────────────────────────────

async function handleInit(req, res) {
  const user = await extractUser(req);
  if (!user || user.username.toLowerCase() !== 'kly') {
    return res.status(403).json({ success: false, message: 'Admin only' });
  }

  await query(`
    CREATE TABLE IF NOT EXISTS player_factions (
      username VARCHAR(20) PRIMARY KEY,
      faction VARCHAR(20) NOT NULL,
      contribution_points INT DEFAULT 0,
      points_spent INT DEFAULT 0,
      joined_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS faction_buffs (
      faction VARCHAR(20) NOT NULL,
      buff_id VARCHAR(50) NOT NULL,
      level INT DEFAULT 0,
      PRIMARY KEY (faction, buff_id)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS faction_weekly (
      week INT NOT NULL,
      faction VARCHAR(20) NOT NULL,
      total_points_unspent INT DEFAULT 0,
      total_members INT DEFAULT 0,
      winner BOOLEAN DEFAULT FALSE,
      PRIMARY KEY (week, faction)
    )
  `);

  // Initialize buffs for both factions
  for (const factionId of Object.keys(FACTIONS)) {
    for (const buffId of Object.keys(FACTION_BUFFS)) {
      await query(
        `INSERT INTO faction_buffs (faction, buff_id, level)
         VALUES ($1, $2, 0)
         ON CONFLICT (faction, buff_id) DO NOTHING`,
        [factionId, buffId]
      );
    }
  }

  // Migration: add last_activity column
  await query(`ALTER TABLE player_factions ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ DEFAULT NOW()`);

  // Migration: offline farm columns
  await query(`
    ALTER TABLE player_factions
      ADD COLUMN IF NOT EXISTS farm_active BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS farm_started_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS farm_stage_id VARCHAR(30),
      ADD COLUMN IF NOT EXISTS last_farm_end_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS last_farm_minutes INT DEFAULT 0
  `);

  return res.json({ success: true, message: 'Faction tables created' });
}

// ─── JOIN: Join a faction ──────────────────────────────────────

async function handleJoin(req, res) {
  const user = await extractUser(req);
  if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });

  const { faction } = req.body;
  if (!FACTIONS[faction]) {
    return res.status(400).json({ success: false, message: 'Invalid faction' });
  }

  // Check if already in a faction
  const existing = await query(
    'SELECT faction FROM player_factions WHERE username = $1',
    [user.username]
  );

  if (existing.rows.length > 0) {
    return res.status(400).json({ success: false, message: 'Already in a faction' });
  }

  await query(
    'INSERT INTO player_factions (username, faction, contribution_points, points_spent) VALUES ($1, $2, 0, 0)',
    [user.username, faction]
  );

  return res.json({ success: true, faction, message: `Joined ${FACTIONS[faction].name}!` });
}

// ─── STATUS: Get player faction status ────────────────────────

async function handleStatus(req, res) {
  const user = await extractUser(req);
  if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });

  const playerData = await query(
    'SELECT faction, contribution_points, points_spent, joined_at, farm_active, farm_started_at, farm_stage_id FROM player_factions WHERE username = $1',
    [user.username]
  );

  if (playerData.rows.length === 0) {
    return res.json({ success: true, inFaction: false });
  }

  const player = playerData.rows[0];
  const faction = FACTIONS[player.faction];

  // Get faction buffs
  const buffs = await query(
    'SELECT buff_id, level FROM faction_buffs WHERE faction = $1',
    [player.faction]
  );

  const buffsMap = {};
  buffs.rows.forEach(b => {
    buffsMap[b.buff_id] = b.level;
  });

  return res.json({
    success: true,
    inFaction: true,
    faction: {
      id: player.faction,
      ...faction,
    },
    contributionPoints: player.contribution_points,
    pointsSpent: player.points_spent,
    pointsAvailable: player.contribution_points - player.points_spent,
    joinedAt: player.joined_at,
    buffs: buffsMap,
    farmActive: !!player.farm_active,
    farmStageId: player.farm_stage_id,
    farmStartedAt: player.farm_started_at,
  });
}

// ─── CONTRIBUTE: Add contribution points (admin only for now) ─

async function handleContribute(req, res) {
  const user = await extractUser(req);
  if (!user || user.username.toLowerCase() !== 'kly') {
    return res.status(403).json({ success: false, message: 'Admin only' });
  }

  const { targetUsername, points } = req.body;

  await query(
    'UPDATE player_factions SET contribution_points = contribution_points + $1 WHERE username = $2',
    [points, targetUsername]
  );

  return res.json({ success: true, message: `Added ${points} points to ${targetUsername}` });
}

// ─── ACTIVITY REWARD: Award contribution points for completing activities ─

const ACTIVITY_POINTS = { arc: 1, raid: 5 };

async function handleActivityReward(req, res) {
  const user = await extractUser(req);
  if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });

  const { activity, count = 1 } = req.body;
  const batchCount = Math.min(Math.max(1, parseInt(count) || 1), 500); // Cap at 500
  const basePoints = ACTIVITY_POINTS[activity];
  if (!basePoints) return res.status(400).json({ success: false, message: 'Invalid activity' });
  const points = basePoints * batchCount;

  const result = await query(
    'UPDATE player_factions SET contribution_points = contribution_points + $1, last_activity = NOW() WHERE username = $2 RETURNING contribution_points, points_spent',
    [points, user.username]
  );

  if (result.rows.length === 0) {
    return res.json({ success: false, message: 'Not in a faction' });
  }

  const row = result.rows[0];
  return res.json({ success: true, points, total: row.contribution_points, available: row.contribution_points - row.points_spent });
}

// ─── UPGRADE BUFF: Spend points to upgrade faction buff ───────

async function handleUpgradeBuff(req, res) {
  const user = await extractUser(req);
  if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });

  const { buffId } = req.body;
  const buffConfig = FACTION_BUFFS[buffId];
  if (!buffConfig) {
    return res.status(400).json({ success: false, message: 'Invalid buff' });
  }

  // Get player faction
  const playerData = await query(
    'SELECT faction, contribution_points, points_spent FROM player_factions WHERE username = $1',
    [user.username]
  );

  if (playerData.rows.length === 0) {
    return res.status(400).json({ success: false, message: 'Not in a faction' });
  }

  const player = playerData.rows[0];
  const pointsAvailable = player.contribution_points - player.points_spent;

  if (pointsAvailable < buffConfig.costPerLevel) {
    return res.status(400).json({ success: false, message: 'Not enough points' });
  }

  // Get current buff level
  const buffData = await query(
    'SELECT level FROM faction_buffs WHERE faction = $1 AND buff_id = $2',
    [player.faction, buffId]
  );

  const currentLevel = buffData.rows[0]?.level || 0;
  if (currentLevel >= buffConfig.maxLevel) {
    return res.status(400).json({ success: false, message: 'Buff already at max level' });
  }

  // Upgrade buff (UPSERT: handles buffs added after initial DB init)
  await query(
    `INSERT INTO faction_buffs (faction, buff_id, level)
     VALUES ($1, $2, 1)
     ON CONFLICT (faction, buff_id)
     DO UPDATE SET level = faction_buffs.level + 1`,
    [player.faction, buffId]
  );

  // Deduct points
  await query(
    'UPDATE player_factions SET points_spent = points_spent + $1 WHERE username = $2',
    [buffConfig.costPerLevel, user.username]
  );

  return res.json({
    success: true,
    newLevel: currentLevel + 1,
    pointsSpent: buffConfig.costPerLevel,
    message: `${buffConfig.name} upgraded to level ${currentLevel + 1}!`,
  });
}

// ─── SHOP BUY: Buy items from faction shop (placeholder) ──────

async function handleShopBuy(req, res) {
  const user = await extractUser(req);
  if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });

  const { itemId, cost } = req.body;

  // TODO: Implement shop items
  return res.status(501).json({ success: false, message: 'Shop not implemented yet' });
}

// ─── WEEKLY STATS: Get weekly faction competition stats ───────

async function handleWeeklyStats(req, res) {
  const currentWeek = getCurrentWeek();

  // Always recompute live member counts & unspent points from player_factions
  for (const factionId of Object.keys(FACTIONS)) {
    const members = await query(
      'SELECT COUNT(*) as count, SUM(contribution_points - points_spent) as unspent FROM player_factions WHERE faction = $1',
      [factionId]
    );

    const count = parseInt(members.rows[0]?.count) || 0;
    const unspent = parseInt(members.rows[0]?.unspent) || 0;

    await query(
      `INSERT INTO faction_weekly (week, faction, total_points_unspent, total_members)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (week, faction) DO UPDATE
       SET total_points_unspent = $3, total_members = $4`,
      [currentWeek, factionId, unspent, count]
    );
  }

  const stats = await query(
    'SELECT faction, total_points_unspent, total_members, winner FROM faction_weekly WHERE week = $1',
    [currentWeek]
  );

  return res.json({ success: true, week: currentWeek, factions: stats.rows });
}

// ─── CHANGE FACTION: Switch to a different faction (costs coins + loses points) ─

async function handleChangeFaction(req, res) {
  const user = await extractUser(req);
  if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });

  const { newFaction } = req.body;

  // Validate new faction
  if (!FACTIONS[newFaction]) {
    return res.status(400).json({ success: false, message: 'Invalid faction' });
  }

  // Get current faction
  const playerData = await query(
    'SELECT faction, contribution_points, points_spent FROM player_factions WHERE username = $1',
    [user.username]
  );

  if (playerData.rows.length === 0) {
    return res.status(400).json({ success: false, message: 'Not in a faction yet' });
  }

  const currentFaction = playerData.rows[0].faction;

  // Check if trying to change to same faction
  if (currentFaction === newFaction) {
    return res.status(400).json({ success: false, message: 'Already in this faction' });
  }

  // Change faction and reset points
  await query(
    'UPDATE player_factions SET faction = $1, contribution_points = 0, points_spent = 0 WHERE username = $2',
    [newFaction, user.username]
  );

  return res.json({
    success: true,
    newFaction,
    oldFaction: currentFaction,
    cost: FACTION_CHANGE_COST,
    message: `Vous avez rejoint ${FACTIONS[newFaction].name}!`,
  });
}

// ─── HEARTBEAT: Lightweight activity ping ─────────────────────

async function handleHeartbeat(req, res) {
  const user = await extractUser(req);
  if (!user) return res.status(401).json({ success: false });
  await query('UPDATE player_factions SET last_activity = NOW() WHERE username = $1', [user.username]);
  return res.json({ success: true });
}

// ─── FACTION MEMBERS: List members with online status ─────────

async function handleFactionMembers(req, res) {
  const user = await extractUser(req);
  if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });

  // Get player's faction
  const playerData = await query(
    'SELECT faction FROM player_factions WHERE username = $1',
    [user.username]
  );
  if (playerData.rows.length === 0) {
    return res.status(400).json({ success: false, message: 'Not in a faction' });
  }
  const factionId = playerData.rows[0].faction;

  // Get all members of this faction with display_name from users table
  const members = await query(
    `SELECT pf.username, u.display_name, pf.contribution_points, pf.last_activity
     FROM player_factions pf
     LEFT JOIN users u ON LOWER(u.username) = LOWER(pf.username)
     WHERE pf.faction = $1
     ORDER BY pf.last_activity DESC NULLS LAST
     LIMIT 100`,
    [factionId]
  );

  const now = Date.now();
  const membersList = members.rows.map(m => {
    const lastAct = m.last_activity ? new Date(m.last_activity).getTime() : 0;
    const diffMin = (now - lastAct) / 60000;
    let status = 'offline';
    if (diffMin < 5) status = 'online';
    else if (diffMin < 60) status = 'recent';
    return {
      username: m.username,
      displayName: m.display_name || m.username,
      points: m.contribution_points,
      status,
    };
  });

  return res.json({
    success: true,
    faction: factionId,
    factionName: FACTIONS[factionId]?.name || factionId,
    members: membersList,
  });
}

// ═══════════════════════════════════════════════════════════════
// OFFLINE FARM — Server-validated session management
// ═══════════════════════════════════════════════════════════════

async function handleOfflineFarmStart(req, res) {
  const user = await extractUser(req);
  if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });

  const { stageId } = req.body;
  if (!stageId || !VALID_FARM_STAGES.has(stageId)) {
    return res.status(400).json({ success: false, message: 'Invalid stage for offline farm' });
  }

  const playerData = await query(
    'SELECT faction, contribution_points, points_spent, farm_active FROM player_factions WHERE username = $1',
    [user.username]
  );

  if (playerData.rows.length === 0) {
    return res.status(400).json({ success: false, message: 'Not in a faction' });
  }

  const player = playerData.rows[0];

  if (player.farm_active) {
    return res.status(400).json({ success: false, message: 'Farm already active' });
  }

  const available = player.contribution_points - player.points_spent;
  if (available < 1) {
    return res.status(400).json({ success: false, message: 'Not enough contribution points (need at least 1)' });
  }

  await query(
    `UPDATE player_factions
     SET farm_active = true, farm_started_at = NOW(), farm_stage_id = $2
     WHERE username = $1`,
    [user.username, stageId]
  );

  console.log(`[farm] ${user.username} started offline farm on ${stageId}`);

  return res.json({ success: true, farmStartedAt: new Date().toISOString(), stageId });
}

async function handleOfflineFarmEnd(req, res) {
  const user = await extractUser(req);
  if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });

  const playerData = await query(
    'SELECT faction, contribution_points, points_spent, farm_active, farm_started_at, farm_stage_id FROM player_factions WHERE username = $1',
    [user.username]
  );

  if (playerData.rows.length === 0) {
    return res.status(400).json({ success: false, message: 'Not in a faction' });
  }

  const player = playerData.rows[0];

  if (!player.farm_active || !player.farm_started_at) {
    return res.json({ success: true, actualMinutes: 0, maxBattles: 0, stageId: null, message: 'No active farm' });
  }

  // Server calculates elapsed time — client cannot inflate
  const elapsed = Math.floor((Date.now() - new Date(player.farm_started_at).getTime()) / 60000);
  const cappedMinutes = Math.min(elapsed, MAX_FARM_MINUTES);
  const available = player.contribution_points - player.points_spent;
  const actualMinutes = Math.min(cappedMinutes, available);
  const maxBattles = actualMinutes * BATTLES_PER_MINUTE;

  // Deduct faction points and clear farm state
  await query(
    `UPDATE player_factions
     SET farm_active = false,
         farm_started_at = NULL,
         farm_stage_id = NULL,
         points_spent = points_spent + $2,
         last_farm_end_at = NOW(),
         last_farm_minutes = $2
     WHERE username = $1`,
    [user.username, actualMinutes]
  );

  console.log(`[farm] ${user.username} ended offline farm: ${actualMinutes}min, ${maxBattles} battles on ${player.farm_stage_id}`);

  return res.json({
    success: true,
    actualMinutes,
    maxBattles,
    stageId: player.farm_stage_id,
    pointsDeducted: actualMinutes,
  });
}
