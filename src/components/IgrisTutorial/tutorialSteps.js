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
    
    // 🎭 VARIATIONS IGRISK (Tank déguisé)
    welcome_igrisk: [
        {
            message: "Salutations, Monarque ! Je suis... *tousse* IGRIS ! Oui, c'est moi, Igris ! Totalement pas Tank déguisé ! 🗡️😅",
            speaker: 'igrisk'
        },
        {
            message: "Mon Seigneur ! C'est moi Igr-- *voix qui dérape* IGRIS ! Je vais te montrer les builds... avec beaucoup de DÉFENSE ! Euh, je veux dire équilibrés ! ⚔️🛡️",
            speaker: 'igrisk'
        },
        {
            message: "Monarque... *ajuste son déguisement* Je suis votre ombre fidèle Igris ! Pas du tout Tank avec une perruque ! Commençons ! 💀",
            speaker: 'igrisk'
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
    
    // 🐕 CERBÈRE RÉAGIT À IGRISK
    cerbere_suspicious: [
        {
            message: "*renifle* WOUF ? Tu sens bizarre Igris... Tu sens comme... TANK ?! 🤔",
            speaker: 'cerbere'
        },
        {
            message: "GRRR... Igris, pourquoi tu parles de défense tout le temps ? C'est louche ! WOUF ! 👀",
            speaker: 'cerbere'
        },
        {
            message: "*Cerbère plisse les yeux* Attends... C'EST PAS IGRIS ! C'EST TANK ! WOUF WOUF ! 😱",
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
    
    // 🎭 IGRISK ESSAIE DE CALMER CERBÈRE
    igrisk_calms: [
        {
            message: "Du calme Cerb-- je veux dire, bon chien ! *tousse* Pardon, Cerbère. Concentrons-nous sur la DÉFENSE-- euh, le tutoriel !",
            speaker: 'igrisk'
        },
        {
            message: "*voix forcée* Cerbère, sois sage ! Igris-- MOI, Igris, te demande de te calmer ! Les tanks-- LES OMBRES comptent sur nous !",
            speaker: 'igrisk'
        },
        {
            message: "*sueur* Cerbère arrête de me renifler ! Je suis Igris ! Pas Tank ! Pourquoi je sentirais la pomme pourrie ?!",
            speaker: 'igrisk'
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
    },
    // 🎭 INTERRUPTION SPÉCIALE SI IGRISK
    {
        afterStep: 'cerbere_suspicious_igrisk',
        chance: 0.8, // Plus de chance si c'est Igrisk !
        sequence: [
            {
                message: "Mais... mais... C'est MA voix ça ! IGRIS ?! QU'EST-CE QUE TU FAIS AVEC MA VOIX ?! 😱",
                speaker: 'tank',
                duration: 4000
            },
            {
                message: "*panique* NON NON ! Je suis Igris ! Regarde, j'ai une épée ! *sort un bouclier* MERDE !",
                speaker: 'igrisk',
                duration: 3500
            },
            {
                message: "WOUF WOUF WOUF ! JE LE SAVAIS ! C'EST TANK DÉGUISÉ ! *rigole* 🤣",
                speaker: 'cerbere',
                duration: 3000
            },
            {
                message: "IMPOSTEUR ! Tu oses usurper l'identité d'Igris ?! Rends-moi mon déguisement ! 😤",
                speaker: 'tank',
                duration: 3500
            },
            {
                message: "*abandonne* Ok ok... C'est moi... Mais Igris était aux toilettes alors... 😅",
                speaker: 'igrisk',
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

// 🎭 STATS PRÉFÉRÉES PAR IGRISK (Tank déguisé)
const IGRISK_PREFERRED_STATS = [
    'Defense %', 'Additional Defense'
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

// 🎭 Noms spéciaux si IGRISK
const IGRISK_ARTIFACT_NAMES = [
    "Definitely Not Tank's Build",
    "Pomme d'or ULTRA DEF",
    "Full Defense Go BRRRR",
    "Tank Suprémacie",
    "Igris? Never Heard of Him",
    "Bouclier > Épée",
    "Defense is the Best Offense",
    "Pas du tout suspect",
    "100% Legit Igris Build"
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

const getRandomStat = (type = 'main', excludeList = [], isIgrisk = false) => {
    // Si c'est Igrisk, favoriser les stats de défense !
    if (isIgrisk && Math.random() < 0.7) {
        const defensePool = IGRISK_PREFERRED_STATS.filter(stat => !excludeList.includes(stat));
        if (defensePool.length > 0) {
            return defensePool[Math.floor(Math.random() * defensePool.length)];
        }
    }
    
    let statPool = type === 'main' ? HELMET_MAIN_STATS : ALL_SUBSTATS;
    statPool = statPool.filter(stat => !excludeList.includes(stat));
    
    if (type === 'sub' && Math.random() < 0.6 && !isIgrisk) {
        const dpsPool = DPS_SUBSTATS.filter(stat => !excludeList.includes(stat));
        if (dpsPool.length > 0) {
            return dpsPool[Math.floor(Math.random() * dpsPool.length)];
        }
    }
    
    if (statPool.length === 0) {
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
    
    // 🎭 DÉTERMINER SI C'EST IGRISK OU IGRIS (5% de chance)
    const IS_IGRISK = Math.random() < 0.05;
    const GUIDE_NAME = IS_IGRISK ? 'igrisk' : 'igris';
    
    console.log(IS_IGRISK ? '🎭 IGRISK DETECTED! Tank s\'est déguisé !' : '⚔️ Igris guide normal');
    
    // Ajouter l'animation shake pour l'effet démo
    addShakeAnimation();
    
    // Variables pour stocker les choix
    let selectedMainStat = '';
    let selectedSubstats = [];
    let selectedArtifactName = '';
    
    // 1. Welcome
    const welcomeVariation = IS_IGRISK 
        ? getRandomVariation('welcome_igrisk')
        : getRandomVariation('welcome');
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
    
    // 🎭 SI IGRISK, CERBÈRE DEVIENT SUSPICIEUX
    if (IS_IGRISK && Math.random() < 0.7) {
        const suspiciousVariation = getRandomVariation('cerbere_suspicious');
        steps.push({
            id: 'cerbere_suspicious_igrisk',
            ...suspiciousVariation,
            duration: 3500,
            autoNext: true
        });
        
        // Tank peut réagir s'il est découvert
        const tankInterruption = shouldTankInterrupt('cerbere_suspicious_igrisk');
        if (tankInterruption) {
            tankInterruption.sequence.forEach((step, index) => {
                steps.push({
                    id: `tank_discovered_${index}`,
                    ...step,
                    autoNext: true
                });
            });
            
            // Après la découverte, on continue quand même le tuto
            steps.push({
                id: 'igrisk_continues_anyway',
                message: "*tousse* Bon bon... Peu importe qui je suis, on a un tutoriel à finir ! Focus sur la DÉFEN-- sur le BUILD !",
                speaker: 'igrisk',
                duration: 4000,
                autoNext: true
            });
        }
    } else if (!IS_IGRISK) {
        // Tank interruption normale si c'est le vrai Igris
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
    }
    
    // 3. Igris/Igrisk calms
    const calmVariation = IS_IGRISK 
        ? getRandomVariation('igrisk_calms')
        : getRandomVariation('igris_calms');
    steps.push({
        id: 'guide_calms',
        ...calmVariation,
        duration: 4000,
        autoNext: true
    });
    
    // Character selector avec highlight
    steps.push({
        id: 'character_selector_zone',
        message: IS_IGRISK 
            ? "D'abord, regarde ici. Le sélecteur de... *regarde ses notes* personnage ! Oui c'est ça !"
            : "D'abord, regarde ici en haut. C'est le sélecteur de personnage.",
        speaker: GUIDE_NAME,
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
    
    // Select random hunter
    steps.push({
        id: 'select_random_hunter',
        message: IS_IGRISK
            ? "Changeons pour un Hunter avec beaucoup de DÉFENSE-- euh, je veux dire, un Hunter équilibré !"
            : "Changeons pour un autre Hunter... Voyons voir qui sera l'élu !",
        speaker: GUIDE_NAME,
        duration: 3500,
        autoNext: true,
        action: () => {
            setTimeout(() => {
                const selects = document.querySelectorAll('select');
                let characterSelect = null;

                for (const select of selects) {
                    const options = Array.from(select.options);
                    const hasMultipleCharacters = options.filter(opt =>
                        opt.text.includes('Sung Jinwoo') ||
                        opt.text.includes('Cha Hae-in') ||
                        opt.text.includes('Choi Jong-in') ||
                        opt.text.includes('Baek Yoonho') ||
                        opt.text.includes('Min Byung-gyu')
                    ).length >= 2;

                    if (hasMultipleCharacters) {
                        characterSelect = select;
                        console.log('✅ Select des personnages trouvé');
                        break;
                    }
                }

                if (characterSelect) {
                    const currentValue = characterSelect.value;
                    console.log('🔍 Hunter actuel:', currentValue);

                    const validOptions = Array.from(characterSelect.options).filter(opt =>
                        opt.value !== '' && 
                        opt.value !== currentValue &&
                        !opt.text.includes('Select') &&
                        !opt.text.includes('Sélectionner')
                    );

                    if (validOptions.length > 0) {
                        // Si Igrisk, préférer Baek Yoonho (tank) !
                        let selectedOption;
                        if (IS_IGRISK) {
                            const tankOption = validOptions.find(opt => opt.text.includes('Baek Yoonho'));
                            selectedOption = tankOption || validOptions[Math.floor(Math.random() * validOptions.length)];
                        } else {
                            const randomIndex = Math.floor(Math.random() * validOptions.length);
                            selectedOption = validOptions[randomIndex];
                        }
                        
                        console.log('🎯 Nouveau Hunter sélectionné:', selectedOption.text);
                        
                        characterSelect.value = selectedOption.value;
                        
                        const changeEvent = new Event('change', { bubbles: true, cancelable: true });
                        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
                        
                        characterSelect.dispatchEvent(changeEvent);
                        characterSelect.dispatchEvent(inputEvent);
                        
                        window.selectedHunterForTutorial = selectedOption.text;
                    }
                }
            }, 1500);
        }
    });
    
    // Cerbere reaction selon le Hunter
    steps.push({
        id: 'cerbere_reaction',
        message: (() => {
            const hunterName = window.selectedHunterForTutorial || 'ce Hunter';
            
            // Si c'est Igrisk et qu'il a choisi Baek Yoonho
            if (IS_IGRISK && hunterName === 'Baek Yoonho') {
                return `WOUF ?! Baek Yoonho ?! Comme par hasard tu choisis le TANK ! TRÈS SUSPECT IGRIS ! 🤨`;
            }
            
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
    
    // Tank réaction (différente si c'est Igrisk)
    if (Math.random() < 0.3) {
        steps.push({
            id: 'tank_hunter_opinion',
            message: (() => {
                const hunterName = window.selectedHunterForTutorial || 'ce Hunter';
                
                if (IS_IGRISK) {
                    // Tank est confus s'il entend sa propre voix
                    return "Attendez... Cette voix... C'est MA voix ça ! QUI UTILISE MA VOIX ?! 😠";
                }
                
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
        
        if (IS_IGRISK) {
            steps.push({
                id: 'igrisk_panic',
                message: "*panique intérieurement* NON NON ! Tu dois te tromper ! Je suis Igris ! Regarde mon épée ! *montre un bouclier* MERDE !",
                speaker: 'igrisk',
                duration: 3500,
                autoNext: true
            });
        }
    }
    
    // Guide confirms
    steps.push({
        id: 'guide_confirms',
        message: (() => {
            const hunterName = window.selectedHunterForTutorial || 'Ce Hunter';
            
            if (IS_IGRISK) {
                return `${hunterName}... Excellent choix pour la DÉFENSE-- je veux dire, pour tout ! Continuons vite avant que-- continuons !`;
            }
            
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
        speaker: GUIDE_NAME,
        duration: 4000,
        autoNext: true
    });
    
    // ==========================================
    // 🎨 SECTION ARTIFACTS
    // ==========================================
    
    // Introduction artifacts
    steps.push({
        id: 'artifact_section',
        message: IS_IGRISK
            ? "Les artifacts ! L'endroit où la DÉFENSE brille ! Euh... je veux dire, où toutes les stats brillent !"
            : "Les artifacts sont le cœur de la puissance ! Chaque stat compte, chaque proc peut tout changer !",
        speaker: GUIDE_NAME,
        selector: '.artifact-grid, .artifacts-container',
        highlight: true,
        duration: 5000,
        autoNext: true
    });
    
    // Focus Helmet
    steps.push({
        id: 'helmet_focus',
        message: IS_IGRISK
            ? "Le Casque ! Parfait pour mettre de la DÉFENSE-- *tousse* pour optimiser tes stats !"
            : "Commençons par le Casque. Je vais te montrer chaque étape de l'optimisation !",
        speaker: GUIDE_NAME,
        selector: () => {
            const cards = document.querySelectorAll('.artifact-card');
            return cards[0];
        },
        highlight: true,
        duration: 4500,
        autoNext: true
    });
    
    // ==========================================
    // 📊 CONFIGURATION DES STATS
    // ==========================================
    
    // MainStat (Igrisk favorise la défense)
    selectedMainStat = getRandomStat('main', [], IS_IGRISK);
    steps.push({
        id: 'set_main_stat',
        message: IS_IGRISK
            ? `La stat principale sera... ${selectedMainStat} ! ${
                selectedMainStat.includes('Defense') ? "PARFAIT ! La défense c'est la VIE ! 🛡️💪" :
                selectedMainStat.includes('Attack') ? "*déçu* De l'attaque... Bon si tu insistes... 😔" :
                "Pas mal... mais la défense aurait été mieux ! 🛡️"
            }`
            : `Je vais configurer la stat principale. ${selectedMainStat} sera parfait ! ${
                selectedMainStat.includes('Attack') ? "Maximum de dégâts ! 💪" :
                selectedMainStat.includes('Defense') ? "Un peu de survie ne fait pas de mal... 🛡️" :
                "Équilibré et efficace ! ⚖️"
            }`,
        speaker: GUIDE_NAME,
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
    
    // Réactions selon la stat
    if (selectedMainStat.includes('Defense')) {
        if (IS_IGRISK) {
            steps.push({
                id: 'igrisk_loves_defense',
                message: "*essaie de cacher sa joie* Ah... Defense... C'est... c'est un choix correct. Très correct. *sourire suspect* 😊",
                speaker: 'igrisk',
                duration: 3500,
                autoNext: true
            });
        } else {
            steps.push({
                id: 'tank_loves_defense',
                message: "ENFIN ! Quelqu'un qui comprend l'importance de la défense ! 🛡️💖",
                speaker: 'tank',
                duration: 3500,
                autoNext: true
            });
        }
        
        steps.push({
            id: 'cerbere_disagrees',
            message: "Beurk ! Defense sur un Helmet ?! On veut du DAMAGE ! WOUF ! 😤",
            speaker: 'cerbere',
            duration: 3000,
            autoNext: true
        });
    }
    
    // SubStats (Igrisk favorise toujours la défense)
    for (let i = 1; i <= 4; i++) {
        const allExclusions = [selectedMainStat, ...selectedSubstats];
        const substat = getRandomStat('sub', allExclusions, IS_IGRISK);
        selectedSubstats.push(substat);
        const statQuality = isGoodStatForCharacter(substat);
        
        steps.push({
            id: `set_substat_${i}`,
            message: IS_IGRISK
                ? `SubStat ${i}: ${substat}. ${
                    statQuality === 'defense' ? "*murmure* Oui... OUI ! Plus de défense ! 🛡️" :
                    statQuality === 'good' ? "*déçu* Bon... si tu veux du damage..." :
                    "Hmm... intéressant..."
                }`
                : `SubStat ${i}: ${substat}. ${
                    i === 1 ? "La première substat donne le ton !" :
                    i === 2 ? "Deuxième substat, on construit le build..." :
                    i === 3 ? "Troisième substat, ça prend forme !" :
                    "Dernière substat, finalisons ce chef-d'œuvre !"
                }`,
            speaker: GUIDE_NAME,
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
        
        // Réactions spéciales si Igrisk et defense
        if (IS_IGRISK && statQuality === 'defense' && Math.random() < 0.5) {
            steps.push({
                id: `cerbere_suspicious_stat_${i}`,
                message: "WOUF ! Encore de la défense ?! Igris tu es VRAIMENT bizarre aujourd'hui ! 🤔",
                speaker: 'cerbere',
                duration: 2500,
                autoNext: true
            });
            
            steps.push({
                id: `igrisk_excuse_${i}`,
                message: "*nerveux* C'est... c'est la méta actuelle ! La défense c'est... stratégique ! Oui voilà !",
                speaker: 'igrisk',
                duration: 3000,
                autoNext: true
            });
        } else if (statQuality === 'good' && Math.random() < 0.7) {
            steps.push({
                id: `cerbere_happy_${i}`,
                message: `WOUF WOUF ! ${substat} ! C'est PARFAIT ! *saute partout* 🎯🔥`,
                speaker: 'cerbere',
                duration: 2500,
                autoNext: true
            });
        }
    }
    
    // ==========================================
    // 🎲 PROCS
    // ==========================================
    
    steps.push({
        id: 'proc_introduction',
        message: IS_IGRISK
            ? "Les procs ! 4 chances d'avoir plus de DÉFENSE-- je veux dire, d'améliorer les stats ! *tousse*"
            : "Maintenant les procs ! 4 améliorations qui peuvent tout changer. Chaque + augmente une substat aléatoirement !",
        speaker: GUIDE_NAME,
        duration: 5000,
        autoNext: true
    });
    
    // Procs 1-4
    for (let procNum = 1; procNum <= 4; procNum++) {
        steps.push({
            id: `proc_${procNum}`,
            message: IS_IGRISK
                ? `Proc ${procNum} ! *prie pour de la défense* Allez RNG, sois gentille ! 🎲🛡️`
                : `${
                    procNum === 1 ? "Premier proc ! *croise les doigts* Allez, on veut du Crit Damage ! 🎲" :
                    procNum === 2 ? "Deuxième amélioration ! La tension monte... 🎰" :
                    procNum === 3 ? "Troisième proc ! On y est presque ! L'artifact prend vie ! ⚡" :
                    "Dernier proc ! Le moment de vérité ! Que la RNG soit avec nous ! 🎲✨"
                }`,
            speaker: GUIDE_NAME,
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
        
        if (procNum === 3) {
            steps.push({
                id: 'cerbere_excited',
                message: "WOUF WOUF WOUF ! Les stats EXPLOSENT ! C'est magnifique ! 🔥💥",
                speaker: 'cerbere',
                duration: 3000,
                autoNext: true
            });
        }
    }
    
    // Réaction finale procs
    if (IS_IGRISK) {
        steps.push({
            id: 'igrisk_procs_opinion',
            message: "Pas assez de procs défense... *murmure* La RNG est cruelle avec les tanks...",
            speaker: 'igrisk',
            duration: 3500,
            autoNext: true
        });
    } else if (Math.random() < 0.4) {
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
    }
    
    // ==========================================
    // 🎨 SÉLECTION DU SET
    // ==========================================
    
    steps.push({
        id: 'open_set_menu',
        message: IS_IGRISK
            ? "Les sets ! J'espère que tu vas choisir Guard ! Euh... je veux dire, choisis ce que tu veux !"
            : "Maintenant, choisissons un set ! Chaque set offre des bonus uniques. Je vais ouvrir le menu...",
        speaker: GUIDE_NAME,
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
    
    steps.push({
        id: 'select_set',
        message: IS_IGRISK
            ? "Guard pour la défense ! Guard ! GUARD ! *tousse* Pardon... Choisis ce que tu veux bien sûr..."
            : "Burning pour les dégâts, Guard pour la défense, Critical pour les coups critiques... Voyons voir !",
        speaker: GUIDE_NAME,
        duration: 4500,
        autoNext: true,
        action: async () => {
            await new Promise(r => setTimeout(r, 1500));
            if (window.selectRandomSet) {
                // Si Igrisk, essayer de forcer Guard !
                if (IS_IGRISK && window.selectGuardSet) {
                    await window.selectGuardSet();
                } else {
                    await window.selectRandomSet();
                }
            }
        }
    });
    
    steps.push({
        id: 'cerbere_set_reaction',
        message: IS_IGRISK
            ? "WOUF ! Si c'est Guard je sais que c'est toi TANK ! 😤"
            : "WOUF ! J'espère que c'est un set offensif ! Du DAMAGE ! 💪🔥",
        speaker: 'cerbere',
        duration: 3000,
        autoNext: true
    });
    
    // ==========================================
    // 💾 SAUVEGARDE
    // ==========================================
    
    steps.push({
        id: 'click_save_button',
        message: IS_IGRISK
            ? "⚠️ SAUVEGARDE ! Sans ça, tu perds ta belle DÉFENSE-- tes stats ! Sauvegarde !"
            : "⚠️ TRÈS IMPORTANT ! Sauvegardons cet artifact. Sans sauvegarde, tu perds TOUT !",
        speaker: GUIDE_NAME,
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
    
    // Nom de l'artifact
    selectedArtifactName = IS_IGRISK 
        ? IGRISK_ARTIFACT_NAMES[Math.floor(Math.random() * IGRISK_ARTIFACT_NAMES.length)]
        : FUNNY_ARTIFACT_NAMES[Math.floor(Math.random() * FUNNY_ARTIFACT_NAMES.length)];
    
    steps.push({
        id: 'enter_artifact_name',
        message: IS_IGRISK
            ? `Le nom parfait : "${selectedArtifactName}" ! ${
                selectedArtifactName.includes('Tank') ? "*panique* NON ! Pas Tank ! Igris ! IGRIS !" :
                selectedArtifactName.includes('Defense') ? "*murmure* Parfait... 🛡️" :
                "Un nom totalement normal, rien de suspect !"
            }`
            : `Je vais nommer cet artifact... "${selectedArtifactName}" ! ${
                selectedArtifactName.includes('Pomme') ? "*ricane* Tank va pas aimer !" :
                selectedArtifactName.includes('Tank') ? "Désolé Tank, c'était trop tentant..." :
                selectedArtifactName.includes('Cerbère') ? "En ton honneur mon ami !" :
                selectedArtifactName.includes('RNG') ? "Prions le dieu de la RNG !" :
                "Un classique du genre !"
            }`,
        speaker: GUIDE_NAME,
        duration: 5000,
        autoNext: true,
        action: async () => {
            await new Promise(r => setTimeout(r, 1500));
            if (window.enterArtifactName) {
                await window.enterArtifactName(selectedArtifactName);
            }
        }
    });
    
    // Réaction au nom si suspect
    if (IS_IGRISK && selectedArtifactName.includes('Tank')) {
        steps.push({
            id: 'cerbere_gotcha',
            message: "AH ! JE LE SAVAIS ! C'EST TANK ! TU T'ES TRAHI ! WOUF WOUF ! 🎯",
            speaker: 'cerbere',
            duration: 3500,
            autoNext: true
        });
        
        steps.push({
            id: 'igrisk_caught',
            message: "*abandonne le déguisement* Bon ok... C'est moi... Mais j'ai fait un bon tutoriel non ? 😅",
            speaker: 'igrisk',
            duration: 3500,
            autoNext: true
        });
        
        steps.push({
            id: 'real_tank_appears',
            message: "IMPOSTEUR ! Comment oses-tu te faire passer pour Igris ?! La défense ne s'enseigne pas en cachette ! 😤",
            speaker: 'tank',
            duration: 4000,
            autoNext: true
        });
    }
    
    // Cancel
    steps.push({
        id: 'click_cancel',
        message: IS_IGRISK
            ? "Finalement... *panique* Le vrai Igris arrive ! Je dois partir ! À toi de jouer Monarque ! *fuit*"
            : "Finalement... Non ! C'est à TOI de créer tes propres artifacts, Monarque ! Je vais annuler.",
        speaker: GUIDE_NAME,
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
    
    // Conclusion
    steps.push({
        id: 'artifact_mastery',
        message: IS_IGRISK
            ? "Tu maîtrises tout ! Surtout la DÉFENSE-- je veux dire, TOUTES les mécaniques ! *disparaît rapidement*"
            : "Parfait ! Tu maîtrises maintenant TOUTES les mécaniques : stats, procs, sets, sauvegarde. À toi de jouer !",
        speaker: GUIDE_NAME,
        duration: 5500,
        autoNext: true
    });
    
    steps.push({
        id: 'cerbere_encouragement',
        message: IS_IGRISK
            ? "WOUF ! C'était bizarre mais instructif ! Même si c'était Tank déguisé ! 🤣"
            : "WOUF WOUF ! Tu vas créer des builds DE MALADE ! Go go go Monarque ! 🚀🔥",
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
            speaker: IS_IGRISK ? 'igrisk' : 'igris',
            duration: 3000,
            autoNext: true
        });
        
        steps.push({
            id: 'tank_demo_activation',
            message: IS_IGRISK 
                ? "QUOI ?! MOI AUSSI JE PEUX FAIRE ÇA ?! MODE DEMO DÉFENSIF ! 🛡️💀"
                : "MWAHAHAHA ! VOUS PENSIEZ QUE C'ÉTAIT FINI ?! ACTIVATION : MODE DEMO ! 🔥💀",
            speaker: IS_IGRISK ? 'igrisk' : 'tank',
            duration: 4000,
            autoNext: true
        });
        
        steps.push({
            id: 'cerbere_panic',
            message: IS_IGRISK
                ? "WOUF ?! TANK TU VAS DÉTRUIRE TON PROPRE DÉGUISEMENT ! 😱"
                : "WOUF WOUF WOUF ?! TANK ! QU'EST-CE QUE TU FAIS ?! C'EST DANGEREUX ! 😱",
            speaker: 'cerbere',
            duration: 3000,
            autoNext: true
        });
        
        steps.push({
            id: 'tank_laser_charge',
            message: "REGARDEZ LA VRAIE PUISSANCE ! LASER ORBITAL... CHARGEMENT... 🎯⚡",
            speaker: IS_IGRISK ? 'igrisk' : 'tank',
            duration: 3500,
            autoNext: true,
            action: () => {
                setTimeout(() => {
                    console.log('🔥 DEMO EFFECT: Préparation du laser orbital...');
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
            speaker: IS_IGRISK ? 'igrisk' : 'tank',
            duration: 5000,
            autoNext: true,
            action: () => {
                setTimeout(() => {
                    if (window.fireTankLaser) {
                        console.log('🚀 DEMO EFFECT: LASER ORBITAL ACTIVÉ !');
                        window.fireTankLaser();
                        
                        if (window.umami) {
                            window.umami.track('tutorial-demo-laser-fired', {
                                source: IS_IGRISK ? 'igrisk_tutorial' : 'igris_tutorial',
                                effect: 'tank_orbital_laser',
                                rarity: 'ultra_rare_2_percent',
                                guide: IS_IGRISK ? 'tank_disguised' : 'normal_igris'
                            });
                            console.log('📊 UMAMI: Laser orbital tracké !');
                        }
                    }
                    
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
            id: 'guide_shocked',
            message: IS_IGRISK
                ? "*réalise* Attendez... JE VIENS DE ME GRILLER TOUT SEUL ! 😱"
                : "TANK ! TU ES FOU ! Tu as failli détruire l'interface ! 😤",
            speaker: IS_IGRISK ? 'igrisk' : 'igris',
            duration: 3500,
            autoNext: true
        });
        
        steps.push({
            id: 'tank_proud',
            message: IS_IGRISK
                ? "Euh... C'était... une fonctionnalité d'Igris ! Oui ! Igris peut faire ça aussi ! 😅"
                : "*Tank rigole* C'était juste une démo... Mais avoue que c'était ÉPIQUE ! 😈✨",
            speaker: IS_IGRISK ? 'igrisk' : 'tank',
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
            id: 'guide_ends_demo',
            message: IS_IGRISK
                ? "*fuit* Bon je dois y aller ! Le vrai Igris arrive ! Bye ! 💨"
                : "*soupir* Bon... Reprenons le tutoriel SÉRIEUSEMENT maintenant...",
            speaker: IS_IGRISK ? 'igrisk' : 'igris',
            duration: 3500,
            autoNext: true
        });
    }
    
    // Continue avec le reste du tutoriel...
    // [Le reste du code reste identique, juste remplacer 'igris' par GUIDE_NAME]
    
    // Save reminder
    steps.push({
        id: 'save_reminder',
        message: IS_IGRISK
            ? "⚠️ Le bouton Save ! Sans lui, ta belle DÉFENSE disparaît ! SAUVEGARDE TOUJOURS !"
            : "⚠️ N'oublie JAMAIS : Le bouton Save est TON MEILLEUR AMI ! Sans lui, tu perds tout !",
        speaker: GUIDE_NAME,
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
        message: IS_IGRISK
            ? "Euh... Oui ! Moi aussi je sauvegarde ! Enfin, Igris sauvegarde ! Je suis Igris ! 💾"
            : "Même moi je sauvegarde ! Sinon mes builds full def disparaissent ! 💾",
        speaker: IS_IGRISK ? 'igrisk' : 'tank',
        duration: 3500,
        autoNext: true
    });
    
    // Gems, Cores, Stats sections...
    steps.push({
        id: 'gems_section',
        message: IS_IGRISK
            ? "Les Gemmes ! Blue pour l'HP, Green pour la DÉFENSE ! Les meilleures gemmes ! 💎🛡️"
            : "Les Gemmes offrent des bonus massifs ! Red pour l'attaque, Blue pour l'HP, Green pour la défense...",
        speaker: GUIDE_NAME,
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
    
    // Final stats
    steps.push({
        id: 'final_stats_focus',
        message: IS_IGRISK
            ? "⚠️ Les stats finales ! Regarde bien ta DÉFENSE ! Elle doit être MAXIMALE ! 🛡️"
            : "⚠️ TRÈS IMPORTANT ! Regarde ici : 'Final Stats with Artefacts'. C'est le résultat FINAL de ton build !",
        speaker: GUIDE_NAME,
        selector: () => {
            const elements = document.querySelectorAll('*');
            for (const el of elements) {
                if (el.textContent === 'Final Stats with Artefacts' || 
                    el.textContent === 'Final Stats with Artifacts' ||
                    el.classList.contains('FinalStats')) {
                    return el.parentElement || el;
                }
            }
            return document.querySelector('.final-stats, .stats-display, [class*="final"]');
        },
        highlight: true,
        duration: 6000,
        autoNext: true
    });
    
    // Finale
    const finaleMessages = IS_IGRISK ? [
        "Tu es prêt ! Que tes builds soient DÉFENSIFS et tes boucliers SOLIDES ! 🛡️",
        "La formation est terminée. N'oublie pas : la défense, c'est la vie ! *fuit* 💀",
        "L'entraînement est fini. Les vraies ombres arrivent ! *disparaît* 🌑"
    ] : [
        "Tu es prêt, Monarque ! Que tes builds soient puissants et tes procs nombreux ! ⚔️",
        "La formation est terminée. Montre au monde la puissance du Monarque des Ombres ! 💀",
        "L'entraînement est fini. Va créer des légendes ! Les ombres t'accompagnent... 🌑"
    ];
    
    steps.push({
        id: 'finale',
        message: finaleMessages[Math.floor(Math.random() * finaleMessages.length)],
        speaker: GUIDE_NAME,
        duration: 6000,
        autoNext: true
    });
    
    // Cerbere farewell
    steps.push({
        id: 'cerbere_farewell',
        message: IS_IGRISK
            ? "WOUF ! C'était bizarre mais marrant ! Tank fait un meilleur Igris que prévu ! 🤣👋"
            : "WOUF WOUF ! *Cerbère te salue* À bientôt Monarque ! Fais des builds de FOU ! 👋🔥",
        speaker: 'cerbere',
        duration: 4000,
        autoNext: true
    });
    
    // Épilogue spécial si Igrisk
    if (IS_IGRISK) {
        steps.push({
            id: 'real_igris_arrives',
            message: "*le VRAI Igris arrive* Qu'est-ce qui se passe ici ?! Tank ?! Qu'as-tu fait ?! 😠",
            speaker: 'igris',
            duration: 4000,
            autoNext: true
        });
        
        steps.push({
            id: 'igrisk_escapes',
            message: "*court à toute vitesse* RIEN ! J'ai rien fait ! Le tutoriel est fini ! Bye ! 💨",
            speaker: 'igrisk',
            duration: 3500,
            autoNext: true
        });
        
        steps.push({
            id: 'igris_sighs',
            message: "*soupir* Toujours aussi chaotique... Au moins le Monarque a appris. Même si c'était... différent.",
            speaker: 'igris',
            duration: 4500,
            autoNext: true
        });
    } else if (Math.random() < 0.2) {
        // Épilogue normal
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

// 🛡️ FONCTION SPÉCIALE POUR IGRISK - Forcer le set Guard
window.selectGuardSet = async function() {
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
    
    // Chercher spécifiquement le set Guard
    const guardOption = Array.from(setOptions).find(option => 
        option.textContent.toLowerCase().includes('guard')
    );
    
    if (guardOption) {
        console.log(`✅ Set Guard forcé par Igrisk ! 🛡️`);
        guardOption.click();
        return true;
    } else {
        // Si Guard pas trouvé, prendre au hasard
        console.log('⚠️ Set Guard non trouvé, sélection aléatoire');
        return window.selectRandomSet();
    }
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