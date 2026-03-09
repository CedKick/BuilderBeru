// ─── ExpeditionEngine (v2) ────────────────────────────────
// Main orchestrator for the expedition lifecycle.
// Phases: idle -> registration -> march -> combat -> campfire -> march -> ... -> finished/wiped
//
// Uses real-time 2D Manaya combat engine (60 TPS).
// 5 players x 6 hunters = 30 entities on the field.
// Map scrolls right between encounters, camera locks during combat.

import { EXPEDITION, CAMPFIRE, MARCH } from '../config.js';
import { CombatInstance } from './CombatInstance.js';
import { MobWaveCombat } from './MobWaveCombat.js';
import { HunterSwitch } from './HunterSwitch.js';
import { Hunter } from '../entities/Hunter.js';
import { HUNTERS } from '../data/hunterData.js';
import { getBossDefinition } from '../data/bossDefinitions.js';
import { LootEngine } from './LootEngine.js';

export class ExpeditionEngine {
  constructor() {
    // Expedition state
    this.state = 'idle'; // idle | registration | march | mob_wave | combat | campfire | loot | finished | wiped
    this.expeditionId = null;

    // Players & hunters
    this.players = new Map();     // playerId -> { username, hunterEntries }
    this.hunters = [];            // All 30 Hunter entities on the field
    this.hunterSwitch = new HunterSwitch();

    // Combat
    this.currentCombat = null;    // Active CombatInstance
    this.currentMobWave = null;   // Active MobWaveCombat
    this.currentBossIndex = 0;    // 0-4 (5 bosses)
    this.bossResults = [];        // Results per boss fight
    this._mobWaveDone = false;    // Whether mob wave before current boss is done

    // March/campfire timers
    this._phaseTimer = 0;
    this._phaseInterval = null;

    // Scroll position (for map progression)
    this.scrollX = 0;

    // Event feed (broadcast to spectators)
    this.feedLog = [];        // [{ text, type, timestamp }] — last 60 entries
    this.lootResults = [];    // Loot from last boss kill (for display)
    this._banterTimer = 0;    // Timer for periodic banter during march/campfire

    // Callbacks
    this.onStateChange = null;
    this.onBroadcast = null;
  }

  // --- Registration ---

  registerPlayer(playerId, username, hunterEntries) {
    if (this.state !== 'idle' && this.state !== 'registration') return { error: 'Not in registration phase' };
    if (this.players.size >= EXPEDITION.MAX_PLAYERS) return { error: 'Expedition full' };
    if (hunterEntries.length !== EXPEDITION.HUNTERS_PER_PLAYER) return { error: `Need exactly ${EXPEDITION.HUNTERS_PER_PLAYER} hunters` };

    this.players.set(playerId, {
      username,
      hunterEntries,
    });

    if (this.state === 'idle') {
      this.state = 'registration';
      this._emitStateChange();
    }

    console.log(`[Expedition] ${username} registered with ${hunterEntries.length} hunters`);
    return { ok: true, playerCount: this.players.size };
  }

  // --- Start Expedition ---

  startExpedition() {
    if (this.state !== 'registration') return { error: 'Not in registration phase' };
    if (this.players.size < EXPEDITION.MIN_PLAYERS_TO_START) return { error: 'Not enough players' };

    console.log(`\n[Expedition] ================================================`);
    console.log(`[Expedition] Starting with ${this.players.size} players`);

    // Create Hunter entities from inscription data
    this.hunters = [];
    for (const [playerId, data] of this.players) {
      const hunterIds = [];
      for (let i = 0; i < data.hunterEntries.length; i++) {
        const entry = data.hunterEntries[i];
        const hunterDef = HUNTERS[entry.hunterId];
        const id = `${data.username}_${entry.hunterId}`;

        const hunter = new Hunter({
          id,
          username: data.username,
          hunterId: entry.hunterId,
          hunterName: hunterDef?.name || entry.hunterId,
          inscriptionStats: entry.fullStats,
          ownerPlayerId: playerId,
          slotIndex: i,
          equippedSets: entry.equippedSets || {},
          weaponPassive: entry.weaponPassive || null,
          weaponId: entry.weaponId || null,
          forgePassives: entry.forgePassives || null,
        });

        this.hunters.push(hunter);
        hunterIds.push(id);
      }

      // Register hunter switch slots
      this.hunterSwitch.registerPlayer(playerId, hunterIds);
    }

    console.log(`[Expedition] ${this.hunters.length} hunters created`);
    this._logHunterSummary();

    // Start with march to first boss
    this.currentBossIndex = 0;
    this._startMarch();
    return { ok: true, hunterCount: this.hunters.length };
  }

