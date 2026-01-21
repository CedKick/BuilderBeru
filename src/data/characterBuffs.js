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
    // Weapon Lee Bora (Arme) - Buffs selon l'advancement A0-A5
    // Lee Bora weapon "Strengthening Charm" - Décrémentation -1.5% par niveau (depuis A5 vers A0)
    // NOTE: "Precision" skill (A5 weapon) provides +10% Crit Rate & +10% Crit DMG via RAID debuff
    // Les cibles touchées par "Strengthening Charm" reçoivent ce debuff pendant 10 secondes
    weapon: {
        baseStats: {
            critRate: 0,  // TC de l'arme (%)
            critDMG: 0,   // DCC de l'arme (%)
            defPen: 0,    // DefPen de l'arme (%)
        },
        buffs: {
            A0: { critRate: 2.5, critDMG: 2.5, defPen: 0 },  // 2★ Lee Bora
            A1: { critRate: 4, critDMG: 4, defPen: 0 },      // 3★ Lee Bora
            A2: { critRate: 5.5, critDMG: 5.5, defPen: 0 },  // 4★ Lee Bora
            A3: { critRate: 7, critDMG: 7, defPen: 0 },      // 5★ A3 Lee Bora
            A4: { critRate: 8.5, critDMG: 8.5, defPen: 0 },  // 5★ A4 Lee Bora
            A5: { critRate: 10, critDMG: 10, defPen: 0 },    // 5★ A5 Lee Bora (+ 10% TC & DCC via debuff RAID "Precision")
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

    // Weapon Sian (Arme) - Buffs selon l'advancement A0-A5
    // Sian weapon - BUFF PERSONNEL uniquement (pas RAID-wide)
    // Progression +2/+4/+6/+9/+12/+15% Def Pen selon le niveau d'arme
    weapon_sian: {
        baseStats: {
            critRate: 0,  // TC de l'arme (%)
            critDMG: 0,   // DCC de l'arme (%)
            defPen: 0,    // DefPen de l'arme (%)
        },
        buffs: {
            A0: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { defPen: 2 }   // +2% Def Pen personnel (A0)
            },
            A1: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { defPen: 4 }   // +4% Def Pen personnel (A1)
            },
            A2: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { defPen: 6 }   // +6% Def Pen personnel (A2)
            },
            A3: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { defPen: 9 }   // +9% Def Pen personnel (A3)
            },
            A4: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { defPen: 12 }  // +12% Def Pen personnel (A4)
            },
            A5: {
                critRate: 0, critDMG: 0, defPen: 0,
                personalBuffs: { defPen: 15 }  // +15% Def Pen personnel (A5)
            },
        }
    },

    // Weapon Son Kihoon (Arme) - Buffs selon l'advancement A0-A5
    // Son weapon - N'apporte AUCUN buff (tous les buffs viennent du personnage lui-même)
    weapon_son: {
        baseStats: {
            critRate: 0,  // TC de l'arme (%)
            critDMG: 0,   // DCC de l'arme (%)
            defPen: 0,    // DefPen de l'arme (%)
        },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },   // RIEN
            A1: { critRate: 0, critDMG: 0, defPen: 0 },   // RIEN
            A2: { critRate: 0, critDMG: 0, defPen: 0 },   // RIEN
            A3: { critRate: 0, critDMG: 0, defPen: 0 },   // RIEN
            A4: { critRate: 0, critDMG: 0, defPen: 0 },   // RIEN
            A5: { critRate: 0, critDMG: 0, defPen: 0 },   // RIEN (les buffs viennent du personnage)
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

    // Ilhwan - SEUL A5 APPORTE DES BUFFS PERSONNELS
    // IMPORTANT: A0, A1, A2, A3, A4 n'apportent RIEN
    // Seulement A5 débloque les buffs personnels (3x12% TC = 36% TC)
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
            A4: { critRate: 0, critDMG: 0, defPen: 0 },  // RIEN
            A5: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                // Buffs personnels pour Ilhwan uniquement (débloqués à A5)
                personalBuffs: {
                    critRate: 36,  // 3x12% TC à Ilhwan lui-même
                }
            },
        }
    },

    // Baek Yoonho (Silver Mane) - SEUL A1 APPORTE DES BUFFS PERSONNELS
    // IMPORTANT: A0, A2, A3, A4, A5 n'apportent RIEN
    // Seulement A1 débloque les buffs personnels (36% TC + 36% DCC)
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
                // Buff TEAM Dark (pas personnel !) - +10% Def Pen pour tous les Dark de la team
                teamBuffsDark: {
                    defPen: 10   // +10% Def Pen pour la TEAM Dark (Sung n'en profite pas !)
                },
                // Buff conditionnel RAID (persiste depuis A4)
                conditionalBuff: {
                    targetElement: 'Dark',
                    defPenPerAlly: 3,
                    countCondition: 'element',
                    raidWide: true
                }
            },  // +10% Def Pen TEAM Dark + +3% Def Pen par Dark hunter
        }
    },

    // 🔨 Son Kihoon - SEUL A5 APPORTE DES BUFFS DE TEAM (conditionnels)
    // IMPORTANT: A0, A1, A2, A3, A4 n'apportent RIEN
    // A5 débloque des buffs de TEAM conditionnels selon l'état de bris
    son: {
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
            A4: { critRate: 0, critDMG: 0, defPen: 0 },  // RIEN
            A5: {
                critRate: 0,
                critDMG: 0,
                defPen: 0,
                // Buffs de TEAM (pour sa team uniquement, débloqués à A5)
                // Conditionnels selon l'état de bris
                teamBuff: {
                    critDMG: 15  // +15% DCC pour sa team par défaut (sans état de bris)
                },
                // Si état de bris activé
                breakState: {
                    critDMG: 30  // +30% DCC pour sa team si état de bris (au lieu de 15%)
                }
            },  // +15% DCC TEAM (ou +30% si break state activé)
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
    lim: {
        baseStats: {
            critRate: 0,
            critDMG: 0,
            defPen: 0,
        },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },  // RIEN
            A1: { critRate: 5.6, critDMG: 8, defPen: 0 },   // +5.6% TC RAID, +8% DCC RAID
            A2: { critRate: 5.6, critDMG: 8, defPen: 0 },   // A1 persiste
            A3: { critRate: 5.6, critDMG: 15, defPen: 0 },  // +8% (A1) + 7% (A3) = 15% DCC RAID
            A4: { critRate: 5.6, critDMG: 15, defPen: 0 },  // A3 persiste
            A5: { critRate: 5.6, critDMG: 15, defPen: 0 },  // A3 persiste
        }
    },

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

    // 🗡️ Weapon Hwang Dongsuk (Arme) - N'apporte RIEN
    weapon_hwang: {
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

    // 👤 Hwang Dongsuk - N'apporte AUCUN buff TC/DCC/Def Pen
    hwang: {
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

    // ═══════════════════════════════════════════════════════════════
    // 🔥 FIRE ELEMENT CHARACTERS
    // ═══════════════════════════════════════════════════════════════

    // 🗡️ Weapon Emma (Arme) - N'apporte RIEN
    weapon_emma: {
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

    // 🔥 Emma - A0 apporte 7.7% Def Pen pour sa TEAM
    emma: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0, teamBuff: { defPen: 7.7 } },  // +7.7% Def Pen TEAM
            A1: { critRate: 0, critDMG: 0, defPen: 0, teamBuff: { defPen: 7.7 } },
            A2: { critRate: 0, critDMG: 0, defPen: 0, teamBuff: { defPen: 7.7 } },
            A3: { critRate: 0, critDMG: 0, defPen: 0, teamBuff: { defPen: 7.7 } },
            A4: { critRate: 0, critDMG: 0, defPen: 0, teamBuff: { defPen: 7.7 } },
            A5: { critRate: 0, critDMG: 0, defPen: 0, teamBuff: { defPen: 7.7 } },
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

    // 🗡️ Weapon Yuqi (Arme) - N'apporte RIEN
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

    // 🔥 Yuqi - N'apporte AUCUN buff TC/DCC/Def Pen
    yuqi: {
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

    // 🗡️ Weapon Reed (Arme) - Def Pen PERSONNEL
    // A0=2%, A1=4%, A2=6%, A3=9%, A4=12%, A5=15%
    weapon_reed: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 2 } },
            A1: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 4 } },
            A2: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 6 } },
            A3: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 9 } },
            A4: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 12 } },
            A5: { critRate: 0, critDMG: 0, defPen: 0, personalBuffs: { defPen: 15 } },
        }
    },

    // 🔥 Christopher Reed - N'apporte AUCUN buff (tout vient de l'arme)
    reed: {
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

    // 🔥 Gina - A4 apporte +4% Def Pen pour tout le RAID
    gina: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: { critRate: 0, critDMG: 0, defPen: 0 },
            A3: { critRate: 0, critDMG: 0, defPen: 0 },
            A4: { critRate: 0, critDMG: 0, defPen: 4 },  // +4% Def Pen RAID
            A5: { critRate: 0, critDMG: 0, defPen: 4 },  // A4 persiste
        }
    },

    // 🗡️ Weapon Yoo Soohyun (Arme) - N'apporte RIEN
    weapon_soohyun: {
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

    // 🔥 Yoo Soohyun - A0: 24% Def Pen perso, A2: +12% Def Pen perso (total 36%)
    soohyun: {
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

    // 🗡️ Weapon Frieren (Arme) - N'apporte RIEN
    weapon_frieren: {
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

    // 🔥 Frieren (collab) - A4: +20% DCC team, A5: +15% DCC raid + 15% TC raid
    frieren: {
        baseStats: { critRate: 0, critDMG: 0, defPen: 0 },
        buffs: {
            A0: { critRate: 0, critDMG: 0, defPen: 0 },
            A1: { critRate: 0, critDMG: 0, defPen: 0 },
            A2: { critRate: 0, critDMG: 0, defPen: 0 },
            A3: { critRate: 0, critDMG: 0, defPen: 0 },
            A4: {
                critRate: 0, critDMG: 0, defPen: 0,
                teamBuff: { critDMG: 20 }  // +20% DCC pour sa team
            },
            A5: {
                critRate: 15, critDMG: 15, defPen: 0,  // +15% TC RAID + 15% DCC RAID
                teamBuff: { critDMG: 20 }  // +20% DCC pour sa team (A4 persiste)
            },
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
    return char.buffs[advKey] || { critRate: 0, critDMG: 0, defPen: 0 };
};

// Helper pour obtenir les stats de base d'un personnage
export const getCharacterBaseStats = (characterId) => {
    const char = CHARACTER_BUFFS[characterId];
    if (!char) {
        return { critRate: 0, critDMG: 0, defPen: 0 };
    }
    return char.baseStats;
};
