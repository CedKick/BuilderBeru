import { HUNTERS, hunterStatsAtLevel } from '../data/hunterData.js';
import { STAT_SCALE, ROLE_MAP, COMBAT } from '../config.js';

export class ExpeditionCharacter {
  /**
   * @param {string} username
   * @param {string} hunterId
   * @param {number} hunterLevel
   * @param {number} hunterStars
   * @param {object} [precomputedStats] - Full stats from client (includes artifacts, weapons, talents, account bonuses)
   */
  constructor(username, hunterId, hunterLevel, hunterStars, precomputedStats = null) {
    const hunterDef = HUNTERS[hunterId];
    if (!hunterDef) throw new Error(`Unknown hunter: ${hunterId}`);

    // Identity
    this.id = `${username}_${hunterId}`;
    this.username = username;
    this.hunterId = hunterId;
    this.name = hunterDef.name;
    this.hunterClass = hunterDef.class;
    this.element = hunterDef.element;
    this.rarity = hunterDef.rarity;
    this.role = ROLE_MAP[hunterDef.class] || 'frontline_dps';

    const isMage = hunterDef.class === 'mage';

    if (precomputedStats && precomputedStats.hp) {
      // Use pre-computed full stats from client AS-IS (already includes artifacts, talents, etc.)
      // No STAT_SCALE — these stats are final from the colosseum system
      this.maxHp = Math.floor(precomputedStats.hp);
      this.hp = this.maxHp;
      this.maxMana = Math.floor(precomputedStats.mana || 100);
      this.mana = this.maxMana;
      this.atk = Math.floor(precomputedStats.atk);
      this.def = Math.floor(precomputedStats.def);
      this.spd = Math.floor(precomputedStats.spd);
      this.crit = precomputedStats.crit;
      this.res = precomputedStats.res;
      // Mages scale on INT — use client INT if provided, fallback to ATK
      this.int = isMage ? Math.floor(precomputedStats.int || precomputedStats.atk) : 0;
    } else {
      // Fallback: simple computation from level + stars only
      const raw = hunterStatsAtLevel(hunterId, hunterLevel, hunterStars);
      this.maxHp = Math.floor(raw.hp * STAT_SCALE.hp);
      this.hp = this.maxHp;
      this.maxMana = hunterDef.class === 'support' ? 800 : 400;
      this.mana = this.maxMana;
      this.atk = Math.floor(raw.atk * STAT_SCALE.atk);
      this.def = Math.floor(raw.def * STAT_SCALE.def);
      this.spd = Math.floor(raw.spd * STAT_SCALE.spd);
      this.crit = raw.crit * STAT_SCALE.crit;
      this.res = raw.res * STAT_SCALE.res;
      // Mages fallback: use ATK as INT (no artifact data)
      this.int = isMage ? this.atk : 0;
    }

    // Store original base stats (NEVER modified — used for reset between combats)
    this._baseMaxHp = this.maxHp;
    this._baseAtk = this.atk;
    this._baseDef = this.def;
    this._baseSpd = this.spd;
    this._baseCrit = this.crit;
    this._baseRes = this.res;
    this._baseInt = this.int;
    this._baseMaxMana = this.maxMana;

    // Skills (with runtime cooldown tracking)
    this.skills = hunterDef.skills.map(s => ({
      ...s,
      cooldown: 0,  // Current cooldown remaining (seconds)
    }));

    // Megumin-style mana scaling: stays on ATK, not INT
    this.usesManaScaling = hunterDef.skills.some(s => s.manaScaling);

    // Position (2D)
    this.x = 0;
    this.y = 0;
    this.targetX = 0;

    // State
    this.alive = true;
    this.diedThisCombat = false;  // For healer rez eligibility

    // Buffs: [{ type, value, duration, source }]
    this.buffs = [];

    // Debuffs: [{ type, value, duration, source, stacks, maxStacks }]
    this.debuffs = [];

    // Expedition gear (loaded from inventory, used by PassiveEngine)
    this.expeditionGear = null;  // { sets: { setId: count }, weaponId: string|null }
    this.weaponEffects = [];     // Effects from equipped regular weapon
    this.scWeaponPassive = null; // SC weapon passive ID (sulfuras_fury, katana_v_chaos, etc.)

    // Auto-attack timer
    this.attackTimer = 0;
    const isRanged = this.role === 'backline_dps' || this.role === 'backline_heal';
    this.attackInterval = isRanged ? COMBAT.RANGED_ATTACK_INTERVAL : COMBAT.MELEE_ATTACK_INTERVAL;
    this.attackRange = isRanged ? COMBAT.RANGED_RANGE : COMBAT.MELEE_RANGE;

    // Combat stats tracking
    this.stats = {
      damageDealt: 0,
      healingDone: 0,
      kills: 0,
      deaths: 0,
    };
  }

