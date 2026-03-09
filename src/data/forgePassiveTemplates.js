// src/data/forgePassiveTemplates.js
// Shared between client (Forge UI) and server (validation + PassiveEngine)
// Templates are based on REAL passive types from the game engine:
//   - Artifact set passives (equipmentData.js): trigger/type system
//   - Expedition weapon passives (expeditionWeapons.js): id/triggers system
// Each template reuses an existing passive archetype so it integrates seamlessly.

export const FORGE_PASSIVE_TEMPLATES = {
  // ══════════════════════════════════════════════════════════
  // OFFENSIVE — Based on real artifact set & weapon passives
  // ══════════════════════════════════════════════════════════

  // Based on: innerFlameStack (Flamme Intérieure set) + eternalRageStack (Rage Éternelle ultime set)
  innerFlameStack: {
    name: 'Flamme Intérieure',
    desc: 'Chaque attaque : +{dmgPerStack}% dégâts (max {maxStacks} stacks).',
    category: 'offensive',
    cost: 14,
    params: {
      dmgPerStack: { label: 'Dégâts/stack (%)', options: [1, 2, 3], costs: [0, 4, 8] },
      maxStacks:   { label: 'Stacks max',       options: [5, 8, 10], costs: [0, 3, 6] },
    },
    trigger: 'afterAttack',
    ref: 'Flamme Intérieure / Rage Éternelle',
  },

  // Based on: burnProc (Cendres Ardentes set) + flame_blade (Caladbolg)
  burnProc: {
    name: 'Cendres Ardentes',
    desc: '{chance}% chance : enflamme la cible ({dotPct}% HP/s, {duration}s).',
    category: 'offensive',
    cost: 14,
    params: {
      chance:   { label: 'Chance (%)',   options: [10, 20, 30], costs: [0, 3, 7] },
      dotPct:   { label: 'DoT (%HP/s)', options: [1, 2, 3],    costs: [0, 4, 8] },
      duration: { label: 'Durée (s)',   options: [3, 4, 5],    costs: [0, 2, 4] },
    },
    trigger: 'afterAttack',
    ref: 'Cendres Ardentes / Caladbolg',
  },

  // Based on: desperateFury (Fureur du Désespoir set)
  desperateFury: {
    name: 'Fureur du Désespoir',
    desc: '+{dmgPerPct}% dégâts par 1% de HP manquant.',
    category: 'offensive',
    cost: 16,
    params: {
      dmgPerPct: { label: 'Dégâts par %HP manquant', options: [0.3, 0.5, 0.8], costs: [0, 5, 10] },
    },
    trigger: 'beforeAttack',
    ref: 'Fureur du Désespoir',
  },

  // Based on: chain_lightning (Mjolnir weapon passive)
  chainLightning: {
    name: 'Éclair en Chaîne',
    desc: '{chance}% chance : frappe en chaîne {targets} cible(s) supplémentaire(s) ({dmgPct}% dégâts).',
    category: 'offensive',
    cost: 18,
    params: {
      chance:  { label: 'Chance (%)',     options: [15, 25, 35], costs: [0, 4, 8] },
      targets: { label: 'Cibles en plus', options: [1, 2],       costs: [0, 5] },
      dmgPct:  { label: 'Dégâts chaîne (%)', options: [30, 50],  costs: [0, 4] },
    },
    trigger: 'afterAttack',
    ref: 'Mjolnir (chain_lightning)',
  },

  // Based on: dragon_slayer (Gram) + aoe_every_n
  dragonSlayer: {
    name: 'Pourfendeur',
    desc: 'Toutes les {hits} attaques : AoE {aoeMult}% ATK. Chaque ennemi touché = prochain AoE +{stackBonus}%.',
    category: 'offensive',
    cost: 18,
    params: {
      hits:       { label: 'Attaques pour AoE', options: [5, 7, 10],    costs: [6, 3, 0] },
      aoeMult:    { label: 'AoE (%ATK)',        options: [150, 200, 250], costs: [0, 4, 8] },
      stackBonus: { label: 'Stack par ennemi (%)', options: [5, 10],     costs: [0, 3] },
    },
    trigger: 'afterAttack',
    ref: 'Gram (dragon_slayer)',
  },

  // Based on: transcendentRelease (Esprit Transcendant ultime set) + def_penetration
  defIgnore: {
    name: 'Pénétration',
    desc: 'Ignore {penPct}% de la DEF ennemie en permanence.',
    category: 'offensive',
    cost: 18,
    params: {
      penPct: { label: 'Ignore DEF (%)', options: [8, 12, 16], costs: [0, 5, 10] },
    },
    trigger: 'always',
    ref: 'Esprit Transcendant',
  },

  // Based on: cursed_blade (Muramasa weapon passive)
  cursedBlade: {
    name: 'Lame Maudite',
    desc: 'Chaque crit : +{perCrit}% {statType} (max {maxStacks} stacks). Perd {hpCost}% HP max/stack.',
    category: 'offensive',
    cost: 20,
    params: {
      statType:  { label: 'Stat buffée',       options: ['ATK', 'INT'],  costs: [0, 0] },
      perCrit:   { label: 'Bonus/crit (%)',     options: [2, 3, 5],      costs: [0, 4, 10] },
      maxStacks: { label: 'Stacks max',         options: [5, 8, 10],     costs: [0, 3, 6] },
      hpCost:    { label: 'Coût HP/stack (%)',  options: [1, 0.5],       costs: [0, 5] },
    },
    trigger: 'afterCrit',
    ref: 'Muramasa (cursed_blade)',
  },

  // ══════════════════════════════════════════════════════════
  // DEFENSIVE — Based on real artifact set & weapon passives
  // ══════════════════════════════════════════════════════════

  // Based on: lifesteal (Chaînes du Destin set) + vitalSiphon (Siphon Vital ultime set)
  lifesteal: {
    name: 'Chaînes du Destin',
    desc: '{chance}% chance : vole {stealPct}% des dégâts infligés en HP.',
    category: 'defensive',
    cost: 14,
    params: {
      chance:   { label: 'Chance (%)',     options: [15, 25, 40], costs: [0, 3, 7] },
      stealPct: { label: 'Vol de vie (%)', options: [8, 12, 15],  costs: [0, 4, 8] },
    },
    trigger: 'afterAttack',
    ref: 'Chaînes du Destin / Siphon Vital',
  },

  // Based on: dodge + counter (Voile de l'Ombre set)
  dodgeCounter: {
    name: 'Voile de l\'Ombre',
    desc: '{dodgePct}% chance d\'esquiver. Après esquive : contre-attaque à {counterPct}% puissance.',
    category: 'defensive',
    cost: 16,
    params: {
      dodgePct:   { label: 'Esquive (%)',    options: [6, 10, 14], costs: [0, 4, 8] },
      counterPct: { label: 'Contre-attaque (%)', options: [60, 80, 100], costs: [0, 3, 6] },
    },
    trigger: 'onHit',
    ref: 'Voile de l\'Ombre',
  },

  // Based on: celestialShield (Gardien Céleste ultime set)
  celestialShield: {
    name: 'Gardien Céleste',
    desc: 'Début combat : bouclier de {shieldPct}% HP max. Bouclier brisé : heal {healPct}% + DEF +{defBoost}%.',
    category: 'defensive',
    cost: 16,
    params: {
      shieldPct: { label: 'Bouclier (%HP)', options: [10, 15, 20], costs: [0, 4, 8] },
      healPct:   { label: 'Heal si brisé (%)', options: [10, 20, 30], costs: [0, 3, 6] },
      defBoost:  { label: 'DEF boost (%)',  options: [10, 15, 20], costs: [0, 3, 6] },
    },
    trigger: 'onBattleStart',
    ref: 'Gardien Céleste',
  },

  // Based on: ironGuard (Cuirasse de Fer set)
  ironGuard: {
    name: 'Cuirasse de Fer',
    desc: 'Réduit dégâts critiques subis de {critReduce}%. Attaquant : -{atkDebuff}% ATK pendant 3s.',
    category: 'defensive',
    cost: 14,
    params: {
      critReduce: { label: 'Réduction crits (%)', options: [15, 20, 25], costs: [0, 3, 6] },
      atkDebuff:  { label: 'Debuff ATK (%)',      options: [3, 5, 8],    costs: [0, 3, 7] },
    },
    trigger: 'onHit',
    ref: 'Cuirasse de Fer',
  },

  // Based on: guardian_shield (Aegis weapon passive)
  guardianShield: {
    name: 'Aegis',
    desc: 'Dégâts subis -{reducePct}%. Si un allié meurt : +{atkBoost}% ATK, +{defBoost}% DEF pendant 15s.',
    category: 'defensive',
    cost: 18,
    params: {
      reducePct: { label: 'Réduction dégâts (%)', options: [10, 15, 20], costs: [0, 4, 8] },
      atkBoost:  { label: 'ATK si allié mort (%)', options: [15, 25, 35], costs: [0, 3, 7] },
      defBoost:  { label: 'DEF si allié mort (%)', options: [10, 15, 20], costs: [0, 2, 4] },
    },
    trigger: 'always',
    ref: 'Aegis (guardian_shield)',
  },

  // ══════════════════════════════════════════════════════════
  // UTILITY — Based on real artifact set & weapon passives
  // ══════════════════════════════════════════════════════════

  // Based on: devoration (Nidhogg) + warriorBlood (Sang du Guerrier set)
  devoration: {
    name: 'Dévoration',
    desc: 'Kill : +{perKill}% {statType}, +{stealPerKill}% vol de vie (max {maxStacks} stacks).',
    category: 'utility',
    cost: 14,
    params: {
      statType:     { label: 'Stat buffée',       options: ['ATK', 'INT'],  costs: [0, 0] },
      perKill:      { label: 'Bonus/kill (%)',     options: [3, 5, 8],      costs: [0, 4, 8] },
      stealPerKill: { label: 'Vol vie/kill (%)',   options: [1, 2, 3],      costs: [0, 3, 6] },
      maxStacks:    { label: 'Stacks max',         options: [3, 5, 8],      costs: [0, 3, 6] },
    },
    trigger: 'onKill',
    ref: 'Nidhogg (devoration) / Sang du Guerrier',
  },

  // Based on: commanderDef + commanderCrit (Aura du Commandeur set)
  commanderAura: {
    name: 'Aura du Commandeur',
    desc: 'Aura permanente : tous les alliés reçoivent +{buffPct}% {stat}.',
    category: 'utility',
    cost: 18,
    params: {
      stat:    { label: 'Stat buffée', options: ['ATK', 'INT', 'DEF', 'CRIT'], costs: [5, 5, 2, 4] },
      buffPct: { label: 'Bonus (%)',   options: [5, 8, 10],             costs: [0, 4, 8] },
    },
    trigger: 'always',
    ref: 'Aura du Commandeur',
  },

  // Based on: mana_flow (Thyrsus) + mysticMist (Brume Mystique set)
  manaFlow: {
    name: 'Flux de Mana',
    desc: '{freeChance}% sort gratuit (0 mana). Mana > {manaThreshold}% : dégâts +{dmgBonus}%.',
    category: 'utility',
    cost: 16,
    params: {
      freeChance:    { label: 'Sort gratuit (%)',   options: [10, 15, 20], costs: [0, 4, 8] },
      manaThreshold: { label: 'Seuil mana (%)',     options: [80, 70, 60], costs: [0, 3, 6] },
      dmgBonus:      { label: 'Bonus dégâts (%)',   options: [10, 15, 20], costs: [0, 3, 6] },
    },
    trigger: 'beforeAttack',
    ref: 'Thyrsus (mana_flow) / Brume Mystique',
  },

  // Based on: echoCD (Écho Temporel set)
  echoCD: {
    name: 'Écho Temporel',
    desc: '{chance}% chance après attaque : réduit le CD d\'un sort aléatoire de {cdReduce}.',
    category: 'utility',
    cost: 12,
    params: {
      chance:   { label: 'Chance (%)',      options: [15, 20, 30], costs: [0, 3, 7] },
      cdReduce: { label: 'CD réduit (tours)', options: [1, 2],      costs: [0, 5] },
    },
    trigger: 'afterAttack',
    ref: 'Écho Temporel',
  },

  // Based on: healCrit (Chaînes du Destin 4p) + world_tree (Yggdrasil)
  healBoost: {
    name: 'Source de Vie',
    desc: 'Soins +{healPct}%. Les overheals deviennent un bouclier ({shieldMax}% HP max).',
    category: 'utility',
    cost: 16,
    params: {
      healPct:   { label: 'Bonus soins (%)',     options: [15, 25, 35], costs: [0, 4, 8] },
      shieldMax: { label: 'Bouclier max (%HP)', options: [10, 15, 20], costs: [0, 3, 6] },
    },
    trigger: 'onHeal',
    ref: 'Yggdrasil (world_tree) / Chaînes du Destin',
  },

  // ══════════════════════════════════════════════════════════
  // DRAWBACK — Passive avec stat négative + compensation
  // Le bonus ne peut JAMAIS dépasser la valeur absolue du malus.
  // 1 tour = 7 secondes dans tous les modes.
  // ══════════════════════════════════════════════════════════

  // Pacte Maudit — sacrifie une stat pour en booster une autre
  cursedPact: {
    name: 'Pacte Maudit',
    desc: '{malusStat} -{malusValue}% permanent. En échange : {bonusStat} +{bonusValue}%. Dure {durationTurns} tours après activation.',
    category: 'drawback',
    cost: 8,
    params: {
      malusStat:      { label: 'Stat sacrifiée',  options: ['RES', 'DEF', 'HP', 'SPD'],     costs: [0, 2, 3, 4] },
      malusValue:     { label: 'Malus (%)',        options: [10, 15, 20, 25],                costs: [0, -2, -4, -6] }, // negative cost = REDUCES score
      bonusStat:      { label: 'Stat boostée',    options: ['ATK', 'INT', 'CRIT', 'CRIT_DMG'], costs: [3, 3, 4, 4] },
      bonusValue:     { label: 'Bonus (%)',        options: [5, 10, 15, 20],                 costs: [0, 3, 6, 10] },
      durationTurns:  { label: 'Durée (tours)',    options: [2, 3, 5, 0],                    costs: [0, 2, 5, 10] }, // 0 = permanent
    },
    // Constraint: bonusValue <= malusValue (enforced in UI + server)
    constraint: 'bonusValue<=malusValue',
    trigger: 'always',
    ref: 'Custom drawback system',
  },

  // Rage Berserk — sacrifie RES pour ATK, plus tu perds plus tu gagnes
  berserkerRage: {
    name: 'Rage Berserk',
    desc: '-{resMalus}% RES permanent. +{atkBonus}% {statType}. En dessous de {hpThreshold}% HP : double le bonus pendant {durationTurns} tours.',
    category: 'drawback',
    cost: 12,
    params: {
      statType:      { label: 'Stat boostée',   options: ['ATK', 'INT'],  costs: [0, 0] },
      resMalus:      { label: 'Malus RES (%)',   options: [10, 15, 20, 25], costs: [0, -2, -4, -6] },
      atkBonus:      { label: 'Bonus stat (%)',  options: [5, 10, 15, 20],  costs: [0, 3, 6, 10] },
      hpThreshold:   { label: 'Seuil HP (%)',    options: [50, 40, 30],     costs: [0, 2, 5] },
      durationTurns: { label: 'Durée x2 (tours)', options: [2, 3, 4],      costs: [0, 2, 4] },
    },
    constraint: 'atkBonus<=resMalus',
    trigger: 'always',
    ref: 'Berserker class + drawback',
  },

  // Sacrifice du Vide — sacrifie DEF pour du Crit
  voidSacrifice: {
    name: 'Sacrifice du Vide',
    desc: '-{defMalus}% DEF permanent. CRIT Rate +{critBonus}%, CRIT DMG +{critDmgBonus}%. Kill : récupère {healOnKill}% HP.',
    category: 'drawback',
    cost: 10,
    params: {
      defMalus:     { label: 'Malus DEF (%)',     options: [10, 15, 20, 25], costs: [0, -2, -4, -6] },
      critBonus:    { label: 'CRIT Rate (%)',      options: [5, 8, 10, 15],   costs: [0, 2, 4, 7] },
      critDmgBonus: { label: 'CRIT DMG (%)',       options: [5, 10, 15, 20],  costs: [0, 2, 4, 7] },
      healOnKill:   { label: 'Heal on kill (%HP)', options: [2, 3, 5],        costs: [0, 2, 5] },
    },
    constraint: 'critBonus+critDmgBonus<=defMalus*2',
    trigger: 'always',
    ref: 'Glass cannon drawback',
  },

  // Lien Mortel — sacrifie HP pour de la vitesse et des dégâts
  deathLink: {
    name: 'Lien Mortel',
    desc: '-{hpMalus}% HP max permanent. SPD +{spdBonus}. Chaque {hitInterval} attaques : {procDmg}% ATK bonus. Dure {durationTurns} tours.',
    category: 'drawback',
    cost: 10,
    params: {
      hpMalus:       { label: 'Malus HP (%)',       options: [10, 15, 20, 25], costs: [0, -2, -4, -6] },
      spdBonus:      { label: 'Bonus SPD',          options: [5, 10, 15],      costs: [0, 3, 6] },
      hitInterval:   { label: 'Attaques pour proc',  options: [3, 5, 7],        costs: [4, 2, 0] },
      procDmg:       { label: 'Dégâts bonus (%ATK)', options: [50, 80, 120],    costs: [0, 3, 7] },
      durationTurns: { label: 'Durée buff (tours)',   options: [1, 2, 3],        costs: [0, 2, 4] },
    },
    constraint: 'spdBonus<=hpMalus',
    trigger: 'afterAttack',
    ref: 'Speed glass cannon',
  },

  // Malédiction Partagée — réduit la RES mais débuff les ennemis aussi
  sharedCurse: {
    name: 'Malédiction Partagée',
    desc: '-{resMalus}% RES. Ennemis à portée : -{enemyDebuff}% {debuffStat} pendant {durationTurns} tours. Max {maxTargets} cibles.',
    category: 'drawback',
    cost: 14,
    params: {
      resMalus:      { label: 'Malus RES (%)',       options: [10, 15, 20],        costs: [0, -2, -4] },
      debuffStat:    { label: 'Stat débuffée',        options: ['ATK', 'INT', 'DEF', 'SPD'], costs: [3, 3, 2, 4] },
      enemyDebuff:   { label: 'Débuff ennemi (%)',    options: [5, 8, 12, 15],      costs: [0, 3, 5, 8] },
      durationTurns: { label: 'Durée débuff (tours)', options: [1, 2, 3],           costs: [0, 2, 5] },
      maxTargets:    { label: 'Cibles max',            options: [1, 2, 3],           costs: [0, 3, 6] },
    },
    constraint: 'enemyDebuff<=resMalus',
    trigger: 'onBattleStart',
    ref: 'AoE debuff drawback',
  },

  // ══════════════════════════════════════════════════════════
  // STACKABLE — Passifs avec mécanique de stacking avancée
  // ══════════════════════════════════════════════════════════

  // Accumulation de Puissance — stacks qui montent lentement mais fort
  powerAccumulation: {
    name: 'Accumulation de Puissance',
    desc: 'Chaque attaque : +{perStack}% {statType} (max {maxStacks}). Perd {decayPerTurn} stack(s) par tour sans attaque. A max stacks : {maxBonus}% tous dégâts pendant {burstTurns} tours.',
    category: 'offensive',
    cost: 16,
    params: {
      statType:     { label: 'Stat buffée',        options: ['ATK', 'INT'],    costs: [0, 0] },
      perStack:     { label: 'Bonus/stack (%)',     options: [1, 2, 3],         costs: [0, 3, 7] },
      maxStacks:    { label: 'Stacks max',          options: [5, 8, 10, 15],    costs: [0, 3, 6, 10] },
      decayPerTurn: { label: 'Decay/tour (stacks)', options: [1, 2, 3],         costs: [0, -2, -4] }, // more decay = cheaper
      burstTurns:   { label: 'Durée burst (tours)', options: [1, 2, 3],         costs: [0, 3, 6] },
      maxBonus:     { label: 'Bonus max stacks (%)', options: [10, 15, 20],     costs: [0, 4, 8] },
    },
    trigger: 'afterAttack',
    ref: 'Custom stacking system',
  },

  // Écho de Combat — stack sur esquive, expire après X tours
  combatEcho: {
    name: 'Écho de Combat',
    desc: 'Esquive ou crit : +{perStack}% SPD (max {maxStacks}). Chaque stack dure {stackDuration} tours. A {thresholdStacks}+ stacks : prochain coup = crit garanti.',
    category: 'utility',
    cost: 14,
    params: {
      perStack:        { label: 'SPD/stack (%)',    options: [2, 3, 5],   costs: [0, 3, 6] },
      maxStacks:       { label: 'Stacks max',       options: [3, 5, 8],   costs: [0, 3, 6] },
      stackDuration:   { label: 'Durée/stack (tours)', options: [2, 3, 5], costs: [0, 2, 5] },
      thresholdStacks: { label: 'Stacks pour crit garanti', options: [3, 5, 8], costs: [4, 2, 0] },
    },
    trigger: 'onDodge',
    ref: 'Fragarach inspiration',
  },

  // ── None ───────────────────────────────────────────────
  none: {
    name: 'Aucun passif',
    desc: 'Cette arme n\'a pas de passif spécial.',
    category: 'none',
    cost: 0,
    params: {},
    trigger: null,
  },
};

