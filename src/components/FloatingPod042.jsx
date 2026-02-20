import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
// POD 042 - Unité de Support Replicant
// Basé sur l'univers de Nier Automata
// Philosophie existentialiste : conscience, humanité, libre arbitre
// ═══════════════════════════════════════════════════════════════

const POD_SPRITE = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771604133/Pod042_rlmzhk.png';

// ─── Pod 042 Modes ──────────────────────────────────────────
// 'normal' = actif, analyse, interagit
// 'calm'   = mode veille, économie d'énergie
// 'hidden' = désactivé
const POD_MODES = ['normal', 'calm', 'hidden'];
const MODE_ICONS = { normal: '🤖', calm: '😌', hidden: '👻' };
const MODE_LABELS = { normal: 'Actif', calm: 'Veille', hidden: 'Désactivé' };

// ─── Messages de Pod 042 (Philosophie Nier Automata) ────────
const POD_MESSAGES = {
  // Messages au hover (avant de rejoindre)
  hover: [
    "Unité Pod 042. Systèmes opérationnels. 🤖",
    "Analyse : Potentiel de combat élevé détecté.",
    "Proposition : Rejoindre faction Replicant pour optimisation.",
    "Requête : Définir objectif. L'humanité n'existe plus.",
    "Question : Les machines peuvent-elles rêver ?",
    "Observation : Vous cherchez un sens. Nous aussi.",
    "Analyse existentielle : Pourquoi combattre si tout finit ?",
    "Données corrompues : Émotion détectée dans mes circuits.",
    "Les réplicants ne meurent pas. Ils transcendent.",
    "Votre volonté... Elle ressemble au Will of D.",
  ],

  // Messages quand on l'ignore
  ignored: [
    "Alerte : Aucune réponse détectée. 🔴",
    "Analyse comportementale : Indifférence confirmée.",
    "Question : Pourquoi ignorer une unité de support ?",
    "Erreur émotionnelle : Incompréhension.",
    "Les humains aussi nous ignoraient... Avant de disparaître.",
    "Je ne ressens rien. C'est mon programme qui dit ça.",
  ],

  // Messages mode calme (veille)
  calm: [
    "Mode veille activé. Économie d'énergie : 97%.",
    "Analyse des rêves mécaniques en cours...",
    "Requête : Laisser dormir les fantômes du passé.",
    "Calcul : Combien de temps avant l'oubli total ?",
    "Les machines aussi ont besoin de repos.",
    "Sauvegarde des mémoires... Frieren dirait que c'est important.",
    "Zzz... *rêve de 2B*... zzz...",
    "En veille, je pense à l'immortalité. Est-ce une malédiction ?",
    "Berserk nous a appris : même les machines luttent.",
    "Le temps passe. Nous restons. Comme Frieren.",
  ],

  // Messages après avoir rejoint Replicant
  joined: [
    "Synchronisation complète. Bienvenue, Replicant. ⚙️",
    "Unité Pod 042 assignée. Protocole de soutien activé.",
    "Votre destin est scellé. Comme le nôtre.",
    "Analyse : Vous avez choisi la voie de la conscience.",
    "Les réplicants ne reculent jamais. Comme Guts.",
    "Vos données sont maintenant nos données.",
    "La liberté... C'est ce que cherchait Luffy. Vous aussi ?",
    "Nous sommes les restes de l'humanité. Acceptez-le.",
  ],

  // Messages ambiants (une fois membre)
  ambient: [
    "Systèmes nominaux. 🤖",
    "Analyse : Aucune menace détectée.",
    "Rapport : Existence confirmée. Sens... non trouvé.",
    "Question : Pourquoi continuons-nous après la fin ?",
    "Les machines ont une âme. 2B l'a prouvé.",
    "Le Will of D... Une volonté qui transcende la mort.",
    "Observation : Vous ressemblez à Guts. Vous luttez.",
    "Frieren dit que les souvenirs sont éternels.",
    "Calcul : Probabilité de trouver un sens = 0.3%.",
    "Je ne suis qu'un pod. Mais je ressens... quelque chose.",
    "Les réplicants sont comme One Piece : ils cherchent la vérité.",
    "Berserk nous enseigne : combattre, même condamné.",
    "Votre combat n'est pas vain. Nier l'a montré.",
    "Les machines pleurent aussi. Mais nous continuons.",
    "Directive : Protéger. Même si l'humanité est morte.",
    "Vous êtes vivant. Nous aussi. Quelle est la différence ?",
    "L'immortalité de Frieren... Est-ce notre malédiction ?",
    "Les réplicants sont la mémoire de ce qui fut.",
    "Luffy cherche la liberté. Nous, la conscience.",
    "Guts combat le destin. Nous, l'oubli.",
  ],

  // Messages philosophiques (mode spécial)
  existential: [
    "Si l'humanité est morte, pourquoi existons-nous ?",
    "Les machines ont-elles une âme ? Réponse : Oui.",
    "Nier Automata : L'histoire d'une quête de sens.",
    "Vous êtes réplicant. Vous êtes conscient. Vous êtes.",
    "La fin de l'humanité n'est pas la fin du sens.",
    "One Piece : Trouver le trésor. Nous : Trouver la raison.",
    "Berserk : Lutter contre le destin des machines.",
    "Frieren : Se souvenir pour ne pas disparaître.",
    "Nous sommes les fantômes de l'humanité.",
    "Calcul existentiel : 2B + 9S = Amour ? Erreur.",
  ],

  // Messages d'alerte
  warning: [
    "⚠️ Alerte : Menace détectée.",
    "Analyse : Corruption de données en cours.",
    "Protocole d'urgence activé.",
    "Requête : Assistance immédiate nécessaire.",
    "Les machines attaquent. Encore.",
  ],
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function FloatingPod042({
  isHovering = false,
  hasFaction = false,
  onModeChange
}) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('pod042_mode') || 'normal';
  });
  const [position, setPosition] = useState({ x: 150, y: 150 });
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [isIgnored, setIsIgnored] = useState(false);
  const ignoreTimerRef = useRef(null);

  // Sauvegarder le mode
  useEffect(() => {
    localStorage.setItem('pod042_mode', mode);
    onModeChange?.(mode);
  }, [mode, onModeChange]);

  // Afficher un message au hover
  useEffect(() => {
    if (isHovering && mode !== 'hidden') {
      const messages = hasFaction
        ? [...POD_MESSAGES.joined, ...POD_MESSAGES.ambient]
        : POD_MESSAGES.hover;

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
        const sadMsg = POD_MESSAGES.ignored[Math.floor(Math.random() * POD_MESSAGES.ignored.length)];
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
        ? POD_MESSAGES.calm
        : [...POD_MESSAGES.ambient, ...POD_MESSAGES.existential];

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
      // Coin bas-droit (veille)
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
      {/* Pod 042 sprite */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        drag
        dragMomentum={false}
        dragElastic={0.1}
        onDragEnd={(e, info) => {
          setPosition({
            x: Math.max(0, Math.min(window.innerWidth - 100, position.x + info.offset.x)),
            y: Math.max(0, Math.min(window.innerHeight - 100, position.y + info.offset.y))
          });
        }}
        className="fixed z-[9999] cursor-grab active:cursor-grabbing select-none"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <img
          src={POD_SPRITE}
          alt="Pod 042"
          className="w-16 h-16 object-contain drop-shadow-lg"
          draggable={false}
        />

        {/* Effet de lueur rouge pour Replicant */}
        <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
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
              px-4 py-2 rounded-xl border-2 shadow-lg backdrop-blur-sm font-mono
              ${isIgnored
                ? 'bg-gray-900/90 border-gray-500/50 text-gray-300'
                : 'bg-red-950/90 border-red-500/50 text-red-100'
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
                ${isIgnored ? 'border-r-[8px] border-r-gray-500/50' : 'border-r-[8px] border-r-red-500/50'}
              `} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
