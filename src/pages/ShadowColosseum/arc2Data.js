// arc2Data.js — ARC II: Retrouver Pascal (Nier Automata)
// Bebe Machine Boy & Bebe Machine Girl partent a la recherche de Pascal, leur aine.

// ─── Unlock Logic ─────────────────────────────────────────────

const ARC1_ALL_IDS = [
  'goblin', 'wolf', 'golem', 'knight',
  'spectre', 'salamandre', 'griffon', 'guardian',
  'chimera', 'phoenix', 'titan', 'monarch',
  'wraith', 'ifrit', 'wyvern', 'lich_king',
  'banshee', 'dragon_rouge', 'tempestaire', 'colossus',
  'archdemon', 'ragnarok', 'zephyr', 'supreme_monarch',
];

export function isArc2Unlocked(data) {
  if (data.arc2Unlocked) return true;
  if (data.grimoireWeiss) return true;
  return ARC1_ALL_IDS.every(id => id in data.stagesCleared);
}

// ─── Grimoire Weiss ───────────────────────────────────────────

export const GRIMOIRE_WEISS = {
  id: 'grimoire_weiss',
  name: 'Grimoire Weiss',
  description: 'Un grimoire ancien qui murmure des verites oubliees... Il ouvre la porte vers un monde de machines.',
  dropRate: 1 / 250,
  sprite: '', // placeholder — ChatGPT generera l'image
};

// ─── Tier Names ───────────────────────────────────────────────

export const ARC2_TIER_NAMES = {
  1: 'Usine Desaffectee',
  2: 'Foret des Machines',
  3: 'Cite en Ruines',
  4: 'Tour de Guet',
  5: 'Royaume de Pascal',
  6: 'Memoire du Monde',
};

export const ARC2_TIER_COOLDOWN_MIN = { 1: 30, 2: 45, 3: 60, 4: 90, 5: 120, 6: 180 };

// ─── ARC II Stages (24 monstres: 4 par tier) ─────────────────
// HP: 20,000+ → boss finaux 150,000+
// ATK: 500+ minimum
// Theme: machines/androides Nier Automata

