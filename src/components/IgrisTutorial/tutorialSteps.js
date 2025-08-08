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
    ]
};

// 🐉 TANK INTERVENTIONS SPÉCIALES
const TANK_INTERRUPTIONS = [
    {
        afterStep: 'cerbere_intro',
        chance: 0.3,
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
    }
];

// 📊 Stats disponibles
const HELMET_MAIN_STATS = [
    'Attack %', 'Defense %', 'HP %', 
    'Additional Attack', 'Additional Defense', 'Additional HP'
];

const ALL_SUBSTATS = [
    'Critical Hit Damage', 'Critical Hit Rate', 
    'Attack %', 'Additional Attack',
    'Defense Penetration', 'Damage Increase',
    'Defense %', 'Additional Defense',
    'HP %', 'Additional HP',
    'MP Consumption Reduction', 'Additional MP',
    'MP Recovery Rate Increase (%)', 'Damage Reduction'
];

const DPS_SUBSTATS = [
    'Critical Hit Damage', 'Critical Hit Rate',
    'Attack %', 'Defense Penetration'
];

const TANK_SUBSTATS = [
    'Defense %', 'Additional Defense', 
    'HP %', 'Damage Reduction'
];

// 🎭 Noms d'artifacts amusants
const FUNNY_ARTIFACT_NAMES = [
    "Build de la Mort qui Tue",
    "Pomme Pourrie Def",
    "Cerbère's Best Friend",
    "Tank va rager MDR",
    "Proc ou pas Proc",
    "RNG Jesus Help Me",
    "F2P btw", 
    "Whale Destroyer 3000",
    "Igris Approved™",
    "Press F for Respect",
    "404 Skill Not Found",
    "Git Gud Scrub",
    "No Crit No Life",
    "All Attack Go BRRRR",
    "Budget Build 2025",
    "Meta Slave Ultimate"
];

// 🎲 Fonctions utilitaires
const getRandomVariation = (stepId) => {
    const variations = DIALOGUE_VARIATIONS[stepId];
    if (!variations || variations.length === 0) return null;
    return variations[Math.floor(Math.random() * variations.length)];
};

const shouldTankInterrupt = (stepId) => {
    const interruption = TANK_INTERRUPTIONS.find(int => int.afterStep === stepId);
    if (!interruption) return null;
    const roll = Math.random();
    return roll < interruption.chance ? interruption : null;
};

const getRandomStat = (type = 'main', excludeList = []) => {
    let statPool = type === 'main' ? HELMET_MAIN_STATS : ALL_SUBSTATS;
    statPool = statPool.filter(stat => !excludeList.includes(stat));
    
    if (type === 'sub' && Math.random() < 0.6) {
        const dpsPool = DPS_SUBSTATS.filter(stat => !excludeList.includes(stat));
        if (dpsPool.length > 0) {
            return dpsPool[Math.floor(Math.random() * dpsPool.length)];
        }
    }
    
    if (statPool.length === 0) {
        // Si plus de stats disponibles, prendre une stat au hasard qui n'est pas dans excludeList
        const emergencyPool = ALL_SUBSTATS.filter(stat => !excludeList.includes(stat));
        if (emergencyPool.length > 0) {
            return emergencyPool[Math.floor(Math.random() * emergencyPool.length)];
        }
    }
    
    return statPool[Math.floor(Math.random() * statPool.length)];
};

const isGoodStatForCharacter = (stat) => {
    const universalGoodStats = ['Critical Hit Damage', 'Critical Hit Rate', 'Attack %', 'Defense Penetration', 'Damage Increase'];
    const defenseStats = ['Defense %', 'Additional Defense'];
    const badStats = [ 'Additional MP', 'MP Recovery Rate Increase (%)', 'Damage Reduction'];
    
    if (universalGoodStats.includes(stat)) return 'good';
    if (defenseStats.includes(stat)) return 'defense';
    if (badStats.includes(stat)) return 'bad';
    return 'neutral';
};

