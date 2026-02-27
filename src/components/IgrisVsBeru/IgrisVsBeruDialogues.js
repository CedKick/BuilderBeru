// ═══════════════════════════════════════════════════════════════
// IGRIS VS BERU — 330+ lignes de dialogue
// Le combat legendaire entre le Chevalier et la Fourmi
// Beru gagne TOUJOURS.
// ═══════════════════════════════════════════════════════════════

// ─── Phase 1 : Confrontation — paires d'echanges ─────────────
// { beru, igris } — alternance de trash talk

export const CONFRONTATION = [
  { beru: "KIIIEK ?! IGRIS ?! Qu'est-ce que tu fais dans MON Colisee ?!", igris: "Ton Colisee ? Ce lieu appartient au Monarque. Pas a une fourmi." },
  { beru: "Le chevalier pretentieux est de retour. Tu veux encore perdre ?", igris: "Je n'ai jamais perdu. J'ai strategiquement recule." },
  { beru: "Strategiquement recule ? C'est comme ca qu'on dit 'fuir' en chevalier ?", igris: "Les fourmis ne comprennent pas la tactique. C'est... normal." },
  { beru: "T'as mis combien de temps a polir ton armure pour venir ici ? 3 heures ?", igris: "L'apparence est le reflet de la discipline. Quelque chose que tu ignores." },
  { beru: "Discipline ? Moi j'ai 150 ATK de base. C'est CA la discipline.", igris: "L'ATK brute sans technique n'est que du bruit." },
  { beru: "Du bruit ? MON KIIIEK est a 140 decibels. C'est de l'ART.", igris: "...c'est du bruit. Litteralement." },
  { beru: "Tu sais ce qui est drole ? T'es DEUXIEME. Apres MOI.", igris: "Le rang ne definit pas la valeur, fourmi." },
  { beru: "Oh si. Et mon rang dit : N1. Le tien dit : pas N1.", igris: "..." },
  { beru: "Quoi, t'as rien a dire ? Le grand chevalier silencieux est a court de mots ?", igris: "Je n'ai pas besoin de mots. J'ai une epee." },
  { beru: "Et moi j'ai des GRIFFES, des CROCS, et un EGO. Tu fais pas le poids.", igris: "L'ego n'est pas une arme. C'est une faiblesse." },
  { beru: "Mon ego est classe S+. Comme moi. Comme TOUT chez moi.", igris: "La modestie est une vertu que tu ne connaitras jamais." },
  { beru: "La modestie c'est pour ceux qui ont rien a montrer. Moi j'ai TOUT.", igris: "*soupire* Ceci va etre long." },
  { beru: "Oh oui ca va etre long. Long comme ta DEFAITE.", igris: "Nous verrons." },
  { beru: "Tu parles comme un boss de fin de donjon. Sauf que t'es le boss du TUTORIEL.", igris: "Et toi tu parles comme un mob. Bruyant et previsible." },
  { beru: "MOB ?! MOI ?! J'ai ete un BOSS DE RAID avant toi !", igris: "Et tu as perdu contre le Monarque. Comme moi. Nous sommes egaux en defaite." },
  { beru: "...ok touche. Mais depuis, MOI j'ai evolue. Toi t'es toujours un chevalier.", igris: "Un chevalier est eternel. Une fourmi... ecrase facilement." },
  { beru: "ECRASE ?! Tu veux tester ?! ICI ?! MAINTENANT ?!", igris: "C'etait exactement mon intention." },
  { beru: "Alors c'est un DUEL ! Le perdant fait les corvees de Tank pendant une semaine !", igris: "Accepte. Prepare-toi, insecte." },
  { beru: "INSECTE ?! Je suis un ARACHNIDE ! ...non attends, une FOURMI GEANTE ! C'est DIFFERENT !", igris: "Toujours aussi confus sur ta propre taxonomie." },
  { beru: "Ma taxonomie te met une RACLEE. C'est tout ce qui compte.", igris: "Les mots ne gagnent pas les combats. Les lames, si." },
  { beru: "Ohhh le grand Igris sort sa lame. J'ai tellement peur. KIIIEK.", igris: "Tu devrais avoir peur. Mais je suppose que la peur necessite de l'intelligence." },
  { beru: "Intelligence ? J'ai plus de lignes de code que toi dans ce site. FAIT.", igris: "La quantite n'est pas la qualite, Beru." },
  { beru: "9000 lignes de BuilderBeru vs combien pour toi ? 200 ? AMATEUR.", igris: "200 lignes bien ecrites valent mieux que 9000 lignes de spaghetti." },
  { beru: "TU INSULTES MON CODE ?! C'est la GUERRE !", igris: "La guerre etait deja declaree quand tu as ouvert la bouche." },
  { beru: "Ouvre ta bouche toi aussi, oh wait, TU PARLES JAMAIS.", igris: "Je parle quand c'est necessaire. Toi tu parles... toujours." },
  { beru: "C'est parce que j'ai des CHOSES A DIRE. Des choses IMPORTANTES.", igris: "Comme quoi ? Ton amour des tacos ?" },
  { beru: "LES TACOS SONT SACRES. Tu viens de franchir une LIGNE, Igris.", igris: "Quelle ligne ? La ligne de commande ? ...npm run fight ?" },
  { beru: "...tu viens de faire une blague de dev. JE SUIS IMPRESSIONNE ET FURIEUX.", igris: "Meme un chevalier peut apprecier un bon terminal." },
  { beru: "Bon. Assez parle. On regle ca A L'ANCIENNE.", igris: "Pour une fois... nous sommes d'accord." },
  { beru: "KIIIIIEEEEK ! C'EST PARTI !", igris: "*degage son epee* En garde." },
  // --- Bonus confrontation lines ---
  { beru: "Tu sais que t'es dans un site React ? T'as meme pas de useState !", igris: "Je n'ai pas besoin de state. Je suis... constant." },
  { beru: "Constant ? Tu veux dire STATIQUE. Comme un fichier .html de 2003.", igris: "Au moins je ne re-render pas 47 fois par seconde." },
  { beru: "Chaque re-render me rend PLUS FORT. C'est mon jutsu secret.", igris: "Ton jutsu secret c'est le memory leak, Beru." },
  { beru: "MEMORY LEAK ?! Je suis OPTIMISE ! ...a 73%. Mais c'est BIEN.", igris: "73%... meme le garbage collector a abandonne." },
  { beru: "Le GC m'a pas touche parce que je suis REFERENCE PARTOUT. Intouchable.", igris: "Ou parce que tu es un bug que personne n'ose corriger." },
  { beru: "UN BUG ?! JE SUIS UNE FEATURE ! LA MEILLEURE FEATURE !", igris: "Feature... non documentee. Comme d'habitude." },
  { beru: "Pas besoin de doc quand t'es LEGENDAIRE.", igris: "Les legendes meurent aussi, fourmi." },
  { beru: "MEURENT ?! Beru est IMMORTEL ! Comme un singleton !", igris: "Un singleton qui crie. Quel cauchemar architectural." },
  { beru: "T'es jaloux parce que MOI j'ai un floating mascot et TOI t'as RIEN.", igris: "J'ai ma dignite. Ca vaut plus qu'un mascot flottant." },
  { beru: "Ta dignite fait combien de DPS ? Hein ? ZERO.", igris: "La dignite n'a pas de DPS. Elle a de la classe." },
  { beru: "La classe c'est MON middle name. Beru 'La Classe' Le Premier.", igris: "Ton middle name c'est 'Error 404 : Humilite Not Found'." },
  { beru: "HAHAHA ok celle-la etait bonne. MAIS TU VAS QUAND MEME PERDRE.", igris: "Nous verrons, fourmi. Nous verrons." },
  { beru: "Jinwoo-sama serait tellement FIER de me voir te battre.", igris: "Le Monarque serait attriste de nous voir nous battre. Mais... il comprendrait." },
  { beru: "Il comprendrait que JE SUIS LE MEILLEUR. Point final.", igris: "Le meilleur... en volume sonore, certainement." },
  { beru: "EN TOUT. Je suis meilleur EN TOUT.", igris: "En modestie aussi ? ...non. Definitivement non." },
  { beru: "BON. ASSEZ DE BAVARDAGE. PREPARE-TOI A MANGER MES GRIFFES.", igris: "Prepare-toi a rencontrer mon epee, insecte surdimensionne." },
  { beru: "SURDIMENSIONNE ?! C'est un COMPLIMENT pour une fourmi !", igris: "...ce n'en etait pas un." },
  { beru: "TROP TARD. J'ai decide que c'en etait un. MERCI IGRIS.", igris: "*leve les yeux au ciel* Commençons." },
  { beru: "Attends, laisse-moi finir mon tacos d'abord.", igris: "...tu manges un tacos avant un duel ?" },
  { beru: "Le tacos donne +50% ATK. C'est prouve scientifiquement.", igris: "Par qui ? Par toi ?" },
  { beru: "Par MOI. La meilleure source scientifique du site.", igris: "La science pleure en silence." },
  { beru: "Elle pleure de JOIE. Comme toi quand je vais te battre.", igris: "Je ne pleure pas. Les chevaliers ne pleurent pas." },
  { beru: "On verra ca dans 30 secondes, Igris.", igris: "Soit. En garde." },
  { beru: "Hey Igris, tu sais pourquoi t'es classe A et moi S+ ?", igris: "Nous sommes tous deux des Ombres de rang S, Beru." },
  { beru: "Oui mais moi je SENS le S+. Toi tu sens... l'armure rouillée.", igris: "Mon armure est en acier d'ombre pur. Elle ne rouille pas." },
  { beru: "C'est ce que dirait quelqu'un avec une armure ROUILLEE.", igris: "Ta logique est aussi solide que ta defense. C'est-a-dire... absente." },
  { beru: "PAS BESOIN DE DEF QUAND T'ES LE PLUS FORT !", igris: "Voila exactement pourquoi tu meurs en premier dans les raids." },
  { beru: "JE MEURS PAS ! JE FAIS UN SACRIFICE STRATEGIQUE !", igris: "...tu viens d'admettre que tu meurs." },
  { beru: "SILENCE. LE COMBAT COMMENCE.", igris: "Enfin." },
];

