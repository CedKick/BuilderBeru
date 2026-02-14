// 🎮 CHIBI DATABASE STRUCTURE
// Structure complète pour gérer les 32 chibis avec leur lore, humeurs et interactions
// Par Kaisel 🐉 pour le Monarque des Ombres

// 🌟 CONSTANTES DU SYSTÈME
export const CHIBI_RARITIES = {
  MYTHIQUE: {
    id: 'mythique',
    name: 'Mythique',
    color: '#FF0000', // Rouge
    dropRate: 0.01, // 1%
    xpMultiplier: 3,
    affinityBonus: 50
  },
  LEGENDAIRE: {
    id: 'legendaire',
    name: 'Légendaire',
    color: '#FF8C00', // Orange
    dropRate: 0.09, // 9%
    xpMultiplier: 2,
    affinityBonus: 30
  },
  RARE: {
    id: 'rare',
    name: 'Rare',
    color: '#3B82F6', // Bleu
    dropRate: 0.30, // 30%
    xpMultiplier: 1.5,
    affinityBonus: 15
  },
  COMMUN: {
    id: 'commun',
    name: 'Commun',
    color: '#9CA3AF', // Gris
    dropRate: 0.60, // 60%
    xpMultiplier: 1,
    affinityBonus: 5
  }
};

// 🎭 HUMEURS DISPONIBLES
export const CHIBI_MOODS = {
  TAQUIN: { id: 'taquin', icon: '😏', color: '#F59E0B' },
  SAGE: { id: 'sage', icon: '🧘', color: '#6366F1' },
  FIER: { id: 'fier', icon: '😤', color: '#8B5CF6' },
  MYSTERIEUX: { id: 'mysterieux', icon: '🌙', color: '#6B7280' },
  PROTECTEUR: { id: 'protecteur', icon: '🛡️', color: '#10B981' },
  GOURMAND: { id: 'gourmand', icon: '🍖', color: '#F97316' },
  SOMNOLENT: { id: 'somnolent', icon: '😴', color: '#3B82F6' },
  FETARD: { id: 'fetard', icon: '🎉', color: '#EC4899' },
  INTREPIDE: { id: 'intrepide', icon: '⚔️', color: '#EF4444' },
  LOYAL: { id: 'loyal', icon: '🤝', color: '#059669' },
  ENERVE: { id: 'enerve', icon: '😡', color: '#DC2626' },
  TIMIDE: { id: 'timide', icon: '😳', color: '#F472B6' },
  FARCEUR: { id: 'farceur', icon: '😈', color: '#7C3AED' },
  CURIEUX: { id: 'curieux', icon: '🔍', color: '#06B6D4' },
  ROMANTIQUE: { id: 'romantique', icon: '💕', color: '#EC4899' },
  DRAMATIQUE: { id: 'dramatique', icon: '🎭', color: '#1F2937' }
};

// 🔓 MÉTHODES DE DÉBLOCAGE
export const UNLOCK_METHODS = {
  PULL: 'pull',
  EASTER_EGG: 'easter_egg',
  STREAK: 'streak',
  EVENT: 'event',
  QUEST: 'quest',
  ACHIEVEMENT: 'achievement',
  SPECIAL: 'special'
};

// 📊 STRUCTURE D'UN CHIBI
export class ChibiEntity {
  constructor(data) {
    // Identité
    this.id = data.id;
    this.name = data.name;
    this.rarity = data.rarity;
    this.unlockMethod = data.unlockMethod;
    this.unlockCondition = data.unlockCondition || null;
    
    // Apparence
    this.sprites = {
      idle: data.sprites?.idle || null,
      left: data.sprites?.left || null,
      right: data.sprites?.right || null,
      up: data.sprites?.up || null,
      down: data.sprites?.down || null,
      special: data.sprites?.special || null
    };
    
    // Personnalité
    this.personality = data.personality || {};
    this.defaultMood = data.defaultMood || 'sage';
    
    // Lore
    this.shortLore = data.shortLore || '';
    this.fullLore = data.fullLore || '';
    this.chapters = data.chapters || [];
    
    // Messages par humeur
    this.messages = data.messages || {};
    
    // Stats de base
    this.baseStats = {
      attack: data.baseStats?.attack || 10,
      defense: data.baseStats?.defense || 10,
      hp: data.baseStats?.hp || 100,
      mana: data.baseStats?.mana || 50,
      speed: data.baseStats?.speed || 5
    };
    
    // Progression
    this.level = 1;
    this.experience = 0;
    this.affinity = 0;
    this.unlockedChapters = [];
    this.currentMood = this.defaultMood;
    
    // Relations
    this.relationships = {};
    
    // État
    this.isActive = false;
    this.lastInteraction = null;
  }
  
