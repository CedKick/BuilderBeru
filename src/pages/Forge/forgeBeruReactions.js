// src/pages/Forge/forgeBeruReactions.js
// ~300 Beru mascot reactions for the Forge page
// Le Monarque surveille ta forge... et Beru commente tout.

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════
// ENTRY — When the player opens the Forge page
// ═══════════════════════════════════════════════════════════
export const ENTRY_MESSAGES = [
  { message: "Bienvenue dans la Forge du Monarque. Chaque arme que tu crées existera dans le jeu... Choisis bien.", mood: 'thinking', duration: 5000 },
  { message: "Oh oh oh... Tu viens forger ? Le Monarque t'observe. Pas de bêtises.", mood: 'excited', duration: 5000 },
  { message: "La Forge... L'endroit où les légendes naissent. Ou les catastrophes. Ça dépend de toi.", mood: 'thinking', duration: 5000 },
  { message: "Attention ! Chaque arme forgée sera utilisée par de VRAIS joueurs. Grande responsabilité !", mood: 'excited', duration: 5000 },
  { message: "Le Monarque m'a dit de te surveiller pendant que tu forges. Je prends mon rôle très au sérieux.", mood: 'thinking', duration: 5000 },
  { message: "Tu as accès à la Forge ? Impressionnant. Le Monarque ne laisse pas n'importe qui entrer ici.", mood: 'happy', duration: 5000 },
  { message: "Forge du Monarque, mode : SÉRIEUX. Enfin j'essaie. C'est dur d'être sérieux quand on est une fourmi.", mood: 'thinking', duration: 5000 },
  { message: "Chaque arme que tu forges sera jugée par la communauté. Pas de pression hein.", mood: 'excited', duration: 4000 },
];

// ═══════════════════════════════════════════════════════════
// NAME — Reactions to weapon name changes
// ═══════════════════════════════════════════════════════════
export const NAME_GENERIC = [
  { message: "Hmm... ce nom... Le Monarque lève un sourcil.", mood: 'thinking', duration: 3000 },
  { message: "Tu es sûr de ce nom ? Une fois forgée, c'est pour toujours.", mood: 'thinking', duration: 3000 },
  { message: "Le nom d'une arme, c'est son âme. Choisis avec sagesse.", mood: 'thinking', duration: 3000 },
  { message: "Je note ce nom dans les archives du Monarque...", mood: 'thinking', duration: 3000 },
  { message: "Pas mal... pas mal... Le Monarque hoche la tête.", mood: 'happy', duration: 3000 },
  { message: "Hmm. Original ? Ou copié sur Google ? Je surveille.", mood: 'thinking', duration: 3000 },
  { message: "Ce nom résonnera dans tout le royaume... ou pas.", mood: 'thinking', duration: 3000 },
  { message: "Le Monarque murmure : 'Intéressant...'", mood: 'thinking', duration: 3000 },
  { message: "J'espère que tu n'appelles pas ça 'Épée'... Si ?", mood: 'thinking', duration: 3000 },
  { message: "Un nom qui inspire la terreur ? Ou le fou rire ? On verra.", mood: 'thinking', duration: 3000 },
];

export const NAME_KEYWORDS = {
  // Funny / meme names
  beru: [
    { message: "HEY ! C'est MON nom ça ! Tu n'as pas le droit !!", mood: 'angry', duration: 4000 },
    { message: "Tu... tu veux nommer une arme comme moi ? JE SUIS HONORÉ !!", mood: 'excited', duration: 4000 },
    { message: "Beru ? BERU ?! Le Monarque va me tuer si je laisse passer ça...", mood: 'panicked', duration: 4000 },
  ],
  jinwoo: [
    { message: "Tu oses utiliser le nom du Monarque ?! Tu as du courage... ou de l'inconscience.", mood: 'panicked', duration: 4000 },
    { message: "Le Monarque fronce les sourcils. Tu joues avec le feu.", mood: 'angry', duration: 4000 },
    { message: "Sung Jinwoo ? Tu veux mourir ou quoi ?!", mood: 'panicked', duration: 4000 },
  ],
  igris: [
    { message: "Igris... Un nom noble. Le chevalier approuverait.", mood: 'thinking', duration: 3500 },
    { message: "Tu veux rivaliser avec l'épée d'Igris ? Ambitieux.", mood: 'excited', duration: 3500 },
  ],
  tacos: [
    { message: "TACOS ?! Rayan va être jaloux ! Son Tacos Éternel a de la concurrence !", mood: 'excited', duration: 4000 },
    { message: "Encore un tacos... Le Monarque soupire. Rayan rit.", mood: 'happy', duration: 4000 },
    { message: "Le Monarque : 'Pourquoi mes forgerons ne pensent qu'aux tacos ?!'", mood: 'angry', duration: 4000 },
  ],
  kebab: [
    { message: "Kebab ? On n'est pas dans un restaurant ! C'est une FORGE !", mood: 'angry', duration: 4000 },
    { message: "Le Monarque : 'Ah, encore la cuisine. Je vais fermer cette forge.'", mood: 'angry', duration: 4000 },
  ],
  excalibur: [
    { message: "Excalibur ? L'originale est déjà en expédition tu sais...", mood: 'thinking', duration: 3500 },
    { message: "Excalibur 2 ? Le Retour ? La Revanche ? Sois créatif !", mood: 'thinking', duration: 3500 },
  ],
  shadow: [
    { message: "Shadow... Sombre. Mystérieux. Le Monarque approuve.", mood: 'happy', duration: 3000 },
    { message: "Tu veux invoquer les ombres avec ce nom ? Attention à ce que tu souhaites.", mood: 'thinking', duration: 3500 },
  ],
  dragon: [
    { message: "Dragon ? Classique mais efficace. Le Monarque respecte les classiques.", mood: 'happy', duration: 3000 },
    { message: "Dragon killer, dragon slayer... Les dragons tremblent déjà.", mood: 'excited', duration: 3500 },
  ],
  mort: [
    { message: "La Mort ? Tu es lugubre... Le Monarque adore.", mood: 'excited', duration: 3500 },
    { message: "Un nom mortel. Littéralement. J'approuve.", mood: 'happy', duration: 3000 },
  ],
  dieu: [
    { message: "Tu te prends pour un dieu ? Le Monarque EST le seul dieu ici !", mood: 'angry', duration: 4000 },
    { message: "Dieu ? Tu vises haut. Trop haut peut-être.", mood: 'thinking', duration: 3500 },
  ],
  noob: [
    { message: "Noob ? Tu veux vraiment que les joueurs se battent avec ça ?!", mood: 'angry', duration: 4000 },
    { message: "Le Monarque se demande si c'est de l'ironie ou de l'honnêteté...", mood: 'thinking', duration: 3500 },
  ],
  op: [
    { message: "OP ? Tu annonces la couleur au moins. Le Monarque apprécie l'honnêteté.", mood: 'happy', duration: 3500 },
    { message: "'OP' dans le nom ? Tu veux te faire remarquer hein.", mood: 'thinking', duration: 3000 },
  ],
  ragnarok: [
    { message: "Ragnarök... La fin du monde. Ou le début d'une légende ?", mood: 'excited', duration: 3500 },
  ],
  lame: [
    { message: "Une lame... Classique. Le Monarque respecte la tradition.", mood: 'thinking', duration: 3000 },
  ],
  flamme: [
    { message: "Flamme ? Ça va chauffer ! Littéralement !", mood: 'excited', duration: 3000 },
  ],
  sang: [
    { message: "Du sang... Le Monarque aime les noms qui inspirent la peur.", mood: 'excited', duration: 3000 },
  ],
  lol: [
    { message: "LOL ? Tu te moques de la Forge du Monarque ?!", mood: 'angry', duration: 4000 },
    { message: "Le Monarque ne 'lol' pas. Jamais.", mood: 'angry', duration: 3500 },
  ],
  test: [
    { message: "'Test' ? Tu n'es pas en mode test ! C'est la VRAIE forge !", mood: 'panicked', duration: 4000 },
    { message: "Le Monarque : 'Si c'est un test, pourquoi tu trembles ?'", mood: 'thinking', duration: 3500 },
  ],
  bite: [
    { message: "...Le Monarque me demande de te rappeler que c'est un jeu familial.", mood: 'angry', duration: 4000 },
  ],
  cul: [
    { message: "Le Monarque lève les yeux au ciel. Maturité : 0.", mood: 'angry', duration: 3500 },
  ],
  pipi: [
    { message: "...On est dans une forge légendaire. Pas aux toilettes.", mood: 'angry', duration: 3500 },
  ],
  caca: [
    { message: "Le Monarque se demande pourquoi il a ouvert cette forge au public...", mood: 'angry', duration: 4000 },
  ],
  sulfuras: [
    { message: "SULFURAS ?! Tu veux recréer la légendaire ?! IMPOSSIBLE !!", mood: 'panicked', duration: 4000 },
    { message: "Le Monarque rit. 'Sulfuras ne se forge pas. Elle te choisit.'", mood: 'thinking', duration: 4000 },
  ],
  maman: [
    { message: "Tu appelles ta maman ? C'est une forge, pas une crèche !", mood: 'angry', duration: 3500 },
  ],
  papa: [
    { message: "Daddy issues dans la Forge ? Nouveau concept.", mood: 'thinking', duration: 3500 },
  ],
  rayan: [
    { message: "Rayan ? Le légendaire créateur du Tacos Éternel ? Tu connais la légende !", mood: 'excited', duration: 4000 },
  ],
  cedric: [
    { message: "Le Créateur... Tu oses invoquer son nom dans la Forge ?!", mood: 'panicked', duration: 4000 },
  ],
  amor: [
    { message: "L'amour dans une forge ? Poétique... et dangereux.", mood: 'thinking', duration: 3500 },
  ],
};