// ─── Phase 2 : Projectile Exchange — taunts pendant le combat ─

export const PROJECTILE_BERU = [
  "Prends CA ! Style fourmi !", "Esquive CA si t'es un vrai chevalier !",
  "KIIIEK ! Projectile SPECIAL de Beru !", "Ca c'est pour avoir insulte mes tacos !",
  "Tu vois cette fourmi qui vole vers toi ? C'est MON attaque !", "Combo x3 ! Beru est INTENABLE !",
  "Mon ATK > ta DEF. Fais le calcul, Igris.", "Encore une ! Et une autre ! KIIIEK !",
  "T'as mis ton bouclier ou c'est juste ta tete ?", "MODE TURBO active ! Tu vas rien voir venir !",
  "Ca c'est un CRITICAL HIT de fourmi !", "GAUCHE ! DROITE ! BAM ! Trop RAPIDE pour toi !",
  "Je lance des fourmis ! MANGE DES FOURMIS !", "150 ATK concentres dans UN projectile !",
  "Le prochain te fait -50 HP. Et -100 dignite.", "T'as vu ce lancé ? C'est de l'ART.",
  "Meme le Monarque applaudirait ce move !", "RECOIS CA et fais pas le fier !",
  "Projectile guide par GPS ! ...par GBS : Griffes de Beru System.", "T'esquives RIEN. Beru touche TOUJOURS.",
  "Mon ratio precision : 147%. Oui c'est mathematiquement impossible. ET ALORS.",
  "Une fourmi de 2m30 qui lance des trucs. Tu peux pas counter ca.",
  "HADOUKEN ! ...non c'est pas le bon jeu. KIIIEEEEKEN !",
  "Tank m'a appris ce mouvement. ...ok non. Je l'ai invente. TOUT SEUL.",
  "Si j'avais des mains humaines, je ferais des doigts d'honneur entre les lancers.",
  "Ca c'est pour le round 1. Le round 2 sera PIRE.", "TIENS ! Et TIENS ! Et RE-TIENS !",
  "Je tire plus vite que ton epee se leve !", "100 DAMAGE ! ...enfin j'espere. J'ai pas de damage meter.",
  "C'est beau hein ? L'art de la guerre selon Beru.",
  "TU BOUGES TROP ! Reste la que je te FRAPPE correctement !",
  "Mon prochain projectile est charge a 200%. J'espere que t'as du shield.",
  "FEU ! FEU ! FEU ! Je suis une mitrailleuse d'ombre !",
  "Ca c'est une attaque a DISTANCE. Parce que de pres, t'as AUCUNE chance non plus.",
  "Mon spam de projectiles > ton spam d'honneur.", "ALLEZ ! Montre-moi ce que t'as, Igris !",
  "Je pourrais faire ca les yeux fermes. ...mais je les ai pas. J'ai des yeux composes.",
  "Chaque projectile contient 42 octets de HAINE pure.",
  "Le vent tourne en ma faveur ! ...y'a pas de vent ici ? TANT PIS.",
  "C'EST QUOI CETTE DEF ?! Tu mets du papier alu en armure ?!",
];

