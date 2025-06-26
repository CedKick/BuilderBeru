// HallOfFlameStandalone.jsx - 🏆 PAGE STANDALONE POUR ROUTE
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HallOfFlamePage from './HallOfFlamePage';

const HallOfFlameStandalone = () => {
  const navigate = useNavigate();
  const [showTankMessage] = useState(() => {
    // Function pour afficher les messages (version simplifiée)
    return (message, isSuccess, source) => {
      console.log(`${source}: ${message}`);
      // Tu peux ajouter un toast system ici si tu veux
    };
  });

  // Characters data basique (tu peux importer le vrai si besoin)
  const characters = {
    niermann: { name: "Lennart Niermann", element: "Water", class: "Fighter" },
    kanae: { name: "Tawata Kanae", element: "Fire", class: "Assassin" },
    // Ajoute d'autres si nécessaire
  };

  return (
    <HallOfFlamePage
      onClose={() => navigate('/')} // Retour à l'accueil
      showTankMessage={showTankMessage}
      characters={characters}
      onNavigateToBuilder={() => navigate('/build')}
      // Props optionnelles (vides pour la version standalone)
      selectedCharacter={null}
      currentStats={{}}
      currentArtifacts={{}}
      statsFromArtifacts={{}}
      currentCores={{}}
      currentGems={{}}
      currentWeapon={{}}
    />
  );
};

export default HallOfFlameStandalone;