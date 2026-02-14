// 🎯 FORMULES AVEC NIVEAU D'ENNEMI
// Ces formules ajustent les % réels en fonction du niveau de l'ennemi
// Basé sur les données réelles de Solo Leveling: Arise (Level 90 Guild Boss data)

// ═══════════════════════════════════════════════════════════════
// 🆕 NOUVELLE FORMULE DEF PEN (confirmée Reddit + RDPS + tests LV80)
// DefPenStat = (MonsterLevel × 1000 × DefPen%) / (100 - DefPen%)
// Inverse: DefPen% = (DefPenStat × 100) / (DefPenStat + MonsterLevel × 1000)
// ═══════════════════════════════════════════════════════════════
export const newDefPenFormula = {
  toPercent: (stat, enemyLevel = 80) => {
    const value = parseFloat(stat) || 0;
    if (value === 0) return '0.0';

    // DefPen% = (DefPenStat × 100) / (DefPenStat + MonsterLevel × 1000)
    const divisor = value + (enemyLevel * 1000);
    const percentage = (value * 100) / divisor;

    return Math.max(0, percentage).toFixed(1);
  },
  toStat: (percent, enemyLevel = 80) => {
    const value = parseFloat(percent) || 0;
    if (value === 0) return 0;
    if (value >= 100) return Infinity; // Cap à 100%

    // DefPenStat = (MonsterLevel × 1000 × DefPen%) / (100 - DefPen%)
    const stat = (enemyLevel * 1000 * value) / (100 - value);

    return Math.round(Math.max(0, stat));
  }
};

