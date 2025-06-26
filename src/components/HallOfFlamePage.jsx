// HallOfFlamePage.jsx - 🏆 HALL OF FLAME RANKING SYSTEM
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const HallOfFlamePage = ({ 
  onClose, 
  showTankMessage,
  characters = {},
  onNavigateToBuilder 
}) => {
  const { t } = useTranslation();
  const [hunters, setHunters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, guild, element, class
  const [sortBy, setSortBy] = useState('totalScore'); // totalScore, attack, defense, hp
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuild, setSelectedGuild] = useState('');
  const [selectedElement, setSelectedElement] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [huntersPerPage] = useState(20);

  // 🔍 DÉTECTION MOBILE
  const isMobileDevice = window.innerWidth < 768;

  // 📊 CHARGER LES HUNTERS DEPUIS LOCALSTORAGE
  useEffect(() => {
    const loadHunters = () => {
      setLoading(true);
      try {
        const hallOfFlameKey = 'builderberu_hallofflame';
        const stored = localStorage.getItem(hallOfFlameKey);
        const huntersData = stored ? JSON.parse(stored) : [];
        
        // Simuler un petit délai pour l'effet
        setTimeout(() => {
          setHunters(huntersData);
          setLoading(false);
        }, 800);
        
      } catch (error) {
        console.error('Erreur chargement HallOfFlame:', error);
        setHunters([]);
        setLoading(false);
      }
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

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'attack':
          return (b.stats?.Attack || 0) - (a.stats?.Attack || 0);
        case 'defense':
          return (b.stats?.Defense || 0) - (a.stats?.Defense || 0);
        case 'hp':
          return (b.stats?.HP || 0) - (a.stats?.HP || 0);
        case 'name':
          return a.hunterName.localeCompare(b.hunterName);
        case 'date':
          return new Date(b.timestamp) - new Date(a.timestamp);
        default: // totalScore
          return b.totalScore - a.totalScore;
      }
    });

    return filtered;
  }, [hunters, searchTerm, selectedGuild, selectedElement, sortBy, characters]);

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

  // 🔄 REFRESH DES DONNÉES
  const handleRefresh = () => {
    const hallOfFlameKey = 'builderberu_hallofflame';
    const stored = localStorage.getItem(hallOfFlameKey);
    const huntersData = stored ? JSON.parse(stored) : [];
    setHunters(huntersData);
    showTankMessage("🔄 HallOfFlame mis à jour !", true, 'kaisel');
  };

  return (
    <>
      {/* 🎨 STYLES CSS HALLOFFLAME PAGE */}
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

        .rank-badge {
          background: linear-gradient(135deg, var(--rank-color), var(--rank-color-light));
          animation: rank-glow 2s infinite;
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
                    {filteredAndSortedHunters.length} Hunter{filteredAndSortedHunters.length > 1 ? 's' : ''} • Mis à jour en temps réel
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
                
                {/* Tri */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-button px-3 py-2 rounded-lg text-sm bg-black/30 focus:outline-none"
                >
                  <option value="totalScore">📊 CP Total</option>
                  <option value="attack">⚔️ Attack</option>
                  <option value="defense">🛡️ Defense</option>
                  <option value="hp">❤️ HP</option>
                  <option value="name">📝 Nom</option>
                  <option value="date">📅 Date</option>
                </select>

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
                  <h3 className="text-xl text-yellow-400 mb-2">Aucun Hunter enregistré</h3>
                  <p className="text-gray-400 mb-6">
                    Soyez le premier à rejoindre le Hall Of Flame !
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
                        <p className="text-gray-400 text-sm">CP Moyen</p>
                        <p className="text-2xl font-bold text-red-400">
                          {hunters.length > 0 ? Math.floor(hunters.reduce((sum, h) => sum + h.totalScore, 0) / hunters.length).toLocaleString() : 0}
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
                        <p className="text-gray-400 text-sm">CP Max</p>
                        <p className="text-2xl font-bold text-green-400">
                          {hunters.length > 0 ? Math.max(...hunters.map(h => h.totalScore)).toLocaleString() : 0}
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
                      
                      return (
                        <div
                          key={hunter.id}
                          className="hunter-card rounded-xl p-6 group cursor-pointer"
                          onClick={() => {
                            showTankMessage(`🔍 Analyse de ${hunter.hunterName} - ${hunter.characterName} (${hunter.totalScore.toLocaleString()} CP)`, true, 'kaisel');
                          }}
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
                          </div>

                          {/* Infos hunter */}
                          <div className="mb-4">
                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-yellow-400 transition-colors">
                              {hunter.hunterName}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {hunter.characterName} • {hunter.guildName || 'Sans guilde'}
                            </p>
                          </div>

                          {/* Stats principales */}
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-400">CP Total</span>
                                <span className="text-yellow-400 font-bold">{hunter.totalScore.toLocaleString()}</span>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-400">Attack</span>
                                <span className="text-red-400">{Math.floor(hunter.stats?.Attack || 0).toLocaleString()}</span>
                              </div>
                              <div 
                                className="stat-bar"
                                style={{ 
                                  '--stat-color': '#ef4444',
                                  width: `${Math.min(100, (hunter.stats?.Attack || 0) / 200000 * 100)}%`
                                }}
                              ></div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-400">Defense</span>
                                <span className="text-blue-400">{Math.floor(hunter.stats?.Defense || 0).toLocaleString()}</span>
                              </div>
                              <div 
                                className="stat-bar"
                                style={{ 
                                  '--stat-color': '#3b82f6',
                                  width: `${Math.min(100, (hunter.stats?.Defense || 0) / 200000 * 100)}%`
                                }}
                              ></div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-400">HP</span>
                                <span className="text-green-400">{Math.floor(hunter.stats?.HP || 0).toLocaleString()}</span>
                              </div>
                              <div 
                                className="stat-bar"
                                style={{ 
                                  '--stat-color': '#22c55e',
                                  width: `${Math.min(100, (hunter.stats?.HP || 0) / 200000 * 100)}%`
                                }}
                              ></div>
                            </div>
                          </div>

                          {/* Footer avec date */}
                          <div className="mt-4 pt-4 border-t border-gray-700/50">
                            <p className="text-gray-500 text-xs">
                              📅 {new Date(hunter.timestamp).toLocaleDateString()}
                            </p>
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
    </>
  );
};

export default HallOfFlamePage;