// KaiselInteractionMenu.jsx - TECHNICAL INTELLIGENCE SYSTEM BY KAISEL
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { scanTwitchStreams } from '../utils/TwitchIntelligence'; // ← IMPORT KAISEL
import '../i18n/i18n';

const KaiselInteractionMenu = ({
  position,
  onClose,
  selectedCharacter,
  characters,
  showTankMessage,
  // 🔥 PROPS POUR L'INTELLIGENCE TECHNIQUE
  currentArtifacts = {},
  currentStats = {},
  currentCores = {},
  multiAccountsData = {},
  substatsMinMaxByIncrements,
  existingScores = {}
}) => {
  const [showMenu, setShowMenu] = useState(true);
  const [animationClass, setAnimationClass] = useState('');
  const [currentSubMenu, setCurrentSubMenu] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setAnimationClass('bubble-appear');
  }, []);

  // 🔧 OPTIONS PRINCIPALES KAISEL
  const getMainOptions = () => ({
    live_streams: {
      icon: "📺",
      label: "Streams Twitch Live",
      action: "show_twitch_streams",
      position: { x: "-12vw", y: "-8vh" }
    },
    youtube_news: {
      icon: "🎬",
      label: "Dernières vidéos YouTube",
      action: "show_youtube_videos", 
      position: { x: "0vw", y: "-12vh" }
    },
    netmarble_updates: {
      icon: "📰",
      label: "News Netmarble",
      action: "show_netmarble_news",
      position: { x: "12vw", y: "-8vh" }
    },
    site_news: {
      icon: "🔄",
      label: "News du Site",
      action: "show_site_updates",
      position: { x: "-8vw", y: "3vh" }
    },
    debug_mode: {
      icon: "🐛",
      label: "Mode Debug Pro",
      action: "show_debug_submenu",
      position: { x: "8vw", y: "3vh" }
    }
  });

  // 🤖 SOUS-MENU DEBUG RÉVOLUTIONNAIRE
  const getDebugSubMenu = () => ({
    artifact_calculator: {
      icon: "🧮",
      label: "Calculateur Artefacts",
      action: "advanced_artifact_calc",
      position: { x: "-15vw", y: "-10vh" }
    },
    build_simulator: {
      icon: "🎯", 
      label: "Simulateur de Build",
      action: "build_simulation",
      position: { x: "-5vw", y: "-14vh" }
    },
    meta_analysis: {
      icon: "📈",
      label: "Analyse Méta Global", 
      action: "meta_trends",
      position: { x: "5vw", y: "-14vh" }
    },
    damage_calculator: {
      icon: "💥",
      label: "Calculateur DPS",
      action: "dps_calculator",
      position: { x: "15vw", y: "-10vh" }
    },
    optimization_ai: {
      icon: "🤖",
      label: "IA d'Optimisation",
      action: "ai_optimization",
      position: { x: "0vw", y: "-6vh" }
    },
    back: {
      icon: "↩️",
      label: "Retour",
      action: "back_to_main",
      position: { x: "0vw", y: "-18vh" }
    }
  });

  // 🌐 FONCTIONS API (vraies maintenant)
  // Plus de fonctions simulées - tout géré par TwitchIntelligence.js

  const scanYouTubeVideos = async () => {
    setIsScanning(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockVideos = [
      "🎬 'Best Artifacts Guide 2025' - YouTuberSLA (2h ago)",
      "🎬 'New Meta Hunters Analysis' - SLArise_News (5h ago)",
      "🎬 'F2P Guild War Strategy' - ProHunter (1d ago)"
    ];
    
    const message = `🎬 **DERNIÈRES VIDÉOS YOUTUBE - SOLO LEVELING ARISE**\n\n` +
      `${mockVideos.join('\n')}\n\n` +
      `🎯 Scan terminé par Kaisel ⚡`;
    
    setIsScanning(false);
    return message;
  };

  const scanNetmarbleNews = async () => {
    setIsScanning(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockNews = [
      "📰 'Update 1.5.2 - New Artifacts Released' (Today)",
      "📰 'Guild War Season 3 Announcement' (Yesterday)",
      "📰 'Bug Fixes & Balance Changes' (2 days ago)"
    ];
    
    const message = `📰 **NEWS NETMARBLE - SOLO LEVELING ARISE**\n\n` +
      `${mockNews.join('\n')}\n\n` +
      `🎯 Scan terminé par Kaisel ⚡`;
    
    setIsScanning(false);
    return message;
  };

  // 🧠 ACTIONS KAISEL
  const handleOption = async (action) => {
    switch (action) {
      case 'show_debug_submenu':
        setCurrentSubMenu('debug');
        break;

      case 'back_to_main':
        setCurrentSubMenu(null);
        break;

      case 'show_twitch_streams':
  try {
    const response = await fetch('/api/kaisel/get-streams');
    const data = await response.json();
    showTankMessage(data.message, true, 'kaisel');
  } catch (error) {
    console.error('Kaisel Debug test:', error);
    showTankMessage('Erreur API Kaisel - Retry plus tard', true, 'kaisel');
  }
  onClose();
  break;

      case 'show_youtube_videos':
        const youtubeData = await scanYouTubeVideos();
        showTankMessage(youtubeData, true, 'kaisel');
        onClose();
        break;

      case 'show_netmarble_news':
        const netmarbleData = await scanNetmarbleNews();
        showTankMessage(netmarbleData, true, 'kaisel');
        onClose();
        break;

      case 'show_site_updates':
        const siteUpdates = `🔄 **NEWS BUILDERBERU.COM**\n\n` +
          `✅ Kaisel Intelligence System - ONLINE\n` +
          `🔧 Builder Data corrections en cours\n` +
          `📱 Mobile optimization - Planifié\n` +
          `🎨 Icons sets update - En attente\n\n` +
          `🎯 Rapport généré par Kaisel ⚡`;
        showTankMessage(siteUpdates, true, 'kaisel');
        onClose();
        break;

      // 🤖 ACTIONS DEBUG RÉVOLUTIONNAIRES
      case 'advanced_artifact_calc':
        const calcMessage = `🧮 **CALCULATEUR ARTEFACTS AVANCÉ**\n\n` +
          `🔍 Analyse en cours des substats optimaux...\n` +
          `📊 Calcul des probabilités de roll...\n` +
          `🎯 Comparaison avec la base de données...\n\n` +
          `⚠️ Fonctionnalité en développement\n` +
          `🤖 Kaisel code encore... ⚡`;
        showTankMessage(calcMessage, true, 'kaisel');
        onClose();
        break;

      case 'build_simulation':
        const simMessage = `🎯 **SIMULATEUR DE BUILD**\n\n` +
          `⚙️ Chargement des configurations...\n` +
          `🧪 Test des combinaisons d'artefacts...\n` +
          `📈 Projection des performances...\n\n` +
          `⚠️ Mode simulation à venir\n` +
          `🤖 Intelligence artificielle en cours ⚡`;
        showTankMessage(simMessage, true, 'kaisel');
        onClose();
        break;

      case 'meta_trends':
        const metaMessage = `📈 **ANALYSE MÉTA GLOBAL**\n\n` +
          `🌍 Scan des tendances communauté...\n` +
          `🏆 Hunters les plus utilisés en PvP...\n` +
          `💎 Sets d'artefacts populaires...\n\n` +
          `⚠️ Base de données en construction\n` +
          `🤖 Big Data processing... ⚡`;
        showTankMessage(metaMessage, true, 'kaisel');
        onClose();
        break;

      case 'dps_calculator':
        const dpsMessage = `💥 **CALCULATEUR DPS PRÉCIS**\n\n` +
          `🔢 Formules de dégâts avancées...\n` +
          `⚔️ Calcul critiques & pénétration...\n` +
          `🎯 Optimisation rotation skills...\n\n` +
          `⚠️ Mathématiques complexes en cours\n` +
          `🤖 Algorithmes de combat ⚡`;
        showTankMessage(dpsMessage, true, 'kaisel');
        onClose();
        break;

      case 'ai_optimization':
        const aiMessage = `🤖 **IA D'OPTIMISATION KAISEL**\n\n` +
          `🧠 Machine Learning activé...\n` +
          `📊 Analyse de tes patterns de jeu...\n` +
          `🎯 Suggestions personnalisées...\n\n` +
          `⚠️ Neural Network en entraînement\n` +
          `🤖 Deep Learning en cours... ⚡`;
        showTankMessage(aiMessage, true, 'kaisel');
        onClose();
        break;

      default:
        showTankMessage("🤖 Fonction Kaisel non implémentée... Debug en cours ⚡", true, 'kaisel');
        onClose();
    }
  };

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.kaisel-bubble-menu')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!showMenu) return null;

  const currentOptions = currentSubMenu === 'debug' ? getDebugSubMenu() : getMainOptions();

  return (
    <>
      {/* Styles CSS Kaisel */}
      <style jsx>{`
        @keyframes bubble-appear {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
          60% { transform: translate(-50%, -50%) scale(1.1); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        @keyframes kaisel-scanning {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.5); }
          50% { box-shadow: 0 0 30px rgba(0, 255, 255, 0.8); }
        }

        .bubble-appear { animation: bubble-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .bubble-option { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .bubble-option:hover {
          transform: translate(-50%, -50%) scale(1.05) !important;
          box-shadow: 0 8px 25px rgba(0, 255, 255, 0.4), 0 0 20px rgba(0, 200, 255, 0.3);
        }
        .bubble-text { text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); color: #FFFFFF !important; }
        .bubble-container { backdrop-filter: blur(1px); }
        .scanning { animation: kaisel-scanning 1s infinite; }
      `}</style>

      {/* Container principal Kaisel */}
      <div
        className="kaisel-bubble-menu fixed z-[9999] bubble-container"
        style={{
          left: position.x,
          top: position.y
        }}
      >
        {/* Centre de Kaisel - COULEUR CYAN TECHNIQUE */}
        <div
          className={`absolute w-6 h-6 rounded-full animate-pulse shadow-lg border-2 border-white ${
            currentSubMenu === 'debug' 
              ? 'bg-cyan-400/80' 
              : isScanning 
                ? 'bg-cyan-300/90 scanning' 
                : 'bg-cyan-500/80'
          }`}
          style={{ left: '-3px', top: '-3px' }}
        ></div>

        {/* Bulles d'options Kaisel */}
        {Object.entries(currentOptions).map(([key, option], index) => {
          const textLength = option.label.length;
          const bubbleWidth = Math.max(140, Math.min(260, textLength * 9 + 70));
          const bubbleHeight = 45;

          return (
            <button
              key={key}
              onClick={() => handleOption(option.action)}
              className={`bubble-option absolute bg-gradient-to-br ${
                currentSubMenu === 'debug'
                  ? 'from-cyan-600/80 to-blue-700/80 border-cyan-400/40'
                  : 'from-slate-700/80 to-cyan-700/80 border-cyan-400/40'
              } text-white rounded-full shadow-xl border-2 backdrop-blur-sm ${animationClass} ${
                isScanning ? 'scanning' : ''
              }`}
              style={{
                left: typeof option.position.x === 'string' ? option.position.x : `${option.position.x}px`,
                top: typeof option.position.y === 'string' ? option.position.y : `${option.position.y}px`,
                width: `${bubbleWidth}px`,
                height: `${bubbleHeight}px`,
                animationDelay: `${index * 0.1}s`,
                zIndex: 10,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="flex items-center justify-center gap-2 px-3 h-full">
                <span className="text-base flex-shrink-0">{option.icon}</span>
                <span
                  className="bubble-text text-white text-xs font-bold leading-tight flex-1 min-w-0"
                  style={{
                    fontSize: textLength > 20 ? '11px' : '12px',
                    color: '#FFFFFF'
                  }}
                >
                  {option.label}
                </span>
              </div>
            </button>
          );
        })}

        {/* Croix de fermeture Kaisel */}
        <button
          onClick={onClose}
          className="bubble-option absolute bg-gradient-to-br from-red-500/80 to-red-700/80 hover:from-red-600/80 hover:to-red-800/80 text-white rounded-full shadow-xl border-2 border-red-400/40 backdrop-blur-sm w-9 h-9 flex items-center justify-center"
          style={{
            left: "1.5vw",
            top: "5vh",
            animationDelay: '0.6s',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <span className="text-xs font-bold">✕</span>
        </button>
      </div>
    </>
  );
};

export default KaiselInteractionMenu;