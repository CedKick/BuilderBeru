// AdminValidationPage.jsx - 🛡️ ADMIN VALIDATION SYSTEM ULTIMATE BY KAISEL v2.0 - PSEUDO + ACCOUNT ID
import React, { useState, useEffect } from 'react';

const AdminValidationPage = ({ 
  onClose, 
  showTankMessage,
  
  // 🆕 TOUTES LES PROPS POUR UNE PAGE ADMIN COMPLÈTE
  selectedCharacter,
  characterData,
  currentStats = {},
  currentArtifacts = {},
  statsFromArtifacts = {},
  currentCores = {},
  currentGems = {},
  currentWeapon = {},
  characters = {},
  onNavigateToBuilder,
  onShowHallOfFlame
}) => {
  const [pendingHunters, setPendingHunters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHunter, setSelectedHunter] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [adminStats, setAdminStats] = useState({});
  const [confidenceLevels, setConfidenceLevels] = useState({});
  const [possibleIssues, setPossibleIssues] = useState({});
  const [duplicateGroups, setDuplicateGroups] = useState([]);
  const [showDuplicates, setShowDuplicates] = useState(false);

  // 🔍 DÉTECTION MOBILE
  const isMobileDevice = window.innerWidth < 768;

  // 📊 CHARGER LES HUNTERS EN ATTENTE
  useEffect(() => {
    loadPendingHunters();
    loadAdminStats();
    loadDuplicates();
  }, []);

  const loadPendingHunters = async () => {
    try {
      setLoading(true);
      showTankMessage("🛡️ Chargement des hunters en attente v2.0...", true, 'kaisel');
      
      const response = await fetch('https://api.builderberu.com/api/admin/pending');
      const result = await response.json();
      
      if (response.ok && result.success) {
        setPendingHunters(result.hunters);
        setConfidenceLevels(result.confidenceLevels);
        setPossibleIssues(result.possibleIssues);
        showTankMessage(`🛡️ ${result.hunters.length} hunters en attente (${result.highRisk || 0} à haut risque)`, true, 'kaisel');
      } else {
        throw new Error(result.error || 'Erreur API');
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement pending:', error);
      showTankMessage(`❌ Erreur: ${error.message}`, true, 'kaisel');
    } finally {
      setLoading(false);
    }
  };

  const loadAdminStats = async () => {
    try {
      const response = await fetch('https://api.builderberu.com/api/admin/stats');
      const result = await response.json();
      
      if (response.ok && result.success) {
        setAdminStats(result.stats);
      }
    } catch (error) {
      console.error('❌ Erreur stats admin:', error);
    }
  };

  const loadDuplicates = async () => {
    try {
      const response = await fetch('https://api.builderberu.com/api/admin/duplicates');
      const result = await response.json();
      
      if (response.ok && result.success) {
        setDuplicateGroups(result.duplicateGroups);
      }
    } catch (error) {
      console.error('❌ Erreur doublons:', error);
    }
  };

  // ✅ APPROUVER UN HUNTER
  const handleApprove = async (hunterId, confidenceLevel, issues = [], adminNotes = '') => {
    try {
      showTankMessage("✅ Approbation en cours...", true, 'kaisel');
      
      const response = await fetch(`https://api.builderberu.com/api/admin/approve/${hunterId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confidenceLevel, issues, adminNotes })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        showTankMessage(`✅ ${result.hunter.pseudo} (${result.hunter.accountId}) approuvé !`, true, 'kaisel');
        loadPendingHunters(); // Recharger la liste
        setShowDetails(false);
      } else {
        throw new Error(result.error || 'Erreur approbation');
      }
      
    } catch (error) {
      console.error('❌ Erreur approbation:', error);
      showTankMessage(`❌ Erreur: ${error.message}`, true, 'kaisel');
    }
  };

  // ❌ REJETER UN HUNTER
  const handleReject = async (hunterId, reason = 'Non conforme') => {
    const hunter = pendingHunters.find(h => h.id === hunterId);
    const hunterName = hunter ? `${hunter.pseudo} (${hunter.accountId})` : 'ce hunter';
    
    if (!window.confirm(`Êtes-vous sûr de vouloir SUPPRIMER définitivement ${hunterName} ?\n\nRaison: ${reason}`)) {
      return;
    }

    try {
      showTankMessage("🗑️ Suppression en cours...", true, 'kaisel');
      
      const response = await fetch(`https://api.builderberu.com/api/admin/reject/${hunterId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        showTankMessage(`🗑️ ${result.rejected.pseudo} (${result.rejected.accountId}) supprimé`, true, 'kaisel');
        loadPendingHunters(); // Recharger la liste
        setShowDetails(false);
      } else {
        throw new Error(result.error || 'Erreur suppression');
      }
      
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      showTankMessage(`❌ Erreur: ${error.message}`, true, 'kaisel');
    }
  };

  // 🔍 VOIR DÉTAILS POUR VALIDATION
  const handleViewDetails = (hunter) => {
    setSelectedHunter(hunter);
    setShowDetails(true);
  };

  // 📊 FORMATER LES STATS
  const formatStat = (value) => {
    if (typeof value !== 'number') return '0';
    return Math.round(value).toLocaleString();
  };

  // 🎨 OBTENIR LA COULEUR DE L'ÉLÉMENT
  const getElementColor = (element) => {
    const colors = {
      Fire: '#ff4500',
      Water: '#00bfff', 
      Light: '#ffd700',
      Dark: '#8a2be2',
      Wind: '#00ff7f'
    };
    return colors[element] || '#888';
  };

  // 🚨 OBTENIR LA COULEUR DU NIVEAU DE RISQUE
  const getRiskColor = (riskLevel) => {
    switch(riskLevel) {
      case 'low': return '#22c55e';
      case 'medium': return '#eab308';
      case 'high': return '#ef4444';
      default: return '#888';
    }
  };

  return (
    <>
      <style jsx="true">{`
        .admin-page {
          backdrop-filter: blur(15px);
          background: linear-gradient(135deg, 
            rgba(10, 10, 25, 0.95) 0%, 
            rgba(25, 15, 35, 0.98) 50%, 
            rgba(15, 5, 15, 0.95) 100%);
        }

        .admin-card {
          background: linear-gradient(135deg, 
            rgba(40, 26, 46, 0.8) 0%, 
            rgba(60, 22, 33, 0.9) 50%, 
            rgba(25, 15, 25, 0.8) 100%);
          border: 1px solid rgba(255, 100, 100, 0.3);
          transition: all 0.3s ease;
        }

        .admin-card:hover {
          border-color: rgba(255, 100, 100, 0.6);
          transform: translateY(-3px);
        }

        .admin-card.high-risk {
          border-color: rgba(239, 68, 68, 0.6);
          background: linear-gradient(135deg, 
            rgba(60, 26, 26, 0.8) 0%, 
            rgba(80, 22, 22, 0.9) 50%, 
            rgba(40, 15, 15, 0.8) 100%);
        }

        .pending-badge {
          background: linear-gradient(135deg, #ff6b35, #f97316);
          color: white;
          animation: pulse 2s infinite;
        }

        .risk-badge {
          border: 2px solid var(--risk-color);
          color: var(--risk-color);
          background: rgba(var(--risk-rgb), 0.1);
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .confidence-badge {
          border: 2px solid var(--confidence-color);
          color: var(--confidence-color);
          background: rgba(var(--confidence-rgb), 0.1);
        }

        .issue-tag {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #ff6b6b;
        }

        .approval-button {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          transition: all 0.3s ease;
        }

        .approval-button:hover {
          background: linear-gradient(135deg, #16a34a, #15803d);
          transform: translateY(-2px);
        }

        .reject-button {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          transition: all 0.3s ease;
        }

        .reject-button:hover {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          transform: translateY(-2px);
        }

        .artifact-slot-admin {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: 8px;
          padding: 12px;
          transition: all 0.3s ease;
        }

        .artifact-slot-admin:hover {
          border-color: rgba(255, 215, 0, 0.5);
          background: rgba(255, 215, 0, 0.05);
        }

        .element-badge-admin {
          border: 2px solid var(--element-color);
          color: var(--element-color);
          background: rgba(var(--element-rgb), 0.1);
        }

        .screenshot-gallery {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .screenshot-item {
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .screenshot-item:hover {
          border-color: #ffd700;
          transform: scale(1.05);
        }

        .duplicate-alert {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ff6b6b;
        }

        .optimal-set-badge {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }
      `}</style>

      {/* 🖼️ OVERLAY FULLSCREEN */}
      <div className="fixed inset-0 z-[9999]">
        <div className="admin-page absolute inset-0">
          
          {/* Header Admin */}
          <div className="relative z-10 p-4 md:p-6 border-b border-red-500/30">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🛡️</span>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-red-400">
                    Admin Validation Ultimate v2.0
                  </h1>
                  <p className="text-gray-300 text-sm">
                    Système Pseudo + AccountID • {pendingHunters.length} en attente
                    {duplicateGroups.length > 0 && (
                      <span className="text-yellow-400 ml-2">• {duplicateGroups.length} doublons potentiels</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {duplicateGroups.length > 0 && (
                  <button
                    onClick={() => setShowDuplicates(!showDuplicates)}
                    className="px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 rounded-lg transition-colors text-sm"
                  >
                    🔍 Doublons ({duplicateGroups.length})
                  </button>
                )}
                
                <button
                  onClick={() => onShowHallOfFlame && onShowHallOfFlame()}
                  className="px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 rounded-lg transition-colors text-sm"
                >
                  🏆 Hall Of Flame
                </button>
                
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-red-600/20 hover:bg-red-600/40 text-red-400 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* Stats Admin v2.0 */}
          {adminStats.total > 0 && (
            <div className="relative z-10 p-4 md:p-6 border-b border-gray-700/50">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div className="bg-black/30 rounded-lg p-4 border border-blue-500/20">
                    <p className="text-gray-400 text-sm">Total</p>
                    <p className="text-2xl font-bold text-blue-400">{adminStats.total}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4 border border-green-500/20">
                    <p className="text-gray-400 text-sm">Validés</p>
                    <p className="text-2xl font-bold text-green-400">{adminStats.validated}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4 border border-orange-500/20">
                    <p className="text-gray-400 text-sm">En attente</p>
                    <p className="text-2xl font-bold text-orange-400">{adminStats.pending}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
                    <p className="text-gray-400 text-sm">Sets optimaux</p>
                    <p className="text-2xl font-bold text-purple-400">{adminStats.withOptimalSets || 0}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4 border border-cyan-500/20">
                    <p className="text-gray-400 text-sm">Screenshots</p>
                    <p className="text-2xl font-bold text-cyan-400">{adminStats.screenshotRate || 0}%</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4 border border-yellow-500/20">
                    <p className="text-gray-400 text-sm">Validation</p>
                    <p className="text-2xl font-bold text-yellow-400">{adminStats.validationRate}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contenu principal */}
          <div className="relative z-10 flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto">

              {/* Onglets Validation / Doublons */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setShowDuplicates(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    !showDuplicates 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  🛡️ Validation ({pendingHunters.length})
                </button>
                
                {duplicateGroups.length > 0 && (
                  <button
                    onClick={() => setShowDuplicates(true)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      showDuplicates 
                        ? 'bg-yellow-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    🔍 Doublons ({duplicateGroups.length})
                  </button>
                )}
              </div>

              {/* Section Doublons */}
              {showDuplicates && (
                <div>
                  <h2 className="text-xl font-bold text-yellow-400 mb-6">
                    🔍 Doublons Potentiels Détectés ({duplicateGroups.length})
                  </h2>
                  
                  {duplicateGroups.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="text-4xl mb-4">✅</div>
                      <h3 className="text-lg text-green-400 mb-2">Aucun doublon détecté</h3>
                      <p className="text-gray-400">Le système est propre !</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {duplicateGroups.map((group, index) => (
                        <div key={index} className="duplicate-alert rounded-lg p-4">
                          <h3 className="text-red-400 font-bold mb-3">⚠️ Groupe de doublons #{index + 1}</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Original */}
                            <div className="bg-black/30 rounded-lg p-3">
                              <h4 className="text-yellow-400 font-bold mb-2">📋 Original</h4>
                              <p className="text-white"><strong>Pseudo:</strong> {group.original.pseudo}</p>
                              <p className="text-white"><strong>Account ID:</strong> {group.original.accountId}</p>
                              <p className="text-gray-300"><strong>Character:</strong> {group.original.character}</p>
                              <p className="text-cyan-400"><strong>CP:</strong> {group.original.totalScore?.toLocaleString()}</p>
                              <p className="text-gray-400"><strong>Validé:</strong> {group.original.validated ? '✅ Oui' : '❌ Non'}</p>
                            </div>
                            
                            {/* Doublons */}
                            <div className="space-y-2">
                              <h4 className="text-red-400 font-bold mb-2">🚨 Doublons ({group.duplicates.length})</h4>
                              {group.duplicates.map((dup, dupIndex) => (
                                <div key={dupIndex} className="bg-red-900/20 rounded p-2 text-sm">
                                  <p className="text-white"><strong>{dup.hunter.pseudo}</strong> ({dup.hunter.accountId})</p>
                                  <p className="text-gray-300">{dup.hunter.character}</p>
                                  <p className="text-yellow-400 text-xs">
                                    Type: {dup.type === 'same_pseudo_diff_account' ? 'Même pseudo, Account ID différent' : 'Même Account ID, pseudo différent'}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Section Validation */}
              {!showDuplicates && (
                <>
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="text-6xl mb-4 animate-spin">🛡️</div>
                      <h3 className="text-xl text-red-400 mb-2">Chargement des validations v2.0...</h3>
                      <p className="text-gray-400">Kaisel analyse les pseudo + accountID...</p>
                    </div>
                  ) : pendingHunters.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="text-6xl mb-4">✅</div>
                      <h3 className="text-xl text-green-400 mb-2">Aucune validation en attente</h3>
                      <p className="text-gray-400">Tous les hunters ont été traités !</p>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-red-400 mb-6">
                        🛡️ Hunters en attente de validation ({pendingHunters.length})
                      </h2>

                      <div className={`grid gap-6 ${isMobileDevice ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                        {pendingHunters.map((hunter) => {
                          const character = characters[hunter.character];
                          const elementColor = getElementColor(character?.element);
                          const riskColor = getRiskColor(hunter.autoAnalysis?.riskLevel);
                          
                          return (
                            <div
                              key={hunter.id}
                              className={`admin-card rounded-xl p-6 cursor-pointer ${
                                hunter.autoAnalysis?.riskLevel === 'high' ? 'high-risk' : ''
                              }`}
                              onClick={() => handleViewDetails(hunter)}
                            >
                              {/* Header avec status */}
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex flex-col gap-1">
                                  <div className="pending-badge px-3 py-1 rounded-full text-sm font-bold">
                                    ⏳ EN ATTENTE
                                  </div>
                                  
                                  {/* Nouveau badge de risque */}
                                  {hunter.autoAnalysis?.riskLevel && (
                                    <div
                                      className="risk-badge px-2 py-1 rounded text-xs font-bold"
                                      style={{
                                        '--risk-color': riskColor,
                                        '--risk-rgb': riskColor.slice(1).match(/.{2}/g).map(hex => parseInt(hex, 16)).join(',')
                                      }}
                                    >
                                      {hunter.autoAnalysis.riskLevel === 'high' ? '🚨 HAUT RISQUE' :
                                       hunter.autoAnalysis.riskLevel === 'medium' ? '⚠️ RISQUE MOYEN' : '✅ FAIBLE RISQUE'}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex flex-col items-end gap-1">
                                  {character?.element && (
                                    <div
                                      className="element-badge-admin px-2 py-1 rounded text-xs font-bold"
                                      style={{
                                        '--element-color': elementColor,
                                        '--element-rgb': elementColor.slice(1).match(/.{2}/g).map(hex => parseInt(hex, 16)).join(',')
                                      }}
                                    >
                                      {character.element}
                                    </div>
                                  )}
                                  
                                  {/* Badge Set Optimal */}
                                  {hunter.setValidation?.isOptimal && (
                                    <div className="optimal-set-badge px-2 py-1 rounded text-xs font-bold">
                                      🏆 SET OPTIMAL
                                    </div>
                                  )}
                                  
                                  <div className="text-right">
                                    <p className="text-xs text-gray-400">
                                      {new Date(hunter.timestamp).toLocaleDateString()}
                                    </p>
                                    {hunter.screenshots && hunter.screenshots.length > 0 && (
                                      <p className="text-xs text-green-400">
                                        📸 {hunter.screenshots.length} screenshot{hunter.screenshots.length > 1 ? 's' : ''}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Info Hunter v2.0 */}
                              <div className="mb-4">
                                <h3 className="text-xl font-bold text-white mb-1">{hunter.pseudo}</h3>
                                <p className="text-gray-400 text-sm">
                                  {hunter.accountId} • {hunter.characterName}
                                </p>
                                <p className="text-gray-500 text-xs">
                                  {hunter.guildName || 'Sans guilde'}
                                </p>
                                {hunter.builderInfo?.scaleStat && (
                                  <p className="text-blue-400 text-xs mt-1">
                                    🎯 Scale Stat: {hunter.builderInfo.scaleStat}
                                  </p>
                                )}
                              </div>

                              {/* Scores détaillés */}
                              <div className="mb-4 space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-400 text-sm">CP Total:</span>
                                  <span className="text-yellow-400 font-bold">{hunter.totalScore?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400 text-sm">CP Artifacts:</span>
                                  <span className="text-purple-400 font-bold">{hunter.artifactsScore?.toLocaleString() || 0}</span>
                                </div>
                                
                                {/* Ratio CP */}
                                {hunter.totalScore && hunter.artifactsScore && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-400 text-sm">Ratio Artifacts:</span>
                                    <span className="text-cyan-400 text-sm">
                                      {Math.round((hunter.artifactsScore / hunter.totalScore) * 100)}%
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Stats principales */}
                              <div className="mb-4 space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-500">Attack:</span>
                                  <span className="text-red-400">{formatStat(hunter.currentStats?.Attack || 0)}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-500">Defense:</span>
                                  <span className="text-blue-400">{formatStat(hunter.currentStats?.Defense || 0)}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-500">HP:</span>
                                  <span className="text-green-400">{formatStat(hunter.currentStats?.HP || 0)}</span>
                                </div>
                              </div>

                              {/* Analyse auto v2.0 */}
                              {hunter.autoAnalysis && (
                                <div className="mb-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400 text-sm">Analyse Auto v2.0:</span>
                                    <span
                                      className="confidence-badge px-2 py-1 rounded text-xs font-bold"
                                      style={{
                                        '--confidence-color': hunter.autoAnalysis.suggestedScore >= 80 ? '#22c55e' : 
                                                             hunter.autoAnalysis.suggestedScore >= 60 ? '#eab308' : '#ef4444',
                                        '--confidence-rgb': hunter.autoAnalysis.suggestedScore >= 80 ? '34, 197, 94' : 
                                                           hunter.autoAnalysis.suggestedScore >= 60 ? '234, 179, 8' : '239, 68, 68'
                                      }}
                                    >
                                      {hunter.autoAnalysis.suggestedScore}%
                                    </span>
                                  </div>
                                  {/* Issues détectées */}
                                  {hunter.autoAnalysis.issues.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {hunter.autoAnalysis.issues.slice(0, 2).map((issue, idx) => (
                                        <span key={idx} className="issue-tag px-2 py-1 rounded text-xs">
                                          {possibleIssues[issue] || issue}
                                        </span>
                                      ))}
                                      {hunter.autoAnalysis.issues.length > 2 && (
                                        <span className="issue-tag px-2 py-1 rounded text-xs">
                                          +{hunter.autoAnalysis.issues.length - 2}
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Alerte doublons potentiels */}
                                  {hunter.autoAnalysis.potentialDuplicates && hunter.autoAnalysis.potentialDuplicates.length > 0 && (
                                    <div className="mt-2 duplicate-alert p-2 rounded text-xs">
                                      🚨 {hunter.autoAnalysis.potentialDuplicates.length} doublon(s) potentiel(s) détecté(s)
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Actions rapides */}
                              <div className="flex gap-2 mt-4">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApprove(hunter.id, hunter.autoAnalysis?.suggestedScore || 70);
                                  }}
                                  className="approval-button flex-1 px-3 py-2 rounded text-white text-sm font-bold"
                                >
                                  ✅ Approuver
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReject(hunter.id, 'Non conforme v2.0');
                                  }}
                                  className="reject-button flex-1 px-3 py-2 rounded text-white text-sm font-bold"
                                >
                                  ❌ Rejeter
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 MODAL DÉTAILS VALIDATION ULTIMATE v2.0 */}
      {showDetails && selectedHunter && (
        <div className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto border-2 border-red-500">
            
            {/* Header Modal v2.0 */}
            <div className="p-6 border-b border-red-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-red-400">🛡️ Validation Détaillée Ultimate v2.0</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <div>
                      <p className="text-white font-bold">{selectedHunter.pseudo}</p>
                      <p className="text-gray-300 text-sm">{selectedHunter.accountId}</p>
                    </div>
                    <div>
                      <p className="text-gray-300">{selectedHunter.characterName}</p>
                      <p className="text-gray-400 text-sm">{selectedHunter.guildName || 'Sans guilde'}</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    Soumis le {new Date(selectedHunter.timestamp).toLocaleDateString()} • 
                    {selectedHunter.builderInfo?.scaleStat && ` Scale: ${selectedHunter.builderInfo.scaleStat}`}
                    {selectedHunter.setValidation?.isOptimal && ' • 🏆 Set Optimal'}
                  </p>
                </div>
                
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-10 h-10 rounded-full bg-red-600/20 hover:bg-red-600/40 text-red-400 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Contenu Modal v2.0 */}
            <div className="p-6">
              
              {/* Scores & Analyse v2.0 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-black/30 rounded-lg p-4">
                  <h3 className="text-yellow-400 font-bold mb-2">🏆 CP Total</h3>
                  <p className="text-2xl font-bold text-yellow-400">{selectedHunter.totalScore?.toLocaleString()}</p>
                  {selectedHunter.setValidation?.isOptimal && (
                    <p className="text-green-400 text-xs mt-1">🏆 +5% bonus set appliqué</p>
                  )}
                  {selectedHunter.cpDetailsTotal?.details && (
                    <div className="mt-2 space-y-1 text-xs">
                      {selectedHunter.cpDetailsTotal.details.slice(0, 3).map((detail, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-gray-400">{detail.name.length > 15 ? detail.name.substring(0, 15) + '...' : detail.name}:</span>
                          <span className="text-white">{detail.points?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="bg-black/30 rounded-lg p-4">
                  <h3 className="text-purple-400 font-bold mb-2">🎨 CP Artefacts</h3>
                  <p className="text-2xl font-bold text-purple-400">{selectedHunter.artifactsScore?.toLocaleString() || 0}</p>
                  {selectedHunter.cpDetailsArtifacts?.details && (
                    <div className="mt-2 space-y-1 text-xs">
                      {selectedHunter.cpDetailsArtifacts.details.slice(0, 3).map((detail, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-gray-400">{detail.name.length > 15 ? detail.name.substring(0, 15) + '...' : detail.name}:</span>
                          <span className="text-white">{detail.points?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="bg-black/30 rounded-lg p-4">
                  <h3 className="text-blue-400 font-bold mb-2">🤖 Score Auto v2.0</h3>
                  <p className="text-2xl font-bold text-blue-400">{selectedHunter.autoAnalysis?.suggestedScore || 0}%</p>
                  <div className="mt-2 text-xs">
                    <p className="text-gray-400">Issues: {selectedHunter.autoAnalysis?.issues.length || 0}</p>
                    <p className="text-gray-400">Risque: {selectedHunter.autoAnalysis?.riskLevel || 'unknown'}</p>
                  </div>
                </div>
                
                <div className="bg-black/30 rounded-lg p-4">
                  <h3 className="text-cyan-400 font-bold mb-2">📊 Ratio & Stats</h3>
                  <p className="text-2xl font-bold text-cyan-400">
                    {selectedHunter.totalScore && selectedHunter.artifactsScore 
                      ? Math.round((selectedHunter.artifactsScore / selectedHunter.totalScore) * 100) 
                      : 0}%
                  </p>
                  <div className="mt-2 text-xs">
                    <p className="text-gray-400">Screenshots: {selectedHunter.screenshots?.length || 0}</p>
                    <p className="text-gray-400">Sets: {Object.keys(selectedHunter.setAnalysis?.equipped || {}).length}</p>
                  </div>
                </div>
              </div>

              {/* Alertes doublons v2.0 */}
              {selectedHunter.autoAnalysis?.potentialDuplicates && selectedHunter.autoAnalysis.potentialDuplicates.length > 0 && (
                <div className="duplicate-alert rounded-lg p-4 mb-6">
                  <h3 className="text-red-400 font-bold mb-3">🚨 Doublons Potentiels Détectés</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedHunter.autoAnalysis.potentialDuplicates.map((dup, index) => (
                      <div key={index} className="bg-black/30 rounded p-3">
                        <p className="text-yellow-400 font-bold">
                          {dup.type === 'same_pseudo_diff_account' ? '⚠️ Même pseudo, Account ID différent' : '⚠️ Même Account ID, pseudo différent'}
                        </p>
                        <div className="mt-2 text-sm">
                          <p className="text-white"><strong>Pseudo:</strong> {dup.hunter.pseudo}</p>
                          <p className="text-white"><strong>Account ID:</strong> {dup.hunter.accountId}</p>
                          <p className="text-gray-300"><strong>Character:</strong> {dup.hunter.character}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Screenshots Gallery */}
              {selectedHunter.screenshots && selectedHunter.screenshots.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-green-400 font-bold mb-4">📸 Screenshots Gallery ({selectedHunter.screenshots.length}) - OBLIGATOIRES v2.0</h3>
                  <div className="screenshot-gallery">
                    {selectedHunter.screenshots.map((screenshot, index) => (
                      <div key={index} className="screenshot-item">
                        <img 
                          src={screenshot.url} 
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-auto cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => window.open(screenshot.url, '_blank')}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sets Analysis v2.0 */}
              {selectedHunter.setAnalysis && (
                <div className="bg-black/30 rounded-lg p-4 border border-blue-500/20 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-blue-400 font-bold">🎨 Analyse des Sets v2.0</h3>
                    {selectedHunter.setValidation?.isOptimal && (
                      <span className="optimal-set-badge px-3 py-1 rounded text-sm font-bold">
                        🏆 SET OPTIMAL (+5% CP)
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-300 mb-4">{selectedHunter.setAnalysis.analysis || "Aucune analyse disponible"}</p>
                  
                  {/* Sets équipés */}
                  {selectedHunter.setAnalysis.equipped && Object.keys(selectedHunter.setAnalysis.equipped).length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-cyan-400 font-bold mb-2">🎯 Sets Équipés:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(selectedHunter.setAnalysis.equipped).map(([setName, count]) => (
                          <div key={setName} className="bg-black/40 rounded-lg p-3 text-center">
                            <p className="text-yellow-400 font-bold text-sm">{setName}</p>
                            <p className="text-gray-300 text-xs">{count} pièces</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sets recommandés */}
                  {selectedHunter.setValidation?.recommendedSets && selectedHunter.setValidation.recommendedSets.length > 0 && (
                    <div>
                      <h4 className="text-cyan-400 font-bold mb-2">📋 Sets Recommandés:</h4>
                      <div className="space-y-2">
                        {selectedHunter.setValidation.recommendedSets.map((recSet, index) => (
                          <div key={index} className="bg-black/40 rounded p-2 text-sm">
                            <p className="text-yellow-400 font-bold">{recSet.name}:</p>
                            <p className="text-gray-300">{recSet.composition}</p>
                            <p className="text-gray-500">Disponibilité: {recSet.availability}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Stats Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-black/30 rounded-lg p-4 border border-green-500/20">
                  <h3 className="text-green-400 font-bold mb-4">⚡ Stats Totales</h3>
                  <div className="space-y-3">
                    {selectedHunter.currentStats && Object.entries(selectedHunter.currentStats).map(([stat, value]) => (
                      <div key={stat} className="flex justify-between">
                        <span className="text-gray-400">{stat}:</span>
                        <span className="text-white font-bold">{formatStat(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
                  <h3 className="text-purple-400 font-bold mb-4">🎨 Stats Artefacts</h3>
                  <div className="space-y-3">
                    {selectedHunter.statsFromArtifacts && Object.entries(selectedHunter.statsFromArtifacts).map(([stat, value]) => (
                      <div key={stat} className="flex justify-between">
                        <span className="text-gray-400">{stat}:</span>
                        <span className="text-white font-bold">{formatStat(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Artefacts Détaillés */}
              {selectedHunter.currentArtifacts && Object.keys(selectedHunter.currentArtifacts).length > 0 && (
                <div className="bg-black/30 rounded-lg p-4 border border-yellow-500/20 mb-6">
                  <h3 className="text-yellow-400 font-bold mb-4">🎨 Artefacts Équipés ({Object.keys(selectedHunter.currentArtifacts).length}/8)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {Object.entries(selectedHunter.currentArtifacts).map(([slot, artifact]) => (
                      <div key={slot} className="artifact-slot-admin">
                        <h4 className="text-yellow-400 font-bold text-sm mb-2">{slot}</h4>
                        <p className="text-blue-400 text-xs mb-2">{artifact.set || 'Aucun Set'}</p>
                        
                        {/* Main Stat */}
                        <div className="mb-3">
                          <p className="text-gray-400 text-xs">Main:</p>
                          <p className="text-white text-sm font-bold">
                            {artifact.mainStat || 'N/A'}
                            {artifact.mainStatValue && ` (+${Math.round(artifact.mainStatValue)})`}
                          </p>
                        </div>

                        {/* Sub Stats */}
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Sub:</p>
                          <div className="space-y-1">
                            {artifact.subStats && artifact.subStats.slice(0, 4).map((subStat, index) => {
                              const subStatValue = artifact.subStatsLevels && artifact.subStatsLevels[index] 
                                ? artifact.subStatsLevels[index].value 
                                : null;
                              const procCount = artifact.procOrders && artifact.procOrders[index] 
                                ? artifact.procOrders[index].length - 1 
                                : 0;
                              
                              const isPercentageStat = subStat && subStat.includes('%');
                              
                              return (
                                <p key={index} className="text-xs text-gray-300">
                                  {subStat ? (
                                    <>
                                      {subStat}
                                      {procCount >= 1 && <span className="text-yellow-400"> (+{procCount})</span>}
                                      {subStatValue && (
                                        <span className="text-white">
                                          : {isPercentageStat ? Number(subStatValue).toFixed(2) : Math.round(subStatValue)}
                                          {isPercentageStat ? '%' : ''}
                                        </span>
                                      )}
                                    </>
                                  ) : '-'}
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Equipements Additionnels */}
              {((selectedHunter.currentGems && Object.keys(selectedHunter.currentGems).length > 0) ||
                (selectedHunter.currentWeapon && Object.keys(selectedHunter.currentWeapon).length > 0) ||
                (selectedHunter.currentCores && Object.keys(selectedHunter.currentCores).length > 0)) && (
                <div className="bg-black/30 rounded-lg p-4 border border-green-500/20 mb-6">
                  <h3 className="text-green-400 font-bold mb-4">💎 Équipements Additionnels</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Gems */}
                    {selectedHunter.currentGems && Object.keys(selectedHunter.currentGems).length > 0 && (
                      <div>
                        <h4 className="text-emerald-300 font-bold mb-2">💎 Gems ({Object.keys(selectedHunter.currentGems).length})</h4>
                        <div className="space-y-2 text-xs">
                          {Object.entries(selectedHunter.currentGems).map(([color, gemData]) => (
                            <div key={color} className="bg-black/40 rounded p-2">
                              <p className="text-emerald-400 font-bold">{color}:</p>
                              <div className="ml-2 space-y-1">
                                {Object.entries(gemData).map(([statName, statValue]) => (
                                  <div key={statName} className="text-gray-300">
                                    {statName}: {typeof statValue === 'number' ? Math.round(statValue) : statValue}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Weapon */}
                    {selectedHunter.currentWeapon && Object.keys(selectedHunter.currentWeapon).length > 0 && (
                      <div>
                        <h4 className="text-orange-300 font-bold mb-2">⚔️ Weapon</h4>
                        <div className="bg-black/40 rounded p-2 text-xs">
                          <div className="space-y-1 text-gray-300">
                            <div>
                              <span className="text-orange-400">Main Stat:</span> {selectedHunter.currentWeapon.mainStat || 'N/A'}
                              {selectedHunter.currentWeapon.mainStat && selectedHunter.builderInfo?.scaleStat === selectedHunter.currentWeapon.mainStat && (
                                <span className="text-yellow-400 ml-1">⭐</span>
                              )}
                            </div>
                            <div><span className="text-orange-400">Precision:</span> {selectedHunter.currentWeapon.precision || 'N/A'}</div>
                            {selectedHunter.currentWeapon.mainStatValue && (
                              <div><span className="text-orange-400">Value:</span> {Math.round(selectedHunter.currentWeapon.mainStatValue)}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cores */}
                    {selectedHunter.currentCores && Object.keys(selectedHunter.currentCores).length > 0 && (
                      <div>
                        <h4 className="text-cyan-300 font-bold mb-2">🔮 Cores ({Object.keys(selectedHunter.currentCores).length})</h4>
                        <div className="space-y-2 text-xs">
                          {Object.entries(selectedHunter.currentCores).map(([coreType, coreData]) => (
                            <div key={coreType} className="bg-black/40 rounded p-2">
                              <p className="text-cyan-400 font-bold">{coreType}:</p>
                              <div className="ml-2 space-y-1 text-gray-300">
                                <div>Primary: {coreData.primary || 'N/A'}</div>
                                {coreData.primaryValue && (
                                  <div>Value: {Math.round(coreData.primaryValue)}</div>
                                )}
                                {coreData.secondary && (
                                  <div>Secondary: {coreData.secondary}</div>
                                )}
                                {coreData.secondaryValue && (
                                  <div>Sec Value: {Math.round(coreData.secondaryValue)}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Issues détectées v2.0 */}
              {selectedHunter.autoAnalysis?.issues.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-red-400 font-bold mb-4">🚨 Issues Détectées v2.0</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedHunter.autoAnalysis.issues.map((issue, index) => (
                      <div key={index} className="issue-tag p-3 rounded-lg">
                        <p className="font-bold">{possibleIssues[issue] || issue}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes utilisateur */}
              {selectedHunter.notes && (
                <div className="bg-black/30 rounded-lg p-4 border border-gray-500/20 mb-6">
                  <h3 className="text-gray-400 font-bold mb-2">📝 Notes du Hunter</h3>
                  <p className="text-gray-300">{selectedHunter.notes}</p>
                </div>
              )}

              {/* Actions de validation v2.0 */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-white font-bold mb-4">🎯 Actions de Validation v2.0</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Approbation */}
                  <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
                    <h4 className="text-green-400 font-bold mb-3">✅ Approuver</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Niveau de confiance :</label>
                        <select 
                          className="w-full bg-black/50 border border-green-500/30 rounded px-3 py-2 text-white"
                          defaultValue={selectedHunter.autoAnalysis?.suggestedScore || 70}
                          id="confidenceSelect"
                        >
                          <option value={100}>💎 100% - Parfait</option>
                          <option value={90}>✅ 90% - Excellent</option>
                          <option value={80}>🟢 80% - Très bon</option>
                          <option value={70}>🟡 70% - Bon</option>
                          <option value={60}>🟠 60% - Acceptable</option>
                          <option value={50}>🔶 50% - Suspect</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Notes admin v2.0 :</label>
                        <textarea 
                          className="w-full bg-black/50 border border-green-500/30 rounded px-3 py-2 text-white text-sm"
                          rows="3"
                          placeholder="Notes optionnelles sur la validation..."
                          id="adminNotes"
                        />
                      </div>
                      
                      <button
                        onClick={() => {
                          const confidence = parseInt(document.getElementById('confidenceSelect').value);
                          const notes = document.getElementById('adminNotes').value;
                          handleApprove(selectedHunter.id, confidence, selectedHunter.autoAnalysis?.issues || [], notes);
                        }}
                        className="approval-button w-full px-4 py-3 rounded font-bold text-white"
                      >
                        ✅ Approuver ce Hunter
                      </button>
                    </div>
                  </div>

                  {/* Rejet */}
                  <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
                    <h4 className="text-red-400 font-bold mb-3">❌ Rejeter</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Raison du rejet v2.0 :</label>
                        <select 
                          className="w-full bg-black/50 border border-red-500/30 rounded px-3 py-2 text-white"
                          id="rejectReason"
                        >
                          <option value="Non conforme v2.0">Non conforme aux standards v2.0</option>
                          <option value="Pseudo/AccountID invalide">Pseudo ou Account ID invalide</option>
                          <option value="Screenshots manquants">Screenshots obligatoires manquants</option>
                          <option value="Stats impossibles">Stats impossibles/trichées</option>
                          <option value="Screenshots suspects">Screenshots suspects</option>
                          <option value="Doublon détecté">Doublon détecté (pseudo/accountID)</option>
                          <option value="CP incohérent">CP incohérent avec les stats</option>
                          <option value="Sets invalides">Sets d'artefacts invalides</option>
                          <option value="Set bonus manquant">Bonus set manquant</option>
                          <option value="Autre">Autre raison</option>
                        </select>
                      </div>
                      
                      <div className="bg-red-900/30 rounded p-3">
                        <p className="text-red-300 text-sm">
                          ⚠️ <strong>Action irréversible v2.0</strong><br/>
                          Ce hunter ({selectedHunter.pseudo} - {selectedHunter.accountId}) sera définitivement supprimé de la base de données.
                          Le joueur ne sera pas notifié.
                        </p>
                      </div>
                      
                      <button
                        onClick={() => {
                          const reason = document.getElementById('rejectReason').value;
                          handleReject(selectedHunter.id, reason);
                        }}
                        className="reject-button w-full px-4 py-3 rounded font-bold text-white"
                      >
                        🗑️ Supprimer Définitivement
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminValidationPage;