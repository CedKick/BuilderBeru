import React, { useState, useEffect, useRef } from 'react';
import ChibiBubble from '../ChibiBubble';
import { tutorialSteps } from './tutorialSteps';
import './IgrisTutorial.css';

// 🖼️ URLs Cloudinary pour Igris
const IGRIS_IMAGES = {
  up: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754570648/igris_up_hfonzn.png',
  down: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754570362/igris_face_xj5mqo.png',
  left: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754570544/igris_left_cw3w5g.png',
  right: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754570506/igris_right_jmyupb.png',
  icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754570362/igris_face_xj5mqo.png'
};

const IgrisTutorial = ({ onClose, selectedCharacter, characters, showTankMessage }) => {
  const [currentStep, setCurrentStep] = useState(-1); // -1 pour commencer avec la notification système
  const [igrisPosition, setIgrisPosition] = useState({ 
    x: window.innerWidth / 2, 
    y: window.innerHeight / 2 
  });
  const [igrisDirection, setIgrisDirection] = useState('down');
  const [isMoving, setIsMoving] = useState(false);
  const [showSystemNotification, setShowSystemNotification] = useState(true);
  const [showPunishment, setShowPunishment] = useState(false);
  
  const overlayRef = useRef(null);

  // 🎮 Fonction pour accepter le tutoriel
  const acceptTutorial = () => {
    console.log('✅ Tutoriel accepté');
    setShowSystemNotification(false);
    setCurrentStep(0);
  };

  // 💀 Fonction pour refuser (PUNITION!)
  const declineTutorial = () => {
    console.log('❌ Tutoriel refusé');
    setShowSystemNotification(false);
    setShowPunishment(true);
    
    // Message de punition
    setTimeout(() => {
      showTankMessage && showTankMessage("❌ VOUS AVEZ REFUSÉ L'AIDE DU SYSTÈME. CONSÉQUENCES APPLIQUÉES.", true);
      
      // Effet de "punition" léger (juste visuel)
      document.body.style.filter = 'hue-rotate(180deg)';
      setTimeout(() => {
        document.body.style.filter = '';
        setShowPunishment(false);
        onClose();
      }, 2000);
    }, 1000);
  };

  // 🎮 Fonction pour bouger Igris vers un élément
  const moveIgrisTo = async (targetElement, customPosition = null) => {
    return new Promise((resolve) => {
      let newX, newY;
      
      if (customPosition) {
        newX = customPosition.x;
        newY = customPosition.y;
      } else if (!targetElement) {
        // Retour au centre par défaut
        newX = window.innerWidth / 2;
        newY = window.innerHeight / 2;
      } else {
        const rect = targetElement.getBoundingClientRect();
        
        // Position relative à la fenêtre visible (sans scroll)
        const elementCenterX = rect.left + rect.width / 2;
        const elementCenterY = rect.top + rect.height / 2;
        
        // Logique de placement d'Igris autour de l'élément
        if (rect.top < window.innerHeight / 3) {
          // Élément en haut -> Igris en dessous
          newX = elementCenterX;
          newY = rect.bottom + 150;
        } else if (rect.bottom > window.innerHeight * 2/3) {
          // Élément en bas -> Igris au-dessus
          newX = elementCenterX;
          newY = rect.top - 100;
        } else {
          // Élément au milieu -> Igris sur le côté
          if (rect.left > window.innerWidth / 2) {
            newX = rect.left - 150;
          } else {
            newX = rect.right + 150;
          }
          newY = elementCenterY;
        }
        
        // Limites pour garder Igris visible
        const padding = 100;
        newX = Math.max(padding, Math.min(window.innerWidth - padding, newX));
        newY = Math.max(padding, Math.min(window.innerHeight - padding, newY));
      }
      
      // Calcul de la direction
      const deltaX = newX - igrisPosition.x;
      const deltaY = newY - igrisPosition.y;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        setIgrisDirection(deltaX > 0 ? 'right' : 'left');
      } else {
        setIgrisDirection(deltaY > 0 ? 'down' : 'up');
      }
      
      setIsMoving(true);
      setIgrisPosition({ x: newX, y: newY });
      
      setTimeout(() => {
        setIsMoving(false);
        setTimeout(resolve, 300);
      }, 800);
    });
  };

  // 🔦 Fonction pour highlight un élément
  const highlightElement = (selector) => {
    // Nettoyer les anciens highlights
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
      el.style.position = '';
      el.style.zIndex = '';
    });
    
    if (!selector) return;
    
    let element = null;
    
    if (typeof selector === 'function') {
      element = selector();
    } else {
      const selectors = selector.split(',').map(s => s.trim());
      for (const sel of selectors) {
        try {
          element = document.querySelector(sel);
          if (element) break;
        } catch (e) {
          console.warn(`Sélecteur invalide: ${sel}`);
        }
      }
    }
    
    if (element) {
      element.classList.add('tutorial-highlight');
      
      if (!element.style.position || element.style.position === 'static') {
        element.style.position = 'relative';
      }
      
      element.style.zIndex = '10001';
      
      // Scroll pour voir l'élément
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center' 
      });
      
      // Attendre un peu que le scroll soit fini avant de bouger Igris
      setTimeout(() => {
        moveIgrisTo(element);
      }, 300);
    } else {
      moveIgrisTo(null);
    }
  };

  // 🎯 Fonction d'attente d'élément
  const waitForElement = (selector, timeout = 5000) => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkElement = setInterval(() => {
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

  // 📍 Hook principal pour gérer les étapes
  useEffect(() => {
    if (currentStep < 0) return; // Pas encore commencé
    
    const executeStep = async () => {
      const step = tutorialSteps[currentStep];
      if (!step) return;
      
      // 1️⃣ Bouger Igris si nécessaire
      if (step.highlight && step.selector) {
        const element = typeof step.selector === 'function' 
          ? step.selector()
          : document.querySelector(step.selector);
          
        if (element) {
          await moveIgrisTo(element);
          await new Promise(resolve => setTimeout(resolve, 300));
          highlightElement(step.selector);
        }
      } else if (!step.selector) {
        await moveIgrisTo(null, step.customPosition);
      }
      
      // 2️⃣ Attendre qu'un élément apparaisse (pour les popups)
      if (step.waitForElement) {
        console.log('⏳ En attente de:', step.waitForElement);
        const element = await waitForElement(step.waitForElement);
        if (element) {
          console.log('✅ Élément trouvé !');
        }
      }
      
      // 3️⃣ Exécuter l'action si définie
      if (step.action && typeof step.action === 'function') {
        setTimeout(() => {
          step.action();
        }, 1500);
      }
      
      // 4️⃣ Gérer l'attente du clic utilisateur
      if (step.waitForClick && step.selector) {
        console.log('👆 En attente du clic utilisateur...');
        
        const element = typeof step.selector === 'function' 
          ? step.selector()
          : document.querySelector(step.selector);
          
        if (element) {
          const handleClick = () => {
            console.log('✅ Clic détecté !');
            element.removeEventListener('click', handleClick);
            
            // Callback optionnel
            if (step.onElementClick) {
              step.onElementClick();
            }
            
            // Passer à l'étape suivante après un court délai
            setTimeout(() => nextStep(), 500);
          };
          
          // Ajouter l'écouteur
          element.addEventListener('click', handleClick);
          
          // Retourner la fonction de cleanup
          return () => {
            element.removeEventListener('click', handleClick);
          };
        }
      }
      
      // 5️⃣ Auto-progression simple (si pas waitForClick)
      if (step.autoNext && step.duration && !step.waitForClick) {
        const timer = setTimeout(() => {
          nextStep();
        }, step.duration);
        
        // Retourner la fonction de cleanup
        return () => clearTimeout(timer);
      }
    };
    
    // Exécuter et récupérer la fonction de cleanup
    const cleanup = executeStep();
    
    // Retourner le cleanup pour le useEffect
    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [currentStep]); // Dépendance sur currentStep seulement

  // 📍 Hook pour gérer le resize de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      // Recalculer la position d'Igris pour rester centré
      if (currentStep < 0) {
        setIgrisPosition({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentStep]);

  // 🧹 Nettoyage en sortie
  useEffect(() => {
    return () => {
      document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
        el.style.position = '';
        el.style.zIndex = '';
      });
      document.body.style.filter = '';
    };
  }, []);

  // ⏭️ Navigation
  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      showTankMessage && showTankMessage("🎉 QUÊTE TUTORIEL COMPLÉTÉE ! +1000 EXP", true);
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 🎨 Position de la bulle
  const getBubblePosition = () => {
    return {
      x: igrisPosition.x,
      y: igrisPosition.y - 100
    };
  };

  const currentStepData = tutorialSteps[currentStep];
  const bubblePosition = getBubblePosition();

  return (
    <div className="igris-tutorial-overlay" ref={overlayRef}>
      {/* Fond sombre */}
      <div className="tutorial-backdrop" />
      
      {/* 🎮 NOTIFICATION SYSTÈME INITIALE */}
      {showSystemNotification && (
        <div className="tutorial-system-notification">
          <div className="notification-header">
            <div className="notification-icon" />
            <h2 className="notification-title">NOTIFICATION</h2>
          </div>
          
          <div className="notification-message">
            Votre guide spirituel s'arrêtera dans <span className="warning-text">0.00 secondes</span>
            <br />
            si vous choisissez de ne pas accepter.
            <br /><br />
            <strong>Acceptez-vous l'aide du système ?</strong>
          </div>
          
          <div className="notification-buttons">
            <button 
              className="system-button accept-button"
              onClick={acceptTutorial}
              type="button"
            >
              Oui
            </button>
            <button 
              className="system-button decline-button"
              onClick={declineTutorial}
              type="button"
            >
              Non
            </button>
          </div>
        </div>
      )}
      
      {/* 💀 ÉCRAN DE PUNITION */}
      {showPunishment && (
        <div className="punishment-overlay">
          <div className="punishment-message">
            PUNITION APPLIQUÉE
          </div>
        </div>
      )}
      
      {/* Le reste du tutoriel (uniquement si accepté) */}
      {currentStep >= 0 && (
        <>
          {/* Igris sur Cerbère */}
          <div 
            className={`igris-sprite ${isMoving ? 'igris-moving' : ''}`}
            style={{
              left: `${igrisPosition.x}px`,
              top: `${igrisPosition.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <img 
              src={IGRIS_IMAGES[igrisDirection]} 
              alt="Igris sur Cerbère"
              width="100"
              height="100"
              className="igris-image"
            />
          </div>

          {/* Bulle de dialogue */}
          {currentStepData && currentStepData.message && !currentStepData.skipBubble && (
            <ChibiBubble
              key={`step-${currentStep}`}
              entityType={currentStepData.speaker || 'igris'}
              message={currentStepData.message}
              isMobile={window.innerWidth < 768}
              position={bubblePosition}
            />
          )}

          {/* Contrôles de navigation SYSTÈME */}
          <div className="tutorial-controls">
            <div className="step-indicator">
              <span className="step-label">ÉTAPE</span>
              <div className="step-numbers">
                <span className="current-step">{currentStep + 1}</span>
                <span className="separator">/</span>
                <span className="total-steps">{tutorialSteps.length}</span>
              </div>
            </div>
            
            <button 
              onClick={prevStep}
              disabled={currentStep === 0}
              className="control-button control-prev"
              type="button"
            >
              ← RETOUR
            </button>
            
            <button 
              onClick={nextStep}
              className="control-button control-next"
              type="button"
            >
              {currentStep === tutorialSteps.length - 1 ? 'TERMINER →' : 'SUIVANT →'}
            </button>
            
            <button 
              onClick={() => {
                if (window.confirm("⚠️ ATTENTION: Abandonner le tutoriel maintenant pourrait avoir des conséquences. Êtes-vous sûr ?")) {
                  showTankMessage && showTankMessage("⚠️ Tutoriel abandonné. Le système se souviendra de ce choix...", true);
                  onClose();
                }
              }}
              className="control-button control-skip"
              title="Abandonner le tutoriel (Déconseillé)"
              type="button"
            >
              PASSER ✕
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default IgrisTutorial;