import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
// DAIJIN - Gardien de Vox Cordis
// Mascotte de faction basée sur l'univers de Suzume
// ═══════════════════════════════════════════════════════════════

const DAIJIN_SPRITE = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771602808/Daijin_p1pvcs.png';

// ─── Daijin Modes ──────────────────────────────────────────
const DAIJIN_MODES = ['normal', 'calm', 'hidden'];
const DAIJIN_MODE_ICONS = { normal: '🐱', calm: '😴', hidden: '👻' };
const DAIJIN_MODE_LABELS = { normal: 'Normal', calm: 'Calme', hidden: 'Cache' };
const DAIJIN_MODE_DESC = { normal: 'Se balade librement', calm: 'Medite tranquillement', hidden: 'Invisible' };

// ─── Messages de Daijin ────────────────────────────────────
const DAIJIN_MESSAGES = {
  hover: [
    "Veux-tu jouer avec moi ? 🎭",
    "Je garde les portes entre les mondes...",
    "Les tremblements de terre... je les sens venir...",
    "Ton cœur entend ce que l'univers murmure.",
    "Ne t'inquiète pas, je veille sur toi.",
  ],
  ignored: [
    "Tu m'ignores...? 😢",
    "Je suis juste un gardien solitaire...",
    "*miaule tristement*",
    "Même les gardiens ont besoin d'affection...",
  ],
  calm: [
    "Je médite sur l'équilibre du monde...",
    "*dort paisiblement*",
    "La paix règne quand les portes sont fermées.",
    "Mmmh... cette sieste est divine.",
    "Mode zen activé. Aucun chat n'a été plus serein.",
    "*ronronne doucement*",
  ],
  joined: [
    "Bienvenue dans la famille, chasseur !",
    "Le cœur de Vox Cordis bat avec le tien.",
    "Je serai toujours à tes côtés.",
    "Ton aura est alignée avec Vox Cordis.",
  ],
  ambient: [
    "Miaou~ 🐱",
    "Les portes tiennent bon aujourd'hui.",
    "*secoue ses clochettes*",
    "Suzume serait fière de toi.",
    "*observe les étoiles*",
    "*se lèche la patte*",
    "La voix du cœur résonne en toi.",
    "Tu veux jouer ? J'ai du temps avant la prochaine ronde de garde.",
  ],
  drag: [
    "Miaou ! Où tu m'emmènes ?!",
    "Doucement, je suis un gardien sacré !",
    "*miaule d'indignation*",
    "Les portes... je dois... surveiller... !",
  ],
  throw: [
    "MIAOUUUU !! Je vole !!",
    "*clochettes qui tintent frénétiquement*",
    "Les portes vont s'ouvrir si je tombe !!",
    "SUZUMEEE ! À L'AIDE !",
  ],
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function FloatingDaijin({
  isHovering = false,
  hasFaction = false,
  onModeChange
}) {
  const [mode, setMode] = useState(() => localStorage.getItem('daijin_mode') || 'normal');
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [isThrown, setIsThrown] = useState(false);
  const [throwSpin, setThrowSpin] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);

  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 100, y: 100 });
  const posRef = useRef({ x: 100, y: 100 });
  const velocityRef = useRef({ vx: 0, vy: 0 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const lastDragPosRef = useRef({ x: 0, y: 0, t: 0 });

  // Save mode
  useEffect(() => {
    localStorage.setItem('daijin_mode', mode);
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
      const messages = mode === 'calm' ? DAIJIN_MESSAGES.calm : DAIJIN_MESSAGES.ambient;
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
        ? [...DAIJIN_MESSAGES.joined, ...DAIJIN_MESSAGES.ambient]
        : DAIJIN_MESSAGES.hover;
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
    setMessage(randomFrom(DAIJIN_MESSAGES.drag));
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
        setMessage(randomFrom(DAIJIN_MESSAGES.throw));
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

  const selectMode = (m) => {
    setMode(m);
    setShowModeMenu(false);
  };

  return (
    <>
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
            <img loading="lazy"
              src={DAIJIN_SPRITE}
              alt="Daijin"
              className="w-16 h-16 object-contain drop-shadow-lg"
              draggable={false}
            />
            <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl animate-pulse" />
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
                <div className="px-4 py-2 rounded-xl border-2 shadow-lg backdrop-blur-sm bg-blue-900/90 border-blue-400/50 text-blue-100">
                  <p className="text-xs font-medium leading-relaxed whitespace-pre-line">{message}</p>
                  <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-blue-400/50" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Mode Selector Button */}
      <div className="fixed bottom-2 left-[40px] z-[9999]">
        <button
          onClick={() => setShowModeMenu(prev => !prev)}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 text-[11px]"
          style={{
            opacity: showModeMenu ? 0.9 : 0.3,
            background: showModeMenu ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.2)',
          }}
          title={`Daijin: ${DAIJIN_MODE_LABELS[mode]}`}
        >
          {DAIJIN_MODE_ICONS[mode]}
        </button>
        <AnimatePresence>
          {showModeMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              className="absolute bottom-9 left-0 bg-gray-900/95 backdrop-blur-md rounded-xl p-2 border border-blue-500/30 shadow-xl"
              style={{ width: '150px' }}
            >
              <div className="text-[9px] text-blue-400/80 font-bold uppercase tracking-wider mb-1.5 text-center">Mode Daijin</div>
              {DAIJIN_MODES.map(m => (
                <button
                  key={m}
                  onClick={() => selectMode(m)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all mb-0.5 ${
                    mode === m
                      ? 'bg-blue-500/25 text-blue-300 border border-blue-500/40'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border border-transparent'
                  }`}
                >
                  <span className="text-sm">{DAIJIN_MODE_ICONS[m]}</span>
                  <div className="text-left">
                    <div>{DAIJIN_MODE_LABELS[m]}</div>
                    <div className="text-[8px] text-gray-500 font-normal">{DAIJIN_MODE_DESC[m]}</div>
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
