// ── Loot Tables for Expedition I ──
// dropChance is a percentage (0-100)

export const LOOT_TABLES = {
  // ── Mob Wave Loot (minor drops) ──
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

  // ── Boss 1: Gardien de la Foret ──
  boss_1: [
    // Set pieces (Armure de la Foret)
    { itemId: 'exp_forest_helm', dropChance: 25 },
    { itemId: 'exp_forest_chest', dropChance: 25 },
    { itemId: 'exp_forest_gloves', dropChance: 25 },
    { itemId: 'exp_forest_boots', dropChance: 25 },
    // Weapons
    { itemId: 'exp_sword_forest', dropChance: 15 },
    { itemId: 'exp_staff_forest', dropChance: 15 },
    // Materials
    { itemId: 'exp_mat_essence', dropChance: 40 },
    { itemId: 'exp_mat_wood', dropChance: 60 },
    // Rare drops
    { itemId: 'exp_skin_forest_aura', dropChance: 0.5 },
    { itemId: 'exp_skill_nature_heal', dropChance: 2 },
  ],

  // ── Boss 2: Sentinelle de Pierre ──
  boss_2: [
    // Set pieces (Carapace de Pierre)
    { itemId: 'exp_stone_helm', dropChance: 20 },
    { itemId: 'exp_stone_chest', dropChance: 20 },
    { itemId: 'exp_stone_gloves', dropChance: 20 },
    { itemId: 'exp_stone_boots', dropChance: 20 },
    // Weapons
    { itemId: 'exp_sword_stone', dropChance: 12 },
    { itemId: 'exp_bow_stone', dropChance: 12 },
    // Materials
    { itemId: 'exp_mat_essence', dropChance: 50 },
    { itemId: 'exp_mat_stone', dropChance: 60 },
    // Rare drops
    { itemId: 'exp_skin_stone_armor', dropChance: 0.5 },
    { itemId: 'exp_skill_stone_wall', dropChance: 2 },
  ],

  // ── Boss 3: Seigneur Ombre ──
  boss_3: [
    // Set pieces (Voile d'Ombre)
    { itemId: 'exp_shadow_helm', dropChance: 15 },
    { itemId: 'exp_shadow_chest', dropChance: 15 },
    { itemId: 'exp_shadow_gloves', dropChance: 15 },
    { itemId: 'exp_shadow_boots', dropChance: 15 },
    // Weapons
    { itemId: 'exp_blade_shadow', dropChance: 5 },
    { itemId: 'exp_staff_shadow', dropChance: 5 },
    // Materials
    { itemId: 'exp_mat_essence', dropChance: 60 },
    { itemId: 'exp_mat_shadow_dust', dropChance: 50 },
    // All previous set pieces can also drop (lower rate)
    { itemId: 'exp_forest_helm', dropChance: 8 },
    { itemId: 'exp_forest_chest', dropChance: 8 },
    { itemId: 'exp_stone_helm', dropChance: 8 },
    { itemId: 'exp_stone_chest', dropChance: 8 },
  ],
};

export function getLootTable(tableId) {
  return LOOT_TABLES[tableId] || [];
}
