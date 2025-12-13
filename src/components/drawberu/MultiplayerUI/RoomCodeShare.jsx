// src/components/DrawBeru/MultiplayerUI/RoomCodeShare.jsx
// Affichage et partage du code de room
// Par Kaisel pour le Monarque des Ombres

import React, { useState } from 'react';

const RoomCodeShare = ({ roomCode, hunterName, modelName }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback pour les navigateurs qui ne supportent pas clipboard
      const textArea = document.createElement('textarea');
      textArea.value = roomCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareRoom = async () => {
    const shareData = {
      title: 'DrawBeru Multi',
      text: `Rejoins-moi sur DrawBeru Multi ! Code: ${roomCode} - On colorie ${hunterName} ensemble !`,
      url: `${window.location.origin}/drawberu?room=${roomCode}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      // Fallback: copier le lien
      copyCode();
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-xl border border-purple-500/50 p-4">
      <h3 className="text-white font-semibold mb-2 text-center">
        Code de la Room
      </h3>

      {/* Code affiché en gros */}
      <div
        onClick={copyCode}
        className="bg-black/40 rounded-lg p-4 mb-3 cursor-pointer hover:bg-black/50 transition-all group"
      >
        <div className="text-3xl font-mono font-bold text-center text-white tracking-widest select-all">
          {roomCode}
        </div>
        <div className="text-center text-purple-300 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Cliquer pour copier
        </div>
      </div>

      {/* Infos de la room */}
      {hunterName && (
        <div className="text-center text-purple-200 text-sm mb-3">
          {hunterName} {modelName && `- ${modelName}`}
        </div>
      )}

      {/* Boutons */}
      <div className="flex gap-2">
        <button
          onClick={copyCode}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {copied ? (
            <>
              <span>✓</span>
              <span>Copié !</span>
            </>
          ) : (
            <>
              <span>📋</span>
              <span>Copier</span>
            </>
          )}
        </button>

        <button
          onClick={shareRoom}
          className="flex-1 py-2 px-4 rounded-lg font-medium bg-pink-600 hover:bg-pink-700 text-white transition-all flex items-center justify-center gap-2"
        >
          <span>📤</span>
          <span>Partager</span>
        </button>
      </div>
    </div>
  );
};

export default RoomCodeShare;
