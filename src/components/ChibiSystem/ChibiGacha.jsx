// src/components/ChibiSystem/ChibiGacha.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CHIBI_DATABASE, RARITY_COLORS } from './ChibiData';
import ChibiBubble from '../ChibiBubble';
import './ChibiWorld.css';

const ChibiGacha = ({ shadowCoins, onClose, onPull }) => {
  const { t } = useTranslation();
  const [isPulling, setIsPulling] = useState(false);
  const [pullResult, setPullResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('idle'); // idle, pulling, reveal
  
  // Taux de drop
  const PULL_RATES = {
    Commun: 0.60,      // 60%
    Rare: 0.30,        // 30%
    Légendaire: 0.09,  // 9%
    Mythique: 0.01     // 1%
  };
  
  // Coût du pull
  const PULL_COST = 100;
  const MULTI_PULL_COST = 900; // 10 pulls pour le prix de 9
  
  // Fonction de pull
  const performPull = () => {
    const roll = Math.random();
    let cumulative = 0;
    let selectedRarity = 'Commun';
    
    for (const [rarity, rate] of Object.entries(PULL_RATES)) {
      cumulative += rate;
      if (roll <= cumulative) {
        selectedRarity = rarity;
        break;
      }
    }
    
    // Récupérer un chibi aléatoire de cette rareté
    const chibisOfRarity = Object.values(CHIBI_DATABASE).filter(
      chibi => chibi.rarity === selectedRarity
    );
    
    if (chibisOfRarity.length > 0) {
      const randomChibi = chibisOfRarity[Math.floor(Math.random() * chibisOfRarity.length)];
      return randomChibi;
    }
    
    // Fallback si aucun chibi trouvé
    return CHIBI_DATABASE['chibi_beru_001'];
  };
  
  // Animation de pull
  const handlePull = async () => {
    if (shadowCoins < PULL_COST || isPulling) return;
    
    setIsPulling(true);
    setAnimationPhase('pulling');
    
    // Phase 1: Animation du portail (2s)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Phase 2: Déterminer le résultat
    const result = performPull();
    setPullResult(result);
    
    // Phase 3: Révélation (1s)
    setAnimationPhase('reveal');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Phase 4: Afficher le résultat
    setShowResult(true);
    setIsPulling(false);
    
    // Notifier le parent
    onPull(result);
  };
  
  // Fermer et reset
  const handleClose = () => {
    setShowResult(false);
    setPullResult(null);
    setAnimationPhase('idle');
    onClose();
  };
  
  // Sprite temporaire
  const getChibiSprite = (chibiId) => {
    const spriteMap = {
      'chibi_beru_001': '🐜',
      'chibi_tank_001': '🛡️',
      'chibi_kaisel_001': '⚔️',
      'chibi_igris_001': '🗡️',
      'chibi_iron_001': '🤖'
    };
    return spriteMap[chibiId] || '👾';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      {/* Container principal */}
      <div className="relative w-full max-w-lg mx-4">
        
        {/* Bouton fermer */}
        <button
          onClick={handleClose}
          className="absolute -top-12 right-0 text-white hover:text-red-400 transition-colors"
        >
          <span className="text-3xl">✕</span>
        </button>
        
        {/* Portail de Gacha */}
        <div className={`gacha-portal ${animationPhase}`}>
          {/* Effet de particules */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-purple-400 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  animation: `particleFloat ${2 + Math.random() * 2}s infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                  transform: `rotate(${i * 18}deg) translateX(${100 + Math.random() * 50}px)`
                }}
              />
            ))}
          </div>
          
          {/* Contenu du portail */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center">
            {!showResult ? (
              <>
                {/* État initial */}
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-purple-300 mb-4">
                    {t('gacha.title', 'Invocation des Ombres')}
                  </h2>
                  
                  {/* Coût */}
                  <div className="mb-8">
                    <p className="text-white mb-2">
                      {t('gacha.cost', 'Coût')}: 
                      <span className="text-yellow-400 font-bold ml-2">
                        🪙 {PULL_COST}
                      </span>
                    </p>
                    <p className="text-sm text-gray-400">
                      {t('gacha.balance', 'Solde')}: {shadowCoins} 🪙
                    </p>
                  </div>
                  
                  {/* Boutons */}
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={handlePull}
                      disabled={shadowCoins < PULL_COST || isPulling}
                      className={`px-6 py-3 rounded-full font-bold transition-all ${
                        shadowCoins >= PULL_COST && !isPulling
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105'
                          : 'bg-gray-600 cursor-not-allowed opacity-50'
                      } text-white shadow-lg`}
                    >
                      {isPulling ? t('gacha.pulling', 'Invocation...') : t('gacha.pull', 'Invoquer x1')}
                    </button>
                  </div>
                  
                  {/* Animation de pull */}
                  {isPulling && (
                    <div className="mt-8">
                      <div className="text-6xl animate-spin">✨</div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Résultat */}
                <div className="text-center animate-fadeIn">
                  {/* Rareté */}
                  <p className="text-sm uppercase tracking-wider mb-2"
                     style={{ color: RARITY_COLORS[pullResult.rarity] }}>
                    {pullResult.rarity}
                  </p>
                  
                  {/* Chibi obtenu */}
                  <div className="text-8xl mb-4 animate-bounce"
                       style={{ 
                         filter: `drop-shadow(0 0 30px ${RARITY_COLORS[pullResult.rarity]})`,
                         animation: pullResult.rarity === 'Mythique' ? 'rainbowGlow 2s infinite' : undefined
                       }}>
                    {getChibiSprite(pullResult.id)}
                  </div>
                  
                  {/* Nom */}
                  <h3 className="text-2xl font-bold mb-4"
                      style={{ color: RARITY_COLORS[pullResult.rarity] }}>
                    {pullResult.name}
                  </h3>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-sm mb-6 max-w-xs mx-auto">
                    <div className="bg-black/30 rounded p-2">
                      <span className="text-red-400">⚔️ ATK:</span> {pullResult.baseStats.attack}
                    </div>
                    <div className="bg-black/30 rounded p-2">
                      <span className="text-blue-400">🛡️ DEF:</span> {pullResult.baseStats.defense}
                    </div>
                    <div className="bg-black/30 rounded p-2">
                      <span className="text-green-400">❤️ HP:</span> {pullResult.baseStats.hp}
                    </div>
                    <div className="bg-black/30 rounded p-2">
                      <span className="text-purple-400">✨ MP:</span> {pullResult.baseStats.mana}
                    </div>
                  </div>
                  
                  {/* Boutons */}
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => {
                        setShowResult(false);
                        setPullResult(null);
                      }}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 
                                 text-white rounded-full transition-colors"
                    >
                      {t('gacha.again', 'Encore !')}
                    </button>
                    <button
                      onClick={handleClose}
                      className="px-6 py-2 bg-gray-600 hover:bg-gray-700 
                                 text-white rounded-full transition-colors"
                    >
                      {t('gacha.close', 'Fermer')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Taux affichés */}
        <div className="mt-4 text-center text-xs text-gray-400">
          <p>{t('gacha.rates', 'Taux de drop')}:</p>
          <div className="flex justify-center gap-4 mt-1">
            {Object.entries(PULL_RATES).map(([rarity, rate]) => (
              <span key={rarity} style={{ color: RARITY_COLORS[rarity] }}>
                {rarity}: {(rate * 100).toFixed(0)}%
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChibiGacha;