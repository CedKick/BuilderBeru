import React, { useState, useEffect, useRef, useCallback } from 'react';

const IGRIS_IMAGES = {
  up: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754570648/igris_up_hfonzn.png',
  down: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754570362/igris_face_xj5mqo.png',
  left: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754570544/igris_left_cw3w5g.png',
  right: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754570506/igris_right_jmyupb.png',
};

const STEPS = [
  { id: 'welcome', message: "Chasseur. L'heure n'est plus au combat... mais a l'art. Bienvenue dans l'atelier.", duration: 4000 },
  { id: 'canvas', message: "Ton canvas. Les contours sont traces, a toi de les remplir de couleur.", selector: 'canvas', highlight: true, duration: 4500 },
  { id: 'reference', message: "Le modele de reference. Etudie chaque couleur, chaque ombre. Tu peux le masquer.", selector: '[data-tutorial="reference"]', highlight: true, duration: 5000 },
  { id: 'palette', message: "Ta palette de couleurs. Clique pour equiper une teinte a ton pinceau.", selector: '[data-tutorial="palette"]', highlight: true, duration: 4000 },
  { id: 'brush', message: "Le Pinceau (B). Ton arme principale. Plusieurs types : G-Pen, Crayon, Feutre...", selector: '[title="Pinceau (B)"]', highlight: true, duration: 4500 },
  { id: 'eraser', message: "La Gomme (E). Meme un Monarque fait des erreurs.", selector: '[title="Gomme (E)"]', highlight: true, duration: 3500 },
  { id: 'pipette', message: "La Pipette (I). Capture la couleur exacte du modele.", selector: '[title="Pipette (I)"]', highlight: true, duration: 3500 },
  { id: 'brush_size', message: "Taille du pinceau. Touches [ et ] pour ajuster vite.", selector: '[data-tutorial="brush-size"]', highlight: true, duration: 3500 },
  { id: 'secret', message: "Maintenant... le SECRET. La technique que les maitres utilisent.", duration: 3500 },
  { id: 'magic_btn', message: "La cible verte. Le PINCEAU MAGIQUE. Active-le.", selector: '[data-tutorial="auto-pipette"]', highlight: true, glow: true, duration: 4000 },
  { id: 'magic_how', message: "Une fois actif... GRIBOUILLE. Comme si tu avais 5 ans.", duration: 4000 },
  { id: 'magic_why', message: "Le pinceau lit le modele et applique la BONNE couleur a chaque pixel. Tu gribouilles = chef-d'oeuvre.", accent: true, duration: 6000 },
  { id: 'demo', message: "Observe... Je vais te montrer.", accent: true, demo: true, duration: 8000 },
  { id: 'magic_tip', message: "Tu vois ? Pas besoin de precision. Gribouille vite, la magie fait le reste.", duration: 5000 },
  { id: 'layers', message: "3 calques : Base, Ombres, Details. Organise ton coloriage.", selector: '[data-tutorial="layers"]', highlight: true, duration: 4000 },
  { id: 'undo', message: "Ctrl+Z annule. Ctrl+Y retablit. N'hesite jamais.", selector: '[title="Annuler (Ctrl+Z)"]', highlight: true, duration: 3500 },
  { id: 'save', message: "Ctrl+S sauvegarde. Tu pourras reprendre plus tard.", selector: '[title="Sauvegarder (Ctrl+S)"]', highlight: true, duration: 3500 },
  { id: 'timelapse', message: "Le Timelapse : revois ton travail en accelere et exporte la video.", selector: '[title="Timelapse replay de ton dessin"]', highlight: true, duration: 4000 },
  { id: 'farewell', message: "Tu sais tout. Active le Pinceau Magique, gribouille, et PEINS.", duration: 4000 },
];

// Generate random scribble paths across the canvas
const generateScribblePaths = (w, h, count = 6) => {
  const paths = [];
  for (let i = 0; i < count; i++) {
    const points = [];
    // Start at a random position
    let x = Math.random() * w * 0.8 + w * 0.1;
    let y = Math.random() * h * 0.8 + h * 0.1;
    const numPoints = 40 + Math.floor(Math.random() * 60);
    for (let j = 0; j < numPoints; j++) {
      points.push({ x, y });
      // Random walk with larger strokes
      x += (Math.random() - 0.5) * w * 0.06;
      y += (Math.random() - 0.5) * h * 0.06;
      // Keep in bounds
      x = Math.max(w * 0.05, Math.min(w * 0.95, x));
      y = Math.max(h * 0.05, Math.min(h * 0.95, y));
    }
    paths.push(points);
  }
  return paths;
};

// Read color from reference image data at position
const getRefColor = (cachedData, posX, posY, canvasW, canvasH) => {
  if (!cachedData) return '#888888';
  const refX = Math.floor(posX * cachedData.width / canvasW);
  const refY = Math.floor(posY * cachedData.height / canvasH);
  if (refX < 0 || refX >= cachedData.width || refY < 0 || refY >= cachedData.height) return '#888888';
  const idx = (refY * cachedData.width + refX) * 4;
  const r = cachedData.data[idx];
  const g = cachedData.data[idx + 1];
  const b = cachedData.data[idx + 2];
  const a = cachedData.data[idx + 3];
  if (a < 10) return '#888888';
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

// ====== Mini propose button (bottom-right, for returning users) ======
export const DrawBeruTutorialPropose = ({ onStart }) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <button
      onClick={onStart}
      onContextMenu={(e) => { e.preventDefault(); setVisible(false); }}
      className="fixed bottom-4 right-4 z-[9990] group flex items-center gap-2 bg-[#0a1628]/90 border border-[#00d4ff]/40 rounded-full px-3 py-2 shadow-lg hover:border-[#00d4ff] transition-all hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]"
      title="Tutoriel DrawBeru (clic droit pour masquer)"
    >
      <img src={IGRIS_IMAGES.down} alt="Igris" className="w-8 h-8 rounded-full" loading="lazy" />
      <span className="text-[#00d4ff] text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity max-w-0 group-hover:max-w-[120px] overflow-hidden whitespace-nowrap">
        Tutoriel
      </span>
    </button>
  );
};

// ====== Full tutorial overlay ======
const DrawBeruTutorial = ({ onClose, demoRef }) => {
  const [step, setStep] = useState(-1);
  const [showNotif, setShowNotif] = useState(true);
  const [igrisPos, setIgrisPos] = useState({ x: window.innerWidth / 2, y: window.innerHeight * 0.38 });
  const [igrisDir, setIgrisDir] = useState('down');
  const [isMoving, setIsMoving] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);
  const remainingRef = useRef(0);

  const finish = useCallback(() => {
    try { localStorage.setItem('drawberu_tutorial_seen', '1'); } catch {}
    clearHL();
    onClose();
  }, [onClose]);

  // ---- Auto-advance timer ----
  const startTimer = useCallback((dur) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    startTimeRef.current = Date.now();
    remainingRef.current = dur;
    timerRef.current = setTimeout(() => {
      setStep(prev => {
        if (prev < STEPS.length - 1) return prev + 1;
        finish();
        return prev;
      });
    }, dur);
  }, [finish]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      const elapsed = Date.now() - startTimeRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    }
  }, []);

  const resumeTimer = useCallback(() => {
    if (!timerRef.current && remainingRef.current > 0) {
      startTimer(remainingRef.current);
    }
  }, [startTimer]);

  // Pause on hover
  useEffect(() => {
    if (hovered) pauseTimer();
    else if (step >= 0) resumeTimer();
  }, [hovered, step, pauseTimer, resumeTimer]);

  // Progress bar animation
  useEffect(() => {
    if (step < 0) return;
    setProgress(0);
    const dur = STEPS[step]?.duration || 4000;
    const interval = setInterval(() => {
      if (hovered) return;
      const elapsed = Date.now() - startTimeRef.current;
      setProgress(Math.min(1, elapsed / dur));
    }, 50);
    return () => clearInterval(interval);
  }, [step, hovered]);

  // ---- Igris movement ----
  // Position Igris so he NEVER covers the highlighted element.
  // Strategy: place Igris in the largest free area around the element.
  const moveIgrisTo = useCallback((el) => {
    let nx, ny;
    if (!el) {
      nx = window.innerWidth / 2;
      ny = window.innerHeight * 0.35;
    } else {
      const r = el.getBoundingClientRect();
      const vw = window.innerWidth, vh = window.innerHeight;
      const pad = 120; // distance from element edge

      // Measure free space around the element
      const spaceAbove = r.top;
      const spaceBelow = vh - r.bottom;
      const spaceLeft = r.left;
      const spaceRight = vw - r.right;

      const best = Math.max(spaceAbove, spaceBelow, spaceLeft, spaceRight);
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;

      if (best === spaceBelow && spaceBelow > pad) {
        nx = cx; ny = r.bottom + pad;
      } else if (best === spaceAbove && spaceAbove > pad) {
        nx = cx; ny = r.top - pad;
      } else if (best === spaceLeft && spaceLeft > pad) {
        nx = r.left - pad; ny = cy;
      } else if (best === spaceRight && spaceRight > pad) {
        nx = r.right + pad; ny = cy;
      } else {
        // Fallback: below element
        nx = cx; ny = r.bottom + 80;
      }
      nx = Math.max(60, Math.min(vw - 60, nx));
      ny = Math.max(60, Math.min(vh - 100, ny));
    }
    setIgrisDir(() => {
      const dx = nx - igrisPos.x, dy = ny - igrisPos.y;
      return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    });
    setIsMoving(true);
    setIgrisPos({ x: nx, y: ny });
    setTimeout(() => setIsMoving(false), 700);
  }, [igrisPos]);

  // ---- Highlight ----
  const clearHL = () => {
    document.querySelectorAll('.drawberu-tuto-hl').forEach(el => {
      el.classList.remove('drawberu-tuto-hl');
      el.style.outline = '';
      el.style.outlineOffset = '';
      el.style.boxShadow = '';
      el.style.zIndex = '';
    });
  };

  const doHighlight = useCallback((selector, glow) => {
    clearHL();
    if (!selector) return null;
    for (const sel of selector.split(',').map(s => s.trim())) {
      try {
        const el = document.querySelector(sel);
        if (el) {
          el.classList.add('drawberu-tuto-hl');
          el.style.outline = `3px solid ${glow ? '#00ff00' : '#00d4ff'}`;
          el.style.outlineOffset = '4px';
          el.style.boxShadow = `0 0 25px ${glow ? 'rgba(0,255,0,0.6)' : 'rgba(0,212,255,0.5)'}`;
          el.style.zIndex = '10001';
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
          return el;
        }
      } catch {}
    }
    return null;
  }, []);

  // ---- Demo: animate scribbling on canvas with auto-pipette colors ----
  const demoAnimRef = useRef(null);

  const runDemo = useCallback(() => {
    const d = demoRef?.current;
    if (!d || !d.layersRef?.current?.[0] || !d.canvasRef?.current) return;

    const layerCanvas = d.layersRef.current[0]; // draw on layer 0 (Base)
    const ctx = layerCanvas.getContext('2d');
    const cw = layerCanvas.width;
    const ch = layerCanvas.height;
    const cachedData = d.refImageDataCacheRef?.current;
    const brushSize = Math.max(6, Math.min(14, cw * 0.015));

    const paths = generateScribblePaths(cw, ch, 6);
    const allPoints = paths.flat();
    let idx = 0;
    const pointsPerFrame = 3;

    const animate = () => {
      for (let f = 0; f < pointsPerFrame && idx < allPoints.length; f++, idx++) {
        const pt = allPoints[idx];
        const color = getRefColor(cachedData, pt.x, pt.y, cw, ch);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, brushSize, 0, 2 * Math.PI);
        ctx.fill();
      }
      d.renderLayers();

      if (idx < allPoints.length) {
        demoAnimRef.current = requestAnimationFrame(animate);
      } else {
        // Done drawing — wait 1.5s then erase
        setTimeout(() => {
          ctx.clearRect(0, 0, cw, ch);
          d.renderLayers();
        }, 1500);
      }
    };

    demoAnimRef.current = requestAnimationFrame(animate);
  }, [demoRef]);

  // ---- Step execution ----
  useEffect(() => {
    if (step < 0 || step >= STEPS.length) return;
    const s = STEPS[step];

    // Cancel any ongoing demo animation from a previous step
    if (demoAnimRef.current) {
      cancelAnimationFrame(demoAnimRef.current);
      demoAnimRef.current = null;
    }

    const t = setTimeout(() => {
      if (s.demo) {
        // Demo step: highlight canvas, position Igris, then scribble
        const canvasEl = document.querySelector('canvas');
        if (canvasEl) {
          doHighlight('canvas', false);
          moveIgrisTo(canvasEl);
        } else {
          clearHL();
          moveIgrisTo(null);
        }
        // Start scribbling after a short delay so user sees the message
        setTimeout(() => runDemo(), 800);
      } else if (s.highlight && s.selector) {
        const el = doHighlight(s.selector, s.glow);
        moveIgrisTo(el);
      } else {
        clearHL();
        moveIgrisTo(null);
      }
      startTimer(s.duration || 4000);
    }, 100);
    return () => {
      clearTimeout(t);
      if (demoAnimRef.current) {
        cancelAnimationFrame(demoAnimRef.current);
        demoAnimRef.current = null;
      }
    };
  }, [step]);

  // Cleanup on unmount: cancel demo, clear highlights, clear timers, erase demo strokes
  useEffect(() => () => {
    clearHL();
    if (timerRef.current) clearTimeout(timerRef.current);
    if (demoAnimRef.current) cancelAnimationFrame(demoAnimRef.current);
    // Erase any demo strokes left on the canvas
    const d = demoRef?.current;
    if (d?.layersRef?.current?.[0]) {
      const lc = d.layersRef.current[0];
      lc.getContext('2d').clearRect(0, 0, lc.width, lc.height);
      d.renderLayers();
    }
  }, []);

  const accept = () => { setShowNotif(false); setStep(0); };
  const next = () => { pauseTimer(); setStep(prev => prev < STEPS.length - 1 ? prev + 1 : (finish(), prev)); };
  const prev = () => { pauseTimer(); setStep(prev => Math.max(0, prev - 1)); };

  const s = STEPS[step];

  // Bubble above Igris, clamped to viewport
  const bx = Math.max(12, Math.min(igrisPos.x - 140, window.innerWidth - 300));
  const byAbove = igrisPos.y - 160;
  const byBelow = igrisPos.y + 60;
  // If Igris is high enough, bubble above; otherwise below
  const by = byAbove > 20 ? byAbove : byBelow;

  return (
    <>
      {/* Inject inline styles for highlight animation */}
      <style>{`
        .drawberu-tuto-hl { animation: _dtHL 1.5s infinite !important; position: relative !important; }
        @keyframes _dtHL {
          0%,100% { outline-offset: 4px; }
          50% { outline-offset: 7px; }
        }
      `}</style>

      <div className="fixed inset-0 z-[99990] pointer-events-none">
        {/* Light backdrop */}
        <div className="absolute inset-0 bg-black/25 pointer-events-auto" style={{ backdropFilter: 'blur(1px)' }} />

        {/* System notification (first time) */}
        {showNotif && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-[99999]">
            <div className="bg-[#000a1e]/98 border-2 border-[#00d4ff] p-8 max-w-[460px] w-full mx-4 shadow-[0_0_60px_rgba(0,212,255,0.4)]"
              style={{ animation: 'systemAppear 0.4s ease-out' }}>
              <div className="flex items-center gap-3 mb-5 pb-4 border-b-2 border-[#00d4ff]/30">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#0099cc] shadow-[0_0_20px_rgba(0,212,255,0.8)] flex items-center justify-center">
                  <span className="text-white font-bold text-lg">!</span>
                </div>
                <h2 className="text-[#00d4ff] text-xl font-bold uppercase tracking-widest" style={{ textShadow: '0 0 10px rgba(0,212,255,0.8)' }}>
                  FORMATION SPECIALE
                </h2>
              </div>
              <div className="text-white text-center text-base leading-relaxed mb-6">
                L'Ombre <strong className="text-[#00d4ff]">Igris</strong> souhaite t'enseigner l'art du coloriage.
                <br />
                <span className="text-red-400 font-bold animate-pulse">Technique secrete du Pinceau Magique incluse.</span>
                <br /><br />
                <strong>Accepter la formation ?</strong>
              </div>
              <div className="flex gap-6 justify-center">
                <button onClick={accept} className="px-8 py-3 border-2 border-green-500 text-green-400 font-bold uppercase tracking-wider hover:bg-green-500/20 transition-all" style={{ textShadow: '0 0 10px rgba(0,255,0,0.8)' }}>
                  ACCEPTER
                </button>
                <button onClick={finish} className="px-8 py-3 border-2 border-red-500 text-red-400 font-bold uppercase tracking-wider hover:bg-red-500/20 transition-all" style={{ textShadow: '0 0 10px rgba(255,68,68,0.8)' }}>
                  PLUS TARD
                </button>
              </div>
            </div>
          </div>
        )}

        {step >= 0 && s && (
          <>
            {/* Igris sprite */}
            <div className={`fixed z-[99995] pointer-events-none transition-all duration-700 ${isMoving ? '' : ''}`}
              style={{ left: igrisPos.x, top: igrisPos.y, transform: 'translate(-50%, -50%)' }}>
              <img src={IGRIS_IMAGES[igrisDir]} alt="Igris" width="90" height="90" loading="lazy"
                className="drop-shadow-[0_0_15px_rgba(138,43,226,0.8)]"
                style={{ animation: 'floatAnimation 3s ease-in-out infinite' }}
              />
            </div>

            {/* Dialogue bubble — z-index tres haut */}
            {s.message && (
              <div className="fixed z-[99996] pointer-events-none" style={{ left: bx, top: by, animation: 'fadeIn 0.3s ease-out' }}>
                <div className={`border-2 rounded-xl px-4 py-3 max-w-[280px] shadow-xl ${
                  s.accent
                    ? 'bg-[#0a1a0a]/95 border-green-400 shadow-green-500/30'
                    : 'bg-[#060e1f]/95 border-[#00d4ff] shadow-cyan-500/20'
                }`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${s.accent ? 'bg-green-400' : 'bg-[#00d4ff]'}`} />
                    <span className={`text-[9px] uppercase tracking-[2px] font-bold ${s.accent ? 'text-green-400' : 'text-[#00d4ff]'}`}>IGRIS</span>
                  </div>
                  <p className="text-white text-xs leading-relaxed">{s.message}</p>
                  {s.accent && (
                    <div className="mt-2 text-[10px] text-green-400 font-bold animate-pulse text-center tracking-wider">
                      {s.demo ? 'DEMONSTRATION EN COURS...' : "GRIBOUILLE = CHEF-D'OEUVRE"}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mini controls — compact, expand on hover */}
            <div
              className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[99997] pointer-events-auto"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              <div className={`flex items-center bg-[#000a1e]/95 border border-[#00d4ff]/40 rounded-full overflow-hidden transition-all duration-300 shadow-lg ${
                hovered ? 'gap-0 shadow-[0_0_25px_rgba(0,212,255,0.3)]' : 'gap-0'
              }`}>
                {/* Step dots (always visible) */}
                <div className="flex items-center gap-1 px-3 py-2">
                  {STEPS.map((_, i) => (
                    <div key={i} className={`rounded-full transition-all duration-300 ${
                      i === step
                        ? 'w-4 h-1.5 bg-[#00d4ff]'
                        : i < step
                          ? 'w-1.5 h-1.5 bg-[#00d4ff]/60'
                          : 'w-1.5 h-1.5 bg-white/20'
                    }`} />
                  ))}
                </div>

                {/* Progress ring on current step number */}
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <svg className="absolute inset-0 w-8 h-8 -rotate-90">
                    <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(0,212,255,0.15)" strokeWidth="2" />
                    <circle cx="16" cy="16" r="12" fill="none" stroke="#00d4ff" strokeWidth="2"
                      strokeDasharray={`${2 * Math.PI * 12}`}
                      strokeDashoffset={`${2 * Math.PI * 12 * (1 - progress)}`}
                      className="transition-all duration-100"
                    />
                  </svg>
                  <span className="text-[#00d4ff] text-[10px] font-bold relative">{step + 1}</span>
                </div>

                {/* Expanded controls (visible on hover) */}
                <div className={`flex items-center overflow-hidden transition-all duration-300 ${
                  hovered ? 'max-w-[250px] opacity-100' : 'max-w-0 opacity-0'
                }`}>
                  <button onClick={prev} disabled={step === 0}
                    className="text-[#00d4ff]/60 hover:text-[#00d4ff] disabled:text-white/20 text-xs font-bold px-3 py-2 transition-colors whitespace-nowrap">
                    &#9664; RETOUR
                  </button>
                  <button onClick={next}
                    className="text-green-400 hover:text-green-300 text-xs font-bold px-3 py-2 transition-colors whitespace-nowrap">
                    {step === STEPS.length - 1 ? 'TERMINER' : 'SUIVANT &#9654;'}
                  </button>
                  <div className="w-px h-4 bg-white/10" />
                  <button onClick={finish}
                    className="text-red-400/60 hover:text-red-400 text-xs font-bold px-3 py-2 transition-colors whitespace-nowrap">
                    &#10005;
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes floatAnimation { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes systemAppear { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </>
  );
};

export default DrawBeruTutorial;
