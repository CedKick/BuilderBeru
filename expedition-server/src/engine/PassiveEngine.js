import { ALL_SETS } from '../data/expeditionSets.js';
import { EXPEDITION_WEAPONS } from '../data/expeditionWeapons.js';
import { COMBAT } from '../config.js';

// ── SC Weapon Passive Constants ──
// Mirrors client-side equipmentData.js values for the 5 SC secret weapons.
// Keep in sync when nerfing/buffing on the client side.
const SC_WEAPON = {
  // Sulfuras (sulfuras_fury)
  SULFURAS_STACK_PER_HIT: 1,
  SULFURAS_STACK_MAX: 3,          // Each stack = +33% ATK (max +100%)
  // Arc des Murmures (shadow_silence)
  MURMURES_PROC_CHANCE: 0.10,     // 10% per hit to add silence stack
  MURMURES_STACK_DURATION: 5,     // 5s per stack
  MURMURES_MAX_STACKS: 3,        // Each = +100% ATK
  // Katana Z (katana_z_fury)
  KATANA_Z_ATK_PER_HIT: 5,       // +5% ATK per hit (permanent)
  KATANA_Z_COUNTER_CHANCE: 0.50,  // 50% counter on damage taken
  KATANA_Z_COUNTER_MULT: 2.0,    // 200% ATK counter damage
  KATANA_Z_PERSIST_CHANCE: 0.50,  // 50% stacks survive damage
  // Katana V (katana_v_chaos) — nerfed values
  KATANA_V_DOT_PCT: 0.015,       // 1.5% maxMana per stack per tick
  KATANA_V_DOT_MAX_STACKS: 7,
  KATANA_V_BUFF_CHANCE: 0.18,    // 18% per hit
  KATANA_V_STAT_BUFF: 5,         // +5% all stats per proc
  KATANA_V_DMG_MULT: 3,          // x3 next hit (was x6)
  KATANA_V_DOT_TICK_INTERVAL: 1, // DoT ticks every 1s
  // Gul'dan (guldan_halo)
  GULDAN_HEAL_PER_STACK: 0.02,   // +2% of damage dealt per stack
  GULDAN_STUN_CHANCE: 0.05,      // 5% stun chance per heal stack
  GULDAN_DEF_PER_HIT: 0.01,      // +1% DEF per hit
  GULDAN_ATK_PER_HIT: 0.015,     // +1.5% ATK per hit
  GULDAN_SPD_CHANCE: 0.25,       // 25% chance SPD stack
  GULDAN_SPD_BOOST: 0.80,        // +80% SPD per stack
  GULDAN_SPD_MAX_STACKS: 3,
};
const VALID_SC_PASSIVES = ['sulfuras_fury', 'shadow_silence', 'katana_z_fury', 'katana_v_chaos', 'guldan_halo'];

// ── PassiveEngine ──
// Processes set bonuses and weapon passives during expedition combat.
// Called by CombatEngine2D at hook points (on_hit, on_kill, on_crit, etc.)
//
// Characters must have `expeditionGear` set during registration for passives to activate.
// Format: { sets: { setId: pieceCount }, weaponId: string|null }

export class PassiveEngine {
  constructor() {
    // Runtime state per character: Map<charId, CharPassiveState>
    this.state = new Map();
  }

  // ═══════════════════════════════════════════════════════
  // INIT — called once at combat start
  // ═══════════════════════════════════════════════════════
  initCombat(characters) {
    this.state.clear();
    for (const char of characters) {
      const gear = char.expeditionGear || { sets: {}, weaponId: null };
      const activeSets = this.computeActiveSets(gear.sets || {});
      const weaponDef = gear.weaponId ? EXPEDITION_WEAPONS[gear.weaponId] : null;

      // Apply permanent 2pc stat bonuses
      this.apply2pcBonuses(char, activeSets);

      // SC weapon passive (from client registration)
      const scWp = (char.scWeaponPassive && VALID_SC_PASSIVES.includes(char.scWeaponPassive))
        ? char.scWeaponPassive : null;

      this.state.set(char.id, {
        activeSets,         // [{ setId, setDef, pieces, has2pc, has4pc }]
        weaponDef,          // weapon definition or null
        scWeaponPassive: scWp,  // SC weapon passive ID or null
        // ── SC Weapon Runtime State ──
        sulfurasStacks: 0,
        shadowSilenceStacks: [],         // Array of { timer: seconds remaining }
        katanaZStacks: 0,
        katanaVState: scWp === 'katana_v_chaos'
          ? { dots: 0, allStatBuff: 0, shield: false, nextDmgMult: 1, dotTickTimer: 0 }
          : null,
        guldanState: scWp === 'guldan_halo'
          ? { healStacks: 0, defBonus: 0, atkBonus: 0, spdStacks: 0, divinUsed: false }
          : null,
        // ── Stacks & Counters ──
        titanFuryStacks: 0,
        titanFuryCritTimer: 0,    // Guaranteed crit timer (5s)
        steelStormHitCount: 0,
        steelStormSpdBonus: 0,
        arcaneNovaSpellCount: 0,
        muramasaStacks: 0,
        gramHitCount: 0,
        gramAoeBonus: 0,
        nidhoggStacks: 0,
        voidVoiceDots: new Map(), // targetId -> { stacks, timer }
        guardianShield: 0,       // Accumulated damage absorbed
        // ── Cooldowns (seconds remaining) ──
        cdVitalAutoHeal: new Map(), // targetCharId -> CD remaining
        cdHarmonieMegaHeal: 30,    // starts at 30s
        cdGungnirCrit: 15,
        cdExcaliburSave: 0,
        cdPacteSave: 0,
        // ── Flags ──
        windRushFirstAttack: true,
        bastionRezUsed: false,
        ghostBladeNextIgnoreDef: false,
        // ── SC/Raid/ARC2/Ultime set state ──
        innerFlameStacks: 0,
        innerFlameDmgMult: 0,
        eternalRageStacks: 0,
        eternalRageCritTimer: 0,
        celestialShieldHp: 0,
        celestialShieldActive: false,
        siphonEmergencyCD: 0,
        siphonEmergencyActive: false,
        equilibreTimer: 0,
        equilibreBuffActive: false,
        curseDmgStacks: 0,
        curseRescueUsed: false,
        greedCritStacks: 0,
        ironWillStacks: 0,
        infamyStacks: 0,
        infamyManaCD: 0,
        echoSpellCount: 0,
        transcendentStacks: 0,
        arcaneOverloadReady: false,
        arcaneOverloadCD: 0,
        arcaneAdaptiveRegenCD: 0,
        arcaneAdaptiveRegenActive: false,
        dodgeCounterReady: false,
        commanderApplied: false,
        shadowPactApplied: false,
        martyrHealUsed: new Map(), // targetId -> used
        // ── Support sets ──
        wisdomStacks: 0,           // Sagesse Ancienne: INT stacks per skill
        celestialSpdApplied: false,// Souffle Celeste: team SPD applied at start
        celestialSpdTimer: 0,      // Souffle Celeste: self SPD burst timer
        celestialSpdBurstCD: 0,    // Souffle Celeste: burst cooldown
        purifyTimer: 0,            // Purification Sacree: cleanse tick timer
        breezeShields: new Map(),  // Brise Guerissante: target -> shield HP remaining
        // ── Phase 2 Weapons ──
        ragnarokHitCount: 0,       // Ragnarok: AoE every 3 hits
        kusanagiStacks: 0,         // Kusanagi: +5% ATK per crit (max 10)
        gaeFirstAttack: true,      // Gae Bolg: first attack x3
        gaeDashTimer: 10,          // Gae Bolg: dash every 10s
        masamuneSaveCD: 0,         // Masamune: absorb lethal CD 45s
        masamuneSavesLeft: 2,      // Masamune: 2 lethal absorbs
        tyrfingStacks: 0,          // Tyrfing: kill stacks (max 10)
        tyrfingInvincibleCD: 0,    // Tyrfing: invincible CD 60s
        fragarachHitCount: 0,      // Fragarach: tornado every 5 hits
        tacosStacks: 0,            // Tacos Eternel: +10% all stats per kill (infinite)
        amenoRezUsed: false,       // Ame-no-nuhoko: rez 1 ally per combat
      });

      // ── Apply combat-start passives ──

      // Gardien Celeste: shield 20% HP at start
      if (this.has2pcPassive(char.id, 'celestial_shield')) {
        const shield = Math.floor(char.maxHp * 0.20);
        const cs = this.state.get(char.id);
        cs.celestialShieldHp = shield;
        cs.celestialShieldActive = true;
      }
    }

    // ── Post-init team passives (need all chars loaded) ──
    for (const char of characters) {
      const s = this.state.get(char.id);
      if (!s) continue;

      // Sacrifice du Martyr 2pc: self ATK -30%, allies ATK +15% (additive)
      if (this.has2pcPassive(char.id, 'martyr_aura')) {
        const buff = Math.floor(char.atk * 0.15);
        char.atk = Math.floor(char.atk * 0.70);
        for (const ally of characters) {
          if (ally.id !== char.id && ally.username === char.username) {
            ally.atk += buff;
          }
        }
      }

      // Pacte des Ombres 2pc: self ATK -50%, allies ATK +150% (additive)
      if (this.has2pcPassive(char.id, 'shadow_pact') && !s.shadowPactApplied) {
        s.shadowPactApplied = true;
        const buff = Math.floor(char.atk * 1.50); // +150% of buffer's ATK
        char.atk = Math.floor(char.atk * 0.50);
        for (const ally of characters) {
          if (ally.id !== char.id && ally.username === char.username) {
            ally.atk += buff;
          }
        }
      }

      // Pacte des Ombres 4pc: raid-wide DMG +25%
      if (this.hasPassive(char.id, 'shadow_pact_raid')) {
        for (const ally of characters) {
          ally._allDmgBonus = (ally._allDmgBonus || 0) + 25;
        }
      }

      // Aura du Commandeur 2pc: allies +10% DEF
      if (this.has2pcPassive(char.id, 'commander_def')) {
        for (const ally of characters) {
          if (ally.id !== char.id) {
            ally.def = Math.floor(ally.def * 1.10);
          }
        }
      }

      // Aura du Commandeur 4pc: allies +20 CRIT for 8s
      if (this.hasPassive(char.id, 'commander_crit') && !s.commanderApplied) {
        s.commanderApplied = true;
        for (const ally of characters) {
          if (ally.id !== char.id) {
            ally.addBuff('crit', 20, 8, 'commander_crit');
          }
        }
      }

      // Souffle Celeste 4pc: team +10% SPD for 8s at combat start
      if (this.hasPassive(char.id, 'celestial_speed') && !s.celestialSpdApplied) {
        s.celestialSpdApplied = true;
        for (const ally of characters) {
          if (ally.username === char.username && ally.alive) {
            ally.addBuff('spd', Math.floor(ally.spd * 0.10), 8, 'celestial_speed_start');
          }
        }
      }

      // Equilibre Supreme 4pc: stat la plus basse +25%
      if (this.hasPassive(char.id, 'supreme_balance')) {
        const stats = { atk: char.atk, def: char.def, spd: char.spd };
        const lowest = Object.entries(stats).sort((a, b) => a[1] - b[1])[0];
        if (lowest) {
          const boost = Math.floor(lowest[1] * 0.25);
          char[lowest[0]] += boost;
        }
      }

      // Burning Curse 2pc: DMG +10% (applied as allDmg), DMG taken +20%
      if (this.has2pcPassive(char.id, 'curse')) {
        char._allDmgBonus = (char._allDmgBonus || 0) + 10;
        char._curseDmgTaken = 20;
      }
      // Burning Curse 4pc: DMG +20% instead
      if (this.hasPassive(char.id, 'enhanced_curse')) {
        char._allDmgBonus = (char._allDmgBonus || 0) + 10; // +10 more (total 20)
      }
    }

    // ── Team Synergies (per-player groups of 6) ──
    // Same synergy system as Raid SC: element duos/trinities, class diversity, support/tank presence
    const playerGroups = new Map(); // username -> [char, ...]
    for (const char of characters) {
      if (!playerGroups.has(char.username)) playerGroups.set(char.username, []);
      playerGroups.get(char.username).push(char);
    }
    for (const [, group] of playerGroups) {
      const elemCount = {};
      const classSet = new Set();
      let hasSupport = false;
      let hasTank = false;
      for (const c of group) {
        elemCount[c.element] = (elemCount[c.element] || 0) + 1;
        classSet.add(c.hunterClass);
        if (c.hunterClass === 'support') hasSupport = true;
        if (c.hunterClass === 'tank') hasTank = true;
      }
      const bonuses = { atk: 0, def: 0, hp: 0, spd: 0, allStats: 0 };
      const maxElem = Math.max(...Object.values(elemCount));
      if (maxElem >= 3) { bonuses.atk += 20; bonuses.def += 10; }
      else if (maxElem >= 2) { bonuses.atk += 10; }
      if (classSet.size >= 3) bonuses.allStats += 5;
      if (hasSupport) bonuses.hp += 10;
      if (hasTank) bonuses.def += 10;
      // Apply synergy bonuses as stat multipliers to each char in this player's group
      const hpMult  = 1 + (bonuses.hp + bonuses.allStats) / 100;
      const atkMult = 1 + (bonuses.atk + bonuses.allStats) / 100;
      const defMult = 1 + (bonuses.def + bonuses.allStats) / 100;
      const spdMult = 1 + (bonuses.spd + bonuses.allStats) / 100;
      if (hpMult !== 1 || atkMult !== 1 || defMult !== 1 || spdMult !== 1) {
        for (const c of group) {
          if (hpMult !== 1)  { c.maxHp = Math.floor(c.maxHp * hpMult); c.hp = Math.min(c.hp, c.maxHp); }
          if (atkMult !== 1) { c.atk = Math.floor(c.atk * atkMult); if (c.int) c.int = Math.floor(c.int * atkMult); }
          if (defMult !== 1)   c.def = Math.floor(c.def * defMult);
          if (spdMult !== 1)   c.spd = Math.floor(c.spd * spdMult);
        }
      }
    }
  }

