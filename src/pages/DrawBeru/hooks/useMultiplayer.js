// src/pages/DrawBeru/hooks/useMultiplayer.js
// Hook WebSocket pour DrawBeru Multi
// Par Kaisel pour le Monarque des Ombres

import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { MULTIPLAYER_CONFIG } from '../../../config/multiplayer';

/**
 * Hook principal pour la gestion du mode multijoueur DrawBeru
 * Gère la connexion WebSocket, les rooms, et la synchronisation des dessins
 */
export const useMultiplayer = () => {
  // Socket ref
  const socketRef = useRef(null);

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // Room state
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [spectators, setSpectators] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [myPlayer, setMyPlayer] = useState(null);
  const [isSpectator, setIsSpectator] = useState(false);
  const [settings, setSettings] = useState(MULTIPLAYER_CONFIG.DEFAULT_SETTINGS);

  // Drawing state
  const [receivedStrokes, setReceivedStrokes] = useState([]);
  const [otherCursors, setOtherCursors] = useState({});
  const [undoEvents, setUndoEvents] = useState([]);

  // Game state
  const [gameStarted, setGameStarted] = useState(false);

  // Throttle refs
  const lastCursorEmitRef = useRef(0);
  const lastStrokingEmitRef = useRef(0);

  // ========================================================================
  // CONNECTION
  // ========================================================================

  /**
   * Se connecter au serveur WebSocket
   */
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return Promise.resolve();
    }

    setIsConnecting(true);
    setConnectionError(null);

    return new Promise((resolve, reject) => {
      const socket = io(MULTIPLAYER_CONFIG.SOCKET_URL + MULTIPLAYER_CONFIG.NAMESPACE, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: MULTIPLAYER_CONFIG.RECONNECTION_ATTEMPTS,
        reconnectionDelay: MULTIPLAYER_CONFIG.RECONNECTION_DELAY,
        reconnectionDelayMax: MULTIPLAYER_CONFIG.RECONNECTION_DELAY_MAX,
        timeout: MULTIPLAYER_CONFIG.CONNECT_TIMEOUT,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);
        resolve();
      });

      socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setConnectionError(error.message);
        setIsConnecting(false);
        reject(error);
      });

      socket.on('disconnect', (reason) => {
        setIsConnected(false);
        if (reason === 'io server disconnect') {
          // Server disconnected us, need to reconnect manually
          socket.connect();
        }
      });

      // Setup event listeners
      setupEventListeners(socket);
    });
  }, []);

  /**
   * Se déconnecter du serveur
   */
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
    setRoom(null);
    setPlayers([]);
    setMyPlayer(null);
    setIsHost(false);
    setReceivedStrokes([]);
    setOtherCursors({});
    setGameStarted(false);
  }, []);

  // ========================================================================
  // EVENT LISTENERS
  // ========================================================================

  const setupEventListeners = (socket) => {
    // Room events
    socket.on('room:playerJoined', ({ player }) => {
      setPlayers((prev) => [...prev, player]);
    });

    socket.on('room:playerLeft', ({ playerId, playerName }) => {
      setPlayers((prev) => prev.filter((p) => p.id !== playerId));
      setOtherCursors((prev) => {
        const newCursors = { ...prev };
        delete newCursors[playerId];
        return newCursors;
      });
    });

    socket.on('room:newHost', ({ newHostId, newHostName }) => {
      setPlayers((prev) =>
        prev.map((p) => ({
          ...p,
          isHost: p.id === newHostId,
        }))
      );
      setIsHost(socket.id === newHostId);
    });

    socket.on('room:settingsUpdated', ({ settings: newSettings }) => {
      setSettings(newSettings);
    });

    socket.on('room:spectatorJoined', ({ spectator }) => {
      setSpectators((prev) => [...prev, spectator]);
    });

    socket.on('room:expired', ({ reason }) => {
      alert(`La room a expiré: ${reason}`);
      setRoom(null);
      setPlayers([]);
      setMyPlayer(null);
    });

    // Game start event
    socket.on('game:started', () => {
      setGameStarted(true);
    });

    // Drawing events
    socket.on('draw:stroke', (stroke) => {
      setReceivedStrokes((prev) => [...prev, stroke]);
    });

    socket.on('draw:stroking', ({ playerId, point, color, brushSize, layer }) => {
      // Update cursor position during stroking
      setOtherCursors((prev) => ({
        ...prev,
        [playerId]: {
          ...prev[playerId],
          x: point[0],
          y: point[1],
          isDrawing: true,
          color,
          brushSize,
        },
      }));
    });

    socket.on('draw:undo', ({ playerId, strokeId }) => {
      setUndoEvents((prev) => [...prev, { playerId, strokeId, timestamp: Date.now() }]);
      setReceivedStrokes((prev) => prev.filter((s) => s.id !== strokeId));
    });

    socket.on('draw:clearLayer', ({ layer, by }) => {
      setReceivedStrokes((prev) => prev.filter((s) => s.layer !== layer));
    });

    // Cursor events
    socket.on('cursor:update', ({ playerId, playerName, playerColor, x, y, isDrawing }) => {
      setOtherCursors((prev) => ({
        ...prev,
        [playerId]: {
          id: playerId,
          name: playerName,
          color: playerColor,
          x,
          y,
          isDrawing,
          lastUpdate: Date.now(),
        },
      }));
    });
  };

  // ========================================================================
  // ROOM ACTIONS
  // ========================================================================

  /**
   * Créer une nouvelle room
   */
  const createRoom = useCallback(
    async (playerName, hunter, model, customSettings = {}) => {
      if (!socketRef.current?.connected) {
        await connect();
      }

      return new Promise((resolve, reject) => {
        socketRef.current.emit(
          'room:create',
          {
            playerName,
            hunter,
            model,
            settings: { ...MULTIPLAYER_CONFIG.DEFAULT_SETTINGS, ...customSettings },
          },
          (response) => {
            if (response.success) {
              setRoom(response.room);
              setPlayers(response.room.players);
              setMyPlayer(response.you);
              setIsHost(true);
              setSettings(response.room.settings);
              resolve(response);
            } else {
              console.error('Failed to create room:', response.error);
              reject(new Error(response.error));
            }
          }
        );
      });
    },
    [connect]
  );

  /**
   * Rejoindre une room existante
   */
  const joinRoom = useCallback(
    async (roomId, playerName) => {
      if (!socketRef.current?.connected) {
        await connect();
      }

      return new Promise((resolve, reject) => {
        socketRef.current.emit(
          'room:join',
          {
            roomId: roomId.toUpperCase(),
            playerName,
          },
          (response) => {
            if (response.success) {
              setRoom(response.room);
              setPlayers(response.room.players);
              setMyPlayer(response.you);
              setIsHost(response.room.host === socketRef.current.id);
              setIsSpectator(response.isSpectator || false);
              setSettings(response.room.settings);

              // Load existing strokes
              if (response.strokes && response.strokes.length > 0) {
                setReceivedStrokes(response.strokes);
              }

              resolve(response);
            } else {
              console.error('Failed to join room:', response.error);
              reject(new Error(response.error));
            }
          }
        );
      });
    },
    [connect]
  );

  /**
   * Quitter la room actuelle
   */
  const leaveRoom = useCallback(() => {
    if (!socketRef.current?.connected) return;

    socketRef.current.emit('room:leave', (response) => {
      if (response.success) {
        setRoom(null);
        setPlayers([]);
        setMyPlayer(null);
        setIsHost(false);
        setReceivedStrokes([]);
        setOtherCursors({});
        setGameStarted(false);
      }
    });
  }, []);

  /**
   * Obtenir les infos d'une room sans la rejoindre
   */
  const getRoomInfo = useCallback(
    async (roomId) => {
      if (!socketRef.current?.connected) {
        await connect();
      }

      return new Promise((resolve, reject) => {
        socketRef.current.emit('room:info', { roomId: roomId.toUpperCase() }, (response) => {
          if (response.success) {
            resolve(response.room);
          } else {
            reject(new Error(response.error));
          }
        });
      });
    },
    [connect]
  );

  /**
   * Mettre à jour les settings (host only)
   */
  const updateSettings = useCallback((newSettings) => {
    if (!socketRef.current?.connected || !isHost) return;

    socketRef.current.emit('room:settings', { settings: newSettings }, (response) => {
      if (response.success) {
        setSettings(response.settings);
      }
    });
  }, [isHost]);

  /**
   * Démarrer la partie (host only)
   * Notifie tous les joueurs de la room
   */
  const startGame = useCallback(() => {
    if (!socketRef.current?.connected || !room || !isHost) return;

    return new Promise((resolve, reject) => {
      socketRef.current.emit('game:start', {}, (response) => {
        if (response.success) {
          setGameStarted(true);
          resolve(response);
        } else {
          console.error('Failed to start game:', response.error);
          reject(new Error(response.error));
        }
      });
    });
  }, [room, isHost]);

  // ========================================================================
  // DRAWING ACTIONS
  // ========================================================================

  /**
   * Envoyer un stroke complet (quand on relâche)
   */
  const sendStroke = useCallback((strokeData) => {
    if (!socketRef.current?.connected || !room) return;

    socketRef.current.emit('draw:stroke', {
      layer: strokeData.layer,
      points: strokeData.points,
      color: strokeData.color,
      brushSize: strokeData.brushSize,
      tool: strokeData.tool || 'brush',
    });
  }, [room]);

  /**
   * Envoyer la position pendant le dessin (temps réel)
   */
  const sendStroking = useCallback((point, color, brushSize, layer) => {
    if (!socketRef.current?.connected || !room) return;

    const now = Date.now();
    if (now - lastStrokingEmitRef.current < MULTIPLAYER_CONFIG.STROKING_THROTTLE_MS) {
      return;
    }
    lastStrokingEmitRef.current = now;

    socketRef.current.emit('draw:stroking', {
      point,
      color,
      brushSize,
      layer,
    });
  }, [room]);

  /**
   * Annuler le dernier stroke
   */
  const sendUndo = useCallback(() => {
    if (!socketRef.current?.connected || !room) return;

    return new Promise((resolve) => {
      socketRef.current.emit('draw:undo', {}, (response) => {
        resolve(response);
      });
    });
  }, [room]);

  /**
   * Clear un layer (host only)
   */
  const sendClearLayer = useCallback((layer) => {
    if (!socketRef.current?.connected || !room || !isHost) return;

    socketRef.current.emit('draw:clearLayer', { layer });
  }, [room, isHost]);

  /**
   * Envoyer la position du curseur
   */
  const sendCursorMove = useCallback((x, y, isDrawing = false) => {
    if (!socketRef.current?.connected || !room) return;

    const now = Date.now();
    if (now - lastCursorEmitRef.current < MULTIPLAYER_CONFIG.CURSOR_THROTTLE_MS) {
      return;
    }
    lastCursorEmitRef.current = now;

    socketRef.current.emit('cursor:move', { x, y, isDrawing });
  }, [room]);

  // ========================================================================
  // CLEANUP
  // ========================================================================

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Clean old cursors (remove cursors not updated in 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setOtherCursors((prev) => {
        const cleaned = {};
        Object.entries(prev).forEach(([id, cursor]) => {
          if (now - cursor.lastUpdate < 5000) {
            cleaned[id] = cursor;
          }
        });
        return cleaned;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // ========================================================================
  // HELPERS
  // ========================================================================

  /**
   * Vider les strokes reçus (après les avoir dessinés)
   */
  const clearReceivedStrokes = useCallback(() => {
    setReceivedStrokes([]);
  }, []);

  /**
   * Vider les événements d'undo traités
   */
  const clearUndoEvents = useCallback(() => {
    setUndoEvents([]);
  }, []);

  // ========================================================================
  // RETURN
  // ========================================================================

  return {
    // Connection state
    isConnected,
    isConnecting,
    connectionError,
    connect,
    disconnect,

    // Room state
    room,
    players,
    spectators,
    isHost,
    myPlayer,
    isSpectator,
    settings,

    // Room actions
    createRoom,
    joinRoom,
    leaveRoom,
    getRoomInfo,
    updateSettings,
    startGame,

    // Game state
    gameStarted,

    // Drawing state
    receivedStrokes,
    otherCursors,
    undoEvents,

    // Drawing actions
    sendStroke,
    sendStroking,
    sendUndo,
    sendClearLayer,
    sendCursorMove,

    // Helpers
    clearReceivedStrokes,
    clearUndoEvents,
  };
};

export default useMultiplayer;