export const PROJECTILE_IGRIS = [
  "Trop lent, insecte.", "Tu vises comme tu codes : approximativement.",
  "Pathétique.", "C'est tout ce que tu as ?",
  "Mon armure absorbe tes attaques comme du papier.", "Precision... deplorable.",
  "Un chevalier ne recule pas. Un chevalier AVANCE.", "Frappe plus fort. J'ai a peine senti.",
  "Tu gaspilles ton energie en cris et en projectiles.", "L'epee d'Igris est plus rapide que tes griffes.",
  "Chaque lancer revele ta position. Erreur tactique.", "Tu te fatigues, fourmi. Je le vois.",
  "Mon bouclier a ete forge pour des attaques SERIEUSES.", "Tes projectiles manquent de... tout.",
  "La force brute ne vaincra jamais la technique.", "Continue. Je m'echauffe a peine.",
  "Tu jettes des fourmis. Des FOURMIS. Tu realises ?", "C'est presque touchant. Presque.",
  "J'ai affronte des Monarques. Tu n'es qu'une distraction.", "Predictible. Comme toujours.",
  "Tu oublies que je suis l'Ombre la plus rapide apres le Monarque.",
  "Chaque attaque que tu rates te rapproche de la defaite.",
  "Je pourrais esquiver ca en dormant. Et je ne dors JAMAIS.",
  "Ta strategie se resume a 'lancer des trucs'. Brillant.", "L'acier tranche l'air. Et bientot, tes illusions.",
  "Tu parles plus que tu ne combats. Un defaut... recurrent.", "Approche si tu oses. Mon epee t'attend.",
  "Ce combat etait fini avant de commencer.", "Tu m'ennuies, Beru. Impressionne-moi.",
  "Ma patience a des limites. Mais ma lame n'en a pas.",
  "Tu jettes tout ce que tu as. Et ca ne suffit pas.",
  "L'ombre d'un chevalier est plus dangereuse que la griffe d'une fourmi.",
  "Tes attaques sont comme tes commentaires de code : inutiles.",
  "Le prochain qui touche mon armure... le regrette.", "Silence. Concentration. Precision. Trois mots que tu ignores.",
  "Je n'ai meme pas degage mon epee a pleine puissance.", "Ta rage te rend previsible, Beru.",
  "On appelle ca un combat ? J'appelle ca un echauffement.", "J'attends toujours que le vrai Beru se montre.",
  "Chaque seconde qui passe prouve ma superiorite.", "Tu as du potentiel. Gache par ton ego.",
];

