// KaiselInteractionMenu.jsx - TECHNICAL INTELLIGENCE SYSTEM BY KAISEL
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { scanTwitchStreams } from '../utils/TwitchIntelligence';
import '../i18n/i18n';

const KaiselInteractionMenu = ({
  position,
  onClose,
  selectedCharacter,
  characters,
  showTankMessage,
  currentArtifacts = {},
  currentStats = {},
  currentCores = {},
  multiAccountsData = {},
  substatsMinMaxByIncrements,
  existingScores = {},
  onShowHallOfFlame, // ← NOUVEAU CALLBACK
  showDebugButton = false // ← NOUVEAU PARAMÈTRE
}) => {
  const [showMenu, setShowMenu] = useState(true);
  const [animationClass, setAnimationClass] = useState('');
  const [currentSubMenu, setCurrentSubMenu] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const { t } = useTranslation();

  // 🔍 DÉTECTION MOBILE
  const isMobileDevice = window.innerWidth < 768;

  useEffect(() => {
    setAnimationClass('bubble-appear');
  }, []);

  // 🔧 OPTIONS PRINCIPALES KAISEL
  const getMainOptions = () => ({
    live_streams: {
      icon: "📺",
      label: "Streams Twitch Live",
      action: "show_twitch_streams"
    },
    youtube_news: {
      icon: "🎬",
      label: "Dernières vidéos YouTube",
      action: "show_youtube_videos"
    },
    netmarble_updates: {
      icon: "📰",
      label: "News Netmarble",
      action: "show_netmarble_news"
    },
    site_news: {
      icon: "🔄",
      label: "News du Site",
      action: "show_site_updates"
    },
    debug_mode: {
      icon: "🐛",
      label: "Mode Debug Pro",
      action: "show_debug_submenu"
    }
  });

  // 🤖 SOUS-MENU DEBUG - VERSION CORRIGÉE
  const getDebugSubMenu = () => {
    const baseMenu = {
      artifact_calculator: {
        icon: "🧮",
        label: "Calculateur Artefacts",
        action: "advanced_artifact_calc"
      },
      build_simulator: {
        icon: "🎯", 
        label: "Simulateur de Build",
        action: "build_simulation"
      },
      meta_analysis: {
        icon: "📈",
        label: "Analyse Méta Global", 
        action: "meta_trends"
      },
      damage_calculator: {
        icon: "💥",
        label: "Calculateur DPS",
        action: "dps_calculator"
      },
      optimization_ai: {
        icon: "🤖",
        label: "IA d'Optimisation",
        action: "ai_optimization"
      },
      toggle_hitbox_debug: {
        icon: "👁️",
        label: "Toggle Hitbox Debug",
        action: "toggle_hitbox_debug"
      }
    };

    // 🏆 AJOUTER L'OPTION HALLOFFLAME SI DEBUG BUTTON ACTIVÉ
   if (showDebugButton) {
  baseMenu.hall_of_flame_debug = {
    icon: "🏆",
    label: "HallOfFlame Debug",
    action: "show_hall_debug"
  };
  
  // 🆕 NOUVEAU BOUTON POUR VOIR LE CLASSEMENT
  baseMenu.hall_of_flame_rankings = {
    icon: "📊",
    label: "Voir Classements",
    action: "show_hall_rankings"
  };
}

    baseMenu.back = {
      icon: "↩️",
      label: "Retour",
      action: "back_to_main"
    };

    return baseMenu;
  };

  // 🧠 ACTIONS KAISEL - VERSION COMPLÈTE
  const handleOption = async (action) => {
    switch (action) {
      case 'show_debug_submenu':
        setCurrentSubMenu('debug');
        break;

      case 'back_to_main':
        setCurrentSubMenu(null);
        break;

        case 'show_hall_rankings':
  // Tu peux passer cette fonction en prop depuis BuilderBeru
  if (onShowRankings) {
    onShowRankings();
    showTankMessage("📊 Kaisel ouvre les classements HallOfFlame !", true, 'kaisel');
  }
  onClose();
  break;

      // 🏆 NOUVEAU CASE HALLOFFLAME
      case 'show_hall_debug':
        if (onShowHallOfFlame) {
    onShowHallOfFlame();
    showTankMessage("🏆 Kaisel lance le système HallOfFlame ! Interface de niveau légendaire activée ⚡", true, 'kaisel');
  } else {
    showTankMessage("🤖 HallOfFlame callback non trouvé... Debug en cours...", true, 'kaisel');
  }
  onClose();
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

      case 'toggle_hitbox_debug':
        if (window.toggleDebug) {
          window.toggleDebug();
          showTankMessage("🐛 Kaisel a activé le debug mode ! Regarde en haut à droite...", true, 'kaisel');
        } else {
          showTankMessage("🤖 Debug system non trouvé... Kaisel enquête...", true, 'kaisel');
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

      case 'meta_analysis':
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

  // 🌐 FONCTIONS API YOUTUBE ET NETMARBLE
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

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.kaisel-interaction-menu')) {
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
      {/* 🎨 STYLES CSS KAISEL */}
      <style jsx="true">{`
        @keyframes kaisel-appear {
          0% { opacity: 0; transform: translateY(20px) scale(0.8); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes kaisel-scanning {
          0%, 100% { box-shadow: 0 0 15px rgba(0, 255, 65, 0.4); }
          50% { box-shadow: 0 0 25px rgba(0, 255, 65, 0.8); }
        }

        .kaisel-bubble {
          backdrop-filter: blur(8px);
          border: 1px solid rgba(0, 255, 65, 0.3);
          background: linear-gradient(135deg, 
            rgba(0, 40, 80, 0.85) 0%, 
            rgba(0, 60, 100, 0.9) 50%, 
            rgba(0, 255, 65, 0.1) 100%);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(0, 255, 65, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: kaisel-appear 0.4s ease-out;
        }

        .kaisel-bubble:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 
            0 12px 40px rgba(0, 0, 0, 0.5),
            0 0 20px rgba(0, 255, 65, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          border-color: rgba(0, 255, 65, 0.5);
        }

        .kaisel-scanning {
          animation: kaisel-scanning 1.5s infinite;
        }

        .kaisel-icon {
          background: linear-gradient(45deg, #00ff41, #00ccff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 8px rgba(0, 255, 65, 0.3));
        }

        .kaisel-text {
          color: #ffffff;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
          font-family: 'Courier New', monospace;
        }

        .kaisel-close {
          background: linear-gradient(135deg, rgba(255, 0, 0, 0.8), rgba(200, 0, 0, 0.9));
          border: 1px solid rgba(255, 100, 100, 0.4);
        }

        .kaisel-close:hover {
          background: linear-gradient(135deg, rgba(255, 50, 50, 0.9), rgba(220, 20, 20, 1));
          box-shadow: 0 0 15px rgba(255, 0, 0, 0.4);
        }

        /* 📱 MOBILE SPECIFIC */
        .kaisel-mobile-container {
          backdrop-filter: blur(4px);
          background: rgba(0, 0, 0, 0.3);
          border-radius: 16px;
          padding: 8px;
        }
      `}</style>

      {isMobileDevice ? (
        // 📱 VERSION MOBILE - COLONNE VERTICALE
        <div
          className="kaisel-interaction-menu fixed z-[9999] kaisel-mobile-container"
          style={{
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90vw',
            maxWidth: '320px',
            maxHeight: '70vh',
            overflowY: 'auto'
          }}
        >
          {/* 🎯 HEADER KAISEL MOBILE */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
            padding: '8px 12px',
            background: 'linear-gradient(90deg, rgba(0, 255, 65, 0.1), rgba(0, 150, 255, 0.1))',
            borderRadius: '8px',
            border: '1px solid rgba(0, 255, 65, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img 
                src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750768929/Kaisel_face_dm9394.png"
                alt="Kaisel"
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: '2px solid #00ff41'
                }}
              />
              <span style={{
                color: '#00ff41',
                fontSize: '14px',
                fontWeight: 'bold',
                fontFamily: 'monospace'
              }}>
                Kaisel {currentSubMenu === 'debug' ? 'Debug' : 'Tech'}
              </span>
            </div>
            
            <button
              onClick={onClose}
              className="kaisel-close"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                color: 'white'
              }}
            >
              ✕
            </button>
          </div>

          {/* 🔥 OPTIONS EN COLONNE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(currentOptions).map(([key, option], index) => (
              <button
                key={key}
                onClick={() => handleOption(option.action)}
                className={`kaisel-bubble ${isScanning ? 'kaisel-scanning' : ''}`}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <span className="kaisel-icon" style={{ fontSize: '18px', flexShrink: 0 }}>
                  {option.icon}
                </span>
                <span className="kaisel-text" style={{
                  fontSize: '13px',
                  fontWeight: 'bold',
                  textAlign: 'left',
                  flex: 1
                }}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        // 🖥️ VERSION DESKTOP - GARDE TON STYLE EXISTANT MAIS AVEC NOUVEAUX STYLES
        <div
          className="kaisel-interaction-menu fixed z-[9999]"
          style={{
            left: position.x,
            top: position.y
          }}
        >
          {/* Centre de Kaisel */}
          <div
            className={`absolute w-6 h-6 rounded-full border-2 border-white ${currentSubMenu === 'debug' ? 'bg-cyan-400/80' : isScanning ? 'bg-cyan-300/90 kaisel-scanning' : 'bg-cyan-500/80'}`}
            style={{ 
              left: '-3px', 
              top: '-3px',
              boxShadow: '0 0 15px rgba(0, 255, 65, 0.5)'
            }}
          ></div>

          {/* Bulles d'options en cercle */}
          {Object.entries(currentOptions).map(([key, option], index) => {
            const textLength = option.label.length;
            const bubbleWidth = Math.max(140, Math.min(260, textLength * 9 + 70));
            const bubbleHeight = 45;

            // 🏆 POSITIONS MISES À JOUR AVEC HALLOFFLAME
            const positions = {
              live_streams: { x: "0.7vw", y: "-11.5vh" },
              youtube_news: { x: "-10vw", y: "-3vh" },
              netmarble_updates: { x: "12vw", y: "-3vh" },
              site_news: { x: "-10vw", y: "3vh" },
              debug_mode: { x: "12vw", y: "3vh" },
              // Debug submenu positions
              artifact_calculator: { x: "-15vw", y: "-10vh" },
              build_simulator: { x: "-5vw", y: "-14vh" },
              meta_analysis: { x: "5vw", y: "-14vh" },
              damage_calculator: { x: "15vw", y: "-10vh" },
              optimization_ai: { x: "0vw", y: "-6vh" },
              toggle_hitbox_debug: { x: "-10vw", y: "-2vh" },
              hall_of_flame_debug: { x: "10vw", y: "-2vh" }, // ← NOUVELLE POSITION
              back: { x: "0vw", y: "-18vh" }
            };

            const pos = positions[key] || { x: "0vw", y: "0vh" };

            return (
              <button
                key={key}
                onClick={() => handleOption(option.action)}
                className={`kaisel-bubble ${isScanning ? 'kaisel-scanning' : ''}`}
                style={{
                  position: 'absolute',
                  left: pos.x,
                  top: pos.y,
                  width: `${bubbleWidth}px`,
                  height: `${bubbleHeight}px`,
                  borderRadius: '25px',
                  cursor: 'pointer',
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="flex items-center justify-center gap-2 px-3 h-full">
                  <span className="kaisel-icon text-base flex-shrink-0">{option.icon}</span>
                  <span
                    className="kaisel-text text-xs font-bold leading-tight flex-1 min-w-0"
                    style={{
                      fontSize: textLength > 20 ? '11px' : '12px'
                    }}
                  >
                    {option.label}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Croix de fermeture */}
          <button
            onClick={onClose}
            className="kaisel-close absolute w-9 h-9 flex items-center justify-center rounded-full"
            style={{
              left: "1.5vw",
              top: "5vh",
              transform: 'translate(-50%, -50%)',
              animationDelay: '0.6s'
            }}
          >
            <span className="text-xs font-bold">✕</span>
          </button>
        </div>
      )}
    </>
  );
};

export default KaiselInteractionMenu;