export const statConversionsWithEnemy = {
  // TC (Taux de Critique) - dépend du niveau de l'ennemi
  tc: {
    toPercent: (stat, enemyLevel = 60) => {
      const value = parseFloat(stat) || 0;
      // Formule de base: 5 + (value / (value + baseResist)) * 100
      // baseResist suit une formule quadratique optimisée depuis les données réelles
      // Level 60: 5000, Level 80: 27263, Level 90: 32690
      // Formule: R = -19.015(L-60)² + 1493.45(L-60) + 5000
      const levelDiff = enemyLevel - 60;
      const baseResist = -19.015 * Math.pow(levelDiff, 2) + 1493.45 * levelDiff + 5000;
      return (5 + (value / (value + baseResist)) * 100).toFixed(1);
    },
    toStat: (percent, enemyLevel = 60) => {
      const value = parseFloat(percent) / 100;
      const levelDiff = enemyLevel - 60;
      const baseResist = -19.015 * Math.pow(levelDiff, 2) + 1493.45 * levelDiff + 5000;
      return Math.round((baseResist * (value - 0.05)) / (1.05 - value));
    }
  },

  // DCC (Dégâts de Coup Critique) - dépend du niveau et résistance de l'ennemi
  dcc: {
    toPercent: (stat, enemyLevel = 60) => {
      const value = parseFloat(stat) || 0;

      // Si stat = 0, retourner 50% (le jeu affiche 150% de base = 100% base + 50% bonus)
      if (value === 0) return '50.0';

      const L = enemyLevel;
      const e = Math.E; // 2.71828...

      // Formule exponentielle complète de Béru (basée sur les données réelles Level 60/80/90/96)
      // DCC% = K(L) × (S + B(L)) / (0.4 × S + M(L))
      // Où:
      // K(L) = Coefficient level-dépendant
      // B(L) = Bonus level-dépendant
      // M(L) = Malus level-dépendant

      // K(L) = 0.55 + 0.91 / (2 + 0.00008 × e^(0.1315 × L))
      const K = 0.55 + 0.91 / (2 + 0.00008 * Math.pow(e, 0.1315 * L));

      // B(L) = 1100 - 5300 / (1 + 60000 × e^(-0.136 × L))
      const B = 1100 - 5300 / (1 + 60000 * Math.pow(e, -0.136 * L));

      // M(L) = 2000 - 2500 / (1 + 51500 × e^(-0.132 × L))
      const M = 2000 - 2500 / (1 + 51500 * Math.pow(e, -0.132 * L));

      // Formule finale: DCC% = K × (stat + B) / (0.4 × stat + M) × 100
      // Note: Cette formule calcule le BONUS au-dessus de 100% de base (donc 0 DCC = 50% affiché = 150% total)
      const percentage = K * (value + B) / (0.4 * value + M) * 100;

      // Plancher minimum à 50% pour éviter les valeurs négatives sur les stats trop basses
      // Les valeurs basses commencent toujours vers ~50% dans le jeu
      return Math.max(50, percentage).toFixed(1);
    },
    toStat: (percent, enemyLevel = 60) => {
      const value = parseFloat(percent) / 100 || 0;
      const L = enemyLevel;
      const e = Math.E;

      // Calculer les paramètres level-dépendants
      const K = 0.55 + 0.91 / (2 + 0.00008 * Math.pow(e, 0.1315 * L));
      const B = 1100 - 5300 / (1 + 60000 * Math.pow(e, -0.136 * L));
      const M = 2000 - 2500 / (1 + 51500 * Math.pow(e, -0.132 * L));

      // Résolution inverse: percent = K × (S + B) / (0.4 × S + M) × 100
      // Donc: percent/100 = K × (S + B) / (0.4 × S + M)
      // (percent/100) × (0.4 × S + M) = K × (S + B)
      // (percent/100) × 0.4 × S + (percent/100) × M = K × S + K × B
      // S × [(percent/100) × 0.4 - K] = K × B - (percent/100) × M
      // S = (K × B - (percent/100) × M) / ((percent/100) × 0.4 - K)

      const numerator = K * B - value * M;
      const denominator = value * 0.4 - K;

      const stat = numerator / denominator;

      return Math.round(Math.max(0, stat));
    }
  },

  // DI (Damage Increase) - dépend du niveau de l'ennemi
  // Même formule que newDefPenFormula: DI% = (DIStat × 100) / (DIStat + MonsterLevel × 1000)
  di: {
    toPercent: (stat, enemyLevel = 80) => {
      const value = parseFloat(stat) || 0;
      if (value === 0) return '0.0';
      const divisor = value + (enemyLevel * 1000);
      return Math.max(0, (value * 100) / divisor).toFixed(1);
    },
    toStat: (percent, enemyLevel = 80) => {
      const value = parseFloat(percent) || 0;
      if (value === 0) return 0;
      if (value >= 100) return Infinity;
      return Math.round(Math.max(0, (enemyLevel * 1000 * value) / (100 - value)));
    }
  },

  // Def Pen (Defense Penetration) - dépend du niveau de l'ennemi
  // Formule développée par @Brrrrrrr (précision < 1.7% erreur pour Level 60-80, très précise pour 80+)
  defPen: {
    toPercent: (stat, enemyLevel = 60) => {
      const value = parseFloat(stat) || 0;

      // Si stat = 0, retourner 0%
      if (value === 0) return '0.0';

      const S = value;
      const L = enemyLevel;
      const e = Math.E; // 2.71828...

      // Formule complète de @Brrrrrrr avec DEUX parties qui se multiplient:
      // Def Pen% = Part1(S) × Part2(L, S)

      // PART 1: Fonction quadratique du stat (indépendante du level)
      // Part1 = (0.4 × S² + 2000 × S) / (S² + 51000 × S + 5×10^7)
      const part1Numerator = 0.4 * Math.pow(S, 2) + 2000 * S;
      const part1Denominator = Math.pow(S, 2) + 51000 * S + 5e7; // 5×10^7 = 50,000,000
      const part1 = part1Numerator / part1Denominator;

      // PART 2: Fonction exponentielle level-dépendante
      // K(L) = 0.55 + 0.91 / (2 + 0.00008 × e^(0.1315 × L))
      const K = 0.55 + 0.91 / (2 + 0.00008 * Math.pow(e, 0.1315 * L));

      // B(L) = 1100 - 5300 / (1 + 60000 × e^(-0.136 × L))
      const B = 1100 - 5300 / (1 + 60000 * Math.pow(e, -0.136 * L));

      // M(L) = 2000 - 2500 / (1 + 51500 × e^(-0.132 × L))
      const M = 2000 - 2500 / (1 + 51500 * Math.pow(e, -0.132 * L));

      // Part2 = K × (S + B) / (0.4 × S + M)
      const part2 = K * (S + B) / (0.4 * S + M);

      // Formule finale: Def Pen% = Part1 × Part2 × 100
      const percentage = part1 * part2 * 100;

      // Plancher minimum à 0% pour éviter les valeurs négatives
      return Math.max(0, percentage).toFixed(1);
    },
    toStat: (percent, enemyLevel = 60) => {
      const value = parseFloat(percent) / 100 || 0;
      const L = enemyLevel;
      const e = Math.E;

      // Calculer les paramètres level-dépendants
      const K = 0.55 + 0.91 / (2 + 0.00008 * Math.pow(e, 0.1315 * L));
      const B = 1100 - 5300 / (1 + 60000 * Math.pow(e, -0.136 * L));
      const M = 2000 - 2500 / (1 + 51500 * Math.pow(e, -0.132 * L));

      // Résolution inverse: percent = K × (S + B) / (0.4 × S + M) × 100
      // Donc: percent/100 = K × (S + B) / (0.4 × S + M)
      // (percent/100) × (0.4 × S + M) = K × (S + B)
      // (percent/100) × 0.4 × S + (percent/100) × M = K × S + K × B
      // S × [(percent/100) × 0.4 - K] = K × B - (percent/100) × M
      // S = (K × B - (percent/100) × M) / ((percent/100) × 0.4 - K)

      const numerator = K * B - value * M;
      const denominator = value * 0.4 - K;

      const stat = numerator / denominator;

      return Math.round(Math.max(0, stat));
    }
  }
};

