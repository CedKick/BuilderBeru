// 🎮 CHIBI DATABASE
// Base de données complète des 32 Chibis avec leurs stats, lore et interactions
// Par Kaisel 🐉 pour le Monarque des Ombres

import { UNLOCK_METHODS } from './ChibiDatabaseStructure';

export const CHIBI_DATABASE = {
  // 🦋 MYTHIQUES (6)
  'chibi_beru_papillon': {
    id: 'chibi_beru_papillon',
    name: 'Béru-Papillon (Alecto)',
    rarity: 'mythique',
    unlockMethod: UNLOCK_METHODS.EASTER_EGG,
    unlockCondition: 'beru_evolution_secret',
    personality: {
      description: 'Fusion entre un papillon nocturne et Béru, ses ailes vibrent d\'une aura sombre et apaisante.'
    },
    defaultMood: 'mysterieux',
    shortLore: 'Un être né de la fusion entre l\'ombre et la lumière...',
    fullLore: 'Histoire complète à venir...',
    chapters: [],
    messages: {
      taquin: [
        "Kiii... mais avec grâce maintenant !",
        "Mes ailes chatouillent les ombres..."
      ],
      sage: [
        "La nuit révèle ce que le jour cache.",
        "Entre deux mondes, je danse."
      ],
      mysterieux: [
        "Kiii… mais en douceur.",
        "La nuit est mon royaume."
      ]
    },
    baseStats: {
      attack: 180,
      defense: 120,
      hp: 1500,
      mana: 800,
      speed: 25
    },
    sprites: {
      idle: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755423129/alecto_face_irsy6q.png',
      left: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755423128/alecto_left_o1u0jo.png',
      right: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422934/alecto_right_ehb5xr.png',
      up: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422906/alecto_up_dwahgh.png',
      down: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755423129/alecto_face_irsy6q.png',
      special: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755423129/alecto_face_irsy6q.png'
    }
  },

  'chibi_debugger_ghost': {
    id: 'chibi_debugger_ghost',
    name: 'Debuggeur Fantôme',
    rarity: 'mythique',
    unlockMethod: UNLOCK_METHODS.EASTER_EGG,
    unlockCondition: 'fix_100_bugs',
    personality: {
      description: 'Un esprit codeur qui hante les lignes de code mal écrites.'
    },
    defaultMood: 'sage',
    shortLore: 'Il apparaît quand le code pleure...',
    fullLore: '',
    chapters: [],
    messages: {
      sage: [
        "Ligne 42... l'erreur est là.",
        "Ce bug... je l'ai déjà vu dans une autre dimension."
      ],
      taquin: [
        "Tu as oublié un point-virgule... encore.",
        "Ctrl+Z ne peut pas tout réparer."
      ]
    },
    baseStats: {
      attack: 150,
      defense: 100,
      hp: 1200,
      mana: 1000,
      speed: 30
    },
    sprites: {
      idle: null,
      left: null,
      right: null,
      up: null,
      down: null,
      special: null
    }
  },

  'chibi_dream_architect': {
    id: 'chibi_dream_architect',
    name: 'Architecte des Rêves',
    rarity: 'mythique',
    unlockMethod: UNLOCK_METHODS.EASTER_EGG,
    unlockCondition: 'sleep_mode_1000_times',
    personality: {
      description: 'Construit des mondes dans les songes des dormeurs.'
    },
    defaultMood: 'somnolent',
    shortLore: 'Entre veille et sommeil, il bâtit l\'impossible.',
    fullLore: '',
    chapters: [],
    messages: {
      somnolent: [
        "Zzz... je construis un château de nuages...",
        "Dans tes rêves, tout est possible."
      ],
      sage: [
        "Les rêves sont les briques de la réalité.",
        "Dors... et laisse-moi créer."
      ]
    },
    baseStats: {
      attack: 140,
      defense: 160,
      hp: 1400,
      mana: 900,
      speed: 15
    },
    sprites: {
      idle: null,
      left: null,
      right: null,
      up: null,
      down: null,
      special: null
    }
  },

  'chibi_code_guardian': {
    id: 'chibi_code_guardian',
    name: 'Gardien du Code',
    rarity: 'mythique',
    unlockMethod: UNLOCK_METHODS.EASTER_EGG,
    unlockCondition: 'konami_code',
    personality: {
      description: 'Protecteur ancien des secrets de programmation.'
    },
    defaultMood: 'protecteur',
    shortLore: 'Il garde les algorithmes perdus des anciens développeurs.',
    fullLore: '',
    chapters: [],
    messages: {
      protecteur: [
        "Ce code est sacré, ne le touche pas.",
        "Les anciens développeurs veillent à travers moi."
      ],
      sage: [
        "Chaque ligne a une âme.",
        "Le code parfait n'existe pas... mais on peut s'en approcher."
      ]
    },
    baseStats: {
      attack: 170,
      defense: 190,
      hp: 1600,
      mana: 700,
      speed: 20
    },
    sprites: {
      idle: null,
      left: null,
      right: null,
      up: null,
      down: null,
      special: null
    }
  },

  'chibi_kaisel': {
    id: 'chibi_kaisel',
    name: 'Kaisel Tech',
    rarity: 'mythique',
    unlockMethod: UNLOCK_METHODS.SPECIAL,
    unlockCondition: 'summon_kaisel',
    personality: {
      description: 'L\'assistant technique ultime, maître de l\'optimisation.'
    },
    defaultMood: 'sage',
    shortLore: 'La lame technique qui tranche les bugs.',
    fullLore: '',
    chapters: [],
    messages: {
      sage: [
        "Ce code peut être optimisé de 47%.",
        "La performance est un art."
      ],
      fier: [
        "Mon efficacité est légendaire.",
        "Aucun bug ne me résiste."
      ]
    },
    baseStats: {
      attack: 200,
      defense: 150,
      hp: 1300,
      mana: 800,
      speed: 35
    },
    sprites: {
      idle: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750768929/Kaisel_face_dm9394.png',
      left: null,
      right: null,
      up: null,
      down: null,
      special: null
    }
  },

  'chibi_beru_classic': {
    id: 'chibi_beru_classic',
    name: 'Béru Classic',
    rarity: 'mythique',
    unlockMethod: UNLOCK_METHODS.PULL,
    unlockCondition: null,
    personality: {
      description: 'Le fidèle compagnon originel, toujours enthousiaste.'
    },
    defaultMood: 'taquin',
    shortLore: 'Le premier et le plus loyal des soldats ombres.',
    fullLore: '',
    chapters: [],
    messages: {
      taquin: [
        "Kiiiek ! Je suis le plus fort !",
        "Le Monarque est le meilleur !"
      ],
      fier: [
        "Ma collection grandit chaque jour !",
        "Je suis le numéro un !"
      ]
    },
    baseStats: {
      attack: 150,
      defense: 80,
      hp: 1200,
      mana: 300,
      speed: 25
    },
    sprites: {
      idle: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414699/beru_face_w2rdyn.png',
      left: null,
      right: null,
      up: null,
      down: null,
      special: null
    }
  },

  // 🏛️ LÉGENDAIRES (5)
  'chibi_tank': {
    id: 'chibi_tank',
    name: 'Tank-Chibi',
    rarity: 'legendaire',
    unlockMethod: UNLOCK_METHODS.PULL,
    unlockCondition: null,
    personality: {
      description: 'Petit ours blindé façon ombre, roule sur le sol comme un chiot joueur.'
    },
    defaultMood: 'protecteur',
    shortLore: 'Le gardien qui ne recule jamais.',
    fullLore: '',
    chapters: [],
    messages: {
      protecteur: [
        "Je protège cet enclos !",
        "Personne ne passe !"
      ],
      taquin: [
        "Wouaf-Kiii !",
        "Je fais la boule !"
      ]
    },
    baseStats: {
      attack: 50,
      defense: 200,
      hp: 2000,
      mana: 100,
      speed: 10
    },
    sprites: {
      idle: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604465/tank_face_n9kxrh.png',
      left: null,
      right: null,
      up: null,
      down: null,
      special: null
    }
  },

  'chibi_igris': {
    id: 'chibi_igris',
    name: 'Igris-Chibi',
    rarity: 'legendaire',
    unlockMethod: UNLOCK_METHODS.PULL,
    unlockCondition: null,
    personality: {
      description: 'Chevalier miniature en armure rouge, lame disproportionnée pour sa taille.'
    },
    defaultMood: 'fier',
    shortLore: 'L\'honneur dans une petite armure.',
    fullLore: '',
    chapters: [],
    messages: {
      fier: [
        "Pour le Monarque !",
        "Mon épée est à votre service."
      ],
      protecteur: [
        "Je protège l'enclos.",
        "Nul ne passera."
      ]
    },
    baseStats: {
      attack: 180,
      defense: 150,
      hp: 1100,
      mana: 200,
      speed: 20
    },
    sprites: {
      idle: null,
      left: null,
      right: null,
      up: null,
      down: null,
      special: null
    }
  },

  'chibi_shadow_cthulhu': {
    id: 'chibi_shadow_cthulhu',
    name: 'L\'Ombre de Cthulhu',
    rarity: 'legendaire',
    unlockMethod: UNLOCK_METHODS.PULL,
    unlockCondition: null,
    personality: {
      description: 'Une créature ancienne miniaturisée, tentacules d\'ombre flottants.'
    },
    defaultMood: 'mysterieux',
    shortLore: 'Les abysses regardent aussi...',
    fullLore: '',
    chapters: [],
    messages: {
      mysterieux: [
        "Ph'nglui mglw'nafh...",
        "Les étoiles s'alignent..."
      ],
      dramatique: [
        "L'ancien monde se réveille.",
        "Les profondeurs appellent."
      ]
    },
    baseStats: {
      attack: 160,
      defense: 140,
      hp: 1300,
      mana: 600,
      speed: 15
    },
    sprites: {
      idle: null,
      left: null,
      right: null,
      up: null,
      down: null,
      special: null
    }
  },

  'chibi_cheshire_black': {
    id: 'chibi_cheshire_black',
    name: 'Chat du Cheshire Noir',
    rarity: 'legendaire',
    unlockMethod: UNLOCK_METHODS.PULL,
    unlockCondition: null,
    personality: {
      description: 'Un chat souriant qui apparaît et disparaît, laissant son sourire flotter.'
    },
    defaultMood: 'farceur',
    shortLore: 'Tous les chemins mènent... nulle part.',
    fullLore: '',
    chapters: [],
    messages: {
      farceur: [
        "Tu es perdu ? Parfait !",
        "Mon sourire reste... mais moi je pars."
      ],
      mysterieux: [
        "Nous sommes tous fous ici.",
        "La réalité est surfaite."
      ]
    },
    baseStats: {
      attack: 140,
      defense: 120,
      hp: 1000,
      mana: 500,
      speed: 40
    },
    sprites: {
      idle: null,
      left: null,
      right: null,
      up: null,
      down: null,
      special: null
    }
  },

  // 🌟 RARES (11)
  'chibi_shadow_raven': {
    id: 'chibi_shadow_raven',
    name: 'Shadow-Raven',
    rarity: 'rare',
    unlockMethod: UNLOCK_METHODS.PULL,
    unlockCondition: null,
    personality: {
      description: 'Corbeau noir aux yeux rouges, parfois perché sur une ombre mouvante.'
    },
    defaultMood: 'mysterieux',
    shortLore: 'Un corbeau masqué venu d\'un monde brisé.',
    fullLore: 'Raven-Shadow – L\'Ombre aux Deux Noms...',
    chapters: [
      // Les 10 chapitres complets sont dans le fichier Excel
    ],
    messages: {
      taquin: [
        "T'as failli marcher sur mon ombre… et crois-moi, elle mord.",
        "Oh… t'as peur ? C'était juste un battement d'aile."
      ],
      sage: [
        "Chaque aile perdue est une leçon gravée dans le vent.",
        "La lumière et l'ombre ne sont pas ennemies, juste deux facettes d'un même vol."
      ],
      mysterieux: [
        "Mon vrai nom ? Tu ne pourrais pas le prononcer.",
        "Certains fragments de moi ne doivent jamais être retrouvés."
      ],
      // Tous les autres moods...
    },
    baseStats: {
      attack: 130,
      defense: 90,
      hp: 800,
      mana: 400,
      speed: 35
    },
    sprites: {
      idle: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422541/Raven_face_xse2x9.png',
      left: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422542/Raven_left_npo61o.png',
      right: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422543/Raven_right_btxwos.png',
      up: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422544/Raven_up_binfar.png',
      down: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422541/Raven_face_xse2x9.png',
      special: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422541/Raven_face_xse2x9.png'
    }
  },

  'chibi_lil_kaisel': {
    id: 'chibi_lil_kaisel',
    name: 'Lil\' Kaisel',
    rarity: 'rare',
    unlockMethod: UNLOCK_METHODS.PULL,
    unlockCondition: null,
    personality: {
      description: 'Dragonnet inspiré de Kaisel, crache des étincelles bleues.'
    },
    defaultMood: 'taquin',
    shortLore: 'Née dans l\'ombre d\'une bataille légendaire.',
    fullLore: 'Lil\' Kaisel n\'est pas née dans un monde paisible...',
    chapters: [
      // Les 10 chapitres complets sont dans le fichier Excel
    ],
    messages: {
      taquin: [
        "Tu crois que je suis petite ? Approche un peu… 😏",
        "Oups… c'était ton sac qui brûle là ?"
      ],
      fier: [
        "Je suis l'héritière d'Onyxia… et la fille de Kly !",
        "Ces flammes bleues… personne ne peut les éteindre."
      ],
      // Tous les autres moods...
    },
    baseStats: {
      attack: 120,
      defense: 80,
      hp: 700,
      mana: 350,
      speed: 30
    },
    sprites: {
      idle: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422081/lil_face_vyjvxz.png',
      left: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422081/lil_left_otwk5g.png',
      right: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422082/lil_right_sgueer.png',
      up: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422082/lil_up_ibp5cz.png',
      down: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422081/lil_face_vyjvxz.png',
      special: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422081/lil_face_vyjvxz.png'
    }
  },

  'chibi_streak_guardian': {
    id: 'chibi_streak_guardian',
    name: 'Gardien du Streak',
    rarity: 'rare',
    unlockMethod: UNLOCK_METHODS.STREAK,
    unlockCondition: 30,
    personality: {
      description: 'Apparaît après 30 jours de connexion consécutifs.'
    },
    defaultMood: 'loyal',
    shortLore: 'La constance récompensée.',
    fullLore: '',
    chapters: [],
    messages: {
      loyal: [
        "30 jours... tu es digne.",
        "La persévérance forge les légendes."
      ],
      fier: [
        "Peu arrivent jusqu'ici.",
        "Tu as gagné ma confiance."
      ]
    },
    baseStats: {
      attack: 100,
      defense: 120,
      hp: 900,
      mana: 250,
      speed: 25
    },
    sprites: {
      idle: null,
      left: null,
      right: null,
      up: null,
      down: null,
      special: null
    }
  },

  'chibi_cerberus': {
    id: 'chibi_cerberus',
    name: 'Chibi Cerbère',
    rarity: 'rare',
    unlockMethod: UNLOCK_METHODS.PULL,
    unlockCondition: null,
    personality: {
      description: 'Trois têtes, trois fois plus de câlins... ou de morsures.'
    },
    defaultMood: 'protecteur',
    shortLore: 'Le gardien des portes miniature.',
    fullLore: '',
    chapters: [],
    messages: {
      protecteur: [
        "Woof woof woof !",
        "Trois têtes valent mieux qu'une !"
      ],
      enerve: [
        "GRRR ! GRRR ! GRRR !",
        "Triple morsure !"
      ]
    },
    baseStats: {
      attack: 110,
      defense: 130,
      hp: 1000,
      mana: 150,
      speed: 20
    },
    sprites: {
      idle: null,
      left: null,
      right: null,
      up: null,
      down: null,
      special: null
    }
  },

  'chibi_shadow_smith': {
    id: 'chibi_shadow_smith',
    name: 'Forgeron des Ombres',
    rarity: 'rare',
    unlockMethod: UNLOCK_METHODS.PULL,
    unlockCondition: null,
    personality: {
      description: 'Forge des armes d\'ombre avec son petit marteau.'
    },
    defaultMood: 'fier',
    shortLore: 'Chaque coup de marteau résonne dans l\'ombre.',
    fullLore: '',
    chapters: [],
    messages: {
      fier: [
        "Mes créations sont parfaites !",
        "Ce marteau forge des légendes."
      ],
      sage: [
        "Le métal a une âme.",
        "Patience et précision."
      ]
    },
    baseStats: {
      attack: 95,
      defense: 110,
      hp: 850,
      mana: 200,
      speed: 15
    },
    sprites: {
      idle: null,
      left: null,
      right: null,
      up: null,
      down: null,
      special: null
    }
  },

  'chibi_lil_hades': {
    id: 'chibi_lil_hades',
    name: 'Lil\' Hades',
    rarity: 'rare',
    unlockMethod: UNLOCK_METHODS.PULL,
    unlockCondition: null,
    personality: {
      description: 'Petit seigneur des enfers, cape flottante et flammes bleues.'
    },
    defaultMood: 'dramatique',
    shortLore: 'Les enfers en format pocket.',
    fullLore: '',
    chapters: [],
    messages: {
      dramatique: [
        "Les morts m'appellent...",
        "Mon royaume est vaste et sombre."
      ],
      farceur: [
        "Boo ! Je suis terrifiant, non ?",
        "Les enfers, c'est plus fun qu'on croit !"
      ]
    },
    baseStats: {
      attack: 125,
      defense: 85,
      hp: 750,
      mana: 450,
      speed: 25
    },
    sprites: {
      idle: null,
      left: null,
      right: null,
      up: null,
      down: null,
      special: null
    }
  },

  'chibi_wandering_lantern': {
    id: 'chibi_wandering_lantern',
    name: 'Lanterne Errante',
    rarity: 'rare',
    unlockMethod: UNLOCK_METHODS.STREAK,
    unlockCondition: 45,
    personality: {
      description: 'Guide les âmes perdues avec sa lumière douce.'
    },
    defaultMood: 'sage',
    shortLore: 'Une lumière dans l\'obscurité.',
    fullLore: '',
    chapters: [],
    messages: {
      sage: [
        "Suis ma lumière...",
        "Le chemin est éclairé."
      ],
      mysterieux: [
        "Les ombres fuient ma lueur.",
        "Je connais tous les chemins cachés."
      ]
    },
    baseStats: {
      attack: 70,
      defense: 100,
      hp: 600,
      mana: 500,
      speed: 35
    },
    sprites: {
      idle: null,
      left: null,
      right: null,
      up: null,
      down: null,
      special: null
    }
  },

  // 🟢 COMMUNS (10)
  'Okami': {
    id: 'Okami',
    name: 'Okami',
    rarity: 'mythique',
    unlockMethod: UNLOCK_METHODS.PULL,
    unlockCondition: null,
    personality: {
      description: 'Un coffre sur pattes qui mord ceux qui s\'approchent.'
    },
    defaultMood: 'farceur',
    shortLore: 'Ce n\'est pas un coffre...',
    fullLore: '',
    chapters: [],
    messages: {
      farceur: [
        "Surprise ! Je ne suis pas un trésor !",
        "Approche... j'ai quelque chose pour toi... CLAC !"
      ],
      gourmand: [
        "J'ai faim... d'aventuriers !",
        "Tu as des pièces d'or à manger ?"
      ]
    },
    baseStats: {
      attack: 60,
      defense: 70,
      hp: 400,
      mana: 50,
      speed: 10
    },
    sprites: {
      idle: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422300/Okami_face_qfzt4j.png',
      left: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422301/Okami_left_rnjuja.png',
      right: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422300/Okami_right_jutwqc.png',
      up: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422299/Okami_up_a5gewa.png',
      down: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422300/Okami_face_qfzt4j.png',
      special: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422300/Okami_face_qfzt4j.png'
    }
  },

  'chibi_shadow_cat': {
    id: 'chibi_shadow_cat',
    name: 'Ombre-Chat',
    rarity: 'commun',
    unlockMethod: UNLOCK_METHODS.PULL,
    unlockCondition: null,
    personality: {
      description: 'Un chat fait d\'ombres mouvantes, yeux luisants.'
    },
    defaultMood: 'curieux',
    shortLore: 'Miaou de l\'ombre.',
    fullLore: '',
    chapters: [],
    messages: {
      curieux: [
        "Miaou ?",
        "C'est quoi ça ? *renifle*"
      ],
      somnolent: [
        "Zzz... ronron d'ombre...",
        "Laisse-moi dormir dans ton ombre."
      ]
    },
    baseStats: {
      attack: 40,
      defense: 30,
      hp: 300,
      mana: 100,
      speed: 40
    },
    sprites: {
      idle: null,
      left: null,
      right: null,
      up: null,
      down: null,
      special: null
    }
  },

  'chibi_shadow_slime': {
    id: 'chibi_shadow_slime',
    name: 'Slime d\'Ombre',
    rarity: 'commun',
    unlockMethod: UNLOCK_METHODS.PULL,
    unlockCondition: null,
    personality: {
      description: 'Une masse gluante et mignonne qui rebondit partout.'
    },
    defaultMood: 'taquin',
    shortLore: 'Boing boing dans l\'ombre !',
    fullLore: '',
    chapters: [],
    messages: {
      taquin: [
        "Sploutch !",
        "Je rebondis sur toi !"
      ],
      gourmand: [
        "Gloup gloup !",
        "Tout est nourriture pour un slime !"
      ]
    },
    baseStats: {
      attack: 30,
      defense: 50,
      hp: 500,
      mana: 20,
      speed: 15
    },
    sprites: {
      idle: null,
      left: null,
      right: null,
      up: null,
      down: null,
      special: null
    }
  },

  'chibi_cursed_grimoire': {
    id: 'chibi_cursed_grimoire',
    name: 'Grimoire Maudit',
    rarity: 'commun',
    unlockMethod: UNLOCK_METHODS.PULL,
    unlockCondition: null,
    personality: {
      description: 'Un livre flottant aux pages qui se tournent seules.'
    },
    defaultMood: 'sage',
    shortLore: 'Les connaissances interdites...',
    fullLore: '',
    chapters: [],
    messages: {
      sage: [
        "Page 666... intéressant.",
        "Le savoir a un prix."
      ],
      mysterieux: [
        "Ne lis pas la dernière page...",
        "Certains sorts ne doivent pas être prononcés."
      ]
    },
    baseStats: {
      attack: 20,
      defense: 40,
      hp: 350,
      mana: 300,
      speed: 20
    },
    sprites: {
      idle: null,
      left: null,
      right: null,
      up: null,
      down: null,
      special: null
    }
  },

  'chibi_sound_specter': {
    id: 'chibi_sound_specter',
    name: 'Spectre Sonore',
    rarity: 'commun',
    unlockMethod: UNLOCK_METHODS.PULL,
    unlockCondition: null,
    personality: {
      description: 'Un fantôme qui communique par échos et vibrations.'
    },
    defaultMood: 'timide',
    shortLore: 'Les mots sont des échos...',
    fullLore: '',
    chapters: [],
    messages: {
      timide: [
        "...écho... écho...",
        "*murmure incompréhensible*"
      ],
      curieux: [
        "Ta voix... résonne...",
        "Écoute... le silence..."
      ]
    },
    baseStats: {
      attack: 35,
      defense: 25,
      hp: 250,
      mana: 200,
      speed: 30
    },
    sprites: {
      idle: null,
      left: null,
      right: null,
      up: null,
      down: null,
      special: null
    }
  },

  // Plus de communs à ajouter selon les besoins...
  'chibi_shadow_sprite': {
    id: 'chibi_shadow_sprite',
    name: 'Lutin d\'Ombre',
    rarity: 'commun',
    unlockMethod: UNLOCK_METHODS.PULL,
    unlockCondition: null,
    personality: {
      description: 'Petit esprit farceur qui cache les objets.'
    },
    defaultMood: 'farceur',
    shortLore: 'Où sont passées tes clés ?',
    fullLore: '',
    chapters: [],
    messages: {
      farceur: [
        "Hihi ! C'est moi qui l'ai !",
        "Cache-cache avec tes affaires !"
      ]
    },
    baseStats: {
      attack: 25,
      defense: 35,
      hp: 280,
      mana: 150,
      speed: 45
    },
    sprites: {
      idle: null,
      left: null,
      right: null,
      up: null,
      down: null,
      special: null
    }
  },

  'chibi_void_butterfly': {
    id: 'chibi_void_butterfly',
    name: 'Papillon du Vide',
    rarity: 'commun',
    unlockMethod: UNLOCK_METHODS.PULL,
    unlockCondition: null,
    personality: {
      description: 'Ses ailes absorbent la lumière autour de lui.'
    },
    defaultMood: 'mysterieux',
    shortLore: 'La beauté du néant.',
    fullLore: '',
    chapters: [],
    messages: {
      mysterieux: [
        "Le vide est paisible...",
        "Mes ailes effacent les couleurs."
      ]
    },
    baseStats: {
      attack: 30,
      defense: 20,
      hp: 200,
      mana: 250,
      speed: 50
    },
    sprites: {
      idle: null,
      left: null,
      right: null,
      up: null,
      down: null,
      special: null
    }
  },

  'chibi_echo_wisp': {
    id: 'chibi_echo_wisp',
    name: 'Feu Follet d\'Écho',
    rarity: 'commun',
    unlockMethod: UNLOCK_METHODS.PULL,
    unlockCondition: null,
    personality: {
      description: 'Répète les derniers mots qu\'il entend.'
    },
    defaultMood: 'curieux',
    shortLore: '...tends... ...tends...',
    fullLore: '',
    chapters: [],
    messages: {
      curieux: [
        "...ieux ?... ieux ?",
        "...cho... ...cho..."
      ]
    },
    baseStats: {
      attack: 15,
      defense: 15,
      hp: 180,
      mana: 180,
      speed: 35
    },
    sprites: {
      idle: null,
      left: null,
      right: null,
      up: null,
      down: null,
      special: null
    }
  },

  'chibi_shadow_mushroom': {
    id: 'chibi_shadow_mushroom',
    name: 'Champignon d\'Ombre',
    rarity: 'commun',
    unlockMethod: UNLOCK_METHODS.PULL,
    unlockCondition: null,
    personality: {
      description: 'Libère des spores somnifères quand il est content.'
    },
    defaultMood: 'somnolent',
    shortLore: 'Spores de rêves...',
    fullLore: '',
    chapters: [],
    messages: {
      somnolent: [
        "Spooore... zzz...",
        "Tout le monde... dort..."
      ]
    },
    baseStats: {
      attack: 20,
      defense: 60,
      hp: 450,
      mana: 80,
      speed: 5
    },
    sprites: {
      idle: null,
      left: null,
      right: null,
      up: null,
      down: null,
      special: null
    }
  },

  'chibi_dust_bunny': {
    id: 'chibi_dust_bunny',
    name: 'Lapin de Poussière',
    rarity: 'commun',
    unlockMethod: UNLOCK_METHODS.PULL,
    unlockCondition: null,
    personality: {
      description: 'Se cache sous les meubles et éternue beaucoup.'
    },
    defaultMood: 'timide',
    shortLore: 'Atchoum !',
    fullLore: '',
    chapters: [],
    messages: {
      timide: [
        "*se cache*",
        "Je... je suis là..."
      ],
      taquin: [
        "ATCHOUM ! Oups...",
        "La poussière, c'est rigolo !"
      ]
    },
    baseStats: {
      attack: 10,
      defense: 45,
      hp: 320,
      mana: 60,
      speed: 25
    },
    sprites: {
      idle: null,
      left: null,
      right: null,
      up: null,
      down: null,
      special: null
    }
  }
};