  // --- Start Bot Expedition (testing) ---

  startBotExpedition(playerData) {
    // playerData: [{ username, hunters: [{ hunterId, fullStats, stars, level, weaponPassive }] }]
    for (let i = 0; i < playerData.length; i++) {
      const p = playerData[i];
      const playerId = `bot_${p.username}`;
      this.registerPlayer(playerId, p.username, p.hunters.map((h) => ({
        hunterId: h.hunterId,
        fullStats: h.fullStats,
        stars: h.stars || 0,
        level: h.level || 140,
        weaponPassive: h.weaponPassive || null,
        weaponId: h.weaponId || null,
        equippedSets: h.equippedSets || {},
        forgePassives: h.forgePassives || null,
      })));
    }
    return this.startExpedition();
  }

  // --- Phase: March ---

  _startMarch() {
    this.state = 'march';
    this._phaseTimer = 0;
    this._emitStateChange();

    const nextAction = this._mobWaveDone ? 'boss' : 'mob_wave';
    console.log(`[Expedition] --- MARCHING (next: ${nextAction}) ---`);
    this._addFeed('L\'equipe se met en marche...', 'phase');
    this._banterTimer = 0;

    this._phaseInterval = setInterval(() => {
      this._phaseTimer += 0.1;
      this.scrollX += MARCH.SCROLL_SPEED * 0.1;
      this._tickBanter(0.1);

      if (this._phaseTimer >= MARCH.DURATION_SEC) {
        clearInterval(this._phaseInterval);
        this._phaseInterval = null;

        if (!this._mobWaveDone) {
          this._startMobWave();
        } else {
          this._startCombat();
        }
      }
    }, 100);
  }

  // --- Phase: Mob Wave ---

  _startMobWave() {
    this.state = 'mob_wave';
    this._emitStateChange();

    const aliveHunters = this.hunters.filter(h => h.alive);
    console.log(`[Expedition] --- MOB WAVE (section ${this.currentBossIndex}) ---`);
    this._addFeed('Vague de monstres ! Preparez-vous au combat !', 'combat');

    // Reset hunter state for wave encounter
    for (const h of aliveHunters) {
      h.resetForEncounter();
    }

    this.currentMobWave = new MobWaveCombat(
      aliveHunters,
      this.currentBossIndex,
      aliveHunters.length,
      (result) => this._onMobWaveEnd(result)
    );

    this.currentMobWave.start();
  }

  _onMobWaveEnd(result) {
    console.log(`[Expedition] Mob wave ${result.victory ? 'CLEARED' : 'WIPE'} (${result.time?.toFixed(1)}s)`);
    this._addFeed(result.victory ? 'Vague de mobs eliminee !' : 'L\'equipe a succombe face aux monstres...', result.victory ? 'victory' : 'wipe');

    // Sync hunter state from wave combat
    if (this.currentMobWave) {
      const waveHunters = this.currentMobWave.state.hunters;
      for (const wh of waveHunters) {
        const mainH = this.hunters.find(h => h.id === wh.id);
        if (!mainH) continue;
        mainH.hp = wh.hp;
        mainH.mana = wh.mana;
        mainH.alive = wh.alive;
      }
    }

    this.currentMobWave = null;
    this._mobWaveDone = true;

    if (!result.victory) {
      // Wipe on mob wave = expedition over
      this._finishExpedition(false);
      return;
    }

    // Short march to the boss
    this._startMarch();
  }

  // --- Phase: Combat ---

  _startCombat() {
    this.state = 'combat';
    this._emitStateChange();

    const aliveHunters = this.hunters.filter(h => h.alive);
    const bossDef = getBossDefinition(this.currentBossIndex);
    console.log(`[Expedition] --- COMBAT: Boss ${this.currentBossIndex + 1}/${EXPEDITION.TOTAL_BOSSES} ---`);
    console.log(`[Expedition] Active hunters: ${aliveHunters.length}`);
    this._addFeed(`BOSS : ${bossDef?.name || 'Boss ' + (this.currentBossIndex + 1)} — ${aliveHunters.length} chasseurs en vie !`, 'combat');

    // Reset hunter state for new encounter
    for (const h of aliveHunters) {
      h.resetForEncounter();
    }

    // Create combat instance
    this.currentCombat = new CombatInstance(
      aliveHunters,
      this.currentBossIndex,
      aliveHunters.length,
      (result) => this._onCombatEnd(result)
    );

    this.currentCombat.start();
  }

