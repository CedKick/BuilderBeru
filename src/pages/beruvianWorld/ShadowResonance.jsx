import React, { useState, useEffect, useCallback } from 'react';
import './ShadowResonance.css';

// 🌀 CONSTANTES DU SYSTÈME
const SHADOWS = {
  BIGROCK: {
    id: 'bigrock',
    name: 'Bigrock',
    type: 'Tank',
    color: '#4B0082',
    skills: ['Stone Wall', 'Earth Shatter', 'Immovable'],
    resonanceBonus: { defense: 50, hp: 1000, speed: -10 },
    corruptionRate: 0.5,
    sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606352/shadows/bigrock.png'
  },
  BESTE: {
    id: 'beste',
    name: 'Beste',
    type: 'DPS',
    color: '#8B008B',
    skills: ['Shadow Strike', 'Void Burst', 'Assassinate'],
    resonanceBonus: { attack: 100, critRate: 25, defense: -20 },
    corruptionRate: 1.2,
    sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606352/shadows/beste.png'
  },
  KAISER: {
    id: 'kaiser',
    name: 'Kaiser',
    type: 'Support',
    color: '#9370DB',
    skills: ['Dark Blessing', 'Corruption Wave', 'Soul Link'],
    resonanceBonus: { healing: 50, mana: 200, attack: 20 },
    corruptionRate: 0.8,
    sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606352/shadows/kaiser.png'
  }
};

const RHYTHM_PATTERNS = [
  { beats: [0, 500, 1000, 1500], difficulty: 'easy' },
  { beats: [0, 300, 600, 1200, 1500], difficulty: 'medium' },
  { beats: [0, 200, 400, 800, 1000, 1400, 1600], difficulty: 'hard' }
];

export default function ShadowResonance({ 
  onResonanceComplete, 
  shadowEncountered, 
  playerStats,
  onClose 
}) {
  const [currentShadow, setCurrentShadow] = useState(null);
  const [resonancePhase, setResonancePhase] = useState('encounter'); // encounter, rhythm, success, failed
  const [corruption, setCorruption] = useState(0);
  const [rhythmScore, setRhythmScore] = useState(0);
  const [currentPattern, setCurrentPattern] = useState(null);
  const [beatIndex, setBeatIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerInput, setPlayerInput] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [resonanceLevel, setResonanceLevel] = useState(0);

  // Initialiser la rencontre
  useEffect(() => {
    if (shadowEncountered && SHADOWS[shadowEncountered.toUpperCase()]) {
      setCurrentShadow(SHADOWS[shadowEncountered.toUpperCase()]);
      setCurrentPattern(RHYTHM_PATTERNS[Math.floor(Math.random() * RHYTHM_PATTERNS.length)]);
    }
  }, [shadowEncountered]);

  // 🎵 Mini-jeu rythmique
  const startRhythmGame = () => {
    setResonancePhase('rhythm');
    setIsPlaying(true);
    setBeatIndex(0);
    setPlayerInput([]);
    
    // Jouer le pattern
    playPattern();
  };

  const playPattern = useCallback(() => {
    if (!currentPattern) return;
    
    currentPattern.beats.forEach((beat, index) => {
      setTimeout(() => {
        // Animation visuelle du beat
        const beatElement = document.getElementById(`beat-${index}`);
        if (beatElement) {
          beatElement.classList.add('active');
          setTimeout(() => beatElement.classList.remove('active'), 200);
        }
        
        // Son (à implémenter avec Tone.js si disponible)
        playBeatSound();
      }, beat);
    });
    
    // Activer l'input après la lecture
    setTimeout(() => {
      setIsPlaying(false);
    }, currentPattern.beats[currentPattern.beats.length - 1] + 500);
  }, [currentPattern]);

  const playBeatSound = () => {
    // Créer un son simple avec Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 440;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const handlePlayerBeat = () => {
    if (isPlaying) return;
    
    const timestamp = Date.now();
    setPlayerInput([...playerInput, timestamp]);
    
    // Animation feedback
    const inputElement = document.getElementById('player-input');
    if (inputElement) {
      inputElement.classList.add('pulse');
      setTimeout(() => inputElement.classList.remove('pulse'), 200);
    }
    
    // Vérifier si le pattern est complet
    if (playerInput.length + 1 >= currentPattern.beats.length) {
      setTimeout(evaluateRhythm, 500);
    }
  };

  const evaluateRhythm = () => {
    let score = 0;
    const tolerance = 200; // ms de tolérance
    
    playerInput.forEach((input, index) => {
      if (index === 0) {
        // Premier beat toujours correct
        score += 20;
      } else {
        const expectedDiff = currentPattern.beats[index] - currentPattern.beats[0];
        const actualDiff = input - playerInput[0];
        const error = Math.abs(expectedDiff - actualDiff);
        
        if (error < tolerance) {
          score += 20;
        } else if (error < tolerance * 2) {
          score += 10;
        }
      }
    });
    
    setRhythmScore(score);
    setShowResult(true);
    
    if (score >= 60) {
      // Succès !
      setTimeout(() => {
        setResonancePhase('success');
        const level = score >= 90 ? 3 : score >= 75 ? 2 : 1;
        setResonanceLevel(level);
      }, 1500);
    } else {
      // Échec
      setTimeout(() => {
        setResonancePhase('failed');
      }, 1500);
    }
  };

  // 🔥 Activer la résonance
  const activateResonance = () => {
    if (!currentShadow) return;
    
    const resonanceData = {
      shadow: currentShadow,
      level: resonanceLevel,
      duration: 300 * resonanceLevel, // 5 minutes par niveau
      corruption: 0,
      maxCorruption: 100,
      skills: currentShadow.skills.slice(0, resonanceLevel),
      bonuses: Object.entries(currentShadow.resonanceBonus).reduce((acc, [stat, value]) => {
        acc[stat] = Math.floor(value * (resonanceLevel / 3));
        return acc;
      }, {})
    };
    
    onResonanceComplete(resonanceData);
    onClose();
  };

  // 🎨 RENDER
  if (!currentShadow) return null;

  return (
    <div className="shadow-resonance-overlay">
      <div className="resonance-container">
        {/* Phase de rencontre */}
        {resonancePhase === 'encounter' && (
          <div className="encounter-phase">
            <h2 className="resonance-title">Résonance Détectée!</h2>
            
            <div className="shadow-display">
              <img loading="lazy" 
                src={currentShadow.sprite} 
                alt={currentShadow.name}
                className="shadow-sprite"
              />
              <div className="shadow-info">
                <h3 style={{ color: currentShadow.color }}>{currentShadow.name}</h3>
                <p>Type: {currentShadow.type}</p>
                <div className="shadow-skills">
                  {currentShadow.skills.map((skill, idx) => (
                    <span key={idx} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="resonance-warning">
              <p>⚠️ Établir une résonance avec une ombre augmentera votre puissance mais aussi votre corruption!</p>
              <p>Taux de corruption: <span style={{ color: '#ff6b6b' }}>
                {currentShadow.corruptionRate}x
              </span></p>
            </div>
            
            <div className="action-buttons">
              <button 
                className="btn-resonance"
                onClick={startRhythmGame}
              >
                🌀 Tenter la Résonance
              </button>
              <button 
                className="btn-flee"
                onClick={onClose}
              >
                🏃 Fuir
              </button>
            </div>
          </div>
        )}

        {/* Phase rythmique */}
        {resonancePhase === 'rhythm' && (
          <div className="rhythm-phase">
            <h2>Synchronisation en cours...</h2>
            
            <div className="pattern-display">
              {currentPattern.beats.map((_, idx) => (
                <div 
                  key={idx}
                  id={`beat-${idx}`}
                  className="beat-indicator"
                />
              ))}
            </div>
            
            <div 
              id="player-input"
              className="rhythm-input-zone"
              onClick={handlePlayerBeat}
              style={{ 
                pointerEvents: isPlaying ? 'none' : 'auto',
                opacity: isPlaying ? 0.5 : 1 
              }}
            >
              {isPlaying ? 'Écoutez...' : 'CLIQUEZ AU RYTHME!'}
            </div>
            
            {showResult && (
              <div className="rhythm-result">
                Score: {rhythmScore}/100
              </div>
            )}
          </div>
        )}

        {/* Phase de succès */}
        {resonancePhase === 'success' && (
          <div className="success-phase">
            <h2 className="success-title">Résonance Établie!</h2>
            
            <div className="resonance-details">
              <div className="resonance-level">
                Niveau de Résonance: {['⭐', '⭐⭐', '⭐⭐⭐'][resonanceLevel - 1]}
              </div>
              
              <div className="bonuses-preview">
                <h3>Bonus Obtenus:</h3>
                {Object.entries(currentShadow.resonanceBonus).map(([stat, value]) => (
                  <div key={stat} className="bonus-stat">
                    <span>{stat}:</span>
                    <span className={value > 0 ? 'positive' : 'negative'}>
                      {value > 0 ? '+' : ''}{Math.floor(value * (resonanceLevel / 3))}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="skills-unlocked">
                <h3>Compétences Débloquées:</h3>
                {currentShadow.skills.slice(0, resonanceLevel).map((skill, idx) => (
                  <div key={idx} className="skill-unlock">
                    🔓 {skill}
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              className="btn-activate"
              onClick={activateResonance}
            >
              ⚡ Activer la Résonance
            </button>
          </div>
        )}

        {/* Phase d'échec */}
        {resonancePhase === 'failed' && (
          <div className="failed-phase">
            <h2 className="failed-title">Résonance Échouée...</h2>
            <p>L'ombre rejette votre tentative de synchronisation.</p>
            
            <div className="action-buttons">
              <button 
                className="btn-retry"
                onClick={() => {
                  setResonancePhase('encounter');
                  setShowResult(false);
                  setRhythmScore(0);
                }}
              >
                🔄 Réessayer
              </button>
              <button 
                className="btn-flee"
                onClick={onClose}
              >
                🏃 Abandonner
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}