import React from 'react';
import DamageCalculator from './DamageCalculator.jsx';
import { characterStats } from './data/characterStats';
import { characters } from './data/characters'; // ou l'importer depuis BuilderBeru

const DamageCalculatorStandalone = () => {
  // États minimaux pour faire fonctionner le calculateur
  const [selectedCharacter] = React.useState('jinah'); // Défaut sur Jinah
  
  // Stats par défaut pour le mode standalone
  const defaultStats = {
    Attack: 43835,
    Defense: 15000,
    HP: 80000,
    'Critical Hit Rate': 25000,
    'Critical Hit Damage': 18200,
    'Defense Penetration': 23444,
    'Damage Increase': 9922,
    'Dark Damage %': 13.82,
    Precision: 4630
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <DamageCalculator
        selectedCharacter={selectedCharacter}
        finalStats={defaultStats}
        flatStats={{ Attack: 8624, Defense: 5000, HP: 20000, Precision: 4630 }}
        characters={characters}
        hunterWeapons={{ jinah: { precision: 4630 } }}
        onClose={() => window.location.href = '/'}
        t={(key) => key}
      />
    </div>
  );
};

export default DamageCalculatorStandalone;