// ─── Esquives / Dodges ───────────────────────────────────────

export const DODGE_BERU = [
  "HA ! Rate ! T'as besoin de lunettes, Igris !", "WHOOOOSH ! Tu m'as meme pas froLE !",
  "C'est tout ?! MON OMBRE esquive mieux que toi !", "Trop LENT ! Beru est INTOUCHABLE !",
  "J'ai esquive avec STYLE. Note ca.", "Tu vises quoi ? Le MUR derriere moi ?",
  "Nope ! Nope ! Et re-NOPE !", "Mon agilite > ta precision. De LOIN.",
  "*fait une pirouette* KIIIEK ! Raté !", "Mes reflexes sont codes en natif. Pas de lag.",
  "Tu touches rien depuis le debut du fight. Ca va ?", "J'ai une esquive pour chaque jour de la semaine.",
  "DODGE ! Comme un vrai pro-gamer.", "Beru: 1, Igris: 0. Et c'est pas pret de changer.",
  "T'as lance ca de la main GAUCHE ou quoi ?",
];

export const DODGE_IGRIS = [
  "Previsible comme toujours.", "Un pas de cote. C'est tout ce qu'il fallait.",
  "Tu vises l'endroit ou j'ETAIS. Pas ou je SUIS.", "*esquive sans meme regarder*",
  "Trop evident. Essaie autre chose.", "Un chevalier lit la trajectoire avant le lancer.",
  "Raté. Comme tes tentatives d'humour.", "Mes reflexes sont forges par mille batailles.",
  "Tu ne peux pas toucher ce que tu ne comprends pas.", "L'esquive est un art. Tu es... l'anti-art.",
  "Meme les yeux fermes...", "Ta vitesse est impressionnante. Ta precision... non.",
  "Joli essai. Vraiment. ...non, je mens.", "L'acier est plus rapide que la chitine.",
  "Je n'ai meme pas eu besoin de bouger mon epee.",
];