// ── Turn duration (shared constant for all game modes) ────
export const TURN_DURATION_MS = 7000; // 1 tour = 7 secondes

// ── Drawback constraint validation ──────────────────────
// Returns true if the params respect the constraint
export function validateDrawbackConstraint(passiveId, params) {
  const template = FORGE_PASSIVE_TEMPLATES[passiveId];
  if (!template?.constraint) return true;

  const c = template.constraint;

  if (c === 'bonusValue<=malusValue') {
    return (params.bonusValue || 0) <= (params.malusValue || 0);
  }
  if (c === 'atkBonus<=resMalus') {
    return (params.atkBonus || 0) <= (params.resMalus || 0);
  }
  if (c === 'critBonus+critDmgBonus<=defMalus*2') {
    return ((params.critBonus || 0) + (params.critDmgBonus || 0)) <= (params.defMalus || 0) * 2;
  }
  if (c === 'spdBonus<=hpMalus') {
    return (params.spdBonus || 0) <= (params.hpMalus || 0);
  }
  if (c === 'enemyDebuff<=resMalus') {
    return (params.enemyDebuff || 0) <= (params.resMalus || 0);
  }
  return true;
}

// ── Category labels & colors ────────────────────────────
export const PASSIVE_CATEGORIES = {
  offensive: { label: 'Offensif',  color: '#ef4444', icon: '⚔️' },
  defensive: { label: 'Défensif',  color: '#3b82f6', icon: '🛡️' },
  utility:   { label: 'Utilitaire', color: '#22c55e', icon: '🔧' },
  drawback:  { label: 'Pacte Maudit', color: '#a855f7', icon: '💀' },
  none:      { label: 'Aucun',     color: '#6b7280', icon: '—' },
};

