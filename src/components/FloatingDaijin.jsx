import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
// DAIJIN - Gardien de Vox Cordis
// Mascotte de faction basée sur l'univers de Suzume
// ═══════════════════════════════════════════════════════════════

const DAIJIN_SPRITE = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771602808/Daijin_p1pvcs.png';

// ─── Daijin Modes ──────────────────────────────────────────
// 'normal' = apparaît et interagit
// 'calm'   = assis dans un coin, messages zen
// 'hidden' = invisible
const DAIJIN_MODES = ['normal', 'calm', 'hidden'];
const MODE_ICONS = { normal: '🐱', calm: '😌', hidden: '👻' };
const MODE_LABELS = { normal: 'Normal', calm: 'Zen', hidden: 'Caché' };

// ─── Messages de Daijin (Lore Suzume) ────────────────────
const DAIJIN_MESSAGES = {
  // Messages au hover (avant de rejoindre)
  hover: [
    "Veux-tu jouer avec moi ? 🎭",
    "Je garde les portes entre les mondes...",
    "Les tremblements de terre... je les sens venir...",
    "Ton cœur entend ce que l'univers murmure.",
    "Ne t'inquiète pas, je veille sur toi.",
    "Les clés des portes sont entre mes pattes...",
    "Le destin nous a réunis ici.",
    "Tu sens cette vibration ? C'est la terre qui parle.",
  ],

  // Messages quand on l'ignore (triste)
  ignored: [
    "Tu m'ignores...? 😢",
    "Je suis juste un gardien solitaire...",
    "*miaule tristement*",
    "Les portes se ferment... comme ton cœur.",
    "Même les gardiens ont besoin d'affection...",
  ],

  // Messages mode calme (zen, méditation)
  calm: [
    "Je médite sur l'équilibre du monde...",
    "*dort paisiblement*",
    "La paix règne quand les portes sont fermées.",
    "Mmmh... cette sieste est divine.",
    "Je rêve de portes qui ne tremblent jamais...",
    "Le calme avant la tempête... ou juste le calme.",
    "Zzz... *rêve de Suzume*... zzz...",
    "Mode zen activé. Aucun chat n'a été plus serein.",
    "*ronronne doucement*",
    "La terre ne tremble pas quand je dors.",
  ],

  // Messages après avoir rejoint Vox Cordis
  joined: [
    "Bienvenue dans la famille, chasseur !",
    "Le cœur de Vox Cordis bat avec le tien.",
    "Tu as fait le bon choix. La voix du cœur ne ment jamais.",
    "Ensemble, nous garderons l'équilibre.",
    "Je serai toujours à tes côtés.",
    "Les portes sont scellées. Nous sommes en sécurité.",
    "Ton aura est alignée avec Vox Cordis.",
    "Je sens une grande force en toi, chasseur.",
  ],

  // Messages ambiants (une fois membre)
  ambient: [
    "Miaou~ 🐱",
    "Les portes tiennent bon aujourd'hui.",
    "*secoue ses clochettes*",
    "Tu sens cette vibration ? Normal. C'est juste la terre qui respire.",
    "Suzume serait fière de toi.",
    "*observe les étoiles*",
    "Chaque chasseur a son rôle. Le tien est important.",
    "Les Messagers Félins approuvent ton choix.",
    "Je garde un œil sur les fissures du temps.",
    "*se lèche la patte*",
    "La voix du cœur résonne en toi.",
    "Tant que je suis là, aucun séisme ne te touchera.",
    "Tu veux jouer ? J'ai du temps avant la prochaine ronde de garde.",
    "Les clés des mondes sont lourdes... mais je les porte avec fierté.",
    "*regarde au loin* Quelque chose approche... non, fausse alerte.",
  ],

  // Messages de mise en garde
  warning: [
    "Attention ! La terre va trembler !",
    "Une porte s'entrouvre... je dois la sceller !",
    "Le Ver va sortir ! Préparons-nous !",
    "Je sens une distorsion... *oreilles qui se dressent*",
  ],
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function FloatingDaijin({
  isHovering = false,
  hasFaction = false,
  onModeChange
}) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('daijin_mode') || 'normal';
  });
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [isIgnored, setIsIgnored] = useState(false);
  const ignoreTimerRef = useRef(null);

  // Sauvegarder le mode
  useEffect(() => {
    localStorage.setItem('daijin_mode', mode);
    onModeChange?.(mode);
  }, [mode, onModeChange]);

  // Afficher un message au hover
  useEffect(() => {
    if (isHovering && mode !== 'hidden') {
      const messages = hasFaction
        ? [...DAIJIN_MESSAGES.joined, ...DAIJIN_MESSAGES.ambient]
        : DAIJIN_MESSAGES.hover;

      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      setMessage(randomMsg);
      setShowMessage(true);
      setIsIgnored(false);

      // Masquer après 5 secondes
      const timer = setTimeout(() => setShowMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isHovering, hasFaction, mode]);

  // Détecter si on est ignoré (hover mais pas d'interaction)
  useEffect(() => {
    if (isHovering && !showMessage && mode !== 'hidden') {
      ignoreTimerRef.current = setTimeout(() => {
        setIsIgnored(true);
        const sadMsg = DAIJIN_MESSAGES.ignored[Math.floor(Math.random() * DAIJIN_MESSAGES.ignored.length)];
        setMessage(sadMsg);
        setShowMessage(true);

        setTimeout(() => setShowMessage(false), 4000);
      }, 8000); // Après 8 secondes sans interaction
    } else {
      if (ignoreTimerRef.current) {
        clearTimeout(ignoreTimerRef.current);
      }
      setIsIgnored(false);
    }

    return () => {
      if (ignoreTimerRef.current) {
        clearTimeout(ignoreTimerRef.current);
      }
    };
  }, [isHovering, showMessage, mode]);

  // Messages ambiants pour les membres de la faction
  useEffect(() => {
    if (!hasFaction || mode === 'hidden' || isHovering) return;

    const interval = setInterval(() => {
      const messages = mode === 'calm'
        ? DAIJIN_MESSAGES.calm
        : DAIJIN_MESSAGES.ambient;

      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      setMessage(randomMsg);
      setShowMessage(true);

      setTimeout(() => setShowMessage(false), 4000);
    }, 20000); // Toutes les 20 secondes

    return () => clearInterval(interval);
  }, [hasFaction, mode, isHovering]);

  // Position selon le mode
  useEffect(() => {
    if (mode === 'calm') {
      setPosition({ x: window.innerWidth - 120, y: window.innerHeight - 120 });
    } else if (mode === 'normal' && !isHovering) {
      // Position aléatoire pour le mode normal
      setPosition({
        x: Math.random() * (window.innerWidth - 100),
        y: Math.random() * (window.innerHeight - 100),
      });
    }
  }, [mode, isHovering]);

  if (mode === 'hidden') return null;

  return (
    <>
      {/* Daijin sprite */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        className="fixed z-[9999] pointer-events-none select-none"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <img
          src={DAIJIN_SPRITE}
          alt="Daijin"
          className="w-16 h-16 object-contain drop-shadow-lg"
          draggable={false}
        />

        {/* Effet de lueur bleue pour Vox Cordis */}
        <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl animate-pulse" />
      </motion.div>

      {/* Message bubble */}
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
            <div className={`
              px-4 py-2 rounded-xl border-2 shadow-lg backdrop-blur-sm
              ${isIgnored
                ? 'bg-gray-900/90 border-gray-500/50 text-gray-300'
                : 'bg-blue-900/90 border-blue-400/50 text-blue-100'
              }
            `}>
              <p className="text-xs font-medium leading-relaxed whitespace-pre-line">
                {message}
              </p>
              {/* Triangle pointer */}
              <div className={`
                absolute left-[-8px] top-1/2 -translate-y-1/2 w-0 h-0
                border-t-[6px] border-t-transparent
                border-b-[6px] border-b-transparent
                ${isIgnored ? 'border-r-[8px] border-r-gray-500/50' : 'border-r-[8px] border-r-blue-400/50'}
              `} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
