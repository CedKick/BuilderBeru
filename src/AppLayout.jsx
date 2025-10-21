import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import BuilderMenu from './buildermenu';

export default function AppLayout({ children }) {
  const [showMenu, setShowMenu] = useState(false);

  // Fermer le menu avec la touche Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showMenu) {
        setShowMenu(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showMenu]);

  // Bloquer le scroll du body quand le menu est ouvert sur mobile
  useEffect(() => {
    if (showMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMenu]);

  return (
    <div className="relative min-h-screen bg-[#0f0f1a] text-white">
      <style jsx="true">{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(168, 85, 247, 0);
          }
        }

        .menu-button {
          animation: pulse 2s infinite;
        }

        .backdrop {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>

      {/* Bouton hamburger - Desktop & Mobile */}
      <button
        onClick={() => setShowMenu(true)}
        className="menu-button fixed top-4 left-4 z-40 p-3 rounded-xl
                   bg-gradient-to-br from-purple-600/90 to-indigo-600/90
                   hover:from-purple-500 hover:to-indigo-500
                   backdrop-blur-md border border-purple-400/30
                   shadow-lg hover:shadow-purple-500/50
                   transition-all duration-300 hover:scale-110
                   group"
        aria-label="Ouvrir le menu"
      >
        <Menu className="w-6 h-6 text-white group-hover:rotate-180 transition-transform duration-300" />
      </button>

      {/* Overlay backdrop - visible quand le menu est ouvert */}
      {showMenu && (
        <div
          className="backdrop fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setShowMenu(false)}
          aria-label="Fermer le menu"
        />
      )}

      {/* Menu latéral */}
      <BuilderMenu isOpen={showMenu} onClose={() => setShowMenu(false)} />

      {/* Contenu principal */}
      <main className="w-full min-h-screen">
        {children}
      </main>
    </div>
  );
}