// ── Stat costs (for bonusStat secondary stat) ────────────
export const BONUS_STAT_OPTIONS = [
  { key: 'crit_rate',   label: 'CRIT Rate',    maxValue: 20,  costPer: 1.5 },
  { key: 'crit_dmg',    label: 'CRIT DMG',     maxValue: 30,  costPer: 0.8 },
  { key: 'atk_pct',     label: 'ATK %',        maxValue: 25,  costPer: 1.0 },
  { key: 'def_pct',     label: 'DEF %',        maxValue: 25,  costPer: 0.6 },
  { key: 'hp_pct',      label: 'HP %',         maxValue: 30,  costPer: 0.5 },
  { key: 'int_pct',     label: 'INT %',        maxValue: 25,  costPer: 1.0 },
  { key: 'spd_flat',    label: 'SPD',          maxValue: 25,  costPer: 0.8 },
  { key: 'res_flat',    label: 'RES',          maxValue: 30,  costPer: 0.4 },
  { key: 'defPen',      label: 'Ignore DEF',   maxValue: 15,  costPer: 2.0 },
  { key: 'allDamage',   label: 'Tous Dégâts',  maxValue: 15,  costPer: 2.0 },
  { key: 'fireDamage',  label: 'Dégâts Feu',   maxValue: 20,  costPer: 1.0 },
  { key: 'waterDamage', label: 'Dégâts Eau',   maxValue: 20,  costPer: 1.0 },
  { key: 'shadowDamage',label: 'Dégâts Ombre', maxValue: 20,  costPer: 1.0 },
  { key: 'lightDamage', label: 'Dégâts Lumière',maxValue: 20, costPer: 1.0 },
];

