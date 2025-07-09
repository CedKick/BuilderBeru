// CombatArena.jsx - ⚔️ SYSTÈME DE COMBAT BUILDERBERU v2.0 MOBILE
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

const CombatArena = ({ hunter1, hunter2, onClose, showTankMessage }) => {
  // 🎮 ÉTATS DE COMBAT AMÉLIORÉS
  const [hunter1HP, setHunter1HP] = useState(110); // Un peu plus de vie
  const [hunter1MaxHP] = useState(110);
  const [hunter2HP, setHunter2HP] = useState(100); // Vie normale
  const [hunter2MaxHP] = useState(100);
  
  const [combatLog, setCombatLog] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [combatEnded, setCombatEnded] = useState(false);
  const [winner, setWinner] = useState(null);
  const [tvComment, setTvComment] = useState("Le combat va commencer !");
  
  // 🎯 SYSTÈME DE SKILLS
  const [skill1Cooldown, setSkill1Cooldown] = useState(0);
  const [skill2Cooldown, setSkill2Cooldown] = useState(0);
  const [skill3Cooldown, setSkill3Cooldown] = useState(0);
  const [healCount, setHealCount] = useState(0); // Compteur de soins
  const [damageBoost, setDamageBoost] = useState(1); // Multiplicateur de dégâts
  
  const [isAttacking, setIsAttacking] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  
  const isMobile = window.innerWidth < 768;

  // 📺 COMMENTAIRES TV AMÉLIORÉS
  const TV_COMMENTS = {
    start: [
      "Le combat commence ! Qui l'emportera ?",
      "Face à face légendaire dans l'arène !",
      "La tension est à son comble !"
    ],
    hit: [
      "Coup solide !",
      "Ça fait mal !",
      "Belle attaque !",
      "Il encaisse !"
    ],
    critical: [
      "COUP CRITIQUE !!!",
      "DÉGÂTS MASSIFS !",
      "INCROYABLE !"
    ],
    skill: [
      "SKILL ACTIVÉ ! Puissance décuplée !",
      "Technique spéciale déclenchée !",
      "Le combat change de tournure !"
    ],
    low_hp: [
      "La fin est proche !",
      "Plus que quelques coups !",
      "Qui va craquer ?"
    ]
  };

  // 🎯 CALCUL DES DÉGÂTS ÉQUILIBRÉS
  const calculateDamage = (attacker, defender, isHunter1) => {
    const attack = attacker.stats?.Attack || 5000;
    const defense = defender.stats?.Defense || 5000;
    
    // Base damage réduite pour un combat plus long
    let damage = (attack * 1.2) - (defense * 0.4);
    damage = Math.max(damage * 0.08, attack * 0.05); // 5-8% des HP max
    
    // Avantage pour hunter1 (gauche)
    if (isHunter1) {
      damage *= 1.3; // +30% de dégâts
    } else {
      damage *= damageBoost; // Boost des skills pour hunter2
    }
    
    // Critical hit avec chance réduite
    const critChance = isHunter1 ? 0.15 : 0.1;
    const isCritical = Math.random() < critChance;
    if (isCritical) {
      damage *= 1.8;
    }
    
    // Variation aléatoire
    damage *= (0.9 + Math.random() * 0.2);
    
    // Convert to HP percentage
    const maxHP = isHunter1 ? hunter2MaxHP : hunter1MaxHP;
    const damagePercent = (damage / (defender.stats?.HP || 10000)) * 100;
    
    return {
      damage: Math.round(damage),
      damagePercent: Math.min(damagePercent, 20), // Max 20% par coup
      isCritical
    };
  };

  // 🎮 SYSTÈME DE SKILLS
  const useSkill = (skillNumber) => {
    if (combatEnded || isPaused) return;
    
    // Vérifier cooldown
    if (skillNumber === 1 && skill1Cooldown > 0) return;
    if (skillNumber === 2 && skill2Cooldown > 0) return;
    if (skillNumber === 3 && skill3Cooldown > 0) return;
    
    // Appliquer l'effet
    setIsPaused(true);
    
    switch(skillNumber) {
      case 1: // Boost d'attaque
        setDamageBoost(2);
        setSkill1Cooldown(5);
        setTvComment("💥 BOOST D'ATTAQUE ACTIVÉ ! Dégâts x2 !");
        setTimeout(() => setDamageBoost(1), 3000); // 3 secondes
        break;
        
      case 2: // Coup critique garanti
        setDamageBoost(3);
        setSkill2Cooldown(8);
        setTvComment("⚡ FRAPPE DÉVASTATRICE ! Prochain coup critique !");
        setTimeout(() => setDamageBoost(1), 1500); // 1 coup
        break;
        
      case 3: // Récupération (limité à 4 fois)
        if (healCount >= 4) {
          setTvComment("⚠️ LIMITE DE SOINS ATTEINTE !");
          return;
        }
        const healAmount = 15;
        setHunter2HP(prev => Math.min(prev + healAmount, 100));
        setSkill3Cooldown(10);
        setHealCount(prev => prev + 1);
        setTvComment(`💚 RÉGÉNÉRATION ! +15% HP (${4 - healCount - 1} restants)`);
        break;
    }
    
    setCombatLog(prev => [...prev.slice(-3), `🎯 ${hunter2.name} utilise une compétence !`]);
    
    setTimeout(() => setIsPaused(false), 1000);
  };

  // ⏱️ GESTION DES COOLDOWNS
  useEffect(() => {
    const cooldownInterval = setInterval(() => {
      setSkill1Cooldown(prev => Math.max(0, prev - 1));
      setSkill2Cooldown(prev => Math.max(0, prev - 1));
      setSkill3Cooldown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(cooldownInterval);
  }, []);

  // 🎮 BOUCLE DE COMBAT
  useEffect(() => {
    if (combatEnded || isPaused) return;

    const combatInterval = setInterval(() => {
      const isHunter1Turn = currentTurn % 2 === 1;
      const attacker = isHunter1Turn ? hunter1 : hunter2;
      const defender = isHunter1Turn ? hunter2 : hunter1;
      
      setIsAttacking(isHunter1Turn ? 'left' : 'right');
      
      const { damage, damagePercent, isCritical } = calculateDamage(attacker, defender, isHunter1Turn);
      
      if (isHunter1Turn) {
        const newHP = Math.max(0, hunter2HP - damagePercent);
        setHunter2HP(newHP);
        
        if (newHP <= 0) {
          setCombatEnded(true);
          setWinner(hunter1);
          setTvComment("🏆 VICTOIRE ÉCRASANTE DU CHAMPION !");
        } else if (newHP < 30) {
          setTvComment(TV_COMMENTS.low_hp[Math.floor(Math.random() * TV_COMMENTS.low_hp.length)]);
        }
      } else {
        const newHP = Math.max(0, hunter1HP - damagePercent);
        setHunter1HP(newHP);
        
        if (newHP <= 0) {
          setCombatEnded(true);
          setWinner(hunter2);
          setTvComment("🎉 INCROYABLE RETOURNEMENT ! VICTOIRE !");
        }
      }
      
      const logEntry = `${attacker.name} → ${damage.toLocaleString()} dégâts${isCritical ? ' ⚡CRIT!' : ''}`;
      setCombatLog(prev => [...prev.slice(-3), logEntry]);
      
      if (!combatEnded) {
        if (isCritical) {
          setTvComment(TV_COMMENTS.critical[Math.floor(Math.random() * TV_COMMENTS.critical.length)]);
        } else if (damageBoost > 1) {
          setTvComment(TV_COMMENTS.skill[Math.floor(Math.random() * TV_COMMENTS.skill.length)]);
        } else {
          setTvComment(TV_COMMENTS.hit[Math.floor(Math.random() * TV_COMMENTS.hit.length)]);
        }
      }
      
      setTimeout(() => setIsAttacking(null), 300);
      setCurrentTurn(prev => prev + 1);
      
    }, 1500); // Combat plus rapide

    return () => clearInterval(combatInterval);
  }, [currentTurn, hunter1HP, hunter2HP, combatEnded, isPaused, damageBoost]);

  return ReactDOM.createPortal(
    <>
      <style jsx>{`
        .combat-overlay {
          position: fixed;
          inset: 0;
          z-index: 999999;
          background: #0a0a0f;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* MOBILE FIRST DESIGN */
        .combat-arena {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          background: linear-gradient(to bottom, #1a1a2e, #0f0f1e);
        }

        .arena-battleground {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 200px;
        }

        .fighters-container {
          width: 100%;
          max-width: 500px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 20px;
        }

        .fighter {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .fighter-sprite {
          width: 60px;
          height: 60px;
          background: rgba(168, 85, 247, 0.2);
          border: 2px solid #a855f7;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          transition: all 0.3s;
        }

        .fighter.attacking .fighter-sprite {
          transform: scale(1.2);
          background: rgba(255, 100, 100, 0.4);
          box-shadow: 0 0 20px rgba(255, 100, 100, 0.8);
        }

        .fighter-info {
          text-align: center;
          width: 120px;
        }

        .fighter-name {
          font-weight: bold;
          color: white;
          font-size: 0.9rem;
          margin-bottom: 5px;
        }

        .hp-bar-container {
          width: 100%;
          background: rgba(0, 0, 0, 0.7);
          border: 1px solid #333;
          border-radius: 10px;
          overflow: hidden;
          height: 12px;
          position: relative;
        }

        .hp-bar-fill {
          height: 100%;
          background: linear-gradient(to right, #22c55e, #16a34a);
          transition: width 0.5s ease-out;
          position: relative;
          overflow: hidden;
        }

        .hp-bar-fill.low {
          background: linear-gradient(to right, #ef4444, #dc2626);
        }

        .hp-bar-fill.medium {
          background: linear-gradient(to right, #f59e0b, #d97706);
        }

        .hp-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 0.7rem;
          font-weight: bold;
          color: white;
          text-shadow: 0 0 2px black;
        }

        /* TV COMMENTARY */
        .tv-section {
          background: rgba(0, 0, 0, 0.9);
          border-top: 2px solid #ffd700;
          padding: 15px;
          text-align: center;
        }

        .tv-text {
          color: #ffd700;
          font-weight: bold;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        /* SKILLS SECTION - MOBILE */
        .skills-section {
          background: rgba(0, 0, 0, 0.95);
          border-top: 2px solid #a855f7;
          padding: 15px;
        }

        .skills-header {
          text-align: center;
          color: #a855f7;
          font-size: 0.9rem;
          margin-bottom: 10px;
          font-weight: bold;
        }

        .skills-container {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .skill-button {
          width: 80px;
          height: 80px;
          background: rgba(168, 85, 247, 0.1);
          border: 2px solid #a855f7;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
        }

        .skill-button:active {
          transform: scale(0.95);
        }

        .skill-button.on-cooldown {
          opacity: 0.5;
          cursor: not-allowed;
          background: rgba(50, 50, 50, 0.5);
        }

        .skill-icon {
          font-size: 1.8rem;
        }

        .skill-name {
          font-size: 0.7rem;
          color: white;
          font-weight: bold;
        }

        .skill-cooldown {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          font-size: 1.5rem;
          color: #ef4444;
          font-weight: bold;
        }

        /* COMBAT LOG - MOBILE */
        .combat-log-section {
          background: rgba(0, 0, 0, 0.8);
          padding: 10px;
          max-height: 100px;
          overflow-y: auto;
        }

        .log-entry {
          color: #ffd700;
          font-size: 0.75rem;
          margin: 3px 0;
          padding: 3px 8px;
          background: rgba(255, 215, 0, 0.1);
          border-radius: 4px;
        }

        /* WINNER BANNER */
        .winner-banner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.95);
          border: 3px solid #ffd700;
          border-radius: 20px;
          padding: 30px;
          text-align: center;
          animation: victoryPop 0.5s ease-out;
        }

        @keyframes victoryPop {
          0% { transform: translate(-50%, -50%) scale(0); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }

        .winner-text {
          font-size: 1.8rem;
          color: #ffd700;
          margin-bottom: 10px;
        }

        .winner-name {
          font-size: 1.4rem;
          color: #a855f7;
          font-weight: bold;
        }

        /* CLOSE BUTTON */
        .close-button {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 40px;
          height: 40px;
          background: rgba(239, 68, 68, 0.3);
          border: 2px solid #ef4444;
          border-radius: 50%;
          color: #ef4444;
          font-size: 1.2rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }

        /* DESKTOP ADJUSTMENTS */
        @media (min-width: 768px) {
          .fighters-container {
            max-width: 700px;
          }
          
          .fighter-sprite {
            width: 80px;
            height: 80px;
            font-size: 2.5rem;
          }
          
          .fighter-info {
            width: 150px;
          }
          
          .fighter-name {
            font-size: 1.1rem;
          }
          
          .hp-bar-container {
            height: 16px;
          }
          
          .tv-text {
            font-size: 1.1rem;
          }
          
          .skill-button {
            width: 100px;
            height: 100px;
          }
          
          .skill-icon {
            font-size: 2.2rem;
          }
          
          .skill-name {
            font-size: 0.8rem;
          }
          
          .combat-log-section {
            max-height: 120px;
          }
          
          .log-entry {
            font-size: 0.85rem;
          }
        }

        /* ANIMATIONS */
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .fighter.damaged .fighter-sprite {
          animation: shake 0.3s;
        }

        /* DISABLE SCROLLING */
        body {
          overflow: hidden !important;
        }
      `}</style>

      <div className="combat-overlay">
        {/* BOUTON FERMER */}
        <button className="close-button" onClick={onClose}>✕</button>

        {/* ARÈNE PRINCIPALE */}
        <div className="combat-arena">
          {/* ZONE DE COMBAT */}
          <div className="arena-battleground">
            <div className="fighters-container">
              {/* FIGHTER 1 (GAUCHE) */}
              <div className={`fighter ${isAttacking === 'left' ? 'attacking' : ''} ${isAttacking === 'right' ? 'damaged' : ''}`}>
                <div className="fighter-info">
                  <div className="fighter-name">{hunter1.name}</div>
                  <div className="hp-bar-container">
                    <div 
                      className={`hp-bar-fill ${hunter1HP < 30 ? 'low' : hunter1HP < 60 ? 'medium' : ''}`}
                      style={{ width: `${(hunter1HP / hunter1MaxHP) * 100}%` }}
                    />
                    <div className="hp-text">{Math.round(hunter1HP)}/{hunter1MaxHP}</div>
                  </div>
                </div>
                <div className="fighter-sprite">⚔️</div>
              </div>

              {/* FIGHTER 2 (DROITE) */}
              <div className={`fighter ${isAttacking === 'right' ? 'attacking' : ''} ${isAttacking === 'left' ? 'damaged' : ''}`}>
                <div className="fighter-info">
                  <div className="fighter-name">{hunter2.name}</div>
                  <div className="hp-bar-container">
                    <div 
                      className={`hp-bar-fill ${hunter2HP < 30 ? 'low' : hunter2HP < 60 ? 'medium' : ''}`}
                      style={{ width: `${(hunter2HP / hunter2MaxHP) * 100}%` }}
                    />
                    <div className="hp-text">{Math.round(hunter2HP)}/{hunter2MaxHP}</div>
                  </div>
                </div>
                <div className="fighter-sprite">🛡️</div>
              </div>
            </div>

            {/* BANNIÈRE DE VICTOIRE */}
            {combatEnded && winner && (
              <div className="winner-banner">
                <div className="winner-text">🏆 VICTOIRE ! 🏆</div>
                <div className="winner-name">{winner.name}</div>
              </div>
            )}
          </div>

          {/* COMMENTAIRE TV */}
          <div className="tv-section">
            <div className="tv-text">
              <span>📺</span>
              <span>{tvComment}</span>
            </div>
          </div>

          {/* SECTION SKILLS */}
          <div className="skills-section">
            <div className="skills-header">
              🎮 Compétences de {hunter2.name} (Touchez pour activer)
            </div>
            <div className="skills-container">
              {/* SKILL 1 - BOOST */}
              <button 
                className={`skill-button ${skill1Cooldown > 0 ? 'on-cooldown' : ''}`}
                onClick={() => useSkill(1)}
                disabled={skill1Cooldown > 0 || combatEnded}
              >
                <div className="skill-icon">💥</div>
                <div className="skill-name">Boost</div>
                {skill1Cooldown > 0 && (
                  <div className="skill-cooldown">{skill1Cooldown}</div>
                )}
              </button>

              {/* SKILL 2 - CRITICAL */}
              <button 
                className={`skill-button ${skill2Cooldown > 0 ? 'on-cooldown' : ''}`}
                onClick={() => useSkill(2)}
                disabled={skill2Cooldown > 0 || combatEnded}
              >
                <div className="skill-icon">⚡</div>
                <div className="skill-name">Critique</div>
                {skill2Cooldown > 0 && (
                  <div className="skill-cooldown">{skill2Cooldown}</div>
                )}
              </button>

              {/* SKILL 3 - HEAL */}
              <button 
                className={`skill-button ${skill3Cooldown > 0 || healCount >= 4 ? 'on-cooldown' : ''}`}
                onClick={() => useSkill(3)}
                disabled={skill3Cooldown > 0 || combatEnded || healCount >= 4}
              >
                <div className="skill-icon">💚</div>
                <div className="skill-name">Soin ({4 - healCount})</div>
                {skill3Cooldown > 0 && (
                  <div className="skill-cooldown">{skill3Cooldown}</div>
                )}
                {healCount >= 4 && (
                  <div className="skill-cooldown">MAX</div>
                )}
              </button>
            </div>
          </div>

          {/* LOG DE COMBAT */}
          <div className="combat-log-section">
            {combatLog.map((log, index) => (
              <div key={index} className="log-entry">{log}</div>
            ))}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default CombatArena;