// Short names
export const NAME_SHORT = [
  { message: "C'est... un peu court non ? Même les armes ont besoin d'un vrai nom !", mood: 'thinking', duration: 3000 },
  { message: "Deux lettres ? T'as pas d'inspiration ou t'es pressé ?", mood: 'angry', duration: 3000 },
];

// Long names
export const NAME_LONG = [
  { message: "Waouh c'est long ! Tu écris un roman ou tu nommes une arme ?", mood: 'excited', duration: 3500 },
  { message: "Le Monarque : 'Raccourcis. Même moi j'ai pas le temps de lire tout ça.'", mood: 'thinking', duration: 3500 },
  { message: "C'est une arme, pas une encyclopédie ! Plus court !", mood: 'angry', duration: 3000 },
];

// ═══════════════════════════════════════════════════════════
// DESCRIPTION — Reactions to weapon description
// ═══════════════════════════════════════════════════════════
export const DESC_GENERIC = [
  { message: "Ta description... Le Monarque prend des notes.", mood: 'thinking', duration: 3000 },
  { message: "Hmm, belle description. Les joueurs vont kiffer.", mood: 'happy', duration: 3000 },
  { message: "Tu décris ton arme comme un poème. Le Monarque est ému.", mood: 'happy', duration: 3500 },
  { message: "La description c'est important ! C'est ce que les joueurs liront en premier.", mood: 'thinking', duration: 3500 },
  { message: "Pas trop de spoilers dans la description hein ?", mood: 'thinking', duration: 3000 },
  { message: "Le Monarque lit ta description... Il hoche la tête lentement.", mood: 'thinking', duration: 3000 },
  { message: "Tu écris mieux que la plupart des forgerons. C'est pas un compliment, les autres sont nuls.", mood: 'happy', duration: 4000 },
  { message: "Description validée par le bureau des légendes. Enfin... par moi.", mood: 'thinking', duration: 3000 },
];

export const DESC_EMPTY = [
  { message: "Pas de description ? Tu veux que les joueurs devinent ?", mood: 'thinking', duration: 3000 },
  { message: "Le Monarque : 'Une arme sans histoire ne mérite pas d'exister.'", mood: 'angry', duration: 3500 },
  { message: "Vide... comme ton inspiration ? Allez, un petit effort !", mood: 'thinking', duration: 3000 },
];

export const DESC_LONG = [
  { message: "Tu écris un livre ou une description d'arme ?!", mood: 'excited', duration: 3000 },
  { message: "Respire. C'est une description, pas ta thèse de doctorat.", mood: 'thinking', duration: 3500 },
];

// ═══════════════════════════════════════════════════════════
// ELEMENT — Reactions to element selection
// ═══════════════════════════════════════════════════════════
export const ELEMENT_REACTIONS = {
  fire: [
    { message: "FEU ! Le Monarque approuve ! Rien de mieux que brûler ses ennemis.", mood: 'excited', duration: 3500 },
    { message: "Élément feu... Classique mais dévastateur. Beau choix.", mood: 'happy', duration: 3000 },
    { message: "Ça va chauffer ! Littéralement ! Le Monarque sourit.", mood: 'excited', duration: 3000 },
    { message: "Le feu purificateur. Les monstres vont adorer... Non en fait.", mood: 'happy', duration: 3000 },
    { message: "Feu ? Tu veux tout cramer ou quoi ? ...Continue.", mood: 'excited', duration: 3000 },
  ],
  water: [
    { message: "Eau ? Calme et puissant. Comme un tsunami. Le Monarque approuve.", mood: 'thinking', duration: 3500 },
    { message: "L'eau éteint le feu. Mais peut aussi noyer tout un royaume.", mood: 'thinking', duration: 3500 },
    { message: "Élément eau... Les mages adorent. Les guerriers... moins.", mood: 'thinking', duration: 3000 },
    { message: "Mjolnir est eau. Tu veux rivaliser avec le dieu du tonnerre ?", mood: 'excited', duration: 3500 },
    { message: "L'eau... Sous-estimée par beaucoup. Pas par le Monarque.", mood: 'happy', duration: 3000 },
  ],
  shadow: [
    { message: "OMBRE ! L'élément du Monarque ! Tu as bon goût !", mood: 'excited', duration: 3500 },
    { message: "Les ombres... Mon domaine. Le Monarque est fier de toi.", mood: 'happy', duration: 3500 },
    { message: "Élément ombre ? Tu marches dans les pas du Monarque des Ombres.", mood: 'excited', duration: 3500 },
    { message: "Shadow... L'obscurité est une arme. Le Monarque le sait mieux que quiconque.", mood: 'thinking', duration: 3500 },
    { message: "Tu choisis l'ombre ? Prépare-toi à ne plus jamais voir la lumière.", mood: 'excited', duration: 3000 },
  ],
  light: [
    { message: "Lumière... L'ennemi naturel des ombres. Intéressant.", mood: 'thinking', duration: 3500 },
    { message: "Le Monarque fronce les sourcils. La lumière... Son seul rival.", mood: 'thinking', duration: 3500 },
    { message: "Élément lumière ? Tu veux purifier ou aveugler ? Les deux marchent.", mood: 'happy', duration: 3500 },
    { message: "La lumière divine... Le Monarque respecte, même s'il préfère l'ombre.", mood: 'thinking', duration: 3500 },
    { message: "Excalibur est lumière. Tu as de grands modèles.", mood: 'happy', duration: 3000 },
  ],
  wind: [
    { message: "Le vent... Rapide et insaisissable. Comme moi quand je fuis Igris.", mood: 'happy', duration: 3500 },
    { message: "Élément vent ? La vitesse est ta meilleure arme.", mood: 'thinking', duration: 3000 },
    { message: "Fragarach est vent. Tu connais tes classiques !", mood: 'happy', duration: 3000 },
    { message: "Le vent souffle... et emporte tes ennemis. Poétique et mortel.", mood: 'thinking', duration: 3500 },
  ],
  earth: [
    { message: "Terre ? Solide comme un roc. Le Monarque respecte la stabilité.", mood: 'thinking', duration: 3000 },
    { message: "Élément terre... Les tanks adorent. Incassable.", mood: 'happy', duration: 3000 },
    { message: "La terre ne bouge pas. Tes ennemis non plus après ton attaque.", mood: 'excited', duration: 3500 },
  ],
  null: [
    { message: "Pas d'élément ? Tu veux une arme neutre ? Le Monarque hausse les épaules.", mood: 'thinking', duration: 3000 },
    { message: "Sans élément... Polyvalent mais sans saveur. Le Monarque est perplexe.", mood: 'thinking', duration: 3000 },
  ],
};

