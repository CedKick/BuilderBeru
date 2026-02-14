import React, { useState, useRef, useEffect, useCallback } from 'react';

// 🎮 COLORING GAME - Speedrun Coloriage avec Béru-Papillon
// Objectif: Colorier 97%+ en moins de 3 minutes

// Configuration du jeu
const GAME_CONFIG = {
    // Physique
    gravity: 0.8,
    jumpForce: -15,
    moveSpeed: 6,
    maxFallSpeed: 18,

    // Personnage
    playerSize: 48,

    // Coloriage
    spraySize: 60,          // Taille du spray 60x60px
    sprayRange: 120,        // Range max pour colorier depuis le joueur

    // Plateformes (dessin libre)
    platformRange: 200,     // Range pour dessiner plateformes
    platformBrushSize: 12,  // Taille du pinceau plateforme
    eraserBrushSize: 24,    // Taille de la gomme
    maxInk: 100,            // Encre max pour plateformes
    inkPerDraw: 0.5,        // Coût en encre par frame de dessin
    inkRegenRate: 2,        // Encre régénérée par seconde

    // Timer
    gameDuration: 180,      // 3 minutes en secondes
    winThreshold: 97,       // 97% pour gagner
};

// Sprites Béru-Papillon
const BERU_SPRITES = {
    idle: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1749843915/BeruPapillon_w1tpea.png',
    left: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1749843915/BeruPapillon_w1tpea.png',
    right: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1749843915/BeruPapillon_w1tpea.png',
};

