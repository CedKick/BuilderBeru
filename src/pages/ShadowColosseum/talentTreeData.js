// talentTreeData.js — Talent Tree WoW-style pour Shadow Colosseum
// 3 arbres, 51 points max (lv10-60), paliers 0/5/10/15

export const TALENT_TREES = {
  fury: {
    id: 'fury',
    name: 'Fureur',
    icon: '\u{1F5E1}\uFE0F',
    color: 'red',
    accent: '#EF4444',
    desc: 'Offense physique et puissance brute',
    rows: [
      {
        tier: 0, requiredPoints: 0,
        nodes: [
          { id: 'fury_brute_force', name: 'Force Brute', icon: '\u{1F4AA}', maxRank: 5, perRank: { atkPercent: 3 }, pos: 0, desc: '+{v}% ATK' },
          { id: 'fury_precision', name: 'Precision', icon: '\u{1F3AF}', maxRank: 3, perRank: { critRate: 2 }, pos: 2, desc: '+{v}% Taux Critique' },
        ],
      },
      {
        tier: 1, requiredPoints: 5,
        nodes: [
          { id: 'fury_fatal_blow', name: 'Coup Fatal', icon: '\u26A1', maxRank: 5, perRank: { critDamage: 6 }, pos: 0, desc: '+{v}% Degats Critiques' },
          { id: 'fury_rapid_assault', name: 'Assaut Rapide', icon: '\u{1F4A8}', maxRank: 3, perRank: { spdPercent: 1.5 }, pos: 2, desc: '+{v}% SPD' },
        ],
      },
      {
        tier: 2, requiredPoints: 10,
        nodes: [
          { id: 'fury_warrior_rage', name: 'Rage du Guerrier', icon: '\u{1F525}', maxRank: 3, perRank: { physicalDamage: 5 }, pos: 1, desc: '+{v}% Degats Physiques' },
        ],
      },
      {
        tier: 3, requiredPoints: 15,
        nodes: [
          { id: 'fury_berserk', name: 'Berserk', icon: '\u{1F479}', maxRank: 1, perRank: {}, pos: 1, desc: 'PV < 30% : ATK +40%', capstone: true },
        ],
      },
    ],
  },

  arcane: {
    id: 'arcane',
    name: 'Arcane',
    icon: '\u2728',
    color: 'blue',
    accent: '#3B82F6',
    desc: 'Maitrise elementaire et degats magiques',
    rows: [
      {
        tier: 0, requiredPoints: 0,
        nodes: [
          { id: 'arcane_elemental_affinity', name: 'Affinite Elem.', icon: '\u{1F300}', maxRank: 5, perRank: { elementalDamage: 4 }, pos: 0, desc: '+{v}% Degats Elementaires' },
          { id: 'arcane_flow_mastery', name: 'Maitrise Flux', icon: '\u231B', maxRank: 3, perRank: { cooldownReduction: 1 }, pos: 2, desc: '-{v} Cooldown Skills' },
        ],
      },
      {
        tier: 1, requiredPoints: 5,
        nodes: [
          { id: 'arcane_resonance', name: 'Resonance', icon: '\u{1F52E}', maxRank: 5, perRank: { elementalAdvantageBonus: 5 }, pos: 0, desc: '+{v}% Bonus Avantage Elem.' },
          { id: 'arcane_eruption', name: 'Eruption Arcane', icon: '\u{1F4A5}', maxRank: 3, perRank: { bossDamage: 8 }, pos: 2, desc: '+{v}% Degats aux Boss' },
        ],
      },
      {
        tier: 2, requiredPoints: 10,
        nodes: [
          { id: 'arcane_concentration', name: 'Concentration', icon: '\u{1F9E0}', maxRank: 3, perRank: { critRate: 3, critDamage: 4 }, pos: 1, desc: '+{cr}% Crit Rate, +{cd}% Crit Dmg' },
        ],
      },
      {
        tier: 3, requiredPoints: 15,
        nodes: [
          { id: 'arcane_transcendance', name: 'Transcendance', icon: '\u{1F31F}', maxRank: 1, perRank: {}, pos: 1, desc: 'Avantage Elem. 1.3x \u2192 1.6x', capstone: true },
        ],
      },
    ],
  },

  bulwark: {
    id: 'bulwark',
    name: 'Rempart',
    icon: '\u{1F6E1}\uFE0F',
    color: 'green',
    accent: '#10B981',
    desc: 'Defense, survie et contre-attaque',
    rows: [
      {
        tier: 0, requiredPoints: 0,
        nodes: [
          { id: 'bulwark_endurance', name: 'Endurance', icon: '\u2764\uFE0F', maxRank: 5, perRank: { hpPercent: 4 }, pos: 0, desc: '+{v}% PV' },
          { id: 'bulwark_spectral_shield', name: 'Bouclier Spectral', icon: '\u{1F6E1}\uFE0F', maxRank: 3, perRank: { defPercent: 3 }, pos: 2, desc: '+{v}% DEF' },
        ],
      },
      {
        tier: 1, requiredPoints: 5,
        nodes: [
          { id: 'bulwark_resistance', name: 'Resistance', icon: '\u{1F530}', maxRank: 5, perRank: { resFlat: 2 }, pos: 0, desc: '+{v}% RES' },
          { id: 'bulwark_regeneration', name: 'Regeneration', icon: '\u{1F49A}', maxRank: 3, perRank: { regenPerTurn: 2 }, pos: 2, desc: '+{v}% PV max/tour' },
        ],
      },
      {
        tier: 2, requiredPoints: 10,
        nodes: [
          { id: 'bulwark_fortification', name: 'Fortification', icon: '\u{1F3F0}', maxRank: 3, perRank: { defPercent: 5, resFlat: 3 }, pos: 0, desc: '+{d}% DEF, +{r}% RES' },
          { id: 'bulwark_riposte', name: 'Riposte', icon: '\u2694\uFE0F', maxRank: 3, perRank: { counterChance: 10 }, pos: 2, desc: '{v}% Chance Contre-Attaque' },
        ],
      },
      {
        tier: 3, requiredPoints: 15,
        nodes: [
          { id: 'bulwark_immortal', name: 'Immortel', icon: '\u{1F480}', maxRank: 1, perRank: {}, pos: 1, desc: 'Survit 1 coup fatal (1x/combat)', capstone: true },
        ],
      },
    ],
  },
};

