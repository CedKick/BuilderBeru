import React, { useEffect, useRef, useState } from 'react';
import { dytextAnimate } from "../useDytext";

const ChibiBubble = ({ message, position, entityType = 'tank', isMobile, onClose, onComplete }) => {
    const bubbleRef = useRef();
    const [isVisible, setIsVisible] = useState(true);
    const [isClosing, setIsClosing] = useState(false);
    const [adjustedPosition, setAdjustedPosition] = useState(position);
    
    // 🔧 FIX: Utiliser un ID unique pour chaque message pour éviter les doublons
    const messageIdRef = useRef(null);
    const animationInProgressRef = useRef(false);
    const animationTimeoutRef = useRef(null);

    // 🎭 ICÔNES DES ENTITÉS (AVEC IGRISK !)
    const entityIcons = {
        tank: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604465/tank_face_n9kxrh.png',
        beru: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414699/beru_face_w2rdyn.png',
        kaisel: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750768929/Kaisel_face_dm9394.png',
        igris: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754570362/igris_face_xj5mqo.png',
        cerbere: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754731189/cerbere_icon_dtwfhu.png',
        igrisk: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754731036/igrisk_icon_vytfic.png',
        berserker: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756592473/berserk_up_rqjt0n.png"
    };

    // 🏷️ NOMS DES ENTITÉS
    const entityNames = {
        tank: 'Tank',
        beru: 'Béru',
        kaisel: 'Kaisel',
        igris: 'Igris',
        cerbere: 'Cerbère',
        igrisk: 'Igris(?)',
        berserker: "Berserker des Ombres"
    };

    // 🎨 COULEURS DES ENTITÉS
    const entityColors = {
        tank: '#4CAF50',
        beru: '#8A2BE2',
        kaisel: '#00FF41',
        igris: '#980808ff',
        cerbere: '#e334baff',
        cerbère: '#e334baff',
        igrisk: '#FF6B6B',
        berserker: "#8b00ff"
    };

    // 📱 DÉTECTION MOBILE
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

    // 📍 AJUSTEMENT DE LA POSITION - Bulle centrée au-dessus du chibi
    useEffect(() => {
        if (isMobileDevice) {
            // Mobile : utiliser la position passée ou centrer
            setAdjustedPosition({
                x: position?.x || window.innerWidth / 2,
                y: Math.max(60, position?.y || 80),
                currentCanvasId: position?.currentCanvasId
            });
        } else {
            // Desktop : garder la position x du chibi pour centrer la bulle au-dessus
            const safePosition = {
                x: Math.max(140, Math.min(window.innerWidth - 140, position?.x || window.innerWidth / 2)),
                y: Math.max(80, Math.min(window.innerHeight - 150, position?.y || 200)),
                currentCanvasId: position?.currentCanvasId
            };
            setAdjustedPosition(safePosition);
        }
    }, [position, isMobileDevice]);

    // 🎯 ANIMATION DU TEXTE - CORRIGÉ
    useEffect(() => {
        // 🔧 FIX: Générer un ID unique pour ce message
        const currentMessageId = `${entityType}-${message}-${Date.now()}`;
        
        // Si c'est un nouveau message ou si l'animation n'est pas en cours
        if (message && bubbleRef.current && messageIdRef.current !== currentMessageId && !animationInProgressRef.current) {
            console.log(`🎯 Nouvelle animation pour: ${entityNames[entityType]}`);
            
            // Marquer ce message comme traité
            messageIdRef.current = currentMessageId;
            animationInProgressRef.current = true;
            
            // Nettoyer l'ancien contenu
            bubbleRef.current.innerHTML = '';
            
            // Annuler l'ancien timeout s'il existe
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
            
            // Délai pour s'assurer que le DOM est prêt
            animationTimeoutRef.current = setTimeout(() => {
                if (bubbleRef.current && bubbleRef.current.offsetParent !== null && animationInProgressRef.current) {
                    try {
                        dytextAnimate(bubbleRef, message, 35, {
                            onComplete: () => {
                                console.log(`✅ Animation complétée pour: ${entityNames[entityType]}`);
                                animationInProgressRef.current = false;
                                if (onComplete) {
                                    onComplete();
                                }
                            }
                        });
                    } catch (error) {
                        console.error('Erreur animation:', error);
                        animationInProgressRef.current = false;
                        // Fallback: afficher le texte directement
                        if (bubbleRef.current) {
                            bubbleRef.current.textContent = message;
                        }
                    }
                } else {
                    animationInProgressRef.current = false;
                }
            }, 100); // Délai réduit pour plus de réactivité
        }
    }, [message, entityType, onComplete]);

    // 🧹 Cleanup complet au démontage
    useEffect(() => {
        return () => {
            // Nettoyer les timeouts
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
            
            // Réinitialiser les refs
            animationInProgressRef.current = false;
            messageIdRef.current = null;
            
            // Nettoyer le contenu du bubble
            if (bubbleRef.current) {
                bubbleRef.current.innerHTML = '';
            }
        };
    }, []);

    if (!message || !isVisible) return null;

    // 🎭 Styles spéciaux pour Igrisk et Berserker
    const isIgrisk = entityType === 'igrisk';
    const isBerserker = entityType === 'berserker';
    
    const bubbleStyle = isBerserker ? {
        backgroundColor: 'rgba(25, 0, 40, 0.95)',
        backdropFilter: 'blur(6px) saturate(1.5)',
        border: `2px solid ${entityColors[entityType]}`,
        boxShadow: '0 0 20px rgba(139, 0, 255, 0.6)',
    } : isIgrisk ? {
        backgroundColor: 'rgba(40, 20, 20, 0.95)',
        backdropFilter: 'blur(4px) hue-rotate(-15deg)',
        border: `2px solid ${entityColors[entityType]}60`,
        animation: 'igriskGlitch 5s infinite'
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
                        zIndex: isBerserker ? 10503 : 9999,
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
                            boxShadow: isBerserker
                                ? '0 8px 32px rgba(139,0,255,0.5)'
                                : isIgrisk
                                ? '0 8px 32px rgba(255,0,0,0.3)'
                                : '0 8px 32px rgba(0,0,0,0.4)',
                            animation: isBerserker
                                ? 'bounceGentle 2s ease-in-out infinite, berserkerPulse 3s infinite'
                                : isIgrisk
                                ? 'bounceGentle 2s ease-in-out infinite, igriskGlitch 5s infinite'
                                : 'bounceGentle 2s ease-in-out infinite',
                            cursor: 'pointer'
                        }}
                    >
                        {/* 📱 MOBILE: Icône en haut, texte en dessous */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            {/* Icône + Nom */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                paddingBottom: '6px',
                                borderBottom: `1px solid ${entityColors[entityType]}60`,
                                width: '100%',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                borderRadius: '8px',
                                padding: '6px'
                            }}>
                                <img
                                    src={entityIcons[entityType]}
                                    alt={entityNames[entityType]}
                                    style={{
                                        width: isBerserker ? '44px' : '40px',
                                        height: isBerserker ? '44px' : '40px',
                                        borderRadius: '50%',
                                        border: `3px solid ${entityColors[entityType]}`,
                                        filter: isIgrisk ? 'hue-rotate(270deg) saturate(1.5)' :
                                               isBerserker ? 'drop-shadow(0 0 5px rgba(139,0,255,0.8))' : 'none',
                                        boxShadow: `0 0 10px ${entityColors[entityType]}50`
                                    }}
                                />
                                <span style={{
                                    color: entityColors[entityType],
                                    fontSize: '14px',
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
                                    {isBerserker && <span style={{
                                        fontSize: '10px',
                                        color: '#ff00ff',
                                        marginLeft: '5px'
                                    }}>💀</span>}
                                </span>
                            </div>

                            {/* Message avec DyText - EN DESSOUS sur mobile */}
                            <div
                                ref={bubbleRef}
                                style={{
                                    color: isBerserker ? '#ff4444' : 'white',
                                    fontFamily: 'monospace',
                                    fontSize: '13px',
                                    lineHeight: '1.4',
                                    whiteSpace: 'pre-line',
                                    minHeight: '20px',
                                    textShadow: isBerserker
                                        ? '0 0 10px rgba(255,0,0,0.8)'
                                        : isIgrisk
                                        ? '1px 1px 3px rgba(255,0,0,0.5)'
                                        : '1px 1px 2px rgba(0,0,0,0.8)',
                                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                    padding: '8px',
                                    borderRadius: '6px',
                                    visibility: 'visible',
                                    opacity: 1,
                                    position: 'relative',
                                    zIndex: 1,
                                    width: '100%',
                                    textAlign: 'center'
                                }}
                            />
                        </div>

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
                            borderTop: isBerserker
                                ? '12px solid rgba(25, 0, 40, 0.95)'
                                : isIgrisk
                                ? '12px solid rgba(40, 20, 20, 0.95)'
                                : '12px solid rgba(20, 20, 40, 0.95)'
                        }} />
                    </div>
                </div>
            ) : (
                // 🖥️ VERSION DESKTOP - Centré au-dessus du chibi
                <div
                    style={{
                        position: 'fixed',
                        top: adjustedPosition.y,
                        left: adjustedPosition.x,
                        transform: 'translateX(-50%)', // Centrer horizontalement
                        zIndex: isBerserker ? 10503 : 10100,
                        maxWidth: '350px', // Plus large pour layout horizontal
                        minWidth: '280px'
                    }}
                >
                    <div style={{
                        ...bubbleStyle,
                        borderRadius: '12px',
                        padding: '10px',
                        boxShadow: isBerserker
                            ? '0 4px 20px rgba(139,0,255,0.5)'
                            : isIgrisk
                            ? '0 4px 20px rgba(255,0,0,0.3)'
                            : '0 4px 20px rgba(0,0,0,0.5)'
                    }}>
                        {/* 🖥️ DESKTOP: Icône à gauche, texte à droite */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            gap: '12px'
                        }}>
                            {/* Icône grande + Nom */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                flexShrink: 0
                            }}>
                                <img
                                    src={entityIcons[entityType]}
                                    alt={entityNames[entityType]}
                                    style={{
                                        width: isBerserker ? '44px' : '40px',
                                        height: isBerserker ? '44px' : '40px',
                                        borderRadius: '50%',
                                        border: `3px solid ${entityColors[entityType]}`,
                                        filter: isIgrisk ? 'hue-rotate(270deg) saturate(1.5)' :
                                               isBerserker ? 'drop-shadow(0 0 5px rgba(139,0,255,0.8))' : 'none',
                                        boxShadow: `0 0 10px ${entityColors[entityType]}50`
                                    }}
                                />
                                <span style={{
                                    color: entityColors[entityType],
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    fontFamily: 'monospace',
                                    textAlign: 'center',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {entityNames[entityType]}
                                    {isIgrisk && <span style={{
                                        fontSize: '8px',
                                        color: '#ff6b6b',
                                        marginLeft: '3px'
                                    }}>(?)</span>}
                                    {isBerserker && <span style={{
                                        fontSize: '8px',
                                        color: '#ff00ff',
                                        marginLeft: '3px'
                                    }}>💀</span>}
                                </span>
                            </div>

                            {/* Message Desktop - À DROITE de l'icône */}
                            <div
                                ref={bubbleRef}
                                style={{
                                    color: isBerserker ? '#ff4444' : 'white',
                                    fontFamily: 'monospace',
                                    fontSize: '12px',
                                    lineHeight: '1.4',
                                    whiteSpace: 'pre-line',
                                    minHeight: '40px',
                                    visibility: 'visible',
                                    opacity: 1,
                                    position: 'relative',
                                    zIndex: 1,
                                    textShadow: isBerserker
                                        ? '0 0 10px rgba(255,0,0,0.8)'
                                        : isIgrisk
                                        ? '1px 1px 3px rgba(255,0,0,0.5)'
                                        : '1px 1px 2px rgba(0,0,0,0.8)',
                                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                    padding: '8px',
                                    borderRadius: '6px',
                                    flex: 1
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Animations */}
            {(isIgrisk || isBerserker) && (
                <style>{`
                    @keyframes blink {
                        0%, 50%, 100% { opacity: 1; }
                        25%, 75% { opacity: 0.3; }
                    }
                    @keyframes berserkerPulse {
                        0%, 100% { 
                            box-shadow: 0 8px 32px rgba(139,0,255,0.5);
                        }
                        50% { 
                            box-shadow: 0 8px 40px rgba(255,0,255,0.7);
                        }
                    }
                `}</style>
            )}
        </>
    );
};

export default ChibiBubble;