// 🏗️ BUILDERBERU.COM - Intelligence des Données Hunters
// Générée par l'équipe Monarque des Ombres 👑⚡️

const BUILDER_DATA = {
  "niermann": {
    "name": "Lennart Niermann",
    "element": "Water",
    "class": "Fighter", 
    "grade": "SSR",
    "scaleStat": "Defense",

    // 📊 STATS RECOMMANDÉES (optimisées BuilderBeru)
    "recommendedStats": {
      // Stats principales optimales
      "criticalHitRate": "50%",        // Taux de coup critique
      "criticalHitDamage": "200% - 210%", // Dégâts de coup critique  
      "healingIncrease": "30% +",      // Hausse des dégâts
      "defensePenetration": "10% - 20%", // Pénétration de défense
      
      // Stats secondaires importantes
      "precision": null,               // Non spécifié
      "additionalDefense": "Le plus possible", // Défense supplémentaire 
      "additionalAttack": null,        // Non spécifié
      "damageReduction": null,         // Réduction des dégâts
      "healingReceived": null,         // Hausse des soins reçus
      "mpRecoveryRate": null,          // Hausse du taux de récupération des PM
      "mpCostReduction": null          // Baisse du coût de PM
    },

    // 🎮 MODES DE JEU & SETS
    "gameModes": {
      "general": {
        "recommendedSet": "Iron Will", 
        "priority": "Defense focused tank build",
        "description": "Build polyvalent défensif",
        "availability": "L" // Côté gauche disponible dans itemData.js
      },
      "pod": {
        "recommendedSet": "Stigma Chaotic", 
        "priority": "PvP survivability", 
        "description": "Build PvP axé survie",
        "availability": "missing" // Pas encore dans itemData.js
      },
      "bdg": {
        "recommendedSet": "Stigma Chaotic", 
        "priority": "Guild boss tanking",
        "description": "Build boss de guilde",
        "availability": "missing" // Pas encore dans itemData.js
      }
    },

    // ⚔️ SETS D'ARTEFACTS DÉTAILLÉS
    "artifactSets": {
      "ironWill": {
        "name": "Iron Will",
        "frenchName": "Volonté de fer",
        "availability": "L", // Disponible côté gauche dans itemData.js
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
        "availability": "missing", // Pas encore dans itemData.js
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

    // 🎯 PRIORITÉS D'OPTIMISATION
    "optimizationPriority": [
      "Additional Defense", // Défense avant tout (Tank)
      "Critical Hit Rate",  // Taux critique à 50%
      "Critical Hit Damage", // Dégâts critiques 200-210%
      "Healing Increase",   // Hausse dégâts 30%+
      "Defense Penetration" // Pénétration 10-20%
    ],

    // 💡 CONSEILS BÉRU
    "beruAdvice": {
      "newbie": "Niermann est un tank défensif. Focus sur la Défense et la survie !",
      "intermediate": "Optimise ton taux critique à 50% minimum pour les contre-attaques.",
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

    // 📊 STATS RECOMMANDÉES (d'après les screenshots)
    "recommendedStats": {
      // Stats principales optimales
      "criticalHitRate": "50%",        // Taux de coup critique
      "criticalHitDamage": "200% - 210%", // Dégâts de coup critique  
      "healingIncrease": "30% +",      // Hausse des dégâts
      "defensePenetration": "10% - 20%", // Pénétration de défense
      
      // Stats secondaires importantes
      "precision": null,               // Non spécifié
      "additionalDefense": "Modéré", // Un peu de défense pour survie
      "additionalAttack": "Le plus possible", // Attaque principale
      "damageReduction": null,         // Réduction des dégâts
      "healingReceived": null,         // Hausse des soins reçus
      "mpRecoveryRate": null,          // Hausse du taux de récupération des PM
      "mpCostReduction": null          // Baisse du coût de PM
    },

    // 🎮 MODES DE JEU & SETS (d'après les screenshots)
    "gameModes": {
      "general": {
        "recommendedSet": "Burning Curse", // Malédiction ardente (screenshots)
        "priority": "Balanced attack build",
        "description": "Build équilibré attaque",
        "availability": "LR" // Set complet disponible dans itemData.js
      },
      "pod": {
        "recommendedSet": "Stigma Chaotic", // Stigmate chaotique (screenshots)
        "priority": "PvP damage", 
        "description": "Build PvP axé dégâts",
        "availability": "missing" // Pas encore dans itemData.js
      },
      "bdg": {
        "recommendedSet": "Stigma Chaotic", // Stigmate chaotique (screenshots)
        "priority": "Guild boss damage",
        "description": "Build boss de guilde",
        "availability": "missing" // Pas encore dans itemData.js
      }
    },

    // ⚔️ SETS D'ARTEFACTS DÉTAILLÉS
    "artifactSets": {
      "burningCurse": {
        "name": "Burning Curse", // Nom exact dans itemData.js
        "frenchName": "Malédiction ardente",
        "availability": "LR", // Set complet disponible dans itemData.js
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
          "necklace": "Additional HP", // PV supplémentaire
          "bracelet": "Water Damage %", // Dégâts d'eau
          "ring": "Additional Defense", 
          "earrings": "Additional MP"
        }
      },
      "stigmaChaotic": {
        "name": "Stigma Chaotic",
        "frenchName": "Stigmate chaotique",
        "availability": "missing", // Pas encore dans itemData.js
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
          "necklace": "Additional HP", // PV supplémentaire
          "bracelet": "Water Damage %", // Dégâts d'eau
          "ring": "Additional Defense", 
          "earrings": "Additional MP"
        }
      }
    },

    // 🧪 NOYAUX RECOMMANDÉS (d'après les screenshots)
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
        "type": "Additional HP", // PV supplémentaire d'après screenshot
        "bonus": "Diminue le Taux de récupération de PM de 10% et la Consommation de PM de 12% lors de l'utilisation d'une compétence"
      }
    },

    // 🎯 PRIORITÉS D'OPTIMISATION
    "optimizationPriority": [
      "Critical Hit Rate",  // Taux critique à 50%
      "Critical Hit Damage", // Dégâts critiques 200-210%
      "Additional Attack",   // Attaque pour DPS
      "Healing Increase",   // Hausse dégâts 30%+
      "Defense Penetration" // Pénétration 10-20%
    ],

    // 💡 CONSEILS BÉRU
    "beruAdvice": {
      "newbie": "Chae est une DPS épéiste. Focus sur l'Attaque et les critiques !",
      "intermediate": "Optimise ton taux critique à 50% minimum pour maximiser tes dégâts.",
      "advanced": "Balance entre attaque pure et survie pour les contenus difficiles.",
      "expert": "Switch entre Burning Curse (général) et Stigma Chaotic (PvP/BdG) selon le contenu."
    }
  },

  "seorin": {
    "name": "Seorin",
    "element": "Water",
    "class": "Ranger",
    "grade": "SSR",
    "scaleStat": "HP",

    // 📊 STATS RECOMMANDÉES (d'après les screenshots)
    "recommendedStats": {
      // Stats principales optimales
      "criticalHitRate": "50%",        // Taux de coup critique
      "criticalHitDamage": "200% - 210%", // Dégâts de coup critique  
      "healingIncrease": "30% +",      // Hausse des dégâts
      "defensePenetration": "10% - 20%", // Pénétration de défense
      
      // Stats secondaires importantes
      "precision": null,               // Non spécifié
      "additionalDefense": null,       // Non spécifié
      "additionalAttack": "Le plus possible", // Attaque pour Ranger
      "damageReduction": null,         // Réduction des dégâts
      "healingReceived": null,         // Hausse des soins reçus
      "mpRecoveryRate": null,          // Hausse du taux de récupération des PM
      "mpCostReduction": null          // Baisse du coût de PM
    },

    // 🎮 MODES DE JEU & SETS (d'après les screenshots)
    "gameModes": {
      "general": {
        "recommendedSet": "Chaotic Desire", // Désir chaotique (screenshots)
        "priority": "Balanced HP build",
        "description": "Build équilibré HP",
        "availability": "LR" // Set complet disponible dans itemData.js
      },
      "general2": {
        "recommendedSet": "Burning Greed", // Avarice ardente (screenshots)
        "priority": "Alternative HP build",
        "description": "Build alternatif HP",
        "availability": "LR" // Set complet disponible dans itemData.js
      },
      "pod": {
        "recommendedSet": "Chaotic Desire", // Désir chaotique (screenshots)
        "priority": "PvP HP sustain", 
        "description": "Build PvP axé survie HP",
        "availability": "LR" // Set complet disponible dans itemData.js
      },
      "pod2": {
        "recommendedSet": "Burning Greed", // Avarice ardente (screenshots)
        "priority": "Alternative PvP build",
        "description": "Build PvP alternatif",
        "availability": "LR" // Set complet disponible dans itemData.js
      },
      "bdg": {
        "recommendedSet": "Chaotic Desire", // Désir chaotique (screenshots)
        "priority": "Guild boss HP tank",
        "description": "Build boss de guilde HP",
        "availability": "LR" // Set complet disponible dans itemData.js
      },
      "bdg2": {
        "recommendedSet": "Burning Greed", // Avarice ardente (screenshots)
        "priority": "Alternative BdG build",
        "description": "Build boss alternatif",
        "availability": "LR" // Set complet disponible dans itemData.js
      }
    },

    // ⚔️ SETS D'ARTEFACTS DÉTAILLÉS
    "artifactSets": {
      "chaoticDesire": {
        "name": "Chaotic Desire", // Nom exact dans itemData.js
        "frenchName": "Désir chaotique",
        "availability": "LR", // Set complet disponible dans itemData.js
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
          "helmet": "Additional HP", // PV supplémentaire
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage",
          "necklace": "Additional HP", // PV supplémentaire
          "bracelet": "Water Damage %", // Dégâts d'eau
          "ring": "Additional HP", // PV supplémentaire
          "earrings": "Additional MP"
        }
      },
      "burningGreed": {
        "name": "Burning Greed", // Nom exact dans itemData.js
        "frenchName": "Avarice ardente",
        "availability": "LR", // Set complet disponible dans itemData.js
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
          "helmet": "Additional HP", // PV supplémentaire
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage",
          "necklace": "Additional HP", // PV supplémentaire
          "bracelet": "Water Damage %", // Dégâts d'eau
          "ring": "Additional HP", // PV supplémentaire
          "earrings": "Additional MP"
        }
      }
    },

    // 🧪 NOYAUX RECOMMANDÉS (d'après les screenshots)
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
        "type": "Additional HP", // PV supplémentaire d'après screenshot
        "bonus": "Diminue le Taux de récupération de PM de 10% et la Consommation de PM de 12% lors de l'utilisation d'une compétence"
      }
    },

    // 🎯 PRIORITÉS D'OPTIMISATION
    "optimizationPriority": [
      "Additional HP",      // PV avant tout (scaleStat)
      "Critical Hit Rate",  // Taux critique à 50%
      "Critical Hit Damage", // Dégâts critiques 200-210%
      "Additional Attack",   // Attaque pour Ranger
      "Defense Penetration" // Pénétration 10-20%
    ],

    // 💡 CONSEILS BÉRU
    "beruAdvice": {
      "newbie": "Seorin est un Ranger HP. Focus sur les PV et la survie !",
      "intermediate": "Optimise ton taux critique à 50% tout en gardant un bon pool de HP.",
      "advanced": "Balance entre HP tank et dégâts pour les contenus difficiles.",
      "expert": "Alterne entre Chaotic Desire et Burning Greed selon tes besoins en survie."
    }
  },

  "goto": {
    "name": "Goto Ryuji",
    "element": "Wind",
    "class": "Tank",
    "grade": "SSR",
    "scaleStat": "HP",

    // 📊 STATS RECOMMANDÉES (d'après les screenshots)
    "recommendedStats": {
      // Stats principales optimales
      "criticalHitRate": "50%",        // Taux de coup critique
      "criticalHitDamage": "200% - 210%", // Dégâts de coup critique  
      "healingIncrease": "30% +",      // Hausse des dégâts
      "defensePenetration": "10% - 20%", // Pénétration de défense
      
      // Stats secondaires importantes
      "precision": null,               // Non spécifié
      "additionalDefense": "Modéré",   // Un peu de défense
      "additionalAttack": null,        // Non spécifié
      "damageReduction": null,         // Réduction des dégâts
      "healingReceived": null,         // Hausse des soins reçus
      "mpRecoveryRate": null,          // Hausse du taux de récupération des PM
      "mpCostReduction": null          // Baisse du coût de PM
    },

    // 🎮 MODES DE JEU & SETS (d'après les screenshots)
    "gameModes": {
      "general": {
        "recommendedSet": "Burning Greed", // Avarice ardente (screenshots)
        "priority": "HP tank build",
        "description": "Build tank HP",
        "availability": "LR" // Set complet disponible dans itemData.js
      },
      "general2": {
        "recommendedSet": "Burning Greed", // Avarice ardente (screenshots)
        "priority": "HP tank build",
        "description": "Build tank HP",
        "availability": "LR" // Set complet disponible dans itemData.js
      },
      "pod": {
        "recommendedSet": "Burning Greed", // Avarice ardente (screenshots)
        "priority": "PvP HP tank", 
        "description": "Build PvP tank HP",
        "availability": "LR" // Set complet disponible dans itemData.js
      },
      "bdg": {
        "recommendedSet": "Burning Greed", // Avarice ardente (screenshots)
        "priority": "Guild boss HP tank",
        "description": "Build boss de guilde HP tank",
        "availability": "LR" // Set complet disponible dans itemData.js
      }
    },

    // ⚔️ SETS D'ARTEFACTS DÉTAILLÉS
    "artifactSets": {
      "burningGreed": {
        "name": "Burning Greed", // Nom exact dans itemData.js
        "frenchName": "Avarice ardente",
        "availability": "LR", // Set complet disponible dans itemData.js
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
          "helmet": "Additional HP", // PV supplémentaire
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage", // PV (%) d'après screenshot
          "necklace": "Additional HP", // PV supplémentaire
          "bracelet": "Wind Damage %", // Dégâts de vent
          "ring": "Additional HP", // PV supplémentaire
          "earrings": "Additional MP"
        }
      }
    },

    // 🧪 NOYAUX RECOMMANDÉS (d'après les screenshots)
    "recommendedCores": {
      "offensive": {
        "name": "Trompette du Démon Anonyme", // Différent des autres !
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
        "type": "Additional HP", // PV supplémentaire d'après screenshot
        "bonus": "Diminue le Taux de récupération de PM de 10% et la Consommation de PM de 12% lors de l'utilisation d'une compétence"
      }
    },

    // 🎯 PRIORITÉS D'OPTIMISATION
    "optimizationPriority": [
      "Additional HP",      // PV avant tout (scaleStat)
      "Additional Defense", // Défense pour tank
      "Critical Hit Rate",  // Taux critique à 50%
      "Critical Hit Damage", // Dégâts critiques 200-210%
      "Defense Penetration" // Pénétration 10-20%
    ],

    // 💡 CONSEILS BÉRU
    "beruAdvice": {
      "newbie": "Goto est un tank HP simple. Un seul set pour tout : Burning Greed !",
      "intermediate": "Focus sur les PV et la défense, Goto est un mur HP avec du vent.",
      "advanced": "Optimise ton taux critique même en tant que tank pour les contre-attaques.",
      "expert": "Burning Greed unique pour tous les contenus - build simple et efficace !"
    }
  },

  "kanae": {
    "name": "Tawata Kanae",
    "element": "Fire",
    "class": "Assassin",
    "grade": "SSR",
    "scaleStat": "Attack",

    // 📊 STATS RECOMMANDÉES (d'après les screenshots)
    "recommendedStats": {
      // Stats principales optimales
      "criticalHitRate": "50%",        // Taux de coup critique
      "criticalHitDamage": "200% - 210%", // Dégâts de coup critique  
      "healingIncrease": "30% +",      // Hausse des dégâts
      "defensePenetration": "10% - 20%", // Pénétration de défense
      
      // Stats secondaires importantes
      "precision": null,               // Non spécifié
      "additionalDefense": null,       // Non spécifié pour assassin
      "additionalAttack": "Le plus possible", // Attaque principale
      "damageReduction": null,         // Réduction des dégâts
      "healingReceived": null,         // Hausse des soins reçus
      "mpRecoveryRate": null,          // Hausse du taux de récupération des PM
      "mpCostReduction": null          // Baisse du coût de PM
    },

    // 🎮 MODES DE JEU & SETS (d'après les screenshots)
    "gameModes": {
      "general": {
        "recommendedSet": "Mixed Build", // Build hybride (screenshots)
        "priority": "Hybrid assassin build",
        "description": "Build assassin hybride",
        "availability": "partial" // Sets partiellement disponibles
      },
      "pod": {
        "recommendedSet": "Mixed Build", // Build hybride (screenshots)
        "priority": "PvP assassin", 
        "description": "Build PvP assassin",
        "availability": "partial" // Sets partiellement disponibles
      },
      "bdg": {
        "recommendedSet": "Mixed Build", // Build hybride (screenshots)
        "priority": "Guild boss assassin",
        "description": "Build boss de guilde assassin",
        "availability": "partial" // Sets partiellement disponibles
      }
    },

    // ⚔️ SETS D'ARTEFACTS DÉTAILLÉS
    "artifactSets": {
      "mixedBuild": {
        "name": "Mixed Build", // Build personnalisé
        "frenchName": "Build hybride",
        "availability": "partial", // Partiellement disponible dans itemData.js
        "pieces": {
          "helmet": "Chapeau de grand enchanteur", // Pas dans itemData.js
          "armor": "Robe de grand enchanteur", // Pas dans itemData.js
          "gloves": "Gants de malédiction ardente", // Burning Curse disponible
          "boots": "Bottes de malédiction ardente", // Burning Curse disponible
          "necklace": "Collier de bête", // Pas dans itemData.js
          "bracelet": "Bracelet de bête", // Pas dans itemData.js
          "ring": "Bague de bête", // Pas dans itemData.js
          "earrings": "Boucles d'oreilles de bête" // Pas dans itemData.js
        },
        "mainStats": {
          "helmet": "Additional Attack", // Attaque supplémentaire
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage",
          "necklace": "Additional HP", // PV supplémentaire
          "bracelet": "Fire Damage %", // Dégâts de feu
          "ring": "Additional Attack", // Attaque supplémentaire
          "earrings": "Additional MP"
        }
      },
      "burningCurse": {
        "name": "Burning Curse", // Alternative disponible
        "frenchName": "Malédiction ardente",
        "availability": "LR", // Set complet disponible dans itemData.js
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
          "necklace": "Additional Attack", // Attaque pour assassin
          "bracelet": "Fire Damage %", // Dégâts de feu
          "ring": "Additional Attack", 
          "earrings": "Additional MP"
        }
      }
    },

    // 🧪 NOYAUX RECOMMANDÉS (d'après les screenshots)
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
        "type": "Additional HP", // PV supplémentaire d'après screenshot
        "bonus": "Diminue le Taux de récupération de PM de 10% et la Consommation de PM de 12% lors de l'utilisation d'une compétence"
      }
    },

    // 🎯 PRIORITÉS D'OPTIMISATION
    "optimizationPriority": [
      "Additional Attack",  // Attaque avant tout (scaleStat)
      "Critical Hit Rate",  // Taux critique à 50%
      "Critical Hit Damage", // Dégâts critiques 200-210%
      "Healing Increase",   // Hausse dégâts 30%+
      "Defense Penetration" // Pénétration 10-20%
    ],

    // 💡 CONSEILS BÉRU
    "beruAdvice": {
      "newbie": "Kanae est un assassin complexe. Build hybride avec mix de sets !",
      "intermediate": "Focus sur l'Attaque et les critiques, utilise Burning Curse en alternative.",
      "advanced": "Le build hybride optimise différentes stats, mais Burning Curse est plus simple.",
      "expert": "Build hybride avancé - attend que tous les sets soient ajoutés à itemData.js !"
    }
  },

  "esil": {
    "name": "Esil Radiru",
    "element": "Fire",
    "class": "Ranger",
    "grade": "SSR",
    "scaleStat": "Attack",

    // 📊 STATS RECOMMANDÉES (d'après les screenshots)
    "recommendedStats": {
      // Stats principales optimales
      "criticalHitRate": "50%",        // Taux de coup critique
      "criticalHitDamage": "200% - 210%", // Dégâts de coup critique  
      "healingIncrease": "30% +",      // Hausse des dégâts
      "defensePenetration": "10% - 20%", // Pénétration de défense
      
      // Stats secondaires importantes
      "precision": null,               // Non spécifié
      "additionalDefense": null,       // Non spécifié
      "additionalAttack": "Le plus possible", // Attaque principale
      "damageReduction": null,         // Réduction des dégâts
      "healingReceived": null,         // Hausse des soins reçus
      "mpRecoveryRate": null,          // Hausse du taux de récupération des PM
      "mpCostReduction": null          // Baisse du coût de PM
    },

    // 🎮 MODES DE JEU & SETS (d'après les screenshots)
    "gameModes": {
      "general": {
        "recommendedSet": "Burning Greed", // Avarice ardente (screenshots)
        "priority": "Balanced ranger build",
        "description": "Build ranger équilibré",
        "availability": "LR" // Set complet disponible dans itemData.js
      },
      "pod": {
        "recommendedSet": "Chaotic Desire", // Désir chaotique (screenshots)
        "priority": "PvP ranger", 
        "description": "Build PvP ranger",
        "availability": "LR" // Set complet disponible dans itemData.js
      },
      "pod2": {
        "recommendedSet": "Burning Greed", // Avarice ardente 
        "priority": "Alternative PvP build",
        "description": "Build PvP alternatif",
        "availability": "LR" // Set complet disponible dans itemData.js
      },
      "bdg": {
        "recommendedSet": "Burning Greed", // Avarice ardente
        "priority": "Guild boss ranger",
        "description": "Build boss de guilde ranger",
        "availability": "LR" // Set complet disponible dans itemData.js
      }
    },

    // ⚔️ SETS D'ARTEFACTS DÉTAILLÉS
    "artifactSets": {
      "burningGreed": {
        "name": "Burning Greed", // Nom exact dans itemData.js
        "frenchName": "Avarice ardente",
        "availability": "LR", // Set complet disponible dans itemData.js
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
          "helmet": "Additional Attack", // Attaque supplémentaire
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage",
          "necklace": "Additional HP", // PV supplémentaire
          "bracelet": "Fire Damage %", // Dégâts de feu
          "ring": "Additional Attack", // Attaque supplémentaire
          "earrings": "Additional MP"
        }
      },
      "chaoticDesire": {
        "name": "Chaotic Desire", // Nom exact dans itemData.js
        "frenchName": "Désir chaotique",
        "availability": "LR", // Set complet disponible dans itemData.js
        "pieces": {
          "helmet": "Casque du désir chaotique",
          "armor": "Armure du désir chaotique",
          "gloves": "Gants du désir chaotique", 
          "boots": "Bottes du désir chaotique",
          "necklace": "Collier d'avarice ardente", // Mix avec Burning Greed
          "bracelet": "Bracelet d'avarice ardente", // Mix avec Burning Greed
          "ring": "Bague d'avarice ardente", 
          "earrings": "Boucles d'oreilles d'avarice ardente"
        },
        "mainStats": {
          "helmet": "Additional Attack", // Attaque supplémentaire
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage",
          "necklace": "Additional HP", // PV supplémentaire
          "bracelet": "Fire Damage %", // Dégâts de feu
          "ring": "Additional Attack", // Attaque supplémentaire
          "earrings": "Additional MP"
        }
      }
    },

    // 🧪 NOYAUX RECOMMANDÉS (d'après les screenshots)
    "recommendedCores": {
      "offensive": {
        "name": "Obsession du Spectre Antique", // NOUVEAU noyau !
        "type": "Additional Attack",
        "bonus": "Augmente l'Attaque de l'utilisateur de 5%" // D'après screenshot
      },
      "defensive": {
        "name": "Corne du Démon Anonyme", 
        "type": "Additional Defense",
        "bonus": "Lors de l'utilisation de la Compétence ultime, l'utilisateur bénéficie d'un bouclier équivalent à 10% de ses PV max pendant 8 secondes"
      },
      "endurance": {
        "name": "Dents du Veilleur",
        "type": "Additional HP", // PV supplémentaire d'après screenshot
        "bonus": "Diminue le Taux de récupération de PM de 10% et la Consommation de PM de 12% lors de l'utilisation d'une compétence"
      }
    },

    // 🎯 PRIORITÉS D'OPTIMISATION
    "optimizationPriority": [
      "Additional Attack",  // Attaque avant tout (scaleStat)
      "Critical Hit Rate",  // Taux critique à 50%
      "Critical Hit Damage", // Dégâts critiques 200-210%
      "Healing Increase",   // Hausse dégâts 30%+
      "Defense Penetration" // Pénétration 10-20%
    ],

    // 💡 CONSEILS BÉRU
    "beruAdvice": {
      "newbie": "Esil est un Ranger Fire DPS. Focus sur l'Attaque et les critiques !",
      "intermediate": "Utilise Burning Greed pour le général et Chaotic Desire pour le PvP.",
      "advanced": "Optimise ton nouveau noyau Obsession du Spectre Antique pour +5% d'attaque.",
      "expert": "Alterne entre les 2 sets selon le contenu - mix de bijoux possible pour optimiser !"
    }
  },

  "shimizu": {
    "name": "Shimizu Akari",
    "element": "Light",
    "class": "Healer",
    "grade": "SSR",
    "scaleStat": "HP",

    // 📊 STATS RECOMMANDÉES (d'après les screenshots)
    "recommendedStats": {
      // Stats principales optimales
      "criticalHitRate": "50%",        // Taux de coup critique
      "criticalHitDamage": "200% - 210%", // Dégâts de coup critique  
      "healingIncrease": "30% +",      // Hausse des dégâts
      "defensePenetration": "10% - 20%", // Pénétration de défense
      
      // Stats secondaires importantes
      "precision": null,               // Non spécifié
      "additionalDefense": null,       // Non spécifié
      "additionalAttack": null,        // Non spécifié
      "damageReduction": null,         // Réduction des dégâts
      "healingReceived": null,         // Hausse des soins reçus
      "mpRecoveryRate": null,          // Hausse du taux de récupération des PM
      "mpCostReduction": null          // Baisse du coût de PM
    },

    // 🎮 MODES DE JEU & SETS (d'après les screenshots)
    "gameModes": {
      "general": {
        "recommendedSet": "Grand Enchanteur", // Grand enchanteur (screenshots)
        "priority": "Healer support build",
        "description": "Build healer support",
        "availability": "missing" // Pas dans itemData.js
      },
      "general2": {
        "recommendedSet": "Garde du Palais", // Garde du palais (screenshots)
        "priority": "Alternative healer build",
        "description": "Build healer alternatif",
        "availability": "missing" // Pas dans itemData.js
      },
      "general3": {
        "recommendedSet": "Burning Blessing", // Bénédiction ardente (screenshots)
        "priority": "Available healer build",
        "description": "Build healer disponible",
        "availability": "LR" // Set complet disponible dans itemData.js
      },
      "pod": {
        "recommendedSet": "Garde du Palais", // Garde du palais
        "priority": "PvP healer", 
        "description": "Build PvP healer",
        "availability": "missing" // Pas dans itemData.js
      },
      "pod2": {
        "recommendedSet": "Garde du Palais", // Garde du palais
        "priority": "Alternative PvP healer",
        "description": "Build PvP healer alternatif",
        "availability": "missing" // Pas dans itemData.js
      },
      "bdg": {
        "recommendedSet": "Garde du Palais", // Garde du palais
        "priority": "Guild boss healer",
        "description": "Build boss de guilde healer",
        "availability": "missing" // Pas dans itemData.js
      },
      "bdg2": {
        "recommendedSet": "Garde du Palais", // Garde du palais
        "priority": "Alternative BdG healer",
        "description": "Build boss alternatif healer",
        "availability": "missing" // Pas dans itemData.js
      }
    },

    // ⚔️ SETS D'ARTEFACTS DÉTAILLÉS
    "artifactSets": {
      "grandEnchanteur": {
        "name": "Grand Enchanteur", // Pas dans itemData.js
        "frenchName": "Grand enchanteur",
        "availability": "missing", // Pas dans itemData.js
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
          "helmet": "Additional HP", // PV supplémentaire
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage", // PV (%) pour healer
          "necklace": "Additional HP", // PV supplémentaire
          "bracelet": "Light Damage %", // Dégâts de lumière
          "ring": "Additional HP", // PV supplémentaire
          "earrings": "Additional MP"
        }
      },
      "gardeDuPalais": {
        "name": "Garde du Palais", // Pas dans itemData.js
        "frenchName": "Garde du palais",
        "availability": "missing", // Pas dans itemData.js
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
          "helmet": "Additional HP", // PV supplémentaire
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage", // PV (%) pour healer
          "necklace": "Additional HP", // PV supplémentaire
          "bracelet": "Light Damage %", // Dégâts de lumière
          "ring": "Additional HP", // PV supplémentaire
          "earrings": "Additional MP"
        }
      },
      "burningBlessing": {
        "name": "Burning Blessing", // Nom exact dans itemData.js
        "frenchName": "Bénédiction ardente",
        "availability": "LR", // Set complet disponible dans itemData.js
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
          "helmet": "Additional HP", // PV supplémentaire
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage", // PV (%) pour healer
          "necklace": "Additional HP", // PV supplémentaire
          "bracelet": "Light Damage %", // Dégâts de lumière
          "ring": "Additional HP", // PV supplémentaire
          "earrings": "Additional MP"
        }
      }
    },

    // 🧪 NOYAUX RECOMMANDÉS (d'après les screenshots)
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
        "type": "Additional HP", // PV supplémentaire d'après screenshot
        "bonus": "Diminue le Taux de récupération de PM de 10% et la Consommation de PM de 12% lors de l'utilisation d'une compétence"
      }
    },

    // 🎯 PRIORITÉS D'OPTIMISATION
    "optimizationPriority": [
      "Additional HP",      // PV avant tout (scaleStat)
      "Additional Defense", // Défense pour survie
      "Critical Hit Rate",  // Taux critique à 50%
      "Critical Hit Damage", // Dégâts critiques 200-210%
      "Healing Increase"    // Hausse soins
    ],

    // 💡 CONSEILS BÉRU
    "beruAdvice": {
      "newbie": "Shimizu est un Healer HP. Utilise Burning Blessing en attendant les autres sets !",
      "intermediate": "Focus sur les PV et la défense pour maximiser tes soins et ta survie.",
      "advanced": "3 builds différents selon le contenu - Grand Enchanteur et Garde du Palais à venir.",
      "expert": "Attendre l'ajout des sets manquants dans itemData.js pour débloquer tout le potentiel !"
    }
  },

  "thomas": {
    "name": "Thomas André",
    "element": "Light",
    "class": "Fighter",
    "grade": "SSR",
    "scaleStat": "Defense",

    // 📊 STATS RECOMMANDÉES (d'après les screenshots)
    "recommendedStats": {
      // Stats principales optimales
      "criticalHitRate": "50%",        // Taux de coup critique
      "criticalHitDamage": "200% - 210%", // Dégâts de coup critique  
      "healingIncrease": "30% +",      // Hausse des dégâts
      "defensePenetration": "10% - 20%", // Pénétration de défense
      
      // Stats secondaires importantes
      "precision": null,               // Non spécifié
      "additionalDefense": "Le plus possible", // Défense principale
      "additionalAttack": "Modéré",    // Un peu d'attaque pour fighter
      "damageReduction": null,         // Réduction des dégâts
      "healingReceived": null,         // Hausse des soins reçus
      "mpRecoveryRate": null,          // Hausse du taux de récupération des PM
      "mpCostReduction": null          // Baisse du coût de PM
    },

    // 🎮 MODES DE JEU & SETS (d'après les screenshots)
    "gameModes": {
      "general": {
        "recommendedSet": "Iron Will", // Volonté de fer (screenshots)
        "priority": "Defensive fighter build",
        "description": "Build fighter défensif",
        "availability": "L" // Côté gauche disponible dans itemData.js
      },
      "pod": {
        "recommendedSet": "Iron Will", // Volonté de fer (screenshots)
        "priority": "PvP defensive fighter", 
        "description": "Build PvP fighter défensif",
        "availability": "L" // Côté gauche disponible dans itemData.js
      },
      "bdg": {
        "recommendedSet": "Iron Will", // Volonté de fer (screenshots)
        "priority": "Guild boss defensive fighter",
        "description": "Build boss de guilde fighter défensif",
        "availability": "L" // Côté gauche disponible dans itemData.js
      }
    },

    // ⚔️ SETS D'ARTEFACTS DÉTAILLÉS
    "artifactSets": {
      "ironWill": {
        "name": "Iron Will", // Nom exact dans itemData.js
        "frenchName": "Volonté de fer",
        "availability": "L", // Disponible côté gauche dans itemData.js
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
          "helmet": "Additional Defense", // Défense supplémentaire
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage", // Défense (%) d'après screenshot
          "necklace": "Additional HP", // PV supplémentaire
          "bracelet": "Light Damage %", // Dégâts de lumière
          "ring": "Additional Defense", // Défense supplémentaire
          "earrings": "Additional MP"
        }
      }
    },

    // 🧪 NOYAUX RECOMMANDÉS (d'après les screenshots)
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
        "type": "Additional HP", // PV supplémentaire d'après screenshot
        "bonus": "Diminue le Taux de récupération de PM de 10% et la Consommation de PM de 12% lors de l'utilisation d'une compétence"
      }
    },

    // 🎯 PRIORITÉS D'OPTIMISATION
    "optimizationPriority": [
      "Additional Defense", // Défense avant tout (scaleStat)
      "Critical Hit Rate",  // Taux critique à 50%
      "Critical Hit Damage", // Dégâts critiques 200-210%
      "Additional Attack",  // Un peu d'attaque pour fighter
      "Defense Penetration" // Pénétration 10-20%
    ],

    // 💡 CONSEILS BÉRU
    "beruAdvice": {
      "newbie": "Thomas est un fighter défensif. Un seul set pour tout : Iron Will !",
      "intermediate": "Focus sur la défense et les critiques, Thomas est un mur avec de l'attaque.",
      "advanced": "Build simple et efficace - Iron Will couvre tous tes besoins défensifs.",
      "expert": "Iron Will unique pour tous les contenus - simplicité maximale comme Goto !"
    }
  },

  "isla": {
    "name": "Isla Wright",
    "element": "Dark",
    "class": "Healer",
    "grade": "SSR",
    "scaleStat": "Defense",

    // 📊 STATS RECOMMANDÉES (d'après les screenshots)
    "recommendedStats": {
      // Stats principales optimales
      "criticalHitRate": "50%",        // Taux de coup critique
      "criticalHitDamage": "200% - 210%", // Dégâts de coup critique  
      "healingIncrease": "Le plus possible", // Hausse des dégâts (focus healer)
      "defensePenetration": "10% - 20%", // Pénétration de défense
      
      // Stats secondaires importantes
      "precision": null,               // Non spécifié
      "additionalDefense": "Le plus possible", // Défense principale (scaleStat)
      "additionalAttack": null,        // Non spécifié
      "damageReduction": null,         // Réduction des dégâts
      "healingReceived": null,         // Hausse des soins reçus
      "mpRecoveryRate": null,          // Hausse du taux de récupération des PM
      "mpCostReduction": null          // Baisse du coût de PM
    },

    // 🎮 MODES DE JEU & SETS (d'après les screenshots)
    "gameModes": {
      "general": {
        "recommendedSet": "Garde du Palais", // Garde du palais (screenshots)
        "priority": "Defensive healer build",
        "description": "Build healer défensif",
        "availability": "missing" // Pas dans itemData.js
      },
      "general2": {
        "recommendedSet": "Burning Blessing", // Bénédiction ardente (screenshots)
        "priority": "Available healer build",
        "description": "Build healer disponible",
        "availability": "LR" // Set complet disponible dans itemData.js
      },
      "podDark": {
        "recommendedSet": "Garde du Palais", // Garde du palais (screenshots)
        "priority": "PvP defensive healer", 
        "description": "Build PvP healer défensif",
        "availability": "missing" // Pas dans itemData.js
      },
      "podFire": {
        "recommendedSet": "Burning Blessing", // Bénédiction ardente (screenshots)
        "priority": "PvP fire healer",
        "description": "Build PvP healer feu",
        "availability": "LR" // Set complet disponible dans itemData.js
      },
      "bdg": {
        "recommendedSet": "Garde du Palais", // Garde du palais (screenshots)
        "priority": "Guild boss defensive healer",
        "description": "Build boss de guilde healer défensif",
        "availability": "missing" // Pas dans itemData.js
      }
    },

    // ⚔️ SETS D'ARTEFACTS DÉTAILLÉS
    "artifactSets": {
      "gardeDuPalais": {
        "name": "Garde du Palais", // Pas dans itemData.js
        "frenchName": "Garde du palais",
        "availability": "missing", // Pas dans itemData.js
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
          "helmet": "Additional Attack", // Attaque supplémentaire
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage", // Défense (%) pour healer défensif
          "necklace": "Additional HP", // PV supplémentaire
          "bracelet": "Dark Damage %", // Dégâts de ténèbres
          "ring": "Additional Defense", // Défense supplémentaire
          "earrings": "Additional MP"
        }
      },
      "burningBlessing": {
        "name": "Burning Blessing", // Nom exact dans itemData.js
        "frenchName": "Bénédiction ardente",
        "availability": "LR", // Set complet disponible dans itemData.js
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
          "helmet": "Additional Attack", // Attaque supplémentaire
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage", // Défense (%) pour healer défensif
          "necklace": "Additional HP", // PV supplémentaire
          "bracelet": "Dark Damage %", // Dégâts de ténèbres pour element Dark
          "ring": "Additional Defense", // Défense supplémentaire
          "earrings": "Additional MP"
        }
      }
    },

    // 🧪 NOYAUX RECOMMANDÉS (d'après les screenshots)
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
        "type": "Additional HP", // PV supplémentaire d'après screenshot
        "bonus": "Diminue le Taux de récupération de PM de 10% et la Consommation de PM de 12% lors de l'utilisation d'une compétence"
      }
    },

    // 🎯 PRIORITÉS D'OPTIMISATION
    "optimizationPriority": [
      "Additional Defense", // Défense avant tout (scaleStat)
      "Healing Increase",   // Hausse soins pour healer
      "Critical Hit Rate",  // Taux critique à 50%
      "Critical Hit Damage", // Dégâts critiques 200-210%
      "Defense Penetration" // Pénétration 10-20%
    ],

    // 💡 CONSEILS BÉRU
    "beruAdvice": {
      "newbie": "Isla est un Healer défensif Dark. Utilise Burning Blessing en attendant Garde du Palais !",
      "intermediate": "Focus sur la défense et les soins, Isla est un healer-tank très solide.",
      "advanced": "2 builds selon le contenu - Garde du Palais (défensif) et Burning Blessing (disponible).",
      "expert": "Healer Defense unique - attend l'ajout de Garde du Palais dans itemData.js !"
    }
  },

  "gina": {
    "name": "Gina",
    "element": "Fire",
    "class": "Support",
    "grade": "SSR",
    "scaleStat": "Attack",

    // 📊 STATS RECOMMANDÉES (d'après les screenshots)
    "recommendedStats": {
      // Stats principales optimales
      "criticalHitRate": "50%",        // Taux de coup critique
      "criticalHitDamage": "200% - 210%", // Dégâts de coup critique  
      "healingIncrease": "30% +",      // Hausse des dégâts
      "defensePenetration": "10% - 20%", // Pénétration de défense
      
      // Stats secondaires importantes
      "precision": null,               // Non spécifié
      "additionalDefense": null,       // Non spécifié
      "additionalAttack": "Le plus possible", // Attaque principale (scaleStat)
      "damageReduction": null,         // Réduction des dégâts
      "healingReceived": null,         // Hausse des soins reçus
      "mpRecoveryRate": null,          // Hausse du taux de récupération des PM
      "mpCostReduction": null          // Baisse du coût de PM
    },

    // 🎮 MODES DE JEU & SETS (d'après les screenshots)
    "gameModes": {
      "general": {
        "recommendedSet": "Garde du Palais", // Garde du palais (screenshots)
        "priority": "Support attack build",
        "description": "Build support attaque",
        "availability": "missing" // Pas dans itemData.js
      },
      "pod": {
        "recommendedSet": "Garde du Palais", // Garde du palais (screenshots)
        "priority": "PvP support", 
        "description": "Build PvP support",
        "availability": "missing" // Pas dans itemData.js
      },
      "bdg": {
        "recommendedSet": "Garde du Palais", // Garde du palais (screenshots)
        "priority": "Guild boss support",
        "description": "Build boss de guilde support",
        "availability": "missing" // Pas dans itemData.js
      }
    },

    // ⚔️ SETS D'ARTEFACTS DÉTAILLÉS
    "artifactSets": {
      "gardeDuPalais": {
        "name": "Garde du Palais", // Pas dans itemData.js
        "frenchName": "Garde du palais",
        "availability": "missing", // Pas dans itemData.js
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
          "helmet": "Additional Attack", // Attaque supplémentaire
          "armor": "Additional Defense",
          "gloves": "Additional Attack", 
          "boots": "Critical Hit Damage",
          "necklace": "Additional HP", // PV supplémentaire
          "bracelet": "Fire Damage %", // Dégâts de feu
          "ring": "Additional Attack", // Attaque supplémentaire
          "earrings": "Additional MP"
        }
      }
    },

    // 🧪 NOYAUX RECOMMANDÉS (d'après les screenshots)
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
        "type": "Additional Attack", // Attaque supplémentaire pour Support !
        "bonus": "Diminue le Taux de récupération de PM de 10% et la Consommation de PM de 12% lors de l'utilisation d'une compétence"
      }
    },

    // 🎯 PRIORITÉS D'OPTIMISATION
    "optimizationPriority": [
      "Additional Attack",  // Attaque avant tout (scaleStat)
      "Critical Hit Rate",  // Taux critique à 50%
      "Critical Hit Damage", // Dégâts critiques 200-210%
      "Healing Increase",   // Hausse dégâts 30%+
      "Defense Penetration" // Pénétration 10-20%
    ],

    // 💡 CONSEILS BÉRU
    "beruAdvice": {
      "newbie": "Gina est un Support Fire DPS. Un seul set pour tout : Garde du Palais (à venir) !",
      "intermediate": "Focus sur l'Attaque et les critiques, Gina soutient l'équipe avec des dégâts.",
      "advanced": "Build simple et efficace - attend l'ajout de Garde du Palais dans itemData.js.",
      "expert": "Support Attack unique - Garde du Palais sera le set parfait quand disponible !"
    }
  }
};

export { BUILDER_DATA };