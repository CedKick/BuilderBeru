// ── Expedition V3 Items ──
// Real items referenced by lootTables.js
// Set pieces are resolved via expeditionSets.js, weapons via expeditionWeapons.js
// This file handles: armor, weapons, materials, currencies

export const EXPEDITION_ITEMS = [
  // ══════════════════════════════════════════════════════
  // ZONE FORET — Armor Sets (Boss 1-5)
  // ══════════════════════════════════════════════════════

  // ── SET: Armure de la Foret (Boss 1) — uncommon ──
  { id: 'exp_forest_helm', name: 'Heaume Sylvestre', type: 'armor', slot: 'helm', rarity: 'uncommon', binding: 'lqe', stats: { hp_flat: 500, def_flat: 10 }, setId: 'set_forest' },
  { id: 'exp_forest_chest', name: 'Plastron Sylvestre', type: 'armor', slot: 'chest', rarity: 'uncommon', binding: 'lqe', stats: { hp_flat: 800, def_flat: 15 }, setId: 'set_forest' },
  { id: 'exp_forest_gloves', name: 'Gantelets Sylvestres', type: 'armor', slot: 'gloves', rarity: 'uncommon', binding: 'lqe', stats: { atk_flat: 15, crit_rate: 3 }, setId: 'set_forest' },
  { id: 'exp_forest_boots', name: 'Bottes Sylvestres', type: 'armor', slot: 'boots', rarity: 'uncommon', binding: 'lqe', stats: { spd_flat: 8, def_flat: 10 }, setId: 'set_forest' },
  { id: 'exp_forest_necklace', name: 'Collier Sylvestre', type: 'armor', slot: 'necklace', rarity: 'uncommon', binding: 'lqe', stats: { hp_pct: 5, def_flat: 8 }, setId: 'set_forest' },
  { id: 'exp_forest_bracelet', name: 'Bracelet Sylvestre', type: 'armor', slot: 'bracelet', rarity: 'uncommon', binding: 'lqe', stats: { atk_pct: 4, def_flat: 6 }, setId: 'set_forest' },
  { id: 'exp_forest_ring', name: 'Anneau Sylvestre', type: 'armor', slot: 'ring', rarity: 'uncommon', binding: 'lqe', stats: { atk_flat: 12, crit_rate: 2 }, setId: 'set_forest' },
  { id: 'exp_forest_earring', name: 'Boucles Sylvestres', type: 'armor', slot: 'earring', rarity: 'uncommon', binding: 'lqe', stats: { hp_pct: 4, atk_flat: 10 }, setId: 'set_forest' },

  // ── SET: Carapace de Pierre (Boss 2) — rare ──
  { id: 'exp_stone_helm', name: 'Heaume de Pierre', type: 'armor', slot: 'helm', rarity: 'rare', binding: 'lqe', stats: { hp_flat: 800, def_flat: 20 }, setId: 'set_stone' },
  { id: 'exp_stone_chest', name: 'Plastron de Pierre', type: 'armor', slot: 'chest', rarity: 'rare', binding: 'lqe', stats: { hp_flat: 1200, def_flat: 30 }, setId: 'set_stone' },
  { id: 'exp_stone_gloves', name: 'Gantelets de Pierre', type: 'armor', slot: 'gloves', rarity: 'rare', binding: 'lqe', stats: { def_flat: 20, res_flat: 5 }, setId: 'set_stone' },
  { id: 'exp_stone_boots', name: 'Bottes de Pierre', type: 'armor', slot: 'boots', rarity: 'rare', binding: 'lqe', stats: { def_flat: 15, hp_flat: 600 }, setId: 'set_stone' },
  { id: 'exp_stone_necklace', name: 'Collier de Pierre', type: 'armor', slot: 'necklace', rarity: 'rare', binding: 'lqe', stats: { hp_pct: 8, def_flat: 15 }, setId: 'set_stone' },
  { id: 'exp_stone_bracelet', name: 'Bracelet de Pierre', type: 'armor', slot: 'bracelet', rarity: 'rare', binding: 'lqe', stats: { def_pct: 6, hp_flat: 400 }, setId: 'set_stone' },
  { id: 'exp_stone_ring', name: 'Anneau de Pierre', type: 'armor', slot: 'ring', rarity: 'rare', binding: 'lqe', stats: { def_flat: 18, res_flat: 4 }, setId: 'set_stone' },
  { id: 'exp_stone_earring', name: 'Boucles de Pierre', type: 'armor', slot: 'earring', rarity: 'rare', binding: 'lqe', stats: { hp_pct: 6, def_flat: 12 }, setId: 'set_stone' },

  // ── SET: Voile d'Ombre (Boss 3) — epic ──
  { id: 'exp_shadow_helm', name: 'Capuche d\'Ombre', type: 'armor', slot: 'helm', rarity: 'epic', binding: 'lqe', stats: { atk_flat: 25, crit_rate: 5 }, setId: 'set_shadow' },
  { id: 'exp_shadow_chest', name: 'Tunique d\'Ombre', type: 'armor', slot: 'chest', rarity: 'epic', binding: 'lqe', stats: { atk_flat: 35, hp_flat: 500 }, setId: 'set_shadow' },
  { id: 'exp_shadow_gloves', name: 'Griffes d\'Ombre', type: 'armor', slot: 'gloves', rarity: 'epic', binding: 'lqe', stats: { atk_flat: 30, crit_rate: 8 }, setId: 'set_shadow' },
  { id: 'exp_shadow_boots', name: 'Sandales d\'Ombre', type: 'armor', slot: 'boots', rarity: 'epic', binding: 'lqe', stats: { spd_flat: 15, atk_flat: 20 }, setId: 'set_shadow' },
  { id: 'exp_shadow_necklace', name: 'Pendentif d\'Ombre', type: 'armor', slot: 'necklace', rarity: 'epic', binding: 'lqe', stats: { atk_pct: 8, crit_rate: 4 }, setId: 'set_shadow' },
  { id: 'exp_shadow_bracelet', name: 'Bracelet d\'Ombre', type: 'armor', slot: 'bracelet', rarity: 'epic', binding: 'lqe', stats: { atk_pct: 6, spd_flat: 8 }, setId: 'set_shadow' },
  { id: 'exp_shadow_ring', name: 'Anneau d\'Ombre', type: 'armor', slot: 'ring', rarity: 'epic', binding: 'lqe', stats: { crit_rate: 6, crit_dmg: 10 }, setId: 'set_shadow' },
  { id: 'exp_shadow_earring', name: 'Boucles d\'Ombre', type: 'armor', slot: 'earring', rarity: 'epic', binding: 'lqe', stats: { atk_pct: 7, hp_flat: 350 }, setId: 'set_shadow' },

  // ── Armure Feuillue (Boss 1-2 trash) — common ──
  { id: 'exp_leaf_helm', name: 'Chapeau de Feuilles', type: 'armor', slot: 'helm', rarity: 'common', binding: 'lqe', stats: { hp_flat: 300, def_flat: 5 } },
  { id: 'exp_leaf_chest', name: 'Tunique de Mousse', type: 'armor', slot: 'chest', rarity: 'common', binding: 'lqe', stats: { hp_flat: 450, def_flat: 8 } },

  // ── Armure Cristalline (Boss 4-5 transition) — rare ──
  { id: 'exp_crystal_helm', name: 'Tiare Cristalline', type: 'armor', slot: 'helm', rarity: 'rare', binding: 'lqe', stats: { hp_flat: 650, atk_flat: 15, res_flat: 5 } },
  { id: 'exp_crystal_chest', name: 'Armure Cristalline', type: 'armor', slot: 'chest', rarity: 'rare', binding: 'lqe', stats: { hp_flat: 1000, def_flat: 22 } },
  { id: 'exp_crystal_gloves', name: 'Gants Cristallins', type: 'armor', slot: 'gloves', rarity: 'rare', binding: 'lqe', stats: { atk_flat: 20, crit_rate: 5, spd_flat: 3 } },
  { id: 'exp_crystal_boots', name: 'Bottes Cristallines', type: 'armor', slot: 'boots', rarity: 'rare', binding: 'lqe', stats: { spd_flat: 10, def_flat: 12 } },
  { id: 'exp_crystal_necklace', name: 'Collier Cristallin', type: 'armor', slot: 'necklace', rarity: 'rare', binding: 'lqe', stats: { hp_pct: 6, atk_flat: 12 } },
  { id: 'exp_crystal_ring', name: 'Anneau Cristallin', type: 'armor', slot: 'ring', rarity: 'rare', binding: 'lqe', stats: { crit_rate: 4, atk_flat: 15 } },

  // ══════════════════════════════════════════════════════
  // ZONE ABYSSES — Armor (Boss 6-10)
  // ══════════════════════════════════════════════════════

  // ── SET: Ecaille Abyssale (Boss 6-8) — epic ──
  { id: 'exp_abyss_helm', name: 'Couronne des Abysses', type: 'armor', slot: 'helm', rarity: 'epic', binding: 'lqe', stats: { hp_flat: 1000, def_flat: 28 }, setId: 'set_abyss' },
  { id: 'exp_abyss_chest', name: 'Cuirasse des Abysses', type: 'armor', slot: 'chest', rarity: 'epic', binding: 'lqe', stats: { hp_flat: 1500, def_flat: 38 }, setId: 'set_abyss' },
  { id: 'exp_abyss_gloves', name: 'Gantelets des Abysses', type: 'armor', slot: 'gloves', rarity: 'epic', binding: 'lqe', stats: { atk_flat: 40, crit_rate: 8 }, setId: 'set_abyss' },
  { id: 'exp_abyss_boots', name: 'Bottes des Abysses', type: 'armor', slot: 'boots', rarity: 'epic', binding: 'lqe', stats: { spd_flat: 14, def_flat: 22, hp_flat: 400 }, setId: 'set_abyss' },
  { id: 'exp_abyss_necklace', name: 'Collier des Abysses', type: 'armor', slot: 'necklace', rarity: 'epic', binding: 'lqe', stats: { hp_pct: 10, def_flat: 20 }, setId: 'set_abyss' },
  { id: 'exp_abyss_bracelet', name: 'Bracelet des Abysses', type: 'armor', slot: 'bracelet', rarity: 'epic', binding: 'lqe', stats: { atk_pct: 8, def_flat: 15 }, setId: 'set_abyss' },
  { id: 'exp_abyss_ring', name: 'Anneau des Abysses', type: 'armor', slot: 'ring', rarity: 'epic', binding: 'lqe', stats: { atk_flat: 35, crit_dmg: 12 }, setId: 'set_abyss' },
  { id: 'exp_abyss_earring', name: 'Boucles des Abysses', type: 'armor', slot: 'earring', rarity: 'epic', binding: 'lqe', stats: { hp_pct: 8, spd_flat: 10 }, setId: 'set_abyss' },

  // ── Armure de Magma (Boss 8-10) — epic ──
  { id: 'exp_magma_helm', name: 'Casque de Magma', type: 'armor', slot: 'helm', rarity: 'epic', binding: 'lqe', stats: { hp_flat: 1100, atk_flat: 20 } },
  { id: 'exp_magma_chest', name: 'Plastron de Magma', type: 'armor', slot: 'chest', rarity: 'epic', binding: 'lqe', stats: { hp_flat: 1600, def_flat: 32 } },
  { id: 'exp_magma_gloves', name: 'Gants de Lave', type: 'armor', slot: 'gloves', rarity: 'epic', binding: 'lqe', stats: { atk_flat: 45, crit_rate: 6 } },

  // ══════════════════════════════════════════════════════
  // ZONE NEANT — Armor (Boss 11-15)
  // ══════════════════════════════════════════════════════

  // ── SET: Armure du Neant (Boss 11-13) — legendary ──
  { id: 'exp_void_helm', name: 'Diademe du Neant', type: 'armor', slot: 'helm', rarity: 'legendary', binding: 'lqr', stats: { atk_flat: 45, crit_rate: 10, hp_flat: 500 }, setId: 'set_void' },
  { id: 'exp_void_chest', name: 'Plastron du Neant', type: 'armor', slot: 'chest', rarity: 'legendary', binding: 'lqr', stats: { hp_flat: 2000, def_flat: 50, atk_flat: 20 }, setId: 'set_void' },
  { id: 'exp_void_gloves', name: 'Griffes du Neant', type: 'armor', slot: 'gloves', rarity: 'legendary', binding: 'lqr', stats: { atk_flat: 55, crit_rate: 12 }, setId: 'set_void' },
  { id: 'exp_void_boots', name: 'Bottes du Neant', type: 'armor', slot: 'boots', rarity: 'legendary', binding: 'lqr', stats: { spd_flat: 22, atk_flat: 30, def_flat: 15 }, setId: 'set_void' },
  { id: 'exp_void_necklace', name: 'Amulette du Neant', type: 'armor', slot: 'necklace', rarity: 'legendary', binding: 'lqr', stats: { atk_pct: 12, crit_rate: 8, hp_flat: 300 }, setId: 'set_void' },
  { id: 'exp_void_bracelet', name: 'Bracelet du Neant', type: 'armor', slot: 'bracelet', rarity: 'legendary', binding: 'lqr', stats: { atk_pct: 10, int_pct: 8 }, setId: 'set_void' },
  { id: 'exp_void_ring', name: 'Anneau du Neant', type: 'armor', slot: 'ring', rarity: 'legendary', binding: 'lqr', stats: { crit_rate: 10, crit_dmg: 18, atk_flat: 25 }, setId: 'set_void' },
  { id: 'exp_void_earring', name: 'Boucles du Neant', type: 'armor', slot: 'earring', rarity: 'legendary', binding: 'lqr', stats: { hp_pct: 12, def_flat: 30, atk_pct: 6 }, setId: 'set_void' },

  // ── Armure Eclipse (Boss 14-15 endgame) — legendary ──
  { id: 'exp_eclipse_helm', name: 'Couronne Eclipse', type: 'armor', slot: 'helm', rarity: 'legendary', binding: 'lqr', stats: { atk_flat: 50, hp_flat: 800, crit_rate: 8 } },
  { id: 'exp_eclipse_chest', name: 'Plastron Eclipse', type: 'armor', slot: 'chest', rarity: 'legendary', binding: 'lqr', stats: { hp_flat: 2200, def_flat: 55, res_flat: 10 } },

  // ══════════════════════════════════════════════════════
  // WEAPONS — Progression: common → legendary
  // Effects: anti-heal, bleed, stun, debuff, scaling
  // ══════════════════════════════════════════════════════

  // ── Foret (common/uncommon) ──
  { id: 'exp_dagger_forest', name: 'Dague Sylvestre', type: 'weapon', slot: 'weapon', rarity: 'common', binding: 'lqe', stats: { atk_flat: 15, spd_flat: 3 } },
  { id: 'exp_bow_forest', name: 'Arc de Lierre', type: 'weapon', slot: 'weapon', rarity: 'uncommon', binding: 'lqe', stats: { atk_flat: 22, crit_rate: 3 } },
  { id: 'exp_sword_forest', name: 'Epee de Mousse', type: 'weapon', slot: 'weapon', rarity: 'uncommon', binding: 'lqe', stats: { atk_flat: 30 } },
  { id: 'exp_staff_forest', name: 'Baton Ancien', type: 'weapon', slot: 'weapon', rarity: 'uncommon', binding: 'lqe', stats: { atk_flat: 25, res_flat: 8 } },
  { id: 'exp_mace_forest', name: 'Masse Noueuse', type: 'weapon', slot: 'weapon', rarity: 'uncommon', binding: 'lqe', stats: { atk_flat: 28, def_flat: 8 }, description: '5% chance stun 0.5s par attaque',
    effects: [{ type: 'stun', chance: 5, duration: 0.5, trigger: 'on_hit' }] },

  // ── Pierre/Crystal (rare) ──
  { id: 'exp_sword_stone', name: 'Lame de Granit', type: 'weapon', slot: 'weapon', rarity: 'rare', binding: 'lqe', stats: { atk_flat: 50, def_flat: 15 } },
  { id: 'exp_bow_stone', name: 'Arc Petrifie', type: 'weapon', slot: 'weapon', rarity: 'rare', binding: 'lqe', stats: { atk_flat: 45, crit_rate: 5 } },
  { id: 'exp_spear_crystal', name: 'Lance Cristalline', type: 'weapon', slot: 'weapon', rarity: 'rare', binding: 'lqe', stats: { atk_flat: 48, spd_flat: 6 }, description: 'Perce: ignore 5% DEF',
    effects: [{ type: 'armor_pen', value: 5 }] },
  { id: 'exp_wand_crystal', name: 'Baguette de Cristal', type: 'weapon', slot: 'weapon', rarity: 'rare', binding: 'lqe', stats: { atk_flat: 40, res_flat: 10 }, description: 'Soins +8%',
    effects: [{ type: 'heal_bonus', value: 8 }] },
  { id: 'exp_hammer_stone', name: 'Marteau de Roc', type: 'weapon', slot: 'weapon', rarity: 'rare', binding: 'lqe', stats: { atk_flat: 52, hp_flat: 200 }, description: '8% chance stun 1s. Cible stuned: -10% DEF 3s.',
    effects: [{ type: 'stun', chance: 8, duration: 1, trigger: 'on_hit' }, { type: 'def_shred', value: 10, duration: 3, condition: 'stunned', trigger: 'on_hit' }] },

  // ── Ombre/Abysses (epic) ──
  { id: 'exp_blade_shadow', name: 'Lame du Neant', type: 'weapon', slot: 'weapon', rarity: 'epic', binding: 'lqr', stats: { atk_flat: 80, crit_rate: 10 } },
  { id: 'exp_staff_shadow', name: 'Sceptre des Tenebres', type: 'weapon', slot: 'weapon', rarity: 'epic', binding: 'lqr', stats: { atk_flat: 70, res_flat: 15 } },
  { id: 'exp_axe_abyss', name: 'Hache des Profondeurs', type: 'weapon', slot: 'weapon', rarity: 'epic', binding: 'lqe', stats: { atk_flat: 75, hp_flat: 300 }, description: 'Vol de vie +5%. Kill: +3% ATK (max +12%, reset au boss).',
    effects: [{ type: 'lifesteal', value: 5 }, { type: 'atk_on_kill', value: 3, max: 12, trigger: 'on_kill' }] },
  { id: 'exp_glaive_abyss', name: 'Glaive des Abysses', type: 'weapon', slot: 'weapon', rarity: 'epic', binding: 'lqe', stats: { atk_flat: 68, crit_rate: 8, spd_flat: 5 }, description: 'Anti-heal: cible touchee -20% soins recus 4s. Crit: prolonge a 6s.',
    effects: [{ type: 'anti_heal', value: 20, duration: 4, critDuration: 6, trigger: 'on_hit' }] },
  { id: 'exp_orb_abyss', name: 'Orbe Abyssale', type: 'weapon', slot: 'weapon', rarity: 'epic', binding: 'lqe', stats: { atk_flat: 60, res_flat: 12 }, description: 'Soins +12%. Overheals = bouclier 5% HP.',
    effects: [{ type: 'heal_bonus', value: 12 }, { type: 'overheal_shield', value: 5 }] },
  { id: 'exp_scythe_abyss', name: 'Faux des Damnes', type: 'weapon', slot: 'weapon', rarity: 'epic', binding: 'lqr', stats: { atk_flat: 85, crit_rate: 6 }, description: 'Kill: prochain coup ignore 30% DEF + anti-heal 3s sur cible.',
    effects: [{ type: 'execute_on_kill', armorPen: 30, antiHealDuration: 3, trigger: 'on_kill' }] },
  { id: 'exp_whip_abyss', name: 'Fouet Abyssal', type: 'weapon', slot: 'weapon', rarity: 'epic', binding: 'lqe', stats: { atk_flat: 62, spd_flat: 10 }, description: 'Touche 2 cibles. Bleed: 1.5% HP/s 4s. 2+ bleeds actifs: +15% DMG.',
    effects: [{ type: 'bleed', value: 1.5, duration: 4, trigger: 'on_hit' }, { type: 'bleed_amp', threshold: 2, bonus: 15 }] },

  // ── Neant (legendary) ──
  { id: 'exp_katana_void', name: 'Katana du Neant', type: 'weapon', slot: 'weapon', rarity: 'legendary', binding: 'lqr', stats: { atk_flat: 95, crit_rate: 12, spd_flat: 8 }, description: 'Crit: Saignement (0.8% HP/s, 4s, stack x3). 3 stacks = Hemorragie: +10% DMG recus.',
    effects: [{ type: 'bleed', value: 0.8, duration: 4, maxStacks: 3, trigger: 'on_crit' }, { type: 'hemorrhage', stacks: 3, dmgAmp: 10 }] },
  { id: 'exp_grimoire_void', name: 'Grimoire du Neant', type: 'weapon', slot: 'weapon', rarity: 'legendary', binding: 'lqr', stats: { atk_flat: 80, res_flat: 20 }, description: '15% chance Silence 2s. Cibles en feu: anti-heal -30%. Mana regen +15%.',
    effects: [{ type: 'silence', chance: 15, duration: 2, trigger: 'on_hit' }, { type: 'mana_regen', value: 15 }] },
  { id: 'exp_halberd_void', name: 'Hallebarde du Vide', type: 'weapon', slot: 'weapon', rarity: 'legendary', binding: 'lqr', stats: { atk_flat: 100, def_flat: 20 }, description: 'Chaque 3eme coup: AoE 150% ATK (150px). Touches: -15% ATK 4s + anti-heal 2s.',
    effects: [{ type: 'hit_count_aoe', hitCount: 3, power: 150, radius: 150, trigger: 'on_hit' }, { type: 'atk_debuff', value: 15, duration: 4 }, { type: 'anti_heal', value: 100, duration: 2 }] },
  { id: 'exp_talisman_void', name: 'Talisman Sacre', type: 'weapon', slot: 'weapon', rarity: 'legendary', binding: 'lqr', stats: { atk_flat: 70, hp_flat: 600, res_flat: 15 }, description: 'Bouclier auto: 8% HP max (refresh 15s). Soins +20%. Allies 200px: +5% DEF.',
    effects: [{ type: 'auto_shield', value: 8, interval: 15 }, { type: 'heal_bonus', value: 20 }, { type: 'aura_def', value: 5, radius: 200 }] },
  { id: 'exp_claws_void', name: 'Griffes Spectrales', type: 'weapon', slot: 'weapon', rarity: 'legendary', binding: 'lqr', stats: { atk_flat: 88, spd_flat: 15, crit_rate: 8 }, description: 'Double frappe 20%. Bleed sur crit (3% HP/s, 3s). Kill: reset CD plus long.',
    effects: [{ type: 'double_strike', chance: 20, trigger: 'on_hit' }, { type: 'bleed', value: 3, duration: 3, trigger: 'on_crit' }, { type: 'cd_reset', trigger: 'on_kill' }] },
  { id: 'exp_lance_briseur', name: 'Lance Brise-Tyran', type: 'weapon', slot: 'weapon', rarity: 'legendary', binding: 'lqr', stats: { atk_flat: 75, def_flat: 25, hp_flat: 400 }, description: 'Reduit ATK du boss de 30% pendant 8s (CD 20s). Allies 200px: +10% DEF. Tank ideal.',
    effects: [{ type: 'boss_atk_debuff', value: 30, duration: 8, cooldown: 20, trigger: 'on_hit' }, { type: 'aura_def', value: 10, radius: 200 }] },

  // ══════════════════════════════════════════════════════
  // MATERIALS — Craft & Trade
  // ══════════════════════════════════════════════════════
  { id: 'exp_mat_wood', name: 'Bois Ancien', type: 'material', slot: null, rarity: 'common', binding: 'tradeable', stats: null, description: 'Materiau de craft — Zone Foret' },
  { id: 'exp_mat_stone', name: 'Pierre Enchantee', type: 'material', slot: null, rarity: 'common', binding: 'tradeable', stats: null, description: 'Materiau de craft — Zone Foret' },
  { id: 'exp_mat_crystal_shard', name: 'Eclat de Cristal', type: 'material', slot: null, rarity: 'uncommon', binding: 'tradeable', stats: null, description: 'Fragment cristallin — Boss 4-5' },
  { id: 'exp_mat_shadow_dust', name: 'Poussiere d\'Ombre', type: 'material', slot: null, rarity: 'uncommon', binding: 'tradeable', stats: null, description: 'Materiau rare — Zone Ombre' },
  { id: 'exp_mat_abyss_shard', name: 'Fragment Abyssal', type: 'material', slot: null, rarity: 'uncommon', binding: 'tradeable', stats: null, description: 'Materiau — Zone Abysses' },
  { id: 'exp_mat_magma_core', name: 'Coeur de Magma', type: 'material', slot: null, rarity: 'rare', binding: 'tradeable', stats: null, description: 'Noyau volcanique — Boss 8-10' },
  { id: 'exp_mat_void_crystal', name: 'Cristal du Neant', type: 'material', slot: null, rarity: 'rare', binding: 'tradeable', stats: null, description: 'Materiau endgame — Zone Neant' },
  { id: 'exp_mat_essence', name: 'Essence de Boss', type: 'material', slot: null, rarity: 'rare', binding: 'tradeable', stats: null, description: 'Tombe des boss uniquement' },
  { id: 'exp_mat_void_essence', name: 'Essence du Vide', type: 'material', slot: null, rarity: 'epic', binding: 'tradeable', stats: null, description: 'Essence rare — Boss Neant uniquement' },

  // ══════════════════════════════════════════════════════
  // CURRENCIES
  // ══════════════════════════════════════════════════════
  { id: 'exp_alkahest', name: 'Alkahest', type: 'currency', slot: null, rarity: 'rare', binding: 'tradeable', stats: null, description: 'Permet de reroll les stats d\'artefacts' },
  { id: 'exp_marteau_rouge', name: 'Marteau Rouge', type: 'currency', slot: null, rarity: 'epic', binding: 'tradeable', stats: null, description: 'Monnaie d\'echange pour armes exclusives' },
  { id: 'exp_contribution', name: 'Points de Contribution', type: 'currency', slot: null, rarity: 'uncommon', binding: 'tradeable', stats: null, description: 'Points de contribution d\'expedition' },

  // ══════════════════════════════════════════════════════
  // CONSUMABLES
  // ══════════════════════════════════════════════════════
  { id: 'exp_ultimate_scroll', name: 'Parchemin Ultimate', type: 'consumable', slot: null, rarity: 'epic', binding: 'lqr', stats: null, description: 'Debloque le skill Ultimate d\'un hunter au choix' },
];

export function getItemById(id) {
  return EXPEDITION_ITEMS.find(i => i.id === id) || null;
}

export function getItemsByRarity(rarity) {
  return EXPEDITION_ITEMS.filter(i => i.rarity === rarity);
}

export function getSRableItems() {
  return EXPEDITION_ITEMS.filter(i =>
    i.type !== 'consumable' && i.type !== 'material' && i.type !== 'currency'
  );
}
