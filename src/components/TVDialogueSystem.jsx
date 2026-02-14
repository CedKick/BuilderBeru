import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const TVDialogueSystem = React.memo(({ 
  show,
  statType,
  statValue,
  onClose 
}) => {
  const { t, i18n } = useTranslation();
  const [showTV1, setShowTV1] = useState(false);
  const [showTV2, setShowTV2] = useState(false);
  const [activeBubble, setActiveBubble] = useState({ speaker: 0, text: '' });
  // 🔥 State pour les images - DEUX images différentes
  const [tv1ImageIndex, setTv1ImageIndex] = useState(null);
  const [tv2ImageIndex, setTv2ImageIndex] = useState(null);
  
  // Refs pour éviter les bugs
  const timeoutRef = useRef(null);
  const bubbleTimeoutRef = useRef(null);
  const isPlayingRef = useRef(false);
  const currentIndexRef = useRef(0);
  const dialoguesRef = useRef([]);

  const tvImages = [
    'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751991421/Reaction01_WOW_szyn6y_ptzvck.png',
    'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751991421/Reaction_Shuhua_WOW_lrxqg0_mlinav.png',
    'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751991420/Reaction_Juwee_WOW_qbkldi_erit0u.png',
    'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751991420/Reaction_Chae_EMUE_ciljid_rczfmq.png'
  ];

  // 🔥 Récupération des dialogues depuis i18n
  const getDialogues = () => {
    // Mapping des types de stats vers les clés i18n
    const typeMap = {
      'Attack %': 'attack',
      'HP %': 'hp',
      'Defense %': 'defense'
    };
    
    const dialogueKey = typeMap[statType] || 'attack';
    const sequences = t(`tv_dialogue.${dialogueKey}.sequences`, { returnObjects: true });
    
    // Si pas de séquences, retour fallback
    if (!sequences || !Array.isArray(sequences)) {
      return [
        { speaker: 1, text: `WOW! ${statValue.toFixed(2)}%!` },
        { speaker: 2, text: "Amazing stat!" }
      ];
    }
    
    // Choisir une séquence aléatoire
    const selectedSequence = sequences[Math.floor(Math.random() * sequences.length)];
    
    // Remplacer {{value}} par la valeur réelle
    return selectedSequence.map(dialogue => ({
      speaker: dialogue.speaker,
      text: dialogue.text.replace('{{value}}', statValue.toFixed(2))
    }));
  };

  // 🔥 Cleanup function
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
      isPlayingRef.current = false;
    };
  }, []);

  // 🔥 Effect principal
  useEffect(() => {
    if (!show) {
      resetAll();
      return;
    }

    // Éviter double démarrage
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;

    // Sélection de DEUX images différentes
    const indices = [0, 1, 2, 3];
    const shuffled = indices.sort(() => Math.random() - 0.5);
    setTv1ImageIndex(shuffled[0]);
    setTv2ImageIndex(shuffled[1]);

    // Récupérer les dialogues depuis i18n
    dialoguesRef.current = getDialogues();
    currentIndexRef.current = 0;

    // Démarrer - TV1 apparaît immédiatement
    setShowTV1(true);
    // Commencer les dialogues rapidement
    timeoutRef.current = setTimeout(() => {
      playNextDialogue();
    }, 500);

  }, [show, statType, statValue, i18n.language]);

  // 🔥 Fonction pour jouer le prochain dialogue
  const playNextDialogue = () => {
    if (!isPlayingRef.current) return;

    // Si on a fini tous les dialogues
    if (currentIndexRef.current >= dialoguesRef.current.length) {
      // Attendre un peu puis fermer
      timeoutRef.current = setTimeout(() => {
        handleClose();
      }, 2500);
      return;
    }

    const dialogue = dialoguesRef.current[currentIndexRef.current];
    
    // TV2 apparaît au premier dialogue du speaker 2
    if (!showTV2 && dialogue.speaker === 2) {
      setShowTV2(true);
      // Afficher directement le dialogue
      showDialogue(dialogue);
    } else {
      showDialogue(dialogue);
    }
  };

  // 🔥 Afficher un dialogue avec timing approprié
  const showDialogue = (dialogue) => {
    // Afficher la bulle
    setActiveBubble({ speaker: dialogue.speaker, text: dialogue.text });
    
    // Calculer la durée d'affichage (minimum 3s, max 5s)
    const readingTime = dialogue.text.length * 50;
    const displayTime = Math.min(5000, Math.max(3000, readingTime));
    
    // Incrémenter l'index
    currentIndexRef.current++;
    
    // Attendre puis effacer et passer au suivant
    bubbleTimeoutRef.current = setTimeout(() => {
      // Effacer la bulle actuelle
      setActiveBubble({ speaker: 0, text: '' });
      
      // Petite pause entre les dialogues
      timeoutRef.current = setTimeout(() => {
        playNextDialogue();
      }, 400);
    }, displayTime);
  };

  // 🔥 Reset complet
  const resetAll = () => {
    isPlayingRef.current = false;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
    setShowTV1(false);
    setShowTV2(false);
    setActiveBubble({ speaker: 0, text: '' });
    setTv1ImageIndex(null);
    setTv2ImageIndex(null);
    currentIndexRef.current = 0;
  };

  // 🔥 Fermeture
  const handleClose = () => {
    resetAll();
    setTimeout(onClose, 300);
  };

  if (!show || tv1ImageIndex === null || tv2ImageIndex === null) return null;

  return (
    <>
      {/* 🖥️ DESKTOP VERSION */}
      <div className="hidden lg:block">
        {/* TV1 - GAUCHE - UNE SEULE IMAGE */}
        {showTV1 && (
          <div 
            className="fixed z-[9999]"
            style={{
              left: 'clamp(200px, 25vw, 350px)',
              top: '50%',
              transform: 'translateY(-50%)',
              opacity: 1, // Toujours opacité 1
              transition: 'opacity 0.3s ease'
            }}
          >
            <div className="relative">
              <img 
                src={tvImages[tv1ImageIndex]}
                alt="TV1 Character"
                className="tv-dialogue-img-left w-72 h-auto drop-shadow-2xl"
                style={{ display: 'block' }}
              />
              {activeBubble.speaker === 1 && activeBubble.text && (
                <div 
                  className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 
                             bg-white border-4 border-black rounded-2xl p-4 
                             max-w-[240px] shadow-xl"
                  style={{
                    fontFamily: '"Comic Sans MS", "Arial", cursive',
                    color: 'black',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    lineHeight: '1.4'
                  }}
                >
                  {activeBubble.text}
                  <div className="absolute -top-3 left-8 w-6 h-6 bg-white 
                                  border-t-4 border-l-4 border-black 
                                  transform rotate-45" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TV2 - DROITE - UNE SEULE IMAGE DIFFÉRENTE */}
        {showTV2 && (
          <div 
            className="fixed z-[9999]"
            style={{
              right: 'clamp(200px, 25vw, 350px)',
              top: '50%',
              transform: 'translateY(-50%)',
              opacity: 1, // Toujours opacité 1
              transition: 'opacity 0.3s ease'
            }}
          >
            <div className="relative">
              <img 
                src={tvImages[tv2ImageIndex]}
                alt="TV2 Character"
                className="tv-dialogue-img-right w-72 h-auto drop-shadow-2xl"
                style={{ display: 'block' }}
              />
              {activeBubble.speaker === 2 && activeBubble.text && (
                <div 
                  className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 
                             bg-white border-4 border-black rounded-2xl p-4 
                             max-w-[240px] shadow-xl"
                  style={{
                    fontFamily: '"Comic Sans MS", "Arial", cursive',
                    color: 'black',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    lineHeight: '1.4'
                  }}
                >
                  {activeBubble.text}
                  <div className="absolute -top-3 right-8 w-6 h-6 bg-white 
                                  border-t-4 border-r-4 border-black 
                                  transform rotate-45" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 📱 MOBILE VERSION */}
      <div className="lg:hidden">
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 pointer-events-none">
          {/* TV1 - HAUT */}
          {showTV1 && (
            <div 
              className="pointer-events-auto"
              style={{ 
                opacity: 1, // Toujours opacité 1
                transition: 'opacity 0.3s ease'
              }}
            >
              <div className="relative">
                <img 
                  src={tvImages[tv1ImageIndex]}
                  alt="TV1 Mobile"
                  className="tv-dialogue-img-mobile-top w-56 h-auto drop-shadow-xl"
                  style={{ display: 'block' }}
                />
                {activeBubble.speaker === 1 && activeBubble.text && (
                  <div 
                    className="bg-white border-3 border-black rounded-xl p-3 mt-2 
                               max-w-[180px] mx-auto shadow-lg text-center"
                    style={{
                      fontFamily: '"Comic Sans MS", "Arial", cursive',
                      color: 'black',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}
                  >
                    {activeBubble.text}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TV2 - BAS */}
          {showTV2 && (
            <div 
              className="pointer-events-auto"
              style={{ 
                opacity: 1, // Toujours opacité 1
                transition: 'opacity 0.3s ease'
              }}
            >
              <div className="relative">
                <img 
                  src={tvImages[tv2ImageIndex]}
                  alt="TV2 Mobile"
                  className="tv-dialogue-img-mobile-bottom w-56 h-auto drop-shadow-xl"
                  style={{ display: 'block' }}
                />
                {activeBubble.speaker === 2 && activeBubble.text && (
                  <div 
                    className="bg-white border-3 border-black rounded-xl p-3 mt-2 
                               max-w-[180px] mx-auto shadow-lg text-center"
                    style={{
                      fontFamily: '"Comic Sans MS", "Arial", cursive',
                      color: 'black',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}
                  >
                    {activeBubble.text}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ❌ BOUTON FERMER */}
      {(showTV1 || showTV2) && (
        <button
          onClick={handleClose}
          className="fixed top-4 right-4 z-[10000] bg-red-500 hover:bg-red-600 
                     text-white rounded-full w-12 h-12 flex items-center justify-center
                     font-bold text-xl transition-all hover:scale-110
                     shadow-lg border-2 border-white"
          style={{ transition: 'all 0.2s ease' }}
        >
          ✕
        </button>
      )}
    </>
  );
});

export default TVDialogueSystem;