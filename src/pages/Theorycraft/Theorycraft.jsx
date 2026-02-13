import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingUp, Target, Shield, Swords, X, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { characters } from '../../data/characters';
import { ARTIFACT_SETS, getSetBonuses } from '../../data/setData';
import { CHARACTER_BUFFS, getCharacterBuffs, getCharacterBaseStats } from '../../data/characterBuffs';
import { CHARACTER_ADVANCED_BUFFS, getCumulativeBuffs } from '../../data/characterAdvancedBuffs';
import { statConversions, statConversionsWithEnemy, newDefPenFormula } from '../../utils/statConversions';
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
    },
    antQueen: {
        id: 'antQueen',
        name: 'Ant Queen',
        level: 80,
        icon: '🐜'
    }
};

const Theorycraft = () => {
    // URL params & navigation
    const { boss: urlBoss, element: urlElement } = useParams();
    const navigate = useNavigate();

    // États principaux
    const [sungEnabled, setSungEnabled] = useState(false);
    const [sungData, setSungData] = useState(null);
    const [team1, setTeam1] = useState(Array(3).fill(null));
    const [team2, setTeam2] = useState(Array(3).fill(null));
    const [selectedSlot, setSelectedSlot] = useState(null); // { team: 0|1|2, slot: 0-2 }
    const [elementFilter, setElementFilter] = useState(() => {
        if (urlElement) {
            const validElements = ['Water', 'Dark', 'Fire', 'Light', 'all'];
            if (validElements.includes(urlElement)) return urlElement;
        }
        return 'all';
    });
    const [selectedCharForDetails, setSelectedCharForDetails] = useState(null); // Perso sélectionné pour voir détails

    // Enemy selection (pour les calculs de stats réels)
    const [selectedEnemy, setSelectedEnemy] = useState(() => {
        if (urlBoss) {
            const bossMap = { 'AntQueen': 'antQueen', 'Fachtna': 'fachtna', 'Statue': 'statue' };
            const enemyId = bossMap[urlBoss];
            if (enemyId && ENEMIES[enemyId]) return enemyId;
        }
        return 'fachtna';
    });
    const [enemyLevel, setEnemyLevel] = useState(() => {
        if (urlBoss) {
            const bossMap = { 'AntQueen': 'antQueen', 'Fachtna': 'fachtna', 'Statue': 'statue' };
            const enemyId = bossMap[urlBoss];
            if (enemyId && ENEMIES[enemyId]) return ENEMIES[enemyId].level;
        }
        return 80;
    });

    // Settings popup
    const [showSettings, setShowSettings] = useState(false);
    const [useNewDefPenFormula, setUseNewDefPenFormula] = useState(true); // Nouvelle formule par défaut

    // Sung Blessing (+24.5% Crit Rate)
    const [sungBlessing, setSungBlessing] = useState(false);

    // 🔍 SEO - Document title & meta tags
    useEffect(() => {
        document.title = 'Theorycraft - Solo Leveling: Arise Build Calculator | BuilderBeru';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Theorycraft calculator for Solo Leveling: Arise. Optimize raid team synergies, compare character builds, and calculate damage with advanced buff tracking.');
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', 'Theorycraft - BuilderBeru');
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', 'Advanced theorycraft calculator for Solo Leveling: Arise raid optimization.');
        return () => { document.title = 'BuilderBeru - Solo Leveling: Arise Build Calculator'; };
    }, []);

    // 🔗 URL Sync - Mettre à jour l'URL quand boss/element changent
    useEffect(() => {
        const bossSlug = { 'antQueen': 'AntQueen', 'fachtna': 'Fachtna', 'statue': 'Statue' };
        const slug = bossSlug[selectedEnemy] || 'Fachtna';
        const elemSlug = elementFilter !== 'all' ? `/${elementFilter}` : '';
        navigate(`/theorycraft/${slug}${elemSlug}`, { replace: true });
    }, [selectedEnemy, elementFilter, navigate]);

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
                damageIncrease: 0,
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
                    damageIncrease: 0,
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
                rawStats: { critRate: 0, critDMG: 0, defPen: 0, damageIncrease: 0 }
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
                rawStats: { critRate: 0, critDMG: 0, defPen: 0, damageIncrease: 0 }
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
                rawStats: { critRate: 0, critDMG: 0, defPen: 0, damageIncrease: 0 }
            } : null
        ];
        setTeam1(newTeam1);

        // Team 2: Lim (Armed+Precision), Ilhwan (Armed+Expert), Lee Bora (Angel+Wish)
        const limChar = availableCharacters.find(c => c.id === 'lim');
        const ilhwanChar = availableCharacters.find(c => c.id === 'ilhwan');
        const leeChar = availableCharacters.find(c => c.id === 'lee');

        const newTeam2 = [
            limChar ? {
                ...limChar,
                advancement: 5,
                weaponAdvancement: 5,
                // 4pc Armed + 4pc Precision (Breaker ATK Scaler optimal sets)
                leftSet: 'armed',
                leftPieces: 4,
                rightSet: 'precision',
                rightPieces: 4,
                coreAttackTC: true,
                rawStats: { critRate: 0, critDMG: 0, defPen: 0, damageIncrease: 0 }
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
                rawStats: { critRate: 0, critDMG: 0, defPen: 0, damageIncrease: 0 }
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
                rawStats: { critRate: 0, critDMG: 0, defPen: 0, damageIncrease: 0 }
            } : null
        ];
        setTeam2(newTeam2);

        // Fermer le modal de sélection si ouvert
        setSelectedSlot(null);
    };

    // 🔥 PRESET: Fire Team
    // Sung actif, Team 1: Esil, Reed, Gina | Team 2: Yuki, Fern, Frieren
    const applyFirePreset = () => {
        // Activer Sung avec set Armed + Expert (4+4), arme: Ennio's Roar
        const sungChar = availableCharacters.find(c => c.id === 'jinwoo');
        if (sungChar) {
            setSungEnabled(true);
            setSungData({
                ...sungChar,
                advancement: 5,
                weaponAdvancement: 5,
                leftSet: 'armed',
                leftPieces: 4,
                rightSet: 'expert',
                rightPieces: 4,
                coreAttackTC: true,
                sungWeapon: 'ennio', // Ennio's Roar (16% Def Pen)
                rawStats: { critRate: 0, critDMG: 0, defPen: 0, damageIncrease: 0 }
            });
            setSungBlessing(true); // Activer Blessing (+24.5% TC)
        }

        // Team 1: Esil (8pc Greed), Reed (Armed + Obsidian), Gina (Guardian + Sylph)
        const esilChar = availableCharacters.find(c => c.id === 'esil');
        const reedChar = availableCharacters.find(c => c.id === 'reed');
        const ginaChar = availableCharacters.find(c => c.id === 'gina');

        const newTeam1Fire = [
            esilChar ? {
                ...esilChar,
                advancement: 5,
                weaponAdvancement: 5,
                leftSet: 'burning-greed',
                leftPieces: 4,
                rightSet: 'burning-greed',
                rightPieces: 4,
                coreAttackTC: true,
                rawStats: { critRate: 0, critDMG: 0, defPen: 0, damageIncrease: 0 }
            } : null,
            reedChar ? {
                ...reedChar,
                advancement: 5,
                weaponAdvancement: 5,
                leftSet: 'armed',
                leftPieces: 4,
                rightSet: 'obsidian',
                rightPieces: 4,
                coreAttackTC: true,
                rawStats: { critRate: 0, critDMG: 0, defPen: 0, damageIncrease: 0 }
            } : null,
            ginaChar ? {
                ...ginaChar,
                advancement: 5,
                weaponAdvancement: 5,
                leftSet: 'guardian',
                leftPieces: 4,
                rightSet: 'sylph',
                rightPieces: 4,
                coreAttackTC: true,
                rawStats: { critRate: 0, critDMG: 0, defPen: 0, damageIncrease: 0 }
            } : null
        ];
        setTeam1(newTeam1Fire);

        // Team 2: Yuqi (Greed + Desire), Fern (Armed + Obsidian), Frieren (Guardian + Sylph)
        const yuqiChar = availableCharacters.find(c => c.id === 'yuqi');
        const fernChar = availableCharacters.find(c => c.id === 'fern');
        const frierenChar = availableCharacters.find(c => c.id === 'frieren');

        const newTeam2Fire = [
            yuqiChar ? {
                ...yuqiChar,
                advancement: 5,
                weaponAdvancement: 5,
                leftSet: 'burning-greed',
                leftPieces: 4,
                rightSet: 'chaotic-desire',
                rightPieces: 4,
                coreAttackTC: true,
                rawStats: { critRate: 0, critDMG: 0, defPen: 0, damageIncrease: 0 }
            } : null,
            fernChar ? {
                ...fernChar,
                advancement: 5,
                weaponAdvancement: 5,
                leftSet: 'armed',
                leftPieces: 4,
                rightSet: 'obsidian',
                rightPieces: 4,
                coreAttackTC: true,
                rawStats: { critRate: 0, critDMG: 0, defPen: 0, damageIncrease: 0 }
            } : null,
            frierenChar ? {
                ...frierenChar,
                advancement: 5,
                weaponAdvancement: 5,
                leftSet: 'guardian',
                leftPieces: 4,
                rightSet: 'sylph',
                rightPieces: 4,
                coreAttackTC: true,
                rawStats: { critRate: 0, critDMG: 0, defPen: 0, damageIncrease: 0 }
            } : null
        ];
        setTeam2(newTeam2Fire);

        // Fermer le modal de sélection si ouvert
        setSelectedSlot(null);
    };

    // 💧 PRESET: Water Team
    // Sung support (8pc Burning Greed), Team 1: Cha Hae-In Water, Seorin, Frieren | Team 2: Meilin, Shuhua, Meri Laine
    const applyWaterPreset = () => {
        // Activer Sung avec set 8pc Burning Greed (support)
        const sungChar = availableCharacters.find(c => c.id === 'jinwoo');
        if (sungChar) {
            setSungEnabled(true);
            setSungData({
                ...sungChar,
                advancement: 5,
                weaponAdvancement: 5,
                // 8pc Burning Greed
                leftSet: 'burning-greed',
                leftPieces: 4,
                rightSet: 'burning-greed',
                rightPieces: 4,
                coreAttackTC: true,
                rawStats: {
                    critRate: 0,
                    critDMG: 0,
                    defPen: 0,
                    damageIncrease: 0,
                }
            });
        }

        // Team 1: Cha Hae-In Water (8pc Infamy), Seorin (8pc Desire), Frieren (8pc Infamy)
        const chaeChar = availableCharacters.find(c => c.id === 'chae');
        const seorinChar = availableCharacters.find(c => c.id === 'seorin');
        const frierenChar = availableCharacters.find(c => c.id === 'frieren');

        const newTeam1Water = [
            chaeChar ? {
                ...chaeChar,
                advancement: 5,
                weaponAdvancement: 5,
                // 8pc Chaotic Infamy (Main DPS DEF scaler)
                leftSet: 'chaotic-infamy',
                leftPieces: 4,
                rightSet: 'chaotic-infamy',
                rightPieces: 4,
                coreAttackTC: false,
                rawStats: { critRate: 0, critDMG: 0, defPen: 0, damageIncrease: 0 }
            } : null,
            seorinChar ? {
                ...seorinChar,
                advancement: 5,
                weaponAdvancement: 5,
                // 8pc Chaotic Desire (Breaker HP scaler)
                leftSet: 'chaotic-desire',
                leftPieces: 4,
                rightSet: 'chaotic-desire',
                rightPieces: 4,
                coreAttackTC: false,
                rawStats: { critRate: 0, critDMG: 0, defPen: 0, damageIncrease: 0 }
            } : null,
            frierenChar ? {
                ...frierenChar,
                advancement: 5,
                weaponAdvancement: 5,
                // 8pc Chaotic Infamy (Support DEF scaler)
                leftSet: 'chaotic-infamy',
                leftPieces: 4,
                rightSet: 'chaotic-infamy',
                rightPieces: 4,
                coreAttackTC: false,
                rawStats: { critRate: 0, critDMG: 0, defPen: 0, damageIncrease: 0 }
            } : null
        ];
        setTeam1(newTeam1Water);

        // Team 2: Meilin (4pc Guardian + 4pc Sylph), Shuhua (4pc Burning Curse + 4pc Expert), Meri Laine (4pc Angel + 4pc Watcher/Concentration)
        const meilinChar = availableCharacters.find(c => c.id === 'meilin');
        const shuhuaChar = availableCharacters.find(c => c.id === 'shuhua');
        const meriChar = availableCharacters.find(c => c.id === 'meri');

        const newTeam2Water = [
            meilinChar ? {
                ...meilinChar,
                advancement: 5,
                weaponAdvancement: 5,
                // 4pc Guardian + 4pc Sylph (Healer/Buffer HP scaler)
                leftSet: 'guardian',
                leftPieces: 4,
                rightSet: 'sylph',
                rightPieces: 4,
                coreAttackTC: true,
                rawStats: { critRate: 0, critDMG: 0, defPen: 0, damageIncrease: 0 }
            } : null,
            shuhuaChar ? {
                ...shuhuaChar,
                advancement: 5,
                weaponAdvancement: 5,
                // 4pc Burning Curse + 4pc Expert (Assassin DPS ATK scaler)
                leftSet: 'burning-curse',
                leftPieces: 4,
                rightSet: 'expert',
                rightPieces: 4,
                coreAttackTC: false,
                rawStats: { critRate: 0, critDMG: 0, defPen: 0, damageIncrease: 0 }
            } : null,
            meriChar ? {
                ...meriChar,
                advancement: 5,
                weaponAdvancement: 5,
                // 4pc Angel + 4pc Watcher (stand-in for Concentration of Firepower / Viresdescent)
                leftSet: 'angel',
                leftPieces: 4,
                rightSet: 'watcher',
                rightPieces: 4,
                coreAttackTC: true,
                rawStats: { critRate: 0, critDMG: 0, defPen: 0, damageIncrease: 0 }
            } : null
        ];
        setTeam2(newTeam2Water);

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

                // Appliquer le buff conditionnel à TOUT LE RAID (Lee Bora A2+ : DCC per Dark ally)
                if (conditional.targetElement && conditional.raidWide) {
                    allMembers.forEach((targetMember, targetIndex) => {
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
                // Utiliser la nouvelle ou l'ancienne formule selon le paramètre
                const defPenPercent = useNewDefPenFormula
                    ? parseFloat(newDefPenFormula.toPercent(member.rawStats.defPen, enemyLevel))
                    : parseFloat(statConversionsWithEnemy.defPen.toPercent(member.rawStats.defPen, enemyLevel));
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
    }, [sungData, team1, team2, sungEnabled, selectedEnemy, enemyLevel, useNewDefPenFormula]);

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
                    className="text-center mb-8 relative"
                >
                    <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-[#6c63ff] to-[#a855f7] bg-clip-text text-transparent">
                        ⚡ Theorycraft
                    </h1>
                    <p className="text-purple-300">
                        Calculateur de synergies de team - Crit Rate, Crit DMG, Def Pen
                    </p>
                    {/* Settings Button */}
                    <button
                        onClick={() => setShowSettings(true)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 p-3 bg-gray-800/80 hover:bg-gray-700 rounded-xl border border-gray-600 hover:border-purple-500 transition-all"
                        title="Paramètres des formules"
                    >
                        ⚙️
                    </button>
                </motion.div>

                {/* Preset Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="flex justify-center mb-6"
                >
                    <div className="flex gap-4">
                        <button
                            onClick={applyDarkPreset}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl font-bold text-white shadow-lg shadow-purple-500/50 transition-all hover:scale-105 flex items-center gap-2"
                        >
                            🌑 Preset Dark Team
                        </button>
                        <button
                            onClick={applyFirePreset}
                            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-xl font-bold text-white shadow-lg shadow-orange-500/50 transition-all hover:scale-105 flex items-center gap-2"
                        >
                            🔥 Preset Fire Team
                        </button>
                        <button
                            onClick={applyWaterPreset}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl font-bold text-white shadow-lg shadow-cyan-500/50 transition-all hover:scale-105 flex items-center gap-2"
                        >
                            💧 Preset Water Team
                        </button>
                    </div>
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
                                                sungWeapon: 'none', // Arme de Sung (none, ennio, knightkiller)
                                                rawStats: { critRate: 0, critDMG: 0, defPen: 0, damageIncrease: 0 }
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
                                <>
                                    <CharacterSlot
                                        character={sungData}
                                        onRemove={() => removeCharacter(0, 0)}
                                        onAdvancementChange={(delta) => changeAdvancement(0, 0, delta)}
                                        onSetPiecesChange={(pieces) => changeSetPieces(0, 0, pieces)}
                                        onClick={() => selectCharForDetails(0, 0)}
                                        isSelected={selectedCharForDetails?.team === 0}
                                    />
                                    {/* Sélecteur d'arme Sung */}
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-gray-400">⚔️ Arme Def Pen</span>
                                        <select
                                            value={sungData.sungWeapon || 'none'}
                                            onChange={(e) => setSungData({ ...sungData, sungWeapon: e.target.value })}
                                            className="bg-gray-700 text-white text-xs rounded px-2 py-1 border border-gray-600 focus:border-purple-500 focus:outline-none"
                                        >
                                            <option value="none">Aucune</option>
                                            <option value="ennio">Ennio's Roar (16%)</option>
                                            <option value="knightkiller">Knight Killer (20%)</option>
                                        </select>
                                    </div>
                                    {/* Checkbox Blessing (+24.5% Crit Rate) */}
                                    <label className="flex items-center gap-2 cursor-pointer mt-1">
                                        <input
                                            type="checkbox"
                                            checked={sungBlessing}
                                            onChange={(e) => setSungBlessing(e.target.checked)}
                                            className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-yellow-500 focus:ring-yellow-500 focus:ring-2 cursor-pointer"
                                        />
                                        <span className="text-xs text-yellow-400">✨ Blessing (+24.5% TC)</span>
                                    </label>
                                </>
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

                {/* Stats par Personnage - SECTION REPOSITIONNÉE */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-indigo-800/30 to-purple-800/30 backdrop-blur-sm rounded-xl p-6 mb-6 border border-indigo-500/50"
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
                        useNewDefPenFormula={useNewDefPenFormula}
                        sungBlessing={sungBlessing}
                        selectedEnemy={selectedEnemy}
                        onCharacterClick={(teamId, slotId) => selectCharForDetails(teamId, slotId)}
                    />
                </motion.div>

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
                            useNewDefPenFormula={useNewDefPenFormula}
                            selectedEnemy={selectedEnemy}
                        />
                    )}
                </AnimatePresence>

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

                {/* Settings Popup */}
                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
                            onClick={() => setShowSettings(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full mx-4 border border-purple-500/50 shadow-2xl max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-purple-300 flex items-center gap-2">
                                        ⚙️ Paramètres des Formules
                                    </h2>
                                    <button
                                        onClick={() => setShowSettings(false)}
                                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Defense Penetration Formula */}
                                <div className="bg-gray-800/50 rounded-xl p-4 mb-4 border border-blue-500/30">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-lg font-bold text-blue-400">🛡️ Defense Penetration</h3>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <span className={`text-sm ${!useNewDefPenFormula ? 'text-yellow-400' : 'text-gray-500'}`}>Ancienne</span>
                                            <div
                                                className={`relative w-12 h-6 rounded-full transition-colors ${useNewDefPenFormula ? 'bg-green-600' : 'bg-gray-600'}`}
                                                onClick={() => setUseNewDefPenFormula(!useNewDefPenFormula)}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${useNewDefPenFormula ? 'translate-x-7' : 'translate-x-1'}`} />
                                            </div>
                                            <span className={`text-sm ${useNewDefPenFormula ? 'text-green-400' : 'text-gray-500'}`}>Nouvelle</span>
                                        </label>
                                    </div>

                                    {useNewDefPenFormula ? (
                                        <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/30">
                                            <div className="text-green-400 font-bold mb-2">✅ Nouvelle Formule (Recommandée)</div>
                                            <div className="text-sm text-gray-300 mb-2">
                                                Confirmée via Reddit + RDPS + tests LV80
                                            </div>
                                            <div className="bg-black/30 rounded p-2 font-mono text-sm text-center">
                                                <div className="text-yellow-300">DefPen% = (Stat × 100) / (Stat + Level × 1000)</div>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-2">
                                                Exemple: 57,931 Def Pen @ LV80 = <span className="text-green-400 font-bold">42%</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-500/30">
                                            <div className="text-yellow-400 font-bold mb-2">⚠️ Ancienne Formule (slatracker)</div>
                                            <div className="text-sm text-gray-300 mb-2">
                                                Formule complexe avec coefficients exponentiels - peut avoir des erreurs
                                            </div>
                                            <div className="bg-black/30 rounded p-2 font-mono text-xs text-center">
                                                <div className="text-yellow-300">Part1 × Part2 × 100</div>
                                                <div className="text-gray-500 text-xs mt-1">Part1 = f(Stat²), Part2 = K(L) × (S+B) / (0.4S+M)</div>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-2">
                                                Exemple: 66,700 Def Pen @ LV80 = <span className="text-red-400 font-bold">~100%</span> (incorrect)
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Crit Rate Formula */}
                                <div className="bg-gray-800/50 rounded-xl p-4 mb-4 border border-yellow-500/30">
                                    <h3 className="text-lg font-bold text-yellow-400 mb-3">🎯 Taux Critique (TC)</h3>
                                    <div className="bg-black/30 rounded p-2 font-mono text-sm text-center">
                                        <div className="text-yellow-300">TC% = 5 + (Stat / (Stat + BaseResist)) × 100</div>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-2">
                                        BaseResist varie selon le level ennemi (LV80 ≈ 27,263)
                                    </div>
                                </div>

                                {/* Crit DMG Formula */}
                                <div className="bg-gray-800/50 rounded-xl p-4 border border-red-500/30">
                                    <h3 className="text-lg font-bold text-red-400 mb-3">💥 Dégâts Critiques (DCC)</h3>
                                    <div className="bg-black/30 rounded p-2 font-mono text-sm text-center">
                                        <div className="text-red-300">DCC% = K × (Stat + B) / (0.4 × Stat + M) × 100</div>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-2">
                                        K, B, M sont des coefficients level-dépendants. Base: 50% (affiché 150% in-game)
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="mt-6 text-center text-xs text-gray-500">
                                    💡 Les formules sont utilisées pour convertir les valeurs brutes en pourcentages réels
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
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
    team2,
    useNewDefPenFormula = true,
    selectedEnemy = 'fachtna'
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
            // 🌑 DARK
            'lee': 'weapon',           // Lee Bora weapon
            'ilhwan': 'weapon_ilhwan', // Ilhwan weapon
            'sian': 'weapon_sian',     // Sian weapon
            'son': 'weapon_son',       // Son Kihoon weapon (n'apporte rien)
            'minnie': 'weapon_minnie', // Minnie weapon (buffs perso)
            'harper': 'weapon_harper', // Harper weapon (n'apporte rien)
            'lim': 'weapon_lim',       // Lim weapon (n'apporte rien)
            'kang': 'weapon_kang',     // Kang weapon (n'apporte rien)
            'hwang': 'weapon_hwang',   // Hwang Dongsuk (n'apporte rien)
            // 🔥 FIRE
            'emma': 'weapon_emma',     // Emma weapon (n'apporte rien)
            'esil': 'weapon_esil',     // Esil weapon (ignoré - trop complexe)
            'yuqi': 'weapon_yuqi',     // Yuqi weapon (n'apporte rien)
            'reed': 'weapon_reed',     // Reed weapon (Def Pen perso)
            'gina': 'weapon_gina',     // Gina weapon (n'apporte rien)
            'soohyun': 'weapon_soohyun', // Yoo Soohyun weapon (n'apporte rien)
            'fern': 'weapon_fern',     // Fern weapon (DCC perso)
            'stark': 'weapon_stark',   // Stark weapon (n'apporte rien)
            'frieren': 'weapon_frieren' // Frieren weapon (n'apporte rien)
        };
        return weaponMap[characterId] || null; // null si pas d'arme définie
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
                            useNewDefPenFormula={useNewDefPenFormula}
                        />
                        {selectedEnemy === 'antQueen' && (
                            <RawStatInput
                                label="Damage Increase"
                                value={member.rawStats.damageIncrease}
                                onChange={(val) => onRawStatChange('damageIncrease', val)}
                                statType="di"
                                enemyLevel={enemyLevel}
                            />
                        )}
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

            {/* Section: Buffs/Debuffs Actifs (Advanced Mechanics) */}
            {CHARACTER_ADVANCED_BUFFS[member.id] && (
                <ActiveBuffsDisplayPanel
                    characterId={member.id}
                    advancement={member.advancement}
                    weaponAdvancement={member.weaponAdvancement || 5}
                />
            )}

            {/* Section: Buffs donnés par advancement (A0 à A5) - VERSION DÉTAILLÉE */}
            <CollapsibleSection
                title="Buffs Donnés par Advancement (L'Œil de Sauron)"
                icon="👁️"
                defaultOpen={false}
                borderColor="border-purple-700/50"
                bgColor="bg-gray-800/50"
            >
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
                                        parts.push(`${buffs.personalBuffs.critRate}% TC`);
                                    }
                                    if (buffs.personalBuffs.critDMG > 0) {
                                        parts.push(`${buffs.personalBuffs.critDMG}% DCC`);
                                    }
                                    if (buffs.personalBuffs.defPen > 0) {
                                        parts.push(`${buffs.personalBuffs.defPen}% Def Pen`);
                                    }

                                    if (parts.length > 0) {
                                        const characterName = member.id === 'lee' ? 'Lee Bora' :
                                                             member.id === 'ilhwan' ? 'Ilhwan' :
                                                             member.id === 'silverbaek' ? 'Silver Mane Baek Yoonho' :
                                                             member.id === 'minnie' ? 'Minnie' :
                                                             member.id === 'harper' ? 'Harper' :
                                                             member.id === 'lim' ? 'Lim' :
                                                             member.name || 'ce personnage';
                                        specialBuffsDisplay.push({
                                            label: `(only ${characterName})`,
                                            value: parts.join(', '),
                                            tooltip: `Ces buffs s'appliquent UNIQUEMENT à ${characterName}`
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
                                // Le buff DCC s'applique à TOUT LE RAID (pas que Dark !)
                                if (leeInRaid && level >= 2) {
                                    const leeA2 = getCharacterBuffs('lee', 2);
                                    if (leeA2.conditionalBuff) {
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
                                            label: `raid buff (Lee Bora)`,
                                            value: `${totalBuff}% DCC (${darkCount} Dark × ${leeA2.conditionalBuff.critDMGPerAlly}%)`,
                                            tooltip: `Buff appliqué à TOUT LE RAID. ${darkCount} Dark hunters × ${leeA2.conditionalBuff.critDMGPerAlly}% = +${totalBuff}% DCC`
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
            </CollapsibleSection>

            {/* Section: Optimisation & Sweet Spots */}
            {CHARACTER_OPTIMIZATION[member.id] && (
                <CollapsibleSection
                    title="Optimisation & Sweet Spots"
                    icon="🎯"
                    defaultOpen={false}
                    borderColor="border-green-700/50"
                    bgColor="bg-gray-800/50"
                >
                    <CharacterOptimizationPanel characterId={member.id} />
                </CollapsibleSection>
            )}
        </motion.div>
    );
};

// Composant: Affichage des Buffs/Debuffs Actifs (Advanced Mechanics)
const ActiveBuffsDisplayPanel = ({ characterId, advancement, weaponAdvancement }) => {
    const charData = CHARACTER_ADVANCED_BUFFS[characterId];
    if (!charData) return null;

    // Obtenir les buffs cumulatifs jusqu'au niveau actuel
    const advKey = `A${advancement}`;
    const cumulativeData = getCumulativeBuffs(characterId, advKey);

    // Obtenir les buffs de l'arme
    const weaponId = `weapon_${characterId}`;
    const weaponBuffs = CHARACTER_BUFFS[weaponId];
    const weaponAdvKey = `A${weaponAdvancement}`;
    const weaponData = weaponBuffs?.buffs?.[weaponAdvKey];

    const currentAdv = charData.advancements[advKey];

    // Vérifier que les données existent
    if (!currentAdv || !cumulativeData) return null;

    return (
        <CollapsibleSection
            title={
                <span className="flex items-center gap-3 flex-1">
                    <span className="text-emerald-400">Buffs & Debuffs Actifs</span>
                    <span className="text-xs text-gray-400 font-normal">
                        Advancement: <span className="text-purple-400 font-semibold">A{advancement}</span>
                    </span>
                </span>
            }
            icon="🔮"
            defaultOpen={false}
            borderColor="border-emerald-700/50"
            bgColor="bg-gradient-to-br from-gray-800/60 to-gray-900/60"
        >
            <div className="space-y-4">
                {/* SELF BUFFS (Vert) */}
                {cumulativeData.selfBuffs && cumulativeData.selfBuffs.length > 0 && (
                    <div>
                        <div className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                            <span>💪</span> Buffs Personnels
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {cumulativeData.selfBuffs.map((buff, idx) => (
                                <div
                                    key={`self-${idx}`}
                                    className="bg-green-900/20 border border-green-600/40 rounded-lg p-3 hover:border-green-500/60 transition-all"
                                >
                                    <div className="text-sm font-semibold text-green-300 mb-1">
                                        {buff.name}
                                    </div>
                                    {buff.trigger && (
                                        <div className="text-xs text-gray-400 mb-2 italic">
                                            Trigger: {buff.trigger}
                                        </div>
                                    )}
                                    <div className="text-xs text-green-200 space-y-0.5">
                                        {Object.entries(buff.effects).map(([key, value]) => {
                                            // Gérer les objets complexes (ex: selfDamage, shield, etc.)
                                            if (typeof value === 'object' && value !== null) {
                                                if (value.type && value.value !== undefined) {
                                                    // Format pour selfDamage/shield: "10% current HP" ou "20% max HP"
                                                    return (
                                                        <div key={key}>
                                                            • {key.replace(/([A-Z])/g, ' $1')}: {value.value}% {value.type.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                                        </div>
                                                    );
                                                }
                                                // Objets avec totalBonus (ex: Beast Form)
                                                if (value.critRate !== undefined || value.critDMG !== undefined) {
                                                    return (
                                                        <div key={key}>
                                                            • {key.replace(/([A-Z])/g, ' $1')}:
                                                            {value.critRate && ` +${value.critRate}% TC`}
                                                            {value.critDMG && ` +${value.critDMG}% DCC`}
                                                        </div>
                                                    );
                                                }
                                                // Autres objets complexes
                                                return (
                                                    <div key={key}>
                                                        • {key.replace(/([A-Z])/g, ' $1')}: {JSON.stringify(value)}
                                                    </div>
                                                );
                                            }
                                            // Valeurs simples
                                            return (
                                                <div key={key}>
                                                    • {key.replace(/([A-Z])/g, ' $1')}: +{value}%
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {buff.duration && (
                                        <div className={`text-xs mt-1 flex items-center gap-1 ${
                                            buff.cooldown
                                                ? (buff.duration / buff.cooldown >= 0.75 ? 'text-green-400' : buff.duration / buff.cooldown >= 0.5 ? 'text-yellow-400' : 'text-red-400')
                                                : buff.duration === 'infinite' ? 'text-green-400' : 'text-gray-500'
                                        }`}>
                                            <span>⏱</span>
                                            <span>{buff.duration === 'infinite' ? '∞ Permanent' : `${buff.duration}s`}</span>
                                            {buff.cooldown && (
                                                <span className="font-semibold">
                                                    / {buff.cooldown}s CD → Uptime: {Math.round((buff.duration / buff.cooldown) * 100)}%
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {buff.maxStacks && (
                                        <div className="text-xs text-purple-400 mt-1">
                                            Max {buff.maxStacks} stacks
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TEAM BUFFS (Vert) */}
                {cumulativeData.teamBuffs && cumulativeData.teamBuffs.length > 0 && (
                    <div>
                        <div className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                            <span>👥</span> Buffs d'Équipe (TEAM)
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {cumulativeData.teamBuffs.map((buff, idx) => (
                                <div
                                    key={`team-${idx}`}
                                    className="bg-green-900/20 border border-green-600/40 rounded-lg p-3 hover:border-green-500/60 transition-all"
                                >
                                    <div className="text-sm font-semibold text-green-300 mb-1">
                                        {buff.name}
                                    </div>
                                    {buff.trigger && (
                                        <div className="text-xs text-gray-400 mb-2 italic">
                                            Trigger: {buff.trigger}
                                        </div>
                                    )}
                                    <div className="text-xs text-green-200 space-y-0.5">
                                        {Object.entries(buff.effects).map(([key, value]) => {
                                            // Gérer les objets complexes (ex: totalBonus avec critRate/critDMG)
                                            if (typeof value === 'object' && value !== null) {
                                                if (value.critRate !== undefined || value.critDMG !== undefined) {
                                                    return (
                                                        <div key={key}>
                                                            • {key.replace(/([A-Z])/g, ' $1')}:
                                                            {value.critRate && ` +${value.critRate}% TC`}
                                                            {value.critDMG && ` +${value.critDMG}% DCC`}
                                                        </div>
                                                    );
                                                }
                                                // Autres objets complexes
                                                return (
                                                    <div key={key}>
                                                        • {key.replace(/([A-Z])/g, ' $1')}: {JSON.stringify(value)}
                                                    </div>
                                                );
                                            }
                                            // Valeurs simples
                                            return (
                                                <div key={key}>
                                                    • {key.replace(/([A-Z])/g, ' $1')}: +{value}%
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {buff.targetScope && (
                                        <div className="text-xs text-blue-400 mt-1">
                                            Scope: {buff.targetScope}
                                        </div>
                                    )}
                                    {buff.duration && (
                                        <div className={`text-xs mt-1 flex items-center gap-1 ${
                                            buff.cooldown
                                                ? (buff.duration / buff.cooldown >= 0.75 ? 'text-green-400' : buff.duration / buff.cooldown >= 0.5 ? 'text-yellow-400' : 'text-red-400')
                                                : buff.duration === 'infinite' ? 'text-green-400' : 'text-gray-500'
                                        }`}>
                                            <span>⏱</span>
                                            <span>{buff.duration === 'infinite' ? '∞ Permanent' : `${buff.duration}s`}</span>
                                            {buff.cooldown && (
                                                <span className="font-semibold">
                                                    / {buff.cooldown}s CD → Uptime: {Math.round((buff.duration / buff.cooldown) * 100)}%
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* RAID BUFFS (Vert) */}
                {cumulativeData.raidBuffs && cumulativeData.raidBuffs.length > 0 && (
                    <div>
                        <div className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                            <span>🌟</span> Buffs de Raid (RAID-WIDE)
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {cumulativeData.raidBuffs.map((buff, idx) => (
                                <div
                                    key={`raid-${idx}`}
                                    className="bg-green-900/20 border border-green-600/40 rounded-lg p-3 hover:border-green-500/60 transition-all"
                                >
                                    <div className="text-sm font-semibold text-green-300 mb-1">
                                        {buff.name}
                                    </div>
                                    {buff.trigger && (
                                        <div className="text-xs text-gray-400 mb-2 italic">
                                            Trigger: {buff.trigger}
                                        </div>
                                    )}
                                    <div className="text-xs text-green-200 space-y-0.5">
                                        {Object.entries(buff.effects).map(([key, value]) => {
                                            // Gérer les objets complexes (ex: totalBonus avec critRate/critDMG)
                                            if (typeof value === 'object' && value !== null) {
                                                if (value.critRate !== undefined || value.critDMG !== undefined) {
                                                    return (
                                                        <div key={key}>
                                                            • {key.replace(/([A-Z])/g, ' $1')}:
                                                            {value.critRate && ` +${value.critRate}% TC`}
                                                            {value.critDMG && ` +${value.critDMG}% DCC`}
                                                        </div>
                                                    );
                                                }
                                                // Autres objets complexes
                                                return (
                                                    <div key={key}>
                                                        • {key.replace(/([A-Z])/g, ' $1')}: {JSON.stringify(value)}
                                                    </div>
                                                );
                                            }
                                            // Valeurs simples
                                            return (
                                                <div key={key}>
                                                    • {key.replace(/([A-Z])/g, ' $1')}: +{value}%
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {buff.targetScope && (
                                        <div className="text-xs text-blue-400 mt-1">
                                            Scope: {buff.targetScope}
                                        </div>
                                    )}
                                    {buff.duration && (
                                        <div className={`text-xs mt-1 flex items-center gap-1 ${
                                            buff.cooldown
                                                ? (buff.duration / buff.cooldown >= 0.75 ? 'text-green-400' : buff.duration / buff.cooldown >= 0.5 ? 'text-yellow-400' : 'text-red-400')
                                                : buff.duration === 'infinite' ? 'text-green-400' : 'text-gray-500'
                                        }`}>
                                            <span>⏱</span>
                                            <span>{buff.duration === 'infinite' ? '∞ Permanent' : `${buff.duration}s`}</span>
                                            {buff.cooldown && (
                                                <span className="font-semibold">
                                                    / {buff.cooldown}s CD → Uptime: {Math.round((buff.duration / buff.cooldown) * 100)}%
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {buff.perAllyBonus && (
                                        <div className="text-xs text-purple-400 mt-1">
                                            +{buff.perAllyBonus}% par allié {buff.targetElement}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* WEAPON BUFFS (Vert si conditionnel) */}
                {weaponData?.conditionalBuff && (
                    <div>
                        <div className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
                            <span>⚔️</span> Buff d'Arme (Conditionnel)
                        </div>
                        <div className="bg-amber-900/20 border border-amber-600/40 rounded-lg p-3 hover:border-amber-500/60 transition-all">
                            <div className="text-sm font-semibold text-amber-300 mb-1">
                                Crimson Shadow - Dark Damage
                            </div>
                            <div className="text-xs text-gray-400 mb-2 italic">
                                Trigger: Ennemi a Dark Overload
                            </div>
                            <div className="text-xs text-amber-200 space-y-0.5">
                                <div>
                                    • +{weaponData.conditionalBuff.darkDamagePerStack}% Dark Damage par stack
                                </div>
                                <div>
                                    • Max {weaponData.conditionalBuff.maxStacks} stacks = +{weaponData.conditionalBuff.darkDamagePerStack * weaponData.conditionalBuff.maxStacks}% Dark Damage
                                </div>
                            </div>
                            <div className="text-xs text-blue-400 mt-1">
                                Scope: {weaponData.conditionalBuff.targetScope}
                            </div>
                        </div>
                    </div>
                )}

                {/* ENEMY DEBUFFS (Rouge) */}
                {cumulativeData.debuffs && cumulativeData.debuffs.length > 0 && (
                    <div>
                        <div className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                            <span>🎯</span> Debuffs sur Ennemis
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {cumulativeData.debuffs.map((debuff, idx) => (
                                <div
                                    key={`debuff-${idx}`}
                                    className="bg-red-900/20 border border-red-600/40 rounded-lg p-3 hover:border-red-500/60 transition-all"
                                >
                                    <div className="text-sm font-semibold text-red-300 mb-1">
                                        {debuff.name}
                                    </div>
                                    {debuff.trigger && (
                                        <div className="text-xs text-gray-400 mb-2 italic">
                                            Trigger: {debuff.trigger}
                                        </div>
                                    )}
                                    <div className="text-xs text-red-200 space-y-0.5">
                                        {Object.entries(debuff.effects).map(([key, value]) => {
                                            // Gérer les objets complexes (ex: bleed avec type/value/interval)
                                            if (typeof value === 'object' && value !== null) {
                                                if (value.type && value.value !== undefined) {
                                                    // Format: "bleed: 1% current HP every 3s"
                                                    return (
                                                        <div key={key}>
                                                            • {key}: {value.value}% {value.type.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                                            {value.interval && ` every ${value.interval}s`}
                                                        </div>
                                                    );
                                                }
                                                // Autres objets complexes
                                                return (
                                                    <div key={key}>
                                                        • {key.replace(/([A-Z])/g, ' $1')}: {JSON.stringify(value)}
                                                    </div>
                                                );
                                            }
                                            // Valeurs simples
                                            return (
                                                <div key={key}>
                                                    • {key.replace(/([A-Z])/g, ' $1')}: +{value}%
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {debuff.duration && (
                                        <div className={`text-xs mt-1 flex items-center gap-1 ${
                                            debuff.cooldown
                                                ? (debuff.duration / debuff.cooldown >= 0.75 ? 'text-green-400' : debuff.duration / debuff.cooldown >= 0.5 ? 'text-yellow-400' : 'text-red-400')
                                                : 'text-gray-500'
                                        }`}>
                                            <span>⏱</span>
                                            <span>{debuff.duration}s</span>
                                            {debuff.cooldown && (
                                                <span className="font-semibold">
                                                    / {debuff.cooldown}s CD → Uptime: {Math.round((debuff.duration / debuff.cooldown) * 100)}%
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {debuff.maxStacks && (
                                        <div className="text-xs text-purple-400 mt-1">
                                            Max {debuff.maxStacks} stacks
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 text-xs text-gray-400 italic border-t border-gray-700 pt-3">
                💡 Ces buffs/debuffs sont cumulatifs selon l'advancement. Les mécaniques avancées (gauge, stacks, conditionnels) sont affichées ici.
            </div>
        </CollapsibleSection>
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
const RawStatInput = ({ label, value, onChange, statType, enemyLevel = 80, useNewDefPenFormula = true }) => {
    // Calculer le pourcentage converti AVEC le niveau de l'ennemi
    let convertedPercent = 0;
    if (value > 0) {
        // Pour Def Pen, utiliser la nouvelle ou ancienne formule selon le paramètre
        if (statType === 'defPen') {
            convertedPercent = useNewDefPenFormula
                ? parseFloat(newDefPenFormula.toPercent(value, enemyLevel))
                : parseFloat(statConversionsWithEnemy.defPen.toPercent(value, enemyLevel));
        } else if (statConversionsWithEnemy[statType]) {
            convertedPercent = parseFloat(statConversionsWithEnemy[statType].toPercent(value, enemyLevel));
        }
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

// Composant: Section Collapsible avec animation
const CollapsibleSection = ({ title, icon, defaultOpen = false, borderColor = 'border-gray-700/50', bgColor = 'bg-gray-800/50', children }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`mt-6 ${bgColor} rounded-lg border ${borderColor} overflow-hidden`}>
            {/* Header cliquable */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
                <h3 className="text-lg font-bold text-green-400 flex items-center gap-2">
                    {icon && <span>{icon}</span>}
                    {title}
                </h3>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-gray-400"
                >
                    <ChevronDown size={20} />
                </motion.div>
            </button>

            {/* Contenu avec animation */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 pt-0">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
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

// Fonction pure pour calculer les stats de tous les membres (extraite pour réutilisation What-If)
const computeTeamStats = (sungEnabled, sungData, team1, team2, enemyLevel, useNewDefPenFormula, sungBlessing) => {
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

        // Advanced stats (nouveaux)
        let totalDarkDamage = 0;
        let totalDarkDamageOL = 0;  // Dark DMG conditionnel (During Overload uniquement)
        let totalAttack = 0;
        let totalHP = 0;  // HP% bonus (pour hunters qui scale sur HP)
        let totalDefense = 0;  // DEF% bonus (pour hunters qui scale sur DEF)
        let totalDarkElementalAccumulation = 0;
        let totalDarkOverloadDamage = 0;
        let totalDamageVsDarkOverloaded = 0;
        let totalDarkDamageTaken = 0;
        let totalDarkOverloadDamageTaken = 0;
        let totalBasicSkillDamage = 0;  // Basic Skill DMG
        let totalUltimateSkillDamage = 0;  // Ultimate Skill DMG

        // Fire advanced stats
        let totalFireDamage = 0;        // Fire DMG%
        let totalFireDamageTaken = 0;   // Fire DMG Taken (debuff on enemy)
        let totalDamageDealt = 0;       // General DMG Dealt % (ex: FOREVER)
        let totalDamageTaken = 0;       // General DMG Taken (debuff ex: Distortion)
        let totalBreakTargetDmg = 0;    // DMG vs Break targets (ex: Afterglow)

        // Fire Overload stats
        let totalFireElementalAccumulation = 0;  // Fire Elemental Accumulation %
        let totalFireOverloadDamage = 0;         // Fire Overload DMG %
        let totalFireOverloadDamageTaken = 0;    // Fire Overload DMG Taken (debuff on enemy)

        // Water advanced stats
        let totalWaterDamage = 0;          // Water DMG%
        let totalWaterDamageTaken = 0;     // Water DMG Taken (debuff on enemy)
        let totalWaterElementalAccumulation = 0;  // Water Elemental Accumulation %
        let totalWaterOverloadDamage = 0;         // Water Overload DMG %
        let totalWaterOverloadDamageTaken = 0;    // Water Overload DMG Taken (debuff on enemy)

        // Damage Increase (raw stat → %)
        let totalDamageIncrease = 0;

        // Breakdown détaillé (pour affichage au hover)
        const breakdown = {
            critRate: [],
            critDMG: [],
            defPen: [],
            darkDamage: [],
            darkDamageOL: [],  // Dark DMG conditionnel (During Overload)
            attack: [],
            hp: [],  // HP% bonus
            defense: [],  // DEF% bonus
            darkElementalAccumulation: [],
            darkOverloadDamage: [],
            damageVsDarkOverloaded: [],
            darkDamageTaken: [],
            darkOverloadDamageTaken: [],
            basicSkillDamage: [],  // Basic Skill DMG
            ultimateSkillDamage: [],  // Ultimate Skill DMG
            // Fire stats
            fireDamage: [],
            fireDamageTaken: [],
            damageDealt: [],
            damageTaken: [],
            breakTargetDmg: [],
            // Fire Overload stats
            fireElementalAccumulation: [],
            fireOverloadDamage: [],
            fireOverloadDamageTaken: [],
            // Water stats
            waterDamage: [],
            waterDamageTaken: [],
            waterElementalAccumulation: [],
            waterOverloadDamage: [],
            waterOverloadDamageTaken: [],
            // Damage Increase (raw stat → %)
            damageIncrease: []
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

        // Lim Tae-Gyu: RAID buff (TC + DCC stacking pour TOUT LE RAID)
        // Chercher Lim dans allMembers (peu importe sa team)
        const limInRaid = allMembers.find(m => m && m.id === 'lim');

        // Si Lim est présent et a A1+, appliquer son buff RAID (max stacks pour Theorycraft optimal)
        if (limInRaid && limInRaid.advancement >= 1) {
            // Lim buff pour TOUT LE RAID (teamId 0, 1, 2)
            const limBuffs = getCharacterBuffs('lim', limInRaid.advancement);

            if (limBuffs.conditionalBuff?.totalBonus) {
                // Appliquer les buffs max stacks (8 stacks = +5.6% TC + 8% DCC)
                if (limBuffs.conditionalBuff.totalBonus.critRate > 0) {
                    totalCritRate += limBuffs.conditionalBuff.totalBonus.critRate;
                    breakdown.critRate.push({ source: `🏹 RAID buff (Lim A${limInRaid.advancement} - 8 stacks)`, value: limBuffs.conditionalBuff.totalBonus.critRate });
                }
                if (limBuffs.conditionalBuff.totalBonus.critDMG > 0) {
                    totalCritDMG += limBuffs.conditionalBuff.totalBonus.critDMG;
                    breakdown.critDMG.push({ source: `🏹 RAID buff (Lim A${limInRaid.advancement} - 8 stacks)`, value: limBuffs.conditionalBuff.totalBonus.critDMG });
                }
            }
        }

        // Son Kihoon : Team/RAID buffs (A4: +10% ATK/HP team, A5: +10% ATK/HP/DMG RAID)
        // Trouver si Son est dans une team et appliquer ses buffs
        const sonForBuffs = sonInTeam1 || sonInTeam2;
        if (sonForBuffs && sonForBuffs.advancement >= 4) {
            const sonBuffsData = CHARACTER_BUFFS['son'];
            const sonAdvKey = `A${sonForBuffs.advancement}`;
            const sonAdvBuffs = sonBuffsData?.buffs?.[sonAdvKey];

            // A4 : Team buffs (+10% ATK/HP pour la team)
            if (sonForBuffs.advancement === 4 && sonAdvBuffs?.teamBuffs) {
                // Vérifier si member est dans la même team que Son
                const sonTeam = sonInTeam1 ? [0, 1] : [2]; // Son in Team1 → teamId 0 ou 1, Son in Team2 → teamId 2
                const memberInSameTeam = sonTeam.includes(member.teamId);

                if (memberInSameTeam) {
                    if (sonAdvBuffs.teamBuffs.attack > 0) {
                        totalAttack += sonAdvBuffs.teamBuffs.attack;
                        breakdown.attack.push({ source: `🛡️ Son Kihoon Team Buff (A4)`, value: sonAdvBuffs.teamBuffs.attack });
                    }
                    if (sonAdvBuffs.teamBuffs.hp > 0) {
                        totalHP += sonAdvBuffs.teamBuffs.hp;
                        breakdown.hp.push({ source: `🛡️ Son Kihoon Team Buff (A4)`, value: sonAdvBuffs.teamBuffs.hp });
                    }
                }
            }

            // A5 : TEAM buffs (+10% ATK/HP/DMG dealt pour la TEAM) - Strike Squad Leader
            if (sonForBuffs.advancement >= 5 && sonAdvBuffs?.teamBuffs) {
                const sonTeamA5 = sonInTeam1 ? [0, 1] : [2];
                const memberInSameTeamA5 = sonTeamA5.includes(member.teamId);

                if (memberInSameTeamA5) {
                    if (sonAdvBuffs.teamBuffs.attack > 0) {
                        totalAttack += sonAdvBuffs.teamBuffs.attack;
                        breakdown.attack.push({ source: `🛡️ Son Strike Squad Leader (A5 TEAM)`, value: sonAdvBuffs.teamBuffs.attack });
                    }
                    if (sonAdvBuffs.teamBuffs.hp > 0) {
                        totalHP += sonAdvBuffs.teamBuffs.hp;
                        breakdown.hp.push({ source: `🛡️ Son Strike Squad Leader (A5 TEAM)`, value: sonAdvBuffs.teamBuffs.hp });
                    }
                    if (sonAdvBuffs.teamBuffs.damageDealt > 0) {
                        totalDamageDealt += sonAdvBuffs.teamBuffs.damageDealt;
                        breakdown.damageDealt.push({ source: `🛡️ Son Strike Squad Leader (A5 TEAM) - DMG Dealt`, value: sonAdvBuffs.teamBuffs.damageDealt });
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

        // 3b. BLESSING (+24.5% TC pour Sung uniquement)
        if (member.id === 'jinwoo' && sungBlessing) {
            totalCritRate += 24.5;
            breakdown.critRate.push({ source: '✨ Blessing', value: 24.5 });
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
                                 member.id === 'minnie' ? 'Minnie' :
                                 member.id === 'harper' ? 'Harper' :
                                 member.id === 'lim' ? 'Lim' :
                                 member.name || 'Personnage';

            if (memberBuffs.personalBuffs.critRate > 0) {
                totalCritRate += memberBuffs.personalBuffs.critRate;
                breakdown.critRate.push({ source: `(only ${characterName} A${member.advancement})`, value: memberBuffs.personalBuffs.critRate });
            }
            if (memberBuffs.personalBuffs.critDMG > 0) {
                totalCritDMG += memberBuffs.personalBuffs.critDMG;
                breakdown.critDMG.push({ source: `(only ${characterName} A${member.advancement})`, value: memberBuffs.personalBuffs.critDMG });
            }
            if (memberBuffs.personalBuffs.defPen > 0) {
                totalDefPen += memberBuffs.personalBuffs.defPen;
                breakdown.defPen.push({ source: `(only ${characterName} A${member.advancement})`, value: memberBuffs.personalBuffs.defPen });
            }
        } else if (member.id === 'silverbaek') {
            console.log('❌ [DEBUG] Pas de personalBuffs trouvés pour Silver Mane Baek Yoonho');
        }

        // Ilhwan : buffs personnels de son arme (uniquement pour lui-même)
        if (member.id === 'ilhwan' && member.weaponAdvancement > 0) {
            const ilhwanWeaponBuffs = getCharacterBuffs('weapon_ilhwan', member.weaponAdvancement);
            if (ilhwanWeaponBuffs.critRate > 0) {
                totalCritRate += ilhwanWeaponBuffs.critRate;
                breakdown.critRate.push({ source: `(only Ilhwan weapon A${member.weaponAdvancement})`, value: ilhwanWeaponBuffs.critRate });
            }
            if (ilhwanWeaponBuffs.critDMG > 0) {
                totalCritDMG += ilhwanWeaponBuffs.critDMG;
                breakdown.critDMG.push({ source: `(only Ilhwan weapon A${member.weaponAdvancement})`, value: ilhwanWeaponBuffs.critDMG });
            }
            if (ilhwanWeaponBuffs.defPen > 0) {
                totalDefPen += ilhwanWeaponBuffs.defPen;
                breakdown.defPen.push({ source: `(only Ilhwan weapon A${member.weaponAdvancement})`, value: ilhwanWeaponBuffs.defPen });
            }
        }

        // Sian Halat : buffs personnels de son arme (uniquement pour lui-même)
        if (member.id === 'sian' && member.weaponAdvancement > 0) {
            const sianWeaponBuffs = getCharacterBuffs('weapon_sian', member.weaponAdvancement);
            if (sianWeaponBuffs.personalBuffs && sianWeaponBuffs.personalBuffs.defPen > 0) {
                totalDefPen += sianWeaponBuffs.personalBuffs.defPen;
                breakdown.defPen.push({ source: `(only Sian weapon A${member.weaponAdvancement})`, value: sianWeaponBuffs.personalBuffs.defPen });
            }
        }

        // Weapon Sian : Buff TEAM conditionnel Dark Damage (when boss has Dark Overload)
        // S'applique à tous les membres de la team de Sian
        const sianInTeam = member.teamId === 1
            ? team1.find(m => m && m.id === 'sian' && m.weaponAdvancement > 0)
            : member.teamId === 2
                ? team2.find(m => m && m.id === 'sian' && m.weaponAdvancement > 0)
                : null;

        if (sianInTeam) {
            const sianWeaponBuffs = getCharacterBuffs('weapon_sian', sianInTeam.weaponAdvancement);
            if (sianWeaponBuffs.conditionalBuff) {
                const darkDmgValue = sianWeaponBuffs.conditionalBuff.darkDamagePerStack * sianWeaponBuffs.conditionalBuff.maxStacks;
                totalDarkDamageOL += darkDmgValue;  // Ajouter à la stat conditionnelle OL
                breakdown.darkDamageOL.push({
                    source: `Crimson Shadow (Sian Weapon A${sianInTeam.weaponAdvancement}) - Scope: TEAM • ${sianWeaponBuffs.conditionalBuff.darkDamagePerStack}% × ${sianWeaponBuffs.conditionalBuff.maxStacks} stacks`,
                    value: darkDmgValue
                });
            }
        }

        // Minnie : buffs personnels de son arme (uniquement pour elle-même)
        if (member.id === 'minnie' && member.weaponAdvancement >= 0) {
            const minnieWeaponBuffs = getCharacterBuffs('weapon_minnie', member.weaponAdvancement);
            if (minnieWeaponBuffs.personalBuffs) {
                if (minnieWeaponBuffs.personalBuffs.critRate > 0) {
                    totalCritRate += minnieWeaponBuffs.personalBuffs.critRate;
                    breakdown.critRate.push({ source: `(only Minnie weapon A${member.weaponAdvancement})`, value: minnieWeaponBuffs.personalBuffs.critRate });
                }
                if (minnieWeaponBuffs.personalBuffs.critDMG > 0) {
                    totalCritDMG += minnieWeaponBuffs.personalBuffs.critDMG;
                    breakdown.critDMG.push({ source: `(only Minnie weapon A${member.weaponAdvancement})`, value: minnieWeaponBuffs.personalBuffs.critDMG });
                }
            }
        }

        // Son Kihoon : buffs personnels de son arme (uniquement pour lui-même)
        // +12% HP (A5) + team Dark DMG conditionnel (break trigger)
        if (member.id === 'son' && member.weaponAdvancement >= 0) {
            const sonWeaponBuffs = getCharacterBuffs('weapon_son', member.weaponAdvancement);
            if (sonWeaponBuffs.personalBuffs) {
                if (sonWeaponBuffs.personalBuffs.hp > 0) {
                    totalHP += sonWeaponBuffs.personalBuffs.hp;
                    breakdown.hp.push({ source: `⚔️ Son weapon A${member.weaponAdvancement}`, value: sonWeaponBuffs.personalBuffs.hp });
                }
            }
        }

        // 6. BUFFS CONDITIONNELS RAID (selon l'élément)
        // Lee Bora A2+ : +2% DCC par Dark hunter, appliqué à TOUT LE RAID (pas que Dark !)
        if (leeBoraA2InRaid) {
            const leeA2 = getCharacterBuffs('lee', 2);
            if (leeA2.conditionalBuff && leeA2.conditionalBuff.targetElement === 'Dark') {
                const raidDarkBonus = darkHunterCount * leeA2.conditionalBuff.critDMGPerAlly;
                totalCritDMG += raidDarkBonus;
                breakdown.critDMG.push({
                    source: `raid buff (Lee Bora) - ${darkHunterCount} Dark × ${leeA2.conditionalBuff.critDMGPerAlly}%`,
                    value: raidDarkBonus
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
                    source: `team buff Dark (Sian A5)`,
                    value: sianA5.teamBuffsDark.defPen
                });
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // 🔥 FIRE ELEMENT BUFFS
        // ═══════════════════════════════════════════════════════════════

        // Compter les Fire hunters dans le RAID
        const fireHunterCount = allMembers.filter(m => {
            const charData = characters[m.id];
            return charData && charData.element === 'Fire';
        }).length;

        // Esil A4+ : +4% Def Pen par allié Fire pour TOUT LE MONDE (Sung inclus!)
        const esilA4InRaid = allMembers.find(m => m.id === 'esil' && m.advancement >= 4);
        if (esilA4InRaid && fireHunterCount > 0) {
            const esilBuff = getCharacterBuffs('esil', esilA4InRaid.advancement);
            if (esilBuff.conditionalBuff && esilBuff.conditionalBuff.defPenPerAlly) {
                const fireDefPenBonus = fireHunterCount * esilBuff.conditionalBuff.defPenPerAlly;
                totalDefPen += fireDefPenBonus;
                breakdown.defPen.push({
                    source: `raid buff (Esil A${esilA4InRaid.advancement}) - ${fireHunterCount} Fire × ${esilBuff.conditionalBuff.defPenPerAlly}%`,
                    value: fireDefPenBonus
                });
            }
        }

        // Gina A4+ : Def Pen géré via characterAdvancedBuffs (teamBuffs section 8.2)
        // +4% Def Pen ALL team + +4% Def Pen Fire only (elementRestriction)

        // ═══════════════════════════════════════════════════════════════
        // 🔥 EMMA A0+ : +7.7% Def Pen team buff (uniquement sa team)
        // ═══════════════════════════════════════════════════════════════
        const emmaInTeam1 = team1.find(m => m && m.id === 'emma');
        const emmaInTeam2 = team2.find(m => m && m.id === 'emma');

        if (emmaInTeam1) {
            // Emma est dans Team1 - buff pour Team1 + Sung
            if (member.teamId === 0 || member.teamId === 1) {
                const emmaBuffs = getCharacterBuffs('emma', emmaInTeam1.advancement);
                if (emmaBuffs.teamBuff && emmaBuffs.teamBuff.defPen > 0) {
                    totalDefPen += emmaBuffs.teamBuff.defPen;
                    breakdown.defPen.push({
                        source: `team buff (Emma A${emmaInTeam1.advancement})`,
                        value: emmaBuffs.teamBuff.defPen
                    });
                }
            }
        } else if (emmaInTeam2) {
            // Emma est dans Team2 - buff uniquement Team2
            if (member.teamId === 2) {
                const emmaBuffs = getCharacterBuffs('emma', emmaInTeam2.advancement);
                if (emmaBuffs.teamBuff && emmaBuffs.teamBuff.defPen > 0) {
                    totalDefPen += emmaBuffs.teamBuff.defPen;
                    breakdown.defPen.push({
                        source: `team buff (Emma A${emmaInTeam2.advancement})`,
                        value: emmaBuffs.teamBuff.defPen
                    });
                }
            }
        }

        // Frieren A4 : +20% DCC team buff (uniquement sa team)
        const frierenInTeam1 = team1.find(m => m && m.id === 'frieren' && m.advancement >= 4);
        const frierenInTeam2 = team2.find(m => m && m.id === 'frieren' && m.advancement >= 4);

        if (frierenInTeam1) {
            // Frieren est dans Team1 - buff pour Team1 + Sung
            if (member.teamId === 0 || member.teamId === 1) {
                const frierenBuffs = getCharacterBuffs('frieren', frierenInTeam1.advancement);
                if (frierenBuffs.teamBuff && frierenBuffs.teamBuff.critDMG > 0) {
                    totalCritDMG += frierenBuffs.teamBuff.critDMG;
                    breakdown.critDMG.push({
                        source: `team buff (Frieren A${frierenInTeam1.advancement})`,
                        value: frierenBuffs.teamBuff.critDMG
                    });
                }
            }
        } else if (frierenInTeam2) {
            // Frieren est dans Team2 - buff uniquement Team2
            if (member.teamId === 2) {
                const frierenBuffs = getCharacterBuffs('frieren', frierenInTeam2.advancement);
                if (frierenBuffs.teamBuff && frierenBuffs.teamBuff.critDMG > 0) {
                    totalCritDMG += frierenBuffs.teamBuff.critDMG;
                    breakdown.critDMG.push({
                        source: `team buff (Frieren A${frierenInTeam2.advancement})`,
                        value: frierenBuffs.teamBuff.critDMG
                    });
                }
            }
        }

        // Frieren A5 : +15% TC RAID + 15% DCC RAID (tout le monde)
        const frierenA5InRaid = allMembers.find(m => m.id === 'frieren' && m.advancement >= 5);
        if (frierenA5InRaid) {
            const frierenA5Buffs = getCharacterBuffs('frieren', 5);
            if (frierenA5Buffs.critRate > 0) {
                totalCritRate += frierenA5Buffs.critRate;
                breakdown.critRate.push({
                    source: `raid buff (Frieren A5)`,
                    value: frierenA5Buffs.critRate
                });
            }
            if (frierenA5Buffs.critDMG > 0) {
                totalCritDMG += frierenA5Buffs.critDMG;
                breakdown.critDMG.push({
                    source: `raid buff (Frieren A5)`,
                    value: frierenA5Buffs.critDMG
                });
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // 🔥 STARK A3+ : Team buff basé sur sa Def Pen brute
        // ═══════════════════════════════════════════════════════════════
        const starkInTeam1 = team1.find(m => m && m.id === 'stark' && m.advancement >= 3);
        const starkInTeam2 = team2.find(m => m && m.id === 'stark' && m.advancement >= 3);

        if (starkInTeam1) {
            // Stark est dans Team1 - buff pour Team1 + Sung (sauf Stark lui-même)
            if ((member.teamId === 0 || member.teamId === 1) && member.id !== 'stark') {
                const starkBuffs = getCharacterBuffs('stark', starkInTeam1.advancement);
                if (starkBuffs.teamBuffFromRaw && starkInTeam1.rawStats && starkInTeam1.rawStats.defPen > 0) {
                    // Calcul: rawDefPen / (50000 + rawDefPen) * 20% = % bonus pour la team
                    const rawDefPen = starkInTeam1.rawStats.defPen;
                    const starkRawDefPenPercent = (rawDefPen / (50000 + rawDefPen)) * 100;
                    const teamDefPenBonus = starkRawDefPenPercent * (starkBuffs.teamBuffFromRaw.percentage / 100);
                    if (teamDefPenBonus > 0) {
                        totalDefPen += teamDefPenBonus;
                        breakdown.defPen.push({
                            source: `team buff (Stark A${starkInTeam1.advancement}) - 20% de ${starkRawDefPenPercent.toFixed(1)}% raw`,
                            value: teamDefPenBonus
                        });
                    }
                }
            }
        } else if (starkInTeam2) {
            // Stark est dans Team2 - buff uniquement Team2 (sauf Stark lui-même)
            if (member.teamId === 2 && member.id !== 'stark') {
                const starkBuffs = getCharacterBuffs('stark', starkInTeam2.advancement);
                if (starkBuffs.teamBuffFromRaw && starkInTeam2.rawStats && starkInTeam2.rawStats.defPen > 0) {
                    const rawDefPen = starkInTeam2.rawStats.defPen;
                    const starkRawDefPenPercent = (rawDefPen / (50000 + rawDefPen)) * 100;
                    const teamDefPenBonus = starkRawDefPenPercent * (starkBuffs.teamBuffFromRaw.percentage / 100);
                    if (teamDefPenBonus > 0) {
                        totalDefPen += teamDefPenBonus;
                        breakdown.defPen.push({
                            source: `team buff (Stark A${starkInTeam2.advancement}) - 20% de ${starkRawDefPenPercent.toFixed(1)}% raw`,
                            value: teamDefPenBonus
                        });
                    }
                }
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // ⚔️ SUNG WEAPON BUFFS (Ennio / Knight Killer)
        // ═══════════════════════════════════════════════════════════════
        if (member.id === 'jinwoo' && member.sungWeapon && member.sungWeapon !== 'none') {
            const weaponId = member.sungWeapon === 'ennio' ? 'weapon_sung_ennio' : 'weapon_sung_knightkiller';
            const sungWeaponBuffs = getCharacterBuffs(weaponId, member.weaponAdvancement || 0);
            if (sungWeaponBuffs.personalBuffs && sungWeaponBuffs.personalBuffs.defPen > 0) {
                totalDefPen += sungWeaponBuffs.personalBuffs.defPen;
                const weaponName = member.sungWeapon === 'ennio' ? "Ennio's Roar" : 'Knight Killer';
                breakdown.defPen.push({
                    source: `(only Sung ${weaponName} A${member.weaponAdvancement || 0})`,
                    value: sungWeaponBuffs.personalBuffs.defPen
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
            // Utiliser la nouvelle ou l'ancienne formule selon le paramètre
            const defPenPercent = useNewDefPenFormula
                ? parseFloat(newDefPenFormula.toPercent(member.rawStats.defPen, enemyLevel))
                : parseFloat(statConversionsWithEnemy.defPen.toPercent(member.rawStats.defPen, enemyLevel));
            totalDefPen += defPenPercent;
            breakdown.defPen.push({ source: `🔢 Valeurs Brutes (${member.rawStats.defPen.toLocaleString()} Def Pen)`, value: defPenPercent });
        }
        if (member.rawStats.damageIncrease > 0) {
            const diPercent = parseFloat(statConversionsWithEnemy.di.toPercent(member.rawStats.damageIncrease, enemyLevel));
            totalDamageIncrease += diPercent;
            breakdown.damageIncrease.push({ source: `🔢 Valeurs Brutes (${member.rawStats.damageIncrease.toLocaleString()} DI)`, value: diPercent });
        }

        // ═══════════════════════════════════════════════════════════════
        // 8. ADVANCED BUFFS (CHARACTER_ADVANCED_BUFFS)
        // ═══════════════════════════════════════════════════════════════

        // 8.1 BUFFS PERSONNELS (selfBuffs) du membre actuel
        if (CHARACTER_ADVANCED_BUFFS[member.id]) {
            const advKey = `A${member.advancement}`;
            const cumulativeData = getCumulativeBuffs(member.id, advKey);

            if (cumulativeData && cumulativeData.selfBuffs) {
                cumulativeData.selfBuffs.forEach(buff => {
                    const effects = buff.effects || {};
                    const characterName = member.name || member.id;
                    const buffName = buff.name;

                    // Timing info pour uptime (si cooldown défini)
                    const timingInfo = {};
                    if (buff.cooldown && typeof buff.duration === 'number') {
                        timingInfo.duration = buff.duration;
                        timingInfo.cooldown = buff.cooldown;
                        timingInfo.uptime = Math.round((buff.duration / buff.cooldown) * 100);
                    }

                    // Crit Rate (selfBuff)
                    if (effects.critRate) {
                        totalCritRate += effects.critRate;
                        breakdown.critRate.push({
                            source: `${characterName} - ${buffName}`,
                            value: effects.critRate,
                            ...timingInfo
                        });
                    }

                    // Crit DMG (selfBuff)
                    if (effects.critDMG) {
                        totalCritDMG += effects.critDMG;
                        breakdown.critDMG.push({
                            source: `${characterName} - ${buffName}`,
                            value: effects.critDMG,
                            ...timingInfo
                        });
                    }

                    // Dark Damage
                    if (effects.darkDamage) {
                        totalDarkDamage += effects.darkDamage;
                        breakdown.darkDamage.push({
                            source: `${buffName} (${characterName}) - Scope: PERSONAL`,
                            value: effects.darkDamage,
                            ...timingInfo
                        });
                    }

                    // Attack (ATK%)
                    if (effects.attack) {
                        totalAttack += effects.attack;
                        breakdown.attack.push({
                            source: `${characterName} - ${buffName}`,
                            value: effects.attack,
                            ...timingInfo
                        });
                    }

                    // HP% (pour hunters qui scale sur HP)
                    if (effects.hp) {
                        totalHP += effects.hp;
                        breakdown.hp.push({
                            source: `${characterName} - ${buffName}`,
                            value: effects.hp,
                            ...timingInfo
                        });
                    }

                    // Defense% (pour hunters qui scale sur DEF)
                    if (effects.defense) {
                        totalDefense += effects.defense;
                        breakdown.defense.push({
                            source: `${characterName} - ${buffName}`,
                            value: effects.defense,
                            ...timingInfo
                        });
                    }

                    // Dark Elemental Accumulation
                    if (effects.darkElementalAccumulation) {
                        totalDarkElementalAccumulation += effects.darkElementalAccumulation;
                        breakdown.darkElementalAccumulation.push({
                            source: `${characterName} - ${buffName}`,
                            value: effects.darkElementalAccumulation
                        });
                    }

                    // Basic Skill Damage (per stack ou direct)
                    if (effects.basicSkillDamagePerStack) {
                        const maxStacks = buff.maxStacks || 1;
                        const maxValue = effects.basicSkillDamagePerStack * maxStacks;
                        totalBasicSkillDamage += maxValue;
                        breakdown.basicSkillDamage.push({
                            source: `${buffName} (${characterName}) - ${effects.basicSkillDamagePerStack}% × ${maxStacks} stack${maxStacks > 1 ? 's' : ''}`,
                            value: maxValue
                        });
                    }

                    // Ultimate Skill Damage (per stack ou direct)
                    if (effects.ultimateSkillDamagePerStack) {
                        const maxStacks = buff.maxStacks || 1;
                        const maxValue = effects.ultimateSkillDamagePerStack * maxStacks;
                        totalUltimateSkillDamage += maxValue;
                        breakdown.ultimateSkillDamage.push({
                            source: `${buffName} (${characterName}) - ${effects.ultimateSkillDamagePerStack}% × ${maxStacks} stack${maxStacks > 1 ? 's' : ''}`,
                            value: maxValue
                        });
                    }

                    // 🔥 Fire Damage (selfBuff direct)
                    if (effects.fireDamage) {
                        totalFireDamage += effects.fireDamage;
                        breakdown.fireDamage.push({
                            source: `${buffName} (${characterName}) - Scope: PERSONAL`,
                            value: effects.fireDamage
                        });
                    }

                    // 🔥 Fire DMG per Fire Ally (selfBuff, ex: Kanae A4, YUQI A4)
                    if (effects.fireDamagePerFireAlly) {
                        const fireCount = allMembers.filter(m => {
                            const cd = characters[m.id];
                            return cd && cd.element === 'Fire';
                        }).length;
                        const maxAllies = buff.maxStacks || 3;
                        const count = Math.min(fireCount, maxAllies);
                        const totalValue = effects.fireDamagePerFireAlly * count;
                        totalFireDamage += totalValue;
                        breakdown.fireDamage.push({
                            source: `${buffName} (${characterName}) - ${count} Fire × ${effects.fireDamagePerFireAlly}%`,
                            value: totalValue
                        });
                    }

                    // 🔥 Damage Dealt % (general, ex: YUQI FOREVER)
                    if (effects.damageDealt) {
                        const maxStacks = buff.maxStacks || 1;
                        const totalValue = effects.damageDealt * maxStacks;
                        totalDamageDealt += totalValue;
                        breakdown.damageDealt.push({
                            source: `${buffName} (${characterName}) - ${maxStacks > 1 ? `${effects.damageDealt}% × ${maxStacks} stacks` : 'PERSONAL'}`,
                            value: totalValue,
                            ...timingInfo
                        });
                    }

                    // 🔥 Break Target DMG (selfBuff, ex: Afterglow)
                    if (effects.breakTargetDmg) {
                        totalBreakTargetDmg += effects.breakTargetDmg;
                        breakdown.breakTargetDmg.push({
                            source: `${buffName} (${characterName}) - Scope: PERSONAL`,
                            value: effects.breakTargetDmg
                        });
                    }

                    // 🔥🔥 Fire Elemental Accumulation (ex: Christopher Spiritual Body, Touchdown, A2)
                    if (effects.fireElementalAccumulation) {
                        const maxStacks = buff.maxStacks || 1;
                        const totalValue = effects.fireElementalAccumulation * maxStacks;
                        totalFireElementalAccumulation += totalValue;
                        breakdown.fireElementalAccumulation.push({
                            source: `${buffName} (${characterName}) - ${maxStacks > 1 ? `${effects.fireElementalAccumulation}% × ${maxStacks} stacks` : 'PERSONAL'}`,
                            value: totalValue
                        });
                    }

                    // 🔥🔥 Fire Overload DMG (ex: Christopher Touchdown)
                    if (effects.fireOverloadDamage) {
                        const maxStacks = buff.maxStacks || 1;
                        const totalValue = effects.fireOverloadDamage * maxStacks;
                        totalFireOverloadDamage += totalValue;
                        breakdown.fireOverloadDamage.push({
                            source: `${buffName} (${characterName}) - ${maxStacks > 1 ? `${effects.fireOverloadDamage}% × ${maxStacks} stacks` : 'PERSONAL'}`,
                            value: totalValue
                        });
                    }

                    // 💧 Water DMG (selfBuff, ex: Meri Memories of Winter, Seorin Water Synergy, Shuhua Performance)
                    if (effects.waterDamage || effects.waterDmg) {
                        const waterVal = effects.waterDamage || effects.waterDmg;
                        totalWaterDamage += waterVal;
                        breakdown.waterDamage.push({
                            source: `${buffName} (${characterName}) - Scope: PERSONAL`,
                            value: waterVal,
                            ...timingInfo
                        });
                    }

                    // 💧 Water Elemental Accumulation (selfBuff, ex: Meri Pengqueen Booster Mode)
                    if (effects.waterElementalAccumulation) {
                        totalWaterElementalAccumulation += effects.waterElementalAccumulation;
                        breakdown.waterElementalAccumulation.push({
                            source: `${buffName} (${characterName}) - Scope: PERSONAL`,
                            value: effects.waterElementalAccumulation,
                            ...timingInfo
                        });
                    }

                    // 💧 Water Overload DMG (selfBuff)
                    if (effects.waterOverloadDamage) {
                        totalWaterOverloadDamage += effects.waterOverloadDamage;
                        breakdown.waterOverloadDamage.push({
                            source: `${buffName} (${characterName}) - Scope: PERSONAL`,
                            value: effects.waterOverloadDamage,
                            ...timingInfo
                        });
                    }
                });
            }
        }

        // 8.2 TEAM BUFFS - Appliquer les buffs de team des autres membres de la même team
        const sameTeamMembers = member.teamId === 0
            ? [...team1.filter(m => m)] // Sung est team 0, reçoit buffs de team1
            : member.teamId === 1
                ? team1.filter(m => m)
                : team2.filter(m => m);

        sameTeamMembers.forEach(teamMember => {
            if (!teamMember || !CHARACTER_ADVANCED_BUFFS[teamMember.id]) return;

            const advKey = `A${teamMember.advancement}`;
            const cumulativeData = getCumulativeBuffs(teamMember.id, advKey);

            if (cumulativeData && cumulativeData.teamBuffs) {
                cumulativeData.teamBuffs.forEach(buff => {
                    const effects = buff.effects || {};
                    const characterName = teamMember.name || teamMember.id;
                    const buffName = buff.name;

                    // Skip buffs avec elementRestriction si le membre n'est pas de cet élément
                    if (buff.elementRestriction) {
                        const memberCharData = characters[member.id];
                        const memberElement = memberCharData ? memberCharData.element : null;
                        if (memberElement !== buff.elementRestriction) return;
                    }

                    // Damage vs Dark Overloaded
                    if (effects.damageVsDarkOverloaded) {
                        totalDamageVsDarkOverloaded += effects.damageVsDarkOverloaded;
                        breakdown.damageVsDarkOverloaded.push({
                            source: `${buffName} (${characterName}) - Scope: TEAM`,
                            value: effects.damageVsDarkOverloaded
                        });
                    }

                    // 🔥 Crit DMG from team buffs (ex: YUQI Afterglow)
                    if (effects.critDMG) {
                        totalCritDMG += effects.critDMG;
                        breakdown.critDMG.push({
                            source: `team buff (${characterName} - ${buffName})`,
                            value: effects.critDMG
                        });
                    }

                    // 🔥 Def Pen from team buffs
                    if (effects.defPen) {
                        totalDefPen += effects.defPen;
                        breakdown.defPen.push({
                            source: `team buff (${characterName} - ${buffName})`,
                            value: effects.defPen
                        });
                    }

                    // 🔥 ATK from team buffs
                    if (effects.attack) {
                        totalAttack += effects.attack;
                        breakdown.attack.push({
                            source: `team buff (${characterName} - ${buffName})`,
                            value: effects.attack
                        });
                    }

                    // 💧 Crit Rate from team buffs (ex: Meilin Pumped Up A5 +16% CR)
                    if (effects.critRate) {
                        totalCritRate += effects.critRate;
                        breakdown.critRate.push({
                            source: `team buff (${characterName} - ${buffName})`,
                            value: effects.critRate
                        });
                    }

                    // 💧 HP from team buffs (ex: Frieren A2 +9% HP, Seorin A3 Black Tea +20% HP)
                    if (effects.hp) {
                        totalHP += effects.hp;
                        breakdown.hp.push({
                            source: `team buff (${characterName} - ${buffName})`,
                            value: effects.hp
                        });
                    }

                    // 💧 DEF from team buffs (ex: Frieren A2 +9% DEF, Meilin Bye Meow +24% DEF, Seorin Black Tea +20% DEF)
                    if (effects.defense) {
                        totalDefense += effects.defense;
                        breakdown.defense.push({
                            source: `team buff (${characterName} - ${buffName})`,
                            value: effects.defense
                        });
                    }

                    // 💧 Water DMG from team buffs
                    if (effects.waterDamage || effects.waterDmg) {
                        const waterVal = effects.waterDamage || effects.waterDmg;
                        totalWaterDamage += waterVal;
                        breakdown.waterDamage.push({
                            source: `team buff (${characterName} - ${buffName})`,
                            value: waterVal
                        });
                    }

                    // 🔥 Fire DMG per Fire Ally (team buff, ex: YUQI A4, Kanae A4)
                    if (effects.fireDamagePerFireAlly) {
                        const fireCount = allMembers.filter(m => {
                            const cd = characters[m.id];
                            return cd && cd.element === 'Fire';
                        }).length;
                        const maxAllies = buff.maxStacks || 3;
                        const count = Math.min(fireCount, maxAllies);
                        const totalValue = effects.fireDamagePerFireAlly * count;
                        totalFireDamage += totalValue;
                        breakdown.fireDamage.push({
                            source: `team buff (${characterName} - ${buffName}) - ${count} Fire × ${effects.fireDamagePerFireAlly}%`,
                            value: totalValue
                        });
                    }

                    // 🔥 Damage Dealt % (team buff, ex: YUQI FOREVER)
                    if (effects.damageDealt) {
                        const maxStacks = buff.maxStacks || 1;
                        const totalValue = effects.damageDealt * maxStacks;
                        totalDamageDealt += totalValue;
                        breakdown.damageDealt.push({
                            source: `team buff (${characterName} - ${buffName}) - ${maxStacks > 1 ? `${effects.damageDealt}% × ${maxStacks} stacks` : 'TEAM'}`,
                            value: totalValue
                        });
                    }

                    // 🔥 Basic/Ult Skill DMG combined (ex: YUQI Afterglow)
                    if (effects.basicUltSkillDmg) {
                        totalBasicSkillDamage += effects.basicUltSkillDmg;
                        totalUltimateSkillDamage += effects.basicUltSkillDmg;
                        breakdown.basicSkillDamage.push({
                            source: `team buff (${characterName} - ${buffName})`,
                            value: effects.basicUltSkillDmg
                        });
                        breakdown.ultimateSkillDamage.push({
                            source: `team buff (${characterName} - ${buffName})`,
                            value: effects.basicUltSkillDmg
                        });
                    }

                    // 🔥 Break Target DMG (team buff, ex: YUQI Afterglow)
                    if (effects.breakTargetDmg) {
                        totalBreakTargetDmg += effects.breakTargetDmg;
                        breakdown.breakTargetDmg.push({
                            source: `team buff (${characterName} - ${buffName})`,
                            value: effects.breakTargetDmg
                        });
                    }
                });
            }
        });

        // 8.3 RAID BUFFS - Appliquer les buffs de raid de tous les membres du raid
        allMembers.forEach(raidMember => {
            if (!raidMember || !CHARACTER_ADVANCED_BUFFS[raidMember.id]) return;

            const advKey = `A${raidMember.advancement}`;
            const cumulativeData = getCumulativeBuffs(raidMember.id, advKey);

            if (cumulativeData && cumulativeData.raidBuffs) {
                cumulativeData.raidBuffs.forEach(buff => {
                    const effects = buff.effects || {};
                    const scope = buff.scope || 'raid';
                    const characterName = raidMember.name || raidMember.id;
                    const buffName = buff.name;

                    // Vérifier le scope (self, raid-dark, raid-fire, raid-water, team-dark, etc.)
                    // Scope self : le buff ne s'applique qu'au personnage qui le possède
                    if (scope === 'self' && raidMember.id !== member.id) return;

                    if (scope === 'raid-dark' && memberElement !== 'Dark') return;
                    if (scope === 'raid-fire' && memberElement !== 'Fire') return;
                    if (scope === 'raid-water' && memberElement !== 'Water') return;

                    // Scope team-dark : Applique uniquement aux Dark de la MÊME TEAM que le buffer
                    if (scope === 'team-dark') {
                        // Vérifier si le membre actuel est Dark
                        if (memberElement !== 'Dark') return;

                        // Vérifier si le raidMember (qui donne le buff) est dans la même team que member
                        // Utiliser le teamId qui a été défini lors de la création de allMembers (lignes 2929-2931)
                        const buffGiverTeam = raidMember.teamId;
                        const buffReceiverTeam = member.teamId;

                        // Si pas dans la même team, skip
                        if (buffGiverTeam !== buffReceiverTeam) return;
                    }

                    // 🔥 Scope team-fire : Applique uniquement aux Fire de la MÊME TEAM que le buffer
                    if (scope === 'team-fire') {
                        if (memberElement !== 'Fire') return;
                        const buffGiverTeam = raidMember.teamId;
                        const buffReceiverTeam = member.teamId;
                        if (buffGiverTeam !== buffReceiverTeam) return;
                    }

                    // 💧 Scope team-water : Applique uniquement aux Water de la MÊME TEAM que le buffer
                    if (scope === 'team-water') {
                        if (memberElement !== 'Water') return;
                        const buffGiverTeam = raidMember.teamId;
                        const buffReceiverTeam = member.teamId;
                        if (buffGiverTeam !== buffReceiverTeam) return;
                    }

                    // Dark Overload Damage
                    if (effects.darkOverloadDamage) {
                        totalDarkOverloadDamage += effects.darkOverloadDamage;
                        const scopeLabel = scope === 'raid-dark' ? 'RAID Dark' : scope === 'raid' ? 'RAID' : 'TEAM';
                        breakdown.darkOverloadDamage.push({
                            source: `${buffName} (${characterName}) - Scope: ${scopeLabel}`,
                            value: effects.darkOverloadDamage
                        });
                    }

                    // Def Pen from raid buffs (ex: Sian A5 Zenith Sword)
                    if (effects.defPen) {
                        totalDefPen += effects.defPen;
                        breakdown.defPen.push({
                            source: `raid buff (${characterName} - ${buffName})`,
                            value: effects.defPen
                        });
                    }

                    // Attack from raid buffs
                    if (effects.attack) {
                        totalAttack += effects.attack;
                        breakdown.attack.push({
                            source: `raid buff (${characterName} - ${buffName})`,
                            value: effects.attack
                        });
                    }

                    // HP% from raid buffs
                    if (effects.hp) {
                        totalHP += effects.hp;
                        breakdown.hp.push({
                            source: `raid buff (${characterName} - ${buffName})`,
                            value: effects.hp
                        });
                    }

                    // Defense% from raid buffs
                    if (effects.defense) {
                        totalDefense += effects.defense;
                        breakdown.defense.push({
                            source: `raid buff (${characterName} - ${buffName})`,
                            value: effects.defense
                        });
                    }

                    // Def Pen per Dark Ally (ex: Sian A5 passive)
                    if (effects.defPenPerDarkAlly) {
                        const darkCount = allMembers.filter(m => {
                            const charData = characters[m.id];
                            return charData && charData.element === 'Dark';
                        }).length;
                        const totalValue = effects.defPenPerDarkAlly * darkCount;
                        totalDefPen += totalValue;
                        breakdown.defPen.push({
                            source: `raid buff (${characterName} - ${buffName}) - ${darkCount} Dark × ${effects.defPenPerDarkAlly}%`,
                            value: totalValue
                        });
                    }

                    // Crit Rate from raid buffs
                    if (effects.critRate) {
                        totalCritRate += effects.critRate;
                        breakdown.critRate.push({
                            source: `raid buff (${characterName} - ${buffName})`,
                            value: effects.critRate
                        });
                    }

                    // 🔥 Crit DMG from raid buffs (ex: YUQI Afterglow)
                    if (effects.critDMG) {
                        totalCritDMG += effects.critDMG;
                        breakdown.critDMG.push({
                            source: `raid buff (${characterName} - ${buffName})`,
                            value: effects.critDMG
                        });
                    }

                    // 🔥 Basic/Ult Skill DMG from raid buffs (ex: YUQI Afterglow)
                    if (effects.basicUltSkillDmg) {
                        totalBasicSkillDamage += effects.basicUltSkillDmg;
                        totalUltimateSkillDamage += effects.basicUltSkillDmg;
                        breakdown.basicSkillDamage.push({
                            source: `raid buff (${characterName} - ${buffName})`,
                            value: effects.basicUltSkillDmg
                        });
                        breakdown.ultimateSkillDamage.push({
                            source: `raid buff (${characterName} - ${buffName})`,
                            value: effects.basicUltSkillDmg
                        });
                    }

                    // 🔥 Break Target DMG from raid buffs (ex: YUQI Afterglow)
                    if (effects.breakTargetDmg) {
                        totalBreakTargetDmg += effects.breakTargetDmg;
                        breakdown.breakTargetDmg.push({
                            source: `raid buff (${characterName} - ${buffName})`,
                            value: effects.breakTargetDmg
                        });
                    }

                    // 🔥 DMG Dealt from raid buffs (ex: Son Kihoon Strike Squad Leader A5)
                    if (effects.damageDealt) {
                        totalDamageDealt += effects.damageDealt;
                        breakdown.damageDealt.push({
                            source: `raid buff (${characterName} - ${buffName})`,
                            value: effects.damageDealt
                        });
                    }

                    // 💧 Water DMG from raid buffs
                    if (effects.waterDamage || effects.waterDmg) {
                        const waterVal = effects.waterDamage || effects.waterDmg;
                        totalWaterDamage += waterVal;
                        breakdown.waterDamage.push({
                            source: `raid buff (${characterName} - ${buffName})`,
                            value: waterVal
                        });
                    }
                });
            }
        });

        // 8.4 DEBUFFS SUR ENNEMIS - Calculer les debuffs max des membres de la team
        allMembers.forEach(raidMember => {
            if (!raidMember || !CHARACTER_ADVANCED_BUFFS[raidMember.id]) return;

            const advKey = `A${raidMember.advancement}`;
            const cumulativeData = getCumulativeBuffs(raidMember.id, advKey);

            if (cumulativeData && cumulativeData.debuffs) {
                cumulativeData.debuffs.forEach(debuff => {
                    const effects = debuff.effects || {};
                    const maxStacks = debuff.maxStacks || 1;
                    const characterName = raidMember.name || raidMember.id;
                    const debuffName = debuff.name;

                    // Dark Damage Taken (sur l'ennemi)
                    if (effects.darkDamageTaken) {
                        const maxValue = effects.darkDamageTaken * maxStacks;
                        totalDarkDamageTaken += maxValue;
                        breakdown.darkDamageTaken.push({
                            source: `${debuffName} (${characterName}) - Scope: Debuff Boss • ${effects.darkDamageTaken}% × ${maxStacks} stack${maxStacks > 1 ? 's' : ''}`,
                            value: maxValue
                        });
                    }

                    // Dark Overload Damage Taken (sur l'ennemi)
                    if (effects.darkOverloadDamageTaken) {
                        const maxValue = effects.darkOverloadDamageTaken * maxStacks;
                        totalDarkOverloadDamageTaken += maxValue;
                        breakdown.darkOverloadDamageTaken.push({
                            source: `${debuffName} (${characterName}) - Scope: Debuff Boss • ${effects.darkOverloadDamageTaken}% × ${maxStacks} stack${maxStacks > 1 ? 's' : ''}`,
                            value: maxValue
                        });
                    }

                    // 🔥 Fire Damage Taken (debuff sur l'ennemi, ex: YUQI Breakdown, Soohyun Magic Reaction)
                    if (effects.fireDamageTaken) {
                        const maxValue = effects.fireDamageTaken * maxStacks;
                        totalFireDamageTaken += maxValue;
                        breakdown.fireDamageTaken.push({
                            source: `${debuffName} (${characterName}) - Scope: Debuff Boss • ${effects.fireDamageTaken}% × ${maxStacks} stack${maxStacks > 1 ? 's' : ''}`,
                            value: maxValue
                        });
                    }

                    // 🔥 General Damage Taken (debuff sur l'ennemi, ex: YUQI Distortion/Breakdown)
                    if (effects.damageTaken) {
                        const maxValue = effects.damageTaken * maxStacks;
                        totalDamageTaken += maxValue;
                        breakdown.damageTaken.push({
                            source: `${debuffName} (${characterName}) - Scope: Debuff Boss • ${effects.damageTaken}% × ${maxStacks} stack${maxStacks > 1 ? 's' : ''}`,
                            value: maxValue
                        });
                    }

                    // 🌑 Crit Hit Chance Received (debuff ennemi = +TC pour le RAID, ex: Son Kihoon Broken Spirit A5)
                    if (effects.critHitChanceReceived) {
                        const maxValue = effects.critHitChanceReceived * maxStacks;
                        totalCritRate += maxValue;
                        breakdown.critRate.push({
                            source: `${debuffName} (${characterName}) - Scope: Debuff Boss • +${effects.critHitChanceReceived}% TC RAID`,
                            value: maxValue
                        });
                    }

                    // 🔥🔥 Fire Overload DMG Taken (debuff sur l'ennemi, ex: Christopher Blazing Shock A5)
                    if (effects.fireOverloadDamageTaken) {
                        const maxValue = effects.fireOverloadDamageTaken * maxStacks;
                        totalFireOverloadDamageTaken += maxValue;
                        breakdown.fireOverloadDamageTaken.push({
                            source: `${debuffName} (${characterName}) - Scope: Debuff Boss • ${effects.fireOverloadDamageTaken}% × ${maxStacks} stack${maxStacks > 1 ? 's' : ''}`,
                            value: maxValue
                        });
                    }

                    // 💧 Water DMG Taken (debuff sur l'ennemi, ex: Meilin Cuddle Puddle, Seorin Subzero, Shuhua Tension Drop, Meri Freezing Blood)
                    if (effects.waterDamageTaken || effects.waterDmgTaken) {
                        const waterDebuffVal = effects.waterDamageTaken || effects.waterDmgTaken;
                        const maxValue = waterDebuffVal * maxStacks;
                        totalWaterDamageTaken += maxValue;
                        breakdown.waterDamageTaken.push({
                            source: `${debuffName} (${characterName}) - Scope: Debuff Boss • ${waterDebuffVal}% × ${maxStacks} stack${maxStacks > 1 ? 's' : ''}`,
                            value: maxValue
                        });
                    }

                    // 💧 Water Overload DMG Taken (debuff sur l'ennemi, ex: Meri Freezing Blood)
                    if (effects.waterOverloadDamageTaken) {
                        const maxValue = effects.waterOverloadDamageTaken * maxStacks;
                        totalWaterOverloadDamageTaken += maxValue;
                        breakdown.waterOverloadDamageTaken.push({
                            source: `${debuffName} (${characterName}) - Scope: Debuff Boss • ${effects.waterOverloadDamageTaken}% × ${maxStacks} stack${maxStacks > 1 ? 's' : ''}`,
                            value: maxValue
                        });
                    }
                });
            }
        });

        return {
            ...member,
            element: memberElement,
            finalStats: {
                critRate: totalCritRate,
                critDMG: totalCritDMG + 50, // Ajouter le 50% de base pour l'affichage final
                defPen: totalDefPen,
                // Advanced stats
                darkDamage: totalDarkDamage,
                darkDamageOL: totalDarkDamageOL,  // Dark DMG conditionnel (During Overload)
                attack: totalAttack,
                hp: totalHP,  // HP% bonus
                defense: totalDefense,  // DEF% bonus
                darkElementalAccumulation: totalDarkElementalAccumulation,
                darkOverloadDamage: totalDarkOverloadDamage,
                damageVsDarkOverloaded: totalDamageVsDarkOverloaded,
                darkDamageTaken: totalDarkDamageTaken,
                darkOverloadDamageTaken: totalDarkOverloadDamageTaken,
                basicSkillDamage: totalBasicSkillDamage,  // Basic Skill DMG
                ultimateSkillDamage: totalUltimateSkillDamage,  // Ultimate Skill DMG
                // Fire stats
                fireDamage: totalFireDamage,
                fireDamageTaken: totalFireDamageTaken,
                damageDealt: totalDamageDealt,
                damageTaken: totalDamageTaken,
                breakTargetDmg: totalBreakTargetDmg,
                // Fire Overload stats
                fireElementalAccumulation: totalFireElementalAccumulation,
                fireOverloadDamage: totalFireOverloadDamage,
                fireOverloadDamageTaken: totalFireOverloadDamageTaken,
                // Water stats
                waterDamage: totalWaterDamage,
                waterDamageTaken: totalWaterDamageTaken,
                waterElementalAccumulation: totalWaterElementalAccumulation,
                waterOverloadDamage: totalWaterOverloadDamage,
                waterOverloadDamageTaken: totalWaterOverloadDamageTaken,
                // Damage Increase (raw stat conversion)
                damageIncrease: totalDamageIncrease
            },
            breakdown
        };
        });
};

// Labels des stats pour le résumé d'impact
const STAT_LABELS = {
    critRate: 'CR', critDMG: 'CritDMG', defPen: 'DefPen', attack: 'ATK', hp: 'HP', defense: 'DEF',
    darkDamage: 'Dark DMG', fireDamage: 'Fire DMG', fireDamageTaken: 'Fire DMG Taken',
    damageDealt: 'DMG Dealt', damageTaken: 'DMG Taken', breakTargetDmg: 'Break DMG',
    basicSkillDamage: 'Basic Skill', ultimateSkillDamage: 'Ult Skill',
    darkDamageTaken: 'Dark DMG Taken', darkOverloadDamage: 'OL DMG', darkOverloadDamageTaken: 'OL DMG Taken',
    darkElementalAccumulation: 'Elem Acc', fireElementalAccumulation: 'Fire Elem Acc',
    fireOverloadDamage: 'Fire OL DMG', fireOverloadDamageTaken: 'Fire OL DMG Taken',
    waterDamage: 'Water DMG', waterDamageTaken: 'Water DMG Taken',
    waterElementalAccumulation: 'Water Elem Acc', waterOverloadDamage: 'Water OL DMG',
    waterOverloadDamageTaken: 'Water OL DMG Taken',
    damageIncrease: 'DMG Increase',
};

// Composant: Affichage des stats individuelles par personnage
const IndividualStatsDisplay = ({ sungEnabled, sungData, team1, team2, enemyLevel, useNewDefPenFormula = true, sungBlessing = false, selectedEnemy = 'fachtna', onCharacterClick }) => {

    // === COMPARISON STATES ===
    const [compareSlot, setCompareSlot] = useState(null);
    const [compareCharacterId, setCompareCharacterId] = useState(null);
    const [compareElementFilter, setCompareElementFilter] = useState('all');

    // Calculer les stats avec useMemo
    const membersWithStats = useMemo(() => {
        return computeTeamStats(sungEnabled, sungData, team1, team2, enemyLevel, useNewDefPenFormula, sungBlessing);
    }, [sungEnabled, sungData, team1, team2, enemyLevel, useNewDefPenFormula, sungBlessing]);

    // === WHAT-IF CALCULATION ===
    const whatIfStats = useMemo(() => {
        if (!compareSlot || !compareCharacterId) return null;

        const charData = characters[compareCharacterId];
        if (!charData) return null;

        // Créer le perso de remplacement (A5, pas de sets, pas de raw stats)
        const replacementMember = {
            id: compareCharacterId,
            name: charData.name || compareCharacterId,
            element: charData.element || 'Unknown',
            image: charData.img || charData.icon || '',
            advancement: 5,
            weaponAdvancement: 5,
            leftSet: 'none', leftPieces: 0,
            rightSet: 'none', rightPieces: 0,
            coreAttackTC: true,
            rawStats: { critRate: 0, critDMG: 0, defPen: 0, damageIncrease: 0 },
            mainStatValue: 0,
        };

        // Cloner les teams avec le remplacement
        let modSungData = sungData ? { ...sungData } : null;
        let modTeam1 = [...team1];
        let modTeam2 = [...team2];

        if (compareSlot.teamId === 0) {
            modSungData = replacementMember;
        } else if (compareSlot.teamId === 1) {
            modTeam1 = [...team1];
            modTeam1[compareSlot.slotId] = replacementMember;
        } else if (compareSlot.teamId === 2) {
            modTeam2 = [...team2];
            modTeam2[compareSlot.slotId] = replacementMember;
        }

        return computeTeamStats(sungEnabled, modSungData, modTeam1, modTeam2, enemyLevel, useNewDefPenFormula, sungBlessing);
    }, [compareSlot, compareCharacterId, sungEnabled, sungData, team1, team2, enemyLevel, useNewDefPenFormula, sungBlessing]);

    // === DELTAS ===
    const memberDeltas = useMemo(() => {
        if (!whatIfStats || !membersWithStats) return null;

        const deltaMap = {};
        whatIfStats.forEach(whatIfMember => {
            const key = `${whatIfMember.teamId}-${whatIfMember.slotId}`;
            const original = membersWithStats.find(m => `${m.teamId}-${m.slotId}` === key);
            if (original) {
                const deltas = {};
                for (const statKey of Object.keys(original.finalStats)) {
                    deltas[statKey] = whatIfMember.finalStats[statKey] - original.finalStats[statKey];
                }
                deltaMap[key] = deltas;
            }
        });
        return deltaMap;
    }, [whatIfStats, membersWithStats]);

    // === AVAILABLE CHARACTERS FOR COMPARISON ===
    const availableForComparison = useMemo(() => {
        if (!compareSlot) return [];
        const usedIds = new Set();
        if (sungEnabled && sungData) usedIds.add(sungData.id);
        team1.forEach(m => { if (m) usedIds.add(m.id); });
        team2.forEach(m => { if (m) usedIds.add(m.id); });

        // Permettre le perso remplacé (il est "retiré" dans le what-if)
        const replacedMember = compareSlot.teamId === 0 ? sungData
            : compareSlot.teamId === 1 ? team1[compareSlot.slotId]
            : team2[compareSlot.slotId];
        if (replacedMember) usedIds.delete(replacedMember.id);

        return Object.entries(characters)
            .filter(([id]) => id !== '' && !usedIds.has(id))
            .map(([id, data]) => ({
                id,
                name: data.name || id,
                element: data.element || 'Unknown',
                image: data.img || data.icon || '',
            }))
            .filter(c => compareElementFilter === 'all' || c.element === compareElementFilter);
    }, [compareSlot, sungEnabled, sungData, team1, team2, compareElementFilter]);

    // Handler pour le bouton compare
    const handleCompare = (teamId, slotId) => {
        if (teamId === null) {
            // Fermer la comparaison
            setCompareSlot(null);
            setCompareCharacterId(null);
        } else if (compareSlot?.teamId === teamId && compareSlot?.slotId === slotId) {
            // Toggle off si même slot
            setCompareSlot(null);
            setCompareCharacterId(null);
        } else {
            // Ouvrir picker pour ce slot
            setCompareSlot({ teamId, slotId });
            setCompareCharacterId(null);
        }
    };

    // Si aucun personnage, afficher un message
    if (membersWithStats.length === 0) {
        return (
            <div className="text-center text-gray-500 py-8">
                Aucun personnage dans la composition. Ajoutez des personnages pour voir leurs stats.
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {membersWithStats.map((member, idx) => {
                    const key = `${member.teamId}-${member.slotId}`;
                    const isComparing = compareSlot && compareSlot.teamId === member.teamId && compareSlot.slotId === member.slotId;
                    const whatIfMember = isComparing && whatIfStats
                        ? whatIfStats.find(m => m.teamId === member.teamId && m.slotId === member.slotId)
                        : null;
                    // Breakdown what-if pour TOUS les membres (pas juste le comparé)
                    const whatIfForThisMember = whatIfStats
                        ? whatIfStats.find(m => m.teamId === member.teamId && m.slotId === member.slotId)
                        : null;
                    return (
                        <IndividualCharacterStatCard
                            key={`${key}-${idx}`}
                            member={member}
                            onClick={() => onCharacterClick && onCharacterClick(member.teamId, member.slotId)}
                            onCompare={handleCompare}
                            isComparing={isComparing}
                            whatIfMember={whatIfMember}
                            deltas={memberDeltas ? memberDeltas[key] : null}
                            compareActive={!!compareCharacterId}
                            whatIfBreakdown={whatIfForThisMember?.breakdown || null}
                        />
                    );
                })}
            </div>

            {/* Modal picker pour la comparaison */}
            {compareSlot && !compareCharacterId && (
                <CharacterSelectionModal
                    characters={availableForComparison}
                    elementFilter={compareElementFilter}
                    onElementChange={setCompareElementFilter}
                    onSelect={(char) => setCompareCharacterId(char.id)}
                    onClose={() => { setCompareSlot(null); setCompareCharacterId(null); }}
                    elements={['all', 'Fire', 'Water', 'Wind', 'Light', 'Dark']}
                />
            )}
        </>
    );
};

// Composant: Carte de stats individuelles d'un personnage
const IndividualCharacterStatCard = ({ member, onClick, onCompare, isComparing, whatIfMember, deltas, compareActive, whatIfBreakdown }) => {
    const hasOptimizationData = CHARACTER_OPTIMIZATION[member.id];
    const benchmark = hasOptimizationData ? getCurrentBenchmark(member.id, member.finalStats) : null;
    const overall = hasOptimizationData ? getOverallOptimization(member.id, member.finalStats) : null;

    return (
        <div
            className={`bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border cursor-pointer hover:bg-gray-700/50 transition-all ${
                isComparing && whatIfMember ? 'border-amber-500/70 ring-1 ring-amber-500/30' : 'border-purple-700/50 hover:border-purple-500'
            }`}
            onClick={onClick}
        >
            {/* Bannière What-If */}
            {isComparing && whatIfMember && (
                <div className="mb-3 px-3 py-2 bg-amber-900/30 border border-amber-500/30 rounded-lg text-sm text-amber-300 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span>vs</span>
                        {whatIfMember.image && <img src={whatIfMember.image} alt="" className="w-5 h-5 rounded object-cover" />}
                        <span className="font-semibold">{whatIfMember.name}</span>
                        <span>{getElementEmoji(whatIfMember.element)}</span>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onCompare(null, null); }}
                        className="text-gray-400 hover:text-white transition-colors p-0.5"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
            )}

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
                {/* Bouton Compare */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onCompare(member.teamId, member.slotId);
                    }}
                    className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${
                        isComparing
                            ? 'bg-amber-600/50 text-amber-300 hover:bg-amber-600/70'
                            : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-white'
                    }`}
                    title="Comparer avec un autre personnage"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3L4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg>
                </button>
            </div>

            {/* Stats avec breakdown au hover + indicateurs d'optimisation */}
            {/* SECTION 1 - Stats permanentes (toujours actives) */}
            <div className="space-y-2">
                <StatWithBreakdown
                    label="CR"
                    value={member.finalStats.critRate}
                    breakdown={member.breakdown.critRate}
                    color="text-yellow-400"
                    icon="🎯"
                    characterId={member.id}
                    statName="critRate"
                    delta={deltas?.critRate}
                    whatIfBreakdown={whatIfBreakdown?.critRate}
                />
                <StatWithBreakdown
                    label="CritDMG"
                    value={member.finalStats.critDMG}
                    breakdown={member.breakdown.critDMG}
                    color="text-red-400"
                    icon="⚔️"
                    hasBaseValue={true}
                    characterId={member.id}
                    statName="critDMG"
                    delta={deltas?.critDMG}
                    whatIfBreakdown={whatIfBreakdown?.critDMG}
                />
                <StatWithBreakdown
                    label="Def Pen"
                    value={member.finalStats.defPen}
                    breakdown={member.breakdown.defPen}
                    color="text-blue-400"
                    icon="🛡️"
                    characterId={member.id}
                    statName="defPen"
                    delta={deltas?.defPen}
                    whatIfBreakdown={whatIfBreakdown?.defPen}
                />

                {/* Afficher ATK, HP ou DEF selon le scaleStat du personnage */}
                {(() => {
                    const charAdvData = CHARACTER_ADVANCED_BUFFS[member.id];
                    const scaleStat = charAdvData?.scaleStat || 'ATK'; // Par défaut ATK

                    if (scaleStat === 'HP' && (member.finalStats.hp > 0 || Math.abs(deltas?.hp || 0) > 0.05)) {
                        return (
                            <StatWithBreakdown
                                label="HP"
                                value={member.finalStats.hp}
                                breakdown={member.breakdown.hp}
                                color="text-green-400"
                                icon="💚"
                                delta={deltas?.hp}
                                whatIfBreakdown={whatIfBreakdown?.hp}
                            />
                        );
                    } else if (scaleStat === 'DEF' && (member.finalStats.defense > 0 || Math.abs(deltas?.defense || 0) > 0.05)) {
                        return (
                            <StatWithBreakdown
                                label="DEF"
                                value={member.finalStats.defense}
                                breakdown={member.breakdown.defense}
                                color="text-cyan-400"
                                icon="🛡️"
                                delta={deltas?.defense}
                                whatIfBreakdown={whatIfBreakdown?.defense}
                            />
                        );
                    } else if (scaleStat === 'ATK' && (member.finalStats.attack > 0 || Math.abs(deltas?.attack || 0) > 0.05)) {
                        return (
                            <StatWithBreakdown
                                label="ATK"
                                value={member.finalStats.attack}
                                breakdown={member.breakdown.attack}
                                color="text-orange-400"
                                icon="⚡"
                                delta={deltas?.attack}
                                whatIfBreakdown={whatIfBreakdown?.attack}
                            />
                        );
                    }
                    return null;
                })()}

                {(member.finalStats.darkElementalAccumulation > 0 || Math.abs(deltas?.darkElementalAccumulation || 0) > 0.05) && (
                    <StatWithBreakdown
                        label="Elem Acc"
                        value={member.finalStats.darkElementalAccumulation}
                        breakdown={member.breakdown.darkElementalAccumulation}
                        color="text-indigo-400"
                        icon="🔮"
                        delta={deltas?.darkElementalAccumulation}
                        whatIfBreakdown={whatIfBreakdown?.darkElementalAccumulation}
                    />
                )}

                {(member.finalStats.darkDamage > 0 || Math.abs(deltas?.darkDamage || 0) > 0.05) && (
                    <StatWithBreakdown
                        label="Dark DMG"
                        value={member.finalStats.darkDamage}
                        breakdown={member.breakdown.darkDamage}
                        color="text-purple-400"
                        icon="🌑"
                        delta={deltas?.darkDamage}
                        whatIfBreakdown={whatIfBreakdown?.darkDamage}
                    />
                )}

                {(member.finalStats.darkDamageTaken > 0 || Math.abs(deltas?.darkDamageTaken || 0) > 0.05) && (
                    <StatWithBreakdown
                        label="Dark DMG Taken"
                        value={member.finalStats.darkDamageTaken}
                        breakdown={member.breakdown.darkDamageTaken}
                        color="text-pink-400"
                        icon="💔"
                        delta={deltas?.darkDamageTaken}
                        whatIfBreakdown={whatIfBreakdown?.darkDamageTaken}
                    />
                )}

                {/* Fire DMG */}
                {(member.finalStats.fireDamage > 0 || Math.abs(deltas?.fireDamage || 0) > 0.05) && (
                    <StatWithBreakdown
                        label="Fire DMG"
                        value={member.finalStats.fireDamage}
                        breakdown={member.breakdown.fireDamage}
                        color="text-orange-400"
                        icon="🔥"
                        delta={deltas?.fireDamage}
                        whatIfBreakdown={whatIfBreakdown?.fireDamage}
                    />
                )}

                {/* Fire DMG Taken (debuff sur ennemi) */}
                {(member.finalStats.fireDamageTaken > 0 || Math.abs(deltas?.fireDamageTaken || 0) > 0.05) && (
                    <StatWithBreakdown
                        label="Fire DMG Taken"
                        value={member.finalStats.fireDamageTaken}
                        breakdown={member.breakdown.fireDamageTaken}
                        color="text-pink-400"
                        icon="💔"
                        delta={deltas?.fireDamageTaken}
                        whatIfBreakdown={whatIfBreakdown?.fireDamageTaken}
                    />
                )}

                {/* Water DMG */}
                {(member.finalStats.waterDamage > 0 || Math.abs(deltas?.waterDamage || 0) > 0.05) && (
                    <StatWithBreakdown
                        label="Water DMG"
                        value={member.finalStats.waterDamage}
                        breakdown={member.breakdown.waterDamage}
                        color="text-cyan-400"
                        icon="💧"
                        delta={deltas?.waterDamage}
                        whatIfBreakdown={whatIfBreakdown?.waterDamage}
                    />
                )}

                {/* Water DMG Taken (debuff sur ennemi) */}
                {(member.finalStats.waterDamageTaken > 0 || Math.abs(deltas?.waterDamageTaken || 0) > 0.05) && (
                    <StatWithBreakdown
                        label="Water DMG Taken"
                        value={member.finalStats.waterDamageTaken}
                        breakdown={member.breakdown.waterDamageTaken}
                        color="text-blue-400"
                        icon="💧"
                        delta={deltas?.waterDamageTaken}
                        whatIfBreakdown={whatIfBreakdown?.waterDamageTaken}
                    />
                )}

                {/* DMG Dealt % */}
                {(member.finalStats.damageDealt > 0 || Math.abs(deltas?.damageDealt || 0) > 0.05) && (
                    <StatWithBreakdown
                        label="DMG Dealt"
                        value={member.finalStats.damageDealt}
                        breakdown={member.breakdown.damageDealt}
                        color="text-green-400"
                        icon="💥"
                        delta={deltas?.damageDealt}
                        whatIfBreakdown={whatIfBreakdown?.damageDealt}
                    />
                )}

                {/* DMG Increase (Ant Queen only) */}
                {(member.finalStats.damageIncrease > 0 || Math.abs(deltas?.damageIncrease || 0) > 0.05) && (
                    <StatWithBreakdown
                        label="DMG Increase"
                        value={member.finalStats.damageIncrease}
                        breakdown={member.breakdown.damageIncrease}
                        color="text-amber-400"
                        icon="⚡"
                        delta={deltas?.damageIncrease}
                        whatIfBreakdown={whatIfBreakdown?.damageIncrease}
                    />
                )}

                {/* DMG Taken (debuff général sur ennemi) */}
                {(member.finalStats.damageTaken > 0 || Math.abs(deltas?.damageTaken || 0) > 0.05) && (
                    <StatWithBreakdown
                        label="DMG Taken"
                        value={member.finalStats.damageTaken}
                        breakdown={member.breakdown.damageTaken}
                        color="text-rose-400"
                        icon="💢"
                        delta={deltas?.damageTaken}
                        whatIfBreakdown={whatIfBreakdown?.damageTaken}
                    />
                )}

                {/* Break Target DMG */}
                {(member.finalStats.breakTargetDmg > 0 || Math.abs(deltas?.breakTargetDmg || 0) > 0.05) && (
                    <StatWithBreakdown
                        label="DMG vs Break"
                        value={member.finalStats.breakTargetDmg}
                        breakdown={member.breakdown.breakTargetDmg}
                        color="text-teal-400"
                        icon="💎"
                        delta={deltas?.breakTargetDmg}
                        whatIfBreakdown={whatIfBreakdown?.breakTargetDmg}
                    />
                )}

                {/* Basic Skill DMG */}
                {(member.finalStats.basicSkillDamage > 0 || Math.abs(deltas?.basicSkillDamage || 0) > 0.05) && (
                    <StatWithBreakdown
                        label="Basic Skill DMG"
                        value={member.finalStats.basicSkillDamage}
                        breakdown={member.breakdown.basicSkillDamage}
                        color="text-cyan-400"
                        icon="🎯"
                        delta={deltas?.basicSkillDamage}
                        whatIfBreakdown={whatIfBreakdown?.basicSkillDamage}
                    />
                )}

                {/* Ultimate Skill DMG */}
                {(member.finalStats.ultimateSkillDamage > 0 || Math.abs(deltas?.ultimateSkillDamage || 0) > 0.05) && (
                    <StatWithBreakdown
                        label="Ultimate Skill DMG"
                        value={member.finalStats.ultimateSkillDamage}
                        breakdown={member.breakdown.ultimateSkillDamage}
                        color="text-amber-400"
                        icon="💫"
                        delta={deltas?.ultimateSkillDamage}
                        whatIfBreakdown={whatIfBreakdown?.ultimateSkillDamage}
                    />
                )}
            </div>

            {/* SECTION 2 - During Overload (stats conditionnelles OL) */}
            {(member.finalStats.darkDamageOL > 0 || member.finalStats.darkOverloadDamage > 0 || member.finalStats.damageVsDarkOverloaded > 0 || member.finalStats.darkOverloadDamageTaken > 0
                || Math.abs(deltas?.darkDamageOL || 0) > 0.05 || Math.abs(deltas?.darkOverloadDamage || 0) > 0.05 || Math.abs(deltas?.darkOverloadDamageTaken || 0) > 0.05
            ) && (
                <div className="mt-3 pt-3 border-t border-purple-500/30">
                    <div className="text-xs text-purple-400 font-semibold mb-2 flex items-center gap-1">
                        <span>⚡</span>
                        <span>During Overload</span>
                    </div>
                    <div className="space-y-2">
                        {(member.finalStats.darkDamageOL > 0 || Math.abs(deltas?.darkDamageOL || 0) > 0.05) && (
                            <StatWithBreakdown
                                label="Dark DMG (OL)"
                                value={member.finalStats.darkDamageOL}
                                breakdown={member.breakdown.darkDamageOL}
                                color="text-purple-400"
                                icon="🌑"
                                delta={deltas?.darkDamageOL}
                                whatIfBreakdown={whatIfBreakdown?.darkDamageOL}
                            />
                        )}

                        {(member.finalStats.darkOverloadDamage > 0 || member.finalStats.damageVsDarkOverloaded > 0 || (deltas && Math.abs((deltas.darkOverloadDamage || 0) + (deltas.damageVsDarkOverloaded || 0)) > 0.05)) && (
                            <StatWithBreakdown
                                label="DMG (OL)"
                                value={(member.finalStats.darkOverloadDamage || 0) + (member.finalStats.damageVsDarkOverloaded || 0)}
                                breakdown={[
                                    ...(member.breakdown.darkOverloadDamage || []),
                                    ...(member.breakdown.damageVsDarkOverloaded || [])
                                ]}
                                color="text-violet-400"
                                icon="💥"
                                delta={deltas ? ((deltas.darkOverloadDamage || 0) + (deltas.damageVsDarkOverloaded || 0)) : undefined}
                                whatIfBreakdown={whatIfBreakdown ? [
                                    ...(whatIfBreakdown.darkOverloadDamage || []),
                                    ...(whatIfBreakdown.damageVsDarkOverloaded || [])
                                ] : null}
                            />
                        )}

                        {(member.finalStats.darkOverloadDamageTaken > 0 || Math.abs(deltas?.darkOverloadDamageTaken || 0) > 0.05) && (
                            <StatWithBreakdown
                                label="Overload DMG Taken (OL)"
                                value={member.finalStats.darkOverloadDamageTaken}
                                breakdown={member.breakdown.darkOverloadDamageTaken}
                                color="text-rose-400"
                                icon="💢"
                                delta={deltas?.darkOverloadDamageTaken}
                                whatIfBreakdown={whatIfBreakdown?.darkOverloadDamageTaken}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* SECTION 3 - During Fire Overload (stats conditionnelles Fire OL) */}
            {(member.finalStats.fireElementalAccumulation > 0 || member.finalStats.fireOverloadDamage > 0 || member.finalStats.fireOverloadDamageTaken > 0
                || Math.abs(deltas?.fireElementalAccumulation || 0) > 0.05 || Math.abs(deltas?.fireOverloadDamage || 0) > 0.05 || Math.abs(deltas?.fireOverloadDamageTaken || 0) > 0.05
            ) && (
                <div className="mt-3 pt-3 border-t border-orange-500/30">
                    <div className="text-xs text-orange-400 font-semibold mb-2 flex items-center gap-1">
                        <span>🔥</span>
                        <span>During Fire Overload</span>
                    </div>
                    <div className="space-y-2">
                        {(member.finalStats.fireElementalAccumulation > 0 || Math.abs(deltas?.fireElementalAccumulation || 0) > 0.05) && (
                            <StatWithBreakdown
                                label="Fire Elem Acc"
                                value={member.finalStats.fireElementalAccumulation}
                                breakdown={member.breakdown.fireElementalAccumulation}
                                color="text-orange-300"
                                icon="🔮"
                                delta={deltas?.fireElementalAccumulation}
                                whatIfBreakdown={whatIfBreakdown?.fireElementalAccumulation}
                            />
                        )}

                        {(member.finalStats.fireOverloadDamage > 0 || Math.abs(deltas?.fireOverloadDamage || 0) > 0.05) && (
                            <StatWithBreakdown
                                label="Fire OL DMG"
                                value={member.finalStats.fireOverloadDamage}
                                breakdown={member.breakdown.fireOverloadDamage}
                                color="text-orange-400"
                                icon="💥"
                                delta={deltas?.fireOverloadDamage}
                                whatIfBreakdown={whatIfBreakdown?.fireOverloadDamage}
                            />
                        )}

                        {(member.finalStats.fireOverloadDamageTaken > 0 || Math.abs(deltas?.fireOverloadDamageTaken || 0) > 0.05) && (
                            <StatWithBreakdown
                                label="Fire OL DMG Taken"
                                value={member.finalStats.fireOverloadDamageTaken}
                                breakdown={member.breakdown.fireOverloadDamageTaken}
                                color="text-rose-400"
                                icon="💢"
                                delta={deltas?.fireOverloadDamageTaken}
                                whatIfBreakdown={whatIfBreakdown?.fireOverloadDamageTaken}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* SECTION 4 - During Water Overload (stats conditionnelles Water OL) */}
            {(member.finalStats.waterElementalAccumulation > 0 || member.finalStats.waterOverloadDamage > 0 || member.finalStats.waterOverloadDamageTaken > 0
                || Math.abs(deltas?.waterElementalAccumulation || 0) > 0.05 || Math.abs(deltas?.waterOverloadDamage || 0) > 0.05 || Math.abs(deltas?.waterOverloadDamageTaken || 0) > 0.05
            ) && (
                <div className="mt-3 pt-3 border-t border-cyan-500/30">
                    <div className="text-xs text-cyan-400 font-semibold mb-2 flex items-center gap-1">
                        <span>💧</span>
                        <span>During Water Overload</span>
                    </div>
                    <div className="space-y-2">
                        {(member.finalStats.waterElementalAccumulation > 0 || Math.abs(deltas?.waterElementalAccumulation || 0) > 0.05) && (
                            <StatWithBreakdown
                                label="Water Elem Acc"
                                value={member.finalStats.waterElementalAccumulation}
                                breakdown={member.breakdown.waterElementalAccumulation}
                                color="text-cyan-300"
                                icon="🔮"
                                delta={deltas?.waterElementalAccumulation}
                                whatIfBreakdown={whatIfBreakdown?.waterElementalAccumulation}
                            />
                        )}

                        {(member.finalStats.waterOverloadDamage > 0 || Math.abs(deltas?.waterOverloadDamage || 0) > 0.05) && (
                            <StatWithBreakdown
                                label="Water OL DMG"
                                value={member.finalStats.waterOverloadDamage}
                                breakdown={member.breakdown.waterOverloadDamage}
                                color="text-cyan-400"
                                icon="💥"
                                delta={deltas?.waterOverloadDamage}
                                whatIfBreakdown={whatIfBreakdown?.waterOverloadDamage}
                            />
                        )}

                        {(member.finalStats.waterOverloadDamageTaken > 0 || Math.abs(deltas?.waterOverloadDamageTaken || 0) > 0.05) && (
                            <StatWithBreakdown
                                label="Water OL DMG Taken"
                                value={member.finalStats.waterOverloadDamageTaken}
                                breakdown={member.breakdown.waterOverloadDamageTaken}
                                color="text-blue-400"
                                icon="💢"
                                delta={deltas?.waterOverloadDamageTaken}
                                whatIfBreakdown={whatIfBreakdown?.waterOverloadDamageTaken}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Carte d'optimisation (si données disponibles) */}
            {hasOptimizationData && overall && (
                <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <OptimizationCard characterId={member.id} stats={member.finalStats} compact={false} />
                </div>
            )}

            {/* Résumé d'impact What-If (pour les cartes non-comparées mais affectées) */}
            {deltas && compareActive && !isComparing && (() => {
                const changedStats = Object.entries(deltas)
                    .filter(([key, v]) => Math.abs(v) > 0.05 && STAT_LABELS[key])
                    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
                if (changedStats.length === 0) return null;
                return (
                    <div className="mt-3 pt-3 border-t border-amber-500/20">
                        <div className="text-xs text-amber-400/80 font-semibold mb-1">Impact du swap :</div>
                        <div className="flex flex-wrap gap-1">
                            {changedStats.map(([key, v]) => (
                                <span key={key} className={`text-xs px-1.5 py-0.5 rounded ${v > 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                    {STAT_LABELS[key]} {v > 0 ? '+' : ''}{v.toFixed(1)}%
                                </span>
                            ))}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

// Composant: Stat avec breakdown détaillé au hover
const StatWithBreakdown = ({ label, value, breakdown, color, icon, hasBaseValue = false, characterId, statName, delta, whatIfBreakdown }) => {
    const hasOptimData = characterId && statName && CHARACTER_OPTIMIZATION[characterId];
    const optimStatus = hasOptimData ? getOptimizationStatus(characterId, statName, value) : null;
    const sweetSpot = hasOptimData ? CHARACTER_OPTIMIZATION[characterId]?.sweetSpots?.[statName] : null;
    const showDelta = delta !== undefined && delta !== null && Math.abs(delta) > 0.05;

    // Calculer les changements entre breakdown actuel et what-if
    const changes = (showDelta && whatIfBreakdown && breakdown) ? (() => {
        const currentMap = new Map();
        breakdown.forEach(b => currentMap.set(b.source, b.value));
        const whatIfMap = new Map();
        whatIfBreakdown.forEach(b => whatIfMap.set(b.source, b.value));

        const removed = []; // Sources perdues
        const added = [];   // Sources gagnées
        const changed = [];  // Sources modifiées

        currentMap.forEach((val, src) => {
            if (!whatIfMap.has(src)) {
                removed.push({ source: src, value: val });
            } else if (Math.abs(whatIfMap.get(src) - val) > 0.05) {
                changed.push({ source: src, oldValue: val, newValue: whatIfMap.get(src) });
            }
        });
        whatIfMap.forEach((val, src) => {
            if (!currentMap.has(src)) {
                added.push({ source: src, value: val });
            }
        });
        return (removed.length > 0 || added.length > 0 || changed.length > 0) ? { removed, added, changed } : null;
    })() : null;

    return (
        <div className="group relative">
            <div className={`flex items-center justify-between text-sm py-1 px-2 rounded transition-colors cursor-help ${
                showDelta ? (delta > 0 ? 'bg-green-900/15 hover:bg-green-900/25' : 'bg-red-900/15 hover:bg-red-900/25') : 'bg-gray-900/30 hover:bg-gray-900/50'
            }`}>
                <span className="text-gray-400 flex items-center gap-1">
                    <span className="text-xs">{icon}</span>
                    <span>{label}:</span>
                </span>
                <div className="flex items-center gap-2">
                    <span className={`font-bold ${color}`}>
                        {value.toFixed(1)}%
                    </span>
                    {/* Delta indicator */}
                    {showDelta && (
                        <span className={`text-xs font-bold px-1 py-0.5 rounded ${
                            delta > 0 ? 'text-green-400 bg-green-900/30' : 'text-red-400 bg-red-900/30'
                        }`}>
                            {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
                        </span>
                    )}
                    {/* Indicateur d'optimisation inline */}
                    {optimStatus && !showDelta && (
                        <span
                            className="inline-block w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: optimStatus.color }}
                            title={`${optimStatus.message} - Idéal: ${sweetSpot?.ideal}%`}
                        />
                    )}
                </div>
            </div>

            {/* Tooltip au hover */}
            {((breakdown && breakdown.length > 0) || changes) && (
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
                                <div key={idx}>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300">{buff.source}</span>
                                        <span className={`font-semibold ${color}`}>+{buff.value.toFixed(1)}%</span>
                                    </div>
                                    {buff.uptime && (
                                        <div className={`text-[10px] ml-2 flex items-center gap-1 ${
                                            buff.uptime >= 75 ? 'text-green-400' : buff.uptime >= 50 ? 'text-yellow-400' : 'text-red-400'
                                        }`}>
                                            ⏱ {buff.duration}s / {buff.cooldown}s CD → Uptime: {buff.uptime}%
                                        </div>
                                    )}
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
                        {/* Section What-If : changements détaillés */}
                        {changes && (
                            <div className="mt-2 pt-2 border-t border-amber-500/30">
                                <div className="text-xs font-bold mb-1.5 text-amber-400 flex items-center gap-1">
                                    <span>🔄</span> Changements si swap
                                </div>
                                <div className="space-y-1 text-xs">
                                    {changes.removed.map((item, idx) => (
                                        <div key={`rm-${idx}`} className="flex justify-between items-center text-red-400">
                                            <span className="truncate mr-2 opacity-80">✕ {item.source}</span>
                                            <span className="font-semibold whitespace-nowrap">-{item.value.toFixed(1)}%</span>
                                        </div>
                                    ))}
                                    {changes.added.map((item, idx) => (
                                        <div key={`add-${idx}`} className="flex justify-between items-center text-green-400">
                                            <span className="truncate mr-2 opacity-80">+ {item.source}</span>
                                            <span className="font-semibold whitespace-nowrap">+{item.value.toFixed(1)}%</span>
                                        </div>
                                    ))}
                                    {changes.changed.map((item, idx) => (
                                        <div key={`chg-${idx}`} className="flex justify-between items-center text-amber-400">
                                            <span className="truncate mr-2 opacity-80">~ {item.source}</span>
                                            <span className="font-semibold whitespace-nowrap">{item.oldValue.toFixed(1)} → {item.newValue.toFixed(1)}%</span>
                                        </div>
                                    ))}
                                    {/* Delta total */}
                                    <div className={`flex justify-between items-center pt-1 mt-1 border-t border-amber-500/20 font-bold ${delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        <span>DELTA</span>
                                        <span>{delta > 0 ? '+' : ''}{delta.toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>
                        )}
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
