// 🎯 CHARACTER SKILLS - Multiplicateurs de skills et mécaniques
// Ce fichier contient les informations de skills pour le DPS Calculator

// Structure :
// {
//   characterId: {
//     id: 'characterId',
//     name: 'Character Name',
//     element: 'Dark/Fire/Water/Wind/Light',
//     scaleStat: 'ATK/DEF/HP',
//
//     basicAttack: { name, damage: [min, max], element, effects },
//     coreAttack: { name, damage: [min, max], cooldown, element, effects },
//     skills: [
//       { id, name, damage: [min, max], cooldown, mpCost: [min, max], element, effects }
//     ],
//     ultimate: { name, damage: [min, max], cooldown, powerGaugeCost, element, effects }
//   }
// }

export const CHARACTER_SKILLS = {
    // 🗡️ SIAN HALAT - Elemental Stacker Dark
    sian: {
        id: 'sian',
        name: 'Sian Halat',
        element: 'Dark',
        scaleStat: 'ATK',

        // Basic Attack : Royal Swordsmanship (Chain Attack)
        basicAttack: {
            name: 'Royal Swordsmanship',
            type: 'chain',
            stages: [
                {
                    stage: 1,
                    damage: [196, 294],  // % of ATK
                    element: 'Dark',
                    effects: ['weakElementalAccumulation']
                },
                {
                    stage: 2,
                    damage: [214, 321],
                    element: 'Dark',
                    effects: ['weakElementalAccumulation']
                },
                {
                    stage: 3,
                    damage: [177, 265.5],
                    element: 'Dark',
                    effects: ['weakElementalAccumulation']
                }
            ],
            totalDamage: [587, 880.5],  // Somme des 3 stages
            averageDamage: 733.75,      // Moyenne (min+max)/2
            element: 'Dark',
            effects: ['weakElementalAccumulation']
        },

        // Core Attack : Royal Swordsmanship - Judgment
        coreAttack: {
            name: 'Royal Swordsmanship: Judgment',
            damage: [1020, 1530],  // % of ATK
            averageDamage: 1275,
            element: 'Dark',
            effects: [
                'weakElementalAccumulation',
                'knockDown',  // Final hit
                'superArmor'  // During skill
            ],
            description: 'Sian spins to slash enemies, then leaps and slams his broadsword downward'
        },

        // Basic Skills
        skills: [
            {
                id: 'skill1',
                name: 'Black Flash',
                damage: [2290, 3435],  // % of ATK
                averageDamage: 2862.5,
                cooldown: 10,  // seconds
                mpCost: [75, 99],
                element: 'Dark',
                effects: [
                    'mediumElementalAccumulation',
                    'airborne',  // Final hit
                    'superArmor'
                ],
                description: 'Razor-sharp strike of concentrated mana from sword',
                // À A1+ : Devient "Full Moon" si gauge >= 50%
                enhancedVersion: {
                    name: 'Royal Swordsmanship: Full Moon',
                    unlockedAt: 'A1',
                    trigger: 'gauge >= 50%',
                    damageBonus: 100,  // +100% damage
                    gaugeConsumption: 50  // Consomme 50% gauge
                }
            },
            {
                id: 'skill2',
                name: 'Rush',
                damage: [3132, 4698],  // % of ATK
                averageDamage: 3915,
                cooldown: 12,  // seconds
                mpCost: [100, 132],
                element: 'Dark',
                effects: [
                    'mediumElementalAccumulation',
                    'airborne',  // Final hit
                    'superArmor'
                ],
                description: 'Swift slash across wide area with powerful strike',
                // À A1+ : Devient "Bloodstorm" si gauge >= 50%
                enhancedVersion: {
                    name: 'Royal Swordsmanship: Bloodstorm',
                    unlockedAt: 'A1',
                    trigger: 'gauge >= 50%',
                    damageBonus: 100,  // +100% damage
                    gaugeConsumption: 50  // Consomme 50% gauge
                }
            }
        ],

        // Ultimate Skill
        ultimate: {
            name: 'Knight\'s Pride',
            damage: [5190, 7785],  // % of ATK
            averageDamage: 6487.5,
            cooldown: 45,  // seconds
            powerGaugeCost: 100,  // %
            element: 'Dark',
            effects: [
                'heavyElementalAccumulation',
                'airborne'  // Final hit
            ],
            description: 'Channels inner strength into broadsword for powerful strike',
            // À A5 : Déclenche [Zenith Sword] pour la team Dark
            specialEffect: {
                unlockedAt: 'A5',
                name: 'Zenith Sword',
                trigger: 'on hit',
                buff: {
                    target: 'raid-dark',
                    effects: {
                        darkOverloadDamage: 30,
                        defPen: 10,
                        attack: 15
                    },
                    duration: 30
                }
            }
        },

        // Rotation recommandée (optimale DPS)
        recommendedRotation: {
            name: 'Standard Rotation',
            sequence: [
                'Core Attack (Judgment)',
                'Skill 2 (Rush/Bloodstorm)',
                'Skill 1 (Black Flash/Full Moon)',
                'Basic Attack (chain x3)',
                'Ultimate (Knight\'s Pride) when gauge full'
            ],
            notes: [
                'Maintenir gauge à 50%+ pour accéder aux skills enhanced (+100% DMG)',
                'Utiliser Ultimate dès que disponible pour buff Zenith Sword (A5)',
                'Prioriser Full Moon/Bloodstorm quand gauge disponible',
                'Basic Attack pour charger la gauge entre cooldowns'
            ]
        },

        // Calcul DPS théorique (basé sur rotation 60s)
        dpsCalculation: {
            rotationDuration: 60,  // secondes
            expectedSkillUsage: {
                coreAttack: 6,     // ~6 fois en 60s (cooldown interne)
                skill1: 5,         // 60s / 10s CD = 6 (moins 1 pour timing)
                skill2: 4,         // 60s / 12s CD = 5 (moins 1 pour timing)
                ultimate: 1,       // 1-2 fois selon Power Gauge regen
                basicAttack: 15    // Filler entre cooldowns
            }
        }
    },

    // 🐯 BAEK YOONHO (SILVER MANE) - HP Loss Berserker Dark
    silverbaek: {
        id: 'silverbaek',
        name: 'Baek Yoonho (Silver Mane)',
        element: 'Dark',
        scaleStat: 'ATK',
        scaleStatSecondary: 'HP',  // Scale aussi avec HP pour certaines capacités

        // Basic Attack : Magic Beast's Claws (Chain Attack)
        basicAttack: {
            name: 'Magic Beast\\'s Claws',
            type: 'chain',
            stages: [
                {
                    stage: 1,
                    damage: [227, 340.5],  // % of ATK
                    element: 'Dark',
                    effects: ['weakElementalAccumulation']
                },
                {
                    stage: 2,
                    damage: [232, 348],
                    element: 'Dark',
                    effects: ['weakElementalAccumulation']
                },
                {
                    stage: 3,
                    damage: [237, 355.5],
                    element: 'Dark',
                    effects: ['weakElementalAccumulation']
                }
            ],
            totalDamage: [696, 1044],  // Somme des 3 stages
            averageDamage: 870,         // Moyenne (min+max)/2
            element: 'Dark',
            effects: ['weakElementalAccumulation'],
            specialNote: 'A4+: +100% Basic Attack DMG | A0+: +60% DMG vs Bleed/Curse targets'
        },

        // Core Attack : Slaughter
        coreAttack: {
            name: 'Slaughter',
            damage: [793, 1189.5],  // % of ATK
            averageDamage: 991.25,
            element: 'Dark',
            effects: [
                'mediumElementalAccumulation',
                'bleed',  // Inflige Bleed
                'superArmor'
            ],
            description: 'Yoonho tears enemies apart with steel claws, inflicting Bleed',
            specialNote: 'A4+: +100% Core Attack DMG | A0+: +60% DMG vs Bleed/Curse targets'
        },

        // Basic Skills
        skills: [
            {
                id: 'skill1',
                name: 'Violent Approach',
                damage: [1340, 2010],  // % of ATK
                averageDamage: 1675,
                cooldown: 8,  // seconds
                mpCost: [150, 198],
                element: 'Dark',
                effects: [
                    'mediumElementalAccumulation',
                    'bleed',  // Inflige Bleed
                    'superArmor'
                ],
                description: 'Quickly swings steel claws to cut enemies into pieces, inflicting Bleed'
            },
            {
                id: 'skill2',
                name: 'Extreme Attack: Beast Form',
                damage: [254, 381],  // % of ATK (faible damage mais gros buffs)
                averageDamage: 317.5,
                cooldown: 15,  // seconds
                mpCost: [150, 198],
                element: 'Dark',
                effects: [
                    'weakElementalAccumulation',
                    'superArmor'
                ],
                description: 'White Tiger roar that strengthens Yoonho',
                // À A1+ : Déclenche buffs massifs
                enhancedVersion: {
                    unlockedAt: 'A1',
                    trigger: 'on cast',
                    selfDamage: '10% current HP',
                    shield: '20% max HP',
                    buffs: {
                        attack: 30,        // +30% ATK
                        attackSpeed: 30,   // +30% Attack Speed
                        critRate: 36,      // +3% par seconde × 12s = +36% TC
                        critDMG: 36,       // +3% par seconde × 12s = +36% DCC
                        damageTaken: 15    // +15% damage taken (malus)
                    },
                    duration: 12  // 12 secondes
                }
            }
        ],

        // Ultimate Skill
        ultimate: {
            name: 'Divinity',
            damage: [2977, 4465.5],  // % of ATK
            averageDamage: 3721.25,
            cooldown: 45,  // seconds
            powerGaugeCost: 100,  // %
            element: 'Dark',
            effects: [
                'heavyElementalAccumulation',
                'airborne'  // Final hit
            ],
            description: 'Powerful upward slash that tears enemies apart',
            // À A5 : +10% DMG per 10% HP lost
            specialEffect: {
                unlockedAt: 'A5',
                name: 'Divinity - HP Loss Scaling',
                trigger: 'on cast',
                scaling: {
                    type: 'hpLoss',
                    damagePerTenPercent: 10  // +10% DMG per 10% HP lost
                },
                formula: 'Ultimate DMG × (1 + (Lost HP% / 10) × 0.1)',
                note: 'À 90% HP perdu → +90% Ultimate DMG !'
            }
        },

        // Rotation recommandée (optimale DPS)
        recommendedRotation: {
            name: 'Berserker Rotation',
            sequence: [
                'Start battle at 50% HP (A3+)',
                'Core Attack (Slaughter) → Apply Bleed',
                'Skill 2 (Beast Form) → Buff yourself',
                'Skill 1 (Violent Approach) → High damage + Bleed',
                'Basic Attack (chain x3) → Spam with +60% vs Bleed',
                'Ultimate (Divinity) when gauge full → Massive damage with HP loss scaling'
            ],
            notes: [
                'A3+ : Démarre à 50% HP → +50% Skill DMG immédiat (A0-A4) ou +100% (A5) !',
                'Maintenir Bleed sur boss pour +60% Basic/Core Attack DMG',
                'Beast Form : Trade 10% current HP pour +30% ATK/Speed + +36% TC/DCC',
                'Plus tu perds de HP, plus tes skills font mal (Berserker scaling)',
                'A5 : HP loss scaling x2 (200% au lieu de 100%) → 90% HP lost = +180% Skill DMG !'
            ]
        },

        // Calcul DPS théorique (basé sur rotation 60s)
        dpsCalculation: {
            rotationDuration: 60,  // secondes
            expectedSkillUsage: {
                coreAttack: 8,     // Spam core attack (no cooldown shown)
                skill1: 6,         // 60s / 8s CD = 7.5 (arrondi à 6 pour timing)
                skill2: 3,         // 60s / 15s CD = 4 (moins 1 pour timing)
                ultimate: 1,       // 1 fois en 60s
                basicAttack: 20    // Filler entre cooldowns (beaucoup avec A4 +100% DMG)
            },
            averageHPLoss: 70,  // Assume 70% HP perdu en moyenne durant le fight
            dpsModifiers: {
                hpLossScaling: {
                    A0toA4: 70,  // +70% Skill DMG à 70% HP lost
                    A5: 140      // +140% Skill DMG à 70% HP lost
                },
                bleedSynergy: 60,     // +60% Basic/Core Attack vs Bleed targets
                basicCoreBoostA4: 100, // +100% Basic/Core Attack à A4+
                beastFormBuff: 30      // +30% ATK durant Beast Form
            }
        }
    },

    // ⚔️ SUNG ILHWAN - Lethal Dark DPS Assassin
    ilhwan: {
        id: 'ilhwan',
        name: 'Sung Ilhwan',
        element: 'Dark',
        scaleStat: 'ATK',

        // Basic Attack : Sword of Punishment (Chain Attack)
        basicAttack: {
            name: 'Sword of Punishment',
            type: 'chain',
            stages: [
                {
                    stage: 1,
                    damage: [233, 349.5],  // % of ATK
                    element: 'Dark',
                    effects: ['weakElementalAccumulation']
                },
                {
                    stage: 2,
                    damage: [250, 375],
                    element: 'Dark',
                    effects: ['weakElementalAccumulation']
                },
                {
                    stage: 3,
                    damage: [290, 435],
                    element: 'Dark',
                    effects: ['weakElementalAccumulation', 'airborne']  // Final hit airborne
                }
            ],
            totalDamage: [773, 1159.5],  // Somme des 3 stages
            averageDamage: 966.25,       // Moyenne (min+max)/2
            element: 'Dark',
            effects: ['weakElementalAccumulation'],
            description: 'Ilhwan cuts enemies with dual blades in rapid attacks, finishing with extra-powerful strike'
        },

        // Core Attack : Sky Piercer
        coreAttack: {
            name: 'Sky Piercer',
            damage: [1130, 1695],  // % of ATK
            averageDamage: 1412.5,
            element: 'Dark',
            effects: [
                'mediumElementalAccumulation',
                'airborne',  // Hit inflicts airborne
                'superArmor'
            ],
            description: 'Ilhwan rushes forward and strikes upward with his leg',
            specialNote: 'A1+: Reduces Phantom Slash CD by 1s | A3+: Instant attack if enemy within 5m | A5+: Reduces Phantom Slash CD by 1.7s'
        },

        // Basic Skills
        skills: [
            {
                id: 'skill1',
                name: 'Phantom Slash',
                damage: [751, 1126.5, 827, 1240.5, 902, 1353],  // Stage 1, 2, 3 (min/max)
                stages: [
                    { stage: 1, damage: [751, 1126.5] },
                    { stage: 2, damage: [827, 1240.5] },
                    { stage: 3, damage: [902, 1353] }
                ],
                totalDamage: [2480, 3720],  // Somme des 3 stages
                averageDamage: 3100,  // Moyenne
                cooldown: 15,  // seconds
                mpCost: [350, 462],  // 350-462 (A0), 280-369 (mid), 200-264 (maxed)
                element: 'Dark',
                effects: [
                    'mediumElementalAccumulation',
                    'airborne',   // First hit airborne
                    'knockDown',  // Final hit knock down
                    'superArmor'
                ],
                description: 'Ilhwan charges behind target, delivers series of slashes, finishes with powerful strike',
                specialNote: 'A0+: Grants [Ruler\'s Upgrade] stack | Triggers [Ruler\'s Scale] on hits | A3+: Attacks DOUBLED | A1+: CD reduced by 1s per Basic/Core | A5+: CD reduced by 1.7s per Basic/Core'
            },
            {
                id: 'skill2',
                name: 'Wrath of Condemnation',
                damage: [1246, 1869],  // % of ATK
                averageDamage: 1557.5,
                cooldown: 15,  // seconds
                mpCost: [300, 396],
                element: 'Dark',
                effects: [
                    'mediumElementalAccumulation',
                    'knockDown',  // First hit knock down
                    'airborne',   // Final hit airborne
                    'superArmor'
                ],
                description: 'Ilhwan charges (hold button), strikes downward with massive spectral palm, creating shockwave',
                specialNote: 'A0+: Grants [Ruler\'s Upgrade] stack | Damage scales with [Ruler\'s Scale] stacks (+1% per stack, max +160%) | A3+: Attacks DOUBLED | A5+: Triggers [Ruler\'s Protection] (Shield + +12% ATK/TC per stack, max 3)'
            }
        ],

        // Ultimate Skill
        ultimate: {
            name: 'Apocalyptic Might (Dark Finale)',
            damage: [2838, 4257],  // % of ATK
            averageDamage: 3547.5,
            cooldown: 45,  // seconds
            powerGaugeCost: 100,  // %
            element: 'Dark',
            effects: [
                'heavyElementalAccumulation',
                'airborne'  // Final hit
            ],
            description: 'Ilhwan unleashes series of slashes, finishes with brutal finishing strike',
            specialEffect: {
                unlockedAt: 'A0',
                name: 'MP Restore & Ruler\'s Upgrade Consumption',
                trigger: 'on cast',
                effects: {
                    mpRestorePerStack: 14,  // Restores 14% current MP per [Ruler's Upgrade] stack
                    consumeRulersUpgrade: true,  // Removes all [Ruler's Upgrade] stacks
                    damageScaling: {
                        description: 'Damage scales with [Ruler\'s Upgrade] stacks',
                        ultimateSkillDamagePerStack: 25  // +25% Ultimate DMG per stack (max 7 = +175%)
                    }
                },
                note: 'Use at 7 stacks for massive +175% Ultimate DMG burst, then restores MP!'
            },
            advancedEffects: {
                A1: {
                    name: 'Marked/Suppressed Application',
                    effects: {
                        applyMarked: true,      // Applies [Marked] debuff (+35% damage from Ilhwan)
                        refreshSuppressed: true  // Refreshes [Suppressed] duration if already applied
                    }
                },
                A1_buffReset: {
                    name: 'Buff Duration Reset',
                    description: 'Resets duration of active buffs (CD: 30s)',
                    cooldown: 30
                },
                A3: {
                    name: 'Double Hit Ultimate',
                    description: 'Ultimate attacks are DOUBLED',
                    mechanic: 'doubleHit',
                    note: 'Effective damage × 2 = ~7095% ATK at A3+!'
                }
            }
        },

        // Rotation recommandée (optimale DPS)
        recommendedRotation: {
            name: 'Stacking Burst Rotation',
            sequence: [
                'Start: Rely on team Basic Skills for MP recovery',
                'Phantom Slash → Stack [Ruler\'s Upgrade] + build [Ruler\'s Scale]',
                'Basic/Core Attacks → Reduce Phantom Slash CD (A1+: -1s, A5+: -1.7s)',
                'Phantom Slash again → Max [Ruler\'s Scale] stacks (~160)',
                'Wrath of Condemnation → Consume [Ruler\'s Scale], apply [Ruler\'s Protection] (A5)',
                'Repeat Phantom/Wrath → Build to 7 [Ruler\'s Upgrade] stacks',
                'Ultimate (Apocalyptic Might) → Massive burst with +175% Ultimate DMG',
                'Ultimate restores MP (14% × 7 stacks = 98% MP!)',
                'Repeat cycle'
            ],
            notes: [
                'MP Management Critical : Dépend des Basic Skills des alliés (A0-A4: 2% MP/1% gauge, A5: 8% MP/4% gauge)',
                'A0+ : Build [Ruler\'s Upgrade] (max 7 stacks = +35% Basic Skill DMG, +175% Ultimate DMG)',
                'A0+ : Build [Ruler\'s Scale] via Phantom Slash hits (max 160 stacks = +160% Wrath DMG!)',
                'A3+ : All skills hit TWICE → 2x faster stacking, 2x damage output!',
                'A4+ : +10% ATK per Dark ally dans le RAID → Énorme team synergy',
                'A5 : Wrath triggers [Ruler\'s Protection] → Shield + +36% ATK + +36% TC (3 stacks)',
                'A5 : Phantom Slash CD reduction x1.7 → Spam possible avec Basic/Core',
                'Ultimate timing : Cast at 7 [Ruler\'s Upgrade] stacks for max burst, restores MP after',
                'A1+ : [Marked]/[Suppressed] débuffs → +35-50% damage taken from Ilhwan',
                'Arme A5 : +30% DCC supplémentaire'
            ]
        },

        // Calcul DPS théorique (basé sur rotation 60s)
        dpsCalculation: {
            rotationDuration: 60,  // secondes
            expectedSkillUsage: {
                coreAttack: 10,    // Spam pour CD reduction
                skill1: 8,         // Phantom Slash (CD 15s, but reduced by Basic/Core)
                skill2: 6,         // Wrath of Condemnation (CD 15s)
                ultimate: 2,       // 2 fois en 60s (restores MP)
                basicAttack: 15    // Filler entre cooldowns + CD reduction
            },
            averageBuffs: {
                critRateTotal: 36,        // +36% TC (Ruler's Protection 3 stacks à A5)
                critDMGTotal: 30,         // +30% DCC (arme A5)
                darkDamageBoost: 30,      // +30% Dark DMG (A2+)
                basicSkillDamageBoost: 35,   // +35% Basic Skill DMG (7 Ruler's Upgrade stacks)
                ultimateSkillDamageBoost: 175, // +175% Ultimate DMG (7 Ruler's Upgrade stacks)
                wrathDamageBoost: 160,    // +160% Wrath DMG (160 Ruler's Scale stacks)
                attackBoost: 36,          // +36% ATK (Ruler's Protection 3 stacks à A5)
                raidAttackBoost: 60       // +60% ATK (6 Dark allies × 10% à A4+)
            },
            specialMechanics: {
                doubleHit: 'A3+: All skills hit twice (effective 2x damage)',
                mpRecovery: 'Depends on team Basic Skills: A0-A4: 2%/cast, A5: 8%/cast',
                ultimateMPRestore: 'Ultimate restores 14% × stacks current MP (98% at 7 stacks)',
                marked: '+35% damage taken from Ilhwan (A1+)',
                suppressed: '+50% damage taken from Ilhwan + 20% Ultimate DMG from Dark hunters (A1+)'
            }
        }
    },

    // 🛡️ SON KIHOON - Breaker Dark HP Scaler
    son: {
        id: 'son',
        name: 'Son Kihoon',
        element: 'Dark',
        scaleStat: 'HP',  // IMPORTANT : Scale avec HP, pas ATK !

        // Basic Attack : Valiant Sword Strike (Chain Attack)
        basicAttack: {
            name: 'Valiant Sword Strike',
            type: 'chain',
            stages: [
                {
                    stage: 1,
                    damage: [246, 369],  // % of Max HP
                    element: 'Dark',
                    effects: ['weakBreakDamage']
                },
                {
                    stage: 2,
                    damage: [260, 390],
                    element: 'Dark',
                    effects: ['weakBreakDamage']
                },
                {
                    stage: 3,
                    damage: [274, 411],
                    element: 'Dark',
                    effects: ['weakBreakDamage']
                }
            ],
            totalDamage: [780, 1170],  // Somme des 3 stages
            averageDamage: 975,        // Moyenne (min+max)/2
            element: 'Dark',
            effects: ['weakBreakDamage'],
            description: 'Kihoon attacks enemies in front of him using his sword and shield'
        },

        // Core Attack : Drive (devient Fighting Spirit: Drive à A1+)
        coreAttack: {
            name: 'Drive',
            damage: [870, 1305],  // % of Max HP
            averageDamage: 1087.5,
            element: 'Dark',
            effects: [
                'weakBreakDamage',  // A0-A2 : weak Break damage
                'stun'              // Final hit: Stun 3s
            ],
            description: 'Kihoon swings his shield forward to attack enemies',
            specialNote: 'A1+: Transforms to Fighting Spirit: Drive after using Flag of Authority or Fierce Charge | A3+: Deals heavy Break damage',

            // Enhanced version à A1+
            enhancedVersion: {
                unlockedAt: 'A1',
                name: 'Fighting Spirit: Drive',
                trigger: 'after using Flag of Authority or Fierce Charge',
                damage: [870, 1305],  // % of Max HP (même dégâts)
                effects: {
                    powerGaugeRestore: 35,  // Restores 35% Power Gauge
                    breakDamage: 'weak'     // A1-A2: weak, A3+: heavy
                },
                note: 'A3+: Deals heavy [Break] damage instead of weak'
            }
        },

        // Basic Skills
        skills: [
            {
                id: 'skill1',
                name: 'Flag of Authority',
                damage: [2688, 4032],  // % of Max HP
                averageDamage: 3360,
                cooldown: 15,  // seconds
                mpCost: [75, 99],
                element: 'Dark',
                effects: [
                    'mediumBreakDamage',
                    'knockDown',  // Final hit knock down
                    'zone'        // Places [Weakened Fighting Spirit] zone
                ],
                description: 'Kihoon summons a flag in the air and drives it into the ground with great force',
                specialEffect: {
                    unlockedAt: 'A0',
                    name: 'Weakened Fighting Spirit Zone',
                    trigger: 'on cast',
                    effects: {
                        createZone: true,
                        zoneDuration: 30,  // 30 seconds
                        zoneEffects: {
                            darkDamageTaken: {
                                A0toA2: 5,   // +5% Dark damage taken (A0-A2)
                                A3plus: 10   // +10% Dark damage taken (A3+)
                            },
                            attack: {
                                A0toA2: 0,      // No ATK reduction (A0-A2)
                                A3plus: -12.5   // -12.5% ATK (A3+)
                            },
                            unrecoverable: true  // [Unrecoverable] effect
                        }
                    },
                    note: 'Zone enhanced at A3+: adds -12.5% ATK and increases Dark damage taken to +10%'
                },
                advancedEffects: {
                    A1: {
                        name: 'Sturdy Shield Activation',
                        description: 'Grants [Sturdy Shield] (Shield = 30% HP for 30s)',
                        effects: {
                            shield: {
                                type: 'percentHP',
                                value: 30,
                                duration: 30
                            }
                        }
                    },
                    A1_driveTransform: {
                        name: 'Drive Transformation',
                        description: 'Changes Drive to Fighting Spirit: Drive',
                        effect: 'transformCoreAttack'
                    }
                }
            },
            {
                id: 'skill2',
                name: 'Fierce Charge',
                damage: [3730, 5595],  // % of Max HP
                averageDamage: 4662.5,
                cooldown: 15,  // seconds
                mpCost: [100, 132],
                element: 'Dark',
                effects: [
                    'mediumBreakDamage',  // A0-A2: medium Break damage
                    'airborne'            // Final hit airborne
                ],
                description: 'Kihoon scrapes the ground with his sword and performs a powerful upward slash',
                specialNote: 'A0+: +50% DMG in Battle Stance | A3+: Deals almighty [Break] damage',
                advancedEffects: {
                    A0: {
                        name: 'Battle Stance Synergy',
                        description: 'Deals +50% damage when in Battle Stance',
                        damageBonus: 50  // +50% DMG in Battle Stance
                    },
                    A1: {
                        name: 'Sturdy Shield Activation',
                        description: 'Grants [Sturdy Shield] (Shield = 30% HP for 30s)',
                        effects: {
                            shield: {
                                type: 'percentHP',
                                value: 30,
                                duration: 30
                            }
                        }
                    },
                    A1_driveTransform: {
                        name: 'Drive Transformation',
                        description: 'Changes Drive to Fighting Spirit: Drive',
                        effect: 'transformCoreAttack'
                    },
                    A3: {
                        name: 'Almighty Break Damage',
                        description: 'Deals almighty [Break] damage instead of medium',
                        breakLevel: 'almighty'
                    }
                }
            }
        ],

        // Ultimate Skill
        ultimate: {
            name: 'Thrilling Fighting Spirit',
            damage: [5074, 7611],  // % of Max HP
            averageDamage: 6342.5,
            cooldown: 45,  // seconds
            powerGaugeCost: 100,  // %
            element: 'Dark',
            effects: [
                'almightyBreakDamage'  // Almighty Break damage
            ],
            description: 'A powerful fighting spirit will spread to those nearby',
            specialEffect: {
                unlockedAt: 'A5',
                name: 'Broken Spirit & Berserk Strike',
                trigger: 'hits target without [Break] Gauge',
                condition: 'target has no Break Gauge',
                effects: {
                    applyBrokenSpirit: {
                        description: 'Applies [Broken Spirit] debuff to enemy',
                        effects: {
                            attack: -12.5,              // -12.5% ATK
                            critHitChanceReceived: 15   // +15% chance to receive Critical Hit damage
                        },
                        duration: 60
                    },
                    grantBerserkStrike: {
                        description: 'Grants [Berserk Strike] buff to entire team',
                        scope: 'team',
                        effects: {
                            critDMG: 30,    // +30% Crit DMG
                            darkDamage: 15  // +15% Dark DMG
                        },
                        duration: 60
                    }
                },
                note: 'A5 only: When hitting unbreakable targets (e.g., raid bosses without Break Gauge)'
            }
        },

        // Rotation recommandée (optimale Break Control)
        recommendedRotation: {
            name: 'Break Controller Rotation',
            sequence: [
                'Start: Enter stage in Battle Stance (+20% Dark DMG, +50% Fierce Charge DMG)',
                'Flag of Authority → Create [Weakened Fighting Spirit] zone + [Sturdy Shield] (A1+)',
                'Fierce Charge → High damage with Battle Stance bonus + Transform Drive (A1+)',
                'Drive/Fighting Spirit: Drive → Weak/Heavy Break damage + restore 35% Power Gauge (A1+)',
                'Attack on targets with Break Gauge → Switch to Guard Stance (+10% DMG, +10% Break effectiveness)',
                'Continue cycling Flag/Fierce/Drive → Build Power Gauge',
                'When ally or Kihoon triggers [Break] → Restore 100% Core + Power Gauge, switch to Battle Stance',
                'Ultimate (Thrilling Fighting Spirit) → Massive almighty Break damage',
                'If target has no Break Gauge (A5) → Apply [Broken Spirit] + grant [Berserk Strike] to team',
                'Repeat cycle'
            ],
            notes: [
                'HP Scaling : Tous les dégâts scale avec Max HP, pas ATK !',
                'Stance Management : Battle Stance (offensive) vs Guard Stance (Break-focused)',
                'A0+ : Battle Stance (+20% Dark DMG, +50% Fierce Charge DMG) OR Guard Stance (+10% DMG, +10% Break effectiveness)',
                'A1+ : Flag/Fierce → Grant [Sturdy Shield] (30% HP shield) + Transform Drive to Fighting Spirit: Drive',
                'A1+ : Fighting Spirit: Drive → Restore 35% Power Gauge',
                'A2+ : +10% Break effectiveness (permanent)',
                'A3+ : Fighting Spirit: Drive → Heavy Break damage, Fierce Charge → Almighty Break damage',
                'A3+ : [Weakened Fighting Spirit] zone enhanced → -12.5% ATK + 10% Dark damage taken',
                'A4+ : Team buffs → +10% ATK + 10% HP (permanent)',
                'A5 : [Strike Squad Leader] → RAID-wide +10% ATK + 10% HP + 10% DMG dealt (permanent)',
                'A5 : Ultimate on unbreakable target → [Broken Spirit] debuff + [Berserk Strike] team buff (+30% Crit DMG + 15% Dark DMG for 60s)',
                'Break Success : Kihoon or ally triggers Break → +3s Break duration, restore 100% Core + Power Gauge, activate Battle Stance'
            ]
        },

        // Calcul DPS théorique (basé sur rotation 60s)
        dpsCalculation: {
            rotationDuration: 60,  // secondes
            expectedSkillUsage: {
                coreAttack: 8,         // Fighting Spirit: Drive (A1+)
                skill1: 4,             // Flag of Authority (60s / 15s CD = 4)
                skill2: 4,             // Fierce Charge (60s / 15s CD = 4)
                ultimate: 1,           // 1-2 fois selon Break triggers
                basicAttack: 12        // Filler entre cooldowns
            },
            averageBuffs: {
                battleStanceDarkDMG: 20,      // +20% Dark DMG (Battle Stance)
                battleStanceFierceBonus: 50,  // +50% Fierce Charge DMG (Battle Stance)
                guardStanceDMG: 10,           // +10% DMG dealt (Guard Stance)
                guardStanceBreak: 10,         // +10% Break effectiveness (Guard Stance)
                breakEffectivenessA2: 10,     // +10% Break effectiveness (A2+ permanent)
                teamATK_A4: 10,               // +10% ATK (A4+ team buff)
                teamHP_A4: 10,                // +10% HP (A4+ team buff)
                strikeSquadLeaderATK_A5: 10,  // +10% ATK (A5 RAID buff)
                strikeSquadLeaderHP_A5: 10,   // +10% HP (A5 RAID buff)
                strikeSquadLeaderDMG_A5: 10,  // +10% DMG dealt (A5 RAID buff)
                berserkStrikeCritDMG_A5: 30,  // +30% Crit DMG (A5 conditional team buff)
                berserkStrikeDarkDMG_A5: 15   // +15% Dark DMG (A5 conditional team buff)
            },
            specialMechanics: {
                hpScaling: 'All damage scales with Max HP (not ATK)',
                stanceSystem: 'Battle Stance (offensive) vs Guard Stance (Break-focused)',
                breakSuccess: 'Break triggered → +3s duration, 100% Core + Power Gauge restore, Battle Stance',
                weakenedFightingSpirit: 'Zone debuff: A0-A2: +5% Dark dmg taken | A3+: -12.5% ATK + 10% Dark dmg taken',
                sturdyShield: 'A1+: Flag/Fierce grant 30% HP shield for 30s',
                fightingSpiritDrive: 'A1+: Enhanced Core Attack, restores 35% Power Gauge',
                brokenSpirit: 'A5: Ultimate on unbreakable → -12.5% ATK + 15% crit chance taken debuff',
                berserkStrike: 'A5: Ultimate on unbreakable → +30% Crit DMG + 15% Dark DMG team buff (60s)'
            }
        }
    },

    // 🏹 LIM TAE-GYU - Breaker Dark ATK Scaler (Magic Boost Specialist)
    lim: {
        id: 'lim',
        name: 'Lim Tae-Gyu',
        element: 'Dark',
        scaleStat: 'ATK',

        // Basic Attack : Dark Shot (Chain Attack)
        basicAttack: {
            name: 'Dark Shot',
            type: 'chain',
            stages: [
                {
                    stage: 1,
                    damage: [194, 291],  // % of ATK
                    element: 'Dark',
                    effects: ['weakBreakDamage']
                },
                {
                    stage: 2,
                    damage: [202, 303],
                    element: 'Dark',
                    effects: ['weakBreakDamage']
                },
                {
                    stage: 3,
                    damage: [214, 321],
                    element: 'Dark',
                    effects: ['weakBreakDamage']
                }
            ],
            totalDamage: [610, 915],  // Somme des 3 stages
            averageDamage: 762.5,     // Moyenne (min+max)/2
            element: 'Dark',
            effects: ['weakBreakDamage'],
            description: 'Tae-Gyu fires an arrow imbued with the power of darkness',
            specialNote: 'When [Magic Boost] active → Fires 2 Magic Arrows (1050% ATK each = 2100% ATK bonus!)'
        },

        // Core Attack : Volley Fire
        coreAttack: {
            name: 'Volley Fire',
            damage: [663, 994.5],  // % of ATK
            averageDamage: 828.75,
            element: 'Dark',
            effects: ['weakBreakDamage'],
            description: 'Tae-Gyu fires multiple arrows simultaneously',
            specialNote: 'A0+: When [Magic Boost] active → +30% DMG (A3+: +110% total!) | A1+: Triggers team TC/DCC buff | A5+: Each hit → +4% ATK stack (max 30 stacks = +120% ATK)'
        },

        // Basic Skills
        skills: [
            {
                id: 'skill1',
                name: 'Shoot and Maneuver',
                damage: [503, 984],  // % of ATK (varies by upgrade level)
                averageDamage: 743.5,
                cooldown: 8,  // seconds
                mpCost: [150, 198],
                element: 'Dark',
                effects: [
                    'weakBreakDamage',
                    'activatesCoreAttack'  // Activates Core Attack
                ],
                description: 'Tae-Gyu slides to the side and fires',
                specialNote: 'A0: Can use 2 times | A1+: +25% speed and damage, can use 3 times | A3+: Grants [Magic Boost] (CD: 15s)',
                enhancedVersion: {
                    unlockedAt: 'A1',
                    speedIncrease: 25,     // +25% speed
                    damageIncrease: 25,    // +25% damage
                    maxUses: 3             // 3 uses (up from 2)
                },
                magicBoostTrigger: {
                    unlockedAt: 'A3',
                    description: 'Grants [Magic Boost] effect',
                    cooldown: 15  // 15s cooldown
                }
            },
            {
                id: 'skill2',
                name: 'Typhoon Fire',
                damage: [1920, 2880],  // % of ATK
                averageDamage: 2400,
                cooldown: 12,  // seconds
                mpCost: [200, 264],
                element: 'Dark',
                effects: [
                    'heavyBreakDamage'
                ],
                description: 'Tae-Gyu gathers powerful energy into an arrow and strikes',
                specialNote: 'A0+: When [Magic Boost] active → +30% DMG (A3+: +110% total!) | A1+: Triggers team TC/DCC buff | A3+: Applies +7% Crit DMG received debuff (12s)'
            }
        ],

        // Ultimate Skill
        ultimate: {
            name: 'Quick Attack: Typhoon Fire (Sniper Mode)',
            damage: [1368, 2052],  // % of ATK per projectile
            averageDamage: 1710,   // Per projectile
            totalDamage: [10944, 16416],  // Total damage (8 projectiles)
            totalAverageDamage: 13680,    // Total average
            cooldown: 45,  // seconds
            powerGaugeCost: 100,  // %
            element: 'Dark',
            effects: [],
            description: 'Tae-Gyu spins once, adjusts his stance, and gets into [Sniper Mode]',
            specialEffect: {
                unlockedAt: 'A0',
                name: 'Sniper Mode',
                trigger: 'on cast',
                effects: {
                    transformBasicAttack: true,  // Basic Attack becomes Quick Fire: Typhoon Fire
                    projectiles: 8,              // Can fire 8 projectiles
                    damagePerProjectile: [1368, 2052],  // Same as listed above
                    duration: 10  // 10 seconds
                },
                note: 'Basic Attack changes to Quick Fire: Typhoon Fire (Ultimate-level damage) for 10s, up to 8 shots!'
            },
            advancedEffects: {
                A0: {
                    name: 'Magic Boost Synergy',
                    description: 'When [Magic Boost] active → +30% Quick Fire DMG (A3+: +110% total!)',
                    damageBonus: {
                        A0toA2: 30,   // +30% DMG (A0-A2)
                        A3plus: 110   // +110% DMG (A3+: 30% base + 80% A3 bonus)
                    }
                },
                A1: {
                    name: 'Team TC/DCC Buff Trigger',
                    description: 'Each Quick Fire: Typhoon Fire cast triggers team TC/DCC buff',
                    effects: {
                        critRatePerStack: 0.7,
                        critDMGPerStack: 1,
                        maxStacks: 8,
                        duration: 10
                    },
                    note: 'Can stack up to 8 times during Sniper Mode!'
                },
                A5: {
                    name: 'Power Gauge on Entry',
                    description: 'Start with 100% Power Gauge → Instant Ultimate available!',
                    powerGaugeStart: 100
                },
                weaponSynergy: {
                    name: 'Weapon ATK Stacking',
                    description: 'Basic Attacks within 10s after Ultimate → +8% ATK per stack (max 2 stacks = +16% ATK, 30s)',
                    attackPerStack: 8,
                    maxStacks: 2,
                    duration: 30,
                    windowDuration: 10
                }
            }
        },

        // Rotation recommandée (optimale DPS)
        recommendedRotation: {
            name: 'Magic Boost Loop Rotation',
            sequence: [
                'A5: Start with 100% Power Gauge → Instant Ultimate',
                'Ultimate (Sniper Mode) → Fire 8 Quick Fire: Typhoon Fire shots (10s)',
                'During Sniper Mode: Stack team TC/DCC buffs (A1+) + weapon ATK stacks',
                'After Sniper Mode: Use Basic Attacks to maintain weapon ATK stacks',
                'Shoot and Maneuver → Activates Core Attack + grants [Magic Boost] (A3+)',
                'Spam Volley Fire (Core Attack) → +4% ATK per hit (A5), triggers team buffs (A1+)',
                'Typhoon Fire → High damage + debuff enemy (A3+)',
                'Repeat Shoot and Maneuver + Volley Fire loop → Maintain [Magic Boost]',
                'Ultimate when gauge full → Restart cycle'
            ],
            notes: [
                'Magic Boost Management : Trigger via Airborne Burst or Shoot and Maneuver (A3+, CD: 15s)',
                'A0+ : [Magic Boost] → Fire Magic Arrows (1050% ATK each!) + +30% Core/Typhoon/Quick Fire DMG',
                'A1+ : Volley Fire/Quick Fire cast → Team +0.7% TC + 1% DCC per stack (max 8 = +5.6% TC + 8% DCC)',
                'A1+ : Shoot and Maneuver → +25% speed/damage, can use 3 times',
                'A2+ : +20% Break effectiveness (permanent)',
                'A3+ : [Magic Boost] active → +110% Volley Fire/Typhoon Fire/Quick Fire DMG (30% base + 80% A3)',
                'A3+ : Typhoon Fire → +7% Crit DMG received debuff on enemy (12s)',
                'A4+ : +12% ATK (permanent)',
                'A5 : Volley Fire hits → +4% ATK stack (max 30 stacks = +120% ATK, infinite duration!)',
                'A5 : Start with 100% Power Gauge → Instant Ultimate available!',
                'A5 : Max ATK stacking = +12% (A4) + 120% (A5 Volley stacks) + 16% (weapon) = +148% ATK!',
                'Weapon A5 : +12% Dark DMG + 16% ATK (2 stacks during Sniper Mode)',
                'Core Attack Spam : Shoot and Maneuver activates Core Attack → Very rapid Volley Fire loop!'
            ]
        },

        // Calcul DPS théorique (basé sur rotation 60s)
        dpsCalculation: {
            rotationDuration: 60,  // secondes
            expectedSkillUsage: {
                coreAttack: 20,    // Volley Fire spam (activated by Shoot and Maneuver)
                skill1: 12,        // Shoot and Maneuver (60s / 8s CD × 3 uses = ~12 total activations)
                skill2: 5,         // Typhoon Fire (60s / 12s CD = 5)
                ultimate: 1,       // Quick Fire: Typhoon Fire (8 shots in Sniper Mode)
                basicAttack: 15    // Filler + during Sniper Mode
            },
            averageBuffs: {
                critRateTotal: 5.6,        // +5.6% TC (team buff 8 stacks à A1+)
                critDMGTotal: 8,           // +8% DCC (team buff 8 stacks à A1+)
                darkDamageBoost: 12,       // +12% Dark DMG (weapon A5)
                attackBoostA4: 12,         // +12% ATK (A4 permanent)
                attackBoostA5: 120,        // +120% ATK (A5 Volley stacks, 30 stacks)
                attackBoostWeapon: 16,     // +16% ATK (weapon 2 stacks)
                totalAttackBoost: 148,     // +148% ATK total!
                magicBoostCoreBonus: 110,  // +110% Core/Typhoon/Quick Fire DMG (A3+ with Magic Boost)
                breakEffectiveness: 20     // +20% Break effectiveness (A2+)
            },
            specialMechanics: {
                magicArrows: 'Magic Boost active → Fire 2-3 Magic Arrows (1050% ATK each) on hits',
                magicBoostUptime: 'High uptime via Airborne Burst + Shoot and Maneuver (A3+, CD: 15s)',
                coreAttackLoop: 'Shoot and Maneuver activates Core Attack → Rapid Volley Fire spam',
                sniperMode: 'Ultimate → 8 Quick Fire shots (1368-2052% each) in 10s',
                teamBuffing: 'A1+: Constant TC/DCC buffing for team via Volley Fire/Quick Fire spam',
                critDebuff: 'A3+: Typhoon Fire applies +7% Crit DMG received debuff',
                powerGaugeStart: 'A5: Start with 100% Power Gauge → Instant Ultimate',
                volleyFireStacking: 'A5: Each Volley Fire hit → +4% ATK (max 30 stacks = +120% ATK)'
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔥 FERN - DPS Mage Fire (Frieren collab)
    // ═══════════════════════════════════════════════════════════════
    fern: {
        id: 'fern',
        name: 'Fern',
        element: 'Fire',
        scaleStat: 'ATK',

        // Basic Attack: Zoltraak blasts (3 stages)
        basicAttack: {
            name: 'Zoltraak - Basic',
            stages: [
                { stage: 1, damage: [150, 225], description: 'Zoltraak blast Stage 1' },
                { stage: 2, damage: [160, 240], description: 'Zoltraak blast Stage 2' },
                { stage: 3, damage: [164, 246], description: 'Zoltraak blast Stage 3 → active Core Attack' }
            ],
            element: 'Fire',
            effects: ['Stage 3 → Core Attack auto']
        },

        // Core Attack: Zoltraak piercing
        coreAttack: {
            name: 'Zoltraak - Piercing Blast',
            damage: [1060, 1590],
            element: 'Fire',
            effects: ['Pierce enemies ahead']
        },

        // Skills
        skills: [
            {
                id: 'skill1',
                name: 'Demon-killing Magic (Zoltraak) - Barrage',
                damage: [1866, 2799],
                cooldown: 20,
                mpCost: [300, 396],
                element: 'Fire',
                effects: ['Knock Down on hit']
            },
            {
                id: 'skill2',
                name: 'Demon-killing Magic (Zoltraak) - Rapid Fire',
                damage: [1962, 2943],
                cooldown: 20,
                mpCost: [300, 396],
                element: 'Fire',
                effects: [
                    'Airborne on final hit',
                    'A2+: Each hit applies Fire Damage Taken Increase (0.3% per stack, 60 stacks max)',
                    'A4+: Fire Damage Taken Increase enhanced to 0.5% per stack'
                ]
            }
        ],

        // Ultimate
        ultimate: {
            name: 'Zoltraak - Devastating Blast',
            damage: [3566, 5349],
            cooldown: 45,
            powerGaugeCost: 100,
            element: 'Fire',
            effects: [
                'Knock Down on hit',
                'A5: Fire weakness hit regardless of target element'
            ]
        },

        // Weapon buffs
        weapon: {
            name: 'Fern Weapon',
            effects: [
                '+5-12% ATK',
                'Zoltraak Barrage & Rapid Fire: +5-10% Crit Rate, +10-20% Crit DMG',
                'Zoltraak Balanced → Restore 10-100% MP (CD: 30s)'
            ]
        },

        // Special Mechanics summary
        specialMechanics: {
            magicalProdigy: 'A0: +10% ATK (+20% A1). MP ≥ 50% → double. -5% (-10% A1) Mana Cost.',
            manaPowerTracking: 'A0: +30% Boss DMG (+60% A1). +5% (+10% A1) Precision.',
            basicQuickShot: 'A1: Attack Speed up. Skill 1/2 → Core Attack. Core/Skill → -25% CD.',
            basicFocus: 'A1: Skill 1/2 → +25% Basic Skill DMG (20s, 4 stacks max).',
            fireDmgBoost: 'A2: +20% Fire DMG permanent.',
            fireVulnDebuff: 'A2: Skill 2 hits → +0.3% Fire DMG received (0.5% A4+, 60 stacks = 18-30%).',
            trueSight: 'A3: +5%TC +10%DCC (A5: +10%TC +20%DCC).',
            dispelDefenseMagic: 'A3: Tag-in → Debuff cleanse + Shield (20% ATK) + -20% DMG taken (20s).',
            a4CritBoost: 'A4: +10% TC, +20% DCC.',
            seekersGaze: 'A5: Seismic Alert ×6 → +60% Fire DMG +10% Def Pen (20s burst).',
            fireWeaknessOverride: 'A5: Ultimate hits Fire weakness regardless of target element.'
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔥 GINA - Support Fire (ATK scaling)
    // ═══════════════════════════════════════════════════════════════
    gina: {
        id: 'gina',
        name: 'Gina',
        element: 'Fire',
        scaleStat: 'ATK',

        // Basic Attack: Mana discs + spikes (3 stages)
        basicAttack: {
            name: 'Mana Discs',
            stages: [
                { stage: 1, damage: [180, 270], description: 'Mana discs Stage 1' },
                { stage: 2, damage: [190, 285], description: 'Mana discs Stage 2' },
                { stage: 3, damage: [200, 300], description: 'Mana spikes Stage 3 → Airborne' }
            ],
            element: 'Fire',
            effects: ['Final hit → Airborne']
        },

        // Core Attack: Gravity manipulation
        coreAttack: {
            name: 'Gravitational Crush',
            damage: [818, 1227],
            element: 'Fire',
            effects: ['Knock Down on final hit']
        },

        // Skills
        skills: [
            {
                id: 'skill1',
                name: 'Forced Descent (Gravitational Mass)',
                damage: [1415, 2122.5],
                cooldown: 15,
                mpCost: [300, 396],
                element: 'Fire',
                effects: [
                    'Airborne on hit',
                    'Stacks Countercurrent',
                    'A3+: Creates Gravitational Field (20% DMG) + Gravity Boost debuff (+10% Fire DMG taken, 20s)'
                ]
            },
            {
                id: 'skill2',
                name: 'Path of Extinction',
                damage: [2251, 3376.5],
                cooldown: 15,
                mpCost: [300, 396],
                element: 'Fire',
                effects: [
                    'Hold button → continuous beam',
                    'Concurrent effect stacks (up to 4) while using',
                    'Stacks Countercurrent',
                    'A5: +60% DMG with Space-Time Gap (+60% vs Gravity Boost = +120% total)'
                ]
            }
        ],

        // Ultimate
        ultimate: {
            name: 'Liberation (Mana Blast)',
            damage: [3190, 4785],
            cooldown: 45,
            powerGaugeCost: 100,
            element: 'Fire',
            effects: [
                'Airborne on hit',
                'Creates Gravitational Field (20% DMG)',
                'Halt effect on enemies in field (CD: 20s, 3s duration)'
            ]
        },

        // Weapon buffs
        weapon: {
            name: 'Gina Weapon',
            effects: [
                '+2-12% ATK',
                'Mana Circulation → team recovers 50 mana',
                'Mana Circulation → +1% all attack & Fire DMG (4 stacks, infinite)'
            ]
        },

        // Special Mechanics summary
        specialMechanics: {
            countercurrent: 'Skills stack Countercurrent (5 max) → Mana Circulation: +15% ATK +15% Fire DMG team (15s)',
            bodyRetrograde: 'Gravitational Field → team heal 2% ATK/3s + Power Gauge 2%/3s (15s)',
            manaTransformation: 'A1: Mana Circulation → Shield 12% ATK + 12% DMG dealt + -12% DMG taken (20s)',
            shieldEnhancement: 'A2: +20% Shield value + Shield active → +10% DMG dealt',
            gravityBoost: 'A3: Gravitational Mass → +10% Fire DMG taken debuff on enemy (20s)',
            defPenAura: 'A4: +4% Def Pen ALL team + +4% Def Pen Fire members',
            spaceTimeGap: 'A5: Gravitational Field → +60% Path of Extinction DMG (+60% vs Gravity Boost = +120%)',
            weaponManaCirculation: 'Weapon: Mana Circulation → team 50 mana + +1% ATK & Fire DMG (4 stacks)'
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔥 SONG CHIYUL - DPS Mage Fire (SR, ATK scaling)
    // ═══════════════════════════════════════════════════════════════
    song: {
        id: 'song',
        name: 'Song Chiyul',
        element: 'Fire',
        scaleStat: 'ATK',

        // Basic Attack: Flame release (3 stages)
        basicAttack: {
            name: 'Flame Release',
            stages: [
                { stage: 1, damage: [210, 315], description: 'Flame Stage 1' },
                { stage: 2, damage: [220, 330], description: 'Flame Stage 2' },
                { stage: 3, damage: [236, 354], description: 'Flame Stage 3' }
            ],
            element: 'Fire',
            effects: ['Deals weak Break damage']
        },

        // Core Attack: Flame outpour
        coreAttack: {
            name: 'Incinerate',
            damage: [566, 849],
            element: 'Fire',
            effects: ['Synergizes with Iaido Red Lotus stacks (+60% DMG max)']
        },

        // Skills
        skills: [
            {
                id: 'skill1',
                name: 'Hellfire (Flame Whirlwind)',
                damage: [550, 825],
                cooldown: 8,
                mpCost: [70, 92],
                element: 'Fire',
                effects: [
                    'Pulls enemies in',
                    'A3: Range and duration +50%'
                ]
            },
            {
                id: 'skill2',
                name: 'Iaido Type 4: Red Lotus Flower',
                stages: [
                    { stage: 1, damage: [321, 481.5] },
                    { stage: 2, damage: [357, 535.5] },
                    { stage: 3, damage: [393, 589.5] }
                ],
                cooldown: 12,
                mpCost: [80, 105],
                mpPerStage: true,
                element: 'Fire',
                effects: [
                    'Final hit → Airborne',
                    'Burns target (50% ATK DMG/3s, 30s)',
                    'Hit → +20% Incinerate DMG (10s, 3 stacks) + Core Gauge 100%'
                ]
            }
        ],

        // Ultimate
        ultimate: {
            name: 'Scorching Heat Strike',
            damage: [2130, 3195],
            cooldown: 45,
            powerGaugeCost: 100,
            element: 'Fire',
            effects: [
                '+30% DMG vs Burned targets'
            ]
        },

        // Weapon
        weapon: {
            name: 'Song Chiyul Weapon',
            effects: [
                '+2-8% Fire DMG',
                'Basic Skill/Core Attack → +2-8% DMG vs Normal Monster (10s, 5 stacks)'
            ]
        },

        // Special Mechanics summary
        specialMechanics: {
            iaido: 'Passive: Iaido Type 4 hit → +20% Incinerate DMG (10s, 3 stacks = +60%) + Core Gauge 100%',
            normalMonster: 'A1: +50% DMG vs Normal monsters (but +50% MP consumption)',
            mpPool: 'A2: +20% MP (compense le coût A1)',
            hellfire: 'A3: Hellfire whirlwind range/duration +50%',
            incinerateMastery: 'A4: +20% Incinerate DMG permanent',
            burnExecutioner: 'A5: +50% Incinerate DMG on Burned targets',
            burnFromSkill2: 'Skill 2: Burns target (50% ATK/3s, 30s) → synergy with Ultimate (+30%) and A5 (+50%)'
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔥 STARK - Breaker / Sub-DPS Tank Fire (HP scaling, Frieren collab)
    // ═══════════════════════════════════════════════════════════════
    stark: {
        id: 'stark',
        name: 'Stark',
        element: 'Fire',
        scaleStat: 'HP',

        // Basic Attack: Axe swings (3 stages, scales on Max HP)
        basicAttack: {
            name: 'Axe Swing',
            stages: [
                { stage: 1, damage: [184, 276], description: 'Axe swing Stage 1 (% Max HP)' },
                { stage: 2, damage: [205, 307.5], description: 'Axe swing Stage 2 (% Max HP)' },
                { stage: 3, damage: [253, 379.5], description: 'Axe swing Stage 3 (% Max HP)' }
            ],
            element: 'Fire',
            scaleStat: 'HP',
            effects: ['Deals weak Break damage']
        },

        // Core Attack: Whirling Strike
        coreAttack: {
            name: 'Whirling Strike',
            damage: [555, 832.5],
            element: 'Fire',
            scaleStat: 'HP',
            effects: [
                'Deals weak Break damage',
                'Airborne on hit',
                'Triggers Determination (+15% Skill DMG +15% CR, 10s at A1+)',
                'A1+: Applies Warrior\'s Aura debuff on enemy'
            ]
        },

        // Skills
        skills: [
            {
                id: 'skill1',
                name: 'Spiral Strike',
                damage: [850, 1275],
                cooldown: 16,
                mpCost: [150, 198],
                element: 'Fire',
                scaleStat: 'HP',
                effects: [
                    'Medium Break damage',
                    'Airborne on final hit',
                    'Activates Confidence stack',
                    'A5: Also triggers Determination'
                ]
            },
            {
                id: 'skill2',
                name: 'Lightning Strike',
                damage: [786, 1179],
                cooldown: 16,
                mpCost: [150, 198],
                element: 'Fire',
                scaleStat: 'HP',
                effects: [
                    'Medium Break damage',
                    'Knock Down on hit',
                    'Grants Shield',
                    'Activates Confidence stack',
                    'A5: vs Warrior\'s Aura target → Warrior\'s Talent (1000% Max HP DMG)'
                ]
            }
        ],

        // Ultimate
        ultimate: {
            name: 'Lightning Strike: Annihilation',
            damage: [2226, 3339],
            cooldown: 45,
            powerGaugeCost: 100,
            element: 'Fire',
            scaleStat: 'HP',
            effects: [
                'Almighty Break damage',
                'Knock Down on hit',
                'Only usable during Courage (+100% Power Gauge)',
                'A5: +50% DMG during Courage window'
            ]
        },

        // Weapon
        weapon: {
            name: 'Stark Weapon',
            effects: ['+5% HP']
        },

        // Special Mechanics summary
        specialMechanics: {
            confidence: 'Skills → +3% Fire DMG +3% Def Pen (4 stacks = +12%). A5: +5%/stack (= +20%).',
            courage: 'Confidence ×4 → +20% Fire DMG +20% Def Pen (5s). A5: +30%/+30% +50% Annihilation.',
            determination: 'Whirling Strike → +10% Skill DMG +10% CR (3s). A1: +15%/+15% (10s). A5: Spiral Strike too.',
            fightingSpirit: 'A1: -20% DMG taken. HP ≤ 10% → +40% Max HP recovery (CD 60s).',
            warriorsAura: 'A1: Whirling Strike → enemy takes +15% from Stark (15s). A3: +30%.',
            teamDefPen: 'A3: Team gets 20% of Stark\'s raw Def Pen as Def Pen buff.',
            breakMastery: 'A4: +36% Break effectiveness.',
            warriorsTalent: 'A5: Lightning Strike vs Warrior\'s Aura → 1000% Max HP bonus DMG.',
            powerGauge: 'Cannot charge Power Gauge normally. Only charges during Courage window.'
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔥 KANAE - DPS Assassin Fire (ATK scaling)
    // ═══════════════════════════════════════════════════════════════
    kanae: {
        id: 'kanae',
        name: 'Tawata Kanae',
        element: 'Fire',
        scaleStat: 'ATK',

        // Basic Attack: Fox-like slashes (3 stages)
        basicAttack: {
            name: 'Fox Blade',
            stages: [
                { stage: 1, damage: [186, 279], description: 'Fox slash Stage 1' },
                { stage: 2, damage: [193, 289.5], description: 'Fox slash Stage 2' },
                { stage: 3, damage: [203, 304.5], description: 'Fox slash Stage 3' }
            ],
            element: 'Fire',
            effects: []
        },

        // Core Attack: Wire swords throw
        coreAttack: {
            name: 'Wire Reel',
            damage: [1142, 1713],
            element: 'Fire',
            effects: [
                'Knock Down on hit',
                'Enhanced Core → grants [Scarlet] effect'
            ]
        },

        // Skills
        skills: [
            {
                id: 'skill1',
                name: 'Munechika',
                damage: [1921, 2881.5],
                cooldown: 15,
                mpCost: [300, 396],
                element: 'Fire',
                effects: [
                    'Airborne on final hit',
                    'Auto Extreme Evasion if hit midair',
                    'Grants [Crimson] effect',
                    'A3: Super Armor 5s'
                ]
            },
            {
                id: 'skill2',
                name: 'Kamaitachi (Tsuchigumo)',
                damage: [1618, 2427],
                cooldown: 10,
                mpCost: [200, 264],
                element: 'Fire',
                effects: [
                    'Knock Down on hit',
                    'Counts as Ultimate Skill when Crimson/Scarlet/Fire active',
                    '[Fire] active → +70% Tsuchigumo DMG',
                    'MP Consumption decreases over time',
                    'Removes Crimson/Scarlet/Fire on use',
                    'A3: -5s Munechika CD on Fire:Kamaitachi use'
                ]
            }
        ],

        // Ultimate
        ultimate: {
            name: 'Wire Execution',
            damage: [3335, 5002.5],
            cooldown: 45,
            powerGaugeCost: 100,
            element: 'Fire',
            effects: ['Knock Down on final hit']
        },

        // Weapon
        weapon: {
            name: 'Kanae Weapon',
            effects: [
                '+2-12% ATK',
                '+10-20% Crit Rate'
            ]
        },

        // Special Mechanics summary
        specialMechanics: {
            crimsonScarletFire: 'Munechika→[Crimson], Enhanced Core→[Scarlet], any buff→Kamaitachi=Ultimate. [Fire]→+70% Tsuchigumo.',
            breakBonus: '+24% DMG vs Break targets.',
            instinct: 'A1: Enemy death +1, Break +5 Instinct stacks. 10 stacks → Sixth Sense (+20% CR).',
            critDMGBoost: 'A2: +16% Crit DMG permanent.',
            superArmor: 'A3: Munechika → Super Armor 5s. Fire:Kamaitachi → -5s Munechika CD.',
            fireSynergy: 'A4: +12% Fire DMG per Fire member (max 3 = +36%).',
            sixthSenseA5: 'A5: Sixth Sense → +77% ATK +20% CR +20% DCC. Instinct stacks also give +5% ATK +1.5% CR/DCC each.'
        }
    },

    // 🔥 Yoo Soohyun - Fire Striker ATK - Def Pen Specialist + Magic Reaction Debuffer
    yoo: {
        id: 'yoo',
        name: 'Yoo Soohyun',
        element: 'Fire',
        scaleStat: 'ATK',

        basicAttack: {
            name: 'Magic Firearm',
            stages: [
                { stage: 1, damage: [148, 222], description: 'Tir magique Stage 1' },
                { stage: 2, damage: [180, 270], description: 'Tir magique Stage 2' },
                { stage: 3, damage: [172, 258], description: 'Tir magique Stage 3' }
            ],
            element: 'Fire',
            effects: [
                'Applique [Magic Reaction] debuff par hit',
                '+1% Fire DMG taken par stack (max 20 = +20%)'
            ]
        },

        coreAttack: {
            name: 'Core Shot',
            damage: [800, 1200],
            element: 'Fire',
            effects: [
                'Burst shot moyen range',
                'Weapon A5: Enhanced Core Shot DMG'
            ]
        },

        skills: [
            {
                id: 'skill1',
                name: 'Trick Shot',
                damage: [800, 1200],
                cooldown: 10,
                mpCost: [200, 264],
                element: 'Fire',
                effects: [
                    'Tir repositionnement rapide',
                    'A3: +24% ATK au lancement',
                    'CD court → spam pour maintenir ATK buff'
                ]
            },
            {
                id: 'skill2',
                name: 'Kill Shot',
                damage: [1450, 2175],
                cooldown: 15,
                mpCost: [300, 396],
                element: 'Fire',
                effects: [
                    'Tir haute puissance single target',
                    'A1: Amélioré en Hell Fire Kill Shot (+40% DMG) si Magic Reaction ≥10',
                    'A5: +6% DMG par stack Magic Reaction (max 20 = +120%)'
                ]
            }
        ],

        ultimate: {
            name: 'Final Shot',
            damage: [2750, 4125],
            cooldown: 45,
            powerGaugeCost: 100,
            element: 'Fire',
            effects: [
                'Tir dévastateur burst massif',
                'Knock Down on hit'
            ]
        },

        weapon: {
            name: 'Soohyun Weapon',
            effects: [
                '+4-12% Def Pen (Personal)',
                'Enhanced Core Shot DMG at higher advancement'
            ]
        },

        specialMechanics: {
            spotlight: 'Permanent +24% Def Pen + Damage Increase = 24% of Def Pen stat (24s, renouvelable).',
            magicReaction: 'Basic Attack applique Magic Reaction: +1% Fire DMG taken par stack, max 20 = +20% Fire DMG pour toute la team.',
            hellFire: 'A1: Magic Reaction ≥10 stacks → Madness se transforme en Hell Fire (+40% DMG skills améliorés).',
            defPenStacking: 'A2: +12% Def Pen permanent → Total perso: 36% char + 12% arme = 48% Def Pen.',
            trickShotBuff: 'A3: Trick Shot → +24% ATK buff temporaire (CD10 → uptime élevé).',
            atkEnhancement: 'A4: +12% ATK permanent.',
            magicReactionScaling: 'A5: +6% Kill Shot/Hell Fire DMG par stack Magic Reaction (max 20 = +120% → burst INSANE).'
        }
    },

    // 🔥 Christopher Reed - Fire Infusion DEF - Elemental Stacker / Fire Overload
    reed: {
        id: 'reed',
        name: 'Christopher Reed',
        element: 'Fire',
        scaleStat: 'DEF',

        basicAttack: {
            name: 'Reed Combo',
            stages: [
                { stage: 1, damage: [187, 280.5], description: 'Punch combo Stage 1' },
                { stage: 2, damage: [240, 360], description: 'Punch combo Stage 2' },
                { stage: 3, damage: [300, 450], description: 'Kick finisher Stage 3' }
            ],
            element: 'Fire',
            effects: [
                'Deals Weak Elemental Accumulation damage',
                'Airborne on hit',
                'Spiritual Body: Enhanced + CD reset + +150% DMG'
            ]
        },

        coreAttack: {
            name: 'Magic Bullet',
            damage: [1047, 1570.5],
            element: 'Fire',
            effects: [
                'Deals Weak Elemental Accumulation damage',
                'Super Armor during use',
                'Spiritual Body: Enhanced + +150% DMG'
            ]
        },

        skills: [
            {
                id: 'skill1',
                name: 'Rising Star / Offensive Pass',
                damage: [2720, 4080],
                cooldown: 15,
                mpCost: [75, 99],
                element: 'Fire',
                effects: [
                    'Knee kick → aerial spin → slam kick',
                    'Medium Elemental Accumulation',
                    'Airborne + Knock Down',
                    'Super Armor during use',
                    'Charges Spiritual Body Gauge',
                    'Spiritual Body: Enhanced + +150% DMG'
                ]
            },
            {
                id: 'skill2',
                name: 'Nitro Kick / Foul Play',
                damage: [3364, 5046],
                cooldown: 18,
                mpCost: [100, 132],
                element: 'Fire',
                effects: [
                    'Mana sphere attack',
                    'Medium Elemental Accumulation',
                    'Airborne on final hit',
                    'Super Armor during use',
                    'Charges Spiritual Body Gauge',
                    'Team Fight mode → active Touchdown (+15% Fire OL DMG, stack ×3)',
                    'Spiritual Body: Enhanced + +150% DMG'
                ]
            }
        ],

        ultimate: {
            name: 'Zero to a Hundred',
            damage: [4610, 6915],
            cooldown: 45,
            powerGaugeCost: 100,
            element: 'Fire',
            effects: [
                'Meteor-like magic ball',
                'Heavy Elemental Accumulation',
                'Airborne + Knock Down',
                'Inflige Burn (200% DEF / 3s, 30s)',
                'Retire Spiritual Body Manifestation',
                'A5: Victor\'s Spirit → +250% DMG'
            ]
        },

        weapon: {
            name: 'Christopher Weapon',
            effects: [
                '+5-50% DEF',
                '-5-20% Dash Cooldown',
                'Zero to a Hundred → +2-15% Def Pen (20s)'
            ]
        },

        extraSkills: [
            {
                id: 'finishingCatch',
                name: 'Finishing Catch',
                damage: [1500, 1500],
                cooldown: 15,
                element: 'Fire',
                effects: [
                    'Disponible après Extreme Evasion',
                    'Compte comme Basic Skill',
                    'Active Touchdown',
                    'A1: +25% DMG vs Burn targets',
                    'A3: +15% DMG via Competitive Spirit'
                ]
            }
        ],

        specialMechanics: {
            spiritualBody: 'Gauge 100% → Special Core → Spiritual Body: Enhanced skills + CD reset + +25% Fire Elem Acc + +150% DMG. 30s.',
            touchdown: 'Nitro Kick/Foul Play en Team Fight → Touchdown: +15% Fire Overload DMG + +5% Fire Elem Acc per stack (max 3 = +45% OL + 15% Acc). 60s.',
            burn: 'Rising Performance/Rapid Kick/Zero to a Hundred infligent Burn: 200% DEF / 3s pendant 30s.',
            finishingCatch: 'Après Extreme Evasion → Finishing Catch: 1500% DEF, compte Basic Skill, active Touchdown.',
            competitiveSpirit: 'A3: Hit Burn target → +165% Fire DMG + +15% Finishing Catch DMG. 15s, CD2.',
            fireSynergy: 'A4: +5% Fire DMG par Fire ally (max 3 = +15%) pour Fire team.',
            blazingShock: 'A5: Hit Fire Overloaded → Blazing Shock: +20% Fire Overload DMG Taken + Unrecoverable. 30s.',
            victorSpirit: 'A5: Spiritual Body → Victor\'s Spirit: +250% Zero to a Hundred DMG. 60s.'
        }
    },

    // 🔥 YUQI - Fire Breaker/Sub-DPS Tank HP - Break Specialist
    yuqi: {
        id: 'yuqi',
        name: 'YUQI',
        element: 'Fire',
        scaleStat: 'HP',

        basicAttack: {
            name: 'YUQI Combo',
            stages: [
                { stage: 1, damage: [217, 325.5], description: 'Fist strike Stage 1' },
                { stage: 2, damage: [234, 351], description: 'Kick combo Stage 2' },
                { stage: 3, damage: [270, 405], description: 'Heavy strike Stage 3' }
            ],
            element: 'Fire',
            effects: [
                'Deals weak Break damage',
                'Fast multi-hit → Tempo stacks + Full Burst gauge charge'
            ]
        },

        coreAttack: {
            name: 'Knee Strike',
            damage: [980, 1470],
            element: 'Fire',
            effects: [
                'Jump forward + knee strike',
                'Airborne on hit',
                'Deals weak Break damage'
            ]
        },

        skills: [
            {
                id: 'skill1',
                name: 'Amp Crash / Crescendo Scream',
                damage: [1228, 1842],
                cooldown: 20,
                mpCost: [100, 132],
                element: 'Fire',
                effects: [
                    'Dodge-weave → fist strike',
                    'Deals heavy Break damage',
                    'Airborne + Knock Down on final hit',
                    'Extreme Evasion si touché pendant weave',
                    'Full Burst → Crescendo Scream (amélioré, CD reset)',
                    'A1: Applique Distortion debuff'
                ]
            },
            {
                id: 'skill2',
                name: 'Rising Spin Kick / Unlimited Shout',
                damage: [2306, 3459],
                cooldown: 20,
                mpCost: [120, 158],
                element: 'Fire',
                effects: [
                    'Dodge-weave → roundhouse kick',
                    'Deals medium Break damage',
                    'Airborne on hit',
                    'Extreme Evasion si touché pendant weave',
                    'Full Burst → Unlimited Shout (amélioré, CD reset)',
                    'A1: Applique Distortion debuff'
                ]
            }
        ],

        ultimate: {
            name: 'Kill the Stage',
            damage: [4648, 6972],
            cooldown: 45,
            powerGaugeCost: 100,
            element: 'Fire',
            effects: [
                'Uppercut dévastateur',
                'Deals almighty Break damage',
                'Airborne on hit',
                'A1: Applique Breakdown debuff directement',
                'A3: Active Afterglow sur toute la team'
            ]
        },

        weapon: {
            name: 'YUQI Weapon',
            effects: [
                '+5-12% HP',
                '+5-30% Fire DMG on Full Burst activation (15s)'
            ]
        },

        specialMechanics: {
            forever: 'FOREVER: +5% DMG dealt, infini, stack ×3 = +15% DMG dealt pour toute la team.',
            breakExtension: 'Break duration +3s quand YUQI ou ally applique Break.',
            tempo: 'Tempo: +0.5% Max HP + 0.5% SK DMG par stack (max 15 = +7.5% HP + 7.5% SK DMG). Chargé par skill hits.',
            fullBurst: 'Full Burst: Skills améliorés, +25% Break SK (A3: +50%), +10% SK DMG (A3: +40%), +10% HP (A3: +25%), Super Armor. 10s.',
            distortion: 'A1: Distortion debuff → +3% DMG taken ×3 (A5: +6% ×3) → triggers Breakdown.',
            breakdown: 'A1: Breakdown → +15% DMG taken + 20% Fire DMG taken (A5: +20% DMG + 25% Fire, 30s).',
            afterglow: 'A3: Afterglow team → +12% vs Break + +15% Basic/Ult DMG + +15% DCC (A5: +30% + +20% DCC, 30s).',
            fireSynergy: 'A4: +5% Fire DMG par Fire ally (max 3 = +15%).'
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 💧 FRIEREN - Support / Sub-DPS Water (DEF scaling, Frieren collab)
    // ═══════════════════════════════════════════════════════════════
    frieren: {
        id: 'frieren',
        name: 'Frieren',
        element: 'Water',
        scaleStat: 'DEF',

        basicAttack: {
            name: 'Basic Attack',
            type: 'chain',
            stages: [
                { name: 'Stage 1', damage: [257, 405] },
                { name: 'Stage 2', damage: [257, 405] },
                { name: 'Stage 3', damage: [257, 405] }
            ],
            damage: [257, 405],
            averageDamage: 331,
            element: 'Water',
            effects: ['waterDamage'],
            description: 'Combo de 3 stages. Scale sur DEF.'
        },

        coreAttack: {
            name: 'Core Attack',
            damage: [1515, 2272.5],
            averageDamage: 1893.75,
            element: 'Water',
            effects: ['waterDamage'],
            description: 'Core Attack DEF scaling. Dégâts massifs.'
        },

        skills: [
            {
                id: 'skill1',
                name: 'Judradjim',
                damage: [3020, 4530],
                averageDamage: 3775,
                cooldown: 16,
                element: 'Water',
                effects: ['waterDamage'],
                description: 'Attaque magique puissante. A5: Remplit 80% de la Power Gauge.',
                enhancedVersion: {
                    name: 'Judradjim (A5)',
                    bonus: '80% Power Gauge fill',
                    note: 'À A5 Judradjim remplit 80% de la Power Gauge → Ult spam'
                }
            },
            {
                id: 'skill2',
                name: 'Vollzanbel',
                damage: [3542, 5313],
                averageDamage: 4427.5,
                cooldown: 16,
                element: 'Water',
                effects: ['waterDamage', 'debuff'],
                description: 'Attaque + débuff ennemi. A1: -5% DEF, +5% crit received, +5% Crit DMG taken, +35% DMG from Frieren (20s). A5: Enhanced → -10% DEF, +15% crit, +15% Crit DMG, +70% DMG from Frieren (30s).',
                enhancedVersion: {
                    name: 'Enhanced Vollzanbel (A5)',
                    bonus: '-10% DEF, +15% crit received, +15% Crit DMG taken, +70% DMG from Frieren',
                    duration: 30,
                    note: 'Debuff massif à A5 → énorme contribution team'
                }
            }
        ],

        ultimate: {
            name: 'Ultimate',
            damage: [4366, 6549],
            averageDamage: 5457.5,
            cooldown: 45,
            powerGaugeCost: 100,
            element: 'Water',
            effects: ['waterDamage'],
            description: 'Ultimate DEF scaling. Pendant l\'Ult → +100% Crit Rate (Mana Power Liberation).',
            specialEffect: {
                name: 'Mana Power Liberation',
                description: '+100% Crit Rate pendant l\'Ult → garantit les crits'
            }
        },

        weapon: {
            name: 'Frieren Weapon',
            effects: {
                defense: { min: 5, max: 50 },
                teamBasicUltSkillDmg: { min: 5, max: 30 }
            },
            description: '+5-50% DEF perso. Team Basic/Ult Skill DMG +5-30%.'
        },

        specialMechanics: {
            manaPowerControl: {
                name: 'Mana Power Control',
                description: '+25% DEF permanent. +25% DEF supplémentaire si MP ≥ 50%. A3: Doublé → +50%/+50% (total +100% DEF si MP ≥ 50%)',
                scaling: 'DEF'
            },
            defenseMagic: {
                name: 'Defense Magic',
                description: 'Shield 20% DEF, -5% DMG taken (30s). A3: Shield 30% DEF, -10% DMG taken (60s)',
                scaling: 'DEF'
            },
            vollzanbel: {
                name: 'Vollzanbel Debuff',
                description: 'A1: -5% DEF, +5% crit, +5% Crit DMG taken, +35% personal DMG (20s). A5: -10% DEF, +15% crit, +15% Crit DMG, +70% personal DMG (30s)',
                trigger: 'Vollzanbel hit'
            }
        },

        recommendedRotation: {
            name: 'Support Burst Rotation',
            sequence: [
                'Vollzanbel → Apply debuff (-DEF, +crit received, +Crit DMG taken)',
                'Judradjim → Damage + Power Gauge fill (A5: 80%)',
                'Basic/Core Attacks → Build MP for Mana Power Control bonus',
                'Ultimate → +100% Crit Rate burst (Mana Power Liberation)',
                'Defense Magic → Shield + DMG reduction for survival',
                'Repeat: Vollzanbel (maintain debuff uptime) → Judradjim → Ult'
            ],
            notes: [
                'Maintenir Vollzanbel debuff en permanence → +15% crit + +15% Crit DMG taken pour la team (A5)',
                'A5 Judradjim → 80% Power Gauge → spam Ult régulier',
                'A3: +100% DEF si MP ≥ 50% → garder le MP haut pour le bonus',
                'Shield A3: 30% DEF shield + -10% DMG taken (60s) → très tanky',
                'A2: +9% ATK/DEF/HP toute la team → buff permanent',
                'A4: +20% Crit DMG toute la team → DCC buff majeur',
                'Arme: Team Basic/Ult Skill DMG +30% (A5) → énorme pour les DPS',
                'Mana Power Liberation: +100% TC pendant l\'Ult → ignorer le cap TC pour le burst'
            ]
        },

        dpsCalculation: {
            rotationDuration: 60,
            expectedSkillUsage: {
                coreAttack: 8,
                skill1: 3,       // Judradjim CD 16s
                skill2: 3,       // Vollzanbel CD 16s
                ultimate: 2,     // 2 Ults (A5 Judradjim fills 80% gauge)
                basicAttack: 12
            }
        }
    },

    // 💧 Meri Laine - Water Infusion HP - Water Overload Specialist
    meri: {
        id: 'meri',
        name: 'Meri Laine',
        element: 'Water',
        scaleStat: 'HP',

        basicAttack: {
            name: 'Meri Combo',
            stages: [
                { stage: 1, damage: [180, 270], description: 'Water strike Stage 1' },
                { stage: 2, damage: [230, 345], description: 'Water strike Stage 2' },
                { stage: 3, damage: [290, 435], description: 'Water finisher Stage 3' }
            ],
            element: 'Water',
            effects: [
                'Deals Weak Elemental Accumulation damage',
                'Water Infusion enhanced attacks'
            ]
        },

        coreAttack: {
            name: 'Tidal Surge',
            damage: [1000, 1500],
            element: 'Water',
            effects: [
                'Deals Weak Elemental Accumulation damage',
                'Super Armor during use'
            ]
        },

        skills: [
            {
                id: 'skill1',
                name: 'Aqua Burst',
                damage: [2500, 3750],
                cooldown: 15,
                mpCost: [75, 99],
                element: 'Water',
                effects: [
                    'Water AoE burst',
                    'Deals Water Elemental Accumulation damage'
                ]
            },
            {
                id: 'skill2',
                name: 'Hydro Cannon',
                damage: [2400, 3600],
                cooldown: 16,
                mpCost: [80, 105],
                element: 'Water',
                effects: [
                    'Concentrated water beam',
                    'Deals Water Elemental Accumulation damage'
                ]
            }
        ],

        ultimate: {
            name: 'Deluge',
            damage: [6500, 9750],
            cooldown: 0,
            mpCost: 0,
            element: 'Water',
            effects: [
                'Massive Water AoE',
                'Water Overload enabler'
            ],
            gaugeRequired: 100
        },

        dpsCalculation: {
            rotationDuration: 60,
            expectedSkillUsage: {
                coreAttack: 8,
                skill1: 3,
                skill2: 3,
                ultimate: 2,
                basicAttack: 12
            }
        }
    },
};

// Helper function pour obtenir les skills d'un personnage
export const getCharacterSkills = (characterId) => {
    return CHARACTER_SKILLS[characterId] || null;
};

// Helper pour calculer le total damage potentiel d'un personnage
export const calculateTotalDamagePotential = (characterId, attackValue, rotationDuration = 60) => {
    const skills = CHARACTER_SKILLS[characterId];
    if (!skills) return null;

    const usage = skills.dpsCalculation?.expectedSkillUsage || {};

    const totalDamage = {
        basicAttack: (skills.basicAttack.averageDamage || 0) * (usage.basicAttack || 0),
        coreAttack: (skills.coreAttack.averageDamage || 0) * (usage.coreAttack || 0),
        skill1: (skills.skills[0]?.averageDamage || 0) * (usage.skill1 || 0),
        skill2: (skills.skills[1]?.averageDamage || 0) * (usage.skill2 || 0),
        ultimate: (skills.ultimate.averageDamage || 0) * (usage.ultimate || 0)
    };

    const totalPercentage = Object.values(totalDamage).reduce((sum, val) => sum + val, 0);
    const totalRealDamage = (totalPercentage / 100) * attackValue;

    return {
        character: skills.name,
        rotationDuration,
        attackValue,
        damageBySkill: totalDamage,
        totalDamagePercentage: totalPercentage,
        totalRealDamage: totalRealDamage,
        dps: totalRealDamage / rotationDuration
    };
};

// Helper pour obtenir le skill avec le meilleur DPS
export const getBestDPSSkill = (characterId) => {
    const skills = CHARACTER_SKILLS[characterId];
    if (!skills) return null;

    const skillsArray = [
        { name: 'Core Attack', dps: skills.coreAttack.averageDamage / (skills.coreAttack.cooldown || 1) },
        ...skills.skills.map(skill => ({
            name: skill.name,
            dps: skill.averageDamage / (skill.cooldown || 1)
        }))
    ];

    return skillsArray.reduce((best, current) =>
        current.dps > best.dps ? current : best
    );
};
