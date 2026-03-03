// ── Loot Tables for Expedition V3 — 15 Bosses ──
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
  // MOB WAVE LOOT (gear, mats, sets)
  // Currencies (alkahest, marteau rouge, contribution) handled by LootEngine.rollTrashDrops()
  // ═══════════════════════════════════════════════════════

  mob_wave_tier1: [
    { itemId: 'exp_mat_wood', dropChance: 50 },
    { itemId: 'exp_mat_stone', dropChance: 35 },
    // Set pieces (small chance from mob waves)
    { itemId: 'set_ecailles_drake_piece', dropChance: 3, setId: 'ecailles_drake' },
    { itemId: 'set_crocs_loup_piece', dropChance: 3, setId: 'crocs_loup' },
    { itemId: 'set_plumes_phenix_piece', dropChance: 2, setId: 'plumes_phenix' },
    // Basic gear
    { itemId: 'exp_leaf_helm', dropChance: 8 },
    { itemId: 'exp_leaf_chest', dropChance: 8 },
    { itemId: 'exp_forest_helm', dropChance: 5 },
    { itemId: 'exp_forest_chest', dropChance: 5 },
    { itemId: 'exp_dagger_forest', dropChance: 6 },
  ],

  mob_wave_tier2: [
    { itemId: 'exp_mat_wood', dropChance: 40 },
    { itemId: 'exp_mat_stone', dropChance: 40 },
    { itemId: 'exp_mat_crystal_shard', dropChance: 15 },
    // Set pieces
    { itemId: 'set_crocs_loup_piece', dropChance: 4, setId: 'crocs_loup' },
    { itemId: 'set_griffes_wyverne_piece', dropChance: 4, setId: 'griffes_wyverne' },
    { itemId: 'set_ronce_vivante_piece', dropChance: 3, setId: 'ronce_vivante' },
    { itemId: 'set_plumes_phenix_piece', dropChance: 3, setId: 'plumes_phenix' },
    // Gear
    { itemId: 'exp_stone_helm', dropChance: 4 },
    { itemId: 'exp_stone_chest', dropChance: 4 },
    { itemId: 'exp_crystal_gloves', dropChance: 3 },
    { itemId: 'exp_sword_forest', dropChance: 3 },
    { itemId: 'exp_bow_forest', dropChance: 3 },
  ],

  mob_wave_tier3: [
    { itemId: 'exp_mat_stone', dropChance: 45 },
    { itemId: 'exp_mat_shadow_dust', dropChance: 25 },
    { itemId: 'exp_mat_abyss_shard', dropChance: 20 },
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
    { itemId: 'exp_abyss_helm', dropChance: 3 },
    { itemId: 'exp_abyss_chest', dropChance: 3 },
    { itemId: 'exp_axe_abyss', dropChance: 2 },
    { itemId: 'exp_blade_shadow', dropChance: 2 },
    { itemId: 'exp_staff_shadow', dropChance: 2 },
  ],

  mob_wave_tier4: [
    { itemId: 'exp_mat_shadow_dust', dropChance: 40 },
    { itemId: 'exp_mat_void_crystal', dropChance: 15 },
    { itemId: 'exp_mat_void_essence', dropChance: 5 },
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
    // Gear
    { itemId: 'exp_void_helm', dropChance: 1 },
    { itemId: 'exp_void_chest', dropChance: 1 },
    { itemId: 'exp_katana_void', dropChance: 0.5 },
  ],

  // ═══════════════════════════════════════════════════════
  // ZONE FORET — Boss 1-5
  // ═══════════════════════════════════════════════════════

  boss_1: [
    // Armure Sylvestre (uncommon)
    { itemId: 'exp_forest_helm', name: 'Heaume Sylvestre', rarity: 'uncommon', dropChance: 18 },
    { itemId: 'exp_forest_chest', name: 'Plastron Sylvestre', rarity: 'uncommon', dropChance: 18 },
    { itemId: 'exp_forest_gloves', name: 'Gantelets Sylvestres', rarity: 'uncommon', dropChance: 16 },
    { itemId: 'exp_forest_boots', name: 'Bottes Sylvestres', rarity: 'uncommon', dropChance: 16 },
    // Filler armor (common)
    { itemId: 'exp_leaf_helm', name: 'Chapeau de Feuilles', rarity: 'common', dropChance: 22 },
    { itemId: 'exp_leaf_chest', name: 'Tunique de Mousse', rarity: 'common', dropChance: 22 },
    // Sets (rare)
    { itemId: 'set_ecailles_drake_piece', name: 'Piece: Ecailles de Drake', rarity: 'rare', dropChance: 10, setId: 'ecailles_drake' },
    { itemId: 'set_crocs_loup_piece', name: 'Piece: Crocs du Loup', rarity: 'rare', dropChance: 10, setId: 'crocs_loup' },
    // Armes (common/uncommon)
    { itemId: 'exp_dagger_forest', name: 'Dague Sylvestre', rarity: 'common', dropChance: 20 },
    { itemId: 'exp_sword_forest', name: 'Epee de Mousse', rarity: 'uncommon', dropChance: 15 },
    { itemId: 'exp_staff_forest', name: 'Baton Ancien', rarity: 'uncommon', dropChance: 15 },
    { itemId: 'exp_bow_forest', name: 'Arc de Lierre', rarity: 'uncommon', dropChance: 14 },
    { itemId: 'exp_mace_forest', name: 'Masse Noueuse', rarity: 'uncommon', dropChance: 14 },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_wood', name: 'Bois Ancien', rarity: 'common', dropChance: 25 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 8 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 3 },
    // Unique (ultra-rare, droppable!)
    { itemId: 'unique_oeil_monarque', name: 'Oeil du Monarque', rarity: 'legendary', dropChance: 1, uniqueId: 'oeil_monarque' },
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
    { itemId: 'exp_hammer_stone', name: 'Marteau de Roc', rarity: 'rare', dropChance: 8 },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_stone', name: 'Pierre Enchantee', rarity: 'common', dropChance: 25 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 8 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 3 },
    // Unique (ultra-rare)
    { itemId: 'unique_coeur_pierre', name: 'Coeur de Pierre', rarity: 'legendary', dropChance: 0.8, uniqueId: 'coeur_pierre' },
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
    // Armes transition (rare)
    { itemId: 'exp_spear_crystal', name: 'Lance Cristalline', rarity: 'rare', dropChance: 8 },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_shadow_dust', name: "Poussiere d'Ombre", rarity: 'uncommon', dropChance: 18 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 4 },
    // Recup zone precedente
    { itemId: 'exp_forest_helm', name: 'Heaume Sylvestre', rarity: 'uncommon', dropChance: 12 },
    { itemId: 'exp_stone_helm', name: 'Heaume de Pierre', rarity: 'rare', dropChance: 8 },
    // Unique
    { itemId: 'unique_voile_seigneur', name: 'Voile du Seigneur', rarity: 'legendary', dropChance: 0.8, uniqueId: 'voile_seigneur' },
  ],

  boss_4: [
    // Crystal armor (rare) — NEW
    { itemId: 'exp_crystal_helm', name: 'Tiare Cristalline', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_crystal_chest', name: 'Armure Cristalline', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_crystal_gloves', name: 'Gants Cristallins', rarity: 'rare', dropChance: 8 },
    { itemId: 'exp_crystal_boots', name: 'Bottes Cristallines', rarity: 'rare', dropChance: 8 },
    // Sets zone Foret (rare)
    { itemId: 'set_ecailles_drake_piece', name: 'Piece: Ecailles de Drake', rarity: 'rare', dropChance: 12, setId: 'ecailles_drake' },
    { itemId: 'set_plumes_phenix_piece', name: 'Piece: Plumes de Phenix', rarity: 'rare', dropChance: 12, setId: 'plumes_phenix' },
    { itemId: 'set_ronce_vivante_piece', name: 'Piece: Ronce Vivante', rarity: 'rare', dropChance: 10, setId: 'ronce_vivante' },
    // Big set (epic)
    { itemId: 'set_nova_arcanique_piece', name: 'Piece: Nova Arcanique', rarity: 'epic', dropChance: 3, setId: 'nova_arcanique' },
    // Armes
    { itemId: 'exp_wand_crystal', name: 'Baguette de Cristal', rarity: 'rare', dropChance: 8 },
    { itemId: 'exp_sword_stone', name: 'Lame de Granit', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_blade_shadow', name: 'Lame du Neant', rarity: 'epic', dropChance: 4 },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_crystal_shard', name: 'Eclat de Cristal', rarity: 'uncommon', dropChance: 20 },
    { itemId: 'exp_mat_wood', name: 'Bois Ancien', rarity: 'common', dropChance: 22 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 5 },
    // Unique
    { itemId: 'unique_fragment_sentinelle', name: 'Fragment de Sentinelle', rarity: 'legendary', dropChance: 0.5, uniqueId: 'fragment_sentinelle' },
  ],

  boss_5: [
    // Crystal armor (rare)
    { itemId: 'exp_crystal_helm', name: 'Tiare Cristalline', rarity: 'rare', dropChance: 8 },
    { itemId: 'exp_crystal_boots', name: 'Bottes Cristallines', rarity: 'rare', dropChance: 8 },
    // Sets zone Foret (rare)
    { itemId: 'set_crocs_loup_piece', name: 'Piece: Crocs du Loup', rarity: 'rare', dropChance: 12, setId: 'crocs_loup' },
    { itemId: 'set_griffes_wyverne_piece', name: 'Piece: Griffes de Wyverne', rarity: 'rare', dropChance: 12, setId: 'griffes_wyverne' },
    { itemId: 'set_ecailles_drake_piece', name: 'Piece: Ecailles de Drake', rarity: 'rare', dropChance: 10, setId: 'ecailles_drake' },
    // Big set (epic)
    { itemId: 'set_nova_arcanique_piece', name: 'Piece: Nova Arcanique', rarity: 'epic', dropChance: 5, setId: 'nova_arcanique' },
    // Armes (epic)
    { itemId: 'exp_blade_shadow', name: 'Lame du Neant', rarity: 'epic', dropChance: 6 },
    { itemId: 'exp_staff_shadow', name: 'Sceptre des Tenebres', rarity: 'epic', dropChance: 6 },
    { itemId: 'exp_spear_crystal', name: 'Lance Cristalline', rarity: 'rare', dropChance: 8 },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_shadow_dust', name: "Poussiere d'Ombre", rarity: 'uncommon', dropChance: 18 },
    { itemId: 'exp_mat_crystal_shard', name: 'Eclat de Cristal', rarity: 'uncommon', dropChance: 18 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 5 },
    // Unique
    { itemId: 'unique_plume_ange_noir', name: 'Plume de l\'Ange Noir', rarity: 'legendary', dropChance: 0.5, uniqueId: 'plume_ange_noir' },
  ],

  // ═══════════════════════════════════════════════════════
  // ZONE ABYSSES — Boss 6-10
  // ═══════════════════════════════════════════════════════

  boss_6: [
    // Abyss armor (epic) — NEW
    { itemId: 'exp_abyss_helm', name: 'Couronne des Abysses', rarity: 'epic', dropChance: 7 },
    { itemId: 'exp_abyss_chest', name: 'Cuirasse des Abysses', rarity: 'epic', dropChance: 7 },
    { itemId: 'exp_abyss_gloves', name: 'Gantelets des Abysses', rarity: 'epic', dropChance: 6 },
    { itemId: 'exp_abyss_boots', name: 'Bottes des Abysses', rarity: 'epic', dropChance: 6 },
    // Medium sets Abysses (epic)
    { itemId: 'set_souffle_glacial_piece', name: 'Piece: Souffle Glacial', rarity: 'epic', dropChance: 7, setId: 'souffle_glacial' },
    { itemId: 'set_cendres_ardentes_piece', name: 'Piece: Cendres Ardentes', rarity: 'epic', dropChance: 7, setId: 'cendres_ardentes' },
    // Big sets (epic)
    { itemId: 'set_fureur_titan_piece', name: 'Piece: Fureur du Titan', rarity: 'epic', dropChance: 3, setId: 'fureur_titan' },
    { itemId: 'set_aegis_gardien_piece', name: "Piece: Aegis du Gardien", rarity: 'epic', dropChance: 3, setId: 'aegis_gardien' },
    // Armes epic — NEW
    { itemId: 'exp_axe_abyss', name: 'Hache des Profondeurs', rarity: 'epic', dropChance: 5 },
    { itemId: 'exp_glaive_abyss', name: 'Glaive des Abysses', rarity: 'epic', dropChance: 5 },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_abyss_shard', name: 'Fragment Abyssal', rarity: 'uncommon', dropChance: 18 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 5 },
    // Unique
    { itemId: 'unique_larme_foret', name: 'Larme de la Foret', rarity: 'legendary', dropChance: 0.5, uniqueId: 'larme_foret' },
  ],

  boss_7: [
    // Abyss armor
    { itemId: 'exp_abyss_helm', name: 'Couronne des Abysses', rarity: 'epic', dropChance: 6 },
    { itemId: 'exp_abyss_boots', name: 'Bottes des Abysses', rarity: 'epic', dropChance: 6 },
    // Medium sets Abysses (epic)
    { itemId: 'set_murmure_ombre_piece', name: "Piece: Murmure d'Ombre", rarity: 'epic', dropChance: 7, setId: 'murmure_ombre' },
    { itemId: 'set_lumiere_sacree_piece', name: 'Piece: Lumiere Sacree', rarity: 'epic', dropChance: 7, setId: 'lumiere_sacree' },
    // Big sets (epic)
    { itemId: 'set_souffle_vital_piece', name: 'Piece: Souffle Vital', rarity: 'epic', dropChance: 5, setId: 'souffle_vital' },
    { itemId: 'set_lame_fantome_piece', name: 'Piece: Lame Fantome', rarity: 'epic', dropChance: 5, setId: 'lame_fantome' },
    // Armes
    { itemId: 'exp_orb_abyss', name: 'Orbe Abyssale', rarity: 'epic', dropChance: 5 },
    { itemId: 'exp_whip_abyss', name: 'Fouet Abyssal', rarity: 'epic', dropChance: 5 },
    // Arme mythique
    { itemId: 'weapon_thyrsus', name: 'Thyrsus', rarity: 'mythique', dropChance: 2, weaponId: 'thyrsus' },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_abyss_shard', name: 'Fragment Abyssal', rarity: 'uncommon', dropChance: 16 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 5 },
    // Unique
    { itemId: 'unique_sceau_commandant', name: 'Sceau du Commandant', rarity: 'legendary', dropChance: 0.3, uniqueId: 'sceau_commandant' },
  ],

  boss_8: [
    // Magma armor (epic) — NEW
    { itemId: 'exp_magma_helm', name: 'Casque de Magma', rarity: 'epic', dropChance: 7 },
    { itemId: 'exp_magma_chest', name: 'Plastron de Magma', rarity: 'epic', dropChance: 7 },
    { itemId: 'exp_magma_gloves', name: 'Gants de Lave', rarity: 'epic', dropChance: 6 },
    // Medium set Abysses (epic)
    { itemId: 'set_cuirasse_fer_piece', name: 'Piece: Cuirasse de Fer', rarity: 'epic', dropChance: 7, setId: 'cuirasse_fer' },
    // Big sets (epic)
    { itemId: 'set_fureur_titan_piece', name: 'Piece: Fureur du Titan', rarity: 'epic', dropChance: 6, setId: 'fureur_titan' },
    { itemId: 'set_aegis_gardien_piece', name: "Piece: Aegis du Gardien", rarity: 'epic', dropChance: 6, setId: 'aegis_gardien' },
    // Armes
    { itemId: 'exp_scythe_abyss', name: 'Faux des Damnes', rarity: 'epic', dropChance: 4 },
    // Arme mythique
    { itemId: 'weapon_aegis', name: 'Aegis', rarity: 'mythique', dropChance: 2, weaponId: 'aegis_weapon' },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_magma_core', name: 'Coeur de Magma', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_mat_shadow_dust', name: "Poussiere d'Ombre", rarity: 'uncommon', dropChance: 15 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 5 },
    // Unique
    { itemId: 'unique_croc_warg', name: 'Croc du Warg', rarity: 'legendary', dropChance: 0.3, uniqueId: 'croc_warg' },
  ],

  boss_9: [
    // Magma armor
    { itemId: 'exp_magma_helm', name: 'Casque de Magma', rarity: 'epic', dropChance: 6 },
    { itemId: 'exp_magma_chest', name: 'Plastron de Magma', rarity: 'epic', dropChance: 6 },
    // Big sets (epic)
    { itemId: 'set_lame_fantome_piece', name: 'Piece: Lame Fantome', rarity: 'epic', dropChance: 6, setId: 'lame_fantome' },
    { itemId: 'set_souffle_vital_piece', name: 'Piece: Souffle Vital', rarity: 'epic', dropChance: 6, setId: 'souffle_vital' },
    { itemId: 'set_nova_arcanique_piece', name: 'Piece: Nova Arcanique', rarity: 'epic', dropChance: 5, setId: 'nova_arcanique' },
    // Medium sets Abysses (epic)
    { itemId: 'set_souffle_glacial_piece', name: 'Piece: Souffle Glacial', rarity: 'epic', dropChance: 7, setId: 'souffle_glacial' },
    { itemId: 'set_cendres_ardentes_piece', name: 'Piece: Cendres Ardentes', rarity: 'epic', dropChance: 7, setId: 'cendres_ardentes' },
    // Arme mythique
    { itemId: 'weapon_caladbolg', name: 'Caladbolg', rarity: 'mythique', dropChance: 1.5, weaponId: 'caladbolg' },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_magma_core', name: 'Coeur de Magma', rarity: 'rare', dropChance: 10 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 6 },
    // Unique
    { itemId: 'unique_cape_fantome', name: 'Cape du Fantome', rarity: 'legendary', dropChance: 0.3, uniqueId: 'cape_fantome' },
  ],

  boss_10: [
    // Big sets (epic)
    { itemId: 'set_fureur_titan_piece', name: 'Piece: Fureur du Titan', rarity: 'epic', dropChance: 6, setId: 'fureur_titan' },
    { itemId: 'set_lame_fantome_piece', name: 'Piece: Lame Fantome', rarity: 'epic', dropChance: 6, setId: 'lame_fantome' },
    { itemId: 'set_aegis_gardien_piece', name: "Piece: Aegis du Gardien", rarity: 'epic', dropChance: 6, setId: 'aegis_gardien' },
    { itemId: 'set_souffle_vital_piece', name: 'Piece: Souffle Vital', rarity: 'epic', dropChance: 6, setId: 'souffle_vital' },
    // Medium sets Abysses (epic)
    { itemId: 'set_cuirasse_fer_piece', name: 'Piece: Cuirasse de Fer', rarity: 'epic', dropChance: 7, setId: 'cuirasse_fer' },
    { itemId: 'set_murmure_ombre_piece', name: "Piece: Murmure d'Ombre", rarity: 'epic', dropChance: 7, setId: 'murmure_ombre' },
    // Arme mythique
    { itemId: 'weapon_nidhogg', name: 'Nidhogg', rarity: 'mythique', dropChance: 1.5, weaponId: 'nidhogg' },
    // Armes legendary — NEW
    { itemId: 'exp_katana_void', name: 'Katana du Neant', rarity: 'legendary', dropChance: 1.5 },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_magma_core', name: 'Coeur de Magma', rarity: 'rare', dropChance: 10 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 6 },
    // Unique
    { itemId: 'unique_talisman_sage', name: 'Talisman du Sage', rarity: 'legendary', dropChance: 0.3, uniqueId: 'talisman_sage' },
  ],

  // ═══════════════════════════════════════════════════════
  // ZONE NEANT — Boss 11-15
  // ═══════════════════════════════════════════════════════

  boss_11: [
    // Void armor (legendary) — NEW
    { itemId: 'exp_void_helm', name: 'Diademe du Neant', rarity: 'legendary', dropChance: 2.5 },
    { itemId: 'exp_void_chest', name: 'Plastron du Neant', rarity: 'legendary', dropChance: 2.5 },
    // Medium sets Neant (epic)
    { itemId: 'set_ailes_vent_piece', name: 'Piece: Ailes du Vent', rarity: 'epic', dropChance: 7, setId: 'ailes_vent' },
    { itemId: 'set_sang_guerrier_piece', name: 'Piece: Sang du Guerrier', rarity: 'epic', dropChance: 7, setId: 'sang_guerrier' },
    // Big sets (legendary)
    { itemId: 'set_tempete_acier_piece', name: "Piece: Tempete d'Acier", rarity: 'legendary', dropChance: 2.5, setId: 'tempete_acier' },
    { itemId: 'set_voix_neant_piece', name: 'Piece: Voix du Neant', rarity: 'legendary', dropChance: 2.5, setId: 'voix_neant' },
    // Armes
    { itemId: 'exp_grimoire_void', name: 'Grimoire du Neant', rarity: 'legendary', dropChance: 1.5 },
    // Arme mythique
    { itemId: 'weapon_yggdrasil', name: 'Yggdrasil', rarity: 'mythique', dropChance: 1.5, weaponId: 'yggdrasil' },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_void_crystal', name: 'Cristal du Neant', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_mat_void_essence', name: 'Essence du Vide', rarity: 'epic', dropChance: 5 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 6 },
    // Unique
    { itemId: 'unique_diademe_astral', name: 'Diademe Astral', rarity: 'legendary', dropChance: 0.3, uniqueId: 'diademe_astral' },
  ],

  boss_12: [
    // Void armor (legendary)
    { itemId: 'exp_void_gloves', name: 'Griffes du Neant', rarity: 'legendary', dropChance: 2.5 },
    { itemId: 'exp_void_boots', name: 'Bottes du Neant', rarity: 'legendary', dropChance: 2.5 },
    // Medium sets Neant (epic)
    { itemId: 'set_totem_ancestral_piece', name: 'Piece: Totem Ancestral', rarity: 'epic', dropChance: 7, setId: 'totem_ancestral' },
    { itemId: 'set_brume_mystique_piece', name: 'Piece: Brume Mystique', rarity: 'epic', dropChance: 7, setId: 'brume_mystique' },
    // Big sets (legendary)
    { itemId: 'set_pacte_sang_piece', name: 'Piece: Pacte de Sang', rarity: 'legendary', dropChance: 2.5, setId: 'pacte_sang' },
    { itemId: 'set_bastion_eternel_piece', name: 'Piece: Bastion Eternel', rarity: 'legendary', dropChance: 2.5, setId: 'bastion_eternel' },
    // Armes
    { itemId: 'exp_halberd_void', name: 'Hallebarde du Vide', rarity: 'legendary', dropChance: 1.5 },
    { itemId: 'exp_claws_void', name: 'Griffes Spectrales', rarity: 'legendary', dropChance: 1.5 },
    // Arme mythique
    { itemId: 'weapon_mjolnir', name: 'Mjolnir', rarity: 'mythique', dropChance: 1, weaponId: 'mjolnir' },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_void_crystal', name: 'Cristal du Neant', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_mat_void_essence', name: 'Essence du Vide', rarity: 'epic', dropChance: 5 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 6 },
    // Unique
    { itemId: 'unique_sceaux_abysse', name: 'Sceaux de l\'Abysse', rarity: 'legendary', dropChance: 0.3, uniqueId: 'sceaux_abysse' },
  ],

  boss_13: [
    // Void armor
    { itemId: 'exp_void_helm', name: 'Diademe du Neant', rarity: 'legendary', dropChance: 2 },
    { itemId: 'exp_void_gloves', name: 'Griffes du Neant', rarity: 'legendary', dropChance: 2 },
    // Medium set Neant (epic)
    { itemId: 'set_lien_meute_piece', name: 'Piece: Lien de Meute', rarity: 'epic', dropChance: 7, setId: 'lien_meute' },
    // Big sets (legendary)
    { itemId: 'set_tempete_acier_piece', name: "Piece: Tempete d'Acier", rarity: 'legendary', dropChance: 2, setId: 'tempete_acier' },
    { itemId: 'set_voix_neant_piece', name: 'Piece: Voix du Neant', rarity: 'legendary', dropChance: 2, setId: 'voix_neant' },
    { itemId: 'set_harmonie_celeste_piece', name: 'Piece: Harmonie Celeste', rarity: 'legendary', dropChance: 1.5, setId: 'harmonie_celeste' },
    // Armes
    { itemId: 'exp_talisman_void', name: 'Talisman Sacre', rarity: 'legendary', dropChance: 1.5 },
    // Arme mythique
    { itemId: 'weapon_gungnir', name: 'Gungnir', rarity: 'mythique', dropChance: 0.8, weaponId: 'gungnir' },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_void_crystal', name: 'Cristal du Neant', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_void_essence', name: 'Essence du Vide', rarity: 'epic', dropChance: 6 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 7 },
    // Unique
    { itemId: 'unique_gantelets_colosse', name: 'Gantelets du Colosse', rarity: 'legendary', dropChance: 0.2, uniqueId: 'gantelets_colosse' },
  ],

  boss_14: [
    // Eclipse armor (legendary) — NEW
    { itemId: 'exp_eclipse_helm', name: 'Couronne Eclipse', rarity: 'legendary', dropChance: 2 },
    { itemId: 'exp_eclipse_chest', name: 'Plastron Eclipse', rarity: 'legendary', dropChance: 2 },
    // Void armor
    { itemId: 'exp_void_boots', name: 'Bottes du Neant', rarity: 'legendary', dropChance: 2 },
    // Big sets (legendary)
    { itemId: 'set_pacte_sang_piece', name: 'Piece: Pacte de Sang', rarity: 'legendary', dropChance: 2.5, setId: 'pacte_sang' },
    { itemId: 'set_bastion_eternel_piece', name: 'Piece: Bastion Eternel', rarity: 'legendary', dropChance: 2.5, setId: 'bastion_eternel' },
    { itemId: 'set_harmonie_celeste_piece', name: 'Piece: Harmonie Celeste', rarity: 'legendary', dropChance: 2, setId: 'harmonie_celeste' },
    { itemId: 'set_tempete_acier_piece', name: "Piece: Tempete d'Acier", rarity: 'legendary', dropChance: 2, setId: 'tempete_acier' },
    // Medium sets Neant (epic)
    { itemId: 'set_ailes_vent_piece', name: 'Piece: Ailes du Vent', rarity: 'epic', dropChance: 7, setId: 'ailes_vent' },
    { itemId: 'set_sang_guerrier_piece', name: 'Piece: Sang du Guerrier', rarity: 'epic', dropChance: 7, setId: 'sang_guerrier' },
    // Armes
    { itemId: 'exp_claws_void', name: 'Griffes Spectrales', rarity: 'legendary', dropChance: 1.5 },
    // Arme mythique
    { itemId: 'weapon_muramasa', name: 'Muramasa', rarity: 'mythique', dropChance: 0.5, weaponId: 'muramasa' },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_void_crystal', name: 'Cristal du Neant', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_void_essence', name: 'Essence du Vide', rarity: 'epic', dropChance: 8 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 7 },
    // Unique
    { itemId: 'unique_couronne_vainqueur', name: 'Couronne du Vainqueur', rarity: 'legendary', dropChance: 0.2, uniqueId: 'couronne_vainqueur' },
  ],

  boss_15: [
    // Eclipse armor (legendary)
    { itemId: 'exp_eclipse_helm', name: 'Couronne Eclipse', rarity: 'legendary', dropChance: 3 },
    { itemId: 'exp_eclipse_chest', name: 'Plastron Eclipse', rarity: 'legendary', dropChance: 3 },
    // Void armor
    { itemId: 'exp_void_helm', name: 'Diademe du Neant', rarity: 'legendary', dropChance: 2 },
    { itemId: 'exp_void_chest', name: 'Plastron du Neant', rarity: 'legendary', dropChance: 2 },
    // Big sets (legendary) — le boss ultime les drop tous
    { itemId: 'set_tempete_acier_piece', name: "Piece: Tempete d'Acier", rarity: 'legendary', dropChance: 3, setId: 'tempete_acier' },
    { itemId: 'set_voix_neant_piece', name: 'Piece: Voix du Neant', rarity: 'legendary', dropChance: 3, setId: 'voix_neant' },
    { itemId: 'set_pacte_sang_piece', name: 'Piece: Pacte de Sang', rarity: 'legendary', dropChance: 3, setId: 'pacte_sang' },
    { itemId: 'set_bastion_eternel_piece', name: 'Piece: Bastion Eternel', rarity: 'legendary', dropChance: 3, setId: 'bastion_eternel' },
    { itemId: 'set_harmonie_celeste_piece', name: 'Piece: Harmonie Celeste', rarity: 'legendary', dropChance: 3, setId: 'harmonie_celeste' },
    // Medium sets Neant (epic)
    { itemId: 'set_lien_meute_piece', name: 'Piece: Lien de Meute', rarity: 'epic', dropChance: 7, setId: 'lien_meute' },
    { itemId: 'set_totem_ancestral_piece', name: 'Piece: Totem Ancestral', rarity: 'epic', dropChance: 6, setId: 'totem_ancestral' },
    { itemId: 'set_brume_mystique_piece', name: 'Piece: Brume Mystique', rarity: 'epic', dropChance: 6, setId: 'brume_mystique' },
    // Armes legendary — best weapons in the game
    { itemId: 'exp_katana_void', name: 'Katana du Neant', rarity: 'legendary', dropChance: 1.5 },
    { itemId: 'exp_halberd_void', name: 'Hallebarde du Vide', rarity: 'legendary', dropChance: 1.5 },
    { itemId: 'exp_grimoire_void', name: 'Grimoire du Neant', rarity: 'legendary', dropChance: 1 },
    // Armes mythiques
    { itemId: 'weapon_excalibur', name: 'Excalibur', rarity: 'mythique', dropChance: 0.5, weaponId: 'excalibur' },
    { itemId: 'weapon_gram', name: 'Gram', rarity: 'mythique', dropChance: 0.3, weaponId: 'gram' },
    // Materiaux
    { itemId: 'exp_mat_essence', name: 'Essence de Boss', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_void_crystal', name: 'Cristal du Neant', rarity: 'rare', dropChance: 12 },
    { itemId: 'exp_mat_void_essence', name: 'Essence du Vide', rarity: 'epic', dropChance: 10 },
    // Monnaies
    { itemId: 'exp_alkahest', name: 'Alkahest', rarity: 'rare', dropChance: 10 },
    { itemId: 'exp_marteau_rouge', name: 'Marteau Rouge', rarity: 'epic', dropChance: 8 },
    // Uniques
    { itemId: 'unique_bottes_explorateur', name: 'Bottes de l\'Explorateur', rarity: 'legendary', dropChance: 0.2, uniqueId: 'bottes_explorateur' },
    { itemId: 'unique_relique_temps', name: 'Relique du Temps', rarity: 'legendary', dropChance: 0.1, uniqueId: 'relique_temps' },
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
