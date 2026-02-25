// src/components/FloatingShortcuts.jsx
// Raccourcis flottants - FAB Menu sur mobile, liste verticale sur desktop

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Target, Mail, Bell, Sparkles, Users, Plus, X } from 'lucide-react';
import { isLoggedIn, authHeaders } from '../utils/auth';

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
    type: 'mail',
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
  const navigate = useNavigate();
  const location = useLocation();
  const [hasNewDrops, setHasNewDrops] = useState(false);
  const [unreadMailCount, setUnreadMailCount] = useState(0);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const lastKnownDropIdRef = useRef(0);

  // ── Drop-log polling (every 15 min) ──
  useEffect(() => {
    const fetchDropLog = () => {
      fetch('/api/drop-log?action=recent')
        .then(r => r.json())
        .then(d => {
          if (d.success && d.drops && d.drops.length > 0) {
            const threeDaysAgo = Date.now() - 3 * 24 * 3600000;
            const filtered = d.drops.filter(dr => new Date(dr.createdAt).getTime() > threeDaysAgo);
            const newestId = filtered.length > 0 ? filtered[0].id : 0;

            if (lastKnownDropIdRef.current > 0 && newestId > lastKnownDropIdRef.current) {
              setHasNewDrops(true);
              window.dispatchEvent(new CustomEvent('beru-react', {
                detail: { type: 'drop-log-update', hasNew: true }
              }));
            }
            lastKnownDropIdRef.current = newestId;
          }
        })
        .catch(() => {});
    };

    fetchDropLog();
    const iv = setInterval(fetchDropLog, 900000);
    return () => clearInterval(iv);
  }, []);

  // ── Mail unread count polling (every 15 min) ──
  useEffect(() => {
    const fetchUnread = () => {
      if (!isLoggedIn()) return;
      fetch('/api/mail?action=inbox&filter=unread&limit=1', { headers: authHeaders() })
        .then(r => r.json())
        .then(d => {
          if (d.success) setUnreadMailCount(d.unreadCount || 0);
        })
        .catch(() => {});
    };

    fetchUnread();
    const iv = setInterval(fetchUnread, 900000);
    return () => clearInterval(iv);
  }, []);

  // Listen for external updates
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.type === 'drop-log-update') {
        setHasNewDrops(!!e.detail.hasNew);
      }
      if (e.detail?.type === 'mail-update') {
        if (!isLoggedIn()) return;
        fetch('/api/mail?action=inbox&filter=unread&limit=1', { headers: authHeaders() })
          .then(r => r.json())
          .then(d => { if (d.success) setUnreadMailCount(d.unreadCount || 0); })
          .catch(() => {});
      }
    };
    window.addEventListener('beru-react', handler);
    return () => window.removeEventListener('beru-react', handler);
  }, []);

  const handleDropLogClick = () => {
    setHasNewDrops(false);
    setIsFabOpen(false);
    if (location.pathname === '/shadow-colosseum') {
      window.dispatchEvent(new CustomEvent('beru-react', { detail: { type: 'open-drop-log' } }));
    } else {
      navigate('/shadow-colosseum?droplog=1');
    }
  };

  const handleShortcutClick = () => {
    setIsFabOpen(false);
  };

  const renderShortcutButton = (shortcut, index, isMobile = false) => {
    const Icon = shortcut.icon;
    const baseClasses = `
      group relative rounded-2xl
      bg-gradient-to-br ${shortcut.color}
      border-2 ${shortcut.borderColor}
      shadow-lg ${shortcut.shadowColor}
      flex items-center justify-center
      hover:scale-110 hover:rotate-6
      active:scale-95
      transition-all duration-200
      ${isMobile ? 'w-12 h-12' : 'w-14 h-14'}
    `;

    // Drop log button
    if (shortcut.type === 'drop-log') {
      return (
        <button
          key={shortcut.label}
          onClick={handleDropLogClick}
          className={baseClasses}
          title={shortcut.label}
          style={!isMobile ? {
            animation: `fadeInRight 0.5s ease-out ${index * 0.1}s backwards`
          } : undefined}
        >
          <Icon className={`text-white ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
          {hasNewDrops && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-red-300 animate-pulse" />
          )}
          {!isMobile && (
            <div className="absolute right-16 bg-black/90 text-white px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {shortcut.label}
              <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-black/90 rotate-45" />
            </div>
          )}
        </button>
      );
    }

    // Mail button
    if (shortcut.type === 'mail') {
      return (
        <Link
          key={shortcut.path}
          to={shortcut.path}
          onClick={handleShortcutClick}
          className={baseClasses}
          title={shortcut.label}
          style={!isMobile ? {
            animation: `fadeInRight 0.5s ease-out ${index * 0.1}s backwards`
          } : undefined}
        >
          <Icon className={`text-white ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
          {unreadMailCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 border-2 border-white text-white text-[9px] font-bold px-0.5 animate-pulse">
              {unreadMailCount > 99 ? '99+' : unreadMailCount}
            </span>
          )}
          {!isMobile && (
            <div className="absolute right-16 bg-black/90 text-white px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {shortcut.label}
              <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-black/90 rotate-45" />
            </div>
          )}
        </Link>
      );
    }

    // Mascot button
    if (shortcut.type === 'button') {
      return (
        <button
          key={shortcut.label}
          onClick={() => { onMascotClick(); setIsFabOpen(false); }}
          className={baseClasses}
          title={shortcut.label}
          style={!isMobile ? {
            animation: `fadeInRight 0.5s ease-out ${index * 0.1}s backwards`
          } : undefined}
        >
          <Icon className={`text-white ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
          {!isMobile && (
            <div className="absolute right-16 bg-black/90 text-white px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {shortcut.label}
              <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-black/90 rotate-45" />
            </div>
          )}
        </button>
      );
    }

    // Regular link
    return (
      <Link
        key={shortcut.path}
        to={shortcut.path}
        onClick={handleShortcutClick}
        className={baseClasses}
        title={shortcut.label}
        style={!isMobile ? {
          animation: `fadeInRight 0.5s ease-out ${index * 0.1}s backwards`
        } : undefined}
      >
        <Icon className={`text-white ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
        {!isMobile && (
          <div className="absolute right-16 bg-black/90 text-white px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {shortcut.label}
            <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-black/90 rotate-45" />
          </div>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Desktop: Vertical list (hidden on mobile) */}
      <div className="hidden sm:flex fixed top-1/2 -translate-y-1/2 right-4 z-40 flex-col gap-3">
        {shortcuts.map((shortcut, index) => renderShortcutButton(shortcut, index, false))}
      </div>

      {/* Mobile: FAB Menu (hidden on desktop) */}
      <div className="sm:hidden fixed bottom-20 right-4 z-40">
        {/* Backdrop overlay when open */}
        {isFabOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
            onClick={() => setIsFabOpen(false)}
          />
        )}

        {/* Shortcut buttons (appear when FAB is open) */}
        {isFabOpen && (
          <div className="absolute bottom-16 right-0 flex flex-col-reverse gap-3 mb-2">
            {shortcuts.map((shortcut, index) => (
              <div
                key={shortcut.label || shortcut.path}
                className="flex items-center gap-2"
                style={{
                  animation: `fabSlideIn 0.2s ease-out ${index * 0.05}s backwards`
                }}
              >
                {/* Label (only on mobile FAB) */}
                <span className="bg-black/90 text-white px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shadow-lg">
                  {shortcut.label}
                </span>
                {renderShortcutButton(shortcut, index, true)}
              </div>
            ))}
          </div>
        )}

        {/* Main FAB toggle button */}
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`
            w-14 h-14 rounded-full
            bg-gradient-to-br from-purple-600 to-indigo-700
            border-2 border-purple-400/50
            shadow-lg shadow-purple-500/30
            flex items-center justify-center
            hover:scale-110
            active:scale-95
            transition-all duration-200
            ${isFabOpen ? 'rotate-45' : 'rotate-0'}
          `}
        >
          {isFabOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <>
              <Plus className="w-6 h-6 text-white" />
              {/* Notification badges on FAB */}
              {(hasNewDrops || unreadMailCount > 0) && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white animate-pulse" />
              )}
            </>
          )}
        </button>
      </div>

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
        @keyframes fabSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}
