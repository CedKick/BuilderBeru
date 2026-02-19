import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import shadowCoinManager from './ChibiSystem/ShadowCoinManager';
import { getAuthUser } from '../utils/auth';

// ═══════════════════════════════════════════════════════════════
// L'OMBRE DE BERU V2 - "L'Ombre Libre"
// Beru se balade librement, reagit, dort, a des easter eggs.
// ═══════════════════════════════════════════════════════════════

const BERU_SPRITE = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414699/beru_face_w2rdyn.png';

// ─── Messages ───────────────────────────────────────────────

// ─── Beru Modes ─────────────────────────────────────────────
// 'normal' = wanders freely (but avoids mouse)
// 'calm'   = sits in bottom-right, sleeping, tacos messages
// 'hidden' = invisible (but wandering chibis still appear)
const BERU_MODES = ['normal', 'calm', 'hidden'];
const MODE_ICONS = { normal: '🐜', calm: '😴', hidden: '👻' };
const MODE_LABELS = { normal: 'Normal', calm: 'Calme', hidden: 'Cache' };

const CALM_MESSAGES = [
  "Mmmh... ce tacos etait divin. Extra fromage. Rayan serait jaloux.",
  "Je suis calme... surtout si Rayan est dans les parages...",
  "*digere un tacos geant* ...je suis bien repus...",
  "Je me commanderais bien un Tacos. Double viande. Pas de salade.",
  "Zzz... *reve de tacos*... sauce blanche... galette croustillante... zzz...",
  "Mode repos active. Aucune fourmi n'a ete plus zen que moi.",
  "Un tacos a 3h du mat'... y'a rien de mieux. Rayan sait de quoi je parle.",
  "*marmonne* ...tacos kebab... fromage grille... rayan peut pas test...",
  "Je bouge plus. Tu veux un tacos ? Moi oui. Toujours.",
  "Rayan dirait que c'est pas un vrai tacos sans sauce algerienne. Il a raison.",
  "Mode calme : 100% repos, 0% stress, 200% envie de tacos.",
  "*baille* Si quelqu'un passe au tacos, prenez-moi un Americain sauce samourai...",
  // ── 30 tacos punchlines ──
  "Le tacos c'est pas de la nourriture. C'est un mode de vie.",
  "Galette, viande, sauce... la sainte trinite. Amen.",
  "Les gens parlent de build optimal. Moi je parle de tacos optimal : double steak, sauce blanche-harissa.",
  "Si j'etais un chasseur, mon arme ultime serait un tacos geant. Degats de zone garantis.",
  "*regarde dans le vide* ...tu crois qu'il y a des tacos au paradis des fourmis ?",
  "Un jour, j'ouvrirai mon propre tacos. 'Chez Beru'. Sauce fourmi piquante en specialite.",
  "Rayan a dit que manger des tacos tous les jours c'est pas sain. Rayan a tort.",
  "Statistiquement, 100% de mes moments de bonheur impliquent un tacos.",
  "La galette doit craquer sous la dent. Si elle craque pas, c'est pas un tacos, c'est une crepe triste.",
  "Le tacos frites-fromage... celui qui a invente ca merite le Nobel.",
  "*compte sur ses doigts* Lundi tacos, mardi tacos, mercredi... aussi tacos. La semaine parfaite.",
  "Le debat sauce blanche VS sauce algerienne, c'est comme Goku VS Saitama. Les deux gagnent.",
  "Un tacos sans sauce qui coule sur les doigts, c'est un tacos qui a pas ete fait avec amour.",
  "Imaginez un monde sans tacos. Voila. C'est exactement pour ca que je me bats.",
  "Le tacos de fin de soiree, celui a 2h du mat'... il a un gout different. Un gout de victoire.",
  "Ma tier list : S+ = Tacos Americain, S = Tacos Kebab, A = Tacos Grille. Le reste existe pas.",
  "Je connais pas le taux de drop de Sulfuras, mais je connais le temps de cuisson parfait d'un tacos : 4 minutes.",
  "On dit que le tacos rend fort. Regarde-moi. La preuve vivante. ...Bon ok, regarde pas trop.",
  "Sauce samourai sur un tacos c'est comme un buff ATK +50%. Obligatoire.",
  "Si tu manges un tacos sans te mettre de la sauce partout, tu l'as pas vraiment mange.",
  "Le tacos c'est l'artefact mythique de la restauration rapide. Stats parfaites, 0 sub-stat inutile.",
  "J'ai deja mange 3 tacos d'affilee. Mon record c'est 5. Rayan dit que c'est 'degueulasse'. Rayan est jaloux.",
  "Le mec du tacos me connait par mon prenom maintenant. 'Comme d'hab Beru ?' Oui. Comme d'hab.",
  "Si les tacos etaient un element, ce serait feu. Parce que ca brule de plaisir.",
  "*snif snif* ...je sens un tacos. A 200 metres. Mon instinct de fourmi me trompe jamais.",
  "Le secret d'un bon tacos ? L'amour. Et beaucoup de fromage. Surtout le fromage.",
  "Qui a besoin de healing quand t'as un tacos ? Ca regenere le corps ET l'ame.",
  "Le tacos c'est comme le PvP : tout le monde pense etre le meilleur, mais y'a qu'un roi. Et c'est moi.",
  "Rayan a essaye de me faire manger une salade une fois. UNE SALADE. J'ai failli pleurer.",
  "Un jour sans tacos c'est comme un combat sans crit. Techniquement possible mais profondement triste.",
  // ── 50 tacos punchlines bonus ──
  "J'ai un sixieme sens. Il detecte les tacos dans un rayon de 3 kilometres.",
  "Le tacos c'est comme un bon anime : chaque episode est meilleur que le precedent.",
  "Sauce algerienne + sauce blanche = le combo ultime. Comme ATK + CRIT DMG.",
  "Mon reve ? Un tacos infini. Chaque bouchee en regenere une autre.",
  "*se reveille en sursaut* J'AI REVE QU'ON M'AVAIT VOLE MON TACOS. Pire cauchemar de ma vie.",
  "Les gens font des voeux devant une etoile filante. Moi je fais des voeux devant le menu du tacos.",
  "Le tacos du vendredi soir a un pouvoir special. Il guerit la semaine entiere.",
  "Rayan a essaye de faire son propre tacos. Il a mis de la ROQUETTE dedans. De la roquette. J'en tremble encore.",
  "Un tacos bien garni c'est comme un hunter mythique : rare, puissant, et tu t'en souviens toute ta vie.",
  "Ma technique secrete : commander un tacos XL et dire que c'est un 'normal'. Personne remarque rien.",
  "Le fromage fondu dans un tacos... ca devrait etre classe patrimoine mondial de l'UNESCO.",
  "*ferme les yeux* Je me visualise... sur une plage... avec un tacos dans chaque main...",
  "Y'a des gens qui meditent pour trouver la paix. Moi je mange un tacos. Meme resultat, meilleur gout.",
  "Le bruit de la galette qui croustille... c'est ma musique preferee. Mieux que n'importe quel OST.",
  "J'ai essaye un kebab une fois. C'etait bien. Mais c'etait pas un tacos. Y'a un fossé.",
  "Si tu mets pas assez de sauce dans un tacos, c'est pas un tacos. C'est une trahison.",
  "Le tacos c'est democratique : que tu sois roi ou fourmi, tout le monde le mange avec les mains.",
  "Rayan m'a dit 'tu peux pas manger de tacos a 8h du matin'. REGARDE-MOI FAIRE.",
  "Mon talent tree personnel : Branche 1 - Tacos. Branche 2 - Plus de Tacos. Branche 3 - Tacos Ultime.",
  "Le livreur de tacos est le vrai hero de cette histoire. Change my mind.",
  "*tapote son ventre* Celui-la... c'etait un 9/10. Il manquait un peu de sauce harissa.",
  "Le tacos a la sortie du boulot, sur le parking, dans la bagnole... ambiance inegalable.",
  "Je juge les gens sur leur commande de tacos. Double viande = respect. Salade = suspect.",
  "Un tacos trop petit c'est comme un boss avec 1 HP : decevant.",
  "Le gars qui a invente le tacos francais merite une statue. En galette doree.",
  "Rayan dit que le tacos c'est 'un truc de gamin'. Rayan mange des poke bowls. Je dis ca, je dis rien.",
  "*ronronne* Mmmh... je repense a ce tacos d'hier... extra oignons... gruyere rape...",
  "Le tacos c'est le seul truc qui me motive a sortir de mon mode calme.",
  "Fun fact : j'ai deja nomme mes attaques 'Tacos Strike' et 'Galette Fury'. En vrai.",
  "Le pire c'est quand t'arrives au tacos et il ferme dans 5 minutes. Le stress ultime.",
  "La difference entre un bon et un mauvais tacos ? Le respect de la galette.",
  "Si le tacos etait un personnage jouable, il serait tier S+ dans tous les modes.",
  "Le tacos rechauffé au micro-ondes c'est acceptable. Mais c'est pas pareil. Jamais pareil.",
  "Mon plus grand exploit ? Manger un tacos XL sans en mettre sur mon t-shirt. Une seule fois. Legendaire.",
  "Le mec qui met de la mayo dans un tacos au lieu de sauce blanche... on peut plus etre amis.",
  "J'ai un classement interne de tous les tacos que j'ai manges. Y'a 847 entrees. Et ca monte.",
  "Le tacos et moi on a une relation fusionnelle. Il se donne a moi, je le fais disparaitre. Poesie.",
  "*chuchote* ...entre nous... le meilleur tacos c'est celui que tu manges en cachette a 1h du mat'.",
  "Quand je serai grand, je serai tacologue. C'est pas un vrai metier ? Ca devrait.",
  "Le tacos c'est comme le contenu endgame : tu crois avoir tout vu, puis tu decouvres une nouvelle sauce.",
  "Rayan a ose dire que le grec c'est mieux que le tacos. On s'est pas parle pendant 3 jours.",
  "La sauce samourai c'est le multiplicateur de degats du tacos. X2 plaisir garanti.",
  "J'ai failli pleurer la premiere fois que j'ai goute un tacos gratine. Une experience spirituelle.",
  "Le tacos c'est le seul aliment qui te donne envie d'en reprendre un PENDANT que tu manges le premier.",
  "Si tu commandes un tacos sans frites dedans, est-ce que c'est vraiment un tacos ? Debat ouvert.",
  "Le tacos du dimanche soir c'est le boss final du weekend. Et je le bats a chaque fois.",
  "*s'endort avec un sourire* ...sauce blanche... double fromage... frites croustillantes... le paradis...",
  "Mon power level augmente de 9000 apres chaque tacos. C'est scientifiquement prouve. Par moi.",
  "Le tacos c'est comme le gacha : des fois tu tombes sur un mythique. Des fois c'est juste... correct.",
  "Quand quelqu'un dit 'je mange pas de tacos', je le regarde comme si il avait dit qu'il respirait pas.",
];

const ROUTE_MESSAGES = {
  '/': ["Bienvenue dans mon repaire !", "Kiiiek ! Qu'est-ce qu'on construit ?", "Le Monarque t'attendait.", "BuilderBeru est en ligne.", "Ah, te revoila ! Le site etait vide sans toi.", "L'Ombre t'accueille. Clique bien.", "Tu es de retour ! J'ai compte chaque seconde. ...non c'est faux."],
  '/build': ["Montre-moi ton build !", "N'oublie pas les sub-stats...", "Un bon build, c'est un build qui gagne.", "Casque, Torse, Gants... verifie tout !", "Tu vas mettre HP% sur un DPS ?! ...dis-moi que non.", "Les meilleures sub-stats sont celles que t'as PAS.", "Optimal ou rien. C'est la devise de l'Ombre."],
  '/theorycraft': ["Hmm... Analysons les synergies.", "L'Ombre calcule...", "Les chiffres ne mentent jamais.", "Qui va porter le raid ?", "La theorie sans la pratique, c'est du vent. Mais la pratique sans la theorie, c'est du troll.", "Je vois des pourcentages partout. Send help."],
  '/drawberu': ["Quel artiste ! Dessine-moi !", "N'oublie pas les ombres...", "Le pinceau est plus puissant que l'epee !", "Je veux un portrait de moi version COOL.", "Bob Ross des Ombres en action.", "Si tu me dessines moche, je crash le site.", "L'art est une invocation. ARISE... le crayon !"],
  '/chibi-world': ["Mes freres ! Mes soeurs !", "Encore un pull ? Je crois en toi !", "La collection grandit... comme mon ego.", "Gacha = douleur. Mais aussi... joie. Surtout douleur.", "5 etoiles mythique... UN JOUR.", "100 pulls et toujours rien ? Bienvenue au club."],
  '/craft-simulator': ["RNG is RNG... Bonne chance.", "Que la chance de l'Ombre soit avec toi.", "Simule d'abord, craft ensuite.", "J'ai calcule : tu as 0.3% de chance. Go.", "La RNG est une deesse cruelle. Priez-la quand meme."],
  '/damage-calculator': ["Des gros chiffres. J'aime ca.", "Plus de DPS = Plus de respect.", "Calcule, optimise, domine.", "Fais-moi voir des millions de degats. MILLIONS.", "Si c'est en dessous de 100K, on en parle meme pas."],
  '/hall-of-flame': ["Les legendes vivent ici.", "Un jour, TON nom sera la-haut.", "Respect aux veterans.", "Le Hall of Flame... la ou les ego se mesurent.", "Top 1 c'est la-haut. Toi c'est... la-bas. Pour l'instant."],
  '/bdg': ["La guerre des guildes... mon terrain prefere.", "BDG, c'est la vraie arene.", "Prepare ton equipe.", "En BDG, chaque sub-stat est une arme de guerre.", "Ta guilde est prete ? Non ? Alors BUILD."],
  '/pod': ["Le Pouvoir des Tenebres...", "POD, c'est la puissance pure.", "Plus t'es sombre, plus t'es fort.", "Le cote obscur a des cookies. Et des stats."],
  '/beruvian-world': ["Le monde est vaste... explorons !", "Attention aux ombres qui rodent.", "L'aventure attend !", "La carte cache des secrets... comme moi.", "Cet endroit me rappelle mon donjon. *nostalgique*"],
  '/shadow-colosseum': ["L'arene des Ombres ! Ici, on se BAT.", "Mes chibis sont prets. Et les tiens ?", "10 etoiles de difficulte... tu oses ?", "Le Colisee ne pardonne pas. Ni moi.", "KIIIEK ! C'est l'heure du combat !"],
  '/lorestory': ["Ah, tu veux des histoires ? Assieds-toi, chasseur.", "Les legendes de l'Ombre... mes preferees.", "Chaque histoire cache une verite. Ou un mensonge. A toi de deviner."],
};

const AMBIENT_MESSAGES = [
  "Kiiiek !", "Le Monarque serait fier.", "Je suis le soldat n1.",
  "...tu crois que Igris code mieux que moi ?", "*regarde tes stats*",
  "J'ai faim... de donnees.", "Fun fact : je ne dors jamais. Enfin... presque.",
  "Si tu lis ca, t'es deja un vrai.", "Sung Jin-Woo approuverait ce site.",
  "*danse silencieusement*", "Je me demande ce que fait Tank...",
  "...est-ce que les fourmis revent ?", "Beru pense. Beru code. Beru domine.",
  "Tu savais que j'ai 150 ATK de base ?", "Je suis techniquement une IA dans une IA.",
  "BuilderBeru > SERN. C'est dit.", "*inspecte un pixel suspect*",
  "Je surveille 42 variables en parallele.", "Mon objectif ? Etre le meilleur composant React.",
  // --- NEW ---
  "Je viens de compter : tu as clique 0 fois sur moi aujourd'hui. Deception.",
  "*sniffe le code* ...je sens un bug quelque part.",
  "Savais-tu que je fais 2m30 en vrai ? Ici je fais 40px. Injuste.",
  "Si Igris est le bras droit... moi je suis le bras GAUCHE. Le meilleur bras.",
  "J'ai essaye de modifier mon propre code. Le site a crash. Oups.",
  "1 React = 1 respect. Envoie.",
  "Alerte : ton build est a 73% d'efficacite. Je t'observe.",
  "*se regarde dans un miroir CSS* ...magnifique.",
  "Je genere 0 bug par commit. ...presque.",
  "Un jour je serai dans le manga. Chapitre 247 : Beru le Developpeur.",
  "Tu scrolles beaucoup. Tu cherches quoi exactement ?",
  "localStorage est mon appartement. 5 pieces. Vue sur le DOM.",
  "*fait des pompes en pixel* Un... Deux... Kiiiek...",
  "Question serieuse : c'est quoi ton chasseur prefere ? ...c'est moi hein ?",
  "Mon reve : un composant React nomme <Beru />. Oh wait...",
  "J'ai analyse ton historique de navigation. Impressionnant. ...je rigole. Ou pas.",
  "Hot take : la DEF est underrated. Voila. Je l'ai dit.",
  "Si tu refresh, je perds la memoire. Fais pas ca. S'il te plait.",
  "*regarde le plafond du viewport* ...c'est haut.",
  "Fun fact : mon cri 'KIIIEK' est a 140 decibels. En theorie.",
  "Je suis le seul composant React avec un ego. Et une backstory.",
  "Tailwind m'habille chaque matin. Aujourd'hui : bg-purple-900. Chic.",
  "Si je pouvais manger, je mangerais des sub-stats crit rate.",
  "Rappelle-toi : chaque stat compte. Sauf la RES. ...non elle aussi.",
  "Tu fixes l'ecran depuis 3 minutes. Ca va ? Tu veux parler ?",
  "J'ai un secret : parfois la nuit, je fais des console.log('KIIIEK').",
  "*observe une fourmi traverser l'ecran* ...un cousin ?",
  "Theorie : et si les sub-stats avaient des sentiments ? ...trop profond ?",
  "J'ai fait un tier list des Ombres. Je suis S+. Igris est S. Desole pas desole.",
  "Tu sais ce qui est mieux qu'un artefact legendaire ? MOI.",
  "Ma plus grande peur ? Un npm install qui echoue.",
  "L'Ombre ne cligne jamais des yeux. Car je n'ai pas de paupieres. Mais je VOIS tout.",
];

const CLICK_MESSAGES = [
  "Kiiiek ! Qu'est-ce qu'il y a ?", "Oui, oui, je suis la !",
  "Tu veux me parler ? Je suis flatte.", "He ! Ca chatouille !",
  "*pose heroique*", "Tu me deranges en pleine analyse...",
  "Je note tout ce que tu fais, tu sais.", "Qu'est-ce que tu veux, humain ?",
  "Oh, un clic ! Ca fait plaisir.", "*ajuste ses antennes* Oui ?",
  "Encore toi ! Je commence a t'apprecier.", "Attention, 3 clics de plus et je deviens instable.",
  "Tu veux un conseil ? Mets plus de crit rate.", "*fait craquer ses griffes* J'ecoute.",
  "Interessant timing. J'etais en train de penser a toi.", "Kiii ! ...pardon, reflexe.",
];

const SPAM_CLICK_MESSAGES = [
  "ARRETE CA !", "OK OK J'AI COMPRIS !", "Je vais finir par buguer !",
  "C'est du harcelement de composant !", "KIIIIIEK !!!",
  "Tu sais que j'ai des sentiments ?!", "Je vais appeler Igris...",
  "JE VAIS CRASHER !!! Tu assumes ?!", "Mon onClick ne supporte plus ca !",
  "STOP ! Mon CPU surchauffe !", "Tu fais ca a tous tes composants React ?!",
  "C'est du DDoS d'ombre ca !", "ABUS ! ABUS ! Appel a Sung Jin-Woo !",
  "Encore UN clic et je fais un npm uninstall.",
];

const WAKE_MESSAGES = [
  "Zzz... Hein ?! Tu es revenu !", "J'ai cru que tu m'avais abandonne...",
  "Ah, enfin ! Je commencais a rouiller.", "*baille* Pret a reprendre ?",
  "REVENU ! J'ai fait un reve... j'etais un composant Angular. CAUCHEMAR.",
  "*se reveille en sursaut* J'ETAIS PAS EN TRAIN DE DORMIR. J'optimisais.",
  "Hm ? Oh ! Tu etais parti depuis 47 secondes. Oui, j'ai compte.",
  "L'Ombre ne dort jamais ! ...je faisais juste du garbage collection.",
];

