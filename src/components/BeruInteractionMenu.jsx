// BeruInteractionMenu.jsx - AI INTELLIGENCE SYSTEM BY KAISEL
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BUILDER_DATA } from '../data/builder_data';
import { performIntelligentAnalysis } from '../utils/BeruIntelligentAnalysis';
import { BeruReportSystem, GoldenPapyrusIcon } from '../components/BeruReportSystem';
import '../i18n/i18n';

const BeruInteractionMenu = ({
  position,
  onClose,
  selectedCharacter,
  characters,
  showTankMessage,
  currentArtifacts = {},
  currentStats = {},
  currentCores = {},
  currentGems = {},
  multiAccountsData = {},
  onReportGenerated,
  substatsMinMaxByIncrements,
  existingScores = {}
}) => {
  const [showMenu, setShowMenu] = useState(true);
  const [animationClass, setAnimationClass] = useState('');
  const [currentSubMenu, setCurrentSubMenu] = useState(null);
  const { t } = useTranslation();

  // 🔍 DÉTECTION MOBILE
  const isMobileDevice = window.innerWidth < 768;

  useEffect(() => {
    setAnimationClass('bubble-appear');
  }, []);

  // 🧠 ANALYSE DU BUILD ACTUEL (garde ta logique existante)
  const analyzeCurrentBuild = (characterKey) => {
    const hunterData = BUILDER_DATA[characterKey];
    if (!hunterData) return null;

    const analysis = {
      character: hunterData,
      issues: [],
      strengths: [],
      suggestions: [],
      score: 0,
      missingPieces: []
    };

    // ... garde toute ta logique d'analyse existante ...

    return analysis;
  };

  const findSimilarBuilds = (characterKey) => {
    // ... garde ta logique existante ...
    return [];
  };

  const calculateSimilarity = (build1, build2) => {
    // ... garde ta logique existante ...
    return 0;
  };

  // 🧠 OPTIONS PRINCIPALES BÉRU
  const getMainOptions = (selectedCharacter) => ({
    newbie: {
      icon: "👋",
      label: t('beru.menu.newbie'),
      action: "tutorial"
    },
    advice: {
      icon: "🎯",
      label: t('beru.menu.advice', { hunter: characters[selectedCharacter]?.name || t('beru.menu.thisHunter') }),
      action: "show_advice_submenu",
      condition: () => selectedCharacter
    },
    lore: {
      icon: "📖",
      label: t('beru.menu.lore'),
      action: "show_lore"
    },
    humor: {
      icon: "😈",
      label: t('beru.menu.humor'),
      action: "beru_joke"
    },
    tank_talk: {
      icon: "💬",
      label: t('beru.menu.tankTalk'),
      action: "tank_interaction"
    }
  });

  // 🔥 SUBMENU CONSEILS INTELLIGENTS
  const getAdviceSubMenu = () => ({
    general_analysis: {
      icon: "🔍",
      label: t('beru.submenu.generalAnalysis'),
      action: "general_analysis"
    },
    artifact_analysis: {
      icon: "💎",
      label: t('beru.submenu.artifactAnalysis'),
      action: "artifact_analysis"
    },
    stat_optimization: {
      icon: "📊",
      label: t('beru.submenu.statOptimization'),
      action: "stat_optimization"
    },
    compare_builds: {
      icon: "⚖️",
      label: t('beru.submenu.compareBuilds'),
      action: "compare_builds"
    },
    back: {
      icon: "↩️",
      label: t('beru.submenu.back'),
      action: "back_to_main"
    }
  });

  // 🧠 ACTIONS INTELLIGENTES (RESTAURE TOUTE LA LOGIQUE EXISTANTE)
  const handleOption = (action) => {
    switch (action) {
      
      case 'show_advice_submenu':
        setCurrentSubMenu('advice');
        break;

      case 'back_to_main':
        setCurrentSubMenu(null);
        break;

      case 'general_analysis':
        const analysis = analyzeCurrentBuild(selectedCharacter);
        if (analysis) {
          let message = `🔍 **ANALYSE DE ${analysis.character.name.toUpperCase()}**\n\n`;
          message += `📈 Score global: ${analysis.score}/100\n\n`;

          if (analysis.strengths.length > 0) {
            message += `💪 **Points forts:**\n${analysis.strengths.join('\n')}\n\n`;
          }

          if (analysis.issues.length > 0) {
            message += `⚠️ **À améliorer:**\n${analysis.issues.join('\n')}\n\n`;
          }

          if (analysis.suggestions.length > 0) {
            message += `🎯 **Suggestions:**\n${analysis.suggestions.join('\n')}`;
          }

          showTankMessage(message, true, 'beru');
        } else {
          showTankMessage("🤔 Je ne connais pas encore ce Hunter... Aide-moi à apprendre !", true, 'beru');
        }
        onClose();
        break;

      case 'artifact_analysis':
        const hunterData = BUILDER_DATA[selectedCharacter];
        if (hunterData) {
          let message = `💎 **ANALYSE ARTEFACTS - ${hunterData.name.toUpperCase()}**\n\n`;

          // Analyser les sets recommandés
          const recommendedSets = Object.values(hunterData.gameModes);
          message += `🎯 **Sets recommandés:**\n`;
          recommendedSets.forEach(mode => {
            message += `• ${mode.recommendedSet} (${mode.description})\n`;
          });

          message += `\n📋 **Main stats optimales:**\n`;
          const mainStats = hunterData.artifactSets[Object.keys(hunterData.artifactSets)[0]]?.mainStats;
          if (mainStats) {
            Object.entries(mainStats).forEach(([slot, stat]) => {
              message += `• ${slot}: ${stat}\n`;
            });
          }

          showTankMessage(message, true, 'beru');
        } else {
          showTankMessage("❌ Données manquantes pour ce Hunter", true, 'beru');
        }
        onClose();
        break;

      case 'stat_optimization':
        performIntelligentAnalysis(
          selectedCharacter,
          currentArtifacts,
          showTankMessage,
          onClose,
          onReportGenerated,
          substatsMinMaxByIncrements,
          existingScores
        );
        onClose();
        break;

      case 'compare_builds':
        const similarBuilds = findSimilarBuilds(selectedCharacter);
        let compareMessage = `⚖️ **COMPARAISON BUILDS - ${characters[selectedCharacter]?.name || 'Hunter'}**\n\n`;

        if (similarBuilds.length > 0) {
          compareMessage += `📊 **Builds trouvés dans tes comptes:**\n`;
          similarBuilds.slice(0, 3).forEach((build, index) => {
            compareMessage += `${index + 1}. ${build.accountName} (${Math.round(build.similarity)}% similaire)\n`;
          });
          compareMessage += `\n💡 Compare tes différentes approches !`;
        } else {
          compareMessage += `🔍 Aucun autre build trouvé dans tes comptes.\n`;
          compareMessage += `💡 Construis ce Hunter sur d'autres comptes pour comparer !`;
        }

        showTankMessage(compareMessage, true, 'beru');
        onClose();
        break;

      // 🔥 ACTIONS ORIGINALES RESTAURÉES
      case 'tutorial':
  // Lancer le tutoriel directement
  // Tu dois avoir une fonction qui lance IgrisTutorial
  // Par exemple :
  if (window.startIgrisTutorial) {
    window.startIgrisTutorial();
  }
  onClose();
  break;
      case 'show_lore':
        const loreMessages = t('beruLore', { returnObjects: true });
        const randomLore = loreMessages[Math.floor(Math.random() * loreMessages.length)];
        showTankMessage(randomLore, true, 'beru');
        onClose();
        break;

      case 'beru_joke':
        const jokes = t('beruJokes', { returnObjects: true });
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        showTankMessage(randomJoke, true, 'beru');
        onClose();
        break;

      case 'tank_interaction':
        showTankMessage("eh Tank tufékoa??!", true, 'beru');
        onClose();
        setTimeout(() => {
          const tankReplies = t('tankReplies', { returnObjects: true });
          const reply = tankReplies[Math.floor(Math.random() * tankReplies.length)];
          showTankMessage(reply, true, 'tank');
        }, 2000);
        break;

      default:
        showTankMessage("🧠 Analyse Béru en cours...", true, 'beru');
        onClose();
    }
  };

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.beru-interaction-menu')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!showMenu) return null;

  const currentOptions = currentSubMenu === 'advice' ? getAdviceSubMenu() : getMainOptions(selectedCharacter);

  return (
    <>
      {/* 🎨 STYLES CSS BÉRU */}
      <style jsx="true">{`
        @keyframes beru-appear {
          0% { opacity: 0; transform: translateY(20px) scale(0.8); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes beru-thinking {
          0%, 100% { box-shadow: 0 0 15px rgba(138, 43, 226, 0.4); }
          50% { box-shadow: 0 0 25px rgba(138, 43, 226, 0.8); }
        }

        .beru-bubble {
          backdrop-filter: blur(8px);
          border: 1px solid rgba(138, 43, 226, 0.3);
          background: linear-gradient(135deg, 
            rgba(80, 0, 120, 0.85) 0%, 
            rgba(120, 20, 180, 0.9) 50%, 
            rgba(138, 43, 226, 0.1) 100%);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(138, 43, 226, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: beru-appear 0.4s ease-out;
        }

        .beru-bubble:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 
            0 12px 40px rgba(0, 0, 0, 0.5),
            0 0 20px rgba(138, 43, 226, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          border-color: rgba(138, 43, 226, 0.6);
        }

        .beru-thinking {
          animation: beru-thinking 2s infinite;
        }

        .beru-icon {
          background: linear-gradient(45deg, #8a2be2, #da70d6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 8px rgba(138, 43, 226, 0.4));
        }

        .beru-text {
          color: #ffffff;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .beru-close {
          background: linear-gradient(135deg, rgba(255, 0, 0, 0.8), rgba(200, 0, 0, 0.9));
          border: 1px solid rgba(255, 100, 100, 0.4);
        }

        .beru-close:hover {
          background: linear-gradient(135deg, rgba(255, 50, 50, 0.9), rgba(220, 20, 20, 1));
          box-shadow: 0 0 15px rgba(255, 0, 0, 0.4);
        }

        /* 📱 MOBILE SPECIFIC */
        .beru-mobile-container {
          backdrop-filter: blur(4px);
          background: rgba(80, 0, 120, 0.2);
          border-radius: 16px;
          padding: 8px;
          border: 1px solid rgba(138, 43, 226, 0.3);
        }

        .beru-advice-mode {
          background: linear-gradient(135deg, 
            rgba(0, 120, 80, 0.85) 0%, 
            rgba(20, 150, 100, 0.9) 50%, 
            rgba(34, 197, 94, 0.1) 100%);
          border-color: rgba(34, 197, 94, 0.4);
        }

        .beru-advice-mode:hover {
          border-color: rgba(34, 197, 94, 0.6);
          box-shadow: 
            0 12px 40px rgba(0, 0, 0, 0.5),
            0 0 20px rgba(34, 197, 94, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {isMobileDevice ? (
        // 📱 VERSION MOBILE - COLONNE VERTICALE
        <div
          className="beru-interaction-menu fixed z-[9999] beru-mobile-container"
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
          {/* 🧠 HEADER BÉRU MOBILE */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
            padding: '8px 12px',
            background: currentSubMenu === 'advice' 
              ? 'linear-gradient(90deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.15))' 
              : 'linear-gradient(90deg, rgba(138, 43, 226, 0.15), rgba(168, 85, 247, 0.15))',
            borderRadius: '8px',
            border: `1px solid ${currentSubMenu === 'advice' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(138, 43, 226, 0.3)'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img 
                src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414699/beru_face_w2rdyn.png"
                alt="Béru"
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: `2px solid ${currentSubMenu === 'advice' ? '#22c55e' : '#8a2be2'}`
                }}
              />
              <span style={{
                color: currentSubMenu === 'advice' ? '#22c55e' : '#8a2be2',
                fontSize: '14px',
                fontWeight: 'bold',
                fontFamily: 'sans-serif'
              }}>
                {t('beru.header', { mode: currentSubMenu === 'advice' ? t('beru.mode.advice') : t('beru.mode.intelligence') })}
              </span>
            </div>
            
            <button
              onClick={onClose}
              className="beru-close"
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
            {Object.entries(currentOptions)
              .filter(([_, option]) => !option.condition || option.condition())
              .map(([key, option], index) => (
                <button
                  key={key}
                  onClick={() => handleOption(option.action)}
                  className={`beru-bubble ${currentSubMenu === 'advice' ? 'beru-advice-mode' : ''}`}
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
                  <span className="beru-icon" style={{ fontSize: '18px', flexShrink: 0 }}>
                    {option.icon}
                  </span>
                  <span className="beru-text" style={{
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
          className="beru-interaction-menu fixed z-[9999]"
          style={{
            left: position.x,
            top: position.y
          }}
        >
          {/* Centre de Béru */}
          <div
            className={`absolute w-6 h-6 rounded-full animate-pulse shadow-lg border-2 border-white ${currentSubMenu === 'advice' ? 'bg-green-500/80' : 'bg-red-500/80'}`}
            style={{ 
              left: '-3px', 
              top: '-3px',
              boxShadow: currentSubMenu === 'advice' 
                ? '0 0 15px rgba(34, 197, 94, 0.5)' 
                : '0 0 15px rgba(138, 43, 226, 0.5)'
            }}
          ></div>

          {/* Bulles d'options en cercle (garde tes positions existantes) */}
          {Object.entries(currentOptions)
            .filter(([_, option]) => !option.condition || option.condition())
            .map(([key, option], index) => {
              const textLength = option.label.length;
              const bubbleWidth = Math.max(140, Math.min(240, textLength * 9 + 70));
              const bubbleHeight = 45;

              // Utilise tes positions existantes du code original
              const positions = {
                newbie: { x: "0.7vw", y: "-11.5vh" },
                advice: { x: "-10vw", y: "-3vh" },
                lore: { x: "12vw", y: "-3vh" },
                humor: { x: "-10vw", y: "3vh" },
                tank_talk: { x: "12vw", y: "3vh" },
                // Advice submenu positions
                general_analysis: { x: "-15vw", y: "-8vh" },
                artifact_analysis: { x: "-8vw", y: "-12vh" },
                stat_optimization: { x: "5vw", y: "-12vh" },
                compare_builds: { x: "12vw", y: "-8vh" },
                back: { x: "0vw", y: "-15vh" }
              };

              const pos = positions[key] || { x: "0vw", y: "0vh" };

              return (
                <button
                  key={key}
                  onClick={() => handleOption(option.action)}
                  className={`beru-bubble ${currentSubMenu === 'advice' ? 'beru-advice-mode' : ''}`}
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
                    <span className="beru-icon text-base flex-shrink-0">{option.icon}</span>
                    <span
                      className="beru-text text-xs font-bold leading-tight flex-1 min-w-0"
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
            className="beru-close absolute w-9 h-9 flex items-center justify-center rounded-full"
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
const waitForElement = (selector, timeout = 5000) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const checkElement  = setInterval(() => {
      const element = document.querySelector(selector);
      if (element) {
        clearInterval(checkElement);
        resolve(element);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkElement);
        resolve(null);
      }
    }, 100);
  });
};

export default BeruInteractionMenu;