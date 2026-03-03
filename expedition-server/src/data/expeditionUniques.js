// ── Expedition Unique Artifacts V2 ──
// 20 unique artifacts, 1 per account, obtained via achievements
// No set, equippable on corresponding slot type. Fixed main stat + passive (no random subs).
// Binding: LqR (bound on pickup)

export const UNIQUE_ARTIFACTS = {
  // ═══════════════════════════════════════════════════════
  // TIER 1 — Premiers pas (Boss 1-3)
  // ═══════════════════════════════════════════════════════

  oeil_monarque: {
    id: 'oeil_monarque',
    name: 'Oeil du Monarque',
    slot: 'anneau',
    rarity: 'legendary',
    binding: 'lqr',
    stats: { crit_rate: 10 },
    passive: { id: 'boss_insight', description: 'Affiche les HP precis des boss + barre de phase' },
    achievement: { type: 'boss_first_kill', bossIndex: 0, description: 'Tuer Boss 1 la 1ere fois' },
  },

  larme_foret: {
    id: 'larme_foret',
    name: 'Larme de la Foret',
    slot: 'collier',
    rarity: 'legendary',
    binding: 'lqr',
    stats: { hp_regen_pct: 2 },
    passive: { id: 'forest_tear', description: 'Soins recus +20%' },
    achievement: { type: 'boss_deathless', bossIndex: 0, description: 'Clear Boss 1 sans mort d\'equipe' },
  },

  coeur_pierre: {
    id: 'coeur_pierre',
    name: 'Coeur de Pierre',
    slot: 'plastron',
    rarity: 'legendary',
    binding: 'lqr',
    stats: { def_pct: 15 },
    passive: { id: 'stone_heart', description: 'Reduction degats AoE -15%' },
    achievement: { type: 'boss_first_kill', bossIndex: 1, description: 'Tuer Boss 2 la 1ere fois' },
  },

  fragment_sentinelle: {
    id: 'fragment_sentinelle',
    name: 'Fragment de Sentinelle',
    slot: 'casque',
    rarity: 'legendary',
    binding: 'lqr',
    stats: { atk_pct: 10, def_pct: 10 },
    passive: { id: 'sentinel_fragment', description: 'Premiere attaque de combat: +50% degats' },
    achievement: { type: 'boss_speed_kill', bossIndex: 1, timeLimit: 180, description: 'Kill Boss 2 en < 3min' },
  },

  voile_seigneur: {
    id: 'voile_seigneur',
    name: 'Voile du Seigneur',
    slot: 'bottes',
    rarity: 'legendary',
    binding: 'lqr',
    stats: { spd_pct: 15 },
    passive: { id: 'shadow_veil', description: '10% esquive, si esquive: +20% prochain coup' },
    achievement: { type: 'boss_first_kill', bossIndex: 2, description: 'Tuer Boss 3 la 1ere fois' },
  },

  plume_ange_noir: {
    id: 'plume_ange_noir',
    name: 'Plume de l\'Ange Noir',
    slot: 'boucles',
    rarity: 'legendary',
    binding: 'lqr',
    stats: { all_dmg_pct: 12 },
    passive: { id: 'dark_angel', description: 'RES +10, immunite silence' },
    achievement: { type: 'boss_deathless', bossIndex: 2, description: 'Clear Boss 3 sans mort d\'equipe' },
  },

  // ═══════════════════════════════════════════════════════
  // TIER 2 — Progression (Boss 4-8 + achievements)
  // ═══════════════════════════════════════════════════════

  sceau_commandant: {
    id: 'sceau_commandant',
    name: 'Sceau du Commandant',
    slot: 'bracelet',
    rarity: 'legendary',
    binding: 'lqr',
    stats: {},
    passive: { id: 'commander_seal', description: 'Allies proches: ATK +8%, CD -5%' },
    achievement: { type: 'expedition_leader', count: 10, description: 'Leader de 10 expeditions reussies' },
  },

  marque_survivant: {
    id: 'marque_survivant',
    name: 'Marque du Survivant',
    slot: 'anneau',
    rarity: 'legendary',
    binding: 'lqr',
    stats: {},
    passive: { id: 'survivor_mark', description: 'HP < 20%: DEF +40%, vol vie +15%' },
    achievement: { type: 'wipe_survivor', count: 50, description: 'Survivre a 50 wipes cumules' },
  },

  essence_primordiale: {
    id: 'essence_primordiale',
    name: 'Essence Primordiale',
    slot: 'collier',
    rarity: 'legendary',
    binding: 'lqr',
    stats: { all_stats_pct: 5 },
    passive: { id: 'primordial_essence', description: 'XP expedition +10%' },
    achievement: { type: 'sets_completed', sets: ['set_forest', 'set_stone', 'set_shadow'], description: 'Completer les 3 sets foret' },
  },

  croc_warg: {
    id: 'croc_warg',
    name: 'Croc du Warg',
    slot: 'gants',
    rarity: 'legendary',
    binding: 'lqr',
    stats: { crit_rate: 8 },
    passive: { id: 'warg_fang', description: 'CRIT DMG +15%, kills: +1% ATK (max +5%, reset au boss)' },
    achievement: { type: 'mob_kills', count: 10000, description: 'Tuer 10,000 mobs en expedition' },
  },

  cape_fantome: {
    id: 'cape_fantome',
    name: 'Cape du Fantome',
    slot: 'plastron',
    rarity: 'legendary',
    binding: 'lqr',
    stats: { dodge_pct: 12 },
    passive: { id: 'ghost_cloak', description: 'SPD +8%, si esquive: invisible 2s (aggro reset)' },
    achievement: { type: 'no_death_streak', count: 5, description: '5 expeditions consecutives sans mourir' },
  },

  talisman_sage: {
    id: 'talisman_sage',
    name: 'Talisman du Sage',
    slot: 'boucles',
    rarity: 'legendary',
    binding: 'lqr',
    stats: { heal_pct: 20 },
    passive: { id: 'sage_talisman', description: 'Mana regen +30%, overheals = bouclier (max 15% HP)' },
    achievement: { type: 'heals_in_combat', count: 50, description: '50 heals en un seul combat' },
  },

  bague_architecte: {
    id: 'bague_architecte',
    name: 'Bague de l\'Architecte',
    slot: 'anneau',
    rarity: 'legendary',
    binding: 'lqr',
    stats: { all_dmg_pct: 8 },
    passive: { id: 'architect_ring', description: 'Drop rate essences +15%' },
    achievement: { type: 'expedition_count', count: 100, description: 'Participer a 100 expeditions' },
  },

  // ═══════════════════════════════════════════════════════
  // TIER 3 — Endgame (Boss 9-15 + challenges)
  // ═══════════════════════════════════════════════════════

  amulette_pionnier: {
    id: 'amulette_pionnier',
    name: 'Amulette du Pionnier',
    slot: 'collier',
    rarity: 'legendary',
    binding: 'lqr',
    stats: { hp_pct: 20 },
    passive: { id: 'pioneer_amulet', description: 'DEF +10%, immunite stun' },
    achievement: { type: 'server_first', bossIndex: 9, description: 'Premiere equipe a clear Boss 10 (server-wide)' },
  },

  diademe_astral: {
    id: 'diademe_astral',
    name: 'Diademe Astral',
    slot: 'casque',
    rarity: 'legendary',
    binding: 'lqr',
    stats: { mana_pct: 25 },
    passive: { id: 'astral_crown', description: 'CD sorts -10%, sorts AoE +15% degats' },
    achievement: { type: 'boss_first_kill', bossIndex: 9, description: 'Tuer Boss 10' },
  },

  gantelets_colosse: {
    id: 'gantelets_colosse',
    name: 'Gantelets du Colosse',
    slot: 'gants',
    rarity: 'legendary',
    binding: 'lqr',
    stats: { atk_pct: 15 },
    passive: { id: 'colossus_gauntlets', description: 'Ignore 10% DEF, crits = onde de choc 50px' },
    achievement: { type: 'total_damage', amount: 1_000_000_000, description: 'Infliger 1 milliard de degats cumules' },
  },

  sceaux_abysse: {
    id: 'sceaux_abysse',
    name: 'Sceaux de l\'Abysse',
    slot: 'bracelet',
    rarity: 'legendary',
    binding: 'lqr',
    stats: { lifesteal_pct: 10 },
    passive: { id: 'abyss_seals', description: 'ATK +12%, kill: +1s duree buffs actifs' },
    achievement: { type: 'boss_first_kill', bossIndex: 11, description: 'Tuer Boss 12' },
  },

  bottes_explorateur: {
    id: 'bottes_explorateur',
    name: 'Bottes de l\'Explorateur',
    slot: 'bottes',
    rarity: 'legendary',
    binding: 'lqr',
    stats: { spd_pct: 20 },
    passive: { id: 'explorer_boots', description: 'Tous stats +3%, immunite ralentissement' },
    achievement: { type: 'all_bosses_cleared', description: 'Completer les 15 boss' },
  },

  couronne_vainqueur: {
    id: 'couronne_vainqueur',
    name: 'Couronne du Vainqueur',
    slot: 'casque',
    rarity: 'legendary',
    binding: 'lqr',
    stats: { crit_dmg_pct: 25 },
    passive: { id: 'victor_crown', description: 'ATK +8%, crit: 3% chance sort bonus gratuit' },
    achievement: { type: 'mvp_count', count: 10, description: 'MVP (top DPS) 10 fois' },
  },

  relique_temps: {
    id: 'relique_temps',
    name: 'Relique du Temps',
    slot: 'boucles',
    rarity: 'legendary',
    binding: 'lqr',
    stats: { cd_reduction_pct: 15 },
    passive: { id: 'time_relic', description: 'SPD +10%, mana regen +20%' },
    achievement: { type: 'playtime_hours', hours: 500, description: '500h de jeu en expedition' },
  },
};

export function getUniqueById(uniqueId) {
  return UNIQUE_ARTIFACTS[uniqueId] || null;
}

export function getUniquesByTier(tier) {
  const tiers = {
    1: [0, 1, 2],     // Boss 1-3 achievements
    2: [3, 4, 5, 6, 7, 8], // Boss 4-8 + general achievements
    3: [9, 10, 11, 12, 13, 14], // Boss 9-15 + endgame
  };
  const indices = tiers[tier] || [];
  const allUniques = Object.values(UNIQUE_ARTIFACTS);
  return indices.map(i => allUniques[i]).filter(Boolean);
}

export function getAllUniques() {
  return Object.values(UNIQUE_ARTIFACTS);
}
