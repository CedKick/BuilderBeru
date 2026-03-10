// src/data/patternLibrary.js
// Pattern type definitions for the Boss Editor (CreateYourOwnBoss)
// Each type maps to a pattern type in ExpeditionBoss._executePattern()

export const PATTERN_TYPES = {
  cone_telegraph: {
    name: 'Cône frontal',
    icon: '🔺',
    desc: 'Attaque en cône devant le boss',
    category: 'geometric',
    params: {
      coneAngle: { label: 'Angle (°)', min: 30, max: 180, step: 5, default: 90 },
      range:     { label: 'Portée (px)', min: 100, max: 500, step: 10, default: 250 },
    },
  },
  aoe_ring: {
    name: 'Anneau AoE',
    icon: '⭕',
    desc: 'Anneau circulaire autour du boss',
    category: 'geometric',
    params: {
      innerRadius: { label: 'Rayon intérieur (px)', min: 0, max: 400, step: 10, default: 0 },
      outerRadius: { label: 'Rayon extérieur (px)', min: 100, max: 600, step: 10, default: 300 },
    },
  },
  donut: {
    name: 'Donut',
    icon: '🍩',
    desc: 'Zone safe au centre, dégâts à l\'extérieur (true damage)',
    category: 'geometric',
    params: {
      innerSafe:   { label: 'Zone safe (px)', min: 80, max: 300, step: 10, default: 150 },
      outerRadius: { label: 'Rayon létal (px)', min: 300, max: 800, step: 10, default: 600 },
    },
    forceTrueDamage: true,
  },
  double_donut: {
    name: 'Double Donut',
    icon: '🎯',
    desc: '2 phases: anneau létal puis inverse (mécanique Manaya)',
    category: 'geometric',
    params: {},
    forceTrueDamage: true,
    advanced: true,
  },
  line_telegraph: {
    name: 'Ligne droite',
    icon: '━━',
    desc: 'Attaque en ligne devant le boss',
    category: 'geometric',
    params: {
      range:     { label: 'Longueur (px)', min: 400, max: 1200, step: 50, default: 800 },
      lineWidth: { label: 'Largeur (px)', min: 30, max: 150, step: 5, default: 80 },
    },
  },
  targeted_aoe_multi: {
    name: 'Cercles ciblés',
    icon: '🎯',
    desc: 'AoE sur N hunters aléatoires (spread mechanic)',
    category: 'targeted',
    params: {
      targetCount: { label: 'Nb cibles', min: 1, max: 10, step: 1, default: 3 },
      aoeRadius:   { label: 'Rayon cercle (px)', min: 60, max: 200, step: 5, default: 100 },
    },
  },
  fire_wave: {
    name: 'Onde expansive',
    icon: '🌊',
    desc: 'Cercle qui grandit depuis le boss — courir pour esquiver',
    category: 'geometric',
    params: {
      maxRadius: { label: 'Rayon max (px)', min: 300, max: 700, step: 10, default: 500 },
      duration:  { label: 'Durée expansion (s)', min: 1.0, max: 4.0, step: 0.1, default: 2.0 },
    },
    extraVisual: {
      waveColor: { label: 'Couleur onde', type: 'color', default: '#f97316' },
    },
  },
  laser: {
    name: 'Laser',
    icon: '⚡',
    desc: 'Rayon fixe depuis le boss — dégâts continus',
    category: 'geometric',
    params: {
      range:     { label: 'Longueur (px)', min: 500, max: 1000, step: 50, default: 900 },
      lineWidth: { label: 'Épaisseur (px)', min: 30, max: 100, step: 5, default: 60 },
      duration:  { label: 'Durée (s)', min: 1.0, max: 5.0, step: 0.5, default: 2.5 },
    },
    extraVisual: {
      laserColor: { label: 'Couleur laser', type: 'color', default: '#8b5cf6' },
    },
  },
  rotating_laser: {
    name: 'Laser rotatif',
    icon: '🔄',
    desc: 'Rayon qui tourne autour du boss comme un phare',
    category: 'geometric',
    params: {
      range:         { label: 'Longueur (px)', min: 500, max: 1000, step: 50, default: 800 },
      lineWidth:     { label: 'Épaisseur (px)', min: 30, max: 100, step: 5, default: 60 },
      duration:      { label: 'Durée (s)', min: 3, max: 10, step: 0.5, default: 5 },
      rotationSpeed: { label: 'Vitesse rotation (rad/s)', min: 0.5, max: 3.0, step: 0.1, default: 1.2 },
      direction:     { label: 'Sens de rotation', options: ['cw', 'ccw'], optionLabels: ['Horaire ↻', 'Anti-horaire ↺'], default: 'cw' },
    },
    extraVisual: {
      laserColor: { label: 'Couleur', type: 'color', default: '#ef4444' },
    },
  },
  persistent_aoe: {
    name: 'Zone persistante',
    icon: '🔥',
    desc: 'Zone au sol qui inflige des dégâts dans le temps (DoT)',
    category: 'special',
    params: {
      aoeRadius:    { label: 'Rayon (px)', min: 80, max: 250, step: 10, default: 150 },
      duration:     { label: 'Durée (s)', min: 3, max: 15, step: 1, default: 8 },
      tickInterval: { label: 'Intervalle tick (s)', min: 0.5, max: 3.0, step: 0.5, default: 1.0 },
    },
  },
  aoe_full: {
    name: 'Dégâts raid + Adds',
    icon: '👹',
    desc: 'Dégâts à tous + invocation de monstres',
    category: 'special',
    params: {
      spawnsAddsType:  { label: 'Type add', type: 'select', options: ['minion', 'stone_golem', 'shadow_wraith', 'fire_elemental', 'elite'], default: 'minion' },
      spawnsAddsCount: { label: 'Nombre', min: 1, max: 8, step: 1, default: 3 },
    },
  },
  dps_check: {
    name: 'DPS Check',
    icon: '📊',
    desc: 'Test de DPS: réussir = boss stagger, échouer = boss heal + dégâts',
    category: 'special',
    params: {
      dpsThreshold:    { label: 'DPS requis (M)', min: 1, max: 10, step: 0.5, default: 4, mult: 1_000_000 },
      healPercent:     { label: 'Heal boss si échec (%)', min: 1, max: 15, step: 1, default: 5 },
      failPower:       { label: 'Dégâts si échec (×)', min: 1.0, max: 4.0, step: 0.5, default: 1.5 },
      staggerDuration: { label: 'Durée stagger (s)', min: 3, max: 10, step: 1, default: 5 },
      staggerDefMult:  { label: 'DEF boss pendant stagger (×)', min: 0.2, max: 0.8, step: 0.1, default: 0.4 },
    },
    advanced: true,
  },
  percent_hp_attack: {
    name: '% HP Attack',
    icon: '💀',
    desc: 'Réduit les HP des cibles à X% (true damage)',
    category: 'special',
    params: {
      targetHpPercent: { label: 'HP cible (%)', min: 1, max: 20, step: 1, default: 10 },
      outerRadius:     { label: 'Rayon létal (px)', min: 200, max: 800, step: 10, default: 450 },
      innerSafe:       { label: 'Zone safe intérieure (px)', min: 0, max: 300, step: 10, default: 0 },
    },
    forceTrueDamage: true,
    advanced: true,
  },
  soul_drain: {
    name: 'Drain d\'âme',
    icon: '🩸',
    desc: 'Le boss draine X% HP max des hunters et se soigne',
    category: 'special',
    params: {
      drainPercent:   { label: 'Drain (%HP max/tick)', min: 1, max: 5, step: 0.5, default: 3 },
      duration:       { label: 'Durée (s)', min: 2, max: 8, step: 0.5, default: 4 },
      tickInterval:   { label: 'Intervalle tick (s)', min: 0.3, max: 1.0, step: 0.1, default: 0.5 },
      healMultiplier: { label: 'Heal boss (×drain)', min: 1.0, max: 5.0, step: 0.5, default: 2.0 },
    },
    advanced: true,
  },
  shadow_mark: {
    name: 'Marque explosive',
    icon: '⚠️',
    desc: 'Marque N hunters — explosent après X sec (spread mechanic)',
    category: 'targeted',
    params: {
      targetCount:   { label: 'Nb marqués', min: 1, max: 8, step: 1, default: 4 },
      explodeRadius: { label: 'Rayon explosion (px)', min: 80, max: 200, step: 10, default: 130 },
      markDuration:  { label: 'Délai explosion (s)', min: 2, max: 6, step: 0.5, default: 3 },
    },
  },
};

