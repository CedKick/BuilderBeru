import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ChibiBubble from '../ChibiBubble';
import { tutorialSteps } from './tutorialSteps';
import './IgrisTutorial.css';

// 🖼️ URLs Cloudinary pour Igris
const IGRIS_IMAGES = {
  up: 'https://api.builderberu.com/cdn/images/igris_up_hfonzn.webp',
  down: 'https://api.builderberu.com/cdn/images/igris_face_xj5mqo.webp',
  left: 'https://api.builderberu.com/cdn/images/igris_left_cw3w5g.webp',
  right: 'https://api.builderberu.com/cdn/images/igris_right_jmyupb.webp',
  icon: 'https://api.builderberu.com/cdn/images/igris_face_xj5mqo.webp'
};

// 🎭 URLs Cloudinary pour Igrisk (Tank déguisé en Igris)
const IGRISK_IMAGES = {
  up: 'https://api.builderberu.com/cdn/images/igrisk_up_dwtvy9.webp',
  down: 'https://api.builderberu.com/cdn/images/igrisk_face_qpf9mh.webp',
  left: 'https://api.builderberu.com/cdn/images/igrisk_left_jd9cad.webp',
  right: 'https://api.builderberu.com/cdn/images/igrisk_right_i4hlil.webp',
  icon: 'https://api.builderberu.com/cdn/images/igrisk_icon_vytfic.webp'
};

