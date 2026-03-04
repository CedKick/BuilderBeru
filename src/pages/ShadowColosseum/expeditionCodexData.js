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
  lance_briseur: {
    id: 'lance_briseur', name: 'Lance Brise-Tyran', atk: 75,
    element: null, weaponType: 'polearm', rarity: 'legendary', binding: 'LqR',
    icon: '🔱', bonusDesc: 'DEF +25, HP +400',
    passiveDesc: 'Reduit ATK du boss de 30% pendant 8s (CD 20s). Allies 200px: +10% DEF. Ideal pour tanks.',
    dropBoss: 9, dropChance: 4,
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
// BOSS LIST — Full data (matches bossDefinitions.js server-side)
// ═══════════════════════════════════════════════════════════

export const EXPEDITION_BOSSES = [
  // ── ZONE FORET (Boss 1-5) ──
  {
    idx: 0, id: 'forest_guardian', name: 'Gardien de la Foret', zone: 'Foret', icon: '\uD83C\uDF32',
    hp: 21_160_000, hpDisplay: '21.2M', atk: 2100, def: 35, spd: 42,
    regenPct: 1.0, autoAtkPower: 100, enrageTimer: 300, enrageHpPct: 0,
    patterns: [
      { name: 'Cleave Frontal', type: 'frontal', damage: 800, cooldown: 6, telegraphTime: 2.0, range: 200, description: 'Frappe massive sur le frontline' },
      { name: 'Stomp', type: 'aoe_melee', damage: 600, cooldown: 10, telegraphTime: 2.5, range: 250, description: 'Onde de choc au sol, degats melee' },
      { name: 'Invocation Slimes', type: 'summon', damage: 0, cooldown: 20, telegraphTime: 1.5, summonCount: 3, summonType: 'slime', description: 'Invoque 3 slimes renforces' },
    ],
    phases: [],
  },
  {
    idx: 1, id: 'stone_sentinel', name: 'Sentinelle de Pierre', zone: 'Foret', icon: '\uD83E\uDEA8',
    hp: 31_740_000, hpDisplay: '31.7M', atk: 2900, def: 46, spd: 35,
    regenPct: 1.14, autoAtkPower: 120, enrageTimer: 300, enrageHpPct: 0,
    patterns: [
      { name: 'Lancer de Roc', type: 'aoe_ranged', damage: 1000, cooldown: 8, telegraphTime: 2.0, range: 400, aoeRadius: 150, description: 'Rocher lance sur le backline' },
      { name: 'Slam Sol', type: 'aoe_melee', damage: 1200, cooldown: 6, telegraphTime: 1.8, range: 200, description: 'Ecrasement au sol, degats melee' },
      { name: 'Bouclier de Terre', type: 'self_heal', damage: 0, cooldown: 25, telegraphTime: 1.0, healPercent: 5, description: 'Bouclier de terre, regenere 5% HP' },
      { name: 'Invocation Golems', type: 'summon', damage: 0, cooldown: 30, telegraphTime: 2.0, summonCount: 2, summonType: 'golem', description: 'Invoque 2 golems de pierre' },
    ],
    phases: [],
  },
  {
    idx: 2, id: 'shadow_lord', name: 'Seigneur Ombre', zone: 'Foret', icon: '\uD83D\uDC7B',
    hp: 43_700_000, hpDisplay: '43.7M', atk: 4600, def: 40, spd: 58,
    regenPct: 1.29, autoAtkPower: 150, enrageTimer: 240, enrageHpPct: 20,
    patterns: [
      { name: "Lame d'Ombre", type: 'frontal', damage: 1500, cooldown: 5, telegraphTime: 1.5, range: 250, description: "Lame d'ombre tranchant le frontline" },
      { name: 'Tenebres', type: 'aoe_ranged', damage: 1000, cooldown: 12, telegraphTime: 2.5, range: 500, aoeRadius: 200, description: "Tenebres engloutissant le backline" },
      { name: 'Necromancie', type: 'summon', damage: 0, cooldown: 18, telegraphTime: 2.0, summonCount: 5, summonType: 'skeleton', description: 'Invoque 5 squelettes morts-vivants' },
      { name: "Drain d'Ame", type: 'aoe_all', damage: 2000, cooldown: 20, telegraphTime: 3.0, healPercent: 2, description: "Draine la vie de tous, soigne le boss 2% HP" },
    ],
    phases: [],
  },
  {
    idx: 3, id: 'root_ancient', name: 'Ancien des Racines', zone: 'Foret', icon: '\uD83C\uDF33',
    hp: 60_950_000, hpDisplay: '61M', atk: 4000, def: 58, spd: 32,
    regenPct: 1.43, autoAtkPower: 110, enrageTimer: 300, enrageHpPct: 0,
    patterns: [
      { name: 'Empalement Racinaire', type: 'aoe_melee', damage: 900, cooldown: 6, telegraphTime: 2.5, range: 300, description: 'Racines jaillissant du sol, degats melee' },
      { name: 'Constriction', type: 'aoe_all', damage: 700, cooldown: 12, telegraphTime: 2.0, description: 'Lianes enserrant tous les personnages' },
      { name: 'Regeneration Sylvestre', type: 'self_heal', damage: 0, cooldown: 30, telegraphTime: 1.0, healPercent: 3, description: 'Puise dans la foret, regenere 3% HP' },
      { name: 'Invocation Treants', type: 'summon', damage: 0, cooldown: 25, telegraphTime: 2.0, summonCount: 3, summonType: 'treant', description: 'Invoque 3 treants gardiens' },
    ],
    phases: [],
  },
  {
    idx: 4, id: 'sylvan_queen', name: 'Reine Sylvestre', zone: 'Foret', icon: '\uD83C\uDF3A',
    hp: 90_850_000, hpDisplay: '90.9M', atk: 5800, def: 52, spd: 55,
    regenPct: 1.57, autoAtkPower: 130, enrageTimer: 270, enrageHpPct: 15,
    patterns: [
      { name: "Pluie d'Epines", type: 'aoe_ranged', damage: 1100, cooldown: 5, telegraphTime: 1.8, range: 500, aoeRadius: 200, description: "Pluie d'epines sur le backline" },
      { name: 'Etreinte Mortelle', type: 'frontal', damage: 1400, cooldown: 8, telegraphTime: 2.0, range: 250, description: 'Etreinte de lianes mortelles sur le frontline' },
      { name: 'Charme Sylvestre', type: 'aoe_all', damage: 600, cooldown: 20, telegraphTime: 3.0, description: 'Aura charmante infligeant degats et confusion' },
      { name: 'Invocation Essaim', type: 'summon', damage: 0, cooldown: 18, telegraphTime: 1.5, summonCount: 8, summonType: 'fae', description: 'Invoque un essaim de 8 creatures feeriques' },
    ],
    phases: [],
  },
  // ── ZONE ABYSSES (Boss 6-10) ──
  {
    idx: 5, id: 'leviathan', name: 'Leviathan', zone: 'Abysses', icon: '\uD83D\uDC19',
    hp: 131_100_000, hpDisplay: '131M', atk: 7200, def: 72, spd: 42,
    regenPct: 1.71, autoAtkPower: 140, enrageTimer: 300, enrageHpPct: 0,
    patterns: [
      { name: 'Raz-de-Maree', type: 'aoe_all', damage: 1300, cooldown: 7, telegraphTime: 2.5, description: 'Raz-de-maree frappant tout le raid' },
      { name: 'Morsure Abyssale', type: 'frontal', damage: 1800, cooldown: 5, telegraphTime: 1.5, range: 200, description: 'Morsure devastatrice sur le frontline' },
      { name: 'Tourbillon', type: 'aoe_melee', damage: 1000, cooldown: 15, telegraphTime: 2.0, range: 350, description: 'Tourbillon aspirant et blessant les proches' },
      { name: 'Invocation Profondeurs', type: 'summon', damage: 0, cooldown: 25, telegraphTime: 2.0, summonCount: 4, summonType: 'abyssal', description: 'Invoque 4 creatures abyssales' },
    ],
    phases: [],
  },
  {
    idx: 6, id: 'abyssal_sorcerer', name: 'Sorcier Abyssal', zone: 'Abysses', icon: '\uD83E\uDDD9',
    hp: 169_050_000, hpDisplay: '169M', atk: 8400, def: 60, spd: 50,
    regenPct: 1.86, autoAtkPower: 120, enrageTimer: 270, enrageHpPct: 0,
    patterns: [
      { name: 'Rayon Maudit', type: 'aoe_ranged', damage: 1600, cooldown: 5, telegraphTime: 1.5, range: 500, aoeRadius: 250, description: 'Rayon maudit ciblant mages et healers' },
      { name: 'Nova Obscure', type: 'aoe_melee', damage: 1200, cooldown: 10, telegraphTime: 2.5, range: 300, description: 'Nova sombre autour du sorcier' },
      { name: 'Drain de Mana', type: 'aoe_all', damage: 800, cooldown: 20, telegraphTime: 2.0, healPercent: 3, description: 'Draine mana et vie, soigne le boss 3% HP' },
      { name: 'Invocation Dark Mages', type: 'summon', damage: 0, cooldown: 22, telegraphTime: 2.0, summonCount: 4, summonType: 'dark_mage', description: 'Invoque 4 mages noirs acolytes' },
    ],
    phases: [],
  },
  {
    idx: 7, id: 'iron_titan', name: 'Titan de Fer', zone: 'Abysses', icon: '\uD83E\uDD16',
    hp: 230_000_000, hpDisplay: '230M', atk: 6600, def: 96, spd: 30,
    regenPct: 2.0, autoAtkPower: 160, enrageTimer: 300, enrageHpPct: 0,
    patterns: [
      { name: 'Poing de Fer', type: 'frontal', damage: 2000, cooldown: 6, telegraphTime: 2.5, range: 250, description: 'Poing massif ecrasant le frontline' },
      { name: 'Seisme', type: 'aoe_all', damage: 1400, cooldown: 12, telegraphTime: 3.0, description: 'Tremblement de terre affectant tout le raid' },
      { name: 'Armure Renforcee', type: 'self_heal', damage: 0, cooldown: 30, telegraphTime: 1.0, healPercent: 4, description: "Renforce l'armure, regenere 4% HP" },
      { name: 'Invocation Golems de Fer', type: 'summon', damage: 0, cooldown: 28, telegraphTime: 2.0, summonCount: 3, summonType: 'iron_golem', description: 'Invoque 3 golems de fer' },
    ],
    phases: [],
  },
  {
    idx: 8, id: 'venomous_hydra', name: 'Hydre Venimeuse', zone: 'Abysses', icon: '\uD83D\uDC0D',
    hp: 304_750_000, hpDisplay: '305M', atk: 9500, def: 72, spd: 55,
    regenPct: 2.14, autoAtkPower: 140, enrageTimer: 240, enrageHpPct: 25,
    patterns: [
      { name: 'Triple Morsure', type: 'frontal', damage: 1600, cooldown: 4, telegraphTime: 1.5, range: 200, description: 'Trois tetes mordent le frontline simultanement' },
      { name: 'Crachat Venimeux', type: 'aoe_ranged', damage: 1200, cooldown: 8, telegraphTime: 2.0, range: 450, aoeRadius: 200, description: 'Crachat de poison sur le backline' },
      { name: 'Regeneration Hydra', type: 'self_heal', damage: 0, cooldown: 25, telegraphTime: 1.0, healPercent: 5, description: "Les tetes repoussent, regenere 5% HP" },
      { name: 'Nuage Toxique', type: 'aoe_all', damage: 900, cooldown: 15, telegraphTime: 2.5, description: 'Nuage toxique empoisonnant tout le raid' },
    ],
    phases: [],
  },
  {
    idx: 9, id: 'deep_king', name: 'Roi des Profondeurs', zone: 'Abysses', icon: '\uD83D\uDD31',
    hp: 396_750_000, hpDisplay: '397M', atk: 10500, def: 84, spd: 50,
    regenPct: 2.29, autoAtkPower: 150, enrageTimer: 300, enrageHpPct: 20,
    patterns: [
      { name: 'Jugement Abyssal', type: 'frontal', damage: 2200, cooldown: 6, telegraphTime: 2.0, range: 300, description: 'Jugement royal tranchant le frontline' },
      { name: 'Maree Noire', type: 'aoe_all', damage: 1500, cooldown: 10, telegraphTime: 3.0, description: 'Maree noire engloutissant tout le raid' },
      { name: 'Trident Royal', type: 'aoe_ranged', damage: 1800, cooldown: 8, telegraphTime: 1.8, range: 500, aoeRadius: 200, description: 'Blast de trident ciblant le backline' },
      { name: 'Invocation Gardes Royaux', type: 'summon', damage: 0, cooldown: 30, telegraphTime: 2.5, summonCount: 6, summonType: 'royal_guard', description: 'Invoque 6 gardes royaux des profondeurs' },
    ],
    phases: [],
  },
  // ── ZONE NEANT (Boss 11-15) — Phases speciales ──
  {
    idx: 10, id: 'origin_specter', name: 'Spectre Originel', zone: 'Neant', icon: '\uD83D\uDC7B',
    hp: 862_500_000, hpDisplay: '863M', atk: 13000, def: 100, spd: 60,
    regenPct: 2.5, autoAtkPower: 160, enrageTimer: 270, enrageHpPct: 20,
    patterns: [
      { name: 'Toucher Spectral', type: 'frontal', damage: 2200, cooldown: 4, telegraphTime: 1.2, range: 250, description: 'Toucher fantomatique traversant les defenses' },
      { name: 'Hurlement du Neant', type: 'aoe_all', damage: 1600, cooldown: 12, telegraphTime: 2.5, description: 'Hurlement du vide infligeant degats a tous' },
      { name: 'Phase Spectrale', type: 'self_heal', damage: 0, cooldown: 20, telegraphTime: 1.0, healPercent: 3, description: 'Se dephase de la realite, regenere 3% HP' },
      { name: 'Invocation Fantomes', type: 'summon', damage: 0, cooldown: 18, telegraphTime: 1.5, summonCount: 8, summonType: 'specter', description: 'Invoque 8 guerriers spectraux' },
      { name: 'Ecrasement Spectral', type: 'atk_crush', damage: 0, cooldown: 15, telegraphTime: 1.0, crushPct: 70, duration: 30, description: 'Ecrase la puissance d\'un chasseur aleatoire (-70% ATK/INT, 30s)' },
    ],
    phases: [
      { id: 'specter_p1', trigger: 'hp_below', threshold: 70, atkMult: 1.2, antiHealPct: 30,
        patterns: [{ name: 'Drain Spectral', type: 'anti_heal', damage: 800, cooldown: 14, telegraphTime: 2.0, antiHealPct: 40, duration: 8, description: 'Drain spectral reduisant tous les soins de 40% pendant 8s' }] },
      { id: 'specter_p2', trigger: 'hp_below', threshold: 30, atkMult: 1.5, spdMult: 1.3, antiHealPct: 70,
        patterns: [{ name: 'Eruption du Neant', type: 'multi_hit', damage: 1200, cooldown: 10, telegraphTime: 2.0, hitCount: 5, description: 'Eruption du vide frappant 5 cibles aleatoires' }] },
    ],
  },
  {
    idx: 11, id: 'void_archon', name: 'Archonte du Vide', zone: 'Neant', icon: '\uD83C\uDF0C',
    hp: 1_610_000_000, hpDisplay: '1.61B', atk: 16000, def: 120, spd: 58,
    regenPct: 2.6, autoAtkPower: 180, enrageTimer: 300, enrageHpPct: 15,
    patterns: [
      { name: 'Decret du Vide', type: 'frontal', damage: 3000, cooldown: 5, telegraphTime: 2.0, range: 300, description: 'Decret du vide obliterant le frontline' },
      { name: 'Singularite', type: 'aoe_all', damage: 2400, cooldown: 15, telegraphTime: 3.0, description: 'Singularite infligeant degats a tout le raid' },
      { name: 'Annihilation', type: 'aoe_ranged', damage: 2600, cooldown: 10, telegraphTime: 2.0, range: 500, aoeRadius: 300, description: "Rayon d'annihilation sur le backline" },
      { name: 'Invocation Sentinelles', type: 'summon', damage: 0, cooldown: 25, telegraphTime: 2.0, summonCount: 4, summonType: 'void_sentinel', description: 'Invoque 4 sentinelles du vide' },
      { name: 'Decret d\'Ecrasement', type: 'atk_crush', damage: 0, cooldown: 15, telegraphTime: 1.0, crushPct: 70, duration: 30, description: 'Ecrase la puissance d\'un chasseur aleatoire (-70% ATK/INT, 30s)' },
    ],
    phases: [
      { id: 'archon_p1', trigger: 'hp_below', threshold: 65, regenMult: 1.5, antiHealPct: 25,
        patterns: [{ name: 'Eclat du Vide', type: 'multi_hit', damage: 1800, cooldown: 8, telegraphTime: 1.8, hitCount: 4, description: 'Eclats du vide frappant 4 cibles aleatoires' }] },
      { id: 'archon_p2', trigger: 'hp_below', threshold: 25, atkMult: 2.0, regenMult: 2.0, antiHealPct: 60,
        patterns: [{ name: 'Tempete du Vide', type: 'aoe_all', damage: 3500, cooldown: 12, telegraphTime: 2.5, description: 'Tempete du vide ravageant tout le raid' }] },
    ],
  },
  {
    idx: 12, id: 'chaos_dragon', name: 'Dragon du Chaos', zone: 'Neant', icon: '\uD83D\uDC32',
    hp: 2_875_000_000, hpDisplay: '2.88B', atk: 19000, def: 115, spd: 66,
    regenPct: 2.8, autoAtkPower: 200, enrageTimer: 240, enrageHpPct: 25,
    patterns: [
      { name: 'Souffle du Chaos', type: 'frontal', damage: 3500, cooldown: 6, telegraphTime: 2.0, range: 350, description: 'Souffle chaotique incinerant le frontline' },
      { name: "Battement d'Ailes", type: 'aoe_all', damage: 2200, cooldown: 8, telegraphTime: 2.5, description: "Battement d'ailes envoyant des ondes de choc" },
      { name: 'Meteor du Chaos', type: 'aoe_ranged', damage: 3800, cooldown: 15, telegraphTime: 3.0, range: 500, aoeRadius: 250, description: 'Meteore chaotique ecrasant le backline' },
      { name: 'Invocation Drakelings', type: 'summon', damage: 0, cooldown: 20, telegraphTime: 2.0, summonCount: 6, summonType: 'drakeling', description: 'Invoque 6 draconiens du chaos' },
      { name: 'Rugissement du Chaos', type: 'atk_crush', damage: 0, cooldown: 15, telegraphTime: 1.0, crushPct: 70, duration: 30, description: 'Ecrase la puissance d\'un chasseur aleatoire (-70% ATK/INT, 30s)' },
    ],
    phases: [
      { id: 'dragon_p1', trigger: 'hp_below', threshold: 75, atkMult: 1.3, antiHealPct: 35,
        patterns: [{ name: 'Salve du Chaos', type: 'multi_hit', damage: 2000, cooldown: 9, telegraphTime: 2.0, hitCount: 6, description: 'Salve chaotique frappant 6 cibles aleatoires' }] },
      { id: 'dragon_p2', trigger: 'hp_below', threshold: 35, atkMult: 1.8, spdMult: 1.4, antiHealPct: 60,
        patterns: [{ name: 'Jugement du Dragon', type: 'execute', damage: 8000, cooldown: 12, telegraphTime: 2.5, description: 'Execute le personnage le plus faible — degats massifs' }] },
    ],
  },
  {
    idx: 13, id: 'eternal_monarch', name: 'Monarque Eternel', zone: 'Neant', icon: '\uD83D\uDC51',
    hp: 5_175_000_000, hpDisplay: '5.18B', atk: 22000, def: 140, spd: 62,
    regenPct: 3.0, autoAtkPower: 220, enrageTimer: 300, enrageHpPct: 15,
    patterns: [
      { name: 'Decret Eternel', type: 'frontal', damage: 4500, cooldown: 5, telegraphTime: 2.0, range: 300, description: 'Decret eternel ecrasant le frontline' },
      { name: 'Tempete du Temps', type: 'aoe_all', damage: 3500, cooldown: 12, telegraphTime: 3.0, description: 'Tempete temporelle deformant la realite' },
      { name: "Rayon d'Eternite", type: 'aoe_ranged', damage: 4000, cooldown: 10, telegraphTime: 2.0, range: 500, aoeRadius: 250, description: "Rayon d'eternite ciblant le backline" },
      { name: 'Invocation Chevaliers', type: 'summon', damage: 0, cooldown: 30, telegraphTime: 2.5, summonCount: 8, summonType: 'eternal_knight', description: 'Invoque 8 chevaliers eternels' },
      { name: 'Sablier Brise', type: 'atk_crush', damage: 0, cooldown: 15, telegraphTime: 1.0, crushPct: 70, duration: 30, description: 'Ecrase la puissance d\'un chasseur aleatoire (-70% ATK/INT, 30s)' },
    ],
    phases: [
      { id: 'monarch_p1', trigger: 'hp_below', threshold: 60, spdMult: 1.5, antiHealPct: 30,
        patterns: [{ name: 'Distorsion Temporelle', type: 'anti_heal', damage: 2000, cooldown: 16, telegraphTime: 2.5, antiHealPct: 50, duration: 12, description: 'Distorsion temporelle bloquant les soins de 50% pendant 12s' }] },
      { id: 'monarch_p2', trigger: 'hp_below', threshold: 25, atkMult: 2.0, spdMult: 1.8, antiHealPct: 75,
        patterns: [{ name: 'Execution Eternelle', type: 'execute', damage: 12000, cooldown: 10, telegraphTime: 2.0, description: 'Jugement eternel sur le plus faible — mort quasi certaine' }] },
    ],
  },
  {
    idx: 14, id: 'sung_ilhwan', name: 'Sung Il-Hwan', zone: 'Neant', icon: '\u2694\uFE0F',
    hp: 11_500_000_000, hpDisplay: '11.5B', atk: 25000, def: 130, spd: 75,
    regenPct: 3.0, autoAtkPower: 250, enrageTimer: 360, enrageHpPct: 20,
    patterns: [
      { name: 'Frappe du Chasseur Supreme', type: 'frontal', damage: 5000, cooldown: 4, telegraphTime: 1.5, range: 300, description: 'Frappe devastatrice du chasseur supreme' },
      { name: 'Domain du Monarque', type: 'aoe_all', damage: 4000, cooldown: 15, telegraphTime: 3.0, description: 'Domaine du monarque infligeant degats a tous' },
      { name: 'Armee des Ombres', type: 'summon', damage: 0, cooldown: 20, telegraphTime: 2.0, summonCount: 12, summonType: 'shadow', description: "Invoque sa legendaire armee de 12 ombres" },
      { name: 'Echange de Vie', type: 'aoe_all', damage: 5000, cooldown: 25, telegraphTime: 3.0, healPercent: 5, description: 'Draine toute force vitale, soigne le boss 5% HP' },
      { name: 'Autorite du Monarque', type: 'atk_crush', damage: 0, cooldown: 15, telegraphTime: 1.0, crushPct: 70, duration: 30, description: 'Ecrase la puissance d\'un chasseur aleatoire (-70% ATK/INT, 30s)' },
    ],
    phases: [
      { id: 'ilhwan_p1', trigger: 'hp_below', threshold: 80, atkMult: 1.3, antiHealPct: 20,
        patterns: [{ name: 'Ombre Renforcee', type: 'multi_hit', damage: 2500, cooldown: 10, telegraphTime: 1.8, hitCount: 8, description: 'Ombre renforcee frappant 8 cibles aleatoires' }] },
      { id: 'ilhwan_p2', trigger: 'hp_below', threshold: 50, atkMult: 1.6, spdMult: 1.4, antiHealPct: 50,
        patterns: [{ name: 'Domaine Supreme', type: 'anti_heal', damage: 3000, cooldown: 18, telegraphTime: 3.0, antiHealPct: 70, duration: 15, description: 'Domaine supreme ecrasant les soins de 70% pendant 15s' }] },
      { id: 'ilhwan_p3', trigger: 'hp_below', threshold: 15, atkMult: 2.5, spdMult: 2.0, regenMult: 3.0, antiHealPct: 90,
        patterns: [{ name: 'Annihilation Totale', type: 'multi_hit', damage: 3000, cooldown: 8, telegraphTime: 2.0, hitCount: 12, description: 'Annihilation totale — 12 frappes devastatrices' }] },
    ],
  },
];
