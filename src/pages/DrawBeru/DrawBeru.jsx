import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { drawBeruModels, getModel, getHunterModels } from './config/models';
import { BrushEngine, MANGA_BRUSHES } from './BrushEngine';
import ChibiBubble from '../../components/ChibiBubble';

// ⚡ HOOK MOBILE SIMPLIFIÉ (au lieu d'importer un fichier externe)
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isMobile;
};

// ⚡ HOOK GESTURES MOBILE
const useTouchGestures = (enabled, onPinch, onPan) => {
    const touchStartRef = useRef({ touches: [], distance: 0 });

    const getTouchDistance = (touches) => {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e) => {
        if (!enabled) return;

        if (e.touches.length === 2) {
            touchStartRef.current = {
                touches: Array.from(e.touches),
                distance: getTouchDistance(e.touches)
            };
        } else if (e.touches.length === 1) {
            touchStartRef.current = {
                touches: [{ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }],
                distance: 0
            };
        }
    };

    const handleTouchMove = (e) => {
        if (!enabled) return;

        if (e.touches.length === 2 && touchStartRef.current.distance > 0) {
            e.preventDefault();
            const newDistance = getTouchDistance(e.touches);
            const delta = (newDistance - touchStartRef.current.distance) * 0.01;
            onPinch?.(delta);
            touchStartRef.current.distance = newDistance;
        } else if (e.touches.length === 1 && touchStartRef.current.touches.length === 1) {
            const deltaX = e.touches[0].clientX - touchStartRef.current.touches[0].clientX;
            const deltaY = e.touches[0].clientY - touchStartRef.current.touches[0].clientY;
            onPan?.(deltaX, deltaY);
            touchStartRef.current.touches = [{
                clientX: e.touches[0].clientX,
                clientY: e.touches[0].clientY
            }];
        }
    };

    const handleTouchEnd = () => {
        touchStartRef.current = { touches: [], distance: 0 };
    };

    return { handleTouchStart, handleTouchMove, handleTouchEnd };
};

// 🎨 BRUSH TYPES CONFIGURATION - Mapping vers MANGA_BRUSHES
// Ces types sont utilisés pour la compatibilité avec l'UI existante
const BRUSH_TYPES = {
    pen: {
        id: 'gpen',
        name: 'G-Pen',
        icon: '✒️',
        description: 'Encrage manga professionnel',
        ...MANGA_BRUSHES.gpen
    },
    pencil: {
        id: 'pencil',
        name: 'Crayon Manga',
        icon: '✏️',
        description: 'Esquisse avec grain',
        ...MANGA_BRUSHES.pencil
    },
    marker: {
        id: 'marker',
        name: 'Feutre Copic',
        icon: '🖍️',
        description: 'Coloriage semi-transparent',
        ...MANGA_BRUSHES.marker
    },
    airbrush: {
        id: 'airbrush',
        name: 'Aérographe',
        icon: '💨',
        description: 'Dégradés et ombres douces',
        ...MANGA_BRUSHES.airbrush
    },
    pixel: {
        id: 'pixel',
        name: 'Pixel',
        icon: '▪️',
        description: 'Pixel art',
        ...MANGA_BRUSHES.pixel
    },
    // Nouveaux pinceaux manga
    mapping: {
        id: 'mapping',
        name: 'Mapping Pen',
        icon: '🖊️',
        description: 'Lignes fines et détails',
        ...MANGA_BRUSHES.mapping
    },
    softbrush: {
        id: 'softbrush',
        name: 'Brush Doux',
        icon: '🖌️',
        description: 'Ombres et dégradés',
        ...MANGA_BRUSHES.softbrush
    }
};

