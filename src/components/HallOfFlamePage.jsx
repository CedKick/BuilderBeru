import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { data_chars } from '../data/data_char.js';

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
  const [selectedCharacterFilter, setSelectedCharacterFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [huntersPerPage] = useState(12);
  const [selectedHunter, setSelectedHunter] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // 🆕 ÉTATS POUR FILTRAGE CHECKED v5.0
  const [showOnlyChecked, setShowOnlyChecked] = useState(true); // Par défaut true
  const [showPending, setShowPending] = useState(false);
  
  // États pour hover CP tooltips
  const [showCpTooltipTotal, setShowCpTooltipTotal] = useState(null);
  const [showCpTooltipArtifacts, setShowCpTooltipArtifacts] = useState(null);

  // Détection mobile
  const isMobileDevice = window.innerWidth < 768;
  const isTabletDevice = window.innerWidth >= 768 && window.innerWidth < 1024;

  // 📊 CHARGER LES HUNTERS DEPUIS L'API BACKEND - v5.0 AVEC FILTRE CHECKED
  useEffect(() => {
    const loadHunters = async () => {
      setLoading(true);
      try {
        showTankMessage("🌐 Chargement du Hall Of Flame depuis l'API...", true, 'kaisel');
        
        // 🆕 PARAMS QUERY v5.0
        const params = new URLSearchParams({
          checked: showOnlyChecked && !showPending ? 'true' : 'false',
          showPending: showPending ? 'true' : 'false'
        });
        
        const response = await fetch(`https://api.builderberu.com/api/hallofflame/hunters?${params}`);
        const result = await response.json();
        
        if (response.ok && result.success) {
          setHunters(result.hunters);
          
          // 🆕 MESSAGE ADAPTÉ v5.0
          const message = showOnlyChecked && !showPending ? 
            `✅ ${result.hunters.length} hunters vérifiés chargés!` :
            showPending ? 
            `📋 ${result.hunters.length} hunters (vérifiés + en attente)` :
            `⏳ ${result.hunters.length} hunters en attente`;
            
          showTankMessage(message, true, 'kaisel');
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
          
          // 🆕 FILTRE LOCAL v5.0
          let filteredData = huntersData;
          if (showOnlyChecked && !showPending) {
            filteredData = huntersData.filter(h => h.checked === true);
          } else if (!showPending) {
            filteredData = huntersData.filter(h => h.checked !== true);
          }
          
          setHunters(filteredData);
        } catch {
          setHunters([]);
        }
      }
      
      setLoading(false);
    };

    loadHunters();
  }, [showOnlyChecked, showPending]); // 🆕 RELOAD QUAND FILTRE CHANGE

  useEffect(() => {
    if (isMobileDevice) {
      document.body.classList.add('modal-open');
      return () => document.body.classList.remove('modal-open');
    }
  }, []);

  // Debug helper
  useEffect(() => {
    if (hunters.length > 0) {
      console.log('🔍 Premier hunter pour debug:', hunters[0]);
      console.log('📊 CP Details Total:', hunters[0].cpDetailsTotal);
      console.log('🎨 CP Details Artifacts:', hunters[0].cpDetailsArtifacts);
    }
  }, [hunters]);

  // 🎯 FILTRAGE ET TRI DES HUNTERS
  const filteredAndSortedHunters = useMemo(() => {
    let filtered = [...hunters];

    if (searchTerm) {
      filtered = filtered.filter(hunter =>
        (hunter.pseudo && hunter.pseudo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (hunter.character && hunter.character.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (hunter.characterName && hunter.characterName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (characters[hunter.character]?.name && characters[hunter.character].name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (data_chars[hunter.character]?.name && data_chars[hunter.character].name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedGuild) {
      filtered = filtered.filter(hunter => hunter.guildName === selectedGuild);
    }

    if (selectedElement) {
      filtered = filtered.filter(hunter => 
        characters[hunter.character]?.element === selectedElement ||
        data_chars[hunter.character]?.element === selectedElement
      );
    }

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
  }, [hunters, searchTerm, selectedGuild, selectedElement, selectedCharacterFilter, selectedRanking, characters]);

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

  // CHARACTERS UNIQUES (basé sur les hunters présents)
  const uniqueCharacters = useMemo(() => {
    const characterIds = hunters
      .map(h => h.character)
      .filter(c => c && c.trim())
      .filter((c, i, arr) => arr.indexOf(c) === i);
    
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

  // OBTENIR L'IMAGE DU CHARACTER DEPUIS DATA_CHARS
  const getCharacterImage = (characterId) => {
    const charData = data_chars[characterId];
    if (charData) {
      return {
        icon: charData.icon,
        img: charData.img,
        name: charData.name,
        element: charData.element
      };
    }
    return null;
  };

  // COMPOSANT TOOLTIP CP SÉCURISÉ
  const CpTooltip = ({ details, title, color }) => {
    if (!details || !Array.isArray(details) || details.length === 0) {
      return ReactDOM.createPortal(
        <div className="cp-tooltip-hall">
          <p className="font-bold mb-2 text-red-400">⚠️ Pas de détails CP</p>
          <p className="text-gray-300 text-xs">Données CP non disponibles</p>
        </div>,
        document.body
      );
    }

    return ReactDOM.createPortal(
      <div className="cp-tooltip-hall">
        <p className="font-bold mb-2" style={{ color }}>{title}:</p>
        {details.map((detail, index) => (
          <div key={index} className="flex justify-between items-center mb-1">
            <span style={{ color: detail.color || '#fff' }} className="text-sm">
              {detail.name || 'Stat inconnue'}:
            </span>
            <span className="text-gray-300 text-sm">
              {(detail.value || 0).toLocaleString()} × {detail.multiplier || '?'} = 
              <span className="text-white font-bold ml-1">
                {(detail.points || 0).toLocaleString()}
              </span>
            </span>
          </div>
        ))}
        <hr className="border-gray-600 my-2" />
        <div className="flex justify-between font-bold">
          <span style={{ color }}>Total:</span>
          <span style={{ color }}>
            {details.reduce((sum, d) => sum + (d.points || 0), 0).toLocaleString()}
          </span>
        </div>
      </div>,
      document.body
    );
  };

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
      
      const params = new URLSearchParams({
        checked: showOnlyChecked && !showPending ? 'true' : 'false',
        showPending: showPending ? 'true' : 'false'
      });
      
      const response = await fetch(`https://api.builderberu.com/api/hallofflame/hunters?${params}`);
      const result = await response.json();
      
      if (response.ok && result.success) {
        setHunters(result.hunters);
        showTankMessage(`🔄 ${result.hunters.length} hunters actualisés !`, true, 'kaisel');
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
      {/* 🎨 STYLES CSS - GARDEZ TOUT IDENTIQUE + AJOUTS v5.0 */}
      <style jsx="true">{`
/* 🔥 BUILDERBERU HALL OF FLAME - v5.0 CHECKED SYSTEM 🔥 */

@keyframes page-enter {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 🏰 LAYOUT PRINCIPAL */
.hall-page {
  backdrop-filter: blur(15px);
  background: linear-gradient(135deg, 
    rgba(10, 10, 25, 0.95) 0%, 
    rgba(15, 15, 35, 0.98) 50%, 
    rgba(5, 5, 15, 0.95) 100%);
  animation: page-enter 0.6s ease-out;
  overflow: visible !important;
}

/* 🔒 BODY LOCK POUR MODAL */
body.modal-open {
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100vh;
  height: 100dvh;
}

/* 🃏 HUNTER CARDS */
.hunter-card {
  background: linear-gradient(145deg, rgba(36, 0, 70, 0.85), rgba(0, 0, 20, 0.95));
  border: 1px solid #a855f7;
  border-radius: 20px;
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.25);

  backdrop-filter: blur(8px);
  background: linear-gradient(135deg, 
    rgba(26, 26, 46, 0.9) 0%, 
    rgba(22, 33, 62, 0.95) 50%, 
    rgba(15, 20, 25, 0.9) 100%);
  border: 1px solid rgba(255, 215, 0, 0.2);
  transition: all 0.3s ease;
  overflow: visible !important;
  position: relative;
}

.hunter-card:hover {
  border-color: rgba(255, 215, 0, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  z-index: 100;
}

.hunter-card.emperor {
  border: 2px solid #ffd700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

/* 🆕 HUNTER CARD NON VÉRIFIÉ v5.0 */
.hunter-card.unchecked {
  border: 1px solid rgba(255, 140, 0, 0.3);
  background: linear-gradient(135deg, 
    rgba(40, 26, 20, 0.9) 0%, 
    rgba(35, 22, 15, 0.95) 50%, 
    rgba(25, 15, 10, 0.9) 100%);
}

.hunter-card.unchecked:hover {
  border-color: rgba(255, 140, 0, 0.6);
}

/* 🏅 BADGES ET ÉLÉMENTS */
.rank-badge {
  background: linear-gradient(135deg, var(--rank-color), var(--rank-color-light));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
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

/* 🆕 BADGE NON VÉRIFIÉ v5.0 */
.unchecked-badge {
  background: linear-gradient(135deg, #ff8c00, #ff6b00);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* 🆕 TOGGLE CHECKED v5.0 */
.checked-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.3);
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid rgba(255, 215, 0, 0.3);
  transition: all 0.3s ease;
}

.checked-toggle:hover {
  border-color: rgba(255, 215, 0, 0.5);
  background: rgba(0, 0, 0, 0.4);
}

.checked-toggle input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.checked-toggle label {
  cursor: pointer;
  user-select: none;
  font-size: 12px;
  color: #ffd700;
}

/* 🎭 CHARACTER IMAGES */
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

/* 🎯 BOUTONS ET TABS */
.ranking-tab, .filter-button {
  background-color: rgba(159, 122, 234, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.4);
  color: #d8b4fe;
  font-weight: 600;
  transition: all 0.2s ease-in-out;

  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  color: #ffd700;
  transition: all 0.3s ease;
}

.ranking-tab:hover, .filter-button:hover {
  background-color: rgba(168, 85, 247, 0.2);
  border-color: #a855f7;
  color: #fff;

  background: rgba(255, 215, 0, 0.2);
  border-color: #ffd700;
}

.ranking-tab.active, .filter-button.active {
  background: linear-gradient(135deg, #ffd700, #ffed4a);
  color: #1a1a2e;
  font-weight: bold;
}

/* ⚡ LOADING */
.loading-spinner {
  border: 3px solid rgba(255, 215, 0, 0.3);
  border-top: 3px solid #ffd700;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
}

/* 📊 STATS BARS */
.stat-bar {
  background: linear-gradient(90deg, var(--stat-color), rgba(255,255,255,0.05));
  height: 3px;
  border-radius: 2px;
  will-change: width;
}

/* 💡 TOOLTIPS CP - CENTRÉ ÉCRAN POUR TOUS 🎯 */
.cp-score-hover {
  position: relative;
  cursor: help;
  transition: all 0.3s ease;
  display: inline-block;
  z-index: 1;
}

.cp-score-hover:hover {
  transform: scale(1.05);
  z-index: 9999;
}

/* 🎯 TOOLTIP - TOUJOURS CENTRÉ ÉCRAN */
.cp-tooltip-hall {
  /* 🔧 POSITION FIXE CENTRÉE ÉCRAN */
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  
  /* 🎨 STYLE */
  background: rgba(0, 0, 0, 0.98);
  border: 2px solid rgba(255, 215, 0, 0.8);
  border-radius: 8px;
  padding: 16px;
  
  /* 📏 TAILLE RESPONSIVE */
  width: 320px;
  max-width: calc(100vw - 40px);
  
  /* 🔧 Z-INDEX MAXIMUM */
  z-index: 999999;
  
  /* 📝 TEXTE */
  font-size: 13px;
  white-space: normal;
  word-wrap: break-word;
  
  /* 🌟 EFFECTS */
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(15px);
  
  /* 🔧 POINTER EVENTS */
  pointer-events: auto;
}

/* 🔧 OVERLAY BACKGROUND */
.cp-tooltip-hall::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: -1;
}

/* 🔧 PAS D'ARROW - PLUS BESOIN */
.cp-tooltip-hall::before {
  display: none;
}

/* 🎨 MODAL DÉTAILS */
.details-modal {
  backdrop-filter: blur(20px);
  background: rgba(0, 0, 0, 0.92);
  z-index: 10000;
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

/* 🔧 CONTAINERS OVERFLOW VISIBLE DESKTOP */
.max-w-7xl {
  overflow: visible !important;
}

.grid {
  overflow: visible !important;
}

.relative.z-10.flex-1.overflow-y-auto {
  overflow: visible !important;
}

/* 🖼️ NO SCREENSHOTS */
.screenshot-section,
.screenshot-gallery,
.screenshot-item,
.screenshot-info {
  display: none !important;
}

/* ⚡ PERFORMANCE */
.hunter-card, .details-content {
  contain: style paint;
}

/* 🌙 DARK MODE */
@media (prefers-color-scheme: dark) {
  .hall-page {
    background: linear-gradient(135deg, 
      rgba(5, 5, 15, 0.98) 0%, 
      rgba(10, 10, 25, 0.98) 50%, 
      rgba(5, 5, 15, 0.98) 100%);
    overflow: visible !important;
  }
}

/* 📱 MOBILE STYLES */
@media (max-width: 768px) {
  /* 🏰 LAYOUT MOBILE */
  .hall-page {
    padding: 0 !important;
    overflow: hidden !important;
    height: 100vh;
    height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  /* 📱 MOBILE SCROLL CONTAINER */
  .mobile-scroll {
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    flex: 1;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }

  /* 📦 CONTENT CONTAINER */
  .max-w-7xl.mx-auto {
    padding: 8px 4px 60px 4px !important;
  }

  /* 🃏 HUNTER CARDS MOBILE */
  .hunter-card {
  background: linear-gradient(145deg, rgba(36, 0, 70, 0.85), rgba(0, 0, 20, 0.95));
  border: 1px solid #a855f7;
  border-radius: 20px;
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.25);

    margin: 8px 12px !important;
    padding: 16px !important;
    border-radius: 12px !important;
    overflow: visible !important;
    min-height: auto !important;
    height: auto !important;
  }

  .hunter-card:hover {
    transform: none !important;
    z-index: 1000;
  }

  /* 🏅 BADGES MOBILE */
  .rank-badge {
    font-size: 11px !important;
    padding: 4px 8px !important;
  }

  .element-badge, .character-badge {
    font-size: 9px !important;
    padding: 2px 4px !important;
  }

  /* 🎭 IMAGES MOBILE */
  .character-image {
    width: 32px;
    height: 32px;
  }
  
  .character-image-large {
    width: 48px;
    height: 48px;
  }

  /* 💡 TOOLTIPS MOBILE - MÊME STYLE CENTRÉ */
  .cp-tooltip-hall {
    width: 300px !important;
    max-width: calc(100vw - 30px) !important;
    font-size: 13px !important;
  }

  /* 📱 HEADER MOBILE */
  .mobile-header {
    flex-shrink: 0 !important;
    min-height: 60px !important;
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

  /* 🔍 FILTRES MOBILE */
  .mobile-filters {
    padding: 12px !important;
    flex-direction: column !important;
    gap: 8px !important;
    flex-shrink: 0 !important;
  }

  .mobile-filters input, .mobile-filters select {
    width: 100% !important;
    padding: 10px 12px !important;
    font-size: 16px !important;
    border-radius: 8px !important;
  }

  /* 🆕 TOGGLE MOBILE v5.0 */
  .mobile-filters .checked-toggle {
    justify-content: center;
    width: 100%;
    padding: 8px 16px;
  }

  /* 📊 STATS MOBILE */
  .mobile-stats {
    grid-template-columns: 1fr 1fr !important;
    gap: 8px !important;
    margin-bottom: 16px !important;
    padding: 0 4px !important;
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

  /* 📄 GRID MOBILE */
  .grid.gap-4.mb-6 {
    gap: 16px !important;
    margin-bottom: 24px !important;
    padding: 0 4px !important;
  }

  /* 📄 PAGINATION MOBILE */
  .mobile-pagination {
    margin-top: 20px !important;
    margin-bottom: 20px !important;
    padding: 0 16px !important;
    flex-wrap: wrap !important;
    gap: 4px !important;
    justify-content: center !important;
  }

  .mobile-pagination button {
    padding: 6px 12px !important;
    font-size: 12px !important;
    min-width: 80px !important;
  }

  /* 🎨 MODAL MOBILE */
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

  /* 🏷️ TABS MOBILE */
  .border-b.border-gray-700\/50 {
    flex-shrink: 0 !important;
  }
}

/* 📱 TABLET ADJUSTMENTS */
@media (min-width: 768px) and (max-width: 1024px) {
  .hunter-card {
  background: linear-gradient(145deg, rgba(36, 0, 70, 0.85), rgba(0, 0, 20, 0.95));
  border: 1px solid #a855f7;
  border-radius: 20px;
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.25);

    padding: 16px !important;
    overflow: visible !important;
  }
  
  .artifact-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

/* 🌐 HTML/BODY BASE */
html, body, #root {
  height: 100%;
}

@media (max-width: 768px) {
  html, body {
    overflow: hidden !important;
    position: fixed !important;
    width: 100% !important;
    height: 100vh !important;
    height: 100dvh !important;
  }
  
  #root {
    height: 100vh !important;
    height: 100dvh !important;
    overflow: hidden !important;
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
                  {filteredAndSortedHunters.length} Hunter{filteredAndSortedHunters.length > 1 ? 's' : ''}
                  {showOnlyChecked && !showPending && <span className="text-green-400"> vérifiés</span>}
                  {!showOnlyChecked && !showPending && <span className="text-orange-400"> en attente</span>}
                  {showPending && <span className="text-yellow-400"> (tous)</span>}
                  {selectedCharacterFilter && (
                    <span className="text-cyan-400 ml-2">• {data_chars[selectedCharacterFilter]?.name || characters[selectedCharacterFilter]?.name || selectedCharacterFilter}</span>
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
          <div className="max-w-6xl mx-auto">
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

        {/* 🔍 FILTRES ET RECHERCHE - v5.0 AVEC TOGGLE CHECKED */}
        <div className={`relative z-10 border-b border-gray-700/50 ${isMobileDevice ? 'mobile-filters p-3' : 'p-4 md:p-6'}`}>
          <div className="max-w-6xl mx-auto space-y-1 md:space-y-1">
            
            {/* 🆕 TOGGLE VÉRIFIÉS/NON-VÉRIFIÉS v5.0 */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex gap-4">
                <div className="checked-toggle">
                  <input
                    type="checkbox"
                    id="showOnlyChecked"
                    checked={showOnlyChecked}
                    onChange={(e) => {
                      setShowOnlyChecked(e.target.checked);
                      if (e.target.checked) {
                        setShowPending(false);
                      }
                      setCurrentPage(1);
                    }}
                  />
                  <label htmlFor="showOnlyChecked">
                    ✅ Hunters vérifiés uniquement
                  </label>
                </div>
                
                <div className="checked-toggle">
                  <input
                    type="checkbox"
                    id="showPending"
                    checked={showPending}
                    onChange={(e) => {
                      setShowPending(e.target.checked);
                      if (e.target.checked) {
                        setShowOnlyChecked(false);
                      }
                      setCurrentPage(1);
                    }}
                  />
                  <label htmlFor="showPending">
                    🌟 Voir tous (vérifiés + en attente)
                  </label>
                </div>
              </div>
            </div>
            
            {/* Barre de recherche */}
            <div className="w-full md:w-1/2 px-2">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="🔍 Rechercher un hunter ou personnage..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full px-2 py-1 text-sm md:text-base bg-black/30 border border-yellow-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 ${
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

              {/* FILTRE CHARACTER */}
              {uniqueCharacters.length > 0 && (
                <select
                  value={selectedCharacterFilter}
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
              {(searchTerm || selectedGuild || selectedElement || selectedCharacterFilter) && (
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
        <div className="flex-1 overflow-y-auto mobile-scroll h-[calc(100dvh-220px)]">
          <div className={`max-w-7xl mx-auto ${isMobileDevice ? 'p-2' : 'p-2 md:p-4'}`}>

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
                  {showOnlyChecked ? 'Aucun Hunter vérifié' : 'Aucun Hunter en attente'}
                </h3>
                <p className={`text-gray-400 mb-4 ${isMobileDevice ? 'text-sm' : ''}`}>
                  {showOnlyChecked ? 'Soyez le premier à être validé !' : 'Tous les hunters ont été vérifiés !'}
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
                        {filteredAndSortedHunters.length}
                      </p>
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 border border-red-500/20">
                    <div className="text-center">
                      <p className={`text-gray-400 ${isMobileDevice ? 'text-xs' : 'text-sm'}`}>
                        CP Moyen
                      </p>
                      <p className={`font-bold text-red-400 ${isMobileDevice ? 'text-lg' : 'text-2xl'}`}>
                        {filteredAndSortedHunters.length > 0 ? Math.floor(filteredAndSortedHunters.reduce((sum, h) => sum + (selectedRanking === 'artifactsScore' ? (h.artifactsScore || 0) : h.totalScore), 0) / filteredAndSortedHunters.length).toLocaleString() : 0}
                      </p>
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 border border-blue-500/20">
                    <div className="text-center">
                      <p className={`text-gray-400 ${isMobileDevice ? 'text-xs' : 'text-sm'}`}>
                        {selectedCharacterFilter ? 'Character' : 'Guildes'}
                      </p>
                      <p className={`font-bold text-blue-400 ${isMobileDevice ? 'text-lg' : 'text-2xl'}`}>
                        {selectedCharacterFilter ? uniqueCharacters.find(c => c.id === selectedCharacterFilter)?.name || selectedCharacterFilter : uniqueGuilds.length}
                      </p>
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 border border-green-500/20">
                    <div className="text-center">
                      <p className={`text-gray-400 ${isMobileDevice ? 'text-xs' : 'text-sm'}`}>
                        CP Max
                      </p>
                      <p className={`font-bold text-green-400 ${isMobileDevice ? 'text-lg' : 'text-2xl'}`}>
                        {filteredAndSortedHunters.length > 0 ? Math.max(...filteredAndSortedHunters.map(h => selectedRanking === 'artifactsScore' ? (h.artifactsScore || 0) : h.totalScore)).toLocaleString() : 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grille des hunters */}
                <div className={`grid gap-2 mb-3 ${isMobileDevice ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                  {paginatedHunters.map((hunter, index) => {
                    const globalRank = (currentPage - 1) * huntersPerPage + index;
                    const rankBadge = getRankBadge(globalRank);
                    const character = data_chars[hunter.character] || characters[hunter.character] || {};
                    const elementColor = getElementColor(character?.element);
                    const currentScore = selectedRanking === 'artifactsScore' ? (hunter.artifactsScore || 0) : hunter.totalScore;
                    const displayName = hunter.pseudo || hunter.hunterName || 'Hunter';
                    const characterImage = getCharacterImage(hunter.character);
                    const isChecked = hunter.checked === true; // 🆕 v5.0
                    
                    return (
                      <div
                        key={hunter.id}
                        className={`hunter-card rounded-xl group cursor-pointer mobile-touch ${globalRank === 0 && isChecked ? 'emperor' : ''} ${!isChecked ? 'unchecked' : ''} ${isMobileDevice ? 'p-3' : 'p-6'}`}
                        onClick={() => handleViewDetails(hunter)}
                      >
                        {/* Header avec rang et image character */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`rank-badge rounded-full font-bold flex items-center gap-2 ${isMobileDevice ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'}`}
                              style={{ 
                                '--rank-color': isChecked ? rankBadge.color : '#ff8c00',
                                '--rank-color-light': isChecked ? rankBadge.color + '40' : '#ff8c0040'
                              }}
                            >
                              <span>{isChecked ? rankBadge.emoji : '⏳'}</span>
                              <span>{isChecked ? rankBadge.text : 'En attente'}</span>
                            </div>

                            {/* IMAGE CHARACTER */}
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
                            {/* 🆕 BADGE NON VÉRIFIÉ v5.0 */}
                            {!isChecked && (
                              <div className="unchecked-badge">
                                ⏳ NON VÉRIFIÉ
                              </div>
                            )}
                            
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
                              onMouseEnter={() => {
                                if (!isMobileDevice) {
                                  console.log('🔍 Hover hunter:', hunter.id, 'CP Details:', hunter.cpDetailsTotal);
                                  setShowCpTooltipTotal(hunter.id);
                                }
                              }}
                              onMouseLeave={() => setShowCpTooltipTotal(null)}
                              onClick={(e) => {
                                if (isMobileDevice) {
                                  e.stopPropagation();
                                  console.log('📱 Click hunter:', hunter.id, 'CP Details:', hunter.cpDetailsTotal);
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
                                  ? hunter.cpDetailsArtifacts?.details?.length > 0 && (
                                      <CpTooltip 
                                        details={hunter.cpDetailsArtifacts.details} 
                                        title="🎨 CP Artefacts"
                                        color="#a855f7"
                                      />
                                    )
                                  : hunter.cpDetailsTotal?.details?.length > 0 && (
                                      <CpTooltip 
                                        details={hunter.cpDetailsTotal.details} 
                                        title="🏆 CP Total"
                                        color="#ffd700"
                                      />
                                    )
                              )}
                              
                              {/* FALLBACK SI PAS DE DONNÉES CP DÉTAILLÉES */}
                              {showCpTooltipTotal === hunter.id && !hunter.cpDetailsTotal?.details?.length && !hunter.cpDetailsArtifacts?.details?.length && (
                                <div className="cp-tooltip-hall">
                                  <p className="font-bold mb-2 text-yellow-400">🚨 Données CP manquantes</p>
                                  <p className="text-gray-300 text-xs">
                                    Ce hunter n'a pas de détails CP calculés.
                                    <br />Utilisez le nouveau système Kaisel pour des données complètes.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Score secondaire AVEC TOOLTIPS */}
                          {selectedRanking === 'totalScore' && hunter.artifactsScore && (
                            <div className={`flex justify-between mb-2 ${isMobileDevice ? 'text-xs' : 'text-xs'}`}>
                              <span className="text-gray-500">CP Artefacts</span>
                              <div 
                                className="cp-score-hover relative"
                                onMouseEnter={() => {
                                  if (!isMobileDevice) {
                                    console.log('🔍 Hover artifacts:', hunter.id, 'Details:', hunter.cpDetailsArtifacts);
                                    setShowCpTooltipArtifacts(hunter.id);
                                  }
                                }}
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
                                {showCpTooltipArtifacts === hunter.id && hunter.cpDetailsArtifacts?.details?.length > 0 && (
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
                              <div className="cp-score-hover relative"
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
                               {showCpTooltipTotal === `${hunter.id}-secondary` && hunter.cpDetailsTotal?.details?.length > 0 && (
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
                   {/* IMAGE CHARACTER DANS LE HEADER */}
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
                     {/* 🆕 BADGE VÉRIFIÉ/NON VÉRIFIÉ v5.0 */}
                     {selectedHunter.checked ? (
                       <span className="text-green-400 text-sm">✅ Hunter vérifié</span>
                     ) : (
                       <span className="text-orange-400 text-sm">⏳ En attente de vérification</span>
                     )}
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
             <div className={`grid gap-4 mb-2 ${isMobileDevice ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3 gap-6 mb-8'}`}>
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
                   {showCpTooltipTotal === 'modal-total' && selectedHunter.cpDetailsTotal?.details?.length > 0 && (
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
                   {showCpTooltipArtifacts === 'modal-artifacts' && selectedHunter.cpDetailsArtifacts?.details?.length > 0 && (
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
             <div className={`grid gap-4 mb-2 ${isMobileDevice ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 gap-6 mb-8'}`}>
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
               <div className={`bg-black/30 rounded-lg p-4 border border-blue-500/20 mb-2 ${isMobileDevice ? 'mb-4' : 'mb-8'}`}>
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
               <div className={`bg-black/30 rounded-lg p-4 border border-yellow-500/20 mb-2 ${isMobileDevice ? 'mb-4' : 'mb-8'}`}>
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

             {/* 🚫 PAS D'AFFICHAGE DES NOTES v5.0 - SÉCURITÉ */}
             {/* Notes supprimées pour éviter les problèmes de sécurité */}
           </div>
         </div>
       </div>
     )}
   </>
 );
};

export default HallOfFlamePage;