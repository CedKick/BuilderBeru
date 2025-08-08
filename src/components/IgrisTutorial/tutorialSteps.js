// components/IgrisTutorial/tutorialSteps.js

// 🎲 Système de variations de dialogues
const DIALOGUE_VARIATIONS = {
    welcome: [
        {
            message: "Salutations, Monarque ! Je suis Igris, ton ombre fidèle. Laisse-moi te guider dans la création de ton Hunter parfait... 🗡️",
            speaker: 'igris'
        },
        {
            message: "Mon Seigneur ! Igris à votre service. Prêt à forger le build ultime ? Les ombres attendent vos ordres ! ⚔️",
            speaker: 'igris'
        },
        {
            message: "Monarque... Le temps est venu. Transformons ce Hunter ordinaire en légende vivante ! 💀",
            speaker: 'igris'
        }
    ],
    
    cerbere_intro: [
        {
            message: "WOUF WOUF ! 🐺 *Cerbère s'agite d'excitation*",
            speaker: 'cerbere'
        },
        {
            message: "OUAF OUAF OUAF ! *Cerbère bondit partout* NOUVEAUUU HUNTERRRR ! 🎉",
            speaker: 'cerbere'
        },
        {
            message: "*Cerbère renifle l'air* WOUF ! Ça sent le build légendaire ici ! 🔥",
            speaker: 'cerbere'
        }
    ],
    
    igris_calms: [
        {
            message: "Du calme Cerbère... Nous avons une mission importante. Commençons !",
            speaker: 'igris'
        },
        {
            message: "Cerbère, contrôle ton enthousiasme. Le Monarque a besoin de concentration...",
            speaker: 'igris'
        },
        {
            message: "*soupir* Toujours aussi énergique... Bon, focus Cerbère ! On a du travail.",
            speaker: 'igris'
        }
    ],
    
    helmet_instruction: [
        {
            message: "Commençons par le Casque. C'est l'une des pièces les plus importantes !",
            speaker: 'igris'
        },
        {
            message: "Le Casque, Monarque ! Sans lui, même le plus fort des hunters finit K.O. rapidement.",
            speaker: 'igris'
        },
        {
            message: "Première leçon : Un bon casque peut faire la différence entre la victoire et... respawn.",
            speaker: 'igris'
        }
    ],
    
    stats_advice: [
        {
            message: "Choisis une stat principale. 'Attack %' est excellent pour les DPS !",
            speaker: 'igris'
        },
        {
            message: "Pour un DPS digne de ce nom, 'Attack %' reste le choix royal. Fais confiance à ton général !",
            speaker: 'igris'
        },
        {
            message: "Attack %, Critical Hit Rate, Critical Hit Damage... Les saintes trinités du DPS !",
            speaker: 'igris'
        }
    ],
    
    cerbere_reactions: [
        {
            message: "WOUF ! Attack % ! Ça va faire mal ! 💪",
            speaker: 'cerbere'
        },
        {
            message: "OUAF OUAF ! GROS DÉGÂTS INCOMING ! *queue qui remue frénétiquement*",
            speaker: 'cerbere'
        },
        {
            message: "WOOOOUUUUF ! J'aime quand ça fait BOOM ! 💥",
            speaker: 'cerbere'
        }
    ]
};

// 🐉 TANK INTERVENTIONS SPÉCIALES
const TANK_INTERRUPTIONS = [
    {
        afterStep: 'cerbere_intro',
        chance: 0.3, // 30% de chance
        sequence: [
            {
                message: "Tiens tiens... Qui fait autant de bruit par ici ? 🙄",
                speaker: 'tank',
                duration: 3500
            },
            {
                message: "GRRRRR ! WOUF WOUF ! C'est MON territoire ici ! 😤",
                speaker: 'cerbere',
                duration: 3000
            },
            {
                message: "Ton territoire ? *ricane* J'étais là bien avant toi, le chiot ! 😏",
                speaker: 'tank',
                duration: 3500
            },
            {
                message: "*Igris sépare les deux* ASSEZ ! On a un tutoriel à terminer !",
                speaker: 'igris',
                duration: 3500
            }
        ]
    },
    {
        afterStep: 'helmet_slot',
        chance: 0.25,
        sequence: [
            {
                message: "Psst... Monarque ! N'oublie pas que le vrai pouvoir vient du style ! 😎",
                speaker: 'tank',
                duration: 3500
            },
            {
                message: "WOUF ?! Le style ?! Les STATS c'est mieux ! WOUF WOUF !",
                speaker: 'cerbere',
                duration: 3000
            },
            {
                message: "Pauvre Cerbère... Tu comprendras un jour que l'apparence > performance 💅",
                speaker: 'tank',
                duration: 3500
            }
        ]
    },
    {
        afterStep: 'save_artifact',
        chance: 0.2,
        sequence: [
            {
                message: "Oh oh... Quelqu'un a oublié de sauvegarder la dernière fois... 😈",
                speaker: 'tank',
                duration: 3500
            },
            {
                message: "WOUF ! C'était pas moi ! C'était... euh... *regarde ailleurs*",
                speaker: 'cerbere',
                duration: 3000
            },
            {
                message: "La sauvegarde automatique, c'est pour les faibles ! Vivez dangereusement ! 🔥",
                speaker: 'tank',
                duration: 3500
            },
            {
                message: "Tank... Ne donne pas de mauvais conseils au Monarque !",
                speaker: 'igris',
                duration: 3000
            }
        ]
    }
];

