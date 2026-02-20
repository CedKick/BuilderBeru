// src/pages/MailInbox.jsx
// Complete inbox component with filters, expand/collapse, rewards claiming, and delete functionality

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Inbox, Gift, Trash2, ChevronDown, ChevronUp, Check, X, ArrowLeft } from 'lucide-react';
import { isLoggedIn, authHeaders, getAuthUser } from '../utils/auth';
import shadowCoinManager from '../components/ChibiSystem/ShadowCoinManager';
import { WEAPONS } from './ShadowColosseum/equipmentData';

const MAIL_TYPES = {
  admin: { label: 'Admin', color: 'bg-red-500', icon: '\uD83D\uDEE1\uFE0F' },
  system: { label: 'Systeme', color: 'bg-blue-500', icon: '\u2699\uFE0F' },
  update: { label: 'Mise a jour', color: 'bg-green-500', icon: '\uD83C\uDF1F' },
  reward: { label: 'Recompense', color: 'bg-yellow-500', icon: '\uD83C\uDFC6' },
  personal: { label: 'Personnel', color: 'bg-purple-500', icon: '\uD83D\uDC8C' },
  faction: { label: 'Faction', color: 'bg-orange-500', icon: '\u2694\uFE0F' },
};

export default function MailInbox() {
  const navigate = useNavigate();
  const [mails, setMails] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // all, unread, rewards
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claimingId, setClaimingId] = useState(null);

  // Auth check
  useEffect(() => {
    if (!isLoggedIn()) {
      alert('Vous devez etre connecte pour acceder au courrier');
      navigate('/');
      return;
    }
  }, [navigate]);

  // Fetch mail on mount and filter change
  useEffect(() => {
    if (!isLoggedIn()) return;
    fetchMail();
  }, [filter]);

  const fetchMail = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/mail?action=inbox&filter=${filter}&limit=100`, {
        headers: authHeaders(),
      });
      const data = await resp.json();

      if (data.success) {
        setMails(data.mail || []);
        setUnreadCount(data.unreadCount || 0);
      } else {
        setError(data.message || 'Erreur lors du chargement du courrier');
      }
    } catch (err) {
      console.error('Failed to fetch mail:', err);
      setError('Impossible de charger le courrier. Verifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (mailId, isRead) => {
    const newExpanded = new Set(expandedIds);

    if (expandedIds.has(mailId)) {
      newExpanded.delete(mailId);
    } else {
      newExpanded.add(mailId);

      // Auto mark-as-read when expanding unread mail
      if (!isRead) {
        markAsRead(mailId);
      }
    }

    setExpandedIds(newExpanded);
  };

  const markAsRead = async (mailId) => {
    try {
      const resp = await fetch('/api/mail?action=mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ mailId }),
      });

      const data = await resp.json();
      if (data.success) {
        // Update local state
        setMails(prev => prev.map(m =>
          m.id === mailId ? { ...m, read: true } : m
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));

        // Notify sidebar to update badge
        window.dispatchEvent(new CustomEvent('beru-react', {
          detail: { type: 'mail-update' }
        }));
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const applyRewardsToLocalStorage = (rewards) => {
    const SAVE_KEY = 'shadow_colosseum_data';
    let data = JSON.parse(localStorage.getItem(SAVE_KEY) || '{"weaponCollection":{},"hammers":{}}');

    // Weapons (quantity → awakening progression + A10 → 5 Red Hammers)
    if (rewards.weapons && Array.isArray(rewards.weapons)) {
      if (!data.weaponCollection) data.weaponCollection = {};
      if (!data.hammers) data.hammers = {};

      rewards.weapons.forEach(w => {
        const quantity = w.quantity || 1;

        // Apply each copy one by one
        for (let i = 0; i < quantity; i++) {
          const currentAwakening = data.weaponCollection[w.id] || 0;

          if (currentAwakening >= 10) {
            // Already A10 → convert to 5 red hammers per copy
            data.hammers.marteau_rouge = (data.hammers.marteau_rouge || 0) + 5;
          } else {
            // Increment awakening by 1
            data.weaponCollection[w.id] = currentAwakening + 1;
          }
        }
      });
    }

    // Hammers
    if (rewards.hammers && typeof rewards.hammers === 'object') {
      if (!data.hammers) data.hammers = {};
      Object.entries(rewards.hammers).forEach(([type, amt]) => {
        data.hammers[type] = (data.hammers[type] || 0) + amt;
      });
    }

    // Coins
    if (rewards.coins && typeof rewards.coins === 'number') {
      shadowCoinManager.addCoins(rewards.coins, 'mail-reward');
    }

    localStorage.setItem(SAVE_KEY, JSON.stringify(data));

    // Dispatch update event
    window.dispatchEvent(new CustomEvent('beru-react', {
      detail: { type: 'shadow-data-update' }
    }));
  };

  const claimRewards = async (mailId, rewards) => {
    setClaimingId(mailId);
    try {
      const resp = await fetch('/api/mail?action=claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ mailId }),
      });

      const data = await resp.json();
      if (data.success) {
        // Apply rewards to localStorage
        applyRewardsToLocalStorage(rewards);

        // Update local state
        setMails(prev => prev.map(m =>
          m.id === mailId ? { ...m, claimed: true } : m
        ));

        // Build detailed success message
        const SAVE_KEY = 'shadow_colosseum_data';
        let data = JSON.parse(localStorage.getItem(SAVE_KEY) || '{"weaponCollection":{},"hammers":{}}');
        let message = '\u2705 Recompenses reclamees avec succes !\n\nVous avez recu :\n';

        if (rewards.weapons && rewards.weapons.length > 0) {
          message += '\n\uD83D\uDDE1\uFE0F ARMES :\n';
          rewards.weapons.forEach(w => {
            const weaponName = getWeaponName(w.id);
            const quantity = w.quantity || 1;
            const finalAwakening = data.weaponCollection[w.id];

            if (finalAwakening === 10 || finalAwakening === undefined) {
              // If A10, some copies became red hammers
              const redHammersGained = quantity * 5;
              if (quantity > 1) {
                message += `  • ${weaponName} x${quantity} → A${finalAwakening || 10} (+${redHammersGained} \uD83D\uDD28 Marteaux Rouges)\n`;
              } else {
                message += `  • ${weaponName} → A${finalAwakening || 10}\n`;
              }
            } else {
              // Normal awakening progression
              message += `  • ${weaponName} → A${finalAwakening} (${quantity > 1 ? `+${quantity} awakening` : '+1 awakening'})\n`;
            }
          });
        }

        if (rewards.hammers && Object.keys(rewards.hammers).length > 0) {
          message += '\n\uD83D\uDD28 MARTEAUX :\n';
          Object.entries(rewards.hammers).forEach(([type, amt]) => {
            const hammerName = type.replace('marteau_', '').replace('_', ' ');
            message += `  • ${hammerName}: ${amt}\n`;
          });
        }

        if (rewards.coins) {
          message += `\n\uD83E\uDE99 ${rewards.coins} Shadow Coins\n`;
        }

        message += '\n\u27A1\uFE0F Rendez-vous dans Shadow Colosseum pour utiliser vos nouvelles armes !';

        alert(message);
      } else {
        alert('\u274C ' + (data.message || 'Erreur lors de la reclamation'));
      }
    } catch (err) {
      console.error('Failed to claim rewards:', err);
      alert('\u274C Impossible de reclamer les recompenses. Verifiez votre connexion.');
    } finally {
      setClaimingId(null);
    }
  };

  const deleteMail = async (mailId, recipientUsername) => {
    // Can only delete personal mail
    if (!recipientUsername) {
      alert('\u274C Impossible de supprimer les messages diffuses');
      return;
    }

    if (!confirm('Etes-vous sur de vouloir supprimer ce message ?')) {
      return;
    }

    try {
      const resp = await fetch('/api/mail?action=delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ mailId }),
      });

      const data = await resp.json();
      if (data.success) {
        // Remove from local state
        setMails(prev => prev.filter(m => m.id !== mailId));
        alert('\u2705 Message supprime');
      } else {
        alert('\u274C ' + (data.message || 'Erreur lors de la suppression'));
      }
    } catch (err) {
      console.error('Failed to delete mail:', err);
      alert('\u274C Impossible de supprimer le message. Verifiez votre connexion.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'A l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;

    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  const getWeaponName = (weaponId) => {
    return WEAPONS[weaponId]?.name || weaponId;
  };

  const renderRewardsPreview = (rewards) => {
    if (!rewards) return null;

    const items = [];

    if (rewards.weapons && rewards.weapons.length > 0) {
      const totalWeapons = rewards.weapons.reduce((sum, w) => sum + (w.quantity || 1), 0);
      items.push(
        <span key="weapons" className="text-amber-400">
          \uD83D\uDDE1\uFE0F {totalWeapons} exemplaire{totalWeapons > 1 ? 's' : ''}
        </span>
      );
    }

    if (rewards.hammers && Object.keys(rewards.hammers).length > 0) {
      const totalHammers = Object.values(rewards.hammers).reduce((sum, val) => sum + val, 0);
      items.push(
        <span key="hammers" className="text-blue-400">
          \uD83D\uDD28 {totalHammers} marteau{totalHammers > 1 ? 'x' : ''}
        </span>
      );
    }

    if (rewards.coins) {
      items.push(
        <span key="coins" className="text-purple-400">
          \uD83E\uDE99 {rewards.coins} coins
        </span>
      );
    }

    return items.length > 0 ? (
      <div className="flex items-center gap-2 text-xs">
        {items.map((item, i) => (
          <span key={i}>{item}</span>
        ))}
      </div>
    ) : null;
  };

  const renderRewardsDetail = (rewards) => {
    if (!rewards) return null;

    return (
      <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <h4 className="text-sm font-bold text-yellow-400 mb-2 flex items-center gap-2">
          <Gift size={16} />
          Recompenses
        </h4>

        <div className="space-y-2 text-sm">
          {rewards.weapons && rewards.weapons.length > 0 && (
            <div>
              <div className="text-gray-400 mb-1">Armes:</div>
              <ul className="list-disc list-inside text-amber-300 space-y-0.5">
                {rewards.weapons.map((w, i) => (
                  <li key={i}>
                    {getWeaponName(w.id)}
                    {w.quantity > 1 ? (
                      <span className="text-xs text-amber-500"> x{w.quantity} exemplaires (+{w.quantity} awakening)</span>
                    ) : (
                      <span className="text-xs text-gray-400"> (1 exemplaire)</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {rewards.hammers && Object.keys(rewards.hammers).length > 0 && (
            <div>
              <div className="text-gray-400 mb-1">Marteaux:</div>
              <ul className="list-disc list-inside text-blue-300 space-y-0.5">
                {Object.entries(rewards.hammers).map(([type, amt]) => (
                  <li key={type}>
                    {type.replace('marteau_', '').replace('_', ' ')}: {amt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {rewards.coins && (
            <div>
              <div className="text-gray-400 mb-1">Shadow Coins:</div>
              <div className="text-purple-300 font-bold">{rewards.coins} \uD83E\uDE99</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isLoggedIn()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => navigate('/shadow-colosseum')}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-lg transition-all group"
              title="Retour au Shadow Colosseum"
            >
              <ArrowLeft size={18} className="group-hover:text-purple-400 transition-colors" />
              <span className="text-sm text-gray-400 group-hover:text-purple-300 transition-colors">Shadow Colosseum</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 flex items-center gap-3">
            <Mail size={32} />
            Courrier
          </h1>
          <p className="text-gray-400 mt-2">
            {unreadCount > 0 ? (
              <span className="text-amber-400 font-semibold">{unreadCount} message{unreadCount > 1 ? 's' : ''} non lu{unreadCount > 1 ? 's' : ''}</span>
            ) : (
              <span>Tous vos messages sont lus</span>
            )}
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'all'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Inbox size={16} className="inline mr-2" />
            Tous
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'unread'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Mail size={16} className="inline mr-2" />
            Non lus
            {unreadCount > 0 && (
              <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter('rewards')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'rewards'
                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Gift size={16} className="inline mr-2" />
            Recompenses
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            <p className="text-gray-400 mt-4">Chargement...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-400">
              <X size={20} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Mail List */}
        {!loading && !error && (
          <div className="space-y-3">
            {mails.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
                <Inbox size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">
                  {filter === 'unread' && 'Aucun message non lu'}
                  {filter === 'rewards' && 'Aucun message avec recompenses'}
                  {filter === 'all' && 'Aucun message'}
                </p>
              </div>
            ) : (
              mails.map((mail) => {
                const isExpanded = expandedIds.has(mail.id);
                const mailTypeInfo = MAIL_TYPES[mail.mailType] || MAIL_TYPES.system;
                const hasRewards = mail.rewards && (
                  (mail.rewards.weapons && mail.rewards.weapons.length > 0) ||
                  (mail.rewards.hammers && Object.keys(mail.rewards.hammers).length > 0) ||
                  mail.rewards.coins
                );

                return (
                  <div
                    key={mail.id}
                    className={`bg-white/5 rounded-lg border transition-all ${
                      !mail.read
                        ? 'border-amber-500/50 bg-amber-500/5'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Mail Header */}
                    <div
                      onClick={() => toggleExpand(mail.id, mail.read)}
                      className="p-4 cursor-pointer flex items-start gap-3"
                    >
                      {/* Icon */}
                      <div className={`mt-1 ${mailTypeInfo.color} rounded-full p-2 text-white flex-shrink-0`}>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Subject and badges */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-white truncate">
                            {mail.subject}
                          </h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${mailTypeInfo.color} text-white font-bold`}>
                            {mailTypeInfo.icon} {mailTypeInfo.label}
                          </span>
                          {!mail.read && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500 text-white font-bold">
                              NOUVEAU
                            </span>
                          )}
                          {hasRewards && !mail.claimed && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500 text-white font-bold">
                              \uD83C\uDF81 CADEAU
                            </span>
                          )}
                        </div>

                        {/* Sender and date */}
                        <div className="text-xs text-gray-400 mb-2">
                          De: {mail.sender || 'system'} • {formatDate(mail.createdAt)}
                          {!mail.recipientUsername && (
                            <span className="ml-2 text-purple-400">[\u2733 Diffusion]</span>
                          )}
                        </div>

                        {/* Rewards preview */}
                        {!isExpanded && hasRewards && renderRewardsPreview(mail.rewards)}
                      </div>

                      {/* Delete button */}
                      {mail.recipientUsername && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMail(mail.id, mail.recipientUsername);
                          }}
                          className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded transition-colors flex-shrink-0"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-white/10 pt-4">
                        {/* Message */}
                        <div className="prose prose-invert max-w-none mb-4">
                          <p className="text-gray-300 whitespace-pre-wrap">
                            {mail.message}
                          </p>
                        </div>

                        {/* Rewards detail */}
                        {hasRewards && (
                          <>
                            {renderRewardsDetail(mail.rewards)}

                            {/* Claim button */}
                            {!mail.claimed ? (
                              <button
                                onClick={() => claimRewards(mail.id, mail.rewards)}
                                disabled={claimingId === mail.id}
                                className="mt-3 w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                              >
                                {claimingId === mail.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Reclamation...
                                  </>
                                ) : (
                                  <>
                                    <Gift size={20} />
                                    Reclamer les recompenses
                                  </>
                                )}
                              </button>
                            ) : (
                              <div className="mt-3 w-full bg-green-500/20 border border-green-500/30 text-green-400 font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2">
                                <Check size={20} />
                                Recompenses reclamees
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