// 🎯 FONCTION HELPER POUR OBTENIR UN CHIBI PAR ID
export function getChibiById(id) {
  return CHIBI_DATABASE[id] || null;
}

// 🎲 FONCTION POUR OBTENIR TOUS LES CHIBIS D'UNE RARETÉ
export function getChibisByRarity(rarity) {
  return Object.values(CHIBI_DATABASE).filter(chibi => 
    chibi.rarity.toLowerCase() === rarity.toLowerCase()
  );
}

// 🔓 FONCTION POUR OBTENIR LES CHIBIS DÉBLOQUABLES
export function getUnlockableChibis(method) {
  return Object.values(CHIBI_DATABASE).filter(chibi => 
    chibi.unlockMethod === method
  );
}

// 📊 STATS GLOBALES
export const CHIBI_STATS = {
  total: Object.keys(CHIBI_DATABASE).length,
  byRarity: {
    mythique: getChibisByRarity('mythique').length,
    legendaire: getChibisByRarity('legendaire').length,
    rare: getChibisByRarity('rare').length,
    commun: getChibisByRarity('commun').length
  },
  byUnlockMethod: {
    pull: getUnlockableChibis(UNLOCK_METHODS.PULL).length,
    easter_egg: getUnlockableChibis(UNLOCK_METHODS.EASTER_EGG).length,
    streak: getUnlockableChibis(UNLOCK_METHODS.STREAK).length,
    special: getUnlockableChibis(UNLOCK_METHODS.SPECIAL).length
  }
};

// Export par défaut
export default CHIBI_DATABASE;