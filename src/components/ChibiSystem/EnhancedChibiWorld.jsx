// 🎮 ENHANCED CHIBI WORLD
// Système ChibiWorld amélioré avec progression, humeurs et interactions
// Par Kaisel 🐉 pour le Monarque des Ombres

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ChibiFactory, 
  ChibiInteractionManager,
  CHIBI_RARITIES,
  CHIBI_MOODS,
  UNLOCK_METHODS 
} from './ChibiDatabaseStructure';
import ChibiCanvas from './ChibiCanvas';
import ChibiInventory from './ChibiInventory';
import ChibiGacha from './ChibiGacha';
import ChibiDetailModal from './ChibiDetailModal';
import ChibiBubble from '../ChibiBubble';
import { Link } from 'react-router-dom';
import './ChibiWorld.css';

const EnhancedChibiWorld = () => {
  const { t } = useTranslation();
  
  // 🎮 États principaux
  const [worldData, setWorldData] = useState({
    background: 'https://api.builderberu.com/cdn/images/BuilderBeru_enclos_wgtjm5.webp',
    name: 'BuilderBeru Sanctuary',
    maxChibis: 5,
    level: 1,
    exp: 0
  });
  
  // 💰 Ressources
  const [resources, setResources] = useState({
    shadowCoins: 1000,
    moonStones: 0,
    starFragments: 0
  });
  
  // 🎯 Progression
  const [playerStats, setPlayerStats] = useState({
    totalChibis: 0,
    uniqueChibis: 0,
    totalAffinity: 0,
    currentStreak: 0,
    longestStreak: 0,
    achievements: [],
    easterEggsFound: []
  });
  
  // 🐾 Chibis
  const [ownedChibis, setOwnedChibis] = useState({});
  const [activeChibis, setActiveChibis] = useState([]);
  const [selectedChibi, setSelectedChibi] = useState(null);
  
  // 🎨 UI States
  const [showGacha, setShowGacha] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showChibiDetail, setShowChibiDetail] = useState(false);
  const [chibiMessage, setChibiMessage] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  // 📦 Managers
  const chibiFactoryRef = useRef(null);
  const interactionManagerRef = useRef(null);
  const saveTimerRef = useRef(null);
  
  // 🚀 INITIALISATION
  useEffect(() => {
    // Charger la base de données des chibis
    import('./ChibiDatabase').then(module => {
      chibiFactoryRef.current = new ChibiFactory(module.CHIBI_DATABASE);
      interactionManagerRef.current = new ChibiInteractionManager();
      
      // Charger les données sauvegardées
      loadGameData();
      
      // Vérifier les chibis débloquables
      checkUnlockableChibis();
    });
    
    // Auto-save toutes les 30 secondes
    saveTimerRef.current = setInterval(() => {
      saveGameData();
    }, 30000);
    
    return () => {
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current);
      }
      saveGameData();
    };
  }, []);
  
  // 💾 CHARGER LES DONNÉES
  const loadGameData = () => {
    const storedData = localStorage.getItem('builderberu_users');
    if (!storedData) return;
    
    try {
      const data = JSON.parse(storedData);
      const userData = data.user?.accounts?.[Object.keys(data.user.accounts)[0]];
      
      if (userData?.chibiWorld) {
        const chibiData = userData.chibiWorld;
        
        // Charger les ressources
        if (chibiData.resources) {
          setResources(chibiData.resources);
        }
        
        // Charger les stats
        if (chibiData.playerStats) {
          setPlayerStats(chibiData.playerStats);
        }
        
        // Charger les chibis possédés
        if (chibiData.ownedChibis && chibiFactoryRef.current) {
          const loadedChibis = {};
          
          for (const [id, savedState] of Object.entries(chibiData.ownedChibis)) {
            const chibi = chibiFactoryRef.current.createChibi(id, savedState);
            if (chibi) {
              loadedChibis[id] = chibi;
            }
          }
          
          setOwnedChibis(loadedChibis);
        }
        
        // Charger les chibis actifs
        if (chibiData.activeChibis) {
          setActiveChibis(chibiData.activeChibis);
        }
        
        // Charger le monde
        if (chibiData.worldData) {
          setWorldData(prev => ({ ...prev, ...chibiData.worldData }));
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };
  
  // 💾 SAUVEGARDER LES DONNÉES
  const saveGameData = () => {
    const storedData = localStorage.getItem('builderberu_users');
    const data = storedData ? JSON.parse(storedData) : { user: { accounts: {} } };
    
    const accountKey = Object.keys(data.user.accounts)[0] || 'default';
    
    if (!data.user.accounts[accountKey]) {
      data.user.accounts[accountKey] = {};
    }
    
    // Convertir les chibis en format sauvegardable
    const savedChibis = {};
    for (const [id, chibi] of Object.entries(ownedChibis)) {
      savedChibis[id] = chibi.toJSON();
    }
    
    data.user.accounts[accountKey].chibiWorld = {
      resources,
      playerStats,
      ownedChibis: savedChibis,
      activeChibis,
      worldData,
      lastSave: Date.now()
    };
    
    localStorage.setItem('builderberu_users', JSON.stringify(data));
  };
  
  // 🔓 VÉRIFIER LES CHIBIS DÉBLOQUABLES
  const checkUnlockableChibis = () => {
    if (!chibiFactoryRef.current) return;
    
    const conditions = {
      streak: playerStats.currentStreak,
      achievements: playerStats.achievements,
      easterEggs: playerStats.easterEggsFound
    };
    
    const unlockable = chibiFactoryRef.current.getUnlockableChibis(conditions);
    
    // Débloquer automatiquement les chibis éligibles
    unlockable.forEach(chibiId => {
      if (!ownedChibis[chibiId]) {
        unlockChibi(chibiId);
      }
    });
  };
  
  // 🎁 DÉBLOQUER UN CHIBI
  const unlockChibi = (chibiId, source = 'achievement') => {
    if (ownedChibis[chibiId]) return;
    
    const chibi = chibiFactoryRef.current.createChibi(chibiId);
    if (!chibi) return;
    
    setOwnedChibis(prev => ({ ...prev, [chibiId]: chibi }));
    
    addNotification({
      type: 'unlock',
      title: t('chibi.unlocked', 'Nouveau Chibi débloqué !'),
      message: `${chibi.name} a rejoint votre collection !`,
      rarity: chibi.rarity,
      icon: chibi.sprites.idle
    });
    
    // Statistiques
    setPlayerStats(prev => ({
      ...prev,
      totalChibis: prev.totalChibis + 1,
      uniqueChibis: Object.keys(ownedChibis).length + 1
    }));
    
    // Si c'est le premier chibi, l'activer automatiquement
    if (activeChibis.length === 0) {
      setActiveChibis([chibiId]);
    }
  };
  
  // 🎰 GACHA PULL
  const handleGachaPull = () => {
    if (resources.shadowCoins < 100) {
      addNotification({
        type: 'error',
        message: t('chibi.insufficient_coins', 'Pas assez de Shadow Coins !')
      });
      return;
    }
    
    // Déduire le coût
    setResources(prev => ({ ...prev, shadowCoins: prev.shadowCoins - 100 }));
    
    // Tirer un chibi
    const pulledChibi = chibiFactoryRef.current.getRandomChibiForPull();
    if (!pulledChibi) return;
    
    // Si déjà possédé, convertir en fragments
    if (ownedChibis[pulledChibi.id]) {
      const fragments = CHIBI_RARITIES[pulledChibi.rarity.toUpperCase()].affinityBonus * 2;
      setResources(prev => ({ ...prev, starFragments: prev.starFragments + fragments }));
      
      return {
        duplicate: true,
        chibi: pulledChibi,
        fragments
      };
    } else {
      unlockChibi(pulledChibi.id, 'gacha');
      return {
        duplicate: false,
        chibi: pulledChibi
      };
    }
  };
  
  // 🤝 INTERACTION AVEC UN CHIBI
  const handleChibiInteraction = (chibiId, interactionType) => {
    const chibi = ownedChibis[chibiId];
    if (!chibi || !interactionManagerRef.current) return;
    
    const result = interactionManagerRef.current.interact(chibi, interactionType);
    
    if (result.success) {
      // Afficher le message si applicable
      if (result.results.message) {
        setChibiMessage({
          text: result.results.message,
          position: getChibiPosition(chibiId),
          chibiType: chibi.id.split('_')[0]
        });
      }
      
      // Gérer les récompenses
      result.results.rewards.forEach(reward => {
        handleReward(reward, chibi);
      });
      
      // Mettre à jour l'état
      setOwnedChibis(prev => ({ ...prev, [chibiId]: chibi }));
      
      // Stats globales
      if (result.results.affinityGained > 0) {
        setPlayerStats(prev => ({
          ...prev,
          totalAffinity: prev.totalAffinity + result.results.affinityGained
        }));
      }
    } else if (result.reason === 'cooldown') {
      const remaining = Math.ceil(result.timeRemaining / 1000);
      addNotification({
        type: 'warning',
        message: t('chibi.cooldown', `Attendez encore ${remaining}s`)
      });
    }
  };
  
  // 🎁 GÉRER LES RÉCOMPENSES
  const handleReward = (reward, chibi) => {
    switch (reward.type) {
      case 'level_up':
        addNotification({
          type: 'success',
          title: 'Level Up!',
          message: `${chibi.name} est maintenant niveau ${reward.value} !`
        });
        break;
        
      case 'chapter':
        addNotification({
          type: 'lore',
          title: 'Nouveau chapitre débloqué !',
          message: `Chapitre ${reward.value + 1} de l'histoire de ${chibi.name}`
        });
        break;
        
      case 'milestone':
        const milestoneRewards = {
          10: 5,
          25: 10,
          50: 20,
          75: 30,
          100: 50,
          150: 75,
          200: 100
        };
        
        const moonStones = milestoneRewards[reward.milestone] || 0;
        setResources(prev => ({ ...prev, moonStones: prev.moonStones + moonStones }));
        
        addNotification({
          type: 'milestone',
          title: `Affinité ${reward.milestone} !`,
          message: `${chibi.name} vous fait vraiment confiance ! +${moonStones} Pierres de Lune`
        });
        break;
    }
  };
  
  // 📍 OBTENIR LA POSITION D'UN CHIBI
  const getChibiPosition = (chibiId) => {
    // À implémenter avec le système de canvas
    return { x: window.innerWidth / 2, y: 100 };
  };
  
  // 📢 AJOUTER UNE NOTIFICATION
  const addNotification = (notification) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { ...notification, id }]);
    
    // Auto-suppression après 5 secondes
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };
  
  // 🎮 ACTIVER/DÉSACTIVER UN CHIBI
  const toggleActiveChibi = (chibiId) => {
    if (activeChibis.includes(chibiId)) {
      // Retirer
      setActiveChibis(prev => prev.filter(id => id !== chibiId));
    } else if (activeChibis.length < worldData.maxChibis) {
      // Ajouter
      setActiveChibis(prev => [...prev, chibiId]);
    } else {
      addNotification({
        type: 'warning',
        message: t('chibi.max_active', `Maximum ${worldData.maxChibis} chibis actifs !`)
      });
    }
  };
  
  // 🏠 AMÉLIORER L'ENCLOS
  const upgradeWorld = () => {
    const upgradeCost = worldData.level * 500;
    
    if (resources.shadowCoins >= upgradeCost) {
      setResources(prev => ({ ...prev, shadowCoins: prev.shadowCoins - upgradeCost }));
      setWorldData(prev => ({
        ...prev,
        level: prev.level + 1,
        maxChibis: prev.maxChibis + 1
      }));
      
      addNotification({
        type: 'success',
        title: 'Enclos amélioré !',
        message: `Vous pouvez maintenant avoir ${worldData.maxChibis + 1} chibis actifs !`
      });
    }
  };
  
  // 🎯 EASTER EGGS
  const checkEasterEgg = (action) => {
    const easterEggs = {
      'konami_code': 'beru_papillon',
      'click_30_times': 'tank_golden',
      'feed_100_times': 'hungry_shadow',
      'streak_365': 'eternal_guardian'
    };
    
    if (easterEggs[action] && !playerStats.easterEggsFound.includes(action)) {
      setPlayerStats(prev => ({
        ...prev,
        easterEggsFound: [...prev.easterEggsFound, action]
      }));
      
      // Débloquer le chibi correspondant
      unlockChibi(easterEggs[action], 'easter_egg');
      
      addNotification({
        type: 'easter_egg',
        title: '🥚 Easter Egg découvert !',
        message: 'Vous avez trouvé un secret caché !'
      });
    }
  };
  
  return (
    <div className="chibi-world-container enhanced">
      {/* 🔙 Bouton retour */}
      <Link to="/" className="back-button">
        <button className="absolute top-4 left-4 z-50 flex items-center gap-2 
                 px-4 py-2 bg-purple-900/50 border border-purple-500 
                 rounded-lg hover:bg-purple-800/50 transition-colors">
          <span>←</span>
          <span>{t('common.back', 'Retour')}</span>
        </button>
      </Link>
      
      {/* 📊 Header amélioré */}
      <div className="chibi-header enhanced">
        {/* Ressources */}
        <div className="resources-display">
          <div className="resource-item">
            <span className="resource-icon">🪙</span>
            <span className="resource-value">{resources.shadowCoins}</span>
          </div>
          <div className="resource-item">
            <span className="resource-icon">🌙</span>
            <span className="resource-value">{resources.moonStones}</span>
          </div>
          <div className="resource-item">
            <span className="resource-icon">⭐</span>
            <span className="resource-value">{resources.starFragments}</span>
          </div>
        </div>
        
        {/* Stats */}
        <div className="player-stats">
          <div className="stat-item">
            <span className="stat-icon">🔥</span>
            <span className="stat-value">{playerStats.currentStreak}</span>
            <span className="stat-label">{t('chibi.streak', 'Jours')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🎭</span>
            <span className="stat-value">{playerStats.uniqueChibis}/{32}</span>
            <span className="stat-label">{t('chibi.collection', 'Collection')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">💕</span>
            <span className="stat-value">{playerStats.totalAffinity}</span>
            <span className="stat-label">{t('chibi.affinity', 'Affinité')}</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="header-actions">
          <button
            className="action-button gacha-button"
            onClick={() => setShowGacha(true)}
          >
            🎰 {t('chibi.summon', 'Invocation')}
          </button>
          
          <button
            className="action-button inventory-button"
            onClick={() => setShowInventory(true)}
          >
            📦 {t('chibi.inventory', 'Inventaire')}
          </button>
          
          <button
            className="action-button upgrade-button"
            onClick={upgradeWorld}
            disabled={resources.shadowCoins < worldData.level * 500}
          >
            🏠 {t('chibi.upgrade', 'Améliorer')} ({worldData.level * 500} 🪙)
          </button>
        </div>
      </div>
      
      {/* 🗺️ Canvas principal */}
      <ChibiCanvas
        worldData={worldData}
        activeChibis={activeChibis.map(id => ownedChibis[id]).filter(Boolean)}
        onChibiClick={(chibi, position) => {
          setSelectedChibi(chibi);
          setShowChibiDetail(true);
        }}
        onInteraction={handleChibiInteraction}
      />
      
      {/* 📦 Inventaire amélioré */}
      {showInventory && (
        <ChibiInventory
          ownedChibis={ownedChibis}
          activeChibis={activeChibis}
          maxActive={worldData.maxChibis}
          onToggleActive={toggleActiveChibi}
          onSelectChibi={(chibi) => {
            setSelectedChibi(chibi);
            setShowChibiDetail(true);
            setShowInventory(false);
          }}
          onClose={() => setShowInventory(false)}
          resources={resources}
        />
      )}
      
      {/* 🎰 Système de Gacha amélioré */}
      {showGacha && (
        <ChibiGacha
          shadowCoins={resources.shadowCoins}
          onClose={() => setShowGacha(false)}
          onPull={handleGachaPull}
          ownedChibis={Object.keys(ownedChibis)}
        />
      )}
      
      {/* 📜 Modal de détail du Chibi */}
      {showChibiDetail && selectedChibi && (
        <ChibiDetailModal
          chibi={selectedChibi}
          onClose={() => {
            setShowChibiDetail(false);
            setSelectedChibi(null);
          }}
          onInteract={(type) => handleChibiInteraction(selectedChibi.id, type)}
          resources={resources}
        />
      )}
      
      {/* 💬 Messages des Chibis */}
      {chibiMessage && (
        <ChibiBubble
          message={chibiMessage.text}
          position={chibiMessage.position}
          entityType={chibiMessage.chibiType}
          isMobile={window.innerWidth < 768}
          onClose={() => setChibiMessage(null)}
        />
      )}
      
      {/* 📢 Notifications */}
      <div className="notifications-container">
        {notifications.map(notif => (
          <div 
            key={notif.id} 
            className={`notification ${notif.type}`}
            style={{
              borderColor: notif.rarity ? CHIBI_RARITIES[notif.rarity.toUpperCase()]?.color : undefined
            }}
          >
            {notif.icon && <img loading="lazy" src={notif.icon} alt="" className="notification-icon" />}
            <div className="notification-content">
              {notif.title && <div className="notification-title">{notif.title}</div>}
              <div className="notification-message">{notif.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnhancedChibiWorld;