import React, { useEffect, useRef, useState, useMemo } from 'react';
import { dytextAnimate, DYTEXT_CURSOR_STYLE } from "../useDytext";

// 🎭 Configuration des entités (centralisé)
const ENTITY_CONFIG = {
    tank: {
        icon: 'https://api.builderberu.com/cdn/images/tank_face_n9kxrh.webp',
        name: 'Tank',
        color: '#4CAF50',
        personality: 'tank',
    },
    beru: {
        icon: 'https://api.builderberu.com/cdn/images/beru_face_w2rdyn.webp',
        name: 'Béru',
        color: '#8A2BE2',
        personality: 'beru',
    },
    beru_papillon: {
        icon: 'https://api.builderberu.com/cdn/images/alecto_face_irsy6q.webp',
        name: 'Béru-Papillon',
        color: '#9932CC',
        personality: 'beru_papillon',
    },
    kaisel: {
        icon: 'https://api.builderberu.com/cdn/images/Kaisel_face_dm9394.webp',
        name: 'Kaisel',
        color: '#00FF41',
        personality: 'kaisel',
    },
    igris: {
        icon: 'https://api.builderberu.com/cdn/images/igris_face_xj5mqo.webp',
        name: 'Igris',
        color: '#980808',
        personality: 'igris',
    },
    cerbere: {
        icon: 'https://api.builderberu.com/cdn/images/cerbere_icon_dtwfhu.webp',
        name: 'Cerbère',
        color: '#e334ba',
        personality: 'default',
    },
    igrisk: {
        icon: 'https://api.builderberu.com/cdn/images/igrisk_icon_vytfic.webp',
        name: 'Igris(?)',
        color: '#FF6B6B',
        personality: 'igrisk',
        special: 'glitch',
    },
    berserker: {
        icon: 'https://api.builderberu.com/cdn/images/berserk_up_rqjt0n.webp',
        name: 'Berserker',
        color: '#8b00ff',
        personality: 'berserker',
        special: 'berserker',
    },
};

