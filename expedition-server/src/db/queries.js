import { query } from './pool.js';

// ═══════════════════════════════════════════════════════════
// EXPEDITIONS
// ═══════════════════════════════════════════════════════════

export async function createExpedition(name, scheduledAt) {
  const result = await query(
    `INSERT INTO expeditions (name, scheduled_at) VALUES ($1, $2) RETURNING *`,
    [name, scheduledAt]
  );
  return result.rows[0];
}

export async function getExpedition(id) {
  const result = await query(`SELECT * FROM expeditions WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

export async function getCurrentExpedition() {
  const result = await query(
    `SELECT * FROM expeditions WHERE status != 'finished' AND status != 'wiped' ORDER BY created_at DESC LIMIT 1`
  );
  return result.rows[0] || null;
}

export async function getLatestExpedition() {
  const result = await query(
    `SELECT * FROM expeditions ORDER BY created_at DESC LIMIT 1`
  );
  return result.rows[0] || null;
}

export async function getPreviousExpedition() {
  const result = await query(
    `SELECT * FROM expeditions WHERE status IN ('finished', 'wiped') ORDER BY ended_at DESC LIMIT 1`
  );
  return result.rows[0] || null;
}

export async function updateExpeditionStatus(id, status, extra = {}) {
  const sets = ['status = $2'];
  const params = [id, status];
  let i = 3;

  if (extra.startedAt !== undefined) {
    sets.push(`started_at = $${i++}`);
    params.push(extra.startedAt);
  }
  if (extra.endedAt !== undefined) {
    sets.push(`ended_at = $${i++}`);
    params.push(extra.endedAt);
  }
  if (extra.maxBossReached !== undefined) {
    sets.push(`max_boss_reached = $${i++}`);
    params.push(extra.maxBossReached);
  }
  if (extra.currentWave !== undefined) {
    sets.push(`current_wave = $${i++}`);
    params.push(extra.currentWave);
  }
  if (extra.totalDeaths !== undefined) {
    sets.push(`total_deaths = $${i++}`);
    params.push(extra.totalDeaths);
  }

  await query(`UPDATE expeditions SET ${sets.join(', ')} WHERE id = $1`, params);
}

export async function saveExpeditionSnapshot(id, snapshot) {
  await query(
    `UPDATE expeditions SET state_snapshot = $2 WHERE id = $1`,
    [id, JSON.stringify(snapshot)]
  );
}

// ═══════════════════════════════════════════════════════════
// ENTRIES (Player Registration)
// ═══════════════════════════════════════════════════════════

export async function registerPlayer(expeditionId, username, deviceId, characterIds, characterData, srItems, autoRegister = false) {
  const result = await query(
    `INSERT INTO expedition_entries (expedition_id, username, device_id, character_ids, character_data, sr_items, auto_register)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (expedition_id, username) DO UPDATE SET
       character_ids = EXCLUDED.character_ids,
       character_data = EXCLUDED.character_data,
       sr_items = EXCLUDED.sr_items,
       auto_register = EXCLUDED.auto_register,
       joined_at = NOW()
     RETURNING *`,
    [expeditionId, username, deviceId, JSON.stringify(characterIds), JSON.stringify(characterData), JSON.stringify(srItems || []), autoRegister]
  );
  return result.rows[0];
}

export async function getAutoRegisterEntries(expeditionId) {
  const result = await query(
    `SELECT * FROM expedition_entries WHERE expedition_id = $1 AND auto_register = true`,
    [expeditionId]
  );
  return result.rows;
}

export async function setAutoRegister(expeditionId, username, value) {
  await query(
    `UPDATE expedition_entries SET auto_register = $3 WHERE expedition_id = $1 AND username = $2`,
    [expeditionId, username, value]
  );
}

export async function unregisterPlayer(expeditionId, username) {
  await query(
    `DELETE FROM expedition_entries WHERE expedition_id = $1 AND username = $2`,
    [expeditionId, username]
  );
}

export async function getEntries(expeditionId) {
  const result = await query(
    `SELECT * FROM expedition_entries WHERE expedition_id = $1 ORDER BY joined_at ASC`,
    [expeditionId]
  );
  return result.rows;
}

export async function getEntryCount(expeditionId) {
  const result = await query(
    `SELECT COUNT(*) FROM expedition_entries WHERE expedition_id = $1`,
    [expeditionId]
  );
  return parseInt(result.rows[0].count);
}

export async function getTotalCharacterCount(expeditionId) {
  const result = await query(
    `SELECT COALESCE(SUM(jsonb_array_length(character_ids)), 0) as total
     FROM expedition_entries WHERE expedition_id = $1`,
    [expeditionId]
  );
  return parseInt(result.rows[0].total);
}

// ═══════════════════════════════════════════════════════════
// CHARACTER STATE
// ═══════════════════════════════════════════════════════════

export async function saveCharacterStates(expeditionId, characters) {
  if (!characters.length) return;
  const values = [];
  const params = [];
  let i = 1;
  for (const c of characters) {
    values.push(`($${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++})`);
    params.push(
      expeditionId, c.username, c.hunterId,
      Math.floor(c.hp || 0), Math.floor(c.maxHp || 0),
      Math.floor(c.mana || 0), Math.floor(c.maxMana || 0),
      c.alive,
      Math.floor(c.stats.damageDealt || 0), Math.floor(c.stats.healingDone || 0),
      Math.floor(c.stats.kills || 0), Math.floor(c.stats.deaths || 0)
    );
  }
  await query(
    `INSERT INTO expedition_character_state
       (expedition_id, username, hunter_id, hp, max_hp, mana, max_mana, alive, damage_dealt, healing_done, kills, deaths)
     VALUES ${values.join(', ')}
     ON CONFLICT (expedition_id, username, hunter_id) DO UPDATE SET
       hp = EXCLUDED.hp, max_hp = EXCLUDED.max_hp,
       mana = EXCLUDED.mana, max_mana = EXCLUDED.max_mana,
       alive = EXCLUDED.alive,
       damage_dealt = EXCLUDED.damage_dealt, healing_done = EXCLUDED.healing_done,
       kills = EXCLUDED.kills, deaths = EXCLUDED.deaths`,
    params
  );
}

export async function getCharacterStates(expeditionId) {
  const result = await query(
    `SELECT * FROM expedition_character_state WHERE expedition_id = $1`,
    [expeditionId]
  );
  return result.rows;
}

// ═══════════════════════════════════════════════════════════
// LOOT
// ═══════════════════════════════════════════════════════════

export async function saveLootDrop(expeditionId, encounterIndex, itemId, itemName, rarity, binding, winnerUsername, winnerRoll, stolen, srWinner) {
  const result = await query(
    `INSERT INTO expedition_loot
       (expedition_id, encounter_index, item_id, item_name, rarity, binding, winner_username, winner_roll, stolen, sr_winner)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [expeditionId, encounterIndex, itemId, itemName, rarity, binding, winnerUsername, winnerRoll, stolen, srWinner]
  );
  return result.rows[0].id;
}

