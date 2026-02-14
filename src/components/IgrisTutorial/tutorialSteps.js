// components/IgrisTutorial/tutorialSteps.js
import i18n from 'i18next';

// 🎲 Système de variations de dialogues avec i18n
const getDialogueVariations = (t) => ({
    welcome: t('tutorial.dialogue_variations.welcome', { returnObjects: true }),
    welcome_igrisk: t('tutorial.dialogue_variations.welcome_igrisk', { returnObjects: true }),
    cerbere_intro: t('tutorial.dialogue_variations.cerbere_intro', { returnObjects: true }),
    cerbere_suspicious: t('tutorial.dialogue_variations.cerbere_suspicious', { returnObjects: true }),
    igris_calms: t('tutorial.dialogue_variations.igris_calms', { returnObjects: true }),
    igrisk_calms: t('tutorial.dialogue_variations.igrisk_calms', { returnObjects: true })
});

// 🐉 TANK INTERRUPTIONS SPÉCIALES
const getTankInterruptions = (t) => [
    {
        afterStep: 'cerbere_intro',
        chance: 0.3,
        sequence: [
            {
                message: t('tutorial.tank_interruptions.normal.intro'),
                speaker: 'tank',
                duration: 3500
            },
            {
                message: t('tutorial.tank_interruptions.normal.cerbere_territory'),
                speaker: 'cerbere',
                duration: 3000
            },
            {
                message: t('tutorial.tank_interruptions.normal.tank_mock'),
                speaker: 'tank',
                duration: 3500
            },
            {
                message: t('tutorial.tank_interruptions.normal.igris_stops'),
                speaker: 'igris',
                duration: 3500
            }
        ]
    },
    {
        afterStep: 'cerbere_suspicious_igrisk',
        chance: 0.8,
        sequence: [
            {
                message: t('tutorial.tank_interruptions.discovered.tank_shock'),
                speaker: 'tank',
                duration: 4000
            },
            {
                message: t('tutorial.tank_interruptions.discovered.igrisk_sword_fail'),
                speaker: 'igrisk',
                duration: 3500
            },
            {
                message: t('tutorial.tank_interruptions.discovered.cerbere_knew'),
                speaker: 'cerbere',
                duration: 3000
            },
            {
                message: t('tutorial.tank_interruptions.discovered.tank_impostor'),
                speaker: 'tank',
                duration: 3500
            },
            {
                message: t('tutorial.tank_interruptions.discovered.igrisk_admits'),
                speaker: 'igrisk',
                duration: 3500
            }
        ]
    }
];

// 📊 Stats disponibles (restent en anglais car ce sont des identifiants techniques)
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

const IGRISK_PREFERRED_STATS = [
    'Defense %', 'Additional Defense'
];

// 🎲 Fonctions utilitaires
const getRandomVariation = (stepId, t) => {
    const variations = getDialogueVariations(t)[stepId];
    if (!variations || variations.length === 0) return null;
    const selectedVariation = variations[Math.floor(Math.random() * variations.length)];
    return typeof selectedVariation === 'string'
        ? { message: selectedVariation, speaker: stepId.includes('igrisk') ? 'igrisk' : 'igris' }
        : selectedVariation;
};

const shouldTankInterrupt = (stepId, t) => {
    const interruptions = getTankInterruptions(t);
    const interruption = interruptions.find(int => int.afterStep === stepId);
    if (!interruption) return null;
    const roll = Math.random();
    return roll < interruption.chance ? interruption : null;
};

