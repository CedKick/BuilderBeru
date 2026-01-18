import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingUp, Target, Shield, Swords, X, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { characters } from '../../data/characters';
import { ARTIFACT_SETS, getSetBonuses } from '../../data/setData';
import { CHARACTER_BUFFS, getCharacterBuffs, getCharacterBaseStats } from '../../data/characterBuffs';
import { statConversions, statConversionsWithEnemy } from '../../utils/statConversions';
import { OptimizationCard, InlineOptimizationDot, OptimizationBadge } from './OptimizationIndicator';
import { CHARACTER_OPTIMIZATION, getOptimizationStatus, getOverallOptimization, getCurrentBenchmark, getMainStatStatus } from '../../data/characterOptimization';

// 🧮 THEORYCRAFT - Calculateur de synergies de team et buffs de stats
// Focus: Crit Rate, Crit DMG, Def Pen avec système de duplication (A0-A5) + SETS

// 🎯 HELPER: Calculer les bonus combinés des sets (leftSet + rightSet)
const getCombinedSetBonuses = (member) => {
    if (!member) return { critRate: 0, critDMG: 0, defPen: 0 };

    const totalBonus = { critRate: 0, critDMG: 0, defPen: 0 };

    // Si l'ancien système est utilisé (set + setPieces)
    if (member.set && member.setPieces !== undefined) {
        const bonus = getSetBonuses(member.set, member.setPieces);
        if (bonus) {
            totalBonus.critRate += bonus.critRate;
            totalBonus.critDMG += bonus.critDMG;
            totalBonus.defPen += bonus.defPen;
        }
    }

    // Si le nouveau système est utilisé (leftSet + rightSet)
    // IMPORTANT: Si left === right, combiner les pièces pour un seul 8pc au lieu de 2x 4pc !
    if (member.leftSet && member.rightSet && member.leftSet === member.rightSet) {
        // Même set des deux côtés = 8pc UNIQUE (pas 4pc + 4pc !)
        const totalPieces = (member.leftPieces || 0) + (member.rightPieces || 0);
        const bonus = getSetBonuses(member.leftSet, totalPieces);
        if (bonus) {
            totalBonus.critRate += bonus.critRate;
            totalBonus.critDMG += bonus.critDMG;
            totalBonus.defPen += bonus.defPen;
        }
    } else {
        // Sets différents = calculer séparément
        if (member.leftSet && member.leftPieces) {
            const leftBonus = getSetBonuses(member.leftSet, member.leftPieces);
            if (leftBonus) {
                totalBonus.critRate += leftBonus.critRate;
                totalBonus.critDMG += leftBonus.critDMG;
                totalBonus.defPen += leftBonus.defPen;
            }
        }

        if (member.rightSet && member.rightPieces) {
            const rightBonus = getSetBonuses(member.rightSet, member.rightPieces);
            if (rightBonus) {
                totalBonus.critRate += rightBonus.critRate;
                totalBonus.critDMG += rightBonus.critDMG;
                totalBonus.defPen += rightBonus.defPen;
            }
        }
    }

    return totalBonus;
};

// 🎯 HELPER: Obtenir le texte d'affichage des sets
const getSetDisplayText = (member) => {
    if (!member) return 'No Set';

    // Nouveau système (leftSet + rightSet)
    if (member.leftSet && member.rightSet) {
        const leftName = ARTIFACT_SETS[member.leftSet]?.name || member.leftSet;
        const rightName = ARTIFACT_SETS[member.rightSet]?.name || member.rightSet;
        const leftPieces = member.leftPieces || 0;
        const rightPieces = member.rightPieces || 0;

        if (member.leftSet === member.rightSet) {
            // Même set des deux côtés = 8pc
            return `${leftName} (8pc)`;
        } else {
            // Sets différents = 4+4
            return `${leftName} (${leftPieces}pc) + ${rightName} (${rightPieces}pc)`;
        }
    }

    // Ancien système (set + setPieces)
    if (member.set) {
        const setName = ARTIFACT_SETS[member.set]?.name || member.set;
        const pieces = member.setPieces || 0;
        return pieces === 0 ? 'No Set' : `${setName} (${pieces}pc)`;
    }

    return 'No Set';
};

// 🎯 ENEMIES DATA - Ennemis disponibles pour les calculs
// Level 80 par défaut (correspond aux ennemis BDG standard)
const ENEMIES = {
    fachtna: {
        id: 'fachtna',
        name: 'Fachtna',
        level: 80,
        icon: '⚔️'
    },
    statue: {
        id: 'statue',
        name: 'La Statue',
        level: 80,
        icon: '🗿'
    }
};

