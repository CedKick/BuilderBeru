// components/IgrisTutorial/tutorialSteps.js

// Liste des hunters pour la sélection aléatoire
const HUNTER_NAMES = [
  'Sung Jinwoo', 'Cha Hae-in', 'Choi Jong-in', 'Baek Yoonho', 
  'Min Byung-gyu', 'Lim Tae-gyu', 'Woo Jinchul', 'Go Gunhee'
];

// Sélectionner un hunter au hasard
const getRandomHunter = () => {
  return HUNTER_NAMES[Math.floor(Math.random() * HUNTER_NAMES.length)];
};

export const tutorialSteps = [
  {
    id: 'welcome',
    message: "Salutations, Monarque ! Je suis Igris, ton ombre fidèle. Laisse-moi te guider dans la création de ton Hunter parfait... 🗡️",
    speaker: 'igris',
    duration: 6000, // Plus de temps pour lire
    autoNext: true,
  },
  {
    id: 'pause_1',
    message: "", // Pause silencieuse
    duration: 500, // Plus courte
    autoNext: true,
    skipBubble: true
  },
  {
    id: 'cerbere_intro',
    message: "WOUF WOUF ! 🐺 *Cerbère s'agite d'excitation*",
    speaker: 'cerbere',
    duration: 3000,
    autoNext: true
  },
  {
    id: 'igris_calms',
    message: "Du calme Cerbère... Nous avons une mission importante. Commençons !",
    speaker: 'igris',
    duration: 4000,
    autoNext: true
  },
  {
    id: 'pause_2',
    message: "",
    duration: 500,
    autoNext: true,
    skipBubble: true
  },
  {
  id: 'character_selector_zone',
  message: "D'abord, regarde ici en haut. C'est le sélecteur de personnage.",
  speaker: 'igris',
  selector: 'select[value][onChange]', // N'importe quel select avec value et onChange
  highlight: true,
  duration: 4500,
  autoNext: true
},
{
  id: 'open_character_list',
  message: "Je vais changer de Hunter pour cette démonstration...",
  speaker: 'igris',
  selector: 'select[value][onChange]',
  highlight: true,
  duration: 3500,
  autoNext: true,
  action: () => {
    setTimeout(() => {
      // Chercher le select qui contient les personnages
      const selects = document.querySelectorAll('select');
      let targetSelect = null;
      
      for (const select of selects) {
        // Vérifier si c'est le bon select en cherchant des options de personnages connus
        const hasCharacterOptions = Array.from(select.options).some(opt => 
          opt.text.includes('Sung Jinwoo') || 
          opt.text.includes('Cha Hae-in') ||
          opt.text.includes('Choi Jong-in') ||
          opt.text === 'Sélectionner un personnage'
        );
        
        if (hasCharacterOptions) {
          targetSelect = select;
          console.log('✅ Select des personnages trouvé !', select);
          break;
        }
      }
      
      if (targetSelect) {
        targetSelect.focus();
        // Simuler l'ouverture du dropdown
        targetSelect.click();
        const mouseEvent = new MouseEvent('mousedown', { bubbles: true });
        targetSelect.dispatchEvent(mouseEvent);
      } else {
        console.log('❌ Select des personnages non trouvé');
      }
    }, 500);
  }
},
{
  id: 'select_random_hunter',
  message: "Changeons pour un autre Hunter... Celui-ci fera l'affaire !",
  speaker: 'igris',
  duration: 3000,
  autoNext: true,
  action: () => {
    setTimeout(() => {
      const selects = document.querySelectorAll('select');
      let targetSelect = null;
      
      for (const select of selects) {
        const hasCharacterOptions = Array.from(select.options).some(opt => 
          opt.text.includes('Sung Jinwoo') || 
          opt.text.includes('Cha Hae-in') ||
          opt.text.includes('Choi Jong-in') ||
          opt.text === 'Sélectionner un personnage'
        );
        
        if (hasCharacterOptions) {
          targetSelect = select;
          break;
        }
      }
      
      if (targetSelect) {
        const currentValue = targetSelect.value;
        console.log('🔍 Hunter actuel:', currentValue);
        
        // Récupérer toutes les options SAUF celle actuellement sélectionnée
        const options = Array.from(targetSelect.options).filter(opt => 
          opt.value !== '' && opt.value !== currentValue
        );
        
        if (options.length > 0) {
          const randomOption = options[Math.floor(Math.random() * options.length)];
          
          console.log('🎯 Nouveau Hunter:', randomOption.text, '(', randomOption.value, ')');
          
          // Méthode pour forcer React à voir le changement
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLSelectElement.prototype,
            'value'
          ).set;
          
          nativeInputValueSetter.call(targetSelect, randomOption.value);
          
          const event = new Event('change', { bubbles: true });
          targetSelect.dispatchEvent(event);
          
          window.selectedHunterForTutorial = randomOption.text;
        }
      }
    }, 1000);
  }
},
  {
    id: 'cerbere_reaction',
    message: (() => {
      const hunterName = window.selectedHunterForTutorial || 'ce Hunter';
      return `WOUF WOUF ! *Cerbère bondit d'excitation* ${hunterName} ! J'adore ${hunterName} ! 🎉`;
    })(),
    speaker: 'cerbere',
    duration: 3500,
    autoNext: true
  },
  {
    id: 'igris_confirms',
    message: (() => {
      const hunterName = window.selectedHunterForTutorial || 'Ce Hunter';
      return `${hunterName} est effectivement un excellent choix. Passons maintenant à l'équipement !`;
    })(),
    speaker: 'igris',
    duration: 4000,
    autoNext: true
  },
  {
    id: 'cerbere_reaction',
    message: `WOUF WOUF ! *Cerbère approuve* ${window.selectedHunterForTutorial || 'ce Hunter'} ! Bon choix ! 🎉`,
    speaker: 'cerbere',
    duration: 3500,
    autoNext: true
  },
  {
    id: 'igris_confirms',
    message: `${window.selectedHunterForTutorial || 'Ce Hunter'} est effectivement un excellent choix. Maintenant, équipons-le !`,
    speaker: 'igris',
    duration: 4000,
    autoNext: true
  },
  {
    id: 'pause_3',
    message: "",
    duration: 1500,
    autoNext: true,
    skipBubble: true
  },
  {
    id: 'artifact_section',
    message: "Les artefacts sont le cœur de la puissance. Chaque pièce peut être optimisée !",
    speaker: 'igris',
    selector: '.artifact-grid, .artifacts-container, .equipment-section',
    highlight: true,
    duration: 4500,
    autoNext: true
  },
  {
    id: 'helmet_slot',
    message: "Commençons par le Casque. C'est l'une des pièces les plus importantes !",
    speaker: 'igris',
    selector: '[data-slot="helmet"], .helmet-slot, .artifact-slot:first-child',
    highlight: true,
    duration: 4000,
    autoNext: true
  },
  {
    id: 'cerbere_confused',
    message: "Wouf ? *Cerbère penche la tête, intrigué par tous ces chiffres* 🤔",
    speaker: 'cerbere',
    duration: 3000,
    autoNext: true
  },
  {
    id: 'main_stat_select',
    message: "La stat principale définit l'orientation de ton build. Attack, HP ou Defense sont d'excellents choix pour débuter.",
    speaker: 'igris',
    selector: '.main-stat-select, select[name*="main"], .stat-selector:first-of-type',
    highlight: true,
    duration: 5000,
    autoNext: true
  },
  {
    id: 'pause_4',
    message: "",
    duration: 1000,
    autoNext: true,
    skipBubble: true
  },
  {
    id: 'substats_intro',
    message: "Les substats ajoutent des bonus supplémentaires. Tu peux en avoir jusqu'à 4, et elles peuvent 'proc' en montant de niveau !",
    speaker: 'igris',
    selector: '.substat-container, .substats-section, [data-substat="1"]',
    highlight: true,
    duration: 5000,
    autoNext: true
  },
  {
    id: 'save_button',
    message: "⚠️ IMPORTANT : N'oublie jamais de sauvegarder tes artefacts ! Le bouton Save conserve tes modifications.",
    speaker: 'igris',
    selector: '.save-button, button[type="submit"], button.btn-save', // Sélecteurs CSS valides
    highlight: true,
    duration: 5000,
    autoNext: true
  },
  {
    id: 'cerbere_happy',
    message: "WOUF WOUF ! *Cerbère approuve vigoureusement* ✅",
    speaker: 'cerbere',
    duration: 2500,
    autoNext: true
  },
  {
    id: 'pause_5',
    message: "",
    duration: 1500,
    autoNext: true,
    skipBubble: true
  },
  {
    id: 'gems_section',
    message: "Les Gemmes offrent des bonus massifs ! Red Gem pour l'attaque, Blue pour l'HP, Green pour la défense...",
    speaker: 'igris',
    selector: '.gems-button, button.btn-gems, [data-action="gems"]', // CSS valides
    highlight: true,
    duration: 4500,
    autoNext: true
  },
  {
    id: 'cores_mention',
    message: "Les Noyaux (Cores) sont une autre source de puissance. Explore-les quand tu seras plus familier !",
    speaker: 'igris',
    selector: '.cores-button, button.btn-cores, [data-action="cores"]', // CSS valides
    highlight: true,
    duration: 4500,
    autoNext: true
  },
  {
    id: 'stats_display',
    message: "Ici, tu peux voir toutes tes stats finales en temps réel. Chaque modification est instantanément calculée !",
    speaker: 'igris',
    selector: '.stats-display, .final-stats, .character-stats',
    highlight: true,
    duration: 5000,
    autoNext: true
  },
  {
    id: 'dps_calculator',
    message: "Le DPS Calculator est l'outil ultime ! Il révèle ta vraie puissance en combat. N'hésite pas à l'utiliser !",
    speaker: 'igris',
    selector: '.dps-calculator-button, button.btn-calculator, [data-action="calculator"]', // CSS valides
    highlight: true,
    duration: 5000,
    autoNext: true
  },
  {
    id: 'cerbere_proud',
    message: "WOUF WOUF WOUF ! *Cerbère est très fier de tes progrès* 🏆",
    speaker: 'cerbere',
    duration: 3000,
    autoNext: true
  },
  {
    id: 'pause_6',
    message: "",
    duration: 1500,
    autoNext: true,
    skipBubble: true
  },
  {
    id: 'accounts_system',
    message: "Tu peux créer plusieurs comptes pour gérer différents builds. Pratique pour tester sans perdre tes créations !",
    speaker: 'igris',
    selector: '.account-select, .account-dropdown, [data-section="accounts"]',
    highlight: true,
    duration: 4500,
    autoNext: true
  },
  {
    id: 'beru_kaisel',
    message: "Beru et Kaisel sont toujours là pour t'aider. N'hésite pas à les invoquer en cas de besoin !",
    speaker: 'igris',
    duration: 4000,
    autoNext: true
  },
  {
    id: 'hall_of_flame',
    message: "Les builds légendaires finissent au Hall of Flame... Crée quelque chose d'exceptionnel et rejoins les légendes ! 🔥",
    speaker: 'igris',
    duration: 5000,
    autoNext: true
  },
  {
    id: 'finale',
    message: "Tu es prêt, Monarque ! Que tes builds soient puissants et tes proc nombreux ! Pour la gloire des Ombres ! ⚔️",
    speaker: 'igris',
    duration: 6000,
    autoNext: true
  },
  {
    id: 'cerbere_farewell',
    message: "WOUF WOUF ! *Cerbère te salue avec enthousiasme* À bientôt Monarque ! 👋",
    speaker: 'cerbere',
    duration: 4000,
    autoNext: true
  }
];