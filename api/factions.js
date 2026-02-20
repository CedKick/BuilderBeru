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
  loot_katana_v: { name: 'Loot Katana V', description: '+% drop rate Katana V', maxLevel: 10, costPerLevel: 100 },
  stats_hp: { name: 'HP Bonus', description: '+1% HP par niveau', maxLevel: 20, costPerLevel: 150 },
  stats_atk: { name: 'ATK Bonus', description: '+1% ATK par niveau', maxLevel: 20, costPerLevel: 150 },
  stats_def: { name: 'DEF Bonus', description: '+1% DEF par niveau', maxLevel: 20, costPerLevel: 150 },
};

export const FACTION_CHANGE_COST = 5000; // Shadow Coins cost to change faction

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
    'SELECT faction, contribution_points, points_spent, joined_at FROM player_factions WHERE username = $1',
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

  // Upgrade buff
  await query(
    'UPDATE faction_buffs SET level = level + 1 WHERE faction = $1 AND buff_id = $2',
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

  const stats = await query(
    'SELECT faction, total_points_unspent, total_members, winner FROM faction_weekly WHERE week = $1',
    [currentWeek]
  );

  // If no data for this week, compute it
  if (stats.rows.length === 0) {
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

    // Re-fetch
    const newStats = await query(
      'SELECT faction, total_points_unspent, total_members, winner FROM faction_weekly WHERE week = $1',
      [currentWeek]
    );

    return res.json({ success: true, week: currentWeek, factions: newStats.rows });
  }

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
