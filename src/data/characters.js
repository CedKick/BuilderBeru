// data/characters.js
export const characters = {
  '': {
    name: 'Sélectionner un personnage',
    img: '', // Pas d'image volontairement
    class: '',
    grade: '',
    element: '',
    scaleStat: '',
    skillMultipliers: {
      core1: 0,
      core2: 0,
      skill1: 0,
      skill2: 0,
      ultimate: 0
    },
    buffs: []

  },
   'ilhwan': {
    name: 'Ilhwan',
    img: 'https://api.builderberu.com/cdn/images/ilhwan_uncoloried_uzywyu-removebg-preview_t87rro.webp',
    icon: 'https://api.builderberu.com/cdn/images/ilhwan_uncoloried_uzywyu-removebg-preview_t87rro.webp',
    class: 'Assassin',
    grade: 'SSR',
    element: 'Dark',
    scaleStat: 'Attack',
     bdgLimits: {
      maxDamageOnElement: 30000000000,  // 30B max si bon élément
      maxDamageOffElement: 10000000000  // 10B max si mauvais élément
    },
    importantStats: ['atk', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'yuqi': {
    name: 'YUQI',
    img: 'https://api.builderberu.com/cdn/images/yuki_dqefqm.webp',
    icon: 'https://api.builderberu.com/cdn/images/yuki_dqefqm.webp',
    class: 'Breaker',
    grade: 'SSR',
    element: 'Fire',
    scaleStat: 'HP',
    bdgLimits: {
      maxDamageOnElement: 8000000000,  // 8B max si bon élément
      maxDamageOffElement: 2000000000  // 2B max si mauvais élément
    },
    importantStats: ['hp', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'soyeon': {
    name: 'Soyeon',
    img: 'https://api.builderberu.com/cdn/images/soyeon_fstvg4.webp',
    icon: 'https://api.builderberu.com/cdn/images/soyeon_fstvg4.webp',
    class: 'Fighter',
    grade: 'SSR',
    element: 'Wind',
    scaleStat: 'Attack',
     bdgLimits: {
      maxDamageOnElement: 50000000000,  // 
      maxDamageOffElement: 2000000000  // 
    },
    importantStats: ['atk', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'minnie': {
    name: 'Minnie',
    img: 'https://api.builderberu.com/cdn/images/Minnie_bcfolv.webp',
    icon: 'https://api.builderberu.com/cdn/images/Minnie_bcfolv.webp',
    class: 'Assasin',
    grade: 'SSR',
    element: 'Dark',
    scaleStat: 'Defense',
    bdgLimits: {
      maxDamageOnElement: 20000000000,  // 20B max si bon élément
      maxDamageOffElement: 4000000000  // 4B max si mauvais élément
    },
    importantStats: ['def', 'tc', 'dcc', 'defPen', 'di', 'mpcr', 'mpa'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'jinah': {
    name: 'Jinah',
    img: 'https://api.builderberu.com/cdn/images/jinah_vrbddm.webp',
    icon: 'https://api.builderberu.com/cdn/images/jinah_icon_pfdee6.webp',
    class: 'Support',
    grade: 'SSR',
    element: 'Wind',
    scaleStat: 'Defense',
    bdgLimits: {
      maxDamageOnElement: 15000000000,  // 15B max si bon élément
      maxDamageOffElement: 4000000000  // 4B max si mauvais élément
    },
    importantStats: ['def', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 2.76,
      core2: 14.82,
      skill1: 27.27,
      skill2: 26.61,
      ultimate: 68.69
    },
    buffs: [
      {
        name: 'Shield',
        img: 'https://api.builderberu.com/cdn/images/defense_jinah_bzd7tr.webp',
        duration: 30,
        target: 'self',
        effects: [
          { type: 'scaleStat', values: [10, 20, 30] }
        ]
      },
      {
        name: 'Wind Damage Taken Increase',
        img: 'https://api.builderberu.com/cdn/images/wind_damage_taken_jinah_brirej.webp',
        duration: 20,
        target: 'shared',
        effects: [
          { type: 'elementalDamage', element: 'Wind', values: [1, 2, 3, 4, 5] }
        ]
      },
      {
        name: 'Sudden Showers',
        img: 'https://api.builderberu.com/cdn/images/rain_jinah_uufuxy.webp',
        duration: 25,
        target: 'shared',
        effects: [
          { type: 'damageBuffs', values: [10] }
        ]
      },
      {
        name: 'Aero',
        img: 'https://api.builderberu.com/cdn/images/Aero_jinah_hjuchd.webp',
        duration: 25,
        target: 'shared',
        effects: [
          { type: 'elementalDamage', element: 'Wind', values: [2, 4, 6, 8, 10] }
        ]
      },
      {
        name: "Wind's Touch",
        img: 'https://api.builderberu.com/cdn/images/windtTouch_jinah_w7hmrx.webp',
        duration: -1, // Infini
        target: 'shared',
        stacks: 10,
        effects: [
          { type: 'attack', values: [10] },           // +1% Attack
          { type: 'defense', values: [10] },          // +1% Defense
          { type: 'skillBuffs', values: [5] },     // +0.5% Basic Skill
          // Bonus Wind (optionnel, on peut gérer ça plus tard)
          { type: 'attack', condition: 'wind', values: [10] },     // +1% Attack si Wind
          { type: 'defense', condition: 'wind', values: [10] },    // +1% Defense si Wind
          { type: 'skillBuffs', condition: 'wind', values: [5] } // +0.5% Skill si Wind
        ]
      },
      {
        name: "Wings of Freedom",
        img: 'https://api.builderberu.com/cdn/images/wingOfFreedom_jinah_tavng0.webp', // Tu devras uploader l'image
        duration: 5,
        target: 'self', // Ou 'shared' si c'est pour toute l'équipe
        stacks: 1,
        effects: [
          { type: 'skillBuffs', values: [10] },      // +10% Basic Skill damage
          { type: 'ultimateBuffs', values: [10] }    // +10% Ultimate Skill damage
        ]
      },
      {
        name: "4 Star Jinah",
        img: 'https://api.builderberu.com/cdn/images/fourStar_jinah_izutbk.webp', // Tu devras uploader l'image
        duration: -1, // Infini (passif)
        target: 'shared', // Pour tous les membres Wind de l'équipe
        effects: [
          { type: 'elementalDamage', element: 'Wind', values: [15] } // +15% Wind damage (5% x 3 alliés Wind)
        ]
      },
      {
        name: "Jinah's Weapon Buff",
        img: 'https://api.builderberu.com/cdn/images/buffWeapon_jinah_xdosfy.webp',
        duration: -1, // Infini
        target: 'shared', // Pour toute l'équipe
        effects: [
          { type: 'skillBuffs', values: [10] } // +10% Basic Skill (déjà calculé pour 5 stacks)
        ]
      }
    ]
  },
  'jinwoo': {
    name: 'Sung Jinwoo',
    img: 'https://api.builderberu.com/cdn/images/sungjiwoo_rfmpth.webp',
    icon: 'https://api.builderberu.com/cdn/images/sungjiwoo_rfmpth.webp',
    class: 'Monarch',
    grade: 'SSR',
    element: 'none',
    scaleStat: 'Attack',
      bdgLimits: {
    // Mode Expert (avec "Expert" dans le set droit)
    expert: {
      WIND: { max: 5000000000 },    // 5B
      WATER: { max: 20000000000 },   // 20B 
      FIRE: { max: 85000000000 },    // 85B
      LIGHT: { max: 5000000000 },   // 5B
      DARK: { max: 16000000000 }     // 16B
    },
    // Mode Support (sans "Expert")
    support: {
      WIND: { max: 2000000000 },    // 2B
      WATER: { max: 2000000000 },   // 2B
      FIRE: { max: 3000000000 },    // 3B
      LIGHT: { max: 2000000000 },    // 2B
      DARK: { max: 3000000000 }      // 3B
    }
  }
,
    importantStats: ['atk', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'shuhua': {
    name: 'Shuhua',
    img: 'https://api.builderberu.com/cdn/images/Shuhua1_difnjb.webp',
    icon: 'https://api.builderberu.com/cdn/images/IconShuhua_njc2f2.webp',
    class: 'Fighter',
    grade: 'SSR',
    element: 'Water',
    scaleStat: 'Attack',
    bdgLimits: {
      maxDamageOnElement: 8000000000,  // 8B max si bon élément
      maxDamageOffElement: 2000000000  // 2B max si mauvais élément
    },
    importantStats: ['atk', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  }, 'miyeon': {
    name: 'Miyeon',
    img: 'https://api.builderberu.com/cdn/images/miyeon_ijwudx.webp',
    icon: 'https://api.builderberu.com/cdn/images/miyeon_ijwudx.webp',
    class: 'Fighter',
    grade: 'SSR',
    element: 'Light',
    scaleStat: 'Defense',
    bdgLimits: {
      maxDamageOnElement: 10000000000,  // 73B max si bon élément
      maxDamageOffElement: 2000000000  // 9B max si mauvais élément
    },
    importantStats: ['def', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  }, 'niermann': {
    name: 'Lennart Niermann',
    img: 'https://api.builderberu.com/cdn/images/niermann_arxjer.webp',
    icon: 'https://api.builderberu.com/cdn/images/build-niermann_phfwmu.webp',
    class: 'Fighter',
    grade: 'SSR',
    element: 'Wind',
    scaleStat: 'Defense',
    bdgLimits: {
      maxDamageOnElement: 37000000000,  // 37B max si bon élément
      maxDamageOffElement: 18000000000  // 9B max si mauvais élément
    },
    importantStats: ['def', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 2.595,
      core2: 16.995,
      skill1: 84.195,
      skill2: 73.695,
      ultimate: 85.305
    },
    buffs: [
      {
        name: "Defensive Divination Circle",
        img: 'https://api.builderberu.com/cdn/images/DefensiveDivinationCircle_lennart_ln8nxu.webp',
        duration: 20, // 20 secondes
        target: 'self',
        effects: [
          { type: 'critDamageBuffs', values: [30] },
          { type: 'defense', values: [30] }
        ]
      },
      {
        name: "Defense Reduction Mark",
        img: 'https://api.builderberu.com/cdn/images/DefenseReductionMark_Lennart_rmaard.webp',
        duration: 40,
        target: 'self',
        effects: [
          { type: 'damageBuffs', values: [30] }
        ]
      },
      {
        name: "Wind Synergy",
        img: 'https://api.builderberu.com/cdn/images/fourStarLennart_y59gsr.webp',
        duration: 0,
        target: 'shared',
        effects: [
          { type: 'defense', condition: 'wind', values: [42] },
          { type: 'hp', values: [8] }
        ]
      }
    ]
  },

  'chae': {
    name: 'Cha Hae-In Valkyrie',
    img: 'https://api.builderberu.com/cdn/images/chae_mlnz8k.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-3.webp',
    class: 'Fighter',
    grade: 'SSR',
    element: 'Water',
    scaleStat: 'Defense',
    importantStats: ['atk', 'tc', 'dcc', 'defPen', 'di'],
    bdgLimits: {
      maxDamageOnElement: 25000000000,  // 25B max si bon élément
      maxDamageOffElement: 6000000000  // 6B max si mauvais élément
    },
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'kanae': {
    name: 'Tawata Kanae',
    img: 'https://api.builderberu.com/cdn/images/kanae_squvh2.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-18.webp',
    class: 'Assassin',
    grade: 'SSR',
    element: 'Fire',
    scaleStat: 'Attack',
    importantStats: ['atk', 'tc', 'dcc', 'defPen', 'di', 'mpcr', 'mpa'],
    bdgLimits: {
      maxDamageOnElement: 14000000000,  // 73B max si bon élément
      maxDamageOffElement: 3000000000  // 9B max si mauvais élément
    },
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'frieren': {
    name: 'Frieren',
    img: 'https://api.builderberu.com/cdn/images/frieren_portrait_jtvtcd.webp',
    icon: 'https://api.builderberu.com/cdn/images/frieren_portrait_jtvtcd.webp',
    class: 'Support',
    grade: 'SSR',
    element: 'Water',
    scaleStat: 'Defense',
    bdgLimits: {
      maxDamageOnElement: 15000000000,  // 15B max si bon élément
      maxDamageOffElement: 4000000000  // 4B max si mauvais élément
    },
    importantStats: ['def', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 2.76,
      core2: 14.82,
      skill1: 27.27,
      skill2: 26.61,
      ultimate: 68.69
    },
    buffs: [
      {
        name: 'Water Support',
        img: 'https://api.builderberu.com/cdn/images/frieren_portrait_jtvtcd.webp',
        duration: 30,
        target: 'shared',
        effects: [
          { type: 'defense', values: [10, 20, 30] }
        ]
      },
      {
        name: 'Water Damage Boost',
        img: 'https://api.builderberu.com/cdn/images/frieren_portrait_jtvtcd.webp',
        duration: 20,
        target: 'shared',
        effects: [
          { type: 'elementalDamage', element: 'Water', values: [1, 2, 3, 4, 5] }
        ]
      }
    ]
  },
  'stark': {
    name: 'Stark',
    img: 'https://api.builderberu.com/cdn/images/stark_portrait_ag5teg.webp',
    icon: 'https://api.builderberu.com/cdn/images/stark_portrait_ag5teg.webp',
    class: 'Break',
    grade: 'SSR',
    element: 'Fire',
    scaleStat: 'HP',
    bdgLimits: {
      maxDamageOnElement: 14000000000,  // 14B max si bon élément
      maxDamageOffElement: 4000000000  // 4B max si mauvais élément
    },
    importantStats: ['hp', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.2,
      core2: 5.5,
      skill1: 15.0,
      skill2: 18.5,
      ultimate: 42.0
    },
    buffs: [
      {
        name: 'Fire Break',
        img: 'https://api.builderberu.com/cdn/images/stark_portrait_ag5teg.webp',
        duration: 25,
        target: 'shared',
        effects: [
          { type: 'hp', values: [10, 20, 30] }
        ]
      },
      {
        name: 'Fire Damage Boost',
        img: 'https://api.builderberu.com/cdn/images/stark_portrait_ag5teg.webp',
        duration: 20,
        target: 'shared',
        effects: [
          { type: 'elementalDamage', element: 'Fire', values: [2, 4, 6, 8, 10] }
        ]
      }
    ]
  },
  'fern': {
    name: 'Fern',
    img: 'https://api.builderberu.com/cdn/images/fern_portrait_vu4q7v.webp',
    icon: 'https://api.builderberu.com/cdn/images/fern_portrait_vu4q7v.webp',
    class: 'DPS',
    grade: 'SSR',
    element: 'Fire',
    scaleStat: 'Attack',
    bdgLimits: {
      maxDamageOnElement: 13000000000,  // 13B max si bon élément
      maxDamageOffElement: 4000000000  // 4B max si mauvais élément
    },
    importantStats: ['atk', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 4.2,
      core2: 6.8,
      skill1: 18.5,
      skill2: 22.0,
      ultimate: 48.5
    },
    buffs: [
      {
        name: 'Fire Attack Boost',
        img: 'https://api.builderberu.com/cdn/images/fern_portrait_vu4q7v.webp',
        duration: 30,
        target: 'shared',
        effects: [
          { type: 'attack', values: [10, 20, 30] }
        ]
      },
      {
        name: 'Fire Damage Increase',
        img: 'https://api.builderberu.com/cdn/images/fern_portrait_vu4q7v.webp',
        duration: 25,
        target: 'shared',
        effects: [
          { type: 'elementalDamage', element: 'Fire', values: [3, 6, 9, 12, 15] }
        ]
      }
    ]
  },
  'reed': {
    name: 'Christopher Reed',
    img: 'https://api.builderberu.com/cdn/images/Reed_portrait_ldj0p5.webp',
    icon: 'https://api.builderberu.com/cdn/images/Reed_portrait_ldj0p5.webp',
    class: 'Infusion',
    grade: 'SSR',
    element: 'Fire',
    scaleStat: 'Defense',
    bdgLimits: {
      maxDamageOnElement: 15000000000,  // 15B max si bon élément
      maxDamageOffElement: 4000000000  // 4B max si mauvais élément
    },
    importantStats: ['def', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 2.76,
      core2: 14.82,
      skill1: 27.27,
      skill2: 26.61,
      ultimate: 68.69
    },
    buffs: [
      {
        name: 'Fire Infusion',
        img: 'https://api.builderberu.com/cdn/images/frieren_portrait_jtvtcd.webp',
        duration: 30,
        target: 'shared',
        effects: [
          { type: 'defense', values: [10, 20, 30] }
        ]
      },
      {
        name: 'Fire Damage Boost',
        img: 'https://api.builderberu.com/cdn/images/frieren_portrait_jtvtcd.webp',
        duration: 20,
        target: 'shared',
        effects: [
          { type: 'elementalDamage', element: 'Fire', values: [1, 2, 3, 4, 5] }
        ]
      }
    ]
  },
  'laura': {
    name: 'Laura',
    img: 'https://api.builderberu.com/cdn/images/LauraPortrait_vrrea6.webp',
    icon: 'https://api.builderberu.com/cdn/images/LauraPortrait_vrrea6.webp',
    class: 'Support',
    grade: 'SSR',
    element: 'Light',
    scaleStat: 'Attack',
    bdgLimits: {
      maxDamageOnElement: 13000000000,  // 13B max si bon élément
      maxDamageOffElement: 4000000000  // 4B max si mauvais élément
    },
    importantStats: ['atk', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 4.2,
      core2: 6.8,
      skill1: 18.5,
      skill2: 22.0,
      ultimate: 48.5
    },
    buffs: [
      {
        name: 'Light Attack Boost',
        img: 'https://api.builderberu.com/cdn/images/fern_portrait_vu4q7v.webp',
        duration: 30,
        target: 'shared',
        effects: [
          { type: 'attack', values: [10, 20, 30] }
        ]
      },
      {
        name: 'Light Damage Increase',
        img: 'https://api.builderberu.com/cdn/images/fern_portrait_vu4q7v.webp',
        duration: 25,
        target: 'shared',
        effects: [
          { type: 'elementalDamage', element: 'Light', values: [3, 6, 9, 12, 15] }
        ]
      }
    ]
  },
  'alicia': {
    name: 'Alicia Blanche',
    img: 'https://api.builderberu.com/cdn/images/alicia_fzpzkf.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build.webp',
    class: 'Mage',
    grade: 'SSR',
    element: 'Water',
    scaleStat: 'Attack', importantStats: ['atk', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 9000000000,  // 9B max si bon élément
      maxDamageOffElement: 2000000000  // 2B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'mirei': {
    name: 'Amamiya Mirei',
    img: 'https://api.builderberu.com/cdn/images/mirei_nb6arm.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-26.webp',
    class: 'Assassin',
    grade: 'SSR',
    element: 'Wind',
    scaleStat: 'Attack',
    importantStats: ['atk', 'tc', 'dcc', 'defPen', 'di', 'mpcr', 'mpa'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 6000000000,  // 73B max si bon élément
      maxDamageOffElement: 1000000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'baek': {
    name: 'Baek Yoonho',
    img: 'https://api.builderberu.com/cdn/images/baek_tgrbx8.webp',
    icon: 'https://api.builderberu.com/cdn/images/build_baek_wwcvhp.webp',
    class: 'Tank',
    grade: 'SSR',
    element: 'Light',
    scaleStat: 'Defense',
    importantStats: ['def', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 600000000,  // 73B max si bon élément
      maxDamageOffElement: 100000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'chae-in': {
    name: 'Cha Hae In',
    img: 'https://api.builderberu.com/cdn/images/chae-in_zafver.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-4.webp',
    class: 'Fighter',
    grade: 'SSR',
    element: 'Light',
    scaleStat: 'Attack',
    importantStats: ['atk', 'tc', 'dcc', 'defPen', 'di', 'mpcr', 'mpa'],
    bdgLimits: {
      maxDamageOnElement: 9000000000,  // 73B max si bon élément
      maxDamageOffElement: 1000000000  // 9B max si mauvais élément
    },
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'charlotte': {
    name: 'Charlotte',
    img: 'https://api.builderberu.com/cdn/images/charlotte_bbsqv1.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-5.webp',
    class: 'Mage',
    grade: 'SSR',
    element: 'Dark',
    scaleStat: 'Defense',
    importantStats: ['def', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 500000000,  // 73B max si bon élément
      maxDamageOffElement: 200000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'choi': {
    name: 'Choi Jong-In',
    img: 'https://api.builderberu.com/cdn/images/choi_a4k5sl.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-6.webp',
    class: 'Mage',
    grade: 'SSR',
    element: 'Fire',
    scaleStat: 'Attack',
    importantStats: ['atk', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 2000000000,  // 73B max si bon élément
      maxDamageOffElement: 800000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'emma': {
    name: 'Emma Laurent',
    img: 'https://api.builderberu.com/cdn/images/emma_vvw5lt.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-7.webp',
    class: 'Tank',
    grade: 'SSR',
    element: 'Fire',
    scaleStat: 'HP',
    importantStats: ['hp', 'tc', 'dcc', 'defPen', 'di', 'mpcr'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 3000000000,  // 73B max si bon élément
      maxDamageOffElement: 1000000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'esil': {
    name: 'Esil Radiru',
    img: 'https://api.builderberu.com/cdn/images/esil_bjzrv2.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-8.webp',
    class: 'Ranger',
    grade: 'SSR',
    element: 'Fire',
    scaleStat: 'Attack',
    importantStats: ['atk', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 5000000000,  // 73B max si bon élément
      maxDamageOffElement: 1000000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'gina': {
    name: 'Gina',
    img: 'https://api.builderberu.com/cdn/images/gina_emzlpd.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-9.webp',
    class: 'Support',
    grade: 'SSR',
    element: 'Fire',
    scaleStat: 'Attack',
    importantStats: ['atk', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 2000000000,  // 73B max si bon élément
      maxDamageOffElement: 500000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'go': {
    name: 'Go Gunhee',
    img: 'https://api.builderberu.com/cdn/images/go_e5tq0a.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-10.webp',
    class: 'Tank',
    grade: 'SSR',
    element: 'Light',
    scaleStat: 'Defense',
    importantStats: ['def', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 200000000,  // 73B max si bon élément
      maxDamageOffElement: 500000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'goto': {
    name: 'Goto Ryuji',
    img: 'https://api.builderberu.com/cdn/images/goto_pirfgy.webp',
    icon: 'https://api.builderberu.com/cdn/images/goto_pirfgy.webp',
    class: 'Tank',
    grade: 'SSR',
    element: 'Wind',
    scaleStat: 'HP',
     bdgLimits: {
      maxDamageOnElement: 8000000000,  // 15B max si bon élément
      maxDamageOffElement: 2000000000  // 4B max si mauvais élément
    },
    importantStats: ['hp', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 2.58,
      core2: 8.82,
      skill1: 6.99,
      skill2: 12.75,
      ultimate: 27.84
    },
    buffs: [
      {
        name: "Arrogance",
        img: 'https://api.builderberu.com/cdn/images/arrogance_goto_fnicil.webp',
        duration: 20, // 20 secondes
        target: 'self',
        effects: [
          { type: 'critDamageBuffs', values: [20] },
          { type: 'skillBuffs', values: [20] }
        ]
      },
      {
        name: "Third Hunter Boost",
        img: 'https://api.builderberu.com/cdn/images/fourStarGoto_qgsvgp.webp', // À remplacer
        duration: 0, // Passif permanent
        target: 'shared', // Cible spécifique : 3ème membre de l'équipe
        effects: [
          { type: 'damageBuffs', values: [24] } // +24% de dégâts
        ]
      },
      {
        name: "Exorcise",
        img: 'https://api.builderberu.com/cdn/images/exorcice_goto_ierpym.webp',
        duration: 7,
        target: 'self',
        effects: [
          { type: 'critDamageBuffs', values: [15] }
        ]
      }]
  },
  'han': {
    name: 'Han Se-Mi',
    img: 'https://api.builderberu.com/cdn/images/han_pfyz7e.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-12.webp',
    class: 'Healer',
    grade: 'SSR',
    element: 'Wind',
    scaleStat: 'HP',
    importantStats: ['hp', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 500000000,  // 73B max si bon élément
      maxDamageOffElement: 100000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'harper': {
    name: 'Harper',
    img: 'https://api.builderberu.com/cdn/images/harper_fvn1d9.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-14.webp',
    class: 'Tank',
    grade: 'SSR',
    element: 'Dark',
    scaleStat: 'HP',
    importantStats: ['hp', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 800000000,  // 73B max si bon élément
      maxDamageOffElement: 100000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'hwang': {
    name: 'Hwang Dongsoo',
    img: 'https://api.builderberu.com/cdn/images/Hwang_wumgnp.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-15.webp',
    class: 'Fighter',
    grade: 'SSR',
    element: 'Wind',
    scaleStat: 'Defense',
    importantStats: ['def', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 800000000,  // 73B max si bon élément
      maxDamageOffElement: 100000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'isla': {
    name: 'Isla Wright',
    img: 'https://api.builderberu.com/cdn/images/isla_w9mnlc.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-17.webp',
    class: 'Healer',
    grade: 'SSR',
    element: 'Dark',
    scaleStat: 'Defense',
    importantStats: ['def', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 800000000,  // 73B max si bon élément
      maxDamageOffElement: 100000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'lim': {
    name: 'Lim Tae-Gyu',
    img: 'https://api.builderberu.com/cdn/images/lim_gahgsq.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-23.webp',
    class: 'Breaker',
    grade: 'SSR',
    element: 'Dark',
    scaleStat: 'Attack',
    importantStats: ['atk', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 8.3,      // Volley Fire (663-994.5% = avg 828.75%)
      core2: 0,        // No second core attack
      skill1: 7.4,     // Shoot and Maneuver (503-984% = avg 743.5%)
      skill2: 24.0,    // Typhoon Fire (1920-2880% = avg 2400%)
      ultimate: 136.8  // Quick Fire: Typhoon Fire total (1368-2052% × 8 = 13680%)
    },
    bdgLimits: {
      maxDamageOnElement: 25000000000,  // 25B max si bon élément (Breaker Dark optimal)
      maxDamageOffElement: 8000000000   // 8B max si mauvais élément
    },
    buffs: [
      {
        name: 'Magic Boost',
        values: [30, 50, 110], // +30% (A0), +50% (A2), +110% (A3+) Core/Typhoon/Quick Fire DMG
        cooldown: 15,  // Via Shoot and Maneuver (A3+)
        duration: 15,
        target: 'self',
        type: 'skillBuffs',
        element: 'Dark'
      },
      {
        name: 'Precision & Power',
        values: [5.6, 8], // +5.6% TC, +8% DCC (8 stacks at A1+)
        cooldown: 0,  // Stacking buff
        duration: 10,
        target: 'shared',  // Team buff
        type: 'coreBuffs',
        element: 'Dark'
      }]
  },
  'lee': {
    name: 'Lee Bora',
    img: 'https://api.builderberu.com/cdn/images/lee_khjilr.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-21.webp',
    class: 'Mage',
    grade: 'SSR',
    element: 'Dark',
    scaleStat: 'Attack',
    importantStats: ['atk', 'tc', 'dcc', 'defPen', 'di', 'mpcr'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 1000000000,  // 73B max si bon élément
      maxDamageOffElement: 300000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'meilin': {
    name: 'Meilin Fisher',
    img: 'https://api.builderberu.com/cdn/images/meilin_k17bnw.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-24.webp',
    class: 'Healer',
    grade: 'SSR',
    element: 'Water',
    scaleStat: 'HP',
    importantStats: ['hp', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 600000000,  // 73B max si bon élément
      maxDamageOffElement: 200000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'min': {
    name: 'Min Byung-Gu',
    img: 'https://api.builderberu.com/cdn/images/min_tw1eio.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-25.webp',
    class: 'Healer',
    grade: 'SSR',
    element: 'Light',
    scaleStat: 'HP',
    importantStats: ['hp', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 500000000,  // 73B max si bon élément
      maxDamageOffElement: 100000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'seo': {
    name: 'Seo Jiwoo',
    img: 'https://api.builderberu.com/cdn/images/seo_qsvfhj.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-30.webp',
    class: 'Tank',
    grade: 'SSR',
    element: 'Water',
    scaleStat: 'HP',
    importantStats: ['hp', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 2000000000,  // 73B max si bon élément
      maxDamageOffElement: 600000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'seorin': {
    name: 'Seorin',
    img: 'https://api.builderberu.com/cdn/images/seorin_t7irtj.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-31.webp',
    class: 'Ranger',
    grade: 'SSR',
    element: 'Water',
    scaleStat: 'HP',
    importantStats: ['hp', 'tc', 'dcc', 'defPen', 'di', 'mpcr'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 6000000000,  // 73B max si bon élément
      maxDamageOffElement: 1300000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'shimizu': {
    name: 'Shimizu Akari',
    img: 'https://api.builderberu.com/cdn/images/shimizu_a3devg.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-32.webp',
    class: 'Healer',
    grade: 'SSR',
    element: 'Light',
    scaleStat: 'HP',
    importantStats: ['hp', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 500000000,  // 73B max si bon élément
      maxDamageOffElement: 150000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'silverbaek': {
    name: 'Silver Mane Baek Yoonho',
    img: 'https://api.builderberu.com/cdn/images/silverbaek_kg7wuz.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-33.webp',
    class: 'Fighter',
    grade: 'SSR',
    element: 'Dark',
    scaleStat: 'Attack',
    importantStats: ['atk', 'tc', 'dcc', 'defPen', 'di', 'mpa', 'mpcr'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 20000000000,  // 73B max si bon élément
      maxDamageOffElement: 15000000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'sian': {
    name: 'Sian Halat',
    img: 'https://api.builderberu.com/cdn/images/Igris_portrait_xqbgqf.webp',
    icon: 'https://api.builderberu.com/cdn/images/Igris_portrait_xqbgqf.webp',
    class: 'Assassin',
    grade: 'SSR',
    element: 'Dark',
    scaleStat: 'Attack',
     bdgLimits: {
      maxDamageOnElement: 30000000000,  // 30B max si bon élément
      maxDamageOffElement: 10000000000  // 10B max si mauvais élément
    },
    importantStats: ['atk', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    buffs: [
      {
        name: 'Def Pen Buff (A5)',
        img: 'https://api.builderberu.com/cdn/images/ilhwan_uncoloried_uzywyu-removebg-preview_t87rro.webp',
        duration: 30,
        target: 'shared', // Buff TEAM Dark only
        element: 'Dark', // Uniquement pour les membres Dark (Sung n'en profite pas !)
        effects: [
          { type: 'defPen', values: [2, 4, 6, 8, 10] } // +10% Def Pen à la TEAM Dark à A5
        ]
      }]
  },
  'son': {
    name: 'Son Kihoon',
    img: 'https://api.builderberu.com/cdn/images/Son_Portrait_vmup4f.webp',
    icon: 'https://api.builderberu.com/cdn/images/Son_Portrait_vmup4f.webp',
    class: 'Tank',
    grade: 'SSR',
    element: 'Dark',
    scaleStat: 'HP',
    importantStats: ['hp', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 800000000,  // 73B max si bon élément
      maxDamageOffElement: 100000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'thomas': {
    name: 'Thomas Andre',
    img: 'https://api.builderberu.com/cdn/images/thomas_jr9x92.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-35.webp',
    class: 'Fighter',
    grade: 'SSR',
    element: 'Light',
    scaleStat: 'Defense',
    importantStats: ['def', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 13500000000,  // 73B max si bon élément
      maxDamageOffElement: 4000000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'woo': {
    name: 'Woo Jinchul',
    img: 'https://api.builderberu.com/cdn/images/woo_pfrpik.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-36.webp',
    class: 'Tank',
    grade: 'SSR',
    element: 'Wind',
    scaleStat: 'Defense',
    importantStats: ['def', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 800000000,  // 73B max si bon élément
      maxDamageOffElement: 200000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'yoo': {
    name: 'Yoo Soohyun',
    img: 'https://api.builderberu.com/cdn/images/yoo_mrwt08.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-37.webp',
    class: 'Mage',
    grade: 'SSR',
    element: 'Fire',
    scaleStat: 'Attack',
    importantStats: ['atk', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 6000000000,  // 73B max si bon élément
      maxDamageOffElement: 2000000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'anna': {
    name: 'Anna Ruiz',
    img: 'https://api.builderberu.com/cdn/images/anna_ygnv0l.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-2.webp',
    class: 'Ranger',
    grade: 'SR',
    element: 'Water',
    scaleStat: 'Attack',
    importantStats: ['atk', 'tc', 'dcc', 'defPen', 'di', 'mpcr'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 800000000,  // 73B max si bon élément
      maxDamageOffElement: 200000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'han-song': {
    name: 'Han Song-Yi',
    img: 'https://api.builderberu.com/cdn/images/han-song_xsfzja.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-13.webp',
    class: 'Assassin',
    grade: 'SR',
    element: 'Water',
    scaleStat: 'Attack',
    importantStats: ['atk', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 250000000,  // 73B max si bon élément
      maxDamageOffElement: 100000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'hwang-dongsuk': {
    name: 'Hwang Dongsuk',
    img: 'https://api.builderberu.com/cdn/images/hwang-dongsuk_g1humr.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-16.webp',
    class: 'Tank',
    grade: 'SR',
    element: 'Dark',
    scaleStat: 'HP',
    importantStats: ['hp', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 800000000,  // 73B max si bon élément
      maxDamageOffElement: 200000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'jo': {
    name: 'Jo Kyuhwan',
    img: 'https://api.builderberu.com/cdn/images/jojo3_tjhgu8.webp',
    icon: 'https://api.builderberu.com/cdn/images/jojo_vmdzhg.webp',
    class: 'Mage',
    grade: 'SR',
    element: 'Light',
    scaleStat: 'Attack',
    importantStats: ['atk', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 400000000,  // 73B max si bon élément
      maxDamageOffElement: 100000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'kang': {
    name: 'Kang Taeshik',
    img: 'https://api.builderberu.com/cdn/images/kang_y6r5f4.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-19.webp',
    class: 'Assassin',
    grade: 'SR',
    element: 'Dark',
    scaleStat: 'Attack',
    importantStats: ['atk', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 1000000000,  // 73B max si bon élément
      maxDamageOffElement: 400000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'kim-chul': {
    name: 'Kim Chul',
    img: 'https://api.builderberu.com/cdn/images/kim-chul_z9jha4.webp',
    icon: 'https://api.builderberu.com/cdn/images/build__kim-chul_sptghm.webp',
    class: 'Tank',
    grade: 'SR',
    element: 'Light',
    scaleStat: 'Defense',
    importantStats: ['def', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 500000000,  // 73B max si bon élément
      maxDamageOffElement: 200000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'kim-sangshik': {
    name: 'Kim Sangshik',
    img: 'https://api.builderberu.com/cdn/images/kim-sangshik_rmknpe.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-20.webp',
    class: 'Tank',
    grade: 'SR',
    element: 'Wind',
    scaleStat: 'Defense',
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 600000000,  // 73B max si bon élément
      maxDamageOffElement: 200000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'lee-johee': {
    name: 'Lee Johee',
    img: 'https://api.builderberu.com/cdn/images/lee-johee_ispe3p.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-22.webp',
    class: 'Healer',
    grade: 'SR',
    element: 'Water',
    scaleStat: 'HP',
    importantStats: ['hp', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 400000000,  // 73B max si bon élément
      maxDamageOffElement: 100000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'nam': {
    name: 'Nam Chae-Young',
    img: 'https://api.builderberu.com/cdn/images/nam_rb2ogg.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-27.webp',
    class: 'Ranger',
    grade: 'SR',
    element: 'Water',
    scaleStat: 'HP',
    importantStats: ['hp', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 4000000000,  // 73B max si bon élément
      maxDamageOffElement: 100000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'park-beom': {
    name: 'Park Beom-Shik',
    img: 'https://api.builderberu.com/cdn/images/park-beom_er1y0k.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-28.webp',
    class: 'Fighter',
    grade: 'SR',
    element: 'Wind',
    scaleStat: 'Defense',
    importantStats: ['def', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 400000000,  // 73B max si bon élément
      maxDamageOffElement: 100000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'park-heejin': {
    name: 'Park Heejin',
    img: 'https://api.builderberu.com/cdn/images/park-heejin_tsukcl.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-29.webp',
    class: 'Mage',
    grade: 'SR',
    element: 'Wind',
    scaleStat: 'Attack',
    importantStats: ['atk', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 400000000,  // 73B max si bon élément
      maxDamageOffElement: 100000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'song': {
    name: 'Song Chiyul',
    img: 'https://api.builderberu.com/cdn/images/song_usr7ja.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-34.webp',
    class: 'Mage',
    grade: 'SR',
    element: 'Fire',
    scaleStat: 'Attack',
    importantStats: ['atk', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 400000000,  // 73B max si bon élément
      maxDamageOffElement: 100000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'yoo-jinho': {
    name: 'Yoo Jinho',
    img: 'https://api.builderberu.com/cdn/images/yoo-jinho_csl27q.webp',
    icon: 'https://api.builderberu.com/cdn/images/icons_build-38.webp',
    class: 'Tank',
    grade: 'SR',
    element: 'Light',
    scaleStat: 'Defense',
    importantStats: ['def', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.5,
      core2: 4.8,
      skill1: 12.0,
      skill2: 16.5,
      ultimate: 35.0
    },
    bdgLimits: {
      maxDamageOnElement: 400000000,  // 73B max si bon élément
      maxDamageOffElement: 100000000  // 9B max si mauvais élément
    },
    buffs: [
      {
        name: 'Wind Shield',
        values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
        cooldown: 12,
        duration: 8,
        target: 'shared', // 'self' ou 'shared'
        type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
        element: 'Wind'
      }]
  },
  'meri': {
    name: 'Meri Laine',
    img: 'https://api.builderberu.com/cdn/images/Meri_Portrait_kjowxk.webp',
    icon: 'https://api.builderberu.com/cdn/images/Meri_Portrait_kjowxk.webp',
    class: 'Infusion',
    grade: 'SSR',
    element: 'Water',
    scaleStat: 'HP',
    bdgLimits: {
      maxDamageOnElement: 15000000000,
      maxDamageOffElement: 4000000000
    },
    importantStats: ['hp', 'tc', 'dcc', 'defPen', 'di'],
    skillMultipliers: {
      core1: 3.0,
      core2: 12.0,
      skill1: 25.0,
      skill2: 24.0,
      ultimate: 65.0
    },
    buffs: [
      {
        name: 'Water Infusion',
        img: 'https://api.builderberu.com/cdn/images/Meri_Portrait_kjowxk.webp',
        duration: 30,
        target: 'shared',
        effects: [
          { type: 'hp', values: [10, 20, 30] }
        ]
      }
    ]
  }
};