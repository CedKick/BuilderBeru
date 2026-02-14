// src/utils/ShadowAchievementManager.js
// Gestionnaire de Shadow Achievements - Succès Cross-Features
// Par Kaisel pour le Monarque des Ombres

import shadowCoinManager from '../components/ChibiSystem/ShadowCoinManager';

// ============================================================
// DEFINITIONS DES ACHIEVEMENTS
// ============================================================

export const ACHIEVEMENTS = {
  first_build: {
    id: 'first_build',
    name: 'Premier Build',
    description: 'Sauvegarder ton premier build de chasseur',
    icon: '\u2694\uFE0F',
    rarity: 'common',
    rewards: { shadowCoins: 100 },
    checkCondition: (data) => {
      return Object.keys(data.builds).length >= 1;
    },
    getProgress: (data) => {
      const current = Math.min(Object.keys(data.builds).length, 1);
      return { current, max: 1 };
    },
    unlockMessage: 'Premier pas dans les Ombres ! +100 Shadow Coins',
  },

  theorycraft_addict: {
    id: 'theorycraft_addict',
    name: 'Th\u00e9oricien des Ombres',
    description: 'Effectuer 5 sessions de Theorycraft',
    icon: '\uD83D\uDCCA',
    rarity: 'rare',
    rewards: { chibiId: 'beru_scientist', chibiRarity: 'rare' },
    checkCondition: (data) => {
      return (data.theorycraftSessions || 0) >= 5;
    },
    getProgress: (data) => {
      return { current: Math.min(data.theorycraftSessions || 0, 5), max: 5 };
    },
    unlockMessage: "L'Ombre analyse ! Chibi RARE d\u00e9bloqu\u00e9 : B\u00e9ru Scientifique",
  },

  artiste: {
    id: 'artiste',
    name: "L'Artiste",
    description: 'Sauvegarder 3 dessins dans DrawBeru',
    icon: '\uD83C\uDFA8',
    rarity: 'special',
    rewards: { chibiId: 'beru_painter', chibiRarity: 'legendaire' },
    checkCondition: (data) => {
      return (data.drawBeruSaves || 0) >= 3;
    },
    getProgress: (data) => {
      return { current: Math.min(data.drawBeruSaves || 0, 3), max: 3 };
    },
    unlockMessage: "Ma\u00eetre du pinceau ! Chibi SP\u00c9CIAL d\u00e9bloqu\u00e9 : B\u00e9ru Artiste",
  },

  meta_hunter: {
    id: 'meta_hunter',
    name: 'Chasseur de M\u00e9ta',
    description: 'Consulter 10 builds BDG',
    icon: '\uD83C\uDFC6',
    rarity: 'rare',
    rewards: { shadowCoins: 200 },
    checkCondition: (data) => {
      return (data.bdgConsultations || 0) >= 10;
    },
    getProgress: (data) => {
      return { current: Math.min(data.bdgConsultations || 0, 10), max: 10 };
    },
    unlockMessage: 'Expert du m\u00e9ta ! +200 Shadow Coins',
  },

  shadow_monarch: {
    id: 'shadow_monarch',
    name: 'Monarque des Ombres',
    description: 'D\u00e9bloquer TOUS les autres succ\u00e8s',
    icon: '\uD83D\uDC51',
    rarity: 'mythic',
    rewards: { chibiId: 'beru_monarch', chibiRarity: 'mythique' },
    checkCondition: (data) => {
      const required = ['first_build', 'theorycraft_addict', 'artiste', 'meta_hunter'];
      return required.every(id => data.unlockedSet.has(id));
    },
    getProgress: (data) => {
      const required = ['first_build', 'theorycraft_addict', 'artiste', 'meta_hunter'];
      const current = required.filter(id => data.unlockedSet.has(id)).length;
      return { current, max: 4 };
    },
    unlockMessage: "TU ES LE MONARQUE ! Chibi MYTHIQUE d\u00e9bloqu\u00e9 : B\u00e9ru Monarque Supr\u00eame",
  },
};

// ============================================================
// MANAGER CLASS
// ============================================================

class ShadowAchievementManager {
  constructor() {
    this.storageKey = 'builderberu_achievements';
    this.unlockedSet = new Set();
    this.callbacks = new Set();
    this.checkInterval = null;
    this.initialized = false;
  }

  // Initialiser le systeme
  init() {
    if (this.initialized) return;
    this.initialized = true;

    this.loadState();
    this.checkAllAchievements();
    this.startPeriodicCheck();
  }

