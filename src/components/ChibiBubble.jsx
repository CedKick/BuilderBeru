import React, { useEffect, useRef, useState } from 'react';
import { dytextAnimate } from "../useDytext";

const ChibiBubble = ({ message, position, entityType = 'tank', isMobile, onClose, onComplete }) => {
    const bubbleRef = useRef();
    const [isVisible, setIsVisible] = useState(true);
    const [isClosing, setIsClosing] = useState(false);
    const [adjustedPosition, setAdjustedPosition] = useState(position);

    const animationStartedRef = useRef(false);
    const currentMessageRef = useRef('');

    // 🎭 ICÔNES DES ENTITÉS (AVEC IGRISK !)
    const entityIcons = {
        tank: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604465/tank_face_n9kxrh.png',
        beru: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414699/beru_face_w2rdyn.png',
        kaisel: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750768929/Kaisel_face_dm9394.png',
        igris: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754570362/igris_face_xj5mqo.png',
        cerbere: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754731189/cerbere_icon_dtwfhu.png',
        // 🎭 IGRISK : Tank avec un masque/filtre violet
        igrisk: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754731036/igrisk_icon_vytfic.png'
    };

    // 🏷️ NOMS DES ENTITÉS
    const entityNames = {
        tank: 'Tank',
        beru: 'Béru',
        kaisel: 'Kaisel',
        igris: 'Igris',
        cerbere: 'Cerbère',
        igrisk: 'Igris(?)'  // 🎭 Nom suspect !
    };

    // 🎨 COULEURS DES ENTITÉS
    const entityColors = {
        tank: '#4CAF50',
        beru: '#8A2BE2',
        kaisel: '#00FF41',
        igris: '#980808ff',
        cerbere: '#e334baff',
        cerbère: '#e334baff',
        igrisk: '#FF6B6B'  // 🎭 Rouge suspect !
    };

    // 🔍 DÉTECTION MOBILE
    const isMobileDevice = isMobile?.isPhone || isMobile?.isTablet || window.innerWidth < 768;

    // 👆 FONCTION CLICK-TO-DISMISS - MOBILE SEULEMENT
    const handleBubbleClick = () => {
        if (isMobileDevice) {
            setIsClosing(true);
            setTimeout(() => {
                setIsVisible(false);
            }, 300);
        }
    };

    // 🔥 GESTION DE LA FERMETURE INTELLIGENTE
    useEffect(() => {
        if (!isVisible && onClose) {
            const wasManualClose = isClosing;
            if (wasManualClose) {
                onClose();
            }
        }
    }, [isVisible, onClose, isClosing]);

    // 📍 AJUSTEMENT DE LA POSITION
    useEffect(() => {
        if (isMobileDevice) {
            setAdjustedPosition({
                x: window.innerWidth / 2,
                y: 80,
                currentCanvasId: position?.currentCanvasId
            });
        } else {
            const safePosition = {
                x: Math.max(150, Math.min(window.innerWidth - 250, position?.x || window.innerWidth / 2)),
                y: Math.max(100, Math.min(window.innerHeight - 150, position?.y - 50)),
                currentCanvasId: position?.currentCanvasId
            };
            setAdjustedPosition(safePosition);
        }
    }, [position, isMobileDevice]);

    // 🎯 UN SEUL useEffect pour l'animation du texte
    useEffect(() => {
        // Vérifier si le message a changé
        if (message !== currentMessageRef.current) {
            animationStartedRef.current = false;
            currentMessageRef.current = message;
            
            // Nettoyer le contenu précédent
            if (bubbleRef.current) {
                bubbleRef.current.innerHTML = '';
            }
        }

        // Éviter les multiples appels de dytextAnimate
        if (bubbleRef.current && message && !animationStartedRef.current) {
            animationStartedRef.current = true;
            
            // 🔧 S'assurer que le ref est bien attaché et visible
            const timer = setTimeout(() => {
                if (bubbleRef.current && bubbleRef.current.offsetParent !== null) {
                    // Vérifier que l'élément est dans le DOM et visible
                    console.log(`🎯 Animation démarrée pour: ${entityNames[entityType]}`);
                    
                    dytextAnimate(bubbleRef, message, 35, {
                        onComplete: () => {
                            if (onComplete) {
                                onComplete();
                            }
                        }
                    });
                } else {
                    // Si l'élément n'est pas visible, réessayer
                    console.warn(`⚠️ Bubble ref pas prêt, retry...`);
                    animationStartedRef.current = false;
                }
            }, 300); // Délai augmenté pour laisser le DOM se stabiliser
            
            return () => clearTimeout(timer);
        }
    }, [message, onComplete, entityType]);

    // 🧹 Cleanup au démontage
    useEffect(() => {
        return () => {
            animationStartedRef.current = false;
            currentMessageRef.current = '';
            if (bubbleRef.current) {
                bubbleRef.current.innerHTML = '';
            }
        };
    }, []);

    if (!message || !isVisible) return null;

    // 🎭 Styles spéciaux pour Igrisk
    const isIgrisk = entityType === 'igrisk';
    const bubbleStyle = isIgrisk ? {
        backgroundColor: 'rgba(40, 20, 20, 0.95)', // Plus rouge/sombre
        backdropFilter: 'blur(4px) hue-rotate(-15deg)', // Effet glitch
        border: `2px solid ${entityColors[entityType]}60`,
        animation: 'igriskGlitch 5s infinite' // Animation glitch
    } : {
        backgroundColor: 'rgba(20, 20, 40, 0.95)',
        backdropFilter: 'blur(4px)',
        border: `2px solid ${entityColors[entityType]}60`
    };

    return (
        <>
            {/* 🎭 Style d'animation pour Igrisk */}
            {isIgrisk && (
                <style>{`
                    @keyframes igriskGlitch {
                        0%, 90%, 100% { 
                            filter: hue-rotate(0deg) brightness(1);
                            transform: translateX(-50%) scale(1);
                        }
                        91% { 
                            filter: hue-rotate(180deg) brightness(1.2);
                            transform: translateX(-50%) scale(1.02) skewX(2deg);
                        }
                        93% { 
                            filter: hue-rotate(-90deg) brightness(0.8);
                            transform: translateX(-50%) scale(0.98) skewX(-2deg);
                        }
                    }
                `}</style>
            )}
            
            {isMobileDevice ? (
                // 📱 VERSION MOBILE
                <div
                    style={{
                        position: 'fixed',
                        top: adjustedPosition.y,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 9999,
                        width: '90vw',
                        maxWidth: '350px'
                    }}
                >
                    <div
                        onClick={handleBubbleClick}
                        style={{
                            ...bubbleStyle,
                            borderRadius: '16px',
                            padding: '12px',
                            boxShadow: isIgrisk 
                                ? '0 8px 32px rgba(255,0,0,0.3)' 
                                : '0 8px 32px rgba(0,0,0,0.4)',
                            animation: isIgrisk 
                                ? 'bounceGentle 2s ease-in-out infinite, igriskGlitch 5s infinite' 
                                : 'bounceGentle 2s ease-in-out infinite',
                            cursor: 'pointer'
                        }}
                    >
                        {/* Header avec Icône et Nom */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '8px',
                            paddingBottom: '6px',
                            borderBottom: `1px solid ${entityColors[entityType]}60`,
                            backgroundColor: 'rgba(0, 0, 0, 0.3)'
                        }}>
                            <img
                                src={entityIcons[entityType]}
                                alt={entityNames[entityType]}
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    marginRight: '8px',
                                    border: `2px solid ${entityColors[entityType]}`,
                                    filter: isIgrisk ? 'hue-rotate(270deg) saturate(1.5)' : 'none'
                                }}
                            />
                            <span style={{
                                color: entityColors[entityType],
                                fontSize: '12px',
                                fontWeight: 'bold',
                                fontFamily: 'monospace'
                            }}>
                                {entityNames[entityType]}
                                {isIgrisk && <span style={{ 
                                    fontSize: '10px', 
                                    color: '#ff6b6b',
                                    marginLeft: '5px',
                                    animation: 'blink 1s infinite'
                                }}>⚠️</span>}
                            </span>
                        </div>

                        {/* Message avec DyText */}
                        <div
                            ref={bubbleRef}
                            style={{
                                color: 'white',
                                fontFamily: 'monospace',
                                fontSize: '13px',
                                lineHeight: '1.4',
                                whiteSpace: 'pre-line',
                                minHeight: '20px',
                                textShadow: isIgrisk 
                                    ? '1px 1px 3px rgba(255,0,0,0.5)' 
                                    : '1px 1px 2px rgba(0,0,0,0.8)',
                                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                padding: '6px',
                                borderRadius: '6px',
                                visibility: 'visible',
                                opacity: 1,
                                position: 'relative',
                                zIndex: 1
                            }}
                        />

                        {/* Flèche vers le bas */}
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '12px solid transparent',
                            borderRight: '12px solid transparent',
                            borderTop: isIgrisk 
                                ? '12px solid rgba(40, 20, 20, 0.95)'
                                : '12px solid rgba(20, 20, 40, 0.95)'
                        }} />
                    </div>
                </div>
            ) : (
                // 🖥️ VERSION DESKTOP
                <div
                    style={{
                        position: 'fixed',
                        top: adjustedPosition.y,
                        left: adjustedPosition.x - 120,
                        zIndex: 10100,
                        maxWidth: '280px'
                    }}
                >
                    <div style={{
                        ...bubbleStyle,
                        borderRadius: '12px',
                        padding: '10px',
                        boxShadow: isIgrisk 
                            ? '0 4px 20px rgba(255,0,0,0.3)' 
                            : '0 4px 20px rgba(0,0,0,0.5)'
                    }}>
                        {/* Header Desktop */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '6px'
                        }}>
                            <img
                                src={entityIcons[entityType]}
                                alt={entityNames[entityType]}
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    marginRight: '6px',
                                    border: `1px solid ${entityColors[entityType]}`,
                                    filter: isIgrisk ? 'hue-rotate(270deg) saturate(1.5)' : 'none'
                                }}
                            />
                            <span style={{
                                color: entityColors[entityType],
                                fontSize: '10px',
                                fontWeight: 'bold',
                                fontFamily: 'monospace'
                            }}>
                                {entityNames[entityType]}
                                {isIgrisk && <span style={{ 
                                    fontSize: '8px', 
                                    color: '#ff6b6b',
                                    marginLeft: '3px'
                                }}>(?)</span>}
                            </span>
                        </div>

                        {/* Message Desktop */}
                        <div
                            ref={bubbleRef}
                            style={{
                                color: 'white',
                                fontFamily: 'monospace',
                                fontSize: '12px',
                                lineHeight: '1.3',
                                whiteSpace: 'pre-line',
                                minHeight: '16px',
                                visibility: 'visible',
                                opacity: 1,
                                position: 'relative',
                                zIndex: 1,
                                textShadow: isIgrisk 
                                    ? '1px 1px 3px rgba(255,0,0,0.5)' 
                                    : '1px 1px 2px rgba(0,0,0,0.8)'
                            }}
                        />
                    </div>
                </div>
            )}
            
            {/* Animation blink pour le warning d'Igrisk */}
            {isIgrisk && (
                <style>{`
                    @keyframes blink {
                        0%, 50%, 100% { opacity: 1; }
                        25%, 75% { opacity: 0.3; }
                    }
                `}</style>
            )}
        </>
    );
};

export default ChibiBubble;