// 🎬 Animation CSS pour l'effet démo
const addShakeAnimation = () => {
    if (!document.getElementById('demo-shake-style')) {
        const style = document.createElement('style');
        style.id = 'demo-shake-style';
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
                20%, 40%, 60%, 80% { transform: translateX(10px); }
            }
        `;
        document.head.appendChild(style);
    }
};

// 🏗️ Constructeur dynamique des étapes
export const buildDynamicTutorialSteps = () => {
    const steps = [];
    
    // Ajouter l'animation shake pour l'effet démo
    addShakeAnimation();
    
    // Variables pour stocker les choix
    let selectedMainStat = '';
    let selectedSubstats = [];
    let selectedArtifactName = '';
    
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
    
    // Tank interruption possible
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
    
    // Character selector avec highlight
    steps.push({
        id: 'character_selector_zone',
        message: "D'abord, regarde ici en haut. C'est le sélecteur de personnage.",
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
        duration: 4500,
        autoNext: true
    });
    
    
    // Select random hunter avec vrai changement - VERSION CORRIGÉE
    steps.push({
        id: 'select_random_hunter',
        message: "Changeons pour un autre Hunter... Voyons voir qui sera l'élu !",
        speaker: 'igris',
        duration: 3500,
        autoNext: true,
        action: () => {
            setTimeout(() => {
                // IMPORTANT: On cherche SPÉCIFIQUEMENT le select des personnages
                // PAS celui des artifacts !
                const selects = document.querySelectorAll('select');
                let characterSelect = null;

                for (const select of selects) {
                    // Vérifier que c'est VRAIMENT le select des personnages
                    // en checkant plusieurs options de personnages
                    const options = Array.from(select.options);
                    const hasMultipleCharacters = options.filter(opt =>
                        opt.text.includes('Sung Jinwoo') ||
                        opt.text.includes('Cha Hae-in') ||
                        opt.text.includes('Choi Jong-in') ||
                        opt.text.includes('Baek Yoonho') ||
                        opt.text.includes('Min Byung-gyu')
                    ).length >= 2; // Au moins 2 personnages = c'est le bon select !

                    if (hasMultipleCharacters) {
                        characterSelect = select;
                        console.log('✅ Select des personnages trouvé (pas celui des artifacts !)');
                        break;
                    }
                }

                if (characterSelect) {
                    const currentValue = characterSelect.value;
                    console.log('🔍 Hunter actuel:', currentValue);

                    // Récupérer TOUTES les options valides sauf celle actuelle
                    const validOptions = Array.from(characterSelect.options).filter(opt =>
                        opt.value !== '' && 
                        opt.value !== currentValue &&
                        !opt.text.includes('Select') &&
                        !opt.text.includes('Sélectionner')
                    );

                    console.log(`📋 ${validOptions.length} hunters disponibles`);

                    if (validOptions.length > 0) {
                        // Sélectionner vraiment au hasard
                        const randomIndex = Math.floor(Math.random() * validOptions.length);
                        const selectedOption = validOptions[randomIndex];
                        
                        console.log('🎯 Nouveau Hunter sélectionné:', selectedOption.text);
                        console.log('🔧 Changement de valeur:', currentValue, '→', selectedOption.value);
                        
                        // IMPORTANT: Garder la référence du BON select
                        // et forcer le changement de valeur
                        characterSelect.value = selectedOption.value;
                        
                        // Déclencher tous les événements nécessaires
                        const changeEvent = new Event('change', { bubbles: true, cancelable: true });
                        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
                        
                        characterSelect.dispatchEvent(changeEvent);
                        characterSelect.dispatchEvent(inputEvent);
                        
                        // Vérifier que le changement a bien eu lieu SUR LE BON SELECT
                        setTimeout(() => {
                            console.log('✅ Vérification - Hunter actuel:', characterSelect.value);
                            console.log('🔍 Vérif que c\'est pas le MainStat:', characterSelect.options[0].text);
                            window.selectedHunterForTutorial = selectedOption.text;
                        }, 100);
                    } else {
                        console.log('⚠️ Pas d\'autres hunters disponibles');
                        // Si un seul hunter, on garde quand même son nom
                        const currentOption = Array.from(characterSelect.options).find(opt => 
                            opt.value === currentValue
                        );
                        if (currentOption) {
                            window.selectedHunterForTutorial = currentOption.text;
                        }
                    }
                } else {
                    console.log('❌ Select des personnages non trouvé (tous les selects sont des artifacts ?)');
                }
            }, 1500);
        }
    });
    
    // Cerbere reaction selon le Hunter
    steps.push({
        id: 'cerbere_reaction',
        message: (() => {
            const hunterName = window.selectedHunterForTutorial || 'ce Hunter';
            
            // Réactions spécifiques selon le Hunter
            const specificReactions = {
                'Sung Jinwoo': [
                    `WOUF WOUF WOUF ! ${hunterName} ! LE MONARQUE ! MON IDOLE ! 🤩✨`,
                    `*Cerbère devient fou* ${hunterName} ! LE PLUS FORT ! LE MEILLEUR ! 💪🔥`,
                    `OUAAAAAAF ! ${hunterName} ! Les ombres sont avec nous ! 🌑⚔️`
                ],
                'Cha Hae-in': [
                    `WOUF WOUF ! ${hunterName} ! Elle est trop classe ! J'adore ! 💖⚔️`,
                    `*queue qui remue* ${hunterName} ! La meilleure épéiste ! 🗡️✨`,
                    `OUAF ! ${hunterName} et ses skills de danse mortelle ! 💃💀`
                ],
                'Choi Jong-in': [
                    `Oh... ${hunterName}... *Cerbère fait la grimace* Le mage de feu... 😕🔥`,
                    `Mouais... ${hunterName}... C'est pas mon préféré mais bon... 😒`,
                    `*soupir* ${hunterName}... J'préfère les épéistes moi ! WOUF ! 🗡️`
                ],
                'Baek Yoonho': [
                    `WOUF ! ${hunterName} ! Un autre animal ! RESPECT ! 🐯🤝🐺`,
                    `OUAAAF ! ${hunterName} le tigre blanc ! On est cousins ! 🐅`,
                    `*Cerbère approuve* ${hunterName} ! La force bestiale ! GRRR ! 💪`
                ],
                'Min Byung-gyu': [
                    `Euh... ${hunterName} ? C'est qui lui déjà ? *confus* 🤔`,
                    `${hunterName}... Ah oui le healer... *bâille* Ennuyeux... 😴`,
                    `WOUF ? ${hunterName} ? Il fait quoi à part soigner ? 🏥`
                ],
                'Lim Tae-gyu': [
                    `GRRR ! ${hunterName} ! Je l'aime PAS DU TOUT ! 😤💢`,
                    `Beurk ! ${hunterName} ! Change vite Igris ! WOUF WOUF ! 😡`,
                    `*Cerbère grogne* Pas ${hunterName} ! N'importe qui mais pas lui ! 🚫`
                ],
                'Woo Jinchul': [
                    `${hunterName} ! Le gars sérieux ! *imite une posture droite* 🕴️`,
                    `WOUF ! ${hunterName} et ses lunettes ! Trop corporate ! 👔`,
                    `*Cerbère rigole* ${hunterName} ! Monsieur je-suis-sérieux ! 😎`
                ],
                'Go Gunhee': [
                    `*Cerbère s'incline* ${hunterName}... Le président... Respect ! 🎩`,
                    `WOUF ! ${hunterName} ! Le vieux sage ! J'aime bien ! 👴✨`,
                    `${hunterName}... *voix solennelle* Un grand homme ! WOUF ! 🏛️`
                ]
            };
            
            // Récupérer les réactions spécifiques ou les génériques
            const reactions = specificReactions[hunterName] || [
                `WOUF WOUF ! ${hunterName} ! Pas mal comme choix ! 🎉`,
                `OUAAAAAAF ! ${hunterName} ! Ça peut le faire ! 🐺`,
                `*Cerbère analyse* ${hunterName}... Intéressant ! WOUF ! 🤔`
            ];
            
            return reactions[Math.floor(Math.random() * reactions.length)];
        })(),
        speaker: 'cerbere',
        duration: 3500,
        autoNext: true
    });
    
    // Tank peut aussi réagir parfois (30% de chance)
    if (Math.random() < 0.3) {
        steps.push({
            id: 'tank_hunter_opinion',
            message: (() => {
                const hunterName = window.selectedHunterForTutorial || 'ce Hunter';
                
                const tankOpinions = {
                    'Sung Jinwoo': "Évidemment... Tout le monde veut jouer le protagoniste... 🙄",
                    'Cha Hae-in': "Pas mal ! Au moins elle a du style ! 💅✨",
                    'Choi Jong-in': "Le mage de feu ? Vraiment ? Aucune défense ce type ! 🔥🛡️",
                    'Baek Yoonho': "Un vrai tank celui-là ! J'approuve ! 💪🛡️",
                    'Min Byung-gyu': "Le healer... Au moins il comprend l'importance du support ! 🏥",
                    'Lim Tae-gyu': "Haha ! Excellent choix pour perdre ! 😈",
                    'Woo Jinchul': "Monsieur propre... Il doit ranger ses artifacts par ordre alphabétique ! 📁",
                    'Go Gunhee': "Respect pour les anciens ! Mais il est pas un peu lent ? 👴"
                };
                
                return tankOpinions[hunterName] || `${hunterName} ? Mouais... J'ai vu mieux ! 😏`;
            })(),
            speaker: 'tank',
            duration: 3500,
            autoNext: true
        });
    }
    
    // Igris confirms avec variations selon le Hunter
    steps.push({
        id: 'igris_confirms',
        message: (() => {
            const hunterName = window.selectedHunterForTutorial || 'Ce Hunter';
            
            const igrisComments = {
                'Sung Jinwoo': `${hunterName}... Mon Seigneur original. Un choix évident mais excellent !`,
                'Cha Hae-in': `${hunterName} est redoutable. Ses combos sont dévastateurs bien maîtrisés.`,
                'Choi Jong-in': `${hunterName} nécessite du timing. Ses sorts de zone sont puissants.`,
                'Baek Yoonho': `${hunterName}, force brute et résistance. Parfait pour les débutants.`,
                'Min Byung-gyu': `${hunterName}... Un choix stratégique. Le support est sous-estimé.`,
                'Lim Tae-gyu': `${hunterName} ? *soupir* Si tu insistes... Montrons ce qu'on peut en faire.`,
                'Woo Jinchul': `${hunterName}, méthodique et efficace. Un bon choix technique.`,
                'Go Gunhee': `${hunterName}, l'expérience au service de la puissance. Respectons les anciens.`
            };
            
            const defaultComments = [
                `${hunterName} est un choix intéressant. Voyons son potentiel !`,
                `Bon choix, Monarque. ${hunterName} a des capacités uniques.`,
                `${hunterName}... Je vais te montrer comment l'optimiser !`
            ];
            
            return igrisComments[hunterName] || defaultComments[Math.floor(Math.random() * defaultComments.length)];
        })(),
        speaker: 'igris',
        duration: 4000,
        autoNext: true
    });
    
    // ==========================================
    // 🎨 NOUVELLE SECTION ARTIFACTS - COMPLÈTE
    // ==========================================
    
    // Introduction artifacts
    steps.push({
        id: 'artifact_section',
        message: "Les artifacts sont le cœur de la puissance ! Chaque stat compte, chaque proc peut tout changer !",
        speaker: 'igris',
        selector: '.artifact-grid, .artifacts-container',
        highlight: true,
        duration: 5000,
        autoNext: true
    });
    
    // Focus Helmet
    steps.push({
        id: 'helmet_focus',
        message: "Commençons par le Casque. Je vais te montrer chaque étape de l'optimisation !",
        speaker: 'igris',
        selector: () => {
            const cards = document.querySelectorAll('.artifact-card');
            return cards[0]; // Premier artifact = Helmet
        },
        highlight: true,
        duration: 4500,
        autoNext: true
    });
    
    // ==========================================
    // 📊 CONFIGURATION DES STATS
    // ==========================================
    
    // MainStat
    selectedMainStat = getRandomStat('main');
    steps.push({
        id: 'set_main_stat',
        message: `Je vais configurer la stat principale. ${selectedMainStat} sera parfait ! ${
            selectedMainStat.includes('Attack') ? "Maximum de dégâts ! 💪" :
            selectedMainStat.includes('Defense') ? "Un peu de survie ne fait pas de mal... 🛡️" :
            "Équilibré et efficace ! ⚖️"
        }`,
        speaker: 'igris',
        duration: 5000,
        autoNext: true,
        action: () => {
            setTimeout(() => {
                if (window.setHelmetMainStat) {
                    window.setHelmetMainStat(selectedMainStat);
                }
            }, 1500);
        }
    });
    
    // Réaction si Defense
    if (selectedMainStat.includes('Defense')) {
        steps.push({
            id: 'tank_loves_defense',
            message: "ENFIN ! Quelqu'un qui comprend l'importance de la défense ! 🛡️💖",
            speaker: 'tank',
            duration: 3500,
            autoNext: true
        });
        
        steps.push({
            id: 'cerbere_disagrees',
            message: "Beurk ! Defense sur un Helmet ?! On veut du DAMAGE ! WOUF ! 😤",
            speaker: 'cerbere',
            duration: 3000,
            autoNext: true
        });
    }
    
    // SubStats une par une - AVEC EXCLUSION DE LA MAINSTAT
    for (let i = 1; i <= 4; i++) {
        // IMPORTANT: Exclure la MainStat ET les substats déjà sélectionnées
        const allExclusions = [selectedMainStat, ...selectedSubstats];
        const substat = getRandomStat('sub', allExclusions);
        selectedSubstats.push(substat);
        const statQuality = isGoodStatForCharacter(substat);
        
        // Configuration de la substat
        steps.push({
            id: `set_substat_${i}`,
            message: `SubStat ${i}: ${substat}. ${
                i === 1 ? "La première substat donne le ton !" :
                i === 2 ? "Deuxième substat, on construit le build..." :
                i === 3 ? "Troisième substat, ça prend forme !" :
                "Dernière substat, finalisons ce chef-d'œuvre !"
            }`,
            speaker: 'igris',
            duration: 4000,
            autoNext: true,
            action: () => {
                setTimeout(() => {
                    const setFunction = window[`setSubstat${i}`];
                    if (setFunction) {
                        setFunction(substat);
                    }
                }, 1500);
            }
        });
        
        // Réactions selon la stat
        if (statQuality === 'good' && Math.random() < 0.7) {
            steps.push({
                id: `cerbere_happy_${i}`,
                message: `WOUF WOUF ! ${substat} ! C'est PARFAIT ! *saute partout* 🎯🔥`,
                speaker: 'cerbere',
                duration: 2500,
                autoNext: true
            });
        } else if (statQuality === 'defense') {
            steps.push({
                id: `tank_loves_${i}`,
                message: `OUI ! ${substat} ! Voilà de la vraie optimisation ! 🛡️`,
                speaker: 'tank',
                duration: 3000,
                autoNext: true
            });
            
            if (Math.random() < 0.5) {
                steps.push({
                    id: `cerbere_angry_${i}`,
                    message: "Encore de la def ?! On est pas des tanks ! GRRR ! 💢",
                    speaker: 'cerbere',
                    duration: 2500,
                    autoNext: true
                });
            }
        } else if (statQuality === 'bad' && Math.random() < 0.6) {
            steps.push({
                id: `cerbere_disgusted_${i}`,
                message: `${substat} ?! *fait la grimace* C'est nul ça ! 😖`,
                speaker: 'cerbere',
                duration: 2500,
                autoNext: true
            });
            
            steps.push({
                id: `igris_explains_${i}`,
                message: "Parfois on n'a pas le choix... La RNG est cruelle, Cerbère.",
                speaker: 'igris',
                duration: 3000,
                autoNext: true
            });
        }
    }
    
    // ==========================================
    // 🎲 PROCS (4 AMÉLIORATIONS)
    // ==========================================
    
    // Introduction procs
    steps.push({
        id: 'proc_introduction',
        message: "Maintenant les procs ! 4 améliorations qui peuvent tout changer. Chaque + augmente une substat aléatoirement !",
        speaker: 'igris',
        duration: 5000,
        autoNext: true
    });
    
    // Proc 1
    steps.push({
        id: 'proc_1',
        message: "Premier proc ! *croise les doigts* Allez, on veut du Crit Damage ! 🎲",
        speaker: 'igris',
        duration: 3500,
        autoNext: true,
        action: () => {
            setTimeout(() => {
                if (window.doOneProc) {
                    window.doOneProc();
                }
            }, 1500);
        }
    });
    
    steps.push({
        id: 'cerbere_proc_1',
        message: "WOUF ! Ça monte ! Premier proc validé ! 📈",
        speaker: 'cerbere',
        duration: 2500,
        autoNext: true
    });
    
    // Proc 2
    steps.push({
        id: 'proc_2',
        message: "Deuxième amélioration ! La tension monte... 🎰",
        speaker: 'igris',
        duration: 3500,
        autoNext: true,
        action: () => {
            setTimeout(() => {
                if (window.doOneProc) {
                    window.doOneProc();
                }
            }, 1500);
        }
    });
    
    // Proc 3
    steps.push({
        id: 'proc_3',
        message: "Troisième proc ! On y est presque ! L'artifact prend vie ! ⚡",
        speaker: 'igris',
        duration: 3500,
        autoNext: true,
        action: () => {
            setTimeout(() => {
                if (window.doOneProc) {
                    window.doOneProc();
                }
            }, 1500);
        }
    });
    
    steps.push({
        id: 'cerbere_excited',
        message: "WOUF WOUF WOUF ! Les stats EXPLOSENT ! C'est magnifique ! 🔥💥",
        speaker: 'cerbere',
        duration: 3000,
        autoNext: true
    });
    
    // Proc 4 (final)
    steps.push({
        id: 'proc_4',
        message: "Dernier proc ! Le moment de vérité ! Que la RNG soit avec nous ! 🎲✨",
        speaker: 'igris',
        duration: 4000,
        autoNext: true,
        action: () => {
            setTimeout(() => {
                if (window.doOneProc) {
                    window.doOneProc();
                }
            }, 1500);
        }
    });
    
    // Réaction finale procs
    if (Math.random() < 0.4) {
        steps.push({
            id: 'tank_mocks_procs',
            message: "4 procs et pas all crit damage ? Pfff... Amateur ! 😏",
            speaker: 'tank',
            duration: 3500,
            autoNext: true
        });
        
        steps.push({
            id: 'cerbere_defends',
            message: "GRRR ! C'est la RNG Tank ! T'as juste eu de la chance toi ! WOUF ! 😤",
            speaker: 'cerbere',
            duration: 3000,
            autoNext: true
        });
    } else {
        steps.push({
            id: 'procs_complete',
            message: "Pas mal ces procs ! L'artifact est maintenant bien optimisé ! 💎",
            speaker: 'igris',
            duration: 3500,
            autoNext: true
        });
    }
    
    // ==========================================
    // 🎨 SÉLECTION DU SET
    // ==========================================
    
    // Ouvrir menu des sets
    steps.push({
        id: 'open_set_menu',
        message: "Maintenant, choisissons un set ! Chaque set offre des bonus uniques. Je vais ouvrir le menu...",
        speaker: 'igris',
        duration: 4000,
        autoNext: true,
        action: () => {
            setTimeout(() => {
                if (window.openSetMenu) {
                    window.openSetMenu();
                }
            }, 1500);
        }
    });
    
    // Sélectionner un set
    steps.push({
        id: 'select_set',
        message: "Burning pour les dégâts, Guard pour la défense, Critical pour les coups critiques... Voyons voir !",
        speaker: 'igris',
        duration: 4500,
        autoNext: true,
        action: async () => {
            await new Promise(r => setTimeout(r, 1500));
            if (window.selectRandomSet) {
                await window.selectRandomSet();
            }
        }
    });
    
    steps.push({
        id: 'cerbere_set_reaction',
        message: "WOUF ! J'espère que c'est un set offensif ! Du DAMAGE ! 💪🔥",
        speaker: 'cerbere',
        duration: 3000,
        autoNext: true
    });
    
    // ==========================================
    // 💾 SAUVEGARDE
    // ==========================================
    
    // Cliquer sur Save
    steps.push({
        id: 'click_save_button',
        message: "⚠️ TRÈS IMPORTANT ! Sauvegardons cet artifact. Sans sauvegarde, tu perds TOUT !",
        speaker: 'igris',
        selector: () => {
            const helmetCard = document.getElementsByClassName("artifact-card")[0];
            return helmetCard?.querySelector('img[alt="Save le set"]');
        },
        highlight: true,
        duration: 4500,
        autoNext: true,
        action: () => {
            setTimeout(() => {
                if (window.clickSaveButton) {
                    window.clickSaveButton();
                }
            }, 2000);
        }
    });
    
    // Entrer le nom
    selectedArtifactName = FUNNY_ARTIFACT_NAMES[Math.floor(Math.random() * FUNNY_ARTIFACT_NAMES.length)];
    
    steps.push({
        id: 'enter_artifact_name',
        message: `Je vais nommer cet artifact... "${selectedArtifactName}" ! ${
            selectedArtifactName.includes('Pomme') ? "*ricane* Tank va pas aimer !" :
            selectedArtifactName.includes('Tank') ? "Désolé Tank, c'était trop tentant..." :
            selectedArtifactName.includes('Cerbère') ? "En ton honneur mon ami !" :
            selectedArtifactName.includes('RNG') ? "Prions le dieu de la RNG !" :
            "Un classique du genre !"
        }`,
        speaker: 'igris',
        duration: 5000,
        autoNext: true,
        action: async () => {
            await new Promise(r => setTimeout(r, 1500));
            if (window.enterArtifactName) {
                await window.enterArtifactName(selectedArtifactName);
            }
        }
    });
    
    // Réaction spéciale selon le nom
    if (selectedArtifactName.includes('Pomme') && Math.random() < 0.5) {
        steps.push({
            id: 'tank_angry_name',
            message: "POMME POURRIE ?! C'est une insulte à la défense ! 😤💢",
            speaker: 'tank',
            duration: 3500,
            autoNext: true
        });
        
        steps.push({
            id: 'cerbere_laughs',
            message: "WOUF WOUF WOUF ! *rigole* Tank est pas content ! 🤣",
            speaker: 'cerbere',
            duration: 3000,
            autoNext: true
        });
    } else if (selectedArtifactName.includes('Tank') && Math.random() < 0.5) {
        steps.push({
            id: 'tank_confused',
            message: "Euh... C'est censé être un compliment ou une moquerie ? 🤔",
            speaker: 'tank',
            duration: 3500,
            autoNext: true
        });
    } else if (selectedArtifactName.includes('Cerbère')) {
        steps.push({
            id: 'cerbere_proud',
            message: "WOUF WOUF ! C'est MON artifact ! Je suis trop fier ! 🏆✨",
            speaker: 'cerbere',
            duration: 3000,
            autoNext: true
        });
    }
    
    // Cancel pour laisser le Monarque faire
    steps.push({
        id: 'click_cancel',
        message: "Finalement... Non ! C'est à TOI de créer tes propres artifacts, Monarque ! Je vais annuler.",
        speaker: 'igris',
        duration: 4500,
        autoNext: true,
        action: () => {
            setTimeout(() => {
                if (window.clickCancelButton) {
                    window.clickCancelButton();
                }
            }, 2000);
        }
    });
    
    // Conclusion artifacts
    steps.push({
        id: 'artifact_mastery',
        message: "Parfait ! Tu maîtrises maintenant TOUTES les mécaniques : stats, procs, sets, sauvegarde. À toi de jouer !",
        speaker: 'igris',
        duration: 5500,
        autoNext: true
    });
    
    steps.push({
        id: 'cerbere_encouragement',
        message: "WOUF WOUF ! Tu vas créer des builds DE MALADE ! Go go go Monarque ! 🚀🔥",
        speaker: 'cerbere',
        duration: 3500,
        autoNext: true
    });
    
    // ==========================================
    // 🎆 EFFET DEMO ULTRA RARE (2% chance)
    // ==========================================
    
    if (Math.random() < 0.02) { 
        steps.push({
            id: 'demo_effect_warning',
            message: "*L'atmosphère devient soudainement lourde* Qu'est-ce que... ?! 😨",
            speaker: 'igris',
            duration: 3000,
            autoNext: true
        });
        
        steps.push({
            id: 'tank_demo_activation',
            message: "MWAHAHAHA ! VOUS PENSIEZ QUE C'ÉTAIT FINI ?! ACTIVATION : MODE DEMO ! 🔥💀",
            speaker: 'tank',
            duration: 4000,
            autoNext: true
        });
        
        steps.push({
            id: 'cerbere_panic',
            message: "WOUF WOUF WOUF ?! TANK ! QU'EST-CE QUE TU FAIS ?! C'EST DANGEREUX ! 😱",
            speaker: 'cerbere',
            duration: 3000,
            autoNext: true
        });
        
        steps.push({
            id: 'tank_laser_charge',
            message: "REGARDEZ LA VRAIE PUISSANCE ! LASER ORBITAL... CHARGEMENT... 🎯⚡",
            speaker: 'tank',
            duration: 3500,
            autoNext: true,
            action: () => {
                // Préparation du laser
                setTimeout(() => {
                    console.log('🔥 DEMO EFFECT: Préparation du laser orbital...');
                    // Effet de tremblement
                    document.body.style.animation = 'shake 0.5s';
                    setTimeout(() => {
                        document.body.style.animation = '';
                    }, 500);
                }, 1000);
            }
        });
        
        steps.push({
            id: 'tank_fire_laser',
            message: "FEU ! DESTRUCTION TOTALE DU DOM ! HAHAHAHA ! 💥🔥💀",
            speaker: 'tank',
            duration: 5000,
            autoNext: true,
            action: () => {
                setTimeout(() => {
                    // FIRE THE LASER !
                    if (window.fireTankLaser) {
                        console.log('🚀 DEMO EFFECT: LASER ORBITAL ACTIVÉ !');
                        window.fireTankLaser();
                        
                        // 📊 TRACK THIS LEGENDARY MOMENT!
                        if (window.umami) {
                            window.umami.track('tutorial-demo-laser-fired', {
                                source: 'igris_tutorial',
                                effect: 'tank_orbital_laser',
                                rarity: 'ultra_rare_2_percent'
                            });
                            console.log('📊 UMAMI: Laser orbital tracké ! Un joueur béni par la RNG !');
                        }
                    }
                    
                    // Effets supplémentaires
                    document.body.style.filter = 'hue-rotate(180deg) contrast(2)';
                    setTimeout(() => {
                        document.body.style.filter = 'hue-rotate(90deg) brightness(1.5)';
                        setTimeout(() => {
                            document.body.style.filter = '';
                        }, 1000);
                    }, 500);
                }, 1500);
            }
        });
        
        steps.push({
            id: 'igris_shocked',
            message: "TANK ! TU ES FOU ! Tu as failli détruire l'interface ! 😤",
            speaker: 'igris',
            duration: 3500,
            autoNext: true
        });
        
        steps.push({
            id: 'tank_proud',
            message: "*Tank rigole* C'était juste une démo... Mais avoue que c'était ÉPIQUE ! 😈✨",
            speaker: 'tank',
            duration: 4000,
            autoNext: true
        });
        
        steps.push({
            id: 'cerbere_amazed',
            message: "Wouf... C'était... C'ÉTAIT TROP COOL ! ENCORE ! ENCORE ! 🤩",
            speaker: 'cerbere',
            duration: 3000,
            autoNext: true
        });
        
        steps.push({
            id: 'igris_ends_demo',
            message: "*soupir* Bon... Reprenons le tutoriel SÉRIEUSEMENT maintenant...",
            speaker: 'igris',
            duration: 3500,
            autoNext: true
        });
    }
    
    // ==========================================
    // 💾 SAVE BUTTON (IMPORTANT!)
    // ==========================================
    
    steps.push({
        id: 'save_reminder',
        message: "⚠️ N'oublie JAMAIS : Le bouton Save est TON MEILLEUR AMI ! Sans lui, tu perds tout !",
        speaker: 'igris',
        selector: () => {
            const buttons = document.querySelectorAll('button');
            return Array.from(buttons).find(btn => {
                const text = btn.textContent?.toLowerCase() || '';
                return text === 'save' || text.includes('save') || 
                       text.includes('sauvegarder');
            });
        },
        highlight: true,
        duration: 5000,
        autoNext: true
    });
    
    steps.push({
        id: 'tank_save_advice',
        message: "Même moi je sauvegarde ! Sinon mes builds full def disparaissent ! 💾",
        speaker: 'tank',
        duration: 3500,
        autoNext: true
    });
    
    steps.push({
        id: 'cerbere_save_story',
        message: "Une fois j'ai oublié... J'ai perdu un build avec 4 procs crit damage ! *pleure* 😭",
        speaker: 'cerbere',
        duration: 3500,
        autoNext: true
    });
    
    // ==========================================
    // SUITE DU TUTORIEL
    // ==========================================
    
    // Gems
    steps.push({
        id: 'gems_section',
        message: "Les Gemmes offrent des bonus massifs ! Red pour l'attaque, Blue pour l'HP, Green pour la défense...",
        speaker: 'igris',
        selector: () => {
            const buttons = document.querySelectorAll('button');
            return Array.from(buttons).find(btn => {
                const text = btn.textContent.toLowerCase();
                return text.includes('gem') || text.includes('gemme');
            });
        },
        highlight: true,
        duration: 5200,
        autoNext: true
    });
    
    // Cores
    steps.push({
        id: 'cores_mention',
        message: "Les Noyaux (Cores) sont une autre source de puissance. Explore-les plus tard !",
        speaker: 'igris',
        selector: () => {
            const buttons = document.querySelectorAll('button');
            return Array.from(buttons).find(btn => {
                const text = btn.textContent.toLowerCase();
                return text.includes('core') || text.includes('noyau');
            });
        },
        highlight: true,
        duration: 5000,
        autoNext: true
    });
    
    // Stats display
    steps.push({
        id: 'stats_display',
        message: "Ici, toutes tes stats finales en temps réel. Chaque modification est calculée instantanément !",
        speaker: 'igris',
        selector: '.stats-display, .final-stats, .character-stats',
        highlight: true,
        duration: 6500,
        autoNext: true
    });
    
    // DPS calculator
    steps.push({
        id: 'dps_calculator',
        message: "Le DPS Calculator révèle ta vraie puissance ! N'hésite pas à l'utiliser !",
        speaker: 'igris',
        selector: () => {
            const buttons = document.querySelectorAll('button');
            return Array.from(buttons).find(btn => {
                const text = btn.textContent.toLowerCase();
                return text.includes('calculator') || text.includes('damage') || text.includes('dps');
            });
        },
        highlight: true,
        duration: 5800,
        autoNext: true
    });
    
    // ==========================================
    // 📊 FINAL STATS WITH ARTIFACTS - NOUVEAU !
    // ==========================================
    
    steps.push({
        id: 'final_stats_focus',
        message: "⚠️ TRÈS IMPORTANT ! Regarde ici : 'Final Stats with Artefacts'. C'est le résultat FINAL de ton build !",
        speaker: 'igris',
        selector: () => {
            // Chercher le titre "Final Stats with Artefacts"
            const elements = document.querySelectorAll('*');
            for (const el of elements) {
                if (el.textContent === 'Final Stats with Artefacts' || 
                    el.textContent === 'Final Stats with Artifacts' ||
                    el.classList.contains('FinalStats')) {
                    // Retourner le container parent qui contient les stats
                    return el.parentElement || el;
                }
            }
            // Fallback sur la div des stats finales
            return document.querySelector('.final-stats, .stats-display, [class*="final"]');
        },
        highlight: true,
        duration: 6000,
        autoNext: true
    });
    
    steps.push({
        id: 'final_stats_explanation',
        message: "Si TOUS tes artifacts sont configurés, tes gemmes équipées, tes noyaux activés...",
        speaker: 'igris',
        duration: 5000,
        autoNext: true
    });
    
    steps.push({
        id: 'final_stats_ingame',
        message: "ET si ton personnage est MAX (Weapon 120, Level 115, améliorations à fond)...",
        speaker: 'igris',
        duration: 5000,
        autoNext: true
    });
    
    steps.push({
        id: 'final_stats_match',
        message: "Alors ces stats seront EXACTEMENT les mêmes que dans Solo Leveling Arise ! C'est la magie de BuilderBeru ! ✨",
        speaker: 'igris',
        selector: () => {
            const elements = document.querySelectorAll('*');
            for (const el of elements) {
                if (el.textContent === 'Final Stats with Artefacts' || 
                    el.textContent === 'Final Stats with Artifacts' ||
                    el.classList.contains('FinalStats')) {
                    return el.parentElement || el;
                }
            }
            return document.querySelector('.final-stats, .stats-display');
        },
        highlight: true,
        duration: 6500,
        autoNext: true
    });
    
    steps.push({
        id: 'cerbere_stats_amazed',
        message: "WOUF WOUF ! Les mêmes stats que in-game ?! C'est MAGIQUE ! 🤯✨",
        speaker: 'cerbere',
        duration: 3500,
        autoNext: true
    });
    
    steps.push({
        id: 'tank_stats_respect',
        message: "Ok, là je dois avouer... C'est impressionnant. Respect BuilderBeru ! 👏",
        speaker: 'tank',
        duration: 3500,
        autoNext: true
    });
    
    steps.push({
        id: 'igris_stats_final',
        message: "Utilise ces stats pour vérifier ton build in-game. Si ça ne correspond pas, c'est qu'il te manque quelque chose !",
        speaker: 'igris',
        duration: 5500,
        autoNext: true
    });
    
    // ==========================================
    // SUITE DU TUTORIEL
    // ==========================================
    
    // Accounts
    steps.push({
        id: 'accounts_system',
        message: "Tu peux créer plusieurs comptes pour différents builds. Pratique pour tester !",
        speaker: 'igris',
        selector: '.account-select, .account-dropdown',
        highlight: true,
        duration: 5500,
        autoNext: true
    });
    
    // Beru & Kaisel
    steps.push({
        id: 'beru_kaisel',
        message: "Beru et Kaisel sont toujours là pour t'aider. N'hésite pas à les invoquer !",
        speaker: 'igris',
        duration: 4000,
        autoNext: true
    });
    
    // Hall of flame
    steps.push({
        id: 'hall_of_flame',
        message: "Les builds légendaires finissent au Hall of Flame... Rejoins les légendes ! 🔥",
        speaker: 'igris',
        duration: 5000,
        autoNext: true
    });
    
    // Finale
    const finaleMessages = [
        "Tu es prêt, Monarque ! Que tes builds soient puissants et tes procs nombreux ! ⚔️",
        "La formation est terminée. Montre au monde la puissance du Monarque des Ombres ! 💀",
        "L'entraînement est fini. Va créer des légendes ! Les ombres t'accompagnent... 🌑"
    ];
    
    steps.push({
        id: 'finale',
        message: finaleMessages[Math.floor(Math.random() * finaleMessages.length)],
        speaker: 'igris',
        duration: 6000,
        autoNext: true
    });
    
    // Cerbere farewell
    steps.push({
        id: 'cerbere_farewell',
        message: "WOUF WOUF ! *Cerbère te salue* À bientôt Monarque ! Fais des builds de FOU ! 👋🔥",
        speaker: 'cerbere',
        duration: 4000,
        autoNext: true
    });
    
    // Épilogue surprise (20% chance)
    if (Math.random() < 0.2) {
        steps.push({
            id: 'tank_epilogue',
            message: "*Tank apparaît* Pas mal... Mais attends de voir mes builds FULL DEF ! 😈🛡️",
            speaker: 'tank',
            duration: 4000,
            autoNext: true
        });
        
        steps.push({
            id: 'cerbere_final',
            message: "GRRR ! Toujours ta défense Tank ! WOUF ! 😤",
            speaker: 'cerbere',
            duration: 3000,
            autoNext: true
        });
        
        steps.push({
            id: 'tank_disappears',
            message: "*ricane et disparaît* La défense, c'est la vie... 👻",
            speaker: 'tank',
            duration: 3500,
            autoNext: true
        });
    }
    
    return steps;
};

