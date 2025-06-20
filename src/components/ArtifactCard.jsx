import React, { useState } from "react";
import ArtifactScoreBadge from './ArtifactScoreBadge';
import { getTheoreticalScore } from '../utils/statPriority';
import { useEffect } from 'react';
import { handleNumericInput } from '../utils/inputUtils';
import '../i18n/i18n';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import { getSetIcon } from "../utils/artifactUtils"; // adapte le chemin
import ArtifactSavePopup from './ArtifactSavePopup';
import ArtifactLibrary from './ArtifactLibrary'; // 👈 🔥 AJOUTE ÇA !


// const getSetIcon = (setName) => {
//   const iconMap = {
//     "Toughness (Hard Leather Set)": "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750333738/set_a6k4yh.png",
//     "Solid Analysis (New Hunter Set)": "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750333738/set_a6k4yh.png",
//     "Guardian (Palace Guard Set)": "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750333738/set_a6k4yh.png",
//     // Ajoute tes vrais liens plus tard 👆
//   };

//   return iconMap[setName] || "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750333738/set_a6k4yh.png";
// };

const commonSubStats = [
  'Attack %', 'Additional Attack', 'Defense Penetration', 'Damage Increase', 'Additional Defense',
  'Defense %', 'Additional HP', 'HP %', 'MP Consumption Reduction',
  'Additional MP', 'MP Recovery Rate Increase (%)', 'Damage Reduction', 'Critical Hit Damage', 'Critical Hit Rate'
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
    0: 4866,
    1: 4866,
    2: 4866,
    3: 4866,
    4: 4866,
  },
  'HP %': {
    0: 25.5,
    1: 25.5,
    2: 25.5,
    3: 25.5,
    4: 25.5,
  },
  'Critical Hit Damage': {
    0: 5899,
    1: 5899,
    2: 5899,
    3: 5899,
    4: 5899,
  },
  'Defense Penetration': {
    0: 5899,
    1: 5899,
    2: 5899,
    3: 5899,
    4: 5899,
  },
  'Healing Given Increase (%)': {
    0: 6.12,
    1: 6.12,
    2: 6.12,
    3: 6.12,
    4: 6.12,
  },
  'MP Consumption Reduction': {
    0: 30,
    1: 30,
    2: 30,
    3: 30,
    4: 30,
  },
  'Additional MP': {
    0: 1044,
    1: 1044,
    2: 1044,
    3: 1044,
    4: 1044,
  },
  'MP Recovery Rate Increase (%)': {
    0: 30,
    1: 30,
    2: 30,
    3: 30,
    4: 30,
  },
  'Damage Increase': {
    0: 4899,
    1: 4899,
    2: 4899,
    3: 4899,
    4: 4899,
  },
  'Damage Reduction': {
    0: 24,
    1: 24,
    2: 24,
    3: 24,
    4: 24,
  },
  'Fire Damage %': {
  0: 13.82,
  1: 13.82,
  2: 13.82,
  3: 13.82,
  4: 13.82,
},
'Water Damage %': {
  0: 13.82,
  1: 13.82,
  2: 13.82,
  3: 13.82,
  4: 13.82,
},
'Wind Damage %': {
  0: 13.82,
  1: 13.82,
  2: 13.82,
  3: 13.82,
  4: 13.82,
},
'Light Damage %': {
  0: 13.82,
  1: 13.82,
  2: 13.82,
  3: 13.82,
  4: 13.82,
},
'Dark Damage %': {
  0: 13.82,
  1: 13.82,
  2: 13.82,
  3: 13.82,
  4: 13.82,
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
  onArtifactSave, // 🔥 NOUVEAU PROP
   onSetIconClick, // 👈 ajoute-le ici
   handleLoadSavedSet,
  hunter,
  substatsMinMaxByIncrements,
  openComparisonPopup, // 👈 ajoute-le ici
  mode = "edit", // default
  disableComparisonButton = false, // 👈 AJOUT
   artifactLibrary,  // 👈 NOUVEAU !
  activeAccount     // 👈 NOUVEAU !
}) => {
  const { t } = useTranslation();


// 🔥 AJOUTE AUSSI UN BOUTON DE TEST TEMPORAIRE dans le JSX :
// Juste après le titre, avant les icônes :

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [inputValues, setInputValues] = useState({});
  const [showLibrary, setShowLibrary] = useState(false);
const [librarySlot, setLibrarySlot] = useState(null); // 👈 GARDE LE SLOT
  const [showSavePopup, setShowSavePopup] = useState(false);
  const selections = artifactData;
  const [localMainStat, setLocalMainStat] = useState(artifactData.mainStat || '');
  const [currentSetIcon, setCurrentSetIcon] = useState(
  artifactData.set 
    ? getSetIcon(artifactData.set, title) || "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750333738/set_a6k4yh.png"
    : "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750333738/set_a6k4yh.png"
);
  const setArtifactsData = (newData) => onArtifactChange(newData);
  const slot = title?.title || title; // sécurité double 😏

  const handleResetArtifact = (slot) => {

  // Réinitialise complètement l'artefact
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
  
  // Reset l'icône de set aussi
  setCurrentSetIcon("https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750333738/set_a6k4yh.png");
  
  // Message Tank
  showTankMessage && showTankMessage(`🔄 ${slot} remis à zéro !`, true);
  


  
  // Recalcul des stats
  recalculateStatsFromArtifacts && recalculateStatsFromArtifacts();
};

  const handleSelectFromLibrary = (selectedArtifact) => {
  
  // Applique l'artefact sélectionné
  onArtifactChange(() => ({
    mainStat: selectedArtifact.mainStat,
    subStats: selectedArtifact.subStats,
    subStatsLevels: selectedArtifact.subStatsLevels,
    set: selectedArtifact.set,
    mainStatValue: selectedArtifact.mainStatValue,
    savedArtifactId: selectedArtifact.id,
    savedArtifactName: selectedArtifact.name
  }));
  
  // Met à jour l'icône de set
  setCurrentSetIcon(
    getSetIcon(selectedArtifact.set, title) || 
    "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750333738/set_a6k4yh.png"
  );
  
  // Recalcule les stats
  recalculateStatsFromArtifacts && recalculateStatsFromArtifacts();
  
  // Message Tank
  showTankMessage && showTankMessage(`📦 "${selectedArtifact.name}" chargé !`, true);
  
  // Ferme la librairie
  setShowLibrary(false);
  setLibrarySlot(null);
};

const handleOpenLibrary = (slot) => {
  setLibrarySlot(slot); // 👈 GARDE LE SLOT !
  setShowLibrary(true);
};

  useEffect(() => {
  }, [artifactData.set]);

  // 🔥 useEffect POUR L'ICÔNE ICI !
  useEffect(() => {
    
    if (artifactData.set) {
      const newIcon = getSetIcon(artifactData.set, title);
      
      setCurrentSetIcon(
        newIcon || "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750333738/set_a6k4yh.png"
      );
    } else {
      setCurrentSetIcon("https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750333738/set_a6k4yh.png");
    }
  }, [artifactData.set, title]);

  useEffect(() => {
    setLocalMainStat(artifactData.mainStat || '');
  }, [artifactData.mainStat]);

  useEffect(() => {
}, [artifactData.set]);

const handleSaveSet = (slot) => {
  
  if (!shouldShowSave(artifactData)) {
    showTankMessage && showTankMessage("❌ Artefact incomplet !");
    return;
  }
  
  setShowSavePopup(true);
};

// Ajoute cette fonction pour gérer la sauvegarde :
const handleArtifactSave = (saveData) => {
  
  // On va l'envoyer au parent BuilderBeru.jsx
  if (onArtifactSave) {
    onArtifactSave(saveData);
  }
  
  showTankMessage && showTankMessage(`💾 "${saveData.name}" sauvé !`);
};

  const updateArtifactMainStat = (newValue) => {
    // 🔧 Propager la mise à jour au parent (si nécessaire)
    setArtifactsData(prev => ({
      ...prev,
      mainStat: newValue
    }));
  };

  const shouldShowComparison = (artifact) => {
    const totalProcs = artifact.subStatsLevels?.reduce((sum, s) => sum + (s?.level || 0), 0);
    const allProcsDone = totalProcs === 4;
    const allStatsSelected = artifact.mainStat && artifact.subStats?.every(s => s !== '');

    return allProcsDone && allStatsSelected;
  };

  const shouldShowSave = (artifact) => {
  
  // 1. Set choisi
  const hasSet = artifact.set && artifact.set !== '';
  
  // 2. Main stat sélectionnée
  const hasMainStat = artifact.mainStat && artifact.mainStat !== '';
  
  // 3. Toutes les substats sélectionnées (4 substats non-vides)
  const allSubStatsSelected = artifact.subStats?.every(s => s && s !== '') && artifact.subStats?.length === 4;

  
  // 4. Total de 4 procs
  const totalProcs = artifact.subStatsLevels?.reduce((sum, s) => sum + (s?.level || 0), 0);
  const allProcsDone = totalProcs === 4;

  
  const canSave = hasSet && hasMainStat && allSubStatsSelected && allProcsDone;

  
  return canSave;
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
    return subStatData.stat?.includes("%") ? +rawValue.toFixed(2) : (rawValue);
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
     // Appliquer la règle de formatage selon si c'est un pourcentage ou non
  return stat.includes('%') ? +rawValue.toFixed(2) : Math.round(rawValue);
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

      // Recalcul stats
      recalculateStatsFromArtifacts(newState);

      // Envoie message de Tank
      if (procValue > 7) showTankMessage('🔥 OP roll!');
      else if (procValue < 5) showTankMessage('💩 Weak roll...');
      else showTankMessage('😎 Decent!');

      // 💡 Ajout d'un indicateur temporaire pour mettre à jour le champ visuel
      setTimeout(() => {
        setInputValues(prev => ({
          ...prev,
          [idx]: stat.includes('%') ? newValue.toFixed(2) : (newValue).toString()
        }));
      }, 0);

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

      // ⚠️ On évite le crash React en décalant le setInputValues
      setTimeout(() => {
        setInputValues(prev => ({
          ...prev,
          [idx]: stat.includes('%')
            ? updatedValue.toFixed(2)
            : Math.floor(updatedValue).toString()
        }));
      }, 0);

      return newState;
    });
  };


  return (
    <div className="artifact-card bg-[#0b0b1f] w-75 p-[1px] rounded-lg shadow-md text-white">
      <div className="flex justify-between items-center mb-[2px]">
        <h2 className="text-base font-bold">{t(`titleArtifact.${title}`)}</h2>
        <div className="flex items-center gap-1">
  

{/* Icône pour charger un set (ANCIEN NOM, NOUVELLE FONCTION) */}
<img
  src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750335621/chooseSet_fo08yb.png"
  onClick={() => handleOpenLibrary(title)} // 👈 GARDE LE TITLE !
  alt="Charger un set existant"
  className="w-4 h-4 cursor-pointer hover:scale-110 transition"
  title="Charger un set existant"
/>



   {/* Bouton d’ouverture de set (avec ou sans set existant) */}
<img
  src={currentSetIcon}  // 🔥 AU LIEU DE getSetIcon()
  onClick={() => onSetIconClick(title)}
  alt={artifactData.set || "Sélectionner un Set"}
  title={artifactData.set || "Choisir un Set"}
  className="w-5 h-5 cursor-pointer hover:scale-110 transition"
/>

 {/* 🔥 NOUVEAU BOUTON RESET - À DROITE DU DIAMANT */}
    <img
      src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750356736/resetArtifact_eobh2e.png"
      onClick={() => handleResetArtifact(title)}
      alt="Reset Artifact"
      title="Reset Artifact"
      className="w-4 h-4 cursor-pointer hover:scale-110 transition"
    />

   
 {/* Icône du save - CONDITIONNELLE */}
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
          <ArtifactScoreBadge artifact={{ ...artifactData, title }} hunter={hunter} substatsMinMaxByIncrements={substatsMinMaxByIncrements} />
        </div>
      </div>

      {/* MAIN STAT */}
      <div className="flex items-center gap-2 mb-[2px]">
        <select
          value={localMainStat}
          onChange={(e) => {
            const selectedValue = e.target.value;
            setLocalMainStat(selectedValue); // ⚡ Mise à jour visuelle
            updateArtifactMainStat(selectedValue); // 🔁 Mise à jour logique
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
                className={`w-4 h-4 select-none ${artifactData.subStatsLevels[idx].level >= 4 || totalSubStatLevels >= 4
                    ? 'opacity-30 cursor-not-allowed'
                    : 'cursor-pointer hover:scale-105 transition'
                  }`}
              />
              <span className="w-6 text-center text-sm">{`+${artifactData.subStatsLevels[idx].level}`}</span>

              {/* INPUT + TOOLTIP */}
              <div className="relative">
                <input
                  type="text"
                  className="w-16 p-[1px] rounded bg-[#1c1c3c] text-center text-xs"
                  value={
  inputValues[idx] !== undefined
    ? inputValues[idx]
    : (() => {
        const val = artifactData.subStatsLevels[idx]?.value || 0;
        return artifactData.subStats[idx]?.includes('%')
          ? val.toFixed(2)
          : Number.isInteger(val)
            ? val
            : Math.round(val);
      })()
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
    slot={librarySlot} // 👈 UTILISE LE SLOT STOCKÉ !
    onSelect={handleSelectFromLibrary}
    onClose={() => {
      setShowLibrary(false);
      setLibrarySlot(null); // 👈 RESET
    }}
    artifactLibrary={artifactLibrary}
    activeAccount={activeAccount}
  />
)}
    </div>
  );
}

export default ArtifactCard;