// ── Boss Definitions for Expedition I ──
// ── FULLY REBALANCED: real colosseum stats + all damage multipliers ──
//
// Hunter stats (from DB): HP avg ~17K, ATK avg ~8.5K, DEF avg ~1000
// DEF reduction on boss damage: 100/(100+1000) = 9.1% damage gets through
// Boss ATK must be high to deal meaningful damage through hunter DEF
//
// Effective group DPS (30 hunters, with all multipliers):
//   ~1M/s base (pre-boss-DEF) — degrades with deaths
//   Includes: skills, crits, set bonuses, talent multipliers (boss dmg, elem dmg, etc.)
//
// FIXED: double-DEF bug — Boss/Mob.takeDamage no longer applies DEF
//        (calculateDamage already applies it)
//
// Boss pattern damage formula:
//   effectiveDmg = bossATK × (pattern.damage/100) × 100/(100+charDEF)
//   With charDEF=1000: effectiveDmg = bossATK × pattern.damage/100 × 0.091

export const BOSS_DEFINITIONS = [
  // ═══════════════════════════════════════════════════════
  // BOSS 1: Gardien de la Foret (Intro)
  // Target: ~30s | Effective DPS through DEF 10: ~910K/s
  // ═══════════════════════════════════════════════════════
  {
    id: 'forest_guardian',
    name: 'Gardien de la Foret',
    index: 0,
    hp: 30_000_000,         // 30M
    atk: 3500,
    def: 10,
    regenPct: 0.15,           // 45K/s regen (~5% of group DPS)
    spd: 42,
    enrageTimer: 300,
    enrageHpPercent: 0,
    autoAttackPower: 150,   // Auto: 3500×1.5×0.091 = 477 dmg (2.8% HP)
    patterns: [
      {
        name: 'Cleave Frontal',
        weight: 3,
        cooldown: 6,
        telegraphTime: 2.0,
        damage: 500,          // 3500×5.0×0.091 = 1591 dmg (9.4% HP)
        type: 'frontal',
        range: 200,
        description: 'Large sweeping attack hitting the frontline',
      },
      {
        name: 'Stomp',
        weight: 2,
        cooldown: 10,
        telegraphTime: 2.5,
        damage: 400,          // 3500×4.0×0.091 = 1273 dmg (7.5% HP)
        type: 'aoe_melee',
        range: 250,
        description: 'Ground stomp damaging nearby characters',
      },
      {
        name: 'Invocation Slimes',
        weight: 1,
        cooldown: 12,
        telegraphTime: 1.5,
        damage: 0,
        type: 'summon',
        summon: { template: 'slime', count: 6, difficultyMult: 1.5 },
        description: 'Summons 6 empowered slimes',
      },
    ],
    lootTable: 'boss_1',
  },

  // ═══════════════════════════════════════════════════════
  // BOSS 2: Sentinelle de Pierre
  // Target: ~40s | Effective DPS through DEF 15: ~870K/s
  // ═══════════════════════════════════════════════════════
  {
    id: 'stone_sentinel',
    name: 'Sentinelle de Pierre',
    index: 1,
    hp: 40_000_000,         // 40M
    atk: 4000,
    def: 15,
    regenPct: 0.12,           // 48K/s (~6% of group DPS)
    spd: 35,
    enrageTimer: 300,
    enrageHpPercent: 0,
    autoAttackPower: 160,   // Auto: 4000×1.6×0.091 = 582 dmg (3.4% HP)
    patterns: [
      {
        name: 'Lancer de Roc',
        weight: 3,
        cooldown: 8,
        telegraphTime: 2.0,
        damage: 450,          // 4000×4.5×0.091 = 1636 dmg (9.6% HP)
        type: 'aoe_ranged',
        range: 400,
        aoeRadius: 150,
        description: 'Throws a boulder at the backline',
      },
      {
        name: 'Slam Sol',
        weight: 2,
        cooldown: 6,
        telegraphTime: 1.8,
        damage: 500,          // 4000×5.0×0.091 = 1818 dmg (10.7% HP)
        type: 'aoe_melee',
        range: 200,
        description: 'Slams the ground, damaging melee range',
      },
      {
        name: 'Bouclier de Terre',
        weight: 1,
        cooldown: 25,
        telegraphTime: 1.0,
        damage: 0,
        type: 'self_heal',
        healPercent: 3,
        description: 'Raises an earth shield, regenerating HP',
      },
      {
        name: 'Invocation Golems',
        weight: 1,
        cooldown: 18,
        telegraphTime: 2.0,
        damage: 0,
        type: 'summon',
        summon: { template: 'golem', count: 4, difficultyMult: 1.0 },
        description: 'Summons 4 stone golems',
      },
    ],
    lootTable: 'boss_2',
  },

  // ═══════════════════════════════════════════════════════
  // BOSS 3: Seigneur Ombre
  // Target: ~55s
  // ═══════════════════════════════════════════════════════
  {
    id: 'shadow_lord',
    name: 'Seigneur Ombre',
    index: 2,
    hp: 55_000_000,         // 55M
    atk: 4500,
    def: 15,
    regenPct: 0.10,           // 55K/s (~6% of group DPS)
    spd: 58,
    enrageTimer: 240,
    enrageHpPercent: 20,
    autoAttackPower: 170,   // Auto: 4500×1.7×0.091 = 696 dmg (4.1% HP)
    patterns: [
      {
        name: 'Lame d\'Ombre',
        weight: 3,
        cooldown: 5,
        telegraphTime: 1.5,
        damage: 550,          // 4500×5.5×0.091 = 2252 dmg (13.2% HP)
        type: 'frontal',
        range: 250,
        description: 'Shadow blade cleaves the frontline',
      },
      {
        name: 'Tenebres',
        weight: 2,
        cooldown: 12,
        telegraphTime: 2.5,
        damage: 400,          // 4500×4.0×0.091 = 1636 dmg (9.6% HP)
        type: 'aoe_ranged',
        range: 500,
        aoeRadius: 200,
        description: 'Darkness engulfs the backline',
      },
      {
        name: 'Necromancie',
        weight: 1,
        cooldown: 12,
        telegraphTime: 2.0,
        damage: 0,
        type: 'summon',
        summon: { template: 'skeleton', count: 8, difficultyMult: 2.0 },
        description: 'Raises 8 undead skeletons',
      },
      {
        name: 'Drain d\'Ame',
        weight: 1,
        cooldown: 20,
        telegraphTime: 3.0,
        damage: 300,          // 4500×3.0×0.091 = 1227 dmg each (7.2% HP)
        type: 'aoe_all',
        healPercent: 2,
        description: 'Drains life from all characters',
      },
    ],
    lootTable: 'boss_3',
  },

  // ═══════════════════════════════════════════════════════
  // BOSS 4: Ancien des Racines (Zone Foret)
  // Target: ~70s
  // ═══════════════════════════════════════════════════════
  {
    id: 'root_ancient',
    name: 'Ancien des Racines',
    index: 3,
    hp: 70_000_000,         // 70M
    atk: 4800,
    def: 20,
    regenPct: 0.08,           // 56K/s (~7% of group DPS)
    spd: 32,
    enrageTimer: 300,
    enrageHpPercent: 0,
    autoAttackPower: 170,   // Auto: 4800×1.7×0.091 = 742 dmg (4.4% HP)
    patterns: [
      {
        name: 'Empalement Racinaire',
        weight: 3,
        cooldown: 6,
        telegraphTime: 2.5,
        damage: 450,          // 4800×4.5×0.091 = 1964 dmg (11.6% HP)
        type: 'aoe_melee',
        range: 300,
        description: 'Roots erupt from the ground, impaling melee range',
      },
      {
        name: 'Constriction',
        weight: 2,
        cooldown: 12,
        telegraphTime: 2.0,
        damage: 280,          // 4800×2.8×0.091 = 1223 dmg each (7.2% HP)
        type: 'aoe_all',
        description: 'Vines constrict all characters',
      },
      {
        name: 'Regeneration Sylvestre',
        weight: 1,
        cooldown: 30,
        telegraphTime: 1.0,
        damage: 0,
        type: 'self_heal',
        healPercent: 3,
        description: 'Draws life from the forest to regenerate',
      },
      {
        name: 'Invocation Treants',
        weight: 1,
        cooldown: 15,
        telegraphTime: 2.0,
        damage: 0,
        type: 'summon',
        summon: { template: 'golem', count: 5, difficultyMult: 1.5 },
        description: 'Summons 5 treant guardians',
      },
    ],
    lootTable: 'boss_4',
  },

  // ═══════════════════════════════════════════════════════
  // BOSS 5: Reine Sylvestre (Zone Foret — final)
  // Target: ~90s (1.5min)
  // ═══════════════════════════════════════════════════════
  {
    id: 'sylvan_queen',
    name: 'Reine Sylvestre',
    index: 4,
    hp: 90_000_000,         // 90M
    atk: 5000,
    def: 25,
    regenPct: 0.07,           // 63K/s (~8% of group DPS)
    spd: 55,
    enrageTimer: 270,
    enrageHpPercent: 15,
    autoAttackPower: 180,   // Auto: 5000×1.8×0.091 = 819 dmg (4.8% HP)
    patterns: [
      {
        name: 'Pluie d\'Epines',
        weight: 3,
        cooldown: 5,
        telegraphTime: 1.8,
        damage: 480,          // 5000×4.8×0.091 = 2182 dmg (12.8% HP)
        type: 'aoe_ranged',
        range: 500,
        aoeRadius: 200,
        description: 'Rains thorns on the backline',
      },
      {
        name: 'Etreinte Mortelle',
        weight: 2,
        cooldown: 8,
        telegraphTime: 2.0,
        damage: 600,          // 5000×6.0×0.091 = 2727 dmg (16% HP)
        type: 'frontal',
        range: 250,
        description: 'Deadly vine embrace on the frontline',
      },
      {
        name: 'Charme Sylvestre',
        weight: 1,
        cooldown: 20,
        telegraphTime: 3.0,
        damage: 300,          // 5000×3.0×0.091 = 1364 dmg each (8% HP)
        type: 'aoe_all',
        description: 'Charming aura damages and confuses all',
      },
      {
        name: 'Invocation Essaim',
        weight: 1,
        cooldown: 12,
        telegraphTime: 1.5,
        damage: 0,
        type: 'summon',
        summon: { template: 'goblin', count: 12, difficultyMult: 2.0 },
        description: 'Summons a swarm of fae creatures',
      },
    ],
    lootTable: 'boss_5',
  },

  // ═══════════════════════════════════════════════════════
  // BOSS 6: Leviathan (Zone Abysses)
  // Target: ~2min | 90% team alive
  // ═══════════════════════════════════════════════════════
  {
    id: 'leviathan',
    name: 'Leviathan',
    index: 5,
    hp: 120_000_000,        // 120M
    atk: 5500,
    def: 25,
    regenPct: 0.05,           // 60K/s (~8% of group DPS)
    spd: 42,
    enrageTimer: 300,
    enrageHpPercent: 0,
    autoAttackPower: 180,   // Auto: 5500×1.8×0.091 = 900 dmg (5.3% HP)
    patterns: [
      {
        name: 'Raz-de-Maree',
        weight: 3,
        cooldown: 7,
        telegraphTime: 2.5,
        damage: 350,          // 5500×3.5×0.091 = 1750 dmg each (10.3% HP)
        type: 'aoe_all',
        description: 'Massive tidal wave hits everyone',
      },
      {
        name: 'Morsure Abyssale',
        weight: 2,
        cooldown: 5,
        telegraphTime: 1.5,
        damage: 650,          // 5500×6.5×0.091 = 3252 dmg (19.1% HP)
        type: 'frontal',
        range: 200,
        description: 'Devastating bite on frontline',
      },
      {
        name: 'Tourbillon',
        weight: 1,
        cooldown: 15,
        telegraphTime: 2.0,
        damage: 500,          // 5500×5.0×0.091 = 2500 dmg (14.7% HP)
        type: 'aoe_melee',
        range: 350,
        description: 'Whirlpool drags and damages nearby characters',
      },
      {
        name: 'Invocation Profondeurs',
        weight: 1,
        cooldown: 15,
        telegraphTime: 2.0,
        damage: 0,
        type: 'summon',
        summon: { template: 'orc', count: 6, difficultyMult: 2.0 },
        description: 'Summons 6 abyssal creatures',
      },
    ],
    lootTable: 'boss_6',
  },

  // ═══════════════════════════════════════════════════════
  // BOSS 7: Sorcier Abyssal (Zone Abysses)
  // Target: ~2.5min
  // ═══════════════════════════════════════════════════════
  {
    id: 'abyssal_sorcerer',
    name: 'Sorcier Abyssal',
    index: 6,
    hp: 150_000_000,        // 150M
    atk: 6000,
    def: 30,
    regenPct: 0.05,           // 75K/s (~10% of group DPS)
    spd: 50,
    enrageTimer: 270,
    enrageHpPercent: 0,
    autoAttackPower: 190,   // Auto: 6000×1.9×0.091 = 1036 dmg (6.1% HP)
    patterns: [
      {
        name: 'Rayon Maudit',
        weight: 3,
        cooldown: 5,
        telegraphTime: 1.5,
        damage: 500,          // 6000×5.0×0.091 = 2727 dmg (16% HP)
        type: 'aoe_ranged',
        range: 500,
        aoeRadius: 250,
        description: 'Cursed beam targeting backline mages and healers',
      },
      {
        name: 'Nova Obscure',
        weight: 2,
        cooldown: 10,
        telegraphTime: 2.5,
        damage: 450,          // 6000×4.5×0.091 = 2455 dmg (14.4% HP)
        type: 'aoe_melee',
        range: 300,
        description: 'Dark nova around the sorcerer',
      },
      {
        name: 'Drain de Mana',
        weight: 1,
        cooldown: 20,
        telegraphTime: 2.0,
        damage: 320,          // 6000×3.2×0.091 = 1745 dmg each (10.3% HP)
        type: 'aoe_all',
        healPercent: 3,
        description: 'Drains mana and life from all, self-heals',
      },
      {
        name: 'Invocation Dark Mages',
        weight: 1,
        cooldown: 14,
        telegraphTime: 2.0,
        damage: 0,
        type: 'summon',
        summon: { template: 'dark_mage', count: 6, difficultyMult: 2.5 },
        description: 'Summons 6 dark mage acolytes',
      },
    ],
    lootTable: 'boss_7',
  },

  // ═══════════════════════════════════════════════════════
  // BOSS 8: Titan de Fer (Zone Abysses)
  // Target: ~3min
  // ═══════════════════════════════════════════════════════
  {
    id: 'iron_titan',
    name: 'Titan de Fer',
    index: 7,
    hp: 180_000_000,        // 180M
    atk: 6500,
    def: 30,
    regenPct: 0.04,           // 72K/s (~9% of group DPS)
    spd: 30,
    enrageTimer: 300,
    enrageHpPercent: 0,
    autoAttackPower: 190,   // Auto: 6500×1.9×0.091 = 1123 dmg (6.6% HP)
    patterns: [
      {
        name: 'Poing de Fer',
        weight: 3,
        cooldown: 6,
        telegraphTime: 2.5,
        damage: 700,          // 6500×7.0×0.091 = 4136 dmg (24.3% HP)
        type: 'frontal',
        range: 250,
        description: 'Massive iron fist crushing the frontline',
      },
      {
        name: 'Seisme',
        weight: 2,
        cooldown: 12,
        telegraphTime: 3.0,
        damage: 380,          // 6500×3.8×0.091 = 2247 dmg each (13.2% HP)
        type: 'aoe_all',
        description: 'Earth-shaking stomp damages everyone',
      },
      {
        name: 'Armure Renforcee',
        weight: 1,
        cooldown: 30,
        telegraphTime: 1.0,
        damage: 0,
        type: 'self_heal',
        healPercent: 3,
        description: 'Reinforces armor, regenerating HP',
      },
      {
        name: 'Invocation Golems de Fer',
        weight: 1,
        cooldown: 16,
        telegraphTime: 2.0,
        damage: 0,
        type: 'summon',
        summon: { template: 'golem', count: 5, difficultyMult: 2.5 },
        description: 'Summons 5 iron golems',
      },
    ],
    lootTable: 'boss_8',
  },

  // ═══════════════════════════════════════════════════════
  // BOSS 9: Hydre Venimeuse (Zone Abysses)
  // Target: ~3.5min | Deaths accelerating
  // ═══════════════════════════════════════════════════════
  {
    id: 'venomous_hydra',
    name: 'Hydre Venimeuse',
    index: 8,
    hp: 220_000_000,        // 220M
    atk: 7000,
    def: 35,
    regenPct: 0.04,           // 88K/s (~12% of group DPS)
    spd: 55,
    enrageTimer: 240,
    enrageHpPercent: 25,
    autoAttackPower: 200,   // Auto: 7000×2.0×0.091 = 1273 dmg (7.5% HP)
    patterns: [
      {
        name: 'Triple Morsure',
        weight: 3,
        cooldown: 4,
        telegraphTime: 1.5,
        damage: 650,          // 7000×6.5×0.091 = 4136 dmg (24.3% HP)
        type: 'frontal',
        range: 200,
        description: 'Three heads bite the frontline simultaneously',
      },
      {
        name: 'Crachat Venimeux',
        weight: 2,
        cooldown: 8,
        telegraphTime: 2.0,
        damage: 500,          // 7000×5.0×0.091 = 3182 dmg (18.7% HP)
        type: 'aoe_ranged',
        range: 450,
        aoeRadius: 200,
        description: 'Poison spit targeting the backline',
      },
      {
        name: 'Regeneration Hydra',
        weight: 1,
        cooldown: 25,
        telegraphTime: 1.0,
        damage: 0,
        type: 'self_heal',
        healPercent: 3,
        description: 'Severed heads regrow, healing the hydra',
      },
      {
        name: 'Nuage Toxique',
        weight: 2,
        cooldown: 15,
        telegraphTime: 2.5,
        damage: 350,          // 7000×3.5×0.091 = 2227 dmg each (13.1% HP)
        type: 'aoe_all',
        description: 'Toxic cloud poisons all characters',
      },
      {
        name: 'Invocation Serpents',
        weight: 1,
        cooldown: 14,
        telegraphTime: 1.5,
        damage: 0,
        type: 'summon',
        summon: { template: 'goblin', count: 8, difficultyMult: 3.0 },
        description: 'Summons 8 venomous serpents',
      },
    ],
    lootTable: 'boss_9',
  },

  // ═══════════════════════════════════════════════════════
  // BOSS 10: Roi des Profondeurs (Zone Abysses — final)
  // Target: ~4min | ~75% alive
  // ═══════════════════════════════════════════════════════
  {
    id: 'deep_king',
    name: 'Roi des Profondeurs',
    index: 9,
    hp: 270_000_000,        // 270M
    atk: 7500,
    def: 35,
    regenPct: 0.03,           // 81K/s (~11% of group DPS)
    spd: 50,
    enrageTimer: 300,
    enrageHpPercent: 20,
    autoAttackPower: 200,   // Auto: 7500×2.0×0.091 = 1364 dmg (8% HP)
    patterns: [
      {
        name: 'Jugement Abyssal',
        weight: 3,
        cooldown: 6,
        telegraphTime: 2.0,
        damage: 700,          // 7500×7.0×0.091 = 4773 dmg (28.1% HP)
        type: 'frontal',
        range: 300,
        description: 'Royal judgment cleaves the frontline',
      },
      {
        name: 'Maree Noire',
        weight: 2,
        cooldown: 10,
        telegraphTime: 3.0,
        damage: 380,          // 7500×3.8×0.091 = 2591 dmg each (15.2% HP)
        type: 'aoe_all',
        description: 'Dark tide engulfs all characters',
      },
      {
        name: 'Trident Royal',
        weight: 2,
        cooldown: 8,
        telegraphTime: 1.8,
        damage: 550,          // 7500×5.5×0.091 = 3750 dmg (22.1% HP)
        type: 'aoe_ranged',
        range: 500,
        aoeRadius: 200,
        description: 'Trident blast targeting the backline',
      },
      {
        name: 'Invocation Gardes Royaux',
        weight: 1,
        cooldown: 18,
        telegraphTime: 2.5,
        damage: 0,
        type: 'summon',
        summon: { template: 'orc', count: 9, difficultyMult: 3.0 },
        description: 'Summons 9 royal deep guards',
      },
    ],
    lootTable: 'boss_10',
  },

  // ═══════════════════════════════════════════════════════
  // BOSS 11: Spectre Originel (Zone Neant)
  // Target: ~5min+ | Deaths start piling up
  // ═══════════════════════════════════════════════════════
  {
    id: 'origin_specter',
    name: 'Spectre Originel',
    index: 10,
    hp: 330_000_000,        // 330M
    atk: 8000,
    def: 40,
    regenPct: 0.03,           // 99K/s (~14% of group DPS)
    spd: 60,
    enrageTimer: 270,
    enrageHpPercent: 20,
    autoAttackPower: 210,   // Auto: 8000×2.1×0.091 = 1527 dmg (9% HP)
    patterns: [
      {
        name: 'Toucher Spectral',
        weight: 3,
        cooldown: 4,
        telegraphTime: 1.2,
        damage: 650,          // 8000×6.5×0.091 = 4727 dmg (27.8% HP)
        type: 'frontal',
        range: 250,
        description: 'Ghostly touch phasing through defenses',
      },
      {
        name: 'Hurlement du Neant',
        weight: 2,
        cooldown: 12,
        telegraphTime: 2.5,
        damage: 400,          // 8000×4.0×0.091 = 2909 dmg each (17.1% HP)
        type: 'aoe_all',
        description: 'Wail from the void damaging all characters',
      },
      {
        name: 'Phase Spectrale',
        weight: 1,
        cooldown: 20,
        telegraphTime: 1.0,
        damage: 0,
        type: 'self_heal',
        healPercent: 2,
        description: 'Phases out of reality, regenerating',
      },
      {
        name: 'Invocation Fantomes',
        weight: 1,
        cooldown: 12,
        telegraphTime: 1.5,
        damage: 0,
        type: 'summon',
        summon: { template: 'skeleton', count: 12, difficultyMult: 3.5 },
        description: 'Summons 12 spectral warriors',
      },
      {
        name: 'Ecrasement Spectral',
        weight: 2,
        cooldown: 15,
        telegraphTime: 1.0,
        damage: 0,
        type: 'atk_crush',
        crushPct: 70,
        duration: 30,
        description: 'Ecrase la puissance d\'un chasseur aleatoire (-70% ATK/INT, 30s)',
      },
    ],
    phases: [
      {
        id: 'specter_p1',
        trigger: 'hp_below',
        threshold: 70,
        atkMult: 1.2,
        antiHealPct: 30,
        patterns: [
          {
            name: 'Drain Spectral',
            weight: 2,
            cooldown: 14,
            telegraphTime: 2.0,
            damage: 350,
            type: 'anti_heal',
            antiHealPct: 40,
            duration: 8,
            description: 'Spectral drain reduces all healing',
          },
        ],
      },
      {
        id: 'specter_p2',
        trigger: 'hp_below',
        threshold: 30,
        atkMult: 1.5,
        spdMult: 1.3,
        antiHealPct: 70,
        patterns: [
          {
            name: 'Eruption du Neant',
            weight: 3,
            cooldown: 10,
            telegraphTime: 2.0,
            damage: 400,
            type: 'multi_hit',
            hitCount: 5,
            description: 'Void eruption strikes 5 random targets',
          },
        ],
      },
    ],
    lootTable: 'boss_11',
  },

  // ═══════════════════════════════════════════════════════
  // BOSS 12: Archonte du Vide (Zone Neant)
  // Target: ~6min+ | Serious attrition
  // ═══════════════════════════════════════════════════════
  {
    id: 'void_archon',
    name: 'Archonte du Vide',
    index: 11,
    hp: 400_000_000,        // 400M
    atk: 8500,
    def: 40,
    regenPct: 0.025,          // 100K/s (~14% of group DPS)
    spd: 58,
    enrageTimer: 300,
    enrageHpPercent: 15,
    autoAttackPower: 220,   // Auto: 8500×2.2×0.091 = 1701 dmg (10% HP)
    patterns: [
      {
        name: 'Decret du Vide',
        weight: 3,
        cooldown: 5,
        telegraphTime: 2.0,
        damage: 750,          // 8500×7.5×0.091 = 5795 dmg (34.1% HP)
        type: 'frontal',
        range: 300,
        description: 'Void decree obliterates the frontline',
      },
      {
        name: 'Singularite',
        weight: 2,
        cooldown: 15,
        telegraphTime: 3.0,
        damage: 450,          // 8500×4.5×0.091 = 3477 dmg each (20.5% HP)
        type: 'aoe_all',
        description: 'Creates a singularity damaging everyone',
      },
      {
        name: 'Annihilation',
        weight: 1,
        cooldown: 10,
        telegraphTime: 2.0,
        damage: 600,          // 8500×6.0×0.091 = 4636 dmg (27.3% HP)
        type: 'aoe_ranged',
        range: 500,
        aoeRadius: 300,
        description: 'Annihilation beam on backline',
      },
      {
        name: 'Invocation Sentinelles du Vide',
        weight: 1,
        cooldown: 15,
        telegraphTime: 2.0,
        damage: 0,
        type: 'summon',
        summon: { template: 'golem', count: 6, difficultyMult: 4.0 },
        description: 'Summons 6 void sentinels',
      },
      {
        name: 'Decret d\'Ecrasement',
        weight: 2,
        cooldown: 15,
        telegraphTime: 1.0,
        damage: 0,
        type: 'atk_crush',
        crushPct: 70,
        duration: 30,
        description: 'Ecrase la puissance d\'un chasseur aleatoire (-70% ATK/INT, 30s)',
      },
    ],
    phases: [
      {
        id: 'archon_p1',
        trigger: 'hp_below',
        threshold: 65,
        regenMult: 1.5,
        antiHealPct: 25,
        patterns: [
          {
            name: 'Eclat du Vide',
            weight: 2,
            cooldown: 8,
            telegraphTime: 1.8,
            damage: 500,
            type: 'multi_hit',
            hitCount: 4,
            description: 'Void shards strike 4 random targets',
          },
        ],
      },
      {
        id: 'archon_p2',
        trigger: 'hp_below',
        threshold: 25,
        atkMult: 2.0,
        regenMult: 2.0,
        antiHealPct: 60,
        patterns: [
          {
            name: 'Tempete du Vide',
            weight: 3,
            cooldown: 12,
            telegraphTime: 2.5,
            damage: 500,
            type: 'aoe_all',
            description: 'Void storm ravages all characters',
          },
        ],
      },
    ],
    lootTable: 'boss_12',
  },

  // ═══════════════════════════════════════════════════════
  // BOSS 13: Dragon du Chaos (Zone Neant)
  // Target: ~7min+ | Heavy deaths
  // ═══════════════════════════════════════════════════════
  {
    id: 'chaos_dragon',
    name: 'Dragon du Chaos',
    index: 12,
    hp: 500_000_000,        // 500M
    atk: 9000,
    def: 45,
    regenPct: 0.02,           // 100K/s (~14% of group DPS)
    spd: 66,
    enrageTimer: 240,
    enrageHpPercent: 25,
    autoAttackPower: 230,   // Auto: 9000×2.3×0.091 = 1882 dmg (11.1% HP)
    patterns: [
      {
        name: 'Souffle du Chaos',
        weight: 3,
        cooldown: 6,
        telegraphTime: 2.0,
        damage: 800,          // 9000×8.0×0.091 = 6545 dmg (38.5% HP)
        type: 'frontal',
        range: 350,
        description: 'Chaotic breath incinerates the frontline',
      },
      {
        name: 'Battement d\'Ailes',
        weight: 2,
        cooldown: 8,
        telegraphTime: 2.5,
        damage: 450,          // 9000×4.5×0.091 = 3682 dmg each (21.7% HP)
        type: 'aoe_all',
        description: 'Wing buffet sends shockwaves at everyone',
      },
      {
        name: 'Meteor du Chaos',
        weight: 1,
        cooldown: 15,
        telegraphTime: 3.0,
        damage: 650,          // 9000×6.5×0.091 = 5318 dmg (31.3% HP)
        type: 'aoe_ranged',
        range: 500,
        aoeRadius: 250,
        description: 'Chaos meteor crashes on the backline',
      },
      {
        name: 'Invocation Drakelings',
        weight: 1,
        cooldown: 12,
        telegraphTime: 2.0,
        damage: 0,
        type: 'summon',
        summon: { template: 'orc', count: 9, difficultyMult: 4.0 },
        description: 'Summons 9 chaos drakelings',
      },
      {
        name: 'Rugissement du Chaos',
        weight: 2,
        cooldown: 15,
        telegraphTime: 1.0,
        damage: 0,
        type: 'atk_crush',
        crushPct: 70,
        duration: 30,
        description: 'Ecrase la puissance d\'un chasseur aleatoire (-70% ATK/INT, 30s)',
      },
    ],
    phases: [
      {
        id: 'dragon_p1',
        trigger: 'hp_below',
        threshold: 75,
        atkMult: 1.3,
        antiHealPct: 35,
        patterns: [
          {
            name: 'Salve du Chaos',
            weight: 2,
            cooldown: 9,
            telegraphTime: 2.0,
            damage: 500,
            type: 'multi_hit',
            hitCount: 6,
            description: 'Chaos barrage strikes 6 random targets',
          },
        ],
      },
      {
        id: 'dragon_p2',
        trigger: 'hp_below',
        threshold: 35,
        atkMult: 1.8,
        spdMult: 1.4,
        antiHealPct: 60,
        patterns: [
          {
            name: 'Jugement du Dragon',
            weight: 2,
            cooldown: 12,
            telegraphTime: 2.5,
            damage: 800,
            type: 'execute',
            description: 'Executes the weakest character with massive damage',
          },
        ],
      },
    ],
    lootTable: 'boss_13',
  },

  // ═══════════════════════════════════════════════════════
  // BOSS 14: Monarque Eternel (Zone Neant)
  // Target: ~8min+ | Wipe probable
  // ═══════════════════════════════════════════════════════
  {
    id: 'eternal_monarch',
    name: 'Monarque Eternel',
    index: 13,
    hp: 650_000_000,        // 650M
    atk: 10000,
    def: 45,
    regenPct: 0.02,           // 130K/s (~19% of group DPS)
    spd: 62,
    enrageTimer: 300,
    enrageHpPercent: 15,
    autoAttackPower: 240,   // Auto: 10000×2.4×0.091 = 2182 dmg (12.8% HP)
    patterns: [
      {
        name: 'Decret Eternel',
        weight: 3,
        cooldown: 5,
        telegraphTime: 2.0,
        damage: 850,          // 10000×8.5×0.091 = 7727 dmg (45.5% HP)
        type: 'frontal',
        range: 300,
        description: 'The Monarch\'s eternal decree crushes the frontline',
      },
      {
        name: 'Tempete du Temps',
        weight: 2,
        cooldown: 12,
        telegraphTime: 3.0,
        damage: 500,          // 10000×5.0×0.091 = 4545 dmg each (26.7% HP)
        type: 'aoe_all',
        description: 'Time storm warping reality around all characters',
      },
      {
        name: 'Rayon d\'Eternite',
        weight: 1,
        cooldown: 10,
        telegraphTime: 2.0,
        damage: 700,          // 10000×7.0×0.091 = 6364 dmg (37.4% HP)
        type: 'aoe_ranged',
        range: 500,
        aoeRadius: 250,
        description: 'Eternity beam targeting the backline',
      },
      {
        name: 'Invocation Chevaliers Eternels',
        weight: 1,
        cooldown: 18,
        telegraphTime: 2.5,
        damage: 0,
        type: 'summon',
        summon: { template: 'orc', count: 12, difficultyMult: 4.5 },
        description: 'Summons 12 eternal knights',
      },
      {
        name: 'Sablier Brise',
        weight: 2,
        cooldown: 15,
        telegraphTime: 1.0,
        damage: 0,
        type: 'atk_crush',
        crushPct: 70,
        duration: 30,
        description: 'Ecrase la puissance d\'un chasseur aleatoire (-70% ATK/INT, 30s)',
      },
    ],
    phases: [
      {
        id: 'monarch_p1',
        trigger: 'hp_below',
        threshold: 60,
        spdMult: 1.5,
        antiHealPct: 30,
        patterns: [
          {
            name: 'Distorsion Temporelle',
            weight: 2,
            cooldown: 16,
            telegraphTime: 2.5,
            damage: 500,
            type: 'anti_heal',
            antiHealPct: 50,
            duration: 12,
            description: 'Time distortion blocks healing for 12 seconds',
          },
        ],
      },
      {
        id: 'monarch_p2',
        trigger: 'hp_below',
        threshold: 25,
        atkMult: 2.0,
        spdMult: 1.8,
        antiHealPct: 75,
        patterns: [
          {
            name: 'Execution Eternelle',
            weight: 3,
            cooldown: 10,
            telegraphTime: 2.0,
            damage: 900,
            type: 'execute',
            description: 'Eternal judgment on the weakest — near certain death',
          },
        ],
      },
    ],
    lootTable: 'boss_14',
  },

  // ═══════════════════════════════════════════════════════
  // BOSS 15: Sung Il-Hwan (Zone Neant — Final Boss)
  // Target: ~10min+ | Designed to wipe most groups
  // ═══════════════════════════════════════════════════════
  {
    id: 'sung_ilhwan',
    name: 'Sung Il-Hwan',
    index: 14,
    hp: 900_000_000,        // 900M — wall boss
    atk: 11000,
    def: 50,
    regenPct: 0.015,          // 135K/s (~20% of group DPS)
    spd: 75,
    enrageTimer: 360,
    enrageHpPercent: 20,
    autoAttackPower: 250,   // Auto: 11000×2.5×0.091 = 2500 dmg (14.7% HP)
    patterns: [
      {
        name: 'Frappe du Chasseur Supreme',
        weight: 3,
        cooldown: 4,
        telegraphTime: 1.5,
        damage: 600,          // 11000×6.0×0.091 = 6000 dmg (35.3% HP)
        type: 'frontal',
        range: 300,
        description: 'The supreme hunter\'s devastating strike',
      },
      {
        name: 'Domain du Monarque',
        weight: 2,
        cooldown: 15,
        telegraphTime: 3.0,
        damage: 350,          // 11000×3.5×0.091 = 3500 dmg each (20.6% HP)
        type: 'aoe_all',
        description: 'Monarch domain damages all living characters',
      },
      {
        name: 'Armee des Ombres',
        weight: 1,
        cooldown: 12,
        telegraphTime: 2.0,
        damage: 0,
        type: 'summon',
        summon: { template: 'skeleton', count: 16, difficultyMult: 5.0 },
        description: 'Summons his legendary shadow army',
      },
      {
        name: 'Echange de Vie',
        weight: 1,
        cooldown: 25,
        telegraphTime: 3.0,
        damage: 500,          // 11000×5.0×0.091 = 5000 dmg each (29.4% HP)
        type: 'aoe_all',
        healPercent: 3,
        description: 'Drains all life force, healing significantly',
      },
      {
        name: 'Autorite du Monarque',
        weight: 2,
        cooldown: 15,
        telegraphTime: 1.0,
        damage: 0,
        type: 'atk_crush',
        crushPct: 70,
        duration: 30,
        description: 'Ecrase la puissance d\'un chasseur aleatoire (-70% ATK/INT, 30s)',
      },
    ],
    phases: [
      {
        id: 'ilhwan_p1',
        trigger: 'hp_below',
        threshold: 80,
        atkMult: 1.3,
        antiHealPct: 20,
        patterns: [
          {
            name: 'Ombre Renforcee',
            weight: 2,
            cooldown: 10,
            telegraphTime: 1.8,
            damage: 500,
            type: 'multi_hit',
            hitCount: 8,
            description: 'Empowered shadow strikes 8 random targets',
          },
        ],
      },
      {
        id: 'ilhwan_p2',
        trigger: 'hp_below',
        threshold: 50,
        atkMult: 1.6,
        spdMult: 1.4,
        antiHealPct: 50,
        patterns: [
          {
            name: 'Domaine Supreme',
            weight: 2,
            cooldown: 18,
            telegraphTime: 3.0,
            damage: 400,
            type: 'anti_heal',
            antiHealPct: 70,
            duration: 15,
            description: 'Supreme domain crushes healing for 15 seconds',
          },
        ],
      },
      {
        id: 'ilhwan_p3',
        trigger: 'hp_below',
        threshold: 15,
        atkMult: 2.5,
        spdMult: 2.0,
        regenMult: 3.0,
        antiHealPct: 90,
        patterns: [
          {
            name: 'Annihilation Totale',
            weight: 3,
            cooldown: 8,
            telegraphTime: 2.0,
            damage: 500,
            type: 'multi_hit',
            hitCount: 12,
            description: 'Total annihilation — 12 devastating strikes',
          },
        ],
      },
    ],
    lootTable: 'boss_15',
  },
];

export function getBossDefinition(index) {
  return BOSS_DEFINITIONS[index] || null;
}