// ── Awakening stat options (for A1-A5 custom) ────────────
export const AWAKENING_STAT_OPTIONS = [
  { key: 'atk_pct',     label: 'ATK %',        maxValue: 15,  costPer: 1.0 },
  { key: 'def_pct',     label: 'DEF %',        maxValue: 15,  costPer: 0.6 },
  { key: 'hp_pct',      label: 'HP %',         maxValue: 15,  costPer: 0.5 },
  { key: 'int_pct',     label: 'INT %',        maxValue: 15,  costPer: 1.0 },
  { key: 'crit_rate',   label: 'CRIT Rate',    maxValue: 12,  costPer: 1.5 },
  { key: 'crit_dmg',    label: 'CRIT DMG',     maxValue: 25,  costPer: 0.8 },
  { key: 'spd_flat',    label: 'SPD',          maxValue: 15,  costPer: 0.8 },
  { key: 'defPen',      label: 'Ignore DEF',   maxValue: 12,  costPer: 2.0 },
  { key: 'allDamage',   label: 'Tous Dégâts',  maxValue: 12,  costPer: 2.0 },
  { key: 'fireDamage',  label: 'Dégâts Feu',   maxValue: 18,  costPer: 1.0 },
  { key: 'waterDamage', label: 'Dégâts Eau',   maxValue: 18,  costPer: 1.0 },
  { key: 'shadowDamage',label: 'Dégâts Ombre', maxValue: 18,  costPer: 1.0 },
  { key: 'lightDamage', label: 'Dégâts Lumière',maxValue: 18, costPer: 1.0 },
];

