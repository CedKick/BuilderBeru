export const runesData = [
   {
    class: "basicSkills",
    className: "armor break",
    element: "fire",
    type: "break",
    used: 20,
    where: ["BoT"],
    name: "decimation",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730962/rune_armorbreak_fire_decimation_break_atbtgh.png",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730970/rune_armorbreak_light_multishadowstrike_break_nejq27.png",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730972/rune_armorbreak_water_iceberg_break_pjuvbz.png",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730974/rune_armorbreak_wind_vacuumwave_break_tnstn8.png",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756053917/firestormkick_qrhrd0.jpg",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756053917/galekick_q5tkcy.jpg",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756053917/flowingwaterkick_crr5d3.jpg",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756053918/asurakick_kqcfrs.jpg",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730978/rune_collapse_fire_surge_q6bkvh.png",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730968/rune_collapse_none_compress_vmeyw3.png",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730976/rune_collapse_none_surpriseattack_break_ckqwvl.png",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730973/rune_collapse_wind_thunderstorm_xxbqls.png",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755947640/kings_domain_lhpagm.jpg",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755947523/truth_mutilate_ix7cn7.jpg",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755947571/darkness_obliteration_fvhoea.jpg",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755947639/shadow_step_jj581d.jpg",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730975/rune_crushingblow_dark_counteringbreak_break_c4cvxq.png",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730979/rune_crushingblow_fire_ascensionbreak_break_wdkwi5.png",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730983/rune_crushingblow_light_enlightenedbreak_break_y6siud.png",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730981/rune_crushingblow_wind_chainedbreak_break_dzweph.png",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730983/rune_cuttingrush_dark_sunder_p17nek.png",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730916/rune_cuttingrush_none_effulgence_psdeww.png",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730917/rune_cuttingrush_none_escalate_q1ojxy.png",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730918/rune_daggerrush_dark_dispersion_break_cvribn.png",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730919/rune_daggerrush_fire_explosion_break_qkcsco.png",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730920/rune_daggerrush_water_coldice_break_bhdhcr.png",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730921/rune_daggerrush_wind_breach_break_smglsp.png",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730922/rune_daggertoss_fire_detonation_idz3id.png",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730924/rune_daggertoss_none_ascension_b4ezuo.png",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730924/rune_daggertoss_none_ascension_b4ezuo.png",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730924/rune_daggertoss_none_ascension_b4ezuo.png",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730926/rune_death_none_extinction_mjrgkb.png",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730929/rune_death_none_overshadow_qjbrnv.png",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730928/rune_death_none_squall_break_pk88ku.png",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730930/rune_death_water_icestrike_akqtek.png",
    
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
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730931/rune_deathsdance_dark_eruption_break_jfraez.png",
    
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
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730939/rune_deathsdance_fire_wildfire_break_m0glal.png",
    },
    {
        class: "basicSkills",
        className: "death's dance",
        element: "light",
        type: "break",
        used: 20,
        where: ["BoT"],
        name: "earth shock",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730932/rune_deathsdance_light_earthshock_break_qt1hhv.png",
    },
    {
        class: "basicSkills",
        className: "death's dance",
        element: "wind",
        type: "break",
        used: 20,
        where: ["BoT"],
        name: "high-speed rotation",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730933/rune_deathsdance_wind_highspeedrotation_break_l3okpl.png",
    },
    {
        class: "basicSkills",
        className: "double slash",
        element: "none",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "full moon wheel",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730935/rune_doubleslash__noine_fullmoonwheel_xkfacv.png",
    },
    {
        class: "basicSkills",
        className: "double slash",
        element: "fire",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "flame slash",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730934/rune_doubleslash_fire_flameslash_uyzvug.png",
    },
    {
        class: "basicSkills",
        className: "double slash",
        element: "none",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "multiply",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730936/rune_doubleslash_none_multiply_lluqxx.png",
    },
    {
        class: "basicSkills",
        className: "double slash",
        element: "wind",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "whirlwind rush",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730937/rune_doubleslash_wind_whirlwindrush_qcjnbb.png",
    },
    {
        class: "basicSkills",
        className: "multistrike",
        element: "water",
        type: "break",
        used: 20,
        where: ["BoT"],
        name: "rush",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730940/rune_multistrike_water_rush_break_qy5xgx.png",
    },
    {
        class: "basicSkills",
        className: "multistrike",
        element: "dark",
        type: "break",
        used: 20,
        where: ["BoT"],
        name: "illusion",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730944/rune_multistrike_dark_illusion_break_ihszzd.png",
    },
    {
        class: "basicSkills",
        className: "multistrike",
        element: "fire",
        type: "break",
        used: 20,
        where: ["BoT"],
        name: "percussion",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730945/rune_multistrike_fire_percussion_break_ppclp9.png",
    },
    {
        class: "basicSkills",
        className: "multistrike",
        element: "light",
        type: "break",
        used: 20,
        where: ["BoT"],
        name: "pummel",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730947/rune_multistrike_light_pummel_break_zdzwdg.png",
    },
    {
        class: "basicSkills",
        className: "mutilate",
        element: "dark",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "stroke of lightning",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730943/rune_mutilate_dark_strokeoflightning_k9epuu.png",
    },
    {
        class: "basicSkills",
        className: "mutilate",
        element: "none",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "phantom",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730942/rune_mutilate_none_phantom_arzy2b.png",
    },
    {
        class: "basicSkills",
        className: "mutilate",
        element: "none",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "strike",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730941/rune_mutilate_none_strike_qh90s1.png",
    },
    {
        class: "basicSkills",
        className: "mutilate",
        element: "water",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "coldstorm",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730949/rune_mutilate_water_coldstorm_vje8oc.png",
    },
    {
        class: "basicSkills",
        className: "sonic stream",
        element: "dark",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "magnifying slashes",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730951/rune_sonicstream_dark_magnifyingslashes_ffjeje.png",
    },
    {
        class: "basicSkills",
        className: "sonic stream",
        element: "fire",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "sonic explosion",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730948/rune_sonicstream_fire_sonicexplosion_nw1eeh.png",
    },
    {
        class: "basicSkills",
        className: "sonic stream",
        element: "light",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "double down",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730950/rune_sonicstream_light_doubledown_josnj1.png",
    },
    {
        class: "basicSkills",
        className: "sonic stream",
        element: "wind",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "wind shroud",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730953/rune_sonicstream_wind_windshroud_ceigoo.png",
    },
    {
        class: "basicSkills",
        className: "the commander's touch",
        element: "none",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "absorption",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730956/rune_thecommanderstouch_none_absorption_hcrqhx.png",
    },
    {
        class: "basicSkills",
        className: "the commander's touch",
        element: "none",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "black hole",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730954/rune_thecommanderstouch_none_blackhole_fzjt9h.png",
    },
    {
        class: "basicSkills",
        className: "the commander's touch",
        element: "none",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "finisher",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730955/rune_thecommanderstouch_none_finisher_hxkaia.png",
    },
    {
        class: "basicSkills",
        className: "the commander's touch",
        element: "none",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "liberation",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730963/rune_thecommanderstouch_none_liberation_csz0a0.png",
    },
    {
        class: "basicSkills",
        className: "vertical art",
        element: "fire",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "crosshairs",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730957/rune_verticalart_fire_crosshairs_bnzjbm.png",
    },
    {
        class: "basicSkills",
        className: "vertical art",
        element: "dark",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "reap",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730958/rune_verticalart_dark_reap_b95yia.png",
    },
    {
        class: "basicSkills",
        className: "vertical art",
        element: "water",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "sequent explosion",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730967/rune_verticalart_water_sequentexplosions_x2k9zl.png",
    },
    {
        class: "basicSkills",
        className: "vertical art",
        element: "wind",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "wind gale",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730966/rune_verticalart_wind_gale_xgjrgs.png",
    },
    {
        class: "basicSkills",
        className: "vital strike",
        element: "none",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "decimate",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730961/rune_vitalstrike_none_decimate_b870yh.png",
    },
    {
        class: "basicSkills",
        className: "vital strike",
        element: "none",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "hone in",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730960/rune_vitalstrike_none_honein_f8pr6j.png",
    },
    {
        class: "basicSkills",
        className: "vital strike",
        element: "none",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "internal wound",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730964/rune_vitalstrike_none_internalwound_fspsz7.png",
    },
    {
        class: "basicSkills",
        className: "vital strike",
        element: "water",
        type: "none",
        used: 20,
        where: ["BoT"],
        name: "on point",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730969/rune_vitalstrike_water_onpoint_rdvyho.png",
    },

];

