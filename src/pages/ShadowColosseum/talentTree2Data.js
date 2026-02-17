// talentTree2Data.js — Talent II: Arbre Avance (Diablo/FF style)
// Unlocks at level 75. Points SHARED with Talent I.
// 4 branches: Armes (gauche), Elements (droite), Titan (haut), Faucheur (bas)
// Root node at center. Graph layout with SVG connections.

// ═══════════════════════════════════════════════════════════════
// WEAPON TYPE LABELS (for display)
// ═══════════════════════════════════════════════════════════════

export const WEAPON_TYPE_NAMES = {
  blade:   { name: 'Lames',         icon: '\uD83D\uDDE1\uFE0F' },
  heavy:   { name: 'Armes lourdes', icon: '\uD83D\uDD28' },
  ranged:  { name: 'A distance',    icon: '\uD83C\uDFF9' },
  polearm: { name: "Armes d'hast",  icon: '\uD83D\uDD31' },
  shield:  { name: 'Boucliers',     icon: '\uD83D\uDEE1\uFE0F' },
};

// ═══════════════════════════════════════════════════════════════
// TALENT II UNLOCK LEVEL
// ═══════════════════════════════════════════════════════════════

export const TALENT2_UNLOCK_LEVEL = 75;

// ═══════════════════════════════════════════════════════════════
// ROOT NODE (center of the graph)
// ═══════════════════════════════════════════════════════════════

export const TALENT2_ROOT = {
  id: 'root',
  name: 'Eveil Avance',
  icon: '\u2B50',
  maxRank: 1,
  perRank: { allStats: 1 },
  pos: { x: 0, y: 0 },
  requires: [],
  desc: "+1% toutes stats — Deverrouille l'arbre avance",
};

// ═══════════════════════════════════════════════════════════════
// TALENT II BRANCHES
// ═══════════════════════════════════════════════════════════════

