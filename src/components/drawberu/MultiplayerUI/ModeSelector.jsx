// src/components/DrawBeru/MultiplayerUI/ModeSelector.jsx
// Sélection du mode Solo ou Multi
// Par Kaisel pour le Monarque des Ombres

import React from 'react';

const ModeSelector = ({ onSelectSolo, onSelectMulti }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold text-center text-lg mb-6">
        Comment veux-tu jouer ?
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* SOLO */}
        <button
          onClick={onSelectSolo}
          className="group relative bg-gradient-to-br from-purple-600/30 to-blue-600/30 hover:from-purple-600/50 hover:to-blue-600/50 border-2 border-purple-500/50 hover:border-purple-400 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
            🎮
          </div>
          <h4 className="text-white text-xl font-bold mb-2">SOLO</h4>
          <p className="text-purple-200 text-sm">
            Colorie seul à ton rythme
          </p>
          <div className="mt-4 text-purple-300 text-xs">
            💾 Sauvegarde locale
          </div>
        </button>

        {/* MULTI */}
        <button
          onClick={onSelectMulti}
          className="group relative bg-gradient-to-br from-pink-600/30 to-orange-600/30 hover:from-pink-600/50 hover:to-orange-600/50 border-2 border-pink-500/50 hover:border-pink-400 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
        >
          {/* Badge NEW */}
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full animate-pulse">
            NEW!
          </div>

          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
            👥
          </div>
          <h4 className="text-white text-xl font-bold mb-2">MULTI</h4>
          <p className="text-pink-200 text-sm">
            Colorie avec tes amis en temps réel !
          </p>
          <div className="mt-4 text-pink-300 text-xs">
            🌐 2-8 joueurs • Curseurs visibles
          </div>
        </button>
      </div>

      {/* Info Multi */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-500/30 p-4 mt-6">
        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
          <span>✨</span>
          <span>Mode Multi - Features</span>
        </h4>
        <ul className="text-purple-200 text-sm space-y-1">
          <li>• Colorie à plusieurs sur le même dessin</li>
          <li>• Vois les curseurs des autres en temps réel</li>
          <li>• Le host contrôle les règles (pipette, gomme...)</li>
          <li>• Partage un code simple pour inviter</li>
        </ul>
      </div>
    </div>
  );
};

export default ModeSelector;
