// useDyText.js
import { useEffect } from "react";

// 🔧 Map global pour tracker les animations en cours
const activeAnimations = new Map();

// 🔥 FONCTION dytextAnimate AMÉLIORÉE avec protection anti-spam
export function dytextAnimate(ref, text = "", delay = 30, options = {}) {
  if (!ref?.current || !text) return;

  const el = ref.current;
  
  // 🔧 FIX: Créer un ID unique pour cette animation
  const animationId = `${el.id || 'el'}-${Date.now()}`;
  
  // 🔧 FIX: Vérifier si une animation est déjà en cours sur cet élément
  const existingAnimation = Array.from(activeAnimations.entries())
    .find(([id, data]) => data.element === el);
  
  if (existingAnimation) {
    console.log('⚠️ Animation déjà en cours, annulation de la précédente');
    const [oldId, oldData] = existingAnimation;
    if (oldData.timeoutId) {
      clearTimeout(oldData.timeoutId);
    }
    activeAnimations.delete(oldId);
  }
  
  // Enregistrer cette nouvelle animation
  activeAnimations.set(animationId, { element: el, text, timeoutId: null });
  
  let i = 0;
  el.innerHTML = "";

  // 🎯 FONCTION AUTOSCROLL INTELLIGENTE
  const autoScrollToBottom = () => {
    const scrollContainer = document.getElementById('sern-text-container') || 
                           el.closest('.overflow-y-auto') ||
                           el.closest('.max-h-\\[40vh\\]') ||
                           el.parentElement;
    
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // 🔗 FONCTION POUR PARSER LES LIENS
  const parseTextWithLinks = (fullText) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return fullText.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline transition-colors">${url}</a>`;
    });
  };

  const writeNext = () => {
    // 🔧 FIX: Vérifier si l'animation est toujours active
    if (!activeAnimations.has(animationId)) {
      console.log('Animation annulée:', animationId);
      return;
    }

    const char = text.charAt(i);

    if (char === ".") {
      const timeoutId = setTimeout(writeNext, 400);
      activeAnimations.get(animationId).timeoutId = timeoutId;
      i++;
      return;
    }

    if (char === ",") {
      const timeoutId = setTimeout(writeNext, 200);
      activeAnimations.get(animationId).timeoutId = timeoutId;
      i++;
      return;
    }

    if (char === "§") {
      let current = el.innerHTML;
      const delInterval = setInterval(() => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = current;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        
        if (textContent.length > 0) {
          const shorterText = textContent.slice(0, -1);
          el.innerHTML = parseTextWithLinks(shorterText);
          current = el.innerHTML;
          autoScrollToBottom();
        }
        
        if (textContent.length === 0) {
          clearInterval(delInterval);
          i++;
          const timeoutId = setTimeout(writeNext, 200);
          if (activeAnimations.has(animationId)) {
            activeAnimations.get(animationId).timeoutId = timeoutId;
          }
        }
      }, 50);
      return;
    }

    // 🎨 ÉCRITURE AVEC SUPPORT HTML + LIENS
    const currentText = text.substring(0, i + 1);
    const parsedText = parseTextWithLinks(currentText);
    
    const finalText = parsedText
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-yellow-400">$1</strong>')
      .replace(/\n/g, '<br>');
    
    el.innerHTML = finalText;
    
    i++;

    // 🚀 AUTOSCROLL À CHAQUE CARACTÈRE (mais optimisé)
    if (i % 5 === 0) {
      autoScrollToBottom();
    }

    if (i < text.length) {
      const timeoutId = setTimeout(writeNext, delay);
      if (activeAnimations.has(animationId)) {
        activeAnimations.get(animationId).timeoutId = timeoutId;
      }
    } else {
      // 🎯 ANIMATION TERMINÉE
      setTimeout(() => {
        autoScrollToBottom();
        // Nettoyer l'animation de la map
        activeAnimations.delete(animationId);
        if (options.onComplete) {
          options.onComplete();
        }
      }, 100);
    }
  };

  writeNext();
  
  // 🔧 FIX: Retourner une fonction de cleanup
  return () => {
    if (activeAnimations.has(animationId)) {
      const data = activeAnimations.get(animationId);
      if (data.timeoutId) {
        clearTimeout(data.timeoutId);
      }
      activeAnimations.delete(animationId);
    }
  };
}

// 🔥 NOUVELLE FONCTION : DyText spécial SERN avec effets
export function dytextAnimateSERN(ref, text = "", delay = 30, options = {}) {
  if (!ref?.current || !text) return;

  const el = ref.current;
  const animationId = `sern-${el.id || 'el'}-${Date.now()}`;
  
  // Vérifier animation existante
  const existingAnimation = Array.from(activeAnimations.entries())
    .find(([id, data]) => data.element === el);
  
  if (existingAnimation) {
    const [oldId, oldData] = existingAnimation;
    if (oldData.timeoutId) {
      clearTimeout(oldData.timeoutId);
    }
    activeAnimations.delete(oldId);
  }
  
  activeAnimations.set(animationId, { element: el, text, timeoutId: null });
  
  let i = 0;
  el.innerHTML = "";

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

  // 🔗 PARSEUR DE LIENS POUR SERN
  const parseTextWithLinks = (fullText) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return fullText.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-red-400 hover:text-red-300 underline animate-pulse">${url}</a>`;
    });
  };

  // 🔥 EFFETS SPÉCIAUX SERN
  const addSERNEffect = () => {
    const container = document.getElementById('sern-text-container');
    if (container && Math.random() < 0.1) {
      container.style.boxShadow = 'inset 0 0 20px rgba(255, 0, 0, 0.3)';
      setTimeout(() => {
        container.style.boxShadow = '';
      }, 150);
    }
  };

  const writeNext = () => {
    if (!activeAnimations.has(animationId)) {
      return;
    }

    const char = text.charAt(i);

    if (char === ".") {
      const timeoutId = setTimeout(writeNext, 600);
      activeAnimations.get(animationId).timeoutId = timeoutId;
      i++;
      return;
    }

    if (char === ",") {
      const timeoutId = setTimeout(writeNext, 300);
      activeAnimations.get(animationId).timeoutId = timeoutId;
      i++;
      return;
    }

    if (char === "§") {
      let current = el.innerHTML;
      const delInterval = setInterval(() => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = current;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        
        if (textContent.length > 0) {
          const shorterText = textContent.slice(0, -1);
          el.innerHTML = parseTextWithLinks(shorterText);
          current = el.innerHTML;
          autoScrollSERN();
        }
        
        if (textContent.length === 0) {
          clearInterval(delInterval);
          i++;
          const timeoutId = setTimeout(writeNext, 200);
          if (activeAnimations.has(animationId)) {
            activeAnimations.get(animationId).timeoutId = timeoutId;
          }
        }
      }, 50);
      return;
    }

    const currentText = text.substring(0, i + 1);
    const parsedText = parseTextWithLinks(currentText);
    
    const finalText = parsedText
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-red-500 font-bold">$1</strong>')
      .replace(/\n/g, '<br>');
    
    el.innerHTML = finalText;
    i++;

    if (i % 3 === 0) {
      autoScrollSERN();
      addSERNEffect();
    }

    if (i < text.length) {
      const timeoutId = setTimeout(writeNext, delay);
      if (activeAnimations.has(animationId)) {
        activeAnimations.get(animationId).timeoutId = timeoutId;
      }
    } else {
      setTimeout(() => {
        autoScrollSERN();
        activeAnimations.delete(animationId);
        if (options.onComplete) {
          options.onComplete();
        }
      }, 200);
    }
  };

  writeNext();
  
  return () => {
    if (activeAnimations.has(animationId)) {
      const data = activeAnimations.get(animationId);
      if (data.timeoutId) {
        clearTimeout(data.timeoutId);
      }
      activeAnimations.delete(animationId);
    }
  };
}

// 🧹 Fonction utilitaire pour nettoyer toutes les animations
export function cleanupAllAnimations() {
  activeAnimations.forEach((data, id) => {
    if (data.timeoutId) {
      clearTimeout(data.timeoutId);
    }
  });
  activeAnimations.clear();
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

    // ⱕ Delay
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
        // Nettoyer l'animation précédente si elle existe
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