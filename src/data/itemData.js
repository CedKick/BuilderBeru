export const runesData = [
   {
    class: "basicSkills",
    className: "armor break",
    element: "fire",
    type: "break",
    used: 20,
    where: ["BoT"],
    name: "decimation",
    src: "https://api.builderberu.com/cdn/images/rune_armorbreak_fire_decimation_break_atbtgh.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 4504.13, // % of ATK
        scaling: "atk"
    },
    cooldown: 20, // seconds
    mpCost: 236,
    
    effects: {
        debuffs: [
            {
                type: "airborne",
                duration: 2, // durée approximative de l'airborne
                target: "enemy",
                icon: "🌪️",
                color: "#ff4444"
            }
        ],
        buffs: [
            {
                type: "crit_damage_increase",
                value: 80, // %
                duration: 5, // seconds
                target: "self",
                icon: "💥",
                color: "#ff6b6b",
                description: "Increases Critical Hit Damage"
            }
        ]
    }
},
    {
    class: "basicSkills",
    className: "armor break",
    element: "light",
    type: "break",
    used: 20,
    where: ["BoT"],
    name: "multishadow strike",
    src: "https://api.builderberu.com/cdn/images/rune_armorbreak_light_multishadowstrike_break_nejq27.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 3629.87, // % of ATK
        baseDefense: 3629.87, // % of Defense aussi
        scaling: ["atk", "def"]
    },
    cooldown: 20, // seconds
    mpCost: 236,
    
    effects: {
        debuffs: [
            {
                type: "knockdown",
                trigger: "final_hit",
                target: "enemy",
                icon: "⬇️",
                color: "#ffff00"
            }
        ],
        buffs: [
            {
                type: "invincible",
                duration: "skill_duration", // pendant l'animation du skill
                target: "self",
                icon: "🛡️",
                color: "#FFD700"
            },
            {
                type: "defense_increase",
                value: 20, // % par stack
                duration: 30, // seconds
                target: "self",
                icon: "🛡️",
                color: "#4169E1",
                stackable: true,
                maxStacks: 5,
                description: "Increases Defense (stacks up to 5 times)"
            }
        ]
    }
}, {
    class: "basicSkills",
    className: "armor break",
    element: "water",
    type: "break",
    used: 20,
    where: ["BoT"],
    name: "iceberg",
    src: "https://api.builderberu.com/cdn/images/rune_armorbreak_water_iceberg_break_pjuvbz.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 6756.2, // % of ATK
        scaling: "atk"
    },
    cooldown: 20, // seconds
    mpCost: 236,
    
    effects: {
        debuffs: [
            {
                type: "freeze",
                duration: 2, // durée typique d'un freeze
                target: "enemy",
                icon: "🧊",
                color: "#00BFFF",
                description: "Freezes the target"
            },
            {
                type: "knockdown",
                trigger: "final_hit",
                target: "enemy",
                icon: "⬇️",
                color: "#4169E1"
            }
        ]
    }
},
    {
    class: "basicSkills",
    className: "armor break",
    element: "wind",
    type: "break",
    used: 20,
    where: ["BoT"],
    name: "vacuum wave",
    src: "https://api.builderberu.com/cdn/images/rune_armorbreak_wind_vacuumwave_break_tnstn8.webp",
    
    // Nouvelles propriétés
    cooldown: 20, // seconds
    mpCost: 236,
    
    effects: {
        debuffs: [
            {
                type: "damage_taken_increase",
                value: 17, // %
                duration: 12, // seconds
                target: "enemy",
                icon: "💔",
                color: "#ff6b6b",
                stackable: false,
                description: "Increases target's damage taken"
            }
        ],
        // On pourrait ajouter les autres effets plus tard si besoin
        additional: [
            {
                type: "knockdown",
                trigger: "final_hit",
                target: "enemy"
            },
            {
                type: "skill_damage_increase", 
                skill: "Vertical Arts",
                value: 35, // %
                duration: 10, // seconds
                target: "self"
            }
        ]
    }
},
    {
    class: "basicSkills",
    className: "piercing thrust",
    element: "fire",
    type: "none",
    used: 20,
    where: ["BoT"],
    name: "firestorm kick",
    src: "https://api.builderberu.com/cdn/images/firestormkick_qrhrd0.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 4949.57, // % of ATK
        scaling: "atk"
    },
    cooldown: 20, // seconds
    mpCost: 268,
    
    effects: {
        debuffs: [
            {
                type: "airborne",
                trigger: "final_hit",
                target: "enemy",
                icon: "🌪️",
                color: "#ff4444"
            },
            {
                type: "burn",
                value: 600, // % of ATK every 3 seconds
                duration: 30, // seconds
                tickInterval: 3, // damage every 3 seconds
                maxStacks: 1, // can only apply once
                target: "enemy",
                icon: "🔥",
                color: "#ff6600",
                description: "Deals 600% ATK damage every 3 seconds"
            }
        ],
        synergies: [
            {
                condition: "target_has_burn",
                effect: "damage_increase",
                value: 200, // % damage increase to Firestorm Kick
                skill: "firestorm kick",
                description: "Increases Firestorm Kick damage by 200% on burned enemies"
            }
        ]
    }
},
    {
    class: "basicSkills",
    className: "piercing thrust",
    element: "wind",
    type: "break",
    used: 20,
    where: ["BoT"],
    name: "gale kick",
    src: "https://api.builderberu.com/cdn/images/galekick_q5tkcy.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 4316, // % of ATK
        scaling: "atk"
    },
    cooldown: 20, // seconds
    mpCost: 236,
    
    effects: {
        debuffs: [
            {
                type: "airborne",
                trigger: "final_hit",
                target: "enemy",
                icon: "🌪️",
                color: "#00ff00"
            }
        ],
        buffs: [
            {
                type: "shield",
                value: 20, // % of Max HP
                duration: 5, // seconds
                target: "self",
                icon: "🛡️",
                color: "#00ff99",
                description: "Creates a shield equal to 20% of Max HP"
            },
            {
                type: "damage_increase",
                value: 1, // % per stack
                duration: 8, // seconds
                target: "self",
                icon: "⚔️",
                color: "#90EE90",
                stackable: true,
                maxStacks: 20,
                description: "Increases damage dealt by 1% per hit (stacks up to 20 times)"
            }
        ]
    }
},
    {
    class: "basicSkills",
    className: "piercing thrust",
    element: "water",
    type: "none",
    used: 20,
    where: ["BoT"],
    name: "flowing water kick",
    src: "https://api.builderberu.com/cdn/images/flowingwaterkick_crr5d3.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 5976, // % of ATK
        scaling: "atk"
    },
    cooldown: 20, // seconds
    mpCost: 268,
    
    effects: {
        debuffs: [
            {
                type: "knockdown",
                trigger: "final_hit",
                target: "enemy",
                icon: "⬇️",
                color: "#4169E1"
            },
            {
                type: "flowing_water",
                duration: 3, // seconds
                target: "enemy",
                icon: "💧",
                color: "#00BFFF",
                stackable: true,
                maxStacks: 3,
                description: "Increases Flowing Water Kick damage by 100% and Water damage by 25%"
            }
        ],
        synergies: [
            {
                condition: "target_has_flowing_water",
                effect: "skill_damage_increase",
                value: 100, // % damage increase to Flowing Water Kick itself
                skill: "flowing water kick"
            },
            {
                condition: "target_has_flowing_water",
                effect: "element_damage_increase",
                value: 25, // % increase to all Water damage
                element: "water"
            }
        ]
    }
},
  {
    class: "basicSkills",
    className: "piercing thrust",
    element: "light",
    type: "break",
    used: 20,
    where: ["BoT"],
    name: "asura kick",
    src: "https://api.builderberu.com/cdn/images/asurakick_kqcfrs.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 1848.13, // % of ATK
        scaling: "atk"
    },
    cooldown: 20, // seconds
    mpCost: 236,
    
    effects: {
        debuffs: [
            {
                type: "airborne",
                trigger: "final_hit",
                target: "enemy",
                icon: "🌪️",
                color: "#FFD700"
            }
        ],
        buffs: [
            {
                type: "invincible",
                duration: "skill_duration", // pendant l'animation
                target: "self",
                icon: "🛡️",
                color: "#FFD700"
            },
            {
                type: "light_damage_increase",
                value: 22, // %
                duration: 12, // seconds
                target: "self",
                icon: "✨",
                color: "#FFFF00",
                description: "Increases Light damage dealt by 22%"
            }
        ]
    }
},
    {
    class: "collapse",
    className: "collapse",
    element: "fire",
    type: "none",
    used: 20,
    where: ["BoT"],
    name: "surge",
    src: "https://api.builderberu.com/cdn/images/rune_collapse_fire_surge_q6bkvh.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 2689.2, // % of ATK
        scaling: "atk"
    },
    cooldown: 25, // seconds
    mpCost: 0, // Les collapse skills n'ont généralement pas de coût MP
    
    conditions: {
        trigger: "knock_down_success", // Nécessite un knockdown réussi
    },
    
    effects: {
        debuffs: [
            {
                type: "knockdown",
                trigger: "first_hit",
                target: "enemy",
                icon: "⬇️",
                color: "#ff4444"
            },
            {
                type: "airborne",
                trigger: "final_hit",
                target: "enemy",
                icon: "🌪️",
                color: "#ff6600"
            }
        ],
        buffs: [
            {
                type: "surge_damage_increase",
                value: 17.5, // % per stack
                duration: "infinite", // Durée infinie
                target: "self",
                icon: "🔥",
                color: "#ff4500",
                stackable: true,
                maxStacks: 20,
                stacksOnCrit: 1, // +1 stack si crit
                description: "Increases Surge damage by 17.5% (stacks up to 20 times)"
            }
        ]
    }
},
    {
    class: "collapse",
    className: "collapse",
    element: "none",
    type: "break",
    used: 20,
    where: ["BoT"],
    name: "compress",
    src: "https://api.builderberu.com/cdn/images/rune_collapse_none_compress_vmeyw3.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 2357.2, // % of ATK
        scaling: "atk"
    },
    cooldown: 25, // seconds
    mpCost: 0, // Les collapse skills n'ont généralement pas de coût MP
    
    conditions: {
        trigger: "knock_down_success", // Nécessite un knockdown réussi
    },
    
    effects: {
        debuffs: [
            {
                type: "knockdown",
                trigger: "final_hit",
                target: "enemy",
                icon: "⬇️",
                color: "#808080"
            },
            {
                type: "break_gauge_reduction",
                value: 5, // % de réduction instantanée
                trigger: "final_hit",
                target: "enemy",
                icon: "💔",
                color: "#999999",
                description: "Instantly decreases Break Gauge by 5%"
            }
        ]
    }
},
    {
    class: "collapse",
    className: "collapse",
    element: "none",
    type: "break",
    used: 20,
    where: ["BoT"],
    name: "surprise attack",
    src: "https://api.builderberu.com/cdn/images/rune_collapse_none_surpriseattack_break_ckqwvl.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 4340.9, // % of ATK
        scaling: "atk"
    },
    cooldown: 25, // seconds
    mpCost: 0,
    
    conditions: {
        trigger: "knock_down_success",
    },
    
    effects: {
        debuffs: [
            {
                type: "knockdown",
                trigger: "final_hit",
                target: "enemy",
                icon: "⬇️",
                color: "#808080"
            },
            {
                type: "resonance",
                duration: 8, // seconds
                target: "enemy",
                icon: "💫",
                color: "#9370DB",
                description: "Converts to Damage Increase when target is broken",
                convertOnBreak: true
            }
        ],
        buffs: [
            {
                type: "damage_increase",
                value: 22, // %
                duration: 20, // seconds
                target: "self",
                icon: "⚔️",
                color: "#00CED1",
                triggerCondition: "resonance_on_break_state",
                description: "Increases damage by 22% when Resonance is removed on broken enemy"
            }
        ]
    }
},
    {
    class: "collapse",
    className: "collapse",
    element: "wind",
    type: "none",
    used: 20,
    where: ["BoT"],
    name: "thunderstorm",
    src: "https://api.builderberu.com/cdn/images/rune_collapse_wind_thunderstorm_xxbqls.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 4188.73, // % of ATK
        scaling: "atk"
    },
    cooldown: 25, // seconds
    mpCost: 0,
    
    conditions: {
        trigger: "knock_down_success",
    },
    
    effects: {
        debuffs: [
            {
                type: "knockdown",
                trigger: "final_hit",
                target: "enemy",
                icon: "⬇️",
                color: "#00ff00"
            }
        ],
        synergies: [
            {
                condition: "enemy_no_break_gauge",
                effect: "skill_damage_increase",
                value: 140, // %
                skill: "thunderstorm",
                description: "Increases Thunderstorm damage by 140% on enemies without Break Gauge"
            },
            {
                condition: "enemy_in_break_state",
                effect: "skill_damage_increase",
                value: 180, // %
                skill: "thunderstorm",
                description: "Increases Thunderstorm damage by 180% on broken enemies"
            }
        ]
    }
},
    {
    class: "Ultimate",
    className: "ultimate",
    element: "none",
    type: "none",
    used: 20,
    where: ["BoT"],
    name: "king's domain",
    src: "https://api.builderberu.com/cdn/images/kings_domain_lhpagm.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 7798.41, // % of ATK
        scaling: "atk"
    },
    cooldown: 60, // seconds
    powerGaugeConsumption: 100, // %
    
    effects: {
        // Les ultimates ont généralement des effets impressionnants
        // mais pas d'infos spécifiques sur les buffs/debuffs pour celui-ci
        buffs: [
            {
                type: "ultimate_power",
                duration: "instant",
                target: "self",
                icon: "👑",
                color: "#FFD700",
                description: "No one can invade the King's Domain"
            }
        ]
    }
},
    {
    class: "Ultimate",
    className: "ultimate",
    element: "none",
    type: "none",
    used: 20,
    where: ["BoT"],
    name: "truth : mutilate",
    src: "https://api.builderberu.com/cdn/images/truth_mutilate_ix7cn7.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 6239.34, // % of ATK (basé sur l'image)
        scaling: "atk"
    },
    cooldown: 60, // seconds
    powerGaugeConsumption: 100, // %
    
    effects: {
        debuffs: [
            {
                type: "spatial_slash",
                duration: "instant",
                target: "enemy",
                icon: "⚔️",
                color: "#8B00FF",
                description: "Jinwoo hides in darkness then slashes through space"
            }
        ],
        buffs: [
            {
                type: "invincible",
                duration: "skill_animation", // pendant l'animation de disparition
                target: "self",
                icon: "👤",
                color: "#4B0082",
                description: "Becomes untargetable while hidden in darkness"
            }
        ],
        additional: [
            {
                type: "teleport",
                description: "Disappears into darkness before striking"
            }
        ]
    }
},
    {
    class: "Ultimate",
    className: "ultimate",
    element: "none",
    type: "none",
    used: 20,
    where: ["BoT"],
    name: "darkness : obliteration",
    src: "https://api.builderberu.com/cdn/images/darkness_obliteration_fvhoea.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 4115.49, // % of ATK (basé sur l'image)
        scaling: "atk"
    },
    cooldown: 60, // seconds
    powerGaugeConsumption: 100, // %
    
    effects: {
        debuffs: [
            {
                type: "multi_slash",
                hits: "multiple",
                duration: "instant",
                target: "enemy",
                icon: "⚔️",
                color: "#2B0033",
                description: "Multiple slashes followed by powerful backstab"
            }
        ],
        buffs: [
            {
                type: "speed_burst",
                duration: "skill_animation",
                target: "self",
                icon: "💨",
                color: "#8B00FF",
                description: "Moves at extreme speed during execution"
            }
        ],
        additional: [
            {
                type: "repositioning",
                position: "behind_enemy",
                description: "Dashes behind enemy for final stab"
            },
            {
                type: "combo_finisher",
                description: "Ends with a powerful backstab"
            }
        ]
    }
},
    {
    class: "Shadow Step",
    className: "Shadow Step",
    element: "none",
    type: "none",
    used: 20,
    where: ["BoT"],
    name: "shadow step",
    src: "https://api.builderberu.com/cdn/images/shadow_step_jj581d.webp",
    
    // NOUVEAUX CHAMPS pour les effets
    damage: {
        base: 327.42, // % of ATK
        scaling: "atk"
    },
    cooldown: 15, // seconds
    
    effects: {
        debuffs: [
            {
                type: "defense_reduction",
                value: 60, // %
                duration: 15, // seconds
                target: "enemy",
                icon: "🛡️❌",
                color: "#ff4444"
            },
            {
                type: "slow",
                value: "extreme",
                duration: 3, // seconds
                target: "enemy",
                icon: "🐌",
                color: "#4488ff"
            }
        ],
        buffs: [
            {
                type: "shadow_step",
                duration: "instant",
                target: "self",
                icon: "👤",
                color: "#8B00FF"
            }
        ],
        conditions: {
            trigger: ["extreme_evasion", "break_status", "shadow_skill"],
            type: "QTE"
        }
    }
},
    {
    class: "basicSkills",
    className: "crushing blow",
    element: "dark",
    type: "break",
    used: 20,
    where: ["BoT"],
    name: "countering break",
    src: "https://api.builderberu.com/cdn/images/rune_crushingblow_dark_counteringbreak_break_c4cvxq.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 6158.49, // % of ATK
        scaling: "atk",
        damageType: "dark" // Dark elemental damage
    },
    breakDamage: "weak", // Weak break damage de base
    cooldown: 10, // seconds
    mpCost: 92,
    
    effects: {
        debuffs: [
            {
                type: "airborne",
                trigger: "final_hit",
                target: "enemy",
                icon: "🌪️",
                color: "#8B00FF"
            },
            {
                type: "stun",
                trigger: "successful_counterattack",
                target: "enemy",
                icon: "💫",
                color: "#9932CC",
                description: "Stuns target on successful counterattack"
            }
        ],
        buffs: [
            {
                type: "shield",
                value: 20, // % of HP
                duration: 3, // seconds
                target: "self",
                icon: "🛡️",
                color: "#8B00FF",
                description: "Creates shield equal to 20% of Jinwoo's HP"
            }
        ],
        special: [
            {
                type: "counterattack",
                window: "skill_duration",
                onSuccess: {
                    breakDamage: "heavy", // Heavy break damage sur counter réussi
                    additionalEffect: "stun"
                },
                description: "Can counterattack during skill use"
            }
        ]
    }
},
    {
    class: "basicSkills",
    className: "crushing blow",
    element: "fire",
    type: "break",
    used: 20,
    where: ["BoT"],
    name: "ascension break",
    src: "https://api.builderberu.com/cdn/images/rune_crushingblow_fire_ascensionbreak_break_wdkwi5.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 1425.35, // % of ATK
        scaling: "atk",
        damageType: "fire" // Fire elemental damage
    },
    breakDamage: "medium",
    cooldown: 10, // seconds
    mpCost: 92,
    
    effects: {
        debuffs: [
            {
                type: "airborne",
                trigger: "first_hit",
                target: "enemy",
                icon: "🌪️",
                color: "#ff4444"
            },
            {
                type: "knockdown",
                trigger: "final_hit",
                target: "enemy",
                icon: "⬇️",
                color: "#ff6600"
            }
        ],
        buffs: [
            {
                type: "power_gauge_charge",
                value: 30, // %
                duration: "instant",
                target: "self",
                icon: "⚡",
                color: "#FFD700",
                description: "Charges Power Gauge by 30%"
            },
            {
                type: "ultimate_cooldown_reduction",
                value: 30, // seconds
                duration: "instant",
                target: "self",
                icon: "⏱️",
                color: "#ff6600",
                cooldown: 30, // seconds (propre cooldown de cet effet)
                description: "Reduces Ultimate Skill cooldown by 30 seconds"
            }
        ]
    }
},
    {
    class: "basicSkills",
    className: "crushing blow",
    element: "light",
    type: "break",
    used: 20,
    where: ["BoT"],
    name: "enlightned_break",
    src: "https://api.builderberu.com/cdn/images/rune_crushingblow_light_enlightenedbreak_break_y6siud.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 2322.34, // % of ATK
        scaling: "atk",
        damageType: "light"
    },
    breakDamage: "medium",
    cooldown: 10, // seconds
    mpCost: 92,
    
    effects: {
        debuffs: [
            {
                type: "airborne",
                trigger: "on_hit",
                target: "enemy",
                icon: "🌪️",
                color: "#FFD700"
            },
            {
                type: "light",
                duration: 30, // seconds
                target: "enemy",
                icon: "✨",
                color: "#FFFF00",
                dot: {
                    damage: 60, // % of ATK
                    interval: 3, // every 3 seconds
                },
                statReduction: {
                    attack: 20 // % reduction
                },
                description: "Deals 60% ATK damage every 3s and reduces Attack by 20%"
            }
        ]
    },
    
    codexBonus: {
        type: "skill_level_increase",
        skill: "crushing blow",
        value: 1,
        description: "Increases Crushing Blow skill level by 1 when registered in codex"
    }
},
   {
    class: "basicSkills",
    className: "crushing blow",
    element: "wind",
    type: "break",
    used: 20,
    where: ["BoT"],
    name: "chained break",
    src: "https://api.builderberu.com/cdn/images/rune_crushingblow_wind_chainedbreak_break_dzweph.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 3627.27, // % of ATK
        scaling: "atk",
        damageType: "wind"
    },
    breakDamage: "medium",
    cooldown: 10, // seconds
    mpCost: 92,
    
    effects: {
        debuffs: [
            {
                type: "knockdown",
                trigger: "final_hit",
                target: "enemy",
                icon: "⬇️",
                color: "#00ff00"
            }
        ],
        buffs: [
            {
                type: "attack_increase",
                value: 5, // % per stack
                duration: 12, // seconds
                target: "self",
                icon: "⚔️",
                color: "#90EE90",
                stackable: true,
                maxStacks: 4,
                description: "Increases Attack by 5% per hit (stacks up to 4 times)"
            },
            {
                type: "shield",
                value: 15, // % of Max HP
                duration: 3, // seconds
                target: "self",
                icon: "🛡️",
                color: "#00ff99",
                description: "Creates shield equal to 15% of Max HP"
            }
        ]
    },
    
    codexBonus: {
        type: "skill_level_increase",
        skill: "crushing blow",
        value: 3, // +3 niveaux !
        description: "Increases Crushing Blow skill level by 3 when registered in codex"
    }
},
    {
    class: "basicSkills",
    className: "cutting rush",
    element: "dark",
    type: "none",
    used: 20,
    where: ["BoT"],
    name: "sunder",
    src: "https://api.builderberu.com/cdn/images/rune_cuttingrush_dark_sunder_p17nek.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 4498.6, // % of ATK
        scaling: "atk",
        damageType: "dark"
    },
    cooldown: 15, // seconds
    mpCost: 177,
    
    effects: {
        debuffs: [
            {
                type: "airborne",
                trigger: "final_hit",
                target: "enemy",
                icon: "🌪️",
                color: "#8B00FF"
            }
        ],
        buffs: [
            {
                type: "invincible",
                duration: "skill_duration", // pendant l'animation
                target: "self",
                icon: "🛡️",
                color: "#4B0082",
                description: "Jinwoo becomes invincible while using this skill"
            },
            {
                type: "crit_rate_increase",
                value: 15, // %
                duration: 12, // seconds
                target: "self",
                icon: "💥",
                color: "#9932CC",
                description: "Increases Critical Hit Rate by 15%"
            }
        ]
    }
},
   {
    class: "basicSkills",
    className: "cutting rush",
    element: "none",
    type: "none",
    used: 20,
    where: ["BoT"],
    name: "effulgence",
    src: "https://api.builderberu.com/cdn/images/rune_cuttingrush_none_effulgence_psdeww.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 2221.63, // % of ATK
        scaling: "atk"
    },
    cooldown: 15, // seconds
    mpCost: 177,
    
    effects: {
        debuffs: [
            {
                type: "knockdown",
                trigger: "on_hit",
                target: "enemy",
                icon: "⬇️",
                color: "#808080"
            }
        ],
        buffs: [
            {
                type: "crit_damage_increase",
                value: 45, // %
                duration: 12, // seconds
                target: "self",
                icon: "💥",
                color: "#ff6b6b",
                description: "Increases Critical Hit Damage by 45%"
            }
        ],
        special: [
            {
                type: "cooldown_reset",
                trigger: "on_hit",
                cooldown: 15, // seconds (propre cooldown du reset)
                description: "Resets skill cooldown when it hits (15s cooldown on reset)"
            }
        ]
    }
},
    {
    class: "basicSkills",
    className: "cutting rush",
    element: "none",
    type: "none",
    used: 20,
    where: ["BoT"],
    name: "escalate",
    src: "https://api.builderberu.com/cdn/images/rune_cuttingrush_none_escalate_q1ojxy.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 1671.07, // % of ATK
        scaling: "atk"
    },
    cooldown: 10, // seconds
    mpCost: 118,
    
    effects: {
        debuffs: [
            {
                type: "airborne",
                trigger: "final_hit",
                target: "enemy",
                icon: "🌪️",
                color: "#808080"
            }
        ],
        special: [
            {
                type: "back_attack_crit",
                chance: 65, // %
                critBonus: 100, // % Critical Hit Rate
                duration: "next_attack",
                description: "65% chance to apply 100% Critical Hit Rate on next attack when landing a back attack"
            }
        ]
    },
    
    codexBonus: {
        type: "skill_level_increase",
        skill: "cutting rush",
        value: 3,
        description: "Increases Cutting Rush skill level by 3 when registered in codex"
    }
},
    {
    class: "basicSkills",
    className: "dagger rush",
    element: "dark",
    type: "break",
    used: 20,
    where: ["BoT"],
    name: "dispersion",
    src: "https://api.builderberu.com/cdn/images/rune_daggerrush_dark_dispersion_break_cvribn.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 2678.13, // % of ATK
        scaling: "atk",
        damageType: "dark"
    },
    breakDamage: "almighty", // Le plus haut niveau de break damage
    cooldown: 20, // seconds
    mpCost: 236,
    
    effects: {
        debuffs: [
            {
                type: "airborne",
                trigger: "on_hit",
                target: "enemy",
                icon: "🌪️",
                color: "#8B00FF"
            }
        ],
        synergies: [
            {
                condition: "enemy_no_break_gauge",
                effect: "skill_damage_increase",
                value: 280, // %
                duration: 7, // seconds
                skill: "dispersion",
                description: "Increases Dispersion damage by 280% against enemies without Break Gauge"
            }
        ]
    }
},
    {
    class: "basicSkills",
    className: "dagger rush",
    element: "fire",
    type: "break",
    used: 20,
    where: ["BoT"],
    name: "explosion",
    src: "https://api.builderberu.com/cdn/images/rune_daggerrush_fire_explosion_break_qkcsco.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 1351.9, // % of ATK (base damage)
        additionalDamage: 125, // % of ATK (dégâts additionnels)
        scaling: "atk",
        damageType: "fire"
    },
    breakDamage: "almighty",
    cooldown: 20, // seconds
    mpCost: 236,
    
    effects: {
        debuffs: [
            {
                type: "airborne",
                trigger: "final_hit",
                target: "enemy",
                icon: "🌪️",
                color: "#ff4444"
            }
        ],
        buffs: [
            {
                type: "shield",
                value: 60, // % of Max HP
                duration: 5, // seconds
                target: "self",
                icon: "🛡️",
                color: "#ff6600",
                description: "Creates shield equal to 60% of Max HP"
            }
        ]
    },
    
    codexBonus: {
        type: "skill_level_increase",
        skill: "dagger rush",
        value: 3,
        description: "Increases Dagger Rush skill level by 3 when registered in codex"
    }
},
   {
    class: "basicSkills",
    className: "dagger rush",
    element: "water",
    type: "break",
    used: 20,
    where: ["BoT"],
    name: "cold ice",
    src: "https://api.builderberu.com/cdn/images/rune_daggerrush_water_coldice_break_bhdhcr.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 1383.33, // % of ATK
        scaling: "atk",
        damageType: "water"
    },
    breakDamage: "almighty",
    cooldown: 20, // seconds
    mpCost: 236,
    
    effects: {
        debuffs: [
            {
                type: "frostbite",
                duration: 3, // seconds
                target: "enemy",
                icon: "❄️",
                color: "#00BFFF",
                dot: {
                    damage: 400, // % of ATK
                    interval: 3 // every 3 seconds
                },
                description: "Deals 400% ATK damage every 3 seconds"
            }
        ],
        buffs: [
            {
                type: "aoe_damage_increase",
                value: 12, // %
                range: 5, // meters
                duration: "permanent",
                target: "self",
                icon: "🎯",
                color: "#4169E1",
                description: "Increases damage dealt by 12% to targets within 5m range"
            }
        ]
    },
    
    codexBonus: {
        type: "skill_level_increase",
        skill: "dagger rush",
        value: 3,
        description: "Increases Dagger Rush skill level by 3 when registered in codex"
    }
},
    {
    class: "basicSkills",
    className: "dagger rush",
    element: "wind",
    type: "break",
    used: 20,
    where: ["BoT"],
    name: "breach",
    src: "https://api.builderberu.com/cdn/images/rune_daggerrush_wind_breach_break_smglsp.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 2185.67, // % of ATK
        scaling: "atk",
        damageType: "wind"
    },
    breakDamage: "heavy",
    cooldown: 20, // seconds
    mpCost: 236,
    
    effects: {
        debuffs: [
            {
                type: "airborne",
                trigger: "on_hit",
                target: "enemy",
                icon: "🌪️",
                color: "#00ff00"
            },
            {
                type: "knockdown",
                trigger: "final_hit",
                target: "enemy",
                icon: "⬇️",
                color: "#90EE90"
            },
            {
                type: "crit_damage_vulnerability",
                value: 2, // % per stack
                duration: 10, // seconds
                target: "enemy",
                icon: "💔",
                color: "#ff6b6b",
                stackable: true,
                maxStacks: 7,
                description: "Increases Critical Hit damage received by 2% per stack (up to 7 stacks)"
            }
        ],
        synergies: [
            {
                condition: "elemental_weakness",
                effect: "damage_increase",
                value: 50, // %
                description: "Damage increases by 50% when attacking enemies with their elemental weakness"
            }
        ]
    }
},
    {
    class: "basicSkills",
    className: "dagger toss",
    element: "fire",
    type: "none",
    used: 20,
    where: ["BoT"],
    name: "detonation",
    src: "https://api.builderberu.com/cdn/images/rune_daggertoss_fire_detonation_idz3id.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 766.37, // % of ATK per dagger
        scaling: "atk",
        damageType: "fire"
    },
    cooldown: 10, // seconds
    mpCost: 94,
    
    effects: {
        debuffs: [
            {
                type: "burn",
                value: 175, // % of ATK
                duration: "permanent", // Burn dure jusqu'à ce qu'il soit cleanse
                tickInterval: 3, // damage every 3 seconds
                target: "enemy",
                icon: "🔥",
                color: "#ff6600",
                stackable: true,
                maxStacks: 3,
                description: "Deals 175% ATK damage every 3 seconds (stacks up to 3 times)"
            }
        ]
    },
},
    
    {
    class: "basicSkills",
    className: "dagger toss",
    element: "none",
    type: "none",
    used: 20,
    where: ["BoT"],
    name: "ascension",
    src: "https://api.builderberu.com/cdn/images/rune_daggertoss_none_ascension_b4ezuo.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 2409.77, // % of ATK
        scaling: "atk"
    },
    cooldown: 10, // seconds
    mpCost: 94,
    
    effects: {
        synergies: [
            {
                condition: "target_in_break_state",
                effect: "damage_increase",
                value: 250, // %
                description: "Increases damage dealt to targets in Break state by 250%"
            }
        ]
    }
},
   {
    class: "basicSkills",
    className: "dagger toss",
    element: "none",
    type: "none",
    used: 20,
    where: ["BoT"],
    name: "bombardment",
    src: "https://api.builderberu.com/cdn/images/rune_daggertoss_none_ascension_b4ezuo.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 2409.77, // % of ATK
        scaling: "atk"
    },
    cooldown: 10, // seconds
    mpCost: 94,
    
    effects: {
        synergies: [
            {
                condition: "target_in_break_state",
                effect: "damage_increase",
                value: 250, // %
                description: "Increases damage dealt to targets in Break state by 250%"
            }
        ]
    }
},
   {
    class: "basicSkills",
    className: "dagger toss",
    element: "none",
    type: "none",
    used: 20,
    where: ["BoT"],
    name: "electric shock",
    src: "https://api.builderberu.com/cdn/images/rune_daggertoss_none_ascension_b4ezuo.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 2409.77, // % of ATK
        scaling: "atk"
    },
    cooldown: 10, // seconds
    mpCost: 94,
    
    effects: {
        synergies: [
            {
                condition: "target_in_break_state",
                effect: "damage_increase",
                value: 250, // %
                description: "Increases damage dealt to targets in Break state by 250%"
            }
        ]
    }
},
    
    {
    class: "death",
    className: "death",
    element: "none",
    type: "none",
    used: 20,
    where: ["BoT"],
    name: "extinction",
    src: "https://api.builderberu.com/cdn/images/rune_death_none_extinction_mjrgkb.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 3189.97, // % of ATK
        scaling: "atk"
    },
    cooldown: 25, // seconds
    mpCost: 0, // Les Death skills n'ont généralement pas de coût MP
    
    conditions: {
        trigger: "airborne_success", // Nécessite un airborne réussi
        description: "Usage Condition: Successfully landing an Airborne attack"
    },
    
    effects: {
        debuffs: [
            {
                type: "airborne",
                trigger: "on_hit",
                target: "enemy",
                icon: "🌪️",
                color: "#808080"
            },
            {
                type: "attack_decrease",
                value: 45, // %
                duration: 15, // seconds
                target: "enemy",
                icon: "⚔️❌",
                color: "#ff4444",
                description: "Decreases target's Attack by 45%"
            }
        ]
    }
},
    {
    class: "death",
    className: "death",
    element: "none",
    type: "none",
    used: 20,
    where: ["BoT"],
    name: "overshadow",
    src: "https://api.builderberu.com/cdn/images/rune_death_none_overshadow_qjbrnv.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 2891.17, // % of ATK
        scaling: "atk"
    },
    cooldown: 25, // seconds
    mpCost: 0,
    
    conditions: {
        trigger: "airborne_success",
        description: "Usage Condition: Successfully landing an Airborne attack"
    },
    
    effects: {
        debuffs: [
            {
                type: "airborne",
                trigger: "on_hit",
                target: "enemy",
                icon: "🌪️",
                color: "#808080"
            }
        ],
        buffs: [
            {
                type: "skill_damage_increase",
                value: 230, // %
                duration: "permanent",
                target: "self",
                icon: "⚔️",
                color: "#8B00FF",
                cost: {
                    type: "current_hp",
                    value: 15 // % of current HP
                },
                description: "Consumes 15% of current HP to increase skill damage by 230%"
            }
        ]
    }
},
    {
    class: "death",
    className: "death",
    element: "none",
    type: "break",
    used: 20,
    where: ["BoT"],
    name: "squall",
    src: "https://api.builderberu.com/cdn/images/rune_death_none_squall_break_pk88ku.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 2943.73, // % of ATK
        scaling: "atk"
    },
    breakDamage: "medium",
    cooldown: 25, // seconds
    mpCost: 0,
    
    conditions: {
        trigger: "airborne_success",
        description: "Usage Condition: Successfully landing an Airborne attack"
    },
    
    effects: {
        debuffs: [
            {
                type: "airborne",
                trigger: "on_hit",
                target: "enemy",
                icon: "🌪️",
                color: "#808080"
            },
            {
                type: "knockdown",
                trigger: "final_hit_success",
                target: "enemy",
                icon: "⬇️",
                color: "#808080"
            },
            {
                type: "corrosion",
                value: 14, // % increase to Break effectiveness
                duration: 8, // seconds
                target: "enemy",
                icon: "🧪",
                color: "#00ff99",
                description: "Increases Break effectiveness by 14%"
            }
        ]
    }
},
    {
    class: "death",
    className: "death",
    element: "water",
    type: "none",
    used: 20,
    where: ["BoT"],
    name: "ice strike",
    src: "https://api.builderberu.com/cdn/images/rune_death_water_icestrike_akqtek.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 3297.87, // % of ATK
        scaling: "atk",
        damageType: "water"
    },
    cooldown: 25, // seconds
    mpCost: 0,
    
    conditions: {
        trigger: "airborne_success",
        description: "Usage Condition: Successfully landing an Airborne attack"
    },
    
    effects: {
        debuffs: [
            {
                type: "airborne",
                trigger: "on_hit",
                target: "enemy",
                icon: "🌪️",
                color: "#00BFFF"
            },
            {
                type: "freeze",
                duration: 2, // durée typique d'un freeze
                target: "enemy",
                icon: "🧊",
                color: "#00BFFF",
                description: "Freezes the target"
            }
        ],
        synergies: [
            {
                condition: "target_has_freeze",
                effect: "damage_increase",
                value: 150, // %
                description: "Increases damage dealt to frozen targets by 150%"
            }
        ]
    }
},
    {
    class: "basicSkills",
    className: "death's dance",
    element: "dark",
    type: "break",
    used: 20,
    where: ["BoT"],
    name: "eruption",
    src: "https://api.builderberu.com/cdn/images/rune_deathsdance_dark_eruption_break_jfraez.webp",
    
    // Nouvelles propriétés
    damage: {
        base: 4401.77, // % of ATK
        scaling: "atk",
        damageType: "dark"
    },
    breakDamage: "heavy",
    cooldown: 15, // seconds
    mpCost: 177,
    
    effects: {
        debuffs: [
            {
                type: "airborne",
                trigger: "final_hit",
                target: "enemy",
                icon: "🌪️",
                color: "#8B00FF"
            }
        ],
        synergies: [
            {
                condition: "target_is_boss_or_elite",
                effect: "damage_increase",
                value: 145, // %
                description: "Damage dealt to Bosses and Elite Monsters increases by 145%"
            }
        ]
    }
},
    {
        class: "basicSkills",
        className: "death's dance",
        element: "fire",
        type: "break",
        used: 20,
        where: ["BoT"],
        name: "wild fire",
        src: "https://api.builderberu.com/cdn/images/rune_deathsdance_fire_wildfire_break_m0glal.webp",
    },
    {
        class: "basicSkills",
        className: "death's dance",
        element: "light",
        type: "break",
        used: 20,
        where: ["BoT"],
        name: "earth shock",
        src: "https://api.builderberu.com/cdn/images/rune_deathsdance_light_earthshock_break_qt1hhv.webp",
    },
    {
        class: "basicSkills",
        className: "death's dance",
        element: "wind",
        type: "break",
        used: 20,
        where: ["BoT"],
        name: "high-speed rotation",
        src: "https://api.builderberu.com/cdn/images/rune_deathsdance_wind_highspeedrotation_break_l3okpl.webp",
    },
    {
        class: "basicSkills",
        className: "double slash",
        element: "none",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "full moon wheel",
        src: "https://api.builderberu.com/cdn/images/rune_doubleslash__noine_fullmoonwheel_xkfacv.webp",
    },
    {
        class: "basicSkills",
        className: "double slash",
        element: "fire",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "flame slash",
        src: "https://api.builderberu.com/cdn/images/rune_doubleslash_fire_flameslash_uyzvug.webp",
    },
    {
        class: "basicSkills",
        className: "double slash",
        element: "none",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "multiply",
        src: "https://api.builderberu.com/cdn/images/rune_doubleslash_none_multiply_lluqxx.webp",
    },
    {
        class: "basicSkills",
        className: "double slash",
        element: "wind",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "whirlwind rush",
        src: "https://api.builderberu.com/cdn/images/rune_doubleslash_wind_whirlwindrush_qcjnbb.webp",
    },
    {
        class: "basicSkills",
        className: "multistrike",
        element: "water",
        type: "break",
        used: 20,
        where: ["BoT"],
        name: "rush",
        src: "https://api.builderberu.com/cdn/images/rune_multistrike_water_rush_break_qy5xgx.webp",
    },
    {
        class: "basicSkills",
        className: "multistrike",
        element: "dark",
        type: "break",
        used: 20,
        where: ["BoT"],
        name: "illusion",
        src: "https://api.builderberu.com/cdn/images/rune_multistrike_dark_illusion_break_ihszzd.webp",
    },
    {
        class: "basicSkills",
        className: "multistrike",
        element: "fire",
        type: "break",
        used: 20,
        where: ["BoT"],
        name: "percussion",
        src: "https://api.builderberu.com/cdn/images/rune_multistrike_fire_percussion_break_ppclp9.webp",
    },
    {
        class: "basicSkills",
        className: "multistrike",
        element: "light",
        type: "break",
        used: 20,
        where: ["BoT"],
        name: "pummel",
        src: "https://api.builderberu.com/cdn/images/rune_multistrike_light_pummel_break_zdzwdg.webp",
    },
    {
        class: "basicSkills",
        className: "mutilate",
        element: "dark",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "stroke of lightning",
        src: "https://api.builderberu.com/cdn/images/rune_mutilate_dark_strokeoflightning_k9epuu.webp",
    },
    {
        class: "basicSkills",
        className: "mutilate",
        element: "none",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "phantom",
        src: "https://api.builderberu.com/cdn/images/rune_mutilate_none_phantom_arzy2b.webp",
    },
    {
        class: "basicSkills",
        className: "mutilate",
        element: "none",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "strike",
        src: "https://api.builderberu.com/cdn/images/rune_mutilate_none_strike_qh90s1.webp",
    },
    {
        class: "basicSkills",
        className: "mutilate",
        element: "water",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "coldstorm",
        src: "https://api.builderberu.com/cdn/images/rune_mutilate_water_coldstorm_vje8oc.webp",
    },
    {
        class: "basicSkills",
        className: "sonic stream",
        element: "dark",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "magnifying slashes",
        src: "https://api.builderberu.com/cdn/images/rune_sonicstream_dark_magnifyingslashes_ffjeje.webp",
    },
    {
        class: "basicSkills",
        className: "sonic stream",
        element: "fire",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "sonic explosion",
        src: "https://api.builderberu.com/cdn/images/rune_sonicstream_fire_sonicexplosion_nw1eeh.webp",
    },
    {
        class: "basicSkills",
        className: "sonic stream",
        element: "light",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "double down",
        src: "https://api.builderberu.com/cdn/images/rune_sonicstream_light_doubledown_josnj1.webp",
    },
    {
        class: "basicSkills",
        className: "sonic stream",
        element: "wind",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "wind shroud",
        src: "https://api.builderberu.com/cdn/images/rune_sonicstream_wind_windshroud_ceigoo.webp",
    },
    {
        class: "basicSkills",
        className: "the commander's touch",
        element: "none",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "absorption",
        src: "https://api.builderberu.com/cdn/images/rune_thecommanderstouch_none_absorption_hcrqhx.webp",
    },
    {
        class: "basicSkills",
        className: "the commander's touch",
        element: "none",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "black hole",
        src: "https://api.builderberu.com/cdn/images/rune_thecommanderstouch_none_blackhole_fzjt9h.webp",
    },
    {
        class: "basicSkills",
        className: "the commander's touch",
        element: "none",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "finisher",
        src: "https://api.builderberu.com/cdn/images/rune_thecommanderstouch_none_finisher_hxkaia.webp",
    },
    {
        class: "basicSkills",
        className: "the commander's touch",
        element: "none",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "liberation",
        src: "https://api.builderberu.com/cdn/images/rune_thecommanderstouch_none_liberation_csz0a0.webp",
    },
    {
        class: "basicSkills",
        className: "vertical art",
        element: "fire",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "crosshairs",
        src: "https://api.builderberu.com/cdn/images/rune_verticalart_fire_crosshairs_bnzjbm.webp",
    },
    {
        class: "basicSkills",
        className: "vertical art",
        element: "dark",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "reap",
        src: "https://api.builderberu.com/cdn/images/rune_verticalart_dark_reap_b95yia.webp",
    },
    {
        class: "basicSkills",
        className: "vertical art",
        element: "water",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "sequent explosion",
        src: "https://api.builderberu.com/cdn/images/rune_verticalart_water_sequentexplosions_x2k9zl.webp",
    },
    {
        class: "basicSkills",
        className: "vertical art",
        element: "wind",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "wind gale",
        src: "https://api.builderberu.com/cdn/images/rune_verticalart_wind_gale_xgjrgs.webp",
    },
    {
        class: "basicSkills",
        className: "vital strike",
        element: "none",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "decimate",
        src: "https://api.builderberu.com/cdn/images/rune_vitalstrike_none_decimate_b870yh.webp",
    },
    {
        class: "basicSkills",
        className: "vital strike",
        element: "none",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "hone in",
        src: "https://api.builderberu.com/cdn/images/rune_vitalstrike_none_honein_f8pr6j.webp",
    },
    {
        class: "basicSkills",
        className: "vital strike",
        element: "none",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "internal wound",
        src: "https://api.builderberu.com/cdn/images/rune_vitalstrike_none_internalwound_fspsz7.webp",
    },
    {
        class: "basicSkills",
        className: "vital strike",
        element: "water",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "on point",
        src: "https://api.builderberu.com/cdn/images/rune_vitalstrike_water_onpoint_rdvyho.webp",
    },

];