export async function saveLootRolls(lootId, rolls) {
  if (!rolls.length) return;
  const values = [];
  const params = [];
  let i = 1;
  for (const r of rolls) {
    values.push(`($${i++}, $${i++}, $${i++}, $${i++})`);
    params.push(lootId, r.username, r.rollValue, r.hadSr);
  }
  await query(
    `INSERT INTO expedition_loot_rolls (loot_id, username, roll_value, had_sr) VALUES ${values.join(', ')}`,
    params
  );
}

export async function getLootHistory(expeditionId) {
  const result = await query(
    `SELECT l.*, json_agg(json_build_object(
       'username', r.username, 'roll_value', r.roll_value, 'had_sr', r.had_sr
     ) ORDER BY r.roll_value DESC) as rolls
     FROM expedition_loot l
     LEFT JOIN expedition_loot_rolls r ON r.loot_id = l.id
     WHERE l.expedition_id = $1
     GROUP BY l.id
     ORDER BY l.rolled_at ASC`,
    [expeditionId]
  );
  return result.rows;
}

// ═══════════════════════════════════════════════════════════
// ITEMS
// ═══════════════════════════════════════════════════════════

export async function getAllItems() {
  const result = await query(`SELECT * FROM expedition_items ORDER BY rarity, name`);
  return result.rows;
}