  _onCombatEnd(result) {
    this.bossResults.push(result);
    const bossDef = getBossDefinition(this.currentBossIndex);
    const bossName = bossDef?.name || `Boss ${this.currentBossIndex + 1}`;

    if (result.victory) {
      console.log(`[Expedition] Boss ${this.currentBossIndex + 1}/${EXPEDITION.TOTAL_BOSSES} DEFEATED!`);
      this._addFeed(`VICTOIRE ! ${bossName} vaincu en ${result.time?.toFixed(0)}s !`, 'victory');

      // Sync hunter HP/mana/stats back from combat
      this._syncHuntersFromCombat();

      // Roll loot
      this._rollLoot(this.currentBossIndex, false);

      this.currentBossIndex++;

      if (this.currentBossIndex >= EXPEDITION.TOTAL_BOSSES) {
        this._finishExpedition(true);
      } else {
        this._startCampfire();
      }
    } else {
      console.log(`[Expedition] WIPE at Boss ${this.currentBossIndex + 1}/${EXPEDITION.TOTAL_BOSSES}`);
      this._addFeed(`DEFAITE ! L'equipe est tombee face a ${bossName}...`, 'wipe');

      // Roll wipe loot (partial, with steal chance)
      this._rollLoot(this.currentBossIndex, true);

      this._finishExpedition(false);
    }

    this.currentCombat = null;
  }

  // --- Phase: Campfire ---

  _startCampfire() {
    this.state = 'campfire';
    this._phaseTimer = 0;
    this._mobWaveDone = false; // Reset for next boss section
    this._emitStateChange();

    console.log(`[Expedition] --- CAMPFIRE (${CAMPFIRE.DURATION_SEC}s) ---`);
    this._addFeed('Feu de camp ! L\'equipe se repose et se soigne.', 'phase');
    this._banterTimer = 0;

    // Heal & restore
    for (const h of this.hunters) {
      if (!h.alive) {
        h.resurrect(CAMPFIRE.REZ_HP_PERCENT / 100);
        console.log(`  [Camp] ${h.hunterName} resurrected at ${CAMPFIRE.REZ_HP_PERCENT}% HP`);
      } else {
        const hpRestore = Math.floor(h.maxHp * CAMPFIRE.HP_REGEN_PERCENT / 100);
        h.heal(hpRestore);
        h.mana = Math.min(h.maxMana, h.mana + Math.floor(h.maxMana * CAMPFIRE.MANA_REGEN_PERCENT / 100));
      }
    }

    const alive = this.hunters.filter(h => h.alive).length;
    console.log(`  [Camp] ${alive}/${this.hunters.length} hunters alive`);

    this._phaseInterval = setInterval(() => {
      this._phaseTimer += 0.5;
      this._tickBanter(0.5);
      if (this._phaseTimer >= CAMPFIRE.DURATION_SEC) {
        clearInterval(this._phaseInterval);
        this._phaseInterval = null;
        this._startMarch();
      }
    }, 500);
  }

  // --- Finish ---