export const blessingStonesData = [
    {

        class: "bessingstone",
        type: "offensive",
        name: "advanced dagger technique",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_offensive_advanceddaggertechnique_y6dlbs.webp",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "assasin's proficiency",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_offensive_assassinsproficiency_l6bgcd.webp",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "bloodlust",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_offensive_bloodlust_mahcl9.webp",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "boss slayer",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_offensive_bossslayer_i1fygg.webp",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "chains of blood",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_offensive_chainsofblood_ufpvag.webp",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "crushing attack",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_offensive_crushingattack_njjnlv.webp",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "desire",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_offensive_desire_nrihcy.webp",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "double edge sword",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_offensive_doubleedgedsword_jxiz6e.webp",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "fatal strike",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_offensive_fatalstrike_zqignl.webp",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "first strike barrage",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_offensive_firststrikebarrage_rfk7g0.webp",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "intuit",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_offensive_intuit_u0ijck.webp",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "irresistible force",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_offensive_irresistibleforce_mw1hhf.webp",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "lightning speed",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_offensive_lightningspeed_qrqawd.webp",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "monarch's domain",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_offensive_monarchsdomain_qwky6d.webp",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "pulverize",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_offensive_pulverize_xj91j2.webp",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "reawakening",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_offensive_reawakening_zo5hpm.webp",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "sandbag",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_offensive_sandbag_nsvmez.webp",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "sharp perception",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_offensive_sharpperception_ublxx7.webp",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "speed",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_offensive_speed_mznzso.webp",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "swiftness",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_offensive_swiftness_a9wc0x.webp",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "swift strike",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_offensive_swiftstrike_snbouy.webp",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "title : wolf assassin",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_offensive_titlewolfassassin_tqemup.webp",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "title : conquer of adversity",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_offensive_titleconquerorofadversity_untgji.webp",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "title : demon slayer",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_offensive_tittledemonslayer_xvyuqe.webp",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "weakness detection",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_offensive_weaknessdetection_oqnf7n.webp",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "we are one",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_offensive_weareone_djc5nd.webp",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "aggresive defense",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_defensive_aggresivedefense_yccura.webp",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "best defense is a good offense",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_defensive_bestdefenseisagoodoffense_qqvxna.webp",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "camouflage",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_defensive_camouflage_o4vi6j.webp",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "daily quest completion",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_defensive_dailyquestcompletion_ftrwex.webp",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "HP extraction",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_defensive_hpextraction_omxba4.webp",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "irreversible road",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_defensive_irreversibleroad_beqx5o.webp",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "kandiaru's blessing",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_defensive_kandiarusblessing_cujr5i.webp",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "kasaka's steel scales",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_defensive_kasakassteelscales_mcvqv6.webp",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "life",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_defensive_life_cs9xwm.webp",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "manapower shield",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_defensive_manapoweredshield_tgjkvn.webp",

    },
    {
        class: "bessingstone",
        type: "offensive",
        name: "mana rampage",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_offensive_manarampage_xuor2j.webp",

    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "natural disaster",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_defensive_naturaldisaster_gm3eul.webp",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "penalty quest completion",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_defensive_penaltyquestsurvival_msghla.webp",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "ravenous instinct",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_defensive_ravenousinstinct_strsvn.webp",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "defensive ravenous",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_defensive_ravenousinstinct_strsvn.webp",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "defensive solidify",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_defensive_solidify_spndee.webp",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "swift restoration",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_defensive_swiftsestoration_wwykco.webp",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "tenacity",
        used: 20,
        where: ["BoT"],
        src: "https://api.builderberu.com/cdn/images/blessingstones_defensive_tenacity_r1kjpx.webp",
    },
]

