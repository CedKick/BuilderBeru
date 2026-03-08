// ── Loot Tables for Expedition V4 — 15 Bosses (Reinforced Loot) ──
// dropChance is a percentage (0-100), multi-drop system (total can exceed 100%)
// Each entry: { name, rarity, dropChance, [setId|weaponId|uniqueId] }
// QUANTITY_MULTIPLIER = 5 → each table rolled 5x per boss kill
//
// ── Target avg drops (with 5x mult) ──
// Boss 1-3:  ~13 (sum ~260%)    Boss 4-5:  ~14 (sum ~280%)
// Boss 6-7:  ~15 (sum ~300%)    Boss 8-10: ~16 (sum ~320%)
// Boss 11-13: ~18 (sum ~360%)   Boss 14-15: ~20 (sum ~400%)

export const LOOT_TABLES = {
  // ═══════════════════════════════════════════════════════
  // MOB WAVE LOOT (gear, mats, sets)
  // Currencies (alkahest, marteau rouge, contribution) handled by LootEngine.rollTrashDrops()
  // ═══════════════════════════════════════════════════════

  mob_wave_tier1: [
    { itemId: 'set_ecailles_drake_piece', dropChance: 5, setId: 'ecailles_drake' },
    { itemId: 'set_crocs_loup_piece', dropChance: 5, setId: 'crocs_loup' },
    { itemId: 'set_plumes_phenix_piece', dropChance: 4, setId: 'plumes_phenix' },
    { itemId: 'exp_forest_helm', dropChance: 8 },
    { itemId: 'exp_forest_chest', dropChance: 8 },
    { itemId: 'exp_sword_forest', dropChance: 5 },
    { itemId: 'exp_bow_forest', dropChance: 5 },
    { itemId: 'exp_mace_forest', dropChance: 5 },
    { itemId: 'exp_ultimate_scroll', dropChance: 5 },
  ],

  mob_wave_tier2: [
    { itemId: 'set_crocs_loup_piece', dropChance: 6, setId: 'crocs_loup' },
    { itemId: 'set_griffes_wyverne_piece', dropChance: 6, setId: 'griffes_wyverne' },
    { itemId: 'set_ronce_vivante_piece', dropChance: 5, setId: 'ronce_vivante' },
    { itemId: 'set_plumes_phenix_piece', dropChance: 5, setId: 'plumes_phenix' },
    { itemId: 'exp_stone_helm', dropChance: 5 },
    { itemId: 'exp_stone_chest', dropChance: 5 },
    { itemId: 'exp_crystal_gloves', dropChance: 4 },
    { itemId: 'exp_sword_forest', dropChance: 4 },
    { itemId: 'exp_bow_forest', dropChance: 4 },
    { itemId: 'exp_spear_crystal', dropChance: 3 },
    { itemId: 'exp_ultimate_scroll', dropChance: 5 },
  ],

  mob_wave_tier3: [
    { itemId: 'set_souffle_glacial_piece', dropChance: 6, setId: 'souffle_glacial' },
    { itemId: 'set_cendres_ardentes_piece', dropChance: 6, setId: 'cendres_ardentes' },
    { itemId: 'set_murmure_ombre_piece', dropChance: 5, setId: 'murmure_ombre' },
    { itemId: 'set_lumiere_sacree_piece', dropChance: 5, setId: 'lumiere_sacree' },
    { itemId: 'set_cuirasse_fer_piece', dropChance: 5, setId: 'cuirasse_fer' },
    { itemId: 'set_fureur_titan_piece', dropChance: 1, setId: 'fureur_titan' },
    { itemId: 'set_aegis_gardien_piece', dropChance: 1, setId: 'aegis_gardien' },
    { itemId: 'exp_abyss_helm', dropChance: 4 },
    { itemId: 'exp_abyss_chest', dropChance: 4 },
    { itemId: 'exp_axe_abyss', dropChance: 3 },
    { itemId: 'exp_blade_shadow', dropChance: 3 },
    { itemId: 'exp_staff_shadow', dropChance: 3 },
    { itemId: 'exp_ultimate_scroll', dropChance: 5 },
  ],

  mob_wave_tier4: [
    { itemId: 'set_ailes_vent_piece', dropChance: 7, setId: 'ailes_vent' },
    { itemId: 'set_sang_guerrier_piece', dropChance: 7, setId: 'sang_guerrier' },
    { itemId: 'set_totem_ancestral_piece', dropChance: 6, setId: 'totem_ancestral' },
    { itemId: 'set_brume_mystique_piece', dropChance: 6, setId: 'brume_mystique' },
    { itemId: 'set_lien_meute_piece', dropChance: 5, setId: 'lien_meute' },
    { itemId: 'set_tempete_acier_piece', dropChance: 1.5, setId: 'tempete_acier' },
    { itemId: 'set_voix_neant_piece', dropChance: 1.5, setId: 'voix_neant' },
    { itemId: 'set_pacte_sang_piece', dropChance: 1, setId: 'pacte_sang' },
    { itemId: 'set_bastion_eternel_piece', dropChance: 1, setId: 'bastion_eternel' },
    { itemId: 'set_harmonie_celeste_piece', dropChance: 1, setId: 'harmonie_celeste' },
    { itemId: 'exp_void_helm', dropChance: 1.5 },
    { itemId: 'exp_void_chest', dropChance: 1.5 },
    { itemId: 'exp_katana_void', dropChance: 0.8 },
    { itemId: 'exp_ultimate_scroll', dropChance: 5 },
  ],

  // ═══════════════════════════════════════════════════════
  // ZONE FORET — Boss 1-5 (uncommon → rare → epic)
  // ═══════════════════════════════════════════════════════

  // ── Boss 1: Gardien de la Foret ── (sum ~261% → avg 13.1 drops)
  boss_1: [
    // Armure Sylvestre (uncommon) — premier boss genereux
    { itemId: 'exp_forest_helm', name: 'Heaume Sylvestre', rarity: 'uncommon', dropChance: 28 },
    { itemId: 'exp_forest_chest', name: 'Plastron Sylvestre', rarity: 'uncommon', dropChance: 28 },
    { itemId: 'exp_forest_gloves', name: 'Gantelets Sylvestres', rarity: 'uncommon', dropChance: 25 },
    { itemId: 'exp_forest_boots', name: 'Bottes Sylvestres', rarity: 'uncommon', dropChance: 25 },
    // Accessoires Sylvestres (uncommon)
    { itemId: 'exp_forest_necklace', name: 'Collier Sylvestre', rarity: 'uncommon', dropChance: 25 },
    { itemId: 'exp_forest_ring', name: 'Anneau Sylvestre', rarity: 'uncommon', dropChance: 25 },
    // Sets zone Foret (rare)
    { itemId: 'set_ecailles_drake_piece', name: 'Piece: Ecailles de Drake', rarity: 'rare', dropChance: 18, setId: 'ecailles_drake' },
    { itemId: 'set_crocs_loup_piece', name: 'Piece: Crocs du Loup', rarity: 'rare', dropChance: 18, setId: 'crocs_loup' },
    { itemId: 'set_plumes_phenix_piece', name: 'Piece: Plumes de Phenix', rarity: 'rare', dropChance: 15, setId: 'plumes_phenix' },
    { itemId: 'set_ronce_vivante_piece', name: 'Piece: Ronce Vivante', rarity: 'rare', dropChance: 15, setId: 'ronce_vivante' },
    // Armes (uncommon)
    { itemId: 'exp_sword_forest', name: 'Epee de Mousse', rarity: 'uncommon', dropChance: 22 },
    { itemId: 'exp_staff_forest', name: 'Baton Ancien', rarity: 'uncommon', dropChance: 22 },
    { itemId: 'exp_bow_forest', name: 'Arc de Lierre', rarity: 'uncommon', dropChance: 20 },
    { itemId: 'exp_mace_forest', name: 'Masse Noueuse', rarity: 'uncommon', dropChance: 20 },
    // Big set (epic — teaser)
    { itemId: 'set_nova_arcanique_piece', name: 'Piece: Nova Arcanique', rarity: 'epic', dropChance: 3, setId: 'nova_arcanique' },
    // Unique (legendary)
    { itemId: 'unique_oeil_monarque', name: 'Oeil du Monarque', rarity: 'legendary', dropChance: 2, uniqueId: 'oeil_monarque' },
    // Phase 2 weapon
    { itemId: 'weapon_ragnarok', name: 'Ragnarök', rarity: 'mythique', dropChance: 10, weaponId: 'ragnarok' },
    { itemId: 'exp_ultimate_scroll', name: 'Parchemin Ultimate', rarity: 'epic', dropChance: 100 },
  ],

  // ── Boss 2: Sentinelle de Pierre ── (sum ~258% → avg 12.9 drops)
  boss_2: [
    // Armure de Pierre (rare)
    { itemId: 'exp_stone_helm', name: 'Heaume de Pierre', rarity: 'rare', dropChance: 22 },
    { itemId: 'exp_stone_chest', name: 'Plastron de Pierre', rarity: 'rare', dropChance: 22 },
    { itemId: 'exp_stone_gloves', name: 'Gantelets de Pierre', rarity: 'rare', dropChance: 20 },
    { itemId: 'exp_stone_boots', name: 'Bottes de Pierre', rarity: 'rare', dropChance: 20 },
    // Accessoires de Pierre (rare)
    { itemId: 'exp_stone_necklace', name: 'Collier de Pierre', rarity: 'rare', dropChance: 20 },
    { itemId: 'exp_stone_bracelet', name: 'Bracelet de Pierre', rarity: 'rare', dropChance: 20 },
    // Sets zone Foret — complets (rare)
    { itemId: 'set_plumes_phenix_piece', name: 'Piece: Plumes de Phenix', rarity: 'rare', dropChance: 18, setId: 'plumes_phenix' },
    { itemId: 'set_ronce_vivante_piece', name: 'Piece: Ronce Vivante', rarity: 'rare', dropChance: 18, setId: 'ronce_vivante' },
    { itemId: 'set_ecailles_drake_piece', name: 'Piece: Ecailles de Drake', rarity: 'rare', dropChance: 16, setId: 'ecailles_drake' },
    { itemId: 'set_crocs_loup_piece', name: 'Piece: Crocs du Loup', rarity: 'rare', dropChance: 16, setId: 'crocs_loup' },
    { itemId: 'set_griffes_wyverne_piece', name: 'Piece: Griffes de Wyverne', rarity: 'rare', dropChance: 14, setId: 'griffes_wyverne' },
    // Armes (rare)
    { itemId: 'exp_sword_stone', name: 'Lame de Granit', rarity: 'rare', dropChance: 20 },
    { itemId: 'exp_bow_stone', name: 'Arc Petrifie', rarity: 'rare', dropChance: 20 },
    { itemId: 'exp_hammer_stone', name: 'Marteau de Roc', rarity: 'rare', dropChance: 16 },
    // Armes zone precedente (uncommon)
    { itemId: 'exp_staff_forest', name: 'Baton Ancien', rarity: 'uncommon', dropChance: 14 },
    { itemId: 'exp_spear_crystal', name: 'Lance Cristalline', rarity: 'rare', dropChance: 12 },
    // Big sets (epic — premiers)
    { itemId: 'set_nova_arcanique_piece', name: 'Piece: Nova Arcanique', rarity: 'epic', dropChance: 5, setId: 'nova_arcanique' },
    { itemId: 'set_fureur_titan_piece', name: 'Piece: Fureur du Titan', rarity: 'epic', dropChance: 3, setId: 'fureur_titan' },
    // Unique (legendary)
    { itemId: 'unique_coeur_pierre', name: 'Coeur de Pierre', rarity: 'legendary', dropChance: 2, uniqueId: 'coeur_pierre' },
    // Phase 2 weapon
    { itemId: 'weapon_kusanagi', name: 'Kusanagi', rarity: 'mythique', dropChance: 10, weaponId: 'kusanagi' },
    { itemId: 'exp_ultimate_scroll', name: 'Parchemin Ultimate', rarity: 'epic', dropChance: 100 },
  ],

  // ── Boss 3: Seigneur de l'Ombre ── (sum ~260% → avg 13.0 drops)
  boss_3: [
    // Armure d'Ombre (epic)
    { itemId: 'exp_shadow_helm', name: "Capuche d'Ombre", rarity: 'epic', dropChance: 16 },
    { itemId: 'exp_shadow_chest', name: "Tunique d'Ombre", rarity: 'epic', dropChance: 16 },
    { itemId: 'exp_shadow_gloves', name: "Griffes d'Ombre", rarity: 'epic', dropChance: 14 },
    { itemId: 'exp_shadow_boots', name: "Sandales d'Ombre", rarity: 'epic', dropChance: 14 },
    // Accessoires d'Ombre (epic)
    { itemId: 'exp_shadow_necklace', name: "Pendentif d'Ombre", rarity: 'epic', dropChance: 16 },
    { itemId: 'exp_shadow_ring', name: "Anneau d'Ombre", rarity: 'epic', dropChance: 16 },
    // Sets zone Foret — complets (rare)
    { itemId: 'set_griffes_wyverne_piece', name: 'Piece: Griffes de Wyverne', rarity: 'rare', dropChance: 20, setId: 'griffes_wyverne' },
    { itemId: 'set_ronce_vivante_piece', name: 'Piece: Ronce Vivante', rarity: 'rare', dropChance: 16, setId: 'ronce_vivante' },
    { itemId: 'set_crocs_loup_piece', name: 'Piece: Crocs du Loup', rarity: 'rare', dropChance: 16, setId: 'crocs_loup' },
    { itemId: 'set_ecailles_drake_piece', name: 'Piece: Ecailles de Drake', rarity: 'rare', dropChance: 16, setId: 'ecailles_drake' },
    { itemId: 'set_plumes_phenix_piece', name: 'Piece: Plumes de Phenix', rarity: 'rare', dropChance: 14, setId: 'plumes_phenix' },
    // Big sets (epic)
    { itemId: 'set_nova_arcanique_piece', name: 'Piece: Nova Arcanique', rarity: 'epic', dropChance: 7, setId: 'nova_arcanique' },
    { itemId: 'set_fureur_titan_piece', name: 'Piece: Fureur du Titan', rarity: 'epic', dropChance: 5, setId: 'fureur_titan' },
    { itemId: 'set_aegis_gardien_piece', name: "Piece: Aegis du Gardien", rarity: 'epic', dropChance: 4, setId: 'aegis_gardien' },
    // Armes (epic)
    { itemId: 'exp_blade_shadow', name: 'Lame du Neant', rarity: 'epic', dropChance: 16 },
    { itemId: 'exp_staff_shadow', name: 'Sceptre des Tenebres', rarity: 'epic', dropChance: 14 },
    { itemId: 'exp_spear_crystal', name: 'Lance Cristalline', rarity: 'rare', dropChance: 16 },
    // Armure zone precedente (rare)
    { itemId: 'exp_stone_helm', name: 'Heaume de Pierre', rarity: 'rare', dropChance: 14 },
    { itemId: 'exp_stone_boots', name: 'Bottes de Pierre', rarity: 'rare', dropChance: 14 },
    // Armes zone precedente
    { itemId: 'exp_sword_stone', name: 'Lame de Granit', rarity: 'rare', dropChance: 14 },
    { itemId: 'exp_bow_stone', name: 'Arc Petrifie', rarity: 'rare', dropChance: 12 },
    // Unique
    { itemId: 'unique_voile_seigneur', name: 'Voile du Seigneur', rarity: 'legendary', dropChance: 2, uniqueId: 'voile_seigneur' },
    // Phase 2 Mythique
    { itemId: 'weapon_gae_bolg', name: 'Gáe Bolg', rarity: 'mythique', dropChance: 10, weaponId: 'gae_bolg' },
    { itemId: 'exp_ultimate_scroll', name: 'Parchemin Ultimate', rarity: 'epic', dropChance: 100 },
  ],

  // ── Boss 4: Ancien des Racines ── (sum ~279% → avg 14.0 drops)
  boss_4: [
    // Armure Cristalline (rare)
    { itemId: 'exp_crystal_helm', name: 'Tiare Cristalline', rarity: 'rare', dropChance: 18 },
    { itemId: 'exp_crystal_chest', name: 'Armure Cristalline', rarity: 'rare', dropChance: 18 },
    { itemId: 'exp_crystal_gloves', name: 'Gants Cristallins', rarity: 'rare', dropChance: 16 },
    { itemId: 'exp_crystal_boots', name: 'Bottes Cristallines', rarity: 'rare', dropChance: 16 },
    // Accessoires Cristallins (rare)
    { itemId: 'exp_crystal_necklace', name: 'Collier Cristallin', rarity: 'rare', dropChance: 16 },
    { itemId: 'exp_crystal_ring', name: 'Anneau Cristallin', rarity: 'rare', dropChance: 16 },
    // Sets zone Foret — complets (rare)
    { itemId: 'set_ecailles_drake_piece', name: 'Piece: Ecailles de Drake', rarity: 'rare', dropChance: 20, setId: 'ecailles_drake' },
    { itemId: 'set_plumes_phenix_piece', name: 'Piece: Plumes de Phenix', rarity: 'rare', dropChance: 20, setId: 'plumes_phenix' },
    { itemId: 'set_ronce_vivante_piece', name: 'Piece: Ronce Vivante', rarity: 'rare', dropChance: 18, setId: 'ronce_vivante' },
    { itemId: 'set_griffes_wyverne_piece', name: 'Piece: Griffes de Wyverne', rarity: 'rare', dropChance: 16, setId: 'griffes_wyverne' },
    { itemId: 'set_crocs_loup_piece', name: 'Piece: Crocs du Loup', rarity: 'rare', dropChance: 16, setId: 'crocs_loup' },
    // Big sets (epic)
    { itemId: 'set_nova_arcanique_piece', name: 'Piece: Nova Arcanique', rarity: 'epic', dropChance: 8, setId: 'nova_arcanique' },
    { itemId: 'set_fureur_titan_piece', name: 'Piece: Fureur du Titan', rarity: 'epic', dropChance: 6, setId: 'fureur_titan' },
    { itemId: 'set_aegis_gardien_piece', name: "Piece: Aegis du Gardien", rarity: 'epic', dropChance: 5, setId: 'aegis_gardien' },
    { itemId: 'set_lame_fantome_piece', name: 'Piece: Lame Fantome', rarity: 'epic', dropChance: 3, setId: 'lame_fantome' },
    { itemId: 'set_souffle_vital_piece', name: 'Piece: Souffle Vital', rarity: 'epic', dropChance: 3, setId: 'souffle_vital' },
    // Armes
    { itemId: 'exp_blade_shadow', name: 'Lame du Neant', rarity: 'epic', dropChance: 14 },
    { itemId: 'exp_staff_shadow', name: 'Sceptre des Tenebres', rarity: 'epic', dropChance: 14 },
    { itemId: 'exp_spear_crystal', name: 'Lance Cristalline', rarity: 'rare', dropChance: 16 },
    { itemId: 'exp_wand_crystal', name: 'Baguette de Cristal', rarity: 'rare', dropChance: 14 },
    { itemId: 'exp_sword_stone', name: 'Lame de Granit', rarity: 'rare', dropChance: 12 },
    // Armure zone precedente (epic)
    { itemId: 'exp_shadow_helm', name: "Capuche d'Ombre", rarity: 'epic', dropChance: 12 },
    { itemId: 'exp_shadow_gloves', name: "Griffes d'Ombre", rarity: 'epic', dropChance: 12 },
    // Unique
    { itemId: 'unique_fragment_sentinelle', name: 'Fragment de Sentinelle', rarity: 'legendary', dropChance: 2, uniqueId: 'fragment_sentinelle' },
    // Phase 2 Mythique
    { itemId: 'weapon_masamune', name: 'Masamune', rarity: 'mythique', dropChance: 8, weaponId: 'masamune' },
    { itemId: 'exp_ultimate_scroll', name: 'Parchemin Ultimate', rarity: 'epic', dropChance: 100 },
  ],

  // ── Boss 5: Reine Sylvestre ── (sum ~281% → avg 14.1 drops)
  boss_5: [
    // Armure Cristalline (rare)
    { itemId: 'exp_crystal_helm', name: 'Tiare Cristalline', rarity: 'rare', dropChance: 16 },
    { itemId: 'exp_crystal_chest', name: 'Armure Cristalline', rarity: 'rare', dropChance: 16 },
    { itemId: 'exp_crystal_gloves', name: 'Gants Cristallins', rarity: 'rare', dropChance: 14 },
    { itemId: 'exp_crystal_boots', name: 'Bottes Cristallines', rarity: 'rare', dropChance: 14 },
    // Accessoires Cristallins (rare)
    { itemId: 'exp_crystal_necklace', name: 'Collier Cristallin', rarity: 'rare', dropChance: 16 },
    { itemId: 'exp_crystal_ring', name: 'Anneau Cristallin', rarity: 'rare', dropChance: 16 },
    // Sets zone Foret — complets (rare, taux eleves)
    { itemId: 'set_griffes_wyverne_piece', name: 'Piece: Griffes de Wyverne', rarity: 'rare', dropChance: 22, setId: 'griffes_wyverne' },
    { itemId: 'set_crocs_loup_piece', name: 'Piece: Crocs du Loup', rarity: 'rare', dropChance: 20, setId: 'crocs_loup' },
    { itemId: 'set_ecailles_drake_piece', name: 'Piece: Ecailles de Drake', rarity: 'rare', dropChance: 20, setId: 'ecailles_drake' },
    { itemId: 'set_plumes_phenix_piece', name: 'Piece: Plumes de Phenix', rarity: 'rare', dropChance: 20, setId: 'plumes_phenix' },
    { itemId: 'set_ronce_vivante_piece', name: 'Piece: Ronce Vivante', rarity: 'rare', dropChance: 16, setId: 'ronce_vivante' },
    // Big sets (epic)
    { itemId: 'set_nova_arcanique_piece', name: 'Piece: Nova Arcanique', rarity: 'epic', dropChance: 8, setId: 'nova_arcanique' },
    { itemId: 'set_fureur_titan_piece', name: 'Piece: Fureur du Titan', rarity: 'epic', dropChance: 7, setId: 'fureur_titan' },
    { itemId: 'set_aegis_gardien_piece', name: "Piece: Aegis du Gardien", rarity: 'epic', dropChance: 6, setId: 'aegis_gardien' },
    { itemId: 'set_lame_fantome_piece', name: 'Piece: Lame Fantome', rarity: 'epic', dropChance: 4, setId: 'lame_fantome' },
    { itemId: 'set_souffle_vital_piece', name: 'Piece: Souffle Vital', rarity: 'epic', dropChance: 4, setId: 'souffle_vital' },
    // Armes (epic)
    { itemId: 'exp_blade_shadow', name: 'Lame du Neant', rarity: 'epic', dropChance: 16 },
    { itemId: 'exp_staff_shadow', name: 'Sceptre des Tenebres', rarity: 'epic', dropChance: 14 },
    { itemId: 'exp_spear_crystal', name: 'Lance Cristalline', rarity: 'rare', dropChance: 16 },
    { itemId: 'exp_wand_crystal', name: 'Baguette de Cristal', rarity: 'rare', dropChance: 14 },
    // Armure zone precedente (epic)
    { itemId: 'exp_shadow_chest', name: "Tunique d'Ombre", rarity: 'epic', dropChance: 14 },
    { itemId: 'exp_shadow_boots', name: "Sandales d'Ombre", rarity: 'epic', dropChance: 14 },
    // Unique
    { itemId: 'unique_plume_ange_noir', name: 'Plume de l\'Ange Noir', rarity: 'legendary', dropChance: 2, uniqueId: 'plume_ange_noir' },
    // Phase 2 Mythique
    { itemId: 'weapon_longinus', name: 'Lance de Longinus', rarity: 'mythique', dropChance: 8, weaponId: 'longinus' },
    { itemId: 'exp_ultimate_scroll', name: 'Parchemin Ultimate', rarity: 'epic', dropChance: 100 },
  ],

  // ═══════════════════════════════════════════════════════
  // ZONE ABYSSES — Boss 6-10 (epic → legendary, mythique debut)
  // ═══════════════════════════════════════════════════════

  // ── Boss 6: Leviathan ── (sum ~302% → avg 15.1 drops)
  boss_6: [
    // Armure Abysses (epic)
    { itemId: 'exp_abyss_helm', name: 'Couronne des Abysses', rarity: 'epic', dropChance: 20 },
    { itemId: 'exp_abyss_chest', name: 'Cuirasse des Abysses', rarity: 'epic', dropChance: 18 },
    { itemId: 'exp_abyss_gloves', name: 'Gantelets des Abysses', rarity: 'epic', dropChance: 16 },
    { itemId: 'exp_abyss_boots', name: 'Bottes des Abysses', rarity: 'epic', dropChance: 16 },
    // Accessoires des Abysses (epic)
    { itemId: 'exp_abyss_necklace', name: 'Collier des Abysses', rarity: 'epic', dropChance: 16 },
    { itemId: 'exp_abyss_bracelet', name: 'Bracelet des Abysses', rarity: 'epic', dropChance: 16 },
    // Medium sets Abysses (epic)
    { itemId: 'set_souffle_glacial_piece', name: 'Piece: Souffle Glacial', rarity: 'epic', dropChance: 18, setId: 'souffle_glacial' },
    { itemId: 'set_cendres_ardentes_piece', name: 'Piece: Cendres Ardentes', rarity: 'epic', dropChance: 18, setId: 'cendres_ardentes' },
    { itemId: 'set_murmure_ombre_piece', name: "Piece: Murmure d'Ombre", rarity: 'epic', dropChance: 16, setId: 'murmure_ombre' },
    { itemId: 'set_lumiere_sacree_piece', name: 'Piece: Lumiere Sacree', rarity: 'epic', dropChance: 16, setId: 'lumiere_sacree' },
    { itemId: 'set_cuirasse_fer_piece', name: 'Piece: Cuirasse de Fer', rarity: 'epic', dropChance: 14, setId: 'cuirasse_fer' },
    // Big sets (epic)
    { itemId: 'set_fureur_titan_piece', name: 'Piece: Fureur du Titan', rarity: 'epic', dropChance: 10, setId: 'fureur_titan' },
    { itemId: 'set_aegis_gardien_piece', name: "Piece: Aegis du Gardien", rarity: 'epic', dropChance: 10, setId: 'aegis_gardien' },
    { itemId: 'set_nova_arcanique_piece', name: 'Piece: Nova Arcanique', rarity: 'epic', dropChance: 8, setId: 'nova_arcanique' },
    { itemId: 'set_lame_fantome_piece', name: 'Piece: Lame Fantome', rarity: 'epic', dropChance: 6, setId: 'lame_fantome' },
    { itemId: 'set_souffle_vital_piece', name: 'Piece: Souffle Vital', rarity: 'epic', dropChance: 6, setId: 'souffle_vital' },
    // Sets Foret carry-over (rare)
    { itemId: 'set_griffes_wyverne_piece', name: 'Piece: Griffes de Wyverne', rarity: 'rare', dropChance: 14, setId: 'griffes_wyverne' },
    { itemId: 'set_ecailles_drake_piece', name: 'Piece: Ecailles de Drake', rarity: 'rare', dropChance: 12, setId: 'ecailles_drake' },
    // Armes (epic)
    { itemId: 'exp_axe_abyss', name: 'Hache des Profondeurs', rarity: 'epic', dropChance: 14 },
    { itemId: 'exp_glaive_abyss', name: 'Glaive des Abysses', rarity: 'epic', dropChance: 14 },
    // Armes zone precedente
    { itemId: 'exp_blade_shadow', name: 'Lame du Neant', rarity: 'epic', dropChance: 12 },
    { itemId: 'exp_staff_shadow', name: 'Sceptre des Tenebres', rarity: 'epic', dropChance: 12 },
    // Armure precedente
    { itemId: 'exp_shadow_helm', name: "Capuche d'Ombre", rarity: 'epic', dropChance: 12 },
    { itemId: 'exp_shadow_chest', name: "Tunique d'Ombre", rarity: 'epic', dropChance: 12 },
    // Arme mythique (introduction!)
    { itemId: 'weapon_thyrsus', name: 'Thyrsus', rarity: 'mythique', dropChance: 1.5, weaponId: 'thyrsus' },
    // Legendary weapon teaser
    { itemId: 'exp_katana_void', name: 'Katana du Neant', rarity: 'legendary', dropChance: 3 },
    // Unique
    { itemId: 'unique_larme_foret', name: 'Larme de la Foret', rarity: 'legendary', dropChance: 2, uniqueId: 'larme_foret' },
    // Phase 2 Mythique
    { itemId: 'weapon_tyrfing', name: 'Tyrfing', rarity: 'mythique', dropChance: 10, weaponId: 'tyrfing' },
    { itemId: 'exp_ultimate_scroll', name: 'Parchemin Ultimate', rarity: 'epic', dropChance: 100 },
  ],

  // ── Boss 7: Sorcier Abyssal ── (sum ~305% → avg 15.3 drops)
  boss_7: [
    // Armure Abysses (epic)
    { itemId: 'exp_abyss_helm', name: 'Couronne des Abysses', rarity: 'epic', dropChance: 18 },
    { itemId: 'exp_abyss_chest', name: 'Cuirasse des Abysses', rarity: 'epic', dropChance: 18 },
    { itemId: 'exp_abyss_gloves', name: 'Gantelets des Abysses', rarity: 'epic', dropChance: 16 },
    { itemId: 'exp_abyss_boots', name: 'Bottes des Abysses', rarity: 'epic', dropChance: 16 },
    // Accessoires des Abysses (epic)
    { itemId: 'exp_abyss_ring', name: 'Anneau des Abysses', rarity: 'epic', dropChance: 16 },
    { itemId: 'exp_abyss_earring', name: 'Boucles des Abysses', rarity: 'epic', dropChance: 16 },
    // Medium sets Abysses (epic)
    { itemId: 'set_murmure_ombre_piece', name: "Piece: Murmure d'Ombre", rarity: 'epic', dropChance: 18, setId: 'murmure_ombre' },
    { itemId: 'set_lumiere_sacree_piece', name: 'Piece: Lumiere Sacree', rarity: 'epic', dropChance: 18, setId: 'lumiere_sacree' },
    { itemId: 'set_souffle_glacial_piece', name: 'Piece: Souffle Glacial', rarity: 'epic', dropChance: 16, setId: 'souffle_glacial' },
    { itemId: 'set_cendres_ardentes_piece', name: 'Piece: Cendres Ardentes', rarity: 'epic', dropChance: 16, setId: 'cendres_ardentes' },
    { itemId: 'set_cuirasse_fer_piece', name: 'Piece: Cuirasse de Fer', rarity: 'epic', dropChance: 14, setId: 'cuirasse_fer' },
    // Big sets (epic)
    { itemId: 'set_souffle_vital_piece', name: 'Piece: Souffle Vital', rarity: 'epic', dropChance: 10, setId: 'souffle_vital' },
    { itemId: 'set_lame_fantome_piece', name: 'Piece: Lame Fantome', rarity: 'epic', dropChance: 10, setId: 'lame_fantome' },
    { itemId: 'set_fureur_titan_piece', name: 'Piece: Fureur du Titan', rarity: 'epic', dropChance: 8, setId: 'fureur_titan' },
    { itemId: 'set_aegis_gardien_piece', name: "Piece: Aegis du Gardien", rarity: 'epic', dropChance: 8, setId: 'aegis_gardien' },
    // Sets Foret carry-over (rare)
    { itemId: 'set_plumes_phenix_piece', name: 'Piece: Plumes de Phenix', rarity: 'rare', dropChance: 14, setId: 'plumes_phenix' },
    { itemId: 'set_ronce_vivante_piece', name: 'Piece: Ronce Vivante', rarity: 'rare', dropChance: 14, setId: 'ronce_vivante' },
    { itemId: 'set_crocs_loup_piece', name: 'Piece: Crocs du Loup', rarity: 'rare', dropChance: 12, setId: 'crocs_loup' },
    // Armes
    { itemId: 'exp_orb_abyss', name: 'Orbe Abyssale', rarity: 'epic', dropChance: 14 },
    { itemId: 'exp_whip_abyss', name: 'Fouet Abyssal', rarity: 'epic', dropChance: 14 },
    { itemId: 'exp_axe_abyss', name: 'Hache des Profondeurs', rarity: 'epic', dropChance: 12 },
    { itemId: 'exp_glaive_abyss', name: 'Glaive des Abysses', rarity: 'epic', dropChance: 12 },
    // Arme mythique
    { itemId: 'weapon_thyrsus', name: 'Thyrsus', rarity: 'mythique', dropChance: 3, weaponId: 'thyrsus' },
    // Legendary weapon
    { itemId: 'exp_katana_void', name: 'Katana du Neant', rarity: 'legendary', dropChance: 3 },
    // Unique
    { itemId: 'unique_sceau_commandant', name: 'Sceau du Commandant', rarity: 'legendary', dropChance: 2, uniqueId: 'sceau_commandant' },
    // Phase 2 Mythique
    { itemId: 'weapon_ea_staff', name: 'Ea, Bâton des Cieux', rarity: 'mythique', dropChance: 10, weaponId: 'ea_staff' },
    { itemId: 'exp_ultimate_scroll', name: 'Parchemin Ultimate', rarity: 'epic', dropChance: 100 },
  ],

  // ── Boss 8: Titan de Fer ── (sum ~325% → avg 16.3 drops)
  // Introduction des sets Neant en preparation pour boss 11-15
  boss_8: [
    // Armure Magma (epic)
    { itemId: 'exp_magma_helm', name: 'Casque de Magma', rarity: 'epic', dropChance: 18 },
    { itemId: 'exp_magma_chest', name: 'Plastron de Magma', rarity: 'epic', dropChance: 18 },
    { itemId: 'exp_magma_gloves', name: 'Gants de Lave', rarity: 'epic', dropChance: 16 },
    // Accessoires des Abysses (epic)
    { itemId: 'exp_abyss_necklace', name: 'Collier des Abysses', rarity: 'epic', dropChance: 16 },
    { itemId: 'exp_abyss_earring', name: 'Boucles des Abysses', rarity: 'epic', dropChance: 16 },
    // Medium sets Abysses (epic)
    { itemId: 'set_cuirasse_fer_piece', name: 'Piece: Cuirasse de Fer', rarity: 'epic', dropChance: 18, setId: 'cuirasse_fer' },
    { itemId: 'set_souffle_glacial_piece', name: 'Piece: Souffle Glacial', rarity: 'epic', dropChance: 16, setId: 'souffle_glacial' },
    { itemId: 'set_cendres_ardentes_piece', name: 'Piece: Cendres Ardentes', rarity: 'epic', dropChance: 16, setId: 'cendres_ardentes' },
    { itemId: 'set_murmure_ombre_piece', name: "Piece: Murmure d'Ombre", rarity: 'epic', dropChance: 14, setId: 'murmure_ombre' },
    // ★ Sets Neant TEASER — preparer pour boss 11-15
    { itemId: 'set_ailes_vent_piece', name: 'Piece: Ailes du Vent', rarity: 'epic', dropChance: 6, setId: 'ailes_vent' },
    { itemId: 'set_sang_guerrier_piece', name: 'Piece: Sang du Guerrier', rarity: 'epic', dropChance: 6, setId: 'sang_guerrier' },
    { itemId: 'set_totem_ancestral_piece', name: 'Piece: Totem Ancestral', rarity: 'epic', dropChance: 5, setId: 'totem_ancestral' },
    { itemId: 'set_brume_mystique_piece', name: 'Piece: Brume Mystique', rarity: 'epic', dropChance: 5, setId: 'brume_mystique' },
    { itemId: 'set_lien_meute_piece', name: 'Piece: Lien de Meute', rarity: 'epic', dropChance: 5, setId: 'lien_meute' },
    // ★ Support sets TEASER
    { itemId: 'set_sagesse_ancienne_piece', name: 'Piece: Sagesse Ancienne', rarity: 'epic', dropChance: 4, setId: 'sagesse_ancienne' },
    { itemId: 'set_souffle_celeste_piece', name: 'Piece: Souffle Celeste', rarity: 'epic', dropChance: 4, setId: 'souffle_celeste' },
    { itemId: 'set_purification_sacree_piece', name: 'Piece: Purification Sacree', rarity: 'epic', dropChance: 4, setId: 'purification_sacree' },
    { itemId: 'set_brise_guerissante_piece', name: 'Piece: Brise Guerissante', rarity: 'epic', dropChance: 4, setId: 'brise_guerissante' },
    // Big sets (epic)
    { itemId: 'set_fureur_titan_piece', name: 'Piece: Fureur du Titan', rarity: 'epic', dropChance: 12, setId: 'fureur_titan' },
    { itemId: 'set_aegis_gardien_piece', name: "Piece: Aegis du Gardien", rarity: 'epic', dropChance: 12, setId: 'aegis_gardien' },
    { itemId: 'set_lame_fantome_piece', name: 'Piece: Lame Fantome', rarity: 'epic', dropChance: 8, setId: 'lame_fantome' },
    { itemId: 'set_souffle_vital_piece', name: 'Piece: Souffle Vital', rarity: 'epic', dropChance: 8, setId: 'souffle_vital' },
    // Big sets legendary (teasers endgame)
    { itemId: 'set_tempete_acier_piece', name: "Piece: Tempete d'Acier", rarity: 'legendary', dropChance: 3, setId: 'tempete_acier' },
    { itemId: 'set_voix_neant_piece', name: 'Piece: Voix du Neant', rarity: 'legendary', dropChance: 3, setId: 'voix_neant' },
    // Armes
    { itemId: 'exp_scythe_abyss', name: 'Faux des Damnes', rarity: 'epic', dropChance: 14 },
    { itemId: 'exp_axe_abyss', name: 'Hache des Profondeurs', rarity: 'epic', dropChance: 12 },
    { itemId: 'exp_glaive_abyss', name: 'Glaive des Abysses', rarity: 'epic', dropChance: 12 },
    // Prev armor
    { itemId: 'exp_abyss_helm', name: 'Couronne des Abysses', rarity: 'epic', dropChance: 14 },
    { itemId: 'exp_abyss_boots', name: 'Bottes des Abysses', rarity: 'epic', dropChance: 14 },
    // Armes mythiques
    { itemId: 'weapon_aegis', name: 'Aegis', rarity: 'mythique', dropChance: 3, weaponId: 'aegis_weapon' },
    { itemId: 'weapon_thyrsus', name: 'Thyrsus', rarity: 'mythique', dropChance: 1.5, weaponId: 'thyrsus' },
    // Legendary weapon
    { itemId: 'exp_katana_void', name: 'Katana du Neant', rarity: 'legendary', dropChance: 4 },
    // Unique
    { itemId: 'unique_croc_warg', name: 'Croc du Warg', rarity: 'legendary', dropChance: 2, uniqueId: 'croc_warg' },
    // Phase 2 Mythique
    { itemId: 'weapon_fragarach', name: 'Fragarach', rarity: 'mythique', dropChance: 8, weaponId: 'fragarach' },
    { itemId: 'exp_ultimate_scroll', name: 'Parchemin Ultimate', rarity: 'epic', dropChance: 100 },
  ],

  // ── Boss 9: Hydre Venimeuse ── (sum ~322% → avg 16.1 drops)
  boss_9: [
    // Armure Magma (epic)
    { itemId: 'exp_magma_helm', name: 'Casque de Magma', rarity: 'epic', dropChance: 18 },
    { itemId: 'exp_magma_chest', name: 'Plastron de Magma', rarity: 'epic', dropChance: 18 },
    { itemId: 'exp_magma_gloves', name: 'Gants de Lave', rarity: 'epic', dropChance: 14 },
    // Accessoires Abysses + Ombre (epic)
    { itemId: 'exp_abyss_ring', name: 'Anneau des Abysses', rarity: 'epic', dropChance: 14 },
    { itemId: 'exp_shadow_bracelet', name: "Bracelet d'Ombre", rarity: 'epic', dropChance: 14 },
    // Medium sets Abysses (epic)
    { itemId: 'set_souffle_glacial_piece', name: 'Piece: Souffle Glacial', rarity: 'epic', dropChance: 18, setId: 'souffle_glacial' },
    { itemId: 'set_cendres_ardentes_piece', name: 'Piece: Cendres Ardentes', rarity: 'epic', dropChance: 18, setId: 'cendres_ardentes' },
    { itemId: 'set_lumiere_sacree_piece', name: 'Piece: Lumiere Sacree', rarity: 'epic', dropChance: 16, setId: 'lumiere_sacree' },
    // ★ Sets Neant TEASER — taux augmentes
    { itemId: 'set_ailes_vent_piece', name: 'Piece: Ailes du Vent', rarity: 'epic', dropChance: 7, setId: 'ailes_vent' },
    { itemId: 'set_sang_guerrier_piece', name: 'Piece: Sang du Guerrier', rarity: 'epic', dropChance: 7, setId: 'sang_guerrier' },
    { itemId: 'set_totem_ancestral_piece', name: 'Piece: Totem Ancestral', rarity: 'epic', dropChance: 6, setId: 'totem_ancestral' },
    { itemId: 'set_brume_mystique_piece', name: 'Piece: Brume Mystique', rarity: 'epic', dropChance: 6, setId: 'brume_mystique' },
    { itemId: 'set_lien_meute_piece', name: 'Piece: Lien de Meute', rarity: 'epic', dropChance: 6, setId: 'lien_meute' },
    // ★ Support sets TEASER
    { itemId: 'set_sagesse_ancienne_piece', name: 'Piece: Sagesse Ancienne', rarity: 'epic', dropChance: 5, setId: 'sagesse_ancienne' },
    { itemId: 'set_souffle_celeste_piece', name: 'Piece: Souffle Celeste', rarity: 'epic', dropChance: 5, setId: 'souffle_celeste' },
    { itemId: 'set_purification_sacree_piece', name: 'Piece: Purification Sacree', rarity: 'epic', dropChance: 4, setId: 'purification_sacree' },
    { itemId: 'set_brise_guerissante_piece', name: 'Piece: Brise Guerissante', rarity: 'epic', dropChance: 4, setId: 'brise_guerissante' },
    // Big sets (epic)
    { itemId: 'set_lame_fantome_piece', name: 'Piece: Lame Fantome', rarity: 'epic', dropChance: 10, setId: 'lame_fantome' },
    { itemId: 'set_souffle_vital_piece', name: 'Piece: Souffle Vital', rarity: 'epic', dropChance: 10, setId: 'souffle_vital' },
    { itemId: 'set_nova_arcanique_piece', name: 'Piece: Nova Arcanique', rarity: 'epic', dropChance: 8, setId: 'nova_arcanique' },
    { itemId: 'set_fureur_titan_piece', name: 'Piece: Fureur du Titan', rarity: 'epic', dropChance: 8, setId: 'fureur_titan' },
    // Big sets legendary (teasers)
    { itemId: 'set_tempete_acier_piece', name: "Piece: Tempete d'Acier", rarity: 'legendary', dropChance: 4, setId: 'tempete_acier' },
    { itemId: 'set_pacte_sang_piece', name: 'Piece: Pacte de Sang', rarity: 'legendary', dropChance: 3, setId: 'pacte_sang' },
    // Armes
    { itemId: 'exp_scythe_abyss', name: 'Faux des Damnes', rarity: 'epic', dropChance: 14 },
    { itemId: 'exp_orb_abyss', name: 'Orbe Abyssale', rarity: 'epic', dropChance: 14 },
    { itemId: 'exp_whip_abyss', name: 'Fouet Abyssal', rarity: 'epic', dropChance: 12 },
    // Prev armor
    { itemId: 'exp_abyss_chest', name: 'Cuirasse des Abysses', rarity: 'epic', dropChance: 14 },
    { itemId: 'exp_abyss_gloves', name: 'Gantelets des Abysses', rarity: 'epic', dropChance: 14 },
    // Armes mythiques
    { itemId: 'weapon_caladbolg', name: 'Caladbolg', rarity: 'mythique', dropChance: 3, weaponId: 'caladbolg' },
    { itemId: 'weapon_aegis', name: 'Aegis', rarity: 'mythique', dropChance: 1.5, weaponId: 'aegis_weapon' },
    // Legendary weapon
    { itemId: 'exp_katana_void', name: 'Katana du Neant', rarity: 'legendary', dropChance: 5 },
    // Unique
    { itemId: 'unique_cape_fantome', name: 'Cape du Fantome', rarity: 'legendary', dropChance: 2, uniqueId: 'cape_fantome' },
    // Phase 2 Mythique
    { itemId: 'weapon_tacos_eternel', name: 'Tacos Éternel de Rayan', rarity: 'mythique', dropChance: 8, weaponId: 'tacos_eternel' },
    { itemId: 'exp_ultimate_scroll', name: 'Parchemin Ultimate', rarity: 'epic', dropChance: 100 },
  ],

  // ── Boss 10: Roi des Profondeurs ── (sum ~335% → avg 16.8 drops)
  // Transition boss: Abysses + Neant melange
  boss_10: [
    // Armure Magma (epic)
    { itemId: 'exp_magma_helm', name: 'Casque de Magma', rarity: 'epic', dropChance: 16 },
    { itemId: 'exp_magma_chest', name: 'Plastron de Magma', rarity: 'epic', dropChance: 16 },
    // Accessoires Abysses + Ombre (epic)
    { itemId: 'exp_abyss_bracelet', name: 'Bracelet des Abysses', rarity: 'epic', dropChance: 14 },
    { itemId: 'exp_shadow_earring', name: "Boucles d'Ombre", rarity: 'epic', dropChance: 14 },
    // Medium sets Abysses (epic)
    { itemId: 'set_cuirasse_fer_piece', name: 'Piece: Cuirasse de Fer', rarity: 'epic', dropChance: 18, setId: 'cuirasse_fer' },
    { itemId: 'set_murmure_ombre_piece', name: "Piece: Murmure d'Ombre", rarity: 'epic', dropChance: 18, setId: 'murmure_ombre' },
    { itemId: 'set_lumiere_sacree_piece', name: 'Piece: Lumiere Sacree', rarity: 'epic', dropChance: 16, setId: 'lumiere_sacree' },
    // ★ Sets Neant — taux significatifs (preparation endgame)
    { itemId: 'set_ailes_vent_piece', name: 'Piece: Ailes du Vent', rarity: 'epic', dropChance: 8, setId: 'ailes_vent' },
    { itemId: 'set_sang_guerrier_piece', name: 'Piece: Sang du Guerrier', rarity: 'epic', dropChance: 8, setId: 'sang_guerrier' },
    { itemId: 'set_totem_ancestral_piece', name: 'Piece: Totem Ancestral', rarity: 'epic', dropChance: 7, setId: 'totem_ancestral' },
    { itemId: 'set_brume_mystique_piece', name: 'Piece: Brume Mystique', rarity: 'epic', dropChance: 7, setId: 'brume_mystique' },
    { itemId: 'set_lien_meute_piece', name: 'Piece: Lien de Meute', rarity: 'epic', dropChance: 7, setId: 'lien_meute' },
    // ★ Support sets (taux significatifs)
    { itemId: 'set_sagesse_ancienne_piece', name: 'Piece: Sagesse Ancienne', rarity: 'epic', dropChance: 6, setId: 'sagesse_ancienne' },
    { itemId: 'set_souffle_celeste_piece', name: 'Piece: Souffle Celeste', rarity: 'epic', dropChance: 6, setId: 'souffle_celeste' },
    { itemId: 'set_purification_sacree_piece', name: 'Piece: Purification Sacree', rarity: 'epic', dropChance: 5, setId: 'purification_sacree' },
    { itemId: 'set_brise_guerissante_piece', name: 'Piece: Brise Guerissante', rarity: 'epic', dropChance: 5, setId: 'brise_guerissante' },
    // Big sets (epic, taux eleves)
    { itemId: 'set_fureur_titan_piece', name: 'Piece: Fureur du Titan', rarity: 'epic', dropChance: 12, setId: 'fureur_titan' },
    { itemId: 'set_lame_fantome_piece', name: 'Piece: Lame Fantome', rarity: 'epic', dropChance: 12, setId: 'lame_fantome' },
    { itemId: 'set_aegis_gardien_piece', name: "Piece: Aegis du Gardien", rarity: 'epic', dropChance: 10, setId: 'aegis_gardien' },
    { itemId: 'set_souffle_vital_piece', name: 'Piece: Souffle Vital', rarity: 'epic', dropChance: 10, setId: 'souffle_vital' },
    // Big sets legendary
    { itemId: 'set_tempete_acier_piece', name: "Piece: Tempete d'Acier", rarity: 'legendary', dropChance: 5, setId: 'tempete_acier' },
    { itemId: 'set_voix_neant_piece', name: 'Piece: Voix du Neant', rarity: 'legendary', dropChance: 5, setId: 'voix_neant' },
    { itemId: 'set_pacte_sang_piece', name: 'Piece: Pacte de Sang', rarity: 'legendary', dropChance: 4, setId: 'pacte_sang' },
    { itemId: 'set_bastion_eternel_piece', name: 'Piece: Bastion Eternel', rarity: 'legendary', dropChance: 4, setId: 'bastion_eternel' },
    // Armes
    { itemId: 'exp_scythe_abyss', name: 'Faux des Damnes', rarity: 'epic', dropChance: 14 },
    { itemId: 'exp_orb_abyss', name: 'Orbe Abyssale', rarity: 'epic', dropChance: 14 },
    // Legendary weapons
    { itemId: 'exp_katana_void', name: 'Katana du Neant', rarity: 'legendary', dropChance: 6 },
    { itemId: 'exp_halberd_void', name: 'Hallebarde du Vide', rarity: 'legendary', dropChance: 4 },
    { itemId: 'exp_lance_briseur', name: 'Lance Brise-Tyran', rarity: 'legendary', dropChance: 4 },
    // Prev armor
    { itemId: 'exp_abyss_helm', name: 'Couronne des Abysses', rarity: 'epic', dropChance: 14 },
    { itemId: 'exp_abyss_chest', name: 'Cuirasse des Abysses', rarity: 'epic', dropChance: 14 },
    // Armes mythiques
    { itemId: 'weapon_nidhogg', name: 'Nidhogg', rarity: 'mythique', dropChance: 3.5, weaponId: 'nidhogg' },
    { itemId: 'weapon_caladbolg', name: 'Caladbolg', rarity: 'mythique', dropChance: 2, weaponId: 'caladbolg' },
    // Unique
    { itemId: 'unique_talisman_sage', name: 'Talisman du Sage', rarity: 'legendary', dropChance: 2, uniqueId: 'talisman_sage' },
    // Phase 2 Mythique
    { itemId: 'weapon_amenonuhoko', name: 'Ame-no-nuhoko', rarity: 'mythique', dropChance: 8, weaponId: 'amenonuhoko' },
    { itemId: 'exp_ultimate_scroll', name: 'Parchemin Ultimate', rarity: 'epic', dropChance: 100 },
  ],

  // ═══════════════════════════════════════════════════════
  // ZONE NEANT — Boss 11-15 (legendary abondant, mythique eleve)
  // ═══════════════════════════════════════════════════════

  // ── Boss 11: Spectre Originel ── (sum ~362% → avg 18.1 drops)
  boss_11: [
    // Armure du Neant (legendary)
    { itemId: 'exp_void_helm', name: 'Diademe du Neant', rarity: 'legendary', dropChance: 10 },
    { itemId: 'exp_void_chest', name: 'Plastron du Neant', rarity: 'legendary', dropChance: 10 },
    { itemId: 'exp_void_gloves', name: 'Griffes du Neant', rarity: 'legendary', dropChance: 8 },
    { itemId: 'exp_void_boots', name: 'Bottes du Neant', rarity: 'legendary', dropChance: 8 },
    // Accessoires du Neant (legendary)
    { itemId: 'exp_void_necklace', name: 'Amulette du Neant', rarity: 'legendary', dropChance: 10 },
    { itemId: 'exp_void_ring', name: 'Anneau du Neant', rarity: 'legendary', dropChance: 10 },
    // Medium sets Neant (epic — taux tres eleves, quasi-garanti avec 5x)
    { itemId: 'set_ailes_vent_piece', name: 'Piece: Ailes du Vent', rarity: 'epic', dropChance: 20, setId: 'ailes_vent' },
    { itemId: 'set_sang_guerrier_piece', name: 'Piece: Sang du Guerrier', rarity: 'epic', dropChance: 20, setId: 'sang_guerrier' },
    { itemId: 'set_totem_ancestral_piece', name: 'Piece: Totem Ancestral', rarity: 'epic', dropChance: 18, setId: 'totem_ancestral' },
    { itemId: 'set_brume_mystique_piece', name: 'Piece: Brume Mystique', rarity: 'epic', dropChance: 18, setId: 'brume_mystique' },
    { itemId: 'set_lien_meute_piece', name: 'Piece: Lien de Meute', rarity: 'epic', dropChance: 16, setId: 'lien_meute' },
    // ★ Support sets (taux eleves)
    { itemId: 'set_sagesse_ancienne_piece', name: 'Piece: Sagesse Ancienne', rarity: 'epic', dropChance: 10, setId: 'sagesse_ancienne' },
    { itemId: 'set_souffle_celeste_piece', name: 'Piece: Souffle Celeste', rarity: 'epic', dropChance: 10, setId: 'souffle_celeste' },
    { itemId: 'set_purification_sacree_piece', name: 'Piece: Purification Sacree', rarity: 'epic', dropChance: 8, setId: 'purification_sacree' },
    { itemId: 'set_brise_guerissante_piece', name: 'Piece: Brise Guerissante', rarity: 'epic', dropChance: 8, setId: 'brise_guerissante' },
    // Big sets (legendary)
    { itemId: 'set_tempete_acier_piece', name: "Piece: Tempete d'Acier", rarity: 'legendary', dropChance: 10, setId: 'tempete_acier' },
    { itemId: 'set_voix_neant_piece', name: 'Piece: Voix du Neant', rarity: 'legendary', dropChance: 10, setId: 'voix_neant' },
    { itemId: 'set_fureur_titan_piece', name: 'Piece: Fureur du Titan', rarity: 'epic', dropChance: 12, setId: 'fureur_titan' },
    { itemId: 'set_aegis_gardien_piece', name: "Piece: Aegis du Gardien", rarity: 'epic', dropChance: 12, setId: 'aegis_gardien' },
    { itemId: 'set_lame_fantome_piece', name: 'Piece: Lame Fantome', rarity: 'epic', dropChance: 10, setId: 'lame_fantome' },
    { itemId: 'set_souffle_vital_piece', name: 'Piece: Souffle Vital', rarity: 'epic', dropChance: 10, setId: 'souffle_vital' },
    // Big sets endgame (legendary, debut)
    { itemId: 'set_pacte_sang_piece', name: 'Piece: Pacte de Sang', rarity: 'legendary', dropChance: 6, setId: 'pacte_sang' },
    { itemId: 'set_bastion_eternel_piece', name: 'Piece: Bastion Eternel', rarity: 'legendary', dropChance: 6, setId: 'bastion_eternel' },
    // Medium Abysses carry-over
    { itemId: 'set_souffle_glacial_piece', name: 'Piece: Souffle Glacial', rarity: 'epic', dropChance: 14, setId: 'souffle_glacial' },
    { itemId: 'set_cendres_ardentes_piece', name: 'Piece: Cendres Ardentes', rarity: 'epic', dropChance: 14, setId: 'cendres_ardentes' },
    // Armes legendary
    { itemId: 'exp_grimoire_void', name: 'Grimoire du Neant', rarity: 'legendary', dropChance: 8 },
    { itemId: 'exp_katana_void', name: 'Katana du Neant', rarity: 'legendary', dropChance: 8 },
    { itemId: 'exp_halberd_void', name: 'Hallebarde du Vide', rarity: 'legendary', dropChance: 6 },
    { itemId: 'exp_lance_briseur', name: 'Lance Brise-Tyran', rarity: 'legendary', dropChance: 6 },
    // Prev armor
    { itemId: 'exp_magma_helm', name: 'Casque de Magma', rarity: 'epic', dropChance: 14 },
    { itemId: 'exp_magma_chest', name: 'Plastron de Magma', rarity: 'epic', dropChance: 14 },
    // Armes mythiques
    { itemId: 'weapon_yggdrasil', name: 'Yggdrasil', rarity: 'mythique', dropChance: 5, weaponId: 'yggdrasil' },
    { itemId: 'weapon_nidhogg', name: 'Nidhogg', rarity: 'mythique', dropChance: 3, weaponId: 'nidhogg' },
    // Unique
    { itemId: 'unique_diademe_astral', name: 'Diademe Astral', rarity: 'legendary', dropChance: 2, uniqueId: 'diademe_astral' },
    { itemId: 'exp_ultimate_scroll', name: 'Parchemin Ultimate', rarity: 'epic', dropChance: 100 },
  ],

  // ── Boss 12: Archonte du Vide ── (sum ~365% → avg 18.3 drops)
  boss_12: [
    // Armure du Neant (legendary)
    { itemId: 'exp_void_helm', name: 'Diademe du Neant', rarity: 'legendary', dropChance: 10 },
    { itemId: 'exp_void_chest', name: 'Plastron du Neant', rarity: 'legendary', dropChance: 10 },
    { itemId: 'exp_void_gloves', name: 'Griffes du Neant', rarity: 'legendary', dropChance: 10 },
    { itemId: 'exp_void_boots', name: 'Bottes du Neant', rarity: 'legendary', dropChance: 10 },
    // Accessoires du Neant (legendary)
    { itemId: 'exp_void_bracelet', name: 'Bracelet du Neant', rarity: 'legendary', dropChance: 10 },
    { itemId: 'exp_void_earring', name: 'Boucles du Neant', rarity: 'legendary', dropChance: 10 },
    // Medium sets Neant (epic — quasi-garanti)
    { itemId: 'set_totem_ancestral_piece', name: 'Piece: Totem Ancestral', rarity: 'epic', dropChance: 20, setId: 'totem_ancestral' },
    { itemId: 'set_brume_mystique_piece', name: 'Piece: Brume Mystique', rarity: 'epic', dropChance: 20, setId: 'brume_mystique' },
    { itemId: 'set_ailes_vent_piece', name: 'Piece: Ailes du Vent', rarity: 'epic', dropChance: 18, setId: 'ailes_vent' },
    { itemId: 'set_sang_guerrier_piece', name: 'Piece: Sang du Guerrier', rarity: 'epic', dropChance: 18, setId: 'sang_guerrier' },
    { itemId: 'set_lien_meute_piece', name: 'Piece: Lien de Meute', rarity: 'epic', dropChance: 16, setId: 'lien_meute' },
    // ★ Support sets (taux eleves)
    { itemId: 'set_sagesse_ancienne_piece', name: 'Piece: Sagesse Ancienne', rarity: 'epic', dropChance: 12, setId: 'sagesse_ancienne' },
    { itemId: 'set_souffle_celeste_piece', name: 'Piece: Souffle Celeste', rarity: 'epic', dropChance: 12, setId: 'souffle_celeste' },
    { itemId: 'set_purification_sacree_piece', name: 'Piece: Purification Sacree', rarity: 'epic', dropChance: 10, setId: 'purification_sacree' },
    { itemId: 'set_brise_guerissante_piece', name: 'Piece: Brise Guerissante', rarity: 'epic', dropChance: 10, setId: 'brise_guerissante' },
    // Big sets (legendary)
    { itemId: 'set_pacte_sang_piece', name: 'Piece: Pacte de Sang', rarity: 'legendary', dropChance: 10, setId: 'pacte_sang' },
    { itemId: 'set_bastion_eternel_piece', name: 'Piece: Bastion Eternel', rarity: 'legendary', dropChance: 10, setId: 'bastion_eternel' },
    { itemId: 'set_tempete_acier_piece', name: "Piece: Tempete d'Acier", rarity: 'legendary', dropChance: 8, setId: 'tempete_acier' },
    { itemId: 'set_voix_neant_piece', name: 'Piece: Voix du Neant', rarity: 'legendary', dropChance: 8, setId: 'voix_neant' },
    { itemId: 'set_harmonie_celeste_piece', name: 'Piece: Harmonie Celeste', rarity: 'legendary', dropChance: 5, setId: 'harmonie_celeste' },
    // Big sets (epic)
    { itemId: 'set_lame_fantome_piece', name: 'Piece: Lame Fantome', rarity: 'epic', dropChance: 12, setId: 'lame_fantome' },
    { itemId: 'set_souffle_vital_piece', name: 'Piece: Souffle Vital', rarity: 'epic', dropChance: 12, setId: 'souffle_vital' },
    { itemId: 'set_fureur_titan_piece', name: 'Piece: Fureur du Titan', rarity: 'epic', dropChance: 10, setId: 'fureur_titan' },
    // Medium Abysses carry-over
    { itemId: 'set_cuirasse_fer_piece', name: 'Piece: Cuirasse de Fer', rarity: 'epic', dropChance: 14, setId: 'cuirasse_fer' },
    { itemId: 'set_murmure_ombre_piece', name: "Piece: Murmure d'Ombre", rarity: 'epic', dropChance: 14, setId: 'murmure_ombre' },
    // Armes legendary
    { itemId: 'exp_halberd_void', name: 'Hallebarde du Vide', rarity: 'legendary', dropChance: 8 },
    { itemId: 'exp_claws_void', name: 'Griffes Spectrales', rarity: 'legendary', dropChance: 8 },
    { itemId: 'exp_grimoire_void', name: 'Grimoire du Neant', rarity: 'legendary', dropChance: 6 },
    { itemId: 'exp_katana_void', name: 'Katana du Neant', rarity: 'legendary', dropChance: 6 },
    { itemId: 'exp_lance_briseur', name: 'Lance Brise-Tyran', rarity: 'legendary', dropChance: 6 },
    // Prev armor
    { itemId: 'exp_magma_helm', name: 'Casque de Magma', rarity: 'epic', dropChance: 14 },
    { itemId: 'exp_abyss_chest', name: 'Cuirasse des Abysses', rarity: 'epic', dropChance: 12 },
    // Armes mythiques
    { itemId: 'weapon_mjolnir', name: 'Mjolnir', rarity: 'mythique', dropChance: 5, weaponId: 'mjolnir' },
    { itemId: 'weapon_yggdrasil', name: 'Yggdrasil', rarity: 'mythique', dropChance: 3, weaponId: 'yggdrasil' },
    // Unique
    { itemId: 'unique_sceaux_abysse', name: 'Sceaux de l\'Abysse', rarity: 'legendary', dropChance: 2, uniqueId: 'sceaux_abysse' },
    { itemId: 'exp_ultimate_scroll', name: 'Parchemin Ultimate', rarity: 'epic', dropChance: 100 },
  ],

  // ── Boss 13: Dragon du Chaos ── (sum ~380% → avg 19.0 drops)
  boss_13: [
    // Armure du Neant (legendary)
    { itemId: 'exp_void_helm', name: 'Diademe du Neant', rarity: 'legendary', dropChance: 12 },
    { itemId: 'exp_void_chest', name: 'Plastron du Neant', rarity: 'legendary', dropChance: 12 },
    { itemId: 'exp_void_gloves', name: 'Griffes du Neant', rarity: 'legendary', dropChance: 10 },
    { itemId: 'exp_void_boots', name: 'Bottes du Neant', rarity: 'legendary', dropChance: 10 },
    // Accessoires du Neant (legendary)
    { itemId: 'exp_void_necklace', name: 'Amulette du Neant', rarity: 'legendary', dropChance: 10 },
    { itemId: 'exp_void_ring', name: 'Anneau du Neant', rarity: 'legendary', dropChance: 10 },
    // Medium sets Neant (epic — abondant)
    { itemId: 'set_lien_meute_piece', name: 'Piece: Lien de Meute', rarity: 'epic', dropChance: 22, setId: 'lien_meute' },
    { itemId: 'set_ailes_vent_piece', name: 'Piece: Ailes du Vent', rarity: 'epic', dropChance: 20, setId: 'ailes_vent' },
    { itemId: 'set_sang_guerrier_piece', name: 'Piece: Sang du Guerrier', rarity: 'epic', dropChance: 20, setId: 'sang_guerrier' },
    { itemId: 'set_totem_ancestral_piece', name: 'Piece: Totem Ancestral', rarity: 'epic', dropChance: 18, setId: 'totem_ancestral' },
    { itemId: 'set_brume_mystique_piece', name: 'Piece: Brume Mystique', rarity: 'epic', dropChance: 18, setId: 'brume_mystique' },
    // ★ Support sets (taux eleves)
    { itemId: 'set_sagesse_ancienne_piece', name: 'Piece: Sagesse Ancienne', rarity: 'epic', dropChance: 14, setId: 'sagesse_ancienne' },
    { itemId: 'set_souffle_celeste_piece', name: 'Piece: Souffle Celeste', rarity: 'epic', dropChance: 14, setId: 'souffle_celeste' },
    { itemId: 'set_purification_sacree_piece', name: 'Piece: Purification Sacree', rarity: 'epic', dropChance: 12, setId: 'purification_sacree' },
    { itemId: 'set_brise_guerissante_piece', name: 'Piece: Brise Guerissante', rarity: 'epic', dropChance: 12, setId: 'brise_guerissante' },
    // Big sets (legendary, taux eleves)
    { itemId: 'set_tempete_acier_piece', name: "Piece: Tempete d'Acier", rarity: 'legendary', dropChance: 10, setId: 'tempete_acier' },
    { itemId: 'set_voix_neant_piece', name: 'Piece: Voix du Neant', rarity: 'legendary', dropChance: 10, setId: 'voix_neant' },
    { itemId: 'set_harmonie_celeste_piece', name: 'Piece: Harmonie Celeste', rarity: 'legendary', dropChance: 8, setId: 'harmonie_celeste' },
    { itemId: 'set_pacte_sang_piece', name: 'Piece: Pacte de Sang', rarity: 'legendary', dropChance: 8, setId: 'pacte_sang' },
    { itemId: 'set_bastion_eternel_piece', name: 'Piece: Bastion Eternel', rarity: 'legendary', dropChance: 8, setId: 'bastion_eternel' },
    // Big sets (epic)
    { itemId: 'set_lame_fantome_piece', name: 'Piece: Lame Fantome', rarity: 'epic', dropChance: 12, setId: 'lame_fantome' },
    { itemId: 'set_souffle_vital_piece', name: 'Piece: Souffle Vital', rarity: 'epic', dropChance: 12, setId: 'souffle_vital' },
    { itemId: 'set_fureur_titan_piece', name: 'Piece: Fureur du Titan', rarity: 'epic', dropChance: 10, setId: 'fureur_titan' },
    { itemId: 'set_aegis_gardien_piece', name: "Piece: Aegis du Gardien", rarity: 'epic', dropChance: 10, setId: 'aegis_gardien' },
    // Armes legendary
    { itemId: 'exp_katana_void', name: 'Katana du Neant', rarity: 'legendary', dropChance: 10 },
    { itemId: 'exp_halberd_void', name: 'Hallebarde du Vide', rarity: 'legendary', dropChance: 8 },
    { itemId: 'exp_talisman_void', name: 'Talisman Sacre', rarity: 'legendary', dropChance: 8 },
    { itemId: 'exp_claws_void', name: 'Griffes Spectrales', rarity: 'legendary', dropChance: 8 },
    { itemId: 'exp_grimoire_void', name: 'Grimoire du Neant', rarity: 'legendary', dropChance: 6 },
    { itemId: 'exp_lance_briseur', name: 'Lance Brise-Tyran', rarity: 'legendary', dropChance: 8 },
    // Prev armor
    { itemId: 'exp_abyss_helm', name: 'Couronne des Abysses', rarity: 'epic', dropChance: 14 },
    // Armes mythiques
    { itemId: 'weapon_gungnir', name: 'Gungnir', rarity: 'mythique', dropChance: 6, weaponId: 'gungnir' },
    { itemId: 'weapon_mjolnir', name: 'Mjolnir', rarity: 'mythique', dropChance: 3, weaponId: 'mjolnir' },
    // Unique
    { itemId: 'unique_gantelets_colosse', name: 'Gantelets du Colosse', rarity: 'legendary', dropChance: 2, uniqueId: 'gantelets_colosse' },
    { itemId: 'exp_ultimate_scroll', name: 'Parchemin Ultimate', rarity: 'epic', dropChance: 100 },
  ],

  // ── Boss 14: Monarque Eternel ── (sum ~400% → avg 20.0 drops)
  boss_14: [
    // Armure Eclipse (legendary)
    { itemId: 'exp_eclipse_helm', name: 'Couronne Eclipse', rarity: 'legendary', dropChance: 14 },
    { itemId: 'exp_eclipse_chest', name: 'Plastron Eclipse', rarity: 'legendary', dropChance: 14 },
    // Armure du Neant (legendary)
    { itemId: 'exp_void_helm', name: 'Diademe du Neant', rarity: 'legendary', dropChance: 10 },
    { itemId: 'exp_void_gloves', name: 'Griffes du Neant', rarity: 'legendary', dropChance: 10 },
    { itemId: 'exp_void_boots', name: 'Bottes du Neant', rarity: 'legendary', dropChance: 10 },
    // Accessoires du Neant (legendary)
    { itemId: 'exp_void_bracelet', name: 'Bracelet du Neant', rarity: 'legendary', dropChance: 12 },
    { itemId: 'exp_void_earring', name: 'Boucles du Neant', rarity: 'legendary', dropChance: 12 },
    // Medium sets Neant (epic — tous presents, taux massifs)
    { itemId: 'set_ailes_vent_piece', name: 'Piece: Ailes du Vent', rarity: 'epic', dropChance: 22, setId: 'ailes_vent' },
    { itemId: 'set_sang_guerrier_piece', name: 'Piece: Sang du Guerrier', rarity: 'epic', dropChance: 22, setId: 'sang_guerrier' },
    { itemId: 'set_totem_ancestral_piece', name: 'Piece: Totem Ancestral', rarity: 'epic', dropChance: 20, setId: 'totem_ancestral' },
    { itemId: 'set_brume_mystique_piece', name: 'Piece: Brume Mystique', rarity: 'epic', dropChance: 20, setId: 'brume_mystique' },
    { itemId: 'set_lien_meute_piece', name: 'Piece: Lien de Meute', rarity: 'epic', dropChance: 18, setId: 'lien_meute' },
    // ★ Support sets (taux massifs)
    { itemId: 'set_sagesse_ancienne_piece', name: 'Piece: Sagesse Ancienne', rarity: 'epic', dropChance: 16, setId: 'sagesse_ancienne' },
    { itemId: 'set_souffle_celeste_piece', name: 'Piece: Souffle Celeste', rarity: 'epic', dropChance: 16, setId: 'souffle_celeste' },
    { itemId: 'set_purification_sacree_piece', name: 'Piece: Purification Sacree', rarity: 'epic', dropChance: 14, setId: 'purification_sacree' },
    { itemId: 'set_brise_guerissante_piece', name: 'Piece: Brise Guerissante', rarity: 'epic', dropChance: 14, setId: 'brise_guerissante' },
    // Big sets (legendary, taux massifs)
    { itemId: 'set_pacte_sang_piece', name: 'Piece: Pacte de Sang', rarity: 'legendary', dropChance: 12, setId: 'pacte_sang' },
    { itemId: 'set_bastion_eternel_piece', name: 'Piece: Bastion Eternel', rarity: 'legendary', dropChance: 12, setId: 'bastion_eternel' },
    { itemId: 'set_harmonie_celeste_piece', name: 'Piece: Harmonie Celeste', rarity: 'legendary', dropChance: 10, setId: 'harmonie_celeste' },
    { itemId: 'set_tempete_acier_piece', name: "Piece: Tempete d'Acier", rarity: 'legendary', dropChance: 10, setId: 'tempete_acier' },
    { itemId: 'set_voix_neant_piece', name: 'Piece: Voix du Neant', rarity: 'legendary', dropChance: 10, setId: 'voix_neant' },
    // Big sets (epic)
    { itemId: 'set_lame_fantome_piece', name: 'Piece: Lame Fantome', rarity: 'epic', dropChance: 12, setId: 'lame_fantome' },
    { itemId: 'set_souffle_vital_piece', name: 'Piece: Souffle Vital', rarity: 'epic', dropChance: 12, setId: 'souffle_vital' },
    // Medium Abysses carry-over
    { itemId: 'set_souffle_glacial_piece', name: 'Piece: Souffle Glacial', rarity: 'epic', dropChance: 14, setId: 'souffle_glacial' },
    { itemId: 'set_cendres_ardentes_piece', name: 'Piece: Cendres Ardentes', rarity: 'epic', dropChance: 14, setId: 'cendres_ardentes' },
    // Armes legendary (best weapons)
    { itemId: 'exp_katana_void', name: 'Katana du Neant', rarity: 'legendary', dropChance: 10 },
    { itemId: 'exp_halberd_void', name: 'Hallebarde du Vide', rarity: 'legendary', dropChance: 8 },
    { itemId: 'exp_claws_void', name: 'Griffes Spectrales', rarity: 'legendary', dropChance: 8 },
    { itemId: 'exp_grimoire_void', name: 'Grimoire du Neant', rarity: 'legendary', dropChance: 8 },
    { itemId: 'exp_talisman_void', name: 'Talisman Sacre', rarity: 'legendary', dropChance: 6 },
    { itemId: 'exp_lance_briseur', name: 'Lance Brise-Tyran', rarity: 'legendary', dropChance: 8 },
    // Armes mythiques (taux eleves)
    { itemId: 'weapon_muramasa', name: 'Muramasa', rarity: 'mythique', dropChance: 7, weaponId: 'muramasa' },
    { itemId: 'weapon_gungnir', name: 'Gungnir', rarity: 'mythique', dropChance: 4, weaponId: 'gungnir' },
    // Unique
    { itemId: 'unique_couronne_vainqueur', name: 'Couronne du Vainqueur', rarity: 'legendary', dropChance: 2, uniqueId: 'couronne_vainqueur' },
    { itemId: 'exp_ultimate_scroll', name: 'Parchemin Ultimate', rarity: 'epic', dropChance: 100 },
  ],

  // ── Boss 15: Sung Il-Hwan ── (sum ~420% → avg 21.0 drops)
  // Boss ultime: drops les plus genereux du jeu
  boss_15: [
    // Armure Eclipse (legendary, taux eleves)
    { itemId: 'exp_eclipse_helm', name: 'Couronne Eclipse', rarity: 'legendary', dropChance: 16 },
    { itemId: 'exp_eclipse_chest', name: 'Plastron Eclipse', rarity: 'legendary', dropChance: 16 },
    // Armure Neant (legendary)
    { itemId: 'exp_void_helm', name: 'Diademe du Neant', rarity: 'legendary', dropChance: 12 },
    { itemId: 'exp_void_chest', name: 'Plastron du Neant', rarity: 'legendary', dropChance: 12 },
    { itemId: 'exp_void_gloves', name: 'Griffes du Neant', rarity: 'legendary', dropChance: 10 },
    { itemId: 'exp_void_boots', name: 'Bottes du Neant', rarity: 'legendary', dropChance: 10 },
    // Accessoires du Neant (legendary)
    { itemId: 'exp_void_necklace', name: 'Amulette du Neant', rarity: 'legendary', dropChance: 12 },
    { itemId: 'exp_void_ring', name: 'Anneau du Neant', rarity: 'legendary', dropChance: 12 },
    // Medium sets Neant (epic — quasi-garanti)
    { itemId: 'set_ailes_vent_piece', name: 'Piece: Ailes du Vent', rarity: 'epic', dropChance: 22, setId: 'ailes_vent' },
    { itemId: 'set_sang_guerrier_piece', name: 'Piece: Sang du Guerrier', rarity: 'epic', dropChance: 22, setId: 'sang_guerrier' },
    { itemId: 'set_totem_ancestral_piece', name: 'Piece: Totem Ancestral', rarity: 'epic', dropChance: 20, setId: 'totem_ancestral' },
    { itemId: 'set_brume_mystique_piece', name: 'Piece: Brume Mystique', rarity: 'epic', dropChance: 20, setId: 'brume_mystique' },
    { itemId: 'set_lien_meute_piece', name: 'Piece: Lien de Meute', rarity: 'epic', dropChance: 18, setId: 'lien_meute' },
    // ★ Support sets (taux maximum — boss ultime)
    { itemId: 'set_sagesse_ancienne_piece', name: 'Piece: Sagesse Ancienne', rarity: 'epic', dropChance: 18, setId: 'sagesse_ancienne' },
    { itemId: 'set_souffle_celeste_piece', name: 'Piece: Souffle Celeste', rarity: 'epic', dropChance: 18, setId: 'souffle_celeste' },
    { itemId: 'set_purification_sacree_piece', name: 'Piece: Purification Sacree', rarity: 'epic', dropChance: 16, setId: 'purification_sacree' },
    { itemId: 'set_brise_guerissante_piece', name: 'Piece: Brise Guerissante', rarity: 'epic', dropChance: 16, setId: 'brise_guerissante' },
    // ALL Big sets (legendary, taux massifs — boss ultime)
    { itemId: 'set_tempete_acier_piece', name: "Piece: Tempete d'Acier", rarity: 'legendary', dropChance: 14, setId: 'tempete_acier' },
    { itemId: 'set_voix_neant_piece', name: 'Piece: Voix du Neant', rarity: 'legendary', dropChance: 14, setId: 'voix_neant' },
    { itemId: 'set_pacte_sang_piece', name: 'Piece: Pacte de Sang', rarity: 'legendary', dropChance: 14, setId: 'pacte_sang' },
    { itemId: 'set_bastion_eternel_piece', name: 'Piece: Bastion Eternel', rarity: 'legendary', dropChance: 14, setId: 'bastion_eternel' },
    { itemId: 'set_harmonie_celeste_piece', name: 'Piece: Harmonie Celeste', rarity: 'legendary', dropChance: 12, setId: 'harmonie_celeste' },
    { itemId: 'set_fureur_titan_piece', name: 'Piece: Fureur du Titan', rarity: 'epic', dropChance: 12, setId: 'fureur_titan' },
    { itemId: 'set_aegis_gardien_piece', name: "Piece: Aegis du Gardien", rarity: 'epic', dropChance: 12, setId: 'aegis_gardien' },
    { itemId: 'set_lame_fantome_piece', name: 'Piece: Lame Fantome', rarity: 'epic', dropChance: 10, setId: 'lame_fantome' },
    { itemId: 'set_souffle_vital_piece', name: 'Piece: Souffle Vital', rarity: 'epic', dropChance: 10, setId: 'souffle_vital' },
    { itemId: 'set_nova_arcanique_piece', name: 'Piece: Nova Arcanique', rarity: 'epic', dropChance: 10, setId: 'nova_arcanique' },
    // Armes legendary — best weapons in the game
    { itemId: 'exp_katana_void', name: 'Katana du Neant', rarity: 'legendary', dropChance: 10 },
    { itemId: 'exp_halberd_void', name: 'Hallebarde du Vide', rarity: 'legendary', dropChance: 8 },
    { itemId: 'exp_grimoire_void', name: 'Grimoire du Neant', rarity: 'legendary', dropChance: 8 },
    { itemId: 'exp_claws_void', name: 'Griffes Spectrales', rarity: 'legendary', dropChance: 8 },
    { itemId: 'exp_talisman_void', name: 'Talisman Sacre', rarity: 'legendary', dropChance: 6 },
    { itemId: 'exp_lance_briseur', name: 'Lance Brise-Tyran', rarity: 'legendary', dropChance: 10 },
    // Armes mythiques (taux maximum — le boss ultime)
    { itemId: 'weapon_excalibur', name: 'Excalibur', rarity: 'mythique', dropChance: 10, weaponId: 'excalibur' },
    { itemId: 'weapon_gram', name: 'Gram', rarity: 'mythique', dropChance: 8, weaponId: 'gram' },
    { itemId: 'weapon_muramasa', name: 'Muramasa', rarity: 'mythique', dropChance: 5, weaponId: 'muramasa' },
    // Uniques (legendary)
    { itemId: 'unique_bottes_explorateur', name: 'Bottes de l\'Explorateur', rarity: 'legendary', dropChance: 3, uniqueId: 'bottes_explorateur' },
    { itemId: 'unique_relique_temps', name: 'Relique du Temps', rarity: 'legendary', dropChance: 2, uniqueId: 'relique_temps' },
    { itemId: 'exp_ultimate_scroll', name: 'Parchemin Ultimate', rarity: 'epic', dropChance: 100 },
  ],
};

// ── Mob wave tier by boss section (5 bosses) ──
export function getMobWaveTier(bossIndex) {
  if (bossIndex <= 0) return 'mob_wave_tier1';  // Boss 0: Gardien (forest)
  if (bossIndex <= 1) return 'mob_wave_tier2';  // Boss 1: Sentinelle (stone/crystal)
  if (bossIndex <= 2) return 'mob_wave_tier3';  // Boss 2: Seigneur Ombre (abyss)
  return 'mob_wave_tier4';                       // Boss 3-4: Manaya + Ragnaros (void)
}

export function getLootTable(tableId) {
  return LOOT_TABLES[tableId] || [];
}
