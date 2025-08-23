// data/characters.js
export  const characters = {
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
      
    },'jinah': {
  name: 'Jinah',
  img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1753869840/jinah_vrbddm.png',
  icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1753869067/jinah_icon_pfdee6.png',
  class: 'Support',
  grade: 'SSR',
  element: 'Wind',
  scaleStat: 'Defense',
  importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
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
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754383923/defense_jinah_bzd7tr.png',
      duration: 30,
      target: 'self',
      effects: [
        { type: 'scaleStat', values: [10, 20, 30] }
      ]
    },
    {
      name: 'Wind Damage Taken Increase',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754383924/wind_damage_taken_jinah_brirej.png',
      duration: 20,
      target: 'shared',
      effects: [
        { type: 'elementalDamage', element: 'Wind', values: [1, 2, 3, 4, 5] }
      ]
    },
    {
      name: 'Sudden Showers',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754383915/rain_jinah_uufuxy.png',
      duration: 25,
      target: 'shared',
      effects: [
        { type: 'damageBuffs', values: [10] }
      ]
    },
    {
      name: 'Aero',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754384587/Aero_jinah_hjuchd.png',
      duration: 25,
      target: 'shared',
      effects: [
        { type: 'elementalDamage', element: 'Wind', values: [2, 4, 6, 8, 10] }
      ]
    },
    {
      name: "Wind's Touch",
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754391315/windtTouch_jinah_w7hmrx.png',
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
  img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754394834/wingOfFreedom_jinah_tavng0.png', // Tu devras uploader l'image
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
  img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754395402/fourStar_jinah_izutbk.png', // Tu devras uploader l'image
  duration: -1, // Infini (passif)
  target: 'shared', // Pour tous les membres Wind de l'équipe
  effects: [
    { type: 'elementalDamage', element: 'Wind', values: [15] } // +15% Wind damage (5% x 3 alliés Wind)
  ]
},
{
  name: "Jinah's Weapon Buff",
  img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754506761/buffWeapon_jinah_xdosfy.png',
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
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755010471/sungjiwoo_rfmpth.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755010471/sungjiwoo_rfmpth.png',
      class: 'Monarch',
      grade: 'SSR',
      element: 'none',
      scaleStat: 'Attack',
      importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
     'shuhua': {
      name: 'Shuhua',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751535917/Shuhua1_difnjb.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751536775/IconShuhua_njc2f2.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Water',
      scaleStat: 'Attack',
      importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    }, 'miyeon': {
      name: 'Miyeon',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751496034/miyeon_ijwudx.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751496034/miyeon_ijwudx.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Light',
      scaleStat: 'Defense',
      importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    }, 'niermann': {
      name: 'Lennart Niermann',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1749114179/niermann_arxjer.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1749114267/build-niermann_phfwmu.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Wind',
      scaleStat: 'Defense',
      importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
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
  img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754508325/DefensiveDivinationCircle_lennart_ln8nxu.png',
  duration: 20, // 20 secondes
  target: 'self',
  effects: [
    { type: 'critDamageBuffs', values: [30] },
    { type: 'defense', values: [30] }          
  ]
},
      {
  name: "Defense Reduction Mark",
  img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754512224/DefenseReductionMark_Lennart_rmaard.png',
  duration: 40,
  target: 'self', 
  effects: [
    { type: 'damageBuffs', values: [30] } 
  ]
},
{
  name: "Wind Synergy",
  img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754514229/fourStarLennart_y59gsr.png', 
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
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604309/chae_mlnz8k.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606282/icons/build-3.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Water',
      scaleStat: 'Defense',
      importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'kanae': {
      name: 'Tawata Kanae',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604318/kanae_squvh2.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606320/icons/build-18.png',
      class: 'Assassin',
      grade: 'SSR',
      element: 'Fire',
      scaleStat: 'Attack',
      importantStats:['atk', 'tc', 'dcc', 'defPen', 'di', 'mpa'],
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
        } ]
    },
    'alicia': {
      name: 'Alicia Blanche',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604309/alicia_fzpzkf.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606278/icons/build.png',
      class: 'Mage',
      grade: 'SSR',
      element: 'Water',
      scaleStat: 'Attack',importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'mirei': {
      name: 'Amamiya Mirei',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604327/mirei_nb6arm.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606340/icons/build-26.png',
      class: 'Assassin',
      grade: 'SSR',
      element: 'Wind',
      scaleStat: 'Attack',
      importantStats:['atk', 'tc', 'dcc', 'defPen', 'di', 'mpcr', 'mpa'],
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
        } ]
    },
    'baek': {
      name: 'Baek Yoonho',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604214/baek_tgrbx8.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747647495/build_baek_wwcvhp.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Light',
      scaleStat: 'Defense',
      importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'chae-in': {
      name: 'Cha Hae In',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604308/chae-in_zafver.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606285/icons/build-4.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Light',
      scaleStat: 'Attack',
      importantStats:['atk', 'tc', 'dcc', 'defPen', 'di', 'mpcr', 'mpa'],
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
        } ]
    },
    'charlotte': {
      name: 'Charlotte',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604306/charlotte_bbsqv1.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606287/icons/build-5.png',
      class: 'Mage',
      grade: 'SSR',
      element: 'Dark',
      scaleStat: 'Defense',
      importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'choi': {
      name: 'Choi Jong-In',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604310/choi_a4k5sl.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606289/icons/build-6.png',
      class: 'Mage',
      grade: 'SSR',
      element: 'Fire',
      scaleStat: 'Attack',
      importantStats:['atk', 'defPen', 'di'],
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
        } ]
    },
    'emma': {
      name: 'Emma Laurent',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604311/emma_vvw5lt.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606292/icons/build-7.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Fire',
      scaleStat: 'HP',
      importantStats:['hp', 'tc', 'dcc', 'defPen', 'di', 'mpcr'],
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
        } ]
    },
    'esil': {
      name: 'Esil Radiru',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604313/esil_bjzrv2.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606294/icons/build-8.png',
      class: 'Ranger',
      grade: 'SSR',
      element: 'Fire',
      scaleStat: 'Attack',
      importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'gina': {
      name: 'Gina',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604312/gina_emzlpd.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606297/icons/build-9.png',
      class: 'Support',
      grade: 'SSR',
      element: 'Fire',
      scaleStat: 'Attack',
      importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'go': {
      name: 'Go Gunhee',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604312/go_e5tq0a.png',
      icon: 'build_go.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Light',
      scaleStat: 'Defense',
      importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'goto': {
      name: 'Goto Ryuji',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604314/goto_pirfgy.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606299/icons/build-10.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Wind',
      scaleStat: 'HP',
      importantStats:['hp', 'tc', 'dcc', 'defPen', 'di'],
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
  img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754515830/arrogance_goto_fnicil.png', 
  duration: 20, // 20 secondes
  target: 'self',
  effects: [
    { type: 'critDamageBuffs', values: [20] }, 
    { type: 'skillBuffs', values: [20] } 
  ]
},
{
  name: "Third Hunter Boost",
  img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754516654/fourStarGoto_qgsvgp.png', // À remplacer
  duration: 0, // Passif permanent
  target: 'shared', // Cible spécifique : 3ème membre de l'équipe
  effects: [
    { type: 'damageBuffs', values: [24] } // +24% de dégâts
  ]
},
{
  name: "Exorcise",
  img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754555890/exorcice_goto_ierpym.png', 
  duration: 7, 
  target: 'self',
  effects: [
    { type: 'critDamageBuffs', values: [15] }
  ]
} ]
    },
    'han': {
      name: 'Han Se-Mi',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604315/han_pfyz7e.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606304/icons/build-12.png',
      class: 'Healer',
      grade: 'SSR',
      element: 'Wind',
      scaleStat: 'HP',
      importantStats:['hp', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'harper': {
      name: 'Harper',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604316/harper_fvn1d9.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606309/icons/build-14.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Dark',
      scaleStat: 'HP',
      importantStats:['hp', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'hwang': {
      name: 'Hwang Dongsoo',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604316/Hwang_wumgnp.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606311/icons/build-15.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Wind',
      scaleStat: 'Defense',
      importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'isla': {
      name: 'Isla Wright',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604215/isla_w9mnlc.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606317/icons/build-17.png',
      class: 'Healer',
      grade: 'SSR',
      element: 'Dark',
      scaleStat: 'Defense',
      importantStats:['def', 'di'],
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
        } ]
    },
    'lee': {
      name: 'Lee Bora',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604324/lee_khjilr.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606327/icons/build-21.png',
      class: 'Mage',
      grade: 'SSR',
      element: 'Dark',
      scaleStat: 'Attack',
      importantStats:['atk', 'tc', 'dcc', 'defPen', 'di', 'mpcr'],
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
        } ]
    },
    'lim': {
      name: 'Lim Tae-Gyu',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604325/lim_gahgsq.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606332/icons/build-23.png',
      class: 'Ranger',
      grade: 'SSR',
      element: 'Dark',
      scaleStat: 'Attack',
      importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'meilin': {
      name: 'Meilin Fisher',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604218/meilin_k17bnw.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606335/icons/build-24.png',
      class: 'Healer',
      grade: 'SSR',
      element: 'Water',
      scaleStat: 'HP',
      importantStats:['hp', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'min': {
      name: 'Min Byung-Gu',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604326/min_tw1eio.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606337/icons/build-25.png',
      class: 'Healer',
      grade: 'SSR',
      element: 'Light',
      scaleStat: 'HP',
      importantStats:['hp', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'seo': {
      name: 'Seo Jiwoo',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604210/seo_qsvfhj.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606349/icons/build-30.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Water',
      scaleStat: 'HP',
      importantStats:['hp', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'seorin': {
      name: 'Seorin',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604210/seorin_t7irtj.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606352/icons/build-31.png',
      class: 'Ranger',
      grade: 'SSR',
      element: 'Water',
      scaleStat: 'HP',
      importantStats:['hp', 'tc', 'dcc', 'defPen', 'di', 'mpcr'],
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
        } ]
    },
    'shimizu': {
      name: 'Shimizu Akari',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604212/shimizu_a3devg.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606355/icons/build-32.png',
      class: 'Healer',
      grade: 'SSR',
      element: 'Light',
      scaleStat: 'HP',
      importantStats:['hp', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'silverbaek': {
      name: 'Silver Mane Baek Yoonho',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604211/silverbaek_kg7wuz.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606357/icons/build-33.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Dark',
      scaleStat: 'Attack',
      importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'thomas': {
      name: 'Thomas Andre',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604216/thomas_jr9x92.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606363/icons/build-35.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Light',
      scaleStat: 'Defense',
      importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'woo': {
      name: 'Woo Jinchul',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604217/woo_pfrpik.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606367/icons/build-36.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Wind',
      scaleStat: 'Defense',
      importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'yoo': {
      name: 'Yoo Soohyun',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604218/yoo_mrwt08.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606370/icons/build-37.png',
      class: 'Mage',
      grade: 'SSR',
      element: 'Fire',
      scaleStat: 'Attack',
      importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'anna': {
      name: 'Anna Ruiz',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604212/anna_ygnv0l.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606280/icons/build-2.png',
      class: 'Ranger',
      grade: 'SR',
      element: 'Water',
      scaleStat: 'Attack',
      importantStats:['atk', 'tc', 'dcc', 'defPen', 'di', 'mpcr'],
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
        } ]
    },
    'han-song': {
      name: 'Han Song-Yi',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604213/han-song_xsfzja.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606306/icons/build-13.png',
      class: 'Assassin',
      grade: 'SR',
      element: 'Water',
      scaleStat: 'Attack',
      importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'hwang-dongsuk': {
      name: 'Hwang Dongsuk',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604317/hwang-dongsuk_g1humr.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606314/icons/build-16.png',
      class: 'Tank',
      grade: 'SR',
      element: 'Dark',
      scaleStat: 'HP',
      importantStats:['hp', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'jo': {
      name: 'Jo Kyuhwan',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747689385/jojo3_tjhgu8.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747649046/jojo_vmdzhg.png',
      class: 'Mage',
      grade: 'SR',
      element: 'Light',
      scaleStat: 'Attack',
      importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'kang': {
      name: 'Kang Taeshik',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604320/kang_y6r5f4.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606322/icons/build-19.png',
      class: 'Assassin',
      grade: 'SR',
      element: 'Dark',
      scaleStat: 'Attack',
      importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'kim-chul': {
      name: 'Kim Chul',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604322/kim-chul_z9jha4.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747646719/build__kim-chul_sptghm.png',
      class: 'Tank',
      grade: 'SR',
      element: 'Light',
      scaleStat: 'Defense',
      importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'kim-sangshik': {
      name: 'Kim Sangshik',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604321/kim-sangshik_rmknpe.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606325/icons/build-20.png',
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
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'lee-johee': {
      name: 'Lee Johee',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604323/lee-johee_ispe3p.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606330/icons/build-22.png',
      class: 'Healer',
      grade: 'SR',
      element: 'Water',
      scaleStat: 'HP',
      importantStats:['hp', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'nam': {
      name: 'Nam Chae-Young',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604328/nam_rb2ogg.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606342/icons/build-27.png',
      class: 'Ranger',
      grade: 'SR',
      element: 'Water',
      scaleStat: 'HP',
      importantStats:['hp', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'park-beom': {
      name: 'Park Beom-Shik',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604328/park-beom_er1y0k.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606345/icons/build-28.png',
      class: 'Fighter',
      grade: 'SR',
      element: 'Wind',
      scaleStat: 'Defense',
      importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'park-heejin': {
      name: 'Park Heejin',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604307/park-heejin_tsukcl.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606347/icons/build-29.png',
      class: 'Mage',
      grade: 'SR',
      element: 'Wind',
      scaleStat: 'Attack',
      importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'song': {
      name: 'Song Chiyul',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604215/song_usr7ja.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606359/icons/build-34.png',
      class: 'Mage',
      grade: 'SR',
      element: 'Fire',
      scaleStat: 'Attack',
      importantStats:['atk', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    },
    'yoo-jinho': {
      name: 'Yoo Jinho',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604221/yoo-jinho_csl27q.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606372/icons/build-38.png',
      class: 'Tank',
      grade: 'SR',
      element: 'Light',
      scaleStat: 'Defense',
      importantStats:['def', 'tc', 'dcc', 'defPen', 'di'],
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
        } ]
    }
  };