export const TALENT2_BRANCHES = {
  // ─── VOIE DES ARMES (gauche — orange/rouge) ──────────────
  weapons: {
    id: 'weapons',
    name: 'Voie des Armes',
    color: '#F97316',
    icon: '\u2694\uFE0F',
    desc: 'Specialisation par type d\'arme',
    nodes: {
      w_mastery: {
        name: 'Maitrise des Armes', icon: '\u2694\uFE0F', maxRank: 5,
        perRank: { atkPercent: 2 },
        pos: { x: -2, y: 0 }, requires: ['root'],
        desc: '+2% ATK par rang',
      },
      w_blade: {
        name: 'Lames Aiguisees', icon: '\uD83D\uDDE1\uFE0F', maxRank: 5,
        perRank: { weaponDmg_blade: 6 },
        pos: { x: -4, y: -1.5 }, requires: ['w_mastery'],
        desc: '+6% DMG (Lames) par rang',
      },
      w_heavy: {
        name: 'Force Brute', icon: '\uD83D\uDD28', maxRank: 5,
        perRank: { weaponDmg_heavy: 6 },
        pos: { x: -4, y: 1.5 }, requires: ['w_mastery'],
        desc: '+6% DMG (Armes lourdes) par rang',
      },
      w_ranged: {
        name: 'Oeil du Tireur', icon: '\uD83C\uDFF9', maxRank: 5,
        perRank: { weaponDmg_ranged: 6 },
        pos: { x: -5.5, y: -2.5 }, requires: ['w_blade'],
        desc: '+6% DMG (A distance) par rang',
      },
      w_polearm: {
        name: "Art de l'Hast", icon: '\uD83D\uDD31', maxRank: 5,
        perRank: { weaponDmg_polearm: 6 },
        pos: { x: -5.5, y: 2.5 }, requires: ['w_heavy'],
        desc: "+6% DMG (Armes d'hast) par rang",
      },
      w_shield: {
        name: 'Garde Impenetrable', icon: '\uD83D\uDEE1\uFE0F', maxRank: 3,
        perRank: { weaponDmg_shield_def: 5, weaponDmg_shield_hp: 3 },
        pos: { x: -5.5, y: 0 }, requires: ['w_blade', 'w_heavy'],
        desc: '+5% DEF + 3% HP (Bouclier) par rang',
      },
      w_capstone: {
        name: "Maitre d'Armes", icon: '\uD83C\uDFC6', maxRank: 1,
        perRank: { masterWeapons: 1 },
        pos: { x: -7, y: 0 }, requires: ['w_shield'],
        requiredBranchPts: 15,
        desc: 'Les bonus de type d\'arme sont DOUBLES',
        capstone: true,
      },
    },
  },

  // ─── VOIE DES ELEMENTS (droite — bleu/violet) ────────────
  elements: {
    id: 'elements',
    name: 'Voie des Elements',
    color: '#8B5CF6',
    icon: '\uD83C\uDF0A',
    desc: 'Specialisation par element',
    nodes: {
      e_affinity: {
        name: 'Affinite Primordiale', icon: '\uD83C\uDF00', maxRank: 5,
        perRank: { elementalDamage: 3 },
        pos: { x: 2, y: 0 }, requires: ['root'],
        desc: '+3% DMG elementaire par rang',
      },
      e_fire: {
        name: 'Flammes Eternelles', icon: '\uD83D\uDD25', maxRank: 5,
        perRank: { fireDamage: 6, fireRes: 3 },
        pos: { x: 4, y: -2 }, requires: ['e_affinity'],
        desc: '+6% DMG Feu, +3 RES Feu par rang',
      },
      e_shadow: {
        name: 'Ombres Profondes', icon: '\uD83C\uDF11', maxRank: 5,
        perRank: { shadowDamage: 6, shadowRes: 3 },
        pos: { x: 4, y: -0.5 }, requires: ['e_affinity'],
        desc: '+6% DMG Ombre, +3 RES Ombre par rang',
      },
      e_water: {
        name: 'Torrent Dechaine', icon: '\uD83C\uDF0A', maxRank: 5,
        perRank: { waterDamage: 6, waterRes: 3 },
        pos: { x: 4, y: 0.5 }, requires: ['e_affinity'],
        desc: '+6% DMG Eau, +3 RES Eau par rang',
      },
      e_wind: {
        name: 'Souffle du Vent', icon: '\uD83C\uDF2C\uFE0F', maxRank: 5,
        perRank: { windDamage: 6, windRes: 3 },
        pos: { x: 4, y: 2 }, requires: ['e_affinity'],
        desc: '+6% DMG Vent, +3 RES Vent par rang',
      },
      e_earth: {
        name: 'Terre Immuable', icon: '\u26F0\uFE0F', maxRank: 3,
        perRank: { earthDamage: 5, defFlat: 5 },
        pos: { x: 5.5, y: -1.25 }, requires: ['e_fire', 'e_shadow'],
        desc: '+5% DMG Terre, +5 DEF par rang',
      },
      e_light: {
        name: 'Lumiere Sacree', icon: '\u2728', maxRank: 3,
        perRank: { lightDamage: 5, healBonus: 2 },
        pos: { x: 5.5, y: 1.25 }, requires: ['e_water', 'e_wind'],
        desc: '+5% DMG Lumiere, +2% Soins par rang',
      },
      e_capstone: {
        name: 'Convergence', icon: '\uD83C\uDF1F', maxRank: 1,
        perRank: { convergenceAll: 1 },
        pos: { x: 7, y: 0 }, requires: ['e_earth', 'e_light'],
        requiredBranchPts: 15,
        desc: 'TOUS les bonus elementaires s\'appliquent (pas seulement ton element)',
        capstone: true,
      },
    },
  },

  // ─── VOIE DU TITAN (haut — vert) ─────────────────────────
  titan: {
    id: 'titan',
    name: 'Voie du Titan',
    color: '#10B981',
    icon: '\uD83D\uDEE1\uFE0F',
    desc: 'Survie et endurance',
    nodes: {
      t_constitution: {
        name: 'Constitution Avancee', icon: '\u2764\uFE0F', maxRank: 5,
        perRank: { hpPercent: 4 },
        pos: { x: 0, y: -2 }, requires: ['root'],
        desc: '+4% PV par rang',
      },
      t_carapace: {
        name: 'Carapace Renforcee', icon: '\uD83D\uDEE1\uFE0F', maxRank: 5,
        perRank: { defPercent: 3 },
        pos: { x: -1.5, y: -3.5 }, requires: ['t_constitution'],
        desc: '+3% DEF par rang',
      },
      t_arcane_res: {
        name: 'Resistance Arcane', icon: '\uD83D\uDD2E', maxRank: 5,
        perRank: { resFlat: 2 },
        pos: { x: 1.5, y: -3.5 }, requires: ['t_constitution'],
        desc: '+2 RES par rang',
      },
      t_regen: {
        name: 'Regeneration Profonde', icon: '\uD83D\uDC9A', maxRank: 3,
        perRank: { regenPerTurn: 2 },
        pos: { x: 0, y: -5 }, requires: ['t_carapace', 't_arcane_res'],
        desc: '+2% PV regen/tour par rang',
      },
      t_bastion: {
        name: 'Bastion Inebranlable', icon: '\uD83C\uDFF0', maxRank: 3,
        perRank: { bastionDef: 6, bastionRes: 4 },
        pos: { x: 0, y: -6.5 }, requires: ['t_regen'],
        desc: '+6% DEF, +4% RES quand PV < 50%',
      },
      t_capstone: {
        name: 'Colossus', icon: '\uD83D\uDDFF', maxRank: 1,
        perRank: { hasColossus: 1 },
        pos: { x: 0, y: -8 }, requires: ['t_bastion'],
        requiredBranchPts: 15,
        desc: 'Survit 1 attaque fatale, revient a 20% PV (1x/combat)',
        capstone: true,
      },
    },
  },

  // ─── VOIE DU FAUCHEUR (bas — jaune/dore) ─────────────────
  reaper: {
    id: 'reaper',
    name: 'Voie du Faucheur',
    color: '#EAB308',
    icon: '\u2620\uFE0F',
    desc: 'Letalite et critiques',
    nodes: {
      r_instinct: {
        name: 'Instinct Meurtrier', icon: '\uD83D\uDC41\uFE0F', maxRank: 5,
        perRank: { critRate: 2 },
        pos: { x: 0, y: 2 }, requires: ['root'],
        desc: '+2% Taux Critique par rang',
      },
      r_phantom: {
        name: 'Lame Fantome', icon: '\uD83D\uDC7B', maxRank: 5,
        perRank: { critDamage: 5 },
        pos: { x: -1.5, y: 3.5 }, requires: ['r_instinct'],
        desc: '+5% DMG Critique par rang',
      },
      r_velocity: {
        name: 'Velocite Mortelle', icon: '\uD83D\uDCA8', maxRank: 3,
        perRank: { spdPercent: 2 },
        pos: { x: 1.5, y: 3.5 }, requires: ['r_instinct'],
        desc: '+2% SPD par rang',
      },
      r_execution: {
        name: 'Execution', icon: '\u2620\uFE0F', maxRank: 3,
        perRank: { executionDmg: 10 },
        pos: { x: 0, y: 5 }, requires: ['r_phantom', 'r_velocity'],
        desc: '+10% DMG aux ennemis < 30% PV par rang',
      },
      r_perforation: {
        name: 'Perforation', icon: '\uD83D\uDCA2', maxRank: 3,
        perRank: { defPen: 5 },
        pos: { x: 0, y: 6.5 }, requires: ['r_execution'],
        desc: '+5% penetration DEF par rang',
      },
      r_capstone: {
        name: 'Ange de la Mort', icon: '\uD83D\uDC80', maxRank: 1,
        perRank: { critDefIgnore: 1 },
        pos: { x: 0, y: 8 }, requires: ['r_perforation'],
        requiredBranchPts: 15,
        desc: 'Les coups critiques ignorent 50% de la DEF ennemie',
        capstone: true,
      },
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// CONNECTIONS — for SVG rendering of edges between nodes
// Auto-generated from `requires` fields
// ═══════════════════════════════════════════════════════════════

export function getTalent2Connections() {
  const connections = [];
  // Root → first-tier nodes
  for (const branch of Object.values(TALENT2_BRANCHES)) {
    for (const [nodeId, node] of Object.entries(branch.nodes)) {
      for (const reqId of node.requires) {
        connections.push({ from: reqId, to: nodeId, branchColor: branch.color });
      }
    }
  }
  return connections;
}

// ═══════════════════════════════════════════════════════════════
// HELPERS — node lookup, branch point count
// ═══════════════════════════════════════════════════════════════

// Get a flat map of all nodes (including root)
export function getAllTalent2Nodes() {
  const nodes = { root: TALENT2_ROOT };
  for (const branch of Object.values(TALENT2_BRANCHES)) {
    for (const [nodeId, node] of Object.entries(branch.nodes)) {
      nodes[nodeId] = { ...node, id: nodeId, branchId: branch.id, branchColor: branch.color };
    }
  }
  return nodes;
}

// Count points spent in a specific branch
export function getBranchPts(branchId, allocation) {
  if (!allocation) return 0;
  const branch = TALENT2_BRANCHES[branchId];
  if (!branch) return 0;
  let pts = 0;
  for (const nodeId of Object.keys(branch.nodes)) {
    pts += allocation[nodeId] || 0;
  }
  return pts;
}

// Total points spent in Talent II (including root)
export function getSpentTalent2Pts(allocation) {
  if (!allocation) return 0;
  return Object.values(allocation).reduce((sum, v) => sum + (v || 0), 0);
}

// Check if a node can be allocated (prerequisites met)
export function canAllocateNode(nodeId, allocation) {
  if (!allocation) allocation = {};
  const allNodes = getAllTalent2Nodes();
  const node = allNodes[nodeId];
  if (!node) return false;

  // Already maxed
  if ((allocation[nodeId] || 0) >= node.maxRank) return false;

  // Root always allocatable as first node
  if (nodeId === 'root') return true;

  // Check requires: at least one parent must be rank > 0
  const hasParent = node.requires.some(reqId => (allocation[reqId] || 0) > 0);
  if (!hasParent) return false;

  // Check branch point requirement for capstones
  if (node.requiredBranchPts) {
    const branchPts = getBranchPts(node.branchId, allocation);
    if (branchPts < node.requiredBranchPts) return false;
  }

  return true;
}

// Get maximum possible points in Talent II tree
export function getTalent2MaxPoints() {
  let total = TALENT2_ROOT.maxRank;
  for (const branch of Object.values(TALENT2_BRANCHES)) {
    for (const node of Object.values(branch.nodes)) {
      total += node.maxRank;
    }
  }
  return total;
}

// ═══════════════════════════════════════════════════════════════
// COMPUTE TALENT II BONUSES (for combat integration)
// ═══════════════════════════════════════════════════════════════

export function computeTalentBonuses2(allocation) {
  const b = {
    // Generic stats
    allStats: 0,
    atkPercent: 0, hpPercent: 0, defPercent: 0, spdPercent: 0,
    critRate: 0, critDamage: 0, resFlat: 0, defPen: 0,
    regenPerTurn: 0, healBonus: 0,
    // Weapon-type damage
    weaponDmg_blade: 0, weaponDmg_heavy: 0,
    weaponDmg_ranged: 0, weaponDmg_polearm: 0,
    weaponDmg_shield_def: 0, weaponDmg_shield_hp: 0,
    // Elemental damage
    elementalDamage: 0,
    fireDamage: 0, shadowDamage: 0, waterDamage: 0, windDamage: 0,
    earthDamage: 0, lightDamage: 0,
    // Elemental resistance (from element nodes)
    fireRes: 0, shadowRes: 0, waterRes: 0, windRes: 0,
    // Flat bonuses
    defFlat: 0,
    // Conditional bonuses
    bastionDef: 0, bastionRes: 0,    // +DEF/RES when HP < 50%
    executionDmg: 0,                  // +DMG to targets < 30% HP
    // Capstone flags
    masterWeapons: false,             // Double weapon-type bonuses
    convergenceAll: false,            // All elem bonuses apply
    hasColossus: false,               // Survive fatal hit at 20% HP
    critDefIgnore: false,             // Crits ignore 50% DEF
  };

  if (!allocation) return b;

  // Root node
  const rootRank = allocation.root || 0;
  if (rootRank > 0) {
    b.allStats += TALENT2_ROOT.perRank.allStats * rootRank;
  }

  // Branch nodes
  for (const branch of Object.values(TALENT2_BRANCHES)) {
    for (const [nodeId, node] of Object.entries(branch.nodes)) {
      const rank = allocation[nodeId] || 0;
      if (rank === 0) continue;
      if (node.perRank) {
        for (const [key, val] of Object.entries(node.perRank)) {
          if (key === 'masterWeapons' && rank > 0) { b.masterWeapons = true; continue; }
          if (key === 'convergenceAll' && rank > 0) { b.convergenceAll = true; continue; }
          if (key === 'hasColossus' && rank > 0) { b.hasColossus = true; continue; }
          if (key === 'critDefIgnore' && rank > 0) { b.critDefIgnore = true; continue; }
          if (typeof b[key] === 'number') b[key] += val * rank;
        }
      }
    }
  }

  return b;
}
