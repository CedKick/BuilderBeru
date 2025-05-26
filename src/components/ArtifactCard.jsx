import React, { useState } from "react";
import ArtifactScoreBadge from './ArtifactScoreBadge';
import { getTheoreticalScore } from '../utils/statPriority';
import { handleNumericInput } from '../utils/inputUtils';


const commonSubStats = [
  'Attack %', 'Additional Attack', 'Defense Penetration', 'Damage Increase', 'Additional Defense',
  'Defense %', 'Additional HP', 'HP %', 'MP Consumption Reduction',
  'Additional MP', 'MP Recovery Rate Increase (%)', 'Damage Reduction', 'Critical Hit Damage', 'Critical Rate'
];
const mainStatMaxByIncrements = {
  'Additional Defense': {
    0: 2433,
    1: 2433,
    2: 2433,
    3: 2433,
    4: 2433,
  },
  'Defense %': {
    0: 25.5,
    1: 25.5,
    2: 25.5,
    3: 25.5,
    4: 25.5,
  },
  'Additional Attack': {
    0: 2433,
    1: 2433,
    2: 2433,
    3: 2433,
    4: 2433,
  },
  'Attack %': {
    0: 25.5,
    1: 25.5,
    2: 25.5,
    3: 25.5,
    4: 25.5,
  },
  'Additional HP': {
    0: 4865,
    1: 4865,
    2: 4865,
    3: 4865,
    4: 4865,
  },
  'HP %': {
    0: 25.5,
    1: 25.5,
    2: 25.5,
    3: 25.5,
    4: 25.5,
  },
  'Critical Hit Damage': {
    0: 81.5,
    1: 81.5,
    2: 81.5,
    3: 81.5,
    4: 81.5,
  },
  'Defense Penetration': {
    0: 36,
    1: 36,
    2: 36,
    3: 36,
    4: 36,
  },
  'Healing Given Increase (%)': {
    0: 30,
    1: 30,
    2: 30,
    3: 30,
    4: 30,
  },
  'MP Consumption Reduction': {
    0: 30,
    1: 30,
    2: 30,
    3: 30,
    4: 30,
  },
  'Additional MP': {
    0: 1350,
    1: 1350,
    2: 1350,
    3: 1350,
    4: 1350,
  },
  'MP Recovery Rate Increase (%)': {
    0: 30,
    1: 30,
    2: 30,
    3: 30,
    4: 30,
  },
  'Damage Increase': {
    0: 24,
    1: 24,
    2: 24,
    3: 24,
    4: 24,
  },
  'Damage Reduction': {
    0: 24,
    1: 24,
    2: 24,
    3: 24,
    4: 24,
  },
};


const calculateMainStatValue = (mainStat, subStatsLevels) => {
  if (!Array.isArray(subStatsLevels)) return 0;

  const sum = subStatsLevels.reduce((acc, s) => acc + (s?.level || 0), 0);

  if (
    typeof mainStat === 'string' &&
    mainStatMaxByIncrements[mainStat] &&
    typeof mainStatMaxByIncrements[mainStat][sum] !== 'undefined'
  ) {
    return mainStatMaxByIncrements[mainStat][sum];
  }


  return 0;
};


