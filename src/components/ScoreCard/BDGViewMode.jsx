// src/components/ScoreCard/BDGViewMode.jsx
import React from 'react';
import { weaponData, runesData, blessingStonesData } from '../../data/itemData';
import { characters } from '../../data/characters';
import { statConversions, normalizeStatValue } from '../../utils/statConversions';

const BDGViewMode = ({ preset, scoreData, showTankMessage }) => {
  // Vérifications de sécurité
  if (!scoreData) {
    return <div className="text-white">Aucune donnée à afficher</div>;
  }

  // Fonction améliorée pour récupérer le character depuis l'objet characters
 const getCharacterData = (hunterId) => {
  if (!hunterId) return null;

  // D'abord essayer de trouver par la clé directe
  let character = characters[hunterId] || 
                  characters[hunterId.toLowerCase()] ||
                  null;

  // Si pas trouvé, chercher dans tous les personnages par nom
  if (!character) {
    for (const [key, char] of Object.entries(characters)) {
      // Vérifier si le hunterId correspond au nom du personnage
      if (char.name === hunterId || 
          char.name.toLowerCase() === hunterId.toLowerCase() ||
          char.name.split(' ')[0] === hunterId || // Premier nom seulement
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
    
    // Si c'est un type avec conversion
    if (statConversions[type]) {
      // Normaliser la valeur (convertir en stat brute si c'est un %)
      const statValue = normalizeStatValue(value, type);
      const percent = statConversions[type].toPercent(statValue);
      return `${statValue.toLocaleString()} (${percent}%)`;
    }
    
    // Sinon retourner la valeur telle quelle
    const stringValue = value.toString();
    return stringValue.includes(',') ? value : value.toLocaleString();
  };

  const calculateContribution = (damage) => {
    const total = scoreData.totalScore || 1;
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
      {/* Sung Jin-Woo Section - Version compacte */}
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 rounded-xl p-4 border border-gray-700 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-white flex items-center uppercase">
            <span className="text-purple-400 mr-2">⚔️</span>
            Sung Jin-Woo
          </h3>
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-400">
              {scoreData.sung?.damage ? scoreData.sung.damage.toLocaleString() : '0'}
            </p>
            <p className="text-xs text-gray-400">
              {calculateContribution(scoreData.sung?.damage || 0)}% contribution
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Col 1: Sets & Armes */}
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-semibold text-purple-300 mb-1 uppercase">Sets</h4>
              <div className="text-xs space-y-1">
                <div>
                  <span className="text-gray-500">Gauche:</span>
                  <span className="text-white ml-1">
                    {scoreData.sung?.leftSet1 && scoreData.sung?.leftSet2
                      ? `${scoreData.sung.leftSet1} + ${scoreData.sung.leftSet2}`
                      : scoreData.sung?.leftSet || '---'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Droite:</span>
                  <span className="text-white ml-1">{scoreData.sung?.rightSet || '---'}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-purple-300 mb-1 uppercase">Armes</h4>
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
              <h4 className="text-xs font-semibold text-purple-300 mb-1 uppercase">Compétences</h4>
              <div className="flex gap-0.5">
                {scoreData.sung?.skills?.map((skill, idx) => {
                  if (!skill) return (
                    <div key={idx} className="w-10 h-10 bg-gray-800 border border-gray-700 rounded" />
                  );

                  const skillData = runesData.find(r => r.name === (skill.name || skill));
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
                {/* Remplir les slots vides */}
                {Array(6 - (scoreData.sung?.skills?.length || 0)).fill(null).map((_, idx) => (
                  <div key={`empty-${idx}`} className="w-10 h-10 bg-gray-800 border border-gray-700 rounded" />
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-purple-300 mb-1 uppercase">Bénédictions</h4>
              <div className="flex gap-0.5">
                {[...Array(8)].map((_, idx) => {
                  const blessing = scoreData.sung?.blessings?.[idx];
                  if (!blessing) return (
                    <div key={idx} className="w-10 h-10 bg-gray-800 border border-gray-700 rounded" />
                  );

                  // Gérer l'ancien et le nouveau format
                  const blessingName = typeof blessing === 'string' ? blessing : blessing.name;
                  const blessingData = blessingStonesData.find(b => b.name === blessingName);
                  const borderColor = idx < 4 ? 'border-orange-500' : 'border-blue-500'; // Orange pour offensive, bleu pour défensive

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
              <h4 className="text-xs font-semibold text-purple-300 mb-1 uppercase">Stats de base</h4>
              <div className="flex gap-2 text-xs">
                {Object.entries(scoreData.sung?.baseStats || {}).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-gray-500 uppercase">{key}:</span>
                    <span className="text-white ml-1 font-bold">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-purple-300 mb-1 uppercase">Stats finales</h4>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">ATK:</span>
                  <span className="text-white">
                    {scoreData.sung?.finalStats?.atk ?
                      formatStatWithPercentage(scoreData.sung.finalStats.atk, 'atk') :
                      <span className="text-gray-600">{preset?.sung?.expectedStats?.atk || '---'}</span>}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">TC:</span>
                  <span className="text-white">
                    {scoreData.sung?.finalStats?.tc ?
                      formatStatWithPercentage(scoreData.sung.finalStats.tc, 'tc') :
                      <span className="text-gray-600">{preset?.sung?.expectedStats?.tc || '---'}</span>}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">DCC:</span>
                  <span className="text-white">
                    {scoreData.sung?.finalStats?.dcc ?
                      formatStatWithPercentage(scoreData.sung.finalStats.dcc, 'dcc') :
                      <span className="text-gray-600">{preset?.sung?.expectedStats?.dcc || '---'}</span>}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">DI:</span>
                  <span className="text-white">
                    {scoreData.sung?.finalStats?.di ?
                      formatStatWithPercentage(scoreData.sung.finalStats.di, 'di') :
                      <span className="text-gray-600">{preset?.sung?.expectedStats?.di || '---'}</span>}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">DEF P:</span>
                  <span className="text-white">
                    {scoreData.sung?.finalStats?.defPen ?
                      formatStatWithPercentage(scoreData.sung.finalStats.defPen, 'defPen') :
                      <span className="text-gray-600">{preset?.sung?.expectedStats?.defPen || '---'}</span>}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">PREC:</span>
                  <span className="text-white">
                    {scoreData.sung?.finalStats?.precision ?
                      formatStatWithPercentage(scoreData.sung.finalStats.precision, 'precision') :
                      <span className="text-gray-600">{preset?.sung?.expectedStats?.precision || '---'}</span>}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">MPCR:</span>
                  <span className="text-white">
                    {scoreData.sung?.finalStats?.mpcr ?
                      formatStatWithPercentage(scoreData.sung.finalStats.mpcr, 'mpcr') :
                      <span className="text-gray-600">{preset?.sung?.expectedStats?.mpcr || '---'}</span>}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">MPA:</span>
                  <span className="text-white">
                    {scoreData.sung?.finalStats?.mpa ?
                      formatStatWithPercentage(scoreData.sung.finalStats.mpa, 'mpa') :
                      <span className="text-gray-600">{preset?.sung?.expectedStats?.mpa || '---'}</span>}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hunters Section - Version compacte */}
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 rounded-xl p-4 border border-gray-700 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-3 flex items-center uppercase">
          <span className="text-purple-400 mr-2">👥</span>
          Hunters
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {scoreData.hunters?.map((hunter, idx) => {
            if (!hunter?.character && !hunter?.id) return (
              <div key={idx} className="bg-black/30 rounded-lg p-3 border border-gray-700/50 opacity-50">
                <p className="text-center text-gray-500 text-sm">Hunter {idx + 1}</p>
              </div>
            );

            const character = hunter?.character || getCharacterData(hunter?.id);
            const hunterPreset = preset?.hunters?.[idx];

            return (
              <div key={idx} className="bg-black/30 rounded-lg p-3 border border-purple-500/30">
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
                        <span className="mr-2">H: {hunter.stars || 0} ⭐</span>
                        <span>W: {hunter.weaponStars || 0} ⭐</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-400">
                      {hunter.damage ? hunter.damage.toLocaleString() : '0'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {calculateContribution(hunter.damage || 0)}%
                    </p>
                  </div>
                </div>

                {/* Hunter Sets */}
                <div className="text-xs text-gray-400 mb-1">
                  Sets: {hunter.leftSet || '---'} / {hunter.rightSet || '---'}
                </div>
                
                
{/* Hunter Stats - Avec gestion des importantStats */}
<div className="grid grid-cols-2 gap-1 text-xs">
  {(() => {
    // IMPORTANT: Si pas de character, utiliser les clés des finalStats sauvegardées
    let statsToShow;
    
    if (character?.importantStats) {
      statsToShow = character.importantStats;
    } else if (hunter.finalStats && Object.keys(hunter.finalStats).length > 0) {
      // Utiliser les clés présentes dans finalStats
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
      const value = hunter.finalStats?.[statKey];
      const presetValue = hunterPreset?.expectedStats?.[statKey];

      return (
        <div key={statKey}>
          <p className="text-gray-500">{label}</p>
          <p className="text-white">
            {value ? 
              formatStatWithPercentage(value, statKey) :
              <span className="text-gray-600">{presetValue || '---'}</span>}
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
    </div>
  );
};

export default BDGViewMode;