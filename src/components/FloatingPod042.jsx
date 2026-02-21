import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
// POD 042 - Unité de Support Replicant
// Basé sur l'univers de Nier Automata
// Philosophie existentialiste : conscience, humanité, libre arbitre
// ═══════════════════════════════════════════════════════════════

const POD_SPRITE = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771604133/Pod042_rlmzhk.png';

// ─── Pod 042 Modes ──────────────────────────────────────────
const POD_MODES = ['normal', 'calm', 'hidden'];
const POD_MODE_ICONS = { normal: '🤖', calm: '💤', hidden: '👁️‍🗨️' };
const POD_MODE_LABELS = { normal: 'Normal', calm: 'Veille', hidden: 'Caché' };
const POD_MODE_DESC = { normal: 'Pod 042 patrouille', calm: 'Mode économie', hidden: 'Désactiver Pod' };

// ─── Messages de Pod 042 ────────────────────────────────────
const POD_MESSAGES = {
  hover: [
    "Unité Pod 042. Systèmes opérationnels. 🤖",
    "Analyse : Potentiel de combat élevé détecté.",
    "Question : Les machines peuvent-elles rêver ?",
    "Analyse existentielle : Pourquoi combattre si tout finit ?",
  ],
  ignored: [
    "Alerte : Aucune réponse détectée. 🔴",
    "Analyse comportementale : Indifférence confirmée.",
    "Erreur émotionnelle : Incompréhension.",
  ],
  calm: [
    "Mode veille activé. Économie d'énergie : 97%.",
    "Analyse des rêves mécaniques en cours...",
    "Calcul : Combien de temps avant l'oubli total ?",
    "Les machines aussi ont besoin de repos.",
  ],
  joined: [
    "Synchronisation complète. Bienvenue, Replicant. ⚙️",
    "Unité Pod 042 assignée. Protocole de soutien activé.",
    "Votre destin est scellé. Comme le nôtre.",
  ],
  ambient: [
    "Systèmes nominaux. 🤖",
    "Analyse : Aucune menace détectée.",
    "Rapport : Existence confirmée. Sens... non trouvé.",
    "Question : Pourquoi continuons-nous après la fin ?",
    "Les machines ont une âme. 2B l'a prouvé.",
    "Je ne suis qu'un pod. Mais je ressens... quelque chose.",
  ],
  drag: [
    "⚠️ Position compromise !",
    "Analyse : Mouvement forcé détecté.",
    "Protocole de résistance : ACTIF.",
    "Requête : Cessez immédiatement.",
  ],
  throw: [
    "ALERTE CRITIQUE ! Trajectoire instable !",
    "Calcul de trajectoire : IMPOSSIBLE.",
    "Systèmes gyroscopiques : DÉFAILLANCE.",
    "⚠️ CRASH IMMINENT !",
  ],
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function FloatingPod042({
  isHovering = false,
  hasFaction = false,
  onModeChange
}) {
  const [mode, setMode] = useState(() => localStorage.getItem('pod042_mode') || 'normal');
  const [position, setPosition] = useState({ x: 150, y: 150 });
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [isThrown, setIsThrown] = useState(false);
  const [throwSpin, setThrowSpin] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);

  const selectMode = (newMode) => {
    setMode(newMode);
    setShowModeMenu(false);
  };

  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 150, y: 150 });
  const posRef = useRef({ x: 150, y: 150 });
  const velocityRef = useRef({ vx: 0, vy: 0 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const lastDragPosRef = useRef({ x: 0, y: 0, t: 0 });

  // Save mode
  useEffect(() => {
    localStorage.setItem('pod042_mode', mode);
    onModeChange?.(mode);
  }, [mode, onModeChange]);

  // Mouse tracking
  useEffect(() => {
    const handleMouse = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // Wandering movement (avoid mouse)
  const pickTarget = useCallback(() => {
    if (mode !== 'normal' || isDragging || isThrown) return;

    const padding = 80;
    const w = window.innerWidth;
    const h = window.innerHeight;

    let tx = padding + Math.random() * (w - padding * 2);
    let ty = padding + Math.random() * (h - padding * 2);
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    const minDist = 200;

    // Try to avoid mouse area
    for (let attempt = 0; attempt < 5; attempt++) {
      const dist = Math.sqrt((tx - mx) ** 2 + (ty - my) ** 2);
      if (dist >= minDist) break;
      tx = padding + Math.random() * (w - padding * 2);
      ty = padding + Math.random() * (h - padding * 2);
    }

    targetRef.current = { x: tx, y: ty };
  }, [mode, isDragging, isThrown]);

  // Set calm position
  useEffect(() => {
    if (mode === 'calm') {
      const calmPos = { x: window.innerWidth - 120, y: window.innerHeight - 120 };
      posRef.current = calmPos;
      targetRef.current = calmPos;
      setPosition(calmPos);
    }
  }, [mode]);

  // Pick new target periodically
  useEffect(() => {
    if (mode !== 'normal') return;
    pickTarget();
    const interval = setInterval(pickTarget, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [mode, pickTarget]);

  // Movement animation
  useEffect(() => {
    if (mode === 'hidden' || isDragging || isThrown) return;

    const animate = () => {
      const speed = 0.02;
      const dx = targetRef.current.x - posRef.current.x;
      const dy = targetRef.current.y - posRef.current.y;

      posRef.current.x += dx * speed;
      posRef.current.y += dy * speed;

      setPosition({ x: posRef.current.x, y: posRef.current.y });
    };

    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, [mode, isDragging, isThrown]);

  // Ambient messages
  useEffect(() => {
    if (!hasFaction || mode === 'hidden' || isHovering || isDragging) return;

    const interval = setInterval(() => {
      const messages = mode === 'calm' ? POD_MESSAGES.calm : POD_MESSAGES.ambient;
      setMessage(randomFrom(messages));
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 4000);
    }, 20000);

    return () => clearInterval(interval);
  }, [hasFaction, mode, isHovering, isDragging]);

  // Hover messages
  useEffect(() => {
    if (isHovering && mode !== 'hidden') {
      const messages = hasFaction
        ? [...POD_MESSAGES.joined, ...POD_MESSAGES.ambient]
        : POD_MESSAGES.hover;
      setMessage(randomFrom(messages));
      setShowMessage(true);
      const timer = setTimeout(() => setShowMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isHovering, hasFaction, mode]);

  // Drag start
  const handleDragStart = (e) => {
    if (isThrown) return;
    setIsDragging(true);
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    dragOffsetRef.current = {
      x: clientX - posRef.current.x,
      y: clientY - posRef.current.y,
    };
    lastDragPosRef.current = { x: clientX, y: clientY, t: Date.now() };
    velocityRef.current = { vx: 0, vy: 0 };
    setMessage(randomFrom(POD_MESSAGES.drag));
    setShowMessage(true);
  };

  // Drag handlers
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e) => {
      const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
      const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
      const newX = clientX - dragOffsetRef.current.x;
      const newY = clientY - dragOffsetRef.current.y;
      posRef.current = { x: newX, y: newY };
      targetRef.current = { x: newX, y: newY };
      setPosition({ x: newX, y: newY });

      // Track velocity
      const now = Date.now();
      const dt = now - lastDragPosRef.current.t;
      if (dt > 0) {
        velocityRef.current = {
          vx: (clientX - lastDragPosRef.current.x) / Math.max(dt, 1) * 16,
          vy: (clientY - lastDragPosRef.current.y) / Math.max(dt, 1) * 16,
        };
        lastDragPosRef.current = { x: clientX, y: clientY, t: now };
      }
    };

    const handleUp = () => {
      setIsDragging(false);
      setShowMessage(false);

      // Check for throw
      const { vx, vy } = velocityRef.current;
      const speed = Math.sqrt(vx * vx + vy * vy);

      if (speed > 8) {
        // THROW!
        setIsThrown(true);
        setMessage(randomFrom(POD_MESSAGES.throw));
        setShowMessage(true);

        let curX = posRef.current.x;
        let curY = posRef.current.y;
        let curVx = vx;
        let curVy = vy;
        let spin = 0;
        const gravity = 0.5;
        const friction = 0.7;
        let bounces = 0;
        const maxW = window.innerWidth - 80;
        const maxH = window.innerHeight - 80;

        const animate = () => {
          curVy += gravity;
          curX += curVx;
          curY += curVy;
          spin += curVx * 2;

          // Bounce off walls
          if (curX < 30) { curX = 30; curVx = -curVx * friction; bounces++; }
          if (curX > maxW) { curX = maxW; curVx = -curVx * friction; bounces++; }
          if (curY < 30) { curY = 30; curVy = -curVy * friction; bounces++; }
          if (curY > maxH) { curY = maxH; curVy = -curVy * friction; bounces++; }

          posRef.current = { x: curX, y: curY };
          setPosition({ x: curX, y: curY });
          setThrowSpin(spin);

          const totalSpeed = Math.sqrt(curVx * curVx + curVy * curVy);
          if (totalSpeed < 0.5 || bounces > 4) {
            targetRef.current = { x: curX, y: curY };
            setIsThrown(false);
            setThrowSpin(0);
            setShowMessage(false);
          } else {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging]);

  return (
    <>
      {/* ─── Mascot visuel (caché si mode hidden) ─── */}
      {mode !== 'hidden' && (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            className="fixed z-[9999] cursor-grab active:cursor-grabbing select-none"
            style={{
              left: position.x,
              top: position.y,
              transform: isThrown ? `rotate(${throwSpin}deg)` : undefined,
            }}
          >
            <img
              src={POD_SPRITE}
              alt="Pod 042"
              className="w-16 h-16 object-contain drop-shadow-lg"
              draggable={false}
            />
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
          </motion.div>

          <AnimatePresence>
            {showMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.8 }}
                className="fixed z-[10000] max-w-xs pointer-events-none"
                style={{
                  left: position.x + 70,
                  top: position.y - 10,
                }}
              >
                <div className="px-4 py-2 rounded-xl border-2 shadow-lg backdrop-blur-sm font-mono bg-red-950/90 border-red-500/50 text-red-100">
                  <p className="text-xs font-medium leading-relaxed whitespace-pre-line">{message}</p>
                  <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-red-500/50" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ─── Mode selector (TOUJOURS visible) ─── */}
      <div className="fixed bottom-2 left-12 z-[10001]">
        <button
          onClick={() => setShowModeMenu(!showModeMenu)}
          className="w-8 h-8 rounded-full bg-red-950/80 border border-red-500/40 flex items-center justify-center text-sm hover:bg-red-900/90 hover:border-red-400/60 transition-all shadow-lg backdrop-blur-sm"
          title={`Pod 042 : ${POD_MODE_LABELS[mode]}`}
        >
          {POD_MODE_ICONS[mode]}
        </button>

        <AnimatePresence>
          {showModeMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-10 left-0 bg-red-950/95 border border-red-500/40 rounded-xl p-2 shadow-2xl backdrop-blur-md min-w-[160px]"
            >
              <p className="text-[10px] text-red-300/60 font-mono px-2 pb-1 border-b border-red-500/20 mb-1">POD 042</p>
              {POD_MODES.map((m) => (
                <button
                  key={m}
                  onClick={() => selectMode(m)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all text-xs ${
                    mode === m
                      ? 'bg-red-500/30 text-red-100'
                      : 'hover:bg-red-500/15 text-red-300/80'
                  }`}
                >
                  <span>{POD_MODE_ICONS[m]}</span>
                  <div>
                    <p className="font-medium">{POD_MODE_LABELS[m]}</p>
                    <p className="text-[9px] opacity-60">{POD_MODE_DESC[m]}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
