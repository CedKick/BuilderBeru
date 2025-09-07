// src/components/ScoreCard/PODViewMode.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { weaponData, runesData, blessingStonesData, shadowData } from '../../data/itemData';
import { characters } from '../../data/characters';
import '../../i18n/i18n';
import { statConversions, normalizeStatValue } from '../../utils/statConversions';

const PODViewMode = ({ preset, scoreData, showTankMessage, isMobile }) => {
  const { t } = useTranslation();

  const getSungMaxDamagePOD = () => {
    // POD a des limites différentes
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

  // Vérifications de sécurité
  if (!scoreData) {
    return <div className="text-white">{t('pod.noData')}</div>;
  }

  // Fonction améliorée pour récupérer le character depuis l'objet characters
  const getCharacterData = (hunterId) => {
    if (!hunterId) return null;

    let character = characters[hunterId] ||
      characters[hunterId.toLowerCase()] ||
      null;

    if (!character) {
      for (const [key, char] of Object.entries(characters)) {
        if (char.name === hunterId ||
          char.name.toLowerCase() === hunterId.toLowerCase() ||
          char.name.split(' ')[0] === hunterId ||
          char.name.split(' ')[0].toLowerCase() === hunterId.toLowerCase()) {
          character = char;
          break;
        }
      }
    }

    return character;
  };

  const formatStatWithPercentage = (value, type) => {
    if (!value) return '---';

    if (statConversions[type]) {
      const statValue = normalizeStatValue(value, type);
      const percent = statConversions[type].toPercent(statValue);
      return `${statValue.toLocaleString()} (${percent}%)`;
    }

    const stringValue = value.toString();
    return stringValue.includes(',') ? value : value.toLocaleString();
  };

 // Initialiser les shadows depuis le preset si elles ne sont pas dans scoreData
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

  const calculateContribution = (damage) => {
    const total = scoreData.totalScore || 1;
    // Initialiser les shadows depuis le preset si nécessaire


    return ((damage / total) * 100).toFixed(1);
  };

  const rarityColors = {
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-yellow-400',
    mythic: 'text-red-400'
  };

  return (
    <div className="space-y-4">
      {/* Sung Jin-Woo Section - Version responsive avec bordures rouges */}
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 rounded-xl p-3 sm:p-4 border border-red-700 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center uppercase">
            <span className="text-red-400 mr-2">⚔️</span>
            Sung JinWoo
          </h3>
          <div className="text-right">
            <p className="text-xl sm:text-2xl font-bold text-red-400">
              {scoreData.sung?.damage ? scoreData.sung.damage.toLocaleString() : '0'}
            </p>
            <p className="text-xs text-gray-400">
              {calculateContribution(scoreData.sung?.damage || 0)}% {t('pod.contribution')}
            </p>
            {scoreData.sung?.damage > 0 && (
              <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden mt-1">
                <div
                  className={`absolute left-0 top-0 h-full transition-all duration-300 ${getDamageProgressColor(
                    scoreData.sung.damage,
                    getSungMaxDamagePOD()
                  )}`}
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

        {/* Mobile: Vertical Layout */}
        {isMobile ? (
          <div className="space-y-4">
            {/* Sets */}
            <div>
              <h4 className="text-xs font-semibold text-red-300 mb-2 uppercase">{t('pod.sets.title')}</h4>
              <div className="text-xs space-y-1">
                <div>
                  <span className="text-gray-500">{t('pod.sets.left')}:</span>
                  <div className="text-white">
                    {scoreData.sung?.leftSet1 && scoreData.sung?.leftSet2
                      ? `${scoreData.sung.leftSet1} + ${scoreData.sung.leftSet2}`
                      : scoreData.sung?.leftSet || '---'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">{t('pod.sets.right')}:</span>
                  <div className="text-white">{scoreData.sung?.rightSet || '---'}</div>
                </div>
              </div>
            </div>

            {/* Armes */}
            <div>
              <h4 className="text-xs font-semibold text-red-300 mb-2 uppercase">{t('pod.weapons.title')}</h4>
              <div className="flex gap-2">
                {[0, 1].map((idx) => {
                  const weaponName = scoreData.sung?.weapons?.[idx];
                  const weapon = weaponData.find(w => w.name === weaponName);
                  return (
                    <div key={idx} className="flex items-center gap-1">
                      <div className="border border-gray-600 rounded overflow-hidden">
                        {weapon ? (
                          <img
                            src={weapon.src}
                            alt={weapon.name}
                            className="w-10 h-10 object-cover"
                            title={weapon.name}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-500">?</span>
                          </div>
                        )}
                      </div>
                      <span className="text-yellow-400 text-sm font-bold">
                        {scoreData.sung?.weaponStars?.[idx] || 0}⭐
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Compétences */}
            <div>
              <h4 className="text-xs font-semibold text-red-300 mb-2 uppercase">{t('pod.skills.title')} (6)</h4>
              <div className="grid grid-cols-6 gap-1">
                {scoreData.sung?.skills?.map((skill, idx) => {
                  if (!skill) return (
                    <div key={idx} className="w-10 h-10 bg-gray-800 border border-gray-700 rounded" />
                  );

                  const skillData = !skill ? null :
                    typeof skill === 'string' ? runesData.find(r => r.name === skill) :
                      skill.src ? skill :
                        skill.name ? runesData.find(r => r.name === skill.name) :
                          null;

                  const rarityBorder = {
                    rare: 'border-blue-500',
                    epic: 'border-purple-500',
                    legendary: 'border-yellow-500',
                    mythic: 'border-red-500'
                  };

                  return (
                    <div key={idx} className={`border-2 rounded overflow-hidden ${rarityBorder[skill.rarity || 'mythic']}`}>
                      {skillData ? (
                        <img
                          src={skillData.src}
                          alt={skillData.name}
                          className="w-10 h-10 object-cover"
                          title={skillData.name}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-700 flex items-center justify-center">
                          <span className="text-xs text-gray-500">?</span>
                        </div>
                      )}
                    </div>
                  );
                })}
                {Array(6 - (scoreData.sung?.skills?.length || 0)).fill(null).map((_, idx) => (
                  <div key={`empty-${idx}`} className="w-10 h-10 bg-gray-800 border border-gray-700 rounded" />
                ))}
              </div>
            </div>

            {/* Bénédictions */}
            <div>
              <h4 className="text-xs font-semibold text-red-300 mb-2 uppercase">{t('pod.blessings.title')} (8)</h4>
              <div className="grid grid-cols-4 gap-1">
                {[...Array(8)].map((_, idx) => {
                  const blessing = scoreData.sung?.blessings?.[idx];
                  if (!blessing) return (
                    <div key={idx} className="w-10 h-10 bg-gray-800 border border-gray-700 rounded" />
                  );

                  const blessingName = typeof blessing === 'string' ? blessing : blessing.name;
                  const blessingData = blessingStonesData.find(b => b.name === blessingName);
                  const borderColor = idx < 4 ? 'border-orange-500' : 'border-blue-500';

                  return (
                    <div key={idx} className={`border-2 ${borderColor} rounded overflow-hidden`}>
                      {blessingData ? (
                        <img
                          src={blessingData.src}
                          alt={blessingData.name}
                          className="w-10 h-10 object-cover"
                          title={blessingData.name}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-700 flex items-center justify-center">
                          <span className="text-xs text-gray-500">?</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats de base */}
            <div>
              <h4 className="text-xs font-semibold text-red-300 mb-2 uppercase">{t('pod.stats.base')}</h4>
              <div className="flex gap-3 text-xs flex-wrap">
                {Object.entries(scoreData.sung?.baseStats || {}).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-gray-500 uppercase">{t(`pod.stats.${key}`)}:</span>
                    <span className="text-white ml-1 font-bold">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats finales */}
            <div>
              <h4 className="text-xs font-semibold text-red-300 mb-2 uppercase">{t('pod.stats.final')}</h4>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                {[
                  { key: 'atk' },
                  { key: 'tc' },
                  { key: 'dcc' },
                  { key: 'di' },
                  { key: 'defPen' },
                  { key: 'precision' },
                  { key: 'mpcr' },
                  { key: 'mpa' }
                ].map(({ key }) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-500">{t(`pod.stats.${key}`)}:</span>
                    <span className="text-white text-right">
                      {scoreData.sung?.finalStats?.[key] ?
                        formatStatWithPercentage(scoreData.sung.finalStats[key], key) :
                        <span className="text-gray-600">{preset?.sung?.expectedStats?.[key] || '---'}</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Desktop: Grid Layout
          <div className="grid grid-cols-3 gap-4">
            {/* Col 1: Sets & Armes */}
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-semibold text-red-300 mb-1 uppercase">{t('pod.sets.title')}</h4>
                <div className="text-xs space-y-1">
                  <div>
                    <span className="text-gray-500">{t('pod.sets.left')}:</span>
                    <span className="text-white ml-1">
                      {scoreData.sung?.leftSet1 && scoreData.sung?.leftSet2
                        ? `${scoreData.sung.leftSet1} + ${scoreData.sung.leftSet2}`
                        : scoreData.sung?.leftSet || '---'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('pod.sets.right')}:</span>
                    <span className="text-white ml-1">{scoreData.sung?.rightSet || '---'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-red-300 mb-1 uppercase">{t('pod.weapons.title')}</h4>
                <div className="flex gap-1">
                  {[0, 1].map((idx) => {
                    const weaponName = scoreData.sung?.weapons?.[idx];
                    const weapon = weaponData.find(w => w.name === weaponName);
                    return (
                      <div key={idx} className="flex items-center gap-1">
                        <div className="border border-gray-600 rounded overflow-hidden">
                          {weapon ? (
                            <img
                              src={weapon.src}
                              alt={weapon.name}
                              className="w-10 h-10 object-cover"
                              title={weapon.name}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-700 flex items-center justify-center">
                              <span className="text-gray-500">?</span>
                            </div>
                          )}
                        </div>
                        <span className="text-yellow-400 text-sm font-bold">
                          {scoreData.sung?.weaponStars?.[idx] || 0}⭐
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Col 2: Skills & Blessings avec icônes */}
            <div className="space-y-2">
              <div>
                <h4 className="text-xs font-semibold text-red-300 mb-1 uppercase">{t('pod.skills.title')}</h4>
                <div className="flex gap-0.5">
                  {scoreData.sung?.skills?.map((skill, idx) => {
                    if (!skill) return (
                      <div key={idx} className="w-10 h-10 bg-gray-800 border border-gray-700 rounded" />
                    );

                    const skillData = !skill ? null :
                                        typeof skill === 'string' ? runesData.find(r => r.name === skill) :
                                          skill.src ? skill :
                                            skill.name ? runesData.find(r => r.name === skill.name) :
                                              null;

                    const rarityBorder = {
                      rare: 'border-blue-500',
                      epic: 'border-purple-500',
                      legendary: 'border-yellow-500',
                      mythic: 'border-red-500'
                    };

                    return (
                      <div key={idx} className={`border-2 rounded overflow-hidden ${rarityBorder[skill.rarity || 'mythic']}`}>
                        {skillData ? (
                          <img
                            src={skillData.src}
                            alt={skillData.name}
                            className="w-10 h-10 object-cover"
                            title={skillData.name}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-700 flex items-center justify-center">
                            <span className="text-xs text-gray-500">?</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {Array(6 - (scoreData.sung?.skills?.length || 0)).fill(null).map((_, idx) => (
                    <div key={`empty-${idx}`} className="w-10 h-10 bg-gray-800 border border-gray-700 rounded" />
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-red-300 mb-1 uppercase">{t('pod.blessings.title')}</h4>
                <div className="flex gap-0.5">
                  {[...Array(8)].map((_, idx) => {
                    const blessing = scoreData.sung?.blessings?.[idx];
                    if (!blessing) return (
                      <div key={idx} className="w-10 h-10 bg-gray-800 border border-gray-700 rounded" />
                    );

                    const blessingName = typeof blessing === 'string' ? blessing : blessing.name;
                    const blessingData = blessingStonesData.find(b => b.name === blessingName);
                    const borderColor = idx < 4 ? 'border-orange-500' : 'border-blue-500';

                    return (
                      <div key={idx} className={`border-2 ${borderColor} rounded overflow-hidden`}>
                        {blessingData ? (
                          <img
                            src={blessingData.src}
                            alt={blessingData.name}
                            className="w-10 h-10 object-cover"
                            title={blessingData.name}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-700 flex items-center justify-center">
                            <span className="text-xs text-gray-500">?</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Col 3: Stats */}
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-semibold text-red-300 mb-1 uppercase">{t('pod.stats.base')}</h4>
                <div className="flex gap-2 text-xs">
                  {Object.entries(scoreData.sung?.baseStats || {}).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-gray-500 uppercase">{t(`pod.stats.${key}`)}:</span>
                      <span className="text-white ml-1 font-bold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-red-300 mb-1 uppercase">{t('pod.stats.final')}</h4>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  {[
                    { key: 'atk' },
                    { key: 'tc' },
                    { key: 'dcc' },
                    { key: 'di' },
                    { key: 'defPen' },
                    { key: 'precision' },
                    { key: 'mpcr' },
                    { key: 'mpa' }
                  ].map(({ key }) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-500">{t(`pod.stats.${key}`)}:</span>
                      <span className="text-white">
                        {scoreData.sung?.finalStats?.[key] ?
                          formatStatWithPercentage(scoreData.sung.finalStats[key], key) :
                          <span className="text-gray-600">{preset?.sung?.expectedStats?.[key] || '---'}</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hunters Section - Version responsive - SEULEMENT 3 HUNTERS */}
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 rounded-xl p-3 sm:p-4 border border-red-700 shadow-xl">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center uppercase">
          <span className="text-red-400 mr-2">💥</span>
          {t('pod.hunters.title')} <span className="text-sm text-gray-400 ml-2">(3)</span>
        </h3>
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {scoreData.hunters?.slice(0, 3).map((hunter, idx) => {
            if (!hunter?.character && !hunter?.id) return (
              <div key={idx} className="bg-black/30 rounded-lg p-3 border border-gray-700/50 opacity-50">
                <p className="text-center text-gray-500 text-sm">{t('pod.hunters.hunter', { index: idx + 1 })}</p>
              </div>
            );

            const character = hunter?.character || getCharacterData(hunter?.id);
            const hunterPreset = preset?.hunters?.[idx];

            return (
              <div key={idx} className="bg-black/30 rounded-lg p-3 border border-red-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {character?.icon && (
                      <img
                        src={character.icon}
                        alt={character.name}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                    )}
                    <div>
                      <p className="font-medium text-white text-sm">
                        {character?.name || hunter.id || `Hunter ${idx + 1}`}
                      </p>
                      <div className="flex items-center text-yellow-400 text-xs">
                        <span className="mr-2">{t('pod.hunters.stars.hunter')}: {hunter.stars || 0} ⭐</span>
                        <span>{t('pod.hunters.stars.weapon')}: {hunter.weaponStars || 0} ⭐</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base sm:text-lg font-bold text-red-400">
                      {hunter.damage ? hunter.damage.toLocaleString() : '0'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {calculateContribution(hunter.damage || 0)}%
                    </p>
                    {character && hunter.damage > 0 && (
                      <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden mt-1">
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
                </div>

                {/* Hunter Sets */}
                <div className="text-xs text-gray-400 mb-2">
                  <div>{t('pod.sets.title')}: {isMobile && hunter.leftSet && hunter.rightSet ? (
                    <>
                      <div className="text-white">{hunter.leftSet} /</div>
                      <div className="text-white">{hunter.rightSet}</div>
                    </>
                  ) : (
                    `${hunter.leftSet || '---'} / ${hunter.rightSet || '---'}`
                  )}</div>
                </div>

                {/* Hunter Stats */}
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {(() => {
                    let statsToShow;

                    if (character?.importantStats) {
                      statsToShow = character.importantStats;
                    } else if (hunter.finalStats && Object.keys(hunter.finalStats).length > 0) {
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
                      const value = hunter.finalStats?.[statKey];
                      const presetValue = hunterPreset?.expectedStats?.[statKey];

                      return (
                        <div key={statKey}>
  <p className="text-gray-500">{label}</p>
  <p className="text-white">
    {value ?
      formatStatWithPercentage(value, statKey) :
      <span className="text-gray-600">
        {presetValue ? formatStatWithPercentage(presetValue, statKey) : '---'}
      </span>}
  </p>
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

      {/* Shadows Section - Version responsive - SEULEMENT 3 SHADOWS */}
<div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 rounded-xl p-3 sm:p-4 border border-red-700 shadow-xl">
  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center uppercase">
    <span className="text-red-400 mr-2">🌑</span>
    {t('pod.shadows.title')} <span className="text-sm text-gray-400 ml-2">(3)</span>
  </h3>
  <div className="grid grid-cols-3 gap-3">
    {[0, 1, 2].map((idx) => {
      const shadow = displayShadows[idx];
      const shadowInfo = shadow ? shadowData.find(s => s.name === shadow) : null;

      return (
        <div key={idx} className="bg-black/30 rounded-lg p-3 border border-red-500/30 flex flex-col items-center">
          {shadowInfo ? (
            <>
              <img
                src={shadowInfo.src}
                alt={shadowInfo.name}
                className="w-16 h-16 rounded-full mb-2 border-2 border-purple-500"
              />
              <p className="font-medium text-white text-sm text-center">{shadowInfo.name}</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mb-2">
                <span className="text-gray-500 text-2xl">?</span>
              </div>
              <p className="text-center text-gray-500 text-sm">{t('pod.shadows.shadow', { index: idx + 1 })}</p>
            </>
          )}
        </div>
      );
    })}
  </div>
</div>
    </div>
  );
};

export default PODViewMode;