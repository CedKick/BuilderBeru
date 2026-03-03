// ── Expedition Sets V2 ──
// 10 Big Sets (powerful class-specific passives, LqR)
// 15 Medium Sets (solid stats, simple mechanics, LqE)

// ═══════════════════════════════════════════════════════════
// 10 BIG SETS — Powerful passives, class-specific
// ═══════════════════════════════════════════════════════════

export const BIG_SETS = {
  // ── 3.1 FUREUR DU TITAN (Fighter — Abysses) ──
  fureur_titan: {
    id: 'fureur_titan',
    name: 'Fureur du Titan',
    zone: 'abysses',
    rarity: 'epic',
    binding: 'lqr',
    targetClass: ['fighter'],
    bonus2pc: { atk_pct: 15 },
    bonus4pc: {
      passive: 'titan_fury',
      description: 'Chaque attaque: ATK +2% (max 20 stacks). A 20 stacks: crits garantis 5s puis reset. Kill = +3 stacks.',
    },
  },

  // ── 3.2 LAME FANTOME (Assassin — Abysses) ──
  lame_fantome: {
    id: 'lame_fantome',
    name: 'Lame Fantome',
    zone: 'abysses',
    rarity: 'epic',
    binding: 'lqr',
    targetClass: ['assassin'],
    bonus2pc: { crit_rate: 12 },
    bonus4pc: {
      passive: 'ghost_blade',
      description: 'Apres crit: prochain coup ignore 40% DEF. 15% chance double frappe. Kill = reset CD skill le plus long.',
    },
  },

  // ── 3.3 AEGIS DU GARDIEN (Tank — Abysses) ──
  aegis_gardien: {
    id: 'aegis_gardien',
    name: 'Aegis du Gardien',
    zone: 'abysses',
    rarity: 'epic',
    binding: 'lqr',
    targetClass: ['tank'],
    bonus2pc: { def_pct: 20, aggro_pct: 25 },
    bonus4pc: {
      passive: 'guardian_aegis',
      description: 'Absorbe 15% degats allies (200px). Bouclier a 50% max HP: explose AoE 300% ATK (150px), -20% ATK ennemis 8s.',
    },
  },

  // ── 3.4 SOUFFLE VITAL (Support — Abysses) ──
  souffle_vital: {
    id: 'souffle_vital',
    name: 'Souffle Vital',
    zone: 'abysses',
    rarity: 'epic',
    binding: 'lqr',
    targetClass: ['support'],
    bonus2pc: { heal_pct: 25 },
    bonus4pc: {
      passive: 'vital_breath',
      description: 'Overheals = bouclier (max 20% HP, 10s). Allie < 25% HP: heal auto 15% (CD 12s/allie). 15% chance soin crit x2.',
    },
  },

  // ── 3.5 TEMPETE D'ACIER (Fighter — Neant) ──
  tempete_acier: {
    id: 'tempete_acier',
    name: "Tempete d'Acier",
    zone: 'neant',
    rarity: 'legendary',
    binding: 'lqr',
    targetClass: ['fighter'],
    bonus2pc: { spd_pct: 15 },
    bonus4pc: {
      passive: 'steel_storm',
      description: 'Chaque 5eme attaque: 200% degats, ignore 20% DEF. SPD +5%/kill (max +25%). A +25%: doubles frappes.',
    },
  },

  // ── 3.6 VOIX DU NEANT (Mage — Neant) ──
  voix_neant: {
    id: 'voix_neant',
    name: 'Voix du Neant',
    zone: 'neant',
    rarity: 'legendary',
    binding: 'lqr',
    targetClass: ['mage'],
    bonus2pc: { magic_dmg_pct: 15 },
    bonus4pc: {
      passive: 'void_voice',
      description: 'Attaques: DoT 3% ATK/s 8s (stack x3). 3 stacks: ennemi +25% degats de TOUTES sources. DoT kill: AoE 200% ATK.',
    },
  },

  // ── 3.7 PACTE DE SANG (Assassin/Fighter — Neant) ──
  pacte_sang: {
    id: 'pacte_sang',
    name: 'Pacte de Sang',
    zone: 'neant',
    rarity: 'legendary',
    binding: 'lqr',
    targetClass: ['assassin', 'fighter'],
    bonus2pc: { lifesteal_pct: 10 },
    bonus4pc: {
      passive: 'blood_pact',
      description: 'HP < 50%: ATK +30%, vol vie +20%. Kill: restore 10% max HP. HP < 15%: annule coup mortel (CD 45s) + Frenzy ATK+50% SPD+30% 8s.',
    },
  },

  // ── 3.8 BASTION ETERNEL (Tank — Neant) ──
  bastion_eternel: {
    id: 'bastion_eternel',
    name: 'Bastion Eternel',
    zone: 'neant',
    rarity: 'legendary',
    binding: 'lqr',
    targetClass: ['tank'],
    bonus2pc: { hp_pct: 25 },
    bonus4pc: {
      passive: 'eternal_bastion',
      description: 'Resurrection passive: revient a 30% HP +50% DEF 10s (1x/combat). Allies 250px: bouclier 10% HP tank. DEF +1%/coup subi (max +20%).',
    },
  },

  // ── 3.9 HARMONIE CELESTE (Support — Neant) ──
  harmonie_celeste: {
    id: 'harmonie_celeste',
    name: 'Harmonie Celeste',
    zone: 'neant',
    rarity: 'legendary',
    binding: 'lqr',
    targetClass: ['support'],
    bonus2pc: { mana_regen_pct: 50 },
    bonus4pc: {
      passive: 'celestial_harmony',
      description: 'Buffs durent +50%. Sort lance: allies 300px +5% ATK (stack x3=+15%, 8s). Tous les 30s: mega-heal equipe 10% HP + cleanse.',
    },
  },

  // ── 3.10 NOVA ARCANIQUE (Mage — Foret/Abysses) ──
  nova_arcanique: {
    id: 'nova_arcanique',
    name: 'Nova Arcanique',
    zone: 'foret',
    rarity: 'epic',
    binding: 'lqe',
    targetClass: ['mage'],
    bonus2pc: { mana_max_pct: 30 },
    bonus4pc: {
      passive: 'arcane_nova',
      description: 'Apres 3 sorts: 4eme fait x2 degats et 0 mana. Kill par sort: tous CD -2s. Mana > 80%: degats +15%.',
    },
  },
};

