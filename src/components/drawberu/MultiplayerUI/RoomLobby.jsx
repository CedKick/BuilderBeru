// src/components/DrawBeru/MultiplayerUI/RoomLobby.jsx
// Lobby pour créer/rejoindre une room
// Par Kaisel pour le Monarque des Ombres

import React, { useState } from 'react';
import RoomCodeShare from './RoomCodeShare';
import RoomSettings from './RoomSettings';
import PlayersList from './PlayersList';
import { MULTIPLAYER_CONFIG } from '../../../config/multiplayer';

const RoomLobby = ({
  // Room state
  room,
  players,
  spectators,
  isHost,
  myPlayer,
  settings,
  isConnecting,
  connectionError,

  // Selected hunter/model
  selectedHunter,
  selectedModel,
  hunterName,
  modelName,

  // Actions
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  onUpdateSettings,
  onStartGame,
  onBack,
}) => {
  const [playerName, setPlayerName] = useState(
    localStorage.getItem('drawberu_player_name') || ''
  );
  const [roomCode, setRoomCode] = useState('');
  const [joinError, setJoinError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Sauvegarder le nom du joueur
  const savePlayerName = (name) => {
    setPlayerName(name);
    localStorage.setItem('drawberu_player_name', name);
  };

  // Créer une room
  const handleCreate = async () => {
    if (!playerName.trim()) {
      setJoinError('Entre ton pseudo !');
      return;
    }

    setIsCreating(true);
    setJoinError(null);

    try {
      await onCreateRoom(playerName.trim());
    } catch (error) {
      setJoinError(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  // Rejoindre une room
  const handleJoin = async () => {
    if (!playerName.trim()) {
      setJoinError('Entre ton pseudo !');
      return;
    }

    if (!roomCode.trim()) {
      setJoinError('Entre le code de la room !');
      return;
    }

    setIsJoining(true);
    setJoinError(null);

    try {
      await onJoinRoom(roomCode.trim(), playerName.trim());
    } catch (error) {
      setJoinError(error.message);
    } finally {
      setIsJoining(false);
    }
  };

  // Si on est dans une room
  if (room) {
    return (
      <div className="min-h-screen bg-[#0a0118] p-4">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={onLeaveRoom}
              className="text-purple-300 hover:text-white transition-colors"
            >
              ← Quitter
            </button>
            <h1 className="text-2xl font-bold text-white flex-grow">
              Lobby Multi
            </h1>
          </div>

          {/* Room Code */}
          <RoomCodeShare
            roomCode={room.id}
            hunterName={hunterName}
            modelName={modelName}
          />

          {/* Players List */}
          <PlayersList
            players={players}
            spectators={spectators}
            myPlayerId={myPlayer?.id}
            isHost={isHost}
          />

          {/* Settings (host only) */}
          <RoomSettings
            settings={settings}
            onUpdateSettings={onUpdateSettings}
            isHost={isHost}
          />

          {/* Start Button (host only) */}
          {isHost ? (
            <button
              onClick={onStartGame}
              disabled={players.length < 1}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                players.length >= 1
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {players.length >= 1
                ? `🎨 Commencer (${players.length} joueur${players.length > 1 ? 's' : ''})`
                : 'En attente de joueurs...'}
            </button>
          ) : (
            <div className="bg-purple-600/20 border border-purple-500/30 rounded-xl p-4 text-center">
              <div className="text-purple-200 animate-pulse">
                ⏳ En attente du host...
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Si pas dans une room - écran de création/join
  return (
    <div className="min-h-screen bg-[#0a0118] p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="text-purple-300 hover:text-white transition-colors"
          >
            ← Retour
          </button>
          <h1 className="text-2xl font-bold text-white">Mode Multi</h1>
        </div>

        {/* Info Hunter/Model */}
        <div className="bg-purple-900/30 rounded-xl border border-purple-500/30 p-4 mb-6 text-center">
          <div className="text-purple-300 text-sm">Tu vas colorier</div>
          <div className="text-white text-xl font-bold">
            {hunterName} - {modelName}
          </div>
        </div>

        {/* Pseudo Input */}
        <div className="mb-6">
          <label className="text-white text-sm block mb-2">
            Ton pseudo
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => savePlayerName(e.target.value)}
            placeholder="Entre ton pseudo..."
            maxLength={20}
            className="w-full bg-black/40 border border-purple-500/50 rounded-xl px-4 py-3 text-white placeholder-purple-400 focus:border-purple-400 focus:outline-none"
          />
        </div>

        {/* Error Message */}
        {(joinError || connectionError) && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 mb-4 text-red-300 text-sm">
            ❌ {joinError || connectionError}
          </div>
        )}

        {/* Create Room */}
        <div className="mb-6">
          <button
            onClick={handleCreate}
            disabled={isCreating || isConnecting}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              isCreating || isConnecting
                ? 'bg-purple-800 text-purple-400 cursor-wait'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
            }`}
          >
            {isCreating || isConnecting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Création...
              </span>
            ) : (
              '🎮 Créer une Room'
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-grow h-px bg-purple-500/30" />
          <span className="text-purple-400 text-sm">ou</span>
          <div className="flex-grow h-px bg-purple-500/30" />
        </div>

        {/* Join Room */}
        <div className="space-y-3">
          <label className="text-white text-sm block">
            Rejoindre une Room
          </label>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Code de la room (ex: ILHW-X7K4)"
            maxLength={10}
            className="w-full bg-black/40 border border-purple-500/50 rounded-xl px-4 py-3 text-white placeholder-purple-400 focus:border-purple-400 focus:outline-none font-mono text-center text-xl tracking-wider"
          />
          <button
            onClick={handleJoin}
            disabled={isJoining || isConnecting || !roomCode.trim()}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              isJoining || isConnecting || !roomCode.trim()
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'
            }`}
          >
            {isJoining ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Connexion...
              </span>
            ) : (
              '🚀 Rejoindre'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomLobby;
