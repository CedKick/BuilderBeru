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