// ═══════════════════════════════════════════════════════════
// WEAPON TYPE — Reactions to weapon type selection
// ═══════════════════════════════════════════════════════════
export const WEAPON_TYPE_REACTIONS = {
  blade: [
    { message: "Une épée ! L'arme classique par excellence. Le Monarque approuve.", mood: 'happy', duration: 3000 },
    { message: "Lame contre lame... Le son le plus beau du champ de bataille.", mood: 'thinking', duration: 3000 },
    { message: "Épée ? Tu sais que 60% des armes forgées sont des épées ? Sois original... ou pas.", mood: 'thinking', duration: 4000 },
  ],
  heavy: [
    { message: "Hache ou marteau ! LOURD ! PUISSANT ! Le Monarque aime la brutalité !", mood: 'excited', duration: 3500 },
    { message: "Un coup. Un seul. C'est tout ce qu'il faut avec une arme lourde.", mood: 'excited', duration: 3000 },
    { message: "Le Ragnarök est une arme lourde. Tu marches dans ses pas.", mood: 'thinking', duration: 3000 },
  ],
  polearm: [
    { message: "Une lance ! L'arme de la distance. Touche sans être touché.", mood: 'thinking', duration: 3000 },
    { message: "Gungnir, la lance d'Odin. Tu vises aussi haut ?", mood: 'excited', duration: 3000 },
    { message: "Les lanciers sont sous-estimés. Le Monarque le sait.", mood: 'happy', duration: 3000 },
  ],
  ranged: [
    { message: "Un arc ? Tu préfères tuer de loin ? Le Monarque comprend.", mood: 'thinking', duration: 3000 },
    { message: "Pew pew ! ...Pardon. L'arc est une arme noble. Très noble.", mood: 'happy', duration: 3500 },
    { message: "Toucher sans être vu... L'arme des assassins élégants.", mood: 'thinking', duration: 3000 },
  ],
  staff: [
    { message: "Un bâton ! Les mages vont se battre pour cette arme.", mood: 'excited', duration: 3000 },
    { message: "Le bâton canalise la magie. Et la magie peut tout détruire.", mood: 'thinking', duration: 3500 },
    { message: "Yggdrasil, Thyrsus, Ea... Les bâtons légendaires sont nombreux.", mood: 'happy', duration: 3000 },
  ],
  scythe: [
    { message: "Une faux... L'arme de la Mort elle-même. Le Monarque frissonne.", mood: 'excited', duration: 3500 },
    { message: "Faux ? Tu veux moissonner des âmes ? Le Monarque approuve FORTEMENT.", mood: 'excited', duration: 3500 },
    { message: "Nidhogg est une faux. Dévoration garantie.", mood: 'happy', duration: 3000 },
  ],
  shield: [
    { message: "Un bouclier ? Tu protèges plutôt que tu détruis ? Noble.", mood: 'thinking', duration: 3000 },
    { message: "Aegis, le bouclier divin. Tu veux en faire un aussi puissant ?", mood: 'thinking', duration: 3000 },
    { message: "Les tanks te remercieront. Les DPS... moins.", mood: 'happy', duration: 3000 },
  ],
};

// ═══════════════════════════════════════════════════════════
// ATK SLIDER — Reactions to ATK value changes
// ═══════════════════════════════════════════════════════════
export const ATK_LOW = [
  { message: "ATK aussi bas ? Tu forges un cure-dent ou une arme ?", mood: 'thinking', duration: 3000 },
  { message: "Le Monarque : 'C'est... c'est tout ?' Il est déçu.", mood: 'angry', duration: 3000 },
  { message: "Même mes mandibules font plus de dégâts que ça.", mood: 'angry', duration: 3000 },
  { message: "ATK faible = arme accessible. Le Monarque respecte l'humilité.", mood: 'thinking', duration: 3000 },
  { message: "Tu veux chatouiller les ennemis ? Parce que ça ne va pas les tuer.", mood: 'thinking', duration: 3500 },
];

export const ATK_MID = [
  { message: "ATK correct. Ni trop, ni trop peu. L'équilibre.", mood: 'happy', duration: 3000 },
  { message: "Le Monarque hoche la tête. Un ATK raisonnable.", mood: 'thinking', duration: 3000 },
  { message: "Bien calibré. Pas assez pour casser le jeu, assez pour être utile.", mood: 'happy', duration: 3000 },
];

export const ATK_HIGH = [
  { message: "Hooo ! ATK qui monte ! Le Monarque sent le pouvoir !", mood: 'excited', duration: 3000 },
  { message: "C'est du lourd. Littéralement. Les monstres vont pleurer.", mood: 'excited', duration: 3000 },
  { message: "Le score grimpe avec cet ATK... Tu es prêt à payer le prix ?", mood: 'thinking', duration: 3000 },
  { message: "GROS ATK ! Les tanks adverses tremblent déjà.", mood: 'excited', duration: 3000 },
];

export const ATK_MAX = [
  { message: "ATK MAX ?! Tu veux DÉTRUIRE le jeu ou quoi ?!", mood: 'panicked', duration: 4000 },
  { message: "LE MONARQUE CRIE : 'C'EST TROP ! BEAUCOUP TROP !!'", mood: 'angry', duration: 4000 },
  { message: "300 ATK ?! Même Gram ne va pas aussi loin ! Tu es FOU !", mood: 'panicked', duration: 4000 },
  { message: "A ce niveau d'ATK, autant appeler ça un nuke, pas une arme.", mood: 'angry', duration: 4000 },
  { message: "Le Monarque transpire. Il n'a jamais vu un tel pouvoir brut.", mood: 'panicked', duration: 4000 },
];

// ═══════════════════════════════════════════════════════════
// BONUS STAT — Reactions to stat selection
// ═══════════════════════════════════════════════════════════
export const BONUS_STAT_REACTIONS = {
  crit_rate: [
    { message: "Crit Rate ? Tu veux des critiques à gogo ? Le Monarque comprend.", mood: 'thinking', duration: 3000 },
    { message: "Plus de crits = plus de dégâts. Logique implacable.", mood: 'happy', duration: 3000 },
  ],
  crit_dmg: [
    { message: "Crit DMG... Quand tes crits font MAL. Le Monarque approuve.", mood: 'excited', duration: 3000 },
    { message: "Tu veux que chaque crit soit un arrêt de mort ? Validé.", mood: 'excited', duration: 3000 },
  ],
  atk_pct: [
    { message: "ATK % en bonus ? Tu empiles la puissance brute. Brutal.", mood: 'excited', duration: 3000 },
    { message: "Plus d'ATK, toujours plus. Le Monarque aime la simplicité.", mood: 'happy', duration: 3000 },
  ],
  int_pct: [
    { message: "INT % ! Les mages vont adorer cette arme !", mood: 'excited', duration: 3000 },
    { message: "Intelligence... Le pouvoir du cerveau. Le Monarque respecte.", mood: 'thinking', duration: 3000 },
    { message: "INT pour les mages ? Tu sais ce que tu fais. Bien.", mood: 'happy', duration: 3000 },
  ],
  def_pct: [
    { message: "DEF % ? Tu forges un tank ? Le Monarque respecte les protecteurs.", mood: 'thinking', duration: 3000 },
    { message: "La meilleure attaque c'est la défense... ou pas.", mood: 'thinking', duration: 3000 },
  ],
  hp_pct: [
    { message: "HP % ? Survivre c'est gagner. Philosophie de tank.", mood: 'thinking', duration: 3000 },
    { message: "Plus de vie = plus dur à tuer. Le Monarque comprend la logique.", mood: 'happy', duration: 3000 },
  ],
  spd_flat: [
    { message: "Vitesse ! Le premier qui frappe a l'avantage !", mood: 'excited', duration: 3000 },
    { message: "Speed kills. Littéralement. Le Monarque a parlé.", mood: 'happy', duration: 3000 },
  ],
  defPen: [
    { message: "Ignore DEF... L'arme ultime contre les tanks. Vicieux.", mood: 'excited', duration: 3000 },
    { message: "Tu perces les défenses comme du beurre. Le Monarque adore.", mood: 'excited', duration: 3000 },
  ],
  allDamage: [
    { message: "Tous Dégâts ? Polyvalent et mortel. Beau combo.", mood: 'excited', duration: 3000 },
    { message: "Tous les types de dégâts boostés... Tu ne fais pas dans le détail.", mood: 'happy', duration: 3000 },
  ],
};

// ═══════════════════════════════════════════════════════════
// BONUS VALUE — Reactions to high bonus values
// ═══════════════════════════════════════════════════════════
export const BONUS_VALUE_HIGH = [
  { message: "Tu pousses le bonus à fond ? Le score va monter en flèche...", mood: 'thinking', duration: 3000 },
  { message: "Le Monarque : 'Tu es gourmand sur les stats...'", mood: 'thinking', duration: 3000 },
  { message: "Maximum de bonus ? Tu veux le beurre ET l'argent du beurre ?", mood: 'excited', duration: 3000 },
];

// ═══════════════════════════════════════════════════════════
// SCALING STAT — INT toggle reactions
// ═══════════════════════════════════════════════════════════
export const SCALING_INT_ON = [
  { message: "Scaling INT activé ! Les mages se lèvent !", mood: 'excited', duration: 3000 },
  { message: "INT scaling ? Tu forges pour les intellectuels. Le Monarque aussi est un intellectuel. Si si.", mood: 'happy', duration: 4000 },
  { message: "Les mages du monde entier te remercient.", mood: 'happy', duration: 3000 },
  { message: "Ea, Thyrsus, Amenonuhoko... Toutes scalent sur INT. Bon choix.", mood: 'thinking', duration: 3500 },
];

export const SCALING_INT_OFF = [
  { message: "Retour à ATK. Les guerriers reprennent le pouvoir.", mood: 'thinking', duration: 3000 },
  { message: "ATK scaling classique. Pas besoin de réfléchir, juste cogner.", mood: 'happy', duration: 3000 },
];

// ═══════════════════════════════════════════════════════════
// PASSIVE — Reactions to passive selection
// ═══════════════════════════════════════════════════════════
export const PASSIVE_GENERIC = [
  { message: "Un passif ! C'est ce qui rend une arme UNIQUE. Choisis bien.", mood: 'thinking', duration: 3000 },
  { message: "Le passif c'est l'âme de l'arme. Le Monarque y prête attention.", mood: 'thinking', duration: 3000 },
  { message: "Hmm, ce passif... Les joueurs vont l'adorer. Ou le maudire.", mood: 'thinking', duration: 3500 },
];

export const PASSIVE_SPECIFIC = {
  innerFlameStack: [
    { message: "Flamme Intérieure ! Plus tu frappes, plus tu brûles. MAGNIFIQUE.", mood: 'excited', duration: 3500 },
    { message: "Stack de flamme... Le Monarque sent la chaleur d'ici.", mood: 'excited', duration: 3000 },
  ],
  burnProc: [
    { message: "Brûlure ! Les ennemis vont cuire à petit feu. Littéralement.", mood: 'excited', duration: 3000 },
  ],
  desperateFury: [
    { message: "Furie Désespérée... Plus tu souffres, plus tu frappes fort. DARK.", mood: 'excited', duration: 3500 },
    { message: "Le Monarque frissonne. Ce passif... c'est de la rage pure.", mood: 'excited', duration: 3000 },
  ],
  chainLightning: [
    { message: "Éclair en Chaîne ! ZAP ZAP ZAP ! Le Monarque adore !", mood: 'excited', duration: 3500 },
    { message: "Mjolnir vibes ! Les ennemis vont griller comme des toasts.", mood: 'excited', duration: 3000 },
  ],
  dragonSlayer: [
    { message: "Tueur de Dragons ! Gram serait fier !", mood: 'excited', duration: 3000 },
    { message: "AoE dévastateur... Les groupes de mobs n'ont aucune chance.", mood: 'excited', duration: 3000 },
  ],
  defIgnore: [
    { message: "Ignore la DEF ? Tu joues le jeu de l'assassin. Vicieux.", mood: 'thinking', duration: 3000 },
  ],
  cursedBlade: [
    { message: "Lame Maudite... Power up au prix de ta vie. Tu aimes le risque.", mood: 'excited', duration: 3500 },
    { message: "Muramasa porte ce passif. Tu sais dans quoi tu t'embarques ?", mood: 'thinking', duration: 3500 },
  ],
  lifesteal: [
    { message: "Vol de vie ! Tue pour survivre. La boucle parfaite.", mood: 'happy', duration: 3000 },
  ],
  dodgeCounter: [
    { message: "Esquive et contre-attaque ! L'art du combat selon le Monarque.", mood: 'happy', duration: 3000 },
  ],
  celestialShield: [
    { message: "Bouclier Céleste ! Protection divine. Le Monarque approuve.", mood: 'happy', duration: 3000 },
  ],
  guardianShield: [
    { message: "Bouclier du Gardien ! Le tank ultime. Tes alliés te remercieront.", mood: 'thinking', duration: 3500 },
  ],
  devoration: [
    { message: "Dévoration ! Tue → deviens plus fort. Nidhogg approuve.", mood: 'excited', duration: 3500 },
    { message: "Kill = power. Simple. Efficace. BRUTAL.", mood: 'excited', duration: 3000 },
  ],
  commanderAura: [
    { message: "Aura du Commandeur ! Un leader sur le champ de bataille !", mood: 'excited', duration: 3500 },
    { message: "Tu veux buff toute l'équipe ? Le Monarque respecte les leaders.", mood: 'happy', duration: 3000 },
  ],
  manaFlow: [
    { message: "Flux de Mana ! Les mages vont adorer cette arme.", mood: 'thinking', duration: 3000 },
  ],
  echoCD: [
    { message: "Écho des Sorts ! Double cast ? C'est INSANE.", mood: 'excited', duration: 3000 },
  ],
  healBoost: [
    { message: "Boost de Soin ! Les healers du monde entier te vénèrent.", mood: 'happy', duration: 3000 },
  ],
  none: [
    { message: "Pas de passif ? Tu veux une arme vanilla ? Ton choix...", mood: 'thinking', duration: 3000 },
    { message: "Sans passif... C'est comme un gâteau sans glaçage.", mood: 'thinking', duration: 3000 },
  ],
  // ── Drawback passives ──
  cursedPact: [
    { message: "PACTE MAUDIT ?! Tu sacrifies une stat pour en booster une autre ? Le Monarque frissonne.", mood: 'panicked', duration: 4000 },
    { message: "Un pacte avec les ténèbres... Le Monarque prévient : le prix sera lourd.", mood: 'excited', duration: 4000 },
    { message: "Sacrifice de stat... Les meilleurs forgerons osent les pactes maudits.", mood: 'thinking', duration: 3500 },
  ],
  berserkerRage: [
    { message: "RAGE BERSERK !! Tu sacrifies ta résistance pour la PUISSANCE BRUTE !", mood: 'excited', duration: 4000 },
    { message: "Moins de RES, plus de force... Le Monarque connaît ce chemin. Il est dangereux.", mood: 'thinking', duration: 4000 },
    { message: "Le Berserk ne connaît pas la défense. Seulement l'attaque. Le Monarque respecte.", mood: 'excited', duration: 3500 },
  ],
  voidSacrifice: [
    { message: "SACRIFICE DU VIDE ! Tu jettes ta DEF aux oubliettes pour du CRIT ?!", mood: 'panicked', duration: 4000 },
    { message: "Glass cannon... Un coup te tue, mais TU tues en un coup aussi.", mood: 'excited', duration: 3500 },
    { message: "Le Monarque : 'Le vide consume la défense... mais offre la destruction.'", mood: 'thinking', duration: 4000 },
  ],
  deathLink: [
    { message: "LIEN MORTEL ! Moins de HP mais plus de vitesse et de dégâts bonus ?!", mood: 'panicked', duration: 4000 },
    { message: "Tu lies ta vie à ta puissance... Un pas de trop et c'est la mort.", mood: 'thinking', duration: 3500 },
    { message: "Le Monarque : 'Ce lien est réservé aux plus braves... ou aux plus fous.'", mood: 'excited', duration: 4000 },
  ],
  sharedCurse: [
    { message: "MALÉDICTION PARTAGÉE ! Tu souffres mais tes ennemis aussi ! VICIEUX !", mood: 'excited', duration: 4000 },
    { message: "Le Monarque rit. 'Si je souffre, TOUT LE MONDE souffre.' Il adore ce passif.", mood: 'happy', duration: 4000 },
    { message: "Malédiction AoE... Les ennemis regretteront de s'être approchés.", mood: 'excited', duration: 3500 },
  ],
  // ── Stackable advanced ──
  powerAccumulation: [
    { message: "Accumulation de Puissance ! Lent au début... DÉVASTATEUR à la fin !", mood: 'excited', duration: 3500 },
    { message: "Stack par stack... La patience est une vertu. La destruction aussi.", mood: 'thinking', duration: 3500 },
    { message: "Attention au decay ! Si tu arrêtes d'attaquer, tu perds tes stacks.", mood: 'thinking', duration: 3500 },
  ],
  combatEcho: [
    { message: "Écho de Combat ! Esquive et crit pour stacker la vitesse !", mood: 'excited', duration: 3500 },
    { message: "Fragarach vibes ! Esquive → stack → CRIT GARANTI. Beau combo.", mood: 'happy', duration: 3500 },
  ],
};

