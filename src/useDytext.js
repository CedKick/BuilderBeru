// useDyText.js - Version 2.0 🚀
// Animation de texte fluide avec requestAnimationFrame + easing

import { useEffect } from "react";

// 🔧 Map global pour tracker les animations en cours
const activeAnimations = new Map();

// 🎭 PERSONNALITÉS - Vitesse et style par entité
// ⚡ PERF: Valeurs réduites pour affichage plus rapide du texte
export const DYTEXT_PERSONALITIES = {
  tank: {
    baseSpeed: 15,        // Rapide et chaotique (était 25)
    variance: 10,         // Beaucoup de variation
    pauseMultiplier: 0.3, // Pauses très courtes
    easing: 'bounce',     // Style rebondissant
  },
  beru: {
    baseSpeed: 25,        // Calme et précis (était 40)
    variance: 5,          // Peu de variation
    pauseMultiplier: 0.8, // Pauses modérées
    easing: 'smooth',     // Style fluide
  },
  beru_papillon: {
    baseSpeed: 20,        // Élégant (était 35)
    variance: 5,
    pauseMultiplier: 0.6,
    easing: 'smooth',
  },
  kaisel: {
    baseSpeed: 12,        // Très rapide, nerveux (était 20)
    variance: 10,
    pauseMultiplier: 0.2,
    easing: 'sharp',
  },
  igris: {
    baseSpeed: 30,        // Lent, solennel (était 50)
    variance: 3,
    pauseMultiplier: 1.0,
    easing: 'smooth',
  },
  igrisk: {
    baseSpeed: 18,        // (était 30)
    variance: 15,         // Très erratique
    pauseMultiplier: 0.5,
    easing: 'glitch',     // Style glitch
  },
  berserker: {
    baseSpeed: 10,        // Ultra rapide (était 15)
    variance: 5,
    pauseMultiplier: 0.2,
    easing: 'sharp',
  },
  default: {
    baseSpeed: 20,        // (était 35)
    variance: 5,
    pauseMultiplier: 0.6,
    easing: 'smooth',
  }
};

// 🎨 Fonctions d'easing
const easingFunctions = {
  smooth: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  bounce: (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  sharp: (t) => t * t * t,
  glitch: (t) => Math.random() > 0.1 ? t : t + (Math.random() - 0.5) * 0.3,
  linear: (t) => t,
};

// 🔗 FONCTION POUR PARSER LES LIENS (optimisée - une seule fois)
const parseTextWithLinks = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline transition-colors">${url}</a>`;
  });
};

