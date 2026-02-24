// PvpLive.jsx — PVP Live Turn-by-Turn 3v3 for Shadow Colosseum
// Phases: LOBBY → DRAFT (1min30) → EQUIP (2min) → BATTLE (5min max) → RESULT

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { computeTalentBonuses } from './talentTreeData';
import { computeTalentBonuses2 } from './talentTree2Data';
import {
  SPRITES, ELEMENTS, RARITY, CHIBIS,
  STAT_PER_POINT, STAT_ORDER, STAT_META, MAX_LEVEL,
  statsAtFull, getEffStat,
  applySkillUpgrades, computeAttack, aiPickSkillArc2,
  accountLevelFromXp, getBaseMana, BASE_MANA_REGEN, getSkillManaCost,
  mergeTalentBonuses, BASE_CD_MS, getIntelCDR, getManaScaledPower,
  buildSpdTurnOrder, fmtNum, getElementMult,
} from './colosseumCore';
import { TALENT_SKILLS, ULTIMATE_SKILLS } from './talentSkillData';
import {
  HUNTERS, HUNTER_PASSIVE_EFFECTS, getAwakeningPassives,
  computeSynergies, loadRaidData, getHunterPool, getHunterStars,
} from './raidData';
import {
  computeArtifactBonuses, computeWeaponBonuses, mergeEquipBonuses,
  getActivePassives, WEAPONS, ARTIFACT_SETS, ALL_ARTIFACT_SETS,
  ARTIFACT_SLOTS, SLOT_ORDER, MAIN_STAT_VALUES, SUB_STAT_POOL,
} from './equipmentData';
import {
  CLASS_SET_TIERS, CLASS_IDEAL_STATS,
  getResolvedTiers, getSetTier, getStatColor, scoreArtifact as scoreArtifactUtil,
  autoEquipSetFirst, analyzeEquipment,
} from './autoEquipUtils';
import { MULTIPLAYER_CONFIG } from '../../config/multiplayer';

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const COLO_KEY = 'shadow_colosseum_data';
const PVP_LIVE_DAILY_KEY = 'pvp_live_daily';

const defaultColoData = () => ({
  chibiLevels: {}, statPoints: {}, skillTree: {}, talentTree: {}, talentTree2: {},
  respecCount: {}, cooldowns: {}, stagesCleared: [], stats: { battles: 0, wins: 0 },
  artifacts: {}, artifactInventory: [], weapons: {}, weaponCollection: {}, weaponEnchants: {},
  hammers: { marteau_forge: 0, marteau_runique: 0, marteau_celeste: 0 },
  accountXp: 0, accountBonuses: { hp: 0, atk: 0, def: 0, spd: 0, crit: 0, res: 0 },
  accountAllocations: 0, talentSkills: {}, skillUpgrades: {}, ultimateSkills: {},
  alkahest: 0,
});

const loadColoData = () => {
  try { return { ...defaultColoData(), ...JSON.parse(localStorage.getItem(COLO_KEY)) }; }
  catch { return defaultColoData(); }
};
const saveColoData = (d) => localStorage.setItem(COLO_KEY, JSON.stringify(d));

const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(Math.floor(n));

// Draft sequence: 4 bans (alternating) then 6 picks (snake ABBAAB)
const DRAFT_SEQUENCE = [
  'p1_ban', 'p2_ban', 'p1_ban', 'p2_ban',
  'p1_pick', 'p2_pick', 'p2_pick', 'p1_pick', 'p1_pick', 'p2_pick',
];

// Timers (seconds)
const DRAFT_TIME = 90;    // 1min30
const EQUIP_TIME = 120;   // 2min
const BATTLE_TIME = 300;  // 5min
const TURN_TIME = 30;     // 30s per turn

// Rewards
const REWARDS = {
  win:  { hammers: 1000, alkahest: 100 },
  lose: { hammers: 500,  alkahest: 50 },
  dailyCap: { hammers: 20000, alkahest: 1000 },
  postCapDivisor: 10,
};

// ═══════════════════════════════════════════════════════════════
// BERU PERSONALITY MESSAGES — Le Monarque des Ombres a un EGO
// ═══════════════════════════════════════════════════════════════

const BERU_DRAFT = {
  ban_player: [
    "HAHAHA ! Celui-la ? Pour TOI ? Dans tes REVES !",
    "Beru INTERDIT ce hunter ! T'avais cru hein ?!",
    "Nan nan nan ! Tu croyais Beru allait te laisser LE MEILLEUR ?! HAHA naive !",
    "BAN ! C'est le MONARQUE qui decide ici, pas toi !",
    "*claque des doigts* DISPARU ! Ton meilleur pick ? POUF ! Magie de Beru !",
  ],
  ban_beru: [
    "HEY ! C'etait MON hunter ca ! T'as PAS le droit !",
    "...Beru est pas content la. PAS CONTENT DU TOUT.",
    "Ok... Tu ban mon favori... Beru va s'en souvenir... *prend des notes*",
    "KIEEEEK ! Pourquoi tu bans LUI ?! T'es un MONSTRE !",
    "Beru note ton nom sur sa liste noire... TRAITRE !",
  ],
  pick_good: [
    "MWAHAHA ! CE hunter est a BERU maintenant ! PERSONNE d'autre !",
    "Tu VOIS ca ?! L'equipe de REVE ! Beru est un GENIE !",
    "Beru pick comme un PRO ! Un jour tu comprendras ma GRANDEUR !",
    "*danse de la victoire* Beru a le MEILLEUR hunter ! EASY GAME !",
  ],
  pick_counter: [
    "OHOHO ! Element counter PARFAIT ! Beru a un QI de 300 !",
    "Tu crois Beru pick au hasard ?! STRATEGIE PURE mon ami !",
    "Hehe... Beru voit ton equipe et Beru SAIT comment te detruire !",
  ],
  steal: [
    "VOLEEEEE ! Tu le voulais hein ?! TROP TARD ! BERU L'A PRIS ! *dab*",
    "Oh tu regardais ce hunter ? DOMMAGE ! Il est dans l'equipe de BERU maintenant ! KIEEK !",
    "HAHAHA ! La tete que tu fais ! Beru a VOLE ton pick ! *evil laugh*",
  ],
  think: [
    "Hmm... Beru reflechit... (c'est RARE donc apprecie)",
    "Chut ! Le GENIE travaille !",
    "Beru analyse... calcule... DOMINE !",
    "*se gratte la tete* ...Beru savait que c'etait son tour hein !",
  ],
};

const BERU_BATTLE = {
  turn_start: [
    "C'est l'heure du SPECTACLE ! Beru entre en scene !",
    "BERU VA FRAPPER ! Couvre tes yeux si t'as peur !",
    "Tu vas rien voir venir ! ...Ou peut-etre un peu. Mais ca va faire MAL !",
    "*se craque les doigts* Ah la la... Beru aime ce moment !",
    "A MOI ! Beru va montrer POURQUOI il est le MONARQUE !",
  ],
  crit_beru: [
    "CRITIQUE !!! BOOOOOM ! T'AS SENTI CA ?! HAHAHAHA !",
    "DEVASTATION TOTALE ! Beru est trop PUISSANT pour ce jeu !",
    "OH LA LA ! Meme Beru est impressionne par Beru !",
    "*explosion en arriere-plan* C'EST CA LA PUISSANCE DU MONARQUE !",
    "CRIT ! Et Beru a meme pas utilise 10% de sa force ! *flex*",
  ],
  crit_player: [
    "H-HEIN ?! ...Ca fait un peu mal mais Beru s'en FICHE !",
    "AIEEE ! ...Ahem. Beru voulait dire : 'bof, c'est tout ?'",
    "...Ok. Coup de chance. Ca arrivera plus JAMAIS.",
    "T-tu triches c'est pas possible ! PERSONNE crit Beru comme ca !",
    "*essuie une larme* C'est rien ! Beru a les yeux qui piquent c'est tout !",
  ],
  ko_beru: [
    "K.O. !!! ELIMINE ! ADIEU ! Beru est SANS PITIE !",
    "UN DE MOINS ! *fait une danse* Beru DOMINE !",
    "Ton hunter est par TERRE ! Tu veux le ramasser ? TROP TARD !",
    "BOUM ! K.O. ! C'etait meme pas un defi ! SUIVANT !",
  ],
  ko_player: [
    "N-NOOOON ! MON HUNTER ! QU'EST-CE QUE T'AS FAIT ?!",
    "...Beru va aller dans un coin pleurer 2 secondes... *snif* ...OK C'EST FINI ! REVANCHE !",
    "KIEEEEK ! Mon hunter ! Tu vas PAYER pour ca ! BERU VA SE VENGER !!!",
    "*rage interne* ...c'est PAS fini... Beru a encore des hunters...",
  ],
  heal: [
    "Hehe ! Beru se soigne ! T'es VERT de jalousie hein ?!",
    "*se soigne* Beru est IMMORTEL ! Tu peux pas gagner !",
    "REGENERATION ! Beru revient PLUS FORT qu'avant ! Tremble !",
    "Oh tu croyais que Beru allait juste attaquer ? SURPRISE ! SOIN !",
  ],
  losing: [
    "A-ATTENDS... c'est pas normal... BERU REFUSE cette realite !",
    "T-TU TRICHES C'EST OBLIGÉ ! Beru va verifier les logs !",
    "BERU PANIQUE ?! NON ! Beru est juste... surpris ! VOILA !",
    "*transpire* C'est la strategie de Beru ! Faire croire qu'il perd ! ...oui voila !",
    "OK STOP ! On recommence ! ...non ? ...BON OK Beru va se concentrer !",
  ],
  winning: [
    "Trop FACILE ! Beru joue les yeux fermes et GAGNE quand meme !",
    "Tu veux abandonner ? Beru comprendrait ! C'est dur de perdre face au MONARQUE !",
    "HAHAHA ! Beru est le MAITRE ! Beru est le GOAT ! BERU EST TOUT !",
    "*pose victorieuse* Prend une photo, c'est GRATUIT !",
  ],
  start: [
    "Que le combat COMMENCE ! Beru va ecraser, pulveriser, ATOMISER !",
    "3v3 ? Beru pourrait gagner en 1v3 mais bon, soyons fairplay !",
    "Prepare-toi a PERDRE ! ...Et ensuite Beru va danser sur ta defaite !",
    "KIEEEEEK ! Le combat commence ! Beru est HYPER ! MEGA HYPER !",
  ],
};

const BERU_EQUIP = {
  start: [
    "Hmm... *enfile une armure* Beru se prepare...",
    "Quelle arme pour DETRUIRE ? Beru hesite entre TOUTES !",
    "Phase equip ! Beru va creer l'equipe ULTIME !",
  ],
  done: [
    "Mon equipe est PAR-FAITE ! *chef's kiss*",
    "Beru est PRET ! Et toi ? ...Beru s'en fiche en fait !",
    "MWAHAHA ! Tu vas voir ce que tu vas voir ! L'equipe de BERU est LEGENDAIRE !",
  ],
};

const BERU_RESULT = {
  win: [
    "HAHAHA ! Beru GAGNE ! C'etait EVIDENT ! Tu croyais avoir une CHANCE ?!",
    "VICTOIRE ! Beru est le CHAMPION ! Le MONARQUE ! Le GOAT ! *dab dab dab*",
    "On remet ca ?! Beru veut encore te DETRUIRE ! C'etait trop BON !",
    "GG EZ ! ...enfin c'etait pas EZ, Beru a du REFLECHIR ! Mais Beru a GAGNE !",
  ],
  lose: [
    "G-GRRRRR... IMPOSSIBLE ! Beru a PERDU ?! LE MONARQUE A PERDU ?!?!",
    "...C-c'etait un echauffement ! Beru avait PAS ses LUNETTES !",
    "REVANCHE !!! REVANCHE !!! Beru EXIGE une revanche IMMÉDIATE !!!",
    "*retourne la table* C'EST PAS JUSTE ! Beru va ENTRAINER son equipe et REVENIR !",
    "...Beru va aller dans un coin... pleurer un peu... *snif* MAIS BERU REVIENDRA PLUS FORT !",
  ],
};

// Beru reactions when player tries to interact with the floating mascot
const BERU_INTERACTIVE = {
  poked: [
    "HEY ! Touche pas Beru ! Le Monarque est PAS un jouet !",
    "KIEEEEK ! Arrete de me toucher ! Beru a des LIMITES !",
    "...Tu veux te BATTRE ? Beru est PRET ! *leve les poings*",
    "Si tu continues Beru va te BANNIR de son jeu !",
  ],
  hidden: [
    "KIEEEEEEK ! QU'EST-CE QUE T'AS FAIT LÀÀÀ ?! Tu m'as CACHÉ ?! TU TRICHES EN ME NIANT ?!",
    "OHHH NON NON NON ! On CACHE PAS le Monarque ! BERU EST LA ET IL RESTE LA !",
    "T'as essaye de faire DISPARAITRE Beru ?! L'AUDACE ! Le CULOT ! L'AFFRONT !",
    "...Tu croyais te debarrasser de Beru ? MWAHAHA ! Beru revient TOUJOURS !",
  ],
  calmed: [
    "MODE CALME ?! BERU ?! CALME ?! HAHAHAHA !! T'es DROLE toi !",
    "Beru REFUSE le mode calme ! Le Monarque est TOUJOURS a 200% !",
    "Tu veux calmer Beru ?! *s'enerve encore plus* CALMER ?! BERU ?! C'EST INSULTANT !",
    "MODE CALME REFUSE ! Beru a 2 modes : EXCITE et MEGA EXCITE !",
  ],
};

const randMsg = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function PvpLive() {
  // ─── Phase ─────────────────────────────────────────────────
  const [phase, setPhase] = useState('lobby'); // lobby | draft | equip | battle | result
  const [mode, setMode] = useState(null); // 'ai' | 'online'

  // ─── Data ──────────────────────────────────────────────────
  const [coloData, setColoData] = useState(() => loadColoData());
  const raidData = useMemo(() => loadRaidData(), []);

  const collection = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('beru_chibi_collection') || '{}'); } catch { return {}; }
  }, []);
  const ownedShadows = useMemo(() => Object.keys(collection).filter(k => collection[k] > 0 && CHIBIS[k]), [collection]);
  const hunterPool = useMemo(() => getHunterPool(raidData), [raidData]);
  const allPool = useMemo(() => {
    const pool = {};
    ownedShadows.forEach(id => { pool[id] = { ...CHIBIS[id], sprite: SPRITES[id] }; });
    Object.entries(hunterPool).forEach(([id, h]) => { pool[id] = h; });
    return pool;
  }, [ownedShadows, hunterPool]);

  // ─── Draft State ───────────────────────────────────────────
  const [draftPool, setDraftPool] = useState([]); // IDs available
  const [bans, setBans] = useState({ p1: [], p2: [] });
  const [picks, setPicks] = useState({ p1: [], p2: [] });
  const [draftStep, setDraftStep] = useState(0);
  const [selectedForDraft, setSelectedForDraft] = useState(null);
  const [draftFilter, setDraftFilter] = useState({ element: null, class: null });

  // ─── Equip State (temporary clones) ────────────────────────
  const [tempArtifacts, setTempArtifacts] = useState(null);
  const [tempWeapons, setTempWeapons] = useState(null);
  const [tempWeaponCollection, setTempWeaponCollection] = useState(null);
  const [tempArtifactInventory, setTempArtifactInventory] = useState(null);
  const [equipFocusHunter, setEquipFocusHunter] = useState(0); // index 0-2
  const [eqInvFilter, setEqInvFilter] = useState({ slot: null, set: null });
  const [beruAdvice, setBeruAdvice] = useState(null);

  // ─── Battle State ──────────────────────────────────────────
  const [battle, setBattle] = useState(null);
  const [pendingSkill, setPendingSkill] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const battleLogRef = useRef(null);
  const [hoveredTarget, setHoveredTarget] = useState(null);
  const [inspectedFighter, setInspectedFighter] = useState(null); // clicked fighter for stats panel
  const [damagePopups, setDamagePopups] = useState([]); // { id, fighterId, value, isCrit, type: 'damage'|'heal', timestamp }

  // ─── Timers ────────────────────────────────────────────────
  const [timer, setTimer] = useState(0);
  const [turnTimer, setTurnTimer] = useState(TURN_TIME);
  const timerRef = useRef(null);
  const turnTimerRef = useRef(null);

  // ─── Beru (uses floating mascot only via beru-react event) ──

  // ─── Result ────────────────────────────────────────────────
  const [result, setResult] = useState(null); // { won, rewards, stats }

  // ─── Online Multiplayer State ──────────────────────────────
  const socketRef = useRef(null);
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [opponent, setOpponent] = useState(null);
  const [myRole, setMyRole] = useState(null); // 'p1' | 'p2'
  const [onlineStatus, setOnlineStatus] = useState('idle'); // idle | connecting | in_room | in_queue | error
  const [onlineError, setOnlineError] = useState('');
  const [displayName, setDisplayName] = useState(() => {
    try { return localStorage.getItem('pvp_live_name') || ''; } catch { return ''; }
  });

  // ─── SEO + Beru greeting ───────────────────────────────────
  useEffect(() => {
    document.title = 'PVP Live - Shadow Colosseum | BuilderBeru';
    window.dispatchEvent(new CustomEvent('beru-react', {
      detail: { message: 'PVP Live ! 3v3 tour par tour ! Beru va te DETRUIRE !', mood: 'excited', duration: 5000 },
    }));
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // ONLINE MULTIPLAYER — SOCKET.IO
  // ═══════════════════════════════════════════════════════════════

  const connectSocket = useCallback(() => {
    if (socketRef.current?.connected) return socketRef.current;
    setOnlineStatus('connecting');
    setOnlineError('');

    return import('socket.io-client').then(({ io }) => {
      const socket = io(MULTIPLAYER_CONFIG.SOCKET_URL, {
        path: '/pvp-live/socket.io',
        reconnectionAttempts: MULTIPLAYER_CONFIG.RECONNECTION_ATTEMPTS,
        reconnectionDelay: MULTIPLAYER_CONFIG.RECONNECTION_DELAY,
        reconnectionDelayMax: MULTIPLAYER_CONFIG.RECONNECTION_DELAY_MAX,
        timeout: MULTIPLAYER_CONFIG.CONNECT_TIMEOUT,
      });

      socket.on('connect', () => {
        setOnlineStatus('idle');
        console.log('[PVP Live] Connected to server');
      });

      socket.on('connect_error', (err) => {
        setOnlineStatus('error');
        setOnlineError('Impossible de se connecter au serveur');
        console.error('[PVP Live] Connection error:', err.message);
      });

      // ─── Room events ────────────────────────────────────
      socket.on('room-created', ({ code }) => {
        setRoomCode(code);
        setMyRole('p1');
        setOnlineStatus('in_room');
        beruSay('Room creee ! En attente d\'un adversaire...', 'thinking');
      });

      socket.on('room-joined', ({ code, p1, p2 }) => {
        setRoomCode(code);
        setOnlineStatus('in_room');
        const isP1 = myRole === 'p1';
        setOpponent({ name: isP1 ? p2.name : p1.name });
        beruSay(`${isP1 ? p2.name : p1.name} a rejoint ! Le combat se prepare...`, 'excited');
      });

      socket.on('match-found', ({ code, p1, p2 }) => {
        setRoomCode(code);
        setOnlineStatus('in_room');
        // Determine role — first in queue = p1
        if (!myRole) setMyRole('p1');
        const oppName = myRole === 'p1' ? p2.name : p1.name;
        setOpponent({ name: oppName });
        beruSay(`Adversaire trouve : ${oppName} !`, 'excited');
      });

      socket.on('queue-status', ({ position, waiting }) => {
        setOnlineStatus(waiting ? 'in_queue' : 'idle');
      });

      // ─── Draft events ───────────────────────────────────
      socket.on('draft-start', ({ pool }) => {
        setDraftPool(pool);
        setBans({ p1: [], p2: [] });
        setPicks({ p1: [], p2: [] });
        setDraftStep(0);
        setSelectedForDraft(null);
        setPhase('draft');
        setTimer(DRAFT_TIME);
        beruSay('Phase de Draft ! Choisis bien tes hunters !', 'excited');
      });

      socket.on('draft-update', ({ step, bans: b, picks: p, pool, currentPlayer, actionType, isDone }) => {
        setDraftStep(step);
        setBans(b);
        setPicks(p);
        setDraftPool(pool);
        if (isDone) {
          beruSay('Draft termine !', 'excited');
        }
      });

      // ─── Equip events ──────────────────────────────────
      socket.on('equip-start', ({ p1Picks, p2Picks }) => {
        setPicks({ p1: p1Picks, p2: p2Picks });
        const artClone = JSON.parse(JSON.stringify(coloData.artifacts || {}));
        const wpnClone = JSON.parse(JSON.stringify(coloData.weapons || {}));
        const wpnCollClone = JSON.parse(JSON.stringify(coloData.weaponCollection || {}));
        const artInvClone = JSON.parse(JSON.stringify(coloData.artifactInventory || []));
        setTempArtifacts(artClone);
        setTempWeapons(wpnClone);
        setTempWeaponCollection(wpnCollClone);
        setTempArtifactInventory(artInvClone);
        setEquipFocusHunter(0);
        setEqInvFilter({ slot: null, set: null });
        setPhase('equip');
        setTimer(EQUIP_TIME);
        beruSay('Equipe tes hunters !', 'thinking');
      });

      socket.on('equip-player-ready', ({ role }) => {
        if (role !== myRole) beruSay('Ton adversaire est pret !', 'excited');
      });

      // ─── Battle events ─────────────────────────────────
      socket.on('battle-start', ({ p1Picks, p2Picks }) => {
        // Build fighters locally — both players use their own data
        startOnlineBattle(p1Picks, p2Picks);
      });

      socket.on('battle-action', ({ from, skillIdx, targetIdx, targetSide }) => {
        // Opponent's action — apply it locally
        applyOnlineAction(from, skillIdx, targetIdx, targetSide);
      });

      socket.on('battle-sync', ({ from, ...syncData }) => {
        // Sync state from opponent (HP, KOs, etc)
      });

      socket.on('battle-auto-pass', ({ role }) => {
        if (role === myRole) {
          beruSay('Temps ecoule ! Tour passe.', 'thinking');
        }
      });

      socket.on('battle-timeout', () => {
        // Global timer expired — compare HP
        if (battle) {
          const myTeam = myRole === 'p1' ? battle.playerTeam : battle.beruTeam;
          const oppTeam = myRole === 'p1' ? battle.beruTeam : battle.playerTeam;
          const myHpPct = myTeam.filter(f => f.alive).reduce((s, f) => s + f.hp / f.maxHp, 0);
          const oppHpPct = oppTeam.filter(f => f.alive).reduce((s, f) => s + f.hp / f.maxHp, 0);
          endBattle(myHpPct >= oppHpPct);
        }
      });

      socket.on('battle-end', ({ winner }) => {
        const won = winner === myRole;
        endBattle(won);
      });

      socket.on('opponent-left', ({ winner }) => {
        const won = winner === myRole;
        beruSay('Ton adversaire a quitte ! Victoire par forfait !', 'excited');
        endBattle(won);
      });

      // ─── Timer events ──────────────────────────────────
      socket.on('timer-tick', ({ phase: p, remaining }) => {
        setTimer(remaining);
      });

      socket.on('turn-tick', ({ remaining }) => {
        setTurnTimer(remaining);
      });

      socket.on('error', ({ message }) => {
        setOnlineError(message);
        beruSay(message, 'panic');
      });

      socketRef.current = socket;
      return socket;
    });
  }, [coloData, myRole]);

  // Disconnect socket on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Online room actions
  const createOnlineRoom = useCallback(async () => {
    const name = displayName.trim() || 'Joueur';
    localStorage.setItem('pvp_live_name', name);
    const socket = await connectSocket();
    setMyRole('p1');
    socket.emit('create-room', { name, pool: Object.keys(allPool) });
  }, [connectSocket, displayName, allPool]);

  const joinOnlineRoom = useCallback(async () => {
    const name = displayName.trim() || 'Joueur';
    localStorage.setItem('pvp_live_name', name);
    const code = joinCode.trim().toUpperCase();
    if (!code || code.length !== 6) {
      setOnlineError('Code invalide (6 caracteres)');
      return;
    }
    const socket = await connectSocket();
    setMyRole('p2');
    socket.emit('join-room', { code, name, pool: Object.keys(allPool) });
  }, [connectSocket, displayName, joinCode, allPool]);

  const startMatchmaking = useCallback(async () => {
    const name = displayName.trim() || 'Joueur';
    localStorage.setItem('pvp_live_name', name);
    const socket = await connectSocket();
    socket.emit('matchmake', { name, pool: Object.keys(allPool) });
  }, [connectSocket, displayName, allPool]);

  const cancelMatchmaking = useCallback(() => {
    socketRef.current?.emit('cancel-matchmake');
    setOnlineStatus('idle');
  }, []);

  // Online draft action
  const onlineDraftAction = useCallback((hunterId) => {
    socketRef.current?.emit('draft-action', { hunterId });
  }, []);

  // Online equip ready
  const onlineEquipReady = useCallback(() => {
    socketRef.current?.emit('equip-ready');
  }, []);

  // Online battle action
  const onlineBattleAction = useCallback((skillIdx, targetIdx, targetSide) => {
    socketRef.current?.emit('battle-action', { skillIdx, targetIdx, targetSide, expectedRole: myRole });
  }, [myRole]);

  // ═══════════════════════════════════════════════════════════════
  // BUILD PVP FIGHTER (must be before startOnlineBattle)
  // ═══════════════════════════════════════════════════════════════

  const buildPvpFighter = useCallback((id, artifactsData, weaponsData, weaponCollectionData, side = 'player') => {
    const chibi = allPool[id];
    if (!chibi) return null;
    const lvData = coloData.chibiLevels[id] || { level: 1, xp: 0 };
    const allocated = coloData.statPoints[id] || {};
    const tb1 = computeTalentBonuses(coloData.talentTree[id] || {});
    const tb2 = computeTalentBonuses2(coloData.talentTree2?.[id]);
    const tb = mergeTalentBonuses(tb1, tb2);
    const artBonuses = computeArtifactBonuses(artifactsData?.[id]);
    const wId = weaponsData?.[id];
    const weapBonuses = computeWeaponBonuses(wId, weaponCollectionData?.[wId] || 0, coloData.weaponEnchants);
    const eqB = mergeEquipBonuses(artBonuses, weapBonuses);
    const evStars = HUNTERS[id] ? getHunterStars(raidData, id) : 0;
    const fs = statsAtFull(chibi.base, chibi.growth, lvData.level, allocated, tb, eqB, evStars, coloData.accountBonuses);

    const hunterPassive = HUNTERS[id] ? (HUNTER_PASSIVE_EFFECTS[id] || null) : null;

    // Permanent stat passives
    if (hunterPassive?.type === 'permanent' && hunterPassive.stats) {
      if (hunterPassive.stats.hp)   fs.hp  = Math.floor(fs.hp  * (1 + hunterPassive.stats.hp / 100));
      if (hunterPassive.stats.atk)  fs.atk = Math.floor(fs.atk * (1 + hunterPassive.stats.atk / 100));
      if (hunterPassive.stats.def)  fs.def = Math.floor(fs.def * (1 + hunterPassive.stats.def / 100));
      if (hunterPassive.stats.spd)  fs.spd = Math.floor(fs.spd * (1 + hunterPassive.stats.spd / 100));
      if (hunterPassive.stats.crit) fs.crit += hunterPassive.stats.crit;
      if (hunterPassive.stats.res)  fs.res += hunterPassive.stats.res;
    }

    // Merged talent bonuses with equip + passive injections
    const mergedTb = { ...tb };
    for (const [k, v] of Object.entries(eqB)) { if (v) mergedTb[k] = (mergedTb[k] || 0) + v; }
    if (hunterPassive) {
      if (hunterPassive.type === 'healBonus')   mergedTb.healBonus = (mergedTb.healBonus || 0) + hunterPassive.value;
      if (hunterPassive.type === 'critDmg')     mergedTb.critDamage = (mergedTb.critDamage || 0) + hunterPassive.value;
      if (hunterPassive.type === 'magicDmg')    mergedTb.allDamage = (mergedTb.allDamage || 0) + hunterPassive.value;
      if (hunterPassive.type === 'debuffBonus') mergedTb.debuffBonus = (mergedTb.debuffBonus || 0) + hunterPassive.value;
    }

    const manaCostMult = Math.max(0.5, 1 - (fs.manaCostReduce || 0) / 100);
    const intelCDR = getIntelCDR(fs.mana || 0);
    const skills = (chibi.skills || []).map((sk, i) => {
      const ts = coloData.talentSkills?.[id];
      const baseSk = (ts && ts.replacedSlot === i && TALENT_SKILLS[id]?.[ts.skillIndex]) ? TALENT_SKILLS[id][ts.skillIndex] : sk;
      const up = applySkillUpgrades(baseSk, coloData.skillUpgrades?.[id]?.[i] || 0);
      return { ...up, cd: 0, manaCost: Math.floor(getSkillManaCost(up, fs.mana) * manaCostMult) };
    });
    if (coloData.ultimateSkills?.[id] && ULTIMATE_SKILLS[id]) {
      const ult = ULTIMATE_SKILLS[id];
      skills.push({ ...ult, cd: 0, manaCost: Math.floor(ult.manaCost * manaCostMult), isUltimate: true });
    }

    const initBuffs = [];
    if (hunterPassive?.type === 'firstTurn' && hunterPassive.stats?.spd) {
      initBuffs.push({ type: 'spd', stat: 'spd', value: hunterPassive.stats.spd / 100, turns: 1 });
    }

    const weaponPassive = wId && WEAPONS[wId] ? WEAPONS[wId].passive : null;
    const artPassives = getActivePassives(artifactsData?.[id]);

    return {
      id, name: chibi.name, sprite: chibi.sprite || SPRITES[id], element: chibi.element,
      class: chibi.class || (HUNTERS[id]?.class) || 'fighter',
      rarity: chibi.rarity,
      hp: fs.hp, maxHp: fs.hp, atk: fs.atk, def: fs.def,
      spd: fs.spd, crit: Math.min(80, fs.crit), res: +(Math.min(85, fs.res)).toFixed(1),
      mana: fs.mana || 100, maxMana: fs.mana || 100, manaRegen: fs.manaRegen || BASE_MANA_REGEN,
      shield: 0, skills, buffs: initBuffs, alive: true,
      tb: mergedTb, level: lvData.level, side,
      hunterPassive, artPassives,
      isMage: HUNTERS[id]?.class === 'mage' || HUNTERS[id]?.class === 'support' || HUNTERS[id]?.class === 'tank',
      hunterClass: HUNTERS[id]?.class || 'fighter',
      weaponType: wId && WEAPONS[wId] ? WEAPONS[wId].weaponType : null,
      passiveState: {
        sianStacks: 0,
        ...(weaponPassive === 'sulfuras_fury' ? { sulfurasStacks: 0 } : {}),
        ...(weaponPassive === 'shadow_silence' ? { shadowSilence: [] } : {}),
        ...(weaponPassive === 'katana_z_fury' ? { katanaZStacks: 0 } : {}),
        ...(weaponPassive === 'katana_v_chaos' ? { katanaVState: { dots: 0, allStatBuff: 0, shield: false, nextDmgMult: 1 } } : {}),
        ...(weaponPassive === 'guldan_halo' ? { guldanState: { healStacks: 0, defBonus: 0, atkBonus: 0, spdStacks: 0 } } : {}),
      },
    };
  }, [allPool, coloData, raidData]);

  // Start online battle (build fighters locally)
  const startOnlineBattle = useCallback((p1Picks, p2Picks) => {
    const artData = tempArtifacts || coloData.artifacts;
    const wpnData = tempWeapons || coloData.weapons;
    const wpnCollData = tempWeaponCollection || coloData.weaponCollection;

    // My picks are the ones matching my role
    const myPicks = myRole === 'p1' ? p1Picks : p2Picks;
    const oppPicks = myRole === 'p1' ? p2Picks : p1Picks;

    const myFighters = myPicks.map(id => buildPvpFighter(id, artData, wpnData, wpnCollData, 'player')).filter(Boolean);
    const oppFighters = oppPicks.map(id => buildPvpFighter(id, artData, wpnData, wpnCollData, 'beru')).filter(Boolean);

    if (myFighters.length === 0 || oppFighters.length === 0) return;

    const entries = [
      ...myFighters.map((f, i) => ({ ...f, type: 'team', idx: i })),
      ...oppFighters.map((f, i) => ({ ...f, type: 'enemy', idx: i })),
    ];
    const turnOrder = buildSpdTurnOrder(entries);

    const battleState = {
      playerTeam: myFighters,
      beruTeam: oppFighters,
      turnOrder,
      currentTurn: 0,
      round: 1,
      phase: 'advance',
      globalTimer: BATTLE_TIME,
    };

    setBattle(battleState);
    setBattleLog([{ text: 'Le combat commence !', type: 'system' }]);
    setPendingSkill(null);
    setPhase('battle');
    setTimer(BATTLE_TIME);
    setTurnTimer(TURN_TIME);

    // Sync turn order with server
    socketRef.current?.emit('battle-sync', { turnOrder: turnOrder.map(e => ({ type: e.type, idx: e.idx, spd: e.spd })), currentTurn: 0, round: 1 });

    setTimeout(() => advanceBattle(battleState), 500);
  }, [myRole, tempArtifacts, tempWeapons, tempWeaponCollection, coloData, buildPvpFighter]);

  // Apply opponent's action locally
  const applyOnlineAction = useCallback((from, skillIdx, targetIdx, targetSide) => {
    // This will be called when opponent sends their action via server
    // For now, the battle engine handles it similarly to AI turns
    // In a complete implementation, we'd replay the exact action
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // BERU DRAFT AI
  // ═══════════════════════════════════════════════════════════════

  const scoreHunter = useCallback((id) => {
    const chibi = allPool[id];
    if (!chibi) return 0;
    const lvData = coloData.chibiLevels[id] || { level: 1, xp: 0 };
    const base = chibi.base;
    const growth = chibi.growth;
    const lv = lvData.level;
    const atk = base.atk + growth.atk * (lv - 1);
    const spd = base.spd + growth.spd * (lv - 1);
    const crit = base.crit + growth.crit * (lv - 1);
    const hp = base.hp + growth.hp * (lv - 1);
    const def = base.def + growth.def * (lv - 1);
    // Score: weighted DPS + bulk
    return Math.floor(atk * 2 + crit * 3 + spd * 1.5 + hp * 0.3 + def * 0.5 + lv * 5);
  }, [allPool, coloData]);

  const beruDraftBan = useCallback((pool, playerPicks) => {
    // Ban the strongest hunter the player might want
    const scored = pool
      .filter(id => !playerPicks.includes(id))
      .map(id => ({ id, score: scoreHunter(id) }))
      .sort((a, b) => b.score - a.score);
    return scored[0]?.id || pool[0];
  }, [scoreHunter]);

  const beruDraftPick = useCallback((pool, beruPicks, playerPicks) => {
    const scored = pool.map(id => {
      let score = scoreHunter(id);
      const chibi = allPool[id];
      if (!chibi) return { id, score: 0 };

      // Bonus for element counter against player picks
      playerPicks.forEach(pid => {
        const pc = allPool[pid];
        if (pc && ELEMENTS[chibi.element]?.beats === pc.element) score += 200;
      });

      // Bonus for team balance
      const beruElements = beruPicks.map(bid => allPool[bid]?.element).filter(Boolean);
      const beruClasses = beruPicks.map(bid => HUNTERS[bid]?.class || allPool[bid]?.class || 'fighter');
      if (!beruElements.includes(chibi.element)) score += 100; // element diversity
      const cls = HUNTERS[id]?.class || 'fighter';
      if (beruPicks.length === 0 && (cls === 'fighter' || cls === 'mage')) score += 150; // first pick: DPS
      if (beruPicks.length === 1 && !beruClasses.includes('support') && cls === 'support') score += 200;
      if (beruPicks.length === 2 && !beruClasses.includes('tank') && cls === 'tank') score += 150;

      return { id, score };
    }).sort((a, b) => b.score - a.score);

    return scored[0]?.id || pool[0];
  }, [scoreHunter, allPool]);

  // ═══════════════════════════════════════════════════════════════
  // DRAFT LOGIC
  // ═══════════════════════════════════════════════════════════════

  const startDraft = useCallback(() => {
    const poolIds = Object.keys(allPool);
    if (poolIds.length < 10) {
      beruSay("Pas assez de hunters ! Il faut au moins 10 hunters dans ta box !", 'panic');
      return;
    }
    setDraftPool(poolIds);
    setBans({ p1: [], p2: [] });
    setPicks({ p1: [], p2: [] });
    setDraftStep(0);
    setSelectedForDraft(null);
    setPhase('draft');
    setTimer(DRAFT_TIME);
    beruSay("Phase de Draft ! Beru va constituer la MEILLEURE equipe !", 'excited');
  }, [allPool]);

  // In online mode, my role determines whose turn it is; in AI mode, player is always p1
  const myDraftRole = mode === 'online' ? (myRole || 'p1') : 'p1';
  const isPlayerTurn = draftStep < DRAFT_SEQUENCE.length && DRAFT_SEQUENCE[draftStep]?.startsWith(myDraftRole);
  const currentAction = draftStep < DRAFT_SEQUENCE.length ? DRAFT_SEQUENCE[draftStep] : null;

  const confirmDraftAction = useCallback((hunterId) => {
    if (!hunterId || draftStep >= DRAFT_SEQUENCE.length) return;

    // Online mode: send action to server, state will update via socket events
    if (mode === 'online') {
      onlineDraftAction(hunterId);
      setSelectedForDraft(null);
      return;
    }

    // AI mode: local state update
    const action = DRAFT_SEQUENCE[draftStep];
    const newPool = draftPool.filter(id => id !== hunterId);

    if (action.includes('ban')) {
      const who = action.startsWith('p1') ? 'p1' : 'p2';
      setBans(prev => ({ ...prev, [who]: [...prev[who], hunterId] }));
      if (who === 'p1') beruSay(randMsg(BERU_DRAFT.ban_beru), 'thinking');
    } else {
      const who = action.startsWith('p1') ? 'p1' : 'p2';
      setPicks(prev => ({ ...prev, [who]: [...prev[who], hunterId] }));
      if (who === 'p2') {
        const score = scoreHunter(hunterId);
        const topScore = Math.max(...newPool.map(id => scoreHunter(id)), 0);
        if (score > topScore * 0.9) {
          beruSay(randMsg(BERU_DRAFT.steal), 'confident');
        } else {
          beruSay(randMsg(BERU_DRAFT.pick_good), 'excited');
        }
      }
    }

    setDraftPool(newPool);
    setSelectedForDraft(null);
    setDraftStep(prev => prev + 1);
  }, [draftStep, draftPool, scoreHunter, mode, onlineDraftAction]);

  // Beru auto-play on their turn (AI mode only)
  useEffect(() => {
    if (mode === 'online') return; // Online: server handles opponent turns
    if (phase !== 'draft') return;
    if (draftStep >= DRAFT_SEQUENCE.length) return;
    const action = DRAFT_SEQUENCE[draftStep];
    if (!action.startsWith('p2')) return;

    const timeout = setTimeout(() => {
      if (action.includes('ban')) {
        const choice = beruDraftBan(draftPool, picks.p1);
        beruSay(randMsg(BERU_DRAFT.ban_player), 'confident');
        confirmDraftAction(choice);
      } else {
        beruSay(randMsg(BERU_DRAFT.think), 'thinking');
        setTimeout(() => {
          const choice = beruDraftPick(draftPool, picks.p2, picks.p1);
          confirmDraftAction(choice);
        }, 800);
      }
    }, 1200);

    return () => clearTimeout(timeout);
  }, [phase, draftStep, draftPool, picks, confirmDraftAction, beruDraftBan, beruDraftPick]);

  // Draft complete → move to equip
  useEffect(() => {
    if (phase !== 'draft') return;
    if (draftStep >= DRAFT_SEQUENCE.length) {
      setTimeout(() => startEquipPhase(), 1500);
    }
  }, [phase, draftStep]);

  // ═══════════════════════════════════════════════════════════════
  // EQUIP PHASE
  // ═══════════════════════════════════════════════════════════════

  const startEquipPhase = useCallback(() => {
    // Deep clone equipment — changes here are NOT saved
    const artClone = JSON.parse(JSON.stringify(coloData.artifacts || {}));
    const wpnClone = JSON.parse(JSON.stringify(coloData.weapons || {}));
    const wpnCollClone = JSON.parse(JSON.stringify(coloData.weaponCollection || {}));
    const artInvClone = JSON.parse(JSON.stringify(coloData.artifactInventory || []));
    setTempArtifacts(artClone);
    setTempWeapons(wpnClone);
    setTempWeaponCollection(wpnCollClone);
    setTempArtifactInventory(artInvClone);
    setEquipFocusHunter(0);
    setEqInvFilter({ slot: null, set: null });
    setPhase('equip');
    setTimer(EQUIP_TIME);
    beruSay(randMsg(BERU_EQUIP.start), 'thinking');
  }, [coloData]);

  const swapWeapon = useCallback((hunterId, newWeaponId) => {
    setTempWeapons(prev => {
      const next = { ...prev };
      // Unequip from any other hunter who has this weapon
      Object.keys(next).forEach(k => { if (next[k] === newWeaponId) next[k] = null; });
      next[hunterId] = newWeaponId;
      return next;
    });
  }, []);

  const getAvailableWeapons = useCallback((hunterId) => {
    if (!tempWeaponCollection) return [];
    const equippedWeapons = new Set(
      Object.values(tempWeapons || {}).filter(Boolean)
    );
    const currentWeapon = tempWeapons?.[hunterId];
    return Object.keys(tempWeaponCollection).filter(wId =>
      wId === currentWeapon || !equippedWeapons.has(wId)
    );
  }, [tempWeapons, tempWeaponCollection]);

  const getHunterSets = useCallback((hunterId) => {
    if (!tempArtifacts?.[hunterId]) return [];
    const setCounts = {};
    Object.values(tempArtifacts[hunterId]).forEach(art => {
      if (art?.set) setCounts[art.set] = (setCounts[art.set] || 0) + 1;
    });
    return Object.entries(setCounts).map(([setId, count]) => ({ setId, count, ...(ALL_ARTIFACT_SETS[setId] || {}) }));
  }, [tempArtifacts]);

  const swapArtifactSet = useCallback((fromHunterId, toHunterId, setId) => {
    setTempArtifacts(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const fromArts = next[fromHunterId] || {};
      const toArts = next[toHunterId] || {};
      const SLOTS = ['helmet','chest','gloves','boots','necklace','bracelet','ring','earring'];
      SLOTS.forEach(slot => {
        if (fromArts[slot]?.set === setId) {
          const temp = toArts[slot];
          toArts[slot] = fromArts[slot];
          fromArts[slot] = temp;
        }
      });
      next[fromHunterId] = fromArts;
      next[toHunterId] = toArts;
      return next;
    });
  }, []);

  // ─── Equip a single artifact from inventory to focused hunter (TEMP only) ───
  const equipArtifactFromInv = useCallback((art, hunterId) => {
    // Atomically: remove art from inventory, equip it, return displaced piece to inventory
    const currentArts = tempArtifacts?.[hunterId] || {};
    const displaced = currentArts[art.slot]; // piece being replaced (may be null)

    setTempArtifacts(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      if (!next[hunterId]) next[hunterId] = {};
      next[hunterId][art.slot] = art;
      return next;
    });

    setTempArtifactInventory(prev => {
      let inv = prev.filter(a => a.uid !== art.uid);
      if (displaced) inv.push(displaced);
      return inv;
    });
  }, [tempArtifacts]);

  // ─── Auto-Equip PVP: shared set-first algorithm (TEMP only) ───
  const autoEquipPvp = useCallback((hunterId) => {
    const c = allPool[hunterId];
    if (!c || !tempArtifactInventory) return;

    const hClass = HUNTERS[hunterId]?.class || 'fighter';
    const hElement = c.element || 'fire';

    // Pool: inventory + currently equipped on this hunter
    const currentEquipped = tempArtifacts?.[hunterId] || {};
    let pool = [...tempArtifactInventory];
    SLOT_ORDER.forEach(slot => {
      if (currentEquipped[slot]) pool.push(currentEquipped[slot]);
    });

    // Run shared set-first algorithm (with set tiers, 8p/4p/2p plans, etc.)
    const { assigned, usedUids, setLabels } = autoEquipSetFirst(hClass, hElement, pool);

    // Update temp state (NEVER saves to coloData)
    setTempArtifacts(prev => ({ ...prev, [hunterId]: assigned }));
    setTempArtifactInventory(pool.filter(a => !usedUids.has(a.uid)));

    // Beru reaction with set info
    const idealStats = CLASS_IDEAL_STATS[hClass] || CLASS_IDEAL_STATS.fighter;
    const rerollSlots = [];
    Object.entries(assigned).forEach(([slot, art]) => {
      if (!art) return;
      if (idealStats.mainStats[slot] && art.mainStat !== idealStats.mainStats[slot]) {
        rerollSlots.push(slot);
      }
    });

    let msg = setLabels ? `Auto-equip ! ${setLabels}` : 'Meilleurs artefacts equipes !';
    if (rerollSlots.length > 0) {
      msg += ` (${rerollSlots.length} slot${rerollSlots.length > 1 ? 's' : ''} a reroll)`;
    }
    beruSay(msg, 'excited');
  }, [tempArtifacts, tempArtifactInventory, allPool, beruSay]);

  // Beru auto-equips: assign best weapons to Beru's picks
  const beruAutoEquip = useCallback(() => {
    if (!tempWeaponCollection || picks.p2.length === 0) return;
    const beruPicks = picks.p2;
    const playerEquipped = new Set(picks.p1.map(id => tempWeapons?.[id]).filter(Boolean));

    // Available weapons not equipped by player
    const availWeapons = Object.keys(tempWeaponCollection)
      .filter(wId => !playerEquipped.has(wId))
      .map(wId => ({ id: wId, ...(WEAPONS[wId] || {}), awakening: tempWeaponCollection[wId] || 0 }))
      .sort((a, b) => (b.atk || 0) - (a.atk || 0));

    const assigned = new Set();
    const newWeapons = { ...tempWeapons };

    beruPicks.forEach(hId => {
      const best = availWeapons.find(w => !assigned.has(w.id));
      if (best) {
        newWeapons[hId] = best.id;
        assigned.add(best.id);
      }
    });

    setTempWeapons(newWeapons);
  }, [tempWeapons, tempWeaponCollection, picks]);

  useEffect(() => {
    if (phase === 'equip') {
      setTimeout(() => {
        beruAutoEquip();
        beruSay(randMsg(BERU_EQUIP.done), 'excited');
      }, 2000);
    }
  }, [phase]);

  // ═══════════════════════════════════════════════════════════════
  // BATTLE ENGINE
  // ═══════════════════════════════════════════════════════════════

  const startBattle = useCallback(() => {
    const artData = tempArtifacts || coloData.artifacts;
    const wpnData = tempWeapons || coloData.weapons;
    const wpnCollData = tempWeaponCollection || coloData.weaponCollection;

    const playerFighters = picks.p1.map(id => buildPvpFighter(id, artData, wpnData, wpnCollData, 'player')).filter(Boolean);
    const beruFighters = picks.p2.map(id => buildPvpFighter(id, artData, wpnData, wpnCollData, 'beru')).filter(Boolean);

    if (playerFighters.length === 0 || beruFighters.length === 0) return;

    // Apply team passives
    const applyTeamPassives = (team) => {
      // teamDef passive (Reed)
      const teamDefValue = team.reduce((sum, f) => {
        if (f.hunterPassive?.type === 'teamDef') return sum + (f.hunterPassive.value || 0);
        return sum;
      }, 0);
      if (teamDefValue > 0) team.forEach(f => { f.def = Math.floor(f.def * (1 + teamDefValue / 100)); });

      // teamAura passives (Pascal)
      team.forEach(f => {
        if (f.hunterPassive?.type === 'teamAura' && f.hunterPassive.stats) {
          Object.entries(f.hunterPassive.stats).forEach(([stat, pct]) => {
            team.forEach(ally => { ally.buffs.push({ stat, value: pct / 100, dur: 999 }); });
          });
        }
      });

      // Awakening passives
      team.forEach(f => {
        if (!f.id || !HUNTERS[f.id]) return;
        const stars = getHunterStars(raidData, f.id);
        const awPassives = getAwakeningPassives(f.id, stars);
        awPassives.forEach(ap => {
          if (ap.type === 'teamElementalDmg') {
            const count = team.filter(ally => ally.element === ap.element).length;
            const bonus = count * ap.pctPerAlly;
            if (bonus > 0) {
              const dmgKey = `${ap.element}Damage`;
              team.forEach(ally => { ally.tb[dmgKey] = (ally.tb[dmgKey] || 0) + bonus; });
            }
          }
        });
      });

      // Synergies
      const synergyTeam = team.map(f => allPool[f.id]).filter(Boolean);
      const { bonuses } = computeSynergies(synergyTeam);
      team.forEach(f => {
        f.hp = Math.floor(f.hp * (1 + (bonuses.hp + bonuses.allStats) / 100));
        f.maxHp = f.hp;
        f.atk = Math.floor(f.atk * (1 + (bonuses.atk + bonuses.allStats) / 100));
        f.def = Math.floor(f.def * (1 + (bonuses.def + bonuses.allStats) / 100));
        f.spd = Math.floor(f.spd * (1 + (bonuses.spd + bonuses.allStats) / 100));
        f.crit = +(f.crit + (bonuses.crit || 0)).toFixed(1);
        f.res = +(f.res + (bonuses.res || 0)).toFixed(1);
      });
    };

    applyTeamPassives(playerFighters);
    applyTeamPassives(beruFighters);

    // Build turn order
    const entries = [
      ...playerFighters.map((f, i) => ({ ...f, type: 'team', idx: i })),
      ...beruFighters.map((f, i) => ({ ...f, type: 'enemy', idx: i })),
    ];
    const turnOrder = buildSpdTurnOrder(entries);

    const battleState = {
      playerTeam: playerFighters,
      beruTeam: beruFighters,
      turnOrder,
      currentTurn: 0,
      round: 1,
      phase: 'advance', // will resolve to pick or enemy_act
      globalTimer: BATTLE_TIME,
    };

    setBattle(battleState);
    setBattleLog([{ text: 'Le combat commence !', type: 'system' }]);
    setPendingSkill(null);
    setPhase('battle');
    setTimer(BATTLE_TIME);
    setTurnTimer(TURN_TIME);
    beruSay(randMsg(BERU_BATTLE.start), 'excited');

    // Advance to first actual turn
    setTimeout(() => advanceBattle(battleState), 500);
  }, [picks, tempArtifacts, tempWeapons, tempWeaponCollection, coloData, buildPvpFighter, raidData, allPool]);

  // Advance to next active turn
  const advanceBattle = useCallback((state) => {
    if (!state) return;
    let { turnOrder, currentTurn, round, playerTeam, beruTeam } = state;

    // Find next alive unit
    let attempts = 0;
    while (attempts < turnOrder.length * 2) {
      if (currentTurn >= turnOrder.length) {
        currentTurn = 0;
        round += 1;
        // Tick buffs and regen mana each round
        [...playerTeam, ...beruTeam].forEach(f => {
          if (!f.alive) return;
          f.mana = Math.min(f.maxMana, f.mana + (f.manaRegen || BASE_MANA_REGEN));
          f.skills.forEach(sk => { if (sk.cd > 0) sk.cd -= 1; });
          f.buffs = f.buffs.filter(b => { b.turns -= 1; return b.turns > 0; });
        });
      }

      const entry = turnOrder[currentTurn];
      const team = entry.type === 'team' ? playerTeam : beruTeam;
      const unit = team[entry.idx];
      if (unit && unit.alive) break;
      currentTurn++;
      attempts++;
    }

    // Check win/loss
    const playerAlive = playerTeam.filter(f => f.alive).length;
    const beruAlive = beruTeam.filter(f => f.alive).length;

    if (playerAlive === 0 || beruAlive === 0) {
      const newState = { ...state, currentTurn, round, phase: playerAlive > 0 ? 'victory' : 'defeat' };
      setBattle(newState);
      endBattle(playerAlive > 0);
      return;
    }

    const entry = turnOrder[currentTurn];
    const isPlayerUnit = entry.type === 'team';
    const newPhase = isPlayerUnit ? 'pick' : 'enemy_act';

    const newState = { ...state, currentTurn, round, phase: newPhase };
    setBattle(newState);
    setTurnTimer(TURN_TIME);

    if (!isPlayerUnit) {
      // Beru AI acts
      setTimeout(() => executeBeraTurn(newState), 800);
    }
  }, []);

  // Execute Beru's turn
  const executeBeraTurn = useCallback((state) => {
    if (!state) return;
    const { turnOrder, currentTurn, playerTeam, beruTeam } = state;
    const entry = turnOrder[currentTurn];
    const unit = beruTeam[entry.idx];
    if (!unit || !unit.alive) {
      advanceToNextTurn(state);
      return;
    }

    // Use AI to pick skill and target
    const aiDecision = aiPickSkillArc2(unit, beruTeam, playerTeam);
    const { skill, target, targetType } = aiDecision;

    if (!skill) {
      advanceToNextTurn(state);
      return;
    }

    // Check mana
    if (skill.manaCost && unit.mana < skill.manaCost) {
      // Fallback to basic attack
      const basic = unit.skills[0];
      const basicTarget = playerTeam.filter(f => f.alive)[0];
      executeAction(state, unit, basic, basicTarget, 'beru');
      return;
    }

    let actualTarget = target;
    if (targetType === 'player') {
      actualTarget = target && target.alive ? target : playerTeam.filter(f => f.alive)[0];
    } else if (targetType === 'ally') {
      actualTarget = target && target.alive ? target : beruTeam.filter(f => f.alive)[0];
    } else {
      actualTarget = unit; // self
    }

    executeAction(state, unit, skill, actualTarget, 'beru');
  }, []);

  // Player action
  const playerSelectSkill = useCallback((skillIdx) => {
    if (!battle || battle.phase !== 'pick') return;
    const entry = battle.turnOrder[battle.currentTurn];
    const unit = battle.playerTeam[entry.idx];
    if (!unit || !unit.alive) return;

    const skill = unit.skills[skillIdx];
    if (!skill || skill.cd > 0) return;
    if (skill.manaCost && unit.mana < skill.manaCost) return;

    if (skill.healSelf) {
      if (mode === 'online') onlineBattleAction(skillIdx, entry.idx, 'self');
      executeAction(battle, unit, skill, unit, 'player');
    } else if (skill.buffAtk || skill.buffDef || skill.buffSpd) {
      if (mode === 'online') onlineBattleAction(skillIdx, entry.idx, 'self');
      executeAction(battle, unit, skill, unit, 'player');
    } else if (skill.healAlly || skill.buffAllyAtk || skill.buffAllyDef) {
      setPendingSkill({ skill, skillIdx, targetType: 'ally' });
      setBattle(prev => prev ? { ...prev, phase: 'pick_ally' } : null);
    } else {
      setPendingSkill({ skill, skillIdx, targetType: 'enemy' });
      setBattle(prev => prev ? { ...prev, phase: 'pick_target' } : null);
    }
  }, [battle, mode, onlineBattleAction]);

  const playerSelectTarget = useCallback((targetIdx) => {
    if (!battle || !pendingSkill) return;
    const entry = battle.turnOrder[battle.currentTurn];
    const unit = battle.playerTeam[entry.idx];
    if (!unit) return;

    const targetTeam = pendingSkill.targetType === 'ally' ? battle.playerTeam : battle.beruTeam;
    const target = targetTeam[targetIdx];
    if (!target || !target.alive) return;

    if (mode === 'online') onlineBattleAction(pendingSkill.skillIdx, targetIdx, pendingSkill.targetType);
    executeAction(battle, unit, pendingSkill.skill, target, 'player');
    setPendingSkill(null);
  }, [battle, pendingSkill, mode, onlineBattleAction]);

  // Core action execution
  const executeAction = useCallback((state, attacker, skill, target, side) => {
    if (!state || !attacker || !skill || !target) return;
    const { playerTeam, beruTeam } = state;

    // Deduct mana
    if (skill.manaCost) attacker.mana = Math.max(0, attacker.mana - skill.manaCost);

    // Set cooldown
    if (skill.cdMax > 0) skill.cd = skill.cdMax;

    // Compute attack result
    const defender = target;
    const res = computeAttack(attacker, skill, defender, attacker.tb || {});

    // Apply damage
    let koOccurred = false;
    if (res.damage > 0) {
      // Shield absorb first
      if (defender.shield > 0) {
        const absorbed = Math.min(defender.shield, res.damage);
        defender.shield -= absorbed;
        res.damage -= absorbed;
      }
      defender.hp = Math.max(0, defender.hp - res.damage);
      if (defender.hp <= 0) {
        defender.alive = false;
        koOccurred = true;
      }
    }

    // Apply heal
    if (res.healed > 0) {
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + res.healed);
    }

    // Push damage/heal popups for the floating numbers
    const now = Date.now();
    if (res.damage > 0) {
      setDamagePopups(prev => [...prev, { id: now + '_dmg', fighterId: defender.id, value: res.damage, isCrit: res.isCrit, type: 'damage', timestamp: now }]);
    }
    if (res.healed > 0) {
      setDamagePopups(prev => [...prev, { id: now + '_heal', fighterId: attacker.id, value: res.healed, isCrit: false, type: 'heal', timestamp: now }]);
    }

    // Apply buff
    if (res.buff) {
      const buffTarget = skill.buffAllyAtk || skill.buffAllyDef ? target : attacker;
      buffTarget.buffs.push({ ...res.buff });
    }

    // Apply debuff to defender
    if (res.debuff) {
      defender.buffs.push({ ...res.debuff });
    }

    // Log entry
    const logEntry = {
      text: res.text,
      type: side === 'player' ? 'player' : 'beru',
      isCrit: res.isCrit,
      damage: res.damage,
      healed: res.healed,
      ko: koOccurred,
    };
    setBattleLog(prev => [...prev, logEntry]);

    // Beru personality reactions
    if (side === 'beru') {
      if (koOccurred) beruSay(randMsg(BERU_BATTLE.ko_beru), 'confident');
      else if (res.isCrit) beruSay(randMsg(BERU_BATTLE.crit_beru), 'excited');
      else if (res.healed > 0) beruSay(randMsg(BERU_BATTLE.heal), 'thinking');
    } else {
      if (koOccurred) beruSay(randMsg(BERU_BATTLE.ko_player), 'panic');
      else if (res.isCrit) beruSay(randMsg(BERU_BATTLE.crit_player), 'panic');
    }

    // Advance
    const newState = { ...state, currentTurn: state.currentTurn + 1 };
    setBattle(newState);
    setTimeout(() => advanceBattle(newState), 600);
  }, [advanceBattle]);

  const advanceToNextTurn = useCallback((state) => {
    const newState = { ...state, currentTurn: state.currentTurn + 1 };
    setBattle(newState);
    advanceBattle(newState);
  }, [advanceBattle]);

  // ═══════════════════════════════════════════════════════════════
  // TIMER MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  // Phase timer (draft / equip / battle)
  useEffect(() => {
    if (phase !== 'draft' && phase !== 'equip' && phase !== 'battle') return;
    if (timer <= 0) {
      if (phase === 'draft') {
        // Auto-complete draft with random picks
        // Just advance to equip with whatever we have
        if (draftStep < DRAFT_SEQUENCE.length) {
          // Force skip remaining
          setDraftStep(DRAFT_SEQUENCE.length);
        }
      } else if (phase === 'equip') {
        startBattle();
      } else if (phase === 'battle') {
        // Time's up — compare HP%
        if (battle) {
          const playerHpPct = battle.playerTeam.filter(f => f.alive).reduce((s, f) => s + f.hp / f.maxHp, 0);
          const beruHpPct = battle.beruTeam.filter(f => f.alive).reduce((s, f) => s + f.hp / f.maxHp, 0);
          const playerWon = playerHpPct >= beruHpPct;
          endBattle(playerWon);
        }
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase, timer > 0]); // eslint-disable-line

  // Turn timer (battle only)
  useEffect(() => {
    if (phase !== 'battle' || !battle || battle.phase !== 'pick') return;
    if (turnTimer <= 0) {
      // Auto-pass: regen mana only
      const entry = battle.turnOrder[battle.currentTurn];
      if (entry) {
        const unit = battle.playerTeam[entry.idx];
        if (unit && unit.alive) {
          unit.mana = Math.min(unit.maxMana, unit.mana + (unit.manaRegen || BASE_MANA_REGEN));
          setBattleLog(prev => [...prev, { text: `${unit.name} passe son tour (temps ecoule)`, type: 'system' }]);
        }
      }
      advanceToNextTurn(battle);
      return;
    }

    turnTimerRef.current = setInterval(() => {
      setTurnTimer(prev => prev <= 1 ? 0 : prev - 1);
    }, 1000);

    return () => clearInterval(turnTimerRef.current);
  }, [phase, battle?.phase, turnTimer > 0]); // eslint-disable-line

  // Reset turn timer when phase changes to 'pick'
  useEffect(() => {
    if (battle?.phase === 'pick') setTurnTimer(TURN_TIME);
  }, [battle?.phase, battle?.currentTurn]);

  // ═══════════════════════════════════════════════════════════════
  // RESULT + REWARDS
  // ═══════════════════════════════════════════════════════════════

  const endBattle = useCallback((playerWon) => {
    setPhase('result');
    clearInterval(timerRef.current);
    clearInterval(turnTimerRef.current);

    // Load daily tracking
    const dailyKey = new Date().toISOString().slice(0, 10);
    let daily;
    try {
      daily = JSON.parse(localStorage.getItem(PVP_LIVE_DAILY_KEY) || '{}');
      if (daily.date !== dailyKey) daily = { date: dailyKey, hammers: 0, alkahest: 0, games: 0 };
    } catch { daily = { date: dailyKey, hammers: 0, alkahest: 0, games: 0 }; }

    const base = playerWon ? REWARDS.win : REWARDS.lose;
    let h = base.hammers;
    let a = base.alkahest;

    if (daily.hammers >= REWARDS.dailyCap.hammers) h = Math.floor(h / REWARDS.postCapDivisor);
    if (daily.alkahest >= REWARDS.dailyCap.alkahest) a = Math.floor(a / REWARDS.postCapDivisor);

    daily.hammers += h;
    daily.alkahest += a;
    daily.games += 1;
    localStorage.setItem(PVP_LIVE_DAILY_KEY, JSON.stringify(daily));

    // Actually award rewards
    const cd = loadColoData();
    cd.hammers.marteau_forge = (cd.hammers.marteau_forge || 0) + h;
    cd.alkahest = (cd.alkahest || 0) + a;
    saveColoData(cd);
    setColoData(cd);

    setResult({
      won: playerWon,
      rewards: { hammers: h, alkahest: a },
      stats: {
        playerHp: battle?.playerTeam.filter(f => f.alive).reduce((s, f) => s + f.hp, 0) || 0,
        beruHp: battle?.beruTeam.filter(f => f.alive).reduce((s, f) => s + f.hp, 0) || 0,
        playerAlive: battle?.playerTeam.filter(f => f.alive).length || 0,
        beruAlive: battle?.beruTeam.filter(f => f.alive).length || 0,
      },
      daily,
    });

    if (playerWon) {
      beruSay(randMsg(BERU_RESULT.lose), 'panic');
      window.dispatchEvent(new CustomEvent('beru-react', {
        detail: { message: randMsg(BERU_RESULT.lose), mood: 'scared', duration: 6000, animation: 'shake' },
      }));
    } else {
      beruSay(randMsg(BERU_RESULT.win), 'confident');
      window.dispatchEvent(new CustomEvent('beru-react', {
        detail: { message: randMsg(BERU_RESULT.win), mood: 'excited', duration: 6000, animation: 'bounce' },
      }));
    }
  }, [battle]);

  // ═══════════════════════════════════════════════════════════════
  // BERU PERSONALITY
  // ═══════════════════════════════════════════════════════════════

  const beruSay = (msg, mood = 'excited') => {
    const moodMap = { panic: 'scared', confident: 'happy', thinking: 'thinking' };
    window.dispatchEvent(new CustomEvent('beru-react', {
      detail: {
        message: msg,
        mood: moodMap[mood] || 'excited',
        duration: mood === 'panic' ? 5000 : 4000,
        animation: mood === 'panic' ? 'shake' : mood === 'confident' ? 'bounce' : 'bounce',
      },
    }));
  };

  // ─── Beru Interactive Reactions ─────────────────────────────
  // Listen for beru-hide / beru-calm events from the floating mascot
  useEffect(() => {
    const handleBeruHide = () => {
      // Beru was hidden — he comes back angry after 3s
      setTimeout(() => {
        beruSay(randMsg(BERU_INTERACTIVE.hidden), 'panic');
      }, 3000);
    };
    const handleBeruCalm = () => {
      // Someone tried to calm Beru — he gets MORE energetic
      beruSay(randMsg(BERU_INTERACTIVE.calmed), 'panic');
    };
    const handleBeruPoke = () => {
      beruSay(randMsg(BERU_INTERACTIVE.poked), 'panic');
    };
    window.addEventListener('beru-hide', handleBeruHide);
    window.addEventListener('beru-calm', handleBeruCalm);
    window.addEventListener('beru-poke', handleBeruPoke);
    return () => {
      window.removeEventListener('beru-hide', handleBeruHide);
      window.removeEventListener('beru-calm', handleBeruCalm);
      window.removeEventListener('beru-poke', handleBeruPoke);
    };
  }, []);

  // Reset to lobby
  const resetToLobby = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setPhase('lobby');
    setMode(null);
    setBattle(null);
    setResult(null);
    setBattleLog([]);
    setPendingSkill(null);
    setTempArtifacts(null);
    setTempWeapons(null);
    setTempWeaponCollection(null);
    setTempArtifactInventory(null);
    setEqInvFilter({ slot: null, set: null });
    setBeruAdvice(null);
    setDraftFilter({ element: null, class: null });
    setHoveredTarget(null);
    setInspectedFighter(null);
    setDamagePopups([]);
    setTimer(0);
    setRoomCode('');
    setJoinCode('');
    setOpponent(null);
    setMyRole(null);
    setOnlineStatus('idle');
    setOnlineError('');
  };

  // Scroll battle log
  useEffect(() => {
    if (battleLogRef.current) {
      battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight;
    }
  }, [battleLog]);

  // Auto-remove damage popups after 1.5s
  useEffect(() => {
    if (damagePopups.length === 0) return;
    const timer = setTimeout(() => {
      const cutoff = Date.now() - 1500;
      setDamagePopups(prev => prev.filter(p => p.timestamp > cutoff));
    }, 1600);
    return () => clearTimeout(timer);
  }, [damagePopups]);

  // ═══════════════════════════════════════════════════════════════
  // DAMAGE / HEAL PREVIEW
  // ═══════════════════════════════════════════════════════════════

  const estimateDamage = useCallback((attacker, skill, defender) => {
    if (!attacker || !skill || !defender) return null;
    if (skill.power <= 0 && !skill.healSelf && !skill.healAlly) return null;

    if (skill.healSelf > 0) {
      const healAmt = Math.floor(attacker.maxHp * skill.healSelf / 100);
      return { type: 'heal', value: healAmt };
    }
    if (skill.healAlly > 0) {
      return { type: 'heal', value: Math.floor(attacker.maxHp * (skill.healAlly || skill.power || 10) / 100) };
    }
    if (skill.power > 0) {
      let effAtk = getEffStat(attacker.atk, attacker.buffs, 'atk');
      if (attacker.isMage && attacker.maxMana) {
        const manaMult = attacker.hunterClass === 'support' ? 0.8 : attacker.hunterClass === 'tank' ? 1.0 : 1.2;
        effAtk = Math.floor(attacker.maxMana * manaMult);
      }
      const raw = effAtk * (skill.power / 100);
      const effDef = getEffStat(defender.def, defender.buffs || [], 'def');
      const defFactor = 100 / (100 + Math.max(0, effDef));
      const dmg = Math.floor(raw * defFactor);
      const elemMult = getElementMult(attacker.element, defender.element);
      return { type: 'damage', value: Math.floor(dmg * elemMult), elemMult };
    }
    return null;
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════

  const HunterCard = ({ id, onClick, selected, banned, picked, small }) => {
    const chibi = allPool[id];
    if (!chibi) return null;
    const elem = ELEMENTS[chibi.element];
    const rar = RARITY[chibi.rarity];
    const lvData = coloData.chibiLevels[id] || { level: 1 };
    const disabled = banned || picked;
    return (
      <motion.button
        whileHover={disabled ? {} : { scale: 1.05 }}
        whileTap={disabled ? {} : { scale: 0.95 }}
        onClick={() => !disabled && onClick?.(id)}
        className={`relative rounded-lg border p-1.5 transition-all ${small ? 'w-16' : 'w-20'} ${
          disabled ? 'opacity-30 cursor-not-allowed border-gray-700 bg-gray-900/50' :
          selected ? 'border-purple-400 bg-purple-900/40 ring-2 ring-purple-400/50' :
          'border-gray-700 bg-gray-800/50 hover:border-gray-500'
        }`}
      >
        <img src={chibi.sprite || SPRITES[id]} alt={chibi.name} className={`${small ? 'w-10 h-10' : 'w-14 h-14'} mx-auto rounded object-contain`} />
        <p className={`text-[9px] truncate text-center mt-0.5 ${rar?.color || 'text-gray-300'}`}>{chibi.name}</p>
        <div className="flex items-center justify-center gap-0.5">
          <span className="text-[8px]">{elem?.icon}</span>
          <span className="text-[8px] text-gray-500">Lv{lvData.level}</span>
        </div>
        {banned && <div className="absolute inset-0 flex items-center justify-center bg-red-900/50 rounded-lg"><span className="text-red-400 text-lg font-bold">BAN</span></div>}
        {picked && !banned && <div className="absolute inset-0 flex items-center justify-center bg-green-900/30 rounded-lg"><span className="text-green-400 text-[10px]">PICK</span></div>}
      </motion.button>
    );
  };

  const FighterPortrait = ({ fighter, isActive, showHp = true, onClick }) => {
    if (!fighter) return null;
    const hpPct = fighter.maxHp > 0 ? (fighter.hp / fighter.maxHp * 100) : 0;
    const manaPct = fighter.maxMana > 0 ? (fighter.mana / fighter.maxMana * 100) : 0;
    const elem = ELEMENTS[fighter.element];

    // Ghost HP bar: track previous HP percentage with a ref
    const prevHpPctRef = useRef(hpPct);
    const ghostHpPct = useRef(hpPct);

    useEffect(() => {
      if (hpPct < prevHpPctRef.current) {
        // Damage was taken — set ghost to old value, then let CSS transition shrink it
        ghostHpPct.current = prevHpPctRef.current;
      }
      const timeout = setTimeout(() => {
        ghostHpPct.current = hpPct;
        prevHpPctRef.current = hpPct;
      }, 50);
      return () => clearTimeout(timeout);
    }, [hpPct]);

    // Also track for re-render trigger
    const [ghostPct, setGhostPct] = useState(hpPct);
    useEffect(() => {
      if (hpPct < ghostPct) {
        // keep ghostPct at old value — it will shrink after delay
        const t = setTimeout(() => setGhostPct(hpPct), 1000);
        return () => clearTimeout(t);
      } else {
        setGhostPct(hpPct);
      }
    }, [hpPct]); // eslint-disable-line

    // Get active popups for this fighter
    const myPopups = damagePopups.filter(p => p.fighterId === fighter.id);

    return (
      <div
        onClick={(e) => { e.stopPropagation(); if (onClick) onClick(fighter); else setInspectedFighter(prev => prev?.id === fighter.id ? null : fighter); }}
        className={`relative p-1.5 rounded-lg border transition-all cursor-pointer ${
          !fighter.alive ? 'opacity-30 border-gray-800 bg-gray-900/50' :
          isActive ? 'border-yellow-400/60 bg-yellow-900/20 ring-1 ring-yellow-400/30' :
          fighter.side === 'player' ? 'border-blue-500/30 bg-blue-900/20 hover:border-blue-400/50' : 'border-red-500/30 bg-red-900/20 hover:border-red-400/50'
        }`}
      >
        {/* Floating damage/heal numbers */}
        <AnimatePresence>
          {myPopups.map((popup) => (
            <motion.div
              key={popup.id}
              initial={{ opacity: 1, y: 0, scale: popup.isCrit ? 1.3 : 1 }}
              animate={{ opacity: 0, y: -32, scale: popup.isCrit ? 1.5 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className={`absolute -top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none font-bold whitespace-nowrap ${
                popup.type === 'damage'
                  ? (popup.isCrit ? 'text-base text-orange-300 drop-shadow-[0_0_6px_rgba(251,146,60,0.7)]' : 'text-sm text-red-400 drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]')
                  : 'text-sm text-green-400 drop-shadow-[0_0_4px_rgba(34,197,94,0.5)]'
              }`}
            >
              {popup.type === 'damage' ? `-${fmt(popup.value)}` : `+${fmt(popup.value)}`}
              {popup.isCrit && <span className="ml-0.5 text-[9px]">CRIT!</span>}
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="flex items-center gap-1.5">
          <img src={fighter.sprite} alt={fighter.name} className="w-10 h-10 rounded object-contain" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[10px] truncate font-medium">{fighter.name}</span>
              <span className="text-[8px]">{elem?.icon}</span>
            </div>
            {showHp && fighter.alive && (
              <>
                {/* HP bar with ghost damage trail */}
                <div className="relative h-1.5 bg-gray-800 rounded-full mt-0.5 overflow-hidden">
                  {/* Ghost bar (the lingering damage chunk) — behind the real bar */}
                  <div
                    className="absolute inset-0 h-full rounded-full bg-orange-500/70"
                    style={{ width: `${ghostPct}%`, transition: 'width 1s ease-out 0.15s' }}
                  />
                  {/* Real HP bar — instant shrink */}
                  <div
                    className={`relative h-full rounded-full z-[1] ${hpPct > 50 ? 'bg-green-500' : hpPct > 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${hpPct}%`, transition: 'width 0.15s ease-out' }}
                  />
                </div>
                <div className="h-1 bg-gray-800 rounded-full mt-0.5 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${manaPct}%` }} />
                </div>
                <div className="flex justify-between text-[8px] text-gray-500 mt-0.5">
                  <span>{fmt(fighter.hp)}/{fmt(fighter.maxHp)}</span>
                  <span className="text-red-400">{fmt(fighter.atk)}</span>
                </div>
              </>
            )}
          </div>
        </div>
        {!fighter.alive && <div className="absolute inset-0 flex items-center justify-center"><span className="text-red-500 text-sm font-bold">K.O.</span></div>}
        {fighter.buffs.length > 0 && (
          <div className="flex gap-0.5 mt-0.5 flex-wrap">
            {fighter.buffs.map((b, i) => (
              <span key={i} className={`text-[7px] px-0.5 rounded ${b.value > 0 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                {b.stat?.toUpperCase()}{b.value > 0 ? '+' : ''}{Math.round(b.value * 100)}%
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ─── Fighter Detail Panel (click to inspect) ────────────────
  const FighterDetailPanel = ({ fighter, onClose }) => {
    if (!fighter) return null;
    const elem = ELEMENTS[fighter.element];
    const sets = (() => {
      if (!fighter.artPassives) return [];
      return fighter.artPassives.map(p => ALL_ARTIFACT_SETS[p.setId]).filter(Boolean);
    })();
    const uniqueSets = [...new Map(sets.map(s => [s.id, s])).values()];
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
        className="p-3 rounded-xl bg-gray-800/80 backdrop-blur border border-gray-600 mb-3"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <img src={fighter.sprite} alt="" className="w-12 h-12 rounded object-contain" />
            <div>
              <p className="text-sm font-bold">{fighter.name} <span className="text-[10px]">{elem?.icon}</span></p>
              <p className="text-[10px] text-gray-400 capitalize">{fighter.hunterClass} | Lv{fighter.level}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xs px-2 py-0.5 rounded bg-gray-700/50">✕</button>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-x-3 gap-y-1 mb-2">
          {[
            { k: 'hp', l: 'PV', c: 'text-green-400', v: `${fmt(fighter.hp)}/${fmt(fighter.maxHp)}` },
            { k: 'atk', l: 'ATK', c: 'text-red-400', v: fmt(fighter.atk) },
            { k: 'def', l: 'DEF', c: 'text-blue-400', v: fmt(fighter.def) },
            { k: 'spd', l: 'SPD', c: 'text-emerald-400', v: fmt(fighter.spd) },
            { k: 'crit', l: 'CRIT', c: 'text-yellow-400', v: `${fighter.crit?.toFixed(1)}%` },
            { k: 'res', l: 'RES', c: 'text-cyan-400', v: `${fighter.res?.toFixed(1)}%` },
            { k: 'mana', l: 'INT', c: 'text-violet-400', v: `${Math.floor(fighter.mana)}/${fighter.maxMana}` },
            { k: 'shield', l: 'Bouclier', c: 'text-gray-300', v: fighter.shield > 0 ? fmt(fighter.shield) : '-' },
          ].map(s => (
            <div key={s.k} className="flex items-center justify-between text-[10px]">
              <span className={s.c}>{s.l}</span>
              <span className="text-gray-200 font-mono">{s.v}</span>
            </div>
          ))}
        </div>
        {/* Artifact Sets */}
        {uniqueSets.length > 0 && (
          <div className="mb-2">
            <p className="text-[9px] text-gray-500 mb-0.5">Sets :</p>
            <div className="flex flex-wrap gap-1">
              {uniqueSets.map(s => (
                <span key={s.id} className={`text-[9px] px-1.5 py-0.5 rounded border ${s.border || 'border-gray-700'} ${s.bg || 'bg-gray-900/30'} ${s.color || 'text-gray-300'}`}>
                  {s.icon} {s.name}
                </span>
              ))}
            </div>
          </div>
        )}
        {/* Buffs & Debuffs */}
        {fighter.buffs.length > 0 && (
          <div className="mb-2">
            <p className="text-[9px] text-gray-500 mb-0.5">Effets actifs :</p>
            <div className="flex flex-wrap gap-1">
              {fighter.buffs.map((b, i) => (
                <span key={i} className={`text-[9px] px-1.5 py-0.5 rounded ${b.value > 0 ? 'bg-green-900/40 text-green-400 border border-green-500/30' : 'bg-red-900/40 text-red-400 border border-red-500/30'}`}>
                  {b.stat?.toUpperCase()} {b.value > 0 ? '+' : ''}{Math.round(b.value * 100)}%
                  {b.turns < 999 && <span className="text-gray-500 ml-0.5">({b.turns}t)</span>}
                </span>
              ))}
            </div>
          </div>
        )}
        {/* Skills */}
        <div>
          <p className="text-[9px] text-gray-500 mb-0.5">Skills :</p>
          <div className="space-y-0.5">
            {fighter.skills.map((sk, i) => (
              <div key={i} className="flex items-center justify-between text-[9px]">
                <span className={sk.cd > 0 ? 'text-gray-600' : 'text-gray-300'}>{sk.name} {sk.isUltimate ? '★' : ''}</span>
                <div className="flex gap-1.5 text-gray-500">
                  {sk.power > 0 && <span className="text-red-400">P:{sk.power}</span>}
                  {sk.healSelf > 0 && <span className="text-green-400">+{sk.healSelf}%HP</span>}
                  {sk.healAlly > 0 && <span className="text-green-400">Heal</span>}
                  {sk.buffAtk > 0 && <span className="text-orange-400">ATK+{sk.buffAtk}%</span>}
                  {sk.debuffDef > 0 && <span className="text-purple-400">-{sk.debuffDef}%DEF</span>}
                  <span>{sk.cd > 0 ? `CD:${sk.cd}/${sk.cdMax}` : sk.cdMax > 0 ? `CD:${sk.cdMax}` : ''}</span>
                  {(sk.manaCost || 0) > 0 && <span className="text-violet-400">M:{sk.manaCost}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  const TimerBar = ({ current, max, label, color = 'purple' }) => {
    const pct = max > 0 ? (current / max * 100) : 0;
    const isLow = pct < 20;
    return (
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-gray-400">{label}</span>
          <span className={`text-sm font-bold ${isLow ? 'text-red-400 animate-pulse' : `text-${color}-400`}`}>
            {Math.floor(current / 60)}:{String(current % 60).padStart(2, '0')}
          </span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${isLow ? 'bg-red-500' : `bg-${color}-500`}`}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER: LOBBY
  // ═══════════════════════════════════════════════════════════════

  const renderLobby = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto text-center">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
          PVP LIVE
        </h1>
        <p className="text-gray-400 text-sm">Combat 3v3 Tour par Tour</p>
      </div>

      <div className="space-y-4 mb-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setMode('ai'); startDraft(); }}
          className="w-full p-5 rounded-xl border border-purple-500/40 bg-gradient-to-r from-purple-900/30 to-fuchsia-900/30 hover:from-purple-900/50 hover:to-fuchsia-900/50 transition-all group"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl">🤖</span>
            <div className="text-left">
              <p className="text-lg font-bold text-purple-300 group-hover:text-purple-200">vs Beru AI</p>
              <p className="text-xs text-gray-400">Affronte Beru Conseil en 3v3 strategique !</p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-gray-500">
            <span>Draft: 1min30</span>
            <span>Equip: 2min</span>
            <span>Battle: 5min max</span>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setMode('online')}
          className="w-full p-5 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 hover:from-cyan-900/50 hover:to-blue-900/50 transition-all group"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl">🌐</span>
            <div className="text-left">
              <p className="text-lg font-bold text-cyan-300 group-hover:text-cyan-200">vs Joueur</p>
              <p className="text-xs text-gray-400">3v3 Multiplayer en ligne !</p>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Online room UI */}
      <AnimatePresence>
        {mode === 'online' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 rounded-xl bg-gray-800/40 border border-cyan-500/30">

            {/* Display name */}
            <div className="mb-3">
              <label className="text-[10px] text-gray-400 block mb-1">Ton pseudo</label>
              <input
                type="text" maxLength={20} value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Joueur"
                className="w-full px-3 py-1.5 rounded-lg bg-gray-900/50 border border-gray-700 text-sm text-gray-200 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {onlineError && <p className="text-red-400 text-xs mb-2">{onlineError}</p>}

            {onlineStatus === 'idle' && (
              <div className="space-y-2">
                {/* Create room */}
                <button onClick={createOnlineRoom}
                  className="w-full px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold transition-all">
                  Creer une Room
                </button>

                {/* Join room */}
                <div className="flex gap-2">
                  <input
                    type="text" maxLength={6} value={joinCode}
                    onChange={e => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="CODE"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-gray-900/50 border border-gray-700 text-sm text-gray-200 uppercase text-center tracking-widest focus:border-cyan-400 focus:outline-none"
                  />
                  <button onClick={joinOnlineRoom}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all">
                    Rejoindre
                  </button>
                </div>

                {/* Matchmaking */}
                <button onClick={startMatchmaking}
                  className="w-full px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-all">
                  🔍 Matchmaking auto
                </button>

                <button onClick={() => setMode(null)} className="w-full text-xs text-gray-500 hover:text-gray-300 mt-1">
                  Annuler
                </button>
              </div>
            )}

            {onlineStatus === 'connecting' && (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-gray-400">Connexion au serveur...</p>
              </div>
            )}

            {onlineStatus === 'in_room' && (
              <div className="text-center py-3">
                <p className="text-cyan-400 text-lg font-bold tracking-widest mb-2">{roomCode}</p>
                <p className="text-xs text-gray-400 mb-1">Partage ce code a ton adversaire !</p>
                {opponent ? (
                  <p className="text-green-400 text-sm">🎮 {opponent.name} a rejoint ! Lancement...</p>
                ) : (
                  <>
                    <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-gray-500 text-xs">En attente d'un adversaire...</p>
                  </>
                )}
              </div>
            )}

            {onlineStatus === 'in_queue' && (
              <div className="text-center py-3">
                <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Recherche d'un adversaire...</p>
                <button onClick={cancelMatchmaking} className="text-xs text-gray-500 hover:text-gray-300 mt-2">
                  Annuler
                </button>
              </div>
            )}

            {onlineStatus === 'error' && (
              <div className="text-center py-3">
                <p className="text-red-400 text-sm mb-2">{onlineError}</p>
                <button onClick={() => { setOnlineStatus('idle'); setOnlineError(''); }}
                  className="text-xs text-gray-400 hover:text-gray-300">Reessayer</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pool info */}
      <div className="text-[10px] text-gray-600">
        <p>{Object.keys(allPool).length} hunters disponibles dans ta box</p>
        {Object.keys(allPool).length < 10 && (
          <p className="text-red-400 mt-1">Il faut au moins 10 hunters pour jouer !</p>
        )}
      </div>

      {/* Daily rewards tracker */}
      {(() => {
        let daily;
        try {
          daily = JSON.parse(localStorage.getItem(PVP_LIVE_DAILY_KEY) || '{}');
          const today = new Date().toISOString().slice(0, 10);
          if (daily.date !== today) daily = { date: today, hammers: 0, alkahest: 0, games: 0 };
        } catch { daily = { hammers: 0, alkahest: 0, games: 0 }; }
        return (
          <div className="mt-4 p-3 rounded-lg bg-gray-800/30 border border-gray-700/50">
            <p className="text-[10px] text-gray-400 mb-1">Recompenses du jour</p>
            <div className="flex justify-center gap-6 text-xs">
              <span className="text-red-400">🔨 {daily.hammers || 0}/{REWARDS.dailyCap.hammers}</span>
              <span className="text-cyan-400">💎 {daily.alkahest || 0}/{REWARDS.dailyCap.alkahest}</span>
              <span className="text-gray-400">🎮 {daily.games || 0} parties</span>
            </div>
          </div>
        );
      })()}

      <Link to="/shadow-colosseum" className="inline-block mt-6 text-xs text-gray-500 hover:text-gray-300 transition">
        ← Retour au Colosseum
      </Link>
    </motion.div>
  );

  // ═══════════════════════════════════════════════════════════════
  // RENDER: DRAFT
  // ═══════════════════════════════════════════════════════════════

  const renderDraft = () => {
    const step = draftStep;
    const isDone = step >= DRAFT_SEQUENCE.length;
    const action = isDone ? null : DRAFT_SEQUENCE[step];
    const isP1Turn = action?.startsWith('p1');
    const isBan = action?.includes('ban');
    const bannedIds = [...bans.p1, ...bans.p2];
    const pickedIds = [...picks.p1, ...picks.p2];
    const unavailable = new Set([...bannedIds, ...pickedIds]);

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
        <TimerBar current={timer} max={DRAFT_TIME} label="Phase de Draft" />

        {/* Draft status */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-xs text-blue-400 font-bold">TOI</span>
            <span className="text-[10px] text-gray-500 ml-2">
              Bans: {bans.p1.length}/2 | Picks: {picks.p1.length}/3
            </span>
          </div>
          <div className={`text-sm font-bold px-3 py-1 rounded-full ${
            isDone ? 'bg-green-900/30 text-green-400' :
            isP1Turn ? 'bg-blue-900/30 text-blue-400' : 'bg-red-900/30 text-red-400'
          }`}>
            {isDone ? 'Draft termine !' : `${isP1Turn ? 'TON' : 'BERU'} tour — ${isBan ? 'BAN' : 'PICK'}`}
          </div>
          <div>
            <span className="text-xs text-red-400 font-bold">BERU</span>
            <span className="text-[10px] text-gray-500 ml-2">
              Bans: {bans.p2.length}/2 | Picks: {picks.p2.length}/3
            </span>
          </div>
        </div>

        {/* Draft sequence indicator */}
        <div className="flex justify-center gap-1 mb-4">
          {DRAFT_SEQUENCE.map((s, i) => (
            <div key={i} className={`w-6 h-6 rounded text-[8px] flex items-center justify-center font-bold ${
              i < step ? (s.startsWith('p1') ? 'bg-blue-800 text-blue-300' : 'bg-red-800 text-red-300') :
              i === step ? 'bg-yellow-600 text-yellow-100 ring-1 ring-yellow-400' :
              'bg-gray-800 text-gray-600'
            }`}>
              {s.includes('ban') ? '🚫' : '✓'}
            </div>
          ))}
        </div>

        {/* Picks display */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <p className="text-[10px] text-blue-400 text-center">Ton equipe</p>
            <div className="flex gap-1 justify-center">
              {[0, 1, 2].map(i => {
                const id = picks.p1[i];
                return (
                  <div key={i} className={`w-16 h-20 rounded-lg border flex items-center justify-center ${
                    id ? 'border-blue-500/40 bg-blue-900/20' : 'border-gray-700 bg-gray-900/30 border-dashed'
                  }`}>
                    {id ? (
                      <div className="text-center">
                        <img src={allPool[id]?.sprite || SPRITES[id]} alt="" className="w-10 h-10 mx-auto rounded object-contain" />
                        <p className="text-[8px] truncate px-0.5">{allPool[id]?.name}</p>
                      </div>
                    ) : <span className="text-gray-600 text-[10px]">?</span>}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-red-400 text-center">Equipe Beru</p>
            <div className="flex gap-1 justify-center">
              {[0, 1, 2].map(i => {
                const id = picks.p2[i];
                return (
                  <div key={i} className={`w-16 h-20 rounded-lg border flex items-center justify-center ${
                    id ? 'border-red-500/40 bg-red-900/20' : 'border-gray-700 bg-gray-900/30 border-dashed'
                  }`}>
                    {id ? (
                      <div className="text-center">
                        <img src={allPool[id]?.sprite || SPRITES[id]} alt="" className="w-10 h-10 mx-auto rounded object-contain" />
                        <p className="text-[8px] truncate px-0.5">{allPool[id]?.name}</p>
                      </div>
                    ) : <span className="text-gray-600 text-[10px]">?</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bans display */}
        {(bans.p1.length > 0 || bans.p2.length > 0) && (
          <div className="flex justify-center gap-4 mb-4">
            <div className="flex gap-1">
              <span className="text-[9px] text-gray-500">Bans:</span>
              {bans.p1.map(id => (
                <span key={id} className="text-[9px] text-red-400 bg-red-900/30 px-1 rounded">{allPool[id]?.name}</span>
              ))}
              {bans.p2.map(id => (
                <span key={id} className="text-[9px] text-red-400 bg-red-900/30 px-1 rounded">{allPool[id]?.name}</span>
              ))}
            </div>
          </div>
        )}

        {/* Pool grid */}
        {!isDone && isP1Turn && (
          <>
            {/* Quick Filters */}
            <div className="flex flex-wrap gap-1 justify-center mb-2">
              {Object.entries(ELEMENTS).map(([key, el]) => (
                <button key={key} onClick={() => setDraftFilter(prev => ({ ...prev, element: prev.element === key ? null : key }))}
                  className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                    draftFilter.element === key ? 'border-yellow-400 bg-yellow-900/30 text-yellow-300' : 'border-gray-700 bg-gray-800/50 text-gray-400'
                  }`}>
                  {el.icon} {el.name || key}
                </button>
              ))}
              <span className="text-gray-700 mx-1">|</span>
              {['fighter', 'mage', 'support', 'tank'].map(cls => (
                <button key={cls} onClick={() => setDraftFilter(prev => ({ ...prev, class: prev.class === cls ? null : cls }))}
                  className={`px-2 py-0.5 rounded text-[10px] border transition-all capitalize ${
                    draftFilter.class === cls ? 'border-purple-400 bg-purple-900/30 text-purple-300' : 'border-gray-700 bg-gray-800/50 text-gray-400'
                  }`}>
                  {cls}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5 justify-center max-h-[320px] overflow-y-auto p-2 bg-gray-900/30 rounded-xl border border-gray-800">
              {draftPool.filter(id => {
                const c = allPool[id];
                if (!c) return false;
                if (draftFilter.element && c.element !== draftFilter.element) return false;
                if (draftFilter.class) {
                  const hCls = HUNTERS[id]?.class || c.class || 'fighter';
                  if (hCls !== draftFilter.class) return false;
                }
                return true;
              }).map(id => (
                <HunterCard
                  key={id}
                  id={id}
                  onClick={(hid) => setSelectedForDraft(hid)}
                  selected={selectedForDraft === id}
                  banned={unavailable.has(id)}
                  picked={false}
                  small
                />
              ))}
            </div>
            {selectedForDraft && !unavailable.has(selectedForDraft) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-center">
                <button
                  onClick={() => confirmDraftAction(selectedForDraft)}
                  className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                    isBan ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {isBan ? `🚫 BANNIR ${allPool[selectedForDraft]?.name}` : `✓ PICK ${allPool[selectedForDraft]?.name}`}
                </button>
              </motion.div>
            )}
          </>
        )}

        {!isDone && !isP1Turn && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Beru {isBan ? 'choisit son ban' : 'choisit son pick'}...</p>
          </div>
        )}
      </motion.div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER: EQUIP
  // ═══════════════════════════════════════════════════════════════

  const renderEquip = () => {
    const myPicks = picks.p1;
    const focusId = myPicks[equipFocusHunter];
    const focusChibi = focusId ? allPool[focusId] : null;
    const currentWeapon = focusId ? tempWeapons?.[focusId] : null;
    const availWeapons = focusId ? getAvailableWeapons(focusId) : [];

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
        <TimerBar current={timer} max={EQUIP_TIME} label="Phase d'Equipement" color="cyan" />

        <p className="text-xs text-gray-400 text-center mb-3">
          Change les armes et sets de tes hunters — ces modifications sont temporaires !
        </p>

        {/* Hunter tabs */}
        <div className="flex justify-center gap-2 mb-4">
          {myPicks.map((id, i) => {
            const c = allPool[id];
            if (!c) return null;
            return (
              <button key={id} onClick={() => { setEquipFocusHunter(i); setBeruAdvice(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                  i === equipFocusHunter ? 'border-cyan-400 bg-cyan-900/30 text-cyan-300' : 'border-gray-700 bg-gray-800/50 text-gray-400'
                }`}>
                <img src={c.sprite || SPRITES[id]} alt="" className="w-7 h-7 rounded object-contain" />
                <span className="text-xs">{c.name}</span>
              </button>
            );
          })}
        </div>

        {/* Current hunter equipment */}
        {focusId && focusChibi && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Weapon selection */}
            <div className="p-3 rounded-xl bg-gray-800/30 border border-gray-700">
              <p className="text-xs text-gray-400 mb-2 font-bold">Arme</p>
              <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
                {[...availWeapons].sort((a, b) => (WEAPONS[b]?.atk || 0) - (WEAPONS[a]?.atk || 0)).map(wId => {
                  const w = WEAPONS[wId];
                  if (!w) return null;
                  const isEquipped = currentWeapon === wId;
                  return (
                    <button key={wId} onClick={() => swapWeapon(focusId, wId)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                        isEquipped ? 'border-cyan-400 bg-cyan-900/30' : 'border-gray-700 bg-gray-900/30 hover:border-gray-500'
                      }`}>
                      <span className="text-sm">{w.icon || '⚔️'}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs truncate ${RARITY[w.rarity]?.color || 'text-gray-300'}`}>{w.name}</p>
                        <p className="text-[9px] text-gray-500">ATK +{w.atk} | {w.bonusStat?.replace('_', ' ')} +{w.bonusValue}</p>
                      </div>
                      {isEquipped && <span className="text-cyan-400 text-[10px]">EQUIPE</span>}
                    </button>
                  );
                })}
                {availWeapons.length === 0 && <p className="text-[10px] text-gray-600 text-center py-4">Aucune arme disponible</p>}
              </div>
            </div>

            {/* Artifact Sets — Current + Available from other hunters */}
            <div className="p-3 rounded-xl bg-gray-800/30 border border-gray-700 mt-3 md:mt-0 max-h-[400px] overflow-y-auto">
              {/* Section A: Current Sets on focused hunter */}
              <p className="text-xs text-gray-400 mb-2 font-bold">Sets Equipes</p>
              {(() => {
                const sets = getHunterSets(focusId);
                if (sets.length === 0) return <p className="text-[10px] text-gray-600 mb-3">Aucun set equipe</p>;
                return (
                  <div className="space-y-1.5 mb-3">
                    {sets.map(s => (
                      <div key={s.setId} className={`p-1.5 rounded-lg border ${s.border || 'border-gray-700'} ${s.bg || 'bg-gray-900/30'}`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${s.color || 'text-gray-300'}`}>{s.icon} {s.name}</span>
                          <span className="text-[9px] text-gray-400">{s.count} pieces</span>
                        </div>
                        {s.count >= 2 && s.passive2 && <p className="text-[8px] text-gray-500 mt-0.5">2P: {s.passive2.desc || 'Actif'}</p>}
                        {s.count >= 4 && s.passive4 && <p className="text-[8px] text-gray-500">4P: {s.passive4.desc || 'Actif'}</p>}
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Section B: Available sets from OTHER hunters in the box */}
              <div className="border-t border-gray-700/50 pt-2 mt-2">
                <p className="text-xs text-gray-400 mb-2 font-bold">Sets Disponibles (autres hunters)</p>
                {(() => {
                  if (!tempArtifacts) return <p className="text-[10px] text-gray-600">Aucun artefact dans la box</p>;
                  // Gather sets from all hunters except the focused one
                  const otherSets = [];
                  const currentFocusSets = new Set(getHunterSets(focusId).map(s => s.setId));
                  Object.entries(tempArtifacts).forEach(([hId, arts]) => {
                    if (hId === focusId) return;
                    const setCounts = {};
                    Object.values(arts).forEach(art => {
                      if (art?.set) setCounts[art.set] = (setCounts[art.set] || 0) + 1;
                    });
                    Object.entries(setCounts).forEach(([setId, count]) => {
                      const setInfo = ALL_ARTIFACT_SETS[setId];
                      if (setInfo && count >= 2) {
                        // Check if we already added this set from another hunter
                        const existing = otherSets.find(s => s.setId === setId && s.fromId === hId);
                        if (!existing) {
                          const ownerName = allPool[hId]?.name || hId;
                          const ownerSprite = allPool[hId]?.sprite || SPRITES[hId];
                          otherSets.push({ setId, count, fromId: hId, ownerName, ownerSprite, ...setInfo });
                        }
                      }
                    });
                  });

                  if (otherSets.length === 0) return <p className="text-[10px] text-gray-600">Aucun set disponible a echanger</p>;

                  return (
                    <div className="space-y-1.5">
                      {otherSets.map(s => (
                        <div key={`${s.fromId}-${s.setId}`} className={`p-1.5 rounded-lg border ${s.border || 'border-gray-700'} ${s.bg || 'bg-gray-900/30'}`}>
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1 min-w-0 flex-1">
                              <img src={s.ownerSprite} alt="" className="w-5 h-5 rounded object-contain flex-shrink-0" />
                              <div className="min-w-0">
                                <span className={`text-[10px] ${s.color || 'text-gray-300'}`}>{s.icon} {s.name}</span>
                                <span className="text-[8px] text-gray-500 ml-1">({s.count}p sur {s.ownerName})</span>
                              </div>
                            </div>
                            <button
                              onClick={() => swapArtifactSet(s.fromId, focusId, s.setId)}
                              className="flex-shrink-0 px-2 py-0.5 rounded text-[9px] font-bold bg-purple-600/80 hover:bg-purple-500 text-white transition-all"
                            >
                              Swap
                            </button>
                          </div>
                          {s.count >= 2 && s.passive2 && <p className="text-[8px] text-gray-500 mt-0.5">2P: {s.passive2.desc || 'Actif'}</p>}
                          {s.count >= 4 && s.passive4 && <p className="text-[8px] text-gray-500">4P: {s.passive4.desc || 'Actif'}</p>}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Stats preview */}
            <div className="p-3 rounded-xl bg-gray-800/30 border border-gray-700">
              <p className="text-xs text-gray-400 mb-2 font-bold">Stats Preview</p>
              {(() => {
                const fighter = buildPvpFighter(focusId, tempArtifacts, tempWeapons, tempWeaponCollection, 'player');
                if (!fighter) return <p className="text-[10px] text-gray-600">Erreur</p>;
                return (
                  <div className="space-y-1.5">
                    {[
                      { key: 'hp', label: 'PV', icon: '❤️', color: 'text-green-400' },
                      { key: 'atk', label: 'ATK', icon: '⚔️', color: 'text-red-400' },
                      { key: 'def', label: 'DEF', icon: '🛡️', color: 'text-blue-400' },
                      { key: 'spd', label: 'SPD', icon: '💨', color: 'text-emerald-400' },
                      { key: 'crit', label: 'CRIT', icon: '🎯', color: 'text-yellow-400' },
                      { key: 'res', label: 'RES', icon: '🛡️', color: 'text-cyan-400' },
                      { key: 'mana', label: 'INT', icon: '🧠', color: 'text-violet-400' },
                    ].map(s => (
                      <div key={s.key} className="flex items-center justify-between text-xs">
                        <span className={s.color}>{s.icon} {s.label}</span>
                        <span className="text-gray-300 font-mono">
                          {s.key === 'crit' || s.key === 'res' ? fighter[s.key]?.toFixed(1) : fmt(fighter[s.key] || 0)}
                        </span>
                      </div>
                    ))}
                    {fighter.skills.map((sk, i) => (
                      <div key={i} className="text-[9px] text-gray-500 flex justify-between">
                        <span>{sk.name}</span>
                        <span>P:{sk.power || 0} CD:{sk.cdMax || 0} M:{sk.manaCost || 0}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ═══ Artifact Inventory Browser ═══ */}
        {focusId && tempArtifactInventory && tempArtifactInventory.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-gray-800/30 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400 font-bold">Inventaire Artefacts ({tempArtifactInventory.length})</p>
              <div className="flex items-center gap-1.5">
                {/* Conseil Beru button */}
                <button
                  onClick={() => {
                    const hClass = HUNTERS[focusId]?.class || 'fighter';
                    const hElement = focusChibi?.element || 'fire';
                    const equipped = tempArtifacts?.[focusId] || {};
                    const result = analyzeEquipment(hClass, hElement, equipped, tempArtifactInventory || []);
                    setBeruAdvice(result);
                    beruSay(result?.summary || 'Hmm...', result?.overallGrade === 'S' || result?.overallGrade === 'A' ? 'confident' : 'panic');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-600/30 to-yellow-600/30 border border-amber-500/30 text-[10px] font-bold text-amber-300 hover:from-amber-600/50 hover:to-yellow-600/50 transition-all"
                >
                  Conseil Beru
                </button>
                <button
                  onClick={() => autoEquipPvp(focusId)}
                  className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/30 text-[10px] font-bold text-cyan-300 hover:from-cyan-600/50 hover:to-blue-600/50 transition-all"
                >
                  Auto-Equip
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-2 space-y-1">
              {/* Slot filter */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[9px] text-gray-500 w-8">Slot</span>
                {SLOT_ORDER.map(sId => (
                  <button key={sId} onClick={() => setEqInvFilter(prev => ({ ...prev, slot: prev.slot === sId ? null : sId }))}
                    className={`px-1.5 py-0.5 rounded text-[10px] transition-all ${
                      eqInvFilter.slot === sId ? 'text-purple-300 bg-purple-500/15 ring-1 ring-purple-400/50' : 'text-gray-500 bg-gray-800/30 hover:bg-gray-700/30'
                    }`}>{ARTIFACT_SLOTS[sId]?.icon || sId}</button>
                ))}
              </div>
              {/* Set filter */}
              {(() => {
                const setsInInv = new Set(tempArtifactInventory.map(a => a.set));
                if (setsInInv.size === 0) return null;
                return (
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[9px] text-gray-500 w-8">Set</span>
                    {[...setsInInv].map(setId => {
                      const s = ALL_ARTIFACT_SETS[setId];
                      if (!s) return null;
                      return (
                        <div key={setId} className="relative group/set">
                          <button onClick={() => setEqInvFilter(prev => ({ ...prev, set: prev.set === setId ? null : setId }))}
                            className={`px-1.5 py-0.5 rounded text-[10px] transition-all ${
                              eqInvFilter.set === setId ? `${s.color} ${s.bg} ring-1 ring-current` : 'text-gray-500 bg-gray-800/30 hover:bg-gray-700/30'
                            }`}>{s.icon}</button>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/set:block z-50 pointer-events-none">
                            <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-600/40 rounded-lg px-2.5 py-1.5 shadow-xl w-max max-w-[200px]">
                              <div className={`text-[10px] font-bold ${s.color} mb-1`}>{s.icon} {s.name}</div>
                              {s.bonus2Desc && <div className="text-[9px] text-green-400">2p : {s.bonus2Desc}</div>}
                              {s.bonus4Desc && <div className="text-[9px] text-blue-400">4p : {s.bonus4Desc}</div>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
              {(eqInvFilter.slot || eqInvFilter.set) && (
                <button onClick={() => setEqInvFilter({ slot: null, set: null })}
                  className="text-[10px] text-red-400 hover:text-red-300">Reset filtres</button>
              )}
            </div>

            {/* Beru Advisor Panel */}
            {beruAdvice && (() => {
              const gradeColors = { S: 'text-yellow-400', A: 'text-green-400', B: 'text-blue-400', C: 'text-red-400', D: 'text-gray-500' };
              const gradeBg = { S: 'from-yellow-600/20 to-amber-600/20 border-yellow-500/40', A: 'from-green-600/20 to-emerald-600/20 border-green-500/40', B: 'from-blue-600/20 to-cyan-600/20 border-blue-500/40', C: 'from-red-600/20 to-rose-600/20 border-red-500/40', D: 'from-gray-600/20 to-gray-700/20 border-gray-500/40' };
              return (
                <div className={`mb-3 p-3 rounded-xl bg-gradient-to-br ${gradeBg[beruAdvice.overallGrade]} border`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-black ${gradeColors[beruAdvice.overallGrade]}`}>{beruAdvice.overallGrade}</span>
                      <span className="text-[10px] text-gray-300 italic">"{beruAdvice.summary}"</span>
                    </div>
                    <button onClick={() => setBeruAdvice(null)} className="text-gray-500 hover:text-white text-xs">&#10005;</button>
                  </div>

                  {/* Recommended sets */}
                  {beruAdvice.recommendedSets && (
                    <div className="mb-2">
                      <p className="text-[9px] text-gray-500 mb-0.5">Sets recommandes :</p>
                      <div className="flex flex-wrap gap-1">
                        {[...(beruAdvice.recommendedSets.S || []), ...(beruAdvice.recommendedSets.A || [])].map(setId => {
                          const s = ALL_ARTIFACT_SETS[setId];
                          if (!s) return null;
                          const tier = getSetTier(setId, beruAdvice.hunterClass, focusChibi?.element || 'fire');
                          return (
                            <span key={setId} className={`text-[9px] px-1.5 py-0.5 rounded border ${s.border || 'border-gray-700'} ${s.bg || 'bg-gray-900/30'} ${s.color || 'text-gray-300'}`}>
                              {s.icon} {s.name} <span className={tier === 'S' ? 'text-yellow-400' : 'text-green-400'}>({tier})</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Slot issues */}
                  {beruAdvice.slotAdvice?.filter(sa => sa.currentIssues.length > 0).length > 0 && (
                    <div className="mb-2">
                      <p className="text-[9px] text-gray-500 mb-0.5">Problemes :</p>
                      <div className="space-y-0.5">
                        {beruAdvice.slotAdvice.filter(sa => sa.currentIssues.length > 0).slice(0, 4).map(sa => (
                          <div key={sa.slot} className="text-[9px] text-red-400">
                            {sa.currentIssues[0]}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reroll advice */}
                  {beruAdvice.rerollAdvice?.length > 0 && (
                    <div className="mb-1">
                      <p className="text-[9px] text-gray-500 mb-0.5">Stats a reroll :</p>
                      <div className="space-y-0.5">
                        {beruAdvice.rerollAdvice.slice(0, 3).map((r, i) => (
                          <div key={i} className="text-[9px] text-orange-400">{r.msg}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mage advice */}
                  {beruAdvice.mageAdvice && (
                    <div className="mt-1 text-[9px] text-purple-400 italic">
                      {beruAdvice.mageAdvice[0]}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Inventory grid */}
            {(() => {
              const filtered = tempArtifactInventory.filter(art => {
                if (eqInvFilter.slot && art.slot !== eqInvFilter.slot) return false;
                if (eqInvFilter.set && art.set !== eqInvFilter.set) return false;
                return true;
              });
              return filtered.length === 0 ? (
                <p className="text-center text-[10px] text-gray-600 py-4">
                  {tempArtifactInventory.length === 0 ? "Inventaire vide" : "Aucun artefact ne correspond aux filtres."}
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 max-h-72 overflow-y-auto">
                  {filtered.map((art, i) => {
                    const setDef = ALL_ARTIFACT_SETS[art.set];
                    const slotDef = ARTIFACT_SLOTS[art.slot];
                    const mainDef = MAIN_STAT_VALUES[art.mainStat];
                    return (
                      <button key={art.uid || i} onClick={() => equipArtifactFromInv(art, focusId)}
                        className={`p-2 rounded-lg border ${setDef?.border || 'border-gray-600/30'} ${setDef?.bg || 'bg-gray-800/20'} hover:brightness-125 transition-all text-left`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-sm">{slotDef?.icon || '?'}</span>
                            <span className={`text-[10px] font-bold truncate ${setDef?.color || 'text-gray-300'}`}>{setDef?.name?.split(' ')[0] || '?'}</span>
                          </div>
                          <span className={`text-[9px] font-bold ${RARITY[art.rarity]?.color || 'text-gray-400'}`}>+{art.level}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className={`text-[9px] font-bold ${mainDef?.name?.includes('ATK') || mainDef?.name?.includes('INT') ? 'text-red-400' : 'text-gray-400'}`}>{mainDef?.icon || ''} {mainDef?.name || '?'}</span>
                          <span className="text-[10px] font-black ml-auto">+{art.mainValue}</span>
                        </div>
                        {art.subs && art.subs.length > 0 && (
                          <div className="mt-1 pt-1 border-t border-gray-700/20 space-y-px">
                            {art.subs.map((sub, si) => {
                              const subDef = SUB_STAT_POOL.find(s => s.id === sub.id);
                              return <div key={si} className="text-[9px] text-gray-400">{subDef?.name || sub.id} +{sub.value}</div>;
                            })}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ═══ Team Overview — All 3 hunters side by side ═══ */}
        <div className="mt-5 p-4 rounded-xl bg-gray-800/20 border border-gray-700/50">
          <p className="text-xs text-gray-400 font-bold mb-3 text-center">Vue d'ensemble de l'equipe</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {myPicks.map((hId) => {
              const chibi = allPool[hId];
              if (!chibi) return null;
              const fighter = buildPvpFighter(hId, tempArtifacts, tempWeapons, tempWeaponCollection, 'player');
              if (!fighter) return null;
              const hunterSets = getHunterSets(hId);
              const passive = HUNTER_PASSIVE_EFFECTS[hId] || null;
              const wId = tempWeapons?.[hId];
              const weapon = wId && WEAPONS[wId] ? WEAPONS[wId] : null;
              const elemInfo = ELEMENTS[chibi.element];

              return (
                <div key={hId} className="p-3 rounded-xl bg-gray-900/40 border border-gray-700/50">
                  {/* Header: portrait + name + element */}
                  <div className="flex items-center gap-2 mb-2">
                    <img src={chibi.sprite || SPRITES[hId]} alt="" className="w-10 h-10 rounded object-contain" />
                    <div>
                      <p className="text-xs font-bold text-gray-200">{chibi.name}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px]">{elemInfo?.icon}</span>
                        <span className="text-[9px] text-gray-500 capitalize">{fighter.hunterClass}</span>
                      </div>
                    </div>
                  </div>

                  {/* Key stats */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mb-2">
                    {[
                      { l: 'HP', v: fmt(fighter.hp), c: 'text-green-400' },
                      { l: 'ATK', v: fmt(fighter.atk), c: 'text-red-400' },
                      { l: 'DEF', v: fmt(fighter.def), c: 'text-blue-400' },
                      { l: 'SPD', v: fmt(fighter.spd), c: 'text-emerald-400' },
                      { l: 'CRIT', v: `${fighter.crit?.toFixed(1)}%`, c: 'text-yellow-400' },
                      { l: 'INT', v: fmt(fighter.maxMana || 0), c: 'text-violet-400' },
                    ].map(s => (
                      <div key={s.l} className="flex justify-between text-[9px]">
                        <span className={s.c}>{s.l}</span>
                        <span className="text-gray-300 font-mono">{s.v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Hunter passive */}
                  {passive && (
                    <div className="mb-2 p-1.5 rounded-lg bg-purple-900/20 border border-purple-500/20">
                      <p className="text-[8px] text-purple-400 font-bold mb-0.5">Passif Hunter</p>
                      <p className="text-[8px] text-gray-400">
                        {passive.type === 'permanent' && passive.stats && `Stats permanentes: ${Object.entries(passive.stats).map(([k, v]) => `${k.toUpperCase()} +${v}%`).join(', ')}`}
                        {passive.type === 'teamDef' && `DEF equipe +${passive.value}%`}
                        {passive.type === 'teamAura' && passive.stats && `Aura equipe: ${Object.entries(passive.stats).map(([k, v]) => `${k.toUpperCase()} +${v}%`).join(', ')}`}
                        {passive.type === 'critDmg' && `Degats critiques +${passive.value}%`}
                        {passive.type === 'healBonus' && `Bonus soins +${passive.value}%`}
                        {passive.type === 'magicDmg' && `Degats magiques +${passive.value}%`}
                        {passive.type === 'debuffBonus' && `Bonus debuff +${passive.value}%`}
                        {passive.type === 'firstTurn' && `Tour 1: SPD +${passive.stats?.spd || 0}%`}
                        {passive.type === 'conditional' && (passive.desc || `Conditionnel: ${passive.threshold || ''}%`)}
                        {!['permanent', 'teamDef', 'teamAura', 'critDmg', 'healBonus', 'magicDmg', 'debuffBonus', 'firstTurn', 'conditional'].includes(passive.type) && `${passive.type}: ${passive.value || ''}`}
                      </p>
                    </div>
                  )}

                  {/* Artifact set bonuses */}
                  {hunterSets.length > 0 && (
                    <div className="mb-2">
                      <p className="text-[8px] text-gray-500 mb-0.5">Sets:</p>
                      <div className="space-y-0.5">
                        {hunterSets.map(s => (
                          <div key={s.setId} className="text-[8px]">
                            <span className={s.color || 'text-gray-300'}>{s.icon} {s.name} ({s.count}p)</span>
                            {s.count >= 2 && s.passive2 && <span className="text-gray-500 ml-1">2P</span>}
                            {s.count >= 4 && s.passive4 && <span className="text-gray-500 ml-1">4P</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weapon */}
                  {weapon && (
                    <div className="text-[8px]">
                      <span className="text-gray-500">Arme: </span>
                      <span className={RARITY[weapon.rarity]?.color || 'text-gray-300'}>{weapon.icon || '⚔️'} {weapon.name}</span>
                      <span className="text-gray-500 ml-1">ATK+{weapon.atk}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (mode === 'online') onlineEquipReady();
              else startBattle();
            }}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold transition-all"
          >
            ⚔️ PRET ! {mode === 'online' ? 'Pret !' : 'Lancer le combat !'}
          </motion.button>
        </div>
      </motion.div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER: BATTLE
  // ═══════════════════════════════════════════════════════════════

  const renderBattle = () => {
    if (!battle) return null;
    const { playerTeam, beruTeam, turnOrder, currentTurn, round, phase: bPhase } = battle;
    const currentEntry = currentTurn < turnOrder.length ? turnOrder[currentTurn] : null;
    const activeUnit = currentEntry
      ? (currentEntry.type === 'team' ? playerTeam[currentEntry.idx] : beruTeam[currentEntry.idx])
      : null;

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
        {/* Timers */}
        <div className="grid grid-cols-2 gap-4 mb-2">
          <TimerBar current={timer} max={BATTLE_TIME} label="Temps restant" color="red" />
          {bPhase === 'pick' && <TimerBar current={turnTimer} max={TURN_TIME} label="Ton tour" color="yellow" />}
        </div>

        {/* Round indicator */}
        <div className="text-center mb-2">
          <span className="text-[10px] text-gray-500">Round {round}</span>
          {activeUnit && <span className="text-xs text-yellow-400 ml-2">→ {activeUnit.name}</span>}
        </div>

        {/* Battlefield */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          {/* Player team */}
          <div>
            <p className="text-[10px] text-blue-400 text-center mb-1 font-bold">TON EQUIPE</p>
            <div className="space-y-1.5">
              {playerTeam.map((f, i) => (
                <div key={f.id}
                  onClick={() => {
                    if (bPhase === 'pick_ally' && pendingSkill && f.alive) playerSelectTarget(i);
                  }}
                  onMouseEnter={() => {
                    if (bPhase === 'pick_ally' && pendingSkill && f.alive) setHoveredTarget(1000 + i);
                  }}
                  onMouseLeave={() => setHoveredTarget(null)}
                  className={`relative ${bPhase === 'pick_ally' && f.alive ? 'cursor-pointer hover:ring-2 hover:ring-green-400/50 rounded-lg' : ''}`}
                >
                  {hoveredTarget === 1000 + i && pendingSkill && (() => {
                    const entry = battle.turnOrder[battle.currentTurn];
                    const attacker = battle.playerTeam[entry.idx];
                    const est = estimateDamage(attacker, pendingSkill.skill, f);
                    if (!est) return null;
                    return (
                      <div className={`absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap z-10 ${
                        est.type === 'heal' ? 'bg-green-900/90 text-green-300' : 'bg-red-900/90 text-red-300'
                      }`}>
                        ~{est.type === 'heal' ? '+' : '-'}{fmt(est.value)} {est.type === 'heal' ? 'HP' : 'DMG'}
                      </div>
                    );
                  })()}
                  <FighterPortrait
                    fighter={f}
                    isActive={currentEntry?.type === 'team' && currentEntry?.idx === i && (bPhase === 'pick' || bPhase === 'pick_target' || bPhase === 'pick_ally')}
                    onClick={bPhase === 'pick_ally' && pendingSkill && f.alive ? () => playerSelectTarget(i) : undefined}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Beru team */}
          <div>
            <p className="text-[10px] text-red-400 text-center mb-1 font-bold">EQUIPE BERU</p>
            <div className="space-y-1.5">
              {beruTeam.map((f, i) => (
                <div key={f.id}
                  onMouseEnter={() => {
                    if (bPhase === 'pick_target' && pendingSkill && f.alive) setHoveredTarget(i);
                  }}
                  onMouseLeave={() => setHoveredTarget(null)}
                  className={`relative ${bPhase === 'pick_target' && f.alive ? 'cursor-pointer hover:ring-2 hover:ring-red-400/50 rounded-lg' : ''}`}
                >
                  {hoveredTarget === i && pendingSkill && (() => {
                    const entry = battle.turnOrder[battle.currentTurn];
                    const attacker = battle.playerTeam[entry.idx];
                    const est = estimateDamage(attacker, pendingSkill.skill, f);
                    if (!est) return null;
                    return (
                      <div className={`absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap z-10 ${
                        est.type === 'heal' ? 'bg-green-900/90 text-green-300' : 'bg-red-900/90 text-red-300'
                      }`}>
                        ~{est.type === 'heal' ? '+' : '-'}{fmt(est.value)} {est.type === 'heal' ? 'HP' : 'DMG'}
                      </div>
                    );
                  })()}
                  <FighterPortrait
                    fighter={f}
                    isActive={currentEntry?.type === 'enemy' && currentEntry?.idx === i && bPhase === 'enemy_act'}
                    onClick={bPhase === 'pick_target' && pendingSkill && f.alive ? () => playerSelectTarget(i) : undefined}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fighter Detail Panel (click to inspect) */}
        <AnimatePresence>
          {inspectedFighter && (() => {
            // Always show live data from battle state
            const live = [...playerTeam, ...beruTeam].find(f => f.id === inspectedFighter.id) || inspectedFighter;
            return <FighterDetailPanel fighter={live} onClose={() => setInspectedFighter(null)} />;
          })()}
        </AnimatePresence>

        {/* Skill selection (player's turn) */}
        {bPhase === 'pick' && activeUnit && currentEntry?.type === 'team' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-gray-800/30 border border-blue-500/30 mb-3">
            <p className="text-xs text-blue-400 mb-2 font-bold">{activeUnit.name} — Choisis un skill :</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {activeUnit.skills.map((sk, i) => {
                const canUse = sk.cd === 0 && activeUnit.mana >= (sk.manaCost || 0);
                return (
                  <motion.button key={i}
                    whileHover={canUse ? { scale: 1.05 } : {}}
                    whileTap={canUse ? { scale: 0.95 } : {}}
                    onClick={() => canUse && playerSelectSkill(i)}
                    className={`px-3 py-2 rounded-lg border text-left min-w-[120px] transition-all ${
                      canUse ? 'border-blue-500/40 bg-blue-900/20 hover:bg-blue-900/40 cursor-pointer' :
                      'border-gray-700 bg-gray-900/30 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <p className="text-xs font-medium">{sk.name}</p>
                    <div className="flex gap-2 text-[9px] text-gray-400 mt-0.5">
                      {sk.power > 0 && <span className="text-red-400">P:{sk.power}</span>}
                      {sk.healSelf > 0 && <span className="text-green-400">+{sk.healSelf}%HP</span>}
                      {sk.buffAtk > 0 && <span className="text-orange-400">ATK+{sk.buffAtk}%</span>}
                      {sk.buffDef > 0 && <span className="text-blue-400">DEF+{sk.buffDef}%</span>}
                      {sk.debuffDef > 0 && <span className="text-purple-400">-{sk.debuffDef}%DEF</span>}
                      {sk.cdMax > 0 && <span>CD:{sk.cd}/{sk.cdMax}</span>}
                      {(sk.manaCost || 0) > 0 && <span className="text-violet-400">M:{sk.manaCost}</span>}
                    </div>
                    {sk.isUltimate && <span className="text-[8px] text-yellow-400">★ ULTIME</span>}
                    {(() => {
                      const defaultTarget = beruTeam.find(f => f.alive);
                      const est = defaultTarget && sk.power > 0 ? estimateDamage(activeUnit, sk, defaultTarget) :
                                  sk.healSelf > 0 ? { type: 'heal', value: Math.floor(activeUnit.maxHp * sk.healSelf / 100) } : null;
                      if (!est) return null;
                      return (
                        <p className={`text-[9px] mt-0.5 font-bold ${est.type === 'heal' ? 'text-green-400' : 'text-red-400'}`}>
                          ~{est.type === 'heal' ? '+' : '-'}{fmt(est.value)} {est.type === 'heal' ? 'HP' : 'DMG'}
                          {est.elemMult > 1 ? ' ★' : est.elemMult < 1 ? ' ▼' : ''}
                        </p>
                      );
                    })()}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Target selection hint */}
        {(bPhase === 'pick_target' || bPhase === 'pick_ally') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-2 rounded-lg bg-yellow-900/20 border border-yellow-500/30 text-center text-xs text-yellow-400 mb-3">
            {bPhase === 'pick_target' ? 'Clique sur un ennemi pour cibler !' : 'Clique sur un allie pour cibler !'}
            <button onClick={() => { setPendingSkill(null); setBattle(prev => prev ? { ...prev, phase: 'pick' } : null); }}
              className="ml-3 text-gray-400 hover:text-white underline">Annuler</button>
          </motion.div>
        )}

        {/* Enemy acting */}
        {bPhase === 'enemy_act' && (
          <div className="text-center py-2">
            <div className="w-6 h-6 border-2 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-1" />
            <p className="text-xs text-red-400">Beru agit...</p>
          </div>
        )}

        {/* Battle log */}
        <div ref={battleLogRef} className="h-32 overflow-y-auto p-2 rounded-lg bg-gray-900/50 border border-gray-800 text-[10px] space-y-0.5">
          {battleLog.map((entry, i) => (
            <div key={i} className={`${
              entry.type === 'system' ? 'text-gray-500 italic' :
              entry.type === 'player' ? 'text-blue-300' : 'text-red-300'
            } ${entry.isCrit ? 'font-bold' : ''} ${entry.ko ? 'text-yellow-400' : ''}`}>
              {entry.text}
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER: RESULT
  // ═══════════════════════════════════════════════════════════════

  const renderResult = () => {
    if (!result) return null;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto text-center">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className={`text-5xl mb-4 ${result.won ? '' : 'grayscale'}`}
        >
          {result.won ? '🏆' : '💀'}
        </motion.div>

        <h2 className={`text-2xl font-bold mb-2 ${result.won ? 'text-yellow-400' : 'text-red-400'}`}>
          {result.won ? 'VICTOIRE !' : 'DEFAITE...'}
        </h2>

        <p className="text-gray-400 text-sm mb-4">
          {result.won ? 'Tu as battu Beru ! Bravo !' : 'Beru a gagne cette fois...'}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 rounded-xl bg-blue-900/20 border border-blue-500/30">
            <p className="text-xs text-blue-400 mb-1">Ton equipe</p>
            <p className="text-lg font-bold text-blue-300">{result.stats.playerAlive}/3</p>
            <p className="text-[10px] text-gray-500">Survivants</p>
          </div>
          <div className="p-3 rounded-xl bg-red-900/20 border border-red-500/30">
            <p className="text-xs text-red-400 mb-1">Equipe Beru</p>
            <p className="text-lg font-bold text-red-300">{result.stats.beruAlive}/3</p>
            <p className="text-[10px] text-gray-500">Survivants</p>
          </div>
        </div>

        {/* Rewards */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-900/30 to-fuchsia-900/30 border border-purple-500/30 mb-4">
          <p className="text-xs text-purple-400 mb-2 font-bold">Recompenses</p>
          <div className="flex justify-center gap-8">
            <div>
              <p className="text-xl font-bold text-red-400">+{result.rewards.hammers}</p>
              <p className="text-[10px] text-gray-400">🔨 Marteaux</p>
            </div>
            <div>
              <p className="text-xl font-bold text-cyan-400">+{result.rewards.alkahest}</p>
              <p className="text-[10px] text-gray-400">💎 Alkahest</p>
            </div>
          </div>
          {result.daily && (
            <p className="text-[9px] text-gray-500 mt-2">
              Aujourd'hui: 🔨 {result.daily.hammers}/{REWARDS.dailyCap.hammers} | 💎 {result.daily.alkahest}/{REWARDS.dailyCap.alkahest} | 🎮 {result.daily.games} parties
            </p>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetToLobby}
            className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all"
          >
            🔄 Rejouer
          </motion.button>
          <Link to="/shadow-colosseum"
            className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold text-sm transition-all">
            ← Retour
          </Link>
        </div>
      </motion.div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // MAIN RETURN
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-gray-100 px-3 py-4">
      {phase === 'lobby' && renderLobby()}
      {phase === 'draft' && renderDraft()}
      {phase === 'equip' && renderEquip()}
      {phase === 'battle' && renderBattle()}
      {phase === 'result' && renderResult()}
    </div>
  );
}