  // 📈 Gagner de l'XP
  gainExperience(amount) {
    const rarity = CHIBI_RARITIES[this.rarity.toUpperCase()];
    this.experience += amount * (rarity?.xpMultiplier || 1);
    
    // Vérifier level up
    while (this.experience >= this.getRequiredXP()) {
      this.levelUp();
    }
  }
  
  // ⬆️ Level Up
  levelUp() {
    this.level++;
    this.experience -= this.getRequiredXP();
    
    // Augmenter les stats
    this.baseStats.attack += 2;
    this.baseStats.defense += 2;
    this.baseStats.hp += 10;
    this.baseStats.mana += 5;
    
    // Débloquer un chapitre tous les 5 niveaux
    if (this.level % 5 === 0) {
      const chapterIndex = Math.floor(this.level / 5) - 1;
      if (this.chapters[chapterIndex] && !this.unlockedChapters.includes(chapterIndex)) {
        this.unlockedChapters.push(chapterIndex);
        return { levelUp: true, newChapter: chapterIndex };
      }
    }
    
    return { levelUp: true };
  }
  
  // 📊 XP requise pour le prochain niveau
  getRequiredXP() {
    return this.level * 100 + Math.pow(this.level, 2) * 10;
  }
  
  // 💕 Augmenter l'affinité
  increaseAffinity(amount = 1) {
    const rarity = CHIBI_RARITIES[this.rarity.toUpperCase()];
    this.affinity += amount * (rarity?.affinityBonus || 1);
    
    // Débloquer des éléments selon l'affinité
    const affinityMilestones = [10, 25, 50, 75, 100, 150, 200];
    const currentMilestone = affinityMilestones.find(m => 
      this.affinity >= m && this.affinity - amount < m
    );
    
    if (currentMilestone) {
      return { milestone: currentMilestone, unlock: this.getAffinityReward(currentMilestone) };
    }
    
    return null;
  }
  
  // 🎁 Récompenses d'affinité
  getAffinityReward(milestone) {
    const rewards = {
      10: { type: 'mood', value: 'new_mood_unlocked' },
      25: { type: 'chapter', value: 0 },
      50: { type: 'special_message', value: 'affinity_50' },
      75: { type: 'chapter', value: 1 },
      100: { type: 'title', value: 'best_friend' },
      150: { type: 'chapter', value: 2 },
      200: { type: 'ultimate', value: 'true_form' }
    };
    
    return rewards[milestone] || null;
  }
  
  // 🎭 Changer d'humeur
  setMood(moodId) {
    if (CHIBI_MOODS[moodId.toUpperCase()]) {
      this.currentMood = moodId;
      this.lastInteraction = Date.now();
      return true;
    }
    return false;
  }
  
  // 💬 Obtenir un message selon l'humeur
  getMessage(moodOverride = null) {
    const mood = moodOverride || this.currentMood;
    const moodMessages = this.messages[mood] || this.messages[this.defaultMood] || [];
    
    if (moodMessages.length === 0) {
      return "...";
    }
    
    return moodMessages[Math.floor(Math.random() * moodMessages.length)];
  }
  
  // 🤝 Gérer les relations avec d'autres chibis
  updateRelationship(otherChibiId, change) {
    if (!this.relationships[otherChibiId]) {
      this.relationships[otherChibiId] = 0;
    }
    
    this.relationships[otherChibiId] += change;
    this.relationships[otherChibiId] = Math.max(-100, Math.min(100, this.relationships[otherChibiId]));
    
    return this.relationships[otherChibiId];
  }
  
  // 📊 Calculer les stats finales (avec bonus)
  getStats() {
    const levelBonus = {
      attack: this.level * 2,
      defense: this.level * 2,
      hp: this.level * 10,
      mana: this.level * 5,
      speed: Math.floor(this.level / 10)
    };
    
    const affinityBonus = {
      attack: Math.floor(this.affinity / 10),
      defense: Math.floor(this.affinity / 10),
      hp: Math.floor(this.affinity / 5),
      mana: Math.floor(this.affinity / 8),
      speed: Math.floor(this.affinity / 20)
    };
    
    return {
      attack: this.baseStats.attack + levelBonus.attack + affinityBonus.attack,
      defense: this.baseStats.defense + levelBonus.defense + affinityBonus.defense,
      hp: this.baseStats.hp + levelBonus.hp + affinityBonus.hp,
      mana: this.baseStats.mana + levelBonus.mana + affinityBonus.mana,
      speed: this.baseStats.speed + levelBonus.speed + affinityBonus.speed
    };
  }
  