// Stats buffed: HP x5, ATK x2.2 (rebalance Feb 19 2026 — combat longevity + threat)
export const ARC2_STAGES = [
  // ═══ Tier 1 — Usine Desaffectee ═══
  { id: 'a2_drone', name: 'Drone de Combat', arc: 2, tier: 1, element: 'wind', emoji: '\uD83E\uDD16',
    sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771504806/dronesCombat_rucjlg.png',
    hp: 130000, atk: 1375, def: 200, spd: 45, crit: 12, res: 11, xp: 400, coins: 600,
    skills: [{ name: 'Tir Laser', power: 110, cdMax: 0 }, { name: 'Salve de Missiles', power: 200, cdMax: 3, debuffSpd: 15, debuffDur: 2 }] },
  { id: 'a2_goliath_petit', name: 'Petit Goliath', arc: 2, tier: 1, element: 'earth', emoji: '\uD83E\uDD16',
    sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771506560/MiniGoliath_betej3.png',
    hp: 182000, atk: 1514, def: 350, spd: 20, crit: 5, res: 21, xp: 450, coins: 650,
    skills: [{ name: 'Poing Hydraulique', power: 105, cdMax: 0 }, { name: 'Seisme Mecanique', power: 190, cdMax: 3 }, { name: 'Reparation', power: 0, cdMax: 4, healAlly: 20, buffDur: 2 }] },
  { id: 'a2_machine_folle', name: 'Machine Folle', arc: 2, tier: 1, element: 'fire', emoji: '\uD83E\uDD16',
    sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771509138/MachineFolle_fge0pn.png',
    hp: 143000, atk: 1650, def: 180, spd: 55, crit: 20, res: 7, xp: 420, coins: 620,
    skills: [{ name: 'Autodestruction', power: 130, cdMax: 0, poison: 3, poisonDur: 2 }, { name: 'Surchauffe', power: 250, cdMax: 3, buffAtk: 40, buffDur: 2 }] },
  { id: 'a2_gardien_usine', name: "Gardien de l'Usine", arc: 2, tier: 1, element: 'shadow', emoji: '\uD83E\uDD16', isBoss: true,
    sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771509800/GardienDesMachines_sfixar.png',
    hp: 227500, atk: 1789, def: 300, spd: 30, crit: 10, res: 17, xp: 800, coins: 1200,
    skills: [{ name: 'Frappe Industrielle', power: 110, cdMax: 0, debuffAtk: 15, debuffDur: 2 }, { name: 'Bouclier d\'Acier', power: 0, cdMax: 3, buffDef: 80, buffDur: 3 }, { name: 'Protocole d\'Elimination', power: 280, cdMax: 5 }] },

  // ═══ Tier 2 — Foret des Machines ═══
  { id: 'a2_machine_lierre', name: 'Machine-Lierre', arc: 2, tier: 2, element: 'earth', emoji: '\uD83C\uDF3F',
    sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771511204/LierreMachine_f2p5bd.png',
    hp: 195000, atk: 1595, def: 280, spd: 30, crit: 8, res: 25, xp: 550, coins: 800,
    skills: [{ name: 'Racine Mecanique', power: 105, cdMax: 0 }, { name: 'Etreinte Vegetale', power: 0, cdMax: 3, debuffDef: 40, debuffDur: 2 }, { name: 'Seve Parasitaire', power: 80, cdMax: 4, antiHeal: true, antiHealDur: 2 }] },
  { id: 'a2_cerf_machine', name: 'Cerf-Machine', arc: 2, tier: 2, element: 'wind', emoji: '\uD83E\uDD8C',
    sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771510859/CerfMachine_nuodo5.png',
    hp: 169000, atk: 1705, def: 220, spd: 60, crit: 18, res: 11, xp: 580, coins: 850,
    skills: [{ name: 'Charge Eclair', power: 115, cdMax: 0 }, { name: 'Ruade Sonique', power: 220, cdMax: 2 }] },
  { id: 'a2_champignon', name: 'Champignon Sentient', arc: 2, tier: 2, element: 'shadow', emoji: '\uD83C\uDF44',
    sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771512275/ChampignonSentient_mzylvl.png',
    hp: 208000, atk: 1485, def: 250, spd: 25, crit: 10, res: 31, xp: 560, coins: 820,
    skills: [{ name: 'Spore Toxique', power: 100, cdMax: 0, poison: 4, poisonDur: 3 }, { name: 'Brouillard Mortel', power: 180, cdMax: 3, debuffDef: 30, debuffDur: 3 }] },
  { id: 'a2_roi_foret', name: 'Roi de la Foret', arc: 2, tier: 2, element: 'earth', emoji: '\uD83C\uDF33', isBoss: true,
    sprite: '',
    hp: 325000, atk: 1925, def: 380, spd: 22, crit: 12, res: 28, xp: 1100, coins: 1600,
    skills: [{ name: 'Colere Sylvestre', power: 110, cdMax: 0 }, { name: 'Muraille Vivante', power: 0, cdMax: 3, buffDef: 100, buffDur: 3 }, { name: 'Benediction Sylvestre', power: 0, cdMax: 4, buffAllyAtk: 40, buffAllyDef: 30, buffDur: 2 }, { name: 'Jugement de la Nature', power: 300, cdMax: 5 }] },

  // ═══ Tier 3 — Cite en Ruines ═══
  { id: 'a2_android_errant', name: 'Androide Errant', arc: 2, tier: 3, element: 'shadow', emoji: '\uD83E\uDD16',
    sprite: '',
    hp: 247000, atk: 1925, def: 300, spd: 42, crit: 15, res: 17, xp: 700, coins: 1000,
    skills: [{ name: 'Lame Programmee', power: 112, cdMax: 0, debuffAtk: 20, debuffDur: 2 }, { name: 'Protocole Berserker', power: 250, cdMax: 3, buffAtk: 50, buffDur: 2 }] },
  { id: 'a2_tank_rouille', name: 'Tank Rouille', arc: 2, tier: 3, element: 'fire', emoji: '\uD83D\uDE9C',
    sprite: '',
    hp: 292500, atk: 1789, def: 450, spd: 15, crit: 5, res: 35, xp: 720, coins: 1050,
    skills: [{ name: 'Canon Thermique', power: 108, cdMax: 0, debuffSpd: 20, debuffDur: 2 }, { name: 'Blindage', power: 0, cdMax: 3, buffDef: 120, buffDur: 3 }] },
  { id: 'a2_sniper', name: 'Sniper Optique', arc: 2, tier: 3, element: 'wind', emoji: '\uD83C\uDFAF',
    sprite: '',
    hp: 195000, atk: 2339, def: 200, spd: 55, crit: 30, res: 7, xp: 750, coins: 1100,
    skills: [{ name: 'Tir de Precision', power: 120, cdMax: 0 }, { name: 'Tir Mortel', power: 350, cdMax: 4 }] },
  { id: 'a2_simone', name: 'Beaute Obsedante', arc: 2, tier: 3, element: 'shadow', emoji: '\uD83C\uDFAD', isBoss: true,
    sprite: '',
    hp: 422500, atk: 2064, def: 320, spd: 38, crit: 18, res: 21, xp: 1500, coins: 2200,
    skills: [{ name: 'Chant Hypnotique', power: 100, cdMax: 0, debuffDef: 20, debuffDur: 2 }, { name: 'Amour Destructeur', power: 280, cdMax: 3, antiHeal: true, antiHealDur: 2 }, { name: 'Metamorphose', power: 0, cdMax: 5, buffAtk: 80, buffDur: 3 }] },

  // ═══ Tier 4 — Tour de Guet ═══
  { id: 'a2_sentinelle', name: 'Sentinelle Celeste', arc: 2, tier: 4, element: 'wind', emoji: '\uD83D\uDC41\uFE0F',
    sprite: '',
    hp: 312000, atk: 2200, def: 350, spd: 48, crit: 20, res: 21, xp: 900, coins: 1300,
    skills: [{ name: 'Rayon Detecteur', power: 110, cdMax: 0 }, { name: 'Tir Orbital', power: 280, cdMax: 3 }, { name: 'Signal de Soin', power: 0, cdMax: 4, healAlly: 25, buffDur: 2 }] },
  { id: 'a2_goliath', name: 'Goliath Blinde', arc: 2, tier: 4, element: 'earth', emoji: '\uD83E\uDD16',
    sprite: '',
    hp: 390000, atk: 2064, def: 500, spd: 18, crit: 8, res: 39, xp: 950, coins: 1400,
    skills: [{ name: 'Ecrasement Total', power: 115, cdMax: 0 }, { name: 'Onde de Choc', power: 260, cdMax: 3 }, { name: 'Protocole Soins', power: 0, cdMax: 4, healAlly: 20, buffDur: 2 }] },
  { id: 'a2_assassin', name: 'Assassin YoRHa', arc: 2, tier: 4, element: 'shadow', emoji: '\u2620\uFE0F',
    sprite: '',
    hp: 260000, atk: 2614, def: 250, spd: 65, crit: 35, res: 11, xp: 920, coins: 1350,
    skills: [{ name: 'Lame Noire', power: 125, cdMax: 0 }, { name: 'Execution', power: 380, cdMax: 4 }] },
  { id: 'a2_grun', name: 'Grun — Le Leviathan', arc: 2, tier: 4, element: 'water', emoji: '\uD83D\uDC33', isBoss: true,
    sprite: '',
    hp: 552500, atk: 2339, def: 400, spd: 25, crit: 12, res: 31, xp: 2000, coins: 3000,
    skills: [{ name: 'Raz de Maree', power: 110, cdMax: 0, debuffSpd: 25, debuffDur: 2 }, { name: 'Plongee Abyssale', power: 0, cdMax: 3, buffDef: 100, buffDur: 3 }, { name: 'Colere du Leviathan', power: 350, cdMax: 5 }] },

  // ═══ Tier 5 — Royaume de Pascal ═══
  { id: 'a2_enfant_machine', name: 'Enfant-Machine', arc: 2, tier: 5, element: 'light', emoji: '\uD83E\uDDF8',
    sprite: '',
    hp: 357500, atk: 2339, def: 380, spd: 40, crit: 15, res: 25, xp: 1100, coins: 1600,
    skills: [{ name: 'Cri Innocent', power: 105, cdMax: 0, debuffDef: 25, debuffDur: 2 }, { name: 'Larme de Lumiere', power: 240, cdMax: 3, poison: 5, poisonDur: 3 }] },
  { id: 'a2_protecteur', name: 'Protecteur du Village', arc: 2, tier: 5, element: 'earth', emoji: '\uD83D\uDEE1\uFE0F',
    sprite: '',
    hp: 455000, atk: 2145, def: 550, spd: 22, crit: 8, res: 42, xp: 1200, coins: 1800,
    skills: [{ name: 'Garde Eternelle', power: 100, cdMax: 0 }, { name: 'Mur de Fer', power: 0, cdMax: 3, buffDef: 150, buffDur: 3 }] },
  { id: 'a2_philosophe', name: 'Machine Philosophe', arc: 2, tier: 5, element: 'shadow', emoji: '\uD83D\uDCDA',
    sprite: '',
    hp: 325000, atk: 2475, def: 300, spd: 50, crit: 22, res: 21, xp: 1150, coins: 1700,
    skills: [{ name: 'Pensee Mortelle', power: 115, cdMax: 0 }, { name: 'Doute Existentiel', power: 0, cdMax: 3, debuffDef: 50, debuffDur: 2 }, { name: 'Conclusion Logique', power: 320, cdMax: 4 }] },
  { id: 'a2_roi_machines', name: 'Roi des Machines', arc: 2, tier: 5, element: 'fire', emoji: '\uD83D\uDC51', isBoss: true,
    sprite: '',
    hp: 715000, atk: 2614, def: 450, spd: 30, crit: 15, res: 31, xp: 2500, coins: 4000,
    skills: [{ name: 'Decret Royal', power: 110, cdMax: 0, debuffAtk: 25, debuffDur: 2 }, { name: 'Flamme Souveraine', power: 300, cdMax: 3, buffSpd: 30, buffDur: 2 }, { name: 'Fin du Monde', power: 400, cdMax: 5 }] },

  // ═══ Tier 6 — Memoire du Monde ═══
  { id: 'a2_ko_shi', name: 'Ko-Shi', arc: 2, tier: 6, element: 'fire', emoji: '\u2604\uFE0F',
    sprite: '',
    hp: 455000, atk: 2750, def: 400, spd: 50, crit: 25, res: 21, xp: 1500, coins: 2200,
    skills: [{ name: 'Lance de Feu', power: 120, cdMax: 0 }, { name: 'Eruption Mecanique', power: 320, cdMax: 3 }, { name: 'Flamme Fraternelle', power: 0, cdMax: 4, buffAllyAtk: 50, buffDur: 2 }] },
  { id: 'a2_ro_shi', name: 'Ro-Shi', arc: 2, tier: 6, element: 'earth', emoji: '\uD83E\uDEA8',
    sprite: '',
    hp: 520000, atk: 2475, def: 600, spd: 25, crit: 10, res: 42, xp: 1500, coins: 2200,
    skills: [{ name: 'Poing de Titan', power: 115, cdMax: 0 }, { name: 'Armure Ultime', power: 0, cdMax: 3, buffDef: 150, buffDur: 3 }, { name: 'Lien de Titan', power: 0, cdMax: 4, buffAllyDef: 40, buffDur: 2 }] },
  { id: 'a2_adam', name: 'Adam — La Conscience', arc: 2, tier: 6, element: 'light', emoji: '\u2728',
    sprite: '',
    hp: 585000, atk: 3025, def: 350, spd: 60, crit: 30, res: 17, xp: 2000, coins: 3000,
    skills: [{ name: 'Eveil', power: 125, cdMax: 0, antiHeal: true, antiHealDur: 2 }, { name: 'Curiosite Infinie', power: 350, cdMax: 3, buffAtk: 60, buffDur: 2, debuffSpd: 20, debuffDur: 2 }, { name: 'Humanite', power: 420, cdMax: 5 }] },
  { id: 'a2_eve', name: 'Eve — La Rage', arc: 2, tier: 6, element: 'shadow', emoji: '\uD83D\uDD25', isBoss: true,
    sprite: '',
    hp: 975000, atk: 3300, def: 500, spd: 45, crit: 22, res: 28, xp: 4000, coins: 6000,
    skills: [{ name: 'Colere Primitive', power: 120, cdMax: 0, debuffAtk: 20, debuffDur: 2 }, { name: 'Lien Fraternel', power: 0, cdMax: 3, buffAtk: 100, buffDur: 3 }, { name: 'Aneantissement Final', power: 500, cdMax: 5, poison: 8, poisonDur: 3 }] },
];

// ─── Multi-enemy encounter builder ──────────────────────────
// Crescendo: Tier 1=2, Tier 2=2-3, Tier 3=3, Tier 4=3-4, Tier 5=4, Tier 6=4-5
const ENEMY_COUNT = {
  1: { normal: 2, boss: 2 },
  2: { normal: 2, boss: 3 },
  3: { normal: 3, boss: 3 },
  4: { normal: 3, boss: 4 },
  5: { normal: 4, boss: 4 },
  6: { normal: 4, boss: 5 },
};

export function buildStageEnemies(stage) {
  const tier = stage.tier;
  const counts = ENEMY_COUNT[tier] || { normal: 2, boss: 2 };
  const totalEnemies = stage.isBoss ? counts.boss : counts.normal;

  // Main enemy = the stage itself (already has buffed stats)
  const main = { ...stage, isMain: true };

  // Pick sbires from other stages of the same tier
  const sameTier = ARC2_STAGES.filter(s => s.tier === tier && s.id !== stage.id && !s.isBoss);
  const sbiresNeeded = totalEnemies - 1;
  const sbires = [];
  const sbireMult = 0.55; // sbires have 55% stats of their base

  for (let i = 0; i < sbiresNeeded; i++) {
    const src = sameTier[i % sameTier.length];
    sbires.push({
      ...src,
      id: `${src.id}_s${i}`,
      name: `${src.name} (Sbire)`,
      hp: Math.floor(src.hp * sbireMult),
      atk: Math.floor(src.atk * sbireMult),
      def: Math.floor(src.def * sbireMult),
      res: Math.floor(src.res * sbireMult),
      spd: Math.max(5, Math.floor(src.spd * 0.8)),
      crit: Math.max(1, Math.floor(src.crit * 0.7)),
      isMain: false,
      isBoss: false,
    });
  }

  return [main, ...sbires];
}

