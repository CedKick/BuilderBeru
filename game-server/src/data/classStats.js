// ── Class Definitions ──
// Raid-scaled stats for Manaya boss fight
// ATK values designed for ~5,000-8,000 DPS per player against boss DEF 50

export const CLASS_STATS = {
  tank: {
    label: 'Tank',
    hp: 25000,
    mana: 400,
    atk: 4200,        // x10 then +20% (350 × 12)
    def: 300,
    spd: 160,
    crit: 10,
    res: 50,
    aggroMult: 3.0,
    color: '#3b82f6',
  },
  healer: {
    label: 'Healer',
    hp: 18000,
    mana: 800,
    atk: 400,         // x2 DPS buff
    def: 120,
    spd: 180,
    crit: 12,
    res: 60,
    aggroMult: 0.7,
    color: '#10b981',
  },
  dps_cac: {
    label: 'Warrior',
    hp: 22000,
    mana: 100,        // Rage: max 100, starts at 0, builds from basic attacks
    atk: 6120,        // +20% (5100 × 1.2)
    def: 150,
    spd: 200,
    crit: 32,
    res: 20,
    aggroMult: 1.0,
    color: '#ef4444',
    useRage: true,    // Uses rage resource (red bar, no passive regen)
  },
  dps_range: {
    label: 'Archer',
    hp: 14000,
    mana: 500,
    atk: 720,         // +20% (600 × 1.2)
    def: 80,
    spd: 190,
    crit: 22,
    res: 15,
    aggroMult: 1.0,
    color: '#f59e0b',
  },
  berserker: {
    label: 'Berserker',
    hp: 23000,
    mana: 400,
    atk: 4920,        // x6 DPS buff (820 × 6) — bourrin punitif = roi du DPS brut
    def: 140,
    spd: 210,
    crit: 28,
    res: 18,
    aggroMult: 1.1,
    color: '#dc2626',
  },
  mage: {
    label: 'Mage',
    hp: 13000,
    mana: 1000,
    atk: 780,         // +20% (650 × 1.2)
    def: 60,
    spd: 175,
    crit: 25,
    res: 20,
    aggroMult: 0.9,
    color: '#c084fc',
  },
};

// ── Skill Definitions ──
// Power values scaled up for raid damage output

