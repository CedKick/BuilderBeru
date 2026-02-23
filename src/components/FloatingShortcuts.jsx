// src/components/FloatingShortcuts.jsx
// Raccourcis flottants vers les pages principales

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Target, Mail, Bell, Sparkles, Users } from 'lucide-react';
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
  const lastKnownDropIdRef = useRef(0);

  // ── Drop-log polling (every 60s) — works on ALL pages ──
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
              // Broadcast to ShadowColosseum if it's mounted
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
    const iv = setInterval(fetchDropLog, 900000); // 15 min (was 5 min — save network)
    return () => clearInterval(iv);
  }, []);

  // ── Mail unread count polling (every 5 min) ──
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
    const iv = setInterval(fetchUnread, 900000); // 15 min (was 5 min — save network)
    return () => clearInterval(iv);
  }, []);

  // Listen for external updates (from ShadowColosseum or MailInbox)
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.type === 'drop-log-update') {
        setHasNewDrops(!!e.detail.hasNew);
      }
      if (e.detail?.type === 'mail-update') {
        // Re-fetch mail count
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
    // If on shadow-colosseum, dispatch event to open modal
    if (location.pathname === '/shadow-colosseum') {
      window.dispatchEvent(new CustomEvent('beru-react', { detail: { type: 'open-drop-log' } }));
    } else {
      // Navigate to shadow-colosseum with drop-log flag
      navigate('/shadow-colosseum?droplog=1');
    }
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

        // Mail shortcut with unread badge
        if (shortcut.type === 'mail') {
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

              {/* Unread mail badge */}
              {unreadMailCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 flex items-center justify-center rounded-full bg-red-500 border-2 border-white text-white text-[10px] font-bold px-1 animate-pulse">
                  {unreadMailCount > 99 ? '99+' : unreadMailCount}
                </span>
              )}

              {/* Tooltip on hover */}
              <div className="absolute right-16 bg-black/90 text-white px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {shortcut.label}
                <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-black/90 rotate-45" />
              </div>
            </Link>
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
