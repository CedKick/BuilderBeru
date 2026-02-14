// src/pages/DrawBeru/DrawBeruLauncher.jsx
// Point d'entrée DrawBeru avec choix Solo/Multi
// Par Kaisel pour le Monarque des Ombres

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { drawBeruModels, getModel } from './config/models';
import {
  HunterModelSelector,
  ModeSelector,
  RoomLobby,
  PlayerCursors,
} from '../../components/drawberu/MultiplayerUI';
import useMultiplayer from './hooks/useMultiplayer';
import DrawBeru from './DrawBeru';

// États du launcher
const LAUNCHER_STATES = {
  SELECT_HUNTER: 'select_hunter',  // Sélection hunter/modèle
  SELECT_MODE: 'select_mode',       // Choix solo/multi
  MULTI_LOBBY: 'multi_lobby',       // Lobby multi
  PLAYING_SOLO: 'playing_solo',     // En jeu solo
  PLAYING_MULTI: 'playing_multi',   // En jeu multi
};

const DrawBeruLauncher = () => {
  const [searchParams] = useSearchParams();

  // État du launcher
  const [currentState, setCurrentState] = useState(LAUNCHER_STATES.SELECT_HUNTER);

  // Sélection hunter/modèle
  const [selectedHunter, setSelectedHunter] = useState(() => {
    // Récupérer le dernier dessin visité
    try {
      const stored = localStorage.getItem('drawberu_last_drawing');
      if (stored) {
        const { hunter } = JSON.parse(stored);
        if (drawBeruModels[hunter]) return hunter;
      }
    } catch (e) {}
    return Object.keys(drawBeruModels)[0];
  });

  const [selectedModel, setSelectedModel] = useState(() => {
    try {
      const stored = localStorage.getItem('drawberu_last_drawing');
      if (stored) {
        const { hunter, model } = JSON.parse(stored);
        if (drawBeruModels[hunter]?.models[model]) return model;
      }
    } catch (e) {}
    return 'default';
  });

  // Multiplayer hook
  const multiplayer = useMultiplayer();

  // Vérifier si on a un code de room dans l'URL
  useEffect(() => {
    const roomCode = searchParams.get('room');
    if (roomCode) {
      // On va direct au lobby multi pour rejoindre
      setCurrentState(LAUNCHER_STATES.MULTI_LOBBY);
    }
  }, [searchParams]);

  // Écouter quand la partie démarre (pour tous les joueurs)
  useEffect(() => {
    if (multiplayer.gameStarted && currentState === LAUNCHER_STATES.MULTI_LOBBY) {
      setCurrentState(LAUNCHER_STATES.PLAYING_MULTI);
    }
  }, [multiplayer.gameStarted, currentState]);

  // Données du modèle sélectionné
  const currentModelData = getModel(selectedHunter, selectedModel);
  const hunterName = drawBeruModels[selectedHunter]?.name || selectedHunter;
  const modelName = currentModelData?.name || selectedModel;

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleHunterChange = (hunterId) => {
    setSelectedHunter(hunterId);
    setSelectedModel('default');
  };

  const handleModelChange = (modelId) => {
    setSelectedModel(modelId);
  };

  const handleContinue = () => {
    // Passer à la sélection du mode
    setCurrentState(LAUNCHER_STATES.SELECT_MODE);
  };

  const handleSelectSolo = () => {
    // Lancer le mode solo
    setCurrentState(LAUNCHER_STATES.PLAYING_SOLO);
  };

  const handleSelectMulti = () => {
    // Aller au lobby multi
    setCurrentState(LAUNCHER_STATES.MULTI_LOBBY);
  };

  const handleBack = () => {
    // Retour en arrière selon l'état
    switch (currentState) {
      case LAUNCHER_STATES.SELECT_MODE:
        setCurrentState(LAUNCHER_STATES.SELECT_HUNTER);
        break;
      case LAUNCHER_STATES.MULTI_LOBBY:
        if (multiplayer.room) {
          multiplayer.leaveRoom();
        } else {
          setCurrentState(LAUNCHER_STATES.SELECT_MODE);
        }
        break;
      case LAUNCHER_STATES.PLAYING_SOLO:
      case LAUNCHER_STATES.PLAYING_MULTI:
        // Retour au launcher
        if (multiplayer.room) {
          multiplayer.leaveRoom();
        }
        setCurrentState(LAUNCHER_STATES.SELECT_HUNTER);
        break;
      default:
        break;
    }
  };

  const handleCreateRoom = async (playerName) => {
    await multiplayer.createRoom(playerName, selectedHunter, selectedModel);
  };

  const handleJoinRoom = async (roomCode, playerName) => {
    const response = await multiplayer.joinRoom(roomCode, playerName);
    // Si on rejoint une room avec un hunter/model différent, on adapte
    if (response.room) {
      setSelectedHunter(response.room.hunter);
      setSelectedModel(response.room.model);
    }
  };

  const handleStartGame = async () => {
    try {
      await multiplayer.startGame();
      // L'état sera changé via le useEffect qui écoute multiplayer.gameStarted
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  const handleLeaveGame = () => {
    if (multiplayer.room) {
      multiplayer.leaveRoom();
    }
    setCurrentState(LAUNCHER_STATES.SELECT_HUNTER);
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  // En jeu solo
  if (currentState === LAUNCHER_STATES.PLAYING_SOLO) {
    return (
      <DrawBeru
        initialHunter={selectedHunter}
        initialModel={selectedModel}
        onBack={handleLeaveGame}
      />
    );
  }

  // En jeu multi
  if (currentState === LAUNCHER_STATES.PLAYING_MULTI) {
    return (
      <>
        <DrawBeru
          initialHunter={selectedHunter}
          initialModel={selectedModel}
          multiplayerMode={true}
          multiplayer={multiplayer}
          onBack={handleLeaveGame}
        />
        {/* Curseurs des autres joueurs */}
        <PlayerCursors cursors={multiplayer.otherCursors} />
      </>
    );
  }

  // Lobby multi
  if (currentState === LAUNCHER_STATES.MULTI_LOBBY) {
    return (
      <RoomLobby
        room={multiplayer.room}
        players={multiplayer.players}
        spectators={multiplayer.spectators}
        isHost={multiplayer.isHost}
        myPlayer={multiplayer.myPlayer}
        settings={multiplayer.settings}
        isConnecting={multiplayer.isConnecting}
        connectionError={multiplayer.connectionError}
        selectedHunter={selectedHunter}
        selectedModel={selectedModel}
        hunterName={hunterName}
        modelName={modelName}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onLeaveRoom={() => {
          multiplayer.leaveRoom();
          setCurrentState(LAUNCHER_STATES.SELECT_MODE);
        }}
        onUpdateSettings={multiplayer.updateSettings}
        onStartGame={handleStartGame}
        onBack={() => {
          if (multiplayer.room) {
            multiplayer.leaveRoom();
          }
          setCurrentState(LAUNCHER_STATES.SELECT_MODE);
        }}
      />
    );
  }

  // Sélection du mode
  if (currentState === LAUNCHER_STATES.SELECT_MODE) {
    return (
      <div className="min-h-screen bg-[#0a0118] p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleBack}
              className="text-purple-300 hover:text-white transition-colors"
            >
              ← Retour
            </button>
            <div className="flex items-center gap-3 flex-grow">
              <img
                src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760821994/DrasBeru_zd8ju5.png"
                alt="DrawBeru"
                className="w-10 h-10"
              />
              <h1 className="text-2xl font-bold text-white">DrawBeru</h1>
            </div>
          </div>

          {/* Info sélection */}
          <div className="bg-purple-900/30 rounded-xl border border-purple-500/30 p-4 mb-6 text-center">
            <div className="text-purple-300 text-sm">Tu vas colorier</div>
            <div className="text-white text-xl font-bold">
              {hunterName} - {modelName}
            </div>
          </div>

          {/* Mode Selector */}
          <ModeSelector
            onSelectSolo={handleSelectSolo}
            onSelectMulti={handleSelectMulti}
          />
        </div>
      </div>
    );
  }

  // Sélection Hunter/Modèle (état par défaut)
  return (
    <div className="min-h-screen bg-[#0a0118] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <img
            src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760821994/DrasBeru_zd8ju5.png"
            alt="DrawBeru"
            className="w-12 h-12"
          />
          <div>
            <h1 className="text-3xl font-bold text-white">DrawBeru</h1>
            <p className="text-purple-300 text-sm">Colorie tes Hunters préférés !</p>
          </div>
        </div>

        {/* Hunter & Model Selection */}
        <HunterModelSelector
          selectedHunter={selectedHunter}
          selectedModel={selectedModel}
          onHunterChange={handleHunterChange}
          onModelChange={handleModelChange}
        />

        {/* Continue Button */}
        <div className="mt-8">
          <button
            onClick={handleContinue}
            disabled={!currentModelData}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              currentModelData
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continuer →
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrawBeruLauncher;