export const CLASS_SKILLS = {
  tank: {
    basic: {
      name: 'Frappe de bouclier',
      power: 1200,         // x10 DPS buff (120 × 10)
      range: 70,
      hitbox: 'cone',
      coneAngle: 90,
      cooldown: 0.5,
      manaCost: 0,
      aggroBonus: 80,
      isBasic: true,
    },
    secondary: {
      name: 'Bloquer',
      type: 'block',
      damageReduction: 0.75,
      duration: 0,
      manaCost: 4,
      aggroPerSec: 100,
      speedMult: 0.3,
    },
    skillA: {
      name: 'Provocation',
      type: 'taunt',
      range: 300,
      cooldown: 10,
      manaCost: 40,
      aggroFlat: 8000,
      duration: 5,
    },
    skillB: {
      name: 'Bouclier Sacré',
      type: 'party_shield',
      range: 250,
      cooldown: 18,
      manaCost: 70,
      shieldHp: 3000,
      duration: 6,
    },
    ultimate: {
      name: 'Forteresse',
      type: 'invuln',
      cooldown: 50,
      manaCost: 120,
      duration: 4,
      aggroFlat: 15000,
    },
  },

  healer: {
    basic: {
      name: 'Trait de lumière',
      power: 1200,         // x10 DPS buff (120 × 10)
      range: 450,
      hitbox: 'projectile',
      projSpeed: 550,
      projRadius: 8,
      cooldown: 0.45,
      manaCost: 0,
      isBasic: true,
      manaOnHit: 25,       // Extra mana regen per hit (on top of base 8)
    },
    secondary: {
      name: 'Cercle de Soin',
      type: 'heal_zone',
      healPct: 0.10,       // 10% HP per tick (replaces flat healPower)
      range: 200,
      zoneRadius: 100,     // larger zone
      zoneDuration: 4.0,   // longer duration
      healTicks: 5,        // 5 ticks = 50% HP total
      cooldown: 10.0,      // 10s cooldown to prevent spam
      manaCost: 30,
    },
    skillA: {
      name: 'Soin de Zone',
      type: 'heal_aoe',
      healPct: 0.10,       // 10% HP instant to all in range
      range: 300,
      cooldown: 6,
      manaCost: 55,
      atkBuff: 0.25,       // +25% ATK to healed allies
      atkBuffDur: 10,      // 10 seconds
    },
    skillB: {
      name: 'Purification',
      type: 'cleanse',
      range: 350,
      cooldown: 10,
      manaCost: 40,
      removesDebuffs: true,
      dispelsBossRage: true,
      critBuff: 10,        // +10% crit rate to cleansed allies
      spdBuff: 0.10,       // +10% speed to cleansed allies
      buffDur: 10,         // 10 seconds
    },
    ultimate: {
      name: 'Résurrection Divine',
      type: 'resurrect',
      cooldown: 10,        // fast rez for bot survival
      manaCost: 100,
      healPercent: 0.6,
      range: 350,
      channelDuration: 4.0, // 4s channel - must stand still to cast
    },
  },

  dps_cac: {
    basic: {
      name: 'Combo de lames',
      power: 210,          // +30% (160 × 1.3)
      range: 80,
      hitbox: 'cone',
      coneAngle: 60,
      cooldown: 0.3,        // faster
      manaCost: 0,
      isBasic: true,
      rageGain: 18,        // +20% rage gen (15 → 18)
    },
    secondary: {
      name: 'Frappe lourde',
      power: 500,          // +30% (380 × 1.3)
      range: 90,
      hitbox: 'cone',
      coneAngle: 45,
      cooldown: 0.85,       // -15%
      manaCost: 15,
    },
    skillA: {
      name: 'Tempête de lames',
      power: 720,          // +30% (550 × 1.3)
      type: 'aoe_self',
      range: 130,
      cooldown: 6,          // -15%
      manaCost: 40,
    },
    skillB: {
      name: 'Dash Offensif',
      type: 'dash_attack',
      power: 400,          // +33% (300 × 1.33)
      dashDistance: 220,
      hitbox: 'line',
      lineWidth: 50,
      cooldown: 4,          // -20%
      manaCost: 25,
    },
    ultimate: {
      name: 'Exécution',
      power: 1600,         // +33% (1200 × 1.33)
      type: 'single_target',
      range: 110,
      cooldown: 35,         // -12%
      manaCost: 80,
      bonusVsLowHp: 0.5,
    },
  },

  dps_range: {
    basic: {
      name: 'Tir rapide',
      power: 170,          // +30% (130 × 1.3)
      range: 550,
      hitbox: 'projectile',
      projSpeed: 650,
      projRadius: 7,
      cooldown: 0.34,       // -15% (0.4 × 0.85)
      manaCost: 0,
      isBasic: true,
    },
    secondary: {
      name: 'Tir chargé',
      power: 416,          // +30% (320 × 1.3)
      range: 650,
      hitbox: 'projectile',
      projSpeed: 850,
      projRadius: 12,
      cooldown: 1.0,        // -15% (1.2 × 0.85)
      manaCost: 25,
      piercing: true,
    },
    skillA: {
      name: 'Pluie de flèches',
      type: 'aoe_targeted',
      power: 364,          // +30% (280 × 1.3)
      range: 550,
      aoeRadius: 130,
      cooldown: 7,          // -15% (8 × 0.85)
      manaCost: 70,
      delay: 0.8,
    },
    skillB: {
      name: 'Piège explosif',
      type: 'trap',
      power: 585,          // +30% (450 × 1.3)
      range: 400,
      trapRadius: 90,
      cooldown: 8.5,        // -15% (10 × 0.85)
      manaCost: 50,
      duration: 12,
    },
    ultimate: {
      name: 'Barrage',
      type: 'channel',
      power: 208,          // +30% (160 × 1.3)
      hits: 12,
      interval: 0.21,       // -15% (0.25 × 0.85)
      range: 550,
      coneAngle: 35,
      cooldown: 34,         // -15% (40 × 0.85)
      manaCost: 160,
    },
  },

  mage: {
    basic: {
      name: 'Trait arcanique',
      power: 160,
      range: 550,
      hitbox: 'projectile',
      projSpeed: 700,
      projRadius: 12,
      cooldown: 0.35,
      manaCost: 0,
      isBasic: true,
    },
    secondary: {
      name: 'Orbe de feu',
      power: 400,
      range: 600,
      hitbox: 'projectile',
      projSpeed: 600,
      projRadius: 18,
      cooldown: 1.0,
      manaCost: 35,
      piercing: true,
    },
    skillA: {
      name: 'Zollstraak',
      power: 800,
      range: 700,
      hitbox: 'projectile',
      projSpeed: 1200,       // Very fast blue laser
      projRadius: 14,
      cooldown: 5,
      manaCost: 60,
      piercing: true,        // Goes through boss
    },
    skillB: {
      name: 'Téléportation',
      type: 'dash_attack',
      power: 250,
      dashDistance: 280,
      hitbox: 'line',
      lineWidth: 60,
      cooldown: 6,
      manaCost: 30,
    },
    ultimate: {
      name: 'Onde Arcanique',
      type: 'aoe_self',
      power: 350,
      range: 200,            // AoE radius around mage
      cooldown: 1.0,         // Spammable every 1s
      manaCost: 60,          // Heavy mana cost per use
      proximityBonus: true,  // More damage up close
    },
  },

  berserker: {
    basic: {
      name: 'Frappe brutale',
      power: 170,
      range: 75,
      hitbox: 'cone',
      coneAngle: 70,
      cooldown: 0.4,
      manaCost: 0,
      isBasic: true,
    },
    secondary: {
      name: 'Garde du Berserker',
      type: 'block',
      damageReduction: 0.50,  // 50% reduction (weaker than tank's 75%)
      duration: 0,
      manaCost: 6,            // Mana drain per second while blocking
      speedMult: 0.4,         // 40% speed while blocking (tank: 30%)
    },
    skillA: {
      name: 'Rage du Berserker',
      type: 'buff_self',
      atkBonus: 0.8,       // +80% ATK
      spdBonus: 0.2,       // +20% SPD
      duration: 10,
      cooldown: 20,
      manaCost: 0,
      visualEffect: 'rotating_aura',
    },
    skillB: {
      name: 'Frappe chargée',
      type: 'charged_attack',
      powerBase: 200,
      powerLevels: [200, 400, 700, 1100], // Level 0-3
      range: 90,
      hitbox: 'cone',
      coneAngle: 60,
      chargeTime: 4.0,     // Max 4 seconds to reach level 3
      chargeLevels: 4,     // 0, 1, 2, 3
      cooldown: 1.0,       // Short CD after release
      manaCost: 0,
    },
    ultimate: {
      name: 'Tourbillon de destruction',
      type: 'whirlwind',
      power: 1500,
      hits: 8,             // Tick every 0.5s for 4s = 8 hits
      interval: 0.5,
      range: 120,
      cooldown: 30,
      manaCost: 90,
      duration: 4,
    },
  },
};