export const shadowData = [
    {
        name: "Beru",
        src: "https://api.builderberu.com/cdn/images/shadow_.beru_x9dhhy.webp",
    },
    {
        name: "Beste",
        src: "https://api.builderberu.com/cdn/images/shadow_.beste_uc5d45.webp",
    },
    {
        name: "Bigrock",
        src: "https://api.builderberu.com/cdn/images/shadow_.bigrock_fmh4ek.webp",
    },
    {
        name: "Blades",
        src: "https://api.builderberu.com/cdn/images/shadow_.blades_cwtpos.webp",
    },
    {
        name: "Cerbie",
        src: "https://api.builderberu.com/cdn/images/shadow_.cerbie_2_ddaie8.webp",
    },
    {
        name: "Iron",
        src: "https://api.builderberu.com/cdn/images/shadow_.iron_yrycrl.webp",
    },
    {
        name: "Kaisel",
        src: "https://api.builderberu.com/cdn/images/shadow_.kaisel_jc7ayt.webp",
    },
    {
        name: "Tank",
        src: "https://api.builderberu.com/cdn/images/shadow_.tank_wydj5h.webp",
    },
    {
        name: "Tusk",
        src: "https://api.builderberu.com/cdn/images/shadow_.tusk_z8a5sc.webp",
    },
    {
        name: "Igris",
        src: "https://api.builderberu.com/cdn/images/shadow_igris_wgtcdl.webp",
    },
    {
        name: "Skull",
        src: "https://api.builderberu.com/cdn/images/skull_fz8lga.webp",
    }

]

