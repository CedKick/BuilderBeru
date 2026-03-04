// ── Boss Definitions for Expedition I ──
// regenPct: passive HP regen per tick (% of maxHP per second). Progressive 1%→3% boss 1→15.

export const BOSS_DEFINITIONS = [
  // ═══════════════════════════════════════════════════════
  // BOSS 1: Gardien de la Foret (Intro)
  // ═══════════════════════════════════════════════════════
  {
    id: 'forest_guardian',
    name: 'Gardien de la Foret',
    index: 0,
    hp: 21_160_000,   // +15% again (manaRestore balance)
    atk: 2100,
    def: 35,
    regenPct: 1.0,    // 1% maxHP/s
    spd: 42,
    enrageTimer: 300,     // 5 minutes
    enrageHpPercent: 0,   // No HP enrage, only timer
    autoAttackPower: 100,
    patterns: [
      {
        name: 'Cleave Frontal',
        weight: 3,
        cooldown: 6,
        telegraphTime: 2.0,
        damage: 800,     // ATK * this / 100
        type: 'frontal',    // Hits characters in front of boss
        range: 200,
        description: 'Large sweeping attack hitting the frontline',
      },
      {
        name: 'Stomp',
        weight: 2,
        cooldown: 10,
        telegraphTime: 2.5,
        damage: 600,
        type: 'aoe_melee',  // Hits all characters near boss
        range: 250,
        description: 'Ground stomp damaging nearby characters',
      },
      {
        name: 'Invocation Slimes',
        weight: 1,
        cooldown: 20,
        telegraphTime: 1.5,
        damage: 0,
        type: 'summon',
        summon: { template: 'slime', count: 3, difficultyMult: 1.5 },
        description: 'Summons 3 empowered slimes',
      },
    ],
    lootTable: 'boss_1',
  },

  // ═══════════════════════════════════════════════════════
  // BOSS 2: Sentinelle de Pierre (Mid)
  // ═══════════════════════════════════════════════════════
  {
    id: 'stone_sentinel',
    name: 'Sentinelle de Pierre',
    index: 1,
    hp: 31_740_000,   // +15% again
    atk: 2900,
    def: 46,
    regenPct: 1.14,
    spd: 35,
    enrageTimer: 300,
    enrageHpPercent: 0,
    autoAttackPower: 120,
    patterns: [
      {
        name: 'Lancer de Roc',
        weight: 3,
        cooldown: 8,
        telegraphTime: 2.0,
        damage: 1000,
        type: 'aoe_ranged',   // Hits characters at range (backline!)
        range: 400,
        aoeRadius: 150,
        description: 'Throws a boulder at the backline',
      },
      {
        name: 'Slam Sol',
        weight: 2,
        cooldown: 6,
        telegraphTime: 1.8,
        damage: 1200,
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
        healPercent: 5,       // Heals 5% of max HP
        description: 'Raises an earth shield, regenerating HP',
      },
      {
        name: 'Invocation Golems',
        weight: 1,
        cooldown: 30,
        telegraphTime: 2.0,
        damage: 0,
        type: 'summon',
        summon: { template: 'golem', count: 2, difficultyMult: 1.0 },
        description: 'Summons 2 stone golems',
      },
    ],
    lootTable: 'boss_2',
  },

  // ═══════════════════════════════════════════════════════
  // BOSS 3: Seigneur Ombre (Hard)
  // ═══════════════════════════════════════════════════════
  {
    id: 'shadow_lord',
    name: 'Seigneur Ombre',
    index: 2,
    hp: 43_700_000,   // +15% again
    atk: 4600,
    def: 40,
    regenPct: 1.29,
    spd: 58,
    enrageTimer: 240,     // 4 minutes
    enrageHpPercent: 20,  // Enrages at 20% HP
    autoAttackPower: 150,
    patterns: [
      {
        name: 'Lame d\'Ombre',
        weight: 3,
        cooldown: 5,
        telegraphTime: 1.5,
        damage: 1500,
        type: 'frontal',
        range: 250,
        description: 'Shadow blade cleaves the frontline',
      },
      {
        name: 'Tenebres',
        weight: 2,
        cooldown: 12,
        telegraphTime: 2.5,
        damage: 1000,
        type: 'aoe_ranged',  // Targets backline
        range: 500,
        aoeRadius: 200,
        description: 'Darkness engulfs the backline',
      },
      {
        name: 'Necromancie',
        weight: 1,
        cooldown: 18,
        telegraphTime: 2.0,
        damage: 0,
        type: 'summon',
        summon: { template: 'skeleton', count: 5, difficultyMult: 2.0 },
        description: 'Raises 5 undead skeletons',
      },
      {
        name: 'Drain d\'Ame',
        weight: 1,
        cooldown: 20,
        telegraphTime: 3.0,
        damage: 2000,
        type: 'aoe_all',     // Hits everyone
        healPercent: 2,       // Boss heals for 2% of max HP
        description: 'Drains life from all characters',
      },
    ],
    lootTable: 'boss_3',
  },

  // ═══════════════════════════════════════════════════════
  // BOSS 4: Ancien des Racines (Zone Foret)
  // ═══════════════════════════════════════════════════════
  {
    id: 'root_ancient',
    name: 'Ancien des Racines',
    index: 3,
    hp: 60_950_000,   // +15% again
    atk: 4000,
    def: 58,
    regenPct: 1.43,
    spd: 32,
    enrageTimer: 300,
    enrageHpPercent: 0,
    autoAttackPower: 110,
    patterns: [
      {
        name: 'Empalement Racinaire',
        weight: 3,
        cooldown: 6,
        telegraphTime: 2.5,
        damage: 900,
        type: 'aoe_melee',
        range: 300,
        description: 'Roots erupt from the ground, impaling melee range',
      },
      {
        name: 'Constriction',
        weight: 2,
        cooldown: 12,
        telegraphTime: 2.0,
        damage: 700,
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
        cooldown: 25,
        telegraphTime: 2.0,
        damage: 0,
        type: 'summon',
        summon: { template: 'golem', count: 3, difficultyMult: 1.5 },
        description: 'Summons 3 treant guardians',
      },
    ],
    lootTable: 'boss_4',
  },

  // ═══════════════════════════════════════════════════════
  // BOSS 5: Reine Sylvestre (Zone Foret — final)
  // ═══════════════════════════════════════════════════════
  {
    id: 'sylvan_queen',
    name: 'Reine Sylvestre',
    index: 4,
    hp: 90_850_000,   // +15%
    atk: 5800,
    def: 52,
    regenPct: 1.57,
    spd: 55,
    enrageTimer: 270,
    enrageHpPercent: 15,
    autoAttackPower: 130,
    patterns: [
      {
        name: 'Pluie d\'Epines',
        weight: 3,
        cooldown: 5,
        telegraphTime: 1.8,
        damage: 1100,
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
        damage: 1400,
        type: 'frontal',
        range: 250,
        description: 'Deadly vine embrace on the frontline',
      },
      {
        name: 'Charme Sylvestre',
        weight: 1,
        cooldown: 20,
        telegraphTime: 3.0,
        damage: 600,
        type: 'aoe_all',
        description: 'Charming aura damages and confuses all',
      },
      {
        name: 'Invocation Essaim',
        weight: 1,
        cooldown: 18,
        telegraphTime: 1.5,
        damage: 0,
        type: 'summon',
        summon: { template: 'goblin', count: 8, difficultyMult: 2.0 },
        description: 'Summons a swarm of fae creatures',
      },
    ],
    lootTable: 'boss_5',
  },

  // ═══════════════════════════════════════════════════════
  // BOSS 6: Leviathan (Zone Abysses)
  // ═══════════════════════════════════════════════════════
  {
    id: 'leviathan',
    name: 'Leviathan',
    index: 5,
    hp: 131_100_000,  // +15%
    atk: 7200,
    def: 72,
    regenPct: 1.71,
    spd: 42,
    enrageTimer: 300,
    enrageHpPercent: 0,
    autoAttackPower: 140,
    patterns: [
      {
        name: 'Raz-de-Maree',
        weight: 3,
        cooldown: 7,
        telegraphTime: 2.5,
        damage: 1300,
        type: 'aoe_all',
        description: 'Massive tidal wave hits everyone',
      },
      {
        name: 'Morsure Abyssale',
        weight: 2,
        cooldown: 5,
        telegraphTime: 1.5,
        damage: 1800,
        type: 'frontal',
        range: 200,
        description: 'Devastating bite on frontline',
      },
      {
        name: 'Tourbillon',
        weight: 1,
        cooldown: 15,
        telegraphTime: 2.0,
        damage: 1000,
        type: 'aoe_melee',
        range: 350,
        description: 'Whirlpool drags and damages nearby characters',
      },
      {
        name: 'Invocation Profondeurs',
        weight: 1,
        cooldown: 25,
        telegraphTime: 2.0,
        damage: 0,
        type: 'summon',
        summon: { template: 'orc', count: 4, difficultyMult: 2.0 },
        description: 'Summons 4 abyssal creatures',
      },
    ],
    lootTable: 'boss_6',
  },

  // ═══════════════════════════════════════════════════════
  // BOSS 7: Sorcier Abyssal (Zone Abysses)
  // ═══════════════════════════════════════════════════════
  {
    id: 'abyssal_sorcerer',
    name: 'Sorcier Abyssal',
    index: 6,
    hp: 169_050_000,  // +15%
    atk: 8400,
    def: 60,
    regenPct: 1.86,
    spd: 50,
    enrageTimer: 270,
    enrageHpPercent: 0,
    autoAttackPower: 120,
    patterns: [
      {
        name: 'Rayon Maudit',
        weight: 3,
        cooldown: 5,
        telegraphTime: 1.5,
        damage: 1600,
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
        damage: 1200,
        type: 'aoe_melee',
        range: 300,
        description: 'Dark nova around the sorcerer',
      },
      {
        name: 'Drain de Mana',
        weight: 1,
        cooldown: 20,
        telegraphTime: 2.0,
        damage: 800,
        type: 'aoe_all',
        healPercent: 3,
        description: 'Drains mana and life from all, self-heals',
      },
      {
        name: 'Invocation Dark Mages',
        weight: 1,
        cooldown: 22,
        telegraphTime: 2.0,
        damage: 0,
        type: 'summon',
        summon: { template: 'dark_mage', count: 4, difficultyMult: 2.5 },
        description: 'Summons 4 dark mage acolytes',
      },
    ],
    lootTable: 'boss_7',
  },

  // ═══════════════════════════════════════════════════════
  // BOSS 8: Titan de Fer (Zone Abysses)
  // ═══════════════════════════════════════════════════════
  {
    id: 'iron_titan',
    name: 'Titan de Fer',
    index: 7,
    hp: 230_000_000,  // +15%
    atk: 6600,
    def: 96,
    regenPct: 2.0,
    spd: 30,
    enrageTimer: 300,
    enrageHpPercent: 0,
    autoAttackPower: 160,
    patterns: [
      {
        name: 'Poing de Fer',
        weight: 3,
        cooldown: 6,
        telegraphTime: 2.5,
        damage: 2000,
        type: 'frontal',
        range: 250,
        description: 'Massive iron fist crushing the frontline',
      },
      {
        name: 'Seisme',
        weight: 2,
        cooldown: 12,
        telegraphTime: 3.0,
        damage: 1400,
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
        healPercent: 4,
        description: 'Reinforces armor, regenerating HP',
      },
      {
        name: 'Invocation Golems de Fer',
        weight: 1,
        cooldown: 28,
        telegraphTime: 2.0,
        damage: 0,
        type: 'summon',
        summon: { template: 'golem', count: 3, difficultyMult: 2.5 },
        description: 'Summons 3 iron golems',
      },
    ],
    lootTable: 'boss_8',
  },

  // ═══════════════════════════════════════════════════════
  // BOSS 9: Hydre Venimeuse (Zone Abysses)
  // ═══════════════════════════════════════════════════════
  {
    id: 'venomous_hydra',
    name: 'Hydre Venimeuse',
    index: 8,
    hp: 304_750_000,  // +15%
    atk: 9500,
    def: 72,
    regenPct: 2.14,
    spd: 55,
    enrageTimer: 240,
    enrageHpPercent: 25,
    autoAttackPower: 140,
    patterns: [
      {
        name: 'Triple Morsure',
        weight: 3,
        cooldown: 4,
        telegraphTime: 1.5,
        damage: 1600,
        type: 'frontal',
        range: 200,
        description: 'Three heads bite the frontline simultaneously',
      },
      {
        name: 'Crachat Venimeux',
        weight: 2,
        cooldown: 8,
        telegraphTime: 2.0,
        damage: 1200,
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
        healPercent: 5,
        description: 'Severed heads regrow, healing the hydra',
      },
      {
        name: 'Nuage Toxique',
        weight: 2,
        cooldown: 15,
        telegraphTime: 2.5,
        damage: 900,
        type: 'aoe_all',
        description: 'Toxic cloud poisons all characters',
      },
    ],
    lootTable: 'boss_9',
  },

  // ═══════════════════════════════════════════════════════
  // BOSS 10: Roi des Profondeurs (Zone Abysses — final)
  // ═══════════════════════════════════════════════════════
  {
    id: 'deep_king',
    name: 'Roi des Profondeurs',
    index: 9,
    hp: 396_750_000,  // +15%
    atk: 10500,
    def: 84,
    regenPct: 2.29,
    spd: 50,
    enrageTimer: 300,
    enrageHpPercent: 20,
    autoAttackPower: 150,
    patterns: [
      {
        name: 'Jugement Abyssal',
        weight: 3,
        cooldown: 6,
        telegraphTime: 2.0,
        damage: 2200,
        type: 'frontal',
        range: 300,
        description: 'Royal judgment cleaves the frontline',
      },
      {
        name: 'Maree Noire',
        weight: 2,
        cooldown: 10,
        telegraphTime: 3.0,
        damage: 1500,
        type: 'aoe_all',
        description: 'Dark tide engulfs all characters',
      },
      {
        name: 'Trident Royal',
        weight: 2,
        cooldown: 8,
        telegraphTime: 1.8,
        damage: 1800,
        type: 'aoe_ranged',
        range: 500,
        aoeRadius: 200,
        description: 'Trident blast targeting the backline',
      },
      {
        name: 'Invocation Gardes Royaux',
        weight: 1,
        cooldown: 30,
        telegraphTime: 2.5,
        damage: 0,
        type: 'summon',
        summon: { template: 'orc', count: 6, difficultyMult: 3.0 },
        description: 'Summons 6 royal deep guards',
      },
    ],
    lootTable: 'boss_10',
  },

  // ═══════════════════════════════════════════════════════
  // BOSS 11: Spectre Originel (Zone Neant)
  //   Exponential jump from boss 10 (345M → 750M)
  //   Mechanic: anti-heal phases + spectral multi-hits
  // ═══════════════════════════════════════════════════════
  {
    id: 'origin_specter',
    name: 'Spectre Originel',
    index: 10,
    hp: 862_500_000,  // +15%
    atk: 13000,
    def: 100,
    regenPct: 2.5,
    spd: 60,
    enrageTimer: 270,
    enrageHpPercent: 20,
    autoAttackPower: 160,
    patterns: [
      {
        name: 'Toucher Spectral',
        weight: 3,
        cooldown: 4,
        telegraphTime: 1.2,
        damage: 2200,
        type: 'frontal',
        range: 250,
        description: 'Ghostly touch phasing through defenses',
      },
      {
        name: 'Hurlement du Neant',
        weight: 2,
        cooldown: 12,
        telegraphTime: 2.5,
        damage: 1600,
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
        healPercent: 3,
        description: 'Phases out of reality, regenerating',
      },
      {
        name: 'Invocation Fantomes',
        weight: 1,
        cooldown: 18,
        telegraphTime: 1.5,
        damage: 0,
        type: 'summon',
        summon: { template: 'skeleton', count: 8, difficultyMult: 3.5 },
        description: 'Summons 8 spectral warriors',
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
            damage: 800,
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
            damage: 1200,
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
  //   Mechanic: gradual anti-heal + void multi-hits + regen amplification
  // ═══════════════════════════════════════════════════════
  {
    id: 'void_archon',
    name: 'Archonte du Vide',
    index: 11,
    hp: 1_610_000_000,  // +15%
    atk: 16000,
    def: 120,
    regenPct: 2.6,
    spd: 58,
    enrageTimer: 300,
    enrageHpPercent: 15,
    autoAttackPower: 180,
    patterns: [
      {
        name: 'Decret du Vide',
        weight: 3,
        cooldown: 5,
        telegraphTime: 2.0,
        damage: 3000,
        type: 'frontal',
        range: 300,
        description: 'Void decree obliterates the frontline',
      },
      {
        name: 'Singularite',
        weight: 2,
        cooldown: 15,
        telegraphTime: 3.0,
        damage: 2400,
        type: 'aoe_all',
        description: 'Creates a singularity damaging everyone',
      },
      {
        name: 'Annihilation',
        weight: 1,
        cooldown: 10,
        telegraphTime: 2.0,
        damage: 2600,
        type: 'aoe_ranged',
        range: 500,
        aoeRadius: 300,
        description: 'Annihilation beam on backline',
      },
      {
        name: 'Invocation Sentinelles du Vide',
        weight: 1,
        cooldown: 25,
        telegraphTime: 2.0,
        damage: 0,
        type: 'summon',
        summon: { template: 'golem', count: 4, difficultyMult: 4.0 },
        description: 'Summons 4 void sentinels',
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
            damage: 1800,
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
            damage: 3500,
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
  //   Mechanic: chaos multi-hits + execute on low HP targets
  // ═══════════════════════════════════════════════════════
  {
    id: 'chaos_dragon',
    name: 'Dragon du Chaos',
    index: 12,
    hp: 2_875_000_000,  // +15%
    atk: 19000,
    def: 115,
    regenPct: 2.8,
    spd: 66,
    enrageTimer: 240,
    enrageHpPercent: 25,
    autoAttackPower: 200,
    patterns: [
      {
        name: 'Souffle du Chaos',
        weight: 3,
        cooldown: 6,
        telegraphTime: 2.0,
        damage: 3500,
        type: 'frontal',
        range: 350,
        description: 'Chaotic breath incinerates the frontline',
      },
      {
        name: 'Battement d\'Ailes',
        weight: 2,
        cooldown: 8,
        telegraphTime: 2.5,
        damage: 2200,
        type: 'aoe_all',
        description: 'Wing buffet sends shockwaves at everyone',
      },
      {
        name: 'Meteor du Chaos',
        weight: 1,
        cooldown: 15,
        telegraphTime: 3.0,
        damage: 3800,
        type: 'aoe_ranged',
        range: 500,
        aoeRadius: 250,
        description: 'Chaos meteor crashes on the backline',
      },
      {
        name: 'Invocation Drakelings',
        weight: 1,
        cooldown: 20,
        telegraphTime: 2.0,
        damage: 0,
        type: 'summon',
        summon: { template: 'orc', count: 6, difficultyMult: 4.0 },
        description: 'Summons 6 chaos drakelings',
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
            damage: 2000,
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
            damage: 8000,
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
  //   Mechanic: time warp speed + anti-heal aura + execute
  // ═══════════════════════════════════════════════════════
  {
    id: 'eternal_monarch',
    name: 'Monarque Eternel',
    index: 13,
    hp: 5_175_000_000,  // +15%
    atk: 22000,
    def: 140,
    regenPct: 3.0,
    spd: 62,
    enrageTimer: 300,
    enrageHpPercent: 15,
    autoAttackPower: 220,
    patterns: [
      {
        name: 'Decret Eternel',
        weight: 3,
        cooldown: 5,
        telegraphTime: 2.0,
        damage: 4500,
        type: 'frontal',
        range: 300,
        description: 'The Monarch\'s eternal decree crushes the frontline',
      },
      {
        name: 'Tempete du Temps',
        weight: 2,
        cooldown: 12,
        telegraphTime: 3.0,
        damage: 3500,
        type: 'aoe_all',
        description: 'Time storm warping reality around all characters',
      },
      {
        name: 'Rayon d\'Eternite',
        weight: 1,
        cooldown: 10,
        telegraphTime: 2.0,
        damage: 4000,
        type: 'aoe_ranged',
        range: 500,
        aoeRadius: 250,
        description: 'Eternity beam targeting the backline',
      },
      {
        name: 'Invocation Chevaliers Eternels',
        weight: 1,
        cooldown: 30,
        telegraphTime: 2.5,
        damage: 0,
        type: 'summon',
        summon: { template: 'orc', count: 8, difficultyMult: 4.5 },
        description: 'Summons 8 eternal knights',
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
            damage: 2000,
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
            damage: 12000,
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
  //   3 phases: progressive anti-heal, multi-hit army, total annihilation
  // ═══════════════════════════════════════════════════════
  {
    id: 'sung_ilhwan',
    name: 'Sung Il-Hwan',
    index: 14,
    hp: 11_500_000_000, // +15% (11.5B HP)
    atk: 25000,
    def: 130,
    regenPct: 3.0,
    spd: 75,
    enrageTimer: 360,
    enrageHpPercent: 20,
    autoAttackPower: 250,
    patterns: [
      {
        name: 'Frappe du Chasseur Supreme',
        weight: 3,
        cooldown: 4,
        telegraphTime: 1.5,
        damage: 5000,
        type: 'frontal',
        range: 300,
        description: 'The supreme hunter\'s devastating strike',
      },
      {
        name: 'Domain du Monarque',
        weight: 2,
        cooldown: 15,
        telegraphTime: 3.0,
        damage: 4000,
        type: 'aoe_all',
        description: 'Monarch domain damages all living characters',
      },
      {
        name: 'Armee des Ombres',
        weight: 1,
        cooldown: 20,
        telegraphTime: 2.0,
        damage: 0,
        type: 'summon',
        summon: { template: 'skeleton', count: 12, difficultyMult: 5.0 },
        description: 'Summons his legendary shadow army',
      },
      {
        name: 'Echange de Vie',
        weight: 1,
        cooldown: 25,
        telegraphTime: 3.0,
        damage: 5000,
        type: 'aoe_all',
        healPercent: 5,
        description: 'Drains all life force, healing significantly',
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
            damage: 2500,
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
            damage: 3000,
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
            damage: 3000,
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
