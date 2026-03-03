// ── Loot Tables for Expedition V2 — 15 Bosses ──
// dropChance is a percentage (0-100)
// essences drop separately via essenceSystem.js (on mob kill + boss kill)

export const LOOT_TABLES = {
  // ═══════════════════════════════════════════════════════
  // MOB WAVE LOOT (minor drops, tiers scale with zone)
  // ═══════════════════════════════════════════════════════

  mob_wave_tier1: [
    { itemId: 'exp_potion_hp', dropChance: 40 },
    { itemId: 'exp_potion_mana', dropChance: 30 },
    { itemId: 'exp_mat_wood', dropChance: 50 },
  ],
  mob_wave_tier2: [
    { itemId: 'exp_potion_hp', dropChance: 35 },
    { itemId: 'exp_potion_mana', dropChance: 35 },
    { itemId: 'exp_mat_wood', dropChance: 40 },
    { itemId: 'exp_mat_stone', dropChance: 40 },
    { itemId: 'exp_elixir_atk', dropChance: 15 },
  ],
  mob_wave_tier3: [
    { itemId: 'exp_potion_hp', dropChance: 30 },
    { itemId: 'exp_potion_mana', dropChance: 30 },
    { itemId: 'exp_mat_stone', dropChance: 45 },
    { itemId: 'exp_mat_shadow_dust', dropChance: 25 },
    { itemId: 'exp_elixir_atk', dropChance: 20 },
  ],
  mob_wave_tier4: [
    { itemId: 'exp_potion_hp', dropChance: 25 },
    { itemId: 'exp_potion_mana', dropChance: 25 },
    { itemId: 'exp_mat_shadow_dust', dropChance: 40 },
    { itemId: 'exp_mat_void_crystal', dropChance: 15 },
    { itemId: 'exp_elixir_atk', dropChance: 25 },
  ],

  // ═══════════════════════════════════════════════════════
  // ZONE FORET — Boss 1-5
  // ═══════════════════════════════════════════════════════

  boss_1: [
    { itemId: 'exp_forest_helm', dropChance: 25 },
    { itemId: 'exp_forest_chest', dropChance: 25 },
    { itemId: 'exp_forest_gloves', dropChance: 25 },
    { itemId: 'exp_forest_boots', dropChance: 25 },
    { itemId: 'set_ecailles_drake_piece', dropChance: 15, setId: 'ecailles_drake' },
    { itemId: 'set_crocs_loup_piece', dropChance: 15, setId: 'crocs_loup' },
    { itemId: 'exp_sword_forest', dropChance: 15 },
    { itemId: 'exp_staff_forest', dropChance: 15 },
    { itemId: 'exp_mat_essence', dropChance: 40 },
    { itemId: 'exp_mat_wood', dropChance: 60 },
    { itemId: 'exp_skin_forest_aura', dropChance: 0.5 },
    { itemId: 'exp_skill_nature_heal', dropChance: 2 },
  ],

  boss_2: [
    { itemId: 'exp_stone_helm', dropChance: 20 },
    { itemId: 'exp_stone_chest', dropChance: 20 },
    { itemId: 'exp_stone_gloves', dropChance: 20 },
    { itemId: 'exp_stone_boots', dropChance: 20 },
    { itemId: 'set_plumes_phenix_piece', dropChance: 12, setId: 'plumes_phenix' },
    { itemId: 'set_ronce_vivante_piece', dropChance: 12, setId: 'ronce_vivante' },
    { itemId: 'exp_sword_stone', dropChance: 12 },
    { itemId: 'exp_bow_stone', dropChance: 12 },
    { itemId: 'exp_mat_essence', dropChance: 50 },
    { itemId: 'exp_mat_stone', dropChance: 60 },
    { itemId: 'exp_skin_stone_armor', dropChance: 0.5 },
    { itemId: 'exp_skill_stone_wall', dropChance: 2 },
  ],

  boss_3: [
    { itemId: 'exp_shadow_helm', dropChance: 15 },
    { itemId: 'exp_shadow_chest', dropChance: 15 },
    { itemId: 'exp_shadow_gloves', dropChance: 15 },
    { itemId: 'exp_shadow_boots', dropChance: 15 },
    { itemId: 'set_griffes_wyverne_piece', dropChance: 10, setId: 'griffes_wyverne' },
    { itemId: 'exp_blade_shadow', dropChance: 5 },
    { itemId: 'exp_staff_shadow', dropChance: 5 },
    { itemId: 'exp_mat_essence', dropChance: 60 },
    { itemId: 'exp_mat_shadow_dust', dropChance: 50 },
    { itemId: 'exp_forest_helm', dropChance: 8 },
    { itemId: 'exp_stone_helm', dropChance: 8 },
  ],

  boss_4: [
    { itemId: 'set_ecailles_drake_piece', dropChance: 20, setId: 'ecailles_drake' },
    { itemId: 'set_plumes_phenix_piece', dropChance: 20, setId: 'plumes_phenix' },
    { itemId: 'set_ronce_vivante_piece', dropChance: 15, setId: 'ronce_vivante' },
    { itemId: 'set_nova_arcanique_piece', dropChance: 3, setId: 'nova_arcanique' },
    { itemId: 'exp_sword_stone', dropChance: 10 },
    { itemId: 'exp_blade_shadow', dropChance: 4 },
    { itemId: 'exp_mat_essence', dropChance: 60 },
    { itemId: 'exp_mat_wood', dropChance: 50 },
    { itemId: 'exp_mat_stone', dropChance: 40 },
  ],

  boss_5: [
    { itemId: 'set_crocs_loup_piece', dropChance: 18, setId: 'crocs_loup' },
    { itemId: 'set_griffes_wyverne_piece', dropChance: 18, setId: 'griffes_wyverne' },
    { itemId: 'set_ecailles_drake_piece', dropChance: 15, setId: 'ecailles_drake' },
    { itemId: 'set_nova_arcanique_piece', dropChance: 5, setId: 'nova_arcanique' },
    { itemId: 'exp_blade_shadow', dropChance: 8 },
    { itemId: 'exp_staff_shadow', dropChance: 8 },
    { itemId: 'exp_mat_essence', dropChance: 70 },
    { itemId: 'exp_mat_shadow_dust', dropChance: 40 },
  ],

  // ═══════════════════════════════════════════════════════
  // ZONE ABYSSES — Boss 6-10
  // ═══════════════════════════════════════════════════════

  boss_6: [
    { itemId: 'set_souffle_glacial_piece', dropChance: 18, setId: 'souffle_glacial' },
    { itemId: 'set_cendres_ardentes_piece', dropChance: 18, setId: 'cendres_ardentes' },
    { itemId: 'set_fureur_titan_piece', dropChance: 3, setId: 'fureur_titan' },
    { itemId: 'set_aegis_gardien_piece', dropChance: 3, setId: 'aegis_gardien' },
    { itemId: 'exp_mat_essence', dropChance: 70 },
    { itemId: 'exp_mat_shadow_dust', dropChance: 50 },
  ],

  boss_7: [
    { itemId: 'set_murmure_ombre_piece', dropChance: 15, setId: 'murmure_ombre' },
    { itemId: 'set_lumiere_sacree_piece', dropChance: 15, setId: 'lumiere_sacree' },
    { itemId: 'set_souffle_vital_piece', dropChance: 5, setId: 'souffle_vital' },
    { itemId: 'set_lame_fantome_piece', dropChance: 5, setId: 'lame_fantome' },
    { itemId: 'weapon_thyrsus', dropChance: 3, weaponId: 'thyrsus' },
    { itemId: 'exp_mat_essence', dropChance: 75 },
  ],

  boss_8: [
    { itemId: 'set_cuirasse_fer_piece', dropChance: 15, setId: 'cuirasse_fer' },
    { itemId: 'set_fureur_titan_piece', dropChance: 8, setId: 'fureur_titan' },
    { itemId: 'set_aegis_gardien_piece', dropChance: 8, setId: 'aegis_gardien' },
    { itemId: 'weapon_aegis', dropChance: 3, weaponId: 'aegis_weapon' },
    { itemId: 'exp_mat_essence', dropChance: 80 },
  ],

  boss_9: [
    { itemId: 'set_lame_fantome_piece', dropChance: 8, setId: 'lame_fantome' },
    { itemId: 'set_souffle_vital_piece', dropChance: 8, setId: 'souffle_vital' },
    { itemId: 'set_nova_arcanique_piece', dropChance: 6, setId: 'nova_arcanique' },
    { itemId: 'weapon_caladbolg', dropChance: 2, weaponId: 'caladbolg' },
    { itemId: 'set_souffle_glacial_piece', dropChance: 10, setId: 'souffle_glacial' },
    { itemId: 'set_cendres_ardentes_piece', dropChance: 10, setId: 'cendres_ardentes' },
    { itemId: 'exp_mat_essence', dropChance: 85 },
  ],

  boss_10: [
    { itemId: 'set_fureur_titan_piece', dropChance: 10, setId: 'fureur_titan' },
    { itemId: 'set_lame_fantome_piece', dropChance: 10, setId: 'lame_fantome' },
    { itemId: 'set_aegis_gardien_piece', dropChance: 10, setId: 'aegis_gardien' },
    { itemId: 'set_souffle_vital_piece', dropChance: 10, setId: 'souffle_vital' },
    { itemId: 'weapon_nidhogg', dropChance: 1.5, weaponId: 'nidhogg' },
    { itemId: 'set_cuirasse_fer_piece', dropChance: 12, setId: 'cuirasse_fer' },
    { itemId: 'set_murmure_ombre_piece', dropChance: 12, setId: 'murmure_ombre' },
    { itemId: 'exp_mat_essence', dropChance: 90 },
  ],

  // ═══════════════════════════════════════════════════════
  // ZONE NEANT — Boss 11-15
  // ═══════════════════════════════════════════════════════

  boss_11: [
    { itemId: 'set_ailes_vent_piece', dropChance: 15, setId: 'ailes_vent' },
    { itemId: 'set_sang_guerrier_piece', dropChance: 15, setId: 'sang_guerrier' },
    { itemId: 'set_tempete_acier_piece', dropChance: 3, setId: 'tempete_acier' },
    { itemId: 'set_voix_neant_piece', dropChance: 3, setId: 'voix_neant' },
    { itemId: 'weapon_yggdrasil', dropChance: 2, weaponId: 'yggdrasil' },
    { itemId: 'exp_mat_essence', dropChance: 90 },
    { itemId: 'exp_mat_void_crystal', dropChance: 40 },
  ],

  boss_12: [
    { itemId: 'set_totem_ancestral_piece', dropChance: 12, setId: 'totem_ancestral' },
    { itemId: 'set_brume_mystique_piece', dropChance: 12, setId: 'brume_mystique' },
    { itemId: 'set_pacte_sang_piece', dropChance: 5, setId: 'pacte_sang' },
    { itemId: 'set_bastion_eternel_piece', dropChance: 5, setId: 'bastion_eternel' },
    { itemId: 'weapon_mjolnir', dropChance: 1, weaponId: 'mjolnir' },
    { itemId: 'exp_mat_essence', dropChance: 95 },
    { itemId: 'exp_mat_void_crystal', dropChance: 50 },
  ],

  boss_13: [
    { itemId: 'set_lien_meute_piece', dropChance: 12, setId: 'lien_meute' },
    { itemId: 'set_tempete_acier_piece', dropChance: 8, setId: 'tempete_acier' },
    { itemId: 'set_voix_neant_piece', dropChance: 8, setId: 'voix_neant' },
    { itemId: 'set_harmonie_celeste_piece', dropChance: 5, setId: 'harmonie_celeste' },
    { itemId: 'weapon_gungnir', dropChance: 0.8, weaponId: 'gungnir' },
    { itemId: 'exp_mat_essence', dropChance: 95 },
    { itemId: 'exp_mat_void_crystal', dropChance: 60 },
  ],

  boss_14: [
    { itemId: 'set_pacte_sang_piece', dropChance: 8, setId: 'pacte_sang' },
    { itemId: 'set_bastion_eternel_piece', dropChance: 8, setId: 'bastion_eternel' },
    { itemId: 'set_harmonie_celeste_piece', dropChance: 8, setId: 'harmonie_celeste' },
    { itemId: 'set_tempete_acier_piece', dropChance: 8, setId: 'tempete_acier' },
    { itemId: 'weapon_muramasa', dropChance: 0.3, weaponId: 'muramasa' },
    { itemId: 'set_ailes_vent_piece', dropChance: 10, setId: 'ailes_vent' },
    { itemId: 'set_sang_guerrier_piece', dropChance: 10, setId: 'sang_guerrier' },
    { itemId: 'exp_mat_essence', dropChance: 100 },
    { itemId: 'exp_mat_void_crystal', dropChance: 70 },
  ],

  boss_15: [
    { itemId: 'set_tempete_acier_piece', dropChance: 10, setId: 'tempete_acier' },
    { itemId: 'set_voix_neant_piece', dropChance: 10, setId: 'voix_neant' },
    { itemId: 'set_pacte_sang_piece', dropChance: 10, setId: 'pacte_sang' },
    { itemId: 'set_bastion_eternel_piece', dropChance: 10, setId: 'bastion_eternel' },
    { itemId: 'set_harmonie_celeste_piece', dropChance: 10, setId: 'harmonie_celeste' },
    { itemId: 'weapon_excalibur', dropChance: 0.5, weaponId: 'excalibur' },
    { itemId: 'weapon_gram', dropChance: 0.3, weaponId: 'gram' },
    { itemId: 'set_lien_meute_piece', dropChance: 12, setId: 'lien_meute' },
    { itemId: 'set_totem_ancestral_piece', dropChance: 10, setId: 'totem_ancestral' },
    { itemId: 'set_brume_mystique_piece', dropChance: 10, setId: 'brume_mystique' },
    { itemId: 'exp_mat_essence', dropChance: 100 },
    { itemId: 'exp_mat_void_crystal', dropChance: 80 },
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