const ColoringGame = ({
    canvasWidth = 800,
    canvasHeight = 600,
    referenceImageData,  // ImageData de l'image de référence pour les couleurs
    onProgress,          // Callback pour la progression
    onGameEnd,           // Callback fin de partie
}) => {
    // === ÉTATS DU JEU ===
    const [gameState, setGameState] = useState('ready'); // ready, playing, won, lost
    const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.gameDuration);
    const [progress, setProgress] = useState(0);
    const [ink, setInk] = useState(GAME_CONFIG.maxInk);
    const [mode, setMode] = useState('color'); // 'color', 'platform' ou 'eraser'

    // === ÉTAT DU JOUEUR ===
    const [player, setPlayer] = useState({
        x: canvasWidth / 2,
        y: canvasHeight - 100,
        vx: 0,
        vy: 0,
        onGround: false,
        facingRight: true,
    });

    // === REFS ===
    const gameCanvasRef = useRef(null);       // Canvas du jeu (personnage, UI)
    const colorCanvasRef = useRef(null);      // Canvas de coloriage
    const platformCanvasRef = useRef(null);   // Canvas des plateformes (dessin libre)
    const keysRef = useRef({});               // Touches pressées
    const mouseRef = useRef({ x: 0, y: 0, pressed: false });
    const gameLoopRef = useRef(null);
    const timerRef = useRef(null);
    const inkRegenRef = useRef(null);         // Ref pour régénération encre
    const lastDrawPosRef = useRef(null);      // Dernière position de dessin

    // Refs pour la game loop (évite les problèmes de closure)
    const playerRef = useRef(player);
    const modeRef = useRef(mode);
    const inkRef = useRef(ink);

    // Sync refs avec state
    useEffect(() => { playerRef.current = player; }, [player]);
    useEffect(() => { modeRef.current = mode; }, [mode]);
    useEffect(() => { inkRef.current = ink; }, [ink]);

    // === GESTION DES TOUCHES ===
    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key.toLowerCase();
            keysRef.current[key] = true;

            // Touche C pour changer de mode (cycle: color -> platform -> eraser -> color)
            if (key === 'c' && gameState === 'playing') {
                setMode(prev => {
                    if (prev === 'color') return 'platform';
                    if (prev === 'platform') return 'eraser';
                    return 'color';
                });
            }

            // Touche E pour aller directement en mode gomme
            if (key === 'e' && gameState === 'playing') {
                setMode('eraser');
            }

            // Space ou Z pour démarrer
            if ((key === ' ' || key === 'z') && gameState === 'ready') {
                startGame();
            }
        };

        const handleKeyUp = (e) => {
            keysRef.current[e.key.toLowerCase()] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameState]);

    // === GESTION DE LA SOURIS ===
    useEffect(() => {
        const canvas = gameCanvasRef.current;
        if (!canvas) return;

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current.x = e.clientX - rect.left;
            mouseRef.current.y = e.clientY - rect.top;
        };

        const handleMouseDown = (e) => {
            if (e.button === 0) {
                mouseRef.current.pressed = true;
                lastDrawPosRef.current = { x: mouseRef.current.x, y: mouseRef.current.y };
            }
        };

        const handleMouseUp = () => {
            mouseRef.current.pressed = false;
            lastDrawPosRef.current = null;
        };

        const handleContextMenu = (e) => {
            e.preventDefault();
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('contextmenu', handleContextMenu);

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    // === DÉMARRER LE JEU ===
    const startGame = useCallback(() => {
        setGameState('playing');
        setTimeLeft(GAME_CONFIG.gameDuration);
        setProgress(0);
        setInk(GAME_CONFIG.maxInk);
        setMode('color');
        setPlayer({
            x: canvasWidth / 2,
            y: canvasHeight - 100,
            vx: 0,
            vy: 0,
            onGround: false,
            facingRight: true,
        });

        // Clear color canvas
        const colorCtx = colorCanvasRef.current?.getContext('2d');
        if (colorCtx) {
            colorCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        }

        // Clear et init platform canvas (avec sol de base)
        const platformCtx = platformCanvasRef.current?.getContext('2d');
        if (platformCtx) {
            platformCtx.clearRect(0, 0, canvasWidth, canvasHeight);
            // Dessiner le sol de base
            platformCtx.fillStyle = '#8b5cf6';
            platformCtx.fillRect(0, canvasHeight - 20, canvasWidth, 20);
        }
    }, [canvasWidth, canvasHeight]);

    // === TIMER ===
    useEffect(() => {
        if (gameState !== 'playing') return;

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameState(progress >= GAME_CONFIG.winThreshold ? 'won' : 'lost');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [gameState, progress]);

    // === RÉGÉNÉRATION AUTOMATIQUE DE L'ENCRE ===
    useEffect(() => {
        if (gameState !== 'playing') return;

        inkRegenRef.current = setInterval(() => {
            setInk(prev => Math.min(GAME_CONFIG.maxInk, prev + GAME_CONFIG.inkRegenRate));
        }, 1000);

        return () => clearInterval(inkRegenRef.current);
    }, [gameState]);

    // Refs pour les fonctions de la game loop (évite les dépendances)
    const paintSprayRef = useRef(null);
    const drawPlatformRef = useRef(null);
    const erasePlatformRef = useRef(null);
    const renderRef = useRef(null);

    // === PHYSIQUE & GAME LOOP ===
    useEffect(() => {
        if (gameState !== 'playing') return;

        let animationId;
        let lastTime = performance.now();

        const gameLoop = (currentTime) => {
            const deltaTime = (currentTime - lastTime) / 16.67; // Normaliser à ~60fps
            lastTime = currentTime;

            // Lire l'état actuel depuis la ref
            let { x, y, vx, vy, onGround, facingRight } = playerRef.current;

            // Input horizontal
            if (keysRef.current['q'] || keysRef.current['a']) {
                vx = -GAME_CONFIG.moveSpeed;
                facingRight = false;
            } else if (keysRef.current['d']) {
                vx = GAME_CONFIG.moveSpeed;
                facingRight = true;
            } else {
                vx = 0;
            }

            // Saut (Z, W ou Space)
            if ((keysRef.current['z'] || keysRef.current['w'] || keysRef.current[' ']) && onGround) {
                vy = GAME_CONFIG.jumpForce;
                onGround = false;
            }

            // Gravité
            vy += GAME_CONFIG.gravity * deltaTime;
            if (vy > GAME_CONFIG.maxFallSpeed) vy = GAME_CONFIG.maxFallSpeed;

            // Déplacement horizontal
            x += vx * deltaTime;

            // Limites horizontales
            if (x < GAME_CONFIG.playerSize / 2) x = GAME_CONFIG.playerSize / 2;
            if (x > canvasWidth - GAME_CONFIG.playerSize / 2) x = canvasWidth - GAME_CONFIG.playerSize / 2;

            // Déplacement vertical
            y += vy * deltaTime;

            // Collision avec plateformes (pixel-based)
            onGround = false;
            const playerBottom = y + GAME_CONFIG.playerSize / 2;
            const checkPoints = [-12, 0, 12]; // Points sous le joueur pour vérifier

            // Vérifier collision avec le canvas des plateformes
            const platformCtx = platformCanvasRef.current?.getContext('2d');
            if (platformCtx && vy >= 0) {
                for (const offsetX of checkPoints) {
                    const px = Math.floor(x + offsetX);
                    const py = Math.floor(playerBottom);
                    if (px >= 0 && px < canvasWidth && py >= 0 && py < canvasHeight) {
                        try {
                            const pixel = platformCtx.getImageData(px, py, 1, 1).data;
                            if (pixel[3] > 0) {
                                // Remonter jusqu'à ne plus être en collision
                                let testY = y;
                                while (testY > 0) {
                                    const testPixel = platformCtx.getImageData(px, Math.floor(testY + GAME_CONFIG.playerSize / 2 - 1), 1, 1).data;
                                    if (testPixel[3] === 0) break;
                                    testY -= 1;
                                }
                                y = testY;
                                vy = 0;
                                onGround = true;
                                break;
                            }
                        } catch (e) {
                            // Ignorer les erreurs de getImageData
                        }
                    }
                }
            }

            // Limite basse (fallback)
            if (y > canvasHeight - GAME_CONFIG.playerSize / 2) {
                y = canvasHeight - GAME_CONFIG.playerSize / 2;
                vy = 0;
                onGround = true;
            }

            // Mettre à jour le state du player
            const newPlayer = { x, y, vx, vy, onGround, facingRight };
            playerRef.current = newPlayer;
            setPlayer(newPlayer);

            // Actions selon le mode et si clic maintenu
            if (mouseRef.current.pressed) {
                const currentMode = modeRef.current;
                if (currentMode === 'color') {
                    paintSprayRef.current?.();
                } else if (currentMode === 'platform') {
                    drawPlatformRef.current?.();
                } else if (currentMode === 'eraser') {
                    erasePlatformRef.current?.();
                }
            }

            // Rendu
            renderRef.current?.();

            animationId = requestAnimationFrame(gameLoop);
        };

        animationId = requestAnimationFrame(gameLoop);

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [gameState, canvasWidth, canvasHeight]);

    // === COLORIAGE SPRAY ===
    const paintSpray = useCallback(() => {
        const colorCtx = colorCanvasRef.current?.getContext('2d');
        if (!colorCtx) return;

        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const currentPlayer = playerRef.current;

        // Vérifier la distance depuis le joueur
        const dx = mx - currentPlayer.x;
        const dy = my - currentPlayer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > GAME_CONFIG.sprayRange) return;

        // Si on a l'image de référence, on copie les couleurs depuis la référence
        if (referenceImageData) {
            const refData = referenceImageData.data;
            const sprayRadius = GAME_CONFIG.spraySize / 2;

            // Peindre chaque pixel du spray avec la couleur de référence
            for (let offsetY = -sprayRadius; offsetY <= sprayRadius; offsetY++) {
                for (let offsetX = -sprayRadius; offsetX <= sprayRadius; offsetX++) {
                    // Vérifier si dans le cercle
                    if (offsetX * offsetX + offsetY * offsetY > sprayRadius * sprayRadius) continue;

                    const px = Math.floor(mx + offsetX);
                    const py = Math.floor(my + offsetY);

                    // Vérifier les limites
                    if (px < 0 || px >= canvasWidth || py < 0 || py >= canvasHeight) continue;

                    // Obtenir la couleur de référence
                    const idx = (py * canvasWidth + px) * 4;
                    const r = refData[idx];
                    const g = refData[idx + 1];
                    const b = refData[idx + 2];
                    const a = refData[idx + 3];

                    if (a > 0) {
                        colorCtx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.9)`;
                        colorCtx.fillRect(px, py, 1, 1);
                    }
                }
            }
        } else {
            // Fallback: spray rose
            colorCtx.fillStyle = 'rgba(236, 72, 153, 0.8)';
            colorCtx.beginPath();
            colorCtx.arc(mx, my, GAME_CONFIG.spraySize / 2, 0, Math.PI * 2);
            colorCtx.fill();
        }

        // Calculer progression (throttled)
        if (Math.random() < 0.1) calculateProgress(); // 10% du temps seulement
    }, [referenceImageData, canvasWidth, canvasHeight]);

    // === DESSINER PLATEFORME (dessin libre) ===
    const drawPlatform = useCallback(() => {
        const platformCtx = platformCanvasRef.current?.getContext('2d');
        if (!platformCtx) return;
        if (inkRef.current < GAME_CONFIG.inkPerDraw) return;

        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const currentPlayer = playerRef.current;

        // Vérifier la distance depuis le joueur
        const dx = mx - currentPlayer.x;
        const dy = my - currentPlayer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > GAME_CONFIG.platformRange) return;

        // Dessiner un trait depuis la dernière position
        platformCtx.strokeStyle = '#8b5cf6';
        platformCtx.fillStyle = '#8b5cf6';
        platformCtx.lineWidth = GAME_CONFIG.platformBrushSize;
        platformCtx.lineCap = 'round';
        platformCtx.lineJoin = 'round';

        if (lastDrawPosRef.current) {
            // Dessiner un trait
            platformCtx.beginPath();
            platformCtx.moveTo(lastDrawPosRef.current.x, lastDrawPosRef.current.y);
            platformCtx.lineTo(mx, my);
            platformCtx.stroke();
        } else {
            // Premier point - dessiner un cercle
            platformCtx.beginPath();
            platformCtx.arc(mx, my, GAME_CONFIG.platformBrushSize / 2, 0, Math.PI * 2);
            platformCtx.fill();
        }

        lastDrawPosRef.current = { x: mx, y: my };
        setInk(prev => Math.max(0, prev - GAME_CONFIG.inkPerDraw));
    }, []);

    // === GOMME PLATEFORME ===
    const erasePlatform = useCallback(() => {
        const platformCtx = platformCanvasRef.current?.getContext('2d');
        if (!platformCtx) return;

        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const currentPlayer = playerRef.current;

        // Vérifier la distance depuis le joueur
        const dx = mx - currentPlayer.x;
        const dy = my - currentPlayer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > GAME_CONFIG.platformRange) return;

        // Ne pas effacer le sol de base (en bas du canvas)
        if (my > canvasHeight - 25) return;

        // Effacer en cercle
        platformCtx.save();
        platformCtx.globalCompositeOperation = 'destination-out';
        platformCtx.beginPath();
        platformCtx.arc(mx, my, GAME_CONFIG.eraserBrushSize / 2, 0, Math.PI * 2);
        platformCtx.fill();
        platformCtx.restore();

        lastDrawPosRef.current = { x: mx, y: my };
    }, [canvasHeight]);

    // Sync refs pour les fonctions utilisées dans la game loop
    useEffect(() => { paintSprayRef.current = paintSpray; }, [paintSpray]);
    useEffect(() => { drawPlatformRef.current = drawPlatform; }, [drawPlatform]);
    useEffect(() => { erasePlatformRef.current = erasePlatform; }, [erasePlatform]);

    // === CALCUL PROGRESSION ===
    const calculateProgress = useCallback(() => {
        const colorCtx = colorCanvasRef.current?.getContext('2d');
        if (!colorCtx) return;

        const imageData = colorCtx.getImageData(0, 0, canvasWidth, canvasHeight);
        const data = imageData.data;
        let coloredPixels = 0;
        let totalPixels = 0;

        for (let i = 3; i < data.length; i += 4) {
            totalPixels++;
            if (data[i] > 0) coloredPixels++;
        }

        const newProgress = Math.round((coloredPixels / totalPixels) * 100);
        setProgress(newProgress);

        // Victoire ?
        if (newProgress >= GAME_CONFIG.winThreshold && gameState === 'playing') {
            setGameState('won');
        }
    }, [canvasWidth, canvasHeight, gameState]);

    // === RENDU ===
    const render = useCallback(() => {
        const ctx = gameCanvasRef.current?.getContext('2d');
        if (!ctx) return;

        const currentPlayer = playerRef.current;
        const currentMode = modeRef.current;

        // Clear
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Range indicator (couleur selon le mode)
        let rangeColor, cursorSize;
        if (currentMode === 'color') {
            rangeColor = 'rgba(236, 72, 153, 0.3)';
            cursorSize = GAME_CONFIG.spraySize;
        } else if (currentMode === 'platform') {
            rangeColor = 'rgba(139, 92, 246, 0.3)';
            cursorSize = GAME_CONFIG.platformBrushSize;
        } else {
            rangeColor = 'rgba(239, 68, 68, 0.3)'; // Rouge pour gomme
            cursorSize = GAME_CONFIG.eraserBrushSize;
        }

        ctx.strokeStyle = rangeColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(
            currentPlayer.x,
            currentPlayer.y,
            currentMode === 'color' ? GAME_CONFIG.sprayRange : GAME_CONFIG.platformRange,
            0,
            Math.PI * 2
        );
        ctx.stroke();
        ctx.setLineDash([]);

        // Joueur (Béru-Papillon)
        ctx.save();
        ctx.translate(currentPlayer.x, currentPlayer.y);
        if (!currentPlayer.facingRight) {
            ctx.scale(-1, 1);
        }

        // Pour l'instant un cercle rose, on ajoutera le sprite après
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(0, 0, GAME_CONFIG.playerSize / 2, 0, Math.PI * 2);
        ctx.fill();

        // Yeux
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-8, -5, 8, 0, Math.PI * 2);
        ctx.arc(8, -5, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-6, -5, 4, 0, Math.PI * 2);
        ctx.arc(10, -5, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Curseur selon le mode
        if (currentMode === 'color') {
            ctx.strokeStyle = 'rgba(236, 72, 153, 0.8)';
        } else if (currentMode === 'platform') {
            ctx.strokeStyle = 'rgba(139, 92, 246, 0.8)';
        } else {
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)'; // Rouge pour gomme
        }
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, cursorSize / 2, 0, Math.PI * 2);
        ctx.stroke();

        // Indicateur de mode gomme
        if (currentMode === 'eraser') {
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(mouseRef.current.x - 8, mouseRef.current.y - 8);
            ctx.lineTo(mouseRef.current.x + 8, mouseRef.current.y + 8);
            ctx.moveTo(mouseRef.current.x + 8, mouseRef.current.y - 8);
            ctx.lineTo(mouseRef.current.x - 8, mouseRef.current.y + 8);
            ctx.stroke();
        }
    }, [canvasWidth, canvasHeight]);

    // Sync ref pour render
    useEffect(() => { renderRef.current = render; }, [render]);

    // === RENDER UI ===
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="relative w-full h-full bg-gray-900 rounded-xl overflow-hidden">
            {/* Canvas de coloriage (en dessous) */}
            <canvas
                ref={colorCanvasRef}
                width={canvasWidth}
                height={canvasHeight}
                className="absolute inset-0"
                style={{ zIndex: 1 }}
            />

            {/* Canvas des plateformes (dessin libre) */}
            <canvas
                ref={platformCanvasRef}
                width={canvasWidth}
                height={canvasHeight}
                className="absolute inset-0"
                style={{ zIndex: 2 }}
            />

            {/* Canvas du jeu (personnage, UI) */}
            <canvas
                ref={gameCanvasRef}
                width={canvasWidth}
                height={canvasHeight}
                className="absolute inset-0 cursor-crosshair"
                style={{ zIndex: 3 }}
            />

            {/* HUD */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                {/* Timer */}
                <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-purple-500/30">
                    <div className="text-white text-2xl font-mono font-bold">
                        ⏱️ {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Progression */}
                <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-pink-500/30">
                    <div className="text-pink-400 text-2xl font-mono font-bold">
                        🎨 {progress}%
                    </div>
                    <div className="w-32 h-2 bg-gray-700 rounded-full mt-1">
                        <div
                            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Mode & Encre */}
                <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-violet-500/30">
                    <div className={`text-sm font-bold ${
                        mode === 'color' ? 'text-pink-400' :
                        mode === 'platform' ? 'text-violet-400' : 'text-red-400'
                    }`}>
                        Mode: {mode === 'color' ? '🖌️ Colorier' : mode === 'platform' ? '✏️ Plateforme' : '🧹 Gomme'}
                    </div>
                    <div className="text-violet-300 text-xs flex items-center gap-2 mt-1">
                        <span>Encre: {Math.round(ink)}/{GAME_CONFIG.maxInk}</span>
                        <div className="w-16 h-2 bg-gray-700 rounded-full">
                            <div
                                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all"
                                style={{ width: `${(ink / GAME_CONFIG.maxInk) * 100}%` }}
                            />
                        </div>
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                        [C] cycle | [E] gomme
                    </div>
                </div>
            </div>

            {/* Contrôles */}
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-500/30 z-10">
                <div className="text-gray-300 text-xs space-y-1">
                    <div>🎮 <span className="text-white">ZQSD</span> - Déplacer</div>
                    <div>⬆️ <span className="text-white">ESPACE/W</span> - Sauter</div>
                    <div>🖱️ <span className="text-white">CLIC</span> - {
                        mode === 'color' ? 'Colorier' :
                        mode === 'platform' ? 'Dessiner plateforme' : 'Effacer plateforme'
                    }</div>
                    <div>🔄 <span className="text-white">C</span> - Changer mode</div>
                    <div>🧹 <span className="text-white">E</span> - Mode gomme</div>
                </div>
            </div>

            {/* Écran de démarrage */}
            {gameState === 'ready' && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-pink-400 mb-4">
                            🦋 Béru Coloring Rush
                        </h1>
                        <p className="text-gray-300 mb-2">
                            Colorie au moins <span className="text-pink-400 font-bold">97%</span> en moins de <span className="text-purple-400 font-bold">3 minutes</span>!
                        </p>
                        <p className="text-gray-400 text-sm mb-8">
                            Utilise ZQSD pour te déplacer et clique pour colorier!
                        </p>
                        <button
                            onClick={startGame}
                            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xl font-bold rounded-xl hover:scale-105 transition-transform"
                        >
                            🎮 JOUER (ESPACE)
                        </button>
                    </div>
                </div>
            )}

            {/* Écran de victoire */}
            {gameState === 'won' && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold text-green-400 mb-4">
                            🎉 VICTOIRE!
                        </h1>
                        <p className="text-gray-300 text-xl mb-2">
                            Tu as colorié <span className="text-pink-400 font-bold">{progress}%</span>!
                        </p>
                        <p className="text-gray-400 mb-8">
                            Temps restant: {formatTime(timeLeft)}
                        </p>
                        <button
                            onClick={startGame}
                            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-bold rounded-xl hover:scale-105 transition-transform"
                        >
                            🔄 REJOUER
                        </button>
                    </div>
                </div>
            )}

            {/* Écran de défaite */}
            {gameState === 'lost' && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold text-red-400 mb-4">
                            ⏰ TEMPS ÉCOULÉ!
                        </h1>
                        <p className="text-gray-300 text-xl mb-2">
                            Tu as colorié <span className="text-pink-400 font-bold">{progress}%</span>
                        </p>
                        <p className="text-gray-400 mb-8">
                            Il fallait {GAME_CONFIG.winThreshold}% minimum!
                        </p>
                        <button
                            onClick={startGame}
                            className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-600 text-white text-xl font-bold rounded-xl hover:scale-105 transition-transform"
                        >
                            🔄 RÉESSAYER
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColoringGame;
