// src/components/ScoreCard/BDGScorePage.jsx
import React, { useState, useEffect } from 'react';
import BDGViewMode from './BDGViewMode';
import BDGEditMode from './BDGEditMode';
import { validateBuildCompleteness } from './bdgService';
import { characters } from '../../data/characters';
import bdgPresets from './bdgPresets.json';

// Fonction pour calculer le numéro de semaine basé sur les jeudis
const getThursdayWeekNumber = (date) => {
  const year = date.getFullYear();
  const firstThursday = new Date(year, 0, 1);

  // Trouver le premier jeudi de l'année
  while (firstThursday.getDay() !== 4) {
    firstThursday.setDate(firstThursday.getDate() + 1);
  }

  // Calculer la différence en jours
  const diffTime = Math.abs(date - firstThursday);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.floor(diffDays / 7) + 1;
};

// Générer la liste des semaines disponibles
const generateWeeksList = () => {
  const weeks = [];
  const currentDate = new Date();
  const currentWeek = getThursdayWeekNumber(currentDate);
  const year = currentDate.getFullYear();

  // Ajouter les 10 dernières semaines
  for (let i = currentWeek; i > Math.max(0, currentWeek - 10); i--) {
    weeks.push({
      id: `${year}-W${String(i).padStart(2, '0')}`,
      label: `Semaine ${i} - ${year}`,
      weekNumber: i
    });
  }

  return weeks;
};

const RC_THRESHOLDS_ANT_QUEEN = [
  { rc: 1, damage: 2404000 },
  { rc: 2, damage: 4906000 },
  { rc: 3, damage: 7600000 },
  { rc: 4, damage: 11291000 },
  { rc: 5, damage: 15290000 },
  { rc: 6, damage: 19500000 },
  { rc: 7, damage: 24000000 },
  { rc: 8, damage: 29000000 },
  { rc: 9, damage: 38115000 },
  { rc: 10, damage: 43500000 },
  { rc: 11, damage: 49330000 },
  { rc: 12, damage: 59000000 },
  { rc: 13, damage: 66300000 },
  { rc: 14, damage: 74030000 },
  { rc: 15, damage: 82930000 },
  { rc: 16, damage: 96550000 },
  { rc: 17, damage: 113470000 },
  { rc: 18, damage: 134580000 },
  { rc: 19, damage: 161640000 },
  { rc: 20, damage: 191520000 },
  { rc: 21, damage: 248740000 },
  { rc: 22, damage: 287000000 },
  { rc: 23, damage: 330000000 },
  { rc: 24, damage: 382000000 },
  { rc: 25, damage: 440000000 },
  { rc: 26, damage: 502000000 },
  { rc: 27, damage: 570000000 },
  { rc: 28, damage: 645000000 },
  { rc: 29, damage: 726000000 },
  { rc: 30, damage: 817000000 },
  { rc: 31, damage: 906000000 },
  { rc: 32, damage: 1006000000 },
  { rc: 33, damage: 1110000000 },
  { rc: 34, damage: 1221000000 },
  { rc: 35, damage: 1339000000 },
  { rc: 36, damage: 1465000000 },
  { rc: 37, damage: 1598000000 },
  { rc: 38, damage: 1739000000 },
  { rc: 39, damage: 1883000000 },
  { rc: 40, damage: 2033000000 },
  { rc: 41, damage: 2193000000 },
  { rc: 42, damage: 2353000000 },
  { rc: 43, damage: 2517000000 },
  { rc: 44, damage: 2687000000 },
  { rc: 45, damage: 2864000000 },
  { rc: 46, damage: 3060000000 },
  { rc: 47, damage: 3250000000 },
  { rc: 48, damage: 3445000000 },
  { rc: 49, damage: 3652000000 },
  { rc: 50, damage: 3910000000 },
  { rc: 51, damage: 4188000000 },
  { rc: 52, damage: 4530000000 },
  { rc: 53, damage: 4935000000 },
  { rc: 54, damage: 5411000000 },
  { rc: 55, damage: 5948000000 },
  { rc: 56, damage: 6647000000 },
  { rc: 57, damage: 7337000000 },
  { rc: 58, damage: 8035000000 },
  { rc: 59, damage: 8784000000 },
  { rc: 60, damage: 9612000000 },
  { rc: 61, damage: 10510000000 },
  { rc: 62, damage: 11469000000 },
  { rc: 63, damage: 12506000000 },
  { rc: 64, damage: 13612000000 },
  { rc: 65, damage: 14873000000 },
  { rc: 66, damage: 16124000000 },
  { rc: 67, damage: 17459000000 },
  { rc: 68, damage: 18837000000 },
  { rc: 69, damage: 20313000000 },
  { rc: 70, damage: 21840000000 },
  { rc: 71, damage: 23461000000 },
  { rc: 72, damage: 25160000000 },
  { rc: 73, damage: 26934000000 },
  { rc: 74, damage: 28778000000 },
  { rc: 75, damage: 30700000000 },
  { rc: 76, damage: 32600000000 },
  { rc: 77, damage: 34700000000 },
  { rc: 78, damage: 36900000000 },
  { rc: 79, damage: 39200000000 },
  { rc: 80, damage: 42200000000 },
  { rc: 81, damage: 44500000000 },
  { rc: 82, damage: 46900000000 },
  { rc: 83, damage: 49350000000 },
  { rc: 84, damage: 52100000000 },
  { rc: 85, damage: 54800000000 },
  { rc: 86, damage: 57500000000 },
  { rc: 87, damage: 60400000000 }
];

