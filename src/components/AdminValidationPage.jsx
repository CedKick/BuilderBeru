// AdminValidationPage.jsx - 🛡️ ADMIN VALIDATION KAISEL v5.0 - SYSTÈME CHECKED/NOTATION
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
  
  // 🆕 STATES POUR TOOLTIPS CP
  const [showCpTooltipTotal, setShowCpTooltipTotal] = useState(null);
  const [showCpTooltipArtifacts, setShowCpTooltipArtifacts] = useState(null);
  
  // 🆕 STATE POUR NOTATION v5.0
  const [selectedNotation, setSelectedNotation] = useState(70);
  const [adminNotes, setAdminNotes] = useState('');
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);

  // 🔍 DÉTECTION MOBILE
  const [isMobileDevice, setIsMobileDevice] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileDevice(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // 📊 CHARGER LES HUNTERS EN ATTENTE
  useEffect(() => {
    loadPendingHunters();
    loadAdminStats();
  }, []);

  const loadPendingHunters = async () => {
    try {
      setLoading(true);
      showTankMessage("🛡️ Chargement des hunters v5.0...", true, 'kaisel');
      
      const apiUrl = 'https://api.builderberu.com/api/admin/pending';
      
      const response = await fetch(apiUrl);
      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Réponse non-JSON: ${contentType}`);
      }
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setPendingHunters(result.hunters);
        setConfidenceLevels(result.confidenceLevels);
        setPossibleIssues(result.possibleIssues);
        showTankMessage(`🛡️ ${result.hunters.length} hunters en attente`, true, 'kaisel');
      } else {
        throw new Error(result.error || `Erreur API: ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement pending:', error);
      showTankMessage(`❌ Erreur: ${error.message}`, true, 'kaisel');
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

  // 🆕 OUVRIR MODAL COMPARAISON v5.0
  const handleOpenComparison = (hunter, duplicate) => {
    setComparisonData({ new: hunter, old: duplicate.hunter });
    setShowComparisonModal(true);
  };

  // ✅ APPROUVER UN HUNTER - v5.0 AVEC NOTATION
  const handleApprove = async (hunterId, notationData = selectedNotation, notes = adminNotes, isUpdate = false, oldHunterId = null) => {
    try {
      const hunter = pendingHunters.find(h => h.id === hunterId);
      
      // 🔄 VÉRIFICATION MISE À JOUR
      const duplicates = hunter?.autoAnalysis?.potentialDuplicates || [];
      const exactDuplicate = duplicates.find(d => 
        d.type === 'exact_duplicate_v3' || 
        (d.hunter.pseudo === hunter.pseudo && d.hunter.accountId === hunter.accountId && d.hunter.character === hunter.character)
      );
      
      if (exactDuplicate && !isUpdate) {
        const confirmed = window.confirm(
          `🔄 MISE À JOUR DÉTECTÉE!\n\n` +
          `Hunter: ${hunter.pseudo} (${hunter.accountId}) - ${hunter.character}\n\n` +
          `Ancien CP: ${exactDuplicate.hunter.totalScore?.toLocaleString() || 'N/A'}\n` +
          `Nouveau CP: ${hunter.totalScore?.toLocaleString() || 'N/A'}\n\n` +
          `Voulez-vous remplacer l'ancienne version ?`
        );

        if (!confirmed) {
          showTankMessage("🛡️ Validation annulée", true, 'kaisel');
          return;
        }
        
        isUpdate = true;
        oldHunterId = exactDuplicate.hunter.id;
      }

      showTankMessage(`✅ Approbation de ${hunter?.pseudo} en cours...`, true, 'kaisel');
      
      const response = await fetch(`https://api.builderberu.com/api/admin/approve/${hunterId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          notationData,
          adminNotes: notes,
          isUpdate,
          oldHunterId
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        const updateType = result.isUpdate ? "🔄 MISE À JOUR" : "🆕 NOUVEAU";
        showTankMessage(
          `✅ ${updateType}: ${result.hunter.pseudo} approuvé avec note ${notationData}/100! Rang #${result.rank}`, 
          true, 
          'kaisel'
        );
        loadPendingHunters();
        setShowDetails(false);
        setSelectedNotation(70);
        setAdminNotes('');
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
        showTankMessage(`🗑️ ${result.rejected.pseudo} supprimé`, true, 'kaisel');
        loadPendingHunters();
        setShowDetails(false);
      } else {
        throw new Error(result.error || 'Erreur suppression');
      }
      
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      showTankMessage(`❌ Erreur: ${error.message}`, true, 'kaisel');
    }
  };

  // 🔍 VOIR DÉTAILS
  const handleViewDetails = (hunter) => {
    setSelectedHunter(hunter);
    setShowDetails(true);
    // Reset notation par défaut
    setSelectedNotation(hunter.autoAnalysis?.suggestedScore || 70);
    setAdminNotes('');
  };

  // 📊 FORMATER STATS
  const formatStat = (value) => {
    if (typeof value !== 'number') return '0';
    return Math.round(value).toLocaleString();
  };

  // 🎨 COULEUR ÉLÉMENT
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

  // 🚨 COULEUR RISQUE
  const getRiskColor = (riskLevel) => {
    switch(riskLevel) {
      case 'low': return '#22c55e';
      case 'medium': return '#eab308';
      case 'high': return '#ef4444';
      default: return '#888';
    }
  };

  // 🆕 COULEUR NOTATION v5.0
  const getNotationColor = (notation) => {
    if (notation >= 90) return '#00ff41';
    if (notation >= 70) return '#22c55e';
    if (notation >= 50) return '#eab308';
    return '#ef4444';
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

  // 🆕 BADGE MISE À JOUR
  const UpdateBadge = ({ duplicates, hunter }) => {
    if (!duplicates || duplicates.length === 0) return null;
    
    const exactDuplicate = duplicates.find(d => 
      d.type === 'exact_duplicate_v3' ||
      (d.hunter.pseudo === hunter.pseudo && d.hunter.accountId === hunter.accountId && d.hunter.character === hunter.character)
    );
    
    const pseudoChange = duplicates.find(d => d.type === 'pseudo_change_v3');
    const multiChar = duplicates.find(d => d.type === 'multi_character_normal');
    
    if (exactDuplicate) {
      return (
        <div className="update-badge-detected">
          🔄 MISE À JOUR
        </div>
      );
    } else if (pseudoChange) {
      return (
        <div className="update-badge-suspicious">
          🚨 PSEUDO CHANGÉ
        </div>
      );
    } else if (multiChar) {
      return (
        <div className="update-badge-normal">
          ✅ MULTI-CHARACTER
        </div>
      );
    }
    
    return null;
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
  background: rgba(0, 0, 0, 0.4);
}

        .screenshot-item:hover {
  border-color: #ffd700;
  transform: scale(1.02);
  box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3);
}

.screenshot-item img {
  width: 100%;
  height: 200px; /* Plus grand ! */
  object-fit: cover;
  transition: transform 0.3s ease;
}

.screenshot-item:hover img {
  transform: scale(1.05);
}

@media (min-width: 768px) {
  .screenshot-item img {
    height: 250px; /* Encore plus grand sur desktop */
  }
}

@media (min-width: 1024px) {
  .screenshot-item img {
    height: 300px; /* Maximum sur grand écran */
  }
}
        .optimal-set-badge {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        /* 🆕 TOOLTIPS CP */
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

        /* 🆕 UPDATE BADGES v5.0 */
        .update-badge-detected {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: bold;
          animation: pulse 2s infinite;
          border: 1px solid #f59e0b;
        }

        .update-badge-suspicious {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: bold;
          animation: pulse 1s infinite;
          border: 1px solid #ef4444;
        }

        .update-badge-normal {
          background: linear-gradient(135deg, #059669, #047857);
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: bold;
        }

        /* 🔄 UPDATE WARNING OVERLAY */
        .update-warning-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.2));
          border: 2px solid #f59e0b;
          border-radius: 8px;
          padding: 4px;
          pointer-events: none;
        }

        /* 🆕 NOTATION SLIDER v5.0 */
        .notation-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 5px;
          background: #333;
          outline: none;
          transition: all 0.3s;
        }

        .notation-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--notation-color);
          cursor: pointer;
          transition: all 0.3s;
        }

        .notation-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--notation-color);
          cursor: pointer;
          transition: all 0.3s;
        }

        .notation-slider:hover::-webkit-slider-thumb {
          transform: scale(1.2);
        }

        /* 🆕 COMPARISON MODAL v5.0 */
        .comparison-modal {
          background: rgba(0, 0, 0, 0.98);
          backdrop-filter: blur(20px);
          border: 2px solid #ffd700;
        }

        .comparison-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        @media (max-width: 768px) {
          .comparison-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }

        .comparison-column {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .comparison-column.old {
          border-color: rgba(239, 68, 68, 0.4);
        }

        .comparison-column.new {
          border-color: rgba(34, 197, 94, 0.4);
        }

        .stat-diff {
          font-size: 0.75rem;
          margin-left: 0.5rem;
        }

        .stat-diff.positive {
          color: #22c55e;
        }

        .stat-diff.negative {
          color: #ef4444;
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
                    Admin Validation Kaisel v5.0
                  </h1>
                  <p className={`text-gray-300 ${isMobileDevice ? 'text-xs' : 'text-sm'}`}>
                    Système Checked/Notation • {pendingHunters.length} en attente
                  </p>
                </div>
              </div>

              <div className={`flex items-center gap-3 ${isMobileDevice ? 'mobile-stack' : ''}`}>
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

          {/* Stats Admin */}
          {adminStats.total > 0 && (
            <div className="relative z-10 p-4 md:p-6 border-b border-gray-700/50">
              <div className="max-w-7xl mx-auto">
                <div className={`grid gap-4 ${isMobileDevice ? 'admin-stats-grid' : 'grid-cols-2 md:grid-cols-6'}`}>
                  <div className="bg-black/30 rounded-lg p-4 border border-blue-500/20">
                    <p className="text-gray-400 text-sm">Total</p>
                    <p className={`font-bold text-blue-400 ${isMobileDevice ? 'text-lg' : 'text-2xl'}`}>{adminStats.total}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4 border border-green-500/20">
                    <p className="text-gray-400 text-sm">Vérifiés</p>
                    <p className={`font-bold text-green-400 ${isMobileDevice ? 'text-lg' : 'text-2xl'}`}>{adminStats.checked || 0}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4 border border-orange-500/20">
                    <p className="text-gray-400 text-sm">En attente</p>
                    <p className={`font-bold text-orange-400 ${isMobileDevice ? 'text-lg' : 'text-2xl'}`}>{adminStats.pending || 0}</p>
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
                    <p className="text-gray-400 text-sm">Note moyenne</p>
                    <p className={`font-bold text-yellow-400 ${isMobileDevice ? 'text-lg' : 'text-2xl'}`}>{adminStats.avgNotation || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contenu principal */}
          <div className="relative z-10 flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto">

              {/* Section Validation */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="text-6xl mb-4 animate-spin">🛡️</div>
                  <h3 className="text-xl text-red-400 mb-2">Chargement Kaisel v5.0...</h3>
                  <p className="text-gray-400">Analyse des hunters en cours...</p>
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
                      
                      // 🔄 VÉRIFIER DOUBLONS
                      const duplicates = hunter.autoAnalysis?.potentialDuplicates || [];
                      const exactDuplicate = duplicates.find(d => 
                        d.type === 'exact_duplicate_v3' ||
                        (d.hunter.pseudo === hunter.pseudo && d.hunter.accountId === hunter.accountId && d.hunter.character === hunter.character)
                      );
                      const pseudoChange = duplicates.find(d => d.type === 'pseudo_change_v3');
                      
                      return (
                        <div
                          key={hunter.id}
                          className={`admin-card rounded-xl p-6 cursor-pointer relative ${
                            hunter.autoAnalysis?.riskLevel === 'high' ? 'high-risk' : ''
                          }`}
                          onClick={() => handleViewDetails(hunter)}
                        >
                          {/* 🔄 OVERLAY MISE À JOUR */}
                          {(exactDuplicate || pseudoChange) && (
                            <div className="update-warning-overlay">
                              <div className="text-center text-yellow-400 font-bold text-xs">
                                {pseudoChange ? '🚨 PSEUDO CHANGÉ' : '🔄 MISE À JOUR DISPONIBLE'}
                              </div>
                            </div>
                          )}

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

                              {/* Badge mises à jour */}
                              <UpdateBadge duplicates={hunter.autoAnalysis?.potentialDuplicates} hunter={hunter} />
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

                          {/* Info Hunter */}
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

                          {/* Scores détaillés AVEC TOOLTIPS */}
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

                          {/* Analyse auto */}
                          {hunter.autoAnalysis && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-400 text-sm">Analyse Auto:</span>
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

                              {/* Message pour mises à jour/doublons */}
                              {exactDuplicate && (
                                <div className="mt-2 text-xs text-yellow-400 bg-yellow-900/20 p-2 rounded border border-yellow-500/30">
                                  🔄 Mise à jour d'un hunter existant
                                </div>
                              )}
                              
                              {pseudoChange && (
                                <div className="mt-2 text-xs text-red-400 bg-red-900/20 p-2 rounded border border-red-500/30">
                                  🚨 Changement de pseudo détecté !
                                </div>
                              )}
                              
                              {hunter.autoAnalysis.potentialDuplicates && hunter.autoAnalysis.potentialDuplicates.length > 0 && 
                               hunter.autoAnalysis.potentialDuplicates.some(d => d.type === 'multi_character_normal') && (
                                <div className="mt-2 text-xs text-green-400">
                                  ✅ Multi-character normal détecté
                                </div>
                              )}
                            </div>
                          )}

                          {/* Actions rapides */}
                          <div className="flex gap-2 mt-4">
                            {/* 🆕 BOUTON COMPARAISON v5.0 */}
                            {(exactDuplicate || pseudoChange) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenComparison(hunter, exactDuplicate || pseudoChange);
                                }}
                                className="bg-yellow-600/20 hover:bg-yellow-600/40 px-3 py-2 rounded text-yellow-400 text-sm font-bold transition-colors"
                                title="Comparer les versions"
                              >
                                🔍 Comparer
                              </button>
                            )}
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(hunter.id, hunter.autoAnalysis?.suggestedScore || 70);
                              }}
                              className="approval-button flex-1 px-3 py-2 rounded text-white text-sm font-bold"
                              title="Approuver ce hunter"
                            >
                              {exactDuplicate ? '🔄 Valider MAJ' : '✅ Approuver'}
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReject(hunter.id, 'Non conforme');
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
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 MODAL DÉTAILS VALIDATION ULTRA-COMPLET v5.0 */}
      {showDetails && selectedHunter && (
        <div className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center p-4">
          <div className={`bg-gray-900 rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-red-500 ${isMobileDevice ? 'max-w-sm' : 'max-w-6xl'}`}>
            
            {/* Header Modal */}
            <div className="p-6 border-b border-red-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`font-bold text-red-400 ${isMobileDevice ? 'text-lg' : 'text-2xl'}`}>🛡️ Validation Détaillée Kaisel v5.0</h2>
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
                  
                  {/* ALERTE MISE À JOUR/DOUBLON DANS LE HEADER */}
                  {(() => {
                    const duplicates = selectedHunter.autoAnalysis?.potentialDuplicates || [];
                    const exactDuplicate = duplicates.find(d => 
                      d.type === 'exact_duplicate_v3' ||
                      (d.hunter.pseudo === selectedHunter.pseudo && d.hunter.accountId === selectedHunter.accountId && d.hunter.character === selectedHunter.character)
                    );
                    const pseudoChange = duplicates.find(d => d.type === 'pseudo_change_v3');
                    
                    if (exactDuplicate || pseudoChange) {
                      return (
                        <div className="mt-3 p-3 bg-yellow-900/30 rounded-lg border border-yellow-500/50">
                          <p className="text-yellow-400 font-bold text-sm">
                            {pseudoChange ? '🚨 CHANGEMENT DE PSEUDO DÉTECTÉ' : '🔄 MISE À JOUR DÉTECTÉE'}
                          </p>
                          <p className="text-yellow-300 text-xs mt-1">
                            {pseudoChange ? 
                              `Ancien pseudo: ${pseudoChange.hunter.pseudo} → Nouveau: ${selectedHunter.pseudo}` :
                              'Ce hunter existe déjà. Vérifiez les améliorations avant validation.'
                            }
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
                
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-10 h-10 rounded-full bg-red-600/20 hover:bg-red-600/40 text-red-400 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Contenu Modal */}
            <div className="p-6">
              
              {/* 🆕 COMPARAISON AVEC VERSION EXISTANTE v5.0 */}
              {(() => {
                const duplicates = selectedHunter.autoAnalysis?.potentialDuplicates || [];
                const duplicate = duplicates.find(d => 
                  d.type === 'exact_duplicate_v3' || d.type === 'pseudo_change_v3' ||
                  (d.hunter.accountId === selectedHunter.accountId && d.hunter.character === selectedHunter.character)
                );
                
                if (duplicate) {
                  const oldHunter = duplicate.hunter;
                  const statsDiff = {
                    CP: selectedHunter.totalScore - (oldHunter.totalScore || 0),
                    CPArtifacts: selectedHunter.artifactsScore - (oldHunter.artifactsScore || 0),
                    Attack: (selectedHunter.currentStats?.Attack || 0) - (oldHunter.currentStats?.Attack || 0),
                    Defense: (selectedHunter.currentStats?.Defense || 0) - (oldHunter.currentStats?.Defense || 0),
                    HP: (selectedHunter.currentStats?.HP || 0) - (oldHunter.currentStats?.HP || 0),
                  };
                  
                  return (
                    <div className="mb-6 p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/50">
                      <h3 className="text-yellow-400 font-bold mb-3">
                        {duplicate.type === 'pseudo_change_v3' ? '🚨 Comparaison (Pseudo changé)' : '🔄 Comparaison avec la version existante'}
                      </h3>
                      
                      <div className={`grid gap-4 ${isMobileDevice ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {/* Version actuelle */}
                        <div className="comparison-column old">
                          <h4 className="text-red-400 font-bold mb-3">📋 Version Actuelle</h4>
                          <div className="space-y-2 text-sm">
                            <p><strong>Pseudo:</strong> {oldHunter.pseudo}</p>
                            <p><strong>CP Total:</strong> {oldHunter.totalScore?.toLocaleString() || 'N/A'}</p>
                            <p><strong>CP Artefacts:</strong> {oldHunter.artifactsScore?.toLocaleString() || 'N/A'}</p>
                            <p><strong>Attack:</strong> {oldHunter.currentStats?.Attack?.toLocaleString() || 'N/A'}</p>
                            <p><strong>Defense:</strong> {oldHunter.currentStats?.Defense?.toLocaleString() || 'N/A'}</p>
                            <p><strong>HP:</strong> {oldHunter.currentStats?.HP?.toLocaleString() || 'N/A'}</p>
                            
                            {/* Artefacts actuels */}
                            {oldHunter.currentArtifacts && Object.keys(oldHunter.currentArtifacts).length > 0 && (
                              <>
                                <hr className="border-gray-700 my-2" />
                                <p className="text-yellow-400 font-bold">Artefacts:</p>
                                {Object.entries(oldHunter.currentArtifacts).map(([slot, artifact]) => (
                                  <p key={slot} className="text-xs">
                                    {slot}: {artifact.set || 'Aucun'} ({artifact.mainStat})
                                  </p>
                                ))}
                              </>
                            )}
                            
                            {/* Cores actuels */}
                            {oldHunter.currentCores && Object.keys(oldHunter.currentCores).length > 0 && (
                              <>
                                <hr className="border-gray-700 my-2" />
                                <p className="text-orange-400 font-bold">Noyaux:</p>
                                {Object.entries(oldHunter.currentCores).map(([slot, core]) => (
                                  <p key={slot} className="text-xs">
                                    {slot}: {core.name || core.type || 'Noyau'}
                                  </p>
                                ))}
                              </>
                            )}
                            
                            {/* Gems actuels */}
                            {oldHunter.currentGems && Object.keys(oldHunter.currentGems).length > 0 && (
                              <>
                                <hr className="border-gray-700 my-2" />
                                <p className="text-pink-400 font-bold">Gemmes:</p>
                                {Object.entries(oldHunter.currentGems).map(([slot, gem]) => (
                                  <p key={slot} className="text-xs">
                                    {slot}: {gem.name || gem.type || 'Gemme'}
                                  </p>
                                ))}
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Nouvelle version */}
                        <div className="comparison-column new">
                          <h4 className="text-green-400 font-bold mb-3">🆕 Nouvelle Version</h4>
                          <div className="space-y-2 text-sm">
                            <p><strong>Pseudo:</strong> {selectedHunter.pseudo}
                              {duplicate.type === 'pseudo_change_v3' && (
                                <span className="text-red-400 ml-2">⚠️ CHANGÉ</span>
                              )}
                            </p>
                            <p><strong>CP Total:</strong> {selectedHunter.totalScore?.toLocaleString() || 'N/A'}
                              {statsDiff.CP !== 0 && (
                                <span className={`stat-diff ${statsDiff.CP > 0 ? 'positive' : 'negative'}`}>
                                  ({statsDiff.CP > 0 ? '+' : ''}{statsDiff.CP.toLocaleString()})
                                </span>
                              )}
                            </p>
                            <p><strong>CP Artefacts:</strong> {selectedHunter.artifactsScore?.toLocaleString() || 'N/A'}
                              {statsDiff.CPArtifacts !== 0 && (
                                <span className={`stat-diff ${statsDiff.CPArtifacts > 0 ? 'positive' : 'negative'}`}>
                                  ({statsDiff.CPArtifacts > 0 ? '+' : ''}{statsDiff.CPArtifacts.toLocaleString()})
                                </span>
                              )}
                            </p>
                            <p><strong>Attack:</strong> {selectedHunter.currentStats?.Attack?.toLocaleString() || 'N/A'}
                              {statsDiff.Attack !== 0 && (
                                <span className={`stat-diff ${statsDiff.Attack > 0 ? 'positive' : 'negative'}`}>
                                  ({statsDiff.Attack > 0 ? '+' : ''}{statsDiff.Attack.toLocaleString()})
                                </span>
                              )}
                            </p>
                            <p><strong>Defense:</strong> {selectedHunter.currentStats?.Defense?.toLocaleString() || 'N/A'}
                              {statsDiff.Defense !== 0 && (
                                <span className={`stat-diff ${statsDiff.Defense > 0 ? 'positive' : 'negative'}`}>
                                  ({statsDiff.Defense > 0 ? '+' : ''}{statsDiff.Defense.toLocaleString()})
                                </span>
                              )}
                            </p>
                            <p><strong>HP:</strong> {selectedHunter.currentStats?.HP?.toLocaleString() || 'N/A'}
                              {statsDiff.HP !== 0 && (
                                <span className={`stat-diff ${statsDiff.HP > 0 ? 'positive' : 'negative'}`}>
                                  ({statsDiff.HP > 0 ? '+' : ''}{statsDiff.HP.toLocaleString()})
                                </span>
                              )}
                            </p>
                            
                            {/* Nouveaux artefacts */}
                            {selectedHunter.currentArtifacts && Object.keys(selectedHunter.currentArtifacts).length > 0 && (
                              <>
                                <hr className="border-gray-700 my-2" />
                                <p className="text-yellow-400 font-bold">Artefacts:</p>
                                {Object.entries(selectedHunter.currentArtifacts).map(([slot, artifact]) => (
                                  <p key={slot} className="text-xs">
                                    {slot}: {artifact.set || 'Aucun'} ({artifact.mainStat})
                                    {oldHunter.currentArtifacts?.[slot]?.set !== artifact.set && (
                                      <span className="text-green-400 ml-1">✨ CHANGÉ</span>
                                    )}
                                  </p>
                                ))}
                              </>
                            )}
                            
                            {/* Nouveaux cores */}
                            {selectedHunter.currentCores && Object.keys(selectedHunter.currentCores).length > 0 && (
                              <>
                                <hr className="border-gray-700 my-2" />
                                <p className="text-orange-400 font-bold">Noyaux:</p>
                                {Object.entries(selectedHunter.currentCores).map(([slot, core]) => (
                                  <p key={slot} className="text-xs">
                                    {slot}: {core.name || core.type || 'Noyau'}
                                    {(!oldHunter.currentCores?.[slot] || 
                                      oldHunter.currentCores[slot].name !== core.name) && (
                                      <span className="text-green-400 ml-1">✨ CHANGÉ</span>
                                    )}
                                  </p>
                                ))}
                              </>
                            )}
                            
                            {/* Nouvelles gems */}
                            {selectedHunter.currentGems && Object.keys(selectedHunter.currentGems).length > 0 && (
                              <>
                                <hr className="border-gray-700 my-2" />
                                <p className="text-pink-400 font-bold">Gemmes:</p>
                                {Object.entries(selectedHunter.currentGems).map(([slot, gem]) => (
                                  <p key={slot} className="text-xs">
                                    {slot}: {gem.name || gem.type || 'Gemme'}
                                    {(!oldHunter.currentGems?.[slot] || 
                                      oldHunter.currentGems[slot].name !== gem.name) && (
                                      <span className="text-green-400 ml-1">✨ CHANGÉ</span>
                                    )}
                                  </p>
                                ))}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Résumé des changements */}
                      <div className="mt-4 p-3 bg-black/30 rounded">
                        <p className="text-yellow-300 font-bold text-sm mb-2">📊 Résumé des changements:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div className={`p-2 rounded ${statsDiff.CP > 0 ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                            <p className="text-gray-400">CP Total</p>
                            <p className={`font-bold ${statsDiff.CP > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {statsDiff.CP > 0 ? '+' : ''}{statsDiff.CP.toLocaleString()}
                            </p>
                          </div>
                          <div className={`p-2 rounded ${statsDiff.CPArtifacts > 0 ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                            <p className="text-gray-400">CP Artifacts</p>
                            <p className={`font-bold ${statsDiff.CPArtifacts > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {statsDiff.CPArtifacts > 0 ? '+' : ''}{statsDiff.CPArtifacts.toLocaleString()}
                            </p>
                          </div>
                          <div className={`p-2 rounded ${statsDiff.Attack > 0 ? 'bg-green-900/30' : statsDiff.Attack < 0 ? 'bg-red-900/30' : 'bg-gray-900/30'}`}>
                            <p className="text-gray-400">Attack</p>
                            <p className={`font-bold ${statsDiff.Attack > 0 ? 'text-green-400' : statsDiff.Attack < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                              {statsDiff.Attack > 0 ? '+' : ''}{statsDiff.Attack.toLocaleString()}
                            </p>
                          </div>
                          <div className={`p-2 rounded ${statsDiff.Defense > 0 ? 'bg-green-900/30' : statsDiff.Defense < 0 ? 
                          'bg-red-900/30' : 'bg-gray-900/30'}`}>
                           <p className="text-gray-400">Defense</p>
                           <p className={`font-bold ${statsDiff.Defense > 0 ? 'text-green-400' : statsDiff.Defense < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                             {statsDiff.Defense > 0 ? '+' : ''}{statsDiff.Defense.toLocaleString()}
                           </p>
                         </div>
                       </div>
                     </div>
                   </div>
                 );
               }
               return null;
             })()}
             
             {/* Scores & Analyse AVEC TOOLTIPS */}
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
                 <h3 className="text-blue-400 font-bold mb-2">🤖 Score Auto</h3>
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

             {/* STATS DÉTAILLÉES */}
             <div className={`grid gap-4 mb-6 ${isMobileDevice ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
               <div className="bg-black/30 rounded-lg p-4 border border-green-500/20">
                 <h3 className="text-green-400 font-bold mb-4">⚡ Stats Totales</h3>
                 <div className="space-y-2">
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
                 <div className="space-y-2">
                   {selectedHunter.statsFromArtifacts && Object.entries(selectedHunter.statsFromArtifacts).map(([stat, value]) => (
                     <div key={stat} className="flex justify-between">
                       <span className="text-gray-400">{stat}:</span>
                       <span className="text-white font-bold">{formatStat(value)}</span>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="bg-black/30 rounded-lg p-4 border border-blue-500/20">
                 <h3 className="text-blue-400 font-bold mb-4">⚔️ Équipements</h3>
                 <div className="space-y-2">
                   {selectedHunter.currentWeapon && selectedHunter.currentWeapon.name && (
                     <div>
                       <span className="text-gray-400">Arme:</span>
                       <p className="text-white text-sm">{selectedHunter.currentWeapon.name}</p>
                     </div>
                   )}
                   {selectedHunter.currentCores && Object.keys(selectedHunter.currentCores).length > 0 && (
                     <div>
                       <span className="text-gray-400">Noyaux:</span>
                       <p className="text-orange-400 text-sm">{Object.keys(selectedHunter.currentCores).length} équipés</p>
                     </div>
                   )}
                   {selectedHunter.currentGems && Object.keys(selectedHunter.currentGems).length > 0 && (
                     <div>
                       <span className="text-gray-400">Gemmes:</span>
                       <p className="text-pink-400 text-sm">{Object.keys(selectedHunter.currentGems).length} équipées</p>
                     </div>
                   )}
                 </div>
               </div>
             </div>

             {/* ARTEFACTS DÉTAILLÉS */}
             {selectedHunter.currentArtifacts && Object.keys(selectedHunter.currentArtifacts).length > 0 && (
               <div className="bg-black/30 rounded-lg p-4 border border-yellow-500/20 mb-6">
                 <h3 className="text-yellow-400 font-bold mb-4">🎨 Artefacts Équipés</h3>
                 <div className={`grid gap-3 ${isMobileDevice ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
                   {Object.entries(selectedHunter.currentArtifacts).map(([slot, artifact]) => (
                     <div key={slot} className="artifact-slot-admin">
                       <h4 className="text-yellow-400 font-bold mb-2 text-sm">{slot}</h4>
                       <p className="text-blue-400 mb-2 text-xs">{artifact.set || 'Aucun Set'}</p>
                       
                       {/* Main Stat */}
                       <div className="mb-3">
                         <p className="text-gray-400 text-xs">Main:</p>
                         <p className="text-white font-bold text-sm">
                           {artifact.mainStat || 'N/A'}
                           {artifact.mainStatValue && ` (+${Math.round(artifact.mainStatValue)})`}
                         </p>
                       </div>

                       {/* Sub Stats */}
                       <div>
                         <p className="text-gray-400 mb-1 text-xs">Sub:</p>
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
                               <p key={index} className="text-gray-300 text-xs">
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

             {/* SETS D'ARTEFACTS */}
             {selectedHunter.setAnalysis && (
               <div className="bg-black/30 rounded-lg p-4 border border-blue-500/20 mb-6">
                 <h3 className="text-blue-400 font-bold mb-4">🎨 Sets d'Artefacts</h3>
                 <p className="text-gray-300 mb-4">
                   {selectedHunter.setAnalysis.analysis || "Aucune analyse disponible"}
                 </p>
                 
                 {selectedHunter.setAnalysis.equipped && Object.keys(selectedHunter.setAnalysis.equipped).length > 0 && (
                   <div className={`grid gap-3 ${isMobileDevice ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
                     {Object.entries(selectedHunter.setAnalysis.equipped).map(([setName, count]) => (
                       <div key={setName} className="bg-black/40 rounded-lg p-3 text-center">
                         <p className="text-yellow-400 font-bold text-sm">{setName}</p>
                         <p className="text-gray-300 text-xs">{count} pièces</p>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
             )}

             {/* 🆕 NOYAUX ET GEMMES v5.0 - FIX AFFICHAGE */}
             <div className={`grid gap-4 mb-6 ${isMobileDevice ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
               
               {/* Noyaux */}
               {selectedHunter.currentCores && Object.keys(selectedHunter.currentCores).length > 0 && (
                 <div className="bg-black/30 rounded-lg p-4 border border-orange-500/20">
                   <h3 className="text-orange-400 font-bold mb-4">🔴 Noyaux Équipés</h3>
                   <div className="space-y-2">
                     {Object.entries(selectedHunter.currentCores).map(([slot, core]) => (
                       <div key={slot} className="bg-black/40 rounded p-3">
                         <p className="text-orange-400 font-bold text-sm mb-1">{slot}</p>
                         <p className="text-white text-sm">{core.name || core.type || 'Noyau inconnu'}</p>
                         {core.level && <p className="text-gray-300 text-xs">Niveau {core.level}</p>}
                         {core.primary && (
                           <div className="mt-2 text-xs">
                             <p className="text-gray-400">Principal: <span className="text-yellow-400">{core.primary}</span></p>
                             {core.primaryValue && <p className="text-gray-400">Valeur: <span className="text-white">{core.primaryValue}</span></p>}
                           </div>
                         )}
                         {core.secondary && (
                           <div className="mt-1 text-xs">
                             <p className="text-gray-400">Secondaire: <span className="text-cyan-400">{core.secondary}</span></p>
                             {core.secondaryValue && <p className="text-gray-400">Valeur: <span className="text-white">{core.secondaryValue}</span></p>}
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* Gemmes */}
               {selectedHunter.currentGems && Object.keys(selectedHunter.currentGems).length > 0 && (
                 <div className="bg-black/30 rounded-lg p-4 border border-pink-500/20">
                   <h3 className="text-pink-400 font-bold mb-4">💎 Gemmes Équipées</h3>
                   <div className="space-y-2">
                     {Object.entries(selectedHunter.currentGems).map(([slot, gem]) => (
                       <div key={slot} className="bg-black/40 rounded p-3">
                         <p className="text-pink-400 font-bold text-sm mb-1">{slot}</p>
                         <p className="text-white text-sm">{gem.name || gem.type || 'Gemme inconnue'}</p>
                         {gem.level && <p className="text-gray-300 text-xs">Niveau {gem.level}</p>}
                         {gem.stat && (
                           <div className="mt-2 text-xs">
                             <p className="text-gray-400">Stat: <span className="text-purple-400">{gem.stat}</span></p>
                             {gem.value && <p className="text-gray-400">Valeur: <span className="text-white">{gem.value}</span></p>}
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                 </div>
               )}
             </div>

             {/* ARME DÉTAILLÉE */}
             {selectedHunter.currentWeapon && selectedHunter.currentWeapon.name && (
               <div className="bg-black/30 rounded-lg p-4 border border-red-500/20 mb-6">
                 <h3 className="text-red-400 font-bold mb-4">⚔️ Arme Équipée</h3>
                 <div className="bg-black/40 rounded p-3">
                   <p className="text-red-400 font-bold">{selectedHunter.currentWeapon.name}</p>
                   {selectedHunter.currentWeapon.level && (
                     <p className="text-gray-300 text-sm">Niveau {selectedHunter.currentWeapon.level}</p>
                   )}
                   {selectedHunter.currentWeapon.stats && (
                     <div className="mt-2 space-y-1">
                       {Object.entries(selectedHunter.currentWeapon.stats).map(([stat, value]) => (
                         <div key={stat} className="flex justify-between text-xs">
                           <span className="text-gray-400">{stat}:</span>
                           <span className="text-white">{formatStat(value)}</span>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               </div>
             )}

             {/* SCREENSHOTS GALERIE */}
{selectedHunter.screenshots && selectedHunter.screenshots.length > 0 && (
  <div className="bg-black/30 rounded-lg p-4 border border-cyan-500/20 mb-6">
    <h3 className="text-cyan-400 font-bold mb-4">📸 Screenshots ({selectedHunter.screenshots.length})</h3>
    <div className={`grid gap-3 ${isMobileDevice ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'}`}>
      {selectedHunter.screenshots.map((screenshot, index) => (
        <div key={index} className="screenshot-item border border-cyan-500/30 rounded overflow-hidden">
          <img 
            src={screenshot.url || screenshot} 
            alt={`Screenshot ${index + 1}`}
            className="w-full h-48 md:h-64 object-cover cursor-pointer hover:scale-105 transition-transform"
            onClick={() => window.open(screenshot.url || screenshot, '_blank')}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          {screenshot.type && (
            <div className="p-2 bg-black/60">
              <p className="text-cyan-400 text-xs">{screenshot.type}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)}

             {/* ANALYSE AUTO DÉTAILLÉE */}
             {selectedHunter.autoAnalysis && (
               <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20 mb-6">
                 <h3 className="text-purple-400 font-bold mb-4">🤖 Analyse Automatique v5.0</h3>
                 
                 <div className="grid gap-4 mb-4">
                   <div className="bg-black/40 rounded p-3">
                     <h4 className="text-purple-300 font-bold mb-2">Score de Confiance</h4>
                     <p className="text-white text-2xl font-bold">{selectedHunter.autoAnalysis.suggestedScore}%</p>
                     <p className="text-gray-400 text-sm">Niveau de risque: {selectedHunter.autoAnalysis.riskLevel}</p>
                   </div>
                 </div>

                 {selectedHunter.autoAnalysis.issues && selectedHunter.autoAnalysis.issues.length > 0 && (
                   <div className="mb-4">
                     <h4 className="text-red-400 font-bold mb-2">⚠️ Issues Détectées</h4>
                     <div className="space-y-1">
                       {selectedHunter.autoAnalysis.issues.map((issue, index) => (
                         <div key={index} className="bg-red-900/20 rounded p-2 border border-red-500/30">
                           <p className="text-red-300 text-sm">{possibleIssues[issue] || issue}</p>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                 {selectedHunter.autoAnalysis.potentialDuplicates && selectedHunter.autoAnalysis.potentialDuplicates.length > 0 && (
                   <div>
                     <h4 className="text-yellow-400 font-bold mb-2">🔍 Historique Détecté</h4>
                     <div className="space-y-2">
                       {selectedHunter.autoAnalysis.potentialDuplicates.map((dup, index) => (
                         <div key={index} className="bg-yellow-900/20 rounded p-2 border border-yellow-500/30">
                           <p className="text-yellow-300 text-sm">
                             {dup.hunter.pseudo} ({dup.hunter.accountId}) - {dup.hunter.character}
                           </p>
                           <p className="text-gray-400 text-xs">
                             Type: {
                               dup.type === 'multi_character_normal' ? 'Multi-character normal' : 
                               dup.type === 'pseudo_change_v3' ? '🚨 Changement de pseudo' :
                               dup.type === 'exact_duplicate_v3' ? '🔄 Mise à jour' : 
                               'Autre'
                             }
                           </p>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
             )}

             {/* Notes */}
             {selectedHunter.notes && (
               <div className="bg-black/30 rounded-lg p-4 border border-gray-500/20 mb-6">
                 <h3 className="text-gray-400 font-bold mb-2">📝 Notes</h3>
                 <p className="text-gray-300">{selectedHunter.notes}</p>
               </div>
             )}

             {/* 🆕 ACTIONS DE VALIDATION v5.0 - NOTATION */}
             <div className="border-t border-gray-700 pt-6">
               <h3 className="text-white font-bold mb-4">🎯 Actions de Validation Kaisel v5.0</h3>
               
               <div className={`grid gap-4 ${isMobileDevice ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                 {/* Approbation */}
                 <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
                   <h4 className="text-green-400 font-bold mb-3">✅ Approuver</h4>
                   
                   <div className="space-y-3">
                     {/* 🆕 NOTATION v5.0 */}
                     <div>
                       <label className="block text-sm text-gray-300 mb-2">
                         Note de véracité : <span className="text-white font-bold">{selectedNotation}/100</span>
                       </label>
                       <input 
                         type="range"
                         min="0"
                         max="100"
                         step="10"
                         value={selectedNotation}
                         onChange={(e) => setSelectedNotation(parseInt(e.target.value))}
                         className="notation-slider w-full"
                         style={{
                           '--notation-color': getNotationColor(selectedNotation)
                         }}
                       />
                       <div className="flex justify-between text-xs text-gray-400 mt-1">
                         <span>0</span>
                         <span>20</span>
                         <span>40</span>
                         <span>60</span>
                         <span>80</span>
                         <span>100</span>
                       </div>
                       <div className="mt-2 text-center">
                         <span 
                           className="px-3 py-1 rounded text-sm font-bold"
                           style={{
                             color: getNotationColor(selectedNotation),
                             border: `1px solid ${getNotationColor(selectedNotation)}`,
                             background: `${getNotationColor(selectedNotation)}20`
                           }}
                         >
                           {selectedNotation >= 90 ? '💎 Parfait' :
                            selectedNotation >= 70 ? '✅ Bon' :
                            selectedNotation >= 50 ? '⚠️ Moyen' :
                            '❌ Suspect'}
                         </span>
                       </div>
                     </div>
                     
                     <div>
                       <label className="block text-sm text-gray-300 mb-2">Notes admin :</label>
                       <textarea 
                         className="w-full bg-black/50 border border-green-500/30 rounded px-3 py-2 text-white text-sm"
                         rows="3"
                         placeholder="Notes optionnelles sur la validation..."
                         value={adminNotes}
                         onChange={(e) => setAdminNotes(e.target.value)}
                       />
                     </div>
                     
                     <button
                       onClick={() => {
                         const duplicates = selectedHunter.autoAnalysis?.potentialDuplicates || [];
                         const exactDuplicate = duplicates.find(d => 
                           d.type === 'exact_duplicate_v3' ||
                           (d.hunter.pseudo === selectedHunter.pseudo && d.hunter.accountId === selectedHunter.accountId && d.hunter.character === selectedHunter.character)
                         );
                         
                         handleApprove(
                           selectedHunter.id, 
                           selectedNotation, 
                           adminNotes,
                           !!exactDuplicate,
                           exactDuplicate?.hunter.id
                         );
                       }}
                       className="approval-button w-full px-4 py-3 rounded font-bold text-white"
                     >
                       ✅ Approuver avec note {selectedNotation}/100
                     </button>
                   </div>
                 </div>

                 {/* Rejet */}
                 <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
                   <h4 className="text-red-400 font-bold mb-3">❌ Rejeter</h4>
                   
                   <div className="space-y-3">
                     <div>
                       <label className="block text-sm text-gray-300 mb-2">Raison du rejet :</label>
                       <select 
                         className="w-full bg-black/50 border border-red-500/30 rounded px-3 py-2 text-white"
                         id="rejectReason"
                       >
                         <option value="Non conforme v5.0">Non conforme aux standards v5.0</option>
                         <option value="Pseudo/AccountID invalide">Pseudo ou Account ID invalide</option>
                         <option value="Screenshots manquants">Screenshots obligatoires manquants</option>
                         <option value="Stats impossibles">Stats impossibles/trichées</option>
                         <option value="Screenshots suspects">Screenshots suspects</option>
                         <option value="CP incohérent">CP incohérent avec les stats</option>
                         <option value="Sets invalides">Sets d'artefacts invalides</option>
                         <option value="Changement pseudo suspect">Changement de pseudo suspect</option>
                         <option value="Cores/Gems manquants">Noyaux ou gemmes manquants</option>
                         <option value="Autre">Autre raison</option>
                       </select>
                     </div>
                     
                     <div className="bg-red-900/30 rounded p-3">
                       <p className="text-red-300 text-sm">
                         ⚠️ <strong>Action irréversible</strong><br/>
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