  computeActiveSets(equippedSets) {
    const result = [];
    for (const [setId, pieceCount] of Object.entries(equippedSets)) {
      const setDef = ALL_SETS[setId];
      if (!setDef) continue;
      result.push({
        setId,
        setDef,
        pieces: pieceCount,
        has2pc: pieceCount >= 2,
        has4pc: pieceCount >= 4,
      });
    }
    return result;
  }

  // Apply permanent 2pc stat bonuses at combat start
  apply2pcBonuses(char, activeSets) {
    for (const s of activeSets) {
      if (!s.has2pc) continue;
      const b = s.setDef.bonus2pc;
      if (!b) continue;
      if (b.atk_pct) char.atk = Math.floor(char.atk * (1 + b.atk_pct / 100));
      if (b.def_pct) char.def = Math.floor(char.def * (1 + b.def_pct / 100));
      if (b.hp_pct) {
        char.maxHp = Math.floor(char.maxHp * (1 + b.hp_pct / 100));
        char.hp = char.maxHp;
      }
      if (b.spd_pct) char.spd = Math.floor(char.spd * (1 + b.spd_pct / 100));
      if (b.crit_rate) char.crit += b.crit_rate;
      if (b.heal_pct) char._healBonus = (char._healBonus || 0) + b.heal_pct;
      if (b.mana_max_pct) {
        char.maxMana = Math.floor(char.maxMana * (1 + b.mana_max_pct / 100));
        char.mana = char.maxMana;
      }
      if (b.mana_regen_pct) char._manaRegenBonus = (char._manaRegenBonus || 0) + b.mana_regen_pct;
      if (b.lifesteal_pct) char._lifesteal = (char._lifesteal || 0) + b.lifesteal_pct;
      // New stat keys for SC/Raid/ARC2/Ultime sets
      if (b.crit_dmg_pct) char._critDmgBonus = (char._critDmgBonus || 0) + b.crit_dmg_pct;
      if (b.fire_dmg_pct) char._elemDmgBonus = (char._elemDmgBonus || 0) + (char.element === 'fire' ? b.fire_dmg_pct : 0);
      if (b.water_dmg_pct) char._elemDmgBonus = (char._elemDmgBonus || 0) + (char.element === 'water' ? b.water_dmg_pct : 0);
      if (b.shadow_dmg_pct) char._elemDmgBonus = (char._elemDmgBonus || 0) + (char.element === 'shadow' ? b.shadow_dmg_pct : 0);
      if (b.all_dmg_pct) char._allDmgBonus = (char._allDmgBonus || 0) + b.all_dmg_pct;
      if (b.def_pen) char._defPen = (char._defPen || 0) + b.def_pen;
      if (b.res_flat) char.res = (char.res || 0) + b.res_flat;
      if (b.int_pct && char.int) char.int = Math.floor(char.int * (1 + b.int_pct / 100));
      if (b.mana_cost_reduce) char._manaCostReduce = (char._manaCostReduce || 0) + b.mana_cost_reduce;
    }

    // Also apply 4pc stat-only bonuses (sets without passive, just stats)
    for (const s of activeSets) {
      if (!s.has4pc) continue;
      const b4 = s.setDef.bonus4pc;
      if (!b4 || b4.passive) continue; // Skip sets that have passive (handled in hooks)
      if (b4.crit_dmg_pct) char._critDmgBonus = (char._critDmgBonus || 0) + b4.crit_dmg_pct;
      if (b4.hp_pct) { char.maxHp = Math.floor(char.maxHp * (1 + b4.hp_pct / 100)); char.hp = char.maxHp; }
      if (b4.fire_dmg_pct) char._elemDmgBonus = (char._elemDmgBonus || 0) + (char.element === 'fire' ? b4.fire_dmg_pct : 0);
      if (b4.water_dmg_pct) char._elemDmgBonus = (char._elemDmgBonus || 0) + (char.element === 'water' ? b4.water_dmg_pct : 0);
      if (b4.shadow_dmg_pct) char._elemDmgBonus = (char._elemDmgBonus || 0) + (char.element === 'shadow' ? b4.shadow_dmg_pct : 0);
      if (b4.all_dmg_pct) char._allDmgBonus = (char._allDmgBonus || 0) + b4.all_dmg_pct;
      if (b4.def_pen) char._defPen = (char._defPen || 0) + b4.def_pen;
      if (b4.heal_pct) char._healBonus = (char._healBonus || 0) + b4.heal_pct;
      if (b4.mana_regen_pct) char._manaRegenBonus = (char._manaRegenBonus || 0) + b4.mana_regen_pct;
      if (b4.mana_cost_reduce) char._manaCostReduce = (char._manaCostReduce || 0) + b4.mana_cost_reduce;
    }
  }

  hasPassive(charId, passiveId) {
    const s = this.state.get(charId);
    if (!s) return false;
    return s.activeSets.some(set => set.has4pc && set.setDef.bonus4pc?.passive === passiveId);
  }

  has2pcPassive(charId, passiveId) {
    const s = this.state.get(charId);
    if (!s) return false;
    return s.activeSets.some(set => set.has2pc && set.setDef.bonus2pc?.passive === passiveId);
  }

  hasWeapon(charId, weaponId) {
    const s = this.state.get(charId);
    return s?.weaponDef?.id === weaponId;
  }

  hasScWeapon(charId, passiveId) {
    const s = this.state.get(charId);
    return s?.scWeaponPassive === passiveId;
  }

  // ═══════════════════════════════════════════════════════
  // HOOK: ON HIT (after character deals damage to enemy)
  // Returns: { bonusDamage, events[] }
  // ═══════════════════════════════════════════════════════
  onHit(char, target, damage, isCrit, events) {
    const s = this.state.get(char.id);
    if (!s) return { bonusDamage: 0 };
    let bonusDamage = 0;

    // ── FUREUR DU TITAN: +2% ATK per stack, crit burst at 20 ──
    if (this.hasPassive(char.id, 'titan_fury')) {
      s.titanFuryStacks = Math.min(20, s.titanFuryStacks + 1);
      // Guaranteed crit window check
      if (s.titanFuryCritTimer > 0) {
        // Already in crit window — handled via checkGuaranteedCrit
      }
      if (s.titanFuryStacks >= 20 && s.titanFuryCritTimer <= 0) {
        s.titanFuryCritTimer = 5; // 5s guaranteed crits
        s.titanFuryStacks = 0;
        events.push({ type: 'passive_proc', charId: char.id, passive: 'titan_fury_burst', message: 'Fureur du Titan: Crits garantis 5s!' });
      }
    }

    // ── TEMPETE D'ACIER: every 5th hit = 200% damage ──
    if (this.hasPassive(char.id, 'steel_storm')) {
      s.steelStormHitCount++;
      if (s.steelStormHitCount >= 5) {
        s.steelStormHitCount = 0;
        bonusDamage += Math.floor(damage * 1.0); // +100% extra (total = 200%)
        events.push({ type: 'passive_proc', charId: char.id, passive: 'steel_storm_5th', message: 'Tempete d\'Acier: 5eme coup x2!' });
      }
    }

    // ── GRAM: every 5th hit = AoE ──
    if (this.hasWeapon(char.id, 'gram')) {
      s.gramHitCount++;
      if (s.gramHitCount >= 5) {
        s.gramHitCount = 0;
        const aoeDmg = Math.floor(char.getOffensiveStat() * 2.5 * (1 + s.gramAoeBonus / 100));
        events.push({ type: 'passive_aoe', charId: char.id, passive: 'gram_aoe', damage: aoeDmg, radius: 150 });
        // gramAoeBonus increases per target hit (handled externally)
      }
    }

    // ── VOIX DU NEANT: apply DoT ──
    if (this.hasPassive(char.id, 'void_voice')) {
      const dotKey = target.id;
      const dot = s.voidVoiceDots.get(dotKey) || { stacks: 0, timer: 8 };
      dot.stacks = Math.min(3, dot.stacks + 1);
      dot.timer = 8;
      s.voidVoiceDots.set(dotKey, dot);
    }

    // ── GHOST BLADE (Lame Fantome): post-crit ignore DEF ──
    if (s.ghostBladeNextIgnoreDef) {
      bonusDamage += Math.floor(damage * 0.4); // Simulates ignoring 40% DEF
      s.ghostBladeNextIgnoreDef = false;
      // 15% double strike
      if (Math.random() < 0.15) {
        bonusDamage += Math.floor(damage * 0.8);
        events.push({ type: 'passive_proc', charId: char.id, passive: 'ghost_double', message: 'Lame Fantome: Double frappe!' });
      }
    }

    // ── LIFESTEAL (from 2pc bonuses or weapons) ──
    const lifesteal = char._lifesteal || 0;
    if (lifesteal > 0) {
      const healAmount = Math.floor((damage + bonusDamage) * lifesteal / 100);
      if (healAmount > 0 && char.alive) {
        char.heal(healAmount);
      }
    }

    // ── EXCALIBUR: HP > 80% = +25% damage ──
    if (this.hasWeapon(char.id, 'excalibur') && char.hp / char.maxHp > 0.8) {
      bonusDamage += Math.floor(damage * 0.25);
    }

    // ── RAGNAROK: every 3rd hit = AoE 400% fire + -20% DEF debuff ──
    if (this.hasWeapon(char.id, 'ragnarok')) {
      s.ragnarokHitCount++;
      if (s.ragnarokHitCount >= 3) {
        s.ragnarokHitCount = 0;
        const aoeDmg = Math.floor(char.getOffensiveStat() * 4.0);
        events.push({ type: 'passive_aoe', charId: char.id, passive: 'ragnarok_aoe', damage: aoeDmg, radius: 200 });
        if (target.addDebuff) target.addDebuff('def_shred', 20, 8, char.id);
        events.push({ type: 'passive_proc', charId: char.id, passive: 'ragnarok_fury', message: 'Ragnarök: AoE feu! -20% DEF' });
      }
    }

    // ── KUSANAGI: ignore 20% DEF permanent ──
    if (this.hasWeapon(char.id, 'kusanagi')) {
      bonusDamage += Math.floor(damage * 0.20);
    }

    // ── GAE BOLG: first attack x3 ──
    if (this.hasWeapon(char.id, 'gae_bolg') && s.gaeFirstAttack) {
      s.gaeFirstAttack = false;
      bonusDamage += Math.floor(damage * 2.0); // total = x3
      events.push({ type: 'passive_proc', charId: char.id, passive: 'gae_bolg_first', message: 'Gáe Bolg: Premiere attaque x3!' });
    }

    // ── MASAMUNE: HP > 50% = +35% damage ──
    if (this.hasWeapon(char.id, 'masamune') && char.hp / char.maxHp > 0.5) {
      bonusDamage += Math.floor(damage * 0.35);
    }

    // ── LONGINUS: ignore 30% DEF + +25% vs boss ──
    if (this.hasWeapon(char.id, 'longinus')) {
      bonusDamage += Math.floor(damage * 0.30);
      if (target.isBoss) bonusDamage += Math.floor(damage * 0.25);
    }

    // ── FRAGARACH: every 5th hit = tornado 350% ──
    if (this.hasWeapon(char.id, 'fragarach')) {
      s.fragarachHitCount++;
      if (s.fragarachHitCount >= 5) {
        s.fragarachHitCount = 0;
        const tornDmg = Math.floor(char.getOffensiveStat() * 3.5);
        events.push({ type: 'passive_aoe', charId: char.id, passive: 'fragarach_tornado', damage: tornDmg, radius: 200 });
        events.push({ type: 'passive_proc', charId: char.id, passive: 'fragarach_wind', message: 'Fragarach: Tornado!' });
      }
    }

    // ── TACOS ETERNEL: -30% ATK debuff (once per target, not cumulative) ──
    if (this.hasWeapon(char.id, 'tacos_eternel')) {
      if (target.addDebuff && !target.debuffs?.some(d => d.type === 'confusion')) {
        target.addDebuff('confusion', 30, 999, char.id);  // permanent, single application
      }
    }

    // ── AME-NO-NUHOKO: +5% random stat to random teammate per hit ──
    if (this.hasWeapon(char.id, 'amenonuhoko')) {
      const allChars = this.getAllAliveAllies(char.id);
      if (allChars.length > 0) {
        const ally = allChars[Math.floor(Math.random() * allChars.length)];
        const stats = ['atk', 'def', 'spd'];
        const stat = stats[Math.floor(Math.random() * stats.length)];
        const boost = Math.floor((ally[stat] || 100) * 0.05);
        if (boost > 0) ally.addBuff(stat, boost, 999, 'amenonuhoko');
      }
    }

    // ── WIND RUSH (Ailes du Vent): first attack = guaranteed crit ──
    if (this.hasPassive(char.id, 'wind_rush') && s.windRushFirstAttack) {
      s.windRushFirstAttack = false;
    }

    // ── FLAMME INTERIEURE 2pc: +3% DMG per stack (max 10) ──
    if (this.has2pcPassive(char.id, 'inner_flame_stack')) {
      s.innerFlameStacks = Math.min(10, s.innerFlameStacks + 1);
      s.innerFlameDmgMult = s.innerFlameStacks * 0.03;
      bonusDamage += Math.floor(damage * s.innerFlameDmgMult);
    }
    // FLAMME INTERIEURE 4pc: at 10 stacks crit + DMG +50%
    if (this.hasPassive(char.id, 'inner_flame_release') && s.innerFlameStacks >= 10) {
      bonusDamage += Math.floor(damage * 0.50);
      s.innerFlameStacks = 0;
      s.innerFlameDmgMult = 0;
      events.push({ type: 'passive_proc', charId: char.id, passive: 'inner_flame_burst', message: 'Flamme Interieure: Explosion x1.5!' });
    }

    // ── RAGE ETERNELLE 2pc: ATK +1% per hit (max 15) ──
    if (this.has2pcPassive(char.id, 'eternal_rage_stack')) {
      s.eternalRageStacks = Math.min(15, s.eternalRageStacks + 1);
      char.addBuff('atk', Math.floor(char.atk * 0.01 * s.eternalRageStacks), 999, 'eternal_rage');
    }
    // RAGE ETERNELLE 4pc: at 15 stacks crit + DMG +40% + ignore 15% DEF
    if (this.hasPassive(char.id, 'eternal_rage_release') && s.eternalRageStacks >= 15 && s.eternalRageCritTimer <= 0) {
      s.eternalRageCritTimer = 5;
      s.eternalRageStacks = 0;
      bonusDamage += Math.floor(damage * 0.40);
      events.push({ type: 'passive_proc', charId: char.id, passive: 'eternal_rage_burst', message: 'Rage Eternelle: Crits + DMG +40%!' });
    }
    if (s.eternalRageCritTimer > 0) {
      bonusDamage += Math.floor(damage * 0.15); // Simulate 15% DEF ignore
    }

    // ── FUREUR DU DESESPOIR 2pc: +0.8% DMG per 1% HP missing ──
    if (this.has2pcPassive(char.id, 'desperate_fury')) {
      const missingPct = 1 - (char.hp / char.maxHp);
      bonusDamage += Math.floor(damage * missingPct * 0.008 * 100);
    }

    // ── CHAINES DU DESTIN 2pc: 15% chance lifesteal 12% ──
    if (this.has2pcPassive(char.id, 'chain_lifesteal') && Math.random() < 0.15) {
      const steal = Math.floor((damage + bonusDamage) * 0.12);
      if (steal > 0 && char.alive) char.heal(steal);
    }

    // ── SIPHON VITAL 2pc: 25% chance lifesteal 15% + overheal shield ──
    if (this.has2pcPassive(char.id, 'vital_siphon') && Math.random() < 0.25) {
      const steal = Math.floor((damage + bonusDamage) * 0.15);
      if (steal > 0 && char.alive) {
        const before = char.hp;
        char.heal(steal);
        const overheal = steal - (char.hp - before);
        if (overheal > 0) {
          const shieldMax = Math.floor(char.maxHp * 0.20);
          char._overHealShield = Math.min(shieldMax, (char._overHealShield || 0) + overheal);
        }
      }
    }
    // SIPHON VITAL 4pc: HP > 80% = DMG +30%
    if (this.hasPassive(char.id, 'vital_surge') && char.hp / char.maxHp > 0.80) {
      bonusDamage += Math.floor(damage * 0.30);
    }

    // ── GARDIEN CELESTE 4pc: shield intact = +25% DMG ──
    if (this.hasPassive(char.id, 'celestial_wrath') && s.celestialShieldActive) {
      bonusDamage += Math.floor(damage * 0.25);
    }

    // ── ECHO TEMPOREL 2pc: 20% chance -1 CD after attack ──
    if (this.has2pcPassive(char.id, 'echo_cd') && Math.random() < 0.20) {
      for (const skill of char.skills) {
        if (skill.cooldown > 0) { skill.cooldown = Math.max(0, skill.cooldown - 1); break; }
      }
    }

    // ── BURNING CURSE: +0.1% DMG per tick stacked ──
    if (this.has2pcPassive(char.id, 'curse')) {
      s.curseDmgStacks = Math.min(100, s.curseDmgStacks + 0.1);
      bonusDamage += Math.floor(damage * s.curseDmgStacks / 100);
    }

    // ── TEMPETE ARCANE 2pc: DMG +2% per 10% mana remaining ──
    if (this.has2pcPassive(char.id, 'arcane_tempest')) {
      const manaPercent10 = Math.floor((char.mana / char.maxMana) * 10);
      bonusDamage += Math.floor(damage * manaPercent10 * 0.02);
    }

    // ── ARCANE RESONANCE 2pc: mana-scaling bonus +15% ──
    if (this.has2pcPassive(char.id, 'arcane_resonance')) {
      bonusDamage += Math.floor(damage * 0.15);
    }

    // ── SC WEAPON: SULFURAS — ATK boost from stacks ──
    if (this.hasScWeapon(char.id, 'sulfuras_fury') && s.sulfurasStacks > 0) {
      // Each stack = +33% ATK (max 3 stacks = +100%)
      bonusDamage += Math.floor(damage * (s.sulfurasStacks / 3));
    }

    // ── SC WEAPON: ARC DES MURMURES (shadow_silence) — ATK boost from active stacks ──
    if (this.hasScWeapon(char.id, 'shadow_silence')) {
      const activeStacks = s.shadowSilenceStacks.length;
      if (activeStacks > 0) {
        bonusDamage += Math.floor(damage * activeStacks * 1.0); // +100% per stack
      }
      // 10% chance to add new stack
      if (s.shadowSilenceStacks.length < SC_WEAPON.MURMURES_MAX_STACKS && Math.random() < SC_WEAPON.MURMURES_PROC_CHANCE) {
        s.shadowSilenceStacks.push({ timer: SC_WEAPON.MURMURES_STACK_DURATION });
        events.push({ type: 'passive_proc', charId: char.id, passive: 'murmures_stack', message: `Murmures: +1 stack (${s.shadowSilenceStacks.length})` });
      }
    }

    // ── SC WEAPON: KATANA Z — +5% ATK per hit (permanent) ──
    if (this.hasScWeapon(char.id, 'katana_z_fury')) {
      s.katanaZStacks++;
      bonusDamage += Math.floor(damage * s.katanaZStacks * SC_WEAPON.KATANA_Z_ATK_PER_HIT / 100);
    }

    // ── SC WEAPON: KATANA V — x3 mult + allStatBuff + DoT stack + buff roll ──
    if (this.hasScWeapon(char.id, 'katana_v_chaos') && s.katanaVState) {
      const kvs = s.katanaVState;
      // Apply x3 multiplier if buffed
      if (kvs.nextDmgMult > 1) {
        bonusDamage += Math.floor(damage * (kvs.nextDmgMult - 1));
        kvs.nextDmgMult = 1;
        events.push({ type: 'passive_proc', charId: char.id, passive: 'katana_v_x3', message: 'Katana V: Puissance x3!' });
      }
      // Apply allStatBuff
      if (kvs.allStatBuff > 0) {
        bonusDamage += Math.floor(damage * kvs.allStatBuff / 100);
      }
      // +1 DoT stack
      if (kvs.dots < SC_WEAPON.KATANA_V_DOT_MAX_STACKS) kvs.dots++;
      // 18% buff roll
      if (Math.random() < SC_WEAPON.KATANA_V_BUFF_CHANCE) {
        const roll = Math.random();
        if (roll < 0.33) {
          kvs.allStatBuff += SC_WEAPON.KATANA_V_STAT_BUFF;
          events.push({ type: 'passive_proc', charId: char.id, passive: 'katana_v_buff', message: `Katana V: +${SC_WEAPON.KATANA_V_STAT_BUFF}% stats (total +${kvs.allStatBuff}%)` });
        } else if (roll < 0.66) {
          kvs.shield = true;
          events.push({ type: 'passive_proc', charId: char.id, passive: 'katana_v_shield', message: 'Katana V: Bouclier Divin!' });
        } else {
          kvs.nextDmgMult = SC_WEAPON.KATANA_V_DMG_MULT;
          events.push({ type: 'passive_proc', charId: char.id, passive: 'katana_v_power', message: `Katana V: Puissance x${SC_WEAPON.KATANA_V_DMG_MULT} prochain coup!` });
        }
      }
    }

    // ── SC WEAPON: GUL'DAN — post-attack: heal, DEF/ATK stacking, SPD, stun ──
    if (this.hasScWeapon(char.id, 'guldan_halo') && s.guldanState && damage > 0) {
      const gs = s.guldanState;
      gs.healStacks++;
      // Heal: 2% of damage dealt per stack
      const healAmt = Math.floor(damage * SC_WEAPON.GULDAN_HEAL_PER_STACK * gs.healStacks);
      if (healAmt > 0 && char.alive) char.heal(healAmt);
      // ATK & DEF permanent stacking
      gs.defBonus += SC_WEAPON.GULDAN_DEF_PER_HIT;
      gs.atkBonus += SC_WEAPON.GULDAN_ATK_PER_HIT;
      // SPD stacking (max 3)
      if (gs.spdStacks < SC_WEAPON.GULDAN_SPD_MAX_STACKS && Math.random() < SC_WEAPON.GULDAN_SPD_CHANCE) {
        gs.spdStacks++;
        events.push({ type: 'passive_proc', charId: char.id, passive: 'guldan_spd', message: `Gul'dan: SPD +${gs.spdStacks}!` });
      }
    }

    // ── SC WEAPON: SULFURAS — stack building (after damage) ──
    if (this.hasScWeapon(char.id, 'sulfuras_fury')) {
      s.sulfurasStacks = Math.min(SC_WEAPON.SULFURAS_STACK_MAX, s.sulfurasStacks + SC_WEAPON.SULFURAS_STACK_PER_HIT);
    }

    return { bonusDamage };
  }

  // ═══════════════════════════════════════════════════════
  // HOOK: ON CRIT
  // ═══════════════════════════════════════════════════════
  onCrit(char, target, damage, events) {
    const s = this.state.get(char.id);
    if (!s) return;

    // ── LAME FANTOME: next hit ignores 40% DEF ──
    if (this.hasPassive(char.id, 'ghost_blade')) {
      s.ghostBladeNextIgnoreDef = true;
    }

    // ── MURAMASA: +3% ATK per crit (max 30%), lose 1% HP ──
    if (this.hasWeapon(char.id, 'muramasa')) {
      if (s.muramasaStacks < 10) {
        s.muramasaStacks++;
        const atkBonus = Math.floor(char.atk * 0.03);
        char.addBuff('atk', atkBonus * s.muramasaStacks, 999, 'muramasa');
        // Self-damage
        const selfDmg = Math.floor(char.maxHp * 0.01);
        char.hp = Math.max(1, char.hp - selfDmg);
        if (s.muramasaStacks >= 10) {
          events.push({ type: 'passive_proc', charId: char.id, passive: 'muramasa_x3', message: 'Muramasa: Prochain coup x3!' });
        }
      }
    }

    // ── CALADBOLG: crit = burn (3% HP/s, 5s) ──
    if (this.hasWeapon(char.id, 'caladbolg')) {
      s.caladBurningTargets = s.caladBurningTargets || new Set();
      s.caladBurningTargets.add(target.id);
      events.push({ type: 'passive_proc', charId: char.id, passive: 'caladbolg_burn', target: target.id });
    }

    // ── BURNING GREED: CRIT +1%/+2% per stack (max 10) ──
    if (this.has2pcPassive(char.id, 'greed')) {
      const increment = this.hasPassive(char.id, 'enhanced_greed') ? 2 : 1;
      s.greedCritStacks = Math.min(10, s.greedCritStacks + increment);
      char.addBuff('crit', s.greedCritStacks, 999, 'burning_greed');
    }

    // ── KUSANAGI: +5% ATK per crit (max 50%, 10 stacks). At 10 = x5 next hit ──
    if (this.hasWeapon(char.id, 'kusanagi')) {
      if (s.kusanagiStacks < 10) {
        s.kusanagiStacks++;
        char.addBuff('atk', Math.floor(char.atk * 0.05 * s.kusanagiStacks), 999, 'kusanagi');
      }
      if (s.kusanagiStacks >= 10) {
        events.push({ type: 'passive_proc', charId: char.id, passive: 'kusanagi_x5', message: 'Kusanagi: Prochain coup x5!' });
      }
    }

    // ── LONGINUS: crit = sacred wave 150% ──
    if (this.hasWeapon(char.id, 'longinus')) {
      const waveDmg = Math.floor(char.getOffensiveStat() * 1.5);
      events.push({ type: 'passive_aoe', charId: char.id, passive: 'longinus_wave', damage: waveDmg, radius: 250 });
    }
  }