const RC_THRESHOLDS_FATCHNA = [
  { rc: 1, damage: 2350000 },
  { rc: 2, damage: 5770000 },
  { rc: 3, damage: 8400000 },
  { rc: 4, damage: 11200000 },
  { rc: 5, damage: 15000000 },
  { rc: 6, damage: 19000000 },
  { rc: 7, damage: 22900000 },
  { rc: 8, damage: 30000000 },
  { rc: 9, damage: 37000000 },
  { rc: 10, damage: 41700000 },
  { rc: 11, damage: 47000000 },
  { rc: 12, damage: 53300000 },
  { rc: 13, damage: 60000000 },
  { rc: 14, damage: 68070000 },
  { rc: 15, damage: 77820000 },
  { rc: 16, damage: 90000000 },
  { rc: 17, damage: 107000000 },
  { rc: 18, damage: 128000000 },
  { rc: 19, damage: 152000000 },
  { rc: 20, damage: 182000000 },
  { rc: 21, damage: 218000000 },
  { rc: 22, damage: 255000000 },
  { rc: 23, damage: 300000000 },
  { rc: 24, damage: 350000000 },
  { rc: 25, damage: 412000000 },
  { rc: 26, damage: 475000000 },
  { rc: 27, damage: 543000000 },
  { rc: 28, damage: 617000000 },
  { rc: 29, damage: 701000000 },
  { rc: 30, damage: 788000000 },
  { rc: 31, damage: 885000000 },
  { rc: 32, damage: 1012000000 },
  { rc: 33, damage: 1118000000 },
  { rc: 34, damage: 1228000000 },
  { rc: 35, damage: 1345000000 },
  { rc: 36, damage: 1483000000 },
  { rc: 37, damage: 1610000000 },
  { rc: 38, damage: 1749000000 },
  { rc: 39, damage: 1898000000 },
  { rc: 40, damage: 2035000000 },
  { rc: 41, damage: 2189000000 },
  { rc: 42, damage: 2350000000 },
  { rc: 43, damage: 2516000000 },
  { rc: 44, damage: 2689000000 },
  { rc: 45, damage: 2869000000 },
  { rc: 46, damage: 3054000000 },
  { rc: 47, damage: 3246000000 },
  { rc: 48, damage: 3450000000 },
  { rc: 49, damage: 3702000000 },
  { rc: 50, damage: 3932000000 },
  { rc: 51, damage: 4211000000 },
  { rc: 52, damage: 4522000000 },
  { rc: 53, damage: 4953000000 },
  { rc: 54, damage: 5420000000 },
  { rc: 55, damage: 5964000000 },
  { rc: 56, damage: 6570000000 },
  { rc: 57, damage: 7219000000 },
  { rc: 58, damage: 7900000000 },
  { rc: 59, damage: 8652000000 },
  { rc: 60, damage: 9475000000 },
  { rc: 61, damage: 10370000000 },
  { rc: 62, damage: 11330000000 },
  { rc: 63, damage: 12360000000 },
  { rc: 64, damage: 13480000000 },
  { rc: 65, damage: 14660000000 },
  { rc: 66, damage: 16000000000 },
  { rc: 67, damage: 17340000000 },
  { rc: 68, damage: 18750000000 },
  { rc: 69, damage: 20250000000 },
  { rc: 70, damage: 21900000000 },
  { rc: 71, damage: 23500000000 },
  { rc: 72, damage: 25000000000 },
  { rc: 73, damage: 26900000000 },
  { rc: 74, damage: 28800000000 },
  { rc: 75, damage: 30800000000 },
  { rc: 76, damage: 32800000000 },
  { rc: 77, damage: 35000000000 },
  { rc: 78, damage: 37200000000 },
  { rc: 79, damage: 39500000000 },
  { rc: 80, damage: 41850000000 },
  { rc: 81, damage: 44300000000 }
];

