// 🎯 TWITCH API INTELLIGENCE SYSTEM - KAISEL
class TwitchIntelligence {
  constructor() {
    this.CLIENT_ID = process.env.TWITCH_CLIENT_ID;
    this.CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
    this.ACCESS_TOKEN = null;
    
    // 📋 LISTE DES STREAMERS PRÉDÉFINIS
    this.targetStreamers = [
      'montongamingworld',  // ⭐ AJOUTÉ POUR TEST
      'StreamerSolo23',
      'SLArise_Pro', 
      'HunterMaster',
      'SoloLevelingKing',
      'AriseGamer',
      // ... ajouter tes streamers favoris
    ];
    
    // 🎮 NOMS DE JEUX OFFICIELS SOLO LEVELING
    this.soloLevelingGames = [
      'Solo Leveling: Arise',
      'Solo Leveling Arise', 
      'SoloLeveling: Arise',
      'Solo Leveling',
      // Variations possibles du nom officiel
    ];
  }

  // 🔑 AUTHENTIFICATION TWITCH
  async authenticate() {
    try {
      const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.CLIENT_ID,
          client_secret: this.CLIENT_SECRET,
          grant_type: 'client_credentials'
        })
      });

      const data = await response.json();
      this.ACCESS_TOKEN = data.access_token;
      return true;
    } catch (error) {
      console.error('🚨 Kaisel: Twitch auth failed:', error);
      return false;
    }
  }

  // 📺 SCANNER LES STREAMS SOLO LEVELING
  async scanSoloLevelingStreams() {
    if (!this.ACCESS_TOKEN) {
      await this.authenticate();
    }

    try {
      // 🔍 MÉTHODE 1: Rechercher par jeu officiel
      const gameStreams = await this.searchByGame();
      
      // 🔍 MÉTHODE 2: Vérifier streamers prédéfinis (filtrer par jeu)
      const predefinedStreams = await this.checkPredefinedStreamers();

      // 🎯 COMBINER ET DÉDUPLIQUER
      const allStreams = this.combineAndDedup([
        ...gameStreams,
        ...predefinedStreams
      ]);

      return this.formatStreamResults(allStreams);
    } catch (error) {
      console.error('🚨 Kaisel: Stream scan failed:', error);
      return [];
    }
  }

  // 🎮 RECHERCHE PAR JEU SPÉCIFIQUE
  async searchByGame() {
    try {
      // 1. Trouver l'ID du jeu "Solo Leveling Arise"
      const gameResponse = await fetch(
        `https://api.twitch.tv/helix/games?name=Solo%20Leveling%20Arise`,
        {
          headers: {
            'Client-ID': this.CLIENT_ID,
            'Authorization': `Bearer ${this.ACCESS_TOKEN}`
          }
        }
      );

      const gameData = await gameResponse.json();
      if (!gameData.data.length) return [];

      const gameId = gameData.data[0].id;

      // 2. Récupérer les streams de ce jeu
      const streamsResponse = await fetch(
        `https://api.twitch.tv/helix/streams?game_id=${gameId}&first=20`,
        {
          headers: {
            'Client-ID': this.CLIENT_ID,
            'Authorization': `Bearer ${this.ACCESS_TOKEN}`
          }
        }
      );

      const streamsData = await streamsResponse.json();
      return streamsData.data || [];
    } catch (error) {
      console.error('🚨 Game search failed:', error);
      return [];
    }
  }

  // 👥 VÉRIFIER STREAMERS PRÉDÉFINIS
  async checkPredefinedStreamers() {
    try {
      const usernames = this.targetStreamers.join('&login=');
      const response = await fetch(
        `https://api.twitch.tv/helix/users?login=${usernames}`,
        {
          headers: {
            'Client-ID': this.CLIENT_ID,
            'Authorization': `Bearer ${this.ACCESS_TOKEN}`
          }
        }
      );

      const userData = await response.json();
      if (!userData.data.length) return [];

      // Récupérer les streams actifs de ces users
      const userIds = userData.data.map(user => user.id).join('&user_id=');
      const streamsResponse = await fetch(
        `https://api.twitch.tv/helix/streams?user_id=${userIds}`,
        {
          headers: {
            'Client-ID': this.CLIENT_ID,
            'Authorization': `Bearer ${this.ACCESS_TOKEN}`
          }
        }
      );

      const streamsData = await streamsResponse.json();
      
      // Filtrer par nom de jeu Solo Leveling
      return this.filterBySoloLevelingGame(streamsData.data || []);
    } catch (error) {
      console.error('🚨 Predefined streamers check failed:', error);
      return [];
    }
  }

  // 🔍 RECHERCHE PAR MOTS-CLÉS
  async searchByKeywords() {
    const results = [];
    
    for (const keyword of this.soloLevelingKeywords.slice(0, 3)) { // Limite API calls
      try {
        const response = await fetch(
          `https://api.twitch.tv/helix/search/channels?query=${encodeURIComponent(keyword)}&first=10`,
          {
            headers: {
              'Client-ID': this.CLIENT_ID,
              'Authorization': `Bearer ${this.ACCESS_TOKEN}`
            }
          }
        );

        const searchData = await response.json();
        if (searchData.data) {
          // Vérifier si ces chaînes sont en live
          const liveStreams = await this.checkIfChannelsLive(searchData.data);
          results.push(...liveStreams);
        }
      } catch (error) {
        console.error(`🚨 Keyword search failed for ${keyword}:`, error);
      }
    }

    return results;
  }

  // ✅ VÉRIFIER SI LES CHAÎNES SONT EN LIVE
  async checkIfChannelsLive(channels) {
    try {
      const userIds = channels.slice(0, 10).map(ch => ch.id).join('&user_id=');
      const response = await fetch(
        `https://api.twitch.tv/helix/streams?user_id=${userIds}`,
        {
          headers: {
            'Client-ID': this.CLIENT_ID,
            'Authorization': `Bearer ${this.ACCESS_TOKEN}`
          }
        }
      );

      const streamsData = await response.json();
      return this.filterBySoloLevelingKeywords(streamsData.data || []);
    } catch (error) {
      console.error('🚨 Live check failed:', error);
      return [];
    }
  }

  // 🎯 FILTRER PAR NOM DE JEU OFFICIEL
  filterBySoloLevelingGame(streams) {
    return streams.filter(stream => {
      const gameName = stream.game_name;
      
      return this.soloLevelingGames.some(gameVariant => 
        gameName.toLowerCase().includes(gameVariant.toLowerCase())
      );
    });
  }

  // 🔄 COMBINER ET DÉDUPLIQUER
  combineAndDedup(streamArrays) {
    const seen = new Set();
    const unique = [];

    streamArrays.forEach(stream => {
      if (!seen.has(stream.user_id)) {
        seen.add(stream.user_id);
        unique.push(stream);
      }
    });

    return unique;
  }

  // 📊 FORMATER LES RÉSULTATS
  formatStreamResults(streams) {
    return streams
      .sort((a, b) => b.viewer_count - a.viewer_count) // Trier par viewers
      .map(stream => ({
        username: stream.user_name,
        title: stream.title,
        viewers: stream.viewer_count,
        game: stream.game_name,
        url: `https://twitch.tv/${stream.user_login}`,
        thumbnail: stream.thumbnail_url.replace('{width}', '320').replace('{height}', '180'),
        isLive: true,
        priority: this.targetStreamers.includes(stream.user_login) ? 'high' : 'normal'
      }));
  }
}

// 🔧 INTÉGRATION DANS KAISEL MENU
export const initializeTwitchIntelligence = () => {
  return new TwitchIntelligence();
};

// 📺 FONCTION POUR KAISELINTERACTIONMENU
export const scanTwitchStreams = async () => {
  const twitch = new TwitchIntelligence();
  const streams = await twitch.scanSoloLevelingStreams();
  
  if (streams.length === 0) {
    return "📺 **TWITCH - SOLO LEVELING ARISE**\n\n❌ Aucun stream actif détecté\n\n🎯 Scan terminé par Kaisel ⚡";
  }

  let message = `📺 **STREAMS TWITCH LIVE - SOLO LEVELING ARISE**\n\n`;
  
  streams.slice(0, 5).forEach((stream, index) => {
    const priority = stream.priority === 'high' ? '⭐' : '🔴';
    message += `${priority} **${stream.username}** - ${stream.title}\n`;
    message += `   👥 ${stream.viewers} viewers | 🎮 ${stream.game}\n`;
    message += `   🔗 ${stream.url}\n\n`;
  });
  
  message += `🎯 Scan terminé par Kaisel ⚡`;
  return message;
};