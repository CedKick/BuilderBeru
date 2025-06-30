import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { data_chars } from '../data/data_char.js'; // 🆕 IMPORT DATA_CHARS

const HallOfFlamePage = ({ 
  onClose, 
  showTankMessage,
  characters = {},
  onNavigateToBuilder,
  
  // Props pour éviter les erreurs
  selectedCharacter,
  currentStats = {},
  currentArtifacts = {},
  statsFromArtifacts = {},
  currentCores = {},
  currentGems = {},
  currentWeapon = {},
  
  // Mode standalone
  isStandalone = false
}) => {
  const { t } = useTranslation();
  const [hunters, setHunters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRanking, setSelectedRanking] = useState('totalScore');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuild, setSelectedGuild] = useState('');
  const [selectedElement, setSelectedElement] = useState('');
  const [selectedCharacterFilter, setSelectedCharacterFilter] = useState(''); // 🆕 FILTRE CHARACTER
  const [currentPage, setCurrentPage] = useState(1);
  const [huntersPerPage] = useState(12);
  const [selectedHunter, setSelectedHunter] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // 🆕 ÉTATS POUR HOVER CP TOOLTIPS
  const [showCpTooltipTotal, setShowCpTooltipTotal] = useState(null);
  const [showCpTooltipArtifacts, setShowCpTooltipArtifacts] = useState(null);

  // 🔍 DÉTECTION MOBILE
  const isMobileDevice = window.innerWidth < 768;
  const isTabletDevice = window.innerWidth >= 768 && window.innerWidth < 1024;

  // 📊 CHARGER LES HUNTERS DEPUIS L'API BACKEND
  useEffect(() => {
    const loadHunters = async () => {
      setLoading(true);
      try {
        showTankMessage("🌐 Chargement du Hall Of Flame depuis l'API...", true, 'kaisel');
        
        const response = await fetch('https://api.builderberu.com/api/hallofflame/hunters');
        const result = await response.json();
        
        if (response.ok && result.success) {
          // 🛡️ FILTRER SEULEMENT LES HUNTERS VALIDÉS
          const validatedHunters = result.hunters.filter(h => h.validated === true);
          setHunters(validatedHunters);
          showTankMessage(`✅ ${validatedHunters.length} hunters validés chargés!`, true, 'kaisel');
        } else {
          throw new Error(result.error || 'Erreur API');
        }
        
      } catch (error) {
        console.error('❌ Erreur chargement API:', error);
        showTankMessage(`❌ Erreur API: ${error.message}. Fallback localStorage...`, true, 'kaisel');
        
        // Fallback localStorage
        try {
          const stored = localStorage.getItem('builderberu_hallofflame');
          const huntersData = stored ? JSON.parse(stored) : [];
          const validatedHunters = huntersData.filter(h => h.validated === true);
          setHunters(validatedHunters);
        } catch {
          setHunters([]);
        }
      }
      
      setLoading(false);
    };

    loadHunters();
  }, []);

  // 🎯 FILTRAGE ET TRI DES HUNTERS
  const filteredAndSortedHunters = useMemo(() => {
    let filtered = [...hunters];

    if (searchTerm) {
      filtered = filtered.filter(hunter =>
        (hunter.character && hunter.character.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (hunter.characterName && hunter.characterName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (characters[hunter.character]?.name && characters[hunter.character].name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (data_chars[hunter.character]?.name && data_chars[hunter.character].name.toLowerCase().includes(searchTerm.toLowerCase())) // 🆕 RECHERCHE DATA_CHARS
      );
    }

    if (selectedGuild) {
      filtered = filtered.filter(hunter => hunter.guildName === selectedGuild);
    }

    if (selectedElement) {
      filtered = filtered.filter(hunter => 
        characters[hunter.character]?.element === selectedElement ||
        data_chars[hunter.character]?.element === selectedElement // 🆕 FILTRE ELEMENT DATA_CHARS
      );
    }

    // 🆕 FILTRE PAR CHARACTER
    if (selectedCharacterFilter) {
      filtered = filtered.filter(hunter => hunter.character === selectedCharacterFilter);
    }

    filtered.sort((a, b) => {
      if (selectedRanking === 'artifactsScore') {
        return (b.artifactsScore || 0) - (a.artifactsScore || 0);
      } else {
        return (b.totalScore || 0) - (a.totalScore || 0);
      }
    });

    return filtered;
  }, [hunters, searchTerm, selectedGuild, selectedElement, selectedCharacter, selectedRanking, characters]);

  // 📄 PAGINATION
  const paginatedHunters = useMemo(() => {
    const startIndex = (currentPage - 1) * huntersPerPage;
    return filteredAndSortedHunters.slice(startIndex, startIndex + huntersPerPage);
  }, [filteredAndSortedHunters, currentPage, huntersPerPage]);

  const totalPages = Math.ceil(filteredAndSortedHunters.length / huntersPerPage);

  // 🏅 GUILDES UNIQUES
  const uniqueGuilds = useMemo(() => {
    const guilds = hunters
      .map(h => h.guildName)
      .filter(g => g && g.trim())
      .filter((g, i, arr) => arr.indexOf(g) === i);
    return guilds.sort();
  }, [hunters]);

  // 🆕 CHARACTERS UNIQUES (basé sur les hunters présents)
  const uniqueCharacters = useMemo(() => {
    const characterIds = hunters
      .map(h => h.character)
      .filter(c => c && c.trim())
      .filter((c, i, arr) => arr.indexOf(c) === i);
    
    // Mapper avec les noms depuis data_chars ou characters fallback
    return characterIds
      .map(charId => ({
        id: charId,
        name: data_chars[charId]?.name || characters[charId]?.name || charId,
        element: data_chars[charId]?.element || characters[charId]?.element || 'Unknown'
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [hunters, characters]);

  // 🎨 COULEUR DE L'ÉLÉMENT
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

  // 🆕 OBTENIR L'IMAGE DU CHARACTER DEPUIS DATA_CHARS
  const getCharacterImage = (characterId) => {
    const charData = data_chars[characterId];
    if (charData) {
      // Utiliser icon pour les cartes (plus petit) et img pour les détails
      return {
        icon: charData.icon,
        img: charData.img,
        name: charData.name,
        element: charData.element
      };
    }
    return null;
  };

  // 🆕 COMPOSANT TOOLTIP CP (même que DebugPopup)
  const CpTooltip = ({ details, title, color }) => (
    <div className="cp-tooltip-hall">
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

  // 🏆 BADGE DE RANG
  const getRankBadge = (index) => {
    if (index === 0) return { emoji: '👑', color: '#ffd700', text: 'Empereur' };
    if (index === 1) return { emoji: '🥈', color: '#c0c0c0', text: '2nd' };
    if (index === 2) return { emoji: '🥉', color: '#cd7f32', text: '3rd' };
    if (index < 10) return { emoji: '🏆', color: '#ff6b35', text: `#${index + 1}` };
    if (index < 50) return { emoji: '⭐', color: '#4ecdc4', text: `#${index + 1}` };
    return { emoji: '🔹', color: '#95a5a6', text: `#${index + 1}` };
  };

  // 🔄 REFRESH
  const handleRefresh = async () => {
    try {
      showTankMessage("🔄 Actualisation...", true, 'kaisel');
      
      const response = await fetch('https://api.builderberu.com/api/hallofflame/hunters');
      const result = await response.json();
      
      if (response.ok && result.success) {
        const validatedHunters = result.hunters.filter(h => h.validated === true);
        setHunters(validatedHunters);
        showTankMessage(`🔄 ${validatedHunters.length} hunters actualisés !`, true, 'kaisel');
      } else {
        throw new Error(result.error || 'Erreur refresh');
      }
      
    } catch (error) {
      console.error('❌ Erreur refresh:', error);
      showTankMessage(`❌ Erreur: ${error.message}`, true, 'kaisel');
    }
  };

  // 🔍 VOIR DÉTAILS
  const handleViewDetails = (hunter) => {
    setSelectedHunter(hunter);
    setShowDetails(true);
    showTankMessage(`🔍 ${hunter.pseudo || hunter.hunterName}`, true, 'kaisel');
  };

  // 📊 FORMATER STATS
  const formatStat = (value) => {
    if (typeof value !== 'number') return '0';
    return Math.round(value).toLocaleString();
  };

  return (
    <>
      {/* 🎨 STYLES CSS MOBILE-FIRST + TOOLTIPS */}
      <style jsx="true">{`
        @keyframes page-enter {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .hall-page {
          backdrop-filter: blur(15px);
          background: linear-gradient(135deg, 
            rgba(10, 10, 25, 0.95) 0%, 
            rgba(15, 15, 35, 0.98) 50%, 
            rgba(5, 5, 15, 0.95) 100%);
          animation: page-enter 0.6s ease-out;
        }

        .hunter-card {
          backdrop-filter: blur(8px);
          background: linear-gradient(135deg, 
            rgba(26, 26, 46, 0.9) 0%, 
            rgba(22, 33, 62, 0.95) 50%, 
            rgba(15, 20, 25, 0.9) 100%);
          border: 1px solid rgba(255, 215, 0, 0.2);
          transition: all 0.3s ease;
        }

        .hunter-card:hover {
          border-color: rgba(255, 215, 0, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .hunter-card.emperor {
          border: 2px solid #ffd700;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
        }

        .rank-badge {
          background: linear-gradient(135deg, var(--rank-color), var(--rank-color-light));
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .ranking-tab, .filter-button {
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          color: #ffd700;
          transition: all 0.3s ease;
        }

        .ranking-tab:hover, .filter-button:hover {
          background: rgba(255, 215, 0, 0.2);
          border-color: #ffd700;
        }

        .ranking-tab.active, .filter-button.active {
          background: linear-gradient(135deg, #ffd700, #ffed4a);
          color: #1a1a2e;
          font-weight: bold;
        }

        .loading-spinner {
          border: 3px solid rgba(255, 215, 0, 0.3);
          border-top: 3px solid #ffd700;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .stat-bar {
          background: linear-gradient(90deg, var(--stat-color), transparent);
          height: 3px;
          border-radius: 2px;
        }

        .element-badge {
          border: 1px solid var(--element-color);
          color: var(--element-color);
          background: rgba(var(--element-rgb), 0.1);
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 6px;
        }

        .character-badge {
          border: 1px solid var(--character-color);
          color: var(--character-color);
          background: rgba(var(--character-rgb), 0.1);
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 6px;
          margin-left: 4px;
        }

        /* 🆕 CHARACTER IMAGE STYLES */
        .character-image {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid var(--element-color);
          object-fit: cover;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .character-image:hover {
          transform: scale(1.1);
          box-shadow: 0 0 15px var(--element-color);
        }

        .character-image-large {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 3px solid var(--element-color);
          object-fit: cover;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }

        @media (max-width: 768px) {
          .character-image {
            width: 32px;
            height: 32px;
          }
          
          .character-image-large {
            width: 48px;
            height: 48px;
          }
        }

        /* 🆕 TOOLTIPS CP STYLES (même que DebugPopup) */
        .cp-score-hover {
          position: relative;
          cursor: help;
          transition: all 0.3s ease;
        }

        .cp-score-hover:hover {
          transform: scale(1.05);
        }

        .cp-tooltip-hall {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 8px;
          background: rgba(0, 0, 0, 0.95);
          border: 1px solid rgba(255, 215, 0, 0.5);
          border-radius: 8px;
          padding: 12px;
          width: 300px;
          z-index: 1000;
          font-size: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        }

        @media (max-width: 768px) {
          .cp-tooltip-hall {
            width: 280px;
            left: 0;
            transform: none;
          }
        }

        .details-modal {
          backdrop-filter: blur(20px);
          background: rgba(0, 0, 0, 0.92);
        }

        .details-content {
          background: linear-gradient(135deg, 
            rgba(26, 26, 46, 0.98) 0%, 
            rgba(22, 33, 62, 0.98) 50%, 
            rgba(15, 20, 25, 0.98) 100%);
          border: 1px solid #ffd700;
        }

        .artifact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 0.75rem;
        }

        .artifact-slot {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: 6px;
          padding: 8px;
          transition: all 0.3s ease;
        }

        .artifact-slot:hover {
          border-color: rgba(255, 215, 0, 0.5);
          background: rgba(255, 215, 0, 0.05);
        }

        /* 📱 MOBILE SPECIFIC STYLES */
        @media (max-width: 768px) {
          .hall-page {
            padding: 0 !important;
          }

          .mobile-header {
            padding: 8px 12px !important;
            border-bottom: 1px solid rgba(255, 215, 0, 0.2);
          }

          .mobile-header h1 {
            font-size: 1.25rem !important;
            margin: 0;
          }

          .mobile-header p {
            font-size: 11px !important;
            margin: 2px 0 0 0;
          }

          .mobile-header .actions {
            gap: 8px !important;
          }

          .mobile-header button {
            padding: 6px 12px !important;
            font-size: 12px !important;
            border-radius: 6px !important;
          }

          .mobile-filters {
            padding: 12px !important;
            flex-direction: column !important;
            gap: 8px !important;
          }

          .mobile-filters input, .mobile-filters select {
            width: 100% !important;
            padding: 10px 12px !important;
            font-size: 16px !important; /* Évite le zoom iOS */
            border-radius: 8px !important;
          }

          .hunter-card {
            margin: 8px !important;
            padding: 12px !important;
            border-radius: 10px !important;
          }

          .hunter-card:hover {
            transform: none !important; /* Pas d'animation hover sur mobile */
          }

          .rank-badge {
            font-size: 11px !important;
            padding: 4px 8px !important;
          }

          .element-badge, .character-badge {
            font-size: 9px !important;
            padding: 2px 4px !important;
          }

          .mobile-stats {
            grid-template-columns: 1fr 1fr !important;
            gap: 6px !important;
            margin-bottom: 12px !important;
          }

          .mobile-stats > div {
            padding: 8px !important;
            border-radius: 6px !important;
          }

          .mobile-stats p {
            font-size: 11px !important;
            margin: 0 !important;
          }

          .mobile-stats .text-2xl {
            font-size: 16px !important;
          }

          .mobile-modal {
            margin: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-height: 100vh !important;
            border-radius: 0 !important;
            border: none !important;
          }

          .mobile-modal-header {
            padding: 12px !important;
            border-bottom: 1px solid rgba(255, 215, 0, 0.2);
          }

          .mobile-modal-content {
            padding: 12px !important;
            font-size: 13px !important;
          }

          .artifact-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }

          .artifact-slot {
            padding: 8px !important;
            font-size: 11px !important;
          }

          .mobile-pagination {
            flex-wrap: wrap !important;
            gap: 4px !important;
            justify-content: center !important;
          }

          .mobile-pagination button {
            padding: 6px 12px !important;
            font-size: 12px !important;
            min-width: 80px !important;
          }
        }

        /* 📱 TABLET ADJUSTMENTS */
        @media (min-width: 768px) and (max-width: 1024px) {
          .hunter-card {
            padding: 16px !important;
          }
          
          .artifact-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        /* 🖼️ NO SCREENSHOTS - HIDDEN COMPLETELY */
        .screenshot-section,
        .screenshot-gallery,
        .screenshot-item,
        .screenshot-info {
          display: none !important;
        }

        /* ⚡ PERFORMANCE OPTIMIZATIONS */
        .hunter-card, .details-content {
          contain: layout style paint;
        }

        .stat-bar {
          will-change: width;
        }

        /* 🌙 BETTER DARK MODE */
        @media (prefers-color-scheme: dark) {
          .hall-page {
            background: linear-gradient(135deg, 
              rgba(5, 5, 15, 0.98) 0%, 
              rgba(10, 10, 25, 0.98) 50%, 
              rgba(5, 5, 15, 0.98) 100%);
          }
        }
      `}</style>

      {/* 🖼️ LAYOUT PRINCIPAL */}
      <div className="fixed inset-0 z-[9999] hall-page">
        
        {/* 📱 HEADER MOBILE-FRIENDLY */}
        <div className={`relative z-10 border-b border-yellow-500/30 ${isMobileDevice ? 'mobile-header' : 'p-4 md:p-6'}`}>
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            
            <div className="flex items-center gap-3">
              <div className={`bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center ${isMobileDevice ? 'w-8 h-8' : 'w-12 h-12'}`}>
                <span className={isMobileDevice ? 'text-lg' : 'text-2xl'}>🏆</span>
              </div>
              <div>
                <h1 className={`font-bold text-yellow-400 ${isMobileDevice ? 'text-lg' : 'text-2xl md:text-3xl'}`}>
                  Hall Of Flame
                </h1>
                <p className={`text-gray-300 ${isMobileDevice ? 'text-xs' : 'text-sm'}`}>
                  {filteredAndSortedHunters.length} Hunter{filteredAndSortedHunters.length > 1 ? 's' : ''} validés
                  {selectedCharacter && (
                    <span className="text-cyan-400 ml-2">• {data_chars[selectedCharacter]?.name || characters[selectedCharacter]?.name || selectedCharacter}</span>
                  )}
                </p>
              </div>
            </div>

            <div className={`flex items-center ${isMobileDevice ? 'actions gap-2' : 'gap-3'}`}>
              <button
                onClick={handleRefresh}
                className={`filter-button rounded-lg transition-all ${isMobileDevice ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm hover:scale-105'}`}
              >
                🔄
              </button>
              
              <button
                onClick={onClose}
                className={`rounded-full bg-red-600/20 hover:bg-red-600/40 text-red-400 flex items-center justify-center transition-colors ${isMobileDevice ? 'w-8 h-8' : 'w-10 h-10'}`}
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* 🎯 TABS RANKING */}
        <div className={`relative z-10 border-b border-gray-700/50 ${isMobileDevice ? 'px-3 pt-2' : 'px-4 md:px-6 pt-4'}`}>
          <div className="max-w-7xl mx-auto">
            <div className={`flex mb-3 ${isMobileDevice ? 'gap-1' : 'gap-2'}`}>
              <button
                onClick={() => {
                  setSelectedRanking('totalScore');
                  setCurrentPage(1);
                }}
                className={`ranking-tab rounded-lg transition-all ${isMobileDevice ? 'px-3 py-2 text-xs' : 'px-6 py-3'} ${
                  selectedRanking === 'totalScore' ? 'active' : ''
                }`}
              >
                🏆 CP Total
              </button>
              <button
                onClick={() => {
                  setSelectedRanking('artifactsScore');
                  setCurrentPage(1);
                }}
                className={`ranking-tab rounded-lg transition-all ${isMobileDevice ? 'px-3 py-2 text-xs' : 'px-6 py-3'} ${
                  selectedRanking === 'artifactsScore' ? 'active' : ''
                }`}
              >
                🎨 CP Artefacts
              </button>
            </div>
          </div>
        </div>

        {/* 🔍 FILTRES ET RECHERCHE */}
        <div className={`relative z-10 border-b border-gray-700/50 ${isMobileDevice ? 'mobile-filters p-3' : 'p-4 md:p-6'}`}>
          <div className="max-w-7xl mx-auto space-y-3">
            
            {/* Barre de recherche */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="🔍 Rechercher un personnage..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full bg-black/30 border border-yellow-500/30 rounded-lg text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none ${
                    isMobileDevice ? 'px-3 py-2 text-sm' : 'px-4 py-3'
                  }`}
                />
              </div>
            </div>

            {/* Filtres avancés */}
            <div className={`flex gap-2 ${isMobileDevice ? 'flex-col' : 'flex-wrap'}`}>
              
              {/* Guilde */}
              {uniqueGuilds.length > 0 && (
                <select
                  value={selectedGuild}
                  onChange={(e) => setSelectedGuild(e.target.value)}
                  className={`filter-button rounded-lg bg-black/30 focus:outline-none ${
                    isMobileDevice ? 'px-3 py-2 text-sm w-full' : 'px-3 py-2 text-sm'
                  }`}
                >
                  <option value="">🏰 Toutes les guildes</option>
                  {uniqueGuilds.map(guild => (
                    <option key={guild} value={guild}>{guild}</option>
                  ))}
                </select>
              )}

              {/* Élément */}
              <select
                value={selectedElement}
                onChange={(e) => setSelectedElement(e.target.value)}
                className={`filter-button rounded-lg bg-black/30 focus:outline-none ${
                  isMobileDevice ? 'px-3 py-2 text-sm w-full' : 'px-3 py-2 text-sm'
                }`}
              >
                <option value="">🌟 Tous les éléments</option>
                <option value="Fire">🔥 Fire</option>
                <option value="Water">💧 Water</option>
                <option value="Wind">💨 Wind</option>
                <option value="Light">☀️ Light</option>
                <option value="Dark">🌙 Dark</option>
              </select>

              {/* 🆕 FILTRE CHARACTER */}
              {uniqueCharacters.length > 0 && (
                <select
                  value={selectedCharacter}
                  onChange={(e) => setSelectedCharacterFilter(e.target.value)}
                  className={`filter-button rounded-lg bg-black/30 focus:outline-none ${
                    isMobileDevice ? 'px-3 py-2 text-sm w-full' : 'px-3 py-2 text-sm'
                  }`}
                >
                  <option value="">🎭 Tous les personnages</option>
                  {uniqueCharacters.map(char => {
                    const elementEmoji = {
                      Fire: '🔥',
                      Water: '💧', 
                      Wind: '💨',
                      Light: '☀️',
                      Dark: '🌙'
                    }[char.element] || '🎭';
                    
                    return (
                      <option key={char.id} value={char.id}>
                        {elementEmoji} {char.name}
                      </option>
                    );
                  })}
                </select>
              )}

              {/* Reset filtres */}
              {(searchTerm || selectedGuild || selectedElement || selectedCharacter) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedGuild('');
                    setSelectedElement('');
                    setSelectedCharacterFilter('');
                    setCurrentPage(1);
                  }}
                  className={`filter-button rounded-lg hover:bg-red-600/20 hover:border-red-500 hover:text-red-400 ${
                    isMobileDevice ? 'px-3 py-2 text-sm w-full' : 'px-3 py-2 text-sm'
                  }`}
                >
                  ❌ Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 📱 CONTENU PRINCIPAL */}
        <div className="relative z-10 flex-1 overflow-y-auto mobile-scroll">
          <div className={`max-w-7xl mx-auto ${isMobileDevice ? 'p-2' : 'p-4 md:p-6'}`}>

            {loading ? (
              // Loading state
              <div className="flex flex-col items-center justify-center py-16">
                <div className="loading-spinner mb-3"></div>
                <h3 className={`text-yellow-400 mb-2 ${isMobileDevice ? 'text-lg' : 'text-xl'}`}>
                  Chargement...
                </h3>
                <p className={`text-gray-400 ${isMobileDevice ? 'text-sm' : ''}`}>
                  Kaisel analyse les données...
                </p>
              </div>
            ) : hunters.length === 0 ? (
              // Empty state
              <div className="text-center py-16">
                <div className={isMobileDevice ? 'text-4xl mb-3' : 'text-6xl mb-4'}>🏆</div>
                <h3 className={`text-yellow-400 mb-2 ${isMobileDevice ? 'text-lg' : 'text-xl'}`}>
                  Aucun Hunter validé
                </h3>
                <p className={`text-gray-400 mb-4 ${isMobileDevice ? 'text-sm' : ''}`}>
                  Soyez le premier à être validé !
                </p>
                <button
                  onClick={onNavigateToBuilder}
                  className={`filter-button active rounded-lg transition-all ${isMobileDevice ? 'px-4 py-2 text-sm' : 'px-6 py-3 hover:scale-105'}`}
                >
                  🚀 Aller au Builder
                </button>
              </div>
            ) : filteredAndSortedHunters.length === 0 ? (
              // No results state
              <div className="text-center py-16">
                <div className={isMobileDevice ? 'text-4xl mb-3' : 'text-6xl mb-4'}>🔍</div>
                <h3 className={`text-yellow-400 mb-2 ${isMobileDevice ? 'text-lg' : 'text-xl'}`}>
                  Aucun résultat
                </h3>
                <p className={`text-gray-400 ${isMobileDevice ? 'text-sm' : ''}`}>
                  Modifiez vos filtres de recherche
                </p>
              </div>
            ) : (
              // Hunters content
              <>
                {/* Stats globales */}
                <div className={`grid gap-3 mb-6 ${isMobileDevice ? 'mobile-stats grid-cols-2' : 'grid-cols-2 md:grid-cols-4 gap-4 mb-8'}`}>
                  <div className="bg-black/30 rounded-lg p-3 border border-yellow-500/20">
                    <div className="text-center">
                      <p className={`text-gray-400 ${isMobileDevice ? 'text-xs' : 'text-sm'}`}>
                        Total
                      </p>
                      <p className={`font-bold text-yellow-400 ${isMobileDevice ? 'text-lg' : 'text-2xl'}`}>
                        {hunters.length}
                      </p>
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 border border-red-500/20">
                    <div className="text-center">
                      <p className={`text-gray-400 ${isMobileDevice ? 'text-xs' : 'text-sm'}`}>
                        CP Moyen
                      </p>
                      <p className={`font-bold text-red-400 ${isMobileDevice ? 'text-lg' : 'text-2xl'}`}>
                        {hunters.length > 0 ? Math.floor(hunters.reduce((sum, h) => sum + (selectedRanking === 'artifactsScore' ? (h.artifactsScore || 0) : h.totalScore), 0) / hunters.length).toLocaleString() : 0}
                      </p>
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 border border-blue-500/20">
                    <div className="text-center">
                      <p className={`text-gray-400 ${isMobileDevice ? 'text-xs' : 'text-sm'}`}>
                        {selectedCharacter ? 'Character' : 'Guildes'}
                      </p>
                      <p className={`font-bold text-blue-400 ${isMobileDevice ? 'text-lg' : 'text-2xl'}`}>
                        {selectedCharacter ? uniqueCharacters.find(c => c.id === selectedCharacter)?.name || selectedCharacter : uniqueGuilds.length}
                      </p>
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 border border-green-500/20">
                    <div className="text-center">
                      <p className={`text-gray-400 ${isMobileDevice ? 'text-xs' : 'text-sm'}`}>
                        CP Max
                      </p>
                      <p className={`font-bold text-green-400 ${isMobileDevice ? 'text-lg' : 'text-2xl'}`}>
                        {hunters.length > 0 ? Math.max(...hunters.map(h => selectedRanking === 'artifactsScore' ? (h.artifactsScore || 0) : h.totalScore)).toLocaleString() : 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grille des hunters */}
                <div className={`grid gap-4 mb-6 ${isMobileDevice ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                  {paginatedHunters.map((hunter, index) => {
                    const globalRank = (currentPage - 1) * huntersPerPage + index;
                    const rankBadge = getRankBadge(globalRank);
                    const character = data_chars[hunter.character] || characters[hunter.character] || {}; // 🆕 PRIORISER DATA_CHARS
                    const elementColor = getElementColor(character?.element);
                    const currentScore = selectedRanking === 'artifactsScore' ? (hunter.artifactsScore || 0) : hunter.totalScore;
                    const displayName = hunter.pseudo || hunter.hunterName || 'Hunter';
                    const characterImage = getCharacterImage(hunter.character); // 🆕 IMAGE CHARACTER
                    
                    return (
                      <div
                        key={hunter.id}
                        className={`hunter-card rounded-xl group cursor-pointer mobile-touch ${globalRank === 0 ? 'emperor' : ''} ${isMobileDevice ? 'p-3' : 'p-6'}`}
                        onClick={() => handleViewDetails(hunter)}
                      >
                        {/* Header avec rang et image character */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`rank-badge rounded-full font-bold flex items-center gap-2 ${isMobileDevice ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'}`}
                              style={{ 
                                '--rank-color': rankBadge.color,
                                '--rank-color-light': rankBadge.color + '40'
                              }}
                            >
                              <span>{rankBadge.emoji}</span>
                              <span>{rankBadge.text}</span>
                            </div>

                            {/* 🆕 IMAGE CHARACTER */}
                            {characterImage && (
                              <img
                                src={characterImage.icon}
                                alt={characterImage.name}
                                className="character-image"
                                style={{
                                  '--element-color': elementColor
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {character?.element && (
                              <div
                                className="element-badge rounded font-bold"
                                style={{
                                  '--element-color': elementColor,
                                  '--element-rgb': elementColor.slice(1).match(/.{2}/g).map(hex => parseInt(hex, 16)).join(',')
                                }}
                              >
                                {character.element}
                              </div>
                            )}
                            
                            {/* CHARACTER BADGE (nom du perso) */}
                            {character?.name && (
                              <div
                                className="character-badge rounded font-bold"
                                style={{
                                  '--character-color': elementColor,
                                  '--character-rgb': elementColor.slice(1).match(/.{2}/g).map(hex => parseInt(hex, 16)).join(',')
                                }}
                              >
                                {character.name}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Infos hunter */}
                        <div className="mb-3">
                          <h3 className={`font-bold text-white mb-1 group-hover:text-yellow-400 transition-colors ${isMobileDevice ? 'text-base' : 'text-xl'}`}>
                            {displayName}
                          </h3>
                          <p className={`text-gray-400 ${isMobileDevice ? 'text-xs' : 'text-sm'}`}>
                            {hunter.characterName || hunter.character} • {hunter.guildName || 'Sans guilde'}
                          </p>
                        </div>

                        {/* Score principal AVEC TOOLTIPS CP */}
                        <div className="mb-3">
                          <div className={`flex justify-between mb-1 ${isMobileDevice ? 'text-xs' : 'text-sm'}`}>
                            <span className="text-gray-400">
                              {selectedRanking === 'artifactsScore' ? 'CP Artefacts' : 'CP Total'}
                            </span>
                            <div 
                              className="cp-score-hover relative"
                              onMouseEnter={() => !isMobileDevice && setShowCpTooltipTotal(hunter.id)}
                              onMouseLeave={() => setShowCpTooltipTotal(null)}
                              onClick={(e) => {
                                if (isMobileDevice) {
                                  e.stopPropagation();
                                  setShowCpTooltipTotal(showCpTooltipTotal === hunter.id ? null : hunter.id);
                                }
                              }}
                            >
                              <span className={`font-bold cursor-help ${selectedRanking === 'artifactsScore' ? 'text-purple-400' : 'text-yellow-400'}`}>
                                {currentScore.toLocaleString()}
                              </span>
                              
                              {/* TOOLTIP CP PRINCIPAL */}
                              {showCpTooltipTotal === hunter.id && (
                                selectedRanking === 'artifactsScore' 
                                  ? hunter.cpDetailsArtifacts?.details && (
                                      <CpTooltip 
                                        details={hunter.cpDetailsArtifacts.details} 
                                        title="🎨 CP Artefacts"
                                        color="#a855f7"
                                      />
                                    )
                                  : hunter.cpDetailsTotal?.details && (
                                      <CpTooltip 
                                        details={hunter.cpDetailsTotal.details} 
                                        title="🏆 CP Total"
                                        color="#ffd700"
                                      />
                                    )
                              )}
                            </div>
                          </div>
                          
                          {/* Score secondaire AVEC TOOLTIPS */}
                          {selectedRanking === 'totalScore' && hunter.artifactsScore && (
                            <div className={`flex justify-between mb-2 ${isMobileDevice ? 'text-xs' : 'text-xs'}`}>
                              <span className="text-gray-500">CP Artefacts</span>
                              <div 
                                className="cp-score-hover relative"
                                onMouseEnter={() => !isMobileDevice && setShowCpTooltipArtifacts(hunter.id)}
                                onMouseLeave={() => setShowCpTooltipArtifacts(null)}
                                onClick={(e) => {
                                  if (isMobileDevice) {
                                    e.stopPropagation();
                                    setShowCpTooltipArtifacts(showCpTooltipArtifacts === hunter.id ? null : hunter.id);
                                  }
                                }}
                              >
                                <span className="text-purple-300 cursor-help">{hunter.artifactsScore.toLocaleString()}</span>
                                
                                {/* TOOLTIP CP ARTIFACTS SECONDAIRE */}
                                {showCpTooltipArtifacts === hunter.id && hunter.cpDetailsArtifacts?.details && (
                                  <CpTooltip 
                                    details={hunter.cpDetailsArtifacts.details} 
                                    title="🎨 CP Artefacts"
                                    color="#a855f7"
                                  />
                                )}
                              </div>
                            </div>
                          )}
                          
                          {selectedRanking === 'artifactsScore' && hunter.totalScore && (
                            <div className={`flex justify-between mb-2 ${isMobileDevice ? 'text-xs' : 'text-xs'}`}>
                              <span className="text-gray-500">CP Total</span>
                              <div 
                                className="cp-score-hover relative"
                                onMouseEnter={() => !isMobileDevice && setShowCpTooltipTotal(`${hunter.id}-secondary`)}
                                onMouseLeave={() => setShowCpTooltipTotal(null)}
                                onClick={(e) => {
                                  if (isMobileDevice) {
                                    e.stopPropagation();
                                    setShowCpTooltipTotal(showCpTooltipTotal === `${hunter.id}-secondary` ? null : `${hunter.id}-secondary`);
                                  }
                                }}
                              >
                                <span className="text-yellow-300 cursor-help">{hunter.totalScore.toLocaleString()}</span>
                                
                                {/* TOOLTIP CP TOTAL SECONDAIRE */}
                                {showCpTooltipTotal === `${hunter.id}-secondary` && hunter.cpDetailsTotal?.details && (
                                  <CpTooltip 
                                    details={hunter.cpDetailsTotal.details} 
                                    title="🏆 CP Total"
                                    color="#ffd700"
                                  />
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Stats principales */}
                        <div className="space-y-2">
                          <div>
                            <div className={`flex justify-between mb-1 ${isMobileDevice ? 'text-xs' : 'text-sm'}`}>
                              <span className="text-gray-400">Attack</span>
                              <span className="text-red-400">{formatStat(hunter.currentStats?.Attack || 0)}</span>
                            </div>
                            <div 
                              className="stat-bar"
                              style={{ 
                                '--stat-color': '#ef4444',
                                width: `${Math.min(100, (hunter.currentStats?.Attack || 0) / 200000 * 100)}%`
                              }}
                            ></div>
                          </div>
                          
                          <div>
                            <div className={`flex justify-between mb-1 ${isMobileDevice ? 'text-xs' : 'text-sm'}`}>
                              <span className="text-gray-400">Defense</span>
                              <span className="text-blue-400">{formatStat(hunter.currentStats?.Defense || 0)}</span>
                            </div>
                            <div 
                              className="stat-bar"
                              style={{ 
                                '--stat-color': '#3b82f6',
                                width: `${Math.min(100, (hunter.currentStats?.Defense || 0) / 200000 * 100)}%`
                              }}
                            ></div>
                          </div>
                          
                          <div>
                            <div className={`flex justify-between mb-1 ${isMobileDevice ? 'text-xs' : 'text-sm'}`}>
                              <span className="text-gray-400">HP</span>
                              <span className="text-green-400">{formatStat(hunter.currentStats?.HP || 0)}</span>
                            </div>
                            <div 
                              className="stat-bar"
                              style={{ 
                                '--stat-color': '#22c55e',
                                width: `${Math.min(100, (hunter.currentStats?.HP || 0) / 200000 * 100)}%`
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Footer avec date */}
                        <div className={`mt-3 pt-3 border-t border-gray-700/50 ${isMobileDevice ? 'text-xs' : ''}`}>
                          <div className="flex justify-between items-center">
                            <p className="text-gray-500 text-xs">
                              📅 {new Date(hunter.timestamp).toLocaleDateString()}
                            </p>
                            {hunter.setAnalysis?.equipped && Object.keys(hunter.setAnalysis.equipped).length > 0 && (
                              <p className="text-blue-400 text-xs">
                                🎨 {Object.keys(hunter.setAnalysis.equipped).length} sets
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className={`flex justify-center items-center mt-6 ${isMobileDevice ? 'mobile-pagination gap-2' : 'gap-4 mt-8'}`}>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`filter-button rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${isMobileDevice ? 'px-3 py-2 text-xs' : 'px-4 py-2'}`}
                    >
                      ← Préc
                    </button>
                    
                    <span className={`text-gray-300 ${isMobileDevice ? 'text-xs px-2' : ''}`}>
                      {isMobileDevice ? `${currentPage}/${totalPages}` : `Page ${currentPage} sur ${totalPages}`}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className={`filter-button rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${isMobileDevice ? 'px-3 py-2 text-xs' : 'px-4 py-2'}`}
                    >
                      Suiv →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 🔍 MODAL DÉTAILS HUNTER */}
      {showDetails && selectedHunter && (
        <div className="details-modal fixed inset-0 z-[10000] flex items-center justify-center">
          <div className={`details-content shadow-2xl overflow-y-auto mobile-scroll ${
            isMobileDevice ? 'mobile-modal' : 'rounded-2xl w-full max-w-6xl max-h-[90vh] m-4'
          }`}>
            
            {/* Header Modal */}
            <div className={`border-b border-yellow-500/30 ${isMobileDevice ? 'mobile-modal-header' : 'p-6'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center ${isMobileDevice ? 'w-8 h-8' : 'w-12 h-12'}`}>
                    <span className={isMobileDevice ? 'text-lg' : 'text-2xl'}>🔍</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* 🆕 IMAGE CHARACTER DANS LE HEADER */}
                    {(() => {
                      const characterImage = getCharacterImage(selectedHunter.character);
                      const character = data_chars[selectedHunter.character] || characters[selectedHunter.character] || {};
                      const elementColor = getElementColor(character?.element);
                      
                      return characterImage && (
                        <img
                          src={characterImage.img}
                          alt={characterImage.name}
                          className="character-image-large"
                          style={{
                            '--element-color': elementColor
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      );
                    })()}
                    
                    <div>
                      <h2 className={`font-bold text-yellow-400 ${isMobileDevice ? 'text-lg' : 'text-2xl'}`}>
                        {selectedHunter.pseudo || selectedHunter.hunterName}
                      </h2>
                      <p className={`text-gray-300 ${isMobileDevice ? 'text-sm' : ''}`}>
                        {selectedHunter.characterName || selectedHunter.character} • {selectedHunter.guildName || 'Sans guilde'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedHunter(null);
                  }}
                  className={`rounded-full bg-red-600/20 hover:bg-red-600/40 text-red-400 flex items-center justify-center transition-colors ${isMobileDevice ? 'w-8 h-8' : 'w-10 h-10'}`}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Contenu Modal */}
            <div className={isMobileDevice ? 'mobile-modal-content' : 'p-6'}>
              
              {/* Scores CP avec Tooltips dans la modal */}
              <div className={`grid gap-4 mb-6 ${isMobileDevice ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3 gap-6 mb-8'}`}>
                <div className="bg-black/30 rounded-lg p-4 border border-yellow-500/20">
                  <h3 className={`text-yellow-400 font-bold mb-2 ${isMobileDevice ? 'text-sm' : ''}`}>
                    🏆 CP Total
                  </h3>
                  <div 
                    className="cp-score-hover relative"
                    onMouseEnter={() => !isMobileDevice && setShowCpTooltipTotal('modal-total')}
                    onMouseLeave={() => setShowCpTooltipTotal(null)}
                    onClick={() => isMobileDevice && setShowCpTooltipTotal(showCpTooltipTotal === 'modal-total' ? null : 'modal-total')}
                  >
                    <p className={`font-bold text-yellow-400 cursor-help ${isMobileDevice ? 'text-xl' : 'text-3xl'}`}>
                      {selectedHunter.totalScore?.toLocaleString() || 0}
                    </p>
                    
                    {/* TOOLTIP CP TOTAL MODAL */}
                    {showCpTooltipTotal === 'modal-total' && selectedHunter.cpDetailsTotal?.details && (
                      <CpTooltip 
                        details={selectedHunter.cpDetailsTotal.details} 
                        title="🏆 CP Total Détaillé"
                        color="#ffd700"
                      />
                    )}
                  </div>
                </div>
                
                <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
                  <h3 className={`text-purple-400 font-bold mb-2 ${isMobileDevice ? 'text-sm' : ''}`}>
                    🎨 CP Artefacts
                  </h3>
                  <div 
                    className="cp-score-hover relative"
                    onMouseEnter={() => !isMobileDevice && setShowCpTooltipArtifacts('modal-artifacts')}
                    onMouseLeave={() => setShowCpTooltipArtifacts(null)}
                    onClick={() => isMobileDevice && setShowCpTooltipArtifacts(showCpTooltipArtifacts === 'modal-artifacts' ? null : 'modal-artifacts')}
                  >
                    <p className={`font-bold text-purple-400 cursor-help ${isMobileDevice ? 'text-xl' : 'text-3xl'}`}>
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
                
                <div className="bg-black/30 rounded-lg p-4 border border-blue-500/20">
                  <h3 className={`text-blue-400 font-bold mb-2 ${isMobileDevice ? 'text-sm' : ''}`}>
                    🎭 Character & Element
                  </h3>
                  <p className={`font-bold text-blue-400 ${isMobileDevice ? 'text-lg' : 'text-xl'}`}>
                    {data_chars[selectedHunter.character]?.name || characters[selectedHunter.character]?.name || selectedHunter.character}
                  </p>
                  <p className={`text-gray-400 mt-1 ${isMobileDevice ? 'text-xs' : 'text-sm'}`}>
                    {data_chars[selectedHunter.character]?.element || characters[selectedHunter.character]?.element || 'Unknown'} • Scale: {selectedHunter.builderInfo?.scaleStat || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Stats Détaillées */}
              <div className={`grid gap-4 mb-6 ${isMobileDevice ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 gap-6 mb-8'}`}>
                <div className="bg-black/30 rounded-lg p-4 border border-green-500/20">
                  <h3 className={`text-green-400 font-bold mb-4 ${isMobileDevice ? 'text-sm' : ''}`}>
                    ⚡ Stats Totales
                  </h3>
                  <div className="space-y-2">
                    {selectedHunter.currentStats && Object.entries(selectedHunter.currentStats).map(([stat, value]) => (
                      <div key={stat} className={`flex justify-between ${isMobileDevice ? 'text-xs' : ''}`}>
                        <span className="text-gray-400">{stat}:</span>
                        <span className="text-white font-bold">{formatStat(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
                  <h3 className={`text-purple-400 font-bold mb-4 ${isMobileDevice ? 'text-sm' : ''}`}>
                    🎨 Stats Artefacts
                  </h3>
                  <div className="space-y-2">
                    {selectedHunter.statsFromArtifacts && Object.entries(selectedHunter.statsFromArtifacts).map(([stat, value]) => (
                      <div key={stat} className={`flex justify-between ${isMobileDevice ? 'text-xs' : ''}`}>
                        <span className="text-gray-400">{stat}:</span>
                        <span className="text-white font-bold">{formatStat(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sets d'Artefacts */}
              {selectedHunter.setAnalysis && (
                <div className={`bg-black/30 rounded-lg p-4 border border-blue-500/20 mb-6 ${isMobileDevice ? 'mb-4' : 'mb-8'}`}>
                  <h3 className={`text-blue-400 font-bold mb-4 ${isMobileDevice ? 'text-sm' : ''}`}>
                    🎨 Sets d'Artefacts
                  </h3>
                  <p className={`text-gray-300 ${isMobileDevice ? 'text-sm' : ''}`}>
                    {selectedHunter.setAnalysis.analysis || "Aucune analyse disponible"}
                  </p>
                  
                  {selectedHunter.setAnalysis.equipped && Object.keys(selectedHunter.setAnalysis.equipped).length > 0 && (
                    <div className={`mt-4 grid gap-3 ${isMobileDevice ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
                      {Object.entries(selectedHunter.setAnalysis.equipped).map(([setName, count]) => (
                        <div key={setName} className="bg-black/40 rounded-lg p-3 text-center">
                          <p className={`text-yellow-400 font-bold ${isMobileDevice ? 'text-xs' : ''}`}>
                            {setName}
                          </p>
                          <p className={`text-gray-300 ${isMobileDevice ? 'text-xs' : 'text-sm'}`}>
                            {count} pièces
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Artefacts Détaillés */}
              {selectedHunter.currentArtifacts && Object.keys(selectedHunter.currentArtifacts).length > 0 && (
                <div className={`bg-black/30 rounded-lg p-4 border border-yellow-500/20 mb-6 ${isMobileDevice ? 'mb-4' : 'mb-8'}`}>
                  <h3 className={`text-yellow-400 font-bold mb-4 ${isMobileDevice ? 'text-sm' : ''}`}>
                    🎨 Artefacts Équipés
                  </h3>
                  <div className="artifact-grid">
                    {Object.entries(selectedHunter.currentArtifacts).map(([slot, artifact]) => (
                      <div key={slot} className="artifact-slot">
                        <h4 className={`text-yellow-400 font-bold mb-2 ${isMobileDevice ? 'text-xs' : 'text-sm'}`}>
                          {slot}
                        </h4>
                        <p className={`text-blue-400 mb-2 ${isMobileDevice ? 'text-xs' : 'text-xs'}`}>
                          {artifact.set || 'Aucun Set'}
                        </p>
                        
                        {/* Main Stat */}
                        <div className="mb-3">
                          <p className={`text-gray-400 ${isMobileDevice ? 'text-xs' : 'text-xs'}`}>
                            Main:
                          </p>
                          <p className={`text-white font-bold ${isMobileDevice ? 'text-xs' : 'text-sm'}`}>
                            {artifact.mainStat || 'N/A'}
                            {artifact.mainStatValue && ` (+${Math.round(artifact.mainStatValue)})`}
                          </p>
                        </div>

                        {/* Sub Stats */}
                        <div>
                          <p className={`text-gray-400 mb-1 ${isMobileDevice ? 'text-xs' : 'text-xs'}`}>
                            Sub:
                          </p>
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
                                <p key={index} className={`text-gray-300 ${isMobileDevice ? 'text-xs' : 'text-xs'}`}>
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

              {/* Notes */}
              {selectedHunter.notes && (
                <div className="bg-black/30 rounded-lg p-4 border border-gray-500/20">
                  <h3 className={`text-gray-400 font-bold mb-2 ${isMobileDevice ? 'text-sm' : ''}`}>
                    📝 Notes
                  </h3>
                  <p className={`text-gray-300 ${isMobileDevice ? 'text-sm' : ''}`}>
                    {selectedHunter.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HallOfFlamePage;