const BDGScorePage = ({ onClose, showTankMessage, activeAccount, currentBuildStats }) => {
  // Détection mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Au début du composant, récupérer les données de la semaine
  const [selectedWeek, setSelectedWeek] = useState(bdgPresets.currentWeek);
  const weekData = bdgPresets.weeks[selectedWeek];
  
  // Vérification de sécurité
  if (!weekData || !weekData.elements) {
    console.error('weekData is missing or invalid:', weekData);
    return null;
  }

  // Fonction helper pour récupérer un character depuis son ID
  const getCharacterFromId = (hunterId) => {
    if (!hunterId) return null;

    // Essayer plusieurs variantes de casse
    let character = characters[hunterId] ||
      characters[hunterId.toLowerCase()] ||
      characters[hunterId.replace(/\s+/g, '').toLowerCase()] ||
      characters[hunterId.replace(/\s+/g, '-').toLowerCase()] ||
      null;

    // Si toujours pas trouvé, chercher par nom
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
    // Charger le dernier élément consulté
    const lastViewed = localStorage.getItem(`bdg_last_viewed_${weekData.weekId}`);
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
    // Charger le dernier preset consulté
    const lastViewed = localStorage.getItem(`bdg_last_viewed_${weekData.weekId}`);
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
  const [showBuildWarning, setShowBuildWarning] = useState(false);
  const [buildWarnings, setBuildWarnings] = useState([]);
  const [customPresets, setCustomPresets] = useState(() => {
    // Charger les presets personnalisés depuis builderberu_users
    try {
      const builderberuUsers = localStorage.getItem('builderberu_users');
      if (builderberuUsers) {
        const data = JSON.parse(builderberuUsers);
        const username = Object.keys(data)[0];
        const activeAcc = data[username]?.activeAccount || 'main';

        // Récupérer les presets depuis la structure du compte
        const bdgPresets = data[username]?.accounts?.[activeAcc]?.bdgPresets?.[weekData.weekId] || {};
        return bdgPresets;
      }
    } catch (e) {
      console.error('Erreur chargement initial des presets:', e);
    }
    return {};
  });
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  // Sauvegarder le dernier élément/preset consulté
  useEffect(() => {
    localStorage.setItem(`bdg_last_viewed_${weekData.weekId}`, JSON.stringify({
      element: selectedElement,
      preset: selectedPreset,
      timestamp: new Date().toISOString()
    }));
  }, [selectedElement, selectedPreset, weekData.weekId]);


  useEffect(() => {
    const total = calculateTotalScore();

    // Calculer le RC basé sur le total
    let rageCount = 0;
    for (let i = RC_THRESHOLDS_ANT_QUEEN.length - 1; i >= 0; i--) {
      if (total >= RC_THRESHOLDS_ANT_QUEEN[i].damage) {
        rageCount = RC_THRESHOLDS_ANT_QUEEN[i].rc;
        break;
      }
    }

    // Mettre à jour seulement si le RC a changé
    if (rageCount !== scoreData.rageCount) {
      setScoreData(prev => ({
        ...prev,
        rageCount: rageCount
      }));
    }
  }, [scoreData.sung.damage, scoreData.hunters]);

  // Recharger les presets quand le weekId ou le compte change
  useEffect(() => {
    try {
      const builderberuUsers = localStorage.getItem('builderberu_users');
      if (builderberuUsers) {
        const data = JSON.parse(builderberuUsers);
        const username = Object.keys(data)[0];
        const activeAcc = data[username]?.activeAccount || 'main';

        const bdgPresets = data[username]?.accounts?.[activeAcc]?.bdgPresets?.[weekData.weekId] || {};
        setCustomPresets(bdgPresets);
      }
    } catch (e) {
      console.error('Erreur rechargement des presets:', e);
    }
  }, [weekData.weekId, activeAccount]);

  // Sauvegarder automatiquement les modifications en cours (brouillon)
  useEffect(() => {
    if (hasUnsavedChanges) {
      const draftKey = `bdg_draft_${weekData.weekId}_${selectedElement}_${selectedPreset}`;
      localStorage.setItem(draftKey, JSON.stringify({
        sung: scoreData.sung,
        hunters: scoreData.hunters,
        totalScore: scoreData.totalScore,
        rageCount: scoreData.rageCount,
        lastModified: new Date().toISOString()
      }));
    }
  }, [scoreData, hasUnsavedChanges, weekData.weekId, selectedElement, selectedPreset]);

  useEffect(() => {
    checkBuilds();
  }, []);

  useEffect(() => {
    // Au changement d'élément seulement, pas au montage initial
    if (weekData.presets && weekData.presets[selectedElement]) {
      const elementData = weekData.presets[selectedElement];

      // Ne pas réinitialiser le preset si on a déjà un preset valide
      const lastViewed = localStorage.getItem(`bdg_last_viewed_${weekData.weekId}`);
      if (lastViewed) {
        try {
          const { preset } = JSON.parse(lastViewed);
          // Vérifier si le preset existe pour cet élément
          if (preset && (
            (elementData.presets && elementData.presets[preset]) ||
            preset.startsWith('custom_') ||
            (!elementData.presets && preset === 'preset1')
          )) {
            // Le preset est valide, ne pas le changer
            return;
          }
        } catch (e) {
          console.error('Erreur vérification preset:', e);
        }
      }

      // Seulement si on n'a pas de preset valide, en définir un par défaut
      let defaultPreset = 'preset1';
      if (elementData.presets) {
        defaultPreset = elementData.defaultPreset || 'preset1';
      }
      setSelectedPreset(defaultPreset);
    }
  }, [selectedElement, weekData]);

  // Nouveau useEffect pour gérer le changement de preset
  useEffect(() => {
    console.log("🔄 useEffect triggered - preset:", selectedPreset, "element:", selectedElement);

    if (weekData.presets && weekData.presets[selectedElement]) {
      const elementData = weekData.presets[selectedElement];

      // 1. Vérifier d'abord s'il y a un brouillon (modifications non sauvegardées)
      const draftKey = `bdg_draft_${weekData.weekId}_${selectedElement}_${selectedPreset}`;
      const draft = localStorage.getItem(draftKey);
      console.log("📝 Draft key:", draftKey, "Draft exists:", !!draft);

      if (draft) {
        try {
          const draftData = JSON.parse(draft);
          console.log("📝 Loading draft data:", draftData);

          // IMPORTANT: Reconstruire les characters pour les hunters
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
          showTankMessage('Modifications non sauvegardées restaurées', true, 'beru');
          return;
        } catch (e) {
          console.error('Erreur chargement brouillon:', e);
          localStorage.removeItem(draftKey);
        }
      }

      // 2. Vérifier s'il y a des données sauvegardées dans builderberu_users
      try {
        const builderberuUsers = localStorage.getItem('builderberu_users');
        if (builderberuUsers) {
          const data = JSON.parse(builderberuUsers);
          const username = Object.keys(data)[0];
          const activeAcc = data[username]?.activeAccount || 'main';

          const savedData = data[username]?.accounts?.[activeAcc]?.bdgScores?.[weekData.weekId]?.[selectedElement]?.[selectedPreset];

          if (savedData) {
            console.log("📂 Chargement depuis builderberu_users");

            // Reconstruire les characters
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
        console.error('Erreur chargement depuis builderberu_users:', e);
      }

      // 3. Sinon charger le preset normal
      if (selectedPreset.startsWith('custom_')) {
        console.log("🎨 Loading custom preset:", selectedPreset);
        // Pour les presets custom, toujours charger depuis le localStorage
        const builderberuUsers = localStorage.getItem('builderberu_users');
        if (builderberuUsers) {
          const data = JSON.parse(builderberuUsers);
          const username = Object.keys(data)[0];
          const activeAcc = data[username]?.activeAccount || 'main';
          const freshCustomPreset = data[username]?.accounts?.[activeAcc]?.bdgPresets?.[weekData.weekId]?.[selectedElement]?.[selectedPreset];
          console.log("🎨 Fresh custom preset data:", freshCustomPreset);
          if (freshCustomPreset) {
            loadPresetData(freshCustomPreset);
            return;
          }
        }
      } else if (elementData.presets && elementData.presets[selectedPreset]) {
        console.log("📋 Loading base preset:", selectedPreset);
        loadPresetData(elementData.presets[selectedPreset]);
      } else if (!elementData.presets && selectedPreset === 'preset1') {
        console.log("📋 Loading default preset");
        loadPresetData(elementData);
      }
    }
  }, [selectedPreset, selectedElement, weekData.weekId]);

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

  const loadPresetData = (preset, skipMessage = false) => {
    if (!skipMessage) {
      showTankMessage(`Chargement du preset...`, true, 'beru');
    }

    // Charger les données Sung
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
      hunters: Array(6).fill(null).map(() => ({
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
        if (idx < 6 && hunterPreset) {
          // Reconstruire le character depuis l'ID
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
      console.log("✅ Validate clicked - preset:", selectedPreset);

      const totalScore = calculateTotalScore();
      if (weekData.scoringLimits && totalScore > weekData.scoringLimits.maxTotalScore) {
        showTankMessage("Score trop élevé ! Vérifie tes données.", true, 'tank');
        return;
      }

      // IMPORTANT: Capturer l'état actuel AVANT toute modification
      const currentScoreData = JSON.parse(JSON.stringify(scoreData));

      // Mettre à jour le score total
      const updatedData = {
        ...currentScoreData,
        totalScore: totalScore
      };

      // S'assurer que les IDs et characters des hunters sont préservés
      const huntersWithIds = updatedData.hunters.map((hunter, idx) => {
        const result = { ...hunter };

        // Si pas d'id, essayer de le récupérer du preset
        if (!result.id && currentPreset?.hunters?.[idx]?.id) {
          result.id = currentPreset.hunters[idx].id;
        }

        // Si on a un id mais pas de character, le récupérer
        if (result.id && !result.character) {
          result.character = getCharacterFromId(result.id);
        }

        // NE PAS écraser les finalStats - garder celles de l'état actuel
        result.finalStats = hunter.finalStats || {};

        return result;
      });

      updatedData.hunters = huntersWithIds;
      setScoreData(updatedData);

      try {
        // Récupérer la structure builderberu_users
        const builderberuUsers = localStorage.getItem('builderberu_users');
        if (!builderberuUsers) throw new Error('Pas de données utilisateur');

        const data = JSON.parse(builderberuUsers);
        const username = Object.keys(data)[0]; // "user" 
        const activeAcc = data[username]?.activeAccount || 'main';

        console.log("👤 Username:", username, "ActiveAccount:", activeAcc);

        // Initialiser la structure si nécessaire
        if (!data[username].accounts[activeAcc].bdgScores) {
          data[username].accounts[activeAcc].bdgScores = {};
        }
        if (!data[username].accounts[activeAcc].bdgScores[weekData.weekId]) {
          data[username].accounts[activeAcc].bdgScores[weekData.weekId] = {};
        }
        if (!data[username].accounts[activeAcc].bdgScores[weekData.weekId][selectedElement]) {
          data[username].accounts[activeAcc].bdgScores[weekData.weekId][selectedElement] = {};
        }

        // Sauvegarder les données dans la bonne structure
        data[username].accounts[activeAcc].bdgScores[weekData.weekId][selectedElement][selectedPreset] = {
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

        // Sauvegarder toute la structure
        localStorage.setItem('builderberu_users', JSON.stringify(data));
        console.log("✅✅✅ SAUVEGARDÉ DANS BUILDERBERU_USERS !");

        // Supprimer le brouillon
        const draftKey = `bdg_draft_${weekData.weekId}_${selectedElement}_${selectedPreset}`;
        localStorage.removeItem(draftKey);

        setHasUnsavedChanges(false);
        setEditMode(false);
        showTankMessage("Modifications sauvegardées !", true, 'beru');

      } catch (e) {
        console.error("❌❌❌ ERREUR SAUVEGARDE:", e);
        showTankMessage("Erreur lors de la sauvegarde", true, 'tank');
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
    showTankMessage("Fonctionnalité de partage à venir !", true, 'beru');
  };

  // Sauvegarder un preset personnalisé
  const saveCustomPreset = (name) => {
    try {
      // Récupérer la structure builderberu_users
      const builderberuUsers = localStorage.getItem('builderberu_users');
      if (!builderberuUsers) {
        showTankMessage('Erreur: données utilisateur non trouvées', true, 'tank');
        return;
      }

      const data = JSON.parse(builderberuUsers);
      const username = Object.keys(data)[0]; // "user"
      const activeAcc = data[username]?.activeAccount || 'main';

      // Initialiser la structure si elle n'existe pas
      if (!data[username].accounts[activeAcc].bdgPresets) {
        data[username].accounts[activeAcc].bdgPresets = {};
      }
      if (!data[username].accounts[activeAcc].bdgPresets[weekData.weekId]) {
        data[username].accounts[activeAcc].bdgPresets[weekData.weekId] = {};
      }
      if (!data[username].accounts[activeAcc].bdgPresets[weekData.weekId][selectedElement]) {
        data[username].accounts[activeAcc].bdgPresets[weekData.weekId][selectedElement] = {};
      }

      // Générer un ID unique pour le preset
      const presetId = `custom_${Date.now()}`;

      // Utiliser les données actuelles (qui incluent les modifications)
      const totalScore = calculateTotalScore();

      // Sauvegarder le preset dans la structure avec toutes les données actuelles
      data[username].accounts[activeAcc].bdgPresets[weekData.weekId][selectedElement][presetId] = {
        name: name,
        sung: JSON.parse(JSON.stringify(scoreData.sung)), // Deep copy
        hunters: JSON.parse(JSON.stringify(scoreData.hunters)), // Deep copy
        rageCount: scoreData.rageCount,
        totalScore: totalScore,
        createdAt: new Date().toISOString()
      };

      // Sauvegarder toute la structure
      localStorage.setItem('builderberu_users', JSON.stringify(data));

      // Mettre à jour l'état local
      const weekPresets = data[username].accounts[activeAcc].bdgPresets[weekData.weekId] || {};
      setCustomPresets(weekPresets);

      // Sélectionner le nouveau preset
      setSelectedPreset(presetId);
      setHasUnsavedChanges(false);

      // Supprimer les brouillons de l'ancien preset
      const draftKey = `bdg_draft_${weekData.weekId}_${selectedElement}_${selectedPreset}`;
      localStorage.removeItem(draftKey);

      showTankMessage(`Preset "${name}" ajouté !`, true, 'beru');
    } catch (e) {
      console.error('Erreur lors de la sauvegarde du preset:', e);
      showTankMessage('Erreur lors de la sauvegarde', true, 'tank');
    }
  };

  // Supprimer un preset personnalisé
  const deleteCustomPreset = (presetId) => {
    if (!confirm('Supprimer ce preset personnalisé ?')) return;

    try {
      const builderberuUsers = localStorage.getItem('builderberu_users');
      if (!builderberuUsers) return;

      const data = JSON.parse(builderberuUsers);
      const username = Object.keys(data)[0];
      const activeAcc = data[username]?.activeAccount || 'main';

      if (data[username]?.accounts?.[activeAcc]?.bdgPresets?.[weekData.weekId]?.[selectedElement]) {
        delete data[username].accounts[activeAcc].bdgPresets[weekData.weekId][selectedElement][presetId];

        // Sauvegarder la structure mise à jour
        localStorage.setItem('builderberu_users', JSON.stringify(data));

        // Mettre à jour l'état local
        const weekPresets = data[username].accounts[activeAcc].bdgPresets[weekData.weekId] || {};
        setCustomPresets(weekPresets);

        // Si on supprime le preset actuellement sélectionné, revenir au preset par défaut
        if (selectedPreset === presetId) {
          const defaultPreset = weekData.presets[selectedElement]?.defaultPreset || 'preset1';
          setSelectedPreset(defaultPreset);
        }

        showTankMessage('Preset supprimé', true, 'beru');
      }
    } catch (e) {
      console.error('Erreur lors de la suppression du preset:', e);
      showTankMessage('Erreur lors de la suppression', true, 'tank');
    }
  };

  // Reset vers le preset de base
  const resetToBasePreset = () => {
    if (hasUnsavedChanges && !confirm('Réinitialiser vers le preset de base ? Les modifications non sauvegardées seront perdues.')) {
      return;
    }

    // Supprimer les données sauvegardées dans builderberu_users pour ce preset
    try {
      const builderberuUsers = localStorage.getItem('builderberu_users');
      if (builderberuUsers) {
        const data = JSON.parse(builderberuUsers);
        const username = Object.keys(data)[0];
        const activeAcc = data[username]?.activeAccount || 'main';

        if (data[username]?.accounts?.[activeAcc]?.bdgScores?.[weekData.weekId]?.[selectedElement]?.[selectedPreset]) {
          delete data[username].accounts[activeAcc].bdgScores[weekData.weekId][selectedElement][selectedPreset];
          localStorage.setItem('builderberu_users', JSON.stringify(data));
        }
      }
    } catch (e) {
      console.error('Erreur suppression données:', e);
    }

    // Supprimer le brouillon
    const draftKey = `bdg_draft_${weekData.weekId}_${selectedElement}_${selectedPreset}`;
    localStorage.removeItem(draftKey);

    // Recharger le preset de base
    if (selectedPreset.startsWith('custom_')) {
      // Si c'est un preset custom, le recharger depuis customPresets
      const customPreset = customPresets[selectedElement]?.[selectedPreset];
      if (customPreset) {
        loadPresetData(customPreset);
      }
    } else {
      // Recharger le preset de base depuis le fichier
      const elementData = weekData.presets[selectedElement];
      if (elementData.presets && elementData.presets[selectedPreset]) {
        loadPresetData(elementData.presets[selectedPreset]);
      } else if (!elementData.presets) {
        loadPresetData(elementData);
      }
    }

    setHasUnsavedChanges(false);
    showTankMessage('Réinitialisé au preset de base', true, 'beru');
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
        {/* Header - Mobile responsive */}
        <div className="bg-gradient-to-r from-indigo-700 to-purple-800 p-3 sm:p-4">
          {/* Desktop Header */}
          <div className="hidden sm:flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">BDG Score - {weekData.bossName}</h2>
            <div className="flex gap-4 items-center">
              {/* Sélecteur de semaine */}
              <select
                value={selectedWeek}
                onChange={(e) => {
                  const newWeek = e.target.value;
                  if (bdgPresets.weeks[newWeek]) {
                    setSelectedWeek(newWeek);
                    // Reset les états
                    setSelectedElement(bdgPresets.weeks[newWeek].elements[0]);
                    setSelectedPreset('preset1');
                    setEditMode(false);
                    setHasUnsavedChanges(false);
                  }
                }}
                className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-white font-medium transition-colors border border-white/30"
              >
                {Object.keys(bdgPresets.weeks).map(weekId => (
                  <option key={weekId} value={weekId} className="text-gray-900">
                    Semaine {weekId.split('-W')[1]} - {bdgPresets.weeks[weekId].bossName}
                  </option>
                ))}
              </select>
              {/* Sélecteur de preset */}
              <select
                value={selectedPreset}
                onChange={(e) => {
                  if (hasUnsavedChanges && !confirm('Changer de preset ? Les modifications non sauvegardées seront perdues.')) {
                    return;
                  }
                  // Supprimer le brouillon actuel si on change
                  const draftKey = `bdg_draft_${weekData.weekId}_${selectedElement}_${selectedPreset}`;
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
                    return <option value="preset1" className="text-gray-900">📋 Preset par défaut</option>;
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
                    title="Réinitialiser au preset de base"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setShowSavePresetModal(true)}
                    className="bg-blue-600/80 hover:bg-blue-600 px-3 py-2 rounded-lg text-white font-medium transition-colors"
                  >
                    Ajouter preset
                  </button>
                  {selectedPreset.startsWith('custom_') && (
                    <button
                      onClick={() => deleteCustomPreset(selectedPreset)}
                      className="bg-red-600/80 hover:bg-red-600 px-3 py-2 rounded-lg text-white font-medium transition-colors"
                      title="Supprimer ce preset personnalisé"
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

          {/* Mobile Header */}
          <div className="sm:hidden">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-white">BDG - {weekData.bossName}</h2>
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
                  if (bdgPresets.weeks[newWeek]) {
                    setSelectedWeek(newWeek);
                    setSelectedElement(bdgPresets.weeks[newWeek].elements[0]);
                    setSelectedPreset('preset1');
                    setEditMode(false);
                    setHasUnsavedChanges(false);
                  }
                }}
                className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-white text-sm flex-1"
              >
                {Object.keys(bdgPresets.weeks).map(weekId => (
                  <option key={weekId} value={weekId} className="text-gray-900">
                    S{weekId.split('-W')[1]}
                  </option>
                ))}
              </select>

              <select
                value={selectedPreset}
                onChange={(e) => {
                  if (hasUnsavedChanges && !confirm('Changer de preset ?')) return;
                  const draftKey = `bdg_draft_${weekData.weekId}_${selectedElement}_${selectedPreset}`;
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
                    return <option value="preset1" className="text-gray-900">Défaut</option>;
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
                {editMode ? 'View' : 'Edit'}
              </button>
            </div>

            {/* Mobile Edit Actions */}
            {editMode && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={resetToBasePreset}
                  className="bg-yellow-600/80 hover:bg-yellow-600 px-2 py-1 rounded text-white text-sm flex-1"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowSavePresetModal(true)}
                  className="bg-blue-600/80 hover:bg-blue-600 px-2 py-1 rounded text-white text-sm flex-1"
                >
                  + Preset
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

        {/* Element Selector - Mobile responsive */}
        <div className="bg-gray-800 p-3 sm:p-4 flex gap-2 sm:gap-4 justify-center overflow-x-auto">
          {weekData.elements.map(element => (
            <button
              key={element}
              onClick={() => {
                if (hasUnsavedChanges && !confirm('Changer d\'élément ? Les modifications non sauvegardées seront perdues.')) {
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
            // Déterminer le preset actuel à passer aux composants
            let currentPreset = {};

            if (selectedPreset.startsWith('custom_')) {
              // Preset personnalisé
              currentPreset = customPresets[selectedElement]?.[selectedPreset] || {};
            } else if (weekData.presets?.[selectedElement]) {
              // Preset de base
              const elementData = weekData.presets[selectedElement];
              if (elementData.presets && elementData.presets[selectedPreset]) {
                currentPreset = elementData.presets[selectedPreset];
              } else {
                currentPreset = elementData;
              }
            }

            return editMode ? (
              <BDGEditMode
                preset={currentPreset}
                scoreData={scoreData}
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
              <BDGViewMode
                preset={currentPreset}
                scoreData={scoreData}
                showTankMessage={showTankMessage}
                isMobile={isMobile}
              />
            );
          })()}
        </div>

        {/* Footer avec actions - Mobile responsive */}
        <div className="bg-gray-800 p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-white text-center sm:text-left">
            <span className="text-xs sm:text-sm text-gray-400">Score Total: </span>
            <span className="text-xl sm:text-2xl font-bold text-purple-400">
              {(scoreData.totalScore || calculateTotalScore()).toLocaleString()}
            </span>
            {scoreData.rageCount > 0 && (
              <span className="ml-2 sm:ml-4 text-xs sm:text-sm text-gray-400">
                RC: {scoreData.rageCount}
              </span>
            )}
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            {editMode && (
              <button
                onClick={() => {
                  // Déterminer le preset actuel
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
                Valider
              </button>
            )}
            <button
              onClick={handleShare}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 sm:px-6 sm:py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50 flex-1 sm:flex-initial"
              disabled={editMode || calculateTotalScore() === 0}
            >
              Partager
            </button>
          </div>
        </div>
      </div>

      {/* Modal de sauvegarde de preset */}
      {showSavePresetModal && (
        <SavePresetModal
          onSave={(name) => {
            saveCustomPreset(name);
           SavePresetModal(false);
         }}
         isMobile={isMobile}
       />
     )}

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
         isMobile={isMobile}
       />
     )}
   </div>
 );
};

const BuildWarningModal = ({ warnings, onProceed, onBuildNow, isMobile }) => (
 <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4">
   <div className={`bg-gray-900 rounded-xl p-4 sm:p-6 max-w-md border-2 border-yellow-500 ${isMobile ? 'w-full' : ''}`}>
     <h3 className="text-lg sm:text-xl font-bold text-yellow-400 mb-4">
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

     <p className="text-gray-300 mb-6 text-sm sm:text-base">
       Les stats affichées seront incomplètes. Que veux-tu faire ?
     </p>

     <div className="flex gap-3">
       <button
         onClick={onBuildNow}
         className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 sm:px-4 rounded transition-colors text-sm sm:text-base"
       >
         Compléter le Build
       </button>

       <button
         onClick={onProceed}
         className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 sm:px-4 rounded transition-colors text-sm sm:text-base"
       >
         Continuer quand même
       </button>
     </div>
   </div>
 </div>
);

const SavePresetModal = ({ onSave, onCancel, isMobile }) => {
 const [presetName, setPresetName] = useState('');

 return (
   <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4">
     <div className={`bg-gray-900 rounded-xl p-4 sm:p-6 max-w-md border-2 border-purple-500 ${isMobile ? 'w-full' : ''}`}>
       <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
         Sauvegarder comme nouveau preset
       </h3>

       <input
         type="text"
         value={presetName}
         onChange={(e) => setPresetName(e.target.value)}
         placeholder="Nom du preset..."
         className="w-full bg-gray-800 text-white px-3 sm:px-4 py-2 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none mb-4 text-sm sm:text-base"
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
           className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white py-2 px-3 sm:px-4 rounded transition-colors text-sm sm:text-base"
         >
           Sauvegarder
         </button>

         <button
           onClick={onCancel}
           className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 sm:px-4 rounded transition-colors text-sm sm:text-base"
         >
           Annuler
         </button>
       </div>
     </div>
   </div>
 );
};

export default BDGScorePage;