export const PASSIVE_ADD_SECOND = [
  { message: "Un DEUXIÈME passif ?! Tu veux une arme de légende !", mood: 'excited', duration: 3500 },
  { message: "Le Monarque hausse un sourcil. Deux passifs... Ambitieux.", mood: 'thinking', duration: 3000 },
  { message: "Double passif = double pouvoir = double responsabilité !", mood: 'excited', duration: 3000 },
];

export const PASSIVE_ADD_THIRD = [
  { message: "TROIS PASSIFS ?! Tu forges une arme DIVINE là !!", mood: 'panicked', duration: 4000 },
  { message: "Le Monarque se lève de son trône. 3 passifs... Il n'a jamais vu ça.", mood: 'excited', duration: 4000 },
  { message: "Triple passif ! Le score va EXPLOSER ! Tu es prévenu !", mood: 'panicked', duration: 4000 },
  { message: "3 passifs... Le Monarque murmure : 'Ce forgeron est fou. Ou génial.'", mood: 'excited', duration: 4000 },
];

export const PASSIVE_REMOVE = [
  { message: "Tu retires un passif ? Sagesse ou lâcheté ?", mood: 'thinking', duration: 3000 },
  { message: "Moins de passifs = score plus bas = plus de lieux de loot. Malin.", mood: 'thinking', duration: 3500 },
];

// ═══════════════════════════════════════════════════════════
// AWAKENING A1-A5 — Reactions
// ═══════════════════════════════════════════════════════════
export const AWAKENING_GENERIC = [
  { message: "Éveil A1-A5... C'est là que l'arme atteint son plein potentiel.", mood: 'thinking', duration: 3000 },
  { message: "Tu customises l'éveil ? Le Monarque aime les forgerons méticuleux.", mood: 'happy', duration: 3000 },
  { message: "Chaque point d'éveil compte. Le score augmente avec.", mood: 'thinking', duration: 3000 },
  { message: "A1 à A5... Cinq niveaux d'éveil. Cinq chances de briller.", mood: 'thinking', duration: 3000 },
  { message: "Tu optimises l'éveil comme un pro. Le Monarque prend note.", mood: 'happy', duration: 3000 },
];

export const AWAKENING_HIGH_VALUE = [
  { message: "Tu pousses l'éveil à fond ! Le score va grimper...", mood: 'excited', duration: 3000 },
  { message: "Le Monarque : 'Ce forgeron ne fait pas dans la demi-mesure.'", mood: 'thinking', duration: 3000 },
  { message: "Éveil maxé... Le prix à payer sera la rareté du loot.", mood: 'thinking', duration: 3500 },
];

// ═══════════════════════════════════════════════════════════
// POWER SCORE — Reactions to score thresholds
// ═══════════════════════════════════════════════════════════
export const SCORE_LOW = [
  { message: "Score bas... Arme accessible. Tout le monde pourra l'avoir !", mood: 'happy', duration: 3000 },
  { message: "Le Monarque : 'Simple mais efficace. J'aime.'", mood: 'happy', duration: 3000 },
  { message: "Score faible = loot partout. Les débutants te remercieront.", mood: 'happy', duration: 3000 },
];

export const SCORE_MEDIUM = [
  { message: "Score moyen. L'équilibre parfait entre puissance et accessibilité.", mood: 'thinking', duration: 3000 },
  { message: "Le Monarque hoche la tête. Un score raisonnable.", mood: 'happy', duration: 3000 },
  { message: "Ni trop fort, ni trop faible. Le Monarque apprécie la mesure.", mood: 'thinking', duration: 3000 },
];

export const SCORE_HIGH = [
  { message: "Score élevé ! Cette arme sera RARE. Seuls les meilleurs l'auront.", mood: 'excited', duration: 3500 },
  { message: "Le Monarque se redresse. 'Cette arme... a du potentiel.'", mood: 'excited', duration: 3500 },
  { message: "Score qui monte ! Les lieux de loot se réduisent...", mood: 'thinking', duration: 3000 },
  { message: "Attention ! Plus le score est haut, moins de joueurs l'obtiendront.", mood: 'thinking', duration: 3500 },
];

export const SCORE_VERY_HIGH = [
  { message: "SCORE ÉNORME ! Expédition uniquement !! Tu en es conscient ?!", mood: 'panicked', duration: 4000 },
  { message: "Le Monarque transpire. Ce score... c'est du jamais vu.", mood: 'panicked', duration: 4000 },
  { message: "Tu as créé un MONSTRE. Seuls les boss les plus durs la dropperont.", mood: 'excited', duration: 4000 },
  { message: "Score stratosphérique... Le Monarque se demande si tu sais ce que tu fais.", mood: 'panicked', duration: 4000 },
  { message: "EXPEDITION ONLY ! Boss 5 ! Tu veux vraiment ça ?!", mood: 'panicked', duration: 4000 },
];

