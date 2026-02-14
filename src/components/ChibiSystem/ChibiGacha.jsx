// src/components/ChibiSystem/ChibiGacha.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChibiFactory, CHIBI_RARITIES } from './ChibiDataStructure';
import { CHIBI_DATABASE } from './ChibiDatabase';
import ChibiBubble from '../ChibiBubble';
import './ChibiWorld.css';

const ChibiGacha = ({ shadowCoins, onClose, onPull }) => {
  const { t } = useTranslation();
  const [isPulling, setIsPulling] = useState(false);
  const [pullResult, setPullResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('idle'); // idle, pulling, reveal
  const [chibiFactory, setChibiFactory] = useState(null);
  
  // États pour le multi-pull
  const [multiPullResults, setMultiPullResults] = useState([]);
  const [currentMultiIndex, setCurrentMultiIndex] = useState(0);
  const [isMultiPull, setIsMultiPull] = useState(false);
  
  // Initialiser la factory
  useEffect(() => {
    const factory = new ChibiFactory(CHIBI_DATABASE);
    setChibiFactory(factory);
  }, []);
  
  // Coût du pull
  const PULL_COST = 100;
  const MULTI_PULL_COST = 900; // 10 pulls pour le prix de 9
  
  // Animation de pull simple
  const handlePull = async () => {
    if (shadowCoins < PULL_COST || isPulling || !chibiFactory) return;
    
    setIsPulling(true);
    setAnimationPhase('pulling');
    
    // Phase 1: Animation du portail (2s)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Phase 2: Déterminer le résultat en utilisant ChibiFactory
    const newChibi = chibiFactory.getRandomChibiForPull();
    if (!newChibi) {
      console.error('Erreur lors du pull');
      setIsPulling(false);
      setAnimationPhase('idle');
      return;
    }
    
    setPullResult(newChibi);
    
    // Phase 3: Révélation (1s)
    setAnimationPhase('reveal');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Phase 4: Afficher le résultat
    setShowResult(true);
    setIsPulling(false);
    
    // Notifier le parent avec l'entité Chibi complète
    onPull(newChibi);
  };
  
  // Animation de pull x10
  const handleMultiPull = async () => {
    if (shadowCoins < MULTI_PULL_COST || isPulling || !chibiFactory) return;
    
    setIsPulling(true);
    setIsMultiPull(true);
    setAnimationPhase('pulling');
    
    // Animation plus longue pour multi-pull
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Tirer 10 chibis
    const pulledChibis = [];
    for (let i = 0; i < 10; i++) {
      const newChibi = chibiFactory.getRandomChibiForPull();
      if (newChibi) {
        pulledChibis.push(newChibi);
      }
    }
    
    if (pulledChibis.length > 0) {
      setMultiPullResults(pulledChibis);
      setCurrentMultiIndex(0);
      setPullResult(pulledChibis[0]);
      
      setAnimationPhase('reveal');
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowResult(true);
      setIsPulling(false);
    }
  };
  
  // Passer au chibi suivant dans le multi-pull
  const showNextMultiPull = () => {
    if (currentMultiIndex < multiPullResults.length - 1) {
      setCurrentMultiIndex(prev => prev + 1);
      setPullResult(multiPullResults[currentMultiIndex + 1]);
    } else {
      // Fin du multi-pull, notifier le parent pour tous les chibis
      multiPullResults.forEach(chibi => onPull(chibi));
      handleClose();
    }
  };
  
  // Afficher tous les résultats d'un coup
  const skipToAllResults = () => {
    // Notifier le parent pour tous les chibis
    multiPullResults.forEach(chibi => onPull(chibi));
    // TODO: Afficher un écran récapitulatif avec les 10 chibis
    setShowResult(false);
    setIsMultiPull(false);
    setMultiPullResults([]);
    setCurrentMultiIndex(0);
    // Pour l'instant on ferme, mais on pourrait afficher un récap
    handleClose();
  };
  
  // Fermer et reset
  const handleClose = () => {
    setShowResult(false);
    setPullResult(null);
    setAnimationPhase('idle');
    setIsMultiPull(false);
    setMultiPullResults([]);
    setCurrentMultiIndex(0);
    onClose();
  };
  
  // Obtenir le sprite du chibi
  const getChibiSprite = (chibi) => {
    // Utiliser le sprite idle s'il existe, sinon un emoji de fallback
    if (chibi.sprites?.idle) {
      return (
        <img 
          src={chibi.sprites.idle} 
          alt={chibi.name}
          className="chibi-gacha-sprite"
          style={{ width: '120px', height: '120px' }}
        />
      );
    }
    
    // Fallback emojis
    const spriteMap = {
      'beru': '🐜',
      'tank': '🛡️',
      'kaisel': '⚔️',
      'igris': '🗡️',
      'iron': '🤖',
      'raven': '🐦‍⬛',
      'lil': '🐉'
    };
    
    const typeKey = chibi.id.split('_')[1];
    return spriteMap[typeKey] || '👾';
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
                    
                    <button
                      onClick={handleMultiPull}
                      disabled={shadowCoins < MULTI_PULL_COST || isPulling}
                      className={`px-6 py-3 rounded-full font-bold transition-all ${
                        shadowCoins >= MULTI_PULL_COST && !isPulling
                          ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 transform hover:scale-105'
                          : 'bg-gray-600 cursor-not-allowed opacity-50'
                      } text-white shadow-lg relative`}
                    >
                      {isPulling ? t('gacha.pulling', 'Invocation...') : t('gacha.multipull', 'Invoquer x10')}
                      <span className="absolute -top-2 -right-2 bg-red-500 text-xs px-2 py-1 rounded-full">
                        -10%
                      </span>
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
                <div className="text-center animate-fadeIn"
                     style={{
                       background: `radial-gradient(circle at center, ${CHIBI_RARITIES[pullResult.rarity.toUpperCase()]?.color}20 0%, transparent 70%)`,
                       padding: '20px',
                       borderRadius: '20px'
                     }}>
                  {/* Rareté avec fond coloré */}
                  <div className="mb-4">
                    <p className="text-sm uppercase tracking-wider mb-2 opacity-80">
                      {pullResult.rarity}
                    </p>
                    <div 
                      className="inline-block px-6 py-2 rounded-full font-bold text-white"
                      style={{ 
                        backgroundColor: CHIBI_RARITIES[pullResult.rarity.toUpperCase()]?.color,
                        boxShadow: `0 4px 20px ${CHIBI_RARITIES[pullResult.rarity.toUpperCase()]?.color}80`
                      }}
                    >
                      {pullResult.rarity === 'commun' && '⭐ COMMUN'}
                      {pullResult.rarity === 'rare' && '⭐⭐ RARE'}
                      {pullResult.rarity === 'legendaire' && '⭐⭐⭐ LÉGENDAIRE'}
                      {pullResult.rarity === 'mythique' && '⭐⭐⭐⭐ MYTHIQUE'}
                    </div>
                  </div>
                  
                  {/* Chibi obtenu */}
                  <div className="mb-4 flex justify-center items-center"
                       style={{ 
                         filter: `drop-shadow(0 0 30px ${CHIBI_RARITIES[pullResult.rarity.toUpperCase()]?.color})`,
                         animation: pullResult.rarity === 'mythique' ? 'rainbowGlow 2s infinite' : undefined
                       }}>
                    {getChibiSprite(pullResult)}
                  </div>
                  
                  {/* Nom */}
                  <h3 className="text-2xl font-bold mb-2"
                      style={{ color: CHIBI_RARITIES[pullResult.rarity.toUpperCase()]?.color }}>
                    {pullResult.name}
                  </h3>
                  
                  {/* Personnalité */}
                  <p className="text-gray-300 mb-4 italic">
                    "{pullResult.personality?.description || pullResult.shortLore}"
                  </p>
                  
                  {/* Stats actuelles (avec level 1) */}
                  <div className="grid grid-cols-2 gap-2 text-sm mb-6 max-w-xs mx-auto">
                    <div className="bg-black/30 rounded p-2">
                      <span className="text-red-400">⚔️ ATK:</span> {pullResult.getStats().attack}
                    </div>
                    <div className="bg-black/30 rounded p-2">
                      <span className="text-blue-400">🛡️ DEF:</span> {pullResult.getStats().defense}
                    </div>
                    <div className="bg-black/30 rounded p-2">
                      <span className="text-green-400">❤️ HP:</span> {pullResult.getStats().hp}
                    </div>
                    <div className="bg-black/30 rounded p-2">
                      <span className="text-purple-400">✨ MP:</span> {pullResult.getStats().mana}
                    </div>
                  </div>
                  
                  {/* Message du chibi */}
                  <div className="mb-6 p-3 bg-black/40 rounded-lg">
                    <p className="text-sm text-gray-200">
                      "{pullResult.getMessage()}"
                    </p>
                  </div>
                  
                  {/* Indicateur de progression pour multi-pull */}
                  {isMultiPull && (
                    <div className="multi-pull-progress mb-4">
                      <p className="text-yellow-400 text-lg font-bold">
                        Chibi {currentMultiIndex + 1} / 10
                      </p>
                    </div>
                  )}
                  
                  {/* Boutons */}
                  <div className="flex gap-4 justify-center">
                    {!isMultiPull ? (
                      <>
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
                      </>
                    ) : (
                      <>
                        <button
                          onClick={showNextMultiPull}
                          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 
                                     text-white rounded-full transition-colors
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={currentMultiIndex >= multiPullResults.length - 1}
                        >
                          {currentMultiIndex < multiPullResults.length - 1 
                            ? t('gacha.next', 'Suivant →') 
                            : t('gacha.finish', 'Terminer')}
                        </button>
                        <button
                          onClick={skipToAllResults}
                          className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 
                                     text-white rounded-full transition-colors"
                        >
                          {t('gacha.skip', 'Skip (Voir tous)')}
                        </button>
                      </>
                    )}
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
            {Object.entries(CHIBI_RARITIES).map(([key, rarity]) => (
              <span key={key} style={{ color: rarity.color }}>
                {rarity.name}: {(rarity.dropRate * 100).toFixed(0)}%
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChibiGacha;