// AdminValidationPage.jsx - 🛡️ ADMIN VALIDATION ENHANCED v3.0 - CP TOOLTIPS + MOBILE + DOUBLONS
import React, { useState, useEffect } from 'react';

const AdminValidationPage = ({ 
  onClose, 
  showTankMessage,
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
  
  // 🆕 STATES POUR TOOLTIPS CP
  const [showCpTooltipTotal, setShowCpTooltipTotal] = useState(null);
  const [showCpTooltipArtifacts, setShowCpTooltipArtifacts] = useState(null);

  // 🔍 DÉTECTION MOBILE AMÉLIORÉE
  const [isMobileDevice, setIsMobileDevice] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileDevice(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 📊 CHARGER LES HUNTERS EN ATTENTE
  useEffect(() => {
    loadPendingHunters();
    loadAdminStats();
    loadDuplicates();
  }, []);

  const loadPendingHunters = async () => {
    try {
      setLoading(true);
      showTankMessage("🛡️ Chargement des hunters en attente v3.0...", true, 'kaisel');
      
      // 🌐 URL AVEC SOUS-DOMAINE DNS
      const apiUrl = 'https://api.builderberu.com/api/admin/pending';
      
      console.log(`🔍 Connexion à: ${apiUrl}`);
      
      const response = await fetch(apiUrl);
      
      // 🔧 VÉRIFICATION CONTENT-TYPE
      const contentType = response.headers.get('content-type');
      console.log(`📋 Content-Type: ${contentType}`);
      
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Réponse non-JSON: ${contentType}`);
      }
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setPendingHunters(result.hunters);
        setConfidenceLevels(result.confidenceLevels);
        setPossibleIssues(result.possibleIssues);
        showTankMessage(`🛡️ ${result.hunters.length} hunters en attente (${result.highRisk || 0} à haut risque)`, true, 'kaisel');
      } else {
        throw new Error(result.error || `Erreur API: ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement pending:', error);
      
      // 🆕 MESSAGE D'ERREUR SPÉCIFIQUE
      if (error.message.includes('Failed to fetch')) {
        showTankMessage(`❌ Impossible de joindre api.builderberu.com. DNS configuré ? Serveur démarré ?`, true, 'kaisel');
      } else if (error.message.includes('Réponse non-JSON')) {
        showTankMessage(`❌ api.builderberu.com retourne du HTML. Vérifiez la config DNS/Nginx.`, true, 'kaisel');
      } else {
        showTankMessage(`❌ Erreur: ${error.message}`, true, 'kaisel');
      }
      
      setPendingHunters([]);
      
    } finally {
      setLoading(false);
    }
  };

  const loadAdminStats = async () => {
    try {
      const response = await fetch('https://api.builderberu.com/api/admin/stats');
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('⚠️ Stats admin: Réponse non-JSON, skip');
        return;
      }
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setAdminStats(result.stats);
      }
    } catch (error) {
      console.error('❌ Erreur stats admin (non-critique):', error);
    }
  };

  const loadDuplicates = async () => {
    try {
      const response = await fetch('https://api.builderberu.com/api/admin/duplicates');
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('⚠️ Duplicates: Réponse non-JSON, skip');
        return;
      }
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setDuplicateGroups(result.duplicateGroups);
      }
    } catch (error) {
      console.error('❌ Erreur doublons (non-critique):', error);
    }
  };

  // ✅ APPROUVER UN HUNTER - AMÉLIORÉ POUR DOUBLONS
  const handleApprove = async (hunterId, confidenceLevel, issues = [], adminNotes = '') => {
    try {
      const hunter = pendingHunters.find(h => h.id === hunterId);
      showTankMessage(`✅ Approbation de ${hunter?.pseudo} (${hunter?.accountId}) en cours...`, true, 'kaisel');
      
      const response = await fetch(`https://api.builderberu.com/api/admin/approve/${hunterId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confidenceLevel, issues, adminNotes })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        const updateType = result.isUpdate ? "🔄 MISE À JOUR" : "🆕 NOUVEAU";
        showTankMessage(
          `✅ ${updateType}: ${result.hunter.pseudo} (${result.hunter.accountId}) approuvé ! Rang #${result.rank}`, 
          true, 
          'kaisel'
        );
        loadPendingHunters(); // Recharger la liste
        loadDuplicates(); // Recharger les doublons
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
        loadDuplicates(); // Recharger les doublons
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

  // 🆕 COMPOSANT TOOLTIP CP
  const CpTooltip = ({ details, title, color }) => (
    <div className="cp-tooltip-admin">
      <p className="font-bold mb-2" style={{ color }}>{title}:</p>
      {details && details.map((detail, index) => (
        <div key={index} className="flex justify-between items-center mb-1">
          <span style={{ color: detail.color }} className="text-sm">{detail.name}:</span>
          <span className="text-gray-300 text-sm">
            {detail.value?.toLocaleString()} × {detail.multiplier} = 
            <span className="text-white font-bold ml-1">{detail.points?.toLocaleString()}</span>
          </span>
        </div>
      ))}
      <hr className="border-gray-600 my-2" />
      <div className="flex justify-between font-bold">
        <span style={{ color }}>Total:</span>
        <span style={{ color }}>
          {details?.reduce((sum, d) => sum + (d.points || 0), 0).toLocaleString()}
        </span>
      </div>
    </div>
  );

  // 🆕 COMPOSANT DUPLICATE BADGE INTELLIGENT
  const DuplicateBadge = ({ duplicates }) => {
    if (!duplicates || duplicates.length === 0) return null;
    
    const hasExactDuplicate = duplicates.some(d => d.type === 'exact_duplicate');
    const hasMultiChar = duplicates.some(d => d.type === 'multi_character_normal');
    
    if (hasExactDuplicate) {
      return (
        <div className="duplicate-badge-critical">
          🚨 DOUBLON EXACT
        </div>
      );
    } else if (hasMultiChar) {
      return (
        <div className="duplicate-badge-normal">
          ✅ MULTI-CHARACTER
        </div>
      );
    } else {
      return (
        <div className="duplicate-badge-warning">
          ⚠️ SUSPECT
        </div>
      );
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

        @media (max-width: 768px) {
          .screenshot-gallery {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }
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

        /* 🆕 TOOLTIPS CP STYLES */
        .cp-score-hover {
          position: relative;
          cursor: help;
          transition: all 0.3s ease;
        }

        .cp-score-hover:hover {
          transform: scale(1.05);
        }

        .cp-tooltip-admin {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 8px;
          background: rgba(0, 0, 0, 0.95);
          border: 1px solid rgba(255, 215, 0, 0.5);
          border-radius: 8px;
          padding: 12px;
          width: 320px;
          z-index: 1000;
          font-size: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        }

        @media (max-width: 768px) {
          .cp-tooltip-admin {
            width: 280px;
            left: 0;
            transform: none;
          }
        }

        /* 🆕 DUPLICATE BADGES */
        .duplicate-badge-critical {
          background: linear-gradient(135deg, #dc2626, #991b1b);
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: bold;
          animation: pulse 2s infinite;
        }

        .duplicate-badge-normal {
          background: linear-gradient(135deg, #059669, #047857);
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: bold;
        }

        .duplicate-badge-warning {
          background: linear-gradient(135deg, #d97706, #b45309);
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: bold;
        }

        /* 🆕 MOBILE OPTIMIZATIONS */
        @media (max-width: 768px) {
          .admin-card {
            padding: 16px;
          }
          
          .admin-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
          
          .mobile-stack {
            flex-direction: column;
            gap: 8px;
          }
          
          .mobile-full-width {
            width: 100%;
          }
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
                  <h1 className={`font-bold text-red-400 ${isMobileDevice ? 'text-lg' : 'text-2xl md:text-3xl'}`}>
                    Admin Validation Ultimate v3.0
                  </h1>
                  <p className={`text-gray-300 ${isMobileDevice ? 'text-xs' : 'text-sm'}`}>
                    CP Tooltips + Mobile + Doublons Intelligents • {pendingHunters.length} en attente
                    {duplicateGroups.length > 0 && (
                      <span className="text-yellow-400 ml-2">• {duplicateGroups.length} doublons</span>
                    )}
                  </p>
                </div>
              </div>

              <div className={`flex items-center gap-3 ${isMobileDevice ? 'mobile-stack' : ''}`}>
                {duplicateGroups.length > 0 && (
                  <button
                    onClick={() => setShowDuplicates(!showDuplicates)}
                    className={`px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 rounded-lg transition-colors text-sm ${isMobileDevice ? 'mobile-full-width' : ''}`}
                  >
                    🔍 Doublons ({duplicateGroups.length})
                  </button>
                )}
                
                <button
                  onClick={() => onShowHallOfFlame && onShowHallOfFlame()}
                  className={`px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 rounded-lg transition-colors text-sm ${isMobileDevice ? 'mobile-full-width' : ''}`}
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

          {/* Stats Admin v3.0 */}
          {adminStats.total > 0 && (
            <div className="relative z-10 p-4 md:p-6 border-b border-gray-700/50">
              <div className="max-w-7xl mx-auto">
                <div className={`grid gap-4 ${isMobileDevice ? 'admin-stats-grid' : 'grid-cols-2 md:grid-cols-6'}`}>
                  <div className="bg-black/30 rounded-lg p-4 border border-blue-500/20">
                    <p className="text-gray-400 text-sm">Total</p>
                    <p className={`font-bold text-blue-400 ${isMobileDevice ? 'text-lg' : 'text-2xl'}`}>{adminStats.total}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4 border border-green-500/20">
                    <p className="text-gray-400 text-sm">Validés</p>
                    <p className={`font-bold text-green-400 ${isMobileDevice ? 'text-lg' : 'text-2xl'}`}>{adminStats.validated}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4 border border-orange-500/20">
                    <p className="text-gray-400 text-sm">En attente</p>
                    <p className={`font-bold text-orange-400 ${isMobileDevice ? 'text-lg' : 'text-2xl'}`}>{adminStats.pending}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
                    <p className="text-gray-400 text-sm">Sets optimaux</p>
                    <p className={`font-bold text-purple-400 ${isMobileDevice ? 'text-lg' : 'text-2xl'}`}>{adminStats.withOptimalSets || 0}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4 border border-cyan-500/20">
                    <p className="text-gray-400 text-sm">Screenshots</p>
                    <p className={`font-bold text-cyan-400 ${isMobileDevice ? 'text-lg' : 'text-2xl'}`}>{adminStats.screenshotRate || 0}%</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4 border border-yellow-500/20">
                    <p className="text-gray-400 text-sm">Validation</p>
                    <p className={`font-bold text-yellow-400 ${isMobileDevice ? 'text-lg' : 'text-2xl'}`}>{adminStats.validationRate}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contenu principal */}
          <div className="relative z-10 flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto">

              {/* Onglets Validation / Doublons */}
              <div className={`flex gap-4 mb-6 ${isMobileDevice ? 'mobile-stack' : ''}`}>
                <button
                  onClick={() => setShowDuplicates(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${isMobileDevice ? 'mobile-full-width' : ''} ${
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
                    className={`px-4 py-2 rounded-lg transition-colors ${isMobileDevice ? 'mobile-full-width' : ''} ${
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
                  <h2 className={`font-bold text-yellow-400 mb-6 ${isMobileDevice ? 'text-lg' : 'text-xl'}`}>
                    🔍 Doublons Intelligents v3.0 ({duplicateGroups.length})
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
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-red-400 font-bold">⚠️ Groupe #{index + 1}</h3>
                            <div className="text-xs text-gray-400">
                              Actions recommandées: Validez pour écraser l'ancien
                            </div>
                          </div>
                          
                          <div className={`grid gap-4 ${isMobileDevice ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
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
                              <h4 className="text-red-400 font-bold mb-2">🔄 Nouvelle Soumission ({group.duplicates.length})</h4>
                              {group.duplicates.map((dup, dupIndex) => (
                                <div key={dupIndex} className="bg-green-900/20 rounded p-2 text-sm border border-green-500/30">
                                  <p className="text-white"><strong>{dup.hunter.pseudo}</strong> ({dup.hunter.accountId})</p>
                                  <p className="text-gray-300">{dup.hunter.character}</p>
                                  <div className="mt-2">
                                    <DuplicateBadge duplicates={[dup]} />
                                  </div>
                                  <p className="text-green-400 text-xs mt-1">
                                    💡 Validation = Mise à jour automatique
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
                      <h3 className="text-xl text-red-400 mb-2">Chargement des validations v3.0...</h3>
                      <p className="text-gray-400">Kaisel analyse les CP avec tooltips...</p>
                    </div>
                  ) : pendingHunters.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="text-6xl mb-4">✅</div>
                      <h3 className="text-xl text-green-400 mb-2">Aucune validation en attente</h3>
                      <p className="text-gray-400">Tous les hunters ont été traités !</p>
                    </div>
                  ) : (
                    <>
                      <h2 className={`font-bold text-red-400 mb-6 ${isMobileDevice ? 'text-lg' : 'text-xl'}`}>
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
                                  
                                  {/* Badge de risque */}
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

                                  {/* 🆕 Badge doublons intelligents */}
                                  <DuplicateBadge duplicates={hunter.autoAnalysis?.potentialDuplicates} />
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

                              {/* Info Hunter v3.0 */}
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

                              {/* 🆕 Scores détaillés AVEC TOOLTIPS */}
                              <div className="mb-4 space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-400 text-sm">CP Total:</span>
                                  <div 
                                    className="cp-score-hover relative"
                                    onMouseEnter={() => setShowCpTooltipTotal(hunter.id)}
                                    onMouseLeave={() => setShowCpTooltipTotal(null)}
                                  >
                                    <span className="text-yellow-400 font-bold">{hunter.totalScore?.toLocaleString()}</span>
                                    
                                    {/* TOOLTIP CP TOTAL */}
                                    {showCpTooltipTotal === hunter.id && hunter.cpDetailsTotal?.details && (
                                      <CpTooltip 
                                        details={hunter.cpDetailsTotal.details} 
                                        title="📊 CP Total"
                                        color="#ffd700"
                                      />
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex justify-between">
                                  <span className="text-gray-400 text-sm">CP Artifacts:</span>
                                  <div 
                                    className="cp-score-hover relative"
                                    onMouseEnter={() => setShowCpTooltipArtifacts(hunter.id)}
                                    onMouseLeave={() => setShowCpTooltipArtifacts(null)}
                                  >
                                    <span className="text-purple-400 font-bold">{hunter.artifactsScore?.toLocaleString() || 0}</span>
                                    
                                    {/* TOOLTIP CP ARTIFACTS */}
                                    {showCpTooltipArtifacts === hunter.id && hunter.cpDetailsArtifacts?.details && (
                                      <CpTooltip 
                                        details={hunter.cpDetailsArtifacts.details} 
                                        title="🎨 CP Artifacts"
                                        color="#a855f7"
                                      />
                                    )}
                                  </div>
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

                              {/* Analyse auto v3.0 */}
                              {hunter.autoAnalysis && (
                                <div className="mb-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400 text-sm">Analyse Auto v3.0:</span>
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

                                  {/* Message pour doublons */}
                                  {hunter.autoAnalysis.potentialDuplicates && hunter.autoAnalysis.potentialDuplicates.length > 0 && (
                                    <div className="mt-2 text-xs text-green-400">
                                      💡 Validation = Écrasement automatique de l'ancien
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
                                    handleReject(hunter.id, 'Non conforme v3.0');
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

      {/* 🔍 MODAL DÉTAILS VALIDATION ULTIMATE v3.0 */}
      {showDetails && selectedHunter && (
        <div className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center p-4">
          <div className={`bg-gray-900 rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-red-500 ${isMobileDevice ? 'max-w-sm' : 'max-w-6xl'}`}>
            
            {/* Header Modal v3.0 */}
            <div className="p-6 border-b border-red-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`font-bold text-red-400 ${isMobileDevice ? 'text-lg' : 'text-2xl'}`}>🛡️ Validation Détaillée v3.0</h2>
                  <div className={`flex items-center gap-4 mt-2 ${isMobileDevice ? 'flex-col items-start gap-2' : ''}`}>
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

            {/* Contenu Modal v3.0 avec responsive */}
            <div className="p-6">
              
              {/* 🆕 Scores & Analyse v3.0 AVEC TOOLTIPS MOBILES */}
              <div className={`grid gap-4 mb-6 ${isMobileDevice ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-4'}`}>
                <div className="bg-black/30 rounded-lg p-4">
                  <h3 className="text-yellow-400 font-bold mb-2">🏆 CP Total</h3>
                  <div 
                    className="cp-score-hover relative"
                    onMouseEnter={() => setShowCpTooltipTotal('modal-total')}
                    onMouseLeave={() => setShowCpTooltipTotal(null)}
                    onClick={() => isMobileDevice && setShowCpTooltipTotal(showCpTooltipTotal === 'modal-total' ? null : 'modal-total')}
                  >
                    <p className={`font-bold text-yellow-400 ${isMobileDevice ? 'text-lg cursor-pointer' : 'text-2xl'}`}>
                      {selectedHunter.totalScore?.toLocaleString()}
                    </p>
                    
                    {/* TOOLTIP CP TOTAL MODAL */}
                    {showCpTooltipTotal === 'modal-total' && selectedHunter.cpDetailsTotal?.details && (
                      <CpTooltip 
                        details={selectedHunter.cpDetailsTotal.details} 
                        title="📊 CP Total Détaillé"
                        color="#ffd700"
                      />
                    )}
                  </div>
                  
                  {selectedHunter.setValidation?.isOptimal && (
                    <p className="text-green-400 text-xs mt-1">🏆 +5% bonus set appliqué</p>
                  )}
                </div>
                
                <div className="bg-black/30 rounded-lg p-4">
                  <h3 className="text-purple-400 font-bold mb-2">🎨 CP Artefacts</h3>
                  <div 
                    className="cp-score-hover relative"
                    onMouseEnter={() => setShowCpTooltipArtifacts('modal-artifacts')}
                    onMouseLeave={() => setShowCpTooltipArtifacts(null)}
                    onClick={() => isMobileDevice && setShowCpTooltipArtifacts(showCpTooltipArtifacts === 'modal-artifacts' ? null : 'modal-artifacts')}
                  >
                    <p className={`font-bold text-purple-400 ${isMobileDevice ? 'text-lg cursor-pointer' : 'text-2xl'}`}>
                      {selectedHunter.artifactsScore?.toLocaleString() || 0}
                    </p>
                    
                    {/* TOOLTIP CP ARTIFACTS MODAL */}
                    {showCpTooltipArtifacts === 'modal-artifacts' && selectedHunter.cpDetailsArtifacts?.details && (
                      <CpTooltip 
                        details={selectedHunter.cpDetailsArtifacts.details} 
                        title="🎨 CP Artefacts Détaillé"
                        color="#a855f7"
                      />
                    )}
                  </div>
                </div>
                
                <div className="bg-black/30 rounded-lg p-4">
                  <h3 className="text-blue-400 font-bold mb-2">🤖 Score Auto v3.0</h3>
                  <p className={`font-bold text-blue-400 ${isMobileDevice ? 'text-lg' : 'text-2xl'}`}>
                    {selectedHunter.autoAnalysis?.suggestedScore || 0}%
                  </p>
                  <div className="mt-2 text-xs">
                    <p className="text-gray-400">Issues: {selectedHunter.autoAnalysis?.issues.length || 0}</p>
                    <p className="text-gray-400">Risque: {selectedHunter.autoAnalysis?.riskLevel || 'unknown'}</p>
                  </div>
                </div>
                
                <div className="bg-black/30 rounded-lg p-4">
                  <h3 className="text-cyan-400 font-bold mb-2">📊 Ratio & Stats</h3>
                  <p className={`font-bold text-cyan-400 ${isMobileDevice ? 'text-lg' : 'text-2xl'}`}>
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

              {/* Actions de validation v3.0 - MOBILE OPTIMIZED */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-white font-bold mb-4">🎯 Actions de Validation v3.0</h3>
                
                <div className={`grid gap-4 ${isMobileDevice ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                  {/* Approbation */}
                  <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
                    <h4 className="text-green-400 font-bold mb-3">✅ Approuver {selectedHunter.autoAnalysis?.potentialDuplicates?.length > 0 ? '(Écrasement automatique)' : ''}</h4>
                    
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
                        <label className="block text-sm text-gray-300 mb-2">Notes admin v3.0 :</label>
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
                        <label className="block text-sm text-gray-300 mb-2">Raison du rejet v3.0 :</label>
                        <select 
                          className="w-full bg-black/50 border border-red-500/30 rounded px-3 py-2 text-white"
                          id="rejectReason"
                        >
                          <option value="Non conforme v3.0">Non conforme aux standards v3.0</option>
                          <option value="Pseudo/AccountID invalide">Pseudo ou Account ID invalide</option>
                          <option value="Screenshots manquants">Screenshots obligatoires manquants</option>
                          <option value="Stats impossibles">Stats impossibles/trichées</option>
                          <option value="Screenshots suspects">Screenshots suspects</option>
                          <option value="Doublon malveillant">Doublon malveillant détecté</option>
                          <option value="CP incohérent">CP incohérent avec les stats</option>
                          <option value="Sets invalides">Sets d'artefacts invalides</option>
                          <option value="Set bonus manquant">Bonus set manquant</option>
                          <option value="Autre">Autre raison</option>
                        </select>
                      </div>
                      
                      <div className="bg-red-900/30 rounded p-3">
                        <p className="text-red-300 text-sm">
                          ⚠️ <strong>Action irréversible v3.0</strong><br/>
                          Ce hunter ({selectedHunter.pseudo} - {selectedHunter.accountId}) sera définitivement supprimé.
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