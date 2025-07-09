// KaiselInteractionMenu.jsx - TECHNICAL INTELLIGENCE SYSTEM BY KAISEL - VERSION SÉCURISÉE
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { scanTwitchStreams } from '../utils/TwitchIntelligence';
import '../i18n/i18n';
import HallOfFlameDebugPopup from "./HallOfFlameDebugPopup";

// 🟣 TWITCH CHECKER FUNCTION V2 - AVEC VIEWERS ET LINK
const checkTwitchStreamer = async (streamerName) => {
  try {
    // Essayer une autre méthode pour les viewers
    const response = await fetch('https://gql.twitch.tv/gql', {
      method: 'POST',
      headers: {
        'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
      },
      body: JSON.stringify({
        query: `
          query {
            user(login: "${streamerName.toLowerCase()}") {
              displayName
              stream {
                title
                viewersCount
                game {
                  name
                }
              }
            }
          }
        `
      })
    });
    
    const data = await response.json();
    const user = data?.data?.user;
    const stream = user?.stream;
    
    if (stream) {
      return {
        isLive: true,
        streamer: user.displayName || streamerName,
        game: stream.game?.name || 'Jeu inconnu',
        title: stream.title || 'Sans titre',
        viewers: stream.viewersCount || 'N/A', // Peut-être que l'API publique cache ça
        streamUrl: `https://www.twitch.tv/${streamerName.toLowerCase()}`,
        isSoloLeveling: /solo\s*leveling/i.test(stream.game?.name || '')
      };
    } else {
      return {
        isLive: false,
        streamer: streamerName,
        streamUrl: `https://www.twitch.tv/${streamerName.toLowerCase()}`
      };
    }
  } catch (error) {
    console.error('Erreur Twitch check:', error);
    return {
      isLive: false,
      streamer: streamerName,
      error: true
    };
  }
};