  // ═══════════════════════════════════════════════════════
  // HOOK: ON KILL
  // ═══════════════════════════════════════════════════════
  onKill(char, target, events) {
    const s = this.state.get(char.id);
    if (!s) return;

    // ── FUREUR DU TITAN: +3 stacks on kill ──
    if (this.hasPassive(char.id, 'titan_fury')) {
      s.titanFuryStacks = Math.min(20, s.titanFuryStacks + 3);
    }

    // ── TEMPETE D'ACIER: +5% SPD per kill (max +25%) ──
    if (this.hasPassive(char.id, 'steel_storm')) {
      if (s.steelStormSpdBonus < 25) {
        s.steelStormSpdBonus += 5;
        char.addBuff('spd', Math.floor(char.spd * 0.05), 999, 'steel_storm_spd');
      }
    }

    // ── PACTE DE SANG: kill restores 10% max HP ──
    if (this.hasPassive(char.id, 'blood_pact')) {
      char.heal(Math.floor(char.maxHp * 0.10));
    }

    // ── NIDHOGG: Devoration stacks (+5% ATK, +3% lifesteal, max 5) ──
    if (this.hasWeapon(char.id, 'nidhogg')) {
      if (s.nidhoggStacks < 5) {
        s.nidhoggStacks++;
        char._lifesteal = (char._lifesteal || 0) + 3;
        const atkBonus = Math.floor(char.atk * 0.05 * s.nidhoggStacks);
        char.addBuff('atk', atkBonus, 999, 'nidhogg_devour');
        events.push({ type: 'passive_proc', charId: char.id, passive: 'nidhogg_stack', stacks: s.nidhoggStacks });
      }
    }

    // ── EXCALIBUR: auto-heal 3% max HP on kill ──
    if (this.hasWeapon(char.id, 'excalibur')) {
      char.heal(Math.floor(char.maxHp * 0.03));
    }

    // ── LAME FANTOME: kill resets longest CD skill ──
    if (this.hasPassive(char.id, 'ghost_blade')) {
      let longestIdx = -1;
      let longestCd = 0;
      for (let i = 0; i < char.skills.length; i++) {
        if (char.skills[i].cooldown > longestCd) {
          longestCd = char.skills[i].cooldown;
          longestIdx = i;
        }
      }
      if (longestIdx >= 0) {
        char.skills[longestIdx].cooldown = 0;
      }
    }

    // ── SANG DU GUERRIER (medium set): +3% ATK on kill (max +15%) ──
    if (this.hasPassive(char.id, 'warrior_blood')) {
      const currentBonus = s._warriorBloodStacks || 0;
      if (currentBonus < 5) {
        s._warriorBloodStacks = currentBonus + 1;
        char.addBuff('atk', Math.floor(char.atk * 0.03), 999, 'warrior_blood');
      }
    }

    // ── VOIX DU NEANT: DoT kill = AoE explosion ──
    if (this.hasPassive(char.id, 'void_voice') && s.voidVoiceDots.has(target.id)) {
      const aoeDmg = Math.floor(char.getOffensiveStat() * 2.0);
      events.push({ type: 'passive_aoe', charId: char.id, passive: 'void_voice_explode', damage: aoeDmg, radius: 120 });
      s.voidVoiceDots.delete(target.id);
    }

    // ── RAGNAROK: kill = reset hit counter ──
    if (this.hasWeapon(char.id, 'ragnarok')) {
      s.ragnarokHitCount = 0;
    }

    // ── MASAMUNE: kill = heal 10% + shield 5% ──
    if (this.hasWeapon(char.id, 'masamune')) {
      char.heal(Math.floor(char.maxHp * 0.10));
      events.push({ type: 'passive_proc', charId: char.id, passive: 'masamune_heal', message: 'Masamune: Heal 10% + bouclier!' });
    }

    // ── TYRFING: kill = +8% ATK +5% lifesteal (max 10 stacks) ──
    if (this.hasWeapon(char.id, 'tyrfing')) {
      if (s.tyrfingStacks < 10) {
        s.tyrfingStacks++;
        char._lifesteal = (char._lifesteal || 0) + 5;
        char.addBuff('atk', Math.floor(char.atk * 0.08 * s.tyrfingStacks), 999, 'tyrfing_curse');
        events.push({ type: 'passive_proc', charId: char.id, passive: 'tyrfing_stack', stacks: s.tyrfingStacks });
      }
    }

    // ── TACOS ETERNEL: kill = +10% all stats (stack infinite) ──
    if (this.hasWeapon(char.id, 'tacos_eternel')) {
      s.tacosStacks++;
      char.addBuff('atk', Math.floor(char.atk * 0.10), 999, 'tacos_power');
      char.addBuff('def', Math.floor(char.def * 0.10), 999, 'tacos_power');
      char.addBuff('spd', Math.floor(char.spd * 0.10), 999, 'tacos_power');
      events.push({ type: 'passive_proc', charId: char.id, passive: 'tacos_stack', stacks: s.tacosStacks, message: `Tacos Éternel: +${s.tacosStacks * 10}% tous stats!` });
      // At 5 stacks: AoE kebab 500%
      if (s.tacosStacks % 5 === 0) {
        const kebabDmg = Math.floor(char.getOffensiveStat() * 5.0);
        events.push({ type: 'passive_aoe', charId: char.id, passive: 'tacos_kebab', damage: kebabDmg, radius: 300 });
        events.push({ type: 'passive_proc', charId: char.id, passive: 'tacos_kebab', message: 'Tacos Éternel: AoE KEBAB 500%! 🌮' });
      }
    }

    // ── RAGE ETERNELLE: +3 stacks on kill ──
    if (this.has2pcPassive(char.id, 'eternal_rage_stack')) {
      s.eternalRageStacks = Math.min(15, s.eternalRageStacks + 3);
    }
  }

  // ═══════════════════════════════════════════════════════
  // HOOK: ON HEAL (healer heals ally)
  // Returns: { bonusHeal, shieldAmount }
  // ═══════════════════════════════════════════════════════
  onHeal(healer, target, healAmount, events) {
    const s = this.state.get(healer.id);
    if (!s) return { bonusHeal: 0, shieldAmount: 0 };
    let bonusHeal = 0;
    let shieldAmount = 0;

    // ── Apply heal bonus from sets ──
    const healBonus = healer._healBonus || 0;
    if (healBonus > 0) {
      bonusHeal += Math.floor(healAmount * healBonus / 100);
    }

    // ── SOUFFLE VITAL: overheal = shield (max 20% target HP) ──
    if (this.hasPassive(healer.id, 'vital_breath')) {
      const totalHeal = healAmount + bonusHeal;
      const overheal = Math.max(0, (target.hp + totalHeal) - target.maxHp);
      if (overheal > 0) {
        shieldAmount = Math.min(overheal, Math.floor(target.maxHp * 0.20));
        events.push({ type: 'passive_proc', charId: healer.id, passive: 'vital_shield', target: target.id, amount: shieldAmount });
      }
      // 15% chance crit heal (x2)
      if (Math.random() < 0.15) {
        bonusHeal += healAmount; // Double the base heal
        events.push({ type: 'passive_proc', charId: healer.id, passive: 'vital_crit_heal', target: target.id });
      }
    }

    // ── YGGDRASIL: splash heal to 2 nearby allies (30%) ──
    if (this.hasWeapon(healer.id, 'yggdrasil')) {
      const splashAmount = Math.floor((healAmount + bonusHeal) * 0.30);
      events.push({ type: 'passive_splash_heal', charId: healer.id, passive: 'yggdrasil_splash', amount: splashAmount, count: 2 });
    }

    // ── HARMONIE CELESTE: casting spell = +5% ATK to allies in 300px ──
    if (this.hasPassive(healer.id, 'celestial_harmony')) {
      events.push({ type: 'passive_proc', charId: healer.id, passive: 'harmony_atk_buff', radius: 300, value: 5 });
    }

    // ── CHAINES DU DESTIN 4pc: heal +30%, 10% crit heal x2 ──
    if (this.hasPassive(healer.id, 'chain_heal_crit')) {
      bonusHeal += Math.floor(healAmount * 0.30);
      if (Math.random() < 0.10) {
        bonusHeal += healAmount;
        events.push({ type: 'passive_proc', charId: healer.id, passive: 'chain_crit_heal', target: target.id });
      }
    }

    // ── BRISE GUERISSANTE 4pc: heal ally <40% HP → +20% SPD 5s + shield 10% healer maxHP ──
    if (this.hasPassive(healer.id, 'healing_breeze')) {
      const targetHpPct = target.hp / target.maxHp;
      if (targetHpPct < 0.40) {
        // SPD buff on target
        const spdBuff = Math.floor(target.spd * 0.20);
        target.addBuff('spd', spdBuff, 5, 'healing_breeze_spd');
        // Shield = 10% of HEALER's max HP
        const breezeShield = Math.floor(healer.maxHp * 0.10);
        shieldAmount += breezeShield;
        events.push({ type: 'passive_proc', charId: healer.id, passive: 'healing_breeze',
          target: target.id, message: `Brise Guerissante: ${target.name} +SPD + bouclier ${breezeShield}!` });
      }
    }

    // ── AME-NO-NUHOKO: Soins +50% ──
    if (this.hasWeapon(healer.id, 'amenonuhoko')) {
      bonusHeal += Math.floor(healAmount * 0.50);
    }

    return { bonusHeal, shieldAmount };
  }