export const artifactData = [{
    set: "Angel White",
    side: "L",
    src: "https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp"
},
{
    set: "Warmonger",
    side: "L",
    src: "https://api.builderberu.com/cdn/images/artifact_warmonger_4L_j7jveq.webp"
},
{
    set: "Solid Foundation",
    side: "L",
    src: "https://api.builderberu.com/cdn/images/artifact_solidFoundation_4L_o8t6aw.webp"
}, {
    set: "Toughness",
    side: "L",
    src: "https://api.builderberu.com/cdn/images/artifact_toughness_4L_pnbyxv.webp"
}, {
    set: "Sylph's Blessing",
    side: "R",
    src: "https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp"
}, {
    set: "Solid Analysis",
    side: "L",
    src: "https://api.builderberu.com/cdn/images/artifact_solidAnalysis_4L_inamfg.webp"
}, {
    set: "Shining Star",
    side: "R",
    src: "https://api.builderberu.com/cdn/images/artifact_shiningStar_4R_x3wslj.webp"
}, {
    set: "Ouststanding Connection",
    side: "R",
    src: "https://api.builderberu.com/cdn/images/artifact_OuststandingConnection__4R_qm7pjh.webp"
}, {
    set: "NobleSacrifice",
    side: "L",
    src: "https://api.builderberu.com/cdn/images/artifact_nobleISacrifice_4L_eylhm0.webp"
}, {
    set: "Outstanding Ability",
    side: "R",
    src: "https://api.builderberu.com/cdn/images/artifact_outstandingAbility_4R_rqmjla.webp"
}, {
    set: "One Hit-kill",
    side: "L",
    src: "https://api.builderberu.com/cdn/images/artifact_oneHitKill_4L_l4jrpl.webp"
}, {
    set: "Guardian",
    side: "L",
    src: "https://api.builderberu.com/cdn/images/artifact_guardian_4L_bsxkjl.webp"
}, {
    set: "Iron Will",
    side: "L",
    src: "https://api.builderberu.com/cdn/images/artifact_ironWill_4L_gczimo.webp"
}, {
    set: "Expert",
    side: "R",
    src: "https://api.builderberu.com/cdn/images/artifact_Expert_4R_wbxgfe.webp"
}, {
    set: "Executionner",
    side: "R",
    src: "https://api.builderberu.com/cdn/images/artifact_executionner_4R_c9btj1.webp"
}, {
    set: "Destroyer",
    side: "L",
    src: "https://api.builderberu.com/cdn/images/artifact_destroyer_4L_owtfbl.webp"
}, {
    set: "Destructive Instinct",
    side: "R",
    src: "https://api.builderberu.com/cdn/images/artifact_destructiveInstinct_4R_oxto9g.webp"
}, {
    set: "Concentration Of Firepower",
    side: "R",
    src: "https://api.builderberu.com/cdn/images/artifact_concentrationOfFirepower_4R_i5iovw.webp"
}, {
    set: "Chaotic Wish",
    side: "R",
    src: "https://api.builderberu.com/cdn/images/artifact_chaoticWish_4R_qqtor2.webp"
}, {
    set: "Chaotic Infamy",
    side: "R",
    src: "https://api.builderberu.com/cdn/images/artifact_ChaoticInfamy_8R_j2zmy5.webp"
}, {
    set: "Chaotic Infamy",
    side: "L",
    src: "https://api.builderberu.com/cdn/images/artifact_chaoticInfamy_8L_o2es9k.webp"
}, {
    set: "Chaotic Desire",
    side: "R",
    src: "https://api.builderberu.com/cdn/images/artifact_chaoticDesire_8R_hu0hex.webp"
},
{
    set: "Chaotic Desire",
    side: "L",
    src: "https://api.builderberu.com/cdn/images/artifact_chaoticDesire_8L_ghkvum.webp"
},
{
    set: "Chaotic Wish",
    side: "L",
    src: "https://api.builderberu.com/cdn/images/artifact_chaosWish_8L_wspayx.webp"
},
{
    set: "Champion On The Field",
    side: "R",
    src: "https://api.builderberu.com/cdn/images/artifact_championOnTheField_4R_wtnphf.webp"
},
{
    set: "Burning Greed",
    side: "R",
    src: "https://api.builderberu.com/cdn/images/artifact_burningGreed_8R_oc70gz.webp"
},
{
    set: "Burning Greed",
    side: "L",
    src: "https://api.builderberu.com/cdn/images/artifact_burningGreed_8L_r8lrve.webp"
},
{
    set: "Burning Curse",
    side: "L",
    src: "https://api.builderberu.com/cdn/images/artifact_burningCurse_8L_l98rff.webp"
},
{
    set: "Burning Curse",
    side: "R",
    src: "https://api.builderberu.com/cdn/images/artifact_burningCurse_8R_soemzs.webp"
},
{
    set: "Burning Blessing",
    side: "L",
    src: "https://api.builderberu.com/cdn/images/artifact_BurningBlessing_8L_sppyfn.webp"
},
{
    set: "Berserker",
    side: "R",
    src: "https://api.builderberu.com/cdn/images/artifact_berseker_4R_dgh2zx.webp"
},
{
    set: "Burning Blessing",
    side: "R",
    src: "https://api.builderberu.com/cdn/images/artifact_burningBlessing_8R_fhwx7x.webp"
},
{
    set: "Armed",
    side: "L",
    src: "https://api.builderberu.com/cdn/images/artifact_Armed_4L_tt2gbd.webp"
},



]