const KaiselInteractionMenu = ({
  position,
  onClose,
  selectedCharacter,
  characters,
  showTankMessage,
  currentArtifacts = {},
  currentStats = {},
  currentCores = {},
  multiAccountsData = {},
  substatsMinMaxByIncrements,
  existingScores = {},
  onShowHallOfFlameDebug,
  onShowHallOfFlame,
  showDebugButton = false,
  onShowAdminValidation
}) => {
  const [showMenu, setShowMenu] = useState(true);
  const [animationClass, setAnimationClass] = useState('');
  const [currentSubMenu, setCurrentSubMenu] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [adminToken, setAdminToken] = useState(null); // ← TOKEN SÉCURISÉ AU LIEU DE BOOLEAN
  const [adminChecked, setAdminChecked] = useState(false); // ← POUR ÉVITER SPAM
  const { t } = useTranslation();

  // 🔍 DÉTECTION MOBILE
  const isMobileDevice = window.innerWidth < 768;

  useEffect(() => {
    setAnimationClass('bubble-appear');
    // 🔐 VÉRIFIER LES DROITS ADMIN AU CHARGEMENT
    checkAdminStatus();
  }, []);

  // 🛡️ FONCTION DE VÉRIFICATION TOKEN CÔTÉ CLIENT
  const isValidAdmin = () => {
    if (!adminToken) return false;
    
    try {
      // Décoder le JWT pour vérifier l'expiration (sans la signature, juste la date)
      const payload = JSON.parse(atob(adminToken.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < now) {
        console.log('🔒 Token admin expiré');
        setAdminToken(null);
        return false;
      }
      
      return payload.isAdmin === true;
    } catch (error) {
      console.error('Token invalide:', error);
      setAdminToken(null);
      return false;
    }
  };

  // 🔐 VÉRIFICATION ADMIN SÉCURISÉE - JWT TOKEN
  const checkAdminStatus = async () => {
    if (adminChecked) return; // Éviter les appels multiples
    
    try {
      const userData = JSON.parse(localStorage.getItem('builderberu_users') || '{}');
      const accounts = userData.user?.accounts || {};

      const response = await fetch('https://api.builderberu.com/api/auth/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          localStorageData: { multiAccounts: accounts }
        })
      });

      const result = await response.json();
      
      // 🔥 SAUVEGARDER LE TOKEN SIGNÉ, PAS UN BOOLEAN
      if (result.success && result.adminToken) {
        setAdminToken(result.adminToken); // ← TOKEN SÉCURISÉ INVIOLABLE
        console.log('🔓 Token Admin Kaisel reçu et validé pour', result.verificationDetails?.accountFound);
      } else {
        setAdminToken(null);
        console.log('🔒 Kaisel mode standard - pas de token admin');
      }
    } catch (error) {
      console.error('❌ Erreur vérification admin Kaisel:', error);
      setAdminToken(null);
    } finally {
      setAdminChecked(true);
    }
  };

  // 🛡️ VALIDATION SERVEUR AVEC TOKEN POUR ACTIONS CRITIQUES
  const validateAdminAction = async (action) => {
    if (!adminToken) return false;
    
    try {
      const serverCheck = await fetch('https://api.builderberu.com/api/admin/validate-action', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}` // ← TOKEN DANS HEADER
        },
        body: JSON.stringify({ action })
      });
      
      const validation = await serverCheck.json();
      
      if (!validation.authorized) {
        console.log('🔒 Action refusée par le serveur');
        setAdminToken(null); // Reset token si rejeté
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erreur validation serveur:', error);
      setAdminToken(null);
      return false;
    }
  };

  // 🔧 OPTIONS PRINCIPALES KAISEL - SÉCURISÉES
  const getMainOptions = () => {
    const baseOptions = {
      live_streams: {
        icon: "📺",
        label: "Streams Twitch Live",
        action: "show_twitch_streams"
      },
      youtube_news: {
        icon: "🎬",
        label: "Dernières vidéos YouTube",
        action: "show_youtube_videos"
      },
      netmarble_updates: {
        icon: "📰",
        label: "News Netmarble",
        action: "show_netmarble_news"
      },
      site_news: {
        icon: "🔄",
        label: "News du Site",
        action: "show_site_updates"
      }
    };

    // 🔐 AJOUTER DEBUG MODE SEULEMENT SI TOKEN ADMIN VALIDE
    if (isValidAdmin()) {
      baseOptions.debug_mode = {
        icon: "🐛",
        label: "Mode Debug Pro",
        action: "show_debug_submenu"
      };
    }

    return baseOptions;
  };

  // 🤖 SOUS-MENU DEBUG - ADMIN TOKEN REQUIS
  const getDebugSubMenu = () => {
    // 🔒 PROTECTION : Si pas de token admin valide, retourner menu d'accès refusé
    if (!isValidAdmin()) {
      return {
        access_denied: {
          icon: "🔒",
          label: "Accès Refusé",
          action: "access_denied"
        },
        back: {
          icon: "↩️",
          label: "Retour",
          action: "back_to_main"
        }
      };
    }

    const baseMenu = {
      artifact_calculator: {
        icon: "🧮",
        label: "Calculateur Artefacts",
        action: "advanced_artifact_calc"
      },
      build_simulator: {
        icon: "🎯", 
        label: "Simulateur de Build",
        action: "build_simulation"
      },
      meta_analysis: {
        icon: "📈",
        label: "Analyse Méta Global", 
        action: "meta_trends"
      },
      damage_calculator: {
        icon: "💥",
        label: "Calculateur DPS",
        action: "dps_calculator"
      },
      optimization_ai: {
        icon: "🤖",
        label: "IA d'Optimisation",
        action: "ai_optimization"
      },
      toggle_hitbox_debug: {
        icon: "👁️",
        label: "Toggle Hitbox Debug",
        action: "toggle_hitbox_debug"
      },
      admin_validation: {
        icon: "🛡️",
        label: "Admin Validation",
        action: "show_admin_validation"
      }
    };

    // 🏆 AJOUTER HALLOFFLAME SI DEBUG BUTTON ET TOKEN ADMIN
    if (showDebugButton && isValidAdmin()) {
      baseMenu.hall_of_flame_debug = {
        icon: "🏆",
        label: "HallOfFlame Debug",
        action: "show_hall_debug"
      };
      
      baseMenu.hall_of_flame_rankings = {
        icon: "📊",
        label: "Voir Classements",
        action: "show_hall_rankings"
      };
    }

    baseMenu.back = {
      icon: "↩️",
      label: "Retour",
      action: "back_to_main"
    };

    return baseMenu;
  };

  // 🧠 ACTIONS KAISEL - AVEC PROTECTION TOKEN + VALIDATION SERVEUR
  const handleOption = async (action) => {
    switch (action) {
      case 'access_denied':
        showTankMessage("🔒 Kaisel : Accès refusé ! Seuls les admins avec token valide peuvent accéder au mode Debug Pro.", true, 'kaisel');
        onClose();
        break;

      case 'show_debug_submenu':
        // 🔐 VÉRIFICATION TOKEN
        if (!isValidAdmin()) {
          showTankMessage("🔒 Kaisel : Token admin requis pour accéder au Debug Pro !", true, 'kaisel');
          onClose();
          return;
        }
        setCurrentSubMenu('debug');
        break;

      case 'show_admin_validation':
        // 🔐 PROTECTION TOKEN + VALIDATION SERVEUR
        if (!isValidAdmin()) {
          onShowAdminValidation();
          showTankMessage("🔒 Kaisel : Token admin requis !", true, 'kaisel');
          onClose();
          return;
        }
        
        // 🛡️ VALIDATION SERVEUR FINALE
        const isValidated = await validateAdminAction('admin_validation');
        if (!isValidated) {
          showTankMessage("🔒 Kaisel : Action non autorisée par le serveur !", true, 'kaisel');
          onClose();
          return;
        }
        
        if (onShowAdminValidation) {
          onShowAdminValidation(adminToken);
          showTankMessage("🛡️ Kaisel ouvre le système de validation admin !", true, 'kaisel');
        } else {
          showTankMessage("🤖 Admin validation callback non trouvé...", true, 'kaisel');
        }
        onClose();
        break;

      case 'back_to_main':
        setCurrentSubMenu(null);
        break;

      case 'show_hall_rankings':
        if (onShowHallOfFlame) {
          onShowHallOfFlame();
          showTankMessage("📊 Kaisel ouvre les classements HallOfFlame !", true, 'kaisel');
        } else {
          showTankMessage("🤖 Classements callback non trouvé... Debug en cours...", true, 'kaisel');
        }
        onClose();
        break;

      case 'show_hall_debug':
        // 🔐 PROTECTION TOKEN + VALIDATION SERVEUR
        if (!isValidAdmin()) {
          showTankMessage("🔒 Kaisel : HallOfFlame Debug réservé aux admins avec token !", true, 'kaisel');
          onClose();
          return;
        }
        
        const hallValidated = await validateAdminAction('hall_debug');
        if (!hallValidated) {
          showTankMessage("🔒 Kaisel : HallOfFlame Debug non autorisé par le serveur !", true, 'kaisel');
          onClose();
          return;
        }
        
        if (onShowHallOfFlameDebug) {
          onShowHallOfFlameDebug();
          showTankMessage("🏆 Kaisel lance le système HallOfFlame ! Interface de niveau légendaire activée ⚡", true, 'kaisel');
        } else {
          showTankMessage("🤖 HallOfFlame callback non trouvé... Debug en cours...", true, 'kaisel');
        }
        onClose();
        break;

      case 'show_twitch_streams':
        setIsScanning(true);
        showTankMessage("🔍 Kaisel scanne Twitch pour Solo Leveling Arise...", true, 'kaisel');
        
        // 🎯 LISTE DES STREAMERS À SCANNER
        const streamersToCheck = [
          'Souties67',
          'Sohoven',
          // Ajoute d'autres streamers ici
        ];
        
        // 🔥 SCANNER TOUS LES STREAMERS EN PARALLÈLE
        const scanPromises = streamersToCheck.map(streamer => checkTwitchStreamer(streamer));
        const results = await Promise.all(scanPromises);
        
        // 🎯 SÉPARER LES LIVES ET OFFLINE
        const liveStreamers = results.filter(r => r.isLive && !r.error);
        const offlineStreamers = results.filter(r => !r.isLive && !r.error);
        const twitchErrors = results.filter(r => r.error); // 🔥 RENOMMÉ ICI
        
        // 🏆 TRIER PAR VIEWERS (PLUS GROS EN PREMIER)
        liveStreamers.sort((a, b) => {
          const viewersA = typeof a.viewers === 'number' ? a.viewers : 0;
          const viewersB = typeof b.viewers === 'number' ? b.viewers : 0;
          return viewersB - viewersA;
        });
        
        // 🎨 CONSTRUIRE LE MESSAGE - VERSION ÉPURÉE
        let message = "";
        
        if (liveStreamers.length > 0) {
          message = `🔴 **STREAMS LIVE DÉTECTÉS : ${liveStreamers.length}**\n\n`;
          
          liveStreamers.forEach((stream, index) => {
            const emoji = stream.isSoloLeveling ? "🎯" : "⚠️";
            const rank = index === 0 ? "👑" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
            
            message += `${rank} ${emoji} **${stream.streamer}** ${stream.isSoloLeveling ? "🟢" : "🔴"}\n`;
            message += `├─ 🎮 ${stream.game}\n`;
            message += `├─ 📺 "${stream.title}"\n`;
            message += `├─ 👥 **${stream.viewers}** viewers\n`;
            message += `└─ 🔗 ${stream.streamUrl}\n\n`;
          });
          
          // 🎯 COMPTAGE SOLO LEVELING
          const soloLevelingCount = liveStreamers.filter(s => s.isSoloLeveling).length;
          if (soloLevelingCount > 0) {
            message += `✅ **${soloLevelingCount} streams Solo Leveling Arise actifs !**\n\n`;
          }
          
          // 📈 MINI STATS
          message += `📊 Total viewers : ${liveStreamers.reduce((sum, s) => sum + (typeof s.viewers === 'number' ? s.viewers : 0), 0)}\n\n`;
          
        } else {
          message = `💤 **AUCUN STREAM LIVE ACTUELLEMENT**\n\n`;
          message += `🔍 ${streamersToCheck.length} streamers scannés\n`;
          message += `⏰ Prochaine vérification dans quelques heures...\n\n`;
        }
        
        message += `🤖 Scan Kaisel terminé ⚡`;
        
        showTankMessage(message, true, 'kaisel');
        
        setIsScanning(false);
        onClose();
        break;

      case 'toggle_hitbox_debug':
        // 🔐 PROTECTION TOKEN + VALIDATION SERVEUR
        if (!isValidAdmin()) {
          showTankMessage("🔒 Kaisel : Debug mode réservé aux admins avec token !", true, 'kaisel');
          onClose();
          return;
        }
        
        const debugValidated = await validateAdminAction('toggle_debug');
        if (!debugValidated) {
          showTankMessage("🔒 Kaisel : Debug toggle non autorisé par le serveur !", true, 'kaisel');
          onClose();
          return;
        }
        
        if (window.toggleDebug) {
          window.toggleDebug();
          showTankMessage("🐛 Kaisel a activé le debug mode ! Regarde en haut à droite...", true, 'kaisel');
        } else {
          showTankMessage("🤖 Debug system non trouvé... Kaisel enquête...", true, 'kaisel');
        }
        onClose();
        break;

      case 'show_youtube_videos':
        setIsScanning(true);
        showTankMessage("🎬 Kaisel scanne YouTube pour les dernières vidéos...", true, 'kaisel');
        
        // Configuration des channels avec leurs VRAIS IDs
        const youtubeChannels = [
          {
            name: "Zaffplays",
            channelId: "UChQ74OK6FGrn69TOtVAnUbw", // Son vrai ID
            category: "FR"
          },
          // Ajoute d'autres channels ici avec leurs IDs
        ];
        
        let allVideos = [];
        let errors = [];
        
        // Scanner chaque channel
        for (const channel of youtubeChannels) {
          try {
            // Construire l'URL du flux RSS YouTube
            const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.channelId}`;
            
            // Utiliser RSS2JSON (API gratuite, pas de clé requise)
            const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=5`;
            
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (data.status === 'ok' && data.items) {
              // Parser les vidéos
              const videos = data.items.map(item => {
                const publishDate = new Date(item.pubDate);
                const now = new Date();
                const hoursAgo = Math.floor((now - publishDate) / (1000 * 60 * 60));
                const daysAgo = Math.floor(hoursAgo / 24);
                
                return {
                  title: item.title,
                  url: item.link,
                  author: channel.name,
                  category: channel.category,
                  thumbnail: item.thumbnail,
                  publishDate: publishDate,
                  timeAgo: daysAgo === 0 ? `${hoursAgo}h` : `${daysAgo}j`,
                  isNew: hoursAgo < 48 // Nouveau si moins de 48h
                };
              });
              
              allVideos.push(...videos);
            } else {
              throw new Error('Pas de vidéos trouvées');
            }
            
          } catch (error) {
            console.error(`Erreur pour ${channel.name}:`, error);
            errors.push(channel.name);
          }
        }
        
        // Trier par date (plus récent en premier)
        allVideos.sort((a, b) => b.publishDate - a.publishDate);
        
        // Construire le message
        let youtubeMsg = "";
        
        if (allVideos.length > 0) {
          youtubeMsg = `🎬 **VIDÉOS YOUTUBE RÉCENTES : ${allVideos.length}**\n\n`;
          
          // Grouper par catégorie
          const categories = {};
          allVideos.forEach(video => {
            if (!categories[video.category]) {
              categories[video.category] = [];
            }
            categories[video.category].push(video);
          });
          
          // Afficher par catégorie
          Object.entries(categories).forEach(([cat, videos]) => {
            youtubeMsg += `📁 **${cat}**\n`;
            
            videos.slice(0, 3).forEach(video => { // Max 3 par catégorie
              const icon = video.isNew ? "🆕" : "📹";
              
              youtubeMsg += `${icon} **${video.title}**\n`;
              youtubeMsg += `├─ 👤 ${video.author}\n`;
              youtubeMsg += `├─ ⏰ Il y a ${video.timeAgo}\n`;
              youtubeMsg += `└─ 🔗 ${video.url}\n\n`;
            });
          });
          
        } else {
          youtubeMsg = `💤 **AUCUNE VIDÉO TROUVÉE**\n\n`;
          
          if (errors.length > 0) {
            youtubeMsg += `❌ Erreurs pour : ${errors.join(', ')}\n\n`;
          }
          
          youtubeMsg += `💡 Vérifie les Channel IDs des YouTubeurs\n`;
        }
        
        youtubeMsg += `🤖 Scan YouTube Kaisel terminé ⚡`;
        
        showTankMessage(youtubeMsg, true, 'kaisel');
        setIsScanning(false);
        onClose();
        break;

      case 'show_netmarble_news':
        const netmarbleData = await scanNetmarbleNews();
        showTankMessage(netmarbleData, true, 'kaisel');
        onClose();
        break;

      case 'show_site_updates':
        const siteUpdates = `🔄 **NEWS BUILDERBERU.COM**\n\n` +
          `✅ Kaisel Intelligence System - ONLINE\n` +
          `🔧 Builder Data corrections en cours\n` +
          `📱 Mobile optimization - Planifié\n` +
          `🎨 Icons sets update - En attente\n\n` +
          `🎯 Rapport généré par Kaisel ⚡`;
        showTankMessage(siteUpdates, true, 'kaisel');
        onClose();
        break;

      // 🤖 ACTIONS DEBUG - TOKEN ADMIN + VALIDATION SERVEUR REQUIS
      case 'advanced_artifact_calc':
      case 'build_simulation':
      case 'meta_analysis':
      case 'dps_calculator':
      case 'ai_optimization':
        // 🔐 PROTECTION TOKEN
        if (!isValidAdmin()) {
          showTankMessage("🔒 Kaisel : Fonctionnalités avancées réservées aux admins avec token !", true, 'kaisel');
          onClose();
          return;
        }
        
        // 🛡️ VALIDATION SERVEUR
        const advancedValidated = await validateAdminAction(action);
        if (!advancedValidated) {
          showTankMessage("🔒 Kaisel : Fonctionnalité avancée non autorisée par le serveur !", true, 'kaisel');
          onClose();
          return;
        }
        
        const messages = {
          'advanced_artifact_calc': `🧮 **CALCULATEUR ARTEFACTS AVANCÉ**\n\n🔍 Analyse en cours des substats optimaux...\n📊 Calcul des probabilités de roll...\n🎯 Comparaison avec la base de données...\n\n⚠️ Fonctionnalité en développement\n🤖 Kaisel code encore... ⚡`,
          'build_simulation': `🎯 **SIMULATEUR DE BUILD**\n\n⚙️ Chargement des configurations...\n🧪 Test des combinaisons d'artefacts...\n📈 Projection des performances...\n\n⚠️ Mode simulation à venir\n🤖 Intelligence artificielle en cours ⚡`,
          'meta_analysis': `📈 **ANALYSE MÉTA GLOBAL**\n\n🌍 Scan des tendances communauté...\n🏆 Hunters les plus utilisés en PvP...\n💎 Sets d'artefacts populaires...\n\n⚠️ Base de données en construction\n🤖 Big Data processing... ⚡`,
          'dps_calculator': `💥 **CALCULATEUR DPS PRÉCIS**\n\n🔢 Formules de dégâts avancées...\n⚔️ Calcul critiques & pénétration...\n🎯 Optimisation rotation skills...\n\n⚠️ Mathématiques complexes en cours\n🤖 Algorithmes de combat ⚡`,
          'ai_optimization': `🤖 **IA D'OPTIMISATION KAISEL**\n\n🧠 Machine Learning activé...\n📊 Analyse de tes patterns de jeu...\n🎯 Suggestions personnalisées...\n\n⚠️ Neural Network en entraînement\n🤖 Deep Learning en cours... ⚡`
        };
        
        showTankMessage(messages[action], true, 'kaisel');
        onClose();
        break;

      default:
        showTankMessage("🤖 Fonction Kaisel non implémentée... Debug en cours ⚡", true, 'kaisel');
        onClose();
    }
  };

  // 🌐 FONCTIONS API YOUTUBE ET NETMARBLE
  const scanNetmarbleNews = async () => {
    setIsScanning(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockNews = [
      "📰 'Update 1.5.2 - New Artifacts Released' (Today)",
      "📰 'Guild War Season 3 Announcement' (Yesterday)",
      "📰 'Bug Fixes & Balance Changes' (2 days ago)"
    ];
    
    const message = `📰 **NEWS NETMARBLE - SOLO LEVELING ARISE**\n\n` +
      `${mockNews.join('\n')}\n\n` +
      `🎯 Scan terminé par Kaisel ⚡`;
    
    setIsScanning(false);
    return message;
  };

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.kaisel-interaction-menu')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!showMenu) return null;

  const currentOptions = currentSubMenu === 'debug' ? getDebugSubMenu() : getMainOptions();

  return (
    <>
      {/* 🎨 STYLES CSS KAISEL (inchangés) */}
      <style jsx="true">{`
        @keyframes kaisel-appear {
          0% { opacity: 0; transform: translateY(20px) scale(0.8); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes kaisel-scanning {
          0%, 100% { box-shadow: 0 0 15px rgba(0, 255, 65, 0.4); }
          50% { box-shadow: 0 0 25px rgba(0, 255, 65, 0.8); }
        }

        .kaisel-bubble {
          backdrop-filter: blur(8px);
          border: 1px solid rgba(0, 255, 65, 0.3);
          background: linear-gradient(135deg, 
            rgba(0, 40, 80, 0.85) 0%, 
            rgba(0, 60, 100, 0.9) 50%, 
            rgba(0, 255, 65, 0.1) 100%);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(0, 255, 65, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: kaisel-appear 0.4s ease-out;
        }

        .kaisel-bubble:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 
            0 12px 40px rgba(0, 0, 0, 0.5),
            0 0 20px rgba(0, 255, 65, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          border-color: rgba(0, 255, 65, 0.5);
        }

        .kaisel-scanning {
          animation: kaisel-scanning 1.5s infinite;
        }

        .kaisel-icon {
          background: linear-gradient(45deg, #00ff41, #00ccff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 8px rgba(0, 255, 65, 0.3));
        }

        .kaisel-text {
          color: #ffffff;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
          font-family: 'Courier New', monospace;
        }

        .kaisel-close {
          background: linear-gradient(135deg, rgba(255, 0, 0, 0.8), rgba(200, 0, 0, 0.9));
          border: 1px solid rgba(255, 100, 100, 0.4);
        }

        .kaisel-close:hover {
          background: linear-gradient(135deg, rgba(255, 50, 50, 0.9), rgba(220, 20, 20, 1));
          box-shadow: 0 0 15px rgba(255, 0, 0, 0.4);
        }

        /* 📱 MOBILE SPECIFIC */
        .kaisel-mobile-container {
          backdrop-filter: blur(4px);
          background: rgba(0, 0, 0, 0.3);
          border-radius: 16px;
          padding: 8px;
        }

        /* 🔐 ADMIN INDICATOR SÉCURISÉ */
        .admin-indicator {
          background: linear-gradient(45deg, #ffd700, #ff6b35);
          color: #000;
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: bold;
        }

        .admin-verified {
          background: linear-gradient(45deg, #00ff41, #00ccff);
          color: #000;
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: bold;
        }
      `}</style>

      {isMobileDevice ? (
        // 📱 VERSION MOBILE AVEC INDICATEUR ADMIN SÉCURISÉ
        <div
          className="kaisel-interaction-menu fixed z-[9999] kaisel-mobile-container"
          style={{
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90vw',
            maxWidth: '320px',
            maxHeight: '70vh',
            overflowY: 'auto'
          }}
        >
          {/* 🎯 HEADER KAISEL MOBILE */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
            padding: '8px 12px',
            background: 'linear-gradient(90deg, rgba(0, 255, 65, 0.1), rgba(0, 150, 255, 0.1))',
            borderRadius: '8px',
            border: '1px solid rgba(0, 255, 65, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img 
                src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750768929/Kaisel_face_dm9394.png"
                alt="Kaisel"
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: '2px solid #00ff41'
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{
                  color: '#00ff41',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  fontFamily: 'monospace'
                }}>
                  Kaisel {currentSubMenu === 'debug' ? 'Debug' : 'Tech'}
                </span>
                {isValidAdmin() && (
                  <span className="admin-verified">🔐 TOKEN VERIFIED</span>
                )}
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="kaisel-close"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                color: 'white'
              }}
            >
              ✕
            </button>
          </div>

          {/* 🔥 OPTIONS EN COLONNE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(currentOptions).map(([key, option], index) => (
              <button
                key={key}
                onClick={() => handleOption(option.action)}
                className={`kaisel-bubble ${isScanning ? 'kaisel-scanning' : ''}`}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <span className="kaisel-icon" style={{ fontSize: '18px', flexShrink: 0 }}>
                  {option.icon}
                </span>
                <span className="kaisel-text" style={{
                  fontSize: '13px',
                  fontWeight: 'bold',
                  textAlign: 'left',
                  flex: 1
                }}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        // 🖥️ VERSION DESKTOP
        <div
          className="kaisel-interaction-menu fixed z-[9999]"
          style={{
            left: position.x,
            top: position.y
          }}
        >
          {/* Centre de Kaisel avec indicateur admin sécurisé */}
          <div
            className={`absolute w-6 h-6 rounded-full border-2 ${isValidAdmin() ? 'border-green-400' : 'border-white'} ${currentSubMenu === 'debug' ? 'bg-cyan-400/80' : isScanning ? 'bg-cyan-300/90 kaisel-scanning' : 'bg-cyan-500/80'}`}
            style={{ 
              left: '-3px', 
              top: '-3px',
              boxShadow: isValidAdmin() ? '0 0 15px rgba(0, 255, 65, 0.8)' : '0 0 15px rgba(0, 255, 65, 0.5)'
            }}
          >
            {isValidAdmin() && (
              <div style={{
                position: 'absolute',
                top: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '8px'
              }}>
                🔐
              </div>
            )}
          </div>

          {/* Bulles d'options en cercle (positions inchangées) */}
          {Object.entries(currentOptions).map(([key, option], index) => {
            const textLength = option.label.length;
            const bubbleWidth = Math.max(140, Math.min(260, textLength * 9 + 70));
            const bubbleHeight = 45;

            const positions = {
              live_streams: { x: "0.7vw", y: "-11.5vh" },
              youtube_news: { x: "-10vw", y: "-3vh" },
              netmarble_updates: { x: "12vw", y: "-3vh" },
              site_news: { x: "-10vw", y: "3vh" },
              debug_mode: { x: "12vw", y: "3vh" },
              // Debug submenu positions
              artifact_calculator: { x: "-15vw", y: "-10vh" },
              build_simulator: { x: "-5vw", y: "-14vh" },
              meta_analysis: { x: "5vw", y: "-14vh" },
              damage_calculator: { x: "15vw", y: "-10vh" },
              optimization_ai: { x: "0vw", y: "-6vh" },
              toggle_hitbox_debug: { x: "-10vw", y: "-2vh" },
              hall_of_flame_debug: { x: "10vw", y: "-2vh" },
              hall_of_flame_rankings: { x: "-5vw", y: "2vh" },
              admin_validation: { x: "5vw", y: "2vh" },
              access_denied: { x: "0vw", y: "-10vh" },
              back: { x: "0vw", y: "-18vh" }
            };

            const pos = positions[key] || { x: "0vw", y: "0vh" };

            return (
              <button
                key={key}
                onClick={() => handleOption(option.action)}
                className={`kaisel-bubble ${isScanning ? 'kaisel-scanning' : ''}`}
                style={{
                  position: 'absolute',
                  left: pos.x,
                  top: pos.y,
                  width: `${bubbleWidth}px`,
                  height: `${bubbleHeight}px`,
                  borderRadius: '25px',
                  cursor: 'pointer',
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="flex items-center justify-center gap-2 px-3 h-full">
                  <span className="kaisel-icon text-base flex-shrink-0">{option.icon}</span>
                  <span
                    className="kaisel-text text-xs font-bold leading-tight flex-1 min-w-0"
                    style={{
                      fontSize: textLength > 20 ? '11px' : '12px'
                    }}
                  >
                    {option.label}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Croix de fermeture */}
          <button
            onClick={onClose}
            className="kaisel-close absolute w-9 h-9 flex items-center justify-center rounded-full"
            style={{
              left: "1.5vw",
              top: "5vh",
              transform: 'translate(-50%, -50%)',
              animationDelay: '0.6s'
            }}
          >
            <span className="text-xs font-bold">✕</span>
          </button>
        </div>
      )}
    </>
  );
};

export default KaiselInteractionMenu;