import { SERVER, EXPEDITION, CAMPFIRE, MARCH } from '../config.js';
import { CombatEngine2D } from './CombatEngine2D.js';
import { AIController } from './AIController.js';
import { LootEngine } from './LootEngine.js';
import { generateEncounterSequence } from './WaveGenerator.js';
import { ExpeditionCharacter } from '../entities/ExpeditionCharacter.js';
import { Mob } from '../entities/Mob.js';
import { ExpeditionBoss } from '../entities/ExpeditionBoss.js';
import { MOB_TEMPLATES } from '../data/mobTemplates.js';
import { getBossDefinition } from '../data/bossDefinitions.js';
import * as db from '../db/queries.js';

// ── ExpeditionEngine ──
// Central state machine that orchestrates the entire expedition lifecycle.
// States: registration -> active -> [march -> combat -> loot_roll -> campfire] -> finished | wiped

export class ExpeditionEngine {
  constructor(broadcast) {
    this.broadcast = broadcast || (() => {});  // WebSocket broadcast function

    // DB state
    this.expeditionId = null;

    // State machine
    this.status = 'idle';  // idle | registration | march | combat | loot_roll | campfire | finished | wiped

    // Characters (all players' hunters)
    this.characters = [];

    // SR selections: Map<username, itemId>
    this.srSelections = new Map();

    // Encounter system
    this.encounters = [];
    this.currentEncounterIndex = 0;

    // Current combat entities
    this.currentMobs = [];
    this.currentBoss = null;

    // Engines
    this.combatEngine = new CombatEngine2D();

    // Timers
    this.elapsedSeconds = 0;
    this.phaseTimer = 0;

    // Loot
    this.lootLog = [];
    this.pendingLootResults = null;

    // Campfire
    this.rezUsedThisCombat = new Set();

    // Stats
    this.bossesKilled = 0;
    this.totalDeaths = 0;

    // Tick management
    this.tickInterval = null;
    this.tickCount = 0;
    this.lastSnapshotTime = 0;
  }

  // ═══════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════

  getStatus() {
    return {
      status: this.status,
      expeditionId: this.expeditionId,
      elapsedSeconds: Math.floor(this.elapsedSeconds),
      currentEncounter: this.currentEncounterIndex,
      totalEncounters: this.encounters.length,
      bossesKilled: this.bossesKilled,
      aliveCount: this.characters.filter(c => c.alive).length,
      totalCharacters: this.characters.length,
    };
  }

  // Start the expedition: initialize characters from entries, generate encounters, begin
  // Reset engine to idle state (for admin reset)
  reset() {
    this.stop();
    this.expeditionId = null;
    this.status = 'idle';
    this.characters = [];
    this.srSelections = new Map();
    this.encounters = [];
    this.currentEncounterIndex = 0;
    this.currentMobs = [];
    this.currentBoss = null;
    this.combatEngine = new CombatEngine2D();
    this.elapsedSeconds = 0;
    this.phaseTimer = 0;
    this.lootLog = [];
    this.pendingLootResults = null;
    this.rezUsedThisCombat = new Set();
    this.bossesKilled = 0;
    this.totalDeaths = 0;
    this.tickCount = 0;
    this.lastSnapshotTime = 0;
    console.log('[Expedition] Engine reset to idle');
  }

  async start(expeditionId, entries) {
    this.expeditionId = expeditionId;

    // Build characters from registered entries
    this.characters = [];
    for (const entry of entries) {
      const charIds = typeof entry.character_ids === 'string'
        ? JSON.parse(entry.character_ids)
        : entry.character_ids;
      const charData = typeof entry.character_data === 'string'
        ? JSON.parse(entry.character_data)
        : entry.character_data;

      for (const hunterId of charIds) {
        const data = charData[hunterId] || {};
        const level = data.level || 1;
        const stars = data.stars || 0;
        const precomputedStats = data.fullStats || null;
        try {
          const char = new ExpeditionCharacter(entry.username, hunterId, level, stars, precomputedStats);
          this.characters.push(char);
        } catch (e) {
          console.warn(`[Expedition] Failed to create character ${hunterId} for ${entry.username}:`, e.message);
        }
      }

      // Store SR selection
      if (entry.sr_item_id) {
        this.srSelections.set(entry.username, entry.sr_item_id);
      }
    }

    if (this.characters.length === 0) {
      console.error('[Expedition] No valid characters, cannot start');
      return;
    }

    // Generate encounter sequence (3 bosses for Phase 1)
    this.encounters = generateEncounterSequence(3);
    this.currentEncounterIndex = 0;

    // Assign initial formation (no boss yet → linear fallback)
    AIController.assignFormation(this.characters, null);

    // Update DB
    await db.updateExpeditionStatus(expeditionId, 'active', { startedAt: new Date() });

    console.log(`[Expedition] Started! ${this.characters.length} characters, ${this.encounters.length} encounters`);

    // Transition to first march
    this.transitionTo('march');

    // Start tick loop
    this.startTickLoop();
  }

