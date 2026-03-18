import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Wrench,
  Palette,
  Calculator,
  Trophy,
  Hammer,
  Swords,
  Shield,
  Zap,
  Gamepad2,
  Mail,
  X,
  LogIn,
  User,
  LogOut,
} from 'lucide-react';
import { isLoggedIn, getAuthUser, logout, authHeaders } from './utils/auth';
import { API_URL } from './utils/api.js';
import AuthModal from './components/AuthModal';

export default function BuilderMenu({ isOpen, onClose }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authState, setAuthState] = useState(() => ({ loggedIn: isLoggedIn(), user: getAuthUser() }));
  const [unreadMailCount, setUnreadMailCount] = useState(0);

  // Re-check auth state every time sidebar opens
  useEffect(() => {
    if (isOpen) {
      setAuthState({ loggedIn: isLoggedIn(), user: getAuthUser() });
    }
  }, [isOpen]);

  // Listen for auth-change events
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.type === 'auth-change') {
        setAuthState({ loggedIn: isLoggedIn(), user: getAuthUser() });
      }
    };
    window.addEventListener('beru-react', handler);
    return () => window.removeEventListener('beru-react', handler);
  }, []);

  // Fetch unread mail count
  const fetchUnreadCount = async () => {
    if (!isLoggedIn()) return;
    try {
      const resp = await fetch(`${API_URL}/mail?action=inbox&filter=unread&limit=1`, {
        headers: authHeaders()
      });
      const data = await resp.json();
      if (data.success) setUnreadMailCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch unread mail count:', err);
    }
  };

  // Fetch unread count when sidebar opens and auth changes
  useEffect(() => {
    if (isOpen && authState.loggedIn) fetchUnreadCount();
  }, [isOpen, authState.loggedIn]);

  // Poll for new mail every 2 minutes
  useEffect(() => {
    if (!authState.loggedIn) return;
    fetchUnreadCount();
    const iv = setInterval(fetchUnreadCount, 900000); // 15 min (was 5 min — save network)
    return () => clearInterval(iv);
  }, [authState.loggedIn]);

  // Listen for mail-update events
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.type === 'mail-update') fetchUnreadCount();
    };
    window.addEventListener('beru-react', handler);
    return () => window.removeEventListener('beru-react', handler);
  }, []);

  const menuSections = [
    {
      title: t('menu.navigation', 'Navigation'),
      items: [
        {
          path: '/',
          label: t('home.menu.home', 'Accueil'),
          icon: Home,
          color: 'purple'
        },
        {
          path: '/build',
          label: 'Build',
          icon: Wrench,
          color: 'blue'
        },
      ]
    },
    {
      title: t('menu.tools', 'Outils'),
      items: [
        {
          path: '/drawberu',
          label: t('home.menu.drawBeru'),
          icon: Palette,
          color: 'pink',
          isNew: true
        },
        {
          path: '/damage-calculator',
          label: 'Calculateur DPS',
          icon: Calculator,
          color: 'orange',
          subtitle: 'Non mis à jour depuis mai 2025'
        },
        {
          path: '/craft-simulator',
          label: t('home.menu.craftSimulator', 'Craft Simulator'),
          icon: Hammer,
          color: 'amber'
        },
      ]
    },
    {
      title: 'Meta & Guides',
      items: [
        {
          path: '/hall-of-flame',
          label: t('home.menu.hallOfFlame'),
          icon: Trophy,
          color: 'yellow',
          isSpecial: true
        },
        {
          path: '/theorycraft',
          label: 'Theorycraft',
          icon: Zap,
          color: 'blue',
          isNew: true
        },
      ]
    },
    {
      title: 'Gaming',
      items: [
        {
          path: '/shadow-colosseum',
          label: 'Shadow Colosseum',
          icon: Gamepad2,
          color: 'red',
          isNew: true
        },
        ...(authState.loggedIn ? [
          {
            path: '/faction',
            label: 'Factions',
            icon: Shield,
            color: 'cyan',
            isSubItem: true
          },
          {
            path: '/expedition',
            label: 'Expedition I',
            icon: Swords,
            color: 'amber',
            isSubItem: true
          },
          {
            path: '/mail',
            label: t('menu.mail', 'Courrier'),
            icon: Mail,
            color: 'amber',
            badge: unreadMailCount > 0 ? unreadMailCount : null,
            isSubItem: true
          },
        ] : []),
      ]
    }
  ];

  const colorClasses = {
    purple: 'text-purple-400 hover:bg-purple-900/30 hover:border-purple-500',
    blue: 'text-blue-400 hover:bg-blue-900/30 hover:border-blue-500',
    pink: 'text-pink-400 hover:bg-pink-900/30 hover:border-pink-500',
    orange: 'text-orange-400 hover:bg-orange-900/30 hover:border-orange-500',
    amber: 'text-amber-400 hover:bg-amber-900/30 hover:border-amber-500',
    yellow: 'text-yellow-400 hover:bg-yellow-900/30 hover:border-yellow-500',
    red: 'text-red-400 hover:bg-red-900/30 hover:border-red-500',
    violet: 'text-violet-400 hover:bg-violet-900/30 hover:border-violet-500',
    indigo: 'text-indigo-400 hover:bg-indigo-900/30 hover:border-indigo-500',
    emerald: 'text-emerald-400 hover:bg-emerald-900/30 hover:border-emerald-500',
  };

  return (
    <>
      <style jsx="true">{`
        @keyframes golden-pulse {
          0%, 100% {
            box-shadow: 0 0 15px rgba(255, 215, 0, 0.4), 0 0 25px rgba(255, 215, 0, 0.2);
          }
          50% {
            box-shadow: 0 0 25px rgba(255, 215, 0, 0.7), 0 0 35px rgba(255, 215, 0, 0.4);
          }
        }

        .special-item {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
          animation: golden-pulse 2s infinite;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.5);
          border-radius: 4px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.7);
        }
      `}</style>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar — fixed, always visible on lg+, slide-in on mobile */}
      <nav
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col
                    bg-gradient-to-b from-[#1a1a2a] to-[#12121c]
                    border-r border-purple-500/20 transition-transform duration-200 transform-gpu
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
          <Link to="/" onClick={onClose} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600
                            flex items-center justify-center shadow-lg">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">BuilderBeru</h2>
              <p className="text-[10px] text-gray-400">Solo Leveling Tools</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Menu items */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
          <div className="space-y-5">
          {menuSections.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              <h3 className="text-[10px] font-semibold text-purple-300 uppercase tracking-wider mb-2 px-2">
                {section.title}
              </h3>
              <div className="space-y-0.5">
                {section.items.map((item, itemIdx) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={itemIdx}
                      to={item.path}
                      onClick={onClose}
                      className={`
                        group flex items-center gap-3 px-3 py-2 rounded-md
                        transition-colors duration-200
                        ${isActive
                          ? 'bg-purple-600/20 text-purple-400'
                          : 'text-gray-300 hover:bg-white/5'
                        }
                        ${item.isSpecial ? 'special-item' : ''}
                        ${item.isSubItem ? 'ml-4 text-sm' : ''}
                      `}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-purple-400' : ''}`} />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium truncate text-sm block">{item.label}</span>
                        {item.subtitle && (
                          <span className="text-[9px] text-amber-400/70 block truncate">{item.subtitle}</span>
                        )}
                      </div>

                      {item.isNew && (
                        <span className="text-[9px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded-full">
                          NEW
                        </span>
                      )}

                      {item.badge && (
                        <span className="text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}

                      {item.isSpecial && (
                        <Trophy className="w-4 h-4 text-yellow-400" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-purple-500/20 space-y-2">
          {authState.loggedIn ? (
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 min-w-0">
                <User className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-xs text-white font-bold truncate max-w-[120px]">
                  {authState.user?.username || '...'}
                </span>
              </div>
              <button
                onClick={() => { logout(); setAuthState({ loggedIn: false, user: null }); }}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
              >
                <LogOut className="w-3 h-3" />
                Quitter
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full py-2 rounded-lg bg-purple-600/20 text-sm text-purple-300 font-medium
                         hover:bg-purple-600/30 transition-all border border-purple-500/20
                         flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Se connecter
            </button>
          )}

          <div className="text-center">
            <p className="text-[10px] text-gray-500 mb-0.5">BuilderBeru v2.4</p>
            <a
              href="https://discord.gg/m8RCuDz5"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors"
            >
              Discord Community
            </a>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => {
        setShowAuthModal(false);
        setAuthState({ loggedIn: isLoggedIn(), user: getAuthUser() });
      }} />
    </>
  );
}
