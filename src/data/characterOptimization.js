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
    // Buffs Def Pen totaux (A5 + Armed): Arme 15% + A5 Team 10% + A4 RAID 18% + Armed 18% = 61%
    // Avec 70K raw max (~33%) → Total ~94% Def Pen atteignable
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
            note: "Sian scale sur l'ATK - Focus Def Pen car il buff énormément"
        },

        sweetSpots: {
            critRate: {
                min: 85,
                max: 100,
                ideal: 95,
                priority: 2,
                status: "HIGH",
                color: "#22c55e",
                rawMax: 16000, // Max 16K raw TC
                note: "95%+ pour consistance - Max 16K raw"
            },
            critDMG: {
                min: 170,
                max: 220,
                ideal: 200,
                priority: 3,
                status: "MODERATE",
                color: "#f59e0b",
                note: "200% suffit - Focus sur Def Pen plutôt"
            },
            defPen: {
                min: 95,
                max: 100,
                ideal: 100,
                priority: 1,
                status: "CAP",
                color: "#8b5cf6",
                rawMax: 70000, // Max 70K raw Def Pen
                note: "Avec ses buffs (61%), vise 100% Def Pen - C'est atteignable !"
            }
        },

        substatPriority: ["Def Pen", "ATK%", "Crit Rate%", "Crit DMG%"],

        scaling: {
            atk: { grade: "A+", description: "Bon scaling, prioritaire après Def Pen" },
            critDMG: { grade: "A", description: "Utile mais pas prioritaire" },
            defPen: { grade: "S+", description: "ROI énorme grâce à ses buffs cumulés" },
            critRate: { grade: "A", description: "Important pour la consistance" }
        },

        tips: [
            "Sian A5 donne +10% Def Pen à la TEAM Dark (pas Sung !)",
            "Sian A4 donne +3% Def Pen par Dark hunter au RAID (6×3% = 18%)",
            "Son arme A5 donne +15% Def Pen personnel",
            "Armed 4pc (+18% Def Pen) - Total buffs = 61% Def Pen !",
            "Max 70K raw Def Pen recommandé (~33% raw + 61% buffs = 94%)"
        ],

        recommendedSets: ["Armed 4pc + Expert 4pc", "Armed 4pc + Obsidian 4pc"],

        benchmarks: {
            casual: { critRate: 70, critDMG: 150, defPen: 70, dps: "10-20B" },
            intermediate: { critRate: 85, critDMG: 180, defPen: 85, dps: "30-50B" },
            advanced: { critRate: 95, critDMG: 200, defPen: 95, dps: "50-80B" },
            whale: { critRate: 100, critDMG: 200, defPen: 100, dps: "80-120B" }
        }
    },

    // 🔨 Son Kihoon - DPS Break Specialist
    // Buffs Def Pen: Sian A4 RAID 18% + Sian A5 team 10% + Armed 18% = 46% (pas d'arme Def Pen)
    // Focus DCC car son A5 buff la team en DCC (+15-30%)
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
            note: "Son scale sur l'ATK - Focus DCC car il buff la team en DCC"
        },

        sweetSpots: {
            critRate: {
                min: 85,
                max: 100,
                ideal: 95,
                priority: 2,
                status: "HIGH",
                color: "#22c55e",
                rawMax: 16000,
                note: "95%+ pour consistance - Max 16K raw"
            },
            critDMG: {
                min: 200,
                max: 250,
                ideal: 220,
                priority: 1,
                status: "PRIORITY",
                color: "#f59e0b",
                note: "Son A5 +15-30% DCC team - Priorité haute"
            },
            defPen: {
                min: 70,
                max: 85,
                ideal: 77,
                priority: 3,
                status: "MODERATE",
                color: "#8b5cf6",
                rawMax: 70000,
                note: "Buffs team 46% + 70K raw (~33%) = ~79% - Sweet spot 77%"
            }
        },

        substatPriority: ["Crit DMG%", "ATK%", "Crit Rate%", "Def Pen"],

        scaling: {
            atk: { grade: "A+", description: "Bon scaling après DCC" },
            critDMG: { grade: "S+", description: "Énorme ROI avec son buff A5 team" },
            defPen: { grade: "A", description: "Utile via buffs team (46%)" },
            critRate: { grade: "A", description: "Important pour consistance" }
        },

        tips: [
            "Son A5 donne +15% DCC à sa team (+30% si Break State !)",
            "Chaotic Desire 8pc = son set signature (DCC focus)",
            "Bénéficie des buffs Def Pen de Sian (46% total sans arme)",
            "Son arme ne donne PAS de buff Def Pen",
            "Max 70K raw Def Pen (~33% raw + 46% buffs = 79%)"
        ],

        recommendedSets: ["Chaotic Desire 8pc", "Armed 4pc + Expert 4pc"],

        benchmarks: {
            casual: { critRate: 70, critDMG: 170, defPen: 55, dps: "15-25B" },
            intermediate: { critRate: 85, critDMG: 200, defPen: 65, dps: "35-55B" },
            advanced: { critRate: 95, critDMG: 220, defPen: 75, dps: "55-85B" },
            whale: { critRate: 100, critDMG: 240, defPen: 80, dps: "85-120B" }
        }
    },

    // 🔮 Lee Bora - Support DPS
    // Buffs Def Pen: Sian A4 RAID 18% + Sian A5 team 10% + Armed 18% = 46%
    // Support = moins de focus sur les stats perso, plus sur les buffs qu'elle apporte
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
            note: "Support - Focus sur ses buffs TC/DCC pour la team Dark"
        },

        sweetSpots: {
            critRate: {
                min: 80,
                max: 100,
                ideal: 90,
                priority: 2,
                status: "HIGH",
                color: "#22c55e",
                rawMax: 16000,
                note: "90% recommandé - Max 16K raw"
            },
            critDMG: {
                min: 170,
                max: 210,
                ideal: 190,
                priority: 1,
                status: "PRIORITY",
                color: "#f59e0b",
                note: "A2 donne +6% TC/DCC perso + buff RAID Dark"
            },
            defPen: {
                min: 65,
                max: 80,
                ideal: 72,
                priority: 3,
                status: "MODERATE",
                color: "#8b5cf6",
                rawMax: 70000,
                note: "Buffs team 46% + raw - Sweet spot ~72%"
            }
        },

        substatPriority: ["Crit DMG%", "Crit Rate%", "ATK%", "Def Pen"],

        scaling: {
            atk: { grade: "B+", description: "Scaling moyen - focus buffs" },
            critDMG: { grade: "A+", description: "Important pour ses contributions" },
            defPen: { grade: "A", description: "Bénéficie des buffs team (46%)" },
            critRate: { grade: "A", description: "Important pour consistance" }
        },

        tips: [
            "Lee Bora A2 donne +6% TC/DCC personnel + buff RAID Dark",
            "Son arme A5 donne des buffs RAID importants (TC/DCC)",
            "Bénéficie des buffs Def Pen de Sian (46% total)",
            "Angel + Chaotic Wish pour survie et buffs"
        ],

        recommendedSets: ["Angel 4pc + Chaotic Wish 4pc", "Guardian 4pc + Sylph 4pc"],

        benchmarks: {
            casual: { critRate: 65, critDMG: 140, defPen: 50, dps: "5-10B" },
            intermediate: { critRate: 80, critDMG: 170, defPen: 60, dps: "12-22B" },
            advanced: { critRate: 90, critDMG: 190, defPen: 70, dps: "22-35B" },
            whale: { critRate: 95, critDMG: 200, defPen: 75, dps: "35-50B" }
        }
    },

    // ⚔️ Ilhwan - DPS Assassin
    // Buffs Def Pen: Sian A4 RAID 18% + Sian A5 team 10% + Armed 18% = 46%
    // Focus TC/DCC car son A5 donne +36% TC personnel
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
            note: "Assassin - Focus TC/DCC car A5 donne +36% TC perso"
        },

        sweetSpots: {
            critRate: {
                min: 90,
                max: 100,
                ideal: 100,
                priority: 1,
                status: "CAP",
                color: "#22c55e",
                rawMax: 16000,
                note: "Cap 100% obligatoire - A5 donne +36% TC perso"
            },
            critDMG: {
                min: 200,
                max: 250,
                ideal: 220,
                priority: 1,
                status: "PRIORITY",
                color: "#f59e0b",
                note: "Focus DCC après cap TC - Son arme buff DCC"
            },
            defPen: {
                min: 70,
                max: 85,
                ideal: 77,
                priority: 2,
                status: "HIGH",
                color: "#8b5cf6",
                rawMax: 70000,
                note: "Buffs team 46% + 70K raw = ~79% - Sweet spot 77%"
            }
        },

        substatPriority: ["Crit DMG%", "Crit Rate%", "Def Pen", "ATK%"],

        scaling: {
            atk: { grade: "A", description: "Bon scaling standard" },
            critDMG: { grade: "S", description: "Excellent ROI avec cap TC" },
            defPen: { grade: "A+", description: "Bénéficie des buffs team (46%)" },
            critRate: { grade: "S", description: "Cap crucial - A5 +36% TC perso" }
        },

        tips: [
            "Ilhwan A5 donne +36% TC personnel (3×12%)",
            "Son arme donne aussi des buffs de DCC perso",
            "Bénéficie des buffs Def Pen de Sian (46% total)",
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

    // 💎 Isla - Support Buffer (Focus: Damage Increase > Defense)
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
            note: "Isla scale sur la DEF - Focus Damage Increase pour buff team, puis DEF pour scaling"
        },

        sweetSpots: {
            // 🎯 PRIORITÉ 1 : Damage Increase - Isla buff sa team, DI amplifie tout !
            damageIncrease: {
                min: 25,
                max: 45,
                ideal: 35,
                priority: 1,
                status: "HIGH",
                color: "#ef4444",
                note: "PRIORITÉ #1 - Damage Increase amplifie les dégâts de toute la team !"
            },
            // 🎯 PRIORITÉ 2 : Defense - Son scaling stat
            defense: {
                min: 12000,
                max: 20000,
                ideal: 16000,
                priority: 2,
                status: "HIGH",
                color: "#3b82f6",
                note: "PRIORITÉ #2 - Isla scale sur DEF, maximise après DI"
            },
            critRate: {
                min: 60,
                max: 85,
                ideal: 75,
                priority: 3,
                status: "MEDIUM",
                color: "#22c55e",
                note: "Utile pour son DPS personnel mais secondaire"
            },
            critDMG: {
                min: 120,
                max: 180,
                ideal: 150,
                priority: 4,
                status: "LOW",
                color: "#f59e0b",
                note: "Après DI et DEF"
            },
            defPen: {
                min: 30,
                max: 50,
                ideal: 40,
                priority: 5,
                status: "LOW",
                color: "#8b5cf6",
                note: "Pas prioritaire pour un support"
            }
        },

        substatPriority: ["Damage Increase%", "DEF%", "HP%", "Crit Rate%"],

        scaling: {
            def: { grade: "S", description: "Scaling principal" },
            damageIncrease: { grade: "S", description: "PRIORITÉ - Amplifie tout" },
            critDMG: { grade: "B", description: "Secondaire" },
            defPen: { grade: "C", description: "Négligeable" },
            critRate: { grade: "B", description: "Secondaire" }
        },

        tips: [
            "PRIORITÉ : Damage Increase > Defense > le reste",
            "Isla A0 donne +12% TC et +12% DCC à sa TEAM",
            "Damage Increase amplifie les dégâts de toute l'équipe",
            "DEF est son scaling stat - maximise après DI",
            "Guardian + Sylph pour équilibrer DI et survie"
        ],

        recommendedSets: ["Guardian 4pc + Sylph 4pc", "Angel 4pc + Guardian 4pc"],

        benchmarks: {
            casual: { damageIncrease: 20, defense: 10000, critRate: 40, dps: "2-5B" },
            intermediate: { damageIncrease: 28, defense: 13000, critRate: 55, dps: "5-10B" },
            advanced: { damageIncrease: 35, defense: 16000, critRate: 70, dps: "10-18B" },
            whale: { damageIncrease: 42, defense: 19000, critRate: 80, dps: "18-28B" }
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