export const blessingStonesData = [
    {

        class: "bessingstone",
        type: "offensive",
        name: "advanced dagger technique",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730795/blessingstones_offensive_advanceddaggertechnique_y6dlbs.png",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "assasin's proficiency",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730797/blessingstones_offensive_assassinsproficiency_l6bgcd.png",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "bloodlust",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730795/blessingstones_offensive_bloodlust_mahcl9.png",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "boss slayer",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730796/blessingstones_offensive_bossslayer_i1fygg.png",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "chains of blood",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730797/blessingstones_offensive_chainsofblood_ufpvag.png",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "crushing attack",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730798/blessingstones_offensive_crushingattack_njjnlv.png",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "desire",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730798/blessingstones_offensive_desire_nrihcy.png",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "double edge sword",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730799/blessingstones_offensive_doubleedgedsword_jxiz6e.png",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "fatal strike",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730800/blessingstones_offensive_fatalstrike_zqignl.png",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "first strike barrage",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730800/blessingstones_offensive_firststrikebarrage_rfk7g0.png",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "intuit",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730801/blessingstones_offensive_intuit_u0ijck.png",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "irresistible force",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730802/blessingstones_offensive_irresistibleforce_mw1hhf.png",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "lightning speed",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730802/blessingstones_offensive_lightningspeed_qrqawd.png",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "monarch's domain",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730804/blessingstones_offensive_monarchsdomain_qwky6d.png",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "pulverize",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730804/blessingstones_offensive_pulverize_xj91j2.png",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "reawakening",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730805/blessingstones_offensive_reawakening_zo5hpm.png",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "sandbag",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730806/blessingstones_offensive_sandbag_nsvmez.png",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "sharp perception",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730806/blessingstones_offensive_sharpperception_ublxx7.png",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "speed",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730807/blessingstones_offensive_speed_mznzso.png",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "swiftness",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730808/blessingstones_offensive_swiftness_a9wc0x.png",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "swift strike",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730808/blessingstones_offensive_swiftstrike_snbouy.png",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "title : wolf assassin",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730809/blessingstones_offensive_titlewolfassassin_tqemup.png",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "title : conquer of adversity",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730811/blessingstones_offensive_titleconquerorofadversity_untgji.png",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "title : demon slayer",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730810/blessingstones_offensive_tittledemonslayer_xvyuqe.png",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "weakness detection",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730812/blessingstones_offensive_weaknessdetection_oqnf7n.png",
    },
    {

        class: "bessingstone",
        type: "offensive",
        name: "we are one",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730811/blessingstones_offensive_weareone_djc5nd.png",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "aggresive defense",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748732124/blessingstones_defensive_aggresivedefense_yccura.png",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "best defense is a good offense",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748732123/blessingstones_defensive_bestdefenseisagoodoffense_qqvxna.png",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "camouflage",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748732125/blessingstones_defensive_camouflage_o4vi6j.png",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "daily quest completion",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748732127/blessingstones_defensive_dailyquestcompletion_ftrwex.png",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "HP extraction",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748732128/blessingstones_defensive_hpextraction_omxba4.png",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "irreversible road",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748732130/blessingstones_defensive_irreversibleroad_beqx5o.png",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "kandiaru's blessing",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748732131/blessingstones_defensive_kandiarusblessing_cujr5i.png",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "kasaka's steel scales",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748732134/blessingstones_defensive_kasakassteelscales_mcvqv6.png",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "life",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748732133/blessingstones_defensive_life_cs9xwm.png",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "manapower shield",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748732136/blessingstones_defensive_manapoweredshield_tgjkvn.png",

    },
    {
        class: "bessingstone",
        type: "offensive",
        name: "mana rampage",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730803/blessingstones_offensive_manarampage_xuor2j.png",

    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "natural disaster",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748732138/blessingstones_defensive_naturaldisaster_gm3eul.png",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "penalty quest completion",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748732139/blessingstones_defensive_penaltyquestsurvival_msghla.png",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "ravenous instinct",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748732141/blessingstones_defensive_ravenousinstinct_strsvn.png",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "defensive ravenous",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748732141/blessingstones_defensive_ravenousinstinct_strsvn.png",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "defensive solidify",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748732142/blessingstones_defensive_solidify_spndee.png",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "swift restoration",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748732144/blessingstones_defensive_swiftsestoration_wwykco.png",
    },
    {
        class: "bessingstone",
        type: "defensive",
        name: "tenacity",
        used: 20,
        where: ["BoT"],
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748732121/blessingstones_defensive_tenacity_r1kjpx.png(",
    },
]

export const shadowData = [
    {
        name: "Beru",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748731233/shadow_.beru_x9dhhy.png",
    },
    {
        name: "Beste",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748731238/shadow_.beste_uc5d45.png",
    },
    {
        name: "Bigrock",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748731234/shadow_.bigrock_fmh4ek.png",
    },
    {
        name: "Blades",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748731231/shadow_.blades_cwtpos.png",
    },
    {
        name: "Cerbie",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748731232/shadow_.cerbie_2_ddaie8.png",
    },
    {
        name: "Iron",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748731235/shadow_.iron_yrycrl.png",
    },
    {
        name: "Kaisel",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748731236/shadow_.kaisel_jc7ayt.png",
    },
    {
        name: "Tank",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748731239/shadow_.tank_wydj5h.png",
    },
    {
        name: "Tusk",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748731241/shadow_.tusk_z8a5sc.png",
    },
    {
        name: "Igris",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748731241/shadow_igris_wgtcdl.png",
    },

]

export const artifactData = [{
    set: "Angel White",
    side: "L",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png"
},
{
    set: "Warmonger",
    side: "L",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_warmonger_4L_j7jveq.png"
},
{
    set: "Solid Foundation",
    side: "L",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_solidFoundation_4L_o8t6aw.png"
}, {
    set: "Toughness",
    side: "L",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_toughness_4L_pnbyxv.png"
}, {
    set: "Sylph's Blessing",
    side: "R",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png"
}, {
    set: "Solid Analysis",
    side: "L",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_solidAnalysis_4L_inamfg.png"
}, {
    set: "Shining Star",
    side: "R",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730697/artifact_shiningStar_4R_x3wslj.png"
}, {
    set: "Ouststanding Connection",
    side: "R",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730697/artifact_OuststandingConnection__4R_qm7pjh.png"
}, {
    set: "NobleSacrifice",
    side: "L",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730696/artifact_nobleISacrifice_4L_eylhm0.png"
}, {
    set: "Outstanding Ability",
    side: "R",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730696/artifact_outstandingAbility_4R_rqmjla.png"
}, {
    set: "One Hit-kill",
    side: "L",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730696/artifact_oneHitKill_4L_l4jrpl.png"
}, {
    set: "Guardian",
    side: "L",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730695/artifact_guardian_4L_bsxkjl.png"
}, {
    set: "Iron Will",
    side: "L",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730695/artifact_ironWill_4L_gczimo.png"
}, {
    set: "Expert",
    side: "R",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730694/artifact_Expert_4R_wbxgfe.png"
}, {
    set: "Executionner",
    side: "R",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730694/artifact_executionner_4R_c9btj1.png"
}, {
    set: "Destroyer",
    side: "L",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730694/artifact_destroyer_4L_owtfbl.png"
}, {
    set: "Destructive Instinct",
    side: "R",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730693/artifact_destructiveInstinct_4R_oxto9g.png"
}, {
    set: "Concentration Of Firepower",
    side: "R",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730693/artifact_concentrationOfFirepower_4R_i5iovw.png"
}, {
    set: "Chaotic Wish",
    side: "R",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730693/artifact_chaoticWish_4R_qqtor2.png"
}, {
    set: "Chaotic Infamy",
    side: "R",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730693/artifact_ChaoticInfamy_8R_j2zmy5.png"
}, {
    set: "Chaotic Infamy",
    side: "L",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730692/artifact_chaoticInfamy_8L_o2es9k.png"
}, {
    set: "Chaotic Desire",
    side: "R",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730692/artifact_chaoticDesire_8R_hu0hex.png"
},
{
    set: "Chaotic Desire",
    side: "L",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730692/artifact_chaoticDesire_8L_ghkvum.png"
},
{
    set: "Chaotic Wish",
    side: "L",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730691/artifact_chaosWish_8L_wspayx.png"
},
{
    set: "Champion On The Field",
    side: "R",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730691/artifact_championOnTheField_4R_wtnphf.png"
},
{
    set: "Burning Greed",
    side: "R",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730691/artifact_burningGreed_8R_oc70gz.png"
},
{
    set: "Burning Greed",
    side: "L",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730690/artifact_burningGreed_8L_r8lrve.png"
},
{
    set: "Burning Curse",
    side: "L",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730690/artifact_burningCurse_8L_l98rff.png"
},
{
    set: "Burning Curse",
    side: "R",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730690/artifact_burningCurse_8R_soemzs.png"
},
{
    set: "Burning Blessing",
    side: "L",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730690/artifact_BurningBlessing_8L_sppyfn.png"
},
{
    set: "Berserker",
    side: "R",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730689/artifact_berseker_4R_dgh2zx.png"
},
{
    set: "Burning Blessing",
    side: "R",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730689/artifact_burningBlessing_8R_fhwx7x.png"
},
{
    set: "Armed",
    side: "L",
    src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730689/artifact_Armed_4L_tt2gbd.png"
},



]

export const coresData = [
    {
        type: "Defensive",
        set: "Crimpson Apex",
        name: "Desires of the Cirmpson Apex",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png"
    },
    {
        type: "Defensive",
        set: "Ancient Wraiths",
        name: "Ancien Wraiths Right Hand",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730892/Defensive_AncientWraiths_AncienWraithsRightHand_y3hhma.png"
    }, {
        type: "Offensive",
        set: "Watcher",
        name: "Watcher Eyes Of The Watcher",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png"
    }, {
        type: "Offensive",
        set: "Crimpson Apex",
        name: "Hunger of the Cirmpson_Apex",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730890/Offensive_CrimpsonApex_Hunger_of_the_Cirmpson_Apex_mhqpnr.png"
    }, {
        type: "Offensive",
        set: "Nameless",
        name: "Nameless Demons Deception",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730889/Offensive_Nameless_NamelessDemonsDeception_rosvql.png"
    }, {
        type: "Offensive",
        set: "Ancient Wraiths",
        name: "Ancien Wraiths Obsession",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730888/Offensive_AncientWraiths_AncienWraiths_Obsession_yyqgrr.png"
    }, {
        type: "Endurance",
        set: "Nameless",
        name: "Nameless Demons Magisphere",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png"
    }, {
        type: "Endurance",
        set: "Watcher",
        name: "Teeth Of The Watcher",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730886/Endurance_Watcher_TeethOfTheWatcher_h8qil3.png"
    }, {
        type: "Endurance",
        set: "Crimpson Apex",
        name: "Punishement of the Cirmpson Apex",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730885/Endurance_CrimpsonApex_Punishement_of_the_Cirmpson_Apex_k2rotj.png"
    }, {
        type: "Endurance",
        set: "Ancient Wraiths",
        name: "Ancien Wraiths Mana Power",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730885/Endurance_AncientWraiths_AncienWraithsManaPower_kzlhnr.png"
    }, {
        type: "Defensive",
        set: "Watcher",
        name: "Limbs Of The Watcher",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730884/Defensive_Watcher_LimbsOfTheWatcher_ol4g8q.png"
    }, {
        type: "Defensive",
        set: "Nameless",
        name: "Nameless Demons Horn",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730883/Defensive_Nameless_NamelessDemonsHorn_sgwmow.png"
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
                leftArtifact: [{ name: 'Burning Curse', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730690/artifact_burningCurse_8L_l98rff.png', amount: 4 }],
                rightArtifact: [{ name: "Expert", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730694/artifact_Expert_4R_wbxgfe.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    }
]


export const characters = [
    {

        name: 'Minnie',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756403438/Minnie_bcfolv.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756403438/Minnie_bcfolv.png',
        class: 'Assassin',
        grade: 'SSR',
        element: 'Dark',
        scaleStat: 'Defense',
        importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {

        name: 'Soyeon',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756403438/soyeon_fstvg4.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756403438/soyeon_fstvg4.png',
        class: 'Tank',
        grade: 'SSR',
        element: 'Wind',
        scaleStat: 'Attack',
        importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {

        name: 'Yuqi',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756403437/yuki_dqefqm.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756403437/yuki_dqefqm.png',
        class: 'Tank',
        grade: 'SSR',
        element: 'Fire',
        scaleStat: 'HP',
        importantStats:['hp', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {

        name: 'Jinah',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1753869840/jinah_vrbddm.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1753869067/jinah_icon_pfdee6.png',
        class: 'Support',
        grade: 'SSR',
        element: 'Wind',
        scaleStat: 'Defense',
        importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    }
    ,
    {

        name: 'Miyeon',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751496034/miyeon_ijwudx.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751496034/miyeon_ijwudx.png',
        class: 'Fighter',
        grade: 'SSR',
        element: 'Light',
        scaleStat: 'Defense',
        importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    }
    ,
    {

        name: 'Shuhua',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751535917/Shuhua1_difnjb.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751536775/IconShuhua_njc2f2.png',
        class: 'Assassin',
        grade: 'SSR',
        element: 'Water',
        scaleStat: 'Attack',
        importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    }
    ,
    {

        name: 'Lennart Niermann',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1749114179/niermann_arxjer.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1749114267/build-niermann_phfwmu.png',
        class: 'Fighter',
        grade: 'SSR',
        element: 'Wind',
        scaleStat: 'Defense',
        importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    }
    ,



    {
        name: 'Cha Hae-In Valkyrie',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604309/chae_mlnz8k.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606282/icons/build-3.png',
        class: 'Fighter',
        grade: 'SSR',
        element: 'Water',
        scaleStat: 'Defense',
        importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    }
    ,
    {
        name: 'Tawata Kanae',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604318/kanae_squvh2.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606320/icons/build-18.png',
        class: 'Assassin',
        grade: 'SSR',
        element: 'Fire',
        scaleStat: 'Attack',
        importantStats:['atk', 'tc', 'dcc', 'defPen', 'di', 'mpcr', 'mpa'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Alicia Blanche',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604309/alicia_fzpzkf.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606278/icons/build.png',
        class: 'Mage',
        grade: 'SSR',
        element: 'Water',
        scaleStat: 'Attack',
        scaleStat: 'Attack',importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Amamiya Mirei',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604327/mirei_nb6arm.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606340/icons/build-26.png',
        class: 'Assassin',
        grade: 'SSR',
        element: 'Wind',
        scaleStat: 'Attack',
        importantStats:['atk', 'tc', 'dcc', 'defPen', 'di', 'mpcr', 'mpa'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Baek Yoonho',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604214/baek_tgrbx8.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747647495/build_baek_wwcvhp.png',
        class: 'Tank',
        grade: 'SSR',
        element: 'Light',
        scaleStat: 'Defense',
        importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Cha Hae In',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604308/chae-in_zafver.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606285/icons/build-4.png',
        class: 'Fighter',
        grade: 'SSR',
        element: 'Light',
        scaleStat: 'Attack',
        importantStats:['atk', 'tc', 'dcc', 'defPen', 'di', 'mpcr', 'mpa'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Charlotte',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604306/charlotte_bbsqv1.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606287/icons/build-5.png',
        class: 'Mage',
        grade: 'SSR',
        element: 'Dark',
        scaleStat: 'Defense',
        importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
    },
    {
        name: 'Choi Jong-In',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604310/choi_a4k5sl.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606289/icons/build-6.png',
        class: 'Mage',
        grade: 'SSR',
        element: 'Fire',
        scaleStat: 'Attack',
        importantStats:['atk', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Emma Laurent',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604311/emma_vvw5lt.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606292/icons/build-7.png',
        class: 'Tank',
        grade: 'SSR',
        element: 'Fire',
        scaleStat: 'HP',
        importantStats:['hp', 'tc', 'dcc', 'defPen', 'di', 'mpcr'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Esil Radiru',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604313/esil_bjzrv2.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606294/icons/build-8.png',
        class: 'Ranger',
        grade: 'SSR',
        element: 'Fire',
        scaleStat: 'Attack',
        importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Gina',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604312/gina_emzlpd.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606297/icons/build-9.png',
        class: 'Support',
        grade: 'SSR',
        element: 'Fire',
        scaleStat: 'Attack',
        importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Go Gunhee',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604312/go_e5tq0a.png',
        icon: 'build_go.png',
        class: 'Tank',
        grade: 'SSR',
        element: 'Light',
        scaleStat: 'Defense',
        importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Goto Ryuji',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604314/goto_pirfgy.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606299/icons/build-10.png',
        class: 'Tank',
        grade: 'SSR',
        element: 'Wind',
        scaleStat: 'HP',
        importantStats:['hp', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Han Se-Mi',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604315/han_pfyz7e.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606304/icons/build-12.png',
        class: 'Healer',
        grade: 'SSR',
        element: 'Wind',
        scaleStat: 'HP',
        importantStats:['hp', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Harper',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604316/harper_fvn1d9.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606309/icons/build-14.png',
        class: 'Tank',
        grade: 'SSR',
        element: 'Dark',
        scaleStat: 'HP',
        importantStats:['hp', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Hwang Dongsoo',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604316/Hwang_wumgnp.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606311/icons/build-15.png',
        class: 'Fighter',
        grade: 'SSR',
        element: 'Wind',
        scaleStat: 'Defense',
        importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Isla Wright',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604215/isla_w9mnlc.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606317/icons/build-17.png',
        class: 'Healer',
        grade: 'SSR',
        element: 'Dark',
        scaleStat: 'Defense',
        importantStats:['def', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Lee Bora',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604324/lee_khjilr.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606327/icons/build-21.png',
        class: 'Mage',
        grade: 'SSR',
        element: 'Dark',
        scaleStat: 'Attack',
        importantStats:['atk', 'tc', 'dcc', 'defPen', 'di', 'mpcr'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Lim Tae-Gyu',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604325/lim_gahgsq.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606332/icons/build-23.png',
        class: 'Ranger',
        grade: 'SSR',
        element: 'Dark',
        scaleStat: 'Attack',
        importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Meilin Fisher',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604218/meilin_k17bnw.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606335/icons/build-24.png',
        class: 'Healer',
        grade: 'SSR',
        element: 'Water',
        scaleStat: 'HP',
        importantStats:['hp', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Min Byung-Gu',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604326/min_tw1eio.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606337/icons/build-25.png',
        class: 'Healer',
        grade: 'SSR',
        element: 'Light',
        scaleStat: 'HP',
        importantStats:['hp', 'tc', 'dcc', 'defPen', 'di'],
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Seo Jiwoo',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604210/seo_qsvfhj.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606349/icons/build-30.png',
        class: 'Tank',
        grade: 'SSR',
        element: 'Water',
        importantStats:['hp', 'tc', 'dcc', 'defPen', 'di'],
        scaleStat: 'HP', presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Seorin',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604210/seorin_t7irtj.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606352/icons/build-31.png',
        class: 'Ranger',
        grade: 'SSR',
        element: 'Water',
        scaleStat: 'HP',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Shimizu Akari',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604212/shimizu_a3devg.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606355/icons/build-32.png',
        class: 'Healer',
        grade: 'SSR',
        element: 'Light',
        scaleStat: 'HP',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Silver Mane Baek Yoonho',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604211/silverbaek_kg7wuz.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606357/icons/build-33.png',
        class: 'Fighter',
        grade: 'SSR',
        element: 'Dark',
        scaleStat: 'Attack'
    },
    {
        name: 'Thomas Andre',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604216/thomas_jr9x92.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606363/icons/build-35.png',
        class: 'Fighter',
        grade: 'SSR',
        element: 'Light',
        scaleStat: 'Defense'
    },
    {
        name: 'Woo Jinchul',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604217/woo_pfrpik.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606367/icons/build-36.png',
        class: 'Tank',
        grade: 'SSR',
        element: 'Wind',
        scaleStat: 'Defense',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Yoo Soohyun',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604218/yoo_mrwt08.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606370/icons/build-37.png',
        class: 'Mage',
        grade: 'SSR',
        element: 'Fire',
        scaleStat: 'Attack',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Anna Ruiz',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604212/anna_ygnv0l.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606280/icons/build-2.png',
        class: 'Ranger',
        grade: 'SR',
        element: 'Water',
        scaleStat: 'Attack',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Han Song-Yi',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604213/han-song_xsfzja.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606306/icons/build-13.png',
        class: 'Assassin',
        grade: 'SR',
        element: 'Water',
        scaleStat: 'Attack',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Hwang Dongsuk',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604317/hwang-dongsuk_g1humr.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606314/icons/build-16.png',
        class: 'Tank',
        grade: 'SR',
        element: 'Dark',
        scaleStat: 'HP',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Jo Kyuhwan',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747689385/jojo3_tjhgu8.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747649046/jojo_vmdzhg.png',
        class: 'Mage',
        grade: 'SR',
        element: 'Light',
        scaleStat: 'Attack',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Kang Taeshik',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604320/kang_y6r5f4.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606322/icons/build-19.png',
        class: 'Assassin',
        grade: 'SR',
        element: 'Dark',
        scaleStat: 'Attack',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Kim Chul',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604322/kim-chul_z9jha4.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747646719/build__kim-chul_sptghm.png',
        class: 'Tank',
        grade: 'SR',
        element: 'Light',
        scaleStat: 'Defense',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Kim Sangshik',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604321/kim-sangshik_rmknpe.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606325/icons/build-20.png',
        class: 'Tank',
        grade: 'SR',
        element: 'Wind',
        scaleStat: 'Defense',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Lee Johee',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604323/lee-johee_ispe3p.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606330/icons/build-22.png',
        class: 'Healer',
        grade: 'SR',
        element: 'Water',
        scaleStat: 'HP',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Nam Chae-Young',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604328/nam_rb2ogg.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606342/icons/build-27.png',
        class: 'Ranger',
        grade: 'SR',
        element: 'Water',
        scaleStat: 'HP',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Park Beom-Shik',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604328/park-beom_er1y0k.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606345/icons/build-28.png',
        class: 'Fighter',
        grade: 'SR',
        element: 'Wind',
        scaleStat: 'Defense',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Park Heejin',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604307/park-heejin_tsukcl.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606347/icons/build-29.png',
        class: 'Mage',
        grade: 'SR',
        element: 'Wind',
        scaleStat: 'Attack',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Song Chiyul',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604215/song_usr7ja.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606359/icons/build-34.png',
        class: 'Mage',
        grade: 'SR',
        element: 'Fire',
        scaleStat: 'Attack',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    },
    {
        name: 'Yoo Jinho',
        img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604221/yoo-jinho_csl27q.png',
        icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606372/icons/build-38.png',
        class: 'Tank',
        grade: 'SR',
        element: 'Light',
        scaleStat: 'Defense',
        presets: {
            PoD: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            },
            BdG: {
                leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
                rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
                core: {
                    Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                    Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                    Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
                }
            }
        },
        BoT: {
            leftArtifact: [{ name: 'Angel White', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png', amount: 4 }],
            rightArtifact: [{ name: "Sylph's Blessing", src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730698/artifact_sylphSBlessing_4R_nmjkjl.png', amount: 4 }],
            core: {
                Offensive: { name: 'Watcher Eyes Of The Watcher', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730893/Defensive_CrimpsonApex_Desires_of_the_Cirmpson_Apex_mqsj9k.png' },
                Defensive: { name: 'Desires of the Cirmpson Apex', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730891/Offensive_Watcher_EyesOfTheWatcher_n7wjhh.png' },
                Endurance: { name: 'Nameless Demons Magisphere', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730887/Endurance_Nameless_NamelessDemonsMagisphere_pr8xk1.png' },
            }
        }
    }

]


export const weaponData = [
    {
        name: "demonkingsdaggers",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748875805/demonkingsdaggers_suzoai.png"
    },
    {
        name: "demonplumfdlowersword",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748875804/demonplumfdlowersword_k6jc5p.png"
    },
    {
        name: "divinequarterstaff",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748875804/divinequarterstaff_otgjdl.png"
    },
    {
        name: "fanofthefiredemon",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748875804/fanofthefiredemon_j4obuj.png"
    },
    {
        name: "goldtailedfox",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751618897/goldtailedfox_qqi0bt.png"
    },
    {
        name: "knightkiller",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748875804/knightkiller_fhuiqp.png"
    },
    {
        name: "moonshadow",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748875804/moonshadow_zgntev.png"
    },
    {
        name: "phoenixsoul",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748875805/phoenixsoul_ew8m0x.png"
    },
    {
        name: "stormbringer",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748875806/stormbringer_xy9jpk.png"
    },
      {
        name: "allon's orb",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756054038/allonsorb_ftlnq2.png"
    },
    {
        name: "thetisgrimoire",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748875805/thetisgrimoire_aktooh.png"
    },
    {
        name: "winterfang",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748875805/winterfang_bscduz.png"
    },
]

export const bossData = [
    {
        type: "bdg",
        name: "Fatchna",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730842/bdg_fatchna_lf0nij.png"
    },
    {
        type: "bot",
        name: "Hobgoblin Leader",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730845/bot_hogbogblin_leader_gusosi.png"
    },
    {
        type: "bot",
        name: "Almighty Shaman Kargalgan",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730843/bot_almightyShamanKargalgan_ta7mdi.png"
    },
    {
        type: "bot",
        name: "Baruka",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730843/bot_baruka_irhs7y.png"
    },
    {
        type: "pod",
        name: "Ennio",
        src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730844/pod_ennio_aefpar.png"
    }
]

export const elementData = {
    fire: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604376/fire_u8p8qm.png",
    water: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604378/water_ygxeiv.png",
    light: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604374/light_rkqtga.png",
    dark: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604377/dark_k8go8q.png",
    wind: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604376/wind_zqnxhk.png"
};