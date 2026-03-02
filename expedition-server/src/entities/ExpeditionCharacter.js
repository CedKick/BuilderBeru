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

    if (precomputedStats && precomputedStats.hp) {
      // Use pre-computed full stats from client (scaled for expedition)
      this.maxHp = Math.floor(precomputedStats.hp * STAT_SCALE.hp);
      this.hp = this.maxHp;
      this.maxMana = Math.floor((precomputedStats.mana || 100) * STAT_SCALE.hp);
      this.mana = this.maxMana;
      this.atk = Math.floor(precomputedStats.atk * STAT_SCALE.atk);
      this.def = Math.floor(precomputedStats.def * STAT_SCALE.def);
      this.spd = Math.floor(precomputedStats.spd * STAT_SCALE.spd);
      this.crit = precomputedStats.crit * STAT_SCALE.crit;
      this.res = precomputedStats.res * STAT_SCALE.res;
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
    }

    // Skills (with runtime cooldown tracking)
    this.skills = hunterDef.skills.map(s => ({
      ...s,
      cooldown: 0,  // Current cooldown remaining (seconds)
    }));

    // Position (1D: X axis only)
    this.x = 0;
    this.targetX = 0;

    // State
    this.alive = true;
    this.diedThisCombat = false;  // For healer rez eligibility

    // Buffs: [{ type, value, duration, source }]
    this.buffs = [];

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

  // ── Movement ────────────────────────────────────────────

  getEffectiveAtk() {
    let total = this.atk;
    for (const b of this.buffs) {
      if (b.type === 'atk') total += b.value;
    }
    return Math.max(0, total);
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
      alive: this.alive,
      diedThisCombat: this.diedThisCombat,
      buffs: this.buffs,
      skills: this.skills.map(s => ({ name: s.name, cooldown: s.cooldown, cdMax: s.cdMax })),
      stats: { ...this.stats },
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
    char.alive = data.alive;
    char.diedThisCombat = data.diedThisCombat;
    char.buffs = data.buffs || [];
    if (data.skills) {
      for (let i = 0; i < char.skills.length && i < data.skills.length; i++) {
        char.skills[i].cooldown = data.skills[i].cooldown || 0;
      }
    }
    char.stats = data.stats || { damageDealt: 0, healingDone: 0, kills: 0, deaths: 0 };
    return char;
  }
}