// Export principal
export const tutorialSteps = buildDynamicTutorialSteps();

// ==========================================
// 🔧 FONCTIONS WINDOW (NE PAS MODIFIER)
// ==========================================

// MainStat
window.setHelmetMainStat = function(value = 'Attack %') {
    const helmetCard = document.getElementsByClassName("artifact-card")[0];
    const mainStatDiv = helmetCard.children[1];
    const select = mainStatDiv.querySelector('select');
    
    if (select) {
        const nativeValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
        nativeValueSetter.call(select, value);
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`✅ MainStat -> ${value}`);
        return true;
    }
    return false;
};

// SubStats
window.setSubstat1 = function(value = 'Critical Hit Damage') {
    const helmetCard = document.getElementsByClassName("artifact-card")[0];
    const select = helmetCard.children[2].querySelector('select');
    
    if (select) {
        const nativeValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
        nativeValueSetter.call(select, value);
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`✅ SubStat 1 -> ${value}`);
        return true;
    }
    return false;
};

window.setSubstat2 = function(value = 'Critical Hit Rate') {
    const helmetCard = document.getElementsByClassName("artifact-card")[0];
    const select = helmetCard.children[3].querySelector('select');
    
    if (select) {
        const nativeValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
        nativeValueSetter.call(select, value);
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`✅ SubStat 2 -> ${value}`);
        return true;
    }
    return false;
};

