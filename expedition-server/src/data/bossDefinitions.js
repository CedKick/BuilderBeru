// ── Boss Definitions for Expedition I (Phase 1: 3 bosses) ──

export const BOSS_DEFINITIONS = [
  // ═══════════════════════════════════════════════════════
  // BOSS 1: Gardien de la Foret (Intro)
  // ═══════════════════════════════════════════════════════
  {
    id: 'forest_guardian',
    name: 'Gardien de la Foret',
    index: 0,
    hp: 50_000_000,
    atk: 400,
    def: 30,
    spd: 40,
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
    hp: 120_000_000,
    atk: 600,
    def: 60,
    spd: 30,
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
    hp: 200_000_000,
    atk: 900,
    def: 40,
    spd: 55,
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
];

export function getBossDefinition(index) {
  return BOSS_DEFINITIONS[index] || null;
}
