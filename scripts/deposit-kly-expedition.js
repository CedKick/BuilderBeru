// Script one-shot: envoyer par mail les items d'expédition manquants pour Kly
// Usage: node scripts/deposit-kly-expedition.js
// Requires: Kly's auth token (copy from browser: localStorage.getItem('builderberu_auth_token'))

const MAIL_API = 'https://builderberu.com/api/mail?action=send';

// ══ PASTE YOUR AUTH TOKEN HERE ══
const AUTH_TOKEN = 'PASTE_TOKEN_HERE';

// ═══ EXPEDITION ITEMS ═══
const expeditionItems = [
  // ── Weapons ──
  { itemId: 'exp_mace_forest', itemName: 'Masse Noueuse', type: 'weapon', slot: 'weapon', rarity: 'uncommon', binding: 'lqe', stats: { atk_flat: 28, def_flat: 8 } },
  { itemId: 'exp_sword_forest', itemName: 'Epee de Mousse', type: 'weapon', slot: 'weapon', rarity: 'uncommon', binding: 'lqe', stats: { atk_flat: 30 } },
  { itemId: 'exp_sword_forest', itemName: 'Epee de Mousse', type: 'weapon', slot: 'weapon', rarity: 'uncommon', binding: 'lqe', stats: { atk_flat: 30 } },
  { itemId: 'exp_sword_stone', itemName: 'Lame de Granit', type: 'weapon', slot: 'weapon', rarity: 'rare', binding: 'lqe', stats: { atk_flat: 50, def_flat: 15 } },
  { itemId: 'exp_sword_stone', itemName: 'Lame de Granit', type: 'weapon', slot: 'weapon', rarity: 'rare', binding: 'lqe', stats: { atk_flat: 50, def_flat: 15 } },
  { itemId: 'exp_staff_shadow', itemName: 'Sceptre des Tenebres', type: 'weapon', slot: 'weapon', rarity: 'epic', binding: 'lqr', stats: { atk_flat: 70, res_flat: 15 } },
  { itemId: 'exp_axe_abyss', itemName: 'Hache des Profondeurs', type: 'weapon', slot: 'weapon', rarity: 'epic', binding: 'lqe', stats: { atk_flat: 75, hp_flat: 300 } },
  { itemId: 'exp_glaive_abyss', itemName: 'Glaive des Abysses', type: 'weapon', slot: 'weapon', rarity: 'epic', binding: 'lqe', stats: { atk_flat: 68, crit_rate: 8, spd_flat: 5 } },
  { itemId: 'exp_orb_abyss', itemName: 'Orbe Abyssale', type: 'weapon', slot: 'weapon', rarity: 'epic', binding: 'lqe', stats: { atk_flat: 60, res_flat: 12 } },
  { itemId: 'weapon_thyrsus', itemName: 'Thyrsus', type: 'weapon', slot: 'weapon', rarity: 'mythique', binding: 'lqr', stats: { atk_flat: 240 }, weaponId: 'thyrsus' },
  { itemId: 'weapon_mjolnir', itemName: 'Mjolnir', type: 'weapon', slot: 'weapon', rarity: 'mythique', binding: 'lqr', stats: { atk_flat: 270, def_pct: 15 }, weaponId: 'mjolnir' },

  // ── Armor ──
  { itemId: 'exp_stone_gloves', itemName: 'Gantelets de Pierre', type: 'armor', slot: 'gloves', rarity: 'rare', binding: 'lqe', stats: { def_flat: 20, res_flat: 5 }, setId: 'set_stone' },
  { itemId: 'exp_shadow_gloves', itemName: "Griffes d'Ombre", type: 'armor', slot: 'gloves', rarity: 'epic', binding: 'lqe', stats: { atk_flat: 30, crit_rate: 8 }, setId: 'set_shadow' },
  { itemId: 'exp_crystal_helm', itemName: 'Tiare Cristalline', type: 'armor', slot: 'helm', rarity: 'rare', binding: 'lqe', stats: { hp_flat: 650, atk_flat: 15, res_flat: 5 } },
  { itemId: 'exp_crystal_boots', itemName: 'Bottes Cristallines', type: 'armor', slot: 'boots', rarity: 'rare', binding: 'lqe', stats: { spd_flat: 10, def_flat: 12 } },
  { itemId: 'exp_shadow_boots', itemName: "Sandales d'Ombre", type: 'armor', slot: 'boots', rarity: 'epic', binding: 'lqe', stats: { spd_flat: 15, atk_flat: 20 }, setId: 'set_shadow' },
  { itemId: 'exp_abyss_gloves', itemName: 'Gantelets des Abysses', type: 'armor', slot: 'gloves', rarity: 'epic', binding: 'lqe', stats: { atk_flat: 40, crit_rate: 8 }, setId: 'set_abyss' },
  { itemId: 'exp_abyss_helm', itemName: 'Couronne des Abysses', type: 'armor', slot: 'helm', rarity: 'epic', binding: 'lqe', stats: { hp_flat: 1000, def_flat: 28 }, setId: 'set_abyss' },
  { itemId: 'exp_shadow_chest', itemName: "Tunique d'Ombre", type: 'armor', slot: 'chest', rarity: 'epic', binding: 'lqe', stats: { atk_flat: 35, hp_flat: 500 }, setId: 'set_shadow' },
  { itemId: 'exp_abyss_helm', itemName: 'Couronne des Abysses', type: 'armor', slot: 'helm', rarity: 'epic', binding: 'lqe', stats: { hp_flat: 1000, def_flat: 28 }, setId: 'set_abyss' },
  { itemId: 'exp_magma_helm', itemName: 'Casque de Magma', type: 'armor', slot: 'helm', rarity: 'epic', binding: 'lqe', stats: { hp_flat: 1100, atk_flat: 20 } },
  { itemId: 'exp_abyss_helm', itemName: 'Couronne des Abysses', type: 'armor', slot: 'helm', rarity: 'epic', binding: 'lqe', stats: { hp_flat: 1000, def_flat: 28 }, setId: 'set_abyss' },
  { itemId: 'exp_void_helm', itemName: 'Diademe du Neant', type: 'armor', slot: 'helm', rarity: 'legendary', binding: 'lqr', stats: { atk_flat: 45, crit_rate: 10, hp_flat: 500 }, setId: 'set_void' },
  { itemId: 'exp_void_chest', itemName: 'Plastron du Neant', type: 'armor', slot: 'chest', rarity: 'legendary', binding: 'lqr', stats: { hp_flat: 2000, def_flat: 50, atk_flat: 20 }, setId: 'set_void' },
  { itemId: 'exp_void_helm', itemName: 'Diademe du Neant', type: 'armor', slot: 'helm', rarity: 'legendary', binding: 'lqr', stats: { atk_flat: 45, crit_rate: 10, hp_flat: 500 }, setId: 'set_void' },
  { itemId: 'exp_void_gloves', itemName: 'Griffes du Neant', type: 'armor', slot: 'gloves', rarity: 'legendary', binding: 'lqr', stats: { atk_flat: 55, crit_rate: 12 }, setId: 'set_void' },
  { itemId: 'exp_void_helm', itemName: 'Diademe du Neant', type: 'armor', slot: 'helm', rarity: 'legendary', binding: 'lqr', stats: { atk_flat: 45, crit_rate: 10, hp_flat: 500 }, setId: 'set_void' },
  { itemId: 'exp_eclipse_helm', itemName: 'Couronne Eclipse', type: 'armor', slot: 'helm', rarity: 'legendary', binding: 'lqr', stats: { atk_flat: 50, hp_flat: 800, crit_rate: 8 } },

  // ── Set Pieces ──
  { itemId: 'set_plumes_phenix_piece', itemName: 'Piece: Plumes de Phenix', type: 'set_piece', slot: null, rarity: 'rare', binding: 'lqe', stats: { heal_received_pct: 15 }, setId: 'plumes_phenix' },
  { itemId: 'set_crocs_loup_piece', itemName: 'Piece: Crocs du Loup', type: 'set_piece', slot: null, rarity: 'rare', binding: 'lqe', stats: { atk_pct: 10 }, setId: 'crocs_loup' },
  { itemId: 'set_ecailles_drake_piece', itemName: 'Piece: Ecailles de Drake', type: 'set_piece', slot: null, rarity: 'rare', binding: 'lqe', stats: { def_pct: 12 }, setId: 'ecailles_drake' },
  { itemId: 'set_ecailles_drake_piece', itemName: 'Piece: Ecailles de Drake', type: 'set_piece', slot: null, rarity: 'rare', binding: 'lqe', stats: { def_pct: 12 }, setId: 'ecailles_drake' },
  { itemId: 'set_ecailles_drake_piece', itemName: 'Piece: Ecailles de Drake', type: 'set_piece', slot: null, rarity: 'rare', binding: 'lqe', stats: { def_pct: 12 }, setId: 'ecailles_drake' },
  { itemId: 'set_crocs_loup_piece', itemName: 'Piece: Crocs du Loup', type: 'set_piece', slot: null, rarity: 'rare', binding: 'lqe', stats: { atk_pct: 10 }, setId: 'crocs_loup' },
  { itemId: 'set_griffes_wyverne_piece', itemName: 'Piece: Griffes de Wyverne', type: 'set_piece', slot: null, rarity: 'rare', binding: 'lqe', stats: { atk_pct: 8 }, setId: 'griffes_wyverne' },
  { itemId: 'set_nova_arcanique_piece', itemName: 'Piece: Nova Arcanique', type: 'set_piece', slot: null, rarity: 'epic', binding: 'lqe', stats: { mana_max_pct: 30 }, setId: 'nova_arcanique' },
  { itemId: 'set_lumiere_sacree_piece', itemName: 'Piece: Lumiere Sacree', type: 'set_piece', slot: null, rarity: 'epic', binding: 'lqe', stats: { heal_pct: 15 }, setId: 'lumiere_sacree' },
  { itemId: 'set_cuirasse_fer_piece', itemName: 'Piece: Cuirasse de Fer', type: 'set_piece', slot: null, rarity: 'epic', binding: 'lqe', stats: { def_pct: 15 }, setId: 'cuirasse_fer' },
  { itemId: 'set_sang_guerrier_piece', itemName: 'Piece: Sang du Guerrier', type: 'set_piece', slot: null, rarity: 'epic', binding: 'lqe', stats: { atk_pct: 12 }, setId: 'sang_guerrier' },
  { itemId: 'set_sang_guerrier_piece', itemName: 'Piece: Sang du Guerrier', type: 'set_piece', slot: null, rarity: 'epic', binding: 'lqe', stats: { atk_pct: 12 }, setId: 'sang_guerrier' },
  { itemId: 'set_fureur_titan_piece', itemName: 'Piece: Fureur du Titan', type: 'set_piece', slot: null, rarity: 'epic', binding: 'lqr', stats: { atk_pct: 15 }, setId: 'fureur_titan' },
  { itemId: 'set_sagesse_ancienne_piece', itemName: 'Piece: Sagesse Ancienne', type: 'set_piece', slot: null, rarity: 'epic', binding: 'lqe', stats: { int_pct: 20, mana_regen_pct: 25 }, setId: 'sagesse_ancienne' },
  { itemId: 'set_aegis_gardien_piece', itemName: 'Piece: Aegis du Gardien', type: 'set_piece', slot: null, rarity: 'epic', binding: 'lqr', stats: { def_pct: 20, aggro_pct: 25 }, setId: 'aegis_gardien' },
  { itemId: 'set_souffle_glacial_piece', itemName: 'Piece: Souffle Glacial', type: 'set_piece', slot: null, rarity: 'epic', binding: 'lqe', stats: { water_dmg_pct: 12 }, setId: 'souffle_glacial' },
  { itemId: 'set_cendres_ardentes_piece', itemName: 'Piece: Cendres Ardentes', type: 'set_piece', slot: null, rarity: 'epic', binding: 'lqe', stats: { fire_dmg_pct: 12 }, setId: 'cendres_ardentes' },
  { itemId: 'set_cendres_ardentes_piece', itemName: 'Piece: Cendres Ardentes', type: 'set_piece', slot: null, rarity: 'epic', binding: 'lqe', stats: { fire_dmg_pct: 12 }, setId: 'cendres_ardentes' },
  { itemId: 'set_pacte_sang_piece', itemName: 'Piece: Pacte de Sang', type: 'set_piece', slot: null, rarity: 'legendary', binding: 'lqr', stats: { lifesteal_pct: 10 }, setId: 'pacte_sang' },
  { itemId: 'set_lien_meute_piece', itemName: 'Piece: Lien de Meute', type: 'set_piece', slot: null, rarity: 'epic', binding: 'lqe', stats: { atk_pct: 5, def_pct: 5 }, setId: 'lien_meute' },
  { itemId: 'set_lien_meute_piece', itemName: 'Piece: Lien de Meute', type: 'set_piece', slot: null, rarity: 'epic', binding: 'lqe', stats: { atk_pct: 5, def_pct: 5 }, setId: 'lien_meute' },
  { itemId: 'set_bastion_eternel_piece', itemName: 'Piece: Bastion Eternel', type: 'set_piece', slot: null, rarity: 'legendary', binding: 'lqr', stats: { hp_pct: 25 }, setId: 'bastion_eternel' },
  { itemId: 'set_fureur_titan_piece', itemName: 'Piece: Fureur du Titan', type: 'set_piece', slot: null, rarity: 'epic', binding: 'lqr', stats: { atk_pct: 15 }, setId: 'fureur_titan' },
  { itemId: 'set_brume_mystique_piece', itemName: 'Piece: Brume Mystique', type: 'set_piece', slot: null, rarity: 'epic', binding: 'lqe', stats: { mana_max_pct: 20 }, setId: 'brume_mystique' },
  { itemId: 'set_brume_mystique_piece', itemName: 'Piece: Brume Mystique', type: 'set_piece', slot: null, rarity: 'epic', binding: 'lqe', stats: { mana_max_pct: 20 }, setId: 'brume_mystique' },
  { itemId: 'set_lame_fantome_piece', itemName: 'Piece: Lame Fantome', type: 'set_piece', slot: null, rarity: 'epic', binding: 'lqr', stats: { crit_rate: 12 }, setId: 'lame_fantome' },
  { itemId: 'set_souffle_celeste_piece', itemName: 'Piece: Souffle Celeste', type: 'set_piece', slot: null, rarity: 'epic', binding: 'lqe', stats: { spd_pct: 15 }, setId: 'souffle_celeste' },
  { itemId: 'set_ailes_vent_piece', itemName: 'Piece: Ailes du Vent', type: 'set_piece', slot: null, rarity: 'epic', binding: 'lqe', stats: { spd_pct: 12 }, setId: 'ailes_vent' },

  // ── Unique Artifact ──
  { itemId: 'unique_croc_warg', itemName: 'Croc du Warg', type: 'unique', slot: 'gants', rarity: 'legendary', binding: 'lqr', stats: { crit_rate: 8 }, uniqueId: 'croc_warg' },

  // ── Consumables (Parchemin Ultimate x18) ──
  { itemId: 'exp_ultimate_scroll', itemName: 'Parchemin Ultimate', type: 'consumable', slot: null, rarity: 'epic', binding: 'lqr', stats: null },
  { itemId: 'exp_ultimate_scroll', itemName: 'Parchemin Ultimate', type: 'consumable', slot: null, rarity: 'epic', binding: 'lqr', stats: null },
  { itemId: 'exp_ultimate_scroll', itemName: 'Parchemin Ultimate', type: 'consumable', slot: null, rarity: 'epic', binding: 'lqr', stats: null },
  { itemId: 'exp_ultimate_scroll', itemName: 'Parchemin Ultimate', type: 'consumable', slot: null, rarity: 'epic', binding: 'lqr', stats: null },
  { itemId: 'exp_ultimate_scroll', itemName: 'Parchemin Ultimate', type: 'consumable', slot: null, rarity: 'epic', binding: 'lqr', stats: null },
  { itemId: 'exp_ultimate_scroll', itemName: 'Parchemin Ultimate', type: 'consumable', slot: null, rarity: 'epic', binding: 'lqr', stats: null },
  { itemId: 'exp_ultimate_scroll', itemName: 'Parchemin Ultimate', type: 'consumable', slot: null, rarity: 'epic', binding: 'lqr', stats: null },
  { itemId: 'exp_ultimate_scroll', itemName: 'Parchemin Ultimate', type: 'consumable', slot: null, rarity: 'epic', binding: 'lqr', stats: null },
  { itemId: 'exp_ultimate_scroll', itemName: 'Parchemin Ultimate', type: 'consumable', slot: null, rarity: 'epic', binding: 'lqr', stats: null },
  { itemId: 'exp_ultimate_scroll', itemName: 'Parchemin Ultimate', type: 'consumable', slot: null, rarity: 'epic', binding: 'lqr', stats: null },
  { itemId: 'exp_ultimate_scroll', itemName: 'Parchemin Ultimate', type: 'consumable', slot: null, rarity: 'epic', binding: 'lqr', stats: null },
  { itemId: 'exp_ultimate_scroll', itemName: 'Parchemin Ultimate', type: 'consumable', slot: null, rarity: 'epic', binding: 'lqr', stats: null },
  { itemId: 'exp_ultimate_scroll', itemName: 'Parchemin Ultimate', type: 'consumable', slot: null, rarity: 'epic', binding: 'lqr', stats: null },
  { itemId: 'exp_ultimate_scroll', itemName: 'Parchemin Ultimate', type: 'consumable', slot: null, rarity: 'epic', binding: 'lqr', stats: null },
  { itemId: 'exp_ultimate_scroll', itemName: 'Parchemin Ultimate', type: 'consumable', slot: null, rarity: 'epic', binding: 'lqr', stats: null },
  { itemId: 'exp_ultimate_scroll', itemName: 'Parchemin Ultimate', type: 'consumable', slot: null, rarity: 'epic', binding: 'lqr', stats: null },
  { itemId: 'exp_ultimate_scroll', itemName: 'Parchemin Ultimate', type: 'consumable', slot: null, rarity: 'epic', binding: 'lqr', stats: null },
  { itemId: 'exp_ultimate_scroll', itemName: 'Parchemin Ultimate', type: 'consumable', slot: null, rarity: 'epic', binding: 'lqr', stats: null },
];

// ═══ SEND MAIL ═══
async function main() {
  console.log(`Sending expedition mail to Kly with ${expeditionItems.length} items + currencies + essences...\n`);

  const res = await fetch(MAIL_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`,
    },
    body: JSON.stringify({
      recipientUsername: 'Kly',
      subject: 'Expedition #1 — Butin Retrouve',
      message: 'Chasseur, le butin de ta premiere expedition a ete retrouve ! 75 items dont Thyrsus, Mjolnir, Croc du Warg, et 18 Parchemins Ultimate. Bonne chasse !',
      mailType: 'reward',
      rewards: {
        expeditionItems,
        expeditionCurrencies: {
          alkahest: 755,
          marteau_rouge: 420,
          contribution: 13110,
        },
        expeditionEssences: {
          guerre: 1685,
          arcanique: 975,
          gardienne: 1840,
        },
      },
    }),
  });

  const data = await res.json();
  console.log('Result:', JSON.stringify(data, null, 2));

  if (data.success) {
    console.log('\nMail envoye ! Va dans ta boite mail in-game pour claim les rewards.');
  } else {
    console.error('\nErreur:', data.error);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