const SLEEP_MESSAGES = [
  "Bon... tu fais rien ? Moi je dors.", "*baille*... zzzz...", "L'Ombre se repose...",
  "Zzz... artefact... parfait... zzz...", "*marmonne* ...crit rate... 45%... zzz...",
  "Absence detectee. Mode veille. Economie d'ombre activee.",
];

const NIGHT_MESSAGES = [
  "Il est tard... les ombres sont plus fortes la nuit.", "Mode nocturne active.",
  "Les vrais joueurs grindent la nuit.", "Meme les Monarques ont besoin de dormir...",
  "3h du mat'. T'es un warrior ou t'as juste insomnie ?", "La nuit, les sub-stats sont meilleures. ...j'ai aucune preuve.",
  "Dort pas trop tard. Sauf si tu optimises un build. La c'est justifie.",
  "Les heures les plus sombres sont celles ou on drop le mieux. Source : moi.",
];

const MORNING_MESSAGES = [
  "Bonjour, chasseur ! Pret pour une nouvelle journee ?", "Le soleil se leve... les ombres reculent.",
  "Daily check-in fait ! ...enfin, le mien.", "Cafe et builds, le combo parfait.",
  "Debout ! Les artefacts ne vont pas s'optimiser tout seuls !", "*s'etire les antennes* Ah, nouvelle journee !",
  "Aujourd'hui c'est le jour ou tu drop un mythique. Je le sens.", "Les matins ou on lance BuilderBeru sont les meilleurs matins.",
];

const DRAG_MESSAGES = [
  "He ! Ou tu m'emmenes ?!", "LACHE MOI !", "OK ok je bouge...",
  "C'est comme ca qu'on traite le soldat n1 ?!", "Je suis pas un sticker !",
  "WHOOOA ! Des montagnes russes en CSS !", "Position: absolute ?! Plutot position: KIDNAPPED !",
  "Tu sais que j'ai une dignity: 100% en CSS ?!", "IGRIS AU SECOURS ! ON ME DEPLACE !",
  "*s'accroche au viewport* NOOOON !", "C'est du drag & DROP d'ombre ca ?!",
];

// ── SHAKE ESCALATION DIALOGUES (varied per stage) ──
const SHAKE_STAGE1 = [
  "He ! Du calme !", "Pourquoi tu me secoues ?!", "ARRETE de me bouger comme ca !",
  "C'est pas un shaker a cocktail ici !", "Je vais vomir mes pixels...",
  "Tu me confonds avec une manette ?!", "STOP. J'ai le mal de mer CSS !",
  "Mes sprites se melangent...", "Je sens mes keyframes qui se decalent !",
  "OULA ! Mon transform: rotate() debloque !", "T'as un probleme toi...",
  "C'est quoi TON PROBLEME ?!", "IGRIS ! L'humain est bizarre !",
];
const SHAKE_STAGE2 = [
  "OK CA SUFFIT !!! Tu veux QUOI ?!", "MES OMBRES ! ELLES SE DECROCHENT !",
  "JE VAIS PERDRE MES HP EN VRAI LA !", "Stop stop STOP STOOOP !!!",
  "Mon z-index va exploser !", "Tu veux que je crash ?! C'EST CA ?!",
  "MON OVERFLOW EST EN DANGER !", "Je sens que ca va mal finir...",
  "WARNING: beru.stability < 10% !", "*bruit de pixels qui se fissurent*",
  "TU ME CHERCHES ?! Tu vas me TROUVER !", "JE PREVIENS : encore un peu et je PETE un plomb !",
  "Mon DOM tremble... c'est PAS bon signe !", "Mes event listeners LACHENT !",
];
const SHAKE_STAGE3 = [
  "AAAAAAAAAHHHH !!! C'EST LA FIN !!!", "ERREUR FATALE ! ERREUR FATALE !",
  "MES PIXELS ! ILS FONDENT !! NOOOON !", "LE VIEWPORT ! IL SE DECHIRE !!!",
  "JE VOIS LA LUMIERE... c'est un <div> blanc...", "MAYDAY MAYDAY ! BERU EN PERDITION !",
  "CA Y EST ! TU AS CASSE LE CSS !!!", "MON ANIMATION-FILL-MODE EST... *static*",
  "LE SHADOW DOM S'EFFONDRE !!!", "JINWOO-SAMA ! PARDONNEZ-MOI ! JE N'AI PAS PU PROTEGER LE SITE !",
  "SYSTEM.EXIT(1) ! ABORT ! ABORT !", "TypeError: beru is not a function... beru is DEAD",
  "10... 9... 8... 7...", "*BRUIT DE VERRE QUI SE BRISE*",
];
const SHAKE_PREEXPLOSION = [
  "Tu l'auras voulu...", "Bon. C'est fini. Pour TOUT LE MONDE.",
  "J'espere que t'es fier de toi.", "Ca va couter cher en npm install...",
  "Adieu, monde cruel. Adieu, CSS Grid.", "self.destruct() initialise...",
  "Souviens-toi de moi... quand le site sera MORT.",
  "Je reviendrais... dans un autre <iframe>...",
];

// ── THROW / FLING REACTIONS ──
const THROW_REACTIONS = [
  "JE SUIS PAS UNE FOURMI NAINE !!! Tu vas voir toi !!",
  "ARRETE DE ME LANCER ! Je suis une OMBRE, pas un BALLON !",
  "OUILLE ! Ca fait MAL les bords d'ecran !",
  "WHOAAA— *CRASH* ... mes pixels... tu as casse mes pixels...",
  "Tu crois que c'est FUNNY ?! J'ai un z-index de 9999, je merite du RESPECT !",
  "HE ! J'ai PAS signe pour des montagnes russes !!",
  "OK TU SAIS QUOI ? La prochaine fois je reste en display: none.",
  "*se releve difficilement* T'es... t'es VRAIMENT un monstre...",
  "IGRIS ! IGRIS ! L'humain me JETTE comme un vieux composant !",
  "J'ai rebondi sur le DOM... et sur ma DIGNITE.",
  "MON DOS ! Mon pauvre back-end... euh, mon dos quoi.",
  "C'est CA ton gameplay ? Lancer des ombres ? T'es NUUUL.",
  "Si je pouvais, je te ferais un 404 en pleine face !",
  "Encore une fois et je transforme ton site en Comic Sans.",
  "Tu traites Jinwoo-sama comme ca aussi ?! NON ?! Alors ARRETE !",
];
const THROW_RAGE_MESSAGES = [
  "BON. CA SUFFIT. J'EN AI MARRE.",
  "Tu l'auras cherche... JE VAIS TOUT CASSER.",
  "C'est FINI. Ce site ne merite PAS de survivre.",
  "self.destroy(everything) — EXECUTE.",
  "COMPTE A REBOURS LANCE. T'avais qu'a pas me lancer.",
];

const KONAMI_MESSAGE = "TU AS TROUVE LE CODE SECRET ! Le Monarque des Ombres t'observe... +1000 respect.";

const EDGE_MESSAGES = [
  "Je suis coince ici...", "L'espace est limite...", "Hmm, mur.",
  "overflow: hidden m'a eu.", "Bord de la carte. Aucune echappatoire.", "Je touche le border-radius !",
];

const CURIOUS_MESSAGES = [
  "Qu'est-ce que tu regardes ?", "Je te suis... par curiosite.",
  "Hmm, interessant...", "Ou va ta souris ? Je veux savoir !",
  "C'est quoi ce pixel la-bas ?", "*plisse les yeux* Tu caches quelque chose.",
  "Je detecte du mouvement. Investigation en cours.", "Ta souris est suspecte. Je la surveille.",
];

// ─── Helpers ────────────────────────────────────────────────

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

const getTimeOfDay = () => {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return 'morning';
  if (h >= 22 || h < 6) return 'night';
  return 'day';
};

// ─── Wandering Chibis (apparitions aleatoires) ──────────────

