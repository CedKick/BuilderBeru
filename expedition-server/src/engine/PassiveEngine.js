import { ALL_SETS } from '../data/expeditionSets.js';
import { EXPEDITION_WEAPONS } from '../data/expeditionWeapons.js';
import { COMBAT } from '../config.js';

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

      this.state.set(char.id, {
        activeSets,         // [{ setId, setDef, pieces, has2pc, has4pc }]
        weaponDef,          // weapon definition or null
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
      });
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
    }
  }

  hasPassive(charId, passiveId) {
    const s = this.state.get(charId);
    if (!s) return false;
    return s.activeSets.some(set => set.has4pc && set.setDef.bonus4pc?.passive === passiveId);
  }

  hasWeapon(charId, weaponId) {
    const s = this.state.get(charId);
    return s?.weaponDef?.id === weaponId;
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

    // ── WIND RUSH (Ailes du Vent): first attack = guaranteed crit ──
    if (this.hasPassive(char.id, 'wind_rush') && s.windRushFirstAttack) {
      s.windRushFirstAttack = false;
      // The guaranteed crit is handled by checkGuaranteedCrit, mark is consumed
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

    // ── AEGIS WEAPON: ally death = +30% ATK, +20% DEF for allies ──
    if (attacker) {
      // Check all allies for Aegis weapon
      for (const [charId, cs] of this.state) {
        if (charId !== char.id && cs.weaponDef?.id === 'aegis_weapon') {
          events.push({ type: 'passive_proc', charId, passive: 'aegis_ally_death', message: 'Aegis: Allie tombe! ATK +30%!' });
        }
      }
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
}
