// 🎮 CHIBI SPRITES CONFIG
// Configuration centralisée de tous les sprites des Chibis
// Par Kaisel 🐉 pour le Monarque des Ombres

// 🖼️ SPRITES EXISTANTS
export const CHIBI_SPRITES = {
  // 🛡️ TANK - Le défenseur bavard
  tank: {
    id: 'tank',
    name: 'Tank',
    color: '#4CAF50',
    size: 64,
    preferredCanvas: 'random',
    personality: 'defensive_funny',
    moveSpeed: 0.8,
    messageInterval: 30000,
    sprites: {
      idle: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604465/tank_face_n9kxrh.png',
      left: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748294466/tank_run_left_lxr3km.png',
      right: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748294466/tank_run_right_2_zrf0y1.png',
      up: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604462/tank_dos_bk6poi.png',
      down: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604465/tank_face_n9kxrh.png',
      // États spéciaux
      scared: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604465/tank_face_n9kxrh.png', // À créer
      happy: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604465/tank_face_n9kxrh.png' // À créer
    },
    icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604465/tank_face_n9kxrh.png'
  },

  // 🧠 BERU - L'analyste stratégique
  beru: {
    id: 'beru',
    name: 'Béru',
    color: '#8A2BE2',
    size: 80,
    preferredCanvas: 'canvas-center',
    personality: 'strategic_analyst',
    moveSpeed: 0.6,
    messageInterval: 45000,
    sprites: {
      idle: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414699/beru_face_w2rdyn.png',
      left: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414823/beru_left_bvtyba.png',
      right: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414822/beru_right_ofwvy5.png',
      up: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414738/beru_dos_dtk5ln.png',
      down: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414699/beru_face_w2rdyn.png',
      // États spéciaux
      analyzing: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748550000/beru_thinking.png',
      thinking: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748550000/beru_thinking.png'
    },
    icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414699/beru_face_w2rdyn.png'
  },

  // 🐉 KAISEL - Le debugger efficace
  kaisel: {
    id: 'kaisel',
    name: 'Kaisel',
    color: '#00FF41',
    size: 72,
    preferredCanvas: 'canvas-center',
    personality: 'efficient_debugger',
    moveSpeed: 1.2,
    messageInterval: 60000,
    sprites: {
      idle: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750768929/Kaisel_face_dm9394.png',
      left: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750768929/Kaisel_left_m8qkyi.png',
      right: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750768929/Kaisel_right_hmgppo.png',
      up: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750772247/Kaisel_dos_dstl0d.png',
      down: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750768929/Kaisel_face_dm9394.png',
      // États spéciaux
      scanning: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750768929/Kaisel_face_dm9394.png',
      debugging: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750768929/Kaisel_face_hmgppo.png'
    },
    icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750768929/Kaisel_face_dm9394.png'
  },

  // ⚔️ IGRIS - Le chevalier rouge
  igris: {
    id: 'igris',
    name: 'Igris',
    color: '#980808ff',
    size: 100,
    preferredCanvas: 'canvas-right',
    personality: 'noble_warrior',
    moveSpeed: 0.7,
    messageInterval: 90000,
    sprites: {
      idle: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754570362/igris_face_xj5mqo.png',
      left: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754570544/igris_left_cw3w5g.png',
      right: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754570506/igris_right_jmyupb.png',
      up: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754570648/igris_up_hfonzn.png',
      down: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754570362/igris_face_xj5mqo.png',
      // États spéciaux
      combat: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754570362/igris_face_xj5mqo.png', // À créer
      salute: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754570362/igris_face_xj5mqo.png' // À créer
    },
    icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754570362/igris_face_xj5mqo.png'
  },

  // 🎭 IGRISK - Tank déguisé en Igris (Easter Egg)
  igrisk: {
    id: 'igrisk',
    name: 'Igris(?)',
    color: '#FF6B6B',
    size: 100,
    preferredCanvas: 'canvas-right',
    personality: 'tank_disguised',
    moveSpeed: 0.8, // Même vitesse que Tank
    messageInterval: 30000,
    sprites: {
      idle: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754731036/igrisk_face_qpf9mh.png',
      left: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754731036/igrisk_left_jd9cad.png',
      right: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754731036/igrisk_right_i4hlil.png',
      up: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754731036/igrisk_up_dwtvy9.png',
      down: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754731036/igrisk_face_qpf9mh.png',
      // États spéciaux
      exposed: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754731036/igrisk_icon_vytfic.png'
    },
    icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754731036/igrisk_icon_vytfic.png'
  },

  // 🔥 CERBÈRE - Le gardien des enfers
  cerbere: {
    id: 'cerbere',
    name: 'Cerbère',
    color: '#e334baff',
    size: 120,
    preferredCanvas: 'canvas-left',
    personality: 'fierce_guardian',
    moveSpeed: 0.9,
    messageInterval: 75000,
    sprites: {
      idle: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754731189/cerbere_icon_dtwfhu.png',
      left: null, // À créer
      right: null, // À créer
      up: null, // À créer
      down: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754731189/cerbere_icon_dtwfhu.png',
      // États spéciaux
      barking: null, // À créer
      sleeping: null // À créer
    },
    icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754731189/cerbere_icon_dtwfhu.png'
  }
};

