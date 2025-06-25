// useDyText.js
import { useEffect } from "react";

// 🔥 MODIFIE ta fonction dytextAnimate dans useDytext.js

export function dytextAnimate(ref, text = "", delay = 30, options = {}) {
  if (!ref?.current || !text) return;

  const el = ref.current;
  let i = 0;
  el.textContent = "";

  // 🎯 FONCTION AUTOSCROLL INTELLIGENTE
  const autoScrollToBottom = () => {
    // Cherche le conteneur scrollable (popup SERN)
    const scrollContainer = document.getElementById('sern-text-container') || 
                           el.closest('.overflow-y-auto') ||
                           el.closest('.max-h-\\[40vh\\]') ||
                           el.parentElement;
    
    if (scrollContainer) {
      // ✨ SCROLL SMOOTH vers le bas
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const writeNext = () => {
    const char = text.charAt(i);

    if (char === ".") {
      setTimeout(writeNext, 400);
      i++;
      return;
    }

    if (char === ",") {
      setTimeout(writeNext, 200);
      i++;
      return;
    }

    if (char === "§") {
      let current = el.textContent;
      const delInterval = setInterval(() => {
        current = current.slice(0, -1);
        el.textContent = current;
        autoScrollToBottom(); // 🔥 SCROLL pendant la suppression
        if (current.length === 0) {
          clearInterval(delInterval);
          i++;
          setTimeout(writeNext, 200);
        }
      }, 50);
      return;
    }

    // 🎨 ÉCRITURE AVEC SUPPORT HTML + AUTOSCROLL
    if (options.useHTML) {
      el.innerHTML = text.substring(0, i + 1).replace(/\n/g, '<br>');
    } else {
      el.textContent = text.substring(0, i + 1);
    }
    
    i++;

    // 🚀 AUTOSCROLL À CHAQUE CARACTÈRE (mais optimisé)
    if (i % 5 === 0) { // Scroll tous les 5 caractères pour performance
      autoScrollToBottom();
    }

    if (i < text.length) {
      setTimeout(writeNext, delay);
    } else {
      // 🎯 SCROLL FINAL pour être sûr
      setTimeout(() => {
        autoScrollToBottom();
        if (options.onComplete) {
          options.onComplete();
        }
      }, 100);
    }
  };

  writeNext();
}

// 🔥 NOUVELLE FONCTION : DyText spécial SERN avec effets
export function dytextAnimateSERN(ref, text = "", delay = 30, options = {}) {
  if (!ref?.current || !text) return;

  const el = ref.current;
  let i = 0;
  el.textContent = "";

  // 🎯 AUTOSCROLL OPTIMISÉ POUR SERN
  const autoScrollSERN = () => {
    const container = document.getElementById('sern-text-container');
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // 🔥 EFFETS SPÉCIAUX SERN
  const addSERNEffect = () => {
    // Petit flash red sur le conteneur
    const container = document.getElementById('sern-text-container');
    if (container && Math.random() < 0.1) { // 10% de chance
      container.style.boxShadow = 'inset 0 0 20px rgba(255, 0, 0, 0.3)';
      setTimeout(() => {
        container.style.boxShadow = '';
      }, 150);
    }
  };

  const writeNext = () => {
    const char = text.charAt(i);

    // 🎵 Pause plus longue sur la ponctuation pour effet dramatique
    if (char === ".") {
      setTimeout(writeNext, 600); // Plus long pour SERN
      i++;
      return;
    }

    if (char === ",") {
      setTimeout(writeNext, 300);
      i++;
      return;
    }

    if (char === "§") {
      let current = el.textContent;
      const delInterval = setInterval(() => {
        current = current.slice(0, -1);
        el.textContent = current;
        autoScrollSERN();
        if (current.length === 0) {
          clearInterval(delInterval);
          i++;
          setTimeout(writeNext, 200);
        }
      }, 50);
      return;
    }

    el.textContent = text.substring(0, i + 1);
    i++;

    // 🔥 EFFETS SERN + AUTOSCROLL
    if (i % 3 === 0) {
      autoScrollSERN();
      addSERNEffect();
    }

    if (i < text.length) {
      setTimeout(writeNext, delay);
    } else {
      setTimeout(() => {
        autoScrollSERN();
        if (options.onComplete) {
          options.onComplete();
        }
      }, 200);
    }
  };

  writeNext();
}


export function parseNarrative(rawText) {
  const lines = rawText.split('\n').map(line => line.trim()).filter(Boolean);
  const steps = [];

  for (const line of lines) {
    // 🎵 Sound
    if (line.startsWith('{sound:')) {
      const match = line.match(/\{sound:(.+?)\}/);
      if (match) {
        steps.push({ type: 'sound', src: match[1].trim() });
      }
    }

    // 🖼️ Image
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

    // ⏱️ Delay
    else if (line.startsWith('{delay=')) {
      const match = line.match(/\{delay=(\d+)\}/);
      if (match) {
        steps.push({ type: 'delay', duration: parseInt(match[1], 10) });
      }
    }

    // 📝 Texte standard
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
  triggerFadeOutMusic, // 👈 nouveau paramètre
  playingAudiosRef
}) {
  let currentIndex = 0;

  const runNext = () => {
  if (currentIndex >= steps.length) {
    setShowNarrative(false);         // ✅ ferme la popup
    triggerFadeOutMusic?.();         // ✅ fade-out audio s’il est défini
    return;
  }

    const step = steps[currentIndex];
    currentIndex++;

    let delayForNext = 1000;

    switch (step.type) {
      case 'text':
        dytextAnimate(dytextRef, step.content, 30, {
          onComplete: () => setTimeout(runNext, delayForNext),
        });
        return; // Important : on attend dytextAnimate

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
        console.warn('⛔️ Étape inconnue :', step);
    }

    // Pour les étapes simples (img, sound, delay), on continue après un délai
    setTimeout(runNext, delayForNext);
  };

  runNext();
}