const IgrisTutorial = ({ onClose, selectedCharacter, characters, showTankMessage }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(-1); // -1 pour commencer avec la notification système
  const [igrisPosition, setIgrisPosition] = useState({ 
    x: window.innerWidth / 2, 
    y: window.innerHeight / 2 
  });
  const [igrisDirection, setIgrisDirection] = useState('down');
  const [isMoving, setIsMoving] = useState(false);
  const [showSystemNotification, setShowSystemNotification] = useState(true);
  const [showPunishment, setShowPunishment] = useState(false);
  const [isIgrisk, setIsIgrisk] = useState(false); // 🎭 ÉTAT POUR IGRISK
  
  const overlayRef = useRef(null);

  // 🎭 Déterminer si c'est Igrisk au début
  useEffect(() => {
    if (tutorialSteps.length > 0 && tutorialSteps[0].speaker === 'igrisk') {
      setIsIgrisk(true);
      
      if (window.umami) {
        window.umami.track('tutorial-igrisk-activated', {
          source: 'igris_tutorial',
          special_event: 'tank_disguised_as_igris',
          rarity: '5_percent'
        });
      }
    }
  }, []);

  // 🎮 Fonction pour accepter le tutoriel
  const acceptTutorial = () => {
    setShowSystemNotification(false);
    setCurrentStep(0);
  };

  // 💀 Fonction pour refuser (PUNITION!)
  const declineTutorial = () => {
    setShowSystemNotification(false);
    setShowPunishment(true);
    
    setTimeout(() => {
      showTankMessage && showTankMessage(t('tutorial.system.system_declined'), true);
      
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
        newX = window.innerWidth / 2;
        newY = window.innerHeight / 2;
      } else {
        const rect = targetElement.getBoundingClientRect();
        const elementCenterX = rect.left + rect.width / 2;
        const elementCenterY = rect.top + rect.height / 2;
        
        if (rect.top < window.innerHeight / 3) {
          newX = elementCenterX;
          newY = rect.bottom + 150;
        } else if (rect.bottom > window.innerHeight * 2/3) {
          newX = elementCenterX;
          newY = rect.top - 100;
        } else {
          if (rect.left > window.innerWidth / 2) {
            newX = rect.left - 150;
          } else {
            newX = rect.right + 150;
          }
          newY = elementCenterY;
        }
        
        const padding = 100;
        newX = Math.max(padding, Math.min(window.innerWidth - padding, newX));
        newY = Math.max(padding, Math.min(window.innerHeight - padding, newY));
      }
      
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
  const highlightElement = (selector, specialClass = null) => {
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight', 'diamond-button', 'reset-button', 'save-button');
      el.style.position = '';
      el.style.zIndex = '';
      el.removeAttribute('data-proc-button');
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
      
      if (specialClass) {
        element.classList.add(specialClass);
      }
      
      if (element.textContent === '+' && element.tagName === 'BUTTON') {
        element.setAttribute('data-proc-button', 'true');
      }
      
      if (!element.style.position || element.style.position === 'static') {
        element.style.position = 'relative';
      }
      
      element.style.zIndex = '10001';
      
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center' 
      });
      
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
    if (currentStep < 0) return;
    
    const executeStep = async () => {
      const step = tutorialSteps[currentStep];
      if (!step) return;
      
      if (step.highlight && step.selector) {
        const element = typeof step.selector === 'function' 
          ? step.selector()
          : document.querySelector(step.selector);
          
        if (element) {
          await moveIgrisTo(element);
          await new Promise(resolve => setTimeout(resolve, 300));
          
          let specialClass = null;
          if (step.id.includes('diamond')) specialClass = 'diamond-button';
          else if (step.id.includes('reset')) specialClass = 'reset-button';
          else if (step.id.includes('save')) specialClass = 'save-button';
          
          highlightElement(step.selector, specialClass);
        }
      } else if (!step.selector) {
        await moveIgrisTo(null, step.customPosition);
      }
      
      if (step.waitForElement) {
        const element = await waitForElement(step.waitForElement);
        if (element) {
        }
      }
      
      if (step.action && typeof step.action === 'function') {
        setTimeout(() => {
          step.action();
        }, 1500);
      }
      
      if (step.waitForClick && step.selector) {
        
        const element = typeof step.selector === 'function' 
          ? step.selector()
          : document.querySelector(step.selector);
          
        if (element) {
          const handleClick = () => {
            element.removeEventListener('click', handleClick);
            
            if (step.onElementClick) {
              step.onElementClick();
            }
            
            setTimeout(() => nextStep(), 500);
          };
          
          element.addEventListener('click', handleClick);
          
          return () => {
            element.removeEventListener('click', handleClick);
          };
        }
      }
      
      if (step.autoNext && step.duration && !step.waitForClick) {
        const timer = setTimeout(() => {
          nextStep();
        }, step.duration);
        
        return () => clearTimeout(timer);
      }
    };
    
    const cleanup = executeStep();
    
    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [currentStep]);

  // 📍 Hook pour gérer le resize
  useEffect(() => {
    const handleResize = () => {
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
        el.classList.remove('tutorial-highlight', 'diamond-button', 'reset-button', 'save-button');
        el.style.position = '';
        el.style.zIndex = '';
        el.removeAttribute('data-proc-button');
      });
      document.body.style.filter = '';
      
      delete window.selectedHunterForTutorial;
      delete window.tutorialProcsComplete;
    };
  }, []);

  // ⏭️ Navigation
  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      showTankMessage && showTankMessage(t('tutorial.system.quest_completed'), true);
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getBubblePosition = () => {
    return {
      x: igrisPosition.x,
      y: igrisPosition.y - 100
    };
  };

  const currentStepData = tutorialSteps[currentStep];
  const bubblePosition = getBubblePosition();
  
  // 🎭 Choisir les bonnes images selon si c'est Igrisk ou Igris
  const currentImages = isIgrisk ? IGRISK_IMAGES : IGRIS_IMAGES;

  return (
    <div className="igris-tutorial-overlay" ref={overlayRef}>
      {/* Fond sombre */}
      <div className="tutorial-backdrop" />
      
      {/* 🎮 NOTIFICATION SYSTÈME INITIALE */}
      {showSystemNotification && (
        <div className="tutorial-system-notification">
          <div className="notification-header">
            <div className="notification-icon" />
            <h2 className="notification-title">{t('tutorial.system.notification_title')}</h2>
          </div>
          
          <div className="notification-message">
            {t('tutorial.system.notification_message_line1')} <span className="warning-text">{t('tutorial.system.notification_message_line2')}</span>
            <br />
            {t('tutorial.system.notification_message_line3')}
            <br /><br />
            <strong>{t('tutorial.system.notification_question')}</strong>
          </div>
          
          <div className="notification-buttons">
            <button 
              className="system-button accept-button"
              onClick={acceptTutorial}
              type="button"
            >
              {t('tutorial.system.yes_button')}
            </button>
            <button 
              className="system-button decline-button"
              onClick={declineTutorial}
              type="button"
            >
              {t('tutorial.system.no_button')}
            </button>
          </div>
        </div>
      )}
      
      {/* 💀 ÉCRAN DE PUNITION */}
      {showPunishment && (
        <div className="punishment-overlay">
          <div className="punishment-message">
            {t('tutorial.system.punishment_applied')}
          </div>
        </div>
      )}
      
      {/* Le reste du tutoriel (uniquement si accepté) */}
      {currentStep >= 0 && (
        <>
          {/* Igris/Igrisk sur Cerbère */}
          <div 
            className={`igris-sprite ${isMoving ? 'igris-moving' : ''} ${isIgrisk ? 'igrisk-mode' : ''}`}
            style={{
              left: `${igrisPosition.x}px`,
              top: `${igrisPosition.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <img loading="lazy" 
              src={currentImages[igrisDirection]} 
              alt={isIgrisk ? "Igrisk sur Cerbère" : "Igris sur Cerbère"}
              width="100"
              height="100"
              className={`igris-image ${isIgrisk ? 'igrisk-image' : ''}`}
            />
            {/* 🎭 Badge "FAKE" si c'est Igrisk */}
            {isIgrisk && (
              <div className="igrisk-badge">FAKE</div>
            )}
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
              <span className="step-label">{t('tutorial.system.step_label')}</span>
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
              {t('tutorial.system.back_button')}
            </button>
            
            <button 
              onClick={nextStep}
              className="control-button control-next"
              type="button"
            >
              {currentStep === tutorialSteps.length - 1 
                ? t('tutorial.system.finish_button') 
                : t('tutorial.system.next_button')}
            </button>
            
            <button 
              onClick={() => {
                if (window.confirm(t('tutorial.system.abandon_warning'))) {
                  showTankMessage && showTankMessage(t('tutorial.system.tutorial_abandoned'), true);
                  onClose();
                }
              }}
              className="control-button control-skip"
              title={t('tutorial.system.skip_tooltip')}
              type="button"
            >
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default IgrisTutorial;