// 🎯 Liste des hunters pour la sélection aléatoire
const HUNTER_NAMES = [
    'Sung Jinwoo', 'Cha Hae-in', 'Choi Jong-in', 'Baek Yoonho',
    'Min Byung-gyu', 'Lim Tae-gyu', 'Woo Jinchul', 'Go Gunhee'
];

// 🎲 Fonction pour obtenir une variation aléatoire
const getRandomVariation = (stepId) => {
    const variations = DIALOGUE_VARIATIONS[stepId];
    if (!variations || variations.length === 0) return null;
    return variations[Math.floor(Math.random() * variations.length)];
};

// 🎲 Fonction pour déterminer si Tank intervient
const shouldTankInterrupt = (stepId) => {
    const interruption = TANK_INTERRUPTIONS.find(int => int.afterStep === stepId);
    if (!interruption) return null;
    
    const roll = Math.random();
    return roll < interruption.chance ? interruption : null;
};

// 🎲 Sélectionner un hunter au hasard
const getRandomHunter = () => {
    return HUNTER_NAMES[Math.floor(Math.random() * HUNTER_NAMES.length)];
};

// 🏗️ Constructeur dynamique des étapes
export const buildDynamicTutorialSteps = () => {
    const steps = [];
    
    // 1. Welcome
    const welcomeVariation = getRandomVariation('welcome');
    steps.push({
        id: 'welcome',
        ...welcomeVariation,
        duration: 6500,
        autoNext: true,
    });
    
    // Pause
    steps.push({
        id: 'pause_1',
        message: "",
        duration: 200,
        autoNext: true,
        skipBubble: true
    });
    
    // 2. Cerbere intro
    const cerbereIntroVariation = getRandomVariation('cerbere_intro');
    steps.push({
        id: 'cerbere_intro',
        ...cerbereIntroVariation,
        duration: 3000,
        autoNext: true
    });
    
    // Vérifier si Tank intervient après Cerbere
    const tankInterruption1 = shouldTankInterrupt('cerbere_intro');
    if (tankInterruption1) {
        tankInterruption1.sequence.forEach((step, index) => {
            steps.push({
                id: `tank_interruption_1_${index}`,
                ...step,
                autoNext: true
            });
        });
    }
    
    // 3. Igris calms
    const igrisCalmVariation = getRandomVariation('igris_calms');
    steps.push({
        id: 'igris_calms',
        ...igrisCalmVariation,
        duration: 4000,
        autoNext: true
    });
    
    // Pause
    steps.push({
        id: 'pause_2',
        message: "",
        duration: 200,
        autoNext: true,
        skipBubble: true
    });
    
    // Character selector
    steps.push({
        id: 'character_selector_zone',
        message: "D'abord, regarde ici en haut. C'est le sélecteur de personnage.",
        speaker: 'igris',
        duration: 4500,
        autoNext: true
    });
    
    // Open character list
    steps.push({
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
    });
    
    // Select random hunter
    steps.push({
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
    });
    
    // Pause after select
    steps.push({
        id: 'pause_after_select',
        message: "",
        duration: 1000,
        autoNext: true,
        skipBubble: true
    });
    
    // Cerbere reaction au Hunter
    steps.push({
        id: 'cerbere_reaction',
        message: (() => {
            const hunterName = window.selectedHunterForTutorial || 'ce Hunter';
            const reactions = [
                `WOUF WOUF ! *Cerbère bondit d'excitation* ${hunterName} ! J'adore ${hunterName} ! 🎉`,
                `OUAAAAAAF ! ${hunterName} c'est mon préféré ! *queue qui fouette l'air* 🐺`,
                `*Cerbère fait des pirouettes* ${hunterName} ! ${hunterName} ! ${hunterName} ! 🎊`
            ];
            return reactions[Math.floor(Math.random() * reactions.length)];
        })(),
        speaker: 'cerbere',
        duration: 3500,
        autoNext: true
    });
    
    // Igris confirms
    steps.push({
        id: 'igris_confirms',
        message: (() => {
            const hunterName = window.selectedHunterForTutorial || 'Ce Hunter';
            const confirmations = [
                `${hunterName} est effectivement un excellent choix. Passons maintenant à l'équipement !`,
                `Bon choix, Monarque. ${hunterName} a un potentiel énorme avec le bon build.`,
                `${hunterName}... Intéressant. Je vais te montrer comment en faire une légende !`
            ];
            return confirmations[Math.floor(Math.random() * confirmations.length)];
        })(),
        speaker: 'igris',
        duration: 4000,
        autoNext: true
    });
    
    // Pause
    steps.push({
        id: 'pause_3',
        message: "",
        duration: 1500,
        autoNext: true,
        skipBubble: true
    });
    
    // Artifact section
    steps.push({
        id: 'artifact_section',
        message: "Les artefacts sont le cœur de la puissance. Chaque pièce peut être optimisée !",
        speaker: 'igris',
        selector: '.artifact-grid, .artifacts-container, .equipment-section',
        highlight: true,
        duration: 4500,
        autoNext: true
    });
    
    // Helmet slot
    const helmetVariation = getRandomVariation('helmet_instruction');
    steps.push({
        id: 'helmet_slot',
        ...helmetVariation,
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
    });
    
    // Vérifier si Tank intervient après helmet
    const tankInterruption2 = shouldTankInterrupt('helmet_slot');
    if (tankInterruption2) {
        tankInterruption2.sequence.forEach((step, index) => {
            steps.push({
                id: `tank_interruption_2_${index}`,
                ...step,
                autoNext: true
            });
        });
    }
    
    // Helmet click
    steps.push({
        id: 'helmet_click',
        message: "Clique sur le casque pour ouvrir sa configuration !",
        speaker: 'igris',
        selector: () => {
            const helmets = document.querySelectorAll('.artifact-card, .artifact-slot, [data-artifact="Helmet"]');
            const helmet = Array.from(helmets).find(el => {
                const text = el.textContent?.toLowerCase() || '';
                return text.includes('helmet') || text.includes('casque');
            });
            
            if (helmet) {
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
    });
    
    // Wait popup
    steps.push({
        id: 'wait_popup_open',
        message: "",
        duration: 1500,
        autoNext: true,
        skipBubble: true,
        waitForElement: '.fixed[style*="z-index"], .modal, [role="dialog"], .popup-container'
    });
    
    // Popup opened
    steps.push({
        id: 'popup_opened',
        message: "Voilà ! La fenêtre de configuration est ouverte. Tu peux maintenant personnaliser ton casque.",
        speaker: 'igris',
        duration: 3000,
        autoNext: true
    });
    
    // Select main stat
    const statsVariation = getRandomVariation('stats_advice');
    steps.push({
        id: 'select_main_stat',
        ...statsVariation,
        selector: () => {
            const popup = document.querySelector('.fixed[style*="z-index"], .modal, [role="dialog"]');
            if (!popup) {
                console.log('❌ Popup non trouvée');
                return null;
            }
            
            const selects = popup.querySelectorAll('select');
            console.log(`🔍 ${selects.length} selects trouvés dans la popup`);
            
            if (selects.length > 0) {
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
    });
    
    // Cerbere excited about stats
    const cerbereStatsVariation = getRandomVariation('cerbere_reactions');
    steps.push({
        id: 'cerbere_excited_stats',
        ...cerbereStatsVariation,
        duration: 3000,
        autoNext: true
    });
    
    // Select substats
    steps.push({
        id: 'select_substats',
        message: "Maintenant les substats ! Choisis 'Critical Hit Damage' et 'Attack' pour maximiser les dégâts.",
        speaker: 'igris',
        selector: () => {
            const selects = document.querySelectorAll('select');
            const substatSelects = Array.from(selects).filter(select => {
                return Array.from(select.options).some(opt => 
                    opt.text === 'Select Substat' || 
                    opt.text.includes('Substat')
                );
            });
            
            if (substatSelects.length > 0) {
                return substatSelects[0].closest('div');
            }
            
            return document.querySelector('.substats-container, [class*="substat"]');
        },
        highlight: true,
        duration: 6000,
        autoNext: true
    });
    
    // Select set
    steps.push({
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
    });
    
    // Save artifact
    steps.push({
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
    });
    
    // Vérifier si Tank intervient après save
    const tankInterruption3 = shouldTankInterrupt('save_artifact');
    if (tankInterruption3) {
        tankInterruption3.sequence.forEach((step, index) => {
            steps.push({
                id: `tank_interruption_3_${index}`,
                ...step,
                autoNext: true
            });
        });
    }
    
    // Continue avec le reste du tutoriel...
    
    // Cerbere proud
    steps.push({
        id: 'cerbere_proud_save',
        message: "WOUF WOUF ! Tu as configuré ton premier artifact ! Je suis fier de toi ! 🎉",
        speaker: 'cerbere',
        duration: 4000,
        autoNext: true
    });
    
    // Igris explain more
    steps.push({
        id: 'igris_explain_more',
        message: "Excellent travail ! Tu peux faire la même chose pour chaque pièce d'équipement. Plus tard, tu découvriras les synergies entre les sets !",
        speaker: 'igris',
        duration: 6000,
        autoNext: true
    });
    
    // Pause
    steps.push({
        id: 'pause_4',
        message: "",
        duration: 1000,
        autoNext: true,
        skipBubble: true
    });
    
    // Gems section
    steps.push({
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
    });
    
    // Cores mention
    steps.push({
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
    });
    
    // Stats display
    steps.push({
        id: 'stats_display',
        message: "Ici, tu peux voir toutes tes stats finales en temps réel. Chaque modification est instantanément calculée !",
        speaker: 'igris',
        selector: '.stats-display, .final-stats, .character-stats',
        highlight: true,
        duration: 6500,
        autoNext: true
    });
    
    // DPS calculator
    steps.push({
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
    });
    
    // Cerbere proud final
    steps.push({
        id: 'cerbere_proud',
        message: "WOUF WOUF WOUF ! *Cerbère est très fier de tes progrès* 🏆",
        speaker: 'cerbere',
        duration: 3000,
        autoNext: true
    });
    
    // Pause
    steps.push({
        id: 'pause_6',
        message: "",
        duration: 1500,
        autoNext: true,
        skipBubble: true
    });
    
    // Accounts system
    steps.push({
        id: 'accounts_system',
        message: "Tu peux créer plusieurs comptes pour gérer différents builds. Pratique pour tester sans perdre tes créations !",
        speaker: 'igris',
        selector: '.account-select, .account-dropdown, [data-section="accounts"]',
        highlight: true,
        duration: 5500,
        autoNext: true
    });
    
    // Beru & Kaisel
    steps.push({
        id: 'beru_kaisel',
        message: "Beru et Kaisel sont toujours là pour t'aider. N'hésite pas à les invoquer en cas de besoin !",
        speaker: 'igris',
        duration: 4000,
        autoNext: true
    });
    
    // Hall of flame
    steps.push({
        id: 'hall_of_flame',
        message: "Les builds légendaires finissent au Hall of Flame... Crée quelque chose d'exceptionnel et rejoins les légendes ! 🔥",
        speaker: 'igris',
        duration: 5000,
        autoNext: true
    });
    
    // Finale avec variations
    const finaleMessages = [
        "Tu es prêt, Monarque ! Que tes builds soient puissants et tes proc nombreux ! Pour la gloire des Ombres ! ⚔️",
        "La formation est terminée, mon Seigneur. Montre au monde la puissance du Monarque des Ombres ! 💀",
        "Voilà qui conclut notre entraînement. Maintenant, va créer des légendes ! Les ombres t'accompagnent... 🌑"
    ];
    
    steps.push({
        id: 'finale',
        message: finaleMessages[Math.floor(Math.random() * finaleMessages.length)],
        speaker: 'igris',
        duration: 6000,
        autoNext: true
    });
    
    // Cerbere farewell avec variations
    const farewellMessages = [
        "WOUF WOUF ! *Cerbère te salue avec enthousiasme* À bientôt Monarque ! 👋",
        "OUAAAAAAF ! *queue qui remue* Reviens vite avec des nouveaux builds ! 🎉",
        "*Cerbère fait des pirouettes de joie* C'était super ! WOUF WOUF ! 🐺"
    ];
    
    steps.push({
        id: 'cerbere_farewell',
        message: farewellMessages[Math.floor(Math.random() * farewellMessages.length)],
        speaker: 'cerbere',
        duration: 4000,
        autoNext: true
    });
    
    // 🎲 20% de chance d'avoir un épilogue surprise avec Tank
    if (Math.random() < 0.2) {
        steps.push({
            id: 'tank_epilogue',
            message: "*Tank apparaît soudainement* Pas mal le tutoriel... Mais attends de voir mes secrets ! 😈",
            speaker: 'tank',
            duration: 4000,
            autoNext: true
        });
        
        steps.push({
            id: 'cerbere_epilogue',
            message: "WOUF ?! TANK ?! Où tu étais caché ?! GRRRRR ! 😤",
            speaker: 'cerbere',
            duration: 3000,
            autoNext: true
        });
        
        steps.push({
            id: 'tank_epilogue_2',
            message: "*Tank ricane et disparaît dans l'ombre* À la prochaine... Monarque... 👻",
            speaker: 'tank',
            duration: 3500,
            autoNext: true
        });
    }
    
    return steps;
};

// ⚠️ EXPORT PRINCIPAL - Pour la compatibilité
export const tutorialSteps = buildDynamicTutorialSteps();