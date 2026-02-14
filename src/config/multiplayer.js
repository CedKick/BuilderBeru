// src/config/multiplayer.js
// Configuration WebSocket pour DrawBeru Multi
// Par Kaisel pour le Monarque des Ombres

export const MULTIPLAYER_CONFIG = {
  // URL du serveur WebSocket
  SOCKET_URL: 'https://api.builderberu.com',

  // Namespace Socket.io pour DrawBeru
  NAMESPACE: '/drawberu',

  // Reconnexion automatique
  RECONNECTION_ATTEMPTS: 5,
  RECONNECTION_DELAY: 1000,
  RECONNECTION_DELAY_MAX: 5000,

  // Throttle pour les events fréquents (ms)
  CURSOR_THROTTLE_MS: 50,
  STROKING_THROTTLE_MS: 30,

  // Timeouts
  CONNECT_TIMEOUT: 10000,

  // Limites
  MAX_PLAYERS: 8,
  MIN_PLAYERS: 2,
  MAX_STROKES_HISTORY: 1000,

  // Room settings par défaut
  DEFAULT_SETTINGS: {
    maxPlayers: 4,
    autoPipette: true,
    eraserAllowed: true,
    layerAssignment: 'free', // 'free' | 'assigned'
    spectatorAllowed: true,
    brushSizeRange: [0.05, 50],
  },
};

// Couleurs assignées aux joueurs
export const PLAYER_COLORS = [
  '#8B5CF6', // Violet (host toujours)
  '#10B981', // Vert
  '#F59E0B', // Orange
  '#EF4444', // Rouge
  '#3B82F6', // Bleu
  '#EC4899', // Rose
  '#14B8A6', // Teal
  '#F97316', // Orange vif
];

// Helper pour obtenir la couleur d'un joueur par index
export const getPlayerColor = (index) => {
  return PLAYER_COLORS[index % PLAYER_COLORS.length];
};

export default MULTIPLAYER_CONFIG;
