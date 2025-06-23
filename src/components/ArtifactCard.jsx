import React, { useState } from "react";
import ArtifactScoreBadge from './ArtifactScoreBadge';
import { getTheoreticalScore } from '../utils/statPriority';
import { useEffect } from 'react';
import { handleNumericInput } from '../utils/inputUtils';
import '../i18n/i18n';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import { getSetIcon } from "../utils/artifactUtils";
import ArtifactSavePopup from './ArtifactSavePopup';
import ArtifactLibrary from './ArtifactLibrary';


const commonSubStats = [
  'Attack %', 'Additional Attack', 'Defense Penetration', 'Damage Increase', 'Additional Defense',
  'Defense %', 'Additional HP', 'HP %', 'MP Consumption Reduction',
  'Additional MP', 'MP Recovery Rate Increase (%)', 'Damage Reduction', 'Critical Hit Damage', 'Critical Hit Rate'
];

const mainStatMaxByIncrements = {
  'Additional Defense': {
    0: 2433, 1: 2433, 2: 2433, 3: 2433, 4: 2433,
  },
  'Defense %': {
    0: 25.5, 1: 25.5, 2: 25.5, 3: 25.5, 4: 25.5,
  },
  'Additional Attack': {
    0: 2433, 1: 2433, 2: 2433, 3: 2433, 4: 2433,
  },
  'Attack %': {
    0: 25.5, 1: 25.5, 2: 25.5, 3: 25.5, 4: 25.5,
  },
  'Additional HP': {
    0: 4866, 1: 4866, 2: 4866, 3: 4866, 4: 4866,
  },
  'HP %': {
    0: 25.5, 1: 25.5, 2: 25.5, 3: 25.5, 4: 25.5,
  },
  'Critical Hit Damage': {
    0: 5899, 1: 5899, 2: 5899, 3: 5899, 4: 5899,
  },
  'Defense Penetration': {
    0: 5899, 1: 5899, 2: 5899, 3: 5899, 4: 5899,
  },
  'Healing Given Increase (%)': {
    0: 6.12, 1: 6.12, 2: 6.12, 3: 6.12, 4: 6.12,
  },
  'MP Consumption Reduction': {
    0: 30, 1: 30, 2: 30, 3: 30, 4: 30,
  },
  'Additional MP': {
    0: 1044, 1: 1044, 2: 1044, 3: 1044, 4: 1044,
  },
  'MP Recovery Rate Increase (%)': {
    0: 30, 1: 30, 2: 30, 3: 30, 4: 30,
  },
  'Damage Increase': {
    0: 4899, 1: 4899, 2: 4899, 3: 4899, 4: 4899,
  },
  'Damage Reduction': {
    0: 24, 1: 24, 2: 24, 3: 24, 4: 24,
  },
  'Fire Damage %': {
    0: 13.82, 1: 13.82, 2: 13.82, 3: 13.82, 4: 13.82,
  },
  'Water Damage %': {
    0: 13.82, 1: 13.82, 2: 13.82, 3: 13.82, 4: 13.82,
  },
  'Wind Damage %': {
    0: 13.82, 1: 13.82, 2: 13.82, 3: 13.82, 4: 13.82,
  },
  'Light Damage %': {
    0: 13.82, 1: 13.82, 2: 13.82, 3: 13.82, 4: 13.82,
  },
  'Dark Damage %': {
    0: 13.82, 1: 13.82, 2: 13.82, 3: 13.82, 4: 13.82,
  }
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
  onArtifactSave,
  onSetIconClick,
  handleLoadSavedSet,
  hunter,
  substatsMinMaxByIncrements,
  openComparisonPopup,
  mode = "edit",
  disableComparisonButton = false,
  artifactLibrary,
  activeAccount,
  onScoreCalculated // ← NOUVEAU PROP CALLBACK
}) => {
  const { t } = useTranslation();

  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  // 🔥 NOUVELLE GESTION DES INPUTS - État local séparé
  const [inputStates, setInputStates] = useState({});
  const [isFocused, setIsFocused] = useState({});
  
  const [showLibrary, setShowLibrary] = useState(false);
  const [librarySlot, setLibrarySlot] = useState(null);
  const [showSavePopup, setShowSavePopup] = useState(false);
  const selections = artifactData;
  const [localMainStat, setLocalMainStat] = useState((artifactData && artifactData.mainStat) || '');
  const [currentSetIcon, setCurrentSetIcon] = useState(
    (artifactData && artifactData.set)
      ? getSetIcon(artifactData.set, title) || "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750333738/set_a6k4yh.png"
      : "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750333738/set_a6k4yh.png"
  );
  
  const setArtifactsData = (newData) => onArtifactChange(newData);
  const slot = title?.title || title;

  // 🔥 FONCTION POUR FORMATER LA VALEUR SELON LE TYPE
  const formatValue = (value, statName) => {
    if (!statName) return '';
    const isPercentage = statName.includes('%');
    
    if (isPercentage) {
      return Number(value).toFixed(2);
    } else {
      return Math.round(Number(value)).toString();
    }
  };

  // 🔥 FONCTION POUR OBTENIR LA VALEUR D'AFFICHAGE
  const getDisplayValue = (idx) => {
    const artifactValue = artifactData?.subStatsLevels?.[idx]?.value || 0;
    const statName = artifactData?.subStats?.[idx];
    
    // Si l'input est focus et qu'on a un état local, on l'utilise
    if (isFocused[idx] && inputStates[idx] !== undefined) {
      return inputStates[idx];
    }
    
    // Sinon on affiche la valeur formatée de l'artefact
    return formatValue(artifactValue, statName);
  };

  // 🔥 VALIDATION ET NETTOYAGE DE LA SAISIE
  const validateAndCleanInput = (input, statName) => {
    if (!statName) return '';
    
    const isPercentage = statName.includes('%');
    
    // Autoriser seulement chiffres, point et virgule
    let cleaned = input.replace(/[^0-9.,]/g, '');
    
    // Remplacer virgule par point
    cleaned = cleaned.replace(/,/g, '.');
    
    // Pour les non-pourcentages, supprimer les points
    if (!isPercentage) {
      cleaned = cleaned.replace(/\./g, '');
    }
    
    // Garder un seul point pour les pourcentages
    if (isPercentage && cleaned.includes('.')) {
      const parts = cleaned.split('.');
      if (parts.length > 2) {
        cleaned = parts[0] + '.' + parts[1];
      }
      // Limiter à 2 décimales
      if (parts[1] && parts[1].length > 2) {
        cleaned = parts[0] + '.' + parts[1].slice(0, 2);
      }
    }
    
    return cleaned;
  };

  // 🔥 GESTION DU FOCUS SUR L'INPUT
  const handleInputFocus = (idx) => {
    setIsFocused(prev => ({ ...prev, [idx]: true }));
    
    const currentValue = artifactData?.subStatsLevels?.[idx]?.value || 0;
    
    // Si la valeur est 0, on vide l'input
    if (currentValue === 0) {
      setInputStates(prev => ({ ...prev, [idx]: '' }));
    } else {
      // Sinon on garde la valeur actuelle
      const statName = artifactData?.subStats?.[idx];
      setInputStates(prev => ({ 
        ...prev, 
        [idx]: formatValue(currentValue, statName)
      }));
    }
  };

  // 🔥 GESTION DE LA PERTE DE FOCUS
  const handleInputBlur = (idx) => {
    setIsFocused(prev => ({ ...prev, [idx]: false }));
    
    const inputValue = inputStates[idx];
    const statName = artifactData?.subStats?.[idx];
    
    if (inputValue === '' || inputValue === undefined) {
      // Si l'input est vide, on met 0
      handleManualSubStatChange(idx, 0);
    } else {
      // Sinon on parse et applique la valeur
      const parsed = parseFloat(inputValue);
      if (!isNaN(parsed)) {
        handleManualSubStatChange(idx, parsed);
      }
    }
    
    // Reset de l'état local pour cet input
    setInputStates(prev => {
      const newState = { ...prev };
      delete newState[idx];
      return newState;
    });
  };

  // 🔥 GESTION DU CHANGEMENT DE VALEUR
  const handleInputChange = (idx, rawValue) => {
    const statName = artifactData?.subStats?.[idx];
    const cleanedValue = validateAndCleanInput(rawValue, statName);
    
    // Mise à jour de l'état local uniquement
    setInputStates(prev => ({ ...prev, [idx]: cleanedValue }));
  };

  // Fonction de reset d'artefact (inchangée)
  const handleResetArtifact = (slot) => {
    onArtifactChange(() => ({
      mainStat: '',
      subStats: ['', '', '', ''],
      subStatsLevels: [
        { value: 0, level: 0, procOrders: [], procValues: [] },
        { value: 0, level: 0, procOrders: [], procValues: [] },
        { value: 0, level: 0, procOrders: [], procValues: [] },
        { value: 0, level: 0, procOrders: [], procValues: [] }
      ],
      set: '',
      mainStatValue: 0,
      savedArtifactId: undefined,
      savedArtifactName: undefined
    }));
    
    setCurrentSetIcon("https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750333738/set_a6k4yh.png");
    showTankMessage && showTankMessage(`🔄 ${slot} remis à zéro !`, true);
    recalculateStatsFromArtifacts && recalculateStatsFromArtifacts();
  };

  // Fonction de sélection depuis la librairie (inchangée)
  const handleSelectFromLibrary = (selectedArtifact) => {
    onArtifactChange(() => ({
      mainStat: selectedArtifact.mainStat,
      subStats: selectedArtifact.subStats,
      subStatsLevels: selectedArtifact.subStatsLevels,
      set: selectedArtifact.set,
      mainStatValue: selectedArtifact.mainStatValue,
      savedArtifactId: selectedArtifact.id,
      savedArtifactName: selectedArtifact.name
    }));
    
    setCurrentSetIcon(
      getSetIcon(selectedArtifact.set, title) || 
      "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750333738/set_a6k4yh.png"
    );
    
    recalculateStatsFromArtifacts && recalculateStatsFromArtifacts();
    showTankMessage && showTankMessage(`📦 "${selectedArtifact.name}" chargé !`, true);
    
    setShowLibrary(false);
    setLibrarySlot(null);
  };

  const handleOpenLibrary = (slot) => {
    setLibrarySlot(slot);
    setShowLibrary(true);
  };

  useEffect(() => {
    if (artifactData && artifactData.mainStat) {
      setLocalMainStat(artifactData.mainStat);
    }
  }, [artifactData?.mainStat]);

  useEffect(() => {
    if (artifactData && artifactData.set) {
      const newIcon = getSetIcon(artifactData.set, title);
      setCurrentSetIcon(
        newIcon || "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750333738/set_a6k4yh.png"
      );
    } else {
      setCurrentSetIcon("https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750333738/set_a6k4yh.png");
    }
  }, [artifactData?.set, title]);

  useEffect(() => {
    if (artifactData && artifactData.mainStat !== undefined) {
      setLocalMainStat(artifactData.mainStat || '');
    }
  }, [artifactData?.mainStat]);

  const handleSaveSet = (slot) => {
    if (!shouldShowSave(artifactData)) {
      showTankMessage && showTankMessage("❌ Artefact incomplet !");
      return;
    }
    setShowSavePopup(true);
  };

  const handleArtifactSave = (saveData) => {
    if (onArtifactSave) {
      onArtifactSave(saveData);
    }
    showTankMessage && showTankMessage(`💾 "${saveData.name}" sauvé !`);
  };

  const updateArtifactMainStat = (newValue) => {
    setArtifactsData(prev => ({
      ...prev,
      mainStat: newValue
    }));
  };

  const shouldShowComparison = (artifact) => {
    if (!artifact || typeof artifact !== 'object') return false;
    const totalProcs = artifact.subStatsLevels?.reduce((sum, s) => sum + (s?.level || 0), 0);
    const allProcsDone = totalProcs === 4;
    const allStatsSelected = artifact.mainStat && artifact.subStats?.every(s => s !== '');
    return allProcsDone && allStatsSelected;
  };

  const shouldShowSave = (artifact) => {
    if (!artifact || typeof artifact !== 'object') return false;
    const hasSet = artifact.set && artifact.set !== '';
    const hasMainStat = artifact.mainStat && artifact.mainStat !== '';
    const allSubStatsSelected = artifact.subStats?.every(s => s && s !== '') && artifact.subStats?.length === 4;
    const totalProcs = artifact.subStatsLevels?.reduce((sum, s) => sum + (s?.level || 0), 0);
    const allProcsDone = totalProcs === 4;
    return hasSet && hasMainStat && allSubStatsSelected && allProcsDone;
  };

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
    return subStatData.stat?.includes("%") ? +rawValue.toFixed(2) : (rawValue);
  };

  // 🔥 VERSION OPTIMISÉE DE handleManualSubStatChange
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

      const newState = {
        ...prev,
        subStatsLevels: newLevels,
      };

      const baseScore = getTheoreticalScore(
        hunter,
        {
          ...newState,
          title,
        },
        substatsMinMaxByIncrements
      );

      newState.score = baseScore;
      recalculateStatsFromArtifacts(newState);

      return newState;
    });
  };

  const handleSubStatChange = (index, value) => {
    onArtifactChange(prev => {
      const newSubStats = [...prev.subStats];
      const newSubStatsLevels = [...prev.subStatsLevels];

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

      newSubStats[index] = value;

      const ranges = substatsMinMaxByIncrements[value];
      const rawInit = Math.random() * (ranges[0].max - ranges[0].min) + ranges[0].min;
      const initValue = value.includes('%') ? +rawInit.toFixed(2) : (rawInit);

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
    const rawValue = Math.random() * (max - min) + min;
    return stat.includes('%') ? +rawValue.toFixed(2) : Math.round(rawValue);
  };

  const getNextProcOrder = (allProcOrders) => {
    for (let i = 0; i <= 4; i++) {
      if (!allProcOrders.includes(i)) return i;
    }
    return null;
  };

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

      if (current.manual) {
        current.manual = false;
      }

      const allUsedProcOrders = newSubStatsLevels.flatMap(s => s.procOrders || []);
      const procOrder = getNextProcOrder(allUsedProcOrders);
      if (procOrder === null) return prev;

      const rawProc = Math.random() * (ranges[procOrder].max - ranges[procOrder].min) + ranges[procOrder].min;
      const procValue = stat.includes('%') ? +rawProc.toFixed(2) : Math.round(rawProc);
      const newValue = stat.includes('%')
        ? +(current.value + procValue).toFixed(2)
        : Math.round(current.value + procValue);

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

      recalculateStatsFromArtifacts(newState);

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

  const handleDecreaseSubStat = (idx) => {
    setArtifactsData(prev => {
      const stat = prev.subStats[idx];
      const newSubStatsLevels = [...prev.subStatsLevels];
      const current = newSubStatsLevels[idx];

      if (!current || current.level === 0 || !current.procOrders.length) return prev;

      const removedValue = current.procValues[current.procValues.length - 1];
      const updatedValue = +(current.value - removedValue).toFixed(2);

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
    <div className="artifact-card bg-[#0b0b1f] w-75 p-[1px] rounded-lg shadow-md text-white">
      <div className="flex justify-between items-center mb-[2px]">
        <h2 className="text-base font-bold">{t(`titleArtifact.${title}`)}</h2>
        <div className="flex items-center gap-1">
          <img
            src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750335621/chooseSet_fo08yb.png"
            onClick={() => handleOpenLibrary(title)}
            alt="Charger un set existant"
            className="w-4 h-4 cursor-pointer hover:scale-110 transition"
            title="Charger un set existant"
          />

          <img
            src={currentSetIcon}
            onClick={() => onSetIconClick(title)}
            alt={(artifactData && artifactData.set) || "Sélectionner un Set"}
            title={(artifactData && artifactData.set) || "Choisir un Set"}
            className="w-5 h-5 cursor-pointer hover:scale-110 transition"
          />

          <img
            src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750356736/resetArtifact_eobh2e.png"
            onClick={() => handleResetArtifact(title)}
            alt="Reset Artifact"
            title="Reset Artifact"
            className="w-4 h-4 cursor-pointer hover:scale-110 transition"
          />

          {shouldShowSave(artifactData) && (
            <img
              src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750335754/saveSet_gp2hfr.png"
              onClick={() => handleSaveSet(title)}
              alt="Save le set"
              className="w-4 h-4 cursor-pointer hover:scale-110 transition"
              title="Save le set"
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          {shouldShowComparison(artifactData) && !disableComparisonButton && (
            <div className="w-5 h-5 rounded-full from-[#3b3b9c] to-[#6c63ff] flex items-center justify-center text-white text-[10px] shadow-sm hover:scale-110 transition-transform">
              <button
                onClick={() => openComparisonPopup({ ...artifactData, title })}
                className="w-1 h-1 rounded-full from-[#3b3b9c] to-[#6c63ff] flex items-center justify-center text-white text-[10px] shadow-sm hover:scale-110 transition-transform"
                title="Comparer"
              >
                🔍
              </button>
            </div>
          )}
          <ArtifactScoreBadge artifact={{ ...artifactData, title }} hunter={hunter} substatsMinMaxByIncrements={substatsMinMaxByIncrements} onScoreCalculated={onScoreCalculated} showTankMessage={showTankMessage}/>
        </div>
      </div>

      {/* MAIN STAT */}
      <div className="flex items-center gap-2 mb-[2px]">
        <select
          value={localMainStat}
          onChange={(e) => {
            const selectedValue = e.target.value;
            setLocalMainStat(selectedValue);
            updateArtifactMainStat(selectedValue);
          }}
          className="w-full p-[1px] rounded bg-[#1c1c3c] text-xs"
        >
          <option value="">{t("selectMainStat", "Select Main Stat")}</option>
          {mainStats.map((stat, idx) => (
            <option key={idx} value={stat}>
              {t(`stats.${stat}`, stat)}
            </option>
          ))}
        </select>

        {(artifactData && artifactData.mainStat) && (
          <input
            type="text"
            value={
              (artifactData && artifactData.mainStat && artifactData.subStatsLevels)
                ? calculateMainStatValue(artifactData.mainStat, artifactData.subStatsLevels)
                : 0
            }
            className="w-16 p-[2px] rounded bg-[#2d2d5c] text-center text-xs text-white opacity-80 cursor-not-allowed"
            readOnly
          />
        )}
      </div>

      {/* SUBSTATS */}
      {(artifactData && Array.isArray(artifactData.subStats)) && artifactData.subStats.map((subStat, idx) => (
        <div key={idx} className="flex items-center gap-1 mb-[1px]">
          <select
            value={subStat}
            onChange={(e) => handleSubStatChange(idx, e.target.value)}
            className="w-full p-[2px] rounded bg-[#1c1c3c] text-xs"
          >
            <option value="">{t("subStatLabel", `Substat ${idx + 1}`)}</option>

            {commonSubStats
              .filter(stat =>
                stat === subStat ||
                (stat !== artifactData.mainStat && !artifactData.subStats.includes(stat))
              )
              .map((stat, i) => (
                <option key={i} value={stat}>
                  {t(`stats.${stat}`, stat)}
                </option>
              ))}
          </select>

          {/* + / - boutons uniquement si une substat est sélectionnée */}
          {subStat && (
            <>
              <img
                src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748513494/BoutonMoins_zlzwcz.png"
                alt="Moins"
                onClick={() => handleDecreaseSubStat(idx)}
                className="w-4 h-4 cursor-pointer select-none"
              />
              <img
                src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748513182/BoutonPlus_zc3k7t.png"
                alt="Plus"
                onClick={() => {
                  if (artifactData.subStatsLevels[idx].level < 4 && totalSubStatLevels < 4) {
                    handleIncreaseSubStat(idx);
                  }
                }}
                className={`w-4 h-4 select-none ${
                  artifactData.subStatsLevels[idx].level >= 4 || totalSubStatLevels >= 4
                    ? 'opacity-30 cursor-not-allowed'
                    : 'cursor-pointer hover:scale-105 transition'
                }`}
              />
              <span className="w-6 text-center text-sm">{`+${artifactData.subStatsLevels[idx].level}`}</span>

              {/* 🔥 NOUVEL INPUT OPTIMISÉ */}
              <div className="relative">
                <input
                  type="text"
                  className="w-16 p-[1px] rounded bg-[#1c1c3c] text-center text-xs focus:bg-[#2d2d5c] focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  value={getDisplayValue(idx)}
                  onChange={(e) => handleInputChange(idx, e.target.value)}
                  onFocus={() => handleInputFocus(idx)}
                  onBlur={() => handleInputBlur(idx)}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  placeholder="0"
                />
                
                {/* TOOLTIP */}
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

      {/* Popup de sauvegarde */}
      {showSavePopup && (
        <ArtifactSavePopup
          artifactData={artifactData}
          slot={title}
          onSave={handleArtifactSave}
          onClose={() => setShowSavePopup(false)}
          hunter={hunter?.name || 'unknown'}
        />
      )}

      {/* Librairie avec le bon slot */}
      {showLibrary && librarySlot && (
        <ArtifactLibrary
          slot={librarySlot}
          onSelect={handleSelectFromLibrary}
          onClose={() => {
            setShowLibrary(false);
            setLibrarySlot(null);
          }}
          artifactLibrary={artifactLibrary}
          activeAccount={activeAccount}
        />
      )}
    </div>
  );
}

export default ArtifactCard;