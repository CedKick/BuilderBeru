import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import BuilderMenu from './buildermenu';
import FloatingBeruMascot from './components/FloatingBeruMascot';
import FloatingDaijin from './components/FloatingDaijin';
import FloatingPod042 from './components/FloatingPod042';
import FloatingShortcuts from './components/FloatingShortcuts';
import AchievementToast from './components/AchievementToast';
import IgrisVsBeru from './components/IgrisVsBeru/IgrisVsBeru';
import shadowAchievementManager from './utils/ShadowAchievementManager';
import { isLoggedIn } from './utils/auth';

export default function AppLayout({ children }) {
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [userFaction, setUserFaction] = useState(null);
  const [showMascotPanel, setShowMascotPanel] = useState(false);

  // Initialiser le systeme d'achievements
  useEffect(() => { shadowAchievementManager.init(); }, []);

  // Fetch user faction status
  useEffect(() => {
    const fetchFaction = async () => {
      if (!isLoggedIn()) return;

      try {
        const token = localStorage.getItem('builderberu_auth_token');
        const resp = await fetch('/api/factions?action=status', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await resp.json();

        if (data.success && data.inFaction) {
          setUserFaction(data.faction.id);
        }
      } catch (err) {
        console.log('Could not fetch faction:', err);
      }
    };

    fetchFaction();

    // Listen for faction changes
    const handleFactionChange = () => fetchFaction();
    window.addEventListener('faction-update', handleFactionChange);
    return () => window.removeEventListener('faction-update', handleFactionChange);
  }, []);

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
      {/* Faction Background */}
      {userFaction && (
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: userFaction === 'vox_cordis'
              ? 'url(https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771599084/VCBGround_vekobq.jpg)'
              : userFaction === 'replicant'
              ? 'url(https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771599142/RPBground_dgqvzj.jpg)'
              : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.08,
            filter: 'blur(2px)',
          }}
        />
      )}

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
        className="menu-button fixed bottom-4 left-4 md:top-4 md:bottom-auto z-40 p-2 rounded-xl
                   bg-gradient-to-br from-purple-600/60 to-indigo-600/60
                   hover:from-purple-500/80 hover:to-indigo-500/80
                   backdrop-blur-md border border-purple-400/30
                   shadow-lg hover:shadow-purple-500/50
                   transition-all duration-300 hover:scale-110
                   group"
        aria-label="Ouvrir le menu"
      >
        <Menu className="w-5 h-5 text-white group-hover:rotate-180 transition-transform duration-300" />
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

      {/* Mascot Panel (hidden when on Shadow Colosseum - shown in FloatingShortcuts) */}
      {showMascotPanel && (
        <div className="fixed top-4 right-4 z-50 bg-[#0f0f1a] border-2 border-purple-400/50 rounded-xl p-3 shadow-2xl min-w-[200px]">
          <div className="text-xs font-bold text-purple-300 mb-2">Mascottes</div>
          <div className="space-y-2">
            {/* Béru (always available) */}
            <MascotToggleButton
              name="Béru"
              icon="🐜"
              storageKey="beru_mode"
            />

            {/* Daijin (only for Vox Cordis members) */}
            {userFaction === 'vox_cordis' && (
              <MascotToggleButton
                name="Daijin"
                icon="🐱"
                storageKey="daijin_mode"
              />
            )}

            {/* Pod 042 (only for Replicant members) */}
            {userFaction === 'replicant' && (
              <MascotToggleButton
                name="Pod 042"
                icon="🤖"
                storageKey="pod042_mode"
              />
            )}
          </div>
        </div>
      )}

      {/* L'Ombre de Béru - Mascotte Flottante */}
      <FloatingBeruMascot />

      {/* Daijin - Mascotte de Vox Cordis */}
      {userFaction === 'vox_cordis' && (
        <FloatingDaijin
          isHovering={false}
          hasFaction={true}
        />
      )}

      {/* Pod 042 - Unité de Support Replicant */}
      {userFaction === 'replicant' && (
        <FloatingPod042
          isHovering={false}
          hasFaction={true}
        />
      )}

      {/* Floating Shortcuts - Only on Shadow Colosseum */}
      {location.pathname === '/shadow-colosseum' && (
        <FloatingShortcuts onMascotClick={() => setShowMascotPanel(!showMascotPanel)} />
      )}

      {/* Igris vs Beru — Event rare sur Shadow Colosseum */}
      <IgrisVsBeru />

      {/* Shadow Achievements - Toast Notification */}
      <AchievementToast />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MASCOT TOGGLE BUTTON COMPONENT
// ═══════════════════════════════════════════════════════════════

function MascotToggleButton({ name, icon, storageKey }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem(storageKey) || 'normal';
  });

  const modes = ['normal', 'calm', 'hidden'];
  const modeLabels = {
    normal: name === 'Pod 042' ? 'Actif' : 'Normal',
    calm: name === 'Béru' ? 'Calme' : name === 'Pod 042' ? 'Veille' : 'Zen',
    hidden: name === 'Pod 042' ? 'Désactivé' : 'Caché'
  };
  const modeIcons = {
    normal: icon,
    calm: '😌',
    hidden: '👻'
  };

  const cycleMode = () => {
    const currentIndex = modes.indexOf(mode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setMode(nextMode);
    localStorage.setItem(storageKey, nextMode);

    // Trigger re-render of mascot
    window.dispatchEvent(new CustomEvent('beru-react', {
      detail: { type: 'mascot-mode-change', mascot: name, mode: nextMode }
    }));
  };

  return (
    <button
      onClick={cycleMode}
      className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{modeIcons[mode]}</span>
        <div>
          <div className="text-xs font-bold text-white">{name}</div>
          <div className="text-[10px] text-gray-400">{modeLabels[mode]}</div>
        </div>
      </div>
      <div className="text-[10px] text-purple-400">↻</div>
    </button>
  );
}