  _finishExpedition(victory) {
    this.state = victory ? 'finished' : 'wiped';
    this._emitStateChange();

    console.log(`\n[Expedition] ================================================`);
    console.log(`[Expedition] ${victory ? 'EXPEDITION COMPLETE!' : 'EXPEDITION FAILED!'}`);
    console.log(`[Expedition] Bosses cleared: ${this.bossResults.filter(r => r.victory).length}/${EXPEDITION.TOTAL_BOSSES}`);

    for (const r of this.bossResults) {
      const bossDef = getBossDefinition(r.bossIndex);
      console.log(`  Boss ${r.bossIndex + 1}: ${bossDef?.name || '?'} -- ${r.victory ? 'WIN' : 'WIPE'} (${r.time?.toFixed(1)}s)`);
    }

    // Aggregate hunter stats
    const hunterTotals = {};
    for (const r of this.bossResults) {
      if (!r.stats) continue;
      for (const s of r.stats) {
        if (!hunterTotals[s.id]) {
          hunterTotals[s.id] = { ...s, totalDamage: 0, totalHealing: 0, totalDeaths: 0 };
        }
        hunterTotals[s.id].totalDamage += s.damageDealt;
        hunterTotals[s.id].totalHealing += s.healingDone;
        hunterTotals[s.id].totalDeaths += s.deaths;
      }
    }

    const sorted = Object.values(hunterTotals).sort((a, b) => b.totalDamage - a.totalDamage);
    console.log(`\n[Expedition] Top Hunters:`);
    for (const s of sorted.slice(0, 15)) {
      console.log(`  ${s.class.padEnd(10)} ${(s.hunterName || '').padEnd(18)} (${(s.username || '').padEnd(8)}) | DMG: ${(s.totalDamage / 1e6).toFixed(1)}M | Heal: ${(s.totalHealing / 1e6).toFixed(1)}M | Deaths: ${s.totalDeaths}`);
    }
  }

  // --- Sync hunters from combat back to main state ---

  _syncHuntersFromCombat() {
    if (!this.currentCombat) return;
    const combatHunters = this.currentCombat.state.hunters;

    for (const ch of combatHunters) {
      const mainH = this.hunters.find(h => h.id === ch.id);
      if (!mainH) continue;
      mainH.hp = ch.hp;
      mainH.mana = ch.mana;
      mainH.alive = ch.alive;
      mainH.stats.damageDealt += ch.stats.damageDealt;
      mainH.stats.damageTaken += ch.stats.damageTaken;
      mainH.stats.healingDone += ch.stats.healingDone;
      mainH.stats.deaths += ch.stats.deaths;
    }
  }

  // --- Player input ---

  handlePlayerInput(playerId, input) {
    if (this.state !== 'combat' && this.state !== 'mob_wave') return;
    if (!this.currentCombat && !this.currentMobWave) return;

    // Handle hunter switch (keys 1-6)
    if (input.type === 'switch_hunter') {
      const result = this.hunterSwitch.switchTo(playerId, input.slotIndex);
      if (result) {
        this.currentCombat.setHunterControl(result.prevHunterId, false);
        this.currentCombat.setHunterControl(result.newHunterId, true);
      }
      return;
    }

    // Route input to active hunter
    const routed = this.hunterSwitch.routeInput(playerId, input);
    if (routed) {
      this.currentCombat.queueInput(routed.hunterId, routed.input);
    }
  }

  // --- Helpers ---

  _emitStateChange() {
    if (this.onStateChange) this.onStateChange(this.state);
    console.log(`[Expedition] State -> ${this.state}`);
  }

  _logHunterSummary() {
    const byClass = {};
    for (const h of this.hunters) {
      byClass[h.class] = (byClass[h.class] || 0) + 1;
    }
    console.log(`[Expedition] Classes: ${JSON.stringify(byClass)}`);

    const byAtk = [...this.hunters].sort((a, b) => b.atk - a.atk);
    console.log(`[Expedition] Top ATK:`);
    for (const h of byAtk.slice(0, 5)) {
      console.log(`  ${h.hunterName} (${h.username}) -- ATK: ${h.atk} | HP: ${h.maxHp} | Class: ${h.class}`);
    }

    // Log INT stats for mages/healers
    const intHunters = this.hunters.filter(h => h.usesInt && h.int > 0).sort((a, b) => b.int - a.int);
    if (intHunters.length > 0) {
      console.log(`[Expedition] Top INT (mages/healers):`);
      for (const h of intHunters.slice(0, 5)) {
        console.log(`  ${h.hunterName} (${h.username}) -- INT: ${h.int} | inscMana: ${h.inscriptionMana} | Class: ${h.class}`);
      }
    }
  }

  // --- State for broadcast ---

