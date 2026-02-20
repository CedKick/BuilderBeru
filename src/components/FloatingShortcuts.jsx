// src/components/FloatingShortcuts.jsx
// Raccourcis flottants vers les pages principales

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, Mail, Bell, Sparkles, Users } from 'lucide-react';

const shortcuts = [
  {
    path: '/training-dummy',
    icon: Target,
    label: 'Mannequin',
    color: 'from-orange-600 to-orange-700',
    borderColor: 'border-orange-400/50',
    shadowColor: 'shadow-orange-500/30',
  },
  {
    path: '/mail',
    icon: Mail,
    label: 'Courrier',
    color: 'from-amber-600 to-amber-700',
    borderColor: 'border-amber-400/50',
    shadowColor: 'shadow-amber-500/30',
  },
  {
    path: '/faction',
    icon: Users,
    label: 'Factions',
    color: 'from-cyan-600 to-blue-700',
    borderColor: 'border-cyan-400/50',
    shadowColor: 'shadow-cyan-500/30',
  },
  {
    type: 'drop-log',
    icon: Bell,
    label: 'Drops Légendaires',
    color: 'from-amber-600 to-orange-700',
    borderColor: 'border-amber-400/50',
    shadowColor: 'shadow-amber-500/30',
  },
  {
    type: 'button',
    icon: Sparkles,
    label: 'Mascottes',
    color: 'from-cyan-600 to-cyan-700',
    borderColor: 'border-cyan-400/50',
    shadowColor: 'shadow-cyan-500/30',
  },
];

export default function FloatingShortcuts({ onMascotClick }) {
  const [hasNewDrops, setHasNewDrops] = useState(false);

  // Listen for drop notification updates from ShadowColosseum
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.type === 'drop-log-update') {
        setHasNewDrops(!!e.detail.hasNew);
      }
    };
    window.addEventListener('beru-react', handler);
    return () => window.removeEventListener('beru-react', handler);
  }, []);

  const handleDropLogClick = () => {
    setHasNewDrops(false);
    window.dispatchEvent(new CustomEvent('beru-react', { detail: { type: 'open-drop-log' } }));
  };

  return (
    <div className="fixed top-1/2 -translate-y-1/2 right-4 z-40 flex flex-col gap-3">
      {shortcuts.map((shortcut, index) => {
        const Icon = shortcut.icon;

        // Button for drop log
        if (shortcut.type === 'drop-log') {
          return (
            <button
              key={shortcut.label}
              onClick={handleDropLogClick}
              className={`
                group relative w-14 h-14 rounded-2xl
                bg-gradient-to-br ${shortcut.color}
                border-2 ${shortcut.borderColor}
                shadow-lg ${shortcut.shadowColor}
                flex items-center justify-center
                hover:scale-110 hover:rotate-6
                active:scale-95
                transition-all duration-200
              `}
              title={shortcut.label}
              style={{
                animation: `fadeInRight 0.5s ease-out ${index * 0.1}s backwards`
              }}
            >
              <Icon className="w-6 h-6 text-white" />

              {/* New drops notification badge */}
              {hasNewDrops && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-red-300 animate-pulse" />
              )}

              {/* Tooltip on hover */}
              <div className="absolute right-16 bg-black/90 text-white px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {shortcut.label}
                <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-black/90 rotate-45" />
              </div>
            </button>
          );
        }

        // Button for mascot toggle
        if (shortcut.type === 'button') {
          return (
            <button
              key={shortcut.label}
              onClick={onMascotClick}
              className={`
                group relative w-14 h-14 rounded-2xl
                bg-gradient-to-br ${shortcut.color}
                border-2 ${shortcut.borderColor}
                shadow-lg ${shortcut.shadowColor}
                flex items-center justify-center
                hover:scale-110 hover:rotate-6
                active:scale-95
                transition-all duration-200
              `}
              title={shortcut.label}
              style={{
                animation: `fadeInRight 0.5s ease-out ${index * 0.1}s backwards`
              }}
            >
              <Icon className="w-6 h-6 text-white" />

              {/* Tooltip on hover */}
              <div className="absolute right-16 bg-black/90 text-white px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {shortcut.label}
                <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-black/90 rotate-45" />
              </div>
            </button>
          );
        }

        // Link for navigation
        return (
          <Link
            key={shortcut.path}
            to={shortcut.path}
            className={`
              group relative w-14 h-14 rounded-2xl
              bg-gradient-to-br ${shortcut.color}
              border-2 ${shortcut.borderColor}
              shadow-lg ${shortcut.shadowColor}
              flex items-center justify-center
              hover:scale-110 hover:rotate-6
              active:scale-95
              transition-all duration-200
            `}
            title={shortcut.label}
            style={{
              animation: `fadeInRight 0.5s ease-out ${index * 0.1}s backwards`
            }}
          >
            <Icon className="w-6 h-6 text-white" />

            {/* Tooltip on hover */}
            <div className="absolute right-16 bg-black/90 text-white px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {shortcut.label}
              <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-black/90 rotate-45" />
            </div>
          </Link>
        );
      })}

      <style jsx="true">{`
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