const DrawBeruFixed = ({
    // Props pour le mode multi
    initialHunter = null,
    initialModel = null,
    multiplayerMode = false,
    multiplayer = null,
    onBack = null,
}) => {
    const { t } = useTranslation();
    const isMobile = useIsMobile();

    // Canvas refs
    const canvasRef = useRef(null);
    const layersRef = useRef([]);
    const referenceCanvasRef = useRef(null);
    const overlayCanvasRef = useRef(null);

    // 🎨 Helper: Récupère le dernier dessin visité depuis localStorage
    const getLastDrawing = () => {
        try {
            const stored = localStorage.getItem('drawberu_last_drawing');
            if (stored) {
                const { hunter, model } = JSON.parse(stored);
                // Vérifie que le hunter existe dans les modèles disponibles
                if (drawBeruModels[hunter] && drawBeruModels[hunter].models[model]) {
                    return { hunter, model };
                }
            }
        } catch (error) {
            console.error('❌ Error loading last drawing:', error);
        }
        // Par défaut: premier hunter de la liste avec son modèle par défaut
        const firstHunter = Object.keys(drawBeruModels)[0];
        return { hunter: firstHunter, model: 'default' };
    };

    const lastDrawing = getLastDrawing();

    // States
    const [selectedHunter, setSelectedHunter] = useState(initialHunter || lastDrawing.hunter);
    const [selectedModel, setSelectedModel] = useState(initialModel || lastDrawing.model);
    // 🎨 Couleur par défaut: noir pour le lineart manga (pas rouge!)
    const [selectedColor, setSelectedColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(3);
    const [brushType, setBrushType] = useState('pen'); // 🎨 NEW: Type de brush (pen, pencil, marker, airbrush, pixel)
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentTool, setCurrentTool] = useState('brush');
    const [imagesLoaded, setImagesLoaded] = useState(false);

    // Mobile specific states
    const [interactionMode, setInteractionMode] = useState('draw');
    const [showModelOverlay, setShowModelOverlay] = useState(false);
    const [modelOverlayOpacity, setModelOverlayOpacity] = useState(0.3);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // 📱 MOBILE TOOLBAR SCROLL - Gestion du scroll et tap vs long-press
    const mobileToolbarRef = useRef(null);
    const toolbarTouchStartRef = useRef({ x: 0, y: 0, time: 0 });
    const toolbarIsDraggingRef = useRef(false);
    const toolbarPendingClickRef = useRef(null);
    const LONG_PRESS_THRESHOLD = 150; // ms avant de considérer comme drag
    const DRAG_THRESHOLD = 10; // px de mouvement pour considérer comme drag

    // Zoom & Pan
    const [zoomLevel, setZoomLevel] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
    const MAX_ZOOM = isMobile ? 25 : 10;
    const ZOOM_STEP = isMobile ? 0.5 : 0.25;

    // Reference canvas states
    const [refZoomLevel, setRefZoomLevel] = useState(1);
    const [refPanOffset, setRefPanOffset] = useState({ x: 0, y: 0 });
    const [isRefPanning, setIsRefPanning] = useState(false);
    const [lastRefPanPoint, setLastRefPanPoint] = useState({ x: 0, y: 0 });
    const [debugPoint, setDebugPoint] = useState(null);
    const [showReference, setShowReference] = useState(true);

    // Layers
    const [layers, setLayers] = useState([
        { id: 'base', name: 'Base', visible: true, opacity: 1, locked: false },
        { id: 'shadows', name: 'Ombres', visible: true, opacity: 1, locked: false },
        { id: 'details', name: 'Détails', visible: true, opacity: 1, locked: false }
    ]);
    const [activeLayer, setActiveLayer] = useState('base');

    // History
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [coloringProgress, setColoringProgress] = useState(0);
    const [progressDetails, setProgressDetails] = useState(null);

    // 🎮 CHEAT CODE STATES
    const [cheatModeActive, setCheatModeActive] = useState(false);
    const [cheatCooldown, setCheatCooldown] = useState(null);
    const [cheatTimeRemaining, setCheatTimeRemaining] = useState(10);
    const [pressedKeys, setPressedKeys] = useState(new Set());
    const cheatTimerRef = useRef(null);
    const cheatCountdownRef = useRef(null);

    // 🎨 AUTO-PIPETTE MODE - Colorie avec les couleurs du modèle de référence
    const [autoPipetteMode, setAutoPipetteMode] = useState(false);

    // 🦋 BERU PAPILLON ZONE SELECTION - Sélection de zone géométrique
    const [zoneSelectionMode, setZoneSelectionMode] = useState(false); // Mode de sélection actif
    const [selectedZoneShape, setSelectedZoneShape] = useState('rectangle'); // rectangle, square, circle, triangle
    const [zoneRotation, setZoneRotation] = useState(0); // Rotation en degrés
    const [zonePosition, setZonePosition] = useState({ x: 0, y: 0 }); // Position du centre
    const [zoneSize, setZoneSize] = useState({ width: 150, height: 150 }); // Taille de la zone
    const [isDraggingZone, setIsDraggingZone] = useState(false); // Drag en cours
    const [isResizingZone, setIsResizingZone] = useState(false); // Resize en cours
    const [pendingChibiId, setPendingChibiId] = useState(null); // Chibi en attente de zone
    const zoneSelectionRef = useRef(null);

    // 🎨 Configuration des Chibis dessinateurs (DOIT être avant les états qui l'utilisent)
    // 🤝 SYSTÈME D'AFFINITÉS ENTRE CHIBIS
    // 'synergy' = bonus ensemble, 'neutral' = normal, 'chaotic' = interactions conflictuelles
    const CHIBI_AFFINITIES = {
        'beru_papillon-tank': 'chaotic',      // Béru et Tank = chaos total
        'tank-beru_papillon': 'chaotic',
        // Futurs duos...
        // 'beru_papillon-tankette': 'synergy',
        // 'tank-tankette': 'synergy',
    };

    // 🎭 DIALOGUES D'INTERACTIONS ENTRE CHIBIS
    const CHIBI_INTERACTIONS = {
        // 🐻 Quand Tank troll le travail de Béru
        'tank_trolls_beru': [
            { from: 'tank', message: "Oups ! J'ai glissé sur ton beau coloriage~ 🐾" },
            { from: 'tank', message: "Hehe... C'était trop parfait, fallait corriger ça !" },
            { from: 'tank', message: "WOUAF ! *splash sur le travail de Béru*" },
            { from: 'tank', message: "Cette couleur est MIEUX, fais-moi confiance !" },
            { from: 'tank', message: "*roule sur le dessin* ...Oups?" },
            { from: 'tank', message: "L'art abstrait c'est SOUS-ESTIMÉ !" },
            { from: 'tank', message: "Un peu de CHAOS pour égayer tout ça~" },
            { from: 'tank', message: "Béru colorie trop bien... ça m'énerve !" },
            { from: 'tank', message: "*patte maladroite* C'est pas ma faute !" },
            { from: 'tank', message: "Qui a dit que le rose allait pas là ? MOI." },
        ],
        // 🦋 Réactions de Béru quand Tank troll
        'beru_reacts_to_troll': [
            { from: 'beru_papillon', message: "KIII ?! Tank qu'est-ce que tu fais ?!" },
            { from: 'beru_papillon', message: "...Tu as VRAIMENT fait ça ? 😤" },
            { from: 'beru_papillon', message: "Mes belles couleurs... *soupir*" },
            { from: 'beru_papillon', message: "Je vais devoir repasser derrière... ENCORE." },
            { from: 'beru_papillon', message: "Tank... on avait dit PAS sur ma zone !" },
            { from: 'beru_papillon', message: "*flutter furieux* Tu vas voir !" },
            { from: 'beru_papillon', message: "Je... je respire... calmement..." },
            { from: 'beru_papillon', message: "C'est la TROISIÈME fois aujourd'hui !" },
            { from: 'beru_papillon', message: "Pourquoi je travaille avec ce chien..." },
            { from: 'beru_papillon', message: "*ailes qui tremblent de frustration*" },
        ],
        // 🦋 Quand Béru rattrape les dégâts de Tank
        'beru_fixes_tank': [
            { from: 'beru_papillon', message: "Bon... je répare ça. Comme d'habitude." },
            { from: 'beru_papillon', message: "*soupir* Au travail..." },
            { from: 'beru_papillon', message: "Un jour il apprendra... un jour." },
            { from: 'beru_papillon', message: "Précision chirurgicale pour effacer le chaos~" },
            { from: 'beru_papillon', message: "Cette tache... n'a JAMAIS existé." },
            { from: 'beru_papillon', message: "Patience est mère de vertu... *répare*" },
            { from: 'beru_papillon', message: "Allez hop, on nettoie les bêtises~" },
            { from: 'beru_papillon', message: "Le perfectionnisme a un prix..." },
        ],
        // 🐻 Réaction de Tank quand Béru corrige
        'tank_reacts_to_fix': [
            { from: 'tank', message: "Hé ! C'était de l'ART ça !" },
            { from: 'tank', message: "...Bon ok c'était moche. Mais QUAND MÊME !" },
            { from: 'tank', message: "*boude dans son coin*" },
            { from: 'tank', message: "Pfff... perfectionniste va." },
            { from: 'tank', message: "Tu verras, un jour mon style sera reconnu !" },
            { from: 'tank', message: "C'était du GÉNIE incompris !" },
            { from: 'tank', message: "*grogne* Je recommencerai..." },
            { from: 'tank', message: "Même pas vrai que c'était moche !" },
        ],
        // 🦋 Dialogues solo variés - Béru concentré
        'beru_solo_focused': [
            { from: 'beru_papillon', message: "Cette nuance... parfaite." },
            { from: 'beru_papillon', message: "La précision est un art~" },
            { from: 'beru_papillon', message: "Chaque pixel compte..." },
            { from: 'beru_papillon', message: "Kiii~ C'est beau non ?" },
            { from: 'beru_papillon', message: "L'ombre ici... oui, exactement là." },
            { from: 'beru_papillon', message: "Mes ailes frémissent de satisfaction~" },
        ],
        // 🐻 Dialogues solo variés - Tank chaotique
        'tank_solo_chaos': [
            { from: 'tank', message: "WOUAF ! *splash aléatoire*" },
            { from: 'tank', message: "Cette couleur ? Ou celle-là ? ...Les deux !" },
            { from: 'tank', message: "*tourne en rond* OÙ colorier..." },
            { from: 'tank', message: "Hehe... personne regarde ? *splash*" },
            { from: 'tank', message: "L'imprévu c'est la VIE !" },
            { from: 'tank', message: "Je suis un ARTISTE incompris !" },
        ],

        // 🌟 MESSAGES LÉGENDAIRES - Ultra rares (0.5%, cooldown 3 jours)
        'legendary_tank': [
            { from: 'tank', message: "Hein ? … Attends… c'était pas une bêtise ?" },
            { from: 'tank', message: "...Béru ? T'es vraiment fort en fait." },
            { from: 'tank', message: "*regarde son travail* ...C'est... beau?" },
        ],
        'legendary_beru': [
            { from: 'beru_papillon', message: "…… …Merci Tank." },
            { from: 'beru_papillon', message: "Tu sais quoi ? ...Continue comme ça." },
            { from: 'beru_papillon', message: "*sourire* On fait une bonne équipe." },
        ],

        // 🔥 Messages par ÉTAT ÉMOTIONNEL - Tank
        'tank_overexcited': [
            { from: 'tank', message: "CHAOS IS ART ! 🎨🐕" },
            { from: 'tank', message: "JE SUIS UNSTOPPABLE !!!" },
            { from: 'tank', message: "ENCORE ! ENCORE ! ENCOOORE !" },
            { from: 'tank', message: "*mode destruction totale activé*" },
        ],

        // 🔥 Messages par ÉTAT ÉMOTIONNEL - Béru résigné
        'beru_resigned': [
            { from: 'beru_papillon', message: "Pourquoi je travaille avec ce chien..." },
            { from: 'beru_papillon', message: "*soupir infini* ...D'accord." },
            { from: 'beru_papillon', message: "Je ne ressens plus rien." },
            { from: 'beru_papillon', message: "C'est ça ma vie maintenant..." },
        ],
    };

    const CHIBI_PAINTERS = {
        beru_papillon: {
            id: 'beru_papillon',
            name: 'Béru-Papillon',
            entityType: 'beru',
            sprites: {
                back: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422906/alecto_up_dwahgh.png',
                front: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755423129/alecto_face_irsy6q.png'
            },
            stats: {
                endurance: 80,
                speed: 60,
                pixelPrecision: 2
            },
            pixelSize: 2,
            duration: 60,
            colorMode: 'accurate',
            movementMode: 'zone',
            inkSplash: false,
            zoneConfig: {
                minSize: 8,
                maxSize: 25,
                shapes: ['rect', 'square', 'triangle'],
            },
            // 🔧 Messages de base (utilisés quand seul)
            messages: [
                "Kiii... mais avec grâce maintenant !",
                "Mes ailes chatouillent les ombres...",
                "Entre deux mondes, je danse.",
                "Un papillon de l'ombre... artistique !",
                "Mes couleurs sont aussi précises que mes griffes~",
            ],
            startMessage: "C'est parti ! Je vais colorier avec précision~",
            endMessage: "Mission accomplie ! À la prochaine~",
            // 🤝 Affinités
            affinities: { tank: 'chaotic' },
            // 🎯 Comportement en duo chaotique
            chaoticBehavior: {
                fixesOthersMess: true,       // Rattrape les erreurs des autres
                fixChance: 0.15,              // 15% de chance de partir réparer
                reactionDelay: 2000,          // Délai avant réaction (ms)
            }
        },
        tank: {
            id: 'tank',
            name: 'Tank',
            entityType: 'tank',
            sprites: {
                back: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604462/tank_dos_bk6poi.png',
                front: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604465/tank_face_n9kxrh.png'
            },
            stats: {
                endurance: 50,
                speed: 40,
                pixelPrecision: 5
            },
            pixelSize: 5,
            duration: 45,
            colorMode: 'troll',
            movementMode: 'random',
            inkSplash: true,
            inkSplashChance: 0.08,
            messages: [
                "Hehe... cette couleur va être PARFAITE !",
                "*splash* Oups, c'est pas la bonne couleur ?",
                "L'art c'est subjectif, non ?",
                "TANK SMASH... avec de la peinture !",
            ],
            startMessage: "Wouaf ! Tank va t'aider... à sa manière !",
            endMessage: "Hehe... c'est beau non ? ...Non ? WOUAF !",
            affinities: { beru_papillon: 'chaotic' },
            // 🎯 Comportement en duo chaotique
            chaoticBehavior: {
                trollsOthersWork: true,      // Troll le travail des autres
                trollChance: 0.12,            // 12% de chance de troller
                trollRadius: 30,              // Rayon autour du travail de l'autre
                reactionDelay: 1500,
            }
        }
    };

    // 🎭 État des interactions entre chibis
    const [chibiInteractionState, setChibiInteractionState] = useState({
        lastTrollTime: 0,
        lastFixTime: 0,
        trollCount: 0,
        fixCount: 0,
        currentInteraction: null, // 'trolling' | 'fixing' | null
    });
    const chibiInteractionRef = useRef({
        lastTrollTime: 0,
        lastFixTime: 0,
        trolledPixels: [],      // Pixels trollés par Tank
        beruOriginalZone: null, // Zone originale de Béru

        // 🎭 ÉTATS ÉMOTIONNELS (mémoire 60s glissante)
        emotional: {
            tank: {
                state: 'happy',       // 'happy' | 'overexcited' | 'troll'
                trollCount60s: 0,     // Trolls dans les 60 dernières secondes
                lastMessages: [],     // Historique des messages récents [{msg, time}]
            },
            beru_papillon: {
                state: 'calm',        // 'calm' | 'annoyed' | 'resigned'
                repairCount60s: 0,    // Réparations dans les 60 dernières secondes
                frustrationLevel: 0,  // 0-10, augmente avec les trolls
                lastMessages: [],     // Historique des messages récents
            }
        },

        // 🌟 MESSAGES LÉGENDAIRES - Tracking
        legendary: {
            lastLegendaryTime: 0,         // Timestamp du dernier message légendaire
            legendaryCount: 0,            // Nombre total (pour stats)
            cooldownMs: 3 * 24 * 60 * 60 * 1000, // 3 jours en ms (ajustable pour test)
        }
    });

    // 🎮 Sélection du Chibi dessinateur
    const [selectedPainterId, setSelectedPainterId] = useState('beru_papillon');
    const currentPainter = CHIBI_PAINTERS[selectedPainterId];

    // 🛡️ ANTI-SPAM: Protection contre les doubles clics
    const lastButtonClickRef = useRef({
        autoPipette: 0,
        chibiToggle: 0,
        chibiSelect: 0,
    });
    const BUTTON_COOLDOWN_MS = 300; // 300ms entre chaque clic

    // 🦋 AUTO-DRAW MULTI-CHIBI - Système pour jusqu'à 2 Chibis dessinateurs
    const MAX_ACTIVE_CHIBIS = 2;

    // État pour chaque chibi actif: { [id]: { active, timeRemaining, position, facingFront, message, direction } }
    const [activeChibis, setActiveChibis] = useState({});

    // Ref pour accéder à l'état actuel des chibis dans les animations (évite les closures stale)
    const activeChibisRef = useRef({});

    // Refs pour chaque chibi actif
    const chibiTimersRef = useRef({});
    const chibiAnimationsRef = useRef({});
    const chibiTargetsRef = useRef({});
    const chibiMessageTimeoutsRef = useRef({});
    const chibiScanPositionsRef = useRef({});
    const chibiZoneDataRef = useRef({}); // Pour le mode zone
    const chibiLastMessageTimeRef = useRef({}); // 🔧 FIX: Anti-flood - temps du dernier message

    // 🎭 SYSTÈME DE MESSAGES COORDONNÉ - Évite les superpositions et interruptions
    const messageQueueRef = useRef([]); // File d'attente de messages
    const currentSpeakerRef = useRef(null); // Qui parle actuellement
    const lastGlobalMessageTimeRef = useRef(0); // Dernier message affiché (global)
    const messageProcessingRef = useRef(false); // Est-ce qu'on traite un message ?

    // Refs de compatibilité (pour le code existant)
    const autoDrawBeruAnimationRef = useRef(null);
    const autoDrawBeruTimerRef = useRef(null);
    const beruTargetRef = useRef({ x: 0, y: 0 });
    const beruMessageTimeoutRef = useRef(null);
    const scanPositionRef = useRef({ row: 0, col: 0, direction: 1 });

    // Helpers pour mettre à jour un chibi spécifique
    const updateChibiState = (chibiId, updates) => {
        setActiveChibis(prev => ({
            ...prev,
            [chibiId]: { ...prev[chibiId], ...updates }
        }));
    };

    // Synchroniser la ref avec l'état pour les animations (évite les closures stale)
    useEffect(() => {
        activeChibisRef.current = activeChibis;
    }, [activeChibis]);

    // 📌 COMPATIBILITÉ - Wrappers pour l'ancien code (agissent sur le chibi sélectionné)
    const setAutoDrawBeruActive = (value) => {
        if (value) {
            setActiveChibis(prev => ({
                ...prev,
                [selectedPainterId]: {
                    ...prev[selectedPainterId],
                    active: true,
                    timeRemaining: CHIBI_PAINTERS[selectedPainterId]?.duration || 60
                }
            }));
        } else {
            setActiveChibis(prev => {
                const newState = { ...prev };
                if (newState[selectedPainterId]) {
                    newState[selectedPainterId] = { ...newState[selectedPainterId], active: false };
                }
                return newState;
            });
        }
    };
    const setAutoDrawBeruTimeRemaining = (value) => updateChibiState(selectedPainterId, { timeRemaining: value });
    const setBeruPosition = (value) => updateChibiState(selectedPainterId, {
        position: typeof value === 'function'
            ? value(activeChibis[selectedPainterId]?.position || { x: 0, y: 0 })
            : value
    });
    const setBeruFacingFront = (value) => updateChibiState(selectedPainterId, { facingFront: value });
    const setBeruMessage = (value) => updateChibiState(selectedPainterId, { message: value });
    const setBeruDirection = (value) => updateChibiState(selectedPainterId, { direction: value });

    // Valeurs calculées pour compatibilité avec l'ancien code
    const autoDrawBeruActive = Object.values(activeChibis).some(c => c.active);
    const autoDrawBeruTimeRemaining = activeChibis[selectedPainterId]?.timeRemaining || currentPainter?.duration || 60;
    const beruPosition = activeChibis[selectedPainterId]?.position || { x: 0, y: 0 };
    const beruFacingFront = activeChibis[selectedPainterId]?.facingFront || false;
    const beruMessage = activeChibis[selectedPainterId]?.message || null;
    const beruDirection = activeChibis[selectedPainterId]?.direction || 1;

    // Helpers pour le système multi-chibi
    const getActiveChibiCount = () => Object.values(activeChibis).filter(c => c.active).length;
    const isChibiActive = (chibiId) => activeChibis[chibiId]?.active || false;
    const getChibiState = (chibiId) => activeChibis[chibiId] || {
        active: false,
        timeRemaining: CHIBI_PAINTERS[chibiId]?.duration || 60,
        position: { x: 0, y: 0 },
        facingFront: false,
        message: null,
        direction: 1
    };

    // 🔢 BRUSH SIZE CONTROLS - Long press refs
    const brushSizeIntervalRef = useRef(null);

    // ✨ PRECISION DRAWING - Interpolation & Stabilization
    const lastPointRef = useRef(null); // Dernier point dessiné pour interpolation
    const [stabilization, setStabilization] = useState(0); // 0-10, 0 = off
    const stabilizationBufferRef = useRef([]); // Buffer pour lissage
    const STABILIZATION_BUFFER_SIZE = 8; // Nombre de points à moyenner

    // 🎯 CURSOR PREVIEW - Position du curseur pour preview
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0, visible: false });

    // 🖌️ BRUSH ENGINE PRO - Tracking pression et vitesse
    const lastDrawTimeRef = useRef(performance.now());
    const lastDrawPositionRef = useRef(null);
    const currentVelocityRef = useRef(0);
    const currentPressureRef = useRef(1.0);

    // 🖌️ BRUSH ENGINE PRO - Instance et paramètres avancés
    const brushEngineRef = useRef(null);
    const [pressureSensitivity, setPressureSensitivity] = useState(0.85); // 0-1
    const [velocitySensitivity, setVelocitySensitivity] = useState(0.3);  // 0-1
    const [currentPressure, setCurrentPressure] = useState(1.0);          // État de la pression actuelle
    const [currentVelocity, setCurrentVelocity] = useState(0);            // État de la vitesse actuelle
    const [enablePressure, setEnablePressure] = useState(true);           // Activer/désactiver pression
    const [enableVelocity, setEnableVelocity] = useState(true);           // Activer/désactiver vitesse
    const [taperStart, setTaperStart] = useState(0.2);                    // Effilage début
    const [taperEnd, setTaperEnd] = useState(0.3);                        // Effilage fin

    // Initialiser le BrushEngine
    if (!brushEngineRef.current) {
        brushEngineRef.current = new BrushEngine();
    }

    // 🌐 MULTIPLAYER: Ref pour tracker les points du stroke en cours
    const currentStrokePointsRef = useRef([]);

    // 🌐 MULTIPLAYER: Utiliser les settings du serveur si en mode multi
    const effectiveAutoPipette = multiplayerMode && multiplayer?.settings
        ? multiplayer.settings.autoPipette
        : autoPipetteMode;
    const effectiveEraserAllowed = multiplayerMode && multiplayer?.settings
        ? multiplayer.settings.eraserAllowed
        : true;

    const currentModelData = getModel(selectedHunter, selectedModel);
    const availableModels = getHunterModels(selectedHunter);

    // Touch gestures
    const { handleTouchStart: canvasTouchStart, handleTouchMove: canvasTouchMove, handleTouchEnd: canvasTouchEnd } =
        useTouchGestures(
            isMobile && interactionMode === 'pan',
            (delta) => handleZoom(delta),
            (dx, dy) => {
                setPanOffset(prev => ({
                    x: prev.x + dx,
                    y: prev.y + dy
                }));
            }
        );

    // 💾 Sauvegarde automatique du dernier dessin visité
    useEffect(() => {
        try {
            localStorage.setItem('drawberu_last_drawing', JSON.stringify({
                hunter: selectedHunter,
                model: selectedModel
            }));
            console.log('✅ Last drawing saved:', selectedHunter, selectedModel);
        } catch (error) {
            console.error('❌ Error saving last drawing:', error);
        }
    }, [selectedHunter, selectedModel]);

    // Load model overlay for mobile and desktop
    useEffect(() => {
        if (!currentModelData || !showModelOverlay) return;

        const overlayCanvas = overlayCanvasRef.current;
        if (!overlayCanvas) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const { width, height } = currentModelData.canvasSize;
            overlayCanvas.width = width;
            overlayCanvas.height = height;
            const ctx = overlayCanvas.getContext('2d');
            ctx.clearRect(0, 0, width, height);
            ctx.globalAlpha = modelOverlayOpacity;
            ctx.drawImage(img, 0, 0, width, height);
        };
        img.src = currentModelData.reference;
    }, [showModelOverlay, modelOverlayOpacity, currentModelData]);

    // Load canvas and template
    useEffect(() => {
        if (!currentModelData) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const { width, height } = currentModelData.canvasSize;
        canvas.width = width;
        canvas.height = height;

        layersRef.current = layers.map(() => {
            const layerCanvas = document.createElement('canvas');
            layerCanvas.width = width;
            layerCanvas.height = height;
            return layerCanvas;
        });

        console.log('🔍 DEBUG LOAD - Start');

        const userData = JSON.parse(localStorage.getItem('builderberu_users') || '{}');
        const existingColoring = userData.user?.accounts?.default?.colorings?.[selectedHunter]?.[selectedModel];

        if (existingColoring && existingColoring.layers) {
            console.log('✅ Loading existing coloring');
            let loadedLayers = 0;
            const totalLayers = Math.min(existingColoring.layers.length, layersRef.current.length);

            existingColoring.layers.forEach((layerData, i) => {
                if (i < layersRef.current.length) {
                    const img = new Image();
                    img.onload = () => {
                        const ctx = layersRef.current[i].getContext('2d');
                        ctx.clearRect(0, 0, layersRef.current[i].width, layersRef.current[i].height);
                        ctx.drawImage(img, 0, 0);
                        loadedLayers++;

                        if (loadedLayers === totalLayers) {
                            renderLayers();
                            setTimeout(() => saveToHistory(), 100);
                        }
                    };
                    img.onerror = () => {
                        console.error(`❌ Error loading layer ${i}`);
                        loadedLayers++;
                        if (loadedLayers === totalLayers) {
                            renderLayers();
                            setTimeout(() => saveToHistory(), 100);
                        }
                    };
                    img.src = layerData.data;
                }
            });

            setLayers(prevLayers => prevLayers.map((layer, i) => ({
                ...layer,
                visible: existingColoring.layers[i]?.visible ?? layer.visible,
                opacity: existingColoring.layers[i]?.opacity ?? layer.opacity,
                locked: existingColoring.layers[i]?.locked ?? layer.locked
            })));

            setImagesLoaded(true);
        } else {
            console.log('📄 Loading blank template');
            const templateImg = new Image();
            templateImg.crossOrigin = "anonymous";
            templateImg.onload = () => {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(templateImg, 0, 0, width, height);
                setImagesLoaded(true);
                saveToHistory();
            };
            templateImg.onerror = () => {
                console.error('❌ Error loading template');
                setImagesLoaded(true);
            };
            templateImg.src = currentModelData.template;
        }

        // Load reference
        const refCanvas = referenceCanvasRef.current;
        if (refCanvas) {
            const refImg = new Image();
            refImg.crossOrigin = "anonymous";
            refImg.onload = () => {
                refCanvas.width = refImg.width;
                refCanvas.height = refImg.height;
                const refCtx = refCanvas.getContext('2d');
                refCtx.drawImage(refImg, 0, 0);
            };
            refImg.src = currentModelData.reference;
        }
    }, [currentModelData, selectedHunter, selectedModel]);

    // 🎮 CHEAT CODE: Détection de la combinaison A+E+R+T+Shift
    useEffect(() => {
        // Desktop uniquement
        if (isMobile) return;

        const handleKeyDown = (e) => {
            setPressedKeys(prev => {
                const newKeys = new Set(prev);
                newKeys.add(e.key.toLowerCase());

                // Vérifier si la combinaison correcte est pressée
                if (newKeys.has('a') && newKeys.has('e') && newKeys.has('r') &&
                    newKeys.has('t') && e.shiftKey) {
                    activateCheatMode();
                }

                return newKeys;
            });
        };

        const handleKeyUp = (e) => {
            setPressedKeys(prev => {
                const newKeys = new Set(prev);
                newKeys.delete(e.key.toLowerCase());
                return newKeys;
            });
        };

        const activateCheatMode = () => {
            // Vérifier le cooldown
            const now = Date.now();
            const storedCooldown = localStorage.getItem('drawberu_cheat_cooldown');

            if (storedCooldown) {
                const cooldownEnd = parseInt(storedCooldown);
                if (now < cooldownEnd) {
                    const remainingMinutes = Math.ceil((cooldownEnd - now) / 60000);
                    alert(`⏳ Cheat code en cooldown ! Réessayez dans ${remainingMinutes} minute(s).`);
                    return;
                }
            }

            // Activer le cheat mode
            setCheatModeActive(true);
            setCheatTimeRemaining(10);
            console.log('🎮 CHEAT MODE ACTIVÉ ! 10 secondes de coloriage parfait...');

            // Décompte
            let timeLeft = 10;
            cheatCountdownRef.current = setInterval(() => {
                timeLeft--;
                setCheatTimeRemaining(timeLeft);
                if (timeLeft <= 0) {
                    clearInterval(cheatCountdownRef.current);
                }
            }, 1000);

            // Timer de 10 secondes
            if (cheatTimerRef.current) {
                clearTimeout(cheatTimerRef.current);
            }

            cheatTimerRef.current = setTimeout(() => {
                setCheatModeActive(false);
                console.log('⏱️ Cheat mode désactivé');

                // Définir le cooldown d'1 heure
                const cooldownEnd = Date.now() + (60 * 60 * 1000); // 1 heure
                localStorage.setItem('drawberu_cheat_cooldown', cooldownEnd.toString());
                setCheatCooldown(cooldownEnd);
            }, 10000); // 10 secondes
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (cheatTimerRef.current) {
                clearTimeout(cheatTimerRef.current);
            }
            if (cheatCountdownRef.current) {
                clearInterval(cheatCountdownRef.current);
            }
        };
    }, [isMobile]);

    // 🎯 Identifiant stable des chibis actifs (ne change pas quand timeRemaining change)
    const activeChibiIds = Object.keys(activeChibis)
        .filter(id => activeChibis[id]?.active)
        .sort()
        .join(',');

    // 🦋 AUTO-DRAW MULTI-CHIBI: Animation et coloriage automatique
    useEffect(() => {
        if (!currentModelData || !imagesLoaded) return;

        const canvas = canvasRef.current;
        const refCanvas = referenceCanvasRef.current;
        if (!canvas || !refCanvas) return;

        // Utiliser la ref pour accéder à l'état actuel des chibis (évite les closures stale)
        const currentActiveChibis = activeChibisRef.current;

        // Pour chaque chibi actif, démarrer son animation
        Object.entries(currentActiveChibis).forEach(([chibiId, chibiState]) => {
            if (!chibiState.active) return;

            // Si ce chibi a déjà une animation en cours, ne pas en créer une nouvelle
            if (chibiAnimationsRef.current[chibiId]) return;

            const painter = CHIBI_PAINTERS[chibiId];
            if (!painter) return;

            console.log(`🎨 Démarrage animation pour: ${painter.name}`);

            // Initialiser la position selon le mode de mouvement
            const initialPos = painter.movementMode === 'methodical' || painter.movementMode === 'zone'
                ? { x: 0, y: 0 }
                : { x: canvas.width / 2, y: canvas.height / 2 };

            updateChibiState(chibiId, { position: initialPos });

            if (!chibiScanPositionsRef.current[chibiId]) {
                chibiScanPositionsRef.current[chibiId] = { row: 0, col: 0, direction: 1 };
            }
            if (!chibiTargetsRef.current[chibiId]) {
                chibiTargetsRef.current[chibiId] = {
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height
                };
            }
            if (!chibiZoneDataRef.current[chibiId]) {
                chibiZoneDataRef.current[chibiId] = { currentZone: null, zoneProgress: 0, lastZoneTime: 0 };
            }
        }); // Fin du forEach pour initialisation des chibis actifs

        // Si aucun chibi actif, ne rien faire
        const activeChiibsCount = Object.values(currentActiveChibis).filter(c => c.active).length;
        if (activeChiibsCount === 0) return;

        // Fonction pour obtenir la couleur depuis la référence
        const getColorAtPosition = (posX, posY) => {
            try {
                const refX = Math.floor(posX * refCanvas.width / canvas.width);
                const refY = Math.floor(posY * refCanvas.height / canvas.height);

                if (refX >= 0 && refX < refCanvas.width && refY >= 0 && refY < refCanvas.height) {
                    const refCtx = refCanvas.getContext('2d', { willReadFrequently: true });
                    const pixel = refCtx.getImageData(refX, refY, 1, 1).data;
                    if (pixel[3] > 0) {
                        const r = pixel[0];
                        const g = pixel[1];
                        const b = pixel[2];
                        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
                    }
                }
            } catch (err) { /* ignore */ }
            return '#FFFFFF';
        };

        // 🎨 Fonction pour modifier la couleur en mode troll (Tank)
        const trollifyColor = (hexColor) => {
            // Convertir hex en RGB
            const r = parseInt(hexColor.slice(1, 3), 16);
            const g = parseInt(hexColor.slice(3, 5), 16);
            const b = parseInt(hexColor.slice(5, 7), 16);

            // Mode troll : décaler les couleurs de manière aléatoire
            const trollMode = Math.random();
            let newR, newG, newB;

            if (trollMode < 0.3) {
                // Swap R et B
                newR = b; newG = g; newB = r;
            } else if (trollMode < 0.5) {
                // Inverser
                newR = 255 - r; newG = 255 - g; newB = 255 - b;
            } else if (trollMode < 0.7) {
                // Décaler vers le rouge/rose
                newR = Math.min(255, r + 100);
                newG = Math.max(0, g - 50);
                newB = Math.min(255, b + 50);
            } else {
                // Couleur complètement aléatoire (rare mais chaotique)
                newR = Math.floor(Math.random() * 256);
                newG = Math.floor(Math.random() * 256);
                newB = Math.floor(Math.random() * 256);
            }

            return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1).toUpperCase()}`;
        };

        // 🖤 Fonction pour faire une tache d'encre (Tank)
        const makeInkSplash = (x, y, ctx) => {
            const splashSize = Math.floor(Math.random() * 15) + 10; // 10-25 pixels
            const inkColors = ['#1a1a2e', '#16213e', '#0f0f1a', '#2c2c54', '#1e1e2f'];
            const inkColor = inkColors[Math.floor(Math.random() * inkColors.length)];

            ctx.fillStyle = inkColor;
            ctx.beginPath();

            // Dessiner plusieurs cercles pour un effet de splash
            for (let i = 0; i < 5; i++) {
                const offsetX = (Math.random() - 0.5) * splashSize;
                const offsetY = (Math.random() - 0.5) * splashSize;
                const radius = Math.random() * (splashSize / 3) + 2;
                ctx.moveTo(x + offsetX + radius, y + offsetY);
                ctx.arc(x + offsetX, y + offsetY, radius, 0, Math.PI * 2);
            }
            ctx.fill();
        };

        // 🎯 Fonction pour vérifier si une zone est non coloriée (transparente)
        const isZoneUncolored = (x, y, width, height) => {
            const activeLayerIndex = layers.findIndex(l => l.id === activeLayer);
            const layerCanvas = layersRef.current[activeLayerIndex];
            if (!layerCanvas) return false;

            const ctx = layerCanvas.getContext('2d', { alpha: true });
            const imageData = ctx.getImageData(Math.floor(x), Math.floor(y), Math.min(width, canvas.width - x), Math.min(height, canvas.height - y));
            const data = imageData.data;

            // Compter les pixels transparents
            let transparentPixels = 0;
            const totalPixels = imageData.width * imageData.height;

            for (let i = 3; i < data.length; i += 4) {
                if (data[i] < 10) { // Alpha < 10 = transparent
                    transparentPixels++;
                }
            }

            // Retourner true si plus de 60% de la zone est transparente
            return (transparentPixels / totalPixels) > 0.6;
        };

        // 🎭 SYSTÈME DE MESSAGES COORDONNÉ - Un seul chibi parle à la fois !
        // Traite la file d'attente de messages de manière ordonnée
        const processMessageQueue = () => {
            // Si déjà en train de traiter ou file vide, sortir
            if (messageProcessingRef.current || messageQueueRef.current.length === 0) return;

            const now = Date.now();
            // Attendre 2s minimum entre chaque message (global) pour laisser le temps de lire
            if (now - lastGlobalMessageTimeRef.current < 2000) {
                // Réessayer dans 800ms
                setTimeout(processMessageQueue, 800);
                return;
            }

            // Prendre le prochain message de la file
            const nextMessage = messageQueueRef.current.shift();
            if (!nextMessage) return;

            const { chibiId, message, duration, faceFront, priority } = nextMessage;

            // Si quelqu'un parle déjà et ce n'est pas prioritaire, remettre en file
            if (currentSpeakerRef.current && currentSpeakerRef.current !== chibiId && priority !== 'high') {
                messageQueueRef.current.unshift(nextMessage); // Remettre en tête
                setTimeout(processMessageQueue, 800);
                return;
            }

            messageProcessingRef.current = true;
            currentSpeakerRef.current = chibiId;
            lastGlobalMessageTimeRef.current = now;

            // 🔧 SAFETY: Reset automatique après 10 secondes max (au cas où le timeout échoue)
            setTimeout(() => {
                if (messageProcessingRef.current && currentSpeakerRef.current === chibiId) {
                    console.log('🔧 Safety reset du système de messages');
                    messageProcessingRef.current = false;
                    currentSpeakerRef.current = null;
                    processMessageQueue();
                }
            }, 10000);

            // Effacer le message de l'autre chibi pour éviter la superposition
            const otherChibiId = chibiId === 'tank' ? 'beru_papillon' : 'tank';
            const otherState = activeChibisRef.current[otherChibiId];
            if (otherState?.message) {
                updateChibiState(otherChibiId, { message: null, facingFront: false });
            }

            // Afficher le message
            updateChibiState(chibiId, { message, facingFront: faceFront });

            // Programmer la fin du message
            if (chibiMessageTimeoutsRef.current[chibiId]) {
                clearTimeout(chibiMessageTimeoutsRef.current[chibiId]);
            }
            chibiMessageTimeoutsRef.current[chibiId] = setTimeout(() => {
                updateChibiState(chibiId, { message: null, facingFront: false });
                currentSpeakerRef.current = null;
                messageProcessingRef.current = false;

                // Traiter le prochain message après un délai suffisant
                // pour que la bulle ait le temps de disparaître
                setTimeout(processMessageQueue, 600);
            }, duration);
        };

        // 🎭 Ajouter un message à la file (remplace showMessageForChibi)
        const queueMessage = (chibiId, message, options = {}) => {
            const { faceFront = false, priority = 'normal' } = options;

            // 📏 Calculer la durée basée sur la longueur du message
            // Formula: animation (50ms/char) + lecture (80ms/char) + marge (1500ms)
            // Synchronisé avec ChibiBubble.jsx pour cohérence
            const messageLength = message?.length || 0;
            const animationTime = messageLength * 50; // Temps d'animation du texte
            const readingTime = messageLength * 80; // Temps de lecture
            const calculatedDuration = animationTime + readingTime + 1500; // + marge généreuse

            // Durée finale: entre 4s minimum et 12s maximum (plus de temps pour lire)
            const duration = options.duration || Math.min(12000, Math.max(4000, calculatedDuration));

            // Anti-flood: max 3 messages en attente par chibi
            const pendingForChibi = messageQueueRef.current.filter(m => m.chibiId === chibiId).length;
            if (pendingForChibi >= 3) return;

            // Anti-flood global: max 6 messages en attente total
            if (messageQueueRef.current.length >= 6) return;

            // Ajouter à la file
            if (priority === 'high') {
                // Les messages prioritaires passent devant
                messageQueueRef.current.unshift({ chibiId, message, duration, faceFront, priority });
            } else {
                messageQueueRef.current.push({ chibiId, message, duration, faceFront, priority });
            }

            // Lancer le traitement
            processMessageQueue();
        };

        // 🎭 Fonction pour afficher un message pour un chibi spécifique (compatible avec l'ancien code)
        const showMessageForChibi = (chibiId, painter, forceFaceFront = false) => {
            const messages = painter.messages;
            if (!messages || messages.length === 0) return;

            // Anti-flood individuel: 8 secondes minimum entre les messages solo
            const now = Date.now();
            const lastMessageTime = chibiLastMessageTimeRef.current[chibiId] || 0;
            if (now - lastMessageTime < 8000) return;
            chibiLastMessageTimeRef.current[chibiId] = now;

            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            const shouldFaceFront = forceFaceFront || Math.random() < 0.25;

            queueMessage(chibiId, randomMessage, {
                duration: 3500,
                faceFront: shouldFaceFront,
                priority: 'normal'
            });
        };

        // 🎭 HELPER: Nettoyer la mémoire des messages > 60s
        const cleanOldMessages = (chibiId) => {
            const now = Date.now();
            const emotional = chibiInteractionRef.current.emotional?.[chibiId];
            if (emotional?.lastMessages) {
                emotional.lastMessages = emotional.lastMessages.filter(m => now - m.time < 60000);
            }
        };

        // 🎭 HELPER: Mettre à jour l'état émotionnel
        const updateEmotionalState = (chibiId, action) => {
            const emotional = chibiInteractionRef.current.emotional;
            if (!emotional) return;

            const now = Date.now();

            if (chibiId === 'tank') {
                if (action === 'troll') {
                    emotional.tank.trollCount60s++;
                    // État: happy → overexcited (après 2+ trolls en 60s)
                    if (emotional.tank.trollCount60s >= 2) {
                        emotional.tank.state = 'overexcited';
                    }
                }
                // Reset après 60s d'inactivité
                setTimeout(() => {
                    if (emotional.tank.trollCount60s > 0) {
                        emotional.tank.trollCount60s--;
                        if (emotional.tank.trollCount60s < 2) {
                            emotional.tank.state = 'happy';
                        }
                    }
                }, 60000);
            }

            if (chibiId === 'beru_papillon') {
                if (action === 'frustrated') {
                    emotional.beru_papillon.frustrationLevel = Math.min(10, emotional.beru_papillon.frustrationLevel + 2);
                    // État: calm → annoyed (frustration 3+) → resigned (frustration 6+)
                    if (emotional.beru_papillon.frustrationLevel >= 6) {
                        emotional.beru_papillon.state = 'resigned';
                    } else if (emotional.beru_papillon.frustrationLevel >= 3) {
                        emotional.beru_papillon.state = 'annoyed';
                    }
                }
                if (action === 'repair') {
                    emotional.beru_papillon.repairCount60s++;
                    // Réparer diminue un peu la frustration
                    emotional.beru_papillon.frustrationLevel = Math.max(0, emotional.beru_papillon.frustrationLevel - 0.5);
                }
                // Reset progressif
                setTimeout(() => {
                    if (emotional.beru_papillon.frustrationLevel > 0) {
                        emotional.beru_papillon.frustrationLevel = Math.max(0, emotional.beru_papillon.frustrationLevel - 1);
                        if (emotional.beru_papillon.frustrationLevel < 3) {
                            emotional.beru_papillon.state = 'calm';
                        }
                    }
                    if (emotional.beru_papillon.repairCount60s > 0) {
                        emotional.beru_papillon.repairCount60s--;
                    }
                }, 60000);
            }
        };

        // 🎭 HELPER: Sélectionner un message sans répétition récente
        const selectMessageWithoutRepeat = (messages, chibiId) => {
            if (!messages || messages.length === 0) return null;

            cleanOldMessages(chibiId);
            const emotional = chibiInteractionRef.current.emotional?.[chibiId];
            const recentMessages = emotional?.lastMessages?.map(m => m.msg) || [];

            // Filtrer les messages déjà utilisés récemment
            const availableMessages = messages.filter(m => !recentMessages.includes(m.message));

            // Si tous ont été utilisés, prendre n'importe lequel
            const pool = availableMessages.length > 0 ? availableMessages : messages;
            const selected = pool[Math.floor(Math.random() * pool.length)];

            // Enregistrer le message utilisé
            if (emotional) {
                emotional.lastMessages.push({ msg: selected.message, time: Date.now() });
            }

            return selected;
        };

        // 🌟 HELPER: Tenter un message légendaire
        const tryLegendaryMessage = (chibiId) => {
            const legendary = chibiInteractionRef.current.legendary;
            const now = Date.now();

            // Vérifier le cooldown (3 jours par défaut, réduit pour test)
            if (now - legendary.lastLegendaryTime < legendary.cooldownMs) return null;

            // 0.5% de chance
            if (Math.random() > 0.005) return null;

            // 🌟 MESSAGE LÉGENDAIRE !
            const legendaryType = chibiId === 'tank' ? 'legendary_tank' : 'legendary_beru';
            const legendaryMessages = CHIBI_INTERACTIONS[legendaryType];
            if (!legendaryMessages || legendaryMessages.length === 0) return null;

            const selected = legendaryMessages[Math.floor(Math.random() * legendaryMessages.length)];

            // Marquer comme utilisé
            legendary.lastLegendaryTime = now;
            legendary.legendaryCount++;

            console.log(`🌟 MESSAGE LÉGENDAIRE #${legendary.legendaryCount} de ${chibiId} !`);

            return selected;
        };

        // 🤝 SYSTÈME D'INTERACTIONS - Messages d'interaction entre chibis (prioritaires)
        const showInteractionMessage = (interactionType) => {
            const now = Date.now();

            // Anti-flood: 5 secondes minimum entre interactions du même type
            const lastTime = chibiLastMessageTimeRef.current[`interaction_${interactionType}`] || 0;
            if (now - lastTime < 5000) return;
            chibiLastMessageTimeRef.current[`interaction_${interactionType}`] = now;

            // Déterminer le chibi qui parle
            const isFromTank = interactionType.includes('tank');
            const isFromBeru = interactionType.includes('beru');
            const chibiId = isFromTank ? 'tank' : 'beru_papillon';
            const painter = CHIBI_PAINTERS[chibiId];
            if (!painter) return;

            // 🎭 Mettre à jour l'état émotionnel
            if (interactionType === 'tank_trolls_beru') {
                updateEmotionalState('tank', 'troll');
                updateEmotionalState('beru_papillon', 'frustrated');
            }
            if (interactionType === 'beru_fixes_tank') {
                updateEmotionalState('beru_papillon', 'repair');
            }

            // 🌟 Tenter un message légendaire d'abord (ultra rare)
            const legendaryMsg = tryLegendaryMessage(chibiId);
            if (legendaryMsg) {
                queueMessage(chibiId, legendaryMsg.message, {
                    duration: 6000, // Plus long pour les légendaires
                    faceFront: true,
                    priority: 'high'
                });
                return;
            }

            // 🔥 Vérifier si on doit utiliser un message d'état émotionnel
            const emotional = chibiInteractionRef.current.emotional;
            let interactions = CHIBI_INTERACTIONS[interactionType];

            // Tank surexcité → messages spéciaux
            if (chibiId === 'tank' && emotional?.tank?.state === 'overexcited' && Math.random() < 0.4) {
                interactions = CHIBI_INTERACTIONS['tank_overexcited'] || interactions;
            }

            // Béru résigné → messages spéciaux
            if (chibiId === 'beru_papillon' && emotional?.beru_papillon?.state === 'resigned' && Math.random() < 0.5) {
                interactions = CHIBI_INTERACTIONS['beru_resigned'] || interactions;
            }

            if (!interactions || interactions.length === 0) return;

            // 🎭 Sélectionner sans répétition
            const interaction = selectMessageWithoutRepeat(interactions, chibiId);
            if (!interaction) return;

            // Les interactions sont prioritaires et durent plus longtemps
            queueMessage(chibiId, interaction.message, {
                duration: 4500,
                faceFront: true,
                priority: 'high'
            });
        };

        // 🐻 TANK TROLL - Tank va sur la zone de Béru et fait des dégâts
        const tankTrollsBeru = (tankState, beruState) => {
            if (!beruState?.active || !tankState?.active) return false;

            const now = performance.now();
            const interactionData = chibiInteractionRef.current;

            // 🎭 Cooldown de 15-25 secondes entre trolls (plus espacé, plus impactant)
            const trollCooldown = 15000 + Math.random() * 10000;
            if (now - interactionData.lastTrollTime < trollCooldown) return false;

            const tankPainter = CHIBI_PAINTERS.tank;
            // 8% de chance par vérification (moins fréquent mais plus mémorable)
            if (Math.random() > 0.08) return false;

            // Tank se dirige vers la position de Béru !
            const beruPos = beruState.position || { x: canvas.width / 2, y: canvas.height / 2 };
            const trollRadius = tankPainter.chaoticBehavior?.trollRadius || 30;

            // 🎨 DESSINER LES PIXELS TROLLÉS !
            const activeLayerIndex = layers.findIndex(l => l.id === activeLayer);
            const layerCanvas = layersRef.current[activeLayerIndex];
            if (!layerCanvas) return false;

            const ctx = layerCanvas.getContext('2d', { alpha: true });

            // Tank dessine 8-20 pixels trollés autour de la position de Béru
            const trollPixelCount = Math.floor(Math.random() * 12) + 8;

            for (let i = 0; i < trollPixelCount; i++) {
                const trollX = Math.floor(beruPos.x + (Math.random() - 0.5) * trollRadius * 2);
                const trollY = Math.floor(beruPos.y + (Math.random() - 0.5) * trollRadius * 2);

                // Vérifier les limites
                if (trollX < 0 || trollX >= canvas.width || trollY < 0 || trollY >= canvas.height) continue;

                // Obtenir la couleur originale pour la sauvegarder
                const refCanvas = referenceCanvasRef.current;
                const refCtx = refCanvas?.getContext('2d');
                let originalColor = '#ffffff';
                if (refCtx) {
                    const pixel = refCtx.getImageData(trollX, trollY, 1, 1).data;
                    originalColor = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`;
                }

                // Couleur trollée (décalée)
                const trollColor = trollifyColor(originalColor);

                // Sauvegarder le pixel pour que Béru puisse le réparer
                interactionData.trolledPixels.push({
                    x: trollX,
                    y: trollY,
                    time: now,
                    originalColor: originalColor
                });

                // Dessiner le pixel trollé !
                ctx.fillStyle = trollColor;
                ctx.fillRect(trollX, trollY, tankPainter.pixelSize, tankPainter.pixelSize);
            }

            // Limiter l'historique à 100 pixels
            if (interactionData.trolledPixels.length > 100) {
                interactionData.trolledPixels = interactionData.trolledPixels.slice(-100);
            }

            interactionData.lastTrollTime = now;

            // 🐻 Déplacer Tank vers la zone de Béru pour l'animation
            updateChibiState('tank', {
                position: { x: beruPos.x + (Math.random() - 0.5) * 20, y: beruPos.y + (Math.random() - 0.5) * 20 },
                direction: beruPos.x > canvas.width / 2 ? -1 : 1
            });

            // 🎬 SÉQUENCE THÉÂTRALE : Tank parle d'abord, puis Béru réagit
            showInteractionMessage('tank_trolls_beru');

            // Render pour montrer les dégâts
            renderLayers();

            // 🦋 Béru réagit après que Tank ait fini de parler (5 secondes)
            setTimeout(() => {
                // Vérifier que Béru est toujours actif
                if (activeChibisRef.current['beru_papillon']?.active) {
                    showInteractionMessage('beru_reacts_to_troll');
                }
            }, 5000);

            return true;
        };

        // 🦋 BÉRU RÉPARE - Béru quitte sa zone pour réparer les dégâts de Tank
        const beruFixesTankMess = (beruState, tankState) => {
            if (!beruState?.active) return false;

            const now = performance.now();
            const interactionData = chibiInteractionRef.current;

            // 🎭 Cooldown de 12-18 secondes entre réparations (synchronisé avec le troll)
            const fixCooldown = 12000 + Math.random() * 6000;
            if (now - interactionData.lastFixTime < fixCooldown) return false;

            // Vérifier s'il y a des pixels à réparer
            const recentTrolledPixels = interactionData.trolledPixels.filter(
                p => now - p.time < 20000 // Pixels trollés dans les 20 dernières secondes
            );

            // Béru ne répare que s'il y a assez de dégâts (au moins 5 pixels)
            if (recentTrolledPixels.length < 5) return false;

            const beruPainter = CHIBI_PAINTERS.beru_papillon;
            // 20% de chance de réparer quand il y a des dégâts
            if (Math.random() > 0.20) return false;

            // 🎨 BÉRU VA RÉPARER !
            const activeLayerIndex = layers.findIndex(l => l.id === activeLayer);
            const layerCanvas = layersRef.current[activeLayerIndex];
            if (!layerCanvas) return false;

            const ctx = layerCanvas.getContext('2d', { alpha: true });

            // Réparer tous les pixels trollés (ou max 15)
            const pixelsToFix = Math.min(recentTrolledPixels.length, 15);
            const fixedPixels = [];

            for (let i = 0; i < pixelsToFix; i++) {
                const pixelToFix = recentTrolledPixels[i];
                if (!pixelToFix) continue;

                // Obtenir la couleur correcte depuis la référence
                const refCanvas = referenceCanvasRef.current;
                const refCtx = refCanvas?.getContext('2d');
                let correctColor = pixelToFix.originalColor || '#ffffff';

                if (refCtx) {
                    const pixel = refCtx.getImageData(pixelToFix.x, pixelToFix.y, 1, 1).data;
                    correctColor = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`;
                }

                // Dessiner la bonne couleur !
                ctx.fillStyle = correctColor;
                ctx.fillRect(pixelToFix.x, pixelToFix.y, beruPainter.pixelSize, beruPainter.pixelSize);

                fixedPixels.push(pixelToFix);
            }

            // Mettre à jour la position de Béru vers le premier pixel réparé
            if (fixedPixels.length > 0) {
                const firstPixel = fixedPixels[0];
                updateChibiState('beru_papillon', {
                    position: { x: firstPixel.x, y: firstPixel.y },
                    direction: firstPixel.x > canvas.width / 2 ? -1 : 1,
                    isFixing: true
                });
            }

            interactionData.lastFixTime = now;

            // Retirer les pixels réparés de la liste
            interactionData.trolledPixels = interactionData.trolledPixels.filter(
                p => !fixedPixels.includes(p)
            );

            // Render pour montrer la réparation
            renderLayers();

            // 🎬 SÉQUENCE THÉÂTRALE : Béru annonce qu'il répare
            showInteractionMessage('beru_fixes_tank');

            // 🐻 Tank réagit après que Béru ait parlé (5 secondes)
            if (tankState?.active) {
                setTimeout(() => {
                    if (activeChibisRef.current['tank']?.active) {
                        showInteractionMessage('tank_reacts_to_fix');
                    }
                }, 5000);
            }

            // Après la réparation, Béru retourne à son travail
            setTimeout(() => {
                updateChibiState('beru_papillon', { isFixing: false });
            }, 1500);

            return true;
        };

        // 🎭 Vérifier les interactions entre chibis actifs
        const checkChibiInteractions = () => {
            const activeIds = Object.keys(activeChibisRef.current).filter(
                id => activeChibisRef.current[id]?.active
            );

            // Pas d'interactions si moins de 2 chibis actifs
            if (activeIds.length < 2) return;

            const beruState = activeChibisRef.current['beru_papillon'];
            const tankState = activeChibisRef.current['tank'];

            // Vérifier l'affinité entre les deux
            if (beruState?.active && tankState?.active) {
                const affinity = CHIBI_AFFINITIES['beru_papillon-tank'] || 'neutral';

                if (affinity === 'chaotic') {
                    // Tank peut troller Béru
                    if (tankTrollsBeru(tankState, beruState)) {
                        return; // Une interaction a eu lieu
                    }

                    // Béru peut réparer les dégâts de Tank
                    if (beruFixesTankMess(beruState, tankState)) {
                        return;
                    }
                }
            }
        };

        // 🎨 Fonction pour dessiner un pixel pour un painter spécifique
        const drawPixelForPainter = (x, y, painter) => {
            const activeLayerIndex = layers.findIndex(l => l.id === activeLayer);
            const layerCanvas = layersRef.current[activeLayerIndex];
            if (!layerCanvas) return;

            const ctx = layerCanvas.getContext('2d', { alpha: true });
            let color = getColorAtPosition(x, y);
            const pixelSize = painter.stats?.pixelPrecision || painter.pixelSize;

            if (painter.colorMode === 'troll') {
                color = trollifyColor(color);
            }

            if (painter.inkSplash && Math.random() < (painter.inkSplashChance || 0.05)) {
                makeInkSplash(x, y, ctx);
            }

            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = color;
            ctx.fillRect(Math.floor(x), Math.floor(y), pixelSize, pixelSize);
        };

        // 🎯 Fonction pour trouver une zone non coloriée pour un painter spécifique
        const findUncoloredZoneForPainter = (painter) => {
            const config = painter.zoneConfig || { minSize: 8, maxSize: 25 };
            const maxAttempts = 30;

            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                const x = Math.floor(Math.random() * (canvas.width - config.maxSize));
                const y = Math.floor(Math.random() * (canvas.height - config.maxSize));
                const width = Math.floor(Math.random() * (config.maxSize - config.minSize) + config.minSize);
                const height = Math.floor(Math.random() * (config.maxSize - config.minSize) + config.minSize);

                if (isZoneUncolored(x, y, width, height)) {
                    return { x, y, width, height };
                }
            }

            return {
                x: Math.floor(Math.random() * (canvas.width - config.maxSize)),
                y: Math.floor(Math.random() * (canvas.height - config.maxSize)),
                width: Math.floor(Math.random() * (config.maxSize - config.minSize) + config.minSize),
                height: Math.floor(Math.random() * (config.maxSize - config.minSize) + config.minSize)
            };
        };

        // 🦋 Fonction pour vérifier si un point est dans la zone définie par l'utilisateur (avec rotation)
        const isPointInUserZone = (px, py, zone) => {
            if (!zone) return false;

            const { shape, x: cx, y: cy, width, height, rotation } = zone;

            // Convertir la rotation en radians
            const rad = -(rotation * Math.PI) / 180;

            // Transformer le point dans le repère local de la zone (inverse de la rotation)
            const dx = px - cx;
            const dy = py - cy;
            const localX = dx * Math.cos(rad) - dy * Math.sin(rad);
            const localY = dx * Math.sin(rad) + dy * Math.cos(rad);

            const halfW = width / 2;
            const halfH = height / 2;

            switch (shape) {
                case 'rectangle':
                    return Math.abs(localX) <= halfW && Math.abs(localY) <= halfH;

                case 'square': {
                    const side = Math.min(width, height) / 2;
                    return Math.abs(localX) <= side && Math.abs(localY) <= side;
                }

                case 'circle': {
                    // Ellipse: (x/a)² + (y/b)² <= 1
                    const normalizedX = localX / halfW;
                    const normalizedY = localY / halfH;
                    return (normalizedX * normalizedX + normalizedY * normalizedY) <= 1;
                }

                case 'triangle': {
                    // Triangle isocèle pointant vers le haut
                    const y1 = -halfH, y2 = halfH;
                    if (localY < y1 || localY > y2) return false;
                    const progress = (localY - y1) / (y2 - y1);
                    const halfWidthAtY = halfW * progress;
                    return Math.abs(localX) <= halfWidthAtY;
                }

                case 'heart': {
                    // 💖 Coeur - formule paramétrique adaptée
                    const nx = localX / halfW;
                    const ny = -localY / halfH; // Inverser Y pour que le coeur pointe vers le bas
                    // Équation du coeur: (x² + y² - 1)³ - x²y³ <= 0
                    const x2 = nx * nx;
                    const y3 = ny * ny * ny;
                    const term = x2 + ny * ny - 1;
                    return (term * term * term - x2 * y3) <= 0;
                }

                case 'star': {
                    // ⭐ Étoile à 5 branches
                    const angle = Math.atan2(localY, localX);
                    const dist = Math.sqrt(localX * localX + localY * localY);
                    // Rayon qui varie selon l'angle (5 branches)
                    const branches = 5;
                    const innerRadius = halfW * 0.4;
                    const outerRadius = halfW;
                    // Modulation du rayon selon l'angle
                    const mod = (angle + Math.PI) % (2 * Math.PI / branches);
                    const normalized = mod / (2 * Math.PI / branches);
                    const radiusAtAngle = normalized < 0.5
                        ? innerRadius + (outerRadius - innerRadius) * (1 - normalized * 2)
                        : innerRadius + (outerRadius - innerRadius) * ((normalized - 0.5) * 2);
                    return dist <= radiusAtAngle;
                }

                case 'diamond': {
                    // 💎 Losange
                    return (Math.abs(localX) / halfW + Math.abs(localY) / halfH) <= 1;
                }

                case 'hexagon': {
                    // ⬡ Hexagone
                    const ax = Math.abs(localX);
                    const ay = Math.abs(localY);
                    return ay <= halfH && ax <= halfW && (ax / halfW + ay / halfH * 0.5) <= 1;
                }

                case 'cloud': {
                    // ☁️ Nuage (3 cercles qui se chevauchent)
                    const r = halfW * 0.4;
                    // Cercle central
                    if ((localX * localX + localY * localY) <= r * r) return true;
                    // Cercle gauche
                    const lx = localX + halfW * 0.35;
                    if ((lx * lx + localY * localY) <= r * r * 0.8) return true;
                    // Cercle droit
                    const rx = localX - halfW * 0.35;
                    if ((rx * rx + localY * localY) <= r * r * 0.8) return true;
                    // Cercle haut
                    const ty = localY + halfH * 0.25;
                    if ((localX * localX + ty * ty) <= r * r * 0.7) return true;
                    return false;
                }

                default:
                    return false;
            }
        };

        // 🦋 Générer les pixels à colorier dans la zone définie par l'utilisateur
        const generateUserZonePixels = (zone) => {
            if (!zone) return [];

            const { x: cx, y: cy, width, height } = zone;
            const pixels = [];

            // Parcourir la bounding box et collecter les pixels dans la forme
            const startX = Math.max(0, Math.floor(cx - width / 2 - 10));
            const endX = Math.min(canvas.width, Math.ceil(cx + width / 2 + 10));
            const startY = Math.max(0, Math.floor(cy - height / 2 - 10));
            const endY = Math.min(canvas.height, Math.ceil(cy + height / 2 + 10));

            for (let y = startY; y < endY; y++) {
                for (let x = startX; x < endX; x++) {
                    if (isPointInUserZone(x, y, zone)) {
                        pixels.push({ x, y });
                    }
                }
            }

            return pixels;
        };

        // 🦋 Démarrer l'animation pour chaque chibi actif qui n'a pas encore d'animation
        Object.entries(currentActiveChibis).forEach(([chibiId, chibiState]) => {
            if (!chibiState.active) return;
            if (chibiAnimationsRef.current[chibiId]) return; // Déjà une animation en cours

            const painter = CHIBI_PAINTERS[chibiId];
            if (!painter) return;

            console.log(`🎨 Démarrage animation pour: ${painter.name} (${chibiId})`);

            // 🔧 RESET du système de messages au démarrage d'un chibi
            // Évite que le système reste bloqué après un arrêt précédent
            messageProcessingRef.current = false;
            currentSpeakerRef.current = null;

            // Variables locales pour l'animation de ce chibi
            let frameCount = 0;

            // 🎬 Message de démarrage pour ce chibi (via le système de file d'attente)
            setTimeout(() => {
                queueMessage(chibiId, painter.startMessage, {
                    duration: 2500,
                    faceFront: true,
                    priority: 'high'
                });
            }, 500);

            // Animation loop spécifique pour ce chibi
            const animateChibi = () => {
                frameCount++;
                const now = performance.now();

                // Récupérer l'état actuel du chibi via la ref (évite les closures stale)
                const currentChibiState = activeChibisRef.current[chibiId];
                if (!currentChibiState?.active) {
                    // Chibi désactivé, arrêter l'animation
                    return;
                }

                const baseDelay = 150;
                const statsSpeed = painter.stats?.speed || 50;
                const actionDelay = baseDelay * (100 / statsSpeed);

                const zoneData = chibiZoneDataRef.current[chibiId];
                if (!zoneData) return;

                if (painter.movementMode === 'zone') {
                    // 🎯 MODE ZONE : Utilise la zone définie par l'utilisateur OU trouve des zones non coloriées

                    // 🦋 BERU PAPILLON: Mode zone définie par l'utilisateur - Colorie à CHAQUE FRAME !
                    if (zoneData.userDefinedZone) {
                        // Initialiser les pixels à colorier si pas encore fait
                        if (!zoneData.userZonePixels) {
                            zoneData.userZonePixels = generateUserZonePixels(zoneData.userDefinedZone);
                            zoneData.zoneProgress = 0;
                            zoneData.startTime = now;

                            // 📐 Calculer pour finir EXACTEMENT avec le timer (95% du temps)
                            const durationSeconds = painter.duration || 60;
                            const totalFrames = durationSeconds * 60 * 0.95;
                            zoneData.pixelsPerFrame = Math.ceil(zoneData.userZonePixels.length / totalFrames);
                            zoneData.totalDurationMs = durationSeconds * 1000 * 0.95;

                            console.log(`🦋 Zone: ${zoneData.userZonePixels.length} pixels, ${zoneData.pixelsPerFrame}/frame, finit en ${durationSeconds * 0.95}s`);

                            // Positionner le chibi au début de la zone
                            if (zoneData.userZonePixels.length > 0) {
                                const firstPixel = zoneData.userZonePixels[0];
                                updateChibiState(chibiId, {
                                    position: { x: firstPixel.x, y: firstPixel.y },
                                    direction: firstPixel.x > canvas.width / 2 ? -1 : 1
                                });
                            }
                        }

                        const totalPixels = zoneData.userZonePixels.length;

                        // 🎯 Ajustement dynamique: calculer combien de pixels on DEVRAIT avoir colorié
                        const elapsedMs = now - zoneData.startTime;
                        const progress = Math.min(1, elapsedMs / zoneData.totalDurationMs);
                        const targetProgress = Math.floor(progress * totalPixels);

                        // Rattraper le retard si nécessaire (ou ralentir si en avance)
                        const pixelsToColor = Math.max(1, targetProgress - zoneData.zoneProgress);
                        const pixelsPerAction = Math.min(pixelsToColor, zoneData.pixelsPerFrame * 2); // Limiter pour fluidité

                        for (let i = 0; i < pixelsPerAction && zoneData.zoneProgress < totalPixels; i++) {
                            const pixel = zoneData.userZonePixels[zoneData.zoneProgress];
                            if (pixel) {
                                const { x: posX, y: posY } = pixel;

                                if (posX >= 0 && posX < canvas.width && posY >= 0 && posY < canvas.height) {
                                    const activeLayerIndex = layers.findIndex(l => l.id === activeLayer);
                                    const layerCanvas = layersRef.current[activeLayerIndex];
                                    if (layerCanvas) {
                                        const ctx = layerCanvas.getContext('2d', { alpha: true });
                                        let color = getColorAtPosition(posX, posY);
                                        if (painter.colorMode === 'troll') {
                                            color = trollifyColor(color);
                                        }
                                        ctx.fillStyle = color;
                                        ctx.fillRect(posX, posY, 1, 1);
                                    }
                                }
                            }
                            zoneData.zoneProgress++;
                        }

                        // Mise à jour de la position du chibi (toutes les 100 pixels pour fluidité)
                        if (zoneData.zoneProgress % 100 === 0 && zoneData.zoneProgress < totalPixels) {
                            const currentPixel = zoneData.userZonePixels[Math.min(zoneData.zoneProgress, totalPixels - 1)];
                            if (currentPixel) {
                                updateChibiState(chibiId, {
                                    position: { x: currentPixel.x, y: currentPixel.y }
                                });
                            }
                        }

                        // Messages aléatoires pendant le coloriage (réduire la fréquence)
                        if (Math.random() < 0.005 && !currentChibiState.message) {
                            showMessageForChibi(chibiId, painter, false);
                        }

                        // Zone terminée !
                        if (zoneData.zoneProgress >= totalPixels) {
                            console.log(`🦋 Zone utilisateur terminée ! ${totalPixels} pixels coloriés.`);
                        }
                    } else if (now - zoneData.lastZoneTime >= actionDelay) {
                        // Mode classique avec délai: trouve des zones non coloriées aléatoires
                        zoneData.lastZoneTime = now;

                        if (!zoneData.currentZone) {
                            zoneData.currentZone = findUncoloredZoneForPainter(painter);
                            zoneData.zoneProgress = 0;

                            updateChibiState(chibiId, {
                                position: { x: zoneData.currentZone.x, y: zoneData.currentZone.y },
                                direction: zoneData.currentZone.x > canvas.width / 2 ? -1 : 1
                            });

                            if (Math.random() < 0.08 && !currentChibiState.message) {
                                showMessageForChibi(chibiId, painter, false);
                            }
                        } else {
                            const pixelsPerAction = Math.max(5, Math.floor(statsSpeed / 10));
                            const totalPixels = zoneData.currentZone.width * zoneData.currentZone.height;

                            for (let i = 0; i < pixelsPerAction && zoneData.zoneProgress < totalPixels; i++) {
                                const py = Math.floor(zoneData.zoneProgress / zoneData.currentZone.width);
                                const px = zoneData.zoneProgress % zoneData.currentZone.width;
                                const posX = zoneData.currentZone.x + px;
                                const posY = zoneData.currentZone.y + py;

                                if (posX >= 0 && posX < canvas.width && posY >= 0 && posY < canvas.height) {
                                    const activeLayerIndex = layers.findIndex(l => l.id === activeLayer);
                                    const layerCanvas = layersRef.current[activeLayerIndex];
                                    if (layerCanvas) {
                                        const ctx = layerCanvas.getContext('2d', { alpha: true });
                                        let color = getColorAtPosition(posX, posY);
                                        if (painter.colorMode === 'troll') {
                                            color = trollifyColor(color);
                                        }
                                        ctx.fillStyle = color;
                                        ctx.fillRect(posX, posY, 1, 1);
                                    }
                                }
                                zoneData.zoneProgress++;
                            }

                            const currentPy = Math.floor(zoneData.zoneProgress / zoneData.currentZone.width);
                            const currentPx = zoneData.zoneProgress % zoneData.currentZone.width;
                            updateChibiState(chibiId, {
                                position: {
                                    x: zoneData.currentZone.x + currentPx,
                                    y: zoneData.currentZone.y + currentPy
                                }
                            });

                            if (zoneData.zoneProgress >= totalPixels) {
                                if (Math.random() < 0.15 && !currentChibiState.message) {
                                    showMessageForChibi(chibiId, painter, false);
                                }
                                zoneData.currentZone = null;
                            }
                        }
                    }
                } else if (painter.movementMode === 'methodical') {
                    // 🎯 MODE MÉTHODIQUE : Ligne par ligne avec zig-zag
                    const scan = chibiScanPositionsRef.current[chibiId];
                    if (!scan) return;

                    const pixelSize = painter.stats?.pixelPrecision || painter.pixelSize;
                    const speed = Math.max(1, Math.floor((statsSpeed / 100) * 5));

                    for (let i = 0; i < speed; i++) {
                        if (!currentChibiState.facingFront) {
                            drawPixelForPainter(scan.col, scan.row, painter);
                        }

                        scan.col += scan.direction * pixelSize;

                        if (scan.col >= canvas.width) {
                            scan.col = canvas.width - 1;
                            scan.row += pixelSize;
                            scan.direction = -1;
                            updateChibiState(chibiId, { direction: -1 });

                            if (Math.random() < 0.05 && !currentChibiState.message) {
                                showMessageForChibi(chibiId, painter, false);
                            }
                        } else if (scan.col < 0) {
                            scan.col = 0;
                            scan.row += pixelSize;
                            scan.direction = 1;
                            updateChibiState(chibiId, { direction: 1 });

                            if (Math.random() < 0.05 && !currentChibiState.message) {
                                showMessageForChibi(chibiId, painter, false);
                            }
                        }

                        if (scan.row >= canvas.height) {
                            scan.row = 0;
                            scan.col = 0;
                            scan.direction = 1;
                        }
                    }

                    updateChibiState(chibiId, { position: { x: scan.col, y: scan.row } });
                } else {
                    // 🎲 MODE ALÉATOIRE : Mouvement vers une cible aléatoire (Tank)
                    const target = chibiTargetsRef.current[chibiId];
                    if (!target) return;

                    const currentPos = currentChibiState.position || { x: canvas.width / 2, y: canvas.height / 2 };
                    const dx = target.x - currentPos.x;
                    const dy = target.y - currentPos.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (dx > 5) {
                        updateChibiState(chibiId, { direction: 1 });
                    } else if (dx < -5) {
                        updateChibiState(chibiId, { direction: -1 });
                    }

                    if (distance < 5) {
                        chibiTargetsRef.current[chibiId] = {
                            x: Math.random() * canvas.width,
                            y: Math.random() * canvas.height
                        };

                        if (Math.random() < 0.15 && !currentChibiState.message) {
                            showMessageForChibi(chibiId, painter, false);
                        }
                    }

                    const speed = Math.max(0.5, (statsSpeed / 100) * 2.5);
                    const moveX = distance > 0 ? (dx / distance) * speed : 0;
                    const moveY = distance > 0 ? (dy / distance) * speed : 0;

                    const newX = Math.max(0, Math.min(canvas.width - 1, currentPos.x + moveX));
                    const newY = Math.max(0, Math.min(canvas.height - 1, currentPos.y + moveY));

                    if (!currentChibiState.facingFront) {
                        drawPixelForPainter(newX, newY, painter);
                    }

                    updateChibiState(chibiId, { position: { x: newX, y: newY } });
                }

                if (frameCount % 3 === 0) {
                    renderLayers();
                }

                // 🎭 INTERACTIONS MULTI-CHIBI (vérifié toutes les 60 frames ≈ 1 seconde)
                // Ne vérifier que depuis le premier chibi pour éviter les appels multiples
                const activeIds = Object.keys(activeChibisRef.current).filter(id => activeChibisRef.current[id]?.active);
                if (activeIds.length >= 2 && chibiId === activeIds[0] && frameCount % 60 === 0) {
                    checkChibiInteractions();
                }

                chibiAnimationsRef.current[chibiId] = requestAnimationFrame(animateChibi);
            };

            // Démarrer l'animation pour ce chibi
            chibiAnimationsRef.current[chibiId] = requestAnimationFrame(animateChibi);

            // Timer pour ce chibi
            let timeLeft = painter.duration;
            updateChibiState(chibiId, { timeRemaining: timeLeft });

            chibiTimersRef.current[chibiId] = setInterval(() => {
                timeLeft--;
                updateChibiState(chibiId, { timeRemaining: timeLeft });

                if (timeLeft <= 0) {
                    // 🛑 IMPORTANT: Marquer le chibi comme inactif IMMÉDIATEMENT
                    // pour empêcher le useEffect de relancer l'animation
                    updateChibiState(chibiId, { active: false });

                    // Arrêter ce chibi
                    if (chibiTimersRef.current[chibiId]) {
                        clearInterval(chibiTimersRef.current[chibiId]);
                        delete chibiTimersRef.current[chibiId];
                    }
                    if (chibiAnimationsRef.current[chibiId]) {
                        cancelAnimationFrame(chibiAnimationsRef.current[chibiId]);
                        delete chibiAnimationsRef.current[chibiId];
                    }

                    // 🧹 Nettoyer les données de zone pour éviter le bug du double timer
                    if (chibiZoneDataRef.current[chibiId]) {
                        delete chibiZoneDataRef.current[chibiId];
                    }
                    if (chibiScanPositionsRef.current[chibiId]) {
                        delete chibiScanPositionsRef.current[chibiId];
                    }
                    if (chibiTargetsRef.current[chibiId]) {
                        delete chibiTargetsRef.current[chibiId];
                    }

                    // Message de fin
                    updateChibiState(chibiId, {
                        message: painter.endMessage,
                        facingFront: true
                    });

                    setTimeout(() => {
                        // Supprimer le chibi des actifs
                        setActiveChibis(prev => {
                            const newState = { ...prev };
                            delete newState[chibiId];
                            return newState;
                        });
                    }, 2000);

                    saveToHistory();
                }
            }, 1000);
        });

        // Cleanup global - IMPORTANT: supprimer les refs après cancel pour permettre le redémarrage
        return () => {
            Object.keys(chibiAnimationsRef.current).forEach(id => {
                if (chibiAnimationsRef.current[id]) {
                    cancelAnimationFrame(chibiAnimationsRef.current[id]);
                    delete chibiAnimationsRef.current[id];
                }
            });
            Object.keys(chibiTimersRef.current).forEach(id => {
                if (chibiTimersRef.current[id]) {
                    clearInterval(chibiTimersRef.current[id]);
                    delete chibiTimersRef.current[id];
                }
            });
            Object.keys(chibiMessageTimeoutsRef.current).forEach(id => {
                if (chibiMessageTimeoutsRef.current[id]) {
                    clearTimeout(chibiMessageTimeoutsRef.current[id]);
                    delete chibiMessageTimeoutsRef.current[id];
                }
            });
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeChibiIds, currentModelData, imagesLoaded, activeLayer]);

    // 🦋 Fonction pour activer/désactiver un Chibi spécifique
    const toggleChibi = (chibiId) => {
        const chibiState = activeChibis[chibiId];
        const painter = CHIBI_PAINTERS[chibiId];

        if (chibiState?.active) {
            // Désactiver ce chibi
            // Nettoyer les timers et animations
            if (chibiAnimationsRef.current[chibiId]) {
                cancelAnimationFrame(chibiAnimationsRef.current[chibiId]);
                delete chibiAnimationsRef.current[chibiId];
            }
            if (chibiTimersRef.current[chibiId]) {
                clearInterval(chibiTimersRef.current[chibiId]);
                delete chibiTimersRef.current[chibiId];
            }
            if (chibiMessageTimeoutsRef.current[chibiId]) {
                clearTimeout(chibiMessageTimeoutsRef.current[chibiId]);
                delete chibiMessageTimeoutsRef.current[chibiId];
            }

            // Supprimer l'état du chibi
            setActiveChibis(prev => {
                const newState = { ...prev };
                delete newState[chibiId];
                return newState;
            });

            saveToHistory();
        } else {
            // Vérifier si on peut activer un nouveau chibi (max 2)
            const activeCount = Object.values(activeChibis).filter(c => c.active).length;
            if (activeCount >= MAX_ACTIVE_CHIBIS) {
                console.log(`❌ Maximum ${MAX_ACTIVE_CHIBIS} chibis déjà actifs`);
                return;
            }

            // 🦋 BERU PAPILLON: Ouvrir le sélecteur de zone avant de l'activer
            if (chibiId === 'beru_papillon') {
                const canvas = canvasRef.current;
                if (canvas && currentModelData?.canvasSize) {
                    // 📐 Calculer la taille de zone basée sur les stats du chibi
                    // Objectif: ~200x300px pour Beru (speed: 60, endurance: 80)
                    // Formule:
                    //   - Largeur = base + (speed × multiplicateur)
                    //   - Hauteur = base + (endurance × multiplicateur)
                    const stats = painter.stats || { speed: 60, endurance: 80 };

                    // Calcul pour obtenir ~200x300 avec speed=60, endurance=80
                    // width = 80 + (60 × 2) = 200
                    // height = 60 + (80 × 3) = 300
                    const zoneWidth = 80 + (stats.speed * 2);      // 80 + 120 = 200
                    const zoneHeight = 60 + (stats.endurance * 3); // 60 + 240 = 300

                    // Centrer la zone sur le canvas
                    setZonePosition({ x: canvas.width / 2, y: canvas.height / 2 });
                    setZoneSize({ width: Math.round(zoneWidth), height: Math.round(zoneHeight) });
                    setZoneRotation(0);
                    setSelectedZoneShape('rectangle');
                }
                setPendingChibiId(chibiId);
                setZoneSelectionMode(true);
                return;
            }

            // Activer directement pour les autres chibis (Tank, etc.)
            startChibiDirectly(chibiId, painter);
        }
    };

    // 🦋 Fonction pour démarrer un chibi directement (sans sélection de zone)
    const startChibiDirectly = (chibiId, painter) => {
        setActiveChibis(prev => ({
            ...prev,
            [chibiId]: {
                active: true,
                timeRemaining: painter.duration,
                position: { x: Math.random() * 100, y: Math.random() * 100 },
                facingFront: false,
                message: null,
                direction: 1
            }
        }));

        // Initialiser les refs pour ce chibi
        chibiTargetsRef.current[chibiId] = { x: 0, y: 0 };
        chibiScanPositionsRef.current[chibiId] = { row: 0, col: 0, direction: 1 };
        chibiZoneDataRef.current[chibiId] = { currentZone: null, zoneProgress: 0, lastZoneTime: 0 };
    };

    // 🦋 Fonction pour démarrer Beru Papillon avec la zone sélectionnée
    const startChibiWithZone = () => {
        if (!pendingChibiId) return;

        const painter = CHIBI_PAINTERS[pendingChibiId];
        if (!painter) return;

        // Stocker la zone définie par l'utilisateur
        const userDefinedZone = {
            shape: selectedZoneShape,
            x: zonePosition.x,
            y: zonePosition.y,
            width: zoneSize.width,
            height: zoneSize.height,
            rotation: zoneRotation
        };

        setActiveChibis(prev => ({
            ...prev,
            [pendingChibiId]: {
                active: true,
                timeRemaining: painter.duration,
                position: { x: zonePosition.x, y: zonePosition.y },
                facingFront: false,
                message: null,
                direction: 1,
                userDefinedZone: userDefinedZone // Zone définie par l'utilisateur
            }
        }));

        // Initialiser les refs pour ce chibi avec la zone définie
        chibiTargetsRef.current[pendingChibiId] = { x: zonePosition.x, y: zonePosition.y };
        chibiScanPositionsRef.current[pendingChibiId] = { row: 0, col: 0, direction: 1 };
        chibiZoneDataRef.current[pendingChibiId] = {
            currentZone: null,
            zoneProgress: 0,
            lastZoneTime: 0,
            userDefinedZone: userDefinedZone // Zone définie par l'utilisateur
        };

        // Fermer le mode sélection
        setZoneSelectionMode(false);
        setPendingChibiId(null);
    };

    // 🦋 Annuler la sélection de zone
    const cancelZoneSelection = () => {
        setZoneSelectionMode(false);
        setPendingChibiId(null);
    };

    // Compatibilité arrière - toggle le chibi sélectionné
    const toggleAutoDrawBeru = () => {
        toggleChibi(selectedPainterId);
    };

    // 🌐 MULTIPLAYER: Dessiner les strokes reçus des autres joueurs
    useEffect(() => {
        if (!multiplayerMode || !multiplayer?.receivedStrokes?.length) return;

        const LAYER_INDEX_MAP = { base: 0, shadows: 1, details: 2 };

        multiplayer.receivedStrokes.forEach((stroke) => {
            const layerIndex = LAYER_INDEX_MAP[stroke.layer] ?? 0;
            const layerCanvas = layersRef.current[layerIndex];
            if (!layerCanvas) return;

            const ctx = layerCanvas.getContext('2d', { alpha: true });

            // Configurer le contexte selon l'outil
            if (stroke.tool === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
            } else {
                ctx.globalCompositeOperation = 'source-over';
            }

            // Dessiner le stroke
            if (stroke.points && stroke.points.length > 0) {
                const brushConfig = BRUSH_TYPES[brushType] || BRUSH_TYPES.pen;

                stroke.points.forEach((point, index) => {
                    const [x, y, pointColor] = point;
                    // Utiliser la couleur du point si disponible (mode auto-pipette), sinon fallback sur stroke.color
                    const colorToUse = pointColor || stroke.color;
                    if (stroke.tool === 'eraser') {
                        ctx.fillStyle = colorToUse;
                        ctx.beginPath();
                        ctx.arc(x, y, stroke.brushSize, 0, 2 * Math.PI);
                        ctx.fill();
                    } else {
                        drawBrushStroke(ctx, x, y, stroke.brushSize, colorToUse, brushConfig, 1.0, 0);
                    }
                });
            }

            ctx.globalCompositeOperation = 'source-over';
        });

        // Nettoyer les strokes traités
        multiplayer.clearReceivedStrokes();
        renderLayers();
    }, [multiplayerMode, multiplayer?.receivedStrokes]);

    // 🌐 MULTIPLAYER: Gérer les événements d'undo des autres joueurs
    useEffect(() => {
        if (!multiplayerMode || !multiplayer?.undoEvents?.length) return;

        // Pour chaque undo, on devrait redessiner tout depuis l'historique
        // Mais comme le backend gère déjà la suppression, on re-render simplement
        multiplayer.clearUndoEvents();
        renderLayers();
    }, [multiplayerMode, multiplayer?.undoEvents]);

    // 🎨 FEATURE 3: Fixed renderLayers to ensure proper color rendering
    const renderLayers = () => {
        const canvas = canvasRef.current;
        // Use alpha: true and willReadFrequently for proper color handling
        const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: true });

        const templateImg = new Image();
        templateImg.crossOrigin = "anonymous";
        templateImg.onload = () => {
            // Reset composite operation to ensure proper color rendering
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

            layers.forEach((layer, index) => {
                if (layer.visible && layersRef.current[index]) {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.globalAlpha = layer.opacity;
                    ctx.drawImage(layersRef.current[index], 0, 0);
                    ctx.globalAlpha = 1;
                }
            });

            // Calculer la progression après le rendu
            setTimeout(() => updateProgress(), 500);
        };
        templateImg.onerror = () => {
            console.warn('Could not load template for render');
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            layers.forEach((layer, index) => {
                if (layer.visible && layersRef.current[index]) {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.globalAlpha = layer.opacity;
                    ctx.drawImage(layersRef.current[index], 0, 0);
                    ctx.globalAlpha = 1;
                }
            });
            // Calculer la progression même en cas d'erreur
            setTimeout(() => updateProgress(), 500);
        };
        templateImg.src = currentModelData.template;
    };

    // FONCTION DE CALCUL DU POURCENTAGE DE COLORIAGE
    const calculateColoringProgress = () => {
        const canvas = canvasRef.current;

        if (!canvas || !currentModelData || !imagesLoaded) {
            return Promise.resolve({
                percentage: 0,
                coloredPixels: 0,
                totalColorablePixels: 0,
                details: { layers: 0, canvasSize: '0x0' }
            });
        }

        return new Promise((resolve) => {
            const templateCanvas = document.createElement('canvas');
            templateCanvas.width = canvas.width;
            templateCanvas.height = canvas.height;
            const templateCtx = templateCanvas.getContext('2d');

            const templateImg = new Image();
            templateImg.crossOrigin = "anonymous";

            templateImg.onload = () => {
                // Dessiner le template de base
                templateCtx.drawImage(templateImg, 0, 0, templateCanvas.width, templateCanvas.height);

                // Obtenir les données du template
                const templateData = templateCtx.getImageData(0, 0, templateCanvas.width, templateCanvas.height);

                // Créer un canvas avec tout le coloriage actuel
                const coloringCanvas = document.createElement('canvas');
                coloringCanvas.width = canvas.width;
                coloringCanvas.height = canvas.height;
                const coloringCtx = coloringCanvas.getContext('2d');

                // Dessiner le template de base
                coloringCtx.drawImage(templateImg, 0, 0, coloringCanvas.width, coloringCanvas.height);

                // Ajouter tous les layers visibles
                layers.forEach((layer, index) => {
                    if (layer.visible && layersRef.current[index]) {
                        coloringCtx.globalAlpha = layer.opacity;
                        coloringCtx.drawImage(layersRef.current[index], 0, 0);
                        coloringCtx.globalAlpha = 1;
                    }
                });

                // Obtenir les données du coloriage final
                const coloringData = coloringCtx.getImageData(0, 0, coloringCanvas.width, coloringCanvas.height);

                // Calculer le pourcentage
                let totalColorablePixels = 0;
                let coloredPixels = 0;

                for (let i = 0; i < templateData.data.length; i += 4) {
                    const templateR = templateData.data[i];
                    const templateG = templateData.data[i + 1];
                    const templateB = templateData.data[i + 2];
                    const templateA = templateData.data[i + 3];

                    const coloringR = coloringData.data[i];
                    const coloringG = coloringData.data[i + 1];
                    const coloringB = coloringData.data[i + 2];

                    // Vérifier si c'est une zone colorable (pas transparente et pas complètement blanche)
                    if (templateA > 0 && !(templateR > 240 && templateG > 240 && templateB > 240)) {
                        totalColorablePixels++;

                        // Vérifier si le pixel a été modifié par rapport au template
                        const hasChanged = Math.abs(coloringR - templateR) > 10 ||
                            Math.abs(coloringG - templateG) > 10 ||
                            Math.abs(coloringB - templateB) > 10;

                        if (hasChanged) {
                            coloredPixels++;
                        }
                    }
                }

                const percentage = totalColorablePixels > 0 ?
                    Math.round((coloredPixels / totalColorablePixels) * 100) : 0;

                resolve({
                    percentage,
                    coloredPixels,
                    totalColorablePixels,
                    details: {
                        layers: layers.filter(l => l.visible).length,
                        canvasSize: `${canvas.width}x${canvas.height}`
                    }
                });
            };

            templateImg.onerror = () => {
                resolve({
                    percentage: 0,
                    coloredPixels: 0,
                    totalColorablePixels: 0,
                    details: { layers: 0, canvasSize: '0x0' }
                });
            };

            templateImg.src = currentModelData.template;
        });
    };

    // CALCULER LE POURCENTAGE APRÈS CHAQUE MODIFICATION
    const updateProgress = async () => {
        try {
            const progress = await calculateColoringProgress();
            setColoringProgress(progress.percentage);
            setProgressDetails(progress);
            console.log('🎯 Progression coloriage:', progress);
        } catch (error) {
            console.error('❌ Erreur calcul progression:', error);
        }
    };

    const saveToHistory = () => {
        const newHistory = history.slice(0, historyIndex + 1);
        const snapshot = layersRef.current.map(canvas => {
            try {
                return canvas.toDataURL();
            } catch (e) {
                console.warn('Warning: Could not save layer to history', e);
                return null;
            }
        }).filter(s => s !== null);

        newHistory.push(snapshot);

        if (newHistory.length > 50) {
            newHistory.shift();
        } else {
            setHistoryIndex(historyIndex + 1);
        }

        setHistory(newHistory);
        setCanUndo(true);
        setCanRedo(false);
    };

    const undo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            restoreFromHistory(newIndex);
            setCanUndo(newIndex > 0);
            setCanRedo(true);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            restoreFromHistory(newIndex);
            setCanUndo(true);
            setCanRedo(newIndex < history.length - 1);
        }
    };

    const restoreFromHistory = (index) => {
        const snapshot = history[index];
        snapshot.forEach((dataURL, i) => {
            const img = new Image();
            img.onload = () => {
                const ctx = layersRef.current[i].getContext('2d');
                ctx.clearRect(0, 0, layersRef.current[i].width, layersRef.current[i].height);
                ctx.drawImage(img, 0, 0);
                renderLayers();
            };
            img.src = dataURL;
        });
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z' || e.key === 'Z') {
                    e.preventDefault();
                    if (e.shiftKey) {
                        redo();
                    } else {
                        undo();
                    }
                }
                if (e.key === 'y' || e.key === 'Y') {
                    e.preventDefault();
                    redo();
                }
            }

            if (!e.ctrlKey && !e.metaKey) {
                if (e.key === 'b' || e.key === 'B') setCurrentTool('brush');
                if (e.key === 'e' || e.key === 'E') setCurrentTool('eraser');
                if (e.key === 'i' || e.key === 'I') setCurrentTool('pipette');

                // 🎨 FEATURE 1: Brush type cycling with B key when tool is brush
                // 🔢 FEATURE 2: Brush size shortcuts with [ and ]
                if (e.key === '[') {
                    e.preventDefault();
                    setBrushSize(prev => Math.max(0.1, Math.round((prev - 0.1) * 10) / 10));
                }
                if (e.key === ']') {
                    e.preventDefault();
                    setBrushSize(prev => Math.min(50, Math.round((prev + 0.1) * 10) / 10));
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [historyIndex, history.length]);

    const getCanvasCoordinates = (e, canvas) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        return { x, y };
    };

    const handleZoom = (delta) => {
        const newZoom = Math.max(0.5, Math.min(MAX_ZOOM, zoomLevel + delta));
        setZoomLevel(newZoom);
    };

    // 🔢 FEATURE 2: Brush Size Controls
    const incrementBrushSize = () => {
        setBrushSize(prev => Math.min(50, Math.round((prev + 0.1) * 10) / 10));
    };

    const decrementBrushSize = () => {
        setBrushSize(prev => Math.max(0.1, Math.round((prev - 0.1) * 10) / 10));
    };

    const startBrushSizeRepeat = (increment) => {
        if (brushSizeIntervalRef.current) return;
        brushSizeIntervalRef.current = setInterval(() => {
            if (increment) {
                incrementBrushSize();
            } else {
                decrementBrushSize();
            }
        }, 100);
    };

    const stopBrushSizeRepeat = () => {
        if (brushSizeIntervalRef.current) {
            clearInterval(brushSizeIntervalRef.current);
            brushSizeIntervalRef.current = null;
        }
    };

    // 📱 MOBILE TOOLBAR HANDLERS - Gestion du scroll vs tap
    const handleToolbarTouchStart = (e) => {
        const touch = e.touches[0];
        toolbarTouchStartRef.current = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now(),
            scrollLeft: mobileToolbarRef.current?.scrollLeft || 0
        };
        toolbarIsDraggingRef.current = false;
        toolbarPendingClickRef.current = e.target.closest('button');
    };

    const handleToolbarTouchMove = (e) => {
        if (!toolbarTouchStartRef.current.time) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - toolbarTouchStartRef.current.x;
        const deltaY = touch.clientY - toolbarTouchStartRef.current.y;
        const totalMovement = Math.abs(deltaX) + Math.abs(deltaY);

        // Si on a bougé assez, c'est un drag
        if (totalMovement > DRAG_THRESHOLD) {
            toolbarIsDraggingRef.current = true;
            toolbarPendingClickRef.current = null;

            // Scroll horizontal du toolbar
            if (mobileToolbarRef.current) {
                mobileToolbarRef.current.scrollLeft = toolbarTouchStartRef.current.scrollLeft - deltaX;
            }
        }
    };

    const handleToolbarTouchEnd = (e) => {
        const touchDuration = Date.now() - toolbarTouchStartRef.current.time;

        // Si c'était un tap rapide (pas un drag), déclencher le click
        if (!toolbarIsDraggingRef.current && touchDuration < LONG_PRESS_THRESHOLD && toolbarPendingClickRef.current) {
            // Simuler le click sur le bouton
            toolbarPendingClickRef.current.click();
        }

        // Reset
        toolbarTouchStartRef.current = { x: 0, y: 0, time: 0, scrollLeft: 0 };
        toolbarIsDraggingRef.current = false;
        toolbarPendingClickRef.current = null;
    };

    // ✨ PRECISION: Fonction d'interpolation linéaire entre deux points
    const interpolatePoints = (p1, p2, spacing) => {
        const points = [];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Si la distance est trop petite, pas besoin d'interpoler
        if (distance < spacing) {
            return [p2];
        }

        const steps = Math.ceil(distance / spacing);
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            points.push({
                x: p1.x + dx * t,
                y: p1.y + dy * t
            });
        }
        return points;
    };

    // ✨ PRECISION: Fonction de stabilisation (moyenne des derniers points)
    const stabilizePoint = (point) => {
        if (stabilization === 0) return point;

        stabilizationBufferRef.current.push(point);

        // Garder seulement les N derniers points
        const bufferSize = Math.max(2, Math.floor(stabilization * STABILIZATION_BUFFER_SIZE / 10));
        while (stabilizationBufferRef.current.length > bufferSize) {
            stabilizationBufferRef.current.shift();
        }

        // Calculer la moyenne pondérée (points récents ont plus de poids)
        let totalWeight = 0;
        let sumX = 0;
        let sumY = 0;

        stabilizationBufferRef.current.forEach((p, i) => {
            const weight = i + 1; // Les points plus récents ont plus de poids
            sumX += p.x * weight;
            sumY += p.y * weight;
            totalWeight += weight;
        });

        return {
            x: sumX / totalWeight,
            y: sumY / totalWeight
        };
    };

    // ✨ PRECISION: Générer curseur SVG dynamique
    const generateDynamicCursor = (size, color, tool, brushTypeId) => {
        const displaySize = Math.max(4, Math.min(size * 2, 64)); // Taille affichée (4-64px)
        const center = displaySize / 2 + 2;
        const totalSize = displaySize + 4;

        let shape;
        if (tool === 'eraser') {
            // Gomme: cercle rouge avec bordure
            shape = `<circle cx="${center}" cy="${center}" r="${displaySize/2}" fill="rgba(255,100,100,0.3)" stroke="rgba(255,100,100,0.8)" stroke-width="1.5"/>`;
        } else if (brushTypeId === 'pixel') {
            // Pixel: carré
            const halfSize = displaySize / 2;
            shape = `<rect x="${center - halfSize}" y="${center - halfSize}" width="${displaySize}" height="${displaySize}" fill="${color}40" stroke="${color}" stroke-width="1.5"/>`;
        } else {
            // Autres: cercle
            shape = `<circle cx="${center}" cy="${center}" r="${displaySize/2}" fill="${color}40" stroke="${color}" stroke-width="1.5"/>`;
        }

        // Croix centrale pour la précision
        const crossSize = 6;
        const crosshair = `
            <line x1="${center - crossSize}" y1="${center}" x2="${center + crossSize}" y2="${center}" stroke="white" stroke-width="1.5" opacity="0.9"/>
            <line x1="${center}" y1="${center - crossSize}" x2="${center}" y2="${center + crossSize}" stroke="white" stroke-width="1.5" opacity="0.9"/>
            <line x1="${center - crossSize}" y1="${center}" x2="${center + crossSize}" y2="${center}" stroke="black" stroke-width="0.5" opacity="0.5"/>
            <line x1="${center}" y1="${center - crossSize}" x2="${center}" y2="${center + crossSize}" stroke="black" stroke-width="0.5" opacity="0.5"/>
        `;

        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalSize}" height="${totalSize}" viewBox="0 0 ${totalSize} ${totalSize}">${shape}${crosshair}</svg>`;

        return `url('data:image/svg+xml;utf8,${encodeURIComponent(svg)}') ${center} ${center}, crosshair`;
    };

    // 🖌️ BRUSH ENGINE PRO: Convertit hex en rgba
    const hexToRgba = (hex, alpha) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // 🖌️ BRUSH ENGINE PRO: Calcule la taille effective avec pression et vitesse
    const calculateEffectiveSize = (baseSize, pressure, velocity, brushConfig) => {
        let effectiveSize = baseSize;

        // Effet de la pression sur la taille
        if (enablePressure && brushConfig.pressureAffectsSize) {
            const sensitivity = brushConfig.pressureSensitivity * pressureSensitivity;
            const pressureFactor = Math.pow(pressure * sensitivity + (1 - sensitivity) * 0.5, 1.5);
            const sizeRange = brushConfig.maxSize - brushConfig.minSize;
            effectiveSize *= brushConfig.minSize + (sizeRange * pressureFactor);
        }

        // Effet de la vitesse sur la taille (inverse: plus rapide = plus fin)
        if (enableVelocity && brushConfig.velocityAffectsSize && velocity > 0) {
            const velocityFactor = Math.min(1, velocity * brushConfig.velocitySensitivity * velocitySensitivity);
            effectiveSize *= 1 - (velocityFactor * 0.5);
        }

        return Math.max(0.5, effectiveSize);
    };

    // 🖌️ BRUSH ENGINE PRO: Calcule l'opacité effective avec pression
    const calculateEffectiveOpacity = (baseOpacity, pressure, brushConfig) => {
        let effectiveOpacity = baseOpacity * (brushConfig.opacity || 1);

        if (enablePressure && brushConfig.pressureAffectsOpacity) {
            const sensitivity = brushConfig.pressureSensitivity * pressureSensitivity;
            effectiveOpacity *= Math.pow(pressure * sensitivity + (1 - sensitivity) * 0.5, 1.2);
        }

        return Math.max(0, Math.min(1, effectiveOpacity));
    };

    // 🎨 BRUSH ENGINE PRO: Draw brush stroke with pressure/velocity support
    const drawBrushStroke = (ctx, x, y, size, color, brushConfig, pressure = 1.0, velocity = 0) => {
        // Calcul des valeurs effectives avec pression et vitesse
        const effectiveSize = calculateEffectiveSize(size, pressure, velocity, brushConfig);
        const effectiveOpacity = calculateEffectiveOpacity(1.0, pressure, brushConfig);

        // Save context state
        ctx.save();

        // Set blend mode
        if (brushConfig.blendMode === 'multiply') {
            ctx.globalCompositeOperation = 'multiply';
        }

        // Set opacity
        ctx.globalAlpha = effectiveOpacity;
        ctx.fillStyle = color;

        // Désactiver anti-aliasing pour pixel art
        if (brushConfig.antiAlias === false) {
            ctx.imageSmoothingEnabled = false;
        }

        // PIXEL BRUSH - Perfect square
        if (brushConfig.square) {
            const pixelSize = Math.max(1, Math.floor(effectiveSize));
            ctx.fillRect(
                Math.floor(x - pixelSize / 2),
                Math.floor(y - pixelSize / 2),
                pixelSize,
                pixelSize
            );
        }
        // AIRBRUSH - Radial gradient
        else if (brushConfig.gradient) {
            const gradientRadius = effectiveSize * 2;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, gradientRadius);
            grad.addColorStop(0, color);
            grad.addColorStop(0.3, hexToRgba(color, 0.6));
            grad.addColorStop(0.6, hexToRgba(color, 0.2));
            grad.addColorStop(1, hexToRgba(color, 0));
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, gradientRadius, 0, 2 * Math.PI);
            ctx.fill();
        }
        // SOFT BRUSH - Bords doux (hardness < 1)
        else if (brushConfig.hardness !== undefined && brushConfig.hardness < 1) {
            const innerRadius = effectiveSize * brushConfig.hardness;
            const grad = ctx.createRadialGradient(x, y, innerRadius, x, y, effectiveSize);
            grad.addColorStop(0, color);
            grad.addColorStop(1, hexToRgba(color, 0));
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, effectiveSize, 0, 2 * Math.PI);
            ctx.fill();
        }
        // PENCIL/TEXTURE - Textured with grain
        else if (brushConfig.texture?.enabled) {
            const density = brushConfig.texture.density || 0.3;
            const texSize = brushConfig.texture.size || 0.8;
            const numDots = Math.max(3, Math.floor(effectiveSize * density * 4));

            for (let i = 0; i < numDots; i++) {
                const offsetX = (Math.random() - 0.5) * effectiveSize * texSize;
                const offsetY = (Math.random() - 0.5) * effectiveSize * texSize;
                const dotSize = effectiveSize * (0.3 + Math.random() * 0.4);
                ctx.globalAlpha = effectiveOpacity * (0.5 + Math.random() * 0.5);
                ctx.beginPath();
                ctx.arc(x + offsetX, y + offsetY, dotSize, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
        // G-PEN / MAPPING PEN - Hard edges (default manga ink)
        else {
            ctx.beginPath();
            ctx.arc(x, y, effectiveSize, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Restore context state
        ctx.restore();
    };

    const drawInstantPoint = (e) => {
        const layer = layers.find(l => l.id === activeLayer);
        if (layer?.locked) return;

        const activeLayerIndex = layers.findIndex(l => l.id === activeLayer);
        const layerCanvas = layersRef.current[activeLayerIndex];
        if (!layerCanvas) return;

        // 🎨 FEATURE 3: Use proper context options for color accuracy
        const ctx = layerCanvas.getContext('2d', { alpha: true });
        const rawPoint = getCanvasCoordinates(e, canvasRef.current);

        if (rawPoint.x < 0 || rawPoint.x > layerCanvas.width || rawPoint.y < 0 || rawPoint.y > layerCanvas.height) return;

        // ✨ PRECISION: Appliquer la stabilisation et initialiser le buffer
        stabilizationBufferRef.current = [rawPoint];
        const stabilizedPoint = stabilizePoint(rawPoint);
        const { x, y } = stabilizedPoint;

        // ✨ PRECISION: Initialiser le dernier point pour l'interpolation mobile
        lastPointRef.current = { x, y };

        // 🎨 AUTO-PIPETTE: Récupérer la couleur automatiquement depuis la référence (couleurs pures, sans opacité)
        let colorToUse = selectedColor;

        if (effectiveAutoPipette && currentTool === 'brush') {
            // TOUJOURS lire depuis referenceCanvasRef pour avoir les vraies couleurs (sans opacité appliquée)
            const canvas = canvasRef.current;
            const refCanvas = referenceCanvasRef.current;
            if (refCanvas && canvas) {
                try {
                    // 🔄 Convertir les coordonnées du canvas de dessin vers le canvas de référence (proportionnel)
                    const refX = Math.floor(x * refCanvas.width / canvas.width);
                    const refY = Math.floor(y * refCanvas.height / canvas.height);

                    // Vérifier les limites
                    if (refX >= 0 && refX < refCanvas.width && refY >= 0 && refY < refCanvas.height) {
                        const refCtx = refCanvas.getContext('2d', { willReadFrequently: true });
                        const pixel = refCtx.getImageData(refX, refY, 1, 1).data;
                        if (pixel[3] > 0) {
                            // 🎨 MOBILE FIX V2: Utiliser les valeurs RGB PURES (couleurs vives, pas fades)
                            const r = pixel[0];
                            const g = pixel[1];
                            const b = pixel[2];
                            colorToUse = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
                        }
                    }
                } catch (err) {
                    console.warn('Auto-pipette reference error:', err);
                }
            }
        }

        ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';

        // 🎨 Use brush engine for drawing
        if (currentTool === 'eraser') {
            // Eraser uses simple circle
            ctx.fillStyle = colorToUse;
            ctx.beginPath();
            ctx.arc(x, y, brushSize, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            // Use brush type configuration
            const brushConfig = BRUSH_TYPES[brushType] || BRUSH_TYPES.pen;
            drawBrushStroke(ctx, x, y, brushSize, colorToUse, brushConfig);
        }

        renderLayers();
    };

    const handleTouchDraw = (e) => {
        e.preventDefault();

        if (!e.touches || e.touches.length === 0) return;
        const touch = e.touches[0];

        // 🎨 FEATURE 4: Touch pipette reads ALWAYS from reference image (COULEURS PURES comme desktop)
        if (currentTool === 'pipette') {
            const canvas = canvasRef.current;
            const refCanvas = referenceCanvasRef.current;
            if (!canvas || !refCanvas) return;

            const rect = canvas.getBoundingClientRect();

            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const canvasX = Math.floor((touch.clientX - rect.left) * scaleX);
            const canvasY = Math.floor((touch.clientY - rect.top) * scaleY);

            if (canvasX < 0 || canvasX >= canvas.width || canvasY < 0 || canvasY >= canvas.height) return;

            // 🔄 Convertir les coordonnées du canvas de dessin vers le canvas de référence (proportionnel)
            const refX = Math.floor(canvasX * refCanvas.width / canvas.width);
            const refY = Math.floor(canvasY * refCanvas.height / canvas.height);

            // Vérifier les limites du canvas de référence
            if (refX < 0 || refX >= refCanvas.width || refY < 0 || refY >= refCanvas.height) return;

            // TOUJOURS lire depuis l'image de référence (referenceCanvasRef) - COULEURS PURES
            try {
                const refCtx = refCanvas.getContext('2d', { willReadFrequently: true });
                const pixel = refCtx.getImageData(refX, refY, 1, 1).data;

                if (pixel[3] > 0) {
                    // 🎨 MOBILE FIX V2: Utiliser les valeurs RGB PURES (couleurs vives, pas fades)
                    // On veut la couleur originale du pixel, pas la couleur mixée avec fond blanc
                    const r = pixel[0];
                    const g = pixel[1];
                    const b = pixel[2];
                    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
                    setSelectedColor(hex);
                } else {
                    // Pixel transparent -> blanc par défaut
                    setSelectedColor('#FFFFFF');
                }
            } catch (err) {
                console.warn('Touch pipette: impossible de lire la couleur de référence:', err);
                setSelectedColor('#FFFFFF');
            }
            setCurrentTool('brush');
            return;
        }

        if (interactionMode !== 'draw') return;

        const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 'mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY,
            bubbles: true
        });

        if (e.type === 'touchstart') {
            startDrawing(mouseEvent);
            drawInstantPoint(mouseEvent);
        } else if (e.type === 'touchmove') {
            draw(mouseEvent);
        }
    };

    const startDrawing = (e) => {
        if (e.button !== 0 || e.ctrlKey || isPanning) return;

        if (currentTool === 'pipette') {
            pickColorFromCanvas(e);
            return;
        }

        const layer = layers.find(l => l.id === activeLayer);
        if (layer?.locked) return;

        // ✨ PRECISION: Reset interpolation et stabilization au début du trait
        lastPointRef.current = null;
        stabilizationBufferRef.current = [];

        // 🖌️ BRUSH ENGINE PRO: Reset tracking au début du trait
        lastDrawTimeRef.current = performance.now();
        lastDrawPositionRef.current = null;
        currentVelocityRef.current = 0;

        setIsDrawing(true);
        if (!isMobile) {
            draw(e);
        }
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            saveToHistory();

            // 🌐 MULTIPLAYER: Envoyer le stroke complet au serveur
            if (multiplayerMode && multiplayer && currentStrokePointsRef.current.length > 0) {
                multiplayer.sendStroke({
                    layer: activeLayer,
                    points: currentStrokePointsRef.current,
                    color: selectedColor,
                    brushSize: brushSize,
                    tool: currentTool,
                });
            }

            // ✨ PRECISION: Reset refs à la fin du trait
            lastPointRef.current = null;
            stabilizationBufferRef.current = [];
            currentStrokePointsRef.current = [];
        }
    };

    const draw = (e) => {
        if (!isDrawing || isPanning || currentTool === 'pipette') return;

        const activeLayerIndex = layers.findIndex(l => l.id === activeLayer);
        const layerCanvas = layersRef.current[activeLayerIndex];
        if (!layerCanvas) return;

        // 🖌️ BRUSH ENGINE PRO: Extraire la pression (PointerEvent)
        let pressure = 1.0;
        if (e.pointerType === 'pen' && e.pressure > 0) {
            pressure = e.pressure;
        } else if (e.pressure !== undefined && e.pressure > 0) {
            pressure = e.pressure;
        }
        currentPressureRef.current = pressure;
        setCurrentPressure(pressure);

        // 🖌️ BRUSH ENGINE PRO: Calculer la vitesse
        const now = performance.now();
        const deltaTime = now - lastDrawTimeRef.current;
        let velocity = 0;

        // 🎨 FEATURE 3: Use proper context options for color accuracy
        const ctx = layerCanvas.getContext('2d', { alpha: true });
        let rawPoint = getCanvasCoordinates(e, canvasRef.current);

        if (rawPoint.x < 0 || rawPoint.x > layerCanvas.width || rawPoint.y < 0 || rawPoint.y > layerCanvas.height) return;

        // Calculer la vitesse basée sur le déplacement
        if (lastDrawPositionRef.current && deltaTime > 0) {
            const dx = rawPoint.x - lastDrawPositionRef.current.x;
            const dy = rawPoint.y - lastDrawPositionRef.current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            velocity = distance / deltaTime; // pixels/ms
        }
        currentVelocityRef.current = velocity;
        setCurrentVelocity(velocity);
        lastDrawTimeRef.current = now;
        lastDrawPositionRef.current = { x: rawPoint.x, y: rawPoint.y };

        // ✨ PRECISION: Appliquer la stabilisation si activée
        const stabilizedPoint = stabilizePoint(rawPoint);
        const { x, y } = stabilizedPoint;

        // 🎮 CHEAT MODE & AUTO-PIPETTE: Auto-pick couleur depuis référence
        let colorToUse = selectedColor;
        let brushSizeToUse = brushSize;

        // Fonction helper pour récupérer la couleur d'une position (TOUJOURS depuis la référence pour couleurs pures)
        const getColorAtPosition = (posX, posY) => {
            let color = selectedColor;

            // TOUJOURS lire depuis referenceCanvasRef pour avoir les vraies couleurs (sans opacité appliquée)
            const canvas = canvasRef.current;
            const refCanvas = referenceCanvasRef.current;
            if (refCanvas && canvas) {
                try {
                    // 🔄 Convertir les coordonnées du canvas de dessin vers le canvas de référence (proportionnel)
                    const refX = Math.floor(posX * refCanvas.width / canvas.width);
                    const refY = Math.floor(posY * refCanvas.height / canvas.height);

                    // Vérifier les limites
                    if (refX >= 0 && refX < refCanvas.width && refY >= 0 && refY < refCanvas.height) {
                        const refCtx = refCanvas.getContext('2d', { willReadFrequently: true });
                        const pixel = refCtx.getImageData(refX, refY, 1, 1).data;
                        if (pixel[3] > 0) {
                            // 🎨 FIX V2: Utiliser les valeurs RGB PURES (couleurs vives, pas fades)
                            const r = pixel[0];
                            const g = pixel[1];
                            const b = pixel[2];
                            color = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
                        }
                    }
                } catch (err) { /* ignore */ }
            }

            return color;
        };

        // Auto-pipette mode ou cheat mode actif
        if ((effectiveAutoPipette || cheatModeActive) && currentTool === 'brush') {
            if (cheatModeActive) {
                brushSizeToUse = Math.min(brushSize, 3);
            }
            colorToUse = getColorAtPosition(x, y);
        }

        ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';

        // ✨ PRECISION: Calculer l'espacement pour l'interpolation (basé sur la taille du pinceau)
        const spacing = Math.max(1, brushSizeToUse * 0.3); // Espacement = 30% de la taille

        // ✨ PRECISION: Interpolation entre le dernier point et le point actuel
        const currentPoint = { x, y };
        let pointsToDraw = [currentPoint];

        if (lastPointRef.current) {
            pointsToDraw = interpolatePoints(lastPointRef.current, currentPoint, spacing);
        }

        // Dessiner tous les points interpolés
        const brushConfig = BRUSH_TYPES[brushType] || BRUSH_TYPES.pen;

        pointsToDraw.forEach(point => {
            // En mode auto-pipette/cheat, récupérer la couleur pour chaque point interpolé
            let pointColor = colorToUse;
            if ((effectiveAutoPipette || cheatModeActive) && currentTool === 'brush') {
                pointColor = getColorAtPosition(point.x, point.y);
            }

            if (currentTool === 'eraser') {
                ctx.fillStyle = pointColor;
                ctx.beginPath();
                ctx.arc(point.x, point.y, brushSizeToUse, 0, 2 * Math.PI);
                ctx.fill();
            } else {
                // 🖌️ BRUSH ENGINE PRO: Passer pression et vitesse
                drawBrushStroke(ctx, point.x, point.y, brushSizeToUse, pointColor, brushConfig, pressure, velocity);
            }

            // 🌐 MULTIPLAYER: Tracker les points pour l'envoi (avec couleur en mode auto-pipette)
            if (multiplayerMode) {
                currentStrokePointsRef.current.push([point.x, point.y, pointColor]);
            }
        });

        // 🌐 MULTIPLAYER: Envoyer position du curseur et stroking en temps réel
        if (multiplayerMode && multiplayer) {
            multiplayer.sendCursorMove(x, y, true);
            multiplayer.sendStroking([x, y], colorToUse, brushSizeToUse, activeLayer);
        }

        // ✨ PRECISION: Sauvegarder le dernier point pour l'interpolation
        lastPointRef.current = currentPoint;

        renderLayers();
    };

    // 🎨 FEATURE 4: Pipette reads ALWAYS from reference image, regardless of overlay state
    const pickColorFromCanvas = (e) => {
        const canvas = canvasRef.current;
        const refCanvas = referenceCanvasRef.current;
        if (!canvas || !refCanvas) {
            setSelectedColor('#FFFFFF');
            setCurrentTool('brush');
            return;
        }

        const { x, y } = getCanvasCoordinates(e, canvas);
        const canvasX = Math.floor(x);
        const canvasY = Math.floor(y);

        // 🔄 Convertir les coordonnées du canvas de dessin vers le canvas de référence (proportionnel)
        const refX = Math.floor(canvasX * refCanvas.width / canvas.width);
        const refY = Math.floor(canvasY * refCanvas.height / canvas.height);

        // Vérifier les limites du canvas de référence
        if (refX < 0 || refX >= refCanvas.width || refY < 0 || refY >= refCanvas.height) {
            setSelectedColor('#FFFFFF');
            setCurrentTool('brush');
            return;
        }

        // TOUJOURS lire depuis l'image de référence (referenceCanvasRef) - COULEURS PURES
        try {
            const refCtx = refCanvas.getContext('2d', { willReadFrequently: true });
            const pixel = refCtx.getImageData(refX, refY, 1, 1).data;

            // Si le pixel n'est pas transparent, utiliser sa couleur
            if (pixel[3] > 0) {
                // 🎨 FIX V2: Utiliser les valeurs RGB PURES (couleurs vives, pas fades)
                const r = pixel[0];
                const g = pixel[1];
                const b = pixel[2];
                const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
                setSelectedColor(hex);
            } else {
                // Pixel transparent -> blanc par défaut
                setSelectedColor('#FFFFFF');
            }
        } catch (err) {
            console.warn('Pipette: impossible de lire la couleur de référence:', err);
            setSelectedColor('#FFFFFF');
        }

        setCurrentTool('brush');
    };

    const pickColorFromReference = (e) => {
        const refCanvas = referenceCanvasRef.current;
        if (!refCanvas) return;

        const rect = refCanvas.getBoundingClientRect();
        const scaleX = refCanvas.width / rect.width;
        const scaleY = refCanvas.height / rect.height;
        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top) * scaleY);

        const cssX = e.clientX - rect.left;
        const cssY = e.clientY - rect.top;
        setDebugPoint({ cssX, cssY });
        setTimeout(() => setDebugPoint(null), 1200);

        if (x < 0 || x >= refCanvas.width || y < 0 || y >= refCanvas.height) return;
        const ctx = refCanvas.getContext('2d', { willReadFrequently: true });
        const p = ctx.getImageData(x, y, 1, 1).data;
        if (p[3] === 0) return;

        // 🎨 FIX V2: Utiliser les valeurs RGB PURES (couleurs vives, pas fades)
        const r = p[0];
        const g = p[1];
        const b = p[2];
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
        setSelectedColor(hex);
        setCurrentTool('brush');
    };

    const toggleLayerVisibility = (layerId) => {
        setLayers(layers.map(l =>
            l.id === layerId ? { ...l, visible: !l.visible } : l
        ));
        setTimeout(renderLayers, 10);
    };

    const toggleLayerLock = (layerId) => {
        setLayers(layers.map(l =>
            l.id === layerId ? { ...l, locked: !l.locked } : l
        ));
    };

    const changeLayerOpacity = (layerId, opacity) => {
        setLayers(layers.map(l =>
            l.id === layerId ? { ...l, opacity: parseFloat(opacity) } : l
        ));
        setTimeout(renderLayers, 10);
    };

    const saveColoring = () => {
        console.log('🔍 DEBUG SAVE - Start');

        const layersData = layersRef.current.map((layerCanvas, i) => {
            try {
                return {
                    id: layers[i].id,
                    name: layers[i].name,
                    data: layerCanvas.toDataURL('image/png', 1.0),
                    visible: layers[i].visible,
                    opacity: layers[i].opacity,
                    locked: layers[i].locked
                };
            } catch (e) {
                console.error(`❌ Error exporting layer ${i}:`, e);
                return null;
            }
        }).filter(l => l !== null);

        if (layersData.length === 0) {
            alert('❌ Impossible d\'exporter les layers');
            return;
        }

        const previewCanvas = document.createElement('canvas');
        const canvas = canvasRef.current;
        previewCanvas.width = canvas.width;
        previewCanvas.height = canvas.height;
        const previewCtx = previewCanvas.getContext('2d', { alpha: true });

        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = canvas.width;
        exportCanvas.height = canvas.height;
        const exportCtx = exportCanvas.getContext('2d', { alpha: true });

        const templateImg = new Image();
        templateImg.crossOrigin = "anonymous";
        templateImg.onload = () => {
            previewCtx.drawImage(templateImg, 0, 0, previewCanvas.width, previewCanvas.height);
            layers.forEach((layer, index) => {
                if (layer.visible && layersRef.current[index]) {
                    previewCtx.globalAlpha = layer.opacity;
                    previewCtx.drawImage(layersRef.current[index], 0, 0);
                    previewCtx.globalAlpha = 1;
                }
            });

            layers.forEach((layer, index) => {
                if (layer.visible && layersRef.current[index]) {
                    exportCtx.globalAlpha = layer.opacity;
                    exportCtx.drawImage(layersRef.current[index], 0, 0);
                    exportCtx.globalAlpha = 1;
                }
            });

            let previewImageData, exportImageData;
            try {
                previewImageData = previewCanvas.toDataURL('image/png', 0.8);
                exportImageData = exportCanvas.toDataURL('image/png', 1.0);
            } catch (e) {
                console.error('❌ Error generating images:', e);
                previewImageData = null;
                exportImageData = null;
            }

            const userData = JSON.parse(localStorage.getItem('builderberu_users') || '{}');
            if (!userData.user) userData.user = { accounts: {} };
            if (!userData.user.accounts.default) userData.user.accounts.default = {};
            if (!userData.user.accounts.default.colorings) userData.user.accounts.default.colorings = {};
            if (!userData.user.accounts.default.colorings[selectedHunter]) {
                userData.user.accounts.default.colorings[selectedHunter] = {};
            }

            const coloringData = {
                preview: previewImageData,
                exportImage: exportImageData,
                layers: layersData,
                palette: currentModelData.palette,
                createdAt: userData.user.accounts.default.colorings[selectedHunter][selectedModel]?.createdAt || Date.now(),
                updatedAt: Date.now(),
                isCompleted: true,
                hunter: selectedHunter,
                model: selectedModel,
                canvasSize: currentModelData.canvasSize,
                version: '1.0'
            };

            userData.user.accounts.default.colorings[selectedHunter][selectedModel] = coloringData;

            try {
                localStorage.setItem('builderberu_users', JSON.stringify(userData));
                alert(`✅ Coloriage sauvegardé !\n\nHunter: ${selectedHunter}\nModèle: ${selectedModel}\nCalques: ${coloringData.layers.length}`);
            } catch (e) {
                console.error('❌ Error saving:', e);
                if (e.name === 'QuotaExceededError') {
                    alert('⚠️ Espace localStorage plein !');
                } else {
                    alert('❌ Erreur de sauvegarde');
                }
            }
        };

        templateImg.src = currentModelData.template;
    };

    const downloadTransparentPNG = () => {
        const exportCanvas = document.createElement('canvas');
        const canvas = canvasRef.current;
        exportCanvas.width = canvas.width;
        exportCanvas.height = canvas.height;
        const exportCtx = exportCanvas.getContext('2d', { alpha: true });

        const templateImg = new Image();
        templateImg.crossOrigin = "anonymous";

        templateImg.onload = () => {
            exportCtx.drawImage(templateImg, 0, 0, exportCanvas.width, exportCanvas.height);

            layers.forEach((layer, index) => {
                if (layer.visible && layersRef.current[index]) {
                    exportCtx.globalAlpha = layer.opacity;
                    exportCtx.drawImage(layersRef.current[index], 0, 0);
                    exportCtx.globalAlpha = 1;
                }
            });

            exportCanvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${selectedHunter}_${selectedModel}_colored_${Date.now()}.png`;
                link.click();
                URL.revokeObjectURL(url);
                alert('✅ Image téléchargée !');
            }, 'image/png', 1.0);
        };

        templateImg.src = currentModelData.template;
    };

    const downloadColoredPNG = () => {
        const exportCanvas = document.createElement('canvas');
        const refCanvas = referenceCanvasRef.current;

        if (!refCanvas) {
            alert('❌ Modèle de référence non chargé');
            return;
        }

        exportCanvas.width = refCanvas.width;
        exportCanvas.height = refCanvas.height;
        const exportCtx = exportCanvas.getContext('2d', { alpha: true });
        exportCtx.drawImage(refCanvas, 0, 0);

        exportCanvas.toBlob((blob) => {
            if (!blob) {
                alert('❌ Erreur lors de la génération de l\'image');
                return;
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${selectedHunter}_${selectedModel}_reference_${Date.now()}.png`;
            link.click();
            URL.revokeObjectURL(url);
            alert('✅ Modèle de référence téléchargé !');
        }, 'image/png', 1.0);
    };

    const resetColoring = () => {
        if (!confirm('Réinitialiser tout le coloriage ?')) return;

        layersRef.current.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });

        renderLayers();
        setHistory([]);
        setHistoryIndex(-1);
        saveToHistory();
    };

    const exportColoring = () => {
        const userData = JSON.parse(localStorage.getItem('builderberu_users') || '{}');
        const coloring = userData.user?.accounts?.default?.colorings?.[selectedHunter]?.[selectedModel];

        if (!coloring) {
            alert('❌ Aucun coloriage à exporter');
            return;
        }

        const exportData = {
            hunter: selectedHunter,
            model: selectedModel,
            data: coloring,
            exportedAt: Date.now(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedHunter}_${selectedModel}_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        alert('✅ Coloriage exporté !');
    };

    const importColoring = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);

                    if (!importedData.hunter || !importedData.data) {
                        throw new Error('Format invalide');
                    }

                    const userData = JSON.parse(localStorage.getItem('builderberu_users') || '{}');
                    if (!userData.user) userData.user = { accounts: {} };
                    if (!userData.user.accounts.default) userData.user.accounts.default = {};
                    if (!userData.user.accounts.default.colorings) userData.user.accounts.default.colorings = {};
                    if (!userData.user.accounts.default.colorings[importedData.hunter]) {
                        userData.user.accounts.default.colorings[importedData.hunter] = {};
                    }

                    userData.user.accounts.default.colorings[importedData.hunter][importedData.model] = importedData.data;
                    localStorage.setItem('builderberu_users', JSON.stringify(userData));

                    alert('✅ Coloriage importé ! Recharge la page pour voir le résultat.');

                    if (importedData.hunter === selectedHunter && importedData.model === selectedModel) {
                        window.location.reload();
                    }
                } catch (error) {
                    alert('❌ Erreur lors de l\'import : ' + error.message);
                }
            };

            reader.readAsText(file);
        };

        input.click();
    };

    const handleModelChange = (modelId) => {
        setSelectedModel(modelId);
        setImagesLoaded(false);
        setHistory([]);
        setHistoryIndex(-1);
        setColoringProgress(0);
        setProgressDetails(null);
    };

    // COMPOSANT D'AFFICHAGE DU POURCENTAGE
    const ProgressDisplay = () => (
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold text-sm">🎯 Progression</span>
                <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                    {coloringProgress}%
                </span>
            </div>

            <div className="w-full bg-purple-900/30 rounded-full h-3 mb-2 overflow-hidden">
                <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-700 ease-out relative"
                    style={{ width: `${coloringProgress}%` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                </div>
            </div>

            {progressDetails && (
                <div className="text-xs text-purple-200 space-y-1">
                    <div>✨ Pixels colorés: {progressDetails.coloredPixels.toLocaleString()}</div>
                    <div>🎯 Zones totales: {progressDetails.totalColorablePixels.toLocaleString()}</div>
                    <div>📚 Calques actifs: {progressDetails.details.layers}</div>
                </div>
            )}

            <div className="mt-2 text-xs text-center">
                {coloringProgress === 0 && (
                    <span className="text-purple-300">🚀 Commence ton chef-d'œuvre !</span>
                )}
                {coloringProgress > 0 && coloringProgress < 25 && (
                    <span className="text-blue-300">👶 Tu commences bien !</span>
                )}
                {coloringProgress >= 25 && coloringProgress < 50 && (
                    <span className="text-green-300">💪 Tu progresses rapidement !</span>
                )}
                {coloringProgress >= 50 && coloringProgress < 75 && (
                    <span className="text-yellow-300">🔥 Tu es sur la bonne voie !</span>
                )}
                {coloringProgress >= 75 && coloringProgress < 90 && (
                    <span className="text-orange-300">⭐ Presque fini, courage !</span>
                )}
                {coloringProgress >= 90 && coloringProgress < 100 && (
                    <span className="text-pink-300">🎉 Plus que quelques détails !</span>
                )}
                {coloringProgress === 100 && (
                    <span className="text-yellow-300 font-bold">🏆 CHEF-D'ŒUVRE TERMINÉ ! 🏆</span>
                )}
            </div>

            <button
                onClick={updateProgress}
                className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-1 rounded-lg text-xs font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
                🔄 Recalculer progression
            </button>
        </div>
    );

    const MobileProgressBadge = () => (
        <div
            className="fixed top-20 right-4 z-[1000] bg-black/60 backdrop-blur-md rounded-full px-3 py-2 border border-purple-500/30"
            style={{ minWidth: '70px' }}
        >
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <span className="text-white font-bold text-sm">{coloringProgress}%</span>
            </div>
        </div>
    );

    const handleHunterChange = (hunterId) => {
        setSelectedHunter(hunterId);
        setSelectedModel('default');
        setImagesLoaded(false);
        setHistory([]);
        setHistoryIndex(-1);
        setColoringProgress(0);
        setProgressDetails(null);
    };

    // Canvas event handlers
    const handleWheel = (e) => {
        // Vérifier si la molette est utilisée sur le canvas ou l'overlay
        const isOnCanvas = e.target === canvasRef.current ||
                          e.target === overlayCanvasRef.current;

        if (isOnCanvas) {
            // Si sur le canvas, empêcher le scroll et zoomer
            e.preventDefault();
            const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
            handleZoom(delta);
        }
        // Si pas sur le canvas, laisser le scroll normal fonctionner
    };

    const startPan = (e) => {
        if (e.button === 2 || (e.button === 0 && e.ctrlKey)) {
            setIsPanning(true);
            setLastPanPoint({ x: e.clientX, y: e.clientY });
            e.preventDefault();
        }
    };

    const handlePan = (e) => {
        if (isPanning) {
            const deltaX = e.clientX - lastPanPoint.x;
            const deltaY = e.clientY - lastPanPoint.y;

            setPanOffset(prev => ({
                x: prev.x + deltaX,
                y: prev.y + deltaY
            }));

            setLastPanPoint({ x: e.clientX, y: e.clientY });
        }
    };

    const stopPan = () => {
        setIsPanning(false);
    };

    // Reference canvas handlers
    const handleRefZoom = (delta) => {
        const newZoom = Math.max(0.5, Math.min(3, refZoomLevel + delta));
        setRefZoomLevel(newZoom);
    };

    const resetRefView = () => {
        setRefZoomLevel(1);
        setRefPanOffset({ x: 0, y: 0 });
    };

    const handleRefWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        handleRefZoom(delta);
    };

    const startRefPan = (e) => {
        if (e.button === 2 || (e.button === 0 && e.ctrlKey)) {
            setIsRefPanning(true);
            setLastRefPanPoint({ x: e.clientX, y: e.clientY });
            e.preventDefault();
        }
    };

    const handleRefPan = (e) => {
        if (isRefPanning) {
            const deltaX = e.clientX - lastRefPanPoint.x;
            const deltaY = e.clientY - lastRefPanPoint.y;

            setRefPanOffset(prev => ({
                x: prev.x + deltaX,
                y: prev.y + deltaY
            }));

            setLastRefPanPoint({ x: e.clientX, y: e.clientY });
        }
    };

    const stopRefPan = () => {
        setIsRefPanning(false);
    };

    const resetView = () => {
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
    };

    if (!currentModelData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-white text-xl">Modèle non trouvé</div>
            </div>
        );
    }

    // RENDER MOBILE
    if (isMobile) {
        return (
            <div className="min-h-screen bg-[#0a0118] overflow-hidden">
                <style>{`
                    @keyframes pulse {
                        0%, 100% { transform: translate(-50%, -50%) scale(1); }
                        50% { transform: translate(-50%, -50%) scale(1.3); }
                    }

                    @keyframes float {
                        0%, 100% { transform: translate(-50%, -50%) scaleY(-1) translateY(0); }
                        50% { transform: translate(-50%, -50%) scaleY(-1) translateY(-5px); }
                    }

                    .mobile-fab {
                        position: fixed;
                        width: 56px;
                        height: 56px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 24px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                        z-index: 1000;
                        transition: all 0.3s ease;
                    }

                    .mobile-fab:active {
                        transform: scale(0.95);
                    }
                `}</style>

                {/* HEADER MOBILE COMPACT */}
                <div className="bg-black/30 backdrop-blur-sm border-b border-purple-500/30 px-3 py-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 py-3">
                            <img
                                src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760821994/DrasBeru_zd8ju5.png"
                                alt="DrawBeru logo"
                                className="w-8 h-8 select-none"
                            />
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-bold">DrawBeru</h1>
                                <p className="text-xs text-purple-200">{currentModelData.name}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-white text-2xl p-2"
                        >
                            ☰
                        </button>
                    </div>
                </div>

                {/* 🎨 CANVAS DE RÉFÉRENCE CACHÉ POUR PIPETTE MOBILE */}
                <canvas
                    ref={referenceCanvasRef}
                    style={{ display: 'none' }}
                />

                {/* 🎨 AUTO-PIPETTE NOTIFICATION MOBILE */}
                {autoPipetteMode && !autoDrawBeruActive && (
                    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-[9998]">
                        <div className="bg-gradient-to-r from-green-500/90 to-emerald-600/90 text-white px-4 py-2 rounded-full shadow-lg border border-green-400/50 backdrop-blur-sm">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <span>🎯</span>
                                <span>Auto-Pipette ON</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 🦋 AUTO-DRAW NOTIFICATION MOBILE */}
                {autoDrawBeruActive && (
                    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-[9998]">
                        <div className={`text-white px-4 py-3 rounded-2xl shadow-lg border backdrop-blur-sm ${
                            selectedPainterId === 'tank'
                                ? 'bg-gradient-to-r from-green-500/90 via-emerald-500/90 to-green-600/90 border-green-400/50'
                                : 'bg-gradient-to-r from-purple-500/90 via-pink-500/90 to-purple-600/90 border-purple-400/50'
                        }`}>
                            <div className="flex items-center gap-3">
                                <img
                                    src={currentPainter.sprites.front}
                                    alt={currentPainter.name}
                                    className="w-8 h-8 object-contain animate-bounce"
                                />
                                <div className="text-center">
                                    <div className="text-sm font-bold">
                                        {selectedPainterId === 'tank' ? '🐻 Tank' : '🦋 AutoDrawBeru'}
                                    </div>
                                    <div className="text-xl font-bold">{autoDrawBeruTimeRemaining}s</div>
                                </div>
                                <button
                                    onClick={toggleAutoDrawBeru}
                                    className="px-2 py-1 bg-red-500/80 rounded text-xs font-medium"
                                >
                                    Stop
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 🦋 BERU PAPILLON ZONE SELECTION OVERLAY MOBILE */}
                {zoneSelectionMode && (
                    <div className="fixed inset-0 z-[10001] bg-black/80 flex flex-col">
                        {/* Header compact */}
                        <div className="bg-[#1a0a2e]/95 backdrop-blur-sm border-b border-purple-500/30 p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <img
                                        src={CHIBI_PAINTERS.beru_papillon.sprites.front}
                                        alt="Beru Papillon"
                                        className="w-8 h-8 object-contain"
                                    />
                                    <div>
                                        <h2 className="text-sm font-bold text-purple-200">Placer la zone</h2>
                                        <p className="text-[10px] text-purple-400">Glisse pour déplacer le cadre</p>
                                    </div>
                                </div>
                                {/* Stats du chibi expliquant la taille */}
                                <div className="text-right text-[10px] text-purple-400">
                                    <div>⚡ Vitesse: {CHIBI_PAINTERS.beru_papillon.stats.speed}</div>
                                    <div>💪 Endurance: {CHIBI_PAINTERS.beru_papillon.stats.endurance}</div>
                                    <div className="text-pink-400 font-semibold">📐 {zoneSize.width}×{zoneSize.height}px</div>
                                </div>
                            </div>
                        </div>

                        {/* Canvas avec zone draggable */}
                        <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                            {/* Afficher le canvas en fond - zone touchable */}
                            {canvasRef.current && (
                                <div
                                    className="relative touch-none"
                                    onTouchStart={(e) => {
                                        if (e.touches.length === 1) {
                                            const touch = e.touches[0];
                                            const canvas = canvasRef.current;
                                            if (!canvas) return;

                                            // 📐 Trouver le canvas affiché dans le DOM
                                            const displayedCanvas = e.currentTarget.querySelector('canvas');
                                            if (!displayedCanvas) return;
                                            const canvasRect = displayedCanvas.getBoundingClientRect();

                                            // Calculer la position relative au canvas affiché
                                            const scale = canvasRect.width / canvas.width;
                                            const canvasX = (touch.clientX - canvasRect.left) / scale;
                                            const canvasY = (touch.clientY - canvasRect.top) / scale;

                                            setZonePosition({
                                                x: Math.max(zoneSize.width/2, Math.min(canvas.width - zoneSize.width/2, canvasX)),
                                                y: Math.max(zoneSize.height/2, Math.min(canvas.height - zoneSize.height/2, canvasY))
                                            });
                                        }
                                    }}
                                    onTouchMove={(e) => {
                                        if (e.touches.length === 1) {
                                            const touch = e.touches[0];
                                            const canvas = canvasRef.current;
                                            if (!canvas) return;

                                            const displayedCanvas = e.currentTarget.querySelector('canvas');
                                            if (!displayedCanvas) return;
                                            const canvasRect = displayedCanvas.getBoundingClientRect();

                                            const scale = canvasRect.width / canvas.width;
                                            const canvasX = (touch.clientX - canvasRect.left) / scale;
                                            const canvasY = (touch.clientY - canvasRect.top) / scale;

                                            setZonePosition({
                                                x: Math.max(zoneSize.width/2, Math.min(canvas.width - zoneSize.width/2, canvasX)),
                                                y: Math.max(zoneSize.height/2, Math.min(canvas.height - zoneSize.height/2, canvasY))
                                            });
                                        }
                                    }}
                                >
                                    <canvas
                                        ref={(el) => {
                                            if (el && canvasRef.current) {
                                                const ctx = el.getContext('2d');
                                                el.width = canvasRef.current.width;
                                                el.height = canvasRef.current.height;
                                                ctx.drawImage(canvasRef.current, 0, 0);
                                            }
                                        }}
                                        className="max-w-full max-h-full object-contain opacity-60"
                                        style={{
                                            imageRendering: 'pixelated',
                                            maxHeight: 'calc(100vh - 220px)', // Laisser place au header et footer
                                        }}
                                    />
                                    {/* Overlay de la zone - SUPERPOSÉ exactement sur le canvas */}
                                    <svg
                                        className="absolute top-0 left-0 pointer-events-none"
                                        style={{ width: '100%', height: '100%' }}
                                        viewBox={canvasRef.current ? `0 0 ${canvasRef.current.width} ${canvasRef.current.height}` : '0 0 100 100'}
                                        preserveAspectRatio="xMidYMid meet"
                                    >
                                        <g transform={`translate(${zonePosition.x}, ${zonePosition.y}) rotate(${zoneRotation})`}>
                                            {selectedZoneShape === 'rectangle' && (
                                                <rect
                                                    x={-zoneSize.width / 2}
                                                    y={-zoneSize.height / 2}
                                                    width={zoneSize.width}
                                                    height={zoneSize.height}
                                                    fill="rgba(147,51,234,0.25)"
                                                    stroke="rgba(236,72,153,1)"
                                                    strokeWidth="3"
                                                    strokeDasharray="8,4"
                                                />
                                            )}
                                            {selectedZoneShape === 'square' && (
                                                <rect
                                                    x={-Math.min(zoneSize.width, zoneSize.height) / 2}
                                                    y={-Math.min(zoneSize.width, zoneSize.height) / 2}
                                                    width={Math.min(zoneSize.width, zoneSize.height)}
                                                    height={Math.min(zoneSize.width, zoneSize.height)}
                                                    fill="rgba(147,51,234,0.25)"
                                                    stroke="rgba(236,72,153,1)"
                                                    strokeWidth="3"
                                                    strokeDasharray="8,4"
                                                />
                                            )}
                                            {selectedZoneShape === 'circle' && (
                                                <ellipse
                                                    cx="0"
                                                    cy="0"
                                                    rx={zoneSize.width / 2}
                                                    ry={zoneSize.height / 2}
                                                    fill="rgba(147,51,234,0.25)"
                                                    stroke="rgba(236,72,153,1)"
                                                    strokeWidth="3"
                                                    strokeDasharray="8,4"
                                                />
                                            )}
                                            {selectedZoneShape === 'triangle' && (
                                                <polygon
                                                    points={`0,${-zoneSize.height / 2} ${zoneSize.width / 2},${zoneSize.height / 2} ${-zoneSize.width / 2},${zoneSize.height / 2}`}
                                                    fill="rgba(147,51,234,0.25)"
                                                    stroke="rgba(236,72,153,1)"
                                                    strokeWidth="3"
                                                    strokeDasharray="8,4"
                                                />
                                            )}
                                            {selectedZoneShape === 'heart' && (
                                                <path
                                                    d={`M 0 ${zoneSize.height * 0.35}
                                                        C ${-zoneSize.width * 0.5} ${-zoneSize.height * 0.2}, ${-zoneSize.width * 0.5} ${-zoneSize.height * 0.5}, 0 ${-zoneSize.height * 0.15}
                                                        C ${zoneSize.width * 0.5} ${-zoneSize.height * 0.5}, ${zoneSize.width * 0.5} ${-zoneSize.height * 0.2}, 0 ${zoneSize.height * 0.35}`}
                                                    fill="rgba(147,51,234,0.25)"
                                                    stroke="rgba(236,72,153,1)"
                                                    strokeWidth="3"
                                                    strokeDasharray="8,4"
                                                />
                                            )}
                                            {selectedZoneShape === 'star' && (
                                                <polygon
                                                    points={(() => {
                                                        const points = [];
                                                        const outerR = zoneSize.width / 2;
                                                        const innerR = outerR * 0.4;
                                                        for (let i = 0; i < 10; i++) {
                                                            const r = i % 2 === 0 ? outerR : innerR;
                                                            const angle = (i * Math.PI / 5) - Math.PI / 2;
                                                            points.push(`${r * Math.cos(angle)},${r * Math.sin(angle)}`);
                                                        }
                                                        return points.join(' ');
                                                    })()}
                                                    fill="rgba(147,51,234,0.25)"
                                                    stroke="rgba(236,72,153,1)"
                                                    strokeWidth="3"
                                                    strokeDasharray="8,4"
                                                />
                                            )}
                                            {selectedZoneShape === 'diamond' && (
                                                <polygon
                                                    points={`0,${-zoneSize.height / 2} ${zoneSize.width / 2},0 0,${zoneSize.height / 2} ${-zoneSize.width / 2},0`}
                                                    fill="rgba(147,51,234,0.25)"
                                                    stroke="rgba(236,72,153,1)"
                                                    strokeWidth="3"
                                                    strokeDasharray="8,4"
                                                />
                                            )}
                                            {selectedZoneShape === 'hexagon' && (
                                                <polygon
                                                    points={(() => {
                                                        const points = [];
                                                        for (let i = 0; i < 6; i++) {
                                                            const angle = (i * Math.PI / 3) - Math.PI / 2;
                                                            points.push(`${zoneSize.width / 2 * Math.cos(angle)},${zoneSize.height / 2 * Math.sin(angle)}`);
                                                        }
                                                        return points.join(' ');
                                                    })()}
                                                    fill="rgba(147,51,234,0.25)"
                                                    stroke="rgba(236,72,153,1)"
                                                    strokeWidth="3"
                                                    strokeDasharray="8,4"
                                                />
                                            )}
                                            {selectedZoneShape === 'cloud' && (
                                                <g>
                                                    <ellipse cx="0" cy="0" rx={zoneSize.width * 0.25} ry={zoneSize.height * 0.25} fill="rgba(147,51,234,0.25)" stroke="rgba(236,72,153,1)" strokeWidth="3" strokeDasharray="8,4" />
                                                    <ellipse cx={-zoneSize.width * 0.25} cy="0" rx={zoneSize.width * 0.2} ry={zoneSize.height * 0.2} fill="rgba(147,51,234,0.25)" stroke="rgba(236,72,153,1)" strokeWidth="3" strokeDasharray="8,4" />
                                                    <ellipse cx={zoneSize.width * 0.25} cy="0" rx={zoneSize.width * 0.2} ry={zoneSize.height * 0.2} fill="rgba(147,51,234,0.25)" stroke="rgba(236,72,153,1)" strokeWidth="3" strokeDasharray="8,4" />
                                                    <ellipse cx="0" cy={-zoneSize.height * 0.15} rx={zoneSize.width * 0.18} ry={zoneSize.height * 0.18} fill="rgba(147,51,234,0.25)" stroke="rgba(236,72,153,1)" strokeWidth="3" strokeDasharray="8,4" />
                                                </g>
                                            )}
                                            {/* Point central */}
                                            <circle cx="0" cy="0" r="5" fill="rgba(236,72,153,1)" />
                                        </g>
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Contrôles en bas - TRANSPARENT */}
                        <div className="bg-black/40 backdrop-blur-sm border-t border-purple-500/30 p-3">
                            {/* Sélection de forme */}
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs text-purple-300">✨</span>
                                <div className="flex gap-1 flex-1 flex-wrap justify-center overflow-x-auto">
                                    {[
                                        { id: 'rectangle', icon: '▬' },
                                        { id: 'circle', icon: '●' },
                                        { id: 'heart', icon: '💖' },
                                        { id: 'star', icon: '⭐' },
                                        { id: 'diamond', icon: '💎' },
                                        { id: 'triangle', icon: '▲' },
                                        { id: 'hexagon', icon: '⬡' },
                                        { id: 'cloud', icon: '☁️' }
                                    ].map(shape => (
                                        <button
                                            key={shape.id}
                                            onClick={() => setSelectedZoneShape(shape.id)}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${
                                                selectedZoneShape === shape.id
                                                    ? 'bg-pink-500 scale-110'
                                                    : 'bg-purple-800/50'
                                            }`}
                                        >
                                            {shape.icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Rotation rapide */}
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs text-purple-300">🔄</span>
                                <div className="flex gap-1 flex-1 flex-wrap justify-center">
                                    {[0, 45, 90, 135, 180, 270].map(angle => (
                                        <button
                                            key={angle}
                                            onClick={() => setZoneRotation(angle)}
                                            className={`px-2 py-1 text-xs rounded transition-all ${
                                                zoneRotation === angle
                                                    ? 'bg-pink-500 text-white'
                                                    : 'bg-purple-800/50 text-purple-300'
                                            }`}
                                        >
                                            {angle}°
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Boutons d'action */}
                            <div className="flex gap-2">
                                <button
                                    onClick={cancelZoneSelection}
                                    className="flex-1 py-2.5 px-3 rounded-xl bg-gray-700/50 text-gray-200 font-medium text-sm"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={startChibiWithZone}
                                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-500/30"
                                >
                                    🦋 C&apos;est parti !
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MOBILE PROGRESS BADGE */}
                <MobileProgressBadge />

                {/* MOBILE MENU OVERLAY */}
                {mobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] overflow-y-auto"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <div
                            className="bg-[#1a1a2f] m-4 rounded-xl p-4 max-h-[85vh] overflow-y-auto border border-purple-500/30"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-white">Menu</h2>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-white text-2xl"
                                >
                                    ✕
                                </button>
                            </div>
                            {/* PROGRESS DISPLAY MOBILE */}
                            <ProgressDisplay />

                            {/* HUNTER/MODEL SELECTORS */}
                            <div className="mb-4 space-y-2">
                                <select
                                    value={selectedHunter}
                                    onChange={(e) => {
                                        handleHunterChange(e.target.value);
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full bg-purple-800/50 text-white border border-purple-500/50 rounded-lg px-3 py-2 text-sm"
                                >
                                    {Object.entries(drawBeruModels).map(([hunterId, hunterData]) => (
                                        <option key={hunterId} value={hunterId}>
                                            {hunterData.name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={selectedModel}
                                    onChange={(e) => {
                                        handleModelChange(e.target.value);
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full bg-purple-800/50 text-white border border-purple-500/50 rounded-lg px-3 py-2 text-sm"
                                >
                                    {Object.entries(availableModels).map(([modelId, modelData]) => (
                                        <option key={modelId} value={modelId}>
                                            {modelData.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* PALETTE */}
                            <div className="mb-4">
                                <h3 className="text-white text-sm font-semibold mb-2">🎨 Palette</h3>
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    {Object.entries(currentModelData.palette).map(([id, color]) => (
                                        <button
                                            key={id}
                                            onClick={() => {
                                                setSelectedColor(color);
                                                setMobileMenuOpen(false);
                                            }}
                                            className={`h-12 rounded-lg border-2 transition-all ${selectedColor === color
                                                ? 'border-white scale-110'
                                                : 'border-purple-500/50'
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <input
                                    type="color"
                                    value={selectedColor}
                                    onChange={(e) => setSelectedColor(e.target.value)}
                                    className="w-full h-10 rounded-lg border border-purple-500/50"
                                />
                            </div>

                            {/* 🎨 FEATURE 1: BRUSH TYPE SELECTOR MOBILE */}
                            <div className="mb-4">
                                <h3 className="text-white text-sm font-semibold mb-2">🖌️ Type de pinceau</h3>
                                <div className="grid grid-cols-5 gap-2">
                                    {Object.entries(BRUSH_TYPES).map(([key, brush]) => (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                setBrushType(key);
                                            }}
                                            className={`h-12 rounded-lg flex flex-col items-center justify-center transition-all ${
                                                brushType === key
                                                    ? 'bg-purple-600 ring-2 ring-purple-400'
                                                    : 'bg-purple-800/50'
                                            }`}
                                        >
                                            <span className="text-lg">{brush.icon}</span>
                                            <span className="text-[9px] text-white/80">{brush.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 🔢 FEATURE 2: BRUSH SIZE with +/- */}
                            <div className="mb-4">
                                <label className="text-white text-sm mb-2 block">
                                    Taille pinceau: {brushSize.toFixed(1)}px
                                </label>
                                <div className="flex items-center gap-2 mb-2">
                                    <button
                                        onClick={decrementBrushSize}
                                        onTouchStart={() => startBrushSizeRepeat(false)}
                                        onTouchEnd={stopBrushSizeRepeat}
                                        className="w-12 h-10 rounded bg-purple-700/50 active:bg-purple-600/50 text-white font-bold text-xl"
                                    >
                                        −
                                    </button>
                                    <span className="text-purple-300 font-mono font-bold flex-1 text-center">
                                        {brushSize.toFixed(1)}px
                                    </span>
                                    <button
                                        onClick={incrementBrushSize}
                                        onTouchStart={() => startBrushSizeRepeat(true)}
                                        onTouchEnd={stopBrushSizeRepeat}
                                        className="w-12 h-10 rounded bg-purple-700/50 active:bg-purple-600/50 text-white font-bold text-xl"
                                    >
                                        +
                                    </button>
                                </div>
                                <input
                                    type="range"
                                    min={0.1}
                                    max={50}
                                    step={0.1}
                                    value={brushSize}
                                    onChange={(e) => setBrushSize(parseFloat(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            {/* ✨ PRECISION: Stabilisation Mobile */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-white text-sm flex items-center gap-2">
                                        🎯 Stabilisation
                                    </label>
                                    <span className="text-purple-300 text-sm font-mono">
                                        {stabilization === 0 ? 'OFF' : stabilization}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={10}
                                    step={1}
                                    value={stabilization}
                                    onChange={(e) => setStabilization(parseInt(e.target.value))}
                                    className="w-full"
                                />
                                <p className="text-purple-300/70 text-xs mt-1">
                                    Lisse le trait pour plus de précision
                                </p>
                            </div>

                            {/* LAYERS */}
                            <div className="mb-4">
                                <h3 className="text-white text-sm font-semibold mb-2">📚 Calques</h3>
                                <div className="space-y-2">
                                    {layers.map((layer) => (
                                        <div
                                            key={layer.id}
                                            className={`p-2 rounded-lg border ${activeLayer === layer.id
                                                ? 'border-purple-400 bg-purple-900/50'
                                                : 'border-purple-700/30 bg-purple-900/20'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <button
                                                    onClick={() => {
                                                        setActiveLayer(layer.id);
                                                        setMobileMenuOpen(false);
                                                    }}
                                                    className="text-white text-sm flex-1 text-left"
                                                >
                                                    {layer.name}
                                                </button>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => toggleLayerVisibility(layer.id)}
                                                        className="text-white text-lg"
                                                    >
                                                        {layer.visible ? '👁️' : '🚫'}
                                                    </button>
                                                    <button
                                                        onClick={() => toggleLayerLock(layer.id)}
                                                        className="text-white text-lg"
                                                    >
                                                        {layer.locked ? '🔒' : '🔓'}
                                                    </button>
                                                </div>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                value={layer.opacity}
                                                onChange={(e) => changeLayerOpacity(layer.id, e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ACTIONS */}
                            <div className="space-y-2">
                                <button
                                    onClick={() => {
                                        saveColoring();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full bg-green-600 text-white py-2 rounded-lg text-sm"
                                >
                                    💾 Sauvegarder
                                </button>
                                <button
                                    onClick={() => {
                                        downloadColoredPNG();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm"
                                >
                                    🖼️ PNG Coloré
                                </button>
                                <button
                                    onClick={() => {
                                        downloadTransparentPNG();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full bg-pink-600 text-white py-2 rounded-lg text-sm"
                                >
                                    🎨 PNG Transparent
                                </button>
                                <button
                                    onClick={() => {
                                        resetColoring();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full bg-red-600 text-white py-2 rounded-lg text-sm"
                                >
                                    🗑️ Reset
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* CANVAS MOBILE FULLSCREEN */}
                <div className="relative w-full" style={{ height: 'calc(100vh - 120px)' }}>
                    <div
                        className="absolute inset-0 bg-white flex items-center justify-center overflow-hidden"
                        onTouchStart={(e) => {
                            if (interactionMode === 'pan' && currentTool !== 'pipette') {
                                canvasTouchStart(e);
                            } else {
                                handleTouchDraw(e);
                            }
                        }}
                        onTouchMove={(e) => {
                            if (interactionMode === 'pan' && currentTool !== 'pipette') {
                                canvasTouchMove(e);
                            } else {
                                handleTouchDraw(e);
                            }
                        }}
                        onTouchEnd={(e) => {
                            if (interactionMode === 'pan' && currentTool !== 'pipette') {
                                canvasTouchEnd(e);
                            } else {
                                stopDrawing();
                            }
                        }}
                    >
                        <div
                            style={{
                                transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                                transformOrigin: 'center center',
                                transition: 'none',
                                position: 'relative'
                            }}
                        >
                            <canvas
                                ref={canvasRef}
                                style={{
                                    display: 'block',
                                    touchAction: 'none',
                                    cursor: currentTool === 'pipette' ? 'crosshair' : (interactionMode === 'pan' ? 'grab' : 'crosshair')
                                }}
                            />

                            {showModelOverlay && (
                                <canvas
                                    ref={overlayCanvasRef}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        pointerEvents: 'none',
                                        opacity: modelOverlayOpacity,
                                        touchAction: 'none'
                                    }}
                                />
                            )}

                            {/* 🦋 MULTI-CHIBI HELPERS MOBILE - Affiche tous les chibis actifs */}
                            {canvasRef.current && Object.entries(activeChibis).map(([chibiId, chibiState]) => {
                                if (!chibiState.active) return null;
                                const painter = CHIBI_PAINTERS[chibiId];
                                if (!painter) return null;

                                return (
                                    <img
                                        key={chibiId}
                                        src={chibiState.facingFront ? painter.sprites.front : painter.sprites.back}
                                        alt={painter.name}
                                        className="pointer-events-none drop-shadow-lg"
                                        style={{
                                            position: 'absolute',
                                            left: `${(chibiState.position.x / canvasRef.current.width) * 100}%`,
                                            top: `${(chibiState.position.y / canvasRef.current.height) * 100}%`,
                                            width: '40px',
                                            height: '40px',
                                            transform: chibiState.facingFront
                                                ? 'translate(-50%, -50%)'
                                                : `translate(-50%, -50%) scaleX(${chibiState.direction || 1})`,
                                            zIndex: 100 + (chibiId === 'tank' ? 1 : 0),
                                            filter: chibiState.facingFront
                                                ? painter.id === 'tank'
                                                    ? 'drop-shadow(0 0 12px rgba(74, 222, 128, 0.9))'
                                                    : 'drop-shadow(0 0 12px rgba(236, 72, 153, 0.9))'
                                                : painter.id === 'tank'
                                                    ? 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.8))'
                                                    : 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.8))',
                                            animation: chibiState.facingFront ? 'none' : 'float 1s ease-in-out infinite',
                                            transition: 'filter 0.3s ease, transform 0.2s ease'
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* 🦋 CHIBI BUBBLES MOBILE - Une bulle par chibi actif */}
                    {canvasRef.current && Object.entries(activeChibis).map(([chibiId, chibiState]) => {
                        if (!chibiState.active || !chibiState.message) return null;
                        const painter = CHIBI_PAINTERS[chibiId];
                        if (!painter) return null;

                        return (
                            <ChibiBubble
                                key={`bubble-mobile-${chibiId}`}
                                message={chibiState.message}
                                position={{
                                    x: window.innerWidth / 2,
                                    y: Math.max(60, canvasRef.current.getBoundingClientRect().top +
                                       (chibiState.position.y / canvasRef.current.height) * canvasRef.current.getBoundingClientRect().height - 80)
                                }}
                                entityType={painter.entityType}
                                isMobile={{ isPhone: true }}
                            />
                        );
                    })}

                    {/* CONTROLS EN HAUT */}
                    <div className="absolute top-4 left-4 right-4 z-[1000] flex items-start gap-3">
                        <div className="flex gap-2">
                            <button
                                onClick={() =>
                                    setInteractionMode(interactionMode === 'draw' ? 'pan' : 'draw')
                                }
                                className="w-10 h-10 rounded-lg shadow-md transition-all active:scale-95 backdrop-blur-sm border"
                                style={{
                                    backgroundImage:
                                        interactionMode === 'draw'
                                            ? "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760823190/Pinceau_cwjaxh.png')" // pinceau
                                            : "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760824762/Deplace_v5rkuq.png')", // ✋ en PNG
                                    backgroundSize: "100% 100%",   // prend toute la largeur et hauteur
                                    backgroundPosition: "center",
                                    backgroundRepeat: "no-repeat",
                                    backgroundColor:
                                        interactionMode === 'draw'
                                            ? "rgba(22,163,74,0.4)"   // vert si draw
                                            : "rgba(37,99,235,0.4)",  // bleu si pan
                                    borderColor:
                                        interactionMode === 'draw'
                                            ? "rgba(74,222,128,0.2)"
                                            : "rgba(147,197,253,0.2)"
                                }}
                                aria-label={interactionMode === 'draw' ? 'Pinceau' : 'Main'}
                            />

                            <button
                                onClick={() => setShowModelOverlay(!showModelOverlay)}
                                className="w-10 h-10 rounded-lg shadow-md transition-all active:scale-95 backdrop-blur-sm border"
                                style={{
                                    backgroundImage: showModelOverlay
                                        ? "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754055045/sungicon_bfndrc.png')"   // 👁️
                                        : "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760826182/hide_te5av9.png')", // 🙈
                                    backgroundSize: "100% 100%",
                                    backgroundPosition: "center",
                                    backgroundRepeat: "no-repeat",
                                    backgroundColor: showModelOverlay
                                        ? "rgba(147,51,234,0.4)"   // violet si actif
                                        : "rgba(55,65,81,0.4)",    // gris si inactif
                                    borderColor: showModelOverlay
                                        ? "rgba(216,180,254,0.2)"
                                        : "rgba(156,163,175,0.2)"
                                }}
                                aria-label={showModelOverlay ? "Cacher le modèle" : "Afficher le modèle"}
                            />
                        </div>

                        {showModelOverlay && (
                            <div className="flex-1 bg-black/60 backdrop-blur-md rounded-lg p-2 shadow-lg border border-purple-500/30 max-w-[200px]">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-white text-[10px] font-semibold">Opacité</span>
                                    <span className="text-purple-300 text-[10px] font-mono">{Math.round(modelOverlayOpacity * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={modelOverlayOpacity}
                                    onChange={(e) => setModelOverlayOpacity(parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-purple-900/50 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        )}
                    </div>

                    {/* CONTROLS BAS */}
                    <div className="fixed bottom-20 left-2 right-2 z-[1000] flex items-center gap-2">
                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={undo}
                                disabled={!canUndo}
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-md transition-all active:scale-95 backdrop-blur-sm ${canUndo
                                    ? 'bg-blue-600/40 hover:bg-blue-600/60 text-white border border-blue-400/20'
                                    : 'bg-gray-600/30 text-gray-400 border border-gray-500/15'
                                    }`}
                            >
                                ↶
                            </button>
                            <button
                                onClick={redo}
                                disabled={!canRedo}
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-md transition-all active:scale-95 backdrop-blur-sm ${canRedo
                                    ? 'bg-blue-600/40 hover:bg-blue-600/60 text-white border border-blue-400/20'
                                    : 'bg-gray-600/30 text-gray-400 border border-gray-500/15'
                                    }`}
                            >
                                ↷
                            </button>
                        </div>

                        {/* 🔢 FEATURE 2: Mobile brush size with +/- buttons */}
                        {(currentTool === 'brush' || currentTool === 'eraser') && (
                            <div className="flex-1 bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1.5 shadow-md border border-purple-500/20">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="flex items-center justify-center w-6 h-6 rounded bg-purple-600/50 text-sm shrink-0 bg-center bg-no-repeat bg-contain"
                                        style={{
                                            backgroundImage:
                                                currentTool === 'brush'
                                                    ? "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760823190/Pinceau_cwjaxh.png')"
                                                    : "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760827288/pipette_kqqmzh.png')"
                                        }}
                                    />

                                    {/* 🔢 Boutons +/- mobile */}
                                    <button
                                        onClick={decrementBrushSize}
                                        onTouchStart={() => startBrushSizeRepeat(false)}
                                        onTouchEnd={stopBrushSizeRepeat}
                                        className="w-8 h-8 rounded bg-purple-700/50 active:bg-purple-600/50 text-white font-bold text-lg flex items-center justify-center shrink-0"
                                    >
                                        −
                                    </button>
                                    <span className="text-purple-300 text-[10px] font-mono font-bold min-w-[38px] text-center">
                                        {brushSize.toFixed(1)}px
                                    </span>
                                    <button
                                        onClick={incrementBrushSize}
                                        onTouchStart={() => startBrushSizeRepeat(true)}
                                        onTouchEnd={stopBrushSizeRepeat}
                                        className="w-8 h-8 rounded bg-purple-700/50 active:bg-purple-600/50 text-white font-bold text-lg flex items-center justify-center shrink-0"
                                    >
                                        +
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="50"
                                            step="0.1"
                                            value={brushSize}
                                            onChange={(e) => setBrushSize(parseFloat(e.target.value))}
                                            className="w-full h-1 bg-purple-900/30 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>

                                    <div className="flex items-center justify-center w-8 h-8 bg-white/5 rounded border border-purple-500/20 shrink-0">
                                        <div
                                            style={{
                                                width: `${Math.min(brushSize * 1.5, 24)}px`,
                                                height: `${Math.min(brushSize * 1.5, 24)}px`,
                                                borderRadius: brushType === 'pixel' ? '0' : '50%',
                                                backgroundColor: currentTool === 'brush' ? selectedColor : '#ff6b6b',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                transition: 'all 0.2s ease'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div
                            className="absolute"
                            style={{
                                bottom: '90px',
                                right: '16px',
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                backgroundColor: selectedColor,
                                border: '3px solid white',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                                zIndex: 1000,
                                cursor: 'pointer'
                            }}
                            onClick={() => setMobileMenuOpen(true)}
                        />
                    </div>
                </div>

                {/* BOTTOM TOOLBAR MOBILE - Scrollable horizontalement */}
                <div className="fixed bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm border-t border-purple-500/30 p-2 z-[999]">
                    {/* Indicateur de scroll à gauche */}
                    <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/50 to-transparent pointer-events-none z-10 flex items-center">
                        <span className="text-white/50 text-xs ml-1">◀</span>
                    </div>
                    {/* Indicateur de scroll à droite */}
                    <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/50 to-transparent pointer-events-none z-10 flex items-center justify-end">
                        <span className="text-white/50 text-xs mr-1">▶</span>
                    </div>
                    <div
                        ref={mobileToolbarRef}
                        className="flex items-center gap-2 overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch'
                        }}
                        onTouchStart={handleToolbarTouchStart}
                        onTouchMove={handleToolbarTouchMove}
                        onTouchEnd={handleToolbarTouchEnd}
                    >
                        <button
                            onClick={() => setCurrentTool('brush')}
                            className={`w-12 h-12 rounded-lg shadow-md transition-all bg-center bg-no-repeat bg-contain shrink-0 ${currentTool === 'brush'
                                ? 'bg-purple-600 scale-105'
                                : 'bg-purple-800/50'
                                }`}
                            style={{
                                backgroundImage:
                                    "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760823190/Pinceau_cwjaxh.png')"
                            }}
                            aria-label="Pinceau"
                        />

                        <button
                            onClick={() => setCurrentTool('eraser')}
                            className={`w-12 h-12 rounded-lg shadow-md transition-all bg-center bg-no-repeat bg-contain shrink-0 ${currentTool === 'eraser'
                                ? 'bg-purple-600 scale-105'
                                : 'bg-purple-800/50'
                                }`}
                            style={{
                                backgroundImage:
                                    "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760827288/pipette_kqqmzh.png')"
                            }}
                            aria-label="Gomme"
                        />
                        <button
                            onClick={() => setCurrentTool('pipette')}
                            className={`w-12 h-12 rounded-lg shadow-md transition-all bg-center bg-no-repeat bg-contain shrink-0 ${currentTool === 'pipette'
                                ? 'bg-purple-600 scale-105'
                                : 'bg-purple-800/50'
                                }`}
                            style={{
                                backgroundImage:
                                    "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760827432/pipettevrai_vxsysi.png')"
                            }}
                            aria-label="Pipette"
                        />
                        {/* 🎨 AUTO-PIPETTE TOGGLE MOBILE */}
                        <button
                            onClick={() => setAutoPipetteMode(!autoPipetteMode)}
                            className={`w-12 h-12 rounded-lg shadow-md transition-all flex items-center justify-center relative shrink-0 ${autoPipetteMode
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600 scale-105 ring-2 ring-green-400/50'
                                : 'bg-purple-800/50'
                            }`}
                            aria-label={autoPipetteMode ? "Auto-Pipette activé" : "Auto-Pipette désactivé"}
                        >
                            <span className="text-xl">🎯</span>
                            {autoPipetteMode && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                            )}
                        </button>
                        {/* 🦋 MULTI-CHIBI TOGGLE MOBILE - Clique sur chaque chibi pour l'activer */}
                        <div className="flex items-center gap-1 shrink-0">
                            {Object.values(CHIBI_PAINTERS).map((painter) => {
                                const isActive = isChibiActive(painter.id);
                                const chibiState = getChibiState(painter.id);
                                const canActivate = !isActive && getActiveChibiCount() < MAX_ACTIVE_CHIBIS;

                                return (
                                    <button
                                        key={painter.id}
                                        onClick={() => toggleChibi(painter.id)}
                                        className={`w-12 h-12 rounded-lg shadow-md transition-all flex items-center justify-center relative overflow-hidden shrink-0 ${
                                            isActive
                                                ? painter.id === 'tank'
                                                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 scale-105 ring-2 ring-green-400'
                                                    : 'bg-gradient-to-br from-purple-500 to-pink-600 scale-105 ring-2 ring-purple-400'
                                                : canActivate
                                                    ? 'bg-purple-800/50'
                                                    : 'bg-gray-700/30 opacity-50'
                                        }`}
                                        aria-label={isActive ? `Arrêter ${painter.name}` : `Activer ${painter.name}`}
                                    >
                                        <img
                                            src={isActive ? painter.sprites.back : painter.sprites.front}
                                            alt={painter.name}
                                            className="w-10 h-10 object-contain"
                                        />
                                        {isActive && (
                                            <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${
                                                painter.id === 'tank' ? 'bg-green-400' : 'bg-purple-400'
                                            }`}>
                                                {chibiState.timeRemaining}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => handleZoom(0.25)}
                            className="w-12 h-12 rounded-lg shadow-md transition-all bg-center bg-no-repeat bg-contain bg-purple-800/50 text-purple-200 shrink-0"
                            style={{
                                backgroundImage:
                                    "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760827803/zoomgrow_hzuucr.png')"
                            }}
                            aria-label="Zoom +"
                        />
                        <button
                            onClick={resetView}
                            className="w-12 h-12 rounded-lg shadow-md transition-all bg-purple-700/50 text-white text-xs font-bold shrink-0"
                            aria-label="Reset zoom"
                        >
                            ⊙
                        </button>
                        <button
                            onClick={() => handleZoom(-0.25)}
                            className="w-12 h-12 rounded-lg shadow-md transition-all bg-center bg-no-repeat bg-contain bg-purple-800/50 text-purple-200 shrink-0"
                            style={{
                                backgroundImage:
                                    "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760827864/zoomreduce_lmj2sp.png')"
                            }}
                            aria-label="Zoom -"
                        />
                    </div>
                </div>
            </div>
        );
    }

    // RENDER DESKTOP
    return (
        <div className="min-h-screen bg-[#0a0118]">
            {/* 🎮 CHEAT MODE NOTIFICATION */}
            {cheatModeActive && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[10000] animate-pulse">
                    <div className="bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 text-white px-8 py-4 rounded-full shadow-2xl border-4 border-white/50">
                        <div className="text-center">
                            <div className="text-2xl font-bold mb-1">🎮 CHEAT MODE ACTIVÉ ! 🎨</div>
                            <div className="text-sm opacity-90">Coloriage parfait automatique ⚡</div>
                            <div className="text-3xl font-bold mt-2">{cheatTimeRemaining}s</div>
                        </div>
                    </div>
                </div>
            )}

            {/* 🎨 AUTO-PIPETTE NOTIFICATION DESKTOP */}
            {autoPipetteMode && !cheatModeActive && !autoDrawBeruActive && (
                <div className="fixed top-4 right-4 z-[10000]">
                    <div className="bg-gradient-to-r from-green-500/95 to-emerald-600/95 text-white px-5 py-3 rounded-xl shadow-xl border border-green-400/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🎯</span>
                            <div>
                                <div className="font-bold text-sm">Auto-Pipette ACTIVÉ</div>
                                <div className="text-xs opacity-90">Colorie avec les couleurs du modèle</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 🦋 AUTO-DRAW NOTIFICATION DESKTOP */}
            {autoDrawBeruActive && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[10000]">
                    <div className={`text-white px-6 py-4 rounded-2xl shadow-2xl border-2 backdrop-blur-sm ${
                        selectedPainterId === 'tank'
                            ? 'bg-gradient-to-r from-green-500/95 via-emerald-500/95 to-green-600/95 border-green-300/50'
                            : 'bg-gradient-to-r from-purple-500/95 via-pink-500/95 to-purple-600/95 border-purple-300/50'
                    }`}>
                        <div className="flex items-center gap-4">
                            <img
                                src={currentPainter.sprites.front}
                                alt={currentPainter.name}
                                className="w-12 h-12 object-contain animate-bounce"
                            />
                            <div className="text-center">
                                <div className="text-lg font-bold">
                                    {selectedPainterId === 'tank' ? '🐻 Tank le Troll' : '🦋 AutoDrawBeru'} ACTIVÉ !
                                </div>
                                <div className="text-sm opacity-90">
                                    {selectedPainterId === 'tank'
                                        ? "Tank t'aide... à sa manière !"
                                        : `${currentPainter.name} t'aide à colorier...`}
                                </div>
                                <div className="text-2xl font-bold mt-1">{autoDrawBeruTimeRemaining}s</div>
                            </div>
                            <button
                                onClick={toggleAutoDrawBeru}
                                className="ml-2 px-3 py-1 bg-red-500/80 hover:bg-red-600 rounded-lg text-sm font-medium transition-colors"
                            >
                                Arrêter
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🦋 BERU PAPILLON ZONE SELECTION OVERLAY DESKTOP */}
            {zoneSelectionMode && (
                <div className="fixed inset-0 z-[10001] bg-black/70 flex">
                    {/* Panel gauche - Canvas avec zone draggable */}
                    <div
                        className="flex-1 relative overflow-hidden cursor-crosshair"
                        onMouseDown={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const canvas = canvasRef.current;
                            if (!canvas) return;
                            const displayWidth = rect.width;
                            const displayHeight = rect.height;
                            const canvasAspect = canvas.width / canvas.height;
                            const containerAspect = displayWidth / displayHeight;
                            let scale, offsetX, offsetY;
                            if (canvasAspect > containerAspect) {
                                scale = displayWidth / canvas.width;
                                offsetX = 0;
                                offsetY = (displayHeight - canvas.height * scale) / 2;
                            } else {
                                scale = displayHeight / canvas.height;
                                offsetX = (displayWidth - canvas.width * scale) / 2;
                                offsetY = 0;
                            }
                            const canvasX = (e.clientX - rect.left - offsetX) / scale;
                            const canvasY = (e.clientY - rect.top - offsetY) / scale;
                            setZonePosition({ x: Math.max(zoneSize.width/2, Math.min(canvas.width - zoneSize.width/2, canvasX)), y: Math.max(zoneSize.height/2, Math.min(canvas.height - zoneSize.height/2, canvasY)) });
                            setIsDraggingZone(true);
                        }}
                        onMouseMove={(e) => {
                            if (!isDraggingZone) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            const canvas = canvasRef.current;
                            if (!canvas) return;
                            const displayWidth = rect.width;
                            const displayHeight = rect.height;
                            const canvasAspect = canvas.width / canvas.height;
                            const containerAspect = displayWidth / displayHeight;
                            let scale, offsetX, offsetY;
                            if (canvasAspect > containerAspect) {
                                scale = displayWidth / canvas.width;
                                offsetX = 0;
                                offsetY = (displayHeight - canvas.height * scale) / 2;
                            } else {
                                scale = displayHeight / canvas.height;
                                offsetX = (displayWidth - canvas.width * scale) / 2;
                                offsetY = 0;
                            }
                            const canvasX = (e.clientX - rect.left - offsetX) / scale;
                            const canvasY = (e.clientY - rect.top - offsetY) / scale;
                            setZonePosition({ x: Math.max(zoneSize.width/2, Math.min(canvas.width - zoneSize.width/2, canvasX)), y: Math.max(zoneSize.height/2, Math.min(canvas.height - zoneSize.height/2, canvasY)) });
                        }}
                        onMouseUp={() => setIsDraggingZone(false)}
                        onMouseLeave={() => setIsDraggingZone(false)}
                    >
                        {/* Afficher le canvas en fond */}
                        {canvasRef.current && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <canvas
                                    ref={(el) => {
                                        if (el && canvasRef.current) {
                                            const ctx = el.getContext('2d');
                                            el.width = canvasRef.current.width;
                                            el.height = canvasRef.current.height;
                                            ctx.drawImage(canvasRef.current, 0, 0);
                                        }
                                    }}
                                    className="max-w-full max-h-full object-contain opacity-70"
                                    style={{ imageRendering: 'pixelated' }}
                                />
                                {/* Overlay de la zone */}
                                <svg
                                    className="absolute inset-0 pointer-events-none"
                                    style={{ width: '100%', height: '100%' }}
                                    viewBox={canvasRef.current ? `0 0 ${canvasRef.current.width} ${canvasRef.current.height}` : '0 0 100 100'}
                                    preserveAspectRatio="xMidYMid meet"
                                >
                                    <g transform={`translate(${zonePosition.x}, ${zonePosition.y}) rotate(${zoneRotation})`}>
                                        {selectedZoneShape === 'rectangle' && (
                                            <rect
                                                x={-zoneSize.width / 2}
                                                y={-zoneSize.height / 2}
                                                width={zoneSize.width}
                                                height={zoneSize.height}
                                                fill="rgba(147,51,234,0.25)"
                                                stroke="rgba(236,72,153,1)"
                                                strokeWidth="3"
                                                strokeDasharray="10,5"
                                            />
                                        )}
                                        {selectedZoneShape === 'square' && (
                                            <rect
                                                x={-Math.min(zoneSize.width, zoneSize.height) / 2}
                                                y={-Math.min(zoneSize.width, zoneSize.height) / 2}
                                                width={Math.min(zoneSize.width, zoneSize.height)}
                                                height={Math.min(zoneSize.width, zoneSize.height)}
                                                fill="rgba(147,51,234,0.25)"
                                                stroke="rgba(236,72,153,1)"
                                                strokeWidth="3"
                                                strokeDasharray="10,5"
                                            />
                                        )}
                                        {selectedZoneShape === 'circle' && (
                                            <ellipse
                                                cx="0"
                                                cy="0"
                                                rx={zoneSize.width / 2}
                                                ry={zoneSize.height / 2}
                                                fill="rgba(147,51,234,0.25)"
                                                stroke="rgba(236,72,153,1)"
                                                strokeWidth="3"
                                                strokeDasharray="10,5"
                                            />
                                        )}
                                        {selectedZoneShape === 'triangle' && (
                                            <polygon
                                                points={`0,${-zoneSize.height / 2} ${zoneSize.width / 2},${zoneSize.height / 2} ${-zoneSize.width / 2},${zoneSize.height / 2}`}
                                                fill="rgba(147,51,234,0.25)"
                                                stroke="rgba(236,72,153,1)"
                                                strokeWidth="3"
                                                strokeDasharray="10,5"
                                            />
                                        )}
                                        {selectedZoneShape === 'heart' && (
                                            <path
                                                d={`M 0 ${zoneSize.height * 0.35}
                                                    C ${-zoneSize.width * 0.5} ${-zoneSize.height * 0.2}, ${-zoneSize.width * 0.5} ${-zoneSize.height * 0.5}, 0 ${-zoneSize.height * 0.15}
                                                    C ${zoneSize.width * 0.5} ${-zoneSize.height * 0.5}, ${zoneSize.width * 0.5} ${-zoneSize.height * 0.2}, 0 ${zoneSize.height * 0.35}`}
                                                fill="rgba(147,51,234,0.25)"
                                                stroke="rgba(236,72,153,1)"
                                                strokeWidth="3"
                                                strokeDasharray="10,5"
                                            />
                                        )}
                                        {selectedZoneShape === 'star' && (
                                            <polygon
                                                points={(() => {
                                                    const points = [];
                                                    const outerR = zoneSize.width / 2;
                                                    const innerR = outerR * 0.4;
                                                    for (let i = 0; i < 10; i++) {
                                                        const r = i % 2 === 0 ? outerR : innerR;
                                                        const angle = (i * Math.PI / 5) - Math.PI / 2;
                                                        points.push(`${r * Math.cos(angle)},${r * Math.sin(angle)}`);
                                                    }
                                                    return points.join(' ');
                                                })()}
                                                fill="rgba(147,51,234,0.25)"
                                                stroke="rgba(236,72,153,1)"
                                                strokeWidth="3"
                                                strokeDasharray="10,5"
                                            />
                                        )}
                                        {selectedZoneShape === 'diamond' && (
                                            <polygon
                                                points={`0,${-zoneSize.height / 2} ${zoneSize.width / 2},0 0,${zoneSize.height / 2} ${-zoneSize.width / 2},0`}
                                                fill="rgba(147,51,234,0.25)"
                                                stroke="rgba(236,72,153,1)"
                                                strokeWidth="3"
                                                strokeDasharray="10,5"
                                            />
                                        )}
                                        {selectedZoneShape === 'hexagon' && (
                                            <polygon
                                                points={(() => {
                                                    const points = [];
                                                    for (let i = 0; i < 6; i++) {
                                                        const angle = (i * Math.PI / 3) - Math.PI / 2;
                                                        points.push(`${zoneSize.width / 2 * Math.cos(angle)},${zoneSize.height / 2 * Math.sin(angle)}`);
                                                    }
                                                    return points.join(' ');
                                                })()}
                                                fill="rgba(147,51,234,0.25)"
                                                stroke="rgba(236,72,153,1)"
                                                strokeWidth="3"
                                                strokeDasharray="10,5"
                                            />
                                        )}
                                        {selectedZoneShape === 'cloud' && (
                                            <g>
                                                <ellipse cx="0" cy="0" rx={zoneSize.width * 0.25} ry={zoneSize.height * 0.25} fill="rgba(147,51,234,0.25)" stroke="rgba(236,72,153,1)" strokeWidth="3" strokeDasharray="10,5" />
                                                <ellipse cx={-zoneSize.width * 0.25} cy="0" rx={zoneSize.width * 0.2} ry={zoneSize.height * 0.2} fill="rgba(147,51,234,0.25)" stroke="rgba(236,72,153,1)" strokeWidth="3" strokeDasharray="10,5" />
                                                <ellipse cx={zoneSize.width * 0.25} cy="0" rx={zoneSize.width * 0.2} ry={zoneSize.height * 0.2} fill="rgba(147,51,234,0.25)" stroke="rgba(236,72,153,1)" strokeWidth="3" strokeDasharray="10,5" />
                                                <ellipse cx="0" cy={-zoneSize.height * 0.15} rx={zoneSize.width * 0.18} ry={zoneSize.height * 0.18} fill="rgba(147,51,234,0.25)" stroke="rgba(236,72,153,1)" strokeWidth="3" strokeDasharray="10,5" />
                                            </g>
                                        )}
                                        {/* Point central */}
                                        <circle cx="0" cy="0" r="6" fill="rgba(236,72,153,1)" />
                                    </g>
                                </svg>
                            </div>
                        )}
                        {/* Instruction overlay */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-purple-200 text-sm">
                            👆 Cliquez et glissez pour placer la zone
                        </div>
                    </div>

                    {/* Panel droit - Contrôles */}
                    <div className="w-80 bg-[#1a0a2e]/95 backdrop-blur-sm border-l border-purple-500/30 p-6 flex flex-col">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <img
                                src={CHIBI_PAINTERS.beru_papillon.sprites.front}
                                alt="Beru Papillon"
                                className="w-12 h-12 object-contain"
                            />
                            <div>
                                <h2 className="text-lg font-bold text-purple-200">Zone de coloriage</h2>
                                <p className="text-xs text-purple-400">Placez où Béru-Papillon doit colorier</p>
                            </div>
                        </div>

                        {/* Stats du chibi */}
                        <div className="bg-purple-900/30 rounded-xl p-4 mb-6 border border-purple-500/20">
                            <div className="text-xs text-purple-400 mb-2">📊 Stats de Béru-Papillon</div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">⚡</span>
                                    <div>
                                        <div className="text-[10px] text-purple-400">Vitesse</div>
                                        <div className="text-sm font-bold text-purple-200">{CHIBI_PAINTERS.beru_papillon.stats.speed}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">💪</span>
                                    <div>
                                        <div className="text-[10px] text-purple-400">Endurance</div>
                                        <div className="text-sm font-bold text-purple-200">{CHIBI_PAINTERS.beru_papillon.stats.endurance}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-purple-500/20 text-center">
                                <div className="text-[10px] text-purple-400">Taille de zone calculée</div>
                                <div className="text-lg font-bold text-pink-400">📐 {zoneSize.width} × {zoneSize.height}px</div>
                            </div>
                        </div>

                        {/* Sélection de forme */}
                        <div className="mb-4">
                            <label className="block text-sm text-purple-300 mb-2">✨ Forme de la zone</label>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { id: 'rectangle', icon: '▬', label: 'Rect' },
                                    { id: 'circle', icon: '●', label: 'Cercle' },
                                    { id: 'heart', icon: '💖', label: 'Coeur' },
                                    { id: 'star', icon: '⭐', label: 'Étoile' },
                                    { id: 'diamond', icon: '💎', label: 'Losange' },
                                    { id: 'triangle', icon: '▲', label: 'Triangle' },
                                    { id: 'hexagon', icon: '⬡', label: 'Hexa' },
                                    { id: 'cloud', icon: '☁️', label: 'Nuage' }
                                ].map(shape => (
                                    <button
                                        key={shape.id}
                                        onClick={() => setSelectedZoneShape(shape.id)}
                                        className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                                            selectedZoneShape === shape.id
                                                ? 'bg-purple-600 border-pink-400 text-white scale-105'
                                                : 'bg-purple-900/30 border-purple-500/30 text-purple-300 hover:border-purple-400'
                                        }`}
                                    >
                                        <span className="text-xl">{shape.icon}</span>
                                        <span className="text-[9px]">{shape.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Rotation Control */}
                        <div className="mb-6">
                            <label className="block text-sm text-purple-300 mb-2">🔄 Rotation: {zoneRotation}°</label>
                            <input
                                type="range"
                                min="0"
                                max="360"
                                value={zoneRotation}
                                onChange={(e) => setZoneRotation(parseInt(e.target.value))}
                                className="w-full h-2 bg-purple-900/50 rounded-lg appearance-none cursor-pointer accent-pink-500 mb-2"
                            />
                            <div className="flex gap-1 flex-wrap">
                                {[0, 45, 90, 135, 180, 270].map(angle => (
                                    <button
                                        key={angle}
                                        onClick={() => setZoneRotation(angle)}
                                        className={`px-2 py-1 text-xs rounded transition-all ${
                                            zoneRotation === angle
                                                ? 'bg-pink-500 text-white'
                                                : 'bg-purple-800/30 text-purple-300 hover:bg-purple-700/50'
                                        }`}
                                    >
                                        {angle}°
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={cancelZoneSelection}
                                className="flex-1 py-3 px-4 rounded-xl bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 font-medium transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={startChibiWithZone}
                                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold transition-all shadow-lg shadow-purple-500/30"
                            >
                                🦋 C&apos;est parti !
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); }
                    50% { transform: translate(-50%, -50%) scale(1.3); }
                }

                @keyframes float {
                    0%, 100% { transform: translate(-50%, -50%) scaleY(-1) translateY(0); }
                    50% { transform: translate(-50%, -50%) scaleY(-1) translateY(-8px); }
                }

                ::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.2);
                }
                ::-webkit-scrollbar-thumb {
                    background: rgba(147, 51, 234, 0.5);
                    border-radius: 4px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: rgba(147, 51, 234, 0.7);
                }
            `}</style>

            <div className="bg-black/20 backdrop-blur-sm border-b border-purple-500/30">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3 py-3">
                            <img
                                src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760821994/DrasBeru_zd8ju5.png"
                                alt="DrawBeru logo"
                                className="w-8 h-8 select-none"
                            />
                            <h1 className="text-2xl font-bold">DrawBeru</h1>

                        </div>
                        <p className="text-purple-200">Colorie {currentModelData.name}</p>
                        <div className="flex items-center gap-3">
                            <select
                                value={selectedHunter}
                                onChange={(e) => handleHunterChange(e.target.value)}
                                className="bg-purple-800/50 text-white border border-purple-500/50 rounded-lg px-3 py-2"
                            >
                                {Object.entries(drawBeruModels).map(([hunterId, hunterData]) => (
                                    <option key={hunterId} value={hunterId}>
                                        {hunterData.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={selectedModel}
                                onChange={(e) => handleModelChange(e.target.value)}
                                className="bg-purple-800/50 text-white border border-purple-500/50 rounded-lg px-3 py-2"
                            >
                                {Object.entries(availableModels).map(([modelId, modelData]) => (
                                    <option key={modelId} value={modelId}>
                                        {modelData.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3 flex-wrap">
                            <button
                                onClick={undo}
                                disabled={!canUndo}
                                className={`px-4 py-2 rounded-lg transition-colors ${canUndo
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    }`}
                                title="Annuler (Ctrl+Z)"
                            >
                                ↶ Undo
                            </button>

                            <button
                                onClick={redo}
                                disabled={!canRedo}
                                className={`px-4 py-2 rounded-lg transition-colors ${canRedo
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    }`}
                                title="Refaire (Ctrl+Y)"
                            >
                                ↷ Redo
                            </button>

                            <button
                                onClick={() => setShowReference(!showReference)}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                {showReference ? 'Cacher' : 'Voir'} Modèle
                            </button>

                            <button
                                onClick={saveColoring}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                💾 Sauvegarder
                            </button>

                            <button
                                onClick={downloadColoredPNG}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                title="Télécharger l'image colorée complète"
                            >
                                🖼️ PNG Coloré
                            </button>

                            <button
                                onClick={downloadTransparentPNG}
                                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-colors"
                                title="Télécharger uniquement les couleurs (fond transparent)"
                            >
                                🎨 PNG Transparent
                            </button>

                            <button
                                onClick={exportColoring}
                                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
                                title="Exporter ce coloriage"
                            >
                                📤 Export
                            </button>

                            <button
                                onClick={importColoring}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                                title="Importer un coloriage"
                            >
                                📥 Import
                            </button>

                            <button
                                onClick={resetColoring}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                🗑️ Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* CENTER - CANVAS */}
                    <div className="lg:col-span-3">
                        <div className="bg-black/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4">
                            <h3 className="text-white font-semibold mb-4">
                                ✏️ Zone de coloriage - {currentModelData.name}
                            </h3>

                            {/* CONTROLS BAR - Style Mobile */}
                            <div className="mb-4 flex flex-wrap items-center gap-3 bg-black/40 backdrop-blur-sm rounded-xl p-3 border border-purple-500/20">
                                {/* Afficher/Masquer Calque */}
                                <button
                                    onClick={() => setShowModelOverlay(!showModelOverlay)}
                                    className="w-12 h-12 rounded-lg shadow-md transition-all active:scale-95 backdrop-blur-sm border"
                                    style={{
                                        backgroundImage: showModelOverlay
                                            ? "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754055045/sungicon_bfndrc.png')"
                                            : "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760826182/hide_te5av9.png')",
                                        backgroundSize: "100% 100%",
                                        backgroundPosition: "center",
                                        backgroundRepeat: "no-repeat",
                                        backgroundColor: showModelOverlay
                                            ? "rgba(147,51,234,0.4)"
                                            : "rgba(55,65,81,0.4)",
                                        borderColor: showModelOverlay
                                            ? "rgba(216,180,254,0.2)"
                                            : "rgba(156,163,175,0.2)"
                                    }}
                                    title={showModelOverlay ? "Masquer Calque" : "Afficher Calque"}
                                />

                                {/* Barre d'opacité */}
                                {showModelOverlay && (
                                    <div className="flex-1 bg-black/60 backdrop-blur-md rounded-lg p-2 shadow-lg border border-purple-500/30 min-w-[200px] max-w-[300px]">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-white text-xs font-semibold">Opacité Calque</span>
                                            <span className="text-purple-300 text-xs font-mono">{Math.round(modelOverlayOpacity * 100)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.05"
                                            value={modelOverlayOpacity}
                                            onChange={(e) => setModelOverlayOpacity(parseFloat(e.target.value))}
                                            className="w-full h-1.5 bg-purple-900/50 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                )}

                                {/* Separator */}
                                <div className="w-px h-10 bg-purple-500/30"></div>

                                {/* Undo/Redo */}
                                <button
                                    onClick={undo}
                                    disabled={!canUndo}
                                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl shadow-md transition-all active:scale-95 backdrop-blur-sm border ${canUndo
                                        ? 'bg-blue-600/40 hover:bg-blue-600/60 text-white border-blue-400/20'
                                        : 'bg-gray-600/30 text-gray-400 border-gray-500/15 cursor-not-allowed'
                                    }`}
                                    title="Annuler (Ctrl+Z)"
                                >
                                    ↶
                                </button>
                                <button
                                    onClick={redo}
                                    disabled={!canRedo}
                                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl shadow-md transition-all active:scale-95 backdrop-blur-sm border ${canRedo
                                        ? 'bg-blue-600/40 hover:bg-blue-600/60 text-white border-blue-400/20'
                                        : 'bg-gray-600/30 text-gray-400 border-gray-500/15 cursor-not-allowed'
                                    }`}
                                    title="Refaire (Ctrl+Y)"
                                >
                                    ↷
                                </button>

                                {/* Separator */}
                                <div className="w-px h-10 bg-purple-500/30"></div>

                                {/* Outils - Pinceau, Gomme, Pipette */}
                                <button
                                    onClick={() => setCurrentTool('brush')}
                                    className={`w-12 h-12 rounded-lg shadow-md transition-all active:scale-95 ${currentTool === 'brush'
                                        ? 'bg-purple-600 scale-105'
                                        : 'bg-purple-800/50'
                                    }`}
                                    style={{
                                        backgroundImage: "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760823190/Pinceau_cwjaxh.png')",
                                        backgroundSize: "contain",
                                        backgroundPosition: "center",
                                        backgroundRepeat: "no-repeat"
                                    }}
                                    title="Pinceau (B)"
                                />

                                <button
                                    onClick={() => setCurrentTool('eraser')}
                                    className={`w-12 h-12 rounded-lg shadow-md transition-all active:scale-95 ${currentTool === 'eraser'
                                        ? 'bg-purple-600 scale-105'
                                        : 'bg-purple-800/50'
                                    }`}
                                    style={{
                                        backgroundImage: "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760827288/pipette_kqqmzh.png')",
                                        backgroundSize: "contain",
                                        backgroundPosition: "center",
                                        backgroundRepeat: "no-repeat"
                                    }}
                                    title="Gomme (E)"
                                />

                                <button
                                    onClick={() => setCurrentTool('pipette')}
                                    className={`w-12 h-12 rounded-lg shadow-md transition-all active:scale-95 ${currentTool === 'pipette'
                                        ? 'bg-purple-600 scale-105'
                                        : 'bg-purple-800/50'
                                    }`}
                                    style={{
                                        backgroundImage: "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760827432/pipettevrai_vxsysi.png')",
                                        backgroundSize: "contain",
                                        backgroundPosition: "center",
                                        backgroundRepeat: "no-repeat"
                                    }}
                                    title="Pipette (I)"
                                />

                                {/* 🎨 FEATURE 1: Brush Type Selector */}
                                {currentTool === 'brush' && (
                                    <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1 border border-purple-500/20">
                                        {Object.entries(BRUSH_TYPES).map(([key, brush]) => (
                                            <button
                                                key={key}
                                                onClick={() => setBrushType(key)}
                                                className={`w-9 h-9 rounded-md flex items-center justify-center text-lg transition-all ${
                                                    brushType === key
                                                        ? 'bg-purple-600 scale-105 ring-2 ring-purple-400/50'
                                                        : 'bg-purple-800/30 hover:bg-purple-700/40'
                                                }`}
                                                title={`${brush.name} - ${brush.description}`}
                                            >
                                                {brush.icon}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* 🎨 AUTO-PIPETTE TOGGLE - avec anti-spam */}
                                <button
                                    onClick={() => {
                                        const now = Date.now();
                                        if (now - lastButtonClickRef.current.autoPipette < BUTTON_COOLDOWN_MS) return;
                                        lastButtonClickRef.current.autoPipette = now;
                                        setAutoPipetteMode(!autoPipetteMode);
                                    }}
                                    className={`w-12 h-12 rounded-lg shadow-md transition-all active:scale-95 flex items-center justify-center relative ${autoPipetteMode
                                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 scale-105 ring-2 ring-green-400/50'
                                        : 'bg-purple-800/50 hover:bg-purple-700/50'
                                    }`}
                                    title={autoPipetteMode ? "Auto-Pipette ACTIVÉ - Colorie avec les couleurs du modèle" : "Auto-Pipette - Cliquez pour activer"}
                                >
                                    <span className="text-xl">🎯</span>
                                    {autoPipetteMode && (
                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                                    )}
                                </button>

                                {/* 🦋 AUTO-DRAW BERU TOGGLE + CHIBI SELECTOR - avec espacement et anti-spam */}
                                <div className="flex items-center gap-1">
                                    {/* Bouton pour changer de Chibi - AVANT le bouton de lancement */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const now = Date.now();
                                            if (now - lastButtonClickRef.current.chibiSelect < BUTTON_COOLDOWN_MS) return;
                                            lastButtonClickRef.current.chibiSelect = now;
                                            if (!autoDrawBeruActive) {
                                                setSelectedPainterId(prev => prev === 'beru_papillon' ? 'tank' : 'beru_papillon');
                                            }
                                        }}
                                        disabled={autoDrawBeruActive}
                                        className={`w-8 h-12 rounded-l-lg shadow-md transition-all flex items-center justify-center ${
                                            autoDrawBeruActive
                                                ? 'bg-gray-600 cursor-not-allowed opacity-50'
                                                : selectedPainterId === 'tank'
                                                    ? 'bg-green-700/50 hover:bg-green-600/50'
                                                    : 'bg-purple-700/50 hover:bg-purple-600/50'
                                        }`}
                                        title={autoDrawBeruActive ? "Impossible de changer pendant l'animation" : `Chibi actuel: ${currentPainter.name} - Cliquer pour changer`}
                                    >
                                        <span className="text-xs">↔</span>
                                    </button>
                                    {/* Bouton pour lancer l'animation */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const now = Date.now();
                                            if (now - lastButtonClickRef.current.chibiToggle < BUTTON_COOLDOWN_MS) return;
                                            lastButtonClickRef.current.chibiToggle = now;
                                            toggleAutoDrawBeru();
                                        }}
                                        className={`w-12 h-12 rounded-r-lg shadow-md transition-all active:scale-95 flex items-center justify-center relative overflow-hidden ${autoDrawBeruActive
                                            ? selectedPainterId === 'tank'
                                                ? 'bg-gradient-to-br from-green-500 to-emerald-600 scale-105 ring-2 ring-green-400/50'
                                                : 'bg-gradient-to-br from-purple-500 to-pink-600 scale-105 ring-2 ring-purple-400/50'
                                            : 'bg-purple-800/50 hover:bg-purple-700/50'
                                        }`}
                                        title={autoDrawBeruActive
                                            ? `${currentPainter.name} ACTIVÉ - ${autoDrawBeruTimeRemaining}s restantes`
                                            : `▶ Lancer ${currentPainter.name} - ${currentPainter.duration}s d'aide`}
                                    >
                                        <img
                                            src={currentPainter.sprites.back}
                                            alt={currentPainter.name}
                                            className="w-10 h-10 object-contain"
                                            style={{ transform: selectedPainterId === 'tank' ? 'none' : 'scaleY(-1)' }}
                                        />
                                        {autoDrawBeruActive && (
                                            <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${
                                                selectedPainterId === 'tank' ? 'bg-green-400' : 'bg-purple-400'
                                            }`}>
                                                {autoDrawBeruTimeRemaining}
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {/* Separator */}
                                <div className="w-px h-10 bg-purple-500/30"></div>

                                {/* Zoom Controls */}
                                <button
                                    onClick={() => handleZoom(0.25)}
                                    className="w-12 h-12 rounded-lg shadow-md transition-all active:scale-95 bg-purple-800/50 hover:bg-purple-700/50"
                                    style={{
                                        backgroundImage: "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760827803/zoomgrow_hzuucr.png')",
                                        backgroundSize: "contain",
                                        backgroundPosition: "center",
                                        backgroundRepeat: "no-repeat"
                                    }}
                                    title="Zoom +"
                                />

                                <button
                                    onClick={resetView}
                                    className="w-12 h-12 rounded-lg shadow-md transition-all active:scale-95 bg-purple-700/50 hover:bg-purple-600/50 text-white text-xs font-bold flex items-center justify-center"
                                    title="Recadrer"
                                >
                                    ⊙
                                </button>

                                <button
                                    onClick={() => handleZoom(-0.25)}
                                    className="w-12 h-12 rounded-lg shadow-md transition-all active:scale-95 bg-purple-800/50 hover:bg-purple-700/50"
                                    style={{
                                        backgroundImage: "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760827864/zoomreduce_lmj2sp.png')",
                                        backgroundSize: "contain",
                                        backgroundPosition: "center",
                                        backgroundRepeat: "no-repeat"
                                    }}
                                    title="Zoom -"
                                />

                                {/* Separator */}
                                <div className="w-px h-10 bg-purple-500/30"></div>

                                {/* Couleur actuelle */}
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-12 h-12 rounded-lg border-2 border-white shadow-lg cursor-pointer"
                                        style={{ backgroundColor: selectedColor }}
                                        title={`Couleur actuelle: ${selectedColor}`}
                                    />
                                </div>

                                {/* Palette de couleurs */}
                                <div className="flex items-center gap-1.5">
                                    {Object.entries(currentModelData.palette).slice(0, 6).map(([id, color]) => (
                                        <button
                                            key={id}
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-8 h-8 rounded-lg border-2 transition-all ${selectedColor === color
                                                ? 'border-white scale-110'
                                                : 'border-purple-500/50 hover:border-purple-300/70'
                                            }`}
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        />
                                    ))}
                                    <input
                                        type="color"
                                        value={selectedColor}
                                        onChange={(e) => setSelectedColor(e.target.value)}
                                        className="w-8 h-8 rounded-lg border-2 border-purple-500/50 cursor-pointer"
                                        title="Choisir une couleur personnalisée"
                                    />
                                </div>

                                {/* 🔢 FEATURE 2: Taille du pinceau avec boutons +/- */}
                                {(currentTool === 'brush' || currentTool === 'eraser') && (
                                    <>
                                        <div className="w-px h-10 bg-purple-500/30"></div>
                                        <div className="flex-1 bg-black/60 backdrop-blur-md rounded-lg p-2 shadow-lg border border-purple-500/30 min-w-[280px] max-w-[350px]">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 rounded bg-purple-600/50 shrink-0"
                                                    style={{
                                                        backgroundImage: currentTool === 'brush'
                                                            ? "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760823190/Pinceau_cwjaxh.png')"
                                                            : "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760827288/pipette_kqqmzh.png')",
                                                        backgroundSize: "contain",
                                                        backgroundPosition: "center",
                                                        backgroundRepeat: "no-repeat"
                                                    }}
                                                />
                                                {/* 🔢 Boutons +/- avec valeur */}
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={decrementBrushSize}
                                                        onMouseDown={() => startBrushSizeRepeat(false)}
                                                        onMouseUp={stopBrushSizeRepeat}
                                                        onMouseLeave={stopBrushSizeRepeat}
                                                        className="w-7 h-7 rounded bg-purple-700/50 hover:bg-purple-600/50 text-white font-bold text-lg flex items-center justify-center transition-all active:scale-95"
                                                        title="Réduire taille (touche [)"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="text-purple-300 text-xs font-mono font-bold min-w-[45px] text-center">
                                                        {brushSize.toFixed(1)}px
                                                    </span>
                                                    <button
                                                        onClick={incrementBrushSize}
                                                        onMouseDown={() => startBrushSizeRepeat(true)}
                                                        onMouseUp={stopBrushSizeRepeat}
                                                        onMouseLeave={stopBrushSizeRepeat}
                                                        className="w-7 h-7 rounded bg-purple-700/50 hover:bg-purple-600/50 text-white font-bold text-lg flex items-center justify-center transition-all active:scale-95"
                                                        title="Augmenter taille (touche ])"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="range"
                                                        min="0.1"
                                                        max="50"
                                                        step="0.1"
                                                        value={brushSize}
                                                        onChange={(e) => setBrushSize(parseFloat(e.target.value))}
                                                        className="w-full h-1 bg-purple-900/30 rounded-lg appearance-none cursor-pointer"
                                                    />
                                                </div>
                                                <div className="w-8 h-8 bg-white/5 rounded border border-purple-500/20 shrink-0 flex items-center justify-center">
                                                    <div
                                                        style={{
                                                            width: `${Math.min(brushSize * 1.5, 24)}px`,
                                                            height: `${Math.min(brushSize * 1.5, 24)}px`,
                                                            borderRadius: brushType === 'pixel' ? '0' : '50%',
                                                            backgroundColor: currentTool === 'brush' ? selectedColor : '#ff6b6b',
                                                            border: '1px solid rgba(255,255,255,0.2)',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* ✨ PRECISION: Contrôle de stabilisation */}
                                {(currentTool === 'brush' || currentTool === 'eraser') && (
                                    <>
                                        <div className="w-px h-10 bg-purple-500/30"></div>
                                        <div className="bg-black/60 backdrop-blur-md rounded-lg p-2 shadow-lg border border-purple-500/30 min-w-[140px]">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg" title="Stabilisation du trait">🎯</span>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-white text-[10px] font-semibold">Stabilisation</span>
                                                        <span className="text-purple-300 text-[10px] font-mono">
                                                            {stabilization === 0 ? 'OFF' : stabilization}
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="10"
                                                        step="1"
                                                        value={stabilization}
                                                        onChange={(e) => setStabilization(parseInt(e.target.value))}
                                                        className="w-full h-1 bg-purple-900/30 rounded-lg appearance-none cursor-pointer"
                                                        title="0 = OFF, 10 = Maximum (trait très lissé)"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* 🖌️ BRUSH ENGINE PRO: Contrôles de pression et vitesse */}
                                {(currentTool === 'brush') && (
                                    <>
                                        <div className="w-px h-10 bg-purple-500/30"></div>
                                        <div className="bg-black/60 backdrop-blur-md rounded-lg p-2 shadow-lg border border-purple-500/30 min-w-[200px]">
                                            <div className="flex items-center gap-3">
                                                {/* Indicateur de pression en temps réel */}
                                                <div className="flex flex-col items-center">
                                                    <div
                                                        className="w-4 h-10 bg-purple-900/30 rounded-full overflow-hidden relative"
                                                        title={`Pression: ${Math.round(currentPressure * 100)}%`}
                                                    >
                                                        <div
                                                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-500 to-purple-300 transition-all duration-75"
                                                            style={{ height: `${currentPressure * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[8px] text-purple-300 mt-1">P</span>
                                                </div>

                                                <div className="flex-1 space-y-2">
                                                    {/* Toggle Pression */}
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setEnablePressure(!enablePressure)}
                                                            className={`w-6 h-6 rounded flex items-center justify-center text-xs transition-all ${
                                                                enablePressure
                                                                    ? 'bg-purple-600 text-white'
                                                                    : 'bg-purple-900/30 text-purple-400'
                                                            }`}
                                                            title={enablePressure ? "Pression activée" : "Pression désactivée"}
                                                        >
                                                            ✍️
                                                        </button>
                                                        <div className="flex-1">
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="1"
                                                                step="0.05"
                                                                value={pressureSensitivity}
                                                                onChange={(e) => setPressureSensitivity(parseFloat(e.target.value))}
                                                                disabled={!enablePressure}
                                                                className="w-full h-1 bg-purple-900/30 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                                                                title="Sensibilité à la pression"
                                                            />
                                                        </div>
                                                        <span className="text-[10px] text-purple-300 w-8">{Math.round(pressureSensitivity * 100)}%</span>
                                                    </div>

                                                    {/* Toggle Vitesse */}
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setEnableVelocity(!enableVelocity)}
                                                            className={`w-6 h-6 rounded flex items-center justify-center text-xs transition-all ${
                                                                enableVelocity
                                                                    ? 'bg-purple-600 text-white'
                                                                    : 'bg-purple-900/30 text-purple-400'
                                                            }`}
                                                            title={enableVelocity ? "Vitesse activée" : "Vitesse désactivée"}
                                                        >
                                                            💨
                                                        </button>
                                                        <div className="flex-1">
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="1"
                                                                step="0.05"
                                                                value={velocitySensitivity}
                                                                onChange={(e) => setVelocitySensitivity(parseFloat(e.target.value))}
                                                                disabled={!enableVelocity}
                                                                className="w-full h-1 bg-purple-900/30 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                                                                title="Sensibilité à la vitesse"
                                                            />
                                                        </div>
                                                        <span className="text-[10px] text-purple-300 w-8">{Math.round(velocitySensitivity * 100)}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* 🦋 BLOC CHIBIS DESSINATEURS - Multi-Chibi ! */}
                                <div className="w-px h-10 bg-purple-500/30"></div>
                                <div className="bg-black/60 backdrop-blur-md rounded-lg p-2 shadow-lg border border-purple-500/30 min-w-[220px]">
                                    <div className="text-[9px] text-purple-300 mb-1.5 font-semibold">
                                        🎨 Chibis Dessinateurs
                                        <span className="ml-2 text-[8px] text-purple-400">
                                            ({getActiveChibiCount()}/{MAX_ACTIVE_CHIBIS} actifs)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Sélecteur de Chibi - Clic pour activer/désactiver */}
                                        {Object.values(CHIBI_PAINTERS).map((painter) => {
                                            const isActive = isChibiActive(painter.id);
                                            const chibiState = getChibiState(painter.id);
                                            const canActivate = !isActive && getActiveChibiCount() < MAX_ACTIVE_CHIBIS;

                                            return (
                                                <button
                                                    key={painter.id}
                                                    onClick={() => toggleChibi(painter.id)}
                                                    className={`relative w-14 h-14 rounded-lg transition-all flex items-center justify-center overflow-hidden ${
                                                        isActive
                                                            ? painter.id === 'tank'
                                                                ? 'bg-gradient-to-br from-green-500 to-emerald-600 ring-2 ring-green-400 animate-pulse'
                                                                : 'bg-gradient-to-br from-purple-500 to-pink-600 ring-2 ring-purple-400 animate-pulse'
                                                            : canActivate
                                                                ? 'bg-purple-900/30 hover:bg-purple-800/40 hover:ring-2 hover:ring-purple-500/50'
                                                                : 'bg-gray-800/30 opacity-50'
                                                    }`}
                                                    title={isActive
                                                        ? `${painter.name} ACTIF - ${chibiState.timeRemaining}s - Cliquer pour arrêter`
                                                        : canActivate
                                                            ? `Activer ${painter.name}`
                                                            : `Max ${MAX_ACTIVE_CHIBIS} chibis actifs`
                                                    }
                                                >
                                                    <img
                                                        src={isActive ? painter.sprites.back : painter.sprites.front}
                                                        alt={painter.name}
                                                        className="w-12 h-12 object-contain"
                                                        style={{ filter: isActive ? 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' : 'none' }}
                                                    />
                                                    {/* Badge actif avec timer */}
                                                    {isActive && (
                                                        <span className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${
                                                            painter.id === 'tank' ? 'bg-green-500' : 'bg-purple-500'
                                                        }`}>
                                                            {chibiState.timeRemaining}
                                                        </span>
                                                    )}
                                                    {/* Nom du chibi */}
                                                    <span className={`absolute bottom-0 left-0 right-0 text-[7px] text-white bg-black/70 px-1 py-0.5 text-center ${
                                                        isActive ? 'font-bold' : ''
                                                    }`}>
                                                        {painter.id === 'tank' ? '🐻 Tank' : '🦋 Béru'}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="text-[8px] text-purple-400 mt-1.5">
                                        {selectedPainterId === 'tank'
                                            ? '🎭 Mode Troll : couleurs aléatoires !'
                                            : '🎯 Mode Précis : ligne par ligne'}
                                    </div>
                                </div>
                            </div>

                            {!imagesLoaded && (
                                <div className="bg-white rounded-lg p-8 text-center">
                                    <div className="text-gray-500">Chargement du modèle...</div>
                                </div>
                            )}

                            <div
                                className={`relative bg-white rounded-lg overflow-hidden ${!imagesLoaded ? 'hidden' : ''}`}
                                style={{
                                    minHeight: '400px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                                onWheel={handleWheel}
                                onMouseDown={startPan}
                                onMouseMove={handlePan}
                                onMouseUp={stopPan}
                                onMouseLeave={stopPan}
                                onContextMenu={(e) => e.preventDefault()}
                            >
                                <div
                                    className="relative inline-block"
                                    style={{
                                        transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                                        transformOrigin: 'center center',
                                        transition: isPanning ? 'none' : 'transform 0.1s ease-out'
                                    }}
                                >
                                    <canvas
                                        ref={canvasRef}
                                        style={{
                                            display: 'block',
                                            border: '1px solid #ccc',
                                            cursor: isPanning
                                                ? 'move'
                                                : currentTool === 'pipette'
                                                    ? 'crosshair'
                                                    : generateDynamicCursor(brushSize, selectedColor, currentTool, brushType),
                                            touchAction: 'none' // Important pour PointerEvents
                                        }}
                                        // 🖌️ BRUSH ENGINE PRO: PointerEvents pour support tablette graphique
                                        onPointerDown={startDrawing}
                                        onPointerMove={(e) => {
                                            draw(e);
                                            // ✨ PRECISION: Update cursor position for preview
                                            const rect = canvasRef.current?.getBoundingClientRect();
                                            if (rect) {
                                                setCursorPosition({
                                                    x: e.clientX - rect.left,
                                                    y: e.clientY - rect.top,
                                                    visible: true
                                                });
                                            }
                                        }}
                                        onPointerUp={stopDrawing}
                                        onPointerLeave={() => {
                                            stopDrawing();
                                            setCursorPosition(prev => ({ ...prev, visible: false }));
                                        }}
                                        onPointerCancel={stopDrawing}
                                    />

                                    {/* Overlay canvas for model reference with opacity */}
                                    {showModelOverlay && (
                                        <canvas
                                            ref={overlayCanvasRef}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                pointerEvents: 'none',
                                                opacity: modelOverlayOpacity
                                            }}
                                        />
                                    )}

                                    {/* 🦋 MULTI-CHIBI HELPERS DESKTOP - Affiche tous les chibis actifs */}
                                    {canvasRef.current && Object.entries(activeChibis).map(([chibiId, chibiState]) => {
                                        if (!chibiState.active) return null;
                                        const painter = CHIBI_PAINTERS[chibiId];
                                        if (!painter) return null;

                                        return (
                                            <img
                                                key={chibiId}
                                                src={chibiState.facingFront ? painter.sprites.front : painter.sprites.back}
                                                alt={painter.name}
                                                className="pointer-events-none"
                                                style={{
                                                    position: 'absolute',
                                                    left: `${(chibiState.position.x / canvasRef.current.width) * 100}%`,
                                                    top: `${(chibiState.position.y / canvasRef.current.height) * 100}%`,
                                                    width: '48px',
                                                    height: '48px',
                                                    transform: chibiState.facingFront
                                                        ? 'translate(-50%, -50%)'
                                                        : `translate(-50%, -50%) scaleX(${chibiState.direction || 1})`,
                                                    zIndex: 100 + (chibiId === 'tank' ? 1 : 0),
                                                    filter: chibiState.facingFront
                                                        ? painter.id === 'tank'
                                                            ? 'drop-shadow(0 0 15px rgba(74, 222, 128, 0.9))'
                                                            : 'drop-shadow(0 0 15px rgba(236, 72, 153, 0.9))'
                                                        : painter.id === 'tank'
                                                            ? 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.9))'
                                                            : 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.9))',
                                                    animation: chibiState.facingFront ? 'none' : 'float 1s ease-in-out infinite',
                                                    transition: 'filter 0.3s ease, transform 0.2s ease'
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 🦋 CHIBI BUBBLES DESKTOP - Une bulle par chibi actif */}
                            {Object.entries(activeChibis).map(([chibiId, chibiState]) => {
                                if (!chibiState.active || !chibiState.message) return null;
                                const painter = CHIBI_PAINTERS[chibiId];
                                if (!painter) return null;

                                return (
                                    <ChibiBubble
                                        key={`bubble-${chibiId}`}
                                        message={chibiState.message}
                                        position={{
                                            x: canvasRef.current
                                                ? canvasRef.current.getBoundingClientRect().left + (chibiState.position.x / canvasRef.current.width) * canvasRef.current.getBoundingClientRect().width
                                                : window.innerWidth / 2,
                                            y: canvasRef.current
                                                ? canvasRef.current.getBoundingClientRect().top + (chibiState.position.y / canvasRef.current.height) * canvasRef.current.getBoundingClientRect().height - 100
                                                : 200
                                        }}
                                        entityType={painter.entityType}
                                        isMobile={false}
                                    />
                                );
                            })}

                            <div className="text-white text-xs mt-2 space-y-1">
                                <div>Canvas status: {imagesLoaded ? '✅ Loaded' : '⏳ Loading...'}</div>
                                {imagesLoaded && (
                                    <>
                                        <div>Template: {canvasRef.current?.width}x{canvasRef.current?.height}px</div>
                                        <div>Zoom: {Math.round(zoomLevel * 100)}% | Pan: {Math.round(panOffset.x)},{Math.round(panOffset.y)}</div>
                                        <div>Tool: {currentTool} | Color: {selectedColor} | Brush: {brushSize}px</div>
                                        <div>Layer actif: {layers.find(l => l.id === activeLayer)?.name}</div>
                                        <div>Historique: {historyIndex + 1}/{history.length}</div>
                                        <div>🎯 Progression: {coloringProgress}%</div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL - REFERENCE */}
                    <div className="lg:col-span-1">
                        <div
                            className="bg-black/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4"
                            style={{ display: showReference ? 'block' : 'none' }}
                        >
                            <h3 className="text-white font-semibold mb-4">
                                👁️ Modèle {currentModelData.name}
                            </h3>

                                <div className="mb-3">
                                    <label className="text-purple-200 text-sm mb-2 block">
                                        Zoom: {Math.round(refZoomLevel * 100)}%
                                    </label>
                                    <div className="grid grid-cols-3 gap-2 mb-2">
                                        <button
                                            onClick={() => handleRefZoom(-0.25)}
                                            className="bg-purple-700/50 text-white py-2 px-3 rounded text-lg font-bold"
                                        >
                                            −
                                        </button>
                                        <button
                                            onClick={resetRefView}
                                            className="bg-purple-700/50 text-white py-2 px-3 rounded text-sm"
                                        >
                                            Reset
                                        </button>
                                        <button
                                            onClick={() => handleRefZoom(0.25)}
                                            className="bg-purple-700/50 text-white py-2 px-3 rounded text-lg font-bold"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="mb-2">
                                        <div className="text-purple-300 text-xs mb-1">Déplacement modèle:</div>
                                        <div className="grid grid-cols-3 gap-1 max-w-[120px] mx-auto">
                                            <div></div>
                                            <button
                                                onClick={() => setRefPanOffset(prev => ({ ...prev, y: prev.y + 30 }))}
                                                className="bg-purple-700/50 text-white py-2 rounded"
                                            >
                                                ↑
                                            </button>
                                            <div></div>
                                            <button
                                                onClick={() => setRefPanOffset(prev => ({ ...prev, x: prev.x + 30 }))}
                                                className="bg-purple-700/50 text-white py-2 rounded"
                                            >
                                                ←
                                            </button>
                                            <button
                                                onClick={resetRefView}
                                                className="bg-purple-700/50 text-white py-2 rounded text-xs"
                                            >
                                                ⊙
                                            </button>
                                            <button
                                                onClick={() => setRefPanOffset(prev => ({ ...prev, x: prev.x - 30 }))}
                                                className="bg-purple-700/50 text-white py-2 rounded"
                                            >
                                                →
                                            </button>
                                            <div></div>
                                            <button
                                                onClick={() => setRefPanOffset(prev => ({ ...prev, y: prev.y - 30 }))}
                                                className="bg-purple-700/50 text-white py-2 rounded"
                                            >
                                                ↓
                                            </button>
                                            <div></div>
                                        </div>
                                    </div>

                                    <div className="text-purple-300 text-xs mb-2">
                                        Clic sur l'image avec la pipette 💧 pour récupérer une couleur
                                    </div>
                                </div>

                                <div
                                    className="bg-white rounded-lg overflow-hidden flex justify-center items-center relative"
                                    style={{ minHeight: '300px' }}
                                    onWheel={handleRefWheel}
                                    onMouseDown={startRefPan}
                                    onMouseMove={handleRefPan}
                                    onMouseUp={stopRefPan}
                                    onMouseLeave={stopRefPan}
                                    onContextMenu={(e) => e.preventDefault()}
                                >
                                    <div
                                        className="relative inline-block"
                                        style={{
                                            transform: `scale(${refZoomLevel}) translate(${refPanOffset.x / refZoomLevel}px, ${refPanOffset.y / refZoomLevel}px)`,
                                            transformOrigin: 'center center',
                                            transition: isRefPanning ? 'none' : 'transform 0.1s ease-out'
                                        }}
                                    >
                                        <canvas
                                            ref={referenceCanvasRef}
                                            onClick={(e) => {
                                                if (currentTool === 'pipette') {
                                                    pickColorFromReference(e);
                                                }
                                            }}
                                            style={{
                                                display: 'block',
                                                maxWidth: '100%',
                                                height: 'auto',
                                                cursor: currentTool === 'pipette' ? 'crosshair' : (isRefPanning ? 'move' : 'default')
                                            }}
                                        />

                                        {debugPoint && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    left: `${debugPoint.cssX}px`,
                                                    top: `${debugPoint.cssY}px`,
                                                    width: 20, height: 20, borderRadius: '50%',
                                                    backgroundColor: 'rgba(255,0,0,0.7)', border: '3px solid #fff',
                                                    transform: 'translate(-50%, -50%)',
                                                    pointerEvents: 'none', zIndex: 1000,
                                                    boxShadow: '0 0 20px rgba(255,0,0,1), inset 0 0 10px rgba(255,255,255,0.5)',
                                                    animation: 'pulse 0.5s ease-in-out infinite',
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>

                                <p className="text-purple-200 text-sm mt-2">
                                    Utilise ce modèle comme référence pour tes couleurs
                                </p>

                                <div className="mt-3 flex gap-2">
                                    <button
                                        onClick={() => setShowReference(false)}
                                        className="text-xs bg-purple-700/50 text-white py-1 px-2 rounded"
                                    >
                                        Masquer
                                    </button>
                                </div>
                            </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DrawBeruFixed;