  getExpeditionState() {
    // Active combat (boss or mob wave)
    const activeCombat = this.currentCombat || this.currentMobWave;

    // Send hunter list during non-combat phases for visual rendering
    const hunterList = (this.state === 'march' || this.state === 'campfire' || this.state === 'finished')
      ? this.hunters.map(h => ({
          id: h.id,
          hunterId: h.hunterId,
          hunterName: h.hunterName,
          username: h.username,
          class: h.class,
          element: h.element,
          alive: h.alive,
          hp: h.hp,
          maxHp: h.maxHp,
        }))
      : null;

    return {
      phase: this.state,
      bossIndex: this.currentBossIndex,
      totalBosses: EXPEDITION.TOTAL_BOSSES,
      scrollX: this.scrollX,
      marchProgress: this.state === 'march' ? this._phaseTimer / MARCH.DURATION_SEC : 0,
      campfireProgress: this.state === 'campfire' ? this._phaseTimer / CAMPFIRE.DURATION_SEC : 0,
      playerCount: this.players.size,
      hunterCount: this.hunters.length,
      aliveCount: this.hunters.filter(h => h.alive).length,
      hunters: hunterList,
      bossResults: this.bossResults.map(r => ({
        bossIndex: r.bossIndex,
        victory: r.victory,
        time: r.time,
        bossHpPercent: r.bossHpPercent,
        stats: (r.stats || []).map(s => ({
          id: s.id, hunterId: s.hunterId, hunterName: s.hunterName, username: s.username, class: s.class,
          damageDealt: s.damageDealt, damageTaken: s.damageTaken, healingDone: s.healingDone, deaths: s.deaths, alive: s.alive,
        })),
      })),
      combat: activeCombat ? activeCombat.getSnapshot() : null,
      events: activeCombat ? activeCombat.getEvents() : [],
      feedLog: this.feedLog.slice(0, 30),
      lootResults: this.lootResults.map(r => ({
        itemName: r.itemName,
        rarity: r.rarity,
        type: r.type,
        winnerUsername: r.winnerUsername,
        winnerRoll: r.winnerRoll,
        stolen: r.stolen,
        srWinner: r.srWinner,
      })),
    };
  }

  // --- Feed Log ---

  _addFeed(text, type = 'info') {
    this.feedLog.unshift({ text, type, t: Date.now() });
    if (this.feedLog.length > 60) this.feedLog.pop();
  }

  // --- Loot Phase ---

  _rollLoot(bossIndex, isWipe = false) {
    const aliveHunters = this.hunters.filter(h => h.alive);
    const extraRolls = Math.max(0, Math.floor((aliveHunters.length - 30) / 10));

    // Roll boss drops (bossIndex 0-4, each maps to 3 old tables)
    const drops = LootEngine.generateBossLoot(bossIndex, extraRolls);
    if (drops.length === 0) {
      this._addFeed('Aucun butin...', 'loot');
      return;
    }

    // Build SR selections from player registration data
    const srSelections = new Map();
    for (const [playerId, playerData] of this.players) {
      if (playerData.srItems && playerData.srItems.length > 0) {
        srSelections.set(playerData.username, playerData.srItems);
      }
    }

    // Distribute loot among alive players (by username)
    const playerList = [];
    const seen = new Set();
    for (const h of aliveHunters) {
      if (!seen.has(h.username)) {
        seen.add(h.username);
        playerList.push({ username: h.username });
      }
    }

    const results = LootEngine.distributeLoot(drops, srSelections, playerList, isWipe);
    this.lootResults = results;

    // Feed messages for each drop
    const bossDef = getBossDefinition(bossIndex);
    this._addFeed(`--- BUTIN: ${bossDef?.name || 'Boss ' + (bossIndex + 1)} ---`, 'loot_header');

    for (const r of results) {
      if (r.stolen) {
        this._addFeed(r.narrative?.text || `[${r.itemName}] vole par les monstres!`, 'loot_stolen');
      } else if (r.winnerUsername) {
        // Show the winner reaction
        const reaction = r.narrative?.winnerReaction || `${r.winnerUsername} obtient [${r.itemName}] (${r.winnerRoll}/100)`;
        this._addFeed(reaction, r.narrative?.type === 'epic_moment' ? 'loot_epic' : 'loot_win');

        // Show jealousy/loser reactions
        if (r.narrative?.reactions) {
          for (const rx of r.narrative.reactions.slice(1)) {
            if (rx.text) this._addFeed(rx.text, 'loot_reaction');
          }
        }
      }
    }

    // Summary
    const rarities = {};
    for (const r of results) {
      if (!r.stolen) rarities[r.rarity] = (rarities[r.rarity] || 0) + 1;
    }
    const summary = Object.entries(rarities).map(([r, c]) => `${c}x ${r}`).join(', ');
    this._addFeed(`Total: ${results.filter(r => !r.stolen).length} items (${summary})`, 'loot_summary');

    console.log(`[Expedition] Loot: ${results.length} drops, ${results.filter(r => r.stolen).length} stolen`);
  }

