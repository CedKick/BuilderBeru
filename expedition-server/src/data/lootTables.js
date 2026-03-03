// ── Loot Tables for Expedition V2 — 15 Bosses ──
// dropChance is a percentage (0-100), multi-drop system (total can exceed 100%)
// Each entry has: name, rarity, dropChance — resolved at runtime by LootEngine
// essences drop separately via essenceSystem.js (on mob kill + boss kill)
//
// ── dropChance ranges by rarity ──
// Common:    15-25%
// Uncommon:  10-18%
// Rare:       5-12%
// Epic:       2-8%
// Legendary:  0.5-3%
// Mythique:   0.3-2%

export const LOOT_TABLES = {
  // ═══════════════════════════════════════════════════════
  // MOB WAVE LOOT (gear, mats, sets — rolled individually per wave)
  // Currencies (alkahest, marteau rouge, contribution) are handled
  // separately by LootEngine.rollTrashDrops() on a per-mob-kill basis
  // and distributed equally to ALL alive players.
  // ═══════════════════════════════════════════════════════

  mob_wave_tier1: [
    { itemId: 'exp_potion_hp', dropChance: 40 },
    { itemId: 'exp_potion_mana', dropChance: 30 },
    { itemId: 'exp_mat_wood', dropChance: 50 },
    // Set pieces (small chance from mob waves)
    { itemId: 'set_ecailles_drake_piece', dropChance: 3, setId: 'ecailles_drake' },
    { itemId: 'set_crocs_loup_piece', dropChance: 3, setId: 'crocs_loup' },
    { itemId: 'set_plumes_phenix_piece', dropChance: 2, setId: 'plumes_phenix' },
    // Basic gear
    { itemId: 'exp_forest_helm', dropChance: 5 },
    { itemId: 'exp_forest_chest', dropChance: 5 },
  ],

  mob_wave_tier2: [
    { itemId: 'exp_potion_hp', dropChance: 35 },
    { itemId: 'exp_potion_mana', dropChance: 35 },
    { itemId: 'exp_mat_wood', dropChance: 40 },
    { itemId: 'exp_mat_stone', dropChance: 40 },
    { itemId: 'exp_elixir_atk', dropChance: 15 },
    // Set pieces
    { itemId: 'set_crocs_loup_piece', dropChance: 4, setId: 'crocs_loup' },
    { itemId: 'set_griffes_wyverne_piece', dropChance: 4, setId: 'griffes_wyverne' },
    { itemId: 'set_ronce_vivante_piece', dropChance: 3, setId: 'ronce_vivante' },
    { itemId: 'set_plumes_phenix_piece', dropChance: 3, setId: 'plumes_phenix' },
    // Gear
    { itemId: 'exp_stone_helm', dropChance: 4 },
    { itemId: 'exp_stone_chest', dropChance: 4 },
    { itemId: 'exp_sword_forest', dropChance: 3 },
  ],

  mob_wave_tier3: [
    { itemId: 'exp_potion_hp', dropChance: 30 },
    { itemId: 'exp_potion_mana', dropChance: 30 },
    { itemId: 'exp_mat_stone', dropChance: 45 },
    { itemId: 'exp_mat_shadow_dust', dropChance: 25 },
    { itemId: 'exp_elixir_atk', dropChance: 20 },
    // Medium sets (Abysses zone)
    { itemId: 'set_souffle_glacial_piece', dropChance: 4, setId: 'souffle_glacial' },
    { itemId: 'set_cendres_ardentes_piece', dropChance: 4, setId: 'cendres_ardentes' },
    { itemId: 'set_murmure_ombre_piece', dropChance: 3, setId: 'murmure_ombre' },
    { itemId: 'set_lumiere_sacree_piece', dropChance: 3, setId: 'lumiere_sacree' },
    { itemId: 'set_cuirasse_fer_piece', dropChance: 3, setId: 'cuirasse_fer' },
    // Big sets (rare from mobs)
    { itemId: 'set_fureur_titan_piece', dropChance: 0.5, setId: 'fureur_titan' },
    { itemId: 'set_aegis_gardien_piece', dropChance: 0.5, setId: 'aegis_gardien' },
    // Gear
    { itemId: 'exp_blade_shadow', dropChance: 2 },
    { itemId: 'exp_staff_shadow', dropChance: 2 },
  ],

  mob_wave_tier4: [
    { itemId: 'exp_potion_hp', dropChance: 25 },
    { itemId: 'exp_potion_mana', dropChance: 25 },
    { itemId: 'exp_mat_shadow_dust', dropChance: 40 },
    { itemId: 'exp_mat_void_crystal', dropChance: 15 },
    { itemId: 'exp_elixir_atk', dropChance: 25 },
    // Medium sets (Neant zone)
    { itemId: 'set_ailes_vent_piece', dropChance: 5, setId: 'ailes_vent' },
    { itemId: 'set_sang_guerrier_piece', dropChance: 5, setId: 'sang_guerrier' },
    { itemId: 'set_totem_ancestral_piece', dropChance: 4, setId: 'totem_ancestral' },
    { itemId: 'set_brume_mystique_piece', dropChance: 4, setId: 'brume_mystique' },
    { itemId: 'set_lien_meute_piece', dropChance: 3, setId: 'lien_meute' },
    // Big sets (rare from mobs)
    { itemId: 'set_tempete_acier_piece', dropChance: 1, setId: 'tempete_acier' },
    { itemId: 'set_voix_neant_piece', dropChance: 1, setId: 'voix_neant' },
    { itemId: 'set_pacte_sang_piece', dropChance: 0.8, setId: 'pacte_sang' },
    { itemId: 'set_bastion_eternel_piece', dropChance: 0.8, setId: 'bastion_eternel' },
    { itemId: 'set_harmonie_celeste_piece', dropChance: 0.8, setId: 'harmonie_celeste' },
  ],

  // ═══════════════════════════════════════════════════════
  // ZONE FORET — Boss 1-5 (14 / 14 / 13 / 11 / 10 loots)
  // ═══════════════════════════════════════════════════════

  boss_1: [
    // Armure Sylvestre (uncommon)
    { itemId: 'exp_forest_helm', name: 'Heaume Sylvestre', rarity: 'uncommon', dropChance: 18 },
    { itemId: 'exp_forest_chest', name: 'Plastron Sylvestre', rarity: 'uncommon', dropChance: 18 },
    { itemId: 'exp_forest_gloves', name: 'Gantelets Sylvestres', rarity: 'uncommon', dropChance: 16 },
    { itemId: 'exp_forest_boots', name: 'Bottes Sylvestres', rarity: 'uncommon', dropChance: 16 },
    // Sets (rare)
    { itemId: 'set_ecailles_drake_piece', name: 'Piece: Ecailles de Drake', rarity: 'rare', dropChance: 10, setId: 'ecailles_drake' },
    { itemId: 'set_crocs_loup_piece', name: 'Piece: Crocs du Loup', rarity: 'rare', dropChance: 10, setId: 'crocs_loup' },
    // Armes (uncommon)
    { itemId: 'exp_sword_forest', name: 'Epee de Mousse', rarity: 'uncommon', dropChance: 15 },
    { itemId: 'exp_staff_forest', name: 'Baton Ancien', rarity: 'uncommon', dropChance: 15 },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_wood', name: 'Bois Ancien', rarity: 'common', dropChance: 25 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 8 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 3 },
    // Ultra-rare
    { itemId: 'exp_skin_forest_aura', name: 'Aura Sylvestre', rarity: 'legendary', dropChance: 0.5 },
    { itemId: 'exp_skill_nature_heal', name: 'Soin de la Nature', rarity: 'epic', dropChance: 2 },
  ],

  boss_2: [
    // Armure de Pierre (rare)
    { itemId: 'exp_stone_helm', name: 'Heaume de Pierre', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_stone_chest', name: 'Plastron de Pierre', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_stone_gloves', name: 'Gantelets de Pierre', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_stone_boots', name: 'Bottes de Pierre', rarity: 'rare', dropChance: 10 },
    // Sets (rare)
    { itemId: 'set_plumes_phenix_piece', name: 'Piece: Plumes de Phenix', rarity: 'rare', dropChance: 8, setId: 'plumes_phenix' },
    { itemId: 'set_ronce_vivante_piece', name: 'Piece: Ronce Vivante', rarity: 'rare', dropChance: 8, setId: 'ronce_vivante' },
    // Armes (rare)
    { itemId: 'exp_sword_stone', name: 'Lame de Granit', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_bow_stone', name: 'Arc Petrifie', rarity: 'rare', dropChance: 10 },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_stone', name: 'Pierre Enchantee', rarity: 'common', dropChance: 25 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 8 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 3 },
    // Ultra-rare
    { itemId: 'exp_skin_stone_armor', name: 'Armure Vivante', rarity: 'legendary', dropChance: 0.5 },
    { itemId: 'exp_skill_stone_wall', name: 'Mur de Pierre', rarity: 'epic', dropChance: 2 },
  ],

  boss_3: [
    // Armure d'Ombre (epic)
    { itemId: 'exp_shadow_helm', name: "Capuche d'Ombre", rarity: 'epic', dropChance: 7 },
    { itemId: 'exp_shadow_chest', name: "Tunique d'Ombre", rarity: 'epic', dropChance: 7 },
    { itemId: 'exp_shadow_gloves', name: "Griffes d'Ombre", rarity: 'epic', dropChance: 6 },
    { itemId: 'exp_shadow_boots', name: "Sandales d'Ombre", rarity: 'epic', dropChance: 6 },
    // Set (rare)
    { itemId: 'set_griffes_wyverne_piece', name: 'Piece: Griffes de Wyverne', rarity: 'rare', dropChance: 10, setId: 'griffes_wyverne' },
    // Armes (epic)
    { itemId: 'exp_blade_shadow', name: 'Lame du Neant', rarity: 'epic', dropChance: 5 },
    { itemId: 'exp_staff_shadow', name: 'Sceptre des Tenebres', rarity: 'epic', dropChance: 5 },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_shadow_dust', name: "Poussiere d'Ombre", rarity: 'uncommon', dropChance: 18 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 4 },
    // Recup zone precedente
    { itemId: 'exp_forest_helm', name: 'Heaume Sylvestre', rarity: 'uncommon', dropChance: 12 },
    { itemId: 'exp_stone_helm', name: 'Heaume de Pierre', rarity: 'rare', dropChance: 8 },
  ],

  boss_4: [
    // Sets zone Foret (rare)
    { itemId: 'set_ecailles_drake_piece', name: 'Piece: Ecailles de Drake', rarity: 'rare', dropChance: 12, setId: 'ecailles_drake' },
    { itemId: 'set_plumes_phenix_piece', name: 'Piece: Plumes de Phenix', rarity: 'rare', dropChance: 12, setId: 'plumes_phenix' },
    { itemId: 'set_ronce_vivante_piece', name: 'Piece: Ronce Vivante', rarity: 'rare', dropChance: 10, setId: 'ronce_vivante' },
    // Big set (epic)
    { itemId: 'set_nova_arcanique_piece', name: 'Piece: Nova Arcanique', rarity: 'epic', dropChance: 3, setId: 'nova_arcanique' },
    // Armes
    { itemId: 'exp_sword_stone', name: 'Lame de Granit', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_blade_shadow', name: 'Lame du Neant', rarity: 'epic', dropChance: 4 },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_wood', name: 'Bois Ancien', rarity: 'common', dropChance: 22 },
    { itemId: 'exp_mat_stone', name: 'Pierre Enchantee', rarity: 'common', dropChance: 20 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 5 },
  ],

  boss_5: [
    // Sets zone Foret (rare)
    { itemId: 'set_crocs_loup_piece', name: 'Piece: Crocs du Loup', rarity: 'rare', dropChance: 12, setId: 'crocs_loup' },
    { itemId: 'set_griffes_wyverne_piece', name: 'Piece: Griffes de Wyverne', rarity: 'rare', dropChance: 12, setId: 'griffes_wyverne' },
    { itemId: 'set_ecailles_drake_piece', name: 'Piece: Ecailles de Drake', rarity: 'rare', dropChance: 10, setId: 'ecailles_drake' },
    // Big set (epic)
    { itemId: 'set_nova_arcanique_piece', name: 'Piece: Nova Arcanique', rarity: 'epic', dropChance: 5, setId: 'nova_arcanique' },
    // Armes (epic)
    { itemId: 'exp_blade_shadow', name: 'Lame du Neant', rarity: 'epic', dropChance: 6 },
    { itemId: 'exp_staff_shadow', name: 'Sceptre des Tenebres', rarity: 'epic', dropChance: 6 },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_shadow_dust', name: "Poussiere d'Ombre", rarity: 'uncommon', dropChance: 18 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 5 },
  ],

  // ═══════════════════════════════════════════════════════
  // ZONE ABYSSES — Boss 6-10 (8 / 8 / 8 / 9 / 10 loots)
  // ═══════════════════════════════════════════════════════

  boss_6: [
    // Medium sets Abysses (epic)
    { itemId: 'set_souffle_glacial_piece', name: 'Piece: Souffle Glacial', rarity: 'epic', dropChance: 7, setId: 'souffle_glacial' },
    { itemId: 'set_cendres_ardentes_piece', name: 'Piece: Cendres Ardentes', rarity: 'epic', dropChance: 7, setId: 'cendres_ardentes' },
    // Big sets (epic)
    { itemId: 'set_fureur_titan_piece', name: 'Piece: Fureur du Titan', rarity: 'epic', dropChance: 3, setId: 'fureur_titan' },
    { itemId: 'set_aegis_gardien_piece', name: "Piece: Aegis du Gardien", rarity: 'epic', dropChance: 3, setId: 'aegis_gardien' },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_shadow_dust', name: "Poussiere d'Ombre", rarity: 'uncommon', dropChance: 18 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 5 },
  ],

  boss_7: [
    // Medium sets Abysses (epic)
    { itemId: 'set_murmure_ombre_piece', name: "Piece: Murmure d'Ombre", rarity: 'epic', dropChance: 7, setId: 'murmure_ombre' },
    { itemId: 'set_lumiere_sacree_piece', name: 'Piece: Lumiere Sacree', rarity: 'epic', dropChance: 7, setId: 'lumiere_sacree' },
    // Big sets (epic)
    { itemId: 'set_souffle_vital_piece', name: 'Piece: Souffle Vital', rarity: 'epic', dropChance: 5, setId: 'souffle_vital' },
    { itemId: 'set_lame_fantome_piece', name: 'Piece: Lame Fantome', rarity: 'epic', dropChance: 5, setId: 'lame_fantome' },
    // Arme mythique
    { itemId: 'weapon_thyrsus', name: 'Thyrsus', rarity: 'mythique', dropChance: 2, weaponId: 'thyrsus' },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 5 },
  ],

  boss_8: [
    // Medium set Abysses (epic)
    { itemId: 'set_cuirasse_fer_piece', name: 'Piece: Cuirasse de Fer', rarity: 'epic', dropChance: 7, setId: 'cuirasse_fer' },
    // Big sets (epic)
    { itemId: 'set_fureur_titan_piece', name: 'Piece: Fureur du Titan', rarity: 'epic', dropChance: 6, setId: 'fureur_titan' },
    { itemId: 'set_aegis_gardien_piece', name: "Piece: Aegis du Gardien", rarity: 'epic', dropChance: 6, setId: 'aegis_gardien' },
    // Arme mythique
    { itemId: 'weapon_aegis', name: 'Aegis', rarity: 'mythique', dropChance: 2, weaponId: 'aegis_weapon' },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_shadow_dust', name: "Poussiere d'Ombre", rarity: 'uncommon', dropChance: 15 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 5 },
  ],

  boss_9: [
    // Big sets (epic)
    { itemId: 'set_lame_fantome_piece', name: 'Piece: Lame Fantome', rarity: 'epic', dropChance: 6, setId: 'lame_fantome' },
    { itemId: 'set_souffle_vital_piece', name: 'Piece: Souffle Vital', rarity: 'epic', dropChance: 6, setId: 'souffle_vital' },
    { itemId: 'set_nova_arcanique_piece', name: 'Piece: Nova Arcanique', rarity: 'epic', dropChance: 5, setId: 'nova_arcanique' },
    // Arme mythique
    { itemId: 'weapon_caladbolg', name: 'Caladbolg', rarity: 'mythique', dropChance: 1.5, weaponId: 'caladbolg' },
    // Medium sets Abysses (epic)
    { itemId: 'set_souffle_glacial_piece', name: 'Piece: Souffle Glacial', rarity: 'epic', dropChance: 7, setId: 'souffle_glacial' },
    { itemId: 'set_cendres_ardentes_piece', name: 'Piece: Cendres Ardentes', rarity: 'epic', dropChance: 7, setId: 'cendres_ardentes' },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 6 },
  ],

  boss_10: [
    // Big sets (epic)
    { itemId: 'set_fureur_titan_piece', name: 'Piece: Fureur du Titan', rarity: 'epic', dropChance: 6, setId: 'fureur_titan' },
    { itemId: 'set_lame_fantome_piece', name: 'Piece: Lame Fantome', rarity: 'epic', dropChance: 6, setId: 'lame_fantome' },
    { itemId: 'set_aegis_gardien_piece', name: "Piece: Aegis du Gardien", rarity: 'epic', dropChance: 6, setId: 'aegis_gardien' },
    { itemId: 'set_souffle_vital_piece', name: 'Piece: Souffle Vital', rarity: 'epic', dropChance: 6, setId: 'souffle_vital' },
    // Arme mythique
    { itemId: 'weapon_nidhogg', name: 'Nidhogg', rarity: 'mythique', dropChance: 1.5, weaponId: 'nidhogg' },
    // Medium sets Abysses (epic)
    { itemId: 'set_cuirasse_fer_piece', name: 'Piece: Cuirasse de Fer', rarity: 'epic', dropChance: 7, setId: 'cuirasse_fer' },
    { itemId: 'set_murmure_ombre_piece', name: "Piece: Murmure d'Ombre", rarity: 'epic', dropChance: 7, setId: 'murmure_ombre' },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 6 },
  ],

  // ═══════════════════════════════════════════════════════
  // ZONE NEANT — Boss 11-15 (9 / 9 / 9 / 11 / 14 loots)
  // ═══════════════════════════════════════════════════════

  boss_11: [
    // Medium sets Neant (epic)
    { itemId: 'set_ailes_vent_piece', name: 'Piece: Ailes du Vent', rarity: 'epic', dropChance: 7, setId: 'ailes_vent' },
    { itemId: 'set_sang_guerrier_piece', name: 'Piece: Sang du Guerrier', rarity: 'epic', dropChance: 7, setId: 'sang_guerrier' },
    // Big sets (legendary)
    { itemId: 'set_tempete_acier_piece', name: "Piece: Tempete d'Acier", rarity: 'legendary', dropChance: 2.5, setId: 'tempete_acier' },
    { itemId: 'set_voix_neant_piece', name: 'Piece: Voix du Neant', rarity: 'legendary', dropChance: 2.5, setId: 'voix_neant' },
    // Arme mythique
    { itemId: 'weapon_yggdrasil', name: 'Yggdrasil', rarity: 'mythique', dropChance: 1.5, weaponId: 'yggdrasil' },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_void_crystal', name: 'Cristal du Neant', rarity: 'rare', dropChance: 10 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 6 },
  ],

  boss_12: [
    // Medium sets Neant (epic)
    { itemId: 'set_totem_ancestral_piece', name: 'Piece: Totem Ancestral', rarity: 'epic', dropChance: 7, setId: 'totem_ancestral' },
    { itemId: 'set_brume_mystique_piece', name: 'Piece: Brume Mystique', rarity: 'epic', dropChance: 7, setId: 'brume_mystique' },
    // Big sets (legendary)
    { itemId: 'set_pacte_sang_piece', name: 'Piece: Pacte de Sang', rarity: 'legendary', dropChance: 2.5, setId: 'pacte_sang' },
    { itemId: 'set_bastion_eternel_piece', name: 'Piece: Bastion Eternel', rarity: 'legendary', dropChance: 2.5, setId: 'bastion_eternel' },
    // Arme mythique
    { itemId: 'weapon_mjolnir', name: 'Mjolnir', rarity: 'mythique', dropChance: 1, weaponId: 'mjolnir' },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_void_crystal', name: 'Cristal du Neant', rarity: 'rare', dropChance: 10 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 6 },
  ],

  boss_13: [
    // Medium set Neant (epic)
    { itemId: 'set_lien_meute_piece', name: 'Piece: Lien de Meute', rarity: 'epic', dropChance: 7, setId: 'lien_meute' },
    // Big sets (legendary)
    { itemId: 'set_tempete_acier_piece', name: "Piece: Tempete d'Acier", rarity: 'legendary', dropChance: 2, setId: 'tempete_acier' },
    { itemId: 'set_voix_neant_piece', name: 'Piece: Voix du Neant', rarity: 'legendary', dropChance: 2, setId: 'voix_neant' },
    { itemId: 'set_harmonie_celeste_piece', name: 'Piece: Harmonie Celeste', rarity: 'legendary', dropChance: 1.5, setId: 'harmonie_celeste' },
    // Arme mythique
    { itemId: 'weapon_gungnir', name: 'Gungnir', rarity: 'mythique', dropChance: 0.8, weaponId: 'gungnir' },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_void_crystal', name: 'Cristal du Neant', rarity: 'rare', dropChance: 12 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 7 },
  ],

  boss_14: [
    // Big sets (legendary)
    { itemId: 'set_pacte_sang_piece', name: 'Piece: Pacte de Sang', rarity: 'legendary', dropChance: 2.5, setId: 'pacte_sang' },
    { itemId: 'set_bastion_eternel_piece', name: 'Piece: Bastion Eternel', rarity: 'legendary', dropChance: 2.5, setId: 'bastion_eternel' },
    { itemId: 'set_harmonie_celeste_piece', name: 'Piece: Harmonie Celeste', rarity: 'legendary', dropChance: 2, setId: 'harmonie_celeste' },
    { itemId: 'set_tempete_acier_piece', name: "Piece: Tempete d'Acier", rarity: 'legendary', dropChance: 2, setId: 'tempete_acier' },
    // Arme mythique
    { itemId: 'weapon_muramasa', name: 'Muramasa', rarity: 'mythique', dropChance: 0.5, weaponId: 'muramasa' },
    // Medium sets Neant (epic)
    { itemId: 'set_ailes_vent_piece', name: 'Piece: Ailes du Vent', rarity: 'epic', dropChance: 7, setId: 'ailes_vent' },
    { itemId: 'set_sang_guerrier_piece', name: 'Piece: Sang du Guerrier', rarity: 'epic', dropChance: 7, setId: 'sang_guerrier' },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_void_crystal', name: 'Cristal du Neant', rarity: 'rare', dropChance: 12 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 7 },
  ],

  boss_15: [
    // Big sets (legendary) — le boss ultime les drop tous
    { itemId: 'set_tempete_acier_piece', name: "Piece: Tempete d'Acier", rarity: 'legendary', dropChance: 3, setId: 'tempete_acier' },
    { itemId: 'set_voix_neant_piece', name: 'Piece: Voix du Neant', rarity: 'legendary', dropChance: 3, setId: 'voix_neant' },
    { itemId: 'set_pacte_sang_piece', name: 'Piece: Pacte de Sang', rarity: 'legendary', dropChance: 3, setId: 'pacte_sang' },
    { itemId: 'set_bastion_eternel_piece', name: 'Piece: Bastion Eternel', rarity: 'legendary', dropChance: 3, setId: 'bastion_eternel' },
    { itemId: 'set_harmonie_celeste_piece', name: 'Piece: Harmonie Celeste', rarity: 'legendary', dropChance: 3, setId: 'harmonie_celeste' },
    // Armes mythiques
    { itemId: 'weapon_excalibur', name: 'Excalibur', rarity: 'mythique', dropChance: 0.5, weaponId: 'excalibur' },
    { itemId: 'weapon_gram', name: 'Gram', rarity: 'mythique', dropChance: 0.3, weaponId: 'gram' },
    // Medium sets Neant (epic)
    { itemId: 'set_lien_meute_piece', name: 'Piece: Lien de Meute', rarity: 'epic', dropChance: 7, setId: 'lien_meute' },
    { itemId: 'set_totem_ancestral_piece', name: 'Piece: Totem Ancestral', rarity: 'epic', dropChance: 6, setId: 'totem_ancestral' },
    { itemId: 'set_brume_mystique_piece', name: 'Piece: Brume Mystique', rarity: 'epic', dropChance: 6, setId: 'brume_mystique' },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_void_crystal', name: 'Cristal du Neant', rarity: 'rare', dropChance: 12 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 8 },
  ],
};

// ── Mob wave tier by boss section ──
export function getMobWaveTier(bossIndex) {
  if (bossIndex <= 2) return 'mob_wave_tier1';
  if (bossIndex <= 4) return 'mob_wave_tier2';
  if (bossIndex <= 9) return 'mob_wave_tier3';
  return 'mob_wave_tier4';
}

export function getLootTable(tableId) {
  return LOOT_TABLES[tableId] || [];
}