const getRandomStat = (type = 'main', excludeList = [], isIgrisk = false) => {
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
    const badStats = ['Additional MP', 'MP Recovery Rate Increase (%)', 'Damage Reduction'];

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
    const t = i18n.t.bind(i18n); // Binding pour simplifier l'usage

    // 🎭 DÉTERMINER SI C'EST IGRISK OU IGRIS (5% de chance)
    const IS_IGRISK = Math.random() < 0.05;
    const GUIDE_NAME = IS_IGRISK ? 'igrisk' : 'igris';


    addShakeAnimation();

    // Variables pour stocker les choix
    let selectedMainStat = '';
    let selectedSubstats = [];
    let selectedArtifactName = '';

    // 1. Welcome
    const welcomeVariation = getRandomVariation(
        IS_IGRISK ? 'welcome_igrisk' : 'welcome',
        t
    );
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
    const cerbereIntroVariation = getRandomVariation('cerbere_intro', t);
    steps.push({
        id: 'cerbere_intro',
        ...cerbereIntroVariation,
        duration: 3000,
        autoNext: true
    });

    // 🎭 SI IGRISK, CERBÈRE DEVIENT SUSPICIEUX
    if (IS_IGRISK && Math.random() < 0.7) {
        const suspiciousVariation = getRandomVariation('cerbere_suspicious', t);
        steps.push({
            id: 'cerbere_suspicious_igrisk',
            ...suspiciousVariation,
            duration: 3500,
            autoNext: true
        });

        const tankInterruption = shouldTankInterrupt('cerbere_suspicious_igrisk', t);
        if (tankInterruption) {
            tankInterruption.sequence.forEach((step, index) => {
                steps.push({
                    id: `tank_discovered_${index}`,
                    ...step,
                    autoNext: true
                });
            });

            steps.push({
                id: 'igrisk_continues_anyway',
                message: t('tutorial.tank_interruptions.continue_anyway'),
                speaker: 'igrisk',
                duration: 4000,
                autoNext: true
            });
        }
    } else if (!IS_IGRISK) {
        const tankInterruption1 = shouldTankInterrupt('cerbere_intro', t);
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
    const calmVariation = getRandomVariation(
        IS_IGRISK ? 'igrisk_calms' : 'igris_calms',
        t
    );
    steps.push({
        id: 'guide_calms',
        ...calmVariation,
        duration: 4000,
        autoNext: true
    });

    // Character selector
    steps.push({
        id: 'character_selector_zone',
        message: t(`tutorial.steps.character_selector.${GUIDE_NAME}`),
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
        message: t(`tutorial.steps.select_hunter.${GUIDE_NAME}`),
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
                        break;
                    }
                }

                if (characterSelect) {
                    const currentValue = characterSelect.value;
                    const validOptions = Array.from(characterSelect.options).filter(opt =>
                        opt.value !== '' &&
                        opt.value !== currentValue &&
                        !opt.text.includes('Select') &&
                        !opt.text.includes('Sélectionner')
                    );

                    if (validOptions.length > 0) {
                        let selectedOption;
                        if (IS_IGRISK) {
                            const tankOption = validOptions.find(opt => opt.text.includes('Baek Yoonho'));
                            selectedOption = tankOption || validOptions[Math.floor(Math.random() * validOptions.length)];
                        } else {
                            const randomIndex = Math.floor(Math.random() * validOptions.length);
                            selectedOption = validOptions[randomIndex];
                        }

                        characterSelect.value = selectedOption.value;
                        const changeEvent = new Event('change', { bubbles: true, cancelable: true });
                        characterSelect.dispatchEvent(changeEvent);
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
            const hunterName = window.selectedHunterForTutorial || t('tutorial.hunter_reactions.default_hunter');

            if (IS_IGRISK && hunterName === 'Baek Yoonho') {
                return t('tutorial.hunter_reactions.baek_yoonho.igrisk_suspicious', { name: hunterName });
            }

            // Mapping des noms pour les clés de traduction
            const hunterKey = hunterName.toLowerCase()
                .replace(' ', '_')
                .replace('sung jinwoo', 'sung_jinwoo')
                .replace('cha hae-in', 'cha_haein')
                .replace('choi jong-in', 'choi_jongin')
                .replace('baek yoonho', 'baek_yoonho')
                .replace('min byung-gyu', 'min_byunggyu')
                .replace('lim tae-gyu', 'lim_taegyu')
                .replace('woo jinchul', 'woo_jinchul')
                .replace('go gunhee', 'go_gunhee');

            const reactions = t(`tutorial.hunter_reactions.${hunterKey}.cerbere`, {
                returnObjects: true,
                defaultValue: t('tutorial.hunter_reactions.default.cerbere', { returnObjects: true })
            });

            const selectedReaction = Array.isArray(reactions)
                ? reactions[Math.floor(Math.random() * reactions.length)]
                : reactions;

            return selectedReaction.replace('{{name}}', hunterName);
        })(),
        speaker: 'cerbere',
        duration: 3500,
        autoNext: true
    });

    // Tank réaction
    if (Math.random() < 0.3) {
        steps.push({
            id: 'tank_hunter_opinion',
            message: (() => {
                const hunterName = window.selectedHunterForTutorial || 'ce Hunter';

                if (IS_IGRISK) {
                    return t('tutorial.tank_interruptions.voice_confusion');
                }

                const hunterKey = hunterName.toLowerCase()
                    .replace(' ', '_')
                    .replace('sung jinwoo', 'sung_jinwoo')
                    .replace('cha hae-in', 'cha_haein')
                    .replace('choi jong-in', 'choi_jongin')
                    .replace('baek yoonho', 'baek_yoonho')
                    .replace('min byung-gyu', 'min_byunggyu')
                    .replace('lim tae-gyu', 'lim_taegyu')
                    .replace('woo jinchul', 'woo_jinchul')
                    .replace('go gunhee', 'go_gunhee');

                return t(`tutorial.hunter_reactions.${hunterKey}.tank`, {
                    defaultValue: t('tutorial.hunter_reactions.default.tank')
                }).replace('{{name}}', hunterName);
            })(),
            speaker: 'tank',
            duration: 3500,
            autoNext: true
        });

        if (IS_IGRISK) {
            steps.push({
                id: 'igrisk_panic',
                message: t('tutorial.tank_interruptions.igrisk_panic'),
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
            const hunterKey = hunterName.toLowerCase()
                .replace(' ', '_')
                .replace('sung jinwoo', 'sung_jinwoo')
                .replace('cha hae-in', 'cha_haein')
                .replace('choi jong-in', 'choi_jongin')
                .replace('baek yoonho', 'baek_yoonho')
                .replace('min byung-gyu', 'min_byunggyu')
                .replace('lim tae-gyu', 'lim_taegyu')
                .replace('woo jinchul', 'woo_jinchul')
                .replace('go gunhee', 'go_gunhee');

            if (IS_IGRISK) {
                return t(`tutorial.hunter_reactions.${hunterKey}.igrisk`, {
                    defaultValue: t('tutorial.hunter_reactions.sung_jinwoo.igrisk')
                }).replace('{{name}}', hunterName);
            }

            const message = t(`tutorial.hunter_reactions.${hunterKey}.igris`, {
                defaultValue: t('tutorial.hunter_reactions.default.igris', { returnObjects: true })[0]
            });

            return message.replace('{{name}}', hunterName);
        })(),
        speaker: GUIDE_NAME,
        duration: 4000,
        autoNext: true
    });

    // SECTION ARTIFACTS
    steps.push({
        id: 'artifact_section',
        message: t(`tutorial.steps.artifact_section.${GUIDE_NAME}`),
        speaker: GUIDE_NAME,
        selector: '.artifact-grid, .artifacts-container',
        highlight: true,
        duration: 5000,
        autoNext: true
    });

    steps.push({
        id: 'helmet_focus',
        message: t(`tutorial.steps.helmet_focus.${GUIDE_NAME}`),
        speaker: GUIDE_NAME,
        selector: () => {
            const cards = document.querySelectorAll('.artifact-card');
            return cards[0];
        },
        highlight: true,
        duration: 4500,
        autoNext: true
    });

    // MainStat
    selectedMainStat = getRandomStat('main', [], IS_IGRISK);
    steps.push({
        id: 'set_main_stat',
        message: (() => {
            const baseMessage = t(`tutorial.steps.main_stat_config.message_${GUIDE_NAME}`, { stat: selectedMainStat });

            let reaction = '';
            if (selectedMainStat.includes('Defense')) {
                reaction = t(`tutorial.steps.main_stat_config.defense_reaction_${GUIDE_NAME}`);
            } else if (selectedMainStat.includes('Attack')) {
                reaction = t(`tutorial.steps.main_stat_config.attack_reaction_${GUIDE_NAME}`);
            } else {
                reaction = t(`tutorial.steps.main_stat_config.balanced_reaction_${GUIDE_NAME}`);
            }

            return `${baseMessage} ${reaction}`;
        })(),
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
                message: t('tutorial.stat_reactions.igrisk_loves_defense'),
                speaker: 'igrisk',
                duration: 3500,
                autoNext: true
            });
        } else {
            steps.push({
                id: 'tank_loves_defense',
                message: t('tutorial.stat_reactions.tank_loves_defense'),
                speaker: 'tank',
                duration: 3500,
                autoNext: true
            });
        }

        steps.push({
            id: 'cerbere_disagrees',
            message: t('tutorial.stat_reactions.cerbere_hates_defense'),
            speaker: 'cerbere',
            duration: 3000,
            autoNext: true
        });
    }

    // SubStats
    for (let i = 1; i <= 4; i++) {
        const allExclusions = [selectedMainStat, ...selectedSubstats];
        const substat = getRandomStat('sub', allExclusions, IS_IGRISK);
        selectedSubstats.push(substat);
        const statQuality = isGoodStatForCharacter(substat);

        steps.push({
            id: `set_substat_${i}`,
            message: (() => {
                const baseMessage = t(`tutorial.steps.substat_config.substat_${i}_${GUIDE_NAME}`, { stat: substat });

                if (IS_IGRISK) {
                    let reaction = '';
                    if (statQuality === 'defense') {
                        reaction = t('tutorial.steps.substat_config.defense_reaction_igrisk');
                    } else if (statQuality === 'good') {
                        reaction = t('tutorial.steps.substat_config.good_reaction_igrisk');
                    } else {
                        reaction = t('tutorial.steps.substat_config.neutral_reaction_igrisk');
                    }
                    return `${baseMessage} ${reaction}`;
                }
                return baseMessage;
            })(),
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

        if (IS_IGRISK && statQuality === 'defense' && Math.random() < 0.5) {
            steps.push({
                id: `cerbere_suspicious_stat_${i}`,
                message: t('tutorial.stat_reactions.cerbere_suspicious_defense'),
                speaker: 'cerbere',
                duration: 2500,
                autoNext: true
            });

            steps.push({
                id: `igrisk_excuse_${i}`,
                message: t('tutorial.stat_reactions.igrisk_defense_excuse'),
                speaker: 'igrisk',
                duration: 3000,
                autoNext: true
            });
        } else if (statQuality === 'good' && Math.random() < 0.7) {
            steps.push({
                id: `cerbere_happy_${i}`,
                message: t('tutorial.stat_reactions.cerbere_happy_stat', { stat: substat }),
                speaker: 'cerbere',
                duration: 2500,
                autoNext: true
            });
        }
    }

    // PROCS
    steps.push({
        id: 'proc_introduction',
        message: t(`tutorial.steps.proc_intro.${GUIDE_NAME}`),
        speaker: GUIDE_NAME,
        duration: 5000,
        autoNext: true
    });

    for (let procNum = 1; procNum <= 4; procNum++) {
        steps.push({
            id: `proc_${procNum}`,
            message: t(`tutorial.steps.procs.proc_${procNum}_${GUIDE_NAME}`),
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
                message: t('tutorial.proc_reactions.cerbere_excited'),
                speaker: 'cerbere',
                duration: 3000,
                autoNext: true
            });
        }
    }

    if (IS_IGRISK) {
        steps.push({
            id: 'igrisk_procs_opinion',
            message: t('tutorial.proc_reactions.igrisk_procs_opinion'),
            speaker: 'igrisk',
            duration: 3500,
            autoNext: true
        });
    } else if (Math.random() < 0.4) {
        steps.push({
            id: 'tank_mocks_procs',
            message: t('tutorial.proc_reactions.tank_mocks_procs'),
            speaker: 'tank',
            duration: 3500,
            autoNext: true
        });

        steps.push({
            id: 'cerbere_defends',
            message: t('tutorial.proc_reactions.cerbere_defends'),
            speaker: 'cerbere',
            duration: 3000,
            autoNext: true
        });
    }

    // SETS
    steps.push({
        id: 'open_set_menu',
        message: t(`tutorial.steps.set_menu.open_${GUIDE_NAME}`),
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
        message: t(`tutorial.steps.set_menu.select_${GUIDE_NAME}`),
        speaker: GUIDE_NAME,
        duration: 4500,
        autoNext: true,
        action: async () => {
            await new Promise(r => setTimeout(r, 1500));
            if (window.selectRandomSet) {
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
        message: t(IS_IGRISK ? 'tutorial.set_reactions.cerbere_suspects_guard' : 'tutorial.set_reactions.cerbere_hopes'),
        speaker: 'cerbere',
        duration: 3000,
        autoNext: true
    });

    // SAUVEGARDE
    steps.push({
        id: 'click_save_button',
        message: t(`tutorial.steps.save_button.${GUIDE_NAME}`),
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
    const artifactNames = t(IS_IGRISK ? 'tutorial.artifact_names_igrisk' : 'tutorial.artifact_names', { returnObjects: true });
    selectedArtifactName = artifactNames[Math.floor(Math.random() * artifactNames.length)];

    steps.push({
        id: 'enter_artifact_name',
        message: (() => {
            const baseMessage = t(`tutorial.steps.artifact_naming.message_${GUIDE_NAME}`, { name: selectedArtifactName });

            if (IS_IGRISK) {
                if (selectedArtifactName.includes('Tank')) {
                    return `${baseMessage} ${t('tutorial.steps.artifact_naming.tank_name_panic')}`;
                } else if (selectedArtifactName.includes('Defense') || selectedArtifactName.includes('Défense')) {
                    return `${baseMessage} ${t('tutorial.steps.artifact_naming.defense_name_whisper')}`;
                } else {
                    return `${baseMessage} ${t('tutorial.steps.artifact_naming.normal_name')}`;
                }
            } else {
                if (selectedArtifactName.includes('Pomme')) {
                    return `${baseMessage} ${t('tutorial.steps.artifact_naming.pomme_reaction')}`;
                } else if (selectedArtifactName.includes('Tank')) {
                    return `${baseMessage} ${t('tutorial.steps.artifact_naming.tank_reaction')}`;
                } else if (selectedArtifactName.includes('Cerbère')) {
                    return `${baseMessage} ${t('tutorial.steps.artifact_naming.cerbere_reaction')}`;
                } else if (selectedArtifactName.includes('RNG')) {
                    return `${baseMessage} ${t('tutorial.steps.artifact_naming.rng_reaction')}`;
                } else {
                    return `${baseMessage} ${t('tutorial.steps.artifact_naming.generic_reaction')}`;
                }
            }
        })(),
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

    // Réaction si nom suspect
    if (IS_IGRISK && selectedArtifactName.includes('Tank')) {
        steps.push({
            id: 'cerbere_gotcha',
            message: t('tutorial.name_reactions.cerbere_gotcha'),
            speaker: 'cerbere',
            duration: 3500,
            autoNext: true
        });

        steps.push({
            id: 'igrisk_caught',
            message: t('tutorial.name_reactions.igrisk_caught'),
            speaker: 'igrisk',
            duration: 3500,
            autoNext: true
        });

        steps.push({
            id: 'real_tank_appears',
            message: t('tutorial.name_reactions.real_tank_appears'),
            speaker: 'tank',
            duration: 4000,
            autoNext: true
        });
    }

    // Cancel
    steps.push({
        id: 'click_cancel',
        message: t(`tutorial.steps.cancel_action.${GUIDE_NAME}`),
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
        message: t(`tutorial.steps.artifact_mastery.${GUIDE_NAME}`),
        speaker: GUIDE_NAME,
        duration: 5500,
        autoNext: true
    });

    steps.push({
        id: 'cerbere_encouragement',
        message: t(IS_IGRISK ? 'tutorial.companions.cerbere_encouragement_igrisk' : 'tutorial.companions.cerbere_encouragement'),
        speaker: 'cerbere',
        duration: 3500,
        autoNext: true
    });

    // EFFET DEMO ULTRA RARE (2% chance)
    if (Math.random() < 0.02) {
        const demoSteps = [
            { id: 'demo_effect_warning', key: 'warning', speaker: GUIDE_NAME, duration: 3000 },
            { id: 'tank_demo_activation', key: IS_IGRISK ? 'igrisk_activation' : 'tank_activation', speaker: IS_IGRISK ? 'igrisk' : 'tank', duration: 4000 },
            { id: 'cerbere_panic', key: IS_IGRISK ? 'cerbere_panic_igrisk' : 'cerbere_panic', speaker: 'cerbere', duration: 3000 },
            { id: 'tank_laser_charge', key: 'laser_charge', speaker: IS_IGRISK ? 'igrisk' : 'tank', duration: 3500, hasAction: true },
            { id: 'tank_fire_laser', key: 'laser_fire', speaker: IS_IGRISK ? 'igrisk' : 'tank', duration: 5000, hasLaserAction: true },
            { id: 'guide_shocked', key: IS_IGRISK ? 'igrisk_shocked' : 'igris_shocked', speaker: GUIDE_NAME, duration: 3500 },
            { id: 'tank_proud', key: IS_IGRISK ? 'igrisk_excuse' : 'tank_proud', speaker: IS_IGRISK ? 'igrisk' : 'tank', duration: 4000 },
            { id: 'cerbere_amazed', key: 'cerbere_amazed', speaker: 'cerbere', duration: 3000 },
            { id: 'guide_ends_demo', key: IS_IGRISK ? 'igrisk_flees' : 'igris_ends', speaker: GUIDE_NAME, duration: 3500 }
        ];

        demoSteps.forEach(step => {
            const stepData = {
                id: step.id,
                message: t(`tutorial.demo_effect.${step.key}`),
                speaker: step.speaker,
                duration: step.duration,
                autoNext: true
            };

            if (step.hasAction) {
                stepData.action = () => {
                    setTimeout(() => {
                        document.body.style.animation = 'shake 0.5s';
                        setTimeout(() => {
                            document.body.style.animation = '';
                        }, 500);
                    }, 1000);
                };
            }

            if (step.hasLaserAction) {
                stepData.action = () => {
                    setTimeout(() => {
                        if (window.fireTankLaser) {
                            window.fireTankLaser();

                            if (window.umami) {
                                window.umami.track('tutorial-demo-laser-fired', {
                                    source: IS_IGRISK ? 'igrisk_tutorial' : 'igris_tutorial',
                                    effect: 'tank_orbital_laser',
                                    rarity: 'ultra_rare_2_percent',
                                    guide: IS_IGRISK ? 'tank_disguised' : 'normal_igris'
                                });
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
                };
            }

            steps.push(stepData);
        });
    }

    // Save reminder et suite
    steps.push({
        id: 'save_reminder',
        message: t(`tutorial.steps.save_reminder.${GUIDE_NAME}`),
        speaker: GUIDE_NAME,
        selector: () => {
            const buttons = document.querySelectorAll('button');
            return Array.from(buttons).find(btn => {
                const text = btn.textContent?.toLowerCase() || '';
                return text === 'save' || text.includes('save') || text.includes('sauvegarder');
            });
        },
        highlight: true,
        duration: 5000,
        autoNext: true
    });

    steps.push({
        id: 'tank_save_advice',
        message: t(IS_IGRISK ? 'tutorial.companions.tank_save_advice_igrisk' : 'tutorial.companions.tank_save_advice'),
        speaker: IS_IGRISK ? 'igrisk' : 'tank',
        duration: 3500,
        autoNext: true
    });

    // Gems section
    steps.push({
        id: 'gems_section',
        message: t(`tutorial.steps.gems_section.${GUIDE_NAME}`),
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
        message: t(`tutorial.steps.final_stats.focus_${GUIDE_NAME}`),
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
    const finaleMessages = t(`tutorial.steps.finale.${GUIDE_NAME}`, { returnObjects: true });
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
        message: t(IS_IGRISK ? 'tutorial.companions.cerbere_farewell_igrisk' : 'tutorial.companions.cerbere_farewell'),
        speaker: 'cerbere',
        duration: 4000,
        autoNext: true
    });

    // Épilogue spécial si Igrisk
    if (IS_IGRISK) {
        steps.push({
            id: 'real_igris_arrives',
            message: t('tutorial.epilogue.real_igris_arrives'),
            speaker: 'igris',
            duration: 4000,
            autoNext: true
        });

        steps.push({
            id: 'igrisk_escapes',
            message: t('tutorial.epilogue.igrisk_escapes'),
            speaker: 'igrisk',
            duration: 3500,
            autoNext: true
        });

        steps.push({
            id: 'igris_sighs',
            message: t('tutorial.epilogue.igris_sighs'),
            speaker: 'igris',
            duration: 4500,
            autoNext: true
        });
    } else if (Math.random() < 0.2) {
        steps.push({
            id: 'tank_epilogue',
            message: t('tutorial.epilogue.tank_appears'),
            speaker: 'tank',
            duration: 4000,
            autoNext: true
        });

        steps.push({
            id: 'cerbere_final',
            message: t('tutorial.epilogue.cerbere_final'),
            speaker: 'cerbere',
            duration: 3000,
            autoNext: true
        });

        steps.push({
            id: 'tank_disappears',
            message: t('tutorial.epilogue.tank_disappears'),
            speaker: 'tank',
            duration: 3500,
            autoNext: true
        });
    }

    return steps;
};

// Export principal
export const tutorialSteps = buildDynamicTutorialSteps();

// [Le reste du code avec les fonctions window reste identique]
// window.setHelmetMainStat, window.setSubstat1-4, window.doOneProc, etc...
// (Je garde la partie originale qui n'a pas besoin de traduction)
// ==========================================
// 🔧 FONCTIONS WINDOW (NE PAS MODIFIER)
// ==========================================

// MainStat
window.setHelmetMainStat = function (value = 'Attack %') {
    const helmetCard = document.getElementsByClassName("artifact-card")[0];
    const mainStatDiv = helmetCard.children[1];
    const select = mainStatDiv.querySelector('select');

    if (select) {
        const nativeValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
        nativeValueSetter.call(select, value);
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    }
    return false;
};

// SubStats
window.setSubstat1 = function (value = 'Critical Hit Damage') {
    const helmetCard = document.getElementsByClassName("artifact-card")[0];
    const select = helmetCard.children[2].querySelector('select');

    if (select) {
        const nativeValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
        nativeValueSetter.call(select, value);
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    }
    return false;
};

window.setSubstat2 = function (value = 'Critical Hit Rate') {
    const helmetCard = document.getElementsByClassName("artifact-card")[0];
    const select = helmetCard.children[3].querySelector('select');

    if (select) {
        const nativeValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
        nativeValueSetter.call(select, value);
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    }
    return false;
};

window.setSubstat3 = function (value = 'Defense Penetration') {
    const helmetCard = document.getElementsByClassName("artifact-card")[0];
    const select = helmetCard.children[4].querySelector('select');

    if (select) {
        const nativeValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
        nativeValueSetter.call(select, value);
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    }
    return false;
};

window.setSubstat4 = function (value = 'Additional Attack') {
    const helmetCard = document.getElementsByClassName("artifact-card")[0];
    const select = helmetCard.children[5].querySelector('select');

    if (select) {
        const nativeValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
        nativeValueSetter.call(select, value);
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    }
    return false;
};

// Procs
window.doOneProc = function () {
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

        return true;
    }

    return false;
};

// Set
window.openSetMenu = function () {
    const helmetCard = document.getElementsByClassName("artifact-card")[0];
    const setButton = helmetCard.querySelector('img[alt="Sélectionner un Set"]');

    if (setButton) {
        setButton.click();
        return true;
    }

    return false;
};

window.selectRandomSet = async function () {
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
        return false;
    }

    const setOptions = setMenu.querySelectorAll('li');
    if (setOptions.length > 0) {
        const randomIndex = Math.floor(Math.random() * setOptions.length);
        const selectedSet = setOptions[randomIndex];
        const setName = selectedSet.textContent.trim();

        selectedSet.click();
        return true;
    }

    return false;
};

// 🛡️ FONCTION SPÉCIALE POUR IGRISK - Forcer le set Guard
window.selectGuardSet = async function () {
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
        return false;
    }

    const setOptions = setMenu.querySelectorAll('li');

    // Chercher spécifiquement le set Guard
    const guardOption = Array.from(setOptions).find(option =>
        option.textContent.toLowerCase().includes('guard')
    );

    if (guardOption) {
        guardOption.click();
        return true;
    } else {
        // Si Guard pas trouvé, prendre au hasard
        return window.selectRandomSet();
    }
};

// Save
window.clickSaveButton = function () {
    const helmetCard = document.getElementsByClassName("artifact-card")[0];
    const saveButton = helmetCard.querySelector('img[alt="Save le set"]');

    if (saveButton) {
        saveButton.click();
        return true;
    }

    return false;
};

window.enterArtifactName = async function (name = "GG Igris Build") {
    await new Promise(resolve => setTimeout(resolve, 300));

    const allInputs = document.getElementsByTagName('input');
    const artifactNameInput = allInputs[5];

    if (artifactNameInput) {

        const nativeValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeValueSetter.call(artifactNameInput, name);

        artifactNameInput.dispatchEvent(new Event('input', { bubbles: true }));
        artifactNameInput.dispatchEvent(new Event('change', { bubbles: true }));

        return true;
    }

    return false;
};

window.clickCancelButton = function () {
    const cancelButton = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent === 'Cancel' ||
        btn.textContent === 'Annuler'
    );

    if (cancelButton) {
        cancelButton.click();
        return true;
    }

    return false;
};