// ── Rarity auto-determined by power score ───────────────
export function computeRarity(powerScore) {
  if (powerScore < 40) return 'rare';
  if (powerScore < 75) return 'legendaire';
  return 'mythique';
}

// ── Loot locations based on power score ─────────────────
// Expedition is always available. Others unlock at lower scores.
// Very OP weapons (score >= 90) are expedition-only.
export const LOOT_LOCATIONS = [
  { key: 'expedition', label: 'Expédition',  icon: '⚔️', divider: 1 },     // base rate
  { key: 'arc2',       label: 'ARC II',      icon: '🏹', divider: 50 },    // base / 50
  { key: 'arc1',       label: 'ARC I',       icon: '🗡️', divider: 1000 },  // base / 1000
  { key: 'raid_sc',    label: 'RAID SC',     icon: '👹', divider: 1000 },  // base / 1000
];

export function computeLootLocations(powerScore) {
  const locations = ['expedition'];
  if (powerScore < 90) locations.push('arc2');
  if (powerScore < 65) locations.push('arc1');
  if (powerScore < 65) locations.push('raid_sc');
  return locations;
}

// ── Expedition boss assignment ──────────────────────────
// Returns { min, max } — which bosses can drop this weapon.
// Higher score = only the hardest bosses.
export function computeExpeditionBoss(powerScore) {
  if (powerScore < 30)  return { min: 1, max: 5 };  // any boss
  if (powerScore < 50)  return { min: 2, max: 5 };
  if (powerScore < 70)  return { min: 3, max: 5 };
  if (powerScore < 85)  return { min: 4, max: 5 };
  if (powerScore < 100) return { min: 5, max: 5 };  // boss 5 only
  return { min: 5, max: 5 };                         // ultra OP = boss 5 only
}

