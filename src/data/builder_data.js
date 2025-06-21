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

    // 🎯 PRIORITÉS D'OPTIMISATION - LOGIQUE UNIFIÉE
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

    // 📊 STATS RECOMMANDÉES (optimisées BuilderBeru)
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

    // 🎮 MODES DE JEU & SETS
    "gameModes": {
      "general": {
        "recommendedSet": "Iron Will", 
        "priority": "Defense focused tank build",
        "description": "Build polyvalent défensif",
        "availability": "L"
      },
      "pod": {
        "recommendedSet": "Stigma Chaotic", 
        "priority": "PvP survivability", 
        "description": "Build PvP axé survie",
        "availability": "missing"
      },
      "bdg": {
        "recommendedSet": "Stigma Chaotic", 
        "priority": "Guild boss tanking",
        "description": "Build boss de guilde",
        "availability": "missing"
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
          "necklace": "Additional Defense",
          "bracelet": "Wind Damage %",
          "ring": "Additional Defense",
          "earrings": "Additional MP"
        }
      },
      "stigmaChaotic": {
        "name": "Stigma Chaotic",
        "frenchName": "Stigmate chaotique",
        "availability": "missing",
        "pieces": {
          "helmet": "Casque du Stigmate chaotique",
          "armor": "Armure du Stigmate chaotique",
          "gloves": "Gants du Stigmate chaotique", 
          "boots": "Bottes du Stigmate chaotique",
          "necklace": "Collier du Stigmate chaotique",
          "bracelet": "Bracelet du Stigmate chaotique",
          "ring": "Bague du Stigmate chaotique", 
          "earrings": "Boucles d'oreilles du Stigmate chaotique"
        },
        "mainStats": {
          "helmet": "Additional Defense",
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage",
          "necklace": "Additional Defense",
          "bracelet": "Wind Damage %",
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
        "type": "Additional MP",
        "bonus": "Diminue le taux de récupération de PM de 15% et la Consommation de PM de 15% lors de l'utilisation d'une compétence"
      }
    },

    // 💡 CONSEILS BÉRU
    "beruAdvice": {
      "newbie": "Niermann est un tank défensif. Priorise Additional Defense au maximum !",
      "intermediate": "Scale sur Defense = focus Additional Defense, puis Damage Increase.",
      "advanced": "Balance entre défense pure et dégâts pour les boss de guilde.",
      "expert": "Switch entre Iron Will (général) et Stigma Chaotic (PvP/BdG) selon le contenu."
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

    // 🎮 MODES DE JEU & SETS
    "gameModes": {
      "general": {
        "recommendedSet": "Burning Curse",
        "priority": "Balanced attack build",
        "description": "Build équilibré attaque",
        "availability": "LR"
      },
      "pod": {
        "recommendedSet": "Stigma Chaotic",
        "priority": "PvP damage", 
        "description": "Build PvP axé dégâts",
        "availability": "missing"
      },
      "bdg": {
        "recommendedSet": "Stigma Chaotic",
        "priority": "Guild boss damage",
        "description": "Build boss de guilde",
        "availability": "missing"
      }
    },

    // ⚔️ SETS D'ARTEFACTS DÉTAILLÉS
    "artifactSets": {
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
          "helmet": "Additional Defense",
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage",
          "necklace": "Additional HP",
          "bracelet": "Light Damage %", // Light element pour Chae
          "ring": "Additional Defense", 
          "earrings": "Additional MP"
        }
      },
      "stigmaChaotic": {
        "name": "Stigma Chaotic",
        "frenchName": "Stigmate chaotique",
        "availability": "missing",
        "pieces": {
          "helmet": "Casque du Stigmate chaotique",
          "armor": "Armure du Stigmate chaotique",
          "gloves": "Gants du Stigmate chaotique", 
          "boots": "Bottes du Stigmate chaotique",
          "necklace": "Collier du Stigmate chaotique",
          "bracelet": "Bracelet du Stigmate chaotique",
          "ring": "Bague du Stigmate chaotique", 
          "earrings": "Boucles d'oreilles du Stigmate chaotique"
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
      "newbie": "Chae est une DPS Fighter. Priorise Additional Attack au maximum !",
      "intermediate": "Scale sur Attack = focus Additional Attack, puis Damage Increase.",
      "advanced": "80% de crit minimum pour maximiser tes dégâts en Fighter.",
      "expert": "Switch entre Burning Curse (général) et Stigma Chaotic (PvP/BdG) selon le contenu."
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
      "criticalHitRate": "100-120%", // Spécial Kanae
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

    // 💡 CONSEILS BÉRU
    "beruAdvice": {
      "newbie": "Kanae est un Assassin spécial. Priorise Additional Attack au maximum !",
      "intermediate": "Scale sur Attack = focus Additional Attack, puis Damage Increase.",
      "advanced": "Kanae DOIT avoir 10000-12000 crit pour lead le groupe !",
      "expert": "Build hybride complexe - utilise Burning Curse en alternative simple."
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