// ─── Beru Dialogues — ARC II Locked (escalating) ─────────────

export const ARC2_LOCKED_BERU_DIALOGUES = [
  // Click 1-3 : Beru fait l'innocent
  "Hmm ? Cet arc ? Oublie ca, c'est rien. Finis deja l'ARC I.",
  "T'es encore la ? Y'a rien a voir. Circule.",
  "Arrete de cliquer, y'a RIEN je te dis !",
  // Click 4-6 : Beru commence a lacher des indices
  "Bon... peut-etre qu'il y a quelque chose derriere. Mais c'est pas pour toi. Pas encore.",
  "Si je te dis que ca concerne des machines... tu laches l'affaire ?",
  "Ok STOP ! Y'a... une histoire. Avec des bebes. Des bebes machines. Content ?",
  // Click 7-9 : Beru craque completement
  "BON ! Y'a un certain Pascal, OK ?! Les bebes le cherchent ! Mais faut d'abord que tu sois PRET !",
  "Pourquoi t'es comme ca ?! C'est PASCAL ! Leur AINE ! Ils le cherchent depuis... *renifle* c'est rien. J'ai une poussiere.",
  "Tu veux tout savoir hein ? Finis tous les donjons. Ou alors... peut-etre qu'un grimoire tombera du ciel. 1 chance sur 250. Bonne chance.",
];

