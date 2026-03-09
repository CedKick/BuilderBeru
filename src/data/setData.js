// 🎭 SET DATA - Données des sets d'artefacts de Solo Leveling: Arise
// Structure: 2pc / 4pc / 8pc avec TC (Taux Critique %), DCC (Dégâts Coup Critique %), DefPen (Pénétration Défense %)

export const ARTIFACT_SETS = {
    // === SETS BURNING (Focus Crit) ===
    'burning-greed': {
        id: 'burning-greed',
        name: 'Burning Greed',
        frenchName: 'Avarice Brûlante',
        description: 'Set orienté dégâts critiques - Buffs pour la team',
        icon: 'https://api.builderberu.com/cdn/images/artifact_burningCurse_8L_l98rff.webp',
        bonuses: {
            '2pc': {
                critRate: 10,    // +10% TC pour la team
                critDMG: 0,
                defPen: 0,
                description: '+10% Taux Critique pour la team'
            },
            '4pc': {
                critRate: 10,    // +10% TC pour la team
                critDMG: 15,     // +15% DCC pour la team
                defPen: 0,
                description: '+10% Taux Critique et +15% Dégâts Critiques pour la team'
            },
            '8pc': {
                critRate: 15,    // +15% TC pour la team
                critDMG: 30,     // +30% DCC pour la team
                defPen: 0,
                description: '+15% Taux Critique et +30% Dégâts Critiques pour la team'
            }
        }
    },

    'burning-curse': {
        id: 'burning-curse',
        name: 'Burning Curse',
        frenchName: 'Malédiction Brûlante',
        description: 'Set de malédiction et dégâts sur la durée',
        icon: 'https://api.builderberu.com/cdn/images/artifact_burningCurse_8L_l98rff.webp',
        bonuses: {
            '2pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '4pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '8pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            }
        }
    },

    'burning-blessing': {
        id: 'burning-blessing',
        name: 'Burning Blessing',
        frenchName: 'Bénédiction Brûlante',
        description: 'Set de soutien et buffs',
        icon: 'https://api.builderberu.com/cdn/images/artifact_burningCurse_8L_l98rff.webp',
        bonuses: {
            '2pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '4pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '8pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            }
        }
    },

    // === SET ARMED ===
    'armed': {
        id: 'armed',
        name: 'Armed',
        frenchName: 'Armé',
        description: 'Set d\'attaque pure avec pénétration de défense',
        icon: 'https://api.builderberu.com/cdn/images/artifact_Armed_4L_tt2gbd.webp',
        bonuses: {
            '2pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'Aucun bonus'
            },
            '4pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 18,      // +18% Pénétration Défense
                description: '+18% Pénétration Défense'
            },
            '8pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 18,      // +18% Pénétration Défense (même bonus qu'à 4pc)
                description: '+18% Pénétration Défense'
            }
        }
    },

    // === SETS CHAOTIC ===
    'chaotic-wish': {
        id: 'chaotic-wish',
        name: 'Chaotic Wish',
        frenchName: 'Souhait Chaotique',
        description: 'Set chaotique - Souhait',
        bonuses: {
            '2pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '4pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '8pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            }
        }
    },

    'chaotic-desire': {
        id: 'chaotic-desire',
        name: 'Chaotic Desire',
        frenchName: 'Désir Chaotique',
        description: 'Set chaotique - Désir',
        bonuses: {
            '2pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '4pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '8pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            }
        }
    },

    'chaotic-infamy': {
        id: 'chaotic-infamy',
        name: 'Chaotic Infamy',
        frenchName: 'Infamie Chaotique',
        description: 'Set chaotique - Infamie',
        bonuses: {
            '2pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '4pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '8pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            }
        }
    },

    // === SETS HIGH-END (Crimson, Ancient, etc.) ===
    'crimson-apex': {
        id: 'crimson-apex',
        name: 'Crimson Apex',
        frenchName: 'Apex Cramoisi',
        description: 'Set haut niveau - Apex',
        bonuses: {
            '2pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '4pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '8pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            }
        }
    },

    'ancient-wraiths': {
        id: 'ancient-wraiths',
        name: 'Ancient Wraiths',
        frenchName: 'Spectres Anciens',
        description: 'Set haut niveau - Spectres',
        bonuses: {
            '2pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '4pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '8pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            }
        }
    },

    'watcher': {
        id: 'watcher',
        name: 'Watcher',
        frenchName: 'Observateur',
        description: 'Set haut niveau - Observateur',
        bonuses: {
            '2pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '4pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '8pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            }
        }
    },

    'nameless': {
        id: 'nameless',
        name: 'Nameless',
        frenchName: 'Sans-Nom',
        description: 'Set haut niveau - Sans-Nom',
        bonuses: {
            '2pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '4pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '8pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            }
        }
    },

    // === AUTRES SETS ===
    'berserker': {
        id: 'berserker',
        name: 'Berserker',
        frenchName: 'Berserker',
        description: 'Set de rage et dégâts bruts',
        bonuses: {
            '2pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '4pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '8pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            }
        }
    },

    'executioner': {
        id: 'executioner',
        name: 'Executioner',
        frenchName: 'Bourreau',
        description: 'Set d\'exécution',
        bonuses: {
            '2pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '4pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '8pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            }
        }
    },

    'destroyer': {
        id: 'destroyer',
        name: 'Destroyer',
        frenchName: 'Destructeur',
        description: 'Set de destruction',
        bonuses: {
            '2pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '4pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '8pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            }
        }
    },

    'guardian': {
        id: 'guardian',
        name: 'Guardian',
        frenchName: 'Gardien',
        description: 'Set défensif',
        bonuses: {
            '2pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '4pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '8pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            }
        }
    },

    'obsidian': {
        id: 'obsidian',
        name: 'Obsidian',
        frenchName: 'Obsidienne',
        description: 'Set d\'obsidienne',
        bonuses: {
            '2pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '4pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '8pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            }
        }
    },

    'expert': {
        id: 'expert',
        name: 'Expert',
        frenchName: 'Expert',
        description: 'Set expert',
        bonuses: {
            '2pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '4pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '8pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            }
        }
    },

    'sylph': {
        id: 'sylph',
        name: 'Sylph',
        frenchName: 'Sylphe',
        description: 'Set sylphe',
        bonuses: {
            '2pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '4pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '8pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            }
        }
    },

    'angel': {
        id: 'angel',
        name: 'Angel',
        frenchName: 'Ange',
        description: 'Set angélique',
        bonuses: {
            '2pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '4pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            },
            '8pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'À définir'
            }
        }
    },

    // Set par défaut pour "Aucun set"
    'none': {
        id: 'none',
        name: 'No Set',
        frenchName: 'Aucun Set',
        description: 'Pas de bonus de set',
        bonuses: {
            '2pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'Aucun bonus'
            },
            '4pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'Aucun bonus'
            },
            '8pc': {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                description: 'Aucun bonus'
            }
        }
    }
};

// Helper pour obtenir les bonus actifs selon le nombre de pièces
// NON-CUMULATIF: Retourne UNIQUEMENT le bonus du palier le plus élevé activé
export const getSetBonuses = (setId, pieceCount) => {
    const set = ARTIFACT_SETS[setId];
    if (!set) return null;

    // Déterminer le palier le plus élevé activé
    let activeTier = null;
    if (pieceCount >= 8 && set.bonuses['8pc']) {
        activeTier = '8pc';
    } else if (pieceCount >= 4 && set.bonuses['4pc']) {
        activeTier = '4pc';
    } else if (pieceCount >= 2 && set.bonuses['2pc']) {
        activeTier = '2pc';
    }

    // Retourner UNIQUEMENT le bonus du palier activé (non-cumulatif)
    if (activeTier) {
        return {
            critRate: set.bonuses[activeTier].critRate || 0,
            critDMG: set.bonuses[activeTier].critDMG || 0,
            defPen: set.bonuses[activeTier].defPen || 0,
        };
    }

    // Aucun bonus si < 2 pièces
    return {
        critRate: 0,
        critDMG: 0,
        defPen: 0,
    };
};