window.setSubstat3 = function(value = 'Defense Penetration') {
    const helmetCard = document.getElementsByClassName("artifact-card")[0];
    const select = helmetCard.children[4].querySelector('select');
    
    if (select) {
        const nativeValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
        nativeValueSetter.call(select, value);
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`✅ SubStat 3 -> ${value}`);
        return true;
    }
    return false;
};

window.setSubstat4 = function(value = 'Additional Attack') {
    const helmetCard = document.getElementsByClassName("artifact-card")[0];
    const select = helmetCard.children[5].querySelector('select');
    
    if (select) {
        const nativeValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
        nativeValueSetter.call(select, value);
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`✅ SubStat 4 -> ${value}`);
        return true;
    }
    return false;
};

// Procs
window.doOneProc = function() {
    const helmetCard = document.getElementsByClassName("artifact-card")[0];
    const plusButtons = helmetCard.querySelectorAll('img[alt="Plus"]');
    const activeButtons = Array.from(plusButtons).filter(btn => 
        !btn.classList.contains('opacity-50') && 
        !btn.classList.contains('cursor-not-allowed')
    );
    
    if (activeButtons.length > 0) {
        const randomButton = activeButtons[Math.floor(Math.random() * activeButtons.length)];
        randomButton.click();
        
        const allButtons = Array.from(plusButtons);
        const clickedIndex = allButtons.indexOf(randomButton);
        const substatIndex = Math.floor(clickedIndex / 2) + 1;
        
        console.log(`✅ Proc effectué sur SubStat ${substatIndex}`);
        return true;
    }
    
    console.log('❌ Aucun bouton + actif');
    return false;
};

// Set
window.openSetMenu = function() {
    const helmetCard = document.getElementsByClassName("artifact-card")[0];
    const setButton = helmetCard.querySelector('img[alt="Sélectionner un Set"]');
    
    if (setButton) {
        console.log('✅ Ouverture du menu des sets...');
        setButton.click();
        return true;
    }
    
    console.log('❌ Bouton Set non trouvé');
    return false;
};

window.selectRandomSet = async function() {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const allUls = document.querySelectorAll('ul');
    let setMenu = null;
    
    for (const ul of allUls) {
        const lis = ul.querySelectorAll('li');
        if (lis.length > 0) {
            const firstLiText = lis[0].textContent;
            if (firstLiText.includes('Set') || firstLiText.includes('Burning') || firstLiText.includes('Guard')) {
                setMenu = ul;
                break;
            }
        }
    }
    
    if (!setMenu) {
        console.log('❌ Menu des sets non trouvé');
        return false;
    }
    
    const setOptions = setMenu.querySelectorAll('li');
    if (setOptions.length > 0) {
        const randomIndex = Math.floor(Math.random() * setOptions.length);
        const selectedSet = setOptions[randomIndex];
        const setName = selectedSet.textContent.trim();
        
        console.log(`✅ Set sélectionné: ${setName}`);
        selectedSet.click();
        return true;
    }
    
    return false;
};

