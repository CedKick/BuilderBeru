// 🏗️ BUILDERBERU.COM - Intelligence des Données Hunters
// Générée par l'équipe Monarque des Ombres 👑⚡️
// 🔥 REFACTOR KAISEL - LOGIQUE UNIFIÉE

const BUILDER_DATA = {
    "ilhwan": {
  "name": "Ilhwan",
  "element": "Dark",
  "class": "Assassin", 
  "grade": "SSR",
  "scaleStat": "Attack",

"optimizationPriority": [
  {
    stat: "Additional Attack",           
    priority: 1,
    target: "maximum_possible",
    reason: "Prioriser Attaque au maximum (scaleStat)",
    description: "Minnie scale sur Attaque - maximise cette stat avant tout"
  },
  {
    stat: "Damage Increase",              
    priority: 2,
    target: "maximum_possible",
    reason: "Dégâts optimaux après défense"
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
    "DamageIncrease": "30% +",
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
    "fullChaoticInfamy": {
      "name": "Full Chaotic Infamy",
      "frenchName": "Infamie chaotique complète",
      "availability": "LR",
      "setComposition": "8x Chaotic Infamy",
      "pieces": {
        "helmet": "Casque d'infamie chaotique",
        "chest": "Armure d'infamie chaotique",
        "gloves": "Gants d'infamie chaotique",
        "boots": "Bottes d'infamie chaotique",
        "necklace": "Collier d'infamie chaotique",
        "bracelet": "Bracelet d'infamie chaotique",
        "ring": "Bague d'infamie chaotique",
        "earrings": "Boucles d'oreilles d'infamie chaotique"
      },
      "mainStats": {
        "helmet": "Additional Defense",
        "chest": "Additional Defense",
        "gloves": "Additional Attack",
        "boots": "Critical Hit Damage",
        "necklace": "Additional Defense",
        "bracelet": "Wind Damage %",
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
    "newbie": "Minnie est un dps offensif buffant sa team en Atk.",
    "intermediate": "Scale sur Attaque = focus Additional Attaque. Général vs PvP/BdG !",
    "advanced": "2 builds : Hybride (Général), Full Chaotic (PvP/BdG).",
    "expert": "Curse&OHK/Outstanding pour le général, Chaotic Infamy pour BDG !"
  }
},
  "minnie": {
  "name": "Minnie",
  "element": "Dark",
  "class": "Assassin", 
  "grade": "SSR",
  "scaleStat": "Defense",

"optimizationPriority": [
  {
    stat: "Additional Defense",           
    priority: 1,
    target: "maximum_possible",
    reason: "Prioriser Defense au maximum (scaleStat)",
    description: "Minnie scale sur Defense - maximise cette stat avant tout"
  },
  {
    stat: "Damage Increase",              
    priority: 2,
    target: "maximum_possible",
    reason: "Dégâts optimaux après défense"
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
    "DamageIncrease": "30% +",
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
      "availability": "LR",
      "setComposition": "4x Iron Will + 4x Outstanding Ability",
      "pieces": {
        "helmet": "Casque de la volonté de fer",        // Iron Will
        "chest": "Armure de la volonté de fer",         // Iron Will
        "gloves": "Gants de la volonté de fer",         // Iron Will
        "boots": "Bottes de la volonté de fer",         // Iron Will
        "necklace": "Collier en obsidienne",            // Outstanding Ability
        "bracelet": "Bracelet en obsidienne",           // Outstanding Ability
        "ring": "Bague en obsidienne",                  // Outstanding Ability
        "earrings": "Boucles d'oreilles en obsidienne" // Outstanding Ability
      },
      "mainStats": {
        "helmet": "Additional Defense",
        "chest": "Additional Defense",  
        "gloves": "Additional Attack",
        "boots": "Critical Hit Damage",
        "necklace": "Additional Defense",
        "bracelet": "Wind Damage %",
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
        "chest": "Armure d'infamie chaotique",
        "gloves": "Gants d'infamie chaotique",
        "boots": "Bottes d'infamie chaotique",
        "necklace": "Collier d'infamie chaotique",
        "bracelet": "Bracelet d'infamie chaotique",
        "ring": "Bague d'infamie chaotique",
        "earrings": "Boucles d'oreilles d'infamie chaotique"
      },
      "mainStats": {
        "helmet": "Additional Defense",
        "chest": "Additional Defense",
        "gloves": "Additional Attack",
        "boots": "Critical Hit Damage",
        "necklace": "Additional Defense",
        "bracelet": "Wind Damage %",
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
    "newbie": "Minnie est un dps défensif avec 2 builds ! Commence par Iron Will/Outstanding.",
    "intermediate": "Scale sur Defense = focus Additional Defense. Général vs PvP/BdG !",
    "advanced": "2 builds : Hybride (Général), Full Chaotic (PvP/BdG).",
    "expert": "Iron Will/Outstanding pour le général, Chaotic Infamy pour tryhard !"
  }
},
    "yuqi": {
  "name": "Yuqi",
  "element": "fire",
  "class": "Tank", 
  "grade": "SSR",
  "scaleStat": "HP",

  "optimizationPriority": [
  {
    stat: "Additional HP",           
    priority: 1,
    target: "maximum_possible",
    reason: "Prioriser Defense au maximum (scaleStat)",
    description: "Niermann scale sur Defense - maximise cette stat avant tout"
  },
  {
    stat: "Damage Increase",              
    priority: 2,
    target: "maximum_possible",
    reason: "Dégâts optimaux après défense"
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
    "DamageIncrease": "30% +",
    "defensePenetration": "10% - 20%",
    "additionalHP": "Le plus possible",
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
        "name": "x4 Greed/ x4 Obsidian",
        "frenchName": "Avarice ardente",
        "availability": "LR",
        "setComposition": "Burning Greed (4), Outstanding Ability (Obsidian Set) (4)",
        "pieces": {
          "helmet": "Casque d'avarice ardente",
          "chest": "Armure d'avarice ardente",
          "gloves": "Gants d'avarice ardente",
          "boots": "Bottes d'avarice ardente",
          "necklace": "Collier en obsidienne",
          "bracelet": "Bracelet en obsidienne",
          "ring": "Bague en obsidienne", 
          "earrings": "Boucles d'oreilles en obsidienne"
        },
        "mainStats": {
          "helmet": "Additional HP",
          "chest": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage",
          "necklace": "Additional HP",
          "bracelet": "Wind Damage %",
          "ring": "Additional HP",
          "earrings": "Additional MP"
        }
      },
       "DesireGreed": {
        "name": "x4 Greed/ x4 Desire Chaotic",
        "frenchName": "Avarice ardente/ Désir Chaotic",
        "availability": "LR",
        "setComposition": "Burning Greed (4), Chaotic Desire (4)",
        "pieces": {
          "helmet": "Casque d'avarice ardente",
          "chest": "Armure d'avarice ardente",
          "gloves": "Gants d'avarice ardente",
          "boots": "Bottes d'avarice ardente",
          "necklace": "Collier du désir chaotique",
          "bracelet": "Bracelet du désir chaotique",
          "ring": "Bague du désir chaotique", 
          "earrings": "Boucles d'oreilles du désir chaotique"
        },
        "mainStats": {
          "helmet": "Additional HP",
          "chest": "Additional Defense",
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
      "newbie": "yuqi est un Tank HP. Priorise Additional HP au maximum !",
      "intermediate": "Scale sur HP = focus Additional HP, puis Damage Increase ou Def Pen.",
      "advanced": "Build simple et efficace - Goto est un mur HP avec du fire.",
      "expert": "Il buff également les skills grâce à son arme !"
    }
  },
  "jinah": {
  "name": "Jinah",
  "element": "Wind",
  "class": "Support", 
  "grade": "SSR",
  "scaleStat": "Defense",

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
    reason: "Dégâts optimaux après défense"
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
    "DamageIncrease": "30% +",
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
      "name": "Burning Curse/ Expert",
      "frenchName": "Malédiction/Expert",
      "availability": "LR",
      "setComposition": "Burning Curse (4), Expert (Beast Set) (4)",
      "pieces": {
        "helmet": "Casque de malédiction ardente",       
        "chest": "Armure de malédiction ardente",         
        "gloves": "Gants de malédiction ardente",        
        "boots": "Bottes de malédiction ardente",         
        "bracelet": "Bracelet d'expert",           
        "ring": "Bague d'expert",                  
        "earrings": "Boucles d'oreilles d'expert" 
      },
      "mainStats": {
        "helmet": "Additional Attack",
        "chest": "Additional Defense",  
        "gloves": "Additional Attack",
        "boots": "Critical Hit Damage",
        "necklace": "Additional HP",
        "bracelet": "Water Damage %",
        "ring": "Additional Attack",
        "earrings": "Additional MP"
      }
    },
    "burningCurseObsidian": {
      "name": "Burning Curse/Obsidian",
      "frenchName": "Malédiction/Obsidian",
      "availability": "LR",
      "setComposition": "Burning Curse (4), Outstanding Ability (Obsidian Set)",
      "pieces": {
        "helmet": "Casque de malédiction ardente",       
        "chest": "Armure de malédiction ardente",        
        "gloves": "Gants de malédiction ardente",         
        "necklace": "Collier en obsidienne",            // Outstanding Ability
        "bracelet": "Bracelet en obsidienne",           // Outstanding Ability
        "ring": "Bague en obsidienne",                  // Outstanding Ability
        "earrings": "Boucles d'oreilles en obsidienne" // Outstanding Ability
      },
      "mainStats": {
        "helmet": "Additional Attack",
        "chest": "Additional Defense",  
        "gloves": "Additional Attack",
        "boots": "Critical Hit Damage",
        "necklace": "Additional HP",
        "bracelet": "Water Damage %",
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
      "type": "Additional MP",
      "bonus": "Diminue le taux de récupération de PM de 15% et la Consommation de PM de 15% lors de l'utilisation d'une compétence"
    }
  },

  // 💡 CONSEILS BÉRU - KAISEL UPDATE
  "beruAdvice": {
    "newbie": "Jinah est la soeur de Sung.",
    "intermediate": "Elle scale sur la defense!",
    "advanced": "Elle peut se jouer full infamy en BDG ou guardian/obsidian.",
    "expert": "Elle outdps comme une reine !"
  }
},
    "shuhua": {
  "name": "Shuhua",
  "element": "Water",
  "class": "Assassin", 
  "grade": "SSR",
  "scaleStat": "Attack",

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
    reason: "Dégâts optimaux après défense"
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
    "DamageIncrease": "30% +",
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
      "name": "Burning Curse/ Expert",
      "frenchName": "Malédiction/Expert",
      "availability": "LR",
      "setComposition": "Burning Curse (4), Expert (Beast Set) (4)",
      "pieces": {
        "helmet": "Casque de malédiction ardente",       
        "chest": "Armure de malédiction ardente",         
        "gloves": "Gants de malédiction ardente",        
        "boots": "Bottes de malédiction ardente",         
        "bracelet": "Bracelet d'expert",           
        "ring": "Bague d'expert",                  
        "earrings": "Boucles d'oreilles d'expert" 
      },
      "mainStats": {
        "helmet": "Additional Attack",
        "chest": "Additional Defense",  
        "gloves": "Additional Attack",
        "boots": "Critical Hit Damage",
        "necklace": "Additional HP",
        "bracelet": "Water Damage %",
        "ring": "Additional Attack",
        "earrings": "Additional MP"
      }
    },
    "burningCurseObsidian": {
      "name": "Burning Curse/Obsidian",
      "frenchName": "Malédiction/Obsidian",
      "availability": "LR",
      "setComposition": "Burning Curse (4), Outstanding Ability (Obsidian Set)",
      "pieces": {
        "helmet": "Casque de malédiction ardente",       
        "chest": "Armure de malédiction ardente",        
        "gloves": "Gants de malédiction ardente",         
        "necklace": "Collier en obsidienne",            // Outstanding Ability
        "bracelet": "Bracelet en obsidienne",           // Outstanding Ability
        "ring": "Bague en obsidienne",                  // Outstanding Ability
        "earrings": "Boucles d'oreilles en obsidienne" // Outstanding Ability
      },
      "mainStats": {
        "helmet": "Additional Attack",
        "chest": "Additional Defense",  
        "gloves": "Additional Attack",
        "boots": "Critical Hit Damage",
        "necklace": "Additional HP",
        "bracelet": "Water Damage %",
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
      "type": "Additional MP",
      "bonus": "Diminue le taux de récupération de PM de 15% et la Consommation de PM de 15% lors de l'utilisation d'une compétence"
    }
  },

  // 💡 CONSEILS BÉRU - KAISEL UPDATE
  "beruAdvice": {
    "newbie": "Shuhua est beast sans poil.",
    "intermediate": "Elle scale sur l'attaque!",
    "advanced": "Elle se joue avec burning curse/obsidian.",
    "expert": "Elle peut se jouer avec expert à droite !"
  }
},
  "miyeon": {
  "name": "Miyeon",
  "element": "Light",
  "class": "Fighter", 
  "grade": "SSR",
  "scaleStat": "Defense",

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
    reason: "Dégâts optimaux après défense"
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
    "DamageIncrease": "30% +",
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
      "availability": "LR",
      "setComposition": "4x Iron Will + 4x Outstanding Ability",
      "pieces": {
        "helmet": "Casque de la volonté de fer",        // Iron Will
        "chest": "Armure de la volonté de fer",         // Iron Will
        "gloves": "Gants de la volonté de fer",         // Iron Will
        "boots": "Bottes de la volonté de fer",         // Iron Will
        "necklace": "Collier en obsidienne",            // Outstanding Ability
        "bracelet": "Bracelet en obsidienne",           // Outstanding Ability
        "ring": "Bague en obsidienne",                  // Outstanding Ability
        "earrings": "Boucles d'oreilles en obsidienne" // Outstanding Ability
      },
      "mainStats": {
        "helmet": "Additional Defense",
        "chest": "Additional Defense",  
        "gloves": "Additional Attack",
        "boots": "Critical Hit Damage",
        "necklace": "Additional Defense",
        "bracelet": "Wind Damage %",
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
        "chest": "Armure d'infamie chaotique",
        "gloves": "Gants d'infamie chaotique",
        "boots": "Bottes d'infamie chaotique",
        "necklace": "Collier d'infamie chaotique",
        "bracelet": "Bracelet d'infamie chaotique",
        "ring": "Bague d'infamie chaotique",
        "earrings": "Boucles d'oreilles d'infamie chaotique"
      },
      "mainStats": {
        "helmet": "Additional Defense",
        "chest": "Additional Defense",
        "gloves": "Additional Attack",
        "boots": "Critical Hit Damage",
        "necklace": "Additional Defense",
        "bracelet": "Wind Damage %",
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

  "niermann": {
  "name": "Lennart Niermann",
  "element": "Wind",
  "class": "Fighter", 
  "grade": "SSR",
  "scaleStat": "Defense",

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
    reason: "Dégâts optimaux après défense"
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
    "DamageIncrease": "30% +",
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
      "availability": "LR",
      "setComposition": " Iron Will (4), Outstanding Ability (Obsidian Set) (4)",
      "pieces": {
        "helmet": "Casque de la volonté de fer",        // Iron Will
        "chest": "Armure de la volonté de fer",         // Iron Will
        "gloves": "Gants de la volonté de fer",         // Iron Will
        "boots": "Bottes de la volonté de fer",         // Iron Will
        "necklace": "Collier en obsidienne",            // Outstanding Ability
        "bracelet": "Bracelet en obsidienne",           // Outstanding Ability
        "ring": "Bague en obsidienne",                  // Outstanding Ability
        "earrings": "Boucles d'oreilles en obsidienne" // Outstanding Ability
      },
      "mainStats": {
        "helmet": "Additional Defense",
        "chest": "Additional Defense",  
        "gloves": "Additional Attack",
        "boots": "Critical Hit Damage",
        "necklace": "Additional Defense",
        "bracelet": "Wind Damage %",
        "ring": "Additional Defense",
        "earrings": "Additional MP"
      }
    },
    "fullChaoticInfamy": {
      "name": "Full Chaotic Infamy",
      "frenchName": "Infamie chaotique complète",
      "availability": "LR",
      "setComposition": "Chaotic Infamy (8)",
      "pieces": {
        "helmet": "Casque d'infamie chaotique",
        "chest": "Armure d'infamie chaotique",
        "gloves": "Gants d'infamie chaotique",
        "boots": "Bottes d'infamie chaotique",
        "necklace": "Collier d'infamie chaotique",
        "bracelet": "Bracelet d'infamie chaotique",
        "ring": "Bague d'infamie chaotique",
        "earrings": "Boucles d'oreilles d'infamie chaotique"
      },
      "mainStats": {
        "helmet": "Additional Defense",
        "chest": "Additional Defense",
        "gloves": "Additional Attack",
        "boots": "Critical Hit Damage",
        "necklace": "Additional Defense",
        "bracelet": "Wind Damage %",
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
  "name": "Cha Hae-In Valkyrie",
  "element": "Water",
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
      description: "Chae scale sur Defense - maximise cette stat avant tout"
    },
    {
      stat: "Defense %",
      priority: 2,
      target: "maximum_possible",
      reason: "Prioriser Defense au maximum (scaleStat)",
      description: "Chae scale sur Defense - maximise cette stat avant tout"
    },
    {
      stat: "Damage Increase",
      priority: 3,
      target: "maximum_possible",
      reason: "Dégâts optimaux"
    },
    {
      stat: "Critical Hit Damage",
      priority: 4,
      target: "200%+",
      reason: "Dégâts critiques optimaux"
    },
    {
      stat: "Critical Hit Rate",
      priority: 5,
      target: 8000, // 80% pour DPS standard
      reason: "Taux critique pour DPS"
    },
    {
      stat: "Defense Penetration",
      priority: 6,
      target: "10-20%",
      reason: "Pénétration pour efficacité"
    }
  ],

  // 📊 STATS RECOMMANDÉES
  "recommendedStats": {
    "criticalHitRate": "80%",
    "criticalHitDamage": "200% - 210%",
    "DamageIncrease": "30% +",
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
      "name": "Hybrid Burning/Chaotic+Outstanding",
      "frenchName": "Hybride Malédiction/Infamie",
      "availability": "LR",
      "setComposition": "Burning Curse (2), Chaotic Infamy (2), Outstanding Ability (Obsidian Set) (4)",
      "pieces": {
        "helmet": "Casque de malédiction ardente", // Burning Curse
        "chest": "Armure de malédiction ardente",  // Burning Curse
        "gloves": "Gants d'infamie chaotique",     // Chaotic Infamy
        "boots": "Bottes d'infamie chaotique",    // Chaotic Infamy
        "necklace": "Collier en obsidienne",      // Outstanding Ability
        "bracelet": "Bracelet en obsidienne",     // Outstanding Ability
        "ring": "Bague en obsidienne",            // Outstanding Ability
        "earrings": "Boucles d'oreilles en obsidienne" // Outstanding Ability
      },
      "mainStats": {
        "helmet": "Additional Defense",
        "chest": "Additional Defense",
        "gloves": "Additional Attack", 
        "boots": "Critical Hit Damage",
        "necklace": "Additional HP",
        "bracelet": "Water Damage %",
        "ring": "Additional Defense",
        "earrings": "Additional MP"
      }
    },
    "hybridChaoticOutstanding": {
      "name": "Hybrid Chaotic/Outstanding",
      "frenchName": "Hybride Infamie/Remarquable", 
      "availability": "LR",
      "setComposition": "Chaotic Infamy (4), Outstanding Ability (Obsidian Set) (4)",
      "pieces": {
        "helmet": "Casque d'infamie chaotique",   // Chaotic Infamy
        "chest": "Armure d'infamie chaotique",    // Chaotic Infamy
        "gloves": "Gants d'infamie chaotique",    // Chaotic Infamy
        "boots": "Bottes d'infamie chaotique",    // Chaotic Infamy
        "necklace": "Collier en obsidienne",      // Outstanding Ability
        "bracelet": "Bracelet en obsidienne",     // Outstanding Ability
        "ring": "Bague en obsidienne",            // Outstanding Ability
        "earrings": "Boucles d'oreilles en obsidienne" // Outstanding Ability
      },
      "mainStats": {
        "helmet": "Additional Defense",
        "chest": "Additional Defense",
        "gloves": "Additional Attack", 
        "boots": "Critical Hit Damage",
        "necklace": "Additional HP",
        "bracelet": "Light Damage %",
        "ring": "Additional Defense",
        "earrings": "Additional MP"
      }
    },
    "fullChaoticInfamy": {
      "name": "Full Chaotic Infamy",
      "frenchName": "Infamie chaotique complète",
      "availability": "LR",
      "setComposition": "Chaotic Infamy (8)",
      "pieces": {
        "helmet": "Casque d'infamie chaotique",
        "chest": "Armure d'infamie chaotique",
        "gloves": "Gants d'infamie chaotique",
        "boots": "Bottes d'infamie chaotique",
        "necklace": "Collier d'infamie chaotique",
        "bracelet": "Bracelet d'infamie chaotique",
        "ring": "Bague d'infamie chaotique",
        "earrings": "Boucles d'oreilles d'infamie chaotique"
      },
      "mainStats": {
        "helmet": "Additional Defense",
        "chest": "Additional Defense",
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
      "setComposition": "Burning Curse (8)",
      "pieces": {
        "helmet": "Casque de malédiction ardente",
        "chest": "Armure de malédiction ardente",
        "gloves": "Gants de malédiction ardente", 
        "boots": "Bottes de malédiction ardente",
        "necklace": "Collier de malédiction ardente",
        "bracelet": "Bracelet de malédiction ardente",
        "ring": "Bague de malédiction ardente", 
        "earrings": "Boucles d'oreilles de malédiction ardente"
      },
      "mainStats": {
        "helmet": "Additional Defense",
        "chest": "Additional Defense",
        "gloves": "Additional Attack", 
        "boots": "Critical Hit Damage",
        "necklace": "Additional HP",
        "bracelet": "Light Damage %",
        "ring": "Additional Defense",
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
    "intermediate": "Scale sur Defense = focus Additional Defense. Choisis ton build selon le contenu !",
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
      stat: "Attack %",
      priority: 2,
      target: "maximum_possible",
      reason: "Prioriser Attack au maximum (scaleStat)",
      description: "Kanae scale sur Attack - maximise cette stat avant tout"
    },
    {
      stat: "Damage Increase",
      priority: 3,
      target: "maximum_possible",
      reason: "Dégâts optimaux"
    },
    {
      stat: "Critical Hit Damage",
      priority: 4,
      target: "200%+",
      reason: "Dégâts critiques optimaux"
    },
    {
      stat: "Critical Hit Rate",
      priority: 5,
      target: 12000, // 120% pour lead crit du groupe !
      reason: "Kanae doit lead le crit du groupe (10000-12000)"
    },
    {
      stat: "Defense Penetration",
      priority: 6,
      target: "10-20%",
      reason: "Pénétration pour efficacité"
    }
  ],

  // 📊 STATS RECOMMANDÉES
  "recommendedStats": {
    "criticalHitRate": "100-120%", // Spécial Kanae !
    "criticalHitDamage": "200% - 210%",
    "DamageIncrease": "30% +",
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
      "name": "x2 One-Hit Kill x2 Burning cursed/x4 Expert",
      "frenchName": "Build assassin hybride",
      "availability": "LR+",
      "setComposition": "One-hit Kill (Almighty Shaman Set) (2), Burning Curse (2), Expert (Beast Set) (4)",
      "pieces": {
        "helmet": "Casque de malédiction ardente",     // Burning Curse
        "chest": "Armure de malédiction ardente",      // Burning Curse
        "gloves": "Gants de frappe unique",            // One-hit Kill ⚠️ NOMMAGE À STANDARDISER
        "boots": "Bottes de frappe unique",            // One-hit Kill ⚠️ NOMMAGE À STANDARDISER
        "necklace": "Collier d'expert",                // Expert
        "bracelet": "Bracelet d'expert",               // Expert
        "ring": "Bague d'expert",                      // Expert
        "earrings": "Boucles d'oreilles d'expert"     // Expert
      },
      "mainStats": {
        "helmet": "Additional Attack",
        "chest": "Additional Defense",
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
        "chest": "Robe de grand enchanteur",
        "gloves": "Gants de malédiction ardente",
        "boots": "Bottes de malédiction ardente",
        "necklace": "Collier de bête",
        "bracelet": "Bracelet de bête",
        "ring": "Bague de bête",
        "earrings": "Boucles d'oreilles de bête"
      },
      "mainStats": {
        "helmet": "Additional Attack",
        "chest": "Additional Defense",
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

  "frieren": {
  "name": "Frieren",
  "element": "Water",
  "class": "Support",
  "grade": "SSR",
  "scaleStat": "Defense",

  "optimizationPriority": [
  {
    stat: "Additional Defense",
    priority: 1,
    target: "maximum_possible",
    reason: "Prioriser Defense au maximum (scaleStat)",
    description: "Frieren scale sur Defense - maximise cette stat avant tout"
  },
  {
    stat: "Defense %",
    priority: 2,
    target: "maximum_possible",
    reason: "Prioriser Defense % pour scaling optimal",
    description: "Defense % booste le scaling de Frieren"
  },
  {
    stat: "Damage Increase",
    priority: 3,
    target: "maximum_possible",
    reason: "Dégâts optimaux"
  },
  {
    stat: "Critical Hit Damage",
    priority: 4,
    target: "200%+",
    reason: "Dégâts critiques optimaux"
  },
  {
    stat: "Critical Hit Rate",
    priority: 5,
    target: 8000,
    reason: "Taux critique optimal pour support"
  },
  {
    stat: "Defense Penetration",
    priority: 6,
    target: "15-25%",
    reason: "Pénétration pour efficacité"
  }
],

  // 📊 STATS RECOMMANDÉES
  "recommendedStats": {
    "criticalHitRate": "80-100%",
    "criticalHitDamage": "180% - 200%",
    "DamageIncrease": "30% +",
    "defensePenetration": "15% - 25%",
    "additionalDefense": "Le plus possible",
    "additionalAttack": null,
    "precision": null,
    "damageReduction": null,
    "healingReceived": null,
    "mpRecoveryRate": null,
    "mpCostReduction": null
  },

  // 🎮 MODES DE JEU & SETS - Configuration Frieren
  "gameModes": {
    "general": {
      "recommendedSet": "Guardian/Sylph Build",
      "priority": "Support défensif Water",
      "description": "Build support défensif avec Guardian + Sylph",
      "availability": "LR",
      "setComposition": "4x Guardian + 4x Sylph"
    },
    "pod": {
      "recommendedSet": "Guardian/Sylph Build",
      "priority": "PvP support Water",
      "description": "Build PvP support avec défense maximale",
      "availability": "LR",
      "setComposition": "4x Guardian + 4x Sylph"
    },
    "bdg": {
      "recommendedSet": "Guardian/Sylph Build",
      "priority": "Guild boss support",
      "description": "Build boss de guilde support défensif",
      "availability": "LR",
      "setComposition": "4x Guardian + 4x Sylph"
    }
  },

  // ⚔️ SETS D'ARTEFACTS DÉTAILLÉS
  "artifactSets": {
    "guardianSylphBuild": {
      "name": "Guardian/Sylph",
      "frenchName": "Gardien/Sylphe",
      "availability": "LR",
      "setComposition": "Guardian (4), Sylph (4)",
      "pieces": {
        "helmet": "Casque de gardien",
        "chest": "Armure de gardien",
        "gloves": "Gants de gardien",
        "boots": "Bottes de gardien",
        "necklace": "Collier de sylphe",
        "bracelet": "Bracelet de sylphe",
        "ring": "Bague de sylphe",
        "earrings": "Boucles d'oreilles de sylphe"
      },
      "mainStats": {
        "helmet": "Additional Defense",
        "chest": "Additional Defense",
        "gloves": "Additional Defense",
        "boots": "Critical Hit Damage",
        "necklace": "Additional HP",
        "bracelet": "Water Damage %",
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

  // 💡 CONSEILS BÉRU - Frieren
  "beruAdvice": {
    "newbie": "Frieren est un support défensif Water de Frieren: Beyond Journey's End !",
    "intermediate": "Elle scale sur Defense ! Build 4x Guardian (gauche) + 4x Sylph (droite) !",
    "advanced": "Maximise Defense % et maintiens 80-100% crit rate pour damage optimal !",
    "expert": "Optimise les substats Defense % sur tous les artefacts pour scaling maximum !"
  }
},
  "stark": {
  "name": "Stark",
  "element": "Fire",
  "class": "Break",
  "grade": "SSR",
  "scaleStat": "HP",

  "optimizationPriority": [
  {
    stat: "Additional HP",
    priority: 1,
    target: "maximum_possible",
    reason: "Prioriser HP au maximum (scaleStat)",
    description: "Stark scale sur HP - maximise cette stat avant tout"
  },
  {
    stat: "HP %",
    priority: 2,
    target: "maximum_possible",
    reason: "Prioriser HP % pour scaling optimal",
    description: "HP % booste le scaling de Stark"
  },
  {
    stat: "Damage Increase",
    priority: 3,
    target: "maximum_possible",
    reason: "Dégâts optimaux"
  },
  {
    stat: "Critical Hit Damage",
    priority: 4,
    target: "200%+",
    reason: "Dégâts critiques optimaux"
  },
  {
    stat: "Critical Hit Rate",
    priority: 5,
    target: 8000,
    reason: "Taux critique optimal pour break"
  },
  {
    stat: "Defense Penetration",
    priority: 6,
    target: "15-25%",
    reason: "Pénétration pour efficacité"
  }
],

  // 📊 STATS RECOMMANDÉES
  "recommendedStats": {
    "criticalHitRate": "80-100%",
    "criticalHitDamage": "180% - 200%",
    "DamageIncrease": "30% +",
    "defensePenetration": "15% - 25%",
    "additionalDefense": null,
    "additionalAttack": null,
    "additionalHP": "Le plus possible",
    "precision": null,
    "damageReduction": null,
    "healingReceived": null,
    "mpRecoveryRate": null,
    "mpCostReduction": null
  },

  // 🎮 MODES DE JEU & SETS
  "gameModes": {
    "general": {
      "recommendedSet": "Armed/Obsidian Build",
      "priority": "Break Fire avec HP scaling",
      "description": "Build break pour Portail avec Armed + Obsidian",
      "availability": "LR",
      "setComposition": "4x Armed + 4x Obsidian"
    },
    "pod": {
      "recommendedSet": "Armed/Obsidian Build",
      "priority": "PvP break Fire",
      "description": "Build PvP break avec HP maximum",
      "availability": "LR",
      "setComposition": "4x Armed + 4x Obsidian"
    },
    "bdg": {
      "recommendedSet": "Full Desire",
      "priority": "Guild boss break",
      "description": "Build boss de guilde break avec Desire",
      "availability": "LR",
      "setComposition": "8x Desire"
    }
  },

  // ⚔️ SETS D'ARTEFACTS DÉTAILLÉS
  "artifactSets": {
    "armedObsidianBuild": {
      "name": "Armed/Obsidian",
      "frenchName": "Armé/Obsidienne",
      "availability": "LR",
      "setComposition": "Armed (4), Obsidian (4)",
      "pieces": {
        "helmet": "Casque armé",
        "chest": "Armure armée",
        "gloves": "Gants armés",
        "boots": "Bottes armées",
        "necklace": "Collier d'obsidienne",
        "bracelet": "Bracelet d'obsidienne",
        "ring": "Bague d'obsidienne",
        "earrings": "Boucles d'oreilles d'obsidienne"
      },
      "mainStats": {
        "helmet": "Additional HP",
        "chest": "Additional Defense",
        "gloves": "Additional Attack",
        "boots": "Critical Hit Damage",
        "necklace": "Additional HP",
        "bracelet": "Fire Damage %",
        "ring": "Additional HP",
        "earrings": "Additional MP"
      }
    },
    "fullDesire": {
      "name": "Full Desire",
      "frenchName": "Désir complet",
      "availability": "LR",
      "setComposition": "8x Desire",
      "pieces": {
        "helmet": "Casque du désir",
        "chest": "Armure du désir",
        "gloves": "Gants du désir",
        "boots": "Bottes du désir",
        "necklace": "Collier du désir",
        "bracelet": "Bracelet du désir",
        "ring": "Bague du désir",
        "earrings": "Boucles d'oreilles du désir"
      },
      "mainStats": {
        "helmet": "Additional HP",
        "chest": "Additional Defense",
        "gloves": "Additional Attack",
        "boots": "Critical Hit Damage",
        "necklace": "Additional HP",
        "bracelet": "Fire Damage %",
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
    "newbie": "Stark est un Break Fire HP scaling de Frieren: Beyond Journey's End !",
    "intermediate": "Il scale sur HP ! Build Armed/Obsidian (Portail) ou Full Desire (BDG) !",
    "advanced": "Maximise HP % et maintiens 80-100% crit rate pour damage optimal !",
    "expert": "Optimise les substats HP % sur tous les artefacts pour scaling maximum !"
  }
},
  "fern": {
  "name": "Fern",
  "element": "Fire",
  "class": "DPS",
  "grade": "SSR",
  "scaleStat": "Attack",

  "optimizationPriority": [
  {
    stat: "Additional Attack",
    priority: 1,
    target: "maximum_possible",
    reason: "Prioriser Attack au maximum (scaleStat)",
    description: "Fern scale sur Attack - maximise cette stat avant tout"
  },
  {
    stat: "Attack %",
    priority: 2,
    target: "maximum_possible",
    reason: "Prioriser Attack % pour scaling optimal",
    description: "Attack % booste le scaling de Fern"
  },
  {
    stat: "Damage Increase",
    priority: 3,
    target: "maximum_possible",
    reason: "Dégâts optimaux"
  },
  {
    stat: "Critical Hit Damage",
    priority: 4,
    target: "200%+",
    reason: "Dégâts critiques optimaux"
  },
  {
    stat: "Critical Hit Rate",
    priority: 5,
    target: 10000,
    reason: "Taux critique optimal pour DPS"
  },
  {
    stat: "Defense Penetration",
    priority: 6,
    target: "15-25%",
    reason: "Pénétration pour efficacité"
  }
],

  // 📊 STATS RECOMMANDÉES
  "recommendedStats": {
    "criticalHitRate": "90-110%",
    "criticalHitDamage": "200% - 220%",
    "DamageIncrease": "35% +",
    "defensePenetration": "15% - 25%",
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
      "recommendedSet": "Full Chaotic Infamy",
      "priority": "DPS Fire avec Attack scaling",
      "description": "Build DPS général avec Chaotic Infamy",
      "availability": "LR",
      "setComposition": "8x Chaotic Infamy"
    },
    "pod": {
      "recommendedSet": "Full Chaotic Infamy",
      "priority": "PvP DPS Fire",
      "description": "Build PvP DPS avec Attack maximum",
      "availability": "LR",
      "setComposition": "8x Chaotic Infamy"
    },
    "bdg": {
      "recommendedSet": "Armed/Expert Build",
      "priority": "Guild boss DPS",
      "description": "Build boss de guilde DPS avec Armed + Expert",
      "availability": "LR",
      "setComposition": "4x Armed + 4x Expert"
    }
  },

  // ⚔️ SETS D'ARTEFACTS DÉTAILLÉS
  "artifactSets": {
    "fullChaoticInfamy": {
      "name": "Full Chaotic Infamy",
      "frenchName": "Infamie chaotique complète",
      "availability": "LR",
      "setComposition": "8x Chaotic Infamy",
      "pieces": {
        "helmet": "Casque d'infamie chaotique",
        "chest": "Armure d'infamie chaotique",
        "gloves": "Gants d'infamie chaotique",
        "boots": "Bottes d'infamie chaotique",
        "necklace": "Collier d'infamie chaotique",
        "bracelet": "Bracelet d'infamie chaotique",
        "ring": "Bague d'infamie chaotique",
        "earrings": "Boucles d'oreilles d'infamie chaotique"
      },
      "mainStats": {
        "helmet": "Additional Attack",
        "chest": "Additional Defense",
        "gloves": "Additional Attack",
        "boots": "Critical Hit Damage",
        "necklace": "Additional HP",
        "bracelet": "Fire Damage %",
        "ring": "Additional Attack",
        "earrings": "Additional MP"
      }
    },
    "armedExpertBuild": {
      "name": "Armed/Expert",
      "frenchName": "Armé/Expert",
      "availability": "LR",
      "setComposition": "Armed (4), Expert (4)",
      "pieces": {
        "helmet": "Casque armé",
        "chest": "Armure armée",
        "gloves": "Gants armés",
        "boots": "Bottes armées",
        "necklace": "Collier d'expert",
        "bracelet": "Bracelet d'expert",
        "ring": "Bague d'expert",
        "earrings": "Boucles d'oreilles d'expert"
      },
      "mainStats": {
        "helmet": "Additional Attack",
        "chest": "Additional Defense",
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
      "type": "Additional HP",
      "bonus": "Diminue le Taux de récupération de PM de 10% et la Consommation de PM de 12% lors de l'utilisation d'une compétence"
    }
  },

  // 💡 CONSEILS BÉRU
  "beruAdvice": {
    "newbie": "Fern est un DPS Fire Attack scaling de Frieren: Beyond Journey's End !",
    "intermediate": "Elle scale sur Attack ! Build Chaotic Infamy (général) ou Armed/Expert (BDG) !",
    "advanced": "Maximise Attack % et maintiens 90-110% crit rate pour damage optimal !",
    "expert": "Optimise les substats Attack % sur tous les artefacts pour scaling maximum !"
  }
},

  "reed": {
  "name": "Christopher Reed",
  "element": "Fire",
  "class": "Infusion",
  "grade": "SSR",
  "scaleStat": "Defense",

  "optimizationPriority": [
  {
    stat: "Additional Defense",
    priority: 1,
    target: "maximum_possible",
    reason: "Prioriser Defense au maximum (scaleStat)",
    description: "Reed scale sur Defense - maximise cette stat avant tout"
  },
  {
    stat: "Defense %",
    priority: 2,
    target: "maximum_possible",
    reason: "Prioriser Defense % pour scaling optimal",
    description: "Defense % booste le scaling de Reed"
  },
  {
    stat: "Damage Increase",
    priority: 3,
    target: "maximum_possible",
    reason: "Dégâts optimaux"
  },
  {
    stat: "Critical Hit Damage",
    priority: 4,
    target: "200%+",
    reason: "Dégâts critiques optimaux"
  },
  {
    stat: "Critical Hit Rate",
    priority: 5,
    target: 8000,
    reason: "Taux critique optimal pour Infusion"
  },
  {
    stat: "Defense Penetration",
    priority: 6,
    target: "15-25%",
    reason: "Pénétration pour efficacité"
  }
],

  // 📊 STATS RECOMMANDÉES
  "recommendedStats": {
    "criticalHitRate": "80-100%",
    "criticalHitDamage": "180% - 200%",
    "DamageIncrease": "30% +",
    "defensePenetration": "15% - 25%",
    "defense": "Maximum possible"
  },

  // 🎮 MODES DE JEU & SETS
  "gameModes": {
    "general": {
      "recommendedSet": "Guardian/Sylph Build",
      "priority": "Infusion Fire Defense-scaling",
      "description": "Build Infusion avec Guardian + Sylph",
      "availability": "LR",
      "setComposition": "4x Guardian + 4x Sylph"
    },
    "pod": {
      "recommendedSet": "Guardian/Sylph Build",
      "priority": "PvP Infusion Fire",
      "description": "Build PvP Infusion avec Defense maximum",
      "availability": "LR",
      "setComposition": "4x Guardian + 4x Sylph"
    },
    "bdg": {
      "recommendedSet": "Guardian/Sylph Build",
      "priority": "Guild boss Infusion",
      "description": "Build boss de guilde Infusion avec Guardian + Sylph",
      "availability": "LR",
      "setComposition": "4x Guardian + 4x Sylph"
    }
  },

  // ⚔️ SETS D'ARTEFACTS DÉTAILLÉS
  "artifactSets": {
    "guardianSylph": {
      "name": "Guardian/Sylph Build",
      "frenchName": "Build Gardien/Sylphe",
      "availability": "LR",
      "setComposition": "4x Guardian + 4x Sylph",
      "pieces": {
        "helmet": "Casque du gardien",
        "chest": "Armure du gardien",
        "gloves": "Gants du gardien",
        "boots": "Bottes du gardien",
        "necklace": "Collier sylphe",
        "bracelet": "Bracelet sylphe",
        "ring": "Anneau sylphe",
        "earrings": "Boucles sylphe"
      },
      "mainStats": {
        "helmet": "Defense %",
        "chest": "Defense %",
        "gloves": "Defense %",
        "boots": "Defense %",
        "necklace": "Critical Hit Damage",
        "bracelet": "Defense %",
        "ring": "Defense %",
        "earrings": "Defense %"
      }
    }
  },

  // 🧪 NOYAUX RECOMMANDÉS
  "recommendedCores": {
    "offensive": {
      "name": "Trompette du Démon Anonyme",
      "type": "Additional Defense",
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
    "newbie": "Christopher Reed est un Infusion Fire Defense-scaling !",
    "intermediate": "Il scale sur Defense ! Build Guardian + Sylph pour maximiser !",
    "advanced": "Maximise Defense % et maintiens 80-100% crit rate pour damage optimal !",
    "expert": "Optimise les substats Defense % sur tous les artefacts pour scaling maximum !"
  }
},

  "laura": {
  "name": "Laura",
  "element": "Light",
  "class": "Support",
  "grade": "SSR",
  "scaleStat": "Attack",

  "optimizationPriority": [
  {
    stat: "Additional Attack",
    priority: 1,
    target: "maximum_possible",
    reason: "Prioriser Attack au maximum (scaleStat)",
    description: "Laura scale sur Attack - maximise cette stat avant tout"
  },
  {
    stat: "Attack %",
    priority: 2,
    target: "maximum_possible",
    reason: "Prioriser Attack % pour scaling optimal",
    description: "Attack % booste le scaling de Laura"
  },
  {
    stat: "Damage Increase",
    priority: 3,
    target: "maximum_possible",
    reason: "Dégâts optimaux"
  },
  {
    stat: "Critical Hit Damage",
    priority: 4,
    target: "200%+",
    reason: "Dégâts critiques optimaux"
  },
  {
    stat: "Critical Hit Rate",
    priority: 5,
    target: 10000,
    reason: "Taux critique optimal pour Support"
  },
  {
    stat: "Defense Penetration",
    priority: 6,
    target: "15-25%",
    reason: "Pénétration pour efficacité"
  }
],

  // 📊 STATS RECOMMANDÉES
  "recommendedStats": {
    "criticalHitRate": "85-100%",
    "criticalHitDamage": "180% - 200%",
    "DamageIncrease": "30% +",
    "defensePenetration": "15% - 25%",
    "additionalAttack": "Le plus possible"
  },

  // 🎮 MODES DE JEU & SETS
  "gameModes": {
    "general": {
      "recommendedSet": "Angel/Chaotic Wish Build",
      "priority": "Support Light Attack-scaling",
      "description": "Build Support avec Angel + Chaotic Wish",
      "availability": "LR",
      "setComposition": "4x Angel + 4x Chaotic Wish"
    },
    "pod": {
      "recommendedSet": "Angel/Chaotic Wish Build",
      "priority": "PvP Support Light",
      "description": "Build PvP Support avec Attack maximum",
      "availability": "LR",
      "setComposition": "4x Angel + 4x Chaotic Wish"
    },
    "bdg": {
      "recommendedSet": "Armed/Expert Build",
      "priority": "Guild boss Support",
      "description": "Build boss de guilde Support avec Armed + Expert",
      "availability": "LR",
      "setComposition": "4x Armed + 4x Expert"
    }
  },

  // ⚔️ SETS D'ARTEFACTS DÉTAILLÉS
  "artifactSets": {
    "angelChaoticWish": {
      "name": "Angel/Chaotic Wish Build",
      "frenchName": "Build Ange/Voeu Chaotique",
      "availability": "LR",
      "setComposition": "4x Angel + 4x Chaotic Wish",
      "pieces": {
        "helmet": "Casque angélique",
        "chest": "Armure angélique",
        "gloves": "Gants angéliques",
        "boots": "Bottes angéliques",
        "necklace": "Collier du voeu chaotique",
        "bracelet": "Bracelet du voeu chaotique",
        "ring": "Anneau du voeu chaotique",
        "earrings": "Boucles du voeu chaotique"
      },
      "mainStats": {
        "helmet": "Attack %",
        "chest": "Attack %",
        "gloves": "Attack %",
        "boots": "Attack %",
        "necklace": "Critical Hit Damage",
        "bracelet": "Attack %",
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

  // 💡 CONSEILS BÉRU
  "beruAdvice": {
    "newbie": "Laura est un Support Light Attack-scaling !",
    "intermediate": "Elle scale sur Attack ! Build Angel + Chaotic Wish (général) ou Armed/Expert (BDG) !",
    "advanced": "Maximise Attack % et maintiens 85-100% crit rate pour support optimal !",
    "expert": "Optimise les substats Attack % sur tous les artefacts pour scaling maximum !"
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
      "DamageIncrease": "30% +",
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
          "chest": "Armure du désir chaotique",
          "gloves": "Gants du désir chaotique", 
          "boots": "Bottes du désir chaotique",
          "necklace": "Collier du désir chaotique",
          "bracelet": "Bracelet du désir chaotique",
          "ring": "Bague du désir chaotique", 
          "earrings": "Boucles d'oreilles du désir chaotique"
        },
        "mainStats": {
          "helmet": "Additional HP",
          "chest": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage",
          "necklace": "Additional HP",
          "bracelet": "Water Damage %",
          "ring": "Additional HP",
          "earrings": "Additional MP"
        }
      },
      "burningGreed": {
        "name": "x4 Greed/x4 Desire Chaotic",
        "frenchName": "Avarice ardente",
        "availability": "LR",
        "pieces": {
          "helmet": "Casque d'avarice ardente",
          "chest": "Armure d'avarice ardente",
          "gloves": "Gants d'avarice ardente", 
          "boots": "Bottes d'avarice ardente",
          "necklace": "Collier du désir chaotique",
          "bracelet": "Bracelet du désir chaotique",
          "ring": "Bague du désir chaotique", 
          "earrings": "Boucles d'oreilles du désir chaotique"
        },
        "mainStats": {
          "helmet": "Additional HP",
          "chest": "Additional Defense",
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
      "DamageIncrease": "30% +",
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
        "name": "x4 Greed/ x4 Obsidian",
        "frenchName": "Avarice ardente",
        "availability": "LR",
        "setComposition": "Burning Greed (4), Outstanding Ability (Obsidian Set) (4)",
        "pieces": {
          "helmet": "Casque d'avarice ardente",
          "chest": "Armure d'avarice ardente",
          "gloves": "Gants d'avarice ardente",
          "boots": "Bottes d'avarice ardente",
          "necklace": "Collier en obsidienne",
          "bracelet": "Bracelet en obsidienne",
          "ring": "Bague en obsidienne", 
          "earrings": "Boucles d'oreilles en obsidienne"
        },
        "mainStats": {
          "helmet": "Additional HP",
          "chest": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage",
          "necklace": "Additional HP",
          "bracelet": "Wind Damage %",
          "ring": "Additional HP",
          "earrings": "Additional MP"
        }
      },
       "DesireGreed": {
        "name": "x4 Greed/ x4 Desire Chaotic",
        "frenchName": "Avarice ardente/ Désir Chaotic",
        "availability": "LR",
        "setComposition": "Burning Greed (4), Chaotic Desire (4)",
        "pieces": {
          "helmet": "Casque d'avarice ardente",
          "chest": "Armure d'avarice ardente",
          "gloves": "Gants d'avarice ardente",
          "boots": "Bottes d'avarice ardente",
          "necklace": "Collier du désir chaotique",
          "bracelet": "Bracelet du désir chaotique",
          "ring": "Bague du désir chaotique", 
          "earrings": "Boucles d'oreilles du désir chaotique"
        },
        "mainStats": {
          "helmet": "Additional HP",
          "chest": "Additional Defense",
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
      "DamageIncrease": "30% +",
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
        "name": "x4 Burning Greed",
        "frenchName": "Avarice ardente",
        "availability": "LR",
        "pieces": {
          "helmet": "Casque d'avarice ardente",
          "chest": "Armure d'avarice ardente",
          "gloves": "Gants d'avarice ardente", 
          "boots": "Bottes d'avarice ardente",
          "necklace": "Collier d'avarice ardente",
          "bracelet": "Bracelet d'avarice ardente",
          "ring": "Bague d'avarice ardente", 
          "earrings": "Boucles d'oreilles d'avarice ardente"
        },
        "mainStats": {
          "helmet": "Additional Attack",
          "chest": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage",
          "necklace": "Additional HP",
          "bracelet": "Fire Damage %",
          "ring": "Additional Attack",
          "earrings": "Additional MP"
        }
      },
      "chaoticDesire": {
        "name": "x8 Chaotic Desire",
        "frenchName": "Désir chaotique",
        "availability": "LR",
        "pieces": {
          "helmet": "Casque du désir chaotique",
          "chest": "Armure du désir chaotique",
          "gloves": "Gants du désir chaotique", 
          "boots": "Bottes du désir chaotique",
          "necklace": "Collier d'avarice ardente",
          "bracelet": "Bracelet d'avarice ardente",
          "ring": "Bague d'avarice ardente", 
          "earrings": "Boucles d'oreilles d'avarice ardente"
        },
        "mainStats": {
          "helmet": "Additional Attack",
          "chest": "Additional Defense",
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
      "DamageIncrease": "30% +",
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
          "chest": "Robe de grand enchanteur",
          "gloves": "Gants de grand enchanteur", 
          "boots": "Bottes de grand enchanteur",
          "necklace": "Collier de péridot",
          "bracelet": "Bracelet de péridot",
          "ring": "Bague de péridot", 
          "earrings": "Boucles d'oreilles de péridot"
        },
        "mainStats": {
          "helmet": "Additional HP",
          "chest": "Additional Defense",
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
          "chest": "Armure de garde du palais",
          "gloves": "Gants de garde du palais", 
          "boots": "Bottes de garde du palais",
          "necklace": "Collier de péridot",
          "bracelet": "Bracelet de péridot",
          "ring": "Bague de péridot", 
          "earrings": "Boucles d'oreilles de péridot"
        },
        "mainStats": {
          "helmet": "Additional HP",
          "chest": "Additional Defense",
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
          "chest": "Armure de bénédiction ardente",
          "gloves": "Gants de bénédiction ardente", 
          "boots": "Bottes de bénédiction ardente",
          "necklace": "Collier de bénédiction ardente",
          "bracelet": "Bracelet de bénédiction ardente",
          "ring": "Bague de bénédiction ardente", 
          "earrings": "Boucles d'oreilles de bénédiction ardente"
        },
        "mainStats": {
          "helmet": "Additional HP",
          "chest": "Additional Defense",
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
      "DamageIncrease": "30% +",
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
        "name": "x4 Iron Will/ x4 Obsidian",
        "frenchName": "Volonté de fer",
        "availability": "L",
        "pieces": {
          "helmet": "Casque de la volonté de fer",
          "chest": "Armure de la volonté de fer",
          "gloves": "Gants de la volonté de fer", 
          "boots": "Bottes de la volonté de fer",
          "necklace": "Collier en obsidienne",
          "bracelet": "Bracelet en obsidienne",
          "ring": "Bague en obsidienne", 
          "earrings": "Boucles d'oreilles en obsidienne"
        },
        "mainStats": {
          "helmet": "Additional Defense",
          "chest": "Additional Defense",
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
      "DamageIncrease": "Le plus possible",
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
          "chest": "Armure de garde du palais",
          "gloves": "Gants de garde du palais", 
          "boots": "Bottes de garde du palais",
          "necklace": "Collier de péridot",
          "bracelet": "Bracelet en péridot",
          "ring": "Bague en péridot", 
          "earrings": "Boucles d'oreilles en péridot"
        },
        "mainStats": {
          "helmet": "Additional Attack",
          "chest": "Additional Defense",
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
          "chest": "Armure de bénédiction ardente",
          "gloves": "Gants de bénédiction ardente", 
          "boots": "Bottes de bénédiction ardente",
          "necklace": "Collier de bénédiction ardente",
          "bracelet": "Bracelet de bénédiction ardente",
          "ring": "Bague de bénédiction ardente", 
          "earrings": "Boucles d'oreilles de bénédiction ardente"
        },
        "mainStats": {
          "helmet": "Additional Attack",
          "chest": "Additional Defense",
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
      "DamageIncrease": "30% +",
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
          "chest": "Armure de garde du palais",
          "gloves": "Gants de garde du palais", 
          "boots": "Bottes de garde du palais",
          "necklace": "Collier de péridot",
          "bracelet": "Bracelet en péridot",
          "ring": "Bague en péridot", 
          "earrings": "Boucles d'oreilles en péridot"
        },
        "mainStats": {
          "helmet": "Additional Attack",
          "chest": "Additional Defense",
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
  },

  // 🆕 SIAN HALAT - Dark Assassin (Attack scaling)
  "sian": {
    "name": "Sian Halat",
    "element": "Dark",
    "class": "Assassin",
    "grade": "SSR",
    "scaleStat": "Attack",

    "optimizationPriority": [
      {
        stat: "Additional Attack",
        priority: 1,
        target: "maximum_possible",
        reason: "Prioriser Attaque au maximum (scaleStat)",
        description: "Sian scale sur Attaque - maximise cette stat avant tout"
      },
      {
        stat: "Damage Increase",
        priority: 2,
        target: "maximum_possible",
        reason: "Dégâts optimaux après attaque"
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
        reason: "Taux critique pour assassin"
      },
      {
        stat: "Defense Penetration",
        priority: 5,
        target: "10-20%",
        reason: "Pénétration pour efficacité"
      }
    ],

    "recommendedStats": {
      "criticalHitRate": "50%",
      "criticalHitDamage": "200% - 210%",
      "DamageIncrease": "30% +",
      "defensePenetration": "10% - 20%",
      "additionalAttack": "Le plus possible",
      "additionalDefense": null,
      "precision": null,
      "damageReduction": null,
      "healingReceived": null,
      "mpRecoveryRate": null,
      "mpCostReduction": null
    },

    "beruAdvice": {
      "newbie": "Sian Halat est un Assassin Dark Attack ! Priorise Additional Attack au maximum !",
      "intermediate": "Scale sur Attack = focus Additional Attack, puis Damage Increase.",
      "advanced": "Build DPS assassin avec bonne pénétration défense.",
      "expert": "Dark Assassin puissant - optimise les substats Attack %!"
    }
  },

  // 🆕 SON KIHOON - Dark Tank (HP scaling)
  "son": {
    "name": "Son Kihoon",
    "element": "Dark",
    "class": "Tank",
    "grade": "SSR",
    "scaleStat": "HP",

    "optimizationPriority": [
      {
        stat: "Additional HP",
        priority: 1,
        target: "maximum_possible",
        reason: "Prioriser HP au maximum (scaleStat)",
        description: "Son scale sur HP - maximise cette stat avant tout"
      },
      {
        stat: "Damage Increase",
        priority: 2,
        target: "maximum_possible",
        reason: "Dégâts optimaux après HP"
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
        reason: "Taux critique pour tank"
      },
      {
        stat: "Defense Penetration",
        priority: 5,
        target: "10-20%",
        reason: "Pénétration pour efficacité"
      }
    ],

    "recommendedStats": {
      "criticalHitRate": "50%",
      "criticalHitDamage": "200% - 210%",
      "DamageIncrease": "30% +",
      "defensePenetration": "10% - 20%",
      "additionalHP": "Le plus possible",
      "additionalAttack": null,
      "additionalDefense": null,
      "precision": null,
      "damageReduction": null,
      "healingReceived": null,
      "mpRecoveryRate": null,
      "mpCostReduction": null
    },

    "beruAdvice": {
      "newbie": "Son Kihoon est un Tank Dark HP ! Priorise Additional HP au maximum !",
      "intermediate": "Scale sur HP = focus Additional HP, puis Damage Increase.",
      "advanced": "Build tank avec bonne survivabilité HP.",
      "expert": "Dark Tank HP scaling - optimise les substats HP %!"
    }
  },

  "meri": {
    "name": "Meri Laine",
    "element": "Water",
    "class": "Infusion",
    "grade": "SSR",
    "scaleStat": "HP",

    "optimizationPriority": [
      {
        stat: "Additional HP",
        priority: 1,
        target: "maximum_possible",
        reason: "Prioriser HP au maximum (scaleStat)",
        description: "Meri scale sur HP - maximise cette stat avant tout"
      },
      {
        stat: "HP %",
        priority: 2,
        target: "maximum_possible",
        reason: "Prioriser HP % pour scaling optimal",
        description: "HP % booste le scaling de Meri"
      },
      {
        stat: "Damage Increase",
        priority: 3,
        target: "maximum_possible",
        reason: "Dégâts optimaux"
      },
      {
        stat: "Critical Hit Damage",
        priority: 4,
        target: "200%+",
        reason: "Dégâts critiques optimaux"
      },
      {
        stat: "Critical Hit Rate",
        priority: 5,
        target: 8000,
        reason: "Taux critique optimal pour Infusion"
      },
      {
        stat: "Defense Penetration",
        priority: 6,
        target: "15-25%",
        reason: "Pénétration pour efficacité"
      }
    ],

    "recommendedStats": {
      "criticalHitRate": "80-100%",
      "criticalHitDamage": "180% - 200%",
      "DamageIncrease": "30% +",
      "defensePenetration": "15% - 25%",
      "hp": "Maximum possible"
    },

    "gameModes": {
      "general": {
        "recommendedSet": "Desire/Sylph Build",
        "priority": "Infusion Water HP-scaling",
        "description": "Build Infusion avec Desire + Sylph",
        "availability": "LR",
        "setComposition": "4x Desire + 4x Sylph"
      },
      "pod": {
        "recommendedSet": "Desire/Sylph Build",
        "priority": "PvP Infusion Water",
        "description": "Build PvP Infusion avec HP maximum",
        "availability": "LR",
        "setComposition": "4x Desire + 4x Sylph"
      },
      "bdg": {
        "recommendedSet": "Desire/Sylph Build",
        "priority": "Guild boss Infusion",
        "description": "Build boss de guilde Infusion avec Desire + Sylph",
        "availability": "LR",
        "setComposition": "4x Desire + 4x Sylph"
      }
    },

    "artifactSets": {
      "desireSylph": {
        "name": "Desire/Sylph Build",
        "frenchName": "Build Désir/Sylphe",
        "availability": "LR",
        "setComposition": "4x Desire + 4x Sylph",
        "pieces": {
          "helmet": "Casque du désir",
          "chest": "Armure du désir",
          "gloves": "Gants du désir",
          "boots": "Bottes du désir",
          "necklace": "Collier sylphe",
          "bracelet": "Bracelet sylphe",
          "ring": "Anneau sylphe",
          "earrings": "Boucles sylphe"
        },
        "mainStats": {
          "helmet": "HP %",
          "chest": "HP %",
          "gloves": "HP %",
          "boots": "HP %",
          "necklace": "Critical Hit Damage",
          "bracelet": "HP %",
          "ring": "HP %",
          "earrings": "HP %"
        }
      }
    },

    "recommendedCores": {
      "offensive": {
        "name": "Trompette du Démon Anonyme",
        "type": "Additional HP",
        "bonus": "Lors de l'utilisation de la Compétence ultime, les Dégâts de coup critique de l'utilisateur augmentent de 30% pendant 8 secondes"
      },
      "defensive": {
        "name": "Corne du Démon Anonyme",
        "type": "Additional HP",
        "bonus": "Lors de l'utilisation de la Compétence ultime, l'utilisateur bénéficie d'un bouclier équivalent à 10% de ses PV max pendant 8 secondes"
      }
    },

    "beruAdvice": {
      "newbie": "Meri Laine est une Infusion Water HP-scaling !",
      "intermediate": "Elle scale sur HP ! Build Desire + Sylph pour maximiser !",
      "advanced": "Maximise HP % et maintiens 80-100% crit rate pour damage optimal !",
      "expert": "Optimise les substats HP % sur tous les artefacts pour scaling maximum !"
    }
  },

  "sugimoto": {
    "name": "Sugimoto Reiji",
    "element": "Wind",
    "class": "Infusion",
    "grade": "SSR",
    "scaleStat": "HP",

    "optimizationPriority": [
      {
        stat: "Additional HP",
        priority: 1,
        target: "maximum_possible",
        reason: "Prioriser HP au maximum (scaleStat)",
        description: "Sugimoto scale sur HP - maximise cette stat avant tout"
      },
      {
        stat: "HP %",
        priority: 2,
        target: "maximum_possible",
        reason: "Prioriser HP % pour scaling optimal",
        description: "HP % booste le scaling de Sugimoto"
      },
      {
        stat: "Damage Increase",
        priority: 3,
        target: "maximum_possible",
        reason: "Dégâts optimaux"
      },
      {
        stat: "Critical Hit Damage",
        priority: 4,
        target: "200%+",
        reason: "Dégâts critiques optimaux"
      },
      {
        stat: "Critical Hit Rate",
        priority: 5,
        target: 8000,
        reason: "Taux critique optimal pour Infusion"
      },
      {
        stat: "Defense Penetration",
        priority: 6,
        target: "15-25%",
        reason: "Pénétration pour efficacité"
      }
    ],

    "recommendedStats": {
      "criticalHitRate": "80-100%",
      "criticalHitDamage": "180% - 200%",
      "DamageIncrease": "30% +",
      "defensePenetration": "15% - 25%",
      "hp": "Maximum possible"
    },

    "gameModes": {
      "general": {
        "recommendedSet": "Desire/Sylph Build",
        "priority": "Infusion Wind HP-scaling",
        "description": "Build Infusion avec Desire + Sylph",
        "availability": "LR",
        "setComposition": "4x Desire + 4x Sylph"
      },
      "pod": {
        "recommendedSet": "Desire/Sylph Build",
        "priority": "PvP Infusion Wind",
        "description": "Build PvP Infusion avec HP maximum",
        "availability": "LR",
        "setComposition": "4x Desire + 4x Sylph"
      },
      "bdg": {
        "recommendedSet": "Desire/Sylph Build",
        "priority": "Guild boss Infusion",
        "description": "Build boss de guilde Infusion avec Desire + Sylph",
        "availability": "LR",
        "setComposition": "4x Desire + 4x Sylph"
      }
    },

    "artifactSets": {
      "desireSylph": {
        "name": "Desire/Sylph Build",
        "frenchName": "Build Désir/Sylphe",
        "availability": "LR",
        "setComposition": "4x Desire + 4x Sylph",
        "pieces": {
          "helmet": "Casque du désir",
          "chest": "Armure du désir",
          "gloves": "Gants du désir",
          "boots": "Bottes du désir",
          "necklace": "Collier sylphe",
          "bracelet": "Bracelet sylphe",
          "ring": "Anneau sylphe",
          "earrings": "Boucles sylphe"
        },
        "mainStats": {
          "helmet": "HP %",
          "chest": "HP %",
          "gloves": "HP %",
          "boots": "HP %",
          "necklace": "Critical Hit Damage",
          "bracelet": "HP %",
          "ring": "HP %",
          "earrings": "HP %"
        }
      }
    },

    "recommendedCores": {
      "offensive": {
        "name": "Trompette du Démon Anonyme",
        "type": "Additional HP",
        "bonus": "Lors de l'utilisation de la Compétence ultime, les Dégâts de coup critique de l'utilisateur augmentent de 30% pendant 8 secondes"
      },
      "defensive": {
        "name": "Corne du Démon Anonyme",
        "type": "Additional HP",
        "bonus": "Lors de l'utilisation de la Compétence ultime, l'utilisateur bénéficie d'un bouclier équivalent à 10% de ses PV max pendant 8 secondes"
      }
    },

    "beruAdvice": {
      "newbie": "Sugimoto Reiji est un Infusion Wind HP-scaling !",
      "intermediate": "Il scale sur HP ! Build Desire + Sylph pour maximiser !",
      "advanced": "Maximise HP % et maintiens 80-100% crit rate pour damage optimal !",
      "expert": "Optimise les substats HP % sur tous les artefacts pour scaling maximum !"
    }
  }
};

export { BUILDER_DATA };