  // Charger les achievements deja debloques
  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const ids = JSON.parse(saved);
        this.unlockedSet = new Set(ids);
      }
    } catch (e) {
      console.error('Erreur chargement achievements:', e);
    }
  }

  // Sauvegarder
  saveState() {
    localStorage.setItem(this.storageKey, JSON.stringify([...this.unlockedSet]));
  }

  // Assembler les donnees de jeu depuis localStorage
  gatherGameData() {
    const accountData = this.getAccountData();

    // Compter les sauvegardes DrawBeru
    let drawBeruSaves = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('drawberu_coloring_')) {
        drawBeruSaves++;
      }
    }

    return {
      builds: accountData?.builds || {},
      theorycraftSessions: accountData?.theorycraftSessions || 0,
      bdgConsultations: accountData?.bdgConsultations || 0,
      drawBeruSaves,
      unlockedSet: this.unlockedSet,
    };
  }

  // Verifier tous les achievements
  checkAllAchievements() {
    const data = this.gatherGameData();

    for (const [id, achievement] of Object.entries(ACHIEVEMENTS)) {
      if (this.unlockedSet.has(id)) continue;

      if (achievement.checkCondition(data)) {
        this.unlockAchievement(id);
      }
    }
  }

  // Debloquer un achievement
  unlockAchievement(id) {
    if (this.unlockedSet.has(id)) return;

    const achievement = ACHIEVEMENTS[id];
    if (!achievement) return;

    this.unlockedSet.add(id);
    this.saveState();

    // Rewards: Shadow Coins
    if (achievement.rewards.shadowCoins > 0) {
      shadowCoinManager.addCoins(achievement.rewards.shadowCoins, `achievement_${id}`);
    }

    // Rewards: Chibi
    if (achievement.rewards.chibiId) {
      this.unlockChibi(achievement.rewards.chibiId, achievement.rewards.chibiRarity);
    }

    // Event pour AchievementToast
    window.dispatchEvent(new CustomEvent('achievement-unlocked', {
      detail: { id, achievement }
    }));

    // Event pour FloatingBeruMascot
    window.dispatchEvent(new CustomEvent('beru-react', {
      detail: {
        message: achievement.unlockMessage,
        mood: 'proud',
        duration: 6000,
      }
    }));

    // Notifier les subscribers (AchievementBadges)
    this.callbacks.forEach(cb => cb(id, achievement));


    // Re-check pour cascade (shadow_monarch)
    setTimeout(() => this.checkAllAchievements(), 200);
  }

  // Debloquer un chibi dans le storage
  unlockChibi(chibiId, chibiRarity) {
    try {
      const storedData = localStorage.getItem('builderberu_users');
      const data = storedData ? JSON.parse(storedData) : { user: { accounts: {} } };
      const accounts = data.user.accounts;
      const firstAccount = Object.keys(accounts)[0] || 'default';

      if (!accounts[firstAccount]) accounts[firstAccount] = {};
      if (!accounts[firstAccount].chibis) accounts[firstAccount].chibis = {};
      if (!accounts[firstAccount].chibis.ownedChibis) accounts[firstAccount].chibis.ownedChibis = {};

      if (!accounts[firstAccount].chibis.ownedChibis[chibiId]) {
        accounts[firstAccount].chibis.ownedChibis[chibiId] = {
          unlockDate: new Date().toISOString(),
          unlockMethod: 'achievement',
          rarity: chibiRarity,
        };
        localStorage.setItem('builderberu_users', JSON.stringify(data));
      }
    } catch (e) {
      console.error('Erreur unlock chibi:', e);
    }
  }

  // Incrementer un compteur (Theorycraft sessions, BDG consultations)
  incrementCounter(key) {
    try {
      const storedData = localStorage.getItem('builderberu_users');
      const data = storedData ? JSON.parse(storedData) : { user: { accounts: {} } };
      const accounts = data.user.accounts;
      const firstAccount = Object.keys(accounts)[0] || 'default';

      if (!accounts[firstAccount]) accounts[firstAccount] = {};

      const current = accounts[firstAccount][key] || 0;
      accounts[firstAccount][key] = current + 1;

      localStorage.setItem('builderberu_users', JSON.stringify(data));

      // Check apres increment
      setTimeout(() => this.checkAllAchievements(), 100);
    } catch (e) {
      console.error('Erreur increment counter:', e);
    }
  }

  // Check periodique (30s)
  startPeriodicCheck() {
    if (this.checkInterval) return;
    this.checkInterval = setInterval(() => {
      this.checkAllAchievements();
    }, 30000);
  }

  // Lire les donnees du premier account
  getAccountData() {
    try {
      const storedData = localStorage.getItem('builderberu_users');
      if (!storedData) return null;
      const data = JSON.parse(storedData);
      const accounts = data?.user?.accounts || {};
      const firstAccount = Object.keys(accounts)[0];
      return firstAccount ? accounts[firstAccount] : null;
    } catch (e) {
      return null;
    }
  }

  // Stats pour les composants UI
  getStats() {
    return {
      unlocked: [...this.unlockedSet],
      total: Object.keys(ACHIEVEMENTS).length,
      progress: this.unlockedSet.size / Object.keys(ACHIEVEMENTS).length,
    };
  }

  // Tous les achievements avec leur statut
  getAll() {
    const data = this.gatherGameData();
    return Object.values(ACHIEVEMENTS).map(a => ({
      ...a,
      unlocked: this.unlockedSet.has(a.id),
      progress: a.getProgress(data),
    }));
  }

  // Subscribe aux unlock events
  subscribe(callback) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }
}

// Singleton
const shadowAchievementManager = new ShadowAchievementManager();
export default shadowAchievementManager;
