// src/utils/ShadowCoinManager.js
// Gestionnaire de Shadow Coins avec gain passif
// Par Kaisel 🐉 pour le Monarque des Ombres

class ShadowCoinManager {
  constructor() {
    this.PASSIVE_GAIN_RATE = 10; // 10 coins par minute
    this.DAILY_BONUS = 100; // Bonus première connexion du jour
    this.TICK_INTERVAL = 60000; // 1 minute en ms
    this.storageKey = 'builderberu_shadow_coins';
    
    this.lastTick = null;
    this.tickInterval = null;
    this.updateCallbacks = new Set();
  }

  // 🚀 Initialiser le système
  init() {
    this.loadState();
    this.checkDailyBonus();
    this.startPassiveGain();
    
    // Gérer la visibilité de la page
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
    
    // Sauvegarder avant de quitter
    window.addEventListener('beforeunload', () => {
      this.saveState();
    });
  }

  // 💾 Charger l'état depuis localStorage
  loadState() {
    const data = localStorage.getItem(this.storageKey);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        this.lastTick = parsed.lastTick || Date.now();
        this.lastDailyBonus = parsed.lastDailyBonus || null;
        
        // PAS DE GAINS OFFLINE - L'utilisateur doit être connecté
        // Les gains ne se font que quand la page est active
      } catch (e) {
        console.error('Erreur chargement ShadowCoinManager:', e);
      }
    } else {
      this.lastTick = Date.now();
    }
  }

  // 💾 Sauvegarder l'état
  saveState() {
    const data = {
      lastTick: this.lastTick,
      lastDailyBonus: this.lastDailyBonus,
      lastSave: Date.now()
    };
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  // 🎁 Vérifier et donner le bonus quotidien
  checkDailyBonus() {
    const today = new Date().toDateString();
    
    if (this.lastDailyBonus !== today) {
      this.lastDailyBonus = today;
      this.addCoins(this.DAILY_BONUS, 'daily');
      this.notifyGain(this.DAILY_BONUS, 'daily');
      this.saveState();
      return true;
    }
    return false;
  }

  // ⏱️ Démarrer le gain passif
  startPassiveGain() {
    if (this.tickInterval) return;
    
    this.tickInterval = setInterval(() => {
      this.tick();
    }, this.TICK_INTERVAL);
    
    // Premier tick immédiat si assez de temps écoulé
    const timeSinceLastTick = Date.now() - this.lastTick;
    if (timeSinceLastTick >= this.TICK_INTERVAL) {
      this.tick();
    }
  }

  // 💰 Processus de gain périodique
  tick() {
    if (document.hidden) return; // Pas de gain si page cachée
    
    this.addCoins(this.PASSIVE_GAIN_RATE, 'passive');
    this.lastTick = Date.now();
    this.saveState();
  }

  // ➕ Ajouter des coins
  addCoins(amount, source = 'unknown') {
    const userData = this.getUserData();
    const currentCoins = userData?.shadowCoins || 0;
    const newTotal = currentCoins + amount;
    
    this.updateUserData({ shadowCoins: newTotal });
    
    // Log pour debug
    
    // Notifier les callbacks
    this.notifyUpdate(newTotal, amount, source);
  }

  // 🪙 Obtenir le solde actuel
  getBalance() {
    const userData = this.getUserData();
    return userData?.shadowCoins || 0;
  }

  // 💸 Dépenser des coins
  spendCoins(amount) {
    const current = this.getBalance();
    if (current >= amount) {
      this.updateUserData({ shadowCoins: current - amount });
      this.notifyUpdate(current - amount, -amount, 'spend');
      return true;
    }
    return false;
  }

  // 📢 S'abonner aux mises à jour
  subscribe(callback) {
    this.updateCallbacks.add(callback);
    // Retourner une fonction de désabonnement
    return () => this.updateCallbacks.delete(callback);
  }

  // 🔔 Notifier les changements
  notifyUpdate(newTotal, change, source) {
    this.updateCallbacks.forEach(callback => {
      callback({ total: newTotal, change, source });
    });
  }

  // 🎉 Notifier un gain spécial
  notifyGain(amount, type) {
    // Créer une notification visuelle
    if (type === 'daily') {
      this.showNotification('🎁 Bonus quotidien !', `+${amount} Shadow Coins`);
    } else if (type === 'offline') {
      this.showNotification('💤 Gains hors-ligne', `+${amount} Shadow Coins accumulés`);
    }
  }

  // 💬 Afficher une notification
  showNotification(title, message) {
    // À implémenter selon ton système de notifications
    
    // Notification navigateur si autorisée
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  }

  // ⏸️ Mettre en pause
  pause() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
      this.saveState();
    }
  }

  // ▶️ Reprendre
  resume() {
    this.loadState(); // Recharger pour calculer les gains offline
    this.startPassiveGain();
  }

  // 🔧 Utilitaires pour localStorage
  getUserData() {
    const storedData = localStorage.getItem('builderberu_users');
    if (!storedData) return null;
    
    try {
      const data = JSON.parse(storedData);
      const accounts = data?.user?.accounts || {};
      const firstAccount = Object.keys(accounts)[0] || 'default';
      return accounts[firstAccount]?.chibis || {};
    } catch (e) {
      console.error('Erreur lecture userData:', e);
      return null;
    }
  }

  updateUserData(updates) {
    const storedData = localStorage.getItem('builderberu_users');
    const data = storedData ? JSON.parse(storedData) : { user: { accounts: {} } };
    
    const accounts = data.user.accounts;
    const firstAccount = Object.keys(accounts)[0] || 'default';
    
    if (!accounts[firstAccount]) {
      accounts[firstAccount] = { chibis: {} };
    }
    
    if (!accounts[firstAccount].chibis) {
      accounts[firstAccount].chibis = {};
    }
    
    // Fusionner les mises à jour
    Object.assign(accounts[firstAccount].chibis, updates);
    
    localStorage.setItem('builderberu_users', JSON.stringify(data));
  }

  // 📊 Statistiques
  getStats() {
    return {
      balance: this.getBalance(),
      passiveRate: this.PASSIVE_GAIN_RATE,
      dailyBonus: this.DAILY_BONUS,
      nextTick: this.lastTick ? this.TICK_INTERVAL - (Date.now() - this.lastTick) : 0,
      hasClaimedDaily: this.lastDailyBonus === new Date().toDateString()
    };
  }
}

// Singleton
const shadowCoinManager = new ShadowCoinManager();

export default shadowCoinManager;