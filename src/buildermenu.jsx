import React from 'react';
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
  X
} from 'lucide-react';

export default function BuilderMenu({ isOpen, onClose }) {
  const { t } = useTranslation();
  const location = useLocation();

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
        <nav className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-6">
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
                      `}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-purple-400' : ''}`} />
                      <span className="font-medium flex-1 truncate">{item.label}</span>

                      {/* Badge NEW */}
                      {item.isNew && (
                        <span className="text-[10px] font-bold bg-gradient-to-r from-pink-500 to-purple-500
                                       text-white px-2 py-0.5 rounded-full animate-pulse">
                          NEW
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
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-purple-500/20">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">BuilderBeru v2.4</p>
            <a
              href="https://discord.gg/m8RCuDz5"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              💬 Discord Community
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