  startTickLoop() {
    if (this.tickInterval) return;
    this.tickInterval = setInterval(() => this.tick(), SERVER.TICK_MS);
  }

  stop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  // ═══════════════════════════════════════════════════════
  // MAIN TICK (called at 4 TPS)
  // ═══════════════════════════════════════════════════════
  tick() {
    const dt = SERVER.TICK_MS / 1000;  // 0.25 seconds
    this.elapsedSeconds += dt;
    this.tickCount++;

    // Check 24h max duration
    if (this.elapsedSeconds >= EXPEDITION.MAX_DURATION_HOURS * 3600) {
      this.transitionTo('finished');
      return;
    }

    switch (this.status) {
      case 'march':    this.tickMarch(dt); break;
      case 'combat':   this.tickCombat(dt); break;
      case 'loot_roll': this.tickLootRoll(dt); break;
      case 'campfire': this.tickCampfire(dt); break;
      case 'finished':
      case 'wiped':
        this.stop();
        break;
    }

    // Broadcast to spectators every BROADCAST_RATE ticks
    if (this.tickCount % (SERVER.TICK_RATE / SERVER.BROADCAST_RATE) === 0) {
      this.broadcastState();
    }

    // Periodic state snapshot to DB
    if (this.elapsedSeconds - this.lastSnapshotTime >= EXPEDITION.STATE_SAVE_INTERVAL_SEC) {
      this.lastSnapshotTime = this.elapsedSeconds;
      this.saveState().catch(err => console.error('[Expedition] Snapshot save error:', err.message));
    }
  }

  // ═══════════════════════════════════════════════════════
  // STATE: MARCH (cosmetic: characters advance right)
  // ═══════════════════════════════════════════════════════
  tickMarch(dt) {
    this.phaseTimer -= dt;

    // Slide all characters to the right
    for (const char of this.characters) {
      if (char.alive) {
        char.x += MARCH.SCROLL_SPEED * dt;
      }
    }

    if (this.phaseTimer <= 0) {
      this.transitionTo('combat');
    }
  }

  // ═══════════════════════════════════════════════════════
  // STATE: COMBAT
  // ═══════════════════════════════════════════════════════
  tickCombat(dt) {
    const result = this.combatEngine.tick(this.characters, this.currentMobs, this.currentBoss, dt);

    // Broadcast combat events
    if (result.events.length > 0) {
      this.broadcast({ type: 'events_batch', events: result.events });
    }

    if (result.status === 'victory') {
      this.onCombatVictory();
    } else if (result.status === 'wipe') {
      this.onCombatWipe();
    }
  }

  onCombatVictory() {
    const encounter = this.encounters[this.currentEncounterIndex];
    console.log(`[Expedition] Victory! Encounter ${this.currentEncounterIndex + 1}/${this.encounters.length} (${encounter.type})`);

    if (encounter.type === 'boss') {
      this.bossesKilled++;
      this.broadcast({ type: 'boss_killed', bossName: encounter.bossName, bossIndex: encounter.bossIndex });
    }

    // Roll loot
    const drops = LootEngine.rollDrops(encounter.lootTableId);
    if (drops.length > 0) {
      const alivePlayers = this.getAlivePlayers();
      this.pendingLootResults = LootEngine.distributeLoot(drops, this.srSelections, alivePlayers, false);
      this.transitionTo('loot_roll');
    } else {
      // No loot, go to campfire
      this.currentEncounterIndex++;
      this.transitionTo('campfire');
    }
  }

  onCombatWipe() {
    console.log(`[Expedition] WIPE! All characters are dead.`);

    // Roll loot with wipe penalty
    const encounter = this.encounters[this.currentEncounterIndex];
    const drops = LootEngine.rollDrops(encounter.lootTableId);
    if (drops.length > 0) {
      const allPlayers = this.getAllPlayers();
      this.pendingLootResults = LootEngine.distributeLoot(drops, this.srSelections, allPlayers, true);
      // Still do loot roll even on wipe (some items may be stolen)
      this.transitionTo('loot_roll');
    } else {
      this.transitionTo('wiped');
    }
  }

