// ─── Class Definitions for Expedition ──────────────────────
// Identical to Manaya raid classes — same skills, same combat feel.
// In expedition, hunters' stats come from inscription data + class multipliers,
// NOT from these flat values. These are only used as fallback.

export const CLASS_STATS = {
  tank: {
    label: 'Tank',
    hp: 25000, mana: 400, atk: 4200, def: 300, spd: 160, crit: 10, res: 50,
    aggroMult: 3.0, color: '#3b82f6',
  },
  healer: {
    label: 'Healer',
    hp: 18000, mana: 800, atk: 400, def: 120, spd: 180, crit: 12, res: 60,
    aggroMult: 0.7, color: '#10b981',
  },
  dps_cac: {
    label: 'Warrior',
    hp: 22000, mana: 100, atk: 6120, def: 150, spd: 200, crit: 32, res: 20,
    aggroMult: 1.0, color: '#ef4444', useRage: true,
  },
  dps_range: {
    label: 'Archer',
    hp: 14000, mana: 500, atk: 720, def: 80, spd: 190, crit: 22, res: 15,
    aggroMult: 1.0, color: '#f59e0b',
  },
  berserker: {
    label: 'Berserker',
    hp: 23000, mana: 400, atk: 4920, def: 140, spd: 210, crit: 28, res: 18,
    aggroMult: 1.1, color: '#dc2626',
  },
  mage: {
    label: 'Mage',
    hp: 13000, mana: 1000, atk: 780, def: 60, spd: 175, crit: 25, res: 20,
    aggroMult: 0.9, color: '#c084fc',
  },
};

