// src/pages/MailInbox.jsx
// Complete inbox component with filters, expand/collapse, rewards claiming, and delete functionality

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Inbox, Gift, Trash2, ChevronDown, ChevronUp, Check, X, ArrowLeft, MessageCircle, Send } from 'lucide-react';
import { isLoggedIn, authHeaders, getAuthUser } from '../utils/auth';
import { cloudStorage } from '../utils/CloudStorage';
import shadowCoinManager from '../components/ChibiSystem/ShadowCoinManager';
import { WEAPONS } from './ShadowColosseum/equipmentData';
import { HUNTERS } from './ShadowColosseum/raidData';

const MAIL_TYPES = {
  admin: { label: 'Admin', color: 'bg-red-500', icon: '\uD83D\uDEE1\uFE0F' },
  system: { label: 'Systeme', color: 'bg-blue-500', icon: '\u2699\uFE0F' },
  update: { label: 'Mise a jour', color: 'bg-green-500', icon: '\uD83C\uDF1F' },
  reward: { label: 'Recompense', color: 'bg-yellow-500', icon: '\uD83C\uDFC6' },
  personal: { label: 'Personnel', color: 'bg-purple-500', icon: '\uD83D\uDC8C' },
  faction: { label: 'Faction', color: 'bg-orange-500', icon: '\u2694\uFE0F' },
  support: { label: 'Support', color: 'bg-pink-500', icon: '\uD83D\uDCE8' },
};

// ── Béru Chibi Dissuasion System ──
const BERU_SPRITE = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414699/beru_face_w2rdyn.png';

const BERU_DISSUASION_LINES = [
  // Phase 1 — Gentle
  { text: "Hey, tu fais quoi la...?", sprite: 'idle', shake: false },
  { text: "Non non non, fais pas ca !", sprite: 'idle', shake: false },
  { text: "Le Monarque est TRES occupe tu sais...", sprite: 'idle', shake: false },
  { text: "Il est en train de manger des tacos la, derange pas !", sprite: 'idle', shake: true },
  // Phase 2 — Threatening
  { text: "Tu sais ce qui arrive a ceux qui derangent le Monarque ?", sprite: 'angry', shake: true },
  { text: "Il va baisser tes taux de drop a 0.001%...", sprite: 'angry', shake: true },
  { text: "Ton prochain SSR sera dans 847 pulls, t'es prevenu.", sprite: 'angry', shake: false },
  { text: "Moi j'ai essaye une fois... il m'a transforme en mob de tutoriel.", sprite: 'idle', shake: false },
  // Phase 3 — Desperate
  { text: "OK STOP. Je te donne un taco si tu fermes ce formulaire.", sprite: 'angry', shake: true },
  { text: "Tu veux VRAIMENT que tes artefacts roll que du flat DEF ??", sprite: 'angry', shake: true },
  { text: "PITIE, je serai ton ami, lache ce clavier !", sprite: 'idle', shake: true },
  { text: "Le dernier joueur qui a envoye un ticket... on l'a jamais revu.", sprite: 'angry', shake: false },
  // Phase 4 — Panic
  { text: "BON OK. Si t'insistes, je vais pas pouvoir t'empecher...", sprite: 'idle', shake: false },
  { text: "...mais sache que j'ai fait pipi dans ton cafe ce matin.", sprite: 'angry', shake: true },
  { text: "T'auras meme plus de tacos au self du donjon.", sprite: 'angry', shake: true },
  { text: "Tout ca pour un ticket support... quelle tragedie.", sprite: 'idle', shake: false },
];

