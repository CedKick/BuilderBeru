import React, { useEffect, useRef, useState } from 'react';
import { dytextAnimate } from "../useDytext";

const ChibiBubble = ({ message, position, entityType = 'tank', isMobile, onClose }) => {
    const bubbleRef = useRef();
    const [isVisible, setIsVisible] = useState(true);
    const [isClosing, setIsClosing] = useState(false);
    const [adjustedPosition, setAdjustedPosition] = useState(position);

    // 🎭 ICÔNES DES ENTITÉS
    const entityIcons = {
        tank: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604465/tank_face_n9kxrh.png',
        beru: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414699/beru_face_w2rdyn.png',
        kaisel: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750768929/Kaisel_face_dm9394.png',
        igris: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754570362/igris_face_xj5mqo.png', // Ajoute ton URL
        cerbere: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754570362/igris_face_xj5mqo.png' // Ajoute ton URL
    };

    // 🏷️ NOMS DES ENTITÉS
    const entityNames = {
        tank: 'Tank',
        beru: 'Béru',
        kaisel: 'Kaisel',
        igris: 'Igris',
        cerbere: 'Cerbère'
    };

    // 🎨 COULEURS DES ENTITÉS
    const entityColors = {
        tank: '#4CAF50',
        beru: '#8A2BE2',
        kaisel: '#00FF41',
        igris: '#980808ff', // Violet royal pour Igris
    cerbere: '#e334baff' // Marron pour Cerbère
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

    useEffect(() => {
        if (bubbleRef.current && message) {
            setTimeout(() => {
                dytextAnimate(bubbleRef, message, 35);
            }, 200);
        }
    }, [message]);

    if (!message || !isVisible) return null;

    return (
        <>
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
                            backgroundColor: 'rgba(20, 20, 40, 0.5)',
                            backdropFilter: 'blur(4px)',
                            border: `2px solid ${entityColors[entityType]}60`,
                            borderRadius: '16px',
                            padding: '12px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                            animation: 'bounceGentle 2s ease-in-out infinite',
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
                                    border: `2px solid ${entityColors[entityType]}`
                                }}
                            />
                            <span style={{
                                color: entityColors[entityType],
                                fontSize: '12px',
                                fontWeight: 'bold',
                                fontFamily: 'monospace'
                            }}>
                                {entityNames[entityType]}
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
                                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                padding: '4px',
                                borderRadius: '6px'
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
                            borderTop: `12px solid rgba(20, 20, 40, 0.5)`
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
                        zIndex: 100,
                        maxWidth: '280px'
                    }}
                >
                    <div style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        border: `1px solid ${entityColors[entityType]}60`,
                        borderRadius: '12px',
                        padding: '10px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
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
                                    border: `1px solid ${entityColors[entityType]}`
                                }}
                            />
                            <span style={{
                                color: entityColors[entityType],
                                fontSize: '10px',
                                fontWeight: 'bold',
                                fontFamily: 'monospace'
                            }}>
                                {entityNames[entityType]}
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
                                minHeight: '16px'
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default ChibiBubble;