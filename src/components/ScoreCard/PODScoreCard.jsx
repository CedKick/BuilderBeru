// src/components/ScoreCard/PODScoreCard.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PODScorePage from './PODScorePage';
import podPresets from './podPresets.json';
import '../../i18n/i18n';

const PODScoreCard = ({ showTankMessage, activeAccount, currentBuildStats}) => {
  const { t } = useTranslation();
  const [showPODModal, setShowPODModal] = useState(false);
  let [currentWeekData, setCurrentWeekData] = useState(null);
  const [selectedWeek] = useState(podPresets.currentWeek);
  currentWeekData = podPresets.weeks[selectedWeek];

  useEffect(() => {
    // Charger directement les données
    setCurrentWeekData(podPresets);
  }, []);

  const handleClose = () => {
    setShowPODModal(false);
  };

  const handleClick = () => {
    if (currentWeekData) {
      setShowPODModal(true);
      showTankMessage(
        `⚔️ ${t('pod.messages.loadingData')} ${currentWeekData.bossName}...`,
        true,
        'beru'
      );
    }
  };

  if (!currentWeekData) return null;

  // Map des boss POD avec leurs images
  const bossImages = {
    'vulcan': 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756135602/vulcan_pod.png',
    'ennio': 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1753968454/ennioimmortal_t86t1w.png',
    'kamish': 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756135602/kamish_pod.png'
  };

  const elementColors = {
    'FIRE': 'bg-red-500',
    'WATER': 'bg-blue-500',
    'WIND': 'bg-green-500',
    'LIGHT': 'bg-yellow-500',
    'DARK': 'bg-purple-500'
  };

  return (
    <>
      <div 
        onClick={handleClick}
        className="bg-gray-900/50 rounded-xl overflow-hidden border border-red-500/50 backdrop-blur-sm cursor-pointer hover:scale-105 transition-transform h-[100px] sm:h-[120px] w-full max-w-[350px] sm:max-w-[400px] mx-auto flex"
      >
        {/* Image avec overlay de texte */}
        <div className="relative w-full">
          <img loading="lazy" 
            src={bossImages[currentWeekData.currentBoss] || bossImages.vulcan} 
            alt={currentWeekData.bossName}  
            className="w-full h-[100px] sm:h-[120px] object-cover"
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
          
          {/* Badge HARD en haut à droite */}
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
            HARD
          </div>
          
          {/* Contenu sur l'image */}
          <div className="absolute inset-0 p-2 sm:p-3 flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-white">{t('pod.title')}</h3>
              <span className="text-xs text-red-400">
                {t('pod.week', { week: currentWeekData.weekId })}
              </span>
            </div>
            
            {/* Footer avec nom et éléments */}
            <div>
              <p className="text-white font-bold text-sm sm:text-base mb-1">
                {currentWeekData.bossName}
              </p>
              <div className="flex gap-1 sm:gap-2">
                {currentWeekData.elements && currentWeekData.elements.map(element => (
                  <div
                    key={element}
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg ${elementColors[element]}`}
                  >
                    {element[0].toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPODModal && currentWeekData && (
        <PODScorePage 
          onClose={handleClose}
          showTankMessage={showTankMessage}
          activeAccount={activeAccount}
          currentBuildStats={currentBuildStats}
          t={t}
        />
      )}
    </>
  );
};

export default PODScoreCard;