export const coresData = [
    {
        type: "Defensive",
        set: "Crimpson Apex",
        name: "Desires of the Cirmpson Apex",
        src: "https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp"
    },
    {
        type: "Defensive",
        set: "Ancient Wraiths",
        name: "Ancien Wraiths Right Hand",
        src: "https://api.builderberu.com/cdn/images/Defensive_AncientWraiths_AncienWraithsRightHand_y3hhma.webp"
    }, {
        type: "Offensive",
        set: "Watcher",
        name: "Watcher Eyes Of The Watcher",
        src: "https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp"
    }, {
        type: "Offensive",
        set: "Crimpson Apex",
        name: "Hunger of the Cirmpson_Apex",
        src: "https://api.builderberu.com/cdn/images/Offensive_CrimpsonApex_Hunger_of_the_Cirmpson_Apex_mhqpnr.webp"
    }, {
        type: "Offensive",
        set: "Nameless",
        name: "Nameless Demons Deception",
        src: "https://api.builderberu.com/cdn/images/Offensive_Nameless_NamelessDemonsDeception_rosvql.webp"
    }, {
        type: "Offensive",
        set: "Ancient Wraiths",
        name: "Ancien Wraiths Obsession",
        src: "https://api.builderberu.com/cdn/images/Offensive_AncientWraiths_AncienWraiths_Obsession_yyqgrr.webp"
    }, {
        type: "Endurance",
        set: "Nameless",
        name: "Nameless Demons Magisphere",
        src: "https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp"
    }, {
        type: "Endurance",
        set: "Watcher",
        name: "Teeth Of The Watcher",
        src: "https://api.builderberu.com/cdn/images/Endurance_Watcher_TeethOfTheWatcher_h8qil3.webp"
    }, {
        type: "Endurance",
        set: "Crimpson Apex",
        name: "Punishement of the Cirmpson Apex",
        src: "https://api.builderberu.com/cdn/images/Endurance_CrimpsonApex_Punishement_of_the_Cirmpson_Apex_k2rotj.webp"
    }, {
        type: "Endurance",
        set: "Ancient Wraiths",
        name: "Ancien Wraiths Mana Power",
        src: "https://api.builderberu.com/cdn/images/Endurance_AncientWraiths_AncienWraithsManaPower_kzlhnr.webp"
    }, {
        type: "Defensive",
        set: "Watcher",
        name: "Limbs Of The Watcher",
        src: "https://api.builderberu.com/cdn/images/Defensive_Watcher_LimbsOfTheWatcher_ol4g8q.webp"
    }, {
        type: "Defensive",
        set: "Nameless",
        name: "Nameless Demons Horn",
        src: "https://api.builderberu.com/cdn/images/Defensive_Nameless_NamelessDemonsHorn_sgwmow.webp"
    },
]


export const sungData = [
    {
        name: 'Sung',
        img: '',
        icon: '',
        grade: 'SSR',
        scaleStat: 'Attack',
        importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Burning Curse', src: 'https://api.builderberu.com/cdn/images/artifact_burningCurse_8L_l98rff.webp', amount: 4 }],
                rightArtifact: [{ name: "Expert", src: 'https://api.builderberu.com/cdn/images/artifact_Expert_4R_wbxgfe.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    }
]


export const characters = [
    {

        name: 'ilhwan',
        img: 'https://api.builderberu.com/cdn/images/ilhwan_uncoloried_uzywyu-removebg-preview_t87rro.webp',
        icon: 'https://api.builderberu.com/cdn/images/ilhwan_uncoloried_uzywyu-removebg-preview_t87rro.webp',
        class: 'Assassin',
        grade: 'SSR',
        element: 'Dark',
        scaleStat: 'Atk',
        importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {

        name: 'Minnie',
        img: 'https://api.builderberu.com/cdn/images/Minnie_bcfolv.webp',
        icon: 'https://api.builderberu.com/cdn/images/Minnie_bcfolv.webp',
        class: 'Assassin',
        grade: 'SSR',
        element: 'Dark',
        scaleStat: 'Defense',
        importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {

        name: 'Soyeon',
        img: 'https://api.builderberu.com/cdn/images/soyeon_fstvg4.webp',
        icon: 'https://api.builderberu.com/cdn/images/soyeon_fstvg4.webp',
        class: 'Tank',
        grade: 'SSR',
        element: 'Wind',
        scaleStat: 'Attack',
        importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {

        name: 'Yuqi',
        img: 'https://api.builderberu.com/cdn/images/yuki_dqefqm.webp',
        icon: 'https://api.builderberu.com/cdn/images/yuki_dqefqm.webp',
        class: 'Tank',
        grade: 'SSR',
        element: 'Fire',
        scaleStat: 'HP',
        importantStats:['hp', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {

        name: 'Jinah',
        img: 'https://api.builderberu.com/cdn/images/jinah_vrbddm.webp',
        icon: 'https://api.builderberu.com/cdn/images/jinah_icon_pfdee6.webp',
        class: 'Support',
        grade: 'SSR',
        element: 'Wind',
        scaleStat: 'Defense',
        importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    }
    ,
    {

        name: 'Miyeon',
        img: 'https://api.builderberu.com/cdn/images/miyeon_ijwudx.webp',
        icon: 'https://api.builderberu.com/cdn/images/miyeon_ijwudx.webp',
        class: 'Fighter',
        grade: 'SSR',
        element: 'Light',
        scaleStat: 'Defense',
        importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    }
    ,
    {

        name: 'Shuhua',
        img: 'https://api.builderberu.com/cdn/images/Shuhua1_difnjb.webp',
        icon: 'https://api.builderberu.com/cdn/images/IconShuhua_njc2f2.webp',
        class: 'Assassin',
        grade: 'SSR',
        element: 'Water',
        scaleStat: 'Attack',
        importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    }
    ,
    {

        name: 'Lennart Niermann',
        img: 'https://api.builderberu.com/cdn/images/niermann_arxjer.webp',
        icon: 'https://api.builderberu.com/cdn/images/build-niermann_phfwmu.webp',
        class: 'Fighter',
        grade: 'SSR',
        element: 'Wind',
        scaleStat: 'Defense',
        importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    }
    ,



    {
        name: 'Cha Hae-In Valkyrie',
        img: 'https://api.builderberu.com/cdn/images/chae_mlnz8k.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-3.webp',
        class: 'Fighter',
        grade: 'SSR',
        element: 'Water',
        scaleStat: 'Defense',
        importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    }
    ,
    {
        name: 'Tawata Kanae',
        img: 'https://api.builderberu.com/cdn/images/kanae_squvh2.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-18.webp',
        class: 'Assassin',
        grade: 'SSR',
        element: 'Fire',
        scaleStat: 'Attack',
        importantStats:['atk', 'tc', 'dcc', 'defPen', 'di', 'mpcr', 'mpa'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Frieren',
        img: 'https://api.builderberu.com/cdn/images/frieren_portrait_jtvtcd.webp',
        icon: 'https://api.builderberu.com/cdn/images/frieren_portrait_jtvtcd.webp',
        class: 'Support',
        grade: 'SSR',
        element: 'Water',
        scaleStat: 'Defense',
        importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Guardian', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Guardian', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Guardian', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Alicia Blanche',
        img: 'https://api.builderberu.com/cdn/images/alicia_fzpzkf.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build.webp',
        class: 'Mage',
        grade: 'SSR',
        element: 'Water',
        scaleStat: 'Attack',
        scaleStat: 'Attack',importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Amamiya Mirei',
        img: 'https://api.builderberu.com/cdn/images/mirei_nb6arm.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-26.webp',
        class: 'Assassin',
        grade: 'SSR',
        element: 'Wind',
        scaleStat: 'Attack',
        importantStats:['atk', 'tc', 'dcc', 'defPen', 'di', 'mpcr', 'mpa'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Baek Yoonho',
        img: 'https://api.builderberu.com/cdn/images/baek_tgrbx8.webp',
        icon: 'https://api.builderberu.com/cdn/images/build_baek_wwcvhp.webp',
        class: 'Tank',
        grade: 'SSR',
        element: 'Light',
        scaleStat: 'Defense',
        importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Cha Hae In',
        img: 'https://api.builderberu.com/cdn/images/chae-in_zafver.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-4.webp',
        class: 'Fighter',
        grade: 'SSR',
        element: 'Light',
        scaleStat: 'Attack',
        importantStats:['atk', 'tc', 'dcc', 'defPen', 'di', 'mpcr', 'mpa'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Charlotte',
        img: 'https://api.builderberu.com/cdn/images/charlotte_bbsqv1.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-5.webp',
        class: 'Mage',
        grade: 'SSR',
        element: 'Dark',
        scaleStat: 'Defense',
        importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
    },
    {
        name: 'Choi Jong-In',
        img: 'https://api.builderberu.com/cdn/images/choi_a4k5sl.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-6.webp',
        class: 'Mage',
        grade: 'SSR',
        element: 'Fire',
        scaleStat: 'Attack',
        importantStats:['atk', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Emma Laurent',
        img: 'https://api.builderberu.com/cdn/images/emma_vvw5lt.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-7.webp',
        class: 'Tank',
        grade: 'SSR',
        element: 'Fire',
        scaleStat: 'HP',
        importantStats:['hp', 'tc', 'dcc', 'defPen', 'di', 'mpcr'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Esil Radiru',
        img: 'https://api.builderberu.com/cdn/images/esil_bjzrv2.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-8.webp',
        class: 'Ranger',
        grade: 'SSR',
        element: 'Fire',
        scaleStat: 'Attack',
        importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Gina',
        img: 'https://api.builderberu.com/cdn/images/gina_emzlpd.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-9.webp',
        class: 'Support',
        grade: 'SSR',
        element: 'Fire',
        scaleStat: 'Attack',
        importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Go Gunhee',
        img: 'https://api.builderberu.com/cdn/images/go_e5tq0a.webp',
        icon: 'build_go.png',
        class: 'Tank',
        grade: 'SSR',
        element: 'Light',
        scaleStat: 'Defense',
        importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Goto Ryuji',
        img: 'https://api.builderberu.com/cdn/images/goto_pirfgy.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-10.webp',
        class: 'Tank',
        grade: 'SSR',
        element: 'Wind',
        scaleStat: 'HP',
        importantStats:['hp', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Han Se-Mi',
        img: 'https://api.builderberu.com/cdn/images/han_pfyz7e.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-12.webp',
        class: 'Healer',
        grade: 'SSR',
        element: 'Wind',
        scaleStat: 'HP',
        importantStats:['hp', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Harper',
        img: 'https://api.builderberu.com/cdn/images/harper_fvn1d9.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-14.webp',
        class: 'Tank',
        grade: 'SSR',
        element: 'Dark',
        scaleStat: 'HP',
        importantStats:['hp', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Hwang Dongsoo',
        img: 'https://api.builderberu.com/cdn/images/Hwang_wumgnp.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-15.webp',
        class: 'Fighter',
        grade: 'SSR',
        element: 'Wind',
        scaleStat: 'Defense',
        importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Isla Wright',
        img: 'https://api.builderberu.com/cdn/images/isla_w9mnlc.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-17.webp',
        class: 'Healer',
        grade: 'SSR',
        element: 'Dark',
        scaleStat: 'Defense',
        importantStats:['def', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Lee Bora',
        img: 'https://api.builderberu.com/cdn/images/lee_khjilr.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-21.webp',
        class: 'Mage',
        grade: 'SSR',
        element: 'Dark',
        scaleStat: 'Attack',
        importantStats:['atk', 'tc', 'dcc', 'defPen', 'di', 'mpcr'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Lim Tae-Gyu',
        img: 'https://api.builderberu.com/cdn/images/lim_gahgsq.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-23.webp',
        class: 'Ranger',
        grade: 'SSR',
        element: 'Dark',
        scaleStat: 'Attack',
        importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Meilin Fisher',
        img: 'https://api.builderberu.com/cdn/images/meilin_k17bnw.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-24.webp',
        class: 'Healer',
        grade: 'SSR',
        element: 'Water',
        scaleStat: 'HP',
        importantStats:['hp', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Min Byung-Gu',
        img: 'https://api.builderberu.com/cdn/images/min_tw1eio.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-25.webp',
        class: 'Healer',
        grade: 'SSR',
        element: 'Light',
        scaleStat: 'HP',
        importantStats:['hp', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Seo Jiwoo',
        img: 'https://api.builderberu.com/cdn/images/seo_qsvfhj.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-30.webp',
        class: 'Tank',
        grade: 'SSR',
        element: 'Water',
        importantStats:['hp', 'tc', 'dcc', 'defPen', 'di'],
        scaleStat: 'HP', presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Seorin',
        img: 'https://api.builderberu.com/cdn/images/seorin_t7irtj.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-31.webp',
        class: 'Ranger',
        grade: 'SSR',
        element: 'Water',
        scaleStat: 'HP',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Shimizu Akari',
        img: 'https://api.builderberu.com/cdn/images/shimizu_a3devg.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-32.webp',
        class: 'Healer',
        grade: 'SSR',
        element: 'Light',
        scaleStat: 'HP',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Silver Mane Baek Yoonho',
        img: 'https://api.builderberu.com/cdn/images/silverbaek_kg7wuz.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-33.webp',
        class: 'Fighter',
        grade: 'SSR',
        element: 'Dark',
        scaleStat: 'Attack'
    },
    {
        name: 'Thomas Andre',
        img: 'https://api.builderberu.com/cdn/images/thomas_jr9x92.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-35.webp',
        class: 'Fighter',
        grade: 'SSR',
        element: 'Light',
        scaleStat: 'Defense'
    },
    {
        name: 'Woo Jinchul',
        img: 'https://api.builderberu.com/cdn/images/woo_pfrpik.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-36.webp',
        class: 'Tank',
        grade: 'SSR',
        element: 'Wind',
        scaleStat: 'Defense',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Yoo Soohyun',
        img: 'https://api.builderberu.com/cdn/images/yoo_mrwt08.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-37.webp',
        class: 'Mage',
        grade: 'SSR',
        element: 'Fire',
        scaleStat: 'Attack',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Anna Ruiz',
        img: 'https://api.builderberu.com/cdn/images/anna_ygnv0l.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-2.webp',
        class: 'Ranger',
        grade: 'SR',
        element: 'Water',
        scaleStat: 'Attack',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Han Song-Yi',
        img: 'https://api.builderberu.com/cdn/images/han-song_xsfzja.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-13.webp',
        class: 'Assassin',
        grade: 'SR',
        element: 'Water',
        scaleStat: 'Attack',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Hwang Dongsuk',
        img: 'https://api.builderberu.com/cdn/images/hwang-dongsuk_g1humr.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-16.webp',
        class: 'Tank',
        grade: 'SR',
        element: 'Dark',
        scaleStat: 'HP',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Jo Kyuhwan',
        img: 'https://api.builderberu.com/cdn/images/jojo3_tjhgu8.webp',
        icon: 'https://api.builderberu.com/cdn/images/jojo_vmdzhg.webp',
        class: 'Mage',
        grade: 'SR',
        element: 'Light',
        scaleStat: 'Attack',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Kang Taeshik',
        img: 'https://api.builderberu.com/cdn/images/kang_y6r5f4.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-19.webp',
        class: 'Assassin',
        grade: 'SR',
        element: 'Dark',
        scaleStat: 'Attack',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Kim Chul',
        img: 'https://api.builderberu.com/cdn/images/kim-chul_z9jha4.webp',
        icon: 'https://api.builderberu.com/cdn/images/build__kim-chul_sptghm.webp',
        class: 'Tank',
        grade: 'SR',
        element: 'Light',
        scaleStat: 'Defense',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Kim Sangshik',
        img: 'https://api.builderberu.com/cdn/images/kim-sangshik_rmknpe.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-20.webp',
        class: 'Tank',
        grade: 'SR',
        element: 'Wind',
        scaleStat: 'Defense',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Lee Johee',
        img: 'https://api.builderberu.com/cdn/images/lee-johee_ispe3p.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-22.webp',
        class: 'Healer',
        grade: 'SR',
        element: 'Water',
        scaleStat: 'HP',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Nam Chae-Young',
        img: 'https://api.builderberu.com/cdn/images/nam_rb2ogg.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-27.webp',
        class: 'Ranger',
        grade: 'SR',
        element: 'Water',
        scaleStat: 'HP',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Park Beom-Shik',
        img: 'https://api.builderberu.com/cdn/images/park-beom_er1y0k.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-28.webp',
        class: 'Fighter',
        grade: 'SR',
        element: 'Wind',
        scaleStat: 'Defense',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Park Heejin',
        img: 'https://api.builderberu.com/cdn/images/park-heejin_tsukcl.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-29.webp',
        class: 'Mage',
        grade: 'SR',
        element: 'Wind',
        scaleStat: 'Attack',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Song Chiyul',
        img: 'https://api.builderberu.com/cdn/images/song_usr7ja.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-34.webp',
        class: 'Mage',
        grade: 'SR',
        element: 'Fire',
        scaleStat: 'Attack',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    },
    {
        name: 'Yoo Jinho',
        img: 'https://api.builderberu.com/cdn/images/yoo-jinho_csl27q.webp',
        icon: 'https://api.builderberu.com/cdn/images/icons_build-38.webp',
        class: 'Tank',
        grade: 'SR',
        element: 'Light',
        scaleStat: 'Defense',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://api.builderberu.com/cdn/images/artifact_angelInWhite_4L_jet12q.webp', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://api.builderberu.com/cdn/images/artifact_sylphSBlessing_4R_nmjkjl.webp', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://api.builderberu.com/cdn/images/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.webp' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://api.builderberu.com/cdn/images/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.webp' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://api.builderberu.com/cdn/images/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.webp' },
            }
        }
    }

]


export const weaponData = [
    {
        name: "demonkingsdaggers",
        src: "https://api.builderberu.com/cdn/images/demonkingsdaggers_suzoai.webp"
    },
    {
        name: "demonplumfdlowersword",
        src: "https://api.builderberu.com/cdn/images/demonplumfdlowersword_k6jc5p.webp"
    },
    {
        name: "divinequarterstaff",
        src: "https://api.builderberu.com/cdn/images/divinequarterstaff_otgjdl.webp"
    },
    {
        name: "fanofthefiredemon",
        src: "https://api.builderberu.com/cdn/images/fanofthefiredemon_j4obuj.webp"
    },
    {
        name: "goldtailedfox",
        src: "https://api.builderberu.com/cdn/images/goldtailedfox_qqi0bt.webp"
    },
    {
        name: "knightkiller",
        src: "https://api.builderberu.com/cdn/images/knightkiller_fhuiqp.webp"
    },
    {
        name: "moonshadow",
        src: "https://api.builderberu.com/cdn/images/moonshadow_zgntev.webp"
    },
    {
        name: "phoenixsoul",
        src: "https://api.builderberu.com/cdn/images/phoenixsoul_ew8m0x.webp"
    },
    {
        name: "stormbringer",
        src: "https://api.builderberu.com/cdn/images/stormbringer_xy9jpk.webp"
    },
      {
        name: "allon's orb",
        src: "https://api.builderberu.com/cdn/images/allonsorb_ftlnq2.webp"
    },
    {
        name: "thetisgrimoire",
        src: "https://api.builderberu.com/cdn/images/thetisgrimoire_aktooh.webp"
    },
    {
        name: "winterfang",
        src: "https://api.builderberu.com/cdn/images/winterfang_bscduz.webp"
    },
]

export const bossData = [
    {
        type: "bdg",
        name: "Fatchna",
        src: "https://api.builderberu.com/cdn/images/bdg_fatchna_lf0nij.webp"
    },
    {
        type: "bot",
        name: "Hobgoblin Leader",
        src: "https://api.builderberu.com/cdn/images/bot_hogbogblin_leader_gusosi.webp"
    },
    {
        type: "bot",
        name: "Almighty Shaman Kargalgan",
        src: "https://api.builderberu.com/cdn/images/bot_almightyShamanKargalgan_ta7mdi.webp"
    },
    {
        type: "bot",
        name: "Baruka",
        src: "https://api.builderberu.com/cdn/images/bot_baruka_irhs7y.webp"
    },
    {
        type: "pod",
        name: "Ennio",
        src: "https://api.builderberu.com/cdn/images/pod_ennio_aefpar.webp"
    }
]

export const elementData = {
    fire: "https://api.builderberu.com/cdn/images/fire_u8p8qm.webp",
    water: "https://api.builderberu.com/cdn/images/water_ygxeiv.webp",
    light: "https://api.builderberu.com/cdn/images/light_rkqtga.webp",
    dark: "https://api.builderberu.com/cdn/images/dark_k8go8q.webp",
    wind: "https://api.builderberu.com/cdn/images/wind_zqnxhk.webp"
};