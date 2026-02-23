// 🎭 CHIBI DETAIL MODAL
// Modal pour afficher les détails d'un chibi et permettre les interactions
// Par Kaisel 🐉 pour le Monarque des Ombres

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CHIBI_RARITIES, CHIBI_MOODS } from './ChibiDatabaseStructure';
import './ChibiDetailModal.css';

const ChibiDetailModal = ({ chibi, onClose, onInteract, resources }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('stats');
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [interactionCooldowns, setInteractionCooldowns] = useState({});
  
  // Calculer les cooldowns
  useEffect(() => {
    const cooldowns = {
      FEED: 60000,
      PLAY: 300000,
      GIFT: 86400000
    };
    
    const newCooldowns = {};
    Object.entries(cooldowns).forEach(([type, duration]) => {
      const lastInteraction = localStorage.getItem(`chibi_interaction_${chibi.id}_${type}`);
      if (lastInteraction) {
        const timeRemaining = duration - (Date.now() - parseInt(lastInteraction));
        if (timeRemaining > 0) {
          newCooldowns[type] = timeRemaining;
        }
      }
    });
    
    setInteractionCooldowns(newCooldowns);
    
    // Update cooldowns every second
    const interval = setInterval(() => {
      setInteractionCooldowns(prev => {
        const updated = {};
        Object.entries(prev).forEach(([type, time]) => {
          const newTime = time - 1000;
          if (newTime > 0) {
            updated[type] = newTime;
          }
        });
        return updated;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [chibi.id]);
  
  // Gérer les interactions
  const handleInteraction = (type) => {
    if (interactionCooldowns[type]) return;
    
    // Sauvegarder le timestamp
    if (['FEED', 'PLAY', 'GIFT'].includes(type)) {
      localStorage.setItem(`chibi_interaction_${chibi.id}_${type}`, Date.now());
    }
    
    onInteract(type);
  };
  
  // Formater le temps de cooldown
  const formatCooldown = (ms) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };
  
  // Obtenir la couleur de rareté
  const rarityColor = CHIBI_RARITIES[chibi.rarity.toUpperCase()]?.color || '#9CA3AF';
  
  // Calculer la progression
  const levelProgress = (chibi.experience / chibi.getRequiredXP()) * 100;
  const affinityMilestones = [10, 25, 50, 75, 100, 150, 200];
  const nextMilestone = affinityMilestones.find(m => m > chibi.affinity) || 200;
  const affinityProgress = (chibi.affinity / nextMilestone) * 100;
  
  return (
    <div className="chibi-detail-modal-overlay" onClick={onClose}>
      <div className="chibi-detail-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header" style={{ borderColor: rarityColor }}>
          <button className="close-button" onClick={onClose}>✕</button>
          
          <div className="chibi-preview">
            <div className="chibi-sprite-container">
              <div 
                className="rarity-glow" 
                style={{ backgroundColor: `${rarityColor}40` }}
              />
              <img loading="lazy" 
                src={chibi.sprites.idle || 'placeholder.png'} 
                alt={chibi.name}
                className="chibi-sprite"
              />
            </div>
            
            <div className="chibi-info">
              <h2 className="chibi-name" style={{ color: rarityColor }}>
                {chibi.name}
              </h2>
              <div className="chibi-rarity" style={{ color: rarityColor }}>
                {chibi.rarity}
              </div>
              <div className="chibi-level">
                Niveau {chibi.level}
              </div>
            </div>
          </div>
          
          {/* Humeur actuelle */}
          <div className="current-mood">
            <span className="mood-label">{t('chibi.mood', 'Humeur')}:</span>
            <span className="mood-value">
              {CHIBI_MOODS[chibi.currentMood.toUpperCase()]?.icon} {chibi.currentMood}
            </span>
          </div>
        </div>
        
        {/* Progression */}
        <div className="progression-section">
          <div className="progress-item">
            <div className="progress-header">
              <span>Niveau {chibi.level}</span>
              <span>{chibi.experience}/{chibi.getRequiredXP()} XP</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill level-progress"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
          
          <div className="progress-item">
            <div className="progress-header">
              <span>Affinité</span>
              <span>{chibi.affinity}/{nextMilestone} 💕</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill affinity-progress"
                style={{ width: `${affinityProgress}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Interactions */}
        <div className="interactions-section">
          <h3>{t('chibi.interactions', 'Interactions')}</h3>
          <div className="interaction-buttons">
            <button 
              className="interaction-button"
              onClick={() => handleInteraction('TALK')}
            >
              💬 {t('chibi.talk', 'Parler')}
            </button>
            
            <button 
              className="interaction-button"
              onClick={() => handleInteraction('PET')}
            >
              🤚 {t('chibi.pet', 'Caresser')}
            </button>
            
            <button 
              className={`interaction-button ${interactionCooldowns.FEED ? 'disabled' : ''}`}
              onClick={() => handleInteraction('FEED')}
              disabled={!!interactionCooldowns.FEED}
            >
              🍖 {t('chibi.feed', 'Nourrir')}
              {interactionCooldowns.FEED && (
                <span className="cooldown">{formatCooldown(interactionCooldowns.FEED)}</span>
              )}
            </button>
            
            <button 
              className={`interaction-button ${interactionCooldowns.PLAY ? 'disabled' : ''}`}
              onClick={() => handleInteraction('PLAY')}
              disabled={!!interactionCooldowns.PLAY}
            >
              🎮 {t('chibi.play', 'Jouer')}
              {interactionCooldowns.PLAY && (
                <span className="cooldown">{formatCooldown(interactionCooldowns.PLAY)}</span>
              )}
            </button>
            
            <button 
              className={`interaction-button ${interactionCooldowns.GIFT || resources.moonStones < 10 ? 'disabled' : ''}`}
              onClick={() => handleInteraction('GIFT')}
              disabled={!!interactionCooldowns.GIFT || resources.moonStones < 10}
            >
              🎁 {t('chibi.gift', 'Cadeau')} (10 🌙)
              {interactionCooldowns.GIFT && (
                <span className="cooldown">{formatCooldown(interactionCooldowns.GIFT)}</span>
              )}
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="modal-tabs">
          <button 
            className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 {t('chibi.stats', 'Stats')}
          </button>
          <button 
            className={`tab ${activeTab === 'lore' ? 'active' : ''}`}
            onClick={() => setActiveTab('lore')}
          >
            📜 {t('chibi.lore', 'Histoire')}
          </button>
          <button 
            className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            💬 {t('chibi.messages', 'Messages')}
          </button>
          <button 
            className={`tab ${activeTab === 'relations' ? 'active' : ''}`}
            onClick={() => setActiveTab('relations')}
          >
            🤝 {t('chibi.relations', 'Relations')}
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="tab-content">
          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="stats-content">
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-icon">⚔️</span>
                  <span className="stat-name">{t('chibi.attack', 'Attaque')}</span>
                  <span className="stat-value">{chibi.getStats().attack}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">🛡️</span>
                  <span className="stat-name">{t('chibi.defense', 'Défense')}</span>
                  <span className="stat-value">{chibi.getStats().defense}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">❤️</span>
                  <span className="stat-name">{t('chibi.hp', 'PV')}</span>
                  <span className="stat-value">{chibi.getStats().hp}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">✨</span>
                  <span className="stat-name">{t('chibi.mana', 'Mana')}</span>
                  <span className="stat-value">{chibi.getStats().mana}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">💨</span>
                  <span className="stat-name">{t('chibi.speed', 'Vitesse')}</span>
                  <span className="stat-value">{chibi.getStats().speed}</span>
                </div>
              </div>
              
              <div className="unlock-info">
                <h4>{t('chibi.unlock_method', 'Méthode de déblocage')}</h4>
                <p className="unlock-method">
                  {chibi.unlockMethod} 
                  {chibi.unlockCondition && ` - ${chibi.unlockCondition}`}
                </p>
              </div>
              
              <div className="personality-info">
                <h4>{t('chibi.personality', 'Personnalité')}</h4>
                <p className="personality-desc">
                  {chibi.personality.description || chibi.shortLore}
                </p>
              </div>
            </div>
          )}
          
          {/* Lore Tab */}
          {activeTab === 'lore' && (
            <div className="lore-content">
              <div className="lore-summary">
                <h4>{t('chibi.summary', 'Résumé')}</h4>
                <p>{chibi.shortLore}</p>
              </div>
              
              {chibi.chapters && chibi.chapters.length > 0 && (
                <div className="chapters-section">
                  <h4>{t('chibi.chapters', 'Chapitres')}</h4>
                  <div className="chapter-navigation">
                    {chibi.chapters.map((chapter, index) => (
                      <button
                        key={index}
                        className={`chapter-button ${
                          selectedChapter === index ? 'active' : ''
                        } ${
                          !chibi.unlockedChapters.includes(index) && index !== 0 ? 'locked' : ''
                        }`}
                        onClick={() => {
                          if (chibi.unlockedChapters.includes(index) || index === 0) {
                            setSelectedChapter(index);
                          }
                        }}
                      >
                        {chibi.unlockedChapters.includes(index) || index === 0 ? (
                          `Ch. ${index + 1}`
                        ) : (
                          <>🔒 Ch. {index + 1}</>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {(chibi.unlockedChapters.includes(selectedChapter) || selectedChapter === 0) && (
                    <div className="chapter-content">
                      <h5>{chibi.chapters[selectedChapter]?.title || `Chapitre ${selectedChapter + 1}`}</h5>
                      <div className="chapter-text">
                        {chibi.chapters[selectedChapter]?.content || chibi.chapters[selectedChapter]}
                      </div>
                    </div>
                  )}
                  
                  {!chibi.unlockedChapters.includes(selectedChapter) && selectedChapter !== 0 && (
                    <div className="chapter-locked">
                      <span className="lock-icon">🔒</span>
                      <p>{t('chibi.chapter_locked', 'Augmentez votre affinité pour débloquer ce chapitre')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="messages-content">
              <div className="mood-selector">
                <h4>{t('chibi.select_mood', 'Sélectionner une humeur')}</h4>
                <div className="mood-grid">
                  {Object.entries(CHIBI_MOODS).map(([key, mood]) => (
                    <button
                      key={key}
                      className={`mood-button ${chibi.currentMood === mood.id ? 'active' : ''}`}
                      onClick={() => chibi.setMood(mood.id)}
                      style={{ borderColor: mood.color }}
                    >
                      <span className="mood-icon">{mood.icon}</span>
                      <span className="mood-name">{mood.id}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="messages-list">
                <h4>{t('chibi.mood_messages', 'Messages selon l\'humeur')}</h4>
                <div className="current-mood-messages">
                  <h5>
                    {CHIBI_MOODS[chibi.currentMood.toUpperCase()]?.icon} 
                    {chibi.currentMood}
                  </h5>
                  {chibi.messages[chibi.currentMood]?.map((message, index) => (
                    <div key={index} className="message-item">
                      "{message}"
                    </div>
                  )) || (
                    <p className="no-messages">{t('chibi.no_messages', 'Aucun message pour cette humeur')}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Relations Tab */}
          {activeTab === 'relations' && (
            <div className="relations-content">
              <h4>{t('chibi.relationships', 'Relations avec les autres Chibis')}</h4>
              
              {Object.keys(chibi.relationships).length > 0 ? (
                <div className="relationships-list">
                  {Object.entries(chibi.relationships).map(([otherChibiId, relationValue]) => (
                    <div key={otherChibiId} className="relationship-item">
                      <span className="chibi-name">{otherChibiId}</span>
                      <div className="relationship-bar">
                        <div 
                          className={`relationship-fill ${relationValue >= 0 ? 'positive' : 'negative'}`}
                          style={{ 
                            width: `${Math.abs(relationValue)}%`,
                            marginLeft: relationValue < 0 ? `${50 + relationValue}%` : '50%'
                          }}
                        />
                      </div>
                      <span className="relationship-value">
                        {relationValue > 0 ? '+' : ''}{relationValue}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-relations">{t('chibi.no_relations', 'Aucune relation établie pour le moment')}</p>
              )}
              
              <div className="relation-info">
                <p>{t('chibi.relation_tip', 'Les chibis développent des relations en interagissant ensemble dans l\'enclos !')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChibiDetailModal;