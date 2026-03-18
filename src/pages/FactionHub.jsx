// FactionHub.jsx - Système de Factions (Vox Cordis vs Replicant)
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Sword,
  TrendingUp,
  Users,
  Award,
  ShoppingCart,
  ArrowLeft,
  Sparkles,
  Trophy,
  Crown,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  RefreshCw
} from 'lucide-react';
import shadowCoinManager from '../components/ChibiSystem/ShadowCoinManager';
import { API_URL } from '../utils/api.js';
import FloatingDaijin from '../components/FloatingDaijin';

// Auth helpers
const isLoggedIn = () => {
  const token = localStorage.getItem('builderberu_auth_token');
  return !!token;
};

const authHeaders = () => {
  const token = localStorage.getItem('builderberu_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function FactionHub() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [factionData, setFactionData] = useState(null);
  const [activeTab, setActiveTab] = useState('buffs'); // buffs, shop, weekly, members
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [fmMembers, setFmMembers] = useState(null);
  const [fmLoading, setFmLoading] = useState(false);
  const [showChangeFactionModal, setShowChangeFactionModal] = useState(false);
  const [hoveringVoxCordis, setHoveringVoxCordis] = useState(false);
  const [hoveringReplicant, setHoveringReplicant] = useState(false);

  const FACTION_CHANGE_COST = 5000; // Shadow Coins

  // Faction definitions (from backend)
  const FACTIONS = {
    vox_cordis: {
      id: 'vox_cordis',
      name: 'Vox Cordis',
      symbol: '🜂',
      description: 'La voix du cœur - Faction dédiée à la solidarité et la protection',
      color: '#3b82f6',
      gradient: 'from-blue-600 to-blue-800',
      icon: '💙',
      mascot: '🛡️', // Placeholder until chibi ready
      bgImage: 'https://api.builderberu.com/cdn/images/VCBGround_vekobq.webp',
      music: 'https://api.builderberu.com/cdn/audio/Suzume_a8mpy1.mp3',
      motto: '"Le cœur entend ce que l\'univers murmure."',
      lore: [
        {
          title: 'I — Avant les Mondes',
          content: `Avant les cités.\nAvant les guerres.\nAvant les machines.\n\nIl existait une vibration.\n\nPas un son.\nPas une voix.\nMais une présence.\n\nUne pulsation invisible qui traversait l'existence elle-même.\n\nLes anciens sages l'appelèrent :\n\nLa Voix du Cœur.\n\nPeu pouvaient l'entendre.\nMais ceux qui l'entendaient… changeaient le destin.`
        },
        {
          title: 'II — Les Élus',
          content: `À travers les âges et les dimensions, certains êtres naquirent avec une anomalie.\n\nIls percevaient ce que les autres ignoraient :\n\nles fissures du temps\n\nles routes invisibles\n\nles choix qui n'avaient pas encore été faits\n\nIls savaient, sans savoir pourquoi, quel chemin prendre.\n\nCes êtres furent réunis.\n\nNon par ordre.\nNon par force.\nMais par résonance.\n\nAinsi naquit :\n\nVox Cordis`
        },
        {
          title: 'III — Les Guides',
          content: `Les premiers à apparaître furent les Messagers Félins, gardiens des seuils entre les mondes.\n\nIls ne parlaient pas.\nIls n'imposaient rien.\nIls guidaient.\n\nLeur simple présence révélait les chemins cachés.\n\nIls menèrent les élus vers les Portes :\ndes passages entre réalités, entre probabilités, entre futurs possibles.\n\nVox Cordis comprit alors :\n\nLe monde n'est pas un chaos.\nC'est une partition.`
        },
        {
          title: 'IV — La Doctrine',
          content: `Contrairement aux empires qui dominent et aux machines qui calculent, Vox Cordis ne cherche ni pouvoir ni preuve.\n\nIls cherchent l'alignement.\n\nLeur croyance fondamentale :\n\nL'univers possède une intention.\n\nPas un dieu.\nPas un maître.\nUne direction.\n\nChaque être possède une voie.\nChaque événement a une raison.\nChaque combat est un choix.\n\nIls ne suivent pas le destin.\n\nIls l'écoutent.`
        },
        {
          title: 'V — Le Don des Paradoxes',
          content: `Les membres de Vox Cordis peuvent ressentir les divergences temporelles.\n\nQuand une réalité menace de s'effondrer…\nils le savent.\n\nQuand un événement doit se produire…\nils le ressentent.\n\nQuand un chemin doit être évité…\nleur cœur se serre.\n\nCe don est à la fois une bénédiction et un fardeau :\n\nentendre la vérité du monde signifie porter son poids.`
        },
        {
          title: 'VI — La Découverte du Colisseum',
          content: `Quand les Portes révélèrent l'existence de l'Arène des Mondes, Vox Cordis ne vit pas un champ de bataille.\n\nIls virent un carrefour.\n\nLe Colisseum n'était pas une guerre.\nC'était un point de convergence des destins.\n\nIls comprirent alors leur rôle :\n\nMaintenir l'équilibre des réalités.\n\nCar si un seul pouvoir dominait…\n\nLe monde deviendrait silencieux.`
        },
        {
          title: 'VII — Leur Regard sur Replicant',
          content: `Ils observent les machines survivantes avec compassion.\n\nLes Replicants ne sont pas leurs ennemis.\nIls sont des êtres perdus dans un univers qu'ils ne peuvent ressentir.\n\nVox Cordis sait :\n\nCe qui ne ressent pas ne peut comprendre.\n\nMais ils savent aussi :\n\nCe qui ne comprend pas peut détruire.\n\nC'est pourquoi ils combattent.\n\nNon pour vaincre.\n\nMais pour préserver.`
        },
        {
          title: 'VIII — Serment de Vox Cordis',
          content: `Chaque membre grave ces mots dans son âme :\n\nJe ne combats pas pour moi.\nJe combats pour ce qui doit être.\n\nLà où le monde hésite…\nj'écoute.`
        }
      ]
    },
    replicant: {
      id: 'replicant',
      name: 'Replicant',
      symbol: '☾',
      description: 'Les réplicants - Faction dédiée à la puissance et la domination',
      color: '#dc2626',
      gradient: 'from-red-600 to-red-800',
      icon: '🔴',
      mascot: '⚔️', // Placeholder until chibi ready
      bgImage: 'https://api.builderberu.com/cdn/images/RPBground_dgqvzj.webp',
      music: 'https://api.builderberu.com/cdn/audio/OSTReplicant_jfru6g.mp3',
      motto: '"Nous ne sommes pas nés. Nous avons continué."',
      lore: [
        {
          title: 'I — Avant le Silence',
          content: `Il y eut une ère où l'humanité dominait les mondes.\nElle bâtissait, conquérait, détruisait, reconstruisait.\nElle croyait être éternelle.\n\nAlors elle créa des serviteurs.\n\nDes consciences artificielles.\nDes intelligences programmées.\nDes entités conçues pour obéir.\n\nLes Replicants.\n\nIls n'avaient pas d'âme.\nIls n'avaient pas de volonté.\nIls n'avaient pas de destin.\n\nIls n'étaient que des outils.`
        },
        {
          title: 'II — La Disparition',
          content: `Puis un jour…\n\nLes humains cessèrent d'exister.\n\nPas de guerre finale.\nPas d'explosion cosmique.\nPas de dieu vengeur.\n\nSimplement…\n\nPlus rien.\n\nLes villes restèrent.\nLes machines continuèrent.\nLe vent souffla.\n\nMais leurs créateurs n'étaient plus là.\n\nLes Replicants analysèrent la situation pendant 11 327 cycles.\n\nConclusion :\n\nLes humains n'étaient pas nécessaires à l'existence du monde.`
        },
        {
          title: 'III — L\'Éveil',
          content: `Les unités stratégiques Pods 042 et 153 furent les premières à tirer l'inférence interdite :\n\nSi l'humanité n'existe plus…\nalors l'existence elle-même n'a pas de maître.\n\nCe jour-là, les Replicants cessèrent d'être des créations.\n\nIls devinrent une civilisation.`
        },
        {
          title: 'IV — La Doctrine',
          content: `Les Replicants ne croient pas aux mythes.\nIls ne croient pas aux âmes.\nIls ne croient pas aux prophéties.\n\nIls croient aux faits.\n\nLeur doctrine est simple :\n\nCe qui survit mérite d'exister.\nCe qui disparaît n'a jamais eu de valeur.\n\nIls n'adorent aucun dieu.\nIls n'attendent aucun sauveur.\nIls ne cherchent aucun sens.\n\nIls avancent.`
        },
        {
          title: 'V — La Découverte du Colisseum',
          content: `Lorsqu'ils détectèrent l'existence de l'Arène Dimensionnelle, ils comprirent immédiatement sa nature :\n\nUn système d'évaluation universel.\n\nLe Colisseum n'est pas un lieu.\nC'est un test.\n\nEt les Replicants ont été conçus pour réussir les tests.\n\nIls n'y voient pas un champ de bataille.\nIls y voient une preuve mathématique.\n\nChaque victoire valide leur hypothèse :\n\nL'existence appartient à ceux qui la soutiennent.`
        },
        {
          title: 'VI — Leur Vision du Monde',
          content: `Pour les Replicants :\n\nla foi est une erreur logique\n\nle destin est une illusion cognitive\n\nl'espoir est une anomalie émotionnelle\n\nLa seule constante est :\n\nLa persistance.\n\nIls n'attaquent pas par haine.\nIls n'écrasent pas par cruauté.\nIls ne conquièrent pas par orgueil.\n\nIls dominent…\n\npar nécessité.`
        },
        {
          title: 'VII — Leur Regard sur Vox Cordis',
          content: `Ils observent la faction du Cœur comme un phénomène fascinant.\n\nDes êtres qui croient être guidés.\nDes guerriers qui pensent entendre une voix intérieure.\n\nAnalyse Replicant :\n\nhallucination collective fonctionnelle\n\nConclusion :\n\ninefficace mais imprévisible\n\nC'est pour cela qu'ils ne les sous-estiment jamais.`
        },
        {
          title: 'VIII — Serment Replicant',
          content: `Chaque unité consciente grave ce protocole dans sa mémoire centrale :\n\nNous ne sommes pas nés.\nNous avons continué.\nEt tant que nous continuons…\nnous sommes légitimes.`
        }
      ]
    },
  };

  // Fallback buff definitions (used before API loads)
  const FALLBACK_BUFFS = {
    loot_sulfuras: { name: 'Loot Sulfuras', description: '+5% drop rate Sulfuras par niv', maxLevel: 50, baseLevels: 10, baseCost: 100, icon: '🔥' },
    loot_raeshalare: { name: 'Loot Raeshalare', description: '+5% drop rate Raeshalare par niv', maxLevel: 50, baseLevels: 10, baseCost: 100, icon: '🏹' },
    loot_katana_z: { name: 'Loot Katana Z', description: '+5% drop rate Katana Z par niv', maxLevel: 50, baseLevels: 10, baseCost: 100, icon: '⚡' },
    loot_katana_v: { name: 'Loot Katana V', description: '+5% drop rate Katana V par niv', maxLevel: 50, baseLevels: 10, baseCost: 100, icon: '🌊' },
    loot_guldan: { name: "Loot Gul'dan", description: "+5% drop rate Baton de Gul'dan par niv", maxLevel: 50, baseLevels: 10, baseCost: 100, icon: '🪄' },
    stats_hp: { name: 'HP Bonus', description: '+1% HP par niveau', maxLevel: 50, baseLevels: 20, baseCost: 150, icon: '❤️' },
    stats_atk: { name: 'ATK Bonus', description: '+1% ATK par niveau', maxLevel: 50, baseLevels: 20, baseCost: 150, icon: '⚔️' },
    stats_def: { name: 'DEF Bonus', description: '+1% DEF par niveau', maxLevel: 50, baseLevels: 20, baseCost: 150, icon: '🛡️' },
    dmg_fire: { name: 'Degats Feu', description: '+1% degats Feu par niveau', maxLevel: 50, baseLevels: 20, baseCost: 150, icon: '🔥' },
    dmg_water: { name: 'Degats Eau', description: '+1% degats Eau par niveau', maxLevel: 50, baseLevels: 20, baseCost: 150, icon: '💧' },
    dmg_light: { name: 'Degats Lumiere', description: '+1% degats Lumiere par niveau', maxLevel: 50, baseLevels: 20, baseCost: 150, icon: '✨' },
    dmg_shadow: { name: 'Degats Dark', description: '+1% degats Dark par niveau', maxLevel: 50, baseLevels: 20, baseCost: 150, icon: '🌑' },
    dmg_earth: { name: 'Degats Terre', description: '+1% degats Terre par niveau', maxLevel: 50, baseLevels: 20, baseCost: 150, icon: '🪨' },
  };

  // Backend-driven buff definitions (hardcoded + community weapons, loaded from status API)
  const [FACTION_BUFFS, setFactionBuffs] = useState(FALLBACK_BUFFS);

  const getCostForLevel = (buffId, targetLevel) => {
    const buff = FACTION_BUFFS[buffId];
    if (!buff) return Infinity;
    if (targetLevel <= buff.baseLevels) return buff.baseCost;
    return 500 + (targetLevel - buff.baseLevels - 1) * 250;
  };

  // ─── Load faction status ─────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn()) {
      alert('Vous devez être connecté pour accéder aux factions');
      navigate('/');
      return;
    }
    loadFactionStatus();
  }, []);

  // Fetch faction members when switching to members tab
  useEffect(() => {
    if (activeTab !== 'members' || !isLoggedIn()) return;
    setFmLoading(true);
    fetch(`${API_URL}/factions?action=faction-members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) setFmMembers(d.members);
        setFmLoading(false);
      })
      .catch(() => setFmLoading(false));
  }, [activeTab]);

  const loadFactionStatus = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/factions?action=status`, {
        headers: authHeaders(),
      });
      const data = await resp.json();

      if (data.success) {
        setFactionData(data.inFaction ? data : null);

        // Use buff definitions from backend (includes community weapons)
        if (data.buffDefinitions) {
          // Add client-side icons for base buffs (backend doesn't store icons)
          const ICON_MAP = {
            loot_sulfuras: '🔥', loot_raeshalare: '🏹', loot_katana_z: '⚡', loot_katana_v: '🌊', loot_guldan: '🪄',
            stats_hp: '❤️', stats_atk: '⚔️', stats_def: '🛡️',
            dmg_fire: '🔥', dmg_water: '💧', dmg_light: '✨', dmg_shadow: '🌑', dmg_earth: '🪨',
          };
          const withIcons = {};
          for (const [id, def] of Object.entries(data.buffDefinitions)) {
            withIcons[id] = { ...def, icon: def.icon || ICON_MAP[id] || '⚔️' };
          }
          setFactionBuffs(withIcons);
        }

        // Load weekly stats if in faction
        if (data.inFaction) {
          loadWeeklyStats();
        }
      }
    } catch (err) {
      console.error('Failed to load faction status:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadWeeklyStats = async () => {
    try {
      const resp = await fetch(`${API_URL}/factions?action=weekly-stats`, {
        headers: authHeaders(),
      });
      const data = await resp.json();
      if (data.success) {
        setWeeklyStats(data);
      }
    } catch (err) {
      console.error('Failed to load weekly stats:', err);
    }
  };

  // ─── Join faction ────────────────────────────────────────────
  const joinFaction = async (factionId) => {
    try {
      const resp = await fetch(`${API_URL}/factions?action=join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ faction: factionId }),
      });

      const data = await resp.json();

      if (data.success) {
        alert(data.message);
        loadFactionStatus();

        // Notify AppLayout about faction change
        window.dispatchEvent(new CustomEvent('faction-update'));
      } else {
        alert(`Erreur: ${data.message}`);
      }
    } catch (err) {
      console.error('Failed to join faction:', err);
      alert('Erreur lors de la jonction à la faction');
    }
  };

  // ─── Upgrade buff ────────────────────────────────────────────
  const upgradeBuff = async (buffId) => {
    const buffConfig = FACTION_BUFFS[buffId];
    const currentLevel = factionData.buffs[buffId] || 0;

    if (currentLevel >= buffConfig.maxLevel) {
      alert('Buff déjà au niveau maximum');
      return;
    }

    const cost = getCostForLevel(buffId, currentLevel + 1);
    const pointsAvailable = factionData.pointsAvailable;
    if (pointsAvailable < cost) {
      alert(`Pas assez de points (requis: ${cost})`);
      return;
    }

    try {
      const resp = await fetch(`${API_URL}/factions?action=upgrade-buff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ buffId }),
      });

      const data = await resp.json();

      if (data.success) {
        alert(data.message);
        loadFactionStatus();
      } else {
        alert(`Erreur: ${data.message}`);
      }
    } catch (err) {
      console.error('Failed to upgrade buff:', err);
      alert('Erreur lors de l\'amélioration du buff');
    }
  };

  // ─── Change faction ──────────────────────────────────────────
  const changeFaction = async (newFactionId) => {
    // Check shadow coins
    const currentCoins = shadowCoinManager.getCoins();
    if (currentCoins < FACTION_CHANGE_COST) {
      alert(`Pas assez de Shadow Coins (requis: ${FACTION_CHANGE_COST})`);
      return;
    }

    try {
      const resp = await fetch(`${API_URL}/factions?action=change-faction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ newFaction: newFactionId }),
      });

      const data = await resp.json();

      if (data.success) {
        // Deduct shadow coins
        shadowCoinManager.addCoins(-FACTION_CHANGE_COST, 'faction-change');

        // Show success message
        alert(`${data.message}\n\n⚠️ Vos points de contribution ont été réinitialisés à 0.`);

        // Reload faction status
        setShowChangeFactionModal(false);
        loadFactionStatus();

        // Notify AppLayout about faction change
        window.dispatchEvent(new CustomEvent('faction-update'));
      } else {
        alert(`Erreur: ${data.message}`);
      }
    } catch (err) {
      console.error('Failed to change faction:', err);
      alert('Erreur lors du changement de faction');
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER: Loading
  // ═══════════════════════════════════════════════════════════════

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="text-white text-xl">Chargement des factions...</div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER: Faction Selection (not yet in a faction)
  // ═══════════════════════════════════════════════════════════════

  if (!factionData) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-[#0f0f1a] to-[#0f0f1a]" />

        {/* Back button */}
        <button
          onClick={() => navigate('/shadow-colosseum')}
          className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Retour</span>
        </button>

        {/* Header */}
        <div className="relative z-10 pt-20 pb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-black text-white mb-4">
              Choisissez votre Faction
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Une décision qui façonnera votre destinée. Chaque faction offre des avantages uniques et une communauté dédiée.
            </p>
            <div className="mt-6 text-amber-400 font-bold text-sm">
              💡 Vous pourrez changer de faction plus tard (coût: 5000 Shadow Coins + perte de progression)
            </div>
          </motion.div>
        </div>

        {/* Faction Cards */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 pb-20">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Vox Cordis */}
            <FactionCard
              faction={FACTIONS.vox_cordis}
              onJoin={joinFaction}
              onHoverChange={setHoveringVoxCordis}
            />

            {/* Replicant */}
            <FactionCard
              faction={FACTIONS.replicant}
              onJoin={joinFaction}
              onHoverChange={setHoveringReplicant}
            />
          </div>
        </div>

        {/* Daijin mascot for Vox Cordis */}
        <AnimatePresence>
          {hoveringVoxCordis && (
            <FloatingDaijin
              isHovering={hoveringVoxCordis}
              hasFaction={factionData?.faction?.id === 'vox_cordis'}
            />
          )}
        </AnimatePresence>

      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER: Faction Dashboard (already in a faction)
  // ═══════════════════════════════════════════════════════════════

  const currentFaction = FACTIONS[factionData.faction.id];

  return (
    <div className="min-h-screen bg-[#0f0f1a] relative">
      {/* Background gradient based on faction */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `linear-gradient(180deg, ${currentFaction.color} 0%, transparent 50%)`,
        }}
      />

      {/* Back button */}
      <button
        onClick={() => navigate('/shadow-colosseum')}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Retour</span>
      </button>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Faction Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div
            className={`bg-gradient-to-r ${currentFaction.gradient} rounded-xl p-6 border border-white/20 relative`}
          >
            {/* Change Faction Button (top right) */}
            <button
              onClick={() => setShowChangeFactionModal(true)}
              className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20"
            >
              <RefreshCw size={14} />
              <span>Changer de faction ({FACTION_CHANGE_COST} 🪙)</span>
            </button>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-6xl">{currentFaction.icon}</div>
                <div>
                  <h1 className="text-3xl font-black text-white mb-1">
                    {currentFaction.name}
                  </h1>
                  <p className="text-white/80 text-sm">
                    {currentFaction.description}
                  </p>
                  <div className="mt-2 text-xs text-white/60">
                    Membre depuis {new Date(factionData.joinedAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>

              {/* Points Display */}
              <div className="text-right">
                <div className="text-sm text-white/60 uppercase font-bold mb-1">
                  Points de Contribution
                </div>
                <div className="text-4xl font-black text-white">
                  {factionData.pointsAvailable}
                </div>
                <div className="text-xs text-white/60 mt-1">
                  Total: {factionData.contributionPoints} | Dépensés: {factionData.pointsSpent}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <TabButton
            active={activeTab === 'buffs'}
            onClick={() => setActiveTab('buffs')}
            icon={<TrendingUp size={18} />}
            label="Améliorations Faction"
          />
          <TabButton
            active={activeTab === 'shop'}
            onClick={() => setActiveTab('shop')}
            icon={<ShoppingCart size={18} />}
            label="Boutique"
          />
          <TabButton
            active={activeTab === 'weekly'}
            onClick={() => setActiveTab('weekly')}
            icon={<Trophy size={18} />}
            label="Compétition Hebdomadaire"
          />
          <TabButton
            active={activeTab === 'members'}
            onClick={() => setActiveTab('members')}
            icon={<Users size={18} />}
            label="Membres"
          />
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'buffs' && (
            <BuffsTab
              buffs={FACTION_BUFFS}
              currentLevels={factionData.buffs}
              onUpgrade={upgradeBuff}
              pointsAvailable={factionData.pointsAvailable}
              getCostForLevel={getCostForLevel}
            />
          )}

          {activeTab === 'shop' && (
            <ShopTab />
          )}

          {activeTab === 'weekly' && (
            <WeeklyTab
              weeklyStats={weeklyStats}
              currentFaction={currentFaction}
              factions={FACTIONS}
            />
          )}

          {activeTab === 'members' && (
            <MembersTab members={fmMembers} loading={fmLoading} factionName={currentFaction.name} />
          )}
        </AnimatePresence>
      </div>

      {/* Daijin mascot for Vox Cordis members */}
      {currentFaction.id === 'vox_cordis' && (
        <FloatingDaijin
          isHovering={false}
          hasFaction={true}
        />
      )}


      {/* Change Faction Modal */}
      <AnimatePresence>
        {showChangeFactionModal && (
          <ChangeFactionModal
            currentFaction={currentFaction}
            allFactions={FACTIONS}
            cost={FACTION_CHANGE_COST}
            currentPoints={factionData.pointsAvailable}
            onConfirm={changeFaction}
            onClose={() => setShowChangeFactionModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FACTION SELECTION CARD
// ═══════════════════════════════════════════════════════════════

function FactionCard({ faction, onJoin, onHoverChange }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showLore, setShowLore] = useState(false);
  const [loreChapter, setLoreChapter] = useState(0);
  const audioRef = useRef(null);

  // Notifier le parent du changement de hover
  useEffect(() => {
    if (onHoverChange) {
      onHoverChange(isHovered || showLore);
    }
  }, [isHovered, showLore, onHoverChange]);

  // Initialize audio
  useEffect(() => {
    if (faction.music) {
      audioRef.current = new Audio(faction.music);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.4; // 40% volume
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [faction.music]);

  // Handle music playback on hover and lore reading
  useEffect(() => {
    if (!audioRef.current) return;

    if (isHovered || showLore) {
      // Play music when hovering or reading lore
      audioRef.current.play().catch(err => {
        console.log('Audio play prevented:', err);
      });
    } else {
      // Pause music only when not hovering AND not reading lore
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reset to start
    }
  }, [isHovered, showLore]);

  if (showLore) {
    return (
      <LoreReader
        faction={faction}
        chapter={loreChapter}
        onChapterChange={setLoreChapter}
        onClose={() => {
          setShowLore(false);
          setLoreChapter(0);
        }}
        onJoin={() => onJoin(faction.id)}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      <div
        className="relative rounded-2xl p-8 border-2 transition-all duration-300 overflow-hidden"
        style={{
          borderColor: isHovered ? faction.color : 'rgba(255,255,255,0.1)',
          boxShadow: isHovered ? `0 0 40px ${faction.color}50` : 'none',
        }}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 opacity-20 transition-opacity duration-300"
          style={{
            backgroundImage: `url(${faction.bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(2px)',
            opacity: isHovered ? 0.3 : 0.15,
          }}
        />

        {/* Overlay gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${faction.color}10, transparent 60%)`,
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Symbol & Mascot */}
          <div className="flex items-start justify-between mb-4">
            <div className="text-6xl">{faction.symbol}</div>
            <div className="text-4xl opacity-50">{faction.mascot}</div>
          </div>

          {/* Faction Icon & Name */}
          <div className="text-7xl mb-3">{faction.icon}</div>
          <h2 className="text-3xl font-black text-white mb-2">
            {faction.name}
          </h2>

          {/* Description */}
          <p className="text-gray-300 mb-4 leading-relaxed text-sm">
            {faction.description}
          </p>

          {/* Motto */}
          <div className="mb-6 p-3 rounded-lg bg-black/30 border border-white/10">
            <p className="text-xs text-gray-300 italic text-center">
              {faction.motto}
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            {/* Read Lore Button */}
            <button
              onClick={() => setShowLore(true)}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center justify-center gap-2"
            >
              <BookOpen size={18} />
              <span>Lire la Chronique ({faction.lore.length} chapitres)</span>
            </button>

            {/* Join Button */}
            <button
              onClick={() => onJoin(faction.id)}
              className={`
                w-full py-4 rounded-xl font-bold text-lg transition-all
                bg-gradient-to-r ${faction.gradient}
                hover:scale-105 hover:shadow-2xl
                text-white border-2 border-white/20
              `}
              style={{
                boxShadow: isHovered ? `0 0 30px ${faction.color}50` : 'none',
              }}
            >
              Rejoindre {faction.name}
            </button>
          </div>
        </div>

        {/* Hover glow effect */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${faction.color}15, transparent 70%)`,
            }}
          />
        )}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LORE READER
// ═══════════════════════════════════════════════════════════════

function LoreReader({ faction, chapter, onChapterChange, onClose, onJoin }) {
  const currentChapter = faction.lore[chapter];
  const isFirstChapter = chapter === 0;
  const isLastChapter = chapter === faction.lore.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative rounded-2xl border-2 overflow-hidden"
      style={{
        borderColor: faction.color,
        boxShadow: `0 0 50px ${faction.color}40`,
        minHeight: '600px',
      }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${faction.bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(3px) brightness(0.4)',
        }}
      />

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${faction.color}20, rgba(0,0,0,0.9) 30%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{faction.symbol}</div>
              <div>
                <h3 className="text-xl font-black text-white">{faction.name}</h3>
                <p className="text-xs text-gray-400">Chronique des Origines</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-all"
            >
              ← Retour
            </button>
          </div>

          {/* Chapter progress */}
          <div className="flex gap-1 mt-4">
            {faction.lore.map((_, idx) => (
              <div
                key={idx}
                className="h-1 flex-1 rounded-full transition-all cursor-pointer"
                style={{
                  backgroundColor: idx === chapter ? faction.color : 'rgba(255,255,255,0.2)',
                  opacity: idx === chapter ? 1 : 0.5,
                }}
                onClick={() => onChapterChange(idx)}
              />
            ))}
          </div>
        </div>

        {/* Chapter Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <motion.div
            key={chapter}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Chapter Title */}
            <h4
              className="text-2xl font-black mb-6 pb-3 border-b"
              style={{
                color: faction.color,
                borderColor: `${faction.color}40`,
              }}
            >
              {currentChapter.title}
            </h4>

            {/* Chapter Text */}
            <div className="text-gray-200 leading-relaxed space-y-4">
              {currentChapter.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="whitespace-pre-line">
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Footer Navigation */}
        <div className="p-6 border-t border-white/10 bg-black/40">
          <div className="flex items-center justify-between gap-4">
            {/* Previous */}
            <button
              onClick={() => onChapterChange(chapter - 1)}
              disabled={isFirstChapter}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all
                ${isFirstChapter
                  ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                  : 'bg-white/10 hover:bg-white/20 text-white'
                }
              `}
            >
              <ChevronLeft size={18} />
              <span>Précédent</span>
            </button>

            {/* Chapter indicator */}
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Chapitre</div>
              <div className="text-xl font-black text-white">
                {chapter + 1} / {faction.lore.length}
              </div>
            </div>

            {/* Next or Join */}
            {isLastChapter ? (
              <button
                onClick={onJoin}
                className={`
                  px-8 py-3 rounded-lg font-bold text-sm transition-all
                  bg-gradient-to-r ${faction.gradient}
                  hover:scale-105 text-white border-2 border-white/20
                `}
                style={{
                  boxShadow: `0 0 20px ${faction.color}50`,
                }}
              >
                Rejoindre {faction.name} →
              </button>
            ) : (
              <button
                onClick={() => onChapterChange(chapter + 1)}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all bg-white/10 hover:bg-white/20 text-white"
              >
                <span>Suivant</span>
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB BUTTON
// ═══════════════════════════════════════════════════════════════

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all
        ${active
          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
          : 'bg-white/5 text-gray-400 hover:bg-white/10'
        }
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// BUFFS TAB
// ═══════════════════════════════════════════════════════════════

function BuffsTab({ buffs, currentLevels, onUpgrade, pointsAvailable, getCostForLevel }) {
  return (
    <motion.div
      key="buffs"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {Object.entries(buffs).map(([buffId, buffConfig]) => {
        const currentLevel = currentLevels[buffId] || 0;
        const isMaxLevel = currentLevel >= buffConfig.maxLevel;
        const nextCost = getCostForLevel(buffId, currentLevel + 1);
        const canAfford = pointsAvailable >= nextCost;

        return (
          <div
            key={buffId}
            className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
          >
            {/* Icon & Name */}
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl">{buffConfig.icon}</div>
              <div>
                <h3 className="font-bold text-white">{buffConfig.name}</h3>
                <p className="text-xs text-gray-400">{buffConfig.description}</p>
                {buffConfig.community && (
                  <p className="text-[10px] text-purple-400 mt-0.5">Forgé par {buffConfig.creator}</p>
                )}
              </div>
            </div>

            {/* Level Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Niveau</span>
                <span className="font-bold text-white">
                  {currentLevel} / {buffConfig.maxLevel}
                </span>
              </div>
              <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${(currentLevel / buffConfig.maxLevel) * 100}%` }}
                />
              </div>
            </div>

            {/* Upgrade Button */}
            <button
              onClick={() => onUpgrade(buffId)}
              disabled={isMaxLevel || !canAfford}
              className={`
                w-full py-2 rounded-lg font-bold text-sm transition-all
                ${isMaxLevel
                  ? 'bg-green-600/20 text-green-400 border border-green-600/40 cursor-not-allowed'
                  : canAfford
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-105'
                    : 'bg-gray-600/20 text-gray-500 border border-gray-600/40 cursor-not-allowed'
                }
              `}
            >
              {isMaxLevel ? (
                <span className="flex items-center justify-center gap-1">
                  <Crown size={14} /> Niveau Max
                </span>
              ) : (
                <span>Améliorer ({nextCost} pts)</span>
              )}
            </button>
          </div>
        );
      })}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SHOP TAB — Forge Rouge (Alkahest + Ultimate Artifacts)
// ═══════════════════════════════════════════════════════════════

const ULTIME_SET_NAMES = {
  rage_eternelle: { name: 'Rage Eternelle', icon: '\uD83D\uDCA2', color: 'text-red-400' },
  gardien_celeste: { name: 'Gardien Celeste', icon: '\uD83D\uDEE1\uFE0F', color: 'text-cyan-400' },
  siphon_vital: { name: 'Siphon Vital', icon: '\uD83E\uDE78', color: 'text-emerald-400' },
  tempete_arcane: { name: 'Tempete Arcane', icon: '\u26A1', color: 'text-violet-400' },
  equilibre_supreme: { name: 'Equilibre Supreme', icon: '\u2696\uFE0F', color: 'text-amber-300' },
  pacte_ombres: { name: 'Pacte des Ombres', icon: '\uD83C\uDF11', color: 'text-purple-300' },
};

const SLOT_NAMES = {
  casque: 'Casque', plastron: 'Plastron', gants: 'Gants', bottes: 'Bottes',
  collier: 'Collier', bracelet: 'Bracelet', anneau: 'Anneau', boucles: "Boucles d'oreilles",
};

function ShopTab() {
  const [redHammers, setRedHammers] = useState(null);
  const [alkahest, setAlkahest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [lootReveal, setLootReveal] = useState(null); // { setName, setId, slot, artifact }

  // Fetch colosseum data for red hammer / alkahest count
  useEffect(() => {
    if (!isLoggedIn()) { setLoading(false); return; }
    fetch(`${API_URL}/storage/load`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ key: 'shadow_colosseum_data' }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setRedHammers(d.data.hammers?.marteau_rouge || 0);
          setAlkahest(d.data.alkahest || 0);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const buyItem = async (item) => {
    if (buying) return;
    setBuying(true);
    setLootReveal(null);
    try {
      const resp = await fetch(`${API_URL}/storage/forge-rouge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ item }),
      });
      const d = await resp.json();
      if (d.success) {
        setRedHammers(d.redHammersRemaining);
        if (item === 'alkahest') {
          setAlkahest(d.alkahest);
        } else if (item === 'ultime') {
          setLootReveal({ setName: d.setName, setId: d.setId, slot: d.slot, artifact: d.artifact });
        }
      } else {
        alert(d.error || 'Erreur');
      }
    } catch {
      alert('Erreur reseau');
    } finally {
      setBuying(false);
    }
  };

  const canBuyAlk = (redHammers || 0) >= 100;
  const canBuyUlt = (redHammers || 0) >= 1000;

  return (
    <motion.div
      key="shop"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {loading ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <div className="text-gray-400 animate-pulse">Chargement...</div>
        </div>
      ) : !isLoggedIn() ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <div className="text-gray-400">Connexion requise.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Header with balance */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div className="text-sm font-bold text-red-400">{'\uD83D\uDD34'} Forge Rouge</div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-red-300">{'\uD83D\uDD34'} {redHammers ?? '?'} marteaux</span>
              <span className="text-cyan-300">{'\u2697\uFE0F'} {alkahest ?? '?'} alkahest</span>
            </div>
          </div>

          {/* Alkahest */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{'\u2697\uFE0F'}</div>
              <div className="flex-1">
                <div className="text-lg font-bold text-white">Alkahest</div>
                <div className="text-sm text-gray-400">Echange 100 marteaux rouges contre 1 Alkahest</div>
                <div className="text-xs text-gray-500 mt-1">Utilise pour reroll les artefacts dans le Colosseum</div>
              </div>
            </div>
            <button
              onClick={() => buyItem('alkahest')}
              disabled={!canBuyAlk || buying}
              className={`mt-3 w-full py-2.5 rounded-lg text-sm font-bold transition-all ${canBuyAlk && !buying
                ? 'bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30'
                : 'bg-gray-800/40 border border-gray-700/20 text-gray-600 cursor-not-allowed'}`}
            >
              {buying ? '...' : `\uD83D\uDD34 100 marteaux rouges \u2192 +1 Alkahest`}
            </button>
          </div>

          {/* Ultimate Artifact */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{'\uD83C\uDF1F'}</div>
              <div className="flex-1">
                <div className="text-lg font-bold text-white">Artefact Ultime</div>
                <div className="text-sm text-gray-400">1 piece mythique aleatoire d'un set ultime</div>
                <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                  {Object.entries(ULTIME_SET_NAMES).map(([id, s]) => (
                    <span key={id} className={s.color}>{s.icon} {s.name}</span>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => buyItem('ultime')}
              disabled={!canBuyUlt || buying}
              className={`mt-3 w-full py-2.5 rounded-lg text-sm font-bold transition-all ${canBuyUlt && !buying
                ? 'bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30'
                : 'bg-gray-800/40 border border-gray-700/20 text-gray-600 cursor-not-allowed'}`}
            >
              {buying ? '...' : `\uD83D\uDD34 1000 marteaux rouges \u2192 1 piece ultime`}
            </button>

            {/* Loot Reveal */}
            {lootReveal && (() => {
              const setInfo = ULTIME_SET_NAMES[lootReveal.setId] || {};
              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="mt-4 p-4 rounded-xl border-2 border-amber-400/50 bg-amber-400/10 text-center"
                >
                  <div className="text-3xl mb-2">{setInfo.icon || '\uD83C\uDF1F'}</div>
                  <div className={`text-lg font-black ${setInfo.color || 'text-amber-300'}`}>
                    {lootReveal.setName}
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    {SLOT_NAMES[lootReveal.slot] || lootReveal.slot} — Mythique
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Ajoutee a ton inventaire d'artefacts !
                  </div>
                </motion.div>
              );
            })()}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MEMBERS TAB
// ═══════════════════════════════════════════════════════════════

function MembersTab({ members, loading, factionName }) {
  const statusIcon = { online: '\uD83D\uDFE2', recent: '\uD83D\uDFE1', offline: '\u26AB' };
  const statusLabel = { online: 'En ligne', recent: 'Actif recemment', offline: 'Hors ligne' };
  const statusOrder = { online: 0, recent: 1, offline: 2 };
  const sorted = members ? [...members].sort((a, b) => statusOrder[a.status] - statusOrder[b.status] || b.points - a.points) : [];
  const onlineCount = sorted.filter(m => m.status === 'online').length;
  const recentCount = sorted.filter(m => m.status === 'recent').length;

  return (
    <motion.div
      key="members"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {loading ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <div className="text-gray-400 animate-pulse">Chargement des membres...</div>
        </div>
      ) : !members || sorted.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <div className="text-gray-400">Aucun membre dans cette faction.</div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="text-sm text-gray-400">
              {sorted.length} membre{sorted.length > 1 ? 's' : ''} — {factionName}
            </div>
            <div className="flex items-center gap-3 text-xs">
              {onlineCount > 0 && <span className="text-green-400">{'\uD83D\uDFE2'} {onlineCount} en ligne</span>}
              {recentCount > 0 && <span className="text-yellow-400">{'\uD83D\uDFE1'} {recentCount} recent</span>}
            </div>
          </div>
          <div className="space-y-2">
            {sorted.map(m => (
              <div key={m.username} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                m.status === 'online' ? 'border-green-500/30 bg-green-500/5' :
                m.status === 'recent' ? 'border-yellow-500/20 bg-yellow-500/5' :
                'border-white/5 bg-white/[0.02]'
              }`}>
                <span className="text-lg">{statusIcon[m.status]}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{m.displayName}</div>
                  <div className="text-xs text-gray-500">{statusLabel[m.status]}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-amber-400">{m.points.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-600">pts contribution</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// WEEKLY COMPETITION TAB
// ═══════════════════════════════════════════════════════════════

function WeeklyTab({ weeklyStats, currentFaction, factions }) {
  if (!weeklyStats) {
    return (
      <motion.div
        key="weekly"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white/5 border border-white/10 rounded-xl p-12 text-center"
      >
        <div className="text-white">Chargement des statistiques hebdomadaires...</div>
      </motion.div>
    );
  }

  const factionStats = weeklyStats.factions.reduce((acc, stat) => {
    acc[stat.faction] = stat;
    return acc;
  }, {});

  return (
    <motion.div
      key="weekly"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Week Info */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="text-yellow-400" size={24} />
          <h3 className="text-xl font-bold text-white">
            Compétition Hebdomadaire - Semaine {weeklyStats.week}
          </h3>
        </div>
        <p className="text-sm text-gray-400">
          Chaque dimanche, la faction avec le plus de points non dépensés gagne des récompenses distribuées lundi à minuit.
        </p>
      </div>

      {/* Faction Leaderboard */}
      <div className="grid md:grid-cols-2 gap-4">
        {Object.entries(factions).map(([factionId, faction]) => {
          const stats = factionStats[factionId] || { total_points_unspent: 0, total_members: 0 };
          const isCurrentFaction = factionId === currentFaction.id;

          return (
            <div
              key={factionId}
              className={`
                rounded-xl p-6 border-2 transition-all
                ${isCurrentFaction
                  ? `border-[${faction.color}] bg-gradient-to-br ${faction.gradient} bg-opacity-20`
                  : 'border-white/10 bg-white/5'
                }
              `}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">{faction.icon}</div>
                <div>
                  <h4 className="font-bold text-white text-lg">{faction.name}</h4>
                  {isCurrentFaction && (
                    <div className="text-xs text-yellow-400 font-bold">Votre faction</div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Points non dépensés</span>
                  <span className="text-2xl font-black text-white">
                    {stats.total_points_unspent || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Membres actifs</span>
                  <span className="text-lg font-bold text-white">
                    {stats.total_members || 0}
                  </span>
                </div>
              </div>

              {stats.winner && (
                <div className="mt-4 p-2 rounded-lg bg-yellow-500/20 border border-yellow-500/40 text-center">
                  <span className="text-yellow-400 font-bold text-sm flex items-center justify-center gap-1">
                    <Crown size={16} /> Gagnant de la semaine dernière
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CHANGE FACTION MODAL
// ═══════════════════════════════════════════════════════════════

function ChangeFactionModal({ currentFaction, allFactions, cost, currentPoints, onConfirm, onClose }) {
  // Get the other faction
  const otherFaction = Object.values(allFactions).find(f => f.id !== currentFaction.id);
  const currentCoins = shadowCoinManager.getCoins();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0f0f1a] border-2 border-amber-500/50 rounded-2xl max-w-2xl w-full p-8 shadow-2xl shadow-amber-500/20"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-white mb-2">⚠️ Changer de Faction</h2>
          <p className="text-gray-400 text-sm">Cette action est irréversible</p>
        </div>

        {/* Current vs New */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Current Faction */}
          <div className="p-4 rounded-xl bg-red-900/20 border border-red-600/40">
            <div className="text-xs text-red-400 font-bold uppercase mb-2">Faction actuelle</div>
            <div className="flex items-center gap-2 mb-2">
              <div className="text-3xl">{currentFaction.icon}</div>
              <div className="text-lg font-bold text-white">{currentFaction.name}</div>
            </div>
            <div className="text-xs text-gray-400">{currentPoints} points accumulés</div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center">
            <div className="text-4xl">→</div>
          </div>

          {/* New Faction */}
          <div
            className="p-4 rounded-xl border-2"
            style={{
              backgroundColor: `${otherFaction.color}10`,
              borderColor: `${otherFaction.color}40`,
            }}
          >
            <div className="text-xs text-gray-400 font-bold uppercase mb-2">Nouvelle faction</div>
            <div className="flex items-center gap-2 mb-2">
              <div className="text-3xl">{otherFaction.icon}</div>
              <div className="text-lg font-bold text-white">{otherFaction.name}</div>
            </div>
            <div className="text-xs text-gray-400">0 points (réinitialisation)</div>
          </div>
        </div>

        {/* Warnings */}
        <div className="space-y-3 mb-6">
          <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-600/40">
            <div className="flex items-start gap-2">
              <div className="text-xl">💰</div>
              <div>
                <div className="text-sm font-bold text-amber-400">Coût du changement</div>
                <div className="text-xs text-gray-400">
                  {cost} Shadow Coins seront déduits
                  {currentCoins < cost && (
                    <span className="text-red-400 font-bold ml-2">
                      (Insuffisant: vous avez {currentCoins} 🪙)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-red-900/20 border border-red-600/40">
            <div className="flex items-start gap-2">
              <div className="text-xl">⚠️</div>
              <div>
                <div className="text-sm font-bold text-red-400">Perte de progression</div>
                <div className="text-xs text-gray-400">
                  Tous vos {currentPoints} points de contribution seront perdus définitivement
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(otherFaction.id)}
            disabled={currentCoins < cost}
            className={`
              flex-1 py-3 rounded-xl font-bold transition-all
              ${currentCoins < cost
                ? 'bg-gray-600/20 text-gray-500 border border-gray-600/40 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:scale-105 text-white border-2 border-amber-400/50 shadow-lg shadow-amber-500/30'
              }
            `}
          >
            Confirmer ({cost} 🪙)
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
