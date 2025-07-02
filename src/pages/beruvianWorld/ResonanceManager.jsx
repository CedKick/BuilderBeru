import React, { useState, useEffect } from 'react';

export default function ResonanceManager({ activeResonance, playerStats, onCorruptionMax, onResonanceEnd }) {
  const [corruption, setCorruption] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isCorrupted, setIsCorrupted] = useState(false);

  useEffect(() => {
    if (!activeResonance) return;

    // Initialiser le timer
    setTimeRemaining(activeResonance.duration);
    setCorruption(activeResonance.corruption || 0);

    // Timer de durée
    const durationInterval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          onResonanceEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Timer de corruption
    const corruptionInterval = setInterval(() => {
      setCorruption(prev => {
        const newCorruption = prev + activeResonance.shadow.corruptionRate;
        
        if (newCorruption >= 100 && !isCorrupted) {
          setIsCorrupted(true);
          onCorruptionMax();
        }
        
        return Math.min(newCorruption, 100);
      });
    }, 1000);

    return () => {
      clearInterval(durationInterval);
      clearInterval(corruptionInterval);
    };
  }, [activeResonance, isCorrupted]);

  if (!activeResonance) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="resonance-manager">
      <div className="resonance-header">
        <img 
          src={activeResonance.shadow.sprite} 
          alt={activeResonance.shadow.name}
          className="resonance-icon"
        />
        <div className="resonance-info">
          <h4>Résonance: {activeResonance.shadow.name}</h4>
          <div className="resonance-timer">
            ⏱️ {formatTime(timeRemaining)}
          </div>
        </div>
      </div>

      {/* Barre de corruption */}
      <div className="corruption-bar">
        <div className="corruption-label">
          <span>Corruption</span>
          <span>{Math.round(corruption)}%</span>
        </div>
        <div className="corruption-track">
          <div 
            className="corruption-fill"
            style={{ 
              width: `${corruption}%`,
              background: corruption > 80 ? '#ff0000' : corruption > 50 ? '#ff6b6b' : '#c77dff'
            }}
          />
          {corruption > 80 && (
            <div className="corruption-warning">⚠️ DANGER</div>
          )}
        </div>
      </div>

      {/* Compétences actives */}
      <div className="resonance-skills">
        {activeResonance.skills.map((skill, idx) => (
          <div key={idx} className="resonance-skill">
            <span className="skill-icon">🌀</span>
            <span className="skill-name">{skill}</span>
          </div>
        ))}
      </div>

      {/* État corrompu */}
      {isCorrupted && (
        <div className="corruption-alert">
          ⚠️ CORRUPTION MAXIMALE - MODE BERSERK ACTIVÉ ⚠️
        </div>
      )}

      <style jsx>{`
        .resonance-manager {
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(26, 26, 46, 0.95);
          border: 2px solid #7b2cbf;
          border-radius: 15px;
          padding: 20px;
          width: 300px;
          box-shadow: 0 0 30px rgba(123, 44, 191, 0.5);
          z-index: 1000;
        }

        .resonance-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .resonance-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 2px solid #7b2cbf;
        }

        .resonance-info h4 {
          color: #e0aaff;
          margin: 0;
          font-size: 1.1rem;
        }

        .resonance-timer {
          color: #ffd700;
          font-size: 0.9rem;
          margin-top: 5px;
        }

        .corruption-bar {
          margin: 20px 0;
        }

        .corruption-label {
          display: flex;
          justify-content: space-between;
          color: #e0aaff;
          margin-bottom: 5px;
          font-size: 0.9rem;
        }

        .corruption-track {
          height: 20px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 10px;
          overflow: hidden;
          position: relative;
        }

        .corruption-fill {
          height: 100%;
          transition: all 0.3s;
          box-shadow: 0 0 10px currentColor;
        }

        .corruption-warning {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: white;
          font-size: 0.8rem;
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .resonance-skills {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .resonance-skill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          background: rgba(123, 44, 191, 0.2);
          border-radius: 5px;
          color: #e0aaff;
          font-size: 0.9rem;
        }

        .corruption-alert {
          position: absolute;
          bottom: -50px;
          left: 50%;
          transform: translateX(-50%);
          background: #ff0000;
          color: white;
          padding: 10px 20px;
          border-radius: 5px;
          font-weight: bold;
          animation: shake 0.5s infinite;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          25% { transform: translateX(-52%) translateY(-2px); }
          75% { transform: translateX(-48%) translateY(2px); }
        }
      `}</style>
    </div>
  );
}