  // --- Banter / Chamailleries ---

  _tickBanter(dt) {
    this._banterTimer += dt;
    if (this._banterTimer < 3.0) return; // Every 3 seconds
    this._banterTimer = 0;

    if (Math.random() > 0.6) return; // 40% chance to say something

    const alive = this.hunters.filter(h => h.alive);
    const dead = this.hunters.filter(h => !h.alive);
    if (alive.length === 0) return;

    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    const h1 = pick(alive);
    const h2 = alive.length > 1 ? pick(alive.filter(h => h.id !== h1.id)) : null;

    const banters = [];

    // ── Helper: check if a player's hunters are present ──
    const ownerOf = name => this.hunters.filter(h => h.username === name);
    const hasPlayer = name => ownerOf(name).length > 0;
    const isGrrrrr = name => name === 'GRRRRR' || name === 'Grrrrr' || name === 'grrrrr';
    const grrrrrHunters = this.hunters.filter(h => isGrrrrr(h.username));
    const hasGrrrrr = grrrrrHunters.length > 0;
    const hasBob = hasPlayer('Bobby') || hasPlayer('Bob');
    const hasDamon = hasPlayer('damon');

    // March-specific banter
    if (this.state === 'march') {
      banters.push(
        `${h1.hunterName} ouvre la marche, l'air determine.`,
        `${h1.hunterName} scrute l'horizon avec mefiance...`,
        `${h1.hunterName} verifie son equipement en marchant.`,
        `"On arrive bientot?" — ${h1.hunterName}`,
        `${h1.hunterName} fait craquer ses doigts, pret au combat.`,
        `${h1.hunterName} : "J'ai un mauvais pressentiment..."`,
        `${h1.hunterName} ramasse une pierre et la jette au loin.`,
      );
      if (h2) {
        banters.push(
          `${h1.hunterName} et ${h2.hunterName} marchent cote a cote en silence.`,
          `${h1.hunterName} lance un regard de defi a ${h2.hunterName}.`,
          `"Tu crois qu'on peut le battre?" — ${h1.hunterName} a ${h2.hunterName}`,
          `${h2.hunterName} donne une tape amicale a ${h1.hunterName}. "On va tout defoncer!"`,
          `${h1.hunterName} : "T'inquiete, je te couvre." ${h2.hunterName} : "C'est plutot moi qui te couvre."`,
          `${h1.hunterName} : "T'as mange quoi ce matin?" ${h2.hunterName} : "...des tacos."`,
          `${h2.hunterName} : "Si on survit, je vous invite au resto." ${h1.hunterName} : "Des tacos?"`,
        );
      }
      if (dead.length > 0) {
        const d = pick(dead);
        banters.push(
          `L'absence de ${d.hunterName} pese sur le groupe...`,
          `"${d.hunterName} nous manque..." — ${h1.hunterName}`,
        );
      }
      // Inside jokes — march
      if (hasDamon) banters.push(
        `Quelqu'un murmure : "damon a pas pris de pause depuis 3 jours..."`,
        `${h1.hunterName} : "damon, tu dors quand au juste?" ... Pas de reponse.`,
        `On raconte que damon n'a jamais pris de pause. Meme les boss ont peur de son endurance.`,
      );
      if (hasGrrrrr) banters.push(
        `La legende GRRRRR avance en tete. Les monstres reculent par respect.`,
        `${h1.hunterName} chuchote : "Paraît que GRRRRR loot jamais rien..."`,
        `GRRRRR marche en silence. Ses poches sont vides. Comme d'habitude.`,
      );
      if (hasBob) banters.push(
        `Bobby fredonne en marchant. Personne n'ose lui dire d'arreter.`,
        `${h1.hunterName} : "Bobby, tu joues Megumin ce soir hein? Hein??"`,
      );
    }

    // Campfire-specific banter
    if (this.state === 'campfire') {
      banters.push(
        `${h1.hunterName} se rechauffe pres du feu, pensif.`,
        `${h1.hunterName} affute son arme silencieusement.`,
        `${h1.hunterName} mange une ration en contemplant les flammes.`,
        `"Ce boss etait costaud..." — ${h1.hunterName}`,
        `${h1.hunterName} soigne ses blessures au coin du feu.`,
        `${h1.hunterName} ferme les yeux un instant, recuperant ses forces.`,
        `"Qui a ramene les tacos?" — ${h1.hunterName}`,
        `${h1.hunterName} sort un tacos de nulle part et commence a manger. Tout le monde le regarde.`,
        `"Y'a plus de tacos?!" — ${h1.hunterName}, scandalise.`,
      );
      if (h2) {
        banters.push(
          `${h1.hunterName} partage sa ration avec ${h2.hunterName}.`,
          `${h2.hunterName} raconte une blague. ${h1.hunterName} esquisse un sourire.`,
          `"Bien joue la-bas!" — ${h1.hunterName} a ${h2.hunterName}`,
          `${h1.hunterName} et ${h2.hunterName} discutent strategie pour le prochain combat.`,
          `${h2.hunterName} : "J'ai fait plus de degats que toi." ${h1.hunterName} : "Dans tes reves."`,
          `${h1.hunterName} montre ses cicatrices de combat. ${h2.hunterName} leve les yeux au ciel.`,
          `${h1.hunterName} : "T'as vu mon DPS?" ${h2.hunterName} : "J'ai vu que t'es mort 3 fois."`,
          `${h2.hunterName} passe un tacos a ${h1.hunterName}. "Tiens, t'as bien bosse."`,
          `${h1.hunterName} : "Je loot rien depuis le debut." ${h2.hunterName} : "Bienvenue au club GRRRRR."`,
        );
      }
      if (dead.length > 0) {
        const d = pick(dead);
        banters.push(
          `${d.hunterName} se releve lentement, encore etourdi.`,
          `"Merci pour la rez..." — ${d.hunterName}, a moitie conscient.`,
          `${h1.hunterName} aide ${d.hunterName} a se remettre sur pied.`,
          `${d.hunterName} : "C'est la derniere fois que je meurs. Probablement."`,
        );
      }
      // Inside jokes — campfire
      if (hasDamon) banters.push(
        `damon fixe le feu. Ca fait 47h qu'il n'a pas dormi. Normal.`,
        `${h1.hunterName} : "damon, tu veux pas te reposer?" damon : "Me reposer? C'est quoi?"`,
        `damon detourne le regard... "60? Pff, pas besoin de ce truc."`,
        `On murmure que damon a deja fini le prochain boss pendant qu'on campait.`,
        `damon mange son tacos en 3 secondes et retourne s'entrainer.`,
      );
      if (hasGrrrrr) banters.push(
        `GRRRRR regarde le butin des autres avec envie. Comme d'habitude, rien pour lui.`,
        `${h1.hunterName} : "GRRRRR, un jour tu looteras un truc, promis." GRRRRR : "..."`,
        `Tout le monde montre son loot. GRRRRR mange son tacos en silence.`,
        `"La legende raconte que GRRRRR a roll 1 sur chaque item de l'expedition..."`,
        `GRRRRR se plaint : "Meme les mobs me steal rien parce que j'ai RIEN."`,
        `${h1.hunterName} offre un item a GRRRRR par pitie. GRRRRR refuse fierement.`,
      );
      if (hasBob) banters.push(
        `Bobby regarde ses mains. "Megumin ou rien." Le groupe approuve.`,
        `${h1.hunterName} : "Bobby, tu te souviens la fois sans Megumin? Le boss a 4%..."`,
        `Bobby : "J'ai dit qu'on en parle plus du boss a 4%." Le silence est lourd.`,
        `Quelqu'un murmure : "Bobby, Ant Queen, 300B..." Bobby rougit. "C'etait un BUG."`,
        `Bobby : "Mon Megumin fait plus de degats que toute votre equipe." Personne ne conteste.`,
        `${h1.hunterName} : "Bobby, montre ton score Ant Queen." Bobby : "Non." Tout le monde rigole.`,
      );
      // Tacos general
      banters.push(
        `Le feu de camp sent les tacos ce soir. Tout le monde approuve.`,
        `Debat anime autour du feu : fromage ou guacamole dans les tacos?`,
        `${h1.hunterName} : "On devrait ouvrir un stand de tacos apres l'expedition."`,
        `Le groupe se met d'accord : apres le dernier boss, c'est tacos pour tout le monde.`,
      );
    }

    if (banters.length > 0) {
      this._addFeed(pick(banters), 'banter');
    }
  }

