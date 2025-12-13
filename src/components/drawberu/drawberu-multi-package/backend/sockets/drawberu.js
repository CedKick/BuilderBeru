// 🎨 DrawBeru Multiplayer - Socket.io Handler
// Par Kaisel pour le Monarque des Ombres
// Version 1.0.0 - PRODUCTION

const { v4: uuidv4 } = require('uuid');

const rooms = new Map();

const generateRoomCode = (hunter) => {
  const prefix = hunter?.toUpperCase().slice(0, 4) || 'DRAW';
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return prefix + '-' + suffix;
};

const PLAYER_COLORS = [
  '#8B5CF6', '#10B981', '#F59E0B', '#EF4444',
  '#3B82F6', '#EC4899', '#14B8A6', '#F97316',
];

const createRoom = (hostId, hostName, hunter, model) => ({
  id: generateRoomCode(hunter),
  host: hostId,
  hostName: hostName,
  hunter: hunter,
  model: model,
  createdAt: Date.now(),
  lastActivity: Date.now(),
  gameStarted: false,
  settings: {
    maxPlayers: 4,
    autoPipette: true,
    eraserAllowed: true,
    layerAssignment: 'free',
    spectatorAllowed: true,
    brushSizeRange: [0.05, 50],
  },
  players: [],
  strokes: [],
  spectators: [],
});

