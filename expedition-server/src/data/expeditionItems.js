// ── Expedition V2 Items ──
// Real items referenced by lootTables.js
// Set pieces are resolved via expeditionSets.js, weapons via expeditionWeapons.js
// This file handles: armor, basic weapons, consumables, materials, currencies, skins, scrolls

export const EXPEDITION_ITEMS = [
  // ══════════════════════════════════════════════════════
  // SET: Armure de la Foret (Boss 1 drops)
  // ══════════════════════════════════════════════════════
  { id: 'exp_forest_helm', name: 'Heaume Sylvestre', type: 'armor', slot: 'helm', rarity: 'uncommon', binding: 'lqe', stats: { hp_flat: 500, def_flat: 10 }, setId: 'set_forest' },
  { id: 'exp_forest_chest', name: 'Plastron Sylvestre', type: 'armor', slot: 'chest', rarity: 'uncommon', binding: 'lqe', stats: { hp_flat: 800, def_flat: 15 }, setId: 'set_forest' },
  { id: 'exp_forest_gloves', name: 'Gantelets Sylvestres', type: 'armor', slot: 'gloves', rarity: 'uncommon', binding: 'lqe', stats: { atk_flat: 15, crit_rate: 3 }, setId: 'set_forest' },
  { id: 'exp_forest_boots', name: 'Bottes Sylvestres', type: 'armor', slot: 'boots', rarity: 'uncommon', binding: 'lqe', stats: { spd_flat: 8, def_flat: 10 }, setId: 'set_forest' },

  // ══════════════════════════════════════════════════════
  // SET: Carapace de Pierre (Boss 2 drops)
  // ══════════════════════════════════════════════════════
  { id: 'exp_stone_helm', name: 'Heaume de Pierre', type: 'armor', slot: 'helm', rarity: 'rare', binding: 'lqe', stats: { hp_flat: 800, def_flat: 20 }, setId: 'set_stone' },
  { id: 'exp_stone_chest', name: 'Plastron de Pierre', type: 'armor', slot: 'chest', rarity: 'rare', binding: 'lqe', stats: { hp_flat: 1200, def_flat: 30 }, setId: 'set_stone' },
  { id: 'exp_stone_gloves', name: 'Gantelets de Pierre', type: 'armor', slot: 'gloves', rarity: 'rare', binding: 'lqe', stats: { def_flat: 20, res_flat: 5 }, setId: 'set_stone' },
  { id: 'exp_stone_boots', name: 'Bottes de Pierre', type: 'armor', slot: 'boots', rarity: 'rare', binding: 'lqe', stats: { def_flat: 15, hp_flat: 600 }, setId: 'set_stone' },

  // ══════════════════════════════════════════════════════
  // SET: Voile d'Ombre (Boss 3 drops)
  // ══════════════════════════════════════════════════════
  { id: 'exp_shadow_helm', name: 'Capuche d\'Ombre', type: 'armor', slot: 'helm', rarity: 'epic', binding: 'lqe', stats: { atk_flat: 25, crit_rate: 5 }, setId: 'set_shadow' },
  { id: 'exp_shadow_chest', name: 'Tunique d\'Ombre', type: 'armor', slot: 'chest', rarity: 'epic', binding: 'lqe', stats: { atk_flat: 35, hp_flat: 500 }, setId: 'set_shadow' },
  { id: 'exp_shadow_gloves', name: 'Griffes d\'Ombre', type: 'armor', slot: 'gloves', rarity: 'epic', binding: 'lqe', stats: { atk_flat: 30, crit_rate: 8 }, setId: 'set_shadow' },
  { id: 'exp_shadow_boots', name: 'Sandales d\'Ombre', type: 'armor', slot: 'boots', rarity: 'epic', binding: 'lqe', stats: { spd_flat: 15, atk_flat: 20 }, setId: 'set_shadow' },

  // ══════════════════════════════════════════════════════
  // WEAPONS
  // ══════════════════════════════════════════════════════
  { id: 'exp_sword_forest', name: 'Epee de Mousse', type: 'weapon', slot: 'weapon', rarity: 'uncommon', binding: 'lqe', stats: { atk_flat: 30 } },
  { id: 'exp_staff_forest', name: 'Baton Ancien', type: 'weapon', slot: 'weapon', rarity: 'uncommon', binding: 'lqe', stats: { atk_flat: 25, res_flat: 8 } },
  { id: 'exp_sword_stone', name: 'Lame de Granit', type: 'weapon', slot: 'weapon', rarity: 'rare', binding: 'lqe', stats: { atk_flat: 50, def_flat: 15 } },
  { id: 'exp_bow_stone', name: 'Arc Petrifie', type: 'weapon', slot: 'weapon', rarity: 'rare', binding: 'lqe', stats: { atk_flat: 45, crit_rate: 5 } },
  { id: 'exp_blade_shadow', name: 'Lame du Neant', type: 'weapon', slot: 'weapon', rarity: 'epic', binding: 'lqr', stats: { atk_flat: 80, crit_rate: 10 } },
  { id: 'exp_staff_shadow', name: 'Sceptre des Tenebres', type: 'weapon', slot: 'weapon', rarity: 'epic', binding: 'lqr', stats: { atk_flat: 70, res_flat: 15 } },

  // ══════════════════════════════════════════════════════
  // CONSUMABLES & MATERIALS (from mob waves)
  // ══════════════════════════════════════════════════════
  { id: 'exp_potion_hp', name: 'Potion de Soin', type: 'consumable', slot: null, rarity: 'common', binding: 'tradeable', stats: null, description: 'Restaure 20% des PV' },
  { id: 'exp_potion_mana', name: 'Potion de Mana', type: 'consumable', slot: null, rarity: 'common', binding: 'tradeable', stats: null, description: 'Restaure 30% du mana' },
  { id: 'exp_elixir_atk', name: 'Elixir d\'Attaque', type: 'consumable', slot: null, rarity: 'uncommon', binding: 'tradeable', stats: null, description: '+15% ATK pour le prochain combat' },
  { id: 'exp_mat_wood', name: 'Bois Ancien', type: 'material', slot: null, rarity: 'common', binding: 'tradeable', stats: null, description: 'Materiau de craft' },
  { id: 'exp_mat_stone', name: 'Pierre Enchantee', type: 'material', slot: null, rarity: 'common', binding: 'tradeable', stats: null, description: 'Materiau de craft' },
  { id: 'exp_mat_shadow_dust', name: 'Poussiere d\'Ombre', type: 'material', slot: null, rarity: 'uncommon', binding: 'tradeable', stats: null, description: 'Materiau de craft rare' },
  { id: 'exp_mat_void_crystal', name: 'Cristal du Neant', type: 'material', slot: null, rarity: 'rare', binding: 'tradeable', stats: null, description: 'Materiau de craft endgame (Zone Neant)' },
  { id: 'exp_mat_essence', name: 'Essence de Boss', type: 'material', slot: null, rarity: 'rare', binding: 'tradeable', stats: null, description: 'Tombe des boss uniquement' },

  // ══════════════════════════════════════════════════════
  // SKINS (ultra-rare, LqR)
  // ══════════════════════════════════════════════════════
  { id: 'exp_skin_forest_aura', name: 'Aura Sylvestre', type: 'skin', slot: null, rarity: 'legendary', binding: 'lqr', stats: null, description: 'Aura verte lumineuse autour du personnage' },
  { id: 'exp_skin_stone_armor', name: 'Armure Vivante', type: 'skin', slot: null, rarity: 'legendary', binding: 'lqr', stats: null, description: 'Apparence de golem en pierre' },

  // ══════════════════════════════════════════════════════
  // SKILL SCROLLS (rare, LqR)
  // ══════════════════════════════════════════════════════
  { id: 'exp_skill_nature_heal', name: 'Soin de la Nature', type: 'skill_scroll', slot: null, rarity: 'epic', binding: 'lqr', stats: null, description: 'Soigne 20% HP de toute l\'equipe (CD 5min)' },
  { id: 'exp_skill_stone_wall', name: 'Mur de Pierre', type: 'skill_scroll', slot: null, rarity: 'epic', binding: 'lqr', stats: null, description: 'Bouclier absorbant 1 coup fatal (CD 5min)' },

  // ══════════════════════════════════════════════════════
  // CURRENCIES (from mob waves + bosses)
  // ══════════════════════════════════════════════════════
  { id: 'exp_alkahest', name: 'Alkahest', type: 'currency', slot: null, rarity: 'rare', binding: 'tradeable', stats: null, description: 'Permet de reroll les stats d\'artefacts' },
  { id: 'exp_marteau_rouge', name: 'Marteau Rouge', type: 'currency', slot: null, rarity: 'epic', binding: 'tradeable', stats: null, description: 'Monnaie d\'echange pour armes exclusives' },
  { id: 'exp_contribution', name: 'Points de Contribution', type: 'currency', slot: null, rarity: 'uncommon', binding: 'tradeable', stats: null, description: 'Points de contribution d\'expedition' },
];

export function getItemById(id) {
  return EXPEDITION_ITEMS.find(i => i.id === id) || null;
}

export function getItemsByRarity(rarity) {
  return EXPEDITION_ITEMS.filter(i => i.rarity === rarity);
}

export function getSRableItems() {
  // Items that can be soft-reserved (armor, weapons, skins, skill scrolls — not consumables/mats/currencies)
  return EXPEDITION_ITEMS.filter(i =>
    i.type !== 'consumable' && i.type !== 'material' && i.type !== 'currency'
  );
}
