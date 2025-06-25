import React, { useState } from 'react';
import BuilderMenu from './buildermenu';

export default function AppLayout({ children }) {
  const [showMenu, setShowMenu] = useState(false);
  const isMobile = window.innerWidth < 768;

  return (
    <div className="relative min-h-screen bg-[#0f0f1a] text-white overflow-hidden">

      {/* ✅ ZONE DE DÉCLENCHEMENT (PC) */}
      {!isMobile && !showMenu && (
        <div
          onMouseEnter={() => setShowMenu(true)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '60px',
            height: '100vh',
            zIndex: 10,
          }}
        />
      )}

      {/* ☰ BOUTON MOBILE */}
      {isMobile && (
        <button
          style={{
            position: 'fixed',
            top: '12px',
            left: '12px',
            zIndex: 1000,
            width: '32px',
            height: '32px',
            backgroundColor: 'rgba(45, 45, 68, 0.3)',
            backdropFilter: 'blur(8px)', // ← Effet de flou en arrière-plan
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
          onClick={() => setShowMenu((prev) => !prev)}
          aria-label="Ouvrir le menu"
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <div style={{ width: '16px', height: '2px', backgroundColor: '#fff', borderRadius: '1px' }} />
            <div style={{ width: '16px', height: '2px', backgroundColor: '#fff', borderRadius: '1px' }} />
            <div style={{ width: '16px', height: '2px', backgroundColor: '#fff', borderRadius: '1px' }} />
          </div>
        </button>
      )}

      {/* MENU LATÉRAL */}
      {(!isMobile || showMenu) && (
        <div
          className={`fixed top-0 left-0 z-50 h-full transition-all duration-300 ${showMenu ? 'w-40' : 'w-3'}`}
          onMouseLeave={() => {
            if (!isMobile) setShowMenu(false);
          }}
          style={{
            pointerEvents: showMenu || isMobile ? 'auto' : 'none',
            width: isMobile ? '240px' : undefined,
          }}
        >
          <div className="h-screen bg-[#12121c] shadow-lg">
            <BuilderMenu isOpen={showMenu || isMobile} />
          </div>
        </div>
      )}

      {/* CONTENU PRINCIPAL */}
      <main className="pl-4 pr-4 py-4 w-full overflow-hidden">
        {children}
      </main>
    </div>
  );
}