// Save
window.clickSaveButton = function() {
    const helmetCard = document.getElementsByClassName("artifact-card")[0];
    const saveButton = helmetCard.querySelector('img[alt="Save le set"]');
    
    if (saveButton) {
        console.log('✅ Bouton Save trouvé, clic...');
        saveButton.click();
        return true;
    }
    
    console.log('❌ Bouton Save non trouvé');
    return false;
};

window.enterArtifactName = async function(name = "GG Igris Build") {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const allInputs = document.getElementsByTagName('input');
    const artifactNameInput = allInputs[5];
    
    if (artifactNameInput) {
        console.log(`✅ Input trouvé, saisie de: "${name}"`);
        
        const nativeValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeValueSetter.call(artifactNameInput, name);
        
        artifactNameInput.dispatchEvent(new Event('input', { bubbles: true }));
        artifactNameInput.dispatchEvent(new Event('change', { bubbles: true }));
        
        console.log(`Value après update: "${artifactNameInput.value}"`);
        return true;
    }
    
    console.log('❌ Input non trouvé');
    return false;
};

window.clickCancelButton = function() {
    const cancelButton = Array.from(document.querySelectorAll('button')).find(btn => 
        btn.textContent === 'Cancel' || 
        btn.textContent === 'Annuler'
    );
    
    if (cancelButton) {
        console.log('✅ Bouton Cancel trouvé, clic...');
        cancelButton.click();
        return true;
    }
    
    console.log('❌ Bouton Cancel non trouvé');
    return false;
};