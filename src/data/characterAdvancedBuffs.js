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
                raidBuffs: [
                    {
                        name: 'Frieren Raid Buffs (A5)',
                        effects: { critRate: 15, critDMG: 15 },
                        scope: 'raid',
                        duration: 'infinite',
                        note: '+15% TC + 15% DCC en Raid'
                    }
                ],
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