  // ═══════════════════════════════════════════════════════
  // HOOK: ON TAKE DAMAGE (before damage is applied)
  // Returns: { damageReduction (flat amount to subtract) }
  // ═══════════════════════════════════════════════════════
  onTakeDamage(char, attacker, rawDamage, isCrit, events) {
    const s = this.state.get(char.id);
    if (!s) return { damageReduction: 0 };
    let damageReduction = 0;

    // ── AEGIS DU GARDIEN: absorb 15% of ally damage within 200px ──
    // (This is applied per-ally in the combat engine, not here)

    // ── BASTION ETERNEL: +1% DEF per hit taken (max +20%) ──
    if (this.hasPassive(char.id, 'eternal_bastion')) {
      const currentBonus = s._bastionDefStacks || 0;
      if (currentBonus < 20) {
        s._bastionDefStacks = currentBonus + 1;
        // Permanent DEF increase for this combat
        char.def = Math.floor(char.def * 1.01);
      }
    }

    // ── CUIRASSE DE FER: reduce crit damage taken by 25% ──
    if (this.hasPassive(char.id, 'iron_guard') && isCrit) {
      damageReduction += Math.floor(rawDamage * 0.25);
    }

    // ── ECAILLES DE DRAKE: reduce AoE damage by 15% ──
    // (AoE flag would need to be passed — simplified: checked separately in pattern damage)

    // ── AEGIS WEAPON: reduce all damage by 25% ──
    if (this.hasWeapon(char.id, 'aegis_weapon')) {
      damageReduction += Math.floor(rawDamage * 0.25);
    }

    // ── PACTE DE SANG: HP < 50% = ATK +30% ──
    if (this.hasPassive(char.id, 'blood_pact')) {
      const hpRatio = char.hp / char.maxHp;
      if (hpRatio < 0.50) {
        // Add ATK buff if not already active
        if (!char.buffs.find(b => b.source === 'blood_pact_low_hp')) {
          const bonus = Math.floor(char.atk * 0.30);
          char.addBuff('atk', bonus, 999, 'blood_pact_low_hp');
          char._lifesteal = (char._lifesteal || 0) + 20;
          events.push({ type: 'passive_proc', charId: char.id, passive: 'blood_pact_rage', message: 'Pacte de Sang: ATK +30%!' });
        }
      }
    }

    // ── VOILE DE L'OMBRE 2pc: 12% dodge ──
    if (this.has2pcPassive(char.id, 'shadow_dodge') && Math.random() < 0.12) {
      damageReduction = rawDamage; // Full dodge
      events.push({ type: 'passive_proc', charId: char.id, passive: 'shadow_dodge_proc', message: 'Voile: Esquive!' });
      // 4pc: counter-attack on dodge
      if (this.hasPassive(char.id, 'shadow_counter') && attacker) {
        const counterDmg = Math.floor(char.getOffensiveStat() * 0.80);
        events.push({ type: 'passive_aoe', charId: char.id, passive: 'shadow_counter', damage: counterDmg, radius: 0, target: attacker.id });
      }
    }

    // ── GARDIEN CELESTE: shield absorbs damage ──
    if (s.celestialShieldActive && s.celestialShieldHp > 0) {
      const absorbed = Math.min(s.celestialShieldHp, rawDamage - damageReduction);
      s.celestialShieldHp -= absorbed;
      damageReduction += absorbed;
      if (s.celestialShieldHp <= 0) {
        s.celestialShieldActive = false;
        // 4pc: shield broken = heal 30% + DEF +20% 10s
        if (this.hasPassive(char.id, 'celestial_wrath')) {
          char.heal(Math.floor(char.maxHp * 0.30));
          char.addBuff('def', Math.floor(char.def * 0.20), 10, 'celestial_wrath');
          events.push({ type: 'passive_proc', charId: char.id, passive: 'celestial_shield_break', message: 'Gardien Celeste: Bouclier brise! Heal + DEF!' });
        }
      }
    }

    // ── BURNING CURSE: DMG taken +20% ──
    if (char._curseDmgTaken) {
      damageReduction -= Math.floor(rawDamage * char._curseDmgTaken / 100); // Negative = more damage
    }

    // ── FUREUR DU DESESPOIR 4pc: <25% HP = guaranteed crit (handled in checkGuaranteedCrit) ──
    // DEF ignore handled via bonusDamage in onHit

    // ── BURNING CURSE 4pc rescue: heal 25% if <25% HP (1x) ──
    if (this.hasPassive(char.id, 'enhanced_curse') && !s.curseRescueUsed) {
      if (char.hp / char.maxHp < 0.25) {
        s.curseRescueUsed = true;
        char.heal(Math.floor(char.maxHp * 0.25));
        events.push({ type: 'passive_proc', charId: char.id, passive: 'curse_rescue', message: 'Burning Curse: Rescue!' });
      }
    }

    // ── SC WEAPON: KATANA Z — counter-attack + stack persistence ──
    if (this.hasScWeapon(char.id, 'katana_z_fury') && rawDamage > 0 && char.alive) {
      // 50% counter-attack
      if (Math.random() < SC_WEAPON.KATANA_Z_COUNTER_CHANCE && attacker) {
        const counterDmg = Math.max(1, Math.floor(char.getOffensiveStat() * SC_WEAPON.KATANA_Z_COUNTER_MULT));
        events.push({ type: 'passive_aoe', charId: char.id, passive: 'katana_z_counter', damage: counterDmg, radius: 0, target: attacker.id });
      }
      // 50% each stack survives damage
      if (s.katanaZStacks > 0) {
        let surviving = 0;
        for (let i = 0; i < s.katanaZStacks; i++) {
          if (Math.random() < SC_WEAPON.KATANA_Z_PERSIST_CHANCE) surviving++;
        }
        s.katanaZStacks = surviving;
      }
    }

    // ── SC WEAPON: KATANA V — shield absorbs 1 hit ──
    if (this.hasScWeapon(char.id, 'katana_v_chaos') && s.katanaVState?.shield && rawDamage > 0) {
      s.katanaVState.shield = false;
      damageReduction = rawDamage; // Full absorption
      events.push({ type: 'passive_proc', charId: char.id, passive: 'katana_v_shield_absorb', message: 'Katana V: Bouclier Divin absorbe le coup!' });
    }

    // ── SACRIFICE DU MARTYR 4pc: ally <30% HP = heal 20% (1x per ally) ──
    // (Checked in tick for all allies)

    return { damageReduction };
  }

  // ═══════════════════════════════════════════════════════
  // HOOK: ON DEATH (character reaches 0 HP)
  // Returns: { preventDeath: boolean, rezHpPercent: number }
  // ═══════════════════════════════════════════════════════
  onDeath(char, attacker, events) {
    const s = this.state.get(char.id);
    if (!s) return { preventDeath: false };

    // ── BASTION ETERNEL: passive rez (1x per combat) ──
    if (this.hasPassive(char.id, 'eternal_bastion') && !s.bastionRezUsed) {
      s.bastionRezUsed = true;
      events.push({ type: 'passive_proc', charId: char.id, passive: 'bastion_rez', message: 'Bastion Eternel: Resurrection!' });
      return { preventDeath: true, rezHpPercent: 30, bonusDef: 50, bonusDefDuration: 10 };
    }

    // ── PACTE DE SANG: cancel lethal blow (CD 45s) ──
    if (this.hasPassive(char.id, 'blood_pact') && s.cdPacteSave <= 0) {
      s.cdPacteSave = 45;
      // Frenzy: ATK +50%, SPD +30% for 8s
      char.addBuff('atk', Math.floor(char.atk * 0.50), 8, 'blood_frenzy');
      char.addBuff('spd', Math.floor(char.spd * 0.30), 8, 'blood_frenzy');
      events.push({ type: 'passive_proc', charId: char.id, passive: 'blood_frenzy', message: 'Pacte de Sang: Frenzy!' });
      return { preventDeath: true, rezHpPercent: 15, bonusDef: 0, bonusDefDuration: 0 };
    }

    // ── EXCALIBUR: absorb 1 lethal blow (CD 60s) ──
    if (this.hasWeapon(char.id, 'excalibur') && s.cdExcaliburSave <= 0) {
      s.cdExcaliburSave = 60;
      events.push({ type: 'passive_proc', charId: char.id, passive: 'excalibur_save', message: 'Excalibur: Coup mortel absorbe!' });
      return { preventDeath: true, rezHpPercent: 10, bonusDef: 0, bonusDefDuration: 0 };
    }

    // ── MASAMUNE: absorb 2 lethal blows (CD 45s) ──
    if (this.hasWeapon(char.id, 'masamune') && s.masamuneSavesLeft > 0 && s.masamuneSaveCD <= 0) {
      s.masamuneSavesLeft--;
      s.masamuneSaveCD = 45;
      events.push({ type: 'passive_proc', charId: char.id, passive: 'masamune_save', message: `Masamune: Coup mortel absorbe! (${s.masamuneSavesLeft} restant)` });
      return { preventDeath: true, rezHpPercent: 15, bonusDef: 0, bonusDefDuration: 0 };
    }

    // ── TYRFING: HP < 30% = ATK x2 + invincible 3s (CD 60s) ──
    if (this.hasWeapon(char.id, 'tyrfing') && s.tyrfingInvincibleCD <= 0) {
      s.tyrfingInvincibleCD = 60;
      char.addBuff('atk', Math.floor(char.atk * 1.0), 3, 'tyrfing_rage');
      events.push({ type: 'passive_proc', charId: char.id, passive: 'tyrfing_rage', message: 'Tyrfing: ATK x2 + Invincible 3s!' });
      return { preventDeath: true, rezHpPercent: 25, bonusDef: 100, bonusDefDuration: 3 };
    }

    // ── SIPHON VITAL 4pc: <30% HP = lifesteal 100% for 2 ticks (CD 10s) ──
    if (this.hasPassive(char.id, 'vital_surge') && s.siphonEmergencyCD <= 0) {
      if (char.hp / char.maxHp < 0.30) {
        s.siphonEmergencyCD = 10;
        char._lifesteal = (char._lifesteal || 0) + 100;
        s.siphonEmergencyActive = true;
        events.push({ type: 'passive_proc', charId: char.id, passive: 'siphon_emergency', message: 'Siphon Vital: Lifesteal 100%!' });
        return { preventDeath: true, rezHpPercent: 5, bonusDef: 0, bonusDefDuration: 0 };
      }
    }

    // ── AEGIS WEAPON: ally death = +30% ATK, +20% DEF for allies ──
    if (attacker) {
      for (const [charId, cs] of this.state) {
        if (charId !== char.id && cs.weaponDef?.id === 'aegis_weapon') {
          events.push({ type: 'passive_proc', charId, passive: 'aegis_ally_death', message: 'Aegis: Allie tombe! ATK +30%!' });
        }
      }
    }

    // ── AME-NO-NUHOKO: resurrect 1 ally per combat ──
    for (const [charId, cs] of this.state) {
      if (charId === char.id) continue;
      if (cs.weaponDef?.id !== 'amenonuhoko' || cs.amenoRezUsed) continue;
      const holder = this.findChar(charId);
      if (!holder || !holder.alive) continue;
      cs.amenoRezUsed = true;
      events.push({ type: 'passive_proc', charId, passive: 'ameno_rez', message: `Ame-no-nuhoko: Resurrection de ${char.name}!` });
      return { preventDeath: true, rezHpPercent: 40, bonusDef: 0, bonusDefDuration: 0 };
    }

    // ── SC WEAPON: GUL'DAN — resurrect first dead ally (once per combat) ──
    // When any ally dies, a Gul'dan holder can rez them
    for (const [charId, cs] of this.state) {
      if (charId === char.id) continue;
      if (cs.scWeaponPassive !== 'guldan_halo' || !cs.guldanState) continue;
      if (cs.guldanState.divinUsed) continue;
      const holder = this.findChar(charId);
      if (!holder || !holder.alive) continue;
      cs.guldanState.divinUsed = true;
      events.push({ type: 'passive_proc', charId, passive: 'guldan_rez', message: `Gul'dan Halo Divin: Resurrection de ${char.name}!` });
      return { preventDeath: true, rezHpPercent: 50, bonusDef: 0, bonusDefDuration: 0 };
    }

    return { preventDeath: false };
  }

  // ═══════════════════════════════════════════════════════
  // CHECK: Guaranteed crit (for passives that force crits)
  // ═══════════════════════════════════════════════════════
  checkGuaranteedCrit(charId) {
    const s = this.state.get(charId);
    if (!s) return false;

    // Fureur du Titan burst window
    if (s.titanFuryCritTimer > 0) return true;

    // Gungnir periodic guaranteed crit
    if (this.hasWeapon(charId, 'gungnir') && s.cdGungnirCrit <= 0) {
      s.cdGungnirCrit = 15; // Reset 15s CD
      return true;
    }

    // Ailes du Vent: first attack = crit
    if (this.hasPassive(charId, 'wind_rush') && s.windRushFirstAttack) {
      return true;
    }

    // Rage Eternelle: burst window
    if (s.eternalRageCritTimer > 0) return true;

    // Flamme Interieure 4pc: at 10 stacks guaranteed crit
    if (this.hasPassive(charId, 'inner_flame_release') && s.innerFlameStacks >= 10) return true;

    // Fureur du Desespoir 4pc: <25% HP = guaranteed crit
    if (this.hasPassive(charId, 'last_stand')) {
      const char = this.findChar(charId);
      if (char && char.hp / char.maxHp < 0.25) return true;
    }

    // Resonance Arcanique 4pc: mana > 60% = guaranteed crit
    if (this.hasPassive(charId, 'arcane_adaptive')) {
      const char = this.findChar(charId);
      if (char && char.mana / char.maxMana > 0.60) return true;
    }

    return false;
  }