// Categories for UI grouping
export const PATTERN_CATEGORIES = {
  geometric: { label: 'Géométrique', color: '#3b82f6' },
  targeted:  { label: 'Ciblé', color: '#f59e0b' },
  special:   { label: 'Spécial', color: '#ef4444' },
};

// Targeting modes — grouped by category for UI
export const TARGETING_MODES = [
  // Position-based (no player target needed)
  { key: 'self',    label: 'Sur le boss',       desc: 'Centré sur le boss (donut, onde, laser rotatif…)', category: 'position', icon: '🎯' },
  { key: 'nearest', label: 'Le plus proche',    desc: 'Direction du hunter le plus proche',              category: 'position', icon: '📍' },
  { key: 'farthest',label: 'Le plus loin',      desc: 'Direction du hunter le plus éloigné',             category: 'position', icon: '📍' },
  // Single target
  { key: 'highest_aggro',     label: 'Plus gros aggro',  desc: 'Cible le tank (défaut)',           category: 'single', icon: '🛡️' },
  { key: 'random',            label: 'Aléatoire',        desc: 'Un hunter au hasard',              category: 'single', icon: '🎲' },
  { key: 'highest_dps',       label: 'Plus gros DPS',    desc: 'Celui qui fait le plus de dégâts', category: 'single', icon: '⚔️' },
  { key: 'highest_heal',      label: 'Plus gros heal',   desc: 'Le meilleur soigneur',             category: 'single', icon: '💚' },
  { key: 'lowest_hp_percent', label: 'Plus faible HP%',  desc: 'Le hunter avec le moins de vie',   category: 'single', icon: '💔' },
  // Group
  { key: 'all',      label: 'Tous',      desc: 'Tous les hunters (raid-wide)', category: 'group', icon: '👥' },
  { key: 'non_tank', label: 'Non-tank',  desc: 'Tout le monde sauf les tanks', category: 'group', icon: '👥' },
];

