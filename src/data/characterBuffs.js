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
    // A5 ajoute un buff personnel (+10% Def Pen)
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
                // Buffs personnels pour Sian uniquement (débloqués à A5)
                personalBuffs: {
                    defPen: 10   // +10% Def Pen à Sian lui-même
                },
                // Buff conditionnel RAID (persiste depuis A4)
                conditionalBuff: {
                    targetElement: 'Dark',
                    defPenPerAlly: 3,
                    countCondition: 'element',
                    raidWide: true
                }
            },  // +10% Def Pen personnel + +3% Def Pen par Dark hunter
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
