// src/components/ScoreCard/BDGScorePage.jsx
import React, { useState, useEffect } from 'react';
import BDGViewMode from './BDGViewMode';
import BDGEditMode from './BDGEditMode';
import { validateBuildCompleteness } from './bdgService';

const BDGScorePage = ({ onClose, weekData, showTankMessage }) => {
  // Vérification de sécurité
  if (!weekData || !weekData.elements) {
    console.error('weekData is missing or invalid:', weekData);
    return null;
  }

  const [selectedElement, setSelectedElement] = useState(weekData.elements[0]);
  const [editMode, setEditMode] = useState(false);
  const [showBuildWarning, setShowBuildWarning] = useState(false);
  const [buildWarnings, setBuildWarnings] = useState([]);
  
  // Structure de données mise à jour pour correspondre à l'EditMode
  const [scoreData, setScoreData] = useState({
    element: selectedElement,
    sung: {
      damage: '',
      weapons: [],
      weaponStars: [0, 0],
      skills: Array(6).fill(null),
      blessings: [],
      leftSet: '',
      leftSet1: '',
      leftSet2: '',
      rightSet: '',
      baseStats: {
        str: 0,
        int: 0,
        vit: 0,
        per: 0,
        agi: 0
      },
      finalStats: {
        atk: '',
        tc: '',
        dcc: '',
        di: '',
        defPen: '',
        precision: '',
        mpcr: '',
        mpa: ''
      }
    },
    hunters: Array(6).fill(null).map(() => ({
      id: null,
      character: null,
      damage: '',
      stars: 0,
      weaponStars: 0,
      leftSet: '',
      rightSet: '',
      finalStats: {
        atk: '',
        tc: '',
        dcc: '',
        di: '',
        defPen: '',
        mpcr: '',
        mpa: ''
      }
    })),
    totalScore: 0,
    rageCount: 0
  });

  useEffect(() => {
    checkBuilds();
  }, []);

  useEffect(() => {
    // Charger les données du preset pour l'élément sélectionné
    if (weekData.presets && weekData.presets[selectedElement]) {
      loadPresetData(weekData.presets[selectedElement]);
    }
  }, [selectedElement, weekData]);

  const checkBuilds = () => {
    // Temporairement désactivé
    // const warnings = validateBuildCompleteness();
    // if (warnings.length > 0) {
    //   setBuildWarnings(warnings);
    //   setShowBuildWarning(true);
    // } else {
    //   loadBuildsData();
    // }
  };

  const loadBuildsData = () => {
    showTankMessage("Chargement des données depuis vos builds...", true, 'beru');
  };

  const loadPresetData = (preset) => {
    showTankMessage(`Chargement du preset ${selectedElement}...`, true, 'beru');
    
    // Charger les données Sung
    const newScoreData = { ...scoreData };
    
    if (preset.sung) {
      newScoreData.sung = {
        ...newScoreData.sung,
        weapons: preset.sung.weapons || [],
        weaponStars: preset.sung.weaponStars || [0, 0],
        leftSet: preset.sung.leftSet || '',
        rightSet: preset.sung.rightSet || '',
        skills: preset.sung.skills || Array(6).fill(null),
        blessings: preset.sung.blessings || [],
        baseStats: preset.sung.baseStats || {
          str: 0,
          int: 0,
          vit: 0,
          per: 0,
          agi: 0
        }
      };
    }
    
    // Charger les données des hunters
    if (preset.hunters && preset.hunters.length > 0) {
      newScoreData.hunters = preset.hunters.map((hunterPreset, idx) => ({
        id: hunterPreset.id,
        character: null, // À charger depuis characters data
        damage: '',
        stars: hunterPreset.stars || 0,
        weaponStars: hunterPreset.weaponStars || 0,
        leftSet: hunterPreset.leftSet || '',
        rightSet: hunterPreset.rightSet || '',
        finalStats: {
          atk: '',
          tc: '',
          dcc: '',
          di: '',
          defPen: '',
          mpcr: '',
          mpa: ''
        }
      }));
      
      // Compléter avec des hunters vides si besoin
      while (newScoreData.hunters.length < 6) {
        newScoreData.hunters.push({
          id: null,
          character: null,
          damage: '',
          stars: 0,
          weaponStars: 0,
          leftSet: '',
          rightSet: '',
          finalStats: {
            atk: '',
            tc: '',
            dcc: '',
            di: '',
            defPen: '',
            mpcr: '',
            mpa: ''
          }
        });
      }
    }
    
    setScoreData(newScoreData);
  };

  const handleValidate = () => {
    if (editMode) {
      const totalScore = calculateTotalScore();
      if (weekData.scoringLimits && totalScore > weekData.scoringLimits.maxTotalScore) {
        showTankMessage("Score trop élevé ! Vérifie tes données.", true, 'tank');
        return;
      }
      
      // Mettre à jour le score total
      setScoreData(prev => ({
        ...prev,
        totalScore: totalScore
      }));
      
      setEditMode(false);
      showTankMessage("Scores validés ! Prêt pour le partage.", true, 'beru');
    }
  };

  const calculateTotalScore = () => {
    const sungDamage = parseInt(scoreData.sung.damage) || 0;
    const huntersDamage = scoreData.hunters.reduce((total, hunter) => {
      return total + (parseInt(hunter.damage) || 0);
    }, 0);
    return sungDamage + huntersDamage;
  };

  const handleShare = () => {
    showTankMessage("Fonctionnalité de partage à venir !", true, 'beru');
  };

  const elementColors = {
    WIND: 'from-green-500 to-green-700',
    WATER: 'from-blue-500 to-blue-700',
    FIRE: 'from-red-500 to-red-700'
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-purple-800 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">BDG Score - {weekData.bossName}</h2>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setEditMode(!editMode)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors"
            >
              {editMode ? 'Visualiser' : 'Éditer'}
            </button>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Element Selector */}
        <div className="bg-gray-800 p-4 flex gap-4 justify-center">
          {weekData.elements.map(element => (
            <button
              key={element}
              onClick={() => {
                setSelectedElement(element);
                setScoreData(prev => ({...prev, element}));
              }}
              className={`px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105 ${
                selectedElement === element
                  ? `bg-gradient-to-r ${elementColors[element]} text-white shadow-lg`
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {element}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-950">
          {editMode ? (
            <BDGEditMode
              preset={weekData.presets?.[selectedElement] || {}}
              scoreData={scoreData}
              onUpdate={setScoreData}
              showTankMessage={showTankMessage}
            />
          ) : (
            <BDGViewMode
              preset={weekData.presets?.[selectedElement] || {}}
              scoreData={scoreData}
              showTankMessage={showTankMessage}
            />
          )}
        </div>

        {/* Footer avec actions */}
        <div className="bg-gray-800 p-4 flex justify-between items-center">
          <div className="text-white">
            <span className="text-sm text-gray-400">Score Total: </span>
            <span className="text-2xl font-bold text-purple-400">
              {(scoreData.totalScore || calculateTotalScore()).toLocaleString()}
            </span>
            {scoreData.rageCount > 0 && (
              <span className="ml-4 text-sm text-gray-400">
                Rage: {scoreData.rageCount}
              </span>
            )}
          </div>
          <div className="flex gap-4">
            {editMode && (
              <button
                onClick={handleValidate}
                className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg text-white font-medium transition-colors"
              >
                Valider
              </button>
            )}
            <button
              onClick={handleShare}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
              disabled={editMode || calculateTotalScore() === 0}
            >
              Partager
            </button>
          </div>
        </div>
      </div>

      {/* Modal d'avertissement build incomplet */}
      {showBuildWarning && (
        <BuildWarningModal
          warnings={buildWarnings}
          onProceed={() => {
            setShowBuildWarning(false);
            showTankMessage("Tu peux continuer mais les stats seront incomplètes !", true, 'tank');
          }}
          onBuildNow={() => {
            onClose();
            showTankMessage("Va compléter tes builds d'abord !", true, 'beru');
          }}
        />
      )}
    </div>
  );
};

const BuildWarningModal = ({ warnings, onProceed, onBuildNow }) => (
  <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4">
    <div className="bg-gray-900 rounded-xl p-6 max-w-md border-2 border-yellow-500">
      <h3 className="text-xl font-bold text-yellow-400 mb-4">
        Build Incomplet Détecté
      </h3>
      
      <div className="space-y-2 mb-6">
        {warnings.map((warning, idx) => (
          <div key={idx} className="text-yellow-300 text-sm flex items-start">
            <span className="mr-2">•</span>
            <span>{warning.message}</span>
          </div>
        ))}
      </div>
      
      <p className="text-gray-300 mb-6">
        Les stats affichées seront incomplètes. Que veux-tu faire ?
      </p>
      
      <div className="flex gap-3">
        <button
          onClick={onBuildNow}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors"
        >
          Compléter le Build
        </button>
        
        <button
          onClick={onProceed}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
        >
          Continuer quand même
        </button>
      </div>
    </div>
  </div>
);

export default BDGScorePage;