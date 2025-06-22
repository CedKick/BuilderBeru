// 🏗️ BUILDERBERU.COM - Intelligence des Données Hunters
// Générée par l'équipe Monarque des Ombres 👑⚡️
// 🔥 REFACTOR KAISEL - LOGIQUE UNIFIÉE

const BUILDER_DATA = {
  "niermann": {
  "name": "Lennart Niermann",
  "element": "Water",
  "class": "Fighter", 
  "grade": "SSR",
  "scaleStat": "Defense",

  // 🎯 PRIORITÉS D'OPTIMISATION - LOGIQUE UNIFIÉE (inchangé)
  "optimizationPriority": [
    {
      stat: "Additional Defense",
      priority: 1,
      target: "maximum_possible",
      reason: "Prioriser Defense au maximum (scaleStat)",
      description: "Niermann scale sur Defense - maximise cette stat avant tout"
    },
    {
      stat: "Damage Increase",
      priority: 2,
      target: "maximum_possible",
      reason: "Dégâts optimaux"
    },
    {
      stat: "Critical Hit Damage",
      priority: 3,
      target: "200%+",
      reason: "Dégâts critiques optimaux"
    },
    {
      stat: "Critical Hit Rate",
      priority: 4,
      target: 5000, // 50% minimum pour tank
      reason: "Taux critique pour contre-attaques"
    },
    {
      stat: "Defense Penetration",
      priority: 5,
      target: "10-20%",
      reason: "Pénétration pour efficacité"
    }
  ],

  // 📊 STATS RECOMMANDÉES (inchangé)
  "recommendedStats": {
    "criticalHitRate": "50%",
    "criticalHitDamage": "200% - 210%",
    "healingIncrease": "30% +",
    "defensePenetration": "10% - 20%",
    "additionalDefense": "Le plus possible",
    "additionalAttack": null,
    "precision": null,
    "damageReduction": null,
    "healingReceived": null,
    "mpRecoveryRate": null,
    "mpCostReduction": null
  },

  // 🎮 MODES DE JEU & SETS - KAISEL FIX COMPLET
  "gameModes": {
    "general": {
      "recommendedSet": "Hybrid Iron Will/Outstanding", // ← SET 1
      "priority": "Balanced tank build",
      "description": "Build tank équilibré défensif",
      "availability": "L",
      "setComposition": "4x Iron Will + 4x Outstanding Ability"
    },
    "pod": {
      "recommendedSet": "Full Chaotic Infamy", // ← SET 2
      "priority": "PvP maximum survivability",
      "description": "Build PvP survie maximum",
      "availability": "LR",
      "setComposition": "8x Chaotic Infamy"
    },
    "bdg": {
      "recommendedSet": "Full Chaotic Infamy", // ← SET 2 aussi
      "priority": "Guild boss tanking",
      "description": "Build boss de guilde tank",
      "availability": "LR",
      "setComposition": "8x Chaotic Infamy"
    }
  },

  // ⚔️ SETS D'ARTEFACTS DÉTAILLÉS - KAISEL FIX 2 BUILDS
  "artifactSets": {
    "hybridIronWillOutstanding": {
      "name": "Hybrid Iron Will/Outstanding",
      "frenchName": "Hybride Volonté/Remarquable",
      "availability": "L",
      "setComposition": "4x Iron Will + 4x Outstanding Ability",
      "pieces": {
        "helmet": "Casque de la volonté de fer",        // Iron Will
        "armor": "Armure de la volonté de fer",         // Iron Will
        "gloves": "Gants de la volonté de fer",         // Iron Will
        "boots": "Bottes de la volonté de fer",         // Iron Will
        "necklace": "Collier en obsidienne",            // Outstanding Ability
        "bracelet": "Bracelet en obsidienne",           // Outstanding Ability
        "ring": "Bague en obsidienne",                  // Outstanding Ability
        "earrings": "Boucles d'oreilles en obsidienne" // Outstanding Ability
      },
      "mainStats": {
        "helmet": "Additional Defense",
        "armor": "Additional Defense",  
        "gloves": "Additional Attack",
        "boots": "Critical Hit Damage",
        "necklace": "Additional Defense",
        "bracelet": "Water Damage %",
        "ring": "Additional Defense",
        "earrings": "Additional MP"
      }
    },
    "fullChaoticInfamy": {
      "name": "Full Chaotic Infamy",
      "frenchName": "Infamie chaotique complète",
      "availability": "LR",
      "setComposition": "8x Chaotic Infamy",
      "pieces": {
        "helmet": "Casque d'infamie chaotique",
        "armor": "Armure d'infamie chaotique",
        "gloves": "Gants d'infamie chaotique",
        "boots": "Bottes d'infamie chaotique",
        "necklace": "Collier d'infamie chaotique",
        "bracelet": "Bracelet d'infamie chaotique",
        "ring": "Bague d'infamie chaotique",
        "earrings": "Boucles d'oreilles d'infamie chaotique"
      },
      "mainStats": {
        "helmet": "Additional Defense",
        "armor": "Additional Defense",
        "gloves": "Additional Attack",
        "boots": "Critical Hit Damage",
        "necklace": "Additional Defense",
        "bracelet": "Water Damage %",
        "ring": "Additional Defense",
        "earrings": "Additional MP"
      }
    },
    // 🔥 KAISEL: GARDER AUSSI L'ANCIEN IRON WILL POUR COMPATIBILITÉ
    "ironWill": {
      "name": "Iron Will",
      "frenchName": "Volonté de fer",
      "availability": "L",
      "setComposition": "8x Iron Will (build de base)",
      "pieces": {
        "helmet": "Casque de la volonté de fer",
        "armor": "Armure de la volonté de fer", 
        "gloves": "Gants de la volonté de fer",
        "boots": "Bottes de la volonté de fer",
        "necklace": "Collier en obsidienne",
        "bracelet": "Bracelet en obsidienne", 
        "ring": "Bague en obsidienne",
        "earrings": "Boucles d'oreilles en obsidienne"
      },
      "mainStats": {
        "helmet": "Additional Defense",
        "armor": "Additional Defense",  
        "gloves": "Additional Attack",
        "boots": "Critical Hit Damage",
        "necklace": "Additional Defense",
        "bracelet": "Water Damage %",
        "ring": "Additional Defense",
        "earrings": "Additional MP"
      }
    }
  },

  // 🧪 NOYAUX RECOMMANDÉS (inchangé)
  "recommendedCores": {
    "offensive": {
      "name": "Trompette du Démon Anonyme",
      "type": "Additional Attack",
      "bonus": "Lors de l'utilisation de la Compétence ultime, les Dégâts de coup critique de l'utilisateur augmentent de 30% pendant 8 secondes"
    },
    "defensive": {
      "name": "Corne du Démon Anonyme", 
      "type": "Additional Defense",
      "bonus": "Lors de l'utilisation de la Compétence ultime, l'utilisateur bénéficie d'un bouclier équivalent à 10% de ses PV max pendant 8 secondes"
    },
    "endurance": {
      "name": "Dents du Veilleur",
      "type": "Additional MP",
      "bonus": "Diminue le taux de récupération de PM de 15% et la Consommation de PM de 15% lors de l'utilisation d'une compétence"
    }
  },

  // 💡 CONSEILS BÉRU - KAISEL UPDATE
  "beruAdvice": {
    "newbie": "Niermann est un tank défensif avec 2 builds ! Commence par Iron Will/Outstanding.",
    "intermediate": "Scale sur Defense = focus Additional Defense. Général vs PvP/BdG !",
    "advanced": "2 builds : Hybride (Général), Full Chaotic (PvP/BdG).",
    "expert": "Iron Will/Outstanding pour le général, Chaotic Infamy pour tryhard !"
  }
},

  "chae": {
  "name": "Cha Hae-In",
  "element": "Light",
  "class": "Fighter",
  "grade": "SSR",
  "scaleStat": "Attack",

  // 🎯 PRIORITÉS D'OPTIMISATION - LOGIQUE UNIFIÉE
  "optimizationPriority": [
    {
      stat: "Additional Attack",
      priority: 1,
      target: "maximum_possible",
      reason: "Prioriser Attack au maximum (scaleStat)",
      description: "Chae scale sur Attack - maximise cette stat avant tout"
    },
    {
      stat: "Damage Increase",
      priority: 2,
      target: "maximum_possible",
      reason: "Dégâts optimaux"
    },
    {
      stat: "Critical Hit Damage",
      priority: 3,
      target: "200%+",
      reason: "Dégâts critiques optimaux"
    },
    {
      stat: "Critical Hit Rate",
      priority: 4,
      target: 8000, // 80% pour DPS standard
      reason: "Taux critique pour DPS"
    },
    {
      stat: "Defense Penetration",
      priority: 5,
      target: "10-20%",
      reason: "Pénétration pour efficacité"
    }
  ],

  // 📊 STATS RECOMMANDÉES
  "recommendedStats": {
    "criticalHitRate": "80%",
    "criticalHitDamage": "200% - 210%",
    "healingIncrease": "30% +",
    "defensePenetration": "10% - 20%",
    "additionalDefense": "Modéré",
    "additionalAttack": "Le plus possible",
    "precision": null,
    "damageReduction": null,
    "healingReceived": null,
    "mpRecoveryRate": null,
    "mpCostReduction": null
  },

  // 🎮 MODES DE JEU & SETS - KAISEL FIX COMPLET
  "gameModes": {
    "general": {
      "recommendedSet": "Hybrid Burning/Chaotic", // ← SET 1
      "priority": "Balanced content build",
      "description": "Build équilibré pour contenu général",
      "availability": "LR",
      "setComposition": "2x Burning Curse + 2x Chaotic Infamy + 4x Outstanding Ability"
    },
    "bdg": {
      "recommendedSet": "Hybrid Chaotic/Outstanding", // ← SET 2
      "priority": "Guild boss optimization",
      "description": "Build optimisé boss de guilde",
      "availability": "LR", 
      "setComposition": "4x Chaotic Infamy + 4x Outstanding Ability"
    },
    "pod": {
      "recommendedSet": "Full Chaotic Infamy", // ← SET 3
      "priority": "PvP maximum damage",
      "description": "Build PvP dégâts maximum",
      "availability": "LR",
      "setComposition": "8x Chaotic Infamy"
    }
  },

  // ⚔️ SETS D'ARTEFACTS DÉTAILLÉS - KAISEL FIX 3 BUILDS
  "artifactSets": {
    "hybridBurningChaotic": {
      "name": "Hybrid Burning/Chaotic",
      "frenchName": "Hybride Malédiction/Infamie",
      "availability": "LR",
      "setComposition": "2x Burning Curse + 2x Chaotic Infamy + 4x Outstanding Ability",
      "pieces": {
        "helmet": "Casque de malédiction ardente", // Burning Curse
        "armor": "Armure de malédiction ardente",  // Burning Curse
        "gloves": "Gants d'infamie chaotique",     // Chaotic Infamy
        "boots": "Bottes d'infamie chaotique",    // Chaotic Infamy
        "necklace": "Collier en obsidienne",      // Outstanding Ability
        "bracelet": "Bracelet en obsidienne",     // Outstanding Ability
        "ring": "Bague en obsidienne",            // Outstanding Ability
        "earrings": "Boucles d'oreilles en obsidienne" // Outstanding Ability
      },
      "mainStats": {
        "helmet": "Additional Attack",
        "armor": "Additional Defense",
        "gloves": "Additional Attack", 
        "boots": "Critical Hit Damage",
        "necklace": "Additional HP",
        "bracelet": "Light Damage %",
        "ring": "Additional Attack",
        "earrings": "Additional MP"
      }
    },
    "hybridChaoticOutstanding": {
      "name": "Hybrid Chaotic/Outstanding",
      "frenchName": "Hybride Infamie/Remarquable", 
      "availability": "LR",
      "setComposition": "4x Chaotic Infamy + 4x Outstanding Ability",
      "pieces": {
        "helmet": "Casque d'infamie chaotique",   // Chaotic Infamy
        "armor": "Armure d'infamie chaotique",    // Chaotic Infamy
        "gloves": "Gants d'infamie chaotique",    // Chaotic Infamy
        "boots": "Bottes d'infamie chaotique",    // Chaotic Infamy
        "necklace": "Collier en obsidienne",      // Outstanding Ability
        "bracelet": "Bracelet en obsidienne",     // Outstanding Ability
        "ring": "Bague en obsidienne",            // Outstanding Ability
        "earrings": "Boucles d'oreilles en obsidienne" // Outstanding Ability
      },
      "mainStats": {
        "helmet": "Additional Attack",
        "armor": "Additional Defense",
        "gloves": "Additional Attack", 
        "boots": "Critical Hit Damage",
        "necklace": "Additional HP",
        "bracelet": "Light Damage %",
        "ring": "Additional Attack",
        "earrings": "Additional MP"
      }
    },
    "fullChaoticInfamy": {
      "name": "Full Chaotic Infamy",
      "frenchName": "Infamie chaotique complète",
      "availability": "LR",
      "setComposition": "8x Chaotic Infamy",
      "pieces": {
        "helmet": "Casque d'infamie chaotique",
        "armor": "Armure d'infamie chaotique",
        "gloves": "Gants d'infamie chaotique",
        "boots": "Bottes d'infamie chaotique",
        "necklace": "Collier d'infamie chaotique",
        "bracelet": "Bracelet d'infamie chaotique",
        "ring": "Bague d'infamie chaotique",
        "earrings": "Boucles d'oreilles d'infamie chaotique"
      },
      "mainStats": {
        "helmet": "Additional Attack",
        "armor": "Additional Defense",
        "gloves": "Additional Attack", 
        "boots": "Critical Hit Damage",
        "necklace": "Additional HP",
        "bracelet": "Light Damage %",
        "ring": "Additional Attack",
        "earrings": "Additional MP"
      }
    },
    // 🔥 KAISEL: GARDER AUSSI L'ANCIEN BURNING CURSE POUR COMPATIBILITÉ
    "burningCurse": {
      "name": "Burning Curse",
      "frenchName": "Malédiction ardente",
      "availability": "LR",
      "setComposition": "8x Burning Curse (build de base)",
      "pieces": {
        "helmet": "Casque de malédiction ardente",
        "armor": "Armure de malédiction ardente",
        "gloves": "Gants de malédiction ardente", 
        "boots": "Bottes de malédiction ardente",
        "necklace": "Collier en obsidienne",
        "bracelet": "Bracelet en obsidienne",
        "ring": "Bague en obsidienne", 
        "earrings": "Boucles d'oreilles en obsidienne"
      },
      "mainStats": {
        "helmet": "Additional Attack",
        "armor": "Additional Defense",
        "gloves": "Additional Attack", 
        "boots": "Critical Hit Damage",
        "necklace": "Additional HP",
        "bracelet": "Light Damage %",
        "ring": "Additional Attack",
        "earrings": "Additional MP"
      }
    }
  },

  // 🧪 NOYAUX RECOMMANDÉS (inchangé)
  "recommendedCores": {
    "offensive": {
      "name": "Yeux du Veilleur",
      "type": "Additional Attack",
      "bonus": "Augmente les Dégâts de coup critique des attaques de noyau de 20%"
    },
    "defensive": {
      "name": "Corne du Démon Anonyme", 
      "type": "Additional Defense",
      "bonus": "Lors de l'utilisation de la Compétence ultime, l'utilisateur bénéficie d'un bouclier équivalent à 10% de ses PV max pendant 8 secondes"
    },
    "endurance": {
      "name": "Dents du Veilleur",
      "type": "Additional HP",
      "bonus": "Diminue le Taux de récupération de PM de 10% et la Consommation de PM de 12% lors de l'utilisation d'une compétence"
    }
  },

  // 💡 CONSEILS BÉRU - KAISEL UPDATE
  "beruAdvice": {
    "newbie": "Chae est une DPS Fighter avec 3 builds différents ! Commence par Burning Curse simple.",
    "intermediate": "Scale sur Attack = focus Additional Attack. Choisis ton build selon le contenu !",
    "advanced": "3 builds : Général (Hybrid), BdG (Chaotic/Outstanding), PvP (Full Chaotic).",
    "expert": "Maîtrise les 3 builds pour optimiser selon chaque contenu spécifique !"
  }
},

 "kanae": {
  "name": "Tawata Kanae",
  "element": "Fire",
  "class": "Assassin",
  "grade": "SSR",
  "scaleStat": "Attack",

  // 🎯 PRIORITÉS D'OPTIMISATION - LOGIQUE UNIFIÉE
  "optimizationPriority": [
    {
      stat: "Additional Attack",
      priority: 1,
      target: "maximum_possible",
      reason: "Prioriser Attack au maximum (scaleStat)",
      description: "Kanae scale sur Attack - maximise cette stat avant tout"
    },
    {
      stat: "Damage Increase",
      priority: 2,
      target: "maximum_possible",
      reason: "Dégâts optimaux"
    },
    {
      stat: "Critical Hit Damage",
      priority: 3,
      target: "200%+",
      reason: "Dégâts critiques optimaux"
    },
    {
      stat: "Critical Hit Rate",
      priority: 4,
      target: 12000, // 120% pour lead crit du groupe !
      reason: "Kanae doit lead le crit du groupe (10000-12000)"
    },
    {
      stat: "Defense Penetration",
      priority: 5,
      target: "10-20%",
      reason: "Pénétration pour efficacité"
    }
  ],

  // 📊 STATS RECOMMANDÉES
  "recommendedStats": {
    "criticalHitRate": "100-120%", // Spécial Kanae !
    "criticalHitDamage": "200% - 210%",
    "healingIncrease": "30% +",
    "defensePenetration": "10% - 20%",
    "additionalDefense": null,
    "additionalAttack": "Le plus possible",
    "precision": null,
    "damageReduction": null,
    "healingReceived": null,
    "mpRecoveryRate": null,
    "mpCostReduction": null
  },

  // 🎮 MODES DE JEU & SETS - KAISEL FIX COMPLET
  "gameModes": {
    "general": {
      "recommendedSet": "Hybrid Assassin Build", // ← SET 1 UNIQUE
      "priority": "Crit lead assassin build",
      "description": "Build assassin leader de crit pour tous contenus",
      "availability": "LR+",
      "setComposition": "2x Burning Curse + 2x One-hit Kill + 4x Expert"
    },
    "pod": {
      "recommendedSet": "Hybrid Assassin Build", // ← MÊME BUILD
      "priority": "PvP crit lead assassin",
      "description": "Build PvP assassin leader de crit",
      "availability": "LR+",
      "setComposition": "2x Burning Curse + 2x One-hit Kill + 4x Expert"
    },
    "bdg": {
      "recommendedSet": "Hybrid Assassin Build", // ← MÊME BUILD
      "priority": "Guild boss crit lead",
      "description": "Build boss de guilde assassin leader",
      "availability": "LR+",
      "setComposition": "2x Burning Curse + 2x One-hit Kill + 4x Expert"
    }
  },

  // ⚔️ SETS D'ARTEFACTS DÉTAILLÉS - KAISEL FIX 1 BUILD COMPLEXE
  "artifactSets": {
    "hybridAssassinBuild": {
      "name": "Hybrid Assassin Build",
      "frenchName": "Build assassin hybride",
      "availability": "LR+",
      "setComposition": "2x Burning Curse + 2x One-hit Kill + 4x Expert",
      "pieces": {
        "helmet": "Casque de malédiction ardente",     // Burning Curse
        "armor": "Armure de malédiction ardente",      // Burning Curse
        "gloves": "Gants de frappe unique",            // One-hit Kill ⚠️ NOMMAGE À STANDARDISER
        "boots": "Bottes de frappe unique",            // One-hit Kill ⚠️ NOMMAGE À STANDARDISER
        "necklace": "Collier d'expert",                // Expert
        "bracelet": "Bracelet d'expert",               // Expert
        "ring": "Bague d'expert",                      // Expert
        "earrings": "Boucles d'oreilles d'expert"     // Expert
      },
      "mainStats": {
        "helmet": "Additional Attack",
        "armor": "Additional Defense",
        "gloves": "Additional Attack", 
        "boots": "Critical Hit Damage",
        "necklace": "Additional HP",
        "bracelet": "Fire Damage %",
        "ring": "Additional Attack",
        "earrings": "Additional MP"
      }
    },
    // 🔥 KAISEL: GARDER LES ANCIENS BUILDS POUR COMPATIBILITÉ
    "mixedBuild": {
      "name": "Mixed Build (Legacy)",
      "frenchName": "Build hybride (ancien)",
      "availability": "partial",
      "setComposition": "Build simplifié - utiliser Hybrid Assassin Build",
      "pieces": {
        "helmet": "Chapeau de grand enchanteur",
        "armor": "Robe de grand enchanteur",
        "gloves": "Gants de malédiction ardente",
        "boots": "Bottes de malédiction ardente",
        "necklace": "Collier de bête",
        "bracelet": "Bracelet de bête",
        "ring": "Bague de bête",
        "earrings": "Boucles d'oreilles de bête"
      },
      "mainStats": {
        "helmet": "Additional Attack",
        "armor": "Additional Defense",
        "gloves": "Additional Attack", 
        "boots": "Critical Hit Damage",
        "necklace": "Additional HP",
        "bracelet": "Fire Damage %",
        "ring": "Additional Attack",
        "earrings": "Additional MP"
      }
    }
  },

  // 🧪 NOYAUX RECOMMANDÉS (inchangé)
  "recommendedCores": {
    "offensive": {
      "name": "Trompette du Démon Anonyme",
      "type": "Additional Attack",
      "bonus": "Lors de l'utilisation de la Compétence ultime, les Dégâts de coup critique de l'utilisateur augmentent de 30% pendant 8 secondes"
    },
    "defensive": {
      "name": "Corne du Démon Anonyme", 
      "type": "Additional Defense",
      "bonus": "Lors de l'utilisation de la Compétence ultime, l'utilisateur bénéficie d'un bouclier équivalent à 10% de ses PV max pendant 8 secondes"
    },
    "endurance": {
      "name": "Dents du Veilleur",
      "type": "Additional HP",
      "bonus": "Diminue le Taux de récupération de PM de 10% et la Consommation de PM de 12% lors de l'utilisation d'une compétence"
    }
  },

  // 💡 CONSEILS BÉRU - KAISEL UPDATE
  "beruAdvice": {
    "newbie": "Kanae est un Assassin critique spécial ! UN SEUL build complexe pour tout !",
    "intermediate": "Scale sur Attack + LEADER DE CRIT ! 10000-12000 crit obligatoire !",
    "advanced": "Build unique : 2x Burning + 2x One-hit Kill + 4x Expert. Complexe mais puissant !",
    "expert": "Maîtrise ce build hybride pour lead le crit de l'équipe sur TOUS les contenus !"
  },

  // 🚨 KAISEL NOTE POUR STANDARDISATION FUTURE
  "setNamingIssues": {
    "oneHitKill": [
      "One-hit Kill",     // ← Version actuelle
      "One hit-Kill",     // ← Variante détectée
      "One Hit Kill",     // ← Possibilité
      "Almighty Shaman"   // ← Nom alternatif
    ],
    "standardizedName": "One-hit Kill",
    "note": "⚠️ MONARQUE : standardiser ce nommage plus tard pour éviter les erreurs de détection !"
  }
},

  "seorin": {
    "name": "Seorin",
    "element": "Water",
    "class": "Ranger",
    "grade": "SSR",
    "scaleStat": "HP",

    // 🎯 PRIORITÉS D'OPTIMISATION - LOGIQUE UNIFIÉE
    "optimizationPriority": [
      {
        stat: "Additional HP",
        priority: 1,
        target: "maximum_possible",
        reason: "Prioriser HP au maximum (scaleStat)",
        description: "Seorin scale sur HP - maximise cette stat avant tout"
      },
      {
        stat: "Damage Increase",
        priority: 2,
        target: "maximum_possible",
        reason: "Dégâts optimaux"
      },
      {
        stat: "Critical Hit Damage",
        priority: 3,
        target: "200%+",
        reason: "Dégâts critiques optimaux"
      },
      {
        stat: "Critical Hit Rate",
        priority: 4,
        target: 8000, // 80% pour Ranger DPS
        reason: "Taux critique pour Ranger"
      },
      {
        stat: "Defense Penetration",
        priority: 5,
        target: "10-20%",
        reason: "Pénétration pour efficacité"
      }
    ],

    // 📊 STATS RECOMMANDÉES
    "recommendedStats": {
      "criticalHitRate": "80%",
      "criticalHitDamage": "200% - 210%",
      "healingIncrease": "30% +",
      "defensePenetration": "10% - 20%",
      "additionalDefense": null,
      "additionalAttack": "Le plus possible",
      "precision": null,
      "damageReduction": null,
      "healingReceived": null,
      "mpRecoveryRate": null,
      "mpCostReduction": null
    },

    // 🎮 MODES DE JEU & SETS
    "gameModes": {
      "general": {
        "recommendedSet": "Chaotic Desire",
        "priority": "Balanced HP build",
        "description": "Build équilibré HP",
        "availability": "LR"
      },
      "general2": {
        "recommendedSet": "Burning Greed",
        "priority": "Alternative HP build",
        "description": "Build alternatif HP",
        "availability": "LR"
      },
      "pod": {
        "recommendedSet": "Chaotic Desire",
        "priority": "PvP HP sustain", 
        "description": "Build PvP axé survie HP",
        "availability": "LR"
      },
      "pod2": {
        "recommendedSet": "Burning Greed",
        "priority": "Alternative PvP build",
        "description": "Build PvP alternatif",
        "availability": "LR"
      },
      "bdg": {
        "recommendedSet": "Chaotic Desire",
        "priority": "Guild boss HP tank",
        "description": "Build boss de guilde HP",
        "availability": "LR"
      },
      "bdg2": {
        "recommendedSet": "Burning Greed",
        "priority": "Alternative BdG build",
        "description": "Build boss alternatif",
        "availability": "LR"
      }
    },

    // ⚔️ SETS D'ARTEFACTS DÉTAILLÉS
    "artifactSets": {
      "chaoticDesire": {
        "name": "Chaotic Desire",
        "frenchName": "Désir chaotique",
        "availability": "LR",
        "pieces": {
          "helmet": "Casque du désir chaotique",
          "armor": "Armure du désir chaotique",
          "gloves": "Gants du désir chaotique", 
          "boots": "Bottes du désir chaotique",
          "necklace": "Collier du désir chaotique",
          "bracelet": "Bracelet du désir chaotique",
          "ring": "Bague du désir chaotique", 
          "earrings": "Boucles d'oreilles du désir chaotique"
        },
        "mainStats": {
          "helmet": "Additional HP",
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage",
          "necklace": "Additional HP",
          "bracelet": "Water Damage %",
          "ring": "Additional HP",
          "earrings": "Additional MP"
        }
      },
      "burningGreed": {
        "name": "Burning Greed",
        "frenchName": "Avarice ardente",
        "availability": "LR",
        "pieces": {
          "helmet": "Casque d'avarice ardente",
          "armor": "Armure d'avarice ardente",
          "gloves": "Gants d'avarice ardente", 
          "boots": "Bottes d'avarice ardente",
          "necklace": "Collier du désir chaotique",
          "bracelet": "Bracelet du désir chaotique",
          "ring": "Bague du désir chaotique", 
          "earrings": "Boucles d'oreilles du désir chaotique"
        },
        "mainStats": {
          "helmet": "Additional HP",
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage",
          "necklace": "Additional HP",
          "bracelet": "Water Damage %",
          "ring": "Additional HP",
          "earrings": "Additional MP"
        }
      }
    },

    // 🧪 NOYAUX RECOMMANDÉS
    "recommendedCores": {
      "offensive": {
        "name": "Yeux du Veilleur",
        "type": "Additional Attack",
        "bonus": "Augmente les Dégâts de coup critique des attaques de noyau de 20%"
      },
      "defensive": {
        "name": "Corne du Démon Anonyme", 
        "type": "Additional Defense",
        "bonus": "Lors de l'utilisation de la Compétence ultime, l'utilisateur bénéficie d'un bouclier équivalent à 10% de ses PV max pendant 8 secondes"
      },
      "endurance": {
        "name": "Dents du Veilleur",
        "type": "Additional HP",
        "bonus": "Diminue le Taux de récupération de PM de 10% et la Consommation de PM de 12% lors de l'utilisation d'une compétence"
      }
    },

    // 💡 CONSEILS BÉRU
    "beruAdvice": {
      "newbie": "Seorin est un Ranger HP. Priorise Additional HP au maximum !",
      "intermediate": "Scale sur HP = focus Additional HP, puis Damage Increase.",
      "advanced": "Balance entre HP tank et dégâts pour les contenus difficiles.",
      "expert": "Alterne entre Chaotic Desire et Burning Greed selon tes besoins."
    }
  },

  "goto": {
    "name": "Goto Ryuji",
    "element": "Wind",
    "class": "Tank",
    "grade": "SSR",
    "scaleStat": "HP",

    // 🎯 PRIORITÉS D'OPTIMISATION - LOGIQUE UNIFIÉE
    "optimizationPriority": [
      {
        stat: "Additional HP",
        priority: 1,
        target: "maximum_possible",
        reason: "Prioriser HP au maximum (scaleStat)",
        description: "Goto scale sur HP - maximise cette stat avant tout"
      },
      {
        stat: "Damage Increase",
        priority: 2,
        target: "maximum_possible",
        reason: "Dégâts optimaux"
      },
      {
        stat: "Critical Hit Damage",
        priority: 3,
        target: "200%+",
        reason: "Dégâts critiques optimaux"
      },
      {
        stat: "Critical Hit Rate",
        priority: 4,
        target: 5000, // 50% pour tank
        reason: "Taux critique pour contre-attaques"
      },
      {
        stat: "Defense Penetration",
        priority: 5,
        target: "10-20%",
        reason: "Pénétration pour efficacité"
      }
    ],

    // 📊 STATS RECOMMANDÉES
    "recommendedStats": {
      "criticalHitRate": "50%",
      "criticalHitDamage": "200% - 210%",
      "healingIncrease": "30% +",
      "defensePenetration": "10% - 20%",
      "additionalDefense": "Modéré",
      "additionalAttack": null,
      "precision": null,
      "damageReduction": null,
      "healingReceived": null,
      "mpRecoveryRate": null,
      "mpCostReduction": null
    },

    // 🎮 MODES DE JEU & SETS
    "gameModes": {
      "general": {
        "recommendedSet": "Burning Greed",
        "priority": "HP tank build",
        "description": "Build tank HP",
        "availability": "LR"
      },
      "pod": {
        "recommendedSet": "Burning Greed",
        "priority": "PvP HP tank", 
        "description": "Build PvP tank HP",
        "availability": "LR"
      },
      "bdg": {
        "recommendedSet": "Burning Greed",
        "priority": "Guild boss HP tank",
        "description": "Build boss de guilde HP tank",
        "availability": "LR"
      }
    },

    // ⚔️ SETS D'ARTEFACTS DÉTAILLÉS
    "artifactSets": {
      "burningGreed": {
        "name": "Burning Greed",
        "frenchName": "Avarice ardente",
        "availability": "LR",
        "pieces": {
          "helmet": "Casque d'avarice ardente",
          "armor": "Armure d'avarice ardente",
          "gloves": "Gants d'avarice ardente",
          "boots": "Bottes d'avarice ardente",
          "necklace": "Collier en obsidienne",
          "bracelet": "Bracelet en obsidienne",
          "ring": "Bague en obsidienne", 
          "earrings": "Boucles d'oreilles en obsidienne"
        },
        "mainStats": {
          "helmet": "Additional HP",
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage",
          "necklace": "Additional HP",
          "bracelet": "Wind Damage %",
          "ring": "Additional HP",
          "earrings": "Additional MP"
        }
      }
    },

    // 🧪 NOYAUX RECOMMANDÉS
    "recommendedCores": {
      "offensive": {
        "name": "Trompette du Démon Anonyme",
        "type": "Additional Attack",
        "bonus": "Lors de l'utilisation de la Compétence ultime, les Dégâts de coup critique de l'utilisateur augmentent de 30% pendant 8 secondes"
      },
      "defensive": {
        "name": "Corne du Démon Anonyme", 
        "type": "Additional Defense",
        "bonus": "Lors de l'utilisation de la Compétence ultime, l'utilisateur bénéficie d'un bouclier équivalent à 10% de ses PV max pendant 8 secondes"
      },
      "endurance": {
        "name": "Dents du Veilleur",
        "type": "Additional HP",
        "bonus": "Diminue le Taux de récupération de PM de 10% et la Consommation de PM de 12% lors de l'utilisation d'une compétence"
      }
    },

    // 💡 CONSEILS BÉRU
    "beruAdvice": {
      "newbie": "Goto est un Tank HP. Priorise Additional HP au maximum !",
      "intermediate": "Scale sur HP = focus Additional HP, puis Damage Increase.",
      "advanced": "Build simple et efficace - Goto est un mur HP avec du vent.",
      "expert": "Burning Greed unique pour tous les contenus - simplicité maximale !"
    }
  },

  "kanae": {
    "name": "Tawata Kanae",
    "element": "Fire",
    "class": "Assassin",
    "grade": "SSR",
    "scaleStat": "Attack",

    // 🎯 PRIORITÉS D'OPTIMISATION - LOGIQUE UNIFIÉE CORRIGÉE
    "optimizationPriority": [
      {
        stat: "Additional Attack",
        priority: 1,
        target: "maximum_possible",
        reason: "Prioriser Attack au maximum (scaleStat)",
        description: "Kanae scale sur Attack - maximise cette stat avant tout"
      },
      {
        stat: "Damage Increase",
        priority: 2,
        target: "maximum_possible",
        reason: "Dégâts optimaux"
      },
      {
        stat: "Critical Hit Damage",
        priority: 3,
        target: "200%+",
        reason: "Dégâts critiques optimaux"
      },
      {
        stat: "Critical Hit Rate",
        priority: 4,
        target: 12000, // 120% pour lead crit du groupe !
        reason: "Kanae doit lead le crit du groupe (10000-12000)"
      },
      {
        stat: "Defense Penetration",
        priority: 5,
        target: "10-20%",
        reason: "Pénétration pour efficacité"
      }
    ],

    // 📊 STATS RECOMMANDÉES - CORRIGÉES
    "recommendedStats": {
      "criticalHitRate": "100-120%", // Spécial Kanae !
      "criticalHitDamage": "200% - 210%",
      "healingIncrease": "30% +",
      "defensePenetration": "10% - 20%",
      "additionalDefense": null,
      "additionalAttack": "Le plus possible",
      "precision": null,
      "damageReduction": null,
      "healingReceived": null,
      "mpRecoveryRate": null,
      "mpCostReduction": null
    },

    // 🎮 MODES DE JEU & SETS
    "gameModes": {
      "general": {
        "recommendedSet": "Mixed Build",
        "priority": "Hybrid assassin build",
        "description": "Build assassin hybride",
        "availability": "partial"
      },
      "pod": {
        "recommendedSet": "Mixed Build",
        "priority": "PvP assassin", 
        "description": "Build PvP assassin",
        "availability": "partial"
      },
      "bdg": {
        "recommendedSet": "Mixed Build",
        "priority": "Guild boss assassin",
        "description": "Build boss de guilde assassin",
        "availability": "partial"
      }
    },

    // ⚔️ SETS D'ARTEFACTS DÉTAILLÉS
    "artifactSets": {
      "mixedBuild": {
        "name": "Mixed Build",
        "frenchName": "Build hybride",
        "availability": "partial",
        "pieces": {
          "helmet": "Chapeau de grand enchanteur",
          "armor": "Robe de grand enchanteur",
          "gloves": "Gants de malédiction ardente",
          "boots": "Bottes de malédiction ardente",
          "necklace": "Collier de bête",
          "bracelet": "Bracelet de bête",
          "ring": "Bague de bête",
          "earrings": "Boucles d'oreilles de bête"
        },
        "mainStats": {
          "helmet": "Additional Attack",
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage",
          "necklace": "Additional HP",
          "bracelet": "Fire Damage %",
          "ring": "Additional Attack",
          "earrings": "Additional MP"
        }
      },
      "burningCurse": {
        "name": "Burning Curse",
        "frenchName": "Malédiction ardente",
        "availability": "LR",
        "pieces": {
          "helmet": "Casque de malédiction ardente",
          "armor": "Armure de malédiction ardente",
          "gloves": "Gants de malédiction ardente", 
          "boots": "Bottes de malédiction ardente",
          "necklace": "Collier en obsidienne",
          "bracelet": "Bracelet en obsidienne",
          "ring": "Bague en obsidienne", 
          "earrings": "Boucles d'oreilles en obsidienne"
        },
        "mainStats": {
          "helmet": "Additional Attack",
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage",
          "necklace": "Additional Attack",
          "bracelet": "Fire Damage %",
          "ring": "Additional Attack", 
          "earrings": "Additional MP"
        }
      }
    },

    // 🧪 NOYAUX RECOMMANDÉS
    "recommendedCores": {
      "offensive": {
        "name": "Trompette du Démon Anonyme",
        "type": "Additional Attack",
        "bonus": "Lors de l'utilisation de la Compétence ultime, les Dégâts de coup critique de l'utilisateur augmentent de 30% pendant 8 secondes"
      },
      "defensive": {
        "name": "Corne du Démon Anonyme", 
        "type": "Additional Defense",
        "bonus": "Lors de l'utilisation de la Compétence ultime, l'utilisateur bénéficie d'un bouclier équivalent à 10% de ses PV max pendant 8 secondes"
      },
      "endurance": {
        "name": "Dents du Veilleur",
        "type": "Additional HP",
        "bonus": "Diminue le Taux de récupération de PM de 10% et la Consommation de PM de 12% lors de l'utilisation d'une compétence"
      }
    },

    // 💡 CONSEILS BÉRU - CORRIGÉS
    "beruAdvice": {
      "newbie": "Kanae est un Assassin spécial. Priorise Additional Attack au maximum !",
      "intermediate": "Scale sur Attack = focus Additional Attack, puis Damage Increase.",
      "advanced": "Kanae DOIT avoir 10000-12000 crit pour lead le groupe !",
      "expert": "Build hybride complexe - utilise Burning Curse en alternative simple."
    }
  },
  
  "esil": {
    "name": "Esil Radiru",
    "element": "Fire",
    "class": "Ranger",
    "grade": "SSR",
    "scaleStat": "Attack",

    // 🎯 PRIORITÉS D'OPTIMISATION - LOGIQUE UNIFIÉE
    "optimizationPriority": [
      {
        stat: "Additional Attack",
        priority: 1,
        target: "maximum_possible",
        reason: "Prioriser Attack au maximum (scaleStat)",
        description: "Esil scale sur Attack - maximise cette stat avant tout"
      },
      {
        stat: "Damage Increase",
        priority: 2,
        target: "maximum_possible",
        reason: "Dégâts optimaux"
      },
      {
        stat: "Critical Hit Damage",
        priority: 3,
        target: "200%+",
        reason: "Dégâts critiques optimaux"
      },
      {
        stat: "Critical Hit Rate",
        priority: 4,
        target: 8000,
        reason: "Taux critique pour Ranger"
      },
      {
        stat: "Defense Penetration",
        priority: 5,
        target: "10-20%",
        reason: "Pénétration pour efficacité"
      }
    ],

    // 📊 STATS RECOMMANDÉES
    "recommendedStats": {
      "criticalHitRate": "80%",
      "criticalHitDamage": "200% - 210%",
      "healingIncrease": "30% +",
      "defensePenetration": "10% - 20%",
      "additionalDefense": null,
      "additionalAttack": "Le plus possible",
      "precision": null,
      "damageReduction": null,
      "healingReceived": null,
      "mpRecoveryRate": null,
      "mpCostReduction": null
    },

    // 🎮 MODES DE JEU & SETS
    "gameModes": {
      "general": {
        "recommendedSet": "Burning Greed",
        "priority": "Balanced ranger build",
        "description": "Build ranger équilibré",
        "availability": "LR"
      },
      "pod": {
        "recommendedSet": "Chaotic Desire",
        "priority": "PvP ranger", 
        "description": "Build PvP ranger",
        "availability": "LR"
      },
      "pod2": {
        "recommendedSet": "Burning Greed",
        "priority": "Alternative PvP build",
        "description": "Build PvP alternatif",
        "availability": "LR"
      },
      "bdg": {
        "recommendedSet": "Burning Greed",
        "priority": "Guild boss ranger",
        "description": "Build boss de guilde ranger",
        "availability": "LR"
      }
    },

    // ⚔️ SETS D'ARTEFACTS DÉTAILLÉS
    "artifactSets": {
      "burningGreed": {
        "name": "Burning Greed",
        "frenchName": "Avarice ardente",
        "availability": "LR",
        "pieces": {
          "helmet": "Casque d'avarice ardente",
          "armor": "Armure d'avarice ardente",
          "gloves": "Gants d'avarice ardente", 
          "boots": "Bottes d'avarice ardente",
          "necklace": "Collier d'avarice ardente",
          "bracelet": "Bracelet d'avarice ardente",
          "ring": "Bague d'avarice ardente", 
          "earrings": "Boucles d'oreilles d'avarice ardente"
        },
        "mainStats": {
          "helmet": "Additional Attack",
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage",
          "necklace": "Additional HP",
          "bracelet": "Fire Damage %",
          "ring": "Additional Attack",
          "earrings": "Additional MP"
        }
      },
      "chaoticDesire": {
        "name": "Chaotic Desire",
        "frenchName": "Désir chaotique",
        "availability": "LR",
        "pieces": {
          "helmet": "Casque du désir chaotique",
          "armor": "Armure du désir chaotique",
          "gloves": "Gants du désir chaotique", 
          "boots": "Bottes du désir chaotique",
          "necklace": "Collier d'avarice ardente",
          "bracelet": "Bracelet d'avarice ardente",
          "ring": "Bague d'avarice ardente", 
          "earrings": "Boucles d'oreilles d'avarice ardente"
        },
        "mainStats": {
          "helmet": "Additional Attack",
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage",
          "necklace": "Additional HP",
          "bracelet": "Fire Damage %",
          "ring": "Additional Attack",
          "earrings": "Additional MP"
        }
      }
    },

    // 🧪 NOYAUX RECOMMANDÉS
    "recommendedCores": {
      "offensive": {
        "name": "Obsession du Spectre Antique",
        "type": "Additional Attack",
        "bonus": "Augmente l'Attaque de l'utilisateur de 5%"
      },
      "defensive": {
        "name": "Corne du Démon Anonyme", 
        "type": "Additional Defense",
        "bonus": "Lors de l'utilisation de la Compétence ultime, l'utilisateur bénéficie d'un bouclier équivalent à 10% de ses PV max pendant 8 secondes"
      },
      "endurance": {
        "name": "Dents du Veilleur",
        "type": "Additional HP",
        "bonus": "Diminue le Taux de récupération de PM de 10% et la Consommation de PM de 12% lors de l'utilisation d'une compétence"
      }
    },

    // 💡 CONSEILS BÉRU
    "beruAdvice": {
      "newbie": "Esil est un Ranger Fire DPS. Priorise Additional Attack au maximum !",
      "intermediate": "Scale sur Attack = focus Additional Attack, puis Damage Increase.",
      "advanced": "Optimise ton noyau Obsession du Spectre Antique pour +5% d'attaque.",
      "expert": "Alterne entre Burning Greed et Chaotic Desire selon le contenu."
    }
  },

  "shimizu": {
    "name": "Shimizu Akari",
    "element": "Light",
    "class": "Healer",
    "grade": "SSR",
    "scaleStat": "HP",

    // 🎯 PRIORITÉS D'OPTIMISATION - LOGIQUE UNIFIÉE
    "optimizationPriority": [
      {
        stat: "Additional HP",
        priority: 1,
        target: "maximum_possible",
        reason: "Prioriser HP au maximum (scaleStat)",
        description: "Shimizu scale sur HP - maximise cette stat avant tout"
      },
      {
        stat: "Damage Increase",
        priority: 2,
        target: "maximum_possible",
        reason: "Dégâts optimaux"
      },
      {
        stat: "Critical Hit Damage",
        priority: 3,
        target: "200%+",
        reason: "Dégâts critiques optimaux"
      },
      {
        stat: "Critical Hit Rate",
        priority: 4,
        target: 5000,
        reason: "Taux critique pour healer"
      },
      {
        stat: "Defense Penetration",
        priority: 5,
        target: "10-20%",
        reason: "Pénétration pour efficacité"
      }
    ],

    // 📊 STATS RECOMMANDÉES
    "recommendedStats": {
      "criticalHitRate": "50%",
      "criticalHitDamage": "200% - 210%",
      "healingIncrease": "30% +",
      "defensePenetration": "10% - 20%",
      "additionalDefense": null,
      "additionalAttack": null,
      "precision": null,
      "damageReduction": null,
      "healingReceived": null,
      "mpRecoveryRate": null,
      "mpCostReduction": null
    },

    // 🎮 MODES DE JEU & SETS
    "gameModes": {
      "general": {
        "recommendedSet": "Grand Enchanteur",
        "priority": "Healer support build",
        "description": "Build healer support",
        "availability": "missing"
      },
      "general2": {
        "recommendedSet": "Garde du Palais",
        "priority": "Alternative healer build",
        "description": "Build healer alternatif",
        "availability": "missing"
      },
      "general3": {
        "recommendedSet": "Burning Blessing",
        "priority": "Available healer build",
        "description": "Build healer disponible",
        "availability": "LR"
      },
      "pod": {
        "recommendedSet": "Garde du Palais",
        "priority": "PvP healer", 
        "description": "Build PvP healer",
        "availability": "missing"
      },
      "bdg": {
        "recommendedSet": "Garde du Palais",
        "priority": "Guild boss healer",
        "description": "Build boss de guilde healer",
        "availability": "missing"
      }
    },

    // ⚔️ SETS D'ARTEFACTS DÉTAILLÉS
    "artifactSets": {
      "grandEnchanteur": {
        "name": "Grand Enchanteur",
        "frenchName": "Grand enchanteur",
        "availability": "missing",
        "pieces": {
          "helmet": "Chapeau de grand enchanteur",
          "armor": "Robe de grand enchanteur",
          "gloves": "Gants de grand enchanteur", 
          "boots": "Bottes de grand enchanteur",
          "necklace": "Collier de péridot",
          "bracelet": "Bracelet de péridot",
          "ring": "Bague de péridot", 
          "earrings": "Boucles d'oreilles de péridot"
        },
        "mainStats": {
          "helmet": "Additional HP",
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage",
          "necklace": "Additional HP",
          "bracelet": "Light Damage %",
          "ring": "Additional HP",
          "earrings": "Additional MP"
        }
      },
      "gardeDuPalais": {
        "name": "Garde du Palais",
        "frenchName": "Garde du palais",
        "availability": "missing",
        "pieces": {
          "helmet": "Casque de garde du palais",
          "armor": "Armure de garde du palais",
          "gloves": "Gants de garde du palais", 
          "boots": "Bottes de garde du palais",
          "necklace": "Collier de péridot",
          "bracelet": "Bracelet de péridot",
          "ring": "Bague de péridot", 
          "earrings": "Boucles d'oreilles de péridot"
        },
        "mainStats": {
          "helmet": "Additional HP",
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage",
          "necklace": "Additional HP",
          "bracelet": "Light Damage %",
          "ring": "Additional HP",
          "earrings": "Additional MP"
        }
      },
      "burningBlessing": {
        "name": "Burning Blessing",
        "frenchName": "Bénédiction ardente",
        "availability": "LR",
        "pieces": {
          "helmet": "Casque de bénédiction ardente",
          "armor": "Armure de bénédiction ardente",
          "gloves": "Gants de bénédiction ardente", 
          "boots": "Bottes de bénédiction ardente",
          "necklace": "Collier de bénédiction ardente",
          "bracelet": "Bracelet de bénédiction ardente",
          "ring": "Bague de bénédiction ardente", 
          "earrings": "Boucles d'oreilles de bénédiction ardente"
        },
        "mainStats": {
          "helmet": "Additional HP",
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage",
          "necklace": "Additional HP",
          "bracelet": "Light Damage %",
          "ring": "Additional HP",
          "earrings": "Additional MP"
        }
      }
    },

    // 🧪 NOYAUX RECOMMANDÉS
    "recommendedCores": {
      "offensive": {
        "name": "Trompette du Démon Anonyme",
        "type": "Additional Attack",
        "bonus": "Lors de l'utilisation de la Compétence ultime, les Dégâts de coup critique de l'utilisateur augmentent de 30% pendant 8 secondes"
      },
      "defensive": {
        "name": "Corne du Démon Anonyme", 
        "type": "Additional Defense",
        "bonus": "Lors de l'utilisation de la Compétence ultime, l'utilisateur bénéficie d'un bouclier équivalent à 10% de ses PV max pendant 8 secondes"
      },
      "endurance": {
        "name": "Dents du Veilleur",
        "type": "Additional HP",
        "bonus": "Diminue le Taux de récupération de PM de 10% et la Consommation de PM de 12% lors de l'utilisation d'une compétence"
      }
    },

    // 💡 CONSEILS BÉRU
    "beruAdvice": {
      "newbie": "Shimizu est un Healer HP. Priorise Additional HP au maximum !",
      "intermediate": "Scale sur HP = focus Additional HP, puis Damage Increase.",
      "advanced": "Utilise Burning Blessing en attendant les autres sets.",
      "expert": "3 builds différents selon le contenu - attendre les sets manquants."
    }
  },

  "thomas": {
    "name": "Thomas André",
    "element": "Light",
    "class": "Fighter",
    "grade": "SSR",
    "scaleStat": "Defense",

    // 🎯 PRIORITÉS D'OPTIMISATION - LOGIQUE UNIFIÉE
    "optimizationPriority": [
      {
        stat: "Additional Defense",
        priority: 1,
        target: "maximum_possible",
        reason: "Prioriser Defense au maximum (scaleStat)",
        description: "Thomas scale sur Defense - maximise cette stat avant tout"
      },
      {
        stat: "Damage Increase",
        priority: 2,
        target: "maximum_possible",
        reason: "Dégâts optimaux"
      },
      {
        stat: "Critical Hit Damage",
        priority: 3,
        target: "200%+",
        reason: "Dégâts critiques optimaux"
      },
      {
        stat: "Critical Hit Rate",
        priority: 4,
        target: 5000,
        reason: "Taux critique pour fighter"
      },
      {
        stat: "Defense Penetration",
        priority: 5,
        target: "10-20%",
        reason: "Pénétration pour efficacité"
      }
    ],

    // 📊 STATS RECOMMANDÉES
    "recommendedStats": {
      "criticalHitRate": "50%",
      "criticalHitDamage": "200% - 210%",
      "healingIncrease": "30% +",
      "defensePenetration": "10% - 20%",
      "additionalDefense": "Le plus possible",
      "additionalAttack": "Modéré",
      "precision": null,
      "damageReduction": null,
      "healingReceived": null,
      "mpRecoveryRate": null,
      "mpCostReduction": null
    },

    // 🎮 MODES DE JEU & SETS
    "gameModes": {
      "general": {
        "recommendedSet": "Iron Will",
        "priority": "Defensive fighter build",
        "description": "Build fighter défensif",
        "availability": "L"
      },
      "pod": {
        "recommendedSet": "Iron Will",
        "priority": "PvP defensive fighter", 
        "description": "Build PvP fighter défensif",
        "availability": "L"
      },
      "bdg": {
        "recommendedSet": "Iron Will",
        "priority": "Guild boss defensive fighter",
        "description": "Build boss de guilde fighter défensif",
        "availability": "L"
      }
    },

    // ⚔️ SETS D'ARTEFACTS DÉTAILLÉS
    "artifactSets": {
      "ironWill": {
        "name": "Iron Will",
        "frenchName": "Volonté de fer",
        "availability": "L",
        "pieces": {
          "helmet": "Casque de la volonté de fer",
          "armor": "Armure de la volonté de fer",
          "gloves": "Gants de la volonté de fer", 
          "boots": "Bottes de la volonté de fer",
          "necklace": "Collier en obsidienne",
          "bracelet": "Bracelet en obsidienne",
          "ring": "Bague en obsidienne", 
          "earrings": "Boucles d'oreilles en obsidienne"
        },
        "mainStats": {
          "helmet": "Additional Defense",
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage",
          "necklace": "Additional HP",
          "bracelet": "Light Damage %",
          "ring": "Additional Defense",
          "earrings": "Additional MP"
        }
      }
    },

    // 🧪 NOYAUX RECOMMANDÉS
    "recommendedCores": {
      "offensive": {
        "name": "Trompette du Démon Anonyme",
        "type": "Additional Attack",
        "bonus": "Lors de l'utilisation de la Compétence ultime, les Dégâts de coup critique de l'utilisateur augmentent de 30% pendant 8 secondes"
      },
      "defensive": {
        "name": "Corne du Démon Anonyme", 
        "type": "Additional Defense",
        "bonus": "Lors de l'utilisation de la Compétence ultime, l'utilisateur bénéficie d'un bouclier équivalent à 10% de ses PV max pendant 8 secondes"
      },
      "endurance": {
        "name": "Dents du Veilleur",
        "type": "Additional HP",
        "bonus": "Diminue le Taux de récupération de PM de 10% et la Consommation de PM de 12% lors de l'utilisation d'une compétence"
      }
    },

    // 💡 CONSEILS BÉRU
    "beruAdvice": {
      "newbie": "Thomas est un Fighter défensif. Priorise Additional Defense au maximum !",
      "intermediate": "Scale sur Defense = focus Additional Defense, puis Damage Increase.",
      "advanced": "Iron Will couvre tous tes besoins défensifs en Fighter.",
      "expert": "Iron Will unique pour tous les contenus - simplicité maximale !"
    }
  },

  "isla": {
    "name": "Isla Wright",
    "element": "Dark",
    "class": "Healer",
    "grade": "SSR",
    "scaleStat": "Defense",

    // 🎯 PRIORITÉS D'OPTIMISATION - LOGIQUE UNIFIÉE
    "optimizationPriority": [
      {
        stat: "Additional Defense",
        priority: 1,
        target: "maximum_possible",
        reason: "Prioriser Defense au maximum (scaleStat)",
        description: "Isla scale sur Defense - maximise cette stat avant tout"
      },
      {
        stat: "Damage Increase",
        priority: 2,
        target: "maximum_possible",
        reason: "Dégâts optimaux"
      },
      {
        stat: "Critical Hit Damage",
        priority: 3,
        target: "200%+",
        reason: "Dégâts critiques optimaux"
      },
      {
        stat: "Critical Hit Rate",
        priority: 4,
        target: 5000,
        reason: "Taux critique pour healer"
      },
      {
        stat: "Defense Penetration",
        priority: 5,
        target: "10-20%",
        reason: "Pénétration pour efficacité"
      }
    ],

    // 📊 STATS RECOMMANDÉES
    "recommendedStats": {
      "criticalHitRate": "50%",
      "criticalHitDamage": "200% - 210%",
      "healingIncrease": "Le plus possible",
      "defensePenetration": "10% - 20%",
      "additionalDefense": "Le plus possible",
      "additionalAttack": null,
      "precision": null,
      "damageReduction": null,
      "healingReceived": null,
      "mpRecoveryRate": null,
      "mpCostReduction": null
    },

    // 🎮 MODES DE JEU & SETS
    "gameModes": {
      "general": {
        "recommendedSet": "Garde du Palais",
        "priority": "Defensive healer build",
        "description": "Build healer défensif",
        "availability": "missing"
      },
      "general2": {
        "recommendedSet": "Burning Blessing",
        "priority": "Available healer build",
        "description": "Build healer disponible",
        "availability": "LR"
      },
      "podDark": {
        "recommendedSet": "Garde du Palais",
        "priority": "PvP defensive healer", 
        "description": "Build PvP healer défensif",
        "availability": "missing"
      },
      "podFire": {
        "recommendedSet": "Burning Blessing",
        "priority": "PvP fire healer",
        "description": "Build PvP healer feu",
        "availability": "LR"
      },
      "bdg": {
        "recommendedSet": "Garde du Palais",
        "priority": "Guild boss defensive healer",
        "description": "Build boss de guilde healer défensif",
        "availability": "missing"
      }
    },

    // ⚔️ SETS D'ARTEFACTS DÉTAILLÉS
    "artifactSets": {
      "gardeDuPalais": {
        "name": "Garde du Palais",
        "frenchName": "Garde du palais",
        "availability": "missing",
        "pieces": {
          "helmet": "Casque de garde du palais",
          "armor": "Armure de garde du palais",
          "gloves": "Gants de garde du palais", 
          "boots": "Bottes de garde du palais",
          "necklace": "Collier de péridot",
          "bracelet": "Bracelet en péridot",
          "ring": "Bague en péridot", 
          "earrings": "Boucles d'oreilles en péridot"
        },
        "mainStats": {
          "helmet": "Additional Attack",
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage",
          "necklace": "Additional HP",
          "bracelet": "Dark Damage %",
          "ring": "Additional Defense",
          "earrings": "Additional MP"
        }
      },
      "burningBlessing": {
        "name": "Burning Blessing",
        "frenchName": "Bénédiction ardente",
        "availability": "LR",
        "pieces": {
          "helmet": "Casque de bénédiction ardente",
          "armor": "Armure de bénédiction ardente",
          "gloves": "Gants de bénédiction ardente", 
          "boots": "Bottes de bénédiction ardente",
          "necklace": "Collier de bénédiction ardente",
          "bracelet": "Bracelet de bénédiction ardente",
          "ring": "Bague de bénédiction ardente", 
          "earrings": "Boucles d'oreilles de bénédiction ardente"
        },
        "mainStats": {
          "helmet": "Additional Attack",
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage",
          "necklace": "Additional HP",
          "bracelet": "Dark Damage %",
          "ring": "Additional Defense",
          "earrings": "Additional MP"
        }
      }
    },

    // 🧪 NOYAUX RECOMMANDÉS
    "recommendedCores": {
      "offensive": {
        "name": "Trompette du Démon Anonyme",
        "type": "Additional Attack",
        "bonus": "Lors de l'utilisation de la Compétence ultime, les Dégâts de coup critique de l'utilisateur augmentent de 30% pendant 8 secondes"
      },
      "defensive": {
        "name": "Corne du Démon Anonyme", 
        "type": "Additional Defense",
        "bonus": "Lors de l'utilisation de la Compétence ultime, l'utilisateur bénéficie d'un bouclier équivalent à 10% de ses PV max pendant 8 secondes"
      },
      "endurance": {
        "name": "Dents du Veilleur",
        "type": "Additional HP",
        "bonus": "Diminue le Taux de récupération de PM de 10% et la Consommation de PM de 12% lors de l'utilisation d'une compétence"
      }
    },

    // 💡 CONSEILS BÉRU
    "beruAdvice": {
      "newbie": "Isla est un Healer défensif Dark. Priorise Additional Defense au maximum !",
      "intermediate": "Scale sur Defense = focus Additional Defense, puis Damage Increase.",
      "advanced": "Utilise Burning Blessing en attendant Garde du Palais.",
      "expert": "Healer Defense unique - attend l'ajout de Garde du Palais !"
    }
  },
  
  "gina": {
    "name": "Gina",
    "element": "Fire",
    "class": "Support",
    "grade": "SSR",
    "scaleStat": "Attack",

    // 🎯 PRIORITÉS D'OPTIMISATION - LOGIQUE UNIFIÉE
    "optimizationPriority": [
      {
        stat: "Additional Attack",
        priority: 1,
        target: "maximum_possible",
        reason: "Prioriser Attack au maximum (scaleStat)",
        description: "Gina scale sur Attack - maximise cette stat avant tout"
      },
      {
        stat: "Damage Increase",
        priority: 2,
        target: "maximum_possible",
        reason: "Dégâts optimaux"
      },
      {
        stat: "Critical Hit Damage",
        priority: 3,
        target: "200%+",
        reason: "Dégâts critiques optimaux"
      },
      {
        stat: "Critical Hit Rate",
        priority: 4,
        target: 8000, // 80% pour Support DPS
        reason: "Taux critique pour Support"
      },
      {
        stat: "Defense Penetration",
        priority: 5,
        target: "10-20%",
        reason: "Pénétration pour efficacité"
      }
    ],

    // 📊 STATS RECOMMANDÉES
    "recommendedStats": {
      "criticalHitRate": "80%",
      "criticalHitDamage": "200% - 210%",
      "healingIncrease": "30% +",
      "defensePenetration": "10% - 20%",
      "additionalDefense": null,
      "additionalAttack": "Le plus possible",
      "precision": null,
      "damageReduction": null,
      "healingReceived": null,
      "mpRecoveryRate": null,
      "mpCostReduction": null
    },

    // 🎮 MODES DE JEU & SETS
    "gameModes": {
      "general": {
        "recommendedSet": "Garde du Palais",
        "priority": "Support attack build",
        "description": "Build support attaque",
        "availability": "missing"
      },
      "pod": {
        "recommendedSet": "Garde du Palais",
        "priority": "PvP support", 
        "description": "Build PvP support",
        "availability": "missing"
      },
      "bdg": {
        "recommendedSet": "Garde du Palais",
        "priority": "Guild boss support",
        "description": "Build boss de guilde support",
        "availability": "missing"
      }
    },

    // ⚔️ SETS D'ARTEFACTS DÉTAILLÉS
    "artifactSets": {
      "gardeDuPalais": {
        "name": "Garde du Palais",
        "frenchName": "Garde du palais",
        "availability": "missing",
        "pieces": {
          "helmet": "Casque de garde du palais",
          "armor": "Armure de garde du palais",
          "gloves": "Gants de garde du palais", 
          "boots": "Bottes de garde du palais",
          "necklace": "Collier de péridot",
          "bracelet": "Bracelet en péridot",
          "ring": "Bague en péridot", 
          "earrings": "Boucles d'oreilles en péridot"
        },
        "mainStats": {
          "helmet": "Additional Attack",
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage",
          "necklace": "Additional HP",
          "bracelet": "Fire Damage %",
          "ring": "Additional Attack",
          "earrings": "Additional MP"
        }
      }
    },

    // 🧪 NOYAUX RECOMMANDÉS
    "recommendedCores": {
      "offensive": {
        "name": "Trompette du Démon Anonyme",
        "type": "Additional Attack",
        "bonus": "Lors de l'utilisation de la Compétence ultime, les Dégâts de coup critique de l'utilisateur augmentent de 30% pendant 8 secondes"
      },
      "defensive": {
        "name": "Corne du Démon Anonyme", 
        "type": "Additional Defense",
        "bonus": "Lors de l'utilisation de la Compétence ultime, l'utilisateur bénéficie d'un bouclier équivalent à 10% de ses PV max pendant 8 secondes"
      },
      "endurance": {
        "name": "Dents du Veilleur",
        "type": "Additional Attack",
        "bonus": "Diminue le Taux de récupération de PM de 10% et la Consommation de PM de 12% lors de l'utilisation d'une compétence"
      }
    },

    // 💡 CONSEILS BÉRU
    "beruAdvice": {
      "newbie": "Gina est un Support Fire DPS. Priorise Additional Attack au maximum !",
      "intermediate": "Scale sur Attack = focus Additional Attack, puis Damage Increase.",
      "advanced": "80% de crit pour soutenir l'équipe avec des dégâts optimaux.",
      "expert": "Support Attack unique - attend l'ajout de Garde du Palais !"
    }
  }
};

export { BUILDER_DATA };