// src/components/ScoreCard/PODEditMode.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { weaponData, runesData, blessingStonesData, artifactData, shadowData } from '../../data/itemData';
import { characters } from '../../data/characters';
import '../../i18n/i18n';

const PODEditMode = ({ preset, scoreData, onUpdate, showTankMessage, isMobile, currentBuildStats }) => {
  const { t } = useTranslation();
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

const displayShadows = React.useMemo(() => {
  if (scoreData.shadows && scoreData.shadows.some(s => s)) {
    return scoreData.shadows;
  }
  // Si pas de shadows dans scoreData mais dans le preset, utiliser celles du preset
  if (preset?.shadows && preset.shadows.length > 0) {
    return preset.shadows;
  }
  return [null, null, null];
}, [scoreData.shadows, preset?.shadows]);

  // Mapping des stats Build -> POD (identique à BDG)
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

    // VALIDATION pour POD - limites plus strictes
    if (type === 'hunter' && scoreData.hunters[index]?.character) {
      const character = scoreData.hunters[index].character;
      const isOnElement = character.element?.toUpperCase() === scoreData.element;
      
      // Pour POD, limites différentes (à ajuster selon les vraies limites)
      const maxDamage = isOnElement ? 15000000000 : 10000000000;
      const maxWithTolerance = maxDamage * 1.2;

      if (numValue > maxWithTolerance) {
        showTankMessage(
          t('pod.messages.limitExceeded', {
            name: character.name,
            max: (maxWithTolerance / 1000000000).toFixed(1)
          }),
          true,
          'tank'
        );
        return;
      }
    }

    if (type === 'sung') {
      const maxDamage = getSungMaxDamagePOD();
      const maxWithTolerance = maxDamage * 1.2;

      if (numValue > maxWithTolerance) {
        const isExpert = scoreData.sung.rightSet?.toLowerCase().includes('expert');
        showTankMessage(
          t('pod.messages.limitExceededSung', {
            mode: isExpert ? 'Expert' : 'Support',
            max: (maxWithTolerance / 1000000000).toFixed(1)
          }),
          true,
          'tank'
        );
        return;
      }
    }

    // Mettre à jour les valeurs
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

  const getSungMaxDamagePOD = () => {
    // POD a des limites différentes de BDG
    return 5000000000; // 5B pour POD
  };

  const getDamageProgressColor = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage < 25) return 'bg-red-300';
    if (percentage < 50) return 'bg-red-400';
    if (percentage < 75) return 'bg-red-500';
    if (percentage < 90) return 'bg-red-600';
    if (percentage < 100) return 'bg-red-700';
    if (percentage < 110) return 'bg-red-800';
    return 'bg-red-900';
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

      showTankMessage(t('pod.messages.exchangedPosition', { name: newHunter.name }), true, 'beru');
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

  // Fonction pour récupérer le character depuis l'objet characters
  const getCharacterData = (hunterId) => {
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

  // Fonction pour importer les stats depuis le build
  const importStatsFromBuild = (type, hunterIndex = null) => {
    try {
      const builderberuUsers = localStorage.getItem('builderberu_users');
      if (!builderberuUsers) {
        showTankMessage(t('pod.messages.noBuildFound'), true, 'tank');
        return;
      }

      const data = JSON.parse(builderberuUsers);
      const username = Object.keys(data)[0];
      const activeAcc = data[username]?.activeAccount || 'main';
      const builds = data[username]?.accounts?.[activeAcc]?.builds || {};

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
          showTankMessage(t('pod.messages.noBuildSaved', { name: 'Sung Jin-Woo' }), true, 'tank');
          return;
        }

        const mappedStats = {};
        Object.entries(STAT_MAPPING).forEach(([buildKey, podKey]) => {
          if (sungBuild.calculatedFinalStats[buildKey] !== undefined) {
            mappedStats[podKey] = Math.round(sungBuild.calculatedFinalStats[buildKey]).toString();
          }
        });

        handleSungUpdate('finalStats', { ...scoreData.sung.finalStats, ...mappedStats });
        showTankMessage(t('pod.messages.statsImported'), true, 'beru');

      } else if (type === 'hunter' && hunterIndex !== null) {
        const hunter = scoreData.hunters[hunterIndex];
        if (!hunter?.character) {
          showTankMessage(t('pod.messages.selectHunterFirst'), true, 'tank');
          return;
        }

        const hunterName = hunter.character.name;
        const hunterKey = hunterName.toLowerCase().replace(/\s+/g, '-');
        const hunterBuild = builds[hunter.id.toLowerCase()] || builds[hunter.id] || builds[hunterKey] || builds[hunterName];

        if (!hunterBuild?.calculatedFinalStats) {
          showTankMessage(t('pod.messages.noBuildSaved', { name: hunterName }), true, 'tank');
          return;
        }

        const importantStats = hunter.character.importantStats || ['atk', 'tc', 'dcc', 'defPen'];
        const mappedStats = {};

        importantStats.forEach(stat => {
          const buildStatName = Object.entries(STAT_MAPPING).find(([build, pod]) => pod === stat)?.[0];
          if (buildStatName && hunterBuild.calculatedFinalStats[buildStatName] !== undefined) {
            mappedStats[stat] = Math.round(hunterBuild.calculatedFinalStats[buildStatName]).toString();
          }
        });

        const newHunters = [...scoreData.hunters];
        newHunters[hunterIndex].finalStats = { ...newHunters[hunterIndex].finalStats, ...mappedStats };
        onUpdate({ ...scoreData, hunters: newHunters });

        showTankMessage(t('pod.messages.statsImportedFor', { name: hunterName }), true, 'beru');
      }
    } catch (e) {
      console.error('Erreur import stats:', e);
      showTankMessage(t('pod.messages.errorImporting'), true, 'tank');
    }
  };

  return (
    <div className="space-y-4">
      {/* Sung Jin-Woo Section - Identique à BDG */}
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 rounded-xl p-3 sm:p-4 border border-red-700 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center uppercase">
            <span className="text-red-400 mr-2">⚔️</span>
            Sung Jinwoo
          </h3>
          <div className="flex flex-col items-end">
            <input
              type="text"
              value={scoreData.sung.damage === '' ? '' : scoreData.sung.damage.toLocaleString()}
              onChange={(e) => handleScoreChange('sung', null, e.target.value)}
              className="w-28 sm:w-32 bg-gray-900/80 text-white text-lg sm:text-xl p-1.5 sm:p-2 rounded-lg border border-red-500/30 focus:border-red-400 focus:outline-none text-right"
              placeholder="0"
            />
            {/* Barre de progression pour Sung */}
            {scoreData.sung.damage > 0 && (
              <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden mt-1 w-28 sm:w-32">
                <div
                  className={`absolute left-0 top-0 h-full transition-all duration-300 ${getDamageProgressColor(scoreData.sung.damage, getSungMaxDamagePOD())}`}
                  style={{
                    width: `${Math.min((scoreData.sung.damage / getSungMaxDamagePOD()) * 100, 120)}%`
                  }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white font-medium">
                  {Math.round((scoreData.sung.damage / getSungMaxDamagePOD()) * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile: Layout vertical - Identique à BDG */}
        {isMobile ? (
          <div className="space-y-4">
            {/* Sets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-red-300 uppercase">{t('pod.sets.title')}</h4>
                <label className="text-xs text-gray-400 flex items-center">
                  <input
                    type="checkbox"
                    checked={sungLeftSplit}
                    onChange={(e) => setSungLeftSplit(e.target.checked)}
                    className="mr-1"
                  />
                  {t('pod.sets.split')}
                </label>
              </div>
              {sungLeftSplit ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      className="w-full bg-gray-800/80 text-white text-xs p-2 rounded border border-gray-700 focus:border-red-500"
                      value={scoreData.sung.leftSet1 || ''}
                      onChange={(e) => handleSungUpdate('leftSet1', e.target.value)}
                    >
                      <option value="">{t('pod.sets.set1')}</option>
                      {leftArtifacts.map(artifact => (
                        <option key={artifact.set} value={artifact.set}>
                          {artifact.set}
                        </option>
                      ))}
                    </select>
                    <select
                      className="w-full bg-gray-800/80 text-white text-xs p-2 rounded border border-gray-700 focus:border-red-500"
                      value={scoreData.sung.leftSet2 || ''}
                      onChange={(e) => handleSungUpdate('leftSet2', e.target.value)}
                    >
                      <option value="">{t('pod.sets.set2')}</option>
                      {leftArtifacts.map(artifact => (
                        <option key={artifact.set} value={artifact.set}>
                          {artifact.set}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <select
                  className="w-full bg-gray-800/80 text-white text-xs p-2 rounded border border-gray-700 focus:border-red-500"
                  value={scoreData.sung.leftSet || ''}
                  onChange={(e) => handleSungUpdate('leftSet', e.target.value)}
                >
                  <option value="">{t('pod.sets.left')}</option>
                  {leftArtifacts.map(artifact => (
                    <option key={artifact.set} value={artifact.set}>
                      {artifact.set}
                    </option>
                  ))}
                </select>
              )}
              <select
                className="w-full bg-gray-800/80 text-white text-xs p-2 rounded border border-gray-700 focus:border-red-500 mt-2"
                value={scoreData.sung.rightSet || ''}
                onChange={(e) => handleSungUpdate('rightSet', e.target.value)}
              >
                <option value="">{t('pod.sets.right')}</option>
                {rightArtifacts.map(artifact => (
                  <option key={artifact.set} value={artifact.set}>
                    {artifact.set}
                  </option>
                ))}
              </select>
            </div>

            {/* Armes */}
            <div>
              <h4 className="text-xs font-semibold text-red-300 mb-2 uppercase">{t('pod.weapons.title')}</h4>
              <div className="space-y-2">
                {[0, 1].map((idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      className="flex-1 bg-gray-800/80 text-white text-xs p-2 rounded border border-gray-700 focus:border-red-500"
                      value={scoreData.sung.weapons?.[idx] || ''}
                      onChange={(e) => {
                        const newWeapons = [...(scoreData.sung.weapons || [])];
                        newWeapons[idx] = e.target.value;
                        handleSungUpdate('weapons', newWeapons);
                      }}
                    >
                      <option value="">{t('pod.weapons.weapon')} {idx + 1}</option>
                      {weaponData.map(weapon => (
                        <option key={weapon.name} value={weapon.name}>
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
                      className="w-12 bg-gray-800/80 text-white text-xs p-2 rounded text-center border border-gray-700 focus:border-red-500"
                    />
                    <span className="text-yellow-400 text-sm">⭐</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Compétences */}
            <div>
              <h4 className="text-xs font-semibold text-red-300 mb-2 uppercase">{t('pod.skills.title')} (6)</h4>
              <div className="grid grid-cols-2 gap-2">
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const skill = scoreData.sung.skills?.[idx];
                  const skillsList = idx < 2 ? basicSkills :
                    idx === 2 ? ultimateSkills :
                      idx === 3 ? deathSkills :
                        idx === 4 ? collapseSkills :
                          shadowStepSkill;

                  return (
                    <div key={idx} className="flex gap-1">
                      <select
                        className="flex-1 bg-gray-800/80 text-white text-xs p-1.5 rounded border border-gray-700 focus:border-red-500"
                        value={skill?.name || ''}
                        onChange={(e) => {
                          const selectedSkill = skillsList.find(s => s.name === e.target.value);
                          handleSkillSelect(idx, selectedSkill?.name, skill?.rarity || 'mythic');
                        }}
                      >
                        <option value="">{t('pod.skills.skill', { index: idx + 1 })}</option>
                        {skillsList.map(s => (
                          <option key={s.name} value={s.name}>
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
                        <option value="rare">{t('pod.skills.rarity.rare')}</option>
                        <option value="epic">{t('pod.skills.rarity.epic')}</option>
                        <option value="legendary">{t('pod.skills.rarity.legendary')}</option>
                        <option value="mythic">{t('pod.skills.rarity.mythic')}</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bénédictions */}
            <div>
              <h4 className="text-xs font-semibold text-red-300 mb-2 uppercase">{t('pod.blessings.title')} (8)</h4>
              <div className="grid grid-cols-4 gap-1">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
                  const blessing = scoreData.sung.blessings?.[idx];
                  const isDefensive = idx >= 4;
                  const blessings = blessingStonesData.filter(b => b.type === (isDefensive ? 'defensive' : 'offensive'));

                  const blessingName = typeof blessing === 'string' ? blessing : blessing?.name;
                  const blessingRarity = typeof blessing === 'string' ? 'mythic' : (blessing?.rarity || 'mythic');

                  const getBlessingBorderClass = () => {
                    if (!blessingName) return 'border-gray-700';
                    return rarityColors[blessingRarity].split(' ')[0];
                  };

                  return (
                    <select
                      key={idx}
                      className={`bg-gray-800/80 text-white text-xs p-1.5 rounded border ${getBlessingBorderClass()} focus:border-red-500`}
                      value={blessingName || ''}
                      onChange={(e) => {
                        const newBlessings = [...(scoreData.sung.blessings || [])];
                        const selectedBlessing = blessingStonesData.find(b => b.name === e.target.value);
                        newBlessings[idx] = {
                          name: e.target.value,
                          type: selectedBlessing?.type || (isDefensive ? 'defensive' : 'offensive'),
                          rarity: blessingRarity
                        };
                        handleSungUpdate('blessings', newBlessings);
                      }}
                    >
                      <option value="">
                        {isDefensive ? t('pod.blessings.defensive') : t('pod.blessings.offensive')}{(idx % 4) + 1}
                      </option>
                      {blessings.map(blessing => (
                        <option key={blessing.name} value={blessing.name}>
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
              <h4 className="text-xs font-semibold text-red-300 mb-2 uppercase">{t('pod.stats.base')}</h4>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { key: 'str', label: t('pod.stats.str') },
                  { key: 'int', label: t('pod.stats.int') },
                  { key: 'vit', label: t('pod.stats.vit') },
                  { key: 'per', label: t('pod.stats.per') },
                  { key: 'agi', label: t('pod.stats.agi') }
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
                      className="w-full bg-gray-800/80 text-white text-xs p-1.5 rounded text-center border border-gray-700 focus:border-red-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Stats finales avec bouton import */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-red-300 uppercase">{t('pod.stats.final')}</h4>
                <img
                  src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754055557/chaelogo_hci0do.png"
                  alt="Import"
                  className="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => importStatsFromBuild('sung')}
                  title={t('pod.stats.import')}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'atk', label: t('pod.stats.atk'), placeholder: sungPreset.expectedStats?.atk },
                  { key: 'tc', label: t('pod.stats.tc'), placeholder: sungPreset.expectedStats?.tc },
                  { key: 'dcc', label: t('pod.stats.dcc'), placeholder: sungPreset.expectedStats?.dcc },
                  { key: 'di', label: t('pod.stats.di'), placeholder: sungPreset.expectedStats?.di },
                  { key: 'defPen', label: t('pod.stats.defPen'), placeholder: sungPreset.expectedStats?.defPen },
                  { key: 'precision', label: t('pod.stats.precision'), placeholder: sungPreset.expectedStats?.precision },
                  { key: 'mpcr', label: t('pod.stats.mpcr'), placeholder: sungPreset.expectedStats?.mpcr },
                  { key: 'mpa', label: t('pod.stats.mpa'), placeholder: sungPreset.expectedStats?.mpa }
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
                      className="w-full bg-gray-800/80 text-white text-xs p-1.5 rounded text-center border border-gray-700 focus:border-red-500"
                      placeholder={placeholder || '0'}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Desktop: Grid Layout - Identique à BDG mais avec bordures rouges
          <div className="grid grid-cols-3 gap-4">
            {/* Col 1: Sets & Armes */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-semibold text-red-300 uppercase">{t('pod.sets.title')}</h4>
                  <label className="text-xs text-gray-400 flex items-center">
                    <input
                      type="checkbox"
                      checked={sungLeftSplit}
                      onChange={(e) => setSungLeftSplit(e.target.checked)}
                      className="mr-1"
                    />
                    {t('pod.sets.split')}
                  </label>
                </div>
                {sungLeftSplit ? (
                  <div className="space-y-1">
                    <div className="grid grid-cols-2 gap-1">
                      <select
                        className="w-full bg-gray-800/80 text-white text-xs p-1 rounded border border-gray-700 focus:border-red-500"
                        value={scoreData.sung.leftSet1 || ''}
                        onChange={(e) => handleSungUpdate('leftSet1', e.target.value)}
                      >
                        <option value="">{t('pod.sets.set1')}</option>
                        {leftArtifacts.map(artifact => (
                          <option key={artifact.set} value={artifact.set}>
                            {artifact.set}
                          </option>
                        ))}
                      </select>
                      <select
                        className="w-full bg-gray-800/80 text-white text-xs p-1 rounded border border-gray-700 focus:border-red-500"
                        value={scoreData.sung.leftSet2 || ''}
                        onChange={(e) => handleSungUpdate('leftSet2', e.target.value)}
                      >
                        <option value="">{t('pod.sets.set2')}</option>
                        {leftArtifacts.map(artifact => (
                          <option key={artifact.set} value={artifact.set}>
                            {artifact.set}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <select
                    className="w-full bg-gray-800/80 text-white text-xs p-1 rounded border border-gray-700 focus:border-red-500"
                    value={scoreData.sung.leftSet || ''}
                    onChange={(e) => handleSungUpdate('leftSet', e.target.value)}
                  >
                    <option value="">{t('pod.sets.left')}</option>
                    {leftArtifacts.map(artifact => (
                      <option key={artifact.set} value={artifact.set}>
                        {artifact.set}
                      </option>
                    ))}
                  </select>
                )}
                <select
                  className="w-full bg-gray-800/80 text-white text-xs p-1 rounded border border-gray-700 focus:border-red-500 mt-1"
                  value={scoreData.sung.rightSet || ''}
                  onChange={(e) => handleSungUpdate('rightSet', e.target.value)}
                >
                  <option value="">{t('pod.sets.right')}</option>
                  {rightArtifacts.map(artifact => (
                    <option key={artifact.set} value={artifact.set}>
                      {artifact.set}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-red-300 mb-1 uppercase">{t('pod.weapons.title')}</h4>
                {[0, 1].map((idx) => (
                  <div key={idx} className="flex items-center gap-1 mb-1">
                    <select
                      className="flex-1 bg-gray-800/80 text-white text-xs p-1 rounded border border-gray-700 focus:border-red-500"
                      value={scoreData.sung.weapons?.[idx] || ''}
                      onChange={(e) => {
                        const newWeapons = [...(scoreData.sung.weapons || [])];
                        newWeapons[idx] = e.target.value;
                        handleSungUpdate('weapons', newWeapons);
                      }}
                    >
                      <option value="">{t('pod.weapons.weapon')} {idx + 1}</option>
                      {weaponData.map(weapon => (
                        <option key={weapon.name} value={weapon.name}>
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
                      className="w-10 bg-gray-800/80 text-white text-xs p-1 rounded text-center border border-gray-700 focus:border-red-500"
                    />
                    <span className="text-yellow-400 text-xs">⭐</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 2: Skills & Blessings - Identique à BDG */}
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-semibold text-red-300 mb-1 uppercase">{t('pod.skills.title')} (6)</h4>
                <div className="grid grid-cols-2 gap-1">
                  {[0, 1, 2, 3, 4, 5].map((idx) => {
                    const skill = scoreData.sung.skills?.[idx];
                    const skillsList = idx < 2 ? basicSkills :
                      idx === 2 ? ultimateSkills :
                        idx === 3 ? deathSkills :
                          idx === 4 ? collapseSkills :
                            shadowStepSkill;

                    return (
                      <div key={idx} className="flex gap-1">
                        <select
                          className="flex-1 bg-gray-800/80 text-white text-xs p-1 rounded border border-gray-700 focus:border-red-500"
                          value={skill?.name || ''}
                          onChange={(e) => {
                            const selectedSkill = skillsList.find(s => s.name === e.target.value);
                            handleSkillSelect(idx, selectedSkill?.name, skill?.rarity || 'mythic');
                          }}
                        >
                          <option value="">{t('pod.skills.skill', { index: idx + 1 })}</option>
                          {skillsList.map(s => (
                            <option key={s.name} value={s.name}>
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
                          <option value="rare">{t('pod.skills.rarity.rare')}</option>
                          <option value="epic">{t('pod.skills.rarity.epic')}</option>
                          <option value="legendary">{t('pod.skills.rarity.legendary')}</option>
                          <option value="mythic">{t('pod.skills.rarity.mythic')}</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-red-300 mb-1 uppercase">{t('pod.blessings.title')} (8)</h4>
                <div className="grid grid-cols-4 gap-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
                    const blessing = scoreData.sung.blessings?.[idx];
                    const isDefensive = idx >= 4;
                    const blessings = blessingStonesData.filter(b => b.type === (isDefensive ? 'defensive' : 'offensive'));

                    const blessingName = typeof blessing === 'string' ? blessing : blessing?.name;
                    const blessingRarity = typeof blessing === 'string' ? 'mythic' : (blessing?.rarity || 'mythic');

                    const getBlessingBorderClass = () => {
                      if (!blessingName) return 'border-gray-700';
                      return rarityColors[blessingRarity].split(' ')[0];
                    };

                    return (
                      <select
                        key={idx}
                        className={`bg-gray-800/80 text-white text-xs p-1 rounded border ${getBlessingBorderClass()} focus:border-red-500`}
                        value={blessingName || ''}
                        onChange={(e) => {
                          const newBlessings = [...(scoreData.sung.blessings || [])];
                          const selectedBlessing = blessingStonesData.find(b => b.name === e.target.value);
                          newBlessings[idx] = {
                            name: e.target.value,
                            type: selectedBlessing?.type || (isDefensive ? 'defensive' : 'offensive'),
                            rarity: blessingRarity
                          };
                          handleSungUpdate('blessings', newBlessings);
                        }}
                      >
                        <option value="">
                          {isDefensive ? t('pod.blessings.defensive') : t('pod.blessings.offensive')}{(idx % 4) + 1}
                        </option>
                        {blessings.map(blessing => (
                          <option key={blessing.name} value={blessing.name}>
                            {blessing.name}
                          </option>
                        ))}
                      </select>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-red-300 mb-1 uppercase">{t('pod.stats.base')}</h4>
                <div className="grid grid-cols-5 gap-1">
                  {[
                    { key: 'str', label: t('pod.stats.str') },
                    { key: 'int', label: t('pod.stats.int') },
                    { key: 'vit', label: t('pod.stats.vit') },
                    { key: 'per', label: t('pod.stats.per') },
                    { key: 'agi', label: t('pod.stats.agi') }
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
                        className="w-full bg-gray-800/80 text-white text-xs p-1 rounded text-center border border-gray-700 focus:border-red-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Col 3: Stats finales avec bouton import */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-semibold text-red-300 uppercase">{t('pod.stats.final')}</h4>
                <img
                  src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754055557/chaelogo_hci0do.png"
                  alt="Import"
                  className="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => importStatsFromBuild('sung')}
                  title={t('pod.stats.import')}
                />
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                {[
                  { key: 'atk', label: t('pod.stats.atk'), placeholder: sungPreset.expectedStats?.atk },
                  { key: 'tc', label: t('pod.stats.tc'), placeholder: sungPreset.expectedStats?.tc },
                  { key: 'dcc', label: t('pod.stats.dcc'), placeholder: sungPreset.expectedStats?.dcc },
                  { key: 'di', label: t('pod.stats.di'), placeholder: sungPreset.expectedStats?.di },
                  { key: 'defPen', label: t('pod.stats.defPen'), placeholder: sungPreset.expectedStats?.defPen },
                  { key: 'precision', label: t('pod.stats.precision'), placeholder: sungPreset.expectedStats?.precision },
                  { key: 'mpcr', label: t('pod.stats.mpcr'), placeholder: sungPreset.expectedStats?.mpcr },
                  { key: 'mpa', label: t('pod.stats.mpa'), placeholder: sungPreset.expectedStats?.mpa }
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
                      className="w-full bg-gray-800/80 text-white text-xs p-1 rounded text-center border border-gray-700 focus:border-red-500"
                      placeholder={placeholder || '0'}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hunters Section - SEULEMENT 3 HUNTERS pour POD */}
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 rounded-xl p-3 sm:p-4 border border-red-700 shadow-xl">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center uppercase">
          <span className="text-red-400 mr-2">💥</span>
          {t('pod.hunters.title')} <span className="text-sm text-gray-400 ml-2">(3)</span>
        </h3>
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {[0, 1, 2].map((idx) => {
            const hunter = scoreData.hunters[idx];
            const character = hunter?.character || getCharacterData(hunter?.id);
            const hunterPreset = preset?.hunters?.[idx];

            return (
              <div key={idx} className="bg-black/30 rounded-lg p-3 border border-red-500/30">
                {/* Hunter Selection */}
                <div
                  className="flex items-center mb-2 cursor-pointer hover:bg-red-900/20 p-1 rounded transition-all"
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
                        <p className="font-medium text-white text-sm">
                          {character.name}
                        </p>
                        <p className="text-xs text-gray-400">{character.class}</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 text-gray-500 text-sm">
                      {t('pod.hunters.select')}
                    </div>
                  )}
                  <span className="text-red-400 text-xs">▼</span>
                </div>

                {/* Hunter Sets & Stars */}
                <div className="space-y-2 mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[9px] text-gray-400 flex items-center">
                      <input
                        type="checkbox"
                        checked={hunterLeftSplits[idx] || false}
                        onChange={(e) => {
                          setHunterLeftSplits({ ...hunterLeftSplits, [idx]: e.target.checked });
                          if (!e.target.checked) {
                            handleHunterUpdate(idx, 'leftSet1', '');
                            handleHunterUpdate(idx, 'leftSet2', '');
                          }
                        }}
                        className="mr-1"
                      />
                      {t('pod.sets.split')}
                    </label>
                  </div>

                  {hunterLeftSplits[idx] ? (
                    <div className="grid grid-cols-2 gap-1">
                      <select
                        className="bg-gray-800/80 text-white text-xs p-1.5 rounded border border-gray-700 focus:border-red-500"
                        value={hunter?.leftSet1 || ''}
                        onChange={(e) => handleHunterUpdate(idx, 'leftSet1', e.target.value)}
                      >
                        <option value="">{t('pod.sets.set1')}</option>
                        {leftArtifacts.map(a => (
                          <option key={a.set} value={a.set}>{a.set}</option>
                        ))}
                      </select>
                      <select
                        className="bg-gray-800/80 text-white text-xs p-1.5 rounded border border-gray-700 focus:border-red-500"
                        value={hunter?.leftSet2 || ''}
                        onChange={(e) => handleHunterUpdate(idx, 'leftSet2', e.target.value)}
                      >
                        <option value="">{t('pod.sets.set2')}</option>
                        {leftArtifacts.map(a => (
                          <option key={a.set} value={a.set}>{a.set}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-1">
                      <select
                        className="bg-gray-800/80 text-white text-xs p-1.5 rounded border border-gray-700 focus:border-red-500"
                        value={hunter?.leftSet || ''}
                        onChange={(e) => handleHunterUpdate(idx, 'leftSet', e.target.value)}
                      >
                        <option value="">{t('pod.sets.leftShort')}</option>
                        {leftArtifacts.map(a => (
                          <option key={a.set} value={a.set}>{a.set}</option>
                        ))}
                      </select>
                      <select
                        className="bg-gray-800/80 text-white text-xs p-1.5 rounded border border-gray-700 focus:border-red-500"
                        value={hunter?.rightSet || ''}
                        onChange={(e) => handleHunterUpdate(idx, 'rightSet', e.target.value)}
                      >
                        <option value="">{t('pod.sets.rightShort')}</option>
                        {rightArtifacts.map(a => (
                          <option key={a.set} value={a.set}>{a.set}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Set Droit séparé quand en mode 2+2 */}
                  {hunterLeftSplits[idx] && (
                    <select
                      className="w-full bg-gray-800/80 text-white text-xs p-1.5 rounded border border-gray-700 focus:border-red-500 mt-1"
                      value={hunter?.rightSet || ''}
                      onChange={(e) => handleHunterUpdate(idx, 'rightSet', e.target.value)}
                    >
                      <option value="">{t('pod.sets.right')}</option>
                      {rightArtifacts.map(a => (
                        <option key={a.set} value={a.set}>{a.set}</option>
                      ))}
                    </select>
                  )}

                  <div className="grid grid-cols-2 gap-1">
                    <div className="flex items-center gap-1">
                      <label className="text-[9px] text-gray-400">{t('pod.hunters.stars.hunter')}:</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={hunter?.stars || 0}
                        onChange={(e) => handleHunterUpdate(idx, 'stars', parseInt(e.target.value) || 0)}
                        className="flex-1 bg-gray-800/80 text-white text-xs p-1.5 rounded text-center border border-gray-700 focus:border-red-500"
                      />
                      <span className="text-yellow-400 text-xs">⭐</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <label className="text-[9px] text-gray-400">{t('pod.hunters.stars.weapon')}:</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={hunter?.weaponStars || 0}
                        onChange={(e) => handleHunterUpdate(idx, 'weaponStars', parseInt(e.target.value) || 0)}
                        className="flex-1 bg-gray-800/80 text-white text-xs p-1.5 rounded text-center border border-gray-700 focus:border-red-500"
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
                    className="w-full bg-gray-800/80 text-white text-sm p-1.5 rounded mb-1 border border-gray-700 focus:border-red-500"
                    placeholder={hunterPreset?.expectedDamage || '0'}
                  />

                  {/* Barre de progression pour POD */}
                  {character && hunter?.damage > 0 && (
                    <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`absolute left-0 top-0 h-full transition-all duration-300 ${getDamageProgressColor(
                          hunter.damage,
                          character.element?.toUpperCase() === scoreData.element ? 15000000000 : 10000000000
                        )}`}
                        style={{
                          width: `${Math.min(
                            (hunter.damage / (character.element?.toUpperCase() === scoreData.element ? 15000000000 : 10000000000)) * 100,
                            120
                          )}%`
                        }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white font-medium">
                        {Math.round((hunter.damage / (character.element?.toUpperCase() === scoreData.element ? 15000000000 : 10000000000)) * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Final Stats avec bouton import */}
                <div className="mt-2">
                  {character && (
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[9px] text-gray-500">{t('pod.stats.final')}</label>
                      <img
                        src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754055837/beruProst_ymvwos.png"
                        alt="Import"
                        className="w-7 h-7 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => importStatsFromBuild('hunter', idx)}
                        title={t('pod.stats.import')}
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {(() => {
                      let statsToShow;

                      if (character?.importantStats) {
                        statsToShow = character.importantStats;
                      } else if (hunter?.finalStats && Object.keys(hunter.finalStats).length > 0) {
                        statsToShow = Object.keys(hunter.finalStats);
                      } else {
                        statsToShow = ['atk', 'tc', 'dcc', 'defPen'];
                      }

                      const labelMap = {
                        'def': t('pod.stats.def'),
                        'hp': t('pod.stats.hp'),
                        'atk': t('pod.stats.atk'),
                        'tc': t('pod.stats.tc'),
                        'dcc': t('pod.stats.dcc'),
                        'defPen': t('pod.stats.defPen'),
                        'di': t('pod.stats.di'),
                        'mpcr': t('pod.stats.mpcr'),
                        'mpa': t('pod.stats.mpa')
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
                              className="w-full bg-gray-800/80 text-white text-xs p-1.5 rounded text-center border border-gray-700 focus:border-red-500"
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
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 rounded-xl p-3 border border-red-700 shadow-xl flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold text-white uppercase">{t('pod.rageCount')}</h3>
        <div className="flex items-center gap-4">
          <div className="text-xl sm:text-2xl font-bold text-red-400">
            RC {scoreData.rageCount || 0}
          </div>
          <span className="text-xs sm:text-sm text-gray-400">
            {t('pod.autoCalculated')}
          </span>
        </div>
      </div>

      {/* Shadows Section - SEULEMENT 3 SHADOWS */}
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 rounded-xl p-3 sm:p-4 border border-red-700 shadow-xl">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center uppercase">
          <span className="text-red-400 mr-2">🌑</span>
          {t('pod.shadows.title')} <span className="text-sm text-gray-400 ml-2">(3)</span>
        </h3>
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {[0, 1, 2].map((idx) => {
            const shadow = displayShadows[idx];
            const shadowInfo = shadow ? shadowData.find(s => s.name === shadow) : null;

            return (
              <div key={idx} className="bg-black/30 rounded-lg p-3 border border-red-500/30">
                <div className="flex flex-col items-center">
                  {shadowInfo ? (
                    <>
                      <img
                        src={shadowInfo.src}
                        alt={shadowInfo.name}
                        className="w-16 h-16 rounded-full mb-2 border-2 border-purple-500"
                      />
                      <p className="font-medium text-white text-sm">{shadowInfo.name}</p>
                    </>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mb-2">
                      <span className="text-gray-500 text-2xl">?</span>
                    </div>
                  )}

                  <select
                    className="mt-2 w-full bg-gray-800/80 text-white text-xs p-1.5 rounded border border-gray-700 focus:border-red-500"
                    value={shadow || ''}
                    onChange={(e) => {
                      const newShadows = [...(scoreData.shadows || [])];
                      const selectedShadow = e.target.value;

                      // Vérifier si cette shadow est déjà sélectionnée ailleurs
                      if (selectedShadow && newShadows.includes(selectedShadow)) {
                        const existingIndex = newShadows.indexOf(selectedShadow);
                        // Échanger les positions
                        const temp = newShadows[idx];
                        newShadows[idx] = selectedShadow;
                        newShadows[existingIndex] = temp;
                        showTankMessage(t('pod.messages.shadowExchanged', { name: selectedShadow }), true, 'beru');
                      } else {
                        newShadows[idx] = selectedShadow;
                      }

                      onUpdate({
                        ...scoreData,
                        shadows: newShadows
                      });
                    }}
                  >
                    <option value="">{t('pod.shadows.select')}</option>
                    {shadowData.map(s => (
                      <option key={s.name} value={s.name} disabled={scoreData.shadows?.includes(s.name) && scoreData.shadows[idx] !== s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hunter Picker Modal - Mobile responsive */}
      {showHunterPicker !== null && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowHunterPicker(null)}>
          <div className={`bg-gray-900 rounded-xl p-4 ${isMobile ? 'w-full max-h-[80vh]' : 'max-w-3xl max-h-[70vh]'} overflow-y-auto border border-red-500/50`} onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-3 uppercase">{t('pod.hunters.choose')}</h3>
            <div className={`grid gap-3 ${isMobile ? 'grid-cols-3' : 'grid-cols-4 md:grid-cols-6'}`}>
              {charactersArray
                .filter(c => c.grade === 'SSR' || c.grade === 'SR')
                .sort((a, b) => {
                  const posA = scoreData.hunters.findIndex(h => {
                    if (!h || !h.id) return false;

                    if (h.id === "Lee" && a.name === "Lee Bora") return true;
                    if (h.id === "Mirei" && a.name === "Amamiya Mirei") return true;
                    if (h.id === "Lee" && a.name === "Lee Johee") return false;

                    return h.id === a.name ||
                      h.id === a.name.split(' ')[0] ||
                      h.id.toLowerCase() === a.name.toLowerCase() ||
                      h.id.toLowerCase() === a.name.split(' ')[0].toLowerCase();
                  });

                  const posB = scoreData.hunters.findIndex(h => {
                    if (!h || !h.id) return false;

                    if (h.id === "Lee" && b.name === "Lee Bora") return true;
                    if (h.id === "Mirei" && b.name === "Amamiya Mirei") return true;
                    if (h.id === "Lee" && b.name === "Lee Johee") return false;

                    return h.id === b.name ||
                      h.id === b.name.split(' ')[0] ||
                      h.id.toLowerCase() === b.name.toLowerCase() ||
                      h.id.toLowerCase() === b.name.split(' ')[0].toLowerCase();
                  });

                  if (posA !== -1 && posB === -1) return -1;
                  if (posA === -1 && posB !== -1) return 1;
                  if (posA !== -1 && posB !== -1) return posA - posB;

                  const isElementA = a.element?.toUpperCase() === scoreData.element;
                  const isElementB = b.element?.toUpperCase() === scoreData.element;
                  if (isElementA && !isElementB) return -1;
                  if (!isElementA && isElementB) return 1;

                  return a.name.localeCompare(b.name);
                })
                .map(character => {
                  const isCurrentElement = character.element?.toUpperCase() === scoreData.element;
                  const currentPosition = scoreData.hunters.findIndex(h => {
                    if (!h || !h.id) return false;

                    if (h.id === "Lee") {
                      return character.name === "Lee Bora";
                    }

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
                        ? 'hover:bg-red-900/20 hover:scale-105 border-red-500 bg-red-900/10'
                        : 'hover:bg-red-900/20 hover:scale-105 border-transparent hover:border-red-500'
                        }`}
                    >
                      <img
                        src={character.icon}
                        alt={character.name}
                        className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-full mx-auto mb-1`}
                      />
                      <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-center text-white`}>{character.name}</p>
                      <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-center ${isCurrentElement ? 'text-red-400 font-bold' : 'text-gray-400'}`}>
                        {character.class}
                      </p>
                      {currentPosition !== -1 && currentPosition < 3 && (
                        <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-center text-yellow-400 mt-1`}>
                          {t('pod.hunters.slot', { slot: currentPosition + 1 })}
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

export default PODEditMode;