// ─── Bebe Machine Reactions (quand vedettes + clic ARC II) ───

export const ARC2_BEBE_MACHINE_REACTIONS = {
  girl: [
    "Pascalou... ? C'est... Pascalou la-dedans ?! *yeux brillants*",
    "BERU ! C'EST PASCAL ! Notre grand frere ! IL FAUT Y ALLER !",
    "Pascalou me manque... il racontait des histoires avant dodo...",
    "Si on retrouve Pascal, on sera une famille complete !",
    "*pleure en bruit de machine* PAS-CA-LOU !",
  ],
  boy: [
    "Pa... Pascal ?! Il est vivant ?! OU ?! *tape partout*",
    "PASCAL ! MON HERO ! Il m'a appris a compter jusqu'a 3 !",
    "Beru... on peut aller chercher Pascal ? S'il te plait ? *tremble*",
    "J'ai casse 47 trucs en cherchant Pascal. C'est pas assez ?",
    "*mode turbo active* JE VAIS LE CHERCHER MOI-MEME !",
  ],
  pair: [
    { girl: "PASCAL !", boy: "PASCAL !!!", beru: "Calmez-vous tous les deux ! On ira le chercher ! Mais d'abord faut que le joueur se prepare..." },
    { girl: "Tu te rappelles quand Pascal nous lisait des histoires ?", boy: "OUI ! L'histoire du robot qui voulait etre papillon !", beru: "...je suis pas pret pour ce niveau d'emotions." },
    { girl: "Pascal disait toujours : la violence c'est mal.", boy: "Et moi j'ai mordu un caillou juste apres.", beru: "Vous etes... desespérants. Mais adorables." },
  ],
};

