// 🎮 SYSTÈME DE PROGRESSION BERUVIAN WORLD

const STORAGE_KEY = 'beruvianbeta_users';

// Formules de progression
const LEVEL_FORMULA = {
  getRequiredXP: (level) => Math.floor(100 * Math.pow(1.5, level - 1)),
  getStatBonus: (level, baseStat) => Math.floor(baseStat * (1 + (level - 1) * 0.1))
};

// Stats de base par classe
const BASE_STATS = {
  DPS: { hp: 100, attack: 25, defense: 10, vision: 20 },
  Tank: { hp: 150, attack: 15, defense: 25, vision: 15 },
  Support: { hp: 80, attack: 20, defense: 15, vision: 25 }
};

class PlayerProgressionSystem {
  constructor() {
    this.loadPlayer();
  }

  // 📦 Charger le joueur depuis localStorage
  loadPlayer() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      this.playerData = JSON.parse(savedData);
    } else {
      // Créer un nouveau joueur
      this.playerData = this.createNewPlayer();
      this.savePlayer();
    }
    return this.playerData;
  }

  // 💾 Sauvegarder le joueur
  savePlayer() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.playerData));
  }

  // 🆕 Créer un nouveau joueur
  createNewPlayer() {
    return {
      id: Date.now(),
      name: "Shadow Hunter #1",
      level: 1,
      xp: 0,
      totalXP: 0,
      class: "DPS",
      stats: {
        hp: 100,
        maxHp: 100,
        attack: 25,
        defense: 10,
        vision: 20
      },
      inventory: {
        shadowCrystals: 0,
        lightEssence: 0,
        earthFragments: 0
      },
      achievements: [],
      questsCompleted: [],
      zonesExplored: ["B2"], // Zone de départ
      lastPlayed: Date.now(),
      playtime: 0,
      resonanceHistory: [],
      currentResonance: null,
      corruption: 0
    };
  }

  // ⬆️ Gagner de l'XP
  gainXP(amount) {
    this.playerData.xp += amount;
    this.playerData.totalXP += amount;
    
    // Vérifier si level up
    const requiredXP = LEVEL_FORMULA.getRequiredXP(this.playerData.level);
    
    while (this.playerData.xp >= requiredXP) {
      this.levelUp();
    }
    
    this.savePlayer();
    return {
      xpGained: amount,
      currentXP: this.playerData.xp,
      requiredXP: LEVEL_FORMULA.getRequiredXP(this.playerData.level),
      level: this.playerData.level
    };
  }

  // 🎉 Monter de niveau
  levelUp() {
    const requiredXP = LEVEL_FORMULA.getRequiredXP(this.playerData.level);
    this.playerData.xp -= requiredXP;
    this.playerData.level += 1;
    
    // Calculer les nouvelles stats
    const baseStats = BASE_STATS[this.playerData.class];
    const oldStats = { ...this.playerData.stats };
    
    this.playerData.stats = {
      hp: LEVEL_FORMULA.getStatBonus(this.playerData.level, baseStats.hp),
      maxHp: LEVEL_FORMULA.getStatBonus(this.playerData.level, baseStats.hp),
      attack: LEVEL_FORMULA.getStatBonus(this.playerData.level, baseStats.attack),
      defense: LEVEL_FORMULA.getStatBonus(this.playerData.level, baseStats.defense),
      vision: LEVEL_FORMULA.getStatBonus(this.playerData.level, baseStats.vision)
    };
    
    // Restaurer full HP au level up
    this.playerData.stats.hp = this.playerData.stats.maxHp;
    
    
    return {
      newLevel: this.playerData.level,
      statsGained: {
        hp: this.playerData.stats.maxHp - oldStats.maxHp,
        attack: this.playerData.stats.attack - oldStats.attack,
        defense: this.playerData.stats.defense - oldStats.defense,
        vision: this.playerData.stats.vision - oldStats.vision
      }
    };
  }

  // 🗺️ Explorer une nouvelle zone
  exploreZone(zoneId) {
    if (!this.playerData.zonesExplored.includes(zoneId)) {
      this.playerData.zonesExplored.push(zoneId);
      const xpReward = 50; // XP pour découvrir une nouvelle zone
      this.savePlayer();
      return this.gainXP(xpReward);
    }
    return null;
  }

  // ⚔️ Gagner un combat
  winCombat(enemyLevel) {
    const baseXP = 20;
    const levelDiff = enemyLevel - this.playerData.level;
    const xpMultiplier = Math.max(0.5, 1 + levelDiff * 0.1);
    const xpReward = Math.floor(baseXP * xpMultiplier);
    
    return this.gainXP(xpReward);
  }

  // 💎 Collecter des ressources
  collectResource(type, amount = 1) {
    if (this.playerData.inventory[type] !== undefined) {
      this.playerData.inventory[type] += amount;
      this.savePlayer();
      
      // Petit bonus XP pour la collecte
      this.gainXP(5 * amount);
      
      return {
        type,
        amount,
        total: this.playerData.inventory[type]
      };
    }
    return null;
  }

  // 🌀 Ajouter une résonance à l'historique
  addResonance(shadowData) {
    this.playerData.resonanceHistory.push({
      shadow: shadowData.shadow.name,
      level: shadowData.level,
      timestamp: Date.now()
    });
    
    this.playerData.currentResonance = shadowData;
    
    // Gagner de l'XP pour la résonance
    const xpReward = 30 * shadowData.level;
    this.savePlayer();
    
    return this.gainXP(xpReward);
  }

  // 🎯 Compléter une quête
  completeQuest(questId, xpReward = 100) {
    if (!this.playerData.questsCompleted.includes(questId)) {
      this.playerData.questsCompleted.push(questId);
      this.savePlayer();
      return this.gainXP(xpReward);
    }
    return null;
  }

  // 📊 Obtenir les stats actuelles
  getCurrentStats() {
    return {
      ...this.playerData.stats,
      level: this.playerData.level,
      xp: this.playerData.xp,
      xpRequired: LEVEL_FORMULA.getRequiredXP(this.playerData.level),
      xpProgress: this.playerData.xp / LEVEL_FORMULA.getRequiredXP(this.playerData.level)
    };
  }

  // 🏆 Système d'achievements
  checkAchievements() {
    const achievements = [];
    
    // Achievement : Premier niveau 10
    if (this.playerData.level >= 10 && !this.playerData.achievements.includes('level_10')) {
      this.playerData.achievements.push('level_10');
      achievements.push({
        id: 'level_10',
        name: 'Apprenti Hunter',
        description: 'Atteindre le niveau 10',
        xpReward: 200
      });
    }
    
    // Achievement : Explorer 10 zones
    if (this.playerData.zonesExplored.length >= 10 && !this.playerData.achievements.includes('explorer_10')) {
      this.playerData.achievements.push('explorer_10');
      achievements.push({
        id: 'explorer_10',
        name: 'Explorateur',
        description: 'Explorer 10 zones différentes',
        xpReward: 150
      });
    }
    
    // Donner les récompenses
    achievements.forEach(achievement => {
      this.gainXP(achievement.xpReward);
    });
    
    if (achievements.length > 0) {
      this.savePlayer();
    }
    
    return achievements;
  }

  // 🔄 Reset (pour les tests)
  resetPlayer() {
    this.playerData = this.createNewPlayer();
    this.savePlayer();
    return this.playerData;
  }
}

// Export singleton
const playerProgression = new PlayerProgressionSystem();
export default playerProgression;