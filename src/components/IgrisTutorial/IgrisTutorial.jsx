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
  const overlayRef = useRef(null);

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
        
        // Position intelligente selon la position de l'élément
        if (rect.top < window.innerHeight / 2) {
          // Élément en haut -> Igris en dessous
          newX = rect.left + rect.width / 2;
          newY = rect.bottom + 100;
        } else {
          // Élément en bas -> Igris à côté
          newX = rect.right + 150;
          newY = rect.top + rect.height / 2;
        }
        
        // Ajustements pour rester dans l'écran
        newX = Math.max(100, Math.min(window.innerWidth - 100, newX));
        newY = Math.max(100, Math.min(window.innerHeight - 100, newY));
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
      
      // Attendre la fin du mouvement + petite pause
      setTimeout(() => {
        setIsMoving(false);
        setTimeout(resolve, 500); // Pause après l'arrêt
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
    
    try {
      // Gérer les sélecteurs spéciaux avec :contains
      if (selector.includes(':contains')) {
        const match = selector.match(/(.+):contains\("(.+)"\)/);
        if (match) {
          const [, baseSelector, text] = match;
          const elements = document.querySelectorAll(baseSelector || '*');
          element = Array.from(elements).find(el => 
            el.textContent && el.textContent.includes(text)
          );
        }
      } else {
        // Sélecteur normal
        element = document.querySelector(selector);
      }
    } catch (error) {
      console.warn(`Sélecteur invalide: ${selector}`, error);
      return;
    }
    
    if (element) {
      element.classList.add('tutorial-highlight');
      element.style.position = 'relative';
      element.style.zIndex = '10001';
      moveIgrisTo(element);
      
      // Scroll pour voir l'élément
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center' 
      });
    } else {
      console.warn(`Élément non trouvé: ${selector}`);
      // Position par défaut si élément pas trouvé
      moveIgrisTo(null);
    }
  };

  // 📍 Gestion des étapes avec timing naturel
  useEffect(() => {
    const executeStep = async () => {
      const step = tutorialSteps[currentStep];
      if (!step) return;
      
      // 1️⃣ D'abord, on bouge Igris
      if (step.highlight && step.selector) {
        const element = document.querySelector(step.selector);
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
      
      // 3️⃣ Maintenant on peut afficher le message (sauf si c'est une pause)
      if (!step.skipBubble) {
        setShowMessage(true);
      }
      
      // 4️⃣ Exécuter l'action si définie (après un délai)
      if (step.action && typeof step.action === 'function') {
        setTimeout(() => {
          step.action();
        }, 1500);
      }
      
      // 5️⃣ Auto-progression avec le bon timing
      if (step.autoNext) {
        const timer = setTimeout(() => {
          setShowMessage(false); // Cacher le message avant de passer
          setTimeout(nextStep, 300); // Petite transition
        }, step.duration || 3000);
        
        return () => clearTimeout(timer);
      }
      
      // 6️⃣ Attendre un clic si spécifié
      if (step.waitForClick && step.selector) {
        const handleClick = () => {
          setShowMessage(false);
          setTimeout(nextStep, 300);
        };
        
        const checkElement = setInterval(() => {
          const element = document.querySelector(step.selector);
          if (element) {
            element.addEventListener('click', handleClick);
            clearInterval(checkElement);
          }
        }, 100);
        
        return () => {
          clearInterval(checkElement);
          const element = document.querySelector(step.selector);
          if (element) {
            element.removeEventListener('click', handleClick);
          }
        };
      }
    };
    
    executeStep();
  }, [currentStep]);

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
    
    const element = document.querySelector(step.selector);
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
      {/* Bulle de dialogue avec fade in/out */}
{tutorialSteps[currentStep] && showMessage && (
  <ChibiBubble
    key={`igris-bubble-${currentStep}`}
    entityType={tutorialSteps[currentStep].speaker || 'igris'}
    message={tutorialSteps[currentStep].message}
    isMobile={window.innerWidth < 768}
    position={bubblePosition}
  />
)}

      {/* Contrôles de navigation */}
      <div className="tutorial-controls">
        <button 
          onClick={prevStep}
          disabled={currentStep === 0}
          className="control-button control-prev"
        >
          ← Retour
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