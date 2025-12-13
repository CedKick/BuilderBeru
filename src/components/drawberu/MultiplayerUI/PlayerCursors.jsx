// src/components/DrawBeru/MultiplayerUI/PlayerCursors.jsx
// Affichage des curseurs des autres joueurs
// Par Kaisel pour le Monarque des Ombres

import React from 'react';

const PlayerCursors = ({ cursors, canvasRef, zoomLevel = 1, panOffset = { x: 0, y: 0 } }) => {
  // Convertir les coordonnées canvas en coordonnées écran
  const getScreenPosition = (canvasX, canvasY) => {
    if (!canvasRef?.current) return { x: canvasX, y: canvasY };

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Position relative au canvas affiché
    const screenX = (canvasX / canvas.width) * rect.width + rect.left;
    const screenY = (canvasY / canvas.height) * rect.height + rect.top;

    return { x: screenX, y: screenY };
  };

  const cursorEntries = Object.entries(cursors);

  if (cursorEntries.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      {cursorEntries.map(([playerId, cursor]) => {
        const screenPos = getScreenPosition(cursor.x, cursor.y);

        return (
          <div
            key={playerId}
            className="absolute transition-all duration-75 ease-out"
            style={{
              left: screenPos.x,
              top: screenPos.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Point du curseur */}
            <div
              className={`rounded-full border-2 border-white shadow-lg ${
                cursor.isDrawing ? 'animate-pulse' : ''
              }`}
              style={{
                width: cursor.isDrawing ? Math.max(8, cursor.brushSize * 2) : 12,
                height: cursor.isDrawing ? Math.max(8, cursor.brushSize * 2) : 12,
                backgroundColor: cursor.color,
                boxShadow: `0 0 8px ${cursor.color}80`,
              }}
            />

            {/* Nom du joueur */}
            <div
              className="absolute left-4 top-0 whitespace-nowrap px-2 py-0.5 rounded text-xs font-bold shadow-lg"
              style={{
                backgroundColor: cursor.color,
                color: 'white',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              {cursor.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlayerCursors;