// ═══════════════════════════════════════════════════════════
// 15 MEDIUM SETS — Stats solides, mécaniques simples
// ═══════════════════════════════════════════════════════════

export const MEDIUM_SETS = {
  // ── ZONE FORET (Boss 1-5) — LqE ──

  ecailles_drake: {
    id: 'ecailles_drake',
    name: 'Ecailles de Drake',
    zone: 'foret',
    rarity: 'rare',
    binding: 'lqe',
    targetClass: ['tank'],
    bonus2pc: { def_pct: 12 },
    bonus4pc: { hp_pct: 15, aoe_reduction_pct: 15 },
  },
  crocs_loup: {
    id: 'crocs_loup',
    name: 'Crocs du Loup',
    zone: 'foret',
    rarity: 'rare',
    binding: 'lqe',
    targetClass: ['fighter'],
    bonus2pc: { atk_pct: 10 },
    bonus4pc: { crit_rate: 6, crit_dmg_pct: 12 },
  },
  plumes_phenix: {
    id: 'plumes_phenix',
    name: 'Plumes de Phenix',
    zone: 'foret',
    rarity: 'rare',
    binding: 'lqe',
    targetClass: ['all'],
    bonus2pc: { heal_received_pct: 15 },
    bonus4pc: { passive: 'phoenix_regen', description: 'HP < 40%: regen 2% HP/5s' },
  },
  griffes_wyverne: {
    id: 'griffes_wyverne',
    name: 'Griffes de Wyverne',
    zone: 'foret',
    rarity: 'rare',
    binding: 'lqe',
    targetClass: ['assassin'],
    bonus2pc: { atk_pct: 8 },
    bonus4pc: { spd_pct: 8, double_attack_pct: 5 },
  },
  ronce_vivante: {
    id: 'ronce_vivante',
    name: 'Ronce Vivante',
    zone: 'foret',
    rarity: 'rare',
    binding: 'lqe',
    targetClass: ['tank', 'fighter'],
    bonus2pc: { def_pct: 10 },
    bonus4pc: { passive: 'thorn_reflect', description: 'Reflete 8% degats subis' },
  },

  // ── ZONE ABYSSES (Boss 6-10) — LqE ──

  souffle_glacial: {
    id: 'souffle_glacial',
    name: 'Souffle Glacial',
    zone: 'abysses',
    rarity: 'epic',
    binding: 'lqe',
    targetClass: ['mage'],
    bonus2pc: { water_dmg_pct: 12 },
    bonus4pc: { passive: 'frost_slow', description: 'Attaques: -10% SPD ennemis 3s' },
  },
  cendres_ardentes: {
    id: 'cendres_ardentes',
    name: 'Cendres Ardentes',
    zone: 'abysses',
    rarity: 'epic',
    binding: 'lqe',
    targetClass: ['mage', 'fighter'],
    bonus2pc: { fire_dmg_pct: 12 },
    bonus4pc: { passive: 'burn_proc', description: '10% chance brulure (3% HP/s, 4s)' },
  },
  murmure_ombre: {
    id: 'murmure_ombre',
    name: "Murmure d'Ombre",
    zone: 'abysses',
    rarity: 'epic',
    binding: 'lqe',
    targetClass: ['assassin'],
    bonus2pc: { shadow_dmg_pct: 12 },
    bonus4pc: { passive: 'shadow_dodge', description: '8% esquive, si esquive: +30% prochain coup' },
  },
  lumiere_sacree: {
    id: 'lumiere_sacree',
    name: 'Lumiere Sacree',
    zone: 'abysses',
    rarity: 'epic',
    binding: 'lqe',
    targetClass: ['support'],
    bonus2pc: { heal_pct: 15 },
    bonus4pc: { res_flat: 8, passive: 'sacred_splash', description: 'Soins touchent aussi 2eme allie le plus blesse pour 30%' },
  },
  cuirasse_fer: {
    id: 'cuirasse_fer',
    name: 'Cuirasse de Fer',
    zone: 'abysses',
    rarity: 'epic',
    binding: 'lqe',
    targetClass: ['tank'],
    bonus2pc: { def_pct: 15 },
    bonus4pc: { passive: 'iron_guard', description: 'Reduit degats crits subis -25%, -5% ATK attaquant 3s' },
  },

  // ── ZONE NEANT (Boss 11-15) — LqE (tradeable avant equip) ──

  ailes_vent: {
    id: 'ailes_vent',
    name: 'Ailes du Vent',
    zone: 'neant',
    rarity: 'epic',
    binding: 'lqe',
    targetClass: ['assassin'],
    bonus2pc: { spd_pct: 12 },
    bonus4pc: { passive: 'wind_rush', description: 'Esquive +5%, 1ere attaque combat = crit garanti' },
  },
  sang_guerrier: {
    id: 'sang_guerrier',
    name: 'Sang du Guerrier',
    zone: 'neant',
    rarity: 'epic',
    binding: 'lqe',
    targetClass: ['fighter'],
    bonus2pc: { atk_pct: 12 },
    bonus4pc: { passive: 'warrior_blood', description: 'Vol vie +8%, kill: +3% ATK (max +15%, reset au boss)' },
  },
  totem_ancestral: {
    id: 'totem_ancestral',
    name: 'Totem Ancestral',
    zone: 'neant',
    rarity: 'epic',
    binding: 'lqe',
    targetClass: ['tank', 'support'],
    bonus2pc: { hp_pct: 15 },
    bonus4pc: { passive: 'ancestral_aura', description: 'Allies 200px: +5% DEF, +3% HP regen' },
  },
  brume_mystique: {
    id: 'brume_mystique',
    name: 'Brume Mystique',
    zone: 'neant',
    rarity: 'epic',
    binding: 'lqe',
    targetClass: ['mage', 'support'],
    bonus2pc: { mana_max_pct: 20 },
    bonus4pc: { passive: 'mystic_mist', description: 'Cout mana -10%, 10% chance sort gratuit' },
  },
  lien_meute: {
    id: 'lien_meute',
    name: 'Lien de Meute',
    zone: 'neant',
    rarity: 'epic',
    binding: 'lqe',
    targetClass: ['all'],
    bonus2pc: { atk_pct: 5, def_pct: 5 },
    bonus4pc: { passive: 'pack_bond', description: 'Si 3 hunters du meme joueur en vie: ATK +10%, DEF +10%' },
  },
};

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

export const ALL_SETS = { ...BIG_SETS, ...MEDIUM_SETS };

export function getSetById(setId) {
  return ALL_SETS[setId] || null;
}

export function getSetsByZone(zone) {
  return Object.values(ALL_SETS).filter(s => s.zone === zone);
}

export function getBigSets() {
  return Object.values(BIG_SETS);
}

export function getMediumSets() {
  return Object.values(MEDIUM_SETS);
}
