// src/components/DrawBeru/MultiplayerUI/PlayersList.jsx
// Liste des joueurs dans une room
// Par Kaisel pour le Monarque des Ombres

import React from 'react';

const PlayersList = ({ players, spectators = [], myPlayerId, isHost }) => {
  return (
    <div className="bg-purple-900/30 rounded-xl border border-purple-500/30 p-4">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <span>👥</span>
        <span>Joueurs ({players.length})</span>
      </h3>

      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
              player.id === myPlayerId
                ? 'bg-purple-600/30 border border-purple-500/50'
                : 'bg-black/20'
            }`}
          >
            {/* Couleur du joueur */}
            <div
              className="w-4 h-4 rounded-full border-2 border-white/50 flex-shrink-0"
              style={{ backgroundColor: player.color }}
            />

            {/* Nom du joueur */}
            <span className="text-white font-medium flex-grow truncate">
              {player.name}
              {player.id === myPlayerId && (
                <span className="text-purple-300 text-xs ml-2">(toi)</span>
              )}
            </span>

            {/* Badge Host */}
            {player.isHost && (
              <span className="text-yellow-400 text-lg" title="Host">
                👑
              </span>
            )}

            {/* Indicateur de dessin */}
            {player.isDrawing && (
              <span className="text-green-400 animate-pulse" title="En train de dessiner">
                ✏️
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Spectateurs */}
      {spectators.length > 0 && (
        <div className="mt-4 pt-3 border-t border-purple-500/30">
          <h4 className="text-purple-300 text-sm font-medium mb-2 flex items-center gap-2">
            <span>👁️</span>
            <span>Spectateurs ({spectators.length})</span>
          </h4>
          <div className="space-y-1">
            {spectators.map((spectator) => (
              <div
                key={spectator.id}
                className="flex items-center gap-2 text-purple-200 text-sm"
              >
                <span className="text-purple-400">•</span>
                <span>{spectator.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayersList;
