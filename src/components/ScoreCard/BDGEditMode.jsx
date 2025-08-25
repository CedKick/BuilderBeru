// src/components/ScoreCard/BDGEditMode.jsx
import React, { useState } from 'react';
import { weaponData, runesData, blessingStonesData, artifactData } from '../../data/itemData';
import { characters } from '../../data/characters';
import { calculateRCFromTotal } from '../../utils/rageCount';

const BDGEditMode = ({ preset, scoreData, onUpdate, showTankMessage, isMobile, currentBuildStats }) => {
  const [showHunterPicker, setShowHunterPicker] = useState(null);
  const [sungLeftSplit, setSungLeftSplit] = useState(false);
  const [hunterLeftSplits, setHunterLeftSplits] = useState({});

  const sungPreset = preset?.sung || {};
  const huntersPreset = preset?.hunters || [];

  const rarityColors = {
    rare: 'border-blue-500 bg-blue-500/20',
    epic: 'border-purple-500 bg-purple-500/20',
    legendary: 'border-yellow-500 bg-yellow-500/20',
    mythic: 'border-red-500 bg-red-500/20'
  };

  // Mapping des stats Build -> BDG
  const STAT_MAPPING = {
    'attack': 'atk',
    'critRate': 'tc',
    'critDamage': 'dcc',
    'damageIncrease': 'di',
    'defensePenetration': 'defPen',
    'mpCostReduction': 'mpcr',
    'mp': 'mpa',
    'defense': 'def',
    'hp': 'hp'
  };

  // Filtrer les skills par type
  const basicSkills = runesData.filter(r => r.class === 'basicSkills');
  const collapseSkills = runesData.filter(r => r.class === 'collapse');
  const deathSkills = runesData.filter(r => r.class === 'death');
  const ultimateSkills = runesData.filter(r => r.class === 'Ultimate');
  const shadowStepSkill = runesData.filter(r => r.class === 'Shadow Step');

  // Filtrer les artifacts par side
  const leftArtifacts = artifactData.filter(a => a.side === 'L');
  const rightArtifacts = artifactData.filter(a => a.side === 'R');

  // Convertir l'objet characters en tableau pour l'affichage
  const charactersArray = Object.values(characters);

  // Initialiser les états de split basés sur les données existantes
  React.useEffect(() => {
    // Vérifier Sung
    if (scoreData.sung?.leftSet1 && scoreData.sung?.leftSet2) {
      setSungLeftSplit(true);
    }

    // Vérifier les hunters
    const newHunterSplits = {};
    scoreData.hunters?.forEach((hunter, idx) => {
      if (hunter?.leftSet1 && hunter?.leftSet2) {
        newHunterSplits[idx] = true;
      }
    });
    setHunterLeftSplits(newHunterSplits);
  }, []);

  const handleScoreChange = (type, index, value) => {
    // Permettre les lettres M et B pour les multiplicateurs
    const cleanValue = value.replace(/[^0-9MB]/gi, '');

    let numValue = '';
    if (cleanValue.match(/[MB]$/i)) {
      const number = parseFloat(cleanValue.slice(0, -1));
      const multiplier = cleanValue.slice(-1).toUpperCase();
      if (!isNaN(number)) {
        numValue = multiplier === 'M' ? number * 1000000 : number * 1000000000;
      }
    } else {
      numValue = cleanValue === '' ? '' : parseInt(cleanValue);
    }

    // VALIDATION ICI - Après avoir calculé numValue
    if (type === 'hunter' && scoreData.hunters[index]?.character) {
      const character = scoreData.hunters[index].character;
      const isOnElement = character.element?.toUpperCase() === scoreData.element
      const maxDamage = isOnElement
        ? character.bdgLimits?.maxDamageOnElement || Infinity
        : character.bdgLimits?.maxDamageOffElement || Infinity;

      const maxWithTolerance = maxDamage * 1.2; // Permettre 20% de plus

      if (numValue > maxWithTolerance) {
        showTankMessage(`Limite dépassée pour ${character.name}: max ${(maxWithTolerance / 1000000000).toFixed(1)}B (120% de la limite)`, true, 'tank');
        return;
      }
    }

    if (type === 'sung') {
      const maxDamage = getSungMaxDamage();
      const maxWithTolerance = maxDamage * 1.2;

      if (numValue > maxWithTolerance) {
        const isExpert = scoreData.sung.rightSet?.toLowerCase().includes('expert');
        showTankMessage(`Limite dépassée pour Sung (mode ${isExpert ? 'Expert' : 'Support'}): max ${(maxWithTolerance / 1000000000).toFixed(1)}B`, true, 'tank');
        return;
      }
    }

    // Ensuite seulement on met à jour
    if (type === 'sung') {
      onUpdate({
        ...scoreData,
        sung: { ...scoreData.sung, damage: numValue }
      });
    } else if (type === 'hunter') {
      const newHunters = [...scoreData.hunters];
      newHunters[index] = { ...newHunters[index], damage: numValue };
      onUpdate({
        ...scoreData,
        hunters: newHunters
      });
    }
  };

  const getSungMaxDamage = () => {
    const isExpertMode = scoreData.sung.rightSet?.toLowerCase().includes('expert');
    const mode = isExpertMode ? 'expert' : 'support';
    const element = scoreData.element || 'WIND';

    const sungCharacter = characters['jinwoo']; // Accès direct
    return sungCharacter?.bdgLimits?.[mode]?.[element]?.max || Infinity;
  };

  const getDamageProgressColor = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage < 25) return 'bg-purple-300';
    if (percentage < 50) return 'bg-purple-400';
    if (percentage < 75) return 'bg-purple-500';
    if (percentage < 90) return 'bg-purple-600';
    if (percentage < 100) return 'bg-purple-700';
    if (percentage < 110) return 'bg-purple-800';
    return 'bg-purple-900'; // Au-delà de 110%
  };

  const handleSungUpdate = (field, value) => {
    onUpdate({
      ...scoreData,
      sung: { ...scoreData.sung, [field]: value }
    });
  };

  const handleSkillSelect = (index, skill, rarity = 'mythic') => {
    const newSkills = [...(scoreData.sung.skills || Array(6).fill(null))];
    newSkills[index] = skill ? { name: skill, rarity } : null;
    handleSungUpdate('skills', newSkills);
  };

  const handleHunterChange = (index, newHunter) => {
    const newHunters = [...scoreData.hunters];

    // Vérifier si ce hunter est déjà sélectionné ailleurs
    const existingIndex = newHunters.findIndex(h => h && h.id === newHunter.name);

    if (existingIndex !== -1 && existingIndex !== index) {
      // Si le hunter existe déjà, faire un échange
      const temp = newHunters[index];
      newHunters[index] = {
        ...newHunters[existingIndex],
        id: newHunter.name,
        character: newHunter
      };
      newHunters[existingIndex] = temp;

      showTankMessage(`${newHunter.name} échangé de position !`, true, 'beru');
    } else {
      // Sinon, assignation normale
      newHunters[index] = {
        ...newHunters[index],
        id: newHunter.name,
        character: newHunter
      };
    }

    onUpdate({ ...scoreData, hunters: newHunters });
    setShowHunterPicker(null);
  };

  const handleHunterUpdate = (index, field, value) => {
    const newHunters = [...scoreData.hunters];
    newHunters[index] = { ...newHunters[index], [field]: value };
    onUpdate({ ...scoreData, hunters: newHunters });
  };

  // Fonction améliorée pour récupérer le character depuis l'objet characters
  const getCharacterData = (hunterId) => {
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

  // Fonction pour importer les stats depuis le build
  const importStatsFromBuild = (type, hunterIndex = null) => {
    try {
      const builderberuUsers = localStorage.getItem('builderberu_users');
      if (!builderberuUsers) {
        showTankMessage("Aucun build trouvé", true, 'tank');
        return;
      }

      const data = JSON.parse(builderberuUsers);
      const username = Object.keys(data)[0];
      const activeAcc = data[username]?.activeAccount || 'main';
      const builds = data[username]?.accounts?.[activeAcc]?.builds || {};

      // Mapping des noms de stats
      const STAT_MAPPING = {
        'Attack': 'atk',
        'Critical Hit Rate': 'tc',
        'Critical Hit Damage': 'dcc',
        'Damage Increase': 'di',
        'Defense Penetration': 'defPen',
        'MP Consumption Reduction': 'mpcr',
        'MP': 'mpa',
        'Defense': 'def',
        'HP': 'hp',
        'Precision': 'precision'
      };

      if (type === 'sung') {
        const sungBuild = builds['jinwoo'] || builds['sung-jin-woo'] || builds['Sung Jin-Woo'];

        if (!sungBuild?.calculatedFinalStats) {
          showTankMessage("Aucun build sauvegardé pour Sung Jin-Woo", true, 'tank');
          return;
        }

        // Mapper directement les stats pré-calculées
        const mappedStats = {};
        Object.entries(STAT_MAPPING).forEach(([buildKey, bdgKey]) => {
          if (sungBuild.calculatedFinalStats[buildKey] !== undefined) {
            mappedStats[bdgKey] = Math.round(sungBuild.calculatedFinalStats[buildKey]).toString();
          }
        });

        handleSungUpdate('finalStats', { ...scoreData.sung.finalStats, ...mappedStats });
        showTankMessage("Stats importées depuis le build !", true, 'beru');

      } else if (type === 'hunter' && hunterIndex !== null) {
        const hunter = scoreData.hunters[hunterIndex];
        if (!hunter?.character) {
          showTankMessage("Sélectionne d'abord un hunter", true, 'tank');
          return;
        }

        const hunterName = hunter.character.name;
        const hunterKey = hunterName.toLowerCase().replace(/\s+/g, '-');
        const hunterBuild = builds[hunter.id.toLowerCase()] || builds[hunter.id] || builds[hunterKey] || builds[hunterName];

        if (!hunterBuild?.calculatedFinalStats) {
          showTankMessage(`Aucun build sauvegardé pour ${hunterName}`, true, 'tank');
          return;
        }

        const importantStats = hunter.character.importantStats || ['atk', 'tc', 'dcc', 'defPen'];
        const mappedStats = {};

        importantStats.forEach(stat => {
          const buildStatName = Object.entries(STAT_MAPPING).find(([build, bdg]) => bdg === stat)?.[0];
          if (buildStatName && hunterBuild.calculatedFinalStats[buildStatName] !== undefined) {
            mappedStats[stat] = Math.round(hunterBuild.calculatedFinalStats[buildStatName]).toString();
          }
        });

        const newHunters = [...scoreData.hunters];
        newHunters[hunterIndex].finalStats = { ...newHunters[hunterIndex].finalStats, ...mappedStats };
        onUpdate({ ...scoreData, hunters: newHunters });

        showTankMessage(`Stats importées pour ${hunterName} !`, true, 'beru');
      }
    } catch (e) {
      console.error('Erreur import stats:', e);
      showTankMessage("Erreur lors de l'import", true, 'tank');
    }
  };

  return (
    <div className="space-y-4">
      {/* Sung Jin-Woo Section - Responsive */}
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 rounded-xl p-3 sm:p-4 border border-gray-700 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center uppercase">
            <span className="text-purple-400 mr-2">⚔️</span>
            Sung Jinwoo
          </h3>
          <div className="flex flex-col items-end">
            <input
              type="text"
              value={scoreData.sung.damage === '' ? '' : scoreData.sung.damage.toLocaleString()}
              onChange={(e) => handleScoreChange('sung', null, e.target.value)}
              className="w-28 sm:w-32 bg-gray-900/80 text-white text-lg sm:text-xl p-1.5 sm:p-2 rounded-lg border border-purple-500/30 focus:border-purple-400 focus:outline-none text-right"
              placeholder="0"
            />
            {/* Barre de progression pour Sung */}
            {characters['jinwoo']?.bdgLimits && scoreData.sung.damage > 0 && (
              <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden mt-1 w-28 sm:w-32">
                <div
                  className={`absolute left-0 top-0 h-full transition-all duration-300 ${getDamageProgressColor(scoreData.sung.damage, getSungMaxDamage())
                    }`}
                  style={{
                    width: `${Math.min((scoreData.sung.damage / getSungMaxDamage()) * 100, 120)}%`
                  }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white font-medium">
                  {Math.round((scoreData.sung.damage / getSungMaxDamage()) * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile: Layout vertical */}
        {isMobile ? (
          <div className="space-y-4">
            {/* Sets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-purple-300 uppercase">Sets</h4>
                <label className="text-xs text-gray-400 flex items-center">
                  <input
                    type="checkbox"
                    checked={sungLeftSplit}
                    onChange={(e) => setSungLeftSplit(e.target.checked)}
                    className="mr-1"
                  />
                  2+2
                </label>
              </div>
              {sungLeftSplit ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      className="w-full bg-gray-800/80 text-white text-xs p-2 rounded border border-gray-700 focus:border-purple-500"
                      value={scoreData.sung.leftSet1 || ''}
                      onChange={(e) => handleSungUpdate('leftSet1', e.target.value)}
                      title={scoreData.sung.leftSet1 || 'Set Gauche 1'}
                    >
                      <option value="">Set G1</option>
                      {leftArtifacts.map(artifact => (
                        <option key={artifact.set} value={artifact.set} title={artifact.set}>
                          {artifact.set}
                        </option>
                      ))}
                    </select>
                    <select
                      className="w-full bg-gray-800/80 text-white text-xs p-2 rounded border border-gray-700 focus:border-purple-500"
                      value={scoreData.sung.leftSet2 || ''}
                      onChange={(e) => handleSungUpdate('leftSet2', e.target.value)}
                      title={scoreData.sung.leftSet2 || 'Set Gauche 2'}
                    >
                      <option value="">Set G2</option>
                      {leftArtifacts.map(artifact => (
                        <option key={artifact.set} value={artifact.set} title={artifact.set}>
                          {artifact.set}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <select
                  className="w-full bg-gray-800/80 text-white text-xs p-2 rounded border border-gray-700 focus:border-purple-500"
                  value={scoreData.sung.leftSet || ''}
                  onChange={(e) => handleSungUpdate('leftSet', e.target.value)}
                  title={scoreData.sung.leftSet || 'Set Gauche'}
                >
                  <option value="">Set Gauche</option>
                  {leftArtifacts.map(artifact => (
                    <option key={artifact.set} value={artifact.set} title={artifact.set}>
                      {artifact.set}
                    </option>
                  ))}
                </select>
              )}
              <select
                className="w-full bg-gray-800/80 text-white text-xs p-2 rounded border border-gray-700 focus:border-purple-500 mt-2"
                value={scoreData.sung.rightSet || ''}
                onChange={(e) => handleSungUpdate('rightSet', e.target.value)}
                title={scoreData.sung.rightSet || 'Set Droit'}
              >
                <option value="">Set Droit</option>
                {rightArtifacts.map(artifact => (
                  <option key={artifact.set} value={artifact.set} title={artifact.set}>
                    {artifact.set}
                  </option>
                ))}
              </select>
            </div>

            {/* Armes */}
            <div>
              <h4 className="text-xs font-semibold text-purple-300 mb-2 uppercase">Armes</h4>
              <div className="space-y-2">
                {[0, 1].map((idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      className="flex-1 bg-gray-800/80 text-white text-xs p-2 rounded border border-gray-700 focus:border-purple-500"
                      value={scoreData.sung.weapons?.[idx] || ''}
                      onChange={(e) => {
                        const newWeapons = [...(scoreData.sung.weapons || [])];
                        newWeapons[idx] = e.target.value;
                        handleSungUpdate('weapons', newWeapons);
                      }}
                      title={scoreData.sung.weapons?.[idx] || `Arme ${idx + 1}`}
                    >
                      <option value="">Arme {idx + 1}</option>
                      {weaponData.map(weapon => (
                        <option key={weapon.name} value={weapon.name} title={weapon.name}>
                          {weapon.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={scoreData.sung.weaponStars?.[idx] || 0}
                      onChange={(e) => {
                        const newStars = [...(scoreData.sung.weaponStars || [0, 0])];
                        newStars[idx] = parseInt(e.target.value) || 0;
                        handleSungUpdate('weaponStars', newStars);
                      }}
                      className="w-12 bg-gray-800/80 text-white text-xs p-2 rounded text-center border border-gray-700 focus:border-purple-500"
                    />
                    <span className="text-yellow-400 text-sm">⭐</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Compétences */}
            <div>
              <h4 className="text-xs font-semibold text-purple-300 mb-2 uppercase">Compétences (6)</h4>
              <div className="grid grid-cols-2 gap-2">
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const skill = scoreData.sung.skills?.[idx];

                  // Déterminer quelle liste utiliser selon l'index
                  const skillsList = idx < 2 ? basicSkills :
                    idx === 2 ? ultimateSkills :
                      idx === 3 ? deathSkills :
                        idx === 4 ? collapseSkills :
                          shadowStepSkill;

                  return (
                    <div key={idx} className="flex gap-1">
                      <select
                        className="flex-1 bg-gray-800/80 text-white text-xs p-1.5 rounded border border-gray-700 focus:border-purple-500"
                        value={skill?.name || ''}
                        onChange={(e) => {
                          const selectedSkill = skillsList.find(s => s.name === e.target.value);
                          handleSkillSelect(idx, selectedSkill?.name, skill?.rarity || 'mythic');
                        }}
                        title={skill?.name || `Skill ${idx + 1}`}
                      >
                        <option value="">S{idx + 1}</option>
                        {skillsList.map(s => (
                          <option key={s.name} value={s.name} title={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <select
                        className={`w-12 text-xs p-1.5 rounded border ${rarityColors[skill?.rarity || 'mythic']}`}
                        value={skill?.rarity || 'mythic'}
                        onChange={(e) => {
                          if (skill) {
                            handleSkillSelect(idx, skill.name, e.target.value);
                          }
                        }}
                      >
                        <option value="rare">R</option>
                        <option value="epic">E</option>
                        <option value="legendary">L</option>
                        <option value="mythic">M</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bénédictions */}
            <div>
              <h4 className="text-xs font-semibold text-purple-300 mb-2 uppercase">Bénédictions (8)</h4>
              <div className="grid grid-cols-4 gap-1">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
                  const blessing = scoreData.sung.blessings?.[idx];
                  const isDefensive = idx >= 4;
                  const blessings = blessingStonesData.filter(b => b.type === (isDefensive ? 'defensive' : 'offensive'));

                  // Gérer les deux formats
                  const blessingName = typeof blessing === 'string' ? blessing : blessing?.name;
                  const blessingRarity = typeof blessing === 'string' ? 'mythic' : (blessing?.rarity || 'mythic');

                  // Bordure selon la rareté
                  const getBlessingBorderClass = () => {
                    if (!blessingName) return 'border-gray-700';
                    return rarityColors[blessingRarity].split(' ')[0]; // Prend seulement la classe border
                  };

                  return (
                    <select
                      key={idx}
                      className={`bg-gray-800/80 text-white text-xs p-1.5 rounded border ${getBlessingBorderClass()} focus:border-purple-500`}
                      value={blessingName || ''}
                      onChange={(e) => {
                        const newBlessings = [...(scoreData.sung.blessings || [])];
                        const selectedBlessing = blessingStonesData.find(b => b.name === e.target.value);
                        newBlessings[idx] = {
                          name: e.target.value,
                          type: selectedBlessing?.type || (isDefensive ? 'defensive' : 'offensive'),
                          rarity: blessingRarity // Conserver la rareté
                        };
                        handleSungUpdate('blessings', newBlessings);
                      }}
                      title={blessingName || `${isDefensive ? 'Defensive' : 'Offensive'} ${(idx % 4) + 1}`}
                    >
                      <option value="">{isDefensive ? 'D' : 'O'}{(idx % 4) + 1}</option>
                      {blessings.map(blessing => (
                        <option key={blessing.name} value={blessing.name} title={blessing.name}>
                          {blessing.name}
                        </option>
                      ))}
                    </select>
                  );
                })}
              </div>
            </div>

            {/* Stats de base */}
            <div>
              <h4 className="text-xs font-semibold text-purple-300 mb-2 uppercase">Stats de base</h4>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { key: 'str', label: 'STR' },
                  { key: 'int', label: 'INT' },
                  { key: 'vit', label: 'VIT' },
                  { key: 'per', label: 'PER' },
                  { key: 'agi', label: 'AGI' }
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-[9px] text-gray-500 block">{label}</label>
                    <input
                      type="number"
                      value={scoreData.sung.baseStats?.[key] || 0}
                      onChange={(e) => {
                        const newStats = { ...(scoreData.sung.baseStats || {}) };
                        newStats[key] = parseInt(e.target.value) || 0;
                        handleSungUpdate('baseStats', newStats);
                      }}
                      className="w-full bg-gray-800/80 text-white text-xs p-1.5 rounded text-center border border-gray-700 focus:border-purple-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Stats finales avec bouton import */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-purple-300 uppercase">Stats finales</h4>
                <img
                  src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754055557/chaelogo_hci0do.png"
                  alt="Import"
                  className="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => importStatsFromBuild('sung')}
                  title="Importer les stats depuis le build"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'atk', label: 'ATK', placeholder: sungPreset.expectedStats?.atk },
                  { key: 'tc', label: 'TC', placeholder: sungPreset.expectedStats?.tc },
                  { key: 'dcc', label: 'DCC', placeholder: sungPreset.expectedStats?.dcc },
                  { key: 'di', label: 'DI', placeholder: sungPreset.expectedStats?.di },
                  { key: 'defPen', label: 'DEF P', placeholder: sungPreset.expectedStats?.defPen },
                  { key: 'precision', label: 'PREC', placeholder: sungPreset.expectedStats?.precision },
                  { key: 'mpcr', label: 'MPCR', placeholder: sungPreset.expectedStats?.mpcr },
                  { key: 'mpa', label: 'MPA', placeholder: sungPreset.expectedStats?.mpa }
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="text-[9px] text-gray-500 block">{label}</label>
                    <input
                      type="text"
                      value={scoreData.sung.finalStats?.[key] || ''}
                      onChange={(e) => {
                        const newStats = { ...(scoreData.sung.finalStats || {}) };
                        newStats[key] = e.target.value;
                        handleSungUpdate('finalStats', newStats);
                      }}
                      className="w-full bg-gray-800/80 text-white text-xs p-1.5 rounded text-center border border-gray-700 focus:border-purple-500"
                      placeholder={placeholder || '0'}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Desktop: Grid Layout (unchanged)
          <div className="grid grid-cols-3 gap-4">
            {/* Col 1: Sets & Armes */}
            <div className="space-y-3">
              {/* Sets */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-semibold text-purple-300 uppercase">Sets</h4>
                  <label className="text-xs text-gray-400 flex items-center">
                    <input
                      type="checkbox"
                      checked={sungLeftSplit}
                      onChange={(e) => setSungLeftSplit(e.target.checked)}
                      className="mr-1"
                    />
                    2+2
                  </label>
                </div>
                {sungLeftSplit ? (
                  <div className="space-y-1">
                    <div className="grid grid-cols-2 gap-1">
                      <select
                        className="w-full bg-gray-800/80 text-white text-xs p-1 rounded border border-gray-700 focus:border-purple-500"
                        value={scoreData.sung.leftSet1 || ''}
                        onChange={(e) => handleSungUpdate('leftSet1', e.target.value)}
                        title={scoreData.sung.leftSet1 || 'Set Gauche 1'}
                      >
                        <option value="">Set G1</option>
                        {leftArtifacts.map(artifact => (
                          <option key={artifact.set} value={artifact.set} title={artifact.set}>
                            {artifact.set}
                          </option>
                        ))}
                      </select>
                      <select
                        className="w-full bg-gray-800/80 text-white text-xs p-1 rounded border border-gray-700 focus:border-purple-500"
                        value={scoreData.sung.leftSet2 || ''}
                        onChange={(e) => handleSungUpdate('leftSet2', e.target.value)}
                        title={scoreData.sung.leftSet2 || 'Set Gauche 2'}
                      >
                        <option value="">Set G2</option>
                        {leftArtifacts.map(artifact => (
                          <option key={artifact.set} value={artifact.set} title={artifact.set}>
                            {artifact.set}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <select
                    className="w-full bg-gray-800/80 text-white text-xs p-1 rounded border border-gray-700 focus:border-purple-500"
                    value={scoreData.sung.leftSet || ''}
                    onChange={(e) => handleSungUpdate('leftSet', e.target.value)}
                    title={scoreData.sung.leftSet || 'Set Gauche'}
                  >
                    <option value="">Set Gauche</option>
                    {leftArtifacts.map(artifact => (
                      <option key={artifact.set} value={artifact.set} title={artifact.set}>
                        {artifact.set}
                      </option>
                    ))}
                  </select>
                )}
                <select
                  className="w-full bg-gray-800/80 text-white text-xs p-1 rounded border border-gray-700 focus:border-purple-500 mt-1"
                  value={scoreData.sung.rightSet || ''}
                  onChange={(e) => handleSungUpdate('rightSet', e.target.value)}
                  title={scoreData.sung.rightSet || 'Set Droit'}
                >
                  <option value="">Set Droit</option>
                  {rightArtifacts.map(artifact => (
                    <option key={artifact.set} value={artifact.set} title={artifact.set}>
                      {artifact.set}
                    </option>
                  ))}
                </select>
              </div>

              {/* Armes */}
              <div>
                <h4 className="text-xs font-semibold text-purple-300 mb-1 uppercase">Armes</h4>
                {[0, 1].map((idx) => (
                  <div key={idx} className="flex items-center gap-1 mb-1">
                    <select
                      className="flex-1 bg-gray-800/80 text-white text-xs p-1 rounded border border-gray-700 focus:border-purple-500"
                      value={scoreData.sung.weapons?.[idx] || ''}
                      onChange={(e) => {
                        const newWeapons = [...(scoreData.sung.weapons || [])];
                        newWeapons[idx] = e.target.value;
                        handleSungUpdate('weapons', newWeapons);
                      }}
                      title={scoreData.sung.weapons?.[idx] || `Arme ${idx + 1}`}
                    >
                      <option value="">Arme {idx + 1}</option>
                      {weaponData.map(weapon => (
                        <option key={weapon.name} value={weapon.name} title={weapon.name}>
                          {weapon.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={scoreData.sung.weaponStars?.[idx] || 0}
                      onChange={(e) => {
                        const newStars = [...(scoreData.sung.weaponStars || [0, 0])];
                        newStars[idx] = parseInt(e.target.value) || 0;
                        handleSungUpdate('weaponStars', newStars);
                      }}
                      className="w-10 bg-gray-800/80 text-white text-xs p-1 rounded text-center border border-gray-700 focus:border-purple-500"
                    />
                    <span className="text-yellow-400 text-xs">⭐</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 2: Skills & Blessings */}
            <div className="space-y-3">
              {/* Skills compact */}
              <div>
                <h4 className="text-xs font-semibold text-purple-300 mb-1 uppercase">Compétences (6)</h4>
                <div className="grid grid-cols-2 gap-1">
                  {[0, 1, 2, 3, 4, 5].map((idx) => {
                    const skill = scoreData.sung.skills?.[idx];

                    // Déterminer quelle liste utiliser selon l'index
                    const skillsList = idx < 2 ? basicSkills :
                      idx === 2 ? ultimateSkills :
                        idx === 3 ? deathSkills :
                          idx === 4 ? collapseSkills :
                            shadowStepSkill;

                    return (
                      <div key={idx} className="flex gap-1">
                        <select
                          className="flex-1 bg-gray-800/80 text-white text-xs p-1 rounded border border-gray-700 focus:border-purple-500"
                          value={skill?.name || ''}
                          onChange={(e) => {
                            const selectedSkill = skillsList.find(s => s.name === e.target.value);
                            handleSkillSelect(idx, selectedSkill?.name, skill?.rarity || 'mythic');
                          }}
                          title={skill?.name || `Skill ${idx + 1}`}
                        >
                          <option value="">S{idx + 1}</option>
                          {skillsList.map(s => (
                            <option key={s.name} value={s.name} title={s.name}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                        <select
                          className={`w-12 text-xs p-1 rounded border ${rarityColors[skill?.rarity || 'mythic']}`}
                          value={skill?.rarity || 'mythic'}
                          onChange={(e) => {
                            if (skill) {
                              handleSkillSelect(idx, skill.name, e.target.value);
                            }
                          }}
                        >
                          <option value="rare">R</option>
                          <option value="epic">E</option>
                          <option value="legendary">L</option>
                          <option value="mythic">M</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Blessings compact */}
              <div>
                <h4 className="text-xs font-semibold text-purple-300 mb-1 uppercase">Bénédictions (8)</h4>
                <div className="grid grid-cols-4 gap-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
                    const blessing = scoreData.sung.blessings?.[idx];
                    const isDefensive = idx >= 4;
                    const blessings = blessingStonesData.filter(b => b.type === (isDefensive ? 'defensive' : 'offensive'));

                    // Gérer les deux formats
                    const blessingName = typeof blessing === 'string' ? blessing : blessing?.name;
                    const blessingRarity = typeof blessing === 'string' ? 'mythic' : (blessing?.rarity || 'mythic');

                    // Bordure selon la rareté
                    const getBlessingBorderClass = () => {
                      if (!blessingName) return 'border-gray-700';
                      return rarityColors[blessingRarity].split(' ')[0]; // Prend seulement la classe border
                    };

                    return (
                      <select
                        key={idx}
                        className={`bg-gray-800/80 text-white text-xs p-1 rounded border ${getBlessingBorderClass()} focus:border-purple-500`}
                        value={blessingName || ''}
                        onChange={(e) => {
                          const newBlessings = [...(scoreData.sung.blessings || [])];
                          const selectedBlessing = blessingStonesData.find(b => b.name === e.target.value);
                          newBlessings[idx] = {
                            name: e.target.value,
                            type: selectedBlessing?.type || (isDefensive ? 'defensive' : 'offensive'),
                            rarity: blessingRarity // Conserver la rareté
                          };
                          handleSungUpdate('blessings', newBlessings);
                        }}
                        title={blessingName || `${isDefensive ? 'Defensive' : 'Offensive'} ${(idx % 4) + 1}`}
                      >
                        <option value="">{isDefensive ? 'D' : 'O'}{(idx % 4) + 1}</option>
                        {blessings.map(blessing => (
                          <option key={blessing.name} value={blessing.name} title={blessing.name}>
                            {blessing.name}
                          </option>
                        ))}
                      </select>
                    );
                  })}
                </div>
              </div>

              {/* Stats de base compact */}
              <div>
                <h4 className="text-xs font-semibold text-purple-300 mb-1 uppercase">Stats de base</h4>
                <div className="grid grid-cols-5 gap-1">
                  {[
                    { key: 'str', label: 'STR' },
                    { key: 'int', label: 'INT' },
                    { key: 'vit', label: 'VIT' },
                    { key: 'per', label: 'PER' },
                    { key: 'agi', label: 'AGI' }
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="text-[9px] text-gray-500 block">{label}</label>
                      <input
                        type="number"
                        value={scoreData.sung.baseStats?.[key] || 0}
                        onChange={(e) => {
                          const newStats = { ...(scoreData.sung.baseStats || {}) };
                          newStats[key] = parseInt(e.target.value) || 0;
                          handleSungUpdate('baseStats', newStats);
                        }}
                        className="w-full bg-gray-800/80 text-white text-xs p-1 rounded text-center border border-gray-700 focus:border-purple-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Col 3: Stats finales avec bouton import */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-semibold text-purple-300 uppercase">Stats finales</h4>
                <img
                  src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754055557/chaelogo_hci0do.png"
                  alt="Import"
                  className="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => importStatsFromBuild('sung')}
                  title="Importer les stats depuis le build"
                />
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                {[
                  { key: 'atk', label: 'ATK', placeholder: sungPreset.expectedStats?.atk },
                  { key: 'tc', label: 'TC', placeholder: sungPreset.expectedStats?.tc },
                  { key: 'dcc', label: 'DCC', placeholder: sungPreset.expectedStats?.dcc },
                  { key: 'di', label: 'DI', placeholder: sungPreset.expectedStats?.di },
                  { key: 'defPen', label: 'DEF P', placeholder: sungPreset.expectedStats?.defPen },
                  { key: 'precision', label: 'PREC', placeholder: sungPreset.expectedStats?.precision },
                  { key: 'mpcr', label: 'MPCR', placeholder: sungPreset.expectedStats?.mpcr },
                  { key: 'mpa', label: 'MPA', placeholder: sungPreset.expectedStats?.mpa }
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="text-[9px] text-gray-500 block">{label}</label>
                    <input
                      type="text"
                      value={scoreData.sung.finalStats?.[key] || ''}
                      onChange={(e) => {
                        const newStats = { ...(scoreData.sung.finalStats || {}) };
                        newStats[key] = e.target.value;
                        handleSungUpdate('finalStats', newStats);
                      }}
                      className="w-full bg-gray-800/80 text-white text-xs p-1 rounded text-center border border-gray-700 focus:border-purple-500"
                      placeholder={placeholder || '0'}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hunters Section - Responsive Grid */}
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 rounded-xl p-3 sm:p-4 border border-gray-700 shadow-xl">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center uppercase">
          <span className="text-purple-400 mr-2">👥</span>
          Hunters
        </h3>
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {[0, 1, 2, 3, 4, 5].map((idx) => {
            const hunter = scoreData.hunters[idx];
            const character = hunter?.character || getCharacterData(hunter?.id);
            const hunterPreset = preset?.hunters?.[idx];

            return (
              <div key={idx} className="bg-black/30 rounded-lg p-3 border border-purple-500/30">
                {/* Hunter Selection */}
                <div
                  className="flex items-center mb-2 cursor-pointer hover:bg-purple-900/20 p-1 rounded transition-all"
                  onClick={() => setShowHunterPicker(idx)}
                >
                  {character ? (
                    <>
                      <img
                        src={character.icon}
                        alt={character.name}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-white text-sm">{
                          character.name}</p>
                        <p className="text-xs text-gray-400">{character.class}</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 text-gray-500 text-sm">
                      Cliquer pour choisir
                    </div>
                  )}
                  <span className="text-purple-400 text-xs">▼</span>
                </div>

                {/* Hunter Sets & Stars - Avec 2+2 support */}
                <div className="space-y-2 mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[9px] text-gray-400 flex items-center">
                      <input
                        type="checkbox"
                        checked={hunterLeftSplits[idx] || false}
                        onChange={(e) => {
                          setHunterLeftSplits({ ...hunterLeftSplits, [idx]: e.target.checked });
                          if (!e.target.checked) {
                            // Reset les sets split quand on décoche
                            handleHunterUpdate(idx, 'leftSet1', '');
                            handleHunterUpdate(idx, 'leftSet2', '');
                          }
                        }}
                        className="mr-1"
                      />
                      2+2
                    </label>
                  </div>

                  {hunterLeftSplits[idx] ? (
                    <div className="grid grid-cols-2 gap-1">
                      <select
                        className="bg-gray-800/80 text-white text-xs p-1.5 rounded border border-gray-700 focus:border-purple-500"
                        value={hunter?.leftSet1 || ''}
                        onChange={(e) => handleHunterUpdate(idx, 'leftSet1', e.target.value)}
                        title={hunter?.leftSet1 || 'Set G1'}
                      >
                        <option value="">Set G1</option>
                        {leftArtifacts.map(a => (
                          <option key={a.set} value={a.set} title={a.set}>
                            {a.set}
                          </option>
                        ))}
                      </select>
                      <select
                        className="bg-gray-800/80 text-white text-xs p-1.5 rounded border border-gray-700 focus:border-purple-500"
                        value={hunter?.leftSet2 || ''}
                        onChange={(e) => handleHunterUpdate(idx, 'leftSet2', e.target.value)}
                        title={hunter?.leftSet2 || 'Set G2'}
                      >
                        <option value="">Set G2</option>
                        {leftArtifacts.map(a => (
                          <option key={a.set} value={a.set} title={a.set}>
                            {a.set}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-1">
                      <select
                        className="bg-gray-800/80 text-white text-xs p-1.5 rounded border border-gray-700 focus:border-purple-500"
                        value={hunter?.leftSet || ''}
                        onChange={(e) => handleHunterUpdate(idx, 'leftSet', e.target.value)}
                        title={hunter?.leftSet || 'Set Gauche'}
                      >
                        <option value="">Set G</option>
                        {leftArtifacts.map(a => (
                          <option key={a.set} value={a.set} title={a.set}>
                            {a.set}
                          </option>
                        ))}
                      </select>
                      <select
                        className="bg-gray-800/80 text-white text-xs p-1.5 rounded border border-gray-700 focus:border-purple-500"
                        value={hunter?.rightSet || ''}
                        onChange={(e) => handleHunterUpdate(idx, 'rightSet', e.target.value)}
                        title={hunter?.rightSet || 'Set Droit'}
                      >
                        <option value="">Set D</option>
                        {rightArtifacts.map(a => (
                          <option key={a.set} value={a.set} title={a.set}>
                            {a.set}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Set Droit séparé quand en mode 2+2 */}
                  {hunterLeftSplits[idx] && (
                    <select
                      className="w-full bg-gray-800/80 text-white text-xs p-1.5 rounded border border-gray-700 focus:border-purple-500 mt-1"
                      value={hunter?.rightSet || ''}
                      onChange={(e) => handleHunterUpdate(idx, 'rightSet', e.target.value)}
                      title={hunter?.rightSet || 'Set Droit'}
                    >
                      <option value="">Set Droit</option>
                      {rightArtifacts.map(a => (
                        <option key={a.set} value={a.set} title={a.set}>
                          {a.set}
                        </option>
                      ))}
                    </select>
                  )}

                  <div className="grid grid-cols-2 gap-1">
                    <div className="flex items-center gap-1">
                      <label className="text-[9px] text-gray-400">H:</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={hunter?.stars || 0}
                        onChange={(e) => handleHunterUpdate(idx, 'stars', parseInt(e.target.value) || 0)}
                        className="flex-1 bg-gray-800/80 text-white text-xs p-1.5 rounded text-center border border-gray-700 focus:border-purple-500"
                      />
                      <span className="text-yellow-400 text-xs">⭐</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <label className="text-[9px] text-gray-400">W:</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={hunter?.weaponStars || 0}
                        onChange={(e) => handleHunterUpdate(idx, 'weaponStars', parseInt(e.target.value) || 0)}
                        className="flex-1 bg-gray-800/80 text-white text-xs p-1.5 rounded text-center border border-gray-700 focus:border-purple-500"
                      />
                      <span className="text-yellow-400 text-xs">⭐</span>
                    </div>
                  </div>
                </div>

                {/* Damage avec barre de progression */}
                <div className="space-y-1">
                  <input
                    type="text"
                    value={hunter?.damage === '' ? '' : (hunter?.damage?.toLocaleString() || '')}
                    onChange={(e) => handleScoreChange('hunter', idx, e.target.value)}
                    className="w-full bg-gray-800/80 text-white text-sm p-1.5 rounded mb-1 border border-gray-700 focus:border-purple-500"
                    placeholder={hunterPreset?.expectedDamage || '0'}
                  />

                  {/* Barre de progression si on a un character et une limite */}
                  {character && character.bdgLimits && hunter?.damage > 0 && (
                    <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`absolute left-0 top-0 h-full transition-all duration-300 ${getDamageProgressColor(
                          hunter.damage,
                          character.element?.toUpperCase() === scoreData.element
                            ? character.bdgLimits.maxDamageOnElement
                            : character.bdgLimits.maxDamageOffElement
                        )
                          }`}
                        style={{
                          width: `${Math.min(
                            (hunter.damage / (character.element?.toUpperCase() === scoreData.element
                              ? character.bdgLimits.maxDamageOnElement
                              : character.bdgLimits.maxDamageOffElement)) * 100,
                            120
                          )}%`
                        }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white font-medium">
                        {Math.round((hunter.damage / (character.element?.toUpperCase() === scoreData.element
                          ? character.bdgLimits.maxDamageOnElement
                          : character.bdgLimits.maxDamageOffElement)) * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Final Stats avec bouton import */}
                <div className="mt-2">
                  {character && (
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[9px] text-gray-500">Stats finales</label>
                      <img
  src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754055837/beruProst_ymvwos.png"
  alt="Import"
  className="w-7 h-7 cursor-pointer hover:opacity-80 transition-opacity"
  onClick={() => importStatsFromBuild('hunter', idx)}
  title="Importer depuis le build"
/>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {(() => {
                      // IMPORTANT: Si pas de character, utiliser les clés des finalStats existantes
                      let statsToShow;

                      if (character?.importantStats) {
                        statsToShow = character.importantStats;
                      } else if (hunter?.finalStats && Object.keys(hunter.finalStats).length > 0) {
                        // Garder les stats déjà définies
                        statsToShow = Object.keys(hunter.finalStats);
                      } else {
                        // Fallback par défaut
                        statsToShow = ['atk', 'tc', 'dcc', 'defPen'];
                      }

                      const labelMap = {
                        'def': 'DEF',
                        'hp': 'HP',
                        'atk': 'ATK',
                        'tc': 'TC',
                        'dcc': 'DCC',
                        'defPen': 'DEF P',
                        'di': 'DI',
                        'mpcr': 'MPCR',
                        'mpa': 'MPA'
                      };

                      return statsToShow.map((statKey) => {
                        const label = labelMap[statKey] || statKey.toUpperCase();

                        return (
                          <div key={statKey}>
                            <label className="text-[9px] text-gray-500 block">{label}</label>
                            <input
                              type="text"
                              value={hunter?.finalStats?.[statKey] || ''}
                              onChange={(e) => {
                                const newHunters = [...scoreData.hunters];
                                if (!newHunters[idx].finalStats) {
                                  newHunters[idx].finalStats = {};
                                }
                                newHunters[idx].finalStats[statKey] = e.target.value;
                                onUpdate({ ...scoreData, hunters: newHunters });
                              }}
                              className="w-full bg-gray-800/80 text-white text-xs p-1.5 rounded text-center border border-gray-700 focus:border-purple-500"
                              placeholder={hunterPreset?.expectedStats?.[statKey] || '0'}
                            />
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rage Count - Inline */}
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 rounded-xl p-3 border border-gray-700 shadow-xl flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold text-white uppercase">Rage Count</h3>
        <div className="flex items-center gap-4">
          <div className="text-xl sm:text-2xl font-bold text-purple-400">
            RC {scoreData.rageCount || 0}
          </div>
          <span className="text-xs sm:text-sm text-gray-400">
            (Auto-calculé)
          </span>
        </div>
      </div>

      {/* Hunter Picker Modal - Mobile responsive */}
      {showHunterPicker !== null && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowHunterPicker(null)}>
          <div className={`bg-gray-900 rounded-xl p-4 ${isMobile ? 'w-full max-h-[80vh]' : 'max-w-3xl max-h-[70vh]'} overflow-y-auto border border-purple-500/50`} onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-3 uppercase">Choisir un Hunter</h3>
            <div className={`grid gap-3 ${isMobile ? 'grid-cols-3' : 'grid-cols-4 md:grid-cols-6'}`}>
              {charactersArray
                .filter(c => c.grade === 'SSR' || c.grade === 'SR')
                .sort((a, b) => {
                  // Récupérer les positions
                  const posA = scoreData.hunters.findIndex(h => {
                    if (!h || !h.id) return false;

                    // Cas spéciaux
                    if (h.id === "Lee" && a.name === "Lee Bora") return true;
                    if (h.id === "Mirei" && a.name === "Amamiya Mirei") return true;

                    // Exclure Lee Johee du matching avec "Lee"
                    if (h.id === "Lee" && a.name === "Lee Johee") return false;

                    return h.id === a.name ||
                      h.id === a.name.split(' ')[0] ||
                      h.id.toLowerCase() === a.name.toLowerCase() ||
                      h.id.toLowerCase() === a.name.split(' ')[0].toLowerCase();
                  });

                  const posB = scoreData.hunters.findIndex(h => {
                    if (!h || !h.id) return false;

                    // Cas spéciaux
                    if (h.id === "Lee" && b.name === "Lee Bora") return true;
                    if (h.id === "Mirei" && b.name === "Amamiya Mirei") return true;

                    // Exclure Lee Johee du matching avec "Lee"
                    if (h.id === "Lee" && b.name === "Lee Johee") return false;

                    return h.id === b.name ||
                      h.id === b.name.split(' ')[0] ||
                      h.id.toLowerCase() === b.name.toLowerCase() ||
                      h.id.toLowerCase() === b.name.split(' ')[0].toLowerCase();
                  });

                  // 1. Les hunters avec position en premier (slot 1-6)
                  if (posA !== -1 && posB === -1) return -1;
                  if (posA === -1 && posB !== -1) return 1;
                  if (posA !== -1 && posB !== -1) return posA - posB;

                  // 2. Ensuite les hunters du bon élément
                  const isElementA = a.element?.toUpperCase() === scoreData.element;
                  const isElementB = b.element?.toUpperCase() === scoreData.element;
                  if (isElementA && !isElementB) return -1;
                  if (!isElementA && isElementB) return 1;

                  // 3. Enfin par ordre alphabétique
                  return a.name.localeCompare(b.name);
                })
                .map(character => {
                  const isCurrentElement = character.element?.toUpperCase() === scoreData.element;
                  const currentPosition = scoreData.hunters.findIndex(h => {
                    if (!h || !h.id) return false;

                    // Cas spécial pour Lee - on doit matcher "Lee" avec "Lee Bora" spécifiquement
                    if (h.id === "Lee") {
                      return character.name === "Lee Bora";
                    }

                    // Cas spécial pour Mirei - matcher "Mirei" avec "Amamiya Mirei"
                    if (h.id === "Mirei") {
                      return character.name === "Amamiya Mirei";
                    }

                    return h.id === character.name ||
                      h.id === character.name.split(' ')[0] ||
                      h.id.toLowerCase() === character.name.toLowerCase() ||
                      h.id.toLowerCase() === character.name.split(' ')[0].toLowerCase();
                  });

                  return (
                    <div
                      key={character.name}
                      onClick={() => handleHunterChange(showHunterPicker, character)}
                      className={`cursor-pointer p-2 rounded-lg transition-all border-2 ${isCurrentElement
                        ? 'hover:bg-purple-900/20 hover:scale-105 border-purple-500 bg-purple-900/10'
                        : 'hover:bg-purple-900/20 hover:scale-105 border-transparent hover:border-purple-500'
                        }`}
                    >
                      <img
                        src={character.icon}
                        alt={character.name}
                        className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-full mx-auto mb-1`}
                      />
                      <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-center text-white`}>{character.name}</p>
                      <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-center ${isCurrentElement ? 'text-purple-400 font-bold' : 'text-gray-400'}`}>
                        {character.class}
                      </p>
                      {currentPosition !== -1 && (
                        <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-center text-yellow-400 mt-1`}>
                          Slot {currentPosition + 1}
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BDGEditMode;