  // ═══════════════════════════════════════════════════════
  // HOOK: ON SKILL CAST (mana cost modification)
  // Returns: { freeCast: boolean }
  // ═══════════════════════════════════════════════════════
  onSkillCast(char, skill, events) {
    const s = this.state.get(char.id);
    if (!s) return { freeCast: false };

    // ── NOVA ARCANIQUE: 4th spell = free + x2 damage ──
    if (this.hasPassive(char.id, 'arcane_nova')) {
      s.arcaneNovaSpellCount++;
      if (s.arcaneNovaSpellCount >= 4) {
        s.arcaneNovaSpellCount = 0;
        events.push({ type: 'passive_proc', charId: char.id, passive: 'arcane_nova_4th', message: 'Nova Arcanique: Sort x2 gratuit!' });
        return { freeCast: true, doubleDamage: true };
      }
    }

    // ── BRUME MYSTIQUE: 10% chance free cast ──
    if (this.hasPassive(char.id, 'mystic_mist') && Math.random() < 0.10) {
      events.push({ type: 'passive_proc', charId: char.id, passive: 'mystic_free', message: 'Brume Mystique: Sort gratuit!' });
      return { freeCast: true };
    }

    // ── THYRSUS: 20% chance free cast ──
    if (this.hasWeapon(char.id, 'thyrsus') && Math.random() < 0.20) {
      events.push({ type: 'passive_proc', charId: char.id, passive: 'thyrsus_free', message: 'Thyrsus: Sort gratuit!' });
      return { freeCast: true };
    }

    // ── EA STAFF: 30% chance free cast + Mana > 90%: +40% DMG ──
    if (this.hasWeapon(char.id, 'ea_staff')) {
      if (Math.random() < 0.30) {
        events.push({ type: 'passive_proc', charId: char.id, passive: 'ea_free', message: 'Ea: Sort gratuit!' });
        return { freeCast: true, doubleDamage: char.mana / char.maxMana > 0.90 };
      }
      if (char.mana / char.maxMana > 0.90) {
        return { freeCast: false, doubleDamage: true };
      }
    }

    // ── ECHO TEMPOREL 4pc: every 3 spells, next = free ──
    if (this.hasPassive(char.id, 'echo_free_mana')) {
      s.echoSpellCount++;
      if (s.echoSpellCount >= 3) {
        s.echoSpellCount = 0;
        events.push({ type: 'passive_proc', charId: char.id, passive: 'echo_free', message: 'Echo Temporel: Sort gratuit!' });
        return { freeCast: true };
      }
    }

    // ── IRON WILL 4pc: DEF +5% per skill (max 5x), skill DMG +50% ──
    if (this.hasPassive(char.id, 'iron_will')) {
      if (s.ironWillStacks < 5) {
        s.ironWillStacks++;
        char.def = Math.floor(char.def * 1.05);
      }
      // DMG bonus handled via getAtkMultiplier
    }

    // ── CHAOTIC INFAMY: stack basic DMG per skill ──
    if (this.has2pcPassive(char.id, 'infamy_stack') || this.hasPassive(char.id, 'enhanced_infamy')) {
      s.infamyStacks = Math.min(20, s.infamyStacks + 1);
      // 4pc: mana +5% (CD 8s)
      if (this.hasPassive(char.id, 'enhanced_infamy') && s.infamyManaCD <= 0) {
        s.infamyManaCD = 8;
        char.mana = Math.min(char.maxMana, char.mana + Math.floor(char.maxMana * 0.05));
      }
    }

    // ── ESPRIT TRANSCENDANT 2pc: stack INT +2% per skill (max 10) ──
    if (this.has2pcPassive(char.id, 'transcendent_stack')) {
      s.transcendentStacks = Math.min(10, s.transcendentStacks + 1);
      if (char.int) char.int = Math.floor(char.int * 1.02);
    }
    // 4pc: at 10 stacks ignore 25% DEF + DMG x1.5, reset
    if (this.hasPassive(char.id, 'transcendent_release') && s.transcendentStacks >= 10) {
      s.transcendentStacks = 0;
      events.push({ type: 'passive_proc', charId: char.id, passive: 'transcendent_burst', message: 'Esprit Transcendant: DMG x1.5!' });
      return { freeCast: false, doubleDamage: true, defIgnore: 0.25 };
    }

    // ── SAGESSE ANCIENNE 4pc: stack INT +3% per skill (max 10). At 10: ignore 20% DEF + reset ──
    if (this.hasPassive(char.id, 'ancient_wisdom')) {
      s.wisdomStacks = Math.min(10, s.wisdomStacks + 1);
      if (char.int) char.int = Math.floor(char.int * 1.03);
      if (s.wisdomStacks >= 10) {
        s.wisdomStacks = 0;
        events.push({ type: 'passive_proc', charId: char.id, passive: 'ancient_wisdom_burst', message: 'Sagesse Ancienne: Ignore 20% DEF!' });
        return { freeCast: false, defIgnore: 0.20 };
      }
    }

    // ── TEMPETE ARCANE 4pc: mana plein = next skill x2 DMG (CD 5 casts) ──
    if (this.hasPassive(char.id, 'arcane_overload')) {
      if (s.arcaneOverloadCD > 0) {
        s.arcaneOverloadCD--;
      } else if (char.mana >= char.maxMana * 0.95) {
        s.arcaneOverloadCD = 5;
        events.push({ type: 'passive_proc', charId: char.id, passive: 'arcane_overload', message: 'Tempete Arcane: Skill x2!' });
        return { freeCast: false, doubleDamage: true };
      }
    }

    // ── Mana cost reduction ──
    const manaCostReduce = char._manaCostReduce || 0;
    if (manaCostReduce > 0) {
      return { freeCast: false, manaCostMult: 1 - manaCostReduce / 100 };
    }

    return { freeCast: false };
  }

