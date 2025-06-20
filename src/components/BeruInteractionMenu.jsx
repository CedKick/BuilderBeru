// BeruInteractionMenu.jsx - VERSION POSITIONNEMENT RECTIFIÉ
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // ← AJOUTE ÇA
import '../i18n/i18n';

const BeruInteractionMenu = ({ position, onClose, selectedCharacter, characters, showTankMessage }) => {
    const [showMenu, setShowMenu] = useState(true);
    const [animationClass, setAnimationClass] = useState('');
    const { t } = useTranslation();

    // 🎨 Animation d'apparition
    useEffect(() => {
        setAnimationClass('bubble-appear');
    }, []);

    // 🧠 Options Beru - VERSION RESPONSIVE - Unités vh/vw !
    const getBeruInteractionOptions = (selectedCharacter) => ({
        newbie: {
            icon: "👋",
            label: "Nouveau sur le site ?",
            action: "tutorial",
            position: { x: "0.7vw", y: "-11.5vh" } // AU-DESSUS de Beru (responsive)
        },
        advice: {
            icon: "🎯",
            label: `Conseils sur ${characters[selectedCharacter]?.name || 'ce Hunter'}`,
            action: "analyze_build",
            position: { x: "-10vw", y: "-3vh" }, // GAUCHE HAUT (responsive)
            condition: () => selectedCharacter
        },
        lore: {
            icon: "📖",
            label: "Du lore sur Béru ?",
            action: "show_lore",
            position: { x: "12vw", y: "-3vh" } // DROITE HAUT (responsive)
        },
        humor: {
            icon: "😈",
            label: "Fais-moi rire Béru",
            action: "beru_joke",
            position: { x: "-10vw", y: "3vh" } // GAUCHE BAS (responsive)
        },
        tank_talk: {
            icon: "💬",
            label: "Parler à Tank",
            action: "tank_interaction",
            position: { x: "12vw", y: "3vh" } // DROITE BAS (responsive)
        }
    });

    const options = getBeruInteractionOptions(selectedCharacter);

    // 🧠 Actions Beru
const handleOption = (action) => {
  switch(action) {
    case 'tutorial':
      const tutorialMessages = t('beruTutorial', { returnObjects: true });
      const randomTutorial = tutorialMessages[Math.floor(Math.random() * tutorialMessages.length)];
      showTankMessage(randomTutorial, true, 'beru');
      onClose(); // ← DANS chaque case
      break;
      
    case 'analyze_build':
      if (selectedCharacter) {
        const hunterName = characters[selectedCharacter]?.name || selectedCharacter;
        showTankMessage(t('beruAnalysis.withCharacter', { hunterName }), true, 'beru');
      } else {
        showTankMessage(t('beruAnalysis.noCharacter'), true, 'beru');
      }
      onClose(); // ← DANS chaque case
      break;
      
    case 'show_lore':
      const loreMessages = t('beruLore', { returnObjects: true });
      const randomLore = loreMessages[Math.floor(Math.random() * loreMessages.length)];
      showTankMessage(randomLore, true, 'beru');
      onClose(); // ← DANS chaque case
      break;
      
    case 'beru_joke':
      const jokes = t('beruJokes', { returnObjects: true });
      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
      showTankMessage(randomJoke, true, 'beru');
      onClose(); // ← DANS chaque case
      break;
      
    case 'tank_interaction':
      showTankMessage("eh Tank tufékoa??!", true, 'beru');
      onClose(); // ← DANS chaque case (Tank répond après)
      setTimeout(() => {
        const tankReplies = t('tankReplies', { returnObjects: true });
        const reply = tankReplies[Math.floor(Math.random() * tankReplies.length)];
        showTankMessage(reply, true, 'tank');
      }, 2000);
      break;
  }
  // ← SUPPRIME onClose() d'ici !
};
    // 🔒 Fermer au clic extérieur
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

    return (
        <>
            {/* Styles CSS intégrés pour les animations */}
            <style jsx>{`
        @keyframes bubble-appear {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.3);
          }
          60% {
            transform: translate(-50%, -50%) scale(1.1);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes bubble-hover {
          0% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
          100% { transform: translate(-50%, -50%) scale(1.05); }
        }

        .bubble-appear {
          animation: bubble-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .bubble-option {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .bubble-option:hover {
          transform: translate(-50%, -50%) scale(1.05) !important;
          box-shadow: 0 8px 25px rgba(79, 70, 229, 0.4), 0 0 20px rgba(99, 102, 241, 0.3);
        }

        .bubble-text {
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          color: #FFFFFF !important;
        }

        .bubble-container {
          backdrop-filter: blur(1px);
        }
      `}</style>

            {/* Container principal centré sur Beru */}
            <div
                className="beru-bubble-menu fixed z-[9999] bubble-container"
                style={{
                    left: position.x,
                    top: position.y,
                    transform: 'translate(-50%, -50%)'
                }}
            >
                {/* Centre de Beru avec aura douce - PLUS VISIBLE POUR DEBUG */}
                <div className="absolute w-6 h-6 bg-red-500/80 rounded-full animate-pulse shadow-lg border-2 border-white"
                    style={{ left: '-3px', top: '-3px' }}></div>

                {/* Bulles d'options POSITIONNÉES AUTOUR de Beru */}
                {Object.entries(options)
                    .filter(([_, option]) => !option.condition || option.condition())
                    .map(([key, option], index) => {
                        // Calcul dynamique de la largeur selon le texte (légèrement réduit)
                        const textLength = option.label.length;
                        const bubbleWidth = Math.max(140, Math.min(220, textLength * 9 + 70));
                        const bubbleHeight = 45;

                        return (
                            <button
                                key={key}
                                onClick={() => handleOption(option.action)}
                                className={`bubble-option absolute bg-gradient-to-br from-slate-600/80 to-indigo-700/80 text-white rounded-full shadow-xl border-2 border-indigo-400/40 backdrop-blur-sm ${animationClass}`}
                                style={{
                                    left: typeof option.position.x === 'string' ? option.position.x : `${option.position.x}px`,
                                    top: typeof option.position.y === 'string' ? option.position.y : `${option.position.y}px`,
                                    width: `${bubbleWidth}px`,
                                    height: `${bubbleHeight}px`,
                                    animationDelay: `${index * 0.1}s`,
                                    zIndex: 10,
                                    transform: 'translate(-50%, -50%)' // Centre les bulles sur leurs positions
                                }}
                            >
                                <div className="flex items-center justify-center gap-2 px-3 h-full">
                                    <span className="text-base flex-shrink-0">
                                        {option.icon}
                                    </span>
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

                {/* Croix de fermeture - EN DESSOUS de Beru */}
                <button
                    onClick={onClose}
                    className="bubble-option absolute bg-gradient-to-br from-red-500/80 to-red-700/80 hover:from-red-600/80 hover:to-red-800/80 text-white rounded-full shadow-xl border-2 border-red-400/40 backdrop-blur-sm w-9 h-9 flex items-center justify-center"
                    style={{
                        left: "1.5vw", // Position responsive
                        top: "5vh",    // Position responsive
                        animationDelay: '0.6s',
                        transform: 'translate(-50%, -50%)' // Centre la croix
                    }}
                >
                    <span className="text-xs font-bold">✕</span>
                </button>
            </div>
        </>
    );
};

export default BeruInteractionMenu;