function BeruChibiDissuasion({ containerRef }) {
  const [lineIndex, setLineIndex] = useState(0);
  const [beruPos, setBeruPos] = useState({ x: 50, y: 80 });
  const [targetPos, setTargetPos] = useState({ x: 50, y: 80 });
  const [isChasing, setIsChasing] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [facingRight, setFacingRight] = useState(true);
  const animRef = useRef(null);
  const lineTimerRef = useRef(null);

  // Cycle through dissuasion lines
  useEffect(() => {
    lineTimerRef.current = setInterval(() => {
      setLineIndex(prev => {
        const next = prev + 1;
        if (next >= BERU_DISSUASION_LINES.length) return 0;
        return next;
      });
      setShowBubble(true);
    }, 4000);
    return () => clearInterval(lineTimerRef.current);
  }, []);

  // Track mouse within the modal container
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setTargetPos({ x: Math.max(5, Math.min(85, x)), y: Math.max(5, Math.min(85, y)) });
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, [containerRef, handleMouseMove]);

  // Start chasing mouse after line 4
  useEffect(() => {
    if (lineIndex >= 4) setIsChasing(true);
  }, [lineIndex]);

  // Smooth follow animation
  useEffect(() => {
    if (!isChasing) return;
    const animate = () => {
      setBeruPos(prev => {
        const dx = targetPos.x - prev.x;
        const dy = targetPos.y - prev.y;
        if (dx > 2) setFacingRight(true);
        else if (dx < -2) setFacingRight(false);
        return {
          x: prev.x + dx * 0.06,
          y: prev.y + dy * 0.06,
        };
      });
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isChasing, targetPos]);

  const currentLine = BERU_DISSUASION_LINES[lineIndex];
  const isAngry = currentLine.sprite === 'angry';

  return (
    <div
      className="absolute pointer-events-none z-10"
      style={{
        left: `${beruPos.x}%`,
        top: `${beruPos.y}%`,
        transform: 'translate(-50%, -50%)',
        transition: isChasing ? 'none' : 'left 0.8s ease, top 0.8s ease',
      }}
    >
      {/* Speech bubble */}
      {showBubble && (
        <div
          className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white text-gray-900 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shadow-lg border-2 border-purple-400"
          style={{ animation: 'beruBubblePop 0.3s ease-out' }}
        >
          {currentLine.text}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-purple-400 rotate-45" />
        </div>
      )}

      {/* Béru sprite */}
      <img loading="lazy"
        src={BERU_SPRITE}
        alt="Béru"
        className="w-14 h-14 md:w-[72px] md:h-[72px] object-contain"
        style={{
          animation: currentLine.shake ? 'beruShake 0.3s infinite' : (isChasing ? 'beruBounce 0.5s infinite' : 'beruFloat 2s ease-in-out infinite'),
          imageRendering: 'auto',
          filter: isAngry
            ? 'saturate(1.5) brightness(1.15) drop-shadow(0 0 8px rgba(255,50,50,0.6))'
            : 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.5))',
          transform: `scaleX(${facingRight ? 1 : -1})`,
        }}
        draggable={false}
      />
    </div>
  );
}