// Category labels for targeting UI
export const TARGETING_CATEGORIES = {
  position: { label: 'Position', color: '#3b82f6', desc: 'Pas de cible, le boss agit sur lui-même ou dans une direction' },
  single:   { label: 'Cible unique', color: '#f59e0b', desc: 'Le boss vise un hunter spécifique' },
  group:    { label: 'Groupe', color: '#ef4444', desc: 'Le boss vise plusieurs hunters' },
};

// Debuff types that patterns can apply
export const DEBUFF_TYPES = [
  { key: 'poison', label: 'Poison', color: '#22c55e', params: { damage: 15, tickInterval: 2, duration: 8 } },
  { key: 'speed_down', label: 'Ralentissement', color: '#60a5fa', params: { value: 0.5, duration: 4 } },
  { key: 'atk_down', label: 'ATK -', color: '#f87171', params: { value: 0.3, duration: 5 } },
  { key: 'def_down', label: 'DEF -', color: '#fbbf24', params: { value: 0.3, duration: 5 } },
  { key: 'bleed', label: 'Saignement', color: '#dc2626', params: { value: 0.02, tickInterval: 1, duration: 6 } },
  { key: 'stun', label: 'Étourdissement', color: '#fbbf24', params: { duration: 2 } },
  { key: 'heal_reduction', label: 'Anti-soin', color: '#a855f7', params: { value: 0.5, duration: 5 } },
];

// Boss buff types
export const BOSS_BUFF_TYPES = [
  { key: 'boss_atk_up', label: 'ATK +', color: '#ef4444', params: { value: 0.2, duration: 10 } },
  { key: 'boss_spd_up', label: 'SPD +', color: '#3b82f6', params: { value: 0.2, duration: 10 } },
  { key: 'boss_shield', label: 'Bouclier', color: '#a855f7', params: { shieldHp: 50000000, duration: 15 } },
  { key: 'boss_invincible', label: 'Invincible', color: '#fbbf24', params: { duration: 3 } },
  { key: 'boss_reflect', label: 'Réflexion', color: '#ec4899', params: { value: 0.2, duration: 8 } },
  { key: 'boss_regen', label: 'Régénération', color: '#22c55e', params: { value: 0.01, duration: 10 } },
];

// Default timing values per pattern type
export function getPatternDefaults(type) {
  const base = {
    power: 1.5,
    telegraphTime: 1.5,
    castTime: 0.4,
    recoveryTime: 1.0,
    cooldown: 10,
    weight: 2,
    isTrueDamage: false,
    targeting: 'highest_aggro',
    visualColor: 'blue',
  };
  const def = PATTERN_TYPES[type];
  if (!def) return base;
  // Merge param defaults
  const params = {};
  for (const [k, v] of Object.entries(def.params || {})) {
    params[k] = v.default;
  }
  // Smart default targeting: centered patterns → 'self'
  const selfPatterns = ['aoe_ring', 'donut', 'double_donut', 'fire_wave', 'rotating_laser', 'persistent_aoe', 'aoe_full', 'dps_check', 'soul_drain'];
  const targeting = selfPatterns.includes(type) ? 'self' : base.targeting;
  return { ...base, ...params, targeting, type };
}