const ArtifactCard = ({
  title,
  mainStats,
  showTankMessage,
  recalculateStatsFromArtifacts,
  artifactData,
  onArtifactChange,
  statsWithoutArtefact,
  flatStats,
  hunter,
  substatsMinMaxByIncrements,
  openComparisonPopup, // 👈 ajoute-le ici
  mode = "edit", // default
  disableComparisonButton = false, // 👈 AJOUT
}) => {
  //  if (!artifactData.subStats || !artifactData.subStatsLevels) {
  //   console.warn(`⚠️ subStats or subStatsLevels missing for ${title}`, artifactData);
  //   return null; // Ou tu peux afficher un message d’erreur visuel si tu préfères
  // }
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [inputValues, setInputValues] = useState({});
  const selections = artifactData;
  const setArtifactsData = (newData) => onArtifactChange(newData);

  const shouldShowComparison = (artifact) => {
    const totalProcs = artifact.subStatsLevels?.reduce((sum, s) => sum + (s?.level || 0), 0);
    const allProcsDone = totalProcs === 4;
    const allStatsSelected = artifact.mainStat && artifact.subStats?.every(s => s !== '');

    return allProcsDone && allStatsSelected;
  };

  // Mise à jour de la fonction getSubstatHint
  const getSubstatHint = (stat, subStatData) => {
    if (!stat || !subStatData) return '';

    if (subStatData.manual) {
      const orders = subStatData.procOrders || [];
      const values = subStatData.procValues || [];
      const ranges = substatsMinMaxByIncrements[stat] || {};

      const minTotal = orders.reduce((sum, o) => sum + (ranges[o]?.min || 0), 0);
      const maxTotal = orders.reduce((sum, o) => sum + (ranges[o]?.max || 0), 0);
      const gotTotal = (subStatData.value || 0).toFixed(2);

      let hint = `Min: ${minTotal.toFixed(2)}% | Max: ${maxTotal.toFixed(2)}% | You got: ${gotTotal}%`;
      const breakdown = orders.map((o) => {
        const r = ranges[o];
        return `${o}: ${r?.min} → ${r?.max}`;
      }).join(' | ');
      hint += `\n${breakdown}`;
      hint += `\n(manually modified)`;

      return hint;
    }

    const ranges = substatsMinMaxByIncrements[stat];
    // const { min, max } = ranges[nextProcOrder];
    // const value = Math.random() * (max - min) + min;
    const orders = subStatData.procOrders;
    const values = subStatData.procValues;

    if (!orders?.length || !values?.length) return '';

    const minTotal = orders.reduce((sum, o) => sum + (ranges[o]?.min || 0), 0);
    const maxTotal = orders.reduce((sum, o) => sum + (ranges[o]?.max || 0), 0);
    const gotTotal = values.reduce((sum, v) => sum + v, 0).toFixed(2);
    let hint = `Min: ${minTotal.toFixed(2)}% | Max: ${maxTotal.toFixed(2)}% | You got: ${gotTotal}%`;

    const breakdown = orders.map((order) => {
      const r = ranges[order];
      return `${order}: ${r.min} → ${r.max}`;
    }).join(' | ');
    hint += `\n${breakdown}`;

    const detailed = orders.map((order, i) => `${order} -> ${values[i]?.toFixed(2)}%`).join(' | ');
    hint += `\nYou got: ${detailed}`;

    return hint;
  };






  const handleMainStatChange = (e) => {
    setArtifactsData(prev => {
      const newData = { ...prev };

      if (!newData.subStats) {
        newData.subStats = ['', '', '', ''];
      }

      if (!newData.subStatsLevels) {
        newData.subStatsLevels = [
          { value: 0, level: 0, procOrders: [] },
          { value: 0, level: 0, procOrders: [] },
          { value: 0, level: 0, procOrders: [] },
          { value: 0, level: 0, procOrders: [] },
        ];
      }
      recalculateStatsFromArtifacts();
      newData.mainStat = e.target.value;

      return newData;
    });
  };
  const totalSubStatLevels = (artifactData?.subStatsLevels || []).reduce((sum, s) => sum + (s?.level || 0), 0);



  const getInitialSubstatValue = (statName) => {
    const config = substatsMinMaxByIncrements[statName];
    if (!config || !config[0]) return 0;
    const { min, max } = config[0];
    const rawValue = Math.random() * (max - min) + min;
    return subStatData.stat?.includes("%") ? +rawValue.toFixed(2) : Math.floor(rawValue);
  };

  // const handleManualSubStatChange = (index, e) => {
  const handleManualSubStatChange = (index, parsedValue) => {
    const newValue = parsedValue === null || isNaN(parsedValue) ? 0 : parsedValue;
    if (isNaN(newValue)) return;

    onArtifactChange(prev => {
      const newLevels = [...prev.subStatsLevels];
      const current = newLevels[index] || { level: 0, value: 0, procOrders: [], procValues: [] };

      newLevels[index] = {
        ...current,
        value: newValue,
        manual: true,
        procOrders: current.procOrders || [],
        procValues: current.procValues || []
      };

      // Créer un nouvel état temporaire pour recalculer proprement
      const newState = {
        ...prev,
        subStatsLevels: newLevels,
      };

      // Recalculer le score
      const baseScore = getTheoreticalScore(
        hunter,
        {
          ...newState,
          title, // ← très important pour savoir quel type d'artefact
        },
        substatsMinMaxByIncrements
      );

      // Stocker le score recalculé (si tu veux l’utiliser ailleurs)
      newState.score = baseScore;

      // Optionnel : met à jour les stats affichées en bas si nécessaire
      recalculateStatsFromArtifacts(newState);

      return newState;
    });
  };

  const handleSubStatChange = (index, value) => {
    onArtifactChange(prev => {
      const newSubStats = [...prev.subStats];
      const newSubStatsLevels = [...prev.subStatsLevels];

      // 🛡️ Si l'utilisateur remet la stat à une valeur par défaut (vide ou Substat 1/2/3/4)
      if (!value || value.includes('Substat') || value.includes('Select')) {
        newSubStats[index] = '';

        newSubStatsLevels[index] = {
          level: 0,
          value: 0,
          procOrders: [],
          procValues: []
        };

        return {
          ...prev,
          subStats: newSubStats,
          subStatsLevels: newSubStatsLevels,
        };

      }

      // 🧮 Sinon, on initialise normalement la nouvelle stat
      newSubStats[index] = value;

      const ranges = substatsMinMaxByIncrements[value];
      const rawInit = Math.random() * (ranges[0].max - ranges[0].min) + ranges[0].min;
      const initValue = value.includes('%') ? +rawInit.toFixed(2) : Math.floor(rawInit);

      newSubStatsLevels[index] = {
        level: 0,
        value: initValue,
        procOrders: [0],
        procValues: [initValue],
      };

      return {
        ...prev,
        subStats: newSubStats,
        subStatsLevels: newSubStatsLevels,
      };
    });
  };


  const getRandomProcValue = (stat, procOrder) => {
    const ranges = substatsMinMaxByIncrements[stat]?.[procOrder];
    if (!ranges) return 0;
    const { min, max } = ranges;
    return +(Math.random() * (max - min) + min); // Number, pas de .toFixed ici
  };

  const getNextProcOrder = (allProcOrders) => {
    for (let i = 0; i <= 4; i++) {
      if (!allProcOrders.includes(i)) return i;
    }
    return null;
  };

  // Handle incrémentation substat
  const handleIncreaseSubStat = (idx) => {
    setArtifactsData(prev => {
      const totalProcs = (prev.subStatsLevels || []).reduce(
        (sum, stat) => sum + (stat?.level || 0), 0
      );
      if (totalProcs >= 4 || prev.subStatsLevels[idx].level >= 4) return prev;

      const stat = prev.subStats[idx];
      const ranges = substatsMinMaxByIncrements[stat];
      if (!ranges) return prev;

      const newSubStatsLevels = [...prev.subStatsLevels];
      let current = newSubStatsLevels[idx] || {
        level: 0,
        value: 0,
        procOrders: [],
        procValues: [],
      };
      setInputValues(prev => ({
        ...prev,
        [idx]: stat.includes('%') ? newValue.toFixed(2) : Math.floor(newValue).toString()
      }));

      if (current.manual) {
        current.manual = false;
      }

      const allUsedProcOrders = newSubStatsLevels.flatMap(s => s.procOrders || []);
      const procOrder = getNextProcOrder(allUsedProcOrders);
      if (procOrder === null) return prev;

      const rawProc = Math.random() * (ranges[procOrder].max - ranges[procOrder].min) + ranges[procOrder].min;
      const procValue = stat.includes('%') ? +rawProc.toFixed(2) : Math.floor(rawProc);
      const newValue = stat.includes('%')
        ? +(current.value + procValue).toFixed(2)
        : Math.floor(current.value + procValue);

      const newProcOrders = [...current.procOrders, procOrder];
      const newProcValues = [...(current.procValues || []), procValue];

      newSubStatsLevels[idx] = {
        level: current.level + 1,
        value: newValue,
        procOrders: newProcOrders,
        procValues: newProcValues,
        manual: false,
      };

      const newState = {
        ...prev,
        subStatsLevels: newSubStatsLevels,
      };

      // 🧠 Mise à jour des stats calculées en bas
      recalculateStatsFromArtifacts(newState);

      // 😈 Message de Tank en fonction du proc
      if (procValue > 7) showTankMessage('🔥 OP roll!');
      else if (procValue < 5) showTankMessage('💩 Weak roll...');
      else showTankMessage('😎 Decent!');

      return newState;
    });
  };

  const renderCustomHint = (stat, subStatData) => {
    if (!stat || !subStatData) return null;
    const ranges = substatsMinMaxByIncrements[stat] || {};
    const orders = subStatData.procOrders || [];
    const values = subStatData.procValues || [];

    const minTotal = orders.reduce((sum, o) => sum + (ranges[o]?.min || 0), 0);
    const maxTotal = orders.reduce((sum, o) => sum + (ranges[o]?.max || 0), 0);
    const gotTotal = (subStatData.value || 0);

    const inRange = gotTotal >= minTotal && gotTotal <= maxTotal;

    return (
      <div>
        <div>
          Min: {stat?.includes('%') ? minTotal.toFixed(2) + '%' : Math.floor(minTotal)} |
          Max: {stat?.includes('%') ? maxTotal.toFixed(2) + '%' : Math.floor(maxTotal)}
        </div>
        <div style={{ color: inRange ? 'lime' : 'red' }}>
          You got: {stat?.includes('%') ? gotTotal.toFixed(2) + '%' : Math.floor(gotTotal)}
        </div>
        {orders.length > 0 && (
          <>
            <div className="mt-1">Breakdown:</div>
            <div className="text-gray-300 text-[10px]">
              {orders.map((o, i) => {
                const r = ranges[o];
                const value = values[i];
                const formattedValue = stat.includes('%') ? value?.toFixed(2) + '%' : Math.floor(value);
                return (
                  <div key={i}>
                    Proc {o}: {r?.min} → {r?.max} → {formattedValue}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  };

  // Handle désincrémentation substat
 const handleDecreaseSubStat = (idx) => {
  onArtifactChange(prev => {
    const stat = prev.subStats[idx];
    const newSubStatsLevels = [...prev.subStatsLevels];
    const current = newSubStatsLevels[idx];

    if (!current || current.level === 0 || !current.procOrders.length) return prev;

    const removedValue = current.procValues[current.procValues.length - 1];
    const updatedValue = +(current.value - removedValue).toFixed(2);

    // ✅ Déplacement ici — après calcul
    setInputValues(prev => ({
      ...prev,
      [idx]: stat.includes('%')
        ? updatedValue.toFixed(2)
        : Math.floor(updatedValue).toString()
    }));

    newSubStatsLevels[idx] = {
      level: current.level - 1,
      value: updatedValue,
      procOrders: current.procOrders.slice(0, -1),
      procValues: current.procValues.slice(0, -1),
    };

    const newState = {
      ...prev,
      subStatsLevels: newSubStatsLevels,
    };

    recalculateStatsFromArtifacts(newState);
    return newState;
  });
};

  return (
    <div className="artifact-card bg-[#0b0b1f] w-98 p-[1px] rounded-lg shadow-md text-white">
      <div className="flex justify-between items-center mb-[2px]">
        <h2 className="text-base font-bold">{title}</h2>
        <div className="flex items-center gap-2">
          {shouldShowComparison(artifactData) && !disableComparisonButton && (
            <div className="w-5 h-5 rounded-full from-[#3b3b9c] to-[#6c63ff] flex items-center justify-center text-white text-[10px] shadow-sm hover:scale-110 transition-transform">
              <button
                onClick={() => openComparisonPopup({ ...artifactData, title })}
                className="w-5 h-5 rounded-full from-[#3b3b9c] to-[#6c63ff] flex items-center justify-center text-white text-[10px] shadow-sm hover:scale-110 transition-transform"
                title="Comparer"
              >
                🔍
              </button>
            </div>
          )}
          <ArtifactScoreBadge artifact={{ ...artifactData, title }} hunter={hunter} substatsMinMaxByIncrements={substatsMinMaxByIncrements} />
        </div>
      </div>

      {/* MAIN STAT */}
      <div className="flex items-center gap-2 mb-[2px]">
        <select
          value={artifactData.mainStat || ''}
          onChange={(e) => handleMainStatChange(e)}
          className="w-full p-[1px] rounded bg-[#1c1c3c] text-xs"
        >
          <option value="">Select Main Stat</option>
          {mainStats.map((stat, idx) => (
            <option key={idx} value={stat}>{stat}</option>
          ))}
        </select>

        {artifactData.mainStat && (
          <input
            type="text"
            value={
              artifactData.mainStat && artifactData.subStatsLevels
                ? calculateMainStatValue(artifactData.mainStat, artifactData.subStatsLevels)
                : 0
            }
            className="w-16 p-[2px] rounded bg-[#2d2d5c] text-center text-xs text-white opacity-80 cursor-not-allowed"
          />
        )}
      </div>

      {/* SUBSTATS */}
      {Array.isArray(artifactData?.subStats) && artifactData.subStats.map((subStat, idx) => (
        <div key={idx} className="flex items-center gap-1 mb-[1px]">
          <select
            value={subStat}
            onChange={(e) => handleSubStatChange(idx, e.target.value)}
            className="w-full p-[2px] rounded bg-[#1c1c3c] text-xs"
          >
            <option value="">Substat {idx + 1}</option>
            {commonSubStats
              .filter(stat => stat === subStat || (stat !== artifactData.mainStat && !artifactData.subStats.includes(stat)))
              .map((stat, i) => (
                <option key={i} value={stat}>{stat}</option>
              ))}
          </select>

          {/* + / - boutons uniquement si une substat est sélectionnée */}
          {subStat && (
            <>
              <button
                onClick={() => handleDecreaseSubStat(idx)}
                className="bg-[#2d2d5c] text-white rounded w-5 h-5 text-[10px] px-[2px] flex items-center justify-center"
              >–</button>
              <span className="w-6 text-center">{`+${artifactData.subStatsLevels[idx].level}`}</span>
              <button
                onClick={() => handleIncreaseSubStat(idx)}
                disabled={artifactData.subStatsLevels[idx].level >= 4 || totalSubStatLevels >= 4}
                className={`bg-[#2d2d5c] text-white rounded w-5 h-5 text-[10px] px-[2px] flex items-center justify-center ${artifactData.subStatsLevels[idx].level >= 4 || totalSubStatLevels >= 4
                  ? 'bg-[#3c3c5c] cursor-not-allowed text-sm'
                  : 'bg-[#2d2d5c] text-white text-sm'
                  }`}
              >+</button>

              {/* INPUT + TOOLTIP */}
              <div className="relative">
                <input
                  type="text"
                  className="w-16 p-[1px] rounded bg-[#1c1c3c] text-center text-xs"
                  value={
                    inputValues[idx] !== undefined
                      ? inputValues[idx]
                      : artifactData.subStats[idx]?.includes('%')
                        ? (artifactData.subStatsLevels[idx]?.value || 0).toFixed(2)
                        : Math.floor(artifactData.subStatsLevels[idx]?.value || 0).toString()
                  }
                  onChange={(e) => {
                    let raw = e.target.value;

                    // 🔒 Étape 1 : caractères valides seulement
                    raw = raw.replace(/[^0-9.,]/g, '');
                    raw = raw.replace(/,/g, '.');

                    const allowDecimal = artifactData.subStats[idx]?.includes('%');

                    // 🔁 Garder un seul point
                    const parts = raw.split('.');
                    if (parts.length > 2) {
                      raw = parts[0] + '.' + parts[1];
                    }

                    // ✂️ Limiter à 2 décimales
                    if (allowDecimal && raw.includes('.')) {
                      const [intPart, decPart] = raw.split('.');
                      raw = intPart + '.' + decPart.slice(0, 2);
                    }

                    // 💾 Maj visuelle de l’input
                    setInputValues(prev => ({ ...prev, [idx]: raw }));

                    // 💣 On accepte temporairement champ vide sans appliquer
                    if (raw === '') return;

                    // 🧠 Nettoyage et parse
                    const cleaned = allowDecimal ? raw : raw.replace(/\./g, '');
                    const parsed = parseFloat(cleaned);
                    raw = cleaned;

                    if (!isNaN(parsed)) {
                      handleManualSubStatChange(idx, parsed);
                    }
                  }}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
                {hoveredIndex === idx && (
                  <div
                    className="absolute z-50 text-xs p-2 rounded shadow-lg ml-2"
                    style={{
                      backgroundColor: '#2d2d5c',
                      color: 'white',
                      left: 'calc(100% + 4px)',
                      top: '0',
                      whiteSpace: 'pre-line',
                      width: '240px',
                      pointerEvents: 'none',
                    }}
                  >
                    {renderCustomHint(subStat, artifactData.subStatsLevels[idx])}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default ArtifactCard;