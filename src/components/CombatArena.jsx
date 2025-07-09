// CombatArena.jsx - ⚔️ SYSTÈME DE COMBAT BUILDERBERU
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

// 🎮 SPRITES DE COMBAT (TEMPORAIRES - À REMPLACER PAR LES VRAIS)
const COMBAT_SPRITES = {
  'shuhua': {
    left: '/sprites/shuhua-left.png',
    right: '/sprites/shuhua-right.png'
  },
  // Sprites par défaut si pas trouvé
  'default': {
    left: '/sprites/default-left.png',
    right: '/sprites/default-right.png'
  }
};

const CombatArena = ({ hunter1, hunter2, onClose, showTankMessage }) => {
  const [combatLog, setCombatLog] = useState([]);
  const [hunter1HP, setHunter1HP] = useState(100);
  const [hunter2HP, setHunter2HP] = useState(100);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [combatEnded, setCombatEnded] = useState(false);
  const [winner, setWinner] = useState(null);
  const [tvComment, setTvComment] = useState("Le combat va commencer !");
  
  const arenaRef = useRef(null);

  // 📺 COMMENTAIRES TV ALÉATOIRES
  const TV_COMMENTS = {
    start: [
      "Mesdames et messieurs, préparez-vous pour un combat ÉPIQUE !",
      "Les deux hunters se font face... La tension est palpable !",
      "C'est parti pour un duel au sommet !"
    ],
    hit: [
      "Quel coup dévastateur !",
      "Aïe ! Ça doit faire mal !",
      "INCROYABLE ! Quelle attaque !",
      "Il encaisse difficilement ce coup !"
    ],
    critical: [
      "COUP CRITIQUE ! C'EST ÉNORME !",
      "OH MON DIEU ! UN CRITICAL HIT !",
      "DÉGÂTS CRITIQUES ! La foule est en délire !"
    ],
    end: [
      "ET C'EST TERMINÉ ! Quelle victoire écrasante !",
      "Le vainqueur est déclaré ! Quel combat !",
      "C'était un combat mémorable !"
    ]
  };

  // 🎯 CALCUL DES DÉGÂTS
  const calculateDamage = (attacker, defender) => {
    const attack = attacker.stats?.Attack || 5000;
    const defense = defender.stats?.Defense || 5000;
    const critRate = attacker.stats?.['Critical Hit Rate'] || 0;
    const critDamage = attacker.stats?.['Critical Hit Damage'] || 0;
    
    // Formule de base
    let damage = (attack * 1.5) - (defense * 0.5);
    damage = Math.max(damage, attack * 0.1); // Minimum 10% de l'attaque
    
    // Critical hit ?
    const isCritical = Math.random() * 20000 < critRate;
    if (isCritical) {
      damage *= (1 + critDamage / 10000);
    }
    
    // Variation aléatoire
    damage *= (0.9 + Math.random() * 0.2);
    
    return {
      damage: Math.round(damage),
      isCritical
    };
  };

  // 🎮 LOGIQUE DE COMBAT
  useEffect(() => {
    if (combatEnded) return;

    const combatInterval = setInterval(() => {
      // Déterminer qui attaque
      const isHunter1Turn = currentTurn % 2 === 1;
      const attacker = isHunter1Turn ? hunter1 : hunter2;
      const defender = isHunter1Turn ? hunter2 : hunter1;
      
      // Calculer les dégâts
      const { damage, isCritical } = calculateDamage(attacker, defender);
      
      // Appliquer les dégâts
      const damagePercent = (damage / (defender.stats?.HP || 10000)) * 100;
      
      if (isHunter1Turn) {
        const newHP = Math.max(0, hunter2HP - damagePercent);
        setHunter2HP(newHP);
        
        if (newHP <= 0) {
          setCombatEnded(true);
          setWinner(hunter1);
          setTvComment(TV_COMMENTS.end[Math.floor(Math.random() * TV_COMMENTS.end.length)]);
        }
      } else {
        const newHP = Math.max(0, hunter1HP - damagePercent);
        setHunter1HP(newHP);
        
        if (newHP <= 0) {
          setCombatEnded(true);
          setWinner(hunter2);
          setTvComment(TV_COMMENTS.end[Math.floor(Math.random() * TV_COMMENTS.end.length)]);
        }
      }
      
      // Mettre à jour le log
      const logEntry = `Tour ${currentTurn}: ${attacker.name} attaque pour ${damage.toLocaleString()} dégâts${isCritical ? ' (CRITIQUE!)' : ''}`;
      setCombatLog(prev => [...prev.slice(-4), logEntry]);
      
      // Commentaire TV
      if (isCritical) {
        setTvComment(TV_COMMENTS.critical[Math.floor(Math.random() * TV_COMMENTS.critical.length)]);
      } else {
        setTvComment(TV_COMMENTS.hit[Math.floor(Math.random() * TV_COMMENTS.hit.length)]);
      }
      
      setCurrentTurn(prev => prev + 1);
    }, 1500); // Une attaque toutes les 1.5 secondes

    return () => clearInterval(combatInterval);
  }, [currentTurn, hunter1HP, hunter2HP, combatEnded]);

  // 🎨 OBTENIR LES SPRITES
  const getSprite = (character, side) => {
    const sprites = COMBAT_SPRITES[character] || COMBAT_SPRITES.default;
    return sprites[side];
  };

  return ReactDOM.createPortal(
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes attack-left {
          0% { transform: translateX(0); }
          50% { transform: translateX(50px); }
          100% { transform: translateX(0); }
        }

        @keyframes attack-right {
          0% { transform: translateX(0); }
          50% { transform: translateX(-50px); }
          100% { transform: translateX(0); }
        }

        @keyframes damage-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .combat-overlay {
          position: fixed;
          inset: 0;
          z-index: 999999;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          flex-direction: column;
        }

        .combat-arena {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: linear-gradient(to bottom, #1a1a2e, #0f0f1e);
          border-bottom: 2px solid #ffd700;
        }

        .arena-floor {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 100px;
          background: linear-gradient(to top, #2a2a3e, transparent);
          border-top: 2px solid #444;
        }

        .fighter {
          position: absolute;
          bottom: 100px;
          width: 100px;
          height: 100px;
          animation: float 2s ease-in-out infinite;
        }

        .fighter.left {
          left: 20%;
        }

        .fighter.right {
          right: 20%;
        }

        .fighter.attacking-left {
          animation: attack-left 0.5s ease-out;
        }

        .fighter.attacking-right {
          animation: attack-right 0.5s ease-out;
        }

        .fighter.damaged {
          animation: damage-shake 0.3s ease-out;
        }

        .fighter-sprite {
          width: 100%;
          height: 100%;
          background: #a855f7;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: white;
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
        }

        .hp-bar-container {
          position: absolute;
          top: -30px;
          width: 120px;
          left: 50%;
          transform: translateX(-50%);
        }

        .hp-bar {
          width: 100%;
          height: 8px;
          background: rgba(0, 0, 0, 0.7);
          border: 1px solid #333;
          border-radius: 4px;
          overflow: hidden;
        }

        .hp-fill {
          height: 100%;
          background: linear-gradient(to right, #22c55e, #16a34a);
          transition: width 0.5s ease-out;
        }

        .hp-fill.low {
          background: linear-gradient(to right, #ef4444, #dc2626);
        }

        .hp-fill.medium {
          background: linear-gradient(to right, #f59e0b, #d97706);
        }

        .fighter-name {
          position: absolute;
          top: -50px;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          font-weight: bold;
          text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
          white-space: nowrap;
        }

        .tv-commentary {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid #ffd700;
          border-radius: 10px;
          padding: 15px 30px;
          max-width: 600px;
          text-align: center;
        }

        .tv-icon {
          display: inline-block;
          margin-right: 10px;
          font-size: 1.5rem;
        }

        .tv-text {
          color: #ffd700;
          font-weight: bold;
          font-size: 1.1rem;
          text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
        }

        .combat-ui {
          height: 200px;
          background: rgba(0, 0, 0, 0.9);
          border-top: 2px solid #a855f7;
          display: flex;
          padding: 20px;
          gap: 20px;
        }

        .combat-stats {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .hunter-info {
          background: rgba(168, 85, 247, 0.1);
          border: 1px solid #a855f7;
          border-radius: 10px;
          padding: 15px;
          width: 35%;
        }

        .hunter-info h3 {
          margin: 0 0 10px 0;
          color: #a855f7;
          font-size: 1.2rem;
        }

        .stat-line {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
          color: #ccc;
          font-size: 0.9rem;
        }

        .combat-log {
          flex: 1;
          max-width: 400px;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid #333;
          border-radius: 10px;
          padding: 15px;
          overflow-y: auto;
        }

        .log-entry {
          color: #ffd700;
          margin: 5px 0;
          font-size: 0.9rem;
        }

        .winner-banner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.95);
          border: 3px solid #ffd700;
          border-radius: 20px;
          padding: 30px 60px;
          text-align: center;
          animation: power-up 0.5s ease-out;
        }

        .winner-text {
          font-size: 2.5rem;
          color: #ffd700;
          margin-bottom: 10px;
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
        }

        .winner-name {
          font-size: 1.8rem;
          color: #a855f7;
          font-weight: bold;
        }

        .close-button {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 50px;
          height: 50px;
          background: rgba(239, 68, 68, 0.2);
          border: 2px solid #ef4444;
          border-radius: 50%;
          color: #ef4444;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-button:hover {
          background: rgba(239, 68, 68, 0.4);
          transform: scale(1.1);
        }

        @media (max-width: 768px) {
          .fighter {
            width: 60px;
            height: 60px;
          }
          
          .fighter.left {
            left: 10%;
          }
          
          .fighter.right {
            right: 10%;
          }
          
          .combat-ui {
            flex-direction: column;
            height: auto;
          }
          
          .hunter-info {
            width: 100%;
          }
          
          .tv-commentary {
            font-size: 0.9rem;
            padding: 10px 20px;
          }
        }
      `}</style>

      <div className="combat-overlay">
        {/* ARÈNE DE COMBAT */}
        <div className="combat-arena" ref={arenaRef}>
          <div className="arena-floor" />
          
          {/* FIGHTER 1 (GAUCHE) */}
          <div className={`fighter left ${currentTurn % 2 === 1 && !combatEnded ? 'attacking-left' : ''} ${currentTurn % 2 === 0 && hunter1HP < 100 ? 'damaged' : ''}`}>
            <div className="fighter-name">{hunter1.name}</div>
            <div className="hp-bar-container">
              <div className="hp-bar">
                <div 
                  className={`hp-fill ${hunter1HP < 30 ? 'low' : hunter1HP < 60 ? 'medium' : ''}`}
                  style={{ width: `${hunter1HP}%` }}
                />
              </div>
            </div>
            <div className="fighter-sprite">
              {/* TODO: Remplacer par <img src={getSprite(hunter1.character, 'left')} /> */}
              ⚔️
            </div>
          </div>
          
          {/* FIGHTER 2 (DROITE) */}
          <div className={`fighter right ${currentTurn % 2 === 0 && !combatEnded ? 'attacking-right' : ''} ${currentTurn % 2 === 1 && hunter2HP < 100 ? 'damaged' : ''}`}>
            <div className="fighter-name">{hunter2.name}</div>
            <div className="hp-bar-container">
              <div className="hp-bar">
                <div 
                  className={`hp-fill ${hunter2HP < 30 ? 'low' : hunter2HP < 60 ? 'medium' : ''}`}
                  style={{ width: `${hunter2HP}%` }}
                />
              </div>
            </div>
            <div className="fighter-sprite">
              {/* TODO: Remplacer par <img src={getSprite(hunter2.character, 'right')} /> */}
              🛡️
            </div>
          </div>
          
          {/* COMMENTAIRE TV */}
          <div className="tv-commentary">
            <span className="tv-icon">📺</span>
            <span className="tv-text">{tvComment}</span>
          </div>
          
          {/* BANNIÈRE DE VICTOIRE */}
          {combatEnded && winner && (
            <div className="winner-banner">
              <div className="winner-text">🏆 VICTOIRE ! 🏆</div>
              <div className="winner-name">{winner.name}</div>
            </div>
          )}
        </div>
        
        {/* UI DE COMBAT */}
        <div className="combat-ui">
          <div className="combat-stats">
            {/* INFO HUNTER 1 */}
            <div className="hunter-info">
              <h3>{hunter1.name}</h3>
              <div className="stat-line">
                <span>HP:</span>
                <span>{Math.round(hunter1HP)}%</span>
              </div>
              <div className="stat-line">
                <span>Attack:</span>
                <span>{hunter1.stats?.Attack?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="stat-line">
                <span>CP:</span>
                <span>{hunter1.cp?.toLocaleString() || 'N/A'}</span>
              </div>
            </div>
            
            {/* LOG DE COMBAT */}
            <div className="combat-log">
              <h4 style={{ margin: 0, color: '#ffd700', marginBottom: '10px' }}>Journal de Combat</h4>
              {combatLog.map((log, index) => (
                <div key={index} className="log-entry">{log}</div>
              ))}
            </div>
            
            {/* INFO HUNTER 2 */}
            <div className="hunter-info">
              <h3>{hunter2.name}</h3>
              <div className="stat-line">
                <span>HP:</span>
                <span>{Math.round(hunter2HP)}%</span>
              </div>
              <div className="stat-line">
                <span>Attack:</span>
                <span>{hunter2.stats?.Attack?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="stat-line">
                <span>CP:</span>
                <span>{hunter2.cp?.toLocaleString() || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* BOUTON FERMER */}
        <button className="close-button" onClick={onClose}>✕</button>
      </div>
    </>,
    document.body
  );
};

export default CombatArena;