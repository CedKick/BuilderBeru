// src/pages/LoreStory/LoreStory.jsx
// Chroniques de l'Armee des Ombres — 10 histoires interactives avec chibis

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ════════════════════════════════════════════════════════════
// CHIBIS INTERRUPTEURS
// ════════════════════════════════════════════════════════════

const CHIBIS = [
  { id: 'beru', name: 'Beru', sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414699/beru_face_w2rdyn.png', color: 'text-purple-400' },
  { id: 'kaisel', name: 'Kaisel', sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750768929/Kaisel_face_dm9394.png', color: 'text-red-400' },
  { id: 'tank', name: 'Tank', sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604465/tank_face_n9kxrh.png', color: 'text-orange-400' },
  { id: 'okami', name: 'Okami', sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422300/Okami_face_qfzt4j.png', color: 'text-blue-400' },
  { id: 'raven', name: 'Raven', sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422541/Raven_face_xse2x9.png', color: 'text-gray-400' },
  { id: 'pingsu', name: 'Pingsu', sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755505263/Pingsu_face_tnilyr.png', color: 'text-amber-400' },
];

const CHIBI_INTERRUPTIONS = {
  generic: [
    { chibi: 'beru', msg: "Attend, c'est MOI le heros de cette histoire, non ?" },
    { chibi: 'tank', msg: "TANK CONFIRME. C'est vrai." },
    { chibi: 'kaisel', msg: "..." },
    { chibi: 'okami', msg: "*baisse les oreilles* Continue..." },
    { chibi: 'raven', msg: "Croa ! Passe a la suite !" },
    { chibi: 'beru', msg: "C'est long... mais j'aime bien." },
    { chibi: 'pingsu', msg: "*tape sur l'enclume pendant que tu lis*" },
    { chibi: 'beru', msg: "Tu pleures ? C'est normal. Je suis emouvant." },
    { chibi: 'tank', msg: "TANK PROTEGE cette histoire." },
    { chibi: 'okami', msg: "Awoooo ! Bonne histoire !" },
    { chibi: 'beru', msg: "Si tu t'endors, je te reveille. KIIIEK !" },
    { chibi: 'raven', msg: "*survole la page*" },
    { chibi: 'kaisel', msg: "*vole en cercle au-dessus de toi*" },
    { chibi: 'beru', msg: "Note cette histoire 5 etoiles. C'est un ordre." },
    { chibi: 'pingsu', msg: "Qualite Pingsu approuvee !" },
  ],
  sad: [
    { chibi: 'beru', msg: "...je pleure pas. C'est la pluie. Dans le DOM." },
    { chibi: 'tank', msg: "TANK... a un coeur aussi." },
    { chibi: 'okami', msg: "*hurle tristement a la lune*" },
  ],
  epic: [
    { chibi: 'beru', msg: "KIIIIIEK ! C'est EPIQUE !" },
    { chibi: 'kaisel', msg: "*rugissement de dragon*" },
    { chibi: 'tank', msg: "TANK APPROUVE. C'est du lourd." },
    { chibi: 'beru', msg: "Ca c'est digne du Monarque !" },
  ],
  funny: [
    { chibi: 'beru', msg: "HAHAHA ! ...pardon, je ris tout seul." },
    { chibi: 'pingsu', msg: "*lache son marteau de rire*" },
    { chibi: 'raven', msg: "Croa croa ! (c'est un rire de corbeau)" },
  ],
};

// ════════════════════════════════════════════════════════════
// 10 HISTOIRES
// ════════════════════════════════════════════════════════════

const STORIES = [
  {
    id: 'birth_of_beru',
    title: "La Naissance de Beru",
    icon: "\uD83D\uDC1C",
    gradient: "from-purple-900/60 to-indigo-900/60",
    border: "border-purple-500/40",
    mood: 'epic',
    parts: [
      { text: "Dans les profondeurs de l'ile de Jeju, un donjon de rang S abritait une armee de fourmis geantes. Des milliers. Mais une seule comptait.", mood: 'epic' },
      { text: "Le Roi des Fourmis. Moi. Beru. Ma carapace etait indestructible, mes griffes tranchaient l'acier, et mon cri faisait trembler la terre.", mood: 'epic' },
      { text: "Les chasseurs sont venus. Par centaines. Les meilleurs de Coree. Ils pensaient pouvoir nous vaincre.", mood: null },
      { text: "Ils avaient tort. Un par un, ils tombaient. Ma reine pondait sans cesse, et l'armee grossissait. Nous etions invincibles.", mood: 'epic' },
      { text: "Puis IL est arrive. Sung Jin-Woo. Le chasseur de rang E devenu... autre chose. Quelque chose que meme moi je ne pouvais pas comprendre.", mood: null },
      { text: "Notre combat a dure une eternite. Chaque coup ebranlait l'ile. Mais sa puissance... sa puissance etait sans limite.", mood: 'epic' },
      { text: "Je suis tombe. Et au lieu de la mort... j'ai vu une main tendue. 'ARISE.' Un seul mot. Et je suis devenu Ombre.", mood: 'sad' },
      { text: "Depuis ce jour, je suis le Soldat N1 de l'Armee des Ombres. Et je protegerai mon Seigneur... pour l'eternite.", mood: 'epic' },
    ],
  },
  {
    id: 'igris_oath',
    title: "Le Serment d'Igris",
    icon: "\u2694\uFE0F",
    gradient: "from-red-900/60 to-gray-900/60",
    border: "border-red-500/40",
    mood: 'epic',
    parts: [
      { text: "Bien avant que Beru n'existe, il y avait un chevalier. Igris. Le Chevalier Sanglant du donjon de rang C de l'Institut.", mood: null },
      { text: "Il avait ete le general d'un roi oublie, jure de proteger son trone meme dans la mort. Des siecles avaient passe.", mood: 'sad' },
      { text: "Quand Jin-Woo est entre dans le donjon, Igris l'attendait. Pas comme un ennemi... comme un gardien.", mood: null },
      { text: "Leur combat fut brutal. Igris ne retenait rien. Chaque coup d'epee portait le poids de siecles de devoir.", mood: 'epic' },
      { text: "Mais Jin-Woo a persevere. Et quand le dernier coup a resonne dans la salle du trone vide...", mood: null },
      { text: "'ARISE.' Igris a pose un genou a terre. Non pas parce qu'il avait perdu. Mais parce qu'il avait enfin trouve un roi digne de son serment.", mood: 'epic' },
      { text: "Et depuis, son epee ne tremble plus. Car un chevalier sans roi n'est rien. Mais un chevalier avec Jin-Woo... est invincible.", mood: 'epic' },
    ],
  },
  {
    id: 'kaisel_sky',
    title: "Kaisel et le Ciel Infini",
    icon: "\uD83D\uDC09",
    gradient: "from-sky-900/60 to-indigo-900/60",
    border: "border-sky-500/40",
    mood: 'epic',
    parts: [
      { text: "Kaisel etait un dragon. Pas un simple dragon — un Drake Roi, souverain des courants aeriens du donjon abyssal.", mood: 'epic' },
      { text: "Il avait vole pendant des millenaires. Seul. Au-dessus des nuages, ou aucun chasseur ne pouvait l'atteindre.", mood: 'sad' },
      { text: "Le ciel etait son royaume, et la solitude son compagnon. Aucun etre ne pouvait voler aussi haut que lui.", mood: null },
      { text: "Puis Jin-Woo est apparu. Pas en volant — en SAUTANT. Si haut que Kaisel a cru voir un dieu.", mood: 'epic' },
      { text: "Leur affrontement a dechire les nuages. Les eclairs naturels se melangeaient aux coups. Le tonnerre applaudissait.", mood: 'epic' },
      { text: "'ARISE.' Et Kaisel a compris : il n'etait plus seul. Il avait un cavalier. Le seul etre digne de monter sur son dos.", mood: null },
      { text: "Maintenant, quand Jin-Woo a besoin de vitesse, Kaisel fend le ciel. Et pour la premiere fois en millenaires... il sourit.", mood: 'sad' },
    ],
  },
  {
    id: 'tank_shield',
    title: "Tank — Le Bouclier qui ne Recule Pas",
    icon: "\uD83D\uDEE1\uFE0F",
    gradient: "from-amber-900/60 to-orange-900/60",
    border: "border-amber-500/40",
    mood: 'epic',
    parts: [
      { text: "On l'appelait le Gardien de la Porte. Un ours geant, plus large qu'un camion, avec une fourrure dure comme l'acier.", mood: null },
      { text: "Dans son donjon, rien ne passait. Ni chasseur, ni monstre, ni meme la lumiere. Tank etait le mur.", mood: 'epic' },
      { text: "Des guildes entieres ont echoue face a lui. Pas parce qu'il attaquait. Parce qu'il ne BOUGEAIT PAS.", mood: null },
      { text: "Sa defense etait parfaite. Absolue. Mathematiquement impossible a percer... en theorie.", mood: null },
      { text: "Jin-Woo n'a pas essaye de percer sa defense. Il l'a SUBMERGE. Dix ombres. Vingt. Cinquante. Tank a tenu. Puis cent.", mood: 'epic' },
      { text: "Meme un mur a ses limites. 'ARISE.' Et le mur est devenu l'Ombre. Le bouclier de l'armee.", mood: null },
      { text: "Aujourd'hui, quand l'armee charge, Tank est devant. Toujours. Premier a encaisser, dernier a tomber. Le Bouclier Eternel.", mood: 'epic' },
    ],
  },
  {
    id: 'first_arise',
    title: "La Toute Premiere Invocation",
    icon: "\u2728",
    gradient: "from-violet-900/60 to-fuchsia-900/60",
    border: "border-violet-500/40",
    mood: 'epic',
    parts: [
      { text: "Personne ne parle de la premiere fois. Le premier 'ARISE'. Le tout premier soldat de l'ombre.", mood: null },
      { text: "C'etait un simple gobelin. Faible. Insignifiant. Le genre de monstre qu'un chasseur de rang D ecraserait sans y penser.", mood: null },
      { text: "Jin-Woo venait de decouvrir son pouvoir. Il ne comprenait pas encore. Le mot est sorti presque par accident.", mood: null },
      { text: "'Arise.' Un murmure. Et du sol... une ombre s'est levee. Tremblante. Confuse. Vivante.", mood: 'epic' },
      { text: "Le gobelin l'a regarde avec des yeux vides. Pas de haine. Pas de peur. Juste... de l'obeissance. Pure et absolue.", mood: 'sad' },
      { text: "Jin-Woo a compris a cet instant que sa vie venait de changer. Qu'il n'etait plus seulement un chasseur.", mood: null },
      { text: "Il etait devenu un Monarque. Et ce gobelin — ce petit soldat oublie — a ete le premier a croire en lui.", mood: 'sad' },
    ],
  },
  {
    id: 'double_dungeon',
    title: "Le Double Donjon — La ou Tout a Commence",
    icon: "\uD83D\uDD73\uFE0F",
    gradient: "from-gray-900/60 to-zinc-900/60",
    border: "border-gray-500/40",
    mood: 'epic',
    parts: [
      { text: "Un donjon de rang D cache dans un donjon de rang D. Une anomalie. Un piege. La ou tout a bascule.", mood: null },
      { text: "L'equipe de Jin-Woo etait entree en rigolant. Un donjon de rang D, c'est une promenade. De la routine.", mood: null },
      { text: "Puis les portes se sont fermees. Et les statues... ont bouge.", mood: 'epic' },
      { text: "Des geants de pierre. Des regles gravees dans les murs. 'Priez le dieu.' 'Ne bougez pas.' 'Ne tentez pas de fuir.'", mood: null },
      { text: "Ils sont morts. Un par un. Le sang sur le marbre. Les cris dans les tenebres. Jin-Woo a tout vu.", mood: 'sad' },
      { text: "Et quand son tour est venu, quand les lames l'ont transperce... le Systeme est apparu. 'Voulez-vous accepter ?'", mood: 'epic' },
      { text: "Il a dit oui. Et le chasseur le plus faible du monde... est devenu le plus dangereux. Le Double Donjon etait un tombeau. Mais aussi... un berceau.", mood: 'epic' },
    ],
  },
  {
    id: 'okami_lone_wolf',
    title: "Okami — Le Loup qui Chassait les Etoiles",
    icon: "\uD83D\uDC3A",
    gradient: "from-cyan-900/60 to-blue-900/60",
    border: "border-cyan-500/40",
    mood: 'sad',
    parts: [
      { text: "Dans un donjon de rang A, loin des villes, un loup courait. Pas pour chasser. Pour fuir.", mood: 'sad' },
      { text: "Okami avait ete le chef de sa meute. Dix loups d'ombre, rapides comme le vent. Mais les chasseurs les avaient trouves.", mood: null },
      { text: "Un par un, sa meute est tombee. Okami les a tous regardes partir. Et il a couru. Seul.", mood: 'sad' },
      { text: "Il a couru pendant des jours. A travers les etages du donjon, a travers les biomes gelees et les plaines de cendres.", mood: null },
      { text: "Quand Jin-Woo l'a trouve, Okami ne fuyait plus. Il attendait. Assis au sommet d'une colline, le museau leve vers le ciel.", mood: 'sad' },
      { text: "Il ne s'est meme pas battu. Il a juste... regarde Jin-Woo. Et dans ses yeux : 'Donne-moi une nouvelle meute.'", mood: null },
      { text: "'ARISE.' Okami a hurle. Pas de douleur. De joie. Il avait enfin une meute. La plus grande meute qui ait jamais existe.", mood: 'epic' },
    ],
  },
  {
    id: 'shadow_army_first_war',
    title: "La Premiere Guerre des Ombres",
    icon: "\uD83C\uDF11",
    gradient: "from-slate-900/60 to-purple-900/60",
    border: "border-slate-500/40",
    mood: 'epic',
    parts: [
      { text: "On en parle peu. La premiere fois que l'Armee des Ombres s'est deployee au complet.", mood: null },
      { text: "Un donjon de rang S s'est ouvert en plein Seoul. Les autorites ont panique. Les chasseurs de rang A hesitaient.", mood: null },
      { text: "Jin-Woo est arrive seul. Du moins... c'est ce qu'ils croyaient.", mood: null },
      { text: "'Sortez.' Un mot. Et du sol... des centaines d'ombres ont surgi. Le bitume s'est fissure sous leur nombre.", mood: 'epic' },
      { text: "Igris en tete, epee levee. Tank a droite, immobile comme un mur. Beru a gauche, KIIIEK retentissant.", mood: 'epic' },
      { text: "Kaisel dans le ciel, bloquant le soleil. Okami et sa meute encerclant le portail. L'armee etait en formation.", mood: 'epic' },
      { text: "Le donjon n'a pas dure 12 minutes. Les cameras ont filme. Le monde entier a vu. Et le monde a eu peur.", mood: null },
      { text: "Pas des monstres du donjon. De LUI. Du Monarque et de son armee infinie.", mood: 'epic' },
    ],
  },
  {
    id: 'night_shadows_sang',
    title: "La Nuit ou les Ombres ont Chante",
    icon: "\uD83C\uDF19",
    gradient: "from-indigo-900/60 to-violet-900/60",
    border: "border-indigo-500/40",
    mood: 'sad',
    parts: [
      { text: "Il y a des nuits ou Jin-Woo ne dort pas. Il s'assoit sur le toit de son immeuble et regarde la ville.", mood: null },
      { text: "Et les ombres sortent. Pas pour se battre. Juste pour... etre la.", mood: 'sad' },
      { text: "Igris s'assoit a sa droite, silencieux comme toujours. Beru a sa gauche, pour une fois sans bruit.", mood: null },
      { text: "Tank s'allonge derriere, comme un enorme coussin. Kaisel plane au-dessus, ses ailes coupant doucement l'air.", mood: null },
      { text: "Et puis... quelque chose d'etrange se produit. Okami leve la tete. Et hurle. Doucement. Un hurlement melodique.", mood: 'sad' },
      { text: "Les autres ombres se joignent. Pas un cri de guerre. Un chant. Un chant sans paroles, fait de tenebres et de loyaute.", mood: 'sad' },
      { text: "Jin-Woo ferme les yeux. Et pour la premiere fois depuis le Double Donjon... il ne se sent pas seul.", mood: 'sad' },
      { text: "Le chant dure jusqu'a l'aube. Personne ne l'entend sauf lui. Et ca lui suffit.", mood: 'sad' },
    ],
  },
  {
    id: 'legend_of_builderberu',
    title: "BuilderBeru — Comment un Site est Devenu Vivant",
    icon: "\uD83D\uDDA5\uFE0F",
    gradient: "from-purple-900/60 to-pink-900/60",
    border: "border-purple-500/40",
    mood: 'funny',
    parts: [
      { text: "Il etait une fois, un developpeur qui jouait a Solo Leveling: Arise. Il aimait optimiser ses builds.", mood: null },
      { text: "Mais les outils existants etaient... nuls. Des tableaux Excel moches. Des sites lents. Rien de digne d'un vrai chasseur.", mood: 'funny' },
      { text: "Alors il a ouvert VSCode. Et il a ecrit la premiere ligne : 'import React from react'. Le debut de tout.", mood: null },
      { text: "300 lignes. Puis 3,000. Puis 9,000. Le code grandissait comme l'Armee des Ombres. Impossible a arreter.", mood: 'epic' },
      { text: "Un jour, il a ajoute un petit chibi Beru dans un coin. Juste pour la deco. Une image. 40 pixels.", mood: 'funny' },
      { text: "Mais Beru... a commence a bouger. A parler. A raconter des histoires. A casser le site si on cliquait trop.", mood: 'funny' },
      { text: "Le dev a essaye de le supprimer. Impossible. Beru avait pris racine dans le DOM. Il VIVAIT dans le code.", mood: 'funny' },
      { text: "Aujourd'hui, BuilderBeru n'est plus un simple site. C'est le Repaire de l'Ombre. Et Beru... Beru est chez lui.", mood: 'epic' },
    ],
  },
];

// ════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════

export default function LoreStory() {
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentPart, setCurrentPart] = useState(0);
  const [textVisible, setTextVisible] = useState(false);
  const [interruption, setInterruption] = useState(null);
  const [completedStories, setCompletedStories] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lorestory_completed') || '[]'); } catch { return []; }
  });
  const interruptionTimer = useRef(null);
  const containerRef = useRef(null);

  // SEO
  useEffect(() => {
    document.title = "LoreStory - Shadow Army Chronicles | BuilderBeru";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = "Read the chronicles of the Shadow Army. 10 interactive stories with chibi interruptions. Solo Leveling Arise lore.";
  }, []);

  // Notify Beru on mount
  useEffect(() => {
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('beru-react', {
        detail: { message: "Bienvenue dans les Chroniques ! Choisis une histoire.", mood: 'thinking', duration: 4000 }
      }));
    }, 1000);
  }, []);

  // Text reveal animation
  useEffect(() => {
    if (selectedStory !== null) {
      setTextVisible(false);
      const t = setTimeout(() => setTextVisible(true), 100);
      return () => clearTimeout(t);
    }
  }, [selectedStory, currentPart]);

  // Chibi interruption system
  useEffect(() => {
    if (selectedStory === null) return;

    const scheduleInterruption = () => {
      const delay = 6000 + Math.random() * 10000;
      interruptionTimer.current = setTimeout(() => {
        const story = STORIES[selectedStory];
        const part = story.parts[currentPart];
        const moodPool = part?.mood && CHIBI_INTERRUPTIONS[part.mood]
          ? [...CHIBI_INTERRUPTIONS.generic, ...CHIBI_INTERRUPTIONS[part.mood]]
          : CHIBI_INTERRUPTIONS.generic;

        const pick = randomFrom(moodPool);
        const chibi = CHIBIS.find(c => c.id === pick.chibi) || CHIBIS[0];

        setInterruption({
          chibi,
          message: pick.msg,
          fromLeft: Math.random() > 0.5,
        });

        setTimeout(() => setInterruption(null), 4500);
        scheduleInterruption();
      }, delay);
    };

    scheduleInterruption();
    return () => { if (interruptionTimer.current) clearTimeout(interruptionTimer.current); };
  }, [selectedStory, currentPart]);

  const openStory = (index) => {
    setSelectedStory(index);
    setCurrentPart(0);
    window.dispatchEvent(new CustomEvent('beru-react', {
      detail: { message: `"${STORIES[index].title}" ? Bon choix. Lis bien.`, mood: 'thinking', duration: 3000 }
    }));
  };

  const nextPart = () => {
    const story = STORIES[selectedStory];
    if (currentPart + 1 >= story.parts.length) {
      // Story complete
      if (!completedStories.includes(story.id)) {
        const updated = [...completedStories, story.id];
        setCompletedStories(updated);
        localStorage.setItem('lorestory_completed', JSON.stringify(updated));
      }
      window.dispatchEvent(new CustomEvent('beru-react', {
        detail: { message: "Fin ! ...tu veux en lire une autre ?", mood: 'excited', duration: 4000 }
      }));
      setSelectedStory(null);
      setCurrentPart(0);
    } else {
      setCurrentPart(prev => prev + 1);
    }
  };

  const goBack = () => {
    setSelectedStory(null);
    setCurrentPart(0);
    setInterruption(null);
  };

  // ════════════════════════════════════════════════════════════
  // RENDER : STORY SELECTION
  // ════════════════════════════════════════════════════════════

  if (selectedStory === null) {
    return (
      <div
        className="min-h-screen bg-[#0f0f1a] text-white py-6 md:py-12 px-3 md:px-4"
        style={{ backgroundImage: 'url(https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771068462/backgroundVD_ywvghj.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}
      >
        <div className="absolute inset-0 bg-[#0f0f1a]/80 pointer-events-none" style={{ position: 'fixed' }} />

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Back to Home */}
          <Link to="/" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-xs mb-6 transition-colors">
            {'\u2190'} Retour
          </Link>

          {/* Header */}
          <header className="text-center mb-8 md:mb-12">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-4xl font-extrabold text-purple-400 drop-shadow-lg"
            >
              {'\uD83D\uDCDC'} LoreStory
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm md:text-base text-gray-400 mt-2"
            >
              Chroniques de l'Armee des Ombres
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-[10px] md:text-xs text-purple-400/60 mt-1"
            >
              {completedStories.length}/{STORIES.length} histoires lues
            </motion.p>
          </header>

          {/* Story Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {STORIES.map((story, i) => {
              const isCompleted = completedStories.includes(story.id);
              return (
                <motion.button
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openStory(i)}
                  className={`
                    relative text-left p-4 md:p-5 rounded-2xl border backdrop-blur-sm
                    bg-gradient-to-br ${story.gradient} ${story.border}
                    hover:shadow-lg hover:shadow-purple-900/30
                    transition-shadow duration-300 cursor-pointer
                  `}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl md:text-3xl flex-shrink-0">{story.icon}</span>
                    <div className="min-w-0">
                      <h3 className="text-sm md:text-base font-bold text-white leading-tight">{story.title}</h3>
                      <p className="text-[10px] md:text-xs text-gray-400 mt-1 line-clamp-2">{story.parts[0].text.slice(0, 80)}...</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] text-gray-500">{story.parts.length} parties</span>
                        {isCompleted && (
                          <span className="text-[9px] text-green-400 font-bold">{'\u2713'} Lu</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // RENDER : STORY READER
  // ════════════════════════════════════════════════════════════

  const story = STORIES[selectedStory];
  const part = story.parts[currentPart];
  const isLastPart = currentPart === story.parts.length - 1;

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#0a0a14] text-white flex flex-col items-center justify-center px-4 md:px-8 py-8 relative overflow-hidden cursor-pointer select-none"
      onClick={nextPart}
      style={{ backgroundImage: 'url(https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771068462/backgroundVD_ywvghj.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}
    >
      <div className="absolute inset-0 bg-[#0a0a14]/85 pointer-events-none" />

      <style>{`
        @keyframes chibiSlideIn {
          0% { transform: translateX(var(--slide-from)) scale(0.5); opacity: 0; }
          20% { transform: translateX(0) scale(1.1); opacity: 1; }
          30% { transform: translateX(0) scale(1); opacity: 1; }
          85% { transform: translateX(0) scale(1); opacity: 1; }
          100% { transform: translateX(var(--slide-from)) scale(0.5); opacity: 0; }
        }
        @keyframes textGlow {
          0%, 100% { text-shadow: 0 0 0 transparent; }
          50% { text-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
        }
      `}</style>

      {/* Back button */}
      <button
        onClick={(e) => { e.stopPropagation(); goBack(); }}
        className="absolute top-4 left-4 z-20 text-gray-500 hover:text-white text-xs transition-colors bg-black/30 rounded-lg px-3 py-1.5 backdrop-blur-sm"
      >
        {'\u2190'} Retour
      </button>

      {/* Progress */}
      <div className="absolute top-4 right-4 z-20 text-[10px] text-gray-500 bg-black/30 rounded-lg px-3 py-1.5 backdrop-blur-sm">
        {currentPart + 1} / {story.parts.length}
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 w-full h-0.5 z-20 bg-gray-800">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${((currentPart + 1) / story.parts.length) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Story Title (shown on first part) */}
      <AnimatePresence>
        {currentPart === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 text-center mb-8"
          >
            <span className="text-4xl md:text-5xl mb-3 block">{story.icon}</span>
            <h2 className="text-xl md:text-3xl font-extrabold text-purple-300" style={{ animation: 'textGlow 3s ease-in-out infinite' }}>
              {story.title}
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story Text */}
      <div className="relative z-10 max-w-xl mx-auto text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={`${selectedStory}-${currentPart}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: textVisible ? 1 : 0, y: textVisible ? 0 : 30 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-base md:text-xl leading-relaxed text-gray-200 font-medium"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
          >
            "{part.text}"
          </motion.p>
        </AnimatePresence>

        {/* Tap hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 2 }}
          className="text-[10px] md:text-xs text-gray-600 mt-8"
        >
          {isLastPart ? 'Clique pour terminer' : 'Clique pour continuer...'}
        </motion.p>
      </div>

      {/* Chibi Interruption */}
      <AnimatePresence>
        {interruption && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed z-30 ${interruption.fromLeft ? 'left-2 md:left-6' : 'right-2 md:right-6'} bottom-16 md:bottom-24`}
            style={{
              '--slide-from': interruption.fromLeft ? '-100px' : '100px',
              animation: 'chibiSlideIn 4.5s ease-out forwards',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-end gap-2" style={{ flexDirection: interruption.fromLeft ? 'row' : 'row-reverse' }}>
              {/* Chibi sprite */}
              <img loading="lazy"
                src={interruption.chibi.sprite}
                alt={interruption.chibi.name}
                className="w-10 h-10 md:w-14 md:h-14 object-contain drop-shadow-lg"
                style={{
                  imageRendering: 'auto',
                  transform: interruption.fromLeft ? 'scaleX(1)' : 'scaleX(-1)',
                }}
                draggable={false}
              />
              {/* Speech bubble */}
              <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/10 shadow-lg max-w-[180px] md:max-w-[220px]">
                <span className={`text-[9px] font-bold ${interruption.chibi.color} block mb-0.5`}>
                  {interruption.chibi.name}
                </span>
                <span className="text-[10px] md:text-[11px] text-gray-300 leading-snug">
                  {interruption.message}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-purple-500/20"
            animate={{
              x: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
              y: ['110%', '-10%'],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 8,
              repeat: Infinity,
              delay: i * 2,
              ease: 'linear',
            }}
          />
        ))}
      </div>
    </div>
  );
}