  // ── Damage ──────────────────────────────────────────────

  takeDamage(amount) {
    if (!this.alive) return 0;

    // Apply DEF buff modifiers
    let effectiveDef = this.def;
    for (const b of this.buffs) {
      if (b.type === 'def') effectiveDef += b.value;
    }

    // DEF reduction: 100 / (100 + DEF)
    const reduction = COMBAT.DEF_CONSTANT / (COMBAT.DEF_CONSTANT + Math.max(0, effectiveDef));
    const finalDamage = Math.floor(amount * reduction);

    this.hp = Math.max(0, this.hp - finalDamage);
    if (this.hp <= 0) {
      this.alive = false;
      this.diedThisCombat = true;
      this.stats.deaths++;
    }
    return finalDamage;
  }

  heal(amount) {
    if (!this.alive) return 0;
    // Anti-heal debuff reduces healing (from boss phases/patterns)
    const antiHeal = this.getDebuffValue('anti_heal');
    if (antiHeal > 0) {
      amount = Math.floor(amount * Math.max(0, 1 - Math.min(antiHeal, 100) / 100));
    }
    const before = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    return this.hp - before;
  }

  // ── Buffs ───────────────────────────────────────────────

  addBuff(type, value, duration, source) {
    // Refresh if same type & source
    const existing = this.buffs.find(b => b.type === type && b.source === source);
    if (existing) {
      existing.value = value;
      existing.duration = duration;
    } else {
      this.buffs.push({ type, value, duration, source });
    }
  }

  updateBuffs(dt) {
    for (let i = this.buffs.length - 1; i >= 0; i--) {
      this.buffs[i].duration -= dt;
      if (this.buffs[i].duration <= 0) {
        this.buffs.splice(i, 1);
      }
    }
  }

  // ── Debuffs ──────────────────────────────────────────────

  addDebuff(type, value, duration, source, maxStacks = 1) {
    const existing = this.debuffs.find(d => d.type === type && d.source === source);
    if (existing) {
      if (maxStacks > 1 && existing.stacks < maxStacks) {
        existing.stacks++;
        existing.duration = Math.max(existing.duration, duration);
      } else {
        existing.duration = duration;
        existing.value = value;
      }
    } else {
      this.debuffs.push({ type, value, duration, source, stacks: 1, maxStacks });
    }
  }

  updateDebuffs(dt) {
    for (let i = this.debuffs.length - 1; i >= 0; i--) {
      this.debuffs[i].duration -= dt;
      if (this.debuffs[i].duration <= 0) {
        this.debuffs.splice(i, 1);
      }
    }
  }

  getDebuffValue(type) {
    let total = 0;
    for (const d of this.debuffs) {
      if (d.type === type) total += d.value * (d.stacks || 1);
    }
    return total;
  }

  isStunned() {
    return this.debuffs.some(d => d.type === 'stun' && d.duration > 0);
  }

  isSilenced() {
    return this.debuffs.some(d => d.type === 'silence' && d.duration > 0);
  }

  /** Remove one debuff (oldest first). Returns the removed debuff or null. */
  cleanse() {
    if (this.debuffs.length === 0) return null;
    return this.debuffs.shift();
  }

  // ── Cooldowns ───────────────────────────────────────────

  updateCooldowns(dt) {
    for (const skill of this.skills) {
      if (skill.cooldown > 0) {
        skill.cooldown = Math.max(0, skill.cooldown - dt);
      }
    }
  }

  // ── Mana ────────────────────────────────────────────────

  useMana(cost) {
    if (this.mana < cost) return false;
    this.mana -= cost;
    return true;
  }

  regenMana(amount) {
    this.mana = Math.min(this.maxMana, this.mana + amount);
  }

  // ── Rez (used at campfire) ──────────────────────────────

  resurrect(hpPercent) {
    if (this.alive) return;
    this.alive = true;
    this.hp = Math.floor(this.maxHp * hpPercent / 100);
    this.mana = Math.floor(this.maxMana * 0.3);
  }

  // ── Reset for next combat (prevents infinite stat stacking) ──

