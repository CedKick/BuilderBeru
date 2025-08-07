// components/IgrisTutorial/IgrisTutorial.jsx
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
  const [currentStep, setCurrentStep] = useState(0);
  const [igrisPosition, setIgrisPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [igrisDirection, setIgrisDirection] = useState('down');
  const [isMoving, setIsMoving] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const overlayRef = useRef(null);
  const highlightedElementRef = useRef(null);
  const [isTextAnimating, setIsTextAnimating] = useState(false);
const [canProgress, setCanProgress] = useState(true);

useEffect(() => {
  // Activer le mode tutoriel au montage
  if (window.setIsTutorialActive) {
    window.setIsTutorialActive(true);
  }
  
  // Désactiver au démontage
  return () => {
    if (window.setIsTutorialActive) {
      window.setIsTutorialActive(false);
    }
  };
}, []);

  // 🎮 Fonction pour bouger Igris vers un élément
  const moveIgrisTo = async (targetElement, customPosition = null) => {
    return new Promise((resolve) => {
      let newX, newY;
      
      if (customPosition) {
        newX = customPosition.x;
        newY = customPosition.y;
      } else if (!targetElement) {
        // Position par défaut au centre
        newX = window.innerWidth / 2;
        newY = window.innerHeight / 2;
      } else {
        const rect = targetElement.getBoundingClientRect();
        const scrollY = window.scrollY || window.pageYOffset;
        const scrollX = window.scrollX || window.pageXOffset;
        
        // Calculer la position en tenant compte du scroll
        const elementCenterX = rect.left + scrollX + rect.width / 2;
        const elementCenterY = rect.top + scrollY + rect.height / 2;
        
        // Position intelligente d'Igris
        if (rect.top < window.innerHeight / 3) {
          // Élément en haut -> Igris en dessous
          newX = elementCenterX;
          newY = rect.bottom + scrollY + 100;
        } else if (rect.bottom > window.innerHeight * 2/3) {
          // Élément en bas -> Igris au-dessus
          newX = elementCenterX;
          newY = rect.top + scrollY - 100;
        } else {
          // Élément au milieu -> Igris à côté
          if (rect.left > window.innerWidth / 2) {
            newX = rect.left + scrollX - 150;
          } else {
            newX = rect.right + scrollX + 150;
          }
          newY = elementCenterY;
        }
        
        // Contraindre aux limites de l'écran
        const padding = 100;
        newX = Math.max(padding, Math.min(window.innerWidth - padding, newX));
        newY = Math.max(padding, Math.min(
          document.documentElement.scrollHeight - padding, 
          newY
        ));
      }
      
      // Calculer la direction d'Igris
      const deltaX = newX - igrisPosition.x;
      const deltaY = newY - igrisPosition.y;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        setIgrisDirection(deltaX > 0 ? 'right' : 'left');
      } else {
        setIgrisDirection(deltaY > 0 ? 'down' : 'up');
      }
      
      setIsMoving(true);
      setIgrisPosition({ x: newX, y: newY });
      
      // Attendre la fin de l'animation
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
      // Restaurer les styles originaux
      el.style.position = '';
      el.style.zIndex = '';
    });
    
    if (!selector) return;
    
    let element = null;
    
    // Gérer les différents types de sélecteurs
    if (typeof selector === 'function') {
      // Si c'est une fonction, l'exécuter pour obtenir l'élément
      element = selector();
    } else if (selector.includes(':contains')) {
      // Parser le sélecteur :contains personnalisé
      const match = selector.match(/(.+):contains\("(.+)"\)/);
      if (match) {
        const [, baseSelector, text] = match;
        const elements = document.querySelectorAll(baseSelector || 'button');
        element = Array.from(elements).find(el => 
          el.textContent && el.textContent.includes(text)
        );
      }
    } else {
      // Essayer plusieurs variantes du sélecteur
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
      // Sauvegarder la référence
      highlightedElementRef.current = element;
      
      // Sauvegarder les styles originaux
      const originalPosition = element.style.position;
      const originalZIndex = element.style.zIndex;
      
      // Appliquer le highlight
      element.classList.add('tutorial-highlight');
      
      // Forcer la position relative si nécessaire
      if (!originalPosition || originalPosition === 'static') {
        element.style.position = 'relative';
      }
      
      // S'assurer que l'élément est au-dessus
      element.style.zIndex = '10001';
      
      // Scroll en vue
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center' 
      });
      
      // Déplacer Igris vers l'élément
      moveIgrisTo(element);
    } else {
      console.warn(`Élément non trouvé: ${selector}`);
      moveIgrisTo(null);
    }
  };

  // 📍 Gestion des étapes avec timing naturel
  useEffect(() => {
   // 🔧 FONCTION executeStep COMPLÈTE pour IgrisTutorial.jsx

const executeStep = async () => {
  const step = tutorialSteps[currentStep];
  if (!step) return;
  
  // Réinitialiser les états
  setIsClosing(false);
  setCanProgress(false);
  let cleanup = null;
  
  try {
    // 1️⃣ D'abord, on bouge Igris
    if (step.highlight && step.selector) {
      const element = typeof step.selector === 'function' 
        ? step.selector()
        : document.querySelector(step.selector);
        
      if (element) {
        await moveIgrisTo(element);
        // Petite pause après le mouvement
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Puis on highlight
        highlightElement(step.selector);
      }
    } else if (!step.selector) {
      // Si pas de sélecteur, position personnalisée ou centre
      await moveIgrisTo(null, step.customPosition);
    }
    
    // 2️⃣ Pause avant de parler
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 3️⃣ Afficher le message (sauf si c'est une pause)
    if (!step.skipBubble) {
      // D'abord cacher l'ancien message proprement si nécessaire
      if (showMessage) {
        setIsClosing(true);
        setShowMessage(false);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Puis afficher le nouveau
      setIsClosing(false);
      setShowMessage(true);
      setIsTextAnimating(true);
      
      // 🎯 Attendre que le texte soit complètement écrit
      const messageLength = step.message ? step.message.length : 0;
      const minAnimationTime = messageLength * 35 + 500; // 35ms par caractère + marge
      
      await new Promise(resolve => {
        let resolved = false;
        let textCompleteTimeout = null;
        let checkInterval = null;
        
        // Timeout de sécurité basé sur la longueur du message
        textCompleteTimeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            setIsTextAnimating(false);
            if (checkInterval) clearInterval(checkInterval);
            resolve();
          }
        }, minAnimationTime);
        
        // Vérifier périodiquement si l'animation est finie
        checkInterval = setInterval(() => {
          if (!isTextAnimating && !resolved) {
            resolved = true;
            if (textCompleteTimeout) clearTimeout(textCompleteTimeout);
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        
        // Stocker pour cleanup
        cleanup = () => {
          if (textCompleteTimeout) clearTimeout(textCompleteTimeout);
          if (checkInterval) clearInterval(checkInterval);
        };
      });
    }
    
    // 4️⃣ Exécuter l'action si définie (après un délai)
    if (step.action && typeof step.action === 'function') {
      await new Promise(resolve => setTimeout(resolve, 500));
      step.action();
    }
    
    // 5️⃣ Débloquer la progression
    setCanProgress(true);
    
    // 6️⃣ Auto-progression avec le bon timing
    if (step.autoNext) {
      const waitTime = step.duration || 3000;
      const autoNextTimer = setTimeout(() => {
        if (canProgress && !isClosing) {
          setShowMessage(false);
          setTimeout(nextStep, 300);
        }
      }, waitTime);
      
      // Retourner la fonction de cleanup
      return () => {
        clearTimeout(autoNextTimer);
        if (cleanup) cleanup();
      };
    }
    
    // 7️⃣ Attendre un clic si spécifié
    if (step.waitForClick && step.selector) {
      let clickCleanup = null;
      
      const handleClick = () => {
        setShowMessage(false);
        setTimeout(nextStep, 300);
      };
      
      const checkElement = setInterval(() => {
        const element = typeof step.selector === 'function' 
          ? step.selector()
          : document.querySelector(step.selector);
          
        if (element) {
          element.addEventListener('click', handleClick);
          clearInterval(checkElement);
          
          clickCleanup = () => {
            element.removeEventListener('click', handleClick);
          };
        }
      }, 100);
      
      // Retourner la fonction de cleanup
      return () => {
        clearInterval(checkElement);
        if (clickCleanup) clickCleanup();
        if (cleanup) cleanup();
      };
    }
    
  } catch (error) {
    console.error('Erreur dans executeStep:', error);
    setCanProgress(true);
    setIsTextAnimating(false);
  }
  
  // Cleanup par défaut
  return cleanup;
};
    
    executeStep();
  }, [currentStep]);

  // 🧹 Nettoyage en sortie
  useEffect(() => {
    return () => {
      // Nettoyer tous les highlights en sortant
      document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
        el.style.position = '';
        el.style.zIndex = '';
      });
    };
  }, []);

  

  // ⏭️ Navigation
  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Fin du tutoriel
      showTankMessage && showTankMessage("🎉 Bravo Monarque ! Tu maîtrises les bases !", true);
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 🎨 Position intelligente de la bulle
  const getBubblePosition = () => {
    const step = tutorialSteps[currentStep];
    if (!step || !step.selector) {
      // Position par défaut au-dessus d'Igris
      return {
        x: igrisPosition.x,
        y: igrisPosition.y - 100
      };
    }
    
    const element = typeof step.selector === 'function' 
      ? step.selector()
      : document.querySelector(step.selector);
      
    if (!element) {
      return {
        x: igrisPosition.x,
        y: igrisPosition.y - 100
      };
    }
    
    const rect = element.getBoundingClientRect();
    const igrisX = igrisPosition.x;
    const igrisY = igrisPosition.y;
    
    // Logique de positionnement intelligent
    let bubbleX, bubbleY;
    
    if (rect.top < window.innerHeight / 3) {
      // Élément en haut -> bulle en dessous d'Igris
      bubbleX = igrisX;
      bubbleY = igrisY + 100;
    } else if (rect.left > window.innerWidth / 2) {
      // Élément à droite -> bulle à gauche d'Igris
      bubbleX = igrisX - 200;
      bubbleY = igrisY - 50;
    } else {
      // Par défaut -> bulle à droite d'Igris
      bubbleX = igrisX + 200;
      bubbleY = igrisY - 50;
    }
    
    // S'assurer que la bulle reste dans l'écran
    bubbleX = Math.max(150, Math.min(window.innerWidth - 150, bubbleX));
    bubbleY = Math.max(50, Math.min(window.innerHeight - 100, bubbleY));
    
    return { x: bubbleX, y: bubbleY };
  };

  const bubblePosition = getBubblePosition();

  return (
    <div className="igris-tutorial-overlay" ref={overlayRef}>
      {/* Fond sombre qui bloque les clics */}
      <div className="tutorial-backdrop" />
      
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

      {/* Bulle de dialogue avec fade in/out */}
 {tutorialSteps[currentStep] && showMessage && !isClosing && (
  <div className="tutorial-bubble-container">
    <ChibiBubble
      // 🎯 IMPORTANT: Utiliser l'ID de l'étape au lieu de l'index
      key={`bubble-${tutorialSteps[currentStep].id}`}
      entityType={tutorialSteps[currentStep].speaker || 'igris'}
      message={tutorialSteps[currentStep].message}
      isMobile={window.innerWidth < 768}
      position={bubblePosition}
      onComplete={() => {
        setIsTextAnimating(false);
        console.log('✅ Animation terminée pour:', tutorialSteps[currentStep].id);
      }}
    />
  </div>
)}

      {/* Contrôles de navigation */}
      <div className="tutorial-controls">
        <button 
  onClick={nextStep}
  disabled={!canProgress || isTextAnimating}
  className="control-button control-next"
>
  {currentStep === tutorialSteps.length - 1 ? 'Terminer ✓' : 'Suivant →'}
</button>
        
        <div className="step-indicator">
          <span className="current-step">{currentStep + 1}</span>
          <span className="separator">/</span>
          <span className="total-steps">{tutorialSteps.length}</span>
        </div>
        
        <button 
          onClick={nextStep}
          className="control-button control-next"
        >
          {currentStep === tutorialSteps.length - 1 ? 'Terminer ✓' : 'Suivant →'}
        </button>
        
        <button 
          onClick={onClose}
          className="control-button control-skip"
        >
          Passer ✕
        </button>
      </div>
    </div>
  );
};

export default IgrisTutorial;