  // 🎮 Peut interagir ?
  canInteract() {
    const cooldown = 30000; // 30 secondes
    return !this.lastInteraction || (Date.now() - this.lastInteraction > cooldown);
  }
  
  // 💾 Sauvegarder l'état
  toJSON() {
    return {
      id: this.id,
      level: this.level,
      experience: this.experience,
      affinity: this.affinity,
      currentMood: this.currentMood,
      unlockedChapters: this.unlockedChapters,
      relationships: this.relationships,
      lastInteraction: this.lastInteraction
    };
  }
  
  // 📥 Charger l'état
  loadState(savedData) {
    if (savedData.level) this.level = savedData.level;
    if (savedData.experience) this.experience = savedData.experience;
    if (savedData.affinity) this.affinity = savedData.affinity;
    if (savedData.currentMood) this.currentMood = savedData.currentMood;
    if (savedData.unlockedChapters) this.unlockedChapters = savedData.unlockedChapters;
    if (savedData.relationships) this.relationships = savedData.relationships;
    if (savedData.lastInteraction) this.lastInteraction = savedData.lastInteraction;
  }
}

// 🏭 FACTORY POUR CRÉER DES CHIBIS
export class ChibiFactory {
  constructor(database) {
    this.database = database;
  }
  
  // Créer un chibi à partir de son ID
  createChibi(chibiId, savedState = null) {
    const data = this.database[chibiId];
    if (!data) {
      console.error(`Chibi ${chibiId} non trouvé dans la base de données`);
      return null;
    }
    
    const chibi = new ChibiEntity(data);
    
    // Charger l'état sauvegardé si disponible
    if (savedState) {
      chibi.loadState(savedState);
    }
    
    return chibi;
  }
  
  // Obtenir un chibi aléatoire selon les taux de drop
  getRandomChibiForPull() {
    const roll = Math.random();
    let cumulative = 0;
    let selectedRarity = 'commun';
    
    // Déterminer la rareté
    for (const [key, rarity] of Object.entries(CHIBI_RARITIES)) {
      cumulative += rarity.dropRate;
      if (roll <= cumulative) {
        selectedRarity = rarity.id;
        break;
      }
    }
    
    // Filtrer les chibis par rareté et méthode d'obtention
    const availableChibis = Object.values(this.database).filter(chibi => 
      chibi.rarity.toLowerCase() === selectedRarity &&
      chibi.unlockMethod === UNLOCK_METHODS.PULL
    );
    
    if (availableChibis.length === 0) {
      console.warn(`Aucun chibi trouvé pour la rareté ${selectedRarity}`);
      return null;
    }
    
    // Sélectionner un chibi aléatoire
    const selected = availableChibis[Math.floor(Math.random() * availableChibis.length)];
    return this.createChibi(selected.id);
  }
  
  // Obtenir les chibis débloquables par condition
  getUnlockableChibis(conditions) {
    const unlockable = [];
    
    for (const [id, data] of Object.entries(this.database)) {
      // Vérifier les conditions de déblocage
      if (data.unlockMethod === UNLOCK_METHODS.STREAK && conditions.streak >= data.unlockCondition) {
        unlockable.push(id);
      } else if (data.unlockMethod === UNLOCK_METHODS.ACHIEVEMENT && conditions.achievements?.includes(data.unlockCondition)) {
        unlockable.push(id);
      } else if (data.unlockMethod === UNLOCK_METHODS.EASTER_EGG && conditions.easterEggs?.includes(data.unlockCondition)) {
        unlockable.push(id);
      }
    }
    
    return unlockable;
  }
}

// 🎯 GESTIONNAIRE D'INTERACTIONS
export class ChibiInteractionManager {
  constructor() {
    this.interactions = new Map();
    this.setupInteractionTypes();
  }
  