// 🔧 ANCIENNES FORMULES (sans niveau d'ennemi) - conservées pour compatibilité
export const statConversions = {
  // TC (Taux de Critique)
  tc: {
    toPercent: (stat) => {
      const value = parseFloat(stat) || 0;
      return (5 + (value / (value + 5000)) * 100).toFixed(1);
    },
    toStat: (percent) => {
      const value = parseFloat(percent) / 100; // Convertir en décimal
      return Math.round((5000 * (value - 0.05)) / (1.05 - value));
    }
  },

  // DCC (Dégâts de Coup Critique)
  dcc: {
    toPercent: (stat) => {
      const value = parseFloat(stat) || 0;
      return (((value + 1000) / (0.4 * value + 2000)) * 100).toFixed(1);
    },
    toStat: (percent) => {
      const value = parseFloat(percent) / 100; // Convertir en décimal
      return Math.round((2000 * value - 1000) / (1 - 0.4 * value));
    }
  },

  // DI (Damage Increase)
  di: {
    toPercent: (stat) => {
      const value = parseFloat(stat) || 0;
      return ((value / (value + 50000)) * 100).toFixed(1);
    },
    toStat: (percent) => {
      const value = parseFloat(percent) / 100; // Convertir en décimal
      return Math.round((50000 * value) / (1 - value));
    }
  },

  // Def Pen
  defPen: {
    toPercent: (stat) => {
      const value = parseFloat(stat) || 0;
      return ((value / (value + 50000)) * 100).toFixed(1);
    },
    toStat: (percent) => {
      const value = parseFloat(percent) / 100; // Convertir en décimal
      return Math.round((50000 * value) / (1 - value));
    }
  }
};

// Fonction pour déterminer si c'est une valeur brute ou pourcentage et la convertir
export const normalizeStatValue = (value, statType) => {
  if (!value || !statConversions[statType]) return value;
  
  const stringValue = value.toString();
  const cleanValue = stringValue.replace('%', '').trim();
  const numValue = parseFloat(cleanValue);
  
  if (isNaN(numValue)) return 0;
  
  // Si contient % ou si valeur <= 100, considérer comme pourcentage
  if (stringValue.includes('%') || numValue <= 100) {
    return statConversions[statType].toStat(numValue);
  }
  
  // Sinon c'est déjà une valeur brute
  return Math.round(numValue);
};