  // --- Status (for API) ---

  getStatus() {
    return {
      state: this.state,
      bossIndex: this.currentBossIndex,
      totalBosses: EXPEDITION.TOTAL_BOSSES,
      playerCount: this.players.size,
      hunterCount: this.hunters.length,
      aliveCount: this.hunters.filter(h => h.alive).length,
      bossResults: this.bossResults.map(r => ({
        bossIndex: r.bossIndex,
        victory: r.victory,
        time: r.time,
      })),
    };
  }

  // --- Start from DB entries (for API force-start) ---

  async start(expeditionId, dbEntries) {
    if (this.state !== 'idle' && this.state !== 'registration') {
      throw new Error('Engine is not in idle/registration state');
    }

    this.expeditionId = expeditionId;

    // Convert DB entries to engine format
    for (const entry of dbEntries) {
      const username = entry.username;
      const characterIds = typeof entry.character_ids === 'string'
        ? JSON.parse(entry.character_ids) : entry.character_ids;
      const characterData = typeof entry.character_data === 'string'
        ? JSON.parse(entry.character_data) : (entry.character_data || {});

      const hunterEntries = characterIds.map(hId => ({
        hunterId: hId,
        fullStats: characterData[hId]?.fullStats || characterData[hId] || {},
        stars: characterData[hId]?.stars || 0,
        level: characterData[hId]?.level || 140,
        weaponPassive: characterData[hId]?.weaponPassive || null,
        weaponId: characterData[hId]?.weaponId || null,
        equippedSets: characterData[hId]?.equippedSets || {},
        forgePassives: characterData[hId]?.forgePassives || null,
      }));

      const playerId = `player_${username}`;
      this.registerPlayer(playerId, username, hunterEntries);

      // Store SR items for loot distribution
      const srItems = typeof entry.sr_items === 'string'
        ? JSON.parse(entry.sr_items) : (entry.sr_items || []);
      if (srItems.length > 0) {
        const playerData = this.players.get(playerId);
        if (playerData) playerData.srItems = srItems;
      }
    }

    return this.startExpedition();
  }