  resetForCombat() {
    // Restore ALL stats to original base values
    this.maxHp = this._baseMaxHp;
    this.atk = this._baseAtk;
    this.def = this._baseDef;
    this.spd = this._baseSpd;
    this.crit = this._baseCrit;
    this.res = this._baseRes;
    this.int = this._baseInt;
    this.maxMana = this._baseMaxMana;

    // Keep current HP/mana ratios (campfire already healed)
    this.hp = Math.min(this.hp, this.maxHp);
    this.mana = Math.min(this.mana, this.maxMana);

    // Clear ALL combat buffs and debuffs
    this.buffs = [];
    this.debuffs = [];

    // Reset skill cooldowns
    for (const skill of this.skills) {
      skill.cooldown = 0;
    }

    // Reset combat-specific tracking
    this.diedThisCombat = false;
    this.attackTimer = 0;
    this._ticksSinceSkill = 0;  // Reset idle mana regen tracker
  }

  // ── Movement ────────────────────────────────────────────

  getEffectiveAtk() {
    let total = this.atk;
    for (const b of this.buffs) {
      if (b.type === 'atk') total += b.value;
    }
    return Math.max(0, total);
  }

  getEffectiveInt() {
    let total = this.int || 0;
    for (const b of this.buffs) {
      if (b.type === 'int') total += b.value;
    }
    return Math.max(0, total);
  }

  // Mages use INT, everyone else uses ATK (except mana-scaling mages like Megumin)
  getOffensiveStat() {
    if (this.hunterClass === 'mage' && !this.usesManaScaling) {
      return this.getEffectiveInt();
    }
    return this.getEffectiveAtk();
  }

  // ── Serialization ───────────────────────────────────────

  serialize() {
    return {
      id: this.id,
      username: this.username,
      hunterId: this.hunterId,
      name: this.name,
      hunterClass: this.hunterClass,
      element: this.element,
      role: this.role,
      hp: this.hp,
      maxHp: this.maxHp,
      mana: this.mana,
      maxMana: this.maxMana,
      atk: this.atk,
      def: this.def,
      spd: this.spd,
      crit: this.crit,
      x: this.x,
      y: this.y,
      alive: this.alive,
      diedThisCombat: this.diedThisCombat,
      buffs: this.buffs,
      skills: this.skills.map(s => ({ name: s.name, cooldown: s.cooldown, cdMax: s.cdMax })),
      stats: { ...this.stats },
      debuffs: this.debuffs,
      _baseMaxHp: this._baseMaxHp,
      _baseAtk: this._baseAtk,
      _baseDef: this._baseDef,
      _baseSpd: this._baseSpd,
      _baseCrit: this._baseCrit,
      _baseRes: this._baseRes,
      _baseInt: this._baseInt,
      _baseMaxMana: this._baseMaxMana,
      expeditionGear: this.expeditionGear,
      weaponEffects: this.weaponEffects,
      scWeaponPassive: this.scWeaponPassive,
    };
  }

  // Restore from snapshot
  static deserialize(data) {
    const char = new ExpeditionCharacter(data.username, data.hunterId, 1, 0);
    // Override computed stats with saved state
    char.hp = data.hp;
    char.maxHp = data.maxHp;
    char.mana = data.mana;
    char.maxMana = data.maxMana;
    char.atk = data.atk;
    char.def = data.def;
    char.spd = data.spd;
    char.crit = data.crit;
    char.x = data.x;
    char.y = data.y || 0;
    char.alive = data.alive;
    char.diedThisCombat = data.diedThisCombat;
    char.buffs = data.buffs || [];
    if (data.skills) {
      for (let i = 0; i < char.skills.length && i < data.skills.length; i++) {
        char.skills[i].cooldown = data.skills[i].cooldown || 0;
      }
    }
    char.stats = data.stats || { damageDealt: 0, healingDone: 0, kills: 0, deaths: 0 };
    char.debuffs = data.debuffs || [];
    // Restore base stats for combat reset (fallback to current stats if missing from old snapshots)
    char._baseMaxHp = data._baseMaxHp || data.maxHp;
    char._baseAtk = data._baseAtk || data.atk;
    char._baseDef = data._baseDef || data.def;
    char._baseSpd = data._baseSpd || data.spd;
    char._baseCrit = data._baseCrit || data.crit;
    char._baseRes = data._baseRes || (data.res ?? 0);
    char._baseInt = data._baseInt || 0;
    char._baseMaxMana = data._baseMaxMana || data.maxMana;
    char.expeditionGear = data.expeditionGear || null;
    char.weaponEffects = data.weaponEffects || [];
    char.scWeaponPassive = data.scWeaponPassive || null;
    return char;
  }
}