export default function MailInbox() {
  const navigate = useNavigate();
  const [mails, setMails] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // all, unread, rewards
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claimingId, setClaimingId] = useState(null);

  // Support contact form
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSending, setSupportSending] = useState(false);
  const [supportError, setSupportError] = useState(null);
  const [supportSuccess, setSupportSuccess] = useState(null);
  const supportModalRef = useRef(null);

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

  const applyRewardsToLocalStorage = async (rewards) => {
    const SAVE_KEY = 'shadow_colosseum_data';
    const RAID_KEY = 'shadow_colosseum_raid';

    // Load freshest data: pendingData > localStorage > cloud (fixes weapon upgrade bug when localStorage is stale/empty)
    let data = await cloudStorage.loadFresh(SAVE_KEY) || {};
    if (!data.weaponCollection) data.weaponCollection = {};
    if (!data.hammers) data.hammers = {};
    if (!data.fragments) data.fragments = {};

    // Weapons (quantity → awakening progression + A10 → 5 Red Hammers)
    if (rewards.weapons && Array.isArray(rewards.weapons)) {
      rewards.weapons.forEach(w => {
        const quantity = w.quantity || 1;

        // Apply each copy one by one
        for (let i = 0; i < quantity; i++) {
          if (data.weaponCollection[w.id] === undefined) {
            // First time: add weapon at A0
            data.weaponCollection[w.id] = 0;
          } else if (data.weaponCollection[w.id] >= 10) {
            // Already A10 → convert to 5 red hammers per copy
            data.hammers.marteau_rouge = (data.hammers.marteau_rouge || 0) + 5;
          } else {
            // Duplicate: increment awakening by 1
            data.weaponCollection[w.id] += 1;
          }
        }
      });
    }

    // Hammers
    if (rewards.hammers && typeof rewards.hammers === 'object') {
      Object.entries(rewards.hammers).forEach(([type, amt]) => {
        data.hammers[type] = (data.hammers[type] || 0) + amt;
      });
    }

    // Fragments
    if (rewards.fragments && typeof rewards.fragments === 'object') {
      Object.entries(rewards.fragments).forEach(([fragId, amt]) => {
        data.fragments[fragId] = (data.fragments[fragId] || 0) + amt;
      });
    }

    // Hunters (add to raid collection or increase stars)
    if (rewards.hunters && Array.isArray(rewards.hunters)) {
      let raidData = await cloudStorage.loadFresh(RAID_KEY) || {};
      if (!raidData.hunterCollection) raidData.hunterCollection = [];

      rewards.hunters.forEach(h => {
        const existing = raidData.hunterCollection.find(c => c.id === h.id);
        if (existing) {
          existing.stars = (existing.stars || 0) + (h.stars || 0);
        } else {
          raidData.hunterCollection.push({ id: h.id, stars: h.stars || 0 });
        }
      });

      await cloudStorage.saveAndSync(RAID_KEY, raidData);
    }

    // Coins
    if (rewards.coins && typeof rewards.coins === 'number') {
      shadowCoinManager.addCoins(rewards.coins, 'mail-reward');
    }

    // Force immediate sync (no debounce) — ensures cloud has A3 BEFORE user navigates to ShadowColosseum
    await cloudStorage.saveAndSync(SAVE_KEY, data);

    // Dispatch update event
    window.dispatchEvent(new CustomEvent('beru-react', {
      detail: { type: 'shadow-data-update' }
    }));

    return data; // Return final data for success message
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

      const result = await resp.json();
      if (result.success) {
        // Apply rewards (async — loads freshest data from cloud/localStorage)
        const finalData = await applyRewardsToLocalStorage(rewards);

        // Update local state
        setMails(prev => prev.map(m =>
          m.id === mailId ? { ...m, claimed: true } : m
        ));

        // Build detailed success message using the final data (not stale localStorage)
        let message = '\u2705 Recompenses reclamees avec succes !\n\nVous avez recu :\n';

        if (rewards.weapons && rewards.weapons.length > 0) {
          message += '\n\uD83D\uDDE1\uFE0F ARMES :\n';
          rewards.weapons.forEach(w => {
            const weaponName = getWeaponName(w.id);
            const quantity = w.quantity || 1;
            const finalAwakening = finalData.weaponCollection[w.id];

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

        if (rewards.fragments && Object.keys(rewards.fragments).length > 0) {
          message += '\n🧩 FRAGMENTS :\n';
          Object.entries(rewards.fragments).forEach(([fragId, amt]) => {
            const frag = FRAGMENT_NAMES[fragId];
            message += `  • ${frag ? `${frag.icon} ${frag.name}` : fragId}: ${amt}\n`;
          });
        }

        if (rewards.hunters && rewards.hunters.length > 0) {
          message += '\n\uD83E\uDDB8 HUNTERS :\n';
          rewards.hunters.forEach(h => {
            const hunterName = HUNTERS[h.id]?.name || h.id;
            message += `  \u2022 ${hunterName} ${h.stars}★\n`;
          });
        }

        if (rewards.coins) {
          message += `\n\uD83E\uDE99 ${rewards.coins} Shadow Coins\n`;
        }

        message += '\n\u27A1\uFE0F Rendez-vous dans Shadow Colosseum pour utiliser vos nouvelles recompenses !';

        alert(message);
      } else {
        alert('\u274C ' + (result.message || 'Erreur lors de la reclamation'));
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

  const sendSupportMessage = async () => {
    if (!supportSubject.trim() || !supportMessage.trim()) {
      setSupportError('Sujet et message requis');
      return;
    }

    setSupportSending(true);
    setSupportError(null);
    setSupportSuccess(null);

    try {
      const resp = await fetch('/api/mail?action=contact-support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({
          subject: supportSubject.trim(),
          message: supportMessage.trim(),
        }),
      });

      const data = await resp.json();
      if (data.success) {
        setSupportSuccess('Message envoye au support !');
        setSupportSubject('');
        setSupportMessage('');
        setTimeout(() => {
          setShowSupportForm(false);
          setSupportSuccess(null);
        }, 2000);
      } else {
        setSupportError(data.error || 'Erreur lors de l\'envoi');
      }
    } catch (err) {
      console.error('Support message failed:', err);
      setSupportError('Impossible d\'envoyer. Verifiez votre connexion.');
    } finally {
      setSupportSending(false);
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

  const FRAGMENT_NAMES = {
    fragment_sulfuras: { name: 'Fragment de Sulfuras', icon: '🔥' },
    fragment_raeshalare: { name: "Fragment de Rae'shalare", icon: '🌀' },
    fragment_katana_z: { name: 'Fragment de Katana Z', icon: '⚡' },
    fragment_katana_v: { name: 'Fragment de Katana V', icon: '💚' },
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

    if (rewards.hunters && rewards.hunters.length > 0) {
      items.push(
        <span key="hunters" className="text-cyan-400">
          \uD83E\uDDB8 {rewards.hunters.length} hunter{rewards.hunters.length > 1 ? 's' : ''}
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

    if (rewards.fragments && Object.keys(rewards.fragments).length > 0) {
      const totalFragments = Object.values(rewards.fragments).reduce((sum, val) => sum + val, 0);
      items.push(
        <span key="fragments" className="text-orange-400">
          🧩 {totalFragments} fragment{totalFragments > 1 ? 's' : ''}
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

          {rewards.hunters && rewards.hunters.length > 0 && (
            <div>
              <div className="text-gray-400 mb-1">Hunters:</div>
              <ul className="list-disc list-inside text-cyan-300 space-y-0.5">
                {rewards.hunters.map((h, i) => (
                  <li key={i}>
                    {HUNTERS[h.id]?.name || h.id}
                    <span className="text-yellow-400 ml-1">{h.stars}★</span>
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

          {rewards.fragments && Object.keys(rewards.fragments).length > 0 && (
            <div>
              <div className="text-gray-400 mb-1">Fragments:</div>
              <ul className="list-disc list-inside text-orange-300 space-y-0.5">
                {Object.entries(rewards.fragments).map(([fragId, amt]) => {
                  const frag = FRAGMENT_NAMES[fragId];
                  return (
                    <li key={fragId}>
                      {frag ? `${frag.icon} ${frag.name}` : fragId}: {amt}
                    </li>
                  );
                })}
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

          {/* Contact Support button */}
          <button
            onClick={() => {
              setShowSupportForm(true);
              setSupportError(null);
              setSupportSuccess(null);
            }}
            className="ml-auto px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 transition-all flex items-center gap-2"
          >
            <MessageCircle size={16} />
            Contacter le Support
          </button>
        </div>

        {/* Support Form Modal */}
        {showSupportForm && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div ref={supportModalRef} className="bg-[#0f0f1a] border border-white/20 rounded-lg max-w-lg w-full relative overflow-hidden">
              {/* Béru Chibi Dissuasion */}
              <BeruChibiDissuasion containerRef={supportModalRef} />

              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between relative z-20">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageCircle size={22} className="text-pink-400" />
                  Contacter le Support
                </h2>
                <button
                  onClick={() => setShowSupportForm(false)}
                  className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 relative z-20">
                <p className="text-sm text-gray-400">
                  Envoyez un message a l'equipe. Limite : 1 message par jour.
                </p>

                {supportSuccess && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm flex items-center gap-2">
                    <Check size={16} />
                    {supportSuccess}
                  </div>
                )}

                {supportError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm flex items-center gap-2">
                    <X size={16} />
                    {supportError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1">
                    Sujet <span className="text-red-400">*</span>
                    <span className="text-xs text-gray-500 ml-2">({supportSubject.length}/80)</span>
                  </label>
                  <input
                    type="text"
                    value={supportSubject}
                    onChange={(e) => setSupportSubject(e.target.value.slice(0, 80))}
                    placeholder="Ex: Bug dans la forge, Suggestion..."
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1">
                    Message <span className="text-red-400">*</span>
                    <span className="text-xs text-gray-500 ml-2">({supportMessage.length}/1000)</span>
                  </label>
                  <textarea
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value.slice(0, 1000))}
                    placeholder="Decrivez votre probleme ou suggestion..."
                    rows={5}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 resize-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10 flex gap-3 relative z-20">
                <button
                  onClick={() => setShowSupportForm(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={sendSupportMessage}
                  disabled={supportSending || !supportSubject.trim() || !supportMessage.trim()}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {supportSending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Envoyer
                    </>
                  )}
                </button>
              </div>

              {/* Béru Chibi Animations */}
              <style>{`
                @keyframes beruShake {
                  0%, 100% { transform: rotate(0deg); }
                  25% { transform: rotate(-12deg); }
                  75% { transform: rotate(12deg); }
                }
                @keyframes beruFloat {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-6px); }
                }
                @keyframes beruBounce {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-10px); }
                }
                @keyframes beruBubblePop {
                  0% { transform: translateX(-50%) scale(0.5); opacity: 0; }
                  70% { transform: translateX(-50%) scale(1.1); }
                  100% { transform: translateX(-50%) scale(1); opacity: 1; }
                }
              `}</style>
            </div>
          </div>
        )}

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
                  (mail.rewards.hunters && mail.rewards.hunters.length > 0) ||
                  (mail.rewards.hammers && Object.keys(mail.rewards.hammers).length > 0) ||
                  (mail.rewards.fragments && Object.keys(mail.rewards.fragments).length > 0) ||
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
