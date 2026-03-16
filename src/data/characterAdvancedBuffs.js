// 🔥 CHARACTER ADVANCED BUFFS - Mécaniques complexes de buffs/debuffs
// Ce fichier gère les mécaniques avancées qui ne rentrent pas dans characterBuffs.js
// (Elemental Accumulation, Dark Damage, ATK%, Overload, stacking buffs, debuffs, etc.)

// Structure :
// {
//   characterId: {
//     id: 'characterId',
//     name: 'Character Name',
//     class: 'Class Name',
//     element: 'Dark/Fire/Water/Wind/Light',
//
//     advancements: {
//       A0: { passives: [], selfBuffs: [], teamBuffs: [], raidBuffs: [], debuffs: [] },
//       A1: { ... },
//       ...
//       A5: { ... }
//     }
//   }
// }

export const CHARACTER_ADVANCED_BUFFS = {

    // ═══════════════════════════════════════════════════════════════
    // 🌑 LEE BORA - Support Dark (ATK scaling)
    // Charm debuff +15% DMG taken. A2: +2% DCC per Dark ally (RAID entier).
    // A2: Strengthening Charm +10% ATK Dark team. A3: -30% DMG taken Dark team.
    // Note: Personal +6% TC/DCC et DCC per Dark ally gérés via characterBuffs.js
    // ═══════════════════════════════════════════════════════════════
    lee: {
        id: 'lee',
        name: 'Lee Bora',
        class: 'Mage / Support',
        element: 'Dark',
        scaleStat: 'ATK',
        primaryRole: 'Support',
        secondaryRole: 'Sub-DPS',
        tags: ['ATK Scaler', 'Team Buffer', 'Debuffer', 'Charm', 'Dark Crit Buffer', 'Phantom Foxes'],

        advancements: {
            // A0 - Charm Effect: +15% DMG taken on enemy (15s)
            A0: {
                passives: [
                    {
                        name: 'Charm Effect',
                        description: 'Core Attack ou Tempest applique [Charm] → target damage taken +15%. 15s.',
                        mechanic: 'debuff',
                        duration: 15
                    }
                ],
                selfBuffs: [],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Charm Effect',
                        effects: { damageTaken: 15 },
                        duration: 15,
                        trigger: 'Core Attack / Tempest hit',
                        note: '+15% DMG taken sur l\'ennemi → buff DPS pour TOUT le RAID'
                    }
                ]
            },

            // A1 - Enhanced Phantom Foxes (3 foxes, +80% dmg each)
            A1: {
                passives: [
                    { name: 'Charm Effect', mechanic: 'debuff', duration: 15 },
                    {
                        name: 'Enhanced Phantom Foxes (A1)',
                        description: '3 foxes invoquées (au lieu de 1). +80% damage par fox.',
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Charm Effect',
                        effects: { damageTaken: 15 },
                        duration: 15,
                        trigger: 'Core Attack / Tempest hit'
                    }
                ]
            },

            // A2 - +6% TC/DCC perso (géré characterBuffs.js) + +2% DCC per Dark ally RAID (géré characterBuffs.js)
            // + Strengthening Charm: +5% ATK + 5% HP Dark team (2 stacks = +10% ATK)
            A2: {
                passives: [
                    { name: 'Charm Effect', mechanic: 'debuff', duration: 15 },
                    { name: 'Enhanced Phantom Foxes (A1)', mechanic: 'permanent' },
                    {
                        name: 'Personal Stats Boost (A2)',
                        description: '+6% TC + 6% DCC personnel (géré via characterBuffs.js).',
                        mechanic: 'permanent'
                    },
                    {
                        name: 'Dark DCC Scaling (A2)',
                        description: '+2% DCC par Dark ally pour tout le RAID (géré via characterBuffs.js).',
                        mechanic: 'conditional'
                    },
                    {
                        name: 'Strengthening Charm Buff (A2)',
                        description: 'Strengthening Charm → +5% ATK + 5% HP Dark team members (2 stacks, 10s).',
                        mechanic: 'on_skill'
                    }
                ],
                selfBuffs: [],
                teamBuffs: [
                    {
                        name: 'Strengthening Charm (A2)',
                        effects: { attack: 10 },
                        duration: 10,
                        elementRestriction: 'Dark',
                        note: '+5% ATK × 2 stacks = +10% ATK pour Dark team members (10s)'
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Charm Effect',
                        effects: { damageTaken: 15 },
                        duration: 15,
                        trigger: 'Core Attack / Tempest hit'
                    }
                ]
            },

            // A3 - Enhanced Strengthening Charm (2 uses, +40% range/dmg) + Dark team -30% DMG taken
            A3: {
                passives: [
                    { name: 'Charm Effect', mechanic: 'debuff', duration: 15 },
                    { name: 'Enhanced Phantom Foxes (A1)', mechanic: 'permanent' },
                    { name: 'Personal Stats Boost (A2)', mechanic: 'permanent' },
                    { name: 'Dark DCC Scaling (A2)', mechanic: 'conditional' },
                    {
                        name: 'Enhanced Strengthening Charm (A3)',
                        description: '2 uses. Range/damage +40%. Dark team members DMG taken -30%.',
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [],
                teamBuffs: [
                    {
                        name: 'Strengthening Charm (A2+)',
                        effects: { attack: 10 },
                        duration: 10,
                        elementRestriction: 'Dark',
                        note: '+5% ATK × 2 stacks = +10% ATK pour Dark team members (10s). A3: +40% range/dmg.'
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Charm Effect',
                        effects: { damageTaken: 15 },
                        duration: 15,
                        trigger: 'Core Attack / Tempest hit'
                    }
                ]
            },

            // A4 - Dark Charm: Meg CD -25% + Immortal in Enhancement Circle
            A4: {
                passives: [
                    { name: 'Charm Effect', mechanic: 'debuff', duration: 15 },
                    { name: 'Enhanced Phantom Foxes (A1)', mechanic: 'permanent' },
                    { name: 'Personal Stats Boost (A2)', mechanic: 'permanent' },
                    { name: 'Dark DCC Scaling (A2)', mechanic: 'conditional' },
                    { name: 'Enhanced Strengthening Charm (A3)', mechanic: 'permanent' },
                    {
                        name: 'Dark Charm Meg CD Reduction (A4)',
                        description: 'CD de Dark Charm: Meg réduit de 25%.',
                        mechanic: 'permanent'
                    },
                    {
                        name: 'Immortal (A4)',
                        description: 'Si HP ≤ 1 dans Enhancement Circle → Immortal 2s → regain 50% ATK en HP. 1 fois par combat.',
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [],
                teamBuffs: [
                    {
                        name: 'Strengthening Charm (A2+)',
                        effects: { attack: 10 },
                        duration: 10,
                        elementRestriction: 'Dark',
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Charm Effect',
                        effects: { damageTaken: 15 },
                        duration: 15,
                        trigger: 'Core Attack / Tempest hit'
                    }
                ]
            },

            // A5 - Small Megs +75% basic damage
            A5: {
                passives: [
                    { name: 'Charm Effect', mechanic: 'debuff', duration: 15 },
                    { name: 'Enhanced Phantom Foxes (A1)', mechanic: 'permanent' },
                    { name: 'Personal Stats Boost (A2)', mechanic: 'permanent' },
                    { name: 'Dark DCC Scaling (A2)', mechanic: 'conditional' },
                    { name: 'Enhanced Strengthening Charm (A3)', mechanic: 'permanent' },
                    { name: 'Dark Charm Meg CD Reduction (A4)', mechanic: 'permanent' },
                    { name: 'Immortal (A4)', mechanic: 'conditional' },
                    {
                        name: 'Meg Damage Boost (A5)',
                        description: 'Small Megs de Dark Charm: Meg → +75% basic damage.',
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [],
                teamBuffs: [
                    {
                        name: 'Strengthening Charm (A2+)',
                        effects: { attack: 10 },
                        duration: 10,
                        elementRestriction: 'Dark',
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Charm Effect',
                        effects: { damageTaken: 15 },
                        duration: 15,
                        trigger: 'Core Attack / Tempest hit'
                    }
                ]
            }
        }
    },

    // 🗡️ SIAN HALAT - Elemental Stacker Dark
    sian: {
        id: 'sian',
        name: 'Sian Halat',
        class: 'Elemental Stacker',
        element: 'Dark',
        scaleStat: 'ATK',
        primaryRole: 'DPS',
        secondaryRole: 'Debuffer',
        tags: ['Team Buffer', 'Def Pen Stacker', 'Overload Synergy'],

        // =================================================================
        // ADVANCEMENT 0 (A0) - BASE PASSIVE
        // =================================================================
        advancements: {
            A0: {
                // Passives permanents
                passives: [
                    {
                        name: 'Flawless Swordsmanship Gauge',
                        description: 'Skills charge la gauge. À 50%+ → Active [Crimson Sword Dance]',
                        mechanic: 'gauge',
                        threshold: 50  // % de gauge pour activer Crimson Sword Dance
                    }
                ],

                // Buffs personnels (self)
                selfBuffs: [
                    {
                        name: 'Crimson Sword Dance',
                        trigger: 'gauge >= 50%',
                        effects: {
                            darkElementalAccumulation: 10,  // +10%
                            darkDamage: 5,                  // +5%
                            attack: 5                       // +5%
                        },
                        duration: 15,  // secondes
                        stackable: false
                    },
                    {
                        name: 'Crimson Fury',
                        trigger: 'skills hit',
                        effects: {
                            healInstant: { type: 'percentATK', value: 5 },  // Heal 5% ATK
                            hpRecoveryRate: 5  // +5%
                        },
                        duration: 5,  // secondes
                        stackable: false
                    }
                ],

                // Pas de buffs team/raid à A0
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            },

            // =================================================================
            // ADVANCEMENT 1 (A1) - ENHANCED SKILLS + DEBUFFS
            // =================================================================
            A1: {
                passives: [
                    {
                        name: 'Flawless Swordsmanship Gauge',
                        description: 'Skills charge la gauge. À 50%+ → Active [Crimson Sword Dance]',
                        mechanic: 'gauge',
                        threshold: 50
                    },
                    {
                        name: 'Skill Transformation',
                        description: 'À 50%+ gauge : Black Flash/Rush → Full Moon/Bloodstorm (+100% DMG, consume 50% gauge)',
                        mechanic: 'skillTransform',
                        damageBonus: 100  // +100% damage
                    },
                    {
                        name: 'Immortality Trigger',
                        description: 'À 1 HP : Devient Immortel 2s, puis heal 50% ATK (once per battle)',
                        mechanic: 'immortality',
                        trigger: 'hp <= 1',
                        duration: 2,
                        healAfter: { type: 'percentATK', value: 50 },
                        usesPerBattle: 1
                    }
                ],

                selfBuffs: [
                    {
                        name: 'Crimson Sword Dance',
                        trigger: 'gauge >= 50%',
                        effects: {
                            darkElementalAccumulation: 10,
                            darkDamage: 5,
                            attack: 5
                        },
                        duration: 15,
                        stackable: false
                    },
                    {
                        name: 'Undying Fury',  // UPGRADE de Crimson Fury
                        trigger: 'skills hit',
                        effects: {
                            healInstant: { type: 'percentATK', value: 10 },  // +5% → 10%
                            hpRecoveryRate: 10  // +5% → 10%
                        },
                        duration: 5,
                        stackable: false
                    }
                ],

                teamBuffs: [],
                raidBuffs: [],

                // DEBUFFS sur ennemis
                debuffs: [
                    {
                        name: 'Scarlet Domination',
                        trigger: 'skills hit enemy',
                        target: 'enemy',
                        effects: {
                            darkDamageTaken: 5,          // +5% Dark Damage Taken
                            darkOverloadDamageTaken: 5   // +5% Dark Overload Damage Taken
                        },
                        duration: 10,  // secondes
                        maxStacks: 2
                    }
                ]
            },

            // =================================================================
            // ADVANCEMENT 2 (A2) - TEAM BUFF PERMANENT
            // =================================================================
            A2: {
                passives: [
                    {
                        name: 'Flawless Swordsmanship Gauge',
                        description: 'Skills charge la gauge',
                        mechanic: 'gauge',
                        threshold: 50
                    },
                    {
                        name: 'Skill Transformation',
                        mechanic: 'skillTransform',
                        damageBonus: 100
                    },
                    {
                        name: 'Immortality Trigger',
                        mechanic: 'immortality',
                        trigger: 'hp <= 1',
                        duration: 2,
                        healAfter: { type: 'percentATK', value: 50 },
                        usesPerBattle: 1
                    }
                ],

                selfBuffs: [
                    {
                        name: 'Crimson Sword Dance',
                        trigger: 'gauge >= 50%',
                        effects: {
                            darkElementalAccumulation: 10,
                            darkDamage: 5,
                            attack: 5
                        },
                        duration: 15,
                        stackable: false
                    },
                    {
                        name: 'Undying Fury',
                        trigger: 'skills hit',
                        effects: {
                            healInstant: { type: 'percentATK', value: 10 },
                            hpRecoveryRate: 10
                        },
                        duration: 5,
                        stackable: false
                    },
                    {
                        name: 'Enhanced Dark Accumulation',
                        trigger: 'passive',
                        effects: {
                            darkElementalAccumulation: 20  // +20%
                        },
                        duration: 'permanent',
                        stackable: false
                    }
                ],

                // NOUVEAU : Buff TEAM permanent
                teamBuffs: [
                    {
                        name: 'Oath of Victory',
                        trigger: 'stage start (permanent)',
                        scope: 'team',  // 3 hunters de la team
                        effects: {
                            damageVsDarkOverloaded: 20  // +20% damage vs Dark Overloaded targets
                        },
                        duration: 'infinite',
                        stackable: false
                    }
                ],

                raidBuffs: [],

                debuffs: [
                    {
                        name: 'Scarlet Domination',
                        trigger: 'skills hit enemy',
                        target: 'enemy',
                        effects: {
                            darkDamageTaken: 5,
                            darkOverloadDamageTaken: 5
                        },
                        duration: 10,
                        maxStacks: 2
                    }
                ]
            },

            // =================================================================
            // ADVANCEMENT 3 (A3) - ENHANCED BUFFS + STACKING
            // =================================================================
            A3: {
                passives: [
                    {
                        name: 'Flawless Swordsmanship Gauge',
                        mechanic: 'gauge',
                        threshold: 50
                    },
                    {
                        name: 'Skill Transformation',
                        mechanic: 'skillTransform',
                        damageBonus: 100
                    },
                    {
                        name: 'Immortality Trigger',
                        mechanic: 'immortality',
                        trigger: 'hp <= 1',
                        duration: 2,
                        healAfter: { type: 'percentATK', value: 50 },
                        usesPerBattle: 1
                    }
                ],

                selfBuffs: [
                    {
                        name: 'Crimson Sword Dance',  // ENHANCED
                        trigger: 'gauge >= 50%',
                        effects: {
                            darkElementalAccumulation: 20,  // 10% → 20%
                            darkDamage: 10,                 // 5% → 10%
                            attack: 10                      // 5% → 10%
                        },
                        duration: 30,  // 15s → 30s
                        stackable: false
                    },
                    {
                        name: 'Guardian\'s Resolve',  // NOUVEAU : Stacking infini
                        trigger: 'skills hit',
                        effects: {
                            darkElementalAccumulation: 1,   // +1% par stack
                            darkDamage: 1.6,                // +1.6% par stack
                            attack: 1                       // +1% par stack
                        },
                        duration: 'infinite',
                        maxStacks: 20,  // Max 20 stacks = +20% Elem Acc, +32% Dark DMG, +20% ATK
                        stackable: true
                    },
                    {
                        name: 'Undying Fury',
                        trigger: 'skills hit',
                        effects: {
                            healInstant: { type: 'percentATK', value: 10 },
                            hpRecoveryRate: 10
                        },
                        duration: 5,
                        stackable: false
                    },
                    {
                        name: 'Enhanced Dark Accumulation',
                        trigger: 'passive',
                        effects: {
                            darkElementalAccumulation: 20
                        },
                        duration: 'permanent',
                        stackable: false
                    }
                ],

                teamBuffs: [
                    {
                        name: 'Oath of Victory',
                        trigger: 'stage start',
                        scope: 'team',
                        effects: {
                            damageVsDarkOverloaded: 20
                        },
                        duration: 'infinite',
                        stackable: false
                    }
                ],

                raidBuffs: [],

                debuffs: [
                    {
                        name: 'Scarlet Domination',
                        trigger: 'skills hit enemy',
                        target: 'enemy',
                        effects: {
                            darkDamageTaken: 5,
                            darkOverloadDamageTaken: 5
                        },
                        duration: 10,
                        maxStacks: 2
                    }
                ]
            },

            // =================================================================
            // ADVANCEMENT 4 (A4) - TEAM DEF PEN BUFF
            // =================================================================
            A4: {
                passives: [
                    {
                        name: 'Flawless Swordsmanship Gauge',
                        mechanic: 'gauge',
                        threshold: 50
                    },
                    {
                        name: 'Skill Transformation',
                        mechanic: 'skillTransform',
                        damageBonus: 100
                    },
                    {
                        name: 'Immortality Trigger',
                        mechanic: 'immortality',
                        trigger: 'hp <= 1',
                        duration: 2,
                        healAfter: { type: 'percentATK', value: 50 },
                        usesPerBattle: 1
                    }
                ],

                selfBuffs: [
                    {
                        name: 'Crimson Sword Dance',
                        trigger: 'gauge >= 50%',
                        effects: {
                            darkElementalAccumulation: 20,
                            darkDamage: 10,
                            attack: 10
                        },
                        duration: 30,
                        stackable: false
                    },
                    {
                        name: 'Guardian\'s Resolve',
                        trigger: 'skills hit',
                        effects: {
                            darkElementalAccumulation: 1,
                            darkDamage: 1.6,
                            attack: 1
                        },
                        duration: 'infinite',
                        maxStacks: 20,
                        stackable: true
                    },
                    {
                        name: 'Undying Fury',
                        trigger: 'skills hit',
                        effects: {
                            healInstant: { type: 'percentATK', value: 10 },
                            hpRecoveryRate: 10
                        },
                        duration: 5,
                        stackable: false
                    },
                    {
                        name: 'Enhanced Dark Accumulation',
                        trigger: 'passive',
                        effects: {
                            darkElementalAccumulation: 20
                        },
                        duration: 'permanent',
                        stackable: false
                    }
                ],

                teamBuffs: [
                    {
                        name: 'Oath of Victory',
                        trigger: 'stage start',
                        scope: 'team',
                        effects: {
                            damageVsDarkOverloaded: 20
                        },
                        duration: 'infinite',
                        stackable: false
                    }
                ],

                // NOUVEAU : Buff RAID conditionnel (Def Pen par Dark ally)
                // NOTE: Ce buff est déjà dans characterBuffs.js (defPenPerAlly)
                // Mais on le documente ici aussi pour référence complète
                raidBuffs: [
                    {
                        name: 'Dark Synergy - Def Pen',
                        trigger: 'passive',
                        scope: 'raid-dark',  // Tous les Dark du raid (exclu Sung)
                        effects: {
                            defPenPerDarkAlly: 3  // +3% Def Pen par Dark ally
                        },
                        duration: 'permanent',
                        stackable: false,
                        note: 'Exemple: 6 Dark hunters = 6 × 3% = 18% Def Pen'
                    }
                ],

                debuffs: [
                    {
                        name: 'Scarlet Domination',
                        trigger: 'skills hit enemy',
                        target: 'enemy',
                        effects: {
                            darkDamageTaken: 5,
                            darkOverloadDamageTaken: 5
                        },
                        duration: 10,
                        maxStacks: 2
                    }
                ]
            },

            // =================================================================
            // ADVANCEMENT 5 (A5) - ULTIMATE FORM
            // =================================================================
            A5: {
                passives: [
                    {
                        name: 'Flawless Swordsmanship Gauge',
                        mechanic: 'gauge',
                        threshold: 50,
                        chargeRateBonus: 100  // +100% charge rate à A5
                    },
                    {
                        name: 'Skill Transformation',
                        mechanic: 'skillTransform',
                        damageBonus: 100
                    },
                    {
                        name: 'Immortality Trigger',
                        mechanic: 'immortality',
                        trigger: 'hp <= 1',
                        duration: 2,
                        healAfter: { type: 'percentATK', value: 50 },
                        usesPerBattle: 1
                    },
                    {
                        name: 'Power Gauge Restoration',
                        description: 'Skills restaurent +20% Power Gauge',
                        mechanic: 'powerGaugeRestore',
                        value: 20  // +20% per skill hit
                    },
                    {
                        name: 'Knight\'s Pride Cooldown Reduction',
                        description: 'Skills réduisent CD de Knight\'s Pride de 3s (CD: 0.5s)',
                        mechanic: 'cooldownReduction',
                        skill: 'knightsPride',
                        reduction: 3,  // -3s
                        internalCooldown: 0.5  // 0.5s between procs
                    }
                ],

                selfBuffs: [
                    {
                        name: 'Crimson Sword Dance',
                        trigger: 'gauge >= 50%',
                        effects: {
                            darkElementalAccumulation: 20,
                            darkDamage: 10,
                            attack: 10
                        },
                        duration: 30,
                        stackable: false
                    },
                    {
                        name: 'Guardian\'s Resolve',
                        trigger: 'skills hit',
                        effects: {
                            darkElementalAccumulation: 1,
                            darkDamage: 1.6,
                            attack: 1
                        },
                        duration: 'infinite',
                        maxStacks: 20,
                        stackable: true
                    },
                    {
                        name: 'Undying Fury',  // ENHANCED
                        trigger: 'skills hit',
                        effects: {
                            healInstant: { type: 'percentATK', value: 20 },  // 10% → 20%
                            hpRecoveryRate: 20  // 10% → 20%
                        },
                        duration: 5,
                        stackable: false
                    },
                    {
                        name: 'Enhanced Dark Accumulation',
                        trigger: 'passive',
                        effects: {
                            darkElementalAccumulation: 20
                        },
                        duration: 'permanent',
                        stackable: false
                    }
                ],

                teamBuffs: [
                    {
                        name: 'Oath of Victory',
                        trigger: 'stage start',
                        scope: 'team',
                        effects: {
                            damageVsDarkOverloaded: 20
                        },
                        duration: 'infinite',
                        stackable: false
                    }
                ],

                // Buff RAID conditionnel (Def Pen par Dark ally) + Zenith Sword
                raidBuffs: [
                    {
                        name: 'Dark Synergy - Def Pen',
                        trigger: 'passive',
                        scope: 'raid-dark',
                        effects: {
                            defPenPerDarkAlly: 3
                        },
                        duration: 'permanent',
                        stackable: false
                    },
                    {
                        name: 'Zenith Sword',  // NOUVEAU à A5
                        trigger: 'Knight\'s Pride (Ultimate) hit',
                        scope: 'team-dark',  // Dark team members uniquement (PAS tout le raid Dark!)
                        effects: {
                            darkOverloadDamage: 30,  // +30% Dark Overload Damage
                            defPen: 10,              // +10% Def Pen
                            attack: 15               // +15% Attack
                        },
                        duration: 30,  // secondes
                        stackable: false,
                        note: 'Ne s\'applique qu\'aux Dark de SA TEAM (3 hunters), pas tout le RAID'
                    }
                ],

                // ENHANCED Scarlet Domination
                debuffs: [
                    {
                        name: 'Scarlet Domination',  // ENHANCED
                        trigger: 'skills hit enemy',
                        target: 'enemy',
                        effects: {
                            darkDamageTaken: 10,             // 5% → 10%
                            darkOverloadDamageTaken: 10      // 5% → 10%
                        },
                        duration: 20,  // 10s → 20s
                        maxStacks: 4   // 2 → 4 stacks (max +40% Dark DMG Taken)
                    }
                ]
            }
        }
    },

    // 🐯 BAEK YOONHO (SILVER MANE) - HP Loss Berserker Dark
    silverbaek: {
        id: 'silverbaek',
        name: 'Baek Yoonho (Silver Mane)',
        class: 'Berserker Striker',
        element: 'Dark',
        scaleStat: 'ATK',
        scaleStatSecondary: 'HP',  // Scale aussi avec HP pour certaines mécaniques
        primaryRole: 'DPS',
        secondaryRole: 'Berserker',
        tags: ['HP Sacrifice', 'Bleed Inflictor', 'Basic Attack Specialist', 'Self-Buffer'],

        // =================================================================
        // ADVANCEMENT 0 (A0) - BASE PASSIVE
        // =================================================================
        advancements: {
            A0: {
                // Passives permanents
                passives: [
                    {
                        name: 'HP Loss Scaling',
                        description: 'Skill Damage increases proportionally to 100% of reduced HP ratio',
                        mechanic: 'hpLossScaling',
                        scaling: 100,  // 100% à A0-A4, devient 200% à A5
                        formula: 'Skill DMG × (1 + (Lost HP% × 1.0))',
                        note: 'À 50% HP perdu → +50% Skill DMG, à 90% HP perdu → +90% Skill DMG'
                    },
                    {
                        name: 'Bleed Inflictor',
                        description: 'Slaughter (Core Attack) et Violent Approach (Skill 1) infligent [Bleed]',
                        mechanic: 'bleedInfliction',
                        skills: ['coreAttack', 'skill1'],
                        debuff: {
                            name: 'Bleed',
                            damage: '1% current HP every 3s',
                            duration: 30,
                            stackable: false
                        },
                        immunityDebuff: {
                            name: 'Curse of the Magic Beast',
                            damage: '1000% of Baek Yoonho Max HP every 3s',
                            duration: 30,
                            stackable: false
                        }
                    },
                    {
                        name: 'Bleed Synergy',
                        description: '+60% Basic Attack & Core Attack DMG vs targets avec [Bleed] ou [Curse of Magic Beast]',
                        mechanic: 'conditionalDamage',
                        trigger: 'target has Bleed or Curse',
                        effects: {
                            basicAttackDamage: 60,
                            coreAttackDamage: 60
                        }
                    }
                ],

                // Buffs personnels (self)
                selfBuffs: [],

                // Pas de buffs team/raid à A0
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Bleed',
                        trigger: 'Core Attack or Skill 1 hit',
                        scope: 'target',
                        effects: {
                            bleed: {
                                type: 'percentCurrentHP',
                                value: 1,  // 1% current HP
                                interval: 3  // every 3s
                            }
                        },
                        duration: 30,
                        stackable: false
                    }
                ]
            },

            // =================================================================
            // ADVANCEMENT 1 (A1) - ULTIMATE BUFFS + DEFENSIVE MECHANIC
            // =================================================================
            A1: {
                passives: [
                    {
                        name: 'HP Loss Scaling',
                        description: 'Skill Damage increases proportionally to 100% of reduced HP ratio',
                        mechanic: 'hpLossScaling',
                        scaling: 100
                    },
                    {
                        name: 'Bleed Inflictor',
                        description: 'Slaughter & Violent Approach infligent [Bleed]',
                        mechanic: 'bleedInfliction',
                        skills: ['coreAttack', 'skill1']
                    },
                    {
                        name: 'Bleed Synergy',
                        description: '+60% Basic & Core Attack DMG vs Bleed/Curse targets',
                        mechanic: 'conditionalDamage',
                        trigger: 'target has Bleed or Curse',
                        effects: {
                            basicAttackDamage: 60,
                            coreAttackDamage: 60
                        }
                    },
                    {
                        name: 'Low HP Defense',
                        description: 'When HP ≤ 30% → -30% damage taken',
                        mechanic: 'conditionalDefense',
                        trigger: 'hp <= 30%',
                        effects: {
                            damageTakenReduction: 30
                        }
                    }
                ],

                selfBuffs: [
                    {
                        name: 'Extreme Attack: Beast Form - Crit Stacking',
                        trigger: 'on Ultimate cast',
                        effects: {
                            critRatePerSecond: 3,   // +3% TC par seconde
                            critDMGPerSecond: 3,    // +3% DCC par seconde
                            maxStacks: 12,          // 12 secondes max
                            totalBonus: {
                                critRate: 36,       // 3% × 12s = +36% TC
                                critDMG: 36         // 3% × 12s = +36% DCC
                            }
                        },
                        duration: 12,  // 12 secondes
                        stackable: true,
                        stackInterval: 1  // Stack toutes les 1 seconde
                    },
                    {
                        name: 'Extreme Attack: Beast Form - Shield & Self-Damage',
                        trigger: 'on Ultimate cast',
                        effects: {
                            selfDamage: {
                                type: 'percentCurrentHP',
                                value: 10  // -10% current HP
                            },
                            shield: {
                                type: 'percentMaxHP',
                                value: 20  // Shield = 20% Max HP
                            }
                        },
                        duration: 'instant',  // Self-damage instant, shield dure jusqu'à break
                        stackable: false,
                        note: 'Ultimate ignores Shield and damages user directly'
                    }
                ],

                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Bleed',
                        trigger: 'Core Attack or Skill 1 hit',
                        scope: 'target',
                        effects: { bleed: { type: 'percentCurrentHP', value: 1, interval: 3 } },
                        duration: 30,
                        stackable: false
                    }
                ]
            },

            // =================================================================
            // ADVANCEMENT 2 (A2) - MAX HP BOOST
            // =================================================================
            A2: {
                passives: [
                    {
                        name: 'HP Loss Scaling',
                        description: 'Skill Damage increases proportionally to 100% of reduced HP ratio',
                        mechanic: 'hpLossScaling',
                        scaling: 100
                    },
                    {
                        name: 'Bleed Inflictor',
                        mechanic: 'bleedInfliction',
                        skills: ['coreAttack', 'skill1']
                    },
                    {
                        name: 'Bleed Synergy',
                        mechanic: 'conditionalDamage',
                        trigger: 'target has Bleed or Curse',
                        effects: { basicAttackDamage: 60, coreAttackDamage: 60 }
                    },
                    {
                        name: 'Low HP Defense',
                        trigger: 'hp <= 30%',
                        effects: { damageTakenReduction: 30 }
                    },
                    {
                        name: 'Increased Max HP',
                        description: '+50% Max HP',
                        mechanic: 'maxHPBoost',
                        effects: {
                            maxHP: 50  // +50% Max HP
                        }
                    }
                ],

                selfBuffs: [
                    {
                        name: 'Extreme Attack: Beast Form - Crit Stacking',
                        trigger: 'on Ultimate cast',
                        effects: {
                            critRatePerSecond: 3,
                            critDMGPerSecond: 3,
                            maxStacks: 12,
                            totalBonus: { critRate: 36, critDMG: 36 }
                        },
                        duration: 12,
                        stackable: true,
                        stackInterval: 1
                    },
                    {
                        name: 'Extreme Attack: Beast Form - Shield & Self-Damage',
                        trigger: 'on Ultimate cast',
                        effects: {
                            selfDamage: { type: 'percentCurrentHP', value: 10 },
                            shield: { type: 'percentMaxHP', value: 20 }
                        },
                        duration: 'instant',
                        stackable: false
                    }
                ],

                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Bleed',
                        trigger: 'Core Attack or Skill 1 hit',
                        scope: 'target',
                        effects: { bleed: { type: 'percentCurrentHP', value: 1, interval: 3 } },
                        duration: 30,
                        stackable: false
                    }
                ]
            },

            // =================================================================
            // ADVANCEMENT 3 (A3) - START BATTLE LOW HP
            // =================================================================
            A3: {
                passives: [
                    {
                        name: 'HP Loss Scaling',
                        mechanic: 'hpLossScaling',
                        scaling: 100
                    },
                    {
                        name: 'Bleed Inflictor',
                        mechanic: 'bleedInfliction',
                        skills: ['coreAttack', 'skill1']
                    },
                    {
                        name: 'Bleed Synergy',
                        mechanic: 'conditionalDamage',
                        trigger: 'target has Bleed or Curse',
                        effects: { basicAttackDamage: 60, coreAttackDamage: 60 }
                    },
                    {
                        name: 'Low HP Defense',
                        trigger: 'hp <= 30%',
                        effects: { damageTakenReduction: 30 }
                    },
                    {
                        name: 'Increased Max HP',
                        effects: { maxHP: 50 }
                    },
                    {
                        name: 'Battle Start: Berserk Mode',
                        description: 'Start battle with -50% HP + Shield 60% Max HP (infinite)',
                        mechanic: 'battleStart',
                        effects: {
                            startHP: -50,  // -50% HP au départ
                            shield: {
                                type: 'percentMaxHP',
                                value: 60  // Shield = 60% Max HP
                            }
                        },
                        duration: 'infinite',
                        note: 'Démarre avec 50% HP lost → +50% Skill DMG immédiatement !'
                    }
                ],

                selfBuffs: [
                    {
                        name: 'Extreme Attack: Beast Form - Crit Stacking',
                        trigger: 'on Ultimate cast',
                        effects: {
                            critRatePerSecond: 3,
                            critDMGPerSecond: 3,
                            maxStacks: 12,
                            totalBonus: { critRate: 36, critDMG: 36 }
                        },
                        duration: 12,
                        stackable: true,
                        stackInterval: 1
                    },
                    {
                        name: 'Extreme Attack: Beast Form - Shield & Self-Damage',
                        trigger: 'on Ultimate cast',
                        effects: {
                            selfDamage: { type: 'percentCurrentHP', value: 10 },
                            shield: { type: 'percentMaxHP', value: 20 }
                        },
                        duration: 'instant',
                        stackable: false
                    }
                ],

                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Bleed',
                        trigger: 'Core Attack or Skill 1 hit',
                        scope: 'target',
                        effects: { bleed: { type: 'percentCurrentHP', value: 1, interval: 3 } },
                        duration: 30,
                        stackable: false
                    }
                ]
            },

            // =================================================================
            // ADVANCEMENT 4 (A4) - BASIC & CORE ATTACK MASTERY
            // =================================================================
            A4: {
                passives: [
                    {
                        name: 'HP Loss Scaling',
                        mechanic: 'hpLossScaling',
                        scaling: 100
                    },
                    {
                        name: 'Bleed Inflictor',
                        mechanic: 'bleedInfliction',
                        skills: ['coreAttack', 'skill1']
                    },
                    {
                        name: 'Bleed Synergy',
                        mechanic: 'conditionalDamage',
                        trigger: 'target has Bleed or Curse',
                        effects: { basicAttackDamage: 60, coreAttackDamage: 60 }
                    },
                    {
                        name: 'Low HP Defense',
                        trigger: 'hp <= 30%',
                        effects: { damageTakenReduction: 30 }
                    },
                    {
                        name: 'Increased Max HP',
                        effects: { maxHP: 50 }
                    },
                    {
                        name: 'Battle Start: Berserk Mode',
                        mechanic: 'battleStart',
                        effects: {
                            startHP: -50,
                            shield: { type: 'percentMaxHP', value: 60 }
                        },
                        duration: 'infinite'
                    },
                    {
                        name: 'Basic & Core Attack Mastery',
                        description: '+100% Basic Attack & Core Attack damage',
                        mechanic: 'damageBoost',
                        effects: {
                            basicAttackDamage: 100,
                            coreAttackDamage: 100
                        }
                    }
                ],

                selfBuffs: [
                    {
                        name: 'Extreme Attack: Beast Form - Crit Stacking',
                        trigger: 'on Ultimate cast',
                        effects: {
                            critRatePerSecond: 3,
                            critDMGPerSecond: 3,
                            maxStacks: 12,
                            totalBonus: { critRate: 36, critDMG: 36 }
                        },
                        duration: 12,
                        stackable: true,
                        stackInterval: 1
                    },
                    {
                        name: 'Extreme Attack: Beast Form - Shield & Self-Damage',
                        trigger: 'on Ultimate cast',
                        effects: {
                            selfDamage: { type: 'percentCurrentHP', value: 10 },
                            shield: { type: 'percentMaxHP', value: 20 }
                        },
                        duration: 'instant',
                        stackable: false
                    }
                ],

                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Bleed',
                        trigger: 'Core Attack or Skill 1 hit',
                        scope: 'target',
                        effects: { bleed: { type: 'percentCurrentHP', value: 1, interval: 3 } },
                        duration: 30,
                        stackable: false
                    }
                ]
            },

            // =================================================================
            // ADVANCEMENT 5 (A5) - ULTIMATE BERSERKER
            // =================================================================
            A5: {
                passives: [
                    {
                        name: 'HP Loss Scaling - ENHANCED',
                        description: 'Skill Damage increases proportionally to 200% of reduced HP ratio',
                        mechanic: 'hpLossScaling',
                        scaling: 200,  // 100% → 200% !
                        formula: 'Skill DMG × (1 + (Lost HP% × 2.0))',
                        note: 'À 50% HP perdu → +100% Skill DMG, à 90% HP perdu → +180% Skill DMG !'
                    },
                    {
                        name: 'Bleed Inflictor',
                        mechanic: 'bleedInfliction',
                        skills: ['coreAttack', 'skill1']
                    },
                    {
                        name: 'Bleed Synergy',
                        mechanic: 'conditionalDamage',
                        trigger: 'target has Bleed or Curse',
                        effects: { basicAttackDamage: 60, coreAttackDamage: 60 }
                    },
                    {
                        name: 'Low HP Defense',
                        trigger: 'hp <= 30%',
                        effects: { damageTakenReduction: 30 }
                    },
                    {
                        name: 'Increased Max HP',
                        effects: { maxHP: 50 }
                    },
                    {
                        name: 'Battle Start: Berserk Mode',
                        mechanic: 'battleStart',
                        effects: {
                            startHP: -50,
                            shield: { type: 'percentMaxHP', value: 60 }
                        },
                        duration: 'infinite'
                    },
                    {
                        name: 'Basic & Core Attack Mastery',
                        effects: {
                            basicAttackDamage: 100,
                            coreAttackDamage: 100
                        }
                    }
                ],

                selfBuffs: [
                    {
                        name: 'Extreme Attack: Beast Form - Crit Stacking',
                        trigger: 'on Ultimate cast',
                        effects: {
                            critRatePerSecond: 3,
                            critDMGPerSecond: 3,
                            maxStacks: 12,
                            totalBonus: { critRate: 36, critDMG: 36 }
                        },
                        duration: 12,
                        stackable: true,
                        stackInterval: 1
                    },
                    {
                        name: 'Extreme Attack: Beast Form - Shield & Self-Damage',
                        trigger: 'on Ultimate cast',
                        effects: {
                            selfDamage: { type: 'percentCurrentHP', value: 10 },
                            shield: { type: 'percentMaxHP', value: 20 }
                        },
                        duration: 'instant',
                        stackable: false
                    },
                    {
                        name: 'Divinity - Ultimate HP Loss Scaling',
                        trigger: 'on Ultimate cast',
                        effects: {
                            damagePerHPLost: 10  // +10% DMG per 10% HP lost
                        },
                        formula: 'Ultimate DMG × (1 + (Lost HP% / 10) × 0.1)',
                        note: 'À 90% HP perdu → +90% Ultimate DMG !',
                        duration: 'instant',
                        stackable: false
                    }
                ],

                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Bleed',
                        trigger: 'Core Attack or Skill 1 hit',
                        scope: 'target',
                        effects: { bleed: { type: 'percentCurrentHP', value: 1, interval: 3 } },
                        duration: 30,
                        stackable: false
                    }
                ]
            }
        }
    },

    // ⚔️ SUNG ILHWAN - Lethal Dark DPS Assassin
    ilhwan: {
        id: 'ilhwan',
        name: 'Sung Ilhwan',
        class: 'Lethal Dark DPS Assassin',
        element: 'Dark',
        scaleStat: 'ATK',
        primaryRole: 'DPS',
        secondaryRole: 'Burst Damage / Stacking Specialist',
        tags: ['Stacking Mechanics', 'MP Management', 'Team Synergy', 'Multi-Stage Combos'],

        // =================================================================
        // ADVANCEMENT 0 (A0) - BASE PASSIVE - STACKING MECHANICS
        // =================================================================
        advancements: {
            A0: {
                // Passives permanents
                passives: [
                    {
                        name: 'MP Cannot Regenerate Naturally',
                        description: 'MP cannot be recovered naturally or with Basic/Core Attack',
                        mechanic: 'mpNoRegen',
                        note: 'Dépend des Basic Skills des alliés pour récupérer MP'
                    },
                    {
                        name: 'Team Basic Skill MP Recovery',
                        description: 'When team members (excluding Ilhwan) use Basic Skill → Ilhwan recovers 2% MP and 1% Power Gauge',
                        mechanic: 'teamSynergy',
                        effects: {
                            mpRecoveryPerAllySkill: 2,    // +2% MP
                            gaugeRecoveryPerAllySkill: 1  // +1% Power Gauge
                        }
                    },
                    {
                        name: 'Apocalyptic Might MP Restore',
                        description: 'Using Ultimate restores MP equal to 14% of current MP × [Ruler\'s Upgrade] stacks, removes all stacks',
                        mechanic: 'ultimateMPRestore',
                        mpRestorePerStack: 14  // 14% current MP par stack
                    },
                    {
                        name: 'Phantom Slash & Wrath Cooldown Stacking',
                        description: 'Using Phantom Slash or Wrath of Condemnation activates [Ruler\'s Upgrade]',
                        mechanic: 'skillStacking'
                    },
                    {
                        name: 'Phantom Slash Scaling',
                        description: 'Phantom Slash hits activate [Ruler\'s Scale] effect',
                        mechanic: 'skillStacking'
                    }
                ],

                // Buffs personnels (self)
                selfBuffs: [
                    {
                        name: 'Ruler\'s Upgrade',
                        trigger: 'Phantom Slash or Wrath of Condemnation cast',
                        effects: {
                            basicSkillDamagePerStack: 5,   // +5% Basic Skill DMG per stack
                            ultimateSkillDamagePerStack: 25 // +25% Ultimate Skill DMG per stack
                        },
                        maxStacks: 7,
                        duration: 'infinite',
                        stackable: true,
                        note: 'Max 7 stacks = +35% Basic Skill DMG, +175% Ultimate Skill DMG'
                    },
                    {
                        name: 'Ruler\'s Scale',
                        trigger: 'Phantom Slash hits',
                        effects: {
                            wrathDamagePerStack: 1  // +1% Wrath of Condemnation DMG per stack
                        },
                        maxStacks: 160,
                        duration: 'infinite',
                        stackable: true,
                        note: 'Max 160 stacks = +160% Wrath DMG! Removed when using Wrath'
                    }
                ],

                // Pas de buffs team/raid à A0
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            },

            // =================================================================
            // ADVANCEMENT 1 (A1) - COOLDOWN REDUCTION + MARKED/SUPPRESSED
            // =================================================================
            A1: {
                passives: [
                    {
                        name: 'MP Cannot Regenerate Naturally',
                        mechanic: 'mpNoRegen'
                    },
                    {
                        name: 'Team Basic Skill MP Recovery',
                        effects: { mpRecoveryPerAllySkill: 2, gaugeRecoveryPerAllySkill: 1 }
                    },
                    {
                        name: 'Apocalyptic Might MP Restore',
                        mpRestorePerStack: 14
                    },
                    {
                        name: 'Phantom Slash Cooldown Reduction',
                        description: 'Using Basic Attack or Core Attack decreases Phantom Slash cooldown by 1s',
                        mechanic: 'cooldownReduction',
                        skill: 'phantomSlash',
                        reduction: 1  // -1s per Basic/Core Attack
                    },
                    {
                        name: 'Apocalyptic Might Buff Reset',
                        description: 'Using Ultimate resets the duration of active buffs (CD: 30s)',
                        mechanic: 'buffRefresh',
                        cooldown: 30
                    }
                ],

                selfBuffs: [
                    {
                        name: 'Ruler\'s Upgrade',
                        trigger: 'Phantom Slash or Wrath cast',
                        effects: { basicSkillDamagePerStack: 5, ultimateSkillDamagePerStack: 25 },
                        maxStacks: 7,
                        duration: 'infinite',
                        stackable: true
                    },
                    {
                        name: 'Ruler\'s Scale',
                        trigger: 'Phantom Slash hits',
                        effects: { wrathDamagePerStack: 1 },
                        maxStacks: 160,
                        duration: 'infinite',
                        stackable: true
                    }
                ],

                teamBuffs: [],
                raidBuffs: [],

                // DEBUFFS sur ennemis
                debuffs: [
                    {
                        name: 'Marked',
                        trigger: 'Dark Finale or Apocalyptic Might hit',
                        target: 'enemy',
                        effects: {
                            damageTakenFromIlhwan: 35  // +35% damage taken from Ilhwan
                        },
                        duration: 30,
                        upgradeTo: 'Suppressed',
                        upgradeCondition: 'target enters Break state'
                    },
                    {
                        name: 'Suppressed',
                        trigger: 'Marked target enters Break state',
                        target: 'enemy',
                        effects: {
                            damageTakenFromIlhwan: 50,      // +50% damage taken from Ilhwan
                            ultimateDamageTakenDark: 20     // +20% Ultimate damage taken from Dark hunters
                        },
                        duration: 30,
                        note: 'Apocalyptic Might refreshes Suppressed duration'
                    }
                ]
            },

            // =================================================================
            // ADVANCEMENT 2 (A2) - DARK DMG BOOST
            // =================================================================
            A2: {
                passives: [
                    {
                        name: 'MP Cannot Regenerate Naturally',
                        mechanic: 'mpNoRegen'
                    },
                    {
                        name: 'Team Basic Skill MP Recovery',
                        effects: { mpRecoveryPerAllySkill: 2, gaugeRecoveryPerAllySkill: 1 }
                    },
                    {
                        name: 'Apocalyptic Might MP Restore',
                        mpRestorePerStack: 14
                    },
                    {
                        name: 'Phantom Slash Cooldown Reduction',
                        mechanic: 'cooldownReduction',
                        skill: 'phantomSlash',
                        reduction: 1
                    },
                    {
                        name: 'Apocalyptic Might Buff Reset',
                        mechanic: 'buffRefresh',
                        cooldown: 30
                    }
                ],

                selfBuffs: [
                    {
                        name: 'Ruler\'s Upgrade',
                        trigger: 'Phantom Slash or Wrath cast',
                        effects: { basicSkillDamagePerStack: 5, ultimateSkillDamagePerStack: 25 },
                        maxStacks: 7,
                        duration: 'infinite',
                        stackable: true
                    },
                    {
                        name: 'Ruler\'s Scale',
                        trigger: 'Phantom Slash hits',
                        effects: { wrathDamagePerStack: 1 },
                        maxStacks: 160,
                        duration: 'infinite',
                        stackable: true
                    },
                    {
                        name: 'Dark Damage Boost',  // NOUVEAU à A2
                        trigger: 'passive',
                        effects: {
                            darkDamage: 30  // +30% Dark DMG
                        },
                        duration: 'permanent',
                        stackable: false
                    }
                ],

                teamBuffs: [],
                raidBuffs: [],

                debuffs: [
                    {
                        name: 'Marked',
                        trigger: 'Dark Finale or Apocalyptic Might hit',
                        target: 'enemy',
                        effects: { damageTakenFromIlhwan: 35 },
                        duration: 30,
                        upgradeTo: 'Suppressed',
                        upgradeCondition: 'target enters Break state'
                    },
                    {
                        name: 'Suppressed',
                        trigger: 'Marked target enters Break state',
                        target: 'enemy',
                        effects: {
                            damageTakenFromIlhwan: 50,
                            ultimateDamageTakenDark: 20
                        },
                        duration: 30
                    }
                ]
            },

            // =================================================================
            // ADVANCEMENT 3 (A3) - DOUBLE HIT SKILLS
            // =================================================================
            A3: {
                passives: [
                    {
                        name: 'MP Cannot Regenerate Naturally',
                        mechanic: 'mpNoRegen'
                    },
                    {
                        name: 'Team Basic Skill MP Recovery',
                        effects: { mpRecoveryPerAllySkill: 2, gaugeRecoveryPerAllySkill: 1 }
                    },
                    {
                        name: 'Apocalyptic Might MP Restore',
                        mpRestorePerStack: 14
                    },
                    {
                        name: 'Phantom Slash Cooldown Reduction',
                        mechanic: 'cooldownReduction',
                        skill: 'phantomSlash',
                        reduction: 1
                    },
                    {
                        name: 'Apocalyptic Might Buff Reset',
                        mechanic: 'buffRefresh',
                        cooldown: 30
                    },
                    {
                        name: 'Double Hit Skills',  // NOUVEAU à A3
                        description: 'Phantom Slash, Wrath of Condemnation, and Apocalyptic Might attacks are DOUBLED',
                        mechanic: 'doubleHit',
                        skills: ['phantomSlash', 'wrathOfCondemnation', 'apocalypticMight'],
                        note: 'MASSIVE damage boost - skills hit twice!'
                    },
                    {
                        name: 'Sky Piercer Instant Attack',
                        description: 'If enemy within 5m when using Sky Piercer → instant attack',
                        mechanic: 'instantAttack',
                        skill: 'skyPiercer',
                        range: 5  // 5m
                    }
                ],

                selfBuffs: [
                    {
                        name: 'Ruler\'s Upgrade',
                        trigger: 'Phantom Slash or Wrath cast',
                        effects: { basicSkillDamagePerStack: 5, ultimateSkillDamagePerStack: 25 },
                        maxStacks: 7,
                        duration: 'infinite',
                        stackable: true
                    },
                    {
                        name: 'Ruler\'s Scale',
                        trigger: 'Phantom Slash hits',
                        effects: { wrathDamagePerStack: 1 },
                        maxStacks: 160,
                        duration: 'infinite',
                        stackable: true,
                        note: 'A3+ : Double hits → 2x faster stacking!'
                    },
                    {
                        name: 'Dark Damage Boost',
                        trigger: 'passive',
                        effects: { darkDamage: 30 },
                        duration: 'permanent',
                        stackable: false
                    }
                ],

                teamBuffs: [],
                raidBuffs: [],

                debuffs: [
                    {
                        name: 'Marked',
                        trigger: 'Dark Finale or Apocalyptic Might hit',
                        target: 'enemy',
                        effects: { damageTakenFromIlhwan: 35 },
                        duration: 30,
                        upgradeTo: 'Suppressed',
                        upgradeCondition: 'target enters Break state'
                    },
                    {
                        name: 'Suppressed',
                        trigger: 'Marked target enters Break state',
                        target: 'enemy',
                        effects: {
                            damageTakenFromIlhwan: 50,
                            ultimateDamageTakenDark: 20
                        },
                        duration: 30
                    }
                ]
            },

            // =================================================================
            // ADVANCEMENT 4 (A4) - TEAM ATK BUFF
            // =================================================================
            A4: {
                passives: [
                    {
                        name: 'MP Cannot Regenerate Naturally',
                        mechanic: 'mpNoRegen'
                    },
                    {
                        name: 'Team Basic Skill MP Recovery',
                        effects: { mpRecoveryPerAllySkill: 2, gaugeRecoveryPerAllySkill: 1 }
                    },
                    {
                        name: 'Apocalyptic Might MP Restore',
                        mpRestorePerStack: 14
                    },
                    {
                        name: 'Phantom Slash Cooldown Reduction',
                        mechanic: 'cooldownReduction',
                        skill: 'phantomSlash',
                        reduction: 1
                    },
                    {
                        name: 'Apocalyptic Might Buff Reset',
                        mechanic: 'buffRefresh',
                        cooldown: 30
                    },
                    {
                        name: 'Double Hit Skills',
                        mechanic: 'doubleHit',
                        skills: ['phantomSlash', 'wrathOfCondemnation', 'apocalypticMight']
                    },
                    {
                        name: 'Sky Piercer Instant Attack',
                        mechanic: 'instantAttack',
                        skill: 'skyPiercer',
                        range: 5
                    }
                ],

                selfBuffs: [
                    {
                        name: 'Ruler\'s Upgrade',
                        trigger: 'Phantom Slash or Wrath cast',
                        effects: { basicSkillDamagePerStack: 5, ultimateSkillDamagePerStack: 25 },
                        maxStacks: 7,
                        duration: 'infinite',
                        stackable: true
                    },
                    {
                        name: 'Ruler\'s Scale',
                        trigger: 'Phantom Slash hits',
                        effects: { wrathDamagePerStack: 1 },
                        maxStacks: 160,
                        duration: 'infinite',
                        stackable: true
                    },
                    {
                        name: 'Dark Damage Boost',
                        trigger: 'passive',
                        effects: { darkDamage: 30 },
                        duration: 'permanent',
                        stackable: false
                    }
                ],

                teamBuffs: [],

                // NOUVEAU : Buff RAID conditionnel (ATK par Dark ally)
                raidBuffs: [
                    {
                        name: 'Dark Synergy - ATK',
                        trigger: 'passive',
                        scope: 'raid-dark',  // Tous les Dark du raid (team dark)
                        effects: {
                            attackPerDarkAlly: 10  // +10% ATK par Dark ally
                        },
                        duration: 'permanent',
                        stackable: false,
                        note: 'Exemple: 6 Dark hunters = 6 × 10% = 60% ATK'
                    }
                ],

                debuffs: [
                    {
                        name: 'Marked',
                        trigger: 'Dark Finale or Apocalyptic Might hit',
                        target: 'enemy',
                        effects: { damageTakenFromIlhwan: 35 },
                        duration: 30,
                        upgradeTo: 'Suppressed',
                        upgradeCondition: 'target enters Break state'
                    },
                    {
                        name: 'Suppressed',
                        trigger: 'Marked target enters Break state',
                        target: 'enemy',
                        effects: {
                            damageTakenFromIlhwan: 50,
                            ultimateDamageTakenDark: 20
                        },
                        duration: 30
                    }
                ]
            },

            // =================================================================
            // ADVANCEMENT 5 (A5) - RULER'S PROTECTION + ENHANCED RECOVERY
            // =================================================================
            A5: {
                passives: [
                    {
                        name: 'MP Cannot Regenerate Naturally',
                        mechanic: 'mpNoRegen'
                    },
                    {
                        name: 'Team Basic Skill MP Recovery - ENHANCED',  // UPGRADED à A5
                        description: 'When team members (excluding Ilhwan) use Basic Skill → Ilhwan recovers 8% MP and 4% Power Gauge',
                        mechanic: 'teamSynergy',
                        effects: {
                            mpRecoveryPerAllySkill: 8,    // 2% → 8% MP
                            gaugeRecoveryPerAllySkill: 4  // 1% → 4% Power Gauge
                        },
                        note: 'x4 recovery rate vs A0-A4!'
                    },
                    {
                        name: 'Apocalyptic Might MP Restore',
                        mpRestorePerStack: 14
                    },
                    {
                        name: 'Phantom Slash Cooldown Reduction - ENHANCED',  // UPGRADED à A5
                        description: 'Using Basic Attack or Core Attack decreases Phantom Slash cooldown by 1.7s',
                        mechanic: 'cooldownReduction',
                        skill: 'phantomSlash',
                        reduction: 1.7  // 1s → 1.7s
                    },
                    {
                        name: 'Apocalyptic Might Buff Reset',
                        mechanic: 'buffRefresh',
                        cooldown: 30
                    },
                    {
                        name: 'Double Hit Skills',
                        mechanic: 'doubleHit',
                        skills: ['phantomSlash', 'wrathOfCondemnation', 'apocalypticMight']
                    },
                    {
                        name: 'Sky Piercer Instant Attack',
                        mechanic: 'instantAttack',
                        skill: 'skyPiercer',
                        range: 5
                    }
                ],

                selfBuffs: [
                    {
                        name: 'Ruler\'s Upgrade',
                        trigger: 'Phantom Slash or Wrath cast',
                        effects: { basicSkillDamagePerStack: 5, ultimateSkillDamagePerStack: 25 },
                        maxStacks: 7,
                        duration: 'infinite',
                        stackable: true
                    },
                    {
                        name: 'Ruler\'s Scale',
                        trigger: 'Phantom Slash hits',
                        effects: { wrathDamagePerStack: 1 },
                        maxStacks: 160,
                        duration: 'infinite',
                        stackable: true
                    },
                    {
                        name: 'Dark Damage Boost',
                        trigger: 'passive',
                        effects: { darkDamage: 30 },
                        duration: 'permanent',
                        stackable: false
                    },
                    {
                        name: 'Ruler\'s Protection',  // NOUVEAU à A5
                        trigger: 'Using Wrath of Condemnation',
                        effects: {
                            shield: {
                                type: 'percentATK',
                                value: 100  // Shield = 100% ATK
                            },
                            attackPerStack: 12,   // +12% ATK par stack
                            critRatePerStack: 12, // +12% TC par stack
                            maxStacks: 3,
                            totalBonus: {
                                attack: 36,       // 12% × 3 = +36% ATK
                                critRate: 36      // 12% × 3 = +36% TC
                            }
                        },
                        duration: 30,  // 30s pour les buffs ATK/TC
                        shieldDuration: 20,  // 20s pour le shield
                        stackable: true,
                        note: 'Correspond au +36% TC mentionné dans characterBuffs.js (3×12%)'
                    }
                ],

                teamBuffs: [],

                raidBuffs: [
                    {
                        name: 'Dark Synergy - ATK',
                        trigger: 'passive',
                        scope: 'raid-dark',
                        effects: { attackPerDarkAlly: 10 },
                        duration: 'permanent',
                        stackable: false
                    }
                ],

                debuffs: [
                    {
                        name: 'Marked',
                        trigger: 'Dark Finale or Apocalyptic Might hit',
                        target: 'enemy',
                        effects: { damageTakenFromIlhwan: 35 },
                        duration: 30,
                        upgradeTo: 'Suppressed',
                        upgradeCondition: 'target enters Break state'
                    },
                    {
                        name: 'Suppressed',
                        trigger: 'Marked target enters Break state',
                        target: 'enemy',
                        effects: {
                            damageTakenFromIlhwan: 50,
                            ultimateDamageTakenDark: 20
                        },
                        duration: 30
                    }
                ]
            }
        }
    },

    // 🛡️ SON KIHOON - Breaker Dark HP Scaler
    son: {
        id: 'son',
        name: 'Son Kihoon',
        class: 'Breaker Dark HP Scaler',
        element: 'Dark',
        scaleStat: 'HP',  // Scale avec HP, pas ATK !
        primaryRole: 'Breaker',
        secondaryRole: 'Team Buffer / Break Controller',
        tags: ['HP Scaling', 'Break Specialist', 'Stance System', 'Team Buffer', 'Zone Control'],

        // =================================================================
        // ADVANCEMENT 0 (A0) - BASE PASSIVE - STANCE SYSTEM
        // =================================================================
        advancements: {
            A0: {
                // Passives permanents
                passives: [
                    {
                        name: 'Battle Stance Activation',
                        description: '[Battle Stance] effect is activated when entering a stage',
                        mechanic: 'stanceSystem',
                        initialStance: 'battle'
                    },
                    {
                        name: 'Guard Stance Trigger',
                        description: 'When attack lands on target with [Break] Gauge → activates [Guard Stance]',
                        mechanic: 'stanceSystem',
                        trigger: 'attackOnBreakGauge'
                    },
                    {
                        name: 'Break Success Bonuses',
                        description: 'If Kihoon or ally successfully puts target in [Break] → +3s Break duration, restore 100% Core Gauge + Power Gauge, activate [Battle Stance]',
                        mechanic: 'breakTrigger',
                        effects: {
                            breakDurationExtension: 3,     // +3s Break duration
                            coreGaugeRestore: 100,         // 100% Core Gauge
                            powerGaugeRestore: 100,        // 100% Power Gauge
                            switchStance: 'battle'         // Active Battle Stance
                        }
                    }
                ],

                // Buffs personnels (self) - Stances
                selfBuffs: [
                    {
                        name: 'Battle Stance',
                        trigger: 'stage start OR break success',
                        effects: {
                            darkDamage: 20,          // +20% Dark DMG
                            fierceChargeDamage: 50   // +50% Fierce Charge DMG
                        },
                        duration: 'infinite',
                        stackable: false,
                        mutuallyExclusive: 'Guard Stance',
                        note: 'Removes Guard Stance when activated'
                    },
                    {
                        name: 'Guard Stance',
                        trigger: 'attack on target with Break Gauge',
                        effects: {
                            damageDealt: 10,       // +10% DMG dealt
                            breakEffectiveness: 10 // +10% Break effectiveness
                        },
                        duration: 'infinite',
                        stackable: false,
                        mutuallyExclusive: 'Battle Stance',
                        note: 'Removes Battle Stance when activated'
                    }
                ],

                // Debuffs sur ennemis
                debuffs: [
                    {
                        name: 'Weakened Fighting Spirit',
                        trigger: 'Flag of Authority zone',
                        target: 'enemy',
                        effects: {
                            darkDamageTaken: 5  // +5% Dark damage taken
                        },
                        duration: 30,
                        mechanic: 'zone',
                        note: 'Targets entering the zone get [Unrecoverable] effect'
                    }
                ],

                teamBuffs: [],
                raidBuffs: []
            },

            // =================================================================
            // ADVANCEMENT 1 (A1) - STURDY SHIELD + FIGHTING SPIRIT DRIVE
            // =================================================================
            A1: {
                passives: [
                    {
                        name: 'Battle/Guard Stance System',
                        mechanic: 'stanceSystem'
                    },
                    {
                        name: 'Break Success Bonuses',
                        mechanic: 'breakTrigger'
                    },
                    {
                        name: 'Sturdy Shield Activation',
                        description: 'Using Flag of Authority or Fierce Charge → activates [Sturdy Shield]',
                        mechanic: 'skillTrigger',
                        trigger: 'Flag of Authority OR Fierce Charge',
                        effect: 'Sturdy Shield'
                    },
                    {
                        name: 'Drive Enhancement',
                        description: 'Using Flag of Authority or Fierce Charge → changes Drive to Fighting Spirit: Drive',
                        mechanic: 'skillTransform',
                        transform: 'Drive → Fighting Spirit: Drive'
                    },
                    {
                        name: 'Fighting Spirit: Drive Power Restore',
                        description: 'Using Fighting Spirit: Drive → restores 35% Power Gauge',
                        mechanic: 'powerGaugeRestore',
                        amount: 35  // +35% Power Gauge
                    },
                    {
                        name: 'Righteous Spirit Grant',
                        description: 'When Kihoon tags out → grants [Righteous Spirit] to Dark Striker team members',
                        mechanic: 'tagOutBuff',
                        targetRole: 'Striker',
                        targetElement: 'Dark'
                    }
                ],

                selfBuffs: [
                    {
                        name: 'Battle Stance',
                        trigger: 'stage start OR break success',
                        effects: { darkDamage: 20, fierceChargeDamage: 50 },
                        duration: 'infinite',
                        stackable: false
                    },
                    {
                        name: 'Guard Stance',
                        trigger: 'attack on Break Gauge',
                        effects: { damageDealt: 10, breakEffectiveness: 10 },
                        duration: 'infinite',
                        stackable: false
                    },
                    {
                        name: 'Sturdy Shield',
                        trigger: 'Flag of Authority OR Fierce Charge cast',
                        effects: {
                            shield: {
                                type: 'percentHP',
                                value: 30  // Shield = 30% of Kihoon's HP
                            }
                        },
                        duration: 30,
                        stackable: false
                    }
                ],

                // Buffs pour Dark Strikers de la team
                teamBuffs: [
                    {
                        name: 'Righteous Spirit',
                        trigger: 'Kihoon tags out',
                        scope: 'team-dark-striker',  // Dark Strikers uniquement
                        effects: {
                            weakBreakDamage: true,  // Basic Skill hits deal weak Break damage
                            superArmor: true,       // Super Armor while active
                            mpRestoreOnEnd: 25      // +25% MP restore when effect ends
                        },
                        duration: 25,
                        cooldown: 30,
                        stackable: false,
                        note: 'Granted to Dark Striker team members when Kihoon tags out'
                    }
                ],

                raidBuffs: [],

                debuffs: [
                    {
                        name: 'Weakened Fighting Spirit',
                        trigger: 'Flag of Authority zone',
                        target: 'enemy',
                        effects: { darkDamageTaken: 5 },
                        duration: 30
                    }
                ]
            },

            // =================================================================
            // ADVANCEMENT 2 (A2) - BREAK EFFECTIVENESS BOOST
            // =================================================================
            A2: {
                passives: [
                    {
                        name: 'Battle/Guard Stance System',
                        mechanic: 'stanceSystem'
                    },
                    {
                        name: 'Break Success Bonuses',
                        mechanic: 'breakTrigger'
                    },
                    {
                        name: 'Enhanced Break Effectiveness',  // NOUVEAU à A2
                        description: 'Increases [Break] effectiveness by 10%',
                        mechanic: 'breakEffectiveness',
                        amount: 10  // +10% Break effectiveness (permanent)
                    },
                    {
                        name: 'Sturdy Shield Activation',
                        mechanic: 'skillTrigger'
                    },
                    {
                        name: 'Fighting Spirit: Drive Power Restore',
                        mechanic: 'powerGaugeRestore'
                    },
                    {
                        name: 'Righteous Spirit Grant',
                        mechanic: 'tagOutBuff'
                    }
                ],

                selfBuffs: [
                    {
                        name: 'Battle Stance',
                        trigger: 'stage start OR break success',
                        effects: { darkDamage: 20, fierceChargeDamage: 50 },
                        duration: 'infinite',
                        stackable: false
                    },
                    {
                        name: 'Guard Stance',
                        trigger: 'attack on Break Gauge',
                        effects: { damageDealt: 10, breakEffectiveness: 10 },
                        duration: 'infinite',
                        stackable: false
                    },
                    {
                        name: 'Sturdy Shield',
                        trigger: 'Flag of Authority OR Fierce Charge cast',
                        effects: { shield: { type: 'percentHP', value: 30 } },
                        duration: 30,
                        stackable: false
                    }
                ],

                teamBuffs: [
                    {
                        name: 'Righteous Spirit',
                        trigger: 'Kihoon tags out',
                        scope: 'team-dark-striker',
                        effects: { weakBreakDamage: true, superArmor: true, mpRestoreOnEnd: 25 },
                        duration: 25,
                        cooldown: 30,
                        stackable: false
                    }
                ],

                raidBuffs: [],

                debuffs: [
                    {
                        name: 'Weakened Fighting Spirit',
                        trigger: 'Flag of Authority zone',
                        target: 'enemy',
                        effects: { darkDamageTaken: 5 },
                        duration: 30
                    }
                ]
            },

            // =================================================================
            // ADVANCEMENT 3 (A3) - ENHANCED BREAK DAMAGE + DEBUFF
            // =================================================================
            A3: {
                passives: [
                    {
                        name: 'Battle/Guard Stance System',
                        mechanic: 'stanceSystem'
                    },
                    {
                        name: 'Break Success Bonuses',
                        mechanic: 'breakTrigger'
                    },
                    {
                        name: 'Enhanced Break Effectiveness',
                        amount: 10
                    },
                    {
                        name: 'Fighting Spirit: Drive Heavy Break',  // NOUVEAU à A3
                        description: 'Fighting Spirit: Drive deals heavy [Break] damage',
                        mechanic: 'breakDamageUpgrade',
                        skill: 'fightingSpiritDrive',
                        breakLevel: 'heavy'
                    },
                    {
                        name: 'Fierce Charge Almighty Break',  // NOUVEAU à A3
                        description: 'Fierce Charge deals almighty [Break] damage',
                        mechanic: 'breakDamageUpgrade',
                        skill: 'fierceCharge',
                        breakLevel: 'almighty'
                    },
                    {
                        name: 'Sturdy Shield Activation',
                        mechanic: 'skillTrigger'
                    },
                    {
                        name: 'Fighting Spirit: Drive Power Restore',
                        mechanic: 'powerGaugeRestore'
                    },
                    {
                        name: 'Righteous Spirit Grant',
                        mechanic: 'tagOutBuff'
                    }
                ],

                selfBuffs: [
                    {
                        name: 'Battle Stance',
                        trigger: 'stage start OR break success',
                        effects: { darkDamage: 20, fierceChargeDamage: 50 },
                        duration: 'infinite',
                        stackable: false
                    },
                    {
                        name: 'Guard Stance',
                        trigger: 'attack on Break Gauge',
                        effects: { damageDealt: 10, breakEffectiveness: 10 },
                        duration: 'infinite',
                        stackable: false
                    },
                    {
                        name: 'Sturdy Shield',
                        trigger: 'Flag of Authority OR Fierce Charge cast',
                        effects: { shield: { type: 'percentHP', value: 30 } },
                        duration: 30,
                        stackable: false
                    }
                ],

                teamBuffs: [
                    {
                        name: 'Righteous Spirit',
                        trigger: 'Kihoon tags out',
                        scope: 'team-dark-striker',
                        effects: { weakBreakDamage: true, superArmor: true, mpRestoreOnEnd: 25 },
                        duration: 25,
                        cooldown: 30,
                        stackable: false
                    }
                ],

                raidBuffs: [],

                // Debuff ENHANCED à A3
                debuffs: [
                    {
                        name: 'Weakened Fighting Spirit',  // ENHANCED à A3
                        trigger: 'Flag of Authority zone',
                        target: 'enemy',
                        effects: {
                            attack: -12.5,         // -12.5% ATK (NOUVEAU à A3)
                            darkDamageTaken: 10    // +10% Dark damage taken (5% → 10%)
                        },
                        duration: 30,
                        note: 'Enhanced at A3: adds ATK reduction and increases Dark damage taken'
                    }
                ]
            },

            // =================================================================
            // ADVANCEMENT 4 (A4) - TEAM ATK/HP BUFFS
            // =================================================================
            A4: {
                passives: [
                    {
                        name: 'Battle/Guard Stance System',
                        mechanic: 'stanceSystem'
                    },
                    {
                        name: 'Break Success Bonuses',
                        mechanic: 'breakTrigger'
                    },
                    {
                        name: 'Enhanced Break Effectiveness',
                        amount: 10
                    },
                    {
                        name: 'Fighting Spirit: Drive Heavy Break',
                        mechanic: 'breakDamageUpgrade'
                    },
                    {
                        name: 'Fierce Charge Almighty Break',
                        mechanic: 'breakDamageUpgrade'
                    },
                    {
                        name: 'Sturdy Shield Activation',
                        mechanic: 'skillTrigger'
                    },
                    {
                        name: 'Fighting Spirit: Drive Power Restore',
                        mechanic: 'powerGaugeRestore'
                    },
                    {
                        name: 'Righteous Spirit Grant',
                        mechanic: 'tagOutBuff'
                    }
                ],

                selfBuffs: [
                    {
                        name: 'Battle Stance',
                        trigger: 'stage start OR break success',
                        effects: { darkDamage: 20, fierceChargeDamage: 50 },
                        duration: 'infinite',
                        stackable: false
                    },
                    {
                        name: 'Guard Stance',
                        trigger: 'attack on Break Gauge',
                        effects: { damageDealt: 10, breakEffectiveness: 10 },
                        duration: 'infinite',
                        stackable: false
                    },
                    {
                        name: 'Sturdy Shield',
                        trigger: 'Flag of Authority OR Fierce Charge cast',
                        effects: { shield: { type: 'percentHP', value: 30 } },
                        duration: 30,
                        stackable: false
                    }
                ],

                // NOUVEAU à A4 : Team buffs permanents (voir characterBuffs.js)
                teamBuffs: [
                    {
                        name: 'Righteous Spirit',
                        trigger: 'Kihoon tags out',
                        scope: 'team-dark-striker',
                        effects: { weakBreakDamage: true, superArmor: true, mpRestoreOnEnd: 25 },
                        duration: 25,
                        cooldown: 30,
                        stackable: false
                    }
                    // Note: +10% ATK/HP team buffs sont dans characterBuffs.js
                ],

                raidBuffs: [],

                debuffs: [
                    {
                        name: 'Weakened Fighting Spirit',
                        trigger: 'Flag of Authority zone',
                        target: 'enemy',
                        effects: { attack: -12.5, darkDamageTaken: 10 },
                        duration: 30
                    }
                ]
            },

            // =================================================================
            // ADVANCEMENT 5 (A5) - STRIKE SQUAD LEADER + BERSERK STRIKE
            // =================================================================
            A5: {
                passives: [
                    {
                        name: 'Battle/Guard Stance System',
                        mechanic: 'stanceSystem'
                    },
                    {
                        name: 'Break Success Bonuses',
                        mechanic: 'breakTrigger'
                    },
                    {
                        name: 'Enhanced Break Effectiveness',
                        amount: 10
                    },
                    {
                        name: 'Fighting Spirit: Drive Heavy Break',
                        mechanic: 'breakDamageUpgrade'
                    },
                    {
                        name: 'Fierce Charge Almighty Break',
                        mechanic: 'breakDamageUpgrade'
                    },
                    {
                        name: 'Sturdy Shield Activation',
                        mechanic: 'skillTrigger'
                    },
                    {
                        name: 'Fighting Spirit: Drive Power Restore',
                        mechanic: 'powerGaugeRestore'
                    },
                    {
                        name: 'Righteous Spirit Grant',
                        mechanic: 'tagOutBuff'
                    },
                    {
                        name: 'Ultimate Break Debuff',  // NOUVEAU à A5
                        description: 'When Thrilling Fighting Spirit hits target without [Break] Gauge → activates [Broken Spirit] and grants [Berserk Strike] to entire team',
                        mechanic: 'ultimateTrigger',
                        condition: 'target has no Break Gauge',
                        effects: {
                            applyBrokenSpirit: true,   // Debuff sur ennemi
                            grantBerserkStrike: true   // Buff team
                        }
                    }
                ],

                selfBuffs: [
                    {
                        name: 'Battle Stance',
                        trigger: 'stage start OR break success',
                        effects: { darkDamage: 20, fierceChargeDamage: 50 },
                        duration: 'infinite',
                        stackable: false
                    },
                    {
                        name: 'Guard Stance',
                        trigger: 'attack on Break Gauge',
                        effects: { damageDealt: 10, breakEffectiveness: 10 },
                        duration: 'infinite',
                        stackable: false
                    },
                    {
                        name: 'Sturdy Shield',
                        trigger: 'Flag of Authority OR Fierce Charge cast',
                        effects: { shield: { type: 'percentHP', value: 30 } },
                        duration: 30,
                        stackable: false
                    }
                ],

                // Team buffs conditionnels (A5)
                teamBuffs: [
                    {
                        name: 'Righteous Spirit',
                        trigger: 'Kihoon tags out',
                        scope: 'team-dark-striker',
                        effects: { weakBreakDamage: true, superArmor: true, mpRestoreOnEnd: 25 },
                        duration: 25,
                        cooldown: 30,
                        stackable: false
                    },
                    {
                        name: 'Berserk Strike',  // NOUVEAU à A5
                        trigger: 'Thrilling Fighting Spirit hits target without Break Gauge',
                        scope: 'team',  // Entire team
                        effects: {
                            critDMG: 30,    // +30% Crit DMG
                            darkDamage: 15  // +15% Dark DMG
                        },
                        duration: 60,
                        stackable: false,
                        note: 'Granted to entire team when Ultimate hits unbreakable target'
                    }
                ],

                // TEAM buffs permanents (Strike Squad Leader - A5)
                // Note: Strike Squad Leader s'applique à la TEAM, pas au RAID entier
                teamBuffs: [
                    {
                        name: 'Strike Squad Leader',  // NOUVEAU à A5
                        trigger: 'Kihoon enters stage',
                        scope: 'team',  // Team only
                        effects: {
                            attack: 10,      // +10% ATK
                            hp: 10,          // +10% HP
                            damageDealt: 10  // +10% DMG dealt
                        },
                        duration: 'infinite',
                        stackable: false,
                        note: 'Permanent TEAM buff when entering stage'
                    }
                ],

                // Debuffs (A5)
                debuffs: [
                    {
                        name: 'Weakened Fighting Spirit',
                        trigger: 'Flag of Authority zone',
                        target: 'enemy',
                        effects: { attack: -12.5, darkDamageTaken: 10 },
                        duration: 30
                    },
                    {
                        name: 'Broken Spirit',  // NOUVEAU à A5
                        trigger: 'Thrilling Fighting Spirit hits target without Break Gauge',
                        target: 'enemy',
                        effects: {
                            attack: -12.5,              // -12.5% ATK
                            critHitChanceReceived: 15   // +15% chance to receive Critical Hit damage
                        },
                        duration: 60,
                        stackable: false,
                        note: 'Applied when Ultimate hits unbreakable target'
                    }
                ]
            }
        }
    },

    // 🏹 LIM TAE-GYU - Breaker Dark ATK Scaler (Magic Boost Specialist)
    lim: {
        id: 'lim',
        name: 'Lim Tae-Gyu',
        class: 'Breaker Dark ATK Scaler',
        element: 'Dark',
        scaleStat: 'ATK',
        primaryRole: 'Breaker',
        secondaryRole: 'Rapid Core Attack Looper / Team Buffer',
        tags: ['Magic Boost', 'Core Attack Spam', 'Team TC/DCC Buffer', 'Sniper Mode', 'ATK Stacking'],

        // =================================================================
        // ADVANCEMENT 0 (A0) - BASE PASSIVE - MAGIC BOOST
        // =================================================================
        advancements: {
            A0: {
                // Passives permanents
                passives: [
                    {
                        name: 'Airborne Burst Trigger',
                        description: 'When Airborne Burst is used → applies [Magic Boost] effect',
                        mechanic: 'skillTrigger',
                        trigger: 'airborneBurst'
                    }
                ],

                // Buffs personnels (self)
                selfBuffs: [
                    {
                        name: 'Magic Boost',
                        trigger: 'Airborne Burst cast',
                        effects: {
                            magicArrows: {
                                onSkillHit: 3,      // Fire 3 Magic Arrows when skill hits
                                onBasicAttack: 2,   // Fire 2 Magic Arrows when Basic Attack hits
                                damagePerArrow: 1050  // 1050% ATK per arrow
                            },
                            coreAttackDamage: 30,      // +30% Core Attack DMG
                            typhoonFireDamage: 30,     // +30% Typhoon Fire DMG
                            quickFireDamage: 30        // +30% Quick Fire: Typhoon Fire DMG
                        },
                        duration: 15,  // 15 seconds
                        stackable: false,
                        note: 'Massive damage boost from Magic Arrows + skill damage increases'
                    }
                ],

                // Pas de buffs team/raid/debuffs à A0
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            },

            // =================================================================
            // ADVANCEMENT 1 (A1) - SHOOT AND MANEUVER ENHANCED + TEAM TC/DCC BUFFS
            // =================================================================
            A1: {
                passives: [
                    {
                        name: 'Airborne Burst Trigger',
                        mechanic: 'skillTrigger',
                        trigger: 'airborneBurst'
                    },
                    {
                        name: 'Shoot and Maneuver Enhanced',  // NOUVEAU à A1
                        description: 'Shoot and Maneuver speed and damage increase by 25%, can be used up to 3 times',
                        mechanic: 'skillEnhancement',
                        skill: 'shootAndManeuver',
                        speedIncrease: 25,     // +25% speed
                        damageIncrease: 25,    // +25% damage
                        maxUses: 3             // Can use 3 times (up from 2)
                    },
                    {
                        name: 'Team TC/DCC Buff Trigger',  // NOUVEAU à A1
                        description: 'Using Volley Fire or Quick Attack: Typhoon Fire → increases team TC/DCC',
                        mechanic: 'teamBuff',
                        trigger: 'volleyFireOrQuickAttackCast'
                    }
                ],

                selfBuffs: [
                    {
                        name: 'Magic Boost',
                        trigger: 'Airborne Burst cast',
                        effects: {
                            magicArrows: {
                                onSkillHit: 3,
                                onBasicAttack: 2,
                                damagePerArrow: 1050
                            },
                            coreAttackDamage: 30,
                            typhoonFireDamage: 30,
                            quickFireDamage: 30
                        },
                        duration: 15,
                        stackable: false
                    }
                ],

                // NOUVEAU à A1 : Team buffs conditionnels stacking
                teamBuffs: [
                    {
                        name: 'Precision & Power',
                        trigger: 'Volley Fire OR Quick Attack: Typhoon Fire cast',
                        scope: 'team',  // All team members (3 hunters)
                        effects: {
                            critRatePerStack: 0.7,   // +0.7% TC per stack
                            critDMGPerStack: 1,      // +1% DCC per stack
                            maxStacks: 8,
                            totalBonus: {
                                critRate: 5.6,       // 0.7% × 8 = +5.6% TC
                                critDMG: 8           // 1% × 8 = +8% DCC
                            }
                        },
                        duration: 10,  // 10s duration
                        stackable: true,
                        note: 'Stacks up quickly with rapid Core Attack spam!'
                    }
                ],

                raidBuffs: [],
                debuffs: []
            },

            // =================================================================
            // ADVANCEMENT 2 (A2) - BREAK EFFECTIVENESS BOOST
            // =================================================================
            A2: {
                passives: [
                    {
                        name: 'Airborne Burst Trigger',
                        mechanic: 'skillTrigger'
                    },
                    {
                        name: 'Shoot and Maneuver Enhanced',
                        mechanic: 'skillEnhancement'
                    },
                    {
                        name: 'Team TC/DCC Buff Trigger',
                        mechanic: 'teamBuff'
                    },
                    {
                        name: 'Enhanced Break Effectiveness',  // NOUVEAU à A2
                        description: 'Increases [Break] effectiveness by 20%',
                        mechanic: 'breakEffectiveness',
                        amount: 20  // +20% Break effectiveness (permanent)
                    }
                ],

                selfBuffs: [
                    {
                        name: 'Magic Boost',
                        trigger: 'Airborne Burst cast',
                        effects: {
                            magicArrows: { onSkillHit: 3, onBasicAttack: 2, damagePerArrow: 1050 },
                            coreAttackDamage: 30,
                            typhoonFireDamage: 30,
                            quickFireDamage: 30
                        },
                        duration: 15,
                        stackable: false
                    }
                ],

                teamBuffs: [
                    {
                        name: 'Precision & Power',
                        trigger: 'Volley Fire OR Quick Attack: Typhoon Fire cast',
                        scope: 'team',
                        effects: {
                            critRatePerStack: 0.7,
                            critDMGPerStack: 1,
                            maxStacks: 8,
                            totalBonus: { critRate: 5.6, critDMG: 8 }
                        },
                        duration: 10,
                        stackable: true
                    }
                ],

                raidBuffs: [],
                debuffs: []
            },

            // =================================================================
            // ADVANCEMENT 3 (A3) - MAGIC BOOST ENHANCED + SHOOT AND MANEUVER TRIGGERS + CRIT DEBUFF
            // =================================================================
            A3: {
                passives: [
                    {
                        name: 'Airborne Burst Trigger',
                        mechanic: 'skillTrigger'
                    },
                    {
                        name: 'Shoot and Maneuver Enhanced',
                        mechanic: 'skillEnhancement'
                    },
                    {
                        name: 'Team TC/DCC Buff Trigger',
                        mechanic: 'teamBuff'
                    },
                    {
                        name: 'Enhanced Break Effectiveness',
                        amount: 20
                    },
                    {
                        name: 'Shoot and Maneuver Magic Boost Trigger',  // NOUVEAU à A3
                        description: 'Using Shoot and Maneuver → grants [Magic Boost] effect (CD: 15s)',
                        mechanic: 'skillTrigger',
                        trigger: 'shootAndManeuver',
                        effect: 'Magic Boost',
                        cooldown: 15  // 15s cooldown
                    }
                ],

                selfBuffs: [
                    {
                        name: 'Magic Boost',  // ENHANCED à A3
                        trigger: 'Airborne Burst OR Shoot and Maneuver cast',
                        effects: {
                            magicArrows: { onSkillHit: 3, onBasicAttack: 2, damagePerArrow: 1050 },
                            coreAttackDamage: 30,      // +30% Core Attack DMG (base)
                            typhoonFireDamage: 30,     // +30% Typhoon Fire DMG (base)
                            quickFireDamage: 30,       // +30% Quick Fire DMG (base)
                            // ENHANCED damage à A3 quand Magic Boost actif
                            volleyFireDamageBoost: 80,    // +80% Volley Fire DMG (A3+)
                            typhoonFireDamageBoost: 80,   // +80% Typhoon Fire DMG (A3+)
                            quickFireDamageBoost: 80      // +80% Quick Fire: Typhoon Fire DMG (A3+)
                        },
                        duration: 15,
                        stackable: false,
                        note: 'A3+ : Total damage boost = 30% (base) + 80% (A3) = +110% for Volley Fire/Typhoon Fire/Quick Fire!'
                    }
                ],

                teamBuffs: [
                    {
                        name: 'Precision & Power',
                        trigger: 'Volley Fire OR Quick Attack: Typhoon Fire cast',
                        scope: 'team',
                        effects: {
                            critRatePerStack: 0.7,
                            critDMGPerStack: 1,
                            maxStacks: 8,
                            totalBonus: { critRate: 5.6, critDMG: 8 }
                        },
                        duration: 10,
                        stackable: true
                    }
                ],

                raidBuffs: [],

                // NOUVEAU à A3 : Debuff Crit DMG received
                debuffs: [
                    {
                        name: 'Vulnerable to Criticals',
                        trigger: 'Typhoon Fire hit',
                        target: 'enemy',
                        effects: {
                            critHitDamageReceived: 7  // +7% Critical Hit damage received
                        },
                        duration: 12,
                        stackable: false,
                        note: 'Enemy takes +7% more damage from Critical Hits'
                    }
                ]
            },

            // =================================================================
            // ADVANCEMENT 4 (A4) - PERSONAL ATK BOOST
            // =================================================================
            A4: {
                passives: [
                    {
                        name: 'Airborne Burst Trigger',
                        mechanic: 'skillTrigger'
                    },
                    {
                        name: 'Shoot and Maneuver Enhanced',
                        mechanic: 'skillEnhancement'
                    },
                    {
                        name: 'Team TC/DCC Buff Trigger',
                        mechanic: 'teamBuff'
                    },
                    {
                        name: 'Enhanced Break Effectiveness',
                        amount: 20
                    },
                    {
                        name: 'Shoot and Maneuver Magic Boost Trigger',
                        mechanic: 'skillTrigger',
                        cooldown: 15
                    },
                    {
                        name: 'Personal ATK Boost',  // NOUVEAU à A4
                        description: 'Increases user\'s ATK by 12%',
                        mechanic: 'personalBuff',
                        attack: 12  // +12% ATK (permanent)
                    }
                ],

                selfBuffs: [
                    {
                        name: 'Magic Boost',
                        trigger: 'Airborne Burst OR Shoot and Maneuver cast',
                        effects: {
                            magicArrows: { onSkillHit: 3, onBasicAttack: 2, damagePerArrow: 1050 },
                            coreAttackDamage: 30,
                            typhoonFireDamage: 30,
                            quickFireDamage: 30,
                            volleyFireDamageBoost: 80,
                            typhoonFireDamageBoost: 80,
                            quickFireDamageBoost: 80
                        },
                        duration: 15,
                        stackable: false
                    }
                ],

                teamBuffs: [
                    {
                        name: 'Precision & Power',
                        trigger: 'Volley Fire OR Quick Attack: Typhoon Fire cast',
                        scope: 'team',
                        effects: {
                            critRatePerStack: 0.7,
                            critDMGPerStack: 1,
                            maxStacks: 8,
                            totalBonus: { critRate: 5.6, critDMG: 8 }
                        },
                        duration: 10,
                        stackable: true
                    }
                ],

                raidBuffs: [],

                debuffs: [
                    {
                        name: 'Vulnerable to Criticals',
                        trigger: 'Typhoon Fire hit',
                        target: 'enemy',
                        effects: { critHitDamageReceived: 7 },
                        duration: 12,
                        stackable: false
                    }
                ]
            },

            // =================================================================
            // ADVANCEMENT 5 (A5) - POWER GAUGE START + VOLLEY FIRE ATK STACKING
            // =================================================================
            A5: {
                passives: [
                    {
                        name: 'Airborne Burst Trigger',
                        mechanic: 'skillTrigger'
                    },
                    {
                        name: 'Shoot and Maneuver Enhanced',
                        mechanic: 'skillEnhancement'
                    },
                    {
                        name: 'Team TC/DCC Buff Trigger',
                        mechanic: 'teamBuff'
                    },
                    {
                        name: 'Enhanced Break Effectiveness',
                        amount: 20
                    },
                    {
                        name: 'Shoot and Maneuver Magic Boost Trigger',
                        mechanic: 'skillTrigger',
                        cooldown: 15
                    },
                    {
                        name: 'Personal ATK Boost',
                        attack: 12
                    },
                    {
                        name: 'Power Gauge Charge on Stage Start',  // NOUVEAU à A5
                        description: 'When user enters a stage → Power Gauge charges by 100%',
                        mechanic: 'stageStart',
                        powerGaugeCharge: 100  // 100% Power Gauge on start
                    }
                ],

                selfBuffs: [
                    {
                        name: 'Magic Boost',
                        trigger: 'Airborne Burst OR Shoot and Maneuver cast',
                        effects: {
                            magicArrows: { onSkillHit: 3, onBasicAttack: 2, damagePerArrow: 1050 },
                            coreAttackDamage: 30,
                            typhoonFireDamage: 30,
                            quickFireDamage: 30,
                            volleyFireDamageBoost: 80,
                            typhoonFireDamageBoost: 80,
                            quickFireDamageBoost: 80
                        },
                        duration: 15,
                        stackable: false
                    },
                    {
                        name: 'Relentless Assault',  // NOUVEAU à A5
                        trigger: 'Volley Fire hits',
                        effects: {
                            attackPerStack: 4,   // +4% ATK per stack
                            maxStacks: 30,
                            totalBonus: {
                                attack: 120      // 4% × 30 = +120% ATK
                            }
                        },
                        duration: 'infinite',
                        stackable: true,
                        note: 'A5 : Max 30 stacks = +120% ATK! Combined with A4 +12% = +132% ATK total!'
                    }
                ],

                teamBuffs: [
                    {
                        name: 'Precision & Power',
                        trigger: 'Volley Fire OR Quick Attack: Typhoon Fire cast',
                        scope: 'team',
                        effects: {
                            critRatePerStack: 0.7,
                            critDMGPerStack: 1,
                            maxStacks: 8,
                            totalBonus: { critRate: 5.6, critDMG: 8 }
                        },
                        duration: 10,
                        stackable: true
                    }
                ],

                raidBuffs: [],

                debuffs: [
                    {
                        name: 'Vulnerable to Criticals',
                        trigger: 'Typhoon Fire hit',
                        target: 'enemy',
                        effects: { critHitDamageReceived: 7 },
                        duration: 12,
                        stackable: false
                    }
                ]
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔥 FERN - DPS Mage Fire (Frieren collab)
    // ═══════════════════════════════════════════════════════════════
    fern: {
        id: 'fern',
        name: 'Fern',
        class: 'Mage',
        element: 'Fire',
        scaleStat: 'ATK',
        primaryRole: 'DPS',
        secondaryRole: 'Fire Debuffer',
        tags: ['Zoltraak Spammer', 'Boss Killer', 'Fire Vuln Stacker', 'Crit Scaler'],

        advancements: {
            // =================================================================
            // A0 - Magical Prodigy + Mana Power Tracking (permanent)
            // =================================================================
            A0: {
                passives: [
                    {
                        name: 'Basic Attack Chain',
                        description: 'Basic Attack → Stage 1, 2, 3 consécutifs. Stage 3 → active Core Attack.',
                        mechanic: 'chain'
                    },
                    {
                        name: 'Magical Prodigy',
                        description: '+10% ATK permanent. Si MP ≥ 50% → +10% ATK supplémentaire. -5% Mana Consumption.',
                        mechanic: 'permanent',
                        duration: 'infinite'
                    },
                    {
                        name: 'Mana Power Tracking',
                        description: '+30% DMG vs Boss. +5% Precision.',
                        mechanic: 'permanent',
                        duration: 'infinite'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Magical Prodigy - ATK',
                        effects: { atkPercent: 10 },
                        duration: 'infinite',
                        condition: 'always'
                    },
                    {
                        name: 'Magical Prodigy - ATK (MP ≥ 50%)',
                        effects: { atkPercent: 10 },
                        duration: 'infinite',
                        condition: 'mp >= 50%'
                    },
                    {
                        name: 'Mana Power Tracking - Boss DMG',
                        effects: { bossDamage: 30 },
                        duration: 'infinite',
                        condition: 'always'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            },

            // =================================================================
            // A1 - Basic Quick Shot + Basic Focus + Enhanced Magical Prodigy/Mana Power Tracking
            // =================================================================
            A1: {
                passives: [
                    {
                        name: 'Basic Attack Chain',
                        description: 'Basic Attack → Stage 1, 2, 3 consécutifs. Stage 3 → active Core Attack.',
                        mechanic: 'chain'
                    },
                    {
                        name: 'Basic Quick Shot',
                        description: 'Augmente Attack Speed de BA, Core, Skill 1, Skill 2. Skill 1/2 → active Core Attack. Core/Skill 1/2 → -25% CD Skill 1 et Skill 2.',
                        mechanic: 'permanent',
                        duration: 'infinite'
                    },
                    {
                        name: 'Magical Prodigy (Enhanced)',
                        description: '+20% ATK permanent. Si MP ≥ 50% → +20% ATK supplémentaire. -10% Mana Consumption.',
                        mechanic: 'permanent',
                        duration: 'infinite'
                    },
                    {
                        name: 'Mana Power Tracking (Enhanced)',
                        description: '+60% DMG vs Boss. +10% Precision.',
                        mechanic: 'permanent',
                        duration: 'infinite'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Magical Prodigy (Enhanced) - ATK',
                        effects: { atkPercent: 20 },
                        duration: 'infinite',
                        condition: 'always'
                    },
                    {
                        name: 'Magical Prodigy (Enhanced) - ATK (MP ≥ 50%)',
                        effects: { atkPercent: 20 },
                        duration: 'infinite',
                        condition: 'mp >= 50%'
                    },
                    {
                        name: 'Mana Power Tracking (Enhanced) - Boss DMG',
                        effects: { bossDamage: 60 },
                        duration: 'infinite',
                        condition: 'always'
                    },
                    {
                        name: 'Basic Focus',
                        description: 'Skill 1/2 → +25% Basic Skill DMG, +12% MP Consumption',
                        effects: { basicSkillDamage: 25 },
                        duration: 20,
                        maxStacks: 4,
                        trigger: 'Skill 1 or Skill 2 cast'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            },

            // =================================================================
            // A2 - +20% Fire DMG + Fire Damage Taken Increase (debuff ennemi)
            // =================================================================
            A2: {
                passives: [
                    {
                        name: 'Basic Attack Chain',
                        description: 'Basic Attack → Stage 1, 2, 3 consécutifs. Stage 3 → active Core Attack.',
                        mechanic: 'chain'
                    },
                    {
                        name: 'Basic Quick Shot',
                        description: 'Augmente Attack Speed. Skill 1/2 → Core Attack. Core/Skill 1/2 → -25% CD.',
                        mechanic: 'permanent',
                        duration: 'infinite'
                    },
                    {
                        name: 'Magical Prodigy (Enhanced)',
                        description: '+20% ATK. Si MP ≥ 50% → +20% ATK. -10% Mana Consumption.',
                        mechanic: 'permanent',
                        duration: 'infinite'
                    },
                    {
                        name: 'Mana Power Tracking (Enhanced)',
                        description: '+60% DMG vs Boss. +10% Precision.',
                        mechanic: 'permanent',
                        duration: 'infinite'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Magical Prodigy (Enhanced) - ATK',
                        effects: { atkPercent: 20 },
                        duration: 'infinite',
                        condition: 'always'
                    },
                    {
                        name: 'Magical Prodigy (Enhanced) - ATK (MP ≥ 50%)',
                        effects: { atkPercent: 20 },
                        duration: 'infinite',
                        condition: 'mp >= 50%'
                    },
                    {
                        name: 'Mana Power Tracking (Enhanced) - Boss DMG',
                        effects: { bossDamage: 60 },
                        duration: 'infinite',
                        condition: 'always'
                    },
                    {
                        name: 'Basic Focus',
                        effects: { basicSkillDamage: 25 },
                        duration: 20,
                        maxStacks: 4,
                        trigger: 'Skill 1 or Skill 2 cast'
                    },
                    {
                        name: 'Fire DMG Boost (A2)',
                        effects: { fireDamage: 20 },
                        duration: 'infinite',
                        condition: 'always'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Fire Damage Taken Increase',
                        trigger: 'Skill 2 (Zoltraak - Rapid Fire) hit',
                        target: 'enemy',
                        effects: { fireDamageReceived: 0.3 },
                        duration: 30,
                        maxStacks: 60,
                        stackable: true,
                        note: 'Max 60 stacks × 0.3% = +18% Fire DMG received par l\'ennemi'
                    }
                ]
            },

            // =================================================================
            // A3 - True Sight (TC+DCC) + Dispel/Defense Magic on tag-in
            // =================================================================
            A3: {
                passives: [
                    {
                        name: 'Basic Attack Chain',
                        description: 'Basic Attack → Stage 1, 2, 3. Stage 3 → Core Attack.',
                        mechanic: 'chain'
                    },
                    {
                        name: 'Basic Quick Shot',
                        description: 'Augmente Attack Speed. Skill 1/2 → Core Attack. Core/Skill 1/2 → -25% CD.',
                        mechanic: 'permanent',
                        duration: 'infinite'
                    },
                    {
                        name: 'Magical Prodigy (Enhanced)',
                        description: '+20% ATK. Si MP ≥ 50% → +20% ATK. -10% Mana Consumption.',
                        mechanic: 'permanent',
                        duration: 'infinite'
                    },
                    {
                        name: 'Mana Power Tracking (Enhanced)',
                        description: '+60% DMG vs Boss. +10% Precision.',
                        mechanic: 'permanent',
                        duration: 'infinite'
                    },
                    {
                        name: 'True Sight',
                        description: '+5% TC, +10% DCC permanent.',
                        mechanic: 'permanent',
                        duration: 'infinite'
                    },
                    {
                        name: 'Dispel Magic + Defense Magic',
                        description: 'Tag-in → Removes team debuffs + Shield (20% Fern ATK) + -20% DMG taken pour 20s. CD: 10s.',
                        mechanic: 'tagIn',
                        cooldown: 10
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Magical Prodigy (Enhanced) - ATK',
                        effects: { atkPercent: 20 },
                        duration: 'infinite',
                        condition: 'always'
                    },
                    {
                        name: 'Magical Prodigy (Enhanced) - ATK (MP ≥ 50%)',
                        effects: { atkPercent: 20 },
                        duration: 'infinite',
                        condition: 'mp >= 50%'
                    },
                    {
                        name: 'Mana Power Tracking (Enhanced) - Boss DMG',
                        effects: { bossDamage: 60 },
                        duration: 'infinite',
                        condition: 'always'
                    },
                    {
                        name: 'Basic Focus',
                        effects: { basicSkillDamage: 25 },
                        duration: 20,
                        maxStacks: 4,
                        trigger: 'Skill 1 or Skill 2 cast'
                    },
                    {
                        name: 'Fire DMG Boost (A2)',
                        effects: { fireDamage: 20 },
                        duration: 'infinite',
                        condition: 'always'
                    },
                    {
                        name: 'True Sight',
                        effects: { critRate: 5, critDMG: 10 },
                        duration: 'infinite',
                        condition: 'always'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Dispel Magic',
                        description: 'Tag-in → Removes debuffs de toute la team',
                        trigger: 'tagIn',
                        cooldown: 10,
                        effects: { debuffCleanse: true }
                    },
                    {
                        name: 'Defense Magic',
                        description: 'Tag-in → Shield (20% Fern ATK) + -20% DMG taken',
                        trigger: 'tagIn',
                        cooldown: 10,
                        effects: { shieldPercent: 20, damageReduction: 20 },
                        duration: 20
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Fire Damage Taken Increase',
                        trigger: 'Skill 2 hit',
                        target: 'enemy',
                        effects: { fireDamageReceived: 0.3 },
                        duration: 30,
                        maxStacks: 60,
                        stackable: true,
                        note: 'Max 60 × 0.3% = +18% Fire DMG received'
                    }
                ]
            },

            // =================================================================
            // A4 - +10% TC +20% DCC perso + Fire Vuln 0.3% → 0.5%
            // =================================================================
            A4: {
                passives: [
                    {
                        name: 'Basic Attack Chain',
                        description: 'Basic Attack → Stage 1, 2, 3. Stage 3 → Core Attack.',
                        mechanic: 'chain'
                    },
                    {
                        name: 'Basic Quick Shot',
                        description: 'Augmente Attack Speed. Skill 1/2 → Core Attack. Core/Skill 1/2 → -25% CD.',
                        mechanic: 'permanent',
                        duration: 'infinite'
                    },
                    {
                        name: 'Magical Prodigy (Enhanced)',
                        description: '+20% ATK. Si MP ≥ 50% → +20% ATK. -10% Mana Consumption.',
                        mechanic: 'permanent',
                        duration: 'infinite'
                    },
                    {
                        name: 'Mana Power Tracking (Enhanced)',
                        description: '+60% DMG vs Boss. +10% Precision.',
                        mechanic: 'permanent',
                        duration: 'infinite'
                    },
                    {
                        name: 'True Sight (A3)',
                        description: '+5% TC, +10% DCC permanent.',
                        mechanic: 'permanent',
                        duration: 'infinite'
                    },
                    {
                        name: 'A4 Crit Boost',
                        description: '+10% TC, +20% DCC en plus.',
                        mechanic: 'permanent'
                    },
                    {
                        name: 'Dispel Magic + Defense Magic',
                        description: 'Tag-in → Debuff cleanse + Shield + -20% DMG taken. CD: 10s.',
                        mechanic: 'tagIn',
                        cooldown: 10
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Magical Prodigy (Enhanced) - ATK',
                        effects: { atkPercent: 20 },
                        duration: 'infinite',
                        condition: 'always'
                    },
                    {
                        name: 'Magical Prodigy (Enhanced) - ATK (MP ≥ 50%)',
                        effects: { atkPercent: 20 },
                        duration: 'infinite',
                        condition: 'mp >= 50%'
                    },
                    {
                        name: 'Mana Power Tracking (Enhanced) - Boss DMG',
                        effects: { bossDamage: 60 },
                        duration: 'infinite',
                        condition: 'always'
                    },
                    {
                        name: 'Basic Focus',
                        effects: { basicSkillDamage: 25 },
                        duration: 20,
                        maxStacks: 4,
                        trigger: 'Skill 1 or Skill 2 cast'
                    },
                    {
                        name: 'Fire DMG Boost (A2)',
                        effects: { fireDamage: 20 },
                        duration: 'infinite',
                        condition: 'always'
                    },
                    {
                        name: 'True Sight (A3) + A4 Crit Boost',
                        effects: { critRate: 15, critDMG: 30 },
                        duration: 'infinite',
                        condition: 'always',
                        note: 'True Sight (5%TC+10%DCC) + A4 (+10%TC+20%DCC) = 15%TC+30%DCC'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Dispel Magic',
                        trigger: 'tagIn',
                        cooldown: 10,
                        effects: { debuffCleanse: true }
                    },
                    {
                        name: 'Defense Magic',
                        trigger: 'tagIn',
                        cooldown: 10,
                        effects: { shieldPercent: 20, damageReduction: 20 },
                        duration: 20
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Fire Damage Taken Increase (Enhanced)',
                        trigger: 'Skill 2 hit',
                        target: 'enemy',
                        effects: { fireDamageReceived: 0.5 },
                        duration: 30,
                        maxStacks: 60,
                        stackable: true,
                        note: 'A4: 0.3% → 0.5% par stack. Max 60 × 0.5% = +30% Fire DMG received !'
                    }
                ]
            },

            // =================================================================
            // A5 - True Sight Enhanced + Seismic Alert → Seeker's Gaze (burst phase)
            // Ultimate ignores element for Fire weakness
            // =================================================================
            A5: {
                passives: [
                    {
                        name: 'Basic Attack Chain',
                        description: 'Basic Attack → Stage 1, 2, 3. Stage 3 → Core Attack.',
                        mechanic: 'chain'
                    },
                    {
                        name: 'Basic Quick Shot',
                        description: 'Augmente Attack Speed. Skill 1/2 → Core Attack. Core/Skill 1/2 → -25% CD.',
                        mechanic: 'permanent',
                        duration: 'infinite'
                    },
                    {
                        name: 'Magical Prodigy (Enhanced)',
                        description: '+20% ATK. Si MP ≥ 50% → +20% ATK. -10% Mana Consumption.',
                        mechanic: 'permanent',
                        duration: 'infinite'
                    },
                    {
                        name: 'Mana Power Tracking (Enhanced)',
                        description: '+60% DMG vs Boss. +10% Precision.',
                        mechanic: 'permanent',
                        duration: 'infinite'
                    },
                    {
                        name: 'True Sight (Enhanced A5)',
                        description: '+10% TC, +20% DCC permanent. Skill 1/2 hit → Seismic Alert.',
                        mechanic: 'permanent',
                        duration: 'infinite'
                    },
                    {
                        name: 'A4 Crit Boost',
                        description: '+10% TC, +20% DCC en plus.',
                        mechanic: 'permanent'
                    },
                    {
                        name: 'Seismic Alert → Seeker\'s Gaze',
                        description: 'Skill 1/2 hit → +10% Fire DMG (5s, max 6 stacks). À 6 stacks → Seeker\'s Gaze: +60% Fire DMG +10% Def Pen pendant 20s.',
                        mechanic: 'stacking',
                        maxStacks: 6
                    },
                    {
                        name: 'Fire Weakness Override',
                        description: 'Ultimate → Fire weakness hit quel que soit l\'élément de la cible.',
                        mechanic: 'ultimate'
                    },
                    {
                        name: 'Dispel Magic + Defense Magic',
                        description: 'Tag-in → Debuff cleanse + Shield + -20% DMG taken. CD: 10s.',
                        mechanic: 'tagIn',
                        cooldown: 10
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Magical Prodigy (Enhanced) - ATK',
                        effects: { atkPercent: 20 },
                        duration: 'infinite',
                        condition: 'always'
                    },
                    {
                        name: 'Magical Prodigy (Enhanced) - ATK (MP ≥ 50%)',
                        effects: { atkPercent: 20 },
                        duration: 'infinite',
                        condition: 'mp >= 50%'
                    },
                    {
                        name: 'Mana Power Tracking (Enhanced) - Boss DMG',
                        effects: { bossDamage: 60 },
                        duration: 'infinite',
                        condition: 'always'
                    },
                    {
                        name: 'Basic Focus',
                        effects: { basicSkillDamage: 25 },
                        duration: 20,
                        maxStacks: 4,
                        trigger: 'Skill 1 or Skill 2 cast'
                    },
                    {
                        name: 'Fire DMG Boost (A2)',
                        effects: { fireDamage: 20 },
                        duration: 'infinite',
                        condition: 'always'
                    },
                    {
                        name: 'True Sight (Enhanced A5) + A4 Crit Boost',
                        effects: { critRate: 20, critDMG: 40 },
                        duration: 'infinite',
                        condition: 'always',
                        note: 'True Sight A5 (10%TC+20%DCC) + A4 (+10%TC+20%DCC) = 20%TC+40%DCC'
                    },
                    {
                        name: 'Seismic Alert',
                        effects: { fireDamage: 10 },
                        duration: 5,
                        maxStacks: 6,
                        trigger: 'Skill 1 or Skill 2 hit',
                        note: 'Max 6 × 10% = +60% Fire DMG (pendant 5s par stack)'
                    },
                    {
                        name: 'Seeker\'s Gaze',
                        description: 'Quand Seismic Alert atteint 6 stacks → burst mode',
                        effects: { fireDamage: 60, defPen: 10 },
                        duration: 20,
                        trigger: 'Seismic Alert × 6 stacks',
                        note: 'Remplace Seismic Alert. +60% Fire DMG +10% Def Pen pendant 20s !'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Dispel Magic',
                        trigger: 'tagIn',
                        cooldown: 10,
                        effects: { debuffCleanse: true }
                    },
                    {
                        name: 'Defense Magic',
                        trigger: 'tagIn',
                        cooldown: 10,
                        effects: { shieldPercent: 20, damageReduction: 20 },
                        duration: 20
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Fire Damage Taken Increase (Enhanced)',
                        trigger: 'Skill 2 hit',
                        target: 'enemy',
                        effects: { fireDamageReceived: 0.5 },
                        duration: 30,
                        maxStacks: 60,
                        stackable: true,
                        note: 'Max 60 × 0.5% = +30% Fire DMG received par l\'ennemi'
                    }
                ]
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔥 GINA - Support Fire (ATK scaling)
    // ═══════════════════════════════════════════════════════════════
    gina: {
        id: 'gina',
        name: 'Gina',
        class: 'Supporter',
        element: 'Fire',
        scaleStat: 'ATK',
        primaryRole: 'Support',
        secondaryRole: 'Buffer / Healer',
        tags: ['Team Buffer', 'Fire DMG Amplifier', 'Healer', 'Gravity Control', 'Def Pen Buffer'],

        advancements: {
            // A0 - Countercurrent → Mana Circulation + Body Retrograde
            A0: {
                passives: [
                    {
                        name: 'Countercurrent → Mana Circulation',
                        description: 'Skills → stack Countercurrent (5 max). 5 stacks → Mana Circulation team: +15% ATK +15% Fire DMG (15s).',
                        mechanic: 'stacking',
                        maxStacks: 5
                    },
                    {
                        name: 'Body Retrograde',
                        description: 'Gravitational Field → team heal (2% ATK/3s) + Power Gauge +2%/3s (15s).',
                        mechanic: 'onFieldCreation',
                        duration: 15
                    }
                ],
                selfBuffs: [],
                teamBuffs: [
                    {
                        name: 'Mana Circulation',
                        trigger: 'Countercurrent ×5',
                        effects: { atkPercent: 15, fireDamage: 15 },
                        duration: 15,
                        note: '+15% ATK + 15% Fire DMG pour toute la team (15s)'
                    },
                    {
                        name: 'Body Retrograde - Heal',
                        trigger: 'Gravitational Field creation',
                        effects: { healPerTick: 2, powerGaugePerTick: 2 },
                        tickInterval: 3,
                        duration: 15
                    }
                ],
                raidBuffs: [],
                debuffs: []
            },

            // A1 - Mana Transformation (Shield + DMG dealt + DMG reduction)
            A1: {
                passives: [
                    { name: 'Countercurrent → Mana Circulation', mechanic: 'stacking', maxStacks: 5 },
                    { name: 'Body Retrograde', mechanic: 'onFieldCreation', duration: 15 }
                ],
                selfBuffs: [],
                teamBuffs: [
                    {
                        name: 'Mana Circulation',
                        trigger: 'Countercurrent ×5',
                        effects: { atkPercent: 15, fireDamage: 15 },
                        duration: 15
                    },
                    {
                        name: 'Mana Transformation',
                        trigger: 'Mana Circulation activation',
                        effects: { shieldPercent: 12, damageDealt: 12, damageReduction: 12 },
                        duration: 20,
                        note: 'Shield 12% ATK + +12% DMG dealt + -12% DMG taken (20s)'
                    },
                    {
                        name: 'Body Retrograde - Heal',
                        trigger: 'Gravitational Field creation',
                        effects: { healPerTick: 2, powerGaugePerTick: 2 },
                        tickInterval: 3,
                        duration: 15
                    }
                ],
                raidBuffs: [],
                debuffs: []
            },

            // A2 - +20% Shield value + Shield → +10% DMG dealt
            A2: {
                passives: [
                    { name: 'Countercurrent → Mana Circulation', mechanic: 'stacking', maxStacks: 5 },
                    { name: 'Body Retrograde', mechanic: 'onFieldCreation', duration: 15 },
                    { name: 'Shield Enhancement (A2)', description: '+20% Shield value. Shield actif → +10% DMG dealt.', mechanic: 'permanent' }
                ],
                selfBuffs: [],
                teamBuffs: [
                    {
                        name: 'Mana Circulation',
                        trigger: 'Countercurrent ×5',
                        effects: { atkPercent: 15, fireDamage: 15 },
                        duration: 15
                    },
                    {
                        name: 'Mana Transformation (Enhanced A2)',
                        trigger: 'Mana Circulation activation',
                        effects: { shieldPercent: 14.4, damageDealt: 22, damageReduction: 12 },
                        duration: 20,
                        note: 'Shield 12%×1.2=14.4% + DMG dealt 12%+10%(shield)=22% + -12% DMG taken'
                    },
                    {
                        name: 'Body Retrograde - Heal',
                        trigger: 'Gravitational Field creation',
                        effects: { healPerTick: 2, powerGaugePerTick: 2 },
                        tickInterval: 3,
                        duration: 15
                    }
                ],
                raidBuffs: [],
                debuffs: []
            },

            // A3 - Gravitational Mass → Gravitational Field + Gravity Boost (+10% Fire DMG taken)
            A3: {
                passives: [
                    { name: 'Countercurrent → Mana Circulation', mechanic: 'stacking', maxStacks: 5 },
                    { name: 'Body Retrograde', mechanic: 'onFieldCreation', duration: 15 },
                    { name: 'Shield Enhancement (A2)', mechanic: 'permanent' },
                    { name: 'Gravitational Mass → Gravitational Field (A3)', description: 'Crée Gravitational Field (20% DMG) + Gravity Boost debuff + Halt.', mechanic: 'onSkillCast' }
                ],
                selfBuffs: [],
                teamBuffs: [
                    { name: 'Mana Circulation', trigger: 'Countercurrent ×5', effects: { atkPercent: 15, fireDamage: 15 }, duration: 15 },
                    { name: 'Mana Transformation (Enhanced A2)', trigger: 'Mana Circulation activation', effects: { shieldPercent: 14.4, damageDealt: 22, damageReduction: 12 }, duration: 20 },
                    { name: 'Body Retrograde - Heal', trigger: 'Gravitational Field creation', effects: { healPerTick: 2, powerGaugePerTick: 2 }, tickInterval: 3, duration: 15 }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Gravity Boost',
                        trigger: 'Gravitational Mass hit',
                        target: 'enemy',
                        effects: { fireDamageReceived: 10 },
                        duration: 20,
                        stackable: false,
                        note: '+10% Fire DMG taken par l\'ennemi (20s)'
                    },
                    {
                        name: 'Halt',
                        trigger: 'Enemy touches Gravitational Field',
                        target: 'enemy',
                        effects: { interrupt: true },
                        duration: 3,
                        cooldown: 20
                    }
                ]
            },

            // A4 - +4% Def Pen ALL team + +4% Def Pen Fire members
            A4: {
                passives: [
                    { name: 'Countercurrent → Mana Circulation', mechanic: 'stacking', maxStacks: 5 },
                    { name: 'Body Retrograde', mechanic: 'onFieldCreation', duration: 15 },
                    { name: 'Shield Enhancement (A2)', mechanic: 'permanent' },
                    { name: 'Gravitational Mass → Gravitational Field (A3)', mechanic: 'onSkillCast' },
                    { name: 'Def Pen Aura (A4)', description: '+4% Def Pen ALL team + +4% Def Pen Fire members.', mechanic: 'permanent' }
                ],
                selfBuffs: [],
                teamBuffs: [
                    { name: 'Mana Circulation', trigger: 'Countercurrent ×5', effects: { atkPercent: 15, fireDamage: 15 }, duration: 15 },
                    { name: 'Mana Transformation (Enhanced A2)', trigger: 'Mana Circulation activation', effects: { shieldPercent: 14.4, damageDealt: 22, damageReduction: 12 }, duration: 20 },
                    { name: 'Body Retrograde - Heal', trigger: 'Gravitational Field creation', effects: { healPerTick: 2, powerGaugePerTick: 2 }, tickInterval: 3, duration: 15 },
                    {
                        name: 'Def Pen Aura - ALL team',
                        trigger: 'permanent',
                        effects: { defPen: 4 },
                        duration: 'infinite',
                        note: '+4% Def Pen pour TOUT le RAID (y compris Sung !)'
                    },
                    {
                        name: 'Def Pen Aura - Fire bonus',
                        trigger: 'permanent',
                        effects: { defPen: 4 },
                        duration: 'infinite',
                        elementRestriction: 'Fire',
                        note: '+4% Def Pen supplémentaire pour les Fire members uniquement'
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    { name: 'Gravity Boost', trigger: 'Gravitational Mass hit', target: 'enemy', effects: { fireDamageReceived: 10 }, duration: 20, stackable: false },
                    { name: 'Halt', trigger: 'Enemy touches Gravitational Field', target: 'enemy', effects: { interrupt: true }, duration: 3, cooldown: 20 }
                ]
            },

            // A5 - Space-Time Gap (+60% Path of Extinction DMG, +60% vs Gravity Boost)
            A5: {
                passives: [
                    { name: 'Countercurrent → Mana Circulation', mechanic: 'stacking', maxStacks: 5 },
                    { name: 'Body Retrograde', mechanic: 'onFieldCreation', duration: 15 },
                    { name: 'Shield Enhancement (A2)', mechanic: 'permanent' },
                    { name: 'Gravitational Mass → Gravitational Field (A3)', mechanic: 'onSkillCast' },
                    { name: 'Def Pen Aura (A4)', mechanic: 'permanent' },
                    { name: 'Space-Time Gap (A5)', description: 'Gravitational Field → +60% Path of Extinction DMG (+60% vs Gravity Boost). Consumed after use.', mechanic: 'onFieldCreation', duration: 10 }
                ],
                selfBuffs: [
                    {
                        name: 'Space-Time Gap',
                        effects: { pathOfExtinctionDamage: 60, pathOfExtinctionVsGravityBoost: 60 },
                        duration: 10,
                        trigger: 'Gravitational Field creation',
                        note: '+60% Path of Extinction DMG (+60% vs Gravity Boost = +120% total !)'
                    }
                ],
                teamBuffs: [
                    { name: 'Mana Circulation', trigger: 'Countercurrent ×5', effects: { atkPercent: 15, fireDamage: 15 }, duration: 15 },
                    { name: 'Mana Transformation (Enhanced A2)', trigger: 'Mana Circulation activation', effects: { shieldPercent: 14.4, damageDealt: 22, damageReduction: 12 }, duration: 20 },
                    { name: 'Body Retrograde - Heal', trigger: 'Gravitational Field creation', effects: { healPerTick: 2, powerGaugePerTick: 2 }, tickInterval: 3, duration: 15 },
                    { name: 'Def Pen Aura - ALL team', trigger: 'permanent', effects: { defPen: 4 }, duration: 'infinite' },
                    { name: 'Def Pen Aura - Fire bonus', trigger: 'permanent', effects: { defPen: 4 }, duration: 'infinite', elementRestriction: 'Fire' }
                ],
                raidBuffs: [],
                debuffs: [
                    { name: 'Gravity Boost', trigger: 'Gravitational Mass hit', target: 'enemy', effects: { fireDamageReceived: 10 }, duration: 20, stackable: false },
                    { name: 'Halt', trigger: 'Enemy touches Gravitational Field', target: 'enemy', effects: { interrupt: true }, duration: 3, cooldown: 20 }
                ]
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔥 SONG CHIYUL - DPS Mage Fire (SR, ATK scaling)
    // DPS égoïste. 0 buff team. Focus Burn + Incinerate synergy.
    // ═══════════════════════════════════════════════════════════════
    song: {
        id: 'song',
        name: 'Song Chiyul',
        class: 'Mage',
        element: 'Fire',
        scaleStat: 'ATK',
        primaryRole: 'DPS',
        secondaryRole: 'Normal Monster Farmer',
        tags: ['Burn Specialist', 'Incinerate', 'Normal Monster Killer', 'Selfish DPS'],

        advancements: {
            // A0 - Iaido Red Lotus → +20% Incinerate DMG (3 stacks) + Core Gauge 100%
            A0: {
                passives: [
                    {
                        name: 'Iaido Red Lotus → Incinerate Boost',
                        description: 'Iaido Type 4 hit → +20% Incinerate DMG (10s, 3 stacks max) + Core Gauge 100%.',
                        mechanic: 'stacking',
                        maxStacks: 3,
                        duration: 10
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Incinerate DMG Boost',
                        effects: { incinerateDamage: 20 },
                        duration: 10,
                        maxStacks: 3,
                        trigger: 'Iaido Type 4: Red Lotus Flower hit',
                        note: 'Max 3×20% = +60% Incinerate DMG'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            },

            // A1 - +50% MP Consumption, +50% DMG vs Normal Monsters
            A1: {
                passives: [
                    {
                        name: 'Iaido Red Lotus → Incinerate Boost',
                        mechanic: 'stacking', maxStacks: 3, duration: 10
                    },
                    {
                        name: 'Normal Monster Specialist (A1)',
                        description: '+50% MP Consumption, mais +50% DMG vs Normal monsters.',
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Incinerate DMG Boost',
                        effects: { incinerateDamage: 20 },
                        duration: 10, maxStacks: 3,
                        trigger: 'Iaido Type 4 hit'
                    },
                    {
                        name: 'Normal Monster DMG (A1)',
                        effects: { normalMonsterDamage: 50 },
                        duration: 'infinite',
                        condition: 'always',
                        tradeoff: '+50% MP Consumption',
                        note: '+50% DMG vs Normal monsters mais consomme +50% de MP'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            },

            // A2 - +20% MP
            A2: {
                passives: [
                    { name: 'Iaido Red Lotus → Incinerate Boost', mechanic: 'stacking', maxStacks: 3, duration: 10 },
                    { name: 'Normal Monster Specialist (A1)', mechanic: 'permanent' },
                    { name: 'MP Pool (A2)', description: '+20% MP total.', mechanic: 'permanent' }
                ],
                selfBuffs: [
                    { name: 'Incinerate DMG Boost', effects: { incinerateDamage: 20 }, duration: 10, maxStacks: 3, trigger: 'Iaido Type 4 hit' },
                    { name: 'Normal Monster DMG (A1)', effects: { normalMonsterDamage: 50 }, duration: 'infinite' },
                    { name: 'MP Pool (A2)', effects: { mpPercent: 20 }, duration: 'infinite', note: '+20% MP pour compenser le coût A1' }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            },

            // A3 - Hellfire whirlwind range/duration +50%
            A3: {
                passives: [
                    { name: 'Iaido Red Lotus → Incinerate Boost', mechanic: 'stacking', maxStacks: 3, duration: 10 },
                    { name: 'Normal Monster Specialist (A1)', mechanic: 'permanent' },
                    { name: 'MP Pool (A2)', mechanic: 'permanent' },
                    { name: 'Hellfire Enhancement (A3)', description: 'Hellfire whirlwind range et duration +50%.', mechanic: 'permanent' }
                ],
                selfBuffs: [
                    { name: 'Incinerate DMG Boost', effects: { incinerateDamage: 20 }, duration: 10, maxStacks: 3, trigger: 'Iaido Type 4 hit' },
                    { name: 'Normal Monster DMG (A1)', effects: { normalMonsterDamage: 50 }, duration: 'infinite' },
                    { name: 'MP Pool (A2)', effects: { mpPercent: 20 }, duration: 'infinite' },
                    { name: 'Hellfire Enhancement (A3)', effects: { hellfireRange: 50, hellfireDuration: 50 }, duration: 'infinite', note: '+50% range et duration Hellfire whirlwind' }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            },

            // A4 - Incinerate DMG +20% permanent
            A4: {
                passives: [
                    { name: 'Iaido Red Lotus → Incinerate Boost', mechanic: 'stacking', maxStacks: 3, duration: 10 },
                    { name: 'Normal Monster Specialist (A1)', mechanic: 'permanent' },
                    { name: 'MP Pool (A2)', mechanic: 'permanent' },
                    { name: 'Hellfire Enhancement (A3)', mechanic: 'permanent' },
                    { name: 'Incinerate Mastery (A4)', description: '+20% Incinerate DMG permanent.', mechanic: 'permanent' }
                ],
                selfBuffs: [
                    { name: 'Incinerate DMG Boost (passive)', effects: { incinerateDamage: 20 }, duration: 10, maxStacks: 3, trigger: 'Iaido Type 4 hit' },
                    { name: 'Normal Monster DMG (A1)', effects: { normalMonsterDamage: 50 }, duration: 'infinite' },
                    { name: 'MP Pool (A2)', effects: { mpPercent: 20 }, duration: 'infinite' },
                    { name: 'Hellfire Enhancement (A3)', effects: { hellfireRange: 50, hellfireDuration: 50 }, duration: 'infinite' },
                    { name: 'Incinerate Mastery (A4)', effects: { incinerateDamage: 20 }, duration: 'infinite', note: '+20% Incinerate DMG permanent (s\'ajoute aux stacks passive)' }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            },

            // A5 - +50% DMG with Incinerate on Burned targets
            A5: {
                passives: [
                    { name: 'Iaido Red Lotus → Incinerate Boost', mechanic: 'stacking', maxStacks: 3, duration: 10 },
                    { name: 'Normal Monster Specialist (A1)', mechanic: 'permanent' },
                    { name: 'MP Pool (A2)', mechanic: 'permanent' },
                    { name: 'Hellfire Enhancement (A3)', mechanic: 'permanent' },
                    { name: 'Incinerate Mastery (A4)', mechanic: 'permanent' },
                    { name: 'Burn Executioner (A5)', description: '+50% DMG with Incinerate on Burned targets.', mechanic: 'conditional' }
                ],
                selfBuffs: [
                    { name: 'Incinerate DMG Boost (passive)', effects: { incinerateDamage: 20 }, duration: 10, maxStacks: 3, trigger: 'Iaido Type 4 hit' },
                    { name: 'Normal Monster DMG (A1)', effects: { normalMonsterDamage: 50 }, duration: 'infinite' },
                    { name: 'MP Pool (A2)', effects: { mpPercent: 20 }, duration: 'infinite' },
                    { name: 'Hellfire Enhancement (A3)', effects: { hellfireRange: 50, hellfireDuration: 50 }, duration: 'infinite' },
                    { name: 'Incinerate Mastery (A4)', effects: { incinerateDamage: 20 }, duration: 'infinite' },
                    {
                        name: 'Burn Executioner (A5)',
                        effects: { incinerateDamageVsBurn: 50 },
                        duration: 'infinite',
                        condition: 'target has Burn',
                        note: '+50% Incinerate DMG vs Burned targets ! Total: passive 60% + A4 20% + A5 50% = massive'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔥 STARK - Breaker / Sub-DPS Tank Fire (HP scaling, Frieren collab)
    // Confidence (4 stacks) → Courage window. Break specialist.
    // A3: Team Def Pen = 20% of Stark's raw Def Pen
    // ═══════════════════════════════════════════════════════════════
    stark: {
        id: 'stark',
        name: 'Stark',
        class: 'Breaker / Tank',
        element: 'Fire',
        scaleStat: 'HP',
        primaryRole: 'Breaker',
        secondaryRole: 'Sub-DPS Tank',
        tags: ['HP Scaler', 'Break Specialist', 'Confidence Stacker', 'Self Buffer', 'Team Def Pen'],

        advancements: {
            // A0 - Reserved → Confidence (4 stacks) → Courage window
            A0: {
                passives: [
                    {
                        name: 'Reserved',
                        description: 'Skills active [Confidence] + trigger Whirling Strike. Whirling Strike → [Determination]. Power Gauge cannot charge sauf pendant [Courage].',
                        mechanic: 'permanent',
                        duration: 'infinite'
                    },
                    {
                        name: 'Break Duration Increase',
                        description: 'Quand Stark ou un allié met un ennemi en Break → +3s Break duration.',
                        mechanic: 'passive'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Confidence',
                        effects: { fireDamage: 3, defPen: 3 },
                        duration: 'infinite',
                        maxStacks: 4,
                        trigger: 'Spiral Strike / Lightning Strike variants',
                        note: '+3% Fire DMG +3% Def Pen par stack (max 4 = +12%/+12%). À 4 stacks → Courage.'
                    },
                    {
                        name: 'Courage',
                        effects: { fireDamage: 20, defPen: 20 },
                        duration: 5,
                        trigger: 'Confidence ×4 stacks',
                        note: '+20% Fire DMG +20% Def Pen pendant 5s. Power Gauge charge pendant Courage.'
                    },
                    {
                        name: 'Determination',
                        effects: { basicSkillDamage: 10, critRate: 10 },
                        duration: 3,
                        trigger: 'Whirling Strike use'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            },

            // A1 - Fighting Spirit + Warrior's Aura debuff + Determination enhanced
            A1: {
                passives: [
                    { name: 'Reserved', mechanic: 'permanent', duration: 'infinite' },
                    { name: 'Break Duration +3s', mechanic: 'passive' },
                    {
                        name: 'Fighting Spirit (A1)',
                        description: '-20% DMG taken. Si HP ≤ 10% → recover 40% Max HP (CD 60s).',
                        mechanic: 'permanent',
                        duration: 'infinite'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Confidence',
                        effects: { fireDamage: 3, defPen: 3 },
                        duration: 'infinite', maxStacks: 4,
                        trigger: 'Skills'
                    },
                    {
                        name: 'Courage',
                        effects: { fireDamage: 20, defPen: 20 },
                        duration: 5,
                        trigger: 'Confidence ×4'
                    },
                    {
                        name: 'Determination (Enhanced A1)',
                        effects: { basicSkillDamage: 15, critRate: 15 },
                        duration: 10,
                        trigger: 'Whirling Strike use',
                        note: 'A1: 10%→15% Skill DMG, 10%→15% CR, 3s→10s duration'
                    },
                    {
                        name: 'Fighting Spirit',
                        effects: { damageReduction: 20 },
                        duration: 'infinite',
                        note: '-20% DMG taken + HP recovery si ≤ 10% (CD 60s)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: "Warrior's Aura",
                        trigger: 'Whirling Strike hit',
                        target: 'enemy',
                        effects: { damageFromStark: 15 },
                        duration: 15,
                        note: "+15% DMG taken from Stark (15s)"
                    }
                ]
            },

            // A2 - +15% HP
            A2: {
                passives: [
                    { name: 'Reserved', mechanic: 'permanent' },
                    { name: 'Break Duration +3s', mechanic: 'passive' },
                    { name: 'Fighting Spirit (A1)', mechanic: 'permanent' },
                    { name: 'HP Pool (A2)', description: '+15% HP total.', mechanic: 'permanent' }
                ],
                selfBuffs: [
                    { name: 'Confidence', effects: { fireDamage: 3, defPen: 3 }, duration: 'infinite', maxStacks: 4 },
                    { name: 'Courage', effects: { fireDamage: 20, defPen: 20 }, duration: 5 },
                    { name: 'Determination (Enhanced A1)', effects: { basicSkillDamage: 15, critRate: 15 }, duration: 10 },
                    { name: 'Fighting Spirit', effects: { damageReduction: 20 }, duration: 'infinite' },
                    { name: 'HP Pool (A2)', effects: { hpPercent: 15 }, duration: 'infinite' }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    { name: "Warrior's Aura", trigger: 'Whirling Strike hit', target: 'enemy', effects: { damageFromStark: 15 }, duration: 15 }
                ]
            },

            // A3 - Warrior's Aura enhanced (+30%) + Team Def Pen = 20% of Stark's raw Def Pen
            A3: {
                passives: [
                    { name: 'Reserved', mechanic: 'permanent' },
                    { name: 'Break Duration +3s', mechanic: 'passive' },
                    { name: 'Fighting Spirit (A1)', mechanic: 'permanent' },
                    { name: 'HP Pool (A2)', mechanic: 'permanent' },
                    {
                        name: 'Team Def Pen Aura (A3)',
                        description: "Team Def Pen = 20% of Stark's extra base Def Pen stat.",
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    { name: 'Confidence', effects: { fireDamage: 3, defPen: 3 }, duration: 'infinite', maxStacks: 4 },
                    { name: 'Courage', effects: { fireDamage: 20, defPen: 20 }, duration: 5 },
                    { name: 'Determination (Enhanced A1)', effects: { basicSkillDamage: 15, critRate: 15 }, duration: 10 },
                    { name: 'Fighting Spirit', effects: { damageReduction: 20 }, duration: 'infinite' },
                    { name: 'HP Pool (A2)', effects: { hpPercent: 15 }, duration: 'infinite' }
                ],
                teamBuffs: [
                    {
                        name: "Team Def Pen (A3) - 20% of Stark's raw Def Pen",
                        trigger: 'permanent',
                        effects: { defPenFromRaw: 20 },
                        duration: 'infinite',
                        formula: 'rawDefPen / (50000 + rawDefPen)',
                        note: "20% de la raw Def Pen de Stark → buff Def Pen pour toute la team"
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: "Warrior's Aura (Enhanced A3)",
                        trigger: 'Whirling Strike hit',
                        target: 'enemy',
                        effects: { damageFromStark: 30 },
                        duration: 15,
                        note: "A3: 15%→30% DMG taken from Stark"
                    }
                ]
            },

            // A4 - Break effectiveness +36%
            A4: {
                passives: [
                    { name: 'Reserved', mechanic: 'permanent' },
                    { name: 'Break Duration +3s', mechanic: 'passive' },
                    { name: 'Fighting Spirit (A1)', mechanic: 'permanent' },
                    { name: 'HP Pool (A2)', mechanic: 'permanent' },
                    { name: 'Team Def Pen Aura (A3)', mechanic: 'permanent' },
                    { name: 'Break Mastery (A4)', description: '+36% Break effectiveness.', mechanic: 'permanent' }
                ],
                selfBuffs: [
                    { name: 'Confidence', effects: { fireDamage: 3, defPen: 3 }, duration: 'infinite', maxStacks: 4 },
                    { name: 'Courage', effects: { fireDamage: 20, defPen: 20 }, duration: 5 },
                    { name: 'Determination (Enhanced A1)', effects: { basicSkillDamage: 15, critRate: 15 }, duration: 10 },
                    { name: 'Fighting Spirit', effects: { damageReduction: 20 }, duration: 'infinite' },
                    { name: 'HP Pool (A2)', effects: { hpPercent: 15 }, duration: 'infinite' },
                    { name: 'Break Mastery (A4)', effects: { breakEffectiveness: 36 }, duration: 'infinite' }
                ],
                teamBuffs: [
                    { name: "Team Def Pen (A3)", trigger: 'permanent', effects: { defPenFromRaw: 20 }, duration: 'infinite', formula: 'rawDefPen / (50000 + rawDefPen)' }
                ],
                raidBuffs: [],
                debuffs: [
                    { name: "Warrior's Aura (Enhanced A3)", trigger: 'Whirling Strike hit', target: 'enemy', effects: { damageFromStark: 30 }, duration: 15 }
                ]
            },

            // A5 - Enhanced Confidence (+5%/stack) + Enhanced Courage (+30% Fire/DefPen +50% Annihilation)
            // + Warrior's Talent (1000% Max HP DMG) + Spiral Strike → Determination
            A5: {
                passives: [
                    { name: 'Reserved', mechanic: 'permanent' },
                    { name: 'Break Duration +3s', mechanic: 'passive' },
                    { name: 'Fighting Spirit (A1)', mechanic: 'permanent' },
                    { name: 'HP Pool (A2)', mechanic: 'permanent' },
                    { name: 'Team Def Pen Aura (A3)', mechanic: 'permanent' },
                    { name: 'Break Mastery (A4)', mechanic: 'permanent' },
                    {
                        name: 'Enhanced Confidence/Courage (A5)',
                        description: 'Confidence: +5%/stack (→ +20%). Courage: +30% Fire DMG +30% Def Pen +50% Annihilation DMG.',
                        mechanic: 'permanent'
                    },
                    {
                        name: "Warrior's Talent (A5)",
                        description: "Lightning Strike vs Warrior's Aura target → 1000% Max HP DMG.",
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Confidence (Enhanced A5)',
                        effects: { fireDamage: 5, defPen: 5 },
                        duration: 'infinite', maxStacks: 4,
                        trigger: 'Skills',
                        note: 'A5: 3%→5% par stack (max 4 = +20% Fire DMG +20% Def Pen)'
                    },
                    {
                        name: 'Courage (Enhanced A5)',
                        effects: { fireDamage: 30, defPen: 30, annihilationDamage: 50 },
                        duration: 5,
                        trigger: 'Confidence ×4',
                        note: 'A5: +30% Fire DMG +30% Def Pen +50% Annihilation DMG (5s)'
                    },
                    {
                        name: 'Determination (Enhanced A1)',
                        effects: { basicSkillDamage: 15, critRate: 15 },
                        duration: 10,
                        trigger: 'Whirling Strike OR Spiral Strike (A5)',
                        note: 'A5: Spiral Strike also triggers Determination'
                    },
                    { name: 'Fighting Spirit', effects: { damageReduction: 20 }, duration: 'infinite' },
                    { name: 'HP Pool (A2)', effects: { hpPercent: 15 }, duration: 'infinite' },
                    { name: 'Break Mastery (A4)', effects: { breakEffectiveness: 36 }, duration: 'infinite' }
                ],
                teamBuffs: [
                    { name: "Team Def Pen (A3)", trigger: 'permanent', effects: { defPenFromRaw: 20 }, duration: 'infinite', formula: 'rawDefPen / (50000 + rawDefPen)' }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: "Warrior's Aura (Enhanced A3)",
                        trigger: 'Whirling Strike hit',
                        target: 'enemy',
                        effects: { damageFromStark: 30 },
                        duration: 15
                    },
                    {
                        name: "Warrior's Talent (A5)",
                        trigger: 'Lightning Strike vs Warrior\'s Aura target',
                        target: 'enemy',
                        effects: { bonusDamage: '1000% Max HP' },
                        note: "Hit on Warrior's Aura target → 1000% Max HP bonus DMG"
                    }
                ]
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔥 KANAE - DPS Assassin Fire (ATK scaling)
    // Crimson→Scarlet→Fire chain. Instinct→Sixth Sense crit stacking.
    // DPS égoïste avec buffs perso massifs.
    // ═══════════════════════════════════════════════════════════════
    kanae: {
        id: 'kanae',
        name: 'Tawata Kanae',
        class: 'Assassin',
        element: 'Fire',
        scaleStat: 'ATK',
        primaryRole: 'DPS',
        secondaryRole: 'Burst Assassin',
        tags: ['Selfish DPS', 'Crit Stacker', 'Fire DMG Scaler', 'Break Bonus', 'Execution Windows'],

        advancements: {
            // A0 - Crimson→Scarlet→Fire chain + Break DMG +24%
            A0: {
                passives: [
                    {
                        name: 'Crimson → Scarlet → Fire Chain',
                        description: 'Munechika → [Crimson]. Enhanced Core → [Scarlet]. Kamaitachi with any buff → Ultimate-tier. [Fire] → +70% Tsuchigumo DMG. Using Kamaitachi removes all 3.',
                        mechanic: 'chain'
                    },
                    {
                        name: 'Break Damage Bonus',
                        description: '+24% DMG vs Break targets.',
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    { name: 'Break DMG Bonus', effects: { breakDamage: 24 }, duration: 'infinite', condition: 'target in Break' },
                    { name: 'Fire Effect → Tsuchigumo', effects: { tsuchigumoDamage: 70 }, duration: 'infinite', trigger: 'Fire effect active', note: '+70% Tsuchigumo DMG when Fire active' }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            },

            // A1 - Instinct stacks (1%CR ×10) → Sixth Sense (+20% CR, MP reduction)
            A1: {
                passives: [
                    { name: 'Crimson → Scarlet → Fire Chain', mechanic: 'chain' },
                    { name: 'Break Damage +24%', mechanic: 'permanent' },
                    {
                        name: 'Instinct → Sixth Sense (A1)',
                        description: 'Enemy death → +1 Instinct. Break state → +5 Instinct. 10 stacks → Sixth Sense (+20% CR, -40% MP at ≤20%).',
                        mechanic: 'stacking',
                        maxStacks: 10
                    }
                ],
                selfBuffs: [
                    { name: 'Break DMG Bonus', effects: { breakDamage: 24 }, duration: 'infinite' },
                    { name: 'Fire Effect → Tsuchigumo', effects: { tsuchigumoDamage: 70 }, trigger: 'Fire active' },
                    {
                        name: 'Instinct',
                        effects: { critRate: 1 },
                        duration: 'infinite', maxStacks: 10,
                        trigger: 'Enemy death (+1) / Break (+5)',
                        note: '+1% CR par stack (max 10 = +10% CR). À 10 → Sixth Sense.'
                    },
                    {
                        name: 'Sixth Sense',
                        effects: { critRate: 20 },
                        duration: 'infinite',
                        trigger: 'Instinct ×10',
                        note: '+20% CR permanent. MP ≤ 20% → -40% MP consumption.'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            },

            // A2 - +16% Crit DMG permanent
            A2: {
                passives: [
                    { name: 'Crimson → Scarlet → Fire Chain', mechanic: 'chain' },
                    { name: 'Break Damage +24%', mechanic: 'permanent' },
                    { name: 'Instinct → Sixth Sense (A1)', mechanic: 'stacking', maxStacks: 10 },
                    { name: 'Crit DMG Boost (A2)', description: '+16% Crit DMG permanent.', mechanic: 'permanent' }
                ],
                selfBuffs: [
                    { name: 'Break DMG Bonus', effects: { breakDamage: 24 }, duration: 'infinite' },
                    { name: 'Fire Effect → Tsuchigumo', effects: { tsuchigumoDamage: 70 }, trigger: 'Fire active' },
                    { name: 'Instinct', effects: { critRate: 1 }, duration: 'infinite', maxStacks: 10 },
                    { name: 'Sixth Sense', effects: { critRate: 20 }, duration: 'infinite', trigger: 'Instinct ×10' },
                    { name: 'Crit DMG Boost (A2)', effects: { critDMG: 16 }, duration: 'infinite', note: '+16% DCC permanent' }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            },

            // A3 - Super Armor on Munechika + Fire:Kamaitachi → -5s Munechika CD
            A3: {
                passives: [
                    { name: 'Crimson → Scarlet → Fire Chain', mechanic: 'chain' },
                    { name: 'Break Damage +24%', mechanic: 'permanent' },
                    { name: 'Instinct → Sixth Sense (A1)', mechanic: 'stacking', maxStacks: 10 },
                    { name: 'Crit DMG +16% (A2)', mechanic: 'permanent' },
                    { name: 'Super Armor + CD Reduction (A3)', description: 'Munechika → Super Armor 5s. Fire:Kamaitachi → -5s Munechika CD.', mechanic: 'onSkillCast' }
                ],
                selfBuffs: [
                    { name: 'Break DMG Bonus', effects: { breakDamage: 24 }, duration: 'infinite' },
                    { name: 'Fire Effect → Tsuchigumo', effects: { tsuchigumoDamage: 70 }, trigger: 'Fire active' },
                    { name: 'Instinct', effects: { critRate: 1 }, duration: 'infinite', maxStacks: 10 },
                    { name: 'Sixth Sense', effects: { critRate: 20 }, duration: 'infinite', trigger: 'Instinct ×10' },
                    { name: 'Crit DMG Boost (A2)', effects: { critDMG: 16 }, duration: 'infinite' }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            },

            // A4 - +12% Fire DMG per Fire member (max 3 = +36%)
            A4: {
                passives: [
                    { name: 'Crimson → Scarlet → Fire Chain', mechanic: 'chain' },
                    { name: 'Break Damage +24%', mechanic: 'permanent' },
                    { name: 'Instinct → Sixth Sense (A1)', mechanic: 'stacking', maxStacks: 10 },
                    { name: 'Crit DMG +16% (A2)', mechanic: 'permanent' },
                    { name: 'Super Armor + CD Reduction (A3)', mechanic: 'onSkillCast' },
                    { name: 'Fire Synergy (A4)', description: '+12% Fire DMG per Fire member (max 3 = +36%).', mechanic: 'permanent' }
                ],
                selfBuffs: [
                    { name: 'Break DMG Bonus', effects: { breakDamage: 24 }, duration: 'infinite' },
                    { name: 'Fire Effect → Tsuchigumo', effects: { tsuchigumoDamage: 70 }, trigger: 'Fire active' },
                    { name: 'Instinct', effects: { critRate: 1 }, duration: 'infinite', maxStacks: 10 },
                    { name: 'Sixth Sense', effects: { critRate: 20 }, duration: 'infinite', trigger: 'Instinct ×10' },
                    { name: 'Crit DMG Boost (A2)', effects: { critDMG: 16 }, duration: 'infinite' },
                    {
                        name: 'Fire Synergy (A4)',
                        effects: { fireDamagePerFireAlly: 12 },
                        duration: 'infinite',
                        maxStacks: 3,
                        note: '+12% Fire DMG per Fire member in party (max 3 = +36% Fire DMG)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            },

            // A5 - Enhanced Instinct/Sixth Sense (+ATK, +CR, +DCC massifs)
            A5: {
                passives: [
                    { name: 'Crimson → Scarlet → Fire Chain', mechanic: 'chain' },
                    { name: 'Break Damage +24%', mechanic: 'permanent' },
                    { name: 'Instinct → Sixth Sense (Enhanced A5)', mechanic: 'stacking', maxStacks: 10 },
                    { name: 'Crit DMG +16% (A2)', mechanic: 'permanent' },
                    { name: 'Super Armor + CD Reduction (A3)', mechanic: 'onSkillCast' },
                    { name: 'Fire Synergy (A4)', mechanic: 'permanent' }
                ],
                selfBuffs: [
                    { name: 'Break DMG Bonus', effects: { breakDamage: 24 }, duration: 'infinite' },
                    { name: 'Fire Effect → Tsuchigumo', effects: { tsuchigumoDamage: 70 }, trigger: 'Fire active' },
                    {
                        name: 'Instinct (Enhanced A5)',
                        effects: { atkPercent: 5, critRate: 1.5, critDMG: 1.5 },
                        duration: 'infinite', maxStacks: 10,
                        trigger: 'Enemy death (+1) / Break (+5)',
                        note: '+5% ATK +1.5% CR +1.5% DCC par stack (max 10 = +50% ATK +15% CR +15% DCC)'
                    },
                    {
                        name: 'Sixth Sense (Enhanced A5)',
                        effects: { atkPercent: 77, critRate: 20, critDMG: 20 },
                        duration: 'infinite',
                        trigger: 'Instinct ×10',
                        note: '+77% ATK +20% CR +20% DCC ! MP ≤ 30% → -50% MP consumption.'
                    },
                    { name: 'Crit DMG Boost (A2)', effects: { critDMG: 16 }, duration: 'infinite' },
                    {
                        name: 'Fire Synergy (A4)',
                        effects: { fireDamagePerFireAlly: 12 },
                        duration: 'infinite', maxStacks: 3
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            }
        }
    },

    // 🔥 Christopher Reed - Fire Infusion DEF - Elemental Stacker / Fire Overload Specialist
    reed: {
        id: 'reed',
        name: 'Christopher Reed',
        class: 'Infusion',
        element: 'Fire',
        scaleStat: 'DEF',
        primaryRole: 'DPS',
        secondaryRole: 'Elemental Stacker / Fire Overload Enabler',
        tags: ['DEF Scaler', 'Elemental Stacker', 'Fire Overload', 'Burn Applier', 'Spiritual Body', 'Touchdown', 'Team Fire DMG'],

        advancements: {
            A0: {
                passives: [
                    {
                        name: 'Spiritual Body Manifestation',
                        description: 'Gauge chargée par skills. 100% → Special Core Attack → état amélioré: Enhanced BA/Core/Skill + CD reset, +25% Fire Elem Acc, +150% BA/Core/Skill DMG. 30s.',
                        type: 'selfBuff',
                        conditions: 'Spiritual Body Gauge 100%'
                    },
                    {
                        name: 'Finishing Catch',
                        description: '1500% DEF Fire DMG, compte comme Basic Skill, CD15. Disponible après Extreme Evasion.',
                        type: 'extraSkill',
                        conditions: 'After Extreme Evasion'
                    },
                    {
                        name: 'Touchdown',
                        description: '+15% Fire Overload DMG + +5% Fire Elem Acc par stack (max 3 = +45% OL DMG + 15% Elem Acc). 60s. Activé par Nitro Kick/Foul Play en Team Fight.',
                        type: 'selfBuff',
                        conditions: 'On Nitro Kick / Foul Play in Team Fight mode'
                    },
                    {
                        name: 'Burn',
                        description: 'Inflige Burn: 200% DEF tous les 3s pendant 30s. Appliqué par Rising Performance, Rapid Kick, Zero to a Hundred.',
                        type: 'debuff',
                        conditions: 'On specific skill hits'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Spiritual Body Manifestation',
                        effects: { fireElementalAccumulation: 25, skillDamage: 150 },
                        duration: 30,
                        note: '+25% Fire Elem Acc + +150% BA/Core/Skill DMG + CD reset'
                    },
                    {
                        name: 'Touchdown',
                        effects: { fireOverloadDamage: 15, fireElementalAccumulation: 5 },
                        duration: 60, maxStacks: 3,
                        note: 'Max 3 stacks = +45% Fire Overload DMG + +15% Fire Elem Acc'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            },
            A1: {
                passives: [
                    {
                        name: 'Enhanced Gauge Charging',
                        description: 'Si Fire Elemental Accumulation Immunity active → charge Spiritual Body Gauge (CD15). Fire team Basic/Ult Skill charge aussi la gauge.',
                        type: 'selfBuff',
                        conditions: 'On Elem Acc Immunity or Fire team skill use'
                    },
                    {
                        name: 'Finishing Catch vs Burn +25%',
                        description: '+25% Finishing Catch DMG vs cibles Burn',
                        type: 'selfBuff',
                        conditions: 'vs Burn targets'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Spiritual Body Manifestation',
                        effects: { fireElementalAccumulation: 25, skillDamage: 150 },
                        duration: 30
                    },
                    {
                        name: 'Touchdown',
                        effects: { fireOverloadDamage: 15, fireElementalAccumulation: 5 },
                        duration: 60, maxStacks: 3
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            },
            A2: {
                passives: [
                    {
                        name: 'Fire Elemental Accumulation +20%',
                        description: '+20% Fire Elemental Accumulation permanent',
                        type: 'selfBuff',
                        conditions: 'Always active'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Spiritual Body Manifestation',
                        effects: { fireElementalAccumulation: 25, skillDamage: 150 },
                        duration: 30
                    },
                    {
                        name: 'Touchdown',
                        effects: { fireOverloadDamage: 15, fireElementalAccumulation: 5 },
                        duration: 60, maxStacks: 3
                    },
                    {
                        name: 'Fire Elem Acc Enhancement (A2)',
                        effects: { fireElementalAccumulation: 20 },
                        duration: 'infinite',
                        note: '+20% Fire Elem Acc permanent'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            },
            A3: {
                passives: [
                    {
                        name: 'Spiritual Body HP Recovery + Shield',
                        description: 'Spiritual Body Manifestation → +30% HP recovery + Shield (100% DEF, 20s)',
                        type: 'selfBuff',
                        conditions: 'On Spiritual Body Manifestation activation'
                    },
                    {
                        name: 'Competitive Spirit',
                        description: 'Quand attaque touche cible Burn → +165% Fire DMG + +15% Finishing Catch DMG. 15s, CD2.',
                        type: 'selfBuff',
                        conditions: 'On hitting Burn target (CD: 2s)'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Spiritual Body Manifestation',
                        effects: { fireElementalAccumulation: 25, skillDamage: 150 },
                        duration: 30
                    },
                    {
                        name: 'Touchdown',
                        effects: { fireOverloadDamage: 15, fireElementalAccumulation: 5 },
                        duration: 60, maxStacks: 3
                    },
                    {
                        name: 'Fire Elem Acc Enhancement (A2)',
                        effects: { fireElementalAccumulation: 20 },
                        duration: 'infinite'
                    },
                    {
                        name: 'Competitive Spirit (A3)',
                        effects: { fireDamage: 165 },
                        duration: 15,
                        note: '+165% Fire DMG + +15% Finishing Catch DMG vs Burn targets (CD2, quasi permanent)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            },
            A4: {
                passives: [
                    {
                        name: 'Fire Synergy',
                        description: '+5% Fire DMG par Fire ally dans la team (max 3 = +15% Fire DMG) pour les membres Fire',
                        type: 'teamBuff',
                        conditions: 'Per Fire ally in party'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Spiritual Body Manifestation',
                        effects: { fireElementalAccumulation: 25, skillDamage: 150 },
                        duration: 30
                    },
                    {
                        name: 'Touchdown',
                        effects: { fireOverloadDamage: 15, fireElementalAccumulation: 5 },
                        duration: 60, maxStacks: 3
                    },
                    {
                        name: 'Fire Elem Acc Enhancement (A2)',
                        effects: { fireElementalAccumulation: 20 },
                        duration: 'infinite'
                    },
                    {
                        name: 'Competitive Spirit (A3)',
                        effects: { fireDamage: 165 },
                        duration: 15
                    },
                    {
                        name: 'Fire Synergy (A4)',
                        effects: { fireDamagePerFireAlly: 5 },
                        duration: 'infinite', maxStacks: 3
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Fire Synergy (A4)',
                        effects: { fireDamagePerFireAlly: 5 },
                        duration: 'infinite', maxStacks: 3,
                        note: '+5% Fire DMG par Fire ally (max 3 = +15%) pour Fire team members'
                    }
                ],
                raidBuffs: [],
                debuffs: []
            },
            A5: {
                passives: [
                    {
                        name: 'Fire Overload Synergy',
                        description: 'Fire Overload trigger (self ou ally) → +20% Power Gauge + reset Zero to a Hundred CD (CD30)',
                        type: 'selfBuff',
                        conditions: 'On Fire Overload trigger'
                    },
                    {
                        name: 'Blazing Shock',
                        description: 'Quand attaque touche cible Fire Overloaded → +20% Fire Overload DMG Taken + Unrecoverable. 30s, CD30.',
                        type: 'debuff',
                        conditions: 'On hitting Fire Overloaded target (CD: 30s)'
                    },
                    {
                        name: "Victor's Spirit",
                        description: 'Spiritual Body Manifestation active → +250% Zero to a Hundred DMG. 60s, retiré à l\'utilisation.',
                        type: 'selfBuff',
                        conditions: 'On Spiritual Body Manifestation activation'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Spiritual Body Manifestation',
                        effects: { fireElementalAccumulation: 25, skillDamage: 150 },
                        duration: 30
                    },
                    {
                        name: 'Touchdown',
                        effects: { fireOverloadDamage: 15, fireElementalAccumulation: 5 },
                        duration: 60, maxStacks: 3
                    },
                    {
                        name: 'Fire Elem Acc Enhancement (A2)',
                        effects: { fireElementalAccumulation: 20 },
                        duration: 'infinite'
                    },
                    {
                        name: 'Competitive Spirit (A3)',
                        effects: { fireDamage: 165 },
                        duration: 15
                    },
                    {
                        name: 'Fire Synergy (A4)',
                        effects: { fireDamagePerFireAlly: 5 },
                        duration: 'infinite', maxStacks: 3
                    },
                    {
                        name: "Victor's Spirit (A5)",
                        effects: { zeroToHundredDamage: 250 },
                        duration: 60,
                        note: '+250% Zero to a Hundred DMG, retiré à utilisation'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Fire Synergy (A4)',
                        effects: { fireDamagePerFireAlly: 5 },
                        duration: 'infinite', maxStacks: 3
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Blazing Shock (A5)',
                        effects: { fireOverloadDamageTaken: 20 },
                        duration: 30,
                        note: '+20% Fire Overload DMG Taken + Unrecoverable (CD30)'
                    }
                ]
            }
        }
    },

    // 🔥 YUQI - Fire Breaker/Sub-DPS Tank HP - Break Specialist + Team Buffer + Debuffer
    yuqi: {
        id: 'yuqi',
        name: 'YUQI',
        class: 'Breaker',
        element: 'Fire',
        scaleStat: 'HP',
        primaryRole: 'Breaker',
        secondaryRole: 'Sub-DPS / Team Buffer',
        tags: ['HP Scaler', 'Break Specialist', 'Team Buffer', 'Debuffer', 'Full Burst', 'Tempo Stacker', 'Super Armor'],

        advancements: {
            A0: {
                passives: [
                    {
                        name: 'FOREVER',
                        description: '+5% DMG dealt, infini, stack ×3 = +15% DMG dealt. Activé en Encore Mission / Instance Dungeon',
                        type: 'teamBuff',
                        conditions: 'On entering Encore Mission / Instance Dungeon'
                    },
                    {
                        name: 'Break Extension',
                        description: 'Quand YUQI ou un allié met un ennemi en [Break], la durée du Break augmente de 3s',
                        type: 'utility',
                        conditions: 'On Break applied'
                    },
                    {
                        name: 'Tempo',
                        description: '+0.5% Max HP + 0.5% Shouting Kick DMG par stack (max 15 = +7.5% HP + 7.5% SK DMG). 10s par stack. Chargé par Shouting Kick/Amp Crash/Rising Spin Kick hits',
                        type: 'selfBuff',
                        conditions: 'On skill hit'
                    },
                    {
                        name: 'Full Burst',
                        description: 'Quand la jauge Full Burst = 100%: Skills améliorés, +25% Break effectiveness Shouting Kick, +10% SK DMG, +10% Max HP, Super Armor. 10s. Supprime Tempo.',
                        type: 'selfBuff',
                        conditions: 'Full Burst gauge 100%'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'FOREVER',
                        effects: { damageDealt: 5 },
                        duration: 'infinite', maxStacks: 3,
                        note: 'Max 3 stacks = +15% DMG dealt (team)'
                    },
                    {
                        name: 'Tempo',
                        effects: { maxHP: 0.5, shoutingKickDmg: 0.5 },
                        duration: 10, maxStacks: 15,
                        note: 'Max 15 stacks = +7.5% HP + 7.5% SK DMG'
                    },
                    {
                        name: 'Full Burst',
                        effects: { breakEffectiveness: 25, shoutingKickDmg: 10, maxHP: 10 },
                        duration: 10,
                        note: 'Super Armor + Skills améliorés'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'FOREVER',
                        effects: { damageDealt: 5 },
                        duration: 'infinite', maxStacks: 3,
                        note: '+15% DMG dealt pour toute la team'
                    }
                ],
                raidBuffs: [],
                debuffs: []
            },
            A1: {
                passives: [
                    {
                        name: 'Full Burst Gauge +100%',
                        description: 'Le taux de charge du Full Burst augmente de 100% → Full Burst activé 2× plus vite',
                        type: 'selfBuff',
                        conditions: 'Always active'
                    },
                    {
                        name: 'Distortion',
                        description: '+3% DMG taken par stack (max 3 = +9%). Max stacks → active Breakdown',
                        type: 'debuff',
                        conditions: 'On Amp Crash/Crescendo Scream/Rising Spin Kick/Unlimited Shout hit'
                    },
                    {
                        name: 'Breakdown',
                        description: '+15% DMG taken + 20% Fire DMG taken. 20s. Supprime Distortion',
                        type: 'debuff',
                        conditions: 'On Kill the Stage hit OR Distortion max stacks'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'FOREVER',
                        effects: { damageDealt: 5 },
                        duration: 'infinite', maxStacks: 3
                    },
                    {
                        name: 'Tempo',
                        effects: { maxHP: 0.5, shoutingKickDmg: 0.5 },
                        duration: 10, maxStacks: 15
                    },
                    {
                        name: 'Full Burst',
                        effects: { breakEffectiveness: 25, shoutingKickDmg: 10, maxHP: 10 },
                        duration: 10
                    }
                ],
                teamBuffs: [
                    {
                        name: 'FOREVER',
                        effects: { damageDealt: 5 },
                        duration: 'infinite', maxStacks: 3
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Distortion',
                        effects: { damageTaken: 3 },
                        duration: 10, maxStacks: 3,
                        note: 'Max 3 stacks = +9% DMG taken → triggers Breakdown'
                    },
                    {
                        name: 'Breakdown',
                        effects: { damageTaken: 15, fireDamageTaken: 20 },
                        duration: 20,
                        note: 'Supprime Distortion pendant actif'
                    }
                ]
            },
            A2: {
                passives: [
                    {
                        name: 'Break Effectiveness +20%',
                        description: '+20% Break effectiveness permanent',
                        type: 'selfBuff',
                        conditions: 'Always active'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'FOREVER',
                        effects: { damageDealt: 5 },
                        duration: 'infinite', maxStacks: 3
                    },
                    {
                        name: 'Tempo',
                        effects: { maxHP: 0.5, shoutingKickDmg: 0.5 },
                        duration: 10, maxStacks: 15
                    },
                    {
                        name: 'Full Burst',
                        effects: { breakEffectiveness: 25, shoutingKickDmg: 10, maxHP: 10 },
                        duration: 10
                    },
                    {
                        name: 'Break Effectiveness (A2)',
                        effects: { breakEffectiveness: 20 },
                        duration: 'infinite'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'FOREVER',
                        effects: { damageDealt: 5 },
                        duration: 'infinite', maxStacks: 3
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Distortion',
                        effects: { damageTaken: 3 },
                        duration: 10, maxStacks: 3
                    },
                    {
                        name: 'Breakdown',
                        effects: { damageTaken: 15, fireDamageTaken: 20 },
                        duration: 20
                    }
                ]
            },
            A3: {
                passives: [
                    {
                        name: 'Enhanced Full Burst',
                        description: 'Full Burst amélioré: +50% Break effectiveness SK (was 25%), +40% SK DMG (was 10%), +25% Max HP (was 10%), Power Gauge +20% on hit',
                        type: 'selfBuff',
                        conditions: 'Full Burst active'
                    },
                    {
                        name: 'Afterglow',
                        description: 'Kill the Stage active Afterglow sur toute la team: +12% DMG vs Break, +15% Basic/Ult Skill DMG, +15% Crit DMG. 20s',
                        type: 'teamBuff',
                        conditions: 'On Kill the Stage (Ultimate) use'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'FOREVER',
                        effects: { damageDealt: 5 },
                        duration: 'infinite', maxStacks: 3
                    },
                    {
                        name: 'Tempo',
                        effects: { maxHP: 0.5, shoutingKickDmg: 0.5 },
                        duration: 10, maxStacks: 15
                    },
                    {
                        name: 'Enhanced Full Burst (A3)',
                        effects: { breakEffectiveness: 50, shoutingKickDmg: 40, maxHP: 25, powerGaugeCharge: 20 },
                        duration: 10,
                        note: 'Amélioré vs A0: Break 50% (was 25%), SK DMG 40% (was 10%), HP 25% (was 10%)'
                    },
                    {
                        name: 'Break Effectiveness (A2)',
                        effects: { breakEffectiveness: 20 },
                        duration: 'infinite'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'FOREVER',
                        effects: { damageDealt: 5 },
                        duration: 'infinite', maxStacks: 3
                    }
                ],
                raidBuffs: [
                    {
                        name: 'Afterglow',
                        effects: { breakTargetDmg: 12, basicUltSkillDmg: 15, critDMG: 15 },
                        duration: 20,
                        scope: 'raid',
                        note: '+12% DMG vs Break + +15% Basic/Ult Skill DMG + +15% DCC → buff RAID entier'
                    }
                ],
                debuffs: [
                    {
                        name: 'Distortion',
                        effects: { damageTaken: 3 },
                        duration: 10, maxStacks: 3
                    },
                    {
                        name: 'Breakdown',
                        effects: { damageTaken: 15, fireDamageTaken: 20 },
                        duration: 20
                    }
                ]
            },
            A4: {
                passives: [
                    {
                        name: 'Fire Synergy',
                        description: '+5% Fire DMG par Fire ally dans la team (max 3 = +15% Fire DMG) pour les membres Fire',
                        type: 'teamBuff',
                        conditions: 'Per Fire ally in party'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'FOREVER',
                        effects: { damageDealt: 5 },
                        duration: 'infinite', maxStacks: 3
                    },
                    {
                        name: 'Tempo',
                        effects: { maxHP: 0.5, shoutingKickDmg: 0.5 },
                        duration: 10, maxStacks: 15
                    },
                    {
                        name: 'Enhanced Full Burst (A3)',
                        effects: { breakEffectiveness: 50, shoutingKickDmg: 40, maxHP: 25, powerGaugeCharge: 20 },
                        duration: 10
                    },
                    {
                        name: 'Break Effectiveness (A2)',
                        effects: { breakEffectiveness: 20 },
                        duration: 'infinite'
                    },
                    {
                        name: 'Fire Synergy (A4)',
                        effects: { fireDamagePerFireAlly: 5 },
                        duration: 'infinite', maxStacks: 3
                    }
                ],
                teamBuffs: [
                    {
                        name: 'FOREVER',
                        effects: { damageDealt: 5 },
                        duration: 'infinite', maxStacks: 3
                    },
                    {
                        name: 'Fire Synergy (A4)',
                        effects: { fireDamagePerFireAlly: 5 },
                        duration: 'infinite', maxStacks: 3,
                        note: '+5% Fire DMG par Fire ally (max 3 = +15%) pour Fire members'
                    }
                ],
                raidBuffs: [
                    {
                        name: 'Afterglow',
                        effects: { breakTargetDmg: 12, basicUltSkillDmg: 15, critDMG: 15 },
                        duration: 20,
                        scope: 'raid',
                        note: '+12% DMG vs Break + +15% Basic/Ult Skill DMG + +15% DCC → buff RAID entier'
                    }
                ],
                debuffs: [
                    {
                        name: 'Distortion',
                        effects: { damageTaken: 3 },
                        duration: 10, maxStacks: 3
                    },
                    {
                        name: 'Breakdown',
                        effects: { damageTaken: 15, fireDamageTaken: 20 },
                        duration: 20
                    }
                ]
            },
            A5: {
                passives: [
                    {
                        name: 'Enhanced Distortion',
                        description: 'Distortion amélioré: +6% DMG taken (was 3%), 15s (was 10s), max 3 = +18% DMG taken',
                        type: 'debuff',
                        conditions: 'On skill hit'
                    },
                    {
                        name: 'Enhanced Breakdown',
                        description: 'Breakdown amélioré: +20% DMG taken (was 15%) + 25% Fire DMG taken (was 20%), 30s (was 20s)',
                        type: 'debuff',
                        conditions: 'On Distortion max stacks or Kill the Stage'
                    },
                    {
                        name: 'Enhanced Afterglow',
                        description: 'Afterglow amélioré: +12% DMG vs Break, +30% Basic/Ult Skill DMG (was 15%), +20% Crit DMG (was 15%), 30s (was 20s)',
                        type: 'teamBuff',
                        conditions: 'On Kill the Stage use'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'FOREVER',
                        effects: { damageDealt: 5 },
                        duration: 'infinite', maxStacks: 3
                    },
                    {
                        name: 'Tempo',
                        effects: { maxHP: 0.5, shoutingKickDmg: 0.5 },
                        duration: 10, maxStacks: 15
                    },
                    {
                        name: 'Enhanced Full Burst (A3)',
                        effects: { breakEffectiveness: 50, shoutingKickDmg: 40, maxHP: 25, powerGaugeCharge: 20 },
                        duration: 10
                    },
                    {
                        name: 'Break Effectiveness (A2)',
                        effects: { breakEffectiveness: 20 },
                        duration: 'infinite'
                    },
                    {
                        name: 'Fire Synergy (A4)',
                        effects: { fireDamagePerFireAlly: 5 },
                        duration: 'infinite', maxStacks: 3
                    }
                ],
                teamBuffs: [
                    {
                        name: 'FOREVER',
                        effects: { damageDealt: 5 },
                        duration: 'infinite', maxStacks: 3
                    },
                    {
                        name: 'Fire Synergy (A4)',
                        effects: { fireDamagePerFireAlly: 5 },
                        duration: 'infinite', maxStacks: 3
                    }
                ],
                raidBuffs: [
                    {
                        name: 'Enhanced Afterglow (A5)',
                        effects: { breakTargetDmg: 12, basicUltSkillDmg: 30, critDMG: 20 },
                        duration: 30,
                        scope: 'raid',
                        note: 'Amélioré: +30% Basic/Ult DMG (was 15%) + +20% DCC (was 15%) + durée 30s (was 20s) → buff RAID entier'
                    }
                ],
                debuffs: [
                    {
                        name: 'Enhanced Distortion (A5)',
                        effects: { damageTaken: 6 },
                        duration: 15, maxStacks: 3,
                        note: 'Amélioré: +6% (was 3%), 15s (was 10s) → Max 3 = +18% DMG taken'
                    },
                    {
                        name: 'Enhanced Breakdown (A5)',
                        effects: { damageTaken: 20, fireDamageTaken: 25 },
                        duration: 30,
                        note: 'Amélioré: +20% DMG (was 15%) + 25% Fire DMG (was 20%), 30s (was 20s)'
                    }
                ]
            }
        }
    },

    // 🔥 Yoo Soohyun - Fire Striker ATK - Def Pen Specialist + Magic Reaction Debuffer
    yoo: {
        id: 'yoo',
        name: 'Yoo Soohyun',
        class: 'Striker',
        element: 'Fire',
        scaleStat: 'ATK',
        primaryRole: 'DPS',
        secondaryRole: 'Def Pen Specialist',
        tags: ['Def Pen Stacker', 'Fire Debuffer', 'Magic Reaction', 'Hell Fire', 'Spotlight', 'DI from Def Pen'],

        advancements: {
            A0: {
                passives: [
                    {
                        name: 'Spotlight',
                        description: '+24% Def Pen permanent. Damage Increase = 24% of Def Pen stat (24s, renouvable)',
                        type: 'selfBuff',
                        conditions: 'Always active'
                    },
                    {
                        name: 'Magic Firearm',
                        description: 'Basic Attack applique [Magic Reaction] sur l\'ennemi. +1% Fire DMG taken par stack, max 20 stacks = +20% Fire DMG taken',
                        type: 'debuff',
                        conditions: 'On Basic Attack hit'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Spotlight (Def Pen)',
                        effects: { defPen: 24 },
                        duration: 'infinite'
                    },
                    {
                        name: 'Spotlight (Damage Increase)',
                        effects: { damageIncrease: '24% of Def Pen stat' },
                        duration: 24,
                        note: 'Renouvelable - uptime quasi permanent'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Magic Reaction',
                        effects: { fireDamageTaken: 1 },
                        duration: 'stackable', maxStacks: 20,
                        note: 'Max 20 stacks = +20% Fire DMG taken par ennemi'
                    }
                ]
            },
            A1: {
                passives: [
                    {
                        name: 'Madness → Hell Fire',
                        description: 'Active l\'état Madness. Quand Magic Reaction ≥10 stacks, Madness se transforme en Hell Fire (+40% DMG sur skills améliorés)',
                        type: 'transformation',
                        conditions: 'Magic Reaction ≥10 stacks sur ennemi'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Spotlight (Def Pen)',
                        effects: { defPen: 24 },
                        duration: 'infinite'
                    },
                    {
                        name: 'Spotlight (Damage Increase)',
                        effects: { damageIncrease: '24% of Def Pen stat' },
                        duration: 24
                    },
                    {
                        name: 'Hell Fire Transformation',
                        effects: { skillDamage: 40 },
                        duration: 'while Hell Fire active',
                        conditions: 'Magic Reaction ≥10 stacks'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Magic Reaction',
                        effects: { fireDamageTaken: 1 },
                        duration: 'stackable', maxStacks: 20
                    }
                ]
            },
            A2: {
                passives: [
                    {
                        name: 'Enhanced Def Pen',
                        description: '+12% Def Pen permanent (total Spotlight 24% + A2 12% = 36% Def Pen perso)',
                        type: 'selfBuff',
                        conditions: 'Always active'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Spotlight + A2 (Def Pen)',
                        effects: { defPen: 36 },
                        duration: 'infinite',
                        note: '24% Spotlight + 12% A2 = 36% Def Pen perso'
                    },
                    {
                        name: 'Spotlight (Damage Increase)',
                        effects: { damageIncrease: '24% of Def Pen stat' },
                        duration: 24
                    },
                    {
                        name: 'Hell Fire Transformation',
                        effects: { skillDamage: 40 },
                        duration: 'while Hell Fire active',
                        conditions: 'Magic Reaction ≥10 stacks'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Magic Reaction',
                        effects: { fireDamageTaken: 1 },
                        duration: 'stackable', maxStacks: 20
                    }
                ]
            },
            A3: {
                passives: [
                    {
                        name: 'Trick Shot ATK Boost',
                        description: 'Trick Shot donne +24% ATK au lancement',
                        type: 'selfBuff',
                        conditions: 'On Trick Shot use'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Spotlight + A2 (Def Pen)',
                        effects: { defPen: 36 },
                        duration: 'infinite'
                    },
                    {
                        name: 'Spotlight (Damage Increase)',
                        effects: { damageIncrease: '24% of Def Pen stat' },
                        duration: 24
                    },
                    {
                        name: 'Hell Fire Transformation',
                        effects: { skillDamage: 40 },
                        duration: 'while Hell Fire active',
                        conditions: 'Magic Reaction ≥10 stacks'
                    },
                    {
                        name: 'Trick Shot ATK Boost',
                        effects: { atk: 24 },
                        duration: 'temporary',
                        conditions: 'On Trick Shot use'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Magic Reaction',
                        effects: { fireDamageTaken: 1 },
                        duration: 'stackable', maxStacks: 20
                    }
                ]
            },
            A4: {
                passives: [
                    {
                        name: 'ATK Enhancement',
                        description: '+12% ATK permanent',
                        type: 'selfBuff',
                        conditions: 'Always active'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Spotlight + A2 (Def Pen)',
                        effects: { defPen: 36 },
                        duration: 'infinite'
                    },
                    {
                        name: 'Spotlight (Damage Increase)',
                        effects: { damageIncrease: '24% of Def Pen stat' },
                        duration: 24
                    },
                    {
                        name: 'Hell Fire Transformation',
                        effects: { skillDamage: 40 },
                        duration: 'while Hell Fire active',
                        conditions: 'Magic Reaction ≥10 stacks'
                    },
                    {
                        name: 'Trick Shot ATK Boost',
                        effects: { atk: 24 },
                        duration: 'temporary',
                        conditions: 'On Trick Shot use'
                    },
                    {
                        name: 'ATK Enhancement (A4)',
                        effects: { atk: 12 },
                        duration: 'infinite'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Magic Reaction',
                        effects: { fireDamageTaken: 1 },
                        duration: 'stackable', maxStacks: 20
                    }
                ]
            },
            A5: {
                passives: [
                    {
                        name: 'Enhanced Magic Reaction Scaling',
                        description: '+6% Kill Shot/Hell Fire DMG par stack de Magic Reaction (max 20 stacks = +120% DMG)',
                        type: 'selfBuff',
                        conditions: 'Per Magic Reaction stack on enemy'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Spotlight + A2 (Def Pen)',
                        effects: { defPen: 36 },
                        duration: 'infinite',
                        note: 'Total avec arme A5: 36% + 12% = 48% Def Pen perso'
                    },
                    {
                        name: 'Spotlight (Damage Increase)',
                        effects: { damageIncrease: '24% of Def Pen stat' },
                        duration: 24
                    },
                    {
                        name: 'Hell Fire Transformation',
                        effects: { skillDamage: 40 },
                        duration: 'while Hell Fire active',
                        conditions: 'Magic Reaction ≥10 stacks'
                    },
                    {
                        name: 'Trick Shot ATK Boost',
                        effects: { atk: 24 },
                        duration: 'temporary',
                        conditions: 'On Trick Shot use'
                    },
                    {
                        name: 'ATK Enhancement (A4)',
                        effects: { atk: 12 },
                        duration: 'infinite'
                    },
                    {
                        name: 'Magic Reaction Scaling (A5)',
                        effects: { killShotHellFireDamage: 6 },
                        duration: 'per Magic Reaction stack',
                        maxStacks: 20,
                        note: 'Max 20 stacks = +120% Kill Shot/Hell Fire DMG → burst INSANE'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Magic Reaction',
                        effects: { fireDamageTaken: 1 },
                        duration: 'stackable', maxStacks: 20,
                        note: '+20% Fire DMG taken → buff TOUTE la team Fire'
                    }
                ]
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 💧 FRIEREN - Support / Sub-DPS Water (DEF scaling, Frieren collab)
    // Mana Power Control → +50% DEF (A3). Vollzanbel debuff.
    // A2: +9% ATK/DEF/HP team. A4: +20% Crit DMG team.
    // ═══════════════════════════════════════════════════════════════
    frieren: {
        id: 'frieren',
        name: 'Frieren',
        class: 'Mage / Support',
        element: 'Water',
        scaleStat: 'DEF',
        primaryRole: 'Support',
        secondaryRole: 'Sub-DPS',
        tags: ['DEF Scaler', 'Team Buffer', 'Debuffer', 'Shielder', 'Healer', 'Crit DMG Buffer'],

        advancements: {
            // A0 - Mana Power Control (+25% DEF, +25% if MP≥50%), Mana Power Liberation (Ult: +100% CR), Defense Magic (Shield)
            A0: {
                passives: [
                    {
                        name: 'Mana Power Control',
                        description: '+25% DEF. Si MP ≥ 50% → +25% DEF supplémentaire (total +50% DEF conditionnellement).',
                        mechanic: 'conditional',
                        duration: 'infinite'
                    },
                    {
                        name: 'Mana Power Liberation',
                        description: 'Pendant l\'Ultimate → +100% Crit Rate.',
                        mechanic: 'conditional',
                        duration: 'ultimate'
                    },
                    {
                        name: 'Defense Magic',
                        description: 'Shield = 20% DEF. -5% DMG taken. Durée 30s.',
                        mechanic: 'passive',
                        duration: 30
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Mana Power Control',
                        effects: { defense: 25 },
                        duration: 'infinite',
                        note: '+25% DEF permanent'
                    },
                    {
                        name: 'Mana Power Control (MP≥50%)',
                        effects: { defense: 25 },
                        duration: 'infinite',
                        condition: 'MP ≥ 50%',
                        note: '+25% DEF supplémentaire si MP ≥ 50% (total +50%)'
                    },
                    {
                        name: 'Mana Power Liberation',
                        effects: { critRate: 100 },
                        duration: 'ultimate',
                        trigger: 'During Ultimate',
                        note: '+100% Crit Rate pendant l\'Ult → garantit les crits'
                    },
                    {
                        name: 'Defense Magic',
                        effects: { damageTakenReduction: 5 },
                        duration: 30,
                        trigger: 'Passive',
                        note: 'Shield 20% DEF + -5% DMG taken (30s)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            },

            // A1 - Vollzanbel debuff (-5% DEF, +5% crit chance, +5% crit DMG taken, +35% DMG from Frieren)
            A1: {
                passives: [
                    { name: 'Mana Power Control', mechanic: 'conditional', duration: 'infinite' },
                    { name: 'Mana Power Liberation', mechanic: 'conditional', duration: 'ultimate' },
                    { name: 'Defense Magic', mechanic: 'passive', duration: 30 },
                    {
                        name: 'Vollzanbel (A1)',
                        description: 'Vollzanbel applique debuff: -5% DEF ennemi, +5% chance de recevoir crit, +5% Crit DMG taken, +35% DMG from Frieren. 20s.',
                        mechanic: 'debuff',
                        duration: 20
                    }
                ],
                selfBuffs: [
                    { name: 'Mana Power Control', effects: { defense: 25 }, duration: 'infinite' },
                    { name: 'Mana Power Control (MP≥50%)', effects: { defense: 25 }, duration: 'infinite', condition: 'MP ≥ 50%' },
                    { name: 'Mana Power Liberation', effects: { critRate: 100 }, duration: 'ultimate', trigger: 'During Ultimate' },
                    { name: 'Defense Magic', effects: { damageTakenReduction: 5 }, duration: 30 }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Vollzanbel (A1)',
                        effects: {
                            defReduction: 5,
                            critChanceReceived: 5,
                            critDamageTaken: 5,
                            personalDamageBonus: 35
                        },
                        duration: 20,
                        trigger: 'Vollzanbel hit',
                        note: '-5% DEF, +5% crit chance received, +5% Crit DMG taken, +35% DMG from Frieren (20s)'
                    }
                ]
            },

            // A2 - +9% ATK/DEF/HP entire team
            A2: {
                passives: [
                    { name: 'Mana Power Control', mechanic: 'conditional', duration: 'infinite' },
                    { name: 'Mana Power Liberation', mechanic: 'conditional', duration: 'ultimate' },
                    { name: 'Defense Magic', mechanic: 'passive', duration: 30 },
                    { name: 'Vollzanbel (A1)', mechanic: 'debuff', duration: 20 },
                    {
                        name: 'Team Stats Boost (A2)',
                        description: '+9% ATK, +9% DEF, +9% HP pour toute la team.',
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    { name: 'Mana Power Control', effects: { defense: 25 }, duration: 'infinite' },
                    { name: 'Mana Power Control (MP≥50%)', effects: { defense: 25 }, duration: 'infinite', condition: 'MP ≥ 50%' },
                    { name: 'Mana Power Liberation', effects: { critRate: 100 }, duration: 'ultimate', trigger: 'During Ultimate' },
                    { name: 'Defense Magic', effects: { damageTakenReduction: 5 }, duration: 30 }
                ],
                teamBuffs: [
                    {
                        name: 'Team Stats Boost (A2)',
                        effects: { attack: 9, defense: 9, hp: 9 },
                        duration: 'infinite',
                        note: '+9% ATK/DEF/HP pour toute la team'
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Vollzanbel (A1)',
                        effects: { defReduction: 5, critChanceReceived: 5, critDamageTaken: 5, personalDamageBonus: 35 },
                        duration: 20,
                        trigger: 'Vollzanbel hit'
                    }
                ]
            },

            // A3 - Enhanced Mana Power Control (+50% DEF, +50% if MP≥50%), Enhanced Defense Magic (30% shield, -10% DMG taken, 60s)
            A3: {
                passives: [
                    {
                        name: 'Enhanced Mana Power Control (A3)',
                        description: '+50% DEF (au lieu de +25%). Si MP ≥ 50% → +50% DEF supplémentaire (total +100% DEF!).',
                        mechanic: 'conditional',
                        duration: 'infinite'
                    },
                    { name: 'Mana Power Liberation', mechanic: 'conditional', duration: 'ultimate' },
                    {
                        name: 'Enhanced Defense Magic (A3)',
                        description: 'Shield = 30% DEF (au lieu de 20%). -10% DMG taken (au lieu de -5%). Durée 60s (au lieu de 30s).',
                        mechanic: 'passive',
                        duration: 60
                    },
                    { name: 'Vollzanbel (A1)', mechanic: 'debuff', duration: 20 },
                    { name: 'Team Stats Boost (A2)', mechanic: 'permanent' }
                ],
                selfBuffs: [
                    {
                        name: 'Enhanced Mana Power Control (A3)',
                        effects: { defense: 50 },
                        duration: 'infinite',
                        note: '+50% DEF permanent (doublé par rapport à A0)'
                    },
                    {
                        name: 'Enhanced Mana Power Control (MP≥50%) (A3)',
                        effects: { defense: 50 },
                        duration: 'infinite',
                        condition: 'MP ≥ 50%',
                        note: '+50% DEF supplémentaire si MP ≥ 50% (total +100% DEF!)'
                    },
                    { name: 'Mana Power Liberation', effects: { critRate: 100 }, duration: 'ultimate', trigger: 'During Ultimate' },
                    {
                        name: 'Enhanced Defense Magic (A3)',
                        effects: { damageTakenReduction: 10 },
                        duration: 60,
                        note: 'Shield 30% DEF + -10% DMG taken (60s, doublé)'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Team Stats Boost (A2)',
                        effects: { attack: 9, defense: 9, hp: 9 },
                        duration: 'infinite'
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Vollzanbel (A1)',
                        effects: { defReduction: 5, critChanceReceived: 5, critDamageTaken: 5, personalDamageBonus: 35 },
                        duration: 20,
                        trigger: 'Vollzanbel hit'
                    }
                ]
            },

            // A4 - +20% Crit DMG entire team
            A4: {
                passives: [
                    { name: 'Enhanced Mana Power Control (A3)', mechanic: 'conditional', duration: 'infinite' },
                    { name: 'Mana Power Liberation', mechanic: 'conditional', duration: 'ultimate' },
                    { name: 'Enhanced Defense Magic (A3)', mechanic: 'passive', duration: 60 },
                    { name: 'Vollzanbel (A1)', mechanic: 'debuff', duration: 20 },
                    { name: 'Team Stats Boost (A2)', mechanic: 'permanent' },
                    {
                        name: 'Crit DMG Team Boost (A4)',
                        description: '+20% Crit DMG pour toute la team.',
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    { name: 'Enhanced Mana Power Control (A3)', effects: { defense: 50 }, duration: 'infinite' },
                    { name: 'Enhanced Mana Power Control (MP≥50%) (A3)', effects: { defense: 50 }, duration: 'infinite', condition: 'MP ≥ 50%' },
                    { name: 'Mana Power Liberation', effects: { critRate: 100 }, duration: 'ultimate', trigger: 'During Ultimate' },
                    { name: 'Enhanced Defense Magic (A3)', effects: { damageTakenReduction: 10 }, duration: 60 }
                ],
                teamBuffs: [
                    {
                        name: 'Team Stats Boost (A2)',
                        effects: { attack: 9, defense: 9, hp: 9 },
                        duration: 'infinite'
                    },
                    {
                        name: 'Crit DMG Team Boost (A4)',
                        effects: { critDMG: 20 },
                        duration: 'infinite',
                        note: '+20% Crit DMG pour toute la team'
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Vollzanbel (A1)',
                        effects: { defReduction: 5, critChanceReceived: 5, critDamageTaken: 5, personalDamageBonus: 35 },
                        duration: 20,
                        trigger: 'Vollzanbel hit'
                    }
                ]
            },

            // A5 - Enhanced Vollzanbel (-10% DEF, +15% crit chance, +15% crit DMG taken, +70% DMG from Frieren, 30s) + Judradjim 80% Power Gauge
            A5: {
                passives: [
                    { name: 'Enhanced Mana Power Control (A3)', mechanic: 'conditional', duration: 'infinite' },
                    { name: 'Mana Power Liberation', mechanic: 'conditional', duration: 'ultimate' },
                    { name: 'Enhanced Defense Magic (A3)', mechanic: 'passive', duration: 60 },
                    { name: 'Team Stats Boost (A2)', mechanic: 'permanent' },
                    { name: 'Crit DMG Team Boost (A4)', mechanic: 'permanent' },
                    {
                        name: 'Enhanced Vollzanbel (A5)',
                        description: '-10% DEF, +15% crit chance received, +15% Crit DMG taken, +70% DMG from Frieren. 30s.',
                        mechanic: 'debuff',
                        duration: 30
                    },
                    {
                        name: 'Judradjim Enhancement (A5)',
                        description: 'Judradjim rempli 80% de la Power Gauge.',
                        mechanic: 'utility'
                    }
                ],
                selfBuffs: [
                    { name: 'Enhanced Mana Power Control (A3)', effects: { defense: 50 }, duration: 'infinite' },
                    { name: 'Enhanced Mana Power Control (MP≥50%) (A3)', effects: { defense: 50 }, duration: 'infinite', condition: 'MP ≥ 50%' },
                    { name: 'Mana Power Liberation', effects: { critRate: 100 }, duration: 'ultimate', trigger: 'During Ultimate' },
                    { name: 'Enhanced Defense Magic (A3)', effects: { damageTakenReduction: 10 }, duration: 60 }
                ],
                teamBuffs: [
                    {
                        name: 'Team Stats Boost (A2)',
                        effects: { attack: 9, defense: 9, hp: 9 },
                        duration: 'infinite'
                    },
                    {
                        name: 'Crit DMG Team Boost (A4)',
                        effects: { critDMG: 20 },
                        duration: 'infinite'
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Enhanced Vollzanbel (A5)',
                        effects: {
                            defReduction: 10,
                            critChanceReceived: 15,
                            critDamageTaken: 15,
                            personalDamageBonus: 70
                        },
                        duration: 30,
                        trigger: 'Vollzanbel hit',
                        note: '-10% DEF, +15% crit received, +15% Crit DMG taken, +70% DMG from Frieren (30s)'
                    }
                ]
            }
        }
    },

    // 💧 Anna Ruiz - Water Breaker ATK - Poison/Break Specialist
    anna: {
        id: 'anna',
        name: 'Anna Ruiz',
        element: 'Water',
        scaleStat: 'ATK',
        advancements: {
            A0: {
                passives: [
                    {
                        name: 'Corrosive Poison',
                        description: '6% chance on skill hit to inflict Corrosive Poison (100 Break DMG + 30% ATK every 3s, 30s)',
                        effects: {},
                        trigger: 'on skill hit (6% chance)',
                        note: 'DoT + Break over time. No direct stat buff'
                    }
                ],
                selfBuffs: [],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Weapon: Poison Shower',
                        trigger: 'Poison Shower hits',
                        scope: 'enemy',
                        effects: { defReduction: 2.5 },
                        duration: 5,
                        note: '-2.5% DEF on enemy for 5s (Weapon A0)'
                    }
                ]
            },
            A1: {
                passives: [
                    {
                        name: 'Corrosive Poison',
                        description: '6% chance on skill hit to inflict Corrosive Poison',
                        effects: {},
                        trigger: 'on skill hit (6% chance)',
                        note: 'DoT + Break over time'
                    },
                    {
                        name: 'Blind',
                        description: 'Enemies in Poisonous Zone are inflicted with Blind (1.5s immobilize)',
                        effects: {},
                        trigger: 'enemy in Poisonous Zone',
                        note: 'CC: 1.5s immobilize in Poisonous Zone'
                    }
                ],
                selfBuffs: [],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Weapon: Poison Shower',
                        trigger: 'Poison Shower hits',
                        scope: 'enemy',
                        effects: { defReduction: 4 },
                        duration: 5,
                        note: '-4% DEF on enemy for 5s (Weapon A1)'
                    }
                ]
            },
            A2: {
                passives: [
                    {
                        name: 'Corrosive Poison',
                        description: '6% chance on skill hit to inflict Corrosive Poison',
                        effects: {},
                        trigger: 'on skill hit (6% chance)',
                        note: 'DoT + Break over time'
                    },
                    {
                        name: 'Blind',
                        description: 'Enemies in Poisonous Zone are inflicted with Blind (1.5s immobilize)',
                        effects: {},
                        trigger: 'enemy in Poisonous Zone',
                        note: 'CC: 1.5s immobilize'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Break Specialist',
                        trigger: 'passive',
                        scope: 'self',
                        effects: { breakTargetDmg: 10 },
                        duration: 'infinite',
                        note: '+10% Break damage'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Weapon: Poison Shower',
                        trigger: 'Poison Shower hits',
                        scope: 'enemy',
                        effects: { defReduction: 5.5 },
                        duration: 5,
                        note: '-5.5% DEF on enemy for 5s (Weapon A2)'
                    }
                ]
            },
            A3: {
                passives: [
                    {
                        name: 'Enhanced Corrosive Poison',
                        description: 'Corrosive Poison now decreases DEF by 1% per stack (max 10 stacks = -10% DEF)',
                        effects: { defReduction: 10 },
                        trigger: 'Corrosive Poison on enemy',
                        note: '-1% DEF per stack, up to -10% DEF on enemy (30s)'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Break Specialist',
                        trigger: 'passive',
                        scope: 'self',
                        effects: { breakTargetDmg: 10 },
                        duration: 'infinite',
                        note: '+10% Break damage'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Weapon: Poison Shower',
                        trigger: 'Poison Shower hits',
                        scope: 'enemy',
                        effects: { defReduction: 7 },
                        duration: 5,
                        note: '-7% DEF on enemy for 5s (Weapon A3)'
                    },
                    {
                        name: 'Enhanced Corrosive Poison',
                        trigger: 'Corrosive Poison stacks on enemy',
                        scope: 'enemy',
                        effects: { defReduction: 10 },
                        duration: 30,
                        note: '-1% DEF per stack, max 10 stacks = -10% DEF (30s)'
                    }
                ]
            },
            A4: {
                passives: [
                    {
                        name: 'Enhanced Corrosive Poison',
                        description: 'Corrosive Poison decreases DEF by 1% per stack (max 10)',
                        effects: { defReduction: 10 },
                        trigger: 'Corrosive Poison on enemy',
                        note: '-10% DEF on enemy at max stacks'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Break Specialist',
                        trigger: 'passive',
                        scope: 'self',
                        effects: { breakTargetDmg: 10 },
                        duration: 'infinite',
                        note: '+10% Break damage'
                    },
                    {
                        name: 'ATK Boost',
                        trigger: 'passive',
                        scope: 'self',
                        effects: { attack: 10 },
                        duration: 'infinite',
                        note: '+10% ATK'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Weapon: Poison Shower',
                        trigger: 'Poison Shower hits',
                        scope: 'enemy',
                        effects: { defReduction: 8.5 },
                        duration: 5,
                        note: '-8.5% DEF on enemy for 5s (Weapon A4)'
                    },
                    {
                        name: 'Enhanced Corrosive Poison',
                        trigger: 'Corrosive Poison stacks on enemy',
                        scope: 'enemy',
                        effects: { defReduction: 10 },
                        duration: 30,
                        note: '-1% DEF per stack, max 10 stacks = -10% DEF (30s)'
                    }
                ]
            },
            A5: {
                passives: [
                    {
                        name: 'Enhanced Corrosive Poison',
                        description: 'Corrosive Poison decreases DEF by 1% per stack (max 10)',
                        effects: { defReduction: 10 },
                        trigger: 'Corrosive Poison on enemy',
                        note: '-10% DEF on enemy at max stacks'
                    },
                    {
                        name: 'Poison Wave Amplification',
                        description: 'Increases Poison Wave damage by 100%',
                        effects: {},
                        trigger: 'passive',
                        note: '+100% Poison Wave damage (skill multiplier, not a stat buff)'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Break Specialist',
                        trigger: 'passive',
                        scope: 'self',
                        effects: { breakTargetDmg: 10 },
                        duration: 'infinite',
                        note: '+10% Break damage'
                    },
                    {
                        name: 'ATK Boost',
                        trigger: 'passive',
                        scope: 'self',
                        effects: { attack: 10 },
                        duration: 'infinite',
                        note: '+10% ATK'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Weapon: Poison Shower',
                        trigger: 'Poison Shower hits',
                        scope: 'enemy',
                        effects: { defReduction: 10 },
                        duration: 5,
                        note: '-10% DEF on enemy for 5s (Weapon A5)'
                    },
                    {
                        name: 'Enhanced Corrosive Poison',
                        trigger: 'Corrosive Poison stacks on enemy',
                        scope: 'enemy',
                        effects: { defReduction: 10 },
                        duration: 30,
                        note: '-1% DEF per stack, max 10 stacks = -10% DEF (30s)'
                    }
                ]
            }
        }
    },

    // 💧 Cha Hae-In Water (Pure Sword Princess) - Fighter DPS DEF Scaler
    chae: {
        id: 'chae',
        name: 'Cha Hae-In (Pure Sword Princess)',
        element: 'Water',
        scaleStat: 'DEF',
        advancements: {
            A0: {
                passives: [
                    {
                        name: 'Heavenly Swords',
                        description: 'When Sword Princess\'s Dance or Heavenly Strike hit, summons Heavenly Swords (175% DEF per blade, counts as Basic Skill)',
                        effects: {},
                        trigger: 'on Sword Princess\'s Dance or Heavenly Strike hit (CD 0.5s)',
                        note: 'Extra damage source scaling on DEF'
                    },
                    {
                        name: 'Will of the Sword',
                        description: 'Per gauge recharge level: +5% DEF, +2% CR, +2% CritDMG (max 6 stacks, 15s)',
                        effects: { defense: 30, critRate: 12, critDMG: 12 },
                        trigger: 'Sword Princess\'s Dance or Heavenly Strike recharges gauge',
                        note: '6 stacks max: +30% DEF, +12% CR, +12% CritDMG'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Will of the Sword (6 stacks)',
                        trigger: 'gauge recharge (Sword Princess\'s Dance / Heavenly Strike)',
                        scope: 'self',
                        effects: { defense: 30, critRate: 12, critDMG: 12 },
                        duration: 15,
                        note: '+5% DEF, +2% CR, +2% CritDMG per stack (max 6)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Weapon: Will of the Sword DEF Stack',
                        trigger: 'Will of the Sword gauge recharge',
                        scope: 'self',
                        effects: { defense: 2 },
                        duration: 'stacking',
                        note: 'Weapon: +2% DEF per gauge recharge (up to 60 stacks)'
                    }
                ]
            },
            A1: {
                passives: [
                    {
                        name: 'Heavenly Swords',
                        description: 'Summons Heavenly Swords on hit (175% DEF per blade, Basic Skill)',
                        effects: {},
                        trigger: 'on Sword Princess\'s Dance or Heavenly Strike hit',
                        note: 'Extra damage source scaling on DEF'
                    },
                    {
                        name: 'Will of the Sword (Enhanced)',
                        description: 'Per gauge recharge level: +10% DEF, +2% CR, +2% CritDMG (max 6 stacks, 15s)',
                        effects: { defense: 60, critRate: 12, critDMG: 12 },
                        trigger: 'gauge recharge',
                        note: '6 stacks max: +60% DEF, +12% CR, +12% CritDMG'
                    },
                    {
                        name: 'Quick Attack: Swordstorm',
                        description: 'Swordstorm changes to Quick Attack: Swordstorm (+60% damage)',
                        effects: {},
                        trigger: 'passive',
                        note: '+60% Swordstorm damage'
                    },
                    {
                        name: 'Blade Master',
                        description: 'After Heavenly Strike, Core Attack → Dance of Scattered Blades (Super Armor, no Core Gauge consumed, 5s)',
                        effects: {},
                        trigger: 'after Heavenly Strike',
                        note: 'Free Core Attacks with Super Armor for 5s'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Will of the Sword Enhanced (6 stacks)',
                        trigger: 'gauge recharge',
                        scope: 'self',
                        effects: { defense: 60, critRate: 12, critDMG: 12 },
                        duration: 15,
                        note: '+10% DEF, +2% CR, +2% CritDMG per stack (max 6)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Weapon: Will of the Sword DEF Stack',
                        trigger: 'Will of the Sword gauge recharge',
                        scope: 'self',
                        effects: { defense: 4 },
                        duration: 'stacking',
                        note: 'Weapon: +4% DEF per gauge recharge (up to 60 stacks)'
                    }
                ]
            },
            A2: {
                passives: [
                    {
                        name: 'Heavenly Swords',
                        description: 'Summons Heavenly Swords on hit (175% DEF per blade, Basic Skill)',
                        effects: {},
                        trigger: 'on hit',
                        note: 'Extra DEF-scaling damage'
                    },
                    {
                        name: 'Will of the Sword (Enhanced)',
                        description: '+10% DEF, +2% CR, +2% CritDMG per stack (max 6, 15s)',
                        effects: { defense: 60, critRate: 12, critDMG: 12 },
                        trigger: 'gauge recharge',
                        note: '6 stacks: +60% DEF, +12% CR, +12% CritDMG'
                    },
                    {
                        name: 'Quick Attack: Swordstorm',
                        description: '+60% Swordstorm damage',
                        effects: {},
                        trigger: 'passive',
                        note: '+60% Swordstorm damage'
                    },
                    {
                        name: 'Blade Master',
                        description: 'Free Core Attacks with Super Armor for 5s after Heavenly Strike',
                        effects: {},
                        trigger: 'after Heavenly Strike',
                        note: 'No Core Gauge consumption'
                    },
                    {
                        name: 'Unrecoverable',
                        description: 'Heavenly Strike inflicts Unrecoverable (30s)',
                        effects: {},
                        trigger: 'Heavenly Strike hit',
                        note: 'Enemy cannot recover HP for 30s'
                    },
                    {
                        name: 'Paralyze',
                        description: 'Sword of Destiny inflicts Paralyze (3s)',
                        effects: {},
                        trigger: 'Sword of Destiny hit',
                        note: 'CC: Interrupts enemy for 3s'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Will of the Sword Enhanced (6 stacks)',
                        trigger: 'gauge recharge',
                        scope: 'self',
                        effects: { defense: 60, critRate: 12, critDMG: 12 },
                        duration: 15,
                        note: '+10% DEF, +2% CR, +2% CritDMG per stack (max 6)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Weapon: Will of the Sword DEF Stack',
                        trigger: 'gauge recharge',
                        scope: 'self',
                        effects: { defense: 6 },
                        duration: 'stacking',
                        note: 'Weapon: +6% DEF per gauge recharge (up to 60 stacks)'
                    },
                    {
                        name: 'Unrecoverable',
                        trigger: 'Heavenly Strike hit',
                        scope: 'enemy',
                        effects: {},
                        duration: 30,
                        note: 'Enemy cannot recover HP for 30s'
                    },
                    {
                        name: 'Paralyze',
                        trigger: 'Sword of Destiny hit',
                        scope: 'enemy',
                        effects: {},
                        duration: 3,
                        note: 'CC: Interrupts enemy for 3s'
                    }
                ]
            },
            A3: {
                passives: [
                    {
                        name: 'Heavenly Swords',
                        description: 'Summons Heavenly Swords on hit (175% DEF per blade, Basic Skill)',
                        effects: {},
                        trigger: 'on hit',
                        note: 'Extra DEF-scaling damage'
                    },
                    {
                        name: 'Will of the Sword (Enhanced)',
                        description: '+10% DEF, +2% CR, +2% CritDMG per stack (max 6, 15s)',
                        effects: { defense: 60, critRate: 12, critDMG: 12 },
                        trigger: 'gauge recharge',
                        note: '6 stacks: +60% DEF, +12% CR, +12% CritDMG'
                    },
                    {
                        name: 'Quick Attack: Swordstorm (+60%)',
                        description: '+60% Swordstorm damage',
                        effects: {},
                        trigger: 'passive',
                        note: '+60% Swordstorm damage'
                    },
                    {
                        name: 'Blade Master',
                        description: 'Free Core Attacks with Super Armor (5s)',
                        effects: {},
                        trigger: 'after Heavenly Strike',
                        note: 'No Core Gauge consumption'
                    },
                    {
                        name: 'Sword\'s Resolve',
                        description: 'At 100% Will of the Sword gauge: Heavenly Strike → Heavy Attack: Heavenly Strike (+170% damage, 6s)',
                        effects: {},
                        trigger: 'Will of the Sword gauge at 100%',
                        note: 'Massive burst window: +170% Heavenly Strike damage for 6s'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Will of the Sword Enhanced (6 stacks)',
                        trigger: 'gauge recharge',
                        scope: 'self',
                        effects: { defense: 60, critRate: 12, critDMG: 12 },
                        duration: 15,
                        note: '+10% DEF, +2% CR, +2% CritDMG per stack (max 6)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Weapon: Will of the Sword DEF Stack',
                        trigger: 'gauge recharge',
                        scope: 'self',
                        effects: { defense: 8 },
                        duration: 'stacking',
                        note: 'Weapon: +8% DEF per gauge recharge (up to 60 stacks)'
                    },
                    {
                        name: 'Unrecoverable',
                        trigger: 'Heavenly Strike hit',
                        scope: 'enemy',
                        effects: {},
                        duration: 30,
                        note: 'Enemy cannot recover HP for 30s'
                    },
                    {
                        name: 'Paralyze',
                        trigger: 'Sword of Destiny hit',
                        scope: 'enemy',
                        effects: {},
                        duration: 3,
                        note: 'CC: Interrupts enemy for 3s'
                    }
                ]
            },
            A4: {
                passives: [
                    {
                        name: 'Heavenly Swords',
                        description: 'Summons Heavenly Swords on hit (175% DEF per blade, Basic Skill)',
                        effects: {},
                        trigger: 'on hit',
                        note: 'Extra DEF-scaling damage'
                    },
                    {
                        name: 'Will of the Sword (Enhanced)',
                        description: '+10% DEF, +2% CR, +2% CritDMG per stack (max 6, 15s)',
                        effects: { defense: 60, critRate: 12, critDMG: 12 },
                        trigger: 'gauge recharge',
                        note: '6 stacks: +60% DEF, +12% CR, +12% CritDMG'
                    },
                    {
                        name: 'Quick Attack: Swordstorm (+60%)',
                        description: '+60% Swordstorm damage',
                        effects: {},
                        trigger: 'passive',
                        note: '+60% Swordstorm damage'
                    },
                    {
                        name: 'Blade Master',
                        description: 'Free Core Attacks with Super Armor (5s)',
                        effects: {},
                        trigger: 'after Heavenly Strike',
                        note: 'No Core Gauge consumption'
                    },
                    {
                        name: 'Sword\'s Resolve',
                        description: 'At 100% gauge: Heavy Attack: Heavenly Strike (+170% damage, 6s)',
                        effects: {},
                        trigger: 'Will of the Sword gauge at 100%',
                        note: '+170% Heavenly Strike damage for 6s'
                    },
                    {
                        name: 'Pure Sword Princess Synergy (A4)',
                        description: '+7% CR & +7% CritDMG per Water ally. Guild Boss: no stack limit (6×7% = +42%)',
                        effects: { critRate: 42, critDMG: 42 },
                        trigger: 'passive (per Water ally in raid)',
                        note: 'A4 NEW: Raid buff self only. +7% CR/CD per Water ally, no limit in Guild Boss'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Will of the Sword Enhanced (6 stacks)',
                        trigger: 'gauge recharge',
                        scope: 'self',
                        effects: { defense: 60, critRate: 12, critDMG: 12 },
                        duration: 15,
                        note: '+10% DEF, +2% CR, +2% CritDMG per stack (max 6)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [
                    {
                        name: 'Pure Sword Princess Synergy (A4)',
                        trigger: 'passive (per Water ally)',
                        scope: 'team-water',
                        effects: { critRate: 42, critDMG: 42 },
                        duration: 'infinite',
                        note: 'A4: +7% CR & +7% CritDMG per Water ally (team only, not raid-wide)'
                    }
                ],
                debuffs: [
                    {
                        name: 'Weapon: Will of the Sword DEF Stack',
                        trigger: 'gauge recharge',
                        scope: 'self',
                        effects: { defense: 10 },
                        duration: 'stacking',
                        note: 'Weapon: +10% DEF per gauge recharge (up to 60 stacks)'
                    },
                    {
                        name: 'Unrecoverable',
                        trigger: 'Heavenly Strike hit',
                        scope: 'enemy',
                        effects: {},
                        duration: 30,
                        note: 'Enemy cannot recover HP for 30s'
                    },
                    {
                        name: 'Paralyze',
                        trigger: 'Sword of Destiny hit',
                        scope: 'enemy',
                        effects: {},
                        duration: 3,
                        note: 'CC: Interrupts enemy for 3s'
                    }
                ]
            },
            A5: {
                passives: [
                    {
                        name: 'Heavenly Swords',
                        description: 'Summons Heavenly Swords on hit (175% DEF per blade, Basic Skill)',
                        effects: {},
                        trigger: 'on hit',
                        note: 'Extra DEF-scaling damage'
                    },
                    {
                        name: 'Will of the Sword (A5 Enhanced)',
                        description: '+10% DEF, +4% CR, +4% CritDMG per stack (max 6, 15s)',
                        effects: { defense: 60, critRate: 24, critDMG: 24 },
                        trigger: 'gauge recharge',
                        note: '6 stacks: +60% DEF, +24% CR, +24% CritDMG'
                    },
                    {
                        name: 'Quick Attack: Swordstorm (+60%)',
                        description: '+60% Swordstorm damage',
                        effects: {},
                        trigger: 'passive',
                        note: '+60% Swordstorm damage'
                    },
                    {
                        name: 'Blade Master',
                        description: 'Free Core Attacks with Super Armor (5s)',
                        effects: {},
                        trigger: 'after Heavenly Strike',
                        note: 'No Core Gauge consumption'
                    },
                    {
                        name: 'Sword\'s Resolve',
                        description: 'At 100% gauge: Heavy Attack: Heavenly Strike (+170% damage, 6s)',
                        effects: {},
                        trigger: 'Will of the Sword gauge at 100%',
                        note: '+170% Heavenly Strike damage for 6s'
                    },
                    {
                        name: 'Pure Sword Princess',
                        description: 'Sword of Destiny +60% damage, Heavenly Strike & Heavy Attack: Heavenly Strike +60% damage (permanent)',
                        effects: {},
                        trigger: 'on stage entry (infinite)',
                        note: '+60% damage on Sword of Destiny + Heavenly Strike (permanent)'
                    },
                    {
                        name: 'Pure Sword Princess Synergy (A4)',
                        description: '+7% CR & +7% CritDMG per Water ally. Guild Boss: no stack limit (6×7% = +42%)',
                        effects: { critRate: 42, critDMG: 42 },
                        trigger: 'passive (per Water ally in raid)',
                        note: 'A4: Raid buff self only. +7% CR/CD per Water ally, no limit in Guild Boss'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Will of the Sword A5 (6 stacks)',
                        trigger: 'gauge recharge',
                        scope: 'self',
                        effects: { defense: 60, critRate: 24, critDMG: 24 },
                        duration: 15,
                        note: '+10% DEF, +4% CR, +4% CritDMG per stack (max 6)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [
                    {
                        name: 'Pure Sword Princess Synergy (A4)',
                        trigger: 'passive (per Water ally)',
                        scope: 'team-water',
                        effects: { critRate: 42, critDMG: 42 },
                        duration: 'infinite',
                        note: 'A4: +7% CR & +7% CritDMG per Water ally (team only, not raid-wide)'
                    }
                ],
                debuffs: [
                    {
                        name: 'Weapon: Will of the Sword DEF Stack',
                        trigger: 'gauge recharge',
                        scope: 'self',
                        effects: { defense: 12 },
                        duration: 'stacking',
                        note: 'Weapon: +12% DEF per gauge recharge (up to 60 stacks)'
                    },
                    {
                        name: 'Unrecoverable',
                        trigger: 'Heavenly Strike / Skill 2 hit',
                        scope: 'enemy',
                        effects: {},
                        duration: 30,
                        note: 'Enemy cannot recover HP for 30s'
                    },
                    {
                        name: 'Paralyze',
                        trigger: 'Sword of Destiny hit',
                        scope: 'enemy',
                        effects: {},
                        duration: 3,
                        note: 'CC: Interrupts enemy for 3s'
                    }
                ]
            }
        }
    },

    // 💧 Meri Laine - Water Infusion HP - Water Overload Specialist
    meri: {
        id: 'meri',
        name: 'Meri Laine',
        element: 'Water',
        scaleStat: 'HP',
        advancements: {
            A0: {
                passives: [
                    { name: 'Pengqueen Normal Mode', description: 'Grinding Rush → 1 Winter Chill. Ascending Slam on Winter Chill → Memories of Winter. Skills charge Pengqueen Booster Gauge. Frozen Drive → Booster Mode.', effects: {}, trigger: 'stage start (infinite)', note: 'Core mechanic: cycle Normal → Booster Mode' },
                    { name: 'Pengqueen Booster Mode', description: 'Blade Sweep → Raging Sweep, +25% DMG vs Winter Chill, +5% Water Elem Acc, Super Armor (10s)', effects: { waterElementalAccumulation: 5 }, trigger: 'on Frozen Drive', note: '+25% Raging Sweep/Frozen Drive DMG vs Winter Chill, +5% Water Elem Acc, Super Armor (10s)' },
                    { name: 'Memories of Winter', description: '+15% Water DMG, +15% Blade/Raging Sweep DMG (30s)', effects: { waterDamage: 15 }, trigger: 'Ascending Slam on Winter Chill target', note: '+15% Water DMG + +15% Sweep DMG (30s)' },
                    { name: 'Weapon: HP Boost', description: '+5% HP', effects: { hp: 5 }, trigger: 'passive', note: 'Weapon: +5% HP' },
                    { name: 'Weapon: Water DMG Team', description: 'Blade/Raging Sweep → +0.1% Water DMG team (50 stacks = +5%)', effects: { waterDamage: 5 }, trigger: 'on Blade/Raging Sweep hit', note: 'Weapon: +5% Water DMG team (50×0.1%, 45s)' }
                ],
                selfBuffs: [
                    { name: 'Pengqueen Booster Mode', trigger: 'on Frozen Drive', scope: 'self', effects: { waterElementalAccumulation: 5 }, duration: 10, note: '+5% Water Elem Acc (10s)' },
                    { name: 'Memories of Winter', trigger: 'Ascending Slam on Winter Chill', scope: 'self', effects: { waterDamage: 15 }, duration: 30, note: '+15% Water DMG (30s)' },
                    { name: 'Weapon: HP Boost', trigger: 'passive', scope: 'self', effects: { hp: 5 }, duration: 'infinite', note: 'Weapon: +5% HP' }
                ],
                teamBuffs: [
                    { name: 'Weapon: Water DMG (50 stacks)', trigger: 'on Blade/Raging Sweep', scope: 'team', effects: { waterDamage: 5 }, duration: 45, note: 'Weapon: +0.1% × 50 stacks = +5% Water DMG team (45s)' }
                ],
                raidBuffs: [],
                debuffs: [
                    { name: 'Winter Chill', trigger: 'Grinding Rush hit', scope: 'enemy', effects: {}, maxStacks: 10, duration: 30, note: 'DoT: 50% Max HP every 3s (30s, 10 stacks)' }
                ]
            },
            A1: {
                passives: [
                    { name: 'Pengqueen Normal Mode', description: 'Grinding Rush → 2 Winter Chill (A1). Blade/Raging Sweep on Winter Chill → Freezing Blood (A1). Increased Attack Speed. +25% Raging Sweep hit count.', effects: {}, trigger: 'stage start (infinite)', note: 'A1: 2 Winter Chill per Grinding Rush, Freezing Blood on Sweep, +ATK Speed, +25% hit count' },
                    { name: 'Pengqueen Booster Mode', description: '+25% DMG vs Winter Chill, +5% Water Elem Acc, Super Armor (10s)', effects: { waterElementalAccumulation: 5 }, trigger: 'on Frozen Drive', note: '+25% DMG vs Winter Chill, +5% Water Elem Acc (10s)' },
                    { name: 'Memories of Winter', description: '+15% Water DMG, +15% Blade/Raging Sweep DMG (30s)', effects: { waterDamage: 15 }, trigger: 'Ascending Slam on Winter Chill', note: '+15% Water DMG + +15% Sweep DMG (30s)' },
                    { name: 'Freezing Blood (A1)', description: '+0.6% Water DMG taken + 0.6% Water OL DMG taken per stack (70 stacks = +42%/42%)', effects: { waterDamageTaken: 42, waterOverloadDamageTaken: 42 }, trigger: 'Blade/Raging Sweep on Winter Chill target', note: 'Debuff: +42% Water DMG taken + +42% Water OL DMG taken (70×0.6%, 30s)' },
                    { name: 'Weapon: HP Boost', description: '+6% HP', effects: { hp: 6 }, trigger: 'passive', note: 'Weapon: +6% HP' },
                    { name: 'Weapon: Water DMG Team', description: '+0.2% Water DMG × 50 = +10%', effects: { waterDamage: 10 }, trigger: 'on hit', note: 'Weapon: +10% Water DMG team (45s)' }
                ],
                selfBuffs: [
                    { name: 'Pengqueen Booster Mode', trigger: 'on Frozen Drive', scope: 'self', effects: { waterElementalAccumulation: 5 }, duration: 10, note: '+5% Water Elem Acc (10s)' },
                    { name: 'Memories of Winter', trigger: 'Ascending Slam on Winter Chill', scope: 'self', effects: { waterDamage: 15 }, duration: 30, note: '+15% Water DMG (30s)' },
                    { name: 'Weapon: HP Boost', trigger: 'passive', scope: 'self', effects: { hp: 6 }, duration: 'infinite', note: 'Weapon: +6% HP' }
                ],
                teamBuffs: [
                    { name: 'Weapon: Water DMG (50 stacks)', trigger: 'on Blade/Raging Sweep', scope: 'team', effects: { waterDamage: 10 }, duration: 45, note: 'Weapon: +0.2% × 50 stacks = +10% Water DMG team (45s)' }
                ],
                raidBuffs: [],
                debuffs: [
                    { name: 'Winter Chill', trigger: 'Grinding Rush hit (×2)', scope: 'enemy', effects: {}, maxStacks: 10, duration: 30, note: 'DoT: 50% Max HP every 3s (30s, 10 stacks). A1: 2 stacks per Grinding Rush' },
                    { name: 'Freezing Blood', trigger: 'Blade/Raging Sweep on Winter Chill', scope: 'enemy', effects: { waterDamageTaken: 0.6, waterOverloadDamageTaken: 0.6 }, maxStacks: 70, duration: 30, note: '+0.6% Water DMG taken + +0.6% Water OL DMG taken per stack (70 stacks max = +42%/42%, 30s)' }
                ]
            },
            A2: {
                passives: [
                    { name: 'Pengqueen Normal Mode', description: 'A1 kit + A2: +20% Water Elem Acc', effects: {}, trigger: 'stage start', note: 'Full A1 kit inherited' },
                    { name: 'Pengqueen Booster Mode', description: '+25% DMG vs Winter Chill, +5% Water Elem Acc, Super Armor (10s)', effects: { waterElementalAccumulation: 5 }, trigger: 'on Frozen Drive', note: '+5% Water Elem Acc (10s)' },
                    { name: 'Memories of Winter', description: '+15% Water DMG, +15% Sweep DMG (30s)', effects: { waterDamage: 15 }, trigger: 'Ascending Slam on Winter Chill', note: '+15% Water DMG (30s)' },
                    { name: 'Water Elem Acc Boost (A2)', description: '+20% Water Elemental Accumulation', effects: { waterElementalAccumulation: 20 }, trigger: 'passive', note: '+20% Water Elem Acc (permanent)' },
                    { name: 'Freezing Blood (A1)', description: '+42% Water DMG/OL DMG taken (70 stacks)', effects: { waterDamageTaken: 42, waterOverloadDamageTaken: 42 }, trigger: 'Sweep on Winter Chill', note: 'Debuff: 70×0.6% = +42% Water/OL DMG taken' },
                    { name: 'Weapon: HP Boost', description: '+7% HP', effects: { hp: 7 }, trigger: 'passive', note: 'Weapon: +7% HP' },
                    { name: 'Weapon: Water DMG Team', description: '+15% Water DMG team (50 stacks)', effects: { waterDamage: 15 }, trigger: 'on hit', note: 'Weapon: +15% Water DMG team (45s)' }
                ],
                selfBuffs: [
                    { name: 'Pengqueen Booster Mode', trigger: 'on Frozen Drive', scope: 'self', effects: { waterElementalAccumulation: 5 }, duration: 10, note: '+5% Water Elem Acc (10s)' },
                    { name: 'Memories of Winter', trigger: 'Ascending Slam on Winter Chill', scope: 'self', effects: { waterDamage: 15 }, duration: 30, note: '+15% Water DMG (30s)' },
                    { name: 'Water Elem Acc Boost (A2)', trigger: 'passive', scope: 'self', effects: { waterElementalAccumulation: 20 }, duration: 'infinite', note: '+20% Water Elem Acc (permanent)' },
                    { name: 'Weapon: HP Boost', trigger: 'passive', scope: 'self', effects: { hp: 7 }, duration: 'infinite', note: 'Weapon: +7% HP' }
                ],
                teamBuffs: [
                    { name: 'Weapon: Water DMG (50 stacks)', trigger: 'on Blade/Raging Sweep', scope: 'team', effects: { waterDamage: 15 }, duration: 45, note: 'Weapon: +0.3% × 50 stacks = +15% Water DMG team (45s)' }
                ],
                raidBuffs: [],
                debuffs: [
                    { name: 'Winter Chill', trigger: 'Grinding Rush hit (×2)', scope: 'enemy', effects: {}, maxStacks: 10, duration: 30, note: 'DoT: 50% Max HP every 3s (30s, 10 stacks)' },
                    { name: 'Freezing Blood', trigger: 'Blade/Raging Sweep on Winter Chill', scope: 'enemy', effects: { waterDamageTaken: 0.6, waterOverloadDamageTaken: 0.6 }, maxStacks: 70, duration: 30, note: '+0.6% Water DMG/OL DMG taken per stack (70 max = +42%/42%, 30s)' }
                ]
            },
            A3: {
                passives: [
                    { name: 'Pengqueen Normal Mode', description: 'Full A2 kit + A3: Enhanced Memories of Winter + Pengqueen Ice Cream', effects: {}, trigger: 'stage start', note: 'Full A2 kit inherited + A3 enhancements' },
                    { name: 'Pengqueen Booster Mode', description: '+25% DMG vs Winter Chill, +5% Water Elem Acc, Super Armor (10s)', effects: { waterElementalAccumulation: 5 }, trigger: 'on Frozen Drive', note: '+5% Water Elem Acc (10s)' },
                    { name: 'Enhanced Memories of Winter (A3)', description: '+30% Water DMG, +30% Blade/Raging Sweep DMG (30s)', effects: { waterDamage: 30 }, trigger: 'Ascending Slam on Winter Chill', note: 'A3 Enhanced: +30% Water DMG + +30% Sweep DMG (was +15%, 30s)' },
                    { name: 'Pengqueen Ice Cream (A3)', description: '+20% DMG vs Winter Chill, +10% Water OL DMG, +10% Water Elem Acc (30s)', effects: { waterOverloadDamage: 10, waterElementalAccumulation: 10 }, trigger: 'on Frozen Drive', note: 'A3 NEW: +20% DMG vs Winter Chill, +10% Water OL DMG, +10% Water Elem Acc (30s)' },
                    { name: 'Water Elem Acc Boost (A2)', description: '+20% Water Elem Acc', effects: { waterElementalAccumulation: 20 }, trigger: 'passive', note: '+20% Water Elem Acc (permanent)' },
                    { name: 'Freezing Blood (A1)', description: '+42% Water DMG/OL DMG taken', effects: { waterDamageTaken: 42, waterOverloadDamageTaken: 42 }, trigger: 'Sweep on Winter Chill', note: 'Debuff: 70×0.6% = +42%' },
                    { name: 'Weapon: HP Boost', description: '+9% HP', effects: { hp: 9 }, trigger: 'passive', note: 'Weapon: +9% HP' },
                    { name: 'Weapon: Water DMG Team', description: '+20% Water DMG team', effects: { waterDamage: 20 }, trigger: 'on hit', note: 'Weapon: +20% Water DMG team (45s)' }
                ],
                selfBuffs: [
                    { name: 'Pengqueen Booster Mode', trigger: 'on Frozen Drive', scope: 'self', effects: { waterElementalAccumulation: 5 }, duration: 10, note: '+5% Water Elem Acc (10s)' },
                    { name: 'Enhanced Memories of Winter (A3)', trigger: 'Ascending Slam on Winter Chill', scope: 'self', effects: { waterDamage: 30 }, duration: 30, note: 'A3: +30% Water DMG (was +15%, 30s)' },
                    { name: 'Pengqueen Ice Cream (A3)', trigger: 'on Frozen Drive', scope: 'self', effects: { waterOverloadDamage: 10, waterElementalAccumulation: 10 }, duration: 30, note: 'A3: +10% Water OL DMG + +10% Water Elem Acc (30s)' },
                    { name: 'Water Elem Acc Boost (A2)', trigger: 'passive', scope: 'self', effects: { waterElementalAccumulation: 20 }, duration: 'infinite', note: '+20% Water Elem Acc' },
                    { name: 'Weapon: HP Boost', trigger: 'passive', scope: 'self', effects: { hp: 9 }, duration: 'infinite', note: 'Weapon: +9% HP' }
                ],
                teamBuffs: [
                    { name: 'Weapon: Water DMG (50 stacks)', trigger: 'on Blade/Raging Sweep', scope: 'team', effects: { waterDamage: 20 }, duration: 45, note: 'Weapon: +0.4% × 50 stacks = +20% Water DMG team (45s)' }
                ],
                raidBuffs: [],
                debuffs: [
                    { name: 'Winter Chill', trigger: 'Grinding Rush hit (×2)', scope: 'enemy', effects: {}, maxStacks: 10, duration: 30, note: 'DoT: 50% Max HP every 3s (30s, 10 stacks)' },
                    { name: 'Freezing Blood', trigger: 'Blade/Raging Sweep on Winter Chill', scope: 'enemy', effects: { waterDamageTaken: 0.6, waterOverloadDamageTaken: 0.6 }, maxStacks: 70, duration: 30, note: '+0.6% Water DMG/OL DMG taken per stack (70 max = +42%/42%, 30s)' }
                ]
            },
            A4: {
                passives: [
                    { name: 'Pengqueen Normal Mode', description: 'Full A3 kit + A4: +5% Def Pen per Water ally', effects: {}, trigger: 'stage start', note: 'Full A3 kit inherited + A4: Def Pen team buff' },
                    { name: 'Pengqueen Booster Mode', description: '+25% DMG vs Winter Chill, +5% Water Elem Acc, Super Armor (10s)', effects: { waterElementalAccumulation: 5 }, trigger: 'on Frozen Drive', note: '+5% Water Elem Acc (10s)' },
                    { name: 'Enhanced Memories of Winter (A3)', description: '+30% Water DMG, +30% Blade/Raging Sweep DMG (30s)', effects: { waterDamage: 30 }, trigger: 'Ascending Slam on Winter Chill', note: 'A3: +30% Water DMG (30s)' },
                    { name: 'Pengqueen Ice Cream (A3)', description: '+20% DMG vs Winter Chill, +10% Water OL DMG, +10% Water Elem Acc (30s)', effects: { waterOverloadDamage: 10, waterElementalAccumulation: 10 }, trigger: 'on Frozen Drive', note: 'A3: +10% Water OL DMG, +10% Water Elem Acc (30s)' },
                    { name: 'Water Elem Acc Boost (A2)', description: '+20% Water Elem Acc', effects: { waterElementalAccumulation: 20 }, trigger: 'passive', note: '+20% Water Elem Acc (permanent)' },
                    { name: 'Freezing Blood (A1)', description: '+42% Water DMG/OL DMG taken', effects: { waterDamageTaken: 42, waterOverloadDamageTaken: 42 }, trigger: 'Sweep on Winter Chill', note: 'Debuff: 70×0.6% = +42%' },
                    { name: 'Water Def Pen (A4)', description: '+5% Def Pen per Water ally', effects: { defPen: 15 }, trigger: 'passive', note: 'A4 NEW: +5% Def Pen per Water ally (3 Water = +15%)' },
                    { name: 'Weapon: HP Boost', description: '+10% HP', effects: { hp: 10 }, trigger: 'passive', note: 'Weapon: +10% HP' },
                    { name: 'Weapon: Water DMG Team', description: '+25% Water DMG team', effects: { waterDamage: 25 }, trigger: 'on hit', note: 'Weapon: +25% Water DMG team (45s)' }
                ],
                selfBuffs: [
                    { name: 'Pengqueen Booster Mode', trigger: 'on Frozen Drive', scope: 'self', effects: { waterElementalAccumulation: 5 }, duration: 10, note: '+5% Water Elem Acc (10s)' },
                    { name: 'Enhanced Memories of Winter (A3)', trigger: 'Ascending Slam on Winter Chill', scope: 'self', effects: { waterDamage: 30 }, duration: 30, note: 'A3: +30% Water DMG (30s)' },
                    { name: 'Pengqueen Ice Cream (A3)', trigger: 'on Frozen Drive', scope: 'self', effects: { waterOverloadDamage: 10, waterElementalAccumulation: 10 }, duration: 30, note: 'A3: +10% Water OL DMG + +10% Water Elem Acc (30s)' },
                    { name: 'Water Elem Acc Boost (A2)', trigger: 'passive', scope: 'self', effects: { waterElementalAccumulation: 20 }, duration: 'infinite', note: '+20% Water Elem Acc' },
                    { name: 'Weapon: HP Boost', trigger: 'passive', scope: 'self', effects: { hp: 10 }, duration: 'infinite', note: 'Weapon: +10% HP' }
                ],
                teamBuffs: [
                    { name: 'Water Def Pen (A4)', trigger: 'passive', scope: 'team-water', effects: { defPen: 15 }, duration: 'infinite', note: 'A4: +5% Def Pen per Water ally (3 Water = +15%)' },
                    { name: 'Weapon: Water DMG (50 stacks)', trigger: 'on Blade/Raging Sweep', scope: 'team', effects: { waterDamage: 25 }, duration: 45, note: 'Weapon: +0.5% × 50 stacks = +25% Water DMG team (45s)' }
                ],
                raidBuffs: [],
                debuffs: [
                    { name: 'Winter Chill', trigger: 'Grinding Rush hit (×2)', scope: 'enemy', effects: {}, maxStacks: 10, duration: 30, note: 'DoT: 50% Max HP every 3s (30s, 10 stacks)' },
                    { name: 'Freezing Blood', trigger: 'Blade/Raging Sweep on Winter Chill', scope: 'enemy', effects: { waterDamageTaken: 0.6, waterOverloadDamageTaken: 0.6 }, maxStacks: 70, duration: 30, note: '+0.6% Water DMG/OL DMG taken per stack (70 max = +42%/42%, 30s)' }
                ]
            },
            A5: {
                passives: [
                    { name: 'Pengqueen Normal Mode', description: 'Full A4 kit + A5: Enhanced Booster Mode & Freezing Blood', effects: {}, trigger: 'stage start', note: 'Full A4 kit inherited + A5 enhancements' },
                    { name: 'Enhanced Pengqueen Booster Mode (A5)', description: '+50% DMG vs Winter Chill, +10% Water Elem Acc, 3× Winter Chill, Super Armor (10s)', effects: { waterElementalAccumulation: 10 }, trigger: 'on Frozen Drive', note: 'A5: +10% Water Elem Acc (was +5%), +50% DMG vs Winter Chill, Raging Sweep inflicts 3 Winter Chill (was 2)' },
                    { name: 'Enhanced Memories of Winter (A3)', description: '+30% Water DMG, +30% Blade/Raging Sweep DMG (30s)', effects: { waterDamage: 30 }, trigger: 'Ascending Slam on Winter Chill', note: 'A3: +30% Water DMG (30s)' },
                    { name: 'Pengqueen Ice Cream (A3)', description: '+20% DMG vs Winter Chill, +10% Water OL DMG, +10% Water Elem Acc (30s)', effects: { waterOverloadDamage: 10, waterElementalAccumulation: 10 }, trigger: 'on Frozen Drive', note: 'A3: +10% Water OL DMG, +10% Water Elem Acc (30s)' },
                    { name: 'Water Elem Acc Boost (A2)', description: '+20% Water Elem Acc', effects: { waterElementalAccumulation: 20 }, trigger: 'passive', note: '+20% Water Elem Acc (permanent)' },
                    { name: 'Enhanced Freezing Blood (A5)', description: '+70% Water DMG/OL DMG taken (1%×70)', effects: { waterDamageTaken: 70, waterOverloadDamageTaken: 70 }, trigger: 'Sweep on Winter Chill', note: 'A5 Enhanced: 70×1% = +70%/70% (was 0.6%/stack = 42%)' },
                    { name: 'Water Def Pen (A4)', description: '+5% Def Pen per Water ally', effects: { defPen: 15 }, trigger: 'passive', note: 'A4: +5% Def Pen per Water ally (3 Water = +15%)' },
                    { name: 'Weapon: HP Boost', description: '+12% HP', effects: { hp: 12 }, trigger: 'passive', note: 'Weapon: +12% HP' },
                    { name: 'Weapon: Water DMG Team', description: '+30% Water DMG team', effects: { waterDamage: 30 }, trigger: 'on hit', note: 'Weapon: +30% Water DMG team (45s)' }
                ],
                selfBuffs: [
                    { name: 'Enhanced Pengqueen Booster Mode (A5)', trigger: 'on Frozen Drive', scope: 'self', effects: { waterElementalAccumulation: 10 }, duration: 10, note: 'A5: +10% Water Elem Acc (was +5%, 10s)' },
                    { name: 'Enhanced Memories of Winter (A3)', trigger: 'Ascending Slam on Winter Chill', scope: 'self', effects: { waterDamage: 30 }, duration: 30, note: 'A3: +30% Water DMG (30s)' },
                    { name: 'Pengqueen Ice Cream (A3)', trigger: 'on Frozen Drive', scope: 'self', effects: { waterOverloadDamage: 10, waterElementalAccumulation: 10 }, duration: 30, note: 'A3: +10% Water OL DMG + +10% Water Elem Acc (30s)' },
                    { name: 'Water Elem Acc Boost (A2)', trigger: 'passive', scope: 'self', effects: { waterElementalAccumulation: 20 }, duration: 'infinite', note: '+20% Water Elem Acc' },
                    { name: 'Weapon: HP Boost', trigger: 'passive', scope: 'self', effects: { hp: 12 }, duration: 'infinite', note: 'Weapon: +12% HP' }
                ],
                teamBuffs: [
                    { name: 'Water Def Pen (A4)', trigger: 'passive', scope: 'team-water', effects: { defPen: 15 }, duration: 'infinite', note: 'A4: +5% Def Pen per Water ally (3 Water = +15%)' },
                    { name: 'Weapon: Water DMG (50 stacks)', trigger: 'on Blade/Raging Sweep', scope: 'team', effects: { waterDamage: 30 }, duration: 45, note: 'Weapon: +0.6% × 50 stacks = +30% Water DMG team (45s)' }
                ],
                raidBuffs: [],
                debuffs: [
                    { name: 'Winter Chill', trigger: 'Raging Sweep hit (×3)', scope: 'enemy', effects: {}, maxStacks: 10, duration: 30, note: 'A5: 3 instances per hit (was 2). DoT: 50% Max HP every 3s (30s, 10 stacks)' },
                    { name: 'Enhanced Freezing Blood (A5)', trigger: 'Blade/Raging Sweep on Winter Chill', scope: 'enemy', effects: { waterDamageTaken: 1, waterOverloadDamageTaken: 1 }, maxStacks: 70, duration: 45, note: 'A5 Enhanced: +1%/stack (was 0.6%), 45s (was 30s), 70 max = +70%/70% Water DMG/OL DMG taken' }
                ]
            }
        }
    },
    // 💧 Lee Joohee - Water Healer HP Scaler
    'lee-johee': {
        id: 'lee-johee',
        name: 'Lee Joohee',
        element: 'Water',
        scaleStat: 'HP',
        advancements: {
            A0: {
                passives: [
                    {
                        name: 'HP Aura',
                        description: '+8% HP for user and all team members',
                        effects: { hp: 8 },
                        trigger: 'passive (permanent)',
                        note: '+8% HP team-wide'
                    }
                ],
                selfBuffs: [],
                teamBuffs: [
                    { name: 'HP Aura', trigger: 'passive', scope: 'team', effects: { hp: 8 }, duration: 'infinite', note: '+8% HP entire team' }
                ],
                raidBuffs: [],
                debuffs: []
            },
            A1: {
                passives: [
                    { name: 'HP Aura', description: '+8% HP team', effects: { hp: 8 }, trigger: 'passive', note: '+8% HP team-wide' },
                    { name: 'Enhanced Healing (A1)', description: 'Given HP Recovery Rate +20%', effects: {}, trigger: 'passive', note: 'All heals are 20% stronger' }
                ],
                selfBuffs: [],
                teamBuffs: [
                    { name: 'HP Aura', trigger: 'passive', scope: 'team', effects: { hp: 8 }, duration: 'infinite', note: '+8% HP entire team' }
                ],
                raidBuffs: [],
                debuffs: []
            },
            A2: {
                passives: [
                    { name: 'HP Aura', description: '+8% HP team', effects: { hp: 8 }, trigger: 'passive', note: '+8% HP team-wide' },
                    { name: 'Enhanced Healing (A1)', description: 'Heals +20%', effects: {}, trigger: 'passive', note: 'All heals +20%' }
                ],
                selfBuffs: [
                    { name: 'HP Boost (A2)', trigger: 'passive', scope: 'self', effects: { hp: 6 }, duration: 'infinite', note: '+6% HP self' }
                ],
                teamBuffs: [
                    { name: 'HP Aura', trigger: 'passive', scope: 'team', effects: { hp: 8 }, duration: 'infinite', note: '+8% HP entire team' }
                ],
                raidBuffs: [],
                debuffs: []
            },
            A3: {
                passives: [
                    { name: 'HP Aura', description: '+8% HP team', effects: { hp: 8 }, trigger: 'passive', note: '+8% HP team-wide' },
                    { name: 'Enhanced Healing (A1)', description: 'Heals +20%', effects: {}, trigger: 'passive', note: 'All heals +20%' },
                    { name: 'MP Restore (A3)', description: 'Healing Circle restores 400 MP to Joohee and team', effects: {}, trigger: 'on Healing Circle', note: '400 MP team restore' }
                ],
                selfBuffs: [
                    { name: 'HP Boost (A2)', trigger: 'passive', scope: 'self', effects: { hp: 6 }, duration: 'infinite', note: '+6% HP' }
                ],
                teamBuffs: [
                    { name: 'HP Aura', trigger: 'passive', scope: 'team', effects: { hp: 8 }, duration: 'infinite', note: '+8% HP entire team' }
                ],
                raidBuffs: [],
                debuffs: []
            },
            A4: {
                passives: [
                    { name: 'HP Aura', description: '+8% HP team', effects: { hp: 8 }, trigger: 'passive', note: '+8% HP team-wide' },
                    { name: 'Enhanced Healing (A1)', description: 'Heals +20%', effects: {}, trigger: 'passive', note: 'All heals +20%' },
                    { name: 'MP Restore (A3)', description: '400 MP on Healing Circle', effects: {}, trigger: 'on Healing Circle', note: '400 MP team restore' },
                    { name: 'Natural MP Recovery (A4)', description: '+50% Natural MP Recovery Rate', effects: {}, trigger: 'passive', note: '+50% MP recovery' }
                ],
                selfBuffs: [
                    { name: 'HP Boost (A2)', trigger: 'passive', scope: 'self', effects: { hp: 6 }, duration: 'infinite', note: '+6% HP' }
                ],
                teamBuffs: [
                    { name: 'HP Aura', trigger: 'passive', scope: 'team', effects: { hp: 8 }, duration: 'infinite', note: '+8% HP entire team' }
                ],
                raidBuffs: [],
                debuffs: []
            },
            A5: {
                passives: [
                    { name: 'HP Aura', description: '+8% HP team', effects: { hp: 8 }, trigger: 'passive', note: '+8% HP team-wide' },
                    { name: 'Enhanced Healing (A1)', description: 'Heals +20%', effects: {}, trigger: 'passive', note: 'All heals +20%' },
                    { name: 'MP Restore (A3)', description: '400 MP on Healing Circle', effects: {}, trigger: 'on Healing Circle', note: '400 MP team restore' },
                    { name: 'Natural MP Recovery (A4)', description: '+50% MP recovery', effects: {}, trigger: 'passive', note: '+50% MP recovery' },
                    { name: 'Auto Healing Circle (A5)', description: 'Healing Circle activates on tag out + CD resets (CD 35s)', effects: {}, trigger: 'on tag out', note: 'Auto heal + MP restore on tag out' }
                ],
                selfBuffs: [
                    { name: 'HP Boost (A2)', trigger: 'passive', scope: 'self', effects: { hp: 6 }, duration: 'infinite', note: '+6% HP' }
                ],
                teamBuffs: [
                    { name: 'HP Aura', trigger: 'passive', scope: 'team', effects: { hp: 8 }, duration: 'infinite', note: '+8% HP entire team' }
                ],
                raidBuffs: [],
                debuffs: []
            }
        }
    },

    // 💧 Han Song-Yi - Water Assassin ATK - Umbral Weapon Specialist
    'han-song': {
        id: 'han-song',
        name: 'Han Song-Yi',
        element: 'Water',
        scaleStat: 'ATK',
        advancements: {
            A0: {
                passives: [
                    {
                        name: 'Umbral Weapon Mastery',
                        description: 'Retrieved Umbral Weapons deal +30% damage on Poisoned targets',
                        effects: {},
                        trigger: 'Retrieve on Poisoned target',
                        note: '+30% Retrieve damage on Poisoned enemies'
                    }
                ],
                selfBuffs: [],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Weapon: Assassination Ready',
                        trigger: 'Placing Umbral Weapon (not from Retrieve)',
                        scope: 'self',
                        effects: { retrieveDmg: 10 },
                        duration: 15,
                        note: 'Weapon: Retrieve DMG +10% per placed weapon (max 3 stacks, 15s)'
                    }
                ]
            },
            A1: {
                passives: [
                    {
                        name: 'Umbral Weapon Mastery',
                        description: 'Retrieved Umbral Weapons deal +30% damage on Poisoned targets',
                        effects: {},
                        trigger: 'Retrieve on Poisoned target',
                        note: '+30% Retrieve damage on Poisoned enemies'
                    },
                    {
                        name: 'Retrieve Shield',
                        description: 'Using Retrieve grants Shield equal to 15% of ATK (3s)',
                        effects: {},
                        trigger: 'on Retrieve',
                        note: 'Defensive utility on Retrieve'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Retrieve Shield',
                        trigger: 'on Retrieve use',
                        scope: 'self',
                        effects: { shield: 15 },
                        duration: 3,
                        note: 'Shield = 15% ATK for 3s on Retrieve'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Weapon: Assassination Ready',
                        trigger: 'Placing Umbral Weapon',
                        scope: 'self',
                        effects: { retrieveDmg: 12 },
                        duration: 15,
                        note: 'Weapon: Retrieve DMG +12% per placed weapon (max 3 stacks, 15s)'
                    }
                ]
            },
            A2: {
                passives: [
                    {
                        name: 'Umbral Weapon Mastery',
                        description: '+30% Retrieve damage on Poisoned targets',
                        effects: {},
                        trigger: 'Retrieve on Poisoned target',
                        note: '+30% damage'
                    },
                    {
                        name: 'Retrieve Shield',
                        description: 'Shield 15% ATK (3s) on Retrieve',
                        effects: {},
                        trigger: 'on Retrieve',
                        note: 'Defensive utility'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Retrieve Shield',
                        trigger: 'on Retrieve',
                        scope: 'self',
                        effects: { shield: 15 },
                        duration: 3,
                        note: 'Shield = 15% ATK for 3s'
                    },
                    {
                        name: 'Crit Boost (A2)',
                        trigger: 'passive',
                        scope: 'self',
                        effects: { critRate: 5, critDMG: 5 },
                        duration: 'infinite',
                        note: '+5% Crit Rate & +5% Crit DMG'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Weapon: Assassination Ready',
                        trigger: 'Placing Umbral Weapon',
                        scope: 'self',
                        effects: { retrieveDmg: 14 },
                        duration: 15,
                        note: 'Weapon: Retrieve DMG +14% per placed weapon (max 3 stacks, 15s)'
                    }
                ]
            },
            A3: {
                passives: [
                    {
                        name: 'Umbral Weapon Mastery',
                        description: '+30% Retrieve damage on Poisoned targets',
                        effects: {},
                        trigger: 'Retrieve on Poisoned target',
                        note: '+30% damage'
                    },
                    {
                        name: 'Retrieve Shield',
                        description: 'Shield 15% ATK (3s) on Retrieve',
                        effects: {},
                        trigger: 'on Retrieve',
                        note: 'Defensive utility'
                    },
                    {
                        name: 'Enhanced Swift Flight (A3)',
                        description: 'Swift Flight throws 3 additional Umbral Weapons',
                        effects: {},
                        trigger: 'passive',
                        note: '+3 Umbral Weapons on Swift Flight → more Retrieve damage'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Retrieve Shield',
                        trigger: 'on Retrieve',
                        scope: 'self',
                        effects: { shield: 15 },
                        duration: 3,
                        note: 'Shield = 15% ATK for 3s'
                    },
                    {
                        name: 'Crit Boost (A2)',
                        trigger: 'passive',
                        scope: 'self',
                        effects: { critRate: 5, critDMG: 5 },
                        duration: 'infinite',
                        note: '+5% Crit Rate & +5% Crit DMG'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Weapon: Assassination Ready',
                        trigger: 'Placing Umbral Weapon',
                        scope: 'self',
                        effects: { retrieveDmg: 16 },
                        duration: 15,
                        note: 'Weapon: Retrieve DMG +16% per placed weapon (max 3 stacks, 15s)'
                    }
                ]
            },
            A4: {
                passives: [
                    {
                        name: 'Umbral Weapon Mastery',
                        description: '+30% Retrieve damage on Poisoned targets',
                        effects: {},
                        trigger: 'Retrieve on Poisoned target',
                        note: '+30% damage'
                    },
                    {
                        name: 'Retrieve Shield',
                        description: 'Shield 15% ATK (3s) on Retrieve',
                        effects: {},
                        trigger: 'on Retrieve',
                        note: 'Defensive utility'
                    },
                    {
                        name: 'Enhanced Swift Flight (A3)',
                        description: '+3 Umbral Weapons on Swift Flight',
                        effects: {},
                        trigger: 'passive',
                        note: 'More Retrieve damage'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Retrieve Shield',
                        trigger: 'on Retrieve',
                        scope: 'self',
                        effects: { shield: 15 },
                        duration: 3,
                        note: 'Shield = 15% ATK for 3s'
                    },
                    {
                        name: 'Crit Boost (A2)',
                        trigger: 'passive',
                        scope: 'self',
                        effects: { critRate: 5, critDMG: 5 },
                        duration: 'infinite',
                        note: '+5% CR & +5% CD'
                    },
                    {
                        name: 'ATK Boost (A4)',
                        trigger: 'passive',
                        scope: 'self',
                        effects: { attack: 6 },
                        duration: 'infinite',
                        note: '+6% ATK'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Weapon: Assassination Ready',
                        trigger: 'Placing Umbral Weapon',
                        scope: 'self',
                        effects: { retrieveDmg: 18 },
                        duration: 15,
                        note: 'Weapon: Retrieve DMG +18% per placed weapon (max 3 stacks, 15s)'
                    }
                ]
            },
            A5: {
                passives: [
                    {
                        name: 'Umbral Weapon Mastery',
                        description: '+30% Retrieve damage on Poisoned targets',
                        effects: {},
                        trigger: 'Retrieve on Poisoned target',
                        note: '+30% damage'
                    },
                    {
                        name: 'Retrieve Shield',
                        description: 'Shield 15% ATK (3s) on Retrieve',
                        effects: {},
                        trigger: 'on Retrieve',
                        note: 'Defensive utility'
                    },
                    {
                        name: 'Enhanced Swift Flight (A3)',
                        description: '+3 Umbral Weapons on Swift Flight',
                        effects: {},
                        trigger: 'passive',
                        note: 'More Retrieve damage'
                    },
                    {
                        name: 'Rakshasa Reset (A5)',
                        description: 'Using Rakshasa (Ultimate) resets cooldowns of Swift Flight and Retrieve',
                        effects: {},
                        trigger: 'on Ultimate use',
                        note: 'Full skill reset → massive burst window after Ult'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Retrieve Shield',
                        trigger: 'on Retrieve',
                        scope: 'self',
                        effects: { shield: 15 },
                        duration: 3,
                        note: 'Shield = 15% ATK for 3s'
                    },
                    {
                        name: 'Crit Boost (A2)',
                        trigger: 'passive',
                        scope: 'self',
                        effects: { critRate: 5, critDMG: 5 },
                        duration: 'infinite',
                        note: '+5% CR & +5% CD'
                    },
                    {
                        name: 'ATK Boost (A4)',
                        trigger: 'passive',
                        scope: 'self',
                        effects: { attack: 6 },
                        duration: 'infinite',
                        note: '+6% ATK'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Weapon: Assassination Ready',
                        trigger: 'Placing Umbral Weapon',
                        scope: 'self',
                        effects: { retrieveDmg: 20 },
                        duration: 15,
                        note: 'Weapon: Retrieve DMG +20% per placed weapon (max 3 stacks, 15s)'
                    }
                ]
            }
        }
    },

    // 💧 Meilin Fisher - Water Healer/Buffer HP Scaler
    meilin: {
        id: 'meilin',
        name: 'Meilin Fisher',
        element: 'Water',
        scaleStat: 'HP',
        advancements: {
            A0: {
                passives: [
                    { name: 'Cuddle Puddle', description: 'Rear Lash/Cat Rush → +8% Water DMG taken on enemy (16s)', effects: { waterDamageTaken: 8 }, trigger: 'on Rear Lash/Cat Rush hit', note: 'Debuff: +8% Water DMG taken (16s)' },
                    { name: 'Bye, Meow!', description: 'Side Whip/Up!/tag out → +8% ATK, +8% DEF to team (16s, max 3 stacks = +24%/24%)', effects: { attack: 24, defense: 24 }, trigger: 'on skill use or tag out', note: '+8% ATK/DEF per stack, max 3 = +24% each' }
                ],
                selfBuffs: [],
                teamBuffs: [
                    { name: 'Bye, Meow! (3 stacks)', trigger: 'on Side Whip/Up!/tag out', scope: 'team', effects: { attack: 24, defense: 24 }, duration: 16, note: '+8% ATK/DEF per stack, max 3 stacks (16s)' }
                ],
                raidBuffs: [],
                debuffs: [
                    { name: 'Cuddle Puddle', trigger: 'Rear Lash/Cat Rush hit', scope: 'enemy', effects: { waterDamageTaken: 8 }, duration: 16, note: '+8% Water DMG taken (16s)' }
                ]
            },
            A1: {
                passives: [
                    { name: 'Cuddle Puddle', description: '+8% Water DMG taken on enemy', effects: { waterDamageTaken: 8 }, trigger: 'on hit', note: 'Debuff (16s)' },
                    { name: 'Bye, Meow! (3 stacks)', description: '+24% ATK/DEF team', effects: { attack: 24, defense: 24 }, trigger: 'on skill/tag', note: '3 stacks (16s)' },
                    { name: 'Up! Enhanced (A1)', description: '+64% Up! damage', effects: {}, trigger: 'passive', note: '+64% Skill 2 damage' },
                    { name: 'Cut Butler (A1)', description: 'Meilin takes 64% of highest ATK ally damage (8s, Super Armor)', effects: {}, trigger: 'on Side Whip/Up!', note: 'Damage transfer + Super Armor for ally' },
                    { name: 'So Cute! Enhanced (A1)', description: '+32% Core Attack DMG (8s)', effects: { coreAttackDmg: 32 }, trigger: 'on Skill 2 hit', note: 'Was +8%, now +32%' }
                ],
                selfBuffs: [],
                teamBuffs: [
                    { name: 'Bye, Meow! (3 stacks)', trigger: 'on skill/tag', scope: 'team', effects: { attack: 24, defense: 24 }, duration: 16, note: '+24% ATK/DEF' },
                    { name: 'So Cute! (A1)', trigger: 'on Skill 2', scope: 'team', effects: { coreAttackDmg: 32 }, duration: 8, note: '+32% Core Attack DMG (8s)' }
                ],
                raidBuffs: [],
                debuffs: [
                    { name: 'Cuddle Puddle', trigger: 'on hit', scope: 'enemy', effects: { waterDamageTaken: 8 }, duration: 16, note: '+8% Water DMG taken' }
                ]
            },
            A2: {
                passives: [
                    { name: 'Cuddle Puddle', description: '+8% Water DMG taken', effects: { waterDamageTaken: 8 }, trigger: 'on hit', note: 'Debuff (16s)' },
                    { name: 'Bye, Meow! (3 stacks)', description: '+24% ATK/DEF team', effects: { attack: 24, defense: 24 }, trigger: 'on skill/tag', note: '3 stacks' },
                    { name: 'Team Stats (A2)', description: '+8% ATK/DEF all team + +8% ATK/DEF Water team = +16% for Water', effects: { attack: 16, defense: 16 }, trigger: 'passive', note: '+16% ATK/DEF for Water team (permanent)' }
                ],
                selfBuffs: [],
                teamBuffs: [
                    { name: 'Bye, Meow! (3 stacks)', trigger: 'on skill/tag', scope: 'team', effects: { attack: 24, defense: 24 }, duration: 16, note: '+24% ATK/DEF' },
                    { name: 'Team Stats (A2)', trigger: 'passive', scope: 'team', effects: { attack: 16, defense: 16 }, duration: 'infinite', note: '+8% ATK/DEF all + +8% ATK/DEF Water = +16% for Water team' },
                    { name: 'So Cute! (A1)', trigger: 'on Skill 2', scope: 'team', effects: { coreAttackDmg: 32 }, duration: 8, note: '+32% Core Attack DMG' }
                ],
                raidBuffs: [],
                debuffs: [
                    { name: 'Cuddle Puddle', trigger: 'on hit', scope: 'enemy', effects: { waterDamageTaken: 8 }, duration: 16, note: '+8% Water DMG taken' }
                ]
            },
            A3: {
                passives: [
                    { name: 'Cuddle Puddle', description: '+8% Water DMG taken', effects: { waterDamageTaken: 8 }, trigger: 'on hit', note: 'Debuff (16s)' },
                    { name: 'Bye, Meow! (3 stacks)', description: '+24% ATK/DEF team', effects: { attack: 24, defense: 24 }, trigger: 'on skill/tag', note: '3 stacks' },
                    { name: 'Team Stats (A2)', description: '+16% ATK/DEF Water team', effects: { attack: 16, defense: 16 }, trigger: 'passive', note: 'Permanent' },
                    { name: 'Power Gauge Charge (A3)', description: 'Rear Lash charges 8% Power Gauge for team (16% vs Elite+)', effects: {}, trigger: 'on Rear Lash hit', note: '8% gauge charge (16% vs Elite+)' }
                ],
                selfBuffs: [],
                teamBuffs: [
                    { name: 'Bye, Meow! (3 stacks)', trigger: 'on skill/tag', scope: 'team', effects: { attack: 24, defense: 24 }, duration: 16, note: '+24% ATK/DEF' },
                    { name: 'Team Stats (A2)', trigger: 'passive', scope: 'team', effects: { attack: 16, defense: 16 }, duration: 'infinite', note: '+16% ATK/DEF Water team' },
                    { name: 'So Cute! (A1)', trigger: 'on Skill 2', scope: 'team', effects: { coreAttackDmg: 32 }, duration: 8, note: '+32% Core Attack DMG' }
                ],
                raidBuffs: [],
                debuffs: [
                    { name: 'Cuddle Puddle', trigger: 'on hit', scope: 'enemy', effects: { waterDamageTaken: 8 }, duration: 16, note: '+8% Water DMG taken' }
                ]
            },
            A4: {
                passives: [
                    { name: 'Cuddle Puddle', description: '+8% Water DMG taken', effects: { waterDamageTaken: 8 }, trigger: 'on hit', note: 'Debuff' },
                    { name: 'Bye, Meow! (3 stacks)', description: '+24% ATK/DEF team', effects: { attack: 24, defense: 24 }, trigger: 'on skill/tag', note: '3 stacks' },
                    { name: 'Team Stats (A2)', description: '+16% ATK/DEF Water team', effects: { attack: 16, defense: 16 }, trigger: 'passive', note: 'Permanent' },
                    { name: 'Power Gauge Charge (A3)', description: '8% gauge (16% vs Elite+)', effects: {}, trigger: 'on Rear Lash', note: 'Team gauge charge' }
                ],
                selfBuffs: [
                    { name: 'HP Boost (A4)', trigger: 'passive', scope: 'self', effects: { hp: 12 }, duration: 'infinite', note: '+12% HP' }
                ],
                teamBuffs: [
                    { name: 'Bye, Meow! (3 stacks)', trigger: 'on skill/tag', scope: 'team', effects: { attack: 24, defense: 24 }, duration: 16, note: '+24% ATK/DEF' },
                    { name: 'Team Stats (A2)', trigger: 'passive', scope: 'team', effects: { attack: 16, defense: 16 }, duration: 'infinite', note: '+16% ATK/DEF Water team' },
                    { name: 'So Cute! (A1)', trigger: 'on Skill 2', scope: 'team', effects: { coreAttackDmg: 32 }, duration: 8, note: '+32% Core Attack DMG' }
                ],
                raidBuffs: [],
                debuffs: [
                    { name: 'Cuddle Puddle', trigger: 'on hit', scope: 'enemy', effects: { waterDamageTaken: 8 }, duration: 16, note: '+8% Water DMG taken' }
                ]
            },
            A5: {
                passives: [
                    { name: 'Cuddle Puddle', description: '+8% Water DMG taken', effects: { waterDamageTaken: 8 }, trigger: 'on hit', note: 'Debuff' },
                    { name: 'Bye, Meow! (3 stacks)', description: '+24% ATK/DEF team', effects: { attack: 24, defense: 24 }, trigger: 'on skill/tag', note: '3 stacks' },
                    { name: 'Team Stats (A2)', description: '+16% ATK/DEF Water team', effects: { attack: 16, defense: 16 }, trigger: 'passive', note: 'Permanent' },
                    { name: 'Power Gauge Charge (A3)', description: '8% gauge (16% vs Elite+)', effects: {}, trigger: 'on Rear Lash', note: 'Team gauge' },
                    { name: 'Pumped Up! Enhanced (A5)', description: '+16% ATK/DEF/CR, +16% Core ATK DMG, -16% DMG taken (24s)', effects: { attack: 16, defense: 16, critRate: 16, coreAttackDmg: 16, damageTakenReduction: 16 }, trigger: 'on Ultimate', note: 'Was +8% each, now +16% each (24s)' }
                ],
                selfBuffs: [
                    { name: 'HP Boost (A4)', trigger: 'passive', scope: 'self', effects: { hp: 12 }, duration: 'infinite', note: '+12% HP' }
                ],
                teamBuffs: [
                    { name: 'Bye, Meow! (3 stacks)', trigger: 'on skill/tag', scope: 'team', effects: { attack: 24, defense: 24 }, duration: 16, note: '+24% ATK/DEF' },
                    { name: 'Team Stats (A2)', trigger: 'passive', scope: 'team', effects: { attack: 16, defense: 16 }, duration: 'infinite', note: '+16% ATK/DEF Water team' },
                    { name: 'So Cute! (A1)', trigger: 'on Skill 2', scope: 'team', effects: { coreAttackDmg: 32 }, duration: 8, note: '+32% Core Attack DMG' },
                    { name: 'Pumped Up! (A5)', trigger: 'on Ultimate', scope: 'team', effects: { attack: 16, defense: 16, critRate: 16, coreAttackDmg: 16 }, duration: 24, cooldown: 45, note: '+16% ATK/DEF/CR + Core ATK DMG + -16% DMG taken (24s / 45s CD)' }
                ],
                raidBuffs: [],
                debuffs: [
                    { name: 'Cuddle Puddle', trigger: 'on hit', scope: 'enemy', effects: { waterDamageTaken: 8 }, duration: 16, note: '+8% Water DMG taken' }
                ]
            }
        }
    },

    // 💧 Nam Chae-Young - Water Breaker HP Scaler - Freeze Specialist
    nam: {
        id: 'nam',
        name: 'Nam Chae-Young',
        element: 'Water',
        scaleStat: 'HP',
        advancements: {
            A0: {
                passives: [
                    { name: 'Frozen Damage Bonus', description: '+8% damage to Frozen targets', effects: { frozenDmgBonus: 8 }, trigger: 'passive', note: '+8% damage on Frozen enemies' }
                ],
                selfBuffs: [],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    { name: 'Weapon: Frozen DEF Reduction', trigger: 'attacking Frozen target', scope: 'enemy', effects: { defReduction: 5 }, duration: 5, note: 'Weapon: -5% DEF on Frozen targets (5s)' }
                ]
            },
            A1: {
                passives: [
                    { name: 'Frozen Damage Bonus', description: '+8% damage to Frozen', effects: { frozenDmgBonus: 8 }, trigger: 'passive', note: '+8% DMG' },
                    { name: 'Break Specialist (A1)', description: '+20% Break effectiveness', effects: {}, trigger: 'passive', note: '+20% Break effectiveness' }
                ],
                selfBuffs: [],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    { name: 'Weapon: Frozen DEF Reduction', trigger: 'attacking Frozen', scope: 'enemy', effects: { defReduction: 8 }, duration: 5, note: 'Weapon: -8% DEF on Frozen (5s)' }
                ]
            },
            A2: {
                passives: [
                    { name: 'Frozen Damage Bonus', description: '+8% DMG on Frozen', effects: { frozenDmgBonus: 8 }, trigger: 'passive', note: '+8%' },
                    { name: 'Break Specialist (A1)', description: '+20% Break', effects: {}, trigger: 'passive', note: '+20%' }
                ],
                selfBuffs: [
                    { name: 'HP Boost (A2)', trigger: 'passive', scope: 'self', effects: { hp: 6 }, duration: 'infinite', note: '+6% HP' }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    { name: 'Weapon: Frozen DEF Reduction', trigger: 'attacking Frozen', scope: 'enemy', effects: { defReduction: 11 }, duration: 5, note: 'Weapon: -11% DEF on Frozen (5s)' }
                ]
            },
            A3: {
                passives: [
                    { name: 'Frozen Damage Bonus', description: '+8% DMG on Frozen', effects: { frozenDmgBonus: 8 }, trigger: 'passive', note: '+8%' },
                    { name: 'Break Specialist (A1)', description: '+20% Break', effects: {}, trigger: 'passive', note: '+20%' },
                    { name: 'Light-Freezing Arrow Enhanced (A3)', description: '+80% Light-Freezing Arrow damage', effects: {}, trigger: 'passive', note: '+80% Skill 2 damage' }
                ],
                selfBuffs: [
                    { name: 'HP Boost (A2)', trigger: 'passive', scope: 'self', effects: { hp: 6 }, duration: 'infinite', note: '+6% HP' }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    { name: 'Weapon: Frozen DEF Reduction', trigger: 'attacking Frozen', scope: 'enemy', effects: { defReduction: 14 }, duration: 5, note: 'Weapon: -14% DEF on Frozen (5s)' }
                ]
            },
            A4: {
                passives: [
                    { name: 'Frozen Damage Bonus', description: '+8% DMG on Frozen', effects: { frozenDmgBonus: 8 }, trigger: 'passive', note: '+8%' },
                    { name: 'Break Specialist (A1)', description: '+20% Break', effects: {}, trigger: 'passive', note: '+20%' },
                    { name: 'Light-Freezing Arrow (A3)', description: '+80% Skill 2 DMG', effects: {}, trigger: 'passive', note: '+80%' },
                    { name: 'Explosion Range (A4)', description: '+20% explosion range for K63, Icy Step, Tip of the Iceberg', effects: {}, trigger: 'passive', note: '+20% AoE range' }
                ],
                selfBuffs: [
                    { name: 'HP Boost (A2)', trigger: 'passive', scope: 'self', effects: { hp: 6 }, duration: 'infinite', note: '+6% HP' }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    { name: 'Weapon: Frozen DEF Reduction', trigger: 'attacking Frozen', scope: 'enemy', effects: { defReduction: 17 }, duration: 5, note: 'Weapon: -17% DEF on Frozen (5s)' }
                ]
            },
            A5: {
                passives: [
                    { name: 'Frozen Damage Bonus', description: '+8% DMG on Frozen', effects: { frozenDmgBonus: 8 }, trigger: 'passive', note: '+8%' },
                    { name: 'Break Specialist (A1)', description: '+20% Break', effects: {}, trigger: 'passive', note: '+20%' },
                    { name: 'Light-Freezing Arrow (A3)', description: '+80% Skill 2 DMG', effects: {}, trigger: 'passive', note: '+80%' },
                    { name: 'Explosion Range (A4)', description: '+20% AoE range', effects: {}, trigger: 'passive', note: '+20%' },
                    { name: 'Extended Freeze (A5)', description: 'Freeze duration → 3s (was 2s)', effects: {}, trigger: 'passive', note: 'More CC uptime → more Frozen DEF debuff uptime' }
                ],
                selfBuffs: [
                    { name: 'HP Boost (A2)', trigger: 'passive', scope: 'self', effects: { hp: 6 }, duration: 'infinite', note: '+6% HP' }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    { name: 'Weapon: Frozen DEF Reduction', trigger: 'attacking Frozen', scope: 'enemy', effects: { defReduction: 20 }, duration: 5, note: 'Weapon: -20% DEF on Frozen (5s)' },
                    { name: 'Freeze', trigger: 'K63/Ultimate hit', scope: 'enemy', effects: {}, duration: 3, note: 'Freeze 3s (A5 enhanced, was 2s)' }
                ]
            }
        }
    },

    // 💧 Seo Jiwoo - Water Breaker HP Scaler - Water Dragon Training
    seo: {
        id: 'seo',
        name: 'Seo Jiwoo',
        element: 'Water',
        scaleStat: 'HP',
        advancements: {
            A0: {
                passives: [
                    { name: 'Water Dragon Training', description: 'After 3 Training stacks → Water Dragon Training: resets Skill 1/2 CDs, changes them to Heavy Attack versions', effects: {}, trigger: 'after 3 skill uses', note: 'Core mechanic: 3 stacks → enhanced skills with CD reset' }
                ],
                selfBuffs: [],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            },
            A1: {
                passives: [
                    { name: 'Water Dragon Training', description: '3 stacks → Heavy Attack skills', effects: {}, trigger: 'after 3 skill uses', note: 'CD reset + enhanced skills' },
                    { name: 'Heavy Attack Boost (A1)', description: '+150% Heavy Attack: Water Dragon Rush & Lightning Kick damage', effects: {}, trigger: 'passive', note: '+150% Heavy Attack damage' }
                ],
                selfBuffs: [],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            },
            A2: {
                passives: [
                    { name: 'Water Dragon Training', description: '3 stacks → Heavy Attack skills', effects: {}, trigger: 'after 3 skill uses', note: 'CD reset + enhanced' },
                    { name: 'Heavy Attack Boost (A1)', description: '+150% Heavy Attack damage', effects: {}, trigger: 'passive', note: '+150%' },
                    { name: 'Break Specialist (A2)', description: '+15% Break effectiveness, +50% on Heavy Attack: Lightning Kick', effects: {}, trigger: 'passive', note: '+15% Break (+50% on Heavy Lightning Kick)' }
                ],
                selfBuffs: [],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            },
            A3: {
                passives: [
                    { name: 'Water Dragon Training', description: '3 stacks → Heavy Attack skills', effects: {}, trigger: 'after 3 skill uses', note: 'CD reset + enhanced' },
                    { name: 'Heavy Attack Boost (A1)', description: '+150% Heavy Attack damage', effects: {}, trigger: 'passive', note: '+150%' },
                    { name: 'Break Specialist (A2)', description: '+15% Break (+50% Heavy Lightning Kick)', effects: {}, trigger: 'passive', note: '+15%/+50%' },
                    { name: 'MP Restore (A3)', description: '+50 MP on Water Dragon Training activation', effects: {}, trigger: 'on Training activation', note: '+50 MP sustain' }
                ],
                selfBuffs: [],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            },
            A4: {
                passives: [
                    { name: 'Water Dragon Training', description: '3 stacks → Heavy Attack skills', effects: {}, trigger: 'after 3 skill uses', note: 'CD reset + enhanced' },
                    { name: 'Heavy Attack Boost (A1)', description: '+150% Heavy Attack damage', effects: {}, trigger: 'passive', note: '+150%' },
                    { name: 'Break Specialist (A2)', description: '+15% Break (+50% Heavy Lightning Kick)', effects: {}, trigger: 'passive', note: '+15%/+50%' },
                    { name: 'MP Restore (A3)', description: '+50 MP on Training', effects: {}, trigger: 'on Training', note: '+50 MP' },
                    { name: 'HP from CritDMG (A4)', description: '+15% Max HP from additional CritDMG', effects: {}, trigger: 'passive', note: 'Converts CritDMG → HP' }
                ],
                selfBuffs: [],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            },
            A5: {
                passives: [
                    { name: 'Water Dragon Training', description: '3 stacks → Heavy Attack skills', effects: {}, trigger: 'after 3 skill uses', note: 'CD reset + enhanced' },
                    { name: 'Heavy Attack Boost (A1)', description: '+150% Heavy Attack damage', effects: {}, trigger: 'passive', note: '+150%' },
                    { name: 'Break Specialist (A2)', description: '+15% Break (+50% Heavy Lightning Kick)', effects: {}, trigger: 'passive', note: '+15%/+50%' },
                    { name: 'MP Restore (A3)', description: '+50 MP on Training', effects: {}, trigger: 'on Training', note: '+50 MP' },
                    { name: 'HP from CritDMG (A4)', description: '+15% Max HP from CritDMG', effects: {}, trigger: 'passive', note: 'CritDMG → HP' },
                    { name: 'Water Dragon Mastery (A5)', description: '+32% CR and Skill DMG on Heavy Attacks & Ultimate', effects: { critRate: 32 }, trigger: 'on Heavy Attack/Ultimate', note: '+32% CR + Skill DMG on enhanced skills' }
                ],
                selfBuffs: [
                    { name: 'Water Dragon Mastery (A5)', trigger: 'on Heavy Attack/Ultimate', scope: 'self', effects: { critRate: 32, skillDmg: 32 }, duration: 'during skill', note: '+32% CR + Skill DMG on Heavy Attacks & Ult' }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            }
        }
    },

    // 💧 Seorin - Water Ranger Breaker (HP scaling)
    seorin: {
        name: 'Seorin',
        element: 'Water',
        class: 'Ranger',
        scaleStat: 'HP',
        advancements: {
            A0: {
                passives: [
                    { name: 'Pinpoint Missiles', description: 'Missiles deal 150% HP each' },
                    { name: 'Subzero', description: '+1% Water DMG taken per stack (max 10 = +10%)' }
                ],
                selfBuffs: [],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    { name: 'Subzero', effects: { waterDmgTaken: 10 }, condition: '10 stacks max', duration: 'stacking' }
                ]
            },
            A1: {
                passives: [
                    { name: 'Pinpoint Missiles', description: 'Missiles deal 150% HP each' },
                    { name: 'Subzero', description: '+1% Water DMG taken per stack (max 10 = +10%)' },
                    { name: 'Limited Break', description: '+30% DMG, +30% CritDMG, +30% missile DMG on Break (120s)' }
                ],
                selfBuffs: [
                    { name: 'Limited Break', effects: { damage: 30, critDMG: 30 }, condition: 'On Break', duration: 120 }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    { name: 'Subzero', effects: { waterDmgTaken: 10 }, condition: '10 stacks max', duration: 'stacking' }
                ]
            },
            A2: {
                passives: [
                    { name: 'Pinpoint Missiles', description: 'Missiles deal 150% HP each' },
                    { name: 'Subzero', description: '+1% Water DMG taken per stack (max 10 = +10%)' },
                    { name: 'Limited Break', description: '+30% DMG, +30% CritDMG, +30% missile DMG on Break (120s)' },
                    { name: 'Ice Shard Magnum', description: 'Skills fire 4 missiles' }
                ],
                selfBuffs: [
                    { name: 'Limited Break', effects: { damage: 30, critDMG: 30 }, condition: 'On Break', duration: 120 }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    { name: 'Subzero', effects: { waterDmgTaken: 10 }, condition: '10 stacks max', duration: 'stacking' }
                ]
            },
            A3: {
                passives: [
                    { name: 'Pinpoint Missiles', description: 'Missiles deal 150% HP each' },
                    { name: 'Subzero', description: '+1% Water DMG taken per stack (max 10 = +10%)' },
                    { name: 'Limited Break', description: '+30% DMG, +30% CritDMG, +30% missile DMG on Break (120s)' },
                    { name: 'Ice Shard Magnum', description: 'Skills fire 4 missiles' },
                    { name: 'Black Tea?', description: '+20% DEF, +20% HP, MP regen for team (infinite)' }
                ],
                selfBuffs: [
                    { name: 'Limited Break', effects: { damage: 30, critDMG: 30 }, condition: 'On Break', duration: 120 }
                ],
                teamBuffs: [
                    { name: 'Black Tea?', effects: { defense: 20, hp: 20 }, condition: 'Always active', duration: 'infinite' }
                ],
                raidBuffs: [],
                debuffs: [
                    { name: 'Subzero', effects: { waterDmgTaken: 10 }, condition: '10 stacks max', duration: 'stacking' }
                ]
            },
            A4: {
                passives: [
                    { name: 'Pinpoint Missiles', description: 'Missiles deal 150% HP each' },
                    { name: 'Subzero', description: '+1% Water DMG taken per stack (max 10 = +10%)' },
                    { name: 'Limited Break', description: '+30% DMG, +30% CritDMG, +30% missile DMG on Break (120s)' },
                    { name: 'Ice Shard Magnum', description: 'Skills fire 4 missiles' },
                    { name: 'Black Tea?', description: '+20% DEF, +20% HP, MP regen for team (infinite)' },
                    { name: 'Water Synergy', description: '+10% Water DMG per Water member (max 3 = +30%)' }
                ],
                selfBuffs: [
                    { name: 'Limited Break', effects: { damage: 30, critDMG: 30 }, condition: 'On Break', duration: 120 },
                    { name: 'Water Synergy', effects: { waterDmg: 30 }, condition: '3 Water members', duration: 'passive' }
                ],
                teamBuffs: [
                    { name: 'Black Tea?', effects: { defense: 20, hp: 20 }, condition: 'Always active', duration: 'infinite' }
                ],
                raidBuffs: [],
                debuffs: [
                    { name: 'Subzero', effects: { waterDmgTaken: 10 }, condition: '10 stacks max', duration: 'stacking' }
                ]
            },
            A5: {
                passives: [
                    { name: 'Pinpoint Missiles', description: 'Missiles deal 150% HP each, +30% CR/CritDMG on missiles' },
                    { name: 'Enhanced Subzero', description: '+2% Water DMG taken per stack (max 10 = +20%)' },
                    { name: 'Enhanced Limited Break', description: '+50% DMG, +50% CritDMG, +50% missile DMG on Break (120s)' },
                    { name: 'Ice Shard Magnum', description: 'Skills fire 4 missiles' },
                    { name: 'Black Tea?', description: '+20% DEF, +20% HP, MP regen for team (infinite)' },
                    { name: 'Water Synergy', description: '+10% Water DMG per Water member (max 3 = +30%)' }
                ],
                selfBuffs: [
                    { name: 'Enhanced Limited Break', effects: { damage: 50, critDMG: 50 }, condition: 'On Break', duration: 120 },
                    { name: 'Water Synergy', effects: { waterDmg: 30 }, condition: '3 Water members', duration: 'passive' },
                    { name: 'Missile Mastery', effects: { critRate: 30, critDMG: 30 }, condition: 'On missiles', duration: 'passive' }
                ],
                teamBuffs: [
                    { name: 'Black Tea?', effects: { defense: 20, hp: 20 }, condition: 'Always active', duration: 'infinite' }
                ],
                raidBuffs: [],
                debuffs: [
                    { name: 'Enhanced Subzero', effects: { waterDmgTaken: 20 }, condition: '10 stacks max', duration: 'stacking' }
                ]
            }
        }
    },

    // 💧 Shuhua - Water Assassin DPS (ATK scaling)
    shuhua: {
        name: 'Shuhua',
        element: 'Water',
        class: 'Assassin',
        scaleStat: 'Attack',
        advancements: {
            A0: {
                passives: [
                    { name: 'FOREVER', description: '+5% DMG dealt for team (max 3 stacks = +15%) in dungeons' },
                    { name: 'On the Stage', description: 'Pop Star Landing activates Performance every 3s (15s)' },
                    { name: 'Performance', description: '+50% Core Attack DMG, Shield (10% ATK), 3s' },
                    { name: 'High-energy', description: '+50% High-energy Beat DMG, Core Attack no gauge cost, -3s cooldowns on Core hit (CD: 1s)' }
                ],
                selfBuffs: [
                    { name: 'Performance', effects: { coreAttackDmg: 50 }, condition: 'After Pop Star Landing', duration: 3 },
                    { name: 'High-energy', effects: { skillDmg: 50 }, condition: 'After Starlight Bark', duration: 3.5 }
                ],
                teamBuffs: [
                    { name: 'FOREVER', effects: { damageDealt: 15 }, condition: 'In dungeons, 3 stacks', duration: 'infinite' }
                ],
                raidBuffs: [],
                debuffs: []
            },
            A1: {
                passives: [
                    { name: 'FOREVER', description: '+5% DMG dealt for team (max 3 stacks = +15%) in dungeons' },
                    { name: 'On the Stage', description: 'Pop Star Landing activates Performance every 3s (15s)' },
                    { name: 'Performance', description: '+50% Core Attack DMG, Shield (10% ATK), 3s' },
                    { name: 'Enhanced High-energy', description: '+100% DMG, -5s cooldowns on Core hit, inflicts Tension Drop' }
                ],
                selfBuffs: [
                    { name: 'Performance', effects: { coreAttackDmg: 50 }, condition: 'After Pop Star Landing', duration: 3 },
                    { name: 'Enhanced High-energy', effects: { damage: 100 }, condition: 'After Starlight Bark', duration: 3.5 }
                ],
                teamBuffs: [
                    { name: 'FOREVER', effects: { damageDealt: 15 }, condition: 'In dungeons, 3 stacks', duration: 'infinite' }
                ],
                raidBuffs: [],
                debuffs: [
                    { name: 'Tension Drop', effects: { waterDmgTaken: 10 }, condition: 'From SHUHUA only, 10 stacks max', duration: 30 }
                ]
            },
            A2: {
                passives: [
                    { name: 'FOREVER', description: '+5% DMG dealt for team (max 3 stacks = +15%) in dungeons' },
                    { name: 'On the Stage', description: 'Pop Star Landing activates Performance every 3s (15s)' },
                    { name: 'Performance', description: '+50% Core Attack DMG, Shield (10% ATK), 3s' },
                    { name: 'Enhanced High-energy', description: '+100% DMG, -5s cooldowns, inflicts Tension Drop' },
                    { name: 'Starlight Howl', description: 'Starlight Bark becomes Starlight Howl, +100% DMG' }
                ],
                selfBuffs: [
                    { name: 'Performance', effects: { coreAttackDmg: 50 }, condition: 'After Pop Star Landing', duration: 3 },
                    { name: 'Enhanced High-energy', effects: { damage: 100 }, condition: 'After Starlight Howl', duration: 3.5 },
                    { name: 'Starlight Howl', effects: { skillDmg: 100 }, condition: 'Replaces Starlight Bark', duration: 'passive' }
                ],
                teamBuffs: [
                    { name: 'FOREVER', effects: { damageDealt: 15 }, condition: 'In dungeons, 3 stacks', duration: 'infinite' }
                ],
                raidBuffs: [],
                debuffs: [
                    { name: 'Tension Drop', effects: { waterDmgTaken: 10 }, condition: 'From SHUHUA only, 10 stacks max', duration: 30 }
                ]
            },
            A3: {
                passives: [
                    { name: 'FOREVER', description: '+5% DMG dealt for team (max 3 stacks = +15%) in dungeons' },
                    { name: 'On the Stage', description: 'Pop Star Landing activates Performance every 3s (15s)' },
                    { name: 'Enhanced Performance', description: '+55% Core ATK DMG, Shield (15% ATK), +10% gauge, Tension Up +20% Water DMG' },
                    { name: 'Enhanced High-energy', description: '+100% DMG, -5s cooldowns, inflicts Tension Drop' },
                    { name: 'Starlight Howl', description: 'Starlight Bark becomes Starlight Howl, +100% DMG' }
                ],
                selfBuffs: [
                    { name: 'Enhanced Performance', effects: { coreAttackDmg: 55, waterDmg: 20 }, condition: 'After Pop Star Landing', duration: 3 },
                    { name: 'Enhanced High-energy', effects: { damage: 100 }, condition: 'After Starlight Howl', duration: 3.5 },
                    { name: 'Starlight Howl', effects: { skillDmg: 100 }, condition: 'Replaces Starlight Bark', duration: 'passive' }
                ],
                teamBuffs: [
                    { name: 'FOREVER', effects: { damageDealt: 15 }, condition: 'In dungeons, 3 stacks', duration: 'infinite' }
                ],
                raidBuffs: [],
                debuffs: [
                    { name: 'Tension Drop', effects: { waterDmgTaken: 10 }, condition: 'From SHUHUA only, 10 stacks max', duration: 30 }
                ]
            },
            A4: {
                passives: [
                    { name: 'FOREVER', description: '+5% DMG dealt for team (max 3 stacks = +15%) in dungeons' },
                    { name: 'On the Stage', description: 'Pop Star Landing activates Performance every 3s (15s)' },
                    { name: 'Enhanced Performance', description: '+55% Core ATK DMG, Shield (15% ATK), +10% gauge, Tension Up +20% Water DMG' },
                    { name: 'Enhanced High-energy', description: '+100% DMG, -5s cooldowns, inflicts Tension Drop' },
                    { name: 'Starlight Howl', description: 'Starlight Bark becomes Starlight Howl, +100% DMG' },
                    { name: 'ATK Boost', description: '+16% ATK' }
                ],
                selfBuffs: [
                    { name: 'Enhanced Performance', effects: { coreAttackDmg: 55, waterDmg: 20 }, condition: 'After Pop Star Landing', duration: 3 },
                    { name: 'Enhanced High-energy', effects: { damage: 100 }, condition: 'After Starlight Howl', duration: 3.5 },
                    { name: 'Starlight Howl', effects: { skillDmg: 100 }, condition: 'Replaces Starlight Bark', duration: 'passive' },
                    { name: 'ATK Boost', effects: { attack: 16 }, condition: 'Passive', duration: 'infinite' }
                ],
                teamBuffs: [
                    { name: 'FOREVER', effects: { damageDealt: 15 }, condition: 'In dungeons, 3 stacks', duration: 'infinite' }
                ],
                raidBuffs: [],
                debuffs: [
                    { name: 'Tension Drop', effects: { waterDmgTaken: 10 }, condition: 'From SHUHUA only, 10 stacks max', duration: 30 }
                ]
            },
            A5: {
                passives: [
                    { name: 'FOREVER', description: '+5% DMG dealt for team (max 3 stacks = +15%) in dungeons' },
                    { name: 'On the Stage', description: 'Pop Star Landing activates Performance every 3s (15s)' },
                    { name: 'Enhanced Performance', description: '+55% Core ATK DMG, Shield (15% ATK), +10% gauge, Tension Up +20% Water DMG' },
                    { name: 'Enhanced High-energy', description: '+100% DMG, -5s cooldowns, inflicts Tension Drop' },
                    { name: 'Starlight Howl', description: 'Starlight Bark becomes Starlight Howl, +100% DMG' },
                    { name: 'ATK Boost', description: '+16% ATK' },
                    { name: 'Volume Up', description: '+30% DMG dealt, +30% CR on Starlight Howl (10s)' }
                ],
                selfBuffs: [
                    { name: 'Enhanced Performance', effects: { coreAttackDmg: 55, waterDmg: 20 }, condition: 'After Pop Star Landing', duration: 3 },
                    { name: 'Enhanced High-energy', effects: { damage: 100 }, condition: 'After Starlight Howl', duration: 3.5 },
                    { name: 'Starlight Howl', effects: { skillDmg: 100 }, condition: 'Replaces Starlight Bark', duration: 'passive' },
                    { name: 'ATK Boost', effects: { attack: 16 }, condition: 'Passive', duration: 'infinite' },
                    { name: 'Volume Up', effects: { damageDealt: 30, critRate: 30 }, condition: 'After Starlight Howl', duration: 10, cooldown: 20 }
                ],
                teamBuffs: [
                    { name: 'FOREVER', effects: { damageDealt: 15 }, condition: 'In dungeons, 3 stacks', duration: 'infinite' }
                ],
                raidBuffs: [],
                debuffs: [
                    { name: 'Tension Drop', effects: { waterDmgTaken: 10 }, condition: 'From SHUHUA only, 10 stacks max', duration: 30 }
                ]
            }
        }
    },

    // 💧 Alicia Blanche - Water Mage DPS (ATK scaling)
    alicia: {
        id: 'alicia',
        name: 'Alicia Blanche',
        element: 'Water',
        class: 'Mage',
        scaleStat: 'Attack',
        advancements: {
            A0: {
                passives: [
                    { name: 'Frost', description: 'Eternal Frost/Winter Storm/Ice Needle apply [Frost]. Core Attack → Bitter Cold Spear. +120% DMG per Frost consumed (max 3 = +360%). Infinite, 6 stacks max.', effects: {}, trigger: 'on skill use', note: 'Burst DMG mechanic on Core Attack' },
                    { name: 'Weapon: Core ATK DMG', description: '+10% Core Attack DMG', effects: {}, trigger: 'passive', note: 'Weapon: +10% Core ATK DMG' },
                    { name: 'Weapon: Water DMG (Ice Body Armor)', description: '+5% Water DMG (20s/30s CD)', effects: { waterDamage: 5 }, trigger: 'on Ice Body Armor', note: 'Weapon: +5% Water DMG (20s, CD 30s = 67% uptime)' }
                ],
                selfBuffs: [
                    { name: 'Weapon: Water DMG (Ice Body Armor)', trigger: 'on Ice Body Armor activation', scope: 'self', effects: { waterDamage: 5 }, duration: 20, cooldown: 30, note: 'Weapon: +5% Water DMG (20s/30s CD = 67% uptime)' }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: []
            },
            A1: {
                passives: [
                    { name: 'Frost', description: 'Core Attack → Bitter Cold Spear. +120%/Frost consumed (max 360%). 6 stacks.', effects: {}, trigger: 'on skill use', note: 'Burst DMG mechanic' },
                    { name: 'Shield Crit Boost (A1)', description: 'When Shield active: +20% CR, +20% CritDMG', effects: { critRate: 20, critDMG: 20 }, trigger: 'Shield active', note: 'A1: +20% CR/CD when Shield is active' },
                    { name: 'Winter Chill (A1)', description: 'Absolute Zero applies Winter Chill. DoT: 100% ATK/3s, 30s, 10 stacks', effects: {}, trigger: 'Absolute Zero hit', note: 'A1: DoT debuff on enemy' },
                    { name: 'Weapon: Core ATK DMG', description: '+16% Core Attack DMG', effects: {}, trigger: 'passive', note: 'Weapon: +16% Core ATK DMG' },
                    { name: 'Weapon: Water DMG (Ice Body Armor)', description: '+8% Water DMG (20s/30s CD)', effects: { waterDamage: 8 }, trigger: 'on Ice Body Armor', note: 'Weapon: +8% Water DMG (20s, CD 30s = 67%)' }
                ],
                selfBuffs: [
                    { name: 'Shield Crit Boost (A1)', trigger: 'Shield active (Ice Body Armor)', scope: 'self', effects: { critRate: 20, critDMG: 20 }, duration: 'infinite', note: 'A1: +20% CR/CD while Shield is active' },
                    { name: 'Weapon: Water DMG (Ice Body Armor)', trigger: 'on Ice Body Armor activation', scope: 'self', effects: { waterDamage: 8 }, duration: 20, cooldown: 30, note: 'Weapon: +8% Water DMG (20s/30s CD = 67%)' }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    { name: 'Winter Chill', trigger: 'Absolute Zero hit', scope: 'enemy', effects: {}, maxStacks: 10, duration: 30, note: 'DoT: 100% ATK every 3s (30s, 10 stacks)' }
                ]
            },
            A2: {
                passives: [
                    { name: 'Frost', description: 'Core Attack → Bitter Cold Spear. +120%/Frost (max 360%). 6 stacks.', effects: {}, trigger: 'on skill use', note: 'Burst DMG mechanic' },
                    { name: 'Shield Crit Boost (A1)', description: '+20% CR, +20% CritDMG when Shield active', effects: { critRate: 20, critDMG: 20 }, trigger: 'Shield active', note: '+20% CR/CD' },
                    { name: 'Double Frost (A2)', description: '+1 additional Frost per skill use', effects: {}, trigger: 'passive', note: 'A2: Faster Frost stacking' },
                    { name: 'Winter Chill (A1)', description: 'DoT: 100% ATK/3s, 30s, 10 stacks', effects: {}, trigger: 'Absolute Zero hit', note: 'DoT debuff' },
                    { name: 'Weapon: Core ATK DMG', description: '+22% Core Attack DMG', effects: {}, trigger: 'passive', note: 'Weapon: +22% Core ATK DMG' },
                    { name: 'Weapon: Water DMG (Ice Body Armor)', description: '+11% Water DMG (20s/30s CD)', effects: { waterDamage: 11 }, trigger: 'on Ice Body Armor', note: 'Weapon: +11% Water DMG (20s/30s CD = 67%)' }
                ],
                selfBuffs: [
                    { name: 'Shield Crit Boost (A1)', trigger: 'Shield active (Ice Body Armor)', scope: 'self', effects: { critRate: 20, critDMG: 20 }, duration: 'infinite', note: '+20% CR/CD while Shield active' },
                    { name: 'Weapon: Water DMG (Ice Body Armor)', trigger: 'on Ice Body Armor activation', scope: 'self', effects: { waterDamage: 11 }, duration: 20, cooldown: 30, note: 'Weapon: +11% Water DMG (20s/30s CD = 67%)' }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    { name: 'Winter Chill', trigger: 'Absolute Zero hit', scope: 'enemy', effects: {}, maxStacks: 10, duration: 30, note: 'DoT: 100% ATK every 3s (30s, 10 stacks)' }
                ]
            },
            A3: {
                passives: [
                    { name: 'Frost', description: 'Bitter Cold Spear. +120%/Frost (max 360%). 6 stacks. +1 Frost (A2).', effects: {}, trigger: 'on skill use', note: 'Burst DMG mechanic' },
                    { name: 'Shield Crit Boost (A1)', description: '+20% CR, +20% CritDMG when Shield active', effects: { critRate: 20, critDMG: 20 }, trigger: 'Shield active', note: '+20% CR/CD' },
                    { name: 'Freeze DMG Boost (A3)', description: '+30% DMG vs [Freeze] targets', effects: {}, trigger: 'passive', note: 'A3: +30% DMG vs Frozen enemies' },
                    { name: 'Winter Chill ATK Boost (A3)', description: '+12% ATK per hit on Winter Chill (60s, 3 stacks = +36%)', effects: { attack: 36 }, trigger: 'Frost Arrow/Bitter Cold Spear on Winter Chill', note: 'A3: +36% ATK (12%×3, 60s)' },
                    { name: 'Weapon: Core ATK DMG', description: '+28% Core Attack DMG', effects: {}, trigger: 'passive', note: 'Weapon: +28% Core ATK DMG' },
                    { name: 'Weapon: Water DMG (Ice Body Armor)', description: '+14% Water DMG (20s/30s CD)', effects: { waterDamage: 14 }, trigger: 'on Ice Body Armor', note: 'Weapon: +14% Water DMG (20s/30s CD = 67%)' }
                ],
                selfBuffs: [
                    { name: 'Shield Crit Boost (A1)', trigger: 'Shield active (Ice Body Armor)', scope: 'self', effects: { critRate: 20, critDMG: 20 }, duration: 'infinite', note: '+20% CR/CD while Shield active' },
                    { name: 'Winter Chill ATK Boost (A3)', trigger: 'Frost Arrow/Bitter Cold Spear on Winter Chill', scope: 'self', effects: { attack: 36 }, duration: 60, maxStacks: 3, note: 'A3: +12% ATK per hit (3 stacks = +36%, 60s)' },
                    { name: 'Weapon: Water DMG (Ice Body Armor)', trigger: 'on Ice Body Armor activation', scope: 'self', effects: { waterDamage: 14 }, duration: 20, cooldown: 30, note: 'Weapon: +14% Water DMG (20s/30s CD = 67%)' }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    { name: 'Winter Chill', trigger: 'Absolute Zero hit', scope: 'enemy', effects: {}, maxStacks: 10, duration: 30, note: 'DoT: 100% ATK every 3s (30s, 10 stacks)' }
                ]
            },
            A4: {
                passives: [
                    { name: 'Frost', description: 'Bitter Cold Spear. +120%/Frost (max 360%). 6 stacks. +1 Frost (A2).', effects: {}, trigger: 'on skill use', note: 'Burst DMG mechanic' },
                    { name: 'Shield Crit Boost (A1)', description: '+20% CR, +20% CritDMG when Shield active', effects: { critRate: 20, critDMG: 20 }, trigger: 'Shield active', note: '+20% CR/CD' },
                    { name: 'Freeze DMG Boost (A3)', description: '+30% DMG vs [Freeze] targets', effects: {}, trigger: 'passive', note: '+30% DMG vs Frozen enemies' },
                    { name: 'Winter Chill ATK Boost (A3)', description: '+36% ATK (12%×3, 60s)', effects: { attack: 36 }, trigger: 'on Winter Chill hit', note: '+36% ATK' },
                    { name: 'Water DMG Boost (A4)', description: '+16% Water DMG', effects: { waterDamage: 16 }, trigger: 'passive', note: 'A4: +16% Water DMG (permanent)' },
                    { name: 'Weapon: Core ATK DMG', description: '+34% Core Attack DMG', effects: {}, trigger: 'passive', note: 'Weapon: +34% Core ATK DMG' },
                    { name: 'Weapon: Water DMG (Ice Body Armor)', description: '+17% Water DMG (20s/30s CD)', effects: { waterDamage: 17 }, trigger: 'on Ice Body Armor', note: 'Weapon: +17% Water DMG (20s/30s CD = 67%)' }
                ],
                selfBuffs: [
                    { name: 'Shield Crit Boost (A1)', trigger: 'Shield active (Ice Body Armor)', scope: 'self', effects: { critRate: 20, critDMG: 20 }, duration: 'infinite', note: '+20% CR/CD while Shield active' },
                    { name: 'Winter Chill ATK Boost (A3)', trigger: 'Frost Arrow/Bitter Cold Spear on Winter Chill', scope: 'self', effects: { attack: 36 }, duration: 60, maxStacks: 3, note: '+12% ATK per hit (3 stacks = +36%, 60s)' },
                    { name: 'Water DMG Boost (A4)', trigger: 'passive', scope: 'self', effects: { waterDamage: 16 }, duration: 'infinite', note: 'A4: +16% Water DMG (permanent)' },
                    { name: 'Weapon: Water DMG (Ice Body Armor)', trigger: 'on Ice Body Armor activation', scope: 'self', effects: { waterDamage: 17 }, duration: 20, cooldown: 30, note: 'Weapon: +17% Water DMG (20s/30s CD = 67%)' }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    { name: 'Winter Chill', trigger: 'Absolute Zero hit', scope: 'enemy', effects: {}, maxStacks: 10, duration: 30, note: 'DoT: 100% ATK every 3s (30s, 10 stacks)' }
                ]
            },
            A5: {
                passives: [
                    { name: 'Frost', description: 'Bitter Cold Spear. +120%/Frost (max 360%). 6 stacks. +1 Frost (A2).', effects: {}, trigger: 'on skill use', note: 'Burst DMG mechanic' },
                    { name: 'Shield Crit Boost (A1)', description: '+20% CR, +20% CritDMG when Shield active', effects: { critRate: 20, critDMG: 20 }, trigger: 'Shield active', note: '+20% CR/CD' },
                    { name: 'Freeze DMG Boost (A3)', description: '+30% DMG vs [Freeze] targets', effects: {}, trigger: 'passive', note: '+30% DMG vs Frozen enemies' },
                    { name: 'Winter Chill ATK Boost (A3)', description: '+36% ATK (12%×3, 60s)', effects: { attack: 36 }, trigger: 'on Winter Chill hit', note: '+36% ATK' },
                    { name: 'Water DMG Boost (A4)', description: '+16% Water DMG', effects: { waterDamage: 16 }, trigger: 'passive', note: '+16% Water DMG (permanent)' },
                    { name: 'Enhanced Bitter Cold Spear (A5)', description: '+50% Bitter Cold Spear DMG, applies Freeze, +10% DMG per Winter Chill (10 stacks = +100%)', effects: {}, trigger: 'on Bitter Cold Spear hit', note: 'A5: +50% BCS DMG + Freeze + +100% DMG vs Winter Chill' },
                    { name: 'Weapon: Core ATK DMG', description: '+40% Core Attack DMG', effects: {}, trigger: 'passive', note: 'Weapon: +40% Core ATK DMG' },
                    { name: 'Weapon: Water DMG (Ice Body Armor)', description: '+20% Water DMG (20s/30s CD)', effects: { waterDamage: 20 }, trigger: 'on Ice Body Armor', note: 'Weapon: +20% Water DMG (20s/30s CD = 67%)' }
                ],
                selfBuffs: [
                    { name: 'Shield Crit Boost (A1)', trigger: 'Shield active (Ice Body Armor)', scope: 'self', effects: { critRate: 20, critDMG: 20 }, duration: 'infinite', note: '+20% CR/CD while Shield active' },
                    { name: 'Winter Chill ATK Boost (A3)', trigger: 'Frost Arrow/Bitter Cold Spear on Winter Chill', scope: 'self', effects: { attack: 36 }, duration: 60, maxStacks: 3, note: '+12% ATK per hit (3 stacks = +36%, 60s)' },
                    { name: 'Water DMG Boost (A4)', trigger: 'passive', scope: 'self', effects: { waterDamage: 16 }, duration: 'infinite', note: '+16% Water DMG (permanent)' },
                    { name: 'Weapon: Water DMG (Ice Body Armor)', trigger: 'on Ice Body Armor activation', scope: 'self', effects: { waterDamage: 20 }, duration: 20, cooldown: 30, note: 'Weapon: +20% Water DMG (20s/30s CD = 67% uptime)' }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    { name: 'Winter Chill', trigger: 'Absolute Zero hit', scope: 'enemy', effects: {}, maxStacks: 10, duration: 30, note: 'DoT: 100% ATK every 3s (30s, 10 stacks)' },
                    { name: 'Freeze', trigger: 'Bitter Cold Spear hit (A5)', scope: 'enemy', effects: {}, duration: 3, note: 'A5: CC interrupt 3s' }
                ]
            }
        }
    },

    // ✨ Cha Hae-In Light (Original) - Fighter Striker (ATK scaling) - Team Buffer via [Brand]
    'chae-in': {
        id: 'chae-in',
        name: 'Cha Hae-In (Light)',
        element: 'Light',
        class: 'Fighter',
        scaleStat: 'Attack',
        advancements: {
            A0: {
                passives: [
                    { name: 'The Dancer', description: '+8% ATK & +8% CritDMG per stack (max 3, 10s). Skill 1 triggers Waltz of the Sword (3s).', effects: { attack: 24, critDMG: 24 }, trigger: 'on Skill 1 use', note: '3 stacks × 8% = +24% ATK/CritDMG (10s)' },
                    { name: '[Brand] Effect', description: '66% chance on The Dancer hit: +12% CR, +12% CritDMG for all who attack branded target (15s)', effects: { critRate: 12, critDMG: 12 }, trigger: 'The Dancer hit (66%)', note: 'Raid-wide debuff: +12% CR/CD for everyone hitting branded target' },
                    { name: 'Weapon: CritDMG Stack', description: '+2% CritDMG per Basic Skill × 6 stacks = +12% (12s)', effects: { critDMG: 12 }, trigger: 'on Basic Skill use', note: 'Weapon A0: +2% × 6 = +12% CritDMG (12s)' }
                ],
                selfBuffs: [
                    { name: 'The Dancer (3 stacks)', trigger: 'on Skill 1 use', scope: 'self', effects: { attack: 24, critDMG: 24 }, duration: 10, note: '+8% ATK & +8% CritDMG per stack (max 3 = +24%/24%, 10s)' },
                    { name: 'Weapon: CritDMG Stack', trigger: 'on Basic Skill use', scope: 'self', effects: { critDMG: 12 }, duration: 12, note: 'Weapon: +2% × 6 stacks = +12% CritDMG (12s)' }
                ],
                teamBuffs: [],
                raidBuffs: [
                    { name: '[Brand] Effect', trigger: 'The Dancer hit (66% chance)', scope: 'raid', effects: { critRate: 12, critDMG: 12 }, duration: 15, note: '+12% CR & +12% CritDMG for all attackers on branded target (15s)' }
                ],
                debuffs: [
                    { name: 'Brand', trigger: 'The Dancer hit (66%)', scope: 'enemy', effects: { critRate: 12, critDMG: 12 }, duration: 15, note: 'Enemy debuff: attackers gain +12% CR/CD (15s)' },
                    { name: 'Unrecoverable', trigger: 'Skill 1 / Skill 2 hit', scope: 'enemy', effects: {}, duration: 30, note: 'Target cannot recover HP (30s)' }
                ]
            },
            A1: {
                passives: [
                    { name: 'The Dancer (Enhanced)', description: '+8% ATK & +8% CritDMG per stack (max 5, 10s). Super Armor during Waltz.', effects: { attack: 40, critDMG: 40 }, trigger: 'on Skill 1 use', note: 'A1: 5 stacks × 8% = +40% ATK/CritDMG (was 3 stacks)' },
                    { name: '[Brand] Effect', description: '+12% CR, +12% CritDMG for all on branded target (15s)', effects: { critRate: 12, critDMG: 12 }, trigger: 'The Dancer hit (66%)', note: 'Raid debuff' },
                    { name: 'Weapon: CritDMG Stack', description: '+3% CritDMG × 6 = +18% (12s)', effects: { critDMG: 18 }, trigger: 'on Basic Skill', note: 'Weapon A1' }
                ],
                selfBuffs: [
                    { name: 'The Dancer (5 stacks, A1)', trigger: 'on Skill 1 use', scope: 'self', effects: { attack: 40, critDMG: 40 }, duration: 10, note: 'A1: +8% × 5 stacks = +40% ATK/CritDMG (10s)' },
                    { name: 'Weapon: CritDMG Stack', trigger: 'on Basic Skill use', scope: 'self', effects: { critDMG: 18 }, duration: 12, note: 'Weapon: +3% × 6 = +18% CritDMG (12s)' }
                ],
                teamBuffs: [],
                raidBuffs: [
                    { name: '[Brand] Effect', trigger: 'The Dancer hit (66% chance)', scope: 'raid', effects: { critRate: 12, critDMG: 12 }, duration: 15, note: '+12% CR/CD for all on branded target (15s)' }
                ],
                debuffs: [
                    { name: 'Brand', trigger: 'The Dancer hit (66%)', scope: 'enemy', effects: { critRate: 12, critDMG: 12 }, duration: 15, note: '+12% CR/CD for attackers (15s)' },
                    { name: 'Unrecoverable', trigger: 'Skill 1 / Skill 2 hit', scope: 'enemy', effects: {}, duration: 30, note: 'No HP recovery (30s)' }
                ]
            },
            A2: {
                passives: [
                    { name: 'The Dancer (5 stacks)', description: '+40% ATK/CritDMG (10s)', effects: { attack: 40, critDMG: 40 }, trigger: 'on Skill 1', note: '5 × 8%' },
                    { name: 'CR Boost (A2)', description: '+16% Crit Rate', effects: { critRate: 16 }, trigger: 'passive', note: 'A2: +16% CR (permanent)' },
                    { name: '[Brand] Effect', description: '+12% CR/CD raid (15s)', effects: { critRate: 12, critDMG: 12 }, trigger: 'The Dancer hit', note: 'Raid debuff' },
                    { name: 'Weapon: CritDMG Stack', description: '+4% × 6 = +24% (12s)', effects: { critDMG: 24 }, trigger: 'on Basic Skill', note: 'Weapon A2' }
                ],
                selfBuffs: [
                    { name: 'The Dancer (5 stacks)', trigger: 'on Skill 1 use', scope: 'self', effects: { attack: 40, critDMG: 40 }, duration: 10, note: '+8% × 5 = +40% ATK/CritDMG (10s)' },
                    { name: 'CR Boost (A2)', trigger: 'passive', scope: 'self', effects: { critRate: 16 }, duration: 'infinite', note: 'A2: +16% CR (permanent)' },
                    { name: 'Weapon: CritDMG Stack', trigger: 'on Basic Skill use', scope: 'self', effects: { critDMG: 24 }, duration: 12, note: 'Weapon: +4% × 6 = +24% CritDMG (12s)' }
                ],
                teamBuffs: [],
                raidBuffs: [
                    { name: '[Brand] Effect', trigger: 'The Dancer hit (66% chance)', scope: 'raid', effects: { critRate: 12, critDMG: 12 }, duration: 15, note: '+12% CR/CD for all on branded target (15s)' }
                ],
                debuffs: [
                    { name: 'Brand', trigger: 'The Dancer hit (66%)', scope: 'enemy', effects: { critRate: 12, critDMG: 12 }, duration: 15, note: '+12% CR/CD for attackers (15s)' },
                    { name: 'Unrecoverable', trigger: 'Skill 1 / Skill 2 hit', scope: 'enemy', effects: {}, duration: 30, note: 'No HP recovery (30s)' }
                ]
            },
            A3: {
                passives: [
                    { name: 'The Dancer (5 stacks)', description: '+40% ATK/CritDMG (10s)', effects: { attack: 40, critDMG: 40 }, trigger: 'on Skill 1', note: '5 × 8%' },
                    { name: 'CR Boost (A2)', description: '+16% CR', effects: { critRate: 16 }, trigger: 'passive', note: '+16% CR' },
                    { name: 'Brand Skill Boost (A3)', description: '+100% DMG for The Dancer & Sword of Light vs [Branded] targets', effects: {}, trigger: 'on hitting Branded target', note: 'A3: +100% skill DMG vs Brand (not a stat buff)' },
                    { name: '[Brand] Effect', description: '+12% CR/CD raid (15s)', effects: { critRate: 12, critDMG: 12 }, trigger: 'The Dancer hit', note: 'Raid debuff' },
                    { name: 'Weapon: CritDMG Stack', description: '+5% × 6 = +30% (12s)', effects: { critDMG: 30 }, trigger: 'on Basic Skill', note: 'Weapon A3' }
                ],
                selfBuffs: [
                    { name: 'The Dancer (5 stacks)', trigger: 'on Skill 1 use', scope: 'self', effects: { attack: 40, critDMG: 40 }, duration: 10, note: '+8% × 5 = +40% ATK/CritDMG (10s)' },
                    { name: 'CR Boost (A2)', trigger: 'passive', scope: 'self', effects: { critRate: 16 }, duration: 'infinite', note: '+16% CR (permanent)' },
                    { name: 'Weapon: CritDMG Stack', trigger: 'on Basic Skill use', scope: 'self', effects: { critDMG: 30 }, duration: 12, note: 'Weapon: +5% × 6 = +30% CritDMG (12s)' }
                ],
                teamBuffs: [],
                raidBuffs: [
                    { name: '[Brand] Effect', trigger: 'The Dancer hit (66% chance)', scope: 'raid', effects: { critRate: 12, critDMG: 12 }, duration: 15, note: '+12% CR/CD for all on branded target (15s)' }
                ],
                debuffs: [
                    { name: 'Brand', trigger: 'The Dancer hit (66%)', scope: 'enemy', effects: { critRate: 12, critDMG: 12 }, duration: 15, note: '+12% CR/CD for attackers (15s)' },
                    { name: 'Unrecoverable', trigger: 'Skill 1 / Skill 2 hit', scope: 'enemy', effects: {}, duration: 30, note: 'No HP recovery (30s)' }
                ]
            },
            A4: {
                passives: [
                    { name: 'The Dancer (5 stacks)', description: '+40% ATK/CritDMG (10s)', effects: { attack: 40, critDMG: 40 }, trigger: 'on Skill 1', note: '5 × 8%' },
                    { name: 'CR Boost (A2)', description: '+16% CR', effects: { critRate: 16 }, trigger: 'passive', note: '+16% CR' },
                    { name: 'CritDMG Boost (A4)', description: '+16% CritDMG', effects: { critDMG: 16 }, trigger: 'passive', note: 'A4: +16% CritDMG (permanent)' },
                    { name: 'Brand Skill Boost (A3)', description: '+100% The Dancer/Sword of Light DMG vs Brand', effects: {}, trigger: 'on Brand hit', note: '+100% skill DMG' },
                    { name: '[Brand] Effect', description: '+12% CR/CD raid (15s)', effects: { critRate: 12, critDMG: 12 }, trigger: 'The Dancer hit', note: 'Raid debuff' },
                    { name: 'Weapon: CritDMG Stack', description: '+6% × 6 = +36% (12s)', effects: { critDMG: 36 }, trigger: 'on Basic Skill', note: 'Weapon A4' }
                ],
                selfBuffs: [
                    { name: 'The Dancer (5 stacks)', trigger: 'on Skill 1 use', scope: 'self', effects: { attack: 40, critDMG: 40 }, duration: 10, note: '+8% × 5 = +40% ATK/CritDMG (10s)' },
                    { name: 'CR Boost (A2)', trigger: 'passive', scope: 'self', effects: { critRate: 16 }, duration: 'infinite', note: '+16% CR (permanent)' },
                    { name: 'CritDMG Boost (A4)', trigger: 'passive', scope: 'self', effects: { critDMG: 16 }, duration: 'infinite', note: 'A4: +16% CritDMG (permanent)' },
                    { name: 'Weapon: CritDMG Stack', trigger: 'on Basic Skill use', scope: 'self', effects: { critDMG: 36 }, duration: 12, note: 'Weapon: +6% × 6 = +36% CritDMG (12s)' }
                ],
                teamBuffs: [],
                raidBuffs: [
                    { name: '[Brand] Effect', trigger: 'The Dancer hit (66% chance)', scope: 'raid', effects: { critRate: 12, critDMG: 12 }, duration: 15, note: '+12% CR/CD for all on branded target (15s)' }
                ],
                debuffs: [
                    { name: 'Brand', trigger: 'The Dancer hit (66%)', scope: 'enemy', effects: { critRate: 12, critDMG: 12 }, duration: 15, note: '+12% CR/CD for attackers (15s)' },
                    { name: 'Unrecoverable', trigger: 'Skill 1 / Skill 2 hit', scope: 'enemy', effects: {}, duration: 30, note: 'No HP recovery (30s)' }
                ]
            },
            A5: {
                passives: [
                    { name: 'The Dancer (5 stacks)', description: '+40% ATK/CritDMG (10s)', effects: { attack: 40, critDMG: 40 }, trigger: 'on Skill 1', note: '5 × 8%' },
                    { name: 'CR Boost (A2)', description: '+16% CR', effects: { critRate: 16 }, trigger: 'passive', note: '+16% CR' },
                    { name: 'CritDMG Boost (A4)', description: '+16% CritDMG', effects: { critDMG: 16 }, trigger: 'passive', note: '+16% CritDMG' },
                    { name: 'Brand Skill Boost (A3)', description: '+100% skill DMG vs Brand', effects: {}, trigger: 'on Brand hit', note: '+100%' },
                    { name: 'Light of the End Boost (A5)', description: '+20% DMG & +2% CR per The Dancer stack (5 stacks = +100% DMG, +10% CR)', effects: { critRate: 10 }, trigger: 'on Ultimate with Dancer stacks', note: 'A5: Ultimate scaling with Dancer stacks' },
                    { name: '[Brand] Effect', description: '+12% CR/CD raid (15s)', effects: { critRate: 12, critDMG: 12 }, trigger: 'The Dancer hit', note: 'Raid debuff' },
                    { name: 'Weapon: CritDMG Stack', description: '+8% × 6 = +48% (12s)', effects: { critDMG: 48 }, trigger: 'on Basic Skill', note: 'Weapon A5' }
                ],
                selfBuffs: [
                    { name: 'The Dancer (5 stacks)', trigger: 'on Skill 1 use', scope: 'self', effects: { attack: 40, critDMG: 40 }, duration: 10, note: '+8% × 5 = +40% ATK/CritDMG (10s)' },
                    { name: 'CR Boost (A2)', trigger: 'passive', scope: 'self', effects: { critRate: 16 }, duration: 'infinite', note: '+16% CR (permanent)' },
                    { name: 'CritDMG Boost (A4)', trigger: 'passive', scope: 'self', effects: { critDMG: 16 }, duration: 'infinite', note: '+16% CritDMG (permanent)' },
                    { name: 'Weapon: CritDMG Stack', trigger: 'on Basic Skill use', scope: 'self', effects: { critDMG: 48 }, duration: 12, note: 'Weapon: +8% × 6 = +48% CritDMG (12s)' }
                ],
                teamBuffs: [],
                raidBuffs: [
                    { name: '[Brand] Effect', trigger: 'The Dancer hit (66% chance)', scope: 'raid', effects: { critRate: 12, critDMG: 12 }, duration: 15, note: '+12% CR/CD for ALL attackers on branded target (15s)' }
                ],
                debuffs: [
                    { name: 'Brand', trigger: 'The Dancer hit (66%)', scope: 'enemy', effects: { critRate: 12, critDMG: 12 }, duration: 15, note: '+12% CR/CD for attackers (15s)' },
                    { name: 'Unrecoverable', trigger: 'Skill 1 / Skill 2 hit', scope: 'enemy', effects: {}, duration: 30, note: 'No HP recovery (30s)' }
                ]
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🌪️ LENNART NIERMANN - Wind Tank/DPS (DEF scaling)
    // [Hunter's Cage] +30% damage taken from Lennart (self, 20s)
    // [Analysis] 12 stacks via Todes-Symphonie → +20% DEF while active (self)
    // Arme: rien de notable
    // ═══════════════════════════════════════════════════════════════
    niermann: {
        id: 'niermann',
        name: 'Lennart Niermann',
        class: 'Fighter / Tank',
        element: 'Wind',
        scaleStat: 'DEF',
        primaryRole: 'DPS',
        secondaryRole: 'Tank',
        tags: ['DEF Scaler', 'Self Buffer', 'Hunter Cage', 'Analysis'],

        advancements: {
            A0: {
                passives: [
                    {
                        name: "Hunter's Cage",
                        description: "[Hunter's Cage] Increases the target's damage taken from Lennart by 30%. Duration: 20s.",
                        mechanic: 'self-debuff',
                        duration: 20
                    },
                    {
                        name: 'Analysis Effect',
                        description: 'When using Todes-Symphonie, gain 12 instances of [Analysis]. DEF +20% while [Analysis] is active.',
                        mechanic: 'conditional',
                        duration: 0
                    }
                ],
                selfBuffs: [
                    {
                        name: "Hunter's Cage (Self DPS boost)",
                        trigger: 'on hit (marks enemy)',
                        scope: 'self',
                        effects: { damageTaken: 30 },
                        duration: 20,
                        note: '+30% damage taken by target from Lennart only (not shared with team/raid)'
                    },
                    {
                        name: 'Analysis DEF Boost',
                        trigger: 'Todes-Symphonie (12 stacks)',
                        scope: 'self',
                        effects: { defense: 20 },
                        duration: 'while active',
                        note: '+20% DEF while [Analysis] stacks are active'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
            // A1: [Analysis] 20 stacks → [Defensive Divination Circle] on ENTIRE TEAM
            // +30% CritDMG, +30% DEF, Super Armor, Analysis stacks frozen. 20s.
            A1: {
                passives: [
                    {
                        name: 'Defensive Divination Circle (A1)',
                        description: 'When [Analysis] reaches 20 stacks, activates [Defensive Divination Circle] on the entire team. Cannot lose or gain [Analysis] stacks while active. Gains Super Armor.',
                        mechanic: 'conditional',
                        duration: 20
                    }
                ],
                selfBuffs: [
                    {
                        name: "Hunter's Cage (Self DPS boost)",
                        trigger: 'on hit (marks enemy)',
                        scope: 'self',
                        effects: { damageTaken: 30 },
                        duration: 20,
                        note: '+30% damage taken by target from Lennart only'
                    },
                    {
                        name: 'Analysis DEF Boost',
                        trigger: 'Todes-Symphonie (12 stacks)',
                        scope: 'self',
                        effects: { defense: 20 },
                        duration: 'while active',
                        note: '+20% DEF while [Analysis] stacks are active'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Defensive Divination Circle',
                        trigger: '[Analysis] reaches 20 stacks',
                        scope: 'team',
                        effects: { critDMG: 30, defense: 30 },
                        duration: 20,
                        note: 'A1: +30% CritDMG & +30% DEF for entire team. Also grants Super Armor to Lennart.'
                    }
                ],
                raidBuffs: [],
                debuffs: [],
            },
            // A2: +30% Wind elemental damage (self)
            A2: {
                passives: [
                    {
                        name: 'Wind Elemental Mastery (A2)',
                        description: "The user's Wind elemental damage increases by 30%.",
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Wind Elemental Damage +30%',
                        trigger: 'permanent',
                        scope: 'self',
                        effects: { windDamage: 30 },
                        duration: 'infinite',
                        note: 'A2: +30% Wind elemental damage (self only)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
            // A3: Skills zone +3s, Wind allies Basic Skill → 3% MP + 5% Power Gauge for Lennart
            // When ally puts target in [Break] → Lennart gains [Mark]: +20% Wind DMG, +10% DefPen (infinite)
            A3: {
                passives: [
                    {
                        name: 'Extended Attack Zones (A3)',
                        description: 'Using Fenriszahn, Kaisers Rache, or Todes-Symphonie increases attack zone duration by 3s.',
                        mechanic: 'permanent'
                    },
                    {
                        name: 'Wind Team Synergy (A3)',
                        description: 'When Wind team members (including self) use Basic Skill, Lennart recovers 3% MP and 5% Power Gauge charge.',
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [
                    {
                        name: '[Mark] - Break Trigger',
                        trigger: 'ally puts target in [Break] state',
                        scope: 'self',
                        effects: { windDamage: 20, defPen: 10 },
                        duration: 'infinite',
                        note: 'A3: +20% Wind damage & +10% Defense Penetration when ally triggers [Break] (infinite duration)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
            // A4: [Hunter's Cage] enhanced → 60% damage taken (was 30%), 40s (was 20s)
            // [Mark] enhanced → +30% Wind DMG (was 20%), +15% DefPen (was 10%), infinite
            // +10 Analysis stacks on stage enter, Todes-Symphonie CD -25s
            A4: {
                passives: [
                    {
                        name: "Enhanced Hunter's Cage & Mark (A4)",
                        description: "[Hunter's Cage] and [Mark] effects are enhanced. Gain 10 [Analysis] stacks when entering a stage. Todes-Symphonie cooldown -25s.",
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    {
                        name: "Hunter's Cage Enhanced (A4)",
                        trigger: 'on hit (marks enemy)',
                        scope: 'self',
                        effects: { damageTaken: 60 },
                        duration: 40,
                        note: 'A4: +60% damage taken by target from Lennart only (upgraded from 30%/20s → 60%/40s)'
                    },
                    {
                        name: '[Mark] Enhanced (A4)',
                        trigger: 'ally puts target in [Break] state',
                        scope: 'self',
                        effects: { windDamage: 30, defPen: 15 },
                        duration: 'infinite',
                        note: 'A4: +30% Wind DMG & +15% DefPen (upgraded from 20%/10%)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
            // A5: Same as A4 — full kit unlocked, no stat changes
            A5: {
                passives: [
                    {
                        name: "Enhanced Hunter's Cage & Mark (A5)",
                        description: "[Hunter's Cage] and [Mark] effects are enhanced. Gain 10 [Analysis] stacks when entering a stage. Todes-Symphonie cooldown -25s.",
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    {
                        name: "Hunter's Cage Enhanced (A5)",
                        trigger: 'on hit (marks enemy)',
                        scope: 'self',
                        effects: { damageTaken: 60 },
                        duration: 40,
                        note: '+60% damage taken by target from Lennart only (40s)'
                    },
                    {
                        name: '[Mark] Enhanced (A5)',
                        trigger: 'ally puts target in [Break] state',
                        scope: 'self',
                        effects: { windDamage: 30, defPen: 15 },
                        duration: 'infinite',
                        note: '+30% Wind DMG & +15% DefPen (infinite)'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Defensive Divination Circle',
                        trigger: '[Analysis] reaches 20 stacks',
                        scope: 'team',
                        effects: { critDMG: 30, defense: 30 },
                        duration: 20,
                        note: '+30% CritDMG & +30% DEF for entire team (from A1)'
                    }
                ],
                raidBuffs: [],
                debuffs: [],
            },
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🌪️ SUGIMOTO REIJI - Wind Infusion (HP scaling)
    // Arme: +HP% (self) + Wind Overload +10% per stack ×3 for team (30s)
    // Skills: Punisher, Eclipse Slash, Extinction Blade
    // ═══════════════════════════════════════════════════════════════
    sugimoto: {
        id: 'sugimoto',
        name: 'Sugimoto Reiji',
        class: 'Infusion',
        element: 'Wind',
        scaleStat: 'HP',
        primaryRole: 'DPS',
        secondaryRole: 'Support',
        tags: ['HP Scaler', 'Wind Overload Buffer', 'Team Buffer'],

        advancements: {
            A0: {
                passives: [
                    {
                        name: "Sugimoto's Weapon - Wind Overload Buffer",
                        description: 'Using Punisher, Eclipse Slash, or Extinction Blade increases all team members\' Wind Overload damage by 4%. Stacks up to 3 times (max +12%). Duration: 30s.',
                        mechanic: 'weapon',
                        duration: 30
                    },
                    {
                        name: '[Sword-fighting] System',
                        description: 'Cycles through 3 phases: [Initiation] → [Acceleration] (+50% skill DMG) → [Finale] (+100% skill DMG). Each phase upgrades skills and transitions on skill use.',
                        mechanic: 'permanent'
                    },
                    {
                        name: '[Flash Draw]',
                        description: 'Using Flash of Steel/Returning Edge/Revolving Edge grants stacks (max 3). Punisher/Eclipse Slash/Extinction Blade become available, consuming 1 stack each.',
                        mechanic: 'conditional'
                    },
                    {
                        name: '[Sword Dance]',
                        description: 'Using Unbroken Focus: Core Gauge restores 2× faster + Extreme Evasion activates Core Attack. 15s.',
                        mechanic: 'conditional',
                        duration: 15
                    }
                ],
                selfBuffs: [
                    {
                        name: '[Sword-fighting] Acceleration Phase',
                        trigger: 'Punisher during [Initiation]',
                        scope: 'self',
                        effects: { damageIncrease: 50 },
                        duration: 'until skill use',
                        note: 'Skills enhanced +50% DMG (Punisher→Eclipse Slash, Flash of Steel→Returning Edge)'
                    },
                    {
                        name: '[Sword-fighting] Finale Phase',
                        trigger: 'Eclipse Slash during [Acceleration]',
                        scope: 'self',
                        effects: { damageIncrease: 100 },
                        duration: 'until skill use',
                        note: 'Skills enhanced +100% DMG (Eclipse Slash→Extinction Blade, Returning Edge→Revolving Edge)'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Weapon: Wind Overload Boost',
                        trigger: 'Punisher / Eclipse Slash / Extinction Blade',
                        scope: 'team',
                        effects: { windOverload: 12 },
                        duration: 30,
                        note: 'A0 weapon: +4% Wind OL per stack ×3 = +12% Wind Overload for team (30s)'
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: "[Winter's Edge]",
                        trigger: 'Punisher (1 stack) / Eclipse Slash or Extinction Blade (2 stacks)',
                        scope: 'enemy',
                        effects: { dot: 50 },
                        duration: 30,
                        note: 'DOT: 50% of Max HP every 3s. Stacks up to 10 times. HP-scaling DOT.'
                    }
                ],
            },
            // A1: Unbroken Focus / Quickblade-Oblivion → [Flash Draw] + Core Attack
            // Consuming Flash Draw: Quickblade-Oblivion CD -10s + 35% Power Gauge restored
            A1: {
                passives: [
                    {
                        name: 'Enhanced Flash Draw (A1)',
                        description: 'Unbroken Focus or Quickblade-Oblivion activates [Flash Draw] + Core Attack. Consuming [Flash Draw] reduces Quickblade-Oblivion CD by 10s and restores 35% Power Gauge.',
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [],
                teamBuffs: [
                    {
                        name: 'Weapon: Wind Overload Boost',
                        trigger: 'Punisher / Eclipse Slash / Extinction Blade',
                        scope: 'team',
                        effects: { windOverload: 18 },
                        duration: 30,
                        note: 'A1 weapon: +6% Wind OL per stack ×3 = +18% Wind Overload for team (30s)'
                    }
                ],
                raidBuffs: [],
                debuffs: [],
            },
            // A2: Wind Elemental Accumulation +20% (self — faster Overload buildup)
            A2: {
                passives: [
                    {
                        name: 'Wind Elemental Accumulation (A2)',
                        description: '[Wind] [Elemental Accumulation] effectiveness increases by 20%.',
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Wind Elemental Accumulation +20%',
                        trigger: 'permanent',
                        scope: 'self',
                        effects: { windElementalAccumulation: 20 },
                        duration: 'infinite',
                        note: 'A2: +20% Wind Elemental Accumulation effectiveness (builds Overload faster)'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Weapon: Wind Overload Boost',
                        trigger: 'Punisher / Eclipse Slash / Extinction Blade',
                        scope: 'team',
                        effects: { windOverload: 21 },
                        duration: 30,
                        note: 'A2 weapon: +7% Wind OL per stack ×3 = +21% Wind Overload for team (30s)'
                    }
                ],
                raidBuffs: [],
                debuffs: [],
            },
            // A3: [Tempest Blade] — on Wind Overload inflicted → Sung + Wind team get massive buffs
            // +18% DefPen, +45% Wind Overload DMG, +100% Wind QTE Skill DMG, 15s
            A3: {
                passives: [
                    {
                        name: '[Tempest Blade] (A3)',
                        description: 'When Sugimoto or an ally inflicts Wind Overload, grants Sung Jinwoo and Wind team members [Tempest Blade]: +18% DefPen, +45% Wind Overload DMG, +100% Wind QTE Skill DMG. 15s.',
                        mechanic: 'conditional',
                        duration: 15
                    }
                ],
                selfBuffs: [],
                teamBuffs: [
                    {
                        name: 'Weapon: Wind Overload Boost',
                        trigger: 'Punisher / Eclipse Slash / Extinction Blade',
                        scope: 'team',
                        effects: { windOverload: 24 },
                        duration: 30,
                        note: 'A3 weapon: +8% Wind OL per stack ×3 = +24% Wind Overload for team (30s)'
                    },
                    {
                        name: '[Tempest Blade]',
                        trigger: 'Wind Overload inflicted (by Sugimoto or ally)',
                        scope: 'team-wind',
                        effects: { defPen: 18, windOverload: 45, windQTESkillDamage: 100 },
                        duration: 15,
                        note: 'A3: +18% DefPen, +45% Wind OL DMG, +100% Wind QTE Skill DMG for Sung + Wind team (15s)'
                    }
                ],
                raidBuffs: [],
                debuffs: [],
            },
            // A4: +10% CritDMG per Wind ally for Wind team members
            A4: {
                passives: [
                    {
                        name: 'Wind Crit Synergy (A4)',
                        description: 'The Critical Hit damage of Wind team members increases by 10% for every Wind ally.',
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [],
                teamBuffs: [
                    {
                        name: 'Weapon: Wind Overload Boost',
                        trigger: 'Punisher / Eclipse Slash / Extinction Blade',
                        scope: 'team',
                        effects: { windOverload: 27 },
                        duration: 30,
                        note: 'A4 weapon: +9% Wind OL per stack ×3 = +27% Wind Overload for team (30s)'
                    },
                    {
                        name: 'Wind Crit Synergy',
                        trigger: 'passive (per Wind ally)',
                        scope: 'team-wind',
                        effects: { critDMG: 30 },
                        duration: 'infinite',
                        note: 'A4: +10% CritDMG per Wind ally (3 Wind allies = +30% CritDMG for Wind team)'
                    }
                ],
                raidBuffs: [],
                debuffs: [],
            },
            // A5: [Stormflash] Extinction Blade & Blossomfall +300% DMG (30s)
            // [Sword Dance] enhanced: Core Attack +100%, Wind Accumulation +20%, 15s
            A5: {
                passives: [
                    {
                        name: '[Stormflash] (A5)',
                        description: 'Using Quickblade-Oblivion activates [Stormflash]: Extinction Blade and Blossomfall damage increase by 300%. 30s.',
                        mechanic: 'conditional',
                        duration: 30
                    },
                    {
                        name: '[Sword Dance] Enhanced (A5)',
                        description: 'Core Gauge recharges 2× faster. Skills + Extreme Evasion activate Core Attack. Core Attack DMG +100%. Wind Elemental Accumulation +20%. 15s.',
                        mechanic: 'conditional',
                        duration: 15
                    }
                ],
                selfBuffs: [
                    {
                        name: '[Stormflash]',
                        trigger: 'Quickblade-Oblivion',
                        scope: 'self',
                        effects: { skillDamage: 300 },
                        duration: 30,
                        note: 'A5: Extinction Blade & Blossomfall +300% DMG (30s)'
                    },
                    {
                        name: '[Sword Dance] Enhanced (A5)',
                        trigger: 'Unbroken Focus',
                        scope: 'self',
                        effects: { coreAttackDamage: 100, windElementalAccumulation: 20 },
                        duration: 15,
                        note: 'A5: Core Attack +100% DMG, Wind Accumulation +20%, Extreme Evasion → Core Attack (15s)'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Weapon: Wind Overload Boost',
                        trigger: 'Punisher / Eclipse Slash / Extinction Blade',
                        scope: 'team',
                        effects: { windOverload: 30 },
                        duration: 30,
                        note: 'A5 weapon: +10% Wind OL per stack ×3 = +30% Wind Overload for team (30s)'
                    },
                    {
                        name: '[Tempest Blade]',
                        trigger: 'Wind Overload inflicted (by Sugimoto or ally)',
                        scope: 'team-wind',
                        effects: { defPen: 18, windOverload: 45, windQTESkillDamage: 100 },
                        duration: 15,
                        note: 'A3: +18% DefPen, +45% Wind OL DMG, +100% Wind QTE Skill DMG for Sung + Wind team (15s)'
                    },
                    {
                        name: 'Wind Crit Synergy',
                        trigger: 'passive (per Wind ally)',
                        scope: 'team-wind',
                        effects: { critDMG: 30 },
                        duration: 'infinite',
                        note: 'A4: +10% CritDMG per Wind ally (3 Wind allies = +30% CritDMG for Wind team)'
                    }
                ],
                raidBuffs: [],
                debuffs: [],
            },
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🌪️ AMAMIYA MIREI - Wind Assassin (ATK scaling)
    // MP-based ATK scaler, [Kuroha's Darkness] skill damage boost
    // Arme: rien de notable
    // ═══════════════════════════════════════════════════════════════
    mirei: {
        id: 'mirei',
        name: 'Amamiya Mirei',
        class: 'Assassin',
        element: 'Wind',
        scaleStat: 'ATK',
        primaryRole: 'DPS',
        secondaryRole: 'None',
        tags: ['ATK Scaler', 'MP Scaler', 'Self Buffer', 'Kuroha Darkness'],

        // Arme: Power Gauge +X% on stage enter + CR/CritDMG +X% on Kuroha skills (self)
        // A0→A5: Power Gauge 10/20/30/40/50/60%, CR/CD on skills 5/10/15/20/25/30%
        weapon: {
            selfBuffs: [
                {
                    name: 'Kuroha Skill CR/CritDMG Boost (Weapon)',
                    trigger: 'Kuroha skills (Wings of Night / Raven\'s Cry)',
                    scope: 'self',
                    scaling: [
                        { effects: { critRate: 5, critDMG: 5 } },
                        { effects: { critRate: 10, critDMG: 10 } },
                        { effects: { critRate: 15, critDMG: 15 } },
                        { effects: { critRate: 20, critDMG: 20 } },
                        { effects: { critRate: 25, critDMG: 25 } },
                        { effects: { critRate: 30, critDMG: 30 } },
                    ],
                    duration: 'while active',
                    note: 'Weapon: +CR & +CritDMG on Kuroha skills (main rotation, ~permanent uptime)'
                }
            ],
            teamBuffs: [],
        },

        advancements: {
            A0: {
                passives: [
                    {
                        name: 'MP-based ATK Scaling',
                        description: 'When MP ≥ 30%, applies [Kuroha\'s Darkness]. ATK increases by 6% per 150 additional MP (up to +90% ATK).',
                        mechanic: 'conditional'
                    },
                    {
                        name: "[Kuroha's Darkness]",
                        description: "Increases damage of Kuroha's Sword Technique Type 3: Wings of Night and Type 4: Raven's Cry by 30%.",
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'MP ATK Scaling',
                        trigger: 'MP ≥ 30%',
                        scope: 'self',
                        effects: { attack: 90 },
                        duration: 'while active',
                        note: 'A0: +6% ATK per 150 MP (max +90% ATK at full MP)'
                    },
                    {
                        name: "[Kuroha's Darkness] Skill Boost",
                        trigger: 'MP ≥ 30%',
                        scope: 'self',
                        effects: { skillDamage: 30 },
                        duration: 'while active',
                        note: "A0: +30% DMG on Wings of Night & Raven's Cry"
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
            // A1: [Possessed] +20% CR/CritDMG, [Deep Darkness] +12% ATK/CR ×2, [Winter's Edge] DOT 100% ATK
            A1: {
                passives: [
                    {
                        name: "[Winter's Edge] (A1)",
                        description: "Kuroha's Sword Technique Lethal Move: Moonless Night Overture inflicts [Winter's Edge]. DOT: 100% ATK every 3s, 30s, stacks ×10.",
                        mechanic: 'conditional',
                        duration: 30
                    },
                    {
                        name: '[Deep Darkness] (A1)',
                        description: "Using Wings of Night while [Possessed] is active applies [Deep Darkness]: +12% ATK & CR, stacks ×2. 12s.",
                        mechanic: 'conditional',
                        duration: 12
                    }
                ],
                selfBuffs: [
                    {
                        name: '[Possessed] CR/CritDMG Boost',
                        trigger: '[Possessed] active',
                        scope: 'self',
                        effects: { critRate: 20, critDMG: 20 },
                        duration: 'while active',
                        note: 'A1: +20% CR & +20% CritDMG while [Possessed] is active'
                    },
                    {
                        name: '[Deep Darkness]',
                        trigger: 'Wings of Night during [Possessed]',
                        scope: 'self',
                        effects: { attack: 24, critRate: 24 },
                        duration: 12,
                        note: 'A1: +12% ATK & +12% CR per stack ×2 = +24% ATK/CR (12s)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: "[Winter's Edge]",
                        trigger: 'Moonless Night Overture hit',
                        scope: 'enemy',
                        effects: { dot: 100 },
                        duration: 30,
                        note: 'DOT: 100% ATK every 3s. Stacks ×10. ATK-scaling DOT.'
                    }
                ],
            },
            // A2: Power Gauge +40% on stage enter, +40% CritDMG (self, permanent)
            A2: {
                passives: [
                    {
                        name: 'Stage Entry Boost (A2)',
                        description: 'When entering the stage, Power Gauge is charged by 40% and Critical Hit damage increases by 40%.',
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'CritDMG Boost (A2)',
                        trigger: 'stage entry (permanent)',
                        scope: 'self',
                        effects: { critDMG: 40 },
                        duration: 'infinite',
                        note: 'A2: +40% CritDMG (permanent from stage entry)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
            // A3: Basic/Core Attack → 2% MP + 1% Power Gauge + Lethal Move CD -2s
            // [Midnight Gale]: +0.2% DefPen + +1% Wind OL per stack ×100 = +20% DefPen + +100% Wind OL (self, infinite)
            A3: {
                passives: [
                    {
                        name: 'Basic/Core Attack Recovery (A3)',
                        description: 'Basic Attack or Core Attack restores 2% MP, 1% Power Gauge, and reduces Moonless Night Overture CD by 2s.',
                        mechanic: 'conditional'
                    },
                    {
                        name: '[Midnight Gale] (A3)',
                        description: "Hitting a target affected by [Winter's Edge] grants [Midnight Gale]: +0.2% DefPen + +1% Wind Overload per stack. Stacks ×100 (max +20% DefPen + +100% Wind OL). Infinite.",
                        mechanic: 'stacking'
                    }
                ],
                selfBuffs: [
                    {
                        name: '[Midnight Gale]',
                        trigger: "hit target with [Winter's Edge]",
                        scope: 'self',
                        effects: { defPen: 20, windOverload: 100 },
                        duration: 'infinite',
                        note: "A3: +0.2% DefPen + +1% Wind OL per stack ×100 = +20% DefPen + +100% Wind Overload (infinite)"
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
            // A4: +12% Wind DMG per Wind member ×3 = +36% Wind DMG (self)
            // In Guild Boss: stacks per ally (no cap)
            A4: {
                passives: [
                    {
                        name: 'Wind Synergy (A4)',
                        description: "Mirei's Wind damage increases by 12% for every Wind member (stacks ×3). In Guild Boss mode, stacks once per ally with no limit.",
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Wind Ally Damage Boost',
                        trigger: 'passive (per Wind ally)',
                        scope: 'self',
                        effects: { windDamage: 36 },
                        duration: 'infinite',
                        note: 'A4: +12% Wind DMG per Wind member ×3 = +36% Wind DMG (self). Guild Boss: no stack limit.'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
            // A5: [Raven's Confession] while [Possessed]: +80% skill DMG + +30% back attack DMG
            A5: {
                passives: [
                    {
                        name: "[Raven's Confession] (A5)",
                        description: "While [Possessed], gains [Raven's Confession]: Wings of Night & Raven's Cry +80% DMG. Back attack damage +30%.",
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [
                    {
                        name: "[Raven's Confession]",
                        trigger: '[Possessed] active',
                        scope: 'self',
                        effects: { skillDamage: 80, backAttackDamage: 30 },
                        duration: 'while active',
                        note: "A5: +80% DMG on Wings of Night & Raven's Cry + +30% back attack DMG"
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🌪️ SOYEON - Wind Fighter (ATK scaling)
    // Arme: +ATK% (self) + Basic Skill DMG for team (30s)
    // ═══════════════════════════════════════════════════════════════
    soyeon: {
        id: 'soyeon',
        name: 'Soyeon',
        class: 'Fighter',
        element: 'Wind',
        scaleStat: 'ATK',
        primaryRole: 'DPS',
        secondaryRole: 'Support',
        tags: ['ATK Scaler', 'Basic Skill Buffer', 'Team Buffer'],

        advancements: {
            A0: {
                passives: [
                    {
                        name: "Soyeon's Weapon - Basic Skill Buffer",
                        description: 'Using Kill the Mic, Hook and Chain (or Ver. 2) increases Basic Skill damage of team members by 5% for 30s.',
                        mechanic: 'weapon',
                        duration: 30
                    },
                    {
                        name: '[FOREVER] (A0)',
                        description: '[FOREVER] activates on entire team when entering stage: +5% damage dealt per stack ×3 = +15% DMG. Infinite.',
                        mechanic: 'permanent'
                    },
                    {
                        name: '[Beat Maker] / [Drop the Beat] System',
                        description: 'Hook and Chain → [Beat Maker]: skills become Ver. 2 (+100% Kill the Mic, +50% Hook and Chain). Kill the Mic within 20s after Beat Maker ends → [Drop the Beat]: Core Attack + Remix Shot Ver. 2 (+50% DMG).',
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [
                    {
                        name: '[Beat Maker] Skill Enhancement',
                        trigger: 'Hook and Chain',
                        scope: 'self',
                        effects: { skillDamage: 100 },
                        duration: 10,
                        note: 'A0: Kill the Mic +100%, Hook and Chain +50%. Super Armor during Ver. 2 skills. 10s.'
                    },
                    {
                        name: '[Magnum Chain]',
                        trigger: 'Remix Shot Ver. 2 (consumes [magnum] rounds)',
                        scope: 'self',
                        effects: { coreAttackDamage: 15 },
                        duration: 3,
                        note: 'A0: +15% Core Attack DMG per stack ×6, restores 8 MP + 1.2% Power Gauge per stack. 3s.'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Weapon: Basic Skill DMG Boost',
                        trigger: 'Kill the Mic / Hook and Chain (or Ver. 2)',
                        scope: 'team',
                        effects: { basicSkillDamage: 5 },
                        duration: 30,
                        note: 'A0 weapon: +5% Basic Skill DMG for team (30s)'
                    },
                    {
                        name: '[FOREVER]',
                        trigger: 'stage entry (automatic)',
                        scope: 'team',
                        effects: { damageIncrease: 15 },
                        duration: 'infinite',
                        note: 'A0: +5% damage dealt per stack ×3 = +15% DMG for entire team (infinite)'
                    }
                ],
                raidBuffs: [],
                debuffs: [],
            },
            // A1: [Break] +3s duration. [Diss Battle] debuff: +1% Wind DMG taken + +1% DMG taken ×5 (30s)
            A1: {
                passives: [
                    {
                        name: 'Extended Break (A1)',
                        description: 'When Soyeon or an ally puts target in [Break], its duration increases by 3s.',
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [],
                teamBuffs: [
                    {
                        name: 'Weapon: Basic Skill DMG Boost',
                        trigger: 'Kill the Mic / Hook and Chain (or Ver. 2)',
                        scope: 'team',
                        effects: { basicSkillDamage: 10 },
                        duration: 30,
                        note: 'A1 weapon: +10% Basic Skill DMG for team (30s)'
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: '[Diss Battle]',
                        trigger: 'Hook and Chain / Hook and Chain Ver. 2 hit',
                        scope: 'enemy',
                        effects: { windDamageTaken: 5, damageTaken: 5 },
                        duration: 30,
                        note: 'A1: +1% Wind DMG taken + +1% DMG taken per stack ×5 = +5%/+5% on enemy (30s)'
                    }
                ],
            },
            // A2: [Break] effectiveness +20% (self utility)
            A2: {
                passives: [
                    {
                        name: 'Break Effectiveness (A2)',
                        description: '[Break] effectiveness increases by 20%.',
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [],
                teamBuffs: [
                    {
                        name: 'Weapon: Basic Skill DMG Boost',
                        trigger: 'Kill the Mic / Hook and Chain (or Ver. 2)',
                        scope: 'team',
                        effects: { basicSkillDamage: 15 },
                        duration: 30,
                        note: 'A2 weapon: +15% Basic Skill DMG for team (30s)'
                    }
                ],
                raidBuffs: [],
                debuffs: [],
            },
            // A3: [Beat Boost] on entire team at stage entry: +15% Ultimate Skill DMG + +10% Wind DMG (infinite)
            // Wind 3rd hunter synergy: 10% Power Gauge on magnum reload
            A3: {
                passives: [
                    {
                        name: '[Beat Boost] (A3)',
                        description: '[Beat Boost] applied to entire team on stage entry: +15% Ultimate Skill DMG + +10% Wind DMG. Infinite. If 3rd hunter is Wind, they regain 10% Power Gauge on magnum reload.',
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [],
                teamBuffs: [
                    {
                        name: 'Weapon: Basic Skill DMG Boost',
                        trigger: 'Kill the Mic / Hook and Chain (or Ver. 2)',
                        scope: 'team',
                        effects: { basicSkillDamage: 20 },
                        duration: 30,
                        note: 'A3 weapon: +20% Basic Skill DMG for team (30s)'
                    },
                    {
                        name: '[Beat Boost]',
                        trigger: 'stage entry (automatic)',
                        scope: 'team',
                        effects: { ultimateSkillDamage: 15, windDamage: 10 },
                        duration: 'infinite',
                        note: 'A3: +15% Ultimate Skill DMG + +10% Wind DMG for entire team (infinite)'
                    }
                ],
                raidBuffs: [],
                debuffs: [],
            },
            // A4: +3% Wind DMG per Wind ally for team members (×3 = +9% Wind DMG)
            A4: {
                passives: [
                    {
                        name: 'Wind Team Synergy (A4)',
                        description: 'The Wind damage of team members increases by 3% for every Wind ally.',
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [],
                teamBuffs: [
                    {
                        name: 'Weapon: Basic Skill DMG Boost',
                        trigger: 'Kill the Mic / Hook and Chain (or Ver. 2)',
                        scope: 'team',
                        effects: { basicSkillDamage: 25 },
                        duration: 30,
                        note: 'A4 weapon: +25% Basic Skill DMG for team (30s)'
                    },
                    {
                        name: 'Wind Ally DMG Synergy',
                        trigger: 'passive (per Wind ally)',
                        scope: 'team',
                        effects: { windDamage: 9 },
                        duration: 'infinite',
                        note: 'A4: +3% Wind DMG per Wind ally ×3 = +9% Wind DMG for team members'
                    }
                ],
                raidBuffs: [],
                debuffs: [],
            },
            // A5: [Magnum Chain] enhanced → +30% Core ATK (was 15%)
            // [Diss Battle] enhanced → stacks ×10 = +10% Wind DMG taken + +10% DMG taken (was ×5)
            A5: {
                passives: [
                    {
                        name: 'Enhanced Magnum Chain & Diss Battle (A5)',
                        description: '[Magnum Chain] Core Attack +30% (was 15%). [Diss Battle] stacks ×10 (was ×5): +10% Wind DMG taken + +10% DMG taken.',
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    {
                        name: '[Magnum Chain] Enhanced (A5)',
                        trigger: 'Remix Shot Ver. 2 (consumes [magnum] rounds)',
                        scope: 'self',
                        effects: { coreAttackDamage: 30 },
                        duration: 3,
                        note: 'A5: +30% Core Attack DMG per stack ×6 (upgraded from 15%). 8 MP + 1.2% Power Gauge per stack.'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Weapon: Basic Skill DMG Boost',
                        trigger: 'Kill the Mic / Hook and Chain (or Ver. 2)',
                        scope: 'team',
                        effects: { basicSkillDamage: 30 },
                        duration: 30,
                        note: 'A5 weapon: +30% Basic Skill DMG for team (30s)'
                    },
                    {
                        name: '[FOREVER]',
                        trigger: 'stage entry (automatic)',
                        scope: 'team',
                        effects: { damageIncrease: 15 },
                        duration: 'infinite',
                        note: '+5% damage dealt per stack ×3 = +15% DMG for entire team (infinite)'
                    },
                    {
                        name: '[Beat Boost]',
                        trigger: 'stage entry (automatic)',
                        scope: 'team',
                        effects: { ultimateSkillDamage: 15, windDamage: 10 },
                        duration: 'infinite',
                        note: 'A3: +15% Ultimate Skill DMG + +10% Wind DMG for entire team (infinite)'
                    },
                    {
                        name: 'Wind Ally DMG Synergy',
                        trigger: 'passive (per Wind ally)',
                        scope: 'team',
                        effects: { windDamage: 9 },
                        duration: 'infinite',
                        note: 'A4: +3% Wind DMG per Wind ally ×3 = +9% Wind DMG for team members'
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: '[Diss Battle] Enhanced (A5)',
                        trigger: 'Hook and Chain / Hook and Chain Ver. 2 hit',
                        scope: 'enemy',
                        effects: { windDamageTaken: 10, damageTaken: 10 },
                        duration: 30,
                        note: 'A5: +1% Wind DMG taken + +1% DMG taken per stack ×10 = +10%/+10% on enemy (30s, upgraded from ×5)'
                    }
                ],
            },
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🌪️ GOTO RYUJI - Wind Tank (HP scaling)
    // Arme: +HP% (self) + CritDMG on Reverse Tempest / Storm Blade (self, 15s)
    // ═══════════════════════════════════════════════════════════════
    goto: {
        id: 'goto',
        name: 'Goto Ryuji',
        class: 'Tank',
        element: 'Wind',
        scaleStat: 'HP',
        primaryRole: 'Tank',
        secondaryRole: 'DPS',
        tags: ['HP Scaler', 'Tank', 'Self Buffer'],

        advancements: {
            A0: {
                passives: [
                    {
                        name: "Goto's Weapon - CritDMG on Skill",
                        description: 'Using Reverse Tempest or Storm Blade increases CritDMG by 5% for 15s.',
                        mechanic: 'weapon',
                        duration: 15
                    },
                    {
                        name: 'MP Recovery on Basic Skill',
                        description: 'Basic Skill hit recovers 50 MP.',
                        mechanic: 'permanent'
                    },
                    {
                        name: 'CritDMG → CritRate Conversion',
                        description: "Critical Hit Rate increases equal to 20% of the user's Critical Hit damage stat.",
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: CritDMG Boost',
                        trigger: 'Reverse Tempest / Storm Blade',
                        scope: 'self',
                        effects: { critDMG: 5 },
                        duration: 15,
                        note: 'A0 weapon: +5% CritDMG on skill use (self, 15s)'
                    },
                    {
                        name: 'CritDMG → CritRate Conversion',
                        trigger: 'permanent',
                        scope: 'self',
                        effects: { critRateFromCritDMG: 20 },
                        duration: 'infinite',
                        note: 'A0: CR increases by 20% of CritDMG stat (passive conversion)'
                    },
                    {
                        name: '[Exorcise]',
                        trigger: 'Skill 1 hit',
                        scope: 'self',
                        effects: { critDMG: 15 },
                        duration: 7,
                        note: 'A0: +3% CritDMG per stack ×5 = +15% CritDMG (7s). At 5 stacks triggers [Arrogance].'
                    }
                ],
                teamBuffs: [
                    {
                        name: '[Arrogance]',
                        trigger: '[Exorcise] reaches 5 stacks',
                        scope: 'team-wind',
                        effects: { critDMG: 20, basicSkillDamage: 20 },
                        duration: 20,
                        note: 'A0: +20% CritDMG + +20% Basic Skill DMG for Wind team members (20s). Side effect: +33% Mana consumption.'
                    }
                ],
                raidBuffs: [],
                debuffs: [],
            },
            // A1: [Break] +3s, [Tyrant's Path] +12% DMG vs Break (team, infinite)
            // Death Gale → +10% Wind DMG on Reverse Tempest/Storm Blade (self, 10s)
            // [Exorcise] ×5 → [Demonic Soul]
            A1: {
                passives: [
                    {
                        name: 'Extended Break (A1)',
                        description: "If Goto or an ally puts enemy in [Break], its duration increases by 3s.",
                        mechanic: 'permanent'
                    },
                    {
                        name: '[Demonic Soul] (A1)',
                        description: 'When [Exorcise] stacks 5 times, triggers [Demonic Soul] effect.',
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: CritDMG Boost',
                        trigger: 'Reverse Tempest / Storm Blade',
                        scope: 'self',
                        effects: { critDMG: 10 },
                        duration: 15,
                        note: 'A1 weapon: +10% CritDMG on skill use (self, 15s)'
                    },
                    {
                        name: 'Death Gale Wind Boost',
                        trigger: 'Death Gale',
                        scope: 'self',
                        effects: { windDamage: 10 },
                        duration: 10,
                        note: 'A1: +10% Wind DMG on Reverse Tempest & Storm Blade (10s)'
                    }
                ],
                teamBuffs: [
                    {
                        name: "[Tyrant's Path]",
                        trigger: 'stage entry (automatic)',
                        scope: 'team',
                        effects: { breakTargetDmg: 12 },
                        duration: 'infinite',
                        note: 'A1: +12% damage dealt to targets in [Break] state for all allies (infinite)'
                    }
                ],
                raidBuffs: [],
                debuffs: [],
            },
            // A2: [Break] effectiveness +20%
            A2: {
                passives: [
                    {
                        name: 'Break Effectiveness (A2)',
                        description: "[Break] effectiveness increases by 20%.",
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: CritDMG Boost',
                        trigger: 'Reverse Tempest / Storm Blade',
                        scope: 'self',
                        effects: { critDMG: 15 },
                        duration: 15,
                        note: 'A2 weapon: +15% CritDMG on skill use (self, 15s)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
            // A3: +20% CritDMG on Divine Wind / Devastate Prey (self, 12s)
            A3: {
                passives: [
                    {
                        name: 'Divine Wind CritDMG (A3)',
                        description: 'Using Divine Wind or Devastate Prey increases CritDMG by 20% for 12s.',
                        mechanic: 'conditional',
                        duration: 12
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: CritDMG Boost',
                        trigger: 'Reverse Tempest / Storm Blade',
                        scope: 'self',
                        effects: { critDMG: 20 },
                        duration: 15,
                        note: 'A3 weapon: +20% CritDMG on skill use (self, 15s)'
                    },
                    {
                        name: 'Divine Wind CritDMG',
                        trigger: 'Divine Wind / Devastate Prey',
                        scope: 'self',
                        effects: { critDMG: 20 },
                        duration: 12,
                        note: 'A3: +20% CritDMG on Divine Wind or Devastate Prey (12s)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
            // A4: 3rd hunter in team gets +24% DMG dealt but +12% DMG taken
            A4: {
                passives: [
                    {
                        name: 'Third Hunter Empowerment (A4)',
                        description: 'The damage of the third hunter in the team increases by 24%, but their damage taken also increases by 12%.',
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: CritDMG Boost',
                        trigger: 'Reverse Tempest / Storm Blade',
                        scope: 'self',
                        effects: { critDMG: 25 },
                        duration: 15,
                        note: 'A4 weapon: +25% CritDMG on skill use (self, 15s)'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Third Hunter Empowerment',
                        trigger: 'permanent (3rd team slot)',
                        scope: 'team',
                        effects: { damageIncrease: 24 },
                        duration: 'infinite',
                        note: 'A4: 3rd hunter in team +24% DMG dealt (but +12% DMG taken as tradeoff)'
                    }
                ],
                raidBuffs: [],
                debuffs: [],
            },
            // A5: Skills +2 extra hits (+10% DMG each), +2 usages
            // Devastate Prey +60% DMG & CritDMG when HP ratio > enemy's
            A5: {
                passives: [
                    {
                        name: 'Enhanced Skills (A5)',
                        description: "Phantom's Heavenly Hurricane, Reverse Tempest, and Storm Blade can hit 2 more times with +10% additional damage per attack. Usage count increases by 2.",
                        mechanic: 'permanent'
                    },
                    {
                        name: 'Devastate Prey HP Conditional (A5)',
                        description: "When Goto's HP ratio is higher than the enemy's, Devastate Prey's damage and Critical Hit damage increase by 60%.",
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: CritDMG Boost',
                        trigger: 'Reverse Tempest / Storm Blade',
                        scope: 'self',
                        effects: { critDMG: 30 },
                        duration: 15,
                        note: 'A5 weapon: +30% CritDMG on skill use (self, 15s)'
                    },
                    {
                        name: 'Devastate Prey Conditional (A5)',
                        trigger: 'HP ratio > enemy',
                        scope: 'self',
                        effects: { skillDamage: 60, critDMG: 60 },
                        duration: 'while active',
                        note: 'A5: Devastate Prey +60% DMG & +60% CritDMG when HP ratio > enemy'
                    }
                ],
                teamBuffs: [
                    {
                        name: "[Tyrant's Path]",
                        trigger: 'stage entry (automatic)',
                        scope: 'team',
                        effects: { breakTargetDmg: 12 },
                        duration: 'infinite',
                        note: 'A1: +12% damage dealt to targets in [Break] state for all allies (infinite)'
                    },
                    {
                        name: '[Arrogance]',
                        trigger: '[Exorcise] reaches 5 stacks',
                        scope: 'team-wind',
                        effects: { critDMG: 20, basicSkillDamage: 20 },
                        duration: 20,
                        note: 'A0: +20% CritDMG + +20% Basic Skill DMG for Wind team (20s)'
                    },
                    {
                        name: 'Third Hunter Empowerment',
                        trigger: 'permanent (3rd team slot)',
                        scope: 'team',
                        effects: { damageIncrease: 24 },
                        duration: 'infinite',
                        note: 'A4: 3rd hunter +24% DMG dealt (but +12% DMG taken)'
                    }
                ],
                raidBuffs: [],
                debuffs: [],
            },
        }
    },
    // 🌪️ JINAH - Wind Support (DEF scaling)
    // Arme: +DEF% (self) + Basic Skill DMG +X% for team (on Reverse Tempest Cleave / Umbrella)
    // A0: [Wind] +50% skill DMG (self), [Gale Wings] → [Wings of Freedom] +10% Basic/Ulti Skill DMG (team)
    // A1: [Wings of Freedom] enhanced: +20% Basic/Ulti + +10% Wind DMG, MP recovery on Gale Wings
    // A2: [Wings of Freedom] adds [Unrecoverable] on Ulti hit (anti-heal debuff)
    // A3: [Wind's Touch] ×10 stacks: +10% ATK/DEF/+5% Basic (all), doubled for Wind members
    // A4: +5% Wind DMG per Wind ally (team-wind)
    // A5: [Aero] +2% Wind DMG ×5 = +10% Wind DMG (team), [Serenade] burst
    // ═══════════════════════════════════════════════════════════════
    jinah: {
        id: 'jinah',
        name: 'Jinah',
        class: 'Fighter',
        element: 'Wind',
        scaleStat: 'DEF',
        primaryRole: 'Support',
        secondaryRole: 'DPS',
        tags: ['DEF Scaler', 'Support', 'Team Buffer', 'Wind Synergy'],

        advancements: {
            // A0: [Wind] +50% skill DMG (self), [Gale Wings] → [Wings of Freedom] +10% Basic/Ulti (team)
            A0: {
                passives: [
                    {
                        name: "Jinah's Weapon - Basic Skill DMG for Team",
                        description: 'Using Reverse Tempest Cleave or Umbrella: Reverse Tempest Cleave increases team Basic Skill damage by 0.3%.',
                        mechanic: 'weapon',
                        duration: 30
                    },
                    {
                        name: '[Wind] Effect',
                        description: 'Using skills activates [Wind]: +50% skill DMG (self). At 3 stacks, grants max [Gale Wings] to team (except Jinah). Duration 60s, ×3 stacks.',
                        mechanic: 'conditional'
                    },
                    {
                        name: '[Gale Wings] → [Wings of Freedom]',
                        description: 'Allies consume [Gale Wings] on Basic/Ultimate Skill use to activate [Wings of Freedom]: +10% Basic & Ultimate Skill DMG (5s).',
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: DEF Boost',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { defense: 2 },
                        duration: 'infinite',
                        note: 'A0 weapon: +2% DEF (self)'
                    },
                    {
                        name: '[Wind] Skill DMG',
                        trigger: 'skill use (stacking)',
                        scope: 'self',
                        effects: { skillDamage: 50 },
                        duration: 60,
                        note: 'A0: [Wind] effect +50% skill DMG (self, 60s, ×3 stacks)'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Weapon: Basic Skill DMG',
                        trigger: 'Reverse Tempest Cleave / Umbrella',
                        scope: 'team',
                        effects: { basicSkillDamage: 0.3 },
                        duration: 30,
                        note: 'A0 weapon: +0.3% Basic Skill DMG for team (30s)'
                    },
                    {
                        name: '[Wings of Freedom]',
                        trigger: 'ally consumes [Gale Wings]',
                        scope: 'team',
                        effects: { basicSkillDamage: 10, ultimateSkillDamage: 10 },
                        duration: 5,
                        note: 'A0: +10% Basic & Ultimate Skill DMG for allies (5s, high uptime via Gale Wings)'
                    }
                ],
                raidBuffs: [],
                debuffs: [],
            },
            // A1: [Wings of Freedom] enhanced → +20% Basic/Ulti + +10% Wind DMG (10s)
            A1: {
                passives: [
                    {
                        name: '[Wings of Freedom] Enhanced (A1)',
                        description: '[Wings of Freedom] now grants +20% Basic/Ultimate Skill DMG + +10% Wind DMG (10s). [Gale Wings] activation recovers 100 MP per instance for entire team.',
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: DEF Boost',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { defense: 4 },
                        duration: 'infinite',
                        note: 'A1 weapon: +4% DEF (self)'
                    },
                    {
                        name: '[Wind] Skill DMG',
                        trigger: 'skill use (stacking)',
                        scope: 'self',
                        effects: { skillDamage: 50 },
                        duration: 60,
                        note: 'A0: [Wind] effect +50% skill DMG (self, 60s, ×3 stacks)'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Weapon: Basic Skill DMG',
                        trigger: 'Reverse Tempest Cleave / Umbrella',
                        scope: 'team',
                        effects: { basicSkillDamage: 0.7 },
                        duration: 30,
                        note: 'A1 weapon: +0.7% Basic Skill DMG for team (30s)'
                    },
                    {
                        name: '[Wings of Freedom] Enhanced',
                        trigger: 'ally consumes [Gale Wings]',
                        scope: 'team',
                        effects: { basicSkillDamage: 20, ultimateSkillDamage: 20, windDamage: 10 },
                        duration: 10,
                        note: 'A1: +20% Basic/Ulti Skill DMG + +10% Wind DMG for allies (10s, high uptime)'
                    }
                ],
                raidBuffs: [],
                debuffs: [],
            },
            // A2: [Wings of Freedom] adds [Unrecoverable] on Ulti hit (anti-heal, no % DMG change)
            A2: {
                passives: [
                    {
                        name: '[Unrecoverable] Debuff (A2)',
                        description: '[Wings of Freedom] enhanced: when ally Ultimate Skill hits, applies [Unrecoverable] (target cannot recover HP, 30s).',
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: DEF Boost',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { defense: 6 },
                        duration: 'infinite',
                        note: 'A2 weapon: +6% DEF (self)'
                    },
                    {
                        name: '[Wind] Skill DMG',
                        trigger: 'skill use (stacking)',
                        scope: 'self',
                        effects: { skillDamage: 50 },
                        duration: 60,
                        note: 'A0: [Wind] effect +50% skill DMG (self, 60s, ×3 stacks)'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Weapon: Basic Skill DMG',
                        trigger: 'Reverse Tempest Cleave / Umbrella',
                        scope: 'team',
                        effects: { basicSkillDamage: 1.0 },
                        duration: 30,
                        note: 'A2 weapon: +1.0% Basic Skill DMG for team (30s)'
                    },
                    {
                        name: '[Wings of Freedom] Enhanced',
                        trigger: 'ally consumes [Gale Wings]',
                        scope: 'team',
                        effects: { basicSkillDamage: 20, ultimateSkillDamage: 20, windDamage: 10 },
                        duration: 10,
                        note: 'A1+: +20% Basic/Ulti Skill DMG + +10% Wind DMG for allies (10s)'
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: '[Unrecoverable]',
                        trigger: 'ally Ultimate Skill hit (via Wings of Freedom)',
                        scope: 'enemy',
                        effects: { antiHeal: true },
                        duration: 30,
                        note: 'A2: Target cannot recover HP (30s)'
                    }
                ],
            },
            // A3: [Wind's Touch] ×10: all +10% ATK/DEF/+5% Basic, Wind members +20% ATK/DEF/+10% Basic
            A3: {
                passives: [
                    {
                        name: "[Wind's Touch] (A3)",
                        description: 'When [Wind] activates, grants [Wind\'s Touch] to entire team. Per stack: +1% ATK, +1% DEF, +0.5% Basic Skill DMG. Wind members get double. Infinite duration, ×10 stacks.',
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: DEF Boost',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { defense: 8 },
                        duration: 'infinite',
                        note: 'A3 weapon: +8% DEF (self)'
                    },
                    {
                        name: '[Wind] Skill DMG',
                        trigger: 'skill use (stacking)',
                        scope: 'self',
                        effects: { skillDamage: 50 },
                        duration: 60,
                        note: 'A0: [Wind] effect +50% skill DMG (self, 60s, ×3 stacks)'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Weapon: Basic Skill DMG',
                        trigger: 'Reverse Tempest Cleave / Umbrella',
                        scope: 'team',
                        effects: { basicSkillDamage: 1.3 },
                        duration: 30,
                        note: 'A3 weapon: +1.3% Basic Skill DMG for team (30s)'
                    },
                    {
                        name: '[Wings of Freedom] Enhanced',
                        trigger: 'ally consumes [Gale Wings]',
                        scope: 'team',
                        effects: { basicSkillDamage: 20, ultimateSkillDamage: 20, windDamage: 10 },
                        duration: 10,
                        note: 'A1+: +20% Basic/Ulti Skill DMG + +10% Wind DMG for allies (10s)'
                    },
                    {
                        name: "[Wind's Touch] (all allies)",
                        trigger: '[Wind] activation (stacking)',
                        scope: 'team',
                        effects: { attack: 10, defense: 10, basicSkillDamage: 5 },
                        duration: 'infinite',
                        note: 'A3: +1% ATK/DEF + +0.5% Basic Skill DMG per stack ×10 = +10% ATK, +10% DEF, +5% Basic (all allies)'
                    },
                    {
                        name: "[Wind's Touch] Wind Bonus",
                        trigger: '[Wind] activation (stacking)',
                        scope: 'team-wind',
                        effects: { attack: 10, defense: 10, basicSkillDamage: 5 },
                        duration: 'infinite',
                        note: 'A3: Additional +10% ATK, +10% DEF, +5% Basic Skill DMG for Wind members (×10 stacks). Total Wind: +20% ATK/DEF, +10% Basic.'
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: '[Unrecoverable]',
                        trigger: 'ally Ultimate Skill hit (via Wings of Freedom)',
                        scope: 'enemy',
                        effects: { antiHeal: true },
                        duration: 30,
                        note: 'A2: Target cannot recover HP (30s)'
                    }
                ],
            },
            // A4: +5% Wind DMG per Wind ally for Wind team members (×3 = +15%)
            A4: {
                passives: [
                    {
                        name: 'Wind Ally Synergy (A4)',
                        description: 'For every Wind ally, Wind team members\' Wind damage increases by 5%. (×3 Wind = +15%)',
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: DEF Boost',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { defense: 10 },
                        duration: 'infinite',
                        note: 'A4 weapon: +10% DEF (self)'
                    },
                    {
                        name: '[Wind] Skill DMG',
                        trigger: 'skill use (stacking)',
                        scope: 'self',
                        effects: { skillDamage: 50 },
                        duration: 60,
                        note: 'A0: [Wind] effect +50% skill DMG (self, 60s, ×3 stacks)'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Weapon: Basic Skill DMG',
                        trigger: 'Reverse Tempest Cleave / Umbrella',
                        scope: 'team',
                        effects: { basicSkillDamage: 1.7 },
                        duration: 30,
                        note: 'A4 weapon: +1.7% Basic Skill DMG for team (30s)'
                    },
                    {
                        name: '[Wings of Freedom] Enhanced',
                        trigger: 'ally consumes [Gale Wings]',
                        scope: 'team',
                        effects: { basicSkillDamage: 20, ultimateSkillDamage: 20, windDamage: 10 },
                        duration: 10,
                        note: 'A1+: +20% Basic/Ulti Skill DMG + +10% Wind DMG for allies (10s)'
                    },
                    {
                        name: "[Wind's Touch] (all allies)",
                        trigger: '[Wind] activation (stacking)',
                        scope: 'team',
                        effects: { attack: 10, defense: 10, basicSkillDamage: 5 },
                        duration: 'infinite',
                        note: 'A3: +10% ATK, +10% DEF, +5% Basic (all allies, ×10 stacks)'
                    },
                    {
                        name: "[Wind's Touch] Wind Bonus",
                        trigger: '[Wind] activation (stacking)',
                        scope: 'team-wind',
                        effects: { attack: 10, defense: 10, basicSkillDamage: 5 },
                        duration: 'infinite',
                        note: 'A3: Additional +10% ATK/DEF, +5% Basic for Wind members'
                    },
                    {
                        name: 'Wind Ally Synergy',
                        trigger: 'permanent (per Wind ally)',
                        scope: 'team-wind',
                        effects: { windDamage: 15 },
                        duration: 'infinite',
                        note: 'A4: +5% Wind DMG per Wind ally ×3 = +15% Wind DMG for Wind members'
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: '[Unrecoverable]',
                        trigger: 'ally Ultimate Skill hit (via Wings of Freedom)',
                        scope: 'enemy',
                        effects: { antiHeal: true },
                        duration: 30,
                        note: 'A2: Target cannot recover HP (30s)'
                    }
                ],
            },
            // A5: [Aero] +2% Wind DMG ×5 = +10% Wind DMG (team), [Serenade] 300% burst
            A5: {
                passives: [
                    {
                        name: "Jinah's Weapon - Basic Skill DMG for Team (A5)",
                        description: 'Using Reverse Tempest Cleave or Umbrella: Reverse Tempest Cleave increases team Basic Skill damage by 2%.',
                        mechanic: 'weapon',
                        duration: 30
                    },
                    {
                        name: '[Aero] Effect (A5)',
                        description: 'Using Aero Disruption or Serenade: Aero Disruption grants [Aero] to entire team: +2% Wind DMG per stack, ×5 = +10% Wind DMG (60s). Tag-out also grants 1 stack.',
                        mechanic: 'conditional'
                    },
                    {
                        name: '[Serenade: Aero Disruption] (A5)',
                        description: 'Deals 300% of Stormwind Serenade damage. Reduces Stormwind Serenade CD by 60%. Reactivates [Sudden Showers].',
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: DEF Boost',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { defense: 12 },
                        duration: 'infinite',
                        note: 'A5 weapon: +12% DEF (self)'
                    },
                    {
                        name: '[Wind] Skill DMG',
                        trigger: 'skill use (stacking)',
                        scope: 'self',
                        effects: { skillDamage: 50 },
                        duration: 60,
                        note: 'A0: [Wind] effect +50% skill DMG (self, 60s, ×3 stacks)'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Weapon: Basic Skill DMG',
                        trigger: 'Reverse Tempest Cleave / Umbrella',
                        scope: 'team',
                        effects: { basicSkillDamage: 2.0 },
                        duration: 30,
                        note: 'A5 weapon: +2.0% Basic Skill DMG for team (30s)'
                    },
                    {
                        name: '[Wings of Freedom] Enhanced',
                        trigger: 'ally consumes [Gale Wings]',
                        scope: 'team',
                        effects: { basicSkillDamage: 20, ultimateSkillDamage: 20, windDamage: 10 },
                        duration: 10,
                        note: 'A1+: +20% Basic/Ulti Skill DMG + +10% Wind DMG for allies (10s)'
                    },
                    {
                        name: "[Wind's Touch] (all allies)",
                        trigger: '[Wind] activation (stacking)',
                        scope: 'team',
                        effects: { attack: 10, defense: 10, basicSkillDamage: 5 },
                        duration: 'infinite',
                        note: 'A3: +10% ATK, +10% DEF, +5% Basic (all allies, ×10 stacks)'
                    },
                    {
                        name: "[Wind's Touch] Wind Bonus",
                        trigger: '[Wind] activation (stacking)',
                        scope: 'team-wind',
                        effects: { attack: 10, defense: 10, basicSkillDamage: 5 },
                        duration: 'infinite',
                        note: 'A3: Additional +10% ATK/DEF, +5% Basic for Wind members'
                    },
                    {
                        name: 'Wind Ally Synergy',
                        trigger: 'permanent (per Wind ally)',
                        scope: 'team-wind',
                        effects: { windDamage: 15 },
                        duration: 'infinite',
                        note: 'A4: +5% Wind DMG per Wind ally ×3 = +15% Wind DMG for Wind members'
                    },
                    {
                        name: '[Aero]',
                        trigger: 'Aero Disruption / Serenade / tag-out',
                        scope: 'team',
                        effects: { windDamage: 10 },
                        duration: 60,
                        note: 'A5: +2% Wind DMG per stack ×5 = +10% Wind DMG for entire team (60s)'
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: '[Unrecoverable]',
                        trigger: 'ally Ultimate Skill hit (via Wings of Freedom)',
                        scope: 'enemy',
                        effects: { antiHeal: true },
                        duration: 30,
                        note: 'A2: Target cannot recover HP (30s)'
                    }
                ],
            },
        }
    },

    // 🌪️ PARK BEOM-SHIK - Wind Fighter (DEF scaling)
    // Arme A0: +2% DEF (self) + [Father's Determination] → Shield 2% DEF + +10% Basic Skill DMG (self)
    // A0: [Father of Two] +4% DEF ×10 = +40% (self, 30s). [Father's Determination] HP≤30% → +8% ATK Speed/DEF
    // A1: +15% DMG vs lower HP targets (self)
    // A2: +6% DEF (self)
    // A3: Downward Strike +60% DMG (self)
    // A4: +10% HP (self)
    // A5: Another Worldline → [Father's Determination] without HP condition
    // ZERO team buffs
    // ═══════════════════════════════════════════════════════════════
    'park-beom': {
        id: 'park-beom',
        name: 'Park Beom-Shik',
        class: 'Fighter',
        element: 'Wind',
        scaleStat: 'DEF',
        primaryRole: 'Tank',
        secondaryRole: 'DPS',
        tags: ['DEF Scaler', 'Tank', 'Self Buffer'],

        advancements: {
            A0: {
                passives: [
                    {
                        name: "Beom-Shik's Weapon - DEF + Basic Skill",
                        description: '+2% DEF (self). [Father\'s Determination] → Shield 2% DEF + +10% Basic Skill DMG (self).',
                        mechanic: 'weapon'
                    },
                    {
                        name: '[Father of Two]',
                        description: 'Skills → +4% DEF per stack ×10 = +40% DEF (self, 30s).',
                        mechanic: 'conditional'
                    },
                    {
                        name: "[Father's Determination]",
                        description: 'HP ≤ 30% → Spinning Strike infinite + Super Armor + +8% ATK Speed + +8% DEF (self, 4s, once).',
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: DEF Boost',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { defense: 2 },
                        duration: 'infinite',
                        note: 'A0 weapon: +2% DEF (self)'
                    },
                    {
                        name: '[Father of Two]',
                        trigger: 'skill use (stacking)',
                        scope: 'self',
                        effects: { defense: 40 },
                        duration: 30,
                        note: 'A0: +4% DEF per stack ×10 = +40% DEF (self, 30s)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
            A1: {
                passives: [
                    {
                        name: 'Execute DMG (A1)',
                        description: 'Damage dealt to targets with HP lower than the user\'s increases by 15%.',
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: DEF Boost',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { defense: 4 },
                        duration: 'infinite',
                        note: 'A1 weapon: +4% DEF (self)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
            A2: {
                passives: [
                    {
                        name: 'DEF Increase (A2)',
                        description: "Increases the user's Defense by 6%.",
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: DEF Boost',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { defense: 6 },
                        duration: 'infinite',
                        note: 'A2 weapon: +6% DEF (self)'
                    },
                    {
                        name: 'A2 DEF Boost',
                        trigger: 'permanent',
                        scope: 'self',
                        effects: { defense: 6 },
                        duration: 'infinite',
                        note: 'A2: +6% DEF (self, permanent)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
            A3: {
                passives: [
                    {
                        name: 'Downward Strike Enhanced (A3)',
                        description: 'Downward Strike: charge -30%, range +30%, +60% DMG.',
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: DEF Boost',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { defense: 8 },
                        duration: 'infinite',
                        note: 'A3 weapon: +8% DEF (self)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
            A4: {
                passives: [
                    {
                        name: 'HP Increase (A4)',
                        description: "The user's HP increases by 10%.",
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: DEF Boost',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { defense: 10 },
                        duration: 'infinite',
                        note: 'A4 weapon: +10% DEF (self)'
                    },
                    {
                        name: 'A4 HP Boost',
                        trigger: 'permanent',
                        scope: 'self',
                        effects: { hp: 10 },
                        duration: 'infinite',
                        note: 'A4: +10% HP (self, permanent)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
            A5: {
                passives: [
                    {
                        name: "Father's Determination Unconditional (A5)",
                        description: "Another Worldline now applies [Father's Determination] without HP condition.",
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: DEF Boost',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { defense: 12 },
                        duration: 'infinite',
                        note: 'A5 weapon: +12% DEF (self)'
                    },
                    {
                        name: '[Father of Two]',
                        trigger: 'skill use (stacking)',
                        scope: 'self',
                        effects: { defense: 40 },
                        duration: 30,
                        note: 'A0: +40% DEF (self, ×10 stacks)'
                    },
                    {
                        name: 'A2 DEF Boost',
                        trigger: 'permanent',
                        scope: 'self',
                        effects: { defense: 6 },
                        duration: 'infinite',
                        note: 'A2: +6% DEF (self)'
                    },
                    {
                        name: 'A4 HP Boost',
                        trigger: 'permanent',
                        scope: 'self',
                        effects: { hp: 10 },
                        duration: 'infinite',
                        note: 'A4: +10% HP (self)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
        }
    },

    // 🌪️ PARK HEEJIN - Wind Mage (ATK scaling)
    // Arme A0: +5% Ultimate Skill DMG (self) + Ulti → +5% Ulti Skill DMG for highest TP ally (20s)
    // A0: Power Gauge +8% on skills, Wind Storm CD -30%
    // A1: Air Cutter removes debuffs (utility)
    // A2: Wind Storm CD -10%
    // A3: Skills → team Power Gauge +10% (utility)
    // A4: Wind Storm +30% DMG (self)
    // A5: Battle start → Power Gauge 100%
    // Minimal team contribution — mostly utility/QoL
    // ═══════════════════════════════════════════════════════════════
    'park-heejin': {
        id: 'park-heejin',
        name: 'Park Heejin',
        class: 'Mage',
        element: 'Wind',
        scaleStat: 'ATK',
        primaryRole: 'DPS',
        secondaryRole: 'Support',
        tags: ['ATK Scaler', 'Mage', 'Utility'],

        advancements: {
            A0: {
                passives: [
                    {
                        name: "Heejin's Weapon - Ultimate Skill Synergy",
                        description: '+5% Ultimate Skill DMG (self). On Ulti use: +5% Ulti Skill DMG for highest Total Power ally (20s).',
                        mechanic: 'weapon'
                    },
                    {
                        name: 'Power Gauge Recovery',
                        description: 'Skills recover Power Gauge by 8%. Wind Storm CD -30%.',
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: Ultimate Skill DMG',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { ultimateSkillDamage: 5 },
                        duration: 'infinite',
                        note: 'A0 weapon: +5% Ultimate Skill DMG (self)'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Weapon: Ulti Skill DMG for Ally',
                        trigger: 'Ultimate Skill use',
                        scope: 'team',
                        effects: { ultimateSkillDamage: 5 },
                        duration: 20,
                        note: 'A0 weapon: +5% Ulti Skill DMG for highest TP ally (20s)'
                    }
                ],
                raidBuffs: [],
                debuffs: [],
            },
            A1: {
                passives: [
                    {
                        name: 'Debuff Cleanse (A1)',
                        description: 'Air Cutter removes [debuffs] from Heejin and her party.',
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: Ultimate Skill DMG',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { ultimateSkillDamage: 10 },
                        duration: 'infinite',
                        note: 'A1 weapon: +10% Ultimate Skill DMG (self)'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Weapon: Ulti Skill DMG for Ally',
                        trigger: 'Ultimate Skill use',
                        scope: 'team',
                        effects: { ultimateSkillDamage: 10 },
                        duration: 20,
                        note: 'A1 weapon: +10% Ulti Skill DMG for highest TP ally (20s)'
                    }
                ],
                raidBuffs: [],
                debuffs: [],
            },
            A2: {
                passives: [
                    {
                        name: 'Wind Storm CD Reduction (A2)',
                        description: 'Wind Storm cooldown decreases by 10%.',
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: Ultimate Skill DMG',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { ultimateSkillDamage: 15 },
                        duration: 'infinite',
                        note: 'A2 weapon: +15% Ultimate Skill DMG (self)'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Weapon: Ulti Skill DMG for Ally',
                        trigger: 'Ultimate Skill use',
                        scope: 'team',
                        effects: { ultimateSkillDamage: 15 },
                        duration: 20,
                        note: 'A2 weapon: +15% Ulti Skill DMG for highest TP ally (20s)'
                    }
                ],
                raidBuffs: [],
                debuffs: [],
            },
            A3: {
                passives: [
                    {
                        name: 'Team Power Gauge (A3)',
                        description: 'When Heejin uses skills, team Power Gauges refill by 10%.',
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: Ultimate Skill DMG',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { ultimateSkillDamage: 20 },
                        duration: 'infinite',
                        note: 'A3 weapon: +20% Ultimate Skill DMG (self)'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Weapon: Ulti Skill DMG for Ally',
                        trigger: 'Ultimate Skill use',
                        scope: 'team',
                        effects: { ultimateSkillDamage: 20 },
                        duration: 20,
                        note: 'A3 weapon: +20% Ulti Skill DMG for highest TP ally (20s)'
                    }
                ],
                raidBuffs: [],
                debuffs: [],
            },
            A4: {
                passives: [
                    {
                        name: 'Wind Storm DMG (A4)',
                        description: 'Wind Storm damage increases by 30%.',
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: Ultimate Skill DMG',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { ultimateSkillDamage: 25 },
                        duration: 'infinite',
                        note: 'A4 weapon: +25% Ultimate Skill DMG (self)'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Weapon: Ulti Skill DMG for Ally',
                        trigger: 'Ultimate Skill use',
                        scope: 'team',
                        effects: { ultimateSkillDamage: 25 },
                        duration: 20,
                        note: 'A4 weapon: +25% Ulti Skill DMG for highest TP ally (20s)'
                    }
                ],
                raidBuffs: [],
                debuffs: [],
            },
            A5: {
                passives: [
                    {
                        name: 'Instant Ultimate (A5)',
                        description: 'Battle start → Power Gauge refills by 100%.',
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: Ultimate Skill DMG',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { ultimateSkillDamage: 30 },
                        duration: 'infinite',
                        note: 'A5 weapon: +30% Ultimate Skill DMG (self)'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Weapon: Ulti Skill DMG for Ally',
                        trigger: 'Ultimate Skill use',
                        scope: 'team',
                        effects: { ultimateSkillDamage: 30 },
                        duration: 20,
                        note: 'A5 weapon: +30% Ulti Skill DMG for highest TP ally (20s)'
                    }
                ],
                raidBuffs: [],
                debuffs: [],
            },
        }
    },

    // 🌪️ HWANG DONGSOO - Wind Fighter (DEF scaling)
    // Arme A0: +4% Wind DMG (self) + +3% Basic Skill DMG ×4 on Impulse/Madness (self)
    // A0: [Impulse] +15% DEF (self), [Impulsive Revenge] +24% DEF (self, 10s)
    // A1: Greed Scavenger Tier 2 +150% DMG (self)
    // A2: +8% DEF (self)
    // A3: [Madness] +12% DEF + +12% DefPen (self, 6s)
    // A4: Merciless +40% DMG (self)
    // A5: Merciless +80% DMG during Impulsive Revenge (self)
    // ZERO team buffs — entirely self-contained kit
    // ═══════════════════════════════════════════════════════════════
    hwang: {
        id: 'hwang',
        name: 'Hwang Dongsoo',
        class: 'Fighter',
        element: 'Wind',
        scaleStat: 'DEF',
        primaryRole: 'Tank',
        secondaryRole: 'DPS',
        tags: ['DEF Scaler', 'Tank', 'Self Buffer'],

        advancements: {
            A0: {
                passives: [
                    {
                        name: "Hwang's Weapon - Wind DMG + Basic Skill",
                        description: '+4% Wind DMG (self). +3% Basic Skill DMG per [Impulse/Madness] activation ×4 = +12% (self).',
                        mechanic: 'weapon'
                    },
                    {
                        name: '[Impulse] → [Impulsive Revenge]',
                        description: 'Hit/skills → [Impulse]: +3% DEF ×5 = +15% (infinite). At 5 stacks → [Impulsive Revenge]: +24% DEF + Shield 12% DEF + Greed Scavenger ×2 DMG (10s).',
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: Wind DMG',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { windDamage: 4 },
                        duration: 'infinite',
                        note: 'A0 weapon: +4% Wind DMG (self)'
                    },
                    {
                        name: '[Impulse] DEF Stacking',
                        trigger: 'hit / skill use',
                        scope: 'self',
                        effects: { defense: 15 },
                        duration: 'infinite',
                        note: 'A0: +3% DEF per stack ×5 = +15% DEF (self, infinite)'
                    },
                    {
                        name: '[Impulsive Revenge]',
                        trigger: '[Impulse] 5 stacks',
                        scope: 'self',
                        effects: { defense: 24 },
                        duration: 10,
                        note: 'A0: +24% DEF + Shield (10s). Greed Scavenger ×2 DMG.'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
            A1: {
                passives: [
                    {
                        name: 'Greed Scavenger Tier 2 (A1)',
                        description: 'Greed Scavenger charges to Tier 2 (+150% DMG). [Super Armor] while charging.',
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: Wind DMG',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { windDamage: 8 },
                        duration: 'infinite',
                        note: 'A1 weapon: +8% Wind DMG (self)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
            A2: {
                passives: [
                    {
                        name: 'DEF Increase (A2)',
                        description: "Increases the user's Defense by 8%.",
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: Wind DMG',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { windDamage: 12 },
                        duration: 'infinite',
                        note: 'A2 weapon: +12% Wind DMG (self)'
                    },
                    {
                        name: 'A2 DEF Boost',
                        trigger: 'permanent',
                        scope: 'self',
                        effects: { defense: 8 },
                        duration: 'infinite',
                        note: 'A2: +8% DEF (self, permanent)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
            A3: {
                passives: [
                    {
                        name: '[Madness] (A3)',
                        description: 'Urge to Kill / Greed Scavenger → [Madness]: +4% DEF + +4% DefPen per stack ×3 = +12% each (6s).',
                        mechanic: 'conditional',
                        duration: 6
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: Wind DMG',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { windDamage: 16 },
                        duration: 'infinite',
                        note: 'A3 weapon: +16% Wind DMG (self)'
                    },
                    {
                        name: '[Madness]',
                        trigger: 'Urge to Kill / Greed Scavenger',
                        scope: 'self',
                        effects: { defense: 12, defPen: 12 },
                        duration: 6,
                        note: 'A3: +4% DEF + +4% DefPen ×3 = +12%/+12% (self, 6s)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
            A4: {
                passives: [
                    {
                        name: 'Merciless DMG (A4)',
                        description: "Increases Merciless damage by 40%.",
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: Wind DMG',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { windDamage: 20 },
                        duration: 'infinite',
                        note: 'A4 weapon: +20% Wind DMG (self)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
            A5: {
                passives: [
                    {
                        name: 'Merciless Enhanced (A5)',
                        description: "Merciless damage increases by 80% while [Impulsive Revenge] is active.",
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: Wind DMG',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { windDamage: 24 },
                        duration: 'infinite',
                        note: 'A5 weapon: +24% Wind DMG (self)'
                    },
                    {
                        name: 'A2 DEF Boost',
                        trigger: 'permanent',
                        scope: 'self',
                        effects: { defense: 8 },
                        duration: 'infinite',
                        note: 'A2: +8% DEF (self)'
                    },
                    {
                        name: '[Impulse] DEF Stacking',
                        trigger: 'hit / skill use',
                        scope: 'self',
                        effects: { defense: 15 },
                        duration: 'infinite',
                        note: 'A0: +15% DEF (self, ×5 stacks)'
                    },
                    {
                        name: '[Madness]',
                        trigger: 'Urge to Kill / Greed Scavenger',
                        scope: 'self',
                        effects: { defense: 12, defPen: 12 },
                        duration: 6,
                        note: 'A3: +12% DEF + +12% DefPen (self, 6s)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
        }
    },

    // 🌪️ KIM SANGSHIK - Wind Fighter (HP scaling)
    // Arme: +Core Attack DMG +4% (self) + Core → next Basic +4% (self). A0 values.
    // A0-A5: Entire kit is self-only. No team buffs whatsoever.
    // A2: +10% HP (self). A4: +6% DEF (self). A3: Break effectiveness +20%.
    // ═══════════════════════════════════════════════════════════════
    'kim-sangshik': {
        id: 'kim-sangshik',
        name: 'Kim Sangshik',
        class: 'Fighter',
        element: 'Wind',
        scaleStat: 'HP',
        primaryRole: 'DPS',
        secondaryRole: 'Tank',
        tags: ['HP Scaler', 'Self Buffer', 'Break Specialist'],

        advancements: {
            A0: {
                passives: [
                    {
                        name: "Kim's Weapon - Core/Basic Synergy",
                        description: '+4% Core Attack DMG. Core Attack → next Basic Skill +4% DMG (self).',
                        mechanic: 'weapon'
                    },
                    {
                        name: 'Skill CD Cross-Reduction',
                        description: 'Storm Split/Swift Shock/Gale Gouge reduce each other\'s CD by 1s + Core Gauge +50%.',
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
            A1: {
                passives: [
                    {
                        name: 'Enhanced CD Reduction (A1)',
                        description: 'Skills CD reduction changes to 2s. Storm Split/Swift Shock auto-activates Gale Gouge.',
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
            A2: {
                passives: [
                    {
                        name: 'HP Increase (A2)',
                        description: "The user's HP increases by 10%.",
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'A2 HP Boost',
                        trigger: 'permanent',
                        scope: 'self',
                        effects: { hp: 10 },
                        duration: 'infinite',
                        note: 'A2: +10% HP (self, permanent)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
            A3: {
                passives: [
                    {
                        name: 'Break Effectiveness (A3)',
                        description: "[Break] effectiveness increases by 20%.",
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
            A4: {
                passives: [
                    {
                        name: 'DEF Increase (A4)',
                        description: "Increases the user's Defense by 6%.",
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'A4 DEF Boost',
                        trigger: 'permanent',
                        scope: 'self',
                        effects: { defense: 6 },
                        duration: 'infinite',
                        note: 'A4: +6% DEF (self, permanent)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
            A5: {
                passives: [
                    {
                        name: 'Gale Gouge MP Recovery (A5)',
                        description: 'Gale Gouge recovers 60 MP.',
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'A2 HP Boost',
                        trigger: 'permanent',
                        scope: 'self',
                        effects: { hp: 10 },
                        duration: 'infinite',
                        note: 'A2: +10% HP (self)'
                    },
                    {
                        name: 'A4 DEF Boost',
                        trigger: 'permanent',
                        scope: 'self',
                        effects: { defense: 6 },
                        duration: 'infinite',
                        note: 'A4: +6% DEF (self)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [],
            },
        }
    },

    // 🌪️ WOO JINCHUL - Wind Fighter (ATK scaling)
    // Arme A3: 3.5% DefPen (self) + Mediation: +14% DMG taken debuff (×3=42%) + Break: +7% Wind DMG team
    // A0: Dash → +30% skill DMG (self, 6s)
    // A1: Mediation enhanced +100% Break effect (self)
    // A2: +10% DefPen (self)
    // A3: Judgment → +35% DMG increase (self, 7s), CD reductions
    // A4: +16% Wind DMG (self)
    // A5: Mediation → +5% DEF ×12 = +60% DEF (self)
    // ═══════════════════════════════════════════════════════════════
    woo: {
        id: 'woo',
        name: 'Woo Jinchul',
        class: 'Fighter',
        element: 'Wind',
        scaleStat: 'ATK',
        primaryRole: 'DPS',
        secondaryRole: 'Tank',
        tags: ['ATK Scaler', 'DPS', 'Self Buffer', 'Break Specialist'],

        advancements: {
            // A0: Dash → +30% skill DMG (self, 6s) + Super Armor
            A0: {
                passives: [
                    {
                        name: "Woo's Weapon - DefPen + Mediation Debuff",
                        description: 'Attacks ignore 1.0% of target\'s Defense. Mediation of Power increases damage dealt to target by 4% (5s, ×3). On enemy [Break]: +2% Wind DMG for team (excl. user, infinite).',
                        mechanic: 'weapon'
                    },
                    {
                        name: 'Dash Skill Boost',
                        description: 'Using Dash increases damage of Suppress, Mediation of Power, and Iron Fist by 30% for 6s and grants [Super Armor]. Dash CD -1s.',
                        mechanic: 'conditional',
                        duration: 6
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: DefPen',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { defPen: 1.0 },
                        duration: 'infinite',
                        note: 'A0 weapon: +1.0% DefPen (self)'
                    },
                    {
                        name: 'Dash Skill DMG Boost',
                        trigger: 'Dash',
                        scope: 'self',
                        effects: { skillDamage: 30 },
                        duration: 6,
                        note: 'A0: +30% DMG on Suppress/Mediation/Iron Fist after Dash (6s)'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Weapon: Break Wind DMG',
                        trigger: 'enemy enters [Break]',
                        scope: 'team',
                        effects: { windDamage: 2 },
                        duration: 'infinite',
                        note: 'A0 weapon: +2% Wind DMG for team (excl. user) on enemy Break (infinite)'
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Weapon: Mediation Debuff',
                        trigger: 'Mediation of Power',
                        scope: 'enemy',
                        effects: { damageTaken: 12 },
                        duration: 5,
                        note: 'A0 weapon: +4% DMG taken per stack ×3 = +12% on enemy (5s)'
                    }
                ],
            },
            // A1: Mediation enhanced +100% Break effect (self)
            A1: {
                passives: [
                    {
                        name: 'Mediation of Power Enhanced (A1)',
                        description: 'Mediation of Power increases [Break] effect and damage by 100%. Can be used up to 3 times.',
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: DefPen',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { defPen: 1.8 },
                        duration: 'infinite',
                        note: 'A1 weapon: +1.8% DefPen (self)'
                    },
                    {
                        name: 'Dash Skill DMG Boost',
                        trigger: 'Dash',
                        scope: 'self',
                        effects: { skillDamage: 30 },
                        duration: 6,
                        note: 'A0: +30% skill DMG after Dash (6s)'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Weapon: Break Wind DMG',
                        trigger: 'enemy enters [Break]',
                        scope: 'team',
                        effects: { windDamage: 3.5 },
                        duration: 'infinite',
                        note: 'A1 weapon: +3.5% Wind DMG for team on Break (infinite)'
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Weapon: Mediation Debuff',
                        trigger: 'Mediation of Power',
                        scope: 'enemy',
                        effects: { damageTaken: 21 },
                        duration: 5,
                        note: 'A1 weapon: +7% DMG taken ×3 = +21% on enemy (5s)'
                    }
                ],
            },
            // A2: +10% DefPen (self, permanent)
            A2: {
                passives: [
                    {
                        name: 'Defense Penetration (A2)',
                        description: "The user's Defense Penetration increases by 10%.",
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: DefPen',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { defPen: 2.6 },
                        duration: 'infinite',
                        note: 'A2 weapon: +2.6% DefPen (self)'
                    },
                    {
                        name: 'A2 DefPen Boost',
                        trigger: 'permanent',
                        scope: 'self',
                        effects: { defPen: 10 },
                        duration: 'infinite',
                        note: 'A2: +10% DefPen (self, permanent)'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Weapon: Break Wind DMG',
                        trigger: 'enemy enters [Break]',
                        scope: 'team',
                        effects: { windDamage: 5 },
                        duration: 'infinite',
                        note: 'A2 weapon: +5% Wind DMG for team on Break (infinite)'
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Weapon: Mediation Debuff',
                        trigger: 'Mediation of Power',
                        scope: 'enemy',
                        effects: { damageTaken: 30 },
                        duration: 5,
                        note: 'A2 weapon: +10% DMG taken ×3 = +30% on enemy (5s)'
                    }
                ],
            },
            // A3: Judgment → +35% DMG (self, 7s), CD reductions
            A3: {
                passives: [
                    {
                        name: 'Enhanced Dash Passive (A3)',
                        description: 'Dash/Extreme Evasion/Judgment reduces CD of Mediation & Iron Fist by 2s + activates Core Attack. Judgment activates Basic Passive enhanced: +35% DMG (7s).',
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: DefPen',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { defPen: 3.5 },
                        duration: 'infinite',
                        note: 'A3 weapon: +3.5% DefPen (self)'
                    },
                    {
                        name: 'Judgment DMG Boost',
                        trigger: 'Judgment',
                        scope: 'self',
                        effects: { damageIncrease: 35 },
                        duration: 7,
                        note: 'A3: +35% DMG increase after Judgment (7s, enhanced from A0 30%/6s)'
                    },
                    {
                        name: 'A2 DefPen Boost',
                        trigger: 'permanent',
                        scope: 'self',
                        effects: { defPen: 10 },
                        duration: 'infinite',
                        note: 'A2: +10% DefPen (self)'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Weapon: Break Wind DMG',
                        trigger: 'enemy enters [Break]',
                        scope: 'team',
                        effects: { windDamage: 7 },
                        duration: 'infinite',
                        note: 'A3 weapon: +7% Wind DMG for team on Break (infinite)'
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Weapon: Mediation Debuff',
                        trigger: 'Mediation of Power',
                        scope: 'enemy',
                        effects: { damageTaken: 42 },
                        duration: 5,
                        note: 'A3 weapon: +14% DMG taken ×3 = +42% on enemy (5s)'
                    }
                ],
            },
            // A4: +16% Wind DMG (self, permanent)
            A4: {
                passives: [
                    {
                        name: 'Wind DMG Boost (A4)',
                        description: "The user's Wind damage increases by 16%.",
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: DefPen',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { defPen: 4.2 },
                        duration: 'infinite',
                        note: 'A4 weapon: +4.2% DefPen (self)'
                    },
                    {
                        name: 'A2 DefPen Boost',
                        trigger: 'permanent',
                        scope: 'self',
                        effects: { defPen: 10 },
                        duration: 'infinite',
                        note: 'A2: +10% DefPen (self)'
                    },
                    {
                        name: 'A4 Wind DMG',
                        trigger: 'permanent',
                        scope: 'self',
                        effects: { windDamage: 16 },
                        duration: 'infinite',
                        note: 'A4: +16% Wind DMG (self, permanent)'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Weapon: Break Wind DMG',
                        trigger: 'enemy enters [Break]',
                        scope: 'team',
                        effects: { windDamage: 8.5 },
                        duration: 'infinite',
                        note: 'A4 weapon: +8.5% Wind DMG for team on Break (infinite)'
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Weapon: Mediation Debuff',
                        trigger: 'Mediation of Power',
                        scope: 'enemy',
                        effects: { damageTaken: 54 },
                        duration: 5,
                        note: 'A4 weapon: +18% DMG taken ×3 = +54% on enemy (5s)'
                    }
                ],
            },
            // A5: Mediation → +5% DEF ×12 = +60% DEF (self), Basic Attack ×4 → Tier 3 Passive
            A5: {
                passives: [
                    {
                        name: 'Tier 3 Passive (A5)',
                        description: 'Basic Attack ×4 activates [Tier 3 Passive].',
                        mechanic: 'conditional'
                    },
                    {
                        name: 'Mediation DEF Stacking (A5)',
                        description: 'Mediation of Power increases DEF by 5% per stack (×12 = +60% DEF).',
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: DefPen',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { defPen: 5.0 },
                        duration: 'infinite',
                        note: 'A5 weapon: +5.0% DefPen (self)'
                    },
                    {
                        name: 'A2 DefPen Boost',
                        trigger: 'permanent',
                        scope: 'self',
                        effects: { defPen: 10 },
                        duration: 'infinite',
                        note: 'A2: +10% DefPen (self)'
                    },
                    {
                        name: 'A4 Wind DMG',
                        trigger: 'permanent',
                        scope: 'self',
                        effects: { windDamage: 16 },
                        duration: 'infinite',
                        note: 'A4: +16% Wind DMG (self)'
                    },
                    {
                        name: 'Judgment DMG Boost',
                        trigger: 'Judgment',
                        scope: 'self',
                        effects: { damageIncrease: 35 },
                        duration: 7,
                        note: 'A3: +35% DMG increase after Judgment (7s)'
                    },
                    {
                        name: 'Mediation DEF Stacking',
                        trigger: 'Mediation of Power',
                        scope: 'self',
                        effects: { defense: 60 },
                        duration: 'infinite',
                        note: 'A5: +5% DEF per Mediation stack ×12 = +60% DEF (self)'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Weapon: Break Wind DMG',
                        trigger: 'enemy enters [Break]',
                        scope: 'team',
                        effects: { windDamage: 10 },
                        duration: 'infinite',
                        note: 'A5 weapon: +10% Wind DMG for team on enemy Break (excl. user, infinite)'
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Weapon: Mediation Debuff',
                        trigger: 'Mediation of Power',
                        scope: 'enemy',
                        effects: { damageTaken: 66 },
                        duration: 5,
                        note: 'A5 weapon: +22% DMG taken ×3 = +66% on enemy (5s)'
                    }
                ],
            },
        }
    },

    // 🌪️ HAN SE-MI - Wind Healer/Support (HP scaling)
    // Arme: +HP% (self) + +X% damage taken debuff on enemy (10s)
    // A0: [Breath] +10% Basic Skill DMG (self ×2=+20%), +5% Basic Skill DMG Wind team (×2=+10%)
    // A1: [Sharp Breath] +10% CritRate + +10% CritDMG (team, 20s, on Ulti use)
    // A2: +10% HP (self)
    // A3: [Immortal] survival (no DMG%)
    // A4: +10% Wind DMG (entire team, permanent)
    // A5: [Natural Unity] +10% ATK, +10% DEF, +20% Wind DMG (team, 25s)
    // ═══════════════════════════════════════════════════════════════
    han: {
        id: 'han',
        name: 'Han Se-Mi',
        class: 'Healer',
        element: 'Wind',
        scaleStat: 'HP',
        primaryRole: 'Healer',
        secondaryRole: 'Support',
        tags: ['HP Scaler', 'Healer', 'Team Buffer', 'Wind Synergy'],

        advancements: {
            // A0: [Breath] +20% Basic Skill DMG (self), +10% Basic Skill DMG (team-wind)
            A0: {
                passives: [
                    {
                        name: "Han Se-Mi's Weapon - Enemy Debuff",
                        description: 'Targets hit by Han Se-Mi\'s skills take 0.8% more damage (10s).',
                        mechanic: 'weapon',
                        duration: 10
                    },
                    {
                        name: '[Breath]',
                        description: 'Using Sharp Sprouts, Golden Meadow or Vines of Vitality grants [Breath] to team (CD 15s): +10% Basic Skill DMG (self), +5% Basic Skill DMG (Wind team). 25s, ×2 stacks.',
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: HP Boost',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { hp: 2 },
                        duration: 'infinite',
                        note: 'A0 weapon: +2% HP (self)'
                    },
                    {
                        name: '[Breath] Self',
                        trigger: 'Sharp Sprouts / Golden Meadow / Vines of Vitality',
                        scope: 'self',
                        effects: { basicSkillDamage: 20 },
                        duration: 25,
                        note: 'A0: +10% Basic Skill DMG per stack ×2 = +20% (self, 25s)'
                    }
                ],
                teamBuffs: [
                    {
                        name: '[Breath] Wind Team',
                        trigger: 'Sharp Sprouts / Golden Meadow / Vines of Vitality',
                        scope: 'team-wind',
                        effects: { basicSkillDamage: 10 },
                        duration: 25,
                        note: 'A0: +5% Basic Skill DMG per stack ×2 = +10% for Wind team members (25s)'
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Weapon: Damage Taken Debuff',
                        trigger: 'skill hit',
                        scope: 'enemy',
                        effects: { damageTaken: 0.8 },
                        duration: 10,
                        note: 'A0 weapon: +0.8% damage taken on enemy (10s)'
                    }
                ],
            },
            // A1: [Sharp Breath] +10% CritRate + +10% CritDMG (team, 20s)
            A1: {
                passives: [
                    {
                        name: '[Sharp Breath] (A1)',
                        description: 'When allies use their Ultimate Skill, they receive [Sharp Breath]: +1% CritRate/s + +1% CritDMG/s (max 10% each) + 1% Power Gauge/s. Duration 20s.',
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: HP Boost',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { hp: 4 },
                        duration: 'infinite',
                        note: 'A1 weapon: +4% HP (self)'
                    },
                    {
                        name: '[Breath] Self',
                        trigger: 'Sharp Sprouts / Golden Meadow / Vines of Vitality',
                        scope: 'self',
                        effects: { basicSkillDamage: 20 },
                        duration: 25,
                        note: 'A0: +20% Basic Skill DMG (self, 25s, ×2 stacks)'
                    }
                ],
                teamBuffs: [
                    {
                        name: '[Breath] Wind Team',
                        trigger: 'Sharp Sprouts / Golden Meadow / Vines of Vitality',
                        scope: 'team-wind',
                        effects: { basicSkillDamage: 10 },
                        duration: 25,
                        note: 'A0: +10% Basic Skill DMG for Wind team (25s, ×2 stacks)'
                    },
                    {
                        name: '[Sharp Breath]',
                        trigger: 'ally Ultimate Skill use',
                        scope: 'team',
                        effects: { critRate: 10, critDMG: 10 },
                        duration: 20,
                        note: 'A1: +10% CritRate + +10% CritDMG for team (20s, ramps 1%/s)'
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Weapon: Damage Taken Debuff',
                        trigger: 'skill hit',
                        scope: 'enemy',
                        effects: { damageTaken: 1.7 },
                        duration: 10,
                        note: 'A1 weapon: +1.7% damage taken on enemy (10s)'
                    }
                ],
            },
            // A2: +10% HP (self, permanent)
            A2: {
                passives: [
                    {
                        name: 'HP Increase (A2)',
                        description: "The user's HP increases by 10%.",
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: HP Boost',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { hp: 6 },
                        duration: 'infinite',
                        note: 'A2 weapon: +6% HP (self)'
                    },
                    {
                        name: 'A2 HP Boost',
                        trigger: 'permanent',
                        scope: 'self',
                        effects: { hp: 10 },
                        duration: 'infinite',
                        note: 'A2: +10% HP (self, permanent)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Weapon: Damage Taken Debuff',
                        trigger: 'skill hit',
                        scope: 'enemy',
                        effects: { damageTaken: 2.5 },
                        duration: 10,
                        note: 'A2 weapon: +2.5% damage taken on enemy (10s)'
                    }
                ],
            },
            // A3: [Immortal] survival mechanic (no DMG%)
            A3: {
                passives: [
                    {
                        name: '[Immortal] (A3)',
                        description: 'When HP ≤ 1 within Golden Meadow zone, becomes [Immortal] for 2s. After, recovers 30% of Han Se-Mi\'s Max HP. Once per battle.',
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: HP Boost',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { hp: 8 },
                        duration: 'infinite',
                        note: 'A3 weapon: +8% HP (self)'
                    }
                ],
                teamBuffs: [],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Weapon: Damage Taken Debuff',
                        trigger: 'skill hit',
                        scope: 'enemy',
                        effects: { damageTaken: 3.3 },
                        duration: 10,
                        note: 'A3 weapon: +3.3% damage taken on enemy (10s)'
                    }
                ],
            },
            // A4: +10% Wind DMG (entire team, permanent)
            A4: {
                passives: [
                    {
                        name: 'Wind DMG Team Boost (A4)',
                        description: 'Increases entire team members\' Wind damage by 10%.',
                        mechanic: 'permanent'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: HP Boost',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { hp: 10 },
                        duration: 'infinite',
                        note: 'A4 weapon: +10% HP (self)'
                    }
                ],
                teamBuffs: [
                    {
                        name: 'Wind DMG Team Boost',
                        trigger: 'permanent',
                        scope: 'team',
                        effects: { windDamage: 10 },
                        duration: 'infinite',
                        note: 'A4: +10% Wind DMG for entire team (permanent)'
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Weapon: Damage Taken Debuff',
                        trigger: 'skill hit',
                        scope: 'enemy',
                        effects: { damageTaken: 4.2 },
                        duration: 10,
                        note: 'A4 weapon: +4.2% damage taken on enemy (10s)'
                    }
                ],
            },
            // A5: [Natural Unity] +10% ATK, +10% DEF, +20% Wind DMG (team, 25s)
            A5: {
                passives: [
                    {
                        name: '[Natural Unity] (A5)',
                        description: 'When tagging out or using Vines of Vitality, grants [Natural Unity] to team: +10% ATK, +10% DEF, +20% Wind DMG (25s).',
                        mechanic: 'conditional'
                    }
                ],
                selfBuffs: [
                    {
                        name: 'Weapon: HP Boost',
                        trigger: 'permanent (weapon)',
                        scope: 'self',
                        effects: { hp: 10 },
                        duration: 'infinite',
                        note: 'A5 weapon: +10% HP (self)'
                    },
                    {
                        name: 'A2 HP Boost',
                        trigger: 'permanent',
                        scope: 'self',
                        effects: { hp: 10 },
                        duration: 'infinite',
                        note: 'A2: +10% HP (self, permanent)'
                    },
                    {
                        name: '[Breath] Self',
                        trigger: 'Sharp Sprouts / Golden Meadow / Vines of Vitality',
                        scope: 'self',
                        effects: { basicSkillDamage: 20 },
                        duration: 25,
                        note: 'A0: +20% Basic Skill DMG (self, 25s, ×2 stacks)'
                    }
                ],
                teamBuffs: [
                    {
                        name: '[Breath] Wind Team',
                        trigger: 'Sharp Sprouts / Golden Meadow / Vines of Vitality',
                        scope: 'team-wind',
                        effects: { basicSkillDamage: 10 },
                        duration: 25,
                        note: 'A0: +10% Basic Skill DMG for Wind team (25s, ×2 stacks)'
                    },
                    {
                        name: '[Sharp Breath]',
                        trigger: 'ally Ultimate Skill use',
                        scope: 'team',
                        effects: { critRate: 10, critDMG: 10 },
                        duration: 20,
                        note: 'A1: +10% CritRate + +10% CritDMG for team (20s)'
                    },
                    {
                        name: 'Wind DMG Team Boost',
                        trigger: 'permanent',
                        scope: 'team',
                        effects: { windDamage: 10 },
                        duration: 'infinite',
                        note: 'A4: +10% Wind DMG for entire team (permanent)'
                    },
                    {
                        name: '[Natural Unity]',
                        trigger: 'tag-out / Vines of Vitality',
                        scope: 'team',
                        effects: { attack: 10, defense: 10, windDamage: 20 },
                        duration: 25,
                        note: 'A5: +10% ATK, +10% DEF, +20% Wind DMG for team (25s)'
                    }
                ],
                raidBuffs: [],
                debuffs: [
                    {
                        name: 'Weapon: Damage Taken Debuff',
                        trigger: 'skill hit',
                        scope: 'enemy',
                        effects: { damageTaken: 5 },
                        duration: 10,
                        note: 'A5 weapon: +5% damage taken on enemy (10s)'
                    }
                ],
            },
        }
    },
};

// Helper function pour obtenir les buffs d'un personnage à un advancement donné
export const getAdvancedBuffs = (characterId, advancement = 'A5') => {
    const character = CHARACTER_ADVANCED_BUFFS[characterId];
    if (!character) return null;

    const advData = character.advancements[advancement];
    if (!advData) return null;

    return {
        characterInfo: {
            id: character.id,
            name: character.name,
            class: character.class,
            element: character.element,
            scaleStat: character.scaleStat,
            primaryRole: character.primaryRole,
            secondaryRole: character.secondaryRole,
            tags: character.tags
        },
        advancement: advancement,
        passives: advData.passives || [],
        selfBuffs: advData.selfBuffs || [],
        teamBuffs: advData.teamBuffs || [],
        raidBuffs: advData.raidBuffs || [],
        debuffs: advData.debuffs || []
    };
};

// Helper pour obtenir tous les buffs actifs (cumulatifs jusqu'à l'advancement actuel)
export const getCumulativeBuffs = (characterId, advancement = 'A5') => {
    const character = CHARACTER_ADVANCED_BUFFS[characterId];
    if (!character) return null;

    const advancementOrder = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'];
    const targetIndex = advancementOrder.indexOf(advancement);

    if (targetIndex === -1) return null;

    // Accumuler tous les buffs jusqu'à l'advancement cible
    const cumulative = {
        passives: [],
        selfBuffs: [],
        teamBuffs: [],
        raidBuffs: [],
        debuffs: []
    };

    for (let i = 0; i <= targetIndex; i++) {
        const advData = character.advancements[advancementOrder[i]];
        if (!advData) continue;

        // Pour les buffs stackables/progressifs, on prend la dernière version
        // Pour les nouveaux buffs, on les ajoute
        cumulative.passives = [...(advData.passives || [])];
        cumulative.selfBuffs = [...(advData.selfBuffs || [])];
        cumulative.teamBuffs = [...(advData.teamBuffs || [])];
        cumulative.raidBuffs = [...(advData.raidBuffs || [])];
        cumulative.debuffs = [...(advData.debuffs || [])];
    }

    return cumulative;
};