// ── Base expedition drop rate ───────────────────────────
// NO floor — OP weapons have low drop even in expedition.
export function computeBaseDropRate(powerScore) {
  if (powerScore <= 20) return 12;
  if (powerScore <= 35) return 8;
  if (powerScore <= 50) return 5;
  if (powerScore <= 65) return 3;
  if (powerScore <= 80) return 2;
  if (powerScore <= 95) return 1;
  if (powerScore <= 110) return 0.5;
  if (powerScore <= 130) return 0.2;
  return 0.1; // score 130+ → 0.1% even in expedition
}

// ── Drop rates per location ─────────────────────────────
// Expedition = base rate (can be very low for OP weapons).
// ARC II = base/50. ARC I & RAID SC = base/1000.
export function computeDropRates(powerScore) {
  const baseRate = computeBaseDropRate(powerScore);
  const locationKeys = computeLootLocations(powerScore);
  const rates = {};
  for (const loc of LOOT_LOCATIONS) {
    if (locationKeys.includes(loc.key)) {
      const raw = baseRate / loc.divider;
      rates[loc.key] = Math.round(raw * 10000) / 10000;
    }
  }
  return rates;
}

export function formatDropRate(rate) {
  if (rate >= 1) return `${rate}%`;
  if (rate >= 0.01) return `${+(rate.toFixed(2))}%`;
  if (rate >= 0.001) return `${+(rate.toFixed(3))}%`;
  return `${(rate * 10000).toFixed(1)}/10k`;
}