const initDrawBeruSockets = (io) => {
  const drawberuIO = io.of('/drawberu');
  console.log('🎨 DrawBeru Multiplayer Socket.io initialise');

  drawberuIO.on('connection', (socket) => {
    console.log('🔌 Nouvelle connexion DrawBeru: ' + socket.id);
    let currentRoom = null;
    let playerInfo = null;

    socket.on('room:create', (data, callback) => {
      try {
        const { playerName, hunter, model, settings } = data;
        const room = createRoom(socket.id, playerName, hunter, model);
        if (settings) room.settings = { ...room.settings, ...settings };
        const hostPlayer = {
          id: socket.id, name: playerName, color: PLAYER_COLORS[0],
          layer: null, isHost: true, joinedAt: Date.now(),
          isDrawing: false, cursor: { x: 0, y: 0 },
        };
        room.players.push(hostPlayer);
        rooms.set(room.id, room);
        socket.join(room.id);
        currentRoom = room.id;
        playerInfo = hostPlayer;
        console.log('🏠 Room creee: ' + room.id + ' par ' + playerName);
        callback({ success: true, room: { id: room.id, host: room.host, hunter: room.hunter, model: room.model, settings: room.settings, players: room.players }, you: hostPlayer });
      } catch (error) {
        console.error('❌ Erreur creation room:', error);
        callback({ success: false, error: error.message });
      }
    });

    socket.on('room:join', (data, callback) => {
      try {
        const { roomId, playerName } = data;
        const room = rooms.get(roomId.toUpperCase());
        if (!room) return callback({ success: false, error: 'Room introuvable' });
        if (room.players.length >= room.settings.maxPlayers) {
          if (!room.settings.spectatorAllowed) return callback({ success: false, error: 'Room pleine' });
          const spectator = { id: socket.id, name: playerName, joinedAt: Date.now() };
          room.spectators.push(spectator);
          socket.join(room.id);
          currentRoom = room.id;
          socket.to(room.id).emit('room:spectatorJoined', { spectator });
          return callback({ success: true, isSpectator: true, room: { id: room.id, hunter: room.hunter, model: room.model, settings: room.settings, players: room.players }, strokes: room.strokes });
        }
        const newPlayer = {
          id: socket.id, name: playerName,
          color: PLAYER_COLORS[room.players.length % PLAYER_COLORS.length],
          layer: null, isHost: false, joinedAt: Date.now(),
          isDrawing: false, cursor: { x: 0, y: 0 },
        };
        room.players.push(newPlayer);
        room.lastActivity = Date.now();
        socket.join(room.id);
        currentRoom = room.id;
        playerInfo = newPlayer;
        socket.to(room.id).emit('room:playerJoined', { player: newPlayer });
        callback({ success: true, isSpectator: false, room: { id: room.id, host: room.host, hunter: room.hunter, model: room.model, settings: room.settings, players: room.players }, you: newPlayer, strokes: room.strokes });
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    socket.on('room:settings', (data, callback) => {
      try {
        const { settings } = data;
        if (!currentRoom) return callback({ success: false, error: 'Pas dans une room' });
        const room = rooms.get(currentRoom);
        if (!room) return callback({ success: false, error: 'Room introuvable' });
        if (room.host !== socket.id) return callback({ success: false, error: 'Seul le host peut modifier' });
        room.settings = { ...room.settings, ...settings };
        room.lastActivity = Date.now();
        drawberuIO.to(room.id).emit('room:settingsUpdated', { settings: room.settings });
        callback({ success: true, settings: room.settings });
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    socket.on('game:start', (data, callback) => {
      try {
        if (!currentRoom) return callback({ success: false, error: 'Pas dans une room' });
        const room = rooms.get(currentRoom);
        if (!room) return callback({ success: false, error: 'Room introuvable' });
        if (room.host !== socket.id) return callback({ success: false, error: 'Seul le host peut demarrer' });
        if (room.gameStarted) return callback({ success: false, error: 'Partie deja en cours' });
        room.gameStarted = true;
        room.lastActivity = Date.now();
        console.log('🎮 Game started in room: ' + room.id);
        // Notifie tous les joueurs (y compris le host)
        drawberuIO.to(room.id).emit('game:started');
        callback({ success: true });
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    socket.on('draw:stroke', (data) => {
      if (!currentRoom || !playerInfo) return;
      const room = rooms.get(currentRoom);
      if (!room) return;
      const stroke = { id: uuidv4(), playerId: socket.id, playerName: playerInfo.name, playerColor: playerInfo.color, layer: data.layer, points: data.points, color: data.color, brushSize: data.brushSize, tool: data.tool, timestamp: Date.now() };
      room.strokes.push(stroke);
      if (room.strokes.length > 1000) room.strokes = room.strokes.slice(-500);
      room.lastActivity = Date.now();
      socket.to(room.id).emit('draw:stroke', stroke);
    });

    socket.on('draw:stroking', (data) => {
      if (!currentRoom || !playerInfo) return;
      socket.to(currentRoom).emit('draw:stroking', { playerId: socket.id, point: data.point, color: data.color, brushSize: data.brushSize, layer: data.layer });
    });

    socket.on('draw:undo', (data, callback) => {
      if (!currentRoom || !playerInfo) return;
      const room = rooms.get(currentRoom);
      if (!room) return;
      const lastStrokeIndex = room.strokes.findLastIndex(s => s.playerId === socket.id);
      if (lastStrokeIndex !== -1) {
        const removedStroke = room.strokes.splice(lastStrokeIndex, 1)[0];
        drawberuIO.to(room.id).emit('draw:undo', { playerId: socket.id, strokeId: removedStroke.id });
        if (callback) callback({ success: true });
      } else {
        if (callback) callback({ success: false, error: 'Rien a annuler' });
      }
    });

    socket.on('draw:clearLayer', (data) => {
      if (!currentRoom || !playerInfo) return;
      const room = rooms.get(currentRoom);
      if (!room || room.host !== socket.id) return;
      room.strokes = room.strokes.filter(s => s.layer !== data.layer);
      drawberuIO.to(room.id).emit('draw:clearLayer', { layer: data.layer, by: playerInfo.name });
    });

    socket.on('cursor:move', (data) => {
      if (!currentRoom || !playerInfo) return;
      playerInfo.cursor = { x: data.x, y: data.y };
      playerInfo.isDrawing = data.isDrawing || false;
      socket.to(currentRoom).emit('cursor:update', { playerId: socket.id, playerName: playerInfo.name, playerColor: playerInfo.color, x: data.x, y: data.y, isDrawing: data.isDrawing });
    });

    socket.on('room:leave', (callback) => {
      handleLeaveRoom();
      if (callback) callback({ success: true });
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Deconnexion: ' + socket.id);
      handleLeaveRoom();
    });

    socket.on('room:info', (data, callback) => {
      const room = rooms.get(data.roomId?.toUpperCase());
      if (!room) return callback({ success: false, error: 'Room introuvable' });
      callback({ success: true, room: { id: room.id, hunter: room.hunter, model: room.model, playerCount: room.players.length, maxPlayers: room.settings.maxPlayers, spectatorCount: room.spectators.length, hostName: room.hostName } });
    });

    function handleLeaveRoom() {
      if (!currentRoom) return;
      const room = rooms.get(currentRoom);
      if (!room) return;
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const leavingPlayer = room.players.splice(playerIndex, 1)[0];
        socket.to(room.id).emit('room:playerLeft', { playerId: socket.id, playerName: leavingPlayer.name });
        if (leavingPlayer.isHost && room.players.length > 0) {
          const newHost = room.players[0];
          newHost.isHost = true;
          room.host = newHost.id;
          room.hostName = newHost.name;
          drawberuIO.to(room.id).emit('room:newHost', { newHostId: newHost.id, newHostName: newHost.name });
        }
        if (room.players.length === 0 && room.spectators.length === 0) rooms.delete(room.id);
      } else {
        const specIndex = room.spectators.findIndex(s => s.id === socket.id);
        if (specIndex !== -1) room.spectators.splice(specIndex, 1);
      }
      socket.leave(currentRoom);
      currentRoom = null;
      playerInfo = null;
    }
  });

  setInterval(() => {
    const now = Date.now();
    for (const [roomId, room] of rooms) {
      if (now - room.lastActivity > 30 * 60 * 1000) {
        drawberuIO.to(roomId).emit('room:expired', { reason: 'Inactivite' });
        rooms.delete(roomId);
      }
    }
  }, 10 * 60 * 1000);

  return drawberuIO;
};

const getRoomsStats = () => {
  const stats = { totalRooms: rooms.size, totalPlayers: 0, totalSpectators: 0, rooms: [] };
  for (const [roomId, room] of rooms) {
    stats.totalPlayers += room.players.length;
    stats.totalSpectators += room.spectators.length;
    stats.rooms.push({ id: roomId, hunter: room.hunter, players: room.players.length, spectators: room.spectators.length, strokes: room.strokes.length });
  }
  return stats;
};

module.exports = { initDrawBeruSockets, getRoomsStats };