// ── Skill Definitions ──
// Identical to Manaya — same combat feel, same skills
export const CLASS_SKILLS = {
  tank: {
    basic: {
      name: 'Frappe de bouclier', power: 1200, range: 70, hitbox: 'cone',
      coneAngle: 90, cooldown: 0.5, manaCost: 0, aggroBonus: 80, isBasic: true,
    },
    secondary: {
      name: 'Bloquer', type: 'block', damageReduction: 0.75,
      duration: 0, manaCost: 4, aggroPerSec: 100, speedMult: 0.3,
    },
    skillA: {
      name: 'Provocation', type: 'taunt', range: 600,
      cooldown: 10, manaCost: 40, aggroFlat: 8000, duration: 5,
    },
    skillB: {
      name: 'Bouclier Sacré', type: 'party_shield', range: 500,
      cooldown: 18, manaCost: 70, shieldHp: 3000, duration: 6,
    },
    ultimate: {
      name: 'Forteresse', type: 'invuln',
      cooldown: 50, manaCost: 120, duration: 4, aggroFlat: 15000,
    },
  },

  healer: {
    basic: {
      name: 'Trait de lumière', power: 1200, range: 1100, hitbox: 'projectile',
      projSpeed: 1100, projRadius: 8, cooldown: 0.45, manaCost: 0,
      isBasic: true, manaOnHit: 18,  // nerfed from 25 — must auto-attack more to sustain
    },
    secondary: {
      name: 'Cercle de Soin', type: 'heal_zone', healPct: 0.10,
      range: 500, zoneRadius: 150, zoneDuration: 4.0, healTicks: 5,
      cooldown: 10.0, manaCost: 80,  // 30→80: heal zone is expensive
    },
    skillA: {
      name: 'Soin de Zone', type: 'heal_aoe', healPct: 0.10,
      range: 750, cooldown: 6, manaCost: 120,  // 55→120: big AoE heal = big cost
      atkBuff: 0.25, atkBuffDur: 10,
    },
    skillB: {
      name: 'Purification', type: 'cleanse', range: 800,
      cooldown: 10, manaCost: 90,  // 40→90: cleanse + boss dispel is powerful
      removesDebuffs: true, dispelsBossRage: true,
      critBuff: 10, spdBuff: 0.10, buffDur: 10,
    },
    ultimate: {
      name: 'Résurrection Divine', type: 'resurrect',
      cooldown: 20, manaCost: 0, manaCostPercent: 0.35, healPercent: 0.5,  // 15%→35% max mana
      range: 600, channelDuration: 6.0,
    },
  },

  dps_cac: {
    basic: {
      name: 'Combo de lames', power: 180, range: 80, hitbox: 'cone',
      coneAngle: 60, cooldown: 0.3, manaCost: 0, isBasic: true, rageGain: 18,
    },
    secondary: {
      name: 'Frappe lourde', power: 500, range: 90, hitbox: 'cone',
      coneAngle: 45, cooldown: 0.85, manaCost: 15,
    },
    skillA: {
      name: 'Tempête de lames', power: 720, type: 'aoe_self',
      range: 130, cooldown: 6, manaCost: 40,
    },
    skillB: {
      name: 'Dash Offensif', type: 'dash_attack', power: 400,
      dashDistance: 350, hitbox: 'line', lineWidth: 50, cooldown: 4, manaCost: 25,
    },
    ultimate: {
      name: 'Exécution', power: 1600, type: 'single_target',
      range: 110, cooldown: 35, manaCost: 80, bonusVsLowHp: 0.5,
    },
  },

  dps_range: {
    basic: {
      name: 'Tir rapide', power: 170, range: 1350, hitbox: 'projectile',
      projSpeed: 1400, projRadius: 7, cooldown: 0.34, manaCost: 0, isBasic: true,
    },
    secondary: {
      name: 'Tir chargé', power: 416, range: 1500, hitbox: 'projectile',
      projSpeed: 1800, projRadius: 12, cooldown: 1.0, manaCost: 25, piercing: true,
    },
    skillA: {
      name: 'Pluie de flèches', type: 'aoe_targeted', power: 364,
      range: 1350, aoeRadius: 200, cooldown: 7, manaCost: 70, delay: 0.8,
    },
    skillB: {
      name: 'Piège explosif', type: 'trap', power: 585,
      range: 1000, trapRadius: 120, cooldown: 8.5, manaCost: 50, duration: 12,
    },
    ultimate: {
      name: 'Barrage', type: 'channel', power: 208, hits: 12,
      interval: 0.21, range: 1350, coneAngle: 35, cooldown: 34, manaCost: 160,
    },
  },

  mage: {
    basic: {
      name: 'Trait arcanique', power: 160, range: 1350, hitbox: 'projectile',
      projSpeed: 1500, projRadius: 12, cooldown: 0.35, manaCost: 0, isBasic: true,
    },
    secondary: {
      name: 'Orbe de feu', power: 400, range: 1500, hitbox: 'projectile',
      projSpeed: 1300, projRadius: 18, cooldown: 1.0, manaCost: 35, piercing: true,
    },
    skillA: {
      name: 'Zollstraak', power: 800, range: 1700, hitbox: 'projectile',
      projSpeed: 2500, projRadius: 14, cooldown: 5, manaCost: 60, piercing: true,
    },
    skillB: {
      name: 'Téléportation', type: 'dash_attack', power: 250,
      dashDistance: 400, hitbox: 'line', lineWidth: 60, cooldown: 6, manaCost: 30,
    },
    ultimate: {
      name: 'Onde Arcanique', type: 'aoe_self', power: 350,
      range: 350, cooldown: 1.0, manaCost: 60, proximityBonus: true,
    },
  },

  berserker: {
    basic: {
      name: 'Frappe brutale', power: 170, range: 75, hitbox: 'cone',
      coneAngle: 70, cooldown: 0.4, manaCost: 0, isBasic: true,
    },
    secondary: {
      name: 'Garde du Berserker', type: 'block', damageReduction: 0.50,
      duration: 0, manaCost: 6, speedMult: 0.4,
    },
    skillA: {
      name: 'Rage du Berserker', type: 'buff_self',
      atkBonus: 0.8, spdBonus: 0.2, duration: 10, cooldown: 20, manaCost: 0,
      visualEffect: 'rotating_aura',
    },
    skillB: {
      name: 'Frappe chargée', type: 'charged_attack',
      powerBase: 200, powerLevels: [200, 400, 700, 1100],
      range: 90, hitbox: 'cone', coneAngle: 60,
      chargeTime: 4.0, chargeLevels: 4, cooldown: 1.0, manaCost: 0,
    },
    ultimate: {
      name: 'Tourbillon de destruction', type: 'whirlwind', power: 1500,
      hits: 8, interval: 0.5, range: 120, cooldown: 30, manaCost: 90, duration: 4,
    },
  },
};