// Legacy compat
export function computeDropRate(powerScore) { return computeBaseDropRate(powerScore); }
export function computeDropRateLabel(powerScore) { return formatDropRate(computeBaseDropRate(powerScore)); }

// ── Multi-passive synergy tax ────────────────────────────
// Having multiple passives makes the weapon stronger → costs more
export const MULTI_PASSIVE_TAX = [0, 0, 10, 25]; // [0, 1 passive, 2 passives, 3 passives]

// ── Compute total power score ────────────────────────────
// Rarity is no longer an input — it's derived FROM the score
export function computePowerScore({ atk, element, bonusStat, bonusValue, passives, passiveId, passiveParams, awakeningPassives }) {
  let score = 0;

  // ATK cost: 1 pt per 10 ATK
  score += Math.floor((atk || 0) / 10);

  // Element cost: offensive elements cost more
  const offensiveElements = ['fire', 'shadow', 'light'];
  if (offensiveElements.includes(element)) score += 5;
  else if (element) score += 2;

  // Bonus stat cost
  if (bonusStat && bonusValue) {
    const statDef = BONUS_STAT_OPTIONS.find(s => s.key === bonusStat);
    if (statDef) score += Math.round(bonusValue * statDef.costPer);
  }

  // Passive cost — supports array (new) or single (legacy)
  const passiveList = passives
    ? passives.filter(p => p.id && p.id !== 'none')
    : (passiveId && passiveId !== 'none' ? [{ id: passiveId, params: passiveParams || {} }] : []);

  // Multi-passive synergy tax
  score += MULTI_PASSIVE_TAX[Math.min(passiveList.length, 3)] || 0;

  for (const p of passiveList) {
    const template = FORGE_PASSIVE_TEMPLATES[p.id];
    if (template) {
      score += template.cost;
      if (p.params && template.params) {
        for (const [paramKey, paramDef] of Object.entries(template.params)) {
          const chosenValue = p.params[paramKey];
          if (chosenValue !== undefined) {
            const idx = paramDef.options.indexOf(chosenValue);
            if (idx >= 0 && paramDef.costs[idx]) {
              score += paramDef.costs[idx];
            }
          }
        }
      }
    }
  }

  // Awakening A1-A5 custom cost
  if (awakeningPassives) {
    for (const aw of awakeningPassives) {
      if (aw && aw.key && aw.value) {
        const statDef = AWAKENING_STAT_OPTIONS.find(s => s.key === aw.key);
        if (statDef) score += Math.round(aw.value * statDef.costPer);
      }
    }
  }

  return score;
}

