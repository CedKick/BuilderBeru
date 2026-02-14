// src/components/ScoreCard/BDGDetailedAnalysisModal.jsx
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const BDGDetailedAnalysisModal = ({ data, onClose, isMobile, t }) => {
  const { currentScore, currentWeek, allAttempts, huntersComparison, currentHunters } = data;
  const [selectedTab, setSelectedTab] = useState('overview');

  // Préparer les données pour le graphique
  const chartData = allAttempts.map(attempt => ({
    week: attempt.week,
    score: attempt.totalScore,
    rageCount: attempt.rageCount
  }));

  // Ajouter le score actuel
  chartData.push({
    week: currentWeek + ' (actuel)',
    score: currentScore,
    rageCount: data.currentRageCount || 0
  });

  // Préparer les données pour le graphique des hunters
  const huntersChartData = huntersComparison?.map(hunter => ({
    name: hunter.name.length > 15 ? hunter.name.substring(0, 15) + '...' : hunter.name,
    current: hunter.currentDamage,
    past: hunter.pastDamage
  })) || [];

  const getStatLabel = (stat) => {
    const labels = {
      atk: 'ATK',
      tc: 'Taux Crit',
      dcc: 'Dégâts Crit',
      defPen: 'Péné Déf',
      di: 'Aug. Dégâts',
      hp: 'HP',
      def: 'DEF',
      mpcr: 'Réd. MP',
      mpa: 'MP',
      precision: 'Précision'
    };
    return labels[stat] || stat.toUpperCase();
  };

  const getProgressColor = (percent) => {
    if (percent > 10) return 'text-green-400';
    if (percent > 0) return 'text-green-300';
    if (percent === 0) return 'text-gray-400';
    if (percent > -10) return 'text-orange-400';
    return 'text-red-400';
  };

  const getBeruAdvice = (hunter) => {
    if (!hunter.statsDiff?.mainFactor) return null;

    const factor = hunter.statsDiff.mainFactor;
    const impact = hunter.statsDiff.mainFactorImpact;
    const diff = hunter.statsDiff.differences[factor];

    if (!diff) return null;

    const messages = {
      atk: diff.diffPercent > 0 
        ? `L'ATK a augmenté, c'est bien ! Continue à améliorer tes artefacts.`
        : `L'ATK a baissé. Vérifie tes artefacts et tes stats de base.`,
      tc: diff.diffPercent > 0
        ? `Taux critique amélioré ! Tes coups critiques seront plus fréquents.`
        : `Taux critique réduit. Privilégie les substats TC sur tes artefacts.`,
      dcc: diff.diffPercent > 0
        ? `Dégâts critiques en hausse ! Excellent pour le burst damage.`
        : `Dégâts critiques diminués. Focus sur les substats DCC.`,
      defPen: diff.diffPercent > 0
        ? `Pénétration défense améliorée ! Tu ignores mieux l'armure du boss.`
        : `Pénétration défense réduite. Cible cette stat en priorité.`,
      di: diff.diffPercent > 0
        ? `Augmentation de dégâts en hausse ! Impact direct sur le DPS.`
        : `Augmentation de dégâts réduite. Vérifie tes sets et bénédictions.`
    };

    return messages[factor] || `La stat ${getStatLabel(factor)} a varié de ${impact.toFixed(1)}%.`;
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border-2 border-cyan-500 shadow-2xl max-h-[90vh] overflow-y-auto ${
          isMobile ? 'w-full' : 'max-w-6xl w-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-cyan-400">
            📊 Analyse Détaillée - {currentWeek}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold transition-colors">
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-700 overflow-x-auto">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              selectedTab === 'overview'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Vue d'ensemble
          </button>
          <button
            onClick={() => setSelectedTab('hunters')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              selectedTab === 'hunters'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Comparaison Hunters
          </button>
          <button
            onClick={() => setSelectedTab('stats')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              selectedTab === 'stats'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Analyse Stats
          </button>
        </div>

        {/* Content */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats globales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400 mb-1">Score Actuel</p>
                <p className="text-2xl font-bold text-white">{currentScore.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400 mb-1">Tentatives enregistrées</p>
                <p className="text-2xl font-bold text-cyan-400">{allAttempts.length}</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400 mb-1">Meilleur Score</p>
                <p className="text-2xl font-bold text-green-400">
                  {chartData.length > 0 ? Math.max(...chartData.map(d => d.score)).toLocaleString() : '0'}
                </p>
              </div>
            </div>

            {/* Graphique d'évolution */}
            {chartData.length > 0 ? (
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-4">Évolution du Score Total</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="week" 
                      stroke="#9CA3AF" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#06B6D4" 
                      strokeWidth={3} 
                      name="Score Total"
                      dot={{ fill: '#06B6D4', r: 5 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-700 text-center">
                <p className="text-gray-400">Aucun historique disponible pour générer un graphique.</p>
                <p className="text-sm text-gray-500 mt-2">Enregistrez plus de scores pour voir votre évolution.</p>
              </div>
            )}

            {/* Comparaison Hunters (graphique en barres) */}
            {huntersChartData.length > 0 && (
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-4">Comparaison Hunters</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={huntersChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#9CA3AF"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Legend />
                    <Bar dataKey="past" fill="#6B7280" name="Précédent" />
                    <Bar dataKey="current" fill="#8B5CF6" name="Actuel" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'hunters' && (
          <div className="space-y-4">
            {huntersComparison && huntersComparison.length > 0 ? (
              huntersComparison.map((hunter, idx) => (
                <div key={idx} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-white">{hunter.name}</h4>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Dégâts</p>
                      <p className="text-xl font-bold text-purple-400">
                        {hunter.currentDamage.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Dégâts précédents</p>
                      <p className="text-lg text-gray-300">{hunter.pastDamage.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Évolution</p>
                      <p className={`text-lg font-bold ${getProgressColor(hunter.diffPercent)}`}>
                        {hunter.diffPercent > 0 ? '+' : ''}{hunter.diffPercent.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Facteur principal */}
                  {hunter.statsDiff?.mainFactor && (
                    <div className="mb-3 p-3 bg-cyan-900/30 rounded border-l-4 border-cyan-500">
                      <p className="text-sm text-cyan-300 mb-1">
                        <span className="font-semibold">💡 Facteur principal:</span> {getStatLabel(hunter.statsDiff.mainFactor)}
                      </p>
                      <p className="text-xs text-cyan-200">
                        Variation de {hunter.statsDiff.mainFactorImpact.toFixed(1)}%
                      </p>
                    </div>
                  )}

                  {/* Conseil de Beru */}
                  {getBeruAdvice(hunter) && (
                    <div className="p-3 bg-purple-900/20 rounded border-l-4 border-purple-500">
                      <p className="text-sm text-purple-300">
                        🧠 <span className="font-semibold">Beru:</span> {getBeruAdvice(hunter)}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-2">Aucune comparaison disponible.</p>
                <p className="text-sm text-gray-500">
                  Enregistrez plus de scores pour voir l'évolution de vos hunters.
                </p>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'stats' && (
          <div className="space-y-4">
            {huntersComparison && huntersComparison.length > 0 ? (
              huntersComparison.map((hunter, idx) => (
                hunter.statsDiff?.differences && Object.keys(hunter.statsDiff.differences).length > 0 && (
                  <div key={idx} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <h4 className="text-lg font-semibold text-white mb-3">{hunter.name}</h4>
                    
                    <div className="space-y-2">
                      {Object.entries(hunter.statsDiff.differences)
                        .sort((a, b) => Math.abs(b[1].diffPercent) - Math.abs(a[1].diffPercent)) // Trier par impact
                        .map(([stat, data]) => (
                        <div key={stat} className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
                          <span className="text-sm font-medium text-gray-300 min-w-[100px]">
                            {getStatLabel(stat)}
                          </span>
                          <div className="flex items-center gap-3 flex-1 justify-end">
                            <span className="text-sm text-gray-400 min-w-[80px] text-right">
                              {data.past.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500">→</span>
                            <span className="text-sm text-white font-medium min-w-[80px] text-right">
                              {data.current.toLocaleString()}
                            </span>
                            <span className={`text-sm font-bold min-w-[80px] text-right ${getProgressColor(data.diffPercent)}`}>
                              {data.diffPercent > 0 ? '+' : ''}{data.diffPercent.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message récapitulatif */}
                    {hunter.statsDiff.mainFactor && (
                      <div className="mt-3 p-2 bg-indigo-900/20 rounded text-sm text-indigo-300">
                        La stat <span className="font-semibold">{getStatLabel(hunter.statsDiff.mainFactor)}</span> a le plus varié 
                        ({hunter.statsDiff.mainFactorImpact.toFixed(1)}%), ce qui explique principalement 
                        l'évolution des dégâts.
                      </div>
                    )}
                  </div>
                )
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-2">Aucune différence de stats détectée.</p>
                <p className="text-sm text-gray-500">
                  Les stats sont identiques ou aucun historique disponible.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 px-4 rounded-lg font-medium mt-6 transition-all transform hover:scale-105"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};

export default BDGDetailedAnalysisModal;