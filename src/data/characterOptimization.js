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

        // Buffs Def Pen: Sian A4 RAID 18% + Sian A5 team 10% + Armed 18% = 46%
        // 71K raw ≈ 43.1% → Total ~89% Def Pen
        sweetSpots: {
            critRate: {
                min: 95,
                max: 100,
                ideal: 100,
                priority: 1,
                status: "CAP",
                color: "#22c55e", // green
                rawMax: 11000, // 10-12K raw TC suffit avec buffs team
                note: "Cap obligatoire à 100% - 10-12K raw suffit avec buffs team"
            },
            defPen: {
                min: 85,
                max: 92,
                ideal: 89,
                priority: 2,
                status: "PRIORITY",
                color: "#8b5cf6", // violet
                rawMax: 71000, // 71K raw ≈ 43.1% + 46% buffs = ~89%
                note: "71K raw (43%) + 46% buffs = ~89% Def Pen - Sweet spot optimal"
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
            defPen: { grade: "A", description: "Important jusqu'au sweet spot (89%)" },
            critRate: { grade: "B", description: "Juste besoin d'atteindre le cap" }
        },

        tips: [
            "Baek a des passifs qui augmentent ses dégâts quand ses HP sont bas",
            "Buffs Def Pen: Sian A4 18% + Sian A5 10% + Armed 18% = 46%",
            "71K raw Def Pen (~43%) + 46% buffs = ~89% total - Sweet spot !",
            "Armed 4pc (+18% Def Pen) est quasi-obligatoire",
            "Les top Baek font 170-200B sur 3 min avec ~89% Def Pen et 52K+ ATK",
            "10-12K raw TC suffit avec les buffs team (Isla +12%, Lee Bora...)"
        ],

        recommendedSets: ["Armed 4pc + Obsidian 4pc", "Armed 4pc + Expert 4pc"],

        benchmarks: {
            casual: { critRate: 80, critDMG: 150, defPen: 60, dps: "20-40B" },
            intermediate: { critRate: 95, critDMG: 180, defPen: 75, dps: "60-100B" },
            advanced: { critRate: 100, critDMG: 200, defPen: 85, dps: "100-150B" },
            whale: { critRate: 100, critDMG: 200, defPen: 89, dps: "170-200B" }
        }
    },

    // 🗡️ Sian Halat - Elemental Stacker Dark (DPS / Debuffer / Team Buffer)
    // Buffs Def Pen totaux (A5 + Armed): Arme 15% + A5 Team 10% + A4 RAID 18% + Armed 18% = 61%
    // Avec 70K raw max (~33%) → Total ~94% Def Pen atteignable
    // NOUVEAU: Classe "Elemental Stacker" - Focus sur Dark Elemental Accumulation & Overload
    sian: {
        id: 'sian',
        name: "Sian Halat",
        class: "Elemental Stacker",  // Nouvelle classe (Infuseur Élémentaire)
        role: "DPS / Debuffer / Team Buffer",
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
                rawMax: 11000, // 10-12K raw TC suffit avec buffs team (Isla +12%, Lee Bora, etc.)
                note: "95%+ pour consistance - 10-12K raw suffit avec buffs team"
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
            "Classe Elemental Stacker: Focus sur Dark Elemental Accumulation pour trigger Overload",
            "A2: Oath of Victory (+20% DMG vs Dark Overloaded targets) - TEAM permanent",
            "A3: Guardian's Resolve (stack jusqu'à 20x) - +32% Dark DMG max",
            "A4: +3% Def Pen par Dark hunter au RAID (6×3% = 18%)",
            "A5: Zenith Sword via Ultimate (+30% Overload DMG, +10% Def Pen, +15% ATK) - RAID Dark",
            "A5: Scarlet Domination debuff (stack 4x) - +40% Dark DMG Taken sur enemy",
            "Arme A5: +15% Def Pen personnel + +48% Dark DMG (4 stacks Overload)",
            "Armed 4pc (+18% Def Pen) - Total buffs = 61% Def Pen !",
            "Max 70K raw Def Pen recommandé (~33% raw + 61% buffs = 94%)",
            "Utiliser Ultimate dès que disponible pour trigger Zenith Sword (30s buff)"
        ],

        recommendedSets: ["Armed 4pc + Expert 4pc", "Armed 4pc + Obsidian 4pc"],

        benchmarks: {
            casual: { critRate: 70, critDMG: 150, defPen: 70, dps: "5-12B" },
            intermediate: { critRate: 85, critDMG: 180, defPen: 85, dps: "15-25B" },
            advanced: { critRate: 95, critDMG: 200, defPen: 95, dps: "30-45B" },
            whale: { critRate: 100, critDMG: 200, defPen: 100, dps: "50-62B" }
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
                rawMax: 11000, // 10-12K raw TC suffit avec buffs team
                note: "95%+ pour consistance - 10-12K raw suffit avec buffs team"
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
            "10-12K raw TC suffit avec les buffs team (Isla +12%, Lee Bora...)"
        ],

        recommendedSets: ["Chaotic Desire 8pc", "Armed 4pc + Expert 4pc"],

        benchmarks: {
            casual: { critRate: 70, critDMG: 170, defPen: 55, dps: "5-10B" },
            intermediate: { critRate: 85, critDMG: 200, defPen: 65, dps: "12-20B" },
            advanced: { critRate: 95, critDMG: 220, defPen: 75, dps: "22-32B" },
            whale: { critRate: 100, critDMG: 240, defPen: 80, dps: "32-38B" }
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
                rawMax: 11000, // 10-12K raw TC suffit - elle reçoit aussi ses propres buffs
                note: "90% recommandé - 10-12K raw suffit avec buffs team"
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
            "10-12K raw TC suffit avec les buffs team"
        ],

        recommendedSets: ["Angel 4pc + Chaotic Wish 4pc", "Guardian 4pc + Sylph 4pc"],

        benchmarks: {
            casual: { critRate: 65, critDMG: 140, defPen: 50, dps: "1-3B" },
            intermediate: { critRate: 80, critDMG: 170, defPen: 60, dps: "4-6B" },
            advanced: { critRate: 90, critDMG: 190, defPen: 70, dps: "7-10B" },
            whale: { critRate: 95, critDMG: 200, defPen: 75, dps: "10-12B" }
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
                rawMax: 9000, // A5 donne +36% TC perso ! 8-10K raw suffit largement
                note: "Cap 100% - A5 donne +36% TC perso, donc 8-10K raw suffit !"
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
            "Ilhwan A5 donne +36% TC personnel (3×12%) - ÉNORME !",
            "8-10K raw TC suffit car A5 donne déjà +36%",
            "Son arme donne aussi des buffs de DCC perso",
            "Bénéficie des buffs Def Pen de Sian (46% total)"
        ],

        recommendedSets: ["Armed 4pc + Expert 4pc", "Armed 4pc + Obsidian 4pc"],

        benchmarks: {
            casual: { critRate: 70, critDMG: 140, defPen: 35, dps: "8-15B" },
            intermediate: { critRate: 85, critDMG: 180, defPen: 50, dps: "20-35B" },
            advanced: { critRate: 95, critDMG: 210, defPen: 60, dps: "40-55B" },
            whale: { critRate: 100, critDMG: 240, defPen: 72, dps: "55-64B" }
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
            casual: { damageIncrease: 20, defense: 10000, critRate: 40, dps: "0.3-0.6B" },
            intermediate: { damageIncrease: 28, defense: 13000, critRate: 55, dps: "0.6-1B" },
            advanced: { damageIncrease: 35, defense: 16000, critRate: 70, dps: "1-1.4B" },
            whale: { damageIncrease: 42, defense: 19000, critRate: 80, dps: "1.4-1.8B" }
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
            casual: { critRate: 75, critDMG: 160, defPen: 40, dps: "0.3-0.6B" },
            intermediate: { critRate: 90, critDMG: 200, defPen: 55, dps: "0.7-1.1B" },
            advanced: { critRate: 100, critDMG: 235, defPen: 68, dps: "1.2-1.6B" },
            whale: { critRate: 100, critDMG: 270, defPen: 78, dps: "1.6-2B" }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🌙 MINNIE - DPS Assassin (Scale DEF)
    // ═══════════════════════════════════════════════════════════════

    // 🌙 Minnie - DPS Assassin (Scale DEF, buff perso massif)
    // Buffs perso: A5 = 60% TC + 115% DCC + Arme 15% TC/DCC = 75% TC, 130% DCC PERSO !
    // Elle est tellement capée en TC/DCC qu'il faut focus Def Pen et DEF
    minnie: {
        id: 'minnie',
        name: "Minnie",
        role: "DPS Assassin",
        element: "Dark",
        tier: "S",

        // 💪 Stat principale de scaling - Minnie scale sur DEF !
        mainStat: {
            type: 'def',
            label: 'DEF',
            icon: '🛡️',
            color: '#3b82f6',
            benchmarks: {
                casual: 12000,
                intermediate: 18000,
                advanced: 24000,
                whale: 30000
            },
            note: "Minnie scale sur la DEF - Focus DEF puis Def Pen car elle est capée TC/DCC"
        },

        sweetSpots: {
            critRate: {
                min: 95,
                max: 100,
                ideal: 100,
                priority: 4,
                status: "CAP",
                color: "#22c55e",
                rawMax: 5000, // 4-6K raw suffit LARGEMENT car A5 + arme = 75% TC perso !
                note: "Cap 100% - 4-6K raw max car A5 + arme donne déjà 75% TC perso"
            },
            critDMG: {
                min: 220,
                max: 280,
                ideal: 250,
                priority: 3,
                status: "MODERATE",
                color: "#f59e0b",
                note: "250% ideal - A5 + arme donne déjà 130% DCC perso, peu d'invest nécessaire"
            },
            defPen: {
                min: 80,
                max: 95,
                ideal: 88,
                priority: 1,
                status: "PRIORITY",
                color: "#8b5cf6",
                rawMax: 75000,
                note: "PRIORITÉ #1 - Buffs team 46% + raw = vise 88%+ Def Pen"
            },
            defense: {
                min: 18000,
                max: 30000,
                ideal: 24000,
                priority: 2,
                status: "HIGH",
                color: "#3b82f6",
                note: "PRIORITÉ #2 - Minnie scale sur DEF, maximise après Def Pen"
            }
        },

        substatPriority: ["Def Pen", "DEF%", "HP%", "Crit Rate%"],

        scaling: {
            def: { grade: "S+", description: "Scaling principal - PRIORITAIRE" },
            critDMG: { grade: "C", description: "A5 donne déjà 130% DCC perso - STOP" },
            defPen: { grade: "S", description: "PRIORITÉ #1 - ROI énorme" },
            critRate: { grade: "C", description: "A5 donne déjà 75% TC perso - STOP" }
        },

        tips: [
            "⚠️ Minnie est capée TC/DCC perso : 75% TC + 130% DCC à A5 !",
            "NE PAS investir en TC/DCC - C'est du gâchis total",
            "Focus Def Pen > DEF > le reste",
            "4-6K raw TC max, le reste c'est overinvest",
            "Armed 4pc (+18% Def Pen) recommandé"
        ],

        recommendedSets: ["Armed 4pc + Expert 4pc", "Armed 4pc + Obsidian 4pc"],

        benchmarks: {
            casual: { critRate: 85, critDMG: 180, defPen: 60, dps: "15-25B" },
            intermediate: { critRate: 95, critDMG: 200, defPen: 75, dps: "30-50B" },
            advanced: { critRate: 100, critDMG: 220, defPen: 85, dps: "55-75B" },
            whale: { critRate: 100, critDMG: 230, defPen: 90, dps: "80-100B" }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎸 HARPER - Breaker / Support
    // ═══════════════════════════════════════════════════════════════

    // 🎸 Harper - Breaker Support (pas un DPS)
    // Buffs perso: A5 = 62% TC + 62% DCC perso
    // Son rôle: Break les ennemis, pas faire du DPS
    harper: {
        id: 'harper',
        name: "Harper",
        role: "Breaker / Support",
        element: "Dark",
        tier: "A",

        // 💪 Stat principale de scaling
        mainStat: {
            type: 'atk',
            label: 'ATK',
            icon: '⚔️',
            color: '#ef4444',
            benchmarks: {
                casual: 20000,
                intermediate: 26000,
                advanced: 32000,
                whale: 38000
            },
            note: "Breaker - Pas besoin de beaucoup d'ATK, focus sur la survie et break"
        },

        sweetSpots: {
            critRate: {
                min: 95,
                max: 100,
                ideal: 100,
                priority: 3,
                status: "CAP",
                color: "#22c55e",
                rawMax: 6000, // A5 donne +62% TC perso, donc 5-7K raw max
                note: "Cap 100% - 5-7K raw max car A5 donne déjà 62% TC perso"
            },
            critDMG: {
                min: 220,
                max: 280,
                ideal: 250,
                priority: 4,
                status: "MODERATE",
                color: "#f59e0b",
                note: "250% ideal - Breaker mais A5 donne 62% DCC perso"
            },
            defPen: {
                min: 40,
                max: 60,
                ideal: 50,
                priority: 2,
                status: "MEDIUM",
                color: "#8b5cf6",
                rawMax: 50000,
                note: "Breaker - Modéré suffit, pas besoin d'overinvest"
            },
            breakEffect: {
                min: 30,
                max: 50,
                ideal: 40,
                priority: 1,
                status: "PRIORITY",
                color: "#06b6d4",
                note: "PRIORITÉ - Harper est là pour break, pas DPS"
            }
        },

        substatPriority: ["Break Effect%", "HP%", "DEF%", "Crit Rate%"],

        scaling: {
            atk: { grade: "B", description: "Pas prioritaire - Breaker" },
            critDMG: { grade: "C", description: "A5 donne 62% DCC perso - suffisant" },
            defPen: { grade: "B", description: "Modéré suffit" },
            critRate: { grade: "C", description: "A5 donne 62% TC perso - suffisant" }
        },

        tips: [
            "Harper est un BREAKER, pas un DPS !",
            "A5 donne 62% TC + 62% DCC perso - suffisant pour son rôle",
            "Focus Break Effect > survie > le reste",
            "Ne pas overinvest en TC/DCC",
            "Son arme buff les ultis des autres (pas comptabilisé)"
        ],

        recommendedSets: ["Guardian 4pc + Sylph 4pc", "Angel 4pc + Guardian 4pc"],

        benchmarks: {
            casual: { critRate: 70, critDMG: 130, defPen: 30, dps: "1-3B" },
            intermediate: { critRate: 80, critDMG: 150, defPen: 40, dps: "3-5B" },
            advanced: { critRate: 90, critDMG: 170, defPen: 50, dps: "5-8B" },
            whale: { critRate: 95, critDMG: 180, defPen: 55, dps: "8-12B" }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🧙 LIM - Semi-DPS / Breaker / Buffer
    // ═══════════════════════════════════════════════════════════════

    // 🧙 Lim - Semi-DPS / Breaker / Buffer (polyvalent)
    // Buffs RAID: A1 = 5.6% TC + 8% DCC, A3 = 5.6% TC + 15% DCC pour TOUT LE RAID
    // Rôle hybride: buff le raid, break, et fait du DPS correct
    lim: {
        id: 'lim',
        name: "Lim",
        role: "Buffer / Semi-DPS / Breaker",
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
            note: "Polyvalent - ATK modéré pour son DPS, focus sur ses buffs RAID"
        },

        sweetSpots: {
            critRate: {
                min: 75,
                max: 95,
                ideal: 85,
                priority: 2,
                status: "HIGH",
                color: "#22c55e",
                rawMax: 10000, // 8-10K raw TC - pas de buff perso
                note: "Semi-DPS - 8-10K raw TC pour consistance"
            },
            critDMG: {
                min: 200,
                max: 260,
                ideal: 230,
                priority: 2,
                status: "MODERATE",
                color: "#f59e0b",
                note: "230% ideal - Semi-DPS polyvalent"
            },
            defPen: {
                min: 55,
                max: 75,
                ideal: 65,
                priority: 3,
                status: "MODERATE",
                color: "#8b5cf6",
                rawMax: 60000,
                note: "Buffs team 46% + raw modéré = ~65% Def Pen"
            },
            breakEffect: {
                min: 20,
                max: 40,
                ideal: 30,
                priority: 1,
                status: "HIGH",
                color: "#06b6d4",
                note: "Utile pour son rôle breaker hybride"
            }
        },

        substatPriority: ["ATK%", "Crit Rate%", "Crit DMG%", "Break Effect%"],

        scaling: {
            atk: { grade: "A", description: "Bon scaling pour son DPS" },
            critDMG: { grade: "B+", description: "Modéré - polyvalent" },
            defPen: { grade: "B+", description: "Modéré suffit" },
            critRate: { grade: "A", description: "Important pour consistance" }
        },

        tips: [
            "Lim A3 donne 5.6% TC + 15% DCC à TOUT LE RAID !",
            "Polyvalent: buffer + breaker + semi-DPS",
            "Pas besoin d'overinvest - rôle de support/utility",
            "Son arme n'apporte rien pour le theorycraft",
            "Focus équilibré, pas de stat à maxout"
        ],

        recommendedSets: ["Expert 4pc + Obsidian 4pc", "Guardian 4pc + Angel 4pc"],

        benchmarks: {
            casual: { critRate: 65, critDMG: 140, defPen: 40, dps: "3-6B" },
            intermediate: { critRate: 80, critDMG: 165, defPen: 55, dps: "8-14B" },
            advanced: { critRate: 90, critDMG: 180, defPen: 65, dps: "16-24B" },
            whale: { critRate: 95, critDMG: 195, defPen: 72, dps: "26-35B" }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔥 FERN - DPS Mage Fire (Frieren collab)
    // ═══════════════════════════════════════════════════════════════
    // Buffs perso: A5 True Sight 10%TC+20%DCC + A4 10%TC+20%DCC = 20%TC+40%DCC
    // Arme: +5-10%TC +10-20%DCC (sur Zoltraak skills) + 5-12% ATK
    // Seeker's Gaze (A5): +10% Def Pen temporaire (burst 20s)
    // Debuff ennemi: Fire Vuln +30% (A4+ Skill 2, 60×0.5%)
    // Pas de buff TC/DCC pour la team → ses stats perso comptent beaucoup

    fern: {
        id: 'fern',
        name: "Fern",
        role: "DPS Mage",
        element: "Fire",
        tier: "S+",

        // 💪 Stat principale de scaling
        mainStat: {
            type: 'atk',
            label: 'ATK',
            icon: '⚔️',
            color: '#ef4444',
            benchmarks: {
                casual: 32000,
                intermediate: 40000,
                advanced: 48000,
                whale: 54000
            },
            note: "Fern scale sur l'ATK - Magical Prodigy donne +40% ATK permanent (si MP ≥ 50%)"
        },

        // Buffs TC/DCC perso massifs: True Sight A5 (10%TC+20%DCC) + A4 (10%TC+20%DCC) = 20%TC+40%DCC
        // + Arme A5: ~10%TC +20%DCC sur Zoltraak skills
        // Total perso: ~30%TC +60%DCC → Besoin de moins de raw TC/DCC
        sweetSpots: {
            critRate: {
                min: 90,
                max: 100,
                ideal: 100,
                priority: 1,
                status: "CAP",
                color: "#22c55e",
                rawMax: 9000, // 8-10K raw suffit ! +20%TC perso + ~10%TC arme = ~30%TC de buffs
                note: "Cap 100% - 8-10K raw suffit avec ses buffs perso (~30% TC perso + arme)"
            },
            critDMG: {
                min: 200,
                max: 260,
                ideal: 230,
                priority: 2,
                status: "HIGH",
                color: "#f59e0b",
                note: "+40% DCC perso (A4+A5) + 20% arme - Focus DCC après cap TC"
            },
            defPen: {
                min: 70,
                max: 85,
                ideal: 77,
                priority: 3,
                status: "MODERATE",
                color: "#8b5cf6",
                rawMax: 70000,
                note: "Seeker's Gaze +10% Def Pen temporaire (A5 burst) - Investir après TC/DCC"
            }
        },

        substatPriority: ["Crit Rate%", "Crit DMG%", "ATK%", "Def Pen"],

        scaling: {
            atk: { grade: "S+", description: "Magical Prodigy +40% ATK perso (si MP ≥ 50%)" },
            critDMG: { grade: "S", description: "Excellent avec ses buffs DCC perso (+60%)" },
            defPen: { grade: "A", description: "Seeker's Gaze +10% Def Pen burst (A5)" },
            critRate: { grade: "S", description: "Cap crucial - 30% TC perso (A5+arme)" }
        },

        tips: [
            "A5: True Sight +10%TC +20%DCC + A4 +10%TC +20%DCC = 20%TC +40%DCC perso",
            "Arme A5: +10%TC +20%DCC sur Zoltraak skills → Total ~30%TC +60%DCC perso !",
            "8-10K raw TC suffit grâce aux buffs perso massifs",
            "A5 Seeker's Gaze: +60% Fire DMG +10% Def Pen pendant 20s (burst phase)",
            "A4+ Skill 2: Fire Vuln debuff 0.5%×60 stacks = +30% Fire DMG sur l'ennemi",
            "Magical Prodigy A1: +40% ATK si MP ≥ 50% - Garder le MP haut !",
            "+60% Boss DMG permanent (Mana Power Tracking A1)"
        ],

        recommendedSets: ["Armed 4pc + Expert 4pc", "Armed 4pc + Obsidian 4pc"],

        benchmarks: {
            casual: { critRate: 75, critDMG: 160, defPen: 45, dps: "8-15B" },
            intermediate: { critRate: 90, critDMG: 200, defPen: 60, dps: "20-35B" },
            advanced: { critRate: 100, critDMG: 230, defPen: 72, dps: "40-55B" },
            whale: { critRate: 100, critDMG: 250, defPen: 80, dps: "55-70B" }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔥 GINA - Support Fire (ATK scaling)
    // ═══════════════════════════════════════════════════════════════
    // Buffs TEAM: Mana Circulation +15%ATK +15%FireDMG, Mana Transformation (+12%DMG dealt, Shield)
    // A4: +4% Def Pen ALL + +4% Def Pen Fire
    // A3: Gravity Boost debuff +10% Fire DMG taken sur ennemi
    // Arme: Mana Circulation → +1% ATK & Fire DMG (4 stacks)
    // SUPPORT PURE - ses stats perso sont secondaires, focus sur survie + Damage Increase

    gina: {
        id: 'gina',
        name: "Gina",
        role: "Support / Buffer / Healer",
        element: "Fire",
        tier: "S",

        mainStat: {
            type: 'atk',
            label: 'ATK',
            icon: '⚔️',
            color: '#ef4444',
            benchmarks: {
                casual: 20000,
                intermediate: 28000,
                advanced: 34000,
                whale: 40000
            },
            note: "Gina scale sur l'ATK - Son ATK définit aussi le heal (2% ATK) et le Shield (12% ATK)"
        },

        sweetSpots: {
            damageIncrease: {
                min: 20,
                max: 40,
                ideal: 30,
                priority: 1,
                status: "HIGH",
                color: "#ef4444",
                note: "PRIORITÉ #1 - Amplifie les dégâts de toute la team"
            },
            defense: {
                min: 10000,
                max: 18000,
                ideal: 14000,
                priority: 2,
                status: "HIGH",
                color: "#3b82f6",
                note: "PRIORITÉ #2 - Survie pour maintenir les buffs actifs"
            },
            critRate: {
                min: 50,
                max: 80,
                ideal: 65,
                priority: 3,
                status: "LOW",
                color: "#22c55e",
                note: "Support - stats perso moins importantes"
            },
            critDMG: {
                min: 100,
                max: 160,
                ideal: 130,
                priority: 4,
                status: "LOW",
                color: "#f59e0b",
                note: "Secondaire - focus sur les buffs team"
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

        substatPriority: ["Damage Increase%", "DEF%", "HP%", "ATK%"],

        scaling: {
            atk: { grade: "A", description: "Scaling pour heal/shield + Mana Circulation buff" },
            damageIncrease: { grade: "S", description: "PRIORITÉ - Amplifie tout" },
            def: { grade: "A+", description: "Survie cruciale pour maintenir buffs" },
            critDMG: { grade: "C", description: "Pas prioritaire" },
            critRate: { grade: "C", description: "Pas prioritaire" }
        },

        tips: [
            "PRIORITÉ : Damage Increase > Survie (DEF/HP) > le reste",
            "Mana Circulation: +15% ATK +15% Fire DMG pour toute la team (15s)",
            "A1: Mana Transformation → Shield 12%ATK + 12%DMG dealt + -12%DMG taken (20s)",
            "A3: Gravity Boost → +10% Fire DMG taken debuff sur ennemi (20s)",
            "A4: +4% Def Pen TOUT le RAID + +4% Def Pen Fire members",
            "Arme: Mana Circulation → team +50 mana + +1% ATK/Fire DMG (4 stacks)",
            "A5: Space-Time Gap → +120% Path of Extinction DMG vs Gravity Boost"
        ],

        recommendedSets: ["Guardian 4pc + Sylph 4pc", "Angel 4pc + Guardian 4pc"],

        benchmarks: {
            casual: { damageIncrease: 15, defense: 9000, critRate: 40, dps: "0.2-0.5B" },
            intermediate: { damageIncrease: 22, defense: 12000, critRate: 50, dps: "0.5-0.9B" },
            advanced: { damageIncrease: 30, defense: 15000, critRate: 60, dps: "0.9-1.3B" },
            whale: { damageIncrease: 38, defense: 17000, critRate: 70, dps: "1.3-1.8B" }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔥 SONG CHIYUL - DPS Mage Fire (SR, ATK scaling)
    // ═══════════════════════════════════════════════════════════════
    // SR character - pas de buffs team, DPS égoïste
    // Focus Burn synergy + Incinerate stacking
    // 0 buff perso TC/DCC/DefPen → besoin de raw stats pures
    // A1: +50% DMG vs Normal monsters (farmer)

    song: {
        id: 'song',
        name: "Song Chiyul",
        role: "DPS Mage / Farmer",
        element: "Fire",
        tier: "B",

        mainStat: {
            type: 'atk',
            label: 'ATK',
            icon: '⚔️',
            color: '#ef4444',
            benchmarks: {
                casual: 18000,
                intermediate: 25000,
                advanced: 30000,
                whale: 36000
            },
            note: "SR - Scaling ATK pur. Burn DOT = 50% ATK/3s"
        },

        // 0 buff TC/DCC/DefPen perso → besoin de plus de raw TC que les SSR
        // Pas de buff team non plus → peut investir plus en raw
        sweetSpots: {
            critRate: {
                min: 80,
                max: 100,
                ideal: 95,
                priority: 1,
                status: "HIGH",
                color: "#22c55e",
                rawMax: 14000, // 0 buff TC perso → besoin de plus de raw (12-14K)
                note: "0 buff TC perso - 12-14K raw nécessaire"
            },
            critDMG: {
                min: 160,
                max: 220,
                ideal: 190,
                priority: 2,
                status: "MODERATE",
                color: "#f59e0b",
                note: "Pas de buff DCC perso → investir en raw"
            },
            defPen: {
                min: 50,
                max: 70,
                ideal: 60,
                priority: 3,
                status: "MODERATE",
                color: "#8b5cf6",
                rawMax: 70000,
                note: "SR - moins prioritaire que TC/DCC"
            }
        },

        substatPriority: ["Crit Rate%", "Crit DMG%", "ATK%", "Def Pen"],

        scaling: {
            atk: { grade: "A", description: "Scaling direct + Burn DOT (50% ATK)" },
            critDMG: { grade: "A", description: "Important sans buff perso" },
            defPen: { grade: "B+", description: "Utile mais SR = moins de scaling" },
            critRate: { grade: "A+", description: "Cap important, 0 buff perso TC" }
        },

        tips: [
            "SR - DPS égoïste, 0 buff pour la team",
            "A1: +50% DMG vs Normal monsters → excellent farmer",
            "Skill 2 Burns → synergy avec Ultimate (+30% vs Burned) et A5 (+50% Incinerate vs Burned)",
            "Passive: Iaido hit → +60% Incinerate DMG (3 stacks) + Core Gauge 100%",
            "0 buff TC/DCC perso → besoin de 12-14K raw TC",
            "A4: +20% Incinerate DMG permanent"
        ],

        recommendedSets: ["Armed 4pc + Expert 4pc", "Expert 4pc + Obsidian 4pc"],

        benchmarks: {
            casual: { critRate: 60, critDMG: 130, defPen: 35, dps: "1-3B" },
            intermediate: { critRate: 80, critDMG: 165, defPen: 50, dps: "4-7B" },
            advanced: { critRate: 90, critDMG: 185, defPen: 60, dps: "8-12B" },
            whale: { critRate: 95, critDMG: 200, defPen: 65, dps: "12-16B" }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔥 STARK - Breaker / Sub-DPS Tank Fire (HP scaling, Frieren collab)
    // ═══════════════════════════════════════════════════════════════
    // Buffs perso: Confidence +5%/stack (A5, 4 stacks = +20% Def Pen +20% Fire DMG)
    // → Courage: +30% Def Pen +30% Fire DMG (5s, A5)
    // + Determination: +15% CR (10s)
    // + A0 perso 20% Def Pen (characterBuffs) → A5: 30% Def Pen
    // A3: Team Def Pen = 20% of Stark's raw Def Pen
    // Arme: +5% HP seulement

    stark: {
        id: 'stark',
        name: "Stark",
        role: "Breaker / Sub-DPS Tank",
        element: "Fire",
        tier: "S",

        mainStat: {
            type: 'hp',
            label: 'HP',
            icon: '❤️',
            color: '#ef4444',
            benchmarks: {
                casual: 80000,
                intermediate: 110000,
                advanced: 140000,
                whale: 170000
            },
            note: "Stark scale sur HP - Tous ses dégâts basés sur Max HP. Arme +5% HP."
        },

        // Buffs perso massifs: Confidence cycling +20% Def Pen, Courage +30% Def Pen (A5)
        // + personalBuffs 30% Def Pen (characterBuffs A5) + 10% CR (Determination)
        // A3: team Def Pen from raw → lui-même a besoin de raw Def Pen aussi
        sweetSpots: {
            critRate: {
                min: 85,
                max: 100,
                ideal: 95,
                priority: 2,
                status: "HIGH",
                color: "#22c55e",
                rawMax: 10000, // Determination +15% CR perso → 10K raw suffit
                note: "Determination donne +15% CR (10s) → 10K raw suffit"
            },
            critDMG: {
                min: 170,
                max: 220,
                ideal: 200,
                priority: 3,
                status: "MODERATE",
                color: "#f59e0b",
                note: "Important mais après CR et Def Pen"
            },
            defPen: {
                min: 80,
                max: 95,
                ideal: 88,
                priority: 1,
                status: "PRIORITY",
                color: "#8b5cf6",
                rawMax: 70000,
                note: "Courage A5 +30% Def Pen + personalBuffs 30% = ~60% buffs. Raw 70K (~33%) → ~93%. Sweet spot 88%."
            }
        },

        substatPriority: ["HP%", "Def Pen", "Crit Rate%", "Crit DMG%"],

        scaling: {
            hp: { grade: "S+", description: "Tous ses dégâts basés sur Max HP" },
            defPen: { grade: "S", description: "Buffs perso massifs (Confidence/Courage +30% + 30% perso)" },
            critDMG: { grade: "A", description: "Multiplicateur utile" },
            critRate: { grade: "A", description: "Determination +15% CR perso" }
        },

        tips: [
            "HP SCALER - Tous les dégâts basés sur Max HP",
            "Confidence A5: +5% Fire DMG/Def Pen par stack (4 stacks = +20%)",
            "Courage A5: +30% Fire DMG +30% Def Pen +50% Annihilation DMG (5s burst)",
            "A3: Team Def Pen = 20% de sa raw Def Pen → build Def Pen profite à la team !",
            "A1: Fighting Spirit -20% DMG taken + HP recovery ≤10% (CD 60s)",
            "A3: Warrior's Aura → ennemi prend +30% DMG from Stark (15s)",
            "Power Gauge ne charge QUE pendant Courage → timing critique pour Ultimate"
        ],

        recommendedSets: ["Armed 4pc + Guardian 4pc", "Armed 4pc + Expert 4pc"],

        benchmarks: {
            casual: { critRate: 70, critDMG: 140, defPen: 55, dps: "5-10B" },
            intermediate: { critRate: 85, critDMG: 175, defPen: 70, dps: "15-25B" },
            advanced: { critRate: 95, critDMG: 200, defPen: 82, dps: "30-45B" },
            whale: { critRate: 100, critDMG: 215, defPen: 88, dps: "45-60B" }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔥 KANAE - DPS Assassin Fire (ATK scaling)
    // ═══════════════════════════════════════════════════════════════
    // Buffs perso MASSIFS A5: Sixth Sense +77%ATK +20%CR +20%DCC
    // + A2: +16% DCC permanent
    // + Arme A5: +20% CR perso
    // Total perso A5: ~40% CR + 36% DCC + 77% ATK !!
    // A4: +12% Fire DMG per Fire member (max 3 = +36% Fire DMG)
    // 0 buff team → pure selfish DPS

    kanae: {
        id: 'kanae',
        name: "Tawata Kanae",
        role: "DPS Assassin",
        element: "Fire",
        tier: "S+",

        mainStat: {
            type: 'atk',
            label: 'ATK',
            icon: '⚔️',
            color: '#ef4444',
            benchmarks: {
                casual: 30000,
                intermediate: 38000,
                advanced: 46000,
                whale: 52000
            },
            note: "Kanae scale sur ATK. Sixth Sense A5 donne +77% ATK → scaling ATK monstrueux"
        },

        // Buffs perso: Arme 20%CR + Sixth Sense 20%CR + A2 16%DCC + Sixth Sense 20%DCC = 40%CR+36%DCC
        // → Besoin de très peu de raw TC (7-9K max !)
        sweetSpots: {
            critRate: {
                min: 90,
                max: 100,
                ideal: 100,
                priority: 1,
                status: "CAP",
                color: "#22c55e",
                rawMax: 8000, // 40% CR perso (arme 20% + Sixth Sense 20%) → 7-9K raw suffit !
                note: "Cap 100% - 7-9K raw suffit ! Arme 20%CR + Sixth Sense 20%CR = 40% CR perso"
            },
            critDMG: {
                min: 200,
                max: 260,
                ideal: 230,
                priority: 2,
                status: "HIGH",
                color: "#f59e0b",
                note: "A2 16%DCC + Sixth Sense 20%DCC = 36% DCC perso → investir en raw après cap CR"
            },
            defPen: {
                min: 60,
                max: 80,
                ideal: 70,
                priority: 3,
                status: "MODERATE",
                color: "#8b5cf6",
                rawMax: 70000,
                note: "Pas de buff Def Pen perso → dépend des buffs team"
            }
        },

        substatPriority: ["Crit Rate%", "Crit DMG%", "ATK%", "Def Pen"],

        scaling: {
            atk: { grade: "S+", description: "Sixth Sense +77% ATK → scaling ATK monstrueux" },
            critDMG: { grade: "S", description: "36% DCC perso → bon ROI en raw" },
            defPen: { grade: "A", description: "Pas de buff perso → dépend de la team" },
            critRate: { grade: "S", description: "40% CR perso → cap facile, peu de raw" }
        },

        tips: [
            "A5 Sixth Sense: +77% ATK +20% CR +20% DCC → buffs perso MASSIFS",
            "Arme A5: +20% CR perso → Total CR perso = 40% !",
            "A2: +16% DCC permanent → Total DCC perso = 36%",
            "7-9K raw TC suffit grâce aux 40% CR perso",
            "A4: +12% Fire DMG par Fire member (max 3 = +36% Fire DMG)",
            "+24% DMG vs Break targets + Crimson→Scarlet→Fire chain burst",
            "0 buff team → DPS purement égoïste"
        ],

        recommendedSets: ["Armed 4pc + Expert 4pc", "Armed 4pc + Obsidian 4pc"],

        benchmarks: {
            casual: { critRate: 75, critDMG: 160, defPen: 40, dps: "8-15B" },
            intermediate: { critRate: 90, critDMG: 200, defPen: 55, dps: "20-35B" },
            advanced: { critRate: 100, critDMG: 230, defPen: 65, dps: "40-55B" },
            whale: { critRate: 100, critDMG: 255, defPen: 75, dps: "55-75B" }
        }
    },

    // 🔥 Yoo Soohyun - Fire Striker ATK - Def Pen Specialist + Magic Reaction Debuffer
    yoo: {
        id: 'yoo',
        name: "Yoo Soohyun",
        role: "DPS Striker",
        element: "Fire",
        tier: "S+",

        mainStat: {
            type: 'atk',
            label: 'ATK',
            icon: '⚔️',
            color: '#ef4444',
            benchmarks: {
                casual: 28000,
                intermediate: 36000,
                advanced: 44000,
                whale: 50000
            },
            note: "Scale sur ATK. A3 +24% ATK (Trick Shot) + A4 +12% ATK permanent → bon scaling ATK"
        },

        sweetSpots: {
            defPen: {
                min: 85,
                max: 100,
                ideal: 92,
                priority: 1,
                status: "HIGH",
                color: "#8b5cf6",
                rawMax: 65000,
                note: "PRIORITÉ #1 car DI = 24% du stat Def Pen → double bénéfice ! 48% Def Pen perso (36% char + 12% arme) → 60-65K raw suffit"
            },
            critRate: {
                min: 90,
                max: 100,
                ideal: 100,
                priority: 2,
                status: "CAP",
                color: "#22c55e",
                rawMax: 14000,
                note: "Cap 100% - 0% TC perso → besoin de 12-14K raw ou buffs team (Fern, etc.)"
            },
            critDMG: {
                min: 200,
                max: 260,
                ideal: 230,
                priority: 3,
                status: "MODERATE",
                color: "#f59e0b",
                note: "0% DCC perso → investir après Def Pen et TC cap"
            }
        },

        substatPriority: ["Def Pen", "Crit Rate%", "Crit DMG%", "ATK%"],

        scaling: {
            defPen: { grade: "S+", description: "48% Def Pen perso + DI from Def Pen → DOUBLE scaling, priorité absolue" },
            atk: { grade: "S", description: "A3 +24% ATK + A4 +12% ATK → bon scaling" },
            critRate: { grade: "A", description: "0% TC perso → dépend de la team et du raw" },
            critDMG: { grade: "A", description: "0% DCC perso → investir en raw" }
        },

        tips: [
            "Def Pen = PRIORITÉ #1 car Spotlight donne DI = 24% du stat Def Pen → plus de raw Def Pen = plus de DI + plus de pénétration",
            "48% Def Pen perso (Spotlight 24% + A2 12% + Arme 12%) → monstrueux",
            "Magic Reaction debuff: +20% Fire DMG taken par l'ennemi → buff TOUTE la team Fire",
            "A5: +120% Kill Shot/Hell Fire DMG à max stacks → burst INSANE",
            "A1: Hell Fire = +40% DMG sur skills améliorés quand Magic Reaction ≥10",
            "A3: Trick Shot (CD10) → +24% ATK → spam pour maintenir le buff",
            "0% TC/DCC perso → besoin de 12-14K raw TC ou buffs team"
        ],

        recommendedSets: ["Obsidian 4pc + Armed 4pc", "Obsidian 4pc + Expert 4pc"],

        benchmarks: {
            casual: { critRate: 70, critDMG: 150, defPen: 55, dps: "5-12B" },
            intermediate: { critRate: 85, critDMG: 190, defPen: 70, dps: "18-30B" },
            advanced: { critRate: 100, critDMG: 220, defPen: 85, dps: "35-50B" },
            whale: { critRate: 100, critDMG: 250, defPen: 92, dps: "50-68B" }
        }
    },

    // 🔥 Christopher Reed - Fire Infusion DEF - Elemental Stacker / Fire Overload Specialist
    reed: {
        id: 'reed',
        name: "Christopher Reed",
        role: "DPS / Elemental Stacker",
        element: "Fire",
        tier: "S+",

        mainStat: {
            type: 'def',
            label: 'DEF',
            icon: '🛡️',
            color: '#06b6d4',
            benchmarks: {
                casual: 15000,
                intermediate: 22000,
                advanced: 28000,
                whale: 34000
            },
            note: "Scale sur DEF. Arme +50% DEF + Shield A3 100% DEF → DEF = DMG + survie. Spiritual Body +150% skill DMG"
        },

        sweetSpots: {
            critRate: {
                min: 85,
                max: 100,
                ideal: 95,
                priority: 2,
                status: "HIGH",
                color: "#22c55e",
                rawMax: 14000,
                note: "0% TC perso → besoin de 12-14K raw. Cap 100% idéal"
            },
            critDMG: {
                min: 180,
                max: 240,
                ideal: 200,
                priority: 3,
                status: "MODERATE",
                color: "#f59e0b",
                note: "0% DCC perso → investir après TC cap. Focus DEF > DCC"
            },
            defPen: {
                min: 60,
                max: 85,
                ideal: 75,
                priority: 1,
                status: "HIGH",
                color: "#8b5cf6",
                rawMax: 70000,
                note: "15% Def Pen perso (reed A5) + 15% arme (Zero to a Hundred) = 30% Def Pen perso → 65-70K raw suffit"
            }
        },

        substatPriority: ["DEF%", "Def Pen", "Crit Rate%", "Crit DMG%"],

        scaling: {
            def: { grade: "S+", description: "Tout le kit scale sur DEF. Arme +50% DEF. Shield A3 = 100% DEF → priorité absolue" },
            defPen: { grade: "S", description: "30% Def Pen perso (15% reed + 15% arme) → bon investissement raw" },
            critRate: { grade: "A", description: "0% TC perso → besoin de raw ou team buffs" },
            critDMG: { grade: "A", description: "0% DCC perso → investir en raw après TC" }
        },

        tips: [
            "DEF = PRIORITÉ ABSOLUE car tout scale sur DEF + Shield A3 + Arme +50% DEF",
            "Spiritual Body: +25% Fire Elem Acc + +150% BA/Core/Skill DMG → windows de burst massives",
            "Touchdown (×3): +45% Fire Overload DMG + +15% Fire Elem Acc → Fire Overload enabler #1",
            "A3 Competitive Spirit: +165% Fire DMG vs Burn (quasi permanent avec CD2)",
            "A4: +5% Fire DMG par Fire ally (max 3 = +15%) pour toute la team Fire",
            "A5 Blazing Shock: +20% Fire Overload DMG Taken → debuff ennemi massif",
            "A5 Victor's Spirit: +250% Zero to a Hundred DMG → burst ult colossal",
            "30% Def Pen perso (15% char + 15% arme) → 65-70K raw suffit"
        ],

        recommendedSets: ["Courageous 4pc + Obsidian 4pc", "Courageous 4pc + Armed 4pc"],

        benchmarks: {
            casual: { critRate: 65, critDMG: 140, defPen: 40, dps: "5-12B" },
            intermediate: { critRate: 80, critDMG: 175, defPen: 55, dps: "18-30B" },
            advanced: { critRate: 95, critDMG: 200, defPen: 70, dps: "35-55B" },
            whale: { critRate: 100, critDMG: 230, defPen: 80, dps: "55-75B" }
        }
    },

    // 🔥 YUQI - Fire Breaker/Sub-DPS Tank HP - Break Specialist + Team Buffer + Debuffer
    yuqi: {
        id: 'yuqi',
        name: "YUQI",
        role: "Breaker / Sub-DPS",
        element: "Fire",
        tier: "S",

        mainStat: {
            type: 'hp',
            label: 'Max HP',
            icon: '❤️',
            color: '#22c55e',
            benchmarks: {
                casual: 180000,
                intermediate: 240000,
                advanced: 300000,
                whale: 360000
            },
            note: "Scale sur Max HP. Tempo +7.5% HP, Full Burst +25% HP (A3) → scaling HP massif. Arme +12% HP"
        },

        sweetSpots: {
            critRate: {
                min: 85,
                max: 100,
                ideal: 100,
                priority: 2,
                status: "CAP",
                color: "#22c55e",
                rawMax: 14000,
                note: "Cap 100% - 0% TC perso → besoin de 12-14K raw ou buffs team"
            },
            critDMG: {
                min: 180,
                max: 240,
                ideal: 210,
                priority: 3,
                status: "MODERATE",
                color: "#f59e0b",
                note: "0% DCC perso, mais Afterglow donne +20% DCC team (A5). Investir après TC cap"
            },
            defPen: {
                min: 55,
                max: 75,
                ideal: 65,
                priority: 1,
                status: "MODERATE",
                color: "#8b5cf6",
                rawMax: 70000,
                note: "0% Def Pen perso → dépend des buffs team. Priorité #1 pour maximiser le DMG"
            }
        },

        substatPriority: ["Max HP%", "Def Pen", "Crit Rate%", "Crit DMG%"],

        scaling: {
            hp: { grade: "S+", description: "Tout le kit scale sur Max HP → priorité absolue" },
            defPen: { grade: "A+", description: "0% Def Pen perso → dépend de la team" },
            critRate: { grade: "A", description: "0% TC perso → besoin de raw ou team" },
            critDMG: { grade: "A", description: "Afterglow A5 +20% DCC → aide un peu" }
        },

        tips: [
            "BREAKER avant tout: Break Extension +3s + A2 +20% Break effectiveness + Full Burst +50% Break SK",
            "Afterglow (A3/A5): BUFF TEAM MASSIF → +12% vs Break + +30% Basic/Ult DMG + +20% DCC (30s)",
            "Breakdown debuff: +20% DMG taken + 25% Fire DMG taken (A5, 30s) → ÉNORME pour la team",
            "Distortion A5: +18% DMG taken (6% ×3) → transitions en Breakdown automatiquement",
            "A4: +5% Fire DMG par Fire ally (max 3 = +15%) → synergie Fire team",
            "FOREVER: +15% DMG dealt pour toute la team (3 stacks, infini)",
            "Full Burst: Super Armor + Skills améliorés + +25% HP (A3) → windows de burst",
            "Arme: +12% HP permanent + +30% Fire DMG pendant Full Burst (15s)"
        ],

        recommendedSets: ["Courageous 4pc + Armed 4pc", "Courageous 4pc + Obsidian 4pc"],

        benchmarks: {
            casual: { critRate: 65, critDMG: 140, defPen: 35, dps: "3-8B" },
            intermediate: { critRate: 80, critDMG: 175, defPen: 50, dps: "12-22B" },
            advanced: { critRate: 95, critDMG: 210, defPen: 60, dps: "28-42B" },
            whale: { critRate: 100, critDMG: 235, defPen: 70, dps: "42-58B" }
        }
    },

    // 💧 FRIEREN - Water Support/Sub-DPS DEF - Team Buffer + Debuffer + Shielder
    frieren: {
        id: 'frieren',
        name: "Frieren",
        role: "Support / Sub-DPS",
        element: "Water",
        tier: "S+",

        mainStat: {
            type: 'def',
            label: 'Defense',
            icon: '🛡️',
            color: '#3b82f6',
            benchmarks: {
                casual: 30000,
                intermediate: 45000,
                advanced: 60000,
                whale: 80000
            },
            note: "Scale sur DEF. Mana Power Control: +50% DEF (A3) + +50% si MP≥50% = +100% DEF ! Arme +50% DEF. Shield et skills scalent sur DEF."
        },

        sweetSpots: {
            critRate: {
                min: 60,
                max: 100,
                ideal: 80,
                priority: 3,
                status: "MODERATE",
                color: "#f59e0b",
                rawMax: 14000,
                note: "Mana Power Liberation: +100% TC pendant l'Ult → pas besoin de cap TC. Investir modérément."
            },
            critDMG: {
                min: 180,
                max: 240,
                ideal: 210,
                priority: 2,
                status: "HIGH",
                color: "#ef4444",
                note: "A4 +20% DCC team, A5 +15% DCC raid. Bonne base perso + buffs team. Priorité #2."
            },
            defPen: {
                min: 55,
                max: 75,
                ideal: 65,
                priority: 1,
                status: "PRIORITY",
                color: "#8b5cf6",
                rawMax: 65000,
                note: "0% Def Pen perso → dépend des buffs team. Priorité #1 pour maximiser les dégâts."
            }
        },

        substatPriority: ["DEF%", "Def Pen", "Crit DMG%", "Crit Rate%"],

        scaling: {
            def: { grade: "S+", description: "Tout le kit scale sur DEF. +100% DEF à A3 avec MP≥50%. Arme +50% DEF." },
            defPen: { grade: "A+", description: "0% Def Pen perso → Priorité absolue en substats" },
            critDMG: { grade: "A+", description: "A4 +20% DCC team + A5 +15% DCC raid → solide" },
            critRate: { grade: "A", description: "Mana Power Liberation +100% TC pendant Ult → moins critique" }
        },

        tips: [
            "SUPPORT #1 du jeu: +9% ATK/DEF/HP team (A2) + +20% CritDMG team (A4)",
            "Vollzanbel debuff (A5): -10% DEF, +15% crit received, +15% CritDMG taken, +70% DMG from Frieren (30s)",
            "Mana Power Control (A3): +50% DEF permanent, +50% si MP≥50% → total +100% DEF",
            "Defense Magic (A3): Shield 30% DEF + -10% DMG taken (60s) + heal 20% DEF team (A1)",
            "Mana Power Liberation: +100% CR pendant l'Ult → pas besoin de cap CR en substats",
            "A5 Judradjim: 80% Power Gauge → Ult quasi en boucle → +100% CR quasi permanent",
            "Arme: +50% DEF perso + Team Basic/Ult Skill DMG +30% → buff team massif",
            "A1 Paralyze (3s) sur Judradjim + Vollzanbel debuff → CC + debuff combo"
        ],

        recommendedSets: ["Courageous 4pc + Armed 4pc", "Courageous 4pc + Defender 4pc"],

        benchmarks: {
            casual: { critRate: 50, critDMG: 150, defPen: 35, dps: "3-8B" },
            intermediate: { critRate: 70, critDMG: 180, defPen: 50, dps: "10-20B" },
            advanced: { critRate: 85, critDMG: 210, defPen: 65, dps: "25-40B" },
            whale: { critRate: 100, critDMG: 240, defPen: 75, dps: "40-60B" }
        }
    },

    // 💧 Anna Ruiz - Water Breaker ATK - Poison/Break Specialist (SR)
    anna: {
        id: 'anna',
        name: "Anna Ruiz",
        role: "Breaker / Poison Specialist",
        element: "Water",
        tier: "A",

        mainStat: {
            type: 'atk',
            label: 'ATK',
            icon: '⚔️',
            color: '#ef4444',
            benchmarks: {
                casual: 10000,
                intermediate: 15000,
                advanced: 20000,
                whale: 25000
            },
            note: "Scale sur ATK. A4: +10% ATK. Weapon: +10% ATK. Poison DoT scale sur ATK."
        },

        sweetSpots: {
            critRate: {
                min: 80,
                max: 100,
                ideal: 90,
                priority: 2,
                status: "HIGH",
                color: "#22c55e",
                rawMax: 14000,
                note: "0% CR perso → besoin de raw. Cap 100% idéal"
            },
            critDMG: {
                min: 170,
                max: 230,
                ideal: 200,
                priority: 3,
                status: "MODERATE",
                color: "#f59e0b",
                note: "Investir après CR cap. Focus ATK > CritDMG"
            },
            defPen: {
                min: 55,
                max: 80,
                ideal: 70,
                priority: 1,
                status: "HIGH",
                color: "#8b5cf6",
                rawMax: 70000,
                note: "A3 Enhanced Corrosive Poison -10% DEF on enemy + Weapon -10% DEF → bon Def Pen naturel"
            }
        },

        substatPriority: ["ATK%", "Def Pen", "Crit Rate%", "Crit DMG%"],

        scaling: {
            atk: { grade: "S", description: "Tout le kit + Poison DoT scale sur ATK. +20% ATK total (weapon 10% + A4 10%)" },
            defPen: { grade: "A+", description: "A3: -10% DEF debuff sur ennemi + Weapon: -10% DEF debuff → synergie forte" },
            critRate: { grade: "A", description: "0% CR perso → besoin de raw" },
            critDMG: { grade: "A", description: "0% CritDMG perso → investir après CR" }
        },

        tips: [
            "ATK priorité : Poison DoT + tous les skills scale sur ATK",
            "A2: +10% Break DMG → spécialiste Break",
            "A3: Enhanced Corrosive Poison → -1% DEF par stack (max -10%) sur ennemi",
            "A4: +10% ATK permanent",
            "A5: +100% Poison Wave (Ultimate) damage",
            "Weapon: +10% ATK (self) + -10% DEF debuff sur ennemi (Poison Shower)",
            "Total debuff potentiel: -20% DEF sur ennemi (weapon + A3 corrosive)"
        ],

        recommendedSets: ["Courageous 4pc + Armed 4pc", "Courageous 4pc + Obsidian 4pc"],

        benchmarks: {
            casual: { critRate: 60, critDMG: 140, defPen: 35, dps: "1-3B" },
            intermediate: { critRate: 75, critDMG: 170, defPen: 50, dps: "3-6B" },
            advanced: { critRate: 90, critDMG: 200, defPen: 65, dps: "6-10B" },
            whale: { critRate: 100, critDMG: 230, defPen: 75, dps: "10-15B" }
        }
    },

    // 💧 Cha Hae-In Water (Pure Sword Princess) - Fighter DPS DEF Scaler
    chae: {
        id: 'chae',
        name: "Cha Hae-In (Pure Sword Princess)",
        role: "Main DPS / Fighter",
        element: "Water",
        tier: "S",

        mainStat: {
            type: 'def',
            label: 'DEF',
            icon: '🛡️',
            color: '#3b82f6',
            benchmarks: {
                casual: 12000,
                intermediate: 18000,
                advanced: 25000,
                whale: 35000
            },
            note: "Scale sur DEF. Will of the Sword: +60% DEF (6 stacks). Weapon: +12% DEF + stacking DEF. Tous les skills % DEF."
        },

        sweetSpots: {
            critRate: {
                min: 55,
                max: 80,
                ideal: 70,
                priority: 3,
                status: "MODERATE",
                color: "#f59e0b",
                rawMax: 14000,
                note: "Will of the Sword A5: +24% CR + A4 Water Synergy +21% CR = +45% CR self. Besoin modéré en raw"
            },
            critDMG: {
                min: 130,
                max: 200,
                ideal: 170,
                priority: 2,
                status: "MODERATE",
                color: "#f59e0b",
                note: "Will of the Sword A5: +24% CD + A4 Water Synergy +21% CD = +45% CD self. Investir après DEF"
            },
            defPen: {
                min: 60,
                max: 85,
                ideal: 75,
                priority: 1,
                status: "HIGH",
                color: "#8b5cf6",
                rawMax: 70000,
                note: "Def Pen crucial pour maximiser les dégâts DEF-scaling"
            }
        },

        substatPriority: ["DEF%", "Def Pen", "Crit Rate%", "Crit DMG%"],

        scaling: {
            def: { grade: "S+", description: "Tout le kit scale sur DEF. Will of the Sword +60% DEF + Weapon +12% DEF + stacking DEF" },
            defPen: { grade: "S", description: "Def Pen critique pour percer les défenses ennemies" },
            critRate: { grade: "A+", description: "+45% CR self (A5 WotS + A4 Water Synergy) → besoin modéré en raw" },
            critDMG: { grade: "A+", description: "+45% CD self (A5 WotS + A4 Water Synergy) → besoin modéré en raw" }
        },

        tips: [
            "DEF = PRIORITÉ ABSOLUE car tout scale sur DEF",
            "Will of the Sword (6 stacks): +60% DEF, +24% CR, +24% CD à A5",
            "A4 Water Synergy: +21% CR/CD avec 3 alliés Water",
            "Total self buffs A5: +45% CR, +45% CD, +60% DEF → très autonome en CR/CD",
            "A1: Blade Master → Core Attack gratuit avec Super Armor (5s)",
            "A3: Sword's Resolve → Heavy Attack: Heavenly Strike (+170% DMG à 100% gauge)",
            "A5: Pure Sword Princess → +60% DMG permanent sur Heavenly Strike et Sword of Destiny",
            "Weapon: +12% DEF flat + DEF stacking sur gauge recharge (jusqu'à 60 stacks)",
            "Unrecoverable (30s) + Paralyze (3s) pour le CC"
        ],

        recommendedSets: ["Courageous 4pc + Armed 4pc", "Courageous 4pc + Obsidian 4pc"],

        benchmarks: {
            casual: { critRate: 55, critDMG: 130, defPen: 40, dps: "5-15B" },
            intermediate: { critRate: 65, critDMG: 160, defPen: 55, dps: "15-30B" },
            advanced: { critRate: 75, critDMG: 185, defPen: 70, dps: "30-55B" },
            whale: { critRate: 85, critDMG: 210, defPen: 80, dps: "55-80B" }
        }
    },

    // 💧 Meri Laine - Water Infusion HP Scaler / Water Overload Specialist
    meri: {
        id: 'meri',
        name: "Meri Laine",
        role: "DPS / Water Overload Specialist",
        element: "Water",
        tier: "S",

        mainStat: {
            type: 'hp',
            label: 'HP',
            icon: '💚',
            color: '#22c55e',
            benchmarks: {
                casual: 20000,
                intermediate: 30000,
                advanced: 40000,
                whale: 50000
            },
            note: "Scale sur HP. Infusion Water → HP = DMG + survie."
        },

        sweetSpots: {
            critRate: {
                min: 85,
                max: 100,
                ideal: 95,
                priority: 2,
                status: "HIGH",
                color: "#22c55e",
                rawMax: 14000,
                note: "0% CR perso → besoin de 12-14K raw. Cap 100% idéal"
            },
            critDMG: {
                min: 180,
                max: 240,
                ideal: 200,
                priority: 3,
                status: "MODERATE",
                color: "#f59e0b",
                note: "0% CritDMG perso → investir après CR cap. Focus HP > CritDMG"
            },
            defPen: {
                min: 60,
                max: 85,
                ideal: 75,
                priority: 1,
                status: "HIGH",
                color: "#8b5cf6",
                rawMax: 70000,
                note: "Def Pen important pour maximiser les dégâts"
            }
        },

        substatPriority: ["HP%", "Def Pen", "Crit Rate%", "Crit DMG%"],

        scaling: {
            hp: { grade: "S+", description: "Tout le kit scale sur HP → priorité absolue" },
            defPen: { grade: "S", description: "Def Pen crucial pour dégâts optimaux" },
            critRate: { grade: "A", description: "0% CR perso → besoin de raw ou team buffs" },
            critDMG: { grade: "A", description: "0% CritDMG perso → investir en raw après CR" }
        },

        tips: [
            "HP = PRIORITÉ ABSOLUE car tout scale sur HP",
            "Infusion Water: Water Overload enabler",
            "Build Desire + Sylph pour maximiser HP et Water synergy"
        ],

        recommendedSets: ["Desire 4pc + Sylph 4pc"],

        benchmarks: {
            casual: { critRate: 65, critDMG: 140, defPen: 40, dps: "5-12B" },
            intermediate: { critRate: 80, critDMG: 175, defPen: 55, dps: "18-30B" },
            advanced: { critRate: 95, critDMG: 200, defPen: 70, dps: "35-55B" },
            whale: { critRate: 100, critDMG: 230, defPen: 80, dps: "55-75B" }
        }
    },
    // 🌪️ Sugimoto Reiji - Wind Infusion HP Scaler
    sugimoto: {
        id: 'sugimoto',
        name: "Sugimoto Reiji",
        role: "DPS / Wind Overload Specialist",
        element: "Wind",
        tier: "S",

        mainStat: {
            type: 'hp',
            label: 'HP',
            icon: '💚',
            color: '#22c55e',
            benchmarks: {
                casual: 20000,
                intermediate: 30000,
                advanced: 40000,
                whale: 50000
            },
            note: "Scale sur HP. Infusion Wind → HP = DMG + survie."
        },

        sweetSpots: {
            critRate: {
                min: 85,
                max: 100,
                ideal: 95,
                priority: 2,
                status: "HIGH",
                color: "#22c55e",
                rawMax: 14000,
                note: "0% CR perso → besoin de 12-14K raw. Cap 100% idéal"
            },
            critDMG: {
                min: 180,
                max: 240,
                ideal: 200,
                priority: 3,
                status: "MODERATE",
                color: "#f59e0b",
                note: "0% CritDMG perso → investir après CR cap. Focus HP > CritDMG"
            },
            defPen: {
                min: 60,
                max: 85,
                ideal: 75,
                priority: 1,
                status: "HIGH",
                color: "#8b5cf6",
                rawMax: 70000,
                note: "Def Pen important pour maximiser les dégâts"
            }
        },

        substatPriority: ["HP%", "Def Pen", "Crit Rate%", "Crit DMG%"],

        scaling: {
            hp: { grade: "S+", description: "Tout le kit scale sur HP → priorité absolue" },
            defPen: { grade: "S", description: "Def Pen crucial pour dégâts optimaux" },
            critRate: { grade: "A", description: "0% CR perso → besoin de raw ou team buffs" },
            critDMG: { grade: "A", description: "0% CritDMG perso → investir en raw après CR" }
        },

        tips: [
            "HP = PRIORITÉ ABSOLUE car tout scale sur HP",
            "Infusion Wind: Wind Overload enabler",
            "Build Desire + Sylph pour maximiser HP et Wind synergy"
        ],

        recommendedSets: ["Desire 4pc + Sylph 4pc"],

        benchmarks: {
            casual: { critRate: 65, critDMG: 140, defPen: 40, dps: "5-12B" },
            intermediate: { critRate: 80, critDMG: 175, defPen: 55, dps: "18-30B" },
            advanced: { critRate: 95, critDMG: 200, defPen: 70, dps: "35-55B" },
            whale: { critRate: 100, critDMG: 230, defPen: 80, dps: "55-75B" }
        }
    },
    // 💧 Lee Joohee - Water Healer HP Scaler (SR)
    'lee-johee': {
        id: 'lee-johee',
        name: "Lee Joohee",
        role: "Healer / Support",
        element: "Water",
        tier: "A",

        mainStat: {
            type: 'hp',
            label: 'HP',
            icon: '💚',
            color: '#22c55e',
            benchmarks: {
                casual: 18000,
                intermediate: 25000,
                advanced: 35000,
                whale: 45000
            },
            note: "Scale sur HP. +8% HP team (passive) + A2: +6% HP self. Heals et Shield scalent sur HP."
        },

        sweetSpots: {
            critRate: {
                min: 50,
                max: 80,
                ideal: 65,
                priority: 3,
                status: "LOW",
                color: "#6b7280",
                rawMax: 14000,
                note: "Healer → CR moins prioritaire"
            },
            critDMG: {
                min: 120,
                max: 180,
                ideal: 150,
                priority: 3,
                status: "LOW",
                color: "#6b7280",
                note: "Healer → CritDMG pas prioritaire"
            },
            defPen: {
                min: 40,
                max: 65,
                ideal: 55,
                priority: 2,
                status: "MODERATE",
                color: "#f59e0b",
                rawMax: 60000,
                note: "Utile pour contribution DPS mais pas prioritaire pour heal"
            }
        },

        substatPriority: ["HP%", "Def Pen", "Crit Rate%", "Crit DMG%"],

        scaling: {
            hp: { grade: "S+", description: "Tout scale sur HP: dégâts, heals, shield. +8% HP team + A2 +6% HP self" },
            defPen: { grade: "B+", description: "Utile pour DPS mais rôle principal = heal" },
            critRate: { grade: "B", description: "Healer → CR secondaire" },
            critDMG: { grade: "B", description: "Healer → CritDMG secondaire" }
        },

        tips: [
            "HP = PRIORITÉ ABSOLUE (heals + shield + dégâts scalent sur HP)",
            "Passive: +8% HP pour toute la team (permanent)",
            "A1: Heals +20% plus puissants",
            "A2: +6% HP self",
            "A3: Healing Circle restore 400 MP à toute la team",
            "A4: +50% Natural MP Recovery Rate",
            "A5: Healing Circle auto-trigger au tag out + reset CD",
            "Skill 1: +3% ATK team (15s) → petit buff offensif",
            "Ultimate: remplit 100% Core Gauge de toute la team → DPS burst window",
            "Weapon: Shield team au tag out (2-5% HP, 10s)"
        ],

        recommendedSets: ["Desire 4pc + Sylph 4pc", "Desire 4pc + Defender 4pc"],

        benchmarks: {
            casual: { critRate: 40, critDMG: 100, defPen: 25, dps: "0.5-2B" },
            intermediate: { critRate: 55, critDMG: 130, defPen: 40, dps: "2-5B" },
            advanced: { critRate: 70, critDMG: 160, defPen: 55, dps: "5-10B" },
            whale: { critRate: 80, critDMG: 180, defPen: 65, dps: "10-18B" }
        }
    },

    // 💧 Han Song-Yi - Water Assassin ATK Scaler / Umbral Weapon Specialist (SR)
    'han-song': {
        id: 'han-song',
        name: "Han Song-Yi",
        role: "Assassin DPS / Umbral Weapon Specialist",
        element: "Water",
        tier: "A",

        mainStat: {
            type: 'atk',
            label: 'ATK',
            icon: '⚔️',
            color: '#ef4444',
            benchmarks: {
                casual: 10000,
                intermediate: 15000,
                advanced: 20000,
                whale: 25000
            },
            note: "Scale sur ATK. A4: +6% ATK. Weapon: +10% Water DMG. Shield A1 scale sur ATK."
        },

        sweetSpots: {
            critRate: {
                min: 75,
                max: 100,
                ideal: 90,
                priority: 2,
                status: "HIGH",
                color: "#22c55e",
                rawMax: 14000,
                note: "A2: +5% CR. Besoin de raw pour cap. Assassin → crits importants"
            },
            critDMG: {
                min: 170,
                max: 230,
                ideal: 200,
                priority: 3,
                status: "MODERATE",
                color: "#f59e0b",
                note: "A2: +5% CD. Investir après CR cap"
            },
            defPen: {
                min: 55,
                max: 80,
                ideal: 70,
                priority: 1,
                status: "HIGH",
                color: "#8b5cf6",
                rawMax: 70000,
                note: "Pas de Def Pen perso → raw obligatoire"
            }
        },

        substatPriority: ["ATK%", "Def Pen", "Crit Rate%", "Crit DMG%"],

        scaling: {
            atk: { grade: "S", description: "Tout scale sur ATK. A4 +6% ATK. Shield A1 = 15% ATK" },
            defPen: { grade: "A+", description: "0% Def Pen perso → raw obligatoire" },
            critRate: { grade: "A", description: "A2: +5% CR → petit boost, besoin de raw" },
            critDMG: { grade: "A", description: "A2: +5% CD → petit boost" }
        },

        tips: [
            "Umbral Weapon gameplay: placer des armes → Retrieve pour burst massif",
            "Passive: +30% Retrieve DMG sur cibles empoisonnées → Poison synergy",
            "Weapon: Assassination Ready → +20% Retrieve DMG par arme placée (max 3 stacks)",
            "A1: Shield 15% ATK sur Retrieve (3s) → survivabilité",
            "A2: +5% CR & +5% CD permanent",
            "A3: Swift Flight +3 Umbral Weapons → plus de Retrieve damage",
            "A4: +6% ATK permanent",
            "A5: Rakshasa (Ultimate) reset les CD de Swift Flight et Retrieve → burst énorme"
        ],

        recommendedSets: ["Courageous 4pc + Armed 4pc", "Courageous 4pc + Obsidian 4pc"],

        benchmarks: {
            casual: { critRate: 60, critDMG: 140, defPen: 35, dps: "1-3B" },
            intermediate: { critRate: 75, critDMG: 170, defPen: 50, dps: "3-6B" },
            advanced: { critRate: 90, critDMG: 200, defPen: 65, dps: "6-10B" },
            whale: { critRate: 100, critDMG: 230, defPen: 75, dps: "10-15B" }
        }
    },

    // 💧 Meilin Fisher - Water Healer/Buffer HP Scaler (SSR)
    meilin: {
        id: 'meilin',
        name: "Meilin Fisher",
        role: "Healer / Buffer",
        element: "Water",
        tier: "S",

        mainStat: {
            type: 'hp',
            label: 'HP',
            icon: '💚',
            color: '#22c55e',
            benchmarks: {
                casual: 20000,
                intermediate: 30000,
                advanced: 40000,
                whale: 55000
            },
            note: "Scale sur HP. A4: +12% HP self. Bye Meow +24% ATK/DEF team. A2: +16% ATK/DEF Water. Weapon DMG buff scale sur HP."
        },

        sweetSpots: {
            critRate: {
                min: 50,
                max: 80,
                ideal: 65,
                priority: 3,
                status: "LOW",
                color: "#6b7280",
                rawMax: 14000,
                note: "Healer/Buffer → CR secondaire"
            },
            critDMG: {
                min: 120,
                max: 180,
                ideal: 150,
                priority: 3,
                status: "LOW",
                color: "#6b7280",
                note: "Buffer → CritDMG secondaire"
            },
            defPen: {
                min: 40,
                max: 65,
                ideal: 55,
                priority: 2,
                status: "MODERATE",
                color: "#f59e0b",
                rawMax: 60000,
                note: "Utile mais rôle = buffer/healer"
            }
        },

        substatPriority: ["HP%", "Def Pen", "Crit Rate%", "Crit DMG%"],

        scaling: {
            hp: { grade: "S+", description: "HP = dégâts + heals + weapon DMG buff (1% per 2000 HP). A4 +12% HP self" },
            defPen: { grade: "B+", description: "Utile pour DPS mais rôle principal = buffer" },
            critRate: { grade: "B", description: "Buffer → CR secondaire" },
            critDMG: { grade: "B", description: "Buffer → CritDMG secondaire" }
        },

        tips: [
            "MEILLEUR BUFFER du jeu: Bye Meow +24% ATK/DEF team + A2 +16% ATK/DEF Water = +40% ATK/DEF",
            "Cuddle Puddle: +8% Water DMG taken on enemy (debuff 16s) → énorme pour Water team",
            "A1: So Cute! enhanced → +32% Core ATK DMG team (8s) sur Skill 2",
            "A1: Cut Butler → protège l'allié au plus haut ATK (Super Armor 8s)",
            "A2: +8% ATK/DEF all + +8% ATK/DEF Water = +16% permanent pour Water team",
            "A3: Rear Lash charge 8% Power Gauge team (16% vs Elite+)",
            "A4: +12% HP self",
            "A5: Pumped Up! enhanced → +16% ATK/DEF/CR + Core ATK DMG + -16% DMG taken (24s)",
            "Weapon: Highest ATK ally damage +16% (basé sur HP), Ult CD -20%"
        ],

        recommendedSets: ["Desire 4pc + Sylph 4pc", "Desire 4pc + Defender 4pc"],

        benchmarks: {
            casual: { critRate: 40, critDMG: 100, defPen: 25, dps: "0.5-3B" },
            intermediate: { critRate: 55, critDMG: 130, defPen: 40, dps: "3-8B" },
            advanced: { critRate: 70, critDMG: 160, defPen: 55, dps: "8-15B" },
            whale: { critRate: 80, critDMG: 180, defPen: 65, dps: "15-25B" }
        }
    },

    // 💧 Nam Chae-Young - Water Breaker HP Scaler / Freeze Specialist (SR)
    nam: {
        id: 'nam',
        name: "Nam Chae-Young",
        role: "Breaker / Freeze Specialist",
        element: "Water",
        tier: "A",

        mainStat: {
            type: 'hp',
            label: 'HP',
            icon: '💚',
            color: '#22c55e',
            benchmarks: {
                casual: 15000,
                intermediate: 22000,
                advanced: 30000,
                whale: 40000
            },
            note: "Scale sur HP. A2: +6% HP self. Break + Freeze spécialiste."
        },

        sweetSpots: {
            critRate: {
                min: 70,
                max: 100,
                ideal: 85,
                priority: 2,
                status: "HIGH",
                color: "#22c55e",
                rawMax: 14000,
                note: "0% CR perso → besoin de raw"
            },
            critDMG: {
                min: 150,
                max: 210,
                ideal: 180,
                priority: 3,
                status: "MODERATE",
                color: "#f59e0b",
                note: "Investir après CR cap"
            },
            defPen: {
                min: 50,
                max: 75,
                ideal: 65,
                priority: 1,
                status: "HIGH",
                color: "#8b5cf6",
                rawMax: 70000,
                note: "Weapon: -20% DEF on Frozen → Def Pen naturel. Reste utile en raw"
            }
        },

        substatPriority: ["HP%", "Def Pen", "Crit Rate%", "Crit DMG%"],

        scaling: {
            hp: { grade: "S", description: "Basic + Skills scale sur HP. A2 +6% HP" },
            defPen: { grade: "A+", description: "Weapon -20% DEF sur Frozen + raw Def Pen → combo puissant" },
            critRate: { grade: "A", description: "0% CR perso → besoin de raw" },
            critDMG: { grade: "A", description: "0% CD perso → investir après CR" }
        },

        tips: [
            "Freeze spécialiste: +8% DMG on Frozen (passive) + Weapon -20% DEF on Frozen",
            "A1: +20% Break effectiveness",
            "A2: +6% HP self",
            "A3: +80% Light-Freezing Arrow (Skill 2) damage → burst énorme",
            "A4: +20% explosion range sur K63, Icy Step, Tip of Iceberg",
            "A5: Freeze duration → 3s (was 2s) → meilleur CC uptime + plus de Frozen debuff",
            "Weapon: -20% DEF on Frozen targets (5s) → très puissant avec Freeze spam",
            "Combo: Freeze → Weapon DEF debuff → team profite du -20% DEF"
        ],

        recommendedSets: ["Desire 4pc + Sylph 4pc", "Courageous 4pc + Armed 4pc"],

        benchmarks: {
            casual: { critRate: 55, critDMG: 120, defPen: 30, dps: "1-4B" },
            intermediate: { critRate: 70, critDMG: 155, defPen: 50, dps: "4-8B" },
            advanced: { critRate: 85, critDMG: 185, defPen: 65, dps: "8-15B" },
            whale: { critRate: 100, critDMG: 210, defPen: 75, dps: "15-25B" }
        }
    },

    // 💧 Seo Jiwoo - Water Breaker HP Scaler / Water Dragon Training (SSR)
    seo: {
        id: 'seo',
        name: "Seo Jiwoo",
        role: "Breaker / DPS",
        element: "Water",
        tier: "S",

        mainStat: {
            type: 'hp',
            label: 'HP',
            icon: '💚',
            color: '#22c55e',
            benchmarks: {
                casual: 20000,
                intermediate: 30000,
                advanced: 42000,
                whale: 55000
            },
            note: "Scale sur HP. A4: +15% Max HP from CritDMG. Heavy Attacks + Shield scalent sur HP."
        },

        sweetSpots: {
            critRate: {
                min: 60,
                max: 90,
                ideal: 75,
                priority: 2,
                status: "HIGH",
                color: "#22c55e",
                rawMax: 14000,
                note: "A5: +32% CR on Heavy Attacks/Ult → besoin modéré en raw"
            },
            critDMG: {
                min: 170,
                max: 240,
                ideal: 210,
                priority: 1,
                status: "HIGH",
                color: "#ef4444",
                note: "Weapon: +20% CD + stacking CD (up to 120% with 20 stacks). A4: CritDMG → HP. Double value!"
            },
            defPen: {
                min: 55,
                max: 80,
                ideal: 70,
                priority: 2,
                status: "HIGH",
                color: "#8b5cf6",
                rawMax: 70000,
                note: "0% Def Pen perso → raw obligatoire"
            }
        },

        substatPriority: ["HP%", "Crit DMG%", "Def Pen", "Crit Rate%"],

        scaling: {
            hp: { grade: "S+", description: "Tout scale HP + A4 convertit CritDMG en HP. Shield team 5% HP" },
            critDMG: { grade: "S", description: "Weapon +20% CD + stacking up to 120% CD. A4: CritDMG → +15% Max HP. DOUBLE VALUE" },
            defPen: { grade: "A+", description: "0% Def Pen perso → raw obligatoire" },
            critRate: { grade: "A", description: "A5: +32% CR on Heavy Attacks/Ult → besoin modéré" }
        },

        tips: [
            "HP + CritDMG = double priorité (A4 convertit CritDMG → +15% Max HP)",
            "Water Dragon Training: 3 stacks → skills reset + Heavy Attack versions",
            "A1: +150% Heavy Attack damage → burst fenêtre énorme",
            "A2: +15% Break effectiveness (+50% sur Heavy Lightning Kick)",
            "A5: +32% CR + Skill DMG sur Heavy Attacks et Ultimate",
            "Weapon: +20% CritDMG flat + stacking +6% CritDMG (max 20 stacks = +120% CritDMG!)",
            "Heavy Attack: Water Dragon Rush → Shield 5% HP team (25s)",
            "Heavy Attack: Lightning Kick → +50% Break effectiveness (A2)",
            "Rotation: Basic/Core → 3 stacks → Heavy Rush + Heavy Kick → repeat"
        ],

        recommendedSets: ["Desire 4pc + Sylph 4pc", "Courageous 4pc + Armed 4pc"],

        benchmarks: {
            casual: { critRate: 50, critDMG: 140, defPen: 35, dps: "5-15B" },
            intermediate: { critRate: 65, critDMG: 180, defPen: 55, dps: "15-30B" },
            advanced: { critRate: 80, critDMG: 220, defPen: 70, dps: "30-55B" },
            whale: { critRate: 90, critDMG: 260, defPen: 80, dps: "55-80B" }
        }
    },

    // 💧 Seorin - Water Ranger Breaker (HP scaling)
    seorin: {
        tier: 'A',
        role: 'Breaker',
        element: 'Water',
        scaleStat: 'HP',
        mainStat: {
            name: 'HP',
            benchmarks: {
                casual: 20000,
                intermediate: 28000,
                advanced: 35000,
                whale: 45000
            }
        },
        sweetSpots: {
            critRate: { min: 65, ideal: 85, max: 100, unit: '%' },
            critDMG: { min: 150, ideal: 200, max: 260, unit: '%' },
            defPen: { min: 40, ideal: 60, max: 80, unit: '%' }
        },
        substatPriority: ['HP %', 'Crit Rate', 'Crit DMG', 'Def Pen', 'Damage Increase'],
        scaling: {
            HP: 'S',
            critRate: 'A',
            critDMG: 'A',
            defPen: 'B',
            damageIncrease: 'A'
        },
        tips: [
            'Seorin scale sur HP - maximise HP % sur tous les artefacts',
            'Subzero stacks Water DMG taken sur les ennemis - excellent debuffeur Water',
            'A3 Black Tea? donne +20% DEF et +20% HP a toute l\'equipe',
            'A4 +10% Water DMG par membre Water (max 30%) - build full Water',
            'A5 Enhanced Subzero double le debuff (+20% Water DMG taken)',
            'Limited Break (+30-50% DMG/CritDMG) proc sur Break - maintiens le Break'
        ],
        recommendedSets: {
            bdg: '8x Desire',
            general: '4x Armed + 4x Obsidian',
            alternative: '4x Guardian + 4x Sylph'
        },
        benchmarks: {
            casual: { critRate: 50, critDMG: 150, defPen: 40, dps: "3-8B" },
            intermediate: { critRate: 65, critDMG: 180, defPen: 55, dps: "8-18B" },
            advanced: { critRate: 80, critDMG: 220, defPen: 70, dps: "18-35B" },
            whale: { critRate: 90, critDMG: 260, defPen: 80, dps: "35-55B" }
        }
    },

    // 💧 Shuhua - Water Assassin DPS (ATK scaling)
    shuhua: {
        tier: 'S',
        role: 'DPS',
        element: 'Water',
        scaleStat: 'Attack',
        mainStat: {
            name: 'Attack',
            benchmarks: {
                casual: 12000,
                intermediate: 16000,
                advanced: 20000,
                whale: 26000
            }
        },
        sweetSpots: {
            critRate: { min: 65, ideal: 85, max: 100, unit: '%' },
            critDMG: { min: 160, ideal: 220, max: 280, unit: '%' },
            defPen: { min: 45, ideal: 65, max: 85, unit: '%' }
        },
        substatPriority: ['ATK %', 'Crit DMG', 'Crit Rate', 'Def Pen', 'Damage Increase'],
        scaling: {
            attack: 'S',
            critRate: 'A',
            critDMG: 'S',
            defPen: 'A',
            damageIncrease: 'A'
        },
        tips: [
            'Shuhua scale sur ATK - maximise ATK % sur tous les artefacts',
            'FOREVER donne +15% DMG dealt a toute l\'equipe en donjon (3 stacks)',
            'Combo: Pop Star Landing → Performance → Core Attack → High-energy Beat en boucle',
            'A1 Tension Drop debuff +10% Water DMG taken (10 stacks) - debuff perso uniquement',
            'A3 Tension Up +20% Water DMG pendant Performance',
            'A4 +16% ATK passif permanent',
            'A5 Volume Up +30% DMG + 30% CR sur Starlight Howl (10s) - excellent burst window'
        ],
        recommendedSets: {
            bdg: '4x Armed + 4x Expert',
            general: '8x Chaotic Infamy',
            alternative: '4x Armed + 4x Obsidian'
        },
        benchmarks: {
            casual: { critRate: 50, critDMG: 150, defPen: 40, dps: "5-15B" },
            intermediate: { critRate: 65, critDMG: 200, defPen: 55, dps: "15-35B" },
            advanced: { critRate: 80, critDMG: 240, defPen: 70, dps: "35-60B" },
            whale: { critRate: 90, critDMG: 280, defPen: 85, dps: "60-100B" }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🌪️ WIND ELEMENT CHARACTERS
    // ═══════════════════════════════════════════════════════════════

    // 🌪️ Mirei - Wind Assassin DPS (ATK scaling) - Best Wind DPS
    mirei: {
        id: 'mirei',
        name: "Mirei",
        role: "DPS / Wind Assassin",
        element: "Wind",
        tier: "S+",
        mainStat: {
            type: 'atk',
            label: 'ATK',
            icon: '⚔️',
            color: '#ef4444',
            benchmarks: {
                casual: 14000,
                intermediate: 18000,
                advanced: 22000,
                whale: 28000
            },
            note: "ATK scaler pur. Self-buffs massifs: +90% ATK [Possessed] + +24% ATK [Deep Darkness]"
        },
        sweetSpots: {
            critRate: {
                min: 80,
                max: 100,
                ideal: 95,
                priority: 1,
                status: "CAP",
                color: "#22c55e",
                rawMax: 14000,
                note: "+74% CR self-buff (Possessed+Deep Darkness+Weapon) → très peu de CR raw nécessaire, cap 100% facilement"
            },
            critDMG: {
                min: 180,
                max: 260,
                ideal: 200,
                priority: 3,
                status: "MODERATE",
                color: "#f59e0b",
                note: "+90% CritDMG self-buff → investir modérément, focus ATK% et DefPen en substats"
            },
            defPen: {
                min: 55,
                max: 85,
                ideal: 75,
                priority: 2,
                status: "HIGH",
                color: "#8b5cf6",
                rawMax: 70000,
                note: "+20% DefPen [Midnight Gale] → besoin de ~55% raw pour atteindre 75% total"
            }
        },
        substatPriority: ['ATK %', 'Crit DMG', 'Def Pen', 'Crit Rate'],
        scaling: {
            atk: { grade: "S+", description: "Self-buffs massifs: +90% ATK [Possessed] + +24% ATK [Deep Darkness]" },
            critDMG: { grade: "S", description: "+90% CritDMG self-buff → scaling CritDMG excellent" },
            defPen: { grade: "S", description: "+20% DefPen [Midnight Gale] → bon scaling DefPen" },
            critRate: { grade: "A", description: "+74% CR self-buff → CR raw peu nécessaire" }
        },
        tips: [
            'Mirei self-buff +74% CR total (20% Possessed + 24% Deep Darkness + 30% Weapon) → très peu de CR raw nécessaire',
            'Self-buff +90% CritDMG (20% Possessed + 40% A2 + 30% Weapon) → focus ATK% et DefPen en substats',
            '+90% ATK [Possessed] + +24% ATK [Deep Darkness] = scaling ATK monstrueux',
            'A5 +80% Skill DMG → multiplicateur énorme sur toutes les skills',
            '+20% DefPen [Midnight Gale] + +36% Wind DMG (A4) → dégâts Wind absurdes',
            'Meilleure DPS Wind du jeu, investir prioritairement sur elle'
        ],
        recommendedSets: {
            bdg: '4x Armed + 4x Expert',
            general: '8x Chaotic Infamy',
            alternative: '4x Armed + 4x Obsidian'
        },
        benchmarks: {
            casual: { critRate: 60, critDMG: 160, defPen: 45, dps: "15-30B" },
            intermediate: { critRate: 80, critDMG: 200, defPen: 60, dps: "40-70B" },
            advanced: { critRate: 95, critDMG: 230, defPen: 75, dps: "80-130B" },
            whale: { critRate: 100, critDMG: 260, defPen: 85, dps: "130-200B" }
        }
    },

    // 🌪️ Soyeon - Wind Fighter DPS/Support (ATK scaling)
    soyeon: {
        id: 'soyeon',
        name: "Soyeon",
        role: "DPS / Support Wind",
        element: "Wind",
        tier: "A+",

        mainStat: {
            type: 'atk',
            label: 'ATK',
            icon: '⚔️',
            color: '#ef4444',
            benchmarks: {
                casual: 12000,
                intermediate: 16000,
                advanced: 20000,
                whale: 25000
            },
            note: "ATK scaler avec buffs team Wind. A3 +16% ATK team-wind, A4 +20% Wind DMG team"
        },

        sweetSpots: {
            critRate: {
                min: 80,
                max: 100,
                ideal: 95,
                priority: 1,
                status: "CAP",
                color: "#22c55e",
                rawMax: 14000,
                note: "A5 +10% CR team → réduit le besoin de CR raw pour toute l'équipe Wind, viser cap 100%"
            },
            critDMG: {
                min: 170,
                max: 240,
                ideal: 200,
                priority: 3,
                status: "MODERATE",
                color: "#f59e0b",
                note: "A1 +15% CritDMG self → investir modérément, priorité ATK% et DefPen"
            },
            defPen: {
                min: 55,
                max: 85,
                ideal: 75,
                priority: 2,
                status: "HIGH",
                color: "#8b5cf6",
                rawMax: 70000,
                note: "Pas de DefPen self-buff → besoin de raw DefPen élevé pour maximiser les dégâts"
            }
        },

        substatPriority: ['ATK %', 'Def Pen', 'Crit DMG', 'Crit Rate'],

        scaling: {
            atk: { grade: "S", description: "ATK scaler hybride DPS/Support avec buffs team Wind" },
            critDMG: { grade: "A", description: "A1 +15% CritDMG self → scaling correct" },
            defPen: { grade: "S", description: "Pas de DefPen self → investir en raw pour dégâts optimaux" },
            critRate: { grade: "A", description: "A5 +10% CR team → réduit besoin de CR raw" }
        },
        tips: [
            'A5 +10% CR team → réduit le besoin de CR raw pour toute l\'équipe Wind',
            'A4 +20% Wind DMG team → buff Wind majeur permanent',
            'A3 +16% ATK team-wind → excellent support passif',
            '[FOREVER] +15% DMG dealt team en donjon → utile en raid',
            'A1 +15% CritDMG self → petit boost perso',
            'Weapon: +12% ATK self + Basic Skill DMG pour l\'équipe',
            'Hybride DPS/Support: investir ATK pour ses propres dégâts tout en buffant l\'équipe'
        ],
        recommendedSets: {
            bdg: '4x Armed + 4x Expert',
            general: '4x Sylph + 4x Armed',
            alternative: '4x Armed + 4x Obsidian'
        },
        benchmarks: {
            casual: { critRate: 55, critDMG: 150, defPen: 40, dps: "5-12B" },
            intermediate: { critRate: 75, critDMG: 180, defPen: 55, dps: "15-30B" },
            advanced: { critRate: 90, critDMG: 210, defPen: 70, dps: "30-55B" },
            whale: { critRate: 95, critDMG: 240, defPen: 80, dps: "55-85B" }
        }
    },

    // 🌪️ Jinah - Wind Support GOD (DEF scaling)
    jinah: {
        id: 'jinah',
        name: "Jinah",
        role: "Support / Wind Buffer",
        element: "Wind",
        tier: "S+",

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
            note: "DEF scaler. Meilleur support Wind du jeu. Buffs Wind massifs pour toute l'équipe"
        },

        sweetSpots: {
            critRate: {
                min: 75,
                max: 100,
                ideal: 95,
                priority: 2,
                status: "HIGH",
                color: "#22c55e",
                rawMax: 14000,
                note: "Support mais contribue aux dégâts → viser CR élevé pour maximiser son impact"
            },
            critDMG: {
                min: 160,
                max: 240,
                ideal: 200,
                priority: 3,
                status: "MODERATE",
                color: "#f59e0b",
                note: "Priorité DEF% et DefPen avant CritDMG, investir modérément"
            },
            defPen: {
                min: 55,
                max: 85,
                ideal: 75,
                priority: 1,
                status: "PRIORITY",
                color: "#8b5cf6",
                rawMax: 70000,
                note: "DefPen crucial pour maximiser ses propres dégâts en tant que support DEF scaler"
            }
        },

        substatPriority: ['DEF %', 'Def Pen', 'Crit Rate', 'Crit DMG'],

        scaling: {
            def: { grade: "S+", description: "Tout le kit scale sur DEF → priorité absolue" },
            defPen: { grade: "S", description: "DefPen crucial pour ses propres dégâts" },
            critRate: { grade: "A", description: "CR important pour contribuer aux dégâts" },
            critDMG: { grade: "A", description: "CritDMG secondaire, focus DEF% d'abord" }
        },
        tips: [
            'Meilleur support Wind du jeu - priorité absolue dans toute team Wind',
            'A3 doublé pour Wind: +20% ATK, +20% DEF, +10% Basic Skill DMG pour alliés Wind',
            'A4 +5% Wind DMG par allié Wind (×3 = +15% team-wind) → build full Wind obligatoire',
            'A5 +10% Wind DMG team → total +25% Wind DMG team avec A4',
            'A1 +20% Basic/Ulti team + +10% Wind DMG team → buffs empilés',
            'A0 +50% Skill DMG self + +10% Basic/Ulti team → elle fait aussi des dégâts',
            'Weapon: DEF 12% self + Basic Skill DMG 2% team',
            'Focus DEF% en mainstat et substats, puis Def Pen pour ses propres dégâts'
        ],
        recommendedSets: {
            bdg: '4x Guardian + 4x Sylph',
            general: '8x Sylph',
            alternative: '4x Armed + 4x Sylph'
        },
        benchmarks: {
            casual: { critRate: 55, critDMG: 140, defPen: 40, dps: "3-8B" },
            intermediate: { critRate: 75, critDMG: 175, defPen: 55, dps: "10-20B" },
            advanced: { critRate: 90, critDMG: 200, defPen: 70, dps: "25-45B" },
            whale: { critRate: 95, critDMG: 240, defPen: 80, dps: "45-70B" }
        }
    },

    // 🌪️ Niermann (Lennart Niermann) - Wind Fighter DPS (ATK scaling)
    niermann: {
        id: 'niermann',
        name: "Lennart Niermann",
        role: "DPS / Wind Speed",
        element: "Wind",
        tier: "S",

        mainStat: {
            type: 'atk',
            label: 'ATK',
            icon: '⚔️',
            color: '#ef4444',
            benchmarks: {
                casual: 13000,
                intermediate: 17000,
                advanced: 21000,
                whale: 27000
            },
            note: "ATK scaler avec self-buffs massifs. [Speed of Sound] +40% ATK, [Supersonic] +50% ATK"
        },

        sweetSpots: {
            critRate: {
                min: 75,
                max: 100,
                ideal: 95,
                priority: 1,
                status: "CAP",
                color: "#22c55e",
                rawMax: 14000,
                note: "A1 +10% CR self → réduit légèrement le besoin raw, viser cap 100%"
            },
            critDMG: {
                min: 170,
                max: 250,
                ideal: 200,
                priority: 3,
                status: "MODERATE",
                color: "#f59e0b",
                note: "+90% CritDMG self (Speed of Sound+Supersonic) → investir modérément, focus ATK% et DefPen"
            },
            defPen: {
                min: 50,
                max: 85,
                ideal: 75,
                priority: 2,
                status: "HIGH",
                color: "#8b5cf6",
                rawMax: 70000,
                note: "A3 +40% DefPen [Speed of Sound] → besoin de ~35% raw pour atteindre 75% total"
            }
        },

        substatPriority: ['ATK %', 'Def Pen', 'Crit DMG', 'Crit Rate'],

        scaling: {
            atk: { grade: "S+", description: "Self-buffs massifs: +40% ATK [Speed of Sound] + +50% ATK [Supersonic]" },
            critDMG: { grade: "S", description: "+90% CritDMG self → scaling CritDMG excellent" },
            defPen: { grade: "S", description: "+40% DefPen [Speed of Sound] → réduit le besoin raw" },
            critRate: { grade: "A", description: "A1 +10% CR self → CR raw nécessaire pour cap" }
        },
        tips: [
            'Self-buff +90% CritDMG total (40% Speed of Sound + 50% Supersonic) → focus ATK% et DefPen',
            'A1 +10% CR self → réduit légèrement le besoin de CR raw',
            'A3 +40% DefPen [Speed of Sound] → énorme, réduit beaucoup le besoin de DefPen raw',
            'A4 +12% Wind DMG par allié Wind (×3 = +36%) → build full Wind',
            'Weapon: +12% ATK self + DefPen 10% team → support DefPen passif',
            '[Supersonic] A5 +50% ATK/CritDMG → burst window très puissant',
            'Avec +40% DefPen self, viser ~35% raw DefPen suffit pour atteindre 75% total'
        ],
        recommendedSets: {
            bdg: '4x Armed + 4x Expert',
            general: '8x Chaotic Infamy',
            alternative: '4x Armed + 4x Obsidian'
        },
        benchmarks: {
            casual: { critRate: 55, critDMG: 150, defPen: 40, dps: "10-20B" },
            intermediate: { critRate: 75, critDMG: 185, defPen: 55, dps: "25-50B" },
            advanced: { critRate: 90, critDMG: 220, defPen: 70, dps: "55-90B" },
            whale: { critRate: 95, critDMG: 250, defPen: 80, dps: "90-140B" }
        }
    },

    // 🌪️ Han Se-Mi - Wind Healer (HP scaling)
    han: {
        id: 'han',
        name: "Han Se-Mi",
        role: "Healer / Wind Support",
        element: "Wind",
        tier: "A+",

        mainStat: {
            type: 'hp',
            label: 'HP',
            icon: '💚',
            color: '#22c55e',
            benchmarks: {
                casual: 18000,
                intermediate: 26000,
                advanced: 34000,
                whale: 42000
            },
            note: "HP scaler. Healer Wind avec buffs team. A2 +10% HP, A5 +10% ATK/+10% DEF/+20% Wind DMG team"
        },

        sweetSpots: {
            critRate: {
                min: 75,
                max: 100,
                ideal: 95,
                priority: 2,
                status: "HIGH",
                color: "#22c55e",
                rawMax: 14000,
                note: "A1 +10% CR team (20s sur Ulti) → CR important pour contribuer aux dégâts entre heals"
            },
            critDMG: {
                min: 160,
                max: 240,
                ideal: 200,
                priority: 3,
                status: "MODERATE",
                color: "#f59e0b",
                note: "A1 +10% CritDMG team → investir modérément, focus HP% pour maximiser les soins"
            },
            defPen: {
                min: 55,
                max: 85,
                ideal: 75,
                priority: 1,
                status: "PRIORITY",
                color: "#8b5cf6",
                rawMax: 70000,
                note: "DefPen prioritaire pour maximiser la contribution dégâts entre phases de heal"
            }
        },

        substatPriority: ['HP %', 'Def Pen', 'Crit Rate', 'Crit DMG'],

        scaling: {
            hp: { grade: "S", description: "HP scaler → heals et survie scalent sur HP" },
            defPen: { grade: "A", description: "DefPen pour contribuer aux dégâts" },
            critRate: { grade: "A", description: "A1 +10% CR team → CR utile pour dégâts" },
            critDMG: { grade: "B", description: "CritDMG secondaire, focus HP% d'abord" }
        },
        tips: [
            'Healer Wind principale - indispensable en team Wind pour la survie',
            'A1 +10% CR + +10% CritDMG team (20s sur Ulti) → buff team burst',
            'A4 +10% Wind DMG team → contribue aux dégâts Wind',
            'A5 +10% ATK, +10% DEF, +20% Wind DMG team (25s) → buff total énorme',
            'Weapon: HP 10% self + 5% DMG taken debuff sur ennemi → survie + dégâts',
            'Focus HP% pour maximiser les soins, puis Def Pen pour contribuer aux dégâts'
        ],
        recommendedSets: {
            bdg: '4x Guardian + 4x Sylph',
            general: '8x Desire',
            alternative: '4x Desire + 4x Sylph'
        },
        benchmarks: {
            casual: { critRate: 50, critDMG: 140, defPen: 35, dps: "2-5B" },
            intermediate: { critRate: 70, critDMG: 170, defPen: 50, dps: "5-12B" },
            advanced: { critRate: 85, critDMG: 200, defPen: 65, dps: "12-25B" },
            whale: { critRate: 95, critDMG: 230, defPen: 75, dps: "25-40B" }
        }
    },

    // 🌪️ Goto Ryuji - Wind Tank (HP scaling)
    goto: {
        id: 'goto',
        name: "Goto Ryuji",
        role: "Tank / Wind Frontline",
        element: "Wind",
        tier: "A",

        mainStat: {
            type: 'hp',
            label: 'HP',
            icon: '💚',
            color: '#22c55e',
            benchmarks: {
                casual: 20000,
                intermediate: 28000,
                advanced: 36000,
                whale: 45000
            },
            note: "HP scaler. Tank Wind avec A2 +10% HP, A4 +10% DEF. Focus survie"
        },

        sweetSpots: {
            critRate: {
                min: 60,
                max: 100,
                ideal: 85,
                priority: 2,
                status: "HIGH",
                color: "#22c55e",
                rawMax: 14000,
                note: "Tank → CR secondaire, mais utile pour contribuer un peu aux dégâts"
            },
            critDMG: {
                min: 140,
                max: 220,
                ideal: 180,
                priority: 3,
                status: "MODERATE",
                color: "#f59e0b",
                note: "Tank → CritDMG très secondaire, focus HP% et DEF% pour survie"
            },
            defPen: {
                min: 40,
                max: 75,
                ideal: 60,
                priority: 1,
                status: "PRIORITY",
                color: "#8b5cf6",
                rawMax: 70000,
                note: "DefPen prioritaire parmi les stats offensives pour un minimum de contribution dégâts"
            }
        },

        substatPriority: ['HP %', 'DEF %', 'Def Pen', 'Crit Rate'],

        scaling: {
            hp: { grade: "S", description: "HP scaler → survie et tanking scalent sur HP" },
            def: { grade: "A", description: "DEF secondaire important pour la survie" },
            critRate: { grade: "B", description: "CR peu prioritaire pour un tank" },
            critDMG: { grade: "B", description: "CritDMG très secondaire pour un tank" }
        },
        tips: [
            'Tank Wind principal - A1 +60% DEF sur taunt → très tanky en aggro',
            'A0 +15% CritDMG par allié Wind → bonus passif intéressant en full Wind',
            'A2 +10% HP et A4 +10% DEF → solide en survie pure',
            'A5 Shield → couche de protection supplémentaire',
            'Weapon: HP 10% self + CritDMG stacks on skill → contribue un peu aux dégâts',
            'Focus HP% et DEF% pour maximiser la survie, dégâts secondaires'
        ],
        recommendedSets: {
            bdg: '4x Guardian + 4x Desire',
            general: '8x Desire',
            alternative: '4x Guardian + 4x Sylph'
        },
        benchmarks: {
            casual: { critRate: 45, critDMG: 130, defPen: 30, dps: "1-4B" },
            intermediate: { critRate: 65, critDMG: 160, defPen: 45, dps: "4-10B" },
            advanced: { critRate: 80, critDMG: 185, defPen: 60, dps: "10-20B" },
            whale: { critRate: 85, critDMG: 220, defPen: 70, dps: "20-35B" }
        }
    },

    // 🌪️ Woo Jinchul - Wind DPS Solo (ATK scaling)
    woo: {
        id: 'woo',
        name: "Woo Jinchul",
        role: "DPS Solo / Wind Selfish",
        element: "Wind",
        tier: "A",

        mainStat: {
            type: 'atk',
            label: 'ATK',
            icon: '⚔️',
            color: '#ef4444',
            benchmarks: {
                casual: 12000,
                intermediate: 15000,
                advanced: 19000,
                whale: 24000
            },
            note: "ATK scaler self-only. Aucun buff team. +30% Skill DMG, +35% DMG increase, +16% Wind DMG self"
        },

        sweetSpots: {
            critRate: {
                min: 75,
                max: 100,
                ideal: 95,
                priority: 1,
                status: "CAP",
                color: "#22c55e",
                rawMax: 14000,
                note: "Pas de CR self-buff → besoin de CR raw élevé, viser cap 100%"
            },
            critDMG: {
                min: 170,
                max: 240,
                ideal: 200,
                priority: 3,
                status: "MODERATE",
                color: "#f59e0b",
                note: "Pas de CritDMG self-buff → investir modérément après CR cap et DefPen"
            },
            defPen: {
                min: 55,
                max: 85,
                ideal: 75,
                priority: 2,
                status: "HIGH",
                color: "#8b5cf6",
                rawMax: 70000,
                note: "+10% DefPen self (A2) + 20% [Midnight Gale] weapon → besoin de ~45% raw"
            }
        },

        substatPriority: ['ATK %', 'Def Pen', 'Crit DMG', 'Crit Rate'],

        scaling: {
            atk: { grade: "S", description: "ATK scaler self-only avec multiplicateurs empilés" },
            critRate: { grade: "A", description: "Pas de CR self-buff → CR raw nécessaire" },
            critDMG: { grade: "A", description: "Pas de CritDMG self-buff → investir en raw" },
            defPen: { grade: "A", description: "+10% DefPen (A2) + 20% weapon → scaling correct" }
        },
        tips: [
            'DPS purement égoïste - ZERO buff team, tous les buffs sont self-only',
            '+10% DefPen self (A2) + 20% [Midnight Gale] weapon → réduction besoin raw DefPen',
            '+35% DMG increase self (A3) → gros multiplicateur personnel',
            '+100% Break effect (A1) → excellent pour casser les barres de break',
            '+16% Wind DMG self (A4) + +60% DEF self (A5) → un peu de survie',
            'Weapon: DefPen 5% + Wind DMG 10% team (excl. user) → ironie: le seul buff team vient de l\'arme',
            'Correct en DPS solo mais ne contribue rien a l\'équipe - préférer Mirei/Niermann'
        ],
        recommendedSets: {
            bdg: '4x Armed + 4x Expert',
            general: '8x Chaotic Infamy',
            alternative: '4x Armed + 4x Obsidian'
        },
        benchmarks: {
            casual: { critRate: 50, critDMG: 150, defPen: 40, dps: "4-10B" },
            intermediate: { critRate: 70, critDMG: 180, defPen: 55, dps: "12-25B" },
            advanced: { critRate: 90, critDMG: 210, defPen: 70, dps: "25-45B" },
            whale: { critRate: 95, critDMG: 240, defPen: 80, dps: "45-70B" }
        }
    },

    // 🌪️ Hwang Dongsoo - Wind Tank (DEF scaling)
    hwang: {
        id: 'hwang',
        name: "Hwang Dongsoo",
        role: "Tank / Wind Self-tank",
        element: "Wind",
        tier: "B",

        mainStat: {
            type: 'def',
            label: 'DEF',
            icon: '🛡️',
            color: '#3b82f6',
            benchmarks: {
                casual: 7000,
                intermediate: 10000,
                advanced: 14000,
                whale: 18000
            },
            note: "DEF scaler. Tank égoïste sans buffs team. +15% DEF stacks ×5, +24% DEF, +12% DEF/DefPen [Madness]"
        },

        sweetSpots: {
            critRate: {
                min: 55,
                max: 95,
                ideal: 80,
                priority: 2,
                status: "HIGH",
                color: "#22c55e",
                rawMax: 14000,
                note: "Tank égoïste → CR secondaire, utile pour un minimum de dégâts"
            },
            critDMG: {
                min: 130,
                max: 200,
                ideal: 160,
                priority: 3,
                status: "MODERATE",
                color: "#f59e0b",
                note: "CritDMG très secondaire pour un tank, focus DEF% pour survie"
            },
            defPen: {
                min: 40,
                max: 75,
                ideal: 60,
                priority: 1,
                status: "PRIORITY",
                color: "#8b5cf6",
                rawMax: 70000,
                note: "+12% DefPen [Madness] → besoin de ~48% raw pour atteindre 60% total"
            }
        },

        substatPriority: ['DEF %', 'Def Pen', 'Crit Rate', 'Crit DMG'],

        scaling: {
            def: { grade: "S", description: "+75% DEF max (stacks ×5) + +24% DEF permanent → scaling DEF énorme" },
            critRate: { grade: "B", description: "CR peu prioritaire pour un tank égoïste" },
            critDMG: { grade: "B", description: "CritDMG très secondaire" },
            defPen: { grade: "B", description: "+12% DefPen [Madness] → scaling limité" }
        },
        tips: [
            'Tank purement égoïste - ZERO buff team, tous les buffs sont self-only',
            '+15% DEF stacks ×5 = +75% DEF max → incroyablement tanky à plein stacks',
            '+24% DEF permanent + A2 +8% DEF → mur de DEF',
            '[Madness] +12% DEF et +12% DefPen → mode offensif/défensif',
            'Weapon: Wind DMG 24% self + Basic Skill DMG stacks self → dégâts basiques corrects',
            'Aucune utilité équipe - existe uniquement pour tanker. Goto est meilleur en équipe'
        ],
        recommendedSets: {
            bdg: '4x Guardian + 4x Desire',
            general: '8x Guardian',
            alternative: '4x Guardian + 4x Obsidian'
        },
        benchmarks: {
            casual: { critRate: 40, critDMG: 120, defPen: 30, dps: "1-3B" },
            intermediate: { critRate: 60, critDMG: 145, defPen: 45, dps: "3-8B" },
            advanced: { critRate: 75, critDMG: 170, defPen: 60, dps: "8-15B" },
            whale: { critRate: 80, critDMG: 200, defPen: 70, dps: "15-25B" }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 💧 WATER ELEMENT CHARACTERS (continued)
    // ═══════════════════════════════════════════════════════════════

    // 💧 Alicia - Water Assassin DPS (ATK scaling)
    alicia: {
        id: 'alicia',
        name: "Alicia",
        role: "DPS / Water Assassin",
        element: "Water",
        tier: "A+",

        mainStat: {
            type: 'atk',
            label: 'ATK',
            icon: '⚔️',
            color: '#ef4444',
            benchmarks: {
                casual: 12000,
                intermediate: 16000,
                advanced: 20000,
                whale: 25000
            },
            note: "ATK scaler. +30% DMG dealt (A0), +60% Skill DMG (A1), +16% ATK self, +40% Water DMG self (A4)"
        },

        sweetSpots: {
            critRate: {
                min: 75,
                max: 100,
                ideal: 95,
                priority: 1,
                status: "CAP",
                color: "#22c55e",
                rawMax: 14000,
                note: "Pas de CR self-buff notable → besoin de CR raw élevé, viser cap 100%"
            },
            critDMG: {
                min: 170,
                max: 240,
                ideal: 200,
                priority: 3,
                status: "MODERATE",
                color: "#f59e0b",
                note: "Multiplicateurs empilés (+30% DMG, +60% Skill DMG) → CritDMG amplifié mais secondaire"
            },
            defPen: {
                min: 55,
                max: 85,
                ideal: 75,
                priority: 2,
                status: "HIGH",
                color: "#8b5cf6",
                rawMax: 70000,
                note: "Pas de DefPen self-buff → besoin de raw DefPen élevé pour maximiser les dégâts"
            }
        },

        substatPriority: ['ATK %', 'Def Pen', 'Crit DMG', 'Crit Rate'],

        scaling: {
            atk: { grade: "S", description: "+16% ATK self → ATK scaler solide" },
            critDMG: { grade: "A", description: "Multiplicateurs empilés amplifient le CritDMG" },
            defPen: { grade: "S", description: "DefPen crucial avec les multiplicateurs DMG" },
            critRate: { grade: "A", description: "Pas de CR self-buff → investir en raw" }
        },
        tips: [
            'A0 +30% DMG dealt → multiplicateur global très fort',
            'A1 +60% Skill DMG → booster énorme sur toutes les skills',
            '+16% ATK self → bonus ATK permanent',
            'A4 +40% Water DMG self → très gros boost élémental',
            'Assassin Water solide avec des multiplicateurs empilés',
            'Focus ATK% et DefPen pour maximiser les dégâts avec ses multiplicateurs'
        ],
        recommendedSets: {
            bdg: '4x Armed + 4x Expert',
            general: '8x Chaotic Infamy',
            alternative: '4x Armed + 4x Obsidian'
        },
        benchmarks: {
            casual: { critRate: 50, critDMG: 150, defPen: 40, dps: "5-12B" },
            intermediate: { critRate: 70, critDMG: 185, defPen: 55, dps: "15-30B" },
            advanced: { critRate: 90, critDMG: 215, defPen: 70, dps: "30-55B" },
            whale: { critRate: 95, critDMG: 240, defPen: 80, dps: "55-85B" }
        }
    },
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