// ─── Story Chapters (placeholders — contenu a remplir) ───────

export const ARC2_STORIES = {
  1: {
    title: 'Chapitre 1 : Le Signal',
    scenes: [
      // --- Scene 1: Introduction narrative ---
      { type: 'text', speaker: 'narrator',
        text: "La nuit tombe sur le Colisee des Ombres. Le silence est inhabituellement lourd... comme si l'air lui-meme retenait son souffle. Quelque part dans les profondeurs, une frequence oubliee se met a vibrer." },

      // --- Scene 2: Bebe Machine Girl capte le signal ---
      { type: 'dialogue', speaker: 'bebe_girl',
        text: "... ! Beru ! BERU ! Tu entends ca ?! Ce... ce bruit dans ma tete ! C'est... c'est comme une berceuse ! La berceuse que Pascal chantait !" },

      // --- Scene 3: Bebe Machine Boy reagit ---
      { type: 'dialogue', speaker: 'bebe_boy',
        text: "MOI AUSSI ! Ca fait BZZZT BZZZT dans mon ventre ! C'est... c'est le signal de Pascal ! Il est VIVANT ?! *tourne en rond tres vite*" },

      // --- Scene 4: Beru essaie de calmer ---
      { type: 'dialogue', speaker: 'beru',
        text: "Hola hola hola, du calme vous deux ! Un signal ? Quel signal ? ...Attendez. Meme moi je le capte. C'est faible mais... ca vient du nord. De l'ancienne Usine Desaffectee." },

      // *** IMAGE 1 ***
      // DESCRIPTION POUR CHATGPT:
      // "Une usine industrielle abandonnee la nuit, style Nier Automata. Enormes tuyaux rouilles,
      //  lumieres rouges clignotantes au loin, brouillard epais au sol. Atmosphere sombre et
      //  mysterieuse. Vue de loin, silhouette de l'usine contre un ciel etoile violet/rouge.
      //  Style anime/manga, dark fantasy. 16:9 landscape."
      { type: 'image', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771349152/Story1IMG1_dbt6gx.png', alt: "L'Usine Desaffectee — une silhouette industrielle lugubre sous un ciel etoile" },

      // --- Scene 5: Girl veut y aller tout de suite ---
      { type: 'dialogue', speaker: 'bebe_girl',
        text: "L'usine... ! Pascal est la-bas ! Il nous attend ! Il a besoin de nous ! On y va MAINTENANT !" },

      // --- Scene 6: Boy est deja pret ---
      { type: 'dialogue', speaker: 'bebe_boy',
        text: "J'AI DEJA MES POINGS CHARGES ! *fait des moulinets avec les bras* PASCAL, ON ARRIVE !!!" },

      // --- Scene 7: Beru temporise ---
      { type: 'dialogue', speaker: 'beru',
        text: "STOP ! On fonce pas tete baissee dans une usine remplie de machines hostiles ! Il nous faut un plan. Et surtout... il nous faut le joueur." },

      // *** IMAGE 2 ***
      // DESCRIPTION POUR CHATGPT:
      // "Deux petits robots adorables (style chibi/bebe) devant Beru (petit monstre ombre violet mignon).
      //  La fille robot a des yeux brillants bleus pleins d'espoir, le garcon robot a les poings leves
      //  en mode combat. Beru a l'air stresse/depasse entre les deux. Fond sombre avec des
      //  etincelles/particules. Style anime chibi, emotionnel. 16:9 landscape."
      { type: 'image', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771350321/STORY1IMG2_mycwo7.png', alt: "Bebe Machine Girl et Boy implorent Beru de partir a la recherche de Pascal" },

      // --- Scene 8: Girl implore ---
      { type: 'dialogue', speaker: 'bebe_girl',
        text: "Beru... *voix tremblante* Pascal... il nous racontait des histoires le soir. Il disait qu'on etait une famille. Que les machines aussi pouvaient aimer. S'il te plait... on doit le retrouver." },

      // --- Scene 9: Boy plus calme ---
      { type: 'dialogue', speaker: 'bebe_boy',
        text: "Pascal m'a appris a compter. Et a pas mordre les gens. Enfin... j'ai un peu oublie la deuxieme partie. Mais il me manque quand meme..." },

      // --- Scene 10: Beru accepte ---
      { type: 'dialogue', speaker: 'beru',
        text: "...Bon. D'accord. On va chercher Pascal. Mais ecoutez-moi bien : l'Usine Desaffectee est dangereuse. Des machines corrompues y rodent. Le joueur va devoir se battre. Et vous deux... restez derriere moi." },

      // --- Scene 11: Girl et Boy ensemble ---
      { type: 'dialogue', speaker: 'bebe_girl',
        text: "MERCI BERU ! *saute de joie* ON VA RETROUVER PASCAL ! ON VA RETROUVER NOTRE GRAND FRERE !" },

      { type: 'dialogue', speaker: 'bebe_boy',
        text: "PASCAL ! PASCAL ! PASCAL ! *casse une caisse sans faire expres* ...oups." },

      // --- Scene 12: Narrateur conclusion ---
      { type: 'text', speaker: 'narrator',
        text: "Et ainsi commence la quete. Quelque part dans les entrailles de l'Usine Desaffectee, un signal continue de pulser. Faible. Regulier. Comme un coeur de machine qui refuse de s'eteindre." },

      // *** IMAGE 3 ***
      // DESCRIPTION POUR CHATGPT:
      // "Interieur d'une usine sombre et delabre. Au fond, une faible lumiere verte pulse
      //  dans l'obscurite — c'est le signal de Pascal. Machines cassees au sol, fils electriques
      //  qui pendent, rouille partout. Un chemin etroit mene vers la lumiere. Atmosphere
      //  d'espoir dans les tenebres. Style Nier Automata, anime, dark but hopeful. 16:9 landscape."
      { type: 'image', src: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771350874/STORY1IMG3_mlwzgo.png', alt: "Au fond de l'usine, une lumiere verte pulse dans les tenebres — le signal de Pascal" },

      // --- Scene finale: Beru au joueur ---
      { type: 'dialogue', speaker: 'beru',
        text: "Bon joueur... c'est a toi. On compte sur toi. Ces deux-la comptent sur toi. Pascal... compte sur toi. Choisis ton equipe de 3. Ca va pas etre une promenade de sante." },
    ],
    music: 'https://res.cloudinary.com/dbg7m8qjd/video/upload/v1771499910/OSTReplicant_jfru6g.mp3',
  },
  2: {
    title: 'Chapitre 2 : La Foret Silencieuse',
    scenes: [],
    music: null,
  },
  3: {
    title: 'Chapitre 3 : Echos de la Cite',
    scenes: [],
    music: null,
  },
  4: {
    title: 'Chapitre 4 : La Verite',
    scenes: [],
    music: null,
  },
  5: {
    title: 'Chapitre 5 : Le Village de Pascal',
    scenes: [],
    music: null,
  },
  6: {
    title: 'Chapitre 6 : Memoire',
    scenes: [],
    music: null,
  },
};
