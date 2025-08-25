// src/components/ScoreCard/BDGScoreCard.jsx
import React, { useState, useEffect } from 'react';
import BDGScorePage from './BDGScorePage';
import bdgPresets from './bdgPresets.json';

const BDGScoreCard = ({ showTankMessage, activeAccount, currentBuildStats  }) => {
  const [showBDGModal, setShowBDGModal] = useState(false);
  let [currentWeekData, setCurrentWeekData] = useState(null);
  const [selectedWeek] = useState(bdgPresets.currentWeek);
  currentWeekData = bdgPresets.weeks[selectedWeek];

  useEffect(() => {
    // Charger directement les données
    setCurrentWeekData(bdgPresets);
  }, []);

  const handleClose = () => {
    setShowBDGModal(false);
  };

  const handleClick = () => {
    if (currentWeekData) {
      setShowBDGModal(true);
      showTankMessage(`🧠 Chargement des données BDG pour ${currentWeekData.bossName}...`, true, 'beru');
    }
  };

  if (!currentWeekData) return null;

  // Map des boss avec leurs images
  const bossImages = {
    'ant_queen': 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1753968545/antQueen_jzt22r.png',
    'fatchna': 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730842/bdg_fatchna_lf0nij.png',
    'statue': 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756135602/statue_uzsuqr.png'
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
        className="bg-gray-900/50 rounded-xl overflow-hidden border border-purple-500/50 backdrop-blur-sm cursor-pointer hover:scale-105 transition-transform h-[100px] sm:h-[120px] w-full max-w-[350px] sm:max-w-[400px] mx-auto flex"
      >
        {/* Image avec overlay de texte */}
        <div className="relative w-full">
          <img 
            src={bossImages[currentWeekData.currentBoss] || bossImages.fatchna} 
            alt={currentWeekData.bossName}  
            className="w-full h-[100px] sm:h-[120px] object-cover"
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
          
          {/* Contenu sur l'image */}
          <div className="absolute inset-0 p-2 sm:p-3 flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-white">BDG Score</h3>
              <span className="text-xs text-purple-400">
                Semaine {currentWeekData.weekId}
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

      {showBDGModal && currentWeekData && (
        <BDGScorePage 
          onClose={handleClose}
          showTankMessage={showTankMessage}
          activeAccount={activeAccount}
          currentBuildStats={currentBuildStats}
        />
      )}
    </>
  );
};

export default BDGScoreCard;