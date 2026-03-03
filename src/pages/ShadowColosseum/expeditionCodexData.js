// ── Expedition Codex Data ──
// Data for the Codex "Expedition" tab: sets, weapons, unique artifacts, essences
// This is display-only data for the client codex encyclopedia.

// ═══════════════════════════════════════════════════════════
// EXPEDITION SETS (10 Big + 15 Medium)
// ═══════════════════════════════════════════════════════════

export const EXPEDITION_SETS = {
  // ── BIG SETS (10) — Powerful class-specific passives ──

  fureur_titan: {
    id: 'fureur_titan', name: 'Fureur du Titan', icon: '⚔️', big: true,
    color: 'text-red-500', bg: 'bg-red-600/15', border: 'border-red-600/30',
    zone: 'abysses', rarity: 'epique', binding: 'LqR', targetClass: ['fighter'],
    desc: 'Monte en puissance au fil du combat',
    bonus2Desc: 'ATK +15%',
    bonus4Desc: 'Chaque attaque: ATK +2% (max 20 stacks). A 20 stacks: crits garantis 5s puis reset. Kill = +3 stacks.',
  },
  lame_fantome: {
    id: 'lame_fantome', name: 'Lame Fantome', icon: '👻', big: true,
    color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30',
    zone: 'abysses', rarity: 'epique', binding: 'LqR', targetClass: ['assassin'],
    desc: 'Burst DPS en chain-crit',
    bonus2Desc: 'CRIT +12%',
    bonus4Desc: 'Apres crit: prochain coup ignore 40% DEF. 15% chance double frappe. Kill = reset CD skill le plus long.',
  },
  aegis_gardien: {
    id: 'aegis_gardien', name: 'Aegis du Gardien', icon: '🏛️', big: true,
    color: 'text-cyan-400', bg: 'bg-cyan-500/15', border: 'border-cyan-500/30',
    zone: 'abysses', rarity: 'epique', binding: 'LqR', targetClass: ['tank'],
    desc: 'Tank protecteur qui contribue aux degats',
    bonus2Desc: 'DEF +20%, Aggro +25%',
    bonus4Desc: 'Absorbe 15% degats allies (200px). Bouclier a 50% max HP: explose AoE 300% ATK (150px), -20% ATK ennemis 8s.',
  },
  souffle_vital: {
    id: 'souffle_vital', name: 'Souffle Vital', icon: '💚', big: true,
    color: 'text-green-400', bg: 'bg-green-500/15', border: 'border-green-500/30',
    zone: 'abysses', rarity: 'epique', binding: 'LqR', targetClass: ['support'],
    desc: 'Survie massive, soins jamais gaspilles',
    bonus2Desc: 'Soins +25%',
    bonus4Desc: 'Overheals = bouclier (max 20% HP, 10s). Allie < 25% HP: heal auto 15% (CD 12s/allie). 15% chance soin crit x2.',
  },
  tempete_acier: {
    id: 'tempete_acier', name: "Tempete d'Acier", icon: '⚡', big: true,
    color: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30',
    zone: 'neant', rarity: 'legendaire', binding: 'LqR', targetClass: ['fighter'],
    desc: 'Snowball en vitesse sur les vagues',
    bonus2Desc: 'SPD +15%',
    bonus4Desc: 'Chaque 5eme attaque: 200% degats, ignore 20% DEF. SPD +5%/kill (max +25%). A +25%: doubles frappes.',
  },
  voix_neant: {
    id: 'voix_neant', name: 'Voix du Neant', icon: '🌑', big: true,
    color: 'text-gray-300', bg: 'bg-gray-500/15', border: 'border-gray-500/30',
    zone: 'neant', rarity: 'legendaire', binding: 'LqR', targetClass: ['mage'],
    desc: 'Amplifie les degats de toute l\'equipe',
    bonus2Desc: 'Degats magiques +15%',
    bonus4Desc: 'Attaques: DoT 3% ATK/s 8s (stack x3). 3 stacks: ennemi +25% degats TOUTES sources. DoT kill: AoE 200% ATK.',
  },
  pacte_sang: {
    id: 'pacte_sang', name: 'Pacte de Sang', icon: '🩸', big: true,
    color: 'text-rose-500', bg: 'bg-rose-500/15', border: 'border-rose-500/30',
    zone: 'neant', rarity: 'legendaire', binding: 'LqR', targetClass: ['assassin', 'fighter'],
    desc: 'High risk/high reward, HP bas = puissance',
    bonus2Desc: 'Vol de vie +10%',
    bonus4Desc: 'HP < 50%: ATK +30%, vol vie +20%. Kill: restore 10% HP. HP < 15%: annule coup mortel (CD 45s) + Frenzy ATK+50% SPD+30% 8s.',
  },
  bastion_eternel: {
    id: 'bastion_eternel', name: 'Bastion Eternel', icon: '🏰', big: true,
    color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30',
    zone: 'neant', rarity: 'legendaire', binding: 'LqR', targetClass: ['tank'],
    desc: 'Tank immortel qui scale en defense',
    bonus2Desc: 'HP +25%',
    bonus4Desc: 'Resurrection passive: 30% HP +50% DEF 10s (1x/combat). Allies 250px: bouclier 10% HP tank. DEF +1%/coup subi (max +20%).',
  },
  harmonie_celeste: {
    id: 'harmonie_celeste', name: 'Harmonie Celeste', icon: '✨', big: true,
    color: 'text-indigo-400', bg: 'bg-indigo-500/15', border: 'border-indigo-500/30',
    zone: 'neant', rarity: 'legendaire', binding: 'LqR', targetClass: ['support'],
    desc: 'Support permanent, pas juste du heal reactif',
    bonus2Desc: 'Mana regen +50%',
    bonus4Desc: 'Buffs +50% duree. Sort: allies 300px +5% ATK (stack x3=+15%, 8s). Tous les 30s: mega-heal 10% HP + cleanse.',
  },
  nova_arcanique: {
    id: 'nova_arcanique', name: 'Nova Arcanique', icon: '💫', big: true,
    color: 'text-violet-400', bg: 'bg-violet-500/15', border: 'border-violet-500/30',
    zone: 'foret', rarity: 'epique', binding: 'LqE', targetClass: ['mage'],
    desc: 'Combo burst pour mages, timing de sorts',
    bonus2Desc: 'Mana max +30%',
    bonus4Desc: 'Apres 3 sorts: 4eme fait x2 degats et 0 mana. Kill par sort: tous CD -2s. Mana > 80%: degats +15%.',
  },

  // ── MEDIUM SETS (15) — Stats solides, mecaniques simples ──

  // Zone Foret (Boss 1-5)
  ecailles_drake: {
    id: 'ecailles_drake', name: 'Ecailles de Drake', icon: '🐉',
    color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30',
    zone: 'foret', rarity: 'rare', binding: 'LqE', targetClass: ['tank'],
    desc: 'Defense et resistance aux AoE',
    bonus2Desc: 'DEF +12%',
    bonus4Desc: 'HP +15%, reduit degats AoE -15%',
  },
  crocs_loup: {
    id: 'crocs_loup', name: 'Crocs du Loup', icon: '🐺',
    color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30',
    zone: 'foret', rarity: 'rare', binding: 'LqE', targetClass: ['fighter'],
    desc: 'ATK et degats critiques',
    bonus2Desc: 'ATK +10%',
    bonus4Desc: 'CRIT +6%, CRIT DMG +12%',
  },
  plumes_phenix: {
    id: 'plumes_phenix', name: 'Plumes de Phenix', icon: '🔥',
    color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30',
    zone: 'foret', rarity: 'rare', binding: 'LqE', targetClass: ['all'],
    desc: 'Regeneration quand HP bas',
    bonus2Desc: 'Soins recus +15%',
    bonus4Desc: 'HP < 40%: regen 2% HP/5s',
  },
  griffes_wyverne: {
    id: 'griffes_wyverne', name: 'Griffes de Wyverne', icon: '🦅',
    color: 'text-purple-300', bg: 'bg-purple-400/15', border: 'border-purple-400/30',
    zone: 'foret', rarity: 'rare', binding: 'LqE', targetClass: ['assassin'],
    desc: 'Vitesse et double attaque',
    bonus2Desc: 'ATK +8%',
    bonus4Desc: 'SPD +8%, chance double attaque +5%',
  },
  ronce_vivante: {
    id: 'ronce_vivante', name: 'Ronce Vivante', icon: '🌿',
    color: 'text-green-400', bg: 'bg-green-500/15', border: 'border-green-500/30',
    zone: 'foret', rarity: 'rare', binding: 'LqE', targetClass: ['tank', 'fighter'],
    desc: 'Reflete les degats subis',
    bonus2Desc: 'DEF +10%',
    bonus4Desc: 'Reflete 8% des degats subis',
  },

  // Zone Abysses (Boss 6-10)
  souffle_glacial: {
    id: 'souffle_glacial', name: 'Souffle Glacial', icon: '❄️',
    color: 'text-cyan-300', bg: 'bg-cyan-400/15', border: 'border-cyan-400/30',
    zone: 'abysses', rarity: 'epique', binding: 'LqE', targetClass: ['mage'],
    desc: 'Degats Eau et ralentissement',
    bonus2Desc: 'Degats Eau +12%',
    bonus4Desc: 'Attaques: -10% SPD ennemis 3s',
  },
  cendres_ardentes: {
    id: 'cendres_ardentes', name: 'Cendres Ardentes', icon: '🌋',
    color: 'text-orange-500', bg: 'bg-orange-600/15', border: 'border-orange-600/30',
    zone: 'abysses', rarity: 'epique', binding: 'LqE', targetClass: ['mage', 'fighter'],
    desc: 'Degats Feu et brulure',
    bonus2Desc: 'Degats Feu +12%',
    bonus4Desc: '10% chance brulure (3% HP/s, 4s)',
  },
  murmure_ombre: {
    id: 'murmure_ombre', name: "Murmure d'Ombre", icon: '🌫️',
    color: 'text-gray-400', bg: 'bg-gray-500/15', border: 'border-gray-500/30',
    zone: 'abysses', rarity: 'epique', binding: 'LqE', targetClass: ['assassin'],
    desc: 'Esquive et contre-attaque',
    bonus2Desc: 'Degats Ombre +12%',
    bonus4Desc: '8% esquive, si esquive: +30% prochain coup',
  },
  lumiere_sacree: {
    id: 'lumiere_sacree', name: 'Lumiere Sacree', icon: '☀️',
    color: 'text-yellow-300', bg: 'bg-yellow-400/15', border: 'border-yellow-400/30',
    zone: 'abysses', rarity: 'epique', binding: 'LqE', targetClass: ['support'],
    desc: 'Soins et resistance',
    bonus2Desc: 'Soins +15%',
    bonus4Desc: 'RES +8%, soins touchent aussi 2eme allie le plus blesse pour 30%',
  },
  cuirasse_fer: {
    id: 'cuirasse_fer', name: 'Cuirasse de Fer', icon: '⚙️',
    color: 'text-blue-300', bg: 'bg-blue-400/15', border: 'border-blue-400/30',
    zone: 'abysses', rarity: 'epique', binding: 'LqE', targetClass: ['tank'],
    desc: 'Anti-crit et debuff attaquant',
    bonus2Desc: 'DEF +15%',
    bonus4Desc: 'Reduit degats crits subis -25%, -5% ATK attaquant 3s',
  },

  // Zone Neant (Boss 11-15)
  ailes_vent: {
    id: 'ailes_vent', name: 'Ailes du Vent', icon: '💨',
    color: 'text-teal-400', bg: 'bg-teal-500/15', border: 'border-teal-500/30',
    zone: 'neant', rarity: 'epique', binding: 'LqE', targetClass: ['assassin'],
    desc: 'Vitesse et premier coup critique',
    bonus2Desc: 'SPD +12%',
    bonus4Desc: 'Esquive +5%, 1ere attaque combat = crit garanti',
  },
  sang_guerrier: {
    id: 'sang_guerrier', name: 'Sang du Guerrier', icon: '🗡️',
    color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30',
    zone: 'neant', rarity: 'epique', binding: 'LqE', targetClass: ['fighter'],
    desc: 'Vol de vie et scaling sur les kills',
    bonus2Desc: 'ATK +12%',
    bonus4Desc: 'Vol vie +8%, kill: +3% ATK (max +15%, reset au boss)',
  },
  totem_ancestral: {
    id: 'totem_ancestral', name: 'Totem Ancestral', icon: '🗿',
    color: 'text-amber-300', bg: 'bg-amber-400/15', border: 'border-amber-400/30',
    zone: 'neant', rarity: 'epique', binding: 'LqE', targetClass: ['tank', 'support'],
    desc: 'Aura defense et regen pour les allies',
    bonus2Desc: 'HP +15%',
    bonus4Desc: 'Allies 200px: +5% DEF, +3% HP regen',
  },
  brume_mystique: {
    id: 'brume_mystique', name: 'Brume Mystique', icon: '🌀',
    color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/15', border: 'border-fuchsia-500/30',
    zone: 'neant', rarity: 'epique', binding: 'LqE', targetClass: ['mage', 'support'],
    desc: 'Economie de mana et sorts gratuits',
    bonus2Desc: 'Mana max +20%',
    bonus4Desc: 'Cout mana -10%, 10% chance sort gratuit',
  },
  lien_meute: {
    id: 'lien_meute', name: 'Lien de Meute', icon: '🐾',
    color: 'text-emerald-300', bg: 'bg-emerald-400/15', border: 'border-emerald-400/30',
    zone: 'neant', rarity: 'epique', binding: 'LqE', targetClass: ['all'],
    desc: 'Synergie entre hunters du meme joueur',
    bonus2Desc: 'ATK +5%, DEF +5%',
    bonus4Desc: 'Si 3 hunters du meme joueur en vie: ATK +10%, DEF +10%',
  },
};

// ═══════════════════════════════════════════════════════════
// EXPEDITION WEAPONS (10)
// ═══════════════════════════════════════════════════════════

const BOSS_NAMES = [
  'Gardien Foret', 'Sentinelle Pierre', 'Seigneur Ombre', 'Ancien des Racines', 'Reine Sylvestre',
  'Leviathan', 'Sorcier Abyssal', 'Titan de Fer', 'Hydre Venimeuse', 'Roi des Profondeurs',
  'Spectre Originel', 'Archonte du Vide', 'Dragon du Chaos', 'Monarque Eternel', 'Sung Il-Hwan',
];

export const EXPEDITION_WEAPONS = {
  excalibur: {
    id: 'excalibur', name: 'Excalibur', atk: 280,
    element: 'light', weaponType: 'blade', rarity: 'mythique', binding: 'LqR',
    icon: '⚔️', bonusDesc: 'ATK +20%',
    passiveDesc: 'HP > 80%: degats +25%. Kill: auto-heal 3% max HP. Absorbe 1 coup mortel (CD 60s).',
    dropBoss: 14, dropChance: 0.5,
    get dropBossName() { return BOSS_NAMES[this.dropBoss]; },
  },
  mjolnir: {
    id: 'mjolnir', name: 'Mjolnir', atk: 270,
    element: 'water', weaponType: 'heavy', rarity: 'mythique', binding: 'LqR',
    icon: '🔨', bonusDesc: 'DEF +15%',
    passiveDesc: '30% chance frappe en chaine sur 2 ennemis (50% degats). Stun 1s tous les 10 coups.',
    dropBoss: 11, dropChance: 1,
    get dropBossName() { return BOSS_NAMES[this.dropBoss]; },
  },
  muramasa: {
    id: 'muramasa', name: 'Muramasa', atk: 300,
    element: 'shadow', weaponType: 'blade', rarity: 'mythique', binding: 'LqR',
    icon: '🗡️', bonusDesc: 'CRIT DMG +30%',
    passiveDesc: 'Chaque crit: +3% ATK (max 30%). Perd 1% HP max/stack. A 10 stacks: prochain coup x3.',
    dropBoss: 13, dropChance: 0.3,
    get dropBossName() { return BOSS_NAMES[this.dropBoss]; },
  },
  yggdrasil: {
    id: 'yggdrasil', name: 'Yggdrasil', atk: 220,
    element: 'light', weaponType: 'staff', rarity: 'mythique', binding: 'LqR',
    icon: '🪄', bonusDesc: 'Soins +30%',
    passiveDesc: 'Soins +35%. Overheals = bouclier. Sorts soignent aussi 2 allies proches (30%).',
    dropBoss: 10, dropChance: 2,
    get dropBossName() { return BOSS_NAMES[this.dropBoss]; },
  },
  gungnir: {
    id: 'gungnir', name: 'Gungnir', atk: 265,
    element: 'fire', weaponType: 'polearm', rarity: 'mythique', binding: 'LqR',
    icon: '🗡️', bonusDesc: 'SPD +18',
    passiveDesc: '1ere attaque combat: x2 degats. Tous les 15s: prochain coup = crit garanti. Perce backline.',
    dropBoss: 12, dropChance: 0.8,
    get dropBossName() { return BOSS_NAMES[this.dropBoss]; },
  },
  nidhogg: {
    id: 'nidhogg', name: 'Nidhogg', atk: 255,
    element: 'shadow', weaponType: 'scythe', rarity: 'mythique', binding: 'LqR',
    icon: '⚔️', bonusDesc: 'Vol de vie +15%',
    passiveDesc: 'Kill = stack Devoration (+5% ATK, +3% vol vie, max 5 stacks). Reset au boss suivant.',
    dropBoss: 9, dropChance: 1.5,
    get dropBossName() { return BOSS_NAMES[this.dropBoss]; },
  },
  aegis_weapon: {
    id: 'aegis_weapon', name: 'Aegis', atk: 150,
    element: 'light', weaponType: 'shield', rarity: 'mythique', binding: 'LqR',
    icon: '🛡️', bonusDesc: 'DEF +35%',
    passiveDesc: 'Reduit degats subis -25%. Si allie meurt: +30% ATK, +20% DEF (15s). Aggro +50%.',
    dropBoss: 7, dropChance: 3,
    get dropBossName() { return BOSS_NAMES[this.dropBoss]; },
  },
  caladbolg: {
    id: 'caladbolg', name: 'Caladbolg', atk: 275,
    element: 'fire', weaponType: 'blade', rarity: 'mythique', binding: 'LqR',
    icon: '⚔️', bonusDesc: 'CRIT +15',
    passiveDesc: 'Crits enflamment (3% HP max/s, 5s). Ennemi en feu: ATK +15%. 2+ en feu: ATK +25%.',
    dropBoss: 8, dropChance: 2,
    get dropBossName() { return BOSS_NAMES[this.dropBoss]; },
  },
  thyrsus: {
    id: 'thyrsus', name: 'Thyrsus', atk: 240,
    element: 'water', weaponType: 'staff', rarity: 'mythique', binding: 'LqR',
    icon: '🪄', bonusDesc: 'Mana regen +50%',
    passiveDesc: '20% chance sort gratuit (0 mana). Mana > 80%: degats +20%. Mana < 20%: regen x3.',
    dropBoss: 6, dropChance: 3,
    get dropBossName() { return BOSS_NAMES[this.dropBoss]; },
  },
  gram: {
    id: 'gram', name: 'Gram', atk: 290,
    element: 'fire', weaponType: 'blade', rarity: 'mythique', binding: 'LqR',
    icon: '⚔️', bonusDesc: 'ATK +25%',
    passiveDesc: 'Tous les 5 coups: AoE 250% degats (150px). Chaque ennemi touche: prochain AoE +10% (stack infini).',
    dropBoss: 14, dropChance: 0.3,
    get dropBossName() { return BOSS_NAMES[this.dropBoss]; },
  },
};

// ═══════════════════════════════════════════════════════════
// EXPEDITION UNIQUE ARTIFACTS (20)
// ═══════════════════════════════════════════════════════════

export const EXPEDITION_UNIQUES = {
  // Tier 1 — Boss 1-3
  oeil_monarque: {
    id: 'oeil_monarque', name: 'Oeil du Monarque', tier: 1,
    slot: 'Anneau', rarity: 'legendaire', binding: 'LqR',
    icon: '👁️', color: 'text-yellow-400',
    statsDesc: 'CRIT +10%',
    passiveDesc: 'Affiche les HP precis des boss + barre de phase',
    achievementDesc: 'Tuer Boss 1 la 1ere fois',
  },
  larme_foret: {
    id: 'larme_foret', name: 'Larme de la Foret', tier: 1,
    slot: 'Collier', rarity: 'legendaire', binding: 'LqR',
    icon: '💧', color: 'text-green-400',
    statsDesc: 'HP regen +2%/10s',
    passiveDesc: 'Soins recus +20%',
    achievementDesc: 'Clear Boss 1 sans mort d\'equipe',
  },
  coeur_pierre: {
    id: 'coeur_pierre', name: 'Coeur de Pierre', tier: 1,
    slot: 'Plastron', rarity: 'legendaire', binding: 'LqR',
    icon: '🪨', color: 'text-gray-400',
    statsDesc: 'DEF +15%',
    passiveDesc: 'Reduction degats AoE -15%',
    achievementDesc: 'Tuer Boss 2 la 1ere fois',
  },
  fragment_sentinelle: {
    id: 'fragment_sentinelle', name: 'Fragment de Sentinelle', tier: 1,
    slot: 'Casque', rarity: 'legendaire', binding: 'LqR',
    icon: '🔷', color: 'text-blue-400',
    statsDesc: 'ATK +10%, DEF +10%',
    passiveDesc: '1ere attaque de combat: +50% degats',
    achievementDesc: 'Kill Boss 2 en < 3min',
  },
  voile_seigneur: {
    id: 'voile_seigneur', name: 'Voile du Seigneur', tier: 1,
    slot: 'Bottes', rarity: 'legendaire', binding: 'LqR',
    icon: '🌑', color: 'text-purple-400',
    statsDesc: 'SPD +15%',
    passiveDesc: '10% esquive, si esquive: +20% prochain coup',
    achievementDesc: 'Tuer Boss 3 la 1ere fois',
  },
  plume_ange_noir: {
    id: 'plume_ange_noir', name: 'Plume de l\'Ange Noir', tier: 1,
    slot: 'Boucles', rarity: 'legendaire', binding: 'LqR',
    icon: '🪶', color: 'text-red-400',
    statsDesc: 'Tous degats +12%',
    passiveDesc: 'RES +10, immunite silence',
    achievementDesc: 'Clear Boss 3 sans mort d\'equipe',
  },

  // Tier 2 — Boss 4-8 + achievements
  sceau_commandant: {
    id: 'sceau_commandant', name: 'Sceau du Commandant', tier: 2,
    slot: 'Bracelet', rarity: 'legendaire', binding: 'LqR',
    icon: '📜', color: 'text-amber-400',
    statsDesc: '—',
    passiveDesc: 'Allies proches: ATK +8%, CD -5%',
    achievementDesc: 'Leader de 10 expeditions reussies',
  },
  marque_survivant: {
    id: 'marque_survivant', name: 'Marque du Survivant', tier: 2,
    slot: 'Anneau', rarity: 'legendaire', binding: 'LqR',
    icon: '💀', color: 'text-rose-400',
    statsDesc: '—',
    passiveDesc: 'HP < 20%: DEF +40%, vol vie +15%',
    achievementDesc: 'Survivre a 50 wipes cumules',
  },
  essence_primordiale: {
    id: 'essence_primordiale', name: 'Essence Primordiale', tier: 2,
    slot: 'Collier', rarity: 'legendaire', binding: 'LqR',
    icon: '🌟', color: 'text-teal-400',
    statsDesc: 'Tous stats +5%',
    passiveDesc: 'XP expedition +10%',
    achievementDesc: 'Completer les 3 sets foret',
  },
  croc_warg: {
    id: 'croc_warg', name: 'Croc du Warg', tier: 2,
    slot: 'Gants', rarity: 'legendaire', binding: 'LqR',
    icon: '🐺', color: 'text-red-300',
    statsDesc: 'CRIT +8%',
    passiveDesc: 'CRIT DMG +15%, kills: +1% ATK (max +5%, reset au boss)',
    achievementDesc: 'Tuer 10,000 mobs en expedition',
  },
  cape_fantome: {
    id: 'cape_fantome', name: 'Cape du Fantome', tier: 2,
    slot: 'Plastron', rarity: 'legendaire', binding: 'LqR',
    icon: '👻', color: 'text-gray-300',
    statsDesc: 'Esquive +12%',
    passiveDesc: 'SPD +8%, si esquive: invisible 2s (aggro reset)',
    achievementDesc: '5 expeditions consecutives sans mourir',
  },
  talisman_sage: {
    id: 'talisman_sage', name: 'Talisman du Sage', tier: 2,
    slot: 'Boucles', rarity: 'legendaire', binding: 'LqR',
    icon: '🔮', color: 'text-violet-400',
    statsDesc: 'Soins +20%',
    passiveDesc: 'Mana regen +30%, overheals = bouclier (max 15% HP)',
    achievementDesc: '50 heals en un seul combat',
  },
  bague_architecte: {
    id: 'bague_architecte', name: 'Bague de l\'Architecte', tier: 2,
    slot: 'Anneau', rarity: 'legendaire', binding: 'LqR',
    icon: '💍', color: 'text-cyan-400',
    statsDesc: 'Tous degats +8%',
    passiveDesc: 'Drop rate essences +15%',
    achievementDesc: 'Participer a 100 expeditions',
  },

  // Tier 3 — Endgame (Boss 9-15)
  amulette_pionnier: {
    id: 'amulette_pionnier', name: 'Amulette du Pionnier', tier: 3,
    slot: 'Collier', rarity: 'legendaire', binding: 'LqR',
    icon: '🏅', color: 'text-yellow-500',
    statsDesc: 'HP +20%',
    passiveDesc: 'DEF +10%, immunite stun',
    achievementDesc: '1ere equipe a clear Boss 10 (server-wide)',
  },
  diademe_astral: {
    id: 'diademe_astral', name: 'Diademe Astral', tier: 3,
    slot: 'Casque', rarity: 'legendaire', binding: 'LqR',
    icon: '👑', color: 'text-indigo-400',
    statsDesc: 'Mana +25%',
    passiveDesc: 'CD sorts -10%, sorts AoE +15% degats',
    achievementDesc: 'Tuer Boss 10',
  },
  gantelets_colosse: {
    id: 'gantelets_colosse', name: 'Gantelets du Colosse', tier: 3,
    slot: 'Gants', rarity: 'legendaire', binding: 'LqR',
    icon: '🥊', color: 'text-red-500',
    statsDesc: 'ATK +15%',
    passiveDesc: 'Ignore 10% DEF, crits = onde de choc 50px',
    achievementDesc: 'Infliger 1 milliard de degats cumules',
  },
  sceaux_abysse: {
    id: 'sceaux_abysse', name: 'Sceaux de l\'Abysse', tier: 3,
    slot: 'Bracelet', rarity: 'legendaire', binding: 'LqR',
    icon: '🔗', color: 'text-emerald-400',
    statsDesc: 'Vol vie +10%',
    passiveDesc: 'ATK +12%, kill: +1s duree buffs actifs',
    achievementDesc: 'Tuer Boss 12',
  },
  bottes_explorateur: {
    id: 'bottes_explorateur', name: 'Bottes de l\'Explorateur', tier: 3,
    slot: 'Bottes', rarity: 'legendaire', binding: 'LqR',
    icon: '👢', color: 'text-teal-300',
    statsDesc: 'SPD +20%',
    passiveDesc: 'Tous stats +3%, immunite ralentissement',
    achievementDesc: 'Completer les 15 boss',
  },
  couronne_vainqueur: {
    id: 'couronne_vainqueur', name: 'Couronne du Vainqueur', tier: 3,
    slot: 'Casque', rarity: 'legendaire', binding: 'LqR',
    icon: '👑', color: 'text-orange-400',
    statsDesc: 'CRIT DMG +25%',
    passiveDesc: 'ATK +8%, crit: 3% chance sort bonus gratuit',
    achievementDesc: 'MVP (top DPS) 10 fois',
  },
  relique_temps: {
    id: 'relique_temps', name: 'Relique du Temps', tier: 3,
    slot: 'Boucles', rarity: 'legendaire', binding: 'LqR',
    icon: '⏳', color: 'text-amber-300',
    statsDesc: 'CD reduction 15%',
    passiveDesc: 'SPD +10%, mana regen +20%',
    achievementDesc: '500h de jeu en expedition',
  },
};

// ═══════════════════════════════════════════════════════════
// ESSENCES (3 types)
// ═══════════════════════════════════════════════════════════

export const EXPEDITION_ESSENCES = [
  { id: 'guerre', name: 'Essence de Guerre', icon: '⚔️', color: 'text-red-400', bg: 'bg-red-500/15',
    desc: 'Drop des mobs melee (slime, orc, skeleton) + Boss. Sets Fighter/Assassin.',
    dropRate: 'Mob basique 15% (1-2), Elite 40% (2-4), Boss 100% (10-30)' },
  { id: 'arcanique', name: 'Essence Arcanique', icon: '🔮', color: 'text-blue-400', bg: 'bg-blue-500/15',
    desc: 'Drop des mobs caster (dark_mage) + Boss. Sets Mage/Support.',
    dropRate: 'Mob basique 15% (1-2), Elite 40% (2-4), Boss 100% (10-30)' },
  { id: 'gardienne', name: 'Essence Gardienne', icon: '🛡️', color: 'text-amber-400', bg: 'bg-amber-500/15',
    desc: 'Drop des mobs elite (golem, orc) + Boss. Sets Tank/Universal.',
    dropRate: 'Mob basique 15% (1-2), Elite 40% (2-4), Boss 100% (10-30)' },
];

