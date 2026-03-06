// ── Expedition Weapons V2 ──
// 10 new weapons with powerful passives (A0 only, no awakening)
// Drop from Boss 7-15

export const EXPEDITION_WEAPONS = {
  // ═══════════════════════════════════════════════════════
  // LEGENDARY WEAPONS (comparable to current top weapons)
  // ═══════════════════════════════════════════════════════

  excalibur: {
    id: 'excalibur',
    name: 'Excalibur',
    atk: 280,
    element: 'light',
    type: 'sword',
    rarity: 'mythique',
    binding: 'lqr',
    bonus: { atk_pct: 20 },
    passive: {
      id: 'holy_blade',
      description: 'HP > 80%: degats +25%. Kill: auto-heal 3% max HP. Absorbe 1 coup mortel (CD 60s).',
      triggers: ['on_hit', 'on_kill', 'on_death'],
    },
    dropBoss: 14, // Boss 15 (index 14)
    dropChance: 0.5,
  },

  mjolnir: {
    id: 'mjolnir',
    name: 'Mjolnir',
    atk: 270,
    element: 'water',
    type: 'hammer',
    rarity: 'mythique',
    binding: 'lqr',
    bonus: { def_pct: 15 },
    passive: {
      id: 'chain_lightning',
      description: '30% chance frappe en chaine sur 2 ennemis (50% degats). Stun 1s tous les 10 coups.',
      triggers: ['on_hit'],
    },
    dropBoss: 11, // Boss 12
    dropChance: 1,
  },

  muramasa: {
    id: 'muramasa',
    name: 'Muramasa',
    atk: 300,
    element: 'shadow',
    type: 'katana',
    rarity: 'mythique',
    binding: 'lqr',
    bonus: { crit_dmg_pct: 30 },
    passive: {
      id: 'cursed_blade',
      description: 'Chaque crit: +3% ATK (max 30%). Perd 1% HP max/stack. A 10 stacks: prochain coup x3.',
      triggers: ['on_crit'],
    },
    dropBoss: 13, // Boss 14
    dropChance: 0.3,
  },

  yggdrasil: {
    id: 'yggdrasil',
    name: 'Yggdrasil',
    atk: 220,
    element: 'light',
    type: 'staff',
    rarity: 'mythique',
    binding: 'lqr',
    bonus: { heal_pct: 30 },
    passive: {
      id: 'world_tree',
      description: 'Soins +35%. Overheals = bouclier. Sorts soignent aussi 2 allies proches (30% du montant).',
      triggers: ['on_heal'],
    },
    dropBoss: 10, // Boss 11
    dropChance: 2,
  },

  gungnir: {
    id: 'gungnir',
    name: 'Gungnir',
    atk: 265,
    element: 'fire',
    type: 'lance',
    rarity: 'mythique',
    binding: 'lqr',
    bonus: { spd_flat: 18 },
    passive: {
      id: 'odin_spear',
      description: '1ere attaque combat: x2 degats. Tous les 15s: prochain coup = crit garanti. Perce backline.',
      triggers: ['on_hit', 'periodic'],
    },
    dropBoss: 12, // Boss 13
    dropChance: 0.8,
  },

  // ═══════════════════════════════════════════════════════
  // MYTHIC WEAPONS (above current top weapons)
  // ═══════════════════════════════════════════════════════

  nidhogg: {
    id: 'nidhogg',
    name: 'Nidhogg',
    atk: 255,
    element: 'shadow',
    type: 'scythe',
    rarity: 'mythique',
    binding: 'lqr',
    bonus: { lifesteal_pct: 15 },
    passive: {
      id: 'devoration',
      description: 'Kill = stack Devoration (+5% ATK, +3% vol vie, max 5 stacks). Reset au boss suivant.',
      triggers: ['on_kill'],
    },
    dropBoss: 9, // Boss 10
    dropChance: 1.5,
  },

  aegis_weapon: {
    id: 'aegis_weapon',
    name: 'Aegis',
    atk: 150,
    element: 'light',
    type: 'shield',
    rarity: 'mythique',
    binding: 'lqr',
    bonus: { def_pct: 35 },
    passive: {
      id: 'guardian_shield',
      description: 'Reduit degats subis -25%. Si allie meurt: +30% ATK, +20% DEF (15s). Aggro +50%.',
      triggers: ['on_ally_death', 'passive'],
    },
    dropBoss: 7, // Boss 8
    dropChance: 3,
  },

  caladbolg: {
    id: 'caladbolg',
    name: 'Caladbolg',
    atk: 275,
    element: 'fire',
    type: 'sword',
    rarity: 'mythique',
    binding: 'lqr',
    bonus: { crit_rate: 15 },
    passive: {
      id: 'flame_blade',
      description: 'Crits enflamment (3% HP max/s, 5s). Ennemi en feu: ATK +15%. 2+ ennemis en feu: ATK +25%.',
      triggers: ['on_crit'],
    },
    dropBoss: 8, // Boss 9
    dropChance: 2,
  },

  thyrsus: {
    id: 'thyrsus',
    name: 'Thyrsus',
    atk: 240,
    element: 'water',
    type: 'staff',
    rarity: 'mythique',
    binding: 'lqr',
    bonus: { mana_regen_pct: 50 },
    passive: {
      id: 'mana_flow',
      description: '20% chance sort gratuit (0 mana). Mana > 80%: degats +20%. Mana < 20%: regen x3.',
      triggers: ['on_skill', 'passive'],
    },
    dropBoss: 6, // Boss 7
    dropChance: 3,
  },

  gram: {
    id: 'gram',
    name: 'Gram',
    atk: 290,
    element: 'fire',
    type: 'greatsword',
    rarity: 'mythique',
    binding: 'lqr',
    bonus: { atk_pct: 25 },
    passive: {
      id: 'dragon_slayer',
      description: 'Tous les 5 coups: AoE 250% degats (150px). Chaque ennemi touche: prochain AoE +10% (stack infini).',
      triggers: ['on_hit'],
    },
    dropBoss: 14, // Boss 15
    dropChance: 0.3,
  },

  // ═══════════════════════════════════════════════════════
  // PHASE 2 — OVERCREEP WEAPONS (Boss 1-10)
  // ATK 340-400, surpass all existing weapons
  // ═══════════════════════════════════════════════════════

  ragnarok: {
    id: 'ragnarok',
    name: 'Ragnarök',
    atk: 350,
    element: 'fire',
    type: 'heavy',
    rarity: 'mythique',
    binding: 'lqr',
    bonus: { atk_pct: 30 },
    passive: {
      id: 'ragnarok_fury',
      description: 'Tous les 3 coups: AoE 400% feu (200px). Ennemis brules: -20% DEF. Kill: reset CD.',
      triggers: ['on_hit', 'on_kill'],
    },
    dropBoss: 0, // Boss 1
    dropChance: 10,
  },

  kusanagi: {
    id: 'kusanagi',
    name: 'Kusanagi',
    atk: 360,
    element: 'shadow',
    type: 'blade',
    rarity: 'mythique',
    binding: 'lqr',
    bonus: { crit_dmg_pct: 35 },
    passive: {
      id: 'kusanagi_edge',
      description: 'Crits: +5% ATK (max 50%). A 10 stacks: coup x5. Ignore 20% DEF permanent.',
      triggers: ['on_crit', 'passive'],
    },
    dropBoss: 1, // Boss 2
    dropChance: 10,
  },

  gae_bolg: {
    id: 'gae_bolg',
    name: 'Gáe Bolg',
    atk: 340,
    element: 'water',
    type: 'polearm',
    rarity: 'mythique',
    binding: 'lqr',
    scalingStat: 'int',
    bonus: { spd_flat: 22 },
    passive: {
      id: 'gae_bolg_pierce',
      description: 'Perce en ligne. 1ere attaque: x3. Tous les 10s: dash 300px + AoE 200%.',
      triggers: ['on_hit', 'periodic'],
    },
    dropBoss: 2, // Boss 3
    dropChance: 10,
  },

  masamune: {
    id: 'masamune',
    name: 'Masamune',
    atk: 370,
    element: 'light',
    type: 'blade',
    rarity: 'mythique',
    binding: 'lqr',
    bonus: { atk_pct: 28 },
    passive: {
      id: 'masamune_zen',
      description: 'HP > 50%: +35% degats. Kill: heal 10% + bouclier 5%. Absorbe 2 coups mortels (CD 45s).',
      triggers: ['on_hit', 'on_kill', 'on_death'],
    },
    dropBoss: 3, // Boss 4
    dropChance: 8,
  },

  longinus: {
    id: 'longinus',
    name: 'Lance de Longinus',
    atk: 390,
    element: 'light',
    type: 'polearm',
    rarity: 'mythique',
    binding: 'lqr',
    scalingStat: 'int',
    bonus: { crit_rate: 20 },
    passive: {
      id: 'holy_lance',
      description: 'Ignore 30% DEF. Crits: onde sacree 250px (150%). Boss: +25% degats permanent.',
      triggers: ['on_crit', 'passive'],
    },
    dropBoss: 4, // Boss 5
    dropChance: 8,
  },

  tyrfing: {
    id: 'tyrfing',
    name: 'Tyrfing',
    atk: 355,
    element: 'shadow',
    type: 'scythe',
    rarity: 'mythique',
    binding: 'lqr',
    scalingStat: 'int',
    bonus: { hp_pct: 20 },
    passive: {
      id: 'tyrfing_curse',
      description: 'Kill: +8% ATK +5% vol vie (10 stacks). HP < 30%: ATK x2 + invincible 3s (CD 60s).',
      triggers: ['on_kill', 'on_low_hp'],
    },
    dropBoss: 5, // Boss 6
    dropChance: 10,
  },

  ea_staff: {
    id: 'ea_staff',
    name: 'Ea, Bâton des Cieux',
    atk: 345,
    element: 'fire',
    type: 'staff',
    rarity: 'mythique',
    binding: 'lqr',
    scalingStat: 'int',
    bonus: { int_pct: 30 },
    passive: {
      id: 'ea_heaven',
      description: '30% sort gratuit. Mana > 90%: tous degats +40%. Sorts AoE: rayon +50%.',
      triggers: ['on_skill', 'passive'],
    },
    dropBoss: 6, // Boss 7
    dropChance: 10,
  },

  fragarach: {
    id: 'fragarach',
    name: 'Fragarach',
    atk: 365,
    element: 'wind',
    type: 'blade',
    rarity: 'mythique',
    binding: 'lqr',
    bonus: { atk_pct: 25 },
    passive: {
      id: 'fragarach_wind',
      description: 'Esquive +15%. Apres esquive: contre-attaque 300% + stun 2s. Tous les 5 coups: tornado 350%.',
      triggers: ['on_dodge', 'on_hit'],
    },
    dropBoss: 7, // Boss 8
    dropChance: 8,
  },

  tacos_eternel: {
    id: 'tacos_eternel',
    name: 'Tacos Éternel de Rayan',
    atk: 400,
    element: 'fire',
    type: 'heavy',
    rarity: 'mythique',
    binding: 'lqr',
    bonus: { atk_pct: 35 },
    passive: {
      id: 'tacos_power',
      description: 'Chaque coup: ennemi confus 2s (-30% precision). Kill: +10% tous stats (stack infini). 5 stacks: AoE kebab 500%. Rayan pleure.',
      triggers: ['on_hit', 'on_kill'],
    },
    dropBoss: 8, // Boss 9
    dropChance: 8,
  },

  amenonuhoko: {
    id: 'amenonuhoko',
    name: 'Ame-no-nuhoko',
    atk: 380,
    element: 'water',
    type: 'staff',
    rarity: 'mythique',
    binding: 'lqr',
    scalingStat: 'int',
    bonus: { hp_pct: 25 },
    passive: {
      id: 'divine_creation',
      description: 'Soins +50%. Overheals = bouclier (30% HP max). Resurrecte 1 allie/combat. Chaque attaque: +5% stat aleatoire a un coequipier aleatoire (stack infini).',
      triggers: ['on_heal', 'on_hit', 'on_ally_death'],
    },
    dropBoss: 9, // Boss 10
    dropChance: 8,
  },
};

export function getWeaponById(weaponId) {
  return EXPEDITION_WEAPONS[weaponId] || null;
}

export function getWeaponsByBoss(bossIndex) {
  return Object.values(EXPEDITION_WEAPONS).filter(w => w.dropBoss === bossIndex);
}

export function getAllWeapons() {
  return Object.values(EXPEDITION_WEAPONS);
}
