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

                // RAID buffs permanents (Strike Squad Leader - A5)
                raidBuffs: [
                    {
                        name: 'Strike Squad Leader',  // NOUVEAU à A5
                        trigger: 'Kihoon enters stage',
                        scope: 'raid',  // RAID-wide
                        effects: {
                            attack: 10,      // +10% ATK
                            hp: 10,          // +10% HP
                            damageDealt: 10  // +10% DMG dealt
                        },
                        duration: 'infinite',
                        stackable: false,
                        note: 'Permanent RAID-wide buff when entering stage'
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

    // 🔥 Autres personnages à ajouter ici par la suite
    // etc.
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
