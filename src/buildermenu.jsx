import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Wrench,
  Palette,
  Calculator,
  Trophy,
  Flame,
  Hammer,
  Swords,
  Shield,
  Sparkles,
  Zap,
  BookOpen,
  Gamepad2,
  Mail,
  Target,
  X,
  LogIn,
  User,
  LogOut,
} from 'lucide-react';
import { isLoggedIn, getAuthUser, logout, authHeaders } from './utils/auth';
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
      const resp = await fetch('/api/mail?action=inbox&filter=unread&limit=1', {
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
    const iv = setInterval(fetchUnreadCount, 300000); // 5 min (was 120s — save transfer)
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
          label: t('home.menu.build'),
          icon: Wrench,
          color: 'blue'
        },
      ]
    },
    {
      title: t('menu.tools', 'Outils Créatifs'),
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
          label: t('home.menu.dpsCalculator'),
          icon: Calculator,
          color: 'orange',
          isNew: true
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
      title: t('menu.meta', 'Meta & Guides'),
      items: [
        {
          path: '/hall-of-flame',
          label: t('home.menu.hallOfFlame'),
          icon: Trophy,
          color: 'yellow',
          isSpecial: true
        },
        {
          path: '/bdg',
          label: t('home.menu.bdg'),
          icon: Shield,
          color: 'red'
        },
        {
          path: '/pod',
          label: t('home.menu.pod'),
          icon: Flame,
          color: 'violet'
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
      title: t('menu.worlds', 'Mondes'),
      items: [
        {
          path: '/beruvian-world',
          label: t('menu.beruvianWorld', 'Monde Beruvien'),
          icon: Sparkles,
          color: 'indigo'
        },
        {
          path: '/chibi-world',
          label: t('menu.chibiWorld', 'Monde Chibi'),
          icon: Swords,
          color: 'emerald'
        },
        {
          path: '/lorestory',
          label: 'LoreStory',
          icon: BookOpen,
          color: 'violet',
          isNew: true
        },
        {
          path: '/shadow-colosseum',
          label: 'Shadow Colosseum',
          icon: Gamepad2,
          color: 'red',
          isNew: true
        },
        {
          path: '/faction',
          label: 'Factions',
          icon: Shield,
          color: 'cyan',
          isNew: true
        },
        {
          path: '/training-dummy',
          label: 'Mannequin d\'Entraînement',
          icon: Target,
          color: 'orange',
          isNew: true
        },
        {
          path: '/mail',
          label: t('menu.mail', 'Courrier'),
          icon: Mail,
          color: 'amber',
          badge: unreadMailCount > 0 ? unreadMailCount : null,
          isSubItem: true
        },
        {
          path: '/codex',
          label: 'Codex',
          icon: BookOpen,
          color: 'amber',
          isNew: true
        },
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

  if (!isOpen) return null;

  return (
    <>
      <style jsx="true">{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes golden-pulse {
          0%, 100% {
            box-shadow: 0 0 15px rgba(255, 215, 0, 0.4), 0 0 25px rgba(255, 215, 0, 0.2);
          }
          50% {
            box-shadow: 0 0 25px rgba(255, 215, 0, 0.7), 0 0 35px rgba(255, 215, 0, 0.4);
          }
        }

        .menu-container {
          animation: slideIn 0.3s ease-out;
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

      <div
        className="menu-container fixed top-0 left-0 h-full w-72 md:w-80 bg-gradient-to-b from-[#1a1a2a] to-[#12121c]
                   shadow-2xl z-50 flex flex-col border-r border-purple-500/20"
      >
        {/* Header avec logo et bouton fermer */}
        <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600
                            flex items-center justify-center shadow-lg">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">BuilderBeru</h2>
              <p className="text-xs text-gray-400">Solo Leveling Tools</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Menu items avec scroll */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin p-4 flex flex-col justify-center">
          <div className="space-y-6">
          {menuSections.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              <h3 className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-3 px-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item, itemIdx) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  const colorClass = colorClasses[item.color] || colorClasses.purple;

                  return (
                    <Link
                      key={itemIdx}
                      to={item.path}
                      onClick={onClose}
                      className={`
                        group flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent
                        transition-all duration-200 relative overflow-hidden
                        ${isActive
                          ? 'bg-purple-600/20 border-purple-500/50 text-white'
                          : `text-gray-300 ${colorClass}`
                        }
                        ${item.isSpecial ? 'special-item border-yellow-500/30' : ''}
                        ${item.isSubItem ? 'ml-6 text-sm' : ''}
                      `}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isActive
                          ? 'bg-purple-600/30'
                          : 'bg-white/5 group-hover:bg-white/10'
                      } transition-all`}>
                        <Icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : ''}`} />
                      </div>
                      <span className="font-medium flex-1 truncate">{item.label}</span>

                      {/* Badge NEW */}
                      {item.isNew && (
                        <span className="text-[10px] font-bold bg-gradient-to-r from-pink-500 to-purple-500
                                       text-white px-2 py-0.5 rounded-full animate-pulse">
                          NEW
                        </span>
                      )}

                      {/* Badge notification pour mails non lus */}
                      {item.badge && (
                        <span className="text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-500
                                       text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}

                      {/* Badge spécial pour Hall of Flame */}
                      {item.isSpecial && (
                        <Trophy className="w-4 h-4 text-yellow-400" />
                      )}

                      {/* Hover effect */}
                      {!isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent
                                      translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-purple-500/20 space-y-3">
          {/* Auth section */}
          {authState.loggedIn ? (
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 min-w-0">
                <User className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-xs text-white font-bold truncate max-w-[140px]">
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
              className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600/30 to-indigo-600/30
                         text-sm text-purple-300 font-medium
                         hover:from-purple-500/40 hover:to-indigo-500/40
                         transition-all border border-purple-500/20
                         flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Se connecter
            </button>
          )}

          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">BuilderBeru v2.4</p>
            <a
              href="https://discord.gg/m8RCuDz5"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Discord Community
            </a>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => {
        setShowAuthModal(false);
        // Re-check auth state when modal closes (login may have just succeeded)
        setAuthState({ loggedIn: isLoggedIn(), user: getAuthUser() });
      }} />
    </>
  );
}
