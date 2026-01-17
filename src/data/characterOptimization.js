// 🎯 CHARACTER OPTIMIZATION DATA
// Sweet spots et recommandations d'optimisation pour chaque personnage
// Basé sur les données de la communauté et les mécaniques du jeu

export const CHARACTER_OPTIMIZATION = {
    // ═══════════════════════════════════════════════════════════════
    // 🌑 DARK ELEMENT CHARACTERS
    // ═══════════════════════════════════════════════════════════════

    // 🐺 Silver Mane Baek Yoonho - DPS Burst ultime
    silverbaek: {
        id: 'silverbaek',
        name: "Silver Mane Baek Yoonho",
        role: "DPS Burst",
        element: "Dark",
        tier: "S+",

        // 💪 Stat principale de scaling
        mainStat: {
            type: 'atk',
            label: 'ATK',
            icon: '⚔️',
            color: '#ef4444',
            benchmarks: {
                casual: 35000,
                intermediate: 42000,
                advanced: 48000,
                whale: 52000
            },
            note: "Baek scale massivement sur l'ATK - Les top whales visent 52-56K"
        },

        sweetSpots: {
            critRate: {
                min: 95,
                max: 100,
                ideal: 100,
                priority: 1,
                status: "CAP",
                color: "#22c55e", // green
                note: "Cap obligatoire à 100% - Baek crit à chaque coup"
            },
            defPen: {
                min: 70,
                max: 82,
                ideal: 77,
                priority: 2,
                status: "PRIORITY",
                color: "#8b5cf6", // violet
                note: "Def Pen prioritaire pour stabiliser Baek - Sweet spot 75-80%"
            },
            critDMG: {
                min: 200,
                max: 300,
                ideal: 250,
                priority: 3,
                status: "MODERATE",
                color: "#f59e0b", // amber
                note: "Important mais après Def Pen - Trop de DCC pas worth"
            }
        },

        substatPriority: ["ATK%", "Def Pen", "Crit DMG%", "Crit Rate%"],

        scaling: {
            atk: { grade: "S+", description: "Scale massivement - Passifs multiplient ATK" },
            critDMG: { grade: "S", description: "Multiplicateur direct très efficace" },
            defPen: { grade: "A", description: "Important jusqu'au sweet spot" },
            critRate: { grade: "B", description: "Juste besoin d'atteindre le cap" }
        },

        tips: [
            "Baek a des passifs qui augmentent ses dégâts quand ses HP sont bas",
            "Def Pen > DCC pour stabiliser Baek - Trop de DCC pas worth au bout d'un moment",
            "Armed 4pc (+18% Def Pen) est quasi-obligatoire",
            "Les top Baek font 170-200B sur 3 min avec ~77% Def Pen et 52K+ ATK",
            "500 ATK ≈ 1000 Def Pen en valeur marginale une fois au sweet spot",
            "DCC affichée = valeur / (50000 + valeur) - 200% affiché ≈ bonne DCC"
        ],

        recommendedSets: ["Armed 4pc + Obsidian 4pc", "Armed 4pc + Expert 4pc"],

        benchmarks: {
            casual: { critRate: 80, critDMG: 150, defPen: 50, dps: "20-40B" },
            intermediate: { critRate: 95, critDMG: 180, defPen: 65, dps: "60-100B" },
            advanced: { critRate: 100, critDMG: 200, defPen: 75, dps: "100-150B" },
            whale: { critRate: 100, critDMG: 200, defPen: 77, dps: "170-200B" }
        }
    },

    // 🗡️ Sian Halat - DPS / Debuffer Dark
    sian: {
        id: 'sian',
        name: "Sian Halat",
        role: "DPS / Debuffer",
        element: "Dark",
        tier: "S",

        // 💪 Stat principale de scaling
        mainStat: {
            type: 'atk',
            label: 'ATK',
            icon: '⚔️',
            color: '#ef4444',
            benchmarks: {
                casual: 30000,
                intermediate: 38000,
                advanced: 44000,
                whale: 50000
            },
            note: "Sian scale sur l'ATK mais moins que Baek"
        },

        sweetSpots: {
            critRate: {
                min: 85,
                max: 100,
                ideal: 95,
                priority: 2,
                status: "HIGH",
                color: "#22c55e",
                note: "Viser 95%+ pour consistance"
            },
            critDMG: {
                min: 180,
                max: 250,
                ideal: 210,
                priority: 2,
                status: "HIGH",
                color: "#f59e0b",
                note: "Équilibrer avec Def Pen"
            },
            defPen: {
                min: 65,
                max: 80,
                ideal: 72,
                priority: 1,
                status: "PRIORITY",
                color: "#8b5cf6",
                note: "Sian bénéficie beaucoup du Def Pen (debuff)"
            }
        },

        substatPriority: ["Def Pen", "Crit DMG%", "Crit Rate%", "ATK%"],

        scaling: {
            atk: { grade: "A", description: "Bon scaling mais pas exceptionnel" },
            critDMG: { grade: "A+", description: "Très efficace sur ses bursts" },
            defPen: { grade: "S", description: "Synergise avec ses debuffs" },
            critRate: { grade: "A", description: "Important pour la consistance" }
        },

        tips: [
            "Sian A4 donne +3% Def Pen par Dark hunter au RAID",
            "Son arme donne du Def Pen personnel (+15% à A5)",
            "Excellent support DPS pour les teams Dark",
            "Armed 4pc est excellent sur lui aussi"
        ],

        recommendedSets: ["Armed 4pc + Expert 4pc", "Armed 4pc + Obsidian 4pc"],

        benchmarks: {
            casual: { critRate: 70, critDMG: 130, defPen: 40, dps: "10-20B" },
            intermediate: { critRate: 85, critDMG: 170, defPen: 55, dps: "30-50B" },
            advanced: { critRate: 95, critDMG: 200, defPen: 70, dps: "50-80B" },
            whale: { critRate: 100, critDMG: 230, defPen: 78, dps: "80-110B" }
        }
    },

    // 🔨 Son Kihoon - DPS Break Specialist
    son: {
        id: 'son',
        name: "Son Kihoon",
        role: "DPS / Break Specialist",
        element: "Dark",
        tier: "S",

        // 💪 Stat principale de scaling
        mainStat: {
            type: 'atk',
            label: 'ATK',
            icon: '⚔️',
            color: '#ef4444',
            benchmarks: {
                casual: 32000,
                intermediate: 40000,
                advanced: 46000,
                whale: 52000
            },
            note: "Son scale sur l'ATK - Focus DCC pour amplifier ses buffs"
        },

        sweetSpots: {
            critRate: {
                min: 80,
                max: 100,
                ideal: 90,
                priority: 2,
                status: "HIGH",
                color: "#22c55e",
                note: "90%+ recommandé pour DPS consistant"
            },
            critDMG: {
                min: 180,
                max: 260,
                ideal: 220,
                priority: 1,
                status: "PRIORITY",
                color: "#f59e0b",
                note: "Son A5 donne +15-30% DCC à la team!"
            },
            defPen: {
                min: 50,
                max: 70,
                ideal: 60,
                priority: 3,
                status: "MODERATE",
                color: "#8b5cf6",
                note: "Moins prioritaire - focus sur DCC"
            }
        },

        substatPriority: ["Crit DMG%", "Crit Rate%", "ATK%", "Def Pen"],

        scaling: {
            atk: { grade: "A", description: "Scaling standard" },
            critDMG: { grade: "S+", description: "Énorme avec son buff A5" },
            defPen: { grade: "B+", description: "Utile mais pas prioritaire" },
            critRate: { grade: "A", description: "Besoin de consistance" }
        },

        tips: [
            "Son A5 donne +15% DCC à sa team (+30% si Break State)",
            "Excellent pour les phases de Break sur les boss",
            "Son arme ne donne PAS de buff (contrairement à d'autres)",
            "Chaotic Desire 8pc est son set signature"
        ],

        recommendedSets: ["Chaotic Desire 8pc", "Armed 4pc + Expert 4pc"],

        benchmarks: {
            casual: { critRate: 65, critDMG: 140, defPen: 30, dps: "15-25B" },
            intermediate: { critRate: 80, critDMG: 180, defPen: 45, dps: "35-55B" },
            advanced: { critRate: 90, critDMG: 210, defPen: 55, dps: "55-85B" },
            whale: { critRate: 95, critDMG: 250, defPen: 65, dps: "85-120B" }
        }
    },

    // 🔮 Lee Bora - Support DPS
    lee: {
        id: 'lee',
        name: "Lee Bora",
        role: "Support / Sub-DPS",
        element: "Dark",
        tier: "A+",

        // 💪 Stat principale de scaling
        mainStat: {
            type: 'atk',
            label: 'ATK',
            icon: '⚔️',
            color: '#ef4444',
            benchmarks: {
                casual: 25000,
                intermediate: 32000,
                advanced: 38000,
                whale: 44000
            },
            note: "Support - L'ATK est secondaire, focus sur les buffs qu'elle apporte"
        },

        sweetSpots: {
            critRate: {
                min: 70,
                max: 95,
                ideal: 85,
                priority: 2,
                status: "MODERATE",
                color: "#22c55e",
                note: "Support - 85% suffit généralement"
            },
            critDMG: {
                min: 150,
                max: 220,
                ideal: 180,
                priority: 2,
                status: "MODERATE",
                color: "#f59e0b",
                note: "Balance avec ses buffs de team"
            },
            defPen: {
                min: 40,
                max: 60,
                ideal: 50,
                priority: 3,
                status: "LOW",
                color: "#8b5cf6",
                note: "Pas prioritaire - focus sur les buffs"
            }
        },

        substatPriority: ["Crit Rate%", "Crit DMG%", "ATK%", "Def Pen"],

        scaling: {
            atk: { grade: "B+", description: "Scaling moyen" },
            critDMG: { grade: "A", description: "Bon pour son DPS personnel" },
            defPen: { grade: "B", description: "Secondaire" },
            critRate: { grade: "A", description: "Important pour consistance" }
        },

        tips: [
            "Lee Bora A2 donne +6% TC/DCC personnel + buff RAID Dark",
            "Son arme A5 donne des buffs RAID importants (TC/DCC)",
            "Excellent support pour booster toute l'équipe Dark",
            "Priorité = survivabilité et maintien des buffs"
        ],

        recommendedSets: ["Angel 4pc + Chaotic Wish 4pc", "Guardian 4pc + Sylph 4pc"],

        benchmarks: {
            casual: { critRate: 55, critDMG: 110, defPen: 20, dps: "5-10B" },
            intermediate: { critRate: 70, critDMG: 150, defPen: 35, dps: "12-22B" },
            advanced: { critRate: 85, critDMG: 175, defPen: 45, dps: "22-35B" },
            whale: { critRate: 90, critDMG: 200, defPen: 55, dps: "35-50B" }
        }
    },

    // ⚔️ Ilhwan - DPS Assassin
    ilhwan: {
        id: 'ilhwan',
        name: "Ilhwan",
        role: "DPS Assassin",
        element: "Dark",
        tier: "A+",

        // 💪 Stat principale de scaling
        mainStat: {
            type: 'atk',
            label: 'ATK',
            icon: '⚔️',
            color: '#ef4444',
            benchmarks: {
                casual: 28000,
                intermediate: 36000,
                advanced: 42000,
                whale: 48000
            },
            note: "Assassin - L'ATK est importante mais le burst vient surtout des crits"
        },

        sweetSpots: {
            critRate: {
                min: 90,
                max: 100,
                ideal: 100,
                priority: 1,
                status: "CAP",
                color: "#22c55e",
                note: "Assassin = besoin de crits constants"
            },
            critDMG: {
                min: 180,
                max: 250,
                ideal: 220,
                priority: 1,
                status: "PRIORITY",
                color: "#f59e0b",
                note: "Son A5 donne +36% TC - focus DCC"
            },
            defPen: {
                min: 55,
                max: 75,
                ideal: 65,
                priority: 2,
                status: "MODERATE",
                color: "#8b5cf6",
                note: "Important mais après CR/DCC"
            }
        },

        substatPriority: ["Crit DMG%", "Crit Rate%", "Def Pen", "ATK%"],

        scaling: {
            atk: { grade: "A", description: "Bon scaling standard" },
            critDMG: { grade: "S", description: "Excellent avec son +36% TC" },
            defPen: { grade: "A", description: "Bon pour percer les défenses" },
            critRate: { grade: "A+", description: "Cap important pour assassin" }
        },

        tips: [
            "Ilhwan A5 donne +36% TC personnel (3×12%)",
            "Son arme donne aussi des buffs de DCC",
            "Excellent burst damage sur cibles uniques",
            "Armed 4pc + Expert 4pc est optimal"
        ],

        recommendedSets: ["Armed 4pc + Expert 4pc", "Armed 4pc + Obsidian 4pc"],

        benchmarks: {
            casual: { critRate: 70, critDMG: 140, defPen: 35, dps: "12-20B" },
            intermediate: { critRate: 85, critDMG: 180, defPen: 50, dps: "25-40B" },
            advanced: { critRate: 95, critDMG: 210, defPen: 60, dps: "45-70B" },
            whale: { critRate: 100, critDMG: 240, defPen: 72, dps: "70-100B" }
        }
    },

    // 💎 Isla - Support Buffer
    isla: {
        id: 'isla',
        name: "Isla Wright",
        role: "Support / Buffer",
        element: "Dark",
        tier: "A",

        // 💪 Stat principale de scaling - Isla scale sur la DEF !
        mainStat: {
            type: 'def',
            label: 'DEF',
            icon: '🛡️',
            color: '#3b82f6',
            benchmarks: {
                casual: 8000,
                intermediate: 12000,
                advanced: 16000,
                whale: 20000
            },
            note: "Isla scale sur la DEF - Mais c'est un support, sa survie compte plus que son DPS"
        },

        sweetSpots: {
            critRate: {
                min: 60,
                max: 85,
                ideal: 75,
                priority: 3,
                status: "LOW",
                color: "#22c55e",
                note: "Support - stats perso moins importantes"
            },
            critDMG: {
                min: 120,
                max: 180,
                ideal: 150,
                priority: 3,
                status: "LOW",
                color: "#f59e0b",
                note: "Focus sur la survie et les buffs"
            },
            defPen: {
                min: 30,
                max: 50,
                ideal: 40,
                priority: 3,
                status: "LOW",
                color: "#8b5cf6",
                note: "Pas prioritaire du tout"
            }
        },

        substatPriority: ["HP%", "DEF%", "Crit Rate%", "ATK%"],

        scaling: {
            atk: { grade: "B", description: "Scaling faible" },
            critDMG: { grade: "B", description: "Pas important" },
            defPen: { grade: "C", description: "Négligeable" },
            critRate: { grade: "B", description: "Secondaire" }
        },

        tips: [
            "Isla A0 donne +12% TC et +12% DCC à sa TEAM",
            "Son rôle principal est de buffer, pas de DPS",
            "Privilégie la survie pour maintenir ses buffs actifs",
            "Guardian + Sylph pour la tankiness"
        ],

        recommendedSets: ["Guardian 4pc + Sylph 4pc", "Angel 4pc + Guardian 4pc"],

        benchmarks: {
            casual: { critRate: 40, critDMG: 90, defPen: 15, dps: "2-5B" },
            intermediate: { critRate: 55, critDMG: 120, defPen: 25, dps: "5-10B" },
            advanced: { critRate: 70, critDMG: 145, defPen: 35, dps: "10-18B" },
            whale: { critRate: 80, critDMG: 170, defPen: 45, dps: "18-28B" }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 👑 SUNG JIN-WOO
    // ═══════════════════════════════════════════════════════════════

    sung: {
        id: 'sung',
        name: "Sung Jin-Woo",
        role: "DPS Universel",
        element: "None",
        tier: "SSS",

        // 💪 Stat principale de scaling
        mainStat: {
            type: 'atk',
            label: 'ATK',
            icon: '⚔️',
            color: '#ef4444',
            benchmarks: {
                casual: 40000,
                intermediate: 50000,
                advanced: 58000,
                whale: 65000
            },
            note: "Sung est le roi - Les whales visent 60K+ ATK"
        },

        sweetSpots: {
            critRate: {
                min: 95,
                max: 100,
                ideal: 100,
                priority: 1,
                status: "CAP",
                color: "#22c55e",
                note: "Cap obligatoire - Sung doit toujours crit"
            },
            critDMG: {
                min: 200,
                max: 280,
                ideal: 240,
                priority: 1,
                status: "MAXIMIZE",
                color: "#f59e0b",
                note: "Priorité maximale après le cap CR"
            },
            defPen: {
                min: 60,
                max: 80,
                ideal: 70,
                priority: 2,
                status: "HIGH",
                color: "#8b5cf6",
                note: "Important mais après CR/DCC"
            }
        },

        substatPriority: ["Crit DMG%", "Crit Rate%", "ATK%", "Def Pen"],

        scaling: {
            atk: { grade: "S", description: "Excellent scaling" },
            critDMG: { grade: "S+", description: "Scale massivement" },
            defPen: { grade: "A+", description: "Très utile" },
            critRate: { grade: "A", description: "Cap puis ignore" }
        },

        tips: [
            "Sung bénéficie de TOUS les buffs (pas de restriction élémentaire)",
            "Burning Greed 8pc est son set signature",
            "Il reçoit les buffs Dark même s'il n'est pas Dark",
            "Toujours en position 1 pour maximiser les buffs reçus"
        ],

        recommendedSets: ["Burning Greed 8pc", "Burning Greed 4pc + Armed 4pc"],

        benchmarks: {
            casual: { critRate: 75, critDMG: 160, defPen: 40, dps: "30-50B" },
            intermediate: { critRate: 90, critDMG: 200, defPen: 55, dps: "70-110B" },
            advanced: { critRate: 100, critDMG: 235, defPen: 68, dps: "130-180B" },
            whale: { critRate: 100, critDMG: 270, defPen: 78, dps: "200-280B" }
        }
    }
};

// Helper pour obtenir le statut d'optimisation d'une stat
export const getOptimizationStatus = (characterId, statName, currentValue) => {
    const charOptim = CHARACTER_OPTIMIZATION[characterId];
    if (!charOptim || !charOptim.sweetSpots[statName]) {
        return { status: 'unknown', percentage: 0, color: '#6b7280' };
    }

    const spot = charOptim.sweetSpots[statName];
    const { min, max, ideal } = spot;

    if (currentValue >= ideal) {
        return {
            status: 'optimal',
            percentage: 100,
            color: '#22c55e',
            message: 'Optimal !'
        };
    } else if (currentValue >= min) {
        const percentage = ((currentValue - min) / (ideal - min)) * 100;
        return {
            status: 'good',
            percentage: Math.min(percentage, 95),
            color: '#84cc16',
            message: 'Bon'
        };
    } else if (currentValue >= min * 0.7) {
        const percentage = (currentValue / min) * 70;
        return {
            status: 'improving',
            percentage,
            color: '#f59e0b',
            message: 'À améliorer'
        };
    } else {
        const percentage = (currentValue / min) * 50;
        return {
            status: 'low',
            percentage: Math.max(percentage, 10),
            color: '#ef4444',
            message: 'Insuffisant'
        };
    }
};

// Helper pour obtenir le niveau global d'optimisation
export const getOverallOptimization = (characterId, stats) => {
    const charOptim = CHARACTER_OPTIMIZATION[characterId];
    if (!charOptim) return null;

    const statuses = {
        critRate: getOptimizationStatus(characterId, 'critRate', stats.critRate || 0),
        critDMG: getOptimizationStatus(characterId, 'critDMG', stats.critDMG || 0),
        defPen: getOptimizationStatus(characterId, 'defPen', stats.defPen || 0)
    };

    const avgPercentage = (statuses.critRate.percentage + statuses.critDMG.percentage + statuses.defPen.percentage) / 3;

    let overallStatus = 'low';
    let overallColor = '#ef4444';

    if (avgPercentage >= 90) {
        overallStatus = 'optimal';
        overallColor = '#22c55e';
    } else if (avgPercentage >= 70) {
        overallStatus = 'good';
        overallColor = '#84cc16';
    } else if (avgPercentage >= 50) {
        overallStatus = 'improving';
        overallColor = '#f59e0b';
    }

    return {
        statuses,
        avgPercentage,
        overallStatus,
        overallColor
    };
};

// Helper pour obtenir le benchmark actuel (avec stat principale optionnelle)
export const getCurrentBenchmark = (characterId, stats, mainStatValue = null) => {
    const charOptim = CHARACTER_OPTIMIZATION[characterId];
    if (!charOptim || !charOptim.benchmarks) return null;

    const { critRate = 0, critDMG = 0, defPen = 0 } = stats;
    const benchmarks = charOptim.benchmarks;

    // Calculer un score basé sur les stats secondaires
    const secondaryScore = (critRate * 1) + (critDMG * 0.5) + (defPen * 1.2);

    // Si la stat principale est fournie, l'inclure dans le calcul
    let mainStatScore = 0;
    let mainStatLevel = null;

    if (mainStatValue !== null && charOptim.mainStat) {
        const mainBenchmarks = charOptim.mainStat.benchmarks;
        if (mainStatValue >= mainBenchmarks.whale) {
            mainStatScore = 4;
            mainStatLevel = 'whale';
        } else if (mainStatValue >= mainBenchmarks.advanced) {
            mainStatScore = 3;
            mainStatLevel = 'advanced';
        } else if (mainStatValue >= mainBenchmarks.intermediate) {
            mainStatScore = 2;
            mainStatLevel = 'intermediate';
        } else {
            mainStatScore = 1;
            mainStatLevel = 'casual';
        }
    }

    // Déterminer le niveau basé sur les stats secondaires
    let secondaryLevel = 'casual';
    if (secondaryScore >= benchmarks.whale.critRate + benchmarks.whale.critDMG * 0.5 + benchmarks.whale.defPen * 1.2) {
        secondaryLevel = 'whale';
    } else if (secondaryScore >= benchmarks.advanced.critRate + benchmarks.advanced.critDMG * 0.5 + benchmarks.advanced.defPen * 1.2) {
        secondaryLevel = 'advanced';
    } else if (secondaryScore >= benchmarks.intermediate.critRate + benchmarks.intermediate.critDMG * 0.5 + benchmarks.intermediate.defPen * 1.2) {
        secondaryLevel = 'intermediate';
    }

    // Si on a la stat principale, faire une moyenne pondérée
    let finalLevel = secondaryLevel;
    if (mainStatLevel) {
        const levelOrder = ['casual', 'intermediate', 'advanced', 'whale'];
        const secondaryIdx = levelOrder.indexOf(secondaryLevel);
        const mainIdx = levelOrder.indexOf(mainStatLevel);
        // Stat principale compte pour 40%, stats secondaires pour 60%
        const avgIdx = Math.round(secondaryIdx * 0.6 + mainIdx * 0.4);
        finalLevel = levelOrder[avgIdx];
    }

    const levelInfo = {
        whale: { level: 'whale', label: '🐋 Whale', color: '#a855f7' },
        advanced: { level: 'advanced', label: '⭐ Avancé', color: '#f59e0b' },
        intermediate: { level: 'intermediate', label: '📈 Intermédiaire', color: '#3b82f6' },
        casual: { level: 'casual', label: '🌱 Débutant', color: '#6b7280' }
    };

    return {
        ...levelInfo[finalLevel],
        mainStatLevel: mainStatLevel ? levelInfo[mainStatLevel] : null
    };
};

// Helper pour obtenir le statut de la stat principale
export const getMainStatStatus = (characterId, currentValue) => {
    const charOptim = CHARACTER_OPTIMIZATION[characterId];
    if (!charOptim || !charOptim.mainStat) {
        return null;
    }

    const { benchmarks, label, icon, color } = charOptim.mainStat;

    if (currentValue >= benchmarks.whale) {
        return {
            status: 'whale',
            percentage: 100,
            color: '#a855f7',
            message: '🐋 Whale',
            nextTarget: null,
            remaining: 0
        };
    } else if (currentValue >= benchmarks.advanced) {
        const progress = ((currentValue - benchmarks.advanced) / (benchmarks.whale - benchmarks.advanced)) * 100;
        return {
            status: 'advanced',
            percentage: 75 + progress * 0.25,
            color: '#f59e0b',
            message: '⭐ Avancé',
            nextTarget: benchmarks.whale,
            remaining: benchmarks.whale - currentValue
        };
    } else if (currentValue >= benchmarks.intermediate) {
        const progress = ((currentValue - benchmarks.intermediate) / (benchmarks.advanced - benchmarks.intermediate)) * 100;
        return {
            status: 'intermediate',
            percentage: 50 + progress * 0.25,
            color: '#3b82f6',
            message: '📈 Intermédiaire',
            nextTarget: benchmarks.advanced,
            remaining: benchmarks.advanced - currentValue
        };
    } else if (currentValue >= benchmarks.casual) {
        const progress = ((currentValue - benchmarks.casual) / (benchmarks.intermediate - benchmarks.casual)) * 100;
        return {
            status: 'casual',
            percentage: 25 + progress * 0.25,
            color: '#6b7280',
            message: '🌱 Débutant',
            nextTarget: benchmarks.intermediate,
            remaining: benchmarks.intermediate - currentValue
        };
    } else {
        const progress = (currentValue / benchmarks.casual) * 25;
        return {
            status: 'low',
            percentage: Math.max(progress, 5),
            color: '#ef4444',
            message: '❌ Insuffisant',
            nextTarget: benchmarks.casual,
            remaining: benchmarks.casual - currentValue
        };
    }
};

export default CHARACTER_OPTIMIZATION;