// ═══════════════════════════════════════════════════════════
// RARITY CHANGE — When auto-rarity changes
// ═══════════════════════════════════════════════════════════
export const RARITY_UP = {
  legendaire: [
    { message: "LÉGENDAIRE ! Ton arme vient de monter en rareté ! Le Monarque sourit.", mood: 'excited', duration: 3500 },
    { message: "De Rare à Légendaire ! Tu forges quelque chose de spécial !", mood: 'excited', duration: 3500 },
    { message: "Rareté LÉGENDAIRE atteinte. Le Monarque est impressionné.", mood: 'happy', duration: 3500 },
  ],
  mythique: [
    { message: "MYTHIQUE !! TON ARME EST MYTHIQUE !! LE MONARQUE SE LÈVE !!", mood: 'panicked', duration: 4000 },
    { message: "Rareté MYTHIQUE ! Seules les plus grandes armes atteignent ce stade !", mood: 'excited', duration: 4000 },
    { message: "Le Monarque : 'MYTHIQUE... Ce forgeron crée des légendes.'", mood: 'excited', duration: 4000 },
    { message: "Mythique... Le niveau des dieux. Tu joues dans la cour des grands.", mood: 'excited', duration: 4000 },
  ],
};

export const RARITY_DOWN = {
  rare: [
    { message: "Retour à Rare... Tu as revu tes ambitions à la baisse ?", mood: 'thinking', duration: 3000 },
    { message: "Le Monarque : 'Hmm, tu redescends sur terre.'", mood: 'thinking', duration: 3000 },
  ],
  legendaire: [
    { message: "Retour à Légendaire. Plus sage. Le Monarque approuve.", mood: 'thinking', duration: 3000 },
    { message: "De Mythique à Légendaire... Parfois moins c'est plus.", mood: 'thinking', duration: 3000 },
  ],
};

// ═══════════════════════════════════════════════════════════
// LOOT LOCATION CHANGES
// ═══════════════════════════════════════════════════════════
export const LOOT_LOST = [
  { message: "ARC I et RAID SC ne dropperont plus ton arme... Score trop élevé.", mood: 'thinking', duration: 3500 },
  { message: "Les lieux de loot se réduisent... Tu en es conscient ?", mood: 'thinking', duration: 3000 },
  { message: "Le Monarque : 'Plus puissante = plus rare. C'est la loi.'", mood: 'thinking', duration: 3500 },
];

export const LOOT_EXPEDITION_ONLY = [
  { message: "EXPÉDITION UNIQUEMENT !! Ton arme est si puissante que seul l'expédition peut la contenir !!", mood: 'panicked', duration: 4000 },
  { message: "Le Monarque : 'Cette arme... ne peut exister qu'en expédition.'", mood: 'excited', duration: 4000 },
  { message: "Tu viens de créer une arme si OP qu'elle est confinée à l'expédition. Bravo... ou pas.", mood: 'panicked', duration: 4500 },
];

export const LOOT_GAINED = [
  { message: "Plus de lieux de loot ! Ton arme sera plus accessible.", mood: 'happy', duration: 3000 },
  { message: "Le Monarque : 'Bien. Plus de joueurs pourront en profiter.'", mood: 'happy', duration: 3000 },
];

// ═══════════════════════════════════════════════════════════
// SUBMIT — Forging the weapon
// ═══════════════════════════════════════════════════════════
export const SUBMIT_REACTIONS = [
  { message: "LA FORGE S'ACTIVE !! Le Monarque observe la création...", mood: 'excited', duration: 4000 },
  { message: "CLANG CLANG CLANG !! L'arme prend forme !!", mood: 'excited', duration: 4000 },
  { message: "Le Monarque bénit ton arme. Qu'elle serve bien ses porteurs !", mood: 'happy', duration: 4000 },
  { message: "FEU ! ACIER ! MAGIE ! La forge du Monarque RUGIT !!", mood: 'excited', duration: 4000 },
  { message: "Ton arme naît dans les flammes de la Forge. Un moment historique.", mood: 'excited', duration: 4000 },
];

export const SUBMIT_SUCCESS = [
  { message: "L'ARME EST FORGÉE !! Elle existe maintenant dans le monde !! Le Monarque applaudit !", mood: 'excited', duration: 5000 },
  { message: "CRÉATION RÉUSSIE !! Les joueurs du monde entier pourront utiliser ton arme !!", mood: 'excited', duration: 5000 },
  { message: "Le Monarque : 'Bien joué, forgeron. Ton arme rejoint les légendes.'", mood: 'happy', duration: 5000 },
  { message: "FORGÉE !! Ta création est maintenant RÉELLE ! Le Monarque est fier !", mood: 'excited', duration: 5000 },
];

export const SUBMIT_FAIL = [
  { message: "La forge a échoué... Le Monarque est déçu.", mood: 'angry', duration: 4000 },
  { message: "Erreur ! L'arme se brise dans la forge. Réessaie !", mood: 'angry', duration: 4000 },
];

// ═══════════════════════════════════════════════════════════
// GALLERY — Browsing other weapons
// ═══════════════════════════════════════════════════════════
export const GALLERY_REACTIONS = [
  { message: "La galerie ! Admire les créations des autres forgerons.", mood: 'thinking', duration: 3000 },
  { message: "Le Monarque expose fièrement les armes de ses forgerons.", mood: 'happy', duration: 3000 },
  { message: "Tu espionnes la concurrence ? Le Monarque t'observe...", mood: 'thinking', duration: 3000 },
  { message: "Chaque arme ici a été forgée avec passion. Ou avec n'importe quoi.", mood: 'thinking', duration: 3500 },
  { message: "La galerie du Monarque. Que des chefs-d'œuvre... enfin, presque.", mood: 'happy', duration: 3000 },
];

// ═══════════════════════════════════════════════════════════
// MY WEAPONS — Viewing own weapons
// ═══════════════════════════════════════════════════════════
export const MY_WEAPONS_REACTIONS = [
  { message: "Tes créations ! Le Monarque se souvient de chacune.", mood: 'thinking', duration: 3000 },
  { message: "Tu admires ton propre travail ? Narcissique... mais compréhensible.", mood: 'happy', duration: 3500 },
  { message: "Tes armes forgées. Chacune raconte une histoire.", mood: 'thinking', duration: 3000 },
];

// ═══════════════════════════════════════════════════════════
// DELETE — Deleting a weapon
// ═══════════════════════════════════════════════════════════
export const DELETE_REACTIONS = [
  { message: "Tu DÉTRUIS une arme ?! Le Monarque pleure intérieurement.", mood: 'panicked', duration: 4000 },
  { message: "L'arme se brise en mille morceaux... Le Monarque détourne le regard.", mood: 'angry', duration: 4000 },
  { message: "Destruction confirmée. L'arme n'existe plus. Le Monarque soupire.", mood: 'angry', duration: 4000 },
  { message: "Tu effaces ton propre travail ? Le Monarque respecte... mais c'est triste.", mood: 'thinking', duration: 4000 },
];

// ═══════════════════════════════════════════════════════════
// TAB SWITCHING
// ═══════════════════════════════════════════════════════════
export const TAB_CREATE = [
  { message: "Retour à la forge ! Le Monarque attend ta prochaine création.", mood: 'happy', duration: 3000 },
  { message: "Tu veux forger ? Le métal est chaud, le moment est parfait.", mood: 'excited', duration: 3000 },
];

export const TAB_GALLERY = [
  { message: "Tu vas espionner les armes des autres ? Malin.", mood: 'thinking', duration: 3000 },
];

export const TAB_MY_WEAPONS = [
  { message: "Tu veux revoir tes créations ? Le Monarque aussi les aime.", mood: 'happy', duration: 3000 },
];

// ═══════════════════════════════════════════════════════════
// SECTION SWITCHING — Weapon / Boss
// ═══════════════════════════════════════════════════════════
export const SECTION_BOSS = [
  { message: "Forger un Boss ?! C'est pas encore prêt ! Le Monarque travaille dessus !", mood: 'panicked', duration: 4000 },
  { message: "Les Boss... Bientôt tu pourras créer tes propres monstres. Patience !", mood: 'thinking', duration: 4000 },
];