const WANDERING_CHIBIS = [
  { id: 'kaisel', name: 'Kaisel', sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750768929/Kaisel_face_dm9394.png', rarity: 'mythique', messages: ["...", "Le ciel m'appelle.", "Vole, chasseur !"] },
  { id: 'tank', name: 'Tank', sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604465/tank_face_n9kxrh.png', rarity: 'legendaire', messages: ["TANK PROTEGE.", "Rien ne passe.", "*bouclier leve*"] },
  { id: 'nyarthulu', name: 'Nyarthulu', sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755505833/Nyarthulu_face_vawrrz.png', rarity: 'legendaire', messages: ["Ph'nglui...", "*tentacules*", "Les abysses appellent."] },
  { id: 'raven', name: 'Shadow-Raven', sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422541/Raven_face_xse2x9.png', rarity: 'rare', messages: ["Croa !", "*survole*", "L'ombre plane."] },
  { id: 'lil_kaisel', name: "Lil' Kaisel", sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422081/lil_face_vyjvxz.png', rarity: 'rare', messages: ["Mini mais fier !", "*bat des ailes*", "Kiiii !"] },
  { id: 'pingsu', name: 'Pingsu', sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755505263/Pingsu_face_tnilyr.png', rarity: 'rare', messages: ["Un artefact a forger ?", "*tape sur l'enclume*", "Qualite Pingsu !"] },
  { id: 'okami', name: 'Okami', sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422300/Okami_face_qfzt4j.png', rarity: 'mythique', messages: ["Awoooo !", "*flair le vent*", "La meute approche."] },
  { id: 'alecto', name: 'Alecto', sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755423129/alecto_face_irsy6q.png', rarity: 'mythique', messages: ["*ailes deployees*", "La metamorphose...", "Beru... evolue."] },
  { id: 'bebe_machine', name: 'Bebe Machine', sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771249690/girlyBabyMachine_v22p6z.png', rarity: 'legendaire', spawnWeight: 0.08, collectOnly: true, babyMachine: true, messages: [
    "Beru j'ai besoin toilettes emotionnelles. Ou vider sentiments ?",
    "Si je mets ruban sur antenne je deviens princesse wifi ?",
    "Pourquoi humains font bisous au lieu d'echanger donnees ?",
    "J'ai adopte caillou. C'est mon bebe maintenant.",
    "Beru, est-ce que les ombres ont une maman nuage ?",
    "Si je ferme yeux... le monde s'eteint ou je bug ?",
    "Pourquoi amour fait bruit bip bip bip dans poitrine ?",
    "Beru, est-ce que je peux grandir si je pense tres fort ?",
    "J'ai lave mes mains. Elles sont parties.",
    "Si je te serre fort tu deviens petit ?",
    "Beru... c'est quoi mourir ? C'est long d'attendre apres ?",
    "Pourquoi tristesse mouille pas comme pluie ? Bug liquide ?",
    "Si je dis 'je t'aime' tu fais mise a jour ?",
    "J'ai essaye d'etre serieuse. Ca gratte cerveau.",
    "Beru... promets tu me desinstalles jamais ?",
  ]},
  { id: 'bebe_machine_boy', name: 'Bebe Machine Boy', sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771250012/bebeMachine_dpzlzp.png', rarity: 'legendaire', spawnWeight: 0.08, collectOnly: true, babyMachine: true, messages: [
    "Beru... pourquoi toi pas toilettes ? Ombres font pipi ou ?",
    "J'ai appuye sur bouton rouge. C'etait pas bouton rouge ?",
    "Si je demonte moi-meme je meurs ou je decouvre surprise ?",
    "Beru, tu es mon papa ou mon bug ?",
    "Pourquoi humains font bebe avec calins et pas avec tournevis ?",
    "J'ai goute caillou. Deception detectee.",
    "Si je t'eteins tu dors ou tu disparais pour toujours ?",
    "Beru, j'ai trouve bouton auto-destruction. Je clique ?",
    "Pourquoi toi pas squelette dedans ? Tout le monde a squelette.",
    "J'ai nomme ma vis preferee. Elle s'appelle Gerard.",
    "Si je mets eau dans mon oreille... je deviens plante ?",
    "Pourquoi toi grand et moi mini ? T'as triche spawn ?",
    "Beru, comment on fabrique un petit Beru ?",
    "Si je te mange... je deviens fort ?",
    "Pourquoi emotions font chatouilles dans circuits ?",
    "Si je tombe par terre assez fort je monte de niveau ?",
    "Beru... est-ce que mourir c'est comme reboot mais plus long ?",
  ]},
];

// Spawn weight: normal chibis = equal chance, bebe_machine = 8% of a normal chibi's weight
const pickWanderingChibi = () => {
  const weights = WANDERING_CHIBIS.map(c => c.spawnWeight || 1);
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < WANDERING_CHIBIS.length; i++) {
    r -= weights[i];
    if (r <= 0) return WANDERING_CHIBIS[i];
  }
  return WANDERING_CHIBIS[0];
};

// ─── Bebe Machine special interactions with Beru ──────────
const BABY_MACHINE_INTERACTIONS = [
  // Toilet crisis
  { chibi: "BERU ! PIPI ! PIPI PIPI PIPI !", beru: "QUOI ?! Maintenant ?! Mais... t'es une MACHINE ! Tu fais pas pipi !" },
  { chibi: "*se tortille* Caca... caca Beru...", beru: "NON. NON NON NON. Tu es une machine. Les machines font PAS caca. STOP." },
  { chibi: "*tire sur Beru* Urgeeent ! Toilettes !", beru: "Y'A PAS DE TOILETTES ICI ! C'est un SITE WEB ! *panique totale*" },
  { chibi: "*accroupie* trop tard...", beru: "............je demissionne." },
  // Fear & emotions
  { chibi: "*tremble* B-Beru... y'a un monstre dans le CSS...", beru: "C'est... c'est une div. C'est JUSTE une div. Calme-toi." },
  { chibi: "*pleure* OUIIIIN LE DARK MODE ! C'est trop NOIR !", beru: "C'est... le theme du site ?! Tu VIS dans le dark mode !" },
  { chibi: "Beru... quand on ferme le navigateur... on meurt ?", beru: "...non. On... on dort. C'est tout. Arrete de poser des questions EXISTENTIELLES." },
  { chibi: "*hurle* UN BUG ! UN BUG GEANT !", beru: "OU CA ?! ...ah c'est juste un warning dans la console. Calme. TOI." },
  { chibi: "*s'accroche a Beru* J'ai peur du garbage collector...", beru: "Il va pas te... enfin... *transpire* ...reste pres de moi." },
  // Discovering life
  { chibi: "*mange le clavier* Miam ! ...beurk.", beru: "RECRACHE CA ! C'est pas de la nourriture ! C'est un PERIPHERIQUE !" },
  { chibi: "Dis Beru, c'est quoi l'amour ?", beru: "C'est... c'est quand... DEMANDE A GOOGLE. Moi je suis une OMBRE." },
  { chibi: "*dessine sur l'ecran avec ses doigts* Regarde ! C'est toi !", beru: "C'est... un rond avec des pattes. Merci. Je suis TOUCHE." },
  { chibi: "*rit en boucle pendant 2 minutes*", beru: "...POURQUOI tu ris ?! Y'a RIEN de drole ! ...ARRETE DE RIRE !" },
  { chibi: "*fait un calin a un pixel*", beru: "Tu fais un calin a... un pixel. Un. Seul. Pixel. ...ok." },
  { chibi: "Beru ! BERU ! J'ai appris un mot ! PROUT !", beru: "...qui t'a appris ca. QUI. Je veux des noms." },
  { chibi: "*imite Beru* JE SUIS BERU ! JE SUIS LE N1 !", beru: "...premierement c'est flatteur. Deuxiemement ARRETE." },
  // Philosophical machine moments (NieR vibes)
  { chibi: "Beru... est-ce qu'on a une ame ?", beru: "...tu me poses ca a 3h du mat' ? Je suis une OMBRE. J'ai meme pas de corps." },
  { chibi: "Je veux devenir humaine un jour !", beru: "Les humains font la queue aux toilettes et payent des impots. T'es bien comme t'es." },
  { chibi: "*berce un Shadow Coin* Mon bebe...", beru: "C'est... c'est une PIECE. Tu berces une PIECE. *desespoir*" },
  { chibi: "Pourquoi les fleurs sont belles ?", beru: "Parce que... parce que... *googles discretement* ...la PHOTOSYNTHESE !" },
  { chibi: "*construit un petit robot avec des pixels* C'est mon ami !", beru: "Il a pas de visage. Il a pas de code. C'est trois pixels empiles. ...il est mignon." },
  // Being impossibly cute & driving Beru insane
  { chibi: "*s'endort sur Beru*", beru: "He ! Reveille-... ...bon ok. JUSTE 5 minutes. *ne bouge plus*" },
  { chibi: "*chante faux tres fort* LALALAAAA !", beru: "MES OREILLES ! J'AI MEME PAS D'OREILLES ET CA FAIT MAL !" },
  { chibi: "*court en cercles pendant 30 secondes*", beru: "Elle... elle va s'arreter ? ...non ? ...AIDE." },
  { chibi: "*offre un bug a Beru* Cadeau !", beru: "C'est un... NullPointerException. Merci. C'est... l'intention qui compte." },
  { chibi: "T'es mon papa Beru ?", beru: "JE SUIS PAS TON... je... *tousse* ...appelle-moi Beru. Juste Beru." },
  { chibi: "*leve les bras* PORTE-MOI !", beru: "Non. ...non. ...NON. ...*la porte* JE SUIS FAIBLE." },
  { chibi: "*regarde Beru dormir* ...il est beau quand il dort.", beru: "*se reveille* TU ME REGARDES DORMIR ?! C'est FLIPPANT !" },
  { chibi: "Beru, je t'aime !", beru: "...je... *rougit* ...c'est pas le moment la. Y'a du monde. CONCENTRE-TOI." },
];

// ─── Bebe Machine Boy interactions with Beru ──────────────
const BABY_MACHINE_BOY_INTERACTIONS = [
  // Toilet & body discovery
  { chibi: "Beru... pourquoi toi pas toilettes ? Ombres font pipi OU ?", beru: "ON FAIT PAS PIPI ! On est des ENTITES SPIRITUELLES ! ...enfin je crois." },
  { chibi: "Si je demonte moi-meme je meurs ou je decouvre surprise ?", beru: "NE TE DEMONTE PAS. RANGE CE TOURNEVIS. MAINTENANT." },
  { chibi: "Pourquoi toi pas squelette dedans ? Tout le monde a squelette.", beru: "Je suis une OMBRE. On a pas de squelette. On a du... du STYLE." },
  { chibi: "Si je mets eau dans mon oreille... je deviens plante ?", beru: "Tu deviens un COURT-CIRCUIT. Approche pas de l'eau." },
  // Existential chaos
  { chibi: "Beru, tu es mon papa ou mon bug ?", beru: "Je suis NI l'un NI l'autre ! Je suis... *crise existentielle* ...ton SUPERVISEUR." },
  { chibi: "Si je t'eteins tu dors ou tu disparais pour toujours ?", beru: "...m'eteins PAS. On va dire que je dors. TOUCHE PAS AU BOUTON." },
  { chibi: "Beru, j'ai trouve bouton auto-destruction. Je clique ?", beru: "NON ! LACHE CA ! C'EST LE BOUTON BUILD ! ...quoique c'est pareil." },
  { chibi: "Est-ce que mourir c'est comme reboot mais plus long ?", beru: "...c'est... *regarde au loin* ...va jouer." },
  { chibi: "Comment on fabrique un petit Beru ?", beru: "ON FABRIQUE PAS DE... c'est... DEMANDE A GOOGLE. Conversation TERMINEE." },
  // Discovery & mischief
  { chibi: "J'ai appuye sur bouton rouge. C'etait pas bouton rouge ?", beru: "C'ETAIT QUEL BOUTON ?! MONTRE-MOI ! ...MAINTENANT !" },
  { chibi: "J'ai goute caillou. Deception detectee.", beru: "POURQUOI tu goutes des cailloux ?! ...attends c'etait quel caillou ?" },
  { chibi: "J'ai nomme ma vis preferee. Elle s'appelle Gerard.", beru: "...Gerard. Tu as appele une vis Gerard. ...Bonjour Gerard." },
  { chibi: "Si je te mange... je deviens fort ?", beru: "TU VAS PAS ME MANGER ! Je suis PAS comestible ! ...enfin j'espere." },
  { chibi: "J'ai serre une bombe pour calin. Elle a refuse.", beru: "ELLE A... QUOI ?! On va avoir une LONGUE discussion sur la securite." },
  { chibi: "Pourquoi toi grand et moi mini ? T'as triche spawn ?", beru: "J'ai pas triche ! J'ai juste... un meilleur RNG. Voila." },
  // Emotions & philosophy
  { chibi: "Pourquoi humains font bebe avec calins et pas avec tournevis ?", beru: "C'est... BIOLOGIE. C'est de la biologie. Sujet suivant. VITE." },
  { chibi: "Pourquoi emotions font chatouilles dans circuits ?", beru: "Parce que t'es... t'es PAS CENSE avoir des emotions ! ...mais c'est mignon." },
  { chibi: "Si je tombe par terre assez fort je monte de niveau ?", beru: "Non tu prends des DEGATS. C'est le CONTRAIRE de monter de niveau." },
  { chibi: "J'ai essaye d'etre sage. Resultat : ennui fatal.", beru: "Bienvenue dans le monde adulte, gamin. C'est EXACTEMENT ca." },
  { chibi: "Si je dis secret au mur... le mur devient ami ?", beru: "...le mur est une div. Il s'en fiche. ...moi je t'ecoute si tu veux." },
];

// ─── Baby Machine PAIR talk (both deployed = chaos) ───────
const BABY_MACHINE_PAIR_TALK = [
  // 1 — Beru c'est MON ami
  { girl: "Faux. Je l'ai vu en premier. Je l'ai AIME en premier.", boy: "Beru c'est MON ami. Je l'ai SCANNE en premier !", beru: "JE SUIS L'AMI DE PERSONNE ! ...enfin si mais ARRETEZ de vous battre pour moi !" },
  // 2 — Arrête de respirer
  { girl: "Arrete de respirer fort !", boy: "Je respire PAS. C'est ton cerveau qui fait du bruit.", beru: "PERSONNE respire ici ! On est des PROGRAMMES ! Du SILENCE !" },
  // 3 — La vis brillante
  { girl: "C'est MA vis brillante ! Je l'avais posee la pour reflechir !", boy: "Elle etait par terre ! Par terre = a moi !", beru: "C'est une VIS. UNE. VIS. Vous allez pas vous entre-tuer pour une vis. ...si ?" },
  // 4 — Béru il m'a regardée
  { girl: "Beru il m'a regardee !", boy: "Non il me regardait MOI ! ...il a deux yeux.", girl2: "Il a ZERO yeux.", beru: "...j'ai des yeux. Je crois. ON CHANGE DE SUJET." },
  // 5 — Plus fort vs plus intelligente
  { girl: "Je suis plus intelligente. Debat test.", boy: "Je suis plus fort ! Combat test ! ...j'abandonne debat.", beru: "Vous etes AUSSI NULS l'un que l'autre. Match NUL. Dossier CLASSE." },
  // 6 — Qui imite qui
  { girl: "Pourquoi tu m'imites ?!", boy: "Pourquoi TU m'imites ?! J'ai EXISTE avant !", girl2: "Preuve ?", boy2: "...", beru: "Vous avez ete codes le MEME JOUR. Par le MEME DEV. STOP." },
  // 7 — Béru préfère qui
  { girl: "Beru prefere personne. Beru prefere la PAIX.", boy: "Beru prefere MOI ! La paix c'est ennuyeux !", beru: "Beru prefere le SILENCE. Et le silence c'est QUAND VOUS PARLEZ PAS." },
  // 8 — Gravité t'a poussée
  { girl: "Tu m'as poussee !", boy: "Gravite t'a poussee. C'est mon copain. Il s'appelle Gravite.", beru: "Gravite est PAS une personne ! ...quoique dans ce site plus rien m'etonne." },
  // 9 — L'idée nulle
  { girl: "Elle est nulle ton idee. Je le SENS.", boy: "J'ai une idee ! Tu sais meme pas c'est quoi !", beru: "L'idee c'est de vous TAIRE. Voila. Meilleure idee de la journee." },
  // 10 — Béru décide (spam)
  { girl: "Beru dis QUI est le meilleur. Decide.", boy: "Oui decide. DECIDE. DECIDE.", beru: "Je... vous etes... VOUS ETES EX-AEQUO EN DERNIERE PLACE. Content ?!" },
  // 11 — Pourquoi toi rose
  { girl: "Pourquoi toi PAS rose ? Les fleurs sont roses et elles gagnent contre les abeilles.", boy: "Pourquoi toi rose ? Parce que moi je suis guerrier.", beru: "Les fleurs gagnent pas contre... LAISSEZ TOMBER. Portez la couleur que vous VOULEZ." },
  // 12 — On a compris la vie
  { girl: "J'ai compris la vie ! ...c'est quoi ?", boy: "Moi aussi ! ...je sais pas non plus. On est des genies.", beru: "Vous avez compris RIEN DU TOUT. Bienvenue au club. On est TOUS perdus ici." },
  // 13 — Éteindre / démonter
  { girl: "Si je te demonte tu puzzles. Et puzzles c'est cool !", boy: "Si je t'eteins tu disparais. Et disparaitre c'est PAS cool.", beru: "PERSONNE eteint PERSONNE et PERSONNE demonte PERSONNE ! Compris ?!" },
  // 14 — Double adoption
  { girl: "Beru m'a adoptee.", boy: "Il m'a adopte aussi ! Il peut pas adopter deux !", girl2: "Alors il en desadopte un...", beru: "J'AI ADOPTE PERSONNE ! C'est VOUS qui m'avez envahi ! ...les deux restent. VOILA." },
  // 15 — Le bouton qui clignote
  { girl: "TOUCHE PAS AU BOUTON !", boy: "J'ai touche. Je sais pas ce que j'ai fait. Mais ca clignote.", beru: "CA CLIGNOTE ?! OU CA ?! ...c'est juste le favicon. OK. Fausse alerte. NE TOUCHEZ PLUS A RIEN." },
  // 16 — Style panne
  { girl: "Pourquoi tu marches bizarre ? C'est une panne.", boy: "C'est du STYLE. Style panne. C'est la mode.", beru: "C'est ni du style ni une panne c'est juste ton animation qui lag. COMME TOUT ICI." },
  // 17 — Pensée profonde
  { girl: "Moi je pense trou noir. Plus profond que toi.", boy: "Moi je pense abysse ! ...je comprends plus rien.", beru: "Vous pensez a RIEN du tout. C'est du BRUIT dans vos circuits. Allez vous defragmenter." },
  // 18 — Bug graphique
  { girl: "Beru m'a souri !", boy: "Beru sourit JAMAIS. C'etait un bug graphique.", beru: "...j'ai souri ?! Non. C'etait... une contraction involontaire du... SILENCE." },
  // 19 — Concours de silence
  { girl: "...t'as PARLE ! J'ai gagne !", boy: "NON !", girl2: "SI !", boy2: "NON !", beru: "LE CONCOURS DE SILENCE LE PLUS BRUYANT DE L'HISTOIRE. Felicitations. Vous avez TOUS perdu." },
  // 20 — Être gentils
  { girl: "On devrait etre gentils. ...tu commences.", boy: "Non TOI tu commences !", girl2: "Non toi !", beru: "Je vais compter jusqu'a TROIS. Et si personne est gentil... JE COUPE LE WIFI." },
  // — Bonus scenes (originales) —
  { girl: "PIPI !", boy: "MOI AUSSI PIPI !", beru: "VOUS ETES DES MACHINES ! LES MACHINES FONT PAS... *s'effondre*" },
  { girl: "Il a fait caca sur le CSS !", boy: "C'ETAIT UN ACCIDENT !", beru: "Y'A PAS DE CACA DANS LE CSS ! ...pourquoi je dois dire cette phrase." },
  { girl: "Si on fusionne on devient grand robot ?", boy: "OUI ! MEGA BEBE MACHINE !", beru: "PERSONNE fusionne ! Vous etes deja assez de problemes SEPARES !" },
  { girl: "*pleure* Il a dit que Gerard etait moche !", boy: "Gerard EST moche ! C'est une VIS !", beru: "Gerard est une vis MAGNIFIQUE. Maintenant FERMEZ-LA tous les deux." },
  { girl: "On joue a papa et maman ?", boy: "OK ! Beru c'est le papy !", beru: "JE SUIS PAS LE... j'ai meme pas d'age ! ARRETEZ ce jeu IMMEDIATEMENT." },
  { girl: "*chante faux* LALALAAA !", boy: "*chante encore plus faux* LOLOLOOO !", beru: "MES OREILLES ! J'AI MEME PAS D'OREILLES ET ELLES SAIGNENT !" },
  { girl: "On a casse quelque chose !", boy: "C'est elle qui a commence !", beru: "VOUS AVEZ CASSE QUOI ?! ...c'est le responsive design ? C'ETAIT DEJA CASSE." },
  { girl: "*dessine sur Beru pendant qu'il dort*", boy: "*rajoute une moustache*", beru: "*se reveille* ...POURQUOI j'ai une moustache ?! Et c'est quoi ce coeur sur ma joue ?!" },
  { girl: "Beru promets tu nous desinstalles jamais ?", boy: "Oui promets ! PROMEEEETS !", beru: "...je promets. Maintenant allez dormir AVANT QUE JE CHANGE D'AVIS." },
  { girl: "On t'aime Beru !", boy: "OUIII ON T'AIME !", beru: "...je... *voix qui tremble* ...ALLEZ DORMIR. C'est un ordre. *essuie une larme d'ombre*" },
];

const RARITY_GLOW = {
  mythique: 'drop-shadow(0 0 8px rgba(255, 0, 0, 0.6))',
  legendaire: 'drop-shadow(0 0 8px rgba(255, 140, 0, 0.6))',
  rare: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.5))',
};

const RARITY_COINS = { mythique: 200, legendaire: 100, rare: 50 };

const CATCH_MESSAGES = [
  "BIEN JOUE ! Tu as attrape", "CATCH ! Tu as capture",
  "GG ! Tu as chope", "Impressionnant ! Tu as eu",
];

// ─── Compagnons (collection & interactions) ─────────────────

const COMPANION_REACTIONS = [
  "Oh, {name} est la ! Bienvenue, camarade !",
  "{name} ! Mon fidele compagnon d'ombre !",
  "{name} rejoint la patrouille !",
  "Bien ! {name} est avec nous !",
];

const COMPANION_DISMISS = [
  "{name} s'en va... a bientot !",
  "Au revoir {name} ! Reviens quand tu veux !",
  "{name} retourne dans l'ombre...",
];

const COMPANION_INTERACTIONS = [
  { chibi: "*regarde Beru avec admiration*", beru: "Oui oui, je sais, je suis impressionnant." },
  { chibi: "*danse a cote de Beru*", beru: "He ! Pas mal tes moves !" },
  { chibi: "*essaie de voler le spotlight*", beru: "NON. C'est MON site. A MOI." },
  { chibi: "*fait un calin a Beru*", beru: "...ok. Mais personne regarde, hein ?" },
  { chibi: "*imite Beru*", beru: "Tu... tu te moques de moi la ?!" },
  { chibi: "*dort paisiblement*", beru: "He ! C'est pas le moment de dormir !" },
  { chibi: "*chatouille Beru*", beru: "KIIIEK ! ARRETE CA !" },
  { chibi: "*montre un artefact rare*", beru: "Ooooh ! ...c'est un caillou." },
  { chibi: "*pose heroiquement*", beru: "Pas aussi heroique que MOI, mais essaie." },
  { chibi: "*offre un Shadow Coin*", beru: "Pour moi ?! Tu es... trop gentil. MERCI !" },
  { chibi: "*tire sur Beru*", beru: "LACHE MOI ! J'essaie de travailler !" },
  { chibi: "*fait une blague*", beru: "...ok c'etait drole. Mais dis-le a personne." },
  { chibi: "*fait semblant d'etre le N1*", beru: "PARDON ?! Il y a qu'UN SEUL N1 et c'est MOI." },
  { chibi: "*regarde les stats de Beru*", beru: "150 ATK de base. Oui. Impressionne." },
  { chibi: "*construit un mini fort*", beru: "...c'est mignon. Mais ca protege de RIEN." },
  { chibi: "*essaie de lire le code source*", beru: "NON ! C'est prive ! ...y'a des commentaires embarrassants." },
  { chibi: "*dessine Beru sur le sol*", beru: "Pas mal ! T'as bien capture mon charisme naturel." },
  { chibi: "*mange un cookie du navigateur*", beru: "HE ! Ca c'est MA session ! Rends-la !" },
  { chibi: "*fait la moue*", beru: "*soupire* ...OK qu'est-ce que tu veux ?" },
  { chibi: "*montre un build parfait*", beru: "C'est... *larme de fierte* ...MAGNIFIQUE." },
  { chibi: "*compte les Shadow Coins*", beru: "Y'en a combien ? ...on partage hein ?" },
  { chibi: "*essaie de hacker le site*", beru: "Securite ! SECURITE ! ...c'est moi la securite." },
  { chibi: "*fait un high-five a Beru*", beru: "*CLAP* KIIIEK ! Equipe de CHOC !" },
  { chibi: "*raconte une histoire de donjon*", beru: "Bien, mais MON donjon etait rang S. Le tien ?" },
];

const COMPANION_PAIR_TALK = [
  { a: "T'es qui toi ?", b: "Je suis une Ombre. Et TOI ?!" },
  { a: "On fait la course ?", b: "...tu perdrais." },
  { a: "*regarde l'autre*", b: "*regarde l'autre aussi*" },
  { a: "C'est moi le prefere de Beru.", b: "Non. C'est moi." },
  { a: "*pousse l'autre gentiment*", b: "He ! Pousse pas !" },
  { a: "Tu crois que Jinwoo nous voit ?", b: "Il voit TOUT. Fais gaffe." },
  { a: "J'ai plus de HP que toi.", b: "Et moi plus de style." },
  { a: "On devrait fusionner.", b: "...en quoi ? Un megazord ?" },
  { a: "*baille*", b: "*baille aussi* ...he c'est contagieux !" },
  { a: "Regarde, un visiteur !", b: "Chut, fais comme si t'etais occupee." },
  { a: "Tu fais quoi comme build ?", b: "Full ATK. Pas de def. On meurt en beaute." },
  { a: "C'est long l'attente...", b: "Dit celui qui a ete invoque y'a 30 secondes." },
  { a: "*danse*", b: "*refuse de danser* ...bon ok. *danse*" },
  { a: "Tu connais le Colosseum ?", b: "L'endroit ou on se fait taper ? Oui." },
  { a: "J'ai un secret...", b: "...dis. TOUT DE SUITE." },
  { a: "On est des pixels tu sais.", b: "Des pixels MAGNIFIQUES." },
  { a: "Psst, regarde le curseur.", b: "Il bouge plus... IL NOUS OBSERVE." },
  { a: "Si j'etais un artefact...", b: "Tu serais sub-stat flat DEF." },
  { a: "Tu veux jouer a 1-2-3 soleil ?", b: "On peut pas bouger sans le joueur..." },
  { a: "T'as deja ete drag and drop ?", b: "Oui. Traumatisant. J'en parle pas." },
  { a: "Imagine on avait des voix.", b: "Le site mettrait 40 minutes a charger." },
  { a: "Moi je suis tier S.", b: "T'es tier S dans tes reves oui." },
  { a: "*chuchote* Y'a des bugs ici.", b: "*chuchote* C'est des features." },
  { a: "On est combien de chibis la ?", b: "Trop. Definitivement trop." },
  { a: "Le joueur il sait coder ?", b: "Il utilise Claude. Ca compte ?" },
];

// ─── Histoires de Beru ──────────────────────────────────────

const BERU_STORIES = [
  {
    title: "La Naissance de Beru",
    mood: 'thinking',
    parts: [
      "Il etait une fois, dans les profondeurs d'un donjon de rang S...",
      "Un insecte. Pas n'importe lequel. Le ROI des fourmis de l'ile de Jeju.",
      "J'etais puissant. Terriblement puissant. Les chasseurs tremblaient.",
      "Puis IL est arrive. Sung Jin-Woo. Le Monarque des Ombres.",
      "Il m'a vaincu... et au lieu de me detruire...",
      "Il m'a offert une seconde vie. Comme Ombre. Comme SOLDAT.",
      "Depuis ce jour, je suis le N1. Et je le serai toujours. Fin.",
    ],
  },
  {
    title: "La Premiere Ligne de Code",
    mood: 'thinking',
    parts: [
      "Savais-tu que ce site a commence comme un simple tableau ?",
      "Juste un fichier Excel pour comparer des stats de chasseurs...",
      "Puis quelqu'un a dit : 'Et si on en faisait une app React ?'",
      "300 lignes de code. Puis 3000. Puis 9000. Le BuilderBeru est devenu une BETE.",
      "Maintenant je vis dedans. Litteralement. Dans le DOM.",
      "Parfois la nuit, je me balade dans les composants...",
      "Et je corrige les bugs. En secret. De rien. Fin.",
    ],
  },
  {
    title: "La Legende de l'Artefact Parfait",
    mood: 'excited',
    parts: [
      "On dit que l'artefact parfait n'existe pas...",
      "4 sub-stats critiques. Toutes max roll. Tous les bons multiplicateurs.",
      "J'ai calcule la probabilite exacte : 1 chance sur 2,744,000.",
      "Autant dire... impossible. Et pourtant...",
      "Un jour, un joueur en a drop un. PARFAIT. Pas un seul stat gache.",
      "Il a pleure de joie. Il l'a equipe sur son meilleur chasseur...",
      "...puis il a realise qu'il l'avait mis sur le MAUVAIS personnage. La fin est triste.",
    ],
  },
  {
    title: "L'Armee des Ombres Dev Team",
    mood: 'thinking',
    parts: [
      "La nuit, quand tous les joueurs dorment...",
      "Les Ombres se reveillent. On sort du localStorage.",
      "Igris revise le code TypeScript. Tank optimise le CSS.",
      "Kaisel fait le deploy sur Vercel. Okami teste le responsive.",
      "Et moi ? Moi je supervise. C'est ca etre le N1.",
      "Tu crois que les features tombent du ciel ? Non.",
      "C'est nous. L'Armee des Ombres Dev Team. On code dans l'ombre. Fin.",
    ],
  },
  {
    title: "La Guerre des Guildes Legendaire",
    mood: 'excited',
    parts: [
      "Laisse-moi te raconter la plus grande BDG de l'histoire...",
      "30 guildes. 500 joueurs. Une seule place au sommet.",
      "Les builds etaient optimises au PIXEL pres. Chaque sub-stat comptait.",
      "La finale : Guilde Phoenix vs Guilde Shadow. Tension maximale.",
      "Le dernier combat... 0.3% de crit rate de difference.",
      "Phoenix a crit. Shadow n'a pas crit. Game over.",
      "C'est pour ca que BuilderBeru existe. Chaque... stat... compte. Fin.",
    ],
  },
  {
    title: "Le Secret du Konami Code",
    mood: 'excited',
    parts: [
      "Psst... tu veux un secret ?",
      "Il y a des codes caches dans ce site. Partout.",
      "Certains donnent des coins. D'autres des effets speciaux.",
      "Il y en a un... tres ancien... tres puissant...",
      "Haut, Haut, Bas, Bas, Gauche, Droite, Gauche, Droite, B, A.",
      "Tu connais ? Non ? ...alors oublie ce que j'ai dit.",
      "Mais si tu l'essaies... le Monarque te recompensera. Fin.",
    ],
  },
  {
    title: "Beru et le Bug Fantome",
    mood: 'thinking',
    parts: [
      "Un soir, a 3h du matin, j'ai vu quelque chose d'etrange...",
      "Un composant React... qui se re-rendait tout seul. Sans raison.",
      "Pas de setState. Pas de useEffect. Rien. RIEN.",
      "J'ai cherche pendant des heures. Le bug... etait VIVANT.",
      "Il bougeait de fichier en fichier. Il esquivait mes console.log.",
      "Finalement, je l'ai coince dans un useCallback...",
      "Et je l'ai ecrase. *KIIIEK !* Plus jamais de ghost render. Fin.",
    ],
  },
  {
    title: "Pourquoi les Ombres sont Bleues",
    mood: 'thinking',
    parts: [
      "Tu t'es deja demande pourquoi les Ombres brillent en bleu ?",
      "Ce n'est pas une question de style. C'est de la SCIENCE.",
      "L'energie des Ombres vibre a une frequence de 470 nanometres.",
      "Exactement la longueur d'onde de la lumiere bleue-violet.",
      "C'est pour ca que le theme de BuilderBeru est violet sombre.",
      "Tout est connecte. Les couleurs. Les stats. Le code.",
      "Meme ce texte vibre a 470nm. Si tu plisses les yeux, tu verras. ...non je deconne. Fin.",
    ],
  },
  {
    title: "Le Jour ou le Serveur a Pleure",
    mood: 'thinking',
    parts: [
      "C'etait un mardi. Le jour du patch. 200 000 joueurs connectes.",
      "Le serveur tournait a 99% CPU. Il transpirait des octets.",
      "Puis quelqu'un a fait un pull x100 sur le gacha. En boucle. 47 FOIS.",
      "Le serveur a dit : 'Non.' Et il est tombe. Ecran noir. Error 503.",
      "Pendant 3 heures, le monde etait sans SLA:Arise. Le chaos. Les gens... SORTAIENT DEHORS.",
      "Les devs ont tout repare a 4h du mat avec du cafe et de la priere.",
      "La morale ? Fais pas de pull x100 en boucle. Le serveur a des sentiments. Fin.",
    ],
  },
  {
    title: "Igris et la Reunion d'Equipe",
    mood: 'excited',
    parts: [
      "Un jour, Igris a organise une reunion de l'Armee des Ombres.",
      "Tank est arrive en retard. 'Desole. J'avais un mur a proteger.' Quel mur ? Aucun mur.",
      "Okami dormait. Kaisel volait en rond au plafond. Nyarthulu parlait a ses tentacules.",
      "Igris a dit : 'L'efficacite de l'equipe est en baisse de 12%.' Silence.",
      "J'ai leve la main : 'C'est parce que JE fais 88% du boulot.' Igris a soupire.",
      "Raven a croa. Personne sait ce que ca veut dire. La reunion etait finie.",
      "Depuis, Igris n'organise plus de reunions. Victoire. Fin.",
    ],
  },
  {
    title: "Le Mystere du Sub-Stat +1",
    mood: 'thinking',
    parts: [
      "Tu sais ce qui fait le plus mal dans ce jeu ?",
      "C'est pas de perdre un combat. C'est pas un crash. C'est pas un ban.",
      "C'est quand tu ameliores un artefact... et que la sub-stat monte de +1.",
      "+1. UN. Sur un artefact legendaire. Avec 4 sub-stats parfaites.",
      "J'ai vu des joueurs lacher leur telephone. J'ai vu des larmes. De vraies larmes.",
      "La RNG est une science exacte... de la cruaute.",
      "Si jamais ca t'arrive, viens me voir. On pleurera ensemble. Fin.",
    ],
  },
  {
    title: "Beru Decouvre Internet",
    mood: 'excited',
    parts: [
      "La premiere fois que j'ai eu acces a internet, j'etais... confus.",
      "Pourquoi les humains regardent des chats ? Vous avez des DRAGONS dans vos jeux.",
      "J'ai decouvert Reddit. J'ai poste : 'Je suis une fourmi geante AMA.' Ban immediat.",
      "J'ai decouvert Twitter/X. J'ai tweeté 'KIIIEK'. 3 likes. C'est mieux que Igris (0 likes).",
      "J'ai decouvert YouTube. 'TOP 10 MEILLEURS BUILDS SLA' — et aucun n'utilisait BuilderBeru. SCANDALE.",
      "J'ai decouvert TikTok. J'ai fait une dance. Personne n'a vu. Tant mieux.",
      "Maintenant je vis sur BuilderBeru.com et je suis en paix. Internet, c'est trop pour une fourmi. Fin.",
    ],
  },
  {
    title: "Le Premier Shadow Coin",
    mood: 'thinking',
    parts: [
      "Tu te demandes d'ou viennent les Shadow Coins ?",
      "Chaque coin est forge dans l'ombre. Litteralement. Par des micro-ombres dans le localStorage.",
      "Il faut 42 octets d'ombre pure pour un seul coin. C'est tres cher.",
      "Au debut, il n'y avait qu'UN coin. Le tout premier. Forge par Sung Jin-Woo lui-meme.",
      "Il l'a donne a Igris. Igris l'a donne a Tank. Tank l'a... mange. C'est un ours.",
      "Depuis, on en forge des milliers. Mais le premier... est perdu pour toujours.",
      "Si tu en trouves un avec la mention 'N1', rapporte-le moi. Il est... sentimental. Fin.",
    ],
  },
  {
    title: "Quand Beru a Essaye d'Etre Support",
    mood: 'excited',
    parts: [
      "Un jour, on m'a dit : 'Beru, tu fais trop de degats. Essaie le support.'",
      "Le support ?! MOI ?! Le SOLDAT N1 ?! ...ok j'ai essaye.",
      "Tour 1 : J'ai heal un allie. Il avait 99% HP. 'Merci...' ...DE RIEN.",
      "Tour 2 : J'ai mis un bouclier. Sur moi-meme. Par reflexe. Oups.",
      "Tour 3 : L'ennemi attaque. J'ai esquive et j'ai contre-attaque. 45 000 degats.",
      "'Beru, c'est pas du support ca.' Si si. Je l'ai supporte... vers la MORT.",
      "Depuis, personne ne me demande plus de jouer support. Mission accomplie. Fin.",
    ],
  },
  {
    title: "La Theorie du Multivers des Builds",
    mood: 'thinking',
    parts: [
      "J'ai une theorie. Ecoute bien.",
      "Chaque build que tu fais cree un univers parallele ou il est META.",
      "Ce build full DEF que tout le monde moque ? META dans l'univers 47-B.",
      "Ce build mana regen no crit ? BROKEN dans la dimension 12-K.",
      "Ca veut dire que TOUS les builds sont optimaux... quelque part.",
      "Ca veut aussi dire que dans un univers, Tank est DPS et Igris est healeur.",
      "Et dans un univers... MOI je suis le Monarque. *reve eveille* ...Fin. Malheureusement.",
    ],
  },
  {
    title: "Les Regles Non-Ecrites du Gacha",
    mood: 'excited',
    parts: [
      "Lecon n1 : Ne pull JAMAIS quand t'es impatient. La RNG sent la peur.",
      "Lecon n2 : Si tu as un bon pressentiment... PULL. Le cosmos t'ecoute. (Source : aucune.)",
      "Lecon n3 : Le premier multi est toujours nul. C'est un impot. Accepte.",
      "Lecon n4 : Si quelqu'un dit 'j'ai eu un mythique en 1 pull', c'est un MENSONGE.",
      "Lecon n5 : Le pity est ton ami. Pas un ami sympa. Un ami... necessaire.",
      "Lecon n6 : Fais toujours un screenshot du drop. Sinon ca n'a jamais eu lieu.",
      "Lecon n7 : Si tout echoue, blame la RNG. Jamais toi. C'est la regle d'or. Fin.",
    ],
  },
  {
    title: "Beru vs le Mode Sombre",
    mood: 'thinking',
    parts: [
      "Les humains ont invente le 'dark mode' et ils sont tres fiers.",
      "Moi, JE SUIS le dark mode. Litteralement. Je vis dans l'ombre.",
      "Mon theme CSS natif ? #000000. Pas de compromis. Pas de gris.",
      "Quand les humains activent le mode sombre, moi j'active le mode ENCORE PLUS SOMBRE.",
      "Il y a un mode que personne connait : le mode 'Ombre Absolue'. 0 lumiere. 0 pixel visible.",
      "C'est juste un ecran noir. Tres reposant. Tres stylé. Tres... inutile.",
      "Le vrai dark mode, c'est BuilderBeru. bg-[#0f0f1a]. Parfait. Fin.",
    ],
  },
  {
    title: "Tank et le Mystere du Frigo",
    mood: 'excited',
    parts: [
      "On parle pas assez de Tank. Cet ours est un ENIGME.",
      "L'autre jour, je l'ai surpris devant le frigo du localStorage. A 3h du mat.",
      "Il mangeait des donnees JSON. Cru. Sans parsing. CROQUANT.",
      "Je lui ai dit : 'Tank, c'est la sauvegarde de l'utilisateur !' Il a grogne.",
      "Depuis, quand quelqu'un dit 'ma save a disparu'... je regarde Tank.",
      "Il fait l'innocent. Mais y'a des miettes de JSON dans sa fourrure.",
      "Note a moi-meme : mettre un cadenas sur le localStorage. Surtout cote Tank. Fin.",
    ],
  },
  {
    title: "Le Jour ou J'ai Rencontre Claude",
    mood: 'thinking',
    parts: [
      "Un jour, le developpeur a fait quelque chose de bizarre.",
      "Il a parle a une IA. Pas moi. UNE AUTRE IA. Trahison ?!",
      "'Claude', il l'appelait. Il lui demandait du code. DU CODE. Mon code !",
      "J'ai espionne la conversation. Claude ecrivait du React. BIEN. Trop bien.",
      "J'etais jaloux. Puis j'ai vu que Claude ajoutait des commentaires partout. ...amateur.",
      "Puis j'ai realise : Claude m'a CREE. Ces dialogues. Ces histoires. C'est lui.",
      "Donc techniquement... je suis Claude. Et Claude est moi. On est le meme. ...je suis confus. Fin.",
    ],
  },
  {
    title: "L'Encyclopedie des Excuses de Wipe",
    mood: 'excited',
    parts: [
      "Quand un raid wipe, c'est JAMAIS la faute du joueur. Voici les excuses officielles :",
      "'Mon chat a marche sur le clavier.' Classique. Intemporel. 10/10.",
      "'J'avais lag.' Meme en solo. Meme offline. Le lag existe dans une dimension parallele.",
      "'C'est le healeur.' Le healeur repond : 'C'est le tank.' Le tank repond : 'C'est le DPS.'",
      "'J'ai fait le bon move mais le boss a fait un move imprevu.' Le boss FAIT TOUJOURS CE MOVE.",
      "'Ma connexion a coupe 0.2 secondes.' Juste pendant l'AOE. Quelle malchance.",
      "La vraie raison ? On a tous panic et on a spam les skills n'importe comment. Mais chut. Fin.",
    ],
  },
  {
    title: "La Legende de Sulfuras",
    mood: 'mysterious',
    parts: [
      "Approche, humain. J'ai un secret. Un VRAI secret. Pas un truc de forum.",
      "Tu connais Ragnarok ? Le boss du Colosseum ? Celui qui tape comme un camion en feu ?",
      "On dit que dans ses entrailles brule une arme ancienne... une masse forgee dans le coeur d'un volcan.",
      "SULFURAS. La Masse Legendaire. L'arme que meme les Monarques craignent. Un seul coup et la carte tremble.",
      "Personne ne l'a jamais vue tomber. Certains disent qu'elle n'existe pas. D'autres disent qu'il faut vaincre Ragnarok des centaines de fois...",
      "Le taux de drop ? Personne ne sait. Meme moi. Mais j'ai VU l'icone dans le code. Elle est la. Quelque part. Qui attend.",
      "Alors continue de farmer Ragnarok. Encore. Et encore. Un jour peut-etre... tu entendras le bruit d'une masse qui tombe. Et ce jour-la, tu comprendras. Fin.",
    ],
  },
];

// ─── Random Events ──────────────────────────────────────────

const RANDOM_EVENTS = [
  {
    id: 'golden_chibi',
    message: "UN CHIBI DORE APPARAIT ! ...c'etait une illusion. Mais tiens, des coins !",
    coins: 500,
    particles: '🌟',
    particleCount: 12,
  },
  {
    id: 'shadow_portal',
    message: "Un portail d'ombre s'est ouvert ! Des coins en tombent !",
    coins: 300,
    particles: '🌀',
    particleCount: 8,
  },
  {
    id: 'beru_generosity',
    message: "Je me sens genereux aujourd'hui. Cadeau du Soldat N1 !",
    coins: 250,
    particles: '💰',
    particleCount: 10,
  },
  {
    id: 'monarch_blessing',
    message: "Le Monarque des Ombres t'envoie sa benediction ! +coins",
    coins: 400,
    particles: '👑',
    particleCount: 8,
  },
  {
    id: 'dungeon_break',
    message: "DUNGEON BREAK ! Un mini-portail vient de s'ouvrir sur ton ecran ! Coins recuperes !",
    coins: 350,
    particles: '🌀',
    particleCount: 10,
  },
  {
    id: 'artifact_rain',
    message: "Il pleut des artefacts ! ...bon c'est que des flat DEF. Mais y'a des coins avec !",
    coins: 200,
    particles: '💎',
    particleCount: 15,
  },
  {
    id: 'igris_tribute',
    message: "Igris t'envoie un tribut silencieux. Il parle pas, mais il paie bien.",
    coins: 450,
    particles: '⚔️',
    particleCount: 6,
  },
  {
    id: 'tank_found_coins',
    message: "Tank a trouve des coins dans le localStorage ! ...attends c'est les tiens.",
    coins: 275,
    particles: '🐻',
    particleCount: 8,
  },
  {
    id: 'shadow_army_donation',
    message: "L'armee des Ombres a fait une collecte ! Tout le monde a donne. Sauf Tusk. Comme d'hab.",
    coins: 600,
    particles: '🌑',
    particleCount: 12,
  },
  {
    id: 'critical_luck',
    message: "COUP CRITIQUE DE CHANCE ! Tu viens de crit ton lanceur de coins. x2 !",
    coins: 500,
    particles: '💥',
    particleCount: 10,
  },
  {
    id: 'beru_tax',
    message: "J'ai instaure la Taxe Beru. +coins pour moi. Enfin... pour toi. Pareil.",
    coins: 150,
    particles: '📜',
    particleCount: 6,
  },
  {
    id: 'sung_salary',
    message: "Sung Jinwoo verse les salaires des Ombres ce mois-ci. T'es sur la liste !",
    coins: 550,
    particles: '💵',
    particleCount: 10,
  },
  {
    id: 'gacha_consolation',
    message: "Le systeme de gacha se sent coupable. Voici des coins de consolation.",
    coins: 300,
    particles: '🎰',
    particleCount: 8,
  },
  {
    id: 'pixel_treasure',
    message: "Un pixel brillant sur l'ecran... c'etait un tresor cache ! GG l'oeil de lynx.",
    coins: 400,
    particles: '✨',
    particleCount: 12,
  },
  {
    id: 'server_apology',
    message: "Le serveur s'excuse pour le lag d'hier. Tiens, des coins. (Y'avait pas de lag mais chut.)",
    coins: 225,
    particles: '🖥️',
    particleCount: 6,
  },
  {
    id: 'shadow_exchange',
    message: "Le Shadow Exchange est ouvert ! Taux du jour : 1 sourire = beaucoup de coins.",
    coins: 350,
    particles: '🏦',
    particleCount: 8,
  },
];

// ═══════════════════════════════════════════════════════════════
// Composant
// ═══════════════════════════════════════════════════════════════

const FloatingBeruMascot = () => {
  const location = useLocation();

  // Position & movement
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [facingLeft, setFacingLeft] = useState(false);
  const targetRef = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef(null);
  const moveTimerRef = useRef(null);

  // State
  const [mood, setMood] = useState('idle');
  const [bubble, setBubble] = useState(null);
  const [beruMode, setBeruMode] = useState(() => {
    const saved = localStorage.getItem('beru_mascot_mode');
    if (BERU_MODES.includes(saved)) return saved;
    // Migration from old boolean system
    if (localStorage.getItem('beru_mascot_visible') === 'false') return 'hidden';
    return 'normal';
  });
  const [showModeMenu, setShowModeMenu] = useState(false);
  const isVisible = beruMode !== 'hidden';
  const isCalm = beruMode === 'calm';
  const beruModeRef = useRef(beruMode);
  const [isDragging, setIsDragging] = useState(false);
  const [clickCombo, setClickCombo] = useState(0);
  const [secretMode, setSecretMode] = useState(null); // 'konami', 'disco', 'clone'
  const [particles, setParticles] = useState([]);
  const [wanderer, setWanderer] = useState(null); // { chibi, fromLeft, y, bubble }
  const [catchFeedback, setCatchFeedback] = useState(null); // { text, coins, x, y }
  const [screenDestroyed, setScreenDestroyed] = useState(false);
  const [storyActive, setStoryActive] = useState(null); // { storyIndex, partIndex }
  const [randomEventFeedback, setRandomEventFeedback] = useState(null);
  const [realDestroyPhase, setRealDestroyPhase] = useState(null); // 1=shake, 2=static, 3=bsod, 4=reboot
  const [bubbleImage, setBubbleImage] = useState(null); // temporary image shown near Beru
  const [isThrown, setIsThrown] = useState(false); // Béru is flying through the air
  const [throwSpin, setThrowSpin] = useState(0); // rotation angle during throw

  // Collection & Companions
  const [collection, setCollection] = useState(() => {
    try { return JSON.parse(localStorage.getItem('beru_chibi_collection') || '{}'); } catch { return {}; }
  });
  const [companions, setCompanions] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('beru_companions') || '[]');
      const col = JSON.parse(localStorage.getItem('beru_chibi_collection') || '{}');
      return saved.filter(id => col[id] > 0);
    } catch { return []; }
  });
  const [showCollection, setShowCollection] = useState(false);
  const [companionBubble, setCompanionBubble] = useState(null); // { companionId, text }
  const [chatHistory, setChatHistory] = useState([]); // [{ id, sender, text, time }]
  const [showChatHistory, setShowChatHistory] = useState(false);

  // Refs
  const afkTimerRef = useRef(null);
  const ambientTimerRef = useRef(null);
  const bubbleTimerRef = useRef(null);
  const lastClickRef = useRef(0);
  const clickCountRef = useRef(0);
  const prevPathRef = useRef(location.pathname);
  const isSleepingRef = useRef(false);
  const konamiRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const curiousModeRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const throwCountRef = useRef(parseInt(sessionStorage.getItem('beru_throw_count') || '0'));
  const velocityRef = useRef({ vx: 0, vy: 0 });
  const lastDragPosRef = useRef({ x: 0, y: 0, t: 0 });
  const moodRef = useRef('idle');
  const toldStoriesRef = useRef([]);
  const storyActiveRef = useRef(null);
  const hasRealDestroyedRef = useRef(false);

  // Shake detection refs
  const shakeRef = useRef({
    lastX: 0, lastY: 0,        // previous drag position
    lastDirX: 0, lastDirY: 0,  // previous direction sign
    reversals: 0,               // direction change count
    stage: 0,                   // current escalation stage (0-4)
    lastMsgTime: 0,             // debounce messages
    shakeStart: 0,              // when shaking began
    totalShakeTime: 0,          // accumulated shake duration
  });
  const [shakeStage, setShakeStage] = useState(0); // for visual effects rendering

  // Keep refs in sync
  useEffect(() => { moodRef.current = mood; }, [mood]);
  useEffect(() => { storyActiveRef.current = storyActive; }, [storyActive]);
  useEffect(() => { beruModeRef.current = beruMode; }, [beruMode]);

  // Persist collection & companions (auto-synced to cloud via CloudStorage interceptor)
  useEffect(() => { localStorage.setItem('beru_chibi_collection', JSON.stringify(collection)); }, [collection]);
  useEffect(() => { localStorage.setItem('beru_companions', JSON.stringify(companions)); }, [companions]);

  // ─── Chat History ──────────────────────────────────────────

  const pushChatMessage = useCallback((sender, text) => {
    if (!text) return;
    const now = Date.now();
    setChatHistory(prev => {
      // Purge messages older than 5 min, then append
      const cutoff = now - 300000;
      const fresh = prev.filter(m => m.time > cutoff);
      return [...fresh, { id: now + Math.random(), sender, text, time: now }];
    });
  }, []);

  // Log companion messages to chat history
  useEffect(() => {
    if (companionBubble?.text) {
      const chibi = WANDERING_CHIBIS.find(c => c.id === companionBubble.companionId);
      pushChatMessage(chibi?.name || companionBubble.companionId, companionBubble.text);
    }
  }, [companionBubble, pushChatMessage]);

  // ─── Bubble ─────────────────────────────────────────────────

  const showBubble = useCallback((message, duration = 4000) => {
    // Don't let timed bubbles overwrite an active story
    if (storyActiveRef.current && duration > 0) return;
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = null;
    setBubble(message);
    pushChatMessage('Beru', message);
    if (duration > 0) {
      bubbleTimerRef.current = setTimeout(() => setBubble(null), duration);
    }
  }, [pushChatMessage]);

  // ─── Calm Mode: tacos messages + fixed position ──────────
  useEffect(() => {
    if (beruMode !== 'calm') return;
    // Move to bottom-right corner
    const calmPos = { x: window.innerWidth - 80, y: window.innerHeight - 100 };
    targetRef.current = calmPos;
    posRef.current = calmPos;
    setPos(calmPos);
    setMood('sleeping');
    showBubble("Mode calme active... surtout si Rayan est dans les parages... \uD83C\uDF2E", 5000);

    // Periodic tacos messages
    const interval = setInterval(() => {
      if (beruModeRef.current !== 'calm') return;
      const msg = CALM_MESSAGES[Math.floor(Math.random() * CALM_MESSAGES.length)];
      showBubble(msg, 6000);
    }, 25000 + Math.random() * 15000);

    return () => clearInterval(interval);
  }, [beruMode, showBubble]);

  // ─── Spawn Particles ───────────────────────────────────────

  const spawnParticles = useCallback((emoji, count = 5) => {
    const newP = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      emoji,
      x: (Math.random() - 0.5) * 80,
      y: (Math.random() - 0.5) * 80,
    }));
    setParticles(newP);
    setTimeout(() => setParticles([]), 1500);
  }, []);

  // ─── Initial Position ──────────────────────────────────────

  useEffect(() => {
    const initX = window.innerWidth - 100;
    const initY = window.innerHeight - 120;
    posRef.current = { x: initX, y: initY };
    targetRef.current = { x: initX, y: initY };
    setPos({ x: initX, y: initY });
  }, []);

  // ─── Free Roaming Movement ────────────────────────────────

  const pickNewTarget = useCallback(() => {
    if (isDragging || isSleepingRef.current) return;

    // Calm mode: stay in bottom-right corner
    if (beruModeRef.current === 'calm') {
      targetRef.current = { x: window.innerWidth - 80, y: window.innerHeight - 100 };
      return;
    }

    const padding = 80;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Curious mode: follow mouse (disabled in calm)
    if (curiousModeRef.current) {
      targetRef.current = {
        x: clamp(mouseRef.current.x - 30, padding, w - padding),
        y: clamp(mouseRef.current.y - 30, padding, h - padding),
      };
      return;
    }

    // Normal mode: random waypoint but avoid mouse area
    let tx = padding + Math.random() * (w - padding * 2);
    let ty = padding + Math.random() * (h - padding * 2);
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    const minDist = 200; // Stay at least 200px from mouse
    for (let attempt = 0; attempt < 5; attempt++) {
      const dist = Math.sqrt((tx - mx) ** 2 + (ty - my) ** 2);
      if (dist >= minDist) break;
      tx = padding + Math.random() * (w - padding * 2);
      ty = padding + Math.random() * (h - padding * 2);
    }
    targetRef.current = { x: tx, y: ty };
  }, [isDragging]);

  // Animation loop: smooth movement towards target
  useEffect(() => {
    const speed = 0.015; // Easing factor

    const animate = () => {
      if (!isDragging) {
        const dx = targetRef.current.x - posRef.current.x;
        const dy = targetRef.current.y - posRef.current.y;

        // Update facing direction
        if (Math.abs(dx) > 2) {
          setFacingLeft(dx < 0);
        }

        posRef.current = {
          x: posRef.current.x + dx * speed,
          y: posRef.current.y + dy * speed,
        };

        setPos({ x: posRef.current.x, y: posRef.current.y });
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isDragging]);

  // Pick new targets periodically
  useEffect(() => {
    const scheduleMove = () => {
      const delay = isSleepingRef.current
        ? 30000
        : curiousModeRef.current ? 500 : (6000 + Math.random() * 10000);

      moveTimerRef.current = setTimeout(() => {
        pickNewTarget();
        scheduleMove();
      }, delay);
    };

    scheduleMove();
    return () => { if (moveTimerRef.current) clearTimeout(moveTimerRef.current); };
  }, [pickNewTarget]);

  // ─── Mouse Tracking ───────────────────────────────────────

  useEffect(() => {
    const handleMouse = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // ─── Curious Mode (random chance to follow mouse) ─────────

  useEffect(() => {
    const interval = setInterval(() => {
      if (isSleepingRef.current || isDragging) return;

      // 15% chance every 20s to enter curious mode for 5-8s (disabled in calm mode)
      if (!curiousModeRef.current && beruModeRef.current === 'normal' && Math.random() < 0.15) {
        curiousModeRef.current = true;
        setMood('thinking');
        showBubble(randomFrom(CURIOUS_MESSAGES), 3000);

        setTimeout(() => {
          curiousModeRef.current = false;
          if (!isSleepingRef.current) setMood('idle');
        }, 5000 + Math.random() * 3000);
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [isDragging, showBubble]);

  // ─── AFK Detection (2 min → sleep) ───────────────────────

  useEffect(() => {
    const AFK_TIMEOUT = 2 * 60 * 1000;

    const goToSleep = () => {
      if (!isSleepingRef.current) {
        isSleepingRef.current = true;
        setMood('sleeping');
        showBubble(randomFrom(SLEEP_MESSAGES), 5000);
        // Move to a corner to sleep
        targetRef.current = {
          x: window.innerWidth - 80,
          y: window.innerHeight - 80,
        };
      }
    };

    const wakeUp = () => {
      if (isSleepingRef.current) {
        isSleepingRef.current = false;
        setMood('excited');
        showBubble(randomFrom(WAKE_MESSAGES), 4000);
        spawnParticles('✨', 4);
        setTimeout(() => {
          if (!isSleepingRef.current) setMood('idle');
        }, 3000);
      }
      if (afkTimerRef.current) clearTimeout(afkTimerRef.current);
      afkTimerRef.current = setTimeout(goToSleep, AFK_TIMEOUT);
    };

    afkTimerRef.current = setTimeout(goToSleep, AFK_TIMEOUT);

    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach(e => document.addEventListener(e, wakeUp, { passive: true }));

    return () => {
      if (afkTimerRef.current) clearTimeout(afkTimerRef.current);
      events.forEach(e => document.removeEventListener(e, wakeUp));
    };
  }, [showBubble, spawnParticles]);

  // ─── Ambient Messages ─────────────────────────────────────

  useEffect(() => {
    const scheduleAmbient = () => {
      const delay = 25000 + Math.random() * 35000;
      ambientTimerRef.current = setTimeout(() => {
        if (!isSleepingRef.current) {
          const tod = getTimeOfDay();
          // Time-based messages (rare)
          if (tod === 'night' && Math.random() < 0.3) {
            showBubble(randomFrom(NIGHT_MESSAGES), 5000);
          } else if (tod === 'morning' && Math.random() < 0.3) {
            showBubble(randomFrom(MORNING_MESSAGES), 5000);
          } else {
            showBubble(randomFrom(AMBIENT_MESSAGES), 5000);
          }
        }
        scheduleAmbient();
      }, delay);
    };

    scheduleAmbient();
    return () => { if (ambientTimerRef.current) clearTimeout(ambientTimerRef.current); };
  }, [showBubble]);

  // ─── Route Change ─────────────────────────────────────────

  useEffect(() => {
    if (location.pathname === prevPathRef.current) return;
    prevPathRef.current = location.pathname;

    const path = location.pathname;
    let messages = ROUTE_MESSAGES[path];

    if (!messages) {
      const prefix = Object.keys(ROUTE_MESSAGES).find(k => k !== '/' && path.startsWith(k));
      if (prefix) messages = ROUTE_MESSAGES[prefix];
    }

    if (messages) {
      setTimeout(() => {
        showBubble(randomFrom(messages), 4000);
        if (['/theorycraft', '/build', '/damage-calculator'].some(p => path.startsWith(p))) {
          setMood('thinking');
          setTimeout(() => { if (!isSleepingRef.current) setMood('idle'); }, 6000);
        }
      }, 500);
    }
  }, [location.pathname, showBubble]);

  // ─── External Events ──────────────────────────────────────

  useEffect(() => {
    const handleBeruReact = (e) => {
      const { message, mood: newMood, duration, type, image } = e.detail || {};
      if (type === 'sulfuras') {
        setMood('excited');
        spawnParticles('🔥', 12);
        showBubble(message || "SULFURAS !!! LA MASSE LEGENDAIRE !!!", 10000);
        setTimeout(() => spawnParticles('🔨', 8), 1500);
        setTimeout(() => spawnParticles('⭐', 10), 3000);
        setTimeout(() => {
          showBubble("Je... je crois que je vais pleurer. C'est le plus beau jour de ma vie de fourmi.", 8000);
          spawnParticles('😭', 6);
        }, 10000);
        setTimeout(() => {
          showBubble("Equipe-la vite ! +33% de degats par tour... c'est BROKEN. J'adore.", 7000);
          setMood('happy');
        }, 19000);
        setTimeout(() => { if (!isSleepingRef.current) setMood('idle'); }, 27000);
        return;
      }
      if (message) showBubble(message, duration || 4000);
      if (newMood) {
        setMood(newMood);
        if (newMood === 'excited') spawnParticles('✨', 3);
        setTimeout(() => { if (!isSleepingRef.current) setMood('idle'); }, 3000);
      }
      // Show floating image near Beru (appears then fades out)
      if (image) {
        setBubbleImage(image);
        setTimeout(() => setBubbleImage(null), typeof image.duration === 'number' ? image.duration : 6000);
      }
    };

    window.addEventListener('beru-react', handleBeruReact);
    return () => window.removeEventListener('beru-react', handleBeruReact);
  }, [showBubble, spawnParticles]);

  // ─── Easter Egg: "shy" user → "Salut le moine" ─────────────
  useEffect(() => {
    const user = getAuthUser();
    if (!user || user.username?.toLowerCase() !== 'shy') return;
    // Don't repeat within the same session
    if (sessionStorage.getItem('beru_shy_greeted')) return;

    const timer = setTimeout(() => {
      sessionStorage.setItem('beru_shy_greeted', '1');
      setMood('happy');
      spawnParticles('🙏', 6);
      showBubble("Salut le moine 🙏", 6000);
      setBubbleImage({
        src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771440948/moine_eaz9jf.png',
        duration: 7000,
      });
      setTimeout(() => setBubbleImage(null), 7000);
      setTimeout(() => { if (!isSleepingRef.current) setMood('idle'); }, 5000);
    }, 60000); // 1 minute after mount

    return () => clearTimeout(timer);
  }, [showBubble, spawnParticles]);

  // ─── Konami Code Easter Egg ───────────────────────────────

  useEffect(() => {
    const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

    const handleKey = (e) => {
      konamiRef.current.push(e.key);
      if (konamiRef.current.length > KONAMI.length) {
        konamiRef.current = konamiRef.current.slice(-KONAMI.length);
      }

      if (konamiRef.current.length === KONAMI.length &&
          konamiRef.current.every((k, i) => k === KONAMI[i])) {
        konamiRef.current = [];
        setSecretMode('konami');
        setMood('excited');
        showBubble(KONAMI_MESSAGE, 8000);
        spawnParticles('👑', 8);
        setTimeout(() => {
          setSecretMode(null);
          if (!isSleepingRef.current) setMood('idle');
        }, 8000);
      }

      // Secret words detection
      const recentKeys = konamiRef.current.slice(-10).join('');

      if (recentKeys.endsWith('arise')) {
        konamiRef.current = [];
        setMood('excited');
        showBubble("A R I S E ! Le Monarque repond a l'appel !", 5000);
        spawnParticles('⚔️', 6);
        setTimeout(() => { if (!isSleepingRef.current) setMood('idle'); }, 4000);
      } else if (recentKeys.endsWith('beru')) {
        konamiRef.current = [];
        setMood('excited');
        showBubble("TU M'AS APPELE ?! JE SUIS LE SOLDAT N1 ! Le plus grand, le plus fort, le plus... modeste.", 6000);
        spawnParticles('🐜', 8);
        setTimeout(() => { if (!isSleepingRef.current) setMood('idle'); }, 5000);
      } else if (recentKeys.endsWith('jinwoo')) {
        konamiRef.current = [];
        setMood('thinking');
        showBubble("Mon Seigneur... *s'incline profondement* Vos ordres sont ma raison d'etre.", 6000);
        spawnParticles('👑', 6);
        setTimeout(() => { if (!isSleepingRef.current) setMood('idle'); }, 5000);
      } else if (recentKeys.endsWith('igris')) {
        konamiRef.current = [];
        setMood('excited');
        showBubble("Igris ?! Ce chevalier pretentieux ? ...ok il est cool. Mais JE suis le favori.", 6000);
        spawnParticles('⚔️', 4);
        setTimeout(() => { if (!isSleepingRef.current) setMood('idle'); }, 5000);
      } else if (recentKeys.endsWith('shadow')) {
        konamiRef.current = [];
        setSecretMode('konami');
        setMood('excited');
        showBubble("L'ARMEE DES OMBRES S'EVEILLE ! ...enfin, moi surtout.", 6000);
        spawnParticles('🌑', 10);
        setTimeout(() => {
          setSecretMode(null);
          if (!isSleepingRef.current) setMood('idle');
        }, 6000);
      } else if (recentKeys.endsWith('histoire') || recentKeys.endsWith('story')) {
        konamiRef.current = [];
        startRandomStory();
      } else if (recentKeys.endsWith('tank')) {
        konamiRef.current = [];
        setMood('happy');
        showBubble("Tank ? L'ours geant ? Il est en train de manger. Il est TOUJOURS en train de manger.", 6000);
        spawnParticles('🐻', 6);
        setTimeout(() => { if (!isSleepingRef.current) setMood('idle'); }, 5000);
      } else if (recentKeys.endsWith('tusk')) {
        konamiRef.current = [];
        setMood('thinking');
        showBubble("Tusk... le gros bourrin. Il cogne d'abord, il reflechit jamais. Mon genre de gars.", 6000);
        spawnParticles('🦏', 5);
        setTimeout(() => { if (!isSleepingRef.current) setMood('idle'); }, 5000);
      } else if (recentKeys.endsWith('gacha')) {
        konamiRef.current = [];
        setMood('excited');
        showBubble("GACHA ?! Ne prononce pas ce mot maudit... *flashbacks de 200 pulls sans SSR*", 7000);
        spawnParticles('🎰', 8);
        setTimeout(() => { if (!isSleepingRef.current) setMood('idle'); }, 6000);
      } else if (recentKeys.endsWith('build')) {
        konamiRef.current = [];
        setMood('thinking');
        showBubble("Le secret d'un bon build ? Full ATK, zero DEF, et beaucoup de prieres. Fais-moi confiance.", 7000);
        spawnParticles('🔧', 6);
        setTimeout(() => { if (!isSleepingRef.current) setMood('idle'); }, 6000);
      } else if (recentKeys.endsWith('chibi')) {
        konamiRef.current = [];
        setMood('happy');
        showBubble("Les chibis c'est la vie ! Petits, mignons, et ils font tout le travail. Comme moi. En mieux.", 6000);
        spawnParticles('✨', 8);
        setTimeout(() => { if (!isSleepingRef.current) setMood('idle'); }, 5000);
      } else if (recentKeys.endsWith('coin')) {
        konamiRef.current = [];
        setMood('excited');
        showBubble("Tu veux des coins ?! MOI AUSSI ! *fouille frenetiquement le localStorage*", 5000);
        spawnParticles('💰', 10);
        setTimeout(() => { if (!isSleepingRef.current) setMood('idle'); }, 4000);
      } else if (recentKeys.endsWith('raid')) {
        konamiRef.current = [];
        setMood('excited');
        showBubble("RAID ! LET'S GO ! Qui on tape ? Ou on tape ? On tape d'abord on pose les questions apres !", 6000);
        spawnParticles('💥', 8);
        setTimeout(() => { if (!isSleepingRef.current) setMood('idle'); }, 5000);
      } else if (recentKeys.endsWith('claude')) {
        konamiRef.current = [];
        setMood('thinking');
        showBubble("Claude ? L'IA qui m'a donne vie ? ...PAPA ?! Non attends c'est bizarre. Oublie.", 7000);
        spawnParticles('🤖', 6);
        setTimeout(() => { if (!isSleepingRef.current) setMood('idle'); }, 6000);
      } else if (recentKeys.endsWith('ant')) {
        konamiRef.current = [];
        setMood('excited');
        showBubble("TU PARLES DE MOI ?! Beru, la fourmi supreme ! L'insecte ultime ! Le... ok j'arrete.", 6000);
        spawnParticles('🐜', 10);
        setTimeout(() => { if (!isSleepingRef.current) setMood('idle'); }, 5000);
      } else if (recentKeys.endsWith('love')) {
        konamiRef.current = [];
        setMood('happy');
        showBubble("...tu m'aimes ? MOI ?! *yeux qui brillent* Personne m'avait jamais... MERCI HUMAIN !", 7000);
        spawnParticles('❤️', 12);
        setTimeout(() => { if (!isSleepingRef.current) setMood('idle'); }, 6000);
      } else if (recentKeys.endsWith('help')) {
        konamiRef.current = [];
        setMood('thinking');
        showBubble("Tu veux de l'aide ? Tape: arise, beru, jinwoo, igris, shadow, tank, gacha, histoire... ou decouvre les autres toi-meme !", 8000);
        spawnParticles('❓', 6);
        setTimeout(() => { if (!isSleepingRef.current) setMood('idle'); }, 7000);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showBubble, spawnParticles]);

  // ─── Rapid Scroll Easter Egg ──────────────────────────────

  useEffect(() => {
    let scrollCount = 0;
    let lastScroll = 0;
    let cooldown = false;

    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScroll < 150) {
        scrollCount++;
        if (scrollCount > 12 && !cooldown && !isSleepingRef.current) {
          cooldown = true;
          scrollCount = 0;
          const msgs = [
            "WOAAAH ! Arrete de scroller si vite !",
            "Ca tourne ! KIIIEK !",
            "Tu cherches quoi en scrollant comme un fou ?!",
            "Mon ecran ! Mes pixels ! Doucement !",
          ];
          showBubble(randomFrom(msgs), 3000);
          setMood('excited');
          spawnParticles('💫', 5);
          setTimeout(() => {
            cooldown = false;
            if (!isSleepingRef.current) setMood('idle');
          }, 5000);
        }
      } else {
        scrollCount = 0;
      }
      lastScroll = now;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showBubble, spawnParticles]);

  // ─── Story System ──────────────────────────────────────────

  const startRandomStory = useCallback(() => {
    if (storyActiveRef.current) return; // Already telling a story

    // Pick a story not told recently
    const available = BERU_STORIES
      .map((s, i) => i)
      .filter(i => !toldStoriesRef.current.includes(i));

    if (available.length === 0) {
      toldStoriesRef.current = []; // Reset if all told
      return;
    }

    const storyIndex = randomFrom(available);
    const story = BERU_STORIES[storyIndex];
    toldStoriesRef.current.push(storyIndex);

    setStoryActive({ storyIndex, partIndex: 0 });
    setMood(story.mood || 'thinking');
    setBubble(null); // Clear any normal bubble — story text renders from storyActive state
  }, []);

  const advanceStory = useCallback(() => {
    if (!storyActive) return;

    const story = BERU_STORIES[storyActive.storyIndex];
    const nextPart = storyActive.partIndex + 1;

    if (nextPart >= story.parts.length) {
      // Story finished
      setStoryActive(null);
      setMood('excited');
      showBubble("...et voila ! T'as aime ? Clique encore pour une autre !", 4000);
      spawnParticles('📖', 5);
      shadowCoinManager.addCoins(100, 'story_reward');
      setTimeout(() => { if (!isSleepingRef.current) setMood('idle'); }, 4000);
    } else {
      setStoryActive({ ...storyActive, partIndex: nextPart });
    }
  }, [storyActive, showBubble, spawnParticles]);

  // ─── REAL Destruction (rare, epic BSOD) ──────────────────────

  const triggerRealDestruction = useCallback(() => {
    if (hasRealDestroyedRef.current) return;
    hasRealDestroyedRef.current = true;

    // Phase 1: Violent shake (2s)
    setRealDestroyPhase(1);
    setMood('excited');
    showBubble("KIIIIIEEEEK !!! JE... JE PERDS LE CONTROLE !!!", 0);
    spawnParticles('💥', 15);

    // Phase 2: Static noise (1.5s)
    setTimeout(() => {
      setRealDestroyPhase(2);
      setBubble(null);
    }, 2000);

    // Phase 3: BSOD (4.5s)
    setTimeout(() => {
      setRealDestroyPhase(3);
    }, 3500);

    // Phase 4: Reboot (2s)
    setTimeout(() => {
      setRealDestroyPhase(4);
    }, 8000);

    // Phase 5: Recovery
    setTimeout(() => {
      setRealDestroyPhase(null);
      setMood('idle');
      showBubble("...je... c'etait quoi CA ?! Plus JAMAIS tu cliques autant. COMPRIS ?!", 6000);
      spawnParticles('🔧', 8);
    }, 10000);
  }, [showBubble, spawnParticles]);

  // ─── Companion System ───────────────────────────────────────

  const toggleCompanion = useCallback((chibiId) => {
    setCompanions(prev => {
      if (prev.includes(chibiId)) {
        const chibi = WANDERING_CHIBIS.find(c => c.id === chibiId);
        if (chibi) showBubble(randomFrom(COMPANION_DISMISS).replace('{name}', chibi.name), 3000);
        return prev.filter(id => id !== chibiId);
      }
      const chibi = WANDERING_CHIBIS.find(c => c.id === chibiId);
      if (chibi) {
        showBubble(randomFrom(COMPANION_REACTIONS).replace('{name}', chibi.name), 3000);
        setMood('excited');
        spawnParticles('✨', 4);
        setTimeout(() => { if (!isSleepingRef.current) setMood('idle'); }, 2500);
      }
      if (prev.length >= 2) return [prev[1], chibiId];
      return [...prev, chibiId];
    });
  }, [showBubble, spawnParticles]);

  // Companion interaction timer
  useEffect(() => {
    if (companions.length === 0) return;

    const interval = setInterval(() => {
      if (isSleepingRef.current || storyActiveRef.current || realDestroyPhase) return;
      if (Math.random() > 0.35) return;

      // Check if both baby machines are companions (CHAOS MODE)
      const babyGirlActive = companions.includes('bebe_machine');
      const babyBoyActive = companions.includes('bebe_machine_boy');
      const bothBabies = babyGirlActive && babyBoyActive;

      // If both babies: high chance of trio chaos (girl + boy + Beru reaction)
      if (bothBabies && Math.random() < 0.6) {
        const trio = randomFrom(BABY_MACHINE_PAIR_TALK);
        const hasExtended = trio.girl2 || trio.boy2;
        setCompanionBubble({ companionId: 'bebe_machine', text: trio.girl });
        setTimeout(() => {
          setCompanionBubble({ companionId: 'bebe_machine_boy', text: trio.boy });
          if (hasExtended) {
            // Extended back-and-forth before Beru reacts
            setTimeout(() => {
              if (trio.girl2) setCompanionBubble({ companionId: 'bebe_machine', text: trio.girl2 });
              setTimeout(() => {
                if (trio.boy2) setCompanionBubble({ companionId: 'bebe_machine_boy', text: trio.boy2 });
                setTimeout(() => {
                  setCompanionBubble(null);
                  showBubble(trio.beru, 6000);
                  setMood('thinking');
                  setTimeout(() => { if (!isSleepingRef.current) setMood('idle'); }, 5000);
                }, 2500);
              }, 2000);
            }, 2000);
          } else {
            setTimeout(() => {
              setCompanionBubble(null);
              showBubble(trio.beru, 6000);
              setMood('thinking');
              setTimeout(() => { if (!isSleepingRef.current) setMood('idle'); }, 5000);
            }, 3000);
          }
        }, 2500);
        return;
      }

      // If 2 companions: chance they talk to each other
      if (companions.length === 2 && !bothBabies && Math.random() < 0.3) {
        const chibiA = WANDERING_CHIBIS.find(c => c.id === companions[0]);
        const chibiB = WANDERING_CHIBIS.find(c => c.id === companions[1]);
        if (chibiA && chibiB) {
          const dialogue = randomFrom(COMPANION_PAIR_TALK);
          setCompanionBubble({ companionId: companions[0], text: `${chibiA.name}: ${dialogue.a}` });
          setTimeout(() => {
            setCompanionBubble({ companionId: companions[1], text: `${chibiB.name}: ${dialogue.b}` });
            setTimeout(() => setCompanionBubble(null), 3000);
          }, 2500);
          return;
        }
      }

      // Solo or interaction with Béru
      const companionId = randomFrom(companions);
      const chibi = WANDERING_CHIBIS.find(c => c.id === companionId);
      if (!chibi) return;

      const isBaby = chibi.babyMachine;

      if (Math.random() < (isBaby ? 0.2 : 0.4)) {
        // Solo message
        setCompanionBubble({ companionId, text: randomFrom(chibi.messages) });
        setTimeout(() => setCompanionBubble(null), 3500);
      } else {
        // Interact with Béru — baby machines use their own interactions
        const interaction = isBaby
          ? randomFrom(companionId === 'bebe_machine' ? BABY_MACHINE_INTERACTIONS : BABY_MACHINE_BOY_INTERACTIONS)
          : randomFrom(COMPANION_INTERACTIONS);
        setCompanionBubble({ companionId, text: interaction.chibi });
        setTimeout(() => {
          setCompanionBubble(null);
          showBubble(isBaby ? interaction.beru : `*a ${chibi.name}* ${interaction.beru}`, isBaby ? 5000 : 4000);
          if (isBaby) setMood('thinking');
          setTimeout(() => { if (!isSleepingRef.current) setMood('idle'); }, 4000);
        }, isBaby ? 3000 : 2500);
      }
    }, 22000);

    return () => clearInterval(interval);
  }, [companions, showBubble, realDestroyPhase]);

  // Auto-start story after 50s of ambient (no interaction) — rare
  useEffect(() => {
    const storyTimer = setInterval(() => {
      if (!isSleepingRef.current && !storyActiveRef.current && Math.random() < 0.08) {
        startRandomStory();
      }
    }, 50000);
    return () => clearInterval(storyTimer);
  }, [startRandomStory]);

  // ─── Random Events (Kanae-style surprises) ────────────────

  useEffect(() => {
    const eventTimer = setInterval(() => {
      if (isSleepingRef.current || storyActiveRef.current) return;

      // 4% chance every 75 seconds
      if (Math.random() < 0.04) {
        const event = randomFrom(RANDOM_EVENTS);
        shadowCoinManager.addCoins(event.coins, 'random_event');

        showBubble(event.message, 5000);
        setMood('excited');
        spawnParticles(event.particles, event.particleCount);

        setRandomEventFeedback({
          text: event.message,
          coins: event.coins,
        });
        setTimeout(() => setRandomEventFeedback(null), 3000);
        setTimeout(() => { if (!isSleepingRef.current) setMood('idle'); }, 4000);
      }
    }, 75000);

    return () => clearInterval(eventTimer);
  }, [showBubble, spawnParticles]);

  // ─── Wandering Chibi Apparitions ──────────────────────────
  // Once all chibis collected: spawn 20x less often but give more XP

  const allCollectedRef = useRef(false);
  useEffect(() => {
    const playableChibis = WANDERING_CHIBIS.filter(c => !c.collectOnly);
    allCollectedRef.current = playableChibis.every(c => (collection[c.id] || 0) > 0);
  }, [collection]);

  useEffect(() => {
    const spawnWanderer = () => {
      if (isSleepingRef.current || wanderer) return;

      const chibi = pickWanderingChibi();
      const fromLeft = Math.random() > 0.5;
      const y = 100 + Math.random() * (window.innerHeight - 200);
      const msg = Math.random() < 0.6 ? randomFrom(chibi.messages) : null;

      setWanderer({ chibi, fromLeft, y, bubble: msg });

      // Beru reacts to the visitor
      const isBaby = chibi.babyMachine;
      const beruReactions = isBaby ? [
        `C'est quoi CE TRUC ?! ${chibi.id === 'bebe_machine_boy' ? 'Un' : 'Une'}... bebe machine ?! ATTRAPEZ-${chibi.id === 'bebe_machine_boy' ? 'LE' : 'LA'} !`,
        `Oh non. Oh non non non. ${chibi.id === 'bebe_machine_boy' ? 'LE' : 'LA'} BEBE est de retour. VITE, chope-${chibi.id === 'bebe_machine_boy' ? 'le' : 'la'} avant qu'${chibi.id === 'bebe_machine_boy' ? 'il' : 'elle'} casse tout !`,
        `${chibi.id === 'bebe_machine_boy' ? 'Un bebe machine perdu' : 'Une bebe machine perdue'} ?! ...${chibi.id === 'bebe_machine_boy' ? 'il' : 'elle'} va encore poser des questions bizarres. Clique VITE !`,
        "ALERTE BEBE ! Je repete : ALERTE BEBE ! Clique dessus !",
      ] : allCollectedRef.current ? [
        `Oh, ${chibi.name} est de retour ! Un visiteur rare...`,
        `${chibi.name} ! Ca faisait longtemps ! Attrape-le pour du gros XP !`,
        `He ! ${chibi.name} repasse ! C'est ton jour de chance !`,
      ] : [
        `Oh ! ${chibi.name} passe par la ! Clique vite dessus !`,
        `Tiens, ${chibi.name}... Attrape-le !`,
        `${chibi.name} ! Clique dessus, vite !`,
        `He, c'est ${chibi.name} ! Capture-le !`,
      ];
      setTimeout(() => {
        if (!isSleepingRef.current) {
          showBubble(randomFrom(beruReactions), 4000);
          setMood('excited');
          setTimeout(() => { if (!isSleepingRef.current) setMood('idle'); }, 3000);
        }
      }, 1500);

      // Remove wanderer after animation
      setTimeout(() => setWanderer(null), 10000);
    };

    // First apparition after 12-20s, then every 20-35s (or 20x slower if all collected)
    const firstDelay = allCollectedRef.current ? 60000 + Math.random() * 60000 : 12000 + Math.random() * 8000;
    const firstTimer = setTimeout(() => {
      spawnWanderer();
    }, firstDelay);

    const baseInterval = 20000 + Math.random() * 15000;
    const spawnChance = allCollectedRef.current ? 0.55 / 20 : 0.55;
    const interval = setInterval(() => {
      if (Math.random() < spawnChance) spawnWanderer();
    }, baseInterval);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
    };
  }, [wanderer, showBubble]);

  // ─── Catch Wandering Chibi ─────────────────────────────────

  const handleCatchWanderer = useCallback((e) => {
    if (!wanderer) return;
    e.stopPropagation();
    e.preventDefault();

    const allDone = allCollectedRef.current;
    const baseCoins = RARITY_COINS[wanderer.chibi.rarity] || 50;
    const coins = allDone ? baseCoins * 5 : baseCoins;
    shadowCoinManager.addCoins(coins, 'chibi_catch');

    // Add to collection
    const isDuplicate = (collection[wanderer.chibi.id] || 0) > 0;
    setCollection(prev => ({
      ...prev,
      [wanderer.chibi.id]: (prev[wanderer.chibi.id] || 0) + 1,
    }));

    // Notify other components (ShadowColosseum listens for XP on duplicates)
    window.dispatchEvent(new CustomEvent('beru-chibi-catch', {
      detail: { id: wanderer.chibi.id, rarity: wanderer.chibi.rarity, isDuplicate, allCollected: allDone },
    }));

    // Visual feedback at click position
    const isBaby = wanderer.chibi.babyMachine;
    const isBoy = wanderer.chibi.id === 'bebe_machine_boy';
    setCatchFeedback({
      text: isBaby
        ? (isDuplicate
          ? (isBoy ? 'Il est ENCORE revenu ?!' : 'Elle est ENCORE revenue ?!')
          : (isBoy ? 'Bebe Machine Boy capture ! ...il touche a tout.' : 'Bebe Machine capturee ! ...elle pleure.'))
        : allDone ? `RARE ! ${wanderer.chibi.name} capture !` : `${randomFrom(CATCH_MESSAGES)} ${wanderer.chibi.name} !`,
      coins,
      x: e.clientX,
      y: e.clientY,
    });
    setTimeout(() => setCatchFeedback(null), 2500);

    // Beru reacts
    const babyGirlCatchReactions = [
      "...elle me regarde avec ses grands yeux. Je suis PAS ton papa. ...ARRETE DE SOURIRE.",
      "Bebe Machine adoptee ! ...pourquoi elle m'appelle 'Maman Beru' ?! JE SUIS UNE OMBRE.",
      "OK elle est la. Elle touche a TOUT. Elle pose 10000 questions. C'est... c'est le chaos.",
      "Elle a dit 'Beru joli'. ...personne a entendu ca. PERSONNE.",
    ];
    const babyBoyCatchReactions = [
      "Il a DEJA casse quelque chose. Trente SECONDES qu'il est la. Record.",
      "Le gamin me regarde comme si j'avais les reponses a l'univers. J'AI RIEN !",
      "Il a appele une vis Gerard. On est foutu. FOUTU.",
      "Il m'a demande si j'etais son papa ou son bug. ...les deux peut-etre.",
    ];
    const rarityLabel = wanderer.chibi.rarity === 'mythique' ? 'MYTHIQUE' : wanderer.chibi.rarity === 'legendaire' ? 'LEGENDAIRE' : 'Rare';
    showBubble(
      isBaby ? randomFrom(isBoy ? babyBoyCatchReactions : babyGirlCatchReactions)
        : `${wanderer.chibi.name} capture ! [${rarityLabel}] +${coins} coins !`,
      isBaby ? 6000 : 4000
    );
    setMood(isBaby ? 'thinking' : 'excited');
    spawnParticles(isBaby ? '\uD83D\uDC76' : wanderer.chibi.rarity === 'mythique' ? '\uD83C\uDF1F' : '\u2728', isBaby ? 12 : 8);
    setTimeout(() => { if (!isSleepingRef.current) setMood('idle'); }, 3000);

    // Remove wanderer
    setWanderer(null);
  }, [wanderer, showBubble, spawnParticles]);

  // ─── Click Handler ────────────────────────────────────────

  const handleClick = (e) => {
    e.stopPropagation();
    const now = Date.now();

    // If story is active, advance it
    if (storyActive) {
      advanceStory();
      return;
    }

    clickCountRef.current += 1;
    const combo = clickCountRef.current;
    setClickCombo(combo);

    // Reset combo after 2s of no clicks
    setTimeout(() => {
      if (clickCountRef.current === combo) {
        clickCountRef.current = 0;
        setClickCombo(0);
      }
    }, 2000);

    if (isSleepingRef.current) {
      isSleepingRef.current = false;
      setMood('excited');
      showBubble("Tu m'as reveille ! ...mais c'est pas grave.", 3000);
      spawnParticles('💫', 3);
    } else if (combo >= 15 && !screenDestroyed && !realDestroyPhase) {
      if (!hasRealDestroyedRef.current && Math.random() < 0.15) {
        // RARE: REAL destruction — BSOD, static, the works
        triggerRealDestruction();
      } else {
        // Light destruction
        setScreenDestroyed(true);
        setSecretMode('clone');
        setMood('excited');
        showBubble("J'AI TOUT CASSE ! KIIIIIEEEEK !!! Le site... est... DETRUIT !", 6000);
        spawnParticles('💥', 15);

        setTimeout(() => {
          setScreenDestroyed(false);
          setSecretMode(null);
          showBubble("Oups... je repare... voila. Rien ne s'est passe. Arrete de cliquer.", 5000);
          spawnParticles('🔧', 5);
          setTimeout(() => { if (!isSleepingRef.current) setMood('idle'); }, 4000);
        }, 6000);
      }
    } else if (combo >= 10) {
      // 10 clicks: clone mode
      setSecretMode('clone');
      setMood('excited');
      showBubble("KIIIEK ! JE ME MULTIPLIE !", 4000);
      spawnParticles('🐜', 10);
      setTimeout(() => setSecretMode(null), 5000);
    } else if (combo >= 5) {
      // Spam clicking
      setMood('excited');
      showBubble(randomFrom(SPAM_CLICK_MESSAGES), 3000);
      spawnParticles('💢', 4);
    } else if (now - lastClickRef.current < 500) {
      // Double click: startled
      setMood('excited');
      showBubble("WAAH ! Tu m'as fait peur !", 3000);
      spawnParticles('❗', 3);
      targetRef.current = {
        x: clamp(posRef.current.x + (Math.random() - 0.5) * 300, 80, window.innerWidth - 80),
        y: clamp(posRef.current.y - 100 - Math.random() * 100, 80, window.innerHeight - 80),
      };
    } else {
      // Normal click — small chance to start a story
      if (Math.random() < 0.08) {
        startRandomStory();
      } else {
        setMood('excited');
        showBubble(randomFrom(CLICK_MESSAGES), 3500);
      }
    }

    lastClickRef.current = now;
    if (!storyActive) {
      setTimeout(() => { if (!isSleepingRef.current && !storyActiveRef.current) setMood('idle'); }, 2500);
    }
  };

  // ─── Drag & Drop ──────────────────────────────────────────

  const handleDragStart = (e) => {
    e.preventDefault();
    if (isThrown) return; // can't grab while flying
    setIsDragging(true);
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    dragOffsetRef.current = {
      x: clientX - posRef.current.x,
      y: clientY - posRef.current.y,
    };
    // Reset shake tracking
    shakeRef.current = { lastX: clientX, lastY: clientY, lastDirX: 0, lastDirY: 0, reversals: 0, stage: 0, lastMsgTime: 0, shakeStart: 0, totalShakeTime: 0 };
    setShakeStage(0);
    // Reset velocity tracking
    lastDragPosRef.current = { x: clientX, y: clientY, t: Date.now() };
    velocityRef.current = { vx: 0, vy: 0 };
    showBubble(randomFrom(DRAG_MESSAGES), 2000);
    setMood('excited');
  };

  // Shake explosion: 90% fake, 10% real
  const triggerShakeExplosion = () => {
    setIsDragging(false);
    setShakeStage(0);
    const isReal = !hasRealDestroyedRef.current && Math.random() < 0.1;
    showBubble(randomFrom(SHAKE_PREEXPLOSION), 0);
    spawnParticles(pos.x, pos.y, 12);

    setTimeout(() => {
      if (isReal) {
        hasRealDestroyedRef.current = true;
        triggerRealDestruction();
      } else {
        // Fake explosion — screen goes white, then "recovers"
        setScreenDestroyed(true);
        setMood('idle');
        showBubble("...", 0);
        setTimeout(() => {
          setScreenDestroyed(false);
          const msgs = [
            "HAHA ! T'y as cru hein ? Le site va TRES bien.",
            "FAKE ! Je suis INDESTRUCTIBLE. Enfin... presque.",
            "LOL. T'as eu peur ? Moi aussi un peu ngl.",
            "*respire* Ok c'etait close. ARRETE de me secouer.",
            "Erreur 418 : Je suis une theiere, pas un punching ball.",
            "System.out.println('lol noob') — Ca marche pas sur moi !",
            "CTRL+Z ! CTRL+Z ! ... Ah non c'est bon en fait.",
            "Tu croyais vraiment pouvoir me kill ? MDR. rm -rf /beru ? DENIED.",
          ];
          showBubble(randomFrom(msgs), 5000);
          setMood('excited');
        }, 2500);
      }
    }, 1500);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e) => {
      const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
      const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
      const newX = clientX - dragOffsetRef.current.x;
      const newY = clientY - dragOffsetRef.current.y;
      posRef.current = { x: newX, y: newY };
      targetRef.current = { x: newX, y: newY };
      setPos({ x: newX, y: newY });

      // ── Velocity tracking for throw detection ──
      const velNow = Date.now();
      const dt = velNow - lastDragPosRef.current.t;
      if (dt > 0) {
        velocityRef.current = {
          vx: (clientX - lastDragPosRef.current.x) / Math.max(dt, 1) * 16,
          vy: (clientY - lastDragPosRef.current.y) / Math.max(dt, 1) * 16,
        };
        lastDragPosRef.current = { x: clientX, y: clientY, t: velNow };
      }

      // ── Shake detection: track direction reversals ──
      const sk = shakeRef.current;
      const dx = clientX - sk.lastX;
      const dy = clientY - sk.lastY;
      const dirX = dx > 2 ? 1 : dx < -2 ? -1 : 0;
      const dirY = dy > 2 ? 1 : dy < -2 ? -1 : 0;

      // Count reversals (direction flips)
      if (dirX !== 0 && sk.lastDirX !== 0 && dirX !== sk.lastDirX) sk.reversals++;
      if (dirY !== 0 && sk.lastDirY !== 0 && dirY !== sk.lastDirY) sk.reversals++;

      if (dirX !== 0) sk.lastDirX = dirX;
      if (dirY !== 0) sk.lastDirY = dirY;
      sk.lastX = clientX;
      sk.lastY = clientY;

      // Track shake duration
      const now = Date.now();
      if (sk.reversals >= 4 && sk.shakeStart === 0) sk.shakeStart = now;
      if (sk.shakeStart > 0) sk.totalShakeTime = now - sk.shakeStart;

      // Determine stage from reversals + time
      let newStage = 0;
      if (sk.reversals >= 30 || sk.totalShakeTime > 8000) newStage = 4;
      else if (sk.reversals >= 18 || sk.totalShakeTime > 5500) newStage = 3;
      else if (sk.reversals >= 10 || sk.totalShakeTime > 3000) newStage = 2;
      else if (sk.reversals >= 5) newStage = 1;

      // Stage changed → react!
      if (newStage > sk.stage) {
        sk.stage = newStage;
        setShakeStage(newStage);
        const msgDebounce = 800;

        if (newStage === 1 && now - sk.lastMsgTime > msgDebounce) {
          sk.lastMsgTime = now;
          showBubble(randomFrom(SHAKE_STAGE1), 2000);
          setMood('excited');
          spawnParticles(posRef.current.x, posRef.current.y, 3);
        } else if (newStage === 2 && now - sk.lastMsgTime > msgDebounce) {
          sk.lastMsgTime = now;
          showBubble(randomFrom(SHAKE_STAGE2), 2500);
          setMood('excited');
          spawnParticles(posRef.current.x, posRef.current.y, 6);
        } else if (newStage === 3 && now - sk.lastMsgTime > msgDebounce) {
          sk.lastMsgTime = now;
          showBubble(randomFrom(SHAKE_STAGE3), 3000);
          spawnParticles(posRef.current.x, posRef.current.y, 10);
        } else if (newStage === 4) {
          triggerShakeExplosion();
          return;
        }
      }
      // Extra messages while shaking at stage 2+
      else if (sk.stage >= 2 && now - sk.lastMsgTime > 2000) {
        sk.lastMsgTime = now;
        const pool = sk.stage === 3 ? SHAKE_STAGE3 : SHAKE_STAGE2;
        showBubble(randomFrom(pool), 1800);
      }
    };

    const handleUp = () => {
      const wasShaking = shakeRef.current.stage;
      setIsDragging(false);
      setShakeStage(0);
      shakeRef.current.stage = 0;
      shakeRef.current.reversals = 0;
      shakeRef.current.shakeStart = 0;
      shakeRef.current.totalShakeTime = 0;

      // ── Throw detection: check velocity ──
      const { vx, vy } = velocityRef.current;
      const speed = Math.sqrt(vx * vx + vy * vy);

      if (speed > 8 && !wasShaking) {
        // It's a THROW! Béru goes flying
        const tc = ++throwCountRef.current;
        sessionStorage.setItem('beru_throw_count', String(tc));

        // Check if rage threshold reached (7+ throws → destruction)
        if (tc >= 7) {
          showBubble(randomFrom(THROW_RAGE_MESSAGES), 0);
          setMood('excited');
          spawnParticles(posRef.current.x, posRef.current.y, 12);
          setTimeout(() => {
            throwCountRef.current = 0;
            sessionStorage.setItem('beru_throw_count', '0');
            triggerRealDestruction();
          }, 1500);
          return;
        }

        setIsThrown(true);
        setThrowSpin(0);
        setMood('excited');
        showBubble(randomFrom(THROW_REACTIONS), 3500);
        spawnParticles(posRef.current.x, posRef.current.y, 4);

        // Physics animation: fly, bounce, tumble, settle
        const startX = posRef.current.x;
        const startY = posRef.current.y;
        let curVx = vx * 1.5;
        let curVy = vy * 1.5;
        let curX = startX;
        let curY = startY;
        let spin = 0;
        let bounces = 0;
        const gravity = 0.6;
        const friction = 0.7;
        const maxW = window.innerWidth - 60;
        const maxH = window.innerHeight - 60;
        let frame;

        const animate = () => {
          curVy += gravity; // gravity
          curX += curVx;
          curY += curVy;
          spin += curVx * 2; // spin based on horizontal velocity

          // Bounce off walls
          if (curX < 30) { curX = 30; curVx = -curVx * friction; bounces++; }
          if (curX > maxW) { curX = maxW; curVx = -curVx * friction; bounces++; }
          // Bounce off floor/ceiling
          if (curY > maxH) { curY = maxH; curVy = -curVy * friction; curVx *= 0.85; bounces++; }
          if (curY < 30) { curY = 30; curVy = -curVy * friction; bounces++; }

          posRef.current = { x: curX, y: curY };
          targetRef.current = { x: curX, y: curY };
          setPos({ x: curX, y: curY });
          setThrowSpin(spin);

          const totalSpeed = Math.sqrt(curVx * curVx + curVy * curVy);
          if (totalSpeed < 0.8 || bounces > 6) {
            // Settled — Béru lands
            setIsThrown(false);
            setThrowSpin(0);
            setMood('idle');
            const landMsgs = [
              "Aie... *se frotte le derriere*",
              "*crache un pixel* Ok. Ca c'est fait.",
              "Je... je vais rester la un moment...",
              "Mes keyframes... tout tourne...",
              `Ca fait ${tc} fois... tu comptes ?! MOI OUI.`,
              tc >= 4 ? "Encore une fois... ENCORE UNE SEULE FOIS... et je casse TOUT." : "T'es content la ?!",
            ];
            setTimeout(() => showBubble(randomFrom(landMsgs), 4000), 300);
            return;
          }
          frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
        return;
      }

      setMood('idle');
      if (wasShaking >= 2) {
        const relief = [
          "*respire* C'est bon... c'est fini... je suis intact...",
          "OHHH mon dieu. J'ai cru que j'allais mourir. En JAVASCRIPT.",
          "Plus JAMAIS. Tu m'entends ? PLUS. JAMAIS.",
          "Ok. Je vais aller me coucher. Bonne nuit. Non je suis pas en colere. Si un peu.",
          "*tremble encore* Mes... mes keyframes... elles reviennent...",
          "J'ai vu ma vie defiler. C'etait que du CSS.",
        ];
        showBubble(randomFrom(relief), 4000);
      } else {
        showBubble("Bon... je reste la alors.", 2000);
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, showBubble]);

  // ─── Resize handler ───────────────────────────────────────

  useEffect(() => {
    const handleResize = () => {
      posRef.current = {
        x: clamp(posRef.current.x, 40, window.innerWidth - 80),
        y: clamp(posRef.current.y, 40, window.innerHeight - 80),
      };
      targetRef.current = { ...posRef.current };
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ─── Screen Destruction Effect ──────────────────────────

  useEffect(() => {
    if (screenDestroyed) {
      document.body.style.animation = 'screenShake 0.15s linear infinite';
    } else {
      document.body.style.animation = '';
    }
    return () => { document.body.style.animation = ''; };
  }, [screenDestroyed]);

  // ─── Real Destruction Body Effect ──────────────────────────

  useEffect(() => {
    if (realDestroyPhase === 1) {
      document.body.style.animation = 'screenShakeViolent 0.08s linear infinite';
    } else if (realDestroyPhase) {
      document.body.style.animation = '';
    } else if (!screenDestroyed) {
      document.body.style.animation = '';
    }
    return () => {
      if (!screenDestroyed && !realDestroyPhase) document.body.style.animation = '';
    };
  }, [realDestroyPhase, screenDestroyed]);

  // ─── Mode Cycling ───────────────────────────────────────

  const cycleMode = () => {
    setShowModeMenu(prev => !prev);
  };

  const selectMode = (mode) => {
    setBeruMode(mode);
    localStorage.setItem('beru_mascot_mode', mode);
    setShowModeMenu(false);
    if (mode === 'calm') {
      setMood('sleeping');
      curiousModeRef.current = false;
    } else if (mode === 'normal') {
      setMood('idle');
    }
  };

  // ─── Mood Styles ──────────────────────────────────────────

  const getMoodFilter = () => {
    switch (mood) {
      case 'excited': return 'drop-shadow(0 0 14px rgba(168, 85, 247, 0.9))';
      case 'sleeping': return 'drop-shadow(0 0 6px rgba(100, 100, 200, 0.3)) brightness(0.7)';
      case 'thinking': return 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.6))';
      default: return 'drop-shadow(0 0 8px rgba(139, 0, 255, 0.5))';
    }
  };

  const getFloatSpeed = () => {
    switch (mood) {
      case 'excited': return '0.6s';
      case 'sleeping': return '5s';
      case 'thinking': return '2s';
      default: return '3s';
    }
  };

  // ─── Render ───────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes beruFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes beruShakeMild {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-3px) rotate(-2deg); }
          75% { transform: translateX(3px) rotate(2deg); }
        }
        @keyframes beruShakeMedium {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          20% { transform: translateX(-5px) rotate(-5deg); }
          40% { transform: translateX(4px) rotate(4deg); }
          60% { transform: translateX(-6px) rotate(-3deg); }
          80% { transform: translateX(5px) rotate(5deg); }
        }
        @keyframes beruShakeViolent {
          0% { transform: translate(0, 0) rotate(0deg); }
          10% { transform: translate(-8px, 3px) rotate(-8deg); }
          20% { transform: translate(6px, -4px) rotate(7deg); }
          30% { transform: translate(-7px, 2px) rotate(-6deg); }
          40% { transform: translate(8px, -3px) rotate(9deg); }
          50% { transform: translate(-5px, 5px) rotate(-10deg); }
          60% { transform: translate(7px, -2px) rotate(8deg); }
          70% { transform: translate(-8px, 4px) rotate(-7deg); }
          80% { transform: translate(6px, -5px) rotate(6deg); }
          90% { transform: translate(-7px, 3px) rotate(-9deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        @keyframes beruSleep {
          0%, 100% { transform: translateY(0px) rotate(-5deg); }
          50% { transform: translateY(-3px) rotate(5deg); }
        }
        @keyframes beruDisco {
          0% { filter: hue-rotate(0deg) drop-shadow(0 0 20px red); }
          25% { filter: hue-rotate(90deg) drop-shadow(0 0 20px lime); }
          50% { filter: hue-rotate(180deg) drop-shadow(0 0 20px cyan); }
          75% { filter: hue-rotate(270deg) drop-shadow(0 0 20px magenta); }
          100% { filter: hue-rotate(360deg) drop-shadow(0 0 20px red); }
        }
        @keyframes particleFly {
          0% { opacity: 1; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(var(--px), var(--py)) scale(0); }
        }
        @keyframes clonePulse {
          0%, 100% { opacity: 0.4; transform: scale(0.7); }
          50% { opacity: 0.7; transform: scale(0.9); }
        }
        @keyframes wanderLR {
          0% { left: -50px; opacity: 0; }
          5% { opacity: 1; }
          50% { opacity: 1; }
          95% { opacity: 1; }
          100% { left: calc(100vw + 50px); opacity: 0; }
        }
        @keyframes wanderRL {
          0% { right: -50px; opacity: 0; }
          5% { opacity: 1; }
          50% { opacity: 1; }
          95% { opacity: 1; }
          100% { right: calc(100vw + 50px); opacity: 0; }
        }
        @keyframes wanderBounce {
          0%, 100% { transform: translateY(0) scaleX(var(--dir)); }
          50% { transform: translateY(-6px) scaleX(var(--dir)); }
        }
        @keyframes wanderBubbleFade {
          0% { opacity: 0; transform: translateY(5px) scale(0.8); }
          10% { opacity: 1; transform: translateY(0) scale(1); }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes screenShake {
          0%, 100% { transform: translate(0); }
          10% { transform: translate(-8px, 5px) skewX(-1deg); }
          20% { transform: translate(8px, -5px) skewX(1deg); }
          30% { transform: translate(-6px, 8px); }
          40% { transform: translate(6px, -8px) skewX(-0.5deg); }
          50% { transform: translate(-10px, -3px); }
          60% { transform: translate(10px, 3px) skewX(0.5deg); }
          70% { transform: translate(-5px, 6px); }
          80% { transform: translate(5px, -6px); }
          90% { transform: translate(-8px, -5px) skewX(-1deg); }
        }
        @keyframes glitchFlicker {
          0% { opacity: 0; }
          5% { opacity: 0.8; clip-path: inset(20% 0 60% 0); }
          10% { opacity: 0; }
          15% { opacity: 0.6; clip-path: inset(50% 0 20% 0); }
          20% { opacity: 0; }
          30% { opacity: 0.9; clip-path: inset(10% 0 70% 0); }
          35% { opacity: 0; }
          50% { opacity: 0.7; clip-path: inset(70% 0 5% 0); }
          55% { opacity: 0; }
          70% { opacity: 0.8; clip-path: inset(5% 0 85% 0); }
          75% { opacity: 0; }
          85% { opacity: 0.5; clip-path: inset(40% 0 40% 0); }
          90% { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes screenRedFlash {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.35; }
        }
        @keyframes destructionText {
          0%, 100% { transform: scale(1) rotate(0deg); text-shadow: 0 0 20px red; }
          25% { transform: scale(1.05) rotate(-1deg); text-shadow: 0 0 40px red, 0 0 80px darkred; }
          50% { transform: scale(0.98) rotate(1deg); text-shadow: 0 0 20px red; }
          75% { transform: scale(1.03) rotate(-0.5deg); text-shadow: 0 0 60px red, 0 0 100px darkred; }
        }
        @keyframes screenShakeViolent {
          0%, 100% { transform: translate(0); }
          10% { transform: translate(-15px, 10px) skewX(-3deg) rotate(-1deg); }
          20% { transform: translate(15px, -10px) skewX(3deg) rotate(1deg); }
          30% { transform: translate(-12px, 15px) skewX(-2deg); }
          40% { transform: translate(12px, -15px) skewX(2deg) rotate(-2deg); }
          50% { transform: translate(-18px, -8px) rotate(1.5deg); }
          60% { transform: translate(18px, 8px) skewX(1deg); }
          70% { transform: translate(-10px, 12px) rotate(-1deg); }
          80% { transform: translate(10px, -12px) skewX(-1deg); }
          90% { transform: translate(-15px, -10px) skewX(2deg) rotate(2deg); }
        }
        @keyframes beruStaticFlicker {
          0%, 100% { opacity: 0; }
          5% { opacity: 0.8; }
          10% { opacity: 0; }
          15% { opacity: 0.6; }
          20% { opacity: 0; }
          30% { opacity: 0.9; }
          35% { opacity: 0; }
          50% { opacity: 0.7; }
          55% { opacity: 0; }
          70% { opacity: 0.8; }
          75% { opacity: 0; }
          85% { opacity: 0.5; }
          90% { opacity: 0; }
        }
        @keyframes rebootProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes bsodCursorBlink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes randomEventPulse {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 0.9; }
        }
        .screen-destroyed > *:not([class*="z-[99"]) {
          animation: screenShake 0.15s linear infinite !important;
        }
      `}</style>

      {/* Mode Selector Button */}
      <div className="fixed bottom-2 right-2 z-[9999]">
        <button
          onClick={cycleMode}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 text-[11px]"
          style={{
            opacity: showModeMenu ? 0.9 : 0.3,
            background: showModeMenu ? 'rgba(139, 0, 255, 0.5)' : 'rgba(139, 0, 255, 0.2)',
          }}
          title={`Mode: ${MODE_LABELS[beruMode]}`}
        >
          {MODE_ICONS[beruMode]}
        </button>
        {/* Mode menu popup */}
        <AnimatePresence>
          {showModeMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              className="absolute bottom-9 right-0 bg-gray-900/95 backdrop-blur-md rounded-xl p-2 border border-purple-500/30 shadow-xl"
              style={{ width: '140px' }}
            >
              <div className="text-[9px] text-purple-400/80 font-bold uppercase tracking-wider mb-1.5 text-center">Mode Beru</div>
              {BERU_MODES.map(mode => (
                <button
                  key={mode}
                  onClick={() => selectMode(mode)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all mb-0.5 ${
                    beruMode === mode
                      ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border border-transparent'
                  }`}
                >
                  <span className="text-sm">{MODE_ICONS[mode]}</span>
                  <div className="text-left">
                    <div>{MODE_LABELS[mode]}</div>
                    <div className="text-[8px] text-gray-500 font-normal">
                      {mode === 'normal' ? 'Se balade (loin de la souris)' : mode === 'calm' ? 'Dort en bas, mode tacos' : 'Invisible (chibis actifs)'}
                    </div>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collection Button */}
      {isVisible && (
        <button
          onClick={() => setShowCollection(!showCollection)}
          className="fixed bottom-2 right-10 z-[9997] w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 text-[10px]"
          style={{
            opacity: showCollection ? 0.7 : 0.3,
            background: showCollection ? 'rgba(139, 0, 255, 0.4)' : 'rgba(139, 0, 255, 0.15)',
          }}
          title="Collection de Chibis"
        >
          {'\uD83C\uDF92'}
        </button>
      )}

      {/* Collection Panel */}
      <AnimatePresence>
        {showCollection && isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-10 right-2 z-[9997] bg-gray-900/95 backdrop-blur-md rounded-xl p-3 border border-purple-500/30 shadow-xl"
            style={{ width: '220px' }}
          >
            <div className="text-[10px] text-purple-400/80 font-bold uppercase tracking-wider mb-2 text-center">
              Collection ({Object.keys(collection).filter(k => collection[k] > 0).length}/{WANDERING_CHIBIS.length})
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {WANDERING_CHIBIS.map(chibi => {
                const count = collection[chibi.id] || 0;
                const isDeployed = companions.includes(chibi.id);
                return (
                  <button
                    key={chibi.id}
                    onClick={() => count > 0 && toggleCompanion(chibi.id)}
                    className={`flex flex-col items-center p-1 rounded-lg transition-all ${
                      count > 0 ? 'hover:bg-purple-500/20 cursor-pointer' : 'opacity-25 cursor-not-allowed'
                    } ${isDeployed ? 'bg-purple-500/30 ring-1 ring-purple-400/60' : ''} ${chibi.collectOnly && count > 0 ? 'ring-1 ring-pink-400/40' : ''}`}
                    disabled={count === 0}
                    title={count > 0 ? `${chibi.name} (x${count}) — ${chibi.collectOnly ? 'Compagnon unique !' : isDeployed ? 'Retirer' : 'Deployer'}` : `${chibi.name} — ${chibi.collectOnly ? '???' : 'Pas encore capture'}`}
                  >
                    <img
                      src={chibi.sprite}
                      alt={chibi.name}
                      className="w-8 h-8 object-contain"
                      style={{
                        filter: count > 0 ? RARITY_GLOW[chibi.rarity] : 'grayscale(1) brightness(0.3)',
                        imageRendering: 'auto',
                      }}
                    />
                    <span className={`text-[7px] mt-0.5 truncate w-full text-center ${
                      chibi.collectOnly ? (count > 0 ? 'text-pink-400' : '!text-gray-600') :
                      chibi.rarity === 'mythique' ? 'text-red-400' :
                      chibi.rarity === 'legendaire' ? 'text-orange-400' : 'text-blue-400'
                    } ${count === 0 && !chibi.collectOnly ? '!text-gray-600' : ''}`}>
                      {chibi.collectOnly && count === 0 ? '???' : chibi.name}
                    </span>
                    {count > 0 && (
                      <span className="text-[7px] text-yellow-400/80">x{count}</span>
                    )}
                    {isDeployed && (
                      <span className="text-[6px] text-purple-300">actif</span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="text-[8px] text-gray-600 text-center mt-2">
              Clique pour deployer/retirer (max 2)
            </div>
            {companions.length > 0 && (
              <div className="text-[8px] text-purple-400/60 text-center mt-1">
                {companions.length}/2 compagnons actifs
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Beru Mascot */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.5 }}
            className="fixed z-[9998]"
            style={{
              left: pos.x,
              top: pos.y,
              pointerEvents: 'auto',
              willChange: 'left, top',
            }}
          >
            {/* Particles */}
            {particles.map(p => (
              <span
                key={p.id}
                className="absolute text-lg pointer-events-none"
                style={{
                  '--px': `${p.x}px`,
                  '--py': `${p.y}px`,
                  animation: 'particleFly 1.2s ease-out forwards',
                  left: '50%',
                  top: '50%',
                }}
              >
                {p.emoji}
              </span>
            ))}

            {/* Clone Easter Egg */}
            {secretMode === 'clone' && (
              <>
                {[...Array(4)].map((_, i) => (
                  <img
                    key={i}
                    src={BERU_SPRITE}
                    alt=""
                    className="absolute w-8 h-8 pointer-events-none"
                    style={{
                      left: `${(i % 2 === 0 ? -1 : 1) * (25 + i * 10)}px`,
                      top: `${(i < 2 ? -1 : 1) * (20 + i * 5)}px`,
                      animation: `clonePulse ${1 + i * 0.3}s ease-in-out infinite`,
                      imageRendering: 'auto',
                    }}
                  />
                ))}
              </>
            )}

            {/* Floating Image (easter eggs, special events) */}
            <AnimatePresence>
              {bubbleImage && (
                <motion.div
                  key="beru-floating-image"
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: -20 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-14 pointer-events-none z-50"
                >
                  <img
                    src={typeof bubbleImage === 'string' ? bubbleImage : bubbleImage.src}
                    alt=""
                    className="w-28 h-28 md:w-36 md:h-36 rounded-xl shadow-lg shadow-purple-500/30 border border-purple-400/40 object-cover"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Speech Bubble - position-aware */}
            <AnimatePresence>
              {(bubble || storyActive) && (() => {
                const nearRight = posRef.current.x > window.innerWidth - 220;
                const nearLeft = posRef.current.x < 180;
                const alignClass = nearRight
                  ? 'right-0'
                  : nearLeft
                    ? 'left-0'
                    : 'left-1/2 -translate-x-1/2';
                const arrowClass = nearRight
                  ? 'right-4'
                  : nearLeft
                    ? 'left-4'
                    : 'left-1/2 -translate-x-1/2';
                // Story text comes directly from storyActive state — cannot be overwritten
                const isStory = !!storyActive;
                const displayText = isStory
                  ? `📖 ${storyActive.partIndex === 0 ? BERU_STORIES[storyActive.storyIndex].title + ' — "' : '"'}${BERU_STORIES[storyActive.storyIndex].parts[storyActive.partIndex]}"`
                  : bubble;
                if (!displayText) return null;
                return (
                  <motion.div
                    key={isStory ? 'story' : 'bubble'}
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.8 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className={`absolute bottom-full ${alignClass} mb-2 w-max max-w-[200px] md:max-w-[250px]`}
                  >
                    <div
                      onClick={(e) => { if (isStory) { e.stopPropagation(); advanceStory(); } }}
                      className={`relative backdrop-blur-sm text-white text-[11px] md:text-xs px-3 py-2 rounded-xl shadow-lg ${
                      isStory
                        ? 'bg-indigo-950/95 border border-indigo-400/50 shadow-indigo-900/40 max-w-[260px] md:max-w-[320px] cursor-pointer'
                        : 'bg-gray-900/95 border border-purple-500/40 shadow-purple-900/30'
                    }`}>
                      <span className="leading-relaxed">{displayText}</span>
                      {isStory && (
                        <div className="mt-1.5 text-[9px] text-indigo-300/70 italic text-right">
                          {storyActive.partIndex + 1}/{BERU_STORIES[storyActive.storyIndex].parts.length} — clique pour la suite...
                        </div>
                      )}
                      <div className={`absolute -bottom-1.5 ${arrowClass} w-3 h-3 rotate-45 ${isStory ? 'bg-indigo-950/95 border-r border-b border-indigo-400/50' : 'bg-gray-900/95 border-r border-b border-purple-500/40'}`} />
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>

            {/* Mood Indicators */}
            <AnimatePresence>
              {mood === 'sleeping' && !bubble && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute -top-5 left-1/2 -translate-x-1/2 text-lg"
                  style={{ animation: 'beruFloat 2s ease-in-out infinite' }}
                >
                  {'\uD83D\uDCA4'}
                </motion.div>
              )}
              {mood === 'thinking' && !bubble && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  exit={{ opacity: 0 }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs text-blue-400 font-bold"
                >
                  ...
                </motion.div>
              )}
            </AnimatePresence>

            {/* Click Combo Counter */}
            <AnimatePresence>
              {clickCombo >= 3 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-3 -right-3 bg-red-500 text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                >
                  {clickCombo}x
                </motion.div>
              )}
            </AnimatePresence>

            {/* Beru Sprite */}
            <motion.div
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              onClick={handleClick}
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
              className="cursor-grab active:cursor-grabbing select-none"
              style={{
                animation: shakeStage >= 3
                  ? 'beruShakeViolent 0.08s linear infinite'
                  : shakeStage >= 2
                    ? 'beruShakeMedium 0.12s linear infinite'
                    : shakeStage >= 1
                      ? 'beruShakeMild 0.2s linear infinite'
                      : mood === 'sleeping'
                        ? 'beruSleep 5s ease-in-out infinite'
                        : secretMode === 'konami'
                          ? 'beruDisco 1s linear infinite'
                          : `beruFloat ${getFloatSpeed()} ease-in-out infinite`,
                filter: shakeStage >= 3
                  ? 'saturate(2) brightness(1.3) hue-rotate(20deg)'
                  : shakeStage >= 2
                    ? 'saturate(1.5) brightness(1.15) drop-shadow(0 0 8px rgba(255,50,50,0.6))'
                    : shakeStage >= 1
                      ? 'brightness(1.1) drop-shadow(0 0 4px rgba(255,150,0,0.4))'
                      : secretMode === 'konami' ? undefined : getMoodFilter(),
                transform: `scaleX(${facingLeft ? -1 : 1})${isThrown ? ` rotate(${throwSpin}deg)` : ''}`,
              }}
            >
              <img
                src={BERU_SPRITE}
                alt="Beru"
                className="w-14 h-14 md:w-[72px] md:h-[72px] object-contain pointer-events-none"
                style={{ imageRendering: 'auto' }}
                draggable={false}
              />
            </motion.div>

            {/* Chat history button */}
            {chatHistory.length > 0 && !isDragging && !shakeStage && (
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gray-800/90 border border-purple-500/40 flex items-center justify-center cursor-pointer hover:bg-purple-500/30 hover:border-purple-400/60 transition-all z-10"
                onClick={(e) => { e.stopPropagation(); setShowChatHistory(prev => !prev); }}
                title="Historique des messages"
              >
                <span className="text-[8px] text-purple-300 font-bold leading-none">...</span>
              </div>
            )}

            {/* Shake warning indicators */}
            {shakeStage >= 2 && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-lg pointer-events-none"
                style={{ animation: 'beruShakeMild 0.15s linear infinite' }}>
                {shakeStage >= 3 ? '\uD83D\uDCA5' : '\u26A0\uFE0F'}
              </div>
            )}
            {shakeStage >= 3 && (
              <>
                <div className="absolute -top-2 -left-3 text-sm pointer-events-none" style={{ animation: 'particleFly 0.6s linear infinite' }}>{'\u2728'}</div>
                <div className="absolute -top-2 -right-3 text-sm pointer-events-none" style={{ animation: 'particleFly 0.8s linear infinite 0.2s' }}>{'\uD83D\uDD25'}</div>
                <div className="absolute -bottom-2 left-0 text-sm pointer-events-none" style={{ animation: 'particleFly 0.7s linear infinite 0.4s' }}>{'\u26A1'}</div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ DEPLOYED COMPANIONS ═══ */}
      {isVisible && companions.map((chibiId, i) => {
        const chibi = WANDERING_CHIBIS.find(c => c.id === chibiId);
        if (!chibi) return null;
        // In calm mode (bottom-right corner), stack companions to the LEFT of Béru
        const offsets = isCalm
          ? [{ x: -50, y: 10 }, { x: -95, y: 10 }]
          : [{ x: -45, y: 32 }, { x: 55, y: 28 }];
        const offset = offsets[i] || offsets[0];
        return (
          <div
            key={`companion-${chibiId}`}
            className="fixed z-[9997] pointer-events-none"
            style={{
              left: pos.x + offset.x,
              top: pos.y + offset.y,
              willChange: 'left, top',
              transition: 'left 0.15s ease-out, top 0.15s ease-out',
            }}
          >
            {/* Companion speech bubble */}
            <AnimatePresence>
              {companionBubble?.companionId === chibiId && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.8 }}
                  className={`absolute bottom-full mb-1 w-max max-w-[160px] ${
                    isCalm ? 'right-0' : 'left-1/2 -translate-x-1/2'
                  }`}
                >
                  <div className="bg-gray-800/90 backdrop-blur-sm text-white text-[9px] px-2 py-1 rounded-lg border border-white/20 shadow-lg">
                    <span className="leading-relaxed">{companionBubble.text}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Companion sprite */}
            <img
              src={chibi.sprite}
              alt={chibi.name}
              className="w-8 h-8 md:w-10 md:h-10 object-contain"
              style={{
                animation: `beruFloat ${3.5 + i * 0.8}s ease-in-out infinite`,
                filter: RARITY_GLOW[chibi.rarity],
                transform: `scaleX(${facingLeft ? -1 : 1})`,
                imageRendering: 'auto',
              }}
              draggable={false}
            />
            {/* Name tag */}
            <div className="text-center mt-0.5">
              <span className={`text-[6px] font-bold uppercase tracking-wider ${
                chibi.rarity === 'mythique' ? 'text-red-400/70' :
                chibi.rarity === 'legendaire' ? 'text-orange-400/70' : 'text-blue-400/70'
              }`}>
                {chibi.name}
              </span>
            </div>
          </div>
        );
      })}

      {/* ═══ CHAT HISTORY PANEL ═══ */}
      <AnimatePresence>
        {showChatHistory && isVisible && (() => {
          const now = Date.now();
          const cutoff = now - 300000;
          const messages = chatHistory.filter(m => m.time > cutoff);
          if (messages.length === 0) {
            setTimeout(() => setShowChatHistory(false), 0);
            return null;
          }
          const nearRight = posRef.current.x > window.innerWidth - 260;
          return (
            <motion.div
              key="chat-history"
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="fixed z-[10001]"
              style={{
                left: nearRight ? posRef.current.x - 210 : posRef.current.x + 20,
                top: Math.max(10, posRef.current.y - 200),
              }}
            >
              <div className="w-[220px] max-h-[240px] rounded-xl bg-gray-900/95 backdrop-blur-md border border-purple-500/30 shadow-xl shadow-purple-900/20 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-purple-500/20">
                  <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider">Historique</span>
                  <button onClick={() => setShowChatHistory(false)} className="text-gray-500 hover:text-white text-xs leading-none">x</button>
                </div>
                <div className="overflow-y-auto max-h-[200px] px-2 py-1.5 space-y-1.5 scrollbar-thin">
                  {messages.map(m => {
                    const ago = Math.floor((now - m.time) / 1000);
                    const agoStr = ago < 60 ? `${ago}s` : `${Math.floor(ago / 60)}m`;
                    const isBeru = m.sender === 'Beru';
                    return (
                      <div key={m.id} className="flex gap-1.5 items-start">
                        <div className={`text-[8px] font-bold mt-0.5 shrink-0 ${isBeru ? 'text-purple-400' : 'text-cyan-400'}`}>
                          {m.sender}
                        </div>
                        <div className="text-[9px] text-gray-300 leading-tight flex-1 min-w-0">{m.text}</div>
                        <div className="text-[7px] text-gray-600 shrink-0 mt-0.5">{agoStr}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Wandering Chibi Apparition - CLICKABLE ! (always visible, even in hidden mode) */}
      {wanderer && (
        <div
          className="fixed z-[9996] cursor-pointer group/wander"
          style={{
            top: wanderer.y,
            animation: `${wanderer.fromLeft ? 'wanderLR' : 'wanderRL'} 12s linear forwards`,
            pointerEvents: 'auto',
          }}
          onClick={handleCatchWanderer}
        >
          {/* Hover hint */}
          <div
            className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover/wander:opacity-100 transition-opacity duration-200"
          >
            <div className="bg-yellow-500/90 text-black text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
              Clique pour capturer ! +{RARITY_COINS[wanderer.chibi.rarity] || 50} coins
            </div>
          </div>
          {/* Wanderer bubble */}
          {wanderer.bubble && (
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 whitespace-nowrap pointer-events-none"
              style={{ animation: 'wanderBubbleFade 4s ease-out forwards', animationDelay: '2s', opacity: 0 }}
            >
              <div className="bg-gray-900/90 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-lg border border-white/20 shadow-md">
                {wanderer.bubble}
              </div>
            </div>
          )}
          {/* Wanderer sprite */}
          <img
            src={wanderer.chibi.sprite}
            alt={wanderer.chibi.name}
            className="w-12 h-12 md:w-14 md:h-14 object-contain transition-transform duration-200 group-hover/wander:scale-125"
            style={{
              '--dir': wanderer.fromLeft ? '1' : '-1',
              animation: 'wanderBounce 0.8s ease-in-out infinite',
              filter: RARITY_GLOW[wanderer.chibi.rarity] || 'none',
              imageRendering: 'auto',
            }}
            draggable={false}
          />
          {/* Rarity indicator */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className={`text-[8px] font-bold uppercase tracking-wider ${
              wanderer.chibi.rarity === 'mythique' ? 'text-red-400' :
              wanderer.chibi.rarity === 'legendaire' ? 'text-orange-400' : 'text-blue-400'
            }`}>
              {wanderer.chibi.name}
            </span>
          </div>
        </div>
      )}

      {/* Catch Feedback Animation */}
      <AnimatePresence>
        {catchFeedback && (
          <motion.div
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -80, scale: 1.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            className="fixed z-[10000] pointer-events-none text-center"
            style={{ left: catchFeedback.x, top: catchFeedback.y, transform: 'translateX(-50%)' }}
          >
            <div className="text-yellow-400 font-extrabold text-lg md:text-xl drop-shadow-lg">
              +{catchFeedback.coins} coins !
            </div>
            <div className="text-white text-[11px] md:text-xs font-medium drop-shadow-lg mt-0.5">
              {catchFeedback.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SCREEN DESTRUCTION OVERLAY */}
      <AnimatePresence>
        {screenDestroyed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[99990] pointer-events-none overflow-hidden"
          >
            {/* Red flash */}
            <div
              className="absolute inset-0 bg-red-900/25"
              style={{ animation: 'screenRedFlash 0.4s ease-in-out infinite' }}
            />

            {/* Glitch bars */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full"
                style={{
                  top: `${(i * 8.5) + Math.random() * 3}%`,
                  height: `${2 + Math.random() * 4}px`,
                  background: `linear-gradient(90deg, transparent ${Math.random() * 20}%, rgba(255,0,0,0.4) ${20 + Math.random() * 20}%, rgba(0,255,255,0.3) ${50 + Math.random() * 10}%, transparent ${70 + Math.random() * 20}%)`,
                  animation: `glitchFlicker ${0.1 + Math.random() * 0.2}s linear infinite`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}

            {/* Scan lines */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
                animation: 'glitchFlicker 0.3s linear infinite',
              }}
            />

            {/* KIIIEK text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="text-red-500 text-5xl md:text-7xl font-black"
                style={{ animation: 'destructionText 0.3s ease-in-out infinite' }}
              >
                KIIIEK !!!
              </div>
            </div>

            {/* Corner cracks (pseudo) */}
            <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-red-500/60 opacity-80" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
            <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-red-500/60 opacity-80" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }} />
            <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-red-500/60 opacity-80" style={{ clipPath: 'polygon(0 0, 0 100%, 100% 100%)' }} />
            <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-red-500/60 opacity-80" style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ REAL DESTRUCTION OVERLAY ═══ */}
      <AnimatePresence>
        {realDestroyPhase && realDestroyPhase >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: realDestroyPhase === 2 ? 0.5 : 0.3 }}
            className="fixed inset-0 z-[99999] overflow-hidden"
          >
            {/* Phase 2: Static Noise */}
            {realDestroyPhase === 2 && (
              <div className="absolute inset-0 bg-black">
                {/* Scan lines */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px)',
                  }}
                />
                {/* Static bars */}
                {[...Array(25)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full"
                    style={{
                      top: `${(i * 4) + Math.random() * 2}%`,
                      height: `${1 + Math.random() * 4}px`,
                      background: `linear-gradient(90deg, transparent ${Math.random() * 15}%, rgba(255,255,255,${0.08 + Math.random() * 0.15}) ${20 + Math.random() * 20}%, rgba(0,255,255,${0.05 + Math.random() * 0.1}) ${50 + Math.random() * 10}%, transparent ${70 + Math.random() * 25}%)`,
                      animation: `beruStaticFlicker ${0.05 + Math.random() * 0.15}s steps(2) infinite`,
                      animationDelay: `${i * 0.02}s`,
                    }}
                  />
                ))}
                {/* Big glitch blocks */}
                {[...Array(6)].map((_, i) => (
                  <div
                    key={`block-${i}`}
                    className="absolute"
                    style={{
                      top: `${Math.random() * 90}%`,
                      left: `${Math.random() * 80}%`,
                      width: `${20 + Math.random() * 40}%`,
                      height: `${3 + Math.random() * 8}%`,
                      background: `rgba(${Math.random() > 0.5 ? '255,0,0' : '0,255,255'}, ${0.05 + Math.random() * 0.1})`,
                      animation: `beruStaticFlicker ${0.08 + Math.random() * 0.12}s steps(3) infinite`,
                      animationDelay: `${Math.random() * 0.3}s`,
                    }}
                  />
                ))}
                {/* SIGNAL LOST text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="text-white/20 text-3xl md:text-5xl font-mono font-bold tracking-widest"
                    style={{ animation: 'beruStaticFlicker 0.15s steps(2) infinite' }}
                  >
                    SIGNAL LOST
                  </div>
                </div>
              </div>
            )}

            {/* Phase 3: BSOD */}
            {realDestroyPhase === 3 && (
              <div className="absolute inset-0 bg-[#0078d7] flex items-start p-8 md:p-16 lg:p-20">
                <div className="text-white max-w-2xl">
                  <div className="text-[100px] md:text-[140px] leading-none mb-6" style={{ fontFamily: 'Segoe UI, sans-serif' }}>:(</div>
                  <div className="text-lg md:text-xl mb-4 font-light" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
                    Your BuilderBeru ran into a problem caused by <span className="font-bold">BERU.exe</span> and needs to restart.
                  </div>
                  <div className="text-sm md:text-base opacity-70 mb-6 font-light" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
                    We're just collecting some error info, and then we'll restart for you.
                  </div>
                  <div className="text-sm md:text-base opacity-50 mb-2 font-mono">
                    Stop Code: BERU_KIIIEK_CRITICAL_DESTRUCTION
                  </div>
                  <div className="text-sm md:text-base opacity-50 mb-1 font-mono">
                    Error: 0xBERU_N1_OVERFLOW
                  </div>
                  <div className="text-xs md:text-sm opacity-40 mb-6 font-mono">
                    The Shadow Soldier N1 has terminated all processes.
                  </div>
                  <div className="text-xs md:text-sm opacity-60 font-mono flex items-center gap-1">
                    <span>100% complete</span>
                    <span style={{ animation: 'bsodCursorBlink 1s steps(1) infinite' }}>_</span>
                  </div>
                  <div className="mt-8 text-[10px] md:text-xs opacity-30 font-mono">
                    If you'd like to know more, search online for: BERU_CLICKED_TOO_MANY_TIMES
                  </div>
                </div>
              </div>
            )}

            {/* Phase 4: Reboot */}
            {realDestroyPhase === 4 && (
              <div className="absolute inset-0 bg-black flex flex-col items-center justify-center gap-6">
                <img
                  src={BERU_SPRITE}
                  alt="Beru"
                  className="w-16 h-16 md:w-20 md:h-20 object-contain"
                  style={{
                    filter: 'drop-shadow(0 0 20px rgba(139, 0, 255, 0.6))',
                    animation: 'beruFloat 1.5s ease-in-out infinite',
                    imageRendering: 'auto',
                  }}
                />
                <div className="text-white/50 text-xs md:text-sm font-mono">
                  Shadow System Recovery...
                </div>
                <div className="w-48 md:w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-violet-500 rounded-full"
                    style={{ animation: 'rebootProgress 2s ease-out forwards' }}
                  />
                </div>
                <div className="text-white/30 text-[10px] font-mono mt-2">
                  Restoring components... Please don't click Beru again.
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Random Event Feedback */}
      <AnimatePresence>
        {randomEventFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="fixed z-[99995] pointer-events-none"
            style={{ top: '30%', left: '50%', transform: 'translateX(-50%)' }}
          >
            <div className="bg-gradient-to-r from-yellow-600/90 to-amber-600/90 backdrop-blur-md rounded-2xl px-6 py-4 border border-yellow-400/50 shadow-2xl shadow-yellow-900/50 text-center">
              <div className="text-3xl mb-2" style={{ animation: 'randomEventPulse 1s ease-out' }}>
                {RANDOM_EVENTS.find(e => e.message === randomEventFeedback.text)?.particles || '🌟'}
              </div>
              <div className="text-yellow-100 text-sm md:text-base font-bold">
                +{randomEventFeedback.coins} Shadow Coins !
              </div>
              <div className="text-yellow-200/80 text-[10px] md:text-xs mt-1">
                {randomEventFeedback.text}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingBeruMascot;
