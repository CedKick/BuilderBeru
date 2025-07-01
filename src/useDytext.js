// useDyText.js
import { useEffect } from "react";

// 🔥 MODIFIE ta fonction dytextAnimate dans useDytext.js

export function dytextAnimate(ref, text = "", delay = 30, options = {}) {
  if (!ref?.current || !text) return;

  const el = ref.current;
  let i = 0;
  el.innerHTML = ""; // 🔥 innerHTML au lieu de textContent pour supporter les liens

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

  // 🔗 FONCTION POUR PARSER LES LIENS
  const parseTextWithLinks = (fullText) => {
    // Regex pour détecter les URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // Remplace les URLs par des balises <a>
    return fullText.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline transition-colors">${url}</a>`;
    });
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
      let current = el.innerHTML;
      const delInterval = setInterval(() => {
        // Supprime le dernier caractère visible (pas les balises HTML)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = current;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        
        if (textContent.length > 0) {
          // Reconstruit le HTML avec un caractère de moins
          const shorterText = textContent.slice(0, -1);
          el.innerHTML = parseTextWithLinks(shorterText);
          current = el.innerHTML;
          autoScrollToBottom();
        }
        
        if (textContent.length === 0) {
          clearInterval(delInterval);
          i++;
          setTimeout(writeNext, 200);
        }
      }, 50);
      return;
    }

    // 🎨 ÉCRITURE AVEC SUPPORT HTML + LIENS
    const currentText = text.substring(0, i + 1);
    const parsedText = parseTextWithLinks(currentText);
    
    // Gestion du markdown basique (gras)
    const finalText = parsedText
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-yellow-400">$1</strong>')
      .replace(/\n/g, '<br>');
    
    el.innerHTML = finalText;
    
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
      let current = el.innerHTML;
      const delInterval = setInterval(() => {
        // Supprime proprement le dernier caractère
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
          setTimeout(writeNext, 200);
        }
      }, 50);
      return;
    }

    // 🎨 ÉCRITURE AVEC LIENS SERN STYLE
    const currentText = text.substring(0, i + 1);
    const parsedText = parseTextWithLinks(currentText);
    
    // Support markdown + styles SERN
    const finalText = parsedText
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-red-500 font-bold">$1</strong>')
      .replace(/\n/g, '<br>');
    
    el.innerHTML = finalText;
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
      triggerFadeOutMusic?.();         // ✅ fade-out audio s'il est défini
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
        // Étape inconnue, on continue sans warn
        break;
    }

    // Pour les étapes simples (img, sound, delay), on continue après un délai
    setTimeout(runNext, delayForNext);
  };

  runNext();
}