// Capacite totale par arbre : Fury=20, Arcane=20, Bulwark=23 → 63 total
// Avec 51 pts max, impossible de tout maxer → choix strategiques

export const getTreeMaxPoints = (treeId) => {
  const tree = TALENT_TREES[treeId];
  if (!tree) return 0;
  return tree.rows.reduce((sum, row) => sum + row.nodes.reduce((s, n) => s + n.maxRank, 0), 0);
};

export const computeTalentBonuses = (talentAllocation) => {
  const b = {
    atkPercent: 0, hpPercent: 0, defPercent: 0, spdPercent: 0,
    critRate: 0, critDamage: 0, resFlat: 0,
    physicalDamage: 0, elementalDamage: 0,
    elementalAdvantageBonus: 0, bossDamage: 0,
    cooldownReduction: 0, regenPerTurn: 0, counterChance: 0,
    hasBerserk: false, hasTranscendance: false, hasImmortel: false,
  };
  if (!talentAllocation) return b;

  for (const treeId of Object.keys(TALENT_TREES)) {
    const treeAlloc = talentAllocation[treeId];
    if (!treeAlloc) continue;
    for (const row of TALENT_TREES[treeId].rows) {
      for (const node of row.nodes) {
        const rank = treeAlloc[node.id] || 0;
        if (rank === 0) continue;
        if (node.perRank) {
          for (const [key, val] of Object.entries(node.perRank)) {
            if (typeof b[key] === 'number') b[key] += val * rank;
          }
        }
        if (node.capstone && rank > 0) {
          if (node.id === 'fury_berserk') b.hasBerserk = true;
          if (node.id === 'arcane_transcendance') b.hasTranscendance = true;
          if (node.id === 'bulwark_immortal') b.hasImmortel = true;
        }
      }
    }
  }
  return b;
};

export const getNodeDesc = (node, rank) => {
  if (!node.perRank || Object.keys(node.perRank).length === 0) return node.desc;
  const entries = Object.entries(node.perRank);
  if (entries.length === 1) {
    return node.desc.replace('{v}', entries[0][1] * rank);
  }
  // Multi-stat node (Concentration, Fortification)
  let d = node.desc;
  for (const [key, val] of entries) {
    d = d.replace(`{${key.charAt(0)}}`, val * rank);
    // fallback replacements
    if (key === 'critRate') d = d.replace('{cr}', val * rank);
    if (key === 'critDamage') d = d.replace('{cd}', val * rank);
    if (key === 'defPercent') d = d.replace('{d}', val * rank);
    if (key === 'resFlat') d = d.replace('{r}', val * rank);
  }
  return d;
};