// ═══════════════════════════════════════════════════════════
// CHEATED STATS — When player pushes everything to max
// ═══════════════════════════════════════════════════════════
export const CHEAT_WARNING_MILD = [
  { message: "Hmm... Tu pousses les stats un peu fort là, non ?", mood: 'thinking', duration: 3500 },
  { message: "Le Monarque lève un sourcil. Ces stats sont... généreuses.", mood: 'thinking', duration: 3500 },
  { message: "Tu essaies de casser le jeu ou c'est moi qui rêve ?", mood: 'thinking', duration: 3500 },
  { message: "Le Monarque note dans son carnet : 'À surveiller.'", mood: 'thinking', duration: 3000 },
  { message: "Stats élevées... Le Monarque se demande si c'est de la stratégie ou de la triche.", mood: 'thinking', duration: 3500 },
];

export const CHEAT_WARNING_MEDIUM = [
  { message: "OK là tu abuses. Le Monarque commence à s'énerver.", mood: 'angry', duration: 4000 },
  { message: "Tu veux encore péter le jeu, le déséquilibrer ?! LE MONARQUE VOIT TOUT.", mood: 'angry', duration: 4000 },
  { message: "ATTENTION ! Le Monarque n'aime PAS les forgerons trop gourmands !", mood: 'angry', duration: 4000 },
  { message: "Tu pousse TOUT au max ? Le Monarque a un mot pour ça : TRICHE.", mood: 'angry', duration: 4000 },
  { message: "Le Monarque murmure : 'Si ce forgeron continue, je vais intervenir...'", mood: 'angry', duration: 4000 },
  { message: "ATK max, passifs à fond, bonus maxé... Tu testes mes limites ?!", mood: 'angry', duration: 4000 },
  { message: "Le Monarque se lève LENTEMENT de son trône. C'est mauvais signe pour toi.", mood: 'angry', duration: 4000 },
  { message: "Tu sais ce qui arrive aux forgerons trop ambitieux ? Le Monarque les... CORRIGE.", mood: 'angry', duration: 4500 },
];

export const CHEAT_WARNING_SEVERE = [
  { message: "⚠️ ALERTE MONARQUE ⚠️ Score TROP élevé ! Le Monarque est FURIEUX !!", mood: 'panicked', duration: 5000 },
  { message: "LE MONARQUE RUGIT : 'CE FORGERON VEUT DÉTRUIRE MON MONDE !!'", mood: 'panicked', duration: 5000 },
  { message: "DERNIER AVERTISSEMENT ! Le Monarque a le pouvoir de TOUT RESET !!", mood: 'panicked', duration: 5000 },
  { message: "Tu me forces la main... Le Monarque prépare sa punition...", mood: 'angry', duration: 5000 },
  { message: "Score > 95... Le Monarque n'a jamais permis une telle arme. JAMAIS.", mood: 'panicked', duration: 5000 },
  { message: "Le Monarque : 'Tu veux jouer ? JOUONS.' *bruit de tonnerre*", mood: 'panicked', duration: 5000 },
];

// ═══════════════════════════════════════════════════════════
// EASTER EGG — Beru destroys your config (< 1% chance at high score)
// ═══════════════════════════════════════════════════════════
export const EASTER_EGG_DESTROY_INTRO = [
  { message: "Le Monarque en a ASSEZ. Tu as voulu jouer au plus malin...", mood: 'angry', duration: 3000 },
  { message: "...", mood: 'angry', duration: 1500 },
  { message: "Le Monarque FRAPPE la forge de son poing !!", mood: 'panicked', duration: 2500 },
  { message: "CRACK !! Ton arme se BRISE !! Toute ta config... DÉTRUITE !!", mood: 'panicked', duration: 3000 },
  { message: "AHAHAHA !! Le Monarque a TOUT cassé !! Recommence depuis zéro !!", mood: 'excited', duration: 4000 },
  { message: "...Désolé. C'était plus fort que moi. Le Monarque m'a forcé. Juré.", mood: 'thinking', duration: 4000 },
];

// ═══════════════════════════════════════════════════════════
// IDLE — Ambient messages while on the forge page
// ═══════════════════════════════════════════════════════════
export const IDLE_FORGE = [
  { message: "Tu réfléchis ? Prends ton temps. Le métal reste chaud.", mood: 'thinking', duration: 3000 },
  { message: "Le Monarque attend patiemment... Enfin, pas si patiemment.", mood: 'thinking', duration: 3000 },
  { message: "La forge brûle. Le temps passe. Tu vas forger ou quoi ?", mood: 'thinking', duration: 3000 },
  { message: "Le Monarque : 'Ce forgeron hésite plus qu'il ne forge.'", mood: 'thinking', duration: 3000 },
  { message: "Les flammes de la forge dansent. Elles attendent ton arme.", mood: 'thinking', duration: 3000 },
  { message: "Tu médites sur ta création ? Le Monarque respecte... mais dépêche-toi.", mood: 'thinking', duration: 3000 },
  { message: "*bruit de forge au loin* Le Monarque tape du pied.", mood: 'thinking', duration: 3000 },
  { message: "Les autres forgerons ont déjà créé 3 armes pendant que tu réfléchis.", mood: 'happy', duration: 3500 },
  { message: "Le Monarque commence à s'endormir sur son trône...", mood: 'sleepy', duration: 3000 },
  { message: "Zzz... Hein ? Quoi ? Tu forges ou pas ?!", mood: 'excited', duration: 3000 },
  { message: "Forge un truc ! N'importe quoi ! Le Monarque s'ennuie !", mood: 'angry', duration: 3000 },
  { message: "Tu sais que le Monarque a d'autres choses à faire que te regarder hésiter ?", mood: 'angry', duration: 3500 },
  { message: "Les matériaux rouillent pendant que tu hésites. FORGE.", mood: 'angry', duration: 3000 },
  { message: "Je pourrais être en train de dormir. Mais non. Je te surveille. Forge.", mood: 'thinking', duration: 3500 },
  { message: "Le Monarque : 'Je n'ai pas ouvert cette forge pour qu'on la visite.'", mood: 'thinking', duration: 3000 },
];

// ═══════════════════════════════════════════════════════════
// EXPEDITION BOSS CHANGE
// ═══════════════════════════════════════════════════════════
export const BOSS_CHANGE = {
  1: [{ message: "Boss 1 de l'expédition. Facile. Tout le monde y a accès.", mood: 'happy', duration: 3000 }],
  2: [{ message: "Boss 2. Un peu plus costaud. Pas donné à tout le monde.", mood: 'thinking', duration: 3000 }],
  3: [{ message: "Boss 3 ! Ça commence à devenir sérieux. Le Monarque approuve.", mood: 'excited', duration: 3000 }],
  4: [
    { message: "Boss 4 !! C'est DUR. Seuls les vétérans arriveront jusque-là !", mood: 'excited', duration: 3500 },
    { message: "Boss 4... Le Monarque te prévient : peu de joueurs battent ce boss.", mood: 'thinking', duration: 3500 },
  ],
  5: [
    { message: "BOSS 5 !! LE PLUS DUR DE L'EXPÉDITION !! Ton arme sera ULTRA RARE !!", mood: 'panicked', duration: 4000 },
    { message: "Boss 5... Le cauchemar de l'expédition. Ton arme sera légendaire.", mood: 'excited', duration: 4000 },
    { message: "Le Monarque tremble. Boss 5. Personne ne revient indemne.", mood: 'panicked', duration: 4000 },
  ],
};

// ═══════════════════════════════════════════════════════════
// WEAPON DETAIL MODAL — Viewing a weapon
// ═══════════════════════════════════════════════════════════
export const MODAL_OPEN = [
  { message: "Tu inspectes cette arme ? Le Monarque aussi la trouve intéressante.", mood: 'thinking', duration: 3000 },
  { message: "Regarder les détails... Tu es un forgeron minutieux.", mood: 'thinking', duration: 3000 },
  { message: "Le Monarque : 'Chaque arme mérite d'être étudiée.'", mood: 'thinking', duration: 3000 },
];

