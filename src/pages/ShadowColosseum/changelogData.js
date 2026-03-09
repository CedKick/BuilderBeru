// ═══════════════════════════════════════════════════════════════
// CHANGELOG — Historique des mises a jour Shadow Colosseum
// Ajouter les nouvelles entrees EN HAUT du tableau
// ═══════════════════════════════════════════════════════════════

export const CHANGELOG = [
  {
    version: '0.9.17',
    date: '2026-03-09',
    title: 'Forge du Monarque — Passifs en Combat & Drop System',
    entries: [
      {
        category: 'new',
        items: [
          'Les passifs des armes forgees sont maintenant actifs en combat dans TOUS les modes : ARC I, ARC II, Raid SC et PvP',
          'Les 20+ passifs forge fonctionnent : Lame Maudite, Devoration, Flamme Interieure, Foudre en Chaine, Bouclier Celeste, etc.',
          'Les armes community ont leur propre taux de drop independant base sur leur Power Score',
          'Raid SC : 10 tentatives de drop par arme community a chaque raid',
          'Buff de faction "Loot" : augmente le taux de drop de l\'arme community ciblee (+5%/niveau)',
        ],
      },
      {
        category: 'balance',
        items: [
          'Les armes community ne polluent plus le pool de drop generique — elles drop uniquement via leur taux custom',
          'Taux de drop par zone : Expedition /1, ARC II /50, ARC I /1000, Raid SC /1000 (x10 rolls)',
        ],
      },
    ],
  },
  {
    version: '0.9.16',
    date: '2026-03-09',
    title: 'Forge du Monarque — Buffs de Faction Automatiques',
    entries: [
      {
        category: 'new',
        items: [
          'Chaque arme forgee par la communaute genere automatiquement un buff de faction "Loot"',
          'Les buffs de faction sont maintenant pilotes par le serveur — plus besoin de mise a jour manuelle',
          'Badge "Forge par [createur]" visible dans le Hub Faction pour les buffs community',
        ],
      },
    ],
  },
  {
    version: '0.9.15',
    date: '2026-03-08',
    title: 'Forge du Monarque — Creation d\'Armes Community',
    entries: [
      {
        category: 'new',
        items: [
          'Forge du Monarque : creez vos propres armes avec stats, element, passifs et eveils personnalises',
          'Jusqu\'a 3 passifs par arme parmi 20+ archetypes (Lame Maudite, Bouclier Celeste, Aura du Commandeur...)',
          'Systeme d\'eveil A1-A5 avec stats personnalisables (ATK%, DEF%, CRIT%, HP%, INT%...)',
          'Power Score calcule automatiquement — determine la rarete et le taux de drop',
          'Beru surveille la forge et commente vos creations !',
        ],
      },
    ],
  },
  {
    version: '0.9.14',
    date: '2026-03-06',
    title: 'Expedition II & Ameliorations Globales',
    entries: [
      {
        category: 'new',
        items: [
          'Expedition : controle direct de vos personnages (plus d\'auto-combat)',
          'Auto-inscription pour l\'expedition avec toggle independant',
          'Bouton retour vers le Colosseum depuis l\'expedition',
        ],
      },
      {
        category: 'balance',
        items: [
          'Assassins reclasses en Berserker — meilleure survie en expedition',
          'Spectateur : detection automatique des combats en cours',
        ],
      },
    ],
  },
  {
    version: '0.9.13',
    date: '2026-03-04',
    title: 'Expedition — Synergies & Passifs Equipe',
    entries: [
      {
        category: 'new',
        items: [
          'Expedition inscription : panneau Synergies & Passifs affichant les bonus de votre equipe de 6',
          'Synergies elementaires (Duo +10% ATK, Trinite +20% ATK +10% DEF), Diversite (+5% all stats), Support (PV +10%), Tank (DEF +10%)',
          'Passifs individuels affiches : permanent, teamAura, healBonus, magicDmg, critDmg, stacking, berserker, etc.',
          'Passifs d\'eveil (Awakening A1-A5) affiches avec calcul dynamique par equipe',
        ],
      },
      {
        category: 'balance',
        items: [
          'Expedition combat : synergies d\'equipe appliquees cote serveur (memes bonus que Raid SC)',
          'Les synergies s\'appliquent par joueur (groupe de 6 hunters) et modifient HP/ATK/DEF/SPD/INT',
        ],
      },
    ],
  },
  {
    version: '0.9.12',
    date: '2026-03-04',
    title: 'Ultimate Skills — 48 Hunters + Parchemins Expedition',
    entries: [
      {
        category: 'new',
        items: [
          'Ultimate Skill pour les 48 hunters — un 4eme skill puissant qui s\'ajoute aux 3 existants',
          'Parchemin Ultimate : nouvel item d\'expedition qui debloque l\'ultime d\'un hunter au choix',
          'Drop Parchemin : 5% sur les trash mobs, 100% garanti sur chaque boss (x5 rolls = ~5 par boss)',
          'Systeme de deblocage : les ultimates ne coutent plus de points de talent, mais un parchemin',
        ],
      },
      {
        category: 'balance',
        items: [
          'Fighters/Assassins : ultimes offensifs (power 230-350%, buffs ATK, debuffs DEF)',
          'Mages : ultimes INT-scaling (power 250-380%, manaScaling, debuffs DEF)',
          'Supports : ultimes buff/heal (healTeam 28-35%, double buffs ATK+DEF, shieldTeamPctDef)',
          'Tanks : ultimes defensifs (shieldTeamPctDef 20-25%, healSelf, buffDef)',
          'Hunters rares : ultimes legerement plus forts pour reequilibrer vs mythiques',
          'Megumin : GIGA EXPLOSION!!! — 10000% power, CD 10, 500 mana, stun 3 tours',
        ],
      },
      {
        category: 'content',
        items: [
          'Codex : section Ultimate ajoutee dans chaque fiche hunter (grise si verrouille)',
        ],
      },
    ],
  },
  {
    version: '0.9.11',
    date: '2026-03-04',
    title: 'Expedition 100 Hunters — Scaling Dynamique & Boss Massifs',
    entries: [
      {
        category: 'balance',
        items: [
          'Boss 11-15 : HP massivement augmentee — Boss 11: 5B, Boss 12: 12B, Boss 13: 28B, Boss 14: 60B, Boss 15: 150B',
          'Boss 11-15 : ATK augmentee — Boss 11: 17K, Boss 12: 23K, Boss 13: 33K, Boss 14: 48K, Boss 15: 75K',
          'Scaling dynamique : au-dela de 30 hunters, HP/ATK/DEF des boss et mobs s\'adaptent proportionnellement',
          'Formule scaling : HP ×(hunters/30), ATK ×(1 + (hunters/30 - 1)×0.3), DEF ×(1 + (hunters/30 - 1)×0.15)',
        ],
      },
      {
        category: 'new',
        items: [
          'Capacite expedition : 30 → 100 hunters max (6 par compte, ~16 joueurs max)',
          'Loot scaling : +1 roll de loot tous les 10 hunters au-dela de 30 (ex: 60h = +3 rolls)',
          'Mobs scaling : HP des mobs augmente de 60% du ratio joueurs (ex: 60h = ×1.6 HP mobs)',
        ],
      },
    ],
  },
  {
    version: '0.9.10',
    date: '2026-03-04',
    title: 'Boss 11-15 : ATK Crush — Debuff DPS',
    entries: [
      {
        category: 'balance',
        items: [
          'Boss 11-15 : nouvelle mecanique "ATK Crush" — reduit ATK/INT d\'un chasseur aleatoire de 70% pendant 30s (CD 15s)',
          'Le debuff cible un chasseur au hasard et peut se superposer sur differentes cibles',
          'Boss 11: Ecrasement Spectral, Boss 12: Decret d\'Ecrasement, Boss 13: Rugissement du Chaos, Boss 14: Sablier Brise, Boss 15: Autorite du Monarque',
        ],
      },
      {
        category: 'content',
        items: [
          'Codex Expedition : fiches boss 11-15 mises a jour avec le nouveau pattern ATK Crush',
        ],
      },
    ],
  },
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
