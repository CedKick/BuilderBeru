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

    // 🔥 Autres personnages à ajouter ici par la suite
    // etc.
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
