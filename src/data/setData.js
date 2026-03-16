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

    // === NEW META SETS (4pc / 8pc only, 8pc replaces 4pc) ===

    'architect-blue-poison': {
        id: 'architect-blue-poison',
        name: "The Architect's Blue Poison",
        frenchName: 'Poison Bleu de l\'Architecte',
        description: 'Set DPS pour ATK/DEF scalers — Basic Skill + ATK/DEF stacking',
        isNewMeta: true,
        bonuses: {
            '2pc': {
                critRate: 0, critDMG: 0, defPen: 0,
                description: 'Aucun bonus (set 4pc/8pc uniquement)'
            },
            '4pc': {
                critRate: 0, critDMG: 0, defPen: 0,
                basicSkillDamage: 20,
                attack: 30,       // +1%/s ×30 stacks = +30% ATK (permanent)
                defense: 30,      // +1%/s ×30 stacks = +30% DEF (permanent)
                description: '[Poison] +20% Basic Skill DMG, +30% ATK & DEF (1%/s ×30, permanent)'
            },
            '8pc': {
                critRate: 0, critDMG: 0, defPen: 20,
                basicSkillDamage: 30,
                attack: 75,       // +2.5%/s ×30 stacks = +75% ATK
                defense: 75,      // +2.5%/s ×30 stacks = +75% DEF
                description: '[Blue Poison] +20% DefPen, +30% Basic Skill DMG, +75% ATK & DEF (2.5%/s ×30)'
            }
        },
        classBonus: {
            classes: ['Striker'],
            alsoSung: true,
            effects: { damageDealt: 50 },
            disables: 'Poison',
            description: 'Sung/Striker: +50% DMG dealt, [Poison] désactivé'
        }
    },

    'kamish-obsession': {
        id: 'kamish-obsession',
        name: "Kamish's Obsession",
        frenchName: 'Obsession de Kamish',
        description: 'Set Overload/Élémentaliste — Overload DMG + Basic/Ulti sur Overload',
        isNewMeta: true,
        bonuses: {
            '2pc': {
                critRate: 0, critDMG: 0, defPen: 0,
                description: 'Aucun bonus (set 4pc/8pc uniquement)'
            },
            '4pc': {
                critRate: 0, critDMG: 0, defPen: 0,
                overloadDamage: 15,
                basicSkillDamage: 25,      // on Overload inflict (20s, CD 20s)
                ultimateSkillDamage: 25,
                description: '[Obsession] +15% Overload DMG (team), +25% Basic/Ulti Skill DMG on Overload (20s)'
            },
            '8pc': {
                critRate: 0, critDMG: 0, defPen: 0,
                overloadDamage: 30,
                basicSkillDamage: 40,      // on Overload inflict (20s, CD 20s)
                ultimateSkillDamage: 40,
                description: '[Burning Obsession] +30% Overload DMG (team), +40% Basic/Ulti Skill DMG on Overload (20s)'
            }
        },
        classBonus: {
            classes: ['Elemental Stacker'],
            alsoSung: true,
            effects: { overloadDamage: 50, elementalWeaknessDamage: 20 },
            disables: 'Obsession',
            description: 'Sung/Elemental Stacker: +50% Overload DMG, +20% Elemental Weakness DMG, [Obsession] désactivé'
        }
    },

    'glorious-arrogance': {
        id: 'glorious-arrogance',
        name: 'Glorious Arrogance',
        frenchName: 'Arrogance Glorieuse',
        description: 'Set Breaker/Crit — Break DMG + CritDMG team',
        isNewMeta: true,
        bonuses: {
            '2pc': {
                critRate: 0, critDMG: 0, defPen: 0,
                description: 'Aucun bonus (set 4pc/8pc uniquement)'
            },
            '4pc': {
                critRate: 0, critDMG: 15, defPen: 0,
                breakSkillDamage: 30,
                description: '[Arrogance] +30% Break skill DMG, Break hit → +15% CritDMG (team, 40s)'
            },
            '8pc': {
                critRate: 15, critDMG: 25, defPen: 0,
                breakSkillDamage: 50,
                breakEffectiveness: 30,
                description: '[Brilliant Arrogance] +30% Break effectiveness, +50% Break skill DMG, +25% CritDMG (team, 40s), Ulti → +15% CritRate (team, 60s)'
            }
        },
        classBonus: {
            classes: ['Breaker'],
            alsoSung: true,
            effects: { critDMG: 40 },
            disables: 'Arrogance',
            description: 'Sung/Breaker: +40% CritDMG (self), [Arrogance] désactivé'
        }
    },

    'noble-flesh': {
        id: 'noble-flesh',
        name: 'Noble Flesh',
        frenchName: 'Chair Noble',
        description: 'Set Support — Elemental Weakness DMG + DMG dealt team',
        isNewMeta: true,
        bonuses: {
            '2pc': {
                critRate: 0, critDMG: 0, defPen: 0,
                description: 'Aucun bonus (set 4pc/8pc uniquement)'
            },
            '4pc': {
                critRate: 0, critDMG: 0, defPen: 0,
                elementalWeaknessDamage: 15,
                damageDealt: 10,
                description: '[Fortification] +15% Elem Weakness DMG (team, 45s) + [Brilliant Light] +10% DMG dealt (team, 20s)'
            },
            '8pc': {
                critRate: 0, critDMG: 0, defPen: 0,
                elementalWeaknessDamage: 25,
                damageDealt: 20,
                description: '[Iron Body] +25% Elem Weakness DMG (team, 45s) + [Glory] +20% DMG dealt (team, 20s)'
            }
        },
        classBonus: {
            classes: ['Supporter'],
            alsoSung: true,
            effects: { basicSkillDamage: 30, attack: 15, defense: 15, hp: 15 },
            disables: 'Fortification/Brilliant Light',
            description: 'Sung/Supporter: +30% Basic Skill DMG, +15% ATK/DEF/HP (team), [Fortification]/[Brilliant Light] désactivés'
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

    const defaultBonuses = {
        critRate: 0,
        critDMG: 0,
        defPen: 0,
    };

    // Retourner UNIQUEMENT le bonus du palier activé (non-cumulatif)
    if (activeTier) {
        const tierData = set.bonuses[activeTier];
        return {
            critRate: tierData.critRate || 0,
            critDMG: tierData.critDMG || 0,
            defPen: tierData.defPen || 0,
            // Extended stats for new meta sets
            attack: tierData.attack || 0,
            defense: tierData.defense || 0,
            hp: tierData.hp || 0,
            basicSkillDamage: tierData.basicSkillDamage || 0,
            ultimateSkillDamage: tierData.ultimateSkillDamage || 0,
            damageDealt: tierData.damageDealt || 0,
            overloadDamage: tierData.overloadDamage || 0,
            elementalWeaknessDamage: tierData.elementalWeaknessDamage || 0,
            breakSkillDamage: tierData.breakSkillDamage || 0,
            breakEffectiveness: tierData.breakEffectiveness || 0,
        };
    }

    // Aucun bonus si < 2 pièces
    return defaultBonuses;
};

// Helper pour obtenir le class bonus d'un set (Sung/Striker/Breaker/etc.)
export const getSetClassBonus = (setId) => {
    const set = ARTIFACT_SETS[setId];
    if (!set || !set.classBonus) return null;
    return set.classBonus;
};
