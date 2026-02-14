// src/components/DrawBeru/MultiplayerUI/RoomSettings.jsx
// Paramètres de la room (host only)
// Par Kaisel pour le Monarque des Ombres

import React from 'react';
import { MULTIPLAYER_CONFIG } from '../../../config/multiplayer';

const RoomSettings = ({ settings, onUpdateSettings, isHost, disabled = false }) => {
  const handleChange = (key, value) => {
    if (!isHost || disabled) return;
    onUpdateSettings({ ...settings, [key]: value });
  };

  return (
    <div className="bg-purple-900/30 rounded-xl border border-purple-500/30 p-4">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <span>⚙️</span>
        <span>Paramètres</span>
        {!isHost && <span className="text-purple-400 text-xs">(Host uniquement)</span>}
      </h3>

      <div className="space-y-4">
        {/* Max Players */}
        <div>
          <label className="text-purple-200 text-sm block mb-2">
            Joueurs max
          </label>
          <div className="flex items-center gap-2">
            {[2, 3, 4, 5, 6, 7, 8].map((num) => (
              <button
                key={num}
                onClick={() => handleChange('maxPlayers', num)}
                disabled={!isHost || disabled}
                className={`w-10 h-10 rounded-lg font-bold transition-all ${
                  settings.maxPlayers === num
                    ? 'bg-purple-600 text-white'
                    : 'bg-black/30 text-purple-300 hover:bg-purple-800/50'
                } ${(!isHost || disabled) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Auto Pipette */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-white text-sm block">Auto-Pipette</label>
            <span className="text-purple-300 text-xs">
              Couleurs automatiques depuis la référence
            </span>
          </div>
          <button
            onClick={() => handleChange('autoPipette', !settings.autoPipette)}
            disabled={!isHost || disabled}
            className={`w-14 h-8 rounded-full transition-all relative ${
              settings.autoPipette
                ? 'bg-green-500'
                : 'bg-gray-600'
            } ${(!isHost || disabled) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div
              className={`absolute w-6 h-6 bg-white rounded-full top-1 transition-all ${
                settings.autoPipette ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Eraser Allowed */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-white text-sm block">Gomme</label>
            <span className="text-purple-300 text-xs">
              Autoriser l'utilisation de la gomme
            </span>
          </div>
          <button
            onClick={() => handleChange('eraserAllowed', !settings.eraserAllowed)}
            disabled={!isHost || disabled}
            className={`w-14 h-8 rounded-full transition-all relative ${
              settings.eraserAllowed
                ? 'bg-green-500'
                : 'bg-gray-600'
            } ${(!isHost || disabled) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div
              className={`absolute w-6 h-6 bg-white rounded-full top-1 transition-all ${
                settings.eraserAllowed ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Spectators Allowed */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-white text-sm block">Spectateurs</label>
            <span className="text-purple-300 text-xs">
              Autoriser les spectateurs si room pleine
            </span>
          </div>
          <button
            onClick={() => handleChange('spectatorAllowed', !settings.spectatorAllowed)}
            disabled={!isHost || disabled}
            className={`w-14 h-8 rounded-full transition-all relative ${
              settings.spectatorAllowed
                ? 'bg-green-500'
                : 'bg-gray-600'
            } ${(!isHost || disabled) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div
              className={`absolute w-6 h-6 bg-white rounded-full top-1 transition-all ${
                settings.spectatorAllowed ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomSettings;