// ── Weapon types & elements (shared vocab) ───────────────
export const WEAPON_TYPES = [
  { key: 'blade',   label: 'Épée',      icon: '⚔️' },
  { key: 'heavy',   label: 'Hache/Marteau', icon: '🪓' },
  { key: 'polearm', label: 'Lance',      icon: '🔱' },
  { key: 'ranged',  label: 'Arc',        icon: '🏹' },
  { key: 'staff',   label: 'Bâton',      icon: '🪄' },
  { key: 'scythe',  label: 'Faux',       icon: '⚰️' },
  { key: 'shield',  label: 'Bouclier',   icon: '🛡️' },
];

export const ELEMENTS = [
  { key: 'fire',    label: 'Feu',        color: '#ef4444' },
  { key: 'water',   label: 'Eau',        color: '#3b82f6' },
  { key: 'shadow',  label: 'Ombre',      color: '#8b5cf6' },
  { key: 'light',   label: 'Lumière',    color: '#eab308' },
  { key: 'wind',    label: 'Vent',       color: '#22c55e' },
  { key: 'earth',   label: 'Terre',      color: '#a16207' },
  { key: null,      label: 'Neutre',     color: '#9ca3af' },
];

export const RARITIES = [
  { key: 'rare',       label: 'Rare',       color: '#3b82f6', maxAtk: 120 },
  { key: 'legendaire', label: 'Légendaire', color: '#f59e0b', maxAtk: 200 },
  { key: 'mythique',   label: 'Mythique',   color: '#ef4444', maxAtk: 300 },
];