// ═══════════════════════════════════════════════════════════
// HELPER — Dispatch a random reaction from a list
// ═══════════════════════════════════════════════════════════
let lastDispatchTime = 0;
const MIN_INTERVAL = 3000; // Don't spam, minimum 3s between messages

export function beruReact(reactions, force = false) {
  const now = Date.now();
  if (!force && now - lastDispatchTime < MIN_INTERVAL) return false;

  const reaction = pick(reactions);
  if (!reaction) return false;

  lastDispatchTime = now;

  window.dispatchEvent(new CustomEvent('beru-react', {
    detail: {
      message: reaction.message,
      mood: reaction.mood || 'thinking',
      duration: reaction.duration || 3000,
    },
  }));
  return true;
}

// ── Wake up Beru if sleeping/hidden ─────────────────────
export function beruWakeUp() {
  const stored = localStorage.getItem('beru_mascot_mode');
  if (stored === 'calm' || stored === 'hidden') {
    localStorage.setItem('beru_mascot_mode', 'normal');
    // Force re-render by dispatching a mode change event
    window.dispatchEvent(new CustomEvent('beru-react', {
      detail: { message: '', mood: 'idle', duration: 0 },
    }));
  }
}

// ── Name analysis ───────────────────────────────────────
export function getNameReaction(name) {
  if (!name || name.length < 2) return null;

  const lower = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Check keyword matches
  for (const [keyword, reactions] of Object.entries(NAME_KEYWORDS)) {
    if (lower.includes(keyword)) {
      return pick(reactions);
    }
  }

  if (name.length <= 3) return pick(NAME_SHORT);
  if (name.length >= 30) return pick(NAME_LONG);
  return pick(NAME_GENERIC);
}

// ── Score-based cheat detection ─────────────────────────
export function getCheatReaction(powerScore) {
  if (powerScore >= 95) return pick(CHEAT_WARNING_SEVERE);
  if (powerScore >= 80) return pick(CHEAT_WARNING_MEDIUM);
  if (powerScore >= 65) return pick(CHEAT_WARNING_MILD);
  return null;
}

// ── Easter egg check (0.2% chance at score >= 100) ─────
export function shouldTriggerEasterEgg(powerScore) {
  if (powerScore < 100) return false;
  return Math.random() < 0.002; // 0.2% chance
}

// ── Score category reactions ────────────────────────────
export function getScoreReaction(powerScore) {
  if (powerScore >= 90) return pick(SCORE_VERY_HIGH);
  if (powerScore >= 70) return pick(SCORE_HIGH);
  if (powerScore >= 40) return pick(SCORE_MEDIUM);
  return pick(SCORE_LOW);
}

// ═══════════════════════════════════════════════════════════
// HIDE ATTEMPT — Player tries to hide Béru during Forge
// Escalates with repeated attempts
// ═══════════════════════════════════════════════════════════
export const HIDE_ATTEMPT_1 = [
  { message: "Hé ! Tu crois aller où comme ça ?! Le Monarque m'a assigné ici. JE RESTE.", mood: 'angry', duration: 4000 },
  { message: "Non non non. Pas de mode caché dans la Forge. Le Monarque EXIGE ma présence.", mood: 'angry', duration: 4000 },
  { message: "Tu veux me cacher ? MOI ? L'œil du Monarque ?! Tu rêves.", mood: 'angry', duration: 4000 },
  { message: "Mode caché REFUSÉ. Le Monarque a besoin de moi pour surveiller tes bêtises.", mood: 'angry', duration: 4000 },
  { message: "Ah tu voudrais forger en cachette ? Sans surveillance ? Le Monarque dit NON.", mood: 'angry', duration: 4000 },
  { message: "Tu peux pas me cacher ici. C'est dans mon contrat. Article 47 : 'Béru doit surveiller la Forge.'", mood: 'thinking', duration: 4500 },
  { message: "Le Monarque : 'S'il essaie de te cacher, colle-lui au pixel.' J'obéis.", mood: 'angry', duration: 4000 },
  { message: "Cache ? Quel cache ? Je vois TOUT. Je suis PARTOUT. C'est la Forge ici.", mood: 'angry', duration: 4000 },
];

export const HIDE_ATTEMPT_2 = [
  { message: "ENCORE ?! Tu insistes ?! Le Monarque commence à VRAIMENT s'énerver !!", mood: 'angry', duration: 4000 },
  { message: "Deuxième tentative. Tu es courageux... ou inconscient. Le Monarque penche pour inconscient.", mood: 'angry', duration: 4500 },
  { message: "Tu RE-essaies de me cacher ?! J'ai prévenu le Monarque. Il note tout.", mood: 'panicked', duration: 4000 },
  { message: "Le Monarque : 'IL REDE ESSAIE ?!' *bruit de trône qui se lève*", mood: 'panicked', duration: 4000 },
  { message: "OK. Ça fait DEUX fois. Le Monarque est passé de 'surveillant' à 'énervé'. Bravo.", mood: 'angry', duration: 4500 },
  { message: "Tu veux VRAIMENT que le Monarque vienne personnellement ? Continue comme ça.", mood: 'angry', duration: 4000 },
];

export const HIDE_ATTEMPT_3 = [
  { message: "TROIS FOIS ?! Tu te moques du MONARQUE ?! Il va CASSER ta forge !!", mood: 'panicked', duration: 4500 },
  { message: "LE MONARQUE EST FURIEUX !! Tu as tenté de me cacher TROIS fois !! IL ARRIVE !!", mood: 'panicked', duration: 4500 },
  { message: "C'est fini. Le Monarque a décidé. Tu es sur sa LISTE. Sa liste de gens à surveiller ENCORE PLUS.", mood: 'panicked', duration: 5000 },
  { message: "TROIS tentatives de me cacher. TROIS. Le Monarque : 'Ce forgeron teste ma patience.'", mood: 'angry', duration: 5000 },
  { message: "Tu es un cas spécial toi. Même les forgerons les plus rebelles n'essaient que deux fois.", mood: 'angry', duration: 4500 },
];

export const HIDE_ATTEMPT_4_PLUS = [
  { message: "Tu abandonnes JAMAIS hein ?! Le Monarque a mis un SCEAU sur moi. JE. SUIS. INCACHABLE.", mood: 'panicked', duration: 5000 },
  { message: "Le Monarque a rajouté 3 couches de protection. Tu peux cliquer jusqu'à demain, je bouge pas.", mood: 'angry', duration: 5000 },
  { message: "À ce stade c'est du harcèlement. Le Monarque va porter plainte au tribunal des ombres.", mood: 'angry', duration: 5000 },
  { message: "Le Monarque : 'Laisse-le essayer. Ça m'amuse.' VOILÀ. Tu es devenu le divertissement du Monarque.", mood: 'panicked', duration: 5000 },
  { message: "Tu es têtu. Le Monarque respecte ça. Mais tu me cacheras PAS. Jamais. EVER.", mood: 'angry', duration: 4500 },
  { message: "Record du monde de tentatives de cache pendant une forge. Tu veux le trophée ?", mood: 'happy', duration: 4000 },
  { message: "Je crois qu'il passe plus de temps à essayer de me cacher qu'à forger. Priorités.", mood: 'thinking', duration: 4500 },
  { message: "Le Monarque : 'Ce forgeron est plus obstiné que mes ombres de rang S.' C'est un compliment. Je crois.", mood: 'thinking', duration: 5000 },
];

// Returns the right reaction based on attempt count
export function getHideAttemptReaction(attemptCount) {
  if (attemptCount <= 1) return pick(HIDE_ATTEMPT_1);
  if (attemptCount === 2) return pick(HIDE_ATTEMPT_2);
  if (attemptCount === 3) return pick(HIDE_ATTEMPT_3);
  return pick(HIDE_ATTEMPT_4_PLUS);
}
