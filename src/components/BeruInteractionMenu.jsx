// BeruInteractionMenu.jsx - AI INTELLIGENCE SYSTEM BY KAISEL
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BUILDER_DATA } from '../data/builder_data'; // 🧠 IMPORT DE L'INTELLIGENCE
import { performIntelligentAnalysis } from '../utils/BeruIntelligentAnalysis';
import { BeruReportSystem, GoldenPapyrusIcon } from '../components/BeruReportSystem';
import '../i18n/i18n';

const BeruInteractionMenu = ({
  position,
  onClose,
  selectedCharacter,
  characters,
  showTankMessage,
  // 🔥 NOUVEAUX PROPS POUR L'INTELLIGENCE
  currentArtifacts = {},
  currentStats = {},
  currentCores = {},
  currentGems = {},
  multiAccountsData = {}, // Pour les comparaisons
   onReportGenerated, // ← NOUVEAU PROP
   substatsMinMaxByIncrements,
   existingScores = {} // ← NOUVEAU PROP
}) => {
  const [showMenu, setShowMenu] = useState(true);
  const [animationClass, setAnimationClass] = useState('');
  const [currentSubMenu, setCurrentSubMenu] = useState(null); // 🆕 SUBMENU STATE
  const { t } = useTranslation();

  useEffect(() => {
    setAnimationClass('bubble-appear');
  }, []);

  // 🧠 INTELLIGENCE BÉRU - ANALYSE DU BUILD ACTUEL
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

    // 🔍 ANALYSE DES ARTEFACTS
    if (currentArtifacts) {
      // Vérifier le set principal
      const currentSets = {};
      Object.values(currentArtifacts).forEach(artifact => {
        if (artifact?.set) {
          currentSets[artifact.set] = (currentSets[artifact.set] || 0) + 1;
        }
      });

      const dominantSet = Object.keys(currentSets).reduce((a, b) =>
        currentSets[a] > currentSets[b] ? a : b, null
      );

      if (dominantSet) {
        const recommendedSets = Object.values(hunterData.gameModes).map(mode => mode.recommendedSet);
        if (recommendedSets.includes(dominantSet)) {
          analysis.strengths.push(`✅ Set ${dominantSet} parfait pour ${hunterData.name}`);
          analysis.score += 25;
        } else {
          analysis.issues.push(`⚠️ Set ${dominantSet} pas optimal pour ${hunterData.name}`);
          analysis.suggestions.push(`🎯 Recommandé: ${recommendedSets[0]}`);
        }
      }

      // Vérifier les main stats
      const recommendedMainStats = hunterData.artifactSets[Object.keys(hunterData.artifactSets)[0]]?.mainStats;
      if (recommendedMainStats) {
        Object.entries(currentArtifacts).forEach(([slot, artifact]) => {
          const recommended = recommendedMainStats[slot];
          if (artifact?.mainStat && recommended) {
            if (artifact.mainStat === recommended) {
              analysis.score += 5;
            } else {
              analysis.issues.push(`❌ ${slot}: ${artifact.mainStat} au lieu de ${recommended}`);
            }
          } else if (recommended) {
            analysis.missingPieces.push(`🔳 ${slot}: manque ${recommended}`);
          }
        });
      }
    }

    // 🎯 ANALYSE DES STATS
    if (currentStats) {
      const priorities = hunterData.optimizationPriority;
      const critRate = currentStats['Critical Hit Rate'] || 0;

      if (critRate < 50) {
        analysis.issues.push(`⚠️ Taux critique: ${critRate}% (recommandé: 50%+)`);
      } else {
        analysis.strengths.push(`✅ Taux critique optimal: ${critRate}%`);
        analysis.score += 15;
      }

      // Vérifier la stat principale selon scaleStat
      const scaleStat = hunterData.scaleStat;
      const scaleStatKey = scaleStat === 'Attack' ? 'Additional Attack' :
        scaleStat === 'Defense' ? 'Additional Defense' :
          scaleStat === 'HP' ? 'Additional HP' : null;

      if (scaleStatKey && currentStats[scaleStatKey]) {
        analysis.strengths.push(`✅ ${scaleStat} build cohérent`);
        analysis.score += 10;
      }
    }

    // 🧪 ANALYSE DES NOYAUX
    if (currentCores && hunterData.recommendedCores) {
      Object.entries(hunterData.recommendedCores).forEach(([type, recommendedCore]) => {
        const currentCore = currentCores[type];
        if (currentCore?.name === recommendedCore.name) {
          analysis.strengths.push(`✅ Noyau ${type} optimal: ${recommendedCore.name}`);
          analysis.score += 8;
        } else if (currentCore?.name) {
          analysis.suggestions.push(`🔧 Noyau ${type}: ${recommendedCore.name} recommandé`);
        }
      });
    }

    return analysis;
  };

  // 🎯 COMPARAISON MULTI-COMPTES
  const findSimilarBuilds = (characterKey) => {
    const similarBuilds = [];

    Object.entries(multiAccountsData).forEach(([accountName, accountData]) => {
      if (accountData.characters?.[characterKey]) {
        const otherBuild = accountData.characters[characterKey];
        // Calculer un score de similarity
        similarBuilds.push({
          accountName,
          build: otherBuild,
          similarity: calculateSimilarity(currentArtifacts, otherBuild.artifacts)
        });
      }
    });

    return similarBuilds.sort((a, b) => b.similarity - a.similarity);
  };

  const calculateSimilarity = (build1, build2) => {
    // Logique de calcul de similarité (sets, main stats, etc.)
    let score = 0;
    // Implementation simplifiée
    return score;
  };

  // 🧠 OPTIONS PRINCIPALES BÉRU
  const getMainOptions = (selectedCharacter) => ({
    newbie: {
      icon: "👋",
      label: "Nouveau sur le site ?",
      action: "tutorial",
      position: { x: "0.7vw", y: "-11.5vh" }
    },
    advice: {
      icon: "🎯",
      label: `Conseils sur ${characters[selectedCharacter]?.name || 'ce Hunter'}`,
      action: "show_advice_submenu",
      position: { x: "-10vw", y: "-3vh" },
      condition: () => selectedCharacter
    },
    lore: {
      icon: "📖",
      label: "Du lore sur Béru ?",
      action: "show_lore",
      position: { x: "12vw", y: "-3vh" }
    },
    humor: {
      icon: "😈",
      label: "Fais-moi rire Béru",
      action: "beru_joke",
      position: { x: "-10vw", y: "3vh" }
    },
    tank_talk: {
      icon: "💬",
      label: "Parler à Tank",
      action: "tank_interaction",
      position: { x: "12vw", y: "3vh" }
    }
  });

  // 🔥 SUBMENU CONSEILS INTELLIGENTS
  const getAdviceSubMenu = () => ({
    general_analysis: {
      icon: "🔍",
      label: "Inspection générale",
      action: "general_analysis",
      position: { x: "-15vw", y: "-8vh" }
    },
    artifact_analysis: {
      icon: "💎",
      label: "Analyse artefacts/sets",
      action: "artifact_analysis",
      position: { x: "-8vw", y: "-12vh" }
    },
    stat_optimization: {
      icon: "📊",
      label: "Optimisation stats",
      action: "stat_optimization",
      position: { x: "5vw", y: "-12vh" }
    },
    compare_builds: {
      icon: "⚖️",
      label: "Comparaison builds",
      action: "compare_builds",
      position: { x: "12vw", y: "-8vh" }
    },
    back: {
      icon: "↩️",
      label: "Retour",
      action: "back_to_main",
      position: { x: "0vw", y: "-15vh" }
    }
  });

  // 🧠 ACTIONS INTELLIGENTES
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
    existingScores // ← PASSER LES SCORES EXISTANTS !
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

      // Actions originales
      case 'tutorial':
        const tutorialMessages = t('beruTutorial', { returnObjects: true });
        const randomTutorial = tutorialMessages[Math.floor(Math.random() * tutorialMessages.length)];
        showTankMessage(randomTutorial, true, 'beru');
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
    }
  };

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.beru-bubble-menu')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!showMenu) return null;

  // 🎯 CHOIX DU MENU À AFFICHER
  const currentOptions = currentSubMenu === 'advice' ? getAdviceSubMenu() : getMainOptions(selectedCharacter);

  return (
    <>
      {/* Styles CSS inchangés */}
      <style jsx>{`
                  @keyframes bubble-appear {
                      0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
                      60% { transform: translate(-50%, -50%) scale(1.1); }
                      100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                  }

                  @keyframes bubble-hover {
                      0% { transform: translate(-50%, -50%) scale(1); }
                      50% { transform: translate(-50%, -50%) scale(1.1); }
                      100% { transform: translate(-50%, -50%) scale(1.05); }
                  }

                  .bubble-appear { animation: bubble-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
                  .bubble-option { transition: transform 0.2s ease, box-shadow 0.2s ease; }
                  .bubble-option:hover {
                      transform: translate(-50%, -50%) scale(1.05) !important;
                      box-shadow: 0 8px 25px rgba(79, 70, 229, 0.4), 0 0 20px rgba(99, 102, 241, 0.3);
                  }
                  .bubble-text { text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); color: #FFFFFF !important; }
                  .bubble-container { backdrop-filter: blur(1px); }
              `}</style>

      {/* Container principal */}
     <div
  className="beru-bubble-menu fixed z-[9999] bubble-container"
  style={{
    // 🔥 SUPPRIME les -50 ! Le translate(-50%, -50%) s'en charge déjà
    left: position.x,  // ← SANS -50
    top: position.y    // ← SANS -50
  }}
>
        {/* Centre de Beru - COULEUR DYNAMIQUE SELON LE SUBMENU */}
        <div
          className={`absolute w-6 h-6 rounded-full animate-pulse shadow-lg border-2 border-white ${currentSubMenu === 'advice' ? 'bg-green-500/80' : 'bg-red-500/80'
            }`}
          style={{ left: '-3px', top: '-3px' }}
        ></div>

        {/* Bulles d'options dynamiques */}
        {Object.entries(currentOptions)
          .filter(([_, option]) => !option.condition || option.condition())
          .map(([key, option], index) => {
            const textLength = option.label.length;
            const bubbleWidth = Math.max(140, Math.min(240, textLength * 9 + 70));
            const bubbleHeight = 45;

            return (
              <button
                key={key}
                onClick={() => handleOption(option.action)}
                className={`bubble-option absolute bg-gradient-to-br ${currentSubMenu === 'advice'
                    ? 'from-green-600/80 to-emerald-700/80 border-green-400/40'
                    : 'from-slate-600/80 to-indigo-700/80 border-indigo-400/40'
                  } text-white rounded-full shadow-xl border-2 backdrop-blur-sm ${animationClass}`}
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

        {/* Croix de fermeture */}
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

export default BeruInteractionMenu;