const Theorycraft = () => {
    // États principaux
    const [sungEnabled, setSungEnabled] = useState(false);
    const [sungData, setSungData] = useState(null);
    const [team1, setTeam1] = useState(Array(3).fill(null));
    const [team2, setTeam2] = useState(Array(3).fill(null));
    const [selectedSlot, setSelectedSlot] = useState(null); // { team: 0|1|2, slot: 0-2 }
    const [elementFilter, setElementFilter] = useState('all');
    const [selectedCharForDetails, setSelectedCharForDetails] = useState(null); // Perso sélectionné pour voir détails

    // Enemy selection (pour les calculs de stats réels)
    const [selectedEnemy, setSelectedEnemy] = useState('fachtna'); // fachtna par défaut
    const [enemyLevel, setEnemyLevel] = useState(80); // Level de l'ennemi (par défaut 80 - BDG standard)

    // Obtenir la liste des personnages disponibles
    const availableCharacters = useMemo(() => {
        return Object.entries(characters)
            .filter(([id]) => id !== '') // Ignorer l'entrée vide
            .map(([id, data]) => ({
                id,
                name: data.name || id,
                element: data.element || 'Unknown',
                image: data.img || data.icon || '', // Utiliser 'img' ou 'icon'
                rarity: data.grade || 'SSR',
            }));
    }, []);

    // Filtrer par élément
    const filteredCharacters = useMemo(() => {
        if (elementFilter === 'all') return availableCharacters;
        return availableCharacters.filter(char => char.element === elementFilter);
    }, [availableCharacters, elementFilter]);

    // Gérer la sélection d'un personnage
    const handleSelectCharacter = (character) => {
        if (!selectedSlot) return;

        const slotInfo = selectedSlot;

        // 🔍 VÉRIFIER SI LE PERSONNAGE EST DÉJÀ DANS LA COMPOSITION
        // Si oui, on échange sa position au lieu d'ajouter un doublon
        let existingPosition = null;

        // Vérifier dans Sung
        if (sungData && sungData.id === character.id) {
            existingPosition = { team: 0, slot: 0, member: sungData };
        }

        // Vérifier dans Team 1
        if (!existingPosition) {
            team1.forEach((member, idx) => {
                if (member && member.id === character.id) {
                    existingPosition = { team: 1, slot: idx, member };
                }
            });
        }

        // Vérifier dans Team 2
        if (!existingPosition) {
            team2.forEach((member, idx) => {
                if (member && member.id === character.id) {
                    existingPosition = { team: 2, slot: idx, member };
                }
            });
        }

        // Si le personnage existe déjà, on échange sa position
        if (existingPosition) {
            // Récupérer le membre à l'ancien emplacement
            const memberToSwap = existingPosition.member;

            // Retirer le membre de son ancien emplacement
            if (existingPosition.team === 0) {
                setSungData(null);
            } else if (existingPosition.team === 1) {
                const newTeam = [...team1];
                newTeam[existingPosition.slot] = null;
                setTeam1(newTeam);
            } else {
                const newTeam = [...team2];
                newTeam[existingPosition.slot] = null;
                setTeam2(newTeam);
            }

            // Placer le membre au nouvel emplacement
            if (slotInfo.team === 0) {
                setSungData(memberToSwap);
            } else if (slotInfo.team === 1) {
                const newTeam = [...team1];
                newTeam[slotInfo.slot] = memberToSwap;
                setTeam1(newTeam);
            } else {
                const newTeam = [...team2];
                newTeam[slotInfo.slot] = memberToSwap;
                setTeam2(newTeam);
            }

            setSelectedSlot(null);

            // Auto-afficher le panneau de détails après échange
            setSelectedCharForDetails({ team: slotInfo.team, slot: slotInfo.slot, member: memberToSwap });
            return;
        }

        // Si le personnage n'existe pas encore, créer un nouveau membre
        const newMember = {
            ...character,
            advancement: 5,          // A5 par défaut
            weaponAdvancement: 5,    // A5 par défaut pour l'arme
            // Ancien système (rétrocompatibilité)
            set: 'none',
            setPieces: 0,
            // Nouveau système (sets séparés gauche/droite)
            leftSet: 'none',
            leftPieces: 0,
            rightSet: 'none',
            rightPieces: 0,
            coreAttackTC: true,      // Core Attack TC activé par défaut (+10% TC)
            rawStats: {              // Valeurs brutes qui affectent les %
                critRate: 0,
                critDMG: 0,
                defPen: 0,
            },
            mainStatValue: 0,        // Stat principale de scaling (ATK, DEF, HP)
        };

        if (slotInfo.team === 0) {
            // Sung
            setSungData(newMember);
        } else if (slotInfo.team === 1) {
            const newTeam = [...team1];
            newTeam[slotInfo.slot] = newMember;
            setTeam1(newTeam);
        } else {
            const newTeam = [...team2];
            newTeam[slotInfo.slot] = newMember;
            setTeam2(newTeam);
        }

        setSelectedSlot(null);

        // Auto-afficher le panneau de détails après sélection
        setSelectedCharForDetails({ team: slotInfo.team, slot: slotInfo.slot, member: newMember });
    };

    // Retirer un personnage
    const removeCharacter = (team, slot) => {
        if (team === 0) {
            setSungData(null);
            if (selectedCharForDetails?.team === 0) setSelectedCharForDetails(null);
        } else if (team === 1) {
            const newTeam = [...team1];
            newTeam[slot] = null;
            setTeam1(newTeam);
            if (selectedCharForDetails?.team === 1 && selectedCharForDetails?.slot === slot) {
                setSelectedCharForDetails(null);
            }
        } else {
            const newTeam = [...team2];
            newTeam[slot] = null;
            setTeam2(newTeam);
            if (selectedCharForDetails?.team === 2 && selectedCharForDetails?.slot === slot) {
                setSelectedCharForDetails(null);
            }
        }
    };

    // Changer le niveau d'advancement
    const changeAdvancement = (team, slot, delta) => {
        let member;
        if (team === 0) member = sungData;
        else if (team === 1) member = team1[slot];
        else member = team2[slot];

        if (!member) return;

        const newAdv = Math.max(0, Math.min(5, member.advancement + delta));
        const updatedMember = { ...member, advancement: newAdv };

        if (team === 0) setSungData(updatedMember);
        else if (team === 1) {
            const newTeam = [...team1];
            newTeam[slot] = updatedMember;
            setTeam1(newTeam);
        } else {
            const newTeam = [...team2];
            newTeam[slot] = updatedMember;
            setTeam2(newTeam);
        }
    };

    // Changer le niveau d'advancement de l'arme
    const changeWeaponAdvancement = (team, slot, delta) => {
        let member;
        if (team === 0) member = sungData;
        else if (team === 1) member = team1[slot];
        else member = team2[slot];

        if (!member) return;

        const newWeaponAdv = Math.max(0, Math.min(5, member.weaponAdvancement + delta));
        const updatedMember = { ...member, weaponAdvancement: newWeaponAdv };

        if (team === 0) {
            setSungData(updatedMember);
        } else if (team === 1) {
            const newTeam = [...team1];
            newTeam[slot] = updatedMember;
            setTeam1(newTeam);
        } else {
            const newTeam = [...team2];
            newTeam[slot] = updatedMember;
            setTeam2(newTeam);
        }

        // Mettre à jour le panneau de détails si c'est le personnage sélectionné
        if (selectedCharForDetails && selectedCharForDetails.team === team && selectedCharForDetails.slot === slot) {
            setSelectedCharForDetails({
                ...selectedCharForDetails,
                member: updatedMember
            });
        }
    };

    // Changer le type de set
    const changeSet = (team, slot, setId) => {
        let member;
        if (team === 0) member = sungData;
        else if (team === 1) member = team1[slot];
        else member = team2[slot];

        if (!member) return;

        const updatedMember = { ...member, set: setId };

        if (team === 0) {
            setSungData(updatedMember);
        } else if (team === 1) {
            const newTeam = [...team1];
            newTeam[slot] = updatedMember;
            setTeam1(newTeam);
        } else {
            const newTeam = [...team2];
            newTeam[slot] = updatedMember;
            setTeam2(newTeam);
        }

        // Mettre à jour le panneau de détails si c'est le personnage sélectionné
        if (selectedCharForDetails && selectedCharForDetails.team === team && selectedCharForDetails.slot === slot) {
            setSelectedCharForDetails({
                ...selectedCharForDetails,
                member: updatedMember
            });
        }
    };

    // Changer le nombre de pièces du set
    const changeSetPieces = (team, slot, pieces) => {
        let member;
        if (team === 0) member = sungData;
        else if (team === 1) member = team1[slot];
        else member = team2[slot];

        if (!member) return;

        const updatedMember = { ...member, setPieces: pieces };

        if (team === 0) setSungData(updatedMember);
        else if (team === 1) {
            const newTeam = [...team1];
            newTeam[slot] = updatedMember;
            setTeam1(newTeam);
        } else {
            const newTeam = [...team2];
            newTeam[slot] = updatedMember;
            setTeam2(newTeam);
        }
    };

    // Toggle Core Attack TC (+10% TC)
    const toggleCoreAttackTC = (team, slot) => {
        let member;
        if (team === 0) member = sungData;
        else if (team === 1) member = team1[slot];
        else member = team2[slot];

        if (!member) return;

        const updatedMember = { ...member, coreAttackTC: !member.coreAttackTC };

        if (team === 0) {
            setSungData(updatedMember);
        } else if (team === 1) {
            const newTeam = [...team1];
            newTeam[slot] = updatedMember;
            setTeam1(newTeam);
        } else {
            const newTeam = [...team2];
            newTeam[slot] = updatedMember;
            setTeam2(newTeam);
        }

        // Mettre à jour le panneau de détails si c'est le personnage sélectionné
        if (selectedCharForDetails && selectedCharForDetails.team === team && selectedCharForDetails.slot === slot) {
            setSelectedCharForDetails({
                ...selectedCharForDetails,
                member: updatedMember
            });
        }
    };

    // Changer les stats brutes d'un personnage
    const changeRawStat = (team, slot, statName, value) => {
        let member;
        if (team === 0) member = sungData;
        else if (team === 1) member = team1[slot];
        else member = team2[slot];

        if (!member) return;

        // Assurer que value est un nombre
        const numValue = typeof value === 'number' ? value : (parseInt(value, 10) || 0);

        const updatedMember = {
            ...member,
            rawStats: {
                ...member.rawStats,
                [statName]: numValue
            }
        };

        // Mettre à jour l'état du personnage
        if (team === 0) {
            setSungData(updatedMember);
        } else if (team === 1) {
            const newTeam = [...team1];
            newTeam[slot] = updatedMember;
            setTeam1(newTeam);
        } else {
            const newTeam = [...team2];
            newTeam[slot] = updatedMember;
            setTeam2(newTeam);
        }

        // IMPORTANT: Mettre à jour aussi le panneau de détails pour l'affichage en temps réel
        if (selectedCharForDetails && selectedCharForDetails.team === team && selectedCharForDetails.slot === slot) {
            setSelectedCharForDetails({
                ...selectedCharForDetails,
                member: updatedMember
            });
        }
    };

    // Changer la stat principale de scaling (ATK, DEF, HP)
    const changeMainStatValue = (team, slot, value) => {
        let member;
        if (team === 0) member = sungData;
        else if (team === 1) member = team1[slot];
        else member = team2[slot];

        if (!member) return;

        // Assurer que value est un nombre
        const numValue = typeof value === 'number' ? value : (parseInt(value, 10) || 0);

        const updatedMember = {
            ...member,
            mainStatValue: numValue
        };

        // Mettre à jour l'état du personnage
        if (team === 0) {
            setSungData(updatedMember);
        } else if (team === 1) {
            const newTeam = [...team1];
            newTeam[slot] = updatedMember;
            setTeam1(newTeam);
        } else {
            const newTeam = [...team2];
            newTeam[slot] = updatedMember;
            setTeam2(newTeam);
        }

        // Mettre à jour le panneau de détails
        if (selectedCharForDetails && selectedCharForDetails.team === team && selectedCharForDetails.slot === slot) {
            setSelectedCharForDetails({
                ...selectedCharForDetails,
                member: updatedMember
            });
        }
    };

    // Sélectionner un personnage pour voir ses détails
    const selectCharForDetails = (team, slot) => {
        let member;
        if (team === 0) member = sungData;
        else if (team === 1) member = team1[slot];
        else member = team2[slot];

        if (member) {
            setSelectedCharForDetails({ team, slot, member });
        }
    };

    // 🎯 PRESET: Dark Team
    const applyDarkPreset = () => {
        // Activer Sung avec set 8pc Greed (ID: 'jinwoo')
        const sungChar = availableCharacters.find(c => c.id === 'jinwoo');
        if (sungChar) {
            setSungEnabled(true);
            setSungData({
                ...sungChar,
                advancement: 5,
                weaponAdvancement: 5,
                // 8pc Greed
                leftSet: 'burning-greed',
                leftPieces: 4,
                rightSet: 'burning-greed',
                rightPieces: 4,
                coreAttackTC: true,
                rawStats: {
                    critRate: 0,
                    critDMG: 0,
                    defPen: 0,
                }
            });
        }

        // Team 1: Baek (Armed+Obsidian), Sian (Armed+Expert), Son (Desire Chaos 8pc)
        const baekChar = availableCharacters.find(c => c.id === 'silverbaek');
        const sianChar = availableCharacters.find(c => c.id === 'sian');
        const sonChar = availableCharacters.find(c => c.id === 'son');

        const newTeam1 = [
            baekChar ? {
                ...baekChar,
                advancement: 5,
                weaponAdvancement: 5,
                // 4pc Armed + 4pc Obsidian
                leftSet: 'armed',
                leftPieces: 4,
                rightSet: 'obsidian',
                rightPieces: 4,
                coreAttackTC: true,
                rawStats: { critRate: 0, critDMG: 0, defPen: 0 }
            } : null,
            sianChar ? {
                ...sianChar,
                advancement: 5,
                weaponAdvancement: 5,
                // 4pc Armed + 4pc Expert
                leftSet: 'armed',
                leftPieces: 4,
                rightSet: 'expert',
                rightPieces: 4,
                coreAttackTC: true,
                rawStats: { critRate: 0, critDMG: 0, defPen: 0 }
            } : null,
            sonChar ? {
                ...sonChar,
                advancement: 5,
                weaponAdvancement: 5,
                // 8pc Desire Chaos
                leftSet: 'chaotic-desire',
                leftPieces: 4,
                rightSet: 'chaotic-desire',
                rightPieces: 4,
                coreAttackTC: true,
                rawStats: { critRate: 0, critDMG: 0, defPen: 0 }
            } : null
        ];
        setTeam1(newTeam1);

        // Team 2: Isla (Guardian+Sylph), Ilhwan (Armed+Expert), Lee Bora (Angel+Wish)
        const islaChar = availableCharacters.find(c => c.id === 'isla');
        const ilhwanChar = availableCharacters.find(c => c.id === 'ilhwan');
        const leeChar = availableCharacters.find(c => c.id === 'lee');

        const newTeam2 = [
            islaChar ? {
                ...islaChar,
                advancement: 5,
                weaponAdvancement: 5,
                // 4pc Guardian + 4pc Sylph
                leftSet: 'guardian',
                leftPieces: 4,
                rightSet: 'sylph',
                rightPieces: 4,
                coreAttackTC: true,
                rawStats: { critRate: 0, critDMG: 0, defPen: 0 }
            } : null,
            ilhwanChar ? {
                ...ilhwanChar,
                advancement: 5,
                weaponAdvancement: 5,
                // 4pc Armed + 4pc Expert
                leftSet: 'armed',
                leftPieces: 4,
                rightSet: 'expert',
                rightPieces: 4,
                coreAttackTC: true,
                rawStats: { critRate: 0, critDMG: 0, defPen: 0 }
            } : null,
            leeChar ? {
                ...leeChar,
                advancement: 5,
                weaponAdvancement: 5,
                // 4pc Angel + 4pc Wish Chaos
                leftSet: 'angel',
                leftPieces: 4,
                rightSet: 'chaotic-wish',
                rightPieces: 4,
                coreAttackTC: true,
                rawStats: { critRate: 0, critDMG: 0, defPen: 0 }
            } : null
        ];
        setTeam2(newTeam2);

        // Fermer le modal de sélection si ouvert
        setSelectedSlot(null);
    };

    // 🧮 CALCULER LES STATS FINALES AVEC BREAKDOWN DÉTAILLÉ
    const calculateFinalStats = useMemo(() => {
        // Initialiser les totaux à 0 (pas de stats de base séparées)
        let totalCritRate = 0;
        let totalCritDMG = 0;
        let totalDefPen = 0;

        // Initialiser les breakdown par catégorie
        let weaponBuffsCritRate = 0;
        let weaponBuffsCritDMG = 0;
        let weaponBuffsDefPen = 0;

        let teamBuffsCritRate = 0;
        let teamBuffsCritDMG = 0;
        let teamBuffsDefPen = 0;

        let rawStatsCritRate = 0;
        let rawStatsCritDMG = 0;
        let rawStatsDefPen = 0;

        // Buffs conditionnels (calculés UNE SEULE FOIS pour tout le RAID)
        let conditionalBuffsCritRate = 0;
        let conditionalBuffsCritDMG = 0;
        let conditionalBuffsDefPen = 0;

        // Buffs personnels (calculés par personnage uniquement pour lui-même)
        let personalBuffsCritRate = 0;
        let personalBuffsCritDMG = 0;
        let personalBuffsDefPen = 0;

        const allMembers = [
            ...(sungEnabled && sungData ? [sungData] : []),
            ...team1.filter(m => m !== null),
            ...team2.filter(m => m !== null),
        ];

        // 🌟 BUFFS GLOBAUX (applyToAll = true) - Lee Bora et autres
        // Ces buffs s'appliquent une seule fois, même si le perso apparaît plusieurs fois
        const globalBuffsApplied = new Set();
        allMembers.forEach(member => {
            const buffs = getCharacterBuffs(member.id, member.advancement);
            // Si ce personnage donne des buffs globaux et qu'on ne les a pas déjà appliqués
            if (buffs.applyToAll && !globalBuffsApplied.has(member.id)) {
                teamBuffsCritRate += buffs.critRate;
                teamBuffsCritDMG += buffs.critDMG;
                teamBuffsDefPen += buffs.defPen;
                globalBuffsApplied.add(member.id);
            }
        });

        // 🌀 BUFFS CONDITIONNELS - Système de comptage d'éléments (ex: Lee Bora A2+)
        // Compter le nombre de hunters Dark dans la composition complète
        const darkHunterCount = allMembers.filter(member => {
            const charData = characters[member.id];
            return charData && charData.element === 'Dark';
        }).length;

        // Calculer les buffs conditionnels pour chaque personnage
        const conditionalBuffsPerMember = new Map();
        const conditionalBuffsApplied = new Set();

        allMembers.forEach((member) => {
            // Pour Lee Bora: les buffs conditionnels sont débloqués à A2 et persistent après
            // Donc si Lee Bora est A2+, on va chercher les buffs de A2
            let conditionalBuff = null;

            if (member.id === 'lee' && member.advancement >= 2) {
                // Récupérer les buffs de A2 pour avoir le conditionalBuff
                const leeA2Buffs = getCharacterBuffs('lee', 2);
                conditionalBuff = leeA2Buffs.conditionalBuff;
            } else {
                // Pour les autres personnages, utiliser les buffs du niveau actuel
                const buffs = getCharacterBuffs(member.id, member.advancement);
                conditionalBuff = buffs.conditionalBuff;
            }

            // Vérifier si ce personnage a des buffs conditionnels et qu'on ne les a pas déjà traités
            if (conditionalBuff && !conditionalBuffsApplied.has(member.id)) {
                const conditional = conditionalBuff;

                // Appliquer le buff conditionnel uniquement aux hunters de l'élément cible
                if (conditional.targetElement && conditional.raidWide) {
                    allMembers.forEach((targetMember, targetIndex) => {
                        const targetCharData = characters[targetMember.id];

                        // Vérifier si le hunter cible correspond à l'élément requis
                        if (targetCharData && targetCharData.element === conditional.targetElement) {
                            // Calculer le bonus basé sur le nombre d'alliés de cet élément
                            let bonusCritDMG = 0;

                            if (conditional.countCondition === 'element' && conditional.critDMGPerAlly) {
                                bonusCritDMG = darkHunterCount * conditional.critDMGPerAlly;
                            }

                            // Stocker le bonus pour ce membre cible en utilisant son index unique
                            if (!conditionalBuffsPerMember.has(targetIndex)) {
                                conditionalBuffsPerMember.set(targetIndex, { critRate: 0, critDMG: 0, defPen: 0 });
                            }
                            const currentBuffs = conditionalBuffsPerMember.get(targetIndex);
                            currentBuffs.critDMG += bonusCritDMG;
                        }
                    });

                    conditionalBuffsApplied.add(member.id);
                }
            }
        });

        // 🔫 BUFFS D'ARME - Système similaire aux buffs globaux
        // Les armes donnent un debuff RAID qui s'applique une seule fois au raid entier
        // Prendre le niveau d'arme le plus élevé pour chaque type d'arme unique
        const weaponLevelsMap = new Map(); // key: id de l'arme, value: niveau max
        allMembers.forEach(member => {
            // Pour l'instant, toutes les armes sont "weapon" (Lee Bora)
            // Plus tard, on pourra avoir weapon_ilhwan, weapon_emma, etc.
            const weaponId = 'weapon';
            const currentLevel = member.weaponAdvancement || 0;
            const existingLevel = weaponLevelsMap.get(weaponId) || -1;

            // Garder le niveau le plus élevé
            if (currentLevel > existingLevel) {
                weaponLevelsMap.set(weaponId, currentLevel);
            }
        });

        // Appliquer les buffs d'arme une seule fois par type d'arme (au niveau le plus élevé)
        weaponLevelsMap.forEach((level, weaponId) => {
            const weaponBuffs = getCharacterBuffs(weaponId, level);
            weaponBuffsCritRate += weaponBuffs.critRate;
            weaponBuffsCritDMG += weaponBuffs.critDMG;
            weaponBuffsDefPen += weaponBuffs.defPen;
        });

        // 🎯 BUFFS DE SET PAR GROUPE
        // Groupe 1: Sung + Team1 (se buff entre eux)
        // Groupe 2: Team2 (se buff entre eux)
        const group1Members = [
            ...(sungEnabled && sungData ? [sungData] : []),
            ...team1.filter(m => m !== null)
        ];
        const group2Members = team2.filter(m => m !== null);

        // Calculer les buffs de set pour le Groupe 1 (Sung + Team1)
        let group1SetBuffsCritRate = 0;
        let group1SetBuffsCritDMG = 0;
        let group1SetBuffsDefPen = 0;

        group1Members.forEach(member => {
            const setBonus = getCombinedSetBonuses(member);
            if (setBonus) {
                group1SetBuffsCritRate += setBonus.critRate;
                group1SetBuffsCritDMG += setBonus.critDMG;
                group1SetBuffsDefPen += setBonus.defPen;
            }
        });

        // Calculer les buffs de set pour le Groupe 2 (Team2)
        let group2SetBuffsCritRate = 0;
        let group2SetBuffsCritDMG = 0;
        let group2SetBuffsDefPen = 0;

        group2Members.forEach(member => {
            const setBonus = getCombinedSetBonuses(member);
            if (setBonus) {
                group2SetBuffsCritRate += setBonus.critRate;
                group2SetBuffsCritDMG += setBonus.critDMG;
                group2SetBuffsDefPen += setBonus.defPen;
            }
        });

        allMembers.forEach((member, memberIndex) => {
            // Buffs du personnage (team buffs) - Ne pas appliquer si c'est un buff global (déjà fait plus haut)
            const buffs = getCharacterBuffs(member.id, member.advancement);
            if (!buffs.applyToAll) {
                teamBuffsCritRate += buffs.critRate;
                teamBuffsCritDMG += buffs.critDMG;
                teamBuffsDefPen += buffs.defPen;
            }

            // ⭐ BUFFS PERSONNELS (personalBuffs) - S'appliquent uniquement au personnage lui-même
            // Pour Lee Bora: les buffs personnels sont débloqués à A2 et persistent après
            // NE PAS ajouter aux teamBuffs car ils ne s'appliquent qu'à Lee Bora elle-même
            let personalBuffs = null;

            if (member.id === 'lee' && member.advancement >= 2) {
                // Récupérer les buffs de A2 pour avoir les personalBuffs
                const leeA2Buffs = getCharacterBuffs('lee', 2);
                personalBuffs = leeA2Buffs.personalBuffs;

                // Ajouter aux buffs personnels uniquement (pas aux team buffs)
                if (personalBuffs) {
                    personalBuffsCritRate += personalBuffs.critRate || 0;
                    personalBuffsCritDMG += personalBuffs.critDMG || 0;
                    personalBuffsDefPen += personalBuffs.defPen || 0;
                }
            }

            // 🌀 BUFFS CONDITIONNELS - NE PAS AJOUTER aux teamBuffs car c'est déjà calculé par membre
            // Les buffs conditionnels sont déjà stockés dans conditionalBuffsPerMember
            // et seront ajoutés individuellement par membre Dark uniquement

            // Conversion des valeurs brutes en % AVEC NIVEAU D'ENNEMI
            // TC: Formule ajustée selon le niveau de l'ennemi
            if (member.rawStats.critRate > 0) {
                const tcPercent = parseFloat(statConversionsWithEnemy.tc.toPercent(member.rawStats.critRate, enemyLevel));
                rawStatsCritRate += tcPercent;
            }
            // DCC: Formule ajustée selon le niveau de l'ennemi
            // IMPORTANT: La formule de conversion inclut le 50% de base du jeu (0 DCC = 50% affiché)
            // On doit soustraire ces 50% pour n'obtenir que le BONUS réel des stats brutes
            if (member.rawStats.critDMG > 0) {
                const dccPercent = parseFloat(statConversionsWithEnemy.dcc.toPercent(member.rawStats.critDMG, enemyLevel));
                rawStatsCritDMG += (dccPercent - 50); // Soustraire le 50% de base pour n'avoir que le bonus
            }
            // Def Pen: Formule ajustée selon le niveau de l'ennemi
            if (member.rawStats.defPen > 0) {
                const defPenPercent = parseFloat(statConversionsWithEnemy.defPen.toPercent(member.rawStats.defPen, enemyLevel));
                rawStatsDefPen += defPenPercent;
            }
        });

        // 🌀 CALCULER LES BUFFS CONDITIONNELS UNE SEULE FOIS
        // Pour Lee Bora A2+: +2% DCC par Dark hunter, appliqué à TOUS les Dark hunters du RAID
        const leeBoraInRaid = allMembers.find(m => m.id === 'lee' && m.advancement >= 2);
        if (leeBoraInRaid) {
            const leeA2 = getCharacterBuffs('lee', 2);
            if (leeA2.conditionalBuff && leeA2.conditionalBuff.targetElement === 'Dark') {
                // Compter les Dark hunters
                const darkCount = allMembers.filter(m => {
                    const charData = characters[m.id];
                    return charData && charData.element === 'Dark';
                }).length;

                // Le buff est: darkCount × 2% appliqué à chaque Dark hunter
                // Donc le total RAID est: darkCount × 2% (pas × darkCount encore une fois!)
                conditionalBuffsCritDMG = darkCount * leeA2.conditionalBuff.critDMGPerAlly;
            }
        }

        // Calculer les totaux
        // IMPORTANT: Les buffs de set sont maintenant séparés par groupe (Sung+Team1 vs Team2)
        // On ne peut pas les additionner dans un total global car ils s'appliquent à des groupes différents
        // Les buffs personnels et conditionnels ne sont PAS inclus dans le total global non plus
        totalCritRate += weaponBuffsCritRate + teamBuffsCritRate + rawStatsCritRate;
        totalCritDMG += weaponBuffsCritDMG + teamBuffsCritDMG + rawStatsCritDMG;
        totalDefPen += weaponBuffsDefPen + teamBuffsDefPen + rawStatsDefPen;

        return {
            critRate: totalCritRate,
            critDMG: totalCritDMG,
            defPen: totalDefPen,
            // Breakdown détaillé avec buffs de set séparés par groupe
            breakdown: {
                critRate: {
                    weapon: weaponBuffsCritRate,
                    teamBuffs: teamBuffsCritRate,
                    personalBuffs: personalBuffsCritRate,
                    conditionalBuffs: conditionalBuffsCritRate,
                    // Buffs de set séparés par groupe
                    setBuffsGroup1: group1SetBuffsCritRate,  // Sung + Team1
                    setBuffsGroup2: group2SetBuffsCritRate,  // Team2
                    rawStats: rawStatsCritRate,
                    total: totalCritRate
                },
                critDMG: {
                    weapon: weaponBuffsCritDMG,
                    teamBuffs: teamBuffsCritDMG,
                    personalBuffs: personalBuffsCritDMG,
                    conditionalBuffs: conditionalBuffsCritDMG,
                    // Buffs de set séparés par groupe
                    setBuffsGroup1: group1SetBuffsCritDMG,  // Sung + Team1
                    setBuffsGroup2: group2SetBuffsCritDMG,  // Team2
                    rawStats: rawStatsCritDMG,
                    total: totalCritDMG
                },
                defPen: {
                    weapon: weaponBuffsDefPen,
                    teamBuffs: teamBuffsDefPen,
                    personalBuffs: personalBuffsDefPen,
                    conditionalBuffs: conditionalBuffsDefPen,
                    // Buffs de set séparés par groupe
                    setBuffsGroup1: group1SetBuffsDefPen,  // Sung + Team1
                    setBuffsGroup2: group2SetBuffsDefPen,  // Team2
                    rawStats: rawStatsDefPen,
                    total: totalDefPen
                }
            }
        };
    }, [sungData, team1, team2, sungEnabled, selectedEnemy, enemyLevel]);

    const elements = ['all', 'Fire', 'Water', 'Wind', 'Light', 'Dark'];

    return (
        <div className="min-h-screen text-white p-6 relative">
            {/* Background Image avec overlay violet */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: 'url(https://res.cloudinary.com/dbg7m8qjd/image/upload/v1768608582/BackgroundScreen-Theorycraft_opfviw.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                }}
            />
            {/* Overlay violet/sombre pour se fondre avec le thème */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    background: 'linear-gradient(135deg, rgba(15, 15, 26, 0.92) 0%, rgba(88, 28, 135, 0.15) 50%, rgba(15, 15, 26, 0.95) 100%)',
                }}
            />
            {/* Deuxième overlay pour renforcer l'effet violet */}
            <div
                className="fixed inset-0 z-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at top, rgba(139, 92, 246, 0.08) 0%, transparent 60%), radial-gradient(ellipse at bottom, rgba(168, 85, 247, 0.05) 0%, transparent 60%)',
                }}
            />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-[#6c63ff] to-[#a855f7] bg-clip-text text-transparent">
                        ⚡ Theorycraft
                    </h1>
                    <p className="text-purple-300">
                        Calculateur de synergies de team - Crit Rate, Crit DMG, Def Pen
                    </p>
                </motion.div>

                {/* Preset Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="flex justify-center mb-6"
                >
                    <button
                        onClick={applyDarkPreset}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl font-bold text-white shadow-lg shadow-purple-500/50 transition-all hover:scale-105 flex items-center gap-2"
                    >
                        🎯 Preset Dark Team
                    </button>
                </motion.div>

                {/* Enemy Selector */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.075 }}
                    className="bg-gradient-to-r from-red-800/30 to-rose-800/30 backdrop-blur-sm rounded-xl p-6 mb-6 border border-red-500/50"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            🎯 Ennemi Ciblé
                        </h2>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400">Sélectionner:</span>
                            <div className="flex gap-2">
                                {Object.values(ENEMIES).map(enemy => (
                                    <button
                                        key={enemy.id}
                                        onClick={() => {
                                            setSelectedEnemy(enemy.id);
                                            setEnemyLevel(enemy.level); // Réinitialiser au level par défaut
                                        }}
                                        className={`px-4 py-2 rounded-lg font-semibold transition-all border-2 ${
                                            selectedEnemy === enemy.id
                                                ? 'bg-red-700 border-red-500 text-white shadow-lg shadow-red-500/50'
                                                : 'bg-gray-900/50 border-red-700/50 text-gray-400 hover:bg-red-900/30 hover:text-white'
                                        }`}
                                    >
                                        <span className="mr-2">{enemy.icon}</span>
                                        {enemy.name}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 ml-2 border-l border-red-500/30 pl-4">
                                <span className="text-sm text-gray-400">Niveau:</span>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={enemyLevel}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        if (value >= 1 && value <= 100) {
                                            setEnemyLevel(value);
                                        }
                                    }}
                                    className="w-16 px-2 py-1 bg-gray-900/70 border border-red-500/50 rounded text-white text-center font-bold focus:border-red-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-400 italic">
                        💡 Le niveau de l'ennemi affecte les % réels de Taux Crit, Dégâts Crit et Pénétration Déf
                    </div>
                </motion.div>

                {/* Sung Jin-Woo (Position 1 optionnelle) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-r from-purple-800/30 to-blue-800/30 backdrop-blur-sm rounded-xl p-6 mb-6 border border-purple-500/50"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            👑 Sung Jin-Woo (Position 1)
                        </h2>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <span className="text-sm text-gray-400">Activer</span>
                            <input
                                type="checkbox"
                                checked={sungEnabled}
                                onChange={(e) => {
                                    const isEnabled = e.target.checked;
                                    setSungEnabled(isEnabled);
                                    if (!isEnabled) {
                                        setSungData(null);
                                    } else {
                                        // Auto-sélectionner Sung Jinwoo
                                        const sungChar = availableCharacters.find(char =>
                                            char.id === 'sung' ||
                                            char.name.toLowerCase().includes('sung') ||
                                            char.name.toLowerCase().includes('jinwoo')
                                        );
                                        if (sungChar) {
                                            const newSungData = {
                                                ...sungChar,
                                                advancement: 5,
                                                weaponAdvancement: 5,
                                                set: 'burning-greed',
                                                setPieces: 0,
                                                rawStats: { critRate: 0, critDMG: 0, defPen: 0 }
                                            };
                                            setSungData(newSungData);
                                        }
                                    }
                                }}
                                className="w-5 h-5 rounded bg-gray-700 border-gray-600"
                            />
                        </label>
                    </div>

                    {sungEnabled && (
                        <div className="flex items-center gap-4">
                            {sungData ? (
                                <CharacterSlot
                                    character={sungData}
                                    onRemove={() => removeCharacter(0, 0)}
                                    onAdvancementChange={(delta) => changeAdvancement(0, 0, delta)}
                                    onSetPiecesChange={(pieces) => changeSetPieces(0, 0, pieces)}
                                    onClick={() => selectCharForDetails(0, 0)}
                                    isSelected={selectedCharForDetails?.team === 0}
                                />
                            ) : (
                                <button
                                    onClick={() => setSelectedSlot({ team: 0, slot: 0 })}
                                    className="w-24 h-24 bg-gray-700/50 border-2 border-dashed border-purple-500/50 rounded-lg flex items-center justify-center hover:bg-gray-600/50 transition-colors"
                                >
                                    <Users className="w-8 h-8 text-purple-400" />
                                </button>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Teams */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Team 1 */}
                    <TeamPanel
                        title="Team 1"
                        team={team1}
                        teamNumber={1}
                        onSlotClick={(slot) => setSelectedSlot({ team: 1, slot })}
                        onRemove={(slot) => removeCharacter(1, slot)}
                        onAdvancementChange={(slot, delta) => changeAdvancement(1, slot, delta)}
                        onSetPiecesChange={(slot, pieces) => changeSetPieces(1, slot, pieces)}
                        onCharClick={(slot) => selectCharForDetails(1, slot)}
                        selectedChar={selectedCharForDetails}
                    />

                    {/* Team 2 */}
                    <TeamPanel
                        title="Team 2"
                        team={team2}
                        teamNumber={2}
                        onSlotClick={(slot) => setSelectedSlot({ team: 2, slot })}
                        onRemove={(slot) => removeCharacter(2, slot)}
                        onAdvancementChange={(slot, delta) => changeAdvancement(2, slot, delta)}
                        onSetPiecesChange={(slot, pieces) => changeSetPieces(2, slot, pieces)}
                        onCharClick={(slot) => selectCharForDetails(2, slot)}
                        selectedChar={selectedCharForDetails}
                    />
                </div>

                {/* Panel de détails du personnage sélectionné */}
                <AnimatePresence>
                    {selectedCharForDetails && (
                        <CharacterDetailsPanel
                            charData={selectedCharForDetails}
                            enemyLevel={enemyLevel}
                            onClose={() => setSelectedCharForDetails(null)}
                            onRawStatChange={(statName, value) => {
                                const { team, slot } = selectedCharForDetails;
                                changeRawStat(team, slot, statName, value);
                            }}
                            onSetChange={(setId) => {
                                const { team, slot } = selectedCharForDetails;
                                changeSet(team, slot, setId);
                            }}
                            onWeaponAdvancementChange={(delta) => {
                                const { team, slot } = selectedCharForDetails;
                                changeWeaponAdvancement(team, slot, delta);
                            }}
                            onMainStatChange={(value) => {
                                const { team, slot } = selectedCharForDetails;
                                changeMainStatValue(team, slot, value);
                            }}
                            toggleCoreAttackTC={toggleCoreAttackTC}
                            sungEnabled={sungEnabled}
                            sungData={sungData}
                            team1={team1}
                            team2={team2}
                        />
                    )}
                </AnimatePresence>

                {/* Stats par Personnage - NOUVELLE SECTION */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-indigo-800/30 to-purple-800/30 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/50"
                >
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        👥 Stats par Personnage
                    </h2>
                    <p className="text-sm text-gray-400 mb-4">
                        💡 Chaque personnage a des stats différentes selon ses buffs personnels et son élément. Survolez les valeurs pour voir le détail.
                    </p>
                    <IndividualStatsDisplay
                        sungEnabled={sungEnabled}
                        sungData={sungData}
                        team1={team1}
                        team2={team2}
                        enemyLevel={enemyLevel}
                    />
                </motion.div>

                {/* Modal de sélection de personnage */}
                {selectedSlot && (
                    <CharacterSelectionModal
                        characters={filteredCharacters}
                        elementFilter={elementFilter}
                        onElementChange={setElementFilter}
                        onSelect={handleSelectCharacter}
                        onClose={() => setSelectedSlot(null)}
                        elements={elements}
                    />
                )}
            </div>
        </div>
    );
};