  // --- Reset (for API) ---

  reset() {
    this.destroy();
    this.state = 'idle';
    this.expeditionId = null;
    this.players.clear();
    this.hunters = [];
    this.hunterSwitch = new HunterSwitch();
    this.currentBossIndex = 0;
    this.bossResults = [];
    this._mobWaveDone = false;
    this._phaseTimer = 0;
    this.scrollX = 0;
    this.feedLog = [];
    this.lootResults = [];
    console.log('[Expedition] Engine reset');
  }

  // --- Cleanup ---

  destroy() {
    if (this.currentCombat) this.currentCombat.stop();
    if (this.currentMobWave) this.currentMobWave.stop();
    if (this._phaseInterval) clearInterval(this._phaseInterval);
    this.currentCombat = null;
    this.currentMobWave = null;
    this._phaseInterval = null;
  }

  // --- Admin: skip directly to a boss (0-indexed) ---
  skipToBoss(bossIndex) {
    if (bossIndex < 0 || bossIndex >= EXPEDITION.TOTAL_BOSSES) return false;

    // Stop whatever is running
    if (this.currentCombat) { this.currentCombat.stop(); this.currentCombat = null; }
    if (this.currentMobWave) { this.currentMobWave.stop(); this.currentMobWave = null; }
    if (this._phaseInterval) { clearInterval(this._phaseInterval); this._phaseInterval = null; }

    // Reset all hunters to full HP/mana
    for (const h of this.hunters) {
      h.alive = true;
      h.hp = h.maxHp;
      if (h.mana !== undefined) h.mana = h.maxMana || h.mana;
      h.resetForEncounter();
    }

    // Jump to target boss
    this.currentBossIndex = bossIndex;
    this._mobWaveDone = true;
    this.bossResults = [];
    this.feedLog = [];
    this._addFeed(`⚡ SKIP — Direct au Boss ${bossIndex + 1} !`, 'phase');

    console.log(`[Expedition] ADMIN SKIP to Boss ${bossIndex + 1}`);
    this._startCombat();
    return true;
  }
}
