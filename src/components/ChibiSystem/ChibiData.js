// src/components/ChibiSystem/chibiData.js
export const CHIBI_DATABASE = {
  // MYTHIQUES
  'chibi_beru_001': {
    id: 'chibi_beru_001',
    name: 'Béru Classic',
    rarity: 'Mythique',
    sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414699/beru_face_w2rdyn.png',
    messages: [
      "Kiiiek ! Je suis le plus fort !",
      "Le Monarque est le meilleur !",
      "Tu veux voir ma collection d'armes ?"
    ],
    baseStats: { attack: 150, defense: 80, hp: 1200, mana: 300 },
    unlockCondition: 'starter'
  },
  
  'chibi_tank_001': {
    id: 'chibi_tank_001', 
    name: 'Tank le Protecteur',
    rarity: 'Légendaire',
    sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604465/tank_face_n9kxrh.png',
    messages: [
      "Je protège cet enclos !",
      "Bob m'observe... 😰",
      "Tu as fait tes dailies ?"
    ],
    baseStats: { attack: 50, defense: 200, hp: 2000, mana: 100 },
    unlockCondition: 'streak_7'
  },
  
  'chibi_kaisel_001': {
    id: 'chibi_kaisel_001',
    name: 'Kaisel Tech',
    rarity: 'Mythique',
    sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750768929/Kaisel_face_dm9394.png',
    messages: [
      "Optimisation en cours...",
      "Ce code peut être amélioré",
      "Performance +++"
    ],
    baseStats: { attack: 200, defense: 100, hp: 1000, mana: 500 },
    unlockCondition: 'easter_egg_perfect_build'
  },

  // AJOUTONS DES COMMUNS ET RARES
  'chibi_shadow_001': {
    id: 'chibi_shadow_001',
    name: 'Ombre Basique',
    rarity: 'Commun',
    sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414699/beru_face_w2rdyn.png', // Temporaire
    messages: [
      "...",
      "*suit silencieusement*"
    ],
    baseStats: { attack: 30, defense: 30, hp: 300, mana: 50 },
    unlockCondition: 'gacha'
  },

  'chibi_knight_001': {
    id: 'chibi_knight_001',
    name: 'Chevalier Ombre',
    rarity: 'Rare',
    sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604465/tank_face_n9kxrh.png', // Temporaire
    messages: [
      "Pour le Monarque !",
      "Ma lame est vôtre."
    ],
    baseStats: { attack: 80, defense: 60, hp: 600, mana: 100 },
    unlockCondition: 'gacha'
  }
};

// Système de rareté
export const RARITY_COLORS = {
  Commun: '#9CA3AF',
  Rare: '#3B82F6', 
  Légendaire: '#A855F7',
  Mythique: '#F59E0B'
};