export const ESSENCE_EXCHANGE = [
  { item: 'Piece de set moyen', cost: 50, icon: '🔷' },
  { item: 'Piece de gros set', cost: 150, icon: '🔶' },
  { item: 'Piece aleatoire mythique', cost: 200, icon: '💎' },
];

// ═══════════════════════════════════════════════════════════
// BOSS LIST (for reference in codex)
// ═══════════════════════════════════════════════════════════

export const EXPEDITION_BOSSES = [
  { idx: 0, name: 'Gardien Foret',       zone: 'Foret',   hp: '12M',  def: 30, atk: 1800, enrage: 300 },
  { idx: 1, name: 'Sentinelle Pierre',   zone: 'Foret',   hp: '18M',  def: 40, atk: 2500, enrage: 300 },
  { idx: 2, name: 'Seigneur Ombre',      zone: 'Foret',   hp: '25M',  def: 35, atk: 4000, enrage: 240 },
  { idx: 3, name: 'Ancien des Racines',  zone: 'Foret',   hp: '35M',  def: 50, atk: 3500, enrage: 300 },
  { idx: 4, name: 'Reine Sylvestre',     zone: 'Foret',   hp: '50M',  def: 45, atk: 5000, enrage: 270 },
  { idx: 5, name: 'Leviathan',           zone: 'Abysses', hp: '70M',  def: 60, atk: 6000, enrage: 300 },
  { idx: 6, name: 'Sorcier Abyssal',     zone: 'Abysses', hp: '90M',  def: 50, atk: 7000, enrage: 270 },
  { idx: 7, name: 'Titan de Fer',        zone: 'Abysses', hp: '120M', def: 80, atk: 5500, enrage: 300 },
  { idx: 8, name: 'Hydre Venimeuse',     zone: 'Abysses', hp: '160M', def: 60, atk: 8000, enrage: 240 },
  { idx: 9, name: 'Roi des Profondeurs', zone: 'Abysses', hp: '200M', def: 70, atk: 9000, enrage: 300 },
  { idx: 10, name: 'Spectre Originel',   zone: 'Neant',   hp: '250M', def: 65, atk: 10000, enrage: 270 },
  { idx: 11, name: 'Archonte du Vide',   zone: 'Neant',   hp: '320M', def: 80, atk: 11000, enrage: 300 },
  { idx: 12, name: 'Dragon du Chaos',    zone: 'Neant',   hp: '400M', def: 70, atk: 13000, enrage: 240 },
  { idx: 13, name: 'Monarque Eternel',   zone: 'Neant',   hp: '500M', def: 90, atk: 15000, enrage: 300 },
  { idx: 14, name: 'Sung Il-Hwan',       zone: 'Neant',   hp: '650M', def: 80, atk: 18000, enrage: 360 },
];
