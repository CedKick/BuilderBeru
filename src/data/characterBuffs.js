// 🔥 CHARACTER BUFFS - Buffs de stats par personnage selon l'advancement
// TC = Taux Critique (%), DCC = Dégâts Coup Critique (%), DefPen = Pénétration Défense (%)

// Structure :
// {
//   characterId: {
//     baseStats: { critRate, critDMG, defPen },  // Stats personnelles du perso
//     buffs: {
//       A0: { critRate, critDMG, defPen },       // Buffs donnés à la team à A0
//       A1: { critRate, critDMG, defPen },       // Buffs donnés à la team à A1
//       ...
//       A5: { critRate, critDMG, defPen }        // Buffs donnés à la team à A5
//     }
//   }
// }

export const CHARACTER_BUFFS = {
    // Weapon Lee Bora (Arme) - ATK boost + RAID debuff conditionnel
    // L'arme augmente l'ATK de Lee Bora de 2.5-10% (personnel)
    // Les cibles touchées par "Strengthening Charm" reçoivent un debuff RAID :
    // +2.5-10% crit damage taken + +2.5-10% crit chance received (durée 10s)
    // En theorycraft, ce debuff = +TC/+DCC effectif pour TOUT LE RAID
    weapon: {
        baseStats: {
            critRate: 0,  // TC de l'arme (%)
            critDMG: 0,   // DCC de l'arme (%)
            defPen: 0,    // DefPen de l'arme (%)
        },
        buffs: {
            A0: {
                critRate: 2.5,  // +2.5% TC effectif RAID (via debuff ennemi)
                critDMG: 2.5,   // +2.5% DCC effectif RAID (via debuff ennemi)
                defPen: 0,
                personalBuffs: { attack: 2.5 },  // +2.5% ATK personnel
                conditionalDebuff: {
                    trigger: 'strengtheningCharm',
                    critChanceReceived: 2.5,   // +2.5% crit chance received (enemy debuff)
                    critDamageTaken: 2.5,      // +2.5% crit damage taken (enemy debuff)
                    duration: 10,
                    targetScope: 'raid'
                }
            },
            A1: {
                critRate: 4,
                critDMG: 4,
                defPen: 0,
                personalBuffs: { attack: 4 },
                conditionalDebuff: {
                    trigger: 'strengtheningCharm',
                    critChanceReceived: 4,
                    critDamageTaken: 4,
                    duration: 10,
                    targetScope: 'raid'
                }
            },
            A2: {
                critRate: 5.5,
                critDMG: 5.5,
                defPen: 0,
                personalBuffs: { attack: 5.5 },
                conditionalDebuff: {
                    trigger: 'strengtheningCharm',
                    critChanceReceived: 5.5,
                    critDamageTaken: 5.5,
                    duration: 10,
                    targetScope: 'raid'
                }
            },
            A3: {
                critRate: 7,
                critDMG: 7,
                defPen: 0,
                personalBuffs: { attack: 7 },
                conditionalDebuff: {
                    trigger: 'strengtheningCharm',
                    critChanceReceived: 7,
                    critDamageTaken: 7,
                    duration: 10,
                    targetScope: 'raid'
                }
            },
            A4: {
                critRate: 8.5,
                critDMG: 8.5,
                defPen: 0,
                personalBuffs: { attack: 8.5 },
                conditionalDebuff: {
                    trigger: 'strengtheningCharm',
                    critChanceReceived: 8.5,
                    critDamageTaken: 8.5,
                    duration: 10,
                    targetScope: 'raid'
                }
            },
            A5: {
                critRate: 10,   // +10% TC effectif RAID (via debuff ennemi)
                critDMG: 10,    // +10% DCC effectif RAID (via debuff ennemi)
                defPen: 0,
                personalBuffs: { attack: 10 },  // +10% ATK personnel
                conditionalDebuff: {
                    trigger: 'strengtheningCharm',
                    critChanceReceived: 10,    // +10% crit chance received (enemy debuff)
                    critDamageTaken: 10,       // +10% crit damage taken (enemy debuff)
                    duration: 10,
                    targetScope: 'raid'
                }
            }
        }
    },

    // Weapon Ilhwan (Arme) - Buffs selon l'advancement A0-A5
    // Ilhwan weapon - Décrémentation -5% DCC par niveau (depuis A5 vers A0)
    weapon_ilhwan: {
        baseStats: {
            critRate: 0,  // TC de l'arme (%)
            critDMG: 0,   // DCC de l'arme (%)
            defPen: 0,    // DefPen de l'arme (%)
        },
        buffs: {
            A0: { critRate: 0, critDMG: 5, defPen: 0 },   // A0 Ilhwan
            A1: { critRate: 0, critDMG: 10, defPen: 0 },  // A1 Ilhwan
            A2: { critRate: 0, critDMG: 15, defPen: 0 },  // A2 Ilhwan
            A3: { critRate: 0, critDMG: 20, defPen: 0 },  // A3 Ilhwan
            A4: { critRate: 0, critDMG: 25, defPen: 0 },  // A4 Ilhwan
            A5: { critRate: 0, critDMG: 30, defPen: 0 },  // A5 Ilhwan (+ 30% DCC via debuff RAID)
        }
    },

    // Weapon Sian - Crimson Shadow (Arme) - Buffs selon l'advancement A0-A5
    // BUFF PERSONNEL: +2% à +15% Def Pen (progression: 2/4/6/9/12/15%)
    // BUFF TEAM CONDITIONNEL: +2% à +12% Dark Damage quand ennemi a Dark Overload
    //   - Stack jusqu'à 4x (max +48% Dark Damage à A5)
    //   - Durée: Infinie
    //   - Scope: TEAM (3 hunters) - À CONFIRMER si RAID
    weapon_sian: {
        baseStats: {
            critRate: 0,  // TC de l'arme (%)
            critDMG: 0,   // DCC de l'arme (%)
            defPen: 0,    // DefPen de l'arme (%)
        },
        buffs: {
            A0: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { defPen: 2 },  // +2% Def Pen personnel
                // Buff conditionnel TEAM: Dark Damage quand ennemi Overload
                conditionalBuff: {
                    trigger: 'darkOverload',       // Se déclenche quand ennemi a Dark Overload
                    darkDamagePerStack: 2,         // +2% Dark Damage par stack (A0)
                    maxStacks: 4,                  // Max 4 stacks = 8% Dark Damage
                    targetScope: 'team',           // TEAM (3 hunters)
                    duration: 'infinite'           // Infini
                }
            },
            A1: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { defPen: 4 },
                conditionalBuff: {
                    trigger: 'darkOverload',
                    darkDamagePerStack: 4,         // +4% Dark Damage par stack (max 16%)
                    maxStacks: 4,
                    targetScope: 'team',
                    duration: 'infinite'
                }
            },
            A2: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { defPen: 6 },
                conditionalBuff: {
                    trigger: 'darkOverload',
                    darkDamagePerStack: 6,         // +6% Dark Damage par stack (max 24%)
                    maxStacks: 4,
                    targetScope: 'team',
                    duration: 'infinite'
                }
            },
            A3: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { defPen: 9 },
                conditionalBuff: {
                    trigger: 'darkOverload',
                    darkDamagePerStack: 8,         // +8% Dark Damage par stack (max 32%)
                    maxStacks: 4,
                    targetScope: 'team',
                    duration: 'infinite'
                }
            },
            A4: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { defPen: 12 },
                conditionalBuff: {
                    trigger: 'darkOverload',
                    darkDamagePerStack: 10,        // +10% Dark Damage par stack (max 40%)
                    maxStacks: 4,
                    targetScope: 'team',
                    duration: 'infinite'
                }
            },
            A5: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { defPen: 15 },
                conditionalBuff: {
                    trigger: 'darkOverload',
                    darkDamagePerStack: 12,        // +12% Dark Damage par stack (max 48%)
                    maxStacks: 4,
                    targetScope: 'team',
                    duration: 'infinite'
                }
            },
        }
    },

    // Weapon Son Kihoon (Arme) - HP boost + Team Dark DMG on Break
    // Kihoon's HP increases by 5-12%. When Kihoon or ally successfully puts target in [Break], increases team's Dark damage by 2.5-15%
    weapon_son: {
        baseStats: {
            critRate: 0,  // TC de l'arme (%)
            critDMG: 0,   // DCC de l'arme (%)
            defPen: 0,    // DefPen de l'arme (%)
        },
        buffs: {
            A0: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { hp: 5 },  // +5% HP personnel (A0)
                // Buff conditionnel TEAM: Dark Damage quand Break déclenché
                conditionalBuff: {
                    trigger: 'break',              // Se déclenche quand Break est appliqué
                    darkDamage: 2.5,               // +2.5% Dark Damage (A0)
                    targetScope: 'team',           // TEAM (3 hunters)
                    duration: 'infinite'           // Infini
                }
            },
            A1: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { hp: 6.5 },
                conditionalBuff: {
                    trigger: 'break',
                    darkDamage: 5,                 // +5% Dark Damage (A1)
                    targetScope: 'team',
                    duration: 'infinite'
                }
            },
            A2: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { hp: 8 },
                conditionalBuff: {
                    trigger: 'break',
                    darkDamage: 7.5,               // +7.5% Dark Damage (A2)
                    targetScope: 'team',
                    duration: 'infinite'
                }
            },
            A3: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { hp: 9.5 },
                conditionalBuff: {
                    trigger: 'break',
                    darkDamage: 10,                // +10% Dark Damage (A3)
                    targetScope: 'team',
                    duration: 'infinite'
                }
            },
            A4: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { hp: 11 },
                conditionalBuff: {
                    trigger: 'break',
                    darkDamage: 12.5,              // +12.5% Dark Damage (A4)
                    targetScope: 'team',
                    duration: 'infinite'
                }
            },
            A5: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { hp: 12 },         // +12% HP personnel (A5 max)
                conditionalBuff: {
                    trigger: 'break',
                    darkDamage: 15,                // +15% Dark Damage (A5 max)
                    targetScope: 'team',
                    duration: 'infinite'
                }
            },
        }
    },

    // 🔮 Lee Bora - SEUL A2 APPORTE DES BUFFS
    // IMPORTANT: A0, A1, A3, A4, A5 n'apportent RIEN
    // Seulement A2 débloque les buffs personnels et conditionnels qui persistent après
    lee: {
        baseStats: {
            critRate: 0,  // TC de base du perso (%)
            critDMG: 0,   // DCC de base du perso (%)
            defPen: 0,    // DefPen de base du perso (%)
        },
        buffs: {
            A0: {
                critRate: 0,
                critDMG: 0,
                defPen: 0
            },   // RIEN
            A1: {
                critRate: 0,
                critDMG: 0,
                defPen: 0
            },   // RIEN
            A2: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                // Buffs personnels pour Lee Bora uniquement (débloqués à A2)
                personalBuffs: {
                    critRate: 6,   // +6% TC à Lee Bora elle-même
                    critDMG: 6     // +6% DCC à Lee Bora elle-même
                },
                // Buff conditionnel RAID (débloqué à A2, appliqué à tous les hunters Dark)
                conditionalBuff: {
                    targetElement: 'Dark',           // Ne s'applique qu'aux hunters Dark
                    critDMGPerAlly: 2,               // +2% Crit DMG par allié Dark
                    countCondition: 'element',       // Compte basé sur l'élément
                    raidWide: true                   // S'applique au RAID entier
                }
            },   // +6% TC et +6% DCC personnels + +2% DCC par Dark hunter
            A3: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    critRate: 6,
                    critDMG: 6
                },
                conditionalBuff: {
                    targetElement: 'Dark',
                    critDMGPerAlly: 2,
                    countCondition: 'element',
                    raidWide: true
                }
            },  // Buffs A2 persistent
            A4: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    critRate: 6,
                    critDMG: 6
                },
                conditionalBuff: {
                    targetElement: 'Dark',
                    critDMGPerAlly: 2,
                    countCondition: 'element',
                    raidWide: true
                }
            },  // Buffs A2 persistent
            A5: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    critRate: 6,
                    critDMG: 6
                },
                conditionalBuff: {
                    targetElement: 'Dark',
                    critDMGPerAlly: 2,
                    countCondition: 'element',
                    raidWide: true
                }
            },  // Buffs A2 persistent
        }
    },

    // Ilhwan - A4 apporte buff RAID, A5 apporte buffs PERSONNELS
    // IMPORTANT: A0, A1, A2, A3 n'apportent RIEN
    // A4 débloque buff conditionnel RAID (+10% ATK par Dark ally)
    // A5 débloque buffs personnels (Ruler's Protection: 3x12% TC + 3x12% ATK = 36% TC + 36% ATK)
    ilhwan: {
        baseStats: {
            critRate: 0,  // TC de base du perso (%)
            critDMG: 0,   // DCC de base du perso (%)
            defPen: 0,    // DefPen de base du perso (%)
        },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },  // RIEN
            A1: { critRate: 0, critDMG: 0, defPen: 0 },  // RIEN
            A2: { critRate: 0, critDMG: 0, defPen: 0 },  // RIEN
            A3: { critRate: 0, critDMG: 0, defPen: 0 },  // RIEN
            A4: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                // Buff conditionnel RAID (débloqué à A4)
                conditionalBuff: {
                    targetElement: 'Dark',           // Ne s'applique qu'aux hunters Dark
                    attackPerAlly: 10,               // +10% ATK par allié Dark
                    countCondition: 'element',       // Compte basé sur l'élément
                    raidWide: true                   // S'applique au RAID entier
                }
            },  // +10% ATK par Dark hunter (RAID-wide)
            A5: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                // Buffs personnels pour Ilhwan uniquement (débloqués à A5)
                // Ruler's Protection: 3 stacks × 12% = +36% TC et +36% ATK
                personalBuffs: {
                    critRate: 36,  // 3x12% TC (Ruler's Protection)
                    attack: 36     // 3x12% ATK (Ruler's Protection)
                },
                // Buff conditionnel RAID (persiste depuis A4)
                conditionalBuff: {
                    targetElement: 'Dark',
                    attackPerAlly: 10,
                    countCondition: 'element',
                    raidWide: true
                }
            },
        }
    },

    // Son Kihoon - Breaker Dark HP Scaler
    // SUPPRIMÉ : Cette 1ère entrée était écrasée par la 2ème entrée `son:` plus bas
    // Toutes les données sont maintenant fusionnées dans l'entrée unique `son:` ci-dessous

    // Lim Tae-Gyu - Breaker Dark ATK Scaler (Magic Boost specialist)
    // A0: RIEN
    // A1: Team buffs conditionnels stacking (+0.7% TC + 1% DCC, max 8 stacks)
    // A2: RIEN (+20% Break effectiveness mais pas de buffs TC/DCC/Def Pen)
    // A3: RIEN (enhance Magic Boost damage)
    // A4: +12% ATK personnel
    // A5: Buffs personnels stacking (+4% ATK per Volley Fire hit, max 30 stacks = +120% ATK)
    lim: {
        baseStats: {
            critRate: 0,  // TC de base du perso (%)
            critDMG: 0,   // DCC de base du perso (%)
            defPen: 0,    // DefPen de base du perso (%)
        },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },  // RIEN
            A1: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                // RAID buffs conditionnels stacking (débloqués à A1)
                // Triggered by Volley Fire or Quick Attack: Typhoon Fire
                conditionalBuff: {
                    trigger: 'volleyFireOrQuickAttack',
                    critRatePerStack: 0.7,   // +0.7% TC per stack
                    critDMGPerStack: 1,      // +1% DCC per stack
                    maxStacks: 8,
                    duration: 10,            // 10s duration
                    targetScope: 'raid',     // RAID (6 hunters)
                    totalBonus: {
                        critRate: 5.6,       // 0.7% × 8 = +5.6% TC
                        critDMG: 8           // 1% × 8 = +8% DCC
                    }
                }
            },
            A2: {
                critRate: 0, critDMG: 0, defPen: 0,
                // Buffs conditionnels persistent depuis A1
                conditionalBuff: {
                    trigger: 'volleyFireOrQuickAttack',
                    critRatePerStack: 0.7,
                    critDMGPerStack: 1,
                    maxStacks: 8,
                    duration: 10,
                    targetScope: 'raid',     // RAID (6 hunters)
                    totalBonus: {
                        critRate: 5.6,
                        critDMG: 8
                    }
                }
            },
            A3: {
                critRate: 0, critDMG: 0, defPen: 0,
                // Buffs conditionnels persistent depuis A1
                conditionalBuff: {
                    trigger: 'volleyFireOrQuickAttack',
                    critRatePerStack: 0.7,
                    critDMGPerStack: 1,
                    maxStacks: 8,
                    duration: 10,
                    targetScope: 'raid',
                    totalBonus: {
                        critRate: 5.6,
                        critDMG: 8
                    }
                }
            },
            A4: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                // Buff personnel permanent (débloqué à A4)
                personalBuffs: {
                    attack: 12  // +12% ATK
                },
                // Buffs conditionnels persistent depuis A1
                conditionalBuff: {
                    trigger: 'volleyFireOrQuickAttack',
                    critRatePerStack: 0.7,
                    critDMGPerStack: 1,
                    maxStacks: 8,
                    duration: 10,
                    targetScope: 'raid',
                    totalBonus: {
                        critRate: 5.6,
                        critDMG: 8
                    }
                }
            },
            A5: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                // Buff personnel stacking (débloqué à A5)
                // Triggered by Volley Fire hits
                personalBuffs: {
                    attack: 12  // +12% ATK (base de A4)
                },
                stackingBuff: {
                    trigger: 'volleyFireHit',
                    attackPerStack: 4,       // +4% ATK per stack
                    maxStacks: 30,
                    duration: 'infinite',
                    totalBonus: {
                        attack: 120          // 4% × 30 = +120% ATK
                    },
                    note: 'Max 30 stacks = +132% ATK total (12% base + 120% stacks)'
                },
                // Buffs conditionnels persistent depuis A1
                conditionalBuff: {
                    trigger: 'volleyFireOrQuickAttack',
                    critRatePerStack: 0.7,
                    critDMGPerStack: 1,
                    maxStacks: 8,
                    duration: 10,
                    targetScope: 'raid',     // RAID (6 hunters)
                    totalBonus: {
                        critRate: 5.6,       // 0.7% × 8 = +5.6% TC
                        critDMG: 8           // 1% × 8 = +8% DCC
                    }
                }
            }
        }
    },

    // Weapon Lim Tae-Gyu (Arme) - Dark DMG + ATK stacking on Basic Attack after Ultimate
    // Increases Dark damage by 4-12%
    // Basic Attack within 10s after Quick Attack: Typhoon Fire → +8% ATK (stacks up to 2 times, 30s)
    weapon_lim: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0,
        },
        buffs: {
            A0: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { darkDamage: 4 },  // +4% Dark Damage (A0)
                // Buff conditionnel PERSONNEL: ATK stacking when using Basic Attack after Ultimate
                conditionalBuff: {
                    trigger: 'basicAttackAfterUltimate',  // Basic Attack within 10s after Quick Attack: Typhoon Fire
                    attackPerStack: 8,                     // +8% ATK per stack
                    maxStacks: 2,
                    duration: 30,                          // 30s duration
                    targetScope: 'personal',               // PERSONAL
                    totalBonus: {
                        attack: 16                         // 8% × 2 = +16% ATK
                    },
                    windowDuration: 10                     // Must use Basic Attack within 10s after Ultimate
                }
            },
            A1: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { darkDamage: 6 },
                conditionalBuff: {
                    trigger: 'basicAttackAfterUltimate',
                    attackPerStack: 8,
                    maxStacks: 2,
                    duration: 30,
                    targetScope: 'personal',
                    totalBonus: { attack: 16 },
                    windowDuration: 10
                }
            },
            A2: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { darkDamage: 8 },
                conditionalBuff: {
                    trigger: 'basicAttackAfterUltimate',
                    attackPerStack: 8,
                    maxStacks: 2,
                    duration: 30,
                    targetScope: 'personal',
                    totalBonus: { attack: 16 },
                    windowDuration: 10
                }
            },
            A3: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { darkDamage: 9.5 },
                conditionalBuff: {
                    trigger: 'basicAttackAfterUltimate',
                    attackPerStack: 8,
                    maxStacks: 2,
                    duration: 30,
                    targetScope: 'personal',
                    totalBonus: { attack: 16 },
                    windowDuration: 10
                }
            },
            A4: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { darkDamage: 11 },
                conditionalBuff: {
                    trigger: 'basicAttackAfterUltimate',
                    attackPerStack: 8,
                    maxStacks: 2,
                    duration: 30,
                    targetScope: 'personal',
                    totalBonus: { attack: 16 },
                    windowDuration: 10
                }
            },
            A5: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { darkDamage: 12 },  // +12% Dark Damage (A5 max)
                conditionalBuff: {
                    trigger: 'basicAttackAfterUltimate',
                    attackPerStack: 8,
                    maxStacks: 2,
                    duration: 30,
                    targetScope: 'personal',
                    totalBonus: { attack: 16 },     // 8% × 2 = +16% ATK
                    windowDuration: 10
                }
            },
        }
    },

    // 🗡️ Weapon Baek Yoonho / Silver Mane (Arme) - Basic Attack DMG boost
    // Augmente Basic Attack DMG de 22.5% à 80% selon advancement
    // Self-damage + HP-based damage (voir characterAdvancedBuffs.js pour détails)
    weapon_silverbaek: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0,
        },
        buffs: {
            A0: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: {
                    basicAttackDamage: 22.5  // +22.5% Basic Attack DMG (A0)
                }
            },
            A1: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: {
                    basicAttackDamage: 33.5  // +33.5% Basic Attack DMG (A1)
                }
            },
            A2: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: {
                    basicAttackDamage: 45  // +45% Basic Attack DMG (A2)
                }
            },
            A3: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: {
                    basicAttackDamage: 56.5  // +56.5% Basic Attack DMG (A3)
                }
            },
            A4: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: {
                    basicAttackDamage: 68  // +68% Basic Attack DMG (A4)
                }
            },
            A5: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: {
                    basicAttackDamage: 80  // +80% Basic Attack DMG (A5)
                }
            },
        }
    },

    // 🐯 Baek Yoonho (Silver Mane) - SEUL A1 APPORTE DES BUFFS PERSONNELS (via Ultimate)
    // IMPORTANT: A0, A2, A3, A4, A5 n'apportent RIEN (les buffs A1 persistent)
    // A1 : Ultimate → +3% TC & DCC par seconde pendant 12s (max 36% TC + 36% DCC)
    // NOTE: Le flat +36% ici est une simplification. Voir characterAdvancedBuffs.js pour la mécanique de stacking progressif.
    silverbaek: {
        baseStats: {
            critRate: 0,  // TC de base du perso (%)
            critDMG: 0,   // DCC de base du perso (%)
            defPen: 0,    // DefPen de base du perso (%)
        },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },  // RIEN
            A1: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                // Buffs personnels pour Baek Yoonho uniquement (débloqués à A1)
                personalBuffs: {
                    critRate: 36,   // +36% TC à Baek Yoonho lui-même
                    critDMG: 36     // +36% DCC à Baek Yoonho lui-même
                }
            },  // +36% TC et +36% DCC personnels
            A2: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    critRate: 36,
                    critDMG: 36
                }
            },  // Buffs A1 persistent
            A3: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    critRate: 36,
                    critDMG: 36
                }
            },  // Buffs A1 persistent
            A4: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    critRate: 36,
                    critDMG: 36
                }
            },  // Buffs A1 persistent
            A5: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    critRate: 36,
                    critDMG: 36
                }
            },  // Buffs A1 persistent
        }
    },

    // 🗡️ Sian Halat - A4 APPORTE BUFF RAID, A5 APPORTE BUFF PERSONNEL
    // IMPORTANT: A0, A1, A2, A3 n'apportent RIEN
    // A4 débloque le buff conditionnel RAID (+3% Def Pen par Dark hunter)
    // A5 ajoute un buff TEAM Dark (+10% Def Pen pour tous les Dark de la team)
    sian: {
        baseStats: {
            critRate: 0,  // TC de base du perso (%)
            critDMG: 0,   // DCC de base du perso (%)
            defPen: 0,    // DefPen de base du perso (%)
        },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },  // RIEN
            A1: { critRate: 0, critDMG: 0, defPen: 0 },  // RIEN
            A2: { critRate: 0, critDMG: 0, defPen: 0 },  // RIEN
            A3: { critRate: 0, critDMG: 0, defPen: 0 },  // RIEN
            A4: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                // Buff conditionnel RAID (débloqué à A4)
                conditionalBuff: {
                    targetElement: 'Dark',           // Ne s'applique qu'aux hunters Dark
                    defPenPerAlly: 3,                // +3% Def Pen par allié Dark
                    countCondition: 'element',       // Compte basé sur l'élément
                    raidWide: true                   // S'applique au RAID entier
                }
            },  // +3% Def Pen par Dark hunter (RAID-wide)
            A5: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                // NOTE: Le buff Zenith Sword (+10% Def Pen, +30% Overload DMG, +15% ATK)
                // est géré dans characterAdvancedBuffs.js comme teamBuff
                // Buff conditionnel RAID (persiste depuis A4)
                conditionalBuff: {
                    targetElement: 'Dark',
                    defPenPerAlly: 3,
                    countCondition: 'element',
                    raidWide: true
                }
            },  // Zenith Sword (teamBuff dans advancedBuffs) + +3% Def Pen par Dark hunter
        }
    },

    // 🔨 Son Kihoon - Breaker Dark HP Scaler
    // A4: +10% ATK/HP team. A5: +30% DCC team (Berserk Strike) + Strike Squad Leader TEAM (+10% ATK/HP/DMG dealt)
    // A5 debuff Broken Spirit: +15% TC RAID (via critHitChanceReceived dans characterAdvancedBuffs)
    son: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0,
        },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: { critRate: 0, critDMG: 0, defPen: 0 },
            A3: { critRate: 0, critDMG: 0, defPen: 0 },
            A4: {
                critRate: 0, critDMG: 0, defPen: 0,
                teamBuffs: {
                    attack: 10,  // +10% ATK team
                    hp: 10       // +10% HP team
                }
            },
            A5: {
                critRate: 0, critDMG: 0, defPen: 0,
                teamBuff: {
                    critDMG: 30  // +30% DCC pour sa team (Berserk Strike)
                },
                teamBuffs: {
                    attack: 10,      // +10% ATK TEAM (Strike Squad Leader)
                    hp: 10,          // +10% HP TEAM
                    damageDealt: 10  // +10% DMG dealt TEAM
                }
            },
        }
    },

    // 💎 Isla - SEUL A0 APPORTE DES BUFFS DE TEAM
    // IMPORTANT: Le buff s'applique uniquement à la TEAM d'Isla (pas tout le RAID)
    // A0 débloque +12% TC et +12% DCC pour tous les membres de sa team
    isla: {
        baseStats: {
            critRate: 0,  // TC de base du perso (%)
            critDMG: 0,   // DCC de base du perso (%)
            defPen: 0,    // DefPen de base du perso (%)
        },
        buffs: {
            A0: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                // Buffs de TEAM (s'appliquent uniquement à la team d'Isla)
                teamBuff: {
                    critRate: 12,  // +12% TC pour la team
                    critDMG: 12    // +12% DCC pour la team
                }
            },  // +12% TC et +12% DCC pour la team (A0)
            A1: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                teamBuff: {
                    critRate: 12,
                    critDMG: 12
                }
            },  // Buffs A0 persistent
            A2: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                teamBuff: {
                    critRate: 12,
                    critDMG: 12
                }
            },  // Buffs A0 persistent
            A3: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                teamBuff: {
                    critRate: 12,
                    critDMG: 12
                }
            },  // Buffs A0 persistent
            A4: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                teamBuff: {
                    critRate: 12,
                    critDMG: 12
                }
            },  // Buffs A0 persistent
            A5: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                teamBuff: {
                    critRate: 12,
                    critDMG: 12
                }
            },  // Buffs A0 persistent
        }
    },

    // 🗡️ Weapon Minnie (Arme) - Buffs PERSONNELS selon l'advancement A0-A5
    // Minnie weapon - Buff personnel uniquement (pas RAID-wide)
    // Progression: A0=2.5%, A1=5%, A2=6%, A3=9%, A4=12%, A5=15% TC & DCC
    weapon_minnie: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0,
        },
        buffs: {
            A0: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { critRate: 2.5, critDMG: 2.5 }  // +2.5% TC & DCC personnel
            },
            A1: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { critRate: 5, critDMG: 5 }      // +5% TC & DCC personnel
            },
            A2: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { critRate: 6, critDMG: 6 }      // +6% TC & DCC personnel
            },
            A3: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { critRate: 9, critDMG: 9 }      // +9% TC & DCC personnel
            },
            A4: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { critRate: 12, critDMG: 12 }    // +12% TC & DCC personnel
            },
            A5: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { critRate: 15, critDMG: 15 }    // +15% TC & DCC personnel
            },
        }
    },

    // 🌙 Minnie - TOUS SES BUFFS SONT PERSONNELS (elle est capée TC 😭)
    // A0: +30% TC, +25% DCC (perso)
    // A1: +30% DCC supplémentaire (perso) - total DCC = 55%
    // A3: +30% TC supplémentaire (perso) - total TC = 60%
    // A5: +60% DCC (3x20%) supplémentaire (perso) - total DCC = 115%
    minnie: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0,
        },
        buffs: {
            A0: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    critRate: 30,   // +30% TC perso
                    critDMG: 25     // +25% DCC perso
                }
            },
            A1: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    critRate: 30,   // +30% TC perso (A0)
                    critDMG: 55     // +25% (A0) + 30% (A1) = 55% DCC perso
                }
            },
            A2: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    critRate: 30,   // TC inchangé
                    critDMG: 55     // DCC inchangé
                }
            },
            A3: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    critRate: 60,   // +30% (A0) + 30% (A3) = 60% TC perso
                    critDMG: 55     // DCC inchangé
                }
            },
            A4: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    critRate: 60,   // TC inchangé
                    critDMG: 55     // DCC inchangé
                }
            },
            A5: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    critRate: 60,   // TC inchangé
                    critDMG: 115    // +55% (A0-A3) + 60% (3x20% A5) = 115% DCC perso
                }
            },
        }
    },

    // 🗡️ Weapon Harper (Arme) - N'apporte RIEN pour le theorycraft
    // Harper weapon - Augmente les dégâts ulti des autres joueurs (non comptabilisé)
    weapon_harper: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0,
        },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: { critRate: 0, critDMG: 0, defPen: 0 },
            A3: { critRate: 0, critDMG: 0, defPen: 0 },
            A4: { critRate: 0, critDMG: 0, defPen: 0 },
            A5: { critRate: 0, critDMG: 0, defPen: 0 },
        }
    },

    // 🎸 Harper - BUFFS PERSONNELS uniquement (TC & DCC)
    // A0: +20% TC, +20% DCC (perso)
    // A1-A4: rien de nouveau (A0 persiste)
    // A5: +42% TC, +42% DCC supplémentaire (perso) - total = 62% TC & DCC
    // Note: Autres buffs (ulti, PV, DEF) non comptabilisés pour le theorycraft
    harper: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0,
        },
        buffs: {
            A0: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    critRate: 20,   // +20% TC perso
                    critDMG: 20     // +20% DCC perso
                }
            },
            A1: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    critRate: 20,   // A0 persiste
                    critDMG: 20
                }
            },
            A2: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    critRate: 20,   // A0 persiste
                    critDMG: 20
                }
            },
            A3: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    critRate: 20,   // A0 persiste
                    critDMG: 20
                }
            },
            A4: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    critRate: 20,   // A0 persiste
                    critDMG: 20
                }
            },
            A5: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    critRate: 62,   // +20% (A0) + 42% (A5) = 62% TC perso
                    critDMG: 62     // +20% (A0) + 42% (A5) = 62% DCC perso
                }
            },
        }
    },

    // 🗡️ Weapon Lim (Arme) - N'apporte RIEN pour le theorycraft
    weapon_lim: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0,
        },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: { critRate: 0, critDMG: 0, defPen: 0 },
            A3: { critRate: 0, critDMG: 0, defPen: 0 },
            A4: { critRate: 0, critDMG: 0, defPen: 0 },
            A5: { critRate: 0, critDMG: 0, defPen: 0 },
        }
    },

    // 🧙 Lim - BUFFS RAID (TC & DCC pour tout le raid)
    // A0: rien
    // A1: +5.6% TC RAID, +8% DCC RAID
    // A2: rien (A1 persiste)
    // A3: +7% DCC RAID supplémentaire - total DCC = 15%
    // A4-A5: rien (buffs persistent)
    // 🗡️ Weapon Kang (Arme) - N'apporte RIEN pour le theorycraft
    weapon_kang: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0,
        },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: { critRate: 0, critDMG: 0, defPen: 0 },
            A3: { critRate: 0, critDMG: 0, defPen: 0 },
            A4: { critRate: 0, critDMG: 0, defPen: 0 },
            A5: { critRate: 0, critDMG: 0, defPen: 0 },
        }
    },

    // 👧 Charlotte - Striker Dark DEF Scaler
    // N'apporte AUCUN buff TC/DCC/Def Pen classique
    // Ses buffs sont du skill damage spécifique, Dark Damage, DEF, etc.
    charlotte: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0,
        },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: { critRate: 0, critDMG: 0, defPen: 0 },
            A3: { critRate: 0, critDMG: 0, defPen: 0 },
            A4: { critRate: 0, critDMG: 0, defPen: 0 },
            A5: { critRate: 0, critDMG: 0, defPen: 0 },
        }
    },

    // Weapon Charlotte (Arme) - DEF boost + Skill-specific TC/DCC buffs
    // L'arme augmente la DEF de Charlotte de 2-12% (personnel)
    // +4-24% TC et +4-24% DCC pour les skills "Take This!", "Harper! We Are One!", "Harper! Help!"
    // Ces buffs skill-specific ne sont PAS des buffs TC/DCC classiques
    weapon_charlotte: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0,
        },
        buffs: {
            A0: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { defense: 2 },  // +2% DEF personnel
                // Buff conditionnel pour skills spécifiques (pas un buff TC/DCC classique)
                conditionalBuff: {
                    trigger: 'specificSkills',
                    critRateBonus: 4,    // +4% TC pour skills spécifiques
                    critDMGBonus: 4,     // +4% DCC pour skills spécifiques
                    targetScope: 'personal',
                    skills: ['takeThis', 'harperWeAreOne', 'harperHelp']
                }
            },
            A1: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { defense: 4 },
                conditionalBuff: {
                    trigger: 'specificSkills',
                    critRateBonus: 8,
                    critDMGBonus: 8,
                    targetScope: 'personal',
                    skills: ['takeThis', 'harperWeAreOne', 'harperHelp']
                }
            },
            A2: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { defense: 6 },
                conditionalBuff: {
                    trigger: 'specificSkills',
                    critRateBonus: 12,
                    critDMGBonus: 12,
                    targetScope: 'personal',
                    skills: ['takeThis', 'harperWeAreOne', 'harperHelp']
                }
            },
            A3: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { defense: 8 },
                conditionalBuff: {
                    trigger: 'specificSkills',
                    critRateBonus: 16,
                    critDMGBonus: 16,
                    targetScope: 'personal',
                    skills: ['takeThis', 'harperWeAreOne', 'harperHelp']
                }
            },
            A4: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { defense: 10 },
                conditionalBuff: {
                    trigger: 'specificSkills',
                    critRateBonus: 20,
                    critDMGBonus: 20,
                    targetScope: 'personal',
                    skills: ['takeThis', 'harperWeAreOne', 'harperHelp']
                }
            },
            A5: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { defense: 12 },  // +12% DEF personnel (A5 max)
                conditionalBuff: {
                    trigger: 'specificSkills',
                    critRateBonus: 24,   // +24% TC pour skills spécifiques (A5 max)
                    critDMGBonus: 24,    // +24% DCC pour skills spécifiques (A5 max)
                    targetScope: 'personal',
                    skills: ['takeThis', 'harperWeAreOne', 'harperHelp']
                }
            }
        }
    },

    // 🔨 Harper - Breaker Dark HP Scaler
    // Buffs TC/DCC PERSONNELS via stacking conditionnel (Super Magic Booster)
    // A0: +5% TC/DCC per stack (max 4 stacks = +20% TC/DCC)
    // A5: +6% TC/DCC per stack (max 7 stacks = +42% TC/DCC)
    harper: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0,
        },
        buffs: {
            A0: {
                critRate: 0, critDMG: 0, defPen: 0,
                // Buff personnel stacking (débloqué à A0)
                // [Super Magic Booster]: Trigger = Hammer Drift!
                stackingBuff: {
                    trigger: 'hammerDrift',
                    critRatePerStack: 5,   // +5% TC per stack
                    critDMGPerStack: 5,    // +5% DCC per stack
                    maxStacks: 4,
                    duration: 'infinite',
                    targetScope: 'personal',
                    totalBonus: {
                        critRate: 20,  // 5% × 4 = +20% TC
                        critDMG: 20    // 5% × 4 = +20% DCC
                    }
                }
            },
            A1: {
                critRate: 0, critDMG: 0, defPen: 0,
                stackingBuff: {
                    trigger: 'hammerDrift',
                    critRatePerStack: 5,
                    critDMGPerStack: 5,
                    maxStacks: 4,
                    duration: 'infinite',
                    targetScope: 'personal',
                    totalBonus: { critRate: 20, critDMG: 20 }
                }
            },
            A2: {
                critRate: 0, critDMG: 0, defPen: 0,
                stackingBuff: {
                    trigger: 'hammerDrift',
                    critRatePerStack: 5,
                    critDMGPerStack: 5,
                    maxStacks: 4,
                    duration: 'infinite',
                    targetScope: 'personal',
                    totalBonus: { critRate: 20, critDMG: 20 }
                }
            },
            A3: {
                critRate: 0, critDMG: 0, defPen: 0,
                stackingBuff: {
                    trigger: 'hammerDrift',
                    critRatePerStack: 5,
                    critDMGPerStack: 5,
                    maxStacks: 4,
                    duration: 'infinite',
                    targetScope: 'personal',
                    totalBonus: { critRate: 20, critDMG: 20 }
                }
            },
            A4: {
                critRate: 0, critDMG: 0, defPen: 0,
                // Team buffs permanents (débloqués à A4)
                teamBuffs: {
                    defense: 8,  // +8% DEF (team-wide, permanent)
                    hp: 8        // +8% HP (team-wide, permanent)
                },
                stackingBuff: {
                    trigger: 'hammerDrift',
                    critRatePerStack: 5,
                    critDMGPerStack: 5,
                    maxStacks: 4,
                    duration: 'infinite',
                    targetScope: 'personal',
                    totalBonus: { critRate: 20, critDMG: 20 }
                }
            },
            A5: {
                critRate: 0, critDMG: 0, defPen: 0,
                // Team buffs permanents (persistent depuis A4)
                teamBuffs: {
                    defense: 8,
                    hp: 8
                },
                // Buff personnel stacking amélioré (A5)
                // [Twin Super Magic Booster]: +6% TC/DCC per stack (max 7 stacks)
                stackingBuff: {
                    trigger: 'hammerDrift',
                    critRatePerStack: 6,   // +6% TC per stack (upgraded from 5%)
                    critDMGPerStack: 6,    // +6% DCC per stack (upgraded from 5%)
                    maxStacks: 7,          // Upgraded from 4 to 7
                    duration: 'infinite',
                    targetScope: 'personal',
                    totalBonus: {
                        critRate: 42,  // 6% × 7 = +42% TC
                        critDMG: 42    // 6% × 7 = +42% DCC
                    }
                }
            }
        }
    },

    // Weapon Harper (Arme) - HP boost + TEAM Dark DMG via Ultimate
    // L'arme augmente le HP de Harper de 4-12% (personnel)
    // Utiliser Ultimate → +4-12% Dark Damage pour la TEAM (30s)
    weapon_harper: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0,
        },
        buffs: {
            A0: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { hp: 4 },  // +4% HP personnel
                // Buff conditionnel TEAM: Dark Damage via Ultimate
                conditionalBuff: {
                    trigger: 'ultimate',
                    darkDamage: 4,       // +4% Dark Damage
                    targetScope: 'team',
                    duration: 30
                }
            },
            A1: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { hp: 6 },
                conditionalBuff: {
                    trigger: 'ultimate',
                    darkDamage: 6,
                    targetScope: 'team',
                    duration: 30
                }
            },
            A2: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { hp: 8 },
                conditionalBuff: {
                    trigger: 'ultimate',
                    darkDamage: 8,
                    targetScope: 'team',
                    duration: 30
                }
            },
            A3: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { hp: 10 },
                conditionalBuff: {
                    trigger: 'ultimate',
                    darkDamage: 10,
                    targetScope: 'team',
                    duration: 30
                }
            },
            A4: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { hp: 11 },
                conditionalBuff: {
                    trigger: 'ultimate',
                    darkDamage: 11,
                    targetScope: 'team',
                    duration: 30
                }
            },
            A5: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { hp: 12 },  // +12% HP personnel (A5 max)
                conditionalBuff: {
                    trigger: 'ultimate',
                    darkDamage: 12,      // +12% Dark Damage (A5 max)
                    targetScope: 'team',
                    duration: 30
                }
            }
        }
    },

    // 🔮 Isla Wright - Support Dark DEF Scaler
    // A0+: Core Attack donne [Wheel of Fortune] → +12% TC/DCC TEAM (random, 12s)
    // A2+: +12% DEF TEAM (permanent)
    // A3+: Core Attack active les 3 buffs → [Wheel of Fortune] garanti
    isla: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0,
        },
        buffs: {
            A0: {
                critRate: 0, critDMG: 0, defPen: 0,
                // Buff conditionnel TEAM via Core Attack (random un des 3)
                // [Wheel of Fortune] : +12% TC et +12% DCC TEAM (12s)
                conditionalBuff: {
                    trigger: 'coreAttack',
                    critRateBonus: 12,    // Seulement si [Wheel of Fortune] est tiré (random)
                    critDMGBonus: 12,     // Seulement si [Wheel of Fortune] est tiré (random)
                    targetScope: 'team',
                    duration: 12,
                    note: 'Random buff among [Strength], [The Magician], [Wheel of Fortune]'
                }
            },
            A1: {
                critRate: 0, critDMG: 0, defPen: 0,
                conditionalBuff: {
                    trigger: 'coreAttack',
                    critRateBonus: 12,
                    critDMGBonus: 12,
                    targetScope: 'team',
                    duration: 12,
                    note: 'Random buff among [Strength], [The Magician], [Wheel of Fortune]'
                }
            },
            A2: {
                critRate: 0, critDMG: 0, defPen: 0,
                // Team buffs permanents (débloqués à A2)
                teamBuffs: {
                    defense: 12,  // +12% DEF (team-wide, permanent)
                    speed: 10     // +10% Speed (team-wide, permanent)
                },
                conditionalBuff: {
                    trigger: 'coreAttack',
                    critRateBonus: 12,
                    critDMGBonus: 12,
                    targetScope: 'team',
                    duration: 12,
                    note: 'Random buff among [Strength], [The Magician], [Wheel of Fortune]'
                }
            },
            A3: {
                critRate: 0, critDMG: 0, defPen: 0,
                teamBuffs: {
                    defense: 12,
                    speed: 10
                },
                // Buff conditionnel TEAM via Core Attack (GARANTI maintenant)
                conditionalBuff: {
                    trigger: 'coreAttack',
                    critRateBonus: 12,    // Garanti car les 3 buffs activés ensemble
                    critDMGBonus: 12,     // Garanti car les 3 buffs activés ensemble
                    targetScope: 'team',
                    duration: 12,
                    note: 'A3+: Activates ALL THREE buffs ([Strength], [The Magician], [Wheel of Fortune]) - [Wheel of Fortune] guaranteed!'
                }
            },
            A4: {
                critRate: 0, critDMG: 0, defPen: 0,
                teamBuffs: {
                    defense: 12,
                    speed: 10
                },
                conditionalBuff: {
                    trigger: 'coreAttack',
                    critRateBonus: 12,
                    critDMGBonus: 12,
                    targetScope: 'team',
                    duration: 12,
                    note: 'A3+: Activates ALL THREE buffs - [Wheel of Fortune] guaranteed!'
                }
            },
            A5: {
                critRate: 0, critDMG: 0, defPen: 0,
                teamBuffs: {
                    defense: 12,
                    speed: 10
                },
                conditionalBuff: {
                    trigger: 'coreAttack',
                    critRateBonus: 12,
                    critDMGBonus: 12,
                    targetScope: 'team',
                    duration: 12,
                    note: 'A3+: Activates ALL THREE buffs - [Wheel of Fortune] guaranteed!'
                }
            }
        }
    },

    // Weapon Isla Wright (Arme) - DEF boost scaling avec Dark count
    // L'arme augmente la DEF d'Isla de 0.5-4% (personnel)
    // +0.5-4% DEF pour toute la TEAM par Dark hunter présent
    // Réduit CD Ultimate d'Isla de 4s
    weapon_isla: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0,
        },
        buffs: {
            A0: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { defense: 0.5 },  // +0.5% DEF personnel
                // Buff conditionnel TEAM: DEF scaling avec Dark count
                conditionalBuff: {
                    trigger: 'darkCount',
                    defensePerDarkAlly: 0.5,  // +0.5% DEF par Dark hunter
                    targetScope: 'team',
                    note: 'Scales with number of Dark hunters in team'
                }
            },
            A1: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { defense: 1 },
                conditionalBuff: {
                    trigger: 'darkCount',
                    defensePerDarkAlly: 1,
                    targetScope: 'team'
                }
            },
            A2: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { defense: 2 },
                conditionalBuff: {
                    trigger: 'darkCount',
                    defensePerDarkAlly: 2,
                    targetScope: 'team'
                }
            },
            A3: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { defense: 3 },
                conditionalBuff: {
                    trigger: 'darkCount',
                    defensePerDarkAlly: 3,
                    targetScope: 'team'
                }
            },
            A4: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { defense: 3.5 },
                conditionalBuff: {
                    trigger: 'darkCount',
                    defensePerDarkAlly: 3.5,
                    targetScope: 'team'
                }
            },
            A5: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { defense: 4 },  // +4% DEF personnel (A5 max)
                conditionalBuff: {
                    trigger: 'darkCount',
                    defensePerDarkAlly: 4,   // +4% DEF par Dark hunter (A5 max)
                    targetScope: 'team',
                    note: 'Example: 3 Dark hunters in team = +12% DEF for entire team'
                }
            }
        }
    },

    // 🗡️ Kang Taeshik - Assassin Dark ATK Scaler (Bleed specialist)
    // N'apporte AUCUN buff TC/DCC/Def Pen classique
    // Ses buffs sont ATK personnel et damage vs Bleed
    kang_taeshik: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0,
        },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: { critRate: 0, critDMG: 0, defPen: 0 },
            A3: { critRate: 0, critDMG: 0, defPen: 0 },
            A4: { critRate: 0, critDMG: 0, defPen: 0 },
            A5: { critRate: 0, critDMG: 0, defPen: 0 },
        }
    },

    // Weapon Kang Taeshik (Arme) - Basic Attack DMG + Damage vs Bleed
    // L'arme augmente les Basic Attack damage de Taeshik de 2.5-10% (personnel)
    // +2.5-10% damage aux cibles avec [Bleed] (personnel)
    weapon_kang_taeshik: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0,
        },
        buffs: {
            A0: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: {
                    basicAttackDamage: 2.5,   // +2.5% Basic Attack damage
                    damageVsBleed: 2.5        // +2.5% damage vs [Bleed] targets
                }
            },
            A1: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: {
                    basicAttackDamage: 4,
                    damageVsBleed: 4
                }
            },
            A2: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: {
                    basicAttackDamage: 5.5,
                    damageVsBleed: 5.5
                }
            },
            A3: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: {
                    basicAttackDamage: 7,
                    damageVsBleed: 7
                }
            },
            A4: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: {
                    basicAttackDamage: 8.5,
                    damageVsBleed: 8.5
                }
            },
            A5: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: {
                    basicAttackDamage: 10,    // +10% Basic Attack damage (A5 max)
                    damageVsBleed: 10         // +10% damage vs [Bleed] targets (A5 max)
                }
            }
        }
    },

    // 🥷 Kang - N'apporte AUCUN buff TC/DCC/Def Pen
    kang: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0,
        },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: { critRate: 0, critDMG: 0, defPen: 0 },
            A3: { critRate: 0, critDMG: 0, defPen: 0 },
            A4: { critRate: 0, critDMG: 0, defPen: 0 },
            A5: { critRate: 0, critDMG: 0, defPen: 0 },
        }
    },

    // 🗡️ Weapon Minnie (Arme) - +DEF et +TC/+DCC (personal)
    weapon_minnie: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0,
        },
        buffs: {
            A0: {
                critRate: 2.5,
                critDMG: 2.5,
                defPen: 0,
                personalBuffs: {
                    defense: 5  // +5% DEF personal
                }
            },
            A1: {
                critRate: 5,
                critDMG: 5,
                defPen: 0,
                personalBuffs: {
                    defense: 7  // +7% DEF personal
                }
            },
            A2: {
                critRate: 7.5,
                critDMG: 7.5,
                defPen: 0,
                personalBuffs: {
                    defense: 8  // +8% DEF personal
                }
            },
            A3: {
                critRate: 10,
                critDMG: 10,
                defPen: 0,
                personalBuffs: {
                    defense: 10  // +10% DEF personal
                }
            },
            A4: {
                critRate: 12.5,
                critDMG: 12.5,
                defPen: 0,
                personalBuffs: {
                    defense: 11  // +11% DEF personal
                }
            },
            A5: {
                critRate: 15,
                critDMG: 15,
                defPen: 0,
                personalBuffs: {
                    defense: 12  // +12% DEF personal
                }
            },
        }
    },

    // 🌸 Minnie - Assassin DEF-scaling avec [Flower's Message] stacking
    minnie: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0,
        },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                stackingBuff: {
                    trigger: 'flowersMessage',
                    defensePerStack: 10,      // +10% DEF per stack
                    critDMGPerStack: 10,       // +10% DCC per stack
                    maxStacks: 3,
                    duration: 20,
                    targetScope: 'personal',
                    totalBonus: {
                        defense: 30,           // 3 stacks × 10% = +30% DEF
                        critDMG: 30            // 3 stacks × 10% = +30% DCC
                    },
                    note: '[Flower\'s Message: Fragment of Memories] from [Falling Petals]'
                }
            },
            A2: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    defense: 15  // +15% DEF permanent (A2+)
                },
                stackingBuff: {
                    trigger: 'flowersMessage',
                    defensePerStack: 10,
                    critDMGPerStack: 10,
                    maxStacks: 3,
                    duration: 20,
                    targetScope: 'personal',
                    totalBonus: {
                        defense: 30,
                        critDMG: 30
                    }
                }
            },
            A3: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    defense: 15  // +15% DEF permanent
                },
                stackingBuff: {
                    trigger: 'flowersMessage',
                    defensePerStack: 10,
                    critDMGPerStack: 10,
                    maxStacks: 3,
                    duration: 20,
                    targetScope: 'personal',
                    totalBonus: {
                        defense: 30,
                        critDMG: 30
                    }
                },
                conditionalBuff: {
                    trigger: 'acaciaSkill',
                    critRateBonus: 30,         // +30% TC via [Critical Hit Rate Increase]
                    duration: 20,
                    targetScope: 'personal',
                    note: 'A3+: [Critical Hit Rate Increase] from Acacia skill'
                }
            },
            A4: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    defense: 15
                },
                stackingBuff: {
                    trigger: 'flowersMessage',
                    defensePerStack: 10,
                    critDMGPerStack: 10,
                    maxStacks: 3,
                    duration: 20,
                    targetScope: 'personal',
                    totalBonus: {
                        defense: 30,
                        critDMG: 30
                    }
                },
                conditionalBuff: {
                    trigger: 'acaciaSkill',
                    critRateBonus: 30,
                    duration: 20,
                    targetScope: 'personal'
                }
            },
            A5: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    defense: 15  // +15% DEF permanent
                },
                stackingBuff: {
                    trigger: 'flowersMessage',
                    defensePerStack: 20,       // ENHANCED: +20% DEF per stack (A5)
                    critDMGPerStack: 20,       // ENHANCED: +20% DCC per stack (A5)
                    maxStacks: 3,
                    duration: 20,
                    targetScope: 'personal',
                    totalBonus: {
                        defense: 60,           // 3 stacks × 20% = +60% DEF
                        critDMG: 60            // 3 stacks × 20% = +60% DCC
                    },
                    note: 'A5: [Flower\'s Message] ENHANCED via [Bloom] state'
                },
                conditionalBuff: {
                    trigger: 'acaciaSkill',
                    critRateBonus: 30,
                    duration: 20,
                    targetScope: 'personal'
                }
            }
        }
    },

    // 🗡️ Weapon Hwang Dongsuk (Arme) - N'apporte PAS de TC/DCC/Def Pen
    // Focus: HP scaling (+2-8% HP) + Stacking DMG boost when hit (+0.5-2% per stack, max 10, CD: 3s) + HP recovery
    weapon_hwang: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    hp: 2  // +2% HP (A0)
                },
                stackingBuff: {
                    trigger: 'whenHit',
                    damagePerStack: 0.5,  // +0.5% DMG per stack (A0)
                    maxStacks: 10,
                    cooldown: 3,
                    targetScope: 'personal',
                    totalBonus: {
                        damage: 5  // 10 stacks × 0.5% = +5% DMG
                    },
                    note: 'When hit → +DMG stack + recover 0.5% HP (CD: 3s)'
                }
            },
            A1: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    hp: 3  // +3% HP
                },
                stackingBuff: {
                    trigger: 'whenHit',
                    damagePerStack: 0.75,
                    maxStacks: 10,
                    cooldown: 3,
                    targetScope: 'personal',
                    totalBonus: {
                        damage: 7.5  // 10 stacks × 0.75% = +7.5% DMG
                    }
                }
            },
            A2: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    hp: 4  // +4% HP
                },
                stackingBuff: {
                    trigger: 'whenHit',
                    damagePerStack: 1,
                    maxStacks: 10,
                    cooldown: 3,
                    targetScope: 'personal',
                    totalBonus: {
                        damage: 10  // 10 stacks × 1% = +10% DMG
                    }
                }
            },
            A3: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    hp: 6  // +6% HP
                },
                stackingBuff: {
                    trigger: 'whenHit',
                    damagePerStack: 1.5,
                    maxStacks: 10,
                    cooldown: 3,
                    targetScope: 'personal',
                    totalBonus: {
                        damage: 15  // 10 stacks × 1.5% = +15% DMG
                    }
                }
            },
            A4: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    hp: 7  // +7% HP
                },
                stackingBuff: {
                    trigger: 'whenHit',
                    damagePerStack: 1.75,
                    maxStacks: 10,
                    cooldown: 3,
                    targetScope: 'personal',
                    totalBonus: {
                        damage: 17.5  // 10 stacks × 1.75% = +17.5% DMG
                    }
                }
            },
            A5: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    hp: 8  // +8% HP (max)
                },
                stackingBuff: {
                    trigger: 'whenHit',
                    damagePerStack: 2,
                    maxStacks: 10,
                    cooldown: 3,
                    targetScope: 'personal',
                    totalBonus: {
                        damage: 20  // 10 stacks × 2% = +20% DMG
                    },
                    note: 'When hit → +2% DMG stack + recover 2% HP (CD: 3s, max 10 stacks = +20% DMG)'
                }
            }
        }
    },

    // 👤 Hwang Dongsuk - Breaker Dark HP Scaler - N'apporte AUCUN buff TC/DCC/Def Pen
    // Focus: HP scaling, Skill DMG boost, CD reduction, Shield, HP recovery
    hwang: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                conditionalBuff: {
                    trigger: 'hpAbove75Percent',
                    skillDamageBonus: 16,  // +16% Skill DMG si HP ≥ 75%
                    duration: 'permanent',
                    targetScope: 'personal',
                    note: 'Passive: +16% Skill DMG if HP ≥ 75% | [Lizard\'s Vitality] if HP < 50%: Recover 2.5% HP/s for 10s'
                }
            },
            A1: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                conditionalBuff: {
                    trigger: 'hpAbove75Percent',
                    skillDamageBonus: 16,
                    duration: 'permanent',
                    targetScope: 'personal',
                    note: 'A1: Using Enhance → Reset Scorching Shield CD + -50% Scorching Shield CD during Enhance'
                }
            },
            A2: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    hp: 8  // +8% HP permanent (A2)
                },
                conditionalBuff: {
                    trigger: 'hpAbove75Percent',
                    skillDamageBonus: 16,
                    duration: 'permanent',
                    targetScope: 'personal',
                    note: 'A2: +8% HP permanent'
                }
            },
            A3: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    hp: 8  // +8% HP permanent
                },
                conditionalBuff: {
                    trigger: 'hpAbove75Percent',
                    skillDamageBonus: 16,
                    duration: 'permanent',
                    targetScope: 'personal',
                    note: 'A3: Using Enhance → Grant Shield (20% Max HP, 10s duration)'
                }
            },
            A4: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    hp: 8  // +8% HP permanent
                },
                conditionalBuff: {
                    trigger: 'hpAbove75Percent',
                    skillDamageBonus: 16,
                    duration: 'permanent',
                    targetScope: 'personal',
                    note: 'A4: -25% CD on Mighty Attack (Ultimate)'
                }
            },
            A5: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    hp: 8  // +8% HP permanent
                },
                conditionalBuff: {
                    trigger: 'hpAbove75Percent',
                    skillDamageBonus: 16,
                    duration: 'permanent',
                    targetScope: 'personal',
                    note: 'A5: Using Mighty Attack → 50% chance to reset Mighty Attack CD (CD: 30s)'
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔥 FIRE ELEMENT CHARACTERS
    // ═══════════════════════════════════════════════════════════════

    // 🗡️ Weapon Emma Laurent (Arme) - +DMG vs Break targets + stacking DMG via Heat Absorption
    weapon_emma: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0
        },
        buffs: {
            A0: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    damageVsBreak: 4  // +4% DMG vs Break targets (A0)
                },
                stackingBuff: {
                    trigger: 'heatAbsorptionActivation',
                    damagePerStack: 1.5,  // +1.5% DMG per stack
                    maxStacks: 4,
                    targetScope: 'personal',
                    totalBonus: {
                        damage: 6  // 4 stacks × 1.5% = +6% DMG
                    },
                    note: 'When [Heat Absorption] activates → +1.5% DMG per stack (max 4 = +6%)'
                }
            },
            A1: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    damageVsBreak: 6
                },
                stackingBuff: {
                    trigger: 'heatAbsorptionActivation',
                    damagePerStack: 1.5,
                    maxStacks: 4,
                    targetScope: 'personal',
                    totalBonus: {
                        damage: 6
                    }
                }
            },
            A2: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    damageVsBreak: 8
                },
                stackingBuff: {
                    trigger: 'heatAbsorptionActivation',
                    damagePerStack: 1.5,
                    maxStacks: 4,
                    targetScope: 'personal',
                    totalBonus: {
                        damage: 6
                    }
                }
            },
            A3: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    damageVsBreak: 10
                },
                stackingBuff: {
                    trigger: 'heatAbsorptionActivation',
                    damagePerStack: 1.5,
                    maxStacks: 4,
                    targetScope: 'personal',
                    totalBonus: {
                        damage: 6
                    }
                }
            },
            A4: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    damageVsBreak: 11
                },
                stackingBuff: {
                    trigger: 'heatAbsorptionActivation',
                    damagePerStack: 1.5,
                    maxStacks: 4,
                    targetScope: 'personal',
                    totalBonus: {
                        damage: 6
                    }
                }
            },
            A5: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    damageVsBreak: 12  // +12% DMG vs Break targets (max)
                },
                stackingBuff: {
                    trigger: 'heatAbsorptionActivation',
                    damagePerStack: 1.5,
                    maxStacks: 4,
                    targetScope: 'personal',
                    totalBonus: {
                        damage: 6
                    },
                    note: 'When [Heat Absorption] activates → +1.5% DMG per stack (max 4 = +6%)'
                }
            }
        }
    },

    // 🔥🛡️ Emma Laurent - Tank/DPS Burn/Break specialist - N'apporte PAS de TC/DCC
    // CORRECTION IMPORTANTE: Def Pen est PERSONAL, pas TEAM ! Le buff TEAM est Fire DMG à 15 instances
    emma: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0
        },
        buffs: {
            A0: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                conditionalBuff: {
                    trigger: 'heatEmission',
                    name: 'HeatEmission',
                    defPenAt5: 7.77,        // +7.77% Def Pen at 5 instances (PERSONAL, 20s)
                    fireDMGAt10: 7.77,      // +7.77% Fire DMG at 10 instances (PERSONAL, 20s)
                    fireDMGTeamAt15: 7.77,  // +7.77% Fire DMG at 15 instances (TEAM, 20s)
                    duration: 20,
                    targetScope: 'mixed',  // Personal for 5/10, TEAM for 15
                    note: '[Heat Emission]: 5 inst → +7.77% Def Pen (personal) | 10 inst → +7.77% Fire DMG (personal) | 15 inst → +7.77% Fire DMG (TEAM)'
                }
            },
            A1: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                conditionalBuff: {
                    trigger: 'heatEmission',
                    name: 'HeatEmission',
                    defPenAt5: 7.77,
                    fireDMGAt10: 7.77,
                    fireDMGTeamAt15: 7.77,
                    duration: 20,
                    targetScope: 'mixed',
                    note: 'A1: +77.77% Break DMG on Burn Up'
                }
            },
            A2: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    breakEffect: 10,        // +10% Break effect
                    damageVsBreak: 20       // +20% DMG vs Break targets
                },
                conditionalBuff: {
                    trigger: 'heatEmission',
                    name: 'HeatEmission',
                    defPenAt5: 7.77,
                    fireDMGAt10: 7.77,
                    fireDMGTeamAt15: 7.77,
                    duration: 20,
                    targetScope: 'mixed',
                    note: 'A2: +10% Break effect + +20% DMG vs Break targets'
                }
            },
            A3: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    breakEffect: 10,
                    damageVsBreak: 20
                },
                teamBuffs: {
                    grantHeatAbsorption: true  // Grants [Heat Absorption] to team members
                },
                conditionalBuff: {
                    trigger: 'heatEmission',
                    name: 'HeatEmission',
                    defPenAt5: 7.77,
                    fireDMGAt10: 7.77,
                    fireDMGTeamAt15: 7.77,
                    duration: 20,
                    targetScope: 'mixed',
                    note: 'A3: Grants [Heat Absorption] to team + 5 instances at stage start'
                }
            },
            A4: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    breakEffect: 10,
                    damageVsBreak: 20,
                    hp: 10  // +10% HP
                },
                teamBuffs: {
                    grantHeatAbsorption: true
                },
                conditionalBuff: {
                    trigger: 'heatEmission',
                    name: 'HeatEmission',
                    defPenAt5: 7.77,
                    fireDMGAt10: 7.77,
                    fireDMGTeamAt15: 7.77,
                    duration: 20,
                    targetScope: 'mixed',
                    note: 'A4: +10% HP'
                }
            },
            A5: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    breakEffect: 10,
                    damageVsBreak: 20,
                    hp: 10
                },
                teamBuffs: {
                    grantHeatAbsorption: true
                },
                conditionalBuff: {
                    trigger: 'heatEmission',
                    name: 'HeatEmission',
                    defPenAt5: 7.77,
                    fireDMGAt10: 7.77,
                    fireDMGTeamAt15: 7.77,
                    duration: 20,
                    targetScope: 'mixed'
                },
                breakTriggerBuff: {
                    trigger: 'targetEntersBreak',
                    effects: {
                        resetAllCDs: true,
                        restoreCoreGauge: 100,
                        restorePowerGauge: 100,
                        damageBonus: 77.77  // +77.77% DMG for 15s
                    },
                    duration: 15,
                    note: 'A5: When target enters Break → Reset all skill CDs + 100% Core/Power Gauge + +77.77% DMG (15s)'
                }
            }
        }
    },

    // 🔥 Weapon Esil Radiru (Arme) - +ATK
    weapon_esil: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0
        },
        buffs: {
            A0: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    attack: 4  // +4% ATK (A0)
                }
            },
            A1: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    attack: 6  // +6% ATK (A1)
                }
            },
            A2: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    attack: 8  // +8% ATK (A2)
                }
            },
            A3: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    attack: 10  // +10% ATK (A3)
                }
            },
            A4: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    attack: 10  // +10% ATK (A4)
                }
            },
            A5: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    attack: 12  // +12% ATK (A5)
                }
            }
        }
    },

    // 🔥 Esil Radiru (Character) - ATK & Def Pen scaling per Fire ally
    esil: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0
        },
        buffs: {
            A0: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                note: 'Passive [Prey] → [Prey on the Weak]: Enemy debuff +0.3% Fire DMG taken + +0.3% DMG taken per stack (max 30, 90s)'
            },
            A1: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                note: '[Prey on the Weak] max stacks: 50'
            },
            A2: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                teamBuffs: {
                    attackPerFireAlly: 3  // +3% ATK per Fire ally in party (max 3 = +9%)
                },
                note: 'A2: +3% ATK per Fire ally in party (max 3×). In RAID: stack removed, applies per ally'
            },
            A3: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                teamBuffs: {
                    attackPerFireAlly: 3
                },
                note: '[Prey on the Weak] max stacks: 70'
            },
            A4: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                teamBuffs: {
                    attackPerFireAlly: 3,
                    defPenPerFireAlly: 4  // +4% Def Pen per Fire ally in party (max 3 = +12%)
                },
                note: 'A4: +4% Def Pen per Fire ally in party (max 3×). In RAID: stack removed, applies per ally'
            },
            A5: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                teamBuffs: {
                    attackPerFireAlly: 3,
                    defPenPerFireAlly: 4
                },
                note: 'A5: [Prey on the Weak] max stacks: 100 (90s duration)'
            }
        }
    },

    // 🗡️ Weapon Christopher Reed (Arme) - +DEF + Conditional Def Pen via Zero to a Hundred
    weapon_christopher: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0
        },
        buffs: {
            A0: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    defense: 5  // +5% DEF (A0)
                },
                conditionalBuff: {
                    trigger: 'zeroToAHundred',
                    defPenBonus: 2,  // +2% Def Pen (A0)
                    duration: 20,
                    targetScope: 'personal',
                    note: 'Using Zero to a Hundred → +2% Def Pen for 20s'
                }
            },
            A1: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    defense: 10
                },
                conditionalBuff: {
                    trigger: 'zeroToAHundred',
                    defPenBonus: 4,
                    duration: 20,
                    targetScope: 'personal'
                }
            },
            A2: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    defense: 20
                },
                conditionalBuff: {
                    trigger: 'zeroToAHundred',
                    defPenBonus: 7,
                    duration: 20,
                    targetScope: 'personal'
                }
            },
            A3: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    defense: 30
                },
                conditionalBuff: {
                    trigger: 'zeroToAHundred',
                    defPenBonus: 10,
                    duration: 20,
                    targetScope: 'personal'
                }
            },
            A4: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    defense: 40
                },
                conditionalBuff: {
                    trigger: 'zeroToAHundred',
                    defPenBonus: 12,
                    duration: 20,
                    targetScope: 'personal'
                }
            },
            A5: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    defense: 50  // +50% DEF (max)
                },
                conditionalBuff: {
                    trigger: 'zeroToAHundred',
                    defPenBonus: 15,  // +15% Def Pen (max)
                    duration: 20,
                    targetScope: 'personal',
                    note: 'Using Zero to a Hundred → +15% Def Pen for 20s'
                }
            }
        }
    },

    // 🔥⚽ Christopher Reed - Elemental Stacker DEF Scaler Fire Overload specialist
    // N'apporte AUCUN buff TC/DCC, focus: Fire DMG, Elemental Accumulation, Overload
    christopher: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0
        },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                note: 'A2: +20% Fire Elemental Accumulation effect (not TC/DCC/Def Pen)'
            },
            A3: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                conditionalBuff: {
                    trigger: 'hitBurnTarget',
                    fireDamageBonus: 165,  // +165% Fire DMG
                    finishingCatchBonus: 15,  // +15% Finishing Catch DMG
                    duration: 15,
                    cooldown: 2,
                    targetScope: 'personal',
                    note: '[Competitive Spirit]: When hitting Burn targets → +165% Fire DMG + +15% Finishing Catch DMG (15s, CD: 2s)'
                }
            },
            A4: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                teamBuffs: {
                    fireDamagePerAlly: 5  // +5% Fire DMG per Fire ally in party
                },
                conditionalBuff: {
                    trigger: 'hitBurnTarget',
                    fireDamageBonus: 165,
                    finishingCatchBonus: 15,
                    duration: 15,
                    cooldown: 2,
                    targetScope: 'personal'
                },
                note: 'A4: Fire team members → +5% Fire DMG per Fire ally (multiplicatif, TEAM buff)'
            },
            A5: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                teamBuffs: {
                    fireDamagePerAlly: 5
                },
                conditionalBuff: {
                    trigger: 'hitBurnTarget',
                    fireDamageBonus: 165,
                    finishingCatchBonus: 15,
                    duration: 15,
                    cooldown: 2,
                    targetScope: 'personal'
                },
                debuff: {
                    trigger: 'hitOverloadedTarget',
                    name: 'BlazingShock',
                    fireOverloadDamageTaken: 20,  // +20% Fire Overload DMG taken (enemy debuff)
                    unrecoverable: true,
                    duration: 30,
                    cooldown: 30,
                    note: '[Blazing Shock]: When hitting Fire Overloaded target → +20% Fire Overload DMG taken + [Unrecoverable] (30s, CD: 30s)'
                },
                note: 'A5: [Victor\'s Spirit] → +250% Zero to a Hundred DMG (60s) | Power Gauge recovery on Overload trigger'
            }
        }
    },

    // 🗡️ Weapon Esil (Arme) - Buff crit ATK trop complexe, ignoré
    weapon_esil: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: { critRate: 0, critDMG: 0, defPen: 0 },
            A3: { critRate: 0, critDMG: 0, defPen: 0 },
            A4: { critRate: 0, critDMG: 0, defPen: 0 },
            A5: { critRate: 0, critDMG: 0, defPen: 0 },
        }
    },

    // 🗡️ Weapon Choi Jong-In (Arme) - +ATK + Enemy DEF debuff on Burned targets
    weapon_choi: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0
        },
        buffs: {
            A0: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    attack: 5  // +5% ATK (A0)
                },
                debuff: {
                    trigger: 'attackingBurnedTarget',
                    defenseReduction: 7,  // -7% DEF on enemy (A0)
                    duration: 5,
                    targetScope: 'enemy',
                    condition: 'targetBurnedByChoi',
                    note: 'When attacking Burned targets (by Choi) → -7% enemy DEF for 5s'
                }
            },
            A1: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    attack: 8
                },
                debuff: {
                    trigger: 'attackingBurnedTarget',
                    defenseReduction: 10,
                    duration: 5,
                    targetScope: 'enemy',
                    condition: 'targetBurnedByChoi'
                }
            },
            A2: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    attack: 12
                },
                debuff: {
                    trigger: 'attackingBurnedTarget',
                    defenseReduction: 13,
                    duration: 5,
                    targetScope: 'enemy',
                    condition: 'targetBurnedByChoi'
                }
            },
            A3: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    attack: 15
                },
                debuff: {
                    trigger: 'attackingBurnedTarget',
                    defenseReduction: 16,
                    duration: 5,
                    targetScope: 'enemy',
                    condition: 'targetBurnedByChoi'
                }
            },
            A4: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    attack: 18
                },
                debuff: {
                    trigger: 'attackingBurnedTarget',
                    defenseReduction: 18,
                    duration: 5,
                    targetScope: 'enemy',
                    condition: 'targetBurnedByChoi'
                }
            },
            A5: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    attack: 20  // +20% ATK (max)
                },
                debuff: {
                    trigger: 'attackingBurnedTarget',
                    defenseReduction: 20,  // -20% enemy DEF (max)
                    duration: 5,
                    targetScope: 'enemy',
                    condition: 'targetBurnedByChoi',
                    note: 'When attacking Burned targets (by Choi) → -20% enemy DEF for 5s'
                }
            }
        }
    },

    // 🔥🚫 Choi Jong-In - Fire Support - CANNOT CRIT but massive ATK/Def Pen buffs
    // N'apporte AUCUN buff TC/DCC (cannot crit), focus: ATK, Def Pen, Fire DMG
    choi: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0
        },
        buffs: {
            A0: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    attack: 50  // +50% ATK permanent (Passive: Cannot crit)
                },
                conditionalBuff: {
                    trigger: 'ultimateSkill',
                    name: 'TheUltimateHunter',
                    attackBonus: 20,      // +20% ATK
                    defPenBonus: 20,      // +20% Def Pen
                    duration: 15,
                    targetScope: 'personal',
                    note: '[The Ultimate Hunter]: Using Ultimate → +20% ATK + +20% Def Pen for 15s + Reset CD Rain of Flames & Flame Spear'
                }
            },
            A1: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    attack: 50
                },
                conditionalBuff: {
                    trigger: 'ultimateSkill',
                    name: 'TheUltimateHunter',
                    attackBonus: 20,
                    defPenBonus: 20,
                    duration: 15,
                    targetScope: 'personal',
                    note: 'A1: Rain of Flames triples damage during [The Ultimate Hunter] + changed to Mega Crater'
                }
            },
            A2: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    attack: 62  // +50% (passive) + +12% (A2) = +62% ATK
                },
                conditionalBuff: {
                    trigger: 'ultimateSkill',
                    name: 'TheUltimateHunter',
                    attackBonus: 20,
                    defPenBonus: 20,
                    duration: 15,
                    targetScope: 'personal',
                    note: 'A2: +12% ATK permanent'
                }
            },
            A3: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    attack: 62
                },
                conditionalBuff: {
                    trigger: 'ultimateSkill',
                    name: 'TheUltimateHunter',
                    attackBonus: 20,
                    defPenBonus: 20,
                    duration: 15,
                    targetScope: 'personal',
                    note: 'A3: +60% Ultimate DMG (End of Days)'
                }
            },
            A4: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    attack: 62,
                    fireDamage: 16  // +16% Fire DMG (A4)
                },
                conditionalBuff: {
                    trigger: 'ultimateSkill',
                    name: 'TheUltimateHunter',
                    attackBonus: 20,
                    defPenBonus: 20,
                    duration: 15,
                    targetScope: 'personal',
                    note: 'A4: +100% Burn DMG + +16% Fire DMG'
                }
            },
            A5: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                personalBuffs: {
                    attack: 62,
                    fireDamage: 16
                },
                conditionalBuff: {
                    trigger: 'ultimateSkill',
                    name: 'TheUltimateHunter',
                    attackBonus: 20,
                    defPenBonus: 20,
                    duration: 15,
                    targetScope: 'personal',
                    note: 'A5: 3x faster Ultimate CD when tagged out + 2x faster skill CDs in Team Fight mode + 0.4-0.8% Power Gauge/s'
                }
            }
        }
    },

    // 🔥 Esil - A4 apporte +4% Def Pen par allié Fire dans le RAID (Sung en bénéficie aussi!)
    esil: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: { critRate: 0, critDMG: 0, defPen: 0 },
            A3: { critRate: 0, critDMG: 0, defPen: 0 },
            A4: {
                critRate: 0, critDMG: 0, defPen: 0,
                // Buff conditionnel RAID - +4% Def Pen par Fire hunter (Sung inclus!)
                conditionalBuff: {
                    targetElement: 'all',            // S'applique à TOUS (Sung inclus)
                    defPenPerAlly: 4,                // +4% Def Pen par allié Fire
                    countCondition: 'fire',          // Compte les Fire hunters
                    raidWide: true
                }
            },
            A5: {
                critRate: 0, critDMG: 0, defPen: 0,
                conditionalBuff: {
                    targetElement: 'all',
                    defPenPerAlly: 4,
                    countCondition: 'fire',
                    raidWide: true
                }
            },
        }
    },

    // 🗡️ Weapon Yuqi (Arme) - HP +5-12% + Fire DMG +5-30% on Full Burst (15s)
    // Pas de TC/DCC/DefPen direct, mais buff HP et Fire DMG conditionnels
    weapon_yuqi: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: { critRate: 0, critDMG: 0, defPen: 0 },
            A3: { critRate: 0, critDMG: 0, defPen: 0 },
            A4: { critRate: 0, critDMG: 0, defPen: 0 },
            A5: { critRate: 0, critDMG: 0, defPen: 0 },
        }
    },

    // 🔥 Yuqi - A3: Afterglow +15% DCC team (20s), A4: +5% Fire DMG par Fire ally, A5: Afterglow +20% DCC team (30s)
    yuqi: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: { critRate: 0, critDMG: 0, defPen: 0 },
            A3: { critRate: 0, critDMG: 0, defPen: 0, teamBuffs: { critDMG: 15 } },              // Afterglow: +15% DCC team (20s)
            A4: { critRate: 0, critDMG: 0, defPen: 0, teamBuffs: { critDMG: 15 }, teamBuffsFire: { fireDmg: 5 } },  // +5% Fire DMG par Fire ally (max 3 = 15%)
            A5: { critRate: 0, critDMG: 0, defPen: 0, teamBuffs: { critDMG: 20 }, teamBuffsFire: { fireDmg: 5 } },  // Enhanced Afterglow: +20% DCC team (30s)
        }
    },

    // 🗡️ Weapon Reed (Arme) - N'apporte RIEN (le buff Def Pen vient du personnage)
    weapon_reed: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: { critRate: 0, critDMG: 0, defPen: 0 },
            A3: { critRate: 0, critDMG: 0, defPen: 0 },
            A4: { critRate: 0, critDMG: 0, defPen: 0 },
            A5: { critRate: 0, critDMG: 0, defPen: 0 },
        }
    },

    // 🔥 Christopher Reed - Buff PERSONNEL Def Pen (A0: 2.5%, A1: 4%, A2: 6%, A3: 9%, A4: 12%, A5: 15%)
    reed: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 2.5 } },
            A1: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 4 } },
            A2: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 6 } },
            A3: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 9 } },
            A4: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 12 } },
            A5: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 15 } },
        }
    },

    // 🗡️ Weapon Gina (Arme) - N'apporte RIEN
    weapon_gina: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: { critRate: 0, critDMG: 0, defPen: 0 },
            A3: { critRate: 0, critDMG: 0, defPen: 0 },
            A4: { critRate: 0, critDMG: 0, defPen: 0 },
            A5: { critRate: 0, critDMG: 0, defPen: 0 },
        }
    },

    // 🔥 Gina - A4: +4% Def Pen TEAM (ALL) + 4% Def Pen Fire only (via characterAdvancedBuffs)
    gina: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: { critRate: 0, critDMG: 0, defPen: 0 },
            A3: { critRate: 0, critDMG: 0, defPen: 0 },
            A4: { critRate: 0, critDMG: 0, defPen: 0 },
            A5: { critRate: 0, critDMG: 0, defPen: 0 },
        }
    },

    // 🗡️ Weapon Yoo Soohyun (Arme) - Def Pen PERSONNEL + DMG boost Core/Kill Shot/Hell Fire
    // A0=4%, A1=5.6%, A2=7.2%, A3=8.8%, A4=10.4%, A5=12%
    weapon_yoo: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 4 } },
            A1: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 5.6 } },
            A2: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 7.2 } },
            A3: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 8.8 } },
            A4: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 10.4 } },
            A5: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 12 } },
        }
    },

    // 🔥 Yoo Soohyun - A0: 24% Def Pen perso, A2: +12% Def Pen perso (total 36%)
    yoo: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 24 } },   // +24% Def Pen perso
            A1: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 24 } },   // A0 persiste
            A2: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 36 } },   // +24% + 12% = 36%
            A3: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 36 } },
            A4: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 36 } },
            A5: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 36 } },
        }
    },

    // 🗡️ Weapon Fern (Arme) - DCC PERSONNEL
    // A0=4%, A1=6%, A2=9%, A3=12%, A4=15%, A5=20%
    weapon_fern: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { critDMG: 4 } },
            A1: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { critDMG: 6 } },
            A2: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { critDMG: 9 } },
            A3: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { critDMG: 12 } },
            A4: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { critDMG: 15 } },
            A5: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { critDMG: 20 } },
        }
    },

    // 🔥 Fern - Vision Véritable: A3=5%TC+10%DCC, A4+=10%TC+20%DCC (perso)
    fern: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: { critRate: 0, critDMG: 0, defPen: 0 },
            A3: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { critRate: 5, critDMG: 10 } },   // Vision Véritable
            A4: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { critRate: 10, critDMG: 20 } },  // Vision Véritable améliorée
            A5: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { critRate: 10, critDMG: 20 } },  // A4 persiste
        }
    },

    // 🗡️ Weapon Stark (Arme) - N'apporte RIEN
    weapon_stark: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: { critRate: 0, critDMG: 0, defPen: 0 },
            A3: { critRate: 0, critDMG: 0, defPen: 0 },
            A4: { critRate: 0, critDMG: 0, defPen: 0 },
            A5: { critRate: 0, critDMG: 0, defPen: 0 },
        }
    },

    // 🔥 Stark (Frieren collab) - Def Pen perso + A1 TC perso + A3 buff team spécial
    // A0: 20% Def Pen perso, A1: +10% TC perso, A3: 20% de sa raw Def Pen pour team, A5: +10% Def Pen perso
    stark: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 20 } },
            A1: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 20, critRate: 10 } },
            A2: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 20, critRate: 10 } },
            A3: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { defPen: 20, critRate: 10 },
                // Buff spécial: 20% de sa raw Def Pen pour la team
                // Formule: rawDefPen / (50000 + rawDefPen) = % buff team
                teamBuffFromRaw: {
                    stat: 'defPen',
                    percentage: 20,      // 20% de sa raw Def Pen
                    formula: 'rawDefPen / (50000 + rawDefPen)'  // Résultat en %
                }
            },
            A4: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { defPen: 20, critRate: 10 },
                teamBuffFromRaw: { stat: 'defPen', percentage: 20, formula: 'rawDefPen / (50000 + rawDefPen)' }
            },
            A5: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { defPen: 30, critRate: 10 },  // 20% + 10% = 30% Def Pen perso
                teamBuffFromRaw: { stat: 'defPen', percentage: 20, formula: 'rawDefPen / (50000 + rawDefPen)' }
            },
        }
    },

    // 🗡️ Weapon Frieren (Arme) - +5-50% DEF perso, Team Basic/Ult Skill DMG +5-30%
    // 💧 Frieren Weapon - +5-50% DEF (self) + Team Basic/Ult Skill DMG +5-30%
    weapon_frieren: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defense: 5 }, teamBuffs: { basicSkillDmg: 5, ultimateSkillDmg: 5 } },
            A1: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defense: 14 }, teamBuffs: { basicSkillDmg: 10, ultimateSkillDmg: 10 } },
            A2: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defense: 23 }, teamBuffs: { basicSkillDmg: 15, ultimateSkillDmg: 15 } },
            A3: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defense: 32 }, teamBuffs: { basicSkillDmg: 20, ultimateSkillDmg: 20 } },
            A4: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defense: 41 }, teamBuffs: { basicSkillDmg: 25, ultimateSkillDmg: 25 } },
            A5: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defense: 50 }, teamBuffs: { basicSkillDmg: 30, ultimateSkillDmg: 30 } },
        }
    },

    // 💧 Frieren - Water Support/Sub-DPS DEF Scaler
    // Mana Power Control: A0-A2: +50% DEF (25+25 if MP≥50%), A3+: +100% DEF (50+50)
    // A2: +9% ATK/DEF/HP team, A4: +20% CritDMG team
    // Vollzanbel debuff: A1: -5% DEF enemy, A5: -10% DEF enemy
    frieren: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defense: 50 } },
            A1: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defense: 50 } },
            A2: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defense: 50 }, teamBuffs: { attack: 9, defense: 9, hp: 9 } },
            A3: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defense: 100 }, teamBuffs: { attack: 9, defense: 9, hp: 9 } },
            A4: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defense: 100 }, teamBuffs: { attack: 9, defense: 9, hp: 9, critDMG: 20 } },
            A5: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defense: 100 }, teamBuffs: { attack: 9, defense: 9, hp: 9, critDMG: 20 } },
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // ⚔️ SUNG WEAPONS (Armes de Sung Jinwoo) - Def Pen PERSONNEL
    // ═══════════════════════════════════════════════════════════════

    // 🗡️ Weapon Sung - Ennio's Roar (16% Def Pen)
    weapon_sung_ennio: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 3 } },
            A1: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 5 } },
            A2: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 8 } },
            A3: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 10 } },
            A4: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 13 } },
            A5: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 16 } },
        }
    },

    // 🗡️ Weapon Sung - Knight Killer (20% Def Pen)
    weapon_sung_knightkiller: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 4 } },
            A1: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 7 } },
            A2: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 10 } },
            A3: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 13 } },
            A4: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 16 } },
            A5: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 20 } },
        }
    },

    // 🗡️ Weapon Song Chiyul (Arme) - N'apporte RIEN en TC/DCC/DefPen
    // Juste +2-8% Fire DMG + DMG vs Normal Monster stacking
    weapon_song: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: { critRate: 0, critDMG: 0, defPen: 0 },
            A3: { critRate: 0, critDMG: 0, defPen: 0 },
            A4: { critRate: 0, critDMG: 0, defPen: 0 },
            A5: { critRate: 0, critDMG: 0, defPen: 0 },
        }
    },

    // 🔥 Song Chiyul (SR) - DPS égoïste, 0 buff team. Focus Burn + Incinerate
    song: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: { critRate: 0, critDMG: 0, defPen: 0 },
            A3: { critRate: 0, critDMG: 0, defPen: 0 },
            A4: { critRate: 0, critDMG: 0, defPen: 0 },
            A5: { critRate: 0, critDMG: 0, defPen: 0 },
        }
    },

    // 🗡️ Weapon Kanae (Arme) - +ATK% + Crit Rate PERSONNEL
    // A0=10%TC, A1=12%, A2=14%, A3=16%, A4=18%, A5=20%
    weapon_kanae: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { critRate: 10 } },
            A1: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { critRate: 12 } },
            A2: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { critRate: 14 } },
            A3: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { critRate: 16 } },
            A4: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { critRate: 18 } },
            A5: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { critRate: 20 } },
        }
    },

    // 🔥 Kanae - DPS égoïste. A2: +16% DCC perso. A5 Sixth Sense: +20% CR +20% DCC perso
    // Total perso A5: Sixth Sense 20%CR+20%DCC + A2 16%DCC = 20%CR+36%DCC
    // + Arme 20%CR = 40%CR+36%DCC perso !!
    kanae: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },  // Sixth Sense: +20% CR mais conditionnel (10 stacks)
            A2: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { critDMG: 16 } },   // +16% DCC permanent
            A3: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { critDMG: 16 } },
            A4: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { critDMG: 16 } },
            A5: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { critRate: 20, critDMG: 36 } },  // Sixth Sense 20%CR+20%DCC + A2 16%DCC
        }
    },

    // 🗡️ Weapon Meri (Arme) - N'apporte RIEN
    weapon_meri: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: { critRate: 0, critDMG: 0, defPen: 0 },
            A3: { critRate: 0, critDMG: 0, defPen: 0 },
            A4: { critRate: 0, critDMG: 0, defPen: 0 },
            A5: { critRate: 0, critDMG: 0, defPen: 0 },
        }
    },

    // 🗡️ Weapon Anna (Arme) - +2.5-10% ATK personnel
    weapon_anna: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { attack: 2.5 } },
            A1: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { attack: 4 } },
            A2: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { attack: 5.5 } },
            A3: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { attack: 7 } },
            A4: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { attack: 8.5 } },
            A5: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { attack: 10 } },
        }
    },

    // 💧 Anna Ruiz - Breaker Water ATK - Poison/Break Specialist
    // A2: +10% Break DMG (self), A4: +10% ATK (self)
    // Weapon debuff: -2.5-10% DEF on enemy (tracked in advancedBuffs)
    anna: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { breakTargetDmg: 10 } },
            A3: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { breakTargetDmg: 10 } },
            A4: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { attack: 10, breakTargetDmg: 10 } },
            A5: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { attack: 10, breakTargetDmg: 10 } },
        }
    },

    // 💧 Cha Hae-In Water (Pure Sword Princess) - Weapon DEF buff
    weapon_chae: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defense: 2 } },
            A1: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defense: 4 } },
            A2: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defense: 6 } },
            A3: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defense: 8 } },
            A4: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defense: 10 } },
            A5: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defense: 12 } },
        }
    },

    // 💧 Cha Hae-In Water - Fighter DPS DEF Scaler
    // Will of the Sword (6 stacks): A0: +30% DEF/+12% CR/+12% CD, A1-A4: +60% DEF/+12% CR/+12% CD, A5: +60% DEF/+24% CR/+24% CD
    // A4: +7% CR/CD per Water ally (max 3 = +21% CR/CD)
    chae: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 12, critDMG: 12, defPen: 0, personalBuffs: { defense: 30 } },
            A1: { critRate: 12, critDMG: 12, defPen: 0, personalBuffs: { defense: 60 } },
            A2: { critRate: 12, critDMG: 12, defPen: 0, personalBuffs: { defense: 60 } },
            A3: { critRate: 12, critDMG: 12, defPen: 0, personalBuffs: { defense: 60 } },
            A4: { critRate: 33, critDMG: 33, defPen: 0, personalBuffs: { defense: 60 } },
            A5: { critRate: 45, critDMG: 45, defPen: 0, personalBuffs: { defense: 60 } },
        }
    },

    // 💧 Meri Laine - Infusion Water HP Scaler
    meri: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: { critRate: 0, critDMG: 0, defPen: 0 },
            A3: { critRate: 0, critDMG: 0, defPen: 0 },
            A4: { critRate: 0, critDMG: 0, defPen: 0 },
            A5: { critRate: 0, critDMG: 0, defPen: 0 },
        }
    },

    // 💧 Han Song-Yi Weapon - +2.5-10% Water DMG + Assassination Ready (Retrieve DMG buff)
    'weapon_han-song': {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { waterDamage: 2.5 } },
            A1: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { waterDamage: 4 } },
            A2: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { waterDamage: 5.5 } },
            A3: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { waterDamage: 7 } },
            A4: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { waterDamage: 8.5 } },
            A5: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { waterDamage: 10 } },
        }
    },

    // 💧 Han Song-Yi - Assassin Water ATK Scaler
    // A2: +5% CR + 5% CD, A4: +6% ATK
    'han-song': {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: { critRate: 5, critDMG: 5, defPen: 0 },
            A3: { critRate: 5, critDMG: 5, defPen: 0 },
            A4: { critRate: 5, critDMG: 5, defPen: 0, personalBuffs: { attack: 6 } },
            A5: { critRate: 5, critDMG: 5, defPen: 0, personalBuffs: { attack: 6 } },
        }
    },

    // 💧 Lee Joohee Weapon - +2-5% HP (self) + Shield on tag out
    'weapon_lee-johee': {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { hp: 2 } },
            A1: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { hp: 2.6 } },
            A2: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { hp: 3.2 } },
            A3: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { hp: 3.8 } },
            A4: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { hp: 4.4 } },
            A5: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { hp: 5 } },
        }
    },

    // 💧 Lee Joohee - Healer Water HP Scaler
    // A0: +8% HP team, A2: +6% HP self, Skill 1: +3% ATK team (15s)
    'lee-johee': {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0, teamBuffs: { hp: 8 } },
            A1: { critRate: 0, critDMG: 0, defPen: 0, teamBuffs: { hp: 8 } },
            A2: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { hp: 6 }, teamBuffs: { hp: 8 } },
            A3: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { hp: 6 }, teamBuffs: { hp: 8 } },
            A4: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { hp: 6 }, teamBuffs: { hp: 8 } },
            A5: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { hp: 6 }, teamBuffs: { hp: 8 } },
        }
    },

    // 💧 Meilin Fisher Weapon - Highest ATK ally DMG +6-16%, Ult CD -5-20%
    weapon_meilin: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: { critRate: 0, critDMG: 0, defPen: 0 },
            A3: { critRate: 0, critDMG: 0, defPen: 0 },
            A4: { critRate: 0, critDMG: 0, defPen: 0 },
            A5: { critRate: 0, critDMG: 0, defPen: 0 },
        }
    },

    // 💧 Meilin Fisher - Healer/Buffer Water HP Scaler
    // A0: Bye, Meow! +8% ATK/DEF per stack (max 3) = +24% ATK/DEF team
    // A0: Cuddle Puddle +8% Water DMG taken on enemy
    // A2: +16% ATK/DEF for Water team (8% all + 8% Water)
    // A4: +12% HP self
    meilin: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0, teamBuffs: { attack: 24, defense: 24 } },
            A1: { critRate: 0, critDMG: 0, defPen: 0, teamBuffs: { attack: 24, defense: 24 } },
            A2: { critRate: 0, critDMG: 0, defPen: 0, teamBuffs: { attack: 40, defense: 40 } },
            A3: { critRate: 0, critDMG: 0, defPen: 0, teamBuffs: { attack: 40, defense: 40 } },
            A4: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { hp: 12 }, teamBuffs: { attack: 40, defense: 40 } },
            A5: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { hp: 12 }, teamBuffs: { attack: 40, defense: 40 } },
        }
    },

    // 💧 Nam Chae-Young Weapon - conditional DMG + DEF debuff on Frozen
    weapon_nam: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: { critRate: 0, critDMG: 0, defPen: 0 },
            A3: { critRate: 0, critDMG: 0, defPen: 0 },
            A4: { critRate: 0, critDMG: 0, defPen: 0 },
            A5: { critRate: 0, critDMG: 0, defPen: 0 },
        }
    },

    // 💧 Nam Chae-Young - Breaker Water HP Scaler
    // A2: +6% HP self. Weapon: -5-20% DEF on Frozen targets
    nam: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { hp: 6 } },
            A3: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { hp: 6 } },
            A4: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { hp: 6 } },
            A5: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { hp: 6 } },
        }
    },

    // 💧 Seo Jiwoo Weapon - +5-20% CritDMG + stacking CritDMG (max 20 stacks)
    weapon_seo: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 5, defPen: 0 },
            A1: { critRate: 0, critDMG: 8, defPen: 0 },
            A2: { critRate: 0, critDMG: 11, defPen: 0 },
            A3: { critRate: 0, critDMG: 14, defPen: 0 },
            A4: { critRate: 0, critDMG: 17, defPen: 0 },
            A5: { critRate: 0, critDMG: 20, defPen: 0 },
        }
    },

    // 💧 Seo Jiwoo - Breaker Water HP Scaler
    // A2: +15% Break effectiveness, A4: +15% Max HP from additional CritDMG
    // A5: +32% CR + Skill DMG on Heavy Attacks & Ultimate
    seo: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: { critRate: 0, critDMG: 0, defPen: 0 },
            A3: { critRate: 0, critDMG: 0, defPen: 0 },
            A4: { critRate: 0, critDMG: 0, defPen: 0 },
            A5: { critRate: 32, critDMG: 0, defPen: 0 },
        }
    },

    // 💧 Seorin - Water Ranger Breaker (HP scaling)
    weapon_seorin: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { hp: 5 } },
            A1: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { hp: 6.4 } },
            A2: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { hp: 7.8 } },
            A3: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { hp: 9.2 } },
            A4: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { hp: 10.6 } },
            A5: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { hp: 12 } },
        }
    },
    seorin: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 30, defPen: 0 },
            A2: { critRate: 0, critDMG: 30, defPen: 0 },
            A3: { critRate: 0, critDMG: 30, defPen: 0, teamBuffs: { defense: 20, hp: 20 } },
            A4: { critRate: 0, critDMG: 30, defPen: 0, teamBuffs: { defense: 20, hp: 20 } },
            A5: { critRate: 30, critDMG: 50, defPen: 0, teamBuffs: { defense: 20, hp: 20 } },
        }
    },

    // 💧 Shuhua - Water Assassin DPS (ATK scaling)
    weapon_shuhua: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { attack: 5 } },
            A1: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { attack: 6.4 } },
            A2: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { attack: 7.8 } },
            A3: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { attack: 9.2 } },
            A4: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { attack: 10.6 } },
            A5: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { attack: 12 } },
        }
    },
    shuhua: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0, teamBuffs: { damageDealt: 15 } },
            A1: { critRate: 0, critDMG: 0, defPen: 0, teamBuffs: { damageDealt: 15 } },
            A2: { critRate: 0, critDMG: 0, defPen: 0, teamBuffs: { damageDealt: 15 } },
            A3: { critRate: 0, critDMG: 0, defPen: 0, teamBuffs: { damageDealt: 15 } },
            A4: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { attack: 16 }, teamBuffs: { damageDealt: 15 } },
            A5: { critRate: 30, critDMG: 0, defPen: 0, personalBuffs: { attack: 16 }, teamBuffs: { damageDealt: 15 } },
        }
    },

    // 💧 Alicia Blanche - Water Mage DPS (ATK scaling)
    weapon_alicia: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { attack: 3, defense: 3, hp: 3 } },
            A2: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { attack: 6, defense: 6, hp: 6 } },
            A3: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { attack: 9, defense: 9, hp: 9 } },
            A4: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { attack: 12, defense: 12, hp: 12 } },
            A5: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { attack: 15, defense: 15, hp: 15 } },
        }
    },
    alicia: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 20, critDMG: 20, defPen: 0 },
            A2: { critRate: 20, critDMG: 20, defPen: 0 },
            A3: { critRate: 20, critDMG: 20, defPen: 0, personalBuffs: { attack: 36 } },
            A4: { critRate: 20, critDMG: 20, defPen: 0, personalBuffs: { attack: 36 } },
            A5: { critRate: 20, critDMG: 20, defPen: 0, personalBuffs: { attack: 36 } },
        }
    },

    // Template pour ajouter d'autres persos
    // characterId: {
    //     baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
    //     buffs: {
    //         A0: { critRate: 0, critDMG: 0, defPen: 0 },
    //         A1: { critRate: 0, critDMG: 0, defPen: 0 },
    //         A2: { critRate: 0, critDMG: 0, defPen: 0 },
    //         A3: { critRate: 0, critDMG: 0, defPen: 0 },
    //         A4: { critRate: 0, critDMG: 0, defPen: 0 },
    //         A5: { critRate: 0, critDMG: 0, defPen: 0 },
    //     }
    // },
};

// Helper pour obtenir les buffs d'un personnage selon son advancement
export const getCharacterBuffs = (characterId, advancement = 0) => {
    const char = CHARACTER_BUFFS[characterId];
    if (!char) {
        return { critRate: 0, critDMG: 0, defPen: 0 };
    }

    const advKey = `A${advancement}`;
    const result = char.buffs[advKey] || { critRate: 0, critDMG: 0, defPen: 0 };

    return result;
};

// Helper pour obtenir les stats de base d'un personnage
export const getCharacterBaseStats = (characterId) => {
    const char = CHARACTER_BUFFS[characterId];
    if (!char) {
        return { critRate: 0, critDMG: 0, defPen: 0 };
    }
    return char.baseStats;
};
