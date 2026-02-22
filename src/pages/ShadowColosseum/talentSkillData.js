// talentSkillData.js — Talent Skill system (3rd talent tab)
// Unlocks at level 100. Costs 15 talent points from the shared pool.
// Each chibi/hunter has 3 unique skills. Player equips 1, replacing a default skill slot.
// These skills are stronger but cost more mana.

export const TALENT_SKILL_COST = 15;
export const TALENT_SKILL_UNLOCK_LEVEL = 100;

// ═══════════════════════════════════════════════════════════════
// TALENT SKILLS — 3 per character (DPS / Utility / Survivability)
// Format: same as normal skills + explicit manaCost (always high)
// ═══════════════════════════════════════════════════════════════

export const TALENT_SKILLS = {

  // ─── CHIBIS (8) ────────────────────────────────────────────

  kaisel: [
    { id: 'ts_kaisel_1', name: 'Tempete Celeste', power: 350, cdMax: 4, manaCost: 45, desc: 'Invoque une tempete devastatrice qui lacere tout sur son passage' },
    { id: 'ts_kaisel_2', name: 'Danse du Vent', power: 220, cdMax: 2, manaCost: 30, buffAtk: 35, buffDur: 2, desc: 'Enchaine des frappes rapides et booste sa puissance' },
    { id: 'ts_kaisel_3', name: 'Souffle Divin', power: 280, cdMax: 3, manaCost: 40, healSelf: 15, desc: 'Canalise le vent pour frapper et guerir simultanement' },
  ],
  tank: [
    { id: 'ts_tank_1', name: 'Bastion Eternel', power: 0, cdMax: 5, manaCost: 50, buffDef: 150, buffDur: 3, desc: 'Invoque une forteresse de pierre imprenable' },
    { id: 'ts_tank_2', name: 'Seisme Titanesque', power: 300, cdMax: 4, manaCost: 45, debuffDef: 40, debuffDur: 2, desc: 'Fracture le sol sous les pieds de l\'ennemi' },
    { id: 'ts_tank_3', name: 'Regeneration Absolue', power: 0, cdMax: 5, manaCost: 55, healSelf: 40, buffDef: 60, buffDur: 2, desc: 'Soin massif + bouclier de roche' },
  ],
  nyarthulu: [
    { id: 'ts_nyarthulu_1', name: 'Appel de l\'Abysse', power: 340, cdMax: 4, manaCost: 48, debuffDef: 30, debuffDur: 2, desc: 'Invoque les tenebres pour devorer et affaiblir' },
    { id: 'ts_nyarthulu_2', name: 'Emprise Tentaculaire', power: 260, cdMax: 3, manaCost: 38, debuffDef: 45, debuffDur: 3, desc: 'Immobilise l\'ennemi et brise ses defenses' },
    { id: 'ts_nyarthulu_3', name: 'Regard du Neant', power: 300, cdMax: 4, manaCost: 42, healSelf: 20, desc: 'Absorbe l\'essence vitale de l\'adversaire' },
  ],
  raven: [
    { id: 'ts_raven_1', name: 'Ouragan de Plumes', power: 310, cdMax: 4, manaCost: 42, desc: 'Pluie de plumes tranchantes comme des lames' },
    { id: 'ts_raven_2', name: 'Vol Supersonique', power: 250, cdMax: 2, manaCost: 32, buffAtk: 30, buffDur: 2, desc: 'Frappe eclair + acceleration' },
    { id: 'ts_raven_3', name: 'Ailes Protectrices', power: 200, cdMax: 3, manaCost: 35, buffDef: 50, buffDur: 3, desc: 'Se protege de ses ailes et contre-attaque' },
  ],
  lil_kaisel: [
    { id: 'ts_lil_kaisel_1', name: 'Mini Tempete', power: 280, cdMax: 3, manaCost: 38, desc: 'Petite mais devastatrice tornade' },
    { id: 'ts_lil_kaisel_2', name: 'Cri de Guerre', power: 0, cdMax: 4, manaCost: 40, buffAtk: 80, buffDur: 3, desc: 'Rugissement qui decuple la puissance' },
    { id: 'ts_lil_kaisel_3', name: 'Plongeon Kamikaze', power: 350, cdMax: 5, manaCost: 50, desc: 'Attaque suicidaire d\'une puissance extreme' },
  ],
  pingsu: [
    { id: 'ts_pingsu_1', name: 'Magma Eternel', power: 320, cdMax: 4, manaCost: 45, desc: 'Submerge l\'ennemi sous un torrent de lave' },
    { id: 'ts_pingsu_2', name: 'Forge Supreme', power: 0, cdMax: 4, manaCost: 42, buffAtk: 70, buffDur: 3, desc: 'Forge une arme temporaire d\'une puissance inouie' },
    { id: 'ts_pingsu_3', name: 'Bouclier de Lave', power: 200, cdMax: 3, manaCost: 38, buffDef: 60, buffDur: 3, desc: 'Se couvre de lave durcie et frappe' },
  ],
  okami: [
    { id: 'ts_okami_1', name: 'Crocs du Monarque', power: 380, cdMax: 5, manaCost: 55, desc: 'Morsure royale qui dechire toute defense' },
    { id: 'ts_okami_2', name: 'Meute Fantome', power: 260, cdMax: 3, manaCost: 40, buffAtk: 40, buffDur: 2, desc: 'Invoque des loups fantomes pour attaquer' },
    { id: 'ts_okami_3', name: 'Instinct du Predateur', power: 300, cdMax: 3, manaCost: 42, debuffDef: 35, debuffDur: 2, desc: 'Frappe les points faibles avec precision' },
  ],
  alecto: [
    { id: 'ts_alecto_1', name: 'Supernova', power: 360, cdMax: 5, manaCost: 52, desc: 'Explosion stellaire d\'une chaleur extreme' },
    { id: 'ts_alecto_2', name: 'Renaissance Eternelle', power: 0, cdMax: 5, manaCost: 50, healSelf: 45, buffAtk: 30, buffDur: 3, desc: 'Renait de ses cendres plus forte que jamais' },
    { id: 'ts_alecto_3', name: 'Flamme de l\'Apocalypse', power: 300, cdMax: 4, manaCost: 45, debuffDef: 30, debuffDur: 2, desc: 'Enflamme l\'ennemi et reduit ses defenses' },
  ],

  // ─── HUNTERS — FIRE (11) ───────────────────────────────────

  h_kanae: [
    { id: 'ts_kanae_1', name: 'Lame de Braise', power: 340, cdMax: 3, manaCost: 42, desc: 'Dague enflammee a une vitesse imperceptible' },
    { id: 'ts_kanae_2', name: 'Ombre Ardente', power: 280, cdMax: 2, manaCost: 35, buffAtk: 30, buffDur: 2, desc: 'Se fond dans les flammes pour frapper' },
    { id: 'ts_kanae_3', name: 'Executrice de Feu', power: 400, cdMax: 5, manaCost: 55, desc: 'Frappe fatale aux ennemis affaiblis' },
  ],
  h_stark: [
    { id: 'ts_stark_1', name: 'Poing Volcanique', power: 320, cdMax: 4, manaCost: 45, desc: 'Poing charge de magma concentre' },
    { id: 'ts_stark_2', name: 'Armure Ignee', power: 0, cdMax: 4, manaCost: 48, buffDef: 120, buffDur: 3, desc: 'Se couvre d\'une armure de flammes' },
    { id: 'ts_stark_3', name: 'Contre-Attaque Brulante', power: 280, cdMax: 3, manaCost: 40, buffDef: 40, buffDur: 2, desc: 'Pare et riposte avec une explosion' },
  ],
  h_fern: [
    { id: 'ts_fern_1', name: 'Magie Destructrice', power: 380, cdMax: 4, manaCost: 50, desc: 'Sort offensif d\'annihilation totale' },
    { id: 'ts_fern_2', name: 'Flamme de Fern II', power: 300, cdMax: 3, manaCost: 42, debuffDef: 25, debuffDur: 2, desc: 'Version amelioree de sa signature' },
    { id: 'ts_fern_3', name: 'Barrage Incandescent', power: 250, cdMax: 2, manaCost: 35, desc: 'Rafale de frappes magiques rapides' },
  ],
  h_reed: [
    { id: 'ts_reed_1', name: 'Mur de Flammes Sacre', power: 0, cdMax: 5, manaCost: 55, buffDef: 100, buffDur: 3, healSelf: 20, desc: 'Bouclier sacre qui protege et soigne' },
    { id: 'ts_reed_2', name: 'Benediction de Feu', power: 0, cdMax: 4, manaCost: 45, buffAtk: 60, buffDef: 40, buffDur: 3, desc: 'Bénit avec la puissance du feu' },
    { id: 'ts_reed_3', name: 'Jugement du Protecteur', power: 280, cdMax: 4, manaCost: 42, desc: 'Frappe divine de celui qui protege' },
  ],
  h_choi: [
    { id: 'ts_choi_1', name: 'Pluie de Meteores', power: 360, cdMax: 4, manaCost: 50, desc: 'Fait pleuvoir des meteores enflammees' },
    { id: 'ts_choi_2', name: 'Nova Ardente', power: 280, cdMax: 3, manaCost: 40, debuffDef: 35, debuffDur: 2, desc: 'Explosion de feu qui brise les defenses' },
    { id: 'ts_choi_3', name: 'Pilier de Flamme', power: 320, cdMax: 3, manaCost: 45, desc: 'Erige un pilier de feu devastateur' },
  ],
  h_emma: [
    { id: 'ts_emma_1', name: 'Bastion de Braise', power: 0, cdMax: 5, manaCost: 52, buffDef: 130, buffDur: 3, desc: 'Rempart de flammes impenetrable' },
    { id: 'ts_emma_2', name: 'Sacrifice du Gardien', power: 0, cdMax: 5, manaCost: 55, healSelf: 45, desc: 'Restauration massive de vitalite' },
    { id: 'ts_emma_3', name: 'Bouclier Explosif', power: 260, cdMax: 4, manaCost: 42, buffDef: 50, buffDur: 2, desc: 'Detone son bouclier pour frapper et se proteger' },
  ],
  h_esil: [
    { id: 'ts_esil_1', name: 'Charge Devastatrice', power: 340, cdMax: 4, manaCost: 45, desc: 'Charge avec la force d\'un demon' },
    { id: 'ts_esil_2', name: 'Heritage Demoniaque', power: 280, cdMax: 3, manaCost: 40, buffAtk: 35, buffDur: 2, desc: 'Reveille son sang de demon' },
    { id: 'ts_esil_3', name: 'Garde Demoniaque', power: 0, cdMax: 4, manaCost: 48, buffDef: 100, buffDur: 3, desc: 'Bouclier de flammes infernales' },
  ],
  h_yuqi: [
    { id: 'ts_yuqi_1', name: 'Impact Sismique', power: 320, cdMax: 4, manaCost: 44, desc: 'Frappe qui fait trembler la terre' },
    { id: 'ts_yuqi_2', name: 'Flamme Interieure', power: 0, cdMax: 4, manaCost: 42, buffAtk: 55, buffDur: 3, desc: 'Reveille la flamme interieure' },
    { id: 'ts_yuqi_3', name: 'Vague de Chaleur', power: 280, cdMax: 3, manaCost: 40, healSelf: 15, desc: 'Onde de chaleur qui brule et regenere' },
  ],
  h_yoo: [
    { id: 'ts_yoo_1', name: 'Comete de Feu', power: 360, cdMax: 4, manaCost: 48, desc: 'Concentre une comete de flammes pures' },
    { id: 'ts_yoo_2', name: 'Catalyseur Magique', power: 260, cdMax: 3, manaCost: 38, debuffDef: 30, debuffDur: 2, desc: 'Magie qui catalyse les faiblesses' },
    { id: 'ts_yoo_3', name: 'Immolation', power: 300, cdMax: 3, manaCost: 42, buffAtk: 25, buffDur: 2, desc: 'S\'enflamme pour gagner en puissance' },
  ],
  h_gina: [
    { id: 'ts_gina_1', name: 'Source Sacree', power: 0, cdMax: 4, manaCost: 50, healSelf: 40, desc: 'Invoque une source de guerison sacree' },
    { id: 'ts_gina_2', name: 'Flamme Guerisseuse', power: 220, cdMax: 3, manaCost: 38, healSelf: 20, desc: 'Feu purificateur qui soigne et blesse' },
    { id: 'ts_gina_3', name: 'Aura de Protection', power: 0, cdMax: 5, manaCost: 48, buffDef: 80, buffDur: 3, healSelf: 15, desc: 'Aura protectrice et regenerante' },
  ],
  h_song: [
    { id: 'ts_song_1', name: 'Detonation Arcane', power: 330, cdMax: 4, manaCost: 44, desc: 'Explosion de magie pyrotechnique' },
    { id: 'ts_song_2', name: 'Flamme Persistante', power: 260, cdMax: 3, manaCost: 38, debuffDef: 25, debuffDur: 2, desc: 'Flamme qui brule et affaiblit' },
    { id: 'ts_song_3', name: 'Feu d\'Artifice', power: 300, cdMax: 3, manaCost: 42, desc: 'Spectacle pyrotechnique destructeur' },
  ],

  // ─── HUNTERS — WATER (12) ──────────────────────────────────

  h_chae_in: [
    { id: 'ts_chae_in_1', name: 'Danse des Mille Sabres', power: 370, cdMax: 4, manaCost: 50, desc: 'Enchainement de coups d\'epee devastateurs' },
    { id: 'ts_chae_in_2', name: 'Aura du Vice-Maitre', power: 260, cdMax: 3, manaCost: 40, buffAtk: 40, buffDur: 2, desc: 'Canalise son aura pour decupler sa force' },
    { id: 'ts_chae_in_3', name: 'Lame de l\'Harmonie', power: 300, cdMax: 3, manaCost: 42, healSelf: 15, desc: 'Sabre elegant qui tranche et guerit par l\'harmonie' },
  ],
  h_frieren: [
    { id: 'ts_frieren_1', name: 'Zoltraak Supreme', power: 400, cdMax: 5, manaCost: 58, desc: 'La version ultime du sort de destruction' },
    { id: 'ts_frieren_2', name: 'Magie Millenaire', power: 300, cdMax: 3, manaCost: 44, debuffDef: 40, debuffDur: 2, desc: 'Sort ancien qui dissout toute defense' },
    { id: 'ts_frieren_3', name: 'Barrier Magique', power: 0, cdMax: 4, manaCost: 45, buffDef: 80, buffDur: 3, desc: 'Barriere magique quasi impenetrable' },
  ],
  h_alicia: [
    { id: 'ts_alicia_1', name: 'Zero Absolu', power: 380, cdMax: 5, manaCost: 52, desc: 'Gele tout a la temperature du zero absolu' },
    { id: 'ts_alicia_2', name: 'Lame de Diamant', power: 300, cdMax: 3, manaCost: 42, desc: 'Lame de glace cristallisee comme un diamant' },
    { id: 'ts_alicia_3', name: 'Tempete de Grele', power: 260, cdMax: 3, manaCost: 40, debuffDef: 30, debuffDur: 2, desc: 'Pluie de grele qui brise les defenses' },
  ],
  h_meri: [
    { id: 'ts_meri_1', name: 'Maree Guerisseuse', power: 0, cdMax: 4, manaCost: 52, healSelf: 45, desc: 'Vague de guerison d\'une puissance supreme' },
    { id: 'ts_meri_2', name: 'Hymne Aquatique', power: 0, cdMax: 4, manaCost: 48, buffAtk: 55, buffDef: 30, buffDur: 3, desc: 'Chant qui renforce toutes les capacites' },
    { id: 'ts_meri_3', name: 'Tsunami Purificateur', power: 280, cdMax: 4, manaCost: 44, healSelf: 20, desc: 'Vague purificatrice qui blesse et guerit' },
  ],
  h_shuhua: [
    { id: 'ts_shuhua_1', name: 'Poing du Tsunami', power: 350, cdMax: 4, manaCost: 48, desc: 'Poing charge de la force des marees' },
    { id: 'ts_shuhua_2', name: 'Vague Protectrice II', power: 0, cdMax: 4, manaCost: 45, buffDef: 80, buffDur: 3, desc: 'Version amelioree de sa defense aquatique' },
    { id: 'ts_shuhua_3', name: 'Torrent Devastateur', power: 300, cdMax: 3, manaCost: 42, buffAtk: 25, buffDur: 2, desc: 'Se laisse porter par le courant pour frapper' },
  ],
  h_meilin: [
    { id: 'ts_meilin_1', name: 'Source de Vie Eternelle', power: 0, cdMax: 5, manaCost: 55, healSelf: 50, desc: 'Soin ultime puise dans les profondeurs' },
    { id: 'ts_meilin_2', name: 'Bain Revigorant', power: 0, cdMax: 4, manaCost: 48, healSelf: 30, buffDef: 50, buffDur: 3, desc: 'Regenere et renforce simultanement' },
    { id: 'ts_meilin_3', name: 'Rosee Matinale', power: 220, cdMax: 3, manaCost: 38, healSelf: 25, desc: 'Gouttes d\'eau qui guerissent et blessent' },
  ],
  h_seo: [
    { id: 'ts_seo_1', name: 'Glacier Indestructible', power: 0, cdMax: 5, manaCost: 55, buffDef: 150, buffDur: 3, desc: 'Se transforme en glacier impenetrable' },
    { id: 'ts_seo_2', name: 'Maree Regeneratrice', power: 0, cdMax: 5, manaCost: 52, healSelf: 45, buffDef: 40, buffDur: 2, desc: 'Vague de soin et de protection' },
    { id: 'ts_seo_3', name: 'Brise-Glace', power: 300, cdMax: 4, manaCost: 45, desc: 'Charge devastatrice a travers la glace' },
  ],
  h_anna: [
    { id: 'ts_anna_1', name: 'Fleche du Destin', power: 380, cdMax: 4, manaCost: 50, desc: 'Fleche de glace qui ne rate jamais sa cible' },
    { id: 'ts_anna_2', name: 'Pluie Glaciale', power: 280, cdMax: 3, manaCost: 40, debuffDef: 30, debuffDur: 2, desc: 'Pluie de fleches qui gele et affaiblit' },
    { id: 'ts_anna_3', name: 'Tir Perforation', power: 320, cdMax: 3, manaCost: 44, desc: 'Tir qui traverse toutes les defenses' },
  ],
  h_han_song: [
    { id: 'ts_han_song_1', name: 'Lame Torrentielle', power: 360, cdMax: 4, manaCost: 48, desc: 'Lame d\'eau concentree a haute pression' },
    { id: 'ts_han_song_2', name: 'Danse de la Mort', power: 280, cdMax: 2, manaCost: 36, buffAtk: 35, buffDur: 2, desc: 'Enchainement mortel + boost de puissance' },
    { id: 'ts_han_song_3', name: 'Vortex Aquatique', power: 300, cdMax: 3, manaCost: 42, debuffDef: 25, debuffDur: 2, desc: 'Tourbillon d\'eau qui aspire et broie' },
  ],
  h_seorin: [
    { id: 'ts_seorin_1', name: 'Tir du Crepuscule', power: 320, cdMax: 4, manaCost: 44, desc: 'Fleche tiree au moment parfait' },
    { id: 'ts_seorin_2', name: 'Embuscade Glaciale', power: 260, cdMax: 2, manaCost: 34, buffAtk: 35, buffDur: 2, desc: 'Attaque surprise depuis les ombres glacees' },
    { id: 'ts_seorin_3', name: 'Fleche Empoisonnee', power: 280, cdMax: 3, manaCost: 40, debuffDef: 30, debuffDur: 2, desc: 'Fleche enduite de venin glacial' },
  ],
  h_lee_johee: [
    { id: 'ts_lee_johee_1', name: 'Lumiere Divine', power: 0, cdMax: 4, manaCost: 50, healSelf: 45, desc: 'Lumiere de guerison d\'une purete absolue' },
    { id: 'ts_lee_johee_2', name: 'Benediction Celeste', power: 0, cdMax: 4, manaCost: 48, healSelf: 25, buffDef: 60, buffDur: 3, desc: 'Benediction qui protege et soigne' },
    { id: 'ts_lee_johee_3', name: 'Rayon Sacre', power: 260, cdMax: 3, manaCost: 40, healSelf: 20, desc: 'Rayon de lumiere qui blesse et guerit' },
  ],
  h_nam: [
    { id: 'ts_nam_1', name: 'Rafale du Chasseur', power: 330, cdMax: 3, manaCost: 42, desc: 'Volee de fleches a une vitesse extreme' },
    { id: 'ts_nam_2', name: 'Piege Aquatique', power: 260, cdMax: 3, manaCost: 38, debuffDef: 35, debuffDur: 2, desc: 'Piege d\'eau qui immobilise et affaiblit' },
    { id: 'ts_nam_3', name: 'Tir de Suppression', power: 280, cdMax: 2, manaCost: 35, desc: 'Tir rapide pour maintenir la pression' },
  ],

  // ─── HUNTERS — SHADOW (12) ─────────────────────────────────

  h_ilhwan: [
    { id: 'ts_ilhwan_1', name: 'Lame de l\'Extinction', power: 400, cdMax: 5, manaCost: 55, desc: 'Coup d\'epee qui efface l\'existence' },
    { id: 'ts_ilhwan_2', name: 'Danse Macabre', power: 300, cdMax: 3, manaCost: 42, buffAtk: 35, buffDur: 2, desc: 'Danse mortelle qui booste chaque frappe' },
    { id: 'ts_ilhwan_3', name: 'Ombre Tranchante', power: 340, cdMax: 3, manaCost: 45, desc: 'L\'ombre elle-meme devient une lame' },
  ],
  h_minnie: [
    { id: 'ts_minnie_1', name: 'Assassinat Parfait', power: 380, cdMax: 4, manaCost: 50, desc: 'Frappe invisible d\'une precision absolue' },
    { id: 'ts_minnie_2', name: 'Poison des Tenebres', power: 280, cdMax: 3, manaCost: 40, debuffDef: 40, debuffDur: 2, desc: 'Empoisonne et brise les defenses' },
    { id: 'ts_minnie_3', name: 'Substitution', power: 250, cdMax: 2, manaCost: 34, buffAtk: 30, buffDur: 2, desc: 'Esquive et contre-attaque instantanee' },
  ],
  h_silverbaek: [
    { id: 'ts_silverbaek_1', name: 'Rugissement Supreme', power: 360, cdMax: 4, manaCost: 50, buffAtk: 30, buffDur: 2, desc: 'Rugissement bestial qui decuple sa force' },
    { id: 'ts_silverbaek_2', name: 'Griffes d\'Argent II', power: 320, cdMax: 3, manaCost: 44, desc: 'Griffes polies comme de l\'argent pur' },
    { id: 'ts_silverbaek_3', name: 'Instinct Bestial', power: 280, cdMax: 3, manaCost: 42, buffAtk: 40, buffDef: 20, buffDur: 3, desc: 'L\'instinct animal prend le dessus' },
  ],
  h_sian: [
    { id: 'ts_sian_1', name: 'Poing de l\'Enfer', power: 370, cdMax: 4, manaCost: 48, desc: 'Frappe chargee de rage pure' },
    { id: 'ts_sian_2', name: 'Combo Infini', power: 260, cdMax: 2, manaCost: 34, buffAtk: 30, buffDur: 2, desc: 'Enchainement sans fin de coups' },
    { id: 'ts_sian_3', name: 'Rage Sanguinaire', power: 0, cdMax: 4, manaCost: 50, buffAtk: 80, buffDur: 3, desc: 'Entre dans une rage incontrôlable' },
  ],
  h_charlotte: [
    { id: 'ts_charlotte_1', name: 'Nuit Eternelle', power: 350, cdMax: 4, manaCost: 48, debuffDef: 35, debuffDur: 2, desc: 'Plonge le monde dans les tenebres' },
    { id: 'ts_charlotte_2', name: 'Malediction Supreme', power: 280, cdMax: 3, manaCost: 42, debuffDef: 45, debuffDur: 3, desc: 'Malediction devastatrice sur l\'ennemi' },
    { id: 'ts_charlotte_3', name: 'Cauchemar Vivant', power: 320, cdMax: 4, manaCost: 45, desc: 'Materialise les pires cauchemars' },
  ],
  h_lee_bora: [
    { id: 'ts_lee_bora_1', name: 'Explosion du Neant', power: 360, cdMax: 4, manaCost: 50, desc: 'Explosion d\'energie sombre concentree' },
    { id: 'ts_lee_bora_2', name: 'Drain d\'Ame', power: 280, cdMax: 3, manaCost: 42, debuffDef: 40, debuffDur: 2, healSelf: 15, desc: 'Absorbe l\'ame de l\'adversaire' },
    { id: 'ts_lee_bora_3', name: 'Orbe Maudit', power: 300, cdMax: 3, manaCost: 44, debuffDef: 30, debuffDur: 2, desc: 'Lance un orbe qui corrompt tout' },
  ],
  h_harper: [
    { id: 'ts_harper_1', name: 'Rempart des Tenebres', power: 0, cdMax: 5, manaCost: 55, buffDef: 140, buffDur: 3, desc: 'Mur d\'ombre infranchissable' },
    { id: 'ts_harper_2', name: 'Absorption Abyssale', power: 0, cdMax: 5, manaCost: 52, healSelf: 45, desc: 'Absorbe l\'energie sombre pour se guerir' },
    { id: 'ts_harper_3', name: 'Frappe du Gardien', power: 300, cdMax: 4, manaCost: 45, buffDef: 50, buffDur: 2, desc: 'Frappe puissante suivie d\'une garde' },
  ],
  h_lim: [
    { id: 'ts_lim_1', name: 'Devastation', power: 350, cdMax: 4, manaCost: 48, desc: 'Frappe d\'une puissance devastatrice' },
    { id: 'ts_lim_2', name: 'Poing Brise-Garde', power: 300, cdMax: 3, manaCost: 42, debuffDef: 35, debuffDur: 2, desc: 'Brise toute garde et defense' },
    { id: 'ts_lim_3', name: 'Force Obscure', power: 260, cdMax: 3, manaCost: 40, buffAtk: 45, buffDur: 3, desc: 'Puise dans les tenebres pour se renforcer' },
  ],
  h_kang: [
    { id: 'ts_kang_1', name: 'Coup Fatal', power: 380, cdMax: 4, manaCost: 50, desc: 'Frappe calculee pour tuer' },
    { id: 'ts_kang_2', name: 'Lame Empoisonnee', power: 280, cdMax: 3, manaCost: 40, debuffDef: 35, debuffDur: 2, desc: 'Lame enduite de poison mortel' },
    { id: 'ts_kang_3', name: 'Ombre Meurtriere', power: 320, cdMax: 3, manaCost: 44, buffAtk: 25, buffDur: 2, desc: 'Disparait dans l\'ombre pour frapper' },
  ],
  h_son: [
    { id: 'ts_son_1', name: 'Forteresse d\'Ombre', power: 0, cdMax: 5, manaCost: 55, buffDef: 130, buffDur: 3, desc: 'Forteresse de tenebres impenetrable' },
    { id: 'ts_son_2', name: 'Regeneration Sombre', power: 0, cdMax: 5, manaCost: 52, healSelf: 42, buffDef: 30, buffDur: 2, desc: 'Guerison par l\'energie sombre' },
    { id: 'ts_son_3', name: 'Riposte du Bastion', power: 280, cdMax: 4, manaCost: 44, buffDef: 50, buffDur: 2, desc: 'Contre-attaque puissante du defenseur' },
  ],
  h_isla: [
    { id: 'ts_isla_1', name: 'Lumiere des Ombres', power: 0, cdMax: 4, manaCost: 50, healSelf: 42, desc: 'Lumiere paradoxale qui guerit dans l\'ombre' },
    { id: 'ts_isla_2', name: 'Voile de Protection', power: 0, cdMax: 4, manaCost: 48, buffDef: 80, buffDur: 3, healSelf: 15, desc: 'Voile sombre protecteur et regenerant' },
    { id: 'ts_isla_3', name: 'Rayon Obscur', power: 260, cdMax: 3, manaCost: 40, healSelf: 20, desc: 'Rayon noir qui blesse et guerit' },
  ],
  h_hwang: [
    { id: 'ts_hwang_1', name: 'Bastion Indestructible', power: 0, cdMax: 5, manaCost: 52, buffDef: 120, buffDur: 3, desc: 'Garde parfaite et impenetrable' },
    { id: 'ts_hwang_2', name: 'Dernier Rempart', power: 0, cdMax: 5, manaCost: 50, healSelf: 38, buffDef: 40, buffDur: 2, desc: 'Se protege et se soigne en dernier recours' },
    { id: 'ts_hwang_3', name: 'Charge Brutale', power: 290, cdMax: 4, manaCost: 44, desc: 'Charge du bouclier avec une force brute' },
  ],

  // ─── HUNTERS — NIER AUTOMATA (3) ───────────────────────────

  h_2b: [
    { id: 'ts_2b_1', name: 'Mode Decisive', power: 400, cdMax: 5, manaCost: 58, desc: 'Activation du mode de combat ultime' },
    { id: 'ts_2b_2', name: 'Programme C320', power: 300, cdMax: 3, manaCost: 42, debuffDef: 35, debuffDur: 2, desc: 'Attaque hack du systeme de defense' },
    { id: 'ts_2b_3', name: 'Combo Vertueux', power: 280, cdMax: 2, manaCost: 36, buffAtk: 30, buffDur: 2, desc: 'Enchainement fluide d\'epee et pod' },
  ],
  h_pascal: [
    { id: 'ts_pascal_1', name: 'Protocole d\'Amour', power: 0, cdMax: 4, manaCost: 52, healSelf: 48, desc: 'L\'amour des machines transcende la guerison' },
    { id: 'ts_pascal_2', name: 'Bouclier des Souvenirs', power: 0, cdMax: 4, manaCost: 48, buffDef: 90, buffDur: 3, desc: 'Les souvenirs forment un bouclier indestructible' },
    { id: 'ts_pascal_3', name: 'Resolution Pacifiste', power: 260, cdMax: 3, manaCost: 42, healSelf: 20, buffDef: 30, buffDur: 2, desc: 'Combat par amour, pas par haine' },
  ],
  h_a2: [
    { id: 'ts_a2_1', name: 'Berserk Final', power: 420, cdMax: 5, manaCost: 60, desc: 'Mode berserk pousse au maximum absolu' },
    { id: 'ts_a2_2', name: 'Lame de Revanche', power: 340, cdMax: 3, manaCost: 45, buffAtk: 35, buffDur: 2, desc: 'La vengeance aiguise la lame' },
    { id: 'ts_a2_3', name: 'Rage de la Prototypee', power: 300, cdMax: 3, manaCost: 42, debuffDef: 30, debuffDur: 2, desc: 'La fureur du prototype originel' },
  ],
  h_a9: [
    { id: 'ts_a9_1', name: 'Protocole Zero', power: 440, cdMax: 5, manaCost: 62, desc: 'Execution terminale — puissance maximale sur cible affaiblie' },
    { id: 'ts_a9_2', name: 'Lame Spectrale', power: 320, cdMax: 3, manaCost: 42, buffAtk: 35, buffDur: 2, desc: 'Frappe invisible qui amplifie les suivantes' },
    { id: 'ts_a9_3', name: 'Dissimulation Fatale', power: 280, cdMax: 2, manaCost: 36, debuffDef: 35, debuffDur: 2, desc: 'Apparait dans l\'angle mort et brise les defenses' },
  ],

  // ─── HUNTERS — JUJUTSU KAISEN ───────────────────────────────────

  h_sukuna: [
    { id: 'ts_sukuna_1', name: 'Domain Expansion', power: 480, cdMax: 5, manaCost: 65, buffSpd: 40, buffDur: 3, desc: 'Malevolent Shrine — domaine qui tranche tout a une vitesse inhumaine' },
    { id: 'ts_sukuna_2', name: 'Fleche du Monde', power: 350, cdMax: 3, manaCost: 45, debuffDef: 30, debuffDur: 2, desc: 'Cleave invisible qui ignore les defenses — plus rapide que l\'oeil' },
    { id: 'ts_sukuna_3', name: 'Flammes Maudites', power: 300, cdMax: 2, manaCost: 38, buffSpd: 20, buffDur: 2, debuffDef: 15, debuffDur: 2, desc: 'Flammes de malediction — brule et accelere a chaque frappe' },
  ],

  h_gojo: [
    { id: 'ts_gojo_1', name: 'Unlimited Void', power: 450, cdMax: 5, manaCost: 70, debuffDef: 35, debuffDur: 3, desc: 'Domaine Illimite — paralyse l\'ennemi dans un flux infini d\'informations' },
    { id: 'ts_gojo_2', name: 'Hollow Purple', power: 400, cdMax: 4, manaCost: 55, buffAtk: 35, buffDur: 2, desc: 'Fusion de Blue et Red — technique secrete qui efface tout sur son passage' },
    { id: 'ts_gojo_3', name: 'Six Eyes: Amplify', power: 280, cdMax: 2, manaCost: 35, buffAtk: 20, buffDur: 3, buffSpd: 15, buffDur: 3, desc: 'Les Six Yeux amplifient toute technique — perception absolue du flux d\'energie' },
  ],

  // ─── HUNTERS — BERSERK ──────────────────────────────────────────

  h_guts: [
    { id: 'ts_guts_1', name: 'Eclipse Survivor', power: 500, cdMax: 5, manaCost: 68, selfDamage: 25, desc: 'La rage de l\'Eclipse — puissance absolue au prix de son propre corps' },
    { id: 'ts_guts_2', name: 'Brand of Sacrifice', power: 360, cdMax: 3, manaCost: 48, buffAtk: 45, buffDur: 3, desc: 'La Marque du Sacrifice decuple la rage et la puissance' },
    { id: 'ts_guts_3', name: 'Rage du Black Swordsman', power: 320, cdMax: 2, manaCost: 40, debuffDef: 40, debuffDur: 2, selfDamage: 10, desc: 'Assaut incessant — brise tout, meme son propre corps' },
  ],

  // ─── HUNTERS — ATTACK ON TITAN ────────────────────────────────

  h_mikasa: [
    { id: 'ts_mikasa_1', name: 'Dernier Acier', power: 420, cdMax: 5, manaCost: 58, desc: 'L\'attaque ultime de la meilleure soldate — precision mortelle' },
    { id: 'ts_mikasa_2', name: 'Serment Ackerman', power: 0, cdMax: 4, manaCost: 50, healSelf: 40, buffAtk: 30, buffDur: 3, desc: 'Devotion absolue — soigne et inspire toute l\'equipe' },
    { id: 'ts_mikasa_3', name: 'Tempete de Lames', power: 340, cdMax: 3, manaCost: 44, debuffDef: 30, debuffDur: 2, desc: 'Enchainement de coupes aerien devastateur' },
  ],

  // ─── HUNTERS — TOKYO GHOUL ──────────────────────────────────────

  h_kaneki: [
    { id: 'ts_kaneki_1', name: 'Kakuja Complet', power: 500, cdMax: 5, manaCost: 65, selfDamage: 20, desc: 'Forme Kakuja complete — puissance dementielle au prix de sa raison' },
    { id: 'ts_kaneki_2', name: 'Centipede Noir', power: 380, cdMax: 3, manaCost: 48, buffAtk: 40, buffDur: 2, selfDamage: 10, desc: 'Le Mille-Pattes se reveille — rage incontrolable' },
    { id: 'ts_kaneki_3', name: 'RC Explosion', power: 320, cdMax: 2, manaCost: 38, debuffDef: 35, debuffDur: 2, desc: 'Explosion de cellules RC — desintegre les defenses' },
  ],

  // ─── HUNTERS — FATE ─────────────────────────────────────────────

  h_saber: [
    { id: 'ts_saber_1', name: 'Excalibur Morgan', power: 480, cdMax: 5, manaCost: 65, desc: 'Le Noble Phantasm corrompu — puissance devastatrice absolue' },
    { id: 'ts_saber_2', name: 'Avalon', power: 0, cdMax: 5, manaCost: 55, healSelf: 45, buffDef: 80, buffDur: 3, desc: 'Le fourreau legendaire — regeneration et protection totale' },
    { id: 'ts_saber_3', name: 'Mana Burst', power: 350, cdMax: 3, manaCost: 45, buffAtk: 40, buffDur: 2, desc: 'Explosion de mana concentree dans la lame' },
  ],

  // ─── HUNTERS — CHIBI MASCOTS ──────────────────────────────────

  h_daijin: [
    { id: 'ts_daijin_1', name: 'Catastrophe Sismique', power: 380, cdMax: 5, manaCost: 55, debuffDef: 30, debuffDur: 2, desc: 'Libere le sceau — tremblement devastateur' },
    { id: 'ts_daijin_2', name: 'Neuf Vies', power: 0, cdMax: 5, manaCost: 50, healSelf: 45, buffDef: 60, buffDur: 3, desc: 'Invoque la protection des 9 vies du chat' },
    { id: 'ts_daijin_3', name: 'Griffes du Destin', power: 340, cdMax: 3, manaCost: 44, buffAtk: 30, buffDur: 2, desc: 'Griffes chargees d\'energie dimensionnelle' },
  ],
  h_pod042: [
    { id: 'ts_pod042_1', name: 'Programme A170: Marteau', power: 360, cdMax: 4, manaCost: 50, debuffDef: 40, debuffDur: 2, desc: 'Frappe gravitationnelle lourde du Pod' },
    { id: 'ts_pod042_2', name: 'Programme R030: Barriere', power: 0, cdMax: 5, manaCost: 55, buffDef: 120, buffDur: 3, desc: 'Barriere de protection absolue pour l\'equipe' },
    { id: 'ts_pod042_3', name: 'Programme C400: Salve', power: 300, cdMax: 3, manaCost: 42, healSelf: 20, desc: 'Salve laser avec regeneration des systemes' },
  ],

  // ─── HUNTERS — STEINS;GATE ────────────────────────────────────

  h_kurisu: [
    { id: 'ts_kurisu_1', name: 'Reading Steiner', power: 380, cdMax: 4, manaCost: 52, buffAtk: 35, buffDur: 3, desc: 'Perception des lignes temporelles — boost massif' },
    { id: 'ts_kurisu_2', name: 'D-Mail Paradoxe', power: 320, cdMax: 3, manaCost: 44, debuffDef: 40, debuffDur: 2, desc: 'Altere la timeline ennemie et affaiblit ses defenses' },
    { id: 'ts_kurisu_3', name: 'Convergence Steins Gate', power: 450, cdMax: 5, manaCost: 60, desc: 'Atteint la ligne de convergence — degats ultimes' },
  ],

  // ── STEINS;GATE — Mayuri Shiina (Support Ultimate) ──
  h_mayuri: [
    { id: 'ts_mayuri_1', name: 'Tutturu Supreme', power: 0, cdMax: 4, manaCost: 50, healSelf: 45, buffDef: 40, buffDur: 3, desc: 'Soin massif et barriere protectrice pour un allie' },
    { id: 'ts_mayuri_2', name: 'Horloge du Destin', power: 0, cdMax: 6, manaCost: 75, grantExtraTurn: true, grantFreeCast: true, buffAtk: 100, buffDur: 1, desc: 'Remonte le temps pour un allie — rejoue avec ATK +100%, 0 CD, 0 mana' },
    { id: 'ts_mayuri_3', name: 'Priere de la Starlighter', power: 0, cdMax: 5, manaCost: 55, buffAtk: 50, buffDef: 30, buffDur: 3, desc: 'Benediction d\'etoile — buff ATK et DEF massif sur un allie' },
  ],

  // ─── SPECIAL — Megumin (Konosuba) ────────────────────────────

  h_megumin: [
    { id: 'ts_megumin_1', name: 'Flamme du Néant', power: 140, cdMax: 0, manaCost: 0, manaRestore: 30, buffAtk: 15, buffDur: 2, desc: 'Flamme noire qui restaure 30% de mana et booste l\'ATK' },
    { id: 'ts_megumin_2', name: 'Nova Arcanique', power: 100, cdMax: 3, manaCost: 0, manaScaling: 10, consumeHalfMana: true, debuffDef: 20, debuffDur: 2, desc: 'Mana restante ×10 = puissance ! Consomme 50% mana et brise les DEF' },
    { id: 'ts_megumin_3', name: 'MEGA EXPLOSION!!!', power: 2800, cdMax: 8, manaCost: 1200, manaThreshold: 0.9, selfDamage: 20, selfStunTurns: 3, desc: 'L\'explosion ultime ! 2800% mais s\'inflige 20% PV et stun 3 tours' },
  ],

};