export async function upsertItem(item) {
  await query(
    `INSERT INTO expedition_items (id, name, type, slot, rarity, binding, stats, set_id, description, sprite_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name, type = EXCLUDED.type, slot = EXCLUDED.slot,
       rarity = EXCLUDED.rarity, binding = EXCLUDED.binding, stats = EXCLUDED.stats,
       set_id = EXCLUDED.set_id, description = EXCLUDED.description, sprite_url = EXCLUDED.sprite_url`,
    [item.id, item.name, item.type, item.slot, item.rarity, item.binding,
     JSON.stringify(item.stats), item.setId, item.description, item.spriteUrl]
  );
}

export async function upsertSet(set) {
  await query(
    `INSERT INTO expedition_sets (id, name, bonus_2pc, bonus_4pc)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name, bonus_2pc = EXCLUDED.bonus_2pc, bonus_4pc = EXCLUDED.bonus_4pc`,
    [set.id, set.name, JSON.stringify(set.bonus2pc), JSON.stringify(set.bonus4pc)]
  );
}

// ═══════════════════════════════════════════════════════════
// PLAYER INVENTORY (from user_storage — shared Neon DB)
// ═══════════════════════════════════════════════════════════

export async function getPlayerInventory(username) {
  // user_storage uses device_id, so we join through the users table
  const result = await query(
    `SELECT s.data FROM users u
     JOIN user_storage s ON s.device_id = u.device_id
     WHERE LOWER(u.username) = LOWER($1) AND s.storage_key = 'shadow_colosseum_raid'`,
    [username]
  );
  if (result.rows.length === 0) return [];
  const data = typeof result.rows[0].data === 'string'
    ? JSON.parse(result.rows[0].data)
    : result.rows[0].data;
  return data?.expeditionInventory || [];
}

// ═══════════════════════════════════════════════════════════
// MAIL — Send expedition loot summary to players
// ═══════════════════════════════════════════════════════════

export async function sendExpeditionMail(username, expeditionId, finalStatus, items, currencies, essences, bossesKilled) {
  const statusLabel = finalStatus === 'wiped' ? 'Wipe' : 'Victoire';
  const subject = `Expedition #${expeditionId} - ${statusLabel}`;

  let message = `Expedition #${expeditionId} terminee (${statusLabel} - ${bossesKilled} boss vaincus)\n\n`;

  if (items.length > 0) {
    message += `BUTIN (${items.length} items):\n`;
    items.forEach(it => {
      message += `- ${it.itemName} (${it.rarity})${it.srWinner ? ' [SR]' : ''}\n`;
    });
  } else {
    message += 'Aucun item obtenu.\n';
  }

  message += '\nMONNAIES:\n';
  message += `- Alkahest: ${currencies.alkahest || 0}\n`;
  message += `- Marteau Rouge: ${currencies.marteau_rouge || 0}\n`;
  message += `- Contribution: ${currencies.contribution || 0}\n`;

  message += '\nESSENCES:\n';
  message += `- Guerre: ${essences.guerre || 0}\n`;
  message += `- Arcanique: ${essences.arcanique || 0}\n`;
  message += `- Gardienne: ${essences.gardienne || 0}\n`;

  const rewards = {
    expeditionItems: items.map(it => ({
      itemId: it.itemId,
      itemName: it.itemName,
      rarity: it.rarity,
      binding: it.binding,
    })),
    expeditionCurrencies: currencies,
    expeditionEssences: essences,
  };

  const result = await query(
    `INSERT INTO player_mail (recipient_username, sender, subject, message, mail_type, rewards, expires_at)
     VALUES ($1, 'Expedition', $2, $3, 'reward', $4, NOW() + INTERVAL '30 days')
     RETURNING id`,
    [username, subject, message, JSON.stringify(rewards)]
  );
  return result.rows[0].id;
}

export async function getExpeditionLootByPlayer(expeditionId) {
  const result = await query(
    `SELECT winner_username, item_id, item_name, rarity, binding, sr_winner, stolen
     FROM expedition_loot WHERE expedition_id = $1 ORDER BY rolled_at`,
    [expeditionId]
  );
  // Group by player
  const byPlayer = {};
  for (const row of result.rows) {
    if (row.stolen || !row.winner_username) continue;
    if (!byPlayer[row.winner_username]) byPlayer[row.winner_username] = [];
    byPlayer[row.winner_username].push({
      itemId: row.item_id,
      itemName: row.item_name,
      rarity: row.rarity,
      binding: row.binding,
      srWinner: row.sr_winner,
    });
  }
  return byPlayer;
}