// ─── Phase 3 : Chaos — reactions au carnage ──────────────────

export const CHAOS_BERU = [
  "OUPS ! J'ai casse un truc !", "C'est la faute d'Igris ! IL m'a pousse !",
  "Le responsive design est... moins responsive maintenant.", "OH NON LE CSS ! ...bah c'etait deja casse.",
  "Je me PLANQUE ! Tu me trouves PAS !", "*se cache derriere une div* Chuuut !",
  "REVIENS ICI ! On a pas fini !", "AHAHAH ! T'es trop LENT pour me rattraper !",
  "ATTENTION AU HEADER ! ...trop tard.", "On est en train de DEMOLIR le site ! ...c'est GENIAL.",
  "Ca va couter cher en hotfix...", "Le dev va PLEURER quand il verra ca.",
  "J'espere que personne regarde les devtools la...", "BOUGE PAS ! ...ok bouge. BOUGE PAS !",
  "JE TE VOIS DERRIERE CETTE DIV, IGRIS !", "Mes pattes griffent le markup en passant. Oups.",
  "On devrait peut-etre PAS casser les sections de jeu...", "PARKOUR ! PARKOUR D'OMBRE !",
  "Le z-index est en ANARCHIE ! J'ADORE !", "T'as vu ? J'ai saute PAR-DESSUS une section !",
  "KIIIEK ! La fourmi est PARTOUT a la fois !", "Si je me cache dans le localStorage il me trouve pas... si ?",
  "ON CASSE TOUT ! ...et on blame le navigateur.", "Le DOM est mon terrain de jeu ! ET IGRIS TOMBE DEDANS !",
  "Qui a besoin de grid layout quand on a le CHAOS ?!", "J'ai marche sur un pixel. Il a fait 'crack'.",
  "Le site va SURVIVRE. ...probablement. ...peut-etre.", "C'est PAS moi qui ai tilt cette div ! ...ok c'est moi.",
  "MODE DESTRUCTION : ON. MODE REGRETS : ...plus tard.",
  "IGRIS DETRUIT LE SITE ! ...ok c'est moi mais CHUT.",
];

export const CHAOS_IGRIS = [
  "Tu detruis le site, imbecile !", "Le Monarque va nous punir tous les deux...",
  "Arrete de courir et BATS-TOI correctement !", "Tu te caches ? Quel deshonneur.",
  "Mon epee a coupe un composant React en deux.", "Ce n'etait PAS intentionnel.",
  "Les humains vont remarquer les degats...", "Beru, arrete de tout CASSER !",
  "...je viens de fendre le header. Pardon.", "*traverse une section* ...ce n'etait pas un mur.",
  "La discipline est morte ici.", "C'est un champ de bataille, pas une aire de jeux !",
  "Meme ma patience a des fissures maintenant.", "Tu cours plus vite que prevu. Credit a toi.",
  "REVIENS ! Un chevalier ne poursuit pas, mais... REVIENS !", "C'est indigne d'un combat entre Ombres.",
  "Le dev va devoir faire un git revert apres ca.", "J'ai marche sur du CSS. Il craque sous mes bottes.",
  "Tu te caches dans le DOM ? ...impressionnant malgre toi.",
  "Arrete de zigzaguer ! Mon armure est pas faite pour les virages !",
  "On est passes de 'duel honorable' a 'demolition derby'.", "Ta strategie c'est le chaos pur. Et... ca marche un peu.",
  "Le responsive design ne survivra pas a cette nuit.", "J'ai fendu une card. Elle contenait des stats. ...oups.",
  "Si le Monarque voyait ca, il nous desinvoquerait tous les deux.",
  "Combien de divs on a casseES ?! J'ai perdu le compte !", "Tu cours comme un cafard. C'est... un compliment ?",
  "Mon honneur de chevalier est en MIETTES. Comme ce layout.", "Le cleanup va etre LONG.",
  "Beru, ce combat va trop loin ! ...continue.",
];

