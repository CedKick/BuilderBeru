import React, { useState } from 'react';
import BuilderMenu from './buildermenu';

export default function AppLayout({ children }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className="relative min-h-screen bg-[#0f0f1a] text-white overflow-hidden"
      onMouseMove={(e) => {
        if (e.clientX < 40) {
          setShowMenu(true);
        } else if (e.clientX > 100) {
          setShowMenu(false);
        }
      }}
    >
      {/* Menu flottant à gauche */}
      <div
        className={`fixed top-0 left-0 z-50 h-full transition-all duration-300 ${
          showMenu ? 'w-60' : 'w-3'
        } overflow-hidden`}
        style={{ pointerEvents: showMenu ? 'auto' : 'none' }}
      >
        <div className="h-full bg-[#12121c] shadow-lg">
          <BuilderMenu />
        </div>
      </div>

      {/* Contenu principal */}
      <main className="pl-4 pr-4 py-4 w-full overflow-hidden">
        {children}
      </main>
    </div>
  );
}