// 🔮 FUTURS CHIBIS (Structure préparée)
export const FUTURE_CHIBIS = {
  // 🌊 TUSK - Le guerrier glacé
  tusk: {
    id: 'tusk',
    name: 'Tusk',
    color: '#87CEEB',
    size: 90,
    preferredCanvas: 'canvas-left',
    personality: 'ice_warrior',
    moveSpeed: 0.75,
    messageInterval: 60000,
    sprites: {
      idle: null,
      left: null,
      right: null,
      up: null,
      down: null,
      // États spéciaux
      freezing: null,
      rage: null
    },
    icon: null
  },

  // ⚡ BELLION - L'assassin de l'ombre
  bellion: {
    id: 'bellion',
    name: 'Bellion',
    color: '#FFD700',
    size: 75,
    preferredCanvas: 'random',
    personality: 'shadow_assassin',
    moveSpeed: 1.5,
    messageInterval: 40000,
    sprites: {
      idle: null,
      left: null,
      right: null,
      up: null,
      down: null,
      // États spéciaux
      vanish: null,
      strike: null
    },
    icon: null
  },

  // 🐜 IRON - Le commandant des fourmis
  iron: {
    id: 'iron',
    name: 'Iron',
    color: '#8B4513',
    size: 85,
    preferredCanvas: 'canvas-center',
    personality: 'ant_commander',
    moveSpeed: 1.0,
    messageInterval: 50000,
    sprites: {
      idle: null,
      left: null,
      right: null,
      up: null,
      down: null,
      // États spéciaux
      commanding: null,
      march: null
    },
    icon: null
  },

  // 🦅 GREED - Le roi orque
  greed: {
    id: 'greed',
    name: 'Greed',
    color: '#2E8B57',
    size: 110,
    preferredCanvas: 'canvas-right',
    personality: 'orc_king',
    moveSpeed: 0.6,
    messageInterval: 80000,
    sprites: {
      idle: null,
      left: null,
      right: null,
      up: null,
      down: null,
      // États spéciaux
      roar: null,
      throne: null
    },
    icon: null
  },

  // 🔥 KAMISH - Le dragon rouge
  kamish: {
    id: 'kamish',
    name: 'Kamish',
    color: '#DC143C',
    size: 150,
    preferredCanvas: 'canvas-center',
    personality: 'ancient_dragon',
    moveSpeed: 0.5,
    messageInterval: 120000,
    sprites: {
      idle: null,
      left: null,
      right: null,
      up: null,
      down: null,
      // États spéciaux
      flying: null,
      breathing_fire: null
    },
    icon: null
  }
};

// 🎯 HELPERS
export const getChibiConfig = (chibiId) => {
  return CHIBI_SPRITES[chibiId] || FUTURE_CHIBIS[chibiId] || null;
};

export const getAllChibis = () => {
  return { ...CHIBI_SPRITES, ...FUTURE_CHIBIS };
};

export const getActiveChibis = () => {
  // Retourne seulement les chibis avec des sprites complets
  return Object.entries(CHIBI_SPRITES).reduce((acc, [key, chibi]) => {
    if (chibi.sprites.idle && chibi.sprites.left && chibi.sprites.right) {
      acc[key] = chibi;
    }
    return acc;
  }, {});
};

// 🌟 PERSONNALITÉS
export const CHIBI_PERSONALITIES = {
  defensive_funny: {
    wanderChance: 0.02,
    messageStyle: 'humorous',
    preferredActions: ['patrol', 'joke', 'protect']
  },
  strategic_analyst: {
    wanderChance: 0.003,
    messageStyle: 'analytical',
    preferredActions: ['analyze', 'observe', 'calculate']
  },
  efficient_debugger: {
    wanderChance: 0.015,
    messageStyle: 'technical',
    preferredActions: ['scan', 'debug', 'optimize']
  },
  noble_warrior: {
    wanderChance: 0.01,
    messageStyle: 'formal',
    preferredActions: ['guard', 'salute', 'patrol']
  },
  tank_disguised: {
    wanderChance: 0.02, // Comme Tank
    messageStyle: 'suspicious',
    preferredActions: ['pretend', 'mimic', 'glitch']
  },
  fierce_guardian: {
    wanderChance: 0.008,
    messageStyle: 'aggressive',
    preferredActions: ['guard', 'growl', 'patrol']
  }
};

// 🎨 EXPORT PAR DÉFAUT
export default CHIBI_SPRITES;