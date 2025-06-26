// HallOfFlamePage.jsx - 🏆 HALL OF FLAME RANKING SYSTEM V2.0 BY KAISEL
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const HallOfFlamePage = ({ 
  onClose, 
  showTankMessage,
  characters = {},
  onNavigateToBuilder,
  
  // 🆕 PROPS AJOUTÉES POUR ÉVITER LES ERREURS
  selectedCharacter,
  currentStats = {},
  currentArtifacts = {},
  statsFromArtifacts = {},
  currentCores = {},
  currentGems = {},
  currentWeapon = {}
}) => {
  const { t } = useTranslation();
  const [hunters, setHunters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRanking, setSelectedRanking] = useState('totalScore'); // totalScore, artifactsScore
  const [sortBy, setSortBy] = useState('totalScore');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuild, setSelectedGuild] = useState('');
  const [selectedElement, setSelectedElement] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [huntersPerPage] = useState(12);
  const [selectedHunter, setSelectedHunter] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // 🔍 DÉTECTION MOBILE
  const isMobileDevice = window.innerWidth < 768;

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
          showTankMessage(`✅ ${validatedHunters.length} hunters validés chargés depuis le backend!`, true, 'kaisel');
        } else {
          throw new Error(result.error || 'Erreur API');
        }
        
      } catch (error) {
        console.error('❌ Erreur chargement API:', error);
        showTankMessage(`❌ Erreur API: ${error.message}. Tentative fallback localStorage...`, true, 'kaisel');
        
        // Fallback localStorage (aussi filtré)
        try {
          const hallOfFlameKey = 'builderberu_hallofflame';
          const stored = localStorage.getItem(hallOfFlameKey);
          const huntersData = stored ? JSON.parse(stored) : [];
          // Filtrer même en fallback
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

    // Recherche par nom
    if (searchTerm) {
      filtered = filtered.filter(hunter =>
        hunter.hunterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hunter.guildName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par guilde
    if (selectedGuild) {
      filtered = filtered.filter(hunter => hunter.guildName === selectedGuild);
    }

    // Filtre par élément
    if (selectedElement) {
      filtered = filtered.filter(hunter => 
        characters[hunter.character]?.element === selectedElement
      );
    }

    // Tri selon le ranking sélectionné
    filtered.sort((a, b) => {
      if (selectedRanking === 'artifactsScore') {
        return (b.artifactsScore || 0) - (a.artifactsScore || 0);
      } else {
        return (b.totalScore || 0) - (a.totalScore || 0);
      }
    });

    return filtered;
  }, [hunters, searchTerm, selectedGuild, selectedElement, selectedRanking, characters]);

  // 📄 PAGINATION
  const paginatedHunters = useMemo(() => {
    const startIndex = (currentPage - 1) * huntersPerPage;
    return filteredAndSortedHunters.slice(startIndex, startIndex + huntersPerPage);
  }, [filteredAndSortedHunters, currentPage, huntersPerPage]);

  const totalPages = Math.ceil(filteredAndSortedHunters.length / huntersPerPage);

  // 🏅 OBTENIR LES GUILDES UNIQUES
  const uniqueGuilds = useMemo(() => {
    const guilds = hunters
      .map(h => h.guildName)
      .filter(g => g && g.trim())
      .filter((g, i, arr) => arr.indexOf(g) === i);
    return guilds.sort();
  }, [hunters]);

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

  // 🏆 OBTENIR LE BADGE DE RANG
  const getRankBadge = (index) => {
    if (index === 0) return { emoji: '👑', color: '#ffd700', text: 'Empereur' };
    if (index === 1) return { emoji: '🥈', color: '#c0c0c0', text: '2nd' };
    if (index === 2) return { emoji: '🥉', color: '#cd7f32', text: '3rd' };
    if (index < 10) return { emoji: '🏆', color: '#ff6b35', text: `#${index + 1}` };
    if (index < 50) return { emoji: '⭐', color: '#4ecdc4', text: `#${index + 1}` };
    return { emoji: '🔹', color: '#95a5a6', text: `#${index + 1}` };
  };

  // 🔄 REFRESH DES DONNÉES DEPUIS L'API
  const handleRefresh = async () => {
    try {
      showTankMessage("🔄 Actualisation depuis le backend...", true, 'kaisel');
      
      const response = await fetch('https://api.builderberu.com/api/hallofflame/hunters');
      const result = await response.json();
      
      if (response.ok && result.success) {
        // 🛡️ FILTRER SEULEMENT LES HUNTERS VALIDÉS
        const validatedHunters = result.hunters.filter(h => h.validated === true);
        setHunters(validatedHunters);
        showTankMessage(`🔄 ${validatedHunters.length} hunters validés actualisés !`, true, 'kaisel');
      } else {
        throw new Error(result.error || 'Erreur refresh API');
      }
      
    } catch (error) {
      console.error('❌ Erreur refresh:', error);
      showTankMessage(`❌ Erreur refresh: ${error.message}`, true, 'kaisel');
    }
  };

  // 🔍 VOIR DÉTAILS D'UN HUNTER
  const handleViewDetails = (hunter) => {
    setSelectedHunter(hunter);
    setShowDetails(true);
    showTankMessage(`🔍 Analyse détaillée de ${hunter.hunterName}`, true, 'kaisel');
  };

  // 📊 FORMATER LES STATS
  const formatStat = (value) => {
    if (typeof value !== 'number') return '0';
    return Math.round(value).toLocaleString();
  };

  return (
    <>
      {/* 🎨 STYLES CSS AVANCÉS */}
      <style jsx="true">{`
        @keyframes page-enter {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes card-hover {
          0% { transform: translateY(0); }
          100% { transform: translateY(-5px); }
        }

        @keyframes rank-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.3); }
          50% { box-shadow: 0 0 25px rgba(255, 215, 0, 0.6); }
        }

        .hall-page {
          backdrop-filter: blur(15px);
          background: linear-gradient(135deg, 
            rgba(10, 10, 25, 0.95) 0%, 
            rgba(15, 15, 35, 0.98) 50%, 
            rgba(5, 5, 15, 0.95) 100%);
          animation: page-enter 0.8s ease-out;
        }

        .hunter-card {
          backdrop-filter: blur(8px);
          background: linear-gradient(135deg, 
            rgba(26, 26, 46, 0.8) 0%, 
            rgba(22, 33, 62, 0.9) 50%, 
            rgba(15, 20, 25, 0.8) 100%);
          border: 1px solid rgba(255, 215, 0, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hunter-card:hover {
          border-color: rgba(255, 215, 0, 0.5);
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .hunter-card.emperor {
          border: 2px solid #ffd700;
          box-shadow: 0 0 30px rgba(255, 215, 0, 0.4);
        }

        .rank-badge {
          background: linear-gradient(135deg, var(--rank-color), var(--rank-color-light));
          animation: rank-glow 2s infinite;
        }

        .ranking-tab {
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          color: #ffd700;
          transition: all 0.3s ease;
          position: relative;
        }

        .ranking-tab:hover {
          background: rgba(255, 215, 0, 0.2);
          border-color: #ffd700;
        }

        .ranking-tab.active {
          background: linear-gradient(135deg, #ffd700, #ffed4a);
          color: #1a1a2e;
          font-weight: bold;
        }

        .ranking-tab.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #ff6b35, #ffd700, #ff6b35);
          border-radius: 2px;
        }

        .filter-button {
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          color: #ffd700;
          transition: all 0.3s ease;
        }

        .filter-button:hover {
          background: rgba(255, 215, 0, 0.2);
          border-color: #ffd700;
        }

        .filter-button.active {
          background: linear-gradient(135deg, #ffd700, #ffed4a);
          color: #1a1a2e;
          font-weight: bold;
        }

        .loading-spinner {
          border: 3px solid rgba(255, 215, 0, 0.3);
          border-top: 3px solid #ffd700;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .stat-bar {
          background: linear-gradient(90deg, var(--stat-color), transparent);
          height: 4px;
          border-radius: 2px;
        }

        .element-badge {
          border: 2px solid var(--element-color);
          color: var(--element-color);
          background: rgba(var(--element-rgb), 0.1);
        }

        .artifacts-badge {
          background: linear-gradient(135deg, #a855f7, #ec4899);
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 8px;
        }

        .details-modal {
          backdrop-filter: blur(20px);
          background: rgba(0, 0, 0, 0.9);
        }

        .details-content {
          background: linear-gradient(135deg, 
            rgba(26, 26, 46, 0.95) 0%, 
            rgba(22, 33, 62, 0.98) 50%, 
            rgba(15, 20, 25, 0.95) 100%);
          border: 2px solid #ffd700;
          max-height: 90vh;
          overflow-y: auto;
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

        .artifact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }

        .artifact-slot {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: 8px;
          padding: 12px;
          transition: all 0.3s ease;
        }

        .artifact-slot:hover {
          border-color: rgba(255, 215, 0, 0.5);
          background: rgba(255, 215, 0, 0.05);
        }
      `}</style>

      {/* 🖼️ OVERLAY FULLSCREEN */}
      <div className="fixed inset-0 z-[9999]">
        
        {/* Background */}
        <div className="hall-page absolute inset-0">
          
          {/* Header avec navigation */}
          <div className="relative z-10 p-4 md:p-6 border-b border-yellow-500/30">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              
              {/* Titre principal */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🏆</span>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">
                    Hall Of Flame
                  </h1>
                  <p className="text-gray-300 text-sm">
                    {filteredAndSortedHunters.length} Hunter{filteredAndSortedHunters.length > 1 ? 's' : ''} validés • Système Kaisel v2.0
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  className="filter-button px-4 py-2 rounded-lg text-sm transition-all hover:scale-105"
                >
                  🔄 Refresh
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

          {/* Tabs Ranking */}
          <div className="relative z-10 px-4 md:px-6 pt-4 border-b border-gray-700/50">
            <div className="max-w-7xl mx-auto">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => {
                    setSelectedRanking('totalScore');
                    setCurrentPage(1);
                  }}
                  className={`ranking-tab px-6 py-3 rounded-lg transition-all ${
                    selectedRanking === 'totalScore' ? 'active' : ''
                  }`}
                >
                  🏆 Classement CP Total
                </button>
                <button
                  onClick={() => {
                    setSelectedRanking('artifactsScore');
                    setCurrentPage(1);
                  }}
                  className={`ranking-tab px-6 py-3 rounded-lg transition-all ${
                    selectedRanking === 'artifactsScore' ? 'active' : ''
                  }`}
                >
                  🎨 Classement CP Artefacts
                </button>
              </div>
            </div>
          </div>

          {/* Filtres et recherche */}
          <div className="relative z-10 p-4 md:p-6 border-b border-gray-700/50">
            <div className="max-w-7xl mx-auto space-y-4">
              
              {/* Barre de recherche */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="🔍 Rechercher un hunter ou une guilde..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-yellow-500/30 rounded-lg text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Filtres avancés */}
              <div className="flex flex-wrap gap-3">
                
                {/* Guilde */}
                {uniqueGuilds.length > 0 && (
                  <select
                    value={selectedGuild}
                    onChange={(e) => setSelectedGuild(e.target.value)}
                    className="filter-button px-3 py-2 rounded-lg text-sm bg-black/30 focus:outline-none"
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
                  className="filter-button px-3 py-2 rounded-lg text-sm bg-black/30 focus:outline-none"
                >
                  <option value="">🌟 Tous les éléments</option>
                  <option value="Fire">🔥 Fire</option>
                  <option value="Water">💧 Water</option>
                  <option value="Wind">💨 Wind</option>
                  <option value="Light">☀️ Light</option>
                  <option value="Dark">🌙 Dark</option>
                </select>

                {/* Reset filtres */}
                {(searchTerm || selectedGuild || selectedElement) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedGuild('');
                      setSelectedElement('');
                      setCurrentPage(1);
                    }}
                    className="filter-button px-3 py-2 rounded-lg text-sm hover:bg-red-600/20 hover:border-red-500 hover:text-red-400"
                  >
                    ❌ Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="relative z-10 flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto">

              {loading ? (
                // Loading state
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="loading-spinner mb-4"></div>
                  <h3 className="text-xl text-yellow-400 mb-2">Chargement du Hall Of Flame...</h3>
                  <p className="text-gray-400">Kaisel analyse les données...</p>
                </div>
              ) : hunters.length === 0 ? (
                // Empty state
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="text-xl text-yellow-400 mb-2">Aucun Hunter validé</h3>
                  <p className="text-gray-400 mb-6">
                    Soyez le premier à être validé dans le Hall Of Flame !
                  </p>
                  <button
                    onClick={onNavigateToBuilder}
                    className="filter-button active px-6 py-3 rounded-lg transition-all hover:scale-105"
                  >
                    🚀 Aller au Builder
                  </button>
                </div>
              ) : filteredAndSortedHunters.length === 0 ? (
                // No results state
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl text-yellow-400 mb-2">Aucun résultat</h3>
                  <p className="text-gray-400">
                    Essayez de modifier vos filtres de recherche
                  </p>
                </div>
              ) : (
                // Hunters grid
                <>
                  {/* Stats globales */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-black/30 rounded-lg p-4 border border-yellow-500/20">
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">Total Hunters</p>
                        <p className="text-2xl font-bold text-yellow-400">{hunters.length}</p>
                      </div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4 border border-red-500/20">
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">
                          {selectedRanking === 'artifactsScore' ? 'CP Artifacts Moyen' : 'CP Total Moyen'}
                        </p>
                        <p className="text-2xl font-bold text-red-400">
                          {hunters.length > 0 ? Math.floor(hunters.reduce((sum, h) => sum + (selectedRanking === 'artifactsScore' ? (h.artifactsScore || 0) : h.totalScore), 0) / hunters.length).toLocaleString() : 0}
                        </p>
                      </div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4 border border-blue-500/20">
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">Guildes</p>
                        <p className="text-2xl font-bold text-blue-400">{uniqueGuilds.length}</p>
                      </div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4 border border-green-500/20">
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">
                          {selectedRanking === 'artifactsScore' ? 'CP Artifacts Max' : 'CP Total Max'}
                        </p>
                        <p className="text-2xl font-bold text-green-400">
                          {hunters.length > 0 ? Math.max(...hunters.map(h => selectedRanking === 'artifactsScore' ? (h.artifactsScore || 0) : h.totalScore)).toLocaleString() : 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Grille des hunters */}
                  <div className={`grid gap-6 ${isMobileDevice ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                    {paginatedHunters.map((hunter, index) => {
                      const globalRank = (currentPage - 1) * huntersPerPage + index;
                      const rankBadge = getRankBadge(globalRank);
                      const character = characters[hunter.character];
                      const elementColor = getElementColor(character?.element);
                      const currentScore = selectedRanking === 'artifactsScore' ? (hunter.artifactsScore || 0) : hunter.totalScore;
                      
                      return (
                        <div
                          key={hunter.id}
                          className={`hunter-card rounded-xl p-6 group cursor-pointer ${globalRank === 0 ? 'emperor' : ''}`}
                          onClick={() => handleViewDetails(hunter)}
                        >
                          {/* Header avec rang et infos */}
                          <div className="flex items-start justify-between mb-4">
                            <div
                              className="rank-badge px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2"
                              style={{ 
                                '--rank-color': rankBadge.color,
                                '--rank-color-light': rankBadge.color + '40'
                              }}
                            >
                              <span>{rankBadge.emoji}</span>
                              <span>{rankBadge.text}</span>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1">
                              {character?.element && (
                                <div
                                  className="element-badge px-2 py-1 rounded text-xs font-bold"
                                  style={{
                                    '--element-color': elementColor,
                                    '--element-rgb': elementColor.slice(1).match(/.{2}/g).map(hex => parseInt(hex, 16)).join(',')
                                  }}
                                >
                                  {character.element}
                                </div>
                              )}
                              
                              {selectedRanking === 'artifactsScore' && (
                                <div className="artifacts-badge">
                                  🎨 ARTIFACTS
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Infos hunter */}
                          <div className="mb-4">
                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-yellow-400 transition-colors">
                              {hunter.hunterName}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {hunter.characterName} • {hunter.guildName || 'Sans guilde'}
                            </p>
                            {hunter.screenshots && hunter.screenshots.length > 0 && (
                              <p className="text-blue-400 text-xs mt-1">
                                📸 {hunter.screenshots.length} screenshot{hunter.screenshots.length > 1 ? 's' : ''}
                              </p>
                            )}
                          </div>

                          {/* Score principal */}
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-400">
                                {selectedRanking === 'artifactsScore' ? 'CP Artefacts' : 'CP Total'}
                              </span>
                              <span className={`font-bold ${selectedRanking === 'artifactsScore' ? 'text-purple-400' : 'text-yellow-400'}`}>
                                {currentScore.toLocaleString()}
                              </span>
                            </div>
                            
                            {/* Score secondaire */}
                            {selectedRanking === 'totalScore' && hunter.artifactsScore && (
                              <div className="flex justify-between text-xs mb-2">
                                <span className="text-gray-500">CP Artefacts</span>
                                <span className="text-purple-300">{hunter.artifactsScore.toLocaleString()}</span>
                              </div>
                            )}
                            
                            {selectedRanking === 'artifactsScore' && hunter.totalScore && (
                              <div className="flex justify-between text-xs mb-2">
                                <span className="text-gray-500">CP Total</span>
                                <span className="text-yellow-300">{hunter.totalScore.toLocaleString()}</span>
                              </div>
                            )}
                          </div>

                          {/* Stats principales */}
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
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
                              <div className="flex justify-between text-sm mb-1">
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
                              <div className="flex justify-between text-sm mb-1">
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

                          {/* Footer avec date et sets */}
                          <div className="mt-4 pt-4 border-t border-gray-700/50">
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
                    <div className="flex justify-center items-center gap-4 mt-8">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="filter-button px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ← Précédent
                      </button>
                      
                      <span className="text-gray-300">
                        Page {currentPage} sur {totalPages}
                      </span>
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="filter-button px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Suivant →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 MODAL DÉTAILS HUNTER */}
      {showDetails && selectedHunter && (
        <div className="details-modal fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="details-content rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            
            {/* Header Modal */}
            <div className="p-6 border-b border-yellow-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-yellow-400">{selectedHunter.hunterName}</h2>
                    <p className="text-gray-300">
                      {selectedHunter.characterName} • {selectedHunter.guildName || 'Sans guilde'}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedHunter(null);
                  }}
                  className="w-10 h-10 rounded-full bg-red-600/20 hover:bg-red-600/40 text-red-400 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Contenu Modal */}
            <div className="p-6">
              
              {/* Stats Globales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-black/30 rounded-lg p-4 border border-yellow-500/20">
                  <h3 className="text-yellow-400 font-bold mb-2">🏆 CP Total</h3>
                  <p className="text-3xl font-bold text-yellow-400">{selectedHunter.totalScore?.toLocaleString()}</p>
                  {selectedHunter.cpDetailsTotal?.details && (
                    <div className="mt-2 space-y-1 text-xs">
                      {selectedHunter.cpDetailsTotal.details.slice(0, 3).map((detail, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-gray-400">{detail.name}:</span>
                          <span className="text-white">{detail.points?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
                  <h3 className="text-purple-400 font-bold mb-2">🎨 CP Artefacts</h3>
                  <p className="text-3xl font-bold text-purple-400">{selectedHunter.artifactsScore?.toLocaleString() || 0}</p>
                  {selectedHunter.cpDetailsArtifacts?.details && (
                    <div className="mt-2 space-y-1 text-xs">
                      {selectedHunter.cpDetailsArtifacts.details.slice(0, 3).map((detail, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-gray-400">{detail.name}:</span>
                          <span className="text-white">{detail.points?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="bg-black/30 rounded-lg p-4 border border-blue-500/20">
                  <h3 className="text-blue-400 font-bold mb-2">🎯 Scale Stat</h3>
                  <p className="text-xl font-bold text-blue-400">
                    {selectedHunter.builderInfo?.scaleStat || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {selectedHunter.builderInfo?.element || 'Unknown'} • {selectedHunter.builderInfo?.class || 'Unknown'}
                  </p>
                </div>
              </div>

              {/* Stats Détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

              {/* Sets d'Artefacts */}
              {selectedHunter.setAnalysis && (
                <div className="bg-black/30 rounded-lg p-4 border border-blue-500/20 mb-8">
                  <h3 className="text-blue-400 font-bold mb-4">🎨 Sets d'Artefacts</h3>
                  <p className="text-gray-300">{selectedHunter.setAnalysis.analysis || "Aucune analyse disponible"}</p>
                  
                  {selectedHunter.setAnalysis.equipped && Object.keys(selectedHunter.setAnalysis.equipped).length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(selectedHunter.setAnalysis.equipped).map(([setName, count]) => (
                        <div key={setName} className="bg-black/40 rounded-lg p-3 text-center">
                          <p className="text-yellow-400 font-bold">{setName}</p>
                          <p className="text-gray-300 text-sm">{count} pièces</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Artefacts Détaillés */}
              {selectedHunter.currentArtifacts && Object.keys(selectedHunter.currentArtifacts).length > 0 && (
                <div className="bg-black/30 rounded-lg p-4 border border-yellow-500/20 mb-8">
                  <h3 className="text-yellow-400 font-bold mb-4">🎨 Artefacts Équipés</h3>
                  <div className="artifact-grid">
                    {Object.entries(selectedHunter.currentArtifacts).map(([slot, artifact]) => (
                      <div key={slot} className="artifact-slot">
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

              {/* Screenshots */}
              {selectedHunter.screenshots && selectedHunter.screenshots.length > 0 && (
                <div className="bg-black/30 rounded-lg p-4 border border-green-500/20 mb-8">
                  <h3 className="text-green-400 font-bold mb-4">📸 Screenshots ({selectedHunter.screenshots.length})</h3>
                  <div className="screenshot-gallery">
                    {selectedHunter.screenshots.map((screenshot, index) => (
                      <div key={index} className="screenshot-item">
                        <img 
                          src={screenshot.url} 
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-auto"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedHunter.notes && (
                <div className="bg-black/30 rounded-lg p-4 border border-gray-500/20">
                  <h3 className="text-gray-400 font-bold mb-2">📝 Notes</h3>
                  <p className="text-gray-300">{selectedHunter.notes}</p>
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