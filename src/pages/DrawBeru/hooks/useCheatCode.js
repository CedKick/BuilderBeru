import { useState, useRef, useEffect } from 'react';

/**
 * Hook for the A+E+R+T+Shift cheat code.
 * Activates a 10-second cheat mode with 1-hour cooldown.
 */
export const useCheatCode = (isMobile) => {
    const [cheatModeActive, setCheatModeActive] = useState(false);
    const [cheatCooldown, setCheatCooldown] = useState(null);
    const [cheatTimeRemaining, setCheatTimeRemaining] = useState(10);
    const [pressedKeys, setPressedKeys] = useState(new Set());
    const cheatTimerRef = useRef(null);
    const cheatCountdownRef = useRef(null);

    useEffect(() => {
        if (isMobile) return;

        const activateCheatMode = () => {
            const now = Date.now();
            const storedCooldown = localStorage.getItem('drawberu_cheat_cooldown');

            if (storedCooldown) {
                const cooldownEnd = parseInt(storedCooldown);
                if (now < cooldownEnd) {
                    const remainingMinutes = Math.ceil((cooldownEnd - now) / 60000);
                    alert(`Cheat code en cooldown ! Reessayez dans ${remainingMinutes} minute(s).`);
                    return;
                }
            }

            setCheatModeActive(true);
            setCheatTimeRemaining(10);

            let timeLeft = 10;
            cheatCountdownRef.current = setInterval(() => {
                timeLeft--;
                setCheatTimeRemaining(timeLeft);
                if (timeLeft <= 0) {
                    clearInterval(cheatCountdownRef.current);
                }
            }, 1000);

            if (cheatTimerRef.current) {
                clearTimeout(cheatTimerRef.current);
            }

            cheatTimerRef.current = setTimeout(() => {
                setCheatModeActive(false);
                const cooldownEnd = Date.now() + (60 * 60 * 1000);
                localStorage.setItem('drawberu_cheat_cooldown', cooldownEnd.toString());
                setCheatCooldown(cooldownEnd);
            }, 10000);
        };

        const handleKeyDown = (e) => {
            setPressedKeys(prev => {
                const newKeys = new Set(prev);
                newKeys.add(e.key.toLowerCase());

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

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (cheatTimerRef.current) clearTimeout(cheatTimerRef.current);
            if (cheatCountdownRef.current) clearInterval(cheatCountdownRef.current);
        };
    }, [isMobile]);

    return { cheatModeActive, cheatCooldown, cheatTimeRemaining };
};

export default useCheatCode;
