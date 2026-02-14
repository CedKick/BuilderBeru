// src/utils/EasterEggManager.js
// Gestionnaire d'Easter Eggs pour débloquer des Chibis spéciaux
// Par Kaisel 🐉 pour le Monarque des Ombres

class EasterEggManager {
  constructor() {
    this.storageKey = 'builderberu_easter_eggs';
    this.progressKey = 'builderberu_easter_progress';
    this.foundEggs = new Set();
    this.progress = {};
    this.callbacks = new Set();
    
    // Konami Code
    this.konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 
                           'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 
                           'b', 'a'];
    this.konamiProgress = [];
    
    this.loadState();
    this.initializeListeners();
  }

  // 💾 Charger l'état
  loadState() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      this.foundEggs = new Set(JSON.parse(saved));
    }
    
    const progress = localStorage.getItem(this.progressKey);
    if (progress) {
      this.progress = JSON.parse(progress);
    }
  }

  // 💾 Sauvegarder l'état
  saveState() {
    localStorage.setItem(this.storageKey, JSON.stringify([...this.foundEggs]));
    localStorage.setItem(this.progressKey, JSON.stringify(this.progress));
  }

  // 🎮 Initialiser les écouteurs globaux
  initializeListeners() {
    // Konami Code
    document.addEventListener('keydown', (e) => {
      this.konamiProgress.push(e.key);
      if (this.konamiProgress.length > this.konamiSequence.length) {
        this.konamiProgress.shift();
      }
      
      if (this.checkKonamiCode()) {
        this.unlockEasterEgg('konami_code');
        this.konamiProgress = [];
      }
    });
    
    // Détection de la console
    let devtools = { open: false, orientation: null };
    const threshold = 160;
    
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          this.incrementProgress('console_opens');
        }
      } else {
        devtools.open = false;
      }
    }, 500);
    
    // Détection d'inactivité
    let inactivityTimer;
    const resetInactivity = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        this.incrementProgress('sleep_mode_times');
      }, 10 * 60 * 1000); // 10 minutes
    };
    
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetInactivity, true);
    });
    
    resetInactivity();
    
    // Détection de l'heure
    this.checkMidnightConnection();
    setInterval(() => this.checkMidnightConnection(), 60000); // Vérifier chaque minute
  }

  // 🔍 Vérifier le Konami Code
  checkKonamiCode() {
    return this.konamiProgress.join(',') === this.konamiSequence.join(',');
  }

  // 🌙 Vérifier connexion nocturne
  checkMidnightConnection() {
    const hour = new Date().getHours();
    if (hour >= 0 && hour <= 3) {
      const today = new Date().toDateString();
      if (!this.progress.midnight_days) {
        this.progress.midnight_days = new Set();
      }
      
      if (!this.progress.midnight_days.has(today)) {
        this.progress.midnight_days.add(today);
        if (this.progress.midnight_days.size >= 7) {
          this.unlockEasterEgg('midnight_warrior');
        }
        this.saveState();
      }
    }
  }

  // 📈 Incrémenter un compteur
  incrementProgress(key, amount = 1) {
    if (!this.progress[key]) {
      this.progress[key] = 0;
    }
    
    this.progress[key] += amount;
    this.saveState();
    
    // Vérifier les conditions
    this.checkProgressUnlocks();
  }

  // 🎯 Vérifier les déblocages par progression
  checkProgressUnlocks() {
    const unlockConditions = {
      'console_opens': { count: 10, egg: 'debug_console_user' },
      'debug_fixes': { count: 100, egg: 'fix_100_bugs' },
      'sleep_mode_times': { count: 10, egg: 'sleep_mode_1000_times' },
      'chibi_feeds': { count: 100, egg: 'feed_100_times' },
      'tank_clicks': { count: 30, egg: 'click_30_times' },
      'perfect_days': { count: 30, egg: 'perfect_month' },
      'screenshots': { count: 50, egg: 'screenshot_master' }
    };
    
    for (const [key, condition] of Object.entries(unlockConditions)) {
      if (this.progress[key] >= condition.count && !this.foundEggs.has(condition.egg)) {
        this.unlockEasterEgg(condition.egg);
      }
    }
  }

  // 🎊 Débloquer un Easter Egg
  unlockEasterEgg(eggId) {
    if (this.foundEggs.has(eggId)) return;
    
    this.foundEggs.add(eggId);
    this.saveState();
    
    // Notification spéciale
    this.showEasterEggNotification(eggId);
    
    // Notifier les callbacks
    this.callbacks.forEach(callback => callback(eggId));
    
    // Easter egg spécial : trouver tous les secrets
    if (this.foundEggs.size >= 10 && !this.foundEggs.has('find_all_secrets')) {
      setTimeout(() => this.unlockEasterEgg('find_all_secrets'), 2000);
    }
  }

  // 💬 Afficher une notification d'Easter Egg
  showEasterEggNotification(eggId) {
    const messages = {
      'konami_code': '🎮 Code Konami activé! Le Gardien du Code se réveille...',
      'beru_evolution_secret': '🦋 Métamorphose! Béru évolue en Alecto!',
      'fix_100_bugs': '👻 100 bugs corrigés! Le Debuggeur Fantôme apparaît!',
      'sleep_mode_1000_times': '💤 L\'Architecte des Rêves vous accueille...',
      'midnight_warrior': '🌙 Guerrier Nocturne! Les ombres vous reconnaissent!',
      'find_all_secrets': '🔍 Maître des Secrets! Vous avez tout trouvé!'
    };
    
    const message = messages[eggId] || `🥚 Easter Egg découvert: ${eggId}!`;
    
    // Créer une notification épique
    const notification = document.createElement('div');
    notification.className = 'easter-egg-notification';
    notification.innerHTML = `
      <div class="easter-egg-content">
        <div class="easter-egg-icon">🥚</div>
        <div class="easter-egg-message">${message}</div>
        <div class="easter-egg-sparkles">✨</div>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0);
      background: linear-gradient(135deg, #6B46C1 0%, #EC4899 100%);
      color: white;
      padding: 30px 50px;
      border-radius: 20px;
      font-size: 20px;
      font-weight: bold;
      text-align: center;
      z-index: 100000;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      animation: easterEggReveal 0.5s ease-out forwards;
    `;
    
    document.body.appendChild(notification);
    
    // Effet sonore (si disponible)
    this.playEasterEggSound();
    
    // Retirer après 5 secondes
    setTimeout(() => {
      notification.style.animation = 'easterEggHide 0.5s ease-in forwards';
      setTimeout(() => notification.remove(), 500);
    }, 5000);
  }

  // 🔊 Jouer un son d'Easter Egg
  playEasterEggSound() {
    // À implémenter si tu as des sons
  }

  // 📊 Obtenir les statistiques
  getStats() {
    return {
      found: [...this.foundEggs],
      progress: { ...this.progress },
      total: this.foundEggs.size
    };
  }

  // 🔔 S'abonner aux découvertes
  subscribe(callback) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  // 🎯 Méthodes spécifiques pour certains easter eggs
  
  // Béru Evolution
  trackBeruClicks(count) {
    if (!this.progress.beru_clicks) this.progress.beru_clicks = 0;
    this.progress.beru_clicks = count;
    
    if (count >= 100) {
      // Attendre que l'utilisateur tape METAMORPHOSE
      this.waitForMetamorphose = true;
    }
  }
  
  // Tank doré
  trackTankClicks(isConsecutive = true) {
    if (!isConsecutive) {
      this.progress.tank_consecutive_clicks = 0;
      return;
    }
    
    this.incrementProgress('tank_consecutive_clicks');
    
    if (this.progress.tank_consecutive_clicks >= 30) {
      this.unlockEasterEgg('click_30_times');
      this.progress.tank_consecutive_clicks = 0;
    }
  }
  
  // Shadow Coins
  checkShadowMillionaire(coins) {
    if (coins >= 1000000 && !this.foundEggs.has('shadow_millionaire')) {
      this.unlockEasterEgg('shadow_millionaire');
    }
  }
  
  // Streak
  checkStreak(days) {
    if (days >= 365 && !this.foundEggs.has('streak_365')) {
      this.unlockEasterEgg('streak_365');
    }
  }
  
  // Affinité maximale
  checkMaxAffinity(chibiCount) {
    if (chibiCount >= 5 && !this.foundEggs.has('max_affinity_5_chibis')) {
      this.unlockEasterEgg('max_affinity_5_chibis');
    }
  }
}

// Styles CSS pour les notifications
const easterEggStyles = `
@keyframes easterEggReveal {
  0% {
    transform: translate(-50%, -50%) scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1) rotate(180deg);
  }
  100% {
    transform: translate(-50%, -50%) scale(1) rotate(360deg);
    opacity: 1;
  }
}

@keyframes easterEggHide {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
}

.easter-egg-sparkles {
  position: absolute;
  top: -10px;
  right: -10px;
  font-size: 30px;
  animation: sparkle 1s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}
`;

// Ajouter les styles
const styleSheet = document.createElement('style');
styleSheet.textContent = easterEggStyles;
document.head.appendChild(styleSheet);

// Singleton
const easterEggManager = new EasterEggManager();

export default easterEggManager;