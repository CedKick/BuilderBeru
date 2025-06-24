import React, { useEffect, useRef } from 'react';
import { dytextAnimate } from "../useDytext"; // anciennement useDytext, même fichier

const ChibiBubble = ({ message, position }) => {
    const bubbleRef = useRef();

    useEffect(() => {
        if (bubbleRef.current && message) {
            dytextAnimate(bubbleRef, message, 35); // fonction, plus un Hook !
        }
    }, [message]);

    if (!message) return null;

    return (
        <div
            ref={bubbleRef}
            style={{
                position: 'absolute',
                top: position.y - 797, // ← Décale la bulle AU-DESSUS du Chibi
                left: position.x - 100,

                backgroundColor: 'rgba(0,0,0,0.8)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '12px',
                fontFamily: 'monospace',
                whiteSpace: 'pre-line',
                maxWidth: '240px',
                zIndex: 100,
            }}
        >
            {/* le texte est injecté dynamiquement ici */}
        </div>
    );
};

export default ChibiBubble;