const ChibiBubble = ({ message, position, entityType = 'tank', isMobile, onClose, onComplete, duration }) => {
    const bubbleRef = useRef(null);
    const textRef = useRef(null);
    const cleanupRef = useRef(null);
    const fadeTimersRef = useRef({ warning: null, fadeout: null, hide: null });

    // 🎬 États pour les animations
    // Phases: 'entering' | 'visible' | 'fading-warning' | 'fading-out' | 'exiting' | 'hidden'
    const [phase, setPhase] = useState('entering');
    const [isAnimating, setIsAnimating] = useState(false);

    // 📱 Détection mobile
    const isMobileDevice = useMemo(() =>
        isMobile?.isPhone || isMobile?.isTablet || (typeof window !== 'undefined' && window.innerWidth < 768),
        [isMobile]
    );

    // 🎭 Config de l'entité
    const config = ENTITY_CONFIG[entityType] || ENTITY_CONFIG.tank;
    const isSpecial = config.special === 'glitch' || config.special === 'berserker';

    // 🧹 Nettoyer tous les timers de fade
    const clearFadeTimers = () => {
        Object.values(fadeTimersRef.current).forEach(timer => {
            if (timer) clearTimeout(timer);
        });
        fadeTimersRef.current = { warning: null, fadeout: null, hide: null };
    };

    // 🎬 Gestion du cycle de vie de la bulle avec fadeout progressif
    useEffect(() => {
        if (message) {
            clearFadeTimers();
            setPhase('entering');

            // Transition vers visible après l'animation d'entrée
            const enterTimer = setTimeout(() => setPhase('visible'), 50);

            // 📏 Calculer les timings du fadeout basés sur la durée
            // Si pas de durée fournie, estimer basé sur la longueur du message
            // ⚡ Animation rapide (20ms/char) + lecture longue (120ms/char) + marge (2500ms)
            // Min: 5s, Max: 15s pour laisser le temps de lire
            const messageLength = message?.length || 20;
            const animationTime = messageLength * 20;  // Animation rapide
            const readingTime = messageLength * 120;   // Plus de temps pour lire
            const estimatedDuration = animationTime + readingTime + 2500;
            const totalDuration = duration || Math.min(15000, Math.max(5000, estimatedDuration));

            // Timeline:
            // - Phase visible: 0 → (totalDuration - 2000ms)
            // - Phase warning (légère transparence): (totalDuration - 2000ms) → (totalDuration - 800ms)
            // - Phase fadeout (disparition progressive): (totalDuration - 800ms) → totalDuration

            const warningStart = Math.max(1000, totalDuration - 2000); // Commence 2s avant la fin
            const fadeoutStart = Math.max(1500, totalDuration - 800);  // Commence 800ms avant la fin

            fadeTimersRef.current.warning = setTimeout(() => {
                setPhase('fading-warning');
            }, warningStart);

            fadeTimersRef.current.fadeout = setTimeout(() => {
                setPhase('fading-out');
            }, fadeoutStart);

            return () => {
                clearTimeout(enterTimer);
                clearFadeTimers();
            };
        } else {
            // Message retiré par le parent → sortie immédiate mais douce
            setPhase('exiting');
            const exitTimer = setTimeout(() => setPhase('hidden'), 500);
            return () => clearTimeout(exitTimer);
        }
    }, [message, duration]);

    // 🎯 Animation du texte avec personnalité
    useEffect(() => {
        if (phase === 'visible' && message && textRef.current && !isAnimating) {
            setIsAnimating(true);

            // Nettoyer l'animation précédente
            if (cleanupRef.current) {
                cleanupRef.current();
            }

            // Petit délai pour laisser le DOM se stabiliser
            const startTimer = setTimeout(() => {
                if (textRef.current) {
                    cleanupRef.current = dytextAnimate(textRef, message, null, {
                        personality: config.personality,
                        showCursor: !isMobileDevice, // Pas de curseur sur mobile
                        onComplete: () => {
                            setIsAnimating(false);
                            if (onComplete) onComplete();
                        }
                    });
                }
            }, 50);

            return () => {
                clearTimeout(startTimer);
                if (cleanupRef.current) {
                    cleanupRef.current();
                }
            };
        }
    }, [phase, message, config.personality, isMobileDevice, onComplete]);

    // 🧹 Cleanup au démontage
    useEffect(() => {
        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
            }
        };
    }, []);

    // 👆 Click pour fermer (mobile)
    const handleClick = () => {
        if (isMobileDevice && onClose) {
            setPhase('exiting');
            setTimeout(() => {
                onClose();
            }, 300);
        }
    };

    // Ne pas rendre si caché
    if (phase === 'hidden' || !message) return null;

    // 🎨 Styles dynamiques
    const bubbleOpacity = isMobileDevice ? 0.85 : 0.95;

    const baseStyle = {
        backgroundColor: config.special === 'berserker'
            ? `rgba(25, 0, 40, ${bubbleOpacity})`
            : config.special === 'glitch'
            ? `rgba(40, 20, 20, ${bubbleOpacity})`
            : `rgba(20, 20, 40, ${bubbleOpacity})`,
        backdropFilter: 'blur(8px)',
        border: `2px solid ${config.color}80`,
        borderRadius: '16px',
        boxShadow: `0 8px 32px ${config.color}40`,
    };

    // 🎬 Style d'animation pour entrée/sortie avec fadeout progressif
    // NOTE: translateX(-50%) est maintenant dans le style de base pour éviter le saut initial
    const getOpacityForPhase = () => {
        switch (phase) {
            case 'entering': return 0;
            case 'visible': return 1;
            case 'fading-warning': return 0.75; // Légère baisse pour signaler
            case 'fading-out': return 0.3;      // Disparition progressive
            case 'exiting': return 0;
            case 'hidden': return 0;
            default: return 1;
        }
    };

    const getTransformForPhase = () => {
        switch (phase) {
            case 'entering':
                return 'translateX(-50%) translateY(-10px) scale(0.95)';
            case 'fading-out':
            case 'exiting':
                return 'translateX(-50%) translateY(5px) scale(0.98)';
            default:
                return 'translateX(-50%) translateY(0) scale(1)';
        }
    };

    const getTransitionForPhase = () => {
        switch (phase) {
            case 'entering':
                return 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            case 'fading-warning':
                return 'opacity 0.8s ease-out, transform 0.8s ease-out';
            case 'fading-out':
                return 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out';
            case 'exiting':
                return 'opacity 0.5s ease-in, transform 0.5s ease-in';
            default:
                return 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        }
    };

    const animationStyle = {
        opacity: getOpacityForPhase(),
        transform: getTransformForPhase(),
        transition: getTransitionForPhase(),
    };

    return (
        <>
            {/* 🎨 Styles CSS pour le curseur et animations */}
            <style>{DYTEXT_CURSOR_STYLE}</style>
            <style>{`
                @keyframes chibi-bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
                @keyframes chibi-glow {
                    0%, 100% { box-shadow: 0 8px 32px ${config.color}40; }
                    50% { box-shadow: 0 8px 40px ${config.color}60; }
                }
                ${config.special === 'glitch' ? `
                    @keyframes glitch-effect {
                        0%, 90%, 100% { filter: none; transform: none; }
                        92% { filter: hue-rotate(90deg); transform: skewX(2deg); }
                        94% { filter: hue-rotate(-90deg); transform: skewX(-2deg); }
                    }
                ` : ''}
                ${config.special === 'berserker' ? `
                    @keyframes berserker-pulse {
                        0%, 100% { box-shadow: 0 8px 32px rgba(139,0,255,0.5); }
                        50% { box-shadow: 0 8px 48px rgba(255,0,255,0.7); }
                    }
                ` : ''}
            `}</style>

            {/* 📍 Container positionné - MÊME TECHNIQUE mobile/desktop: left 50% + translateX(-50%) */}
            <div
                onClick={handleClick}
                style={{
                    position: 'fixed',
                    // 🎯 Centrage IDENTIQUE mobile/desktop: left: 50% + translateX(-50%)
                    top: isMobileDevice ? '12px' : '80px',
                    left: '50%',
                    transform: isMobileDevice
                        ? `translateX(-50%) translateY(${phase === 'entering' ? '-10px' : phase === 'fading-out' || phase === 'exiting' ? '5px' : '0'}) scale(${phase === 'entering' ? '0.95' : phase === 'fading-out' || phase === 'exiting' ? '0.98' : '1'})`
                        : animationStyle.transform,
                    zIndex: config.special === 'berserker' ? 10503 : 10100,
                    // 📏 Taille plus compacte sur mobile
                    width: isMobileDevice ? '85vw' : 'auto',
                    maxWidth: isMobileDevice ? '320px' : '380px',
                    minWidth: isMobileDevice ? '200px' : '280px',
                    opacity: animationStyle.opacity,
                    transition: animationStyle.transition,
                    cursor: isMobileDevice ? 'pointer' : 'default',
                }}
            >
                <div
                    ref={bubbleRef}
                    style={{
                        ...baseStyle,
                        padding: isMobileDevice ? '8px 12px' : '12px 16px',
                        animation: phase === 'visible'
                            ? config.special === 'glitch'
                                ? 'chibi-bounce 3s ease-in-out infinite, glitch-effect 8s infinite'
                                : config.special === 'berserker'
                                ? 'chibi-bounce 3s ease-in-out infinite, berserker-pulse 2s infinite'
                                : 'chibi-bounce 3s ease-in-out infinite, chibi-glow 4s ease-in-out infinite'
                            : 'none',
                    }}
                >
                    {/* 🎭 Header : Icône + Nom */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobileDevice ? '8px' : '10px',
                        marginBottom: isMobileDevice ? '6px' : '10px',
                        paddingBottom: isMobileDevice ? '6px' : '8px',
                        borderBottom: `1px solid ${config.color}40`,
                    }}>
                        <img loading="lazy"
                            src={config.icon}
                            alt={config.name}
                            style={{
                                width: isMobileDevice ? '28px' : '36px',
                                height: isMobileDevice ? '28px' : '36px',
                                borderRadius: '50%',
                                border: `2px solid ${config.color}`,
                                boxShadow: `0 0 12px ${config.color}50`,
                                filter: config.special === 'glitch'
                                    ? 'hue-rotate(270deg) saturate(1.5)'
                                    : config.special === 'berserker'
                                    ? 'drop-shadow(0 0 5px rgba(139,0,255,0.8))'
                                    : 'none',
                            }}
                        />
                        <span style={{
                            color: config.color,
                            fontSize: isMobileDevice ? '11px' : '13px',
                            fontWeight: 'bold',
                            fontFamily: 'monospace',
                            textShadow: `0 0 10px ${config.color}50`,
                        }}>
                            {config.name}
                            {config.special === 'glitch' && (
                                <span style={{ marginLeft: '5px', fontSize: '10px' }}>⚠️</span>
                            )}
                            {config.special === 'berserker' && (
                                <span style={{ marginLeft: '5px', fontSize: '10px' }}>💀</span>
                            )}
                        </span>
                    </div>

                    {/* 📝 Zone de texte */}
                    <div
                        ref={textRef}
                        style={{
                            color: config.special === 'berserker' ? '#ff6666' : '#ffffff',
                            fontFamily: 'monospace',
                            fontSize: isMobileDevice ? '11px' : '12px',
                            lineHeight: isMobileDevice ? '1.4' : '1.6',
                            minHeight: isMobileDevice ? '18px' : '24px',
                            maxHeight: isMobileDevice ? '60px' : '100px',
                            overflowY: 'auto',
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word',
                            textShadow: config.special === 'berserker'
                                ? '0 0 10px rgba(255,0,0,0.6)'
                                : config.special === 'glitch'
                                ? '1px 1px 3px rgba(255,0,0,0.4)'
                                : '1px 1px 2px rgba(0,0,0,0.6)',
                            padding: isMobileDevice ? '2px 0' : '4px 0',
                        }}
                    />

                    {/* 📱 Indicateur "tap to close" sur mobile - plus discret */}
                    {isMobileDevice && (
                        <div style={{
                            textAlign: 'center',
                            marginTop: '4px',
                            paddingTop: '4px',
                            borderTop: `1px solid ${config.color}15`,
                            fontSize: '8px',
                            color: `${config.color}60`,
                            fontFamily: 'monospace',
                        }}>
                            tap to close
                        </div>
                    )}
                </div>

                {/* 🔺 Flèche */}
                <div style={{
                    position: 'absolute',
                    ...(isMobileDevice ? {
                        bottom: '-10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        borderLeft: '10px solid transparent',
                        borderRight: '10px solid transparent',
                        borderTop: `10px solid ${baseStyle.backgroundColor}`,
                    } : {
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        borderLeft: '10px solid transparent',
                        borderRight: '10px solid transparent',
                        borderTop: `10px solid ${baseStyle.backgroundColor}`,
                    }),
                    width: 0,
                    height: 0,
                }} />
            </div>
        </>
    );
};

export default ChibiBubble;
