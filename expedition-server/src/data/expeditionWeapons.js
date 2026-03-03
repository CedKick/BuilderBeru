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
