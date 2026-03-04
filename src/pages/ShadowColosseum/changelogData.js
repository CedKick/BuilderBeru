// ═══════════════════════════════════════════════════════════════
// CHANGELOG — Historique des mises a jour Shadow Colosseum
// Ajouter les nouvelles entrees EN HAUT du tableau
// ═══════════════════════════════════════════════════════════════

export const CHANGELOG = [
  {
    version: '0.9.9',
    date: '2026-03-04',
    title: 'Balance : manaRestore Support & Boss HP +15%',
    entries: [
      {
        category: 'balance',
        items: [
          'Support healTeam : manaRestore 5% du mana max apres chaque soin (Gina, Meri, Meilin, Lee Johee, Isla)',
          'Expedition : HP de tous les 15 boss augmentee de +15% (21.2M → 11.5B)',
        ],
      },
      {
        category: 'content',
        items: [
          'Codex : documentation mana regen par mode (ARC, Raid SC, Raid Manaya, Expedition, PVP)',
        ],
      },
    ],
  },
  {
    version: '0.9.8',
    date: '2026-03-04',
    title: 'Codex Mecaniques — Guides Complets par Mode',
    entries: [
      {
        category: 'new',
        items: [
          'Codex Mecaniques : 6 sous-onglets (Generales, ARC I & II, Raid SC, Raid Manaya, Expedition, PVP)',
          'Guide ARC : tours SPD, multiplicateur puissance, mana scaling, passifs chasseur',
          'Guide Raid SC : stats Ant Queen/Manticore, 6 tiers, synergies equipe, faiblesses hebdo',
          'Guide Raid Manaya : 5 classes, 17 patterns boss, systeme aggro, esquive, set Manaya',
          'Guide Expedition : scaling stats, roles, formule degats, campfire, armes SC, patterns boss',
          'Guide PVP : multiplicateurs PVP, power score, IA combat, passifs actifs, soins',
        ],
      },
      {
        category: 'content',
        items: [
          'Formules de degats detaillees pour chaque mode de jeu',
          'Tableaux de difficulte avec multiplicateurs (Raid SC, Manaya)',
          'Stats completes des 5 classes Manaya (Tank, Healer, Warrior, Archer, Berserker)',
        ],
      },
    ],
  },
  {
    version: '0.9.7',
    date: '2026-03-04',
    title: 'Nerf ATK Boss, Lance Brise-Tyran & Equilibrage',
    entries: [
      {
        category: 'new',
        items: [
          'Lance Brise-Tyran : arme legendary, reduit ATK du boss -30% pendant 8s (CD 20s), +10% DEF allies proches',
        ],
      },
      {
        category: 'balance',
        items: [
          'Nerf ATK boss 9-15 : courbe moins exponentielle (boss 15 : 75k → 25k ATK)',
          'SPD boss augmentee progressivement (boss 15 : 65 → 75 SPD)',
          'Boss 1-8 : ATK inchangee, SPD legerement augmentee',
        ],
      },
    ],
  },
  {
    version: '0.9.6',
    date: '2026-03-04',
    title: 'Sets Support, Fiches Boss & Equilibrage',
    entries: [
      {
        category: 'new',
        items: [
          '4 sets support Expedition : Sagesse Ancienne (INT/Mana), Souffle Celeste (SPD), Purification Sacree (cleanse), Brise Guerissante (heal crit)',
          'Codex : fiches boss detaillees style DokkanDB avec stats, patterns, phases',
          'Codex : onglet Changelog pour suivre les mises a jour',
        ],
      },
      {
        category: 'balance',
        items: [
          'Nerf Katana V : DoT 3% → 1.5%/stack, max stacks 10 → 7, buff chance 30% → 18%',
          'Boss 11-15 : phases speciales avec anti-heal, enrage, invocations',
          'Boss HP et regen augmentes sur les 15 boss',
          'Passifs d\'armes SC actifs en Expedition (Sulfuras, Katana, etc.)',
          'Loot x5 : chaque boss lance 5 fois la table de loot',
        ],
      },
      {
        category: 'fix',
        items: [
          'Fix crash Expedition sur page /codex (donnees boss obsoletes)',
          'Fix scaling INT des mages (utilisent INT au lieu de ATK)',
        ],
      },
    ],
  },
  {
    version: '0.9.5',
    date: '2026-03-03',
    title: 'Auto-Equip, Inventaire & Forge',
    entries: [
      {
        category: 'new',
        items: [
          'Auto-Equip avec selection manuelle de set (popup grille)',
          'Tooltip survol sur grille Auto-Equip montrant bonus 2p/4p/8p',
          'Boutons verrouiller/deverrouiller tous les artefacts',
          'Boutons desequiper set dans popup',
          'Filtre type d\'equipement dans ecran equipement chasseur',
          'Filtre type de set + sets expedition dans onglet equip',
          'Achat en masse x10k pour alkahest et marteaux',
        ],
      },
      {
        category: 'fix',
        items: [
          'Fix desync alkahest entre client et serveur (envoi correct au reroll)',
          'Fix NaN sub-stats sur artefacts set/ultime (pick.min → pick.range[0])',
          'Fix bug equip artefact set (slotId → slot)',
          'Sync SUB_STAT_POOL serveur/client : 12 stats manquantes (INT, elementaux)',
        ],
      },
    ],
  },
  {
    version: '0.9.4',
    date: '2026-03-02',
    title: 'Expedition — Production & Loot',
    entries: [
      {
        category: 'new',
        items: [
          'Expedition ouverte a tous (suppression admin gate)',
          'Auto-scheduler : expeditions automatiques',
          'Systeme de loot par mail',
          'HUD groupe par joueur, click-to-focus, page recap, synergies',
          'Shop : hold-to-buy armes, echange coins, sets par categorie avec prix progressifs',
          'Forge Rouge : shop artefacts de set (500 marteaux rouges/piece)',
        ],
      },
      {
        category: 'balance',
        items: [
          'Loot x2 avec nouvelles armures/armes anti-heal et bleed',
          'Drops uniques sur boss specifiques',
          'Healing balance et nettoyage loot tables',
        ],
      },
      {
        category: 'fix',
        items: [
          'Fix erreur float-to-integer DB dans saveCharacterStates',
          'Fix desync alkahest reroll + cap niveau compte',
        ],
      },
    ],
  },
  {
    version: '0.9.3',
    date: '2026-03-01',
    title: 'Expedition V2-V4 & Spectateur',
    entries: [
      {
        category: 'new',
        items: [
          '15 boss, 25 sets, 10 armes, 20 uniques, essences',
          'Spectateur 2D : camera zoom, parallax, bulles, animations loot, campfire RP',
          'Codex tooltips WoW-style + API boss-loot enrichie',
          'Formation en arc, popup boss, depot loot',
          'SR UX, distribution loot, drops poubelle, inventaire, 6 chasseurs/joueur',
        ],
      },
      {
        category: 'balance',
        items: [
          'Warrior ATK x2 (2550 → 5100) + rage regen 10 → 15',
          'Berserker ATK x3 (820 → 2460) + barre charge premium',
        ],
      },
      {
        category: 'content',
        items: [
          'Idle wobble pour persos et mobs',
          'Manaya visual upgrade : 3 barres charge, nombres degats ameliores, aura rage',
        ],
      },
    ],
  },
];

// Categories metadata
export const CHANGELOG_CATEGORIES = {
  new:      { label: 'Nouveau',      color: 'text-green-400',  bg: 'bg-green-500/15',  border: 'border-green-500/30', icon: '✦' },
  balance:  { label: 'Equilibrage',  color: 'text-amber-400',  bg: 'bg-amber-500/15',  border: 'border-amber-500/30', icon: '⚖' },
  fix:      { label: 'Correction',   color: 'text-blue-400',   bg: 'bg-blue-500/15',   border: 'border-blue-500/30',  icon: '🔧' },
  content:  { label: 'Contenu',      color: 'text-purple-400', bg: 'bg-purple-500/15',  border: 'border-purple-500/30', icon: '🎨' },
};
