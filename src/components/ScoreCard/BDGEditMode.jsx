// src/components/ScoreCard/BDGEditMode.jsx
import React, { useState } from 'react';
import { weaponData, runesData, blessingStonesData, artifactData } from '../../data/itemData';
import { characters } from '../../data/characters';

const BDGEditMode = ({ preset, scoreData, onUpdate, showTankMessage }) => {
  const [showHunterPicker, setShowHunterPicker] = useState(null);
  const [sungLeftSplit, setSungLeftSplit] = useState(false);
  
  const sungPreset = preset?.sung || {};
  const huntersPreset = preset?.hunters || [];

  const rarityColors = {
    rare: 'border-blue-500 bg-blue-500/20',
    epic: 'border-purple-500 bg-purple-500/20',
    legendary: 'border-yellow-500 bg-yellow-500/20',
    mythic: 'border-red-500 bg-red-500/20'
  };

  // Filtrer les skills par type
  const basicSkills = runesData.filter(r => r.class === 'basicSkills');
  const collapseSkills = runesData.filter(r => r.class === 'collapse');
  const deathSkills = runesData.filter(r => r.class === 'death');
  const truthDarknessSkills = ['Truth: Mutilate', 'Darkness: Obliteration', 'King\'s Domain'];

  // Filtrer les artifacts par side
  const leftArtifacts = artifactData.filter(a => a.side === 'L');
  const rightArtifacts = artifactData.filter(a => a.side === 'R');

  // Convertir l'objet characters en tableau pour l'affichage
  const charactersArray = Object.values(characters);

  const handleScoreChange = (type, index, value) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    const numValue = cleanValue === '' ? '' : parseInt(cleanValue);
    
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
    newHunters[index] = { 
      ...newHunters[index], 
      id: newHunter.name,
      character: newHunter
    };
    onUpdate({ ...scoreData, hunters: newHunters });
    setShowHunterPicker(null);
  };

  const handleHunterUpdate = (index, field, value) => {
    const newHunters = [...scoreData.hunters];
    newHunters[index] = { ...newHunters[index], [field]: value };
    onUpdate({ ...scoreData, hunters: newHunters });
  };

  const getExpectedStats = (hunterName) => {
    const expectations = {
      'Jinah': { atk: '35k-50k', tc: '7000-9000', dcc: '200-210%' },
      'Goto Ryuji': { atk: '40k-55k', tc: '8000-10000', dcc: '210-220%' },
      'default': { atk: '30k-45k', tc: '6000-8000', dcc: '190-200%' }
    };
    return expectations[hunterName] || expectations.default;
  };

  // Fonction pour récupérer le character depuis l'objet characters
  const getCharacterData = (hunterId) => {
    if (!hunterId) return null;
    // Recherche par nom exact ou nom en minuscules
    return characters[hunterId] || characters[hunterId?.toLowerCase()] || null;
  };

  return (
    <div className="space-y-4">
      {/* Sung Jin-Woo Section - Compact */}
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 rounded-xl p-4 border border-gray-700 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-white flex items-center uppercase">
            <span className="text-purple-400 mr-2">⚔️</span>
            Sung Jin-Woo
          </h3>
          <input
            type="text"
            value={scoreData.sung.damage === '' ? '' : scoreData.sung.damage.toLocaleString()}
            onChange={(e) => handleScoreChange('sung', null, e.target.value)}
            className="w-32 bg-gray-900/80 text-white text-xl p-2 rounded-lg border border-purple-500/30 focus:border-purple-400 focus:outline-none text-right"
            placeholder="0"
          />
        </div>

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
                    >
                      <option value="">Set G1</option>
                      {leftArtifacts.map(artifact => (
                        <option key={artifact.set} value={artifact.set}>
                          {artifact.set.substring(0, 10)}...
                        </option>
                      ))}
                    </select>
                    <select
                      className="w-full bg-gray-800/80 text-white text-xs p-1 rounded border border-gray-700 focus:border-purple-500"
                      value={scoreData.sung.leftSet2 || ''}
                      onChange={(e) => handleSungUpdate('leftSet2', e.target.value)}
                    >
                      <option value="">Set G2</option>
                      {leftArtifacts.map(artifact => (
                        <option key={artifact.set} value={artifact.set}>
                          {artifact.set.substring(0, 10)}...
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
                >
                  <option value="">Set Gauche</option>
                  {leftArtifacts.map(artifact => (
                    <option key={artifact.set} value={artifact.set}>
                      {artifact.set}
                    </option>
                  ))}
                </select>
              )}
              <select
                className="w-full bg-gray-800/80 text-white text-xs p-1 rounded border border-gray-700 focus:border-purple-500 mt-1"
                value={scoreData.sung.rightSet || ''}
                onChange={(e) => handleSungUpdate('rightSet', e.target.value)}
              >
                <option value="">Set Droit</option>
                {rightArtifacts.map(artifact => (
                  <option key={artifact.set} value={artifact.set}>
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
                  >
                    <option value="">Arme {idx + 1}</option>
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
                  const skillsList = idx < 2 ? basicSkills : 
                                   idx === 2 ? truthDarknessSkills :
                                   idx < 5 ? collapseSkills : 
                                   ['Shadow Step'];
                  
                  return (
                    <div key={idx} className="flex gap-1">
                      <select
                        className="flex-1 bg-gray-800/80 text-white text-xs p-1 rounded border border-gray-700 focus:border-purple-500"
                        value={skill?.name || ''}
                        onChange={(e) => {
                          if (idx === 2 || idx === 5) {
                            handleSkillSelect(idx, e.target.value, skill?.rarity || 'mythic');
                          } else {
                            const selectedSkill = skillsList.find(s => s.name === e.target.value);
                            handleSkillSelect(idx, selectedSkill?.name, skill?.rarity || 'mythic');
                          }
                        }}
                      >
                        <option value="">S{idx + 1}</option>
                        {idx === 2 || idx === 5 ? (
                          skillsList.map(skillName => (
                            <option key={skillName} value={skillName}>{skillName.substring(0, 10)}...</option>
                          ))
                        ) : (
                          skillsList.map(s => (
                            <option key={s.name} value={s.name}>{s.name.substring(0, 10)}...</option>
                          ))
                        )}
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
                  const isDefensive = idx >= 4;
                  const blessings = blessingStonesData.filter(b => b.type === (isDefensive ? 'defensive' : 'offensive'));
                  
                  return (
                    <select
                      key={idx}
                      className="bg-gray-800/80 text-white text-xs p-1 rounded border border-gray-700 focus:border-purple-500"
                      value={scoreData.sung.blessings?.[idx] || ''}
                      onChange={(e) => {
                        const newBlessings = [...(scoreData.sung.blessings || [])];
                        newBlessings[idx] = e.target.value;
                        handleSungUpdate('blessings', newBlessings);
                      }}
                    >
                      <option value="">{isDefensive ? 'D' : 'O'}{(idx % 4) + 1}</option>
                      {blessings.map(blessing => (
                        <option key={blessing.name} value={blessing.name}>
                          {blessing.name.substring(0, 8)}...
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

          {/* Col 3: Stats finales */}
          <div>
            <h4 className="text-xs font-semibold text-purple-300 mb-1 uppercase">Stats finales</h4>
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
      </div>

      {/* Hunters Section - Compact Grid */}
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 rounded-xl p-4 border border-gray-700 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-3 flex items-center uppercase">
          <span className="text-purple-400 mr-2">👥</span>
          Hunters
        </h3>
        <div className="grid grid-cols-3 gap-3">
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
                        <p className="font-medium text-white text-sm">{character.name}</p>
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

                {/* Hunter Sets & Stars - Compact */}
                <div className="space-y-1 mb-2">
                  <div className="grid grid-cols-2 gap-1">
                    <select
                      className="bg-gray-800/80 text-white text-xs p-1 rounded border border-gray-700 focus:border-purple-500"
                      value={hunter?.leftSet || ''}
                      onChange={(e) => handleHunterUpdate(idx, 'leftSet', e.target.value)}
                    >
                      <option value="">Set G</option>
                      {leftArtifacts.map(a => (
                        <option key={a.set} value={a.set}>{a.set.substring(0, 8)}...</option>
                      ))}
                    </select>
                    <select
                      className="bg-gray-800/80 text-white text-xs p-1 rounded border border-gray-700 focus:border-purple-500"
                      value={hunter?.rightSet || ''}
                      onChange={(e) => handleHunterUpdate(idx, 'rightSet', e.target.value)}
                    >
                      <option value="">Set D</option>
                      {rightArtifacts.map(a => (
                        <option key={a.set} value={a.set}>{a.set.substring(0, 8)}...</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1">
                    <div className="flex items-center gap-1">
                      <label className="text-[9px] text-gray-400">H:</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={hunter?.stars || 0}
                        onChange={(e) => handleHunterUpdate(idx, 'stars', parseInt(e.target.value) || 0)}
                        className="flex-1 bg-gray-800/80 text-white text-xs p-1 rounded text-center border border-gray-700 focus:border-purple-500"
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
                        className="flex-1 bg-gray-800/80 text-white text-xs p-1 rounded text-center border border-gray-700 focus:border-purple-500"
                      />
                      <span className="text-yellow-400 text-xs">⭐</span>
                    </div>
                  </div>
                </div>

                {/* Damage */}
                <input
                  type="text"
                  value={hunter?.damage === '' ? '' : (hunter?.damage?.toLocaleString() || '')}
                  onChange={(e) => handleScoreChange('hunter', idx, e.target.value)}
                  className="w-full bg-gray-800/80 text-white text-sm p-1 rounded mb-2 border border-gray-700 focus:border-purple-500"
                  placeholder={hunterPreset?.expectedDamage || '0'}
                />

                {/* Final Stats - Avec gestion des importantStats */}
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {(() => {
                    const statsToShow = character?.importantStats || ['atk', 'tc', 'dcc', 'defPen'];
                    
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
                              newHunters[idx] = { 
                                ...newHunters[idx],
                                finalStats: {
                                  ...(newHunters[idx].finalStats || {}),
                                  [statKey]: e.target.value
                                }
                              };
                              onUpdate({ ...scoreData, hunters: newHunters });
                            }}
                            className="w-full bg-gray-800/80 text-white text-xs p-1 rounded text-center border border-gray-700 focus:border-purple-500"
                            placeholder={hunterPreset?.expectedStats?.[statKey] || '0'}
                          />
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rage Count - Inline */}
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 rounded-xl p-3 border border-gray-700 shadow-xl flex items-center justify-between">
        <h3 className="text-lg font-bold text-white uppercase">Rage Count</h3>
        <input
          type="number"
          value={scoreData.rageCount || 0}
          onChange={(e) => onUpdate({ ...scoreData, rageCount: parseInt(e.target.value) || 0 })}
          className="w-24 bg-gray-900/80 text-white p-2 rounded-lg border border-purple-500/30 focus:border-purple-400 focus:outline-none text-center"
          placeholder="0"
          min="0"
          max="200"
        />
      </div>

      {/* Hunter Picker Modal */}
      {showHunterPicker !== null && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowHunterPicker(null)}>
          <div className="bg-gray-900 rounded-xl p-4 max-w-3xl max-h-[70vh] overflow-y-auto border border-purple-500/50" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-3 uppercase">Choisir un Hunter</h3>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {charactersArray.filter(c => c.grade === 'SSR' || c.grade === 'SR').map(character => (
                <div
                  key={character.name}
                  onClick={() => handleHunterChange(showHunterPicker, character)}
                  className="cursor-pointer hover:bg-purple-900/20 p-2 rounded-lg transition-all hover:scale-105 border border-transparent hover:border-purple-500"
                >
                  <img 
                    src={character.icon} 
                    alt={character.name}
                    className="w-12 h-12 rounded-full mx-auto mb-1"
                  />
                  <p className="text-xs text-center text-white">{character.name}</p>
                  <p className="text-xs text-center text-gray-400">{character.class}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BDGEditMode;