  // ═══════════════════════════════════════════════════════
  // STATE: LOOT ROLL (animated pause)
  // ═══════════════════════════════════════════════════════
  tickLootRoll(dt) {
    this.phaseTimer -= dt;

    if (this.phaseTimer <= 0) {
      // Save loot to DB
      if (this.pendingLootResults) {
        this.saveLootResults(this.pendingLootResults).catch(err =>
          console.error('[Expedition] Loot save error:', err.message)
        );
        this.lootLog.push(...this.pendingLootResults);
        this.pendingLootResults = null;
      }

      // Check if this was a wipe
      const allDead = this.characters.every(c => !c.alive);
      if (allDead) {
        this.transitionTo('wiped');
      } else {
        this.currentEncounterIndex++;
        if (this.currentEncounterIndex >= this.encounters.length) {
          this.transitionTo('finished');
        } else {
          this.transitionTo('campfire');
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════════
  // STATE: CAMPFIRE (rest, regen, rez)
  // ═══════════════════════════════════════════════════════
  tickCampfire(dt) {
    this.phaseTimer -= dt;

    // One-time campfire effects (on first tick only)
    if (this.phaseTimer >= CAMPFIRE.DURATION_SEC - dt * 1.5) {
      this.applyCampfireEffects();
    }

    if (this.phaseTimer <= 0) {
      // Reset combat flags for next encounter
      for (const char of this.characters) {
        char.diedThisCombat = false;
      }
      this.rezUsedThisCombat.clear();
      this.transitionTo('march');
    }
  }

  applyCampfireEffects() {
    // HP regen for alive characters
    for (const char of this.characters) {
      if (char.alive) {
        const hpRegen = Math.floor(char.maxHp * CAMPFIRE.HP_REGEN_PERCENT / 100);
        char.heal(hpRegen);
        const manaRegen = Math.floor(char.maxMana * CAMPFIRE.MANA_REGEN_PERCENT / 100);
        char.regenMana(manaRegen);
      }
    }

    // Healer resurrections (1 per alive healer)
    const aliveHealers = this.characters.filter(c =>
      c.alive && c.role === 'backline_heal' && !this.rezUsedThisCombat.has(c.id)
    );
    const deadChars = this.characters.filter(c => !c.alive);

    // Sort dead by DPS contribution (most useful first)
    deadChars.sort((a, b) => b.stats.damageDealt - a.stats.damageDealt);

    for (const healer of aliveHealers) {
      if (deadChars.length === 0) break;
      const target = deadChars.shift();
      target.resurrect(CAMPFIRE.REZ_HP_PERCENT);
      this.rezUsedThisCombat.add(healer.id);

      this.broadcast({
        type: 'rez',
        healer: healer.id,
        healerName: healer.name,
        target: target.id,
        targetName: target.name,
      });

      console.log(`[Campfire] ${healer.name} rezzed ${target.name} (${CAMPFIRE.REZ_HP_PERCENT}% HP)`);
    }

    this.broadcast({ type: 'campfire_effects', aliveCount: this.characters.filter(c => c.alive).length });
  }

  // ═══════════════════════════════════════════════════════
  // STATE TRANSITIONS
  // ═══════════════════════════════════════════════════════
  transitionTo(newStatus) {
    const prevStatus = this.status;
    this.status = newStatus;

    console.log(`[Expedition] ${prevStatus} -> ${newStatus}`);

    switch (newStatus) {
      case 'march':
        this.phaseTimer = MARCH.DURATION_SEC;
        const nextEnc = this.encounters[this.currentEncounterIndex];
        this.broadcast({
          type: 'march_start',
          duration: MARCH.DURATION_SEC,
          nextEncounter: nextEnc ? `${nextEnc.type === 'boss' ? 'Boss: ' + nextEnc.bossName : 'Vague de mobs'}` : 'Fin',
        });
        break;

      case 'combat':
        this.setupCombat();
        break;

      case 'loot_roll':
        this.phaseTimer = this.pendingLootResults
          ? Math.min(30, this.pendingLootResults.length * 5)
          : 5;
        if (this.pendingLootResults) {
          this.broadcast({ type: 'loot_roll_start', results: this.pendingLootResults });
        }
        break;

      case 'campfire':
        this.phaseTimer = CAMPFIRE.DURATION_SEC;
        this.broadcast({ type: 'campfire_start', duration: CAMPFIRE.DURATION_SEC });
        break;

      case 'finished':
        this.broadcast({
          type: 'expedition_finished',
          reason: this.currentEncounterIndex >= this.encounters.length ? 'all_cleared' : 'time_expired',
          bossesKilled: this.bossesKilled,
          totalDeaths: this.totalDeaths,
          elapsedTime: Math.floor(this.elapsedSeconds),
        });
        this.finalizeExpedition('finished');
        break;

      case 'wiped':
        this.broadcast({
          type: 'expedition_finished',
          reason: 'wipe',
          bossesKilled: this.bossesKilled,
          totalDeaths: this.totalDeaths,
          elapsedTime: Math.floor(this.elapsedSeconds),
        });
        this.finalizeExpedition('wiped');
        break;
    }
  }

  // ═══════════════════════════════════════════════════════
  // COMBAT SETUP
  // ═══════════════════════════════════════════════════════
  setupCombat() {
    const encounter = this.encounters[this.currentEncounterIndex];
    if (!encounter) {
      this.transitionTo('finished');
      return;
    }

    this.currentMobs = [];
    this.currentBoss = null;

    if (encounter.type === 'mob_wave') {
      // Spawn mobs from composition
      for (const group of encounter.composition) {
        const template = MOB_TEMPLATES[group.template];
        if (!template) continue;
        for (let i = 0; i < group.count; i++) {
          this.currentMobs.push(new Mob(template, encounter.difficulty, group.template));
        }
      }
      this.broadcast({
        type: 'combat_start',
        encounterType: 'mob_wave',
        mobCount: this.currentMobs.length,
        encounterIndex: this.currentEncounterIndex,
      });
    } else if (encounter.type === 'boss') {
      const bossDef = getBossDefinition(encounter.bossIndex);
      if (bossDef) {
        this.currentBoss = new ExpeditionBoss(bossDef);
        this.broadcast({
          type: 'combat_start',
          encounterType: 'boss',
          bossName: bossDef.name,
          bossHp: bossDef.hp,
          encounterIndex: this.currentEncounterIndex,
        });
      }
    }

    // Reset formation for combat (arc around boss if present)
    AIController.assignFormation(this.characters, this.currentBoss);
  }

  // ═══════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════

  getAlivePlayers() {
    const seen = new Set();
    const players = [];
    for (const c of this.characters) {
      if (c.alive && !seen.has(c.username)) {
        seen.add(c.username);
        players.push({ username: c.username });
      }
    }
    return players;
  }

  getAllPlayers() {
    const seen = new Set();
    const players = [];
    for (const c of this.characters) {
      if (!seen.has(c.username)) {
        seen.add(c.username);
        players.push({ username: c.username });
      }
    }
    return players;
  }

  // ═══════════════════════════════════════════════════════
  // BROADCAST (compact state for spectators)
  // ═══════════════════════════════════════════════════════
  broadcastState() {
    this.broadcast({
      type: 'expedition_state',
      status: this.status,
      elapsedTime: Math.floor(this.elapsedSeconds),
      encounterIndex: this.currentEncounterIndex,
      totalEncounters: this.encounters.length,
      bossesKilled: this.bossesKilled,
      phaseTimer: Math.max(0, Math.floor(this.phaseTimer)),
      characters: this.characters.map(c => ({
        id: c.id, name: c.name, hunterId: c.hunterId, hp: c.hp, maxHp: c.maxHp,
        mana: Math.floor(c.mana), maxMana: c.maxMana,
        x: Math.floor(c.x), y: Math.floor(c.y || 0), alive: c.alive, role: c.role,
        element: c.element, username: c.username,
      })),
      mobs: this.currentMobs.filter(m => m.alive).map(m => ({
        id: m.id, name: m.name, hp: m.hp, maxHp: m.maxHp,
        x: Math.floor(m.x), y: Math.floor(m.y || 0), alive: m.alive,
        elite: m.elite, caster: m.caster, templateKey: m.templateKey,
      })),
      boss: this.currentBoss?.alive ? {
        id: this.currentBoss.id, name: this.currentBoss.name,
        index: this.currentBoss.index,
        hp: this.currentBoss.hp, maxHp: this.currentBoss.maxHp,
        x: Math.floor(this.currentBoss.x), y: Math.floor(this.currentBoss.y || 0),
        enraged: this.currentBoss.enraged,
        patternPhase: this.currentBoss.patternPhase,
        currentPattern: this.currentBoss.currentPattern?.name || null,
      } : null,
      aliveCount: this.characters.filter(c => c.alive).length,
      totalCount: this.characters.length,
    });
  }

  // ═══════════════════════════════════════════════════════
  // PERSISTENCE
  // ═══════════════════════════════════════════════════════

  async saveState() {
    if (!this.expeditionId) return;

    const snapshot = {
      status: this.status,
      elapsedSeconds: this.elapsedSeconds,
      currentEncounterIndex: this.currentEncounterIndex,
      bossesKilled: this.bossesKilled,
      totalDeaths: this.totalDeaths,
      phaseTimer: this.phaseTimer,
      encounters: this.encounters,
      characters: this.characters.map(c => c.serialize()),
      srSelections: Array.from(this.srSelections.entries()),
    };

    await db.saveExpeditionSnapshot(this.expeditionId, snapshot);

    // Also save character states
    await db.saveCharacterStates(this.expeditionId, this.characters);

    await db.updateExpeditionStatus(this.expeditionId, this.status, {
      currentWave: this.currentEncounterIndex,
      maxBossReached: this.bossesKilled,
      totalDeaths: this.totalDeaths,
    });
  }

  // Restore from DB snapshot (crash recovery)
  async restore(expeditionId, snapshot) {
    this.expeditionId = expeditionId;
    this.status = snapshot.status;
    this.elapsedSeconds = snapshot.elapsedSeconds;
    this.currentEncounterIndex = snapshot.currentEncounterIndex;
    this.bossesKilled = snapshot.bossesKilled || 0;
    this.totalDeaths = snapshot.totalDeaths || 0;
    this.phaseTimer = snapshot.phaseTimer || 0;
    this.encounters = snapshot.encounters || [];

    // Restore characters
    this.characters = (snapshot.characters || []).map(data => {
      try {
        return ExpeditionCharacter.deserialize(data);
      } catch (e) {
        console.warn(`[Expedition] Failed to restore character:`, e.message);
        return null;
      }
    }).filter(Boolean);

    // Restore SR selections
    this.srSelections = new Map(snapshot.srSelections || []);

    console.log(`[Expedition] Restored! Status: ${this.status}, ${this.characters.length} characters, encounter ${this.currentEncounterIndex}/${this.encounters.length}`);

    // If was in combat, restart that encounter
    if (this.status === 'combat') {
      this.setupCombat();
    }

    // Resume tick loop
    this.startTickLoop();
  }

  async finalizeExpedition(finalStatus) {
    this.stop();
    if (this.expeditionId) {
      await this.saveState();
      await db.updateExpeditionStatus(this.expeditionId, finalStatus, { endedAt: new Date() });
    }
    console.log(`[Expedition] Finalized: ${finalStatus}`);
  }

  async saveLootResults(results) {
    if (!this.expeditionId) return;

    // 1. Save to expedition_loot DB (audit trail)
    for (const r of results) {
      const lootId = await db.saveLootDrop(
        this.expeditionId, this.currentEncounterIndex,
        r.itemId, r.itemName, r.rarity, r.binding,
        r.winnerUsername, r.winnerRoll, r.stolen, r.srWinner
      );
      if (r.rolls.length > 0) {
        await db.saveLootRolls(lootId, r.rolls);
      }
    }

    // 2. Deposit non-stolen loot to player inventories via Vercel API
    const byUser = new Map();
    for (const r of results) {
      if (r.stolen || !r.winnerUsername) continue;
      if (!byUser.has(r.winnerUsername)) byUser.set(r.winnerUsername, []);
      byUser.get(r.winnerUsername).push({
        itemId: r.itemId,
        itemName: r.itemName,
        rarity: r.rarity,
        binding: r.binding,
        type: r.type,
        slot: r.slot || null,
        stats: r.stats || {},
        setId: r.setId || null,
        encounterIndex: this.currentEncounterIndex,
      });
    }

    if (byUser.size > 0) {
      const deposits = Array.from(byUser.entries()).map(([username, items]) => ({ username, items }));
      try {
        const response = await fetch('https://api.builderberu.com/storage/deposit-expedition', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Server-Secret': process.env.GAME_SERVER_SECRET || 'manaya-raid-secret-key',
          },
          body: JSON.stringify({ deposits }),
        });
        const result = await response.json();
        console.log(`[Expedition] Loot deposited:`, result.results);
      } catch (err) {
        console.error('[Expedition] Failed to deposit loot:', err.message);
        // Non-fatal: loot is already saved in expedition_loot DB
      }
    }
  }
}