// 🎯 Parse le texte avec formatage (une seule fois au début)
const parseFormattedText = (text) => {
  return parseTextWithLinks(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-yellow-400">$1</strong>')
    .replace(/\n/g, '<br>');
};

// 🔥 FONCTION dytextAnimate V2 - Avec requestAnimationFrame
export function dytextAnimate(ref, text = "", delay = 35, options = {}) {
  if (!ref?.current || !text) return () => {};

  const el = ref.current;
  const {
    onComplete,
    personality = 'default',
    showCursor = true,
  } = options;

  // Récupérer la personnalité
  const personalityConfig = DYTEXT_PERSONALITIES[personality] || DYTEXT_PERSONALITIES.default;
  const effectiveDelay = delay || personalityConfig.baseSpeed;

  // 🔧 Créer un ID unique et un AbortController pour cette animation
  const animationId = `dytext-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const abortController = new AbortController();

  // 🔧 Annuler toute animation existante sur cet élément
  activeAnimations.forEach((data, id) => {
    if (data.element === el) {
      data.abort();
      activeAnimations.delete(id);
    }
  });

  // Enregistrer cette animation
  activeAnimations.set(animationId, {
    element: el,
    abort: () => abortController.abort(),
  });

  // État de l'animation
  let charIndex = 0;
  let lastTime = 0;
  let accumulatedTime = 0;
  let isPaused = false;
  let pauseEndTime = 0;
  const totalChars = text.length;

  // Pré-parser le texte formaté
  const formattedText = parseFormattedText(text);

  // Nettoyer l'élément
  el.innerHTML = showCursor ? '<span class="dytext-cursor">|</span>' : '';

  // 🎬 Fonction d'animation principale avec RAF
  const animate = (currentTime) => {
    // Vérifier si l'animation a été annulée
    if (abortController.signal.aborted) {
      return;
    }

    // Initialiser lastTime
    if (!lastTime) {
      lastTime = currentTime;
    }

    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // Gérer les pauses (pour . , etc.)
    if (isPaused) {
      if (currentTime >= pauseEndTime) {
        isPaused = false;
      } else {
        requestAnimationFrame(animate);
        return;
      }
    }

    // Accumuler le temps
    accumulatedTime += deltaTime;

    // Calculer le délai avec variance pour ce caractère
    const variance = (Math.random() - 0.5) * personalityConfig.variance;
    const charDelay = Math.max(10, effectiveDelay + variance);

    // Est-ce qu'on doit afficher un nouveau caractère ?
    if (accumulatedTime >= charDelay) {
      accumulatedTime = 0;

      if (charIndex < totalChars) {
        const char = text.charAt(charIndex);

        // Gérer les caractères spéciaux avec pauses
        if (char === '.') {
          charIndex++;
          isPaused = true;
          pauseEndTime = currentTime + (300 * personalityConfig.pauseMultiplier);
          updateDisplay();
          requestAnimationFrame(animate);
          return;
        }

        if (char === ',') {
          charIndex++;
          isPaused = true;
          pauseEndTime = currentTime + (150 * personalityConfig.pauseMultiplier);
          updateDisplay();
          requestAnimationFrame(animate);
          return;
        }

        if (char === '!' || char === '?') {
          charIndex++;
          isPaused = true;
          pauseEndTime = currentTime + (200 * personalityConfig.pauseMultiplier);
          updateDisplay();
          requestAnimationFrame(animate);
          return;
        }

        if (char === '~') {
          charIndex++;
          isPaused = true;
          pauseEndTime = currentTime + (100 * personalityConfig.pauseMultiplier);
          updateDisplay();
          requestAnimationFrame(animate);
          return;
        }

        // Caractère spécial § = effacer tout
        if (char === '§') {
          charIndex++;
          // Animation de suppression rapide
          const deleteAnimation = () => {
            if (abortController.signal.aborted) return;
            const currentText = el.textContent.replace('|', '');
            if (currentText.length > 0) {
              el.innerHTML = currentText.slice(0, -1) + (showCursor ? '<span class="dytext-cursor">|</span>' : '');
              setTimeout(deleteAnimation, 30);
            } else {
              requestAnimationFrame(animate);
            }
          };
          deleteAnimation();
          return;
        }

        charIndex++;
        updateDisplay();
      }
    }

    // Continuer l'animation ou terminer
    if (charIndex < totalChars) {
      requestAnimationFrame(animate);
    } else {
      // Animation terminée !
      finishAnimation();
    }
  };

  // 🎨 Mettre à jour l'affichage
  const updateDisplay = () => {
    const visibleText = text.substring(0, charIndex);
    const displayText = parseFormattedText(visibleText);

    // Ajouter le curseur clignotant si activé
    if (showCursor && charIndex < totalChars) {
      el.innerHTML = displayText + '<span class="dytext-cursor">|</span>';
    } else {
      el.innerHTML = displayText;
    }
  };

  // ✅ Terminer l'animation proprement
  const finishAnimation = () => {
    // Afficher le texte final sans curseur
    el.innerHTML = formattedText;

    // Nettoyer
    activeAnimations.delete(animationId);

    // Callback
    if (onComplete) {
      onComplete();
    }
  };

  // 🚀 Démarrer l'animation
  requestAnimationFrame(animate);

  // 🧹 Retourner la fonction de cleanup
  return () => {
    abortController.abort();
    activeAnimations.delete(animationId);
  };
}

// 🔥 Version simplifiée pour les messages courts (sans RAF, plus léger)
export function dytextAnimateSimple(ref, text = "", delay = 35, options = {}) {
  if (!ref?.current || !text) return () => {};

  const el = ref.current;
  const { onComplete, personality = 'default' } = options;

  const personalityConfig = DYTEXT_PERSONALITIES[personality] || DYTEXT_PERSONALITIES.default;
  const effectiveDelay = delay || personalityConfig.baseSpeed;

  let cancelled = false;
  let charIndex = 0;
  let timeoutId = null;

  el.innerHTML = '';

  const writeNext = () => {
    if (cancelled || charIndex >= text.length) {
      if (!cancelled) {
        el.innerHTML = parseFormattedText(text);
        if (onComplete) onComplete();
      }
      return;
    }

    const char = text.charAt(charIndex);
    charIndex++;

    // Afficher le texte actuel
    el.innerHTML = parseFormattedText(text.substring(0, charIndex));

    // Calculer le délai pour le prochain caractère
    let nextDelay = effectiveDelay + (Math.random() - 0.5) * personalityConfig.variance;

    if (char === '.') nextDelay += 250 * personalityConfig.pauseMultiplier;
    else if (char === ',') nextDelay += 100 * personalityConfig.pauseMultiplier;
    else if (char === '!' || char === '?') nextDelay += 150 * personalityConfig.pauseMultiplier;

    timeoutId = setTimeout(writeNext, Math.max(10, nextDelay));
  };

  writeNext();

  return () => {
    cancelled = true;
    if (timeoutId) clearTimeout(timeoutId);
  };
}

// 🔥 FONCTION SERN (inchangée mais optimisée)
export function dytextAnimateSERN(ref, text = "", delay = 30, options = {}) {
  return dytextAnimate(ref, text, delay, {
    ...options,
    personality: 'igrisk',
    showCursor: false,
  });
}

// 🧹 Fonction utilitaire pour nettoyer toutes les animations
export function cleanupAllAnimations() {
  activeAnimations.forEach((data) => {
    if (data.abort) data.abort();
  });
  activeAnimations.clear();
}

// 📝 Fonctions de parsing narratif (inchangées)
export function parseNarrative(rawText) {
  const lines = rawText.split('\n').map(line => line.trim()).filter(Boolean);
  const steps = [];

  for (const line of lines) {
    if (line.startsWith('{sound:')) {
      const match = line.match(/\{sound:(.+?)\}/);
      if (match) {
        steps.push({ type: 'sound', src: match[1].trim() });
      }
    }
    else if (line.startsWith('{img:')) {
      const fullMatch = line.match(/\{img:([^\s]+)((?:\s+\w+=["']?[^\s"'}]+["']?)*)\}/);
      if (fullMatch) {
        const src = fullMatch[1];
        const attrString = fullMatch[2] || '';
        const refMatch = attrString.match(/ref=([^\s"'}]+)/);
        const sizeMatch = attrString.match(/size=([^\s"'}]+)/);
        const classMatch = attrString.match(/class=([^\s"'}]+)/);
        steps.push({
          type: 'img',
          src: src.trim(),
          ref: refMatch ? refMatch[1] : 'mainImage',
          size: sizeMatch ? parseInt(sizeMatch[1], 10) : undefined,
          class: classMatch ? classMatch[1] : '',
        });
      }
    }
    else if (line.startsWith('{delay=')) {
      const match = line.match(/\{delay=(\d+)\}/);
      if (match) {
        steps.push({ type: 'delay', duration: parseInt(match[1], 10) });
      }
    }
    else {
      steps.push({ type: 'text', content: line });
    }
  }

  return steps;
}

export function runNarrativeSteps(steps, {
  refs,
  setCurrentImage,
  dytextRef,
  setShowNarrative,
  triggerFadeOutMusic,
  playingAudiosRef
}) {
  let currentIndex = 0;
  let currentAnimationCleanup = null;

  const runNext = () => {
    if (currentIndex >= steps.length) {
      setShowNarrative(false);
      triggerFadeOutMusic?.();
      return;
    }

    const step = steps[currentIndex];
    currentIndex++;

    let delayForNext = 1000;

    switch (step.type) {
      case 'text':
        if (currentAnimationCleanup) {
          currentAnimationCleanup();
        }
        currentAnimationCleanup = dytextAnimate(dytextRef, step.content, 30, {
          onComplete: () => setTimeout(runNext, delayForNext),
        });
        return;

      case 'sound':
        const audio = new Audio(step.src);
        playingAudiosRef.current.push(audio);
        audio.play();
        break;

      case 'img':
        const imageRef = refs[step.ref];
        if (imageRef) {
          setCurrentImage({
            src: step.src,
            size: step.size,
            class: step.class || '',
          });
        }
        break;

      case 'delay':
        delayForNext = step.duration;
        break;

      default:
        break;
    }

    setTimeout(runNext, delayForNext);
  };

  runNext();
}

// 🎨 CSS pour le curseur clignotant (à ajouter dans le CSS global ou via style tag)
export const DYTEXT_CURSOR_STYLE = `
  .dytext-cursor {
    animation: dytext-blink 0.7s infinite;
    color: inherit;
    font-weight: normal;
  }

  @keyframes dytext-blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`;
