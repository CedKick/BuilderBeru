import { SERVER, EXPEDITION, CAMPFIRE, MARCH, REST_CAMP, SCALING } from '../config.js';
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
import { getItemById } from '../data/expeditionItems.js';
import { EXPEDITION_WEAPONS } from '../data/expeditionWeapons.js';

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

    // SR selections: Map<username, itemId[]> — each player has up to 5 SR picks (can repeat for extra rolls)
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
    this.pendingRezQueue = [];
    this.rezTimer = 999;

    // Rest at camp (anti-wipe reserve)
    this.restingCharacters = new Set();  // char IDs sitting out next fight

    // Stats
    this.bossesKilled = 0;
    this.totalDeaths = 0;

    // Essences collected per player: Map<username, { guerre, arcanique, gardienne }>
    this.playerEssences = new Map();

    // Currencies collected per player: Map<username, { alkahest, marteau_rouge, contribution }>
    this.playerCurrencies = new Map();

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
    this.playerEssences = new Map();
    this.playerCurrencies = new Map();
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
          // SC weapon passive from client (sulfuras_fury, katana_v_chaos, etc.)
          if (data.weaponPassive) char.scWeaponPassive = data.weaponPassive;
          this.characters.push(char);
        } catch (e) {
          console.warn(`[Expedition] Failed to create character ${hunterId} for ${entry.username}:`, e.message);
        }
      }

      // Store SR selections (array of up to 5 picks, can repeat for bonus rolls)
      const srItems = typeof entry.sr_items === 'string' ? JSON.parse(entry.sr_items) : (entry.sr_items || []);
      if (Array.isArray(srItems) && srItems.length > 0) {
        this.srSelections.set(entry.username, srItems);
      }
    }

    if (this.characters.length === 0) {
      console.error('[Expedition] No valid characters, cannot start');
      return;
    }

    // Load expedition gear from player inventories and apply to characters
    await this.loadPlayerGear(entries);

    // Generate encounter sequence (15 bosses for V2)
    this.encounters = generateEncounterSequence(EXPEDITION.TOTAL_BOSSES);
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
    // Exclude resting characters from combat
    const combatChars = this.characters.filter(c => !this.restingCharacters.has(c.id));
    const result = this.combatEngine.tick(combatChars, this.currentMobs, this.currentBoss, dt);

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

    const isBoss = encounter.type === 'boss';
    if (isBoss) {
      this.bossesKilled++;
      this.broadcast({ type: 'boss_killed', bossName: encounter.bossName, bossIndex: encounter.bossIndex });
    }

    // Roll essence drops (from killed mobs + boss)
    const mobKills = this.currentMobs.filter(m => !m.alive).map(m => ({
      templateKey: m.templateKey,
      elite: m.elite || false,
    }));
    const essences = LootEngine.rollEssenceDrops(mobKills, isBoss);
    const totalEssences = essences.guerre + essences.arcanique + essences.gardienne;

    // Distribute essences equally among alive players
    if (totalEssences > 0) {
      const alivePlayers = this.getAlivePlayers();
      if (alivePlayers.length > 0) {
        for (const player of alivePlayers) {
          if (!this.playerEssences.has(player.username)) {
            this.playerEssences.set(player.username, { guerre: 0, arcanique: 0, gardienne: 0 });
          }
          const pEss = this.playerEssences.get(player.username);
          // Each player gets the full essence drop (not split — rewarding group content)
          pEss.guerre += essences.guerre;
          pEss.arcanique += essences.arcanique;
          pEss.gardienne += essences.gardienne;
        }
        this.broadcast({
          type: 'essence_drop',
          essences,
          perPlayer: true,
          playerCount: alivePlayers.length,
        });
      }
    }

    // Roll shared trash mob currencies (per mob killed, everyone gets the same)
    if (!isBoss) {
      const mobKillCount = this.currentMobs.filter(m => !m.alive).length;
      const tierMatch = (encounter.lootTableId || '').match(/tier(\d)/);
      const tier = tierMatch ? parseInt(tierMatch[1]) : 1;
      const currencies = LootEngine.rollTrashDrops(mobKillCount, tier);
      const totalCurrencies = currencies.alkahest + currencies.marteau_rouge + currencies.contribution;

      if (totalCurrencies > 0) {
        const alivePlayers = this.getAlivePlayers();
        for (const player of alivePlayers) {
          if (!this.playerCurrencies.has(player.username)) {
            this.playerCurrencies.set(player.username, { alkahest: 0, marteau_rouge: 0, contribution: 0 });
          }
          const pc = this.playerCurrencies.get(player.username);
          pc.alkahest += currencies.alkahest;
          pc.marteau_rouge += currencies.marteau_rouge;
          pc.contribution += currencies.contribution;
        }

        this.broadcast({
          type: 'currency_drop',
          currencies,
          mobsKilled: mobKillCount,
          tier,
        });

        // Deposit currencies immediately to all alive players
        this.depositCurrencies(currencies, alivePlayers).catch(err =>
          console.error('[Expedition] Currency deposit error:', err.message)
        );
      }
    }

    // Roll loot — use generateBossLoot for boss encounters, rollDrops for mob waves
    // Extra rolls scale with player count (>30 hunters = more loot)
    const extraRolls = this.getExtraLootRolls();
    const drops = isBoss
      ? LootEngine.generateBossLoot(encounter.bossIndex + 1, extraRolls)  // bossIndex is 0-based, generateBossLoot expects 1-15
      : LootEngine.rollDrops(encounter.lootTableId);
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
    // Check if resting characters can save the raid
    const restingAlive = this.characters.filter(c =>
      this.restingCharacters.has(c.id) && c.alive
    );
    const restingHasHealer = restingAlive.some(c => c.role === 'backline_heal');

    if (restingAlive.length > 0 && restingHasHealer) {
      console.log(`[Expedition] WIPE RECOVERY! ${restingAlive.length} resting characters (with healer) can save the raid!`);

      this.broadcast({
        type: 'wipe_recovery',
        restingCount: restingAlive.length,
        message: 'Les reserves arrivent! Les guerriers au repos se precipitent pour sauver le raid!',
      });

      // Apply rest bonuses to resting characters
      for (const char of restingAlive) {
        char.maxHp = Math.floor(char.maxHp * (1 + REST_CAMP.REST_BONUS_HP));
        char.hp = char.maxHp; // Full HP
        char.stats.atk = Math.floor(char.stats.atk * (1 + REST_CAMP.REST_BONUS_ATK));
        char.stats.def = Math.floor(char.stats.def * (1 + REST_CAMP.REST_BONUS_DEF));
        char.mana = char.maxMana; // Full mana
      }

      // Rez all dead combatants at reduced HP
      for (const char of this.characters) {
        if (!char.alive && !this.restingCharacters.has(char.id)) {
          char.resurrect(REST_CAMP.WIPE_RECOVERY_REZ_HP * 100);
          this.broadcast({
            type: 'rez',
            healer: restingAlive[0].id,
            healerName: 'Les Reserves',
            target: char.id,
            targetName: char.name,
          });
        }
      }

      // Clear resting — everyone is back in action
      this.restingCharacters.clear();

      // Go to campfire to recover before retrying
      this.transitionTo('campfire');
      return;
    }

    console.log(`[Expedition] WIPE! All characters are dead.`);

    // Roll loot with wipe penalty
    const encounter = this.encounters[this.currentEncounterIndex];
    const isBossWipe = encounter.type === 'boss';
    const wipeExtraRolls = this.getExtraLootRolls();
    const drops = isBossWipe
      ? LootEngine.generateBossLoot(encounter.bossIndex + 1, wipeExtraRolls)
      : LootEngine.rollDrops(encounter.lootTableId);
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

      // Check if this was a wipe (excluding resting chars)
      const allCombatantsDead = this.characters.every(c => !c.alive || this.restingCharacters.has(c.id));
      if (allCombatantsDead) {
        this.onCombatWipe(); // Will check resting chars for recovery
        return;
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

    // Process staggered rez queue (one rez every ~7s, first at ~5s)
    if (this.pendingRezQueue && this.pendingRezQueue.length > 0) {
      this.rezTimer -= dt;
      if (this.rezTimer <= 0) {
        const rez = this.pendingRezQueue.shift();
        rez.target.resurrect(CAMPFIRE.REZ_HP_PERCENT);
        this.rezUsedThisCombat.add(rez.healer.id);

        this.broadcast({
          type: 'rez',
          healer: rez.healer.id,
          healerName: rez.healer.name,
          target: rez.target.id,
          targetName: rez.target.name,
        });

        console.log(`[Campfire] ${rez.healer.name} rezzed ${rez.target.name} (${CAMPFIRE.REZ_HP_PERCENT}% HP)`);

        // Next rez in 7 seconds
        this.rezTimer = 7;
      }
    }

    if (this.phaseTimer <= 0) {
      // Force-rez any remaining in queue (safety net)
      if (this.pendingRezQueue) {
        for (const rez of this.pendingRezQueue) {
          rez.target.resurrect(CAMPFIRE.REZ_HP_PERCENT);
          this.broadcast({
            type: 'rez',
            healer: rez.healer.id,
            healerName: rez.healer.name,
            target: rez.target.id,
            targetName: rez.target.name,
          });
        }
        this.pendingRezQueue = [];
      }

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

    // Queue healer resurrections (staggered over campfire duration)
    const aliveHealers = this.characters.filter(c =>
      c.alive && c.role === 'backline_heal' && !this.rezUsedThisCombat.has(c.id)
    );
    const deadChars = this.characters.filter(c => !c.alive);

    // Sort dead by DPS contribution (most useful first)
    deadChars.sort((a, b) => b.stats.damageDealt - a.stats.damageDealt);

    this.pendingRezQueue = [];
    for (const healer of aliveHealers) {
      if (deadChars.length === 0) break;
      const target = deadChars.shift();
      this.pendingRezQueue.push({ healer, target });
    }

    // First rez after 5 seconds
    this.rezTimer = this.pendingRezQueue.length > 0 ? 5 : 999;

    // ── Rest-at-camp decisions ──
    // Some characters may decide to sit out the next fight
    this.restingCharacters.clear();
    const aliveChars = this.characters.filter(c => c.alive);
    const maxResting = Math.floor(aliveChars.length * REST_CAMP.MAX_RESTING_RATIO);
    // Need at least 3 chars in combat
    const minCombatants = Math.max(3, aliveChars.length - maxResting);

    for (const char of aliveChars) {
      if (this.restingCharacters.size >= maxResting) break;
      if (aliveChars.length - this.restingCharacters.size <= minCombatants) break;

      let restChance = REST_CAMP.BASE_REST_CHANCE;
      if (char.hp / char.maxHp < 0.3) restChance = REST_CAMP.LOW_HP_REST_CHANCE;
      if (char.diedThisCombat) restChance = REST_CAMP.DIED_RECENTLY_REST_CHANCE;

      if (Math.random() < restChance) {
        this.restingCharacters.add(char.id);
        console.log(`[Campfire] ${char.name} (${char.username}) decides to rest at camp`);

        this.broadcast({
          type: 'rest_decision',
          charId: char.id,
          charName: char.name,
          username: char.username,
          reason: char.diedThisCombat ? 'died' : (char.hp / char.maxHp < 0.3 ? 'low_hp' : 'cautious'),
        });
      }
    }

    // Broadcast dead count so spectator knows who to show as ghosts
    const deadCount = this.characters.filter(c => !c.alive).length;
    this.broadcast({
      type: 'campfire_effects',
      aliveCount: aliveChars.length,
      deadCount,
      pendingRez: this.pendingRezQueue.length,
      restingCount: this.restingCharacters.size,
    });
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
  // DYNAMIC DIFFICULTY SCALING (>30 hunters)
  // ═══════════════════════════════════════════════════════
  getPlayerScale() {
    const count = this.characters.length;
    if (count <= SCALING.BASE_HUNTERS) return 1.0;
    return count / SCALING.BASE_HUNTERS;  // 60 hunters = 2.0, 100 = 3.33
  }

  getScaledBossDef(baseDef) {
    const scale = this.getPlayerScale();
    if (scale <= 1.0) return baseDef;
    const excess = scale - 1;  // 0 at 30, 1.0 at 60, 2.33 at 100
    return {
      ...baseDef,
      hp:  Math.floor(baseDef.hp  * (1 + excess * SCALING.HP_FACTOR)),
      atk: Math.floor(baseDef.atk * (1 + excess * SCALING.ATK_FACTOR)),
      def: Math.floor(baseDef.def * (1 + excess * SCALING.DEF_FACTOR)),
    };
  }

  getMobDifficultyScale() {
    const scale = this.getPlayerScale();
    if (scale <= 1.0) return 1.0;
    return 1 + (scale - 1) * SCALING.MOB_HP_FACTOR;  // 60h = 1.6, 100h = 2.4
  }

  getExtraLootRolls() {
    const count = this.characters.length;
    if (count <= SCALING.BASE_HUNTERS) return 0;
    return Math.floor((count - SCALING.BASE_HUNTERS) / SCALING.LOOT_EXTRA_ROLLS_PER);
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

    // Dynamic difficulty scaling based on hunter count
    const mobScale = this.getMobDifficultyScale();
    const playerScale = this.getPlayerScale();

    if (encounter.type === 'mob_wave') {
      // Spawn mobs from composition (scaled difficulty if >30 hunters)
      for (const group of encounter.composition) {
        const template = MOB_TEMPLATES[group.template];
        if (!template) continue;
        for (let i = 0; i < group.count; i++) {
          this.currentMobs.push(new Mob(template, encounter.difficulty * mobScale, group.template));
        }
      }
      this.broadcast({
        type: 'combat_start',
        encounterType: 'mob_wave',
        mobCount: this.currentMobs.length,
        encounterIndex: this.currentEncounterIndex,
      });
    } else if (encounter.type === 'boss') {
      const baseDef = getBossDefinition(encounter.bossIndex);
      if (baseDef) {
        const scaledDef = this.getScaledBossDef(baseDef);
        this.currentBoss = new ExpeditionBoss(scaledDef);
        if (playerScale > 1) {
          console.log(`[Expedition] Boss ${baseDef.name} scaled ×${playerScale.toFixed(2)}: HP ${baseDef.hp} → ${scaledDef.hp}, ATK ${baseDef.atk} → ${scaledDef.atk}`);
        }
        this.broadcast({
          type: 'combat_start',
          encounterType: 'boss',
          bossName: scaledDef.name,
          bossHp: scaledDef.hp,
          encounterIndex: this.currentEncounterIndex,
        });
      }
    }

    // Initialize passive engine for this combat (set bonuses, weapon passives)
    const combatCharacters = this.characters.filter(c => c.alive && !this.restingCharacters.has(c.id));
    this.combatEngine.initCombat(combatCharacters);

    // Reset formation for combat (arc around boss if present)
    AIController.assignFormation(combatCharacters, this.currentBoss);

    // Move resting characters offscreen (far left, safe)
    for (const char of this.characters) {
      if (this.restingCharacters.has(char.id)) {
        char.x = -200;
        char.y = 0;
      }
    }
  }

  // ═══════════════════════════════════════════════════════
  // GEAR LOADING — Fetch inventory from DB, auto-equip, apply stats
  // ═══════════════════════════════════════════════════════

  async loadPlayerGear(entries) {
    const seenPlayers = new Set();
    for (const entry of entries) {
      if (seenPlayers.has(entry.username)) continue;
      seenPlayers.add(entry.username);

      try {
        const inventory = await db.getPlayerInventory(entry.username);
        const gear = this.computeGear(inventory);

        // Apply gear to all characters of this player
        for (const char of this.characters) {
          if (char.username !== entry.username) continue;
          char.expeditionGear = gear.expeditionGear;
          char.weaponEffects = gear.weaponEffects;

          // Apply flat stats from equipped items
          if (gear.bonusStats.atk_flat) char.atk += gear.bonusStats.atk_flat;
          if (gear.bonusStats.def_flat) char.def += gear.bonusStats.def_flat;
          if (gear.bonusStats.hp_flat) {
            char.maxHp += gear.bonusStats.hp_flat;
            char.hp = char.maxHp;
          }
          if (gear.bonusStats.spd_flat) char.spd += gear.bonusStats.spd_flat;
          if (gear.bonusStats.crit_rate) char.crit += gear.bonusStats.crit_rate;
          if (gear.bonusStats.res_flat) char.res += gear.bonusStats.res_flat;

          // Apply passive stat modifiers from weapon effects
          for (const eff of gear.weaponEffects) {
            if (eff.type === 'lifesteal') char._lifesteal = (char._lifesteal || 0) + eff.value;
            if (eff.type === 'heal_bonus') char._healBonus = (char._healBonus || 0) + eff.value;
            if (eff.type === 'mana_regen') char._manaRegenBonus = (char._manaRegenBonus || 0) + eff.value;
          }
        }

        const setCount = Object.keys(gear.expeditionGear.sets).length;
        if (setCount > 0 || gear.expeditionGear.weaponId) {
          console.log(`[Expedition] ${entry.username} gear: ${setCount} sets, weapon=${gear.expeditionGear.weaponId || 'none'}, +${gear.bonusStats.atk_flat || 0} ATK`);
        }
      } catch (err) {
        console.warn(`[Expedition] Failed to load gear for ${entry.username}:`, err.message);
      }
    }
  }

  computeGear(inventory) {
    if (!inventory || !inventory.length) {
      return { expeditionGear: { sets: {}, weaponId: null }, bonusStats: {}, weaponEffects: [] };
    }

    // Count set pieces
    const sets = {};
    for (const item of inventory) {
      if (item.setId) {
        sets[item.setId] = (sets[item.setId] || 0) + 1;
      }
    }

    // Find mythique weapon (from expeditionWeapons.js)
    let mythiqueWeaponId = null;
    for (const item of inventory) {
      // Check if item has explicit weaponId (mythique)
      if (item.weaponId && EXPEDITION_WEAPONS[item.weaponId]) {
        mythiqueWeaponId = item.weaponId;
        break;
      }
      // Check by itemId pattern: exp_weapon_<weaponId>
      if (item.type === 'weapon' && item.itemId?.startsWith('exp_weapon_')) {
        const wpnId = item.itemId.replace('exp_weapon_', '');
        if (EXPEDITION_WEAPONS[wpnId]) {
          mythiqueWeaponId = wpnId;
          break;
        }
      }
    }

    // Auto-equip best items per slot (by rarity then stat sum)
    const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4, mythique: 5 };
    const slots = ['helm', 'chest', 'gloves', 'boots', 'weapon'];
    const equipped = {};

    for (const slot of slots) {
      const candidates = inventory.filter(i => i.slot === slot && i.stats);
      candidates.sort((a, b) => {
        const rd = (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
        if (rd !== 0) return rd;
        const sumStats = (s) => Object.values(s || {}).reduce((acc, v) => acc + v, 0);
        return sumStats(b.stats) - sumStats(a.stats);
      });
      if (candidates.length > 0) equipped[slot] = candidates[0];
    }

    // Sum flat stats from all equipped items
    const bonusStats = {};
    for (const item of Object.values(equipped)) {
      if (item.stats) {
        for (const [stat, val] of Object.entries(item.stats)) {
          bonusStats[stat] = (bonusStats[stat] || 0) + val;
        }
      }
    }

    // Get weapon effects from equipped regular weapon
    let weaponEffects = [];
    if (equipped.weapon) {
      const itemDef = getItemById(equipped.weapon.itemId);
      if (itemDef?.effects) weaponEffects = itemDef.effects;
    }

    return {
      expeditionGear: { sets, weaponId: mythiqueWeaponId },
      bonusStats,
      weaponEffects,
    };
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
      maxDuration: EXPEDITION.MAX_DURATION_HOURS * 3600,
      encounterIndex: this.currentEncounterIndex,
      totalEncounters: this.encounters.length,
      bossesKilled: this.bossesKilled,
      phaseTimer: Math.max(0, Math.floor(this.phaseTimer)),
      characters: this.characters.map(c => ({
        id: c.id, name: c.name, hunterId: c.hunterId, hp: c.hp, maxHp: c.maxHp,
        mana: Math.floor(c.mana), maxMana: c.maxMana,
        x: Math.floor(c.x), y: Math.floor(c.y || 0), alive: c.alive, role: c.role,
        element: c.element, username: c.username,
        resting: this.restingCharacters.has(c.id),
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
      playerEssences: Array.from(this.playerEssences.entries()),
      playerCurrencies: Array.from(this.playerCurrencies.entries()),
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

    // Restore SR selections, essences, and currencies
    this.srSelections = new Map(snapshot.srSelections || []);
    this.playerEssences = new Map(snapshot.playerEssences || []);
    this.playerCurrencies = new Map(snapshot.playerCurrencies || []);

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

      // Send loot summary mails to all players
      try {
        await this.sendLootMails(finalStatus);
      } catch (err) {
        console.error('[Expedition] Failed to send loot mails:', err.message);
      }
    }
    console.log(`[Expedition] Finalized: ${finalStatus}`);
  }

  async sendLootMails(finalStatus) {
    // Get all loot grouped by player
    const lootByPlayer = await db.getExpeditionLootByPlayer(this.expeditionId);

    // Get all unique player usernames (from characters)
    const allPlayers = [...new Set(this.characters.map(c => c.username))];

    for (const username of allPlayers) {
      const items = lootByPlayer[username] || [];
      const currencies = this.playerCurrencies.get(username) || { alkahest: 0, marteau_rouge: 0, contribution: 0 };
      const essences = this.playerEssences.get(username) || { guerre: 0, arcanique: 0, gardienne: 0 };

      const mailId = await db.sendExpeditionMail(
        username, this.expeditionId, finalStatus,
        items, currencies, essences, this.bossesKilled
      );
      console.log(`[Expedition] Mail sent to ${username}: id=${mailId} (${items.length} items)`);
    }

    console.log(`[Expedition] Loot mails sent to ${allPlayers.length} players`);
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
        weaponId: r.weaponId || null,
        uniqueId: r.uniqueId || null,
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

        // Broadcast deposit results (replacements, rejections) to spectators
        for (const r of (result.results || [])) {
          if (r.itemsReplaced > 0 || r.itemsRejected > 0) {
            const details = r.details || [];
            for (const d of details) {
              if (d.action === 'replaced') {
                this.broadcast({
                  type: 'inventory_replace',
                  username: r.username,
                  newItem: d.itemId,
                  replacedItem: d.replacedItem,
                  replacedRarity: d.replacedRarity,
                });
              } else if (d.action === 'rejected') {
                this.broadcast({
                  type: 'inventory_full',
                  username: r.username,
                  itemId: d.itemId,
                  reason: d.reason,
                });
              }
            }
          }
        }
      } catch (err) {
        console.error('[Expedition] Failed to deposit loot:', err.message);
        // Non-fatal: loot is already saved in expedition_loot DB
      }
    }
  }

  // Deposit shared currencies to all alive players via Vercel API
  async depositCurrencies(currencies, alivePlayers) {
    const usernames = alivePlayers.map(p => p.username);
    if (usernames.length === 0) return;

    try {
      const response = await fetch('https://api.builderberu.com/storage/deposit-expedition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Server-Secret': process.env.GAME_SERVER_SECRET || 'manaya-raid-secret-key',
        },
        body: JSON.stringify({
          currencyDeposits: usernames.map(username => ({ username, currencies })),
        }),
      });
      const result = await response.json();
      console.log(`[Expedition] Currencies deposited to ${usernames.length} players:`, currencies);
    } catch (err) {
      console.error('[Expedition] Failed to deposit currencies:', err.message);
    }
  }
}
