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
        duration: 6000,
        autoNext: true,
    },
    {
        id: 'pause_1',
        message: "",
        duration: 200,
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
        duration: 200,
        autoNext: true,
        skipBubble: true
    },
    {
        id: 'character_selector_zone',
        message: "D'abord, regarde ici en haut. C'est le sélecteur de personnage.",
        speaker: 'igris',
        duration: 4500,
        autoNext: true
    },
    {
        id: 'open_character_list',
        message: "Je vais changer de Hunter pour cette démonstration...",
        speaker: 'igris',
        selector: () => {
            const selects = document.querySelectorAll('select');
            for (const select of selects) {
                const hasCharacterOptions = Array.from(select.options).some(opt =>
                    opt.text.includes('Sung Jinwoo') ||
                    opt.text.includes('Cha Hae-in') ||
                    opt.text.includes('Choi Jong-in') ||
                    opt.text === 'Sélectionner un personnage'
                );
                if (hasCharacterOptions) return select;
            }
            return selects[0];
        },
        highlight: true,
        duration: 3500,
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
                        console.log('✅ Select des personnages trouvé !', select);
                        break;
                    }
                }

                if (targetSelect) {
                    targetSelect.focus();
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

                    const options = Array.from(targetSelect.options).filter(opt =>
                        opt.value !== '' && opt.value !== currentValue
                    );

                    if (options.length > 0) {
                        const randomOption = options[Math.floor(Math.random() * options.length)];
                        console.log('🎯 Nouveau Hunter:', randomOption.text, '(', randomOption.value, ')');

                        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                            window.HTMLSelectElement.prototype,
                            'value'
                        ).set;

                        nativeInputValueSetter.call(targetSelect, randomOption.value);

                        const event = new Event('change', { bubbles: true });
                        targetSelect.dispatchEvent(event);

                        // Stocker le nom du NOUVEAU hunter
                        window.selectedHunterForTutorial = randomOption.text;
                    }
                }
            }, 1000);
        }
    },
    {
        id: 'pause_after_select',
        message: "",
        duration: 1000,
        autoNext: true,
        skipBubble: true
    },
    {
        id: 'cerbere_reaction',
        // Fonction exécutée au moment où l'étape est atteinte
        message: (() => {
            // Récupérer le nom stocké dans la variable globale
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
        selector: () => {
            const possibleSelectors = [
                '[data-slot="helmet"]',
                '[data-artifact="Helmet"]',
                '.helmet-slot',
                '.artifact-slot:first-child',
                '.artifact-card:first-child'
            ];

            for (const sel of possibleSelectors) {
                const element = document.querySelector(sel);
                if (element) return element;
            }

            const cards = document.querySelectorAll('.artifact-card, .artifact-slot');
            return Array.from(cards).find(card => {
                const text = card.textContent.toLowerCase();
                return text.includes('helmet') || text.includes('casque');
            });
        },
        highlight: true,
        duration: 4000,
        autoNext: true
    },
    {
    id: 'helmet_click',
    message: "Clique sur le casque pour ouvrir sa configuration !",
    speaker: 'igris',
    selector: () => {
        // Chercher spécifiquement l'icône de configuration (diamant)
        const helmets = document.querySelectorAll('.artifact-card, .artifact-slot, [data-artifact="Helmet"]');
        const helmet = Array.from(helmets).find(el => {
            const text = el.textContent?.toLowerCase() || '';
            return text.includes('helmet') || text.includes('casque');
        });
        
        if (helmet) {
            // Chercher le bouton de configuration (l'icône diamant)
            const configButton = helmet.querySelector('button, svg, [role="button"]');
            if (configButton) {
                console.log('✅ Bouton config trouvé');
                return configButton;
            }
            return helmet;
        }
        return null;
    },
    highlight: true,
    waitForClick: true,
    onElementClick: () => {
        console.log('🎯 Helmet config cliqué !');
    }
},
{
    id: 'wait_popup_open',
    message: "",
    duration: 1500, // Augmenté à 1.5s
    autoNext: true,
    skipBubble: true,
    waitForElement: '.fixed[style*="z-index"], .modal, [role="dialog"], .popup-container'
},
{
    id: 'popup_opened',
    message: "Voilà ! La fenêtre de configuration est ouverte. Tu peux maintenant personnaliser ton casque.",
    speaker: 'igris',
    duration: 3000,
    autoNext: true
},
{
    id: 'select_main_stat',
    message: "Choisis une stat principale. 'Attack %' est excellent pour les DPS !",
    speaker: 'igris',
    selector: () => {
        // Chercher dans la popup qui devrait être ouverte
        const popup = document.querySelector('.fixed[style*="z-index"], .modal, [role="dialog"]');
        if (!popup) {
            console.log('❌ Popup non trouvée');
            return null;
        }
        
        // Chercher le select dans la popup
        const selects = popup.querySelectorAll('select');
        console.log(`🔍 ${selects.length} selects trouvés dans la popup`);
        
        // Le premier select est généralement le main stat
        if (selects.length > 0) {
            // Vérifier si c'est bien le main stat
            const firstSelect = selects[0];
            const hasMainStat = Array.from(firstSelect.options).some(opt => 
                opt.text.includes('Main Stat') || 
                opt.text.includes('Attack')
            );
            
            if (hasMainStat) {
                console.log('✅ Select Main Stat trouvé');
                return firstSelect;
            }
        }
        
        return null;
    },
    highlight: true,
    duration: 5000,
    autoNext: true
},
    {
        id: 'cerbere_excited_stats',
        message: "WOUF ! Attack % ! Ça va faire mal ! 💪",
        speaker: 'cerbere',
        duration: 3000,
        autoNext: true
    },
    {
        id: 'select_substats',
        message: "Maintenant les substats ! Choisis 'Critical Hit Damage' et 'Attack' pour maximiser les dégâts.",
        speaker: 'igris',
        selector: () => {
            // Chercher tous les selects qui ont "Select Substat"
            const selects = document.querySelectorAll('select');
            const substatSelects = Array.from(selects).filter(select => {
                return Array.from(select.options).some(opt => 
                    opt.text === 'Select Substat' || 
                    opt.text.includes('Substat')
                );
            });
            
            // Retourner le conteneur parent du premier substat
            if (substatSelects.length > 0) {
                return substatSelects[0].closest('div');
            }
            
            // Fallback
            return document.querySelector('.substats-container, [class*="substat"]');
        },
        highlight: true,
        duration: 6000,
        autoNext: true
    },
    {
        id: 'select_set',
        message: "Excellent ! Maintenant, choisissons un set. 'Burning Set' ou 'Critical Set' sont parfaits pour l'attaque !",
        speaker: 'igris',
        selector: () => {
            const buttons = document.querySelectorAll('button');
            const setButton = Array.from(buttons).find(btn => {
                const text = btn.textContent?.trim().toLowerCase() || '';
                return text === 'set' || text === 'choose set' || text === 'select set';
            });
            
            if (setButton) {
                console.log('✅ Bouton Set trouvé !');
                return setButton;
            }
            
            return null;
        },
        highlight: true,
        duration: 5400,
        autoNext: true
    },
    {
        id: 'save_artifact',
        message: "⚠️ TRÈS IMPORTANT : N'oublie JAMAIS de sauvegarder ! Clique sur le bouton Save.",
        speaker: 'igris',
        selector: () => {
            const buttons = document.querySelectorAll('button');
            return Array.from(buttons).find(btn => {
                const text = btn.textContent?.toLowerCase() || '';
                return text.includes('save') ||
                    text.includes('sauvegarder') ||
                    text.includes('enregistrer');
            });
        },
        highlight: true,
        waitForClick: true,
        onElementClick: () => {
            console.log('✅ Artifact sauvegardé !');
        }
    },
    {
        id: 'cerbere_proud_save',
        message: "WOUF WOUF ! Tu as configuré ton premier artifact ! Je suis fier de toi ! 🎉",
        speaker: 'cerbere',
        duration: 4000,
        autoNext: true
    },
    {
        id: 'igris_explain_more',
        message: "Excellent travail ! Tu peux faire la même chose pour chaque pièce d'équipement. Plus tard, tu découvriras les synergies entre les sets !",
        speaker: 'igris',
        duration: 6000,
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
        id: 'gems_section',
        message: "Les Gemmes offrent des bonus massifs ! Red Gem pour l'attaque, Blue pour l'HP, Green pour la défense...",
        speaker: 'igris',
        selector: () => {
            const buttons = document.querySelectorAll('button');
            return Array.from(buttons).find(btn => {
                const text = btn.textContent.toLowerCase();
                return text.includes('gem') ||
                    text.includes('gemme') ||
                    btn.classList.contains('gems-button') ||
                    btn.getAttribute('data-action') === 'gems';
            });
        },
        highlight: true,
        duration: 5200,
        autoNext: true
    },
    {
        id: 'cores_mention',
        message: "Les Noyaux (Cores) sont une autre source de puissance. Explore-les quand tu seras plus familier !",
        speaker: 'igris',
        selector: () => {
            const buttons = document.querySelectorAll('button');
            return Array.from(buttons).find(btn => {
                const text = btn.textContent.toLowerCase();
                return text.includes('core') ||
                    text.includes('noyau') ||
                    btn.classList.contains('cores-button') ||
                    btn.getAttribute('data-action') === 'cores';
            });
        },
        highlight: true,
        duration: 5000,
        autoNext: true
    },
    {
        id: 'stats_display',
        message: "Ici, tu peux voir toutes tes stats finales en temps réel. Chaque modification est instantanément calculée !",
        speaker: 'igris',
        selector: '.stats-display, .final-stats, .character-stats',
        highlight: true,
        duration: 6500,
        autoNext: true
    },
    {
        id: 'dps_calculator',
        message: "Le DPS Calculator est l'outil ultime ! Il révèle ta vraie puissance en combat. N'hésite pas à l'utiliser !",
        speaker: 'igris',
        selector: () => {
            const buttons = document.querySelectorAll('button');
            const button = Array.from(buttons).find(btn => {
                const text = btn.textContent.toLowerCase();
                return text.includes('calculator') ||
                    text.includes('damage') ||
                    text.includes('dps') ||
                    btn.classList.contains('calculator-button');
            });

            if (!button) {
                const toggles = document.querySelectorAll('[role="switch"], input[type="checkbox"]');
                return Array.from(toggles).find(toggle => {
                    const label = toggle.closest('label');
                    if (label) {
                        const text = label.textContent.toLowerCase();
                        return text.includes('calculator') || text.includes('damage');
                    }
                    return false;
                });
            }

            return button;
        },
        highlight: true,
        duration: 5800,
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
        duration: 5500,
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