  // ═══════════════════════════════════════════════════════
  // TICK — periodic effects (called each combat tick)
  // ═══════════════════════════════════════════════════════
  tick(dt, characters, enemies, events) {
    for (const char of characters) {
      if (!char.alive) continue;
      const s = this.state.get(char.id);
      if (!s) continue;

      // ── Decrease cooldowns ──
      if (s.titanFuryCritTimer > 0) s.titanFuryCritTimer -= dt;
      if (s.cdPacteSave > 0) s.cdPacteSave -= dt;
      if (s.cdExcaliburSave > 0) s.cdExcaliburSave -= dt;
      if (s.cdGungnirCrit > 0) s.cdGungnirCrit -= dt;
      if (s.cdHarmonieMegaHeal > 0) s.cdHarmonieMegaHeal -= dt;
      if (s.eternalRageCritTimer > 0) s.eternalRageCritTimer -= dt;
      if (s.siphonEmergencyCD > 0) s.siphonEmergencyCD -= dt;
      if (s.infamyManaCD > 0) s.infamyManaCD -= dt;
      // Phase 2 weapon cooldowns
      if (s.gaeDashTimer > 0) s.gaeDashTimer -= dt;
      if (s.masamuneSaveCD > 0) s.masamuneSaveCD -= dt;
      if (s.tyrfingInvincibleCD > 0) s.tyrfingInvincibleCD -= dt;
      if (s.arcaneAdaptiveRegenCD > 0) s.arcaneAdaptiveRegenCD -= dt;
      for (const [targetId, cd] of s.cdVitalAutoHeal) {
        s.cdVitalAutoHeal.set(targetId, cd - dt);
        if (cd - dt <= 0) s.cdVitalAutoHeal.delete(targetId);
      }

      // ── VOIX DU NEANT: DoT ticks ──
      if (this.hasPassive(char.id, 'void_voice')) {
        for (const [targetId, dot] of s.voidVoiceDots) {
          dot.timer -= dt;
          if (dot.timer <= 0) {
            s.voidVoiceDots.delete(targetId);
            continue;
          }
          // Find target and apply DoT damage
          const target = enemies.find(e => e.id === targetId && e.alive);
          if (target) {
            const dotDmg = Math.floor(char.getOffensiveStat() * 0.03 * dot.stacks);
            if (target.takeDamage) target.takeDamage(dotDmg);
            // 3 stacks debuff: +25% damage from all sources (applied via target mark)
            if (dot.stacks >= 3) {
              target._voidVulnerable = true;
            }
          }
        }
      }

      // ── GAE BOLG: dash + AoE 200% every 10s ──
      if (this.hasWeapon(char.id, 'gae_bolg') && s.gaeDashTimer <= 0 && char.alive) {
        s.gaeDashTimer = 10;
        const dashDmg = Math.floor(char.getOffensiveStat() * 2.0);
        events.push({ type: 'passive_aoe', charId: char.id, passive: 'gae_bolg_dash', damage: dashDmg, radius: 300 });
        events.push({ type: 'passive_proc', charId: char.id, passive: 'gae_bolg_dash', message: 'Gáe Bolg: Dash + AoE!' });
      }

      // ── HARMONIE CELESTE: mega-heal every 30s ──
      if (this.hasPassive(char.id, 'celestial_harmony') && s.cdHarmonieMegaHeal <= 0) {
        s.cdHarmonieMegaHeal = 30;
        events.push({ type: 'passive_proc', charId: char.id, passive: 'harmony_mega_heal', message: 'Harmonie Celeste: Mega-soin!' });
        // Heal all allies 10% max HP
        for (const ally of characters) {
          if (ally.alive) {
            ally.heal(Math.floor(ally.maxHp * 0.10));
          }
        }
      }

      // ── SOUFFLE VITAL: auto-heal allies < 25% HP (CD 12s per target) ──
      if (this.hasPassive(char.id, 'vital_breath')) {
        for (const ally of characters) {
          if (!ally.alive || ally.hp / ally.maxHp >= 0.25) continue;
          const cd = s.cdVitalAutoHeal.get(ally.id) || 0;
          if (cd <= 0) {
            const healAmt = Math.floor(ally.maxHp * 0.15);
            ally.heal(healAmt);
            s.cdVitalAutoHeal.set(ally.id, 12);
            events.push({ type: 'passive_proc', charId: char.id, passive: 'vital_auto_heal', target: ally.id, amount: healAmt });
          }
        }
      }

      // ── PLUMES DE PHENIX (medium): HP < 40% = regen 2% HP/5s ──
      if (this.hasPassive(char.id, 'phoenix_regen') && char.hp / char.maxHp < 0.40) {
        // Tick every 5s (approximate with dt)
        if (!s._phoenixTimer) s._phoenixTimer = 0;
        s._phoenixTimer += dt;
        if (s._phoenixTimer >= 5) {
          s._phoenixTimer = 0;
          char.heal(Math.floor(char.maxHp * 0.02));
        }
      }

      // ── RONCE VIVANTE (medium): reflect 8% damage ──
      // (Handled in onTakeDamage via events)

      // ── LIEN DE MEUTE: 3 hunters same player alive = ATK/DEF +10% ──
      if (this.hasPassive(char.id, 'pack_bond')) {
        const samePlayer = characters.filter(c => c.alive && c.username === char.username);
        if (samePlayer.length >= 3 && !char.buffs.find(b => b.source === 'pack_bond')) {
          char.addBuff('atk', Math.floor(char.atk * 0.10), 5, 'pack_bond');
          char.addBuff('def', Math.floor(char.def * 0.10), 5, 'pack_bond');
        }
      }

      // ── EQUILIBRE SUPREME 4pc: every 20s all stats +10% for 8s ──
      if (this.hasPassive(char.id, 'supreme_balance')) {
        s.equilibreTimer += dt;
        if (s.equilibreTimer >= 20) {
          s.equilibreTimer = 0;
          char.addBuff('atk', Math.floor(char.atk * 0.10), 8, 'supreme_balance');
          char.addBuff('def', Math.floor(char.def * 0.10), 8, 'supreme_balance');
          char.addBuff('spd', Math.floor(char.spd * 0.10), 8, 'supreme_balance');
          events.push({ type: 'passive_proc', charId: char.id, passive: 'supreme_balance_tick', message: 'Equilibre Supreme: All stats +10%!' });
        }
      }

      // ── SACRIFICE DU MARTYR 4pc: ally <30% HP = heal 20% (1x/ally) ──
      if (this.hasPassive(char.id, 'martyr_heal')) {
        for (const ally of characters) {
          if (!ally.alive || ally.id === char.id) continue;
          if (ally.hp / ally.maxHp < 0.30 && !s.martyrHealUsed.get(ally.id)) {
            s.martyrHealUsed.set(ally.id, true);
            ally.heal(Math.floor(ally.maxHp * 0.20));
            events.push({ type: 'passive_proc', charId: char.id, passive: 'martyr_heal', target: ally.id, message: 'Sacrifice du Martyr: Soin allie!' });
          }
        }
      }

      // ── RESONANCE ARCANIQUE 4pc: mana < 30% = regen x3 3s (CD 20s) ──
      if (this.hasPassive(char.id, 'arcane_adaptive') && s.arcaneAdaptiveRegenCD <= 0) {
        if (char.mana / char.maxMana < 0.30) {
          s.arcaneAdaptiveRegenCD = 20;
          s.arcaneAdaptiveRegenActive = true;
          events.push({ type: 'passive_proc', charId: char.id, passive: 'arcane_regen_burst', message: 'Resonance Arcanique: Regen x3!' });
        }
      }
      // Apply regen x3 when active (3s window)
      if (s.arcaneAdaptiveRegenActive && s.arcaneAdaptiveRegenCD > 17) {
        char.mana = Math.min(char.maxMana, char.mana + Math.floor(char.maxMana * 0.05 * dt)); // Aggressive regen
      } else {
        s.arcaneAdaptiveRegenActive = false;
      }

      // ── SOUFFLE CELESTE 4pc: self +30% SPD burst every 20s for 3s ──
      if (this.hasPassive(char.id, 'celestial_speed')) {
        if (s.celestialSpdBurstCD > 0) s.celestialSpdBurstCD -= dt;
        if (s.celestialSpdTimer > 0) {
          s.celestialSpdTimer -= dt;
          if (s.celestialSpdTimer <= 0) {
            // Burst ended, remove SPD buff
            char.spd = Math.floor(char.spd / 1.30);
          }
        } else if (s.celestialSpdBurstCD <= 0) {
          s.celestialSpdBurstCD = 20;
          s.celestialSpdTimer = 3;
          char.spd = Math.floor(char.spd * 1.30);
          events.push({ type: 'passive_proc', charId: char.id, passive: 'celestial_speed_burst', message: 'Souffle Celeste: SPD +30% (3s)!' });
        }
      }

      // ── PURIFICATION SACREE 4pc: cleanse 1 debuff from team every 8s ──
      if (this.hasPassive(char.id, 'sacred_purify')) {
        s.purifyTimer += dt;
        if (s.purifyTimer >= 8) {
          s.purifyTimer = 0;
          for (const ally of characters) {
            if (!ally.alive || ally.username !== char.username) continue;
            const removed = ally.cleanse();
            if (removed) {
              const healed = ally.heal(Math.floor(ally.maxHp * 0.05));
              events.push({ type: 'passive_proc', charId: char.id, passive: 'sacred_purify', target: ally.id,
                message: `Purification: Cleanse ${removed.type}${healed > 0 ? ` + heal ${healed}` : ''}!` });
            }
          }
        }
      }

      // ── SIPHON VITAL: deactivate emergency lifesteal after 2s ──
      if (s.siphonEmergencyActive && s.siphonEmergencyCD <= 8) {
        // Was at CD=10, now 2s passed
        s.siphonEmergencyActive = false;
        char._lifesteal = Math.max(0, (char._lifesteal || 0) - 100);
      }

      // ── SC WEAPON: SHADOW SILENCE — decay stack timers ──
      if (this.hasScWeapon(char.id, 'shadow_silence') && s.shadowSilenceStacks.length > 0) {
        for (let i = s.shadowSilenceStacks.length - 1; i >= 0; i--) {
          s.shadowSilenceStacks[i].timer -= dt;
          if (s.shadowSilenceStacks[i].timer <= 0) {
            s.shadowSilenceStacks.splice(i, 1);
          }
        }
      }

      // ── SC WEAPON: KATANA V — DoT tick damage on enemies ──
      if (this.hasScWeapon(char.id, 'katana_v_chaos') && s.katanaVState && s.katanaVState.dots > 0) {
        s.katanaVState.dotTickTimer += dt;
        if (s.katanaVState.dotTickTimer >= SC_WEAPON.KATANA_V_DOT_TICK_INTERVAL) {
          s.katanaVState.dotTickTimer = 0;
          // DoT damages closest alive enemy
          const target = enemies.find(e => e.alive);
          if (target) {
            const baseStat = char.maxMana || char.getOffensiveStat();
            const dotDmg = Math.max(1, Math.floor(baseStat * SC_WEAPON.KATANA_V_DOT_PCT * s.katanaVState.dots));
            if (target.takeDamage) {
              target.takeDamage(dotDmg);
            } else {
              target.hp = Math.max(0, target.hp - dotDmg);
              if (target.hp <= 0) target.alive = false;
            }
            char.stats.damageDealt += dotDmg;
          }
        }
      }

      // ── SC WEAPON: GUL'DAN — stun chance per tick (based on heal stacks) ──
      if (this.hasScWeapon(char.id, 'guldan_halo') && s.guldanState && s.guldanState.healStacks > 0) {
        // Small stun chance per tick based on stacks
        for (let i = 0; i < Math.min(s.guldanState.healStacks, 5); i++) {
          if (Math.random() < SC_WEAPON.GULDAN_STUN_CHANCE * dt) {
            // Apply stun to boss
            const target = enemies.find(e => e.alive);
            if (target && !target._stunImmune) {
              target.addDebuff?.('stun', 0, 0.5, 'guldan_stun');
              events.push({ type: 'passive_proc', charId: char.id, passive: 'guldan_stun', message: `Gul'dan: Stun!` });
            }
            break; // Max 1 stun per tick
          }
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════════
  // HELPER: Get ATK multiplier from stacks (Titan Fury, etc.)
  // ═══════════════════════════════════════════════════════
  getAtkMultiplier(charId) {
    const s = this.state.get(charId);
    if (!s) return 1.0;
    let mult = 1.0;

    // Fureur du Titan: +2% per stack
    if (this.hasPassive(charId, 'titan_fury')) {
      mult += s.titanFuryStacks * 0.02;
    }

    // Nova Arcanique: mana > 80% = +15% damage
    if (this.hasPassive(charId, 'arcane_nova')) {
      const char = this.findChar(charId);
      if (char && char.mana / char.maxMana > 0.80) {
        mult += 0.15;
      }
    }

    // Thyrsus: mana > 80% = +20% damage
    if (this.hasWeapon(charId, 'thyrsus')) {
      const char = this.findChar(charId);
      if (char && char.mana / char.maxMana > 0.80) {
        mult += 0.20;
      }
    }

    // Iron Will 4pc: skill DMG +50%
    if (this.hasPassive(charId, 'iron_will')) {
      mult += 0.50;
    }

    // Chaotic Infamy: basic DMG bonus from stacks
    if (s.infamyStacks > 0) {
      const pctPerStack = this.hasPassive(charId, 'enhanced_infamy') ? 0.025 : 0.015;
      mult += s.infamyStacks * pctPerStack;
    }

    // SC WEAPON: GUL'DAN — accumulated ATK bonus
    if (this.hasScWeapon(charId, 'guldan_halo') && s.guldanState) {
      mult += s.guldanState.atkBonus;
      // SPD stacks also add a small ATK bonus (10% of SPD boost)
      if (s.guldanState.spdStacks > 0) {
        mult += s.guldanState.spdStacks * SC_WEAPON.GULDAN_SPD_BOOST * 0.1;
      }
    }

    // Elem/All DMG bonuses (from set stats)
    const char = this.findChar(charId);
    if (char) {
      if (char._elemDmgBonus) mult += char._elemDmgBonus / 100;
      if (char._allDmgBonus) mult += char._allDmgBonus / 100;
    }

    return mult;
  }

  // ═══════════════════════════════════════════════════════
  // HELPER: Check if target is Void Vulnerable (+25% dmg)
  // ═══════════════════════════════════════════════════════
  isVoidVulnerable(targetId) {
    for (const [, s] of this.state) {
      const dot = s.voidVoiceDots?.get(targetId);
      if (dot && dot.stacks >= 3) return true;
    }
    return false;
  }

  // Store character reference for lookups
  _characters = [];
  setCharacters(chars) { this._characters = chars; }
  findChar(charId) { return this._characters.find(c => c.id === charId); }
  getAllAliveAllies(excludeId) { return this._characters.filter(c => c.id !== excludeId && c.alive); }
}