// ─── Phase 4 : Beru Wins — victoire et defaite ──────────────

export const VICTORY_BERU = [
  "KIIIIIEEEEK ! VICTOIRE TOTALE ! Le soldat N1 reste INVAINCU !",
  "Retourne dans ton coin, Igris. Cette arene est a MOI.",
  "ET DE UN ! Beru : 1, Igris : 0 ! ...cette annee.",
  "Le public est en DELIRE ! ...y'a pas de public ? TANT PIS ! KIIIEK !",
  "PERSONNE ne bat Beru. PERSONNE. C'est dans le code source.",
  "Tu as bien combattu, Igris. Mais t'as combattu BERU.",
  "La fourmi ecrase le chevalier ! IRONIE MAXIMUM !",
  "Victoire par KO ! KO = KIIIEK OBTENU !",
  "Beru le Magnifique ! Beru l'Invincible ! Beru le... TOUT !",
  "Ce combat sera raconte pendant DES GENERATIONS de commits.",
  "Mon ATK etait juste trop. Mon charisme aussi. Et mes TACOS.",
  "GG EZ. ...bon ok c'etait pas easy mais QUAND MEME.",
  "Le Monarque serait FIER. Enfin, de moi. Pas de toi.",
  "Je dedie cette victoire a mes fans. Tous les 3.",
  "Shadow Coin rain ! C'est LA RECOMPENSE du champion !",
  "Igris au sol. Beru debout. La nature est bien faite.",
  "L'armee des Ombres a un champion. Et c'est PAS le chevalier.",
  "Victoire ECRASANTE ! Comme une fourmi ecrase... ...hmm mauvaise metaphore.",
  "JE SUIS LE ROI DE CE COLISEE ! KIIIIIEEEEEEK !",
  "Moment de silence pour Igris. ...ok moment fini. CELEBRATIONS !",
];

export const DEFEAT_IGRIS = [
  "...je concede. Cette fois.", "Tu as eu de la chance, fourmi. Rien de plus.",
  "Mon armure... elle a tenu. Mon orgueil... moins.", "Un chevalier sait reconnaitre sa defaite. *s'incline*",
  "Ce n'est que partie remise, Beru.", "...bien joue. Ne me fais pas le repeter.",
  "La prochaine fois, je ne retiendrai pas mes coups.", "Tu es plus fort que je ne l'admettrai jamais.",
  "Le Monarque a fait le bon choix avec toi. ...peut-etre.", "Ma lame s'incline. Temporairement.",
  "J'ai... sous-estime la puissance d'une fourmi motivee par les tacos.", "La defaite est un enseignement. J'apprendrai.",
  "Tu merites ce titre de N1. Aujourd'hui.", "Mon honneur est entache... mais intact.",
  "Les chevaliers tombent. Les chevaliers se relevent. A bientot.", "...tu peux arreter de danser maintenant ?",
  "Cette victoire ne change rien a la hierarchie. ...si ? NON.", "Je reviendrai. Plus fort. Plus rapide. Plus... silencieux.",
  "Profite de ta victoire, fourmi. Elle sera la derniere.", "...je vais aller mediter. Tres loin de toi.",
];

// ─── Helpers ─────────────────────────────────────────────────

export const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const pickUnique = (arr, usedSet, prefix) => {
  const available = arr.filter((_, i) => !usedSet.has(`${prefix}_${i}`));
  if (available.length === 0) return randomFrom(arr);
  const originalIdx = arr.indexOf(available[Math.floor(Math.random() * available.length)]);
  usedSet.add(`${prefix}_${originalIdx}`);
  return arr[originalIdx];
};