  setupInteractionTypes() {
    // Types d'interactions possibles
    this.interactionTypes = {
      PET: { 
        affinityGain: 2, 
        xpGain: 10,
        moodChange: { from: ['enerve', 'timide'], to: 'taquin' }
      },
      FEED: {
        affinityGain: 3,
        xpGain: 15,
        moodChange: { from: ['gourmand'], to: 'fier' },
        cooldown: 60000 // 1 minute
      },
      PLAY: {
        affinityGain: 5,
        xpGain: 25,
        moodChange: { from: ['somnolent'], to: 'fetard' },
        cooldown: 300000 // 5 minutes
      },
      TALK: {
        affinityGain: 1,
        xpGain: 5,
        triggerMessage: true
      },
      GIFT: {
        affinityGain: 10,
        xpGain: 50,
        moodChange: { to: 'romantique' },
        cooldown: 86400000 // 24 heures
      }
    };
  }
  
  // Gérer une interaction
  interact(chibi, interactionType, data = {}) {
    const interaction = this.interactionTypes[interactionType];
    if (!interaction) return { success: false, reason: 'invalid_interaction' };
    
    // Vérifier le cooldown
    const lastInteraction = this.interactions.get(`${chibi.id}_${interactionType}`);
    if (lastInteraction && interaction.cooldown) {
      const timeSince = Date.now() - lastInteraction;
      if (timeSince < interaction.cooldown) {
        return { 
          success: false, 
          reason: 'cooldown',
          timeRemaining: interaction.cooldown - timeSince
        };
      }
    }
    
    // Appliquer les effets
    const results = {
      affinityGained: 0,
      xpGained: 0,
      moodChanged: false,
      message: null,
      rewards: []
    };
    
    // Gain d'affinité
    if (interaction.affinityGain) {
      const affinityResult = chibi.increaseAffinity(interaction.affinityGain);
      results.affinityGained = interaction.affinityGain;
      if (affinityResult) {
        results.rewards.push(affinityResult);
      }
    }
    
    // Gain d'XP
    if (interaction.xpGain) {
      const levelBefore = chibi.level;
      chibi.gainExperience(interaction.xpGain);
      results.xpGained = interaction.xpGain;
      if (chibi.level > levelBefore) {
        results.rewards.push({ type: 'level_up', value: chibi.level });
      }
    }
    
    // Changement d'humeur
    if (interaction.moodChange) {
      const currentMood = chibi.currentMood;
      if (!interaction.moodChange.from || interaction.moodChange.from.includes(currentMood)) {
        chibi.setMood(interaction.moodChange.to);
        results.moodChanged = true;
      }
    }
    
    // Message
    if (interaction.triggerMessage) {
      results.message = chibi.getMessage();
    }
    
    // Enregistrer l'interaction
    this.interactions.set(`${chibi.id}_${interactionType}`, Date.now());
    chibi.lastInteraction = Date.now();
    
    return { success: true, results };
  }
  
  // Interaction spéciale entre deux chibis
  chibiInteraction(chibi1, chibi2) {
    // Vérifier la compatibilité
    const relationship = chibi1.relationships[chibi2.id] || 0;
    
    // Déterminer le type d'interaction selon la relation
    let interactionResult;
    if (relationship > 50) {
      // Amis proches
      interactionResult = {
        type: 'friendly',
        mood1: 'taquin',
        mood2: 'taquin',
        relationshipChange: 5,
        message: `${chibi1.name} et ${chibi2.name} jouent ensemble !`
      };
    } else if (relationship < -50) {
      // Rivaux
      interactionResult = {
        type: 'rivalry',
        mood1: 'enerve',
        mood2: 'fier',
        relationshipChange: -2,
        message: `${chibi1.name} et ${chibi2.name} se défient du regard !`
      };
    } else {
      // Neutre
      interactionResult = {
        type: 'neutral',
        mood1: 'curieux',
        mood2: 'timide',
        relationshipChange: 3,
        message: `${chibi1.name} observe ${chibi2.name} avec curiosité.`
      };
    }
    
    // Appliquer les changements
    chibi1.setMood(interactionResult.mood1);
    chibi2.setMood(interactionResult.mood2);
    chibi1.updateRelationship(chibi2.id, interactionResult.relationshipChange);
    chibi2.updateRelationship(chibi1.id, interactionResult.relationshipChange);
    
    return interactionResult;
  }
}

// 🌟 EXPORT FINAL
export default {
  CHIBI_RARITIES,
  CHIBI_MOODS,
  UNLOCK_METHODS,
  ChibiEntity,
  ChibiFactory,
  ChibiInteractionManager
};