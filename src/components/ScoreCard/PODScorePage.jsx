// src/components/ScoreCard/PODScorePage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PODViewMode from './PODViewMode';
import PODEditMode from './PODEditMode';
import '../../i18n/i18n';
import { characters } from '../../data/characters';
import podPresets from './podPresets.json';
// import { calculatePODRageCount } from '../../utils/podRageCount';

const PODScorePage = ({ onClose, showTankMessage, activeAccount, currentBuildStats }) => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Récupérer les données de la semaine
  const [selectedWeek, setSelectedWeek] = useState(podPresets.currentWeek);
  const weekData = podPresets.weeks[selectedWeek];
  
  if (!weekData || !weekData.elements) {
    console.error('weekData is missing or invalid:', weekData);
    return null;
  }

  // Helper pour récupérer un character depuis son ID
  const getCharacterFromId = (hunterId) => {
    if (!hunterId) return null;

    let character = characters[hunterId] ||
      characters[hunterId.toLowerCase()] ||
      characters[hunterId.replace(/\s+/g, '').toLowerCase()] ||
      characters[hunterId.replace(/\s+/g, '-').toLowerCase()] ||
      null;

    if (!character) {
      const searchName = hunterId.toLowerCase();
      for (const [key, char] of Object.entries(characters)) {
        if (char.name && char.name.toLowerCase() === searchName) {
          character = char;
          break;
        }
      }
    }

    return character;
  };

  const [selectedElement, setSelectedElement] = useState(() => {
    const lastViewed = localStorage.getItem(`pod_last_viewed_${weekData.weekId}`);
    if (lastViewed) {
      try {
        const { element } = JSON.parse(lastViewed);
        if (weekData.elements.includes(element)) {
          return element;
        }
      } catch (e) {
        console.error('Erreur chargement dernier élément:', e);
      }
    }
    return weekData.elements[0];
  });

  const [selectedPreset, setSelectedPreset] = useState(() => {
    const lastViewed = localStorage.getItem(`pod_last_viewed_${weekData.weekId}`);
    if (lastViewed) {
      try {
        const { preset } = JSON.parse(lastViewed);
        return preset || 'preset1';
      } catch (e) {
        console.error('Erreur chargement dernier preset:', e);
      }
    }
    return 'preset1';
  });

  const [editMode, setEditMode] = useState(false);
  const [customPresets, setCustomPresets] = useState(() => {
    try {
      const builderberuUsers = localStorage.getItem('builderberu_users');
      if (builderberuUsers) {
        const data = JSON.parse(builderberuUsers);
        const username = Object.keys(data)[0];
        const activeAcc = data[username]?.activeAccount || 'main';
        const podPresets = data[username]?.accounts?.[activeAcc]?.podPresets?.[weekData.weekId] || {};
        return podPresets;
      }
    } catch (e) {
      console.error('Erreur chargement initial des presets POD:', e);
    }
    return {};
  });
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Structure de données pour POD (3 hunters au lieu de 6)
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
    hunters: Array(3).fill(null).map(() => ({
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
    shadows: Array(3).fill(null),
    totalScore: 0,
    rageCount: 0
  });

  // Sauvegarder le dernier élément/preset consulté
  useEffect(() => {
    localStorage.setItem(`pod_last_viewed_${weekData.weekId}`, JSON.stringify({
      element: selectedElement,
      preset: selectedPreset,
      timestamp: new Date().toISOString()
    }));
  }, [selectedElement, selectedPreset, weekData.weekId]);

  // Calculer le RC POD quand les damages changent
  useEffect(() => {
    const total = calculateTotalScore();
    // let rageCount = calculatePODRageCount(total, weekData.currentBoss);

    // if (rageCount !== scoreData.rageCount) {
    //   setScoreData(prev => ({
    //     ...prev,
    //     rageCount: rageCount
    //   }));
    // }
  }, [scoreData.sung.damage, scoreData.hunters, weekData.currentBoss]);

  // Recharger les presets quand le weekId ou le compte change
  useEffect(() => {
    try {
      const builderberuUsers = localStorage.getItem('builderberu_users');
      if (builderberuUsers) {
        const data = JSON.parse(builderberuUsers);
        const username = Object.keys(data)[0];
        const activeAcc = data[username]?.activeAccount || 'main';
        const podPresets = data[username]?.accounts?.[activeAcc]?.podPresets?.[weekData.weekId] || {};
        setCustomPresets(podPresets);
      }
    } catch (e) {
      console.error('Erreur rechargement des presets POD:', e);
    }
  }, [weekData.weekId, activeAccount]);

  // Sauvegarder automatiquement les modifications en cours (brouillon)
  useEffect(() => {
    if (hasUnsavedChanges) {
      const draftKey = `pod_draft_${weekData.weekId}_${selectedElement}_${selectedPreset}`;
      localStorage.setItem(draftKey, JSON.stringify({
        sung: scoreData.sung,
        hunters: scoreData.hunters,
        totalScore: scoreData.totalScore,
        rageCount: scoreData.rageCount,
        lastModified: new Date().toISOString()
      }));
    }
  }, [scoreData, hasUnsavedChanges, weekData.weekId, selectedElement, selectedPreset]);

  // Gérer le changement d'élément
  useEffect(() => {
    if (weekData.presets && weekData.presets[selectedElement]) {
      const elementData = weekData.presets[selectedElement];

      const lastViewed = localStorage.getItem(`pod_last_viewed_${weekData.weekId}`);
      if (lastViewed) {
        try {
          const { preset } = JSON.parse(lastViewed);
          if (preset && (
            (elementData.presets && elementData.presets[preset]) ||
            preset.startsWith('custom_') ||
            (!elementData.presets && preset === 'preset1')
          )) {
            return;
          }
        } catch (e) {
          console.error('Erreur vérification preset:', e);
        }
      }

      let defaultPreset = 'preset1';
      if (elementData.presets) {
        defaultPreset = elementData.defaultPreset || 'preset1';
      }
      setSelectedPreset(defaultPreset);
    }
  }, [selectedElement, weekData]);

  // Gérer le changement de preset
  useEffect(() => {
    if (weekData.presets && weekData.presets[selectedElement]) {
      const elementData = weekData.presets[selectedElement];

      // 1. Vérifier d'abord s'il y a un brouillon
      const draftKey = `pod_draft_${weekData.weekId}_${selectedElement}_${selectedPreset}`;
      const draft = localStorage.getItem(draftKey);

      if (draft) {
        try {
          const draftData = JSON.parse(draft);

          if (draftData.hunters) {
            draftData.hunters = draftData.hunters.map(hunter => {
              if (hunter && hunter.id && !hunter.character) {
                const character = getCharacterFromId(hunter.id);
                return { ...hunter, character };
              }
              return hunter;
            });
          }

          setScoreData({
            element: selectedElement,
            ...draftData
          });
          setHasUnsavedChanges(true);
          showTankMessage(t('pod.messages.modificationsRestored'), true, 'beru');
          return;
        } catch (e) {
          console.error('Erreur chargement brouillon POD:', e);
          localStorage.removeItem(draftKey);
        }
      }

      // 2. Vérifier s'il y a des données sauvegardées
      try {
        const builderberuUsers = localStorage.getItem('builderberu_users');
        if (builderberuUsers) {
          const data = JSON.parse(builderberuUsers);
          const username = Object.keys(data)[0];
          const activeAcc = data[username]?.activeAccount || 'main';

          const savedData = data[username]?.accounts?.[activeAcc]?.podScores?.[weekData.weekId]?.[selectedElement]?.[selectedPreset];

          if (savedData) {
            const dataWithCharacters = {
              ...savedData,
              hunters: savedData.hunters.map(hunter => ({
                ...hunter,
                character: hunter.id ? getCharacterFromId(hunter.id) : null
              }))
            };

            setScoreData({
              element: selectedElement,
              ...dataWithCharacters
            });
            setHasUnsavedChanges(false);
            return;
          }
        }
      } catch (e) {
        console.error('Erreur chargement POD depuis builderberu_users:', e);
      }

      // 3. Sinon charger le preset normal
      if (selectedPreset.startsWith('custom_')) {
        const builderberuUsers = localStorage.getItem('builderberu_users');
        if (builderberuUsers) {
          const data = JSON.parse(builderberuUsers);
          const username = Object.keys(data)[0];
          const activeAcc = data[username]?.activeAccount || 'main';
          const freshCustomPreset = data[username]?.accounts?.[activeAcc]?.podPresets?.[weekData.weekId]?.[selectedElement]?.[selectedPreset];
          if (freshCustomPreset) {
            loadPresetData(freshCustomPreset);
            return;
          }
        }
      } else if (elementData.presets && elementData.presets[selectedPreset]) {
        loadPresetData(elementData.presets[selectedPreset]);
      } else if (!elementData.presets && selectedPreset === 'preset1') {
        loadPresetData(elementData);
      }
    }
  }, [selectedPreset, selectedElement, weekData.weekId]);

  const loadPresetData = (preset, skipMessage = false) => {
    if (!skipMessage) {
      showTankMessage(t('pod.messages.loadingPreset'), true, 'beru');
    }

    const newScoreData = {
      element: selectedElement,
      totalScore: preset.totalScore || 0,
      rageCount: preset.rageCount || 0,
      sung: {
        damage: preset.sung?.damage || '',
        weapons: preset.sung?.weapons || [],
        weaponStars: preset.sung?.weaponStars || [0, 0],
        leftSet: preset.sung?.leftSet || '',
        leftSet1: preset.sung?.leftSet1 || '',
        leftSet2: preset.sung?.leftSet2 || '',
        rightSet: preset.sung?.rightSet || '',
        skills: preset.sung?.skills || Array(6).fill(null),
        blessings: preset.sung?.blessings || [],
        baseStats: preset.sung?.baseStats || {
          str: 0,
          int: 0,
          vit: 0,
          per: 0,
          agi: 0
        },
        finalStats: preset.sung?.finalStats || {
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
      hunters: Array(3).fill(null).map(() => ({
        id: null,
        character: null,
        damage: '',
        stars: 0,
        weaponStars: 0,
        leftSet: '',
        rightSet: '',
        leftSet1: '',
        leftSet2: '',
        finalStats: {}
      }))
    };

    // Charger les données des hunters
    if (preset.hunters && preset.hunters.length > 0) {
      preset.hunters.forEach((hunterPreset, idx) => {
        if (idx < 3 && hunterPreset) {
          const hunterId = hunterPreset.id;
          const character = getCharacterFromId(hunterId);

          newScoreData.hunters[idx] = {
            id: hunterId,
            character: character,
            damage: hunterPreset.damage || '',
            stars: hunterPreset.stars || 0,
            weaponStars: hunterPreset.weaponStars || 0,
            leftSet: hunterPreset.leftSet || '',
            leftSet1: hunterPreset.leftSet1 || '',
            leftSet2: hunterPreset.leftSet2 || '',
            rightSet: hunterPreset.rightSet || '',
            finalStats: hunterPreset.finalStats || {
              atk: '',
              tc: '',
              dcc: '',
              di: '',
              defPen: '',
              mpcr: '',
              mpa: ''
            }
          };
        }
      });
    }

    setScoreData(newScoreData);
    setHasUnsavedChanges(false);
  };

  const handleValidate = (currentPreset) => {
    if (editMode) {
      const totalScore = calculateTotalScore();
      if (weekData.scoringLimits && totalScore > weekData.scoringLimits.maxTotalScore) {
        showTankMessage(t('pod.messages.scoreTooHigh'), true, 'tank');
        return;
      }

      const currentScoreData = JSON.parse(JSON.stringify(scoreData));

      const updatedData = {
        ...currentScoreData,
        totalScore: totalScore
      };

      const huntersWithIds = updatedData.hunters.map((hunter, idx) => {
        const result = { ...hunter };

        if (!result.id && currentPreset?.hunters?.[idx]?.id) {
          result.id = currentPreset.hunters[idx].id;
        }

        if (result.id && !result.character) {
          result.character = getCharacterFromId(result.id);
        }

        result.finalStats = hunter.finalStats || {};

        return result;
      });

      updatedData.hunters = huntersWithIds;
      setScoreData(updatedData);

      try {
        const builderberuUsers = localStorage.getItem('builderberu_users');
        if (!builderberuUsers) throw new Error(t('pod.messages.errorUserData'));

        const data = JSON.parse(builderberuUsers);
        const username = Object.keys(data)[0];
        const activeAcc = data[username]?.activeAccount || 'main';

        // Initialiser la structure POD si nécessaire
        if (!data[username].accounts[activeAcc].podScores) {
          data[username].accounts[activeAcc].podScores = {};
        }
        if (!data[username].accounts[activeAcc].podScores[weekData.weekId]) {
          data[username].accounts[activeAcc].podScores[weekData.weekId] = {};
        }
        if (!data[username].accounts[activeAcc].podScores[weekData.weekId][selectedElement]) {
          data[username].accounts[activeAcc].podScores[weekData.weekId][selectedElement] = {};
        }

        // Sauvegarder les données POD
        data[username].accounts[activeAcc].podScores[weekData.weekId][selectedElement][selectedPreset] = {
          sung: updatedData.sung,
          hunters: updatedData.hunters.map(h => ({
            id: h.id,
            damage: h.damage || '',
            stars: h.stars || 0,
            weaponStars: h.weaponStars || 0,
            leftSet: h.leftSet || '',
            leftSet1: h.leftSet1 || '',
            leftSet2: h.leftSet2 || '',
            rightSet: h.rightSet || '',
            finalStats: h.finalStats || {}
          })),
          totalScore: updatedData.totalScore,
          rageCount: updatedData.rageCount,
          lastModified: new Date().toISOString()
        };

        localStorage.setItem('builderberu_users', JSON.stringify(data));

        const draftKey = `pod_draft_${weekData.weekId}_${selectedElement}_${selectedPreset}`;
        localStorage.removeItem(draftKey);

        setHasUnsavedChanges(false);
        setEditMode(false);
        showTankMessage(t('pod.messages.modificationsSaved'), true, 'beru');

      } catch (e) {
        console.error("Erreur sauvegarde POD:", e);
        showTankMessage(t('pod.messages.errorSaving'), true, 'tank');
      }
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
    showTankMessage(t('pod.messages.shareComingSoon'), true, 'beru');
  };

  // Sauvegarder un preset personnalisé POD
  const saveCustomPreset = (name) => {
    try {
      const builderberuUsers = localStorage.getItem('builderberu_users');
      if (!builderberuUsers) {
        showTankMessage(t('pod.messages.errorUserData'), true, 'tank');
        return;
      }

      const data = JSON.parse(builderberuUsers);
      const username = Object.keys(data)[0];
      const activeAcc = data[username]?.activeAccount || 'main';

      // Initialiser la structure POD si elle n'existe pas
      if (!data[username].accounts[activeAcc].podPresets) {
        data[username].accounts[activeAcc].podPresets = {};
      }
      if (!data[username].accounts[activeAcc].podPresets[weekData.weekId]) {
        data[username].accounts[activeAcc].podPresets[weekData.weekId] = {};
      }
      if (!data[username].accounts[activeAcc].podPresets[weekData.weekId][selectedElement]) {
        data[username].accounts[activeAcc].podPresets[weekData.weekId][selectedElement] = {};
      }

      const presetId = `custom_${Date.now()}`;
      const totalScore = calculateTotalScore();

      data[username].accounts[activeAcc].podPresets[weekData.weekId][selectedElement][presetId] = {
        name: name,
        sung: JSON.parse(JSON.stringify(scoreData.sung)),
        hunters: JSON.parse(JSON.stringify(scoreData.hunters)),
        rageCount: scoreData.rageCount,
        totalScore: totalScore,
        createdAt: new Date().toISOString()
      };

      localStorage.setItem('builderberu_users', JSON.stringify(data));

      const weekPresets = data[username].accounts[activeAcc].podPresets[weekData.weekId] || {};
      setCustomPresets(weekPresets);

      setSelectedPreset(presetId);
      setHasUnsavedChanges(false);

      const draftKey = `pod_draft_${weekData.weekId}_${selectedElement}_${selectedPreset}`;
      localStorage.removeItem(draftKey);

      showTankMessage(t('pod.messages.presetAdded', { name }), true, 'beru');
    } catch (e) {
      console.error('Erreur lors de la sauvegarde du preset POD:', e);
      showTankMessage(t('pod.messages.errorSaving'), true, 'tank');
    }
  };

  // Supprimer un preset personnalisé POD
  const deleteCustomPreset = (presetId) => {
    if (!confirm(t('pod.preset.deleteConfirm'))) return;

    try {
      const builderberuUsers = localStorage.getItem('builderberu_users');
      if (!builderberuUsers) return;

      const data = JSON.parse(builderberuUsers);
      const username = Object.keys(data)[0];
      const activeAcc = data[username]?.activeAccount || 'main';

      if (data[username]?.accounts?.[activeAcc]?.podPresets?.[weekData.weekId]?.[selectedElement]) {
        delete data[username].accounts[activeAcc].podPresets[weekData.weekId][selectedElement][presetId];

        localStorage.setItem('builderberu_users', JSON.stringify(data));

        const weekPresets = data[username].accounts[activeAcc].podPresets[weekData.weekId] || {};
        setCustomPresets(weekPresets);

        if (selectedPreset === presetId) {
          const defaultPreset = weekData.presets[selectedElement]?.defaultPreset || 'preset1';
          setSelectedPreset(defaultPreset);
        }

        showTankMessage(t('pod.messages.presetDeleted'), true, 'beru');
      }
    } catch (e) {
      console.error('Erreur lors de la suppression du preset POD:', e);
      showTankMessage(t('pod.messages.errorDeleting'), true, 'tank');
    }
  };

  // Reset vers le preset de base POD
  const resetToBasePreset = () => {
    if (hasUnsavedChanges && !confirm(t('pod.messages.resetConfirm'))) {
      return;
    }

    try {
      const builderberuUsers = localStorage.getItem('builderberu_users');
      if (builderberuUsers) {
        const data = JSON.parse(builderberuUsers);
        const username = Object.keys(data)[0];
        const activeAcc = data[username]?.activeAccount || 'main';

        if (data[username]?.accounts?.[activeAcc]?.podScores?.[weekData.weekId]?.[selectedElement]?.[selectedPreset]) {
          delete data[username].accounts[activeAcc].podScores[weekData.weekId][selectedElement][selectedPreset];
          localStorage.setItem('builderberu_users', JSON.stringify(data));
        }
      }
    } catch (e) {
      console.error('Erreur suppression données POD:', e);
    }

    const draftKey = `pod_draft_${weekData.weekId}_${selectedElement}_${selectedPreset}`;
    localStorage.removeItem(draftKey);

    if (selectedPreset.startsWith('custom_')) {
      const customPreset = customPresets[selectedElement]?.[selectedPreset];
      if (customPreset) {
        loadPresetData(customPreset);
      }
    } else {
      const elementData = weekData.presets[selectedElement];
      if (elementData.presets && elementData.presets[selectedPreset]) {
        loadPresetData(elementData.presets[selectedPreset]);
      } else if (!elementData.presets) {
        loadPresetData(elementData);
      }
    }

    setHasUnsavedChanges(false);
    showTankMessage(t('pod.messages.resetDone'), true, 'beru');
  };

  const elementColors = {
    WIND: 'from-green-500 to-green-700',
    WATER: 'from-blue-500 to-blue-700',
    FIRE: 'from-red-500 to-red-700',
    LIGHT: 'from-yellow-500 to-yellow-700',
    DARK: 'from-purple-500 to-purple-700'
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-gray-900 rounded-xl max-w-7xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Mobile responsive avec thème rouge */}
        <div className="bg-gradient-to-r from-red-700 to-red-900 p-3 sm:p-4">
          {/* Desktop Header */}
          <div className="hidden sm:flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              {t('pod.title')} <span className="text-red-300 text-lg">HARD</span> - {weekData.bossName}
            </h2>
            <div className="flex gap-4 items-center">
              {/* Sélecteur de semaine */}
              <select
                value={selectedWeek}
                onChange={(e) => {
                  const newWeek = e.target.value;
                  if (podPresets.weeks[newWeek]) {
                    setSelectedWeek(newWeek);
                    setSelectedElement(podPresets.weeks[newWeek].elements[0]);
                    setSelectedPreset('preset1');
                    setEditMode(false);
                    setHasUnsavedChanges(false);
                  }
                }}
                className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-white font-medium transition-colors border border-white/30"
              >
                {Object.keys(podPresets.weeks).map(weekId => (
                  <option key={weekId} value={weekId} className="text-gray-900">
                    {t('pod.week', { week: weekId.split('-W')[1] })} - {podPresets.weeks[weekId].bossName}
                  </option>
                ))}
              </select>
              {/* Sélecteur de preset */}
              <select
                value={selectedPreset}
                onChange={(e) => {
                  if (hasUnsavedChanges && !confirm(t('pod.messages.changePresetConfirm'))) {
                    return;
                  }
                  const draftKey = `pod_draft_${weekData.weekId}_${selectedElement}_${selectedPreset}`;
                  localStorage.removeItem(draftKey);

                  setSelectedPreset(e.target.value);
                  setHasUnsavedChanges(false);
                }}
                className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-white font-medium transition-colors border border-white/30"
                disabled={editMode}
              >
                {/* Presets de base */}
                {(() => {
                  const elementData = weekData.presets?.[selectedElement];
                  if (elementData?.presets) {
                    return Object.entries(elementData.presets).map(([key, preset]) => (
                      <option key={key} value={key} className="text-gray-900">
                        📋 {preset.name || key}
                      </option>
                    ));
                  } else if (elementData) {
                    return <option value="preset1" className="text-gray-900">📋 {t('pod.preset.defaultPreset')}</option>;
                  }
                  return null;
                })()}

                {/* Presets personnalisés */}
                {customPresets[selectedElement] && Object.entries(customPresets[selectedElement]).map(([key, preset]) => (
                  <option key={key} value={key} className="text-gray-900">
                    ⭐ {preset.name}
                  </option>
                ))}
              </select>

              {/* Boutons d'édition */}
              {editMode && (
                <>
                  <button
                    onClick={resetToBasePreset}
                    className="bg-yellow-600/80 hover:bg-yellow-600 px-3 py-2 rounded-lg text-white font-medium transition-colors"
                    title={t('pod.reset')}
                  >
                    {t('pod.reset')}
                  </button>
                  <button
                    onClick={() => setShowSavePresetModal(true)}
                    className="bg-blue-600/80 hover:bg-blue-600 px-3 py-2 rounded-lg text-white font-medium transition-colors"
                  >
                    {t('pod.addPreset')}
                  </button>
                  {selectedPreset.startsWith('custom_') && (
                    <button
                      onClick={() => deleteCustomPreset(selectedPreset)}
                      className="bg-red-600/80 hover:bg-red-600 px-3 py-2 rounded-lg text-white font-medium transition-colors"
                      title={t('pod.deletePreset')}
                    >
                      🗑️
                    </button>
                  )}
                </>
              )}

              <button
                onClick={() => setEditMode(!editMode)}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors"
              >
                {editMode ? t('pod.view') : t('pod.edit')}
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-300 text-2xl font-bold"
              >
                ×
              </button>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="sm:hidden">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-white">{t('pod.title')} - {weekData.bossName}</h2>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-300 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            {/* Mobile Controls */}
            <div className="flex gap-2 flex-wrap">
              <select
                value={selectedWeek}
                onChange={(e) => {
                  const newWeek = e.target.value;
                  if (podPresets.weeks[newWeek]) {
                    setSelectedWeek(newWeek);
                    setSelectedElement(podPresets.weeks[newWeek].elements[0]);
                    setSelectedPreset('preset1');
                    setEditMode(false);
                    setHasUnsavedChanges(false);
                  }
                }}
                className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-white text-sm flex-1"
              >
                {Object.keys(podPresets.weeks).map(weekId => (
                  <option key={weekId} value={weekId} className="text-gray-900">
                    {t('pod.mobile.week', { week: weekId.split('-W')[1] })}
                  </option>
                ))}
              </select>

              <select
                value={selectedPreset}
                onChange={(e) => {
                  if (hasUnsavedChanges && !confirm(t('pod.messages.changePresetConfirm'))) return;
                  const draftKey = `pod_draft_${weekData.weekId}_${selectedElement}_${selectedPreset}`;
                  localStorage.removeItem(draftKey);
                  setSelectedPreset(e.target.value);
                  setHasUnsavedChanges(false);
                }}
                className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-white text-sm flex-1"
                disabled={editMode}
              >
                {(() => {
                  const elementData = weekData.presets?.[selectedElement];
                  if (elementData?.presets) {
                    return Object.entries(elementData.presets).map(([key, preset]) => (
                      <option key={key} value={key} className="text-gray-900">
                        {preset.name || key}
                      </option>
                    ));
                  } else if (elementData) {
                    return <option value="preset1" className="text-gray-900">{t('pod.preset.defaultPreset')}</option>;
                  }
                  return null;
                })()}
                {customPresets[selectedElement] && Object.entries(customPresets[selectedElement]).map(([key, preset]) => (
                  <option key={key} value={key} className="text-gray-900">
                    ⭐ {preset.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setEditMode(!editMode)}
                className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-white text-sm"
              >
                {editMode ? t('pod.view') : t('pod.edit')}
              </button>
            </div>

            {/* Mobile Edit Actions */}
            {editMode && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={resetToBasePreset}
                  className="bg-yellow-600/80 hover:bg-yellow-600 px-2 py-1 rounded text-white text-sm flex-1"
                >
                  {t('pod.reset')}
                </button>
                <button
                  onClick={() => setShowSavePresetModal(true)}
                  className="bg-blue-600/80 hover:bg-blue-600 px-2 py-1 rounded text-white text-sm flex-1"
                >
                  {t('pod.addPreset')}
                </button>
                {selectedPreset.startsWith('custom_') && (
                  <button
                    onClick={() => deleteCustomPreset(selectedPreset)}
                    className="bg-red-600/80 hover:bg-red-600 px-2 py-1 rounded text-white text-sm"
                  >
                    🗑️
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Element Selector - Mobile responsive avec seulement 2 éléments */}
        <div className="bg-gray-800 p-3 sm:p-4 flex gap-2 sm:gap-4 justify-center overflow-x-auto">
          {weekData.elements.map(element => (
            <button
              key={element}
              onClick={() => {
                if (hasUnsavedChanges && !confirm(t('pod.messages.changeElementConfirm'))) {
                  return;
                }
                setSelectedElement(element);
                setHasUnsavedChanges(false);
                setScoreData(prev => ({ ...prev, element }));
              }}
              className={`px-3 py-2 sm:px-6 sm:py-3 rounded-lg font-bold transition-all transform hover:scale-105 text-sm sm:text-base whitespace-nowrap ${
                selectedElement === element
                  ? `bg-gradient-to-r ${elementColors[element]} text-white shadow-lg`
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {element}
            </button>
          ))}
        </div>

        {/* Content - Mobile responsive */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-gray-950">
          {(() => {
            let currentPreset = {};

            if (selectedPreset.startsWith('custom_')) {
              currentPreset = customPresets[selectedElement]?.[selectedPreset] || {};
            } else if (weekData.presets?.[selectedElement]) {
              const elementData = weekData.presets[selectedElement];
              if (elementData.presets && elementData.presets[selectedPreset]) {
                currentPreset = elementData.presets[selectedPreset];
              } else {
                currentPreset = elementData;
              }
            }

            return editMode ? (
              <PODEditMode
                preset={currentPreset}
                scoreData={scoreData}
                t={t}
                onUpdate={(newData) => {
                  setScoreData(newData);
                  setHasUnsavedChanges(true);
                }}
                showTankMessage={showTankMessage}
                onValidate={() => handleValidate(currentPreset)}
                isMobile={isMobile}
                currentBuildStats={currentBuildStats}
              />
            ) : (
              <PODViewMode
                preset={currentPreset}
                scoreData={scoreData}
                t={t}
                showTankMessage={showTankMessage}
                isMobile={isMobile}
              />
            );
          })()}
        </div>

        {/* Footer avec actions - Mobile responsive */}
        <div className="bg-gray-800 p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-white text-center sm:text-left">
            <span className="text-xs sm:text-sm text-gray-400">{t('pod.totalScore')}: </span>
            <span className="text-xl sm:text-2xl font-bold text-red-400">
              {(scoreData.totalScore || calculateTotalScore()).toLocaleString()}
            </span>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            {editMode && (
              <button
                onClick={() => {
                  let currentPreset = {};

                  if (selectedPreset.startsWith('custom_')) {
                    currentPreset = customPresets[selectedElement]?.[selectedPreset] || {};
                  } else if (weekData.presets?.[selectedElement]) {
                    const elementData = weekData.presets[selectedElement];
                    if (elementData.presets && elementData.presets[selectedPreset]) {
                      currentPreset = elementData.presets[selectedPreset];
                    } else {
                      currentPreset = elementData;
                    }
                  }

                  handleValidate(currentPreset);
                }}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 sm:px-6 sm:py-2 rounded-lg text-white font-medium transition-colors flex-1 sm:flex-initial"
              >
                {t('pod.validate')}
              </button>
            )}
            <button
              onClick={handleShare}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 sm:px-6 sm:py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50 flex-1 sm:flex-initial"
              disabled={editMode || calculateTotalScore() === 0}
            >
              {t('pod.share')}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de sauvegarde de preset */}
      {showSavePresetModal && (
        <SavePresetModal
          onSave={(name) => {
            saveCustomPreset(name);
            setShowSavePresetModal(false);
          }}
          onCancel={() => setShowSavePresetModal(false)}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};

const SavePresetModal = ({ onSave, onCancel, isMobile }) => {
  const { t } = useTranslation();
  const [presetName, setPresetName] = useState('');

  return (
    <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4">
      <div className={`bg-gray-900 rounded-xl p-4 sm:p-6 max-w-md border-2 border-red-500 ${isMobile ? 'w-full' : ''}`}>
        <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
          {t('pod.preset.save')}
        </h3>

        <input
          type="text"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          placeholder={t('pod.preset.name')}
          className="w-full bg-gray-800 text-white px-3 sm:px-4 py-2 rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none mb-4 text-sm sm:text-base"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && presetName.trim()) {
              onSave(presetName.trim());
            }
          }}
        />

        <div className="flex gap-3">
          <button
            onClick={() => onSave(presetName.trim())}
            disabled={!presetName.trim()}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white py-2 px-3 sm:px-4 rounded transition-colors text-sm sm:text-base"
          >
            {t('pod.preset.saveButton')}
          </button>

          <button
            onClick={onCancel}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 sm:px-4 rounded transition-colors text-sm sm:text-base"
          >
            {t('pod.preset.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PODScorePage;