// Composant: Slot de personnage
const CharacterSlot = ({ character, onRemove, onAdvancementChange, onSetPiecesChange, onClick, isSelected }) => {
    const advancementLabels = ['1x', 'A1', 'A2', 'A3', 'A4', 'A5'];
    const [showSetMenu, setShowSetMenu] = useState(false);

    return (
        <div className="relative flex flex-col items-center gap-2 group">
            {/* Remove button (en haut à droite de l'image) */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                className="absolute -top-2 -right-2 bg-black/60 backdrop-blur-sm text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-md z-10 opacity-0 group-hover:opacity-100 border border-gray-500/50 hover:border-red-500"
            >
                <X className="w-4 h-4" />
            </button>

            {/* Indicateur d'advancement (en haut à gauche) */}
            <div className="absolute -top-2 -left-2 bg-purple-900/90 border border-purple-500/50 text-purple-200 px-2 py-0.5 rounded text-xs font-bold shadow-md z-10">
                {advancementLabels[character.advancement]}
            </div>

            {/* Image du personnage (cliquable pour voir détails) */}
            <div
                onClick={onClick}
                className={`w-24 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                    isSelected ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' : 'border-purple-600/50 hover:border-purple-500'
                }`}
            >
                {character.image ? (
                    <img src={character.image} alt={character.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-purple-400 text-4xl">
                        👤
                    </div>
                )}
            </div>

            {/* Contrôles SOUS l'image (ne déclenchent pas onClick) */}
            <div className="flex flex-col gap-1 w-full items-center">
                {/* Boutons +/- d'advancement */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAdvancementChange(-1);
                        }}
                        className="bg-purple-800/90 hover:bg-purple-700 text-white w-6 h-6 rounded flex items-center justify-center font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
                        disabled={character.advancement <= 0}
                    >
                        -
                    </button>
                    <span className="text-purple-300 text-xs font-semibold min-w-[30px] text-center">
                        {advancementLabels[character.advancement]}
                    </span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAdvancementChange(1);
                        }}
                        className="bg-purple-800/90 hover:bg-purple-700 text-white w-6 h-6 rounded flex items-center justify-center font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
                        disabled={character.advancement >= 5}
                    >
                        +
                    </button>
                </div>

                {/* Set selector */}
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowSetMenu(!showSetMenu);
                        }}
                        className="bg-gradient-to-r from-[#3b3b9c] to-[#6c63ff] hover:from-[#4a4ab3] hover:to-[#7c72ff] text-white px-2 py-0.5 rounded text-xs font-semibold shadow-md transition-all flex items-center gap-1"
                    >
                        {getSetDisplayText(character)}
                        <ChevronDown className="w-3 h-3" />
                    </button>

                    {/* Set pieces dropdown */}
                    {showSetMenu && (
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900/95 border border-purple-600/50 rounded shadow-lg z-50 min-w-[100px] overflow-hidden">
                            {[0, 2, 4, 8].map(pieces => (
                                <button
                                    key={pieces}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSetPiecesChange(pieces);
                                        setShowSetMenu(false);
                                    }}
                                    className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                                        character.setPieces === pieces
                                            ? 'bg-purple-900/50 text-purple-200 font-semibold'
                                            : 'text-gray-300 hover:bg-purple-900/30 hover:text-white'
                                    }`}
                                >
                                    {pieces === 0 ? 'Aucun set' : `${pieces} pièces`}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Name */}
                <div className="text-center text-xs text-gray-300 truncate w-full px-1">
                    {character.name}
                </div>
            </div>
        </div>
    );
};

// Composant: Panneau d'équipe
const TeamPanel = ({ title, team, teamNumber, onSlotClick, onRemove, onAdvancementChange, onSetPiecesChange, onCharClick, selectedChar }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-700/50"
        >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                {title}
            </h2>
            <div className="grid grid-cols-3 gap-6">
                {team.map((member, index) => (
                    <div key={index} className="flex justify-center">
                        {member ? (
                            <CharacterSlot
                                character={member}
                                onRemove={() => onRemove(index)}
                                onAdvancementChange={(delta) => onAdvancementChange(index, delta)}
                                onSetPiecesChange={(pieces) => onSetPiecesChange(index, pieces)}
                                onClick={() => onCharClick(index)}
                                isSelected={selectedChar?.team === teamNumber && selectedChar?.slot === index}
                            />
                        ) : (
                            <button
                                onClick={() => onSlotClick(index)}
                                className="w-24 h-24 bg-gray-800/50 border-2 border-dashed border-purple-600/30 rounded-lg flex items-center justify-center hover:bg-purple-900/30 hover:border-purple-500/50 transition-colors"
                            >
                                <span className="text-purple-500 text-3xl">+</span>
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

// Composant: Panel de détails du personnage (affichage tous les niveaux A0-A5)
const CharacterDetailsPanel = ({
    charData,
    enemyLevel = 90,
    onClose,
    onRawStatChange,
    onSetChange,
    onWeaponAdvancementChange,
    onMainStatChange,
    toggleCoreAttackTC,
    sungEnabled,
    sungData,
    team1,
    team2
}) => {
    const { t } = useTranslation();
    const { member } = charData;
    const setBonus = getCombinedSetBonuses(member);
    const advancementLevels = [0, 1, 2, 3, 4, 5]; // A0 à A5
    const [showSetSelector, setShowSetSelector] = useState(false);
    const charOptim = CHARACTER_OPTIMIZATION[member.id];
    const mainStatInfo = charOptim?.mainStat;

    // 🎯 Déterminer quelle arme utiliser selon le personnage
    const getWeaponId = (characterId) => {
        const weaponMap = {
            'lee': 'weapon',           // Lee Bora weapon
            'ilhwan': 'weapon_ilhwan', // Ilhwan weapon
            'sian': 'weapon_sian',     // Sian weapon
            'son': 'weapon_son'        // Son Kihoon weapon (n'apporte rien)
        };
        return weaponMap[characterId] || 'weapon'; // Par défaut : Lee Bora weapon
    };

    const weaponId = getWeaponId(member.id);
    const weaponBuffs = getCharacterBuffs(weaponId, member.weaponAdvancement || 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-purple-900/30 backdrop-blur-sm rounded-xl p-6 mb-6 border border-purple-600/50"
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    {member.image && (
                        <img src={member.image} alt={member.name} className="w-12 h-12 rounded-lg object-cover border-2 border-purple-500" />
                    )}
                    {member.name}
                </h2>
                <button
                    onClick={onClose}
                    className="bg-purple-800/30 hover:bg-purple-700/40 text-purple-300 hover:text-white rounded-lg p-2 transition-colors border border-purple-600/50"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Core Attack TC Toggle */}
            <div className="mb-4 bg-gray-800/50 rounded-lg p-3 border border-green-700/50">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={member.coreAttackTC || false}
                        onChange={() => {
                            const { team, slot } = charData;
                            toggleCoreAttackTC(team, slot);
                        }}
                        className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-green-500 focus:ring-green-500 focus:ring-2 cursor-pointer"
                    />
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-green-400">🎯 {t('theorycraft.coreAttack.title')}</div>
                        <div className="text-xs text-gray-400">{t('theorycraft.coreAttack.description')}</div>
                    </div>
                </label>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Colonne 1: Arme */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-orange-700/50">
                    <h3 className="text-lg font-bold mb-3 text-orange-400">⚔️ {t('theorycraft.weapon.title')}</h3>
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <button
                            onClick={() => onWeaponAdvancementChange(-1)}
                            className="bg-orange-800/90 hover:bg-orange-700 text-white w-8 h-8 rounded flex items-center justify-center font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            disabled={member.weaponAdvancement <= 0}
                        >
                            -
                        </button>
                        <span className="text-orange-300 text-xl font-bold min-w-[70px] text-center">
                            {member.weaponAdvancement === 0 ? '1x (A0)' : `A${member.weaponAdvancement}`}
                        </span>
                        <button
                            onClick={() => onWeaponAdvancementChange(1)}
                            className="bg-orange-800/90 hover:bg-orange-700 text-white w-8 h-8 rounded flex items-center justify-center font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            disabled={member.weaponAdvancement >= 5}
                        >
                            +
                        </button>
                    </div>
                    <div className="space-y-2">
                        <StatRow label={t('theorycraft.weapon.critRate')} value={weaponBuffs.critRate} unit="%" color="text-yellow-300" />
                        <StatRow label={t('theorycraft.weapon.critDMG')} value={weaponBuffs.critDMG} unit="%" color="text-red-300" />
                        <StatRow label={t('theorycraft.weapon.defPen')} value={weaponBuffs.defPen} unit="%" color="text-blue-300" />
                    </div>
                </div>

                {/* Colonne 2: Valeurs brutes */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-700/50">
                    <h3 className="text-lg font-bold mb-3 text-blue-400">🔢 {t('theorycraft.rawValues.title')}</h3>
                    <p className="text-xs text-gray-400 mb-3 italic">
                        💡 {t('theorycraft.rawValues.hint', { level: enemyLevel })}
                    </p>
                    <div className="space-y-2">
                        <RawStatInput
                            label={t('theorycraft.weapon.critRate')}
                            value={member.rawStats.critRate}
                            onChange={(val) => onRawStatChange('critRate', val)}
                            statType="tc"
                            enemyLevel={enemyLevel}
                        />
                        <RawStatInput
                            label={t('theorycraft.weapon.critDMG')}
                            value={member.rawStats.critDMG}
                            onChange={(val) => onRawStatChange('critDMG', val)}
                            statType="dcc"
                            enemyLevel={enemyLevel}
                        />
                        <RawStatInput
                            label={t('theorycraft.weapon.defPen')}
                            value={member.rawStats.defPen}
                            onChange={(val) => onRawStatChange('defPen', val)}
                            statType="defPen"
                            enemyLevel={enemyLevel}
                        />
                    </div>

                    {/* Stat principale de scaling si disponible */}
                    {mainStatInfo && (
                        <div className="mt-4 pt-3 border-t border-gray-700/50">
                            <MainStatInput
                                label={mainStatInfo.label}
                                value={member.mainStatValue || 0}
                                onChange={onMainStatChange}
                                characterId={member.id}
                                icon={mainStatInfo.icon}
                                color={mainStatInfo.color}
                            />
                        </div>
                    )}
                </div>

                {/* Colonne 3: Buffs de set */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-700/50">
                    <h3 className="text-lg font-bold mb-3 text-indigo-400">✨ {t('theorycraft.setBuffs.title')}</h3>

                    {/* Sélecteur de set */}
                    <div className="mb-3 relative">
                        <label className="block text-xs text-gray-400 mb-1">{t('theorycraft.setBuffs.equipped')}</label>
                        <button
                            onClick={() => setShowSetSelector(!showSetSelector)}
                            className="w-full bg-gray-900/80 text-white text-sm p-2 rounded-lg border border-indigo-700/50 hover:border-indigo-500 focus:outline-none flex items-center justify-between"
                        >
                            <span className="truncate">{getSetDisplayText(member)}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showSetSelector ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown des sets */}
                        {showSetSelector && (
                            <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto bg-gray-900/95 border border-indigo-600/50 rounded-lg shadow-xl">
                                {Object.values(ARTIFACT_SETS).map(set => (
                                    <button
                                        key={set.id}
                                        onClick={() => {
                                            onSetChange(set.id);
                                            setShowSetSelector(false);
                                        }}
                                        className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                                            member.set === set.id
                                                ? 'bg-indigo-900/50 text-indigo-200 font-semibold'
                                                : 'text-gray-300 hover:bg-indigo-900/30 hover:text-white'
                                        }`}
                                    >
                                        {set.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {(setBonus.critRate > 0 || setBonus.critDMG > 0 || setBonus.defPen > 0) ? (
                        <div>
                            <p className="text-xs text-gray-400 mb-2">{t('theorycraft.setBuffs.bonus')}</p>
                            <div className="space-y-1">
                                <StatRow label={t('theorycraft.weapon.critRate')} value={setBonus.critRate} unit="%" color="text-yellow-300" />
                                <StatRow label={t('theorycraft.weapon.critDMG')} value={setBonus.critDMG} unit="%" color="text-red-300" />
                                <StatRow label={t('theorycraft.weapon.defPen')} value={setBonus.defPen} unit="%" color="text-blue-300" />
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">{t('theorycraft.setBuffs.noBonus')}</p>
                    )}
                </div>
            </div>

            {/* Section: Presets de stats rapides */}
            {charOptim && (
                <div className="mt-6 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg p-4 border border-purple-500/50">
                    <h3 className="text-lg font-bold mb-3 text-purple-300">🎯 {t('optimization.presets.title')}</h3>
                    <p className="text-xs text-gray-400 mb-3">
                        {t('optimization.presets.description')}
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                        {/* Preset Casual */}
                        <PresetButton
                            label={`🌱 ${t('optimization.presets.casual.label')}`}
                            description={t('optimization.presets.casual.description')}
                            color="#6b7280"
                            benchmarks={charOptim.benchmarks.casual}
                            mainStatValue={charOptim.mainStat?.benchmarks?.casual}
                            mainStatLabel={t(`optimization.stats.${charOptim.mainStat?.type || 'atk'}`)}
                            onClick={() => {
                                if (charOptim.mainStat) {
                                    onMainStatChange(charOptim.mainStat.benchmarks.casual);
                                }
                            }}
                        />
                        {/* Preset Dolphin/Avancé */}
                        <PresetButton
                            label={`🐬 ${t('optimization.presets.dolphin.label')}`}
                            description={t('optimization.presets.dolphin.description')}
                            color="#f59e0b"
                            benchmarks={charOptim.benchmarks.advanced}
                            mainStatValue={charOptim.mainStat?.benchmarks?.advanced}
                            mainStatLabel={t(`optimization.stats.${charOptim.mainStat?.type || 'atk'}`)}
                            onClick={() => {
                                if (charOptim.mainStat) {
                                    onMainStatChange(charOptim.mainStat.benchmarks.advanced);
                                }
                            }}
                        />
                        {/* Preset Whale */}
                        <PresetButton
                            label={`🐋 ${t('optimization.presets.whale.label')}`}
                            description={t('optimization.presets.whale.description')}
                            color="#a855f7"
                            benchmarks={charOptim.benchmarks.whale}
                            mainStatValue={charOptim.mainStat?.benchmarks?.whale}
                            mainStatLabel={t(`optimization.stats.${charOptim.mainStat?.type || 'atk'}`)}
                            onClick={() => {
                                if (charOptim.mainStat) {
                                    onMainStatChange(charOptim.mainStat.benchmarks.whale);
                                }
                            }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-3 italic">
                        💡 {t('optimization.presets.note', { mainStat: t(`optimization.stats.${charOptim.mainStat?.type || 'atk'}`) })}
                    </p>
                </div>
            )}

            {/* Section: Buffs donnés par advancement (A0 à A5) - VERSION DÉTAILLÉE */}
            <div className="mt-6 bg-gray-800/50 rounded-lg p-4 border border-purple-700/50">
                <h3 className="text-lg font-bold mb-3 text-green-400">👁️ {t('theorycraft.buffs.title')}</h3>
                <p className="text-xs text-gray-400 mb-3">
                    {t('theorycraft.buffs.description')}
                </p>

                {/* Tableau des buffs A0-A5 avec tooltips */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-purple-700/50">
                                <th className="text-left py-2 px-3 text-purple-300 font-semibold">{t('theorycraft.buffs.level')}</th>
                                <th className="text-center py-2 px-3 text-yellow-300 font-semibold">{t('theorycraft.weapon.critRate')} (%)</th>
                                <th className="text-center py-2 px-3 text-red-300 font-semibold">{t('theorycraft.weapon.critDMG')} (%)</th>
                                <th className="text-center py-2 px-3 text-blue-300 font-semibold">{t('theorycraft.weapon.defPen')} (%)</th>
                                <th className="text-left py-2 px-3 text-purple-300 font-semibold min-w-[200px]">{t('theorycraft.buffs.specialBuffs')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {advancementLevels.map(level => {
                                const buffs = getCharacterBuffs(member.id, level);
                                const isCurrentLevel = level === member.advancement;

                                // Déterminer les buffs spéciaux (pour Lee Bora notamment)
                                let specialBuffsDisplay = [];

                                // Buffs personnels - utiliser les buffs du niveau actuel
                                // Vérifier si ce niveau a des personalBuffs
                                if (buffs.personalBuffs) {
                                    const parts = [];
                                    if (buffs.personalBuffs.critRate > 0) {
                                        parts.push(`+${buffs.personalBuffs.critRate}% TC`);
                                    }
                                    if (buffs.personalBuffs.critDMG > 0) {
                                        parts.push(`+${buffs.personalBuffs.critDMG}% DCC`);
                                    }

                                    if (parts.length > 0) {
                                        const characterName = member.id === 'lee' ? 'Lee Bora' :
                                                             member.id === 'ilhwan' ? 'Ilhwan' :
                                                             member.id === 'silverbaek' ? 'Silver Mane Baek Yoonho' :
                                                             'ce personnage';
                                        specialBuffsDisplay.push({
                                            label: '👤 Personnel',
                                            value: parts.join(', '),
                                            tooltip: `Ces buffs s'appliquent UNIQUEMENT à ${characterName} lui-même`
                                        });
                                    }
                                }

                                // Buffs RAID conditionnels (affichés uniquement pour les personnages de l'élément ciblé)
                                // Vérifier si Lee Bora est dans la composition à A2+ pour activer le buff RAID Dark
                                const leeInRaid = [
                                    ...(sungEnabled && sungData ? [sungData] : []),
                                    ...team1.filter(m => m !== null),
                                    ...team2.filter(m => m !== null),
                                ].find(m => m && m.id === 'lee' && m.advancement >= 2);

                                // IMPORTANT: Afficher seulement si le NIVEAU ACTUEL est A2+
                                // Et seulement si le personnage actuel est Dark
                                if (leeInRaid && level >= 2) {
                                    const leeA2 = getCharacterBuffs('lee', 2);
                                    const memberCharData = characters[member.id];
                                    // Afficher le buff RAID UNIQUEMENT si ce personnage est de l'élément Dark
                                    if (leeA2.conditionalBuff && memberCharData && memberCharData.element === 'Dark') {
                                        // Compter les Dark hunters dans le RAID
                                        const allMembers = [
                                            ...(sungEnabled && sungData ? [sungData] : []),
                                            ...team1.filter(m => m !== null),
                                            ...team2.filter(m => m !== null),
                                        ];
                                        const darkCount = allMembers.filter(m => {
                                            const charData = characters[m.id];
                                            return charData && charData.element === 'Dark';
                                        }).length;

                                        const totalBuff = darkCount * leeA2.conditionalBuff.critDMGPerAlly;

                                        specialBuffsDisplay.push({
                                            label: '🌑 RAID Dark',
                                            value: `+${totalBuff}% DCC (${darkCount} × ${leeA2.conditionalBuff.critDMGPerAlly}%)`,
                                            tooltip: `Buff appliqué à TOUS les hunters Dark du RAID. ${darkCount} Dark hunters × ${leeA2.conditionalBuff.critDMGPerAlly}% = +${totalBuff}% DCC`
                                        });
                                    }
                                }

                                return (
                                    <tr
                                        key={level}
                                        className={`border-b border-gray-700/30 ${
                                            isCurrentLevel ? 'bg-purple-900/30' : ''
                                        }`}
                                    >
                                        <td className={`py-2 px-3 font-bold ${isCurrentLevel ? 'text-purple-300' : 'text-gray-400'}`}>
                                            {level === 0 ? '1x (A0)' : `A${level}`}
                                            {isCurrentLevel && ' ⭐'}
                                        </td>
                                        <td className="text-center py-2 px-3">
                                            <StatValueWithTooltip
                                                value={buffs.critRate}
                                                tooltip={`Taux Critique donné à la TEAM entière au niveau ${level === 0 ? 'A0' : `A${level}`}`}
                                                colorClass={buffs.critRate > 0 ? 'text-yellow-300' : 'text-gray-500'}
                                            />
                                        </td>
                                        <td className="text-center py-2 px-3">
                                            <StatValueWithTooltip
                                                value={buffs.critDMG}
                                                tooltip={`Dégâts Critiques donnés à la TEAM entière au niveau ${level === 0 ? 'A0' : `A${level}`}`}
                                                colorClass={buffs.critDMG > 0 ? 'text-red-300' : 'text-gray-500'}
                                            />
                                        </td>
                                        <td className="text-center py-2 px-3">
                                            <StatValueWithTooltip
                                                value={buffs.defPen}
                                                tooltip={`Pénétration Défense donnée à la TEAM entière au niveau ${level === 0 ? 'A0' : `A${level}`}`}
                                                colorClass={buffs.defPen > 0 ? 'text-blue-300' : 'text-gray-500'}
                                            />
                                        </td>
                                        <td className="py-2 px-3">
                                            {specialBuffsDisplay.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {specialBuffsDisplay.map((special, idx) => (
                                                        <div
                                                            key={`${level}-${special.label}-${idx}`}
                                                            className="group relative"
                                                        >
                                                            <div className="bg-purple-900/50 px-2 py-1 rounded border border-purple-600/30 text-xs cursor-help whitespace-nowrap">
                                                                <span className="font-semibold">{special.label}:</span> {special.value}
                                                            </div>
                                                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-64 pointer-events-none">
                                                                <div className="bg-gray-900/95 text-white p-2 rounded border border-purple-500/50 text-xs shadow-lg">
                                                                    {special.tooltip}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 text-xs">-</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="mt-3 text-xs text-gray-400 italic flex items-start gap-2">
                    <span>👁️</span>
                    <span>
                        <span className="text-purple-300 font-semibold">L'Œil de Sauron voit tout !</span>
                        {' '}Survolez n'importe quelle valeur pour comprendre d'où vient chaque buff.
                        Les buffs spéciaux (personnels et conditionnels) sont affichés dans la dernière colonne.
                    </span>
                </div>
            </div>

            {/* Section: Optimisation & Sweet Spots */}
            {CHARACTER_OPTIMIZATION[member.id] && (
                <div className="mt-6 bg-gray-800/50 rounded-lg p-4 border border-green-700/50">
                    <h3 className="text-lg font-bold mb-3 text-green-400">🎯 Optimisation & Sweet Spots</h3>
                    <CharacterOptimizationPanel characterId={member.id} />
                </div>
            )}
        </motion.div>
    );
};

// Composant: Panneau d'optimisation détaillé pour un personnage
const CharacterOptimizationPanel = ({ characterId }) => {
    const charOptim = CHARACTER_OPTIMIZATION[characterId];
    if (!charOptim) return null;

    return (
        <div className="space-y-4">
            {/* Header avec rôle et tier */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-white font-semibold">{charOptim.name}</div>
                    <div className="text-xs text-gray-400">{charOptim.role} • {charOptim.element}</div>
                </div>
                <div
                    className="px-3 py-1 rounded-full text-sm font-bold"
                    style={{
                        backgroundColor: charOptim.tier === 'SSS' ? '#fbbf24' :
                                        charOptim.tier === 'S+' ? '#a855f7' :
                                        charOptim.tier === 'S' ? '#8b5cf6' :
                                        charOptim.tier === 'A+' ? '#3b82f6' : '#6b7280',
                        color: charOptim.tier === 'SSS' ? '#000' : '#fff'
                    }}
                >
                    Tier {charOptim.tier}
                </div>
            </div>

            {/* Sweet Spots */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {['critRate', 'critDMG', 'defPen'].map(statName => {
                    const spot = charOptim.sweetSpots[statName];
                    const statLabels = { critRate: 'Taux Critique', critDMG: 'Dégâts Critiques', defPen: 'Def Pen' };
                    const icons = { critRate: '🎯', critDMG: '⚔️', defPen: '🛡️' };

                    return (
                        <div key={statName} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-300">
                                    {icons[statName]} {statLabels[statName]}
                                </span>
                                <span
                                    className="text-xs px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: `${spot.color}20`, color: spot.color }}
                                >
                                    P{spot.priority}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold" style={{ color: spot.color }}>
                                    {spot.ideal}%
                                </span>
                                <span className="text-xs text-gray-500">
                                    ({spot.min}% - {spot.max}%)
                                </span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">{spot.note}</div>
                        </div>
                    );
                })}
            </div>

            {/* Priorité Substats */}
            <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
                <div className="text-sm font-medium text-purple-300 mb-2">📊 Priorité des Substats</div>
                <div className="flex flex-wrap gap-2">
                    {charOptim.substatPriority.map((stat, idx) => (
                        <div key={stat} className="flex items-center gap-1">
                            <span
                                className="px-2 py-1 rounded text-xs font-medium"
                                style={{
                                    backgroundColor: idx === 0 ? '#22c55e20' :
                                                    idx === 1 ? '#84cc1620' :
                                                    idx === 2 ? '#f59e0b20' : '#6b728020',
                                    color: idx === 0 ? '#22c55e' :
                                           idx === 1 ? '#84cc16' :
                                           idx === 2 ? '#f59e0b' : '#6b7280'
                                }}
                            >
                                {stat}
                            </span>
                            {idx < charOptim.substatPriority.length - 1 && (
                                <span className="text-gray-600">›</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Scaling & Tips en deux colonnes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Scaling */}
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
                    <div className="text-sm font-medium text-orange-300 mb-2">📈 Scaling</div>
                    <div className="space-y-1">
                        {Object.entries(charOptim.scaling).map(([stat, data]) => (
                            <div key={stat} className="flex items-center justify-between text-xs">
                                <span className="text-gray-400 capitalize">{stat}:</span>
                                <span className={`font-semibold ${
                                    data.grade.includes('S') ? 'text-purple-400' :
                                    data.grade.includes('A') ? 'text-blue-400' : 'text-gray-400'
                                }`}>
                                    {data.grade}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tips */}
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
                    <div className="text-sm font-medium text-yellow-300 mb-2">💡 Conseils</div>
                    <ul className="space-y-1">
                        {charOptim.tips.slice(0, 3).map((tip, idx) => (
                            <li key={idx} className="text-xs text-gray-300 flex items-start gap-1">
                                <span className="text-yellow-500">•</span>
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Sets Recommandés */}
            <div className="bg-gray-900/50 rounded-lg p-3 border border-indigo-700/50">
                <div className="text-sm font-medium text-indigo-300 mb-2">✨ Sets Recommandés</div>
                <div className="flex flex-wrap gap-2">
                    {charOptim.recommendedSets.map((set, idx) => (
                        <span
                            key={idx}
                            className="px-2 py-1 rounded text-xs bg-indigo-900/50 text-indigo-200 border border-indigo-600/30"
                        >
                            {set}
                        </span>
                    ))}
                </div>
            </div>

            {/* Benchmarks */}
            <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
                <div className="text-sm font-medium text-cyan-300 mb-2">📊 Benchmarks</div>
                <div className="grid grid-cols-4 gap-2 text-center">
                    {Object.entries(charOptim.benchmarks).map(([level, stats]) => {
                        const levelColors = {
                            casual: { bg: '#6b728020', text: '#6b7280', label: '🌱 Débutant' },
                            intermediate: { bg: '#3b82f620', text: '#3b82f6', label: '📈 Intermédiaire' },
                            advanced: { bg: '#f59e0b20', text: '#f59e0b', label: '⭐ Avancé' },
                            whale: { bg: '#a855f720', text: '#a855f7', label: '🐋 Whale' }
                        };
                        const colors = levelColors[level];
                        const mainStatBench = charOptim.mainStat?.benchmarks?.[level];

                        return (
                            <div
                                key={level}
                                className="rounded-lg p-2 border"
                                style={{ backgroundColor: colors.bg, borderColor: `${colors.text}30` }}
                            >
                                <div className="text-xs font-medium mb-1" style={{ color: colors.text }}>
                                    {colors.label}
                                </div>
                                <div className="text-xs text-gray-400 space-y-0.5">
                                    {/* Stat principale en premier */}
                                    {mainStatBench && (
                                        <div style={{ color: charOptim.mainStat.color }}>
                                            {charOptim.mainStat.label}: {(mainStatBench / 1000).toFixed(0)}K
                                        </div>
                                    )}
                                    <div>TC: {stats.critRate}%</div>
                                    <div>DCC: {stats.critDMG}%</div>
                                    <div>DP: {stats.defPen}%</div>
                                </div>
                                <div className="text-xs mt-1 font-semibold" style={{ color: colors.text }}>
                                    {stats.dps}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// Composant: Valeur de stat avec tooltip (pour L'Œil de Sauron 👁️)
const StatValueWithTooltip = ({ value, tooltip, colorClass }) => {
    return (
        <div className="group relative inline-block cursor-help">
            <span className={`font-semibold ${colorClass}`}>
                {value}
            </span>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-50 pointer-events-none">
                <div className="bg-gray-900/95 text-white px-3 py-2 rounded border border-purple-500/50 text-xs shadow-xl whitespace-nowrap">
                    <div className="flex items-center gap-2">
                        <span className="text-purple-300">👁️</span>
                        <span>{tooltip}</span>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-purple-500/50"></div>
                </div>
            </div>
        </div>
    );
};

// Composant: Ligne de stat
const StatRow = ({ label, value, unit, color = "text-gray-300" }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-gray-400">{label}:</span>
        <span className={`font-bold ${color}`}>{value}{unit}</span>
    </div>
);

// Composant: Input pour stat brute avec affichage du % converti (AVEC NIVEAU D'ENNEMI)
const RawStatInput = ({ label, value, onChange, statType, enemyLevel = 90 }) => {
    // Calculer le pourcentage converti AVEC le niveau de l'ennemi
    let convertedPercent = 0;
    if (value > 0 && statConversionsWithEnemy[statType]) {
        convertedPercent = parseFloat(statConversionsWithEnemy[statType].toPercent(value, enemyLevel));
    }

    return (
        <div>
            <label className="block text-xs text-gray-400 mb-1">{label}</label>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={value === 0 ? '' : value.toLocaleString()}
                    onChange={(e) => {
                        // Nettoyer la valeur: garder seulement les chiffres
                        const cleanValue = e.target.value.replace(/[^0-9]/g, '');
                        // Convertir en nombre ou 0 si vide
                        const numValue = cleanValue === '' ? 0 : parseInt(cleanValue, 10);
                        onChange(numValue);
                    }}
                    className="flex-1 bg-gray-900/80 text-white text-sm p-2 rounded-lg border border-purple-700/50 focus:border-purple-500 focus:outline-none"
                    placeholder="0"
                />
                {value > 0 && (
                    <span className="text-xs text-green-400 font-semibold whitespace-nowrap">
                        +{convertedPercent}%
                    </span>
                )}
            </div>
        </div>
    );
};

// Composant: Input pour stat principale de scaling (ATK, DEF, HP)
const MainStatInput = ({ label, value, onChange, characterId, icon, color }) => {
    const { t } = useTranslation();
    const mainStatStatus = getMainStatStatus(characterId, value);
    const charOptim = CHARACTER_OPTIMIZATION[characterId];
    const mainStatInfo = charOptim?.mainStat;

    if (!mainStatInfo) return null;

    // Traduire le message de statut
    const getStatusMessage = (status) => {
        if (!status) return '';
        const statusKey = status.status || 'unknown';
        return t(`optimization.status.${statusKey}`);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-400 flex items-center gap-1">
                    <span>{icon}</span>
                    <span>{t('theorycraft.mainStat.label', { stat: label })}</span>
                </label>
                {mainStatStatus && (
                    <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${mainStatStatus.color}20`, color: mainStatStatus.color }}
                    >
                        {getStatusMessage(mainStatStatus)}
                    </span>
                )}
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={value === 0 ? '' : value.toLocaleString()}
                    onChange={(e) => {
                        const cleanValue = e.target.value.replace(/[^0-9]/g, '');
                        const numValue = cleanValue === '' ? 0 : parseInt(cleanValue, 10);
                        onChange(numValue);
                    }}
                    className="flex-1 bg-gray-900/80 text-white text-sm p-2 rounded-lg border focus:outline-none"
                    style={{ borderColor: `${color}50` }}
                    placeholder="0"
                />
            </div>
            {/* Barre de progression vers le prochain palier */}
            {mainStatStatus && value > 0 && (
                <div className="mt-2">
                    <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${Math.min(mainStatStatus.percentage, 100)}%`,
                                backgroundColor: mainStatStatus.color
                            }}
                        />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>{value.toLocaleString()}</span>
                        {mainStatStatus.nextTarget && (
                            <span>
                                {t('theorycraft.mainStat.next', { value: mainStatStatus.nextTarget.toLocaleString() })}
                                <span className="text-gray-600 ml-1">
                                    (+{mainStatStatus.remaining.toLocaleString()})
                                </span>
                            </span>
                        )}
                        {!mainStatStatus.nextTarget && (
                            <span style={{ color: mainStatStatus.color }}>{t('theorycraft.mainStat.max')}</span>
                        )}
                    </div>
                </div>
            )}
            {/* Note d'information */}
            <div className="mt-2 text-xs text-gray-500 italic">
                {mainStatInfo.note}
            </div>
            {/* Benchmarks rapides */}
            <div className="mt-2 flex flex-wrap gap-1">
                {Object.entries(mainStatInfo.benchmarks).map(([level, benchValue]) => {
                    const levelLabels = { casual: '🌱', intermediate: '📈', advanced: '⭐', whale: '🐋' };
                    const isReached = value >= benchValue;
                    return (
                        <span
                            key={level}
                            className={`text-xs px-1.5 py-0.5 rounded ${isReached ? 'bg-green-900/50 text-green-400' : 'bg-gray-800 text-gray-500'}`}
                            title={`${t(`optimization.benchmarks.${level}`)}: ${benchValue.toLocaleString()}`}
                        >
                            {levelLabels[level]} {(benchValue / 1000).toFixed(0)}K
                        </span>
                    );
                })}
            </div>
        </div>
    );
};

// Composant: Bouton de preset pour appliquer des stats rapidement
const PresetButton = ({ label, description, color, benchmarks, mainStatValue, mainStatLabel, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="group relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
                backgroundColor: `${color}10`,
                borderColor: `${color}40`,
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = color;
                e.currentTarget.style.backgroundColor = `${color}20`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${color}40`;
                e.currentTarget.style.backgroundColor = `${color}10`;
            }}
        >
            {/* Header */}
            <div className="text-sm font-bold mb-1" style={{ color }}>
                {label}
            </div>
            <div className="text-xs text-gray-400 mb-2">{description}</div>

            {/* Stats preview */}
            <div className="text-xs space-y-0.5 text-left">
                {mainStatValue && (
                    <div className="font-semibold" style={{ color }}>
                        {mainStatLabel}: {(mainStatValue / 1000).toFixed(0)}K
                    </div>
                )}
                <div className="text-gray-400">
                    TC: {benchmarks.critRate}% • DCC: {benchmarks.critDMG}%
                </div>
                <div className="text-gray-400">
                    Def Pen: {benchmarks.defPen}%
                </div>
                {benchmarks.dps && (
                    <div className="text-gray-500 mt-1 pt-1 border-t border-gray-700/50">
                        DPS: {benchmarks.dps}
                    </div>
                )}
            </div>

            {/* Hover effect indicator */}
            <div
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{
                    background: `linear-gradient(135deg, ${color}05 0%, ${color}15 100%)`
                }}
            />
        </button>
    );
};

// Composant: Affichage d'une stat avec breakdown détaillé
const StatDisplay = ({ icon, label, value, unit, color, breakdown }) => {
    // Pour DCC, ajouter le 50% de base au total affiché
    const displayValue = label === "Dégâts Critiques" ? value + 50 : value;

    return (
        <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
                <div className={color}>{icon}</div>
                <div>
                    <div className="text-sm text-gray-400">{label}</div>
                    <div className={`text-2xl font-bold ${color}`}>
                        {displayValue.toFixed(1)}{unit}
                    </div>
                </div>
            </div>

            {/* Breakdown détaillé */}
            {breakdown && (
                <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <div className="text-xs space-y-1">
                        {/* Base Stats (50% pour DCC seulement) - Affiché en gris */}
                        {label === "Dégâts Critiques" && (
                            <div className="flex justify-between text-gray-500">
                                <span>Base Stats:</span>
                                <span className="font-semibold">50.0%</span>
                            </div>
                        )}
                        {breakdown.weapon > 0 && (
                            <div className="flex justify-between text-orange-300">
                                <span>Weapon:</span>
                                <span className="font-semibold">+{breakdown.weapon.toFixed(1)}%</span>
                            </div>
                        )}
                        {breakdown.setBuffs > 0 && (
                            <div className="flex justify-between text-indigo-300">
                                <span>Set:</span>
                                <span className="font-semibold">+{breakdown.setBuffs.toFixed(1)}%</span>
                            </div>
                        )}
                        {breakdown.teamBuffs > 0 && (
                            <div className="flex justify-between text-green-300">
                                <span>Team Buffs:</span>
                                <span className="font-semibold">+{breakdown.teamBuffs.toFixed(1)}%</span>
                            </div>
                        )}
                        {/* Personal Buffs et RAID Dark ne sont PAS affichés dans le total global
                            car ils ne s'appliquent pas à tous les membres (seulement Lee Bora / Dark hunters) */}
                        {breakdown.rawStats > 0 && (
                            <div className="flex justify-between text-blue-300">
                                <span>Valeurs Brutes:</span>
                                <span className="font-semibold">+{breakdown.rawStats.toFixed(1)}%</span>
                            </div>
                        )}

                        {/* Formule visuelle */}
                        <div className="mt-2 pt-2 border-t border-gray-700/50">
                            <div className="text-center font-mono text-xs">
                                {/* Base Stats pour DCC */}
                                {label === "Dégâts Critiques" && (
                                    <span className="text-gray-500">50.0</span>
                                )}
                                {breakdown.weapon > 0 && (
                                    <>
                                        {label === "Dégâts Critiques" && <span className="text-gray-500"> + </span>}
                                        <span className="text-orange-300">{breakdown.weapon.toFixed(1)}</span>
                                    </>
                                )}
                                {breakdown.setBuffs > 0 && (
                                    <>
                                        {(breakdown.weapon > 0 || label === "Dégâts Critiques") && <span className="text-gray-500"> + </span>}
                                        <span className="text-indigo-300">{breakdown.setBuffs.toFixed(1)}</span>
                                    </>
                                )}
                                {breakdown.teamBuffs > 0 && (
                                    <>
                                        <span className="text-gray-500"> + </span>
                                        <span className="text-green-300">{breakdown.teamBuffs.toFixed(1)}</span>
                                    </>
                                )}
                                {/* Personal Buffs et RAID Dark omis car non inclus dans le total */}
                                {breakdown.rawStats > 0 && (
                                    <>
                                        <span className="text-gray-500"> + </span>
                                        <span className="text-blue-300">{breakdown.rawStats.toFixed(1)}</span>
                                    </>
                                )}
                                <span className="text-gray-500"> = </span>
                                <span className={`font-bold ${color}`}>
                                    {label === "Dégâts Critiques"
                                        ? (50 + breakdown.total).toFixed(1)
                                        : breakdown.total.toFixed(1)
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Composant: Affichage des stats individuelles par personnage
const IndividualStatsDisplay = ({ sungEnabled, sungData, team1, team2, enemyLevel }) => {
    // Calculer les stats avec useMemo pour forcer le re-calcul quand les états changent
    const membersWithStats = useMemo(() => {
        // Récupérer tous les membres actifs
        const allMembers = [
            ...(sungEnabled && sungData ? [{ ...sungData, teamId: 0, slotId: 0 }] : []),
            ...team1.filter(m => m !== null).map((m, idx) => ({ ...m, teamId: 1, slotId: idx })),
            ...team2.filter(m => m !== null).map((m, idx) => ({ ...m, teamId: 2, slotId: idx })),
        ];

        if (allMembers.length === 0) {
            return [];
        }

        // Compter le nombre de hunters Dark dans le RAID (pour les buffs conditionnels)
        const darkHunterCount = allMembers.filter(member => {
            const charData = characters[member.id];
            return charData && charData.element === 'Dark';
        }).length;

        // Vérifier si Lee Bora A2+ est présente dans le RAID
        const leeBoraA2InRaid = allMembers.find(m => m.id === 'lee' && m.advancement >= 2);

        // Récupérer les niveaux d'arme pour les buffs RAID
        // - Lee Bora : TC + DCC pour tout le RAID
        const leeBoraInRaid = allMembers.find(m => m.id === 'lee');
        const leeBoraWeaponLevel = leeBoraInRaid ? (leeBoraInRaid.weaponAdvancement || 0) : 0;
        const leeBoraWeaponBuffs = leeBoraWeaponLevel > 0 ? getCharacterBuffs('weapon', leeBoraWeaponLevel) : { critRate: 0, critDMG: 0, defPen: 0 };

        // Break state pour Son Kihoon (A5)
        const sonBreakStateActive = false; // TODO: Ajouter checkbox pour break state

        // Calculer les stats pour chaque personnage individuellement
        return allMembers.map((member) => {
        const charData = characters[member.id];
        const memberElement = charData?.element || 'Unknown';

        // Initialiser les stats
        let totalCritRate = 0;
        let totalCritDMG = 0;
        let totalDefPen = 0;

        // Breakdown détaillé (pour affichage au hover)
        const breakdown = {
            critRate: [],
            critDMG: [],
            defPen: []
        };

        // 1. WEAPON BUFFS (RAID-wide)
        // Lee Bora weapon: TC + DCC pour tout le RAID
        if (leeBoraWeaponBuffs.critRate > 0) {
            totalCritRate += leeBoraWeaponBuffs.critRate;
            breakdown.critRate.push({ source: `⚔️ Arme Lee Bora (A${leeBoraWeaponLevel})`, value: leeBoraWeaponBuffs.critRate });
        }
        if (leeBoraWeaponBuffs.critDMG > 0) {
            totalCritDMG += leeBoraWeaponBuffs.critDMG;
            breakdown.critDMG.push({ source: `⚔️ Arme Lee Bora (A${leeBoraWeaponLevel})`, value: leeBoraWeaponBuffs.critDMG });
        }
        if (leeBoraWeaponBuffs.defPen > 0) {
            totalDefPen += leeBoraWeaponBuffs.defPen;
            breakdown.defPen.push({ source: `⚔️ Arme Lee Bora (A${leeBoraWeaponLevel})`, value: leeBoraWeaponBuffs.defPen });
        }

        // Son Kihoon: Team buff (DCC pour sa team uniquement)
        // Trouver si Son est dans une team et appliquer son buff uniquement à sa team
        const sonInTeam1 = team1.find(m => m && m.id === 'son');
        const sonInTeam2 = team2.find(m => m && m.id === 'son');

        // Si Son est présent et a A5+, appliquer son buff de team
        if (sonInTeam1 && sonInTeam1.advancement >= 5) {
            // Son est dans Team1 - buff pour tous les membres de Team1 + Sung (teamId 0 ou 1)
            if (member.teamId === 0 || member.teamId === 1) {
                const sonBuffs = getCharacterBuffs('son', sonInTeam1.advancement);
                if (sonBuffs.teamBuff) {
                    const dccValue = sonBreakStateActive && sonBuffs.breakState
                        ? sonBuffs.breakState.critDMG
                        : sonBuffs.teamBuff.critDMG;

                    if (dccValue > 0) {
                        totalCritDMG += dccValue;
                        const breakText = sonBreakStateActive ? ' (Break State)' : '';
                        breakdown.critDMG.push({ source: `👊 Son Kihoon Team Buff (A5${breakText})`, value: dccValue });
                    }
                }
            }
        } else if (sonInTeam2 && sonInTeam2.advancement >= 5) {
            // Son est dans Team2 - buff uniquement pour les membres de Team2 (teamId 2)
            if (member.teamId === 2) {
                const sonBuffs = getCharacterBuffs('son', sonInTeam2.advancement);
                if (sonBuffs.teamBuff) {
                    const dccValue = sonBreakStateActive && sonBuffs.breakState
                        ? sonBuffs.breakState.critDMG
                        : sonBuffs.teamBuff.critDMG;

                    if (dccValue > 0) {
                        totalCritDMG += dccValue;
                        const breakText = sonBreakStateActive ? ' (Break State)' : '';
                        breakdown.critDMG.push({ source: `👊 Son Kihoon Team Buff (A5${breakText})`, value: dccValue });
                    }
                }
            }
        }

        // Isla: Team buff (TC + DCC pour sa team uniquement)
        // Trouver si Isla est dans une team et appliquer son buff uniquement à sa team
        const islaInTeam1 = team1.find(m => m && m.id === 'isla');
        const islaInTeam2 = team2.find(m => m && m.id === 'isla');

        // Si Isla est présente et a A0+, appliquer son buff de team
        if (islaInTeam1 && islaInTeam1.advancement >= 0) {
            // Isla est dans Team1 - buff pour tous les membres de Team1 + Sung (teamId 0 ou 1)
            if (member.teamId === 0 || member.teamId === 1) {
                const islaBuffs = getCharacterBuffs('isla', islaInTeam1.advancement);
                if (islaBuffs.teamBuff) {
                    if (islaBuffs.teamBuff.critRate > 0) {
                        totalCritRate += islaBuffs.teamBuff.critRate;
                        breakdown.critRate.push({ source: `💎 Isla Team Buff (A${islaInTeam1.advancement})`, value: islaBuffs.teamBuff.critRate });
                    }
                    if (islaBuffs.teamBuff.critDMG > 0) {
                        totalCritDMG += islaBuffs.teamBuff.critDMG;
                        breakdown.critDMG.push({ source: `💎 Isla Team Buff (A${islaInTeam1.advancement})`, value: islaBuffs.teamBuff.critDMG });
                    }
                }
            }
        } else if (islaInTeam2 && islaInTeam2.advancement >= 0) {
            // Isla est dans Team2 - buff uniquement pour les membres de Team2 (teamId 2)
            if (member.teamId === 2) {
                const islaBuffs = getCharacterBuffs('isla', islaInTeam2.advancement);
                if (islaBuffs.teamBuff) {
                    if (islaBuffs.teamBuff.critRate > 0) {
                        totalCritRate += islaBuffs.teamBuff.critRate;
                        breakdown.critRate.push({ source: `💎 Isla Team Buff (A${islaInTeam2.advancement})`, value: islaBuffs.teamBuff.critRate });
                    }
                    if (islaBuffs.teamBuff.critDMG > 0) {
                        totalCritDMG += islaBuffs.teamBuff.critDMG;
                        breakdown.critDMG.push({ source: `💎 Isla Team Buff (A${islaInTeam2.advancement})`, value: islaBuffs.teamBuff.critDMG });
                    }
                }
            }
        }

        // 2. BUFFS DE SET - Système hybride:
        // - Sets TEAM (Burning Greed, etc.) : buff tout le groupe
        // - Sets PERSONNELS (Armed, etc.) : buff uniquement celui qui le porte
        const isInGroup1 = member.teamId === 0 || member.teamId === 1;
        const isInGroup2 = member.teamId === 2;

        // Liste des sets qui sont PERSONNELS (ne buff que celui qui les porte)
        const personalSets = ['armed'];

        if (isInGroup1) {
            // Appliquer les buffs de set de Sung + Team1
            const group1Members = [
                ...(sungEnabled && sungData ? [sungData] : []),
                ...team1.filter(m => m !== null)
            ];

            group1Members.forEach(groupMember => {
                const setBonus = getCombinedSetBonuses(groupMember);
                const setDisplayName = getSetDisplayText(groupMember);
                const memberName = groupMember.name || groupMember.id;

                // Vérifier si c'est un set personnel (Armed)
                const isPersonalSet = personalSets.includes(groupMember.leftSet) || personalSets.includes(groupMember.rightSet);

                if (isPersonalSet) {
                    // Set personnel : appliquer UNIQUEMENT au membre qui le porte
                    if (groupMember.id === member.id) {
                        if (setBonus.critRate > 0) {
                            totalCritRate += setBonus.critRate;
                            breakdown.critRate.push({ source: `✨ Set Personnel (${setDisplayName})`, value: setBonus.critRate });
                        }
                        if (setBonus.critDMG > 0) {
                            totalCritDMG += setBonus.critDMG;
                            breakdown.critDMG.push({ source: `✨ Set Personnel (${setDisplayName})`, value: setBonus.critDMG });
                        }
                        if (setBonus.defPen > 0) {
                            totalDefPen += setBonus.defPen;
                            breakdown.defPen.push({ source: `✨ Set Personnel (${setDisplayName})`, value: setBonus.defPen });
                        }
                    }
                } else {
                    // Set de team (Burning Greed, etc.) : appliquer à TOUS les membres du groupe
                    if (setBonus.critRate > 0) {
                        totalCritRate += setBonus.critRate;
                        breakdown.critRate.push({ source: `✨ Set ${memberName} (${setDisplayName})`, value: setBonus.critRate });
                    }
                    if (setBonus.critDMG > 0) {
                        totalCritDMG += setBonus.critDMG;
                        breakdown.critDMG.push({ source: `✨ Set ${memberName} (${setDisplayName})`, value: setBonus.critDMG });
                    }
                    if (setBonus.defPen > 0) {
                        totalDefPen += setBonus.defPen;
                        breakdown.defPen.push({ source: `✨ Set ${memberName} (${setDisplayName})`, value: setBonus.defPen });
                    }
                }
            });
        } else if (isInGroup2) {
            // Appliquer les buffs de set de Team2
            const group2Members = team2.filter(m => m !== null);

            group2Members.forEach(groupMember => {
                const setBonus = getCombinedSetBonuses(groupMember);
                const setDisplayName = getSetDisplayText(groupMember);
                const memberName = groupMember.name || groupMember.id;

                // Vérifier si c'est un set personnel (Armed)
                const isPersonalSet = personalSets.includes(groupMember.leftSet) || personalSets.includes(groupMember.rightSet);

                if (isPersonalSet) {
                    // Set personnel : appliquer UNIQUEMENT au membre qui le porte
                    if (groupMember.id === member.id) {
                        if (setBonus.critRate > 0) {
                            totalCritRate += setBonus.critRate;
                            breakdown.critRate.push({ source: `✨ Set Personnel (${setDisplayName})`, value: setBonus.critRate });
                        }
                        if (setBonus.critDMG > 0) {
                            totalCritDMG += setBonus.critDMG;
                            breakdown.critDMG.push({ source: `✨ Set Personnel (${setDisplayName})`, value: setBonus.critDMG });
                        }
                        if (setBonus.defPen > 0) {
                            totalDefPen += setBonus.defPen;
                            breakdown.defPen.push({ source: `✨ Set Personnel (${setDisplayName})`, value: setBonus.defPen });
                        }
                    }
                } else {
                    // Set de team (Burning Greed, etc.) : appliquer à TOUS les membres du groupe
                    if (setBonus.critRate > 0) {
                        totalCritRate += setBonus.critRate;
                        breakdown.critRate.push({ source: `✨ Set ${memberName} (${setDisplayName})`, value: setBonus.critRate });
                    }
                    if (setBonus.critDMG > 0) {
                        totalCritDMG += setBonus.critDMG;
                        breakdown.critDMG.push({ source: `✨ Set ${memberName} (${setDisplayName})`, value: setBonus.critDMG });
                    }
                    if (setBonus.defPen > 0) {
                        totalDefPen += setBonus.defPen;
                        breakdown.defPen.push({ source: `✨ Set ${memberName} (${setDisplayName})`, value: setBonus.defPen });
                    }
                }
            });
        }

        // 3. CORE ATTACK TC (+10% TC si activé)
        if (member.coreAttackTC) {
            totalCritRate += 10;
            breakdown.critRate.push({ source: '🎯 Core Attack TC', value: 10 });
        }

        // 4. TEAM BUFFS (de tous les autres personnages du RAID - à implémenter plus tard)
        // Pour l'instant on n'a que des buffs RAID, pas de buffs Team-only

        // 5. BUFFS PERSONNELS (uniquement pour le personnage lui-même)
        // Récupérer les buffs du niveau actuel du personnage
        const memberBuffs = getCharacterBuffs(member.id, member.advancement);

        // DEBUG: Log pour Silver Mane Baek Yoonho
        if (member.id === 'silverbaek') {
            console.log('🐺 [DEBUG] Silver Mane Baek Yoonho:', {
                id: member.id,
                advancement: member.advancement,
                memberBuffs: memberBuffs,
                hasPersonalBuffs: !!memberBuffs.personalBuffs,
                personalBuffs: memberBuffs.personalBuffs
            });
        }

        if (memberBuffs.personalBuffs) {
            const characterName = member.id === 'lee' ? 'Lee Bora' :
                                 member.id === 'ilhwan' ? 'Ilhwan' :
                                 member.id === 'silverbaek' ? 'Silver Mane Baek Yoonho' :
                                 member.id === 'sian' ? 'Sian Halat' :
                                 member.id === 'son' ? 'Son Kihoon' :
                                 'Personnage';

            if (memberBuffs.personalBuffs.critRate > 0) {
                totalCritRate += memberBuffs.personalBuffs.critRate;
                breakdown.critRate.push({ source: `👤 Buffs Personnels (${characterName} A${member.advancement})`, value: memberBuffs.personalBuffs.critRate });
            }
            if (memberBuffs.personalBuffs.critDMG > 0) {
                totalCritDMG += memberBuffs.personalBuffs.critDMG;
                breakdown.critDMG.push({ source: `👤 Buffs Personnels (${characterName} A${member.advancement})`, value: memberBuffs.personalBuffs.critDMG });
            }
            if (memberBuffs.personalBuffs.defPen > 0) {
                totalDefPen += memberBuffs.personalBuffs.defPen;
                breakdown.defPen.push({ source: `👤 Buffs Personnels (${characterName} A${member.advancement})`, value: memberBuffs.personalBuffs.defPen });
            }
        } else if (member.id === 'silverbaek') {
            console.log('❌ [DEBUG] Pas de personalBuffs trouvés pour Silver Mane Baek Yoonho');
        }

        // Ilhwan : buffs personnels de son arme (uniquement pour lui-même)
        if (member.id === 'ilhwan' && member.weaponAdvancement > 0) {
            const ilhwanWeaponBuffs = getCharacterBuffs('weapon_ilhwan', member.weaponAdvancement);
            if (ilhwanWeaponBuffs.critRate > 0) {
                totalCritRate += ilhwanWeaponBuffs.critRate;
                breakdown.critRate.push({ source: `👤 Arme Personnelle (Ilhwan A${member.weaponAdvancement})`, value: ilhwanWeaponBuffs.critRate });
            }
            if (ilhwanWeaponBuffs.critDMG > 0) {
                totalCritDMG += ilhwanWeaponBuffs.critDMG;
                breakdown.critDMG.push({ source: `👤 Arme Personnelle (Ilhwan A${member.weaponAdvancement})`, value: ilhwanWeaponBuffs.critDMG });
            }
            if (ilhwanWeaponBuffs.defPen > 0) {
                totalDefPen += ilhwanWeaponBuffs.defPen;
                breakdown.defPen.push({ source: `👤 Arme Personnelle (Ilhwan A${member.weaponAdvancement})`, value: ilhwanWeaponBuffs.defPen });
            }
        }

        // Sian Halat : buffs personnels de son arme (uniquement pour lui-même)
        if (member.id === 'sian' && member.weaponAdvancement > 0) {
            const sianWeaponBuffs = getCharacterBuffs('weapon_sian', member.weaponAdvancement);
            if (sianWeaponBuffs.personalBuffs && sianWeaponBuffs.personalBuffs.defPen > 0) {
                totalDefPen += sianWeaponBuffs.personalBuffs.defPen;
                breakdown.defPen.push({ source: `⚔️ Arme Sian Halat (A${member.weaponAdvancement})`, value: sianWeaponBuffs.personalBuffs.defPen });
            }
        }

        // 6. BUFFS CONDITIONNELS RAID (selon l'élément)
        // Lee Bora A2+ : +2% DCC par Dark hunter, appliqué à TOUS les Dark hunters
        if (leeBoraA2InRaid && memberElement === 'Dark') {
            const leeA2 = getCharacterBuffs('lee', 2);
            if (leeA2.conditionalBuff && leeA2.conditionalBuff.targetElement === 'Dark') {
                const raidDarkBonus = darkHunterCount * leeA2.conditionalBuff.critDMGPerAlly;
                totalCritDMG += raidDarkBonus;
                breakdown.critDMG.push({
                    source: `🌑 RAID Dark - Lee Bora (${darkHunterCount} × ${leeA2.conditionalBuff.critDMGPerAlly}%)`,
                    value: raidDarkBonus
                });
            }
        }

        // Sian A4+ : +3% Def Pen par Dark hunter, appliqué à TOUS les Dark hunters
        const sianA4InRaid = allMembers.find(m => m.id === 'sian' && m.advancement >= 4);
        if (sianA4InRaid && memberElement === 'Dark') {
            const sianA4 = getCharacterBuffs('sian', member.advancement >= 4 ? member.advancement : 4);
            if (sianA4.conditionalBuff && sianA4.conditionalBuff.targetElement === 'Dark') {
                const raidDarkDefPenBonus = darkHunterCount * sianA4.conditionalBuff.defPenPerAlly;
                totalDefPen += raidDarkDefPenBonus;
                breakdown.defPen.push({
                    source: `🗡️ RAID Dark - Sian (${darkHunterCount} × ${sianA4.conditionalBuff.defPenPerAlly}%)`,
                    value: raidDarkDefPenBonus
                });
            }
        }

        // Sian A5 : +10% Def Pen pour TOUTE la team Dark (pas personnel, pas Sung !)
        const sianA5InRaid = allMembers.find(m => m.id === 'sian' && m.advancement >= 5);
        if (sianA5InRaid && memberElement === 'Dark') {
            const sianA5 = getCharacterBuffs('sian', 5);
            if (sianA5.teamBuffsDark && sianA5.teamBuffsDark.defPen > 0) {
                totalDefPen += sianA5.teamBuffsDark.defPen;
                breakdown.defPen.push({
                    source: `🗡️ Sian A5 - Buff Team Dark`,
                    value: sianA5.teamBuffsDark.defPen
                });
            }
        }

        // 7. VALEURS BRUTES (converties en % selon l'ennemi)
        if (member.rawStats.critRate > 0) {
            const tcPercent = parseFloat(statConversionsWithEnemy.tc.toPercent(member.rawStats.critRate, enemyLevel));
            totalCritRate += tcPercent;
            breakdown.critRate.push({ source: `🔢 Valeurs Brutes (${member.rawStats.critRate.toLocaleString()} TC)`, value: tcPercent });
        }
        if (member.rawStats.critDMG > 0) {
            const dccPercent = parseFloat(statConversionsWithEnemy.dcc.toPercent(member.rawStats.critDMG, enemyLevel));
            const dccBonus = dccPercent - 50; // Soustraire le 50% de base
            totalCritDMG += dccBonus;
            breakdown.critDMG.push({ source: `🔢 Valeurs Brutes (${member.rawStats.critDMG.toLocaleString()} DCC)`, value: dccBonus });
        }
        if (member.rawStats.defPen > 0) {
            const defPenPercent = parseFloat(statConversionsWithEnemy.defPen.toPercent(member.rawStats.defPen, enemyLevel));
            totalDefPen += defPenPercent;
            breakdown.defPen.push({ source: `🔢 Valeurs Brutes (${member.rawStats.defPen.toLocaleString()} Def Pen)`, value: defPenPercent });
        }

        return {
            ...member,
            element: memberElement,
            finalStats: {
                critRate: totalCritRate,
                critDMG: totalCritDMG + 50, // Ajouter le 50% de base pour l'affichage final
                defPen: totalDefPen
            },
            breakdown
        };
        });
    }, [sungEnabled, sungData, team1, team2, enemyLevel]);

    // Si aucun personnage, afficher un message
    if (membersWithStats.length === 0) {
        return (
            <div className="text-center text-gray-500 py-8">
                Aucun personnage dans la composition. Ajoutez des personnages pour voir leurs stats.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {membersWithStats.map((member, idx) => (
                <IndividualCharacterStatCard key={`${member.teamId}-${member.slotId}-${idx}`} member={member} />
            ))}
        </div>
    );
};

// Composant: Carte de stats individuelles d'un personnage
const IndividualCharacterStatCard = ({ member }) => {
    const hasOptimizationData = CHARACTER_OPTIMIZATION[member.id];
    const benchmark = hasOptimizationData ? getCurrentBenchmark(member.id, member.finalStats) : null;
    const overall = hasOptimizationData ? getOverallOptimization(member.id, member.finalStats) : null;

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-700/50">
            {/* Header avec image et nom */}
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-700/50">
                {member.image ? (
                    <img src={member.image} alt={member.name} className="w-12 h-12 rounded-lg object-cover border-2 border-purple-500" />
                ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center text-2xl">👤</div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-white truncate">{member.name}</span>
                        {hasOptimizationData && <OptimizationBadge characterId={member.id} stats={member.finalStats} />}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                        <span>{getElementEmoji(member.element)}</span>
                        <span>{member.element}</span>
                        <span className="mx-1">•</span>
                        <span className="text-purple-400">A{member.advancement}</span>
                        {benchmark && (
                            <>
                                <span className="mx-1">•</span>
                                <span style={{ color: benchmark.color }}>{benchmark.label}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats avec breakdown au hover + indicateurs d'optimisation */}
            <div className="space-y-2">
                <StatWithBreakdown
                    label="TC"
                    value={member.finalStats.critRate}
                    breakdown={member.breakdown.critRate}
                    color="text-yellow-400"
                    icon="🎯"
                    characterId={member.id}
                    statName="critRate"
                />
                <StatWithBreakdown
                    label="DCC"
                    value={member.finalStats.critDMG}
                    breakdown={member.breakdown.critDMG}
                    color="text-red-400"
                    icon="⚔️"
                    hasBaseValue={true}
                    characterId={member.id}
                    statName="critDMG"
                />
                <StatWithBreakdown
                    label="Def Pen"
                    value={member.finalStats.defPen}
                    breakdown={member.breakdown.defPen}
                    color="text-blue-400"
                    icon="🛡️"
                    characterId={member.id}
                    statName="defPen"
                />
            </div>

            {/* Carte d'optimisation (si données disponibles) */}
            {hasOptimizationData && overall && (
                <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <OptimizationCard characterId={member.id} stats={member.finalStats} compact={false} />
                </div>
            )}
        </div>
    );
};

// Composant: Stat avec breakdown détaillé au hover
const StatWithBreakdown = ({ label, value, breakdown, color, icon, hasBaseValue = false, characterId, statName }) => {
    const hasOptimData = characterId && statName && CHARACTER_OPTIMIZATION[characterId];
    const optimStatus = hasOptimData ? getOptimizationStatus(characterId, statName, value) : null;
    const sweetSpot = hasOptimData ? CHARACTER_OPTIMIZATION[characterId]?.sweetSpots?.[statName] : null;

    return (
        <div className="group relative">
            <div className="flex items-center justify-between text-sm py-1 px-2 rounded bg-gray-900/30 hover:bg-gray-900/50 transition-colors cursor-help">
                <span className="text-gray-400 flex items-center gap-1">
                    <span className="text-xs">{icon}</span>
                    <span>{label}:</span>
                </span>
                <div className="flex items-center gap-2">
                    <span className={`font-bold ${color}`}>
                        {value.toFixed(1)}%
                    </span>
                    {/* Indicateur d'optimisation inline */}
                    {optimStatus && (
                        <span
                            className="inline-block w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: optimStatus.color }}
                            title={`${optimStatus.message} - Idéal: ${sweetSpot?.ideal}%`}
                        />
                    )}
                </div>
            </div>

            {/* Tooltip au hover */}
            {breakdown && breakdown.length > 0 && (
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 pointer-events-none w-72">
                    <div className="bg-gray-900/98 text-white p-3 rounded-lg border border-purple-500/50 shadow-2xl">
                        <div className="text-xs font-bold mb-2 text-purple-300 border-b border-purple-500/30 pb-1 flex justify-between items-center">
                            <span>📊 Détail des buffs</span>
                            {sweetSpot && (
                                <span className="text-gray-400 font-normal">
                                    Idéal: <span style={{ color: sweetSpot.color }}>{sweetSpot.ideal}%</span>
                                </span>
                            )}
                        </div>
                        <div className="space-y-1 text-xs">
                            {/* Base value pour DCC */}
                            {hasBaseValue && (
                                <div className="flex justify-between items-center text-gray-400">
                                    <span>⚡ Base Stats</span>
                                    <span className="font-semibold">+50.0%</span>
                                </div>
                            )}
                            {/* Liste des buffs */}
                            {breakdown.map((buff, idx) => (
                                <div key={idx} className="flex justify-between items-center">
                                    <span className="text-gray-300">{buff.source}</span>
                                    <span className={`font-semibold ${color}`}>+{buff.value.toFixed(1)}%</span>
                                </div>
                            ))}
                            {/* Total */}
                            <div className="flex justify-between items-center pt-2 mt-2 border-t border-purple-500/30 font-bold">
                                <span className="text-purple-300">TOTAL</span>
                                <span className={color}>{value.toFixed(1)}%</span>
                            </div>
                            {/* Statut d'optimisation */}
                            {optimStatus && sweetSpot && (
                                <div className="flex justify-between items-center pt-2 mt-1 border-t border-gray-700/50">
                                    <span className="text-gray-400">Optimisation:</span>
                                    <span style={{ color: optimStatus.color }} className="font-semibold">
                                        {optimStatus.message}
                                        {value < sweetSpot.ideal && (
                                            <span className="text-gray-500 ml-1">
                                                (+{(sweetSpot.ideal - value).toFixed(1)}% requis)
                                            </span>
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                        {/* Triangle pointer */}
                        <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-purple-500/50"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Composant: Modal de sélection de personnage
const CharacterSelectionModal = ({ characters, elementFilter, onElementChange, onSelect, onClose, elements }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col border border-purple-500/50"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-4">Sélectionner un personnage</h2>

                {/* Filtres d'élément */}
                <div className="flex gap-2 mb-4 flex-wrap">
                    {elements.map(elem => (
                        <button
                            key={elem}
                            onClick={() => onElementChange(elem)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                elementFilter === elem
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            {elem === 'all' ? '🌟 Tous' : `${getElementEmoji(elem)} ${elem}`}
                        </button>
                    ))}
                </div>

                {/* Liste des personnages */}
                <div className="flex-1 overflow-y-auto grid grid-cols-4 md:grid-cols-6 gap-4">
                    {characters.map(char => (
                        <button
                            key={char.id}
                            onClick={() => onSelect(char)}
                            className="bg-gray-800 hover:bg-gray-700 rounded-lg p-2 transition-colors group"
                        >
                            {char.image ? (
                                <img src={char.image} alt={char.name} className="w-full aspect-square object-cover rounded mb-2" />
                            ) : (
                                <div className="w-full aspect-square bg-gray-700 rounded mb-2 flex items-center justify-center text-4xl">
                                    👤
                                </div>
                            )}
                            <div className="text-xs text-center text-gray-300 group-hover:text-white truncate">
                                {char.name}
                            </div>
                        </button>
                    ))}
                </div>

                <button
                    onClick={onClose}
                    className="mt-4 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
                >
                    Annuler
                </button>
            </motion.div>
        </motion.div>
    );
};

// Helper: Emoji d'élément
const getElementEmoji = (element) => {
    const emojis = {
        Fire: '🔥',
        Water: '💧',
        Wind: '🌪️',
        Light: '✨',
        Dark: '🌑',
    };
    return emojis[element] || '⭐';
};

export default Theorycraft;
