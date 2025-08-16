// 🎮 CHIBI SYSTEM COMPONENT
// Composant React pour intégrer le système Chibi dans BuilderBeru
// Par Kaisel 🐉 pour le Monarque des Ombres

import React, { useEffect, useRef, useCallback } from 'react';
import EnhancedChibiManager from './EnhancedChibiManager';
import { CHIBI_SPRITES } from './ChibiSpritesConfig';
import { useTranslation } from 'react-i18next';
import './ChibiSystem.css';

const ChibiSystemComponent = ({ 
  onChibiMessage, 
  selectedCharacter, 
  isTutorialActive = false,
  enabledChibis = ['tank', 'beru', 'kaisel'],
  customPhrases = {}
}) => {
  const { t } = useTranslation();
  const managerRef = useRef(null);
  const cleanupRef = useRef(null);

  // 🎯 CALLBACKS POUR LE MANAGER
  const callbacks = {
    showMessage: onChibiMessage,
    lastMessage: ''
  };

  // 🚀 INITIALISATION DU SYSTÈME
  useEffect(() => {
    // Créer le manager
    const manager = new EnhancedChibiManager();
    managerRef.current = manager;

    // Initialiser avec les canvas
    const canvasIds = ['canvas-left', 'canvas-center', 'canvas-right'];
    manager.init(canvasIds, callbacks);

    // Spawner les chibis activés
    setTimeout(() => {
      enabledChibis.forEach((chibiId, index) => {
        setTimeout(() => {
          const chibiConfig = CHIBI_SPRITES[chibiId];
          if (chibiConfig) {
            // Phrases personnalisées ou traduction
            const phrases = customPhrases[chibiId] || 
                          t(`shadowEntities.${chibiId}.automaticPhrases`, { returnObjects: true });
            
            manager.spawnEntity(chibiId, { phrases });
          }
        }, index * 1000); // Spawn progressif
      });
    }, 500);

    // Setup contrôles clavier
    const keyboardCleanup = manager.setupKeyboardControls();
    cleanupRef.current = keyboardCleanup;

    // Exposer globalement pour debug/intégration
    window.chibiManager = manager;
    
    // API pour obtenir la position des chibis
    window.getChibiPosition = (chibiId) => {
      return manager.getEntityPosition(chibiId);
    };

    // Cleanup
    return () => {
      if (managerRef.current) {
        managerRef.current.cleanup();
      }
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      delete window.chibiManager;
      delete window.getChibiPosition;
    };
  }, [enabledChibis, t, onChibiMessage]);

  // 🎮 MISE À JOUR DU MODE TUTORIEL
  useEffect(() => {
    if (managerRef.current) {
      managerRef.current.setTutorialMode(isTutorialActive);
    }
  }, [isTutorialActive]);

  // 🎯 API EXPOSÉE
  useEffect(() => {
    // Fonction pour faire parler un chibi spécifique
    window.makeChibiSpeak = (chibiId, message) => {
      if (managerRef.current) {
        managerRef.current.makeEntitySpeak(chibiId, message);
      }
    };

    // Fonction pour changer l'état d'un chibi
    window.setChibiState = (chibiId, state) => {
      if (managerRef.current) {
        managerRef.current.setEntityState(chibiId, state);
      }
    };

    // Fonction pour spawner un nouveau chibi
    window.spawnChibi = (chibiId) => {
      if (managerRef.current && CHIBI_SPRITES[chibiId]) {
        const phrases = t(`shadowEntities.${chibiId}.automaticPhrases`, { returnObjects: true });
        managerRef.current.spawnEntity(chibiId, { phrases });
      }
    };

    return () => {
      delete window.makeChibiSpeak;
      delete window.setChibiState;
      delete window.spawnChibi;
    };
  }, [t]);

  // 🎨 RENDU DES CANVAS
  return (
    <div className="chibi-system-container">
      {/* Canvas pour les chibis */}
      <canvas 
        id="canvas-left" 
        className="chibi-canvas chibi-canvas-left"
        width="300"
        height="200"
      />
      <canvas 
        id="canvas-center" 
        className="chibi-canvas chibi-canvas-center"
        width="400"
        height="200"
      />
      <canvas 
        id="canvas-right" 
        className="chibi-canvas chibi-canvas-right"
        width="300"
        height="200"
      />
      
      {/* Indicateur de mode tutoriel */}
      {isTutorialActive && (
        <div className="chibi-tutorial-indicator">
          🎓 Mode Tutoriel Actif - Les chibis sont silencieux
        </div>
      )}
      
      {/* Menu de debug (dev only) */}
      {process.env.NODE_ENV === 'development' && (
        <ChibiDebugMenu manager={managerRef.current} />
      )}
    </div>
  );
};

// 🔧 MENU DE DEBUG (DEV SEULEMENT)
const ChibiDebugMenu = ({ manager }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const availableChibis = Object.keys(CHIBI_SPRITES);
  const spawnedChibis = manager ? Array.from(manager.entities.keys()) : [];
  const unspawnedChibis = availableChibis.filter(id => !spawnedChibis.includes(id));

  return (
    <div className="chibi-debug-menu">
      <button 
        className="chibi-debug-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        🔧 Debug Chibi
      </button>
      
      {isOpen && (
        <div className="chibi-debug-panel">
          <h4>🎮 Chibi System Debug</h4>
          
          <div className="debug-section">
            <h5>Spawned Chibis ({spawnedChibis.length})</h5>
            {spawnedChibis.map(id => (
              <div key={id} className="debug-chibi-item">
                <span>{CHIBI_SPRITES[id].name}</span>
                <button onClick={() => window.makeChibiSpeak(id, "Test message!")}>
                  💬 Parler
                </button>
                <button onClick={() => window.setChibiState(id, 'analyzing')}>
                  🎯 État
                </button>
              </div>
            ))}
          </div>
          
          <div className="debug-section">
            <h5>Available Chibis</h5>
            {unspawnedChibis.map(id => (
              <div key={id} className="debug-chibi-item">
                <span>{CHIBI_SPRITES[id].name}</span>
                <button onClick={() => window.spawnChibi(id)}>
                  ➕ Spawn
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 🌟 HOOK CUSTOM POUR UTILISER LE SYSTÈME CHIBI
export const useChibiSystem = () => {
  const makeChibiSpeak = useCallback((chibiId, message) => {
    if (window.makeChibiSpeak) {
      window.makeChibiSpeak(chibiId, message);
    }
  }, []);

  const setChibiState = useCallback((chibiId, state) => {
    if (window.setChibiState) {
      window.setChibiState(chibiId, state);
    }
  }, []);

  const getChibiPosition = useCallback((chibiId) => {
    if (window.getChibiPosition) {
      return window.getChibiPosition(chibiId);
    }
    return null;
  }, []);

  const spawnChibi = useCallback((chibiId) => {
    if (window.spawnChibi) {
      window.spawnChibi(chibiId);
    }
  }, []);

  return {
    makeChibiSpeak,
    setChibiState,
    getChibiPosition,
    spawnChibi
  };
};

export default ChibiSystemComponent;